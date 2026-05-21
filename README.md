# mobile-terminal-sync

Sync your Mac terminal (Claude Code / any CLI) to your iPhone in real-time. View and interact from anywhere.

## How It Works

```
┌─────────────┐     Tailscale VPN     ┌─────────────┐
│   Mac       │◄────────────────────►│   iPhone    │
│   tmux      │     SSH + attach      │   Termius   │
│   session   │                       │   / Blink   │
└─────────────┘                       └─────────────┘
```

Your Mac runs a persistent tmux session. Your iPhone connects via SSH (over Tailscale for anywhere-access) and attaches to the same session. Both sides see identical output and can type input.

## Requirements

| Component | Purpose | Install |
|-----------|---------|---------|
| tmux | Session persistence & sharing | `brew install tmux` |
| Tailscale | Zero-config VPN (Mac ↔ iPhone) | [tailscale.com/download](https://tailscale.com/download) |
| Termius / Blink Shell | iOS SSH client | App Store |

## Quick Start

### 1. Install (Mac)

```bash
brew install tmux
cp tmux.conf ~/.tmux.conf
```

### 2. Enable Remote Login (Mac)

System Settings → General → Sharing → Remote Login → ON

### 3. Setup Tailscale

- Install on both Mac and iPhone
- Login with the same account
- Note your Mac's Tailscale IP: `tailscale ip -4`

### 4. Start a session (Mac)

```bash
# Option A: manual
tmux new -s claude

# Option B: use the helper script
./start-claude.sh
```

### 5. Connect from iPhone

In Termius / Blink Shell:

```bash
ssh <username>@<tailscale-ip>
tmux attach -t claude
```

Done. Both screens are now synced.

## Troubleshooting

### "sessions should be nested with care"

Your SSH client is auto-starting tmux. Either disable that in Termius settings, or:

```bash
unset TMUX && tmux attach -t claude
```

### Chinese / Unicode not displaying

In Termius: Settings → Terminal → change font to one with CJK support (e.g., Menlo, PingFang). Ensure encoding is UTF-8.

### Connection drops when iPhone locks

This is iOS killing background apps. The tmux session on Mac stays alive — just reconnect and `tmux attach -t claude` again. Using Blink Shell with mosh can help maintain connections.

## Optional: Push Notifications

Get notified on iPhone when Claude Code is waiting for your input.

1. Install [Bark](https://apps.apple.com/app/bark/id1403753865) on iPhone
2. Edit `notify-waiting.sh` — fill in your Bark device key
3. Run in a separate terminal: `./notify-waiting.sh`

## Files

| File | Description |
|------|-------------|
| `tmux.conf` | tmux config optimized for mobile (mouse support, Ctrl-a prefix, clean status bar) |
| `start-claude.sh` | Helper to create/attach claude tmux session |
| `notify-waiting.sh` | Optional push notification when Claude awaits input |

## Uninstall

```bash
brew uninstall tmux
rm ~/.tmux.conf
# Remove Tailscale from Applications
# Remove Termius/Blink from iPhone
```

## License

MIT
