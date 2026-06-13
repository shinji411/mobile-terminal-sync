#!/usr/bin/env bun
/**
 * E2E test client for pocket-claude persistent-process mode.
 * Drives the server over REST + WebSocket exactly like the phone UI.
 *
 * Usage: bun test-e2e.ts <test-name>
 *   warm    — 3 sequential messages in one session, timing each
 *   abort   — send, abort mid-turn, send again
 *   crash   — send, kill claude proc externally, send again + context check
 *   who     — new session, ask identity (CLAUDE.md load check)
 *   multi   — two sessions, interleaved messages, isolation check
 */
import { readFileSync } from 'fs'
import { homedir } from 'os'
import { join } from 'path'

const TOKEN = readFileSync(join(homedir(), '.claude', 'channels', 'pocket-claude', 'token'), 'utf-8').trim()
// Host:port to test against. Set PC_TEST_HOST (e.g. your Tailscale IP) to test
// over the network; defaults to localhost.
const HOST = process.env.PC_TEST_HOST || '127.0.0.1:3210'
const BASE = `http://${HOST}`
const WS_BASE = `ws://${HOST}`

const t0 = Date.now()
const log = (m: string) => console.log(`[${((Date.now() - t0) / 1000).toFixed(1)}s] ${m}`)

async function createSession(name: string): Promise<string> {
  const res = await fetch(`${BASE}/api/sessions?token=${TOKEN}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ name }),
  })
  const s = await res.json() as any
  log(`created session ${s.id} (model=${s.model}, perm=${s.permissionMode})`)
  return s.id
}

type Turn = { text: string; ms: number }

function connect(sessionId: string): Promise<{ ws: WebSocket; sendAndWait: (text: string, timeoutMs?: number) => Promise<Turn>; abort: () => void; close: () => void }> {
  return new Promise((resolveConn, rejectConn) => {
    const ws = new WebSocket(`${WS_BASE}/ws?token=${TOKEN}&session=${sessionId}`)
    let pending: { resolve: (t: Turn) => void; start: number; lastText: string; timer: any } | null = null

    ws.onopen = () => {
      resolveConn({
        ws,
        sendAndWait(text: string, timeoutMs = 180000) {
          return new Promise<Turn>((resolve, reject) => {
            const start = Date.now()
            const timer = setTimeout(() => { pending = null; reject(new Error(`turn timeout: ${text.slice(0, 40)}`)) }, timeoutMs)
            pending = { resolve, start, lastText: '', timer }
            ws.send(JSON.stringify({ id: `t${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, text }))
          })
        },
        abort() { ws.send(JSON.stringify({ type: 'abort' })) },
        close() { ws.close() },
      })
    }
    ws.onerror = (e) => rejectConn(new Error('ws error'))
    ws.onmessage = (ev) => {
      const data = JSON.parse(String(ev.data))
      if (!pending) return
      if (data.type === 'delta') pending.lastText = data.text
      if (data.type === 'msg' && data.from === 'assistant' && data.text) pending.lastText = data.text
      if (data.type === 'complete') {
        pending.lastText = data.text
        const p = pending
        // wait for status idle to seal the turn? complete is enough for measuring
        clearTimeout(p.timer)
        pending = null
        p.resolve({ text: p.lastText, ms: Date.now() - p.start })
      }
      // For aborted turns we may only get status:idle without complete
      if (data.type === 'status' && data.status === 'idle' && pending && Date.now() - pending.start > 1500) {
        const p = pending
        clearTimeout(p.timer)
        pending = null
        p.resolve({ text: p.lastText, ms: Date.now() - p.start })
      }
    }
  })
}

function countClaudeProcs(): string {
  try {
    const out = Bun.spawnSync(['powershell', '-NoProfile', '-Command',
      "Get-CimInstance Win32_Process | Where-Object { $_.CommandLine -match 'claude' -and $_.CommandLine -match 'stream-json' } | Select-Object -ExpandProperty ProcessId"]).stdout.toString()
    const pids = out.split('\n').map(l => l.trim()).filter(Boolean)
    return `${pids.length} claude procs: [${pids.join(', ')}]`
  } catch (e: any) { return 'ps failed: ' + e.message }
}

const test = process.argv[2]

if (test === 'warm') {
  const sid = await createSession('e2e-warm')
  const c = await connect(sid)
  log(`procs before: ${countClaudeProcs()}`)
  const t1 = await c.sendAndWait('回答一个词：你现在心情如何？')
  log(`turn1 (cold): ${(t1.ms / 1000).toFixed(1)}s → "${t1.text.slice(0, 50)}"`)
  log(`procs after turn1: ${countClaudeProcs()}`)
  const t2 = await c.sendAndWait('再用一个词形容今天天气（随便编）')
  log(`turn2 (warm): ${(t2.ms / 1000).toFixed(1)}s → "${t2.text.slice(0, 50)}"`)
  log(`procs after turn2: ${countClaudeProcs()}`)
  const t3 = await c.sendAndWait('我第一条消息问了你什么？一句话回答。')
  log(`turn3 (warm+context): ${(t3.ms / 1000).toFixed(1)}s → "${t3.text.slice(0, 80)}"`)
  log(`procs after turn3: ${countClaudeProcs()}`)
  c.close()
  process.exit(0)
}

if (test === 'abort') {
  const sid = await createSession('e2e-abort')
  const c = await connect(sid)
  // Long task, abort after 4s
  const p = c.sendAndWait('请详细写一篇1000字的关于分布式系统的文章', 60000)
  setTimeout(() => { log('sending abort'); c.abort() }, 4000)
  const t1 = await p
  log(`aborted turn returned after ${(t1.ms / 1000).toFixed(1)}s, text tail: "...${t1.text.slice(-60)}"`)
  log(`procs after abort: ${countClaudeProcs()}`)
  const t2 = await c.sendAndWait('回答一个词：OK吗？')
  log(`post-abort turn: ${(t2.ms / 1000).toFixed(1)}s → "${t2.text.slice(0, 50)}"`)
  c.close()
  process.exit(0)
}

if (test === 'who') {
  const sid = await createSession('e2e-who')
  const c = await connect(sid)
  const t1 = await c.sendAndWait('你是谁？你的团队里有哪些成员？只列名字。')
  log(`identity answer (${(t1.ms / 1000).toFixed(1)}s):\n${t1.text.slice(0, 500)}`)
  c.close()
  process.exit(0)
}

if (test === 'crash') {
  const sid = await createSession('e2e-crash')
  const c = await connect(sid)
  const t1 = await c.sendAndWait('记住暗号：紫罗兰。回答"已记住"两个字即可。')
  log(`turn1: ${(t1.ms / 1000).toFixed(1)}s → "${t1.text.slice(0, 40)}"`)
  log(`procs: ${countClaudeProcs()}`)
  // Kill the persistent claude proc by PID (it runs as node/bun under the npm shim)
  const out = Bun.spawnSync(['powershell', '-NoProfile', '-Command',
    "Get-CimInstance Win32_Process | Where-Object { $_.CommandLine -match 'claude' -and $_.CommandLine -match 'stream-json' -and $_.CommandLine -match 'input-format' } | ForEach-Object { Stop-Process -Id $_.ProcessId -Force; $_.ProcessId }"]).stdout.toString().trim()
  log(`killed claude proc(s): ${out || '(none found!)'}  (simulated crash)`)
  await new Promise(r => setTimeout(r, 2000))
  log(`procs after kill: ${countClaudeProcs()}`)
  const t2 = await c.sendAndWait('我刚才让你记住的暗号是什么？只回答暗号本身。')
  log(`post-crash turn: ${(t2.ms / 1000).toFixed(1)}s → "${t2.text.slice(0, 60)}"`)
  if (t2.text.includes('紫罗兰')) log('CONTEXT SURVIVED CRASH ✓')
  else log('CONTEXT LOST ✗')
  c.close()
  process.exit(0)
}

if (test === 'crashmid') {
  const sid = await createSession('e2e-crashmid')
  const c = await connect(sid)
  const t1 = await c.sendAndWait('记住暗号：海星。回答"已记住"即可。')
  log(`turn1: ${(t1.ms / 1000).toFixed(1)}s → "${t1.text.slice(0, 30)}"`)
  // Start a long turn, kill the proc mid-turn (no abort)
  const p = c.sendAndWait('慢慢数数，从1数到30，每个数字单独一行。', 90000)
  setTimeout(() => {
    const out = Bun.spawnSync(['powershell', '-NoProfile', '-Command',
      "Get-CimInstance Win32_Process | Where-Object { $_.CommandLine -match 'claude' -and $_.CommandLine -match 'input-format' } | ForEach-Object { Stop-Process -Id $_.ProcessId -Force; $_.ProcessId }"]).stdout.toString().trim()
    log(`mid-turn killed: ${out || '(none)'}`)
  }, 3000)
  const t2 = await p
  log(`mid-turn-crash turn returned ${(t2.ms / 1000).toFixed(1)}s, tail: "...${t2.text.slice(-80)}"`)
  const t3 = await c.sendAndWait('暗号是什么？只回答暗号。')
  log(`recovery turn: ${(t3.ms / 1000).toFixed(1)}s → "${t3.text.slice(0, 40)}"`)
  log(t3.text.includes('海星') ? 'MID-TURN CRASH RECOVERY ✓' : 'CONTEXT LOST ✗')
  c.close()
  process.exit(0)
}

if (test === 'multi') {
  const sidA = await createSession('e2e-multi-A')
  const sidB = await createSession('e2e-multi-B')
  const cA = await connect(sidA)
  const cB = await connect(sidB)
  // Fire both concurrently
  const [tA1, tB1] = await Promise.all([
    cA.sendAndWait('记住：我的幸运数字是 7。回答"好"即可。'),
    cB.sendAndWait('记住：我的幸运数字是 42。回答"好"即可。'),
  ])
  log(`A turn1: ${(tA1.ms / 1000).toFixed(1)}s "${tA1.text.slice(0, 30)}" | B turn1: ${(tB1.ms / 1000).toFixed(1)}s "${tB1.text.slice(0, 30)}"`)
  log(`procs: ${countClaudeProcs()}`)
  const [tA2, tB2] = await Promise.all([
    cA.sendAndWait('我的幸运数字是多少？只回答数字。'),
    cB.sendAndWait('我的幸运数字是多少？只回答数字。'),
  ])
  log(`A says: "${tA2.text.slice(0, 30)}" (expect 7) | B says: "${tB2.text.slice(0, 30)}" (expect 42)`)
  const okA = tA2.text.includes('7') && !tA2.text.includes('42')
  const okB = tB2.text.includes('42')
  log(okA && okB ? 'SESSION ISOLATION ✓' : 'SESSION ISOLATION ✗')
  cA.close(); cB.close()
  process.exit(0)
}

console.log('usage: bun test-e2e.ts warm|abort|who|crash|multi')
process.exit(1)
