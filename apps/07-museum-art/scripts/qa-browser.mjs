/**
 * 回响电玩馆 — 预览页浏览器验收
 *
 * 用 Chromium 打开构建产物，逐节截图、收集控制台错误、检查关键元素与交互。
 * 运行：node scripts/qa-browser.mjs
 */

import { chromium } from 'playwright';
import { existsSync, mkdirSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { startServer } from './lib/server.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');
const DIST = path.join(ROOT, 'dist');
const SHOTS = path.join(ROOT, 'screenshots');

const checks = [];
const ok = (m) => { checks.push({ ok: true, m }); console.log(`  ✓ ${m}`); };
const bad = (m) => { checks.push({ ok: false, m }); console.log(`  ✗ ${m}`); };

async function main() {
  if (!existsSync(path.join(DIST, 'index.html'))) {
    console.error('缺少 dist/index.html，请先执行 npm run build');
    process.exit(1);
  }
  mkdirSync(SHOTS, { recursive: true });

  const { server, port } = await startServer(DIST, 0);
  const base = `http://127.0.0.1:${port}`;
  console.log(`· 验收服务 ${base}\n`);

  const browser = await chromium.launch({
    args: ['--enable-unsafe-swiftshader', '--use-gl=swiftshader'],
  });
  const page = await browser.newPage({
    viewport: { width: 1440, height: 1000 },
    deviceScaleFactor: 1,
  });

  const consoleErrors = [];
  page.on('console', (m) => { if (m.type() === 'error') consoleErrors.push(m.text()); });
  page.on('pageerror', (e) => consoleErrors.push(`PAGEERROR: ${e.message}`));
  const failedRequests = [];
  page.on('requestfailed', (r) => failedRequests.push(`${r.url()} — ${r.failure()?.errorText}`));
  const externalRequests = [];
  page.on('request', (r) => {
    const u = r.url();
    if (!u.startsWith(base) && !u.startsWith('data:') && !u.startsWith('blob:')) externalRequests.push(u);
  });

  console.log('· 加载页面');
  await page.goto(`${base}/index.html`, { waitUntil: 'load' });
  await page.waitForTimeout(2500);

  /* ---------- 结构检查 ---------- */
  console.log('\n· 结构与内容');
  const title = await page.title();
  if (title.includes('回响电玩馆')) ok(`页面标题：${title}`);
  else bad(`页面标题异常：${title}`);

  const counts = await page.evaluate(() => ({
    swatches: document.querySelectorAll('.swatch').length,
    fontCards: document.querySelectorAll('.font-card').length,
    icons: document.querySelectorAll('.icon-cell').length,
    posters: document.querySelectorAll('.poster-card').length,
    covers: document.querySelectorAll('.cover-card').length,
    cases: document.querySelectorAll('.case-card').length,
    models: document.querySelectorAll('.model-card').length,
    modelTabs: document.querySelectorAll('.model-tab').length,
    fallback: document.querySelectorAll('.fallback-card').length,
    stats: document.querySelectorAll('.stat').length,
  }));

  const expect = {
    swatches: 25, fontCards: 4, icons: 48, posters: 7, covers: 8,
    cases: 6, models: 6, modelTabs: 6, fallback: 5, stats: 6,
  };
  for (const [k, v] of Object.entries(expect)) {
    if (counts[k] === v) ok(`${k}  ${counts[k]} 项`);
    else bad(`${k} 期望 ${v}，实际 ${counts[k]}`);
  }

  /* ---------- 字体实际加载 ---------- */
  console.log('\n· 字体加载');
  const fontCheck = await page.evaluate(async () => {
    await document.fonts.ready;
    const loaded = [...document.fonts].filter((f) => f.status === 'loaded').map((f) => `${f.family} ${f.weight}`);
    return {
      loaded: [...new Set(loaded)],
      check: document.fonts.check('700 40px "Space Grotesk"'),
      checkCJK: document.fonts.check('700 40px "Noto Sans SC"'),
      checkMono: document.fonts.check('400 16px "Space Mono"'),
    };
  });
  if (fontCheck.check) ok('Space Grotesk 已加载');
  else bad('Space Grotesk 未加载');
  if (fontCheck.checkCJK) ok('Noto Sans SC 已加载');
  else bad('Noto Sans SC 未加载');
  if (fontCheck.checkMono) ok('Space Mono 已加载');
  else bad('Space Mono 未加载');

  /* ---------- 图片全部加载 ---------- */
  console.log('\n· 图像加载');
  const imgStat = await page.evaluate(() => {
    const imgs = [...document.querySelectorAll('img')];
    return {
      total: imgs.length,
      broken: imgs.filter((i) => i.complete && i.naturalWidth === 0).map((i) => i.getAttribute('src')),
    };
  });
  if (imgStat.broken.length === 0) ok(`${imgStat.total} 张图片全部加载成功`);
  else bad(`${imgStat.broken.length} 张图片加载失败：${imgStat.broken.slice(0, 5).join(', ')}`);

  /* ---------- 3D 查看器 ---------- */
  console.log('\n· 3D 查看器');
  await page.waitForTimeout(1500);
  const canvasState = await page.evaluate(() => {
    const c = document.getElementById('model-canvas');
    const gl = c && (c.getContext('webgl2') || c.getContext('webgl'));
    return { exists: !!c, w: c?.width, h: c?.height, hasGL: !!gl };
  });
  if (canvasState.exists && canvasState.w === 1440) ok(`3D 画布存在 ${canvasState.w}×${canvasState.h}`);
  else bad(`3D 画布异常：${JSON.stringify(canvasState)}`);

  const glbLoaded = await page.evaluate(() => {
    const c = document.getElementById('model-canvas');
    if (!c) return false;
    const gl = c.getContext('webgl2') || c.getContext('webgl');
    return !!gl;
  });
  if (glbLoaded) ok('WebGL 上下文可用（GLB 可交互加载）');
  else bad('WebGL 上下文不可用');

  /* ---------- 交互 ---------- */
  console.log('\n· 交互');
  await page.click('.model-tab:nth-child(3)');
  await page.waitForTimeout(1200);
  const t3 = await page.textContent('#viewer-title');
  if (t3 && t3.trim().length > 0) ok(`切换展品：标题变为「${t3.trim()}」`);
  else bad('切换展品后标题未更新');

  await page.click('#btn-spin');
  const spinLabel = await page.textContent('#btn-spin');
  if (spinLabel.includes('暂停')) ok('自动旋转开关响应正常');
  else bad(`自动旋转开关异常：${spinLabel}`);
  await page.click('#btn-spin');

  await page.click('.filter-chip:nth-child(2)');
  await page.waitForTimeout(300);
  const visible = await page.evaluate(() => {
    const cells = [...document.querySelectorAll('.icon-cell')];
    return cells.filter((c) => !c.classList.contains('is-hidden')).length;
  });
  if (visible > 0 && visible < 48) ok(`图标分类筛选生效：${visible} / 48 可见`);
  else bad(`图标筛选异常，可见 ${visible} / 48`);
  await page.click('.filter-chip:nth-child(1)');

  await page.click('.poster-card');
  await page.waitForTimeout(600);
  const lbOpen = await page.evaluate(() => !document.getElementById('lightbox').hidden);
  if (lbOpen) ok('灯箱可打开');
  else bad('灯箱未打开');
  await page.screenshot({ path: path.join(SHOTS, 'lightbox.png') });
  await page.keyboard.press('ArrowRight');
  await page.waitForTimeout(300);
  await page.keyboard.press('Escape');
  await page.waitForTimeout(300);
  const lbClosed = await page.evaluate(() => document.getElementById('lightbox').hidden);
  if (lbClosed) ok('灯箱键盘操作（→ / Esc）正常');
  else bad('灯箱未能关闭');

  /* ---------- 截图 ---------- */
  console.log('\n· 截图');
  const sections = [
    ['hero', '#top'],
    ['tokens', '#tokens'],
    ['fonts', '#fonts'],
    ['icons', '#icons'],
    ['posters', '#posters'],
    ['covers', '#covers'],
    ['cases', '#cases'],
    ['models', '#models'],
    ['fallback', '#fallback'],
  ];
  for (const [name, sel] of sections) {
    const target = await page.$(sel);
    if (!target) { bad(`未找到区块 ${sel}`); continue; }
    await target.scrollIntoViewIfNeeded();
    await page.waitForTimeout(450);
    await page.screenshot({ path: path.join(SHOTS, `section-${name}.png`) });
    ok(`区块截图 ${name}`);
  }
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(600);
  await page.screenshot({ path: path.join(SHOTS, 'full-page.png'), fullPage: true });
  ok('整页截图');

  /* ---------- 响应式 ---------- */
  console.log('\n· 响应式');
  for (const [label, w, h] of [['mobile', 390, 844], ['tablet', 820, 1180]]) {
    await page.setViewportSize({ width: w, height: h });
    await page.waitForTimeout(700);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    if (overflow <= 1) ok(`${label} (${w}px) 无横向溢出`);
    else bad(`${label} (${w}px) 横向溢出 ${overflow}px`);
    await page.screenshot({ path: path.join(SHOTS, `responsive-${label}.png`), fullPage: false });
  }
  await page.setViewportSize({ width: 1440, height: 1000 });

  /* ---------- 网络与控制台 ---------- */
  console.log('\n· 网络与控制台');
  if (externalRequests.length === 0) ok('零外部请求（无任何跨域资源）');
  else bad(`发现 ${externalRequests.length} 个外部请求：${externalRequests.slice(0, 5).join(', ')}`);

  if (failedRequests.length === 0) ok('无失败请求');
  else bad(`失败请求 ${failedRequests.length} 个：${failedRequests.slice(0, 5).join(' | ')}`);

  const realErrors = consoleErrors.filter((e) => !/favicon|Failed to load resource.*404/.test(e));
  if (realErrors.length === 0) ok('控制台无错误');
  else bad(`控制台错误 ${realErrors.length} 条：${realErrors.slice(0, 5).join(' | ')}`);

  await browser.close();
  server.close();

  const failed = checks.filter((c) => !c.ok);
  console.log('\n' + '='.repeat(58));
  console.log(`通过 ${checks.length - failed.length} / ${checks.length} 项`);
  console.log(`截图目录：${path.relative(ROOT, SHOTS)}（${readdirSync(SHOTS).length} 张）`);
  if (failed.length) {
    console.log('\n失败项：');
    failed.forEach((f) => console.log('  ✗ ' + f.m));
    process.exit(1);
  }
  console.log('\n✓ 浏览器验收全部通过。');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
