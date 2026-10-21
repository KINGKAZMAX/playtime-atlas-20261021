#!/usr/bin/env node
/**
 * 一次性探针：验证 SVG 表现属性（presentation attribute）里的 var() 是否真的生效。
 *
 * 背景：展签图形用 `fill="var(--era-accent)"` 写颜色。如果浏览器不解析
 * 表现属性中的 var()，这些强调色会静默退化成默认黑——肉眼很难发现。
 * 这条探针把「属性写法」和「style 写法」放在一起对比，取计算后的 fill 对比。
 */
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const { chromium } = require(path.join(__dirname, '..', '..', '07-museum-art', 'node_modules', 'playwright'));

const html = `<!doctype html><html><body style="margin:0">
<div id="host" style="--era-accent:#e0684a">
  <svg width="40" height="40" viewBox="0 0 40 40">
    <circle id="attrVar" cx="10" cy="20" r="8" fill="var(--era-accent)"/>
    <circle id="styleVar" cx="30" cy="20" r="8" style="fill:var(--era-accent)"/>
  </svg>
</div></body></html>`;

const browser = await chromium.launch();
const page = await browser.newPage();
await page.setContent(html);
const out = await page.evaluate(() => {
  const a = getComputedStyle(document.getElementById('attrVar')).fill;
  const s = getComputedStyle(document.getElementById('styleVar')).fill;
  return { attrVar: a, styleVar: s };
});
await browser.close().catch(() => { /* 本机负载高时关闭偶发失败，不影响结论 */ });

const ok = out.attrVar === 'rgb(224, 104, 74)';
console.log(`属性写法 fill="var(--era-accent)" → ${out.attrVar}`);
console.log(`style 写法 style="fill:var(--era-accent)" → ${out.styleVar}`);
console.log(ok ? '✓ 表现属性里的 var() 生效' : '✗ 表现属性里的 var() 不生效（必须改用 style 写法）');
process.exit(ok ? 0 : 1);
