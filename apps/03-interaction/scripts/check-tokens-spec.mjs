#!/usr/bin/env node
/**
 * 令牌层自测 —— 对齐 16-design-system 的验收口径
 * --------------------------------------------------------------------------
 * 依据（均为 16-design-system 只读）：
 *   · MIGRATION-NOTES.md §9「自测清单」V.11 / V.12 / V.13
 *   · MIGRATION-NOTES.md §2.0.1「字体栈顺序专项」
 *   · MIGRATION-NOTES.md §2.7「03-interaction 专项映射表」
 *   · MIGRATION-NOTES.md §7「降级块写法」（1ms 只能出现在 prefers-reduced-motion 内）
 *   · tools/validate-tokens.mjs（16 的零依赖参考实现，判据口径与之一致）
 *   · tools/ds-audit-tokens.mjs（口径 A 必备 17 项 / 全量等值）
 *
 * 检查项：
 *   1. V.11 字体栈顺序：Noto Sans SC 子集必须排在**所有**系统 CJK 族之后，且不得被删除
 *   2. V.12 不自造字体栈：自有 CSS 的 font-family 只能引用 var(--ds-font-*)，
 *      不得出现字面 CJK 族或自托管族名
 *   3. V.13 无规范漂移：tokens.css 的字体族序列须与 design-tokens.json
 *      → typography.family 逐项相等（**含顺序**）
 *   4. 口径 A 必备令牌（17 项）齐备，且取值与 16 的 src/tokens.css 逐名等值
 *   5. 降级隔离：1ms 只能出现在 prefers-reduced-motion 块内；
 *      :root 的 --ds-dur-* 与 --ds-entry-duration 必须是规范值（不是 1ms）
 *   6. --ds-target-min = 44px（AAA 档；紧凑变体 .ds-btn--sm 32px 由组件层保证）
 *
 * 运行：node scripts/check-tokens-spec.mjs
 * 零依赖，只读 16-design-system，不写入任何文件。
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const DS = path.resolve(ROOT, '..', '16-design-system');

const failures = [];
const notes = [];
const fail = (m) => failures.push(m);
const ok = (m) => notes.push(m);

const SYS_CJK = ['PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', 'Source Han Sans SC'];
const SELF_FONTS = ['Space Grotesk', 'Inter', 'Space Mono'];

/* ---------- CSS 解析：按花括号深度 + 条件分类收集声明 ----------
 * 判据与 16 的 tools/ds-audit-tokens.mjs 一致：
 *   · 顶层（:root）无条件声明 → root
 *   · @media (prefers-reduced-motion: reduce) 内的声明 → reduced（降级值，单独判定）
 *   · 其它条件块内的声明 → 忽略
 * 关键是**必须把降级块单独归类**：v1.0.0 的首版解析器没排除降级块，
 * 于是「正确实现了 reduced-motion」被误判成「没实现动效」。 */
function parseCss(css) {
  css = css.replace(/\/\*[\s\S]*?\*\//g, '');
  const root = {};
  const reduced = {};
  let i = 0;
  const stack = [];
  let buf = '';

  const kindOf = (pre) => {
    const p = pre.trim();
    if (/^@media/i.test(p)) {
      if (/prefers-reduced-motion/i.test(p)) return 'reduced';
      return 'other';
    }
    if (/\[data-rm/i.test(p)) return 'reduced';
    return 'selector';
  };

  while (i < css.length) {
    const ch = css[i];
    if (ch === '{') { stack.push(kindOf(buf)); buf = ''; i++; continue; }
    if (ch === '}') { stack.pop(); buf = ''; i++; continue; }
    if (ch === ';') {
      const decl = buf; buf = ''; i++;
      const m = decl.match(/^\s*(--[\w-]+)\s*:\s*([^;]+)$/);
      if (!m) continue;
      const name = m[1];
      const val = m[2].replace(/\s+/g, ' ').trim();
      const conds = stack.filter((k) => k !== 'selector');
      if (conds.includes('reduced')) { if (!(name in reduced)) reduced[name] = val; continue; }
      if (conds.length) continue;           // 其它条件块 → 忽略
      if (stack.length === 0) { if (!(name in root)) root[name] = val; }
      continue;
    }
    buf += ch; i++;
  }
  return { root, reduced };
}

const famIndex = (stack, fam) => {
  const m = stack.match(new RegExp(`["']${fam.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}["']`));
  return m ? m.index : -1;
};
const famList = (stack) => (stack.match(/["'][^"']+["']/g) || []).map((s) => s.replace(/["']/g, '').trim());
const eq = (a, b) => String(a).replace(/\s+/g, ' ').trim().toLowerCase()
  === String(b).replace(/\s+/g, ' ').trim().toLowerCase();

/* ---------- 读取本目录文件 ---------- */
const tokenFile = path.join(ROOT, 'src/tokens.css');
const ownFiles = [path.join(ROOT, 'src/styles.css'), path.join(ROOT, 'src/ds-components.css')];
const tokenCss = fs.readFileSync(tokenFile, 'utf8');
const { root, reduced } = parseCss(tokenCss);

/* ---------- 1. V.11 字体栈顺序 ---------- */
for (const v of ['--ds-font-display', '--ds-font-text']) {
  const stack = root[v];
  if (!stack) { fail(`${v}：顶层 :root 未声明`); continue; }
  const noto = famIndex(stack, 'Noto Sans SC');
  if (noto < 0) {
    fail(`${v}：缺少 "Noto Sans SC" 子集 —— 不得用「删除子集」替代调序（DESIGN-SPEC §2.5）`);
    continue;
  }
  const sys = SYS_CJK.map((f) => famIndex(stack, f)).filter((i) => i >= 0);
  if (!sys.length) {
    fail(`${v}：未声明任何系统 CJK 族（应含 PingFang SC / Hiragino Sans GB / Microsoft YaHei / Source Han Sans SC）`);
    continue;
  }
  if (noto < Math.min(...sys)) {
    fail(`${v}："Noto Sans SC" 排在系统 CJK 族之前 —— 覆盖完整的族必须在前，否则同段文字混排 + 基线错位`);
  } else {
    ok(`V.11 字体栈顺序：${v} —— Noto Sans SC 下标 ${noto} > 最小系统 CJK 族下标 ${Math.min(...sys)}`);
  }
}

/* ---------- 2. V.12 不自造字体栈 ---------- */
let v12Bad = 0;
for (const f of ownFiles) {
  const rel = path.relative(ROOT, f);
  const text = fs.readFileSync(f, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
  for (const m of text.matchAll(/font-family\s*:\s*([^;}]+)/gi)) {
    const decl = m[1].trim();
    if (/var\(\s*--ds-font-/i.test(decl)) continue;   // 引用 token → 正确
    const lits = famList(decl);
    const cjkLit = lits.find((l) => SYS_CJK.includes(l));
    if (cjkLit) { fail(`V.12 ${rel}：写死了中文字体族 "${cjkLit}" —— 只能引用 var(--ds-font-*)`); v12Bad++; continue; }
    const selfLit = lits.filter((l) => SELF_FONTS.includes(l));
    if (selfLit.length) { fail(`V.12 ${rel}：写死了字体族 ${selfLit.join(', ')} —— 应统一引用 var(--ds-font-*)`); v12Bad++; }
  }
}
if (!v12Bad) ok('V.12 不自造字体栈：自有 CSS 的全部 font-family 均引用 var(--ds-font-*)');

/* ---------- 3. V.13 无规范漂移（对 design-tokens.json） ---------- */
const dt = JSON.parse(fs.readFileSync(path.join(DS, 'design-tokens.json'), 'utf8'));
const specFamily = (role) => {
  const t = dt.typography?.family?.[role];
  const v = t && typeof t === 'object' ? t.$value : t;
  return typeof v === 'string' ? famList(v) : null;
};
for (const [role, v] of [['display', '--ds-font-display'], ['text', '--ds-font-text']]) {
  const spec = specFamily(role);
  const actual = famList(root[v] || '');
  if (!spec || !actual.length) { fail(`V.13 ${v}：无法比对（spec=${spec ? 'ok' : '缺'} css=${actual.length ? 'ok' : '缺'}）`); continue; }
  const same = spec.length === actual.length && spec.every((s, i) => s.toLowerCase() === String(actual[i]).toLowerCase());
  if (!same) fail(`V.13 ${v}：与 design-tokens.json → typography.family.${role} 漂移 —— 规范 [${spec.join(', ')}] vs CSS [${actual.join(', ')}]（顺序也必须相等）`);
  else ok(`V.13 无规范漂移：${v} 与 design-tokens.json → typography.family.${role} 逐项相等（含顺序）`);
}

/* ---------- 4. 口径 A 必备令牌 + 与 16 的 src/tokens.css 全量等值 ---------- */
const MUST_HAVE = [
  '--ds-accent', '--ds-bg', '--ds-ink', '--ds-line', '--ds-space-gutter',
  '--ds-radius-media', '--ds-ease-out', '--ds-dur-base', '--ds-type-h3',
  '--ds-rail-width', '--ds-rail-inset', '--ds-max-width', '--ds-read-width',
  '--ds-canvas-hud-bg', '--ds-canvas-scrim', '--ds-focus-ring', '--ds-target-min',
];
const specParsed = parseCss(fs.readFileSync(path.join(DS, 'src/tokens.css'), 'utf8'));
const specRoot = specParsed.root;
const specDark = specParsed.dark || {};

const missing = MUST_HAVE.filter((k) => !(k in root));
const badValue = MUST_HAVE.filter((k) => k in root && !eq(root[k], specRoot[k]) && !(specDark[k] && eq(root[k], specDark[k])));
if (missing.length) fail(`口径 A 必备令牌缺 ${missing.length} 项：${missing.join(', ')}`);
if (badValue.length) fail(`口径 A 必备令牌取值与 16 不一致：${badValue.map((k) => `${k}=${root[k]}(应为 ${specRoot[k]})`).join('; ')}`);
if (!missing.length && !badValue.length) ok(`口径 A：必备 ${MUST_HAVE.length} 项齐备且取值与 16 一致`);

const specKeys = Object.keys(specRoot).filter((k) => k.startsWith('--ds-'));
const fullMissing = specKeys.filter((k) => !(k in root));
const fullDiff = specKeys.filter((k) => k in root && !eq(root[k], specRoot[k]) && !(specDark[k] && eq(root[k], specDark[k])));
if (fullMissing.length) fail(`全量比对：缺 ${fullMissing.length} 项 —— ${fullMissing.slice(0, 8).join(', ')}${fullMissing.length > 8 ? ' …' : ''}`);
if (fullDiff.length) fail(`全量比对：${fullDiff.length} 项取值与 16 不一致 —— ${fullDiff.slice(0, 8).join(', ')}`);
if (!fullMissing.length && !fullDiff.length) ok(`全量比对：与 16 的 src/tokens.css 逐名等值（${specKeys.length} 项）`);

/* ---------- 5. 降级隔离：1ms 只能出现在 prefers-reduced-motion 块内 ---------- */
const MOTION_SPEC = {
  '--ds-dur-instant': '120ms', '--ds-dur-fast': '200ms', '--ds-dur-base': '320ms',
  '--ds-dur-slow': '520ms', '--ds-dur-reveal': '800ms', '--ds-entry-duration': '640ms',
};
let motionBad = 0;
for (const [k, want] of Object.entries(MOTION_SPEC)) {
  const got = root[k];
  if (!got) { fail(`降级隔离：:root 未声明 ${k}`); motionBad++; continue; }
  if (eq(got, '1ms')) { fail(`降级隔离：:root 的 ${k} 被写成 1ms —— 降级值只能出现在 @media (prefers-reduced-motion: reduce) 内，否则所有用户都拿不到动效`); motionBad++; continue; }
  if (!eq(got, want)) { fail(`降级隔离：:root 的 ${k} = ${got}，规范值为 ${want}`); motionBad++; }
}
const reducedHasAll = Object.keys(MOTION_SPEC).every((k) => k in reduced);
if (!reducedHasAll) fail(`降级隔离：prefers-reduced-motion 块内缺少 ${Object.keys(MOTION_SPEC).filter((k) => !(k in reduced)).join(', ')}`);
if (!motionBad && reducedHasAll) {
  ok('降级隔离：:root 动效值为规范值（120/200/320/520/800ms + entry 640ms），1ms 只出现在 prefers-reduced-motion 块内');
}
// 额外：扫描全部自有 CSS，确认没有把 1ms 写在无条件层
for (const f of [tokenFile, ...ownFiles]) {
  const rel = path.relative(ROOT, f);
  const parsed = parseCss(fs.readFileSync(f, 'utf8'));
  for (const [k, v] of Object.entries(parsed.root)) {
    if (/1ms|0\.01ms/.test(v)) { fail(`降级隔离：${rel} 的 :root 把 ${k} 写成 ${v} —— 降级值不得进默认层`); motionBad++; }
  }
}

/* ---------- 6. --ds-target-min ---------- */
if (!eq(root['--ds-target-min'], '44px')) {
  fail(`--ds-target-min = ${root['--ds-target-min']}，应为 44px（AAA 档；紧凑变体 .ds-btn--sm 32px 豁免）`);
} else {
  ok('--ds-target-min = 44px（主控件 AAA 档；.ds-btn--sm 32px 为唯一豁免类）');
}

/* ---------- 输出 ---------- */
notes.forEach((n) => console.log('  ✓ ' + n));
if (failures.length) {
  console.error('\n✗ 令牌层自测未通过：');
  failures.forEach((f) => console.error('  - ' + f));
  process.exit(1);
}
console.log('\n✓ 令牌层自测通过：V.11 / V.12 / V.13 + 口径 A 必备令牌 + 降级隔离 + 触摸目标阈值。');
