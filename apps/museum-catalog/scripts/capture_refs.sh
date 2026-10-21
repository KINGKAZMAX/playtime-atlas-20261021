#!/usr/bin/env bash
# 05-museum-research — 参考站截图抓取（headless Chrome，无依赖安装）
#
# 用法: ./scripts/capture_refs.sh
# 输出: screenshots/<slug>.png  +  screenshots/INDEX.tsv
#
# 截图仅作研究参考存档，不随交付物再分发（各站许可多为 ARR / CC-NC，见 LICENSES.md）。
set -u

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT="$ROOT/screenshots"
mkdir -p "$OUT"
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
UA="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36"

declare -a SLUGS=(
  "strong-timeline|https://www.museumofplay.org/video-game-history-timeline/"
  "strong-vghf|https://www.museumofplay.org/exhibits/world-video-game-hall-of-fame/"
  "strong-online-exhibits|https://www.museumofplay.org/exhibits/online-exhibits/"
  "nvm-sheffield|https://thenvm.org/"
  "nvm-usa-exhibits|https://nvmusa.org/interactive-exhibits"
  "chm-collections|https://www.computerhistory.org/collections/catalog/"
  "cch-home|https://computinghistory.org.uk/"
  "klov|https://www.arcade-museum.com/"
  "ia-software|https://archive.org/details/software"
  "nvghm|https://www.videogamehistory.org/"
  "emulation-nation|https://www.emulatorzone.com/"
  "gac|https://artsandculture.google.com/"
)

: > "$OUT/INDEX.tsv"
printf "slug\turl\thttp_status\tbytes\tfile\tshot_at\n" >> "$OUT/INDEX.tsv"

for pair in "${SLUGS[@]}"; do
  slug="${pair%%|*}"; url="${pair#*|}"
  safe=$(echo "$slug" | tr -c 'A-Za-z0-9._-' '_')
  file="$OUT/${safe}.png"
  status=$(curl -sL -m 30 -o /dev/null -w "%{http_code}" -A "$UA" "$url")
  "$CHROME" --headless=new --disable-gpu --no-sandbox --hide-scrollbars \
    --force-device-scale-factor=1 --window-size=1440,900 \
    --virtual-time-budget=12000 --user-agent="$UA" \
    --screenshot="$file" "$url" >/dev/null 2>&1
  if [ -s "$file" ]; then
    bytes=$(wc -c < "$file" | tr -d ' ')
  else
    bytes=0
  fi
  printf "%s\t%s\t%s\t%s\t%s\t%s\n" "$slug" "$url" "$status" "$bytes" "${safe}.png" "$(date -u +%Y-%m-%dT%H:%M:%SZ)" >> "$OUT/INDEX.tsv"
  echo "  $slug -> http=$status bytes=$bytes"
  sleep 1
done

echo
echo "== screenshots written to $OUT"
cat "$OUT/INDEX.tsv"
