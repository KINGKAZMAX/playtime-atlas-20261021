#!/usr/bin/env node
/**
 * 一次性探针：在真实卡片上试各种 CSS 方案，看哪一种能让
 * 「被裁掉的溢出内容」不再表现为可滚动溢出（scrollHeight/Width > clientHeight/Width），
 * 同时保住「行数截断 + 省略号」的视觉。
 *
 * 判据：
 *   overflow 区   —— scrollHeight/Width 是否等于 clientHeight/Width
 *   截断是否还在  —— 渲染出来的行数是否仍等于限定的行数
 */
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const require = createRequire(import.meta.url);
let chromium;
for (const candidate of [
  path.join(ROOT, '..', '07-museum-art', 'node_modules', 'playwright'),
  path.join(ROOT, 'node_modules', 'playwright'),
  'playwright',
]) {
  try { chromium = require(candidate).chromium; break; } catch { /* 下一个 */ }
}
if (!chromium) { console.error('✗ 未找到 playwright'); process.exit(2); }

const BASE = (process.argv[2] || 'http://127.0.0.1:4333/playtime-atlas-20261021/works/06-museum-main/')
  .replace(/\/*$/, '/');

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto(`${BASE}#/catalog`, { waitUntil: 'networkidle', timeout: 60000 });
await page.waitForSelector('.exhibit-card');

const out = await page.evaluate(() => {
  const results = [];
  const sum = document.querySelector('.card-summary');
  const cre = document.querySelector('.card-creator');
  const lineHeight = parseFloat(getComputedStyle(sum).lineHeight);

  const snap = (el, tag) => {
    const cs = getComputedStyle(el);
    return {
      tag,
      overflow: cs.overflow,
      contain: cs.contain,
      scrollH: el.scrollHeight, clientH: el.clientHeight,
      scrollW: el.scrollWidth, clientW: el.clientWidth,
      lines: +(el.clientHeight / lineHeight).toFixed(2),
      ellipsis: cs.textOverflow,
    };
  };

  const trials = [
    ['基线（现状）', () => {}],
    ['overflow:clip', () => { sum.style.overflow = 'clip'; cre.style.overflow = 'clip'; }],
    ['contain:paint', () => { sum.style.contain = 'paint'; cre.style.contain = 'paint'; }],
    ['contain:layout paint', () => { sum.style.contain = 'layout paint'; cre.style.contain = 'layout paint'; }],
    ['contain:strict', () => { sum.style.contain = 'strict'; cre.style.contain = 'strict'; }],
    ['contain:size', () => { sum.style.contain = 'size'; cre.style.contain = 'size'; }],
    ['clip-path 收口', () => { sum.style.clipPath = 'inset(0)'; cre.style.clipPath = 'inset(0)'; }],
    ['clip-path + contain:paint', () => {
      sum.style.clipPath = 'inset(0)'; cre.style.clipPath = 'inset(0)';
      sum.style.contain = 'paint'; cre.style.contain = 'paint';
    }],
  ];

  for (const [name, apply] of trials) {
    sum.removeAttribute('style');
    cre.removeAttribute('style');
    try { apply(); } catch { /* 某些属性组合可能抛错，忽略 */ }
    // 强制重排后再读
    void sum.offsetHeight;
    results.push({ name, sum: snap(sum, 'summary'), cre: snap(cre, 'creator') });
  }
  return results;
});

for (const r of out) {
  const s = r.sum;
  const noOverflow = s.scrollH === s.clientH;
  const c = r.cre;
  const noOverflowC = c.scrollW === c.clientW;
  console.log(`  ${r.name.padEnd(24)} summary scrollH/clientH = ${s.scrollH}/${s.clientH} ${noOverflow ? '✓无溢出' : '✗有溢出'}`
    + `  可见行 ${s.lines}  |  creator scrollW/clientW = ${c.scrollW}/${c.clientW} ${noOverflowC ? '✓' : '✗'}`);
}

await browser.close().catch(() => {});
