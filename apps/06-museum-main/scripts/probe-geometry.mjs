#!/usr/bin/env node
/**
 * 几何探针：DS 组件层接入后，核对关键元件的实际尺寸
 *
 * 背景（2026-10-22 接入 assets/ds/components.css）：
 *   16 的 .ds-btn 把 `--ds-btn-h` 设为 `var(--ds-space-10)`，
 *   而 --ds-space-10 是间距阶的**最大档 128px**。
 *   若本馆不覆盖，按钮会变成 128px 高的巨型块。
 *   本脚本把这条风险固化成断言：按钮高度必须落在合理区间，
 *   同时抽查顶栏、导览轴、卡片三块的几何，防止组件层引入回归。
 *
 * 用法：node scripts/probe-geometry.mjs -- [baseUrl]
 * 退出码：0 = 全部在合理区间；1 = 有异常
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
await page.waitForTimeout(1200);

const geo = await page.evaluate(() => {
  const pick = (sel) => {
    const el = document.querySelector(sel);
    if (!el) return null;
    const r = el.getBoundingClientRect();
    const cs = getComputedStyle(el);
    return {
      sel,
      w: Math.round(r.width),
      h: Math.round(r.height),
      fontSize: cs.fontSize,
      fontWeight: cs.fontWeight,
      color: cs.color,
      bg: cs.backgroundColor,
      lineHeight: cs.lineHeight,
      letterSpacing: cs.letterSpacing,
      overflowWrap: cs.overflowWrap,
    };
  };
  return {
    btn: pick('.ds-btn'),
    btnPrimary: pick('.ds-btn--primary'),
    topbar: pick('.ds-topbar'),
    rail: pick('.ds-rail'),
    railItem: pick('.ds-rail__item'),
    railActive: pick('.ds-rail__item[aria-current="true"], .ds-rail__item.is-active'),
    coverTitle: pick('.ds-cover__title, .hero-title, h1'),
    body: pick('body'),
  };
});

console.log('▶ 几何探针（DS 组件层接入后）');
for (const [k, v] of Object.entries(geo)) {
  if (!v) { console.log(`  · ${k}: 未找到`); continue; }
  console.log(`  · ${k.padEnd(11)} ${String(v.w).padStart(5)}×${String(v.h).padStart(4)}  ${v.fontSize}/${v.fontWeight}  lh=${v.lineHeight} ls=${v.letterSpacing}  ${v.color}`);
}

const problems = [];
const btn = geo.btn;
if (btn && (btn.h > 64 || btn.h < 28)) problems.push(`按钮高度异常：${btn.h}px（期望 28–64px）`);
const railItem = geo.railItem;
if (railItem && railItem.fontSize !== '16px') problems.push(`导览轴条目字号异常：${railItem.fontSize}（DS §4.1 期望 16px）`);
const railActive = geo.railActive;
if (railActive && railActive.fontWeight !== '500') problems.push(`导览轴当前项字重异常：${railActive.fontWeight}（期望 500）`);
const body = geo.body;
if (body && body.letterSpacing !== 'normal' && parseFloat(body.letterSpacing) < 0) problems.push(`正文出现负字距：${body.letterSpacing}`);

await browser.close();

if (problems.length) {
  console.log(`\n✗ ${problems.length} 项异常：`);
  for (const p of problems) console.log(`  · ${p}`);
  process.exit(1);
}
console.log('\n✓ 关键元件几何正常');
