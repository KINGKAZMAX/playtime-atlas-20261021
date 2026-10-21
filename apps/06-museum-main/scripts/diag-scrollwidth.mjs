#!/usr/bin/env node
/**
 * 一次性诊断：验证「13 的 D1 是不是用了 scrollWidth/scrollHeight 来算压盖面积」。
 *
 * 做法：把同一批卡片，分别用两种口径算压盖面积
 *   A. 可见盒（clientWidth/Height 或 getBoundingClientRect）
 *   B. 内容盒（scrollWidth/scrollHeight，溢出内容的延伸范围）
 * 如果 B 的结果能复现 13 报出的数字（726 / 1182 / 368 / 350 px²），
 * 就说明差异来自**检测口径**，而不是本馆的真实排版缺陷。
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
  const inter = (a, b) => {
    const w = Math.min(a.r, b.r) - Math.max(a.l, b.l);
    const h = Math.min(a.b, b.b) - Math.max(a.t, b.t);
    return w > 0 && h > 0 ? Math.round(w * h) : 0;
  };
  const vis = (el) => {
    const r = el.getBoundingClientRect();
    return { l: r.left, t: r.top, r: r.right, b: r.bottom };
  };
  // 内容盒：把溢出部分也算进去（scrollWidth/scrollHeight 口径）
  const scroll = (el) => {
    const r = el.getBoundingClientRect();
    return {
      l: r.left, t: r.top,
      r: r.left + Math.max(r.width, el.scrollWidth),
      b: r.top + Math.max(r.height, el.scrollHeight),
    };
  };

  const hits = [];
  for (const card of document.querySelectorAll('.exhibit-card')) {
    const s = card.querySelector('.card-summary');
    const c = card.querySelector('.card-creator');
    const f = card.querySelector('.fav-text');
    if (!s || !c) continue;
    const pairs = [
      ['summary×creator', s, c],
      ['summary×fav', s, f],
      ['creator×fav', c, f],
    ];
    for (const [label, a, b] of pairs) {
      if (!b) continue;
      hits.push({
        label,
        aText: a.textContent.trim().slice(0, 16),
        bText: b.textContent.trim().slice(0, 16),
        visible: inter(vis(a), vis(b)),
        scrollBased: inter(scroll(a), scroll(b)),
        aOverflow: { sw: a.scrollWidth, cw: a.clientWidth, sh: a.scrollHeight, ch: a.clientHeight },
        bOverflow: { sw: b.scrollWidth, cw: b.clientWidth, sh: b.scrollHeight, ch: b.clientHeight },
      });
    }
  }
  return hits;
});

const scrollHits = out.filter((h) => h.scrollBased > 0);
const visHits = out.filter((h) => h.visible > 0);

console.log(`▶ 口径对比 · ${WIDTH}px · 共 ${out.length} 个配对`);
console.log(`  A. 可见盒（getBoundingClientRect）有压盖的配对： ${visHits.length}`);
console.log(`  B. 内容盒（scrollWidth/scrollHeight）有压盖的配对： ${scrollHits.length}\n`);

if (scrollHits.length) {
  console.log('  B 口径下命中最大的 8 对（用来对 13 的数字）：');
  const sorted = [...scrollHits].sort((x, y) => y.scrollBased - x.scrollBased);
  for (const h of sorted.slice(0, 8)) {
    console.log(`   · ${h.label} 「${h.aText}」×「${h.bText}」 → ${h.scrollBased}px²`
      + `  [摘要 scrollH=${h.aOverflow.sh}/clientH=${h.aOverflow.ch}，作者 scrollW=${h.bOverflow.sw}/clientW=${h.bOverflow.cw}]`);
  }
  const areas = [...new Set(sorted.slice(0, 40).map((h) => h.scrollBased))].sort((a, b) => a - b);
  console.log(`\n  B 口径的压盖面积取值（去重后）： ${areas.slice(0, 14).join(', ')}`);
  console.log('  13 报出的数字：                   109, 127, 350, 368, 726, 1182');
}

await browser.close().catch(() => {});
