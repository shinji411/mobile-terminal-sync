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
  --sidebar-bg: #f0f0f0;
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
    --sidebar-bg: #12121e;
  }
}
* { box-sizing: border-box; margin: 0; padding: 0; }
body {
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro', system-ui, sans-serif;
  background: var(--bg);
  color: var(--text);
  height: 100dvh;
  display: flex;
  overflow: hidden;
}

/* Sidebar */
#sidebar {
  width: 280px;
  height: 100dvh;
  background: var(--sidebar-bg);
  border-right: 1px solid var(--input-border);
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  position: fixed;
  left: -280px;
  top: 0;
  z-index: 100;
  transition: left 0.25s ease;
  padding-top: env(safe-area-inset-top, 0px);
}
#sidebar.open { left: 0; }
#sidebar-header {
  padding: 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid var(--input-border);
}
#sidebar-header h2 { font-size: 16px; font-weight: 600; }
#new-chat-btn {
  background: var(--user-bubble);
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 6px 12px;
  font-size: 13px;
  cursor: pointer;
}
#session-list {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
}
.session-item {
  padding: 12px;
  border-radius: 10px;
  cursor: pointer;
  margin-bottom: 4px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.session-item:hover { background: var(--input-border); }
.session-item.active { background: var(--user-bubble); color: #fff; }
.session-item .name { font-size: 14px; font-weight: 500; flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.session-item .time { font-size: 11px; opacity: 0.6; }
.session-item .delete-btn { opacity: 0; font-size: 16px; padding: 0 4px; cursor: pointer; background: none; border: none; color: inherit; }
.session-item:hover .delete-btn { opacity: 0.6; }
#overlay {
  display: none;
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.3);
  z-index: 99;
}
#overlay.show { display: block; }

/* Main chat area */
#main {
  flex: 1;
  display: flex;
  flex-direction: column;
  height: 100dvh;
  width: 100%;
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
#menu-btn {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: var(--text);
  padding: 4px;
}
#header .dot {
  width: 10px; height: 10px; border-radius: 50%;
  background: #4caf50;
  flex-shrink: 0;
}
#header .dot.offline { background: #f44336; }
#header .dot.thinking { background: #ff9800; animation: pulse 1s infinite; }
@keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.4; } }
#header h1 { font-size: 16px; font-weight: 600; flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
#header .status { font-size: 12px; color: var(--text-muted); }
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
  max-width: 100%;
  margin: 8px 0;
  font-size: 13px;
  line-height: 1.4;
  -webkit-overflow-scrolling: touch;
}
.msg pre code { white-space: pre; }
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
.msg .table-wrapper { overflow-x: auto; -webkit-overflow-scrolling: touch; margin: 8px 0; }
.msg table { border-collapse: collapse; font-size: 13px; white-space: nowrap; }
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
#send.abort { background: #e53935; }

/* Settings panel */
#settings-panel {
  display: none;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: var(--chat-bg);
  border-top: 1px solid var(--input-border);
  border-radius: 16px 16px 0 0;
  padding: 20px 16px;
  padding-bottom: calc(20px + var(--safe-bottom));
  z-index: 150;
  box-shadow: 0 -4px 20px rgba(0,0,0,0.15);
}
#settings-panel.open { display: block; }
#settings-panel h3 { font-size: 15px; margin-bottom: 16px; }
.setting-group { margin-bottom: 16px; }
.setting-group label { font-size: 13px; color: var(--text-muted); display: block; margin-bottom: 6px; }
.setting-group select {
  width: 100%;
  padding: 10px 12px;
  border-radius: 10px;
  border: 1px solid var(--input-border);
  background: var(--input-bg);
  color: var(--text);
  font-size: 14px;
  appearance: none;
}
#settings-save {
  width: 100%;
  padding: 12px;
  border-radius: 10px;
  border: none;
  background: var(--user-bubble);
  color: #fff;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
}
#settings-overlay {
  display: none;
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.3);
  z-index: 149;
}
#settings-overlay.open { display: block; }
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
#empty-state {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-muted);
  font-size: 15px;
  text-align: center;
  padding: 20px;
}

/* Sidebar tabs */
#sidebar-tabs {
  display: flex;
  border-bottom: 1px solid var(--input-border);
}
.sidebar-tab {
  flex: 1;
  padding: 10px;
  text-align: center;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  border: none;
  background: none;
  color: var(--text-muted);
  border-bottom: 2px solid transparent;
}
.sidebar-tab.active {
  color: var(--user-bubble);
  border-bottom-color: var(--user-bubble);
}
#files-panel { display: none; flex: 1; overflow-y: auto; }
#files-panel.active { display: flex; flex-direction: column; }
#session-list { flex: 1; overflow-y: auto; padding: 8px; display: none; }
#session-list.active { display: block; }

/* File browser */
#file-breadcrumb {
  padding: 8px 12px;
  font-size: 12px;
  color: var(--text-muted);
  border-bottom: 1px solid var(--input-border);
  display: flex;
  align-items: center;
  gap: 4px;
  flex-wrap: wrap;
}
#file-breadcrumb span { cursor: pointer; }
#file-breadcrumb span:hover { color: var(--user-bubble); }
#file-entries { flex: 1; overflow-y: auto; padding: 4px 8px; }
.file-entry {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 8px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
}
.file-entry:hover { background: var(--input-border); }
.file-entry .icon { font-size: 16px; width: 20px; text-align: center; flex-shrink: 0; }
.file-entry .name { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.file-entry .meta { font-size: 11px; color: var(--text-muted); }
.file-entry .copy-btn {
  opacity: 0;
  background: none;
  border: none;
  color: var(--text-muted);
  font-size: 14px;
  cursor: pointer;
  padding: 2px 6px;
}
.file-entry:hover .copy-btn { opacity: 1; }

/* File viewer modal */
#file-viewer {
  display: none;
  position: fixed;
  inset: 0;
  z-index: 200;
  background: var(--bg);
  flex-direction: column;
}
#file-viewer.open { display: flex; }
#file-viewer-header {
  padding: 12px 16px;
  padding-top: calc(12px + env(safe-area-inset-top, 0px));
  background: var(--chat-bg);
  border-bottom: 1px solid var(--input-border);
  display: flex;
  align-items: center;
  gap: 10px;
}
#file-viewer-header .back-btn {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: var(--text);
}
#file-viewer-header .filename {
  flex: 1;
  font-size: 14px;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
#file-viewer-header .copy-path-btn {
  background: var(--assistant-bubble);
  border: none;
  border-radius: 6px;
  padding: 4px 10px;
  font-size: 12px;
  cursor: pointer;
  color: var(--text);
}
#file-content {
  flex: 1;
  overflow: auto;
  padding: 12px;
  -webkit-overflow-scrolling: touch;
}
#file-content pre {
  margin: 0;
  font-family: 'SF Mono', 'Fira Code', monospace;
  font-size: 12px;
  line-height: 1.5;
  white-space: pre-wrap;
  word-break: break-all;
}
</style>
</head>
<body>
<div id="overlay" onclick="toggleSidebar()"></div>
<div id="sidebar">
  <div id="sidebar-header">
    <h2>Claude Mobile</h2>
    <button id="new-chat-btn" onclick="newSession()">+ New</button>
  </div>
  <div id="sidebar-tabs">
    <button class="sidebar-tab active" onclick="switchTab('chats')">Chats</button>
    <button class="sidebar-tab" onclick="switchTab('files')">Files</button>
  </div>
  <div id="session-list" class="active"></div>
  <div id="files-panel">
    <div id="file-breadcrumb"></div>
    <div id="file-entries"></div>
  </div>
</div>
<div id="main">
  <div id="header">
    <button id="menu-btn" onclick="toggleSidebar()">☰</button>
    <div class="dot" id="dot"></div>
    <h1 id="title">Claude Code</h1>
    <span class="status" id="status">connecting...</span>
    <button id="settings-btn" onclick="toggleSettings()" style="background:none;border:none;font-size:18px;cursor:pointer;color:var(--text)">⚙</button>
  </div>
  <div id="messages">
    <div id="empty-state">Select or create a session to start</div>
    <div class="typing" id="typing"><span></span><span></span><span></span></div>
  </div>
  <div id="input-area">
    <textarea id="input" rows="1" placeholder="Message Claude..." autocomplete="off"></textarea>
    <button id="send" disabled>↑</button>
  </div>
</div>

<div id="settings-overlay" onclick="toggleSettings()"></div>
<div id="settings-panel">
  <h3>Session Settings</h3>
  <div class="setting-group">
    <label>Model</label>
    <select id="model-select">
      <option value="sonnet">Sonnet (fast)</option>
      <option value="opus">Opus (powerful)</option>
      <option value="haiku">Haiku (fastest)</option>
      <option value="claude-opus-4-6">claude-opus-4-6</option>
      <option value="claude-sonnet-4-6">claude-sonnet-4-6</option>
    </select>
  </div>
  <div class="setting-group">
    <label>Permission Mode</label>
    <select id="mode-select">
      <option value="auto">Auto</option>
      <option value="bypassPermissions">Bypass Permissions</option>
      <option value="plan">Plan Mode</option>
      <option value="default">Default (ask)</option>
    </select>
  </div>
  <button id="settings-save" onclick="saveSettings()">Save</button>
</div>

<div id="file-viewer">
  <div id="file-viewer-header">
    <button class="back-btn" onclick="closeFileViewer()">←</button>
    <span class="filename" id="viewer-filename"></span>
    <button class="copy-path-btn" onclick="copyViewerPath()">Copy Path</button>
  </div>
  <div id="file-content"><pre><code id="file-code"></code></pre></div>
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
const title = document.getElementById('title')
const emptyState = document.getElementById('empty-state')
const sessionList = document.getElementById('session-list')
const sidebar = document.getElementById('sidebar')
const overlay = document.getElementById('overlay')

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
let currentSessionId = null
let sessions = []
let isThinking = false
let userAtBottom = true

function toggleSidebar() {
  sidebar.classList.toggle('open')
  overlay.classList.toggle('show')
}

// --- Session Management ---

async function loadSessions() {
  const res = await fetch('/api/sessions')
  sessions = await res.json()
  renderChatsList()
}

let macSessions = []

async function renderChatsList() {
  // Render local sessions first
  let html = ''
  if (sessions.length > 0) {
    html += '<div style="padding:6px 8px;font-size:11px;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.5px">Active</div>'
    html += sessions.map(s => {
      const active = s.id === currentSessionId ? ' active' : ''
      const time = new Date(s.lastActiveAt).toLocaleDateString()
      return '<div class="session-item' + active + '" onclick="switchSession(\\'' + s.id + '\\')">' +
        '<span class="name">' + escapeHtml(s.name) + '</span>' +
        '<span class="time">' + time + '</span>' +
        '<button class="delete-btn" onclick="event.stopPropagation();renameSessionUI(\\'' + s.id + '\\')" style="font-size:12px">✎</button>' +
        '<button class="delete-btn" onclick="event.stopPropagation();deleteSessionUI(\\'' + s.id + '\\')">&times;</button>' +
        '</div>'
    }).join('')
  }

  // Load and render Mac sessions
  html += '<div style="padding:6px 8px;margin-top:8px;font-size:11px;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.5px">Mac Sessions (tap to resume)</div>'
  sessionList.innerHTML = html + '<div style="padding:12px;color:var(--text-muted);font-size:12px">Loading...</div>'

  try {
    const res = await fetch('/api/claude-sessions')
    macSessions = await res.json()
  } catch { macSessions = [] }

  html += macSessions.map(s => {
    const preview = s.firstMessage || '(empty)'
    const time = timeAgo(s.startedAt)
    return '<div class="session-item" style="flex-direction:column;align-items:flex-start;gap:2px;padding:10px 12px" onclick="quickResume(\\'' + s.sessionId + '\\', \\'' + escapeHtml(preview).replace(/'/g, '') + '\\')">' +
      '<div style="display:flex;width:100%;justify-content:space-between;align-items:center">' +
        '<span style="font-size:12px;color:var(--text-muted)">' + s.messageCount + ' msgs · ' + time + '</span>' +
      '</div>' +
      '<div style="font-size:13px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;width:100%">' + escapeHtml(preview) + '</div>' +
      '</div>'
  }).join('')

  sessionList.innerHTML = html
}

function timeAgo(ts) {
  const diff = Date.now() - ts
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return mins + 'm ago'
  const hours = Math.floor(mins / 60)
  if (hours < 24) return hours + 'h ago'
  const days = Math.floor(hours / 24)
  return days + 'd ago'
}

async function quickResume(claudeSessionId, preview) {
  const name = preview.slice(0, 40) || 'Resumed session'
  const res = await fetch('/api/sessions', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ name })
  })
  const session = await res.json()
  await fetch('/api/sessions/' + session.id, {
    method: 'PATCH',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ claudeSessionId })
  })
  session.claudeSessionId = claudeSessionId
  sessions.unshift(session)
  switchSession(session.id)
  toggleSidebar()
}

async function renameSessionUI(id) {
  const session = sessions.find(s => s.id === id)
  if (!session) return
  const name = prompt('Rename session:', session.name)
  if (!name || name === session.name) return
  await fetch('/api/sessions/' + id, {
    method: 'PATCH',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ name })
  })
  session.name = name
  renderChatsList()
  if (id === currentSessionId) title.textContent = name
}

async function newSession() {
  const name = prompt('Session name:', 'Chat ' + new Date().toLocaleTimeString())
  if (!name) return
  const res = await fetch('/api/sessions', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ name }) })
  const session = await res.json()
  sessions.unshift(session)
  switchSession(session.id)
  toggleSidebar()
}

async function deleteSessionUI(id) {
  if (!confirm('Delete this session?')) return
  await fetch('/api/sessions/' + id, { method: 'DELETE' })
  sessions = sessions.filter(s => s.id !== id)
  if (currentSessionId === id) {
    currentSessionId = null
    clearMessages()
    title.textContent = 'Claude Code'
    emptyState.style.display = 'flex'
  }
  renderChatsList()
}

function switchSession(id) {
  currentSessionId = id
  const session = sessions.find(s => s.id === id)
  if (session) title.textContent = session.name
  emptyState.style.display = 'none'
  clearMessages()
  renderChatsList()
  if (ws && ws.readyState === 1) {
    ws.send(JSON.stringify({ type: 'switch_session', sessionId: id }))
  }
  if (sidebar.classList.contains('open')) toggleSidebar()
}

function clearMessages() {
  const items = messages.querySelectorAll('[data-id]')
  items.forEach(el => el.remove())
}

// --- WebSocket ---

function connect() {
  const sessionParam = currentSessionId ? '&session=' + currentSessionId : ''
  ws = new WebSocket(proto + '//' + location.host + '/ws?token=' + token + sessionParam)
  ws.onopen = () => {
    dot.className = 'dot'
    status.textContent = 'connected'
    sendBtn.disabled = !input.value.trim()
  }
  ws.onclose = () => {
    dot.className = 'dot offline'
    status.textContent = 'reconnecting...'
    sendBtn.disabled = true
    setTimeout(connect, 2000)
  }
  ws.onmessage = e => {
    const data = JSON.parse(e.data)
    if (data.type === 'history') {
      clearMessages()
      if (data.messages.length > 0) emptyState.style.display = 'none'
      data.messages.forEach(m => addMessage(m, false))
      scrollBottom()
    } else if (data.type === 'msg') {
      emptyState.style.display = 'none'
      addMessage(data, true)
    } else if (data.type === 'delta') {
      const el = document.querySelector('[data-id="' + data.id + '"] .content')
      if (el) { el.innerHTML = render(data.text); if (userAtBottom) scrollBottom() }
    } else if (data.type === 'complete') {
      const el = document.querySelector('[data-id="' + data.id + '"] .content')
      if (el) { el.innerHTML = render(data.text); if (userAtBottom) scrollBottom() }
    } else if (data.type === 'edit') {
      const el = document.querySelector('[data-id="' + data.id + '"] .content')
      if (el) { el.innerHTML = render(data.text); if (userAtBottom) scrollBottom() }
    } else if (data.type === 'status') {
      if (data.status === 'thinking') {
        isThinking = true
        typing.style.display = 'block'
        dot.className = 'dot thinking'
        status.textContent = 'thinking...'
        sendBtn.textContent = '■'
        sendBtn.classList.add('abort')
        sendBtn.disabled = false
        scrollBottom()
      } else {
        isThinking = false
        typing.style.display = 'none'
        dot.className = 'dot'
        status.textContent = 'connected'
        sendBtn.textContent = '↑'
        sendBtn.classList.remove('abort')
        autoResize()
      }
    }
  }
}
connect()

// --- Messages ---

function render(text) {
  try {
    let html = marked.parse(text)
    html = html.replace(/<table>/g, '<div class="table-wrapper"><table>').replace(/<\\/table>/g, '</table></div>')
    return html
  } catch { return escapeHtml(text) }
}

function addMessage(m, animate) {
  if (document.querySelector('[data-id="' + m.id + '"]')) return
  const wrapper = document.createElement('div')
  wrapper.dataset.id = m.id
  const bubble = document.createElement('div')
  bubble.className = 'msg ' + m.from
  const content = document.createElement('div')
  content.className = 'content'
  content.innerHTML = m.from === 'assistant' ? render(m.text) : escapeHtml(m.text).replace(/\\n/g, '<br>')
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
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
}

function formatTime(ts) {
  return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

function scrollBottom() {
  requestAnimationFrame(() => messages.scrollTop = messages.scrollHeight)
}

// --- Input ---

function send() {
  if (!ws || ws.readyState !== 1 || !currentSessionId) return

  // Abort if thinking
  if (isThinking) {
    ws.send(JSON.stringify({ type: 'abort' }))
    status.textContent = 'stopping...'
    return
  }

  const text = input.value.trim()
  if (!text) return
  const id = 'u' + Date.now() + '-' + (++uid)
  ws.send(JSON.stringify({ id, text }))
  addMessage({ id, from: 'user', text, ts: Date.now() }, true)
  input.value = ''
  autoResize()
  emptyState.style.display = 'none'
}

sendBtn.onclick = send
input.addEventListener('keydown', e => {
  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() }
})
input.addEventListener('input', autoResize)

function autoResize() {
  input.style.height = 'auto'
  input.style.height = Math.min(input.scrollHeight, 120) + 'px'
  sendBtn.disabled = !input.value.trim() || !ws || ws.readyState !== 1 || !currentSessionId
}

// --- Scroll detection ---
messages.addEventListener('scroll', () => {
  userAtBottom = messages.scrollHeight - messages.scrollTop - messages.clientHeight < 50
})

// --- Settings ---

function toggleSettings() {
  const panel = document.getElementById('settings-panel')
  const overlay = document.getElementById('settings-overlay')
  const isOpen = panel.classList.contains('open')
  panel.classList.toggle('open')
  overlay.classList.toggle('open')
  if (!isOpen && currentSessionId) {
    const session = sessions.find(s => s.id === currentSessionId)
    if (session) {
      document.getElementById('model-select').value = session.model || 'sonnet'
      document.getElementById('mode-select').value = session.permissionMode || 'auto'
    }
  }
}

async function saveSettings() {
  if (!currentSessionId) return
  const model = document.getElementById('model-select').value
  const permissionMode = document.getElementById('mode-select').value
  await fetch('/api/sessions/' + currentSessionId, {
    method: 'PATCH',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ model, permissionMode })
  })
  const session = sessions.find(s => s.id === currentSessionId)
  if (session) { session.model = model; session.permissionMode = permissionMode }
  toggleSettings()
  status.textContent = model + ' / ' + permissionMode
}

// --- Sidebar Tabs ---

function switchTab(tab) {
  document.querySelectorAll('.sidebar-tab').forEach(t => t.classList.remove('active'))
  const idx = tab === 'chats' ? 1 : 2
  document.querySelector('.sidebar-tab:nth-child(' + idx + ')').classList.add('active')
  document.getElementById('session-list').classList.toggle('active', tab === 'chats')
  document.getElementById('files-panel').classList.toggle('active', tab === 'files')
  if (tab === 'files') loadFiles('')
  if (tab === 'chats') renderChatsList()
}

// --- File Browser ---

let currentFilePath = ''
const fileEntries = document.getElementById('file-entries')
const fileBreadcrumb = document.getElementById('file-breadcrumb')
const fileViewer = document.getElementById('file-viewer')
const viewerFilename = document.getElementById('viewer-filename')
const fileCode = document.getElementById('file-code')

const FILE_ICONS = {
  dir: '📁',
  ts: '🟦', tsx: '🟦', js: '🟨', jsx: '🟨',
  py: '🐍', java: '☕', go: '🔵',
  json: '📋', yaml: '📋', yml: '📋', toml: '📋',
  md: '📝', txt: '📄',
  sh: '⚙️', bash: '⚙️', zsh: '⚙️',
  html: '🌐', css: '🎨', svg: '🖼️',
  sql: '🗃️', proto: '📐',
  default: '📄'
}

function getIcon(entry) {
  if (entry.type === 'dir') return FILE_ICONS.dir
  return FILE_ICONS[entry.ext] || FILE_ICONS.default
}

function formatSize(bytes) {
  if (!bytes) return ''
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / 1024 / 1024).toFixed(1) + ' MB'
}

async function loadFiles(path) {
  currentFilePath = path
  try {
    const res = await fetch('/api/files?path=' + encodeURIComponent(path))
    const data = await res.json()
    if (data.error) { fileEntries.innerHTML = '<div style="padding:16px;color:var(--text-muted)">' + data.error + '</div>'; return }
    if (data.type === 'dir') {
      renderBreadcrumb(path)
      renderEntries(data.entries)
    } else if (data.type === 'file') {
      openFileViewer(path, data)
    }
  } catch (e) {
    fileEntries.innerHTML = '<div style="padding:16px;color:var(--text-muted)">Error loading files</div>'
  }
}

function renderBreadcrumb(path) {
  const parts = path ? path.split('/') : []
  let html = '<span onclick="loadFiles(\\'\\')">~</span>'
  let accumulated = ''
  for (const part of parts) {
    accumulated += (accumulated ? '/' : '') + part
    const p = accumulated
    html += ' / <span onclick="loadFiles(\\'' + p + '\\')">' + part + '</span>'
  }
  fileBreadcrumb.innerHTML = html
}

function renderEntries(entries) {
  fileEntries.innerHTML = entries.map(e => {
    const icon = getIcon(e)
    const meta = e.type === 'file' ? formatSize(e.size) : ''
    return '<div class="file-entry" onclick="' + (e.type === 'dir' ? "loadFiles('" + e.path + "')" : "loadFiles('" + e.path + "')") + '">' +
      '<span class="icon">' + icon + '</span>' +
      '<span class="name">' + escapeHtml(e.name) + '</span>' +
      '<span class="meta">' + meta + '</span>' +
      '<button class="copy-btn" onclick="event.stopPropagation();copyPath(\\'' + e.path + '\\')">📋</button>' +
      '</div>'
  }).join('')
}

function openFileViewer(path, data) {
  if (data.tooLarge) {
    alert('File too large (' + formatSize(data.size) + '). Max 512KB.')
    return
  }
  viewerFilename.textContent = path.split('/').pop()
  fileViewer.dataset.path = path
  const ext = data.ext || ''
  if (ext && hljs.getLanguage(ext)) {
    fileCode.innerHTML = hljs.highlight(data.content, { language: ext }).value
  } else {
    fileCode.textContent = data.content
  }
  fileViewer.classList.add('open')
}

function closeFileViewer() {
  fileViewer.classList.remove('open')
}

function copyViewerPath() {
  const path = fileViewer.dataset.path
  copyToClipboard(path, document.querySelector('.copy-path-btn'))
}

function copyPath(path) {
  copyToClipboard(path)
}

function copyToClipboard(text, btn) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(() => showCopyToast(text, btn))
  } else {
    // Fallback for iOS Safari
    const ta = document.createElement('textarea')
    ta.value = text
    ta.style.position = 'fixed'
    ta.style.left = '-9999px'
    document.body.appendChild(ta)
    ta.select()
    document.execCommand('copy')
    document.body.removeChild(ta)
    showCopyToast(text, btn)
  }
}

function showCopyToast(text, btn) {
  if (btn) {
    const orig = btn.textContent
    btn.textContent = 'Copied!'
    setTimeout(() => btn.textContent = orig, 1500)
  }
  // Toast notification
  const toast = document.createElement('div')
  toast.textContent = 'Copied: ' + text
  toast.style.cssText = 'position:fixed;bottom:80px;left:50%;transform:translateX(-50%);background:var(--assistant-bubble);color:var(--text);padding:8px 16px;border-radius:20px;font-size:13px;z-index:999;opacity:0;transition:opacity 0.3s;max-width:80%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap'
  document.body.appendChild(toast)
  requestAnimationFrame(() => toast.style.opacity = '1')
  setTimeout(() => { toast.style.opacity = '0'; setTimeout(() => toast.remove(), 300) }, 2000)
}

// Init
loadSessions()
</script>
</body>
</html>`
