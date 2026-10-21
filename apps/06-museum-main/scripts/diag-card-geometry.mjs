#!/usr/bin/env node
/**
 * 一次性诊断：卡片内部三块（.card-summary / .card-creator / .fav-text）
 * 的几何真相。
 *
 * 要区分三件事：
 *   1. 元素盒（getBoundingClientRect）——元素本身占多大地方
 *   2. 文本片段盒（getClientRects）——文字实际排成几行、各在哪
 *   3. 裁剪盒——祖先里 overflow!=visible 的框会把内容裁掉
 *
 * 只有「**没被裁掉、且真的画在屏幕上**」的两段文字叠在一起，才是压盖。
 * 若元素盒重叠但文字片段盒不重叠，那是检测口径的假阳性。
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
const WIDTH = Number(process.argv[3] || 1440);

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: WIDTH, height: WIDTH >= 1024 ? 900 : 844 } });
await page.goto(`${BASE}#/catalog`, { waitUntil: 'networkidle', timeout: 60000 });
await page.waitForSelector('.exhibit-card');

const out = await page.evaluate(() => {
  const box = (r) => [Math.round(r.left), Math.round(r.top), Math.round(r.right), Math.round(r.bottom)];
  const rows = [];
  const cards = [...document.querySelectorAll('.exhibit-card')].slice(0, 8);
  for (const card of cards) {
    const sum = card.querySelector('.card-summary');
    const cre = card.querySelector('.card-creator');
    const fav = card.querySelector('.fav-text');
    if (!sum || !cre) continue;
    const cardBox = card.getBoundingClientRect();
    rows.push({
      title: card.querySelector('.card-title')?.textContent.trim().slice(0, 18) || '',
      card: box(cardBox),
      summary: { text: sum.textContent.trim().slice(0, 18), el: box(sum.getBoundingClientRect()), frags: [...sum.getClientRects()].map(box), clamped: getComputedStyle(sum).webkitLineClamp },
      creator: { text: cre.textContent.trim().slice(0, 18), el: box(cre.getBoundingClientRect()), frags: [...cre.getClientRects()].map(box) },
      fav: fav ? { text: fav.textContent.trim(), el: box(fav.getBoundingClientRect()), frags: [...fav.getClientRects()].map(box), display: getComputedStyle(fav).display } : null,
    });
  }
  return rows;
});

const inter = (a, b) => {
  const w = Math.min(a[2], b[2]) - Math.max(a[0], b[0]);
  const h = Math.min(a[3], b[3]) - Math.max(a[1], b[1]);
  return w > 0 && h > 0 ? Math.round(w * h) : 0;
};

console.log(`▶ 卡片内部几何真相 · ${WIDTH}px\n`);
for (const r of out) {
  console.log(`  ▸ ${r.title}`);
  console.log(`     .card-summary  「${r.summary.text}」`);
  console.log(`        元素盒 ${JSON.stringify(r.summary.el)}  行片段 ${JSON.stringify(r.summary.frags)}  line-clamp=${r.summary.clamped}`);
  console.log(`     .card-creator  「${r.creator.text}」`);
  console.log(`        元素盒 ${JSON.stringify(r.creator.el)}  行片段 ${JSON.stringify(r.creator.frags)}`);
  if (r.fav) {
    console.log(`     .fav-text     「${r.fav.text}」  display=${r.fav.display}`);
    console.log(`        元素盒 ${JSON.stringify(r.fav.el)}  行片段 ${JSON.stringify(r.fav.frags)}`);
  }
  console.log(`     压盖面积： summary×creator = ${inter(r.summary.el, r.creator.el)}px²（元素盒）｜ ${inter(r.summary.frags[0] ?? [-9, -9, -9, -9], r.creator.frags[0] ?? [-9, -9, -9, -9])}px²（行片段）`);
  if (r.fav) console.log(`              summary×fav     = ${inter(r.summary.el, r.fav.el)}px²（元素盒）｜ ${inter(r.summary.frags[0] ?? [-9, -9, -9, -9], r.fav.frags[0] ?? [-9, -9, -9, -9])}px²（行片段）`);
  console.log('');
}

await browser.close().catch(() => {});
