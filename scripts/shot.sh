#!/usr/bin/env bash
# 桌面宽度截图工具 —— 用本机 Chrome 无头模式在 1440×900 视口截图。
# 用法：shot.sh <url> <输出png> [宽] [高] [额外等待毫秒]
set -euo pipefail

CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
URL="${1:?需要 URL}"
OUT="${2:?需要输出路径}"
W="${3:-1440}"
H="${4:-900}"
WAIT="${5:-3500}"
PROFILE="$(mktemp -d)/chrome-profile"

mkdir -p "$(dirname "$OUT")"

"$CHROME" \
  --headless=new \
  --disable-gpu \
  --no-sandbox \
  --hide-scrollbars \
  --force-device-scale-factor=1 \
  --user-data-dir="$PROFILE" \
  --window-size="${W},${H}" \
  --virtual-time-budget="$WAIT" \
  --screenshot="$OUT" \
  "$URL" >/dev/null 2>&1 || true

rm -rf "$(dirname "$PROFILE")" 2>/dev/null || true

if [ -f "$OUT" ]; then
  echo "[shot] $(basename "$OUT") $(sips -g pixelWidth -g pixelHeight "$OUT" | awk '/pixel/{printf "%s ", $2}') $(du -h "$OUT" | cut -f1)"
else
  echo "[shot] 失败：未生成 $OUT" >&2
  exit 1
fi
