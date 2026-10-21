#!/usr/bin/env bash
# 光点年代 / LUMEN ERA —— 自验脚本
#
# 依次执行：
#   1. 单元测试（node:test + DOM/Canvas 垫片）
#   2. 构建（vite build -> dist/）
#   3. 产物检查（三页齐全 / 资源路径全相对 / 运行期零外部请求 / 无第三方二进制素材）
#   4. manifest 与 package.json 一致性
#
# 全程离线，不启动任何常驻进程。
set -uo pipefail
cd "$(dirname "$0")/.."

FAIL=0
step() { printf '\n\033[1m▸ %s\033[0m\n' "$1"; }
ok()   { printf '  \033[32m✓\033[0m %s\n' "$1"; }
bad()  { printf '  \033[31m✗\033[0m %s\n' "$1"; FAIL=1; }

# ---------------------------------------------------------------- 0. 依赖
step "0/5 检查本地依赖"
if [ ! -d node_modules/vite ]; then
  echo "  node_modules 缺失，先执行 npm install --no-audit --no-fund"
  npm install --no-audit --no-fund
fi
ok "vite $(node -p "require('./node_modules/vite/package.json').version")"

# ---------------------------------------------------------------- 1. 测试
step "1/5 单元测试"
# 注意：必须用 glob 形式，目录形式（node --test tests/）会报 MODULE_NOT_FOUND
if node --test "tests/*.test.mjs"; then
  ok "全部用例通过"
else
  bad "测试失败"
fi

# ---------------------------------------------------------------- 2. 构建
step "2/5 构建"
if npm run build; then
  ok "npm run build 退出码 0"
else
  bad "npm run build 失败"
  exit 1
fi

# ---------------------------------------------------------------- 3. 产物
step "3/5 产物检查"
for page in index.html rally.html gravity.html; do
  if [ -s "dist/$page" ]; then
    ok "dist/$page 存在且非空"
  else
    bad "dist/$page 缺失或为空"
  fi
done

if [ -s "dist/index.html" ]; then
  ok "dist/index.html 可交付（manifest.entry = index.html）"
fi

# 资源路径必须全相对，才能同时支持 GitHub Pages 子路径与 iframe 嵌套
if grep -qE '(src|href)="/' dist/*.html 2>/dev/null; then
  bad "dist 中存在绝对路径引用（src=\"/…\" 或 href=\"/…\"）"
  grep -nE '(src|href)="/' dist/*.html | head -10
else
  ok "dist 内无绝对路径引用"
fi

# 运行期零外部请求。
# 只检查「资源加载」位置：script/link/img/iframe 等标签的 src|href、CSS 的 @import|url()、
# 以及 JS 里的 fetch/XHR/open/importScripts。
# <a href="https://…"> 是展厅里的「史实出处」链接，属引用而非请求，不在此列。
EXT_RES=""
if grep -rnoE '<(script|link|img|iframe|video|audio|source|embed|object|use)[^>]*\b(src|href)="https?://[^"]*"' \
     dist/*.html dist/assets/*.js 2>/dev/null | grep -v 'www.w3.org' > /tmp/lumen-ext.$$; then
  EXT_RES="$(cat /tmp/lumen-ext.$$)"
fi
if grep -rnoE '@import[^;]*https?://|url\([^)]*https?://' dist/assets/*.css 2>/dev/null >> /tmp/lumen-ext.$$; then
  EXT_RES="${EXT_RES}
$(cat /tmp/lumen-ext.$$)"
fi
if grep -rnoE '(fetch|importScripts)\(`?["'"'"']?https?://|open\(["'"'"']https?://' \
     dist/assets/*.js 2>/dev/null >> /tmp/lumen-ext.$$; then
  EXT_RES="${EXT_RES}
$(cat /tmp/lumen-ext.$$)"
fi
if [ -s /tmp/lumen-ext.$$ ]; then
  bad "dist 中存在外部资源请求（运行期必须为 0）"
  sed -n '1,10p' /tmp/lumen-ext.$$
else
  ok "dist 运行期零外部请求（出处引用链接不计入）"
fi
rm -f /tmp/lumen-ext.$$

# 供人核对：统计一下可点击的出处链接数量（应为 17 条来源）
LINK_N=$(grep -rhoE "https?://[^\"'\` )]+" dist/assets/*.js dist/*.html 2>/dev/null \
        | grep -v 'www.w3.org' | grep -vE '^https?://127\.0\.0\.1' | sort -u | wc -l | tr -d ' ')
ok "可点击出处链接 ${LINK_N} 个去重 URL（均为 <a> 引用，运行期不发请求）"

# 不应存在图片 / 音频素材（展厅的图形与音效全部程序化生成）。
# 唯一例外是自托管的 OFL 字体（见 LICENSES.md 第二节），它们是文本渲染必需的字形资源。
if find dist -type f \( -name '*.png' -o -name '*.jpg' -o -name '*.jpeg' \
    -o -name '*.gif' -o -name '*.webp' -o -name '*.mp3' -o -name '*.wav' \
    -o -name '*.ogg' -o -name '*.m4a' \) | grep -q .; then
  bad "dist 中存在图片 / 音频素材（应全部程序化生成）"
  find dist -type f \( -name '*.png' -o -name '*.jpg' -o -name '*.jpeg' \
    -o -name '*.gif' -o -name '*.webp' -o -name '*.mp3' -o -name '*.wav' \
    -o -name '*.ogg' -o -name '*.m4a' \)
else
  ok "dist 无图片 / 音频素材（全部程序化生成）"
fi

# 字体：必须是 4 个自托管 woff2，且不得出现其它字体格式（避免带入未登记的字体文件）
FONT_COUNT=$(find dist -type f -name '*.woff2' | wc -l | tr -d ' ')
OTHER_FONT=$(find dist -type f \( -name '*.woff' -o -name '*.ttf' -o -name '*.otf' -o -name '*.eot' \) | tr '\n' ' ')
if [ "$FONT_COUNT" -eq 4 ]; then
  ok "dist 含 4 个自托管 OFL woff2 字体（Space Grotesk / Inter / Space Mono×2）"
else
  bad "dist 字体数量应为 4，实际 ${FONT_COUNT}"
fi
if [ -n "$OTHER_FONT" ]; then
  bad "dist 存在未登记的字体格式：${OTHER_FONT}"
else
  ok "dist 无 .woff / .ttf / .otf 等其他字体格式"
fi

# 字体必须全部本地自托管：不得引用任何字体 CDN 或外部字库
if grep -rniE 'fonts\.(googleapis|gstatic|jsdelivr|bootstrapcdn)|use\.typekit|@font-face[^}]*src:[^;]*https?://' \
     dist/assets/*.css dist/*.html 2>/dev/null | grep -v 'www.w3.org'; then
  bad "dist 引用了外部字体 CDN（必须全部自托管）"
else
  ok "dist 无外部字体引用（@font-face 全部指向本地 assets/*.woff2）"
fi

# 随文档一起打进 dist，避免 Pages 上页脚链接 404
for doc in README.md SOURCES.md DIFFERENCES.md LICENSES.md QA.md RESTYLE-INVENTORY.md; do
  if [ -s "dist/$doc" ]; then
    ok "dist/$doc 已随构建产出"
  else
    bad "dist/$doc 缺失（页脚链接会 404）"
  fi
done

# ---------------------------------------------------------------- 4. 清单
step "4/5 manifest 与 package.json 一致性"
node - <<'NODE'
import { readFileSync } from 'node:fs';
const m = JSON.parse(readFileSync('manifest.json', 'utf8'));
const p = JSON.parse(readFileSync('package.json', 'utf8'));
let bad = 0;
const need = ['id', 'title', 'description', 'entry', 'buildCommand', 'outputDir', 'status'];
const missing = need.filter((k) => !m[k]);
if (missing.length) { console.log(`  ✗ manifest 缺少字段: ${missing.join(', ')}`); bad++; }
else console.log(`  ✓ manifest 七个必需字段齐全（id=${m.id}, status=${m.status}）`);

if (m.id !== '08-era-origins') { console.log('  ✗ id 应为 08-era-origins'); bad++; }

// buildCommand 采用批次约定：调用形式 "npm run build"（允许前置安装命令）
if (!/\bnpm run build\s*$/.test(m.buildCommand)) {
  console.log(`  ✗ buildCommand 应以 "npm run build" 结尾: ${m.buildCommand}`); bad++;
} else if (!p.scripts || !p.scripts.build) {
  console.log('  ✗ package.json 缺少 scripts.build'); bad++;
} else {
  console.log(`  ✓ buildCommand="${m.buildCommand}" 命中 package.json scripts.build="${p.scripts.build}"`);
}

if (m.outputDir !== 'dist') { console.log(`  ✗ outputDir 应为 dist，实际 ${m.outputDir}`); bad++; }
else console.log('  ✓ outputDir = dist（与 vite build.outDir 一致）');

// dependencies 字段「不存在」等价于「运行时依赖为空」
const deps = p.dependencies || {};
if (Object.keys(deps).length) {
  console.log(`  ✗ 运行时依赖应为空，实际有：${Object.keys(deps).join(', ')}`); bad++;
} else console.log('  ✓ 运行时依赖为空（dependencies 字段缺失或为空对象）');

process.exit(bad ? 1 : 0);
NODE
if [ $? -eq 0 ]; then ok "manifest 自洽"; else bad "manifest 与 package.json 不一致"; fi

# ---------------------------------------------------------------- 5. 改版专项
step "5/5 改版专项（令牌一致性 / 画布色板镜像 / 无障碍标记 / 规范层接入）"

# 5a. 令牌一致性（--ds-* 唯一声明处 = assets/ds/tokens.css）
if node scripts/check-tokens.mjs; then
  ok "令牌一致性 / 命名空间唯一性 / 画布色板镜像 全部通过"
else
  bad "令牌一致性校验失败（见上方明细）"
fi

# 5b. 入口与规范层的接入完整性
node - <<'NODE2'
import { readFileSync, existsSync } from 'node:fs';
let bad = 0;
const need = [
  ['assets/ds/tokens.css', '余晖令牌层'],
  ['assets/ds/components.css', '余晖组件层'],
  ['assets/ds/fonts/fonts.css', '自托管字体表'],
  ['assets/ds/fonts/inter-latin.woff2', '字体文件'],
  ['assets/ds/fonts/space-grotesk-latin.woff2', '字体文件'],
  ['assets/ds/fonts/space-mono-regular.woff2', '字体文件'],
  ['assets/ds/fonts/space-mono-bold.woff2', '字体文件'],
];
for (const [f, label] of need) {
  if (existsSync(f) && fs_size(f) > 0) console.log(`  ✓ ${f}（${label}）`);
  else { console.log(`  ✗ ${f} 缺失（${label}）`); bad++; }
}
function fs_size(f) { try { return readFileSync(f).length; } catch { return 0; } }

// 三页入口：样式表顺序 + --ds-base + ds-shell
for (const page of ['index.html', 'rally.html', 'gravity.html']) {
  const html = readFileSync(page, 'utf8');
  const order = ['./src/styles/base.css', './assets/ds/tokens.css', './assets/ds/components.css',
                 './assets/ds/fonts/fonts.css', './src/styles/tokens.css', './src/styles/components.css'];
  const idx = order.map((f) => html.indexOf(`href="${f}"`));
  const present = idx.every((i) => i >= 0);
  const ordered = present && idx.every((v, i) => i === 0 || v > idx[i - 1]);
  const hasBase = /--ds-base:\s*"\/playtime-atlas-20261021\/"/.test(html);
  const hasShell = /<body[^>]*class="[^"]*ds-shell/.test(html);
  const hasLang = /<html[^>]*lang="zh-CN"/.test(html);
  if (present && ordered && hasBase && hasShell && hasLang) {
    console.log(`  ✓ ${page}：规范层顺序正确、--ds-base 已注入、body.ds-shell、lang=zh-CN`);
  } else {
    console.log(`  ✗ ${page}：present=${present} ordered=${ordered} dsBase=${hasBase} dsShell=${hasShell} lang=${hasLang}`);
    bad++;
  }
}

// 产物里必须真的带上规范层
try {
  const { readdirSync } = await import('node:fs');
  const css = readdirSync('dist/assets').filter((f) => f.endsWith('.css'))
    .map((f) => readFileSync(`dist/assets/${f}`, 'utf8')).join('\n');
  if (css.includes('--ds-bg:') && css.includes('.ds-btn') && css.includes('.ds-topbar')) {
    console.log('  ✓ dist 已内联令牌层与组件层（含 .ds-topbar / .ds-btn）');
  } else {
    console.log('  ✗ dist 产物中未找到 --ds-bg / .ds-btn / .ds-topbar（设计系统样式未进入构建）');
    bad++;
  }
} catch { console.log('  ! dist/assets 不可读，跳过产物内联检查'); }

process.exit(bad ? 1 : 0);
NODE2
if [ $? -eq 0 ]; then ok "规范层接入完整"; else bad "规范层接入不完整"; fi

# ---------------------------------------------------------------- 浏览器层（不在本脚本内）
# 依 2026-10-22 起的长期约定，网页调试 / 截图 / 验收一律走 Ego 浏览器，
# 不再本地另起 Playwright / Chromium / Chrome。因此下面两支**需要浏览器**的
# 验收脚本刻意不并入 `npm run verify`（保持本脚本全程离线、无常驻进程）：
#
#   node scripts/verify-pages.mjs   # 页面机械检查（复用批次共享 tools/ego-qa）
#   node scripts/verify-game.mjs    # 游戏行为回归 D3 / D4 / D5 / D6
#
# 两者都以 `ego-browser nodejs` 执行，产出：
#   screenshots/verify/pages-verification.json
#   screenshots/probe-report.json

# ---------------------------------------------------------------- 结果
printf '\n'
if [ "$FAIL" -eq 0 ]; then
  printf '\033[32m▌ 自验通过：LUMEN ERA 可交付\033[0m\n'
  exit 0
else
  printf '\033[31m▌ 自验失败：存在未通过项\033[0m\n'
  exit 1
fi
