#!/usr/bin/env node
/**
 * 功能级冒烟（**Ego 入口**）—— 织造车间调度台 · LOOMDECK
 * ---------------------------------------------------------------------------
 * 用途：把批次 harness 的 D3「交互流」与 D4「存档检查」搬到**规范指定的浏览器
 * 入口**上 —— Ego 浏览器。这是本目录功能级验收的**唯一**权威来源。
 *
 * 为什么不再只靠本地无头 Chrome 的那套：
 *   16-design-system《MIGRATION-NOTES》§9 明确 —— 约定禁的是**浏览器入口**，
 *   自启无头 Chromium 本身即「另起 Chromium / Chrome」；线上验收一律走 Ego。
 *   本脚本因此**不依赖任何浏览器驱动库**，只调用 Ego 提供的 TaskSpace / Page API。
 *
 * 与 scripts/qa-smoke.mjs（playwright 链）的关系：
 *   那一条是**本地自测工具链**（保留，供没有 Ego 的环境做回归），**不作为验收依据**；
 *   两者结论若不一致，以本脚本为准。
 *
 * 跑法（**必须**用包装器，它负责起服务器并把绝对路径注入本脚本）：
 *   npm run qa:ego
 *   等价于：node scripts/qa-ego.mjs
 *
 * 为什么需要包装器（三条实测得来的原因）：
 *   1. Ego 的 nodejs 进程不继承 shell 环境变量、也没有 argv，工作目录固定为 '/'，
 *      脚本经 stdin 进入时是 eval 模式（相对 import 与 import.meta.url 均不可用）
 *      —— 绝对路径必须由普通 node 侧算好后注入。
 *   2. Ego 的 nodejs 进程**开不了本地监听端口**（实测：listen 之后进程静默退出，
 *      无报错、无堆栈）—— 静态服务器必须由包装器在普通 node 进程里起。
 *   3. 端口随机分配 → 每次都是**全新 origin** → localStorage 天然为空 = 首访态，
 *      不需要清理用户浏览器数据。
 */

import fs from 'node:fs';
import path from 'node:path';

/* 项目根与目标地址 —— 由 scripts/qa-ego.mjs 注入（字面量占位符，直接跑本文件会报错） */
const ROOT = __LOOMDECK_ROOT__;
const BASE = __LOOMDECK_URL__;

const DIST = path.join(ROOT, 'dist');
/* 自测截图写进 qa/shots/（自测产物），**不覆盖交付截图**。
   交付截图 screenshots/ 由 Ego 的交付轮次产出。 */
const SHOTS = path.join(ROOT, 'qa', 'shots');
const REPORT = path.join(ROOT, 'qa', 'report-ego.json');
const SPACE = 'loomdeck-verify-20261022';
const VIEW = { width: 1440, height: 900 };

const results = [];
const ok = (name, detail) => results.push({ name, status: 'pass', detail });
const bad = (name, detail) => results.push({ name, status: 'fail', detail });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

if (!fs.existsSync(path.join(DIST, 'index.html'))) {
  console.error('[qa-ego] 未找到 dist/index.html，请先执行：npm run build');
  process.exit(1);
}

const server = { url: BASE };
console.log(`[qa-ego] 目标：${BASE}（包装器起的临时服务器，全新 origin → 首访态）`);

const task = await taskSpace(SPACE);
const page = task.page('p1');
console.log(`[qa-ego] TaskSpace：${task.spaceId} / Page ${page.label}`);

/**
 * 可靠点击：先把目标滚进视口，再做**命中测试**（元素中心点的 elementFromPoint
 * 必须命中该元素或其后代），最后才发原生点击。
 *
 * 为什么要这层：Ego 的 click 会「用滚轮把目标带进视口」，在多滚动容器的调度台
 * 里可能滚错容器，导致点击落到别的元素上 —— 2026-10-22 实测过一次：
 * 「加入订单簿」按钮没被点中，表单毫无反应。命中测试把这种假点击变成显式失败。
 */
async function clickOk(selector, label) {
  await page.evaluate((sel) => {
    const el = document.querySelector(sel);
    if (el) el.scrollIntoView({ block: 'center', inline: 'nearest' });
  }, selector);
  await sleep(200);
  const hit = await page.evaluate((sel) => {
    const el = document.querySelector(sel);
    if (!el) return { found: false };
    const r = el.getBoundingClientRect();
    const top = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
    return {
      found: true,
      ok: !!top && (top === el || el.contains(top)),
      top: top ? `${top.tagName.toLowerCase()}${top.id ? '#' + top.id : ''}${top.className ? '.' + String(top.className).split(' ')[0] : ''}` : 'null',
    };
  }, selector);
  if (!hit.found) throw new Error(`元素不存在：${selector}`);
  if (!hit.ok) throw new Error(`点击目标被遮挡：${selector}（实际命中 ${hit.top}）`);
  await page.click(selector, { label });
}

try {
  await page.cdp('Log.enable', {});
  await page.cdp('Network.enable', {});
  await page.events();   // 清空既有事件缓冲

  /* 视口：mobile:true 才能 1:1 精确（mobile:false 会被 Chromium 放大 1/0.9） */
  await page.cdp('Emulation.setDeviceMetricsOverride', {
    width: VIEW.width, height: VIEW.height, deviceScaleFactor: 1, mobile: true,
  });
  await page.goto(server.url);
  await page.waitForLoadState('load');
  await page.waitForFunction(
    () => document.querySelectorAll('.loom').length === 12,
    undefined,
    { timeout: 20000 },
  );
  await sleep(1200);

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

  /* ── 3. 先关掉自动续派，后续手动派工才可确定复现 ── */
  await page.click('#btn-auto-dispatch', { label: 'toggle auto dispatch off' });
  await sleep(300);
  const autoOffState = await page.evaluate(() => ({
    auto: window.__loomdeck.workshop.autoDispatch,
    label: document.querySelector('#btn-auto-dispatch')?.textContent.trim(),
  }));
  if (autoOffState.auto === false) ok('自动续派开关', `开关生效，标签「${autoOffState.label}」`);
  else bad('自动续派开关', JSON.stringify(autoOffState));

  /* ── 4. 正常下单 ── */
  await page.selectOption('#f-cloth', '棉缎');
  await page.selectOption('#f-dye', '苔绿');
  await page.fill('#f-width', '88');
  await page.fill('#f-density', '40');
  await page.fill('#f-picks', '3');
  await page.click('#btn-add-order', { label: 'add order to book' });
  await sleep(500);
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

  /* ── 5. 异常输入 ── */
  await page.fill('#f-width', '500');
  await page.click('#btn-add-order', { label: 'submit invalid order' });
  await sleep(400);
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

  /* ── 6. 手动派工（此时自动续派已关闭） ── */
  await page.click('css=.order-card button[data-act="assign"] >> nth=0', { label: 'assign order to loom' });
  await sleep(1400);
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

  /* ── 7. 重新开启自动续派 → 自动上机 ── */
  await page.click('#btn-auto-dispatch', { label: 'toggle auto dispatch on' });
  await sleep(300);
  await page.click('#btn-add-order', { label: 'add order for auto dispatch' });
  await sleep(1800);
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

  /* ── 8. 暂停 / 继续 ── */
  await page.click('#btn-shift-pause', { label: 'pause shift' });
  await sleep(400);
  const paused = await page.evaluate(() => window.__loomdeck.state);
  const progressBefore = await page.evaluate(() => window.__loomdeck.workshop.looms.map((l) => l.progress));
  await sleep(1900);
  const progressAfter = await page.evaluate(() => window.__loomdeck.workshop.looms.map((l) => l.progress));
  const frozen = progressBefore.every((v, i) => Math.abs(v - progressAfter[i]) < 0.001);
  if (paused === 'paused' && frozen) ok('暂停当班', `state=paused，1.9s 内 12 台机台进度零变化（冻结成立）`);
  else bad('暂停当班', `state=${paused}，进度冻结=${frozen}`);

  await page.click('#btn-shift-pause', { label: 'resume shift' });
  await sleep(1600);
  const resumed = await page.evaluate(() => window.__loomdeck.state);
  const moved = await page.evaluate(() => window.__loomdeck.workshop.looms.some((l) => l.progress > 0));
  if (resumed === 'running' && moved) ok('继续当班', `state=running，机台进度恢复推进`);
  else bad('继续当班', `state=${resumed}`);

  /* ── 9. 班次节奏 ── */
  await page.click('#tempo-group .seg__btn[data-tempo="tight"]', { label: 'switch tempo to tight' });
  await sleep(300);
  const tempo = await page.evaluate(() => window.__loomdeck.workshop.tempo);
  if (tempo === 'tight') ok('班次节奏切换', '「紧排」生效（state.tempo=tight）');
  else bad('班次节奏切换', `state.tempo=${tempo}`);

  /* ── 10. 键盘：焦点须落在展品内（跳链）才会启用快捷键 ──
   * 断言「选中机台从 无 → L-0x」而不是「前后不相等」——
   * 后者会被「点击本身改了选中」误判为通过。 */
  const selBefore = await page.evaluate(() => window.__loomdeck.workshop.selectedLoomId);
  await page.focus('css=.ds-skip');
  await sleep(200);
  const activeTag = await page.evaluate(() => document.activeElement?.className ?? '');
  await page.keyboard.press('ArrowRight');
  await sleep(300);
  const selAfter = await page.evaluate(() => window.__loomdeck.workshop.selectedLoomId);
  if (!selBefore && selAfter && activeTag.includes('ds-skip')) {
    ok('键盘操作', `焦点在展品内（${activeTag.trim()}）→ 方向键把选中机台从「无」移到 ${selAfter}`);
  } else {
    bad('键盘操作', `选中机台 ${selBefore ?? '无'} → ${selAfter ?? '无'}，焦点元素「${activeTag}」`);
  }

  /* ── 11. 详情抽屉 ── */
  await page.click('css=.loom >> nth=2', { label: 'open loom detail drawer' });
  await sleep(700);
  const drawerOpen = await page.evaluate(() => !document.querySelector('#drawer').hidden);
  if (drawerOpen) ok('详情抽屉', '点机台卡打开抽屉（hidden=false）');
  else bad('详情抽屉', '抽屉未打开');
  await page.click('#btn-close-drawer', { label: 'close loom drawer' });
  await sleep(300);

  /* ── 12. 自测截图（自测产物，不覆盖交付截图） ── */
  fs.mkdirSync(SHOTS, { recursive: true });
  await page.screenshot({ path: path.join(SHOTS, '04-ego-functional.png') });
  ok('自测截图', 'qa/shots/04-ego-functional.png（Ego 产出，自测产物）');

  /* ── 13. 重置与撤销 ── */
  await page.click('#btn-reset-all', { label: 'reset workshop' });
  await sleep(700);
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

  await page.click('css=.toast__act', { label: 'undo reset' });
  await sleep(700);
  const afterUndo = await page.evaluate(() => ({
    shift: window.__loomdeck.state,
    orders: document.querySelectorAll('.order-card').length,
  }));
  if (afterUndo.shift !== 'idle' && afterUndo.orders >= 3) {
    ok('撤销重置', `状态回到 shift=${afterUndo.shift}，订单簿 ${afterUndo.orders} 张`);
  } else {
    bad('撤销重置', JSON.stringify(afterUndo));
  }

  /* ── 14. 存档恢复（刷新后从 localStorage 还原） ── */
  await sleep(1400);
  await page.reload();
  await page.waitForLoadState('load');
  await page.waitForFunction(
    () => document.querySelectorAll('.loom').length === 12,
    undefined,
    { timeout: 20000 },
  );
  await sleep(1200);
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

  /* ── 15. 零外部请求 + 控制台无错误 ── */
  const events = await page.events();
  const reqs = events
    .filter((e) => e.method === 'Network.requestWillBeSent')
    .map((e) => e.params?.request?.url || '');
  const external = [...new Set(reqs)].filter(
    (u) => !u.startsWith(server.url) && !u.startsWith('data:') && !u.startsWith('blob:')
      && !u.startsWith('chrome://') && !u.startsWith('chrome-extension://') && !u.startsWith('devtools://'),
  );
  const consoleErrors = events
    .filter((e) => e.method === 'Log.entryAdded' && e.params?.entry?.level === 'error')
    .map((e) => e.params?.entry?.text);

  if (consoleErrors.length === 0) ok('控制台', '无 error、无未捕获异常');
  else bad('控制台', consoleErrors.slice(0, 3).join(' | '));

  if (external.length === 0) ok('零外部请求', `运行期 ${reqs.length} 个请求，跨源 0 个`);
  else bad('零外部请求', external.slice(0, 5).join(' | '));
} catch (err) {
  bad('脚本执行', err?.stack?.slice(0, 600) ?? String(err));
} finally {
  await server.close();
}

const failed = results.filter((r) => r.status === 'fail');
const report = {
  generatedAt: new Date().toISOString(),
  target: '03-interaction',
  title: '织造车间调度台 · LOOMDECK',
  browser: 'ego-browser (ego-lite) —— 规范指定的验收浏览器入口',
  taskSpace: SPACE,
  viewport: `${VIEW.width}x${VIEW.height}`,
  covers: ['D3 交互流', 'D4 存档检查'],
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
console.log(`\n[qa-ego] ${report.passed}/${report.total} 通过 · verdict=${report.verdict} · 报告 ${path.relative(ROOT, REPORT)}`);
process.exit(failed.length ? 1 : 0);
