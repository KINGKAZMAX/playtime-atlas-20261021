#!/usr/bin/env node
/**
 * 冒烟测试 —— 织造车间调度台 · LOOMDECK
 * ------------------------------------------------------------------
 * 用真实浏览器（Chromium / Playwright）跑一遍核心操作链路：
 * 加载 → 下单 → 异常输入 → 派工 → 暂停/继续 → 节奏切换 → 重置/撤销 → 存档恢复 → 键盘。
 * 同时产出交付截图与 qa/report.json。
 *
 * 依赖：playwright-core（devDependency）+ 本机已安装的 Chromium。
 *   npx playwright install chromium     # 若提示缺少浏览器时执行
 *
 * 只起本地临时服务器（端口由系统分配），跑完即关，不留常驻进程。
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright-core';
import { startServer } from './serve.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const DIST = path.join(ROOT, 'dist');
const SHOTS = path.join(ROOT, 'screenshots');
const REPORT = path.join(ROOT, 'qa', 'report.json');

if (!fs.existsSync(path.join(DIST, 'index.html'))) {
  console.error('[qa] 未找到 dist/index.html，请先执行：npm run build');
  process.exit(1);
}

const results = [];
const ok = (name, detail, extra = {}) => results.push({ name, status: 'pass', detail, ...extra });
const bad = (name, detail, extra = {}) => results.push({ name, status: 'fail', detail, ...extra });

const server = await startServer({ root: DIST, port: 0 });
console.log(`[qa] 临时服务器：${server.url}`);

let browser;
try {
  browser = await chromium.launch({ channel: 'chromium', args: ['--no-sandbox'] });
} catch (err) {
  console.error('[qa] 无法启动 Chromium：', err?.message ?? err);
  console.error('[qa] 若提示缺少浏览器，请先执行：npx playwright install chromium');
  await server.close();
  process.exit(1);
}

const external = [];
const consoleErrors = [];

try {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  page.on('request', (r) => {
    if (!r.url().startsWith(server.url) && !r.url().startsWith('data:')) external.push(r.url());
  });
  page.on('console', (m) => { if (m.type() === 'error') consoleErrors.push(m.text()); });
  page.on('pageerror', (e) => consoleErrors.push(`uncaught: ${e.message}`));

  await page.goto(server.url, { waitUntil: 'load' });
  await page.waitForTimeout(1500);

  /* ── 1. 首屏渲染 ── */
  const dom = await page.evaluate(() => ({
    looms: document.querySelectorAll('.loom').length,
    orders: document.querySelectorAll('.order-card').length,
    readouts: document.querySelectorAll('.readout').length,
    logRows: document.querySelectorAll('.log-row').length,
    chartPaths: document.querySelectorAll('#telemetry-chart path').length,
    shift: window.__loomdeck?.state,
  }));
  if (dom.looms === 12 && dom.readouts >= 8 && dom.logRows > 0 && dom.chartPaths >= 2) {
    ok('首屏渲染', `12 台机台 / ${dom.orders} 张订单 / ${dom.readouts} 项读数 / ${dom.logRows} 条日志 / ${dom.chartPaths} 条图表路径，state=${dom.shift}`);
  } else {
    bad('首屏渲染', JSON.stringify(dom));
  }

  /* ── 2. 字体真的加载了吗 ──
   * 字族栈按 DESIGN-SPEC §2.5 硬性口径排序：系统 CJK 栈在前、自托管
   * Noto Sans SC 子集在后（离线兜底）。因此在装有系统中文字体的机器上，
   * 汉字恒走系统黑体，子集**不会被用到**，浏览器也就不会下载它
   * （document.fonts 中状态为 unloaded —— 这是正确行为，不是缺陷）。
   * 故此处分两层断言：
   *   a) 拉丁族（实际渲染用到）必须 loaded；
   *   b) CJK 兜底族必须「已注册 + 强制加载成功」，证明系统栈不可用时仍能兜底。 */
  const fonts = await page.evaluate(async () => {
    await document.fonts.ready;
    const before = [...document.fonts].map((f) => `${f.family}:${f.status}`);
    // 强制触发兜底子集的下载（unicode-range 不限，强制拉取本地 woff2）
    let fallback = 'missing';
    try {
      const loaded = await document.fonts.load('400 16px "Noto Sans SC"', '织造车间调度台');
      fallback = loaded.length ? loaded.map((f) => `${f.family}:${f.status}`).join(',') : 'not-found';
    } catch (e) {
      fallback = `error: ${e.message}`;
    }
    await document.fonts.ready;
    const after = [...document.fonts].map((f) => `${f.family}:${f.status}`);
    return { before, fallback, after };
  });
  const latinUsed = fonts.before.filter((f) => /Space Grotesk|Inter|Space Mono/.test(f));
  const latinOk = latinUsed.length >= 4 && latinUsed.every((f) => f.endsWith(':loaded'));
  const cjkRegistered = fonts.after.some((f) => f.startsWith('Noto Sans SC:'));
  const cjkFallbackOk = /Noto Sans SC:loaded/.test(fonts.fallback);
  if (latinOk && cjkRegistered && cjkFallbackOk) {
    ok('本地字体加载', `拉丁族 ${latinUsed.length} 项已加载；CJK 兜底子集已注册并可强制加载（${fonts.fallback}）——汉字按 §2.5 走系统黑体，子集仅作离线兜底`);
  } else {
    bad('本地字体加载', `拉丁 ${latinUsed.join(',')} | CJK 注册=${cjkRegistered} | 兜底=${fonts.fallback}`);
  }

  /* ── 2b. 先关掉自动续派，后续手动派工才可确定复现 ── */
  await page.click('#btn-auto-dispatch');
  await page.waitForTimeout(200);
  const autoOffState = await page.evaluate(() => ({
    auto: window.__loomdeck.workshop.autoDispatch,
    label: document.querySelector('#btn-auto-dispatch')?.textContent.trim(),
  }));
  if (autoOffState.auto === false) ok('自动续派开关', `开关生效，标签「${autoOffState.label}」`);
  else bad('自动续派开关', JSON.stringify(autoOffState));

  /* ── 3. 正常下单 ── */
  await page.selectOption('#f-cloth', '棉缎');
  await page.selectOption('#f-dye', '苔绿');
  await page.fill('#f-width', '88');
  await page.fill('#f-density', '40');
  await page.fill('#f-picks', '3');
  await page.click('#btn-add-order');
  await page.waitForTimeout(400);
  const afterAdd = await page.evaluate(() => ({
    orders: document.querySelectorAll('.order-card').length,
    ids: [...document.querySelectorAll('.order-card__id')].map((n) => n.textContent.trim()),
    toast: document.querySelector('.toast__msg')?.textContent ?? '',
  }));
  if (afterAdd.orders === 3 && afterAdd.ids.includes('O-0003')) {
    ok('正常下单', `订单簿出现 ${afterAdd.ids.join(' / ')}，toast「${afterAdd.toast}」`);
  } else {
    bad('正常下单', JSON.stringify(afterAdd));
  }

  /* ── 4. 异常输入 ── */
  await page.fill('#f-width', '500');
  await page.click('#btn-add-order');
  await page.waitForTimeout(300);
  const invalid = await page.evaluate(() => ({
    orders: document.querySelectorAll('.order-card').length,
    formError: document.querySelector('#form-error')?.textContent ?? '',
    fieldError: document.querySelector('.field.has-error .field__err')?.textContent ?? '',
    focused: document.activeElement?.id ?? '',
  }));
  if (invalid.orders === 3 && invalid.formError && invalid.focused === 'f-width') {
    ok('异常输入被拦截', `幅宽 500 未下单（仍 ${invalid.orders} 张）；「${invalid.formError}」；焦点落在 #${invalid.focused}`);
  } else {
    bad('异常输入被拦截', JSON.stringify(invalid));
  }
  await page.fill('#f-width', '88');

  /* ── 5. 手动派工（此时自动续派已关闭） ── */
  await page.click('.order-card button[data-act="assign"]');
  await page.waitForTimeout(1200);
  const assigned = await page.evaluate(() => {
    const s = window.__loomdeck.workshop;
    const running = s.looms.filter((l) => l.orderId).length;
    return { running, states: s.looms.filter((l) => l.orderId).map((l) => `${l.id}:${l.state}`) };
  });
  if (assigned.running >= 1) {
    ok('手动派工', `点「派单…」成功上机：在制机台 ${assigned.running} 台（${assigned.states.join(' ')}）`);
  } else {
    bad('手动派工', JSON.stringify(assigned));
  }

  /* ── 5b. 重新开启自动续派 → 自动上机 ── */
  await page.click('#btn-auto-dispatch');
  await page.waitForTimeout(200);
  await page.click('#btn-add-order');
  await page.waitForTimeout(1600);
  const autoPicked = await page.evaluate(() => {
    const s = window.__loomdeck.workshop;
    const queued = s.orders.filter((o) => o.state === 'queued').length;
    return { queued, auto: s.autoDispatch };
  });
  if (autoPicked.auto === true && autoPicked.queued === 0) {
    ok('自动续派', '开启后新订单被机台自动接走，队列清空');
  } else {
    bad('自动续派', JSON.stringify(autoPicked));
  }

  /* ── 6. 暂停 / 继续 ── */
  await page.click('#btn-shift-pause');
  await page.waitForTimeout(300);
  const paused = await page.evaluate(() => window.__loomdeck.state);
  const progressBefore = await page.evaluate(() => window.__loomdeck.workshop.looms.map((l) => l.progress));
  await page.waitForTimeout(1800);
  const progressAfter = await page.evaluate(() => window.__loomdeck.workshop.looms.map((l) => l.progress));
  const frozen = progressBefore.every((v, i) => Math.abs(v - progressAfter[i]) < 0.001);
  if (paused === 'paused' && frozen) ok('暂停当班', `state=paused，1.8s 内 12 台机台进度零变化（冻结成立）`);
  else bad('暂停当班', `state=${paused}，进度冻结=${frozen}`);

  await page.click('#btn-shift-pause');
  await page.waitForTimeout(1500);
  const resumed = await page.evaluate(() => window.__loomdeck.state);
  const moved = await page.evaluate(() => window.__loomdeck.workshop.looms.some((l) => l.progress > 0));
  if (resumed === 'running' && moved) ok('继续当班', `state=running，机台进度恢复推进`);
  else bad('继续当班', `state=${resumed}`);

  /* ── 7. 班次节奏 ── */
  await page.click('#tempo-group .seg__btn[data-tempo="tight"]');
  await page.waitForTimeout(200);
  const tempo = await page.evaluate(() => window.__loomdeck.workshop.tempo);
  if (tempo === 'tight') ok('班次节奏切换', '「紧排」生效（state.tempo=tight）');
  else bad('班次节奏切换', `state.tempo=${tempo}`);

  /* ── 8. 键盘（先点空白取得焦点） ── */
  await page.mouse.click(700, 690);
  await page.waitForTimeout(200);
  const selBefore = await page.evaluate(() => window.__loomdeck.workshop.selectedLoomId);
  await page.keyboard.press('ArrowRight');
  await page.waitForTimeout(200);
  const selAfter = await page.evaluate(() => window.__loomdeck.workshop.selectedLoomId);
  if (selAfter !== selBefore) ok('键盘操作', `方向键把选中机台从 ${selBefore ?? '无'} 移到 ${selAfter}`);
  else bad('键盘操作', `选中机台未变化（${selBefore}）`);

  /* ── 9. 截图：桌面 / 抽屉 / 移动端 ── */
  fs.mkdirSync(SHOTS, { recursive: true });
  await page.keyboard.press('Escape');           // 关掉抽屉，拍完整调度台
  await page.waitForTimeout(600);
  await page.screenshot({ path: path.join(SHOTS, '01-desktop.png'), animations: 'disabled' });
  ok('截图', 'screenshots/01-desktop.png（完整调度台）');

  await page.click('.loom >> nth=2');
  await page.waitForTimeout(600);
  const drawerOpen = await page.evaluate(() => !document.querySelector('#drawer').hidden);
  await page.screenshot({ path: path.join(SHOTS, '02-desktop-drawer.png'), animations: 'disabled' });
  if (drawerOpen) ok('截图', 'screenshots/02-desktop-drawer.png（机台详情抽屉）');
  else bad('截图', '抽屉未打开');
  await page.click('#btn-close-drawer');
  await page.waitForTimeout(200);

  /* ── 10. 重置与撤销 ── */
  await page.click('#btn-reset-all');
  await page.waitForTimeout(600);
  const afterReset = await page.evaluate(() => ({
    shift: window.__loomdeck.state,
    orders: document.querySelectorAll('.order-card').length,
    undo: Boolean(document.querySelector('.toast__act')),
  }));
  if (afterReset.shift === 'idle' && afterReset.orders === 2 && afterReset.undo) {
    ok('重置车间', `state=idle，订单簿回到 2 张模板订单，toast 提供「撤销」`);
  } else {
    bad('重置车间', JSON.stringify(afterReset));
  }

  await page.click('.toast__act');
  await page.waitForTimeout(600);
  const afterUndo = await page.evaluate(() => ({
    shift: window.__loomdeck.state,
    orders: document.querySelectorAll('.order-card').length,
  }));
  if (afterUndo.shift !== 'idle' && afterUndo.orders >= 3) {
    ok('撤销重置', `状态回到 shift=${afterUndo.shift}，订单簿 ${afterUndo.orders} 张`);
  } else {
    bad('撤销重置', JSON.stringify(afterUndo));
  }

  /* ── 11. 存档恢复 ── */
  await page.waitForTimeout(1200);
  await page.reload({ waitUntil: 'load' });
  await page.waitForTimeout(1500);
  const restored = await page.evaluate(() => ({
    banner: document.querySelector('#restore-banner')?.hidden === false,
    bannerText: document.querySelector('#restore-banner-text')?.textContent ?? '',
    orders: document.querySelectorAll('.order-card').length,
    stored: Object.keys(localStorage),
  }));
  if (restored.banner && restored.orders >= 3 && restored.stored.includes('loomdeck.workshop.v1')) {
    ok('存档恢复', `刷新后出现「${restored.bannerText}」，订单簿 ${restored.orders} 张，localStorage 键 ${restored.stored.join('/')}`);
  } else {
    bad('存档恢复', JSON.stringify(restored));
  }

  await context.close();

  /* ── 12. 移动端 ── */
  const mctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
  const mpage = await mctx.newPage();
  await mpage.goto(server.url, { waitUntil: 'load' });
  await mpage.waitForTimeout(3000);
  await mpage.screenshot({ path: path.join(SHOTS, '03-mobile.png'), animations: 'disabled' });
  const mscroll = await mpage.evaluate(() => ({
    hScroll: document.documentElement.scrollWidth > document.documentElement.clientWidth + 2,
    docH: document.documentElement.scrollHeight,
  }));
  if (!mscroll.hScroll) ok('移动端布局', `390×844 无横向滚动，页面高 ${mscroll.docH}px，截图 screenshots/03-mobile.png`);
  else bad('移动端布局', `出现横向滚动（scrollW>clientW），页面高 ${mscroll.docH}px`);
  await mctx.close();

  /* ── 13. 控制台与外部请求 ── */
  if (consoleErrors.length === 0) ok('控制台', '无 error、无未捕获异常');
  else bad('控制台', consoleErrors.slice(0, 3).join(' | '));

  if (external.length === 0) ok('零外部请求', '运行期没有发出任何跨域请求');
  else bad('零外部请求', external.slice(0, 5).join(' | '));
} catch (err) {
  bad('脚本执行', err?.stack?.slice(0, 500) ?? String(err));
} finally {
  await browser?.close();
  await server.close();
}

const failed = results.filter((r) => r.status === 'fail');
const report = {
  generatedAt: new Date().toISOString(),
  target: '03-interaction',
  title: '织造车间调度台 · LOOMDECK',
  total: results.length,
  passed: results.length - failed.length,
  failed: failed.length,
  verdict: failed.length ? 'fail' : 'pass',
  results,
};
fs.mkdirSync(path.dirname(REPORT), { recursive: true });
fs.writeFileSync(REPORT, `${JSON.stringify(report, null, 2)}\n`, 'utf8');

for (const r of results) {
  console.log(`${r.status === 'pass' ? '  ✓' : '  ✗'} ${r.name} — ${r.detail}`);
}
console.log(`\n[qa] ${report.passed}/${report.total} 通过 · verdict=${report.verdict} · 报告 ${path.relative(ROOT, REPORT)}`);
process.exit(failed.length ? 1 : 0);
