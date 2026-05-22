import { mkdirSync, existsSync, readFileSync, writeFileSync, readdirSync, unlinkSync } from 'fs'
import { join } from 'path'
import { homedir } from 'os'

export type Session = {
  id: string
  name: string
  claudeSessionId: string | null
  createdAt: number
  lastActiveAt: number
  model: string
  permissionMode: string
}

const SESSIONS_DIR = join(homedir(), '.claude', 'channels', 'pocket-claude', 'sessions')
mkdirSync(SESSIONS_DIR, { recursive: true })

function sessionPath(id: string) {
  return join(SESSIONS_DIR, `${id}.json`)
}

export function listSessions(): Session[] {
  const files = readdirSync(SESSIONS_DIR).filter(f => f.endsWith('.json'))
  return files
    .map(f => {
      try { return JSON.parse(readFileSync(join(SESSIONS_DIR, f), 'utf-8')) as Session }
      catch { return null }
    })
    .filter(Boolean)
    .sort((a, b) => b!.lastActiveAt - a!.lastActiveAt) as Session[]
}

export function getSession(id: string): Session | null {
  const p = sessionPath(id)
  if (!existsSync(p)) return null
  try { return JSON.parse(readFileSync(p, 'utf-8')) }
  catch { return null }
}

export function createSession(name: string, model = 'sonnet', permissionMode = 'auto'): Session {
  const id = `s${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
  const session: Session = {
    id,
    name,
    claudeSessionId: null,
    createdAt: Date.now(),
    lastActiveAt: Date.now(),
    model,
    permissionMode,
  }
  writeFileSync(sessionPath(id), JSON.stringify(session, null, 2))
  return session
}

export function updateSession(id: string, updates: Partial<Session>): Session | null {
  const session = getSession(id)
  if (!session) return null
  Object.assign(session, updates, { lastActiveAt: Date.now() })
  writeFileSync(sessionPath(id), JSON.stringify(session, null, 2))
  return session
}

export function deleteSession(id: string): boolean {
  const p = sessionPath(id)
  if (!existsSync(p)) return false
  unlinkSync(p)
  return true
}
