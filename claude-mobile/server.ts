#!/usr/bin/env bun
/**
 * Claude Mobile Bridge — Multi-session WebSocket bridge.
 *
 * Supports multiple named sessions, each with its own Claude Code
 * conversation context. All sessions run in /Users/eric/workspace.
 */

import { spawn } from 'bun'
import { mkdirSync, writeFileSync, existsSync, readdirSync, readFileSync, statSync } from 'fs'
import { homedir } from 'os'
import { join, relative, extname } from 'path'
import type { ServerWebSocket } from 'bun'

import { getOrCreateToken, validateToken } from './auth'
import { saveMessage, getHistory, type Message } from './db'
import { listSessions, getSession, createSession, updateSession, deleteSession, type Session } from './sessions'
import { HTML, MANIFEST } from './ui'

const PORT = Number(process.env.CLAUDE_MOBILE_PORT ?? 3210)
const HOST = process.env.CLAUDE_MOBILE_HOST ?? '0.0.0.0'
const WORK_DIR = process.env.CLAUDE_MOBILE_CWD ?? homedir() + '/workspace'
const TOKEN = getOrCreateToken()
const CLAUDE_SESSIONS_DIR = join(homedir(), '.claude', 'sessions')

type ClientData = { authed: boolean; sessionId: string | null }
const clients = new Set<ServerWebSocket<ClientData>>()
let seq = 0

type SessionState = {
  isProcessing: boolean
  proc: ReturnType<typeof spawn> | null
  aborted: boolean
}
const sessionStates = new Map<string, SessionState>()

function getSessionState(sessionId: string): SessionState {
  if (!sessionStates.has(sessionId)) {
    sessionStates.set(sessionId, { isProcessing: false, proc: null, aborted: false })
  }
  return sessionStates.get(sessionId)!
}

function nextId() {
  return `a${Date.now()}-${++seq}`
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

// --- Claude Code Invocation ---

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
          } else if (evt?.type === 'content_block_delta' && evt.delta?.text) {
            fullText += evt.delta.text
            broadcastToSession(sessionId, { type: 'delta', id: assistantMsgId, text: fullText })
          }
        }

        // Complete assistant message
        if (data.type === 'assistant') {
          const content = data.message?.content
          if (!content) continue
          let t = ''
          for (const block of content) {
            if (block.type === 'text') t += block.text
          }
          if (!t) continue
          fullText = t

          if (!assistantMsgId) {
            assistantMsgId = nextId()
            const msg: Message = { id: assistantMsgId, from: 'assistant', text: t, ts: Date.now(), sessionId }
            saveMessage(msg)
            broadcastToSession(sessionId, { type: 'msg', ...msg })
          } else {
            broadcastToSession(sessionId, { type: 'delta', id: assistantMsgId, text: t })
          }
        }

        // Final result
        if (data.type === 'result' && data.result) {
          fullText = data.result
          if (assistantMsgId) {
            const msg: Message = { id: assistantMsgId, from: 'assistant', text: data.result, ts: Date.now(), sessionId }
            saveMessage(msg)
            broadcastToSession(sessionId, { type: 'complete', id: assistantMsgId, text: data.result })
          } else {
            assistantMsgId = nextId()
            const msg: Message = { id: assistantMsgId, from: 'assistant', text: data.result, ts: Date.now(), sessionId }
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

    if (url.pathname === '/api/sessions' && req.method === 'GET') {
      return json(listSessions())
    }

    if (url.pathname === '/api/sessions' && req.method === 'POST') {
      return (async () => {
        const body = await req.json() as { name?: string }
        const name = body.name || `Chat ${new Date().toLocaleString()}`
        const session = createSession(name)
        return json(session)
      })()
    }

    if (url.pathname.startsWith('/api/sessions/') && req.method === 'PATCH') {
      return (async () => {
        const id = url.pathname.split('/')[3]
        const body = await req.json() as Partial<Session> & { claudeSessionId?: string }
        const session = updateSession(id, body)
        if (!session) return json({ error: 'not found' }, 404)

        // If setting claudeSessionId (resume), load history from JSONL
        if (body.claudeSessionId) {
          const projectDirs = readdirSync(join(homedir(), '.claude', 'projects')).filter(d => !d.startsWith('.'))
          for (const pd of projectDirs) {
            const jsonlPath = join(homedir(), '.claude', 'projects', pd, body.claudeSessionId + '.jsonl')
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
                        id: `hist-u-${msgSeq}`,
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
                      for (const block of blocks) {
                        if (block.type === 'text' && block.text) {
                          msgSeq++
                          const msg: Message = {
                            id: `hist-a-${msgSeq}`,
                            from: 'assistant',
                            text: block.text,
                            ts: entry.timestamp ? new Date(entry.timestamp).getTime() : Date.now() - (10000 - msgSeq),
                            sessionId: id,
                          }
                          saveMessage(msg)
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
            let msgCount = 0
            for (const pd of projectDirs) {
              const jsonlPath = join(homedir(), '.claude', 'projects', pd, sid + '.jsonl')
              if (existsSync(jsonlPath)) {
                const content = readFileSync(jsonlPath, 'utf-8')
                const lines = content.split('\n').filter(l => l.trim())
                for (const line of lines) {
                  try {
                    const entry = JSON.parse(line)
                    if (entry.type === 'user' && entry.message?.role === 'user') {
                      msgCount++
                      if (!firstMsg) {
                        const c = entry.message.content
                        if (typeof c === 'string' && !c.startsWith('<')) {
                          firstMsg = c.slice(0, 120)
                        }
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
              status: data.status,
              kind: data.kind,
              firstMessage: firstMsg,
              messageCount: msgCount,
            }
          } catch { return null }
        }).filter(Boolean).filter((s: any) => s.messageCount > 0).sort((a: any, b: any) => b.startedAt - a.startedAt).slice(0, 20)
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
      const fullPath = join(WORK_DIR, reqPath)
      // Prevent path traversal
      if (!fullPath.startsWith(WORK_DIR)) return json({ error: 'forbidden' }, 403)
      try {
        const stat = statSync(fullPath)
        if (stat.isDirectory()) {
          const entries = readdirSync(fullPath, { withFileTypes: true })
            .filter(e => !e.name.startsWith('.') && e.name !== 'node_modules')
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
          const MAX_SIZE = 512 * 1024 // 512KB
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
      }
      ws.send(JSON.stringify({ type: 'status', status: 'idle' }))
    },
    close(ws) {
      clients.delete(ws)
    },
    message(ws, raw) {
      try {
        const data = JSON.parse(String(raw)) as any

        // Switch session
        if (data.type === 'switch_session') {
          ws.data.sessionId = data.sessionId
          const history = getHistory(data.sessionId, 100)
          ws.send(JSON.stringify({ type: 'history', messages: history }))
          ws.send(JSON.stringify({ type: 'status', status: getSessionState(data.sessionId).isProcessing ? 'thinking' : 'idle' }))
          return
        }

        // Abort
        if (data.type === 'abort') {
          if (ws.data.sessionId) abortClaude(ws.data.sessionId)
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

process.stderr.write(`\nclaude-mobile bridge started\n`)
process.stderr.write(`URL: http://${HOST}:${PORT}?token=${TOKEN}\n`)
process.stderr.write(`Working directory: ${WORK_DIR}\n`)
process.stderr.write(`\nOpen on iPhone: http://100.103.217.117:${PORT}?token=${TOKEN}\n\n`)
