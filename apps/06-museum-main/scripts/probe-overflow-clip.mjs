#!/usr/bin/env node
/**
 * 一次性探针：验证 `overflow: clip` 能否在保持「行数截断 + 省略号」的同时，
 * 把 scrollWidth/scrollHeight 收回到 clientWidth/clientHeight。
 *
 * 动机：D1 检测器若用 scrollWidth/scrollHeight 量「内容延伸范围」，
 * 就会把**被裁掉、根本没画出来**的文字判成压盖。
 * overflow:clip 与 overflow:hidden 的区别正在于：clip 不是滚动容器，
 * 没有可滚动溢出区，scrollHeight 就等于 clientHeight。
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
  const probe = (el) => ({
    scrollH: el.scrollHeight, clientH: el.clientHeight,
    scrollW: el.scrollWidth, clientW: el.clientWidth,
    overflow: getComputedStyle(el).overflow,
    textOverflow: getComputedStyle(el).textOverflow,
    lines: el.getClientRects().length,
  });
  const sum = document.querySelector('.card-summary');
  const cre = document.querySelector('.card-creator');

  const before = { sum: probe(sum), cre: probe(cre) };

  // 试验：把 overflow:hidden 换成 overflow:clip
  sum.style.overflow = 'clip';
  cre.style.overflow = 'clip';
  const after = { sum: probe(sum), cre: probe(cre) };

  // 截断是否还生效？看渲染出来的行数（clientH / 行高）
  const lh = parseFloat(getComputedStyle(sum).lineHeight);
  return {
    before, after,
    lineHeight: lh,
    visibleLinesBefore: +(before.sum.clientH / lh).toFixed(2),
    visibleLinesAfter: +(after.sum.clientH / lh).toFixed(2),
    clampedTextBefore: sum.textContent.slice(0, 40),
    clampedTextAfter: sum.textContent.slice(0, 40),
  };
});

console.log('▶ overflow:clip 试验\n');
console.log('  .card-summary（行数截断）：');
console.log(`    before: ${JSON.stringify(out.before.sum)}`);
console.log(`    after : ${JSON.stringify(out.after.sum)}`);
console.log(`    可见行数 before=${out.visibleLinesBefore} → after=${out.visibleLinesAfter}`);
console.log('\n  .card-creator（单行省略号）：');
console.log(`    before: ${JSON.stringify(out.before.cre)}`);
console.log(`    after : ${JSON.stringify(out.after.cre)}`);

await browser.close().catch(() => {});
