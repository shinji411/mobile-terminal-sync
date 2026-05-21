# mobile-terminal-sync

Sync your Mac Claude Code sessions to iPhone with a native chat UI — like claude.ai on your phone.

## Two Approaches

### 1. Claude Mobile (Recommended) — Chat UI

A claude.ai-like interface on your phone that syncs with Claude Code via MCP channel.

```
┌─────────────────┐     Tailscale      ┌─────────────────┐
│   iPhone Safari │◄──────────────────►│   Mac           │
│   Chat UI (PWA) │     WebSocket       │   Claude Code   │
│   Markdown +    │                     │   + MCP Server  │
│   Code Highlight│                     │                 │
└─────────────────┘                     └─────────────────┘
```

Features:
- Chat bubble UI (like claude.ai)
- Markdown rendering + code syntax highlighting
- Dark/light theme (follows system)
- PWA — add to home screen for app-like experience
- Message history persisted (SQLite)
- Token-based auth
- Auto-reconnect on network changes

#### Setup

```bash
# 1. Install Bun (if not installed)
curl -fsSL https://bun.sh/install | bash

# 2. Install the plugin in Claude Code
claude
/plugin install claude-mobile   # from this directory

# 3. Restart Claude Code with channel enabled
claude --channels plugin:claude-mobile

# Server prints URL with token:
# claude-mobile: http://0.0.0.0:3210?token=<your-token>
```

#### Connect from iPhone

Open in Safari: `http://<tailscale-ip>:3210?token=<your-token>`

Tip: Add to Home Screen for full-screen PWA experience.

---

### 2. tmux + SSH (Fallback) — Raw Terminal

For when you just need quick terminal access without the fancy UI.

```bash
# Mac
tmux new -s claude

# iPhone (Termius/Blink Shell)
ssh user@<tailscale-ip>
tmux attach -t claude
```

See `tmux.conf` for mobile-optimized config.

---

## Network Setup (Tailscale)

Both approaches need your Mac and iPhone on the same network:

1. Install [Tailscale](https://tailscale.com/download) on Mac + iPhone
2. Login with same account
3. Get Mac IP: `tailscale ip -4`

## Files

```
├── claude-mobile/          # Chat UI approach
│   ├── server.ts           # MCP server + HTTP + WebSocket
│   ├── auth.ts             # Token authentication
│   ├── db.ts               # SQLite message persistence
│   ├── ui.ts               # Chat UI (HTML/CSS/JS)
│   └── package.json
├── tmux.conf               # tmux config (fallback approach)
├── start-claude.sh         # tmux helper script
└── notify-waiting.sh       # Push notification script (Bark)
```

## Security

- Token auth prevents unauthorized access
- Tailscale provides encrypted tunnel (WireGuard)
- Server only accessible via Tailscale network (not public internet)
- No data leaves your devices

## License

MIT
