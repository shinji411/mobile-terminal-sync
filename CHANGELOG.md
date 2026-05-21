# Changelog

## [0.2.0] - 2026-05-21

### Added
- Multi-session management (create, switch, rename, delete)
- Stream output with `--include-partial-messages` (real-time delta)
- Abort/interrupt running conversations (SIGINT)
- Model switching (opus/sonnet/haiku) per session
- Permission mode switching (auto/bypass/plan) per session
- Resume any Mac Claude Code session from phone
- Session recap via haiku (AI-generated summary)
- Load full conversation history on resume
- File browser with syntax highlighting
- Copy file path with iOS fallback + toast notification
- Settings bottom sheet (model + mode)
- Per-session process management (concurrent sessions)
- `run.sh` launcher (foreground/daemon/stop/status/log)

### Changed
- Sidebar simplified: 3 tabs → 2 tabs (Chats + Files)
- Resume flow: 4 steps → 1 tap (unified Chats list)
- Tables/code blocks: horizontal scroll on mobile

### Fixed
- iOS clipboard API fallback for copy path
- Table overflow on narrow screens

## [0.1.0] - 2026-05-21

### Added
- Initial release
- Chat bubble UI (claude.ai-like)
- Markdown rendering (marked.js) + code highlighting (highlight.js)
- Dark/light theme (follows system)
- PWA support (add to home screen)
- Token-based authentication
- SQLite message persistence
- Tailscale VPN connectivity
- tmux fallback approach (config + scripts)
