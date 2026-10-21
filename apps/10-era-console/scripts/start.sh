#!/usr/bin/env bash
# 10-era-console — 一键启动（安装依赖 + 本地开发服务）
# 端口固定 127.0.0.1:4330（与批次约定一致）
set -euo pipefail
cd "$(dirname "$0")/.."

if [ ! -d node_modules ]; then
  echo "→ 未检测到依赖，正在安装 npm 依赖…"
  npm install --no-audit --no-fund
fi

echo "→ 启动开发服务：http://127.0.0.1:4330/"
exec npx vite --host 127.0.0.1 --port 4330 --strictPort
