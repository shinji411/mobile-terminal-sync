# pocket-claude — local environment template
#
# Copy this file to env.local.sh and fill in your own values.
#   cp env.example.sh env.local.sh
# env.local.sh is gitignored and holds your machine-specific / private values.
# Every value below is optional — the scripts fall back to sensible defaults
# if a variable is left unset.

# --- Windows launcher (start-windows.sh) ---------------------------------
# Absolute path to the bun executable. Leave unset to use `bun` on your PATH.
# Example (WinGet install): /c/Users/<you>/AppData/Local/Microsoft/WinGet/Packages/Oven-sh.Bun_.../bun.exe
export PC_BUN=""

# Absolute path to the tailscale CLI. Defaults to /c/Program Files/Tailscale/tailscale.exe
export PC_TAILSCALE=""

# Working directory Claude sessions run in (your project / agent home).
# Example: C:/Users/<you>/projects/myrepo   — defaults to the current dir.
export POCKET_CLAUDE_CWD=""

# --- Claude Code model backend (optional) --------------------------------
# Only needed if you run Claude Code via AWS Bedrock. Leave blank to use
# your existing Claude Code auth (Anthropic API / subscription).
export PC_USE_BEDROCK=""          # set to 1 to enable the Bedrock env below
export PC_AWS_PROFILE=""          # your AWS profile name
export PC_AWS_REGION="us-east-1"

# --- tmux launcher (start-claude.sh) -------------------------------------
export PC_WORK_DIR=""             # defaults to ~/workspace

# --- E2E tests (test-e2e.ts) ---------------------------------------------
# Host:port the test client connects to. Defaults to 127.0.0.1:3210.
export PC_TEST_HOST=""
