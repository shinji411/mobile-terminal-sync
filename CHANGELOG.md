# Changelog

## [1.0.0] - 2026-05-23

### Changed
- Project restructure: `claude-mobile/` → `app/`
- Runtime data path: `~/.claude/channels/claude-mobile/` → `~/.claude/channels/pocket-claude/`
- Environment variables renamed: `CLAUDE_MOBILE_*` → `POCKET_CLAUDE_*`
- Tab icon: custom pocket SVG (was robot emoji)
- Version bump to 1.0

## [0.4.0] - 2026-05-22

### Added
- Tool use visibility: see file edits (diff view), bash commands, and file reads in real-time on phone
- Diff colorization: added/removed lines highlighted in green/red
- Session freshness detection: banner appears when Mac terminal updates a session
- Reload from JSONL: tap banner to refresh with latest messages from any device
- Mac session preview: shows last user message + topic (first message) for better context
- Session rename from header: tap title to rename active session
- Default model changed to opus

### Changed
- Session list: swipe-to-reveal for both active (Rename/Delete) and Mac sessions (Resume)
- Active sessions: single tap switches directly, no overlay
- Streaming: tool use blocks show file path hint during generation, full diff on completion
- Sort Mac sessions by last message timestamp

### Fixed
- Duplicate content display during streaming (assistant message handler conflict)
- File watcher false triggers from own process writes (5s cooldown + size tracking)
- Stop button appearing disabled during thinking (autoResize override)
- Regex escaping in template literal (highlight.js diff colorizer)
- highlight.js CDN URL updated to cdnjs (jsdelivr path broken)
- Removed reference to deleted `dismissSessionActions` function

## [0.3.0] - 2026-05-22

### Added
- Double-tap message bubble to show action popup (Copy Text / Copy Markdown / Select)
- Token auto-persisted to localStorage for PWA home screen launch
- Configuration file support (`config.json`) with all settings externalized

### Changed
- Message actions: swipe-to-reveal → double-tap popup (avoids conflict with code/table horizontal scroll)
- Copy toast: centered dark overlay style, no longer shows copied content
- Message layout: wrapper uses flex column for proper bubble alignment

### Fixed
- Message bubbles stacking/overlapping after action button implementation
- iOS copy fallback causing brown flash (textarea focus highlight)

### Removed
- Old action sheet UI (bottom slide-up panel)
- Swipe gesture handler (conflicted with scrollable content)

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
