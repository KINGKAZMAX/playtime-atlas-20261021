#!/usr/bin/env bash
#
# 霜隙远航 · Frostgap Voyager
# 本地一键启动脚本（仅监听 127.0.0.1，不对外网发布）
#
set -euo pipefail

cd "$(dirname "$0")/.."

HOST="127.0.0.1"
PORT="4314"

if ! command -v node >/dev/null 2>&1; then
  echo "错误：未找到 node，请先安装 Node.js 18+。"
  exit 1
fi

NODE_MAJOR="$(node -p 'process.versions.node.split(".")[0]')"
if [ "$NODE_MAJOR" -lt 18 ]; then
  echo "错误：Node.js 版本过低（当前 $(node -v)），需要 18 或更高。"
  exit 1
fi

if [ ! -d "node_modules" ]; then
  echo "→ 首次运行，正在安装本地依赖（three / vite）…"
  npm install --no-audit --no-fund
fi

# 端口占用时自动顺延，最多尝试 10 次
attempt=0
while true; do
  if lsof -nP -iTCP:"$PORT" -sTCP:LISTEN >/dev/null 2>&1; then
    attempt=$((attempt + 1))
    if [ "$attempt" -gt 10 ]; then
      echo "错误：端口 $PORT 及其后 10 个端口均被占用。"
      exit 1
    fi
    PORT=$((PORT + 1))
    echo "→ 端口被占用，尝试 $PORT …"
  else
    break
  fi
done

echo ""
echo "  ╔══════════════════════════════════════════════╗"
echo "  ║         霜隙远航 · FROSTGAP VOYAGER          ║"
echo "  ╚══════════════════════════════════════════════╝"
echo ""
echo "  地址：http://$HOST:$PORT"
echo "  按 Ctrl+C 停止服务"
echo ""

exec npx vite --host "$HOST" --port "$PORT" --strictPort
