#!/usr/bin/env bash
# 拉取 Noto Sans SC 原始可变字型（SIL OFL 1.1）到 node_modules/.cache/loomdeck-fonts/
# 仅在需要重新生成中文子集时使用；产物随后完全本地化，运行时不再联网。
#
# 说明：构建脚本会优先用 NOTO_SANS_SC_SRC 指定���路径；没有时依次尝试
#   1) 本目录 assets/fonts/noto-sans-sc.ttf
#   2) 本缓存目录 NotoSansSC-VF.ttf（本脚本下载物）
#   3) 同批次 07-museum-art / 06-museum-core 的字体缓存
# 全部找不到时保留仓库内已生成的子集，构建不会中断。
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
CACHE="$ROOT/node_modules/.cache/loomdeck-fonts"
mkdir -p "$CACHE"

DEST="$CACHE/NotoSansSC-VF.ttf"
if [ -f "$DEST" ]; then
  echo "[fetch-sources] cached: $DEST"
  exit 0
fi

URL="https://raw.githubusercontent.com/notofonts/noto-cjk/main/Sans/Variable/TTF/Subset/NotoSansSC-VF.ttf"
echo "[fetch-sources] downloading Noto Sans SC VF ..."
curl -fsSL -o "$DEST" "$URL"
echo "[fetch-sources] saved: $DEST ($(du -h "$DEST" | cut -f1))"
