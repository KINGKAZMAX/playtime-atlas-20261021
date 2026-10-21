/**
 * 回响电玩馆 — 设计令牌生成器
 *
 * 输入：design-tokens.json（由 scripts/sync-ds-tokens.mjs 从 16-design-system 对齐生成）
 * 输出：
 *   src/tokens.css                 （--ds-* 令牌层 + --atlas-* 语义别名 + --atlas-local-* 展品内嵌）
 *   public/assets/tokens.css       （同上，供 06 / 13 / 14 取用）
 *   src/tokens.js                  （ES 模块导出，供预览页 import；避免从 public/ 直接 import）
 *   public/assets/tokens.js        （ES 模块导出 + 全局 window.ATLAS_TOKENS）
 *
 * 依据：16-design-system/design-tokens.json（取值唯一来源）
 *       16-design-system/src/tokens.css（变量名与分组参考实现）
 *
 * 运行：node scripts/build-tokens.mjs
 */

import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');
const ASSETS = path.join(ROOT, 'public', 'assets');
const SRC = path.join(ROOT, 'src');

const tokens = JSON.parse(await import('node:fs').then((fs) =>
  fs.promises.readFile(path.join(ROOT, 'design-tokens.json'), 'utf8')));

const { cssVars, local, meta } = tokens;
const align = meta.alignment;

/* =========================================================
   CSS
   ========================================================= */

/** 语义别名层：全部重定向到 --ds-*，随主题自动切换 */
const ATLAS_ALIASES = {
  /* 1.0.0 语义键名（下游仍在用） */
  'semantic-bg-base': 'var(--ds-bg)',
  'semantic-bg-deep': 'var(--ds-bg-sunken)',
  'semantic-bg-panel': 'var(--ds-surface)',
  'semantic-bg-raised': 'var(--ds-bg-raised)',
  'semantic-text-primary': 'var(--ds-ink)',
  'semantic-text-secondary': 'var(--ds-ink-soft)',
  'semantic-text-muted': 'var(--ds-ink-faint)',
  'semantic-text-on-signal': 'var(--ds-accent-ink)',
  'semantic-accent': 'var(--ds-accent)',
  'semantic-accent-deep': 'var(--ds-accent-hover)',
  'semantic-accent-soft': 'var(--ds-accent-soft)',
  'semantic-positive': 'var(--ds-jade)',
  'semantic-hairline': 'var(--ds-line)',
  'semantic-hairline-strong': 'var(--ds-line-strong)',
  'semantic-scrim': 'var(--ds-canvas-scrim)',
  /* 短别名 */
  'bg-base': 'var(--atlas-semantic-bg-base)',
  'bg-deep': 'var(--atlas-semantic-bg-deep)',
  'bg-panel': 'var(--atlas-semantic-bg-panel)',
  'bg-raised': 'var(--atlas-semantic-bg-raised)',
  'text-primary': 'var(--atlas-semantic-text-primary)',
  'text-secondary': 'var(--atlas-semantic-text-secondary)',
  'text-muted': 'var(--atlas-semantic-text-muted)',
  accent: 'var(--atlas-semantic-accent)',
  'accent-deep': 'var(--atlas-semantic-accent-deep)',
  positive: 'var(--atlas-semantic-positive)',
  hairline: 'var(--atlas-semantic-hairline)',
  scrim: 'var(--atlas-semantic-scrim)',
  /* 层级与动效别名 */
  'z-base': 'var(--ds-z-base)',
  'z-raised': 'var(--ds-z-raised)',
  'z-sticky': 'var(--ds-z-sticky)',
  'z-overlay': 'var(--ds-z-overlay)',
  'z-modal': 'var(--ds-z-modal)',
  'z-toast': 'var(--ds-z-toast)',
  'radius': 'var(--ds-radius-md)',
  'ease': 'var(--ds-ease-snap)',
  'wrap': 'var(--ds-max-width-wide)',
};

const css = [];
css.push('/* =========================================================');
css.push('   回响电玩馆 / PLAYTIME ATLAS — 设计令牌（已对齐余晖设计系统）');
css.push('   ----------------------------------------------------');
css.push('   对齐 16-design-system design-tokens v' + align.designSystemVersion +
  '（对齐时间 ' + align.alignedAt + '）');
css.push('   依据：16-design-system/design-tokens.json（取值唯一来源）');
css.push('         16-design-system/src/tokens.css（变量名与分组）');
css.push('   生成：scripts/build-tokens.mjs ← scripts/sync-ds-tokens.mjs');
css.push('   来源：' + align.source + '   指纹：' + String(align.fingerprints?.designTokensSha256 || '').slice(0, 16));
css.push('   主色：--ds-accent = ' + (tokens.cssVars?.root?.['--ds-accent'] || '见 :root') +
  '（亮色） / ' + (tokens.cssVars?.dark?.['--ds-accent'] || '见主题块') + '（暗色）');
css.push('         —— 16 是规范的唯一定义方，07 消费并登记对齐版本号。');
css.push('   展品内嵌配色（--atlas-local-*）是作品自身表达，已烘焙进资产，不随 UI 主题变化。');
css.push('   ----------------------------------------------------');
css.push('   三层结构：');
css.push('     1. --ds-*          16 的令牌层（浅色默认 + 深色主题）');
css.push('     2. --atlas-*       语义别名层，全部重定向到 --ds-*（随主题自适应）');
css.push('     3. --atlas-local-* 展品内嵌配色（海报/封面/展柜/GLB 已烘焙，非 UI 色板）');
css.push('   ========================================================= */');
css.push('');

/* ---------- 1. --ds-* 浅色（默认） ---------- */
css.push('/* ---------- 1. --ds-* 浅色主题（默认） ---------- */');
css.push(':root {');
for (const [k, v] of Object.entries(cssVars.root)) css.push(`  ${k}: ${v};`);
css.push('}');
css.push('');

/* ---------- 2. --ds-* 深色主题 ---------- */
css.push('/* ---------- 2. --ds-* 深色主题 ---------- */');
css.push('[data-ds-theme="dark"] {');
for (const [k, v] of Object.entries(cssVars.dark)) css.push(`  ${k}: ${v};`);
css.push('}');
css.push('');
css.push('/* ---------- 跟随系统（未显式指定主题时） ---------- */');
css.push('@media (prefers-color-scheme: dark) {');
css.push('  :root:not([data-ds-theme="light"]) {');
for (const [k, v] of Object.entries(cssVars.dark)) css.push(`    ${k}: ${v};`);
css.push('  }');
css.push('}');
css.push('');

/* ---------- 3. --atlas-* 语义别名 ---------- */
css.push('/* ---------- 3. --atlas-* 语义别名（重定向到 --ds-*，随主题自适应） ---------- */');
css.push(':root {');
for (const [k, v] of Object.entries(ATLAS_ALIASES)) css.push(`  --atlas-${k}: ${v};`);
css.push('}');
css.push('');

/* ---------- 4. --atlas-local-* 展品内嵌配色 ---------- */
css.push('/* ---------- 4. --atlas-local-* 展品内嵌配色 ----------');
css.push('   海报 / 封面 / 展柜 / GLB 材质已按此取值烘焙进资产文件，');
css.push('   不随 UI 主题变化。UI 一律使用 --ds-*。 ---------- */');
css.push(':root {');
for (const [group, steps] of Object.entries(local.color)) {
  for (const [step, hex] of Object.entries(steps)) {
    css.push(`  --atlas-local-${group}-${step}: ${hex};`);
  }
}
css.push('}');
css.push('');

/* ---------- 5. 中文排版修正 ---------- */
css.push('/* ---------- 5. 中文排版修正（负字距会破坏汉字字面） ---------- */');
css.push(':lang(zh),');
css.push(':lang(zh-CN),');
css.push(':lang(zh-TW) {');
css.push('  letter-spacing: var(--ds-track-cjk);');
css.push('  line-height: 1.75;');
css.push('  word-break: normal;');
css.push('  overflow-wrap: anywhere;');
css.push('}');
css.push('');

/* ---------- 6. 减少动态效果 ---------- */
css.push('/* ---------- 6. prefers-reduced-motion 降级 ---------- */');
css.push('@media (prefers-reduced-motion: reduce) {');
css.push('  :root {');
css.push('    --ds-dur-instant: 1ms; --ds-dur-fast: 1ms; --ds-dur-base: 1ms;');
css.push('    --ds-dur-slow: 1ms;  --ds-dur-reveal: 1ms; --ds-entry-duration: 1ms;');
css.push('  }');
css.push('  *, *::before, *::after {');
css.push('    animation-duration: 1ms !important;');
css.push('    animation-iteration-count: 1 !important;');
css.push('    transition-duration: 1ms !important;');
css.push('    scroll-behavior: auto !important;');
css.push('  }');
css.push('  html { scroll-behavior: auto !important; }');
css.push('}');
css.push('');

const cssText = css.join('\n');

mkdirSync(ASSETS, { recursive: true });
mkdirSync(SRC, { recursive: true });
writeFileSync(path.join(ASSETS, 'tokens.css'), cssText, 'utf8');
writeFileSync(path.join(SRC, 'tokens.css'), cssText, 'utf8');

/* =========================================================
   JS
   ========================================================= */
const jsText = [
  '/* 由 scripts/build-tokens.mjs 自动生成，请勿手改。',
  ' * 对齐 16-design-system design-tokens v' + align.designSystemVersion +
    '（对齐时间 ' + align.alignedAt + '）',
  ' * 依据 16-design-system/design-tokens.json（对齐来源：' + align.source + '）',
  ' * 主色：--ds-accent = ' + (tokens.cssVars?.root?.['--ds-accent'] || '') +
    '（亮色） / ' + (tokens.cssVars?.dark?.['--ds-accent'] || '') + '（暗色）',
  ' * —— 16 是规范的唯一定义方；本文件消费并登记对齐版本号。',
  ' * 展品内嵌配色（local.color / --atlas-local-*）是作品自身表达，已烘焙进资产，不随 UI 主题变化。',
  ' */',
  `export const tokens = ${JSON.stringify(tokens, null, 2)};`,
  'export default tokens;',
  'if (typeof window !== "undefined") { window.ATLAS_TOKENS = tokens; }',
  '',
].join('\n');
writeFileSync(path.join(ASSETS, 'tokens.js'), jsText, 'utf8');
writeFileSync(path.join(SRC, 'tokens.js'), jsText, 'utf8');

console.log(`✓ 令牌产物生成完成`);
console.log(`  · --ds-* 变量 ${Object.keys(cssVars.root).length} 个（深色覆盖 ${Object.keys(cssVars.dark).length} 个）`);
console.log(`  · --atlas-* 语义别名 ${Object.keys(ATLAS_ALIASES).length} 个（全部指向 --ds-*）`);
console.log(`  · --atlas-local-* 展品内嵌色 ${Object.values(local.color).reduce((n, s) => n + Object.keys(s).length, 0)} 个`);
console.log('  · src/tokens.css · public/assets/tokens.css');
console.log('  · src/tokens.js  · public/assets/tokens.js');
