#!/usr/bin/env node
/**
 * 一次性诊断：按**取值**（而不是按文本）比较三份 tokens.css 的 --ds-* 令牌：
 *   A. 16-design-system/src/tokens.css   （规范来源，canonical）
 *   B. 07-museum-art/public/assets/tokens.css（07 生成的 atlas 三层版，我们的拷贝源）
 *   C. 06-museum-core/public/data/tokens.css（本目录的拷贝产物）
 *
 * 三份文件的**排版结构不同**（07 生成的是「--ds-* + --atlas-*」三层版），
 * 逐行 diff 没有意义，必须按变量名比对取值。
 */
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const SIB = path.resolve(ROOT, '..');

const A = path.join(SIB, '16-design-system', 'src', 'tokens.css');
const B = path.join(SIB, '07-museum-art', 'public', 'assets', 'tokens.css');
const C = path.join(ROOT, 'public', 'data', 'tokens.css');

async function blockOf(css, selector) {
  const re = new RegExp(selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\s*\\{([^}]*)\\}', 'g');
  const out = new Map();
  let m;
  while ((m = re.exec(css)) !== null) {
    const re2 = /(--ds-[a-z0-9-]+)\s*:\s*([^;]+);/gi;
    let m2;
    while ((m2 = re2.exec(m[1])) !== null) out.set(m2[1], m2[2].replace(/\s+/g, ' ').trim());
  }
  return out;
}

async function parse(file) {
  const css = await readFile(file, 'utf8');
  const out = new Map();
  const re = /(--ds-[a-z0-9-]+)\s*:\s*([^;]+);/gi;
  let m;
  while ((m = re.exec(css)) !== null) out.set(m[1], m[2].replace(/\s+/g, ' ').trim());
  return out;
}

const darkOf = async (f) => {
  const css = await readFile(f, 'utf8');
  const d = blockOf(css, '[data-ds-theme="dark"]');
  return d.size ? d : blockOf(css, ':root');
};

const [a, b, c] = await Promise.all([parse(A), parse(B), parse(C)]);
const [ad, bd, cd] = await Promise.all([darkOf(A), darkOf(B), darkOf(C)]);

console.log('▶ tokens.css 取值比对\n');
console.log(`  A 规范源  16-design-system/src/tokens.css        ${a.size} 个 --ds-*`);
console.log(`  B 拷贝源  07-museum-art/public/assets/tokens.css ${b.size} 个 --ds-*`);
console.log(`  C 产物    06-museum-core/public/data/tokens.css  ${c.size} 个 --ds-*`);

const norm = (s) => s.toLowerCase().replace(/\s+/g, ' ').trim();

function diff(x, y, labelX, labelY) {
  const keys = new Set([...x.keys(), ...y.keys()]);
  const diffs = [];
  for (const k of [...keys].sort()) {
    const vx = x.get(k);
    const vy = y.get(k);
    if (vx === undefined) { diffs.push(`${k}: ${labelY} 没有（${labelX} 有 ${vx}）`); continue; }
    if (vy === undefined) { diffs.push(`${k}: ${labelX} 没有（${labelY} 有 ${vy}）`); continue; }
    if (norm(vx) !== norm(vy)) diffs.push(`${k}: ${labelX}=${vx}  ≠  ${labelY}=${vy}`);
  }
  return diffs;
}

const ab = diff(a, b, 'A', 'B');
const bc = diff(b, c, 'B', 'C');
const ac = diff(a, c, 'A', 'C');

console.log(`\n  A ↔ B（规范源 vs 拷贝源）：${ab.length ? `${ab.length} 项不同` : '完全一致'}`);
for (const d of ab.slice(0, 12)) console.log(`    · ${d}`);
if (ab.length > 12) console.log(`    …… 还有 ${ab.length - 12} 项`);

console.log(`\n  B ↔ C（拷贝源 vs 本目录产物）：${bc.length ? `${bc.length} 项不同` : '完全一致'}`);
for (const d of bc.slice(0, 12)) console.log(`    · ${d}`);

console.log(`\n  A ↔ C（规范源 vs 本目录产物）：${ac.length ? `${ac.length} 项不同` : '完全一致'}`);
const adBc = diff(ad, bd, 'A深色', 'B深色');
const bdCd = diff(bd, cd, 'B深色', 'C深色');
console.log(`\n  ── 深色主题块（本站实际生效的那一套）──`);
console.log(`  A深色 ↔ B深色：${adBc.length ? `${adBc.length} 项不同` : '完全一致'}`);
for (const d of adBc.slice(0, 8)) console.log(`    · ${d}`);
console.log(`  B深色 ↔ C深色：${bdCd.length ? `${bdCd.length} 项不同` : '完全一致'}`);
for (const d of bdCd.slice(0, 8)) console.log(`    · ${d}`);
for (const d of ac.slice(0, 12)) console.log(`    · ${d}`);
if (ac.length > 12) console.log(`    …… 还有 ${ac.length - 12} 项`);

console.log(`\n  结论：${ac.length === 0 ? '本目录产物与规范源取值一致，无需重同步' : '本目录产物落后于规范源，需要重跑同步/构建'}`);
process.exit(ac.length ? 1 : 0);
