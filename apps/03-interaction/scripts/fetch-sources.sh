#!/usr/bin/env bash
# 拉取 Noto Serif SC 原始变量字型（SIL OFL 1.1）到 node_modules/.cache/loomdeck-fonts/
# 仅在首次构建字体时需要；产物随后完全本地化，运行时不再联网。
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
CACHE="$ROOT/node_modules/.cache/loomdeck-fonts"
mkdir -p "$CACHE"

DEST="$CACHE/NotoSerifSC-VF.otf"
if [ -f "$DEST" ]; then
  echo "[fetch-sources] cached: $DEST"
  exit 0
fi

URL="https://raw.githubusercontent.com/notofonts/noto-cjk/main/Serif/Variable/OTF/Subset/NotoSerifSC-VF.otf"
echo "[fetch-sources] downloading Noto Serif SC VF ..."
curl -fsSL -o "$DEST" "$URL"
echo "[fetch-sources] saved: $DEST ($(du -h "$DEST" | cut -f1))"
