#!/usr/bin/env node
/**
 * 移动端溢出诊断：找出在给定视口宽度下把页面撑宽的元素。
 * 用法：node scripts/overflow-probe.mjs [baseUrl] [width]
 */

import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const require = createRequire(import.meta.url);

// 同 acceptance.mjs：尾斜杠决定相对路径锚定目录，必须归一化
const BASE = (process.argv[2] || process.env.BASE_URL || 'http://127.0.0.1:4326')
  .replace(/\/*$/, '/');
const WIDTH = Number(process.argv[3] || 390);

let chromium;
for (const candidate of [
  path.join(ROOT, '..', '07-museum-art', 'node_modules', 'playwright'),
  path.join(ROOT, 'node_modules', 'playwright'),
  'playwright',
]) {
  try {
    ({ chromium } = require(candidate));
    break;
  } catch { /* next */ }
}
if (!chromium) {
  console.error('✗ 未找到 playwright');
  process.exit(2);
}

const ROUTES = ['/', '/#/catalog', '/#/timeline', '/#/era/e04', '/#/about', '/#/collection', '/#/hall'];

const browser = await chromium.launch();
const context = await browser.newContext({
  viewport: { width: WIDTH, height: 844 },
  isMobile: true,
  hasTouch: true,
});
const page = await context.newPage();

let bad = 0;

for (const route of ROUTES) {
  await page.goto(`${BASE}${route}`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1200);
  const report = await page.evaluate((vw) => {
    const doc = document.documentElement;
    const overflow = doc.scrollWidth - doc.clientWidth;
    const offenders = [];
    for (const el of document.querySelectorAll('body *')) {
      const r = el.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) continue;
      if (r.right > vw + 1 || r.left < -1) {
        // 只报告"最外层"的越界元素，避免子元素噪声
        const parent = el.parentElement;
        const pr = parent ? parent.getBoundingClientRect() : null;
        if (pr && pr.right > vw + 1) continue;
        offenders.push({
          tag: el.tagName.toLowerCase(),
          cls: (el.className && typeof el.className === 'string' ? el.className : '').slice(0, 60),
          id: el.id || '',
          left: Math.round(r.left),
          right: Math.round(r.right),
          width: Math.round(r.width),
        });
      }
    }
    return { overflow, offenders: offenders.slice(0, 12) };
  }, WIDTH);

  const mark = report.overflow > 1 ? '✗' : '✓';
  if (report.overflow > 1) bad += 1;
  console.log(`\n${mark} ${route} — 页面溢出 ${report.overflow}px`);
  for (const o of report.offenders) {
    console.log(`    · <${o.tag}${o.id ? `#${o.id}` : ''}${o.cls ? `.${o.cls.replace(/\s+/g, '.')}` : ''}> left=${o.left} right=${o.right} w=${o.width}`);
  }
}

await browser.close();
console.log(`\n${bad === 0 ? '✓ 所有路由无横向溢出' : `✗ ${bad} 个路由存在横向溢出`}`);
process.exit(bad === 0 ? 0 : 1);
