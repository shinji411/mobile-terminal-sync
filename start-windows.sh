#!/bin/bash
# pocket-claude Windows 启动脚本（git-bash）
# 用法:
#   ./start-windows.sh           前台运行（绑定 Tailscale IP，手机可访问）— 默认 Opus 4.8
#   ./start-windows.sh fable     改用 Fable 5
#   ./start-windows.sh local     仅绑定 127.0.0.1（本机测试）
#   ./start-windows.sh rotate    轮换 token 后启动
#   参数可组合，例如:  ./start-windows.sh fable local
#
# 机器相关 / 私有配置（bun 路径、Tailscale 路径、工作目录、AWS profile 等）
# 放在 env.local.sh（已 gitignore）。首次使用: cp env.example.sh env.local.sh 并填写。

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

# --- 载入本地环境（如果存在）---
[ -f "$SCRIPT_DIR/env.local.sh" ] && . "$SCRIPT_DIR/env.local.sh"

# 兜底默认值：未在 env.local.sh 设置时使用 PATH 上的 bun / 标准 Tailscale 路径
BUN="${PC_BUN:-bun}"
TAILSCALE="${PC_TAILSCALE:-/c/Program Files/Tailscale/tailscale.exe}"
TOKEN_FILE="$HOME/.claude/channels/pocket-claude/token"

# --- 模型选择 ---
# 默认 Opus 4.8；传入 fable 参数则切到 Fable 5。
# 把模型参数从位置参数里摘出来，剩下的（local/rotate）原样传给后面的逻辑。
MODEL_ID="us.anthropic.claude-opus-4-8"
REST_ARGS=()
for arg in "$@"; do
  case "$arg" in
    fable|fable5|fable-5)  MODEL_ID="us.anthropic.claude-fable-5" ;;
    opus|opus4.8|4.8)      MODEL_ID="us.anthropic.claude-opus-4-8" ;;
    *)                     REST_ARGS+=("$arg") ;;
  esac
done
set -- "${REST_ARGS[@]}"
echo "Model: $MODEL_ID"

# Claude Code 运行环境。默认用你现有的 Claude Code 登录（Anthropic API / 订阅）。
# 若在 env.local.sh 设了 PC_USE_BEDROCK=1，则改走 AWS Bedrock。
if [ "${PC_USE_BEDROCK:-}" = "1" ]; then
  export CLAUDE_CODE_USE_BEDROCK=1
  export ANTHROPIC_MODEL="$MODEL_ID"
  [ -n "${PC_AWS_PROFILE:-}" ] && export AWS_PROFILE="$PC_AWS_PROFILE"
  export AWS_REGION="${PC_AWS_REGION:-us-east-1}"
  echo "Backend: AWS Bedrock (profile=${AWS_PROFILE:-default}, region=$AWS_REGION)"
fi

# 砍掉每次 spawn 的非必要开销（自动更新检查/遥测），实测省 ~6s/条
export DISABLE_AUTOUPDATER=1
export DISABLE_TELEMETRY=1
export CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC=1

# 交互式对话/审批转发：让服务在 initialize 握手声明 supportedDialogKinds，
# 使 Claude 的 AskUserQuestion / plan 确认 / 工具审批弹到手机（否则 CLI
# fail-closed 静默降级、手机收不到提问）。详见 app/server.ts DIALOGS_ENABLED。
# 如需临时关闭：在 env.local.sh 设 POCKET_CLAUDE_DIALOGS=0。
export POCKET_CLAUDE_DIALOGS="${POCKET_CLAUDE_DIALOGS:-1}"

# 工作目录：手机新建会话即在此目录启动（带上你的 CLAUDE.md / agents / skills）。
# 默认当前目录；在 env.local.sh 用 POCKET_CLAUDE_CWD 指定你的项目目录。
export POCKET_CLAUDE_CWD="${POCKET_CLAUDE_CWD:-$(pwd)}"

if [ "${1:-}" = "rotate" ]; then
  rm -f "$TOKEN_FILE"
  echo "Token rotated."
  shift
fi

if [ "${1:-}" = "local" ]; then
  export POCKET_CLAUDE_HOST="127.0.0.1"
else
  TS_IP=$("$TAILSCALE" ip -4 2>/dev/null | head -1 | tr -d '\r')
  if [ -z "$TS_IP" ]; then
    echo "错误: 未获取到 Tailscale IP。请先打开 Tailscale 并登录，或用 ./start-windows.sh local 仅本机运行。"
    exit 1
  fi
  # 安全要点：只绑定 Tailscale 虚拟网卡 IP，绝不绑定 0.0.0.0
  export POCKET_CLAUDE_HOST="$TS_IP"
  echo "Binding to Tailscale IP: $TS_IP (LAN/公网不可达)"
fi

cd "$SCRIPT_DIR/app"
exec "$BUN" server.ts
