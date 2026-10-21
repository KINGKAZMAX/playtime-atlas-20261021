#!/usr/bin/env bash
# Capture real screenshots of a URL with local headless Chrome.
# Usage: ./capture.sh <url> <outfile> <width> <height> [mobile]
#
# ⚠️ 浏览器使用约定（用户长期约定，2026-10-22 起对所有任务生效）：
#    **对外站点**（参考站 olek.si、机构页面、线上站点）的访问与截图，
#    一律使用用户的 Ego 浏览器（/Users/mekzenx2/.local/bin/ego-browser，
#    先运行 `ego-browser skill`），不使用本脚本或任何其他浏览器路径。
#    本脚本仅保留给**本地构建产物**的回归截图（127.0.0.1）。
#    ⚠️ 另：headless Chrome 用 --force-device-scale-factor=2 + --window-size 在移动视口下
#    会产出**被裁切的伪影图**（布局宽于视口后再裁剪）。本地成果页截图请改用
#    scripts/capture_cdp.mjs（CDP 设备仿真），与 scripts/browser_test.mjs 同通道、度量一致。
#
# 历史说明：本脚本曾用于抓取 olek.si 的观察截图（2026-10-21），
# 该批证据保留在 screenshots/，按隔离要求不随站点发布。
set -euo pipefail

URL="$1"; OUT="$2"; W="$3"; H="$4"; MODE="${5:-desktop}"
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
ATTEMPTS="${CAPTURE_ATTEMPTS:-4}"

for i in $(seq 1 "$ATTEMPTS"); do
  PROFILE="$(mktemp -d)"

  ARGS=(
    --headless=new
    --disable-gpu
    --no-sandbox
    --no-first-run
    --no-default-browser-check
    --disable-extensions
    --disable-background-networking
    --disable-features=Translate,OptimizationHints
    --user-data-dir="$PROFILE"
    --hide-scrollbars
    --force-device-scale-factor=1
    --user-agent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36"
    --window-size="${W},${H}"
    --virtual-time-budget=12000
    --run-all-compositor-stages-before-draw
    --screenshot="${OUT}"
  )

  if [ "$MODE" = "mobile" ]; then
    ARGS+=(--user-agent="Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1")
    ARGS+=(--force-device-scale-factor=2)
  fi

  "$CHROME" "${ARGS[@]}" "$URL" >/dev/null 2>&1 || true
  rm -rf "$PROFILE"

  if [ -s "$OUT" ]; then
    echo "OK  $OUT  $(wc -c < "$OUT" | tr -d ' ') bytes  ${W}x${H} ${MODE}  (attempt $i)"
    exit 0
  fi
  rm -f "$OUT"
  echo "retry $i/$ATTEMPTS for $OUT (network flake)"
  sleep $((i * 5))
done

echo "FAIL $OUT (0 bytes)  ${W}x${H} ${MODE}"
exit 1
