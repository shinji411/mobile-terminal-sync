#!/usr/bin/env bun
/**
 * Minimal proof: persistent claude process via stream-json bidirectional mode.
 * Spawns ONE claude process, sends two messages over stdin, expects two
 * result events without the process exiting in between.
 */
import { spawn } from 'bun'

const t0 = Date.now()
const log = (m: string) => console.log(`[${((Date.now() - t0) / 1000).toFixed(1)}s] ${m}`)

const proc = spawn({
  cmd: [
    'claude', '-p',
    '--input-format', 'stream-json',
    '--output-format', 'stream-json',
    '--verbose',
    '--include-partial-messages',
    '--model', 'haiku',
    '--permission-mode', 'default',
  ],
  cwd: process.env.POCKET_CLAUDE_CWD || process.cwd(),
  stdin: 'pipe',
  stdout: 'pipe',
  stderr: 'pipe',
})

log(`spawned pid=${proc.pid}`)

function sendMessage(text: string) {
  const line = JSON.stringify({
    type: 'user',
    message: { role: 'user', content: [{ type: 'text', text }] },
  }) + '\n'
  proc.stdin.write(line)
  proc.stdin.flush()
  log(`>> sent: ${text}`)
}

// Collect stderr for diagnostics
;(async () => {
  const r = proc.stderr.getReader()
  const d = new TextDecoder()
  while (true) {
    const { done, value } = await r.read()
    if (done) break
    const s = d.decode(value).trim()
    if (s) console.error(`[stderr] ${s}`)
  }
})()

let resultCount = 0
let sessionId = ''
const turnStart = [0, 0]

async function main() {
  turnStart[0] = Date.now()
  sendMessage('Reply with exactly the word PING1 and nothing else.')

  const reader = proc.stdout.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  const timeout = setTimeout(() => {
    log('TIMEOUT (120s) — killing process')
    proc.kill()
    process.exit(2)
  }, 120000)

  while (true) {
    const { done, value } = await reader.read()
    if (done) { log('stdout EOF (process exited)'); break }
    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split('\n')
    buffer = lines.pop() || ''
    for (const line of lines) {
      if (!line.trim()) continue
      let data: any
      try { data = JSON.parse(line) } catch { continue }
      if (data.type === 'system' && data.subtype === 'init') {
        sessionId = data.session_id
        log(`<< system/init session_id=${sessionId}`)
      } else if (data.type === 'result') {
        resultCount++
        const elapsed = ((Date.now() - turnStart[resultCount - 1]) / 1000).toFixed(1)
        log(`<< RESULT #${resultCount} (turn took ${elapsed}s) session_id=${data.session_id} result="${String(data.result).slice(0, 60)}"`)
        if (resultCount === 1) {
          log(`process still alive: killed=${proc.killed}`)
          turnStart[1] = Date.now()
          sendMessage('Reply with exactly the word PING2 and nothing else.')
        } else if (resultCount === 2) {
          clearTimeout(timeout)
          log(`SUCCESS: 2 results from one process (pid=${proc.pid}). Turn1=${((turnStart[1] - turnStart[0]) / 1000).toFixed(1)}s Turn2=${elapsed}s`)
          proc.kill()
          process.exit(0)
        }
      } else if (data.type === 'assistant') {
        log(`<< assistant message`)
      }
    }
  }
  clearTimeout(timeout)
  log(`exited with results=${resultCount}, exitCode=${await proc.exited}`)
  process.exit(resultCount >= 2 ? 0 : 1)
}

main()
