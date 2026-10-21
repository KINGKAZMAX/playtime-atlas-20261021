/**
 * 令牌一致性校验（V.3 / V.4）
 * ---------------------------------------------------------------------------
 * 依据 16-design-system/MIGRATION-NOTES.md §9.1「13-qa-curation 的复核方式」：
 *   ① 令牌一致性：解析作者目录的 :root，与 design-tokens.json 逐名比对，
 *      值必须**完全相等**（大小写不敏感、去空格）。
 *      深色主题目录比对**暗色主题组**取值。
 *   ④ 命名空间冲突：无与本系统同名不同义的 --ds-*
 *
 * 本目录的 --ds-* 取值**唯一声明处**是 assets/ds/tokens.css
 * （16-design-system/src/tokens.css 的副本）；
 * src/styles/tokens.css 只声明 --lumen-* 画布镜像，不得再出现 --ds-* 取值。
 *
 * 用法: node scripts/check-tokens.mjs
 */
import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DS = path.resolve(ROOT, '..', '16-design-system');
const TOKENS_CSS = path.join(ROOT, 'assets/ds/tokens.css');
const LUMEN_CSS = path.join(ROOT, 'src/styles/tokens.css');

let errors = 0;
let warnings = 0;
const fail = (m) => { errors += 1; console.log(`  ✗ ${m}`); };
const warn = (m) => { warnings += 1; console.log(`  ! ${m}`); };
const ok = (m) => console.log(`  ✓ ${m}`);

const norm = (v) => String(v).trim().toLowerCase().replace(/\s+/g, ' ');

/* ---------- 1. 读取 JSON 令牌 ---------- */
const jsonPath = path.join(DS, 'design-tokens.json');
if (!existsSync(jsonPath)) {
  console.log('  ! 未找到 16-design-system/design-tokens.json，跳过令牌比对');
  process.exit(0);
}
const tokens = JSON.parse(readFileSync(jsonPath, 'utf8'));

const flat = [];
(function walk(node, pathArr) {
  for (const [k, v] of Object.entries(node)) {
    if (k.startsWith('$')) continue;
    if (v && typeof v === 'object' && !('$value' in v)) walk(v, [...pathArr, k]);
    else if (v && typeof v === 'object' && '$value' in v) flat.push({ path: [...pathArr, k].join('.'), node: v });
  }
})(tokens, []);

const byPath = new Map(flat.map((t) => [t.path, t.node.$value]));

/* ---------- 2. 解析 CSS ---------- */
if (!existsSync(TOKENS_CSS)) {
  fail('assets/ds/tokens.css 缺失（--ds-* 的唯一声明处）');
  process.exit(1);
}
const css = readFileSync(TOKENS_CSS, 'utf8');

const blockOf = (selector) => {
  const m = css.match(new RegExp(`(?:^|\\n)\\s*${selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*\\{([\\s\\S]*?)\\n\\}`));
  return m ? m[1] : '';
};
const varsOf = (block) => {
  const out = {};
  for (const line of block.split('\n')) {
    const m = line.match(/^\s*(--ds-[a-z0-9-]+)\s*:\s*(.+?);\s*$/i);
    if (m) out[m[1]] = norm(m[2]);
  }
  return out;
};
const light = varsOf(blockOf(':root'));
const dark = varsOf(blockOf('[data-ds-theme="dark"]'));

/* ---------- 3. 路径 → CSS 变量名（沿用 16 的 validate-tokens.mjs 规则） ---------- */
const kebab = (n) => '--ds-' + n.replace(/[A-Z]/g, (m) => '-' + m.toLowerCase());
const pathToVar = (p) => {
  const seg = p.split('.');
  if (seg[0] === 'color') {
    // color.<tone>.<leaf> → --ds-<leaf>
    return kebab(seg[2]);
  }
  if (seg[0] === 'typography') {
    // typography.family.display → --ds-font-display
    if (seg[1] === 'family') return kebab('font-' + seg[2]);
    // typography.size.h3 → --ds-type-h3
    if (seg[1] === 'size') return kebab('type-' + seg[2]);
    // typography.weight.bold → --ds-w-bold / typography.lineHeight.* → --ds-lh-*
    if (seg[1] === 'weight') return kebab('w-' + seg[2]);
    if (seg[1] === 'lineHeight') return kebab('lh-' + seg[2]);
    if (seg[1] === 'tracking') return kebab('track-' + seg[2]);
    return kebab(seg[seg.length - 1]);
  }
  if (seg[0] === 'space') return kebab('space-' + seg[1]);
  if (seg[0] === 'radius') return kebab('radius-' + seg[1]);
  if (seg[0] === 'shadow') return kebab('shadow-' + seg[1]);
  if (seg[0] === 'motion') {
    if (seg[1] === 'duration') return kebab('dur-' + seg[2]);
    if (seg[1] === 'easing') return kebab('ease-' + seg[2]);
    return kebab(seg[seg.length - 1]);
  }
  if (seg[0] === 'zIndex') return kebab('z-' + seg[1]);
  if (seg[0] === 'layout') return kebab(seg[1]);
  if (seg[0] === 'component') return kebab(seg[1]);
  if (seg[0] === 'a11y') return kebab(seg[1]);
  if (seg[0] === 'asset') return kebab(seg[1]);
  return kebab(seg[seg.length - 1]);
};

/* ---------- 4. 浅色组逐值比对（:root） ---------- */
let lightChecked = 0;
let lightBad = 0;
for (const [p, value] of byPath) {
  const seg = p.split('.');
  if (seg[0] !== 'color' || seg[1] !== 'light') continue;
  const name = pathToVar(p);
  const expect = norm(value);
  if (!expect) continue;
  lightChecked += 1;
  if (light[name] !== expect) {
    fail(`浅色令牌 ${name} = ${light[name] || '(缺失)'}，design-tokens.json 为 ${expect}`);
    lightBad += 1;
  }
}
if (!lightBad) ok(`浅色主题令牌与 design-tokens.json 逐值一致（${lightChecked} 项，:root）`);

/* ---------- 5. 深色组逐值比对（[data-ds-theme="dark"]） ---------- */
let darkChecked = 0;
let darkBad = 0;
for (const [p, value] of byPath) {
  const seg = p.split('.');
  if (seg[0] !== 'color' || seg[1] !== 'dark') continue;
  const name = pathToVar(p);
  const expect = norm(value);
  if (!expect) continue;
  darkChecked += 1;
  if (dark[name] !== expect) {
    fail(`深色令牌 ${name} = ${dark[name] || '(缺失)'}，design-tokens.json 为 ${expect}`);
    darkBad += 1;
  }
}
if (!darkBad) ok(`深色主题令牌与 design-tokens.json 逐值一致（${darkChecked} 项，[data-ds-theme="dark"]）`);

/* ---------- 6. 必备令牌存在性 ---------- */
const mustHave = [
  '--ds-accent', '--ds-bg', '--ds-ink', '--ds-line', '--ds-space-gutter',
  '--ds-radius-media', '--ds-ease-out', '--ds-dur-base', '--ds-type-h3',
  '--ds-rail-width', '--ds-rail-inset', '--ds-max-width', '--ds-read-width',
  '--ds-canvas-hud-bg', '--ds-canvas-scrim', '--ds-focus-ring', '--ds-target-min',
  '--ds-track-cjk', '--ds-focus-width', '--ds-focus-offset', '--ds-radius-control',
];
const all = { ...light, ...dark };
for (const v of mustHave) if (!(v in all)) fail(`缺少必备令牌 ${v}`);
if (!errors) ok(`必备令牌齐备（${mustHave.length} 项）`);

/* ---------- 7. 命名空间唯一性：目录自有层不得再声明 --ds-* 取值 ---------- */
const lumenCss = existsSync(LUMEN_CSS) ? readFileSync(LUMEN_CSS, 'utf8') : '';
const ownDecl = [...lumenCss.matchAll(/^\s*(--ds-[a-z0-9-]+)\s*:/gim)].map((m) => m[1]);
if (ownDecl.length) {
  fail(`src/styles/tokens.css 重新声明了 --ds-* 取值（§0 风险 B：同名变量由后加载者胜出）：${[...new Set(ownDecl)].join(', ')}`);
} else {
  ok('目录自有层未重复声明 --ds-* 取值（唯一声明处 = assets/ds/tokens.css）');
}

/* ---------- 8. 画布色板镜像一致性（--lumen-* ↔ gfx.js PALETTE） ---------- */
const gfx = readFileSync(path.join(ROOT, 'src/core/gfx.js'), 'utf8');
const palM = gfx.match(/export const PALETTE\s*=\s*\{([\s\S]*?)\n\};/);
const pal = {};
if (palM) {
  for (const line of palM[1].split('\n')) {
    const m = line.match(/^\s*(\w+)\s*:\s*'(#[0-9a-fA-F]{3,8})'/);
    if (m) pal[m[1]] = norm(m[2]);
  }
}
const LUMEN_NAME = {
  void: 'void', deep: 'deep', panel: 'panel', panel2: 'panel-2',
  line: 'line', line2: 'line-2', cyan: 'cyan', cyanDim: 'cyan-dim',
  amber: 'amber', amberDim: 'amber-dim', rose: 'rose', roseDim: 'rose-dim',
  bone: 'bone', slate: 'slate', dim: 'dim',
};
const lumen = {};
for (const line of lumenCss.split('\n')) {
  const m = line.match(/^\s*--lumen-([a-z0-9-]+)\s*:\s*(#[0-9a-fA-F]{3,8})\s*;/i);
  if (m) lumen[m[1]] = norm(m[2]);
}
let palBad = 0;
for (const [k, v] of Object.entries(pal)) {
  const name = LUMEN_NAME[k];
  if (!name || lumen[name] !== v) {
    fail(`--lumen-${name ?? k} = ${lumen[name] || '(缺失)'}，gfx.js PALETTE.${k} = ${v}`);
    palBad += 1;
  }
}
if (!palBad) ok(`--lumen-* 镜像与 gfx.js PALETTE 一致（${Object.keys(pal).length} 项）`);

/* ---------- 9. 玩法代码不得读取 CSS 变量（K.1 的结构保证） ---------- */
const codeFiles = ['src/games/rally.js', 'src/games/gravity.js', 'src/core/gfx.js', 'src/ui/previews.js'];
let leak = 0;
for (const f of codeFiles) {
  const src = readFileSync(path.join(ROOT, f), 'utf8');
  if (/getComputedStyle|getPropertyValue/.test(src)) {
    fail(`${f} 读取了 CSS 变量（会让外壳改版影响玩法画面，违反 K.1）`);
    leak += 1;
  }
}
if (!leak) ok(`玩法代码不读取任何 CSS 变量（${codeFiles.length} 个文件，K.1 结构保证）`);

/* ---------- 10. 与 16 源文件的一致性（副本漂移检测） ---------- */
const pairs = [
  ['16-design-system/src/tokens.css', 'assets/ds/tokens.css'],
  ['16-design-system/src/components.css', 'assets/ds/components.css'],
];
for (const [src, dst] of pairs) {
  const sp = path.resolve(ROOT, '..', src);
  const dp = path.join(ROOT, dst);
  if (!existsSync(sp) || !existsSync(dp)) continue;
  const a = readFileSync(sp, 'utf8').replace(/\s+/g, ' ').trim();
  const b = readFileSync(dp, 'utf8').replace(/\s+/g, ' ').trim();
  if (a === b) ok(`${dst} 与 ${src} 一致（无漂移）`);
  else warn(`${dst} 与 ${src} 存在差异（本目录做了本地调整，请确认是有意的）`);
}

console.log(`\n令牌校验：error ${errors} / warn ${warnings}`);
process.exit(errors ? 1 : 0);
