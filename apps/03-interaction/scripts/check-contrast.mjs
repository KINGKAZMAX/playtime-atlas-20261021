#!/usr/bin/env node
/**
 * 对比度校验（WCAG 2.2）
 * --------------------------------------------------------------------------
 * 依据 MIGRATION-NOTES §5「无障碍与双语」：
 *   正文对比度 ≥ 4.5:1；大字 ≥ 3:1；图形/控件边界 ≥ 3:1
 * 令牌来源：src/tokens.css（与 16-design-system/design-tokens.json 逐条一致）
 *
 * 脚本从 src/tokens.css 解析 --ds-* 的实际取值再计算，
 * 因此改色后必须重跑；避免「文档里写着达标、代码里其实不达标」。
 *
 * 运行：node scripts/check-contrast.mjs
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const TOKENS = fs.readFileSync(path.join(ROOT, 'src/tokens.css'), 'utf8');

/* 解析 :root 块里的十六进制取��� */
const vars = {};
const rootBlock = TOKENS.slice(TOKENS.indexOf(':root {'), TOKENS.indexOf('}', TOKENS.indexOf(':root {')));
for (const m of rootBlock.matchAll(/--ds-[a-z0-9-]+:\s*(#[0-9a-fA-F]{3,8})\s*;/g)) {
  vars[m[0].split(':')[0].trim()] = m[1];
}

function hexToRgb(hex) {
  let h = hex.replace('#', '');
  if (h.length === 3) h = h.split('').map((c) => c + c).join('');
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}
function rgbToHex([r, g, b]) {
  return `#${[r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('')}`;
}
/** CSS color-mix(in srgb, A p%, B) —— 与浏览器一致：先转线性空间外的 sRGB 分量再按比例混合 */
function mix(a, b, p) {
  const A = hexToRgb(a);
  const B = hexToRgb(b);
  return rgbToHex(A.map((v, i) => Math.round(v * p + B[i] * (1 - p))));
}
function luminance(hex) {
  const [r, g, b] = hexToRgb(hex).map((v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
function contrast(a, b) {
  const la = luminance(a);
  const lb = luminance(b);
  const [hi, lo] = la > lb ? [la, lb] : [lb, la];
  return (hi + 0.05) / (lo + 0.05);
}

const C = {
  bg: vars['--ds-bg'],
  bgRaised: vars['--ds-bg-raised'],
  bgSunken: vars['--ds-bg-sunken'],
  surface: vars['--ds-surface'],
  ink: vars['--ds-ink'],
  inkSoft: vars['--ds-ink-soft'],
  inkFaint: vars['--ds-ink-faint'],
  line: vars['--ds-line'],
  lineStrong: vars['--ds-line-strong'],
  accent: vars['--ds-accent'],
  accentHover: vars['--ds-accent-hover'],
  accentSoft: vars['--ds-accent-soft'],
  accentInk: vars['--ds-accent-ink'],
  jade: vars['--ds-jade'],
  success: vars['--ds-success'],
  warning: vars['--ds-warning'],
  danger: vars['--ds-danger'],
  info: vars['--ds-info'],
};
// 语义别名层里的状态文字墨色（tokens.css 里以 color-mix 从状态色与墨色推导）
C.okInk = mix(C.success, C.ink, 0.78);
C.warnInk = mix(C.warning, C.ink, 0.72);
C.errInk = mix(C.danger, C.ink, 0.82);

/* [前景, 背景, 最低比值, 说明] */
const CASES = [
  [C.ink, C.bg, 4.5, '正文：主文字 on 页面底色'],
  [C.ink, C.bgRaised, 4.5, '正文：主文字 on 卡片底色'],
  [C.inkSoft, C.bg, 4.5, '正文：次级文字 on 页面底色'],
  [C.inkSoft, C.bgRaised, 4.5, '正文：次级文字 on 卡片底色'],
  [C.inkFaint, C.bg, 4.5, '正文：占位/轴标 on 页面底色'],
  [C.inkFaint, C.bgRaised, 4.5, '正文：占位/轴标 on 卡片底色'],
  [C.inkFaint, C.bgSunken, 4.5, '正文：占位/轴标 on 凹陷底色'],
  [C.accent, C.bg, 4.5, '正文：朱砂强调文字 on 页面底色'],
  [C.accent, C.accentSoft, 4.5, '正文：朱砂强调文字 on 朱砂浅底'],
  [C.accentInk, C.accent, 4.5, '按钮文字 on 朱砂底'],
  [C.accentInk, C.accentHover, 4.5, '按钮文字 on 朱砂悬停底'],
  [C.bg, C.ink, 4.5, 'Toast：浅色文字 on 墨色底'],
  [C.okInk, C.bg, 4.5, '状态文字：运行/完成'],
  [C.okInk, C.bgRaised, 4.5, '状态文字：运行/完成 on 卡片'],
  [C.warnInk, C.bg, 4.5, '状态文字：换经/警告'],
  [C.warnInk, C.bgRaised, 4.5, '状态文字：换经/警告 on 卡片'],
  [C.errInk, C.bg, 4.5, '状态文字：故障'],
  [C.errInk, C.bgRaised, 4.5, '状态文字：故障 on 卡片'],
  [C.info, C.bg, 4.5, '状态文字：待单（信息色）'],
  [C.info, C.bgRaised, 4.5, '状态文字：待单（信息色）on 卡片'],
  [C.success, C.bg, 3, '图形：运行状态点（非文字）'],
  [C.warning, C.bg, 3, '图形：换经状态点（非文字）'],
  [C.danger, C.bg, 3, '图形：故障状态点（非文字）'],
  [C.info, C.bg, 3, '图形：待单状态点（非文字）'],
  [C.inkFaint, C.bg, 3, '图形：停机状态点（非文字）'],
  [C.inkFaint, C.bg, 3, '控件边界：表单输入框描边'],
  [C.inkFaint, C.bgRaised, 3, '控件边界：输入框描边 on 卡片'],
  [C.jade, C.bg, 3, '图形：恢复提示条底色边界'],
  ['#ffffff', C.jade, 4.5, '恢复提示条：白字 on 玉色底'],
];

const failures = [];
console.log('  比值   前景 on 背景');
for (const [fg, bg, min, label] of CASES) {
  const r = contrast(fg, bg);
  const mark = r >= min ? '✓' : '✗';
  console.log(`  ${mark} ${r.toFixed(2).padStart(5)}  (≥${min})  ${fg} on ${bg}  ${label}`);
  if (r < min) failures.push(`${label}：${fg} on ${bg} = ${r.toFixed(2)} < ${min}`);
}

/* DS 原值的能力边界（如实记录，不静默修正） */
const dsNotes = [];
const lineRatio = contrast(C.line, C.bg);
const lineStrongRatio = contrast(C.lineStrong, C.bg);
if (lineRatio < 3) dsNotes.push(`--ds-line on --ds-bg = ${lineRatio.toFixed(2)}:1（低于非文字控件边界 3:1，DS 原值，本作品仅用于装饰分隔线）`);
if (lineStrongRatio < 3) dsNotes.push(`--ds-line-strong on --ds-bg = ${lineStrongRatio.toFixed(2)}:1（同上，用于次级分隔线）`);
if (contrast(C.warning, C.bg) < 4.5) dsNotes.push(`--ds-warning on --ds-bg = ${contrast(C.warning, C.bg).toFixed(2)}:1（低于正文 4.5:1，故状态文字改用派生墨色 --warn-ink）`);

if (dsNotes.length) {
  console.log('\n  说明（DS 原值的能力边界，如实记录）：');
  dsNotes.forEach((n) => console.log(`  · ${n}`));
}

if (failures.length) {
  console.error('\n✗ 对比度校验未通过：');
  failures.forEach((f) => console.error(`  - ${f}`));
  process.exit(1);
}
console.log('\n✓ 对比度校验通过：正文 ≥4.5:1，图形/控件边界 ≥3:1。');
