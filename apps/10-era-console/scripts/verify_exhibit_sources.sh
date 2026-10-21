#!/usr/bin/env bash
# 10-era-console — 展品来源可达性核验（从真实数据文件抽取 URL）
# 用法: bash scripts/verify_exhibit_sources.sh
# 退出码 0 = 全部 200/3xx；非 0 = 存在不可达链接
set -u
cd "$(dirname "$0")/.."
UA="Mozilla/5.0 (compatible; PLAYTIME-Atlas-SourceCheck/1.0; +local research)"

URLS=$(node -e "
import('./src/data/exhibits.js').then(m => {
  const s = new Set();
  m.EXHIBITS.forEach(e => e.sourceUrls.forEach(u => s.add(u)));
  console.log([...s].sort().join('\n'));
});
")

echo "共 $(echo "$URLS" | grep -c .) 条唯一来源链接"
echo

fail=0
while IFS= read -r url; do
  [ -z "$url" ] && continue
  # 维基百科对高频请求会限流（返回 000 = 连接失败），因此逐条限速并重试
  code=""
  for attempt in 1 2 3; do
    code=$(curl -s -o /dev/null -m 25 -L -A "$UA" -w "%{http_code}" "$url")
    case "$code" in
      2*|3*) break ;;
      *) sleep $((attempt * 3)) ;;
    esac
  done
  printf "%s  %s\n" "$code" "$url"
  case "$code" in
    2*|3*) ;;
    *) fail=$((fail + 1)) ;;
  esac
  sleep 0.8
done <<< "$URLS"

echo
if [ "$fail" -eq 0 ]; then
  echo "全部来源可达。"
  exit 0
else
  echo "有 $fail 条来源不可达。"
  exit 1
fi
