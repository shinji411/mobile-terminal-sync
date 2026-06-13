export const MANIFEST = JSON.stringify({
  name: 'Pocket Claude',
  short_name: 'Pocket',
  start_url: '/',
  display: 'standalone',
  background_color: '#1a1a2e',
  theme_color: '#d4a574',
  icons: [{ src: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect x="15" y="25" width="70" height="60" rx="12" fill="%23d4a574"/><path d="M15 45 h70" stroke="%23fff" stroke-width="3" fill="none"/><rect x="35" y="35" width="30" height="15" rx="4" fill="%23fff" opacity="0.6"/></svg>', sizes: 'any', type: 'image/svg+xml' }],
})

export const HTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<title>Pocket Claude</title>
<link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect x='15' y='25' width='70' height='60' rx='12' fill='%23d4a574'/><path d='M15 45 h70' stroke='%23fff' stroke-width='3' fill='none'/><rect x='35' y='35' width='30' height='15' rx='4' fill='%23fff' opacity='0.6'/></svg>">
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
  position: relative;
}
.session-item:hover { background: var(--input-border); }
.session-item.active { background: var(--user-bubble); color: #fff; }
.session-item .name { font-size: 14px; font-weight: 500; flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.session-item .time { font-size: 11px; opacity: 0.6; }
.session-swipe {
  position: relative;
  overflow: hidden;
  border-radius: 10px;
  margin-bottom: 4px;
}
.session-swipe .swipe-actions {
  position: absolute;
  right: 8px;
  top: 4px;
  bottom: 4px;
  display: flex;
  align-items: center;
  gap: 6px;
}
.session-swipe .swipe-actions button {
  padding: 6px 12px;
  border: none;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  height: 100%;
}
.session-swipe .swipe-actions .resume-btn { background: var(--user-bubble); color: #fff; }
.session-swipe .swipe-actions .delete-btn { background: #e53935; color: #fff; }
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
#header h1 { font-size: 16px; font-weight: 600; flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; cursor: default; }
#header h1.renameable { text-decoration: underline dashed var(--text-muted); text-underline-offset: 3px; cursor: pointer; }
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
.code-block-wrapper { position: relative; }
.copy-code-btn, .copy-table-btn {
  position: absolute;
  top: 6px;
  right: 6px;
  background: var(--input-border);
  border: none;
  border-radius: 4px;
  padding: 3px 8px;
  font-size: 11px;
  color: var(--text-muted);
  cursor: pointer;
  opacity: 0.7;
  z-index: 1;
}
.copy-code-btn:active, .copy-table-btn:active { opacity: 1; background: var(--user-bubble); color: #fff; }
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
.diff-add { display: block; background: rgba(46,160,67,0.25); color: #3fb950; min-width: max-content; }
.diff-del { display: block; background: rgba(248,81,73,0.25); color: #f85149; min-width: max-content; }
@media (prefers-color-scheme: light) {
  .diff-add { background: rgba(46,160,67,0.15); color: #1a7f37; }
  .diff-del { background: rgba(248,81,73,0.15); color: #cf222e; }
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

/* Transient error notice (WS type:'error') — centered, red, not part of history */
.error-notice {
  align-self: center;
  max-width: 90%;
  padding: 8px 14px;
  border-radius: 12px;
  font-size: 13px;
  line-height: 1.4;
  text-align: center;
  word-break: break-word;
  background: rgba(248,81,73,0.12);
  color: #cf222e;
  border: 1px solid rgba(248,81,73,0.35);
  animation: fadeIn 0.2s ease;
}
@media (prefers-color-scheme: dark) {
  .error-notice { color: #f85149; background: rgba(248,81,73,0.14); border-color: rgba(248,81,73,0.4); }
}

/* Transient neutral/positive notice (WS type:'notice') — centered, green, not part of history */
.info-notice {
  align-self: center;
  max-width: 90%;
  padding: 8px 14px;
  border-radius: 12px;
  font-size: 13px;
  line-height: 1.4;
  text-align: center;
  word-break: break-word;
  background: rgba(46,160,67,0.12);
  color: #1a7f37;
  border: 1px solid rgba(46,160,67,0.35);
  animation: fadeIn 0.2s ease;
}
@media (prefers-color-scheme: dark) {
  .info-notice { color: #3fb950; background: rgba(46,160,67,0.14); border-color: rgba(46,160,67,0.4); }
}

/* Select mode */
body.select-mode #header { background: var(--user-bubble); }
body.select-mode #header h1, body.select-mode #header .status, body.select-mode #header #menu-btn, body.select-mode #header #settings-btn { color: #fff; }
body.select-mode .msg { opacity: 0.6; cursor: pointer; }
body.select-mode [data-id].selected .msg { opacity: 1; outline: 2px solid var(--user-bubble); outline-offset: 2px; }
#select-bar {
  display: none;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 12px 16px;
  padding-bottom: calc(12px + var(--safe-bottom));
  background: var(--chat-bg);
  border-top: 1px solid var(--input-border);
  z-index: 50;
  gap: 8px;
}
body.select-mode #select-bar { display: flex; }
body.select-mode #input-area { display: none; }
.action-popup {
  background: var(--bg);
  border: 1px solid var(--input-border);
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.15);
  display: flex;
  gap: 2px;
  padding: 4px;
  opacity: 0;
  transform: scale(0.9);
  transition: opacity 0.15s ease, transform 0.15s ease;
}
.action-popup.visible { opacity: 1; transform: scale(1); }
.action-popup button {
  padding: 8px 12px;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: var(--text);
  font-size: 13px;
  cursor: pointer;
  white-space: nowrap;
}
.action-popup button:active { background: var(--input-border); }
#select-bar button {
  flex: 1;
  padding: 12px;
  border-radius: 10px;
  border: none;
  font-size: 14px;
  cursor: pointer;
}
#select-bar .copy-btn { background: var(--user-bubble); color: #fff; }
#select-bar .cancel-btn { background: var(--input-border); color: var(--text); }

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
    <h2>Pocket Claude</h2>
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
    <h1 id="title" onclick="renameFromTitle()">Pocket Claude</h1>
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
  <div id="select-bar">
    <button class="cancel-btn" onclick="exitSelectMode()">Cancel</button>
    <button class="copy-btn" onclick="copySelected()">Copy Selected</button>
  </div>
</div>

<div id="settings-overlay" onclick="toggleSettings()"></div>
<div id="settings-panel">
  <h3>Session Settings</h3>
  <div class="setting-group">
    <label>Model</label>
    <select id="model-select">
      <option value="fable">Fable 5 (best)</option>
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
      <option value="bypassPermissions">Bypass (full auto, like tom.cmd)</option>
      <option value="auto">Auto</option>
      <option value="acceptEdits">Accept Edits</option>
      <option value="plan">Plan Mode</option>
      <option value="default">Default (ask)</option>
    </select>
  </div>
  <button id="settings-save" onclick="saveSettings()">Save</button>
  <button onclick="compactSession()" style="width:100%;padding:12px;border-radius:10px;border:1px solid var(--input-border);background:none;color:var(--text);font-size:15px;cursor:pointer;margin-top:8px">Compact Context</button>
</div>

<div id="file-viewer">
  <div id="file-viewer-header">
    <button class="back-btn" onclick="closeFileViewer()">←</button>
    <span class="filename" id="viewer-filename"></span>
    <button class="copy-path-btn" onclick="copyViewerPath()">Copy Path</button>
  </div>
  <div id="file-content"><pre><code id="file-code"></code></pre></div>
</div>

<!-- Vendored libraries (base64-inlined; no CDN dependency, eliminates supply-chain MITM/poisoning risk).
     Decoded and executed synchronously before the main script. Base64 is template-literal-safe. -->
<script>
(function(){
  function b64ToStr(b64){
    var bin = atob(b64);
    var bytes = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return new TextDecoder('utf-8').decode(bytes);
  }
  var LIBS = {
    marked: 'LyoqCiAqIG1hcmtlZCB2MTUuMC4xMiAtIGEgbWFya2Rvd24gcGFyc2VyCiAqIENvcHlyaWdodCAoYykgMjAxMS0yMDI1LCBDaHJpc3RvcGhlciBKZWZmcmV5LiAoTUlUIExpY2Vuc2VkKQogKiBodHRwczovL2dpdGh1Yi5jb20vbWFya2VkanMvbWFya2VkCiAqLwoKLyoqCiAqIERPIE5PVCBFRElUIFRISVMgRklMRQogKiBUaGUgY29kZSBpbiB0aGlzIGZpbGUgaXMgZ2VuZXJhdGVkIGZyb20gZmlsZXMgaW4gLi9zcmMvCiAqLwooZnVuY3Rpb24oZyxmKXtpZih0eXBlb2YgZXhwb3J0cz09Im9iamVjdCImJnR5cGVvZiBtb2R1bGU8InUiKXttb2R1bGUuZXhwb3J0cz1mKCl9ZWxzZSBpZigiZnVuY3Rpb24iPT10eXBlb2YgZGVmaW5lICYmIGRlZmluZS5hbWQpe2RlZmluZSgibWFya2VkIixmKX1lbHNlIHtnWyJtYXJrZWQiXT1mKCl9fSh0eXBlb2YgZ2xvYmFsVGhpcyA8ICJ1IiA/IGdsb2JhbFRoaXMgOiB0eXBlb2Ygc2VsZiA8ICJ1IiA/IHNlbGYgOiB0aGlzLGZ1bmN0aW9uKCl7dmFyIGV4cG9ydHM9e307dmFyIF9fZXhwb3J0cz1leHBvcnRzO3ZhciBtb2R1bGU9e2V4cG9ydHN9OwoidXNlIHN0cmljdCI7dmFyIEg9T2JqZWN0LmRlZmluZVByb3BlcnR5O3ZhciBiZT1PYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yO3ZhciBUZT1PYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lczt2YXIgd2U9T2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eTt2YXIgeWU9KGwsZSk9Pntmb3IodmFyIHQgaW4gZSlIKGwsdCx7Z2V0OmVbdF0sZW51bWVyYWJsZTohMH0pfSxSZT0obCxlLHQsbik9PntpZihlJiZ0eXBlb2YgZT09Im9iamVjdCJ8fHR5cGVvZiBlPT0iZnVuY3Rpb24iKWZvcihsZXQgcyBvZiBUZShlKSkhd2UuY2FsbChsLHMpJiZzIT09dCYmSChsLHMse2dldDooKT0+ZVtzXSxlbnVtZXJhYmxlOiEobj1iZShlLHMpKXx8bi5lbnVtZXJhYmxlfSk7cmV0dXJuIGx9O3ZhciBTZT1sPT5SZShIKHt9LCJfX2VzTW9kdWxlIix7dmFsdWU6ITB9KSxsKTt2YXIga3Q9e307eWUoa3Qse0hvb2tzOigpPT5MLExleGVyOigpPT54LE1hcmtlZDooKT0+RSxQYXJzZXI6KCk9PmIsUmVuZGVyZXI6KCk9PiQsVGV4dFJlbmRlcmVyOigpPT5fLFRva2VuaXplcjooKT0+UyxkZWZhdWx0czooKT0+dyxnZXREZWZhdWx0czooKT0+eixsZXhlcjooKT0+aHQsbWFya2VkOigpPT5rLG9wdGlvbnM6KCk9Pml0LHBhcnNlOigpPT5wdCxwYXJzZUlubGluZTooKT0+Y3QscGFyc2VyOigpPT51dCxzZXRPcHRpb25zOigpPT5vdCx1c2U6KCk9Pmx0LHdhbGtUb2tlbnM6KCk9PmF0fSk7bW9kdWxlLmV4cG9ydHM9U2Uoa3QpO2Z1bmN0aW9uIHooKXtyZXR1cm57YXN5bmM6ITEsYnJlYWtzOiExLGV4dGVuc2lvbnM6bnVsbCxnZm06ITAsaG9va3M6bnVsbCxwZWRhbnRpYzohMSxyZW5kZXJlcjpudWxsLHNpbGVudDohMSx0b2tlbml6ZXI6bnVsbCx3YWxrVG9rZW5zOm51bGx9fXZhciB3PXooKTtmdW5jdGlvbiBOKGwpe3c9bH12YXIgST17ZXhlYzooKT0+bnVsbH07ZnVuY3Rpb24gaChsLGU9IiIpe2xldCB0PXR5cGVvZiBsPT0ic3RyaW5nIj9sOmwuc291cmNlLG49e3JlcGxhY2U6KHMsaSk9PntsZXQgcj10eXBlb2YgaT09InN0cmluZyI/aTppLnNvdXJjZTtyZXR1cm4gcj1yLnJlcGxhY2UobS5jYXJldCwiJDEiKSx0PXQucmVwbGFjZShzLHIpLG59LGdldFJlZ2V4OigpPT5uZXcgUmVnRXhwKHQsZSl9O3JldHVybiBufXZhciBtPXtjb2RlUmVtb3ZlSW5kZW50Oi9eKD86IHsxLDR9fCB7MCwzfVx0KS9nbSxvdXRwdXRMaW5rUmVwbGFjZTovXFwoW1xbXF1dKS9nLGluZGVudENvZGVDb21wZW5zYXRpb246L14oXHMrKSg/OmBgYCkvLGJlZ2lubmluZ1NwYWNlOi9eXHMrLyxlbmRpbmdIYXNoOi8jJC8sc3RhcnRpbmdTcGFjZUNoYXI6L14gLyxlbmRpbmdTcGFjZUNoYXI6LyAkLyxub25TcGFjZUNoYXI6L1teIF0vLG5ld0xpbmVDaGFyR2xvYmFsOi9cbi9nLHRhYkNoYXJHbG9iYWw6L1x0L2csbXVsdGlwbGVTcGFjZUdsb2JhbDovXHMrL2csYmxhbmtMaW5lOi9eWyBcdF0qJC8sZG91YmxlQmxhbmtMaW5lOi9cblsgXHRdKlxuWyBcdF0qJC8sYmxvY2txdW90ZVN0YXJ0Oi9eIHswLDN9Pi8sYmxvY2txdW90ZVNldGV4dFJlcGxhY2U6L1xuIHswLDN9KCg/Oj0rfC0rKSAqKSg/PVxufCQpL2csYmxvY2txdW90ZVNldGV4dFJlcGxhY2UyOi9eIHswLDN9PlsgXHRdPy9nbSxsaXN0UmVwbGFjZVRhYnM6L15cdCsvLGxpc3RSZXBsYWNlTmVzdGluZzovXiB7MSw0fSg/PSggezR9KSpbXiBdKS9nLGxpc3RJc1Rhc2s6L15cW1sgeFhdXF0gLyxsaXN0UmVwbGFjZVRhc2s6L15cW1sgeFhdXF0gKy8sYW55TGluZTovXG4uKlxuLyxocmVmQnJhY2tldHM6L148KC4qKT4kLyx0YWJsZURlbGltaXRlcjovWzp8XS8sdGFibGVBbGlnbkNoYXJzOi9eXHx8XHwgKiQvZyx0YWJsZVJvd0JsYW5rTGluZTovXG5bIFx0XSokLyx0YWJsZUFsaWduUmlnaHQ6L14gKi0rOiAqJC8sdGFibGVBbGlnbkNlbnRlcjovXiAqOi0rOiAqJC8sdGFibGVBbGlnbkxlZnQ6L14gKjotKyAqJC8sc3RhcnRBVGFnOi9ePGEgL2ksZW5kQVRhZzovXjxcL2E+L2ksc3RhcnRQcmVTY3JpcHRUYWc6L148KHByZXxjb2RlfGtiZHxzY3JpcHQpKFxzfD4pL2ksZW5kUHJlU2NyaXB0VGFnOi9ePFwvKHByZXxjb2RlfGtiZHxzY3JpcHQpKFxzfD4pL2ksc3RhcnRBbmdsZUJyYWNrZXQ6L148LyxlbmRBbmdsZUJyYWNrZXQ6Lz4kLyxwZWRhbnRpY0hyZWZUaXRsZTovXihbXiciXSpbXlxzXSlccysoWyciXSkoLiopXDIvLHVuaWNvZGVBbHBoYU51bWVyaWM6L1tccHtMfVxwe059XS91LGVzY2FwZVRlc3Q6L1smPD4iJ10vLGVzY2FwZVJlcGxhY2U6L1smPD4iJ10vZyxlc2NhcGVUZXN0Tm9FbmNvZGU6L1s8PiInXXwmKD8hKCNcZHsxLDd9fCNbWHhdW2EtZkEtRjAtOV17MSw2fXxcdyspOykvLGVzY2FwZVJlcGxhY2VOb0VuY29kZTovWzw+IiddfCYoPyEoI1xkezEsN318I1tYeF1bYS1mQS1GMC05XXsxLDZ9fFx3Kyk7KS9nLHVuZXNjYXBlVGVzdDovJigjKD86XGQrKXwoPzojeFswLTlBLUZhLWZdKyl8KD86XHcrKSk7Py9pZyxjYXJldDovKF58W15cW10pXF4vZyxwZXJjZW50RGVjb2RlOi8lMjUvZyxmaW5kUGlwZTovXHwvZyxzcGxpdFBpcGU6LyBcfC8sc2xhc2hQaXBlOi9cXFx8L2csY2FycmlhZ2VSZXR1cm46L1xyXG58XHIvZyxzcGFjZUxpbmU6L14gKyQvZ20sbm90U3BhY2VTdGFydDovXlxTKi8sZW5kaW5nTmV3bGluZTovXG4kLyxsaXN0SXRlbVJlZ2V4Omw9Pm5ldyBSZWdFeHAoYF4oIHswLDN9JHtsfSkoKD86WwkgXVteXFxuXSopPyg/OlxcbnwkKSlgKSxuZXh0QnVsbGV0UmVnZXg6bD0+bmV3IFJlZ0V4cChgXiB7MCwke01hdGgubWluKDMsbC0xKX19KD86WyorLV18XFxkezEsOX1bLildKSgoPzpbIAldW15cXG5dKik/KD86XFxufCQpKWApLGhyUmVnZXg6bD0+bmV3IFJlZ0V4cChgXiB7MCwke01hdGgubWluKDMsbC0xKX19KCg/Oi0gKil7Myx9fCg/Ol8gKil7Myx9fCg/OlxcKiAqKXszLH0pKD86XFxuK3wkKWApLGZlbmNlc0JlZ2luUmVnZXg6bD0+bmV3IFJlZ0V4cChgXiB7MCwke01hdGgubWluKDMsbC0xKX19KD86XGBcYFxgfH5+filgKSxoZWFkaW5nQmVnaW5SZWdleDpsPT5uZXcgUmVnRXhwKGBeIHswLCR7TWF0aC5taW4oMyxsLTEpfX0jYCksaHRtbEJlZ2luUmVnZXg6bD0+bmV3IFJlZ0V4cChgXiB7MCwke01hdGgubWluKDMsbC0xKX19PCg/OlthLXpdLio+fCEtLSlgLCJpIil9LCRlPS9eKD86WyBcdF0qKD86XG58JCkpKy8sX2U9L14oKD86IHs0fXwgezAsM31cdClbXlxuXSsoPzpcbig/OlsgXHRdKig/OlxufCQpKSopPykrLyxMZT0vXiB7MCwzfShgezMsfSg/PVteYFxuXSooPzpcbnwkKSl8fnszLH0pKFteXG5dKikoPzpcbnwkKSg/OnwoW1xzXFNdKj8pKD86XG58JCkpKD86IHswLDN9XDFbfmBdKiAqKD89XG58JCl8JCkvLE89L14gezAsM30oKD86LVtcdCBdKil7Myx9fCg/Ol9bIFx0XSopezMsfXwoPzpcKlsgXHRdKil7Myx9KSg/OlxuK3wkKS8semU9L14gezAsM30oI3sxLDZ9KSg/PVxzfCQpKC4qKSg/OlxuK3wkKS8sRj0vKD86WyorLV18XGR7MSw5fVsuKV0pLyxpZT0vXig/IWJ1bGwgfGJsb2NrQ29kZXxmZW5jZXN8YmxvY2txdW90ZXxoZWFkaW5nfGh0bWx8dGFibGUpKCg/Oi58XG4oPyFccyo/XG58YnVsbCB8YmxvY2tDb2RlfGZlbmNlc3xibG9ja3F1b3RlfGhlYWRpbmd8aHRtbHx0YWJsZSkpKz8pXG4gezAsM30oPSt8LSspICooPzpcbit8JCkvLG9lPWgoaWUpLnJlcGxhY2UoL2J1bGwvZyxGKS5yZXBsYWNlKC9ibG9ja0NvZGUvZywvKD86IHs0fXwgezAsM31cdCkvKS5yZXBsYWNlKC9mZW5jZXMvZywvIHswLDN9KD86YHszLH18fnszLH0pLykucmVwbGFjZSgvYmxvY2txdW90ZS9nLC8gezAsM30+LykucmVwbGFjZSgvaGVhZGluZy9nLC8gezAsM30jezEsNn0vKS5yZXBsYWNlKC9odG1sL2csLyB7MCwzfTxbXlxuPl0rPlxuLykucmVwbGFjZSgvXHx0YWJsZS9nLCIiKS5nZXRSZWdleCgpLE1lPWgoaWUpLnJlcGxhY2UoL2J1bGwvZyxGKS5yZXBsYWNlKC9ibG9ja0NvZGUvZywvKD86IHs0fXwgezAsM31cdCkvKS5yZXBsYWNlKC9mZW5jZXMvZywvIHswLDN9KD86YHszLH18fnszLH0pLykucmVwbGFjZSgvYmxvY2txdW90ZS9nLC8gezAsM30+LykucmVwbGFjZSgvaGVhZGluZy9nLC8gezAsM30jezEsNn0vKS5yZXBsYWNlKC9odG1sL2csLyB7MCwzfTxbXlxuPl0rPlxuLykucmVwbGFjZSgvdGFibGUvZywvIHswLDN9XHw/KD86WzpcLSBdKlx8KStbXDpcLSBdKlxuLykuZ2V0UmVnZXgoKSxRPS9eKFteXG5dKyg/OlxuKD8haHJ8aGVhZGluZ3xsaGVhZGluZ3xibG9ja3F1b3RlfGZlbmNlc3xsaXN0fGh0bWx8dGFibGV8ICtcbilbXlxuXSspKikvLFBlPS9eW15cbl0rLyxVPS8oPyFccypcXSkoPzpcXC58W15cW1xdXFxdKSsvLEFlPWgoL14gezAsM31cWyhsYWJlbClcXTogKig/OlxuWyBcdF0qKT8oW148XHNdW15cc10qfDwuKj8+KSg/Oig/OiArKD86XG5bIFx0XSopP3wgKlxuWyBcdF0qKSh0aXRsZSkpPyAqKD86XG4rfCQpLykucmVwbGFjZSgibGFiZWwiLFUpLnJlcGxhY2UoInRpdGxlIiwvKD86Iig/OlxcIj98W14iXFxdKSoifCdbXidcbl0qKD86XG5bXidcbl0rKSpcbj8nfFwoW14oKV0qXCkpLykuZ2V0UmVnZXgoKSxFZT1oKC9eKCB7MCwzfWJ1bGwpKFsgXHRdW15cbl0rPyk/KD86XG58JCkvKS5yZXBsYWNlKC9idWxsL2csRikuZ2V0UmVnZXgoKSx2PSJhZGRyZXNzfGFydGljbGV8YXNpZGV8YmFzZXxiYXNlZm9udHxibG9ja3F1b3RlfGJvZHl8Y2FwdGlvbnxjZW50ZXJ8Y29sfGNvbGdyb3VwfGRkfGRldGFpbHN8ZGlhbG9nfGRpcnxkaXZ8ZGx8ZHR8ZmllbGRzZXR8ZmlnY2FwdGlvbnxmaWd1cmV8Zm9vdGVyfGZvcm18ZnJhbWV8ZnJhbWVzZXR8aFsxLTZdfGhlYWR8aGVhZGVyfGhyfGh0bWx8aWZyYW1lfGxlZ2VuZHxsaXxsaW5rfG1haW58bWVudXxtZW51aXRlbXxtZXRhfG5hdnxub2ZyYW1lc3xvbHxvcHRncm91cHxvcHRpb258cHxwYXJhbXxzZWFyY2h8c2VjdGlvbnxzdW1tYXJ5fHRhYmxlfHRib2R5fHRkfHRmb290fHRofHRoZWFkfHRpdGxlfHRyfHRyYWNrfHVsIixLPS88IS0tKD86LT8+fFtcc1xTXSo/KD86LS0+fCQpKS8sQ2U9aCgiXiB7MCwzfSg/Ojwoc2NyaXB0fHByZXxzdHlsZXx0ZXh0YXJlYSlbXFxzPl1bXFxzXFxTXSo/KD86PC9cXDE+W15cXG5dKlxcbit8JCl8Y29tbWVudFteXFxuXSooXFxuK3wkKXw8XFw/W1xcc1xcU10qPyg/OlxcPz5cXG4qfCQpfDwhW0EtWl1bXFxzXFxTXSo/KD86Plxcbip8JCl8PCFcXFtDREFUQVxcW1tcXHNcXFNdKj8oPzpcXF1cXF0+XFxuKnwkKXw8Lz8odGFnKSg/OiArfFxcbnwvPz4pW1xcc1xcU10qPyg/Oig/OlxcblsgCV0qKStcXG58JCl8PCg/IXNjcmlwdHxwcmV8c3R5bGV8dGV4dGFyZWEpKFthLXpdW1xcdy1dKikoPzphdHRyaWJ1dGUpKj8gKi8/Pig/PVsgXFx0XSooPzpcXG58JCkpW1xcc1xcU10qPyg/Oig/OlxcblsgCV0qKStcXG58JCl8PC8oPyFzY3JpcHR8cHJlfHN0eWxlfHRleHRhcmVhKVthLXpdW1xcdy1dKlxccyo+KD89WyBcXHRdKig/OlxcbnwkKSlbXFxzXFxTXSo/KD86KD86XFxuWyAJXSopK1xcbnwkKSkiLCJpIikucmVwbGFjZSgiY29tbWVudCIsSykucmVwbGFjZSgidGFnIix2KS5yZXBsYWNlKCJhdHRyaWJ1dGUiLC8gK1thLXpBLVo6X11bXHcuOi1dKig/OiAqPSAqIlteIlxuXSoifCAqPSAqJ1teJ1xuXSonfCAqPSAqW15ccyInPTw+YF0rKT8vKS5nZXRSZWdleCgpLGxlPWgoUSkucmVwbGFjZSgiaHIiLE8pLnJlcGxhY2UoImhlYWRpbmciLCIgezAsM30jezEsNn0oPzpcXHN8JCkiKS5yZXBsYWNlKCJ8bGhlYWRpbmciLCIiKS5yZXBsYWNlKCJ8dGFibGUiLCIiKS5yZXBsYWNlKCJibG9ja3F1b3RlIiwiIHswLDN9PiIpLnJlcGxhY2UoImZlbmNlcyIsIiB7MCwzfSg/OmB7Myx9KD89W15gXFxuXSpcXG4pfH57Myx9KVteXFxuXSpcXG4iKS5yZXBsYWNlKCJsaXN0IiwiIHswLDN9KD86WyorLV18MVsuKV0pICIpLnJlcGxhY2UoImh0bWwiLCI8Lz8oPzp0YWcpKD86ICt8XFxufC8/Pil8PCg/OnNjcmlwdHxwcmV8c3R5bGV8dGV4dGFyZWF8IS0tKSIpLnJlcGxhY2UoInRhZyIsdikuZ2V0UmVnZXgoKSxJZT1oKC9eKCB7MCwzfT4gPyhwYXJhZ3JhcGh8W15cbl0qKSg/OlxufCQpKSsvKS5yZXBsYWNlKCJwYXJhZ3JhcGgiLGxlKS5nZXRSZWdleCgpLFg9e2Jsb2NrcXVvdGU6SWUsY29kZTpfZSxkZWY6QWUsZmVuY2VzOkxlLGhlYWRpbmc6emUsaHI6TyxodG1sOkNlLGxoZWFkaW5nOm9lLGxpc3Q6RWUsbmV3bGluZTokZSxwYXJhZ3JhcGg6bGUsdGFibGU6SSx0ZXh0OlBlfSxyZT1oKCJeICooW15cXG4gXS4qKVxcbiB7MCwzfSgoPzpcXHwgKik/Oj8tKzo/ICooPzpcXHwgKjo/LSs6PyAqKSooPzpcXHwgKik/KSg/OlxcbigoPzooPyEgKlxcbnxocnxoZWFkaW5nfGJsb2NrcXVvdGV8Y29kZXxmZW5jZXN8bGlzdHxodG1sKS4qKD86XFxufCQpKSopXFxuKnwkKSIpLnJlcGxhY2UoImhyIixPKS5yZXBsYWNlKCJoZWFkaW5nIiwiIHswLDN9I3sxLDZ9KD86XFxzfCQpIikucmVwbGFjZSgiYmxvY2txdW90ZSIsIiB7MCwzfT4iKS5yZXBsYWNlKCJjb2RlIiwiKD86IHs0fXwgezAsM30JKVteXFxuXSIpLnJlcGxhY2UoImZlbmNlcyIsIiB7MCwzfSg/OmB7Myx9KD89W15gXFxuXSpcXG4pfH57Myx9KVteXFxuXSpcXG4iKS5yZXBsYWNlKCJsaXN0IiwiIHswLDN9KD86WyorLV18MVsuKV0pICIpLnJlcGxhY2UoImh0bWwiLCI8Lz8oPzp0YWcpKD86ICt8XFxufC8/Pil8PCg/OnNjcmlwdHxwcmV8c3R5bGV8dGV4dGFyZWF8IS0tKSIpLnJlcGxhY2UoInRhZyIsdikuZ2V0UmVnZXgoKSxPZT17Li4uWCxsaGVhZGluZzpNZSx0YWJsZTpyZSxwYXJhZ3JhcGg6aChRKS5yZXBsYWNlKCJociIsTykucmVwbGFjZSgiaGVhZGluZyIsIiB7MCwzfSN7MSw2fSg/Olxcc3wkKSIpLnJlcGxhY2UoInxsaGVhZGluZyIsIiIpLnJlcGxhY2UoInRhYmxlIixyZSkucmVwbGFjZSgiYmxvY2txdW90ZSIsIiB7MCwzfT4iKS5yZXBsYWNlKCJmZW5jZXMiLCIgezAsM30oPzpgezMsfSg/PVteYFxcbl0qXFxuKXx+ezMsfSlbXlxcbl0qXFxuIikucmVwbGFjZSgibGlzdCIsIiB7MCwzfSg/OlsqKy1dfDFbLildKSAiKS5yZXBsYWNlKCJodG1sIiwiPC8/KD86dGFnKSg/OiArfFxcbnwvPz4pfDwoPzpzY3JpcHR8cHJlfHN0eWxlfHRleHRhcmVhfCEtLSkiKS5yZXBsYWNlKCJ0YWciLHYpLmdldFJlZ2V4KCl9LEJlPXsuLi5YLGh0bWw6aChgXiAqKD86Y29tbWVudCAqKD86XFxufFxccyokKXw8KHRhZylbXFxzXFxTXSs/PC9cXDE+ICooPzpcXG57Mix9fFxccyokKXw8dGFnKD86IlteIl0qInwnW14nXSonfFxcc1teJyIvPlxcc10qKSo/Lz8+ICooPzpcXG57Mix9fFxccyokKSlgKS5yZXBsYWNlKCJjb21tZW50IixLKS5yZXBsYWNlKC90YWcvZywiKD8hKD86YXxlbXxzdHJvbmd8c21hbGx8c3xjaXRlfHF8ZGZufGFiYnJ8ZGF0YXx0aW1lfGNvZGV8dmFyfHNhbXB8a2JkfHN1YnxzdXB8aXxifHV8bWFya3xydWJ5fHJ0fHJwfGJkaXxiZG98c3Bhbnxicnx3YnJ8aW5zfGRlbHxpbWcpXFxiKVxcdysoPyE6fFteXFx3XFxzQF0qQClcXGIiKS5nZXRSZWdleCgpLGRlZjovXiAqXFsoW15cXV0rKVxdOiAqPD8oW15ccz5dKyk+Pyg/OiArKFsiKF1bXlxuXStbIildKSk/ICooPzpcbit8JCkvLGhlYWRpbmc6L14oI3sxLDZ9KSguKikoPzpcbit8JCkvLGZlbmNlczpJLGxoZWFkaW5nOi9eKC4rPylcbiB7MCwzfSg9K3wtKykgKig/OlxuK3wkKS8scGFyYWdyYXBoOmgoUSkucmVwbGFjZSgiaHIiLE8pLnJlcGxhY2UoImhlYWRpbmciLGAgKiN7MSw2fSAqW14KXWApLnJlcGxhY2UoImxoZWFkaW5nIixvZSkucmVwbGFjZSgifHRhYmxlIiwiIikucmVwbGFjZSgiYmxvY2txdW90ZSIsIiB7MCwzfT4iKS5yZXBsYWNlKCJ8ZmVuY2VzIiwiIikucmVwbGFjZSgifGxpc3QiLCIiKS5yZXBsYWNlKCJ8aHRtbCIsIiIpLnJlcGxhY2UoInx0YWciLCIiKS5nZXRSZWdleCgpfSxxZT0vXlxcKFshIiMkJSYnKCkqKyxcLS4vOjs8PT4/QFxbXF1cXF5fYHt8fX5dKS8sdmU9L14oYCspKFteYF18W15gXVtcc1xTXSo/W15gXSlcMSg/IWApLyxhZT0vXiggezIsfXxcXClcbig/IVxzKiQpLyxEZT0vXihgK3xbXmBdKSg/Oig/PSB7Mix9XG4pfFtcc1xTXSo/KD86KD89W1xcPCFcW2AqX118XGJffCQpfFteIF0oPz0gezIsfVxuKSkpLyxEPS9bXHB7UH1ccHtTfV0vdSxXPS9bXHNccHtQfVxwe1N9XS91LGNlPS9bXlxzXHB7UH1ccHtTfV0vdSxaZT1oKC9eKCg/IVsqX10pcHVuY3RTcGFjZSkvLCJ1IikucmVwbGFjZSgvcHVuY3RTcGFjZS9nLFcpLmdldFJlZ2V4KCkscGU9Lyg/IX4pW1xwe1B9XHB7U31dL3UsR2U9Lyg/IX4pW1xzXHB7UH1ccHtTfV0vdSxIZT0vKD86W15cc1xwe1B9XHB7U31dfH4pL3UsTmU9L1xbW15bXF1dKj9cXVwoKD86XFwufFteXFxcKFwpXXxcKCg/OlxcLnxbXlxcXChcKV0pKlwpKSpcKXxgW15gXSo/YHw8W148Pl0qPz4vZyx1ZT0vXig/OlwqKyg/OigoPyFcKilwdW5jdCl8W15ccypdKSl8Xl8rKD86KCg/IV8pcHVuY3QpfChbXlxzX10pKS8samU9aCh1ZSwidSIpLnJlcGxhY2UoL3B1bmN0L2csRCkuZ2V0UmVnZXgoKSxGZT1oKHVlLCJ1IikucmVwbGFjZSgvcHVuY3QvZyxwZSkuZ2V0UmVnZXgoKSxoZT0iXlteXypdKj9fX1teXypdKj9cXCpbXl8qXSo/KD89X18pfFteKl0rKD89W14qXSl8KD8hXFwqKXB1bmN0KFxcKispKD89W1xcc118JCl8bm90UHVuY3RTcGFjZShcXCorKSg/IVxcKikoPz1wdW5jdFNwYWNlfCQpfCg/IVxcKilwdW5jdFNwYWNlKFxcKispKD89bm90UHVuY3RTcGFjZSl8W1xcc10oXFwqKykoPyFcXCopKD89cHVuY3QpfCg/IVxcKilwdW5jdChcXCorKSg/IVxcKikoPz1wdW5jdCl8bm90UHVuY3RTcGFjZShcXCorKSg/PW5vdFB1bmN0U3BhY2UpIixRZT1oKGhlLCJndSIpLnJlcGxhY2UoL25vdFB1bmN0U3BhY2UvZyxjZSkucmVwbGFjZSgvcHVuY3RTcGFjZS9nLFcpLnJlcGxhY2UoL3B1bmN0L2csRCkuZ2V0UmVnZXgoKSxVZT1oKGhlLCJndSIpLnJlcGxhY2UoL25vdFB1bmN0U3BhY2UvZyxIZSkucmVwbGFjZSgvcHVuY3RTcGFjZS9nLEdlKS5yZXBsYWNlKC9wdW5jdC9nLHBlKS5nZXRSZWdleCgpLEtlPWgoIl5bXl8qXSo/XFwqXFwqW15fKl0qP19bXl8qXSo/KD89XFwqXFwqKXxbXl9dKyg/PVteX10pfCg/IV8pcHVuY3QoXyspKD89W1xcc118JCl8bm90UHVuY3RTcGFjZShfKykoPyFfKSg/PXB1bmN0U3BhY2V8JCl8KD8hXylwdW5jdFNwYWNlKF8rKSg/PW5vdFB1bmN0U3BhY2UpfFtcXHNdKF8rKSg/IV8pKD89cHVuY3QpfCg/IV8pcHVuY3QoXyspKD8hXykoPz1wdW5jdCkiLCJndSIpLnJlcGxhY2UoL25vdFB1bmN0U3BhY2UvZyxjZSkucmVwbGFjZSgvcHVuY3RTcGFjZS9nLFcpLnJlcGxhY2UoL3B1bmN0L2csRCkuZ2V0UmVnZXgoKSxYZT1oKC9cXChwdW5jdCkvLCJndSIpLnJlcGxhY2UoL3B1bmN0L2csRCkuZ2V0UmVnZXgoKSxXZT1oKC9ePChzY2hlbWU6W15cc1x4MDAtXHgxZjw+XSp8ZW1haWwpPi8pLnJlcGxhY2UoInNjaGVtZSIsL1thLXpBLVpdW2EtekEtWjAtOSsuLV17MSwzMX0vKS5yZXBsYWNlKCJlbWFpbCIsL1thLXpBLVowLTkuISMkJSYnKisvPT9eX2B7fH1+LV0rKEApW2EtekEtWjAtOV0oPzpbYS16QS1aMC05LV17MCw2MX1bYS16QS1aMC05XSk/KD86XC5bYS16QS1aMC05XSg/OlthLXpBLVowLTktXXswLDYxfVthLXpBLVowLTldKT8pKyg/IVstX10pLykuZ2V0UmVnZXgoKSxKZT1oKEspLnJlcGxhY2UoIig/Oi0tPnwkKSIsIi0tPiIpLmdldFJlZ2V4KCksVmU9aCgiXmNvbW1lbnR8XjwvW2EtekEtWl1bXFx3Oi1dKlxccyo+fF48W2EtekEtWl1bXFx3LV0qKD86YXR0cmlidXRlKSo/XFxzKi8/PnxePFxcP1tcXHNcXFNdKj9cXD8+fF48IVthLXpBLVpdK1xcc1tcXHNcXFNdKj8+fF48IVxcW0NEQVRBXFxbW1xcc1xcU10qP1xcXVxcXT4iKS5yZXBsYWNlKCJjb21tZW50IixKZSkucmVwbGFjZSgiYXR0cmlidXRlIiwvXHMrW2EtekEtWjpfXVtcdy46LV0qKD86XHMqPVxzKiJbXiJdKiJ8XHMqPVxzKidbXiddKid8XHMqPVxzKlteXHMiJz08PmBdKyk/LykuZ2V0UmVnZXgoKSxxPS8oPzpcWyg/OlxcLnxbXlxbXF1cXF0pKlxdfFxcLnxgW15gXSpgfFteXFtcXVxcYF0pKj8vLFllPWgoL14hP1xbKGxhYmVsKVxdXChccyooaHJlZikoPzooPzpbIFx0XSooPzpcblsgXHRdKik/KSh0aXRsZSkpP1xzKlwpLykucmVwbGFjZSgibGFiZWwiLHEpLnJlcGxhY2UoImhyZWYiLC88KD86XFwufFteXG48PlxcXSkrPnxbXiBcdFxuXHgwMC1ceDFmXSovKS5yZXBsYWNlKCJ0aXRsZSIsLyIoPzpcXCI/fFteIlxcXSkqInwnKD86XFwnP3xbXidcXF0pKid8XCgoPzpcXFwpP3xbXilcXF0pKlwpLykuZ2V0UmVnZXgoKSxrZT1oKC9eIT9cWyhsYWJlbClcXVxbKHJlZilcXS8pLnJlcGxhY2UoImxhYmVsIixxKS5yZXBsYWNlKCJyZWYiLFUpLmdldFJlZ2V4KCksZ2U9aCgvXiE/XFsocmVmKVxdKD86XFtcXSk/LykucmVwbGFjZSgicmVmIixVKS5nZXRSZWdleCgpLGV0PWgoInJlZmxpbmt8bm9saW5rKD8hXFwoKSIsImciKS5yZXBsYWNlKCJyZWZsaW5rIixrZSkucmVwbGFjZSgibm9saW5rIixnZSkuZ2V0UmVnZXgoKSxKPXtfYmFja3BlZGFsOkksYW55UHVuY3R1YXRpb246WGUsYXV0b2xpbms6V2UsYmxvY2tTa2lwOk5lLGJyOmFlLGNvZGU6dmUsZGVsOkksZW1TdHJvbmdMRGVsaW06amUsZW1TdHJvbmdSRGVsaW1Bc3Q6UWUsZW1TdHJvbmdSRGVsaW1VbmQ6S2UsZXNjYXBlOnFlLGxpbms6WWUsbm9saW5rOmdlLHB1bmN0dWF0aW9uOlplLHJlZmxpbms6a2UscmVmbGlua1NlYXJjaDpldCx0YWc6VmUsdGV4dDpEZSx1cmw6SX0sdHQ9ey4uLkosbGluazpoKC9eIT9cWyhsYWJlbClcXVwoKC4qPylcKS8pLnJlcGxhY2UoImxhYmVsIixxKS5nZXRSZWdleCgpLHJlZmxpbms6aCgvXiE/XFsobGFiZWwpXF1ccypcWyhbXlxdXSopXF0vKS5yZXBsYWNlKCJsYWJlbCIscSkuZ2V0UmVnZXgoKX0saj17Li4uSixlbVN0cm9uZ1JEZWxpbUFzdDpVZSxlbVN0cm9uZ0xEZWxpbTpGZSx1cmw6aCgvXigoPzpmdHB8aHR0cHM/KTpcL1wvfHd3d1wuKSg/OlthLXpBLVowLTlcLV0rXC4/KStbXlxzPF0qfF5lbWFpbC8sImkiKS5yZXBsYWNlKCJlbWFpbCIsL1tBLVphLXowLTkuXystXSsoQClbYS16QS1aMC05LV9dKyg/OlwuW2EtekEtWjAtOS1fXSpbYS16QS1aMC05XSkrKD8hWy1fXSkvKS5nZXRSZWdleCgpLF9iYWNrcGVkYWw6Lyg/OltePyEuLDo7Kl8nIn4oKSZdK3xcKFteKV0qXCl8Jig/IVthLXpBLVowLTldKzskKXxbPyEuLDo7Kl8nIn4pXSsoPyEkKSkrLyxkZWw6L14ofn4/KSg/PVteXHN+XSkoKD86XFwufFteXFxdKSo/KD86XFwufFteXHN+XFxdKSlcMSg/PVtefl18JCkvLHRleHQ6L14oW2B+XSt8W15gfl0pKD86KD89IHsyLH1cbil8KD89W2EtekEtWjAtOS4hIyQlJicqK1wvPT9fYHtcfH1+LV0rQCl8W1xzXFNdKj8oPzooPz1bXFw8IVxbYCp+X118XGJffGh0dHBzPzpcL1wvfGZ0cDpcL1wvfHd3d1wufCQpfFteIF0oPz0gezIsfVxuKXxbXmEtekEtWjAtOS4hIyQlJicqK1wvPT9fYHtcfH1+LV0oPz1bYS16QS1aMC05LiEjJCUmJyorXC89P19ge1x8fX4tXStAKSkpL30sbnQ9ey4uLmosYnI6aChhZSkucmVwbGFjZSgiezIsfSIsIioiKS5nZXRSZWdleCgpLHRleHQ6aChqLnRleHQpLnJlcGxhY2UoIlxcYl8iLCJcXGJffCB7Mix9XFxuIikucmVwbGFjZSgvXHsyLFx9L2csIioiKS5nZXRSZWdleCgpfSxCPXtub3JtYWw6WCxnZm06T2UscGVkYW50aWM6QmV9LFA9e25vcm1hbDpKLGdmbTpqLGJyZWFrczpudCxwZWRhbnRpYzp0dH07dmFyIHN0PXsiJiI6IiZhbXA7IiwiPCI6IiZsdDsiLCI+IjoiJmd0OyIsJyInOiImcXVvdDsiLCInIjoiJiMzOTsifSxmZT1sPT5zdFtsXTtmdW5jdGlvbiBSKGwsZSl7aWYoZSl7aWYobS5lc2NhcGVUZXN0LnRlc3QobCkpcmV0dXJuIGwucmVwbGFjZShtLmVzY2FwZVJlcGxhY2UsZmUpfWVsc2UgaWYobS5lc2NhcGVUZXN0Tm9FbmNvZGUudGVzdChsKSlyZXR1cm4gbC5yZXBsYWNlKG0uZXNjYXBlUmVwbGFjZU5vRW5jb2RlLGZlKTtyZXR1cm4gbH1mdW5jdGlvbiBWKGwpe3RyeXtsPWVuY29kZVVSSShsKS5yZXBsYWNlKG0ucGVyY2VudERlY29kZSwiJSIpfWNhdGNoe3JldHVybiBudWxsfXJldHVybiBsfWZ1bmN0aW9uIFkobCxlKXtsZXQgdD1sLnJlcGxhY2UobS5maW5kUGlwZSwoaSxyLG8pPT57bGV0IGE9ITEsYz1yO2Zvcig7LS1jPj0wJiZvW2NdPT09IlxcIjspYT0hYTtyZXR1cm4gYT8ifCI6IiB8In0pLG49dC5zcGxpdChtLnNwbGl0UGlwZSkscz0wO2lmKG5bMF0udHJpbSgpfHxuLnNoaWZ0KCksbi5sZW5ndGg+MCYmIW4uYXQoLTEpPy50cmltKCkmJm4ucG9wKCksZSlpZihuLmxlbmd0aD5lKW4uc3BsaWNlKGUpO2Vsc2UgZm9yKDtuLmxlbmd0aDxlOyluLnB1c2goIiIpO2Zvcig7czxuLmxlbmd0aDtzKyspbltzXT1uW3NdLnRyaW0oKS5yZXBsYWNlKG0uc2xhc2hQaXBlLCJ8Iik7cmV0dXJuIG59ZnVuY3Rpb24gQShsLGUsdCl7bGV0IG49bC5sZW5ndGg7aWYobj09PTApcmV0dXJuIiI7bGV0IHM9MDtmb3IoO3M8bjspe2xldCBpPWwuY2hhckF0KG4tcy0xKTtpZihpPT09ZSYmIXQpcysrO2Vsc2UgaWYoaSE9PWUmJnQpcysrO2Vsc2UgYnJlYWt9cmV0dXJuIGwuc2xpY2UoMCxuLXMpfWZ1bmN0aW9uIGRlKGwsZSl7aWYobC5pbmRleE9mKGVbMV0pPT09LTEpcmV0dXJuLTE7bGV0IHQ9MDtmb3IobGV0IG49MDtuPGwubGVuZ3RoO24rKylpZihsW25dPT09IlxcIiluKys7ZWxzZSBpZihsW25dPT09ZVswXSl0Kys7ZWxzZSBpZihsW25dPT09ZVsxXSYmKHQtLSx0PDApKXJldHVybiBuO3JldHVybiB0PjA/LTI6LTF9ZnVuY3Rpb24gbWUobCxlLHQsbixzKXtsZXQgaT1lLmhyZWYscj1lLnRpdGxlfHxudWxsLG89bFsxXS5yZXBsYWNlKHMub3RoZXIub3V0cHV0TGlua1JlcGxhY2UsIiQxIik7bi5zdGF0ZS5pbkxpbms9ITA7bGV0IGE9e3R5cGU6bFswXS5jaGFyQXQoMCk9PT0iISI/ImltYWdlIjoibGluayIscmF3OnQsaHJlZjppLHRpdGxlOnIsdGV4dDpvLHRva2VuczpuLmlubGluZVRva2VucyhvKX07cmV0dXJuIG4uc3RhdGUuaW5MaW5rPSExLGF9ZnVuY3Rpb24gcnQobCxlLHQpe2xldCBuPWwubWF0Y2godC5vdGhlci5pbmRlbnRDb2RlQ29tcGVuc2F0aW9uKTtpZihuPT09bnVsbClyZXR1cm4gZTtsZXQgcz1uWzFdO3JldHVybiBlLnNwbGl0KGAKYCkubWFwKGk9PntsZXQgcj1pLm1hdGNoKHQub3RoZXIuYmVnaW5uaW5nU3BhY2UpO2lmKHI9PT1udWxsKXJldHVybiBpO2xldFtvXT1yO3JldHVybiBvLmxlbmd0aD49cy5sZW5ndGg/aS5zbGljZShzLmxlbmd0aCk6aX0pLmpvaW4oYApgKX12YXIgUz1jbGFzc3tvcHRpb25zO3J1bGVzO2xleGVyO2NvbnN0cnVjdG9yKGUpe3RoaXMub3B0aW9ucz1lfHx3fXNwYWNlKGUpe2xldCB0PXRoaXMucnVsZXMuYmxvY2submV3bGluZS5leGVjKGUpO2lmKHQmJnRbMF0ubGVuZ3RoPjApcmV0dXJue3R5cGU6InNwYWNlIixyYXc6dFswXX19Y29kZShlKXtsZXQgdD10aGlzLnJ1bGVzLmJsb2NrLmNvZGUuZXhlYyhlKTtpZih0KXtsZXQgbj10WzBdLnJlcGxhY2UodGhpcy5ydWxlcy5vdGhlci5jb2RlUmVtb3ZlSW5kZW50LCIiKTtyZXR1cm57dHlwZToiY29kZSIscmF3OnRbMF0sY29kZUJsb2NrU3R5bGU6ImluZGVudGVkIix0ZXh0OnRoaXMub3B0aW9ucy5wZWRhbnRpYz9uOkEobixgCmApfX19ZmVuY2VzKGUpe2xldCB0PXRoaXMucnVsZXMuYmxvY2suZmVuY2VzLmV4ZWMoZSk7aWYodCl7bGV0IG49dFswXSxzPXJ0KG4sdFszXXx8IiIsdGhpcy5ydWxlcyk7cmV0dXJue3R5cGU6ImNvZGUiLHJhdzpuLGxhbmc6dFsyXT90WzJdLnRyaW0oKS5yZXBsYWNlKHRoaXMucnVsZXMuaW5saW5lLmFueVB1bmN0dWF0aW9uLCIkMSIpOnRbMl0sdGV4dDpzfX19aGVhZGluZyhlKXtsZXQgdD10aGlzLnJ1bGVzLmJsb2NrLmhlYWRpbmcuZXhlYyhlKTtpZih0KXtsZXQgbj10WzJdLnRyaW0oKTtpZih0aGlzLnJ1bGVzLm90aGVyLmVuZGluZ0hhc2gudGVzdChuKSl7bGV0IHM9QShuLCIjIik7KHRoaXMub3B0aW9ucy5wZWRhbnRpY3x8IXN8fHRoaXMucnVsZXMub3RoZXIuZW5kaW5nU3BhY2VDaGFyLnRlc3QocykpJiYobj1zLnRyaW0oKSl9cmV0dXJue3R5cGU6ImhlYWRpbmciLHJhdzp0WzBdLGRlcHRoOnRbMV0ubGVuZ3RoLHRleHQ6bix0b2tlbnM6dGhpcy5sZXhlci5pbmxpbmUobil9fX1ocihlKXtsZXQgdD10aGlzLnJ1bGVzLmJsb2NrLmhyLmV4ZWMoZSk7aWYodClyZXR1cm57dHlwZToiaHIiLHJhdzpBKHRbMF0sYApgKX19YmxvY2txdW90ZShlKXtsZXQgdD10aGlzLnJ1bGVzLmJsb2NrLmJsb2NrcXVvdGUuZXhlYyhlKTtpZih0KXtsZXQgbj1BKHRbMF0sYApgKS5zcGxpdChgCmApLHM9IiIsaT0iIixyPVtdO2Zvcig7bi5sZW5ndGg+MDspe2xldCBvPSExLGE9W10sYztmb3IoYz0wO2M8bi5sZW5ndGg7YysrKWlmKHRoaXMucnVsZXMub3RoZXIuYmxvY2txdW90ZVN0YXJ0LnRlc3QobltjXSkpYS5wdXNoKG5bY10pLG89ITA7ZWxzZSBpZighbylhLnB1c2gobltjXSk7ZWxzZSBicmVhaztuPW4uc2xpY2UoYyk7bGV0IHA9YS5qb2luKGAKYCksdT1wLnJlcGxhY2UodGhpcy5ydWxlcy5vdGhlci5ibG9ja3F1b3RlU2V0ZXh0UmVwbGFjZSxgCiAgICAkMWApLnJlcGxhY2UodGhpcy5ydWxlcy5vdGhlci5ibG9ja3F1b3RlU2V0ZXh0UmVwbGFjZTIsIiIpO3M9cz9gJHtzfQoke3B9YDpwLGk9aT9gJHtpfQoke3V9YDp1O2xldCBkPXRoaXMubGV4ZXIuc3RhdGUudG9wO2lmKHRoaXMubGV4ZXIuc3RhdGUudG9wPSEwLHRoaXMubGV4ZXIuYmxvY2tUb2tlbnModSxyLCEwKSx0aGlzLmxleGVyLnN0YXRlLnRvcD1kLG4ubGVuZ3RoPT09MClicmVhaztsZXQgZz1yLmF0KC0xKTtpZihnPy50eXBlPT09ImNvZGUiKWJyZWFrO2lmKGc/LnR5cGU9PT0iYmxvY2txdW90ZSIpe2xldCBUPWcsZj1ULnJhdytgCmArbi5qb2luKGAKYCkseT10aGlzLmJsb2NrcXVvdGUoZik7cltyLmxlbmd0aC0xXT15LHM9cy5zdWJzdHJpbmcoMCxzLmxlbmd0aC1ULnJhdy5sZW5ndGgpK3kucmF3LGk9aS5zdWJzdHJpbmcoMCxpLmxlbmd0aC1ULnRleHQubGVuZ3RoKSt5LnRleHQ7YnJlYWt9ZWxzZSBpZihnPy50eXBlPT09Imxpc3QiKXtsZXQgVD1nLGY9VC5yYXcrYApgK24uam9pbihgCmApLHk9dGhpcy5saXN0KGYpO3Jbci5sZW5ndGgtMV09eSxzPXMuc3Vic3RyaW5nKDAscy5sZW5ndGgtZy5yYXcubGVuZ3RoKSt5LnJhdyxpPWkuc3Vic3RyaW5nKDAsaS5sZW5ndGgtVC5yYXcubGVuZ3RoKSt5LnJhdyxuPWYuc3Vic3RyaW5nKHIuYXQoLTEpLnJhdy5sZW5ndGgpLnNwbGl0KGAKYCk7Y29udGludWV9fXJldHVybnt0eXBlOiJibG9ja3F1b3RlIixyYXc6cyx0b2tlbnM6cix0ZXh0Oml9fX1saXN0KGUpe2xldCB0PXRoaXMucnVsZXMuYmxvY2subGlzdC5leGVjKGUpO2lmKHQpe2xldCBuPXRbMV0udHJpbSgpLHM9bi5sZW5ndGg+MSxpPXt0eXBlOiJsaXN0IixyYXc6IiIsb3JkZXJlZDpzLHN0YXJ0OnM/K24uc2xpY2UoMCwtMSk6IiIsbG9vc2U6ITEsaXRlbXM6W119O249cz9gXFxkezEsOX1cXCR7bi5zbGljZSgtMSl9YDpgXFwke259YCx0aGlzLm9wdGlvbnMucGVkYW50aWMmJihuPXM/bjoiWyorLV0iKTtsZXQgcj10aGlzLnJ1bGVzLm90aGVyLmxpc3RJdGVtUmVnZXgobiksbz0hMTtmb3IoO2U7KXtsZXQgYz0hMSxwPSIiLHU9IiI7aWYoISh0PXIuZXhlYyhlKSl8fHRoaXMucnVsZXMuYmxvY2suaHIudGVzdChlKSlicmVhaztwPXRbMF0sZT1lLnN1YnN0cmluZyhwLmxlbmd0aCk7bGV0IGQ9dFsyXS5zcGxpdChgCmAsMSlbMF0ucmVwbGFjZSh0aGlzLnJ1bGVzLm90aGVyLmxpc3RSZXBsYWNlVGFicyxaPT4iICIucmVwZWF0KDMqWi5sZW5ndGgpKSxnPWUuc3BsaXQoYApgLDEpWzBdLFQ9IWQudHJpbSgpLGY9MDtpZih0aGlzLm9wdGlvbnMucGVkYW50aWM/KGY9Mix1PWQudHJpbVN0YXJ0KCkpOlQ/Zj10WzFdLmxlbmd0aCsxOihmPXRbMl0uc2VhcmNoKHRoaXMucnVsZXMub3RoZXIubm9uU3BhY2VDaGFyKSxmPWY+ND8xOmYsdT1kLnNsaWNlKGYpLGYrPXRbMV0ubGVuZ3RoKSxUJiZ0aGlzLnJ1bGVzLm90aGVyLmJsYW5rTGluZS50ZXN0KGcpJiYocCs9ZytgCmAsZT1lLnN1YnN0cmluZyhnLmxlbmd0aCsxKSxjPSEwKSwhYyl7bGV0IFo9dGhpcy5ydWxlcy5vdGhlci5uZXh0QnVsbGV0UmVnZXgoZiksdGU9dGhpcy5ydWxlcy5vdGhlci5oclJlZ2V4KGYpLG5lPXRoaXMucnVsZXMub3RoZXIuZmVuY2VzQmVnaW5SZWdleChmKSxzZT10aGlzLnJ1bGVzLm90aGVyLmhlYWRpbmdCZWdpblJlZ2V4KGYpLHhlPXRoaXMucnVsZXMub3RoZXIuaHRtbEJlZ2luUmVnZXgoZik7Zm9yKDtlOyl7bGV0IEc9ZS5zcGxpdChgCmAsMSlbMF0sQztpZihnPUcsdGhpcy5vcHRpb25zLnBlZGFudGljPyhnPWcucmVwbGFjZSh0aGlzLnJ1bGVzLm90aGVyLmxpc3RSZXBsYWNlTmVzdGluZywiICAiKSxDPWcpOkM9Zy5yZXBsYWNlKHRoaXMucnVsZXMub3RoZXIudGFiQ2hhckdsb2JhbCwiICAgICIpLG5lLnRlc3QoZyl8fHNlLnRlc3QoZyl8fHhlLnRlc3QoZyl8fFoudGVzdChnKXx8dGUudGVzdChnKSlicmVhaztpZihDLnNlYXJjaCh0aGlzLnJ1bGVzLm90aGVyLm5vblNwYWNlQ2hhcik+PWZ8fCFnLnRyaW0oKSl1Kz1gCmArQy5zbGljZShmKTtlbHNle2lmKFR8fGQucmVwbGFjZSh0aGlzLnJ1bGVzLm90aGVyLnRhYkNoYXJHbG9iYWwsIiAgICAiKS5zZWFyY2godGhpcy5ydWxlcy5vdGhlci5ub25TcGFjZUNoYXIpPj00fHxuZS50ZXN0KGQpfHxzZS50ZXN0KGQpfHx0ZS50ZXN0KGQpKWJyZWFrO3UrPWAKYCtnfSFUJiYhZy50cmltKCkmJihUPSEwKSxwKz1HK2AKYCxlPWUuc3Vic3RyaW5nKEcubGVuZ3RoKzEpLGQ9Qy5zbGljZShmKX19aS5sb29zZXx8KG8/aS5sb29zZT0hMDp0aGlzLnJ1bGVzLm90aGVyLmRvdWJsZUJsYW5rTGluZS50ZXN0KHApJiYobz0hMCkpO2xldCB5PW51bGwsZWU7dGhpcy5vcHRpb25zLmdmbSYmKHk9dGhpcy5ydWxlcy5vdGhlci5saXN0SXNUYXNrLmV4ZWModSkseSYmKGVlPXlbMF0hPT0iWyBdICIsdT11LnJlcGxhY2UodGhpcy5ydWxlcy5vdGhlci5saXN0UmVwbGFjZVRhc2ssIiIpKSksaS5pdGVtcy5wdXNoKHt0eXBlOiJsaXN0X2l0ZW0iLHJhdzpwLHRhc2s6ISF5LGNoZWNrZWQ6ZWUsbG9vc2U6ITEsdGV4dDp1LHRva2VuczpbXX0pLGkucmF3Kz1wfWxldCBhPWkuaXRlbXMuYXQoLTEpO2lmKGEpYS5yYXc9YS5yYXcudHJpbUVuZCgpLGEudGV4dD1hLnRleHQudHJpbUVuZCgpO2Vsc2UgcmV0dXJuO2kucmF3PWkucmF3LnRyaW1FbmQoKTtmb3IobGV0IGM9MDtjPGkuaXRlbXMubGVuZ3RoO2MrKylpZih0aGlzLmxleGVyLnN0YXRlLnRvcD0hMSxpLml0ZW1zW2NdLnRva2Vucz10aGlzLmxleGVyLmJsb2NrVG9rZW5zKGkuaXRlbXNbY10udGV4dCxbXSksIWkubG9vc2Upe2xldCBwPWkuaXRlbXNbY10udG9rZW5zLmZpbHRlcihkPT5kLnR5cGU9PT0ic3BhY2UiKSx1PXAubGVuZ3RoPjAmJnAuc29tZShkPT50aGlzLnJ1bGVzLm90aGVyLmFueUxpbmUudGVzdChkLnJhdykpO2kubG9vc2U9dX1pZihpLmxvb3NlKWZvcihsZXQgYz0wO2M8aS5pdGVtcy5sZW5ndGg7YysrKWkuaXRlbXNbY10ubG9vc2U9ITA7cmV0dXJuIGl9fWh0bWwoZSl7bGV0IHQ9dGhpcy5ydWxlcy5ibG9jay5odG1sLmV4ZWMoZSk7aWYodClyZXR1cm57dHlwZToiaHRtbCIsYmxvY2s6ITAscmF3OnRbMF0scHJlOnRbMV09PT0icHJlInx8dFsxXT09PSJzY3JpcHQifHx0WzFdPT09InN0eWxlIix0ZXh0OnRbMF19fWRlZihlKXtsZXQgdD10aGlzLnJ1bGVzLmJsb2NrLmRlZi5leGVjKGUpO2lmKHQpe2xldCBuPXRbMV0udG9Mb3dlckNhc2UoKS5yZXBsYWNlKHRoaXMucnVsZXMub3RoZXIubXVsdGlwbGVTcGFjZUdsb2JhbCwiICIpLHM9dFsyXT90WzJdLnJlcGxhY2UodGhpcy5ydWxlcy5vdGhlci5ocmVmQnJhY2tldHMsIiQxIikucmVwbGFjZSh0aGlzLnJ1bGVzLmlubGluZS5hbnlQdW5jdHVhdGlvbiwiJDEiKToiIixpPXRbM10/dFszXS5zdWJzdHJpbmcoMSx0WzNdLmxlbmd0aC0xKS5yZXBsYWNlKHRoaXMucnVsZXMuaW5saW5lLmFueVB1bmN0dWF0aW9uLCIkMSIpOnRbM107cmV0dXJue3R5cGU6ImRlZiIsdGFnOm4scmF3OnRbMF0saHJlZjpzLHRpdGxlOml9fX10YWJsZShlKXtsZXQgdD10aGlzLnJ1bGVzLmJsb2NrLnRhYmxlLmV4ZWMoZSk7aWYoIXR8fCF0aGlzLnJ1bGVzLm90aGVyLnRhYmxlRGVsaW1pdGVyLnRlc3QodFsyXSkpcmV0dXJuO2xldCBuPVkodFsxXSkscz10WzJdLnJlcGxhY2UodGhpcy5ydWxlcy5vdGhlci50YWJsZUFsaWduQ2hhcnMsIiIpLnNwbGl0KCJ8IiksaT10WzNdPy50cmltKCk/dFszXS5yZXBsYWNlKHRoaXMucnVsZXMub3RoZXIudGFibGVSb3dCbGFua0xpbmUsIiIpLnNwbGl0KGAKYCk6W10scj17dHlwZToidGFibGUiLHJhdzp0WzBdLGhlYWRlcjpbXSxhbGlnbjpbXSxyb3dzOltdfTtpZihuLmxlbmd0aD09PXMubGVuZ3RoKXtmb3IobGV0IG8gb2Ygcyl0aGlzLnJ1bGVzLm90aGVyLnRhYmxlQWxpZ25SaWdodC50ZXN0KG8pP3IuYWxpZ24ucHVzaCgicmlnaHQiKTp0aGlzLnJ1bGVzLm90aGVyLnRhYmxlQWxpZ25DZW50ZXIudGVzdChvKT9yLmFsaWduLnB1c2goImNlbnRlciIpOnRoaXMucnVsZXMub3RoZXIudGFibGVBbGlnbkxlZnQudGVzdChvKT9yLmFsaWduLnB1c2goImxlZnQiKTpyLmFsaWduLnB1c2gobnVsbCk7Zm9yKGxldCBvPTA7bzxuLmxlbmd0aDtvKyspci5oZWFkZXIucHVzaCh7dGV4dDpuW29dLHRva2Vuczp0aGlzLmxleGVyLmlubGluZShuW29dKSxoZWFkZXI6ITAsYWxpZ246ci5hbGlnbltvXX0pO2ZvcihsZXQgbyBvZiBpKXIucm93cy5wdXNoKFkobyxyLmhlYWRlci5sZW5ndGgpLm1hcCgoYSxjKT0+KHt0ZXh0OmEsdG9rZW5zOnRoaXMubGV4ZXIuaW5saW5lKGEpLGhlYWRlcjohMSxhbGlnbjpyLmFsaWduW2NdfSkpKTtyZXR1cm4gcn19bGhlYWRpbmcoZSl7bGV0IHQ9dGhpcy5ydWxlcy5ibG9jay5saGVhZGluZy5leGVjKGUpO2lmKHQpcmV0dXJue3R5cGU6ImhlYWRpbmciLHJhdzp0WzBdLGRlcHRoOnRbMl0uY2hhckF0KDApPT09Ij0iPzE6Mix0ZXh0OnRbMV0sdG9rZW5zOnRoaXMubGV4ZXIuaW5saW5lKHRbMV0pfX1wYXJhZ3JhcGgoZSl7bGV0IHQ9dGhpcy5ydWxlcy5ibG9jay5wYXJhZ3JhcGguZXhlYyhlKTtpZih0KXtsZXQgbj10WzFdLmNoYXJBdCh0WzFdLmxlbmd0aC0xKT09PWAKYD90WzFdLnNsaWNlKDAsLTEpOnRbMV07cmV0dXJue3R5cGU6InBhcmFncmFwaCIscmF3OnRbMF0sdGV4dDpuLHRva2Vuczp0aGlzLmxleGVyLmlubGluZShuKX19fXRleHQoZSl7bGV0IHQ9dGhpcy5ydWxlcy5ibG9jay50ZXh0LmV4ZWMoZSk7aWYodClyZXR1cm57dHlwZToidGV4dCIscmF3OnRbMF0sdGV4dDp0WzBdLHRva2Vuczp0aGlzLmxleGVyLmlubGluZSh0WzBdKX19ZXNjYXBlKGUpe2xldCB0PXRoaXMucnVsZXMuaW5saW5lLmVzY2FwZS5leGVjKGUpO2lmKHQpcmV0dXJue3R5cGU6ImVzY2FwZSIscmF3OnRbMF0sdGV4dDp0WzFdfX10YWcoZSl7bGV0IHQ9dGhpcy5ydWxlcy5pbmxpbmUudGFnLmV4ZWMoZSk7aWYodClyZXR1cm4hdGhpcy5sZXhlci5zdGF0ZS5pbkxpbmsmJnRoaXMucnVsZXMub3RoZXIuc3RhcnRBVGFnLnRlc3QodFswXSk/dGhpcy5sZXhlci5zdGF0ZS5pbkxpbms9ITA6dGhpcy5sZXhlci5zdGF0ZS5pbkxpbmsmJnRoaXMucnVsZXMub3RoZXIuZW5kQVRhZy50ZXN0KHRbMF0pJiYodGhpcy5sZXhlci5zdGF0ZS5pbkxpbms9ITEpLCF0aGlzLmxleGVyLnN0YXRlLmluUmF3QmxvY2smJnRoaXMucnVsZXMub3RoZXIuc3RhcnRQcmVTY3JpcHRUYWcudGVzdCh0WzBdKT90aGlzLmxleGVyLnN0YXRlLmluUmF3QmxvY2s9ITA6dGhpcy5sZXhlci5zdGF0ZS5pblJhd0Jsb2NrJiZ0aGlzLnJ1bGVzLm90aGVyLmVuZFByZVNjcmlwdFRhZy50ZXN0KHRbMF0pJiYodGhpcy5sZXhlci5zdGF0ZS5pblJhd0Jsb2NrPSExKSx7dHlwZToiaHRtbCIscmF3OnRbMF0saW5MaW5rOnRoaXMubGV4ZXIuc3RhdGUuaW5MaW5rLGluUmF3QmxvY2s6dGhpcy5sZXhlci5zdGF0ZS5pblJhd0Jsb2NrLGJsb2NrOiExLHRleHQ6dFswXX19bGluayhlKXtsZXQgdD10aGlzLnJ1bGVzLmlubGluZS5saW5rLmV4ZWMoZSk7aWYodCl7bGV0IG49dFsyXS50cmltKCk7aWYoIXRoaXMub3B0aW9ucy5wZWRhbnRpYyYmdGhpcy5ydWxlcy5vdGhlci5zdGFydEFuZ2xlQnJhY2tldC50ZXN0KG4pKXtpZighdGhpcy5ydWxlcy5vdGhlci5lbmRBbmdsZUJyYWNrZXQudGVzdChuKSlyZXR1cm47bGV0IHI9QShuLnNsaWNlKDAsLTEpLCJcXCIpO2lmKChuLmxlbmd0aC1yLmxlbmd0aCklMj09PTApcmV0dXJufWVsc2V7bGV0IHI9ZGUodFsyXSwiKCkiKTtpZihyPT09LTIpcmV0dXJuO2lmKHI+LTEpe2xldCBhPSh0WzBdLmluZGV4T2YoIiEiKT09PTA/NTo0KSt0WzFdLmxlbmd0aCtyO3RbMl09dFsyXS5zdWJzdHJpbmcoMCxyKSx0WzBdPXRbMF0uc3Vic3RyaW5nKDAsYSkudHJpbSgpLHRbM109IiJ9fWxldCBzPXRbMl0saT0iIjtpZih0aGlzLm9wdGlvbnMucGVkYW50aWMpe2xldCByPXRoaXMucnVsZXMub3RoZXIucGVkYW50aWNIcmVmVGl0bGUuZXhlYyhzKTtyJiYocz1yWzFdLGk9clszXSl9ZWxzZSBpPXRbM10/dFszXS5zbGljZSgxLC0xKToiIjtyZXR1cm4gcz1zLnRyaW0oKSx0aGlzLnJ1bGVzLm90aGVyLnN0YXJ0QW5nbGVCcmFja2V0LnRlc3QocykmJih0aGlzLm9wdGlvbnMucGVkYW50aWMmJiF0aGlzLnJ1bGVzLm90aGVyLmVuZEFuZ2xlQnJhY2tldC50ZXN0KG4pP3M9cy5zbGljZSgxKTpzPXMuc2xpY2UoMSwtMSkpLG1lKHQse2hyZWY6cyYmcy5yZXBsYWNlKHRoaXMucnVsZXMuaW5saW5lLmFueVB1bmN0dWF0aW9uLCIkMSIpLHRpdGxlOmkmJmkucmVwbGFjZSh0aGlzLnJ1bGVzLmlubGluZS5hbnlQdW5jdHVhdGlvbiwiJDEiKX0sdFswXSx0aGlzLmxleGVyLHRoaXMucnVsZXMpfX1yZWZsaW5rKGUsdCl7bGV0IG47aWYoKG49dGhpcy5ydWxlcy5pbmxpbmUucmVmbGluay5leGVjKGUpKXx8KG49dGhpcy5ydWxlcy5pbmxpbmUubm9saW5rLmV4ZWMoZSkpKXtsZXQgcz0oblsyXXx8blsxXSkucmVwbGFjZSh0aGlzLnJ1bGVzLm90aGVyLm11bHRpcGxlU3BhY2VHbG9iYWwsIiAiKSxpPXRbcy50b0xvd2VyQ2FzZSgpXTtpZighaSl7bGV0IHI9blswXS5jaGFyQXQoMCk7cmV0dXJue3R5cGU6InRleHQiLHJhdzpyLHRleHQ6cn19cmV0dXJuIG1lKG4saSxuWzBdLHRoaXMubGV4ZXIsdGhpcy5ydWxlcyl9fWVtU3Ryb25nKGUsdCxuPSIiKXtsZXQgcz10aGlzLnJ1bGVzLmlubGluZS5lbVN0cm9uZ0xEZWxpbS5leGVjKGUpO2lmKCFzfHxzWzNdJiZuLm1hdGNoKHRoaXMucnVsZXMub3RoZXIudW5pY29kZUFscGhhTnVtZXJpYykpcmV0dXJuO2lmKCEoc1sxXXx8c1syXXx8IiIpfHwhbnx8dGhpcy5ydWxlcy5pbmxpbmUucHVuY3R1YXRpb24uZXhlYyhuKSl7bGV0IHI9Wy4uLnNbMF1dLmxlbmd0aC0xLG8sYSxjPXIscD0wLHU9c1swXVswXT09PSIqIj90aGlzLnJ1bGVzLmlubGluZS5lbVN0cm9uZ1JEZWxpbUFzdDp0aGlzLnJ1bGVzLmlubGluZS5lbVN0cm9uZ1JEZWxpbVVuZDtmb3IodS5sYXN0SW5kZXg9MCx0PXQuc2xpY2UoLTEqZS5sZW5ndGgrcik7KHM9dS5leGVjKHQpKSE9bnVsbDspe2lmKG89c1sxXXx8c1syXXx8c1szXXx8c1s0XXx8c1s1XXx8c1s2XSwhbyljb250aW51ZTtpZihhPVsuLi5vXS5sZW5ndGgsc1szXXx8c1s0XSl7Yys9YTtjb250aW51ZX1lbHNlIGlmKChzWzVdfHxzWzZdKSYmciUzJiYhKChyK2EpJTMpKXtwKz1hO2NvbnRpbnVlfWlmKGMtPWEsYz4wKWNvbnRpbnVlO2E9TWF0aC5taW4oYSxhK2MrcCk7bGV0IGQ9Wy4uLnNbMF1dWzBdLmxlbmd0aCxnPWUuc2xpY2UoMCxyK3MuaW5kZXgrZCthKTtpZihNYXRoLm1pbihyLGEpJTIpe2xldCBmPWcuc2xpY2UoMSwtMSk7cmV0dXJue3R5cGU6ImVtIixyYXc6Zyx0ZXh0OmYsdG9rZW5zOnRoaXMubGV4ZXIuaW5saW5lVG9rZW5zKGYpfX1sZXQgVD1nLnNsaWNlKDIsLTIpO3JldHVybnt0eXBlOiJzdHJvbmciLHJhdzpnLHRleHQ6VCx0b2tlbnM6dGhpcy5sZXhlci5pbmxpbmVUb2tlbnMoVCl9fX19Y29kZXNwYW4oZSl7bGV0IHQ9dGhpcy5ydWxlcy5pbmxpbmUuY29kZS5leGVjKGUpO2lmKHQpe2xldCBuPXRbMl0ucmVwbGFjZSh0aGlzLnJ1bGVzLm90aGVyLm5ld0xpbmVDaGFyR2xvYmFsLCIgIikscz10aGlzLnJ1bGVzLm90aGVyLm5vblNwYWNlQ2hhci50ZXN0KG4pLGk9dGhpcy5ydWxlcy5vdGhlci5zdGFydGluZ1NwYWNlQ2hhci50ZXN0KG4pJiZ0aGlzLnJ1bGVzLm90aGVyLmVuZGluZ1NwYWNlQ2hhci50ZXN0KG4pO3JldHVybiBzJiZpJiYobj1uLnN1YnN0cmluZygxLG4ubGVuZ3RoLTEpKSx7dHlwZToiY29kZXNwYW4iLHJhdzp0WzBdLHRleHQ6bn19fWJyKGUpe2xldCB0PXRoaXMucnVsZXMuaW5saW5lLmJyLmV4ZWMoZSk7aWYodClyZXR1cm57dHlwZToiYnIiLHJhdzp0WzBdfX1kZWwoZSl7bGV0IHQ9dGhpcy5ydWxlcy5pbmxpbmUuZGVsLmV4ZWMoZSk7aWYodClyZXR1cm57dHlwZToiZGVsIixyYXc6dFswXSx0ZXh0OnRbMl0sdG9rZW5zOnRoaXMubGV4ZXIuaW5saW5lVG9rZW5zKHRbMl0pfX1hdXRvbGluayhlKXtsZXQgdD10aGlzLnJ1bGVzLmlubGluZS5hdXRvbGluay5leGVjKGUpO2lmKHQpe2xldCBuLHM7cmV0dXJuIHRbMl09PT0iQCI/KG49dFsxXSxzPSJtYWlsdG86IituKToobj10WzFdLHM9bikse3R5cGU6ImxpbmsiLHJhdzp0WzBdLHRleHQ6bixocmVmOnMsdG9rZW5zOlt7dHlwZToidGV4dCIscmF3Om4sdGV4dDpufV19fX11cmwoZSl7bGV0IHQ7aWYodD10aGlzLnJ1bGVzLmlubGluZS51cmwuZXhlYyhlKSl7bGV0IG4scztpZih0WzJdPT09IkAiKW49dFswXSxzPSJtYWlsdG86IituO2Vsc2V7bGV0IGk7ZG8gaT10WzBdLHRbMF09dGhpcy5ydWxlcy5pbmxpbmUuX2JhY2twZWRhbC5leGVjKHRbMF0pPy5bMF0/PyIiO3doaWxlKGkhPT10WzBdKTtuPXRbMF0sdFsxXT09PSJ3d3cuIj9zPSJodHRwOi8vIit0WzBdOnM9dFswXX1yZXR1cm57dHlwZToibGluayIscmF3OnRbMF0sdGV4dDpuLGhyZWY6cyx0b2tlbnM6W3t0eXBlOiJ0ZXh0IixyYXc6bix0ZXh0Om59XX19fWlubGluZVRleHQoZSl7bGV0IHQ9dGhpcy5ydWxlcy5pbmxpbmUudGV4dC5leGVjKGUpO2lmKHQpe2xldCBuPXRoaXMubGV4ZXIuc3RhdGUuaW5SYXdCbG9jaztyZXR1cm57dHlwZToidGV4dCIscmF3OnRbMF0sdGV4dDp0WzBdLGVzY2FwZWQ6bn19fX07dmFyIHg9Y2xhc3MgbHt0b2tlbnM7b3B0aW9ucztzdGF0ZTt0b2tlbml6ZXI7aW5saW5lUXVldWU7Y29uc3RydWN0b3IoZSl7dGhpcy50b2tlbnM9W10sdGhpcy50b2tlbnMubGlua3M9T2JqZWN0LmNyZWF0ZShudWxsKSx0aGlzLm9wdGlvbnM9ZXx8dyx0aGlzLm9wdGlvbnMudG9rZW5pemVyPXRoaXMub3B0aW9ucy50b2tlbml6ZXJ8fG5ldyBTLHRoaXMudG9rZW5pemVyPXRoaXMub3B0aW9ucy50b2tlbml6ZXIsdGhpcy50b2tlbml6ZXIub3B0aW9ucz10aGlzLm9wdGlvbnMsdGhpcy50b2tlbml6ZXIubGV4ZXI9dGhpcyx0aGlzLmlubGluZVF1ZXVlPVtdLHRoaXMuc3RhdGU9e2luTGluazohMSxpblJhd0Jsb2NrOiExLHRvcDohMH07bGV0IHQ9e290aGVyOm0sYmxvY2s6Qi5ub3JtYWwsaW5saW5lOlAubm9ybWFsfTt0aGlzLm9wdGlvbnMucGVkYW50aWM/KHQuYmxvY2s9Qi5wZWRhbnRpYyx0LmlubGluZT1QLnBlZGFudGljKTp0aGlzLm9wdGlvbnMuZ2ZtJiYodC5ibG9jaz1CLmdmbSx0aGlzLm9wdGlvbnMuYnJlYWtzP3QuaW5saW5lPVAuYnJlYWtzOnQuaW5saW5lPVAuZ2ZtKSx0aGlzLnRva2VuaXplci5ydWxlcz10fXN0YXRpYyBnZXQgcnVsZXMoKXtyZXR1cm57YmxvY2s6QixpbmxpbmU6UH19c3RhdGljIGxleChlLHQpe3JldHVybiBuZXcgbCh0KS5sZXgoZSl9c3RhdGljIGxleElubGluZShlLHQpe3JldHVybiBuZXcgbCh0KS5pbmxpbmVUb2tlbnMoZSl9bGV4KGUpe2U9ZS5yZXBsYWNlKG0uY2FycmlhZ2VSZXR1cm4sYApgKSx0aGlzLmJsb2NrVG9rZW5zKGUsdGhpcy50b2tlbnMpO2ZvcihsZXQgdD0wO3Q8dGhpcy5pbmxpbmVRdWV1ZS5sZW5ndGg7dCsrKXtsZXQgbj10aGlzLmlubGluZVF1ZXVlW3RdO3RoaXMuaW5saW5lVG9rZW5zKG4uc3JjLG4udG9rZW5zKX1yZXR1cm4gdGhpcy5pbmxpbmVRdWV1ZT1bXSx0aGlzLnRva2Vuc31ibG9ja1Rva2VucyhlLHQ9W10sbj0hMSl7Zm9yKHRoaXMub3B0aW9ucy5wZWRhbnRpYyYmKGU9ZS5yZXBsYWNlKG0udGFiQ2hhckdsb2JhbCwiICAgICIpLnJlcGxhY2UobS5zcGFjZUxpbmUsIiIpKTtlOyl7bGV0IHM7aWYodGhpcy5vcHRpb25zLmV4dGVuc2lvbnM/LmJsb2NrPy5zb21lKHI9PihzPXIuY2FsbCh7bGV4ZXI6dGhpc30sZSx0KSk/KGU9ZS5zdWJzdHJpbmcocy5yYXcubGVuZ3RoKSx0LnB1c2gocyksITApOiExKSljb250aW51ZTtpZihzPXRoaXMudG9rZW5pemVyLnNwYWNlKGUpKXtlPWUuc3Vic3RyaW5nKHMucmF3Lmxlbmd0aCk7bGV0IHI9dC5hdCgtMSk7cy5yYXcubGVuZ3RoPT09MSYmciE9PXZvaWQgMD9yLnJhdys9YApgOnQucHVzaChzKTtjb250aW51ZX1pZihzPXRoaXMudG9rZW5pemVyLmNvZGUoZSkpe2U9ZS5zdWJzdHJpbmcocy5yYXcubGVuZ3RoKTtsZXQgcj10LmF0KC0xKTtyPy50eXBlPT09InBhcmFncmFwaCJ8fHI/LnR5cGU9PT0idGV4dCI/KHIucmF3Kz1gCmArcy5yYXcsci50ZXh0Kz1gCmArcy50ZXh0LHRoaXMuaW5saW5lUXVldWUuYXQoLTEpLnNyYz1yLnRleHQpOnQucHVzaChzKTtjb250aW51ZX1pZihzPXRoaXMudG9rZW5pemVyLmZlbmNlcyhlKSl7ZT1lLnN1YnN0cmluZyhzLnJhdy5sZW5ndGgpLHQucHVzaChzKTtjb250aW51ZX1pZihzPXRoaXMudG9rZW5pemVyLmhlYWRpbmcoZSkpe2U9ZS5zdWJzdHJpbmcocy5yYXcubGVuZ3RoKSx0LnB1c2gocyk7Y29udGludWV9aWYocz10aGlzLnRva2VuaXplci5ocihlKSl7ZT1lLnN1YnN0cmluZyhzLnJhdy5sZW5ndGgpLHQucHVzaChzKTtjb250aW51ZX1pZihzPXRoaXMudG9rZW5pemVyLmJsb2NrcXVvdGUoZSkpe2U9ZS5zdWJzdHJpbmcocy5yYXcubGVuZ3RoKSx0LnB1c2gocyk7Y29udGludWV9aWYocz10aGlzLnRva2VuaXplci5saXN0KGUpKXtlPWUuc3Vic3RyaW5nKHMucmF3Lmxlbmd0aCksdC5wdXNoKHMpO2NvbnRpbnVlfWlmKHM9dGhpcy50b2tlbml6ZXIuaHRtbChlKSl7ZT1lLnN1YnN0cmluZyhzLnJhdy5sZW5ndGgpLHQucHVzaChzKTtjb250aW51ZX1pZihzPXRoaXMudG9rZW5pemVyLmRlZihlKSl7ZT1lLnN1YnN0cmluZyhzLnJhdy5sZW5ndGgpO2xldCByPXQuYXQoLTEpO3I/LnR5cGU9PT0icGFyYWdyYXBoInx8cj8udHlwZT09PSJ0ZXh0Ij8oci5yYXcrPWAKYCtzLnJhdyxyLnRleHQrPWAKYCtzLnJhdyx0aGlzLmlubGluZVF1ZXVlLmF0KC0xKS5zcmM9ci50ZXh0KTp0aGlzLnRva2Vucy5saW5rc1tzLnRhZ118fCh0aGlzLnRva2Vucy5saW5rc1tzLnRhZ109e2hyZWY6cy5ocmVmLHRpdGxlOnMudGl0bGV9KTtjb250aW51ZX1pZihzPXRoaXMudG9rZW5pemVyLnRhYmxlKGUpKXtlPWUuc3Vic3RyaW5nKHMucmF3Lmxlbmd0aCksdC5wdXNoKHMpO2NvbnRpbnVlfWlmKHM9dGhpcy50b2tlbml6ZXIubGhlYWRpbmcoZSkpe2U9ZS5zdWJzdHJpbmcocy5yYXcubGVuZ3RoKSx0LnB1c2gocyk7Y29udGludWV9bGV0IGk9ZTtpZih0aGlzLm9wdGlvbnMuZXh0ZW5zaW9ucz8uc3RhcnRCbG9jayl7bGV0IHI9MS8wLG89ZS5zbGljZSgxKSxhO3RoaXMub3B0aW9ucy5leHRlbnNpb25zLnN0YXJ0QmxvY2suZm9yRWFjaChjPT57YT1jLmNhbGwoe2xleGVyOnRoaXN9LG8pLHR5cGVvZiBhPT0ibnVtYmVyIiYmYT49MCYmKHI9TWF0aC5taW4ocixhKSl9KSxyPDEvMCYmcj49MCYmKGk9ZS5zdWJzdHJpbmcoMCxyKzEpKX1pZih0aGlzLnN0YXRlLnRvcCYmKHM9dGhpcy50b2tlbml6ZXIucGFyYWdyYXBoKGkpKSl7bGV0IHI9dC5hdCgtMSk7biYmcj8udHlwZT09PSJwYXJhZ3JhcGgiPyhyLnJhdys9YApgK3MucmF3LHIudGV4dCs9YApgK3MudGV4dCx0aGlzLmlubGluZVF1ZXVlLnBvcCgpLHRoaXMuaW5saW5lUXVldWUuYXQoLTEpLnNyYz1yLnRleHQpOnQucHVzaChzKSxuPWkubGVuZ3RoIT09ZS5sZW5ndGgsZT1lLnN1YnN0cmluZyhzLnJhdy5sZW5ndGgpO2NvbnRpbnVlfWlmKHM9dGhpcy50b2tlbml6ZXIudGV4dChlKSl7ZT1lLnN1YnN0cmluZyhzLnJhdy5sZW5ndGgpO2xldCByPXQuYXQoLTEpO3I/LnR5cGU9PT0idGV4dCI/KHIucmF3Kz1gCmArcy5yYXcsci50ZXh0Kz1gCmArcy50ZXh0LHRoaXMuaW5saW5lUXVldWUucG9wKCksdGhpcy5pbmxpbmVRdWV1ZS5hdCgtMSkuc3JjPXIudGV4dCk6dC5wdXNoKHMpO2NvbnRpbnVlfWlmKGUpe2xldCByPSJJbmZpbml0ZSBsb29wIG9uIGJ5dGU6ICIrZS5jaGFyQ29kZUF0KDApO2lmKHRoaXMub3B0aW9ucy5zaWxlbnQpe2NvbnNvbGUuZXJyb3Iocik7YnJlYWt9ZWxzZSB0aHJvdyBuZXcgRXJyb3Iocil9fXJldHVybiB0aGlzLnN0YXRlLnRvcD0hMCx0fWlubGluZShlLHQ9W10pe3JldHVybiB0aGlzLmlubGluZVF1ZXVlLnB1c2goe3NyYzplLHRva2Vuczp0fSksdH1pbmxpbmVUb2tlbnMoZSx0PVtdKXtsZXQgbj1lLHM9bnVsbDtpZih0aGlzLnRva2Vucy5saW5rcyl7bGV0IG89T2JqZWN0LmtleXModGhpcy50b2tlbnMubGlua3MpO2lmKG8ubGVuZ3RoPjApZm9yKDsocz10aGlzLnRva2VuaXplci5ydWxlcy5pbmxpbmUucmVmbGlua1NlYXJjaC5leGVjKG4pKSE9bnVsbDspby5pbmNsdWRlcyhzWzBdLnNsaWNlKHNbMF0ubGFzdEluZGV4T2YoIlsiKSsxLC0xKSkmJihuPW4uc2xpY2UoMCxzLmluZGV4KSsiWyIrImEiLnJlcGVhdChzWzBdLmxlbmd0aC0yKSsiXSIrbi5zbGljZSh0aGlzLnRva2VuaXplci5ydWxlcy5pbmxpbmUucmVmbGlua1NlYXJjaC5sYXN0SW5kZXgpKX1mb3IoOyhzPXRoaXMudG9rZW5pemVyLnJ1bGVzLmlubGluZS5hbnlQdW5jdHVhdGlvbi5leGVjKG4pKSE9bnVsbDspbj1uLnNsaWNlKDAscy5pbmRleCkrIisrIituLnNsaWNlKHRoaXMudG9rZW5pemVyLnJ1bGVzLmlubGluZS5hbnlQdW5jdHVhdGlvbi5sYXN0SW5kZXgpO2Zvcig7KHM9dGhpcy50b2tlbml6ZXIucnVsZXMuaW5saW5lLmJsb2NrU2tpcC5leGVjKG4pKSE9bnVsbDspbj1uLnNsaWNlKDAscy5pbmRleCkrIlsiKyJhIi5yZXBlYXQoc1swXS5sZW5ndGgtMikrIl0iK24uc2xpY2UodGhpcy50b2tlbml6ZXIucnVsZXMuaW5saW5lLmJsb2NrU2tpcC5sYXN0SW5kZXgpO2xldCBpPSExLHI9IiI7Zm9yKDtlOyl7aXx8KHI9IiIpLGk9ITE7bGV0IG87aWYodGhpcy5vcHRpb25zLmV4dGVuc2lvbnM/LmlubGluZT8uc29tZShjPT4obz1jLmNhbGwoe2xleGVyOnRoaXN9LGUsdCkpPyhlPWUuc3Vic3RyaW5nKG8ucmF3Lmxlbmd0aCksdC5wdXNoKG8pLCEwKTohMSkpY29udGludWU7aWYobz10aGlzLnRva2VuaXplci5lc2NhcGUoZSkpe2U9ZS5zdWJzdHJpbmcoby5yYXcubGVuZ3RoKSx0LnB1c2gobyk7Y29udGludWV9aWYobz10aGlzLnRva2VuaXplci50YWcoZSkpe2U9ZS5zdWJzdHJpbmcoby5yYXcubGVuZ3RoKSx0LnB1c2gobyk7Y29udGludWV9aWYobz10aGlzLnRva2VuaXplci5saW5rKGUpKXtlPWUuc3Vic3RyaW5nKG8ucmF3Lmxlbmd0aCksdC5wdXNoKG8pO2NvbnRpbnVlfWlmKG89dGhpcy50b2tlbml6ZXIucmVmbGluayhlLHRoaXMudG9rZW5zLmxpbmtzKSl7ZT1lLnN1YnN0cmluZyhvLnJhdy5sZW5ndGgpO2xldCBjPXQuYXQoLTEpO28udHlwZT09PSJ0ZXh0IiYmYz8udHlwZT09PSJ0ZXh0Ij8oYy5yYXcrPW8ucmF3LGMudGV4dCs9by50ZXh0KTp0LnB1c2gobyk7Y29udGludWV9aWYobz10aGlzLnRva2VuaXplci5lbVN0cm9uZyhlLG4scikpe2U9ZS5zdWJzdHJpbmcoby5yYXcubGVuZ3RoKSx0LnB1c2gobyk7Y29udGludWV9aWYobz10aGlzLnRva2VuaXplci5jb2Rlc3BhbihlKSl7ZT1lLnN1YnN0cmluZyhvLnJhdy5sZW5ndGgpLHQucHVzaChvKTtjb250aW51ZX1pZihvPXRoaXMudG9rZW5pemVyLmJyKGUpKXtlPWUuc3Vic3RyaW5nKG8ucmF3Lmxlbmd0aCksdC5wdXNoKG8pO2NvbnRpbnVlfWlmKG89dGhpcy50b2tlbml6ZXIuZGVsKGUpKXtlPWUuc3Vic3RyaW5nKG8ucmF3Lmxlbmd0aCksdC5wdXNoKG8pO2NvbnRpbnVlfWlmKG89dGhpcy50b2tlbml6ZXIuYXV0b2xpbmsoZSkpe2U9ZS5zdWJzdHJpbmcoby5yYXcubGVuZ3RoKSx0LnB1c2gobyk7Y29udGludWV9aWYoIXRoaXMuc3RhdGUuaW5MaW5rJiYobz10aGlzLnRva2VuaXplci51cmwoZSkpKXtlPWUuc3Vic3RyaW5nKG8ucmF3Lmxlbmd0aCksdC5wdXNoKG8pO2NvbnRpbnVlfWxldCBhPWU7aWYodGhpcy5vcHRpb25zLmV4dGVuc2lvbnM/LnN0YXJ0SW5saW5lKXtsZXQgYz0xLzAscD1lLnNsaWNlKDEpLHU7dGhpcy5vcHRpb25zLmV4dGVuc2lvbnMuc3RhcnRJbmxpbmUuZm9yRWFjaChkPT57dT1kLmNhbGwoe2xleGVyOnRoaXN9LHApLHR5cGVvZiB1PT0ibnVtYmVyIiYmdT49MCYmKGM9TWF0aC5taW4oYyx1KSl9KSxjPDEvMCYmYz49MCYmKGE9ZS5zdWJzdHJpbmcoMCxjKzEpKX1pZihvPXRoaXMudG9rZW5pemVyLmlubGluZVRleHQoYSkpe2U9ZS5zdWJzdHJpbmcoby5yYXcubGVuZ3RoKSxvLnJhdy5zbGljZSgtMSkhPT0iXyImJihyPW8ucmF3LnNsaWNlKC0xKSksaT0hMDtsZXQgYz10LmF0KC0xKTtjPy50eXBlPT09InRleHQiPyhjLnJhdys9by5yYXcsYy50ZXh0Kz1vLnRleHQpOnQucHVzaChvKTtjb250aW51ZX1pZihlKXtsZXQgYz0iSW5maW5pdGUgbG9vcCBvbiBieXRlOiAiK2UuY2hhckNvZGVBdCgwKTtpZih0aGlzLm9wdGlvbnMuc2lsZW50KXtjb25zb2xlLmVycm9yKGMpO2JyZWFrfWVsc2UgdGhyb3cgbmV3IEVycm9yKGMpfX1yZXR1cm4gdH19O3ZhciAkPWNsYXNze29wdGlvbnM7cGFyc2VyO2NvbnN0cnVjdG9yKGUpe3RoaXMub3B0aW9ucz1lfHx3fXNwYWNlKGUpe3JldHVybiIifWNvZGUoe3RleHQ6ZSxsYW5nOnQsZXNjYXBlZDpufSl7bGV0IHM9KHR8fCIiKS5tYXRjaChtLm5vdFNwYWNlU3RhcnQpPy5bMF0saT1lLnJlcGxhY2UobS5lbmRpbmdOZXdsaW5lLCIiKStgCmA7cmV0dXJuIHM/JzxwcmU+PGNvZGUgY2xhc3M9Imxhbmd1YWdlLScrUihzKSsnIj4nKyhuP2k6UihpLCEwKSkrYDwvY29kZT48L3ByZT4KYDoiPHByZT48Y29kZT4iKyhuP2k6UihpLCEwKSkrYDwvY29kZT48L3ByZT4KYH1ibG9ja3F1b3RlKHt0b2tlbnM6ZX0pe3JldHVybmA8YmxvY2txdW90ZT4KJHt0aGlzLnBhcnNlci5wYXJzZShlKX08L2Jsb2NrcXVvdGU+CmB9aHRtbCh7dGV4dDplfSl7cmV0dXJuIGV9aGVhZGluZyh7dG9rZW5zOmUsZGVwdGg6dH0pe3JldHVybmA8aCR7dH0+JHt0aGlzLnBhcnNlci5wYXJzZUlubGluZShlKX08L2gke3R9PgpgfWhyKGUpe3JldHVybmA8aHI+CmB9bGlzdChlKXtsZXQgdD1lLm9yZGVyZWQsbj1lLnN0YXJ0LHM9IiI7Zm9yKGxldCBvPTA7bzxlLml0ZW1zLmxlbmd0aDtvKyspe2xldCBhPWUuaXRlbXNbb107cys9dGhpcy5saXN0aXRlbShhKX1sZXQgaT10PyJvbCI6InVsIixyPXQmJm4hPT0xPycgc3RhcnQ9IicrbisnIic6IiI7cmV0dXJuIjwiK2krcitgPgpgK3MrIjwvIitpK2A+CmB9bGlzdGl0ZW0oZSl7bGV0IHQ9IiI7aWYoZS50YXNrKXtsZXQgbj10aGlzLmNoZWNrYm94KHtjaGVja2VkOiEhZS5jaGVja2VkfSk7ZS5sb29zZT9lLnRva2Vuc1swXT8udHlwZT09PSJwYXJhZ3JhcGgiPyhlLnRva2Vuc1swXS50ZXh0PW4rIiAiK2UudG9rZW5zWzBdLnRleHQsZS50b2tlbnNbMF0udG9rZW5zJiZlLnRva2Vuc1swXS50b2tlbnMubGVuZ3RoPjAmJmUudG9rZW5zWzBdLnRva2Vuc1swXS50eXBlPT09InRleHQiJiYoZS50b2tlbnNbMF0udG9rZW5zWzBdLnRleHQ9bisiICIrUihlLnRva2Vuc1swXS50b2tlbnNbMF0udGV4dCksZS50b2tlbnNbMF0udG9rZW5zWzBdLmVzY2FwZWQ9ITApKTplLnRva2Vucy51bnNoaWZ0KHt0eXBlOiJ0ZXh0IixyYXc6bisiICIsdGV4dDpuKyIgIixlc2NhcGVkOiEwfSk6dCs9bisiICJ9cmV0dXJuIHQrPXRoaXMucGFyc2VyLnBhcnNlKGUudG9rZW5zLCEhZS5sb29zZSksYDxsaT4ke3R9PC9saT4KYH1jaGVja2JveCh7Y2hlY2tlZDplfSl7cmV0dXJuIjxpbnB1dCAiKyhlPydjaGVja2VkPSIiICc6IiIpKydkaXNhYmxlZD0iIiB0eXBlPSJjaGVja2JveCI+J31wYXJhZ3JhcGgoe3Rva2VuczplfSl7cmV0dXJuYDxwPiR7dGhpcy5wYXJzZXIucGFyc2VJbmxpbmUoZSl9PC9wPgpgfXRhYmxlKGUpe2xldCB0PSIiLG49IiI7Zm9yKGxldCBpPTA7aTxlLmhlYWRlci5sZW5ndGg7aSsrKW4rPXRoaXMudGFibGVjZWxsKGUuaGVhZGVyW2ldKTt0Kz10aGlzLnRhYmxlcm93KHt0ZXh0Om59KTtsZXQgcz0iIjtmb3IobGV0IGk9MDtpPGUucm93cy5sZW5ndGg7aSsrKXtsZXQgcj1lLnJvd3NbaV07bj0iIjtmb3IobGV0IG89MDtvPHIubGVuZ3RoO28rKyluKz10aGlzLnRhYmxlY2VsbChyW29dKTtzKz10aGlzLnRhYmxlcm93KHt0ZXh0Om59KX1yZXR1cm4gcyYmKHM9YDx0Ym9keT4ke3N9PC90Ym9keT5gKSxgPHRhYmxlPgo8dGhlYWQ+CmArdCtgPC90aGVhZD4KYCtzK2A8L3RhYmxlPgpgfXRhYmxlcm93KHt0ZXh0OmV9KXtyZXR1cm5gPHRyPgoke2V9PC90cj4KYH10YWJsZWNlbGwoZSl7bGV0IHQ9dGhpcy5wYXJzZXIucGFyc2VJbmxpbmUoZS50b2tlbnMpLG49ZS5oZWFkZXI/InRoIjoidGQiO3JldHVybihlLmFsaWduP2A8JHtufSBhbGlnbj0iJHtlLmFsaWdufSI+YDpgPCR7bn0+YCkrdCtgPC8ke259PgpgfXN0cm9uZyh7dG9rZW5zOmV9KXtyZXR1cm5gPHN0cm9uZz4ke3RoaXMucGFyc2VyLnBhcnNlSW5saW5lKGUpfTwvc3Ryb25nPmB9ZW0oe3Rva2VuczplfSl7cmV0dXJuYDxlbT4ke3RoaXMucGFyc2VyLnBhcnNlSW5saW5lKGUpfTwvZW0+YH1jb2Rlc3Bhbih7dGV4dDplfSl7cmV0dXJuYDxjb2RlPiR7UihlLCEwKX08L2NvZGU+YH1icihlKXtyZXR1cm4iPGJyPiJ9ZGVsKHt0b2tlbnM6ZX0pe3JldHVybmA8ZGVsPiR7dGhpcy5wYXJzZXIucGFyc2VJbmxpbmUoZSl9PC9kZWw+YH1saW5rKHtocmVmOmUsdGl0bGU6dCx0b2tlbnM6bn0pe2xldCBzPXRoaXMucGFyc2VyLnBhcnNlSW5saW5lKG4pLGk9VihlKTtpZihpPT09bnVsbClyZXR1cm4gcztlPWk7bGV0IHI9JzxhIGhyZWY9IicrZSsnIic7cmV0dXJuIHQmJihyKz0nIHRpdGxlPSInK1IodCkrJyInKSxyKz0iPiIrcysiPC9hPiIscn1pbWFnZSh7aHJlZjplLHRpdGxlOnQsdGV4dDpuLHRva2VuczpzfSl7cyYmKG49dGhpcy5wYXJzZXIucGFyc2VJbmxpbmUocyx0aGlzLnBhcnNlci50ZXh0UmVuZGVyZXIpKTtsZXQgaT1WKGUpO2lmKGk9PT1udWxsKXJldHVybiBSKG4pO2U9aTtsZXQgcj1gPGltZyBzcmM9IiR7ZX0iIGFsdD0iJHtufSJgO3JldHVybiB0JiYocis9YCB0aXRsZT0iJHtSKHQpfSJgKSxyKz0iPiIscn10ZXh0KGUpe3JldHVybiJ0b2tlbnMiaW4gZSYmZS50b2tlbnM/dGhpcy5wYXJzZXIucGFyc2VJbmxpbmUoZS50b2tlbnMpOiJlc2NhcGVkImluIGUmJmUuZXNjYXBlZD9lLnRleHQ6UihlLnRleHQpfX07dmFyIF89Y2xhc3N7c3Ryb25nKHt0ZXh0OmV9KXtyZXR1cm4gZX1lbSh7dGV4dDplfSl7cmV0dXJuIGV9Y29kZXNwYW4oe3RleHQ6ZX0pe3JldHVybiBlfWRlbCh7dGV4dDplfSl7cmV0dXJuIGV9aHRtbCh7dGV4dDplfSl7cmV0dXJuIGV9dGV4dCh7dGV4dDplfSl7cmV0dXJuIGV9bGluayh7dGV4dDplfSl7cmV0dXJuIiIrZX1pbWFnZSh7dGV4dDplfSl7cmV0dXJuIiIrZX1icigpe3JldHVybiIifX07dmFyIGI9Y2xhc3MgbHtvcHRpb25zO3JlbmRlcmVyO3RleHRSZW5kZXJlcjtjb25zdHJ1Y3RvcihlKXt0aGlzLm9wdGlvbnM9ZXx8dyx0aGlzLm9wdGlvbnMucmVuZGVyZXI9dGhpcy5vcHRpb25zLnJlbmRlcmVyfHxuZXcgJCx0aGlzLnJlbmRlcmVyPXRoaXMub3B0aW9ucy5yZW5kZXJlcix0aGlzLnJlbmRlcmVyLm9wdGlvbnM9dGhpcy5vcHRpb25zLHRoaXMucmVuZGVyZXIucGFyc2VyPXRoaXMsdGhpcy50ZXh0UmVuZGVyZXI9bmV3IF99c3RhdGljIHBhcnNlKGUsdCl7cmV0dXJuIG5ldyBsKHQpLnBhcnNlKGUpfXN0YXRpYyBwYXJzZUlubGluZShlLHQpe3JldHVybiBuZXcgbCh0KS5wYXJzZUlubGluZShlKX1wYXJzZShlLHQ9ITApe2xldCBuPSIiO2ZvcihsZXQgcz0wO3M8ZS5sZW5ndGg7cysrKXtsZXQgaT1lW3NdO2lmKHRoaXMub3B0aW9ucy5leHRlbnNpb25zPy5yZW5kZXJlcnM/LltpLnR5cGVdKXtsZXQgbz1pLGE9dGhpcy5vcHRpb25zLmV4dGVuc2lvbnMucmVuZGVyZXJzW28udHlwZV0uY2FsbCh7cGFyc2VyOnRoaXN9LG8pO2lmKGEhPT0hMXx8IVsic3BhY2UiLCJociIsImhlYWRpbmciLCJjb2RlIiwidGFibGUiLCJibG9ja3F1b3RlIiwibGlzdCIsImh0bWwiLCJwYXJhZ3JhcGgiLCJ0ZXh0Il0uaW5jbHVkZXMoby50eXBlKSl7bis9YXx8IiI7Y29udGludWV9fWxldCByPWk7c3dpdGNoKHIudHlwZSl7Y2FzZSJzcGFjZSI6e24rPXRoaXMucmVuZGVyZXIuc3BhY2Uocik7Y29udGludWV9Y2FzZSJociI6e24rPXRoaXMucmVuZGVyZXIuaHIocik7Y29udGludWV9Y2FzZSJoZWFkaW5nIjp7bis9dGhpcy5yZW5kZXJlci5oZWFkaW5nKHIpO2NvbnRpbnVlfWNhc2UiY29kZSI6e24rPXRoaXMucmVuZGVyZXIuY29kZShyKTtjb250aW51ZX1jYXNlInRhYmxlIjp7bis9dGhpcy5yZW5kZXJlci50YWJsZShyKTtjb250aW51ZX1jYXNlImJsb2NrcXVvdGUiOntuKz10aGlzLnJlbmRlcmVyLmJsb2NrcXVvdGUocik7Y29udGludWV9Y2FzZSJsaXN0Ijp7bis9dGhpcy5yZW5kZXJlci5saXN0KHIpO2NvbnRpbnVlfWNhc2UiaHRtbCI6e24rPXRoaXMucmVuZGVyZXIuaHRtbChyKTtjb250aW51ZX1jYXNlInBhcmFncmFwaCI6e24rPXRoaXMucmVuZGVyZXIucGFyYWdyYXBoKHIpO2NvbnRpbnVlfWNhc2UidGV4dCI6e2xldCBvPXIsYT10aGlzLnJlbmRlcmVyLnRleHQobyk7Zm9yKDtzKzE8ZS5sZW5ndGgmJmVbcysxXS50eXBlPT09InRleHQiOylvPWVbKytzXSxhKz1gCmArdGhpcy5yZW5kZXJlci50ZXh0KG8pO3Q/bis9dGhpcy5yZW5kZXJlci5wYXJhZ3JhcGgoe3R5cGU6InBhcmFncmFwaCIscmF3OmEsdGV4dDphLHRva2Vuczpbe3R5cGU6InRleHQiLHJhdzphLHRleHQ6YSxlc2NhcGVkOiEwfV19KTpuKz1hO2NvbnRpbnVlfWRlZmF1bHQ6e2xldCBvPSdUb2tlbiB3aXRoICInK3IudHlwZSsnIiB0eXBlIHdhcyBub3QgZm91bmQuJztpZih0aGlzLm9wdGlvbnMuc2lsZW50KXJldHVybiBjb25zb2xlLmVycm9yKG8pLCIiO3Rocm93IG5ldyBFcnJvcihvKX19fXJldHVybiBufXBhcnNlSW5saW5lKGUsdD10aGlzLnJlbmRlcmVyKXtsZXQgbj0iIjtmb3IobGV0IHM9MDtzPGUubGVuZ3RoO3MrKyl7bGV0IGk9ZVtzXTtpZih0aGlzLm9wdGlvbnMuZXh0ZW5zaW9ucz8ucmVuZGVyZXJzPy5baS50eXBlXSl7bGV0IG89dGhpcy5vcHRpb25zLmV4dGVuc2lvbnMucmVuZGVyZXJzW2kudHlwZV0uY2FsbCh7cGFyc2VyOnRoaXN9LGkpO2lmKG8hPT0hMXx8IVsiZXNjYXBlIiwiaHRtbCIsImxpbmsiLCJpbWFnZSIsInN0cm9uZyIsImVtIiwiY29kZXNwYW4iLCJiciIsImRlbCIsInRleHQiXS5pbmNsdWRlcyhpLnR5cGUpKXtuKz1vfHwiIjtjb250aW51ZX19bGV0IHI9aTtzd2l0Y2goci50eXBlKXtjYXNlImVzY2FwZSI6e24rPXQudGV4dChyKTticmVha31jYXNlImh0bWwiOntuKz10Lmh0bWwocik7YnJlYWt9Y2FzZSJsaW5rIjp7bis9dC5saW5rKHIpO2JyZWFrfWNhc2UiaW1hZ2UiOntuKz10LmltYWdlKHIpO2JyZWFrfWNhc2Uic3Ryb25nIjp7bis9dC5zdHJvbmcocik7YnJlYWt9Y2FzZSJlbSI6e24rPXQuZW0ocik7YnJlYWt9Y2FzZSJjb2Rlc3BhbiI6e24rPXQuY29kZXNwYW4ocik7YnJlYWt9Y2FzZSJiciI6e24rPXQuYnIocik7YnJlYWt9Y2FzZSJkZWwiOntuKz10LmRlbChyKTticmVha31jYXNlInRleHQiOntuKz10LnRleHQocik7YnJlYWt9ZGVmYXVsdDp7bGV0IG89J1Rva2VuIHdpdGggIicrci50eXBlKyciIHR5cGUgd2FzIG5vdCBmb3VuZC4nO2lmKHRoaXMub3B0aW9ucy5zaWxlbnQpcmV0dXJuIGNvbnNvbGUuZXJyb3IobyksIiI7dGhyb3cgbmV3IEVycm9yKG8pfX19cmV0dXJuIG59fTt2YXIgTD1jbGFzc3tvcHRpb25zO2Jsb2NrO2NvbnN0cnVjdG9yKGUpe3RoaXMub3B0aW9ucz1lfHx3fXN0YXRpYyBwYXNzVGhyb3VnaEhvb2tzPW5ldyBTZXQoWyJwcmVwcm9jZXNzIiwicG9zdHByb2Nlc3MiLCJwcm9jZXNzQWxsVG9rZW5zIl0pO3ByZXByb2Nlc3MoZSl7cmV0dXJuIGV9cG9zdHByb2Nlc3MoZSl7cmV0dXJuIGV9cHJvY2Vzc0FsbFRva2VucyhlKXtyZXR1cm4gZX1wcm92aWRlTGV4ZXIoKXtyZXR1cm4gdGhpcy5ibG9jaz94LmxleDp4LmxleElubGluZX1wcm92aWRlUGFyc2VyKCl7cmV0dXJuIHRoaXMuYmxvY2s/Yi5wYXJzZTpiLnBhcnNlSW5saW5lfX07dmFyIEU9Y2xhc3N7ZGVmYXVsdHM9eigpO29wdGlvbnM9dGhpcy5zZXRPcHRpb25zO3BhcnNlPXRoaXMucGFyc2VNYXJrZG93bighMCk7cGFyc2VJbmxpbmU9dGhpcy5wYXJzZU1hcmtkb3duKCExKTtQYXJzZXI9YjtSZW5kZXJlcj0kO1RleHRSZW5kZXJlcj1fO0xleGVyPXg7VG9rZW5pemVyPVM7SG9va3M9TDtjb25zdHJ1Y3RvciguLi5lKXt0aGlzLnVzZSguLi5lKX13YWxrVG9rZW5zKGUsdCl7bGV0IG49W107Zm9yKGxldCBzIG9mIGUpc3dpdGNoKG49bi5jb25jYXQodC5jYWxsKHRoaXMscykpLHMudHlwZSl7Y2FzZSJ0YWJsZSI6e2xldCBpPXM7Zm9yKGxldCByIG9mIGkuaGVhZGVyKW49bi5jb25jYXQodGhpcy53YWxrVG9rZW5zKHIudG9rZW5zLHQpKTtmb3IobGV0IHIgb2YgaS5yb3dzKWZvcihsZXQgbyBvZiByKW49bi5jb25jYXQodGhpcy53YWxrVG9rZW5zKG8udG9rZW5zLHQpKTticmVha31jYXNlImxpc3QiOntsZXQgaT1zO249bi5jb25jYXQodGhpcy53YWxrVG9rZW5zKGkuaXRlbXMsdCkpO2JyZWFrfWRlZmF1bHQ6e2xldCBpPXM7dGhpcy5kZWZhdWx0cy5leHRlbnNpb25zPy5jaGlsZFRva2Vucz8uW2kudHlwZV0/dGhpcy5kZWZhdWx0cy5leHRlbnNpb25zLmNoaWxkVG9rZW5zW2kudHlwZV0uZm9yRWFjaChyPT57bGV0IG89aVtyXS5mbGF0KDEvMCk7bj1uLmNvbmNhdCh0aGlzLndhbGtUb2tlbnMobyx0KSl9KTppLnRva2VucyYmKG49bi5jb25jYXQodGhpcy53YWxrVG9rZW5zKGkudG9rZW5zLHQpKSl9fXJldHVybiBufXVzZSguLi5lKXtsZXQgdD10aGlzLmRlZmF1bHRzLmV4dGVuc2lvbnN8fHtyZW5kZXJlcnM6e30sY2hpbGRUb2tlbnM6e319O3JldHVybiBlLmZvckVhY2gobj0+e2xldCBzPXsuLi5ufTtpZihzLmFzeW5jPXRoaXMuZGVmYXVsdHMuYXN5bmN8fHMuYXN5bmN8fCExLG4uZXh0ZW5zaW9ucyYmKG4uZXh0ZW5zaW9ucy5mb3JFYWNoKGk9PntpZighaS5uYW1lKXRocm93IG5ldyBFcnJvcigiZXh0ZW5zaW9uIG5hbWUgcmVxdWlyZWQiKTtpZigicmVuZGVyZXIiaW4gaSl7bGV0IHI9dC5yZW5kZXJlcnNbaS5uYW1lXTtyP3QucmVuZGVyZXJzW2kubmFtZV09ZnVuY3Rpb24oLi4ubyl7bGV0IGE9aS5yZW5kZXJlci5hcHBseSh0aGlzLG8pO3JldHVybiBhPT09ITEmJihhPXIuYXBwbHkodGhpcyxvKSksYX06dC5yZW5kZXJlcnNbaS5uYW1lXT1pLnJlbmRlcmVyfWlmKCJ0b2tlbml6ZXIiaW4gaSl7aWYoIWkubGV2ZWx8fGkubGV2ZWwhPT0iYmxvY2siJiZpLmxldmVsIT09ImlubGluZSIpdGhyb3cgbmV3IEVycm9yKCJleHRlbnNpb24gbGV2ZWwgbXVzdCBiZSAnYmxvY2snIG9yICdpbmxpbmUnIik7bGV0IHI9dFtpLmxldmVsXTtyP3IudW5zaGlmdChpLnRva2VuaXplcik6dFtpLmxldmVsXT1baS50b2tlbml6ZXJdLGkuc3RhcnQmJihpLmxldmVsPT09ImJsb2NrIj90LnN0YXJ0QmxvY2s/dC5zdGFydEJsb2NrLnB1c2goaS5zdGFydCk6dC5zdGFydEJsb2NrPVtpLnN0YXJ0XTppLmxldmVsPT09ImlubGluZSImJih0LnN0YXJ0SW5saW5lP3Quc3RhcnRJbmxpbmUucHVzaChpLnN0YXJ0KTp0LnN0YXJ0SW5saW5lPVtpLnN0YXJ0XSkpfSJjaGlsZFRva2VucyJpbiBpJiZpLmNoaWxkVG9rZW5zJiYodC5jaGlsZFRva2Vuc1tpLm5hbWVdPWkuY2hpbGRUb2tlbnMpfSkscy5leHRlbnNpb25zPXQpLG4ucmVuZGVyZXIpe2xldCBpPXRoaXMuZGVmYXVsdHMucmVuZGVyZXJ8fG5ldyAkKHRoaXMuZGVmYXVsdHMpO2ZvcihsZXQgciBpbiBuLnJlbmRlcmVyKXtpZighKHIgaW4gaSkpdGhyb3cgbmV3IEVycm9yKGByZW5kZXJlciAnJHtyfScgZG9lcyBub3QgZXhpc3RgKTtpZihbIm9wdGlvbnMiLCJwYXJzZXIiXS5pbmNsdWRlcyhyKSljb250aW51ZTtsZXQgbz1yLGE9bi5yZW5kZXJlcltvXSxjPWlbb107aVtvXT0oLi4ucCk9PntsZXQgdT1hLmFwcGx5KGkscCk7cmV0dXJuIHU9PT0hMSYmKHU9Yy5hcHBseShpLHApKSx1fHwiIn19cy5yZW5kZXJlcj1pfWlmKG4udG9rZW5pemVyKXtsZXQgaT10aGlzLmRlZmF1bHRzLnRva2VuaXplcnx8bmV3IFModGhpcy5kZWZhdWx0cyk7Zm9yKGxldCByIGluIG4udG9rZW5pemVyKXtpZighKHIgaW4gaSkpdGhyb3cgbmV3IEVycm9yKGB0b2tlbml6ZXIgJyR7cn0nIGRvZXMgbm90IGV4aXN0YCk7aWYoWyJvcHRpb25zIiwicnVsZXMiLCJsZXhlciJdLmluY2x1ZGVzKHIpKWNvbnRpbnVlO2xldCBvPXIsYT1uLnRva2VuaXplcltvXSxjPWlbb107aVtvXT0oLi4ucCk9PntsZXQgdT1hLmFwcGx5KGkscCk7cmV0dXJuIHU9PT0hMSYmKHU9Yy5hcHBseShpLHApKSx1fX1zLnRva2VuaXplcj1pfWlmKG4uaG9va3Mpe2xldCBpPXRoaXMuZGVmYXVsdHMuaG9va3N8fG5ldyBMO2ZvcihsZXQgciBpbiBuLmhvb2tzKXtpZighKHIgaW4gaSkpdGhyb3cgbmV3IEVycm9yKGBob29rICcke3J9JyBkb2VzIG5vdCBleGlzdGApO2lmKFsib3B0aW9ucyIsImJsb2NrIl0uaW5jbHVkZXMocikpY29udGludWU7bGV0IG89cixhPW4uaG9va3Nbb10sYz1pW29dO0wucGFzc1Rocm91Z2hIb29rcy5oYXMocik/aVtvXT1wPT57aWYodGhpcy5kZWZhdWx0cy5hc3luYylyZXR1cm4gUHJvbWlzZS5yZXNvbHZlKGEuY2FsbChpLHApKS50aGVuKGQ9PmMuY2FsbChpLGQpKTtsZXQgdT1hLmNhbGwoaSxwKTtyZXR1cm4gYy5jYWxsKGksdSl9Omlbb109KC4uLnApPT57bGV0IHU9YS5hcHBseShpLHApO3JldHVybiB1PT09ITEmJih1PWMuYXBwbHkoaSxwKSksdX19cy5ob29rcz1pfWlmKG4ud2Fsa1Rva2Vucyl7bGV0IGk9dGhpcy5kZWZhdWx0cy53YWxrVG9rZW5zLHI9bi53YWxrVG9rZW5zO3Mud2Fsa1Rva2Vucz1mdW5jdGlvbihvKXtsZXQgYT1bXTtyZXR1cm4gYS5wdXNoKHIuY2FsbCh0aGlzLG8pKSxpJiYoYT1hLmNvbmNhdChpLmNhbGwodGhpcyxvKSkpLGF9fXRoaXMuZGVmYXVsdHM9ey4uLnRoaXMuZGVmYXVsdHMsLi4uc319KSx0aGlzfXNldE9wdGlvbnMoZSl7cmV0dXJuIHRoaXMuZGVmYXVsdHM9ey4uLnRoaXMuZGVmYXVsdHMsLi4uZX0sdGhpc31sZXhlcihlLHQpe3JldHVybiB4LmxleChlLHQ/P3RoaXMuZGVmYXVsdHMpfXBhcnNlcihlLHQpe3JldHVybiBiLnBhcnNlKGUsdD8/dGhpcy5kZWZhdWx0cyl9cGFyc2VNYXJrZG93bihlKXtyZXR1cm4obixzKT0+e2xldCBpPXsuLi5zfSxyPXsuLi50aGlzLmRlZmF1bHRzLC4uLml9LG89dGhpcy5vbkVycm9yKCEhci5zaWxlbnQsISFyLmFzeW5jKTtpZih0aGlzLmRlZmF1bHRzLmFzeW5jPT09ITAmJmkuYXN5bmM9PT0hMSlyZXR1cm4gbyhuZXcgRXJyb3IoIm1hcmtlZCgpOiBUaGUgYXN5bmMgb3B0aW9uIHdhcyBzZXQgdG8gdHJ1ZSBieSBhbiBleHRlbnNpb24uIFJlbW92ZSBhc3luYzogZmFsc2UgZnJvbSB0aGUgcGFyc2Ugb3B0aW9ucyBvYmplY3QgdG8gcmV0dXJuIGEgUHJvbWlzZS4iKSk7aWYodHlwZW9mIG4+InUifHxuPT09bnVsbClyZXR1cm4gbyhuZXcgRXJyb3IoIm1hcmtlZCgpOiBpbnB1dCBwYXJhbWV0ZXIgaXMgdW5kZWZpbmVkIG9yIG51bGwiKSk7aWYodHlwZW9mIG4hPSJzdHJpbmciKXJldHVybiBvKG5ldyBFcnJvcigibWFya2VkKCk6IGlucHV0IHBhcmFtZXRlciBpcyBvZiB0eXBlICIrT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKG4pKyIsIHN0cmluZyBleHBlY3RlZCIpKTtyLmhvb2tzJiYoci5ob29rcy5vcHRpb25zPXIsci5ob29rcy5ibG9jaz1lKTtsZXQgYT1yLmhvb2tzP3IuaG9va3MucHJvdmlkZUxleGVyKCk6ZT94LmxleDp4LmxleElubGluZSxjPXIuaG9va3M/ci5ob29rcy5wcm92aWRlUGFyc2VyKCk6ZT9iLnBhcnNlOmIucGFyc2VJbmxpbmU7aWYoci5hc3luYylyZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHIuaG9va3M/ci5ob29rcy5wcmVwcm9jZXNzKG4pOm4pLnRoZW4ocD0+YShwLHIpKS50aGVuKHA9PnIuaG9va3M/ci5ob29rcy5wcm9jZXNzQWxsVG9rZW5zKHApOnApLnRoZW4ocD0+ci53YWxrVG9rZW5zP1Byb21pc2UuYWxsKHRoaXMud2Fsa1Rva2VucyhwLHIud2Fsa1Rva2VucykpLnRoZW4oKCk9PnApOnApLnRoZW4ocD0+YyhwLHIpKS50aGVuKHA9PnIuaG9va3M/ci5ob29rcy5wb3N0cHJvY2VzcyhwKTpwKS5jYXRjaChvKTt0cnl7ci5ob29rcyYmKG49ci5ob29rcy5wcmVwcm9jZXNzKG4pKTtsZXQgcD1hKG4scik7ci5ob29rcyYmKHA9ci5ob29rcy5wcm9jZXNzQWxsVG9rZW5zKHApKSxyLndhbGtUb2tlbnMmJnRoaXMud2Fsa1Rva2VucyhwLHIud2Fsa1Rva2Vucyk7bGV0IHU9YyhwLHIpO3JldHVybiByLmhvb2tzJiYodT1yLmhvb2tzLnBvc3Rwcm9jZXNzKHUpKSx1fWNhdGNoKHApe3JldHVybiBvKHApfX19b25FcnJvcihlLHQpe3JldHVybiBuPT57aWYobi5tZXNzYWdlKz1gClBsZWFzZSByZXBvcnQgdGhpcyB0byBodHRwczovL2dpdGh1Yi5jb20vbWFya2VkanMvbWFya2VkLmAsZSl7bGV0IHM9IjxwPkFuIGVycm9yIG9jY3VycmVkOjwvcD48cHJlPiIrUihuLm1lc3NhZ2UrIiIsITApKyI8L3ByZT4iO3JldHVybiB0P1Byb21pc2UucmVzb2x2ZShzKTpzfWlmKHQpcmV0dXJuIFByb21pc2UucmVqZWN0KG4pO3Rocm93IG59fX07dmFyIE09bmV3IEU7ZnVuY3Rpb24gayhsLGUpe3JldHVybiBNLnBhcnNlKGwsZSl9ay5vcHRpb25zPWsuc2V0T3B0aW9ucz1mdW5jdGlvbihsKXtyZXR1cm4gTS5zZXRPcHRpb25zKGwpLGsuZGVmYXVsdHM9TS5kZWZhdWx0cyxOKGsuZGVmYXVsdHMpLGt9O2suZ2V0RGVmYXVsdHM9ejtrLmRlZmF1bHRzPXc7ay51c2U9ZnVuY3Rpb24oLi4ubCl7cmV0dXJuIE0udXNlKC4uLmwpLGsuZGVmYXVsdHM9TS5kZWZhdWx0cyxOKGsuZGVmYXVsdHMpLGt9O2sud2Fsa1Rva2Vucz1mdW5jdGlvbihsLGUpe3JldHVybiBNLndhbGtUb2tlbnMobCxlKX07ay5wYXJzZUlubGluZT1NLnBhcnNlSW5saW5lO2suUGFyc2VyPWI7ay5wYXJzZXI9Yi5wYXJzZTtrLlJlbmRlcmVyPSQ7ay5UZXh0UmVuZGVyZXI9XztrLkxleGVyPXg7ay5sZXhlcj14LmxleDtrLlRva2VuaXplcj1TO2suSG9va3M9TDtrLnBhcnNlPWs7dmFyIGl0PWsub3B0aW9ucyxvdD1rLnNldE9wdGlvbnMsbHQ9ay51c2UsYXQ9ay53YWxrVG9rZW5zLGN0PWsucGFyc2VJbmxpbmUscHQ9ayx1dD1iLnBhcnNlLGh0PXgubGV4OwoKaWYoX19leHBvcnRzICE9IGV4cG9ydHMpbW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzO3JldHVybiBtb2R1bGUuZXhwb3J0c30pKTsK',
    purify: 'LyohIEBsaWNlbnNlIERPTVB1cmlmeSAzLjIuNiB8IChjKSBDdXJlNTMgYW5kIG90aGVyIGNvbnRyaWJ1dG9ycyB8IFJlbGVhc2VkIHVuZGVyIHRoZSBBcGFjaGUgbGljZW5zZSAyLjAgYW5kIE1vemlsbGEgUHVibGljIExpY2Vuc2UgMi4wIHwgZ2l0aHViLmNvbS9jdXJlNTMvRE9NUHVyaWZ5L2Jsb2IvMy4yLjYvTElDRU5TRSAqLwohZnVuY3Rpb24oZSx0KXsib2JqZWN0Ij09dHlwZW9mIGV4cG9ydHMmJiJ1bmRlZmluZWQiIT10eXBlb2YgbW9kdWxlP21vZHVsZS5leHBvcnRzPXQoKToiZnVuY3Rpb24iPT10eXBlb2YgZGVmaW5lJiZkZWZpbmUuYW1kP2RlZmluZSh0KTooZT0idW5kZWZpbmVkIiE9dHlwZW9mIGdsb2JhbFRoaXM/Z2xvYmFsVGhpczplfHxzZWxmKS5ET01QdXJpZnk9dCgpfSh0aGlzLChmdW5jdGlvbigpeyJ1c2Ugc3RyaWN0Ijtjb25zdHtlbnRyaWVzOmUsc2V0UHJvdG90eXBlT2Y6dCxpc0Zyb3plbjpuLGdldFByb3RvdHlwZU9mOm8sZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yOnJ9PU9iamVjdDtsZXR7ZnJlZXplOmksc2VhbDphLGNyZWF0ZTpsfT1PYmplY3Qse2FwcGx5OmMsY29uc3RydWN0OnN9PSJ1bmRlZmluZWQiIT10eXBlb2YgUmVmbGVjdCYmUmVmbGVjdDtpfHwoaT1mdW5jdGlvbihlKXtyZXR1cm4gZX0pLGF8fChhPWZ1bmN0aW9uKGUpe3JldHVybiBlfSksY3x8KGM9ZnVuY3Rpb24oZSx0LG4pe3JldHVybiBlLmFwcGx5KHQsbil9KSxzfHwocz1mdW5jdGlvbihlLHQpe3JldHVybiBuZXcgZSguLi50KX0pO2NvbnN0IHU9UihBcnJheS5wcm90b3R5cGUuZm9yRWFjaCksbT1SKEFycmF5LnByb3RvdHlwZS5sYXN0SW5kZXhPZikscD1SKEFycmF5LnByb3RvdHlwZS5wb3ApLGY9UihBcnJheS5wcm90b3R5cGUucHVzaCksZD1SKEFycmF5LnByb3RvdHlwZS5zcGxpY2UpLGg9UihTdHJpbmcucHJvdG90eXBlLnRvTG93ZXJDYXNlKSxnPVIoU3RyaW5nLnByb3RvdHlwZS50b1N0cmluZyksVD1SKFN0cmluZy5wcm90b3R5cGUubWF0Y2gpLHk9UihTdHJpbmcucHJvdG90eXBlLnJlcGxhY2UpLEU9UihTdHJpbmcucHJvdG90eXBlLmluZGV4T2YpLEE9UihTdHJpbmcucHJvdG90eXBlLnRyaW0pLF89UihPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5KSxTPVIoUmVnRXhwLnByb3RvdHlwZS50ZXN0KSxiPShOPVR5cGVFcnJvcixmdW5jdGlvbigpe2Zvcih2YXIgZT1hcmd1bWVudHMubGVuZ3RoLHQ9bmV3IEFycmF5KGUpLG49MDtuPGU7bisrKXRbbl09YXJndW1lbnRzW25dO3JldHVybiBzKE4sdCl9KTt2YXIgTjtmdW5jdGlvbiBSKGUpe3JldHVybiBmdW5jdGlvbih0KXt0IGluc3RhbmNlb2YgUmVnRXhwJiYodC5sYXN0SW5kZXg9MCk7Zm9yKHZhciBuPWFyZ3VtZW50cy5sZW5ndGgsbz1uZXcgQXJyYXkobj4xP24tMTowKSxyPTE7cjxuO3IrKylvW3ItMV09YXJndW1lbnRzW3JdO3JldHVybiBjKGUsdCxvKX19ZnVuY3Rpb24gdyhlLG8pe2xldCByPWFyZ3VtZW50cy5sZW5ndGg+MiYmdm9pZCAwIT09YXJndW1lbnRzWzJdP2FyZ3VtZW50c1syXTpoO3QmJnQoZSxudWxsKTtsZXQgaT1vLmxlbmd0aDtmb3IoO2ktLTspe2xldCB0PW9baV07aWYoInN0cmluZyI9PXR5cGVvZiB0KXtjb25zdCBlPXIodCk7ZSE9PXQmJihuKG8pfHwob1tpXT1lKSx0PWUpfWVbdF09ITB9cmV0dXJuIGV9ZnVuY3Rpb24gTyhlKXtmb3IobGV0IHQ9MDt0PGUubGVuZ3RoO3QrKyl7XyhlLHQpfHwoZVt0XT1udWxsKX1yZXR1cm4gZX1mdW5jdGlvbiBEKHQpe2NvbnN0IG49bChudWxsKTtmb3IoY29uc3RbbyxyXW9mIGUodCkpe18odCxvKSYmKEFycmF5LmlzQXJyYXkocik/bltvXT1PKHIpOnImJiJvYmplY3QiPT10eXBlb2YgciYmci5jb25zdHJ1Y3Rvcj09PU9iamVjdD9uW29dPUQocik6bltvXT1yKX1yZXR1cm4gbn1mdW5jdGlvbiB2KGUsdCl7Zm9yKDtudWxsIT09ZTspe2NvbnN0IG49cihlLHQpO2lmKG4pe2lmKG4uZ2V0KXJldHVybiBSKG4uZ2V0KTtpZigiZnVuY3Rpb24iPT10eXBlb2Ygbi52YWx1ZSlyZXR1cm4gUihuLnZhbHVlKX1lPW8oZSl9cmV0dXJuIGZ1bmN0aW9uKCl7cmV0dXJuIG51bGx9fWNvbnN0IEw9aShbImEiLCJhYmJyIiwiYWNyb255bSIsImFkZHJlc3MiLCJhcmVhIiwiYXJ0aWNsZSIsImFzaWRlIiwiYXVkaW8iLCJiIiwiYmRpIiwiYmRvIiwiYmlnIiwiYmxpbmsiLCJibG9ja3F1b3RlIiwiYm9keSIsImJyIiwiYnV0dG9uIiwiY2FudmFzIiwiY2FwdGlvbiIsImNlbnRlciIsImNpdGUiLCJjb2RlIiwiY29sIiwiY29sZ3JvdXAiLCJjb250ZW50IiwiZGF0YSIsImRhdGFsaXN0IiwiZGQiLCJkZWNvcmF0b3IiLCJkZWwiLCJkZXRhaWxzIiwiZGZuIiwiZGlhbG9nIiwiZGlyIiwiZGl2IiwiZGwiLCJkdCIsImVsZW1lbnQiLCJlbSIsImZpZWxkc2V0IiwiZmlnY2FwdGlvbiIsImZpZ3VyZSIsImZvbnQiLCJmb290ZXIiLCJmb3JtIiwiaDEiLCJoMiIsImgzIiwiaDQiLCJoNSIsImg2IiwiaGVhZCIsImhlYWRlciIsImhncm91cCIsImhyIiwiaHRtbCIsImkiLCJpbWciLCJpbnB1dCIsImlucyIsImtiZCIsImxhYmVsIiwibGVnZW5kIiwibGkiLCJtYWluIiwibWFwIiwibWFyayIsIm1hcnF1ZWUiLCJtZW51IiwibWVudWl0ZW0iLCJtZXRlciIsIm5hdiIsIm5vYnIiLCJvbCIsIm9wdGdyb3VwIiwib3B0aW9uIiwib3V0cHV0IiwicCIsInBpY3R1cmUiLCJwcmUiLCJwcm9ncmVzcyIsInEiLCJycCIsInJ0IiwicnVieSIsInMiLCJzYW1wIiwic2VjdGlvbiIsInNlbGVjdCIsInNoYWRvdyIsInNtYWxsIiwic291cmNlIiwic3BhY2VyIiwic3BhbiIsInN0cmlrZSIsInN0cm9uZyIsInN0eWxlIiwic3ViIiwic3VtbWFyeSIsInN1cCIsInRhYmxlIiwidGJvZHkiLCJ0ZCIsInRlbXBsYXRlIiwidGV4dGFyZWEiLCJ0Zm9vdCIsInRoIiwidGhlYWQiLCJ0aW1lIiwidHIiLCJ0cmFjayIsInR0IiwidSIsInVsIiwidmFyIiwidmlkZW8iLCJ3YnIiXSksQz1pKFsic3ZnIiwiYSIsImFsdGdseXBoIiwiYWx0Z2x5cGhkZWYiLCJhbHRnbHlwaGl0ZW0iLCJhbmltYXRlY29sb3IiLCJhbmltYXRlbW90aW9uIiwiYW5pbWF0ZXRyYW5zZm9ybSIsImNpcmNsZSIsImNsaXBwYXRoIiwiZGVmcyIsImRlc2MiLCJlbGxpcHNlIiwiZmlsdGVyIiwiZm9udCIsImciLCJnbHlwaCIsImdseXBocmVmIiwiaGtlcm4iLCJpbWFnZSIsImxpbmUiLCJsaW5lYXJncmFkaWVudCIsIm1hcmtlciIsIm1hc2siLCJtZXRhZGF0YSIsIm1wYXRoIiwicGF0aCIsInBhdHRlcm4iLCJwb2x5Z29uIiwicG9seWxpbmUiLCJyYWRpYWxncmFkaWVudCIsInJlY3QiLCJzdG9wIiwic3R5bGUiLCJzd2l0Y2giLCJzeW1ib2wiLCJ0ZXh0IiwidGV4dHBhdGgiLCJ0aXRsZSIsInRyZWYiLCJ0c3BhbiIsInZpZXciLCJ2a2VybiJdKSx4PWkoWyJmZUJsZW5kIiwiZmVDb2xvck1hdHJpeCIsImZlQ29tcG9uZW50VHJhbnNmZXIiLCJmZUNvbXBvc2l0ZSIsImZlQ29udm9sdmVNYXRyaXgiLCJmZURpZmZ1c2VMaWdodGluZyIsImZlRGlzcGxhY2VtZW50TWFwIiwiZmVEaXN0YW50TGlnaHQiLCJmZURyb3BTaGFkb3ciLCJmZUZsb29kIiwiZmVGdW5jQSIsImZlRnVuY0IiLCJmZUZ1bmNHIiwiZmVGdW5jUiIsImZlR2F1c3NpYW5CbHVyIiwiZmVJbWFnZSIsImZlTWVyZ2UiLCJmZU1lcmdlTm9kZSIsImZlTW9ycGhvbG9neSIsImZlT2Zmc2V0IiwiZmVQb2ludExpZ2h0IiwiZmVTcGVjdWxhckxpZ2h0aW5nIiwiZmVTcG90TGlnaHQiLCJmZVRpbGUiLCJmZVR1cmJ1bGVuY2UiXSksST1pKFsiYW5pbWF0ZSIsImNvbG9yLXByb2ZpbGUiLCJjdXJzb3IiLCJkaXNjYXJkIiwiZm9udC1mYWNlIiwiZm9udC1mYWNlLWZvcm1hdCIsImZvbnQtZmFjZS1uYW1lIiwiZm9udC1mYWNlLXNyYyIsImZvbnQtZmFjZS11cmkiLCJmb3JlaWdub2JqZWN0IiwiaGF0Y2giLCJoYXRjaHBhdGgiLCJtZXNoIiwibWVzaGdyYWRpZW50IiwibWVzaHBhdGNoIiwibWVzaHJvdyIsIm1pc3NpbmctZ2x5cGgiLCJzY3JpcHQiLCJzZXQiLCJzb2xpZGNvbG9yIiwidW5rbm93biIsInVzZSJdKSxNPWkoWyJtYXRoIiwibWVuY2xvc2UiLCJtZXJyb3IiLCJtZmVuY2VkIiwibWZyYWMiLCJtZ2x5cGgiLCJtaSIsIm1sYWJlbGVkdHIiLCJtbXVsdGlzY3JpcHRzIiwibW4iLCJtbyIsIm1vdmVyIiwibXBhZGRlZCIsIm1waGFudG9tIiwibXJvb3QiLCJtcm93IiwibXMiLCJtc3BhY2UiLCJtc3FydCIsIm1zdHlsZSIsIm1zdWIiLCJtc3VwIiwibXN1YnN1cCIsIm10YWJsZSIsIm10ZCIsIm10ZXh0IiwibXRyIiwibXVuZGVyIiwibXVuZGVyb3ZlciIsIm1wcmVzY3JpcHRzIl0pLGs9aShbIm1hY3Rpb24iLCJtYWxpZ25ncm91cCIsIm1hbGlnbm1hcmsiLCJtbG9uZ2RpdiIsIm1zY2FycmllcyIsIm1zY2FycnkiLCJtc2dyb3VwIiwibXN0YWNrIiwibXNsaW5lIiwibXNyb3ciLCJzZW1hbnRpY3MiLCJhbm5vdGF0aW9uIiwiYW5ub3RhdGlvbi14bWwiLCJtcHJlc2NyaXB0cyIsIm5vbmUiXSksVT1pKFsiI3RleHQiXSksej1pKFsiYWNjZXB0IiwiYWN0aW9uIiwiYWxpZ24iLCJhbHQiLCJhdXRvY2FwaXRhbGl6ZSIsImF1dG9jb21wbGV0ZSIsImF1dG9waWN0dXJlaW5waWN0dXJlIiwiYXV0b3BsYXkiLCJiYWNrZ3JvdW5kIiwiYmdjb2xvciIsImJvcmRlciIsImNhcHR1cmUiLCJjZWxscGFkZGluZyIsImNlbGxzcGFjaW5nIiwiY2hlY2tlZCIsImNpdGUiLCJjbGFzcyIsImNsZWFyIiwiY29sb3IiLCJjb2xzIiwiY29sc3BhbiIsImNvbnRyb2xzIiwiY29udHJvbHNsaXN0IiwiY29vcmRzIiwiY3Jvc3NvcmlnaW4iLCJkYXRldGltZSIsImRlY29kaW5nIiwiZGVmYXVsdCIsImRpciIsImRpc2FibGVkIiwiZGlzYWJsZXBpY3R1cmVpbnBpY3R1cmUiLCJkaXNhYmxlcmVtb3RlcGxheWJhY2siLCJkb3dubG9hZCIsImRyYWdnYWJsZSIsImVuY3R5cGUiLCJlbnRlcmtleWhpbnQiLCJmYWNlIiwiZm9yIiwiaGVhZGVycyIsImhlaWdodCIsImhpZGRlbiIsImhpZ2giLCJocmVmIiwiaHJlZmxhbmciLCJpZCIsImlucHV0bW9kZSIsImludGVncml0eSIsImlzbWFwIiwia2luZCIsImxhYmVsIiwibGFuZyIsImxpc3QiLCJsb2FkaW5nIiwibG9vcCIsImxvdyIsIm1heCIsIm1heGxlbmd0aCIsIm1lZGlhIiwibWV0aG9kIiwibWluIiwibWlubGVuZ3RoIiwibXVsdGlwbGUiLCJtdXRlZCIsIm5hbWUiLCJub25jZSIsIm5vc2hhZGUiLCJub3ZhbGlkYXRlIiwibm93cmFwIiwib3BlbiIsIm9wdGltdW0iLCJwYXR0ZXJuIiwicGxhY2Vob2xkZXIiLCJwbGF5c2lubGluZSIsInBvcG92ZXIiLCJwb3BvdmVydGFyZ2V0IiwicG9wb3ZlcnRhcmdldGFjdGlvbiIsInBvc3RlciIsInByZWxvYWQiLCJwdWJkYXRlIiwicmFkaW9ncm91cCIsInJlYWRvbmx5IiwicmVsIiwicmVxdWlyZWQiLCJyZXYiLCJyZXZlcnNlZCIsInJvbGUiLCJyb3dzIiwicm93c3BhbiIsInNwZWxsY2hlY2siLCJzY29wZSIsInNlbGVjdGVkIiwic2hhcGUiLCJzaXplIiwic2l6ZXMiLCJzcGFuIiwic3JjbGFuZyIsInN0YXJ0Iiwic3JjIiwic3Jjc2V0Iiwic3RlcCIsInN0eWxlIiwic3VtbWFyeSIsInRhYmluZGV4IiwidGl0bGUiLCJ0cmFuc2xhdGUiLCJ0eXBlIiwidXNlbWFwIiwidmFsaWduIiwidmFsdWUiLCJ3aWR0aCIsIndyYXAiLCJ4bWxucyIsInNsb3QiXSksUD1pKFsiYWNjZW50LWhlaWdodCIsImFjY3VtdWxhdGUiLCJhZGRpdGl2ZSIsImFsaWdubWVudC1iYXNlbGluZSIsImFtcGxpdHVkZSIsImFzY2VudCIsImF0dHJpYnV0ZW5hbWUiLCJhdHRyaWJ1dGV0eXBlIiwiYXppbXV0aCIsImJhc2VmcmVxdWVuY3kiLCJiYXNlbGluZS1zaGlmdCIsImJlZ2luIiwiYmlhcyIsImJ5IiwiY2xhc3MiLCJjbGlwIiwiY2xpcHBhdGh1bml0cyIsImNsaXAtcGF0aCIsImNsaXAtcnVsZSIsImNvbG9yIiwiY29sb3ItaW50ZXJwb2xhdGlvbiIsImNvbG9yLWludGVycG9sYXRpb24tZmlsdGVycyIsImNvbG9yLXByb2ZpbGUiLCJjb2xvci1yZW5kZXJpbmciLCJjeCIsImN5IiwiZCIsImR4IiwiZHkiLCJkaWZmdXNlY29uc3RhbnQiLCJkaXJlY3Rpb24iLCJkaXNwbGF5IiwiZGl2aXNvciIsImR1ciIsImVkZ2Vtb2RlIiwiZWxldmF0aW9uIiwiZW5kIiwiZXhwb25lbnQiLCJmaWxsIiwiZmlsbC1vcGFjaXR5IiwiZmlsbC1ydWxlIiwiZmlsdGVyIiwiZmlsdGVydW5pdHMiLCJmbG9vZC1jb2xvciIsImZsb29kLW9wYWNpdHkiLCJmb250LWZhbWlseSIsImZvbnQtc2l6ZSIsImZvbnQtc2l6ZS1hZGp1c3QiLCJmb250LXN0cmV0Y2giLCJmb250LXN0eWxlIiwiZm9udC12YXJpYW50IiwiZm9udC13ZWlnaHQiLCJmeCIsImZ5IiwiZzEiLCJnMiIsImdseXBoLW5hbWUiLCJnbHlwaHJlZiIsImdyYWRpZW50dW5pdHMiLCJncmFkaWVudHRyYW5zZm9ybSIsImhlaWdodCIsImhyZWYiLCJpZCIsImltYWdlLXJlbmRlcmluZyIsImluIiwiaW4yIiwiaW50ZXJjZXB0IiwiayIsImsxIiwiazIiLCJrMyIsIms0Iiwia2VybmluZyIsImtleXBvaW50cyIsImtleXNwbGluZXMiLCJrZXl0aW1lcyIsImxhbmciLCJsZW5ndGhhZGp1c3QiLCJsZXR0ZXItc3BhY2luZyIsImtlcm5lbG1hdHJpeCIsImtlcm5lbHVuaXRsZW5ndGgiLCJsaWdodGluZy1jb2xvciIsImxvY2FsIiwibWFya2VyLWVuZCIsIm1hcmtlci1taWQiLCJtYXJrZXItc3RhcnQiLCJtYXJrZXJoZWlnaHQiLCJtYXJrZXJ1bml0cyIsIm1hcmtlcndpZHRoIiwibWFza2NvbnRlbnR1bml0cyIsIm1hc2t1bml0cyIsIm1heCIsIm1hc2siLCJtZWRpYSIsIm1ldGhvZCIsIm1vZGUiLCJtaW4iLCJuYW1lIiwibnVtb2N0YXZlcyIsIm9mZnNldCIsIm9wZXJhdG9yIiwib3BhY2l0eSIsIm9yZGVyIiwib3JpZW50Iiwib3JpZW50YXRpb24iLCJvcmlnaW4iLCJvdmVyZmxvdyIsInBhaW50LW9yZGVyIiwicGF0aCIsInBhdGhsZW5ndGgiLCJwYXR0ZXJuY29udGVudHVuaXRzIiwicGF0dGVybnRyYW5zZm9ybSIsInBhdHRlcm51bml0cyIsInBvaW50cyIsInByZXNlcnZlYWxwaGEiLCJwcmVzZXJ2ZWFzcGVjdHJhdGlvIiwicHJpbWl0aXZldW5pdHMiLCJyIiwicngiLCJyeSIsInJhZGl1cyIsInJlZngiLCJyZWZ5IiwicmVwZWF0Y291bnQiLCJyZXBlYXRkdXIiLCJyZXN0YXJ0IiwicmVzdWx0Iiwicm90YXRlIiwic2NhbGUiLCJzZWVkIiwic2hhcGUtcmVuZGVyaW5nIiwic2xvcGUiLCJzcGVjdWxhcmNvbnN0YW50Iiwic3BlY3VsYXJleHBvbmVudCIsInNwcmVhZG1ldGhvZCIsInN0YXJ0b2Zmc2V0Iiwic3RkZGV2aWF0aW9uIiwic3RpdGNodGlsZXMiLCJzdG9wLWNvbG9yIiwic3RvcC1vcGFjaXR5Iiwic3Ryb2tlLWRhc2hhcnJheSIsInN0cm9rZS1kYXNob2Zmc2V0Iiwic3Ryb2tlLWxpbmVjYXAiLCJzdHJva2UtbGluZWpvaW4iLCJzdHJva2UtbWl0ZXJsaW1pdCIsInN0cm9rZS1vcGFjaXR5Iiwic3Ryb2tlIiwic3Ryb2tlLXdpZHRoIiwic3R5bGUiLCJzdXJmYWNlc2NhbGUiLCJzeXN0ZW1sYW5ndWFnZSIsInRhYmluZGV4IiwidGFibGV2YWx1ZXMiLCJ0YXJnZXR4IiwidGFyZ2V0eSIsInRyYW5zZm9ybSIsInRyYW5zZm9ybS1vcmlnaW4iLCJ0ZXh0LWFuY2hvciIsInRleHQtZGVjb3JhdGlvbiIsInRleHQtcmVuZGVyaW5nIiwidGV4dGxlbmd0aCIsInR5cGUiLCJ1MSIsInUyIiwidW5pY29kZSIsInZhbHVlcyIsInZpZXdib3giLCJ2aXNpYmlsaXR5IiwidmVyc2lvbiIsInZlcnQtYWR2LXkiLCJ2ZXJ0LW9yaWdpbi14IiwidmVydC1vcmlnaW4teSIsIndpZHRoIiwid29yZC1zcGFjaW5nIiwid3JhcCIsIndyaXRpbmctbW9kZSIsInhjaGFubmVsc2VsZWN0b3IiLCJ5Y2hhbm5lbHNlbGVjdG9yIiwieCIsIngxIiwieDIiLCJ4bWxucyIsInkiLCJ5MSIsInkyIiwieiIsInpvb21hbmRwYW4iXSksSD1pKFsiYWNjZW50IiwiYWNjZW50dW5kZXIiLCJhbGlnbiIsImJldmVsbGVkIiwiY2xvc2UiLCJjb2x1bW5zYWxpZ24iLCJjb2x1bW5saW5lcyIsImNvbHVtbnNwYW4iLCJkZW5vbWFsaWduIiwiZGVwdGgiLCJkaXIiLCJkaXNwbGF5IiwiZGlzcGxheXN0eWxlIiwiZW5jb2RpbmciLCJmZW5jZSIsImZyYW1lIiwiaGVpZ2h0IiwiaHJlZiIsImlkIiwibGFyZ2VvcCIsImxlbmd0aCIsImxpbmV0aGlja25lc3MiLCJsc3BhY2UiLCJscXVvdGUiLCJtYXRoYmFja2dyb3VuZCIsIm1hdGhjb2xvciIsIm1hdGhzaXplIiwibWF0aHZhcmlhbnQiLCJtYXhzaXplIiwibWluc2l6ZSIsIm1vdmFibGVsaW1pdHMiLCJub3RhdGlvbiIsIm51bWFsaWduIiwib3BlbiIsInJvd2FsaWduIiwicm93bGluZXMiLCJyb3dzcGFjaW5nIiwicm93c3BhbiIsInJzcGFjZSIsInJxdW90ZSIsInNjcmlwdGxldmVsIiwic2NyaXB0bWluc2l6ZSIsInNjcmlwdHNpemVtdWx0aXBsaWVyIiwic2VsZWN0aW9uIiwic2VwYXJhdG9yIiwic2VwYXJhdG9ycyIsInN0cmV0Y2h5Iiwic3Vic2NyaXB0c2hpZnQiLCJzdXBzY3JpcHRzaGlmdCIsInN5bW1ldHJpYyIsInZvZmZzZXQiLCJ3aWR0aCIsInhtbG5zIl0pLEY9aShbInhsaW5rOmhyZWYiLCJ4bWw6aWQiLCJ4bGluazp0aXRsZSIsInhtbDpzcGFjZSIsInhtbG5zOnhsaW5rIl0pLEI9YSgvXHtce1tcd1xXXSp8W1x3XFddKlx9XH0vZ20pLFc9YSgvPCVbXHdcV10qfFtcd1xXXSolPi9nbSksRz1hKC9cJFx7W1x3XFddKi9nbSksWT1hKC9eZGF0YS1bXC1cdy5cdTAwQjctXHVGRkZGXSskLyksaj1hKC9eYXJpYS1bXC1cd10rJC8pLFg9YSgvXig/Oig/Oig/OmZ8aHQpdHBzP3xtYWlsdG98dGVsfGNhbGx0b3xzbXN8Y2lkfHhtcHB8bWF0cml4KTp8W15hLXpdfFthLXorLlwtXSsoPzpbXmEteisuXC06XXwkKSkvaSkscT1hKC9eKD86XHcrc2NyaXB0fGRhdGEpOi9pKSwkPWEoL1tcdTAwMDAtXHUwMDIwXHUwMEEwXHUxNjgwXHUxODBFXHUyMDAwLVx1MjAyOVx1MjA1Rlx1MzAwMF0vZyksSz1hKC9eaHRtbCQvaSksVj1hKC9eW2Etel1bLlx3XSooLVsuXHddKykrJC9pKTt2YXIgWj1PYmplY3QuZnJlZXplKHtfX3Byb3RvX186bnVsbCxBUklBX0FUVFI6aixBVFRSX1dISVRFU1BBQ0U6JCxDVVNUT01fRUxFTUVOVDpWLERBVEFfQVRUUjpZLERPQ1RZUEVfTkFNRTpLLEVSQl9FWFBSOlcsSVNfQUxMT1dFRF9VUkk6WCxJU19TQ1JJUFRfT1JfREFUQTpxLE1VU1RBQ0hFX0VYUFI6QixUTVBMSVRfRVhQUjpHfSk7Y29uc3QgSj0xLFE9MyxlZT03LHRlPTgsbmU9OSxvZT1mdW5jdGlvbigpe3JldHVybiJ1bmRlZmluZWQiPT10eXBlb2Ygd2luZG93P251bGw6d2luZG93fTt2YXIgcmU9ZnVuY3Rpb24gdCgpe2xldCBuPWFyZ3VtZW50cy5sZW5ndGg+MCYmdm9pZCAwIT09YXJndW1lbnRzWzBdP2FyZ3VtZW50c1swXTpvZSgpO2NvbnN0IG89ZT0+dChlKTtpZihvLnZlcnNpb249IjMuMi42IixvLnJlbW92ZWQ9W10sIW58fCFuLmRvY3VtZW50fHxuLmRvY3VtZW50Lm5vZGVUeXBlIT09bmV8fCFuLkVsZW1lbnQpcmV0dXJuIG8uaXNTdXBwb3J0ZWQ9ITEsbztsZXR7ZG9jdW1lbnQ6cn09bjtjb25zdCBhPXIsYz1hLmN1cnJlbnRTY3JpcHQse0RvY3VtZW50RnJhZ21lbnQ6cyxIVE1MVGVtcGxhdGVFbGVtZW50Ok4sTm9kZTpSLEVsZW1lbnQ6TyxOb2RlRmlsdGVyOkIsTmFtZWROb2RlTWFwOlc9bi5OYW1lZE5vZGVNYXB8fG4uTW96TmFtZWRBdHRyTWFwLEhUTUxGb3JtRWxlbWVudDpHLERPTVBhcnNlcjpZLHRydXN0ZWRUeXBlczpqfT1uLHE9Ty5wcm90b3R5cGUsJD12KHEsImNsb25lTm9kZSIpLFY9dihxLCJyZW1vdmUiKSxyZT12KHEsIm5leHRTaWJsaW5nIiksaWU9dihxLCJjaGlsZE5vZGVzIiksYWU9dihxLCJwYXJlbnROb2RlIik7aWYoImZ1bmN0aW9uIj09dHlwZW9mIE4pe2NvbnN0IGU9ci5jcmVhdGVFbGVtZW50KCJ0ZW1wbGF0ZSIpO2UuY29udGVudCYmZS5jb250ZW50Lm93bmVyRG9jdW1lbnQmJihyPWUuY29udGVudC5vd25lckRvY3VtZW50KX1sZXQgbGUsY2U9IiI7Y29uc3R7aW1wbGVtZW50YXRpb246c2UsY3JlYXRlTm9kZUl0ZXJhdG9yOnVlLGNyZWF0ZURvY3VtZW50RnJhZ21lbnQ6bWUsZ2V0RWxlbWVudHNCeVRhZ05hbWU6cGV9PXIse2ltcG9ydE5vZGU6ZmV9PWE7bGV0IGRlPXthZnRlclNhbml0aXplQXR0cmlidXRlczpbXSxhZnRlclNhbml0aXplRWxlbWVudHM6W10sYWZ0ZXJTYW5pdGl6ZVNoYWRvd0RPTTpbXSxiZWZvcmVTYW5pdGl6ZUF0dHJpYnV0ZXM6W10sYmVmb3JlU2FuaXRpemVFbGVtZW50czpbXSxiZWZvcmVTYW5pdGl6ZVNoYWRvd0RPTTpbXSx1cG9uU2FuaXRpemVBdHRyaWJ1dGU6W10sdXBvblNhbml0aXplRWxlbWVudDpbXSx1cG9uU2FuaXRpemVTaGFkb3dOb2RlOltdfTtvLmlzU3VwcG9ydGVkPSJmdW5jdGlvbiI9PXR5cGVvZiBlJiYiZnVuY3Rpb24iPT10eXBlb2YgYWUmJnNlJiZ2b2lkIDAhPT1zZS5jcmVhdGVIVE1MRG9jdW1lbnQ7Y29uc3R7TVVTVEFDSEVfRVhQUjpoZSxFUkJfRVhQUjpnZSxUTVBMSVRfRVhQUjpUZSxEQVRBX0FUVFI6eWUsQVJJQV9BVFRSOkVlLElTX1NDUklQVF9PUl9EQVRBOkFlLEFUVFJfV0hJVEVTUEFDRTpfZSxDVVNUT01fRUxFTUVOVDpTZX09WjtsZXR7SVNfQUxMT1dFRF9VUkk6YmV9PVosTmU9bnVsbDtjb25zdCBSZT13KHt9LFsuLi5MLC4uLkMsLi4ueCwuLi5NLC4uLlVdKTtsZXQgd2U9bnVsbDtjb25zdCBPZT13KHt9LFsuLi56LC4uLlAsLi4uSCwuLi5GXSk7bGV0IERlPU9iamVjdC5zZWFsKGwobnVsbCx7dGFnTmFtZUNoZWNrOnt3cml0YWJsZTohMCxjb25maWd1cmFibGU6ITEsZW51bWVyYWJsZTohMCx2YWx1ZTpudWxsfSxhdHRyaWJ1dGVOYW1lQ2hlY2s6e3dyaXRhYmxlOiEwLGNvbmZpZ3VyYWJsZTohMSxlbnVtZXJhYmxlOiEwLHZhbHVlOm51bGx9LGFsbG93Q3VzdG9taXplZEJ1aWx0SW5FbGVtZW50czp7d3JpdGFibGU6ITAsY29uZmlndXJhYmxlOiExLGVudW1lcmFibGU6ITAsdmFsdWU6ITF9fSkpLHZlPW51bGwsTGU9bnVsbCxDZT0hMCx4ZT0hMCxJZT0hMSxNZT0hMCxrZT0hMSxVZT0hMCx6ZT0hMSxQZT0hMSxIZT0hMSxGZT0hMSxCZT0hMSxXZT0hMSxHZT0hMCxZZT0hMSxqZT0hMCxYZT0hMSxxZT17fSwkZT1udWxsO2NvbnN0IEtlPXcoe30sWyJhbm5vdGF0aW9uLXhtbCIsImF1ZGlvIiwiY29sZ3JvdXAiLCJkZXNjIiwiZm9yZWlnbm9iamVjdCIsImhlYWQiLCJpZnJhbWUiLCJtYXRoIiwibWkiLCJtbiIsIm1vIiwibXMiLCJtdGV4dCIsIm5vZW1iZWQiLCJub2ZyYW1lcyIsIm5vc2NyaXB0IiwicGxhaW50ZXh0Iiwic2NyaXB0Iiwic3R5bGUiLCJzdmciLCJ0ZW1wbGF0ZSIsInRoZWFkIiwidGl0bGUiLCJ2aWRlbyIsInhtcCJdKTtsZXQgVmU9bnVsbDtjb25zdCBaZT13KHt9LFsiYXVkaW8iLCJ2aWRlbyIsImltZyIsInNvdXJjZSIsImltYWdlIiwidHJhY2siXSk7bGV0IEplPW51bGw7Y29uc3QgUWU9dyh7fSxbImFsdCIsImNsYXNzIiwiZm9yIiwiaWQiLCJsYWJlbCIsIm5hbWUiLCJwYXR0ZXJuIiwicGxhY2Vob2xkZXIiLCJyb2xlIiwic3VtbWFyeSIsInRpdGxlIiwidmFsdWUiLCJzdHlsZSIsInhtbG5zIl0pLGV0PSJodHRwOi8vd3d3LnczLm9yZy8xOTk4L01hdGgvTWF0aE1MIix0dD0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciLG50PSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hodG1sIjtsZXQgb3Q9bnQscnQ9ITEsaXQ9bnVsbDtjb25zdCBhdD13KHt9LFtldCx0dCxudF0sZyk7bGV0IGx0PXcoe30sWyJtaSIsIm1vIiwibW4iLCJtcyIsIm10ZXh0Il0pLGN0PXcoe30sWyJhbm5vdGF0aW9uLXhtbCJdKTtjb25zdCBzdD13KHt9LFsidGl0bGUiLCJzdHlsZSIsImZvbnQiLCJhIiwic2NyaXB0Il0pO2xldCB1dD1udWxsO2NvbnN0IG10PVsiYXBwbGljYXRpb24veGh0bWwreG1sIiwidGV4dC9odG1sIl07bGV0IHB0PW51bGwsZnQ9bnVsbDtjb25zdCBkdD1yLmNyZWF0ZUVsZW1lbnQoImZvcm0iKSxodD1mdW5jdGlvbihlKXtyZXR1cm4gZSBpbnN0YW5jZW9mIFJlZ0V4cHx8ZSBpbnN0YW5jZW9mIEZ1bmN0aW9ufSxndD1mdW5jdGlvbigpe2xldCBlPWFyZ3VtZW50cy5sZW5ndGg+MCYmdm9pZCAwIT09YXJndW1lbnRzWzBdP2FyZ3VtZW50c1swXTp7fTtpZighZnR8fGZ0IT09ZSl7aWYoZSYmIm9iamVjdCI9PXR5cGVvZiBlfHwoZT17fSksZT1EKGUpLHV0PS0xPT09bXQuaW5kZXhPZihlLlBBUlNFUl9NRURJQV9UWVBFKT8idGV4dC9odG1sIjplLlBBUlNFUl9NRURJQV9UWVBFLHB0PSJhcHBsaWNhdGlvbi94aHRtbCt4bWwiPT09dXQ/ZzpoLE5lPV8oZSwiQUxMT1dFRF9UQUdTIik/dyh7fSxlLkFMTE9XRURfVEFHUyxwdCk6UmUsd2U9XyhlLCJBTExPV0VEX0FUVFIiKT93KHt9LGUuQUxMT1dFRF9BVFRSLHB0KTpPZSxpdD1fKGUsIkFMTE9XRURfTkFNRVNQQUNFUyIpP3coe30sZS5BTExPV0VEX05BTUVTUEFDRVMsZyk6YXQsSmU9XyhlLCJBRERfVVJJX1NBRkVfQVRUUiIpP3coRChRZSksZS5BRERfVVJJX1NBRkVfQVRUUixwdCk6UWUsVmU9XyhlLCJBRERfREFUQV9VUklfVEFHUyIpP3coRChaZSksZS5BRERfREFUQV9VUklfVEFHUyxwdCk6WmUsJGU9XyhlLCJGT1JCSURfQ09OVEVOVFMiKT93KHt9LGUuRk9SQklEX0NPTlRFTlRTLHB0KTpLZSx2ZT1fKGUsIkZPUkJJRF9UQUdTIik/dyh7fSxlLkZPUkJJRF9UQUdTLHB0KTpEKHt9KSxMZT1fKGUsIkZPUkJJRF9BVFRSIik/dyh7fSxlLkZPUkJJRF9BVFRSLHB0KTpEKHt9KSxxZT0hIV8oZSwiVVNFX1BST0ZJTEVTIikmJmUuVVNFX1BST0ZJTEVTLENlPSExIT09ZS5BTExPV19BUklBX0FUVFIseGU9ITEhPT1lLkFMTE9XX0RBVEFfQVRUUixJZT1lLkFMTE9XX1VOS05PV05fUFJPVE9DT0xTfHwhMSxNZT0hMSE9PWUuQUxMT1dfU0VMRl9DTE9TRV9JTl9BVFRSLGtlPWUuU0FGRV9GT1JfVEVNUExBVEVTfHwhMSxVZT0hMSE9PWUuU0FGRV9GT1JfWE1MLHplPWUuV0hPTEVfRE9DVU1FTlR8fCExLEZlPWUuUkVUVVJOX0RPTXx8ITEsQmU9ZS5SRVRVUk5fRE9NX0ZSQUdNRU5UfHwhMSxXZT1lLlJFVFVSTl9UUlVTVEVEX1RZUEV8fCExLEhlPWUuRk9SQ0VfQk9EWXx8ITEsR2U9ITEhPT1lLlNBTklUSVpFX0RPTSxZZT1lLlNBTklUSVpFX05BTUVEX1BST1BTfHwhMSxqZT0hMSE9PWUuS0VFUF9DT05URU5ULFhlPWUuSU5fUExBQ0V8fCExLGJlPWUuQUxMT1dFRF9VUklfUkVHRVhQfHxYLG90PWUuTkFNRVNQQUNFfHxudCxsdD1lLk1BVEhNTF9URVhUX0lOVEVHUkFUSU9OX1BPSU5UU3x8bHQsY3Q9ZS5IVE1MX0lOVEVHUkFUSU9OX1BPSU5UU3x8Y3QsRGU9ZS5DVVNUT01fRUxFTUVOVF9IQU5ETElOR3x8e30sZS5DVVNUT01fRUxFTUVOVF9IQU5ETElORyYmaHQoZS5DVVNUT01fRUxFTUVOVF9IQU5ETElORy50YWdOYW1lQ2hlY2spJiYoRGUudGFnTmFtZUNoZWNrPWUuQ1VTVE9NX0VMRU1FTlRfSEFORExJTkcudGFnTmFtZUNoZWNrKSxlLkNVU1RPTV9FTEVNRU5UX0hBTkRMSU5HJiZodChlLkNVU1RPTV9FTEVNRU5UX0hBTkRMSU5HLmF0dHJpYnV0ZU5hbWVDaGVjaykmJihEZS5hdHRyaWJ1dGVOYW1lQ2hlY2s9ZS5DVVNUT01fRUxFTUVOVF9IQU5ETElORy5hdHRyaWJ1dGVOYW1lQ2hlY2spLGUuQ1VTVE9NX0VMRU1FTlRfSEFORExJTkcmJiJib29sZWFuIj09dHlwZW9mIGUuQ1VTVE9NX0VMRU1FTlRfSEFORExJTkcuYWxsb3dDdXN0b21pemVkQnVpbHRJbkVsZW1lbnRzJiYoRGUuYWxsb3dDdXN0b21pemVkQnVpbHRJbkVsZW1lbnRzPWUuQ1VTVE9NX0VMRU1FTlRfSEFORExJTkcuYWxsb3dDdXN0b21pemVkQnVpbHRJbkVsZW1lbnRzKSxrZSYmKHhlPSExKSxCZSYmKEZlPSEwKSxxZSYmKE5lPXcoe30sVSksd2U9W10sITA9PT1xZS5odG1sJiYodyhOZSxMKSx3KHdlLHopKSwhMD09PXFlLnN2ZyYmKHcoTmUsQyksdyh3ZSxQKSx3KHdlLEYpKSwhMD09PXFlLnN2Z0ZpbHRlcnMmJih3KE5lLHgpLHcod2UsUCksdyh3ZSxGKSksITA9PT1xZS5tYXRoTWwmJih3KE5lLE0pLHcod2UsSCksdyh3ZSxGKSkpLGUuQUREX1RBR1MmJihOZT09PVJlJiYoTmU9RChOZSkpLHcoTmUsZS5BRERfVEFHUyxwdCkpLGUuQUREX0FUVFImJih3ZT09PU9lJiYod2U9RCh3ZSkpLHcod2UsZS5BRERfQVRUUixwdCkpLGUuQUREX1VSSV9TQUZFX0FUVFImJncoSmUsZS5BRERfVVJJX1NBRkVfQVRUUixwdCksZS5GT1JCSURfQ09OVEVOVFMmJigkZT09PUtlJiYoJGU9RCgkZSkpLHcoJGUsZS5GT1JCSURfQ09OVEVOVFMscHQpKSxqZSYmKE5lWyIjdGV4dCJdPSEwKSx6ZSYmdyhOZSxbImh0bWwiLCJoZWFkIiwiYm9keSJdKSxOZS50YWJsZSYmKHcoTmUsWyJ0Ym9keSJdKSxkZWxldGUgdmUudGJvZHkpLGUuVFJVU1RFRF9UWVBFU19QT0xJQ1kpe2lmKCJmdW5jdGlvbiIhPXR5cGVvZiBlLlRSVVNURURfVFlQRVNfUE9MSUNZLmNyZWF0ZUhUTUwpdGhyb3cgYignVFJVU1RFRF9UWVBFU19QT0xJQ1kgY29uZmlndXJhdGlvbiBvcHRpb24gbXVzdCBwcm92aWRlIGEgImNyZWF0ZUhUTUwiIGhvb2suJyk7aWYoImZ1bmN0aW9uIiE9dHlwZW9mIGUuVFJVU1RFRF9UWVBFU19QT0xJQ1kuY3JlYXRlU2NyaXB0VVJMKXRocm93IGIoJ1RSVVNURURfVFlQRVNfUE9MSUNZIGNvbmZpZ3VyYXRpb24gb3B0aW9uIG11c3QgcHJvdmlkZSBhICJjcmVhdGVTY3JpcHRVUkwiIGhvb2suJyk7bGU9ZS5UUlVTVEVEX1RZUEVTX1BPTElDWSxjZT1sZS5jcmVhdGVIVE1MKCIiKX1lbHNlIHZvaWQgMD09PWxlJiYobGU9ZnVuY3Rpb24oZSx0KXtpZigib2JqZWN0IiE9dHlwZW9mIGV8fCJmdW5jdGlvbiIhPXR5cGVvZiBlLmNyZWF0ZVBvbGljeSlyZXR1cm4gbnVsbDtsZXQgbj1udWxsO2NvbnN0IG89ImRhdGEtdHQtcG9saWN5LXN1ZmZpeCI7dCYmdC5oYXNBdHRyaWJ1dGUobykmJihuPXQuZ2V0QXR0cmlidXRlKG8pKTtjb25zdCByPSJkb21wdXJpZnkiKyhuPyIjIituOiIiKTt0cnl7cmV0dXJuIGUuY3JlYXRlUG9saWN5KHIse2NyZWF0ZUhUTUw6ZT0+ZSxjcmVhdGVTY3JpcHRVUkw6ZT0+ZX0pfWNhdGNoKGUpe3JldHVybiBjb25zb2xlLndhcm4oIlRydXN0ZWRUeXBlcyBwb2xpY3kgIityKyIgY291bGQgbm90IGJlIGNyZWF0ZWQuIiksbnVsbH19KGosYykpLG51bGwhPT1sZSYmInN0cmluZyI9PXR5cGVvZiBjZSYmKGNlPWxlLmNyZWF0ZUhUTUwoIiIpKTtpJiZpKGUpLGZ0PWV9fSxUdD13KHt9LFsuLi5DLC4uLngsLi4uSV0pLHl0PXcoe30sWy4uLk0sLi4ua10pLEV0PWZ1bmN0aW9uKGUpe2Yoby5yZW1vdmVkLHtlbGVtZW50OmV9KTt0cnl7YWUoZSkucmVtb3ZlQ2hpbGQoZSl9Y2F0Y2godCl7VihlKX19LEF0PWZ1bmN0aW9uKGUsdCl7dHJ5e2Yoby5yZW1vdmVkLHthdHRyaWJ1dGU6dC5nZXRBdHRyaWJ1dGVOb2RlKGUpLGZyb206dH0pfWNhdGNoKGUpe2Yoby5yZW1vdmVkLHthdHRyaWJ1dGU6bnVsbCxmcm9tOnR9KX1pZih0LnJlbW92ZUF0dHJpYnV0ZShlKSwiaXMiPT09ZSlpZihGZXx8QmUpdHJ5e0V0KHQpfWNhdGNoKGUpe31lbHNlIHRyeXt0LnNldEF0dHJpYnV0ZShlLCIiKX1jYXRjaChlKXt9fSxfdD1mdW5jdGlvbihlKXtsZXQgdD1udWxsLG49bnVsbDtpZihIZSllPSI8cmVtb3ZlPjwvcmVtb3ZlPiIrZTtlbHNle2NvbnN0IHQ9VChlLC9eW1xyXG5cdCBdKy8pO249dCYmdFswXX0iYXBwbGljYXRpb24veGh0bWwreG1sIj09PXV0JiZvdD09PW50JiYoZT0nPGh0bWwgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGh0bWwiPjxoZWFkPjwvaGVhZD48Ym9keT4nK2UrIjwvYm9keT48L2h0bWw+Iik7Y29uc3Qgbz1sZT9sZS5jcmVhdGVIVE1MKGUpOmU7aWYob3Q9PT1udCl0cnl7dD0obmV3IFkpLnBhcnNlRnJvbVN0cmluZyhvLHV0KX1jYXRjaChlKXt9aWYoIXR8fCF0LmRvY3VtZW50RWxlbWVudCl7dD1zZS5jcmVhdGVEb2N1bWVudChvdCwidGVtcGxhdGUiLG51bGwpO3RyeXt0LmRvY3VtZW50RWxlbWVudC5pbm5lckhUTUw9cnQ/Y2U6b31jYXRjaChlKXt9fWNvbnN0IGk9dC5ib2R5fHx0LmRvY3VtZW50RWxlbWVudDtyZXR1cm4gZSYmbiYmaS5pbnNlcnRCZWZvcmUoci5jcmVhdGVUZXh0Tm9kZShuKSxpLmNoaWxkTm9kZXNbMF18fG51bGwpLG90PT09bnQ/cGUuY2FsbCh0LHplPyJodG1sIjoiYm9keSIpWzBdOnplP3QuZG9jdW1lbnRFbGVtZW50Oml9LFN0PWZ1bmN0aW9uKGUpe3JldHVybiB1ZS5jYWxsKGUub3duZXJEb2N1bWVudHx8ZSxlLEIuU0hPV19FTEVNRU5UfEIuU0hPV19DT01NRU5UfEIuU0hPV19URVhUfEIuU0hPV19QUk9DRVNTSU5HX0lOU1RSVUNUSU9OfEIuU0hPV19DREFUQV9TRUNUSU9OLG51bGwpfSxidD1mdW5jdGlvbihlKXtyZXR1cm4gZSBpbnN0YW5jZW9mIEcmJigic3RyaW5nIiE9dHlwZW9mIGUubm9kZU5hbWV8fCJzdHJpbmciIT10eXBlb2YgZS50ZXh0Q29udGVudHx8ImZ1bmN0aW9uIiE9dHlwZW9mIGUucmVtb3ZlQ2hpbGR8fCEoZS5hdHRyaWJ1dGVzIGluc3RhbmNlb2YgVyl8fCJmdW5jdGlvbiIhPXR5cGVvZiBlLnJlbW92ZUF0dHJpYnV0ZXx8ImZ1bmN0aW9uIiE9dHlwZW9mIGUuc2V0QXR0cmlidXRlfHwic3RyaW5nIiE9dHlwZW9mIGUubmFtZXNwYWNlVVJJfHwiZnVuY3Rpb24iIT10eXBlb2YgZS5pbnNlcnRCZWZvcmV8fCJmdW5jdGlvbiIhPXR5cGVvZiBlLmhhc0NoaWxkTm9kZXMpfSxOdD1mdW5jdGlvbihlKXtyZXR1cm4iZnVuY3Rpb24iPT10eXBlb2YgUiYmZSBpbnN0YW5jZW9mIFJ9O2Z1bmN0aW9uIFJ0KGUsdCxuKXt1KGUsKGU9PntlLmNhbGwobyx0LG4sZnQpfSkpfWNvbnN0IHd0PWZ1bmN0aW9uKGUpe2xldCB0PW51bGw7aWYoUnQoZGUuYmVmb3JlU2FuaXRpemVFbGVtZW50cyxlLG51bGwpLGJ0KGUpKXJldHVybiBFdChlKSwhMDtjb25zdCBuPXB0KGUubm9kZU5hbWUpO2lmKFJ0KGRlLnVwb25TYW5pdGl6ZUVsZW1lbnQsZSx7dGFnTmFtZTpuLGFsbG93ZWRUYWdzOk5lfSksVWUmJmUuaGFzQ2hpbGROb2RlcygpJiYhTnQoZS5maXJzdEVsZW1lbnRDaGlsZCkmJlMoLzxbL1x3IV0vZyxlLmlubmVySFRNTCkmJlMoLzxbL1x3IV0vZyxlLnRleHRDb250ZW50KSlyZXR1cm4gRXQoZSksITA7aWYoZS5ub2RlVHlwZT09PWVlKXJldHVybiBFdChlKSwhMDtpZihVZSYmZS5ub2RlVHlwZT09PXRlJiZTKC88Wy9cd10vZyxlLmRhdGEpKXJldHVybiBFdChlKSwhMDtpZighTmVbbl18fHZlW25dKXtpZighdmVbbl0mJkR0KG4pKXtpZihEZS50YWdOYW1lQ2hlY2sgaW5zdGFuY2VvZiBSZWdFeHAmJlMoRGUudGFnTmFtZUNoZWNrLG4pKXJldHVybiExO2lmKERlLnRhZ05hbWVDaGVjayBpbnN0YW5jZW9mIEZ1bmN0aW9uJiZEZS50YWdOYW1lQ2hlY2sobikpcmV0dXJuITF9aWYoamUmJiEkZVtuXSl7Y29uc3QgdD1hZShlKXx8ZS5wYXJlbnROb2RlLG49aWUoZSl8fGUuY2hpbGROb2RlcztpZihuJiZ0KXtmb3IobGV0IG89bi5sZW5ndGgtMTtvPj0wOy0tbyl7Y29uc3Qgcj0kKG5bb10sITApO3IuX19yZW1vdmFsQ291bnQ9KGUuX19yZW1vdmFsQ291bnR8fDApKzEsdC5pbnNlcnRCZWZvcmUocixyZShlKSl9fX1yZXR1cm4gRXQoZSksITB9cmV0dXJuIGUgaW5zdGFuY2VvZiBPJiYhZnVuY3Rpb24oZSl7bGV0IHQ9YWUoZSk7dCYmdC50YWdOYW1lfHwodD17bmFtZXNwYWNlVVJJOm90LHRhZ05hbWU6InRlbXBsYXRlIn0pO2NvbnN0IG49aChlLnRhZ05hbWUpLG89aCh0LnRhZ05hbWUpO3JldHVybiEhaXRbZS5uYW1lc3BhY2VVUkldJiYoZS5uYW1lc3BhY2VVUkk9PT10dD90Lm5hbWVzcGFjZVVSST09PW50PyJzdmciPT09bjp0Lm5hbWVzcGFjZVVSST09PWV0PyJzdmciPT09biYmKCJhbm5vdGF0aW9uLXhtbCI9PT1vfHxsdFtvXSk6Qm9vbGVhbihUdFtuXSk6ZS5uYW1lc3BhY2VVUkk9PT1ldD90Lm5hbWVzcGFjZVVSST09PW50PyJtYXRoIj09PW46dC5uYW1lc3BhY2VVUkk9PT10dD8ibWF0aCI9PT1uJiZjdFtvXTpCb29sZWFuKHl0W25dKTplLm5hbWVzcGFjZVVSST09PW50PyEodC5uYW1lc3BhY2VVUkk9PT10dCYmIWN0W29dKSYmISh0Lm5hbWVzcGFjZVVSST09PWV0JiYhbHRbb10pJiYheXRbbl0mJihzdFtuXXx8IVR0W25dKTohKCJhcHBsaWNhdGlvbi94aHRtbCt4bWwiIT09dXR8fCFpdFtlLm5hbWVzcGFjZVVSSV0pKX0oZSk/KEV0KGUpLCEwKToibm9zY3JpcHQiIT09biYmIm5vZW1iZWQiIT09biYmIm5vZnJhbWVzIiE9PW58fCFTKC88XC9ubyhzY3JpcHR8ZW1iZWR8ZnJhbWVzKS9pLGUuaW5uZXJIVE1MKT8oa2UmJmUubm9kZVR5cGU9PT1RJiYodD1lLnRleHRDb250ZW50LHUoW2hlLGdlLFRlXSwoZT0+e3Q9eSh0LGUsIiAiKX0pKSxlLnRleHRDb250ZW50IT09dCYmKGYoby5yZW1vdmVkLHtlbGVtZW50OmUuY2xvbmVOb2RlKCl9KSxlLnRleHRDb250ZW50PXQpKSxSdChkZS5hZnRlclNhbml0aXplRWxlbWVudHMsZSxudWxsKSwhMSk6KEV0KGUpLCEwKX0sT3Q9ZnVuY3Rpb24oZSx0LG4pe2lmKEdlJiYoImlkIj09PXR8fCJuYW1lIj09PXQpJiYobiBpbiByfHxuIGluIGR0KSlyZXR1cm4hMTtpZih4ZSYmIUxlW3RdJiZTKHllLHQpKTtlbHNlIGlmKENlJiZTKEVlLHQpKTtlbHNlIGlmKCF3ZVt0XXx8TGVbdF0pe2lmKCEoRHQoZSkmJihEZS50YWdOYW1lQ2hlY2sgaW5zdGFuY2VvZiBSZWdFeHAmJlMoRGUudGFnTmFtZUNoZWNrLGUpfHxEZS50YWdOYW1lQ2hlY2sgaW5zdGFuY2VvZiBGdW5jdGlvbiYmRGUudGFnTmFtZUNoZWNrKGUpKSYmKERlLmF0dHJpYnV0ZU5hbWVDaGVjayBpbnN0YW5jZW9mIFJlZ0V4cCYmUyhEZS5hdHRyaWJ1dGVOYW1lQ2hlY2ssdCl8fERlLmF0dHJpYnV0ZU5hbWVDaGVjayBpbnN0YW5jZW9mIEZ1bmN0aW9uJiZEZS5hdHRyaWJ1dGVOYW1lQ2hlY2sodCkpfHwiaXMiPT09dCYmRGUuYWxsb3dDdXN0b21pemVkQnVpbHRJbkVsZW1lbnRzJiYoRGUudGFnTmFtZUNoZWNrIGluc3RhbmNlb2YgUmVnRXhwJiZTKERlLnRhZ05hbWVDaGVjayxuKXx8RGUudGFnTmFtZUNoZWNrIGluc3RhbmNlb2YgRnVuY3Rpb24mJkRlLnRhZ05hbWVDaGVjayhuKSkpKXJldHVybiExfWVsc2UgaWYoSmVbdF0pO2Vsc2UgaWYoUyhiZSx5KG4sX2UsIiIpKSk7ZWxzZSBpZigic3JjIiE9PXQmJiJ4bGluazpocmVmIiE9PXQmJiJocmVmIiE9PXR8fCJzY3JpcHQiPT09ZXx8MCE9PUUobiwiZGF0YToiKXx8IVZlW2VdKXtpZihJZSYmIVMoQWUseShuLF9lLCIiKSkpO2Vsc2UgaWYobilyZXR1cm4hMX1lbHNlO3JldHVybiEwfSxEdD1mdW5jdGlvbihlKXtyZXR1cm4iYW5ub3RhdGlvbi14bWwiIT09ZSYmVChlLFNlKX0sdnQ9ZnVuY3Rpb24oZSl7UnQoZGUuYmVmb3JlU2FuaXRpemVBdHRyaWJ1dGVzLGUsbnVsbCk7Y29uc3R7YXR0cmlidXRlczp0fT1lO2lmKCF0fHxidChlKSlyZXR1cm47Y29uc3Qgbj17YXR0ck5hbWU6IiIsYXR0clZhbHVlOiIiLGtlZXBBdHRyOiEwLGFsbG93ZWRBdHRyaWJ1dGVzOndlLGZvcmNlS2VlcEF0dHI6dm9pZCAwfTtsZXQgcj10Lmxlbmd0aDtmb3IoO3ItLTspe2NvbnN0IGk9dFtyXSx7bmFtZTphLG5hbWVzcGFjZVVSSTpsLHZhbHVlOmN9PWkscz1wdChhKSxtPWM7bGV0IGY9InZhbHVlIj09PWE/bTpBKG0pO2lmKG4uYXR0ck5hbWU9cyxuLmF0dHJWYWx1ZT1mLG4ua2VlcEF0dHI9ITAsbi5mb3JjZUtlZXBBdHRyPXZvaWQgMCxSdChkZS51cG9uU2FuaXRpemVBdHRyaWJ1dGUsZSxuKSxmPW4uYXR0clZhbHVlLCFZZXx8ImlkIiE9PXMmJiJuYW1lIiE9PXN8fChBdChhLGUpLGY9InVzZXItY29udGVudC0iK2YpLFVlJiZTKC8oKC0tIT98XSk+KXw8XC8oc3R5bGV8dGl0bGUpL2ksZikpe0F0KGEsZSk7Y29udGludWV9aWYobi5mb3JjZUtlZXBBdHRyKWNvbnRpbnVlO2lmKCFuLmtlZXBBdHRyKXtBdChhLGUpO2NvbnRpbnVlfWlmKCFNZSYmUygvXC8+L2ksZikpe0F0KGEsZSk7Y29udGludWV9a2UmJnUoW2hlLGdlLFRlXSwoZT0+e2Y9eShmLGUsIiAiKX0pKTtjb25zdCBkPXB0KGUubm9kZU5hbWUpO2lmKE90KGQscyxmKSl7aWYobGUmJiJvYmplY3QiPT10eXBlb2YgaiYmImZ1bmN0aW9uIj09dHlwZW9mIGouZ2V0QXR0cmlidXRlVHlwZSlpZihsKTtlbHNlIHN3aXRjaChqLmdldEF0dHJpYnV0ZVR5cGUoZCxzKSl7Y2FzZSJUcnVzdGVkSFRNTCI6Zj1sZS5jcmVhdGVIVE1MKGYpO2JyZWFrO2Nhc2UiVHJ1c3RlZFNjcmlwdFVSTCI6Zj1sZS5jcmVhdGVTY3JpcHRVUkwoZil9aWYoZiE9PW0pdHJ5e2w/ZS5zZXRBdHRyaWJ1dGVOUyhsLGEsZik6ZS5zZXRBdHRyaWJ1dGUoYSxmKSxidChlKT9FdChlKTpwKG8ucmVtb3ZlZCl9Y2F0Y2godCl7QXQoYSxlKX19ZWxzZSBBdChhLGUpfVJ0KGRlLmFmdGVyU2FuaXRpemVBdHRyaWJ1dGVzLGUsbnVsbCl9LEx0PWZ1bmN0aW9uIGUodCl7bGV0IG49bnVsbDtjb25zdCBvPVN0KHQpO2ZvcihSdChkZS5iZWZvcmVTYW5pdGl6ZVNoYWRvd0RPTSx0LG51bGwpO249by5uZXh0Tm9kZSgpOylSdChkZS51cG9uU2FuaXRpemVTaGFkb3dOb2RlLG4sbnVsbCksd3QobiksdnQobiksbi5jb250ZW50IGluc3RhbmNlb2YgcyYmZShuLmNvbnRlbnQpO1J0KGRlLmFmdGVyU2FuaXRpemVTaGFkb3dET00sdCxudWxsKX07cmV0dXJuIG8uc2FuaXRpemU9ZnVuY3Rpb24oZSl7bGV0IHQ9YXJndW1lbnRzLmxlbmd0aD4xJiZ2b2lkIDAhPT1hcmd1bWVudHNbMV0/YXJndW1lbnRzWzFdOnt9LG49bnVsbCxyPW51bGwsaT1udWxsLGw9bnVsbDtpZihydD0hZSxydCYmKGU9Ilx4M2MhLS1ceDNlIiksInN0cmluZyIhPXR5cGVvZiBlJiYhTnQoZSkpe2lmKCJmdW5jdGlvbiIhPXR5cGVvZiBlLnRvU3RyaW5nKXRocm93IGIoInRvU3RyaW5nIGlzIG5vdCBhIGZ1bmN0aW9uIik7aWYoInN0cmluZyIhPXR5cGVvZihlPWUudG9TdHJpbmcoKSkpdGhyb3cgYigiZGlydHkgaXMgbm90IGEgc3RyaW5nLCBhYm9ydGluZyIpfWlmKCFvLmlzU3VwcG9ydGVkKXJldHVybiBlO2lmKFBlfHxndCh0KSxvLnJlbW92ZWQ9W10sInN0cmluZyI9PXR5cGVvZiBlJiYoWGU9ITEpLFhlKXtpZihlLm5vZGVOYW1lKXtjb25zdCB0PXB0KGUubm9kZU5hbWUpO2lmKCFOZVt0XXx8dmVbdF0pdGhyb3cgYigicm9vdCBub2RlIGlzIGZvcmJpZGRlbiBhbmQgY2Fubm90IGJlIHNhbml0aXplZCBpbi1wbGFjZSIpfX1lbHNlIGlmKGUgaW5zdGFuY2VvZiBSKW49X3QoIlx4M2MhLS0tLVx4M2UiKSxyPW4ub3duZXJEb2N1bWVudC5pbXBvcnROb2RlKGUsITApLHIubm9kZVR5cGU9PT1KJiYiQk9EWSI9PT1yLm5vZGVOYW1lfHwiSFRNTCI9PT1yLm5vZGVOYW1lP249cjpuLmFwcGVuZENoaWxkKHIpO2Vsc2V7aWYoIUZlJiYha2UmJiF6ZSYmLTE9PT1lLmluZGV4T2YoIjwiKSlyZXR1cm4gbGUmJldlP2xlLmNyZWF0ZUhUTUwoZSk6ZTtpZihuPV90KGUpLCFuKXJldHVybiBGZT9udWxsOldlP2NlOiIifW4mJkhlJiZFdChuLmZpcnN0Q2hpbGQpO2NvbnN0IGM9U3QoWGU/ZTpuKTtmb3IoO2k9Yy5uZXh0Tm9kZSgpOyl3dChpKSx2dChpKSxpLmNvbnRlbnQgaW5zdGFuY2VvZiBzJiZMdChpLmNvbnRlbnQpO2lmKFhlKXJldHVybiBlO2lmKEZlKXtpZihCZSlmb3IobD1tZS5jYWxsKG4ub3duZXJEb2N1bWVudCk7bi5maXJzdENoaWxkOylsLmFwcGVuZENoaWxkKG4uZmlyc3RDaGlsZCk7ZWxzZSBsPW47cmV0dXJuKHdlLnNoYWRvd3Jvb3R8fHdlLnNoYWRvd3Jvb3Rtb2RlKSYmKGw9ZmUuY2FsbChhLGwsITApKSxsfWxldCBtPXplP24ub3V0ZXJIVE1MOm4uaW5uZXJIVE1MO3JldHVybiB6ZSYmTmVbIiFkb2N0eXBlIl0mJm4ub3duZXJEb2N1bWVudCYmbi5vd25lckRvY3VtZW50LmRvY3R5cGUmJm4ub3duZXJEb2N1bWVudC5kb2N0eXBlLm5hbWUmJlMoSyxuLm93bmVyRG9jdW1lbnQuZG9jdHlwZS5uYW1lKSYmKG09IjwhRE9DVFlQRSAiK24ub3duZXJEb2N1bWVudC5kb2N0eXBlLm5hbWUrIj5cbiIrbSksa2UmJnUoW2hlLGdlLFRlXSwoZT0+e209eShtLGUsIiAiKX0pKSxsZSYmV2U/bGUuY3JlYXRlSFRNTChtKTptfSxvLnNldENvbmZpZz1mdW5jdGlvbigpe2d0KGFyZ3VtZW50cy5sZW5ndGg+MCYmdm9pZCAwIT09YXJndW1lbnRzWzBdP2FyZ3VtZW50c1swXTp7fSksUGU9ITB9LG8uY2xlYXJDb25maWc9ZnVuY3Rpb24oKXtmdD1udWxsLFBlPSExfSxvLmlzVmFsaWRBdHRyaWJ1dGU9ZnVuY3Rpb24oZSx0LG4pe2Z0fHxndCh7fSk7Y29uc3Qgbz1wdChlKSxyPXB0KHQpO3JldHVybiBPdChvLHIsbil9LG8uYWRkSG9vaz1mdW5jdGlvbihlLHQpeyJmdW5jdGlvbiI9PXR5cGVvZiB0JiZmKGRlW2VdLHQpfSxvLnJlbW92ZUhvb2s9ZnVuY3Rpb24oZSx0KXtpZih2b2lkIDAhPT10KXtjb25zdCBuPW0oZGVbZV0sdCk7cmV0dXJuLTE9PT1uP3ZvaWQgMDpkKGRlW2VdLG4sMSlbMF19cmV0dXJuIHAoZGVbZV0pfSxvLnJlbW92ZUhvb2tzPWZ1bmN0aW9uKGUpe2RlW2VdPVtdfSxvLnJlbW92ZUFsbEhvb2tzPWZ1bmN0aW9uKCl7ZGU9e2FmdGVyU2FuaXRpemVBdHRyaWJ1dGVzOltdLGFmdGVyU2FuaXRpemVFbGVtZW50czpbXSxhZnRlclNhbml0aXplU2hhZG93RE9NOltdLGJlZm9yZVNhbml0aXplQXR0cmlidXRlczpbXSxiZWZvcmVTYW5pdGl6ZUVsZW1lbnRzOltdLGJlZm9yZVNhbml0aXplU2hhZG93RE9NOltdLHVwb25TYW5pdGl6ZUF0dHJpYnV0ZTpbXSx1cG9uU2FuaXRpemVFbGVtZW50OltdLHVwb25TYW5pdGl6ZVNoYWRvd05vZGU6W119fSxvfSgpO3JldHVybiByZX0pKTsKLy8jIHNvdXJjZU1hcHBpbmdVUkw9cHVyaWZ5Lm1pbi5qcy5tYXAK',
    hljs: 'LyohCiAgSGlnaGxpZ2h0LmpzIHYxMS45LjAgKGdpdDogZjQ3MTAzZDRmMSkKICAoYykgMjAwNi0yMDIzIHVuZGVmaW5lZCBhbmQgb3RoZXIgY29udHJpYnV0b3JzCiAgTGljZW5zZTogQlNELTMtQ2xhdXNlCiAqLwp2YXIgaGxqcz1mdW5jdGlvbigpeyJ1c2Ugc3RyaWN0IjtmdW5jdGlvbiBlKG4pewpyZXR1cm4gbiBpbnN0YW5jZW9mIE1hcD9uLmNsZWFyPW4uZGVsZXRlPW4uc2V0PSgpPT57CnRocm93IEVycm9yKCJtYXAgaXMgcmVhZC1vbmx5Iil9Om4gaW5zdGFuY2VvZiBTZXQmJihuLmFkZD1uLmNsZWFyPW4uZGVsZXRlPSgpPT57CnRocm93IEVycm9yKCJzZXQgaXMgcmVhZC1vbmx5IikKfSksT2JqZWN0LmZyZWV6ZShuKSxPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyhuKS5mb3JFYWNoKCh0PT57CmNvbnN0IGE9blt0XSxpPXR5cGVvZiBhOyJvYmplY3QiIT09aSYmImZ1bmN0aW9uIiE9PWl8fE9iamVjdC5pc0Zyb3plbihhKXx8ZShhKQp9KSksbn1jbGFzcyBue2NvbnN0cnVjdG9yKGUpewp2b2lkIDA9PT1lLmRhdGEmJihlLmRhdGE9e30pLHRoaXMuZGF0YT1lLmRhdGEsdGhpcy5pc01hdGNoSWdub3JlZD0hMX0KaWdub3JlTWF0Y2goKXt0aGlzLmlzTWF0Y2hJZ25vcmVkPSEwfX1mdW5jdGlvbiB0KGUpewpyZXR1cm4gZS5yZXBsYWNlKC8mL2csIiZhbXA7IikucmVwbGFjZSgvPC9nLCImbHQ7IikucmVwbGFjZSgvPi9nLCImZ3Q7IikucmVwbGFjZSgvIi9nLCImcXVvdDsiKS5yZXBsYWNlKC8nL2csIiYjeDI3OyIpCn1mdW5jdGlvbiBhKGUsLi4ubil7Y29uc3QgdD1PYmplY3QuY3JlYXRlKG51bGwpO2Zvcihjb25zdCBuIGluIGUpdFtuXT1lW25dCjtyZXR1cm4gbi5mb3JFYWNoKChlPT57Zm9yKGNvbnN0IG4gaW4gZSl0W25dPWVbbl19KSksdH1jb25zdCBpPWU9PiEhZS5zY29wZQo7Y2xhc3Mgcntjb25zdHJ1Y3RvcihlLG4pewp0aGlzLmJ1ZmZlcj0iIix0aGlzLmNsYXNzUHJlZml4PW4uY2xhc3NQcmVmaXgsZS53YWxrKHRoaXMpfWFkZFRleHQoZSl7CnRoaXMuYnVmZmVyKz10KGUpfW9wZW5Ob2RlKGUpe2lmKCFpKGUpKXJldHVybjtjb25zdCBuPSgoZSx7cHJlZml4Om59KT0+ewppZihlLnN0YXJ0c1dpdGgoImxhbmd1YWdlOiIpKXJldHVybiBlLnJlcGxhY2UoImxhbmd1YWdlOiIsImxhbmd1YWdlLSIpCjtpZihlLmluY2x1ZGVzKCIuIikpe2NvbnN0IHQ9ZS5zcGxpdCgiLiIpCjtyZXR1cm5bYCR7bn0ke3Quc2hpZnQoKX1gLC4uLnQubWFwKCgoZSxuKT0+YCR7ZX0keyJfIi5yZXBlYXQobisxKX1gKSldLmpvaW4oIiAiKQp9cmV0dXJuYCR7bn0ke2V9YH0pKGUuc2NvcGUse3ByZWZpeDp0aGlzLmNsYXNzUHJlZml4fSk7dGhpcy5zcGFuKG4pfQpjbG9zZU5vZGUoZSl7aShlKSYmKHRoaXMuYnVmZmVyKz0iPC9zcGFuPiIpfXZhbHVlKCl7cmV0dXJuIHRoaXMuYnVmZmVyfXNwYW4oZSl7CnRoaXMuYnVmZmVyKz1gPHNwYW4gY2xhc3M9IiR7ZX0iPmB9fWNvbnN0IHM9KGU9e30pPT57Y29uc3Qgbj17Y2hpbGRyZW46W119CjtyZXR1cm4gT2JqZWN0LmFzc2lnbihuLGUpLG59O2NsYXNzIG97Y29uc3RydWN0b3IoKXsKdGhpcy5yb290Tm9kZT1zKCksdGhpcy5zdGFjaz1bdGhpcy5yb290Tm9kZV19Z2V0IHRvcCgpewpyZXR1cm4gdGhpcy5zdGFja1t0aGlzLnN0YWNrLmxlbmd0aC0xXX1nZXQgcm9vdCgpe3JldHVybiB0aGlzLnJvb3ROb2RlfWFkZChlKXsKdGhpcy50b3AuY2hpbGRyZW4ucHVzaChlKX1vcGVuTm9kZShlKXtjb25zdCBuPXMoe3Njb3BlOmV9KQo7dGhpcy5hZGQobiksdGhpcy5zdGFjay5wdXNoKG4pfWNsb3NlTm9kZSgpewppZih0aGlzLnN0YWNrLmxlbmd0aD4xKXJldHVybiB0aGlzLnN0YWNrLnBvcCgpfWNsb3NlQWxsTm9kZXMoKXsKZm9yKDt0aGlzLmNsb3NlTm9kZSgpOyk7fXRvSlNPTigpe3JldHVybiBKU09OLnN0cmluZ2lmeSh0aGlzLnJvb3ROb2RlLG51bGwsNCl9CndhbGsoZSl7cmV0dXJuIHRoaXMuY29uc3RydWN0b3IuX3dhbGsoZSx0aGlzLnJvb3ROb2RlKX1zdGF0aWMgX3dhbGsoZSxuKXsKcmV0dXJuInN0cmluZyI9PXR5cGVvZiBuP2UuYWRkVGV4dChuKTpuLmNoaWxkcmVuJiYoZS5vcGVuTm9kZShuKSwKbi5jaGlsZHJlbi5mb3JFYWNoKChuPT50aGlzLl93YWxrKGUsbikpKSxlLmNsb3NlTm9kZShuKSksZX1zdGF0aWMgX2NvbGxhcHNlKGUpewoic3RyaW5nIiE9dHlwZW9mIGUmJmUuY2hpbGRyZW4mJihlLmNoaWxkcmVuLmV2ZXJ5KChlPT4ic3RyaW5nIj09dHlwZW9mIGUpKT9lLmNoaWxkcmVuPVtlLmNoaWxkcmVuLmpvaW4oIiIpXTplLmNoaWxkcmVuLmZvckVhY2goKGU9PnsKby5fY29sbGFwc2UoZSl9KSkpfX1jbGFzcyBsIGV4dGVuZHMgb3tjb25zdHJ1Y3RvcihlKXtzdXBlcigpLHRoaXMub3B0aW9ucz1lfQphZGRUZXh0KGUpeyIiIT09ZSYmdGhpcy5hZGQoZSl9c3RhcnRTY29wZShlKXt0aGlzLm9wZW5Ob2RlKGUpfWVuZFNjb3BlKCl7CnRoaXMuY2xvc2VOb2RlKCl9X19hZGRTdWJsYW5ndWFnZShlLG4pe2NvbnN0IHQ9ZS5yb290CjtuJiYodC5zY29wZT0ibGFuZ3VhZ2U6IituKSx0aGlzLmFkZCh0KX10b0hUTUwoKXsKcmV0dXJuIG5ldyByKHRoaXMsdGhpcy5vcHRpb25zKS52YWx1ZSgpfWZpbmFsaXplKCl7CnJldHVybiB0aGlzLmNsb3NlQWxsTm9kZXMoKSwhMH19ZnVuY3Rpb24gYyhlKXsKcmV0dXJuIGU/InN0cmluZyI9PXR5cGVvZiBlP2U6ZS5zb3VyY2U6bnVsbH1mdW5jdGlvbiBkKGUpe3JldHVybiBiKCIoPz0iLGUsIikiKX0KZnVuY3Rpb24gZyhlKXtyZXR1cm4gYigiKD86IixlLCIpKiIpfWZ1bmN0aW9uIHUoZSl7cmV0dXJuIGIoIig/OiIsZSwiKT8iKX0KZnVuY3Rpb24gYiguLi5lKXtyZXR1cm4gZS5tYXAoKGU9PmMoZSkpKS5qb2luKCIiKX1mdW5jdGlvbiBtKC4uLmUpe2NvbnN0IG49KGU9PnsKY29uc3Qgbj1lW2UubGVuZ3RoLTFdCjtyZXR1cm4ib2JqZWN0Ij09dHlwZW9mIG4mJm4uY29uc3RydWN0b3I9PT1PYmplY3Q/KGUuc3BsaWNlKGUubGVuZ3RoLTEsMSksbik6e30KfSkoZSk7cmV0dXJuIigiKyhuLmNhcHR1cmU/IiI6Ij86IikrZS5tYXAoKGU9PmMoZSkpKS5qb2luKCJ8IikrIikifQpmdW5jdGlvbiBwKGUpe3JldHVybiBSZWdFeHAoZS50b1N0cmluZygpKyJ8IikuZXhlYygiIikubGVuZ3RoLTF9CmNvbnN0IF89L1xbKD86W15cXFxdXXxcXC4pKlxdfFwoXD8/fFxcKFsxLTldWzAtOV0qKXxcXC4vCjtmdW5jdGlvbiBoKGUse2pvaW5XaXRoOm59KXtsZXQgdD0wO3JldHVybiBlLm1hcCgoZT0+e3QrPTE7Y29uc3Qgbj10CjtsZXQgYT1jKGUpLGk9IiI7Zm9yKDthLmxlbmd0aD4wOyl7Y29uc3QgZT1fLmV4ZWMoYSk7aWYoIWUpe2krPWE7YnJlYWt9CmkrPWEuc3Vic3RyaW5nKDAsZS5pbmRleCksCmE9YS5zdWJzdHJpbmcoZS5pbmRleCtlWzBdLmxlbmd0aCksIlxcIj09PWVbMF1bMF0mJmVbMV0/aSs9IlxcIisoTnVtYmVyKGVbMV0pK24pOihpKz1lWzBdLAoiKCI9PT1lWzBdJiZ0KyspfXJldHVybiBpfSkpLm1hcCgoZT0+YCgke2V9KWApKS5qb2luKG4pfQpjb25zdCBmPSJbYS16QS1aXVxcdyoiLEU9IlthLXpBLVpfXVxcdyoiLHk9IlxcYlxcZCsoXFwuXFxkKyk/IixOPSIoLT8pKFxcYjBbeFhdW2EtZkEtRjAtOV0rfChcXGJcXGQrKFxcLlxcZCopP3xcXC5cXGQrKShbZUVdWy0rXT9cXGQrKT8pIix3PSJcXGIoMGJbMDFdKykiLHY9ewpiZWdpbjoiXFxcXFtcXHNcXFNdIixyZWxldmFuY2U6MH0sTz17c2NvcGU6InN0cmluZyIsYmVnaW46IiciLGVuZDoiJyIsCmlsbGVnYWw6IlxcbiIsY29udGFpbnM6W3ZdfSxrPXtzY29wZToic3RyaW5nIixiZWdpbjonIicsZW5kOiciJyxpbGxlZ2FsOiJcXG4iLApjb250YWluczpbdl19LHg9KGUsbix0PXt9KT0+e2NvbnN0IGk9YSh7c2NvcGU6ImNvbW1lbnQiLGJlZ2luOmUsZW5kOm4sCmNvbnRhaW5zOltdfSx0KTtpLmNvbnRhaW5zLnB1c2goe3Njb3BlOiJkb2N0YWciLApiZWdpbjoiWyBdKig/PShUT0RPfEZJWE1FfE5PVEV8QlVHfE9QVElNSVpFfEhBQ0t8WFhYKTopIiwKZW5kOi8oVE9ET3xGSVhNRXxOT1RFfEJVR3xPUFRJTUlaRXxIQUNLfFhYWCk6LyxleGNsdWRlQmVnaW46ITAscmVsZXZhbmNlOjB9KQo7Y29uc3Qgcj1tKCJJIiwiYSIsImlzIiwic28iLCJ1cyIsInRvIiwiYXQiLCJpZiIsImluIiwiaXQiLCJvbiIsL1tBLVphLXpdK1snXShkfHZlfHJlfGxsfHR8c3xuKS8sL1tBLVphLXpdK1stXVthLXpdKy8sL1tBLVphLXpdW2Etel17Mix9LykKO3JldHVybiBpLmNvbnRhaW5zLnB1c2goe2JlZ2luOmIoL1sgXSsvLCIoIixyLC9bLl0/WzpdPyhbLl1bIF18WyBdKS8sIil7M30iKX0pLGkKfSxNPXgoIi8vIiwiJCIpLFM9eCgiL1xcKiIsIlxcKi8iKSxBPXgoIiMiLCIkIik7dmFyIEM9T2JqZWN0LmZyZWV6ZSh7Cl9fcHJvdG9fXzpudWxsLEFQT1NfU1RSSU5HX01PREU6TyxCQUNLU0xBU0hfRVNDQVBFOnYsQklOQVJZX05VTUJFUl9NT0RFOnsKc2NvcGU6Im51bWJlciIsYmVnaW46dyxyZWxldmFuY2U6MH0sQklOQVJZX05VTUJFUl9SRTp3LENPTU1FTlQ6eCwKQ19CTE9DS19DT01NRU5UX01PREU6UyxDX0xJTkVfQ09NTUVOVF9NT0RFOk0sQ19OVU1CRVJfTU9ERTp7c2NvcGU6Im51bWJlciIsCmJlZ2luOk4scmVsZXZhbmNlOjB9LENfTlVNQkVSX1JFOk4sRU5EX1NBTUVfQVNfQkVHSU46ZT0+T2JqZWN0LmFzc2lnbihlLHsKIm9uOmJlZ2luIjooZSxuKT0+e24uZGF0YS5fYmVnaW5NYXRjaD1lWzFdfSwib246ZW5kIjooZSxuKT0+ewpuLmRhdGEuX2JlZ2luTWF0Y2ghPT1lWzFdJiZuLmlnbm9yZU1hdGNoKCl9fSksSEFTSF9DT01NRU5UX01PREU6QSxJREVOVF9SRTpmLApNQVRDSF9OT1RISU5HX1JFOi9cYlxCLyxNRVRIT0RfR1VBUkQ6e2JlZ2luOiJcXC5cXHMqIitFLHJlbGV2YW5jZTowfSwKTlVNQkVSX01PREU6e3Njb3BlOiJudW1iZXIiLGJlZ2luOnkscmVsZXZhbmNlOjB9LE5VTUJFUl9SRTp5LApQSFJBU0FMX1dPUkRTX01PREU6ewpiZWdpbjovXGIoYXxhbnx0aGV8YXJlfEknbXxpc24ndHxkb24ndHxkb2Vzbid0fHdvbid0fGJ1dHxqdXN0fHNob3VsZHxwcmV0dHl8c2ltcGx5fGVub3VnaHxnb25uYXxnb2luZ3x3dGZ8c298c3VjaHx3aWxsfHlvdXx5b3VyfHRoZXl8bGlrZXxtb3JlKVxiLwp9LFFVT1RFX1NUUklOR19NT0RFOmssUkVHRVhQX01PREU6e3Njb3BlOiJyZWdleHAiLGJlZ2luOi9cLyg/PVteL1xuXSpcLykvLAplbmQ6L1wvW2dpbXV5XSovLGNvbnRhaW5zOlt2LHtiZWdpbjovXFsvLGVuZDovXF0vLHJlbGV2YW5jZTowLGNvbnRhaW5zOlt2XX1dfSwKUkVfU1RBUlRFUlNfUkU6IiF8IT18IT09fCV8JT18JnwmJnwmPXxcXCp8XFwqPXxcXCt8XFwrPXwsfC18LT18Lz18L3w6fDt8PDx8PDw9fDw9fDx8PT09fD09fD18Pj4+PXw+Pj18Pj18Pj4+fD4+fD58XFw/fFxcW3xcXHt8XFwofFxcXnxcXF49fFxcfHxcXHw9fFxcfFxcfHx+IiwKU0hFQkFORzooZT17fSk9Pntjb25zdCBuPS9eIyFbIF0qXC8vCjtyZXR1cm4gZS5iaW5hcnkmJihlLmJlZ2luPWIobiwvLipcYi8sZS5iaW5hcnksL1xiLiovKSksYSh7c2NvcGU6Im1ldGEiLGJlZ2luOm4sCmVuZDovJC8scmVsZXZhbmNlOjAsIm9uOmJlZ2luIjooZSxuKT0+ezAhPT1lLmluZGV4JiZuLmlnbm9yZU1hdGNoKCl9fSxlKX0sClRJVExFX01PREU6e3Njb3BlOiJ0aXRsZSIsYmVnaW46ZixyZWxldmFuY2U6MH0sVU5ERVJTQ09SRV9JREVOVF9SRTpFLApVTkRFUlNDT1JFX1RJVExFX01PREU6e3Njb3BlOiJ0aXRsZSIsYmVnaW46RSxyZWxldmFuY2U6MH19KTtmdW5jdGlvbiBUKGUsbil7CiIuIj09PWUuaW5wdXRbZS5pbmRleC0xXSYmbi5pZ25vcmVNYXRjaCgpfWZ1bmN0aW9uIFIoZSxuKXsKdm9pZCAwIT09ZS5jbGFzc05hbWUmJihlLnNjb3BlPWUuY2xhc3NOYW1lLGRlbGV0ZSBlLmNsYXNzTmFtZSl9ZnVuY3Rpb24gRChlLG4pewpuJiZlLmJlZ2luS2V5d29yZHMmJihlLmJlZ2luPSJcXGIoIitlLmJlZ2luS2V5d29yZHMuc3BsaXQoIiAiKS5qb2luKCJ8IikrIikoPyFcXC4pKD89XFxifFxccykiLAplLl9fYmVmb3JlQmVnaW49VCxlLmtleXdvcmRzPWUua2V5d29yZHN8fGUuYmVnaW5LZXl3b3JkcyxkZWxldGUgZS5iZWdpbktleXdvcmRzLAp2b2lkIDA9PT1lLnJlbGV2YW5jZSYmKGUucmVsZXZhbmNlPTApKX1mdW5jdGlvbiBJKGUsbil7CkFycmF5LmlzQXJyYXkoZS5pbGxlZ2FsKSYmKGUuaWxsZWdhbD1tKC4uLmUuaWxsZWdhbCkpfWZ1bmN0aW9uIEwoZSxuKXsKaWYoZS5tYXRjaCl7CmlmKGUuYmVnaW58fGUuZW5kKXRocm93IEVycm9yKCJiZWdpbiAmIGVuZCBhcmUgbm90IHN1cHBvcnRlZCB3aXRoIG1hdGNoIikKO2UuYmVnaW49ZS5tYXRjaCxkZWxldGUgZS5tYXRjaH19ZnVuY3Rpb24gQihlLG4pewp2b2lkIDA9PT1lLnJlbGV2YW5jZSYmKGUucmVsZXZhbmNlPTEpfWNvbnN0ICQ9KGUsbik9PntpZighZS5iZWZvcmVNYXRjaClyZXR1cm4KO2lmKGUuc3RhcnRzKXRocm93IEVycm9yKCJiZWZvcmVNYXRjaCBjYW5ub3QgYmUgdXNlZCB3aXRoIHN0YXJ0cyIpCjtjb25zdCB0PU9iamVjdC5hc3NpZ24oe30sZSk7T2JqZWN0LmtleXMoZSkuZm9yRWFjaCgobj0+e2RlbGV0ZSBlW25dCn0pKSxlLmtleXdvcmRzPXQua2V5d29yZHMsZS5iZWdpbj1iKHQuYmVmb3JlTWF0Y2gsZCh0LmJlZ2luKSksZS5zdGFydHM9ewpyZWxldmFuY2U6MCxjb250YWluczpbT2JqZWN0LmFzc2lnbih0LHtlbmRzUGFyZW50OiEwfSldCn0sZS5yZWxldmFuY2U9MCxkZWxldGUgdC5iZWZvcmVNYXRjaAp9LHo9WyJvZiIsImFuZCIsImZvciIsImluIiwibm90Iiwib3IiLCJpZiIsInRoZW4iLCJwYXJlbnQiLCJsaXN0IiwidmFsdWUiXSxGPSJrZXl3b3JkIgo7ZnVuY3Rpb24gVShlLG4sdD1GKXtjb25zdCBhPU9iamVjdC5jcmVhdGUobnVsbCkKO3JldHVybiJzdHJpbmciPT10eXBlb2YgZT9pKHQsZS5zcGxpdCgiICIpKTpBcnJheS5pc0FycmF5KGUpP2kodCxlKTpPYmplY3Qua2V5cyhlKS5mb3JFYWNoKCh0PT57Ck9iamVjdC5hc3NpZ24oYSxVKGVbdF0sbix0KSl9KSksYTtmdW5jdGlvbiBpKGUsdCl7Cm4mJih0PXQubWFwKChlPT5lLnRvTG93ZXJDYXNlKCkpKSksdC5mb3JFYWNoKChuPT57Y29uc3QgdD1uLnNwbGl0KCJ8IikKO2FbdFswXV09W2Usaih0WzBdLHRbMV0pXX0pKX19ZnVuY3Rpb24gaihlLG4pewpyZXR1cm4gbj9OdW1iZXIobik6KGU9PnouaW5jbHVkZXMoZS50b0xvd2VyQ2FzZSgpKSkoZSk/MDoxfWNvbnN0IFA9e30sSz1lPT57CmNvbnNvbGUuZXJyb3IoZSl9LEg9KGUsLi4ubik9Pntjb25zb2xlLmxvZygiV0FSTjogIitlLC4uLm4pfSxxPShlLG4pPT57ClBbYCR7ZX0vJHtufWBdfHwoY29uc29sZS5sb2coYERlcHJlY2F0ZWQgYXMgb2YgJHtlfS4gJHtufWApLFBbYCR7ZX0vJHtufWBdPSEwKQp9LEc9RXJyb3IoKTtmdW5jdGlvbiBaKGUsbix7a2V5OnR9KXtsZXQgYT0wO2NvbnN0IGk9ZVt0XSxyPXt9LHM9e30KO2ZvcihsZXQgZT0xO2U8PW4ubGVuZ3RoO2UrKylzW2UrYV09aVtlXSxyW2UrYV09ITAsYSs9cChuW2UtMV0pCjtlW3RdPXMsZVt0XS5fZW1pdD1yLGVbdF0uX211bHRpPSEwfWZ1bmN0aW9uIFcoZSl7KGU9PnsKZS5zY29wZSYmIm9iamVjdCI9PXR5cGVvZiBlLnNjb3BlJiZudWxsIT09ZS5zY29wZSYmKGUuYmVnaW5TY29wZT1lLnNjb3BlLApkZWxldGUgZS5zY29wZSl9KShlKSwic3RyaW5nIj09dHlwZW9mIGUuYmVnaW5TY29wZSYmKGUuYmVnaW5TY29wZT17Cl93cmFwOmUuYmVnaW5TY29wZX0pLCJzdHJpbmciPT10eXBlb2YgZS5lbmRTY29wZSYmKGUuZW5kU2NvcGU9e193cmFwOmUuZW5kU2NvcGUKfSksKGU9PntpZihBcnJheS5pc0FycmF5KGUuYmVnaW4pKXsKaWYoZS5za2lwfHxlLmV4Y2x1ZGVCZWdpbnx8ZS5yZXR1cm5CZWdpbil0aHJvdyBLKCJza2lwLCBleGNsdWRlQmVnaW4sIHJldHVybkJlZ2luIG5vdCBjb21wYXRpYmxlIHdpdGggYmVnaW5TY29wZToge30iKSwKRwo7aWYoIm9iamVjdCIhPXR5cGVvZiBlLmJlZ2luU2NvcGV8fG51bGw9PT1lLmJlZ2luU2NvcGUpdGhyb3cgSygiYmVnaW5TY29wZSBtdXN0IGJlIG9iamVjdCIpLApHO1ooZSxlLmJlZ2luLHtrZXk6ImJlZ2luU2NvcGUifSksZS5iZWdpbj1oKGUuYmVnaW4se2pvaW5XaXRoOiIifSl9fSkoZSksKGU9PnsKaWYoQXJyYXkuaXNBcnJheShlLmVuZCkpewppZihlLnNraXB8fGUuZXhjbHVkZUVuZHx8ZS5yZXR1cm5FbmQpdGhyb3cgSygic2tpcCwgZXhjbHVkZUVuZCwgcmV0dXJuRW5kIG5vdCBjb21wYXRpYmxlIHdpdGggZW5kU2NvcGU6IHt9IiksCkcKO2lmKCJvYmplY3QiIT10eXBlb2YgZS5lbmRTY29wZXx8bnVsbD09PWUuZW5kU2NvcGUpdGhyb3cgSygiZW5kU2NvcGUgbXVzdCBiZSBvYmplY3QiKSwKRztaKGUsZS5lbmQse2tleToiZW5kU2NvcGUifSksZS5lbmQ9aChlLmVuZCx7am9pbldpdGg6IiJ9KX19KShlKX1mdW5jdGlvbiBRKGUpewpmdW5jdGlvbiBuKG4sdCl7CnJldHVybiBSZWdFeHAoYyhuKSwibSIrKGUuY2FzZV9pbnNlbnNpdGl2ZT8iaSI6IiIpKyhlLnVuaWNvZGVSZWdleD8idSI6IiIpKyh0PyJnIjoiIikpCn1jbGFzcyB0e2NvbnN0cnVjdG9yKCl7CnRoaXMubWF0Y2hJbmRleGVzPXt9LHRoaXMucmVnZXhlcz1bXSx0aGlzLm1hdGNoQXQ9MSx0aGlzLnBvc2l0aW9uPTB9CmFkZFJ1bGUoZSxuKXsKbi5wb3NpdGlvbj10aGlzLnBvc2l0aW9uKyssdGhpcy5tYXRjaEluZGV4ZXNbdGhpcy5tYXRjaEF0XT1uLHRoaXMucmVnZXhlcy5wdXNoKFtuLGVdKSwKdGhpcy5tYXRjaEF0Kz1wKGUpKzF9Y29tcGlsZSgpezA9PT10aGlzLnJlZ2V4ZXMubGVuZ3RoJiYodGhpcy5leGVjPSgpPT5udWxsKQo7Y29uc3QgZT10aGlzLnJlZ2V4ZXMubWFwKChlPT5lWzFdKSk7dGhpcy5tYXRjaGVyUmU9bihoKGUse2pvaW5XaXRoOiJ8Igp9KSwhMCksdGhpcy5sYXN0SW5kZXg9MH1leGVjKGUpe3RoaXMubWF0Y2hlclJlLmxhc3RJbmRleD10aGlzLmxhc3RJbmRleAo7Y29uc3Qgbj10aGlzLm1hdGNoZXJSZS5leGVjKGUpO2lmKCFuKXJldHVybiBudWxsCjtjb25zdCB0PW4uZmluZEluZGV4KCgoZSxuKT0+bj4wJiZ2b2lkIDAhPT1lKSksYT10aGlzLm1hdGNoSW5kZXhlc1t0XQo7cmV0dXJuIG4uc3BsaWNlKDAsdCksT2JqZWN0LmFzc2lnbihuLGEpfX1jbGFzcyBpe2NvbnN0cnVjdG9yKCl7CnRoaXMucnVsZXM9W10sdGhpcy5tdWx0aVJlZ2V4ZXM9W10sCnRoaXMuY291bnQ9MCx0aGlzLmxhc3RJbmRleD0wLHRoaXMucmVnZXhJbmRleD0wfWdldE1hdGNoZXIoZSl7CmlmKHRoaXMubXVsdGlSZWdleGVzW2VdKXJldHVybiB0aGlzLm11bHRpUmVnZXhlc1tlXTtjb25zdCBuPW5ldyB0CjtyZXR1cm4gdGhpcy5ydWxlcy5zbGljZShlKS5mb3JFYWNoKCgoW2UsdF0pPT5uLmFkZFJ1bGUoZSx0KSkpLApuLmNvbXBpbGUoKSx0aGlzLm11bHRpUmVnZXhlc1tlXT1uLG59cmVzdW1pbmdTY2FuQXRTYW1lUG9zaXRpb24oKXsKcmV0dXJuIDAhPT10aGlzLnJlZ2V4SW5kZXh9Y29uc2lkZXJBbGwoKXt0aGlzLnJlZ2V4SW5kZXg9MH1hZGRSdWxlKGUsbil7CnRoaXMucnVsZXMucHVzaChbZSxuXSksImJlZ2luIj09PW4udHlwZSYmdGhpcy5jb3VudCsrfWV4ZWMoZSl7CmNvbnN0IG49dGhpcy5nZXRNYXRjaGVyKHRoaXMucmVnZXhJbmRleCk7bi5sYXN0SW5kZXg9dGhpcy5sYXN0SW5kZXgKO2xldCB0PW4uZXhlYyhlKQo7aWYodGhpcy5yZXN1bWluZ1NjYW5BdFNhbWVQb3NpdGlvbigpKWlmKHQmJnQuaW5kZXg9PT10aGlzLmxhc3RJbmRleCk7ZWxzZXsKY29uc3Qgbj10aGlzLmdldE1hdGNoZXIoMCk7bi5sYXN0SW5kZXg9dGhpcy5sYXN0SW5kZXgrMSx0PW4uZXhlYyhlKX0KcmV0dXJuIHQmJih0aGlzLnJlZ2V4SW5kZXgrPXQucG9zaXRpb24rMSwKdGhpcy5yZWdleEluZGV4PT09dGhpcy5jb3VudCYmdGhpcy5jb25zaWRlckFsbCgpKSx0fX0KaWYoZS5jb21waWxlckV4dGVuc2lvbnN8fChlLmNvbXBpbGVyRXh0ZW5zaW9ucz1bXSksCmUuY29udGFpbnMmJmUuY29udGFpbnMuaW5jbHVkZXMoInNlbGYiKSl0aHJvdyBFcnJvcigiRVJSOiBjb250YWlucyBgc2VsZmAgaXMgbm90IHN1cHBvcnRlZCBhdCB0aGUgdG9wLWxldmVsIG9mIGEgbGFuZ3VhZ2UuICBTZWUgZG9jdW1lbnRhdGlvbi4iKQo7cmV0dXJuIGUuY2xhc3NOYW1lQWxpYXNlcz1hKGUuY2xhc3NOYW1lQWxpYXNlc3x8e30pLGZ1bmN0aW9uIHQocixzKXtjb25zdCBvPXIKO2lmKHIuaXNDb21waWxlZClyZXR1cm4gbwo7W1IsTCxXLCRdLmZvckVhY2goKGU9PmUocixzKSkpLGUuY29tcGlsZXJFeHRlbnNpb25zLmZvckVhY2goKGU9PmUocixzKSkpLApyLl9fYmVmb3JlQmVnaW49bnVsbCxbRCxJLEJdLmZvckVhY2goKGU9PmUocixzKSkpLHIuaXNDb21waWxlZD0hMDtsZXQgbD1udWxsCjtyZXR1cm4ib2JqZWN0Ij09dHlwZW9mIHIua2V5d29yZHMmJnIua2V5d29yZHMuJHBhdHRlcm4mJihyLmtleXdvcmRzPU9iamVjdC5hc3NpZ24oe30sci5rZXl3b3JkcyksCmw9ci5rZXl3b3Jkcy4kcGF0dGVybiwKZGVsZXRlIHIua2V5d29yZHMuJHBhdHRlcm4pLGw9bHx8L1x3Ky8sci5rZXl3b3JkcyYmKHIua2V5d29yZHM9VShyLmtleXdvcmRzLGUuY2FzZV9pbnNlbnNpdGl2ZSkpLApvLmtleXdvcmRQYXR0ZXJuUmU9bihsLCEwKSwKcyYmKHIuYmVnaW58fChyLmJlZ2luPS9cQnxcYi8pLG8uYmVnaW5SZT1uKG8uYmVnaW4pLHIuZW5kfHxyLmVuZHNXaXRoUGFyZW50fHwoci5lbmQ9L1xCfFxiLyksCnIuZW5kJiYoby5lbmRSZT1uKG8uZW5kKSksCm8udGVybWluYXRvckVuZD1jKG8uZW5kKXx8IiIsci5lbmRzV2l0aFBhcmVudCYmcy50ZXJtaW5hdG9yRW5kJiYoby50ZXJtaW5hdG9yRW5kKz0oci5lbmQ/InwiOiIiKStzLnRlcm1pbmF0b3JFbmQpKSwKci5pbGxlZ2FsJiYoby5pbGxlZ2FsUmU9bihyLmlsbGVnYWwpKSwKci5jb250YWluc3x8KHIuY29udGFpbnM9W10pLHIuY29udGFpbnM9W10uY29uY2F0KC4uLnIuY29udGFpbnMubWFwKChlPT4oZT0+KGUudmFyaWFudHMmJiFlLmNhY2hlZFZhcmlhbnRzJiYoZS5jYWNoZWRWYXJpYW50cz1lLnZhcmlhbnRzLm1hcCgobj0+YShlLHsKdmFyaWFudHM6bnVsbH0sbikpKSksZS5jYWNoZWRWYXJpYW50cz9lLmNhY2hlZFZhcmlhbnRzOlgoZSk/YShlLHsKc3RhcnRzOmUuc3RhcnRzP2EoZS5zdGFydHMpOm51bGwKfSk6T2JqZWN0LmlzRnJvemVuKGUpP2EoZSk6ZSkpKCJzZWxmIj09PWU/cjplKSkpKSxyLmNvbnRhaW5zLmZvckVhY2goKGU9Pnt0KGUsbykKfSkpLHIuc3RhcnRzJiZ0KHIuc3RhcnRzLHMpLG8ubWF0Y2hlcj0oZT0+e2NvbnN0IG49bmV3IGkKO3JldHVybiBlLmNvbnRhaW5zLmZvckVhY2goKGU9Pm4uYWRkUnVsZShlLmJlZ2luLHtydWxlOmUsdHlwZToiYmVnaW4iCn0pKSksZS50ZXJtaW5hdG9yRW5kJiZuLmFkZFJ1bGUoZS50ZXJtaW5hdG9yRW5kLHt0eXBlOiJlbmQiCn0pLGUuaWxsZWdhbCYmbi5hZGRSdWxlKGUuaWxsZWdhbCx7dHlwZToiaWxsZWdhbCJ9KSxufSkobyksb30oZSl9ZnVuY3Rpb24gWChlKXsKcmV0dXJuISFlJiYoZS5lbmRzV2l0aFBhcmVudHx8WChlLnN0YXJ0cykpfWNsYXNzIFYgZXh0ZW5kcyBFcnJvcnsKY29uc3RydWN0b3IoZSxuKXtzdXBlcihlKSx0aGlzLm5hbWU9IkhUTUxJbmplY3Rpb25FcnJvciIsdGhpcy5odG1sPW59fQpjb25zdCBKPXQsWT1hLGVlPVN5bWJvbCgibm9tYXRjaCIpLG5lPXQ9PnsKY29uc3QgYT1PYmplY3QuY3JlYXRlKG51bGwpLGk9T2JqZWN0LmNyZWF0ZShudWxsKSxyPVtdO2xldCBzPSEwCjtjb25zdCBvPSJDb3VsZCBub3QgZmluZCB0aGUgbGFuZ3VhZ2UgJ3t9JywgZGlkIHlvdSBmb3JnZXQgdG8gbG9hZC9pbmNsdWRlIGEgbGFuZ3VhZ2UgbW9kdWxlPyIsYz17CmRpc2FibGVBdXRvZGV0ZWN0OiEwLG5hbWU6IlBsYWluIHRleHQiLGNvbnRhaW5zOltdfTtsZXQgcD17Cmlnbm9yZVVuZXNjYXBlZEhUTUw6ITEsdGhyb3dVbmVzY2FwZWRIVE1MOiExLG5vSGlnaGxpZ2h0UmU6L14obm8tP2hpZ2hsaWdodCkkL2ksCmxhbmd1YWdlRGV0ZWN0UmU6L1xibGFuZyg/OnVhZ2UpPy0oW1x3LV0rKVxiL2ksY2xhc3NQcmVmaXg6ImhsanMtIiwKY3NzU2VsZWN0b3I6InByZSBjb2RlIixsYW5ndWFnZXM6bnVsbCxfX2VtaXR0ZXI6bH07ZnVuY3Rpb24gXyhlKXsKcmV0dXJuIHAubm9IaWdobGlnaHRSZS50ZXN0KGUpfWZ1bmN0aW9uIGgoZSxuLHQpe2xldCBhPSIiLGk9IiIKOyJvYmplY3QiPT10eXBlb2Ygbj8oYT1lLAp0PW4uaWdub3JlSWxsZWdhbHMsaT1uLmxhbmd1YWdlKToocSgiMTAuNy4wIiwiaGlnaGxpZ2h0KGxhbmcsIGNvZGUsIC4uLmFyZ3MpIGhhcyBiZWVuIGRlcHJlY2F0ZWQuIiksCnEoIjEwLjcuMCIsIlBsZWFzZSB1c2UgaGlnaGxpZ2h0KGNvZGUsIG9wdGlvbnMpIGluc3RlYWQuXG5odHRwczovL2dpdGh1Yi5jb20vaGlnaGxpZ2h0anMvaGlnaGxpZ2h0LmpzL2lzc3Vlcy8yMjc3IiksCmk9ZSxhPW4pLHZvaWQgMD09PXQmJih0PSEwKTtjb25zdCByPXtjb2RlOmEsbGFuZ3VhZ2U6aX07eCgiYmVmb3JlOmhpZ2hsaWdodCIscikKO2NvbnN0IHM9ci5yZXN1bHQ/ci5yZXN1bHQ6ZihyLmxhbmd1YWdlLHIuY29kZSx0KQo7cmV0dXJuIHMuY29kZT1yLmNvZGUseCgiYWZ0ZXI6aGlnaGxpZ2h0IixzKSxzfWZ1bmN0aW9uIGYoZSx0LGkscil7CmNvbnN0IGw9T2JqZWN0LmNyZWF0ZShudWxsKTtmdW5jdGlvbiBjKCl7aWYoIXgua2V5d29yZHMpcmV0dXJuIHZvaWQgUy5hZGRUZXh0KEEpCjtsZXQgZT0wO3gua2V5d29yZFBhdHRlcm5SZS5sYXN0SW5kZXg9MDtsZXQgbj14LmtleXdvcmRQYXR0ZXJuUmUuZXhlYyhBKSx0PSIiCjtmb3IoO247KXt0Kz1BLnN1YnN0cmluZyhlLG4uaW5kZXgpCjtjb25zdCBpPXcuY2FzZV9pbnNlbnNpdGl2ZT9uWzBdLnRvTG93ZXJDYXNlKCk6blswXSxyPShhPWkseC5rZXl3b3Jkc1thXSk7aWYocil7CmNvbnN0W2UsYV09cgo7aWYoUy5hZGRUZXh0KHQpLHQ9IiIsbFtpXT0obFtpXXx8MCkrMSxsW2ldPD03JiYoQys9YSksZS5zdGFydHNXaXRoKCJfIikpdCs9blswXTtlbHNlewpjb25zdCB0PXcuY2xhc3NOYW1lQWxpYXNlc1tlXXx8ZTtnKG5bMF0sdCl9fWVsc2UgdCs9blswXQo7ZT14LmtleXdvcmRQYXR0ZXJuUmUubGFzdEluZGV4LG49eC5rZXl3b3JkUGF0dGVyblJlLmV4ZWMoQSl9dmFyIGEKO3QrPUEuc3Vic3RyaW5nKGUpLFMuYWRkVGV4dCh0KX1mdW5jdGlvbiBkKCl7bnVsbCE9eC5zdWJMYW5ndWFnZT8oKCk9PnsKaWYoIiI9PT1BKXJldHVybjtsZXQgZT1udWxsO2lmKCJzdHJpbmciPT10eXBlb2YgeC5zdWJMYW5ndWFnZSl7CmlmKCFhW3guc3ViTGFuZ3VhZ2VdKXJldHVybiB2b2lkIFMuYWRkVGV4dChBKQo7ZT1mKHguc3ViTGFuZ3VhZ2UsQSwhMCxNW3guc3ViTGFuZ3VhZ2VdKSxNW3guc3ViTGFuZ3VhZ2VdPWUuX3RvcAp9ZWxzZSBlPUUoQSx4LnN1Ykxhbmd1YWdlLmxlbmd0aD94LnN1Ykxhbmd1YWdlOm51bGwpCjt4LnJlbGV2YW5jZT4wJiYoQys9ZS5yZWxldmFuY2UpLFMuX19hZGRTdWJsYW5ndWFnZShlLl9lbWl0dGVyLGUubGFuZ3VhZ2UpCn0pKCk6YygpLEE9IiJ9ZnVuY3Rpb24gZyhlLG4pewoiIiE9PWUmJihTLnN0YXJ0U2NvcGUobiksUy5hZGRUZXh0KGUpLFMuZW5kU2NvcGUoKSl9ZnVuY3Rpb24gdShlLG4pe2xldCB0PTEKO2NvbnN0IGE9bi5sZW5ndGgtMTtmb3IoO3Q8PWE7KXtpZighZS5fZW1pdFt0XSl7dCsrO2NvbnRpbnVlfQpjb25zdCBhPXcuY2xhc3NOYW1lQWxpYXNlc1tlW3RdXXx8ZVt0XSxpPW5bdF07YT9nKGksYSk6KEE9aSxjKCksQT0iIiksdCsrfX0KZnVuY3Rpb24gYihlLG4pewpyZXR1cm4gZS5zY29wZSYmInN0cmluZyI9PXR5cGVvZiBlLnNjb3BlJiZTLm9wZW5Ob2RlKHcuY2xhc3NOYW1lQWxpYXNlc1tlLnNjb3BlXXx8ZS5zY29wZSksCmUuYmVnaW5TY29wZSYmKGUuYmVnaW5TY29wZS5fd3JhcD8oZyhBLHcuY2xhc3NOYW1lQWxpYXNlc1tlLmJlZ2luU2NvcGUuX3dyYXBdfHxlLmJlZ2luU2NvcGUuX3dyYXApLApBPSIiKTplLmJlZ2luU2NvcGUuX211bHRpJiYodShlLmJlZ2luU2NvcGUsbiksQT0iIikpLHg9T2JqZWN0LmNyZWF0ZShlLHtwYXJlbnQ6ewp2YWx1ZTp4fX0pLHh9ZnVuY3Rpb24gbShlLHQsYSl7bGV0IGk9KChlLG4pPT57Y29uc3QgdD1lJiZlLmV4ZWMobikKO3JldHVybiB0JiYwPT09dC5pbmRleH0pKGUuZW5kUmUsYSk7aWYoaSl7aWYoZVsib246ZW5kIl0pe2NvbnN0IGE9bmV3IG4oZSkKO2VbIm9uOmVuZCJdKHQsYSksYS5pc01hdGNoSWdub3JlZCYmKGk9ITEpfWlmKGkpewpmb3IoO2UuZW5kc1BhcmVudCYmZS5wYXJlbnQ7KWU9ZS5wYXJlbnQ7cmV0dXJuIGV9fQppZihlLmVuZHNXaXRoUGFyZW50KXJldHVybiBtKGUucGFyZW50LHQsYSl9ZnVuY3Rpb24gXyhlKXsKcmV0dXJuIDA9PT14Lm1hdGNoZXIucmVnZXhJbmRleD8oQSs9ZVswXSwxKTooRD0hMCwwKX1mdW5jdGlvbiBoKGUpewpjb25zdCBuPWVbMF0sYT10LnN1YnN0cmluZyhlLmluZGV4KSxpPW0oeCxlLGEpO2lmKCFpKXJldHVybiBlZTtjb25zdCByPXgKO3guZW5kU2NvcGUmJnguZW5kU2NvcGUuX3dyYXA/KGQoKSwKZyhuLHguZW5kU2NvcGUuX3dyYXApKTp4LmVuZFNjb3BlJiZ4LmVuZFNjb3BlLl9tdWx0aT8oZCgpLAp1KHguZW5kU2NvcGUsZSkpOnIuc2tpcD9BKz1uOihyLnJldHVybkVuZHx8ci5leGNsdWRlRW5kfHwoQSs9biksCmQoKSxyLmV4Y2x1ZGVFbmQmJihBPW4pKTtkb3sKeC5zY29wZSYmUy5jbG9zZU5vZGUoKSx4LnNraXB8fHguc3ViTGFuZ3VhZ2V8fChDKz14LnJlbGV2YW5jZSkseD14LnBhcmVudAp9d2hpbGUoeCE9PWkucGFyZW50KTtyZXR1cm4gaS5zdGFydHMmJmIoaS5zdGFydHMsZSksci5yZXR1cm5FbmQ/MDpuLmxlbmd0aH0KbGV0IHk9e307ZnVuY3Rpb24gTihhLHIpe2NvbnN0IG89ciYmclswXTtpZihBKz1hLG51bGw9PW8pcmV0dXJuIGQoKSwwCjtpZigiYmVnaW4iPT09eS50eXBlJiYiZW5kIj09PXIudHlwZSYmeS5pbmRleD09PXIuaW5kZXgmJiIiPT09byl7CmlmKEErPXQuc2xpY2Uoci5pbmRleCxyLmluZGV4KzEpLCFzKXtjb25zdCBuPUVycm9yKGAwIHdpZHRoIG1hdGNoIHJlZ2V4ICgke2V9KWApCjt0aHJvdyBuLmxhbmd1YWdlTmFtZT1lLG4uYmFkUnVsZT15LnJ1bGUsbn1yZXR1cm4gMX0KaWYoeT1yLCJiZWdpbiI9PT1yLnR5cGUpcmV0dXJuKGU9PnsKY29uc3QgdD1lWzBdLGE9ZS5ydWxlLGk9bmV3IG4oYSkscj1bYS5fX2JlZm9yZUJlZ2luLGFbIm9uOmJlZ2luIl1dCjtmb3IoY29uc3QgbiBvZiByKWlmKG4mJihuKGUsaSksaS5pc01hdGNoSWdub3JlZCkpcmV0dXJuIF8odCkKO3JldHVybiBhLnNraXA/QSs9dDooYS5leGNsdWRlQmVnaW4mJihBKz10KSwKZCgpLGEucmV0dXJuQmVnaW58fGEuZXhjbHVkZUJlZ2lufHwoQT10KSksYihhLGUpLGEucmV0dXJuQmVnaW4/MDp0Lmxlbmd0aH0pKHIpCjtpZigiaWxsZWdhbCI9PT1yLnR5cGUmJiFpKXsKY29uc3QgZT1FcnJvcignSWxsZWdhbCBsZXhlbWUgIicrbysnIiBmb3IgbW9kZSAiJysoeC5zY29wZXx8Ijx1bm5hbWVkPiIpKyciJykKO3Rocm93IGUubW9kZT14LGV9aWYoImVuZCI9PT1yLnR5cGUpe2NvbnN0IGU9aChyKTtpZihlIT09ZWUpcmV0dXJuIGV9CmlmKCJpbGxlZ2FsIj09PXIudHlwZSYmIiI9PT1vKXJldHVybiAxCjtpZihSPjFlNSYmUj4zKnIuaW5kZXgpdGhyb3cgRXJyb3IoInBvdGVudGlhbCBpbmZpbml0ZSBsb29wLCB3YXkgbW9yZSBpdGVyYXRpb25zIHRoYW4gbWF0Y2hlcyIpCjtyZXR1cm4gQSs9byxvLmxlbmd0aH1jb25zdCB3PXYoZSkKO2lmKCF3KXRocm93IEsoby5yZXBsYWNlKCJ7fSIsZSkpLEVycm9yKCdVbmtub3duIGxhbmd1YWdlOiAiJytlKyciJykKO2NvbnN0IE89USh3KTtsZXQgaz0iIix4PXJ8fE87Y29uc3QgTT17fSxTPW5ldyBwLl9fZW1pdHRlcihwKTsoKCk9Pntjb25zdCBlPVtdCjtmb3IobGV0IG49eDtuIT09dztuPW4ucGFyZW50KW4uc2NvcGUmJmUudW5zaGlmdChuLnNjb3BlKQo7ZS5mb3JFYWNoKChlPT5TLm9wZW5Ob2RlKGUpKSl9KSgpO2xldCBBPSIiLEM9MCxUPTAsUj0wLEQ9ITE7dHJ5ewppZih3Ll9fZW1pdFRva2Vucyl3Ll9fZW1pdFRva2Vucyh0LFMpO2Vsc2V7Zm9yKHgubWF0Y2hlci5jb25zaWRlckFsbCgpOzspewpSKyssRD9EPSExOngubWF0Y2hlci5jb25zaWRlckFsbCgpLHgubWF0Y2hlci5sYXN0SW5kZXg9VAo7Y29uc3QgZT14Lm1hdGNoZXIuZXhlYyh0KTtpZighZSlicmVhaztjb25zdCBuPU4odC5zdWJzdHJpbmcoVCxlLmluZGV4KSxlKQo7VD1lLmluZGV4K259Tih0LnN1YnN0cmluZyhUKSl9cmV0dXJuIFMuZmluYWxpemUoKSxrPVMudG9IVE1MKCkse2xhbmd1YWdlOmUsCnZhbHVlOmsscmVsZXZhbmNlOkMsaWxsZWdhbDohMSxfZW1pdHRlcjpTLF90b3A6eH19Y2F0Y2gobil7CmlmKG4ubWVzc2FnZSYmbi5tZXNzYWdlLmluY2x1ZGVzKCJJbGxlZ2FsIikpcmV0dXJue2xhbmd1YWdlOmUsdmFsdWU6Sih0KSwKaWxsZWdhbDohMCxyZWxldmFuY2U6MCxfaWxsZWdhbEJ5OnttZXNzYWdlOm4ubWVzc2FnZSxpbmRleDpULApjb250ZXh0OnQuc2xpY2UoVC0xMDAsVCsxMDApLG1vZGU6bi5tb2RlLHJlc3VsdFNvRmFyOmt9LF9lbWl0dGVyOlN9O2lmKHMpcmV0dXJuewpsYW5ndWFnZTplLHZhbHVlOkoodCksaWxsZWdhbDohMSxyZWxldmFuY2U6MCxlcnJvclJhaXNlZDpuLF9lbWl0dGVyOlMsX3RvcDp4fQo7dGhyb3cgbn19ZnVuY3Rpb24gRShlLG4pe249bnx8cC5sYW5ndWFnZXN8fE9iamVjdC5rZXlzKGEpO2NvbnN0IHQ9KGU9PnsKY29uc3Qgbj17dmFsdWU6SihlKSxpbGxlZ2FsOiExLHJlbGV2YW5jZTowLF90b3A6YyxfZW1pdHRlcjpuZXcgcC5fX2VtaXR0ZXIocCl9CjtyZXR1cm4gbi5fZW1pdHRlci5hZGRUZXh0KGUpLG59KShlKSxpPW4uZmlsdGVyKHYpLmZpbHRlcihrKS5tYXAoKG49PmYobixlLCExKSkpCjtpLnVuc2hpZnQodCk7Y29uc3Qgcj1pLnNvcnQoKChlLG4pPT57CmlmKGUucmVsZXZhbmNlIT09bi5yZWxldmFuY2UpcmV0dXJuIG4ucmVsZXZhbmNlLWUucmVsZXZhbmNlCjtpZihlLmxhbmd1YWdlJiZuLmxhbmd1YWdlKXtpZih2KGUubGFuZ3VhZ2UpLnN1cGVyc2V0T2Y9PT1uLmxhbmd1YWdlKXJldHVybiAxCjtpZih2KG4ubGFuZ3VhZ2UpLnN1cGVyc2V0T2Y9PT1lLmxhbmd1YWdlKXJldHVybi0xfXJldHVybiAwfSkpLFtzLG9dPXIsbD1zCjtyZXR1cm4gbC5zZWNvbmRCZXN0PW8sbH1mdW5jdGlvbiB5KGUpe2xldCBuPW51bGw7Y29uc3QgdD0oZT0+ewpsZXQgbj1lLmNsYXNzTmFtZSsiICI7bis9ZS5wYXJlbnROb2RlP2UucGFyZW50Tm9kZS5jbGFzc05hbWU6IiIKO2NvbnN0IHQ9cC5sYW5ndWFnZURldGVjdFJlLmV4ZWMobik7aWYodCl7Y29uc3Qgbj12KHRbMV0pCjtyZXR1cm4gbnx8KEgoby5yZXBsYWNlKCJ7fSIsdFsxXSkpLApIKCJGYWxsaW5nIGJhY2sgdG8gbm8taGlnaGxpZ2h0IG1vZGUgZm9yIHRoaXMgYmxvY2suIixlKSksbj90WzFdOiJuby1oaWdobGlnaHQifQpyZXR1cm4gbi5zcGxpdCgvXHMrLykuZmluZCgoZT0+XyhlKXx8dihlKSkpfSkoZSk7aWYoXyh0KSlyZXR1cm4KO2lmKHgoImJlZm9yZTpoaWdobGlnaHRFbGVtZW50Iix7ZWw6ZSxsYW5ndWFnZTp0Cn0pLGUuZGF0YXNldC5oaWdobGlnaHRlZClyZXR1cm4gdm9pZCBjb25zb2xlLmxvZygiRWxlbWVudCBwcmV2aW91c2x5IGhpZ2hsaWdodGVkLiBUbyBoaWdobGlnaHQgYWdhaW4sIGZpcnN0IHVuc2V0IGBkYXRhc2V0LmhpZ2hsaWdodGVkYC4iLGUpCjtpZihlLmNoaWxkcmVuLmxlbmd0aD4wJiYocC5pZ25vcmVVbmVzY2FwZWRIVE1MfHwoY29uc29sZS53YXJuKCJPbmUgb2YgeW91ciBjb2RlIGJsb2NrcyBpbmNsdWRlcyB1bmVzY2FwZWQgSFRNTC4gVGhpcyBpcyBhIHBvdGVudGlhbGx5IHNlcmlvdXMgc2VjdXJpdHkgcmlzay4iKSwKY29uc29sZS53YXJuKCJodHRwczovL2dpdGh1Yi5jb20vaGlnaGxpZ2h0anMvaGlnaGxpZ2h0LmpzL3dpa2kvc2VjdXJpdHkiKSwKY29uc29sZS53YXJuKCJUaGUgZWxlbWVudCB3aXRoIHVuZXNjYXBlZCBIVE1MOiIpLApjb25zb2xlLndhcm4oZSkpLHAudGhyb3dVbmVzY2FwZWRIVE1MKSl0aHJvdyBuZXcgVigiT25lIG9mIHlvdXIgY29kZSBibG9ja3MgaW5jbHVkZXMgdW5lc2NhcGVkIEhUTUwuIixlLmlubmVySFRNTCkKO249ZTtjb25zdCBhPW4udGV4dENvbnRlbnQscj10P2goYSx7bGFuZ3VhZ2U6dCxpZ25vcmVJbGxlZ2FsczohMH0pOkUoYSkKO2UuaW5uZXJIVE1MPXIudmFsdWUsZS5kYXRhc2V0LmhpZ2hsaWdodGVkPSJ5ZXMiLCgoZSxuLHQpPT57Y29uc3QgYT1uJiZpW25dfHx0CjtlLmNsYXNzTGlzdC5hZGQoImhsanMiKSxlLmNsYXNzTGlzdC5hZGQoImxhbmd1YWdlLSIrYSkKfSkoZSx0LHIubGFuZ3VhZ2UpLGUucmVzdWx0PXtsYW5ndWFnZTpyLmxhbmd1YWdlLHJlOnIucmVsZXZhbmNlLApyZWxldmFuY2U6ci5yZWxldmFuY2V9LHIuc2Vjb25kQmVzdCYmKGUuc2Vjb25kQmVzdD17Cmxhbmd1YWdlOnIuc2Vjb25kQmVzdC5sYW5ndWFnZSxyZWxldmFuY2U6ci5zZWNvbmRCZXN0LnJlbGV2YW5jZQp9KSx4KCJhZnRlcjpoaWdobGlnaHRFbGVtZW50Iix7ZWw6ZSxyZXN1bHQ6cix0ZXh0OmF9KX1sZXQgTj0hMTtmdW5jdGlvbiB3KCl7CiJsb2FkaW5nIiE9PWRvY3VtZW50LnJlYWR5U3RhdGU/ZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChwLmNzc1NlbGVjdG9yKS5mb3JFYWNoKHkpOk49ITAKfWZ1bmN0aW9uIHYoZSl7cmV0dXJuIGU9KGV8fCIiKS50b0xvd2VyQ2FzZSgpLGFbZV18fGFbaVtlXV19CmZ1bmN0aW9uIE8oZSx7bGFuZ3VhZ2VOYW1lOm59KXsic3RyaW5nIj09dHlwZW9mIGUmJihlPVtlXSksZS5mb3JFYWNoKChlPT57CmlbZS50b0xvd2VyQ2FzZSgpXT1ufSkpfWZ1bmN0aW9uIGsoZSl7Y29uc3Qgbj12KGUpCjtyZXR1cm4gbiYmIW4uZGlzYWJsZUF1dG9kZXRlY3R9ZnVuY3Rpb24geChlLG4pe2NvbnN0IHQ9ZTtyLmZvckVhY2goKGU9PnsKZVt0XSYmZVt0XShuKX0pKX0KInVuZGVmaW5lZCIhPXR5cGVvZiB3aW5kb3cmJndpbmRvdy5hZGRFdmVudExpc3RlbmVyJiZ3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigiRE9NQ29udGVudExvYWRlZCIsKCgpPT57Ck4mJncoKX0pLCExKSxPYmplY3QuYXNzaWduKHQse2hpZ2hsaWdodDpoLGhpZ2hsaWdodEF1dG86RSxoaWdobGlnaHRBbGw6dywKaGlnaGxpZ2h0RWxlbWVudDp5LApoaWdobGlnaHRCbG9jazplPT4ocSgiMTAuNy4wIiwiaGlnaGxpZ2h0QmxvY2sgd2lsbCBiZSByZW1vdmVkIGVudGlyZWx5IGluIHYxMi4wIiksCnEoIjEwLjcuMCIsIlBsZWFzZSB1c2UgaGlnaGxpZ2h0RWxlbWVudCBub3cuIikseShlKSksY29uZmlndXJlOmU9PntwPVkocCxlKX0sCmluaXRIaWdobGlnaHRpbmc6KCk9PnsKdygpLHEoIjEwLjYuMCIsImluaXRIaWdobGlnaHRpbmcoKSBkZXByZWNhdGVkLiAgVXNlIGhpZ2hsaWdodEFsbCgpIG5vdy4iKX0sCmluaXRIaWdobGlnaHRpbmdPbkxvYWQ6KCk9PnsKdygpLHEoIjEwLjYuMCIsImluaXRIaWdobGlnaHRpbmdPbkxvYWQoKSBkZXByZWNhdGVkLiAgVXNlIGhpZ2hsaWdodEFsbCgpIG5vdy4iKQp9LHJlZ2lzdGVyTGFuZ3VhZ2U6KGUsbik9PntsZXQgaT1udWxsO3RyeXtpPW4odCl9Y2F0Y2gobil7CmlmKEsoIkxhbmd1YWdlIGRlZmluaXRpb24gZm9yICd7fScgY291bGQgbm90IGJlIHJlZ2lzdGVyZWQuIi5yZXBsYWNlKCJ7fSIsZSkpLAohcyl0aHJvdyBuO0sobiksaT1jfQppLm5hbWV8fChpLm5hbWU9ZSksYVtlXT1pLGkucmF3RGVmaW5pdGlvbj1uLmJpbmQobnVsbCx0KSxpLmFsaWFzZXMmJk8oaS5hbGlhc2VzLHsKbGFuZ3VhZ2VOYW1lOmV9KX0sdW5yZWdpc3Rlckxhbmd1YWdlOmU9PntkZWxldGUgYVtlXQo7Zm9yKGNvbnN0IG4gb2YgT2JqZWN0LmtleXMoaSkpaVtuXT09PWUmJmRlbGV0ZSBpW25dfSwKbGlzdExhbmd1YWdlczooKT0+T2JqZWN0LmtleXMoYSksZ2V0TGFuZ3VhZ2U6dixyZWdpc3RlckFsaWFzZXM6TywKYXV0b0RldGVjdGlvbjprLGluaGVyaXQ6WSxhZGRQbHVnaW46ZT0+eyhlPT57CmVbImJlZm9yZTpoaWdobGlnaHRCbG9jayJdJiYhZVsiYmVmb3JlOmhpZ2hsaWdodEVsZW1lbnQiXSYmKGVbImJlZm9yZTpoaWdobGlnaHRFbGVtZW50Il09bj0+ewplWyJiZWZvcmU6aGlnaGxpZ2h0QmxvY2siXShPYmplY3QuYXNzaWduKHtibG9jazpuLmVsfSxuKSkKfSksZVsiYWZ0ZXI6aGlnaGxpZ2h0QmxvY2siXSYmIWVbImFmdGVyOmhpZ2hsaWdodEVsZW1lbnQiXSYmKGVbImFmdGVyOmhpZ2hsaWdodEVsZW1lbnQiXT1uPT57CmVbImFmdGVyOmhpZ2hsaWdodEJsb2NrIl0oT2JqZWN0LmFzc2lnbih7YmxvY2s6bi5lbH0sbikpfSl9KShlKSxyLnB1c2goZSl9LApyZW1vdmVQbHVnaW46ZT0+e2NvbnN0IG49ci5pbmRleE9mKGUpOy0xIT09biYmci5zcGxpY2UobiwxKX19KSx0LmRlYnVnTW9kZT0oKT0+ewpzPSExfSx0LnNhZmVNb2RlPSgpPT57cz0hMH0sdC52ZXJzaW9uU3RyaW5nPSIxMS45LjAiLHQucmVnZXg9e2NvbmNhdDpiLApsb29rYWhlYWQ6ZCxlaXRoZXI6bSxvcHRpb25hbDp1LGFueU51bWJlck9mVGltZXM6Z30KO2Zvcihjb25zdCBuIGluIEMpIm9iamVjdCI9PXR5cGVvZiBDW25dJiZlKENbbl0pO3JldHVybiBPYmplY3QuYXNzaWduKHQsQyksdAp9LHRlPW5lKHt9KTt0ZS5uZXdJbnN0YW5jZT0oKT0+bmUoe30pO3ZhciBhZT10ZTtjb25zdCBpZT1lPT4oe0lNUE9SVEFOVDp7CnNjb3BlOiJtZXRhIixiZWdpbjoiIWltcG9ydGFudCJ9LEJMT0NLX0NPTU1FTlQ6ZS5DX0JMT0NLX0NPTU1FTlRfTU9ERSxIRVhDT0xPUjp7CnNjb3BlOiJudW1iZXIiLGJlZ2luOi8jKChbMC05YS1mQS1GXXszLDR9KXwoKFswLTlhLWZBLUZdezJ9KXszLDR9KSlcYi99LApGVU5DVElPTl9ESVNQQVRDSDp7Y2xhc3NOYW1lOiJidWlsdF9pbiIsYmVnaW46L1tcdy1dKyg/PVwoKS99LApBVFRSSUJVVEVfU0VMRUNUT1JfTU9ERTp7c2NvcGU6InNlbGVjdG9yLWF0dHIiLGJlZ2luOi9cWy8sZW5kOi9cXS8saWxsZWdhbDoiJCIsCmNvbnRhaW5zOltlLkFQT1NfU1RSSU5HX01PREUsZS5RVU9URV9TVFJJTkdfTU9ERV19LENTU19OVU1CRVJfTU9ERTp7CnNjb3BlOiJudW1iZXIiLApiZWdpbjplLk5VTUJFUl9SRSsiKCV8ZW18ZXh8Y2h8cmVtfHZ3fHZofHZtaW58dm1heHxjbXxtbXxpbnxwdHxwY3xweHxkZWd8Z3JhZHxyYWR8dHVybnxzfG1zfEh6fGtIenxkcGl8ZHBjbXxkcHB4KT8iLApyZWxldmFuY2U6MH0sQ1NTX1ZBUklBQkxFOntjbGFzc05hbWU6ImF0dHIiLGJlZ2luOi8tLVtBLVphLXpfXVtBLVphLXowLTlfLV0qL30KfSkscmU9WyJhIiwiYWJiciIsImFkZHJlc3MiLCJhcnRpY2xlIiwiYXNpZGUiLCJhdWRpbyIsImIiLCJibG9ja3F1b3RlIiwiYm9keSIsImJ1dHRvbiIsImNhbnZhcyIsImNhcHRpb24iLCJjaXRlIiwiY29kZSIsImRkIiwiZGVsIiwiZGV0YWlscyIsImRmbiIsImRpdiIsImRsIiwiZHQiLCJlbSIsImZpZWxkc2V0IiwiZmlnY2FwdGlvbiIsImZpZ3VyZSIsImZvb3RlciIsImZvcm0iLCJoMSIsImgyIiwiaDMiLCJoNCIsImg1IiwiaDYiLCJoZWFkZXIiLCJoZ3JvdXAiLCJodG1sIiwiaSIsImlmcmFtZSIsImltZyIsImlucHV0IiwiaW5zIiwia2JkIiwibGFiZWwiLCJsZWdlbmQiLCJsaSIsIm1haW4iLCJtYXJrIiwibWVudSIsIm5hdiIsIm9iamVjdCIsIm9sIiwicCIsInEiLCJxdW90ZSIsInNhbXAiLCJzZWN0aW9uIiwic3BhbiIsInN0cm9uZyIsInN1bW1hcnkiLCJzdXAiLCJ0YWJsZSIsInRib2R5IiwidGQiLCJ0ZXh0YXJlYSIsInRmb290IiwidGgiLCJ0aGVhZCIsInRpbWUiLCJ0ciIsInVsIiwidmFyIiwidmlkZW8iXSxzZT1bImFueS1ob3ZlciIsImFueS1wb2ludGVyIiwiYXNwZWN0LXJhdGlvIiwiY29sb3IiLCJjb2xvci1nYW11dCIsImNvbG9yLWluZGV4IiwiZGV2aWNlLWFzcGVjdC1yYXRpbyIsImRldmljZS1oZWlnaHQiLCJkZXZpY2Utd2lkdGgiLCJkaXNwbGF5LW1vZGUiLCJmb3JjZWQtY29sb3JzIiwiZ3JpZCIsImhlaWdodCIsImhvdmVyIiwiaW52ZXJ0ZWQtY29sb3JzIiwibW9ub2Nocm9tZSIsIm9yaWVudGF0aW9uIiwib3ZlcmZsb3ctYmxvY2siLCJvdmVyZmxvdy1pbmxpbmUiLCJwb2ludGVyIiwicHJlZmVycy1jb2xvci1zY2hlbWUiLCJwcmVmZXJzLWNvbnRyYXN0IiwicHJlZmVycy1yZWR1Y2VkLW1vdGlvbiIsInByZWZlcnMtcmVkdWNlZC10cmFuc3BhcmVuY3kiLCJyZXNvbHV0aW9uIiwic2NhbiIsInNjcmlwdGluZyIsInVwZGF0ZSIsIndpZHRoIiwibWluLXdpZHRoIiwibWF4LXdpZHRoIiwibWluLWhlaWdodCIsIm1heC1oZWlnaHQiXSxvZT1bImFjdGl2ZSIsImFueS1saW5rIiwiYmxhbmsiLCJjaGVja2VkIiwiY3VycmVudCIsImRlZmF1bHQiLCJkZWZpbmVkIiwiZGlyIiwiZGlzYWJsZWQiLCJkcm9wIiwiZW1wdHkiLCJlbmFibGVkIiwiZmlyc3QiLCJmaXJzdC1jaGlsZCIsImZpcnN0LW9mLXR5cGUiLCJmdWxsc2NyZWVuIiwiZnV0dXJlIiwiZm9jdXMiLCJmb2N1cy12aXNpYmxlIiwiZm9jdXMtd2l0aGluIiwiaGFzIiwiaG9zdCIsImhvc3QtY29udGV4dCIsImhvdmVyIiwiaW5kZXRlcm1pbmF0ZSIsImluLXJhbmdlIiwiaW52YWxpZCIsImlzIiwibGFuZyIsImxhc3QtY2hpbGQiLCJsYXN0LW9mLXR5cGUiLCJsZWZ0IiwibGluayIsImxvY2FsLWxpbmsiLCJub3QiLCJudGgtY2hpbGQiLCJudGgtY29sIiwibnRoLWxhc3QtY2hpbGQiLCJudGgtbGFzdC1jb2wiLCJudGgtbGFzdC1vZi10eXBlIiwibnRoLW9mLXR5cGUiLCJvbmx5LWNoaWxkIiwib25seS1vZi10eXBlIiwib3B0aW9uYWwiLCJvdXQtb2YtcmFuZ2UiLCJwYXN0IiwicGxhY2Vob2xkZXItc2hvd24iLCJyZWFkLW9ubHkiLCJyZWFkLXdyaXRlIiwicmVxdWlyZWQiLCJyaWdodCIsInJvb3QiLCJzY29wZSIsInRhcmdldCIsInRhcmdldC13aXRoaW4iLCJ1c2VyLWludmFsaWQiLCJ2YWxpZCIsInZpc2l0ZWQiLCJ3aGVyZSJdLGxlPVsiYWZ0ZXIiLCJiYWNrZHJvcCIsImJlZm9yZSIsImN1ZSIsImN1ZS1yZWdpb24iLCJmaXJzdC1sZXR0ZXIiLCJmaXJzdC1saW5lIiwiZ3JhbW1hci1lcnJvciIsIm1hcmtlciIsInBhcnQiLCJwbGFjZWhvbGRlciIsInNlbGVjdGlvbiIsInNsb3R0ZWQiLCJzcGVsbGluZy1lcnJvciJdLGNlPVsiYWxpZ24tY29udGVudCIsImFsaWduLWl0ZW1zIiwiYWxpZ24tc2VsZiIsImFsbCIsImFuaW1hdGlvbiIsImFuaW1hdGlvbi1kZWxheSIsImFuaW1hdGlvbi1kaXJlY3Rpb24iLCJhbmltYXRpb24tZHVyYXRpb24iLCJhbmltYXRpb24tZmlsbC1tb2RlIiwiYW5pbWF0aW9uLWl0ZXJhdGlvbi1jb3VudCIsImFuaW1hdGlvbi1uYW1lIiwiYW5pbWF0aW9uLXBsYXktc3RhdGUiLCJhbmltYXRpb24tdGltaW5nLWZ1bmN0aW9uIiwiYmFja2ZhY2UtdmlzaWJpbGl0eSIsImJhY2tncm91bmQiLCJiYWNrZ3JvdW5kLWF0dGFjaG1lbnQiLCJiYWNrZ3JvdW5kLWJsZW5kLW1vZGUiLCJiYWNrZ3JvdW5kLWNsaXAiLCJiYWNrZ3JvdW5kLWNvbG9yIiwiYmFja2dyb3VuZC1pbWFnZSIsImJhY2tncm91bmQtb3JpZ2luIiwiYmFja2dyb3VuZC1wb3NpdGlvbiIsImJhY2tncm91bmQtcmVwZWF0IiwiYmFja2dyb3VuZC1zaXplIiwiYmxvY2stc2l6ZSIsImJvcmRlciIsImJvcmRlci1ibG9jayIsImJvcmRlci1ibG9jay1jb2xvciIsImJvcmRlci1ibG9jay1lbmQiLCJib3JkZXItYmxvY2stZW5kLWNvbG9yIiwiYm9yZGVyLWJsb2NrLWVuZC1zdHlsZSIsImJvcmRlci1ibG9jay1lbmQtd2lkdGgiLCJib3JkZXItYmxvY2stc3RhcnQiLCJib3JkZXItYmxvY2stc3RhcnQtY29sb3IiLCJib3JkZXItYmxvY2stc3RhcnQtc3R5bGUiLCJib3JkZXItYmxvY2stc3RhcnQtd2lkdGgiLCJib3JkZXItYmxvY2stc3R5bGUiLCJib3JkZXItYmxvY2std2lkdGgiLCJib3JkZXItYm90dG9tIiwiYm9yZGVyLWJvdHRvbS1jb2xvciIsImJvcmRlci1ib3R0b20tbGVmdC1yYWRpdXMiLCJib3JkZXItYm90dG9tLXJpZ2h0LXJhZGl1cyIsImJvcmRlci1ib3R0b20tc3R5bGUiLCJib3JkZXItYm90dG9tLXdpZHRoIiwiYm9yZGVyLWNvbGxhcHNlIiwiYm9yZGVyLWNvbG9yIiwiYm9yZGVyLWltYWdlIiwiYm9yZGVyLWltYWdlLW91dHNldCIsImJvcmRlci1pbWFnZS1yZXBlYXQiLCJib3JkZXItaW1hZ2Utc2xpY2UiLCJib3JkZXItaW1hZ2Utc291cmNlIiwiYm9yZGVyLWltYWdlLXdpZHRoIiwiYm9yZGVyLWlubGluZSIsImJvcmRlci1pbmxpbmUtY29sb3IiLCJib3JkZXItaW5saW5lLWVuZCIsImJvcmRlci1pbmxpbmUtZW5kLWNvbG9yIiwiYm9yZGVyLWlubGluZS1lbmQtc3R5bGUiLCJib3JkZXItaW5saW5lLWVuZC13aWR0aCIsImJvcmRlci1pbmxpbmUtc3RhcnQiLCJib3JkZXItaW5saW5lLXN0YXJ0LWNvbG9yIiwiYm9yZGVyLWlubGluZS1zdGFydC1zdHlsZSIsImJvcmRlci1pbmxpbmUtc3RhcnQtd2lkdGgiLCJib3JkZXItaW5saW5lLXN0eWxlIiwiYm9yZGVyLWlubGluZS13aWR0aCIsImJvcmRlci1sZWZ0IiwiYm9yZGVyLWxlZnQtY29sb3IiLCJib3JkZXItbGVmdC1zdHlsZSIsImJvcmRlci1sZWZ0LXdpZHRoIiwiYm9yZGVyLXJhZGl1cyIsImJvcmRlci1yaWdodCIsImJvcmRlci1yaWdodC1jb2xvciIsImJvcmRlci1yaWdodC1zdHlsZSIsImJvcmRlci1yaWdodC13aWR0aCIsImJvcmRlci1zcGFjaW5nIiwiYm9yZGVyLXN0eWxlIiwiYm9yZGVyLXRvcCIsImJvcmRlci10b3AtY29sb3IiLCJib3JkZXItdG9wLWxlZnQtcmFkaXVzIiwiYm9yZGVyLXRvcC1yaWdodC1yYWRpdXMiLCJib3JkZXItdG9wLXN0eWxlIiwiYm9yZGVyLXRvcC13aWR0aCIsImJvcmRlci13aWR0aCIsImJvdHRvbSIsImJveC1kZWNvcmF0aW9uLWJyZWFrIiwiYm94LXNoYWRvdyIsImJveC1zaXppbmciLCJicmVhay1hZnRlciIsImJyZWFrLWJlZm9yZSIsImJyZWFrLWluc2lkZSIsImNhcHRpb24tc2lkZSIsImNhcmV0LWNvbG9yIiwiY2xlYXIiLCJjbGlwIiwiY2xpcC1wYXRoIiwiY2xpcC1ydWxlIiwiY29sb3IiLCJjb2x1bW4tY291bnQiLCJjb2x1bW4tZmlsbCIsImNvbHVtbi1nYXAiLCJjb2x1bW4tcnVsZSIsImNvbHVtbi1ydWxlLWNvbG9yIiwiY29sdW1uLXJ1bGUtc3R5bGUiLCJjb2x1bW4tcnVsZS13aWR0aCIsImNvbHVtbi1zcGFuIiwiY29sdW1uLXdpZHRoIiwiY29sdW1ucyIsImNvbnRhaW4iLCJjb250ZW50IiwiY29udGVudC12aXNpYmlsaXR5IiwiY291bnRlci1pbmNyZW1lbnQiLCJjb3VudGVyLXJlc2V0IiwiY3VlIiwiY3VlLWFmdGVyIiwiY3VlLWJlZm9yZSIsImN1cnNvciIsImRpcmVjdGlvbiIsImRpc3BsYXkiLCJlbXB0eS1jZWxscyIsImZpbHRlciIsImZsZXgiLCJmbGV4LWJhc2lzIiwiZmxleC1kaXJlY3Rpb24iLCJmbGV4LWZsb3ciLCJmbGV4LWdyb3ciLCJmbGV4LXNocmluayIsImZsZXgtd3JhcCIsImZsb2F0IiwiZmxvdyIsImZvbnQiLCJmb250LWRpc3BsYXkiLCJmb250LWZhbWlseSIsImZvbnQtZmVhdHVyZS1zZXR0aW5ncyIsImZvbnQta2VybmluZyIsImZvbnQtbGFuZ3VhZ2Utb3ZlcnJpZGUiLCJmb250LXNpemUiLCJmb250LXNpemUtYWRqdXN0IiwiZm9udC1zbW9vdGhpbmciLCJmb250LXN0cmV0Y2giLCJmb250LXN0eWxlIiwiZm9udC1zeW50aGVzaXMiLCJmb250LXZhcmlhbnQiLCJmb250LXZhcmlhbnQtY2FwcyIsImZvbnQtdmFyaWFudC1lYXN0LWFzaWFuIiwiZm9udC12YXJpYW50LWxpZ2F0dXJlcyIsImZvbnQtdmFyaWFudC1udW1lcmljIiwiZm9udC12YXJpYW50LXBvc2l0aW9uIiwiZm9udC12YXJpYXRpb24tc2V0dGluZ3MiLCJmb250LXdlaWdodCIsImdhcCIsImdseXBoLW9yaWVudGF0aW9uLXZlcnRpY2FsIiwiZ3JpZCIsImdyaWQtYXJlYSIsImdyaWQtYXV0by1jb2x1bW5zIiwiZ3JpZC1hdXRvLWZsb3ciLCJncmlkLWF1dG8tcm93cyIsImdyaWQtY29sdW1uIiwiZ3JpZC1jb2x1bW4tZW5kIiwiZ3JpZC1jb2x1bW4tc3RhcnQiLCJncmlkLWdhcCIsImdyaWQtcm93IiwiZ3JpZC1yb3ctZW5kIiwiZ3JpZC1yb3ctc3RhcnQiLCJncmlkLXRlbXBsYXRlIiwiZ3JpZC10ZW1wbGF0ZS1hcmVhcyIsImdyaWQtdGVtcGxhdGUtY29sdW1ucyIsImdyaWQtdGVtcGxhdGUtcm93cyIsImhhbmdpbmctcHVuY3R1YXRpb24iLCJoZWlnaHQiLCJoeXBoZW5zIiwiaWNvbiIsImltYWdlLW9yaWVudGF0aW9uIiwiaW1hZ2UtcmVuZGVyaW5nIiwiaW1hZ2UtcmVzb2x1dGlvbiIsImltZS1tb2RlIiwiaW5saW5lLXNpemUiLCJpc29sYXRpb24iLCJqdXN0aWZ5LWNvbnRlbnQiLCJsZWZ0IiwibGV0dGVyLXNwYWNpbmciLCJsaW5lLWJyZWFrIiwibGluZS1oZWlnaHQiLCJsaXN0LXN0eWxlIiwibGlzdC1zdHlsZS1pbWFnZSIsImxpc3Qtc3R5bGUtcG9zaXRpb24iLCJsaXN0LXN0eWxlLXR5cGUiLCJtYXJnaW4iLCJtYXJnaW4tYmxvY2siLCJtYXJnaW4tYmxvY2stZW5kIiwibWFyZ2luLWJsb2NrLXN0YXJ0IiwibWFyZ2luLWJvdHRvbSIsIm1hcmdpbi1pbmxpbmUiLCJtYXJnaW4taW5saW5lLWVuZCIsIm1hcmdpbi1pbmxpbmUtc3RhcnQiLCJtYXJnaW4tbGVmdCIsIm1hcmdpbi1yaWdodCIsIm1hcmdpbi10b3AiLCJtYXJrcyIsIm1hc2siLCJtYXNrLWJvcmRlciIsIm1hc2stYm9yZGVyLW1vZGUiLCJtYXNrLWJvcmRlci1vdXRzZXQiLCJtYXNrLWJvcmRlci1yZXBlYXQiLCJtYXNrLWJvcmRlci1zbGljZSIsIm1hc2stYm9yZGVyLXNvdXJjZSIsIm1hc2stYm9yZGVyLXdpZHRoIiwibWFzay1jbGlwIiwibWFzay1jb21wb3NpdGUiLCJtYXNrLWltYWdlIiwibWFzay1tb2RlIiwibWFzay1vcmlnaW4iLCJtYXNrLXBvc2l0aW9uIiwibWFzay1yZXBlYXQiLCJtYXNrLXNpemUiLCJtYXNrLXR5cGUiLCJtYXgtYmxvY2stc2l6ZSIsIm1heC1oZWlnaHQiLCJtYXgtaW5saW5lLXNpemUiLCJtYXgtd2lkdGgiLCJtaW4tYmxvY2stc2l6ZSIsIm1pbi1oZWlnaHQiLCJtaW4taW5saW5lLXNpemUiLCJtaW4td2lkdGgiLCJtaXgtYmxlbmQtbW9kZSIsIm5hdi1kb3duIiwibmF2LWluZGV4IiwibmF2LWxlZnQiLCJuYXYtcmlnaHQiLCJuYXYtdXAiLCJub25lIiwibm9ybWFsIiwib2JqZWN0LWZpdCIsIm9iamVjdC1wb3NpdGlvbiIsIm9wYWNpdHkiLCJvcmRlciIsIm9ycGhhbnMiLCJvdXRsaW5lIiwib3V0bGluZS1jb2xvciIsIm91dGxpbmUtb2Zmc2V0Iiwib3V0bGluZS1zdHlsZSIsIm91dGxpbmUtd2lkdGgiLCJvdmVyZmxvdyIsIm92ZXJmbG93LXdyYXAiLCJvdmVyZmxvdy14Iiwib3ZlcmZsb3cteSIsInBhZGRpbmciLCJwYWRkaW5nLWJsb2NrIiwicGFkZGluZy1ibG9jay1lbmQiLCJwYWRkaW5nLWJsb2NrLXN0YXJ0IiwicGFkZGluZy1ib3R0b20iLCJwYWRkaW5nLWlubGluZSIsInBhZGRpbmctaW5saW5lLWVuZCIsInBhZGRpbmctaW5saW5lLXN0YXJ0IiwicGFkZGluZy1sZWZ0IiwicGFkZGluZy1yaWdodCIsInBhZGRpbmctdG9wIiwicGFnZS1icmVhay1hZnRlciIsInBhZ2UtYnJlYWstYmVmb3JlIiwicGFnZS1icmVhay1pbnNpZGUiLCJwYXVzZSIsInBhdXNlLWFmdGVyIiwicGF1c2UtYmVmb3JlIiwicGVyc3BlY3RpdmUiLCJwZXJzcGVjdGl2ZS1vcmlnaW4iLCJwb2ludGVyLWV2ZW50cyIsInBvc2l0aW9uIiwicXVvdGVzIiwicmVzaXplIiwicmVzdCIsInJlc3QtYWZ0ZXIiLCJyZXN0LWJlZm9yZSIsInJpZ2h0Iiwicm93LWdhcCIsInNjcm9sbC1tYXJnaW4iLCJzY3JvbGwtbWFyZ2luLWJsb2NrIiwic2Nyb2xsLW1hcmdpbi1ibG9jay1lbmQiLCJzY3JvbGwtbWFyZ2luLWJsb2NrLXN0YXJ0Iiwic2Nyb2xsLW1hcmdpbi1ib3R0b20iLCJzY3JvbGwtbWFyZ2luLWlubGluZSIsInNjcm9sbC1tYXJnaW4taW5saW5lLWVuZCIsInNjcm9sbC1tYXJnaW4taW5saW5lLXN0YXJ0Iiwic2Nyb2xsLW1hcmdpbi1sZWZ0Iiwic2Nyb2xsLW1hcmdpbi1yaWdodCIsInNjcm9sbC1tYXJnaW4tdG9wIiwic2Nyb2xsLXBhZGRpbmciLCJzY3JvbGwtcGFkZGluZy1ibG9jayIsInNjcm9sbC1wYWRkaW5nLWJsb2NrLWVuZCIsInNjcm9sbC1wYWRkaW5nLWJsb2NrLXN0YXJ0Iiwic2Nyb2xsLXBhZGRpbmctYm90dG9tIiwic2Nyb2xsLXBhZGRpbmctaW5saW5lIiwic2Nyb2xsLXBhZGRpbmctaW5saW5lLWVuZCIsInNjcm9sbC1wYWRkaW5nLWlubGluZS1zdGFydCIsInNjcm9sbC1wYWRkaW5nLWxlZnQiLCJzY3JvbGwtcGFkZGluZy1yaWdodCIsInNjcm9sbC1wYWRkaW5nLXRvcCIsInNjcm9sbC1zbmFwLWFsaWduIiwic2Nyb2xsLXNuYXAtc3RvcCIsInNjcm9sbC1zbmFwLXR5cGUiLCJzY3JvbGxiYXItY29sb3IiLCJzY3JvbGxiYXItZ3V0dGVyIiwic2Nyb2xsYmFyLXdpZHRoIiwic2hhcGUtaW1hZ2UtdGhyZXNob2xkIiwic2hhcGUtbWFyZ2luIiwic2hhcGUtb3V0c2lkZSIsInNwZWFrIiwic3BlYWstYXMiLCJzcmMiLCJ0YWItc2l6ZSIsInRhYmxlLWxheW91dCIsInRleHQtYWxpZ24iLCJ0ZXh0LWFsaWduLWFsbCIsInRleHQtYWxpZ24tbGFzdCIsInRleHQtY29tYmluZS11cHJpZ2h0IiwidGV4dC1kZWNvcmF0aW9uIiwidGV4dC1kZWNvcmF0aW9uLWNvbG9yIiwidGV4dC1kZWNvcmF0aW9uLWxpbmUiLCJ0ZXh0LWRlY29yYXRpb24tc3R5bGUiLCJ0ZXh0LWVtcGhhc2lzIiwidGV4dC1lbXBoYXNpcy1jb2xvciIsInRleHQtZW1waGFzaXMtcG9zaXRpb24iLCJ0ZXh0LWVtcGhhc2lzLXN0eWxlIiwidGV4dC1pbmRlbnQiLCJ0ZXh0LWp1c3RpZnkiLCJ0ZXh0LW9yaWVudGF0aW9uIiwidGV4dC1vdmVyZmxvdyIsInRleHQtcmVuZGVyaW5nIiwidGV4dC1zaGFkb3ciLCJ0ZXh0LXRyYW5zZm9ybSIsInRleHQtdW5kZXJsaW5lLXBvc2l0aW9uIiwidG9wIiwidHJhbnNmb3JtIiwidHJhbnNmb3JtLWJveCIsInRyYW5zZm9ybS1vcmlnaW4iLCJ0cmFuc2Zvcm0tc3R5bGUiLCJ0cmFuc2l0aW9uIiwidHJhbnNpdGlvbi1kZWxheSIsInRyYW5zaXRpb24tZHVyYXRpb24iLCJ0cmFuc2l0aW9uLXByb3BlcnR5IiwidHJhbnNpdGlvbi10aW1pbmctZnVuY3Rpb24iLCJ1bmljb2RlLWJpZGkiLCJ2ZXJ0aWNhbC1hbGlnbiIsInZpc2liaWxpdHkiLCJ2b2ljZS1iYWxhbmNlIiwidm9pY2UtZHVyYXRpb24iLCJ2b2ljZS1mYW1pbHkiLCJ2b2ljZS1waXRjaCIsInZvaWNlLXJhbmdlIiwidm9pY2UtcmF0ZSIsInZvaWNlLXN0cmVzcyIsInZvaWNlLXZvbHVtZSIsIndoaXRlLXNwYWNlIiwid2lkb3dzIiwid2lkdGgiLCJ3aWxsLWNoYW5nZSIsIndvcmQtYnJlYWsiLCJ3b3JkLXNwYWNpbmciLCJ3b3JkLXdyYXAiLCJ3cml0aW5nLW1vZGUiLCJ6LWluZGV4Il0ucmV2ZXJzZSgpLGRlPW9lLmNvbmNhdChsZSkKO3ZhciBnZT0iWzAtOV0oXypbMC05XSkqIix1ZT1gXFwuKCR7Z2V9KWAsYmU9IlswLTlhLWZBLUZdKF8qWzAtOWEtZkEtRl0pKiIsbWU9ewpjbGFzc05hbWU6Im51bWJlciIsdmFyaWFudHM6W3sKYmVnaW46YChcXGIoJHtnZX0pKCgke3VlfSl8XFwuKT98KCR7dWV9KSlbZUVdWystXT8oJHtnZX0pW2ZGZERdP1xcYmB9LHsKYmVnaW46YFxcYigke2dlfSkoKCR7dWV9KVtmRmREXT9cXGJ8XFwuKFtmRmREXVxcYik/KWB9LHsKYmVnaW46YCgke3VlfSlbZkZkRF0/XFxiYH0se2JlZ2luOmBcXGIoJHtnZX0pW2ZGZERdXFxiYH0sewpiZWdpbjpgXFxiMFt4WF0oKCR7YmV9KVxcLj98KCR7YmV9KT9cXC4oJHtiZX0pKVtwUF1bKy1dPygke2dlfSlbZkZkRF0/XFxiYH0sewpiZWdpbjoiXFxiKDB8WzEtOV0oXypbMC05XSkqKVtsTF0/XFxiIn0se2JlZ2luOmBcXGIwW3hYXSgke2JlfSlbbExdP1xcYmB9LHsKYmVnaW46IlxcYjAoXypbMC03XSkqW2xMXT9cXGIifSx7YmVnaW46IlxcYjBbYkJdWzAxXShfKlswMV0pKltsTF0/XFxiIn1dLApyZWxldmFuY2U6MH07ZnVuY3Rpb24gcGUoZSxuLHQpe3JldHVybi0xPT09dD8iIjplLnJlcGxhY2UobiwoYT0+cGUoZSxuLHQtMSkpKX0KY29uc3QgX2U9IltBLVphLXokX11bMC05QS1aYS16JF9dKiIsaGU9WyJhcyIsImluIiwib2YiLCJpZiIsImZvciIsIndoaWxlIiwiZmluYWxseSIsInZhciIsIm5ldyIsImZ1bmN0aW9uIiwiZG8iLCJyZXR1cm4iLCJ2b2lkIiwiZWxzZSIsImJyZWFrIiwiY2F0Y2giLCJpbnN0YW5jZW9mIiwid2l0aCIsInRocm93IiwiY2FzZSIsImRlZmF1bHQiLCJ0cnkiLCJzd2l0Y2giLCJjb250aW51ZSIsInR5cGVvZiIsImRlbGV0ZSIsImxldCIsInlpZWxkIiwiY29uc3QiLCJjbGFzcyIsImRlYnVnZ2VyIiwiYXN5bmMiLCJhd2FpdCIsInN0YXRpYyIsImltcG9ydCIsImZyb20iLCJleHBvcnQiLCJleHRlbmRzIl0sZmU9WyJ0cnVlIiwiZmFsc2UiLCJudWxsIiwidW5kZWZpbmVkIiwiTmFOIiwiSW5maW5pdHkiXSxFZT1bIk9iamVjdCIsIkZ1bmN0aW9uIiwiQm9vbGVhbiIsIlN5bWJvbCIsIk1hdGgiLCJEYXRlIiwiTnVtYmVyIiwiQmlnSW50IiwiU3RyaW5nIiwiUmVnRXhwIiwiQXJyYXkiLCJGbG9hdDMyQXJyYXkiLCJGbG9hdDY0QXJyYXkiLCJJbnQ4QXJyYXkiLCJVaW50OEFycmF5IiwiVWludDhDbGFtcGVkQXJyYXkiLCJJbnQxNkFycmF5IiwiSW50MzJBcnJheSIsIlVpbnQxNkFycmF5IiwiVWludDMyQXJyYXkiLCJCaWdJbnQ2NEFycmF5IiwiQmlnVWludDY0QXJyYXkiLCJTZXQiLCJNYXAiLCJXZWFrU2V0IiwiV2Vha01hcCIsIkFycmF5QnVmZmVyIiwiU2hhcmVkQXJyYXlCdWZmZXIiLCJBdG9taWNzIiwiRGF0YVZpZXciLCJKU09OIiwiUHJvbWlzZSIsIkdlbmVyYXRvciIsIkdlbmVyYXRvckZ1bmN0aW9uIiwiQXN5bmNGdW5jdGlvbiIsIlJlZmxlY3QiLCJQcm94eSIsIkludGwiLCJXZWJBc3NlbWJseSJdLHllPVsiRXJyb3IiLCJFdmFsRXJyb3IiLCJJbnRlcm5hbEVycm9yIiwiUmFuZ2VFcnJvciIsIlJlZmVyZW5jZUVycm9yIiwiU3ludGF4RXJyb3IiLCJUeXBlRXJyb3IiLCJVUklFcnJvciJdLE5lPVsic2V0SW50ZXJ2YWwiLCJzZXRUaW1lb3V0IiwiY2xlYXJJbnRlcnZhbCIsImNsZWFyVGltZW91dCIsInJlcXVpcmUiLCJleHBvcnRzIiwiZXZhbCIsImlzRmluaXRlIiwiaXNOYU4iLCJwYXJzZUZsb2F0IiwicGFyc2VJbnQiLCJkZWNvZGVVUkkiLCJkZWNvZGVVUklDb21wb25lbnQiLCJlbmNvZGVVUkkiLCJlbmNvZGVVUklDb21wb25lbnQiLCJlc2NhcGUiLCJ1bmVzY2FwZSJdLHdlPVsiYXJndW1lbnRzIiwidGhpcyIsInN1cGVyIiwiY29uc29sZSIsIndpbmRvdyIsImRvY3VtZW50IiwibG9jYWxTdG9yYWdlIiwic2Vzc2lvblN0b3JhZ2UiLCJtb2R1bGUiLCJnbG9iYWwiXSx2ZT1bXS5jb25jYXQoTmUsRWUseWUpCjtmdW5jdGlvbiBPZShlKXtjb25zdCBuPWUucmVnZXgsdD1fZSxhPXtiZWdpbjovPFtBLVphLXowLTlcXC5fOi1dKy8sCmVuZDovXC9bQS1aYS16MC05XFwuXzotXSs+fFwvPi8saXNUcnVseU9wZW5pbmdUYWc6KGUsbik9PnsKY29uc3QgdD1lWzBdLmxlbmd0aCtlLmluZGV4LGE9ZS5pbnB1dFt0XQo7aWYoIjwiPT09YXx8IiwiPT09YSlyZXR1cm4gdm9pZCBuLmlnbm9yZU1hdGNoKCk7bGV0IGkKOyI+Ij09PWEmJigoKGUse2FmdGVyOm59KT0+e2NvbnN0IHQ9IjwvIitlWzBdLnNsaWNlKDEpCjtyZXR1cm4tMSE9PWUuaW5wdXQuaW5kZXhPZih0LG4pfSkoZSx7YWZ0ZXI6dH0pfHxuLmlnbm9yZU1hdGNoKCkpCjtjb25zdCByPWUuaW5wdXQuc3Vic3RyaW5nKHQpCjsoKGk9ci5tYXRjaCgvXlxzKj0vKSl8fChpPXIubWF0Y2goL15ccytleHRlbmRzXHMrLykpJiYwPT09aS5pbmRleCkmJm4uaWdub3JlTWF0Y2goKQp9fSxpPXskcGF0dGVybjpfZSxrZXl3b3JkOmhlLGxpdGVyYWw6ZmUsYnVpbHRfaW46dmUsInZhcmlhYmxlLmxhbmd1YWdlIjp3ZQp9LHI9IlswLTldKF8/WzAtOV0pKiIscz1gXFwuKCR7cn0pYCxvPSIwfFsxLTldKF8/WzAtOV0pKnwwWzAtN10qWzg5XVswLTldKiIsbD17CmNsYXNzTmFtZToibnVtYmVyIix2YXJpYW50czpbewpiZWdpbjpgKFxcYigke299KSgoJHtzfSl8XFwuKT98KCR7c30pKVtlRV1bKy1dPygke3J9KVxcYmB9LHsKYmVnaW46YFxcYigke299KVxcYigoJHtzfSlcXGJ8XFwuKT98KCR7c30pXFxiYH0sewpiZWdpbjoiXFxiKDB8WzEtOV0oXz9bMC05XSkqKW5cXGIifSx7CmJlZ2luOiJcXGIwW3hYXVswLTlhLWZBLUZdKF8/WzAtOWEtZkEtRl0pKm4/XFxiIn0sewpiZWdpbjoiXFxiMFtiQl1bMC0xXShfP1swLTFdKSpuP1xcYiJ9LHtiZWdpbjoiXFxiMFtvT11bMC03XShfP1swLTddKSpuP1xcYiJ9LHsKYmVnaW46IlxcYjBbMC03XStuP1xcYiJ9XSxyZWxldmFuY2U6MH0sYz17Y2xhc3NOYW1lOiJzdWJzdCIsYmVnaW46IlxcJFxceyIsCmVuZDoiXFx9IixrZXl3b3JkczppLGNvbnRhaW5zOltdfSxkPXtiZWdpbjoiaHRtbGAiLGVuZDoiIixzdGFydHM6e2VuZDoiYCIsCnJldHVybkVuZDohMSxjb250YWluczpbZS5CQUNLU0xBU0hfRVNDQVBFLGNdLHN1Ykxhbmd1YWdlOiJ4bWwifX0sZz17CmJlZ2luOiJjc3NgIixlbmQ6IiIsc3RhcnRzOntlbmQ6ImAiLHJldHVybkVuZDohMSwKY29udGFpbnM6W2UuQkFDS1NMQVNIX0VTQ0FQRSxjXSxzdWJMYW5ndWFnZToiY3NzIn19LHU9e2JlZ2luOiJncWxgIixlbmQ6IiIsCnN0YXJ0czp7ZW5kOiJgIixyZXR1cm5FbmQ6ITEsY29udGFpbnM6W2UuQkFDS1NMQVNIX0VTQ0FQRSxjXSwKc3ViTGFuZ3VhZ2U6ImdyYXBocWwifX0sYj17Y2xhc3NOYW1lOiJzdHJpbmciLGJlZ2luOiJgIixlbmQ6ImAiLApjb250YWluczpbZS5CQUNLU0xBU0hfRVNDQVBFLGNdfSxtPXtjbGFzc05hbWU6ImNvbW1lbnQiLAp2YXJpYW50czpbZS5DT01NRU5UKC9cL1wqXCooPyFcLykvLCJcXCovIix7cmVsZXZhbmNlOjAsY29udGFpbnM6W3sKYmVnaW46Iig/PUBbQS1aYS16XSspIixyZWxldmFuY2U6MCxjb250YWluczpbe2NsYXNzTmFtZToiZG9jdGFnIiwKYmVnaW46IkBbQS1aYS16XSsifSx7Y2xhc3NOYW1lOiJ0eXBlIixiZWdpbjoiXFx7IixlbmQ6IlxcfSIsZXhjbHVkZUVuZDohMCwKZXhjbHVkZUJlZ2luOiEwLHJlbGV2YW5jZTowfSx7Y2xhc3NOYW1lOiJ2YXJpYWJsZSIsYmVnaW46dCsiKD89XFxzKigtKXwkKSIsCmVuZHNQYXJlbnQ6ITAscmVsZXZhbmNlOjB9LHtiZWdpbjovKD89W15cbl0pXHMvLHJlbGV2YW5jZTowfV19XQp9KSxlLkNfQkxPQ0tfQ09NTUVOVF9NT0RFLGUuQ19MSU5FX0NPTU1FTlRfTU9ERV0KfSxwPVtlLkFQT1NfU1RSSU5HX01PREUsZS5RVU9URV9TVFJJTkdfTU9ERSxkLGcsdSxiLHttYXRjaDovXCRcZCsvfSxsXQo7Yy5jb250YWlucz1wLmNvbmNhdCh7YmVnaW46L1x7LyxlbmQ6L1x9LyxrZXl3b3JkczppLGNvbnRhaW5zOlsic2VsZiJdLmNvbmNhdChwKQp9KTtjb25zdCBfPVtdLmNvbmNhdChtLGMuY29udGFpbnMpLGg9Xy5jb25jYXQoW3tiZWdpbjovXCgvLGVuZDovXCkvLGtleXdvcmRzOmksCmNvbnRhaW5zOlsic2VsZiJdLmNvbmNhdChfKX1dKSxmPXtjbGFzc05hbWU6InBhcmFtcyIsYmVnaW46L1woLyxlbmQ6L1wpLywKZXhjbHVkZUJlZ2luOiEwLGV4Y2x1ZGVFbmQ6ITAsa2V5d29yZHM6aSxjb250YWluczpofSxFPXt2YXJpYW50czpbewptYXRjaDpbL2NsYXNzLywvXHMrLyx0LC9ccysvLC9leHRlbmRzLywvXHMrLyxuLmNvbmNhdCh0LCIoIixuLmNvbmNhdCgvXC4vLHQpLCIpKiIpXSwKc2NvcGU6ezE6ImtleXdvcmQiLDM6InRpdGxlLmNsYXNzIiw1OiJrZXl3b3JkIiw3OiJ0aXRsZS5jbGFzcy5pbmhlcml0ZWQifX0sewptYXRjaDpbL2NsYXNzLywvXHMrLyx0XSxzY29wZTp7MToia2V5d29yZCIsMzoidGl0bGUuY2xhc3MifX1dfSx5PXtyZWxldmFuY2U6MCwKbWF0Y2g6bi5laXRoZXIoL1xiSlNPTi8sL1xiW0EtWl1bYS16XSsoW0EtWl1bYS16XSp8XGQpKi8sL1xiW0EtWl17Mix9KFtBLVpdW2Etel0rfFxkKSsoW0EtWl1bYS16XSopKi8sL1xiW0EtWl17Mix9W2Etel0rKFtBLVpdW2Etel0rfFxkKSooW0EtWl1bYS16XSopKi8pLApjbGFzc05hbWU6InRpdGxlLmNsYXNzIixrZXl3b3Jkczp7XzpbLi4uRWUsLi4ueWVdfX0sTj17dmFyaWFudHM6W3sKbWF0Y2g6Wy9mdW5jdGlvbi8sL1xzKy8sdCwvKD89XHMqXCgpL119LHttYXRjaDpbL2Z1bmN0aW9uLywvXHMqKD89XCgpL119XSwKY2xhc3NOYW1lOnsxOiJrZXl3b3JkIiwzOiJ0aXRsZS5mdW5jdGlvbiJ9LGxhYmVsOiJmdW5jLmRlZiIsY29udGFpbnM6W2ZdLAppbGxlZ2FsOi8lL30sdz17Cm1hdGNoOm4uY29uY2F0KC9cYi8sKHY9Wy4uLk5lLCJzdXBlciIsImltcG9ydCJdLG4uY29uY2F0KCIoPyEiLHYuam9pbigifCIpLCIpIikpLHQsbi5sb29rYWhlYWQoL1woLykpLApjbGFzc05hbWU6InRpdGxlLmZ1bmN0aW9uIixyZWxldmFuY2U6MH07dmFyIHY7Y29uc3QgTz17CmJlZ2luOm4uY29uY2F0KC9cLi8sbi5sb29rYWhlYWQobi5jb25jYXQodCwvKD8hWzAtOUEtWmEteiRfKF0pLykpKSxlbmQ6dCwKZXhjbHVkZUJlZ2luOiEwLGtleXdvcmRzOiJwcm90b3R5cGUiLGNsYXNzTmFtZToicHJvcGVydHkiLHJlbGV2YW5jZTowfSxrPXsKbWF0Y2g6Wy9nZXR8c2V0LywvXHMrLyx0LC8oPz1cKCkvXSxjbGFzc05hbWU6ezE6ImtleXdvcmQiLDM6InRpdGxlLmZ1bmN0aW9uIn0sCmNvbnRhaW5zOlt7YmVnaW46L1woXCkvfSxmXQp9LHg9IihcXChbXigpXSooXFwoW14oKV0qKFxcKFteKCldKlxcKVteKCldKikqXFwpW14oKV0qKSpcXCl8IitlLlVOREVSU0NPUkVfSURFTlRfUkUrIilcXHMqPT4iLE09ewptYXRjaDpbL2NvbnN0fHZhcnxsZXQvLC9ccysvLHQsL1xzKi8sLz1ccyovLC8oYXN5bmNccyopPy8sbi5sb29rYWhlYWQoeCldLAprZXl3b3JkczoiYXN5bmMiLGNsYXNzTmFtZTp7MToia2V5d29yZCIsMzoidGl0bGUuZnVuY3Rpb24ifSxjb250YWluczpbZl19CjtyZXR1cm57bmFtZToiSmF2YVNjcmlwdCIsYWxpYXNlczpbImpzIiwianN4IiwibWpzIiwiY2pzIl0sa2V5d29yZHM6aSxleHBvcnRzOnsKUEFSQU1TX0NPTlRBSU5TOmgsQ0xBU1NfUkVGRVJFTkNFOnl9LGlsbGVnYWw6LyMoPyFbJF9BLXpdKS8sCmNvbnRhaW5zOltlLlNIRUJBTkcoe2xhYmVsOiJzaGViYW5nIixiaW5hcnk6Im5vZGUiLHJlbGV2YW5jZTo1fSksewpsYWJlbDoidXNlX3N0cmljdCIsY2xhc3NOYW1lOiJtZXRhIixyZWxldmFuY2U6MTAsCmJlZ2luOi9eXHMqWyciXXVzZSAoc3RyaWN0fGFzbSlbJyJdLwp9LGUuQVBPU19TVFJJTkdfTU9ERSxlLlFVT1RFX1NUUklOR19NT0RFLGQsZyx1LGIsbSx7bWF0Y2g6L1wkXGQrL30sbCx5LHsKY2xhc3NOYW1lOiJhdHRyIixiZWdpbjp0K24ubG9va2FoZWFkKCI6IikscmVsZXZhbmNlOjB9LE0sewpiZWdpbjoiKCIrZS5SRV9TVEFSVEVSU19SRSsifFxcYihjYXNlfHJldHVybnx0aHJvdylcXGIpXFxzKiIsCmtleXdvcmRzOiJyZXR1cm4gdGhyb3cgY2FzZSIscmVsZXZhbmNlOjAsY29udGFpbnM6W20sZS5SRUdFWFBfTU9ERSx7CmNsYXNzTmFtZToiZnVuY3Rpb24iLGJlZ2luOngscmV0dXJuQmVnaW46ITAsZW5kOiJcXHMqPT4iLGNvbnRhaW5zOlt7CmNsYXNzTmFtZToicGFyYW1zIix2YXJpYW50czpbe2JlZ2luOmUuVU5ERVJTQ09SRV9JREVOVF9SRSxyZWxldmFuY2U6MH0sewpjbGFzc05hbWU6bnVsbCxiZWdpbjovXChccypcKS8sc2tpcDohMH0se2JlZ2luOi9cKC8sZW5kOi9cKS8sZXhjbHVkZUJlZ2luOiEwLApleGNsdWRlRW5kOiEwLGtleXdvcmRzOmksY29udGFpbnM6aH1dfV19LHtiZWdpbjovLC8scmVsZXZhbmNlOjB9LHttYXRjaDovXHMrLywKcmVsZXZhbmNlOjB9LHt2YXJpYW50czpbe2JlZ2luOiI8PiIsZW5kOiI8Lz4ifSx7Cm1hdGNoOi88W0EtWmEtejAtOVxcLl86LV0rXHMqXC8+L30se2JlZ2luOmEuYmVnaW4sCiJvbjpiZWdpbiI6YS5pc1RydWx5T3BlbmluZ1RhZyxlbmQ6YS5lbmR9XSxzdWJMYW5ndWFnZToieG1sIixjb250YWluczpbewpiZWdpbjphLmJlZ2luLGVuZDphLmVuZCxza2lwOiEwLGNvbnRhaW5zOlsic2VsZiJdfV19XX0sTix7CmJlZ2luS2V5d29yZHM6IndoaWxlIGlmIHN3aXRjaCBjYXRjaCBmb3IifSx7CmJlZ2luOiJcXGIoPyFmdW5jdGlvbikiK2UuVU5ERVJTQ09SRV9JREVOVF9SRSsiXFwoW14oKV0qKFxcKFteKCldKihcXChbXigpXSpcXClbXigpXSopKlxcKVteKCldKikqXFwpXFxzKlxceyIsCnJldHVybkJlZ2luOiEwLGxhYmVsOiJmdW5jLmRlZiIsY29udGFpbnM6W2YsZS5pbmhlcml0KGUuVElUTEVfTU9ERSx7YmVnaW46dCwKY2xhc3NOYW1lOiJ0aXRsZS5mdW5jdGlvbiJ9KV19LHttYXRjaDovXC5cLlwuLyxyZWxldmFuY2U6MH0sTyx7bWF0Y2g6IlxcJCIrdCwKcmVsZXZhbmNlOjB9LHttYXRjaDpbL1xiY29uc3RydWN0b3IoPz1ccypcKCkvXSxjbGFzc05hbWU6ezE6InRpdGxlLmZ1bmN0aW9uIn0sCmNvbnRhaW5zOltmXX0sdyx7cmVsZXZhbmNlOjAsbWF0Y2g6L1xiW0EtWl1bQS1aXzAtOV0rXGIvLApjbGFzc05hbWU6InZhcmlhYmxlLmNvbnN0YW50In0sRSxrLHttYXRjaDovXCRbKC5dL31dfX0KY29uc3Qga2U9ZT0+YigvXGIvLGUsL1x3JC8udGVzdChlKT8vXGIvOi9cQi8pLHhlPVsiUHJvdG9jb2wiLCJUeXBlIl0ubWFwKGtlKSxNZT1bImluaXQiLCJzZWxmIl0ubWFwKGtlKSxTZT1bIkFueSIsIlNlbGYiXSxBZT1bImFjdG9yIiwiYW55IiwiYXNzb2NpYXRlZHR5cGUiLCJhc3luYyIsImF3YWl0IiwvYXNcPy8sL2FzIS8sImFzIiwiYm9ycm93aW5nIiwiYnJlYWsiLCJjYXNlIiwiY2F0Y2giLCJjbGFzcyIsImNvbnN1bWUiLCJjb25zdW1pbmciLCJjb250aW51ZSIsImNvbnZlbmllbmNlIiwiY29weSIsImRlZmF1bHQiLCJkZWZlciIsImRlaW5pdCIsImRpZFNldCIsImRpc3RyaWJ1dGVkIiwiZG8iLCJkeW5hbWljIiwiZWFjaCIsImVsc2UiLCJlbnVtIiwiZXh0ZW5zaW9uIiwiZmFsbHRocm91Z2giLC9maWxlcHJpdmF0ZVwoc2V0XCkvLCJmaWxlcHJpdmF0ZSIsImZpbmFsIiwiZm9yIiwiZnVuYyIsImdldCIsImd1YXJkIiwiaWYiLCJpbXBvcnQiLCJpbmRpcmVjdCIsImluZml4IiwvaW5pdFw/LywvaW5pdCEvLCJpbm91dCIsL2ludGVybmFsXChzZXRcKS8sImludGVybmFsIiwiaW4iLCJpcyIsImlzb2xhdGVkIiwibm9uaXNvbGF0ZWQiLCJsYXp5IiwibGV0IiwibWFjcm8iLCJtdXRhdGluZyIsIm5vbm11dGF0aW5nIiwvb3Blblwoc2V0XCkvLCJvcGVuIiwib3BlcmF0b3IiLCJvcHRpb25hbCIsIm92ZXJyaWRlIiwicG9zdGZpeCIsInByZWNlZGVuY2Vncm91cCIsInByZWZpeCIsL3ByaXZhdGVcKHNldFwpLywicHJpdmF0ZSIsInByb3RvY29sIiwvcHVibGljXChzZXRcKS8sInB1YmxpYyIsInJlcGVhdCIsInJlcXVpcmVkIiwicmV0aHJvd3MiLCJyZXR1cm4iLCJzZXQiLCJzb21lIiwic3RhdGljIiwic3RydWN0Iiwic3Vic2NyaXB0Iiwic3VwZXIiLCJzd2l0Y2giLCJ0aHJvd3MiLCJ0aHJvdyIsL3RyeVw/LywvdHJ5IS8sInRyeSIsInR5cGVhbGlhcyIsL3Vub3duZWRcKHNhZmVcKS8sL3Vub3duZWRcKHVuc2FmZVwpLywidW5vd25lZCIsInZhciIsIndlYWsiLCJ3aGVyZSIsIndoaWxlIiwid2lsbFNldCJdLENlPVsiZmFsc2UiLCJuaWwiLCJ0cnVlIl0sVGU9WyJhc3NpZ25tZW50IiwiYXNzb2NpYXRpdml0eSIsImhpZ2hlclRoYW4iLCJsZWZ0IiwibG93ZXJUaGFuIiwibm9uZSIsInJpZ2h0Il0sUmU9WyIjY29sb3JMaXRlcmFsIiwiI2NvbHVtbiIsIiNkc29oYW5kbGUiLCIjZWxzZSIsIiNlbHNlaWYiLCIjZW5kaWYiLCIjZXJyb3IiLCIjZmlsZSIsIiNmaWxlSUQiLCIjZmlsZUxpdGVyYWwiLCIjZmlsZVBhdGgiLCIjZnVuY3Rpb24iLCIjaWYiLCIjaW1hZ2VMaXRlcmFsIiwiI2tleVBhdGgiLCIjbGluZSIsIiNzZWxlY3RvciIsIiNzb3VyY2VMb2NhdGlvbiIsIiN3YXJuaW5nIl0sRGU9WyJhYnMiLCJhbGwiLCJhbnkiLCJhc3NlcnQiLCJhc3NlcnRpb25GYWlsdXJlIiwiZGVidWdQcmludCIsImR1bXAiLCJmYXRhbEVycm9yIiwiZ2V0VmFMaXN0IiwiaXNLbm93blVuaXF1ZWx5UmVmZXJlbmNlZCIsIm1heCIsIm1pbiIsIm51bWVyaWNDYXN0IiwicG9pbnR3aXNlTWF4IiwicG9pbnR3aXNlTWluIiwicHJlY29uZGl0aW9uIiwicHJlY29uZGl0aW9uRmFpbHVyZSIsInByaW50IiwicmVhZExpbmUiLCJyZXBlYXRFbGVtZW50Iiwic2VxdWVuY2UiLCJzdHJpZGUiLCJzd2FwIiwic3dpZnRfdW5ib3hGcm9tU3dpZnRWYWx1ZVdpdGhUeXBlIiwidHJhbnNjb2RlIiwidHlwZSIsInVuc2FmZUJpdENhc3QiLCJ1bnNhZmVEb3duY2FzdCIsIndpdGhFeHRlbmRlZExpZmV0aW1lIiwid2l0aFVuc2FmZU11dGFibGVQb2ludGVyIiwid2l0aFVuc2FmZVBvaW50ZXIiLCJ3aXRoVmFMaXN0Iiwid2l0aG91dEFjdHVhbGx5RXNjYXBpbmciLCJ6aXAiXSxJZT1tKC9bLz1cLSshKiU8PiZ8Xn4/XS8sL1tcdTAwQTEtXHUwMEE3XS8sL1tcdTAwQTlcdTAwQUJdLywvW1x1MDBBQ1x1MDBBRV0vLC9bXHUwMEIwXHUwMEIxXS8sL1tcdTAwQjZcdTAwQkJcdTAwQkZcdTAwRDdcdTAwRjddLywvW1x1MjAxNi1cdTIwMTddLywvW1x1MjAyMC1cdTIwMjddLywvW1x1MjAzMC1cdTIwM0VdLywvW1x1MjA0MS1cdTIwNTNdLywvW1x1MjA1NS1cdTIwNUVdLywvW1x1MjE5MC1cdTIzRkZdLywvW1x1MjUwMC1cdTI3NzVdLywvW1x1Mjc5NC1cdTJCRkZdLywvW1x1MkUwMC1cdTJFN0ZdLywvW1x1MzAwMS1cdTMwMDNdLywvW1x1MzAwOC1cdTMwMjBdLywvW1x1MzAzMF0vKSxMZT1tKEllLC9bXHUwMzAwLVx1MDM2Rl0vLC9bXHUxREMwLVx1MURGRl0vLC9bXHUyMEQwLVx1MjBGRl0vLC9bXHVGRTAwLVx1RkUwRl0vLC9bXHVGRTIwLVx1RkUyRl0vKSxCZT1iKEllLExlLCIqIiksJGU9bSgvW2EtekEtWl9dLywvW1x1MDBBOFx1MDBBQVx1MDBBRFx1MDBBRlx1MDBCMi1cdTAwQjVcdTAwQjctXHUwMEJBXS8sL1tcdTAwQkMtXHUwMEJFXHUwMEMwLVx1MDBENlx1MDBEOC1cdTAwRjZcdTAwRjgtXHUwMEZGXS8sL1tcdTAxMDAtXHUwMkZGXHUwMzcwLVx1MTY3Rlx1MTY4MS1cdTE4MERcdTE4MEYtXHUxREJGXS8sL1tcdTFFMDAtXHUxRkZGXS8sL1tcdTIwMEItXHUyMDBEXHUyMDJBLVx1MjAyRVx1MjAzRi1cdTIwNDBcdTIwNTRcdTIwNjAtXHUyMDZGXS8sL1tcdTIwNzAtXHUyMENGXHUyMTAwLVx1MjE4Rlx1MjQ2MC1cdTI0RkZcdTI3NzYtXHUyNzkzXS8sL1tcdTJDMDAtXHUyREZGXHUyRTgwLVx1MkZGRl0vLC9bXHUzMDA0LVx1MzAwN1x1MzAyMS1cdTMwMkZcdTMwMzEtXHUzMDNGXHUzMDQwLVx1RDdGRl0vLC9bXHVGOTAwLVx1RkQzRFx1RkQ0MC1cdUZEQ0ZcdUZERjAtXHVGRTFGXHVGRTMwLVx1RkU0NF0vLC9bXHVGRTQ3LVx1RkVGRVx1RkYwMC1cdUZGRkRdLyksemU9bSgkZSwvXGQvLC9bXHUwMzAwLVx1MDM2Rlx1MURDMC1cdTFERkZcdTIwRDAtXHUyMEZGXHVGRTIwLVx1RkUyRl0vKSxGZT1iKCRlLHplLCIqIiksVWU9YigvW0EtWl0vLHplLCIqIiksamU9WyJhdHRhY2hlZCIsImF1dG9jbG9zdXJlIixiKC9jb252ZW50aW9uXCgvLG0oInN3aWZ0IiwiYmxvY2siLCJjIiksL1wpLyksImRpc2NhcmRhYmxlUmVzdWx0IiwiZHluYW1pY0NhbGxhYmxlIiwiZHluYW1pY01lbWJlckxvb2t1cCIsImVzY2FwaW5nIiwiZnJlZXN0YW5kaW5nIiwiZnJvemVuIiwiR0tJbnNwZWN0YWJsZSIsIklCQWN0aW9uIiwiSUJEZXNpZ25hYmxlIiwiSUJJbnNwZWN0YWJsZSIsIklCT3V0bGV0IiwiSUJTZWd1ZUFjdGlvbiIsImlubGluYWJsZSIsIm1haW4iLCJub25vYmpjIiwiTlNBcHBsaWNhdGlvbk1haW4iLCJOU0NvcHlpbmciLCJOU01hbmFnZWQiLGIoL29iamNcKC8sRmUsL1wpLyksIm9iamMiLCJvYmpjTWVtYmVycyIsInByb3BlcnR5V3JhcHBlciIsInJlcXVpcmVzX3N0b3JlZF9wcm9wZXJ0eV9pbml0cyIsInJlc3VsdEJ1aWxkZXIiLCJTZW5kYWJsZSIsInRlc3RhYmxlIiwiVUlBcHBsaWNhdGlvbk1haW4iLCJ1bmNoZWNrZWQiLCJ1bmtub3duIiwidXNhYmxlRnJvbUlubGluZSIsIndhcm5fdW5xdWFsaWZpZWRfYWNjZXNzIl0sUGU9WyJpT1MiLCJpT1NBcHBsaWNhdGlvbkV4dGVuc2lvbiIsIm1hY09TIiwibWFjT1NBcHBsaWNhdGlvbkV4dGVuc2lvbiIsIm1hY0NhdGFseXN0IiwibWFjQ2F0YWx5c3RBcHBsaWNhdGlvbkV4dGVuc2lvbiIsIndhdGNoT1MiLCJ3YXRjaE9TQXBwbGljYXRpb25FeHRlbnNpb24iLCJ0dk9TIiwidHZPU0FwcGxpY2F0aW9uRXh0ZW5zaW9uIiwic3dpZnQiXQo7dmFyIEtlPU9iamVjdC5mcmVlemUoe19fcHJvdG9fXzpudWxsLGdybXJfYmFzaDplPT57Y29uc3Qgbj1lLnJlZ2V4LHQ9e30sYT17CmJlZ2luOi9cJFx7LyxlbmQ6L1x9Lyxjb250YWluczpbInNlbGYiLHtiZWdpbjovOi0vLGNvbnRhaW5zOlt0XX1dfQo7T2JqZWN0LmFzc2lnbih0LHtjbGFzc05hbWU6InZhcmlhYmxlIix2YXJpYW50czpbewpiZWdpbjpuLmNvbmNhdCgvXCRbXHdcZCNAXVtcd1xkX10qLywiKD8hW1xcd1xcZF0pKD8hWyRdKSIpfSxhXX0pO2NvbnN0IGk9ewpjbGFzc05hbWU6InN1YnN0IixiZWdpbjovXCRcKC8sZW5kOi9cKS8sY29udGFpbnM6W2UuQkFDS1NMQVNIX0VTQ0FQRV19LHI9ewpiZWdpbjovPDwtP1xzKig/PVx3KykvLHN0YXJ0czp7Y29udGFpbnM6W2UuRU5EX1NBTUVfQVNfQkVHSU4oe2JlZ2luOi8oXHcrKS8sCmVuZDovKFx3KykvLGNsYXNzTmFtZToic3RyaW5nIn0pXX19LHM9e2NsYXNzTmFtZToic3RyaW5nIixiZWdpbjovIi8sZW5kOi8iLywKY29udGFpbnM6W2UuQkFDS1NMQVNIX0VTQ0FQRSx0LGldfTtpLmNvbnRhaW5zLnB1c2gocyk7Y29uc3Qgbz17YmVnaW46L1wkP1woXCgvLAplbmQ6L1wpXCkvLGNvbnRhaW5zOlt7YmVnaW46L1xkKyNbMC05YS1mXSsvLGNsYXNzTmFtZToibnVtYmVyIn0sZS5OVU1CRVJfTU9ERSx0XQp9LGw9ZS5TSEVCQU5HKHtiaW5hcnk6IihmaXNofGJhc2h8enNofHNofGNzaHxrc2h8dGNzaHxkYXNofHNjc2gpIixyZWxldmFuY2U6MTAKfSksYz17Y2xhc3NOYW1lOiJmdW5jdGlvbiIsYmVnaW46L1x3W1x3XGRfXSpccypcKFxzKlwpXHMqXHsvLHJldHVybkJlZ2luOiEwLApjb250YWluczpbZS5pbmhlcml0KGUuVElUTEVfTU9ERSx7YmVnaW46L1x3W1x3XGRfXSovfSldLHJlbGV2YW5jZTowfTtyZXR1cm57Cm5hbWU6IkJhc2giLGFsaWFzZXM6WyJzaCJdLGtleXdvcmRzOnskcGF0dGVybjovXGJbYS16XVthLXowLTkuXy1dK1xiLywKa2V5d29yZDpbImlmIiwidGhlbiIsImVsc2UiLCJlbGlmIiwiZmkiLCJmb3IiLCJ3aGlsZSIsInVudGlsIiwiaW4iLCJkbyIsImRvbmUiLCJjYXNlIiwiZXNhYyIsImZ1bmN0aW9uIiwic2VsZWN0Il0sCmxpdGVyYWw6WyJ0cnVlIiwiZmFsc2UiXSwKYnVpbHRfaW46WyJicmVhayIsImNkIiwiY29udGludWUiLCJldmFsIiwiZXhlYyIsImV4aXQiLCJleHBvcnQiLCJnZXRvcHRzIiwiaGFzaCIsInB3ZCIsInJlYWRvbmx5IiwicmV0dXJuIiwic2hpZnQiLCJ0ZXN0IiwidGltZXMiLCJ0cmFwIiwidW1hc2siLCJ1bnNldCIsImFsaWFzIiwiYmluZCIsImJ1aWx0aW4iLCJjYWxsZXIiLCJjb21tYW5kIiwiZGVjbGFyZSIsImVjaG8iLCJlbmFibGUiLCJoZWxwIiwibGV0IiwibG9jYWwiLCJsb2dvdXQiLCJtYXBmaWxlIiwicHJpbnRmIiwicmVhZCIsInJlYWRhcnJheSIsInNvdXJjZSIsInR5cGUiLCJ0eXBlc2V0IiwidWxpbWl0IiwidW5hbGlhcyIsInNldCIsInNob3B0IiwiYXV0b2xvYWQiLCJiZyIsImJpbmRrZXkiLCJieWUiLCJjYXAiLCJjaGRpciIsImNsb25lIiwiY29tcGFyZ3VtZW50cyIsImNvbXBjYWxsIiwiY29tcGN0bCIsImNvbXBkZXNjcmliZSIsImNvbXBmaWxlcyIsImNvbXBncm91cHMiLCJjb21wcXVvdGUiLCJjb21wdGFncyIsImNvbXB0cnkiLCJjb21wdmFsdWVzIiwiZGlycyIsImRpc2FibGUiLCJkaXNvd24iLCJlY2hvdGMiLCJlY2hvdGkiLCJlbXVsYXRlIiwiZmMiLCJmZyIsImZsb2F0IiwiZnVuY3Rpb25zIiwiZ2V0Y2FwIiwiZ2V0bG4iLCJoaXN0b3J5IiwiaW50ZWdlciIsImpvYnMiLCJraWxsIiwibGltaXQiLCJsb2ciLCJub2dsb2IiLCJwb3BkIiwicHJpbnQiLCJwdXNoZCIsInB1c2hsbiIsInJlaGFzaCIsInNjaGVkIiwic2V0Y2FwIiwic2V0b3B0Iiwic3RhdCIsInN1c3BlbmQiLCJ0dHljdGwiLCJ1bmZ1bmN0aW9uIiwidW5oYXNoIiwidW5saW1pdCIsInVuc2V0b3B0IiwidmFyZWQiLCJ3YWl0Iiwid2hlbmNlIiwid2hlcmUiLCJ3aGljaCIsInpjb21waWxlIiwiemZvcm1hdCIsInpmdHAiLCJ6bGUiLCJ6bW9kbG9hZCIsInpwYXJzZW9wdHMiLCJ6cHJvZiIsInpwdHkiLCJ6cmVnZXhwYXJzZSIsInpzb2NrZXQiLCJ6c3R5bGUiLCJ6dGNwIiwiY2hjb24iLCJjaGdycCIsImNob3duIiwiY2htb2QiLCJjcCIsImRkIiwiZGYiLCJkaXIiLCJkaXJjb2xvcnMiLCJsbiIsImxzIiwibWtkaXIiLCJta2ZpZm8iLCJta25vZCIsIm1rdGVtcCIsIm12IiwicmVhbHBhdGgiLCJybSIsInJtZGlyIiwic2hyZWQiLCJzeW5jIiwidG91Y2giLCJ0cnVuY2F0ZSIsInZkaXIiLCJiMnN1bSIsImJhc2UzMiIsImJhc2U2NCIsImNhdCIsImNrc3VtIiwiY29tbSIsImNzcGxpdCIsImN1dCIsImV4cGFuZCIsImZtdCIsImZvbGQiLCJoZWFkIiwiam9pbiIsIm1kNXN1bSIsIm5sIiwibnVtZm10Iiwib2QiLCJwYXN0ZSIsInB0eCIsInByIiwic2hhMXN1bSIsInNoYTIyNHN1bSIsInNoYTI1NnN1bSIsInNoYTM4NHN1bSIsInNoYTUxMnN1bSIsInNodWYiLCJzb3J0Iiwic3BsaXQiLCJzdW0iLCJ0YWMiLCJ0YWlsIiwidHIiLCJ0c29ydCIsInVuZXhwYW5kIiwidW5pcSIsIndjIiwiYXJjaCIsImJhc2VuYW1lIiwiY2hyb290IiwiZGF0ZSIsImRpcm5hbWUiLCJkdSIsImVjaG8iLCJlbnYiLCJleHByIiwiZmFjdG9yIiwiZ3JvdXBzIiwiaG9zdGlkIiwiaWQiLCJsaW5rIiwibG9nbmFtZSIsIm5pY2UiLCJub2h1cCIsIm5wcm9jIiwicGF0aGNoayIsInBpbmt5IiwicHJpbnRlbnYiLCJwcmludGYiLCJwd2QiLCJyZWFkbGluayIsInJ1bmNvbiIsInNlcSIsInNsZWVwIiwic3RhdCIsInN0ZGJ1ZiIsInN0dHkiLCJ0ZWUiLCJ0ZXN0IiwidGltZW91dCIsInR0eSIsInVuYW1lIiwidW5saW5rIiwidXB0aW1lIiwidXNlcnMiLCJ3aG8iLCJ3aG9hbWkiLCJ5ZXMiXQp9LGNvbnRhaW5zOltsLGUuU0hFQkFORygpLGMsbyxlLkhBU0hfQ09NTUVOVF9NT0RFLHIse21hdGNoOi8oXC9bYS16Ll8tXSspKy99LHMsewptYXRjaDovXFwiL30se2NsYXNzTmFtZToic3RyaW5nIixiZWdpbjovJy8sZW5kOi8nL30se21hdGNoOi9cXCcvfSx0XX19LApncm1yX2M6ZT0+e2NvbnN0IG49ZS5yZWdleCx0PWUuQ09NTUVOVCgiLy8iLCIkIix7Y29udGFpbnM6W3tiZWdpbjovXFxcbi99XQp9KSxhPSJkZWNsdHlwZVxcKGF1dG9cXCkiLGk9IlthLXpBLVpfXVxcdyo6OiIscj0iKCIrYSsifCIrbi5vcHRpb25hbChpKSsiW2EtekEtWl9dXFx3KiIrbi5vcHRpb25hbCgiPFtePD5dKz4iKSsiKSIscz17CmNsYXNzTmFtZToidHlwZSIsdmFyaWFudHM6W3tiZWdpbjoiXFxiW2EtelxcZF9dKl90XFxiIn0sewptYXRjaDovXGJhdG9taWNfW2Etel17Myw2fVxiL31dfSxvPXtjbGFzc05hbWU6InN0cmluZyIsdmFyaWFudHM6W3sKYmVnaW46Jyh1OD98VXxMKT8iJyxlbmQ6JyInLGlsbGVnYWw6IlxcbiIsY29udGFpbnM6W2UuQkFDS1NMQVNIX0VTQ0FQRV19LHsKYmVnaW46Iih1OD98VXxMKT8nKFxcXFwoeFswLTlBLUZhLWZdezJ9fHVbMC05QS1GYS1mXXs0LDh9fFswLTddezN9fFxcUyl8LikiLAplbmQ6IiciLGlsbGVnYWw6Ii4ifSxlLkVORF9TQU1FX0FTX0JFR0lOKHsKYmVnaW46Lyg/OnU4P3xVfEwpP1IiKFteKClcXCBdezAsMTZ9KVwoLyxlbmQ6L1wpKFteKClcXCBdezAsMTZ9KSIvfSldfSxsPXsKY2xhc3NOYW1lOiJudW1iZXIiLHZhcmlhbnRzOlt7YmVnaW46IlxcYigwYlswMSddKykifSx7CmJlZ2luOiIoLT8pXFxiKFtcXGQnXSsoXFwuW1xcZCddKik/fFxcLltcXGQnXSspKChsbHxMTHxsfEwpKHV8VSk/fCh1fFUpKGxsfExMfGx8TCk/fGZ8RnxifEIpIgp9LHsKYmVnaW46IigtPykoXFxiMFt4WF1bYS1mQS1GMC05J10rfChcXGJbXFxkJ10rKFxcLltcXGQnXSopP3xcXC5bXFxkJ10rKShbZUVdWy0rXT9bXFxkJ10rKT8pIgp9XSxyZWxldmFuY2U6MH0sYz17Y2xhc3NOYW1lOiJtZXRhIixiZWdpbjovI1xzKlthLXpdK1xiLyxlbmQ6LyQvLGtleXdvcmRzOnsKa2V5d29yZDoiaWYgZWxzZSBlbGlmIGVuZGlmIGRlZmluZSB1bmRlZiB3YXJuaW5nIGVycm9yIGxpbmUgcHJhZ21hIF9QcmFnbWEgaWZkZWYgaWZuZGVmIGluY2x1ZGUiCn0sY29udGFpbnM6W3tiZWdpbjovXFxcbi8scmVsZXZhbmNlOjB9LGUuaW5oZXJpdChvLHtjbGFzc05hbWU6InN0cmluZyJ9KSx7CmNsYXNzTmFtZToic3RyaW5nIixiZWdpbjovPC4qPz4vfSx0LGUuQ19CTE9DS19DT01NRU5UX01PREVdfSxkPXsKY2xhc3NOYW1lOiJ0aXRsZSIsYmVnaW46bi5vcHRpb25hbChpKStlLklERU5UX1JFLHJlbGV2YW5jZTowCn0sZz1uLm9wdGlvbmFsKGkpK2UuSURFTlRfUkUrIlxccypcXCgiLHU9ewprZXl3b3JkOlsiYXNtIiwiYXV0byIsImJyZWFrIiwiY2FzZSIsImNvbnRpbnVlIiwiZGVmYXVsdCIsImRvIiwiZWxzZSIsImVudW0iLCJleHRlcm4iLCJmb3IiLCJmb3J0cmFuIiwiZ290byIsImlmIiwiaW5saW5lIiwicmVnaXN0ZXIiLCJyZXN0cmljdCIsInJldHVybiIsInNpemVvZiIsInN0cnVjdCIsInN3aXRjaCIsInR5cGVkZWYiLCJ1bmlvbiIsInZvbGF0aWxlIiwid2hpbGUiLCJfQWxpZ25hcyIsIl9BbGlnbm9mIiwiX0F0b21pYyIsIl9HZW5lcmljIiwiX05vcmV0dXJuIiwiX1N0YXRpY19hc3NlcnQiLCJfVGhyZWFkX2xvY2FsIiwiYWxpZ25hcyIsImFsaWdub2YiLCJub3JldHVybiIsInN0YXRpY19hc3NlcnQiLCJ0aHJlYWRfbG9jYWwiLCJfUHJhZ21hIl0sCnR5cGU6WyJmbG9hdCIsImRvdWJsZSIsInNpZ25lZCIsInVuc2lnbmVkIiwiaW50Iiwic2hvcnQiLCJsb25nIiwiY2hhciIsInZvaWQiLCJfQm9vbCIsIl9Db21wbGV4IiwiX0ltYWdpbmFyeSIsIl9EZWNpbWFsMzIiLCJfRGVjaW1hbDY0IiwiX0RlY2ltYWwxMjgiLCJjb25zdCIsInN0YXRpYyIsImNvbXBsZXgiLCJib29sIiwiaW1hZ2luYXJ5Il0sCmxpdGVyYWw6InRydWUgZmFsc2UgTlVMTCIsCmJ1aWx0X2luOiJzdGQgc3RyaW5nIHdzdHJpbmcgY2luIGNvdXQgY2VyciBjbG9nIHN0ZGluIHN0ZG91dCBzdGRlcnIgc3RyaW5nc3RyZWFtIGlzdHJpbmdzdHJlYW0gb3N0cmluZ3N0cmVhbSBhdXRvX3B0ciBkZXF1ZSBsaXN0IHF1ZXVlIHN0YWNrIHZlY3RvciBtYXAgc2V0IHBhaXIgYml0c2V0IG11bHRpc2V0IG11bHRpbWFwIHVub3JkZXJlZF9zZXQgdW5vcmRlcmVkX21hcCB1bm9yZGVyZWRfbXVsdGlzZXQgdW5vcmRlcmVkX211bHRpbWFwIHByaW9yaXR5X3F1ZXVlIG1ha2VfcGFpciBhcnJheSBzaGFyZWRfcHRyIGFib3J0IHRlcm1pbmF0ZSBhYnMgYWNvcyBhc2luIGF0YW4yIGF0YW4gY2FsbG9jIGNlaWwgY29zaCBjb3MgZXhpdCBleHAgZmFicyBmbG9vciBmbW9kIGZwcmludGYgZnB1dHMgZnJlZSBmcmV4cCBmc2NhbmYgZnV0dXJlIGlzYWxudW0gaXNhbHBoYSBpc2NudHJsIGlzZGlnaXQgaXNncmFwaCBpc2xvd2VyIGlzcHJpbnQgaXNwdW5jdCBpc3NwYWNlIGlzdXBwZXIgaXN4ZGlnaXQgdG9sb3dlciB0b3VwcGVyIGxhYnMgbGRleHAgbG9nMTAgbG9nIG1hbGxvYyByZWFsbG9jIG1lbWNociBtZW1jbXAgbWVtY3B5IG1lbXNldCBtb2RmIHBvdyBwcmludGYgcHV0Y2hhciBwdXRzIHNjYW5mIHNpbmggc2luIHNucHJpbnRmIHNwcmludGYgc3FydCBzc2NhbmYgc3RyY2F0IHN0cmNociBzdHJjbXAgc3RyY3B5IHN0cmNzcG4gc3RybGVuIHN0cm5jYXQgc3RybmNtcCBzdHJuY3B5IHN0cnBicmsgc3RycmNociBzdHJzcG4gc3Ryc3RyIHRhbmggdGFuIHZmcHJpbnRmIHZwcmludGYgdnNwcmludGYgZW5kbCBpbml0aWFsaXplcl9saXN0IHVuaXF1ZV9wdHIiCn0sYj1bYyxzLHQsZS5DX0JMT0NLX0NPTU1FTlRfTU9ERSxsLG9dLG09e3ZhcmlhbnRzOlt7YmVnaW46Lz0vLGVuZDovOy99LHsKYmVnaW46L1woLyxlbmQ6L1wpL30se2JlZ2luS2V5d29yZHM6Im5ldyB0aHJvdyByZXR1cm4gZWxzZSIsZW5kOi87L31dLAprZXl3b3Jkczp1LGNvbnRhaW5zOmIuY29uY2F0KFt7YmVnaW46L1woLyxlbmQ6L1wpLyxrZXl3b3Jkczp1LApjb250YWluczpiLmNvbmNhdChbInNlbGYiXSkscmVsZXZhbmNlOjB9XSkscmVsZXZhbmNlOjB9LHA9ewpiZWdpbjoiKCIrcisiW1xcKiZcXHNdKykrIitnLHJldHVybkJlZ2luOiEwLGVuZDovW3s7PV0vLGV4Y2x1ZGVFbmQ6ITAsCmtleXdvcmRzOnUsaWxsZWdhbDovW15cd1xzXComOjw+Ll0vLGNvbnRhaW5zOlt7YmVnaW46YSxrZXl3b3Jkczp1LHJlbGV2YW5jZTowfSx7CmJlZ2luOmcscmV0dXJuQmVnaW46ITAsY29udGFpbnM6W2UuaW5oZXJpdChkLHtjbGFzc05hbWU6InRpdGxlLmZ1bmN0aW9uIn0pXSwKcmVsZXZhbmNlOjB9LHtyZWxldmFuY2U6MCxtYXRjaDovLC99LHtjbGFzc05hbWU6InBhcmFtcyIsYmVnaW46L1woLyxlbmQ6L1wpLywKa2V5d29yZHM6dSxyZWxldmFuY2U6MCxjb250YWluczpbdCxlLkNfQkxPQ0tfQ09NTUVOVF9NT0RFLG8sbCxzLHtiZWdpbjovXCgvLAplbmQ6L1wpLyxrZXl3b3Jkczp1LHJlbGV2YW5jZTowLGNvbnRhaW5zOlsic2VsZiIsdCxlLkNfQkxPQ0tfQ09NTUVOVF9NT0RFLG8sbCxzXQp9XX0scyx0LGUuQ19CTE9DS19DT01NRU5UX01PREUsY119O3JldHVybntuYW1lOiJDIixhbGlhc2VzOlsiaCJdLGtleXdvcmRzOnUsCmRpc2FibGVBdXRvZGV0ZWN0OiEwLGlsbGVnYWw6IjwvIixjb250YWluczpbXS5jb25jYXQobSxwLGIsW2MsewpiZWdpbjplLklERU5UX1JFKyI6OiIsa2V5d29yZHM6dX0se2NsYXNzTmFtZToiY2xhc3MiLApiZWdpbktleXdvcmRzOiJlbnVtIGNsYXNzIHN0cnVjdCB1bmlvbiIsZW5kOi9bezs6PD49XS8sY29udGFpbnM6W3sKYmVnaW5LZXl3b3JkczoiZmluYWwgY2xhc3Mgc3RydWN0In0sZS5USVRMRV9NT0RFXX1dKSxleHBvcnRzOntwcmVwcm9jZXNzb3I6YywKc3RyaW5nczpvLGtleXdvcmRzOnV9fX0sZ3Jtcl9jcHA6ZT0+e2NvbnN0IG49ZS5yZWdleCx0PWUuQ09NTUVOVCgiLy8iLCIkIix7CmNvbnRhaW5zOlt7YmVnaW46L1xcXG4vfV0KfSksYT0iZGVjbHR5cGVcXChhdXRvXFwpIixpPSJbYS16QS1aX11cXHcqOjoiLHI9Iig/IXN0cnVjdCkoIithKyJ8IituLm9wdGlvbmFsKGkpKyJbYS16QS1aX11cXHcqIituLm9wdGlvbmFsKCI8W148Pl0rPiIpKyIpIixzPXsKY2xhc3NOYW1lOiJ0eXBlIixiZWdpbjoiXFxiW2EtelxcZF9dKl90XFxiIn0sbz17Y2xhc3NOYW1lOiJzdHJpbmciLHZhcmlhbnRzOlt7CmJlZ2luOicodTg/fFV8TCk/IicsZW5kOiciJyxpbGxlZ2FsOiJcXG4iLGNvbnRhaW5zOltlLkJBQ0tTTEFTSF9FU0NBUEVdfSx7CmJlZ2luOiIodTg/fFV8TCk/JyhcXFxcKHhbMC05QS1GYS1mXXsyfXx1WzAtOUEtRmEtZl17NCw4fXxbMC03XXszfXxcXFMpfC4pIiwKZW5kOiInIixpbGxlZ2FsOiIuIn0sZS5FTkRfU0FNRV9BU19CRUdJTih7CmJlZ2luOi8oPzp1OD98VXxMKT9SIihbXigpXFwgXXswLDE2fSlcKC8sZW5kOi9cKShbXigpXFwgXXswLDE2fSkiL30pXX0sbD17CmNsYXNzTmFtZToibnVtYmVyIix2YXJpYW50czpbe2JlZ2luOiJcXGIoMGJbMDEnXSspIn0sewpiZWdpbjoiKC0/KVxcYihbXFxkJ10rKFxcLltcXGQnXSopP3xcXC5bXFxkJ10rKSgobGx8TEx8bHxMKSh1fFUpP3wodXxVKShsbHxMTHxsfEwpP3xmfEZ8YnxCKSIKfSx7CmJlZ2luOiIoLT8pKFxcYjBbeFhdW2EtZkEtRjAtOSddK3woXFxiW1xcZCddKyhcXC5bXFxkJ10qKT98XFwuW1xcZCddKykoW2VFXVstK10/W1xcZCddKyk/KSIKfV0scmVsZXZhbmNlOjB9LGM9e2NsYXNzTmFtZToibWV0YSIsYmVnaW46LyNccypbYS16XStcYi8sZW5kOi8kLyxrZXl3b3Jkczp7CmtleXdvcmQ6ImlmIGVsc2UgZWxpZiBlbmRpZiBkZWZpbmUgdW5kZWYgd2FybmluZyBlcnJvciBsaW5lIHByYWdtYSBfUHJhZ21hIGlmZGVmIGlmbmRlZiBpbmNsdWRlIgp9LGNvbnRhaW5zOlt7YmVnaW46L1xcXG4vLHJlbGV2YW5jZTowfSxlLmluaGVyaXQobyx7Y2xhc3NOYW1lOiJzdHJpbmcifSksewpjbGFzc05hbWU6InN0cmluZyIsYmVnaW46LzwuKj8+L30sdCxlLkNfQkxPQ0tfQ09NTUVOVF9NT0RFXX0sZD17CmNsYXNzTmFtZToidGl0bGUiLGJlZ2luOm4ub3B0aW9uYWwoaSkrZS5JREVOVF9SRSxyZWxldmFuY2U6MAp9LGc9bi5vcHRpb25hbChpKStlLklERU5UX1JFKyJcXHMqXFwoIix1PXsKdHlwZTpbImJvb2wiLCJjaGFyIiwiY2hhcjE2X3QiLCJjaGFyMzJfdCIsImNoYXI4X3QiLCJkb3VibGUiLCJmbG9hdCIsImludCIsImxvbmciLCJzaG9ydCIsInZvaWQiLCJ3Y2hhcl90IiwidW5zaWduZWQiLCJzaWduZWQiLCJjb25zdCIsInN0YXRpYyJdLAprZXl3b3JkOlsiYWxpZ25hcyIsImFsaWdub2YiLCJhbmQiLCJhbmRfZXEiLCJhc20iLCJhdG9taWNfY2FuY2VsIiwiYXRvbWljX2NvbW1pdCIsImF0b21pY19ub2V4Y2VwdCIsImF1dG8iLCJiaXRhbmQiLCJiaXRvciIsImJyZWFrIiwiY2FzZSIsImNhdGNoIiwiY2xhc3MiLCJjb19hd2FpdCIsImNvX3JldHVybiIsImNvX3lpZWxkIiwiY29tcGwiLCJjb25jZXB0IiwiY29uc3RfY2FzdHwxMCIsImNvbnN0ZXZhbCIsImNvbnN0ZXhwciIsImNvbnN0aW5pdCIsImNvbnRpbnVlIiwiZGVjbHR5cGUiLCJkZWZhdWx0IiwiZGVsZXRlIiwiZG8iLCJkeW5hbWljX2Nhc3R8MTAiLCJlbHNlIiwiZW51bSIsImV4cGxpY2l0IiwiZXhwb3J0IiwiZXh0ZXJuIiwiZmFsc2UiLCJmaW5hbCIsImZvciIsImZyaWVuZCIsImdvdG8iLCJpZiIsImltcG9ydCIsImlubGluZSIsIm1vZHVsZSIsIm11dGFibGUiLCJuYW1lc3BhY2UiLCJuZXciLCJub2V4Y2VwdCIsIm5vdCIsIm5vdF9lcSIsIm51bGxwdHIiLCJvcGVyYXRvciIsIm9yIiwib3JfZXEiLCJvdmVycmlkZSIsInByaXZhdGUiLCJwcm90ZWN0ZWQiLCJwdWJsaWMiLCJyZWZsZXhwciIsInJlZ2lzdGVyIiwicmVpbnRlcnByZXRfY2FzdHwxMCIsInJlcXVpcmVzIiwicmV0dXJuIiwic2l6ZW9mIiwic3RhdGljX2Fzc2VydCIsInN0YXRpY19jYXN0fDEwIiwic3RydWN0Iiwic3dpdGNoIiwic3luY2hyb25pemVkIiwidGVtcGxhdGUiLCJ0aGlzIiwidGhyZWFkX2xvY2FsIiwidGhyb3ciLCJ0cmFuc2FjdGlvbl9zYWZlIiwidHJhbnNhY3Rpb25fc2FmZV9keW5hbWljIiwidHJ1ZSIsInRyeSIsInR5cGVkZWYiLCJ0eXBlaWQiLCJ0eXBlbmFtZSIsInVuaW9uIiwidXNpbmciLCJ2aXJ0dWFsIiwidm9sYXRpbGUiLCJ3aGlsZSIsInhvciIsInhvcl9lcSJdLApsaXRlcmFsOlsiTlVMTCIsImZhbHNlIiwibnVsbG9wdCIsIm51bGxwdHIiLCJ0cnVlIl0sYnVpbHRfaW46WyJfUHJhZ21hIl0sCl90eXBlX2hpbnRzOlsiYW55IiwiYXV0b19wdHIiLCJiYXJyaWVyIiwiYmluYXJ5X3NlbWFwaG9yZSIsImJpdHNldCIsImNvbXBsZXgiLCJjb25kaXRpb25fdmFyaWFibGUiLCJjb25kaXRpb25fdmFyaWFibGVfYW55IiwiY291bnRpbmdfc2VtYXBob3JlIiwiZGVxdWUiLCJmYWxzZV90eXBlIiwiZnV0dXJlIiwiaW1hZ2luYXJ5IiwiaW5pdGlhbGl6ZXJfbGlzdCIsImlzdHJpbmdzdHJlYW0iLCJqdGhyZWFkIiwibGF0Y2giLCJsb2NrX2d1YXJkIiwibXVsdGltYXAiLCJtdWx0aXNldCIsIm11dGV4Iiwib3B0aW9uYWwiLCJvc3RyaW5nc3RyZWFtIiwicGFja2FnZWRfdGFzayIsInBhaXIiLCJwcm9taXNlIiwicHJpb3JpdHlfcXVldWUiLCJxdWV1ZSIsInJlY3Vyc2l2ZV9tdXRleCIsInJlY3Vyc2l2ZV90aW1lZF9tdXRleCIsInNjb3BlZF9sb2NrIiwic2V0Iiwic2hhcmVkX2Z1dHVyZSIsInNoYXJlZF9sb2NrIiwic2hhcmVkX211dGV4Iiwic2hhcmVkX3RpbWVkX211dGV4Iiwic2hhcmVkX3B0ciIsInN0YWNrIiwic3RyaW5nX3ZpZXciLCJzdHJpbmdzdHJlYW0iLCJ0aW1lZF9tdXRleCIsInRocmVhZCIsInRydWVfdHlwZSIsInR1cGxlIiwidW5pcXVlX2xvY2siLCJ1bmlxdWVfcHRyIiwidW5vcmRlcmVkX21hcCIsInVub3JkZXJlZF9tdWx0aW1hcCIsInVub3JkZXJlZF9tdWx0aXNldCIsInVub3JkZXJlZF9zZXQiLCJ2YXJpYW50IiwidmVjdG9yIiwid2Vha19wdHIiLCJ3c3RyaW5nIiwid3N0cmluZ192aWV3Il0KfSxiPXtjbGFzc05hbWU6ImZ1bmN0aW9uLmRpc3BhdGNoIixyZWxldmFuY2U6MCxrZXl3b3Jkczp7Cl9oaW50OlsiYWJvcnQiLCJhYnMiLCJhY29zIiwiYXBwbHkiLCJhc19jb25zdCIsImFzaW4iLCJhdGFuIiwiYXRhbjIiLCJjYWxsb2MiLCJjZWlsIiwiY2VyciIsImNpbiIsImNsb2ciLCJjb3MiLCJjb3NoIiwiY291dCIsImRlY2x2YWwiLCJlbmRsIiwiZXhjaGFuZ2UiLCJleGl0IiwiZXhwIiwiZmFicyIsImZsb29yIiwiZm1vZCIsImZvcndhcmQiLCJmcHJpbnRmIiwiZnB1dHMiLCJmcmVlIiwiZnJleHAiLCJmc2NhbmYiLCJmdXR1cmUiLCJpbnZva2UiLCJpc2FsbnVtIiwiaXNhbHBoYSIsImlzY250cmwiLCJpc2RpZ2l0IiwiaXNncmFwaCIsImlzbG93ZXIiLCJpc3ByaW50IiwiaXNwdW5jdCIsImlzc3BhY2UiLCJpc3VwcGVyIiwiaXN4ZGlnaXQiLCJsYWJzIiwibGF1bmRlciIsImxkZXhwIiwibG9nIiwibG9nMTAiLCJtYWtlX3BhaXIiLCJtYWtlX3NoYXJlZCIsIm1ha2Vfc2hhcmVkX2Zvcl9vdmVyd3JpdGUiLCJtYWtlX3R1cGxlIiwibWFrZV91bmlxdWUiLCJtYWxsb2MiLCJtZW1jaHIiLCJtZW1jbXAiLCJtZW1jcHkiLCJtZW1zZXQiLCJtb2RmIiwibW92ZSIsInBvdyIsInByaW50ZiIsInB1dGNoYXIiLCJwdXRzIiwicmVhbGxvYyIsInNjYW5mIiwic2luIiwic2luaCIsInNucHJpbnRmIiwic3ByaW50ZiIsInNxcnQiLCJzc2NhbmYiLCJzdGQiLCJzdGRlcnIiLCJzdGRpbiIsInN0ZG91dCIsInN0cmNhdCIsInN0cmNociIsInN0cmNtcCIsInN0cmNweSIsInN0cmNzcG4iLCJzdHJsZW4iLCJzdHJuY2F0Iiwic3RybmNtcCIsInN0cm5jcHkiLCJzdHJwYnJrIiwic3RycmNociIsInN0cnNwbiIsInN0cnN0ciIsInN3YXAiLCJ0YW4iLCJ0YW5oIiwidGVybWluYXRlIiwidG9fdW5kZXJseWluZyIsInRvbG93ZXIiLCJ0b3VwcGVyIiwidmZwcmludGYiLCJ2aXNpdCIsInZwcmludGYiLCJ2c3ByaW50ZiJdCn0sCmJlZ2luOm4uY29uY2F0KC9cYi8sLyg/IWRlY2x0eXBlKS8sLyg/IWlmKS8sLyg/IWZvcikvLC8oPyFzd2l0Y2gpLywvKD8hd2hpbGUpLyxlLklERU5UX1JFLG4ubG9va2FoZWFkKC8oPFtePD5dKz58KVxzKlwoLykpCn0sbT1bYixjLHMsdCxlLkNfQkxPQ0tfQ09NTUVOVF9NT0RFLGwsb10scD17dmFyaWFudHM6W3tiZWdpbjovPS8sZW5kOi87L30sewpiZWdpbjovXCgvLGVuZDovXCkvfSx7YmVnaW5LZXl3b3JkczoibmV3IHRocm93IHJldHVybiBlbHNlIixlbmQ6LzsvfV0sCmtleXdvcmRzOnUsY29udGFpbnM6bS5jb25jYXQoW3tiZWdpbjovXCgvLGVuZDovXCkvLGtleXdvcmRzOnUsCmNvbnRhaW5zOm0uY29uY2F0KFsic2VsZiJdKSxyZWxldmFuY2U6MH1dKSxyZWxldmFuY2U6MH0sXz17Y2xhc3NOYW1lOiJmdW5jdGlvbiIsCmJlZ2luOiIoIityKyJbXFwqJlxcc10rKSsiK2cscmV0dXJuQmVnaW46ITAsZW5kOi9bezs9XS8sZXhjbHVkZUVuZDohMCwKa2V5d29yZHM6dSxpbGxlZ2FsOi9bXlx3XHNcKiY6PD4uXS8sY29udGFpbnM6W3tiZWdpbjphLGtleXdvcmRzOnUscmVsZXZhbmNlOjB9LHsKYmVnaW46ZyxyZXR1cm5CZWdpbjohMCxjb250YWluczpbZF0scmVsZXZhbmNlOjB9LHtiZWdpbjovOjovLHJlbGV2YW5jZTowfSx7CmJlZ2luOi86LyxlbmRzV2l0aFBhcmVudDohMCxjb250YWluczpbbyxsXX0se3JlbGV2YW5jZTowLG1hdGNoOi8sL30sewpjbGFzc05hbWU6InBhcmFtcyIsYmVnaW46L1woLyxlbmQ6L1wpLyxrZXl3b3Jkczp1LHJlbGV2YW5jZTowLApjb250YWluczpbdCxlLkNfQkxPQ0tfQ09NTUVOVF9NT0RFLG8sbCxzLHtiZWdpbjovXCgvLGVuZDovXCkvLGtleXdvcmRzOnUsCnJlbGV2YW5jZTowLGNvbnRhaW5zOlsic2VsZiIsdCxlLkNfQkxPQ0tfQ09NTUVOVF9NT0RFLG8sbCxzXX1dCn0scyx0LGUuQ19CTE9DS19DT01NRU5UX01PREUsY119O3JldHVybntuYW1lOiJDKysiLAphbGlhc2VzOlsiY2MiLCJjKysiLCJoKysiLCJocHAiLCJoaCIsImh4eCIsImN4eCJdLGtleXdvcmRzOnUsaWxsZWdhbDoiPC8iLApjbGFzc05hbWVBbGlhc2VzOnsiZnVuY3Rpb24uZGlzcGF0Y2giOiJidWlsdF9pbiJ9LApjb250YWluczpbXS5jb25jYXQocCxfLGIsbSxbYyx7CmJlZ2luOiJcXGIoZGVxdWV8bGlzdHxxdWV1ZXxwcmlvcml0eV9xdWV1ZXxwYWlyfHN0YWNrfHZlY3RvcnxtYXB8c2V0fGJpdHNldHxtdWx0aXNldHxtdWx0aW1hcHx1bm9yZGVyZWRfbWFwfHVub3JkZXJlZF9zZXR8dW5vcmRlcmVkX211bHRpc2V0fHVub3JkZXJlZF9tdWx0aW1hcHxhcnJheXx0dXBsZXxvcHRpb25hbHx2YXJpYW50fGZ1bmN0aW9uKVxccyo8KD8hPCkiLAplbmQ6Ij4iLGtleXdvcmRzOnUsY29udGFpbnM6WyJzZWxmIixzXX0se2JlZ2luOmUuSURFTlRfUkUrIjo6IixrZXl3b3Jkczp1fSx7Cm1hdGNoOlsvXGIoPzplbnVtKD86XHMrKD86Y2xhc3N8c3RydWN0KSk/fGNsYXNzfHN0cnVjdHx1bmlvbikvLC9ccysvLC9cdysvXSwKY2xhc3NOYW1lOnsxOiJrZXl3b3JkIiwzOiJ0aXRsZS5jbGFzcyJ9fV0pfX0sZ3Jtcl9jc2hhcnA6ZT0+e2NvbnN0IG49ewprZXl3b3JkOlsiYWJzdHJhY3QiLCJhcyIsImJhc2UiLCJicmVhayIsImNhc2UiLCJjYXRjaCIsImNsYXNzIiwiY29uc3QiLCJjb250aW51ZSIsImRvIiwiZWxzZSIsImV2ZW50IiwiZXhwbGljaXQiLCJleHRlcm4iLCJmaW5hbGx5IiwiZml4ZWQiLCJmb3IiLCJmb3JlYWNoIiwiZ290byIsImlmIiwiaW1wbGljaXQiLCJpbiIsImludGVyZmFjZSIsImludGVybmFsIiwiaXMiLCJsb2NrIiwibmFtZXNwYWNlIiwibmV3Iiwib3BlcmF0b3IiLCJvdXQiLCJvdmVycmlkZSIsInBhcmFtcyIsInByaXZhdGUiLCJwcm90ZWN0ZWQiLCJwdWJsaWMiLCJyZWFkb25seSIsInJlY29yZCIsInJlZiIsInJldHVybiIsInNjb3BlZCIsInNlYWxlZCIsInNpemVvZiIsInN0YWNrYWxsb2MiLCJzdGF0aWMiLCJzdHJ1Y3QiLCJzd2l0Y2giLCJ0aGlzIiwidGhyb3ciLCJ0cnkiLCJ0eXBlb2YiLCJ1bmNoZWNrZWQiLCJ1bnNhZmUiLCJ1c2luZyIsInZpcnR1YWwiLCJ2b2lkIiwidm9sYXRpbGUiLCJ3aGlsZSJdLmNvbmNhdChbImFkZCIsImFsaWFzIiwiYW5kIiwiYXNjZW5kaW5nIiwiYXN5bmMiLCJhd2FpdCIsImJ5IiwiZGVzY2VuZGluZyIsImVxdWFscyIsImZyb20iLCJnZXQiLCJnbG9iYWwiLCJncm91cCIsImluaXQiLCJpbnRvIiwiam9pbiIsImxldCIsIm5hbWVvZiIsIm5vdCIsIm5vdG51bGwiLCJvbiIsIm9yIiwib3JkZXJieSIsInBhcnRpYWwiLCJyZW1vdmUiLCJzZWxlY3QiLCJzZXQiLCJ1bm1hbmFnZWQiLCJ2YWx1ZXwwIiwidmFyIiwid2hlbiIsIndoZXJlIiwid2l0aCIsInlpZWxkIl0pLApidWlsdF9pbjpbImJvb2wiLCJieXRlIiwiY2hhciIsImRlY2ltYWwiLCJkZWxlZ2F0ZSIsImRvdWJsZSIsImR5bmFtaWMiLCJlbnVtIiwiZmxvYXQiLCJpbnQiLCJsb25nIiwibmludCIsIm51aW50Iiwib2JqZWN0Iiwic2J5dGUiLCJzaG9ydCIsInN0cmluZyIsInVsb25nIiwidWludCIsInVzaG9ydCJdLApsaXRlcmFsOlsiZGVmYXVsdCIsImZhbHNlIiwibnVsbCIsInRydWUiXX0sdD1lLmluaGVyaXQoZS5USVRMRV9NT0RFLHsKYmVnaW46IlthLXpBLVpdKFxcLj9cXHcpKiJ9KSxhPXtjbGFzc05hbWU6Im51bWJlciIsdmFyaWFudHM6W3sKYmVnaW46IlxcYigwYlswMSddKykifSx7CmJlZ2luOiIoLT8pXFxiKFtcXGQnXSsoXFwuW1xcZCddKik/fFxcLltcXGQnXSspKHV8VXxsfEx8dWx8VUx8ZnxGfGJ8QikifSx7CmJlZ2luOiIoLT8pKFxcYjBbeFhdW2EtZkEtRjAtOSddK3woXFxiW1xcZCddKyhcXC5bXFxkJ10qKT98XFwuW1xcZCddKykoW2VFXVstK10/W1xcZCddKyk/KSIKfV0scmVsZXZhbmNlOjB9LGk9e2NsYXNzTmFtZToic3RyaW5nIixiZWdpbjonQCInLGVuZDonIicsY29udGFpbnM6W3tiZWdpbjonIiInfV0KfSxyPWUuaW5oZXJpdChpLHtpbGxlZ2FsOi9cbi99KSxzPXtjbGFzc05hbWU6InN1YnN0IixiZWdpbjovXHsvLGVuZDovXH0vLAprZXl3b3JkczpufSxvPWUuaW5oZXJpdChzLHtpbGxlZ2FsOi9cbi99KSxsPXtjbGFzc05hbWU6InN0cmluZyIsYmVnaW46L1wkIi8sCmVuZDonIicsaWxsZWdhbDovXG4vLGNvbnRhaW5zOlt7YmVnaW46L1x7XHsvfSx7YmVnaW46L1x9XH0vCn0sZS5CQUNLU0xBU0hfRVNDQVBFLG9dfSxjPXtjbGFzc05hbWU6InN0cmluZyIsYmVnaW46L1wkQCIvLGVuZDonIicsY29udGFpbnM6W3sKYmVnaW46L1x7XHsvfSx7YmVnaW46L1x9XH0vfSx7YmVnaW46JyIiJ30sc119LGQ9ZS5pbmhlcml0KGMse2lsbGVnYWw6L1xuLywKY29udGFpbnM6W3tiZWdpbjovXHtcey99LHtiZWdpbjovXH1cfS99LHtiZWdpbjonIiInfSxvXX0pCjtzLmNvbnRhaW5zPVtjLGwsaSxlLkFQT1NfU1RSSU5HX01PREUsZS5RVU9URV9TVFJJTkdfTU9ERSxhLGUuQ19CTE9DS19DT01NRU5UX01PREVdLApvLmNvbnRhaW5zPVtkLGwscixlLkFQT1NfU1RSSU5HX01PREUsZS5RVU9URV9TVFJJTkdfTU9ERSxhLGUuaW5oZXJpdChlLkNfQkxPQ0tfQ09NTUVOVF9NT0RFLHsKaWxsZWdhbDovXG4vfSldO2NvbnN0IGc9e3ZhcmlhbnRzOltjLGwsaSxlLkFQT1NfU1RSSU5HX01PREUsZS5RVU9URV9TVFJJTkdfTU9ERV0KfSx1PXtiZWdpbjoiPCIsZW5kOiI+Iixjb250YWluczpbe2JlZ2luS2V5d29yZHM6ImluIG91dCJ9LHRdCn0sYj1lLklERU5UX1JFKyIoPCIrZS5JREVOVF9SRSsiKFxccyosXFxzKiIrZS5JREVOVF9SRSsiKSo+KT8oXFxbXFxdKT8iLG09ewpiZWdpbjoiQCIrZS5JREVOVF9SRSxyZWxldmFuY2U6MH07cmV0dXJue25hbWU6IkMjIixhbGlhc2VzOlsiY3MiLCJjIyJdLAprZXl3b3JkczpuLGlsbGVnYWw6Lzo6Lyxjb250YWluczpbZS5DT01NRU5UKCIvLy8iLCIkIix7cmV0dXJuQmVnaW46ITAsCmNvbnRhaW5zOlt7Y2xhc3NOYW1lOiJkb2N0YWciLHZhcmlhbnRzOlt7YmVnaW46Ii8vLyIscmVsZXZhbmNlOjB9LHsKYmVnaW46Ilx4M2MhLS18LS1ceDNlIn0se2JlZ2luOiI8Lz8iLGVuZDoiPiJ9XX1dCn0pLGUuQ19MSU5FX0NPTU1FTlRfTU9ERSxlLkNfQkxPQ0tfQ09NTUVOVF9NT0RFLHtjbGFzc05hbWU6Im1ldGEiLGJlZ2luOiIjIiwKZW5kOiIkIixrZXl3b3Jkczp7CmtleXdvcmQ6ImlmIGVsc2UgZWxpZiBlbmRpZiBkZWZpbmUgdW5kZWYgd2FybmluZyBlcnJvciBsaW5lIHJlZ2lvbiBlbmRyZWdpb24gcHJhZ21hIGNoZWNrc3VtIgp9fSxnLGEse2JlZ2luS2V5d29yZHM6ImNsYXNzIGludGVyZmFjZSIscmVsZXZhbmNlOjAsZW5kOi9bezs9XS8sCmlsbGVnYWw6L1teXHM6LF0vLGNvbnRhaW5zOlt7YmVnaW5LZXl3b3Jkczoid2hlcmUgY2xhc3MiCn0sdCx1LGUuQ19MSU5FX0NPTU1FTlRfTU9ERSxlLkNfQkxPQ0tfQ09NTUVOVF9NT0RFXX0se2JlZ2luS2V5d29yZHM6Im5hbWVzcGFjZSIsCnJlbGV2YW5jZTowLGVuZDovW3s7PV0vLGlsbGVnYWw6L1teXHM6XS8sCmNvbnRhaW5zOlt0LGUuQ19MSU5FX0NPTU1FTlRfTU9ERSxlLkNfQkxPQ0tfQ09NTUVOVF9NT0RFXX0sewpiZWdpbktleXdvcmRzOiJyZWNvcmQiLHJlbGV2YW5jZTowLGVuZDovW3s7PV0vLGlsbGVnYWw6L1teXHM6XS8sCmNvbnRhaW5zOlt0LHUsZS5DX0xJTkVfQ09NTUVOVF9NT0RFLGUuQ19CTE9DS19DT01NRU5UX01PREVdfSx7Y2xhc3NOYW1lOiJtZXRhIiwKYmVnaW46Il5cXHMqXFxbKD89W1xcd10pIixleGNsdWRlQmVnaW46ITAsZW5kOiJcXF0iLGV4Y2x1ZGVFbmQ6ITAsY29udGFpbnM6W3sKY2xhc3NOYW1lOiJzdHJpbmciLGJlZ2luOi8iLyxlbmQ6LyIvfV19LHsKYmVnaW5LZXl3b3JkczoibmV3IHJldHVybiB0aHJvdyBhd2FpdCBlbHNlIixyZWxldmFuY2U6MH0se2NsYXNzTmFtZToiZnVuY3Rpb24iLApiZWdpbjoiKCIrYisiXFxzKykrIitlLklERU5UX1JFKyJcXHMqKDxbXj1dKz5cXHMqKT9cXCgiLHJldHVybkJlZ2luOiEwLAplbmQ6L1xzKlt7Oz1dLyxleGNsdWRlRW5kOiEwLGtleXdvcmRzOm4sY29udGFpbnM6W3sKYmVnaW5LZXl3b3JkczoicHVibGljIHByaXZhdGUgcHJvdGVjdGVkIHN0YXRpYyBpbnRlcm5hbCBwcm90ZWN0ZWQgYWJzdHJhY3QgYXN5bmMgZXh0ZXJuIG92ZXJyaWRlIHVuc2FmZSB2aXJ0dWFsIG5ldyBzZWFsZWQgcGFydGlhbCIsCnJlbGV2YW5jZTowfSx7YmVnaW46ZS5JREVOVF9SRSsiXFxzKig8W149XSs+XFxzKik/XFwoIixyZXR1cm5CZWdpbjohMCwKY29udGFpbnM6W2UuVElUTEVfTU9ERSx1XSxyZWxldmFuY2U6MH0se21hdGNoOi9cKFwpL30se2NsYXNzTmFtZToicGFyYW1zIiwKYmVnaW46L1woLyxlbmQ6L1wpLyxleGNsdWRlQmVnaW46ITAsZXhjbHVkZUVuZDohMCxrZXl3b3JkczpuLHJlbGV2YW5jZTowLApjb250YWluczpbZyxhLGUuQ19CTE9DS19DT01NRU5UX01PREVdCn0sZS5DX0xJTkVfQ09NTUVOVF9NT0RFLGUuQ19CTE9DS19DT01NRU5UX01PREVdfSxtXX19LGdybXJfY3NzOmU9PnsKY29uc3Qgbj1lLnJlZ2V4LHQ9aWUoZSksYT1bZS5BUE9TX1NUUklOR19NT0RFLGUuUVVPVEVfU1RSSU5HX01PREVdO3JldHVybnsKbmFtZToiQ1NTIixjYXNlX2luc2Vuc2l0aXZlOiEwLGlsbGVnYWw6L1s9fCdcJF0vLGtleXdvcmRzOnsKa2V5ZnJhbWVQb3NpdGlvbjoiZnJvbSB0byJ9LGNsYXNzTmFtZUFsaWFzZXM6e2tleWZyYW1lUG9zaXRpb246InNlbGVjdG9yLXRhZyJ9LApjb250YWluczpbdC5CTE9DS19DT01NRU5ULHtiZWdpbjovLSh3ZWJraXR8bW96fG1zfG8pLSg/PVthLXpdKS8KfSx0LkNTU19OVU1CRVJfTU9ERSx7Y2xhc3NOYW1lOiJzZWxlY3Rvci1pZCIsYmVnaW46LyNbQS1aYS16MC05Xy1dKy8scmVsZXZhbmNlOjAKfSx7Y2xhc3NOYW1lOiJzZWxlY3Rvci1jbGFzcyIsYmVnaW46IlxcLlthLXpBLVotXVthLXpBLVowLTlfLV0qIixyZWxldmFuY2U6MAp9LHQuQVRUUklCVVRFX1NFTEVDVE9SX01PREUse2NsYXNzTmFtZToic2VsZWN0b3ItcHNldWRvIix2YXJpYW50czpbewpiZWdpbjoiOigiK29lLmpvaW4oInwiKSsiKSJ9LHtiZWdpbjoiOig6KT8oIitsZS5qb2luKCJ8IikrIikifV0KfSx0LkNTU19WQVJJQUJMRSx7Y2xhc3NOYW1lOiJhdHRyaWJ1dGUiLGJlZ2luOiJcXGIoIitjZS5qb2luKCJ8IikrIilcXGIifSx7CmJlZ2luOi86LyxlbmQ6L1s7fXtdLywKY29udGFpbnM6W3QuQkxPQ0tfQ09NTUVOVCx0LkhFWENPTE9SLHQuSU1QT1JUQU5ULHQuQ1NTX05VTUJFUl9NT0RFLC4uLmEsewpiZWdpbjovKHVybHxkYXRhLXVyaSlcKC8sZW5kOi9cKS8scmVsZXZhbmNlOjAsa2V5d29yZHM6e2J1aWx0X2luOiJ1cmwgZGF0YS11cmkiCn0sY29udGFpbnM6Wy4uLmEse2NsYXNzTmFtZToic3RyaW5nIixiZWdpbjovW14pXS8sZW5kc1dpdGhQYXJlbnQ6ITAsCmV4Y2x1ZGVFbmQ6ITB9XX0sdC5GVU5DVElPTl9ESVNQQVRDSF19LHtiZWdpbjpuLmxvb2thaGVhZCgvQC8pLGVuZDoiW3s7XSIsCnJlbGV2YW5jZTowLGlsbGVnYWw6LzovLGNvbnRhaW5zOlt7Y2xhc3NOYW1lOiJrZXl3b3JkIixiZWdpbjovQC0/XHdbXHddKigtXHcrKSovCn0se2JlZ2luOi9ccy8sZW5kc1dpdGhQYXJlbnQ6ITAsZXhjbHVkZUVuZDohMCxyZWxldmFuY2U6MCxrZXl3b3Jkczp7CiRwYXR0ZXJuOi9bYS16LV0rLyxrZXl3b3JkOiJhbmQgb3Igbm90IG9ubHkiLGF0dHJpYnV0ZTpzZS5qb2luKCIgIil9LGNvbnRhaW5zOlt7CmJlZ2luOi9bYS16LV0rKD89OikvLGNsYXNzTmFtZToiYXR0cmlidXRlIn0sLi4uYSx0LkNTU19OVU1CRVJfTU9ERV19XX0sewpjbGFzc05hbWU6InNlbGVjdG9yLXRhZyIsYmVnaW46IlxcYigiK3JlLmpvaW4oInwiKSsiKVxcYiJ9XX19LGdybXJfZGlmZjplPT57CmNvbnN0IG49ZS5yZWdleDtyZXR1cm57bmFtZToiRGlmZiIsYWxpYXNlczpbInBhdGNoIl0sY29udGFpbnM6W3sKY2xhc3NOYW1lOiJtZXRhIixyZWxldmFuY2U6MTAsCm1hdGNoOm4uZWl0aGVyKC9eQEAgKy1cZCssXGQrICtcK1xkKyxcZCsgK0BALywvXlwqXCpcKiArXGQrLFxkKyArXCpcKlwqXCokLywvXi0tLSArXGQrLFxkKyArLS0tLSQvKQp9LHtjbGFzc05hbWU6ImNvbW1lbnQiLHZhcmlhbnRzOlt7CmJlZ2luOm4uZWl0aGVyKC9JbmRleDogLywvXmluZGV4LywvPXszLH0vLC9eLXszfS8sL15cKnszfSAvLC9eXCt7M30vLC9eZGlmZiAtLWdpdC8pLAplbmQ6LyQvfSx7bWF0Y2g6L15cKnsxNX0kL31dfSx7Y2xhc3NOYW1lOiJhZGRpdGlvbiIsYmVnaW46L15cKy8sZW5kOi8kL30sewpjbGFzc05hbWU6ImRlbGV0aW9uIixiZWdpbjovXi0vLGVuZDovJC99LHtjbGFzc05hbWU6ImFkZGl0aW9uIixiZWdpbjovXiEvLAplbmQ6LyQvfV19fSxncm1yX2dvOmU9Pntjb25zdCBuPXsKa2V5d29yZDpbImJyZWFrIiwiY2FzZSIsImNoYW4iLCJjb25zdCIsImNvbnRpbnVlIiwiZGVmYXVsdCIsImRlZmVyIiwiZWxzZSIsImZhbGx0aHJvdWdoIiwiZm9yIiwiZnVuYyIsImdvIiwiZ290byIsImlmIiwiaW1wb3J0IiwiaW50ZXJmYWNlIiwibWFwIiwicGFja2FnZSIsInJhbmdlIiwicmV0dXJuIiwic2VsZWN0Iiwic3RydWN0Iiwic3dpdGNoIiwidHlwZSIsInZhciJdLAp0eXBlOlsiYm9vbCIsImJ5dGUiLCJjb21wbGV4NjQiLCJjb21wbGV4MTI4IiwiZXJyb3IiLCJmbG9hdDMyIiwiZmxvYXQ2NCIsImludDgiLCJpbnQxNiIsImludDMyIiwiaW50NjQiLCJzdHJpbmciLCJ1aW50OCIsInVpbnQxNiIsInVpbnQzMiIsInVpbnQ2NCIsImludCIsInVpbnQiLCJ1aW50cHRyIiwicnVuZSJdLApsaXRlcmFsOlsidHJ1ZSIsImZhbHNlIiwiaW90YSIsIm5pbCJdLApidWlsdF9pbjpbImFwcGVuZCIsImNhcCIsImNsb3NlIiwiY29tcGxleCIsImNvcHkiLCJpbWFnIiwibGVuIiwibWFrZSIsIm5ldyIsInBhbmljIiwicHJpbnQiLCJwcmludGxuIiwicmVhbCIsInJlY292ZXIiLCJkZWxldGUiXQp9O3JldHVybntuYW1lOiJHbyIsYWxpYXNlczpbImdvbGFuZyJdLGtleXdvcmRzOm4saWxsZWdhbDoiPC8iLApjb250YWluczpbZS5DX0xJTkVfQ09NTUVOVF9NT0RFLGUuQ19CTE9DS19DT01NRU5UX01PREUse2NsYXNzTmFtZToic3RyaW5nIiwKdmFyaWFudHM6W2UuUVVPVEVfU1RSSU5HX01PREUsZS5BUE9TX1NUUklOR19NT0RFLHtiZWdpbjoiYCIsZW5kOiJgIn1dfSx7CmNsYXNzTmFtZToibnVtYmVyIix2YXJpYW50czpbe2JlZ2luOmUuQ19OVU1CRVJfUkUrIltpXSIscmVsZXZhbmNlOjEKfSxlLkNfTlVNQkVSX01PREVdfSx7YmVnaW46Lzo9L30se2NsYXNzTmFtZToiZnVuY3Rpb24iLGJlZ2luS2V5d29yZHM6ImZ1bmMiLAplbmQ6IlxccyooXFx7fCQpIixleGNsdWRlRW5kOiEwLGNvbnRhaW5zOltlLlRJVExFX01PREUse2NsYXNzTmFtZToicGFyYW1zIiwKYmVnaW46L1woLyxlbmQ6L1wpLyxlbmRzUGFyZW50OiEwLGtleXdvcmRzOm4saWxsZWdhbDovWyInXS99XX1dfX0sCmdybXJfZ3JhcGhxbDplPT57Y29uc3Qgbj1lLnJlZ2V4O3JldHVybntuYW1lOiJHcmFwaFFMIixhbGlhc2VzOlsiZ3FsIl0sCmNhc2VfaW5zZW5zaXRpdmU6ITAsZGlzYWJsZUF1dG9kZXRlY3Q6ITEsa2V5d29yZHM6ewprZXl3b3JkOlsicXVlcnkiLCJtdXRhdGlvbiIsInN1YnNjcmlwdGlvbiIsInR5cGUiLCJpbnB1dCIsInNjaGVtYSIsImRpcmVjdGl2ZSIsImludGVyZmFjZSIsInVuaW9uIiwic2NhbGFyIiwiZnJhZ21lbnQiLCJlbnVtIiwib24iXSwKbGl0ZXJhbDpbInRydWUiLCJmYWxzZSIsIm51bGwiXX0sCmNvbnRhaW5zOltlLkhBU0hfQ09NTUVOVF9NT0RFLGUuUVVPVEVfU1RSSU5HX01PREUsZS5OVU1CRVJfTU9ERSx7CnNjb3BlOiJwdW5jdHVhdGlvbiIsbWF0Y2g6L1suXXszfS8scmVsZXZhbmNlOjB9LHtzY29wZToicHVuY3R1YXRpb24iLApiZWdpbjovW1whXChcKVw6XD1cW1xdXHtcfFx9XXsxfS8scmVsZXZhbmNlOjB9LHtzY29wZToidmFyaWFibGUiLGJlZ2luOi9cJC8sCmVuZDovXFcvLGV4Y2x1ZGVFbmQ6ITAscmVsZXZhbmNlOjB9LHtzY29wZToibWV0YSIsbWF0Y2g6L0BcdysvLGV4Y2x1ZGVFbmQ6ITB9LHsKc2NvcGU6InN5bWJvbCIsYmVnaW46bi5jb25jYXQoL1tfQS1aYS16XVtfMC05QS1aYS16XSovLG4ubG9va2FoZWFkKC9ccyo6LykpLApyZWxldmFuY2U6MH1dLGlsbGVnYWw6Wy9bOzwnXS8sL0JFR0lOL119fSxncm1yX2luaTplPT57Y29uc3Qgbj1lLnJlZ2V4LHQ9ewpjbGFzc05hbWU6Im51bWJlciIscmVsZXZhbmNlOjAsdmFyaWFudHM6W3tiZWdpbjovKFsrLV0rKT9bXGRdK19bXGRfXSsvfSx7CmJlZ2luOmUuTlVNQkVSX1JFfV19LGE9ZS5DT01NRU5UKCk7YS52YXJpYW50cz1be2JlZ2luOi87LyxlbmQ6LyQvfSx7YmVnaW46LyMvLAplbmQ6LyQvfV07Y29uc3QgaT17Y2xhc3NOYW1lOiJ2YXJpYWJsZSIsdmFyaWFudHM6W3tiZWdpbjovXCRbXHdcZCJdW1x3XGRfXSovfSx7CmJlZ2luOi9cJFx7KC4qPylcfS99XX0scj17Y2xhc3NOYW1lOiJsaXRlcmFsIiwKYmVnaW46L1xib258b2ZmfHRydWV8ZmFsc2V8eWVzfG5vXGIvfSxzPXtjbGFzc05hbWU6InN0cmluZyIsCmNvbnRhaW5zOltlLkJBQ0tTTEFTSF9FU0NBUEVdLHZhcmlhbnRzOlt7YmVnaW46IicnJyIsZW5kOiInJyciLHJlbGV2YW5jZToxMH0sewpiZWdpbjonIiIiJyxlbmQ6JyIiIicscmVsZXZhbmNlOjEwfSx7YmVnaW46JyInLGVuZDonIid9LHtiZWdpbjoiJyIsZW5kOiInIn1dCn0sbz17YmVnaW46L1xbLyxlbmQ6L1xdLyxjb250YWluczpbYSxyLGkscyx0LCJzZWxmIl0scmVsZXZhbmNlOjAKfSxsPW4uZWl0aGVyKC9bQS1aYS16MC05Xy1dKy8sLyIoXFwifFteIl0pKiIvLC8nW14nXSonLyk7cmV0dXJuewpuYW1lOiJUT01MLCBhbHNvIElOSSIsYWxpYXNlczpbInRvbWwiXSxjYXNlX2luc2Vuc2l0aXZlOiEwLGlsbGVnYWw6L1xTLywKY29udGFpbnM6W2Ese2NsYXNzTmFtZToic2VjdGlvbiIsYmVnaW46L1xbKy8sZW5kOi9cXSsvfSx7CmJlZ2luOm4uY29uY2F0KGwsIihcXHMqXFwuXFxzKiIsbCwiKSoiLG4ubG9va2FoZWFkKC9ccyo9XHMqW14jXHNdLykpLApjbGFzc05hbWU6ImF0dHIiLHN0YXJ0czp7ZW5kOi8kLyxjb250YWluczpbYSxvLHIsaSxzLHRdfX1dfX0sZ3Jtcl9qYXZhOmU9PnsKY29uc3Qgbj1lLnJlZ2V4LHQ9IltceGMwLVx1MDJiOGEtekEtWl8kXVtceGMwLVx1MDJiOGEtekEtWl8kMC05XSoiLGE9dCtwZSgiKD86PCIrdCsifn5+KD86XFxzKixcXHMqIit0KyJ+fn4pKj4pPyIsL35+fi9nLDIpLGk9ewprZXl3b3JkOlsic3luY2hyb25pemVkIiwiYWJzdHJhY3QiLCJwcml2YXRlIiwidmFyIiwic3RhdGljIiwiaWYiLCJjb25zdCAiLCJmb3IiLCJ3aGlsZSIsInN0cmljdGZwIiwiZmluYWxseSIsInByb3RlY3RlZCIsImltcG9ydCIsIm5hdGl2ZSIsImZpbmFsIiwidm9pZCIsImVudW0iLCJlbHNlIiwiYnJlYWsiLCJ0cmFuc2llbnQiLCJjYXRjaCIsImluc3RhbmNlb2YiLCJ2b2xhdGlsZSIsImNhc2UiLCJhc3NlcnQiLCJwYWNrYWdlIiwiZGVmYXVsdCIsInB1YmxpYyIsInRyeSIsInN3aXRjaCIsImNvbnRpbnVlIiwidGhyb3dzIiwicHJvdGVjdGVkIiwicHVibGljIiwicHJpdmF0ZSIsIm1vZHVsZSIsInJlcXVpcmVzIiwiZXhwb3J0cyIsImRvIiwic2VhbGVkIiwieWllbGQiLCJwZXJtaXRzIl0sCmxpdGVyYWw6WyJmYWxzZSIsInRydWUiLCJudWxsIl0sCnR5cGU6WyJjaGFyIiwiYm9vbGVhbiIsImxvbmciLCJmbG9hdCIsImludCIsImJ5dGUiLCJzaG9ydCIsImRvdWJsZSJdLApidWlsdF9pbjpbInN1cGVyIiwidGhpcyJdfSxyPXtjbGFzc05hbWU6Im1ldGEiLGJlZ2luOiJAIit0LGNvbnRhaW5zOlt7CmJlZ2luOi9cKC8sZW5kOi9cKS8sY29udGFpbnM6WyJzZWxmIl19XX0scz17Y2xhc3NOYW1lOiJwYXJhbXMiLGJlZ2luOi9cKC8sCmVuZDovXCkvLGtleXdvcmRzOmkscmVsZXZhbmNlOjAsY29udGFpbnM6W2UuQ19CTE9DS19DT01NRU5UX01PREVdLGVuZHNQYXJlbnQ6ITB9CjtyZXR1cm57bmFtZToiSmF2YSIsYWxpYXNlczpbImpzcCJdLGtleXdvcmRzOmksaWxsZWdhbDovPFwvfCMvLApjb250YWluczpbZS5DT01NRU5UKCIvXFwqXFwqIiwiXFwqLyIse3JlbGV2YW5jZTowLGNvbnRhaW5zOlt7YmVnaW46L1x3K0AvLApyZWxldmFuY2U6MH0se2NsYXNzTmFtZToiZG9jdGFnIixiZWdpbjoiQFtBLVphLXpdKyJ9XX0pLHsKYmVnaW46L2ltcG9ydCBqYXZhXC5bYS16XStcLi8sa2V5d29yZHM6ImltcG9ydCIscmVsZXZhbmNlOjIKfSxlLkNfTElORV9DT01NRU5UX01PREUsZS5DX0JMT0NLX0NPTU1FTlRfTU9ERSx7YmVnaW46LyIiIi8sZW5kOi8iIiIvLApjbGFzc05hbWU6InN0cmluZyIsY29udGFpbnM6W2UuQkFDS1NMQVNIX0VTQ0FQRV0KfSxlLkFQT1NfU1RSSU5HX01PREUsZS5RVU9URV9TVFJJTkdfTU9ERSx7Cm1hdGNoOlsvXGIoPzpjbGFzc3xpbnRlcmZhY2V8ZW51bXxleHRlbmRzfGltcGxlbWVudHN8bmV3KS8sL1xzKy8sdF0sY2xhc3NOYW1lOnsKMToia2V5d29yZCIsMzoidGl0bGUuY2xhc3MifX0se21hdGNoOi9ub24tc2VhbGVkLyxzY29wZToia2V5d29yZCJ9LHsKYmVnaW46W24uY29uY2F0KC8oPyFlbHNlKS8sdCksL1xzKy8sdCwvXHMrLywvPSg/IT0pL10sY2xhc3NOYW1lOnsxOiJ0eXBlIiwKMzoidmFyaWFibGUiLDU6Im9wZXJhdG9yIn19LHtiZWdpbjpbL3JlY29yZC8sL1xzKy8sdF0sY2xhc3NOYW1lOnsxOiJrZXl3b3JkIiwKMzoidGl0bGUuY2xhc3MifSxjb250YWluczpbcyxlLkNfTElORV9DT01NRU5UX01PREUsZS5DX0JMT0NLX0NPTU1FTlRfTU9ERV19LHsKYmVnaW5LZXl3b3JkczoibmV3IHRocm93IHJldHVybiBlbHNlIixyZWxldmFuY2U6MH0sewpiZWdpbjpbIig/OiIrYSsiXFxzKykiLGUuVU5ERVJTQ09SRV9JREVOVF9SRSwvXHMqKD89XCgpL10sY2xhc3NOYW1lOnsKMjoidGl0bGUuZnVuY3Rpb24ifSxrZXl3b3JkczppLGNvbnRhaW5zOlt7Y2xhc3NOYW1lOiJwYXJhbXMiLGJlZ2luOi9cKC8sCmVuZDovXCkvLGtleXdvcmRzOmkscmVsZXZhbmNlOjAsCmNvbnRhaW5zOltyLGUuQVBPU19TVFJJTkdfTU9ERSxlLlFVT1RFX1NUUklOR19NT0RFLG1lLGUuQ19CTE9DS19DT01NRU5UX01PREVdCn0sZS5DX0xJTkVfQ09NTUVOVF9NT0RFLGUuQ19CTE9DS19DT01NRU5UX01PREVdfSxtZSxyXX19LGdybXJfamF2YXNjcmlwdDpPZSwKZ3Jtcl9qc29uOmU9Pntjb25zdCBuPVsidHJ1ZSIsImZhbHNlIiwibnVsbCJdLHQ9e3Njb3BlOiJsaXRlcmFsIiwKYmVnaW5LZXl3b3JkczpuLmpvaW4oIiAiKX07cmV0dXJue25hbWU6IkpTT04iLGtleXdvcmRzOntsaXRlcmFsOm59LGNvbnRhaW5zOlt7CmNsYXNzTmFtZToiYXR0ciIsYmVnaW46LyIoXFwufFteXFwiXHJcbl0pKiIoPz1ccyo6KS8scmVsZXZhbmNlOjEuMDF9LHsKbWF0Y2g6L1t7fVtcXSw6XS8sY2xhc3NOYW1lOiJwdW5jdHVhdGlvbiIscmVsZXZhbmNlOjAKfSxlLlFVT1RFX1NUUklOR19NT0RFLHQsZS5DX05VTUJFUl9NT0RFLGUuQ19MSU5FX0NPTU1FTlRfTU9ERSxlLkNfQkxPQ0tfQ09NTUVOVF9NT0RFXSwKaWxsZWdhbDoiXFxTIn19LGdybXJfa290bGluOmU9Pntjb25zdCBuPXsKa2V5d29yZDoiYWJzdHJhY3QgYXMgdmFsIHZhciB2YXJhcmcgZ2V0IHNldCBjbGFzcyBvYmplY3Qgb3BlbiBwcml2YXRlIHByb3RlY3RlZCBwdWJsaWMgbm9pbmxpbmUgY3Jvc3NpbmxpbmUgZHluYW1pYyBmaW5hbCBlbnVtIGlmIGVsc2UgZG8gd2hpbGUgZm9yIHdoZW4gdGhyb3cgdHJ5IGNhdGNoIGZpbmFsbHkgaW1wb3J0IHBhY2thZ2UgaXMgaW4gZnVuIG92ZXJyaWRlIGNvbXBhbmlvbiByZWlmaWVkIGlubGluZSBsYXRlaW5pdCBpbml0IGludGVyZmFjZSBhbm5vdGF0aW9uIGRhdGEgc2VhbGVkIGludGVybmFsIGluZml4IG9wZXJhdG9yIG91dCBieSBjb25zdHJ1Y3RvciBzdXBlciB0YWlscmVjIHdoZXJlIGNvbnN0IGlubmVyIHN1c3BlbmQgdHlwZWFsaWFzIGV4dGVybmFsIGV4cGVjdCBhY3R1YWwiLApidWlsdF9pbjoiQnl0ZSBTaG9ydCBDaGFyIEludCBMb25nIEJvb2xlYW4gRmxvYXQgRG91YmxlIFZvaWQgVW5pdCBOb3RoaW5nIiwKbGl0ZXJhbDoidHJ1ZSBmYWxzZSBudWxsIn0sdD17Y2xhc3NOYW1lOiJzeW1ib2wiLGJlZ2luOmUuVU5ERVJTQ09SRV9JREVOVF9SRSsiQCIKfSxhPXtjbGFzc05hbWU6InN1YnN0IixiZWdpbjovXCRcey8sZW5kOi9cfS8sY29udGFpbnM6W2UuQ19OVU1CRVJfTU9ERV19LGk9ewpjbGFzc05hbWU6InZhcmlhYmxlIixiZWdpbjoiXFwkIitlLlVOREVSU0NPUkVfSURFTlRfUkV9LHI9e2NsYXNzTmFtZToic3RyaW5nIiwKdmFyaWFudHM6W3tiZWdpbjonIiIiJyxlbmQ6JyIiIig/PVteIl0pJyxjb250YWluczpbaSxhXX0se2JlZ2luOiInIixlbmQ6IiciLAppbGxlZ2FsOi9cbi8sY29udGFpbnM6W2UuQkFDS1NMQVNIX0VTQ0FQRV19LHtiZWdpbjonIicsZW5kOiciJyxpbGxlZ2FsOi9cbi8sCmNvbnRhaW5zOltlLkJBQ0tTTEFTSF9FU0NBUEUsaSxhXX1dfTthLmNvbnRhaW5zLnB1c2gocik7Y29uc3Qgcz17CmNsYXNzTmFtZToibWV0YSIsCmJlZ2luOiJAKD86ZmlsZXxwcm9wZXJ0eXxmaWVsZHxnZXR8c2V0fHJlY2VpdmVyfHBhcmFtfHNldHBhcmFtfGRlbGVnYXRlKVxccyo6KD86XFxzKiIrZS5VTkRFUlNDT1JFX0lERU5UX1JFKyIpPyIKfSxvPXtjbGFzc05hbWU6Im1ldGEiLGJlZ2luOiJAIitlLlVOREVSU0NPUkVfSURFTlRfUkUsY29udGFpbnM6W3tiZWdpbjovXCgvLAplbmQ6L1wpLyxjb250YWluczpbZS5pbmhlcml0KHIse2NsYXNzTmFtZToic3RyaW5nIn0pLCJzZWxmIl19XQp9LGw9bWUsYz1lLkNPTU1FTlQoIi9cXCoiLCJcXCovIix7Y29udGFpbnM6W2UuQ19CTE9DS19DT01NRU5UX01PREVdfSksZD17CnZhcmlhbnRzOlt7Y2xhc3NOYW1lOiJ0eXBlIixiZWdpbjplLlVOREVSU0NPUkVfSURFTlRfUkV9LHtiZWdpbjovXCgvLGVuZDovXCkvLApjb250YWluczpbXX1dfSxnPWQ7cmV0dXJuIGcudmFyaWFudHNbMV0uY29udGFpbnM9W2RdLGQudmFyaWFudHNbMV0uY29udGFpbnM9W2ddLAp7bmFtZToiS290bGluIixhbGlhc2VzOlsia3QiLCJrdHMiXSxrZXl3b3JkczpuLApjb250YWluczpbZS5DT01NRU5UKCIvXFwqXFwqIiwiXFwqLyIse3JlbGV2YW5jZTowLGNvbnRhaW5zOlt7Y2xhc3NOYW1lOiJkb2N0YWciLApiZWdpbjoiQFtBLVphLXpdKyJ9XX0pLGUuQ19MSU5FX0NPTU1FTlRfTU9ERSxjLHtjbGFzc05hbWU6ImtleXdvcmQiLApiZWdpbjovXGIoYnJlYWt8Y29udGludWV8cmV0dXJufHRoaXMpXGIvLHN0YXJ0czp7Y29udGFpbnM6W3tjbGFzc05hbWU6InN5bWJvbCIsCmJlZ2luOi9AXHcrL31dfX0sdCxzLG8se2NsYXNzTmFtZToiZnVuY3Rpb24iLGJlZ2luS2V5d29yZHM6ImZ1biIsZW5kOiJbKF18JCIsCnJldHVybkJlZ2luOiEwLGV4Y2x1ZGVFbmQ6ITAsa2V5d29yZHM6bixyZWxldmFuY2U6NSxjb250YWluczpbewpiZWdpbjplLlVOREVSU0NPUkVfSURFTlRfUkUrIlxccypcXCgiLHJldHVybkJlZ2luOiEwLHJlbGV2YW5jZTowLApjb250YWluczpbZS5VTkRFUlNDT1JFX1RJVExFX01PREVdfSx7Y2xhc3NOYW1lOiJ0eXBlIixiZWdpbjovPC8sZW5kOi8+LywKa2V5d29yZHM6InJlaWZpZWQiLHJlbGV2YW5jZTowfSx7Y2xhc3NOYW1lOiJwYXJhbXMiLGJlZ2luOi9cKC8sZW5kOi9cKS8sCmVuZHNQYXJlbnQ6ITAsa2V5d29yZHM6bixyZWxldmFuY2U6MCxjb250YWluczpbe2JlZ2luOi86LyxlbmQ6L1s9LFwvXS8sCmVuZHNXaXRoUGFyZW50OiEwLGNvbnRhaW5zOltkLGUuQ19MSU5FX0NPTU1FTlRfTU9ERSxjXSxyZWxldmFuY2U6MAp9LGUuQ19MSU5FX0NPTU1FTlRfTU9ERSxjLHMsbyxyLGUuQ19OVU1CRVJfTU9ERV19LGNdfSx7CmJlZ2luOlsvY2xhc3N8aW50ZXJmYWNlfHRyYWl0LywvXHMrLyxlLlVOREVSU0NPUkVfSURFTlRfUkVdLGJlZ2luU2NvcGU6ewozOiJ0aXRsZS5jbGFzcyJ9LGtleXdvcmRzOiJjbGFzcyBpbnRlcmZhY2UgdHJhaXQiLGVuZDovWzpceyhdfCQvLGV4Y2x1ZGVFbmQ6ITAsCmlsbGVnYWw6ImV4dGVuZHMgaW1wbGVtZW50cyIsY29udGFpbnM6W3sKYmVnaW5LZXl3b3JkczoicHVibGljIHByb3RlY3RlZCBpbnRlcm5hbCBwcml2YXRlIGNvbnN0cnVjdG9yIgp9LGUuVU5ERVJTQ09SRV9USVRMRV9NT0RFLHtjbGFzc05hbWU6InR5cGUiLGJlZ2luOi88LyxlbmQ6Lz4vLGV4Y2x1ZGVCZWdpbjohMCwKZXhjbHVkZUVuZDohMCxyZWxldmFuY2U6MH0se2NsYXNzTmFtZToidHlwZSIsYmVnaW46L1ssOl1ccyovLGVuZDovWzxcKCwpe1xzXXwkLywKZXhjbHVkZUJlZ2luOiEwLHJldHVybkVuZDohMH0scyxvXX0scix7Y2xhc3NOYW1lOiJtZXRhIixiZWdpbjoiXiMhL3Vzci9iaW4vZW52IiwKZW5kOiIkIixpbGxlZ2FsOiJcbiJ9LGxdfX0sZ3Jtcl9sZXNzOmU9PnsKY29uc3Qgbj1pZShlKSx0PWRlLGE9IltcXHctXSsiLGk9IigiK2ErInxAXFx7IithKyJcXH0pIixyPVtdLHM9W10sbz1lPT4oewpjbGFzc05hbWU6InN0cmluZyIsYmVnaW46In4/IitlKyIuKj8iK2V9KSxsPShlLG4sdCk9Pih7Y2xhc3NOYW1lOmUsYmVnaW46biwKcmVsZXZhbmNlOnR9KSxjPXskcGF0dGVybjovW2Etei1dKy8sa2V5d29yZDoiYW5kIG9yIG5vdCBvbmx5IiwKYXR0cmlidXRlOnNlLmpvaW4oIiAiKX0sZD17YmVnaW46IlxcKCIsZW5kOiJcXCkiLGNvbnRhaW5zOnMsa2V5d29yZHM6YywKcmVsZXZhbmNlOjB9CjtzLnB1c2goZS5DX0xJTkVfQ09NTUVOVF9NT0RFLGUuQ19CTE9DS19DT01NRU5UX01PREUsbygiJyIpLG8oJyInKSxuLkNTU19OVU1CRVJfTU9ERSx7CmJlZ2luOiIodXJsfGRhdGEtdXJpKVxcKCIsc3RhcnRzOntjbGFzc05hbWU6InN0cmluZyIsZW5kOiJbXFwpXFxuXSIsCmV4Y2x1ZGVFbmQ6ITB9Cn0sbi5IRVhDT0xPUixkLGwoInZhcmlhYmxlIiwiQEA/IithLDEwKSxsKCJ2YXJpYWJsZSIsIkBcXHsiK2ErIlxcfSIpLGwoImJ1aWx0X2luIiwifj9gW15gXSo/YCIpLHsKY2xhc3NOYW1lOiJhdHRyaWJ1dGUiLGJlZ2luOmErIlxccyo6IixlbmQ6IjoiLHJldHVybkJlZ2luOiEwLGV4Y2x1ZGVFbmQ6ITAKfSxuLklNUE9SVEFOVCx7YmVnaW5LZXl3b3JkczoiYW5kIG5vdCJ9LG4uRlVOQ1RJT05fRElTUEFUQ0gpO2NvbnN0IGc9cy5jb25jYXQoewpiZWdpbjovXHsvLGVuZDovXH0vLGNvbnRhaW5zOnJ9KSx1PXtiZWdpbktleXdvcmRzOiJ3aGVuIixlbmRzV2l0aFBhcmVudDohMCwKY29udGFpbnM6W3tiZWdpbktleXdvcmRzOiJhbmQgbm90In1dLmNvbmNhdChzKX0sYj17YmVnaW46aSsiXFxzKjoiLApyZXR1cm5CZWdpbjohMCxlbmQ6L1s7fV0vLHJlbGV2YW5jZTowLGNvbnRhaW5zOlt7YmVnaW46Ly0od2Via2l0fG1venxtc3xvKS0vCn0sbi5DU1NfVkFSSUFCTEUse2NsYXNzTmFtZToiYXR0cmlidXRlIixiZWdpbjoiXFxiKCIrY2Uuam9pbigifCIpKyIpXFxiIiwKZW5kOi8oPz06KS8sc3RhcnRzOntlbmRzV2l0aFBhcmVudDohMCxpbGxlZ2FsOiJbPD0kXSIscmVsZXZhbmNlOjAsY29udGFpbnM6c319XQp9LG09e2NsYXNzTmFtZToia2V5d29yZCIsCmJlZ2luOiJAKGltcG9ydHxtZWRpYXxjaGFyc2V0fGZvbnQtZmFjZXwoLVthLXpdKy0pP2tleWZyYW1lc3xzdXBwb3J0c3xkb2N1bWVudHxuYW1lc3BhY2V8cGFnZXx2aWV3cG9ydHxob3N0KVxcYiIsCnN0YXJ0czp7ZW5kOiJbO3t9XSIsa2V5d29yZHM6YyxyZXR1cm5FbmQ6ITAsY29udGFpbnM6cyxyZWxldmFuY2U6MH19LHA9ewpjbGFzc05hbWU6InZhcmlhYmxlIix2YXJpYW50czpbe2JlZ2luOiJAIithKyJcXHMqOiIscmVsZXZhbmNlOjE1fSx7YmVnaW46IkAiK2EKfV0sc3RhcnRzOntlbmQ6Ils7fV0iLHJldHVybkVuZDohMCxjb250YWluczpnfX0sXz17dmFyaWFudHM6W3sKYmVnaW46IltcXC4jOiZcXFs+XSIsZW5kOiJbO3t9XSJ9LHtiZWdpbjppLGVuZDovXHsvfV0scmV0dXJuQmVnaW46ITAsCnJldHVybkVuZDohMCxpbGxlZ2FsOiJbPD0nJFwiXSIscmVsZXZhbmNlOjAsCmNvbnRhaW5zOltlLkNfTElORV9DT01NRU5UX01PREUsZS5DX0JMT0NLX0NPTU1FTlRfTU9ERSx1LGwoImtleXdvcmQiLCJhbGxcXGIiKSxsKCJ2YXJpYWJsZSIsIkBcXHsiK2ErIlxcfSIpLHsKYmVnaW46IlxcYigiK3JlLmpvaW4oInwiKSsiKVxcYiIsY2xhc3NOYW1lOiJzZWxlY3Rvci10YWciCn0sbi5DU1NfTlVNQkVSX01PREUsbCgic2VsZWN0b3ItdGFnIixpLDApLGwoInNlbGVjdG9yLWlkIiwiIyIraSksbCgic2VsZWN0b3ItY2xhc3MiLCJcXC4iK2ksMCksbCgic2VsZWN0b3ItdGFnIiwiJiIsMCksbi5BVFRSSUJVVEVfU0VMRUNUT1JfTU9ERSx7CmNsYXNzTmFtZToic2VsZWN0b3ItcHNldWRvIixiZWdpbjoiOigiK29lLmpvaW4oInwiKSsiKSJ9LHsKY2xhc3NOYW1lOiJzZWxlY3Rvci1wc2V1ZG8iLGJlZ2luOiI6KDopPygiK2xlLmpvaW4oInwiKSsiKSJ9LHtiZWdpbjovXCgvLAplbmQ6L1wpLyxyZWxldmFuY2U6MCxjb250YWluczpnfSx7YmVnaW46IiFpbXBvcnRhbnQifSxuLkZVTkNUSU9OX0RJU1BBVENIXX0saD17CmJlZ2luOmErIjooOik/IitgKCR7dC5qb2luKCJ8Iil9KWAscmV0dXJuQmVnaW46ITAsY29udGFpbnM6W19dfQo7cmV0dXJuIHIucHVzaChlLkNfTElORV9DT01NRU5UX01PREUsZS5DX0JMT0NLX0NPTU1FTlRfTU9ERSxtLHAsaCxiLF8sdSxuLkZVTkNUSU9OX0RJU1BBVENIKSwKe25hbWU6Ikxlc3MiLGNhc2VfaW5zZW5zaXRpdmU6ITAsaWxsZWdhbDoiWz0+Jy88KCRcIl0iLGNvbnRhaW5zOnJ9fSwKZ3Jtcl9sdWE6ZT0+e2NvbnN0IG49IlxcWz0qXFxbIix0PSJcXF09KlxcXSIsYT17YmVnaW46bixlbmQ6dCxjb250YWluczpbInNlbGYiXQp9LGk9W2UuQ09NTUVOVCgiLS0oPyEiK24rIikiLCIkIiksZS5DT01NRU5UKCItLSIrbix0LHtjb250YWluczpbYV0scmVsZXZhbmNlOjEwCn0pXTtyZXR1cm57bmFtZToiTHVhIixrZXl3b3Jkczp7JHBhdHRlcm46ZS5VTkRFUlNDT1JFX0lERU5UX1JFLApsaXRlcmFsOiJ0cnVlIGZhbHNlIG5pbCIsCmtleXdvcmQ6ImFuZCBicmVhayBkbyBlbHNlIGVsc2VpZiBlbmQgZm9yIGdvdG8gaWYgaW4gbG9jYWwgbm90IG9yIHJlcGVhdCByZXR1cm4gdGhlbiB1bnRpbCB3aGlsZSIsCmJ1aWx0X2luOiJfRyBfRU5WIF9WRVJTSU9OIF9faW5kZXggX19uZXdpbmRleCBfX21vZGUgX19jYWxsIF9fbWV0YXRhYmxlIF9fdG9zdHJpbmcgX19sZW4gX19nYyBfX2FkZCBfX3N1YiBfX211bCBfX2RpdiBfX21vZCBfX3BvdyBfX2NvbmNhdCBfX3VubSBfX2VxIF9fbHQgX19sZSBhc3NlcnQgY29sbGVjdGdhcmJhZ2UgZG9maWxlIGVycm9yIGdldGZlbnYgZ2V0bWV0YXRhYmxlIGlwYWlycyBsb2FkIGxvYWRmaWxlIGxvYWRzdHJpbmcgbW9kdWxlIG5leHQgcGFpcnMgcGNhbGwgcHJpbnQgcmF3ZXF1YWwgcmF3Z2V0IHJhd3NldCByZXF1aXJlIHNlbGVjdCBzZXRmZW52IHNldG1ldGF0YWJsZSB0b251bWJlciB0b3N0cmluZyB0eXBlIHVucGFjayB4cGNhbGwgYXJnIHNlbGYgY29yb3V0aW5lIHJlc3VtZSB5aWVsZCBzdGF0dXMgd3JhcCBjcmVhdGUgcnVubmluZyBkZWJ1ZyBnZXR1cHZhbHVlIGRlYnVnIHNldGhvb2sgZ2V0bWV0YXRhYmxlIGdldGhvb2sgc2V0bWV0YXRhYmxlIHNldGxvY2FsIHRyYWNlYmFjayBzZXRmZW52IGdldGluZm8gc2V0dXB2YWx1ZSBnZXRsb2NhbCBnZXRyZWdpc3RyeSBnZXRmZW52IGlvIGxpbmVzIHdyaXRlIGNsb3NlIGZsdXNoIG9wZW4gb3V0cHV0IHR5cGUgcmVhZCBzdGRlcnIgc3RkaW4gaW5wdXQgc3Rkb3V0IHBvcGVuIHRtcGZpbGUgbWF0aCBsb2cgbWF4IGFjb3MgaHVnZSBsZGV4cCBwaSBjb3MgdGFuaCBwb3cgZGVnIHRhbiBjb3NoIHNpbmggcmFuZG9tIHJhbmRvbXNlZWQgZnJleHAgY2VpbCBmbG9vciByYWQgYWJzIHNxcnQgbW9kZiBhc2luIG1pbiBtb2QgZm1vZCBsb2cxMCBhdGFuMiBleHAgc2luIGF0YW4gb3MgZXhpdCBzZXRsb2NhbGUgZGF0ZSBnZXRlbnYgZGlmZnRpbWUgcmVtb3ZlIHRpbWUgY2xvY2sgdG1wbmFtZSByZW5hbWUgZXhlY3V0ZSBwYWNrYWdlIHByZWxvYWQgbG9hZGxpYiBsb2FkZWQgbG9hZGVycyBjcGF0aCBjb25maWcgcGF0aCBzZWVhbGwgc3RyaW5nIHN1YiB1cHBlciBsZW4gZ2ZpbmQgcmVwIGZpbmQgbWF0Y2ggY2hhciBkdW1wIGdtYXRjaCByZXZlcnNlIGJ5dGUgZm9ybWF0IGdzdWIgbG93ZXIgdGFibGUgc2V0biBpbnNlcnQgZ2V0biBmb3JlYWNoaSBtYXhuIGZvcmVhY2ggY29uY2F0IHNvcnQgcmVtb3ZlIgp9LGNvbnRhaW5zOmkuY29uY2F0KFt7Y2xhc3NOYW1lOiJmdW5jdGlvbiIsYmVnaW5LZXl3b3JkczoiZnVuY3Rpb24iLGVuZDoiXFwpIiwKY29udGFpbnM6W2UuaW5oZXJpdChlLlRJVExFX01PREUsewpiZWdpbjoiKFtfYS16QS1aXVxcdypcXC4pKihbX2EtekEtWl1cXHcqOik/W19hLXpBLVpdXFx3KiJ9KSx7Y2xhc3NOYW1lOiJwYXJhbXMiLApiZWdpbjoiXFwoIixlbmRzV2l0aFBhcmVudDohMCxjb250YWluczppfV0uY29uY2F0KGkpCn0sZS5DX05VTUJFUl9NT0RFLGUuQVBPU19TVFJJTkdfTU9ERSxlLlFVT1RFX1NUUklOR19NT0RFLHtjbGFzc05hbWU6InN0cmluZyIsCmJlZ2luOm4sZW5kOnQsY29udGFpbnM6W2FdLHJlbGV2YW5jZTo1fV0pfX0sZ3Jtcl9tYWtlZmlsZTplPT57Y29uc3Qgbj17CmNsYXNzTmFtZToidmFyaWFibGUiLHZhcmlhbnRzOlt7YmVnaW46IlxcJFxcKCIrZS5VTkRFUlNDT1JFX0lERU5UX1JFKyJcXCkiLApjb250YWluczpbZS5CQUNLU0xBU0hfRVNDQVBFXX0se2JlZ2luOi9cJFtAJTw/XF5cK1wqXS99XX0sdD17Y2xhc3NOYW1lOiJzdHJpbmciLApiZWdpbjovIi8sZW5kOi8iLyxjb250YWluczpbZS5CQUNLU0xBU0hfRVNDQVBFLG5dfSxhPXtjbGFzc05hbWU6InZhcmlhYmxlIiwKYmVnaW46L1wkXChbXHctXStccy8sZW5kOi9cKS8sa2V5d29yZHM6ewpidWlsdF9pbjoic3Vic3QgcGF0c3Vic3Qgc3RyaXAgZmluZHN0cmluZyBmaWx0ZXIgZmlsdGVyLW91dCBzb3J0IHdvcmQgd29yZGxpc3QgZmlyc3R3b3JkIGxhc3R3b3JkIGRpciBub3RkaXIgc3VmZml4IGJhc2VuYW1lIGFkZHN1ZmZpeCBhZGRwcmVmaXggam9pbiB3aWxkY2FyZCByZWFscGF0aCBhYnNwYXRoIGVycm9yIHdhcm5pbmcgc2hlbGwgb3JpZ2luIGZsYXZvciBmb3JlYWNoIGlmIG9yIGFuZCBjYWxsIGV2YWwgZmlsZSB2YWx1ZSIKfSxjb250YWluczpbbl19LGk9e2JlZ2luOiJeIitlLlVOREVSU0NPUkVfSURFTlRfUkUrIlxccyooPz1bOis/XT89KSJ9LHI9ewpjbGFzc05hbWU6InNlY3Rpb24iLGJlZ2luOi9eW15cc10rOi8sZW5kOi8kLyxjb250YWluczpbbl19O3JldHVybnsKbmFtZToiTWFrZWZpbGUiLGFsaWFzZXM6WyJtayIsIm1hayIsIm1ha2UiXSxrZXl3b3Jkczp7JHBhdHRlcm46L1tcdy1dKy8sCmtleXdvcmQ6ImRlZmluZSBlbmRlZiB1bmRlZmluZSBpZmRlZiBpZm5kZWYgaWZlcSBpZm5lcSBlbHNlIGVuZGlmIGluY2x1ZGUgLWluY2x1ZGUgc2luY2x1ZGUgb3ZlcnJpZGUgZXhwb3J0IHVuZXhwb3J0IHByaXZhdGUgdnBhdGgiCn0sY29udGFpbnM6W2UuSEFTSF9DT01NRU5UX01PREUsbix0LGEsaSx7Y2xhc3NOYW1lOiJtZXRhIixiZWdpbjovXlwuUEhPTlk6LywKZW5kOi8kLyxrZXl3b3Jkczp7JHBhdHRlcm46L1tcLlx3XSsvLGtleXdvcmQ6Ii5QSE9OWSJ9fSxyXX19LGdybXJfbWFya2Rvd246ZT0+ewpjb25zdCBuPXtiZWdpbjovPFwvP1tBLVphLXpfXS8sZW5kOiI+IixzdWJMYW5ndWFnZToieG1sIixyZWxldmFuY2U6MH0sdD17CnZhcmlhbnRzOlt7YmVnaW46L1xbLis/XF1cWy4qP1xdLyxyZWxldmFuY2U6MH0sewpiZWdpbjovXFsuKz9cXVwoKChkYXRhfGphdmFzY3JpcHR8bWFpbHRvKTp8KD86aHR0cHxmdHApcz86XC9cLykuKj9cKS8sCnJlbGV2YW5jZToyfSx7CmJlZ2luOmUucmVnZXguY29uY2F0KC9cWy4rP1xdXCgvLC9bQS1aYS16XVtBLVphLXowLTkrLi1dKi8sLzpcL1wvLio/XCkvKSwKcmVsZXZhbmNlOjJ9LHtiZWdpbjovXFsuKz9cXVwoWy4vPyYjXS4qP1wpLyxyZWxldmFuY2U6MX0sewpiZWdpbjovXFsuKj9cXVwoLio/XCkvLHJlbGV2YW5jZTowfV0scmV0dXJuQmVnaW46ITAsY29udGFpbnM6W3ttYXRjaDovXFsoPz1cXSkvCn0se2NsYXNzTmFtZToic3RyaW5nIixyZWxldmFuY2U6MCxiZWdpbjoiXFxbIixlbmQ6IlxcXSIsZXhjbHVkZUJlZ2luOiEwLApyZXR1cm5FbmQ6ITB9LHtjbGFzc05hbWU6ImxpbmsiLHJlbGV2YW5jZTowLGJlZ2luOiJcXF1cXCgiLGVuZDoiXFwpIiwKZXhjbHVkZUJlZ2luOiEwLGV4Y2x1ZGVFbmQ6ITB9LHtjbGFzc05hbWU6InN5bWJvbCIscmVsZXZhbmNlOjAsYmVnaW46IlxcXVxcWyIsCmVuZDoiXFxdIixleGNsdWRlQmVnaW46ITAsZXhjbHVkZUVuZDohMH1dfSxhPXtjbGFzc05hbWU6InN0cm9uZyIsY29udGFpbnM6W10sCnZhcmlhbnRzOlt7YmVnaW46L197Mn0oPyFccykvLGVuZDovX3syfS99LHtiZWdpbjovXCp7Mn0oPyFccykvLGVuZDovXCp7Mn0vfV0KfSxpPXtjbGFzc05hbWU6ImVtcGhhc2lzIixjb250YWluczpbXSx2YXJpYW50czpbe2JlZ2luOi9cKig/IVsqXHNdKS8sZW5kOi9cKi99LHsKYmVnaW46L18oPyFbX1xzXSkvLGVuZDovXy8scmVsZXZhbmNlOjB9XX0scj1lLmluaGVyaXQoYSx7Y29udGFpbnM6W10KfSkscz1lLmluaGVyaXQoaSx7Y29udGFpbnM6W119KTthLmNvbnRhaW5zLnB1c2gocyksaS5jb250YWlucy5wdXNoKHIpCjtsZXQgbz1bbix0XTtyZXR1cm5bYSxpLHIsc10uZm9yRWFjaCgoZT0+e2UuY29udGFpbnM9ZS5jb250YWlucy5jb25jYXQobykKfSkpLG89by5jb25jYXQoYSxpKSx7bmFtZToiTWFya2Rvd24iLGFsaWFzZXM6WyJtZCIsIm1rZG93biIsIm1rZCJdLGNvbnRhaW5zOlt7CmNsYXNzTmFtZToic2VjdGlvbiIsdmFyaWFudHM6W3tiZWdpbjoiXiN7MSw2fSIsZW5kOiIkIixjb250YWluczpvfSx7CmJlZ2luOiIoPz1eLis/XFxuWz0tXXsyLH0kKSIsY29udGFpbnM6W3tiZWdpbjoiXls9LV0qJCJ9LHtiZWdpbjoiXiIsZW5kOiJcXG4iLApjb250YWluczpvfV19XX0sbix7Y2xhc3NOYW1lOiJidWxsZXQiLGJlZ2luOiJeWyBcdF0qKFsqKy1dfChcXGQrXFwuKSkoPz1cXHMrKSIsCmVuZDoiXFxzKyIsZXhjbHVkZUVuZDohMH0sYSxpLHtjbGFzc05hbWU6InF1b3RlIixiZWdpbjoiXj5cXHMrIixjb250YWluczpvLAplbmQ6IiQifSx7Y2xhc3NOYW1lOiJjb2RlIix2YXJpYW50czpbe2JlZ2luOiIoYHszLH0pW15gXSgufFxcbikqP1xcMWAqWyBdKiJ9LHsKYmVnaW46Iih+ezMsfSlbXn5dKC58XFxuKSo/XFwxfipbIF0qIn0se2JlZ2luOiJgYGAiLGVuZDoiYGBgK1sgXSokIn0sewpiZWdpbjoifn5+IixlbmQ6In5+fitbIF0qJCJ9LHtiZWdpbjoiYC4rP2AifSx7YmVnaW46Iig/PV4oIHs0fXxcXHQpKSIsCmNvbnRhaW5zOlt7YmVnaW46Il4oIHs0fXxcXHQpIixlbmQ6IihcXG4pJCJ9XSxyZWxldmFuY2U6MH1dfSx7CmJlZ2luOiJeWy1cXCpdezMsfSIsZW5kOiIkIn0sdCx7YmVnaW46L15cW1teXG5dK1xdOi8scmV0dXJuQmVnaW46ITAsY29udGFpbnM6W3sKY2xhc3NOYW1lOiJzeW1ib2wiLGJlZ2luOi9cWy8sZW5kOi9cXS8sZXhjbHVkZUJlZ2luOiEwLGV4Y2x1ZGVFbmQ6ITB9LHsKY2xhc3NOYW1lOiJsaW5rIixiZWdpbjovOlxzKi8sZW5kOi8kLyxleGNsdWRlQmVnaW46ITB9XX1dfX0sZ3Jtcl9vYmplY3RpdmVjOmU9PnsKY29uc3Qgbj0vW2EtekEtWkBdW2EtekEtWjAtOV9dKi8sdD17JHBhdHRlcm46biwKa2V5d29yZDpbIkBpbnRlcmZhY2UiLCJAY2xhc3MiLCJAcHJvdG9jb2wiLCJAaW1wbGVtZW50YXRpb24iXX07cmV0dXJuewpuYW1lOiJPYmplY3RpdmUtQyIsYWxpYXNlczpbIm1tIiwib2JqYyIsIm9iai1jIiwib2JqLWMrKyIsIm9iamVjdGl2ZS1jKysiXSwKa2V5d29yZHM6eyJ2YXJpYWJsZS5sYW5ndWFnZSI6WyJ0aGlzIiwic3VwZXIiXSwkcGF0dGVybjpuLAprZXl3b3JkOlsid2hpbGUiLCJleHBvcnQiLCJzaXplb2YiLCJ0eXBlZGVmIiwiY29uc3QiLCJzdHJ1Y3QiLCJmb3IiLCJ1bmlvbiIsInZvbGF0aWxlIiwic3RhdGljIiwibXV0YWJsZSIsImlmIiwiZG8iLCJyZXR1cm4iLCJnb3RvIiwiZW51bSIsImVsc2UiLCJicmVhayIsImV4dGVybiIsImFzbSIsImNhc2UiLCJkZWZhdWx0IiwicmVnaXN0ZXIiLCJleHBsaWNpdCIsInR5cGVuYW1lIiwic3dpdGNoIiwiY29udGludWUiLCJpbmxpbmUiLCJyZWFkb25seSIsImFzc2lnbiIsInJlYWR3cml0ZSIsInNlbGYiLCJAc3luY2hyb25pemVkIiwiaWQiLCJ0eXBlb2YiLCJub25hdG9taWMiLCJJQk91dGxldCIsIklCQWN0aW9uIiwic3Ryb25nIiwid2VhayIsImNvcHkiLCJpbiIsIm91dCIsImlub3V0IiwiYnljb3B5IiwiYnlyZWYiLCJvbmV3YXkiLCJfX3N0cm9uZyIsIl9fd2VhayIsIl9fYmxvY2siLCJfX2F1dG9yZWxlYXNpbmciLCJAcHJpdmF0ZSIsIkBwcm90ZWN0ZWQiLCJAcHVibGljIiwiQHRyeSIsIkBwcm9wZXJ0eSIsIkBlbmQiLCJAdGhyb3ciLCJAY2F0Y2giLCJAZmluYWxseSIsIkBhdXRvcmVsZWFzZXBvb2wiLCJAc3ludGhlc2l6ZSIsIkBkeW5hbWljIiwiQHNlbGVjdG9yIiwiQG9wdGlvbmFsIiwiQHJlcXVpcmVkIiwiQGVuY29kZSIsIkBwYWNrYWdlIiwiQGltcG9ydCIsIkBkZWZzIiwiQGNvbXBhdGliaWxpdHlfYWxpYXMiLCJfX2JyaWRnZSIsIl9fYnJpZGdlX3RyYW5zZmVyIiwiX19icmlkZ2VfcmV0YWluZWQiLCJfX2JyaWRnZV9yZXRhaW4iLCJfX2NvdmFyaWFudCIsIl9fY29udHJhdmFyaWFudCIsIl9fa2luZG9mIiwiX05vbm51bGwiLCJfTnVsbGFibGUiLCJfTnVsbF91bnNwZWNpZmllZCIsIl9fRlVOQ1RJT05fXyIsIl9fUFJFVFRZX0ZVTkNUSU9OX18iLCJfX2F0dHJpYnV0ZV9fIiwiZ2V0dGVyIiwic2V0dGVyIiwicmV0YWluIiwidW5zYWZlX3VucmV0YWluZWQiLCJub25udWxsIiwibnVsbGFibGUiLCJudWxsX3Vuc3BlY2lmaWVkIiwibnVsbF9yZXNldHRhYmxlIiwiY2xhc3MiLCJpbnN0YW5jZXR5cGUiLCJOU19ERVNJR05BVEVEX0lOSVRJQUxJWkVSIiwiTlNfVU5BVkFJTEFCTEUiLCJOU19SRVFVSVJFU19TVVBFUiIsIk5TX1JFVFVSTlNfSU5ORVJfUE9JTlRFUiIsIk5TX0lOTElORSIsIk5TX0FWQUlMQUJMRSIsIk5TX0RFUFJFQ0FURUQiLCJOU19FTlVNIiwiTlNfT1BUSU9OUyIsIk5TX1NXSUZUX1VOQVZBSUxBQkxFIiwiTlNfQVNTVU1FX05PTk5VTExfQkVHSU4iLCJOU19BU1NVTUVfTk9OTlVMTF9FTkQiLCJOU19SRUZJTkVEX0ZPUl9TV0lGVCIsIk5TX1NXSUZUX05BTUUiLCJOU19TV0lGVF9OT1RIUk9XIiwiTlNfRFVSSU5HIiwiTlNfSEFORExFUiIsIk5TX0VOREhBTkRMRVIiLCJOU19WQUxVRVJFVFVSTiIsIk5TX1ZPSURSRVRVUk4iXSwKbGl0ZXJhbDpbImZhbHNlIiwidHJ1ZSIsIkZBTFNFIiwiVFJVRSIsIm5pbCIsIllFUyIsIk5PIiwiTlVMTCJdLApidWlsdF9pbjpbImRpc3BhdGNoX29uY2VfdCIsImRpc3BhdGNoX3F1ZXVlX3QiLCJkaXNwYXRjaF9zeW5jIiwiZGlzcGF0Y2hfYXN5bmMiLCJkaXNwYXRjaF9vbmNlIl0sCnR5cGU6WyJpbnQiLCJmbG9hdCIsImNoYXIiLCJ1bnNpZ25lZCIsInNpZ25lZCIsInNob3J0IiwibG9uZyIsImRvdWJsZSIsIndjaGFyX3QiLCJ1bmljaGFyIiwidm9pZCIsImJvb2wiLCJCT09MIiwiaWR8MCIsIl9Cb29sIl0KfSxpbGxlZ2FsOiI8LyIsY29udGFpbnM6W3tjbGFzc05hbWU6ImJ1aWx0X2luIiwKYmVnaW46IlxcYihBVnxDQXxDRnxDR3xDSXxDTHxDTXxDTnxDVHxNS3xNUHxNVEt8TVRMfE5TfFNDTnxTS3xVSXxXS3xYQylcXHcrIgp9LGUuQ19MSU5FX0NPTU1FTlRfTU9ERSxlLkNfQkxPQ0tfQ09NTUVOVF9NT0RFLGUuQ19OVU1CRVJfTU9ERSxlLlFVT1RFX1NUUklOR19NT0RFLGUuQVBPU19TVFJJTkdfTU9ERSx7CmNsYXNzTmFtZToic3RyaW5nIix2YXJpYW50czpbe2JlZ2luOidAIicsZW5kOiciJyxpbGxlZ2FsOiJcXG4iLApjb250YWluczpbZS5CQUNLU0xBU0hfRVNDQVBFXX1dfSx7Y2xhc3NOYW1lOiJtZXRhIixiZWdpbjovI1xzKlthLXpdK1xiLyxlbmQ6LyQvLAprZXl3b3Jkczp7CmtleXdvcmQ6ImlmIGVsc2UgZWxpZiBlbmRpZiBkZWZpbmUgdW5kZWYgd2FybmluZyBlcnJvciBsaW5lIHByYWdtYSBpZmRlZiBpZm5kZWYgaW5jbHVkZSIKfSxjb250YWluczpbe2JlZ2luOi9cXFxuLyxyZWxldmFuY2U6MH0sZS5pbmhlcml0KGUuUVVPVEVfU1RSSU5HX01PREUsewpjbGFzc05hbWU6InN0cmluZyJ9KSx7Y2xhc3NOYW1lOiJzdHJpbmciLGJlZ2luOi88Lio/Pi8sZW5kOi8kLyxpbGxlZ2FsOiJcXG4iCn0sZS5DX0xJTkVfQ09NTUVOVF9NT0RFLGUuQ19CTE9DS19DT01NRU5UX01PREVdfSx7Y2xhc3NOYW1lOiJjbGFzcyIsCmJlZ2luOiIoIit0LmtleXdvcmQuam9pbigifCIpKyIpXFxiIixlbmQ6Lyhce3wkKS8sZXhjbHVkZUVuZDohMCxrZXl3b3Jkczp0LApjb250YWluczpbZS5VTkRFUlNDT1JFX1RJVExFX01PREVdfSx7YmVnaW46IlxcLiIrZS5VTkRFUlNDT1JFX0lERU5UX1JFLApyZWxldmFuY2U6MH1dfX0sZ3Jtcl9wZXJsOmU9Pntjb25zdCBuPWUucmVnZXgsdD0vW2R1YWx4bXNpcG5ncl17MCwxMn0vLGE9ewokcGF0dGVybjovW1x3Ll0rLywKa2V5d29yZDoiYWJzIGFjY2VwdCBhbGFybSBhbmQgYXRhbjIgYmluZCBiaW5tb2RlIGJsZXNzIGJyZWFrIGNhbGxlciBjaGRpciBjaG1vZCBjaG9tcCBjaG9wIGNob3duIGNociBjaHJvb3QgY2xvc2UgY2xvc2VkaXIgY29ubmVjdCBjb250aW51ZSBjb3MgY3J5cHQgZGJtY2xvc2UgZGJtb3BlbiBkZWZpbmVkIGRlbGV0ZSBkaWUgZG8gZHVtcCBlYWNoIGVsc2UgZWxzaWYgZW5kZ3JlbnQgZW5kaG9zdGVudCBlbmRuZXRlbnQgZW5kcHJvdG9lbnQgZW5kcHdlbnQgZW5kc2VydmVudCBlb2YgZXZhbCBleGVjIGV4aXN0cyBleGl0IGV4cCBmY250bCBmaWxlbm8gZmxvY2sgZm9yIGZvcmVhY2ggZm9yayBmb3JtYXQgZm9ybWxpbmUgZ2V0YyBnZXRncmVudCBnZXRncmdpZCBnZXRncm5hbSBnZXRob3N0YnlhZGRyIGdldGhvc3RieW5hbWUgZ2V0aG9zdGVudCBnZXRsb2dpbiBnZXRuZXRieWFkZHIgZ2V0bmV0YnluYW1lIGdldG5ldGVudCBnZXRwZWVybmFtZSBnZXRwZ3JwIGdldHByaW9yaXR5IGdldHByb3RvYnluYW1lIGdldHByb3RvYnludW1iZXIgZ2V0cHJvdG9lbnQgZ2V0cHdlbnQgZ2V0cHduYW0gZ2V0cHd1aWQgZ2V0c2VydmJ5bmFtZSBnZXRzZXJ2Ynlwb3J0IGdldHNlcnZlbnQgZ2V0c29ja25hbWUgZ2V0c29ja29wdCBnaXZlbiBnbG9iIGdtdGltZSBnb3RvIGdyZXAgZ3QgaGV4IGlmIGluZGV4IGludCBpb2N0bCBqb2luIGtleXMga2lsbCBsYXN0IGxjIGxjZmlyc3QgbGVuZ3RoIGxpbmsgbGlzdGVuIGxvY2FsIGxvY2FsdGltZSBsb2cgbHN0YXQgbHQgbWEgbWFwIG1rZGlyIG1zZ2N0bCBtc2dnZXQgbXNncmN2IG1zZ3NuZCBteSBuZSBuZXh0IG5vIG5vdCBvY3Qgb3BlbiBvcGVuZGlyIG9yIG9yZCBvdXIgcGFjayBwYWNrYWdlIHBpcGUgcG9wIHBvcyBwcmludCBwcmludGYgcHJvdG90eXBlIHB1c2ggcXwwIHFxIHF1b3RlbWV0YSBxdyBxeCByYW5kIHJlYWQgcmVhZGRpciByZWFkbGluZSByZWFkbGluayByZWFkcGlwZSByZWN2IHJlZG8gcmVmIHJlbmFtZSByZXF1aXJlIHJlc2V0IHJldHVybiByZXZlcnNlIHJld2luZGRpciByaW5kZXggcm1kaXIgc2F5IHNjYWxhciBzZWVrIHNlZWtkaXIgc2VsZWN0IHNlbWN0bCBzZW1nZXQgc2Vtb3Agc2VuZCBzZXRncmVudCBzZXRob3N0ZW50IHNldG5ldGVudCBzZXRwZ3JwIHNldHByaW9yaXR5IHNldHByb3RvZW50IHNldHB3ZW50IHNldHNlcnZlbnQgc2V0c29ja29wdCBzaGlmdCBzaG1jdGwgc2htZ2V0IHNobXJlYWQgc2htd3JpdGUgc2h1dGRvd24gc2luIHNsZWVwIHNvY2tldCBzb2NrZXRwYWlyIHNvcnQgc3BsaWNlIHNwbGl0IHNwcmludGYgc3FydCBzcmFuZCBzdGF0IHN0YXRlIHN0dWR5IHN1YiBzdWJzdHIgc3ltbGluayBzeXNjYWxsIHN5c29wZW4gc3lzcmVhZCBzeXNzZWVrIHN5c3RlbSBzeXN3cml0ZSB0ZWxsIHRlbGxkaXIgdGllIHRpZWQgdGltZSB0aW1lcyB0ciB0cnVuY2F0ZSB1YyB1Y2ZpcnN0IHVtYXNrIHVuZGVmIHVubGVzcyB1bmxpbmsgdW5wYWNrIHVuc2hpZnQgdW50aWUgdW50aWwgdXNlIHV0aW1lIHZhbHVlcyB2ZWMgd2FpdCB3YWl0cGlkIHdhbnRhcnJheSB3YXJuIHdoZW4gd2hpbGUgd3JpdGUgeHwwIHhvciB5fDAiCn0saT17Y2xhc3NOYW1lOiJzdWJzdCIsYmVnaW46IlskQF1cXHsiLGVuZDoiXFx9IixrZXl3b3JkczphfSxyPXtiZWdpbjovLT5cey8sCmVuZDovXH0vfSxzPXt2YXJpYW50czpbe2JlZ2luOi9cJFxkL30sewpiZWdpbjpuLmNvbmNhdCgvWyQlQF0oXF5cd1xifCNcdysoOjpcdyspKnxce1x3K1x9fFx3Kyg6Olx3KikqKS8sIig/IVtBLVphLXpdKSg/IVtAJCVdKSIpCn0se2JlZ2luOi9bJCVAXVteXHNcd3tdLyxyZWxldmFuY2U6MH1dCn0sbz1bZS5CQUNLU0xBU0hfRVNDQVBFLGksc10sbD1bLyEvLC9cLy8sL1x8LywvXD8vLC8nLywvIi8sLyMvXSxjPShlLGEsaT0iXFwxIik9PnsKY29uc3Qgcj0iXFwxIj09PWk/aTpuLmNvbmNhdChpLGEpCjtyZXR1cm4gbi5jb25jYXQobi5jb25jYXQoIig/OiIsZSwiKSIpLGEsLyg/OlxcLnxbXlxcXC9dKSo/LyxyLC8oPzpcXC58W15cXFwvXSkqPy8saSx0KQp9LGQ9KGUsYSxpKT0+bi5jb25jYXQobi5jb25jYXQoIig/OiIsZSwiKSIpLGEsLyg/OlxcLnxbXlxcXC9dKSo/LyxpLHQpLGc9W3MsZS5IQVNIX0NPTU1FTlRfTU9ERSxlLkNPTU1FTlQoL149XHcvLC89Y3V0Lyx7CmVuZHNXaXRoUGFyZW50OiEwfSkscix7Y2xhc3NOYW1lOiJzdHJpbmciLGNvbnRhaW5zOm8sdmFyaWFudHM6W3sKYmVnaW46InFbcXd4cl0/XFxzKlxcKCIsZW5kOiJcXCkiLHJlbGV2YW5jZTo1fSx7YmVnaW46InFbcXd4cl0/XFxzKlxcWyIsCmVuZDoiXFxdIixyZWxldmFuY2U6NX0se2JlZ2luOiJxW3F3eHJdP1xccypcXHsiLGVuZDoiXFx9IixyZWxldmFuY2U6NX0sewpiZWdpbjoicVtxd3hyXT9cXHMqXFx8IixlbmQ6IlxcfCIscmVsZXZhbmNlOjV9LHtiZWdpbjoicVtxd3hyXT9cXHMqPCIsZW5kOiI+IiwKcmVsZXZhbmNlOjV9LHtiZWdpbjoicXdcXHMrcSIsZW5kOiJxIixyZWxldmFuY2U6NX0se2JlZ2luOiInIixlbmQ6IiciLApjb250YWluczpbZS5CQUNLU0xBU0hfRVNDQVBFXX0se2JlZ2luOiciJyxlbmQ6JyInfSx7YmVnaW46ImAiLGVuZDoiYCIsCmNvbnRhaW5zOltlLkJBQ0tTTEFTSF9FU0NBUEVdfSx7YmVnaW46L1x7XHcrXH0vLHJlbGV2YW5jZTowfSx7CmJlZ2luOiItP1xcdytcXHMqPT4iLHJlbGV2YW5jZTowfV19LHtjbGFzc05hbWU6Im51bWJlciIsCmJlZ2luOiIoXFxiMFswLTdfXSspfChcXGIweFswLTlhLWZBLUZfXSspfChcXGJbMS05XVswLTlfXSooXFwuWzAtOV9dKyk/KXxbMF9dXFxiIiwKcmVsZXZhbmNlOjB9LHsKYmVnaW46IihcXC9cXC98IitlLlJFX1NUQVJURVJTX1JFKyJ8XFxiKHNwbGl0fHJldHVybnxwcmludHxyZXZlcnNlfGdyZXApXFxiKVxccyoiLAprZXl3b3Jkczoic3BsaXQgcmV0dXJuIHByaW50IHJldmVyc2UgZ3JlcCIscmVsZXZhbmNlOjAsCmNvbnRhaW5zOltlLkhBU0hfQ09NTUVOVF9NT0RFLHtjbGFzc05hbWU6InJlZ2V4cCIsdmFyaWFudHM6W3sKYmVnaW46Yygic3x0cnx5IixuLmVpdGhlciguLi5sLHtjYXB0dXJlOiEwfSkpfSx7YmVnaW46Yygic3x0cnx5IiwiXFwoIiwiXFwpIil9LHsKYmVnaW46Yygic3x0cnx5IiwiXFxbIiwiXFxdIil9LHtiZWdpbjpjKCJzfHRyfHkiLCJcXHsiLCJcXH0iKX1dLHJlbGV2YW5jZToyfSx7CmNsYXNzTmFtZToicmVnZXhwIix2YXJpYW50czpbe2JlZ2luOi8obXxxcilcL1wvLyxyZWxldmFuY2U6MH0sewpiZWdpbjpkKCIoPzptfHFyKT8iLC9cLy8sL1wvLyl9LHtiZWdpbjpkKCJtfHFyIixuLmVpdGhlciguLi5sLHtjYXB0dXJlOiEwCn0pLC9cMS8pfSx7YmVnaW46ZCgibXxxciIsL1woLywvXCkvKX0se2JlZ2luOmQoIm18cXIiLC9cWy8sL1xdLyl9LHsKYmVnaW46ZCgibXxxciIsL1x7LywvXH0vKX1dfV19LHtjbGFzc05hbWU6ImZ1bmN0aW9uIixiZWdpbktleXdvcmRzOiJzdWIiLAplbmQ6IihcXHMqXFwoLio/XFwpKT9bO3tdIixleGNsdWRlRW5kOiEwLHJlbGV2YW5jZTo1LGNvbnRhaW5zOltlLlRJVExFX01PREVdfSx7CmJlZ2luOiItXFx3XFxiIixyZWxldmFuY2U6MH0se2JlZ2luOiJeX19EQVRBX18kIixlbmQ6Il5fX0VORF9fJCIsCnN1Ykxhbmd1YWdlOiJtb2pvbGljaW91cyIsY29udGFpbnM6W3tiZWdpbjoiXkBALioiLGVuZDoiJCIsY2xhc3NOYW1lOiJjb21tZW50In1dCn1dO3JldHVybiBpLmNvbnRhaW5zPWcsci5jb250YWlucz1nLHtuYW1lOiJQZXJsIixhbGlhc2VzOlsicGwiLCJwbSJdLGtleXdvcmRzOmEsCmNvbnRhaW5zOmd9fSxncm1yX3BocDplPT57CmNvbnN0IG49ZS5yZWdleCx0PS8oPyFbQS1aYS16MC05XSkoPyFbJF0pLyxhPW4uY29uY2F0KC9bYS16QS1aX1x4N2YtXHhmZl1bYS16QS1aMC05X1x4N2YtXHhmZl0qLyx0KSxpPW4uY29uY2F0KC8oXFw/W0EtWl1bYS16MC05X1x4N2YtXHhmZl0rfFxcP1tBLVpdKyg/PVtBLVpdW2EtejAtOV9ceDdmLVx4ZmZdKSl7MSx9Lyx0KSxyPXsKc2NvcGU6InZhcmlhYmxlIixtYXRjaDoiXFwkKyIrYX0scz17c2NvcGU6InN1YnN0Iix2YXJpYW50czpbe2JlZ2luOi9cJFx3Ky99LHsKYmVnaW46L1x7XCQvLGVuZDovXH0vfV19LG89ZS5pbmhlcml0KGUuQVBPU19TVFJJTkdfTU9ERSx7aWxsZWdhbDpudWxsCn0pLGw9IlsgXHRcbl0iLGM9e3Njb3BlOiJzdHJpbmciLHZhcmlhbnRzOltlLmluaGVyaXQoZS5RVU9URV9TVFJJTkdfTU9ERSx7CmlsbGVnYWw6bnVsbCxjb250YWluczplLlFVT1RFX1NUUklOR19NT0RFLmNvbnRhaW5zLmNvbmNhdChzKX0pLG8sewpiZWdpbjovPDw8WyBcdF0qKD86KFx3Kyl8IihcdyspIilcbi8sZW5kOi9bIFx0XSooXHcrKVxiLywKY29udGFpbnM6ZS5RVU9URV9TVFJJTkdfTU9ERS5jb250YWlucy5jb25jYXQocyksIm9uOmJlZ2luIjooZSxuKT0+ewpuLmRhdGEuX2JlZ2luTWF0Y2g9ZVsxXXx8ZVsyXX0sIm9uOmVuZCI6KGUsbik9PnsKbi5kYXRhLl9iZWdpbk1hdGNoIT09ZVsxXSYmbi5pZ25vcmVNYXRjaCgpfX0sZS5FTkRfU0FNRV9BU19CRUdJTih7CmJlZ2luOi88PDxbIFx0XSonKFx3KyknXG4vLGVuZDovWyBcdF0qKFx3KylcYi99KV19LGQ9e3Njb3BlOiJudW1iZXIiLHZhcmlhbnRzOlt7CmJlZ2luOiJcXGIwW2JCXVswMV0rKD86X1swMV0rKSpcXGIifSx7YmVnaW46IlxcYjBbb09dWzAtN10rKD86X1swLTddKykqXFxiIn0sewpiZWdpbjoiXFxiMFt4WF1bXFxkYS1mQS1GXSsoPzpfW1xcZGEtZkEtRl0rKSpcXGIifSx7CmJlZ2luOiIoPzpcXGJcXGQrKD86X1xcZCspKihcXC4oPzpcXGQrKD86X1xcZCspKikpP3xcXEJcXC5cXGQrKSg/OltlRV1bKy1dP1xcZCspPyIKfV0scmVsZXZhbmNlOjAKfSxnPVsiZmFsc2UiLCJudWxsIiwidHJ1ZSJdLHU9WyJfX0NMQVNTX18iLCJfX0RJUl9fIiwiX19GSUxFX18iLCJfX0ZVTkNUSU9OX18iLCJfX0NPTVBJTEVSX0hBTFRfT0ZGU0VUX18iLCJfX0xJTkVfXyIsIl9fTUVUSE9EX18iLCJfX05BTUVTUEFDRV9fIiwiX19UUkFJVF9fIiwiZGllIiwiZWNobyIsImV4aXQiLCJpbmNsdWRlIiwiaW5jbHVkZV9vbmNlIiwicHJpbnQiLCJyZXF1aXJlIiwicmVxdWlyZV9vbmNlIiwiYXJyYXkiLCJhYnN0cmFjdCIsImFuZCIsImFzIiwiYmluYXJ5IiwiYm9vbCIsImJvb2xlYW4iLCJicmVhayIsImNhbGxhYmxlIiwiY2FzZSIsImNhdGNoIiwiY2xhc3MiLCJjbG9uZSIsImNvbnN0IiwiY29udGludWUiLCJkZWNsYXJlIiwiZGVmYXVsdCIsImRvIiwiZG91YmxlIiwiZWxzZSIsImVsc2VpZiIsImVtcHR5IiwiZW5kZGVjbGFyZSIsImVuZGZvciIsImVuZGZvcmVhY2giLCJlbmRpZiIsImVuZHN3aXRjaCIsImVuZHdoaWxlIiwiZW51bSIsImV2YWwiLCJleHRlbmRzIiwiZmluYWwiLCJmaW5hbGx5IiwiZmxvYXQiLCJmb3IiLCJmb3JlYWNoIiwiZnJvbSIsImdsb2JhbCIsImdvdG8iLCJpZiIsImltcGxlbWVudHMiLCJpbnN0YW5jZW9mIiwiaW5zdGVhZG9mIiwiaW50IiwiaW50ZWdlciIsImludGVyZmFjZSIsImlzc2V0IiwiaXRlcmFibGUiLCJsaXN0IiwibWF0Y2h8MCIsIm1peGVkIiwibmV3IiwibmV2ZXIiLCJvYmplY3QiLCJvciIsInByaXZhdGUiLCJwcm90ZWN0ZWQiLCJwdWJsaWMiLCJyZWFkb25seSIsInJlYWwiLCJyZXR1cm4iLCJzdHJpbmciLCJzd2l0Y2giLCJ0aHJvdyIsInRyYWl0IiwidHJ5IiwidW5zZXQiLCJ1c2UiLCJ2YXIiLCJ2b2lkIiwid2hpbGUiLCJ4b3IiLCJ5aWVsZCJdLGI9WyJFcnJvcnwwIiwiQXBwZW5kSXRlcmF0b3IiLCJBcmd1bWVudENvdW50RXJyb3IiLCJBcml0aG1ldGljRXJyb3IiLCJBcnJheUl0ZXJhdG9yIiwiQXJyYXlPYmplY3QiLCJBc3NlcnRpb25FcnJvciIsIkJhZEZ1bmN0aW9uQ2FsbEV4Y2VwdGlvbiIsIkJhZE1ldGhvZENhbGxFeGNlcHRpb24iLCJDYWNoaW5nSXRlcmF0b3IiLCJDYWxsYmFja0ZpbHRlckl0ZXJhdG9yIiwiQ29tcGlsZUVycm9yIiwiQ291bnRhYmxlIiwiRGlyZWN0b3J5SXRlcmF0b3IiLCJEaXZpc2lvbkJ5WmVyb0Vycm9yIiwiRG9tYWluRXhjZXB0aW9uIiwiRW1wdHlJdGVyYXRvciIsIkVycm9yRXhjZXB0aW9uIiwiRXhjZXB0aW9uIiwiRmlsZXN5c3RlbUl0ZXJhdG9yIiwiRmlsdGVySXRlcmF0b3IiLCJHbG9iSXRlcmF0b3IiLCJJbmZpbml0ZUl0ZXJhdG9yIiwiSW52YWxpZEFyZ3VtZW50RXhjZXB0aW9uIiwiSXRlcmF0b3JJdGVyYXRvciIsIkxlbmd0aEV4Y2VwdGlvbiIsIkxpbWl0SXRlcmF0b3IiLCJMb2dpY0V4Y2VwdGlvbiIsIk11bHRpcGxlSXRlcmF0b3IiLCJOb1Jld2luZEl0ZXJhdG9yIiwiT3V0T2ZCb3VuZHNFeGNlcHRpb24iLCJPdXRPZlJhbmdlRXhjZXB0aW9uIiwiT3V0ZXJJdGVyYXRvciIsIk92ZXJmbG93RXhjZXB0aW9uIiwiUGFyZW50SXRlcmF0b3IiLCJQYXJzZUVycm9yIiwiUmFuZ2VFeGNlcHRpb24iLCJSZWN1cnNpdmVBcnJheUl0ZXJhdG9yIiwiUmVjdXJzaXZlQ2FjaGluZ0l0ZXJhdG9yIiwiUmVjdXJzaXZlQ2FsbGJhY2tGaWx0ZXJJdGVyYXRvciIsIlJlY3Vyc2l2ZURpcmVjdG9yeUl0ZXJhdG9yIiwiUmVjdXJzaXZlRmlsdGVySXRlcmF0b3IiLCJSZWN1cnNpdmVJdGVyYXRvciIsIlJlY3Vyc2l2ZUl0ZXJhdG9ySXRlcmF0b3IiLCJSZWN1cnNpdmVSZWdleEl0ZXJhdG9yIiwiUmVjdXJzaXZlVHJlZUl0ZXJhdG9yIiwiUmVnZXhJdGVyYXRvciIsIlJ1bnRpbWVFeGNlcHRpb24iLCJTZWVrYWJsZUl0ZXJhdG9yIiwiU3BsRG91Ymx5TGlua2VkTGlzdCIsIlNwbEZpbGVJbmZvIiwiU3BsRmlsZU9iamVjdCIsIlNwbEZpeGVkQXJyYXkiLCJTcGxIZWFwIiwiU3BsTWF4SGVhcCIsIlNwbE1pbkhlYXAiLCJTcGxPYmplY3RTdG9yYWdlIiwiU3BsT2JzZXJ2ZXIiLCJTcGxQcmlvcml0eVF1ZXVlIiwiU3BsUXVldWUiLCJTcGxTdGFjayIsIlNwbFN1YmplY3QiLCJTcGxUZW1wRmlsZU9iamVjdCIsIlR5cGVFcnJvciIsIlVuZGVyZmxvd0V4Y2VwdGlvbiIsIlVuZXhwZWN0ZWRWYWx1ZUV4Y2VwdGlvbiIsIlVuaGFuZGxlZE1hdGNoRXJyb3IiLCJBcnJheUFjY2VzcyIsIkJhY2tlZEVudW0iLCJDbG9zdXJlIiwiRmliZXIiLCJHZW5lcmF0b3IiLCJJdGVyYXRvciIsIkl0ZXJhdG9yQWdncmVnYXRlIiwiU2VyaWFsaXphYmxlIiwiU3RyaW5nYWJsZSIsIlRocm93YWJsZSIsIlRyYXZlcnNhYmxlIiwiVW5pdEVudW0iLCJXZWFrUmVmZXJlbmNlIiwiV2Vha01hcCIsIkRpcmVjdG9yeSIsIl9fUEhQX0luY29tcGxldGVfQ2xhc3MiLCJwYXJlbnQiLCJwaHBfdXNlcl9maWx0ZXIiLCJzZWxmIiwic3RhdGljIiwic3RkQ2xhc3MiXSxtPXsKa2V5d29yZDp1LGxpdGVyYWw6KGU9Pntjb25zdCBuPVtdO3JldHVybiBlLmZvckVhY2goKGU9PnsKbi5wdXNoKGUpLGUudG9Mb3dlckNhc2UoKT09PWU/bi5wdXNoKGUudG9VcHBlckNhc2UoKSk6bi5wdXNoKGUudG9Mb3dlckNhc2UoKSkKfSkpLG59KShnKSxidWlsdF9pbjpifSxwPWU9PmUubWFwKChlPT5lLnJlcGxhY2UoL1x8XGQrJC8sIiIpKSksXz17dmFyaWFudHM6W3sKbWF0Y2g6Wy9uZXcvLG4uY29uY2F0KGwsIisiKSxuLmNvbmNhdCgiKD8hIixwKGIpLmpvaW4oIlxcYnwiKSwiXFxiKSIpLGldLHNjb3BlOnsKMToia2V5d29yZCIsNDoidGl0bGUuY2xhc3MifX1dfSxoPW4uY29uY2F0KGEsIlxcYig/IVxcKCkiKSxmPXt2YXJpYW50czpbewptYXRjaDpbbi5jb25jYXQoLzo6LyxuLmxvb2thaGVhZCgvKD8hY2xhc3NcYikvKSksaF0sc2NvcGU6ezI6InZhcmlhYmxlLmNvbnN0YW50Igp9fSx7bWF0Y2g6Wy86Oi8sL2NsYXNzL10sc2NvcGU6ezI6InZhcmlhYmxlLmxhbmd1YWdlIn19LHsKbWF0Y2g6W2ksbi5jb25jYXQoLzo6LyxuLmxvb2thaGVhZCgvKD8hY2xhc3NcYikvKSksaF0sc2NvcGU6ezE6InRpdGxlLmNsYXNzIiwKMzoidmFyaWFibGUuY29uc3RhbnQifX0se21hdGNoOltpLG4uY29uY2F0KCI6OiIsbi5sb29rYWhlYWQoLyg/IWNsYXNzXGIpLykpXSwKc2NvcGU6ezE6InRpdGxlLmNsYXNzIn19LHttYXRjaDpbaSwvOjovLC9jbGFzcy9dLHNjb3BlOnsxOiJ0aXRsZS5jbGFzcyIsCjM6InZhcmlhYmxlLmxhbmd1YWdlIn19XX0sRT17c2NvcGU6ImF0dHIiLAptYXRjaDpuLmNvbmNhdChhLG4ubG9va2FoZWFkKCI6Iiksbi5sb29rYWhlYWQoLyg/ITo6KS8pKX0seT17cmVsZXZhbmNlOjAsCmJlZ2luOi9cKC8sZW5kOi9cKS8sa2V5d29yZHM6bSxjb250YWluczpbRSxyLGYsZS5DX0JMT0NLX0NPTU1FTlRfTU9ERSxjLGQsX10KfSxOPXtyZWxldmFuY2U6MCwKbWF0Y2g6Wy9cYi8sbi5jb25jYXQoIig/IWZuXFxifGZ1bmN0aW9uXFxifCIscCh1KS5qb2luKCJcXGJ8IiksInwiLHAoYikuam9pbigiXFxifCIpLCJcXGIpIiksYSxuLmNvbmNhdChsLCIqIiksbi5sb29rYWhlYWQoLyg/PVwoKS8pXSwKc2NvcGU6ezM6InRpdGxlLmZ1bmN0aW9uLmludm9rZSJ9LGNvbnRhaW5zOlt5XX07eS5jb250YWlucy5wdXNoKE4pCjtjb25zdCB3PVtFLGYsZS5DX0JMT0NLX0NPTU1FTlRfTU9ERSxjLGQsX107cmV0dXJue2Nhc2VfaW5zZW5zaXRpdmU6ITEsCmtleXdvcmRzOm0sY29udGFpbnM6W3tiZWdpbjpuLmNvbmNhdCgvI1xbXHMqLyxpKSxiZWdpblNjb3BlOiJtZXRhIixlbmQ6L10vLAplbmRTY29wZToibWV0YSIsa2V5d29yZHM6e2xpdGVyYWw6ZyxrZXl3b3JkOlsibmV3IiwiYXJyYXkiXX0sY29udGFpbnM6W3sKYmVnaW46L1xbLyxlbmQ6L10vLGtleXdvcmRzOntsaXRlcmFsOmcsa2V5d29yZDpbIm5ldyIsImFycmF5Il19LApjb250YWluczpbInNlbGYiLC4uLnddfSwuLi53LHtzY29wZToibWV0YSIsbWF0Y2g6aX1dCn0sZS5IQVNIX0NPTU1FTlRfTU9ERSxlLkNPTU1FTlQoIi8vIiwiJCIpLGUuQ09NTUVOVCgiL1xcKiIsIlxcKi8iLHtjb250YWluczpbewpzY29wZToiZG9jdGFnIixtYXRjaDoiQFtBLVphLXpdKyJ9XX0pLHttYXRjaDovX19oYWx0X2NvbXBpbGVyXChcKTsvLAprZXl3b3JkczoiX19oYWx0X2NvbXBpbGVyIixzdGFydHM6e3Njb3BlOiJjb21tZW50IixlbmQ6ZS5NQVRDSF9OT1RISU5HX1JFLApjb250YWluczpbe21hdGNoOi9cPz4vLHNjb3BlOiJtZXRhIixlbmRzUGFyZW50OiEwfV19fSx7c2NvcGU6Im1ldGEiLHZhcmlhbnRzOlt7CmJlZ2luOi88XD9waHAvLHJlbGV2YW5jZToxMH0se2JlZ2luOi88XD89L30se2JlZ2luOi88XD8vLHJlbGV2YW5jZTouMX0sewpiZWdpbjovXD8+L31dfSx7c2NvcGU6InZhcmlhYmxlLmxhbmd1YWdlIixtYXRjaDovXCR0aGlzXGIvfSxyLE4sZix7Cm1hdGNoOlsvY29uc3QvLC9ccy8sYV0sc2NvcGU6ezE6ImtleXdvcmQiLDM6InZhcmlhYmxlLmNvbnN0YW50In19LF8sewpzY29wZToiZnVuY3Rpb24iLHJlbGV2YW5jZTowLGJlZ2luS2V5d29yZHM6ImZuIGZ1bmN0aW9uIixlbmQ6L1s7e10vLApleGNsdWRlRW5kOiEwLGlsbGVnYWw6IlskJVxcW10iLGNvbnRhaW5zOlt7YmVnaW5LZXl3b3JkczoidXNlIgp9LGUuVU5ERVJTQ09SRV9USVRMRV9NT0RFLHtiZWdpbjoiPT4iLGVuZHNQYXJlbnQ6ITB9LHtzY29wZToicGFyYW1zIiwKYmVnaW46IlxcKCIsZW5kOiJcXCkiLGV4Y2x1ZGVCZWdpbjohMCxleGNsdWRlRW5kOiEwLGtleXdvcmRzOm0sCmNvbnRhaW5zOlsic2VsZiIscixmLGUuQ19CTE9DS19DT01NRU5UX01PREUsYyxkXX1dfSx7c2NvcGU6ImNsYXNzIix2YXJpYW50czpbewpiZWdpbktleXdvcmRzOiJlbnVtIixpbGxlZ2FsOi9bKCQiXS99LHtiZWdpbktleXdvcmRzOiJjbGFzcyBpbnRlcmZhY2UgdHJhaXQiLAppbGxlZ2FsOi9bOigkIl0vfV0scmVsZXZhbmNlOjAsZW5kOi9cey8sZXhjbHVkZUVuZDohMCxjb250YWluczpbewpiZWdpbktleXdvcmRzOiJleHRlbmRzIGltcGxlbWVudHMifSxlLlVOREVSU0NPUkVfVElUTEVfTU9ERV19LHsKYmVnaW5LZXl3b3JkczoibmFtZXNwYWNlIixyZWxldmFuY2U6MCxlbmQ6IjsiLGlsbGVnYWw6L1suJ10vLApjb250YWluczpbZS5pbmhlcml0KGUuVU5ERVJTQ09SRV9USVRMRV9NT0RFLHtzY29wZToidGl0bGUuY2xhc3MifSldfSx7CmJlZ2luS2V5d29yZHM6InVzZSIscmVsZXZhbmNlOjAsZW5kOiI7Iixjb250YWluczpbewptYXRjaDovXGIoYXN8Y29uc3R8ZnVuY3Rpb24pXGIvLHNjb3BlOiJrZXl3b3JkIn0sZS5VTkRFUlNDT1JFX1RJVExFX01PREVdfSxjLGRdfQp9LGdybXJfcGhwX3RlbXBsYXRlOmU9Pih7bmFtZToiUEhQIHRlbXBsYXRlIixzdWJMYW5ndWFnZToieG1sIixjb250YWluczpbewpiZWdpbjovPFw/KHBocHw9KT8vLGVuZDovXD8+LyxzdWJMYW5ndWFnZToicGhwIixjb250YWluczpbe2JlZ2luOiIvXFwqIiwKZW5kOiJcXCovIixza2lwOiEwfSx7YmVnaW46J2IiJyxlbmQ6JyInLHNraXA6ITB9LHtiZWdpbjoiYiciLGVuZDoiJyIsc2tpcDohMAp9LGUuaW5oZXJpdChlLkFQT1NfU1RSSU5HX01PREUse2lsbGVnYWw6bnVsbCxjbGFzc05hbWU6bnVsbCxjb250YWluczpudWxsLApza2lwOiEwfSksZS5pbmhlcml0KGUuUVVPVEVfU1RSSU5HX01PREUse2lsbGVnYWw6bnVsbCxjbGFzc05hbWU6bnVsbCwKY29udGFpbnM6bnVsbCxza2lwOiEwfSldfV19KSxncm1yX3BsYWludGV4dDplPT4oe25hbWU6IlBsYWluIHRleHQiLAphbGlhc2VzOlsidGV4dCIsInR4dCJdLGRpc2FibGVBdXRvZGV0ZWN0OiEwfSksZ3Jtcl9weXRob246ZT0+ewpjb25zdCBuPWUucmVnZXgsdD0vW1xwe1hJRF9TdGFydH1fXVxwe1hJRF9Db250aW51ZX0qL3UsYT1bImFuZCIsImFzIiwiYXNzZXJ0IiwiYXN5bmMiLCJhd2FpdCIsImJyZWFrIiwiY2FzZSIsImNsYXNzIiwiY29udGludWUiLCJkZWYiLCJkZWwiLCJlbGlmIiwiZWxzZSIsImV4Y2VwdCIsImZpbmFsbHkiLCJmb3IiLCJmcm9tIiwiZ2xvYmFsIiwiaWYiLCJpbXBvcnQiLCJpbiIsImlzIiwibGFtYmRhIiwibWF0Y2giLCJub25sb2NhbHwxMCIsIm5vdCIsIm9yIiwicGFzcyIsInJhaXNlIiwicmV0dXJuIiwidHJ5Iiwid2hpbGUiLCJ3aXRoIiwieWllbGQiXSxpPXsKJHBhdHRlcm46L1tBLVphLXpdXHcrfF9fXHcrX18vLGtleXdvcmQ6YSwKYnVpbHRfaW46WyJfX2ltcG9ydF9fIiwiYWJzIiwiYWxsIiwiYW55IiwiYXNjaWkiLCJiaW4iLCJib29sIiwiYnJlYWtwb2ludCIsImJ5dGVhcnJheSIsImJ5dGVzIiwiY2FsbGFibGUiLCJjaHIiLCJjbGFzc21ldGhvZCIsImNvbXBpbGUiLCJjb21wbGV4IiwiZGVsYXR0ciIsImRpY3QiLCJkaXIiLCJkaXZtb2QiLCJlbnVtZXJhdGUiLCJldmFsIiwiZXhlYyIsImZpbHRlciIsImZsb2F0IiwiZm9ybWF0IiwiZnJvemVuc2V0IiwiZ2V0YXR0ciIsImdsb2JhbHMiLCJoYXNhdHRyIiwiaGFzaCIsImhlbHAiLCJoZXgiLCJpZCIsImlucHV0IiwiaW50IiwiaXNpbnN0YW5jZSIsImlzc3ViY2xhc3MiLCJpdGVyIiwibGVuIiwibGlzdCIsImxvY2FscyIsIm1hcCIsIm1heCIsIm1lbW9yeXZpZXciLCJtaW4iLCJuZXh0Iiwib2JqZWN0Iiwib2N0Iiwib3BlbiIsIm9yZCIsInBvdyIsInByaW50IiwicHJvcGVydHkiLCJyYW5nZSIsInJlcHIiLCJyZXZlcnNlZCIsInJvdW5kIiwic2V0Iiwic2V0YXR0ciIsInNsaWNlIiwic29ydGVkIiwic3RhdGljbWV0aG9kIiwic3RyIiwic3VtIiwic3VwZXIiLCJ0dXBsZSIsInR5cGUiLCJ2YXJzIiwiemlwIl0sCmxpdGVyYWw6WyJfX2RlYnVnX18iLCJFbGxpcHNpcyIsIkZhbHNlIiwiTm9uZSIsIk5vdEltcGxlbWVudGVkIiwiVHJ1ZSJdLAp0eXBlOlsiQW55IiwiQ2FsbGFibGUiLCJDb3JvdXRpbmUiLCJEaWN0IiwiTGlzdCIsIkxpdGVyYWwiLCJHZW5lcmljIiwiT3B0aW9uYWwiLCJTZXF1ZW5jZSIsIlNldCIsIlR1cGxlIiwiVHlwZSIsIlVuaW9uIl0KfSxyPXtjbGFzc05hbWU6Im1ldGEiLGJlZ2luOi9eKD4+PnxcLlwuXC4pIC99LHM9e2NsYXNzTmFtZToic3Vic3QiLGJlZ2luOi9cey8sCmVuZDovXH0vLGtleXdvcmRzOmksaWxsZWdhbDovIy99LG89e2JlZ2luOi9ce1x7LyxyZWxldmFuY2U6MH0sbD17CmNsYXNzTmFtZToic3RyaW5nIixjb250YWluczpbZS5CQUNLU0xBU0hfRVNDQVBFXSx2YXJpYW50czpbewpiZWdpbjovKFt1VV18W2JCXXxbclJdfFtiQl1bclJdfFtyUl1bYkJdKT8nJycvLGVuZDovJycnLywKY29udGFpbnM6W2UuQkFDS1NMQVNIX0VTQ0FQRSxyXSxyZWxldmFuY2U6MTB9LHsKYmVnaW46LyhbdVVdfFtiQl18W3JSXXxbYkJdW3JSXXxbclJdW2JCXSk/IiIiLyxlbmQ6LyIiIi8sCmNvbnRhaW5zOltlLkJBQ0tTTEFTSF9FU0NBUEUscl0scmVsZXZhbmNlOjEwfSx7CmJlZ2luOi8oW2ZGXVtyUl18W3JSXVtmRl18W2ZGXSknJycvLGVuZDovJycnLywKY29udGFpbnM6W2UuQkFDS1NMQVNIX0VTQ0FQRSxyLG8sc119LHtiZWdpbjovKFtmRl1bclJdfFtyUl1bZkZdfFtmRl0pIiIiLywKZW5kOi8iIiIvLGNvbnRhaW5zOltlLkJBQ0tTTEFTSF9FU0NBUEUscixvLHNdfSx7YmVnaW46LyhbdVVdfFtyUl0pJy8sZW5kOi8nLywKcmVsZXZhbmNlOjEwfSx7YmVnaW46LyhbdVVdfFtyUl0pIi8sZW5kOi8iLyxyZWxldmFuY2U6MTB9LHsKYmVnaW46LyhbYkJdfFtiQl1bclJdfFtyUl1bYkJdKScvLGVuZDovJy99LHtiZWdpbjovKFtiQl18W2JCXVtyUl18W3JSXVtiQl0pIi8sCmVuZDovIi99LHtiZWdpbjovKFtmRl1bclJdfFtyUl1bZkZdfFtmRl0pJy8sZW5kOi8nLywKY29udGFpbnM6W2UuQkFDS1NMQVNIX0VTQ0FQRSxvLHNdfSx7YmVnaW46LyhbZkZdW3JSXXxbclJdW2ZGXXxbZkZdKSIvLGVuZDovIi8sCmNvbnRhaW5zOltlLkJBQ0tTTEFTSF9FU0NBUEUsbyxzXX0sZS5BUE9TX1NUUklOR19NT0RFLGUuUVVPVEVfU1RSSU5HX01PREVdCn0sYz0iWzAtOV0oXz9bMC05XSkqIixkPWAoXFxiKCR7Y30pKT9cXC4oJHtjfSl8XFxiKCR7Y30pXFwuYCxnPSJcXGJ8IithLmpvaW4oInwiKSx1PXsKY2xhc3NOYW1lOiJudW1iZXIiLHJlbGV2YW5jZTowLHZhcmlhbnRzOlt7CmJlZ2luOmAoXFxiKCR7Y30pfCgke2R9KSlbZUVdWystXT8oJHtjfSlbakpdPyg/PSR7Z30pYH0se2JlZ2luOmAoJHtkfSlbakpdP2B9LHsKYmVnaW46YFxcYihbMS05XShfP1swLTldKSp8MCsoXz8wKSopW2xMakpdPyg/PSR7Z30pYH0sewpiZWdpbjpgXFxiMFtiQl0oXz9bMDFdKStbbExdPyg/PSR7Z30pYH0se2JlZ2luOmBcXGIwW29PXShfP1swLTddKStbbExdPyg/PSR7Z30pYAp9LHtiZWdpbjpgXFxiMFt4WF0oXz9bMC05YS1mQS1GXSkrW2xMXT8oPz0ke2d9KWB9LHtiZWdpbjpgXFxiKCR7Y30pW2pKXSg/PSR7Z30pYAp9XX0sYj17Y2xhc3NOYW1lOiJjb21tZW50IixiZWdpbjpuLmxvb2thaGVhZCgvIyB0eXBlOi8pLGVuZDovJC8sa2V5d29yZHM6aSwKY29udGFpbnM6W3tiZWdpbjovIyB0eXBlOi99LHtiZWdpbjovIy8sZW5kOi9cYlxCLyxlbmRzV2l0aFBhcmVudDohMH1dfSxtPXsKY2xhc3NOYW1lOiJwYXJhbXMiLHZhcmlhbnRzOlt7Y2xhc3NOYW1lOiIiLGJlZ2luOi9cKFxzKlwpLyxza2lwOiEwfSx7YmVnaW46L1woLywKZW5kOi9cKS8sZXhjbHVkZUJlZ2luOiEwLGV4Y2x1ZGVFbmQ6ITAsa2V5d29yZHM6aSwKY29udGFpbnM6WyJzZWxmIixyLHUsbCxlLkhBU0hfQ09NTUVOVF9NT0RFXX1dfTtyZXR1cm4gcy5jb250YWlucz1bbCx1LHJdLHsKbmFtZToiUHl0aG9uIixhbGlhc2VzOlsicHkiLCJneXAiLCJpcHl0aG9uIl0sdW5pY29kZVJlZ2V4OiEwLGtleXdvcmRzOmksCmlsbGVnYWw6Lyg8XC98XD8pfD0+Lyxjb250YWluczpbcix1LHtiZWdpbjovXGJzZWxmXGIvfSx7YmVnaW5LZXl3b3JkczoiaWYiLApyZWxldmFuY2U6MH0sbCxiLGUuSEFTSF9DT01NRU5UX01PREUse21hdGNoOlsvXGJkZWYvLC9ccysvLHRdLHNjb3BlOnsKMToia2V5d29yZCIsMzoidGl0bGUuZnVuY3Rpb24ifSxjb250YWluczpbbV19LHt2YXJpYW50czpbewptYXRjaDpbL1xiY2xhc3MvLC9ccysvLHQsL1xzKi8sL1woXHMqLyx0LC9ccypcKS9dfSx7bWF0Y2g6Wy9cYmNsYXNzLywvXHMrLyx0XX1dLApzY29wZTp7MToia2V5d29yZCIsMzoidGl0bGUuY2xhc3MiLDY6InRpdGxlLmNsYXNzLmluaGVyaXRlZCJ9fSx7CmNsYXNzTmFtZToibWV0YSIsYmVnaW46L15bXHQgXSpALyxlbmQ6Lyg/PSMpfCQvLGNvbnRhaW5zOlt1LG0sbF19XX19LApncm1yX3B5dGhvbl9yZXBsOmU9Pih7YWxpYXNlczpbInB5Y29uIl0sY29udGFpbnM6W3tjbGFzc05hbWU6Im1ldGEucHJvbXB0IiwKc3RhcnRzOntlbmQ6LyB8JC8sc3RhcnRzOntlbmQ6IiQiLHN1Ykxhbmd1YWdlOiJweXRob24ifX0sdmFyaWFudHM6W3sKYmVnaW46L14+Pj4oPz1bIF18JCkvfSx7YmVnaW46L15cLlwuXC4oPz1bIF18JCkvfV19XX0pLGdybXJfcjplPT57CmNvbnN0IG49ZS5yZWdleCx0PS8oPzooPzpbYS16QS1aXXxcLlsuX2EtekEtWl0pWy5fYS16QS1aMC05XSopfFwuKD8hXGQpLyxhPW4uZWl0aGVyKC8wW3hYXVswLTlhLWZBLUZdK1wuWzAtOWEtZkEtRl0qW3BQXVsrLV0/XGQraT8vLC8wW3hYXVswLTlhLWZBLUZdKyg/OltwUF1bKy1dP1xkKyk/W0xpXT8vLC8oPzpcZCsoPzpcLlxkKik/fFwuXGQrKSg/OltlRV1bKy1dP1xkKyk/W0xpXT8vKSxpPS9bPSE8PjpdPXxcfFx8fCYmfDo6Oj98PC18PDwtfC0+PnwtPnxcfD58Wy0rKlwvPyEkJnw6PD0+QF5+XXxcKlwqLyxyPW4uZWl0aGVyKC9bKCldLywvW3t9XS8sL1xbXFsvLC9bW1xdXS8sL1xcLywvLC8pCjtyZXR1cm57bmFtZToiUiIsa2V5d29yZHM6eyRwYXR0ZXJuOnQsCmtleXdvcmQ6ImZ1bmN0aW9uIGlmIGluIGJyZWFrIG5leHQgcmVwZWF0IGVsc2UgZm9yIHdoaWxlIiwKbGl0ZXJhbDoiTlVMTCBOQSBUUlVFIEZBTFNFIEluZiBOYU4gTkFfaW50ZWdlcl98MTAgTkFfcmVhbF98MTAgTkFfY2hhcmFjdGVyX3wxMCBOQV9jb21wbGV4X3wxMCIsCmJ1aWx0X2luOiJMRVRURVJTIGxldHRlcnMgbW9udGguYWJiIG1vbnRoLm5hbWUgcGkgVCBGIGFicyBhY29zIGFjb3NoIGFsbCBhbnkgYW55TkEgQXJnIGFzLmNhbGwgYXMuY2hhcmFjdGVyIGFzLmNvbXBsZXggYXMuZG91YmxlIGFzLmVudmlyb25tZW50IGFzLmludGVnZXIgYXMubG9naWNhbCBhcy5udWxsLmRlZmF1bHQgYXMubnVtZXJpYyBhcy5yYXcgYXNpbiBhc2luaCBhdGFuIGF0YW5oIGF0dHIgYXR0cmlidXRlcyBiYXNlZW52IGJyb3dzZXIgYyBjYWxsIGNlaWxpbmcgY2xhc3MgQ29uaiBjb3MgY29zaCBjb3NwaSBjdW1tYXggY3VtbWluIGN1bXByb2QgY3Vtc3VtIGRpZ2FtbWEgZGltIGRpbW5hbWVzIGVtcHR5ZW52IGV4cCBleHByZXNzaW9uIGZsb29yIGZvcmNlQW5kQ2FsbCBnYW1tYSBnYy50aW1lIGdsb2JhbGVudiBJbSBpbnRlcmFjdGl2ZSBpbnZpc2libGUgaXMuYXJyYXkgaXMuYXRvbWljIGlzLmNhbGwgaXMuY2hhcmFjdGVyIGlzLmNvbXBsZXggaXMuZG91YmxlIGlzLmVudmlyb25tZW50IGlzLmV4cHJlc3Npb24gaXMuZmluaXRlIGlzLmZ1bmN0aW9uIGlzLmluZmluaXRlIGlzLmludGVnZXIgaXMubGFuZ3VhZ2UgaXMubGlzdCBpcy5sb2dpY2FsIGlzLm1hdHJpeCBpcy5uYSBpcy5uYW1lIGlzLm5hbiBpcy5udWxsIGlzLm51bWVyaWMgaXMub2JqZWN0IGlzLnBhaXJsaXN0IGlzLnJhdyBpcy5yZWN1cnNpdmUgaXMuc2luZ2xlIGlzLnN5bWJvbCBsYXp5TG9hZERCZmV0Y2ggbGVuZ3RoIGxnYW1tYSBsaXN0IGxvZyBtYXggbWluIG1pc3NpbmcgTW9kIG5hbWVzIG5hcmdzIG56Y2hhciBvbGRDbGFzcyBvbi5leGl0IHBvcy50by5lbnYgcHJvYy50aW1lIHByb2QgcXVvdGUgcmFuZ2UgUmUgcmVwIHJldHJhY2VtZW0gcmV0dXJuIHJvdW5kIHNlcV9hbG9uZyBzZXFfbGVuIHNlcS5pbnQgc2lnbiBzaWduaWYgc2luIHNpbmggc2lucGkgc3FydCBzdGFuZGFyZEdlbmVyaWMgc3Vic3RpdHV0ZSBzdW0gc3dpdGNoIHRhbiB0YW5oIHRhbnBpIHRyYWNlbWVtIHRyaWdhbW1hIHRydW5jIHVuY2xhc3MgdW50cmFjZW1lbSBVc2VNZXRob2QgeHRmcm0iCn0sY29udGFpbnM6W2UuQ09NTUVOVCgvIycvLC8kLyx7Y29udGFpbnM6W3tzY29wZToiZG9jdGFnIixtYXRjaDovQGV4YW1wbGVzLywKc3RhcnRzOntlbmQ6bi5sb29rYWhlYWQobi5laXRoZXIoL1xuXiMnXHMqKD89QFthLXpBLVpdKykvLC9cbl4oPyEjJykvKSksCmVuZHNQYXJlbnQ6ITB9fSx7c2NvcGU6ImRvY3RhZyIsYmVnaW46IkBwYXJhbSIsZW5kOi8kLyxjb250YWluczpbewpzY29wZToidmFyaWFibGUiLHZhcmlhbnRzOlt7bWF0Y2g6dH0se21hdGNoOi9gKD86XFwufFteYFxcXSkrYC99XSxlbmRzUGFyZW50OiEwCn1dfSx7c2NvcGU6ImRvY3RhZyIsbWF0Y2g6L0BbYS16QS1aXSsvfSx7c2NvcGU6ImtleXdvcmQiLG1hdGNoOi9cXFthLXpBLVpdKy99XQp9KSxlLkhBU0hfQ09NTUVOVF9NT0RFLHtzY29wZToic3RyaW5nIixjb250YWluczpbZS5CQUNLU0xBU0hfRVNDQVBFXSwKdmFyaWFudHM6W2UuRU5EX1NBTUVfQVNfQkVHSU4oe2JlZ2luOi9bclJdIigtKilcKC8sZW5kOi9cKSgtKikiLwp9KSxlLkVORF9TQU1FX0FTX0JFR0lOKHtiZWdpbjovW3JSXSIoLSopXHsvLGVuZDovXH0oLSopIi8KfSksZS5FTkRfU0FNRV9BU19CRUdJTih7YmVnaW46L1tyUl0iKC0qKVxbLyxlbmQ6L1xdKC0qKSIvCn0pLGUuRU5EX1NBTUVfQVNfQkVHSU4oe2JlZ2luOi9bclJdJygtKilcKC8sZW5kOi9cKSgtKiknLwp9KSxlLkVORF9TQU1FX0FTX0JFR0lOKHtiZWdpbjovW3JSXScoLSopXHsvLGVuZDovXH0oLSopJy8KfSksZS5FTkRfU0FNRV9BU19CRUdJTih7YmVnaW46L1tyUl0nKC0qKVxbLyxlbmQ6L1xdKC0qKScvfSkse2JlZ2luOiciJyxlbmQ6JyInLApyZWxldmFuY2U6MH0se2JlZ2luOiInIixlbmQ6IiciLHJlbGV2YW5jZTowfV19LHtyZWxldmFuY2U6MCx2YXJpYW50czpbe3Njb3BlOnsKMToib3BlcmF0b3IiLDI6Im51bWJlciJ9LG1hdGNoOltpLGFdfSx7c2NvcGU6ezE6Im9wZXJhdG9yIiwyOiJudW1iZXIifSwKbWF0Y2g6Wy8lW14lXSolLyxhXX0se3Njb3BlOnsxOiJwdW5jdHVhdGlvbiIsMjoibnVtYmVyIn0sbWF0Y2g6W3IsYV19LHtzY29wZTp7CjI6Im51bWJlciJ9LG1hdGNoOlsvW15hLXpBLVowLTkuX118Xi8sYV19XX0se3Njb3BlOnszOiJvcGVyYXRvciJ9LAptYXRjaDpbdCwvXHMrLywvPC0vLC9ccysvXX0se3Njb3BlOiJvcGVyYXRvciIscmVsZXZhbmNlOjAsdmFyaWFudHM6W3ttYXRjaDppfSx7Cm1hdGNoOi8lW14lXSolL31dfSx7c2NvcGU6InB1bmN0dWF0aW9uIixyZWxldmFuY2U6MCxtYXRjaDpyfSx7YmVnaW46ImAiLGVuZDoiYCIsCmNvbnRhaW5zOlt7YmVnaW46L1xcLi99XX1dfX0sZ3Jtcl9ydWJ5OmU9PnsKY29uc3Qgbj1lLnJlZ2V4LHQ9IihbYS16QS1aX11cXHcqWyE/PV0/fFstK35dQHw8PHw+Pnw9fnw9PT0/fDw9PnxbPD5dPT98XFwqXFwqfFstLyslXiYqfmB8XXxcXFtcXF09PykiLGE9bi5laXRoZXIoL1xiKFtBLVpdK1thLXowLTldKykrLywvXGIoW0EtWl0rW2EtejAtOV0rKStbQS1aXSsvKSxpPW4uY29uY2F0KGEsLyg6Olx3KykqLykscj17CiJ2YXJpYWJsZS5jb25zdGFudCI6WyJfX0ZJTEVfXyIsIl9fTElORV9fIiwiX19FTkNPRElOR19fIl0sCiJ2YXJpYWJsZS5sYW5ndWFnZSI6WyJzZWxmIiwic3VwZXIiXSwKa2V5d29yZDpbImFsaWFzIiwiYW5kIiwiYmVnaW4iLCJCRUdJTiIsImJyZWFrIiwiY2FzZSIsImNsYXNzIiwiZGVmaW5lZCIsImRvIiwiZWxzZSIsImVsc2lmIiwiZW5kIiwiRU5EIiwiZW5zdXJlIiwiZm9yIiwiaWYiLCJpbiIsIm1vZHVsZSIsIm5leHQiLCJub3QiLCJvciIsInJlZG8iLCJyZXF1aXJlIiwicmVzY3VlIiwicmV0cnkiLCJyZXR1cm4iLCJ0aGVuIiwidW5kZWYiLCJ1bmxlc3MiLCJ1bnRpbCIsIndoZW4iLCJ3aGlsZSIsInlpZWxkIiwiaW5jbHVkZSIsImV4dGVuZCIsInByZXBlbmQiLCJwdWJsaWMiLCJwcml2YXRlIiwicHJvdGVjdGVkIiwicmFpc2UiLCJ0aHJvdyJdLApidWlsdF9pbjpbInByb2MiLCJsYW1iZGEiLCJhdHRyX2FjY2Vzc29yIiwiYXR0cl9yZWFkZXIiLCJhdHRyX3dyaXRlciIsImRlZmluZV9tZXRob2QiLCJwcml2YXRlX2NvbnN0YW50IiwibW9kdWxlX2Z1bmN0aW9uIl0sCmxpdGVyYWw6WyJ0cnVlIiwiZmFsc2UiLCJuaWwiXX0scz17Y2xhc3NOYW1lOiJkb2N0YWciLGJlZ2luOiJAW0EtWmEtel0rIn0sbz17CmJlZ2luOiIjPCIsZW5kOiI+In0sbD1bZS5DT01NRU5UKCIjIiwiJCIse2NvbnRhaW5zOltzXQp9KSxlLkNPTU1FTlQoIl49YmVnaW4iLCJePWVuZCIse2NvbnRhaW5zOltzXSxyZWxldmFuY2U6MTAKfSksZS5DT01NRU5UKCJeX19FTkRfXyIsZS5NQVRDSF9OT1RISU5HX1JFKV0sYz17Y2xhc3NOYW1lOiJzdWJzdCIsYmVnaW46LyNcey8sCmVuZDovXH0vLGtleXdvcmRzOnJ9LGQ9e2NsYXNzTmFtZToic3RyaW5nIixjb250YWluczpbZS5CQUNLU0xBU0hfRVNDQVBFLGNdLAp2YXJpYW50czpbe2JlZ2luOi8nLyxlbmQ6LycvfSx7YmVnaW46LyIvLGVuZDovIi99LHtiZWdpbjovYC8sZW5kOi9gL30sewpiZWdpbjovJVtxUXdXeF0/XCgvLGVuZDovXCkvfSx7YmVnaW46LyVbcVF3V3hdP1xbLyxlbmQ6L1xdL30sewpiZWdpbjovJVtxUXdXeF0/XHsvLGVuZDovXH0vfSx7YmVnaW46LyVbcVF3V3hdPzwvLGVuZDovPi99LHtiZWdpbjovJVtxUXdXeF0/XC8vLAplbmQ6L1wvL30se2JlZ2luOi8lW3FRd1d4XT8lLyxlbmQ6LyUvfSx7YmVnaW46LyVbcVF3V3hdPy0vLGVuZDovLS99LHsKYmVnaW46LyVbcVF3V3hdP1x8LyxlbmQ6L1x8L30se2JlZ2luOi9cQlw/KFxcXGR7MSwzfSkvfSx7CmJlZ2luOi9cQlw/KFxceFtBLUZhLWYwLTldezEsMn0pL30se2JlZ2luOi9cQlw/KFxcdVx7P1tBLUZhLWYwLTldezEsNn1cfT8pL30sewpiZWdpbjovXEJcPyhcXE0tXFxDLXxcXE0tXFxjfFxcY1xcTS18XFxNLXxcXEMtXFxNLSlbXHgyMC1ceDdlXS99LHsKYmVnaW46L1xCXD9cXChjfEMtKVtceDIwLVx4N2VdL30se2JlZ2luOi9cQlw/XFw/XFMvfSx7CmJlZ2luOm4uY29uY2F0KC88PFstfl0/Jz8vLG4ubG9va2FoZWFkKC8oXHcrKSg/PVxXKVteXG5dKlxuKD86W15cbl0qXG4pKj9ccypcMVxiLykpLApjb250YWluczpbZS5FTkRfU0FNRV9BU19CRUdJTih7YmVnaW46LyhcdyspLyxlbmQ6LyhcdyspLywKY29udGFpbnM6W2UuQkFDS1NMQVNIX0VTQ0FQRSxjXX0pXX1dfSxnPSJbMC05XShfP1swLTldKSoiLHU9e2NsYXNzTmFtZToibnVtYmVyIiwKcmVsZXZhbmNlOjAsdmFyaWFudHM6W3sKYmVnaW46YFxcYihbMS05XShfP1swLTldKSp8MCkoXFwuKCR7Z30pKT8oW2VFXVsrLV0/KCR7Z30pfHIpP2k/XFxiYH0sewpiZWdpbjoiXFxiMFtkRF1bMC05XShfP1swLTldKSpyP2k/XFxiIn0se2JlZ2luOiJcXGIwW2JCXVswLTFdKF8/WzAtMV0pKnI/aT9cXGIiCn0se2JlZ2luOiJcXGIwW29PXVswLTddKF8/WzAtN10pKnI/aT9cXGIifSx7CmJlZ2luOiJcXGIwW3hYXVswLTlhLWZBLUZdKF8/WzAtOWEtZkEtRl0pKnI/aT9cXGIifSx7CmJlZ2luOiJcXGIwKF8/WzAtN10pK3I/aT9cXGIifV19LGI9e3ZhcmlhbnRzOlt7bWF0Y2g6L1woXCkvfSx7CmNsYXNzTmFtZToicGFyYW1zIixiZWdpbjovXCgvLGVuZDovKD89XCkpLyxleGNsdWRlQmVnaW46ITAsZW5kc1BhcmVudDohMCwKa2V5d29yZHM6cn1dfSxtPVtkLHt2YXJpYW50czpbe21hdGNoOlsvY2xhc3NccysvLGksL1xzKzxccysvLGldfSx7Cm1hdGNoOlsvXGIoY2xhc3N8bW9kdWxlKVxzKy8saV19XSxzY29wZTp7MjoidGl0bGUuY2xhc3MiLAo0OiJ0aXRsZS5jbGFzcy5pbmhlcml0ZWQifSxrZXl3b3JkczpyfSx7bWF0Y2g6Wy8oaW5jbHVkZXxleHRlbmQpXHMrLyxpXSxzY29wZTp7CjI6InRpdGxlLmNsYXNzIn0sa2V5d29yZHM6cn0se3JlbGV2YW5jZTowLG1hdGNoOltpLC9cLm5ld1suIChdL10sc2NvcGU6ewoxOiJ0aXRsZS5jbGFzcyJ9fSx7cmVsZXZhbmNlOjAsbWF0Y2g6L1xiW0EtWl1bQS1aXzAtOV0rXGIvLApjbGFzc05hbWU6InZhcmlhYmxlLmNvbnN0YW50In0se3JlbGV2YW5jZTowLG1hdGNoOmEsc2NvcGU6InRpdGxlLmNsYXNzIn0sewptYXRjaDpbL2RlZi8sL1xzKy8sdF0sc2NvcGU6ezE6ImtleXdvcmQiLDM6InRpdGxlLmZ1bmN0aW9uIn0sY29udGFpbnM6W2JdfSx7CmJlZ2luOmUuSURFTlRfUkUrIjo6In0se2NsYXNzTmFtZToic3ltYm9sIiwKYmVnaW46ZS5VTkRFUlNDT1JFX0lERU5UX1JFKyIoIXxcXD8pPzoiLHJlbGV2YW5jZTowfSx7Y2xhc3NOYW1lOiJzeW1ib2wiLApiZWdpbjoiOig/IVxccykiLGNvbnRhaW5zOltkLHtiZWdpbjp0fV0scmVsZXZhbmNlOjB9LHUse2NsYXNzTmFtZToidmFyaWFibGUiLApiZWdpbjoiKFxcJFxcVyl8KChcXCR8QEA/KShcXHcrKSkoPz1bXkAkP10pKD8hW0EtWmEtel0pKD8hW0AkPyddKSJ9LHsKY2xhc3NOYW1lOiJwYXJhbXMiLGJlZ2luOi9cfC8sZW5kOi9cfC8sZXhjbHVkZUJlZ2luOiEwLGV4Y2x1ZGVFbmQ6ITAsCnJlbGV2YW5jZTowLGtleXdvcmRzOnJ9LHtiZWdpbjoiKCIrZS5SRV9TVEFSVEVSU19SRSsifHVubGVzcylcXHMqIiwKa2V5d29yZHM6InVubGVzcyIsY29udGFpbnM6W3tjbGFzc05hbWU6InJlZ2V4cCIsY29udGFpbnM6W2UuQkFDS1NMQVNIX0VTQ0FQRSxjXSwKaWxsZWdhbDovXG4vLHZhcmlhbnRzOlt7YmVnaW46Ii8iLGVuZDoiL1thLXpdKiJ9LHtiZWdpbjovJXJcey8sZW5kOi9cfVthLXpdKi99LHsKYmVnaW46IiVyXFwoIixlbmQ6IlxcKVthLXpdKiJ9LHtiZWdpbjoiJXIhIixlbmQ6IiFbYS16XSoifSx7YmVnaW46IiVyXFxbIiwKZW5kOiJcXF1bYS16XSoifV19XS5jb25jYXQobyxsKSxyZWxldmFuY2U6MH1dLmNvbmNhdChvLGwpCjtjLmNvbnRhaW5zPW0sYi5jb250YWlucz1tO2NvbnN0IHA9W3tiZWdpbjovXlxzKj0+LyxzdGFydHM6e2VuZDoiJCIsY29udGFpbnM6bX0KfSx7Y2xhc3NOYW1lOiJtZXRhLnByb21wdCIsCmJlZ2luOiJeKFs+P10+fFtcXHcjXStcXChcXHcrXFwpOlxcZCs6XFxkK1s+Kl18KFxcdystKT9cXGQrXFwuXFxkK1xcLlxcZCsocFxcZCspP1teXFxkXVtePl0rPikoPz1bIF0pIiwKc3RhcnRzOntlbmQ6IiQiLGtleXdvcmRzOnIsY29udGFpbnM6bX19XTtyZXR1cm4gbC51bnNoaWZ0KG8pLHtuYW1lOiJSdWJ5IiwKYWxpYXNlczpbInJiIiwiZ2Vtc3BlYyIsInBvZHNwZWMiLCJ0aG9yIiwiaXJiIl0sa2V5d29yZHM6cixpbGxlZ2FsOi9cL1wqLywKY29udGFpbnM6W2UuU0hFQkFORyh7YmluYXJ5OiJydWJ5In0pXS5jb25jYXQocCkuY29uY2F0KGwpLmNvbmNhdChtKX19LApncm1yX3J1c3Q6ZT0+e2NvbnN0IG49ZS5yZWdleCx0PXtjbGFzc05hbWU6InRpdGxlLmZ1bmN0aW9uLmludm9rZSIscmVsZXZhbmNlOjAsCmJlZ2luOm4uY29uY2F0KC9cYi8sLyg/IWxldHxmb3J8d2hpbGV8aWZ8ZWxzZXxtYXRjaFxiKS8sZS5JREVOVF9SRSxuLmxvb2thaGVhZCgvXHMqXCgvKSkKfSxhPSIoW3VpXSg4fDE2fDMyfDY0fDEyOHxzaXplKXxmKDMyfDY0KSk/IixpPVsiZHJvcCAiLCJDb3B5IiwiU2VuZCIsIlNpemVkIiwiU3luYyIsIkRyb3AiLCJGbiIsIkZuTXV0IiwiRm5PbmNlIiwiVG9Pd25lZCIsIkNsb25lIiwiRGVidWciLCJQYXJ0aWFsRXEiLCJQYXJ0aWFsT3JkIiwiRXEiLCJPcmQiLCJBc1JlZiIsIkFzTXV0IiwiSW50byIsIkZyb20iLCJEZWZhdWx0IiwiSXRlcmF0b3IiLCJFeHRlbmQiLCJJbnRvSXRlcmF0b3IiLCJEb3VibGVFbmRlZEl0ZXJhdG9yIiwiRXhhY3RTaXplSXRlcmF0b3IiLCJTbGljZUNvbmNhdEV4dCIsIlRvU3RyaW5nIiwiYXNzZXJ0ISIsImFzc2VydF9lcSEiLCJiaXRmbGFncyEiLCJieXRlcyEiLCJjZmchIiwiY29sISIsImNvbmNhdCEiLCJjb25jYXRfaWRlbnRzISIsImRlYnVnX2Fzc2VydCEiLCJkZWJ1Z19hc3NlcnRfZXEhIiwiZW52ISIsImVwcmludGxuISIsInBhbmljISIsImZpbGUhIiwiZm9ybWF0ISIsImZvcm1hdF9hcmdzISIsImluY2x1ZGVfYnl0ZXMhIiwiaW5jbHVkZV9zdHIhIiwibGluZSEiLCJsb2NhbF9kYXRhX2tleSEiLCJtb2R1bGVfcGF0aCEiLCJvcHRpb25fZW52ISIsInByaW50ISIsInByaW50bG4hIiwic2VsZWN0ISIsInN0cmluZ2lmeSEiLCJ0cnkhIiwidW5pbXBsZW1lbnRlZCEiLCJ1bnJlYWNoYWJsZSEiLCJ2ZWMhIiwid3JpdGUhIiwid3JpdGVsbiEiLCJtYWNyb19ydWxlcyEiLCJhc3NlcnRfbmUhIiwiZGVidWdfYXNzZXJ0X25lISJdLHI9WyJpOCIsImkxNiIsImkzMiIsImk2NCIsImkxMjgiLCJpc2l6ZSIsInU4IiwidTE2IiwidTMyIiwidTY0IiwidTEyOCIsInVzaXplIiwiZjMyIiwiZjY0Iiwic3RyIiwiY2hhciIsImJvb2wiLCJCb3giLCJPcHRpb24iLCJSZXN1bHQiLCJTdHJpbmciLCJWZWMiXQo7cmV0dXJue25hbWU6IlJ1c3QiLGFsaWFzZXM6WyJycyJdLGtleXdvcmRzOnskcGF0dGVybjplLklERU5UX1JFKyIhPyIsdHlwZTpyLAprZXl3b3JkOlsiYWJzdHJhY3QiLCJhcyIsImFzeW5jIiwiYXdhaXQiLCJiZWNvbWUiLCJib3giLCJicmVhayIsImNvbnN0IiwiY29udGludWUiLCJjcmF0ZSIsImRvIiwiZHluIiwiZWxzZSIsImVudW0iLCJleHRlcm4iLCJmYWxzZSIsImZpbmFsIiwiZm4iLCJmb3IiLCJpZiIsImltcGwiLCJpbiIsImxldCIsImxvb3AiLCJtYWNybyIsIm1hdGNoIiwibW9kIiwibW92ZSIsIm11dCIsIm92ZXJyaWRlIiwicHJpdiIsInB1YiIsInJlZiIsInJldHVybiIsInNlbGYiLCJTZWxmIiwic3RhdGljIiwic3RydWN0Iiwic3VwZXIiLCJ0cmFpdCIsInRydWUiLCJ0cnkiLCJ0eXBlIiwidHlwZW9mIiwidW5zYWZlIiwidW5zaXplZCIsInVzZSIsInZpcnR1YWwiLCJ3aGVyZSIsIndoaWxlIiwieWllbGQiXSwKbGl0ZXJhbDpbInRydWUiLCJmYWxzZSIsIlNvbWUiLCJOb25lIiwiT2siLCJFcnIiXSxidWlsdF9pbjppfSxpbGxlZ2FsOiI8LyIsCmNvbnRhaW5zOltlLkNfTElORV9DT01NRU5UX01PREUsZS5DT01NRU5UKCIvXFwqIiwiXFwqLyIse2NvbnRhaW5zOlsic2VsZiJdCn0pLGUuaW5oZXJpdChlLlFVT1RFX1NUUklOR19NT0RFLHtiZWdpbjovYj8iLyxpbGxlZ2FsOm51bGx9KSx7CmNsYXNzTmFtZToic3RyaW5nIix2YXJpYW50czpbe2JlZ2luOi9iP3IoIyopIigufFxuKSo/IlwxKD8hIykvfSx7CmJlZ2luOi9iPydcXD8oeFx3ezJ9fHVcd3s0fXxVXHd7OH18LiknL31dfSx7Y2xhc3NOYW1lOiJzeW1ib2wiLApiZWdpbjovJ1thLXpBLVpfXVthLXpBLVowLTlfXSovfSx7Y2xhc3NOYW1lOiJudW1iZXIiLHZhcmlhbnRzOlt7CmJlZ2luOiJcXGIwYihbMDFfXSspIithfSx7YmVnaW46IlxcYjBvKFswLTdfXSspIithfSx7CmJlZ2luOiJcXGIweChbQS1GYS1mMC05X10rKSIrYX0sewpiZWdpbjoiXFxiKFxcZFtcXGRfXSooXFwuWzAtOV9dKyk/KFtlRV1bKy1dP1swLTlfXSspPykiK2F9XSxyZWxldmFuY2U6MH0sewpiZWdpbjpbL2ZuLywvXHMrLyxlLlVOREVSU0NPUkVfSURFTlRfUkVdLGNsYXNzTmFtZTp7MToia2V5d29yZCIsCjM6InRpdGxlLmZ1bmN0aW9uIn19LHtjbGFzc05hbWU6Im1ldGEiLGJlZ2luOiIjIT9cXFsiLGVuZDoiXFxdIixjb250YWluczpbewpjbGFzc05hbWU6InN0cmluZyIsYmVnaW46LyIvLGVuZDovIi99XX0sewpiZWdpbjpbL2xldC8sL1xzKy8sLyg/Om11dFxzKyk/LyxlLlVOREVSU0NPUkVfSURFTlRfUkVdLGNsYXNzTmFtZTp7MToia2V5d29yZCIsCjM6ImtleXdvcmQiLDQ6InZhcmlhYmxlIn19LHsKYmVnaW46Wy9mb3IvLC9ccysvLGUuVU5ERVJTQ09SRV9JREVOVF9SRSwvXHMrLywvaW4vXSxjbGFzc05hbWU6ezE6ImtleXdvcmQiLAozOiJ2YXJpYWJsZSIsNToia2V5d29yZCJ9fSx7YmVnaW46Wy90eXBlLywvXHMrLyxlLlVOREVSU0NPUkVfSURFTlRfUkVdLApjbGFzc05hbWU6ezE6ImtleXdvcmQiLDM6InRpdGxlLmNsYXNzIn19LHsKYmVnaW46Wy8oPzp0cmFpdHxlbnVtfHN0cnVjdHx1bmlvbnxpbXBsfGZvcikvLC9ccysvLGUuVU5ERVJTQ09SRV9JREVOVF9SRV0sCmNsYXNzTmFtZTp7MToia2V5d29yZCIsMzoidGl0bGUuY2xhc3MifX0se2JlZ2luOmUuSURFTlRfUkUrIjo6IixrZXl3b3Jkczp7CmtleXdvcmQ6IlNlbGYiLGJ1aWx0X2luOmksdHlwZTpyfX0se2NsYXNzTmFtZToicHVuY3R1YXRpb24iLGJlZ2luOiItPiJ9LHRdfX0sCmdybXJfc2NzczplPT57Y29uc3Qgbj1pZShlKSx0PWxlLGE9b2UsaT0iQFthLXotXSsiLHI9e2NsYXNzTmFtZToidmFyaWFibGUiLApiZWdpbjoiKFxcJFthLXpBLVotXVthLXpBLVowLTlfLV0qKVxcYiIscmVsZXZhbmNlOjB9O3JldHVybntuYW1lOiJTQ1NTIiwKY2FzZV9pbnNlbnNpdGl2ZTohMCxpbGxlZ2FsOiJbPS98J10iLApjb250YWluczpbZS5DX0xJTkVfQ09NTUVOVF9NT0RFLGUuQ19CTE9DS19DT01NRU5UX01PREUsbi5DU1NfTlVNQkVSX01PREUsewpjbGFzc05hbWU6InNlbGVjdG9yLWlkIixiZWdpbjoiI1tBLVphLXowLTlfLV0rIixyZWxldmFuY2U6MH0sewpjbGFzc05hbWU6InNlbGVjdG9yLWNsYXNzIixiZWdpbjoiXFwuW0EtWmEtejAtOV8tXSsiLHJlbGV2YW5jZTowCn0sbi5BVFRSSUJVVEVfU0VMRUNUT1JfTU9ERSx7Y2xhc3NOYW1lOiJzZWxlY3Rvci10YWciLApiZWdpbjoiXFxiKCIrcmUuam9pbigifCIpKyIpXFxiIixyZWxldmFuY2U6MH0se2NsYXNzTmFtZToic2VsZWN0b3ItcHNldWRvIiwKYmVnaW46IjooIithLmpvaW4oInwiKSsiKSJ9LHtjbGFzc05hbWU6InNlbGVjdG9yLXBzZXVkbyIsCmJlZ2luOiI6KDopPygiK3Quam9pbigifCIpKyIpIn0scix7YmVnaW46L1woLyxlbmQ6L1wpLywKY29udGFpbnM6W24uQ1NTX05VTUJFUl9NT0RFXX0sbi5DU1NfVkFSSUFCTEUse2NsYXNzTmFtZToiYXR0cmlidXRlIiwKYmVnaW46IlxcYigiK2NlLmpvaW4oInwiKSsiKVxcYiJ9LHsKYmVnaW46IlxcYih3aGl0ZXNwYWNlfHdhaXR8dy1yZXNpemV8dmlzaWJsZXx2ZXJ0aWNhbC10ZXh0fHZlcnRpY2FsLWlkZW9ncmFwaGljfHVwcGVyY2FzZXx1cHBlci1yb21hbnx1cHBlci1hbHBoYXx1bmRlcmxpbmV8dHJhbnNwYXJlbnR8dG9wfHRoaW58dGhpY2t8dGV4dHx0ZXh0LXRvcHx0ZXh0LWJvdHRvbXx0Yi1ybHx0YWJsZS1oZWFkZXItZ3JvdXB8dGFibGUtZm9vdGVyLWdyb3VwfHN3LXJlc2l6ZXxzdXBlcnxzdHJpY3R8c3RhdGljfHNxdWFyZXxzb2xpZHxzbWFsbC1jYXBzfHNlcGFyYXRlfHNlLXJlc2l6ZXxzY3JvbGx8cy1yZXNpemV8cnRsfHJvdy1yZXNpemV8cmlkZ2V8cmlnaHR8cmVwZWF0fHJlcGVhdC15fHJlcGVhdC14fHJlbGF0aXZlfHByb2dyZXNzfHBvaW50ZXJ8b3ZlcmxpbmV8b3V0c2lkZXxvdXRzZXR8b2JsaXF1ZXxub3dyYXB8bm90LWFsbG93ZWR8bm9ybWFsfG5vbmV8bnctcmVzaXplfG5vLXJlcGVhdHxuby1kcm9wfG5ld3NwYXBlcnxuZS1yZXNpemV8bi1yZXNpemV8bW92ZXxtaWRkbGV8bWVkaXVtfGx0cnxsci10Ynxsb3dlcmNhc2V8bG93ZXItcm9tYW58bG93ZXItYWxwaGF8bG9vc2V8bGlzdC1pdGVtfGxpbmV8bGluZS10aHJvdWdofGxpbmUtZWRnZXxsaWdodGVyfGxlZnR8a2VlcC1hbGx8anVzdGlmeXxpdGFsaWN8aW50ZXItd29yZHxpbnRlci1pZGVvZ3JhcGh8aW5zaWRlfGluc2V0fGlubGluZXxpbmxpbmUtYmxvY2t8aW5oZXJpdHxpbmFjdGl2ZXxpZGVvZ3JhcGgtc3BhY2V8aWRlb2dyYXBoLXBhcmVudGhlc2lzfGlkZW9ncmFwaC1udW1lcmljfGlkZW9ncmFwaC1hbHBoYXxob3Jpem9udGFsfGhpZGRlbnxoZWxwfGhhbmR8Z3Jvb3ZlfGZpeGVkfGVsbGlwc2lzfGUtcmVzaXplfGRvdWJsZXxkb3R0ZWR8ZGlzdHJpYnV0ZXxkaXN0cmlidXRlLXNwYWNlfGRpc3RyaWJ1dGUtbGV0dGVyfGRpc3RyaWJ1dGUtYWxsLWxpbmVzfGRpc2N8ZGlzYWJsZWR8ZGVmYXVsdHxkZWNpbWFsfGRhc2hlZHxjcm9zc2hhaXJ8Y29sbGFwc2V8Y29sLXJlc2l6ZXxjaXJjbGV8Y2hhcnxjZW50ZXJ8Y2FwaXRhbGl6ZXxicmVhay13b3JkfGJyZWFrLWFsbHxib3R0b218Ym90aHxib2xkZXJ8Ym9sZHxibG9ja3xiaWRpLW92ZXJyaWRlfGJlbG93fGJhc2VsaW5lfGF1dG98YWx3YXlzfGFsbC1zY3JvbGx8YWJzb2x1dGV8dGFibGV8dGFibGUtY2VsbClcXGIiCn0se2JlZ2luOi86LyxlbmQ6L1s7fXtdLyxyZWxldmFuY2U6MCwKY29udGFpbnM6W24uQkxPQ0tfQ09NTUVOVCxyLG4uSEVYQ09MT1Isbi5DU1NfTlVNQkVSX01PREUsZS5RVU9URV9TVFJJTkdfTU9ERSxlLkFQT1NfU1RSSU5HX01PREUsbi5JTVBPUlRBTlQsbi5GVU5DVElPTl9ESVNQQVRDSF0KfSx7YmVnaW46IkAocGFnZXxmb250LWZhY2UpIixrZXl3b3Jkczp7JHBhdHRlcm46aSxrZXl3b3JkOiJAcGFnZSBAZm9udC1mYWNlIn19LHsKYmVnaW46IkAiLGVuZDoiW3s7XSIscmV0dXJuQmVnaW46ITAsa2V5d29yZHM6eyRwYXR0ZXJuOi9bYS16LV0rLywKa2V5d29yZDoiYW5kIG9yIG5vdCBvbmx5IixhdHRyaWJ1dGU6c2Uuam9pbigiICIpfSxjb250YWluczpbe2JlZ2luOmksCmNsYXNzTmFtZToia2V5d29yZCJ9LHtiZWdpbjovW2Etei1dKyg/PTopLyxjbGFzc05hbWU6ImF0dHJpYnV0ZSIKfSxyLGUuUVVPVEVfU1RSSU5HX01PREUsZS5BUE9TX1NUUklOR19NT0RFLG4uSEVYQ09MT1Isbi5DU1NfTlVNQkVSX01PREVdCn0sbi5GVU5DVElPTl9ESVNQQVRDSF19fSxncm1yX3NoZWxsOmU9Pih7bmFtZToiU2hlbGwgU2Vzc2lvbiIsCmFsaWFzZXM6WyJjb25zb2xlIiwic2hlbGxzZXNzaW9uIl0sY29udGFpbnM6W3tjbGFzc05hbWU6Im1ldGEucHJvbXB0IiwKYmVnaW46L15cc3swLDN9Wy9+XHdcZFtcXSgpQC1dKls+JSQjXVsgXT8vLHN0YXJ0czp7ZW5kOi9bXlxcXSg/PVxzKiQpLywKc3ViTGFuZ3VhZ2U6ImJhc2gifX1dfSksZ3Jtcl9zcWw6ZT0+ewpjb25zdCBuPWUucmVnZXgsdD1lLkNPTU1FTlQoIi0tIiwiJCIpLGE9WyJ0cnVlIiwiZmFsc2UiLCJ1bmtub3duIl0saT1bImJpZ2ludCIsImJpbmFyeSIsImJsb2IiLCJib29sZWFuIiwiY2hhciIsImNoYXJhY3RlciIsImNsb2IiLCJkYXRlIiwiZGVjIiwiZGVjZmxvYXQiLCJkZWNpbWFsIiwiZmxvYXQiLCJpbnQiLCJpbnRlZ2VyIiwiaW50ZXJ2YWwiLCJuY2hhciIsIm5jbG9iIiwibmF0aW9uYWwiLCJudW1lcmljIiwicmVhbCIsInJvdyIsInNtYWxsaW50IiwidGltZSIsInRpbWVzdGFtcCIsInZhcmNoYXIiLCJ2YXJ5aW5nIiwidmFyYmluYXJ5Il0scj1bImFicyIsImFjb3MiLCJhcnJheV9hZ2ciLCJhc2luIiwiYXRhbiIsImF2ZyIsImNhc3QiLCJjZWlsIiwiY2VpbGluZyIsImNvYWxlc2NlIiwiY29yciIsImNvcyIsImNvc2giLCJjb3VudCIsImNvdmFyX3BvcCIsImNvdmFyX3NhbXAiLCJjdW1lX2Rpc3QiLCJkZW5zZV9yYW5rIiwiZGVyZWYiLCJlbGVtZW50IiwiZXhwIiwiZXh0cmFjdCIsImZpcnN0X3ZhbHVlIiwiZmxvb3IiLCJqc29uX2FycmF5IiwianNvbl9hcnJheWFnZyIsImpzb25fZXhpc3RzIiwianNvbl9vYmplY3QiLCJqc29uX29iamVjdGFnZyIsImpzb25fcXVlcnkiLCJqc29uX3RhYmxlIiwianNvbl90YWJsZV9wcmltaXRpdmUiLCJqc29uX3ZhbHVlIiwibGFnIiwibGFzdF92YWx1ZSIsImxlYWQiLCJsaXN0YWdnIiwibG4iLCJsb2ciLCJsb2cxMCIsImxvd2VyIiwibWF4IiwibWluIiwibW9kIiwibnRoX3ZhbHVlIiwibnRpbGUiLCJudWxsaWYiLCJwZXJjZW50X3JhbmsiLCJwZXJjZW50aWxlX2NvbnQiLCJwZXJjZW50aWxlX2Rpc2MiLCJwb3NpdGlvbiIsInBvc2l0aW9uX3JlZ2V4IiwicG93ZXIiLCJyYW5rIiwicmVncl9hdmd4IiwicmVncl9hdmd5IiwicmVncl9jb3VudCIsInJlZ3JfaW50ZXJjZXB0IiwicmVncl9yMiIsInJlZ3Jfc2xvcGUiLCJyZWdyX3N4eCIsInJlZ3Jfc3h5IiwicmVncl9zeXkiLCJyb3dfbnVtYmVyIiwic2luIiwic2luaCIsInNxcnQiLCJzdGRkZXZfcG9wIiwic3RkZGV2X3NhbXAiLCJzdWJzdHJpbmciLCJzdWJzdHJpbmdfcmVnZXgiLCJzdW0iLCJ0YW4iLCJ0YW5oIiwidHJhbnNsYXRlIiwidHJhbnNsYXRlX3JlZ2V4IiwidHJlYXQiLCJ0cmltIiwidHJpbV9hcnJheSIsInVubmVzdCIsInVwcGVyIiwidmFsdWVfb2YiLCJ2YXJfcG9wIiwidmFyX3NhbXAiLCJ3aWR0aF9idWNrZXQiXSxzPVsiY3JlYXRlIHRhYmxlIiwiaW5zZXJ0IGludG8iLCJwcmltYXJ5IGtleSIsImZvcmVpZ24ga2V5Iiwibm90IG51bGwiLCJhbHRlciB0YWJsZSIsImFkZCBjb25zdHJhaW50IiwiZ3JvdXBpbmcgc2V0cyIsIm9uIG92ZXJmbG93IiwiY2hhcmFjdGVyIHNldCIsInJlc3BlY3QgbnVsbHMiLCJpZ25vcmUgbnVsbHMiLCJudWxscyBmaXJzdCIsIm51bGxzIGxhc3QiLCJkZXB0aCBmaXJzdCIsImJyZWFkdGggZmlyc3QiXSxvPXIsbD1bImFicyIsImFjb3MiLCJhbGwiLCJhbGxvY2F0ZSIsImFsdGVyIiwiYW5kIiwiYW55IiwiYXJlIiwiYXJyYXkiLCJhcnJheV9hZ2ciLCJhcnJheV9tYXhfY2FyZGluYWxpdHkiLCJhcyIsImFzZW5zaXRpdmUiLCJhc2luIiwiYXN5bW1ldHJpYyIsImF0IiwiYXRhbiIsImF0b21pYyIsImF1dGhvcml6YXRpb24iLCJhdmciLCJiZWdpbiIsImJlZ2luX2ZyYW1lIiwiYmVnaW5fcGFydGl0aW9uIiwiYmV0d2VlbiIsImJpZ2ludCIsImJpbmFyeSIsImJsb2IiLCJib29sZWFuIiwiYm90aCIsImJ5IiwiY2FsbCIsImNhbGxlZCIsImNhcmRpbmFsaXR5IiwiY2FzY2FkZWQiLCJjYXNlIiwiY2FzdCIsImNlaWwiLCJjZWlsaW5nIiwiY2hhciIsImNoYXJfbGVuZ3RoIiwiY2hhcmFjdGVyIiwiY2hhcmFjdGVyX2xlbmd0aCIsImNoZWNrIiwiY2xhc3NpZmllciIsImNsb2IiLCJjbG9zZSIsImNvYWxlc2NlIiwiY29sbGF0ZSIsImNvbGxlY3QiLCJjb2x1bW4iLCJjb21taXQiLCJjb25kaXRpb24iLCJjb25uZWN0IiwiY29uc3RyYWludCIsImNvbnRhaW5zIiwiY29udmVydCIsImNvcHkiLCJjb3JyIiwiY29ycmVzcG9uZGluZyIsImNvcyIsImNvc2giLCJjb3VudCIsImNvdmFyX3BvcCIsImNvdmFyX3NhbXAiLCJjcmVhdGUiLCJjcm9zcyIsImN1YmUiLCJjdW1lX2Rpc3QiLCJjdXJyZW50IiwiY3VycmVudF9jYXRhbG9nIiwiY3VycmVudF9kYXRlIiwiY3VycmVudF9kZWZhdWx0X3RyYW5zZm9ybV9ncm91cCIsImN1cnJlbnRfcGF0aCIsImN1cnJlbnRfcm9sZSIsImN1cnJlbnRfcm93IiwiY3VycmVudF9zY2hlbWEiLCJjdXJyZW50X3RpbWUiLCJjdXJyZW50X3RpbWVzdGFtcCIsImN1cnJlbnRfcGF0aCIsImN1cnJlbnRfcm9sZSIsImN1cnJlbnRfdHJhbnNmb3JtX2dyb3VwX2Zvcl90eXBlIiwiY3VycmVudF91c2VyIiwiY3Vyc29yIiwiY3ljbGUiLCJkYXRlIiwiZGF5IiwiZGVhbGxvY2F0ZSIsImRlYyIsImRlY2ltYWwiLCJkZWNmbG9hdCIsImRlY2xhcmUiLCJkZWZhdWx0IiwiZGVmaW5lIiwiZGVsZXRlIiwiZGVuc2VfcmFuayIsImRlcmVmIiwiZGVzY3JpYmUiLCJkZXRlcm1pbmlzdGljIiwiZGlzY29ubmVjdCIsImRpc3RpbmN0IiwiZG91YmxlIiwiZHJvcCIsImR5bmFtaWMiLCJlYWNoIiwiZWxlbWVudCIsImVsc2UiLCJlbXB0eSIsImVuZCIsImVuZF9mcmFtZSIsImVuZF9wYXJ0aXRpb24iLCJlbmQtZXhlYyIsImVxdWFscyIsImVzY2FwZSIsImV2ZXJ5IiwiZXhjZXB0IiwiZXhlYyIsImV4ZWN1dGUiLCJleGlzdHMiLCJleHAiLCJleHRlcm5hbCIsImV4dHJhY3QiLCJmYWxzZSIsImZldGNoIiwiZmlsdGVyIiwiZmlyc3RfdmFsdWUiLCJmbG9hdCIsImZsb29yIiwiZm9yIiwiZm9yZWlnbiIsImZyYW1lX3JvdyIsImZyZWUiLCJmcm9tIiwiZnVsbCIsImZ1bmN0aW9uIiwiZnVzaW9uIiwiZ2V0IiwiZ2xvYmFsIiwiZ3JhbnQiLCJncm91cCIsImdyb3VwaW5nIiwiZ3JvdXBzIiwiaGF2aW5nIiwiaG9sZCIsImhvdXIiLCJpZGVudGl0eSIsImluIiwiaW5kaWNhdG9yIiwiaW5pdGlhbCIsImlubmVyIiwiaW5vdXQiLCJpbnNlbnNpdGl2ZSIsImluc2VydCIsImludCIsImludGVnZXIiLCJpbnRlcnNlY3QiLCJpbnRlcnNlY3Rpb24iLCJpbnRlcnZhbCIsImludG8iLCJpcyIsImpvaW4iLCJqc29uX2FycmF5IiwianNvbl9hcnJheWFnZyIsImpzb25fZXhpc3RzIiwianNvbl9vYmplY3QiLCJqc29uX29iamVjdGFnZyIsImpzb25fcXVlcnkiLCJqc29uX3RhYmxlIiwianNvbl90YWJsZV9wcmltaXRpdmUiLCJqc29uX3ZhbHVlIiwibGFnIiwibGFuZ3VhZ2UiLCJsYXJnZSIsImxhc3RfdmFsdWUiLCJsYXRlcmFsIiwibGVhZCIsImxlYWRpbmciLCJsZWZ0IiwibGlrZSIsImxpa2VfcmVnZXgiLCJsaXN0YWdnIiwibG4iLCJsb2NhbCIsImxvY2FsdGltZSIsImxvY2FsdGltZXN0YW1wIiwibG9nIiwibG9nMTAiLCJsb3dlciIsIm1hdGNoIiwibWF0Y2hfbnVtYmVyIiwibWF0Y2hfcmVjb2duaXplIiwibWF0Y2hlcyIsIm1heCIsIm1lbWJlciIsIm1lcmdlIiwibWV0aG9kIiwibWluIiwibWludXRlIiwibW9kIiwibW9kaWZpZXMiLCJtb2R1bGUiLCJtb250aCIsIm11bHRpc2V0IiwibmF0aW9uYWwiLCJuYXR1cmFsIiwibmNoYXIiLCJuY2xvYiIsIm5ldyIsIm5vIiwibm9uZSIsIm5vcm1hbGl6ZSIsIm5vdCIsIm50aF92YWx1ZSIsIm50aWxlIiwibnVsbCIsIm51bGxpZiIsIm51bWVyaWMiLCJvY3RldF9sZW5ndGgiLCJvY2N1cnJlbmNlc19yZWdleCIsIm9mIiwib2Zmc2V0Iiwib2xkIiwib21pdCIsIm9uIiwib25lIiwib25seSIsIm9wZW4iLCJvciIsIm9yZGVyIiwib3V0Iiwib3V0ZXIiLCJvdmVyIiwib3ZlcmxhcHMiLCJvdmVybGF5IiwicGFyYW1ldGVyIiwicGFydGl0aW9uIiwicGF0dGVybiIsInBlciIsInBlcmNlbnQiLCJwZXJjZW50X3JhbmsiLCJwZXJjZW50aWxlX2NvbnQiLCJwZXJjZW50aWxlX2Rpc2MiLCJwZXJpb2QiLCJwb3J0aW9uIiwicG9zaXRpb24iLCJwb3NpdGlvbl9yZWdleCIsInBvd2VyIiwicHJlY2VkZXMiLCJwcmVjaXNpb24iLCJwcmVwYXJlIiwicHJpbWFyeSIsInByb2NlZHVyZSIsInB0ZiIsInJhbmdlIiwicmFuayIsInJlYWRzIiwicmVhbCIsInJlY3Vyc2l2ZSIsInJlZiIsInJlZmVyZW5jZXMiLCJyZWZlcmVuY2luZyIsInJlZ3JfYXZneCIsInJlZ3JfYXZneSIsInJlZ3JfY291bnQiLCJyZWdyX2ludGVyY2VwdCIsInJlZ3JfcjIiLCJyZWdyX3Nsb3BlIiwicmVncl9zeHgiLCJyZWdyX3N4eSIsInJlZ3Jfc3l5IiwicmVsZWFzZSIsInJlc3VsdCIsInJldHVybiIsInJldHVybnMiLCJyZXZva2UiLCJyaWdodCIsInJvbGxiYWNrIiwicm9sbHVwIiwicm93Iiwicm93X251bWJlciIsInJvd3MiLCJydW5uaW5nIiwic2F2ZXBvaW50Iiwic2NvcGUiLCJzY3JvbGwiLCJzZWFyY2giLCJzZWNvbmQiLCJzZWVrIiwic2VsZWN0Iiwic2Vuc2l0aXZlIiwic2Vzc2lvbl91c2VyIiwic2V0Iiwic2hvdyIsInNpbWlsYXIiLCJzaW4iLCJzaW5oIiwic2tpcCIsInNtYWxsaW50Iiwic29tZSIsInNwZWNpZmljIiwic3BlY2lmaWN0eXBlIiwic3FsIiwic3FsZXhjZXB0aW9uIiwic3Fsc3RhdGUiLCJzcWx3YXJuaW5nIiwic3FydCIsInN0YXJ0Iiwic3RhdGljIiwic3RkZGV2X3BvcCIsInN0ZGRldl9zYW1wIiwic3VibXVsdGlzZXQiLCJzdWJzZXQiLCJzdWJzdHJpbmciLCJzdWJzdHJpbmdfcmVnZXgiLCJzdWNjZWVkcyIsInN1bSIsInN5bW1ldHJpYyIsInN5c3RlbSIsInN5c3RlbV90aW1lIiwic3lzdGVtX3VzZXIiLCJ0YWJsZSIsInRhYmxlc2FtcGxlIiwidGFuIiwidGFuaCIsInRoZW4iLCJ0aW1lIiwidGltZXN0YW1wIiwidGltZXpvbmVfaG91ciIsInRpbWV6b25lX21pbnV0ZSIsInRvIiwidHJhaWxpbmciLCJ0cmFuc2xhdGUiLCJ0cmFuc2xhdGVfcmVnZXgiLCJ0cmFuc2xhdGlvbiIsInRyZWF0IiwidHJpZ2dlciIsInRyaW0iLCJ0cmltX2FycmF5IiwidHJ1ZSIsInRydW5jYXRlIiwidWVzY2FwZSIsInVuaW9uIiwidW5pcXVlIiwidW5rbm93biIsInVubmVzdCIsInVwZGF0ZSIsInVwcGVyIiwidXNlciIsInVzaW5nIiwidmFsdWUiLCJ2YWx1ZXMiLCJ2YWx1ZV9vZiIsInZhcl9wb3AiLCJ2YXJfc2FtcCIsInZhcmJpbmFyeSIsInZhcmNoYXIiLCJ2YXJ5aW5nIiwidmVyc2lvbmluZyIsIndoZW4iLCJ3aGVuZXZlciIsIndoZXJlIiwid2lkdGhfYnVja2V0Iiwid2luZG93Iiwid2l0aCIsIndpdGhpbiIsIndpdGhvdXQiLCJ5ZWFyIiwiYWRkIiwiYXNjIiwiY29sbGF0aW9uIiwiZGVzYyIsImZpbmFsIiwiZmlyc3QiLCJsYXN0IiwidmlldyJdLmZpbHRlcigoZT0+IXIuaW5jbHVkZXMoZSkpKSxjPXsKYmVnaW46bi5jb25jYXQoL1xiLyxuLmVpdGhlciguLi5vKSwvXHMqXCgvKSxyZWxldmFuY2U6MCxrZXl3b3Jkczp7YnVpbHRfaW46b319CjtyZXR1cm57bmFtZToiU1FMIixjYXNlX2luc2Vuc2l0aXZlOiEwLGlsbGVnYWw6L1t7fV18PFwvLyxrZXl3b3Jkczp7CiRwYXR0ZXJuOi9cYltcd1wuXSsvLGtleXdvcmQ6KChlLHtleGNlcHRpb25zOm4sd2hlbjp0fT17fSk9Pntjb25zdCBhPXQKO3JldHVybiBuPW58fFtdLGUubWFwKChlPT5lLm1hdGNoKC9cfFxkKyQvKXx8bi5pbmNsdWRlcyhlKT9lOmEoZSk/ZSsifDAiOmUpKQp9KShsLHt3aGVuOmU9PmUubGVuZ3RoPDN9KSxsaXRlcmFsOmEsdHlwZTppLApidWlsdF9pbjpbImN1cnJlbnRfY2F0YWxvZyIsImN1cnJlbnRfZGF0ZSIsImN1cnJlbnRfZGVmYXVsdF90cmFuc2Zvcm1fZ3JvdXAiLCJjdXJyZW50X3BhdGgiLCJjdXJyZW50X3JvbGUiLCJjdXJyZW50X3NjaGVtYSIsImN1cnJlbnRfdHJhbnNmb3JtX2dyb3VwX2Zvcl90eXBlIiwiY3VycmVudF91c2VyIiwic2Vzc2lvbl91c2VyIiwic3lzdGVtX3RpbWUiLCJzeXN0ZW1fdXNlciIsImN1cnJlbnRfdGltZSIsImxvY2FsdGltZSIsImN1cnJlbnRfdGltZXN0YW1wIiwibG9jYWx0aW1lc3RhbXAiXQp9LGNvbnRhaW5zOlt7YmVnaW46bi5laXRoZXIoLi4ucykscmVsZXZhbmNlOjAsa2V5d29yZHM6eyRwYXR0ZXJuOi9bXHdcLl0rLywKa2V5d29yZDpsLmNvbmNhdChzKSxsaXRlcmFsOmEsdHlwZTppfX0se2NsYXNzTmFtZToidHlwZSIsCmJlZ2luOm4uZWl0aGVyKCJkb3VibGUgcHJlY2lzaW9uIiwibGFyZ2Ugb2JqZWN0Iiwid2l0aCB0aW1lem9uZSIsIndpdGhvdXQgdGltZXpvbmUiKQp9LGMse2NsYXNzTmFtZToidmFyaWFibGUiLGJlZ2luOi9AW2EtejAtOV1bYS16MC05X10qL30se2NsYXNzTmFtZToic3RyaW5nIiwKdmFyaWFudHM6W3tiZWdpbjovJy8sZW5kOi8nLyxjb250YWluczpbe2JlZ2luOi8nJy99XX1dfSx7YmVnaW46LyIvLGVuZDovIi8sCmNvbnRhaW5zOlt7YmVnaW46LyIiL31dfSxlLkNfTlVNQkVSX01PREUsZS5DX0JMT0NLX0NPTU1FTlRfTU9ERSx0LHsKY2xhc3NOYW1lOiJvcGVyYXRvciIsYmVnaW46L1stKyovPSVefl18JiY/fFx8XHw/fCE9P3w8KD86PT4/fDx8Pik/fD5bPj1dPy8sCnJlbGV2YW5jZTowfV19fSxncm1yX3N3aWZ0OmU9Pntjb25zdCBuPXttYXRjaDovXHMrLyxyZWxldmFuY2U6MAp9LHQ9ZS5DT01NRU5UKCIvXFwqIiwiXFwqLyIse2NvbnRhaW5zOlsic2VsZiJdfSksYT1bZS5DX0xJTkVfQ09NTUVOVF9NT0RFLHRdLGk9ewptYXRjaDpbL1wuLyxtKC4uLnhlLC4uLk1lKV0sY2xhc3NOYW1lOnsyOiJrZXl3b3JkIn19LHI9e21hdGNoOmIoL1wuLyxtKC4uLkFlKSksCnJlbGV2YW5jZTowfSxzPUFlLmZpbHRlcigoZT0+InN0cmluZyI9PXR5cGVvZiBlKSkuY29uY2F0KFsiX3wwIl0pLG89e3ZhcmlhbnRzOlt7CmNsYXNzTmFtZToia2V5d29yZCIsCm1hdGNoOm0oLi4uQWUuZmlsdGVyKChlPT4ic3RyaW5nIiE9dHlwZW9mIGUpKS5jb25jYXQoU2UpLm1hcChrZSksLi4uTWUpfV19LGw9ewokcGF0dGVybjptKC9cYlx3Ky8sLyNcdysvKSxrZXl3b3JkOnMuY29uY2F0KFJlKSxsaXRlcmFsOkNlfSxjPVtpLHIsb10sZz1bewptYXRjaDpiKC9cLi8sbSguLi5EZSkpLHJlbGV2YW5jZTowfSx7Y2xhc3NOYW1lOiJidWlsdF9pbiIsCm1hdGNoOmIoL1xiLyxtKC4uLkRlKSwvKD89XCgpLyl9XSx1PXttYXRjaDovLT4vLHJlbGV2YW5jZTowfSxwPVt1LHsKY2xhc3NOYW1lOiJvcGVyYXRvciIscmVsZXZhbmNlOjAsdmFyaWFudHM6W3ttYXRjaDpCZX0se21hdGNoOmBcXC4oXFwufCR7TGV9KStgfV0KfV0sXz0iKFswLTldXyopKyIsaD0iKFswLTlhLWZBLUZdXyopKyIsZj17Y2xhc3NOYW1lOiJudW1iZXIiLHJlbGV2YW5jZTowLAp2YXJpYW50czpbe21hdGNoOmBcXGIoJHtffSkoXFwuKCR7X30pKT8oW2VFXVsrLV0/KCR7X30pKT9cXGJgfSx7Cm1hdGNoOmBcXGIweCgke2h9KShcXC4oJHtofSkpPyhbcFBdWystXT8oJHtffSkpP1xcYmB9LHttYXRjaDovXGIwbyhbMC03XV8qKStcYi8KfSx7bWF0Y2g6L1xiMGIoWzAxXV8qKStcYi99XX0sRT0oZT0iIik9Pih7Y2xhc3NOYW1lOiJzdWJzdCIsdmFyaWFudHM6W3sKbWF0Y2g6YigvXFwvLGUsL1swXFx0bnIiJ10vKX0se21hdGNoOmIoL1xcLyxlLC91XHtbMC05YS1mQS1GXXsxLDh9XH0vKX1dCn0pLHk9KGU9IiIpPT4oe2NsYXNzTmFtZToic3Vic3QiLG1hdGNoOmIoL1xcLyxlLC9bXHQgXSooPzpbXHJcbl18XHJcbikvKQp9KSxOPShlPSIiKT0+KHtjbGFzc05hbWU6InN1YnN0IixsYWJlbDoiaW50ZXJwb2wiLGJlZ2luOmIoL1xcLyxlLC9cKC8pLGVuZDovXCkvCn0pLHc9KGU9IiIpPT4oe2JlZ2luOmIoZSwvIiIiLyksZW5kOmIoLyIiIi8sZSksY29udGFpbnM6W0UoZSkseShlKSxOKGUpXQp9KSx2PShlPSIiKT0+KHtiZWdpbjpiKGUsLyIvKSxlbmQ6YigvIi8sZSksY29udGFpbnM6W0UoZSksTihlKV19KSxPPXsKY2xhc3NOYW1lOiJzdHJpbmciLAp2YXJpYW50czpbdygpLHcoIiMiKSx3KCIjIyIpLHcoIiMjIyIpLHYoKSx2KCIjIiksdigiIyMiKSx2KCIjIyMiKV0KfSxrPVtlLkJBQ0tTTEFTSF9FU0NBUEUse2JlZ2luOi9cWy8sZW5kOi9cXS8scmVsZXZhbmNlOjAsCmNvbnRhaW5zOltlLkJBQ0tTTEFTSF9FU0NBUEVdfV0seD17YmVnaW46L1wvW15cc10oPz1bXi9cbl0qXC8pLyxlbmQ6L1wvLywKY29udGFpbnM6a30sTT1lPT57Y29uc3Qgbj1iKGUsL1wvLyksdD1iKC9cLy8sZSk7cmV0dXJue2JlZ2luOm4sZW5kOnQsCmNvbnRhaW5zOlsuLi5rLHtzY29wZToiY29tbWVudCIsYmVnaW46YCMoPyEuKiR7dH0pYCxlbmQ6LyQvfV19fSxTPXsKc2NvcGU6InJlZ2V4cCIsdmFyaWFudHM6W00oIiMjIyIpLE0oIiMjIiksTSgiIyIpLHhdfSxBPXttYXRjaDpiKC9gLyxGZSwvYC8pCn0sQz1bQSx7Y2xhc3NOYW1lOiJ2YXJpYWJsZSIsbWF0Y2g6L1wkXGQrL30se2NsYXNzTmFtZToidmFyaWFibGUiLAptYXRjaDpgXFwkJHt6ZX0rYH1dLFQ9W3ttYXRjaDovKEB8Iyh1bik/KWF2YWlsYWJsZS8sc2NvcGU6ImtleXdvcmQiLHN0YXJ0czp7CmNvbnRhaW5zOlt7YmVnaW46L1woLyxlbmQ6L1wpLyxrZXl3b3JkczpQZSxjb250YWluczpbLi4ucCxmLE9dfV19fSx7CnNjb3BlOiJrZXl3b3JkIixtYXRjaDpiKC9ALyxtKC4uLmplKSl9LHtzY29wZToibWV0YSIsbWF0Y2g6YigvQC8sRmUpfV0sUj17Cm1hdGNoOmQoL1xiW0EtWl0vKSxyZWxldmFuY2U6MCxjb250YWluczpbe2NsYXNzTmFtZToidHlwZSIsCm1hdGNoOmIoLyhBVnxDQXxDRnxDR3xDSXxDTHxDTXxDTnxDVHxNS3xNUHxNVEt8TVRMfE5TfFNDTnxTS3xVSXxXS3xYQykvLHplLCIrIikKfSx7Y2xhc3NOYW1lOiJ0eXBlIixtYXRjaDpVZSxyZWxldmFuY2U6MH0se21hdGNoOi9bPyFdKy8scmVsZXZhbmNlOjB9LHsKbWF0Y2g6L1wuXC5cLi8scmVsZXZhbmNlOjB9LHttYXRjaDpiKC9ccysmXHMrLyxkKFVlKSkscmVsZXZhbmNlOjB9XX0sRD17CmJlZ2luOi88LyxlbmQ6Lz4vLGtleXdvcmRzOmwsY29udGFpbnM6Wy4uLmEsLi4uYywuLi5ULHUsUl19O1IuY29udGFpbnMucHVzaChEKQo7Y29uc3QgST17YmVnaW46L1woLyxlbmQ6L1wpLyxyZWxldmFuY2U6MCxrZXl3b3JkczpsLGNvbnRhaW5zOlsic2VsZiIsewptYXRjaDpiKEZlLC9ccyo6Lyksa2V5d29yZHM6Il98MCIscmVsZXZhbmNlOjAKfSwuLi5hLFMsLi4uYywuLi5nLC4uLnAsZixPLC4uLkMsLi4uVCxSXX0sTD17YmVnaW46LzwvLGVuZDovPi8sCmtleXdvcmRzOiJyZXBlYXQgZWFjaCIsY29udGFpbnM6Wy4uLmEsUl19LEI9e2JlZ2luOi9cKC8sZW5kOi9cKS8sa2V5d29yZHM6bCwKY29udGFpbnM6W3tiZWdpbjptKGQoYihGZSwvXHMqOi8pKSxkKGIoRmUsL1xzKy8sRmUsL1xzKjovKSkpLGVuZDovOi8sCnJlbGV2YW5jZTowLGNvbnRhaW5zOlt7Y2xhc3NOYW1lOiJrZXl3b3JkIixtYXRjaDovXGJfXGIvfSx7Y2xhc3NOYW1lOiJwYXJhbXMiLAptYXRjaDpGZX1dfSwuLi5hLC4uLmMsLi4ucCxmLE8sLi4uVCxSLEldLGVuZHNQYXJlbnQ6ITAsaWxsZWdhbDovWyInXS99LCQ9ewptYXRjaDpbLyhmdW5jfG1hY3JvKS8sL1xzKy8sbShBLm1hdGNoLEZlLEJlKV0sY2xhc3NOYW1lOnsxOiJrZXl3b3JkIiwKMzoidGl0bGUuZnVuY3Rpb24ifSxjb250YWluczpbTCxCLG5dLGlsbGVnYWw6Wy9cWy8sLyUvXX0sej17Cm1hdGNoOlsvXGIoPzpzdWJzY3JpcHR8aW5pdFs/IV0/KS8sL1xzKig/PVs8KF0pL10sY2xhc3NOYW1lOnsxOiJrZXl3b3JkIn0sCmNvbnRhaW5zOltMLEIsbl0saWxsZWdhbDovXFt8JS99LEY9e21hdGNoOlsvb3BlcmF0b3IvLC9ccysvLEJlXSxjbGFzc05hbWU6ewoxOiJrZXl3b3JkIiwzOiJ0aXRsZSJ9fSxVPXtiZWdpbjpbL3ByZWNlZGVuY2Vncm91cC8sL1xzKy8sVWVdLGNsYXNzTmFtZTp7CjE6ImtleXdvcmQiLDM6InRpdGxlIn0sY29udGFpbnM6W1JdLGtleXdvcmRzOlsuLi5UZSwuLi5DZV0sZW5kOi99L30KO2Zvcihjb25zdCBlIG9mIE8udmFyaWFudHMpe2NvbnN0IG49ZS5jb250YWlucy5maW5kKChlPT4iaW50ZXJwb2wiPT09ZS5sYWJlbCkpCjtuLmtleXdvcmRzPWw7Y29uc3QgdD1bLi4uYywuLi5nLC4uLnAsZixPLC4uLkNdO24uY29udGFpbnM9Wy4uLnQse2JlZ2luOi9cKC8sCmVuZDovXCkvLGNvbnRhaW5zOlsic2VsZiIsLi4udF19XX1yZXR1cm57bmFtZToiU3dpZnQiLGtleXdvcmRzOmwsCmNvbnRhaW5zOlsuLi5hLCQseix7YmVnaW5LZXl3b3Jkczoic3RydWN0IHByb3RvY29sIGNsYXNzIGV4dGVuc2lvbiBlbnVtIGFjdG9yIiwKZW5kOiJcXHsiLGV4Y2x1ZGVFbmQ6ITAsa2V5d29yZHM6bCxjb250YWluczpbZS5pbmhlcml0KGUuVElUTEVfTU9ERSx7CmNsYXNzTmFtZToidGl0bGUuY2xhc3MiLGJlZ2luOi9bQS1aYS16JF9dW1x1MDBDMC1cdTAyQjgwLTlBLVphLXokX10qL30pLC4uLmNdCn0sRixVLHtiZWdpbktleXdvcmRzOiJpbXBvcnQiLGVuZDovJC8sY29udGFpbnM6Wy4uLmFdLHJlbGV2YW5jZTowCn0sUywuLi5jLC4uLmcsLi4ucCxmLE8sLi4uQywuLi5ULFIsSV19fSxncm1yX3R5cGVzY3JpcHQ6ZT0+ewpjb25zdCBuPU9lKGUpLHQ9X2UsYT1bImFueSIsInZvaWQiLCJudW1iZXIiLCJib29sZWFuIiwic3RyaW5nIiwib2JqZWN0IiwibmV2ZXIiLCJzeW1ib2wiLCJiaWdpbnQiLCJ1bmtub3duIl0saT17CmJlZ2luS2V5d29yZHM6Im5hbWVzcGFjZSIsZW5kOi9cey8sZXhjbHVkZUVuZDohMCwKY29udGFpbnM6W24uZXhwb3J0cy5DTEFTU19SRUZFUkVOQ0VdfSxyPXtiZWdpbktleXdvcmRzOiJpbnRlcmZhY2UiLGVuZDovXHsvLApleGNsdWRlRW5kOiEwLGtleXdvcmRzOntrZXl3b3JkOiJpbnRlcmZhY2UgZXh0ZW5kcyIsYnVpbHRfaW46YX0sCmNvbnRhaW5zOltuLmV4cG9ydHMuQ0xBU1NfUkVGRVJFTkNFXX0scz17JHBhdHRlcm46X2UsCmtleXdvcmQ6aGUuY29uY2F0KFsidHlwZSIsIm5hbWVzcGFjZSIsImludGVyZmFjZSIsInB1YmxpYyIsInByaXZhdGUiLCJwcm90ZWN0ZWQiLCJpbXBsZW1lbnRzIiwiZGVjbGFyZSIsImFic3RyYWN0IiwicmVhZG9ubHkiLCJlbnVtIiwib3ZlcnJpZGUiXSksCmxpdGVyYWw6ZmUsYnVpbHRfaW46dmUuY29uY2F0KGEpLCJ2YXJpYWJsZS5sYW5ndWFnZSI6d2V9LG89e2NsYXNzTmFtZToibWV0YSIsCmJlZ2luOiJAIit0fSxsPShlLG4sdCk9Pntjb25zdCBhPWUuY29udGFpbnMuZmluZEluZGV4KChlPT5lLmxhYmVsPT09bikpCjtpZigtMT09PWEpdGhyb3cgRXJyb3IoImNhbiBub3QgZmluZCBtb2RlIHRvIHJlcGxhY2UiKTtlLmNvbnRhaW5zLnNwbGljZShhLDEsdCl9CjtyZXR1cm4gT2JqZWN0LmFzc2lnbihuLmtleXdvcmRzLHMpLApuLmV4cG9ydHMuUEFSQU1TX0NPTlRBSU5TLnB1c2gobyksbi5jb250YWlucz1uLmNvbnRhaW5zLmNvbmNhdChbbyxpLHJdKSwKbChuLCJzaGViYW5nIixlLlNIRUJBTkcoKSksbChuLCJ1c2Vfc3RyaWN0Iix7Y2xhc3NOYW1lOiJtZXRhIixyZWxldmFuY2U6MTAsCmJlZ2luOi9eXHMqWyciXXVzZSBzdHJpY3RbJyJdLwp9KSxuLmNvbnRhaW5zLmZpbmQoKGU9PiJmdW5jLmRlZiI9PT1lLmxhYmVsKSkucmVsZXZhbmNlPTAsT2JqZWN0LmFzc2lnbihuLHsKbmFtZToiVHlwZVNjcmlwdCIsYWxpYXNlczpbInRzIiwidHN4IiwibXRzIiwiY3RzIl19KSxufSxncm1yX3ZibmV0OmU9PnsKY29uc3Qgbj1lLnJlZ2V4LHQ9L1xkezEsMn1cL1xkezEsMn1cL1xkezR9LyxhPS9cZHs0fS1cZHsxLDJ9LVxkezEsMn0vLGk9LyhcZHwxWzAxMl0pKDpcZCspezAsMn0gKihBTXxQTSkvLHI9L1xkezEsMn0oOlxkezEsMn0pezEsMn0vLHM9ewpjbGFzc05hbWU6ImxpdGVyYWwiLHZhcmlhbnRzOlt7YmVnaW46bi5jb25jYXQoLyMgKi8sbi5laXRoZXIoYSx0KSwvICojLyl9LHsKYmVnaW46bi5jb25jYXQoLyMgKi8sciwvICojLyl9LHtiZWdpbjpuLmNvbmNhdCgvIyAqLyxpLC8gKiMvKX0sewpiZWdpbjpuLmNvbmNhdCgvIyAqLyxuLmVpdGhlcihhLHQpLC8gKy8sbi5laXRoZXIoaSxyKSwvICojLyl9XQp9LG89ZS5DT01NRU5UKC8nJycvLC8kLyx7Y29udGFpbnM6W3tjbGFzc05hbWU6ImRvY3RhZyIsYmVnaW46LzxcLz8vLGVuZDovPi99XQp9KSxsPWUuQ09NTUVOVChudWxsLC8kLyx7dmFyaWFudHM6W3tiZWdpbjovJy99LHtiZWdpbjovKFtcdCBdfF4pUkVNKD89XHMpL31dfSkKO3JldHVybntuYW1lOiJWaXN1YWwgQmFzaWMgLk5FVCIsYWxpYXNlczpbInZiIl0sY2FzZV9pbnNlbnNpdGl2ZTohMCwKY2xhc3NOYW1lQWxpYXNlczp7bGFiZWw6InN5bWJvbCJ9LGtleXdvcmRzOnsKa2V5d29yZDoiYWRkaGFuZGxlciBhbGlhcyBhZ2dyZWdhdGUgYW5zaSBhcyBhc3luYyBhc3NlbWJseSBhdXRvIGJpbmFyeSBieSBieXJlZiBieXZhbCBjYWxsIGNhc2UgY2F0Y2ggY2xhc3MgY29tcGFyZSBjb25zdCBjb250aW51ZSBjdXN0b20gZGVjbGFyZSBkZWZhdWx0IGRlbGVnYXRlIGRpbSBkaXN0aW5jdCBkbyBlYWNoIGVxdWFscyBlbHNlIGVsc2VpZiBlbmQgZW51bSBlcmFzZSBlcnJvciBldmVudCBleGl0IGV4cGxpY2l0IGZpbmFsbHkgZm9yIGZyaWVuZCBmcm9tIGZ1bmN0aW9uIGdldCBnbG9iYWwgZ290byBncm91cCBoYW5kbGVzIGlmIGltcGxlbWVudHMgaW1wb3J0cyBpbiBpbmhlcml0cyBpbnRlcmZhY2UgaW50byBpdGVyYXRvciBqb2luIGtleSBsZXQgbGliIGxvb3AgbWUgbWlkIG1vZHVsZSBtdXN0aW5oZXJpdCBtdXN0b3ZlcnJpZGUgbXliYXNlIG15Y2xhc3MgbmFtZXNwYWNlIG5hcnJvd2luZyBuZXcgbmV4dCBub3Rpbmhlcml0YWJsZSBub3RvdmVycmlkYWJsZSBvZiBvZmYgb24gb3BlcmF0b3Igb3B0aW9uIG9wdGlvbmFsIG9yZGVyIG92ZXJsb2FkcyBvdmVycmlkYWJsZSBvdmVycmlkZXMgcGFyYW1hcnJheSBwYXJ0aWFsIHByZXNlcnZlIHByaXZhdGUgcHJvcGVydHkgcHJvdGVjdGVkIHB1YmxpYyByYWlzZWV2ZW50IHJlYWRvbmx5IHJlZGltIHJlbW92ZWhhbmRsZXIgcmVzdW1lIHJldHVybiBzZWxlY3Qgc2V0IHNoYWRvd3Mgc2hhcmVkIHNraXAgc3RhdGljIHN0ZXAgc3RvcCBzdHJ1Y3R1cmUgc3RyaWN0IHN1YiBzeW5jbG9jayB0YWtlIHRleHQgdGhlbiB0aHJvdyB0byB0cnkgdW5pY29kZSB1bnRpbCB1c2luZyB3aGVuIHdoZXJlIHdoaWxlIHdpZGVuaW5nIHdpdGggd2l0aGV2ZW50cyB3cml0ZW9ubHkgeWllbGQiLApidWlsdF9pbjoiYWRkcmVzc29mIGFuZCBhbmRhbHNvIGF3YWl0IGRpcmVjdGNhc3QgZ2V0dHlwZSBnZXR4bWxuYW1lc3BhY2UgaXMgaXNmYWxzZSBpc25vdCBpc3RydWUgbGlrZSBtb2QgbmFtZW9mIG5ldyBub3Qgb3Igb3JlbHNlIHRyeWNhc3QgdHlwZW9mIHhvciBjYm9vbCBjYnl0ZSBjY2hhciBjZGF0ZSBjZGJsIGNkZWMgY2ludCBjbG5nIGNvYmogY3NieXRlIGNzaG9ydCBjc25nIGNzdHIgY3VpbnQgY3VsbmcgY3VzaG9ydCIsCnR5cGU6ImJvb2xlYW4gYnl0ZSBjaGFyIGRhdGUgZGVjaW1hbCBkb3VibGUgaW50ZWdlciBsb25nIG9iamVjdCBzYnl0ZSBzaG9ydCBzaW5nbGUgc3RyaW5nIHVpbnRlZ2VyIHVsb25nIHVzaG9ydCIsCmxpdGVyYWw6InRydWUgZmFsc2Ugbm90aGluZyJ9LAppbGxlZ2FsOiIvL3xcXHt8XFx9fGVuZGlmfGdvc3VifHZhcmlhbnR8d2VuZHxeXFwkICIsY29udGFpbnM6W3sKY2xhc3NOYW1lOiJzdHJpbmciLGJlZ2luOi8iKCIifFteL25dKSJDXGIvfSx7Y2xhc3NOYW1lOiJzdHJpbmciLGJlZ2luOi8iLywKZW5kOi8iLyxpbGxlZ2FsOi9cbi8sY29udGFpbnM6W3tiZWdpbjovIiIvfV19LHMse2NsYXNzTmFtZToibnVtYmVyIixyZWxldmFuY2U6MCwKdmFyaWFudHM6W3tiZWdpbjovXGJcZFtcZF9dKigoXC5bXGRfXSsoRVsrLV0/W1xkX10rKT8pfChFWystXT9bXGRfXSspKVtSRkRAISNdPy8KfSx7YmVnaW46L1xiXGRbXGRfXSooKFU/W1NJTF0pfFslJl0pPy99LHtiZWdpbjovJkhbXGRBLUZfXSsoKFU/W1NJTF0pfFslJl0pPy99LHsKYmVnaW46LyZPWzAtN19dKygoVT9bU0lMXSl8WyUmXSk/L30se2JlZ2luOi8mQlswMV9dKygoVT9bU0lMXSl8WyUmXSk/L31dfSx7CmNsYXNzTmFtZToibGFiZWwiLGJlZ2luOi9eXHcrOi99LG8sbCx7Y2xhc3NOYW1lOiJtZXRhIiwKYmVnaW46L1tcdCBdKiMoY29uc3R8ZGlzYWJsZXxlbHNlfGVsc2VpZnxlbmFibGV8ZW5kfGV4dGVybmFsc291cmNlfGlmfHJlZ2lvbilcYi8sCmVuZDovJC8sa2V5d29yZHM6ewprZXl3b3JkOiJjb25zdCBkaXNhYmxlIGVsc2UgZWxzZWlmIGVuYWJsZSBlbmQgZXh0ZXJuYWxzb3VyY2UgaWYgcmVnaW9uIHRoZW4ifSwKY29udGFpbnM6W2xdfV19fSxncm1yX3dhc206ZT0+e2UucmVnZXg7Y29uc3Qgbj1lLkNPTU1FTlQoL1woOy8sLztcKS8pCjtyZXR1cm4gbi5jb250YWlucy5wdXNoKCJzZWxmIikse25hbWU6IldlYkFzc2VtYmx5IixrZXl3b3Jkczp7JHBhdHRlcm46L1tcdy5dKy8sCmtleXdvcmQ6WyJhbnlmdW5jIiwiYmxvY2siLCJiciIsImJyX2lmIiwiYnJfdGFibGUiLCJjYWxsIiwiY2FsbF9pbmRpcmVjdCIsImRhdGEiLCJkcm9wIiwiZWxlbSIsImVsc2UiLCJlbmQiLCJleHBvcnQiLCJmdW5jIiwiZ2xvYmFsLmdldCIsImdsb2JhbC5zZXQiLCJsb2NhbC5nZXQiLCJsb2NhbC5zZXQiLCJsb2NhbC50ZWUiLCJnZXRfZ2xvYmFsIiwiZ2V0X2xvY2FsIiwiZ2xvYmFsIiwiaWYiLCJpbXBvcnQiLCJsb2NhbCIsImxvb3AiLCJtZW1vcnkiLCJtZW1vcnkuZ3JvdyIsIm1lbW9yeS5zaXplIiwibW9kdWxlIiwibXV0Iiwibm9wIiwib2Zmc2V0IiwicGFyYW0iLCJyZXN1bHQiLCJyZXR1cm4iLCJzZWxlY3QiLCJzZXRfZ2xvYmFsIiwic2V0X2xvY2FsIiwic3RhcnQiLCJ0YWJsZSIsInRlZV9sb2NhbCIsInRoZW4iLCJ0eXBlIiwidW5yZWFjaGFibGUiXQp9LGNvbnRhaW5zOltlLkNPTU1FTlQoLzs7LywvJC8pLG4se21hdGNoOlsvKD86b2Zmc2V0fGFsaWduKS8sL1xzKi8sLz0vXSwKY2xhc3NOYW1lOnsxOiJrZXl3b3JkIiwzOiJvcGVyYXRvciJ9fSx7Y2xhc3NOYW1lOiJ2YXJpYWJsZSIsYmVnaW46L1wkW1x3X10rL30sewptYXRjaDovKFwoKD8hOyl8XCkpKy8sY2xhc3NOYW1lOiJwdW5jdHVhdGlvbiIscmVsZXZhbmNlOjB9LHsKYmVnaW46Wy8oPzpmdW5jfGNhbGx8Y2FsbF9pbmRpcmVjdCkvLC9ccysvLC9cJFteXHMpXSsvXSxjbGFzc05hbWU6ezE6ImtleXdvcmQiLAozOiJ0aXRsZS5mdW5jdGlvbiJ9fSxlLlFVT1RFX1NUUklOR19NT0RFLHttYXRjaDovKGkzMnxpNjR8ZjMyfGY2NCkoPyFcLikvLApjbGFzc05hbWU6InR5cGUifSx7Y2xhc3NOYW1lOiJrZXl3b3JkIiwKbWF0Y2g6L1xiKGYzMnxmNjR8aTMyfGk2NCkoPzpcLig/OmFic3xhZGR8YW5kfGNlaWx8Y2x6fGNvbnN0fGNvbnZlcnRfW3N1XVwvaSg/OjMyfDY0KXxjb3B5c2lnbnxjdHp8ZGVtb3RlXC9mNjR8ZGl2KD86X1tzdV0pP3xlcXo/fGV4dGVuZF9bc3VdXC9pMzJ8Zmxvb3J8Z2UoPzpfW3N1XSk/fGd0KD86X1tzdV0pP3xsZSg/Ol9bc3VdKT98bG9hZCg/Oig/Ojh8MTZ8MzIpX1tzdV0pP3xsdCg/Ol9bc3VdKT98bWF4fG1pbnxtdWx8bmVhcmVzdHxuZWc/fG9yfHBvcGNudHxwcm9tb3RlXC9mMzJ8cmVpbnRlcnByZXRcL1tmaV0oPzozMnw2NCl8cmVtX1tzdV18cm90W2xyXXxzaGx8c2hyX1tzdV18c3RvcmUoPzo4fDE2fDMyKT98c3FydHxzdWJ8dHJ1bmMoPzpfW3N1XVwvZig/OjMyfDY0KSk/fHdyYXBcL2k2NHx4b3IpKVxiLwp9LHtjbGFzc05hbWU6Im51bWJlciIscmVsZXZhbmNlOjAsCm1hdGNoOi9bKy1dP1xiKD86XGQoPzpfP1xkKSooPzpcLlxkKD86Xz9cZCkqKT8oPzpbZUVdWystXT9cZCg/Ol8/XGQpKik/fDB4W1xkYS1mQS1GXSg/Ol8/W1xkYS1mQS1GXSkqKD86XC5bXGRhLWZBLUZdKD86Xz9bXGRhLWZBLURdKSopPyg/OltwUF1bKy1dP1xkKD86Xz9cZCkqKT8pXGJ8XGJpbmZcYnxcYm5hbig/OjoweFtcZGEtZkEtRl0oPzpfP1tcZGEtZkEtRF0pKik/XGIvCn1dfX0sZ3Jtcl94bWw6ZT0+ewpjb25zdCBuPWUucmVnZXgsdD1uLmNvbmNhdCgvW1xwe0x9X10vdSxuLm9wdGlvbmFsKC9bXHB7TH0wLTlfLi1dKjovdSksL1tccHtMfTAtOV8uLV0qL3UpLGE9ewpjbGFzc05hbWU6InN5bWJvbCIsYmVnaW46LyZbYS16XSs7fCYjWzAtOV0rO3wmI3hbYS1mMC05XSs7L30saT17YmVnaW46L1xzLywKY29udGFpbnM6W3tjbGFzc05hbWU6ImtleXdvcmQiLGJlZ2luOi8jP1thLXpfXVthLXoxLTlfLV0rLyxpbGxlZ2FsOi9cbi99XQp9LHI9ZS5pbmhlcml0KGkse2JlZ2luOi9cKC8sZW5kOi9cKS99KSxzPWUuaW5oZXJpdChlLkFQT1NfU1RSSU5HX01PREUsewpjbGFzc05hbWU6InN0cmluZyJ9KSxvPWUuaW5oZXJpdChlLlFVT1RFX1NUUklOR19NT0RFLHtjbGFzc05hbWU6InN0cmluZyJ9KSxsPXsKZW5kc1dpdGhQYXJlbnQ6ITAsaWxsZWdhbDovPC8scmVsZXZhbmNlOjAsY29udGFpbnM6W3tjbGFzc05hbWU6ImF0dHIiLApiZWdpbjovW1xwe0x9MC05Ll86LV0rL3UscmVsZXZhbmNlOjB9LHtiZWdpbjovPVxzKi8scmVsZXZhbmNlOjAsY29udGFpbnM6W3sKY2xhc3NOYW1lOiJzdHJpbmciLGVuZHNQYXJlbnQ6ITAsdmFyaWFudHM6W3tiZWdpbjovIi8sZW5kOi8iLyxjb250YWluczpbYV19LHsKYmVnaW46LycvLGVuZDovJy8sY29udGFpbnM6W2FdfSx7YmVnaW46L1teXHMiJz08PmBdKy99XX1dfV19O3JldHVybnsKbmFtZToiSFRNTCwgWE1MIiwKYWxpYXNlczpbImh0bWwiLCJ4aHRtbCIsInJzcyIsImF0b20iLCJ4amIiLCJ4c2QiLCJ4c2wiLCJwbGlzdCIsIndzZiIsInN2ZyJdLApjYXNlX2luc2Vuc2l0aXZlOiEwLHVuaWNvZGVSZWdleDohMCxjb250YWluczpbe2NsYXNzTmFtZToibWV0YSIsYmVnaW46LzwhW2Etel0vLAplbmQ6Lz4vLHJlbGV2YW5jZToxMCxjb250YWluczpbaSxvLHMscix7YmVnaW46L1xbLyxlbmQ6L1xdLyxjb250YWluczpbewpjbGFzc05hbWU6Im1ldGEiLGJlZ2luOi88IVthLXpdLyxlbmQ6Lz4vLGNvbnRhaW5zOltpLHIsbyxzXX1dfV0KfSxlLkNPTU1FTlQoLzwhLS0vLC8tLT4vLHtyZWxldmFuY2U6MTB9KSx7YmVnaW46LzwhXFtDREFUQVxbLyxlbmQ6L1xdXF0+LywKcmVsZXZhbmNlOjEwfSxhLHtjbGFzc05hbWU6Im1ldGEiLGVuZDovXD8+Lyx2YXJpYW50czpbe2JlZ2luOi88XD94bWwvLApyZWxldmFuY2U6MTAsY29udGFpbnM6W29dfSx7YmVnaW46LzxcP1thLXpdW2EtejAtOV0rL31dfSx7Y2xhc3NOYW1lOiJ0YWciLApiZWdpbjovPHN0eWxlKD89XHN8PikvLGVuZDovPi8sa2V5d29yZHM6e25hbWU6InN0eWxlIn0sY29udGFpbnM6W2xdLHN0YXJ0czp7CmVuZDovPFwvc3R5bGU+LyxyZXR1cm5FbmQ6ITAsc3ViTGFuZ3VhZ2U6WyJjc3MiLCJ4bWwiXX19LHtjbGFzc05hbWU6InRhZyIsCmJlZ2luOi88c2NyaXB0KD89XHN8PikvLGVuZDovPi8sa2V5d29yZHM6e25hbWU6InNjcmlwdCJ9LGNvbnRhaW5zOltsXSxzdGFydHM6ewplbmQ6LzxcL3NjcmlwdD4vLHJldHVybkVuZDohMCxzdWJMYW5ndWFnZTpbImphdmFzY3JpcHQiLCJoYW5kbGViYXJzIiwieG1sIl19fSx7CmNsYXNzTmFtZToidGFnIixiZWdpbjovPD58PFwvPi99LHtjbGFzc05hbWU6InRhZyIsCmJlZ2luOm4uY29uY2F0KC88LyxuLmxvb2thaGVhZChuLmNvbmNhdCh0LG4uZWl0aGVyKC9cLz4vLC8+LywvXHMvKSkpKSwKZW5kOi9cLz8+Lyxjb250YWluczpbe2NsYXNzTmFtZToibmFtZSIsYmVnaW46dCxyZWxldmFuY2U6MCxzdGFydHM6bH1dfSx7CmNsYXNzTmFtZToidGFnIixiZWdpbjpuLmNvbmNhdCgvPFwvLyxuLmxvb2thaGVhZChuLmNvbmNhdCh0LC8+LykpKSxjb250YWluczpbewpjbGFzc05hbWU6Im5hbWUiLGJlZ2luOnQscmVsZXZhbmNlOjB9LHtiZWdpbjovPi8scmVsZXZhbmNlOjAsZW5kc1BhcmVudDohMH1dfV19Cn0sZ3Jtcl95YW1sOmU9PnsKY29uc3Qgbj0idHJ1ZSBmYWxzZSB5ZXMgbm8gbnVsbCIsdD0iW1xcdyM7Lz86QCY9KyQsLn4qJygpW1xcXV0rIixhPXsKY2xhc3NOYW1lOiJzdHJpbmciLHJlbGV2YW5jZTowLHZhcmlhbnRzOlt7YmVnaW46LycvLGVuZDovJy99LHtiZWdpbjovIi8sZW5kOi8iLwp9LHtiZWdpbjovXFMrL31dLGNvbnRhaW5zOltlLkJBQ0tTTEFTSF9FU0NBUEUse2NsYXNzTmFtZToidGVtcGxhdGUtdmFyaWFibGUiLAp2YXJpYW50czpbe2JlZ2luOi9ce1x7LyxlbmQ6L1x9XH0vfSx7YmVnaW46LyVcey8sZW5kOi9cfS99XX1dfSxpPWUuaW5oZXJpdChhLHsKdmFyaWFudHM6W3tiZWdpbjovJy8sZW5kOi8nL30se2JlZ2luOi8iLyxlbmQ6LyIvfSx7YmVnaW46L1teXHMse31bXF1dKy99XX0pLHI9ewplbmQ6IiwiLGVuZHNXaXRoUGFyZW50OiEwLGV4Y2x1ZGVFbmQ6ITAsa2V5d29yZHM6bixyZWxldmFuY2U6MH0scz17YmVnaW46L1x7LywKZW5kOi9cfS8sY29udGFpbnM6W3JdLGlsbGVnYWw6IlxcbiIscmVsZXZhbmNlOjB9LG89e2JlZ2luOiJcXFsiLGVuZDoiXFxdIiwKY29udGFpbnM6W3JdLGlsbGVnYWw6IlxcbiIscmVsZXZhbmNlOjB9LGw9W3tjbGFzc05hbWU6ImF0dHIiLHZhcmlhbnRzOlt7CmJlZ2luOiJcXHdbXFx3IDpcXC8uLV0qOig/PVsgXHRdfCQpIn0se2JlZ2luOiciXFx3W1xcdyA6XFwvLi1dKiI6KD89WyBcdF18JCknfSx7CmJlZ2luOiInXFx3W1xcdyA6XFwvLi1dKic6KD89WyBcdF18JCkifV19LHtjbGFzc05hbWU6Im1ldGEiLGJlZ2luOiJeLS0tXFxzKiQiLApyZWxldmFuY2U6MTB9LHtjbGFzc05hbWU6InN0cmluZyIsCmJlZ2luOiJbXFx8Pl0oWzEtOV0/WystXSk/WyBdKlxcbiggKylbXiBdW15cXG5dKlxcbihcXDJbXlxcbl0rXFxuPykqIn0sewpiZWdpbjoiPCVbJT0tXT8iLGVuZDoiWyUtXT8lPiIsc3ViTGFuZ3VhZ2U6InJ1YnkiLGV4Y2x1ZGVCZWdpbjohMCxleGNsdWRlRW5kOiEwLApyZWxldmFuY2U6MH0se2NsYXNzTmFtZToidHlwZSIsYmVnaW46IiFcXHcrISIrdH0se2NsYXNzTmFtZToidHlwZSIsCmJlZ2luOiIhPCIrdCsiPiJ9LHtjbGFzc05hbWU6InR5cGUiLGJlZ2luOiIhIit0fSx7Y2xhc3NOYW1lOiJ0eXBlIixiZWdpbjoiISEiK3QKfSx7Y2xhc3NOYW1lOiJtZXRhIixiZWdpbjoiJiIrZS5VTkRFUlNDT1JFX0lERU5UX1JFKyIkIn0se2NsYXNzTmFtZToibWV0YSIsCmJlZ2luOiJcXCoiK2UuVU5ERVJTQ09SRV9JREVOVF9SRSsiJCJ9LHtjbGFzc05hbWU6ImJ1bGxldCIsYmVnaW46Ii0oPz1bIF18JCkiLApyZWxldmFuY2U6MH0sZS5IQVNIX0NPTU1FTlRfTU9ERSx7YmVnaW5LZXl3b3JkczpuLGtleXdvcmRzOntsaXRlcmFsOm59fSx7CmNsYXNzTmFtZToibnVtYmVyIiwKYmVnaW46IlxcYlswLTldezR9KC1bMC05XVswLTldKXswLDJ9KFtUdCBcXHRdWzAtOV1bMC05XT8oOlswLTldWzAtOV0pezJ9KT8oXFwuWzAtOV0qKT8oWyBcXHRdKSooWnxbLStdWzAtOV1bMC05XT8oOlswLTldWzAtOV0pPyk/XFxiIgp9LHtjbGFzc05hbWU6Im51bWJlciIsYmVnaW46ZS5DX05VTUJFUl9SRSsiXFxiIixyZWxldmFuY2U6MH0scyxvLGFdLGM9Wy4uLmxdCjtyZXR1cm4gYy5wb3AoKSxjLnB1c2goaSksci5jb250YWlucz1jLHtuYW1lOiJZQU1MIixjYXNlX2luc2Vuc2l0aXZlOiEwLAphbGlhc2VzOlsieW1sIl0sY29udGFpbnM6bH19fSk7Y29uc3QgSGU9YWU7Zm9yKGNvbnN0IGUgb2YgT2JqZWN0LmtleXMoS2UpKXsKY29uc3Qgbj1lLnJlcGxhY2UoImdybXJfIiwiIikucmVwbGFjZSgiXyIsIi0iKTtIZS5yZWdpc3Rlckxhbmd1YWdlKG4sS2VbZV0pfQpyZXR1cm4gSGV9KCkKOyJvYmplY3QiPT10eXBlb2YgZXhwb3J0cyYmInVuZGVmaW5lZCIhPXR5cGVvZiBtb2R1bGUmJihtb2R1bGUuZXhwb3J0cz1obGpzKTs='
  };
  // Execute each library in global scope (UMD attaches to window when no module/exports).
  for (var k in LIBS) {
    (0, eval)(b64ToStr(LIBS[k]));
  }
  var CSS = {
    dark: { b64: 'cHJlIGNvZGUuaGxqc3tkaXNwbGF5OmJsb2NrO292ZXJmbG93LXg6YXV0bztwYWRkaW5nOjFlbX1jb2RlLmhsanN7cGFkZGluZzozcHggNXB4fS8qIQogIFRoZW1lOiBHaXRIdWIgRGFyawogIERlc2NyaXB0aW9uOiBEYXJrIHRoZW1lIGFzIHNlZW4gb24gZ2l0aHViLmNvbQogIEF1dGhvcjogZ2l0aHViLmNvbQogIE1haW50YWluZXI6IEBIaXJzZQogIFVwZGF0ZWQ6IDIwMjEtMDUtMTUKCiAgT3V0ZGF0ZWQgYmFzZSB2ZXJzaW9uOiBodHRwczovL2dpdGh1Yi5jb20vcHJpbWVyL2dpdGh1Yi1zeW50YXgtZGFyawogIEN1cnJlbnQgY29sb3JzIHRha2VuIGZyb20gR2l0SHViJ3MgQ1NTCiovLmhsanN7Y29sb3I6I2M5ZDFkOTtiYWNrZ3JvdW5kOiMwZDExMTd9LmhsanMtZG9jdGFnLC5obGpzLWtleXdvcmQsLmhsanMtbWV0YSAuaGxqcy1rZXl3b3JkLC5obGpzLXRlbXBsYXRlLXRhZywuaGxqcy10ZW1wbGF0ZS12YXJpYWJsZSwuaGxqcy10eXBlLC5obGpzLXZhcmlhYmxlLmxhbmd1YWdlX3tjb2xvcjojZmY3YjcyfS5obGpzLXRpdGxlLC5obGpzLXRpdGxlLmNsYXNzXywuaGxqcy10aXRsZS5jbGFzc18uaW5oZXJpdGVkX18sLmhsanMtdGl0bGUuZnVuY3Rpb25fe2NvbG9yOiNkMmE4ZmZ9LmhsanMtYXR0ciwuaGxqcy1hdHRyaWJ1dGUsLmhsanMtbGl0ZXJhbCwuaGxqcy1tZXRhLC5obGpzLW51bWJlciwuaGxqcy1vcGVyYXRvciwuaGxqcy1zZWxlY3Rvci1hdHRyLC5obGpzLXNlbGVjdG9yLWNsYXNzLC5obGpzLXNlbGVjdG9yLWlkLC5obGpzLXZhcmlhYmxle2NvbG9yOiM3OWMwZmZ9LmhsanMtbWV0YSAuaGxqcy1zdHJpbmcsLmhsanMtcmVnZXhwLC5obGpzLXN0cmluZ3tjb2xvcjojYTVkNmZmfS5obGpzLWJ1aWx0X2luLC5obGpzLXN5bWJvbHtjb2xvcjojZmZhNjU3fS5obGpzLWNvZGUsLmhsanMtY29tbWVudCwuaGxqcy1mb3JtdWxhe2NvbG9yOiM4Yjk0OWV9LmhsanMtbmFtZSwuaGxqcy1xdW90ZSwuaGxqcy1zZWxlY3Rvci1wc2V1ZG8sLmhsanMtc2VsZWN0b3ItdGFne2NvbG9yOiM3ZWU3ODd9LmhsanMtc3Vic3R7Y29sb3I6I2M5ZDFkOX0uaGxqcy1zZWN0aW9ue2NvbG9yOiMxZjZmZWI7Zm9udC13ZWlnaHQ6NzAwfS5obGpzLWJ1bGxldHtjb2xvcjojZjJjYzYwfS5obGpzLWVtcGhhc2lze2NvbG9yOiNjOWQxZDk7Zm9udC1zdHlsZTppdGFsaWN9LmhsanMtc3Ryb25ne2NvbG9yOiNjOWQxZDk7Zm9udC13ZWlnaHQ6NzAwfS5obGpzLWFkZGl0aW9ue2NvbG9yOiNhZmY1YjQ7YmFja2dyb3VuZC1jb2xvcjojMDMzYTE2fS5obGpzLWRlbGV0aW9ue2NvbG9yOiNmZmRjZDc7YmFja2dyb3VuZC1jb2xvcjojNjcwNjBjfQ==', media: '(prefers-color-scheme: dark)' },
    light: { b64: 'cHJlIGNvZGUuaGxqc3tkaXNwbGF5OmJsb2NrO292ZXJmbG93LXg6YXV0bztwYWRkaW5nOjFlbX1jb2RlLmhsanN7cGFkZGluZzozcHggNXB4fS8qIQogIFRoZW1lOiBHaXRIdWIKICBEZXNjcmlwdGlvbjogTGlnaHQgdGhlbWUgYXMgc2VlbiBvbiBnaXRodWIuY29tCiAgQXV0aG9yOiBnaXRodWIuY29tCiAgTWFpbnRhaW5lcjogQEhpcnNlCiAgVXBkYXRlZDogMjAyMS0wNS0xNQoKICBPdXRkYXRlZCBiYXNlIHZlcnNpb246IGh0dHBzOi8vZ2l0aHViLmNvbS9wcmltZXIvZ2l0aHViLXN5bnRheC1saWdodAogIEN1cnJlbnQgY29sb3JzIHRha2VuIGZyb20gR2l0SHViJ3MgQ1NTCiovLmhsanN7Y29sb3I6IzI0MjkyZTtiYWNrZ3JvdW5kOiNmZmZ9LmhsanMtZG9jdGFnLC5obGpzLWtleXdvcmQsLmhsanMtbWV0YSAuaGxqcy1rZXl3b3JkLC5obGpzLXRlbXBsYXRlLXRhZywuaGxqcy10ZW1wbGF0ZS12YXJpYWJsZSwuaGxqcy10eXBlLC5obGpzLXZhcmlhYmxlLmxhbmd1YWdlX3tjb2xvcjojZDczYTQ5fS5obGpzLXRpdGxlLC5obGpzLXRpdGxlLmNsYXNzXywuaGxqcy10aXRsZS5jbGFzc18uaW5oZXJpdGVkX18sLmhsanMtdGl0bGUuZnVuY3Rpb25fe2NvbG9yOiM2ZjQyYzF9LmhsanMtYXR0ciwuaGxqcy1hdHRyaWJ1dGUsLmhsanMtbGl0ZXJhbCwuaGxqcy1tZXRhLC5obGpzLW51bWJlciwuaGxqcy1vcGVyYXRvciwuaGxqcy1zZWxlY3Rvci1hdHRyLC5obGpzLXNlbGVjdG9yLWNsYXNzLC5obGpzLXNlbGVjdG9yLWlkLC5obGpzLXZhcmlhYmxle2NvbG9yOiMwMDVjYzV9LmhsanMtbWV0YSAuaGxqcy1zdHJpbmcsLmhsanMtcmVnZXhwLC5obGpzLXN0cmluZ3tjb2xvcjojMDMyZjYyfS5obGpzLWJ1aWx0X2luLC5obGpzLXN5bWJvbHtjb2xvcjojZTM2MjA5fS5obGpzLWNvZGUsLmhsanMtY29tbWVudCwuaGxqcy1mb3JtdWxhe2NvbG9yOiM2YTczN2R9LmhsanMtbmFtZSwuaGxqcy1xdW90ZSwuaGxqcy1zZWxlY3Rvci1wc2V1ZG8sLmhsanMtc2VsZWN0b3ItdGFne2NvbG9yOiMyMjg2M2F9LmhsanMtc3Vic3R7Y29sb3I6IzI0MjkyZX0uaGxqcy1zZWN0aW9ue2NvbG9yOiMwMDVjYzU7Zm9udC13ZWlnaHQ6NzAwfS5obGpzLWJ1bGxldHtjb2xvcjojNzM1YzBmfS5obGpzLWVtcGhhc2lze2NvbG9yOiMyNDI5MmU7Zm9udC1zdHlsZTppdGFsaWN9LmhsanMtc3Ryb25ne2NvbG9yOiMyNDI5MmU7Zm9udC13ZWlnaHQ6NzAwfS5obGpzLWFkZGl0aW9ue2NvbG9yOiMyMjg2M2E7YmFja2dyb3VuZC1jb2xvcjojZjBmZmY0fS5obGpzLWRlbGV0aW9ue2NvbG9yOiNiMzFkMjg7YmFja2dyb3VuZC1jb2xvcjojZmZlZWYwfQ==', media: '(prefers-color-scheme: light)' }
  };
  for (var c in CSS) {
    var st = document.createElement('style');
    st.media = CSS[c].media;
    st.textContent = b64ToStr(CSS[c].b64);
    document.head.appendChild(st);
  }
})();
</script>

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

// Token handling (P3 security hardening):
//  - Prefer sessionStorage (cleared when tab/PWA session ends -> shorter exposure window).
//  - Keep localStorage as a DURABLE fallback so an already-installed PWA (start_url '/' has no
//    token) still works after a cold restart -> we never lock out home-screen users.
//  - After capturing a URL token, strip ?token= from the address bar via history.replaceState
//    so the secret is no longer visible / leaked via browser history / Referer / shoulder-surfing.
//    (WebSocket still needs the token in its own /ws URL since browsers cannot set WS headers;
//     that handshake is constructed from the in-memory token variable, not from the page URL.)
const urlToken = new URLSearchParams(location.search).get('token')
if (urlToken) {
  try { sessionStorage.setItem('pocket-claude-token', urlToken) } catch {}
  try { localStorage.setItem('pocket-claude-token', urlToken) } catch {}
}
let storedToken = ''
try { storedToken = sessionStorage.getItem('pocket-claude-token') || '' } catch {}
if (!storedToken) { try { storedToken = localStorage.getItem('pocket-claude-token') || '' } catch {} }
const token = urlToken || storedToken
// Clean the address bar: drop ?token= (and any other query) but keep path/hash.
if (urlToken && window.history && window.history.replaceState) {
  try { window.history.replaceState(null, '', location.pathname + location.hash) } catch {}
}
const proto = location.protocol === 'https:' ? 'wss:' : 'ws:'
let ws
let uid = 0
let currentSessionId = null
let sessions = []
let isThinking = false
let userAtBottom = true

function apiFetch(url, options = {}) {
  const headers = Object.assign({}, options.headers || {})
  if (token) headers.authorization = 'Bearer ' + token
  return fetch(url, Object.assign({}, options, { headers }))
}

function toggleSidebar() {
  sidebar.classList.toggle('open')
  overlay.classList.toggle('show')
}

// --- Session Management ---

async function loadSessions() {
  const res = await apiFetch('/api/sessions')
  sessions = await res.json()
  renderChatsList()
}

let macSessions = []

async function renderChatsList() {
  // Render local sessions first (swipe-to-reveal Rename + Delete)
  let html = ''
  if (sessions.length > 0) {
    html += '<div style="padding:6px 8px;font-size:11px;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.5px">Active</div>'
    html += sessions.map(s => {
      const active = s.id === currentSessionId ? ' active' : ''
      const bg = active ? 'var(--user-bubble)' : 'var(--bg)'
      const time = new Date(s.lastActiveAt).toLocaleDateString()
      return '<div class="session-swipe" data-session-id="' + s.id + '">' +
        '<div class="swipe-actions">' +
          '<button class="resume-btn" onclick="renameSessionUI(\\'' + s.id + '\\')">Rename</button>' +
          '<button class="delete-btn" onclick="deleteSessionUI(\\'' + s.id + '\\')">Delete</button>' +
        '</div>' +
        '<div class="session-item' + active + '" style="transition:transform 0.2s ease;position:relative;z-index:1;background:' + bg + '" onclick="switchSession(\\'' + s.id + '\\');toggleSidebar()">' +
          '<span class="name">' + escapeHtml(s.name) + '</span>' +
          '<span class="time">' + time + '</span>' +
        '</div>' +
      '</div>'
    }).join('')
  }

  // Load and render Mac sessions (swipe to reveal Resume)
  html += '<div style="padding:6px 8px;margin-top:8px;font-size:11px;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.5px">Computer Sessions</div>'
  sessionList.innerHTML = html + '<div style="padding:12px;color:var(--text-muted);font-size:12px">Loading...</div>'

  try {
    const res = await apiFetch('/api/claude-sessions')
    macSessions = await res.json()
  } catch { macSessions = [] }

  html += macSessions.map(s => {
    const last = s.lastMessage || s.firstMessage || '(empty)'
    const first = s.firstMessage || ''
    const time = timeAgo(s.lastMessageAt || s.updatedAt || s.startedAt)
    const topicLine = (first && first !== last) ? '<div style="font-size:11px;color:var(--text-muted);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;width:100%">' + escapeHtml(first) + '</div>' : ''
    const sid = s.sessionId
    const preview = escapeHtml(last).replace(/"/g, '&quot;').replace(/'/g, '')
    const cwdShort = (s.cwd || '').replace(/\\\\/g, '/').split('/').filter(Boolean).slice(-2).join('/')
    let liveBadge = ''
    if (s.status === 'busy') {
      liveBadge = '<span style="font-size:11px;color:#ff9800">&#9679; 任务运行中</span>'
    } else if (s.status === 'idle' || s.status === 'running' || s.status === 'waiting') {
      liveBadge = '<span style="font-size:11px;color:#4caf50">&#9679; 等待输入</span>'
    }
    return '<div class="session-swipe" data-claude-sid="' + sid + '" data-status="' + (s.status || '') + '" data-preview="' + preview + '">' +
      '<div class="swipe-actions"><button class="resume-btn" onclick="resumeFromSwipe(this)">Resume</button></div>' +
      '<div class="session-item" style="flex-direction:column;align-items:flex-start;gap:2px;padding:10px 12px;transition:transform 0.2s ease;position:relative;z-index:1;background:var(--bg)">' +
        '<div style="display:flex;width:100%;justify-content:space-between;align-items:center">' +
          '<span style="font-size:12px;color:var(--text-muted)">' + s.messageCount + ' msgs · ' + time + (cwdShort ? ' · &#128193; ' + escapeHtml(cwdShort) : '') + '</span>' + liveBadge +
        '</div>' +
        topicLine +
        '<div style="font-size:13px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;width:100%">' + escapeHtml(last) + '</div>' +
      '</div>' +
    '</div>'
  }).join('')

  sessionList.innerHTML = html
  initSessionSwipe()
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
  const res = await apiFetch('/api/sessions', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ name })
  })
  const session = await res.json()
  await apiFetch('/api/sessions/' + session.id, {
    method: 'PATCH',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ claudeSessionId })
  })
  session.claudeSessionId = claudeSessionId
  sessions.unshift(session)
  switchSession(session.id)
  toggleSidebar()
}

function resumeFromSwipe(btn) {
  const container = btn.closest('.session-swipe')
  const sid = container.dataset.claudeSid
  const preview = container.dataset.preview
  const st = container.dataset.status
  if (st === 'busy') {
    if (!confirm('⚠️ 这个会话正在电脑上运行任务。\\n\\n现在 Resume 会从当前上下文分叉出一个新分支，可能与电脑上正在执行的修改冲突（两边同时改同一批文件）。\\n\\n建议等电脑任务跑完（变成「等待输入」）再接管。\\n\\n仍要继续吗？')) return
  } else if (st === 'idle' || st === 'running' || st === 'waiting') {
    if (!confirm('这个会话在电脑上开着终端（空闲等输入）。\\n\\nResume 后你在手机上的对话不会显示到电脑终端里，回家后用 claude --continue 接上。\\n\\n继续？')) return
  }
  quickResume(sid, preview)
}

function initSessionSwipe() {
  const containers = document.querySelectorAll('.session-swipe')
  let activeSwipe = null

  containers.forEach(container => {
    const item = container.querySelector('.session-item')
    const btns = container.querySelectorAll('.swipe-actions button')
    const revealWidth = btns.length > 1 ? 150 : 80
    let startX = 0, startY = 0, currentX = 0, swiping = false, scrolling = false

    container.addEventListener('touchstart', e => {
      if (activeSwipe && activeSwipe !== container) {
        const prev = activeSwipe.querySelector('.session-item')
        if (prev) prev.style.transform = ''
        activeSwipe = null
      }
      const touch = e.touches[0]
      startX = touch.clientX; startY = touch.clientY; currentX = touch.clientX
      swiping = false; scrolling = false
    }, { passive: true })

    container.addEventListener('touchmove', e => {
      if (scrolling) return
      const touch = e.touches[0]
      const dx = startX - touch.clientX
      const dy = Math.abs(touch.clientY - startY)
      if (!swiping && (Math.abs(dx) > 8 || dy > 8)) {
        if (dy > Math.abs(dx)) { scrolling = true; return }
        swiping = true
      }
      if (!swiping) return
      e.preventDefault()
      currentX = touch.clientX
      const offset = Math.max(0, Math.min(dx, revealWidth + 10))
      item.style.transform = 'translateX(-' + offset + 'px)'
    }, { passive: false })

    container.addEventListener('touchend', () => {
      if (!swiping) return
      const dx = startX - currentX
      if (dx > 40) {
        item.style.transform = 'translateX(-' + revealWidth + 'px)'
        if (activeSwipe && activeSwipe !== container) {
          const prev = activeSwipe.querySelector('.session-item')
          if (prev) prev.style.transform = ''
        }
        activeSwipe = container
      } else {
        item.style.transform = ''
        activeSwipe = null
      }
      swiping = false
    })
  })
}

async function renameSessionUI(id) {
  const session = sessions.find(s => s.id === id)
  if (!session) return
  const name = prompt('Rename session:', session.name)
  if (!name || name === session.name) return
  await apiFetch('/api/sessions/' + id, {
    method: 'PATCH',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ name })
  })
  session.name = name
  renderChatsList()
  if (id === currentSessionId) { title.textContent = name; title.classList.add('renameable') }
}

function renameFromTitle() {
  if (!currentSessionId) return
  renameSessionUI(currentSessionId)
}

async function newSession() {
  const name = prompt('Session name:', 'Chat ' + new Date().toLocaleTimeString())
  if (!name) return
  const res = await apiFetch('/api/sessions', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ name }) })
  const session = await res.json()
  sessions.unshift(session)
  switchSession(session.id)
  toggleSidebar()
}

async function deleteSessionUI(id) {
  if (!confirm('Delete this session?')) return
  await apiFetch('/api/sessions/' + id, { method: 'DELETE' })
  sessions = sessions.filter(s => s.id !== id)
  if (currentSessionId === id) {
    currentSessionId = null
    clearMessages()
    title.textContent = 'Pocket Claude'
    title.classList.remove('renameable')
    emptyState.style.display = 'flex'
  }
  renderChatsList()
}

function switchSession(id) {
  currentSessionId = id
  const session = sessions.find(s => s.id === id)
  if (session) { title.textContent = session.name; title.classList.add('renameable') }
  emptyState.style.display = 'none'
  clearMessages()
  renderChatsList()
  if (ws && ws.readyState === 1) {
    ws.send(JSON.stringify({ type: 'switch_session', sessionId: id }))
  }
  if (sidebar.classList.contains('open')) toggleSidebar()
}

function clearMessages() {
  const items = messages.querySelectorAll('[data-id], .error-notice, .info-notice')
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
    } else if (data.type === 'error') {
      showErrorNotice(data.text)
    } else if (data.type === 'notice') {
      showNotice(data.text)
    } else if (data.type === 'session_updated') {
      showUpdateBanner()
    }
  }
}
connect()

// Transient error notice: shown in chat flow, NOT stored in message history.
// Must be safe when no session is selected (broadcastAll degraded/recovered notices).
function showErrorNotice(text) {
  const notice = document.createElement('div')
  notice.className = 'error-notice'
  notice.setAttribute('role', 'alert')
  notice.textContent = '⚠ ' + String(text || 'Unknown error')
  messages.insertBefore(notice, typing)
  scrollBottom()
}

// Transient neutral/positive notice (WS type:'notice'), e.g. server broadcast "已恢复正常模式".
// Reuses the transient-notice mechanism of showErrorNotice but with green/neutral styling so it
// is visually distinct from the red error notice. NOT stored in message history.
// Must be safe when no session is selected (broadcastAll recovery notices).
function showNotice(text) {
  const notice = document.createElement('div')
  notice.className = 'info-notice'
  notice.setAttribute('role', 'status')
  notice.textContent = '✓ ' + String(text || '')
  messages.insertBefore(notice, typing)
  scrollBottom()
}

function showUpdateBanner() {
  if (document.getElementById('update-banner')) return
  const banner = document.createElement('div')
  banner.id = 'update-banner'
  banner.innerHTML = '↻ New activity detected from another device. <b>Tap to reload</b>'
  banner.style.cssText = 'position:sticky;top:0;z-index:100;background:#1a1a2e;color:#e0e0e0;text-align:center;padding:10px 16px;font-size:13px;cursor:pointer;border-bottom:1px solid #333;margin:-16px -16px 12px -16px'
  banner.onclick = () => {
    banner.remove()
    if (currentSessionId && ws && ws.readyState === 1) {
      ws.send(JSON.stringify({ type: 'reload_session', sessionId: currentSessionId }))
    }
  }
  messages.insertBefore(banner, messages.firstChild)
}

// --- Messages ---

function render(text) {
  try {
    let html = DOMPurify.sanitize(marked.parse(text))
    // Add copy button to code blocks
    html = html.replace(/<pre><code(.*?)>/g, '<div class="code-block-wrapper"><button class="copy-code-btn" onclick="copyCodeBlock(this)">Copy</button><pre><code$1>')
    html = html.replace(/<\\/code><\\/pre>/g, '</code></pre></div>')
    // Colorize diff blocks: wrap +/- lines with colored spans
    html = html.replace(/(<pre><code[^>]*class="[^"]*language-diff[^"]*"[^>]*>)([\\s\\S]*?)(<\\/code>)/g, (_, open, body, close) => {
      const colored = body.split('\\n').map(line => {
        const raw = line.replace(/<[^>]+>/g, '') // strip any hljs spans
        if (raw.startsWith('+')) return '<span class="diff-add">' + line + '</span>'
        if (raw.startsWith('-')) return '<span class="diff-del">' + line + '</span>'
        return line
      }).join('\\n')
      return open + colored + close
    })
    // Add copy button to tables
    html = html.replace(/<table>/g, '<div class="table-wrapper"><button class="copy-table-btn" onclick="copyTable(this)">Copy</button><table>').replace(/<\\/table>/g, '</table></div>')
    return html
  } catch { return escapeHtml(text) }
}

function addMessage(m, animate) {
  if (document.querySelector('[data-id="' + m.id + '"]')) return
  const wrapper = document.createElement('div')
  wrapper.dataset.id = m.id
  wrapper.style.position = 'relative'
  wrapper.style.display = 'flex'
  wrapper.style.flexDirection = 'column'
  wrapper.style.alignItems = m.from === 'user' ? 'flex-end' : 'flex-start'

  const bubble = document.createElement('div')
  bubble.className = 'msg ' + m.from
  bubble.dataset.rawText = m.text || ''
  bubble.style.position = 'relative'
  bubble.style.zIndex = '1'
  const content = document.createElement('div')
  content.className = 'content'
  content.innerHTML = m.from === 'assistant' ? render(m.text) : escapeHtml(m.text).replace(/\\n/g, '<br>')
  bubble.appendChild(content)

  const time = document.createElement('div')
  time.className = 'time ' + m.from
  time.textContent = formatTime(m.ts)

  wrapper.appendChild(bubble)
  wrapper.appendChild(time)

  wrapper.addEventListener('click', () => {
    if (!selectMode) return
    wrapper.classList.toggle('selected')
    if (wrapper.classList.contains('selected')) selectedIds.add(m.id)
    else selectedIds.delete(m.id)
    updateSelectCount()
  })
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
const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
input.addEventListener('keydown', e => {
  if (e.key === 'Enter' && !e.shiftKey && !isMobile) { e.preventDefault(); send() }
})
input.addEventListener('input', autoResize)

function autoResize() {
  input.style.height = 'auto'
  input.style.height = Math.min(input.scrollHeight, 120) + 'px'
  if (!isThinking) {
    sendBtn.disabled = !input.value.trim() || !ws || ws.readyState !== 1 || !currentSessionId
  }
}

// --- Copy: code blocks and tables ---

function copyCodeBlock(btn) {
  const code = btn.parentElement.querySelector('code')
  copyToClipboard(code.textContent, btn)
}

function copyTable(btn) {
  const table = btn.parentElement.querySelector('table')
  const rows = [...table.querySelectorAll('tr')]
  const text = rows.map(r =>
    [...r.querySelectorAll('th,td')].map(c => c.textContent.trim()).join('\\t')
  ).join('\\n')
  copyToClipboard(text, btn)
}

// --- Message actions: double-tap to show popup ---

let actionPopup = null
let lastTapTime = 0
let lastTapTarget = null

messages.addEventListener('touchend', e => {
  if (selectMode) return
  const wrapper = e.target.closest('[data-id]')
  if (!wrapper) return
  const bubble = wrapper.querySelector('.msg')
  if (!bubble) return
  // Ignore taps on code blocks / tables (allow native scroll)
  if (e.target.closest('pre') || e.target.closest('table') || e.target.closest('.code-block-wrapper') || e.target.closest('.table-wrapper')) return

  const now = Date.now()
  if (lastTapTarget === bubble && now - lastTapTime < 300) {
    e.preventDefault()
    showActionPopup(bubble, e.changedTouches[0])
    lastTapTime = 0
    lastTapTarget = null
  } else {
    lastTapTime = now
    lastTapTarget = bubble
  }
})

function showActionPopup(bubble, touch) {
  dismissActionPopup()
  const popup = document.createElement('div')
  popup.className = 'action-popup'
  popup.innerHTML = '<button onclick="popupCopyText()">Copy Text</button><button onclick="popupCopyMd()">Copy Markdown</button><button onclick="popupSelect()">Select</button>'
  popup.dataset.bubbleId = bubble.closest('[data-id]').dataset.id

  // Position near tap point
  const rect = bubble.getBoundingClientRect()
  popup.style.position = 'fixed'
  popup.style.zIndex = '1000'
  const x = Math.min(touch.clientX, window.innerWidth - 180)
  const y = touch.clientY - 50
  popup.style.left = Math.max(8, x - 60) + 'px'
  popup.style.top = Math.max(8, y) + 'px'

  document.body.appendChild(popup)
  actionPopup = popup
  requestAnimationFrame(() => popup.classList.add('visible'))
}

function dismissActionPopup() {
  if (actionPopup) { actionPopup.remove(); actionPopup = null }
}

function getPopupBubble() {
  if (!actionPopup) return null
  const id = actionPopup.dataset.bubbleId
  const wrapper = document.querySelector('[data-id="' + id + '"]')
  return wrapper ? wrapper.querySelector('.msg') : null
}

function popupCopyText() {
  const bubble = getPopupBubble()
  if (bubble) copyToClipboard(bubble.innerText)
  dismissActionPopup()
}

function popupCopyMd() {
  const bubble = getPopupBubble()
  if (bubble) copyToClipboard(bubble.dataset.rawText || bubble.innerText)
  dismissActionPopup()
}

function popupSelect() {
  const bubble = getPopupBubble()
  if (bubble) {
    const wrapper = bubble.closest('[data-id]')
    selectMode = true
    document.body.classList.add('select-mode')
    wrapper.classList.add('selected')
    selectedIds.add(wrapper.dataset.id)
    updateSelectCount()
  }
  dismissActionPopup()
}

// Tap elsewhere to dismiss popup
document.addEventListener('touchstart', e => {
  if (!actionPopup) return
  if (!e.target.closest('.action-popup')) dismissActionPopup()
}, { passive: true })

// --- Multi-select mode ---

let selectMode = false
let selectedIds = new Set()

function enterSelectMode() {
  selectMode = true
  document.body.classList.add('select-mode')
  updateSelectCount()
}

function exitSelectMode() {
  selectMode = false
  selectedIds.clear()
  document.body.classList.remove('select-mode')
  messages.querySelectorAll('.selected').forEach(el => el.classList.remove('selected'))
}

function updateSelectCount() {
  const btn = document.querySelector('#select-bar .copy-btn')
  btn.textContent = selectedIds.size > 0 ? 'Copy ' + selectedIds.size + ' message' + (selectedIds.size > 1 ? 's' : '') : 'Copy Selected'
}

function copySelected() {
  const wrappers = [...messages.querySelectorAll('[data-id]')]
  const texts = wrappers
    .filter(w => selectedIds.has(w.dataset.id))
    .map(w => {
      const bubble = w.querySelector('.msg')
      const role = bubble.classList.contains('user') ? 'User' : 'Assistant'
      const text = bubble.dataset.rawText || bubble.textContent
      return '[' + role + ']\\n' + text
    })
  copyToClipboard(texts.join('\\n\\n'))
  exitSelectMode()
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
  await apiFetch('/api/sessions/' + currentSessionId, {
    method: 'PATCH',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ model, permissionMode })
  })
  const session = sessions.find(s => s.id === currentSessionId)
  if (session) { session.model = model; session.permissionMode = permissionMode }
  toggleSettings()
  status.textContent = model + ' / ' + permissionMode
}

function compactSession() {
  if (!currentSessionId || !ws || ws.readyState !== 1) return
  toggleSettings()
  const id = 'u' + Date.now() + '-compact'
  ws.send(JSON.stringify({ id, text: '/compact' }))
  addMessage({ id, from: 'user', text: '/compact', ts: Date.now() }, true)
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
    const res = await apiFetch('/api/files?path=' + encodeURIComponent(path))
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
    ta.style.cssText = 'position:fixed;top:0;left:0;width:1px;height:1px;padding:0;border:none;outline:none;box-shadow:none;background:transparent;opacity:0;font-size:16px'
    document.body.appendChild(ta)
    ta.focus()
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
  const toast = document.createElement('div')
  toast.textContent = 'Copied!'
  toast.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:rgba(0,0,0,0.75);color:#fff;padding:10px 20px;border-radius:10px;font-size:14px;z-index:9999;opacity:0;transition:opacity 0.2s;pointer-events:none'
  document.body.appendChild(toast)
  requestAnimationFrame(() => toast.style.opacity = '1')
  setTimeout(() => { toast.style.opacity = '0'; setTimeout(() => toast.remove(), 300) }, 1200)
}

// Init
loadSessions()
</script>
</body>
</html>`
