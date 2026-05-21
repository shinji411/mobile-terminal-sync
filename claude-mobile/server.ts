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

type ClientData = { authed: boolean; sessionId: string | null }
const clients = new Set<ServerWebSocket<ClientData>>()
let seq = 0
let isProcessing = false

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
  if (isProcessing) {
    broadcastToSession(sessionId, { type: 'error', text: 'Claude is still thinking...' })
    return
  }

  const session = getSession(sessionId)
  if (!session) return

  isProcessing = true
  broadcastToSession(sessionId, { type: 'status', status: 'thinking' })

  const args = ['-p', '--output-format=stream-json', '--verbose']
  if (session.claudeSessionId) {
    args.push('--resume', session.claudeSessionId)
  }

  const proc = spawn({
    cmd: ['claude', ...args],
    cwd: WORK_DIR,
    stdin: new Response(text),
    stdout: 'pipe',
    stderr: 'pipe',
  })

  const reader = proc.stdout.getReader()
  const decoder = new TextDecoder()
  let buffer = ''
  let assistantMsgId: string | null = null

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split('\n')
    buffer = lines.pop() || ''

    for (const line of lines) {
      if (!line.trim()) continue
      try {
        const data = JSON.parse(line.trim())

        if (data.type === 'system' && data.session_id) {
          updateSession(sessionId, { claudeSessionId: data.session_id })
        }

        if (data.type === 'assistant') {
          const content = data.message?.content
          if (!content) continue
          let t = ''
          for (const block of content) {
            if (block.type === 'text') t += block.text
          }
          if (!t) continue

          if (!assistantMsgId) {
            assistantMsgId = nextId()
            const msg: Message = { id: assistantMsgId, from: 'assistant', text: t, ts: Date.now(), sessionId }
            saveMessage(msg)
            broadcastToSession(sessionId, { type: 'msg', ...msg })
          } else {
            broadcastToSession(sessionId, { type: 'edit', id: assistantMsgId, text: t })
          }
        }

        if (data.type === 'result' && data.result) {
          if (assistantMsgId) {
            const msg: Message = { id: assistantMsgId, from: 'assistant', text: data.result, ts: Date.now(), sessionId }
            saveMessage(msg)
            broadcastToSession(sessionId, { type: 'edit', id: assistantMsgId, text: data.result })
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
  isProcessing = false
  broadcastToSession(sessionId, { type: 'status', status: 'idle' })
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
        const body = await req.json() as Partial<Session>
        const session = updateSession(id, body)
        if (!session) return json({ error: 'not found' }, 404)
        return json(session)
      })()
    }

    if (url.pathname.startsWith('/api/sessions/') && req.method === 'DELETE') {
      const id = url.pathname.split('/')[3]
      deleteSession(id)
      return json({ ok: true })
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
          ws.send(JSON.stringify({ type: 'status', status: 'idle' }))
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
