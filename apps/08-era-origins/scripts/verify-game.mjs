/**
 * 08-era-origins 游戏行为探针（可玩性回归）
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
 * 用法: node scripts/verify-game.mjs [distDir]
 */
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * playwright-core 只做只读复用：优先用本目录 node_modules，
 * 没有则借用批次内 13-qa-curation/qa-harness 已安装的同一份（不修改它）。
 * scripts/verify-pages.mjs 不依赖它（走本机 Chrome 的 CDP，零第三方依赖）。
 */
async function loadChromium() {
  const candidates = [
    path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../node_modules/playwright-core/index.mjs'),
    path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../13-qa-curation/qa-harness/node_modules/playwright-core/index.mjs'),
  ];
  for (const p of candidates) {
    if (fs.existsSync(p)) return (await import(p)).chromium;
  }
  console.error('未找到 playwright-core；可改用 scripts/verify-pages.mjs（零依赖 CDP 方案）');
  process.exit(2);
}
const chromium = await loadChromium();

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIST = path.resolve(process.argv[2] || path.join(ROOT, 'dist'));
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
  try {
    const buf = await fs.promises.readFile(file);
    res.writeHead(200, { 'content-type': MIME[path.extname(file)] || 'application/octet-stream' });
    res.end(buf);
  } catch { res.writeHead(404); res.end('not found'); }
});
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const base = `http://127.0.0.1:${server.address().port}${MOUNT}`;

const results = [];
const rec = (id, status, name, detail, data) => {
  results.push({ id, status, name, detail, ...(data ? { data } : {}) });
  console.log(`  ${status === 'pass' ? '✓' : status === 'warn' ? '!' : '✗'} [${id}] ${name} — ${detail}`);
};

const browser = await chromium.launch({
  headless: true, channel: 'chromium',
  args: ['--use-gl=angle', '--enable-unsafe-swiftshader', '--no-sandbox'],
});

const snap = (page) => page.evaluate(() => {
  const g = window.__lumenRally || window.__lumenGravity;
  if (!g) return null;
  const pick = (o) => {
    if (!o || typeof o !== 'object') return null;
    const out = {};
    for (const k of Object.keys(o)) if (typeof o[k] === 'number') out[k] = Math.round(o[k] * 1000) / 1000;
    return Object.keys(out).length ? out : null;
  };
  return { state: g.state ?? null, p1: pick(g.p1), p2: pick(g.p2), score: Array.isArray(g.score) ? g.score : null };
});
const activeEl = (page) => page.evaluate(() => {
  const ae = document.activeElement;
  return !ae ? 'NONE' : `${ae.tagName.toUpperCase()}${ae.id ? '#' + ae.id : ''}${ae.className ? '.' + String(ae.className).trim().split(/\s+/).join('.') : ''}`;
});

for (const g of [
  { file: 'rally.html', keys: ['ArrowDown', 'KeyS', 'ArrowUp', 'KeyW'], signal: (s) => ({ y: s?.p1?.y }), label: 'p1.y' },
  { file: 'gravity.html', keys: ['KeyD', 'KeyW', 'KeyA'], signal: (s) => ({ angle: s?.p1?.angle }), label: 'p1.angle' },
]) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  const errs = [];
  page.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()); });
  page.on('pageerror', (e) => errs.push(String(e)));

  await page.goto(new URL(g.file, base).href, { waitUntil: 'load', timeout: 45000 });
  await page.waitForTimeout(900);

  // D3 开局
  await page.evaluate(() => {
    (document.querySelector('[data-act="play"]') ||
      [...document.querySelectorAll('button')].find((x) => /开始|启动|进入|游玩/.test(x.textContent || '')))?.click();
  });
  await page.waitForTimeout(600);
  let st = await snap(page);
  rec('D3', st?.state === 'countdown' ? 'pass' : 'fail', `${g.file} 开始流程`, `state=${st?.state}`);

  // D3 倒计时可暂停
  await page.evaluate(() => document.querySelector('[data-control="pause"]')?.click());
  await page.waitForTimeout(500);
  st = await snap(page);
  rec('D3', st?.state === 'paused' ? 'pass' : 'fail', `${g.file} 倒计时可暂停`, `state=${st?.state}`);

  // D3 继续
  await page.evaluate(() => document.querySelector('[data-control="pause"]')?.click());
  await page.waitForTimeout(1400);
  st = await snap(page);
  rec('D3', st?.state === 'playing' ? 'pass' : 'fail', `${g.file} 继续对局`, `state=${st?.state}`);

  // D5 未聚焦：全程采样，任何一点变化即失败
  await page.evaluate(() => { document.activeElement?.blur?.(); document.body.focus?.(); });
  await page.waitForTimeout(300);
  const aeUnfocused = await activeEl(page);
  const beforeU = await snap(page);
  const baseU = JSON.stringify(g.signal(beforeU));
  const samplesU = [];
  for (const k of g.keys) {
    await page.keyboard.down(k);
    for (let i = 0; i < 4; i += 1) { await page.waitForTimeout(55); samplesU.push(g.signal(await snap(page))); }
    await page.keyboard.up(k);
    await page.waitForTimeout(120);
  }
  await page.waitForTimeout(400);
  const afterU = await snap(page);
  const drift = samplesU.filter((s) => JSON.stringify(s) !== baseU);
  const same = drift.length === 0 && JSON.stringify(g.signal(afterU)) === baseU;
  rec('D5', same ? 'pass' : 'fail', `${g.file} 键盘焦点作用域（未聚焦不响应）`,
    `activeElement=${aeUnfocused}，按住 ${g.keys.join('/')}（含 ${samplesU.length} 次过程采样），${g.label} ${same ? '全程未变' : '发生变化'}`,
    { before: g.signal(beforeU), after: g.signal(afterU), driftSamples: drift.slice(0, 3) });

  // 确保在对局中
  st = await snap(page);
  if (st?.state !== 'playing') {
    await page.evaluate(() => document.querySelector('[data-control="restart"]')?.click());
    await page.waitForTimeout(2600);
    st = await snap(page);
    rec('D5', st?.state === 'playing' ? 'pass' : 'fail', `${g.file} 聚焦测试前对局状态`, `重开后 state=${st?.state}`);
  }

  // D5 聚焦后：过程采样 ∪ 末值
  await page.evaluate(() => document.querySelector('[data-game-root]')?.focus({ preventScroll: true }));
  await page.waitForTimeout(300);
  const aeFocused = await activeEl(page);
  const beforeF = await snap(page);
  const baseF = JSON.stringify(g.signal(beforeF));
  const samplesF = [];
  for (const k of g.keys) {
    await page.keyboard.down(k);
    for (let i = 0; i < 4; i += 1) { await page.waitForTimeout(65); samplesF.push(g.signal(await snap(page))); }
    await page.keyboard.up(k);
    await page.waitForTimeout(120);
  }
  await page.waitForTimeout(400);
  const afterF = await snap(page);
  const moved = samplesF.some((s) => JSON.stringify(s) !== baseF) || JSON.stringify(g.signal(afterF)) !== baseF;
  rec('D5', moved ? 'pass' : 'fail', `${g.file} 键盘焦点作用域（聚焦后响应）`,
    `activeElement=${aeFocused}，同一组键 + ${samplesF.length} 次过程采样，${g.label} ${moved ? '已变化（按键生效）' : '未变化'}`,
    { before: g.signal(beforeF), after: g.signal(afterF), state: beforeF?.state,
      sampleValues: samplesF.map((s) => s[Object.keys(s)[0]]) });

  // D5 聚焦时不滚动页面
  const s0 = await page.evaluate(() => window.scrollY);
  await page.keyboard.down('ArrowDown');
  await page.waitForTimeout(400);
  await page.keyboard.up('ArrowDown');
  const s1 = await page.evaluate(() => window.scrollY);
  rec('D5', s0 === s1 ? 'pass' : 'fail', `${g.file} 聚焦时不滚动页面`, `scrollY ${s0} -> ${s1}`);

  // D4 存档
  const storage = await page.evaluate(() => Object.keys(localStorage).filter((k) => k.startsWith('lumen')));
  rec('D4', storage.length ? 'pass' : 'fail', `${g.file} 本地存档`,
    storage.length ? `${storage.length} 个键：${storage.join(', ')}` : 'localStorage 为空');

  // D3 重开
  await page.evaluate(() => document.querySelector('[data-control="restart"]')?.click());
  await page.waitForTimeout(700);
  st = await snap(page);
  rec('D3', st && ['idle', 'countdown', 'playing'].includes(st.state) ? 'pass' : 'fail', `${g.file} 重开流程`, `state=${st?.state}`);

  // D6 控制台
  rec('D6', errs.length ? 'fail' : 'pass', `${g.file} 控制台`, errs.length ? `${errs.length} 条：${errs.slice(0, 3).join(' | ')}` : '零错误');

  await ctx.close();
}

await browser.close();
server.close();

const pass = results.filter((r) => r.status === 'pass').length;
const warn = results.filter((r) => r.status === 'warn').length;
const fail = results.filter((r) => r.status === 'fail').length;

/* 原始结果落盘，供交付核对（可从本脚本重复生成，不依赖一次性探针）。
   输出目录：screenshots/probe-report.json */
const OUT = path.resolve(process.argv[3] || path.join(ROOT, 'screenshots'));
try {
  fs.mkdirSync(OUT, { recursive: true });
  fs.writeFileSync(
    path.join(OUT, 'probe-report.json'),
    JSON.stringify(
      {
        tool: 'scripts/verify-game.mjs',
        generatedAt: new Date().toISOString(),
        mount: MOUNT,
        total: results.length,
        pass,
        warn,
        fail,
        results,
      },
      null,
      2,
    ) + '\n',
    'utf8',
  );
} catch (e) {
  console.error('探针报告落盘失败：', e.message);
}

console.log(`\n总计 ${results.length} 项：pass ${pass} / warn ${warn} / fail ${fail}`);
process.exit(fail ? 1 : 0);
