# Changelog

## [Unreleased] - 2026-06-15

### Fixed (Computer Sessions list — duplicate conversation entries)
- Resuming a session forks a new `.jsonl` (new sessionId) that shares its
  parent's cwd + opening user message, so one conversation appeared as many
  near-identical rows (a wall of "继续"). `/api/claude-sessions` now collapses
  each lineage — keyed by `(cwd, firstMessage)` — to a single entry, keeping the
  most recently active fork (empty firstMessage falls back to sessionId so
  unrelated sessions are never merged). Verified on real data: 46 → 36 entries.

### Changed (migrate session engine to the Claude Agent SDK)
- The per-session engine now uses `@anthropic-ai/claude-agent-sdk` `query()`
  with streaming input instead of hand-spawning `claude -p --input-format
  stream-json`. The SDK owns the claude subprocess, resume, and the control
  protocol; the server feeds user turns through an AsyncIterable and consumes
  the `SDKMessage` stream (whose shapes match the old raw events, so the turn
  parser is reused unchanged).
- **Interactive dialogs / approvals now actually work on the phone.** The SDK's
  `canUseTool` callback surfaces AskUserQuestion (multiple-choice + free-text)
  and tool-permission asks; the server forwards them as `approval_request`,
  awaits the phone's `approval_response`, and resolves the callback with
  `{behavior:'allow', updatedInput:{...input, answers:{...}}}` (or deny). This
  replaces the raw-CLI `control_request` scaffold, which (verified) never
  surfaced AskUserQuestion in `-p` mode. Confirmed working end-to-end **under
  `bypassPermissions`** — ordinary tools still run automatically, but Claude's
  questions reach the phone.
- Removed the one-shot fallback path and the persistent-mode degradation latch
  (SDK is the sole, reliable engine); abort now uses `Query.interrupt()` and
  stream teardown instead of taskkill tree-walking; `/api/health` reports
  `mode:'sdk'` + pending-dialog count.

### Fixed (realtime layer — phone "reconnecting" / stale session / dropped messages)
- **WS keep-alive**: added `idleTimeout: 300` to the Bun `websocket` config + a
  client-side 25s ping/pong heartbeat. Bun's default ~120s idle close was tearing
  down sockets while an iOS PWA was backgrounded, leaving a half-open connection
  that silently dropped every `delta`/`status` event (root cause of "reconnecting"
  forever and the typing animation flashing then vanishing with no new message).
- **Reconnect**: exponential backoff (1s→15s, reset on clean open), single pending
  timer (no connection storms), half-open detection (no pong within 60s → force
  reconnect), and proactive reconnect on `visibilitychange`/`online` so returning
  to the foreground reconnects immediately instead of waiting out the timer.
- **In-flight bubbles**: `delta`/`complete` now auto-create the assistant bubble if
  it's missing (the originating `msg` was lost to a dropped socket), so streamed
  output after a reconnect is never silently discarded.
- **Auto-reload on resume**: `session_updated` now auto-triggers `reload_session`
  instead of only showing a manual "tap to reload" banner — messages load without
  a tab/refocus.

### Added (interactive dialogs / approvals — feature-flagged)
- `control_request` protocol bridge over the persistent stream-json channel:
  forwards Claude's interactive `request_user_dialog` (AskUserQuestion multiple-
  choice + free-text, plan-mode confirmation) and `can_use_tool` permission prompts
  to the phone as `approval_request`, collects the answer, and writes the matching
  `control_response` back to the CLI's stdin so the turn continues.
- `initialize` handshake declaring `supportedDialogKinds`
  (`ask_user_question`, `plan_dialog_choice`, `refusal_fallback_prompt`) — without
  this the CLI fails closed and silently proceeds without the user's answer.
- Phone UI: in-chat approval card (question/options/multiSelect/free-text; tool
  Allow/Deny), per-dialog timeout (`POCKET_CLAUDE_DIALOG_TIMEOUT_MS`, default 5min),
  and cleanup of pending dialogs when the process dies.
- **Gated behind `POCKET_CLAUDE_DIALOGS=1`** (default off) pending a live protocol
  probe of the `initialize` handshake against the installed CLI (2.1.177). Transport
  wiring verified locally (ping/pong, bogus-response safety, clean spawn with flag on);
  the live dialog round-trip still needs valid Bedrock creds to exercise.

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
