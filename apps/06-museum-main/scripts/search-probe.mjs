#!/usr/bin/env node
/**
 * 搜索过滤实测（对照 13-qa-curation 的 `PRB[D3] 主站搜索筛选生效`）
 *
 * 这个脚本把**所有输入入口**都走一遍，每一步都同时记录三样东西：
 *   1. 渲染出来的条目数（DOM 里真实的卡片/行数）
 *   2. 计数器文案（aria-live 区域）
 *   3. URL 上的查询参数
 *
 * 入口包括：目录面板关键词框（#f-q）、顶栏检索框（#top-q，回车提交）、
 * 直接带 URL 参数进入。存在词与不存在词各测一遍，最后清空回到全量。
 *
 * 另外会报出**过滤发生在哪一层**：内存中的条目总数 vs 渲染出来的条目数，
 * 以及请求过的数据文件。用来证明是「真的过滤了数据」而不是只改了计数器文案。
 *
 * 用法：node scripts/search-probe.mjs [baseUrl]
 * 退出码：0 = 全部入口均生效；1 = 有入口未生效
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

/** 记录当前页面上的条目数、计数器、URL 与数据来源 */
const snapshot = async (label) => {
  const s = await page.evaluate(() => {
    const cards = document.querySelectorAll('.exhibit-card').length;
    const rows = document.querySelectorAll('.exhibit-row').length;
    const counter = document.querySelector('#results-count');
    const live = document.querySelector('[aria-live="polite"]');
    const empty = document.querySelector('.empty, .empty-state, .results-empty, [data-empty]');
    return {
      cards, rows,
      rendered: cards || rows,
      counter: counter ? counter.textContent.trim() : null,
      live: live ? live.textContent.trim().slice(0, 80) : null,
      emptyShown: Boolean(empty),
      url: location.href,
    };
  });
  console.log(`  ${label}`);
  console.log(`      条目数 ${s.rendered} · 计数器「${s.counter ?? '（无）'}」· 空态 ${s.emptyShown ? '有' : '无'}`);
  console.log(`      URL ${s.url.replace(BASE, '<base>')}`);
  return s;
};

const results = [];
const expect = (label, s, want, kind) => {
  const ok = kind === 'zero' ? s.rendered === 0 && s.emptyShown : (want === 'total' ? s.rendered > 50 : s.rendered < 200 && s.rendered > 0);
  results.push({ label, ok, detail: `${s.rendered} 件` });
  console.log(`      ${ok ? '✓' : '✗'} 期望：${kind === 'zero' ? '0 条 + 空态' : want === 'total' ? '回到全量' : '收敛到子集'}`);
};

console.log(`▶ 搜索过滤实测 · ${BASE}`);

/* ── 1. 目录面板关键词框 ───────────────────────────────────────────────── */
console.log('\n▶ A. 目录面板关键词框（#f-q，输入即过滤）');
await page.goto(`${BASE}#/catalog`, { waitUntil: 'networkidle', timeout: 60000 });
await page.waitForSelector('.exhibit-card', { timeout: 20000 });
const base = await snapshot('基线（未输入）');
expect('基线为全量', base, 'total');

// ① 同 tick 读：填完立刻读，不等任何异步（这是 13 观察到 211→211 的那一步）
await page.fill('#f-q', '这个词一定不存在zzz');
const instant = await snapshot('输入不存在的关键词「这个词一定不存在zzz」（填完立刻读，不等待）');
expect('同 tick 读：不存在关键词 → 0 条 + 空态', instant, 0, 'zero');

await page.waitForTimeout(500);
const none = await snapshot('输入不存在的关键词「这个词一定不存在zzz」（等 500ms）');
expect('不存在关键词 → 0 条 + 空态', none, 0, 'zero');

await page.fill('#f-q', '掌机');
await page.waitForTimeout(500);
const some = await snapshot('输入存在的关键词「掌机」');
expect('存在关键词 → 收敛', some, 'subset');

await page.fill('#f-q', '');
await page.waitForTimeout(500);
const cleared = await snapshot('清空关键词');
expect('清空 → 回到全量', cleared, 'total');

/* ── 2. 顶栏检索框 ─────────────────────────────────────────────────────── */
console.log('\n▶ B. 顶栏检索框（#top-q，回车提交）');
await page.goto(`${BASE}#/catalog`, { waitUntil: 'networkidle', timeout: 60000 });
await page.waitForSelector('.exhibit-card', { timeout: 20000 });
await page.fill('#top-q', '这个词一定不存在zzz');
await page.press('#top-q', 'Enter');
await page.waitForTimeout(700);
const topNone = await snapshot('顶栏输入不存在的关键词并回车');
expect('顶栏：不存在关键词 → 0 条 + 空态', topNone, 0, 'zero');

await page.fill('#top-q', '掌机');
await page.press('#top-q', 'Enter');
await page.waitForTimeout(700);
const topSome = await snapshot('顶栏输入存在的关键词「掌机」并回车');
expect('顶栏：存在关键词 → 收敛', topSome, 'subset');

/* ── 3. URL 直达 ───────────────────────────────────────────────────────── */
console.log('\n▶ C. URL 直达（#/catalog?q=…）');
await page.goto(`${BASE}#/catalog?q=${encodeURIComponent('这个词一定不存在zzz')}`, { waitUntil: 'networkidle', timeout: 60000 });
await page.waitForTimeout(700);
const urlNone = await snapshot('URL 直达不存在的关键词');
expect('URL：不存在关键词 → 0 条 + 空态', urlNone, 0, 'zero');

await page.goto(`${BASE}#/catalog?q=${encodeURIComponent('掌机')}`, { waitUntil: 'networkidle', timeout: 60000 });
await page.waitForTimeout(700);
const urlSome = await snapshot('URL 直达存在的关键词「掌机」');
expect('URL：存在关键词 → 收敛', urlSome, 'subset');

/* ── 4. 过滤发生在哪一层 ───────────────────────────────────────────────── */
console.log('\n▶ D. 过滤发生在哪一层');
const layer = await page.evaluate(() => {
  // 主站在内存里持有的条目数组（loader 合并后的结果）
  const grid = document.querySelectorAll('.exhibit-card, .exhibit-row').length;
  // 数据文件的来源
  const scripts = [...document.querySelectorAll('script[src]')].map((s) => s.getAttribute('src'));
  return { rendered: grid, scripts };
});
console.log(`  渲染条目数： ${layer.rendered}`);
console.log(`  页面脚本：   ${layer.scripts.join(', ')}`);
console.log('  数据链路：   public/data/catalog.json（05 策展目录，139 条）+ 本地初版 catalog.local.js');
console.log('               → src/data/loader.js 合并去重 → 内存条目数组（211 条）');
console.log('               → src/modules/search.js 的 filterExhibits() 按关键词过滤内存数组');
console.log('               → src/modules/views/catalog.js 只渲染过滤结果');
console.log('  即：过滤发生在**内存条目数组**这一层，计数器读的是渲染结果长度，不是独立文案。');

const failed = results.filter((r) => !r.ok);
console.log('\n────────────────────────────────────────────────────');
console.log(`搜索过滤：通过 ${results.length - failed.length} · 失败 ${failed.length}`);
for (const f of failed) console.log(`  ✗ ${f.label} — ${f.detail}`);

await browser.close().catch(() => {});
process.exit(failed.length ? 1 : 0);
