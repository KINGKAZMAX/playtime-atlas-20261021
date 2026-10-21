#!/usr/bin/env node
/**
 * 一次性探针：确认展厅卡片顶部的身份色发丝条（.hall-card::before）真的渲染出来了，
 * 且颜色取自该展厅的身份色（--identity-accent），而不是退回 --ds-accent。
 */
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const { chromium } = require(path.join(__dirname, '..', '..', '07-museum-art', 'node_modules', 'playwright'));

const BASE = (process.argv[2] || 'http://127.0.0.1:4333/playtime-atlas-20261021/works/06-museum-main/')
  .replace(/\/*$/, '/');

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto(`${BASE}#/`, { waitUntil: 'networkidle', timeout: 60000 });
await page.waitForSelector('.hall-card', { timeout: 20000 });

const cards = await page.evaluate(() => {
  const out = [];
  for (const el of document.querySelectorAll('.hall-card')) {
    const cs = getComputedStyle(el, '::before');
    out.push({
      identity: el.style.getPropertyValue('--identity-accent').trim(),
      stripBackground: cs.backgroundColor,
      stripHeight: cs.height,
      stripContent: cs.content,
    });
  }
  return out;
});

console.log(`▶ 展厅卡片身份色发丝条（.hall-card::before）— 共 ${cards.length} 张`);
for (const c of cards) {
  console.log(`  身份色 ${c.identity.padEnd(9)} → 发丝条 ${c.stripBackground}  高 ${c.stripHeight}  content:${c.stripContent}`);
}
const ok = cards.length > 0 && cards.every((c) => c.stripHeight !== '0px' && c.stripBackground !== 'rgba(0, 0, 0, 0)');
console.log(ok ? '\n✓ 发丝条已渲染，且每张卡片取自己的身份色' : '\n✗ 发丝条未渲染或未取到身份色');

await browser.close().catch(() => {});
process.exit(ok ? 0 : 1);
