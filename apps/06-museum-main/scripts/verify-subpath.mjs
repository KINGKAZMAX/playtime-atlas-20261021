#!/usr/bin/env node
/**
 * 子路径部署自验 · 06-museum-core
 *
 * 针对 QA 提出的三项问题做定点回归：
 *   1. 字体样式表在子路径下可访问（200）且无控制台 404
 *   2. 390×844 无横向溢出，nav-toggle-text 不被压成逐字换行
 *   3. 搜索/筛选真的改变条目数与计数；不存在的关键词显示空态
 *   4. 1440×900 桌面布局未被改坏
 *
 * 用法：node scripts/verify-subpath.mjs [baseUrl]
 *   baseUrl 需指向以 /playtime-atlas-20261021/exhibits/06-museum-core/ 结尾的地址
 */

import { createRequire } from 'node:module';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const SHOTS = path.join(ROOT, 'screenshots', 'subpath');
const BASE = (process.argv[2] || process.env.SUBPATH_URL
  || 'http://127.0.0.1:4333/playtime-atlas-20261021/works/06-museum-main/').replace(/\/*$/, '/');

const require = createRequire(import.meta.url);
let chromium;
for (const candidate of [
  path.join(ROOT, '..', '07-museum-art', 'node_modules', 'playwright'),
  path.join(ROOT, 'node_modules', 'playwright'),
  'playwright',
]) {
  try {
    ({ chromium } = require(candidate));
    break;
  } catch { /* next */ }
}
if (!chromium) {
  console.error('✗ 未找到 playwright');
  process.exit(2);
}

const results = [];
function check(name, ok, detail = '') {
  results.push({ name, ok: Boolean(ok), detail });
  console.log(`  ${ok ? '✓' : '✗'} ${name}${detail ? ` — ${detail}` : ''}`);
}

const console404 = [];
const netErrors = [];

const browser = await chromium.launch();

/* ══════════ A. 桌面 1440×900 ══════════ */
console.log(`\n▶ A. 桌面 1440×900 · ${BASE}`);
const deskCtx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const desk = await deskCtx.newPage();
desk.on('console', (m) => {
  if (m.type() === 'error') console404.push(m.text().slice(0, 200));
});
desk.on('pageerror', (e) => console404.push(`pageerror: ${String(e).slice(0, 200)}`));
desk.on('response', (r) => {
  if (r.status() >= 400) netErrors.push(`${r.url()} → HTTP ${r.status()}`);
});
desk.on('requestfailed', (r) => netErrors.push(`${r.url()} → ${r.failure()?.errorText}`));

await desk.goto(BASE, { waitUntil: 'networkidle' });
await desk.waitForTimeout(1200);

check('页面标题正确', (await desk.title()).includes('回响电玩馆'), await desk.title());
check('主标题渲染', await desk.locator('.hero-title').isVisible());
const deskOverflow = await desk.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
check('桌面无横向溢出', deskOverflow <= 1, `溢出 ${deskOverflow}px`);
const railCount = await desk.locator('.rail-list [data-era-link]').count();
check('桌面侧栏年代导航完整', railCount === 10, `${railCount} 个`);

// 字体样式表与字体文件
// 权威位置：assets/ds/fonts/（16-design-system 接入，fonts.css 与 woff2 同目录同路径）
// 历史路径：art/assets/fonts/fonts.css（兼容 shim，MIGRATION-NOTES §6「发布前必查」仍会 curl 它）
const fontChecks = await desk.evaluate(async () => {
  const out = [];
  for (const url of [
    './assets/ds/fonts/fonts.css',
    './assets/ds/fonts/inter-latin.woff2',
    './assets/ds/fonts/space-grotesk-latin.woff2',
    './assets/ds/fonts/space-mono-regular.woff2',
    './assets/ds/fonts/space-mono-bold.woff2',
    './assets/ds/fonts/noto-sans-sc-subset.woff2',
    './assets/ds/components.css',
    './assets/ds/tokens.css',
    './art/assets/fonts/fonts.css',
  ]) {
    try {
      const res = await fetch(url, { method: 'GET' });
      out.push({ url, status: res.status, bytes: Number(res.headers.get('content-length') ?? 0) });
    } catch (e) {
      out.push({ url, status: 0, bytes: 0, error: String(e) });
    }
  }
  return out;
});
for (const f of fontChecks) {
  check(`字体资源 ${f.url.replace('./assets/ds/fonts/', 'ds/').replace('./assets/ds/', 'ds/').replace('./art/assets/fonts/', '历史路径 ')} 返回 200`, f.status === 200, `HTTP ${f.status}`);
}

// 实际生效的字体族
const appliedFonts = await desk.evaluate(() => {
  const cs = getComputedStyle(document.documentElement);
  const probe = document.createElement('span');
  probe.textContent = '字体探针';
  probe.style.cssText = 'position:absolute;visibility:hidden;font-size:40px';
  document.body.appendChild(probe);
  const read = (varName) => {
    probe.style.fontFamily = cs.getPropertyValue(varName);
    return getComputedStyle(probe).fontFamily;
  };
  const res = { display: read('--font-display'), text: read('--font-text'), mono: read('--font-mono') };
  probe.remove();
  return res;
});
check('标题字体族为 Space Grotesk', /Space Grotesk/.test(appliedFonts.display), appliedFonts.display);
check('正文字体族含 Inter', /Inter/.test(appliedFonts.text), appliedFonts.text);
check('等宽字体族为 Space Mono', /Space Mono/.test(appliedFonts.mono), appliedFonts.mono);

// 字体是否真的被加载并可用（不是只写在 font-family 里）
const fontLoaded = await desk.evaluate(async () => {
  await document.fonts.ready;
  const families = ['Space Grotesk', 'Inter', 'Space Mono', 'Noto Sans SC'];
  return families.map((f) => ({ family: f, loaded: document.fonts.check(`16px "${f}"`) }));
});
for (const f of fontLoaded) {
  check(`webfont ${f.family} 已实际加载`, f.loaded, f.loaded ? '可用' : '未加载');
}

await desk.screenshot({ path: path.join(SHOTS, 'A-desktop-home.png') });

/* ══════════ B. 检索与筛选 ══════════ */
console.log('\n▶ B. 检索与筛选');
await desk.goto(`${BASE}#/catalog`, { waitUntil: 'networkidle' });
await desk.waitForTimeout(700);
const totalText = await desk.locator('#results-count').textContent();
const total = Number((totalText.match(/共 (\d+)/) ?? [])[1] ?? 0);
check('目录加载出馆藏总数', total > 50, totalText.trim());

// 存在的关键词 → 收敛
await desk.locator('#f-q').fill('掌机');
await desk.waitForTimeout(800);
const hitText = await desk.locator('#results-count').textContent();
const hit = Number((hitText.match(/共 (\d+)/) ?? [])[1] ?? 0);
check('存在的关键词使结果收敛', hit > 0 && hit < total, `${hit} / ${total}`);
const urlHit = desk.url();
check('关键词写入 URL', urlHit.includes('q='), urlHit.split('#')[1] ?? urlHit);
await desk.screenshot({ path: path.join(SHOTS, 'B-search-hit.png') });

// 不存在的关键词 → 0 条 + 空态
await desk.locator('#f-q').fill('这个词一定不存在zzz');
await desk.waitForTimeout(800);
const missText = await desk.locator('#results-count').textContent();
const miss = Number((missText.match(/共 (\d+)/) ?? [])[1] ?? 0);
check('不存在的关键词归零', miss === 0, missText.trim());
check('空态提示出现', await desk.locator('.empty').count() === 1);
await desk.screenshot({ path: path.join(SHOTS, 'B-search-empty.png') });

// 清空恢复
await desk.locator('#f-q').fill('');
await desk.waitForTimeout(700);
const backText = await desk.locator('#results-count').textContent();
check('清空关键词恢复全量', Number((backText.match(/共 (\d+)/) ?? [])[1] ?? 0) === total, backText.trim());

// URL 直达检索（子路径 + 查询串）
await desk.goto(`${BASE}#/catalog?q=${encodeURIComponent('掌机')}`, { waitUntil: 'networkidle' });
await desk.waitForTimeout(800);
const deepText = await desk.locator('#results-count').textContent();
const deep = Number((deepText.match(/共 (\d+)/) ?? [])[1] ?? 0);
check('URL 直达关键词同样生效', deep > 0 && deep < total, `${deep} / ${total}`);

/* ══════════ C. 移动端 390×844 ══════════ */
console.log('\n▶ C. 移动端 390×844');
const mobCtx = await browser.newContext({
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 2,
  isMobile: true,
  hasTouch: true,
});
const mob = await mobCtx.newPage();
mob.on('console', (m) => {
  if (m.type() === 'error') console404.push(`[mobile] ${m.text().slice(0, 200)}`);
});
mob.on('response', (r) => {
  if (r.status() >= 400) netErrors.push(`[mobile] ${r.url()} → HTTP ${r.status()}`);
});

const routes = ['#/', '#/catalog', '#/timeline', '#/era/e04', '#/about', '#/collection', '#/hall'];
for (const route of routes) {
  await mob.goto(`${BASE}${route}`, { waitUntil: 'domcontentloaded' });
  await mob.waitForTimeout(1100);
  const o = await mob.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  check(`移动端 ${route} 无横向溢出`, o <= 1, `溢出 ${o}px`);
}

// 导航控件显示正常
await mob.goto(`${BASE}#/`, { waitUntil: 'networkidle' });
await mob.waitForTimeout(900);
const toggle = await mob.evaluate(() => {
  const el = document.querySelector('.nav-toggle-text');
  if (!el) return null;
  const r = el.getBoundingClientRect();
  return { w: Math.round(r.width), h: Math.round(r.height), text: el.textContent.trim() };
});
check('nav-toggle-text 存在', toggle !== null);
check('nav-toggle-text 宽度 > 40px（未被压成逐字换行）', (toggle?.w ?? 0) > 40, toggle ? `${toggle.w}×${toggle.h} "${toggle.text}"` : '缺失');
check('nav-toggle-text 高度正常（单行）', (toggle?.h ?? 0) >= 14 && (toggle?.h ?? 99) < 40, toggle ? `${toggle.h}px` : '');
check('导航控件整体可见', await mob.locator('#nav-toggle').isVisible());
await mob.screenshot({ path: path.join(SHOTS, 'C-mobile-home.png') });

// 抽屉可开合
await mob.locator('#nav-toggle').click();
await mob.waitForTimeout(500);
check('移动端抽屉可打开', await mob.locator('body.rail-open').count() === 1);
await mob.screenshot({ path: path.join(SHOTS, 'C-mobile-rail.png') });
await mob.keyboard.press('Escape');
await mob.waitForTimeout(400);
check('Esc 可关闭抽屉', await mob.locator('body.rail-open').count() === 0);

// 移动端目录与检索
await mob.goto(`${BASE}#/catalog`, { waitUntil: 'networkidle' });
await mob.waitForTimeout(800);
const mTotal = await mob.locator('#results-count').textContent();
check('移动端目录加载', Number((mTotal.match(/共 (\d+)/) ?? [])[1] ?? 0) > 50, mTotal.trim());
await mob.locator('#f-q').fill('掌机');
await mob.waitForTimeout(800);
const mFiltered = await mob.locator('#results-count').textContent();
check('移动端检索生效', Number((mFiltered.match(/共 (\d+)/) ?? [])[1] ?? 0) > 0
  && Number((mFiltered.match(/共 (\d+)/) ?? [])[1] ?? 0) < Number((mTotal.match(/共 (\d+)/) ?? [])[1] ?? 0),
  mFiltered.trim());
await mob.screenshot({ path: path.join(SHOTS, 'C-mobile-catalog.png') });

/* ══════════ D. 控制台与网络 ══════════ */
console.log('\n▶ D. 控制台与网络');
const real404 = netErrors.filter((u) => !/favicon/.test(u));
check('无 4xx/5xx 资源请求', real404.length === 0, real404.slice(0, 5).join(' | '));
check('无控制台错误', console404.length === 0, console404.slice(0, 5).join(' | '));

await deskCtx.close();
await mobCtx.close();
await browser.close();

/* ══════════ 汇总 ══════════ */
const failed = results.filter((r) => !r.ok);
console.log('\n' + '─'.repeat(52));
console.log(`子路径自验：通过 ${results.length - failed.length} / ${results.length}`);
if (failed.length) {
  console.log('未通过：');
  failed.forEach((f) => console.log(`  · ${f.name} ${f.detail}`));
}

await mkdir(SHOTS, { recursive: true });
const md = [
  '# 子路径部署自验 · 06-museum-core',
  '',
  `> 目标地址：\`${BASE}\``,
  `> 结果：通过 ${results.length - failed.length} / ${results.length}`,
  '',
  '| 断言 | 结果 | 备注 |',
  '| --- | --- | --- |',
  ...results.map((r) => `| ${r.name} | ${r.ok ? '✅' : '❌'} | ${r.detail || ''} |`),
  '',
].join('\n');
await writeFile(path.join(ROOT, 'SUBPATH-VERIFY.md'), md, 'utf8');
console.log('✓ 写入 SUBPATH-VERIFY.md，截图见 screenshots/subpath/');

process.exit(failed.length ? 1 : 0);
