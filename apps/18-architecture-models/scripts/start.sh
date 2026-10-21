#!/usr/bin/env bash
# 本地预览：构建产物 + 静态服务器
set -euo pipefail
cd "$(dirname "$0")/.."
PORT="${PORT:-4318}"
if [ ! -d dist ]; then
  npm run build
fi
echo "→ http://127.0.0.1:${PORT}/"
exec npx --yes vite preview --host 127.0.0.1 --port "${PORT}" --strictPort
