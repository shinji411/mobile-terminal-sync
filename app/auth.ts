import { randomBytes, timingSafeEqual } from 'crypto'
import { existsSync, readFileSync, writeFileSync } from 'fs'
import { join } from 'path'
import { homedir } from 'os'

const TOKEN_FILE = join(homedir(), '.claude', 'channels', 'pocket-claude', 'token')

export function getOrCreateToken(): string {
  if (existsSync(TOKEN_FILE)) {
    return readFileSync(TOKEN_FILE, 'utf-8').trim()
  }
  const token = randomBytes(24).toString('base64url')
  const dir = join(homedir(), '.claude', 'channels', 'pocket-claude')
  const { mkdirSync } = require('fs')
  mkdirSync(dir, { recursive: true })
  writeFileSync(TOKEN_FILE, token)
  return token
}

export function validateToken(url: URL, token: string): boolean {
  const given = url.searchParams.get('token') || ''
  const a = Buffer.from(given)
  const b = Buffer.from(token)
  return a.length === b.length && timingSafeEqual(a, b)
}
