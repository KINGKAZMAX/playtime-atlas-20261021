#!/usr/bin/env bash
# run_pipeline.sh — 17 号任务的完整可复现流水线
#
# 顺序说明（不可颠倒）：
#   1) 数据源 → 2) 派生数据 → 3) 成果页 → 4) 清单 → 5) QA → 6) 清单 → 7) 校验
#   第 5 步的 QA.md 会内嵌第 7 步的校验输出，故需在第 5 步前先跑一次校验；
#   第 6 步重写清单是为了把 QA.md 与校验报告的最终字节数登记进去。
#
# 第 8 步是**可选的浏览器验收**（Ego 浏览器）：
#   · 它需要 Ego 浏览器 + 本地静态服务，且每次跑都会重写 evidence/ 下的报告与截图，
#     **不属于字节级幂等链路**，因此默认不随本流水线执行。
#   · 需要时显式开启：EGO_ACCEPT=1 bash scripts/run_pipeline.sh
#     （脚本会自行起停 127.0.0.1:8899 的静态服务）
#
# 用法：bash scripts/run_pipeline.sh
set -uo pipefail
cd "$(dirname "$0")/.."
ROOT="$(pwd)"

step() { printf '\n\033[1m▶ %s\033[0m\n' "$1"; }

step "1/8 目录（唯一数据源）"
python3 scripts/build_catalog.py || exit 1

step "2/8 术语表 / UNESCO 编号 / 核验状态 / 字段映射"
python3 scripts/build_glossary.py || exit 1
python3 scripts/build_unesco_verified.py || exit 1
python3 scripts/build_verification_status.py || exit 1
python3 scripts/build_field_mapping.py || exit 1

step "3/8 成果页"
node src/catalog-page/build-catalog-page.mjs || exit 1

step "4/8 文件清单"
python3 scripts/build_manifest.py || exit 1

step "5/8 QA（内嵌实时校验输出）"
python3 scripts/build_qa.py || exit 1

step "6/8 重建清单（登记 QA.md 与校验报告的最终字节数）"
python3 scripts/build_manifest.py || exit 1

step "7/8 校验"
python3 scripts/validate_catalog.py
CODE=$?

# ---------------------------------------------------------- 8. Ego 浏览器验收（可选）
if [ "${EGO_ACCEPT:-0}" = "1" ]; then
  step "8/8 Ego 浏览器验收（交互类 + 参考站几何）"
  PORT=8899
  python3 -m http.server "$PORT" --bind 127.0.0.1 --directory dist >/dev/null 2>&1 &
  SRV=$!
  trap 'kill "$SRV" 2>/dev/null || true' EXIT
  sleep 1
  node scripts/ego_interactions.mjs \
    --url "http://127.0.0.1:$PORT/catalog.html" \
    --out "$ROOT/evidence/ego-interactions" \
    --space "17-architecture ego-interactions" || CODE=1
  node scripts/ego_ref_metrics.mjs || CODE=1
  kill "$SRV" 2>/dev/null || true
  trap - EXIT
fi

printf '\n'
if [ "$CODE" -eq 0 ]; then
  echo "✅ 流水线完成：全部断言通过"
else
  echo "❌ 流水线结束：存在 FAIL 断言（退出码 $CODE）"
fi
echo "目录：$ROOT"
exit "$CODE"
