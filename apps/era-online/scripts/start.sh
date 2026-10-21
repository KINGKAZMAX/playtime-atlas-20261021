#!/usr/bin/env bash
# 一键启动本地预览：安装依赖 → 构建 → 以 127.0.0.1:4331 提供静态产物。
set -euo pipefail

cd "$(dirname "$0")/.."

if [ ! -d node_modules ]; then
  echo "▸ 未检测到 node_modules，正在安装依赖…"
  npm install --no-audit --no-fund
fi

echo "▸ 正在构建静态产物…"
npm run build

echo "▸ 预览地址：http://127.0.0.1:4331"
npm run preview
