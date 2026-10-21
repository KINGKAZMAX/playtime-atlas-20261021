#!/usr/bin/env node
/**
 * 导览轴可点性探针
 *
 * 背景（2026-10-22 接入 assets/ds/components.css 之后）：
 *   16 的 .ds-rail 用了 `pointer-events: none`，并只给 .ds-rail__item 单独开回来。
 *   本馆的导览轴链接是 `<ul class="rail-list"><li><a …>`，**不带** .ds-rail__item，
 *   于是整条导览轴会变成「点击穿透」，链接全部点不动。
 *
 *   本脚本用「真实命中测试」判定：在链接中心点调用 document.elementFromPoint，
 *   看命中的到底是不是这条链接自己（穿透时命中的是它背后的主内容）。
 *
 * 用法：node scripts/probe-rail-click.mjs -- [baseUrl]
 * 退出码：0 = 导览轴链接均可命中；1 = 有链接点不到
 */
import path from 'node:path';
import { createRequire } from 'node:module';
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

const args = process.argv.slice(2);
const base = (args[0] && !args[0].startsWith('--') ? args[0] : 'http://127.0.0.1:4333/playtime-atlas-20261021/works/06-museum-main').replace(/\/*$/, '/');

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto(`${base}#/`, { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(1500);

const probe = await page.evaluate(() => {
  const rail = document.querySelector('.ds-rail');
  const railCS = rail ? getComputedStyle(rail) : null;
  const links = [...document.querySelectorAll('.ds-rail a, .rail-list a')];
  const results = links.slice(0, 12).map((a) => {
    const r = a.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;
    const hit = document.elementFromPoint(cx, cy);
    const reachable = hit === a || a.contains(hit) || (hit && hit.closest('a') === a);
    return {
      text: (a.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 18),
      cls: a.className || '(无类)',
      pointerEvents: getComputedStyle(a).pointerEvents,
      reachable,
      hitTag: hit ? `${hit.tagName.toLowerCase()}${hit.className ? '.' + String(hit.className).split(' ')[0] : ''}` : 'null',
    };
  });
  return { railPointerEvents: railCS ? railCS.pointerEvents : 'no-rail', results };
});

console.log('▶ 导览轴可点性探针');
console.log(`  .ds-rail 的 pointer-events = ${probe.railPointerEvents}`);
for (const r of probe.results) {
  console.log(`  ${r.reachable ? '✓' : '✗'} ${String(r.text).padEnd(20)} class=${r.cls.padEnd(18)} pe=${r.pointerEvents.padEnd(6)} 命中=${r.hitTag}`);
}

await browser.close();

const broken = probe.results.filter((r) => !r.reachable);
if (broken.length) {
  console.log(`\n✗ ${broken.length} 条导览轴链接点不到（被 pointer-events 穿透）`);
  process.exit(1);
}
console.log('\n✓ 导览轴链接全部可命中');
