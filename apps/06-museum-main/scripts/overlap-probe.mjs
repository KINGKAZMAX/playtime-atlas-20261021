#!/usr/bin/env node
/**
 * D1 文字压盖探针（对照 13-qa-curation 的 D1 检测口径）
 *
 * 口径：**只报「文字」互相压盖**，并给出压盖面积（px²）。
 * 做法：
 *   1. 收集所有**直接含非空文本节点**的元素（只含子元素的容器不算），
 *      排除不可见（display:none / visibility:hidden / 零面积）；
 *   2. 取两两的 client rect 求交集面积；
 *   3. 交集面积 > 0 即算压盖，按面积降序报出。
 *
 * 为什么自己写而不复用 13 的脚本：13 的检测器在本目录之外（只读边界），
 * 这里需要一份可在本目录复跑、能直接对比改前改后的实现。
 *
 * 用法：
 *   node scripts/overlap-probe.mjs [baseUrl] [width] [route]
 *   node scripts/overlap-probe.mjs http://127.0.0.1:4333/... 1440 "#/catalog"
 * 退出码：0 = 无压盖；1 = 有压盖
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
const ROUTE = process.argv[4] || '#/catalog';

const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: { width: WIDTH, height: WIDTH >= 1024 ? 900 : 844 },
  deviceScaleFactor: 1,
});
await page.goto(`${BASE}${ROUTE}`, { waitUntil: 'networkidle', timeout: 60000 });
await page.waitForTimeout(800);

const findings = await page.evaluate(() => {
  /*
   * 关键：必须算**可见矩形**，不能直接用 getBoundingClientRect。
   *
   * 元素在 `overflow:auto` 的滚动容器里被滚出可视区时，浏览器**仍然**返回它
   * 完整的布局矩形——那个矩形可以远远超出容器的裁剪框。若直接拿它求交集，
   * 就会把「被裁掉了、根本没画出来」的文字判成压盖。
   * 本馆的平台筛选就是个典型：189 个选项装在 160px 高的滚动盒里，
   * 不裁剪就会报出几百对「假压盖」。
   *
   * 所以这里沿祖先链把每一层的 overflow 裁剪框依次求交，得到真实可见矩形。
   */
  const visibleRect = (el) => {
    let r = el.getBoundingClientRect();
    let box = { left: r.left, top: r.top, right: r.right, bottom: r.bottom };
    let p = el.parentElement;
    while (p && p !== document.body) {
      const cs = getComputedStyle(p);
      if (cs.overflow !== 'visible' || cs.overflowX !== 'visible' || cs.overflowY !== 'visible') {
        const pr = p.getBoundingClientRect();
        box = {
          left: Math.max(box.left, pr.left),
          top: Math.max(box.top, pr.top),
          right: Math.min(box.right, pr.right),
          bottom: Math.min(box.bottom, pr.bottom),
        };
      }
      p = p.parentElement;
    }
    return box;
  };

  // 1) 含直接文本节点、且**真的被画出来**的元素
  const texts = [];
  const all = document.querySelectorAll('body *');
  for (const el of all) {
    const own = [...el.childNodes]
      .filter((n) => n.nodeType === 3)
      .map((n) => n.textContent.trim())
      .join('');
    if (!own) continue;
    const cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden' || Number(cs.opacity) === 0) continue;
    /*
     * checkVisibility 是「有没有被画出来」的权威答案。
     * 闭合的 <details> 在 Chromium 里用 content-visibility 隐藏内容：
     * **布局盒子还在**（getBoundingClientRect 照常返回），但一个像素都没画。
     * 不看这个就会把折叠起来的平台筛选整片判成压盖。
     */
    if (typeof el.checkVisibility === 'function'
      && !el.checkVisibility({ checkOpacity: true, checkVisibilityCSS: true, contentVisibilityAuto: true })) continue;
    const raw = el.getBoundingClientRect();
    if (raw.width < 1 || raw.height < 1) continue;
    const box = visibleRect(el);
    // 被完全裁掉的元素不参与比对
    if (box.right - box.left < 1 || box.bottom - box.top < 1) continue;
    /*
     * 逐行片段，而不是外接矩形。
     * 行内元素换行后，外接矩形会把下一行的内容也框进来 —— 页脚的
     * `strong` 与换行的 `span.muted` 会被误判成压盖 94%。
     */
    const frags = [];
    for (const r of el.getClientRects()) {
      if (r.width < 1 || r.height < 1) continue;
      const f = {
        left: Math.max(r.left, box.left), top: Math.max(r.top, box.top),
        right: Math.min(r.right, box.right), bottom: Math.min(r.bottom, box.bottom),
      };
      if (f.right - f.left > 0.5 && f.bottom - f.top > 0.5) frags.push(f);
    }
    if (!frags.length) continue;
    texts.push({ el, own: own.slice(0, 40), rect: box, frags });
  }

  // 2) 两两求交集（逐片段求和）
  const hits = [];
  const areaOf = (A, B) => {
    let area = 0;
    for (const a of A) {
      for (const b of B) {
        const w = Math.min(a.right, b.right) - Math.max(a.left, b.left);
        const h = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top);
        if (w > 0 && h > 0) area += w * h;
      }
    }
    return area;
  };
  for (let i = 0; i < texts.length; i += 1) {
    for (let j = i + 1; j < texts.length; j += 1) {
      const a = texts[i];
      const b = texts[j];
      // 祖先/后代关系不算「互相压盖」
      if (a.el.contains(b.el) || b.el.contains(a.el)) continue;
      const area = Math.round(areaOf(a.frags, b.frags));
      if (area > 4) {
        const box = (t) => `${t.el.tagName.toLowerCase()}${t.el.className && typeof t.el.className === 'string' ? '.' + t.el.className.trim().split(/\s+/).join('.') : ''}`;
        hits.push({
          area,
          pct: Math.round((area / Math.min(
            areaOf(a.frags, a.frags), areaOf(b.frags, b.frags),
          )) * 100),
          a: box(a), aText: a.own,
          b: box(b), bText: b.own,
        });
      }
    }
  }
  hits.sort((x, y) => y.area - x.area);
  return { hits: hits.slice(0, 30), total: hits.length, textNodes: texts.length };
});

console.log(`▶ D1 文字压盖探针 · ${WIDTH}px · ${ROUTE}`);
console.log(`  目标： ${BASE}${ROUTE}`);
console.log(`  参与比对的有文字元素： ${findings.textNodes}`);

if (!findings.total) {
  console.log('\n✓ 未检出任何文字互相压盖');
  await browser.close().catch(() => {});
  process.exit(0);
}

console.log(`\n✗ 检出 ${findings.total} 对文字压盖（按面积降序，前 ${findings.hits.length} 对）：`);
for (const h of findings.hits) {
  console.log(`  · ${h.a}「${h.aText}」× ${h.b}「${h.bText}」 — ${h.pct}% / ${h.area}px²`);
}
await browser.close().catch(() => {});
process.exit(1);
