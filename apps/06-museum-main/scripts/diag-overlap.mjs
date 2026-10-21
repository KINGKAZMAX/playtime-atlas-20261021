#!/usr/bin/env node
/**
 * 一次性诊断：把压盖对的**矩形坐标**打出来，用来判断是「真的压在一起」
 * 还是「两个各自定位的元素在视口坐标上碰巧重叠」（例如抽屉里的元素
 * 被 transform 移到屏外，但 getBoundingClientRect 仍会给出负坐标）。
 */
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const { chromium } = require(path.join(__dirname, '..', '..', '07-museum-art', 'node_modules', 'playwright'));

const BASE = (process.argv[2] || 'http://127.0.0.1:4333/playtime-atlas-20261021/works/06-museum-main/')
  .replace(/\/*$/, '/');
const WIDTH = Number(process.argv[3] || 390);
const ROUTE = process.argv[4] || '#/catalog';

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: WIDTH, height: WIDTH >= 1024 ? 900 : 844 } });
await page.goto(`${BASE}${ROUTE}`, { waitUntil: 'networkidle', timeout: 60000 });
await page.waitForTimeout(800);

const info = await page.evaluate((probeSel) => {
  const describe = (el) => {
    const cs = getComputedStyle(el);
    const r = el.getBoundingClientRect();
    const anc = [];
    let p = el.parentElement;
    for (let i = 0; p && i < 6; i += 1, p = p.parentElement) {
      const pcs = getComputedStyle(p);
      anc.push(`${p.tagName.toLowerCase()}.${(typeof p.className === 'string' ? p.className : '').trim().split(/\s+/).join('.')} [pos=${pcs.position} z=${pcs.zIndex} transform=${pcs.transform === 'none' ? 'none' : 'yes'}]`);
    }
    return {
      sel: `${el.tagName.toLowerCase()}.${(typeof el.className === 'string' ? el.className : '').trim().split(/\s+/).join('.')}`,
      text: (el.textContent || '').trim().slice(0, 30),
      rect: { l: Math.round(r.left), t: Math.round(r.top), r: Math.round(r.right), b: Math.round(r.bottom), w: Math.round(r.width), h: Math.round(r.height) },
      pos: cs.position, z: cs.zIndex, display: cs.display, visibility: cs.visibility, opacity: cs.opacity,
      overflow: cs.overflow, clip: cs.clipPath,
      ancestors: anc,
    };
  };

  const out = [];
  const sel = probeSel;
  if (sel) {
    for (const el of document.querySelectorAll(sel)) out.push(describe(el));
    return { mode: 'select', items: out };
  }

  // 找一对压盖并给出详情
  const texts = [];
  for (const el of document.querySelectorAll('body *')) {
    const own = [...el.childNodes].filter((n) => n.nodeType === 3).map((n) => n.textContent.trim()).join('');
    if (!own) continue;
    const cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden') continue;
    const r = el.getBoundingClientRect();
    if (r.width < 1 || r.height < 1) continue;
    texts.push({ el, own, rect: r });
  }
  const hits = [];
  for (let i = 0; i < texts.length; i += 1) {
    for (let j = i + 1; j < texts.length; j += 1) {
      const a = texts[i]; const b = texts[j];
      if (a.el.contains(b.el) || b.el.contains(a.el)) continue;
      const w = Math.min(a.rect.right, b.rect.right) - Math.max(a.rect.left, b.rect.left);
      const h = Math.min(a.rect.bottom, b.rect.bottom) - Math.max(a.rect.top, b.rect.top);
      if (w > 0 && h > 0) hits.push({ area: Math.round(w * h), a: describe(a.el), b: describe(b.el) });
    }
  }
  hits.sort((x, y) => y.area - x.area);
  return { mode: 'pairs', total: hits.length, top: hits.slice(0, 3) };
}, process.argv[5] || '');

console.log(JSON.stringify(info, null, 2));
await browser.close().catch(() => {});
