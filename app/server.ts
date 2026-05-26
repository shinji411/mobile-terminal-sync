#!/usr/bin/env bun
/**
 * Pocket Claude — Multi-session WebSocket bridge.
 *
 * Supports multiple named sessions, each with its own Claude Code
 * conversation context. All sessions run in /Users/eric/workspace.
 */

import { spawn } from 'bun'
import { mkdirSync, writeFileSync, existsSync, readdirSync, readFileSync, statSync, watch, realpathSync } from 'fs'
import { homedir } from 'os'
import { join, relative, extname, resolve } from 'path'
import type { ServerWebSocket } from 'bun'

import { getOrCreateToken, validateToken } from './auth'
import { saveMessage, getHistory, type Message } from './db'
import { listSessions, getSession, createSession, updateSession, deleteSession, type Session } from './sessions'
import { HTML, MANIFEST } from './ui'
import { loadConfig } from './config'

const config = loadConfig()
const PORT = Number(process.env.POCKET_CLAUDE_PORT ?? config.port)
const HOST = process.env.POCKET_CLAUDE_HOST ?? config.host
const WORK_DIR = process.env.POCKET_CLAUDE_CWD ?? config.workDir
const TOKEN = getOrCreateToken()
const CLAUDE_SESSIONS_DIR = join(homedir(), '.claude', 'sessions')
const WORK_DIR_REAL = realpathSync(WORK_DIR)

type ClientData = { authed: boolean; sessionId: string | null }
const clients = new Set<ServerWebSocket<ClientData>>()
let seq = 0

type SessionState = {
  isProcessing: boolean
  proc: ReturnType<typeof spawn> | null
  aborted: boolean
  lastProcessedAt: number
}
const sessionStates = new Map<string, SessionState>()

// --- Session file watchers (detect external changes) ---
const sessionWatchers = new Map<string, { watcher: ReturnType<typeof watch>; lastSize: number }>()

function findJsonlPath(claudeSessionId: string): string | null {
  const projectDirs = readdirSync(join(homedir(), '.claude', 'projects')).filter(d => !d.startsWith('.'))
  for (const pd of projectDirs) {
    const p = join(homedir(), '.claude', 'projects', pd, claudeSessionId + '.jsonl')
    if (existsSync(p)) return p
  }
  return null
}

function watchSession(sessionId: string) {
  const session = getSession(sessionId)
  if (!session?.claudeSessionId) return
  if (sessionWatchers.has(sessionId)) return

  const jsonlPath = findJsonlPath(session.claudeSessionId)
  if (!jsonlPath) return

  const lastSize = statSync(jsonlPath).size
  let debounceTimer: ReturnType<typeof setTimeout> | null = null

  const watcher = watch(jsonlPath, () => {
    if (debounceTimer) clearTimeout(debounceTimer)
    debounceTimer = setTimeout(() => {
      const state = getSessionState(sessionId)
      // Ignore changes from our own process or within 5s after it finishes
      if (state.isProcessing || (Date.now() - state.lastProcessedAt < 5000)) return
      try {
        const newSize = statSync(jsonlPath).size
        const entry = sessionWatchers.get(sessionId)
        if (entry && newSize > entry.lastSize) {
          entry.lastSize = newSize
          broadcastToSession(sessionId, { type: 'session_updated' })
        }
      } catch {}
    }, 800)
  })

  sessionWatchers.set(sessionId, { watcher, lastSize })
}

function unwatchSession(sessionId: string) {
  const entry = sessionWatchers.get(sessionId)
  if (entry) {
    entry.watcher.close()
    sessionWatchers.delete(sessionId)
  }
}

function getSessionState(sessionId: string): SessionState {
  if (!sessionStates.has(sessionId)) {
    sessionStates.set(sessionId, { isProcessing: false, proc: null, aborted: false, lastProcessedAt: 0 })
  }
  return sessionStates.get(sessionId)!
}

function nextId() {
  return `a${Date.now()}-${++seq}`
}

function isAuthorized(req: Request, url: URL): boolean {
  const auth = req.headers.get('authorization') || ''
  const bearer = auth.match(/^Bearer\s+(.+)$/i)?.[1]
  return bearer === TOKEN || validateToken(url, TOKEN)
}

function sanitizeSessionUpdates(body: Partial<Session>): Partial<Session> {
  const updates: Partial<Session> = {}
  if (typeof body.name === 'string') {
    updates.name = body.name.trim().slice(0, 120) || 'Untitled'
  }
  if (typeof body.model === 'string' && ['opus', 'sonnet', 'haiku'].includes(body.model)) {
    updates.model = body.model
  }
  if (typeof body.permissionMode === 'string' && ['auto', 'bypassPermissions', 'plan', 'default'].includes(body.permissionMode)) {
    updates.permissionMode = body.permissionMode
  }
  if (typeof body.claudeSessionId === 'string' && /^[A-Za-z0-9_-]+$/.test(body.claudeSessionId)) {
    updates.claudeSessionId = body.claudeSessionId
  }
  return updates
}

function scopedPath(reqPath: string): string | null {
  if (!reqPath || reqPath.startsWith('/')) reqPath = '.'
  const resolved = resolve(WORK_DIR_REAL, reqPath)
  if (!resolved.startsWith(WORK_DIR_REAL)) return null
  try {
    const real = realpathSync(resolved)
    if (!real.startsWith(WORK_DIR_REAL)) return null
    return real
  } catch {
    return resolved
  }
}

function broadcastToSession(sessionId: string, data: object) {
  const json = JSON.stringify(data)
  for (const ws of clients) {
    if (ws.readyState === 1 && ws.data.authed && ws.data.sessionId === sessionId) {
      ws.send(json)
    }
  }
}

function broadcastAll(data: object) {
  const json = JSON.stringify(data)
  for (const ws of clients) {
    if (ws.readyState === 1 && ws.data.authed) ws.send(json)
  }
}

function parseAssistantBlocks(content: any[]): string {
  let t = ''
  for (const block of content) {
    if (block.type === 'text' && block.text) {
      t += block.text
    } else if (block.type === 'tool_use') {
      t += '\n\n**' + formatToolName(block.name) + '**\n'
      const preview = extractToolPreview(block.name, JSON.stringify(block.input || {}))
      if (preview) t += '```diff\n' + preview + '\n```\n'
    }
  }
  return t
}

// --- Claude Code Invocation ---

function formatToolName(name: string): string {
  const map: Record<string, string> = {
    'Edit': '✏️ Edit File',
    'Write': '📝 Write File',
    'Read': '📖 Read File',
    'Bash': '⚡ Run Command',
    'Grep': '🔍 Search',
    'Glob': '📂 Find Files',
    'WebFetch': '🌐 Fetch URL',
    'WebSearch': '🔎 Web Search',
  }
  return map[name] || '🔧 ' + name
}

function extractToolPreview(toolName: string, input: string): string {
  try {
    const obj = JSON.parse(input)
    if (toolName === 'Bash' || toolName === 'bash') return obj.command || ''
    if (toolName === 'Edit') {
      let out = obj.file_path || ''
      if (obj.old_string && obj.new_string) {
        const oldLines = obj.old_string.split('\n').slice(0, 6)
        const newLines = obj.new_string.split('\n').slice(0, 6)
        out += '\n'
        oldLines.forEach((l: string) => out += '- ' + l + '\n')
        if (obj.old_string.split('\n').length > 6) out += '  ...\n'
        newLines.forEach((l: string) => out += '+ ' + l + '\n')
        if (obj.new_string.split('\n').length > 6) out += '  ...\n'
      }
      return out
    }
    if (toolName === 'Write') {
      let out = obj.file_path || ''
      if (obj.content) {
        const lines = obj.content.split('\n').slice(0, 8)
        out += '\n' + lines.join('\n')
        if (obj.content.split('\n').length > 8) out += '\n...'
      }
      return out
    }
    if (toolName === 'Read') return obj.file_path || obj.path || ''
    if (toolName === 'Grep') return (obj.pattern || '') + ' ' + (obj.path || '')
    if (toolName === 'Glob') return obj.pattern || ''
    return ''
  } catch {
    // Partial JSON — try to extract file_path or command
    const fileMatch = input.match(/"(?:file_path|path)"\s*:\s*"([^"]*)"?/)
    if (fileMatch) return fileMatch[1]
    const cmdMatch = input.match(/"command"\s*:\s*"([^"]*)"?/)
    if (cmdMatch) return cmdMatch[1]
    return ''
  }
}

async function sendToClaude(text: string, sessionId: string) {
  const state = getSessionState(sessionId)
  if (state.isProcessing) {
    broadcastToSession(sessionId, { type: 'error', text: 'Claude is still thinking...' })
    return
  }

  const session = getSession(sessionId)
  if (!session) return

  state.isProcessing = true
  state.aborted = false
  broadcastToSession(sessionId, { type: 'status', status: 'thinking' })

  const args = ['-p', '--output-format=stream-json', '--verbose', '--include-partial-messages']
  if (session.claudeSessionId) {
    args.push('--resume', session.claudeSessionId)
  }
  if ((session as any).model) {
    args.push('--model', (session as any).model)
  }
  if ((session as any).permissionMode) {
    args.push('--permission-mode', (session as any).permissionMode)
  }

  const proc = spawn({
    cmd: ['claude', ...args],
    cwd: WORK_DIR,
    stdin: new Response(text),
    stdout: 'pipe',
    stderr: 'pipe',
  })
  state.proc = proc

  const reader = proc.stdout.getReader()
  const decoder = new TextDecoder()
  let buffer = ''
  let assistantMsgId: string | null = null
  let fullText = ''
  let currentToolName = ''
  let currentToolInput = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    if (state.aborted) continue

    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split('\n')
    buffer = lines.pop() || ''

    for (const line of lines) {
      if (!line.trim() || state.aborted) continue
      try {
        const data = JSON.parse(line.trim())

        if (data.type === 'system' && data.session_id) {
          updateSession(sessionId, { claudeSessionId: data.session_id })
          // Show recap if present (shown when resuming a session)
          if (data.subtype === 'init' && data.content) {
            const recapId = nextId()
            const msg: Message = { id: recapId, from: 'assistant', text: '*※ ' + data.content + '*', ts: Date.now(), sessionId }
            broadcastToSession(sessionId, { type: 'msg', ...msg })
          }
        }

        // Streaming delta
        if (data.type === 'stream_event') {
          const evt = data.event
          if (evt?.type === 'content_block_start') {
            if (!assistantMsgId) {
              assistantMsgId = nextId()
              fullText = ''
              const msg: Message = { id: assistantMsgId, from: 'assistant', text: '', ts: Date.now(), sessionId }
              broadcastToSession(sessionId, { type: 'msg', ...msg })
            }
            // Track tool use blocks
            if (evt.content_block?.type === 'tool_use') {
              currentToolName = evt.content_block.name || ''
              currentToolInput = ''
              fullText += '\n\n**' + formatToolName(currentToolName) + '**\n'
              broadcastToSession(sessionId, { type: 'delta', id: assistantMsgId, text: fullText })
            }
          } else if (evt?.type === 'content_block_delta') {
            if (evt.delta?.text) {
              fullText += evt.delta.text
              broadcastToSession(sessionId, { type: 'delta', id: assistantMsgId, text: fullText })
            } else if (evt.delta?.type === 'input_json_delta' && evt.delta?.partial_json) {
              currentToolInput += evt.delta.partial_json
              // Show file path / command as it becomes available
              const fileMatch = currentToolInput.match(/"(?:file_path|path)"\s*:\s*"([^"]*)"/)
              const cmdMatch = currentToolInput.match(/"command"\s*:\s*"([^"]*)"/)
              const hint = fileMatch ? fileMatch[1] : (cmdMatch ? cmdMatch[1] : '')
              if (hint) {
                broadcastToSession(sessionId, { type: 'delta', id: assistantMsgId, text: fullText + '`' + hint + '`' })
              }
            }
          } else if (evt?.type === 'content_block_stop') {
            if (currentToolName && currentToolInput) {
              const preview = extractToolPreview(currentToolName, currentToolInput)
              if (preview) {
                fullText += '```diff\n' + preview + '\n```\n'
              }
              broadcastToSession(sessionId, { type: 'delta', id: assistantMsgId, text: fullText })
              currentToolName = ''
              currentToolInput = ''
            }
          }
        }

        // Complete assistant message (only use as fallback if not streaming)
        if (data.type === 'assistant' && !assistantMsgId) {
          const content = data.message?.content
          if (!content) continue
          let t = ''
          for (const block of content) {
            if (block.type === 'text') t += block.text
            else if (block.type === 'tool_use') {
              t += '\n\n**' + formatToolName(block.name) + '**\n'
              const preview = extractToolPreview(block.name, JSON.stringify(block.input || {}))
              if (preview) t += '```diff\n' + preview + '\n```\n'
            }
          }
          if (!t) continue
          fullText = t
          assistantMsgId = nextId()
          const msg: Message = { id: assistantMsgId, from: 'assistant', text: t, ts: Date.now(), sessionId }
          saveMessage(msg)
          broadcastToSession(sessionId, { type: 'msg', ...msg })
        }

        // Final result
        if (data.type === 'result' && data.result) {
          // Preserve tool use content that was built up during streaming
          const hasToolContent = fullText.includes('**') && fullText.includes('```')
          const finalText = hasToolContent ? fullText : data.result
          if (assistantMsgId) {
            const msg: Message = { id: assistantMsgId, from: 'assistant', text: finalText, ts: Date.now(), sessionId }
            saveMessage(msg)
            broadcastToSession(sessionId, { type: 'complete', id: assistantMsgId, text: finalText })
          } else {
            assistantMsgId = nextId()
            const msg: Message = { id: assistantMsgId, from: 'assistant', text: finalText, ts: Date.now(), sessionId }
            saveMessage(msg)
            broadcastToSession(sessionId, { type: 'msg', ...msg })
          }
        }
      } catch {}
    }
  }

  await proc.exited
  state.proc = null
  state.isProcessing = false
  state.lastProcessedAt = Date.now()

  // Update watcher size so our own writes don't trigger the banner
  if (session?.claudeSessionId) {
    const jsonlPath = findJsonlPath(session.claudeSessionId)
    const watchEntry = sessionWatchers.get(sessionId)
    if (jsonlPath && watchEntry) {
      try { watchEntry.lastSize = statSync(jsonlPath).size } catch {}
    }
  }

  if (state.aborted && assistantMsgId && fullText) {
    const msg: Message = { id: assistantMsgId, from: 'assistant', text: fullText + '\n\n*(interrupted)*', ts: Date.now(), sessionId }
    saveMessage(msg)
    broadcastToSession(sessionId, { type: 'complete', id: assistantMsgId, text: msg.text })
  }

  broadcastToSession(sessionId, { type: 'status', status: 'idle' })
}

function abortClaude(sessionId: string) {
  const state = getSessionState(sessionId)
  if (!state.proc || !state.isProcessing) return
  state.aborted = true
  state.proc.kill('SIGINT')
  setTimeout(() => {
    if (state.proc && !state.proc.killed) {
      state.proc.kill('SIGTERM')
    }
  }, 5000)
}

// --- HTTP + WebSocket Server ---

Bun.serve({
  port: PORT,
  hostname: HOST,
  fetch(req, server) {
    const url = new URL(req.url)

    if (url.pathname === '/ws') {
      if (!validateToken(url, TOKEN)) {
        return new Response('unauthorized', { status: 401 })
      }
      const sessionId = url.searchParams.get('session') || null
      if (server.upgrade(req, { data: { authed: true, sessionId } })) return
      return new Response('upgrade failed', { status: 400 })
    }

    if (url.pathname === '/manifest.json') {
      return new Response(MANIFEST, { headers: { 'content-type': 'application/manifest+json' } })
    }

    if (url.pathname === '/') {
      return new Response(HTML, { headers: { 'content-type': 'text/html; charset=utf-8' } })
    }

    // --- REST API for session management ---
    const json = (data: any, status = 200) =>
      new Response(JSON.stringify(data), { status, headers: { 'content-type': 'application/json' } })

    if (url.pathname.startsWith('/api/') && !isAuthorized(req, url)) {
      return json({ error: 'unauthorized' }, 401)
    }

    if (url.pathname === '/api/sessions' && req.method === 'GET') {
      return json(listSessions())
    }

    if (url.pathname === '/api/sessions' && req.method === 'POST') {
      return (async () => {
        const body = await req.json() as { name?: string }
        const name = body.name || `Chat ${new Date().toLocaleString()}`
        const session = createSession(name, config.defaultModel, config.defaultPermissionMode)
        return json(session)
      })()
    }

    if (url.pathname.startsWith('/api/sessions/') && req.method === 'PATCH') {
      return (async () => {
        const id = url.pathname.split('/')[3]
        const body = await req.json() as Partial<Session> & { claudeSessionId?: string }
        const updates = sanitizeSessionUpdates(body)
        const session = updateSession(id, updates)
        if (!session) return json({ error: 'not found' }, 404)

        // If setting claudeSessionId (resume), load history from JSONL
        if (updates.claudeSessionId) {
          const projectDirs = readdirSync(join(homedir(), '.claude', 'projects')).filter(d => !d.startsWith('.'))
          for (const pd of projectDirs) {
            const jsonlPath = join(homedir(), '.claude', 'projects', pd, updates.claudeSessionId + '.jsonl')
            if (existsSync(jsonlPath)) {
              const content = readFileSync(jsonlPath, 'utf-8')
              const lines = content.split('\n').filter(l => l.trim())
              let msgSeq = 0
              for (const line of lines) {
                try {
                  const entry = JSON.parse(line)
                  if (entry.type === 'user' && entry.message?.role === 'user') {
                    const c = entry.message.content
                    if (typeof c === 'string' && !c.startsWith('<')) {
                      msgSeq++
                      const msg: Message = {
                        id: `${id}-hist-u-${msgSeq}`,
                        from: 'user',
                        text: c,
                        ts: entry.timestamp ? new Date(entry.timestamp).getTime() : Date.now() - (10000 - msgSeq),
                        sessionId: id,
                      }
                      saveMessage(msg)
                    }
                  } else if (entry.type === 'assistant') {
                    const blocks = entry.message?.content
                    if (Array.isArray(blocks)) {
                      const t = parseAssistantBlocks(blocks)
                      if (t) {
                        msgSeq++
                        const msg: Message = {
                          id: `${id}-hist-a-${msgSeq}`,
                          from: 'assistant',
                          text: t,
                          ts: entry.timestamp ? new Date(entry.timestamp).getTime() : Date.now() - (10000 - msgSeq),
                          sessionId: id,
                        }
                        saveMessage(msg)
                      }
                    }
                  }
                } catch {}
              }
              break
            }
          }
        }

        return json(session)
      })()
    }

    if (url.pathname.startsWith('/api/sessions/') && req.method === 'DELETE') {
      const id = url.pathname.split('/')[3]
      deleteSession(id)
      return json({ ok: true })
    }

    // --- Claude Code Recent Sessions (for resume) ---
    if (url.pathname === '/api/claude-sessions') {
      try {
        const files = readdirSync(CLAUDE_SESSIONS_DIR).filter(f => f.endsWith('.json'))
        const sessions = files.map(f => {
          try {
            const data = JSON.parse(readFileSync(join(CLAUDE_SESSIONS_DIR, f), 'utf-8'))
            const sid = data.sessionId
            // Find JSONL conversation file
            const projectDirs = readdirSync(join(homedir(), '.claude', 'projects')).filter(d => !d.startsWith('.'))
            let firstMsg = ''
            let lastMsg = ''
            let msgCount = 0
            let lastMsgAt = 0
            for (const pd of projectDirs) {
              const jsonlPath = join(homedir(), '.claude', 'projects', pd, sid + '.jsonl')
              if (existsSync(jsonlPath)) {
                const content = readFileSync(jsonlPath, 'utf-8')
                const lines = content.split('\n').filter(l => l.trim())
                for (const line of lines) {
                  try {
                    const entry = JSON.parse(line)
                    if (entry.type === 'user' && entry.message?.role === 'user') {
                      const c = entry.message.content
                      if (typeof c === 'string' && !c.startsWith('<')) {
                        msgCount++
                        if (!firstMsg) firstMsg = c.slice(0, 80)
                        lastMsg = c.slice(0, 100)
                        if (entry.timestamp) lastMsgAt = new Date(entry.timestamp).getTime()
                      }
                    }
                  } catch {}
                }
                break
              }
            }
            return {
              sessionId: sid,
              cwd: data.cwd,
              startedAt: data.startedAt,
              updatedAt: data.updatedAt || data.startedAt,
              lastMessageAt: lastMsgAt || data.updatedAt || data.startedAt,
              status: data.status,
              kind: data.kind,
              firstMessage: firstMsg,
              lastMessage: lastMsg,
              messageCount: msgCount,
            }
          } catch { return null }
        }).filter(Boolean).filter((s: any) => s.messageCount > 0).sort((a: any, b: any) => (b.lastMessageAt || b.updatedAt || b.startedAt) - (a.lastMessageAt || a.updatedAt || a.startedAt)).slice(0, 20)
        return json(sessions)
      } catch {
        return json([])
      }
    }

    // --- Session conversation context (for preview) ---
    if (url.pathname === '/api/claude-sessions/context') {
      const sid = url.searchParams.get('id') || ''
      if (!sid) return json({ error: 'missing id' }, 400)
      try {
        const projectDirs = readdirSync(join(homedir(), '.claude', 'projects')).filter(d => !d.startsWith('.'))
        let messages: { role: string; text: string }[] = []
        for (const pd of projectDirs) {
          const jsonlPath = join(homedir(), '.claude', 'projects', pd, sid + '.jsonl')
          if (existsSync(jsonlPath)) {
            const content = readFileSync(jsonlPath, 'utf-8')
            const lines = content.split('\n').filter(l => l.trim())
            for (const line of lines) {
              try {
                const entry = JSON.parse(line)
                if (entry.type === 'user' && entry.message?.role === 'user') {
                  const c = entry.message.content
                  if (typeof c === 'string' && !c.startsWith('<')) {
                    messages.push({ role: 'user', text: c.slice(0, 300) })
                  }
                } else if (entry.type === 'assistant') {
                  const content = entry.message?.content
                  if (Array.isArray(content)) {
                    for (const block of content) {
                      if (block.type === 'text') {
                        messages.push({ role: 'assistant', text: block.text.slice(0, 300) })
                        break
                      }
                    }
                  }
                }
              } catch {}
            }
            break
          }
        }
        // Return last 30 messages as context preview
        return json({ messages: messages.slice(-30) })
      } catch {
        return json({ messages: [] })
      }
    }

    // --- Recap a session (get AI summary) ---
    if (url.pathname === '/api/claude-sessions/recap') {
      const sid = url.searchParams.get('id') || ''
      if (!sid) return json({ error: 'missing id' }, 400)
      return (async () => {
        try {
          const proc = spawn({
            cmd: ['claude', '-p', '--resume', sid, '--output-format=stream-json', '--verbose', '--model', 'haiku'],
            cwd: WORK_DIR,
            stdin: new Response('Give a brief recap of this conversation in 2-3 sentences. What were we working on and what was the last thing we did? Reply in the same language the user used.'),
            stdout: 'pipe',
            stderr: 'pipe',
          })
          const reader = proc.stdout.getReader()
          const decoder = new TextDecoder()
          let buffer = ''
          let result = ''
          while (true) {
            const { done, value } = await reader.read()
            if (done) break
            buffer += decoder.decode(value, { stream: true })
            const lines = buffer.split('\n')
            buffer = lines.pop() || ''
            for (const line of lines) {
              if (!line.trim()) continue
              try {
                const d = JSON.parse(line.trim())
                if (d.type === 'result' && d.result) result = d.result
              } catch {}
            }
          }
          await proc.exited
          return json({ recap: result || 'Unable to generate recap' })
        } catch (e: any) {
          return json({ recap: 'Error: ' + e.message })
        }
      })()
    }

    // --- File Browser API ---
    if (url.pathname === '/api/files') {
      const reqPath = url.searchParams.get('path') || ''
      const fullPath = scopedPath(reqPath)
      if (!fullPath) return json({ error: 'forbidden' }, 403)
      try {
        const stat = statSync(fullPath)
        if (stat.isDirectory()) {
          const entries = readdirSync(fullPath, { withFileTypes: true })
            .filter(e => !config.hiddenFiles.includes(e.name) && !e.name.startsWith('.'))
            .sort((a, b) => {
              if (a.isDirectory() && !b.isDirectory()) return -1
              if (!a.isDirectory() && b.isDirectory()) return 1
              return a.name.localeCompare(b.name)
            })
            .map(e => ({
              name: e.name,
              type: e.isDirectory() ? 'dir' : 'file',
              path: reqPath ? reqPath + '/' + e.name : e.name,
              ext: e.isFile() ? extname(e.name).slice(1) : undefined,
              size: e.isFile() ? statSync(join(fullPath, e.name)).size : undefined,
            }))
          return json({ type: 'dir', path: reqPath, entries })
        } else {
          const MAX_SIZE = config.maxFileSize
          if (stat.size > MAX_SIZE) {
            return json({ type: 'file', path: reqPath, tooLarge: true, size: stat.size })
          }
          const content = readFileSync(fullPath, 'utf-8')
          const ext = extname(fullPath).slice(1)
          return json({ type: 'file', path: reqPath, content, ext, size: stat.size })
        }
      } catch (e: any) {
        return json({ error: e.message }, 404)
      }
    }

    return new Response('404', { status: 404 })
  },
  websocket: {
    open(ws: ServerWebSocket<ClientData>) {
      clients.add(ws)
      if (ws.data.sessionId) {
        const history = getHistory(ws.data.sessionId, 100)
        ws.send(JSON.stringify({ type: 'history', messages: history }))
        watchSession(ws.data.sessionId)
      }
      ws.send(JSON.stringify({ type: 'status', status: 'idle' }))
    },
    close(ws) {
      clients.delete(ws)
      // Unwatch if no more clients on this session
      if (ws.data.sessionId) {
        const hasClients = [...clients].some(c => c.data.sessionId === ws.data.sessionId)
        if (!hasClients) unwatchSession(ws.data.sessionId)
      }
    },
    message(ws, raw) {
      try {
        const data = JSON.parse(String(raw)) as any

        // Switch session
        if (data.type === 'switch_session') {
          const oldSessionId = ws.data.sessionId
          ws.data.sessionId = data.sessionId
          const history = getHistory(data.sessionId, 100)
          ws.send(JSON.stringify({ type: 'history', messages: history }))
          ws.send(JSON.stringify({ type: 'status', status: getSessionState(data.sessionId).isProcessing ? 'thinking' : 'idle' }))
          // Manage watchers
          if (oldSessionId && oldSessionId !== data.sessionId) {
            const hasClients = [...clients].some(c => c.data.sessionId === oldSessionId)
            if (!hasClients) unwatchSession(oldSessionId)
          }
          watchSession(data.sessionId)
          return
        }

        // Abort
        if (data.type === 'abort') {
          if (ws.data.sessionId) abortClaude(ws.data.sessionId)
          return
        }

        // Reload session from JSONL (after external update)
        if (data.type === 'reload_session') {
          const sessionId = data.sessionId
          if (!sessionId) return
          const session = getSession(sessionId)
          if (!session?.claudeSessionId) return
          const jsonlPath = findJsonlPath(session.claudeSessionId)
          if (!jsonlPath) return
          const content = readFileSync(jsonlPath, 'utf-8')
          const lines = content.split('\n').filter(l => l.trim())
          const messages: Message[] = []
          let msgSeq = 0
          for (const line of lines) {
            try {
              const entry = JSON.parse(line)
              if (entry.type === 'user' && entry.message?.role === 'user') {
                const c = entry.message.content
                if (typeof c === 'string' && !c.startsWith('<')) {
                  msgSeq++
                  messages.push({ id: `${sessionId}-reload-u-${msgSeq}`, from: 'user', text: c, ts: entry.timestamp ? new Date(entry.timestamp).getTime() : Date.now(), sessionId })
                }
              } else if (entry.type === 'assistant') {
                const blocks = entry.message?.content
                if (Array.isArray(blocks)) {
                  const t = parseAssistantBlocks(blocks)
                  if (t) {
                    msgSeq++
                    messages.push({ id: `${sessionId}-reload-a-${msgSeq}`, from: 'assistant', text: t, ts: entry.timestamp ? new Date(entry.timestamp).getTime() : Date.now(), sessionId })
                  }
                }
              }
            } catch {}
          }
          ws.send(JSON.stringify({ type: 'history', messages: messages.slice(-100) }))
          // Update watcher size
          const entry = sessionWatchers.get(sessionId)
          if (entry) entry.lastSize = statSync(jsonlPath).size
          return
        }

        // Send message
        const { id, text } = data
        if (!id || !text?.trim() || !ws.data.sessionId) return
        const msg: Message = { id, from: 'user', text: text.trim(), ts: Date.now(), sessionId: ws.data.sessionId }
        saveMessage(msg)
        broadcastToSession(ws.data.sessionId, { type: 'msg', ...msg })
        sendToClaude(text.trim(), ws.data.sessionId)
      } catch {}
    },
  },
})

process.stderr.write(`\npocket-claude v1.0.0 started\n`)
process.stderr.write(`URL: http://${HOST}:${PORT}?token=${TOKEN}\n`)
process.stderr.write(`Working directory: ${WORK_DIR}\n`)
if (config.tailscaleIp) {
  process.stderr.write(`\nOpen on iPhone: http://${config.tailscaleIp}:${PORT}?token=${TOKEN}\n`)
}
process.stderr.write(`\n`)
