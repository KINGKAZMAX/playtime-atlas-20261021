#!/usr/bin/env node
/**
 * 一次性诊断：把 13 点名的几张卡片**按像素截下来**，肉眼确认摘要文字
 * 到底有没有压在作者/收藏上。
 */
import { createRequire } from 'node:module';
import { mkdir } from 'node:fs/promises';
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
const OUT = path.join(ROOT, 'screenshots', 'card-check');
await mkdir(OUT, { recursive: true });

// 13 点名的关键词
const TARGETS = ['Nolan Bushnell', 'Atari 前身 Syzygy', 'Taito（Akira', 'Ken Thompson', 'CSIRAC'];

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: WIDTH, height: WIDTH >= 1024 ? 900 : 844 }, deviceScaleFactor: 2 });
await page.goto(`${BASE}#/catalog`, { waitUntil: 'networkidle', timeout: 60000 });
await page.waitForSelector('.exhibit-card');

let n = 0;
for (const t of TARGETS) {
  const handle = await page.evaluateHandle((kw) => {
    for (const card of document.querySelectorAll('.exhibit-card')) {
      const txt = card.textContent || '';
      if (txt.includes(kw)) return card;
    }
    return null;
  }, t);
  const el = handle.asElement();
  if (!el) { console.log(`  · 「${t}」未找到对应卡片`); continue; }
  await el.scrollIntoViewIfNeeded();
  await page.waitForTimeout(150);
  const file = path.join(OUT, `card-${WIDTH}-${n}-${t.replace(/[^\w一-龥]/g, '_').slice(0, 12)}.png`);
  await el.screenshot({ path: file });
  console.log(`  ✓ 「${t}」→ ${path.relative(ROOT, file)}`);
  n += 1;
}

await browser.close().catch(() => {});
