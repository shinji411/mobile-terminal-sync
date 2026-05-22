import { existsSync, readFileSync } from 'fs'
import { join } from 'path'
import { homedir } from 'os'

export type Config = {
  port: number
  host: string
  workDir: string
  defaultModel: string
  defaultPermissionMode: string
  maxHistoryMessages: number
  maxFileSize: number
  hiddenFiles: string[]
  tailscaleIp: string
}

const DEFAULTS: Config = {
  port: 3210,
  host: '0.0.0.0',
  workDir: '~/workspace',
  defaultModel: 'sonnet',
  defaultPermissionMode: 'auto',
  maxHistoryMessages: 100,
  maxFileSize: 512 * 1024,
  hiddenFiles: ['.git', 'node_modules', '.DS_Store', '.env'],
  tailscaleIp: '',
}

function resolveHome(p: string): string {
  return p.startsWith('~') ? join(homedir(), p.slice(1)) : p
}

export function loadConfig(): Config {
  const configPath = join(import.meta.dir, 'config.json')
  let userConfig: Partial<Config> = {}

  if (existsSync(configPath)) {
    try {
      userConfig = JSON.parse(readFileSync(configPath, 'utf-8'))
    } catch {}
  }

  const config = { ...DEFAULTS, ...userConfig }
  config.workDir = resolveHome(config.workDir)
  return config
}
