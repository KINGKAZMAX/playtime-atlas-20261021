#!/usr/bin/env bash
# run_pipeline.sh — 17 号任务的完整可复现流水线
#
# 顺序说明（不可颠倒）：
#   1) 数据源 → 2) 派生数据 → 3) 成果页 → 4) 清单 → 5) QA → 6) 清单 → 7) 校验
#   第 5 步的 QA.md 会内嵌第 7 步的校验输出，故需在第 5 步前先跑一次校验；
#   第 6 步重写清单是为了把 QA.md 与校验报告的最终字节数登记进去。
#
# 用法：bash scripts/run_pipeline.sh
set -uo pipefail
cd "$(dirname "$0")/.."
ROOT="$(pwd)"

step() { printf '\n\033[1m▶ %s\033[0m\n' "$1"; }

step "1/7 目录（唯一数据源）"
python3 scripts/build_catalog.py || exit 1

step "2/7 术语表 / UNESCO 编号 / 核验状态 / 字段映射"
python3 scripts/build_glossary.py || exit 1
python3 scripts/build_unesco_verified.py || exit 1
python3 scripts/build_verification_status.py || exit 1
python3 scripts/build_field_mapping.py || exit 1

step "3/7 成果页"
node src/catalog-page/build-catalog-page.mjs || exit 1

step "4/7 文件清单"
python3 scripts/build_manifest.py || exit 1

step "5/7 QA（内嵌实时校验输出）"
python3 scripts/build_qa.py || exit 1

step "6/7 重建清单（登记 QA.md 与校验报告的最终字节数）"
python3 scripts/build_manifest.py || exit 1

step "7/7 校验"
python3 scripts/validate_catalog.py
CODE=$?

printf '\n'
if [ "$CODE" -eq 0 ]; then
  echo "✅ 流水线完成：全部断言通过"
else
  echo "❌ 流水线结束：存在 FAIL 断言（退出码 $CODE）"
fi
echo "目录：$ROOT"
exit "$CODE"
