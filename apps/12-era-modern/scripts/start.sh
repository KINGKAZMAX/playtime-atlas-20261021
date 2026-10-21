#!/usr/bin/env bash
# 折光纪 · 当代可玩展厅 —— 一键启动
# 用法：bash scripts/start.sh
set -euo pipefail

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$DIR"

PORT=4332
HOST=127.0.0.1

if ! command -v node >/dev/null 2>&1; then
  echo "❌ 未找到 node，请先安装 Node.js 18+。"
  exit 1
fi

if [ ! -d node_modules ]; then
  echo "→ 首次运行，正在安装依赖（npm install）…"
  npm install
fi

echo "→ 启动《折光纪 · 当代可玩展厅》"
echo "  地址：http://${HOST}:${PORT}"
echo "  展厅：http://${HOST}:${PORT}/#/"
echo "  脉冲走廊：http://${HOST}:${PORT}/#/pulse"
echo "  折光阁：http://${HOST}:${PORT}/#/atrium"
echo "  光环台：http://${HOST}:${PORT}/#/halo"
echo "  （Ctrl+C 结束）"

exec npx vite --host "$HOST" --port "$PORT" --strictPort
