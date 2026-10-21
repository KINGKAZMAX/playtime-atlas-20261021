#!/usr/bin/env node
/**
 * DS 组件层桥接审计
 *
 * 目的（2026-10-22 接入 assets/ds/components.css 之后）：
 *   本目录把 16 的 components.css 作为**共享基线**先加载，自有样式层后加载并逐条覆盖。
 *   「后加载胜出」只在**同特异度**时成立。若 DS 用了更高特异度的选择器
 *   （如 `.ds-btn.ds-btn--primary`），本馆的覆盖就压不住它。
 *
 *   本脚本把两边的声明逐类摊开，列出两类风险：
 *     ① DS 声明了、本馆没声明的属性 → 该属性由 DS 说了算（可能与本馆设计冲突）
 *     ② 同一属性两边都声明但取值不同 → 需要靠加载顺序取胜；若 DS 选择器特异度更高则本馆输
 *
 * 只读分析，不改任何文件。
 *
 * 用法：node scripts/diag-ds-bridge.mjs
 * 退出码：0 = 未发现「DS 特异度更高」的硬冲突；1 = 有硬冲突
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const DS = path.resolve(ROOT, '..', '16-design-system', 'src', 'components.css');
const MY_DIR = path.join(ROOT, 'src', 'styles');

/** 粗略特异度：(a=id, b=class/attr/pseudo-class, c=type) */
function specificity(sel) {
  const s = sel.trim();
  const ids = (s.match(/#[\w-]+/g) || []).length;
  const classes = (s.match(/\.[\w-]+/g) || []).length
    + (s.match(/\[[^\]]+\]/g) || []).length
    + (s.match(/:(?!:)[\w-]+/g) || []).length;
  const types = (s.match(/(^|[\s>+~])([a-z][\w-]*)/gi) || []).length;
  return ids * 10000 + classes * 100 + types;
}

/** 解析 CSS：返回 [{selector, props:{k:v}}]，只取顶层规则（不含嵌套 at-rule 内的） */
function parseRules(css) {
  const text = css.replace(/\/\*[\s\S]*?\*\//g, '');
  const out = [];
  let i = 0;
  while (i < text.length) {
    const open = text.indexOf('{', i);
    if (open === -1) break;
    const prelude = text.slice(i, open).trim();
    if (prelude.startsWith('@')) {
      // 跳到匹配的右括号（媒体查询等整块跳过）
      let depth = 1;
      let j = open + 1;
      while (j < text.length && depth > 0) {
        if (text[j] === '{') depth += 1;
        else if (text[j] === '}') depth -= 1;
        j += 1;
      }
      i = j;
      continue;
    }
    let depth = 1;
    let j = open + 1;
    while (j < text.length && depth > 0) {
      if (text[j] === '{') depth += 1;
      else if (text[j] === '}') depth -= 1;
      j += 1;
    }
    const body = text.slice(open + 1, j - 1);
    const props = {};
    for (const d of body.matchAll(/([-a-z]+)\s*:\s*([^;]+);/gi)) {
      if (d[1].startsWith('--')) continue;
      props[d[1]] = d[2].replace(/\s+/g, ' ').trim();
    }
    for (const sel of prelude.split(',')) {
      const s = sel.trim();
      if (s) out.push({ selector: s, props, specificity: specificity(s) });
    }
    i = j;
  }
  return out;
}

/** 某个类上，DS 与本馆各自的声明（取该类出现过的所有选择器里特异度最高的那条的属性） */
function collect(rules, cls) {
  const hits = rules.filter((r) => new RegExp(`\\.${cls}(?![\\w-])`).test(r.selector));
  const byProp = new Map();
  for (const h of hits) {
    for (const [k, v] of Object.entries(h.props)) {
      const cur = byProp.get(k);
      if (!cur || h.specificity > cur.specificity) {
        byProp.set(k, { value: v, specificity: h.specificity, selector: h.selector });
      }
    }
  }
  return byProp;
}

const dsRules = parseRules(fs.readFileSync(DS, 'utf8'));
const myRules = [];
for (const f of fs.readdirSync(MY_DIR).filter((x) => x.endsWith('.css'))) {
  for (const r of parseRules(fs.readFileSync(path.join(MY_DIR, f), 'utf8'))) {
    myRules.push({ ...r, file: f });
  }
}

const dsClasses = [...new Set(dsRules.flatMap((r) => (r.selector.match(/\.[\w-]+/g) || []).map((c) => c.slice(1))))].sort();
const myClasses = [...new Set(myRules.flatMap((r) => (r.selector.match(/\.[\w-]+/g) || []).map((c) => c.slice(1))))].sort();
const overlap = dsClasses.filter((c) => myClasses.includes(c));

console.log('▶ DS 组件层桥接审计');
console.log(`  DS 组件类：${dsClasses.length} 个 · 本馆样式层类：${myClasses.length} 个 · **重叠：${overlap.length} 个**`);
console.log('');

const hardConflicts = [];
const softNotices = [];

for (const cls of overlap) {
  const ds = collect(dsRules, cls);
  const mine = collect(myRules, cls);
  const onlyDs = [...ds.keys()].filter((k) => !mine.has(k));
  const diff = [...ds.keys()].filter((k) => mine.has(k) && mine.get(k).value !== ds.get(k).value);

  if (!onlyDs.length && !diff.length) continue;

  const lines = [];
  for (const k of onlyDs) {
    lines.push(`      · DS 单独设置 ${k}: ${ds.get(k).value}（本馆未声明 → 由 DS 决定）`);
  }
  for (const k of diff) {
    const d = ds.get(k);
    const m = mine.get(k);
    const lose = d.specificity > m.specificity;
    const tag = lose ? '✗ DS 特异度更高，本馆压不住' : '✓ 本馆后加载，覆盖生效';
    lines.push(`      · ${k}: DS ${d.value}（${d.selector}） → 本馆 ${m.value}（${m.selector}）${tag}`);
    if (lose) hardConflicts.push(`.${cls} 的 ${k}：DS 选择器「${d.selector}」特异度 ${d.specificity} > 本馆「${m.selector}」${m.specificity}`);
  }

  console.log(`  .${cls}`);
  for (const l of lines) console.log(l);
  if (onlyDs.length) softNotices.push(`.${cls}：${onlyDs.length} 个属性由 DS 单独设置`);
}

console.log('');
if (softNotices.length) {
  console.log(`  说明：DS 单独设置的属性共 ${softNotices.length} 类 —— 属「共享基线」的正常效果，需目视确认：`);
  for (const s of softNotices) console.log(`    · ${s}`);
}

if (hardConflicts.length) {
  console.log(`\n✗ ${hardConflicts.length} 处硬冲突（DS 选择器特异度更高，本馆覆盖失效）：`);
  for (const c of hardConflicts) console.log(`  · ${c}`);
  process.exit(1);
}
console.log('\n✓ 未发现「DS 特异度更高」的硬冲突');
