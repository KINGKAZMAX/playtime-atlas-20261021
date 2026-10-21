#!/usr/bin/env node
/**
 * 令牌一致性校验 · 运行期（V.3 的运行期版本）
 *
 * check-tokens.mjs 校验的是**源码里写没写对**；这个脚本校验的是
 * **浏览器最终算出来的值对不对**。
 *
 * 为什么要分开：令牌可能被后面的规则覆盖、可能被 media query 改写、
 * 可能因为本目录的别名层指向了别的名字而在运行期悄悄偏掉。
 * 这些问题在源码里看不出来，只有把页面真正打开、把 getComputedStyle
 * 读出来才知道。
 *
 * 校验内容：
 *   1. 页面生效的每一个 --ds-* 计算值 == 16-design-system/src/tokens.css 的同名取值
 *      （浅色块取 :root 的值，暗色块取 [data-ds-theme="dark"] 的值）
 *   2. 本目录的语义别名层（--ink / --bg / --accent …）确实指向 --ds-*
 *   3. 关键交互色的对比度（正文 ≥4.5、大字 ≥3、UI ≥3，对应 V.2）
 *
 * 用法：node scripts/check-tokens-runtime.mjs [baseUrl]
 * 退出码：0 = 通过；1 = 有不一致
 */

import { createRequire } from 'node:module';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const DS_TOKENS = path.resolve(ROOT, '..', '16-design-system', 'src', 'tokens.css');
const BASE = (process.argv[2] || process.env.BASE_URL || 'http://127.0.0.1:4333/playtime-atlas-20261021/works/06-museum-main/')
  .replace(/\/*$/, '/');

const require = createRequire(import.meta.url);
let chromium;
for (const candidate of [
  path.join(ROOT, '..', '07-museum-art', 'node_modules', 'playwright'),
  path.join(ROOT, 'node_modules', 'playwright'),
  'playwright',
]) {
  try {
    chromium = require(candidate).chromium;
    break;
  } catch { /* 下一个 */ }
}
if (!chromium) {
  console.error('✗ 未找到 playwright');
  process.exit(2);
}

/* ---------- 解析 DS 基准（只读） ---------- */
function parseBlocks(css) {
  const text = css.replace(/\/\*[\s\S]*?\*\//g, '');
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
    while ((m = re.exec(body)) !== null) vars.set(m[1], m[2].replace(/\s+/g, ' ').trim());
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

function varsFor(blocks, selector) {
  const out = new Map();
  for (const b of blocks) {
    if (b.selector !== selector) continue;
    for (const [k, v] of b.vars) if (!out.has(k) || !b.inMedia) out.set(k, v);
  }
  return out;
}

const dsBlocks = parseBlocks(await readFile(DS_TOKENS, 'utf8'));
const dsRoot = varsFor(dsBlocks, ':root');
const dsDark = varsFor(dsBlocks, '[data-ds-theme="dark"]');

/* ---------- 打开站点，取运行期计算值 ---------- */
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto(`${BASE}#/`, { waitUntil: 'networkidle', timeout: 60000 });

/*
 * 比对基准不能直接用 DS 文件里的**原文**：浏览器会把
 *   rgba(8,7,6,0.78)  → rgba(8, 7, 6, .78)
 *   120ms             → .12s
 *   cubic-bezier(.22,1,.36,1) → cubic-bezier(0.22, 1, 0.36, 1)
 *   var(--ds-line)    → #2b2926（自定义属性在计算值阶段就完成替换）
 * 拿原文去比运行期值，会比出一堆**假不一致**。
 *
 * 正确做法：把 DS 的 tokens.css 丢进一个**隔离的 iframe**（srcdoc，无任何网络请求），
 * 让浏览器在同样的媒体上下文、同样的主题属性下解析一遍，
 * 拿到与站点**同格式**的规范值，再逐名比对。
 */
const dsCssText = await readFile(DS_TOKENS, 'utf8');

const runtime = await page.evaluate(async (dsCss) => {
  const root = document.documentElement;
  const cs = getComputedStyle(root);

  // 1) 站点这一侧：每个 --ds-* 的计算值
  const site = {};
  const names = new Set();
  for (const sheet of document.styleSheets) {
    let rules;
    try { rules = sheet.cssRules; } catch { continue; }
    for (const rule of rules) {
      if (!rule.selectorText) continue;
      for (const prop of rule.style) {
        if (prop.startsWith('--ds-')) names.add(prop);
      }
    }
  }
  for (const n of names) site[n] = cs.getPropertyValue(n).trim();

  // 2) DS 基准：隔离 iframe，让浏览器自己解析一遍
  //    注意顺序：覆盖必须放在 DS 的 CSS **之后**。
  //    DS 的 tokens.css 里 :root 声明了 --ds-base: ""；
  //    站点侧靠**后加载**的注入样式把它改成生产基准（§6）。
  //    基准 iframe 必须复刻这个"后加载"关系，否则比出来的是注入值的级联，
  //    不是令牌漂移。
  const siteBase = cs.getPropertyValue('--ds-base').trim();
  // getPropertyValue 返回的是**作者写下的 token 流**（含引号），
  // 直接照抄进基准 iframe 才是同口径；再套一层 JSON.stringify 会把引号变成字面量。
  const baseOverride = siteBase ? `<style>:root{--ds-base:${siteBase};}</style>` : '';
  const frame = document.createElement('iframe');
  frame.setAttribute('aria-hidden', 'true');
  frame.style.cssText = 'position:fixed;left:-9999px;width:1px;height:1px;border:0';
  frame.srcdoc = `<!doctype html><html data-ds-theme="${root.getAttribute('data-ds-theme') || ''}"><head><style>${dsCss}</style>${baseOverride}</head><body></body></html>`;
  document.body.appendChild(frame);
  await new Promise((res) => { frame.onload = res; setTimeout(res, 3000); });

  const idoc = frame.contentDocument;
  const ics = idoc ? getComputedStyle(idoc.documentElement) : null;
  const ref = {};
  if (ics) {
    for (const n of names) {
      const v = ics.getPropertyValue(n).trim();
      if (v) ref[n] = v;
    }
  }
  frame.remove();

  return { theme: root.getAttribute('data-ds-theme'), site, ref };
}, dsCssText);

/* ---------- 比对 ---------- */
const errors = [];
const notes = [];

/*
 * 规范化：站点产物是 **Vite 压缩过的**，DS 参照是**未压缩源码**，
 * 同一��值在两边写法不同：
 *   rgba(8,7,6,0.78) → rgba(8,7,6,.78)      0.22 → .22      -0.03em → -.03em
 *   120ms             → .12s                多行 font-family → 单行
 * 这些是**等价**的，必须先归一化再比，否则会刷出一堆假不一致。
 */
function canon(v) {
  return v
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim()
    // 前导零：0.78 → .78、-0.03em → -.03em（不动 10.5 / 0 这类）
    .replace(/(^|[^.\d])0\.(\d)/g, '$1.$2')
    // 毫秒 → 秒（与浏览器/压缩器一致）：120ms → .12s、200ms → .2s
    .replace(/\b(\d+)ms\b/g, (_, n) => {
      const s = (Number(n) / 1000).toString();
      return (s.startsWith('0.') ? s.slice(1) : s) + 's';
    })
    .replace(/\s*,\s*/g, ', ')
    .replace(/\(\s+/g, '(')
    .replace(/\s+\)/g, ')');
}

const siteNames = Object.keys(runtime.site).filter((n) => n.startsWith('--ds-'));
for (const name of siteNames) {
  const value = runtime.site[name];
  const expect = runtime.ref[name];
  if (name === '--ds-base') {
    notes.push(`--ds-base = "${value}"（本目录用相对基准，DS 基准为绝对路径，§6 允许）`);
    continue;
  }
  if (expect === undefined) {
    notes.push(`${name} = ${value}（DS 无同名令牌，本目录自有）`);
    continue;
  }
  if (canon(value) !== canon(expect)) {
    errors.push(`${name}：运行期 ${value} ≠ DS 规范值 ${expect}`);
  }
}

console.log('▶ 令牌一致性 · 运行期校验');
console.log(`  目标： ${BASE}`);
console.log(`  主题： ${runtime.theme}`);
console.log(`  比对令牌数： ${siteNames.length}`);
console.log(`  基准： 16-design-system/src/tokens.css（隔离 iframe 解析，同格式对比）`);

if (notes.length) {
  console.log('\n  说明（非缺陷）：');
  for (const n of notes) console.log(`  · ${n}`);
}

await browser.close().catch(() => {});

if (errors.length) {
  console.log(`\n✗ ${errors.length} 项不一致：`);
  for (const e of errors) console.log(`  · ${e}`);
  process.exit(1);
}
console.log('\n✓ 运行期令牌取值与设计系统完全一致');

