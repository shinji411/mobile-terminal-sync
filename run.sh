#!/bin/bash
# Pocket Claude 启动脚本
# 用法:
#   ./run.sh          前台运行（能看到日志）
#   ./run.sh -d       后台运行（daemon 模式）
#   ./run.sh stop     停止后台进程
#   ./run.sh status   查看运行状态
#   ./run.sh log      查看后台日志

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PID_FILE="$HOME/.claude/channels/pocket-claude/server.pid"
LOG_FILE="$HOME/.claude/channels/pocket-claude/server.log"
WORK_DIR="${POCKET_CLAUDE_CWD:-$HOME/workspace}"

export BUN_INSTALL="$HOME/.bun"
export PATH="$BUN_INSTALL/bin:$PATH"
export POCKET_CLAUDE_CWD="$WORK_DIR"

case "${1:-}" in
  stop)
    if [ -f "$PID_FILE" ]; then
      PID=$(cat "$PID_FILE")
      if kill -0 "$PID" 2>/dev/null; then
        kill "$PID"
        rm -f "$PID_FILE"
        echo "Stopped (PID: $PID)"
      else
        rm -f "$PID_FILE"
        echo "Process not running (stale PID file removed)"
      fi
    else
      echo "Not running"
    fi
    ;;

  status)
    if [ -f "$PID_FILE" ] && kill -0 "$(cat "$PID_FILE")" 2>/dev/null; then
      echo "Running (PID: $(cat "$PID_FILE"))"
      echo "Log: $LOG_FILE"
    else
      echo "Not running"
    fi
    ;;

  log)
    if [ -f "$LOG_FILE" ]; then
      tail -50 "$LOG_FILE"
    else
      echo "No log file found"
    fi
    ;;

  -d|--daemon)
    # Stop existing if running
    if [ -f "$PID_FILE" ] && kill -0 "$(cat "$PID_FILE")" 2>/dev/null; then
      kill "$(cat "$PID_FILE")"
      sleep 1
    fi

    cd "$SCRIPT_DIR/app"
    nohup bun run server.ts > "$LOG_FILE" 2>&1 &
    echo $! > "$PID_FILE"
    sleep 2

    if kill -0 "$(cat "$PID_FILE")" 2>/dev/null; then
      echo "Started in background (PID: $(cat "$PID_FILE"))"
      head -5 "$LOG_FILE"
    else
      echo "Failed to start. Check log:"
      cat "$LOG_FILE"
      exit 1
    fi
    ;;

  *)
    # 前台运行
    cd "$SCRIPT_DIR/app"
    echo "Starting in foreground (Ctrl+C to stop)..."
    echo "Working directory: $WORK_DIR"
    echo ""
    exec bun run server.ts
    ;;
esac
