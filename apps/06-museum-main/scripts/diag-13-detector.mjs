#!/usr/bin/env node
/**
 * 一次性诊断：**直接调用 13-qa-curation 的 checkOverlaps**，跑本机的 06-museum-core。
 *
 * 为什么不用自己的探针：13 的检测器口径（Range.getClientRects + 逐层裁剪）
 * 与我自己的实现可能有细微差别。与其猜，不如**用他们那份代码**跑一遍，
 * 看它到底报不报——这是最硬的证据。
 *
 * 本脚本只**只读引用** 13 的 qa-harness，不修改它的任何文件。
 */
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const require = createRequire(import.meta.url);

const HARNESS = path.resolve(ROOT, '..', '13-qa-curation', 'qa-harness');
const { checkOverlaps } = await import(path.join(HARNESS, 'lib', 'checks.mjs'));

let chromium;
for (const candidate of [
  path.join(HARNESS, 'node_modules', 'playwright'),
  path.join(ROOT, '..', '07-museum-art', 'node_modules', 'playwright'),
  'playwright',
]) {
  try { chromium = require(candidate).chromium; break; } catch { /* 下一个 */ }
}
if (!chromium) { console.error('✗ 未找到 playwright'); process.exit(2); }

const BASE = (process.argv[2] || 'http://127.0.0.1:4333/playtime-atlas-20261021/works/06-museum-main/')
  .replace(/\/*$/, '/');
const ROUTE = process.argv[3] || '#/catalog';

const VIEWPORTS = [
  { key: 'desktop', width: 1440, height: 900 },
  { key: 'mobile', width: 390, height: 844 },
];

console.log(`▶ 用 13 的原始检测器跑本机 06-museum-core`);
console.log(`  目标： ${BASE}${ROUTE}\n`);

const browser = await chromium.launch();
let total = 0;

for (const vp of VIEWPORTS) {
  const ctx = await browser.newContext({
    viewport: { width: vp.width, height: vp.height },
    deviceScaleFactor: vp.key === 'mobile' ? 2 : 1,
  });
  const page = await ctx.newPage();
  await page.goto(`${BASE}${ROUTE}`, { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(900);

  const res = await checkOverlaps(page, { label: vp.key });
  const hits = res?.hits ?? [];
  total += hits.length;
  console.log(`  ▶ ${vp.key} ${vp.width}×${vp.height}`);
  console.log(`     命中 ${hits.length} 对（参与比对的候选元素 ${res?.candidateCount ?? '?'}）`);
  for (const h of hits) {
    console.log(`       · ${h.a}「${h.aText}」× ${h.b}「${h.bText}」压盖 ${h.overlapPct}% (${h.overlapPx})`);
  }
  await ctx.close();
}

await browser.close().catch(() => {});
console.log(`\n  合计命中： ${total} 对`);
process.exit(total ? 1 : 0);
