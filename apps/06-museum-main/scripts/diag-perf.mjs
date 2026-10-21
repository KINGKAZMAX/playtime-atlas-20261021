#!/usr/bin/env node
/**
 * 一次性诊断：测一次「同步刷新」的真实耗时，
 * 用来决定能不能把 220ms 去抖去掉、改成输入即过滤。
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

const timings = await page.evaluate(() => {
  const form = document.querySelector('.filters-form');
  const input = document.querySelector('#f-q');
  const runs = [];
  for (const q of ['掌', '掌机', 'play', 'zzzzz', 'Atari', '']) {
    input.value = q;
    // submit 走的是**同步** refresh()：可以直接量到过滤 + 渲染的真实耗时
    const t0 = performance.now();
    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    const t1 = performance.now();
    runs.push({
      q,
      ms: +(t1 - t0).toFixed(2),
      items: document.querySelectorAll('.exhibit-card, .exhibit-row').length,
    });
  }
  return { runs };
});

console.log('▶ 同步刷新耗时（每次 input 事件）');
for (const r of timings.runs) console.log(`   q="${r.q}" → ${r.ms}ms（当时渲染 ${r.items} 条）`);


await browser.close().catch(() => {});
