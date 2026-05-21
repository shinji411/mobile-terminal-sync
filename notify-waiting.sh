#!/bin/bash
# 监控 Claude Code 是否在等待用户输入，推送通知到 iPhone
# 依赖: Bark (iOS App Store 免费)
# 用法: ./notify-waiting.sh

# ============ 配置 ============
BARK_DEVICE_KEY=""  # 填入你的 Bark device key
BARK_SERVER="https://api.day.app"
SESSION_NAME="claude"
CHECK_INTERVAL=5  # 秒
# ==============================

if [ -z "$BARK_DEVICE_KEY" ]; then
    echo "错误: 请编辑此脚本，填入 BARK_DEVICE_KEY"
    echo "打开 Bark App 获取你的 device key"
    exit 1
fi

send_notification() {
    local title="$1"
    local body="$2"
    curl -s "${BARK_SERVER}/${BARK_DEVICE_KEY}/${title}/${body}?sound=minuet" > /dev/null
}

last_notified=0

echo "开始监控 tmux 会话 '$SESSION_NAME'..."
echo "按 Ctrl+C 停止"

while true; do
    # 捕获 tmux 面板最后几行
    content=$(tmux capture-pane -t "$SESSION_NAME" -p 2>/dev/null | tail -5)

    if [ $? -ne 0 ]; then
        sleep "$CHECK_INTERVAL"
        continue
    fi

    now=$(date +%s)

    # 检测 Claude 是否在等待输入（常见的等待模式）
    if echo "$content" | grep -qE '(❯|›|\$|>)\s*$'; then
        # 避免重复通知（至少间隔 60 秒）
        if [ $((now - last_notified)) -gt 60 ]; then
            send_notification "Claude Code" "等待你的输入"
            last_notified=$now
            echo "[$(date '+%H:%M:%S')] 已发送通知"
        fi
    fi

    sleep "$CHECK_INTERVAL"
done
