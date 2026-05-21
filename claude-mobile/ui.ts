export const MANIFEST = JSON.stringify({
  name: 'Claude Mobile',
  short_name: 'Claude',
  start_url: '/',
  display: 'standalone',
  background_color: '#1a1a2e',
  theme_color: '#d4a574',
  icons: [{ src: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">🤖</text></svg>', sizes: 'any', type: 'image/svg+xml' }],
})

export const HTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<title>Claude Mobile</title>
<link rel="manifest" href="/manifest.json">
<style>
:root {
  --bg: #f9f9f9;
  --chat-bg: #ffffff;
  --user-bubble: #d4a574;
  --user-text: #fff;
  --assistant-bubble: #f0f0f0;
  --assistant-text: #1a1a1a;
  --input-bg: #ffffff;
  --input-border: #e0e0e0;
  --text: #1a1a1a;
  --text-muted: #666;
  --code-bg: #f5f5f5;
  --safe-bottom: env(safe-area-inset-bottom, 0px);
}
@media (prefers-color-scheme: dark) {
  :root {
    --bg: #1a1a2e;
    --chat-bg: #1a1a2e;
    --user-bubble: #d4a574;
    --user-text: #fff;
    --assistant-bubble: #2a2a3e;
    --assistant-text: #e0e0e0;
    --input-bg: #2a2a3e;
    --input-border: #3a3a4e;
    --text: #e0e0e0;
    --text-muted: #999;
    --code-bg: #2a2a3e;
  }
}
* { box-sizing: border-box; margin: 0; padding: 0; }
body {
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro', system-ui, sans-serif;
  background: var(--bg);
  color: var(--text);
  height: 100dvh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
#header {
  padding: 12px 16px;
  padding-top: calc(12px + env(safe-area-inset-top, 0px));
  background: var(--chat-bg);
  border-bottom: 1px solid var(--input-border);
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}
#header .dot {
  width: 10px; height: 10px; border-radius: 50%;
  background: #4caf50;
  flex-shrink: 0;
}
#header .dot.offline { background: #f44336; }
#header h1 { font-size: 16px; font-weight: 600; }
#header .status { font-size: 12px; color: var(--text-muted); margin-left: auto; }
#messages {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  -webkit-overflow-scrolling: touch;
}
.msg {
  max-width: 85%;
  padding: 10px 14px;
  border-radius: 18px;
  font-size: 15px;
  line-height: 1.5;
  word-wrap: break-word;
  animation: fadeIn 0.2s ease;
}
@keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
.msg.user {
  align-self: flex-end;
  background: var(--user-bubble);
  color: var(--user-text);
  border-bottom-right-radius: 4px;
}
.msg.assistant {
  align-self: flex-start;
  background: var(--assistant-bubble);
  color: var(--assistant-text);
  border-bottom-left-radius: 4px;
}
.msg pre {
  background: var(--code-bg);
  border-radius: 8px;
  padding: 10px 12px;
  overflow-x: auto;
  margin: 8px 0;
  font-size: 13px;
  line-height: 1.4;
}
.msg code {
  font-family: 'SF Mono', 'Fira Code', monospace;
  font-size: 13px;
}
.msg :not(pre) > code {
  background: var(--code-bg);
  padding: 2px 5px;
  border-radius: 4px;
}
.msg p { margin: 6px 0; }
.msg p:first-child { margin-top: 0; }
.msg p:last-child { margin-bottom: 0; }
.msg ul, .msg ol { padding-left: 20px; margin: 6px 0; }
.msg blockquote { border-left: 3px solid var(--user-bubble); padding-left: 10px; margin: 6px 0; opacity: 0.8; }
.msg h1, .msg h2, .msg h3 { margin: 10px 0 4px; font-size: 15px; font-weight: 600; }
.msg table { border-collapse: collapse; margin: 8px 0; font-size: 13px; }
.msg th, .msg td { border: 1px solid var(--input-border); padding: 4px 8px; }
.time {
  font-size: 11px;
  color: var(--text-muted);
  margin-top: 2px;
  padding: 0 4px;
}
.time.user { text-align: right; }
#input-area {
  padding: 10px 12px;
  padding-bottom: calc(10px + var(--safe-bottom));
  background: var(--chat-bg);
  border-top: 1px solid var(--input-border);
  display: flex;
  gap: 8px;
  align-items: flex-end;
  flex-shrink: 0;
}
#input {
  flex: 1;
  border: 1px solid var(--input-border);
  border-radius: 20px;
  padding: 10px 16px;
  font-size: 15px;
  font-family: inherit;
  background: var(--input-bg);
  color: var(--text);
  resize: none;
  max-height: 120px;
  line-height: 1.4;
  outline: none;
}
#input:focus { border-color: var(--user-bubble); }
#send {
  width: 36px; height: 36px;
  border-radius: 50%;
  border: none;
  background: var(--user-bubble);
  color: #fff;
  font-size: 18px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
#send:disabled { opacity: 0.4; }
.typing {
  align-self: flex-start;
  padding: 10px 14px;
  background: var(--assistant-bubble);
  border-radius: 18px;
  border-bottom-left-radius: 4px;
  display: none;
}
.typing span {
  display: inline-block;
  width: 8px; height: 8px;
  border-radius: 50%;
  background: var(--text-muted);
  margin: 0 2px;
  animation: bounce 1.4s infinite;
}
.typing span:nth-child(2) { animation-delay: 0.2s; }
.typing span:nth-child(3) { animation-delay: 0.4s; }
@keyframes bounce { 0%,60%,100% { transform: translateY(0); } 30% { transform: translateY(-4px); } }
</style>
</head>
<body>
<div id="header">
  <div class="dot" id="dot"></div>
  <h1>Claude Code</h1>
  <span class="status" id="status">connecting...</span>
</div>
<div id="messages">
  <div class="typing" id="typing"><span></span><span></span><span></span></div>
</div>
<div id="input-area">
  <textarea id="input" rows="1" placeholder="Message Claude..." autocomplete="off"></textarea>
  <button id="send" disabled>↑</button>
</div>

<script src="https://cdn.jsdelivr.net/npm/marked@15/marked.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/highlight.js@11/highlight.min.js"></script>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/highlight.js@11/styles/github-dark.min.css" media="(prefers-color-scheme: dark)">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/highlight.js@11/styles/github.min.css" media="(prefers-color-scheme: light)">

<script>
const messages = document.getElementById('messages')
const input = document.getElementById('input')
const sendBtn = document.getElementById('send')
const dot = document.getElementById('dot')
const status = document.getElementById('status')
const typing = document.getElementById('typing')

marked.setOptions({
  highlight: (code, lang) => {
    if (lang && hljs.getLanguage(lang)) return hljs.highlight(code, { language: lang }).value
    return hljs.highlightAuto(code).value
  },
  breaks: true,
})

const token = new URLSearchParams(location.search).get('token') || ''
const proto = location.protocol === 'https:' ? 'wss:' : 'ws:'
let ws
let uid = 0

function connect() {
  ws = new WebSocket(proto + '//' + location.host + '/ws?token=' + token)
  ws.onopen = () => {
    dot.classList.remove('offline')
    status.textContent = 'connected'
    sendBtn.disabled = false
  }
  ws.onclose = () => {
    dot.classList.add('offline')
    status.textContent = 'reconnecting...'
    sendBtn.disabled = true
    setTimeout(connect, 2000)
  }
  ws.onmessage = e => {
    const data = JSON.parse(e.data)
    if (data.type === 'history') {
      data.messages.forEach(m => addMessage(m, false))
      scrollBottom()
    } else if (data.type === 'msg') {
      addMessage(data, true)
    } else if (data.type === 'edit') {
      const el = document.querySelector('[data-id="' + data.id + '"] .content')
      if (el) el.innerHTML = render(data.text)
    }
  }
}
connect()

function render(text) {
  try { return marked.parse(text) } catch { return text }
}

function addMessage(m, animate) {
  const existing = document.querySelector('[data-id="' + m.id + '"]')
  if (existing) return

  const wrapper = document.createElement('div')
  wrapper.dataset.id = m.id

  const bubble = document.createElement('div')
  bubble.className = 'msg ' + m.from
  const content = document.createElement('div')
  content.className = 'content'
  content.innerHTML = m.from === 'assistant' ? render(m.text) : escapeHtml(m.text)
  bubble.appendChild(content)

  const time = document.createElement('div')
  time.className = 'time ' + m.from
  time.textContent = formatTime(m.ts)

  wrapper.appendChild(bubble)
  wrapper.appendChild(time)
  messages.insertBefore(wrapper, typing)

  if (animate) scrollBottom()
}

function escapeHtml(s) {
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/\\n/g,'<br>')
}

function formatTime(ts) {
  const d = new Date(ts)
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

function scrollBottom() {
  requestAnimationFrame(() => messages.scrollTop = messages.scrollHeight)
}

function send() {
  const text = input.value.trim()
  if (!text || !ws || ws.readyState !== 1) return
  const id = 'u' + Date.now() + '-' + (++uid)
  ws.send(JSON.stringify({ id, text }))
  addMessage({ id, from: 'user', text, ts: Date.now() }, true)
  input.value = ''
  autoResize()
}

sendBtn.onclick = send
input.addEventListener('keydown', e => {
  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() }
})
input.addEventListener('input', autoResize)

function autoResize() {
  input.style.height = 'auto'
  input.style.height = Math.min(input.scrollHeight, 120) + 'px'
  sendBtn.disabled = !input.value.trim() || !ws || ws.readyState !== 1
}
</script>
</body>
</html>`
