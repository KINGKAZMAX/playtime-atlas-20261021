#!/usr/bin/env node
/**
 * 令牌一致性校验（对应 16-design-system/MIGRATION-NOTES.md §9 的 V.3 / V.4）
 *
 * 校验两件事：
 *   V.3 取值一致 —— 本目录 src/styles/tokens.css 里出现的每一个 `--ds-*`，
 *                   取值必须与 16-design-system/src/tokens.css 的同名令牌**逐字相同**。
 *   V.4 命名空间  —— 本目录不得**重新定义** DS 之外的 `--ds-*`（MIGRATION-NOTES 风险 B：
 *                   同名变量「后加载者胜」，覆盖后值可能完全不同）。
 *
 * 16 的文件是**只读引用**：本脚本只读它，不写入它一个字。
 *
 * 两处本目录自有、DS 无同名令牌的出口，单独列为「说明」而非缺陷：
 *   --ds-art-paper / --ds-art-ink：展签图形（实物插画）专用色，
 *                                 DS 规范里没有这两个名字。
 *   --ds-base：DS 取值 "/playtime-atlas-20261021/"，本馆只在自己的子路径下，
 *              按 MIGRATION-NOTES §6 允许改用相对基准 ""。
 *
 * 解析要点（踩过的坑）：
 *   1. 令牌值可能跨行（--ds-font-display 就是），声明解析不能按行切。
 *   2. DS 的 tokens.css 里 @media (prefers-reduced-motion: reduce) 块内还有一个
 *      :root，会把 --ds-dur-* 覆盖成 1ms。取基准值时**必须排除媒体查询里的块**，
 *      否则会拿「降级后的值」当规范值比，比出一堆假不一致。
 *
 * 用法：node scripts/check-tokens.mjs
 * 退出码：0 = 通过；1 = 有不一致
 */

import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const DS_TOKENS = path.resolve(ROOT, '..', '16-design-system', 'src', 'tokens.css');
const MINE = path.join(ROOT, 'src', 'styles', 'tokens.css');

/** 本目录自有、DS 无同名令牌 → 允许，列为「说明」 */
const LOCAL_ONLY = new Set(['--ds-art-paper', '--ds-art-ink']);
/** DS 有同名令牌，但本目录按规范允许自定义取值 */
const LOCAL_OVERRIDE = new Set(['--ds-base']);

/**
 * 把 CSS 拆成「块」列表。
 * @returns {{selector: string, inMedia: boolean, vars: Map<string,string>}[]}
 */
function parseBlocks(css) {
  const text = css.replace(/\/\*[\s\S]*?\*\//g, ''); // 去注释
  const blocks = [];
  let i = 0;
  let mediaDepth = 0;
  const stack = [];

  while (i < text.length) {
    const open = text.indexOf('{', i);
    if (open === -1) break;
    const prelude = text.slice(i, open).trim();
    // 找到匹配的右括号
    let depth = 1;
    let j = open + 1;
    while (j < text.length && depth > 0) {
      if (text[j] === '{') depth += 1;
      else if (text[j] === '}') depth -= 1;
      j += 1;
    }
    const body = text.slice(open + 1, j - 1);

    if (prelude.startsWith('@media')) {
      // 媒体查询本身不含声明，内部另算一层
      mediaDepth += 1;
      stack.push({ prelude, body });
      i = j;
      continue;
    }

    const vars = new Map();
    const re = /(--[a-z0-9-]+)\s*:\s*([^;]+);/gi;
    let m;
    while ((m = re.exec(body)) !== null) {
      vars.set(m[1], m[2].replace(/\s+/g, ' ').trim());
    }
    blocks.push({ selector: prelude, inMedia: mediaDepth > 0, vars });

    // 媒体查询块：把它的内层声明块也解析出来（inMedia = true）
    if (mediaDepth > 0) {
      const inner = stack.pop();
      if (inner) {
        const re2 = /(--[a-z0-9-]+)\s*:\s*([^;]+);/gi;
        let m2;
        while ((m2 = re2.exec(inner.body)) !== null) {
          blocks.push({
            selector: `${inner.prelude} ${prelude}`.trim(),
            inMedia: true,
            vars: new Map([[m2[1], m2[2].replace(/\s+/g, ' ').trim()]]),
          });
        }
      }
    }
    i = j;
  }
  return blocks;
}

/** 取某个选择器下的变量表（优先非媒体查询里的） */
function varsFor(blocks, selector) {
  const out = new Map();
  for (const b of blocks) {
    if (b.selector === selector) {
      for (const [k, v] of b.vars) {
        if (!out.has(k) || !b.inMedia) out.set(k, v);
      }
    }
  }
  return out;
}

/** 全部 --ds-* 名字（不分主题） */
function dsNamesOf(blocks) {
  const s = new Set();
  for (const b of blocks) for (const k of b.vars.keys()) if (k.startsWith('--ds-')) s.add(k);
  return s;
}

const dsCss = await readFile(DS_TOKENS, 'utf8');
const myCss = await readFile(MINE, 'utf8');

const dsBlocks = parseBlocks(dsCss);
const myBlocks = parseBlocks(myCss);

const dsRoot = varsFor(dsBlocks, ':root');
const dsDark = varsFor(dsBlocks, '[data-ds-theme="dark"]');
const myRoot = varsFor(myBlocks, ':root');
const myDark = varsFor(myBlocks, '[data-ds-theme="dark"]');

const dsNames = dsNamesOf(dsBlocks);
const myNames = dsNamesOf(myBlocks);

const errors = [];
const notes = [];

function cmp(label, mine, theirs, name) {
  if (mine === undefined) return;
  if (theirs === undefined) {
    if (LOCAL_ONLY.has(name)) {
      notes.push(`${label} ${name} = ${mine}（本目录新增，DS 无同名令牌）`);
    } else {
      errors.push(`${label} ${name}：DS 令牌层里不存在这个名字`);
    }
    return;
  }
  if (LOCAL_OVERRIDE.has(name)) {
    notes.push(`${label} ${name} = ${mine}（DS 同名取值 ${theirs}；按 §6 允许本目录自定义基准）`);
    return;
  }
  if (mine.toLowerCase() !== theirs.toLowerCase()) {
    errors.push(`${label} ${name}：本目录 ${mine} ≠ DS ${theirs}`);
  }
}

// 1) V.3 取值一致
for (const [name, value] of myRoot) {
  if (!name.startsWith('--ds-')) continue;
  cmp('浅色主题', value, dsRoot.get(name), name);
}
for (const [name, value] of myDark) {
  if (!name.startsWith('--ds-')) continue;
  cmp('暗色主题', value, dsDark.get(name), name);
}

// 2) V.4 命名空间：不得引入 DS 之外的 --ds-*
for (const name of myNames) {
  if (dsNames.has(name) || LOCAL_ONLY.has(name)) continue;
  errors.push(`命名空间冲突：本目录定义了 DS 中不存在的 ${name}`);
}

// 3) 语义别名层必须指向 --ds-*（MIGRATION-NOTES 推荐的落地方式）
//    别名形如 `--ink: var(--ds-ink)`；允许别名再指向别名，但最终必须落到 --ds-*。
const myRaw = await readFile(MINE, 'utf8');
const aliasRe = /^\s*(--(?!ds-)[a-z0-9-]+)\s*:\s*([^;]+);/gim;
let am;
let aliasCount = 0;
while ((am = aliasRe.exec(myRaw)) !== null) {
  const name = am[1];
  const value = am[2].trim();
  // 只看「指向其它变量」的别名
  if (!value.startsWith('var(')) continue;
  aliasCount += 1;
  const ref = value.match(/var\(\s*(--[a-z0-9-]+)/i);
  if (!ref) {
    errors.push(`语义别名 ${name} = ${value} 不是合法的 var() 引用`);
    continue;
  }
  if (!ref[1].startsWith('--ds-')) {
    // 允许别名指向别名，但必须能追到 --ds-*
    const chain = new Set();
    let cur = ref[1];
    let ok = false;
    for (let hop = 0; hop < 5; hop += 1) {
      if (cur.startsWith('--ds-')) { ok = true; break; }
      if (chain.has(cur)) break;
      chain.add(cur);
      const next = myRaw.match(new RegExp(`^\\s*${cur}\\s*:\\s*var\\(\\s*(--[a-z0-9-]+)`, 'im'));
      if (!next) break;
      cur = next[1];
    }
    if (!ok) errors.push(`语义别名 ${name} → ${ref[1]} 未追到任何 --ds-* 令牌`);
  }
}

console.log('▶ 令牌一致性校验（V.3 取值 / V.4 命名空间）');
console.log(`  DS 参照： 16-design-system/src/tokens.css`);
console.log(`  本目录：   src/styles/tokens.css`);
console.log(`  DS  --ds-* 令牌数： ${dsNames.size}`);
console.log(`  本目录 --ds-* 令牌数： ${myNames.size}`);
console.log(`  其中与 DS 同名：     ${[...myNames].filter((n) => dsNames.has(n)).length}`);
console.log(`  本目录独有（已备案）： ${[...myNames].filter((n) => !dsNames.has(n)).join(', ') || '无'}`);
console.log(`  语义别名层条目： ${aliasCount}（均须指向 --ds-*）`);

if (notes.length) {
  console.log('\n  说明（非缺陷）：');
  for (const n of notes) console.log(`  · ${n}`);
}

if (errors.length) {
  console.log(`\n✗ ${errors.length} 项不一致：`);
  for (const e of errors) console.log(`  · ${e}`);
  process.exit(1);
}

console.log('\n✓ 令牌取值与命名空间均与设计系统一致');
