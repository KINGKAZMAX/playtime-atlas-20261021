#!/usr/bin/env node
/**
 * 一次性诊断：复现 13 的两种可能的测法
 *   ① 逐字符输入（Playwright page.type，带延迟）到目录面板 #f-q
 *   ② 从首页顶栏 #top-q 逐字符输入后回车
 *   ③ 逐字符输入后立刻读数（不等去抖）
 *   ④ 输入后按 Enter
 * 目的：找出「211 → 211」到底在哪种测法下出现。
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
const NONE = '这个词一定不存在zzz';

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

const read = async () => page.evaluate(() => ({
  items: document.querySelectorAll('.exhibit-card, .exhibit-row').length,
  counter: document.querySelector('#results-count')?.textContent.trim() ?? '(无计数器)',
  q: document.querySelector('#f-q')?.value ?? null,
  topq: document.querySelector('#top-q')?.value ?? null,
  url: location.href.replace(location.origin, ''),
  active: document.activeElement?.id || document.activeElement?.tagName,
}));

console.log(`▶ 复现 13 的各种测法 · ${BASE}\n`);

// ① 目录面板，逐字符
await page.goto(`${BASE}#/catalog`, { waitUntil: 'networkidle', timeout: 60000 });
await page.waitForSelector('.exhibit-card');
console.log('① 目录面板 #f-q 逐字符输入（delay 60ms）');
await page.click('#f-q');
await page.type('#f-q', NONE, { delay: 60 });
console.log('   输入完立刻读：', JSON.stringify(await read()));
await page.waitForTimeout(600);
console.log('   等 600ms 后读：', JSON.stringify(await read()));

// ② 目录面板，逐字符 + 回车
console.log('\n② 目录面板 #f-q 逐字符后按 Enter');
await page.click('#f-q');
await page.type('#f-q', '掌机', { delay: 60 });
await page.press('#f-q', 'Enter');
await page.waitForTimeout(600);
console.log('   读：', JSON.stringify(await read()));

// ③ 首页顶栏，逐字符 + 回车
console.log('\n③ 从首页开始，顶栏 #top-q 逐字符后回车');
await page.goto(`${BASE}#/`, { waitUntil: 'networkidle', timeout: 60000 });
await page.waitForTimeout(400);
await page.click('#top-q');
await page.type('#top-q', NONE, { delay: 60 });
await page.press('#top-q', 'Enter');
await page.waitForTimeout(800);
console.log('   读：', JSON.stringify(await read()));

// ④ 首页顶栏，逐字符后不等回车
console.log('\n④ 首页顶栏 #top-q 逐字符后按 Enter，再等 1.5s');
await page.waitForTimeout(1500);
console.log('   读：', JSON.stringify(await read()));

// ⑤ 目录页顶部顶栏（#top-q）逐字符 + 回车
console.log('\n⑤ 目录页顶栏 #top-q 逐字符 + 回车');
await page.goto(`${BASE}#/catalog`, { waitUntil: 'networkidle', timeout: 60000 });
await page.waitForSelector('.exhibit-card');
await page.click('#top-q');
await page.type('#top-q', NONE, { delay: 60 });
await page.press('#top-q', 'Enter');
await page.waitForTimeout(800);
console.log('   读：', JSON.stringify(await read()));

// ⑥ 用 fill() 后立刻读（不等去抖）
console.log('\n⑥ 目录面板 #f-q 用 fill() 立刻读（不等 220ms 去抖）');
await page.goto(`${BASE}#/catalog`, { waitUntil: 'networkidle', timeout: 60000 });
await page.waitForSelector('.exhibit-card');
await page.fill('#f-q', NONE);
console.log('   fill 后立刻读：', JSON.stringify(await read()));
await page.waitForTimeout(600);
console.log('   等 600ms 后读：', JSON.stringify(await read()));

await browser.close().catch(() => {});
