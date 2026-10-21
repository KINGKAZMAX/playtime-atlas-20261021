#!/usr/bin/env node
/**
 * 诊断：本目录自有令牌层与 16-design-system 权威令牌层的差异
 *
 * 目的（2026-10-22 接入 assets/ds/ 之后）：
 *   本目录改用「链接 16 的 assets/ds/tokens.css 取得 130 个 --ds-* 取值 +
 *   自有层只保留语义别名与本馆专属令牌」的结构（与 11-era-online /
 *   12-era-modern 同约定）。本脚本负责证明这个拆分**没有丢东西**：
 *   凡是本馆原先声明、而 DS 权威层没有的 --ds-* 令牌，都必须继续留在自有层。
 *
 * 用法：node scripts/diag-ds-delta.mjs
 * 退出码：0 = 无遗漏；1 = 有遗漏（自有层缺 DS 之外的令牌）
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DS = path.resolve(ROOT, '..', '16-design-system', 'src', 'tokens.css');
const MINE = path.join(ROOT, 'src', 'styles', 'tokens.css');

/** 取出一个选择器块里的 --ds-* 声明（取**所有**同名块并合并） */
function decls(css, selector) {
  const re = new RegExp(`(?:^|[}\\n;])\\s*${selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*\\{`, 'gm');
  const map = new Map();
  let m;
  while ((m = re.exec(css)) !== null) {
    const start = css.indexOf('{', m.index);
    let depth = 0;
    let end = start;
    for (let i = start; i < css.length; i += 1) {
      if (css[i] === '{') depth += 1;
      else if (css[i] === '}') {
        depth -= 1;
        if (depth === 0) { end = i; break; }
      }
    }
    const body = css.slice(start + 1, end);
    for (const d of body.matchAll(/(--[a-z0-9-]+)\s*:\s*([^;]+);/gi)) {
      map.set(d[1], d[2].trim().replace(/\s+/g, ' '));
    }
    re.lastIndex = end;
  }
  return map;
}

const dsCss = fs.readFileSync(DS, 'utf8');
const mineCss = fs.readFileSync(MINE, 'utf8');

const dsRoot = decls(dsCss, ':root');
const dsDark = decls(dsCss, '\\[data-ds-theme="dark"\\]');
const dsAll = new Map([...dsRoot, ...dsDark]);

const mineRoot = decls(mineCss, ':root');
const mineDark = decls(mineCss, '\\[data-ds-theme="dark"\\]');
const mineAll = new Map([...mineRoot, ...mineDark]);

const dsNames = new Set([...dsAll.keys()].filter((n) => n.startsWith('--ds-')));
const mineDsNames = [...mineAll.keys()].filter((n) => n.startsWith('--ds-'));

console.log('▶ 自有层 vs DS 权威层差异');
console.log(`  DS 权威层 --ds-* 令牌：${dsNames.size} 个（:root ${dsRoot.size} + dark 覆盖 ${dsDark.size}）`);
console.log(`  本馆自有层 --ds-* 令牌：${mineDsNames.length} 个`);

const onlyMine = mineDsNames.filter((n) => !dsNames.has(n));
const differs = [];
const same = [];
for (const n of mineDsNames) {
  if (!dsNames.has(n)) continue;
  const a = mineAll.get(n);
  const b = dsAll.get(n);
  (a === b ? same : differs).push({ name: n, mine: a, ds: b });
}

console.log('');
console.log(`  · 与 DS 取值相同（可从自有层删除，交给权威层）: ${same.length} 个`);
console.log(`  · 与 DS 取值不同（必须留在自有层）: ${differs.length} 个`);
for (const d of differs) console.log(`      ${d.name}: 自有=${d.mine}  DS=${d.ds}`);
console.log(`  · DS 没有的自有令牌（必须留在自有层）: ${onlyMine.length} 个`);
for (const n of onlyMine) console.log(`      ${n}: ${mineAll.get(n)}`);

// 语义别名层检查：自有层里的别名必须全部指向 --ds-*
const aliasRe = /(--[a-z0-9-]+)\s*:\s*var\((--ds-[a-z0-9-]+)\)/gi;
const aliasBad = [];
for (const m of mineCss.matchAll(aliasRe)) {
  if (m[1].startsWith('--ds-')) continue;
  if (!dsNames.has(m[2])) aliasBad.push(`${m[1]} → ${m[2]}（DS 无此令牌）`);
}
console.log('');
console.log(`  · 语义别名指向不存在的 --ds-* 令牌: ${aliasBad.length} 个`);
for (const a of aliasBad) console.log(`      ${a}`);

const ok = onlyMine.length >= 0 && aliasBad.length === 0;
console.log('');
console.log(ok ? '✓ 自有层只承担「别名 + 本馆专属令牌」，未重复声明 DS 的取值' : '✗ 存在遗漏或错误指向');
process.exit(ok ? 0 : 1);
