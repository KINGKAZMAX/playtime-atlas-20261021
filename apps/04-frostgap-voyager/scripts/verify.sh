#!/usr/bin/env bash
#
# 本地自验脚本：构建 → 启动临时静态服务器 → 跑验收 → 立刻关闭服务器
#
# 硬性要求：不留常驻进程。脚本退出（或被中断）时一定会杀掉服务器。
#
set -euo pipefail

cd "$(dirname "$0")/.."

PORT="${VERIFY_PORT:-4321}"
HOST="127.0.0.1"
SERVER_PID=""

cleanup() {
  if [ -n "$SERVER_PID" ] && kill -0 "$SERVER_PID" 2>/dev/null; then
    kill "$SERVER_PID" 2>/dev/null || true
    wait "$SERVER_PID" 2>/dev/null || true
    echo "→ 已关闭临时静态服务器 (pid $SERVER_PID)"
  fi
}
trap cleanup EXIT INT TERM

echo "▶ 构建静态产物…"
npm run build
test -f dist/index.html || { echo "构建失败：缺少 dist/index.html"; exit 1; }

echo "▶ 启动临时静态服务器 $HOST:$PORT …"
# 用 Vite 自带的 preview（只读 dist/），比再装一个依赖更轻
npx vite preview --host "$HOST" --port "$PORT" --strictPort > /tmp/frostgap-preview.log 2>&1 &
SERVER_PID=$!

for _ in $(seq 1 40); do
  if curl -fsS -o /dev/null "http://$HOST:$PORT/"; then break; fi
  sleep 0.25
done

if ! curl -fsS -o /dev/null "http://$HOST:$PORT/"; then
  echo "静态服务器启动失败："; cat /tmp/frostgap-preview.log; exit 1
fi
echo "→ 服务就绪：http://$HOST:$PORT"

echo "▶ 运行定向自验…"
node qa/verify-fixes.mjs "http://$HOST:$PORT"
STATUS=$?

exit $STATUS
