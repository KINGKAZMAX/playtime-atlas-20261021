#!/usr/bin/env bash
# 一键启动：安装依赖（若缺失）后在 127.0.0.1:4328 拉起开发服务器。
set -euo pipefail
cd "$(dirname "$0")/.."

if [ ! -d node_modules ]; then
  echo "[lumen-era] 正在安装本地依赖…"
  npm install --no-audit --no-fund
fi

echo "[lumen-era] 展厅: http://127.0.0.1:4328"
echo "[lumen-era] 展品 08-A: http://127.0.0.1:4328/rally.html"
echo "[lumen-era] 展品 08-B: http://127.0.0.1:4328/gravity.html"
exec npx vite --host 127.0.0.1 --port 4328 --strictPort
