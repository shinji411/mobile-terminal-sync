#!/bin/bash
# 启动 Claude Code tmux 会话
# 用法: ./start-claude.sh [工作目录]

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
[ -f "$SCRIPT_DIR/env.local.sh" ] && . "$SCRIPT_DIR/env.local.sh"

SESSION_NAME="claude"
# 优先级: 命令行参数 > env.local.sh 的 PC_WORK_DIR > ~/workspace
WORK_DIR="${1:-${PC_WORK_DIR:-$HOME/workspace}}"

# 如果会话已存在，直接 attach
if tmux has-session -t "$SESSION_NAME" 2>/dev/null; then
    echo "会话 '$SESSION_NAME' 已存在，正在 attach..."
    tmux attach -t "$SESSION_NAME"
    exit 0
fi

# 创建新会话
tmux new-session -d -s "$SESSION_NAME" -c "$WORK_DIR"

# 启动 claude code
tmux send-keys -t "$SESSION_NAME" "claude" Enter

# attach 到会话
tmux attach -t "$SESSION_NAME"
