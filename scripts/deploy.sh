#!/usr/bin/env bash
# 一键增量部署：同步上游 → 构建 → 提交 → 推送 → 触发 GitHub Actions
#
# 用法：bash scripts/deploy.sh "本次发布说明"
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

MSG="${1:-增量发布：同步上游作品并重新构建}"
BRANCH="${BRANCH:-main}"
REPO="${REPO:-playtime-atlas-20261021}"
OWNER="${OWNER:-KINGKAZMAX}"

echo "==> 1/4 同步上游成果"
node scripts/sync-apps.mjs | tail -5

echo "==> 2/4 构建全部作品"
node scripts/build.mjs "${BUILD_FLAGS:-}" | tail -25

echo "==> 3/4 提交"
git add -A
if git diff --cached --quiet; then
  echo "    没有变更，跳过提交"
else
  git -c user.name="${GIT_NAME:-KINGKAZMAX}" \
      -c user.email="${GIT_EMAIL:-KINGKAZMAX@users.noreply.github.com}" \
      commit -m "$MSG"
  echo "    commit: $(git rev-parse --short HEAD)"
fi

echo "==> 4/4 推送"
git push origin "$BRANCH"

echo
echo "仓库:  https://github.com/${OWNER}/${REPO}"
echo "线上:  https://${OWNER}.github.io/${REPO}/"
