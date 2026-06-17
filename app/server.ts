#!/usr/bin/env bun
/**
 * Pocket Claude — Multi-session WebSocket bridge.
 *
 * Supports multiple named sessions, each with its own Claude Code
 * conversation context. Sessions run in POCKET_CLAUDE_CWD / config.workDir,
 * or the original cwd of a resumed conversation.
 *
 * Known limitation (BUG-2, not fixed here): after an abort+crash combination,
 * the --resume rebuild may follow a stale conversation branch and roll back
 * recent context — root cause is session branching inside the claude CLI.
 */

import { spawn } from 'bun'
import { query, type Query, type SDKMessage, type SDKUserMessage, type PermissionResult } from '@anthropic-ai/claude-agent-sdk'
import { mkdirSync, writeFileSync, existsSync, readdirSync, readFileSync, statSync, watch, realpathSync } from 'fs'
import { readFile, readdir, stat as statAsync } from 'fs/promises'
import { homedir } from 'os'
import { join, relative, extname, resolve, sep } from 'path'
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

// Bind guard (P2): pocket-claude's security model is "reachable only over the
// Tailscale interface" — the launcher binds the Tailscale IP, never a wildcard.
// Binding 0.0.0.0 / :: would expose the single-token bridge to the whole LAN
// (and, behind some routers, the internet). Refuse to start on a wildcard bind
// unless explicitly forced, so a mis-set config can't silently widen exposure.
if ((HOST === '0.0.0.0' || HOST === '::') && process.env.POCKET_CLAUDE_ALLOW_WILDCARD_BIND !== '1') {
  process.stderr.write(
    `\n[refusing to start] HOST=${HOST} is a wildcard bind — this exposes pocket-claude beyond Tailscale.\n` +
    `Use the Tailscale IP (./start-windows.sh sets it), '127.0.0.1' for local testing,\n` +
    `or set POCKET_CLAUDE_ALLOW_WILDCARD_BIND=1 if you really intend a public bind.\n\n`
  )
  process.exit(1)
}
const TOKEN = getOrCreateToken()
const CLAUDE_SESSIONS_DIR = join(homedir(), '.claude', 'sessions')
const WORK_DIR_REAL = realpathSync(WORK_DIR)

type ClientData = { authed: boolean; sessionId: string | null; rateKey: string }
const clients = new Set<ServerWebSocket<ClientData>>()
let seq = 0

type SessionState = {
  isProcessing: boolean
  aborted: boolean
  lastProcessedAt: number
  queue: string[]
}
const sessionStates = new Map<string, SessionState>()

// --- Rate limiting (P2) ---
// Defense against a malicious/buggy token holder (or XSS'd phone) flooding
// messages — each message triggers a Claude->Bedrock call (billing DoS) and
// can spawn/overflow processes (resource DoS). Simple in-memory sliding
// window per connection key; no external dependency. Tuned for a single
// legitimate human user: bursts of a few messages are fine, sustained flooding
// is throttled. Also a hard cap on per-message size and concurrent active
// sessions.
const RATE_WINDOW_MS = 60 * 1000
const RATE_MAX_MSGS = 30          // messages per window per connection key
const MAX_MESSAGE_BYTES = 64 * 1024 // single user message hard cap
const MAX_ACTIVE_SESSIONS = 10    // sessions concurrently processing a turn
const rateBuckets = new Map<string, number[]>()

/** Returns true if the key is allowed to send now; records the hit if so. */
function rateLimitAllow(key: string): boolean {
  const now = Date.now()
  let hits = rateBuckets.get(key)
  if (!hits) { hits = []; rateBuckets.set(key, hits) }
  // Drop timestamps outside the window.
  while (hits.length && now - hits[0] > RATE_WINDOW_MS) hits.shift()
  if (hits.length >= RATE_MAX_MSGS) return false
  hits.push(now)
  return true
}

// Periodic GC so idle keys don't accumulate unbounded.
setInterval(() => {
  const now = Date.now()
  for (const [k, hits] of rateBuckets) {
    while (hits.length && now - hits[0] > RATE_WINDOW_MS) hits.shift()
    if (hits.length === 0) rateBuckets.delete(k)
  }
}, RATE_WINDOW_MS).unref?.()

// P1 (leak): sessionStates GC. DELETE cleans its own entry, but idle/LRU pool
// teardown intentionally keeps the session's state (queue + lastProcessedAt)
// so the next message can re-spawn and drain in order. Those states would
// still accumulate for sessions never explicitly deleted. Reclaim a state only
// when it is provably inert: not processing, empty queue, no live pool entry,
// and untouched for well past the pool idle window. Anything active or
// recently used is left alone, so this can't drop a queued turn.
const SESSION_STATE_TTL_MS = 30 * 60 * 1000
setInterval(() => {
  const now = Date.now()
  for (const [id, s] of sessionStates) {
    if (s.isProcessing || s.queue.length > 0) continue
    if (persistentProcs.has(id)) continue
    if (now - s.lastProcessedAt < SESSION_STATE_TTL_MS) continue
    sessionStates.delete(id)
  }
}, SESSION_STATE_TTL_MS).unref?.()

function activeSessionCount(): number {
  let n = 0
  for (const s of sessionStates.values()) if (s.isProcessing) n++
  return n
}

// --- Session file watchers (detect external changes) ---
const sessionWatchers = new Map<string, { watcher: ReturnType<typeof watch>; lastSize: number; debounceTimer: ReturnType<typeof setTimeout> | null }>()

function findJsonlPath(claudeSessionId: string): string | null {
  const projectDirs = readdirSync(join(homedir(), '.claude', 'projects')).filter(d => !d.startsWith('.'))
  for (const pd of projectDirs) {
    const p = join(homedir(), '.claude', 'projects', pd, claudeSessionId + '.jsonl')
    if (existsSync(p)) return p
  }
  return null
}

function cwdForClaudeSession(claudeSessionId: string): string | null {
  const p = findJsonlPath(claudeSessionId)
  if (!p) return null
  try {
    const lines = readFileSync(p, 'utf-8').split('\n')
    for (const line of lines) {
      if (!line.trim()) continue
      try {
        const entry = JSON.parse(line)
        if (entry.cwd) return entry.cwd
      } catch {}
    }
  } catch {}
  return null
}

// --- Async hot-path I/O (P1-3c) ---
// The per-request / per-message path used to block the single-threaded event
// loop with synchronous readFileSync/readdirSync/statSync. On a large jsonl or
// many project dirs that stall freezes every other HTTP/WS connection. These
// async variants are used on the message-send and resume hot paths; the sync
// versions above are kept for watcher callbacks and startup where blocking is
// acceptable.

async function findJsonlPathAsync(claudeSessionId: string): Promise<string | null> {
  let projectDirs: string[]
  try {
    projectDirs = (await readdir(join(homedir(), '.claude', 'projects'))).filter(d => !d.startsWith('.'))
  } catch { return null }
  for (const pd of projectDirs) {
    const p = join(homedir(), '.claude', 'projects', pd, claudeSessionId + '.jsonl')
    if (existsSync(p)) return p
  }
  return null
}

async function cwdForClaudeSessionAsync(claudeSessionId: string): Promise<string | null> {
  const p = await findJsonlPathAsync(claudeSessionId)
  if (!p) return null
  try {
    const lines = (await readFile(p, 'utf-8')).split('\n')
    for (const line of lines) {
      if (!line.trim()) continue
      try {
        const entry = JSON.parse(line)
        if (entry.cwd) return entry.cwd
      } catch {}
    }
  } catch {}
  return null
}

// --- Live-session busy detection (P1-3b) ---
// ~/.claude/sessions/*.json are PID-keyed records that the claude CLI writes
// for each live interactive/headless process: { pid, sessionId, status, ... }.
// We use these to detect when a claudeSessionId is currently BUSY in some
// other terminal — resuming such a session forks a second claude process onto
// the same .jsonl, which races writes and (per Tom's incident) deadlocked the
// server. We must NOT count pocket-claude's OWN pool processes as "another
// terminal": those PIDs live in persistentProcs. So we collect our own PIDs
// and exclude any live record whose pid we own.
// NOTE: with the SDK we no longer hold the underlying claude subprocess PID
// (the SDK owns it), so we can't subtract our own pool from the live-session
// scan by PID. We instead exclude sessions we know we hold by their
// claudeSessionId (tracked on each pool entry once the SDK reports it). This
// keeps the resume-busy guard from blocking our own warm sessions while still
// catching a genuinely external terminal.
function ownedClaudeSessionIds(): Set<string> {
  const ids = new Set<string>()
  for (const e of persistentProcs.values()) {
    const cid = getSession(e.sessionId)?.claudeSessionId
    if (cid) ids.add(cid)
  }
  return ids
}

// Returns the set of claudeSessionIds that are busy in a process we do NOT
// own (i.e. an external terminal). Async to keep the PATCH/send hot path off
// synchronous file I/O.
async function externallyBusyClaudeSessionIds(): Promise<Set<string>> {
  const busy = new Set<string>()
  const owned = ownedClaudeSessionIds()
  let files: string[]
  try {
    files = (await readdir(CLAUDE_SESSIONS_DIR)).filter(f => f.endsWith('.json'))
  } catch {
    return busy
  }
  for (const f of files) {
    try {
      const d = JSON.parse(await readFile(join(CLAUDE_SESSIONS_DIR, f), 'utf-8'))
      const status = d.status || 'running'
      if (!d.sessionId) continue
      // Only 'busy' is the dangerous active-write state. 'running'/'idle' live
      // processes aren't writing turn output, so resume contention is the
      // narrow case we block.
      if (status !== 'busy') continue
      // Skip sessions we ourselves hold (matched by claudeSessionId) — that's
      // not "another terminal".
      if (owned.has(d.sessionId)) continue
      busy.add(d.sessionId)
    } catch {}
  }
  return busy
}

function watchSession(sessionId: string) {
  const session = getSession(sessionId)
  if (!session?.claudeSessionId) return
  if (sessionWatchers.has(sessionId)) return

  const jsonlPath = findJsonlPath(session.claudeSessionId)
  if (!jsonlPath) return

  const lastSize = statSync(jsonlPath).size

  const watcher = watch(jsonlPath, () => {
    const cur = sessionWatchers.get(sessionId)
    if (!cur) return                     // unwatched between fire and now
    if (cur.debounceTimer) clearTimeout(cur.debounceTimer)
    cur.debounceTimer = setTimeout(() => {
      // The watcher may have been torn down during the 800ms debounce; bail if
      // so, otherwise a late timer would resurrect a removed map entry / fire a
      // stale session_updated. (P1 leak/ghost fix.)
      const entry = sessionWatchers.get(sessionId)
      if (!entry) return
      entry.debounceTimer = null
      const state = getSessionState(sessionId)
      // Ignore changes from our own process or within 5s after it finishes
      if (state.isProcessing || (Date.now() - state.lastProcessedAt < 5000)) return
      try {
        const newSize = statSync(jsonlPath).size
        if (newSize > entry.lastSize) {
          entry.lastSize = newSize
          broadcastToSession(sessionId, { type: 'session_updated' })
        }
      } catch {}
    }, 800)
  })

  sessionWatchers.set(sessionId, { watcher, lastSize, debounceTimer: null })
}

function unwatchSession(sessionId: string) {
  const entry = sessionWatchers.get(sessionId)
  if (entry) {
    if (entry.debounceTimer) clearTimeout(entry.debounceTimer)
    entry.watcher.close()
    sessionWatchers.delete(sessionId)
  }
}

function getSessionState(sessionId: string): SessionState {
  if (!sessionStates.has(sessionId)) {
    sessionStates.set(sessionId, { isProcessing: false, aborted: false, lastProcessedAt: 0, queue: [] })
  }
  return sessionStates.get(sessionId)!
}

function nextId() {
  return `a${Date.now()}-${++seq}`
}

// Kill a spawned process AND its descendants. claude.exe spawns children (node
// shim, MCP servers, agent bash) that hold their own handles — on Windows
// proc.kill() only ends the direct child, orphaning the rest. taskkill /T walks
// the tree; /F is required because orphans have no console for a soft signal.
// Used by the recap path (the only remaining raw spawn; the SDK manages its own
// subprocesses for normal turns).
function killProcTree(proc: ReturnType<typeof spawn>) {
  let treeKilled = false
  if (process.platform === 'win32' && proc.pid) {
    try {
      const r = Bun.spawnSync(['taskkill', '/T', '/F', '/PID', String(proc.pid)])
      treeKilled = r.exitCode === 0
    } catch {}
  }
  if (!treeKilled) { try { proc.kill() } catch {} }
}

function isAuthorized(req: Request, url: URL): boolean {
  const auth = req.headers.get('authorization') || ''
  const bearer = auth.match(/^Bearer\s+(.+)$/i)?.[1] || ''
  const a = Buffer.from(bearer)
  const b = Buffer.from(TOKEN)
  const bearerOk = a.length === b.length && require('crypto').timingSafeEqual(a, b)
  return bearerOk || validateToken(url, TOKEN)
}

// claudeSessionId / jsonl-name validation (P2). Same alphabet as the PATCH
// sanitizer — used by context/recap to reject any `../` path-traversal attempt
// before the id is joined into a filesystem path.
const CLAUDE_SESSION_ID_RE = /^[A-Za-z0-9_-]+$/

const ALLOWED_MODELS = ['fable', 'opus', 'sonnet', 'haiku', 'claude-opus-4-6', 'claude-sonnet-4-6']
const ALLOWED_PERMISSION_MODES = ['auto', 'plan', 'default', 'acceptEdits', 'bypassPermissions']

function sanitizeSessionUpdates(body: Partial<Session>): Partial<Session> {
  const updates: Partial<Session> = {}
  if (typeof body.name === 'string') {
    updates.name = body.name.trim().slice(0, 120) || 'Untitled'
  }
  if (typeof body.model === 'string' && ALLOWED_MODELS.includes(body.model)) {
    updates.model = body.model
  }
  if (typeof body.permissionMode === 'string' && ALLOWED_PERMISSION_MODES.includes(body.permissionMode)) {
    updates.permissionMode = body.permissionMode
  }
  if (typeof body.claudeSessionId === 'string' && /^[A-Za-z0-9_-]+$/.test(body.claudeSessionId)) {
    updates.claudeSessionId = body.claudeSessionId
  }
  return updates
}

function withinWorkDir(p: string): boolean {
  return p === WORK_DIR_REAL || p.startsWith(WORK_DIR_REAL + sep)
}

function scopedPath(reqPath: string): string | null {
  if (!reqPath || reqPath.startsWith('/')) reqPath = '.'
  const resolved = resolve(WORK_DIR_REAL, reqPath)
  if (!withinWorkDir(resolved)) return null
  try {
    const real = realpathSync(resolved)
    if (!withinWorkDir(real)) return null
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

// --- Turn parser: shared stream-json event handling ---
// One parser instance per turn. Used by BOTH the persistent path (events fed
// from a long-lived read loop) and the one-shot fallback path (events fed
// from a read-to-EOF loop). handleEvent returns true once the turn is
// complete (a `result` event was seen).

type TurnParser = {
  handleEvent: (data: any) => boolean
  finalizeInterrupted: (suffix?: string) => void
  /** True once the turn produced anything user-visible (assistant text, tool event, or result text). */
  hasOutput: () => boolean
}

// In stream-json input mode the CLI injects context markers like
// <system_warning>System: Conversation context resumed.</system_warning>
// which the model sometimes echoes verbatim. Strip them from display text.
//
// Security (P1-3a): the previous regex /<system_warning>[\s\S]*?<\/...>/g
// is catastrophic on adversarial input — N unclosed open tags make the lazy
// `[\s\S]*?` rescan to EOF from every open-tag position (O(n*m)). Vera
// measured 28.7s freeze on 100k unclosed tags, blocking the single-threaded
// event loop. Replaced with a linear indexOf scan (no backtracking) plus a
// hard input-size cap so a malicious assistant turn can never freeze the
// server. Only well-formed open+close pairs are removed; stray/unclosed tags
// are left as-is (display-only cosmetic, not a correctness concern).
const STRIP_MAX_INPUT = 256 * 1024 // 256KB — above this, skip stripping entirely
const STRIP_OPEN = '<system_warning>'
const STRIP_CLOSE = '</system_warning>'

function stripSystemTags(t: string): string {
  // Oversized input: never run the scan (DoS guard). The marker is a short
  // CLI-injected string, so legitimate text containing it is tiny; huge input
  // with these tags is adversarial. Return as-is rather than risk a stall.
  if (t.length > STRIP_MAX_INPUT) return t
  if (t.indexOf(STRIP_OPEN) === -1) return t

  let out = ''
  let i = 0
  while (i < t.length) {
    const open = t.indexOf(STRIP_OPEN, i)
    if (open === -1) {
      out += t.slice(i)
      break
    }
    const close = t.indexOf(STRIP_CLOSE, open + STRIP_OPEN.length)
    if (close === -1) {
      // Unclosed open tag — no matching pair, keep the remainder verbatim.
      out += t.slice(i)
      break
    }
    // Emit everything before the open tag, then skip the whole pair plus any
    // trailing whitespace (matching the old `\s*`).
    out += t.slice(i, open)
    i = close + STRIP_CLOSE.length
    while (i < t.length && (t[i] === ' ' || t[i] === '\t' || t[i] === '\n' || t[i] === '\r' || t[i] === '\f' || t[i] === '\v')) i++
  }
  return out
}

function createTurnParser(sessionId: string, state: SessionState): TurnParser {
  let assistantMsgId: string | null = null
  let fullText = ''
  let currentToolName = ''
  let currentToolInput = ''
  let resultSeen = false
  let producedOutput = false

  return {
    handleEvent(data: any): boolean {
      if (resultSeen) return true
      if (state.aborted) return false

      // Capture the canonical claudeSessionId ONLY from the init system
      // message (P2): later system messages can carry a forked/derived id, and
      // overwriting on every one of them aggravates stale-resume (a subsequent
      // turn would --resume the wrong branch). The authoritative end-of-turn id
      // is also captured from the result message below.
      if (data.type === 'system' && data.subtype === 'init') {
        if (data.session_id) updateSession(sessionId, { claudeSessionId: data.session_id })
        // Show recap if present (shown when resuming a session)
        if (data.content) {
          const recapId = nextId()
          const msg: Message = { id: recapId, from: 'assistant', text: '*※ ' + data.content + '*', ts: Date.now(), sessionId }
          broadcastToSession(sessionId, { type: 'msg', ...msg })
        }
      }

      // Streaming delta
      if (data.type === 'stream_event') {
        const evt = data.event
        if (evt?.type === 'content_block_start') {
          // Only text / tool_use blocks are user-visible. thinking blocks
          // stream thinking_delta (never delta.text) — creating the bubble
          // here would leave a permanently empty message AND mark the turn
          // as producedOutput, defeating zero-output detection when the
          // turn dies after thinking (e.g. error_during_execution).
          const blockType = evt.content_block?.type
          if (blockType === 'text' || blockType === 'tool_use') {
            producedOutput = true
            if (!assistantMsgId) {
              assistantMsgId = nextId()
              fullText = ''
              const msg: Message = { id: assistantMsgId, from: 'assistant', text: '', ts: Date.now(), sessionId }
              broadcastToSession(sessionId, { type: 'msg', ...msg })
            }
            // Track tool use blocks
            if (blockType === 'tool_use') {
              currentToolName = evt.content_block.name || ''
              currentToolInput = ''
              fullText += '\n\n**' + formatToolName(currentToolName) + '**\n'
              broadcastToSession(sessionId, { type: 'delta', id: assistantMsgId, text: fullText })
            }
          }
        } else if (evt?.type === 'content_block_delta') {
          if (evt.delta?.text) {
            // Defensive: if a text delta arrives without a preceding
            // text/tool_use content_block_start (unexpected event shape),
            // create the bubble here instead of broadcasting id=null.
            if (!assistantMsgId) {
              assistantMsgId = nextId()
              fullText = ''
              const msg: Message = { id: assistantMsgId, from: 'assistant', text: '', ts: Date.now(), sessionId }
              broadcastToSession(sessionId, { type: 'msg', ...msg })
            }
            producedOutput = true
            fullText += evt.delta.text
            broadcastToSession(sessionId, { type: 'delta', id: assistantMsgId, text: stripSystemTags(fullText) })
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
        if (content) {
          let t = ''
          for (const block of content) {
            if (block.type === 'text') t += block.text
            else if (block.type === 'tool_use') {
              t += '\n\n**' + formatToolName(block.name) + '**\n'
              const preview = extractToolPreview(block.name, JSON.stringify(block.input || {}))
              if (preview) t += '```diff\n' + preview + '\n```\n'
            }
          }
          if (t) {
            producedOutput = true
            fullText = t
            assistantMsgId = nextId()
            const msg: Message = { id: assistantMsgId, from: 'assistant', text: stripSystemTags(t), ts: Date.now(), sessionId }
            saveMessage(msg)
            broadcastToSession(sessionId, { type: 'msg', ...msg })
          }
        }
      }

      // Final result — completes the turn even when `result` is empty
      // (e.g. error_during_execution), otherwise the persistent path would
      // never know the turn ended.
      if (data.type === 'result') {
        resultSeen = true
        if (data.session_id) updateSession(sessionId, { claudeSessionId: data.session_id })
        // Preserve tool use content that was built up during streaming
        const hasToolContent = fullText.includes('**') && fullText.includes('```')
        const finalText = stripSystemTags(hasToolContent ? fullText : (data.result || fullText))
        if (finalText) {
          producedOutput = true
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
        return true
      }
      return false
    },

    finalizeInterrupted(suffix = '*(interrupted)*') {
      if (assistantMsgId && fullText) {
        const msg: Message = { id: assistantMsgId, from: 'assistant', text: stripSystemTags(fullText) + '\n\n' + suffix, ts: Date.now(), sessionId }
        saveMessage(msg)
        broadcastToSession(sessionId, { type: 'complete', id: assistantMsgId, text: msg.text })
      }
    },

    hasOutput: () => producedOutput,
  }
}

// --- Persistent Claude sessions (per-session, Agent SDK query) ---
// One long-lived SDK `query()` per active session eliminates the CLI cold
// start on every message. We feed user turns through a streaming-input
// AsyncIterable (sdkPush) and consume the query's SDKMessage stream; a turn
// ends on a `result` message. The SDK manages the underlying claude
// subprocess, resume, and the control protocol for us.
//
// This replaces the previous hand-rolled `claude -p --input-format stream-json`
// spawn + stdin/stdout plumbing. The key win beyond simplicity: the SDK's
// `canUseTool` callback gives us a clean hook to forward interactive requests
// (AskUserQuestion prompts and tool-permission asks) to the phone — the raw
// `-p` control_request path did NOT surface AskUserQuestion (verified), the
// SDK canUseTool callback does, even under bypassPermissions.

const MAX_PERSISTENT_PROCS = 3
const PERSISTENT_IDLE_MS = 15 * 60 * 1000
// Per-turn watchdog (P2): if the SDK stream neither emits an event nor ends for
// this long, treat the turn as wedged — tear the session down so it can't hang
// isProcessing forever (which would also block the queue and the idle reaper).
// Generous: a long agentic turn streams *something* (tool events, thinking)
// well within this; only a truly stuck stream trips it. A pending interactive
// dialog is NOT a stall — the watchdog is suspended while one is outstanding.
const TURN_WATCHDOG_MS = Number(process.env.POCKET_CLAUDE_TURN_WATCHDOG_MS ?? 10 * 60 * 1000)

// --- Interactive dialogs / approvals (canUseTool forwarding) ---
// The SDK calls our canUseTool(toolName, input, opts) before a tool runs. For
// AskUserQuestion the `input` carries { questions:[{question,header,options,
// multiSelect}] } — we forward it to the phone as an approval_request, await
// the user's answer, and resolve the callback with
// {behavior:'allow', updatedInput:{...input, answers:{[question]:answer}}}.
// For ordinary tool-permission asks (non-bypass modes) we forward toolName +
// input and resolve allow/deny. The phone protocol (approval_request /
// approval_response WS messages) is unchanged from the previous design — only
// the server-side source moved from control_request to this callback.
const DIALOG_TIMEOUT_MS = Number(process.env.POCKET_CLAUDE_DIALOG_TIMEOUT_MS ?? 5 * 60 * 1000)

type PendingDialog = {
  requestId: string
  sessionId: string
  toolName: string
  // The ORIGINAL tool input the SDK handed us. The server rebuilds the
  // PermissionResult.updatedInput from this — never from raw phone data — so a
  // compromised/XSS'd phone cannot rewrite arbitrary tool args (e.g. swap a
  // Bash command, redirect a Write path). See approval_response handler.
  origInput: Record<string, unknown>
  resolve: (result: PermissionResult) => void
  timer: ReturnType<typeof setTimeout> | null
}
const pendingDialogs = new Map<string, PendingDialog>()

// Resolve a pending dialog (from a phone answer, timeout, cancel, or session
// teardown) by settling the canUseTool promise with a PermissionResult.
function resolvePendingDialog(requestId: string, result: PermissionResult) {
  const pd = pendingDialogs.get(requestId)
  if (!pd) return
  if (pd.timer) clearTimeout(pd.timer)
  pendingDialogs.delete(requestId)
  pd.resolve(result)
}

// canUseTool handler: forward an interactive request to the phone and return a
// promise that settles when the user answers (or on timeout). Bound per
// session so we know where to broadcast.
function makeCanUseTool(sessionId: string) {
  return (toolName: string, input: Record<string, unknown>, _opts: any): Promise<PermissionResult> => {
    // Unguessable id (P1): the old nextId() counter was predictable, letting a
    // malicious client forge an approval_response for a request it never saw.
    const requestId = require('crypto').randomBytes(16).toString('hex')
    return new Promise<PermissionResult>((resolve) => {
      const timer = setTimeout(() => {
        plog(`dialog ${requestId} (${toolName}) timed out after ${DIALOG_TIMEOUT_MS}ms — auto-cancelling`)
        resolvePendingDialog(requestId, { behavior: 'deny', message: '已超时（手机未在限定时间内响应）' } as PermissionResult)
        broadcastToSession(sessionId, { type: 'approval_cancelled', requestId })
      }, DIALOG_TIMEOUT_MS)
      pendingDialogs.set(requestId, { requestId, sessionId, toolName, origInput: input, resolve, timer })
      // Forward to the phone. For AskUserQuestion the questions live in `input`;
      // the client renders options + free-text. For other tools it renders a
      // permission card (Allow / Deny) from toolName + input.
      broadcastToSession(sessionId, {
        type: 'approval_request',
        requestId,
        subtype: toolName === 'AskUserQuestion' ? 'request_user_dialog' : 'can_use_tool',
        dialogKind: toolName === 'AskUserQuestion' ? 'ask_user_question' : null,
        toolName,
        displayName: toolName,
        input,
        // ui.ts renders question cards from payload.questions; mirror input there.
        payload: toolName === 'AskUserQuestion' ? input : null,
      })
    })
  }
}

type TurnHooks = {
  onEvent: (data: any) => void
  onExit: () => void
}

// sdkPush is a streaming-input queue: an AsyncIterable<SDKUserMessage> we hand
// to query(), plus a push() to enqueue the next user turn and an end() to
// close the stream (terminating the query / subprocess).
type SdkPush = {
  iterable: AsyncIterable<SDKUserMessage>
  push: (text: string) => void
  end: () => void
}

function makeSdkPush(): SdkPush {
  const queue: SDKUserMessage[] = []
  let resolveNext: (() => void) | null = null
  let closed = false
  async function* gen(): AsyncIterable<SDKUserMessage> {
    while (true) {
      if (queue.length === 0) {
        if (closed) return
        await new Promise<void>(r => { resolveNext = r })
        if (closed && queue.length === 0) return
      }
      const m = queue.shift()
      if (m) yield m
    }
  }
  return {
    iterable: gen(),
    push(text: string) {
      queue.push({ type: 'user', message: { role: 'user', content: [{ type: 'text', text }] }, parent_tool_use_id: null, session_id: '' } as unknown as SDKUserMessage)
      if (resolveNext) { const r = resolveNext; resolveNext = null; r() }
    },
    end() {
      closed = true
      if (resolveNext) { const r = resolveNext; resolveNext = null; r() }
    },
  }
}

type PersistentProc = {
  query: Query
  push: SdkPush
  abort: AbortController
  sessionId: string
  model: string
  permissionMode: string
  cwd: string
  lastUsedAt: number
  busy: boolean
  successfulTurns: number
  sawAnyEvent: boolean
  expectedExit: boolean
  idleTimer: ReturnType<typeof setTimeout> | null
  currentTurn: TurnHooks | null
  stderrTail: string[]
}

const persistentProcs = new Map<string, PersistentProc>()
const SERVER_STARTED_AT = Date.now()

function plog(msg: string) {
  process.stderr.write(`[${new Date().toISOString()}] [sdk] ${msg}\n`)
}

// Tear down an SDK session: interrupt any in-flight turn, close the input
// stream (which ends the query and lets the SDK reap its subprocess), and
// abort as a hard backstop. The SDK owns the underlying claude subprocess and
// its descendants, so we no longer need taskkill /T tree-walking.
function killPersistentProc(sessionId: string, reason: string) {
  const entry = persistentProcs.get(sessionId)
  if (!entry) return
  entry.expectedExit = true
  if (entry.idleTimer) { clearTimeout(entry.idleTimer); entry.idleTimer = null }
  persistentProcs.delete(sessionId)
  plog(`tearing down SDK session ${sessionId} (reason=${reason}, pool=${persistentProcs.size})`)
  try { entry.query.interrupt?.() } catch {}
  try { entry.push.end() } catch {}
  try { entry.abort.abort() } catch {}
  // Settle any dialogs awaiting an answer on this dead session.
  for (const [rid, pd] of [...pendingDialogs]) {
    if (pd.sessionId === sessionId) {
      resolvePendingDialog(rid, { behavior: 'deny', message: '会话已结束' } as PermissionResult)
      broadcastToSession(sessionId, { type: 'approval_cancelled', requestId: rid })
    }
  }
}

function evictLruIfNeeded() {
  if (persistentProcs.size < MAX_PERSISTENT_PROCS) return
  let lru: PersistentProc | null = null
  for (const e of persistentProcs.values()) {
    if (e.busy) continue
    if (!lru || e.lastUsedAt < lru.lastUsedAt) lru = e
  }
  if (lru) killPersistentProc(lru.sessionId, 'lru-evicted')
  else plog(`pool over limit (${persistentProcs.size}) and all procs busy — allowing temporary overflow`)
}

function armIdleTimer(entry: PersistentProc) {
  if (entry.idleTimer) clearTimeout(entry.idleTimer)
  entry.idleTimer = setTimeout(() => {
    if (!entry.busy && persistentProcs.get(entry.sessionId) === entry) {
      killPersistentProc(entry.sessionId, 'idle-timeout')
    }
  }, PERSISTENT_IDLE_MS)
}

function spawnPersistentProc(sessionId: string, session: Session, cwd: string): PersistentProc {
  evictLruIfNeeded()

  const push = makeSdkPush()
  const abort = new AbortController()

  const q = query({
    prompt: push.iterable,
    options: {
      cwd,
      abortController: abort,
      includePartialMessages: true,
      ...(session.claudeSessionId ? { resume: session.claudeSessionId } : {}),
      ...(session.model ? { model: session.model } : {}),
      ...(session.permissionMode ? { permissionMode: session.permissionMode as any } : {}),
      canUseTool: makeCanUseTool(sessionId),
      stderr: (data: string) => {
        for (const l of String(data).split('\n')) {
          const t = l.trim()
          if (!t) continue
          entry.stderrTail.push(t)
          if (entry.stderrTail.length > 20) entry.stderrTail.shift()
        }
      },
    },
  })

  const entry: PersistentProc = {
    query: q,
    push,
    abort,
    sessionId,
    model: session.model || '',
    permissionMode: session.permissionMode || '',
    cwd,
    lastUsedAt: Date.now(),
    busy: false,
    successfulTurns: 0,
    sawAnyEvent: false,
    expectedExit: false,
    idleTimer: null,
    currentTurn: null,
    stderrTail: [],
  }
  persistentProcs.set(sessionId, entry)
  plog(`started SDK session ${sessionId} (resume=${session.claudeSessionId || 'new'}, pool=${persistentProcs.size})`)

  // Long-lived consumer loop. The SDK query is an AsyncGenerator<SDKMessage>;
  // its message shapes (system/stream_event/assistant/result) match the raw
  // stream-json events the turn parser already handles, so we feed each
  // message straight to the active turn's onEvent. The loop spans the whole
  // session lifetime (multiple turns over the streaming-input queue); it ends
  // when the stream closes (push.end / interrupt / abort) or throws.
  ;(async () => {
    try {
      for await (const msg of q as AsyncIterable<SDKMessage>) {
        entry.sawAnyEvent = true
        entry.currentTurn?.onEvent(msg)
      }
    } catch (e: any) {
      plog(`SDK consumer loop error for session ${sessionId}: ${e?.message || e}`)
    } finally {
      // Stream ended: behaves like the old proc.exited handler — drop the pool
      // entry, settle pending dialogs, and complete the in-flight turn so the
      // sender promise resolves.
      if (persistentProcs.get(sessionId) === entry) persistentProcs.delete(sessionId)
      if (entry.idleTimer) { clearTimeout(entry.idleTimer); entry.idleTimer = null }
      for (const [rid, pd] of [...pendingDialogs]) {
        if (pd.sessionId === sessionId) {
          resolvePendingDialog(rid, { behavior: 'deny', message: '会话已结束' } as PermissionResult)
          broadcastToSession(sessionId, { type: 'approval_cancelled', requestId: rid })
        }
      }
      if (!entry.expectedExit) {
        plog(`SDK session ${sessionId} ended unexpectedly (turns=${entry.successfulTurns})` +
          (entry.stderrTail.length ? ` stderr: ${entry.stderrTail.slice(-3).join(' | ')}` : ''))
      }
      entry.currentTurn?.onExit()
    }
  })()

  return entry
}

/**
 * Run one turn through the per-session SDK query.
 * Returns true if the turn was fully handled (success, abort, or
 * mid-conversation stream end with partial output preserved). Returns false
 * only if the session could not be created at all (caller surfaces an error).
 */
async function sendViaPersistent(text: string, sessionId: string, state: SessionState, session: Session, sessionCwd: string | null): Promise<boolean> {
  // Normalize: cwd from jsonl uses backslashes, WORK_DIR may use forward
  // slashes — without resolve() the comparison below would false-positive
  // "params changed" and needlessly tear down the warm session.
  const wantCwd = resolve(sessionCwd || WORK_DIR)
  const wantModel = session.model || ''
  const wantPerm = session.permissionMode || ''

  let entry = persistentProcs.get(sessionId)
  if (entry && (entry.model !== wantModel || entry.permissionMode !== wantPerm || entry.cwd !== wantCwd)) {
    killPersistentProc(sessionId, 'session-params-changed')
    entry = undefined
  }

  if (!entry) {
    try {
      entry = spawnPersistentProc(sessionId, session, wantCwd)
    } catch (e: any) {
      plog(`SDK session start failed for ${sessionId}: ${e?.message || e}`)
      broadcastToSession(sessionId, { type: 'error', text: '无法启动 Claude 会话，请检查电脑端服务' })
      return false
    }
  }

  entry.busy = true
  entry.lastUsedAt = Date.now()
  if (entry.idleTimer) { clearTimeout(entry.idleTimer); entry.idleTimer = null }

  const parser = createTurnParser(sessionId, state)
  const turnStart = Date.now()

  const outcome = await new Promise<'ok' | 'exit' | 'timeout'>((resolve) => {
    // Watchdog: re-armed on every stream event (activity = alive). Suspended
    // while an interactive dialog for this session is outstanding (the user may
    // legitimately take minutes to answer — that's the dialog timeout's job,
    // not the stall watchdog's).
    let watchdog: ReturnType<typeof setTimeout> | null = null
    const armWatchdog = () => {
      if (watchdog) clearTimeout(watchdog)
      watchdog = setTimeout(() => {
        for (const pd of pendingDialogs.values()) {
          if (pd.sessionId === sessionId) { armWatchdog(); return }  // waiting on user, not stalled
        }
        plog(`turn watchdog fired for session ${sessionId} after ${TURN_WATCHDOG_MS}ms of stream silence — tearing down`)
        resolve('timeout')
      }, TURN_WATCHDOG_MS)
    }
    entry!.currentTurn = {
      onEvent(data) {
        armWatchdog()
        if (parser.handleEvent(data)) { if (watchdog) clearTimeout(watchdog); resolve('ok') }
      },
      onExit() { if (watchdog) clearTimeout(watchdog); resolve('exit') },
    }
    armWatchdog()
    try {
      entry!.push.push(text)
    } catch (e: any) {
      plog(`push failed for session ${sessionId}: ${e?.message || e}`)
      if (watchdog) clearTimeout(watchdog)
      resolve('exit')
    }
  })
  entry.currentTurn = null

  if (outcome === 'timeout') {
    // Wedged stream: tear the session down (kills the SDK subprocess) and
    // surface partial output. The next message rebuilds via resume.
    if (persistentProcs.get(sessionId) === entry) killPersistentProc(sessionId, 'turn-watchdog')
    parser.finalizeInterrupted('*(响应超时已中断 — 再发一条可继续)*')
    if (!parser.hasOutput()) {
      broadcastToSession(sessionId, { type: 'error', text: 'Claude 响应超时已中断，请重试；连续失败请检查电脑端服务' })
    }
    return true
  }

  if (outcome === 'ok') {
    entry.busy = false
    entry.successfulTurns++
    entry.lastUsedAt = Date.now()
    armIdleTimer(entry)
    plog(`turn done for session ${sessionId} in ${((Date.now() - turnStart) / 1000).toFixed(1)}s (turns=${entry.successfulTurns})`)
    if (!parser.hasOutput()) {
      // Turn "completed" but produced nothing user-visible (e.g. error result).
      plog(`ZERO-OUTPUT turn for session ${sessionId} despite result message` +
        (entry.stderrTail.length ? ` — stderr tail: ${entry.stderrTail.slice(-8).join(' | ')}` : ''))
      broadcastToSession(sessionId, { type: 'error', text: 'Claude 本轮没有返回任何内容，请重试；连续失败请检查电脑端服务' })
    }
    return true
  }

  // Stream ended before producing a result for this turn (abort or crash).
  const stillInPool = persistentProcs.get(sessionId) === entry
  plog(`turn exit outcome for session ${sessionId} (stillInPool=${stillInPool}, aborted=${state.aborted})`)
  if (stillInPool) killPersistentProc(sessionId, 'turn-exit-cleanup')

  if (state.aborted) {
    parser.finalizeInterrupted()
    return true
  }
  // Mid-conversation crash: surface what we have; the next message rebuilds
  // the session with resume, so context is not lost.
  plog(`SDK session ${sessionId} ended mid-turn — partial output preserved, will rebuild on next message`)
  parser.finalizeInterrupted('*(connection lost — send again to continue)*')
  if (!parser.hasOutput()) {
    broadcastToSession(sessionId, { type: 'error', text: 'Claude 会话在响应前异常结束，请重试；连续失败请检查电脑端服务' })
  }
  return true
}

async function sendToClaude(text: string, sessionId: string) {
  const state = getSessionState(sessionId)
  if (state.isProcessing) {
    // Queue instead of dropping — processed in order once the current turn ends
    state.queue.push(text)
    return
  }

  const session = getSession(sessionId)
  if (!session) return

  state.isProcessing = true
  state.aborted = false
  broadcastToSession(sessionId, { type: 'status', status: 'thinking' })

  // Run in the session's original working directory when resuming, so
  // claude --resume finds the conversation and operates on the right project
  let sessionCwd = session.cwd
  if (!sessionCwd && session.claudeSessionId) {
    sessionCwd = (await cwdForClaudeSessionAsync(session.claudeSessionId)) || undefined
    if (sessionCwd) updateSession(sessionId, { cwd: sessionCwd })
  }
  if (sessionCwd && !existsSync(sessionCwd)) sessionCwd = undefined

  try {
    await sendViaPersistent(text, sessionId, state, session, sessionCwd || null)
  } catch (e: any) {
    // SDK session failed hard — never leave the phone staring at
    // thinking→idle with no explanation.
    plog(`sendToClaude error for session ${sessionId}: ${e?.message || e}`)
    broadcastToSession(sessionId, { type: 'error', text: '无法启动 Claude 会话，请检查电脑端服务' })
  }

  state.lastProcessedAt = Date.now()

  // Update watcher size so our own writes don't trigger the banner.
  // Async (P1-3c) — runs at the end of every message turn (hot path).
  //
  // P1 (concurrency): isProcessing MUST stay true across this await. The await
  // yields the event loop; if a new WS message for this same session arrives
  // during that window and isProcessing were already false, it would pass the
  // guard in sendToClaude and start a SECOND concurrent turn — clobbering
  // entry.currentTurn. We keep the turn marked busy until the drain decision
  // below, so a concurrent message queues instead of racing.
  const freshSession = getSession(sessionId)
  if (freshSession?.claudeSessionId) {
    const jsonlPath = await findJsonlPathAsync(freshSession.claudeSessionId)
    const watchEntry = sessionWatchers.get(sessionId)
    if (jsonlPath && watchEntry) {
      try { watchEntry.lastSize = (await statAsync(jsonlPath)).size } catch {}
    }
  }

  // Now that all awaits are done, flip isProcessing false synchronously and
  // make the drain decision in the same tick — no await can interleave between
  // here and the next sendToClaude, so a concurrent message can't start a
  // second turn through the idle window.
  state.isProcessing = false

  // Drain queued messages (sent while we were busy) in order.
  // Note: no `!state.aborted` check here — abortClaude already emptied the
  // queue at abort time, so anything queued now arrived AFTER the abort and
  // represents fresh user intent that must be sent. (The aborted flag itself
  // is reset at the start of the next turn.)
  const next = state.queue.shift()
  if (next !== undefined) {
    sendToClaude(next, sessionId)
    return
  }

  broadcastToSession(sessionId, { type: 'status', status: 'idle' })
}

function abortClaude(sessionId: string) {
  const state = getSessionState(sessionId)
  state.queue = []

  const entry = persistentProcs.get(sessionId)
  if (!entry) return
  // Mark aborted so the in-flight turn finalizes as interrupted, then tear
  // down the SDK session. The next message rebuilds via resume, so context
  // is not lost.
  if (state.isProcessing) state.aborted = true
  killPersistentProc(sessionId, 'user-abort')
}

// Tear down all SDK sessions when the server itself goes down. The SDK reaps
// its own claude subprocesses on query end / abort.
function killAllPersistentProcs(reason: string) {
  for (const sid of [...persistentProcs.keys()]) killPersistentProc(sid, reason)
}
process.on('exit', () => killAllPersistentProcs('server-exit'))
process.on('SIGINT', () => { killAllPersistentProcs('server-sigint'); process.exit(0) })
process.on('SIGTERM', () => { killAllPersistentProcs('server-sigterm'); process.exit(0) })
// SIGHUP (P2): terminal close / `kill -HUP` should also reap children, not
// leave orphaned SDK subprocesses holding the port.
process.on('SIGHUP', () => { killAllPersistentProcs('server-sighup'); process.exit(0) })
// Last-ditch (P2): on an otherwise-fatal error, still attempt to reap children
// before dying so we don't leak claude subprocesses / wedge the port. We log
// and exit non-zero rather than limp on in an unknown state.
process.on('uncaughtException', (err) => {
  try { process.stderr.write(`[fatal] uncaughtException: ${err?.stack || err}\n`) } catch {}
  killAllPersistentProcs('server-uncaught')
  process.exit(1)
})
process.on('unhandledRejection', (reason) => {
  try { process.stderr.write(`[fatal] unhandledRejection: ${(reason as any)?.stack || reason}\n`) } catch {}
  // Don't exit on a stray rejection — log and keep serving; a single dropped
  // promise (e.g. a client socket write) shouldn't take down every session.
})

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
      // Rate-limit key: prefer the Tailscale peer IP (one key per device);
      // fall back to a per-connection id if the address is unavailable.
      const rateKey = server.requestIP(req)?.address || `conn-${++seq}`
      if (server.upgrade(req, { data: { authed: true, sessionId, rateKey } })) return
      return new Response('upgrade failed', { status: 400 })
    }

    if (url.pathname === '/manifest.json') {
      // H1: don't advertise app metadata to unauthenticated tailnet peers.
      // The browser's declarative `<link rel="manifest">` fetch is same-origin
      // and carries no token, so an already-installed PWA re-fetching the
      // manifest would 401 — but that fetch is non-credentialed by design and
      // only affects install-time metadata, not the running app. We gate it so
      // a bare GET /manifest.json from an unpaired peer reveals nothing.
      if (!isAuthorized(req, url)) {
        return new Response('unauthorized', { status: 401 })
      }
      return new Response(MANIFEST, { headers: { 'content-type': 'application/manifest+json' } })
    }

    if (url.pathname === '/') {
      // H1: the HTML shell embeds NO secret (the token only ever lives in the
      // stderr banner and is supplied by the client via ?token= / stored token).
      // We MUST keep serving it without a token: the home-screen PWA relaunches
      // by loading `/` with no ?token=, and its bootstrap JS (ui.ts) reads the
      // token from localStorage/sessionStorage to authenticate /ws and /api/*
      // (which ARE gated). Hard-403 here would brick the installed app for zero
      // gain, since the shell is just non-sensitive bootstrap code.
      return new Response(HTML, { headers: { 'content-type': 'text/html; charset=utf-8' } })
    }

    // --- REST API for session management ---
    const json = (data: any, status = 200) =>
      new Response(JSON.stringify(data), { status, headers: { 'content-type': 'application/json' } })

    if (url.pathname.startsWith('/api/') && !isAuthorized(req, url)) {
      return json({ error: 'unauthorized' }, 401)
    }

    if (url.pathname === '/api/health' && req.method === 'GET') {
      return json({
        mode: 'sdk',
        pool: { size: persistentProcs.size, max: MAX_PERSISTENT_PROCS },
        pendingDialogs: pendingDialogs.size,
        uptime: Math.round((Date.now() - SERVER_STARTED_AT) / 1000),
      })
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
        // Explicitly provided but invalid values are a client error — reject
        // instead of silently dropping (the old behavior returned 200 and
        // left the caller believing the change applied).
        if (body.model !== undefined && !(typeof body.model === 'string' && ALLOWED_MODELS.includes(body.model))) {
          return json({ error: 'invalid model' }, 400)
        }
        if (body.permissionMode !== undefined && !(typeof body.permissionMode === 'string' && ALLOWED_PERMISSION_MODES.includes(body.permissionMode))) {
          return json({ error: 'invalid permissionMode' }, 400)
        }
        const updates = sanitizeSessionUpdates(body)

        // Resume-busy guard (P1-3b): if the caller is pointing this session at
        // a claudeSessionId that is currently BUSY in another terminal,
        // resuming would fork a second claude onto the same .jsonl and race
        // writes — the exact condition that deadlocked the server. Reject 409
        // server-side instead of trusting the client confirm() dialog. Own
        // pool processes are excluded so we never block our own warm sessions.
        if (updates.claudeSessionId) {
          const busy = await externallyBusyClaudeSessionIds()
          if (busy.has(updates.claudeSessionId)) {
            return json({ error: 'session busy in another terminal', claudeSessionId: updates.claudeSessionId }, 409)
          }
        }

        const session = updateSession(id, updates)
        if (!session) return json({ error: 'not found' }, 404)

        // model / permissionMode / resume-target changed → the running
        // persistent process has stale flags; kill it so the next message
        // rebuilds with the new parameters.
        if (updates.model !== undefined || updates.permissionMode !== undefined || updates.claudeSessionId !== undefined) {
          killPersistentProc(id, 'session-updated')
        }

        // If setting claudeSessionId (resume), load history from JSONL.
        // Async I/O (P1-3c): this is the resume hot path; a large jsonl read
        // must not block the event loop.
        if (updates.claudeSessionId) {
          const projectDirs = (await readdir(join(homedir(), '.claude', 'projects'))).filter(d => !d.startsWith('.'))
          for (const pd of projectDirs) {
            const jsonlPath = join(homedir(), '.claude', 'projects', pd, updates.claudeSessionId + '.jsonl')
            if (existsSync(jsonlPath)) {
              const content = await readFile(jsonlPath, 'utf-8')
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
      killPersistentProc(id, 'session-deleted')
      // P1 (leak): also drop the in-memory turn state and the fs watcher.
      // Without this, sessionStates grows unbounded, and a session deleted
      // mid-turn (isProcessing=true) leaves a ghost that permanently counts
      // toward activeSessionCount — eventually wedging MAX_ACTIVE_SESSIONS.
      unwatchSession(id)
      sessionStates.delete(id)
      deleteSession(id)
      return json({ ok: true })
    }

    // --- Claude Code Sessions (for resume) ---
    // Scans ~/.claude/projects/*/*.jsonl — ALL historical sessions, not just
    // live processes (~/.claude/sessions only tracks running PIDs).
    if (url.pathname === '/api/claude-sessions') {
      return (async () => {
      try {
        // Live process info (status: busy/idle) keyed by sessionId, if available
        const liveStatus = new Map<string, string>()
        try {
          for (const f of (await readdir(CLAUDE_SESSIONS_DIR)).filter(f => f.endsWith('.json'))) {
            try {
              const d = JSON.parse(await readFile(join(CLAUDE_SESSIONS_DIR, f), 'utf-8'))
              if (d.sessionId) liveStatus.set(d.sessionId, d.status || 'running')
            } catch {}
          }
        } catch {}

        const projectsRoot = join(homedir(), '.claude', 'projects')
        const projectDirs = (await readdir(projectsRoot)).filter(d => !d.startsWith('.'))
        const sessions: any[] = []
        for (const pd of projectDirs) {
          let jsonlFiles: string[] = []
          try {
            jsonlFiles = (await readdir(join(projectsRoot, pd))).filter(f => f.endsWith('.jsonl'))
          } catch { continue }
          for (const jf of jsonlFiles) {
            const sid = jf.slice(0, -6)
            const jsonlPath = join(projectsRoot, pd, jf)
            try {
              const stat = await statAsync(jsonlPath)
              const content = await readFile(jsonlPath, 'utf-8')
              const lines = content.split('\n').filter(l => l.trim())
              let firstMsg = ''
              let lastMsg = ''
              let msgCount = 0
              let lastMsgAt = 0
              let cwd = ''
              for (const line of lines) {
                try {
                  const entry = JSON.parse(line)
                  if (!cwd && entry.cwd) cwd = entry.cwd
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
              if (msgCount === 0) continue
              sessions.push({
                sessionId: sid,
                cwd,
                startedAt: stat.birthtimeMs || stat.mtimeMs,
                updatedAt: stat.mtimeMs,
                lastMessageAt: lastMsgAt || stat.mtimeMs,
                status: liveStatus.get(sid) || 'finished',
                kind: 'history',
                firstMessage: firstMsg,
                lastMessage: lastMsg,
                messageCount: msgCount,
              })
            } catch {}
          }
        }
        sessions.sort((a, b) => (b.lastMessageAt - a.lastMessageAt))
        // Dedup conversation lineages: resuming a session forks a NEW .jsonl
        // (new sessionId) that shares the same cwd + opening user message as its
        // parent, so one conversation showed up as many near-identical "继续"
        // rows. Collapse each lineage to a single entry — the most recently
        // active one (the list is already sorted newest-first, so the first
        // occurrence of a (cwd, firstMessage) key wins). Tie-break already
        // handled by the sort; later/older forks are dropped.
        const seenLineage = new Set<string>()
        const deduped: any[] = []
        for (const s of sessions) {
          const key = (s.cwd || '') + ' ' + (s.firstMessage || s.sessionId)
          if (seenLineage.has(key)) continue
          seenLineage.add(key)
          deduped.push(s)
        }
        return json(deduped.slice(0, 30))
      } catch {
        return json([])
      }
      })()
    }

    // --- Session conversation context (for preview) ---
    if (url.pathname === '/api/claude-sessions/context') {
      const sid = url.searchParams.get('id') || ''
      if (!sid) return json({ error: 'missing id' }, 400)
      if (!CLAUDE_SESSION_ID_RE.test(sid)) return json({ error: 'invalid id' }, 400)
      return (async () => {
      try {
        const projectDirs = (await readdir(join(homedir(), '.claude', 'projects'))).filter(d => !d.startsWith('.'))
        let messages: { role: string; text: string }[] = []
        for (const pd of projectDirs) {
          const jsonlPath = join(homedir(), '.claude', 'projects', pd, sid + '.jsonl')
          if (existsSync(jsonlPath)) {
            const content = await readFile(jsonlPath, 'utf-8')
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
      })()
    }

    // --- Recap a session (get AI summary) ---
    if (url.pathname === '/api/claude-sessions/recap') {
      const sid = url.searchParams.get('id') || ''
      if (!sid) return json({ error: 'missing id' }, 400)
      if (!CLAUDE_SESSION_ID_RE.test(sid)) return json({ error: 'invalid id' }, 400)
      return (async () => {
        // Busy guard (P2): recap does `claude -p --resume <sid>`, which forks a
        // second process onto that session's .jsonl. If the session is busy in
        // another terminal, that races writes — the same hazard the PATCH
        // resume guard blocks. Refuse rather than risk corruption.
        const busy = await externallyBusyClaudeSessionIds()
        if (busy.has(sid)) return json({ recap: '（该会话正在其他终端运行中，暂不可生成摘要）' })

        let proc: ReturnType<typeof spawn> | null = null
        let timer: ReturnType<typeof setTimeout> | null = null
        try {
          proc = spawn({
            cmd: ['claude', '-p', '--resume', sid, '--output-format=stream-json', '--verbose', '--model', 'haiku'],
            cwd: WORK_DIR,
            stdin: new Response('Give a brief recap of this conversation in 2-3 sentences. What were we working on and what was the last thing we did? Reply in the same language the user used.'),
            stdout: 'pipe',
            stderr: 'pipe',
          })
          const theProc = proc
          // Timeout (P2): a hung recap must not leak an orphan claude process or
          // a never-resolving request. Kill the whole tree on timeout.
          let timedOut = false
          timer = setTimeout(() => { timedOut = true; killProcTree(theProc) }, 60_000)
          // Drain stderr (P2): an unread stderr pipe can fill and stall the
          // child; we don't need the content, just keep it flowing.
          ;(async () => { try { const r = (theProc.stderr as ReadableStream<Uint8Array>).getReader(); while (true) { const { done } = await r.read(); if (done) break } } catch {} })()

          const reader = (proc.stdout as ReadableStream<Uint8Array>).getReader()
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
          if (timer) { clearTimeout(timer); timer = null }
          if (timedOut) return json({ recap: '（摘要生成超时）' })
          return json({ recap: result || 'Unable to generate recap' })
        } catch (e: any) {
          if (timer) clearTimeout(timer)
          if (proc) killProcTree(proc)
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
          // The directory listing above hides dotfiles + config.hiddenFiles, but the
          // file-read branch would otherwise return ANY file under workDir by exact
          // path (.env, .git/*, .aws/* ...). Apply the same filter to every path
          // segment relative to the work dir before reading.
          const segments = relative(WORK_DIR_REAL, fullPath).split(sep)
          if (segments.some(s => s.startsWith('.') || config.hiddenFiles.includes(s))) {
            return json({ error: 'forbidden' }, 403)
          }
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
    // Keep-alive (BUG: phone stuck on "reconnecting"). Bun closes a WS after
    // ~120s of silence by default; a backgrounded iOS PWA stops sending for
    // far longer, so the socket silently half-dies mid-session and every
    // turn's delta/status events vanish into a dead connection. The client
    // pings every 25s; we widen the idle window to 300s so a brief background
    // blip cannot tear the socket down. We also reply to app-level ping with
    // pong below so the client can detect a half-open socket and reconnect.
    idleTimeout: 300,
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
        // Frame-size guard (P1): reject oversized frames BEFORE JSON.parse, for
        // EVERY message type. The single-threaded event loop must not be made
        // to parse a multi-megabyte payload — that alone is a DoS, regardless of
        // the message type. Bun gives us the raw frame; cap it generously above
        // MAX_MESSAGE_BYTES to leave room for JSON envelope overhead.
        const rawStr = String(raw)
        if (rawStr.length > MAX_MESSAGE_BYTES + 8 * 1024) {
          if (ws.readyState === 1) ws.send(JSON.stringify({ type: 'error', text: '消息过大，请精简后重发' }))
          return
        }

        // Rate limit (P1): applies to EVERY message type, before any work —
        // ping and approval_response previously short-circuited above this and
        // could be flooded to spin the event loop / Bedrock. The legitimate
        // 25s heartbeat is far under RATE_MAX_MSGS, so honest clients are
        // unaffected; a flood of any frame type is throttled.
        if (!rateLimitAllow(ws.data.rateKey)) {
          if (ws.readyState === 1) ws.send(JSON.stringify({ type: 'error', text: '发送过于频繁，请稍后再试（每分钟最多 ' + RATE_MAX_MSGS + ' 条）' }))
          return
        }

        const data = JSON.parse(rawStr) as any

        // App-level heartbeat: the client pings every 25s. Replying lets the
        // client distinguish a live socket from a half-open one (a TCP that
        // looks open but whose packets never arrive) and reconnect proactively.
        if (data.type === 'ping') {
          if (ws.readyState === 1) ws.send(JSON.stringify({ type: 'pong' }))
          return
        }

        // Answer to a forwarded dialog / tool-permission request. The phone
        // sends { requestId, decision: 'allow'|'deny'|'cancel', answers?, message? }.
        // We settle the SDK canUseTool promise with a PermissionResult that the
        // SERVER builds from the original tool input it captured — the phone's
        // raw input is never trusted as a tool-arg replacement:
        //   - allow:  { behavior:'allow', updatedInput }, where updatedInput is
        //             the original input, plus (AskUserQuestion only) the phone's
        //             `answers` map merged in. No other phone key is honored.
        //   - deny:   { behavior:'deny', message:'...' }
        //   - cancel: mapped to deny (canUseTool has no 'cancelled' result).
        if (data.type === 'approval_response') {
          const pd = pendingDialogs.get(data.requestId)
          if (!pd) return                 // already resolved / timed out / session ended
          // Ownership check (P1): only the connection that owns this dialog's
          // session may answer it — otherwise a second device/connection could
          // answer (or, with a leaked id, inject) another session's prompt.
          if (pd.sessionId !== ws.data.sessionId) {
            plog(`approval_response for ${data.requestId} rejected: session mismatch (pd=${pd.sessionId}, ws=${ws.data.sessionId})`)
            return
          }
          let result: PermissionResult
          if (data.decision === 'deny') {
            result = { behavior: 'deny', message: '已拒绝' } as PermissionResult
          } else if (data.decision === 'cancel') {
            result = { behavior: 'deny', message: '已取消' } as PermissionResult
          } else {
            // allow: rebuild updatedInput server-side from the captured original
            // input. For AskUserQuestion, merge ONLY the phone's answers (a
            // record of question→answer strings); ignore every other key.
            let updatedInput: Record<string, unknown> = pd.origInput
            if (pd.toolName === 'AskUserQuestion' && data.answers && typeof data.answers === 'object') {
              const answers: Record<string, string> = {}
              for (const [q, a] of Object.entries(data.answers as Record<string, unknown>)) {
                answers[String(q)] = String(a)
              }
              updatedInput = { ...pd.origInput, answers }
            }
            result = { behavior: 'allow', updatedInput } as PermissionResult
          }
          resolvePendingDialog(data.requestId, result)
          return
        }

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

        // Reload session from JSONL (after external update).
        // Async I/O (P1-3c): this is a per-request WS path; a large jsonl read
        // must not block the event loop. Wrapped in an IIFE because the WS
        // message handler is sync.
        if (data.type === 'reload_session') {
          const sessionId = data.sessionId
          if (!sessionId) return
          ;(async () => {
            const session = getSession(sessionId)
            if (!session?.claudeSessionId) return
            const jsonlPath = await findJsonlPathAsync(session.claudeSessionId)
            if (!jsonlPath) return
            const content = await readFile(jsonlPath, 'utf-8')
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
            if (entry) { try { entry.lastSize = (await statAsync(jsonlPath)).size } catch {} }
          })().catch(() => {})
          return
        }

        // Send message
        const { id, text } = data
        if (!id || !text?.trim() || !ws.data.sessionId) return

        // Per-message content size cap (P2): reject oversized user text before
        // it hits Claude/Bedrock. Byte-length, not char-length (multi-byte
        // aware). The raw-frame guard + rate limit at the top of message()
        // already cover all types; this is the tighter content-specific bound.
        if (Buffer.byteLength(text, 'utf-8') > MAX_MESSAGE_BYTES) {
          ws.send(JSON.stringify({ type: 'error', text: `消息过大（上限 ${Math.round(MAX_MESSAGE_BYTES / 1024)}KB），请精简后重发` }))
          return
        }

        // Concurrent active-session cap (P2): bound how many turns can run at
        // once so a flood of distinct sessions can't spawn unbounded procs.
        // Allow messages to sessions already processing (they queue internally).
        const targetState = getSessionState(ws.data.sessionId)
        if (!targetState.isProcessing && activeSessionCount() >= MAX_ACTIVE_SESSIONS) {
          ws.send(JSON.stringify({ type: 'error', text: '当前并发会话已达上限，请稍后再试' }))
          return
        }

        const msg: Message = { id, from: 'user', text: text.trim(), ts: Date.now(), sessionId: ws.data.sessionId }
        saveMessage(msg)
        broadcastToSession(ws.data.sessionId, { type: 'msg', ...msg })
        sendToClaude(text.trim(), ws.data.sessionId)
      } catch {}
    },
  },
})

process.stderr.write(`\npocket-claude v1.0.0 started\n`)
// One token = full RCE. Only print the token-bearing URL to an interactive
// terminal. When run as a daemon (run.sh -d redirects stderr into a
// world-readable server.log) print a token-free line instead, so the secret
// never lands in the log. start-pocket-mac.sh reads the token file directly
// for pairing, so gating here does not break the pairing flow.
if (process.stdout.isTTY) {
  process.stderr.write(`URL: http://${HOST}:${PORT}?token=${TOKEN}\n`)
  process.stderr.write(`Working directory: ${WORK_DIR}\n`)
  if (config.tailscaleIp) {
    process.stderr.write(`\nOpen on iPhone: http://${config.tailscaleIp}:${PORT}?token=${TOKEN}\n`)
  }
} else {
  process.stderr.write(`pocket-claude listening on ${HOST}:${PORT} — token in ~/.claude/channels/pocket-claude/token\n`)
  process.stderr.write(`Working directory: ${WORK_DIR}\n`)
}
process.stderr.write(`\n`)
