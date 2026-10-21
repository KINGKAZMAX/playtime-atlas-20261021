/**
 * 回响电玩馆 — 设计令牌生成器
 * 由 scripts/lib/tokens.mjs 生成：
 *   design-tokens.json          （根目录，canonical）
 *   public/assets/design-tokens.json（运行时副本）
 *   public/assets/tokens.css    （CSS 自定义属性）
 *   public/assets/tokens.js     （ES 模块导出 + 全局 window.ATLAS_TOKENS）
 *
 * 运行：node scripts/build-tokens.mjs
 */

import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import tokens from './lib/tokens.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');
const ASSETS = path.join(ROOT, 'public', 'assets');

/** camelCase → kebab-case */
function kebab(s) {
  return s.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
}

/** 递归扁平化令牌树 */
function flatten(node, prefix = [], out = {}) {
  for (const [key, value] of Object.entries(node)) {
    const seg = kebab(key);
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      flatten(value, [...prefix, seg], out);
    } else {
      out[[...prefix, seg].join('-')] = value;
    }
  }
  return out;
}

const flat = flatten(tokens);

/* ---------------- JSON ---------------- */
const json = JSON.stringify(tokens, null, 2) + '\n';
writeFileSync(path.join(ROOT, 'design-tokens.json'), json, 'utf8');
mkdirSync(ASSETS, { recursive: true });
writeFileSync(path.join(ASSETS, 'design-tokens.json'), json, 'utf8');

/* ---------------- CSS ---------------- */
const cssLines = [
  '/* 回响电玩馆 / PLAYTIME ATLAS — 设计令牌',
  ' * 由 scripts/lib/tokens.mjs 自动生成，请勿手改。',
  ' * 方案：深墨蓝 + 暖纸白 + 信号橙',
  ' */',
  ':root {',
];
for (const [key, value] of Object.entries(flat)) {
  const out =
    typeof value === 'number' && /^z-/.test(key) ? String(value) : String(value);
  cssLines.push(`  --atlas-${key}: ${out};`);
}
cssLines.push('}', '');

/* 语义别名，便于业务侧直接取用 */
cssLines.push(':root {');
const aliases = {
  'bg-base': 'semantic-bg-base',
  'bg-deep': 'semantic-bg-deep',
  'bg-panel': 'semantic-bg-panel',
  'bg-raised': 'semantic-bg-raised',
  'text-primary': 'semantic-text-primary',
  'text-secondary': 'semantic-text-secondary',
  'text-muted': 'semantic-text-muted',
  accent: 'semantic-accent',
  'accent-deep': 'semantic-accent-deep',
  positive: 'semantic-positive',
  hairline: 'semantic-hairline',
  scrim: 'semantic-scrim',
};
for (const [alias, ref] of Object.entries(aliases)) {
  cssLines.push(`  --atlas-${alias}: var(--atlas-${ref});`);
}
cssLines.push('}', '');
writeFileSync(path.join(ASSETS, 'tokens.css'), cssLines.join('\n'), 'utf8');

/* ---------------- JS ---------------- */
const js = [
  '/* 由 scripts/lib/tokens.mjs 自动生成，请勿手改。 */',
  `export const tokens = ${JSON.stringify(tokens, null, 2)};`,
  'export default tokens;',
  'if (typeof window !== "undefined") { window.ATLAS_TOKENS = tokens; }',
  '',
].join('\n');
writeFileSync(path.join(ASSETS, 'tokens.js'), js, 'utf8');

console.log(`✓ 设计令牌生成完成：${Object.keys(flat).length} 个令牌`);
console.log('  · design-tokens.json');
console.log('  · public/assets/design-tokens.json');
console.log('  · public/assets/tokens.css');
console.log('  · public/assets/tokens.js');
