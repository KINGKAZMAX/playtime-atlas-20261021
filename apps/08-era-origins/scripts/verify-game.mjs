#!/usr/bin/env node
/**
 * 08-era-origins 游戏行为探针（Ego 路径）
 * ---------------------------------------------------------------------------
 * 覆盖批次 harness 的 D3 / D4 / D5 / D6 四项，与 16-design-system/MIGRATION-NOTES.md
 * §4.1「08 键盘作用域红线」和 §4「K.1—K.6 必须保持不变」对应：
 *
 *   D3 状态机   开始 → 倒计时 → 暂停 → 继续 → 重开
 *   D4 存档     localStorage 写入键
 *   D5 键盘作用域 未聚焦不响应 / 聚焦后响应 / 聚焦时不滚动页面
 *   D6 控制台   零错误
 *
 * D5 的判定量与探针口径：
 *   · 辉点对拉用 p1.y（辉板不漂移，只随按键变化）
 *   · 引力双星用 p1.angle（飞船位置受引力持续漂移，不可用；angle 仅随转向输入变化）
 *   · 「聚焦后响应」取「按住期间的过程采样 ∪ 末值」，避免左右对称键组净转角为 0 造成误判
 *
 * **浏览器入口已迁移到 Ego**（2026-10-22 起的长期约定：网页调试 / 截图 / 验收
 * 一律走 Ego，不再本地另起 Playwright / Chromium / Chrome）。
 *
 * 用法: node scripts/verify-game.mjs [distDir] [outDir]
 */
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIST = path.resolve(process.argv[2] || path.join(ROOT, 'dist'));
const OUT = path.resolve(process.argv[3] || path.join(ROOT, 'screenshots'));
const EGO_BIN = process.env.EGO_BROWSER_BIN || '/Users/mekzenx2/.local/bin/ego-browser';

if (!fs.existsSync(EGO_BIN)) { console.error('找不到 ego-browser：', EGO_BIN); process.exit(2); }
fs.mkdirSync(OUT, { recursive: true });

const MOUNT = '/playtime-atlas-20261021/works/08-era-origins/';
const MIME = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8',
  '.md': 'text/markdown; charset=utf-8', '.svg': 'image/svg+xml', '.woff2': 'font/woff2',
};
const server = http.createServer(async (req, res) => {
  let p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  if (!p.startsWith(MOUNT)) { res.writeHead(404); res.end('no mount'); return; }
  p = p.slice(MOUNT.length);
  if (p === '' || p.endsWith('/')) p += 'index.html';
  const file = path.join(DIST, p);
  if (!file.startsWith(DIST)) { res.writeHead(403); res.end(); return; }
  try {
    const buf = await fs.promises.readFile(file);
    res.writeHead(200, { 'content-type': MIME[path.extname(file)] || 'application/octet-stream' });
    res.end(buf);
  } catch { res.writeHead(404); res.end('not found'); }
});
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const base = `http://127.0.0.1:${server.address().port}${MOUNT}`;

const GAMES = [
  { file: 'rally.html', keys: ['ArrowDown', 'KeyS', 'ArrowUp', 'KeyW'], signal: (s) => ({ y: s?.p1?.y }), label: 'p1.y' },
  { file: 'gravity.html', keys: ['KeyD', 'KeyW', 'KeyA'], signal: (s) => ({ angle: s?.p1?.angle }), label: 'p1.angle' },
];

/* ---------- 生成一次性 Ego 脚本 ---------- */
const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ego-lumen-game-'));
const scriptPath = path.join(tmpDir, 'game.mjs');

const egoScript = `
/* 由 scripts/verify-game.mjs 生成 —— 不要手改 */
const CFG = ${JSON.stringify({ base, games: GAMES.map((g) => ({ file: g.file, keys: g.keys, label: g.label })) })};
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const results = [];
const rec = (id, status, name, detail, data) => {
  results.push({ id, status, name, detail, ...(data ? { data } : {}) });
  console.log('  ' + (status === 'pass' ? '\\u2713' : status === 'warn' ? '!' : '\\u2717') + ' [' + id + '] ' + name + ' \\u2014 ' + detail);
};
const signalOf = (g, s) => (g.label === 'p1.y' ? { y: s?.p1?.y } : { angle: s?.p1?.angle });

/* 页面内取状态：必须自包含（Ego 的 evaluate 不能引用模块作用域） */
const snap = () => {
  const g = window.__lumenRally || window.__lumenGravity;
  if (!g) return null;
  const pick = (o) => {
    if (!o || typeof o !== 'object') return null;
    const out = {};
    for (const k of Object.keys(o)) if (typeof o[k] === 'number') out[k] = Math.round(o[k] * 1000) / 1000;
    return Object.keys(out).length ? out : null;
  };
  return { state: g.state ?? null, p1: pick(g.p1), p2: pick(g.p2), score: Array.isArray(g.score) ? g.score : null };
};
const activeEl = () => {
  const ae = document.activeElement;
  return !ae ? 'NONE' : ae.tagName.toUpperCase() + (ae.id ? '#' + ae.id : '') + (ae.className ? '.' + String(ae.className).trim().split(/\\s+/).join('.') : '');
};
const collectErrs = (events) => events
  .filter((e) => e.method === 'Log.entryAdded' && e.params?.entry?.level === 'error')
  .map((e) => e.params.entry.text);

const task = await taskSpace('08-era-origins ego-qa game');
const page = task.page('p1');
await page.cdp('Log.enable', {});

for (const g of CFG.games) {
  console.log('\\n\\u25b6 ' + g.file);
  await page.cdp('Emulation.setDeviceMetricsOverride', { width: 1440, height: 900, deviceScaleFactor: 1, mobile: true });
  await page.events();                       // 清空上一轮残留
  await page.goto(CFG.base + g.file);
  await page.waitForLoadState('load');
  await sleep(900);
  const errs = collectErrs(await page.events());   // 导航期错误

  // D3 开局
  await page.evaluate(() => {
    (document.querySelector('[data-act="play"]') ||
      [...document.querySelectorAll('button')].find((x) => /开始|启动|进入|游玩/.test(x.textContent || '')))?.click();
  });
  await sleep(600);
  let st = await page.evaluate(snap);
  rec('D3', st?.state === 'countdown' ? 'pass' : 'fail', g.file + ' 开始流程', 'state=' + st?.state);

  // D3 倒计时可暂停
  await page.evaluate(() => document.querySelector('[data-control="pause"]')?.click());
  await sleep(500);
  st = await page.evaluate(snap);
  rec('D3', st?.state === 'paused' ? 'pass' : 'fail', g.file + ' 倒计时可暂停', 'state=' + st?.state);

  // D3 继续
  await page.evaluate(() => document.querySelector('[data-control="pause"]')?.click());
  await sleep(1400);
  st = await page.evaluate(snap);
  rec('D3', st?.state === 'playing' ? 'pass' : 'fail', g.file + ' 继续对局', 'state=' + st?.state);

  // D5 未聚焦：全程采样，任何一点变化即失败
  await page.evaluate(() => { document.activeElement?.blur?.(); document.body.focus?.(); });
  await sleep(300);
  const aeUnfocused = await page.evaluate(activeEl);
  const beforeU = await page.evaluate(snap);
  const baseU = JSON.stringify(signalOf(g, beforeU));
  const samplesU = [];
  for (const k of g.keys) {
    await page.keyboard.down(k);
    for (let i = 0; i < 4; i += 1) { await sleep(55); samplesU.push(signalOf(g, await page.evaluate(snap))); }
    await page.keyboard.up(k);
    await sleep(120);
  }
  await sleep(400);
  const afterU = await page.evaluate(snap);
  const drift = samplesU.filter((s) => JSON.stringify(s) !== baseU);
  const same = drift.length === 0 && JSON.stringify(signalOf(g, afterU)) === baseU;
  rec('D5', same ? 'pass' : 'fail', g.file + ' 键盘焦点作用域（未聚焦不响应）',
    'activeElement=' + aeUnfocused + '，按住 ' + g.keys.join('/') + '（含 ' + samplesU.length + ' 次过程采样），' + g.label + ' ' + (same ? '全程未变' : '发生变化'),
    { before: signalOf(g, beforeU), after: signalOf(g, afterU), driftSamples: drift.slice(0, 3) });

  // 确保在对局中
  st = await page.evaluate(snap);
  if (st?.state !== 'playing') {
    await page.evaluate(() => document.querySelector('[data-control="restart"]')?.click());
    await sleep(2600);
    st = await page.evaluate(snap);
    rec('D5', st?.state === 'playing' ? 'pass' : 'fail', g.file + ' 聚焦测试前对局状态', '重开后 state=' + st?.state);
  }

  // D5 聚焦后：过程采样 ∪ 末值
  await page.evaluate(() => document.querySelector('[data-game-root]')?.focus({ preventScroll: true }));
  await sleep(300);
  const aeFocused = await page.evaluate(activeEl);
  const beforeF = await page.evaluate(snap);
  const baseF = JSON.stringify(signalOf(g, beforeF));
  const samplesF = [];
  for (const k of g.keys) {
    await page.keyboard.down(k);
    for (let i = 0; i < 4; i += 1) { await sleep(65); samplesF.push(signalOf(g, await page.evaluate(snap))); }
    await page.keyboard.up(k);
    await sleep(120);
  }
  await sleep(400);
  const afterF = await page.evaluate(snap);
  const moved = samplesF.some((s) => JSON.stringify(s) !== baseF) || JSON.stringify(signalOf(g, afterF)) !== baseF;
  rec('D5', moved ? 'pass' : 'fail', g.file + ' 键盘焦点作用域（聚焦后响应）',
    'activeElement=' + aeFocused + '，同一组键 + ' + samplesF.length + ' 次过程采样，' + g.label + ' ' + (moved ? '已变化（按键生效）' : '未变化'),
    { before: signalOf(g, beforeF), after: signalOf(g, afterF), state: beforeF?.state,
      sampleValues: samplesF.map((s) => s[Object.keys(s)[0]]) });

  // D5 聚焦时不滚动页面
  const s0 = await page.evaluate(() => window.scrollY);
  await page.keyboard.down('ArrowDown');
  await sleep(400);
  await page.keyboard.up('ArrowDown');
  const s1 = await page.evaluate(() => window.scrollY);
  rec('D5', s0 === s1 ? 'pass' : 'fail', g.file + ' 聚焦时不滚动页面', 'scrollY ' + s0 + ' -> ' + s1);

  // D4 存档
  const storage = await page.evaluate(() => Object.keys(localStorage).filter((k) => k.startsWith('lumen')));
  rec('D4', storage.length ? 'pass' : 'fail', g.file + ' 本地存档',
    storage.length ? storage.length + ' 个键：' + storage.join(', ') : 'localStorage 为空');

  // D3 重开
  await page.evaluate(() => document.querySelector('[data-control="restart"]')?.click());
  await sleep(700);
  st = await page.evaluate(snap);
  rec('D3', st && ['idle', 'countdown', 'playing'].includes(st.state) ? 'pass' : 'fail', g.file + ' 重开流程', 'state=' + st?.state);

  // D6 控制台（导航期 + 检查期）
  const allErrs = errs.concat(collectErrs(await page.events()));
  rec('D6', allErrs.length ? 'fail' : 'pass', g.file + ' 控制台', allErrs.length ? allErrs.length + ' 条：' + allErrs.slice(0, 3).join(' | ') : '零错误');
}

const pass = results.filter((r) => r.status === 'pass').length;
const warn = results.filter((r) => r.status === 'warn').length;
const fail = results.filter((r) => r.status === 'fail').length;
console.log('\\n总计 ' + results.length + ' 项：pass ' + pass + ' / warn ' + warn + ' / fail ' + fail);
/* 原始结果落盘（Ego 进程内写，可重复生成，不依赖一次性探针） */
const fsMod = await import('node:fs');
const pathMod = await import('node:path');
const outPath = pathMod.join(${JSON.stringify(OUT)}, 'probe-report.json');
fsMod.mkdirSync(pathMod.dirname(outPath), { recursive: true });
fsMod.writeFileSync(outPath, JSON.stringify({
  tool: 'scripts/verify-game.mjs (Ego)',
  generatedAt: new Date().toISOString(),
  mount: CFG.base,
  total: results.length, pass, warn, fail,
  results,
}, null, 2) + String.fromCharCode(10), 'utf8');
console.log('报告：' + outPath);
process.exit(fail ? 1 : 0);
`;

fs.writeFileSync(scriptPath, egoScript, 'utf8');

console.log('Ego 游戏探针：' + base);
/**
 * 必须用**异步** spawn：静态服务器就跑在本进程里，
 * spawnSync 会阻塞事件循环 → 服务器无法响应 → 子进程导航超时。
 */
const res = await new Promise((resolve) => {
  const child = spawn(EGO_BIN, ['nodejs'], { stdio: ['pipe', 'inherit', 'inherit'] });
  child.on('close', (code) => resolve({ status: code }));
  child.on('error', (e) => { console.error('ego-browser 调用失败：', e.message); resolve({ status: 2 }); });
  child.stdin.end(fs.readFileSync(scriptPath, 'utf8'));
});
try { fs.rmSync(tmpDir, { recursive: true, force: true }); } catch { /* ignore */ }

/* 报告已由 Ego 进程写入 OUT/probe-report.json；这里只做失败兜底提示。 */
const reportPath = path.join(OUT, 'probe-report.json');
if (!fs.existsSync(reportPath)) {
  console.error('探针未产出报告：', reportPath);
}
server.close();
process.exit(res.status === null ? 2 : res.status);
