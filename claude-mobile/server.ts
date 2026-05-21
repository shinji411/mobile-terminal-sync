#!/usr/bin/env bun
/**
 * Claude Mobile — Mobile-optimized chat UI for Claude Code.
 *
 * MCP channel server that provides a claude.ai-like interface
 * accessible from iPhone via Tailscale.
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import {
  ListToolsRequestSchema,
  CallToolRequestSchema,
} from '@modelcontextprotocol/sdk/types.js'
import { mkdirSync } from 'fs'
import { homedir } from 'os'
import { join } from 'path'
import type { ServerWebSocket } from 'bun'

import { getOrCreateToken, validateToken } from './auth'
import { saveMessage, getHistory, type Message } from './db'
import { HTML, MANIFEST } from './ui'

const PORT = Number(process.env.CLAUDE_MOBILE_PORT ?? 3210)
const HOST = process.env.CLAUDE_MOBILE_HOST ?? '0.0.0.0'
const TOKEN = getOrCreateToken()

const clients = new Set<ServerWebSocket<{ authed: boolean }>>()
let seq = 0

function nextId() {
  return `a${Date.now()}-${++seq}`
}

function broadcast(data: object) {
  const json = JSON.stringify(data)
  for (const ws of clients) {
    if (ws.readyState === 1 && ws.data.authed) ws.send(json)
  }
}

// --- MCP Server ---

const mcp = new Server(
  { name: 'claude-mobile', version: '0.1.0' },
  {
    capabilities: { tools: {}, experimental: { 'claude/channel': {} } },
    instructions: `The user is reading from the Claude Mobile chat UI on their phone, not this terminal session. Anything you want them to see MUST go through the reply tool — your normal transcript output does not reach the mobile UI.\n\nMessages from the mobile UI arrive as <channel source="claude-mobile" chat_id="mobile" message_id="...">. Reply using the reply tool. The UI renders markdown with code highlighting, so format your responses accordingly.`,
  },
)

mcp.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: 'reply',
      description: 'Send a message to the Claude Mobile UI on the user\'s phone. Supports markdown formatting.',
      inputSchema: {
        type: 'object',
        properties: {
          text: { type: 'string', description: 'Message text (markdown supported)' },
          reply_to: { type: 'string', description: 'Message ID to reply to' },
        },
        required: ['text'],
      },
    },
    {
      name: 'edit_message',
      description: 'Edit a previously sent message in the mobile UI.',
      inputSchema: {
        type: 'object',
        properties: {
          message_id: { type: 'string' },
          text: { type: 'string' },
        },
        required: ['message_id', 'text'],
      },
    },
  ],
}))

mcp.setRequestHandler(CallToolRequestSchema, async req => {
  const args = (req.params.arguments ?? {}) as Record<string, unknown>
  try {
    switch (req.params.name) {
      case 'reply': {
        const text = args.text as string
        const replyTo = args.reply_to as string | undefined
        const id = nextId()
        const msg: Message = { id, from: 'assistant', text, ts: Date.now(), replyTo }
        saveMessage(msg)
        broadcast({ type: 'msg', ...msg })
        return { content: [{ type: 'text', text: `sent (${id})` }] }
      }
      case 'edit_message': {
        const id = args.message_id as string
        const text = args.text as string
        broadcast({ type: 'edit', id, text })
        return { content: [{ type: 'text', text: 'ok' }] }
      }
      default:
        return { content: [{ type: 'text', text: `unknown tool: ${req.params.name}` }], isError: true }
    }
  } catch (err) {
    return { content: [{ type: 'text', text: `${req.params.name}: ${err instanceof Error ? err.message : err}` }], isError: true }
  }
})

function deliver(id: string, text: string): void {
  void mcp.notification({
    method: 'notifications/claude/channel',
    params: {
      content: text,
      meta: {
        chat_id: 'mobile',
        message_id: id,
        user: 'mobile',
        ts: new Date().toISOString(),
      },
    },
  })
}

await mcp.connect(new StdioServerTransport())

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
      if (server.upgrade(req, { data: { authed: true } })) return
      return new Response('upgrade failed', { status: 400 })
    }

    if (url.pathname === '/manifest.json') {
      return new Response(MANIFEST, { headers: { 'content-type': 'application/manifest+json' } })
    }

    if (url.pathname === '/') {
      return new Response(HTML, { headers: { 'content-type': 'text/html; charset=utf-8' } })
    }

    return new Response('404', { status: 404 })
  },
  websocket: {
    open(ws: ServerWebSocket<{ authed: boolean }>) {
      clients.add(ws)
      const history = getHistory(100)
      ws.send(JSON.stringify({ type: 'history', messages: history }))
    },
    close(ws) {
      clients.delete(ws)
    },
    message(_, raw) {
      try {
        const { id, text } = JSON.parse(String(raw)) as { id: string; text: string }
        if (!id || !text?.trim()) return
        const msg: Message = { id, from: 'user', text: text.trim(), ts: Date.now() }
        saveMessage(msg)
        broadcast({ type: 'msg', ...msg })
        deliver(id, text.trim())
      } catch {}
    },
  },
})

process.stderr.write(`claude-mobile: http://${HOST}:${PORT}?token=${TOKEN}\n`)
