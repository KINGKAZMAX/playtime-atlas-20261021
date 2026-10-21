#!/usr/bin/env node
/**
 * 一次性诊断：**完全复刻 13 的流水线**——用它自己的 buildTarget 编译本目录，
 * 用它自己的 startStaticServer 按它自己的 mount 路径起服务，
 * 再用它自己的 checkOverlaps 检测。
 *
 * 目的：确认 13 报的卡片压盖，在**它那套构建/服务/检测口径**下是否还能复现。
 *
 * 只读引用 13 的 qa-harness：它把本目录复制到临时目录再编译，不写本目录。
 */
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const require = createRequire(import.meta.url);

const HARNESS = path.resolve(ROOT, '..', '13-qa-curation', 'qa-harness');
const checks = await import(path.join(HARNESS, 'lib', 'checks.mjs'));
const { buildTarget } = await import(path.join(HARNESS, 'lib', 'build.mjs'));
const { startStaticServer } = await import(path.join(HARNESS, 'lib', 'static-server.mjs'));

let chromium;
for (const candidate of [
  path.join(HARNESS, 'node_modules', 'playwright'),
  path.join(ROOT, '..', '07-museum-art', 'node_modules', 'playwright'),
  'playwright',
]) {
  try { chromium = require(candidate).chromium; break; } catch { /* 下一个 */ }
}
if (!chromium) { console.error('✗ 未找到 playwright'); process.exit(2); }

const MOUNT = '/playtime-atlas-20261021/exhibits/06-museum-core/';
const ROUTE = process.argv[2] || '#/catalog';

console.log(`▶ 复刻 13 的流水线 · ${MOUNT}${ROUTE}`);
console.log('  1) 用 13 的 buildTarget 编译本目录（临时副本，不动本目录）');
const build = await buildTarget(ROOT);
if (!build.ok) {
  console.error(`  ✗ 13 的构建失败：\n${build.log}`);
  process.exit(2);
}
console.log(`     ✓ 构建成功：${build.cmd}`);
console.log(`     产物：${build.distDir}`);

console.log('  2) 用 13 的 startStaticServer 起服务');
const server = await startStaticServer({ root: build.distDir, mount: MOUNT });
const base = `http://127.0.0.1:${server.port}${MOUNT}`;
console.log(`     ✓ ${base}`);

console.log('  3) 用 13 的 checkOverlaps 检测');
const browser = await chromium.launch();
let total = 0;
for (const vp of [{ key: 'desktop', width: 1440, height: 900 }, { key: 'mobile', width: 390, height: 844 }]) {
  const ctx = await browser.newContext({
    viewport: { width: vp.width, height: vp.height },
    deviceScaleFactor: vp.key === 'mobile' ? 2 : 1,
  });
  const page = await ctx.newPage();
  await page.goto(`${base}${ROUTE}`, { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(900);
  const res = await checks.checkOverlaps(page, { label: vp.key });
  const hits = res?.hits ?? [];
  total += hits.length;
  console.log(`     ${vp.key} ${vp.width}×${vp.height} → 命中 ${hits.length} 对`);
  for (const h of hits) {
    console.log(`       · ${h.a}「${h.aText}」× ${h.b}「${h.bText}」压盖 ${h.overlapPct}% (${h.overlapPx})`);
  }
  await ctx.close();
}
await browser.close().catch(() => {});
await server.close?.();

console.log(`\n  合计命中： ${total} 对`);
process.exit(total ? 1 : 0);
