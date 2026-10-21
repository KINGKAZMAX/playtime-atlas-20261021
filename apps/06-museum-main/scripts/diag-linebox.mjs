#!/usr/bin/env node
/**
 * 一次性诊断：打印某个容器内各子元素的 client rects 片段、transform、opacity，
 * 用来定位「行内兄弟元素互相压盖」的确切原因。
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
const ROUTE = process.argv[4] || '#/timeline';
const SEL = process.argv[5] || '.footer-line';

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: WIDTH, height: WIDTH >= 1024 ? 900 : 844 } });
await page.goto(`${BASE}${ROUTE}`, { waitUntil: 'networkidle', timeout: 60000 });
await page.waitForTimeout(800);

const out = await page.evaluate((sel) => {
  const res = [];
  for (const box of document.querySelectorAll(sel)) {
    const pcs = getComputedStyle(box);
    res.push({
      kind: 'PARENT',
      sel,
      display: pcs.display,
      fontSize: pcs.fontSize,
      lineHeight: pcs.lineHeight,
      transform: pcs.transform,
      opacity: pcs.opacity,
      rect: (() => { const r = box.getBoundingClientRect(); return [Math.round(r.left), Math.round(r.top), Math.round(r.right), Math.round(r.bottom)]; })(),
      children: [...box.children].map((c) => {
        const cs = getComputedStyle(c);
        return {
          tag: c.tagName.toLowerCase(),
          cls: typeof c.className === 'string' ? c.className : '',
          text: (c.textContent || '').trim().slice(0, 24),
          display: cs.display,
          position: cs.position,
          transform: cs.transform,
          opacity: cs.opacity,
          margin: cs.margin,
          float: cs.float,
          rects: [...c.getClientRects()].map((r) => [Math.round(r.left), Math.round(r.top), Math.round(r.right), Math.round(r.bottom)]),
        };
      }),
    });
  }
  return res;
}, SEL);

console.log(JSON.stringify(out, null, 2));
await browser.close().catch(() => {});
