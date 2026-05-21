import { randomBytes } from 'crypto'
import { existsSync, readFileSync, writeFileSync } from 'fs'
import { join } from 'path'
import { homedir } from 'os'

const TOKEN_FILE = join(homedir(), '.claude', 'channels', 'claude-mobile', 'token')

export function getOrCreateToken(): string {
  if (existsSync(TOKEN_FILE)) {
    return readFileSync(TOKEN_FILE, 'utf-8').trim()
  }
  const token = randomBytes(24).toString('base64url')
  const dir = join(homedir(), '.claude', 'channels', 'claude-mobile')
  const { mkdirSync } = require('fs')
  mkdirSync(dir, { recursive: true })
  writeFileSync(TOKEN_FILE, token)
  return token
}

export function validateToken(url: URL, token: string): boolean {
  return url.searchParams.get('token') === token
}
