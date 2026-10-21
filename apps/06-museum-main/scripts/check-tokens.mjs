#!/usr/bin/env node
/**
 * 令牌一致性校验（对应 16-design-system/MIGRATION-NOTES.md §9 的 V.3 / V.4）
 *
 * 2026-10-22 起本目录改用「**唯一声明处 + 增量层**」结构
 * （与 11-era-online / 12-era-modern 同约定）：
 *
 *   唯一声明处：public/assets/ds/tokens.css
 *                ← 逐字节复制自 16-design-system/src/tokens.css
 *                ← index.html 里 <link href="./assets/ds/tokens.css"> 引入
 *   增量层：    src/styles/tokens.css
 *                只保留语义别名层、本馆专属令牌、对设计系统的增量覆盖
 *
 * 因此校验项变成四条：
 *   V.3 接入完整性 —— 产物里那一份 assets/ds/tokens.css 的全部 --ds-* 取值，
 *                     必须与 16-design-system/src/tokens.css 逐名逐值相同。
 *   V.4 唯一声明处 —— 本目录自有样式层**不得**声明任何 --ds-* 的取值。
 *                     同名变量声明两遍就是「后加载者胜」（风险 B），
 *                     本目录既然已经引入权威层，就不能再自己抄一遍。
 *   V.5 命名空间   —— 自有层不得出现设计系统之外的 --ds-* 名字（风险 A）。
 *   V.6 别名层     —— 自有层的语义别名必须指向 --ds-*（MIGRATION-NOTES 推荐的落地方式）。
 *
 * 16 的文件是**只读引用**：本脚本只读它，不写入它一个字。
 *
 * 解析要点（踩过的坑）：
 *   1. 令牌值可能跨行（--ds-font-display 就是），声明解析不能按行切。
 *   2. 基准文件里 @media (prefers-reduced-motion: reduce) 块内还有一个
 *      :root，会把 --ds-dur-* 覆盖成 1ms。取基准值时**必须排除媒体查询里的块**，
 *      否则会拿「降级后的值」当规范值比，比出一堆假不一致。
 *
 * 用法：node scripts/check-tokens.mjs
 * 退出码：0 = 通过；1 = 有不一致
 */

import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

/** 16 的权威令牌层（只读参照） */
const DS_TOKENS = path.resolve(ROOT, '..', '16-design-system', 'src', 'tokens.css');
/** 本目录随产物发布的那一份（应为 DS 的逐字节副本） */
const SHIPPED_TOKENS = path.join(ROOT, 'public', 'assets', 'ds', 'tokens.css');
/** 本目录的自有增量层 */
const MINE = path.join(ROOT, 'src', 'styles', 'tokens.css');
/** 自有层目录：整目录扫，确保没有任何一处偷偷声明了 --ds-* 取值 */
const MY_STYLE_DIR = path.join(ROOT, 'src', 'styles');

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
    let depth = 1;
    let j = open + 1;
    while (j < text.length && depth > 0) {
      if (text[j] === '{') depth += 1;
      else if (text[j] === '}') depth -= 1;
      j += 1;
    }
    const body = text.slice(open + 1, j - 1);

    if (prelude.startsWith('@media')) {
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

const errors = [];
const notes = [];

if (!existsSync(SHIPPED_TOKENS)) {
  console.error(`✗ 缺少产物侧的令牌层：${path.relative(ROOT, SHIPPED_TOKENS)}`);
  console.error('  先跑 `npm run sync`（它从 16-design-system 逐字节复制到 public/assets/ds/）');
  process.exit(1);
}

const dsCss = await readFile(DS_TOKENS, 'utf8');
const shippedCss = await readFile(SHIPPED_TOKENS, 'utf8');
const myRaw = await readFile(MINE, 'utf8');

const dsBlocks = parseBlocks(dsCss);
const shippedBlocks = parseBlocks(shippedCss);

const dsRoot = varsFor(dsBlocks, ':root');
const dsDark = varsFor(dsBlocks, '[data-ds-theme="dark"]');
const shipRoot = varsFor(shippedBlocks, ':root');
const shipDark = varsFor(shippedBlocks, '[data-ds-theme="dark"]');
const dsNames = dsNamesOf(dsBlocks);
const shipNames = dsNamesOf(shippedBlocks);

/* ── V.3 接入完整性：产物里的那份必须与 16 逐名逐值相同 ─────────────────── */
for (const [name, value] of dsRoot) {
  const mine = shipRoot.get(name);
  if (mine === undefined) {
    errors.push(`V.3 接入不完整：产物侧 tokens.css 缺少 ${name}`);
  } else if (mine.toLowerCase() !== value.toLowerCase()) {
    errors.push(`V.3 取值不一致（浅色）${name}：产物侧 ${mine} ≠ 16 ${value}`);
  }
}
for (const [name, value] of dsDark) {
  const mine = shipDark.get(name);
  if (mine === undefined) {
    errors.push(`V.3 接入不完整：产物侧 tokens.css 缺少暗色覆盖 ${name}`);
  } else if (mine.toLowerCase() !== value.toLowerCase()) {
    errors.push(`V.3 取值不一致（暗色）${name}：产物侧 ${mine} ≠ 16 ${value}`);
  }
}
for (const name of shipNames) {
  if (!dsNames.has(name)) errors.push(`V.3 产物侧多出设计系统没有的令牌 ${name}`);
}

/* ── V.4 唯一声明处 + V.5 命名空间：自有层不得声明 --ds-* 取值 ──────────── */
const myBlocks = parseBlocks(myRaw);
const myNames = dsNamesOf(myBlocks);
if (myNames.size > 0) {
  const detail = [...myNames].map((n) => {
    const b = myBlocks.find((x) => x.vars.has(n));
    return `${n}=${b ? b.vars.get(n) : '?'}`;
  }).join(', ');
  errors.push(`V.4 违反唯一声明处：自有层 src/styles/tokens.css 仍声明了 ${myNames.size} 个 --ds-* 取值（${detail}）`);
}

/* 整个自有样式目录再扫一遍，防止在别的文件里偷偷声明 */
const { readdir } = await import('node:fs/promises');
const styleFiles = (await readdir(MY_STYLE_DIR)).filter((f) => f.endsWith('.css'));
const stray = [];
for (const f of styleFiles) {
  const css = await readFile(path.join(MY_STYLE_DIR, f), 'utf8');
  for (const b of parseBlocks(css)) {
    for (const [k, v] of b.vars) {
      if (!k.startsWith('--ds-')) continue;
      // 只认「取值声明」：值里出现 var(--ds-*) 的是引用，不是声明
      if (v.includes('var(--ds-')) continue;
      stray.push(`${f}: ${k} = ${v}`);
    }
  }
}
if (stray.length) {
  errors.push(`V.4 违反唯一声明处：自有样式层里出现 ${stray.length} 处 --ds-* 取值声明 —— ${stray.join('; ')}`);
}

/* ── V.6 别名层必须指向 --ds-* ───────────────────────────────────────────── */
const aliasRe = /^\s*(--(?!ds-)[a-z0-9-]+)\s*:\s*([^;]+);/gim;
let am;
let aliasCount = 0;
while ((am = aliasRe.exec(myRaw)) !== null) {
  const name = am[1];
  const value = am[2].trim();
  if (!value.startsWith('var(')) continue;
  aliasCount += 1;
  const ref = value.match(/var\(\s*(--[a-z0-9-]+)/i);
  if (!ref) {
    errors.push(`V.6 语义别名 ${name} = ${value} 不是合法的 var() 引用`);
    continue;
  }
  if (!ref[1].startsWith('--ds-')) {
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
    if (!ok) errors.push(`V.6 语义别名 ${name} → ${ref[1]} 未追到任何 --ds-* 令牌`);
  }
}

/* 本目录自有的、非 --ds- 前缀的令牌（备案清单） */
const localOnly = new Set();
for (const b of myBlocks) {
  for (const k of b.vars.keys()) {
    if (k.startsWith('--ds-')) continue;
    if (k.startsWith('--era-accent')) continue; // 年代身份色，另有备案
    localOnly.add(k);
  }
}
notes.push(`本目录自有令牌（非 --ds- 前缀，不占设计系统命名空间）：${[...localOnly].sort().join(', ')}`);

/* ── 输出 ─────────────────────────────────────────────────────────────────── */
console.log('▶ 令牌一致性校验（V.3 接入 / V.4 唯一声明处 / V.5 命名空间 / V.6 别名层）');
console.log('  DS 参照：  16-design-system/src/tokens.css（只读）');
console.log('  产物侧：    public/assets/ds/tokens.css（页面实际引入的那份）');
console.log('  自有层：    src/styles/tokens.css（别名 + 本馆专属 + 增量覆盖）');
console.log(`  DS --ds-* 令牌数： ${dsNames.size}`);
console.log(`  产物侧 --ds-* 令牌数： ${shipNames.size}`);
console.log(`  自有层 --ds-* 取值声明数： ${myNames.size}（应为 0 —— 取值唯一声明处是 assets/ds/tokens.css）`);
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

console.log('\n✓ 令牌取值唯一声明在设计系统权威层；自有层未重复声明，且别名全部指向 --ds-*');
