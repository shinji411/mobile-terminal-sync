import { Database } from 'bun:sqlite'
import { mkdirSync } from 'fs'
import { join } from 'path'
import { homedir } from 'os'

export type Message = {
  id: string
  from: 'user' | 'assistant'
  text: string
  ts: number
  replyTo?: string
  sessionId?: string
}

const DB_DIR = join(homedir(), '.claude', 'channels', 'pocket-claude')
mkdirSync(DB_DIR, { recursive: true })

const db = new Database(join(DB_DIR, 'messages.db'))
db.run('PRAGMA journal_mode = WAL')
db.run(`CREATE TABLE IF NOT EXISTS messages (
  id TEXT PRIMARY KEY,
  "from" TEXT NOT NULL,
  text TEXT NOT NULL,
  ts INTEGER NOT NULL,
  reply_to TEXT,
  session_id TEXT DEFAULT 'default'
)`)

// Migration: add session_id column if missing
try { db.run(`ALTER TABLE messages ADD COLUMN session_id TEXT DEFAULT 'default'`) } catch {}

const insertStmt = db.prepare(
  `INSERT OR REPLACE INTO messages (id, "from", text, ts, reply_to, session_id) VALUES (?, ?, ?, ?, ?, ?)`
)
const historyStmt = db.prepare(
  `SELECT id, "from", text, ts, reply_to, session_id FROM messages WHERE session_id = ? ORDER BY ts DESC LIMIT ?`
)

export function saveMessage(msg: Message): void {
  insertStmt.run(msg.id, msg.from, msg.text, msg.ts, msg.replyTo ?? null, msg.sessionId ?? 'default')
}

export function getHistory(sessionId: string, limit = 100): Message[] {
  const rows = historyStmt.all(sessionId, limit) as any[]
  return rows.reverse().map(r => ({
    id: r.id,
    from: r.from,
    text: r.text,
    ts: r.ts,
    replyTo: r.reply_to ?? undefined,
    sessionId: r.session_id,
  }))
}
