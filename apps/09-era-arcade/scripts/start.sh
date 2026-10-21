#!/usr/bin/env bash
# 霓虹街廊 · 街机可玩展厅 —— 一键启动
# 安装依赖（如未安装）并在 http://127.0.0.1:4329 启动开发服务器。
set -euo pipefail

cd "$(dirname "$0")/.."

if [ ! -d node_modules ]; then
  echo "[neon-corridor] 正在安装依赖…"
  npm install --no-audit --no-fund
fi

echo "[neon-corridor] 启动开发服务器： http://127.0.0.1:4329"
exec npm run dev
