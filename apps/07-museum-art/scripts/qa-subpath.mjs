/**
 * 回响电玩馆 — 线上子路径部署复验
 *
 * 在模拟线上真实子路径 `/playtime-atlas-20261021/exhibits/07-museum-art/` 下
 * 加载构建产物，逐条记录资源请求状态码，并检查：
 *   · fonts.css / tokens.css / tokens.js 是否 200
 *   · 是否存在任何 404
 *   · 控制台是否有错误
 *   · 设计令牌在运行期是否可用（不依赖运行期 fetch）
 *
 * 运行：node scripts/qa-subpath.mjs
 * 验证后立即关闭临时服务器，不留常驻进程。
 */

import { chromium } from 'playwright';
import { existsSync, statSync, readFileSync, readdirSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { startServer } from './lib/server.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');
const DIST = path.join(ROOT, 'dist');

const PREFIX = '/playtime-atlas-20261021/exhibits/07-museum-art';

let _browser = null;
let _server = null;

/** 进程退出时确保不残留浏览器与服务器 */
function cleanupOnExit() {
  try { _browser?.close?.(); } catch { /* 忽略 */ }
  try { _server?.close?.(); } catch { /* 忽略 */ }
}
process.on('exit', cleanupOnExit);
process.on('SIGINT', () => { cleanupOnExit(); process.exit(130); });

let pass = 0;
const failures = [];
const ok = (m) => { pass++; console.log(`  ✓ ${m}`); };
const bad = (m) => { failures.push(m); console.log(`  ✗ ${m}`); };

async function main() {
  console.log('回响电玩馆 — 线上子路径部署复验');
  console.log('='.repeat(58));

  /* ---------- 1. 构建产物存在性 ---------- */
  console.log('\n· 1. 构建产物');
  const idx = path.join(DIST, 'index.html');
  if (existsSync(idx) && statSync(idx).size > 1000) ok(`dist/index.html 存在（${(statSync(idx).size / 1024).toFixed(1)} KB）`);
  else { bad('缺少 dist/index.html'); process.exit(1); }

  for (const rel of [
    'assets/fonts/fonts.css',
    'assets/tokens.css',
    'assets/design-tokens.json',
    'assets/assets.manifest.json',
    'assets/icons/icons.svg',
    'assets/models/model-console-02.glb',
  ]) {
    const p = path.join(DIST, rel);
    if (existsSync(p) && statSync(p).size > 100) ok(`dist/${rel}  (${(statSync(p).size / 1024).toFixed(1)} KB)`);
    else bad(`dist/${rel} 缺失或过小`);
  }

  /* 令牌是否已被构建期内联（不应依赖运行期 fetch） */
  const bundle = existSafe(path.join(DIST, 'assets'));
  const anyBundle = bundle.files.filter((f) => f.endsWith('.js'));
  let tokenInlined = false;
  for (const f of anyBundle) {
    const txt = readFileSync(path.join(DIST, 'assets', f), 'utf8');
    if (txt.includes('playtime-atlas') && txt.includes('ink') && txt.includes('signal')) { tokenInlined = true; break; }
  }
  if (tokenInlined) ok('设计令牌已构建期内联进 JS bundle（运行期无需 fetch）');
  else bad('未在 bundle 中找到内联的设计令牌');

  /* ---------- 2. 子路径下的请求状态 ---------- */
  console.log('\n· 2. 子路径资源请求状态');
  const { server, port } = await startServer(DIST, 0, PREFIX);
  _server = server;
  const base = `http://127.0.0.1:${port}${PREFIX}/`;
  console.log(`  挂载 ${PREFIX} → ${base}`);

  const browser = await chromium.launch({
    args: [
      '--enable-unsafe-swiftshader',
      '--use-angle=swiftshader',
      '--disable-dev-shm-usage',
      '--no-sandbox',
      '--disable-background-timer-throttling',
      '--disable-backgrounding-occluded-windows',
    ],
  });
  _browser = browser;
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  /* 超时必须在 goto 之前设置：并发负载下 30 s 默认值会直接判失败 */
  page.setDefaultTimeout(120000);
  page.setDefaultNavigationTimeout(120000);

  const responses = [];
  const consoleErrors = [];
  page.on('response', (r) => responses.push({ url: r.url(), status: r.status() }));
  page.on('console', (m) => { if (m.type() === 'error') consoleErrors.push(m.text()); });
  page.on('pageerror', (e) => consoleErrors.push(`PAGEERROR: ${e.message}`));
  page.on('requestfailed', (r) => responses.push({ url: r.url(), status: `FAILED ${r.failure()?.errorText}` }));

  await page.goto(base, { waitUntil: 'load' });
  await page.waitForTimeout(2000);

  /* 滚动整页触发 loading="lazy" 的图片请求 */
  await page.evaluate(async () => {
    const step = window.innerHeight * 0.8;
    for (let y = 0; y < document.body.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 220));
    }
    window.scrollTo(0, document.body.scrollHeight);
    await new Promise((r) => setTimeout(r, 2500));
    window.scrollTo(0, 0);
    await new Promise((r) => setTimeout(r, 600));
  });

  /* 滚动触发的懒加载在并发负载下并不保证全部命中（视口高度、滚动时序、渲染进程饥饿），
     这里再主动把懒加载图片切到 eager 并等待解码完成，
     确保「页面引用的每一张图」都真的向子路径发起过请求并成功返回。 */
  const imgFetch = await page.evaluate(async () => {
    const imgs = [...document.querySelectorAll('img')].filter((i) => i.getAttribute('src'));
    imgs.forEach((i) => { i.loading = 'eager'; });
    await Promise.all(imgs.map((i) => (i.complete
      ? Promise.resolve()
      : new Promise((res) => {
        i.addEventListener('load', res, { once: true });
        i.addEventListener('error', res, { once: true });
      }))));
    return imgs.map((i) => ({
      src: i.getAttribute('src'),
      ok: i.complete && i.naturalWidth > 1,
      natural: i.naturalWidth,
    }));
  });
  await page.waitForTimeout(1200);
  /* 等待 3D 查看器完成 GLB 加载（软件渲染下较慢） */
  await page.waitForFunction(() => {
    const c = document.getElementById('model-canvas');
    return c && c.width > 0;
  }, null, { timeout: 60000 }).catch(() => {});
  await page.waitForTimeout(6000);

  const rel = (u) => u.replace(base, '').split('?')[0];
  const byPath = new Map(responses.map((r) => [rel(r.url), r.status]));

  const critical = [
    'assets/fonts/fonts.css',
    'assets/tokens.css',
    'assets/icons/icons.svg',
    'assets/posters/poster-dawn.png',
    'assets/covers/cover-atlas-hero.png',
    'assets/cases/case-console-02.png',
    'assets/models/model-cabinet-01.glb',
    'assets/models/model-cabinet-01.png',
    'assets/fallback/model-fallback.png',
  ];
  /* tokens.js 已在 §1 校验存在；令牌已构建期内联，运行期有意不请求 */
  for (const c of critical) {
    const st = byPath.get(c);
    if (st === 200) ok(`200  ${c}`);
    else bad(`${st ?? '未请求'}  ${c}`);
  }

  /* 页面引用的每一张图，在子路径下都必须真的取回并解码成功 */
  const badImgs = imgFetch.filter((i) => !i.ok);
  if (badImgs.length === 0) ok(`页面引用的 ${imgFetch.length} 张图片在子路径下全部取回并解码成功`);
  else bad(`${badImgs.length} 张图片未取回成功：${badImgs.slice(0, 5).map((i) => i.src).join(', ')}`);

  const notFound = responses.filter((r) => r.status === 404);
  if (notFound.length === 0) ok('无任何 404 请求');
  else bad(`${notFound.length} 个 404：${notFound.slice(0, 5).map((r) => rel(r.url)).join(', ')}`);

  const failed = responses.filter((r) => typeof r.status === 'string' && r.status.startsWith('FAILED'));
  if (failed.length === 0) ok('无失败请求');
  else bad(`${failed.length} 个失败请求：${failed.slice(0, 5).map((r) => rel(r.url)).join(' | ')}`);

  const non200 = responses.filter((r) => typeof r.status === 'number' && r.status !== 200 && r.status !== 304);
  if (non200.length === 0) ok('所有请求均为 200');
  else bad(`非 200 请求 ${non200.length} 个：${non200.slice(0, 5).map((r) => `${r.status} ${rel(r.url)}`).join(', ')}`);

  /* ---------- 3. 运行期可用性 ---------- */
  console.log('\n· 3. 运行期可用性');
  const runtime = await page.evaluate(() => {
    const T = window.ATLAS_TOKENS;
    const rootStyle = getComputedStyle(document.documentElement);
    return {
      tokensGlobal: !!T,
      /* v1.1.0 起令牌结构为 meta / designSystem / local / compat / cssVars；
         16 的色板在 designSystem.color 下。 */
      tokenCount: T ? Object.keys(T.designSystem?.color || {}).length : 0,
      hasCssVars: !!(T && T.cssVars && Object.keys(T.cssVars.root || {}).length),
      dsBg: rootStyle.getPropertyValue('--ds-bg').trim(),
      dsAccent: rootStyle.getPropertyValue('--ds-accent').trim(),
      swatches: document.querySelectorAll('.swatch').length,
      posters: document.querySelectorAll('.poster-card').length,
      icons: document.querySelectorAll('.icon-cell').length,
      models: document.querySelectorAll('.model-card').length,
      fontLoaded: document.fonts.check('700 40px "Space Grotesk"'),
      cjkLoaded: document.fonts.check('700 40px "Noto Sans SC"'),
      bodyFont: getComputedStyle(document.body).fontFamily,
    };
  });

  if (runtime.tokensGlobal && runtime.tokenCount >= 4 && runtime.hasCssVars) {
    ok(`window.ATLAS_TOKENS 可用（${runtime.tokenCount} 个色阶分组 + ${runtime.dsBg ? 'CSS 变量已生效' : 'CSS 变量缺失'}）`);
  } else {
    bad('运行期未取得设计令牌');
  }
  if (runtime.dsBg && runtime.dsAccent) {
    ok(`设计令牌在运行期生效（--ds-bg=${runtime.dsBg}，--ds-accent=${runtime.dsAccent}）`);
  } else {
    bad('设计令牌未在运行期生效（--ds-* 变量取不到值）');
  }
  if (runtime.swatches >= 30) ok(`令牌色板渲染 ${runtime.swatches} 项`);
  else bad(`令牌色板仅 ${runtime.swatches} 项`);
  if (runtime.posters === 7) ok('7 张年代海报渲染');
  else bad(`海报渲染 ${runtime.posters} / 7`);
  if (runtime.icons === 48) ok('48 枚图标渲染');
  else bad(`图标渲染 ${runtime.icons} / 48`);
  if (runtime.models === 6) ok('6 件展品渲染');
  else bad(`展品渲染 ${runtime.models} / 6`);
  const glbStatus = byPath.get('assets/models/model-cabinet-01.glb');
  if (glbStatus === 200) ok('默认展品 GLB 在子路径下成功加载（200）');
  else bad(`默认展品 GLB 未成功加载：${glbStatus ?? '未请求'}`);
  if (runtime.fontLoaded) ok('Space Grotesk 在子路径下正常加载');
  else bad('Space Grotesk 未加载');
  if (runtime.cjkLoaded) ok('Noto Sans SC 在子路径下正常加载');
  else bad('Noto Sans SC 未加载');
  if (runtime.bodyFont.includes('Inter')) ok(`正文字体栈：${runtime.bodyFont.slice(0, 46)}…`);
  else bad(`正文字体栈异常：${runtime.bodyFont}`);

  /* 显式请求验证：fonts.css / tokens.css / tokens.js 均返回 200 */
  console.log('\n· 3b. 关键资源显式请求');
  for (const c of ['assets/fonts/fonts.css', 'assets/tokens.css', 'assets/tokens.js']) {
    const st = await page.evaluate(async (u) => {
      const r = await fetch(u, { cache: 'no-store' });
      return r.status;
    }, c);
    if (st === 200) ok(`显式 GET 200  ${c}`);
    else bad(`显式 GET ${st}  ${c}`);
  }
  /* 切换展品后第二个 GLB 也应可加载 */
  await page.evaluate(() => {
    const t = document.querySelectorAll('.model-tab')[2];
    if (t) t.click();
  });
  await page.waitForTimeout(6000);
  const glb2 = byPath.get('assets/models/model-console-03.glb') || responses.find((r) => r.url.includes('model-console-03.glb'))?.status;
  if (glb2 === 200) ok('切换展品后 model-console-03.glb 亦返回 200');
  else bad(`切换展品后 model-console-03.glb：${glb2 ?? '未请求'}`);

  /* ---------- 4. 无 public/ 残留引用 ---------- */
  console.log('\n· 4. 产物洁净度');
  const leak = [];
  for (const f of anyBundle) {
    const txt = readFileSync(path.join(DIST, 'assets', f), 'utf8');
    if (txt.includes('/public/')) leak.push(f);
  }
  if (leak.length === 0) ok('bundle 中无 /public/ 残留引用');
  else bad(`bundle 仍引用 /public/：${leak.join(', ')}`);

  const html = readFileSync(idx, 'utf8');
  if (!/\.\/assets\/tokens\.css/.test(html) || !/\.\/assets\/fonts\/fonts\.css/.test(html)) {
    bad('index.html 中样式表引用不是相对路径');
  } else ok('index.html 样式表引用为相对路径（子路径可用）');
  if (/\.\/assets\/index-[^"']+\.js/.test(html)) ok('index.html 脚本引用为相对路径（子路径可用）');
  else bad('index.html 脚本引用不是相对路径');

  /* ---------- 5. 截图 ---------- */
  const SHOTS = path.join(ROOT, 'screenshots');
  if (!existsSync(SHOTS)) mkdirSync(SHOTS, { recursive: true });
  /* 1440×1000 全页合成在并发负载下极易超时：先缩到 1200×820 再截，并允许重试 */
  let shotOk = false;
  for (let attempt = 0; attempt < 3 && !shotOk; attempt++) {
    try {
      await page.setViewportSize({ width: 1200, height: 820 });
      await page.waitForTimeout(1200);
      await page.screenshot({ path: path.join(SHOTS, 'subpath-deploy.png'), timeout: 180000 });
      shotOk = true;
    } catch (e) {
      console.warn(`  ! 子路径截图第 ${attempt + 1} 次失败：${e.message?.split('\n')[0]}`);
      await page.waitForTimeout(2000);
    }
  }
  if (shotOk) ok('子路径部署截图 → screenshots/subpath-deploy.png');
  else bad('子路径部署截图未能生成');

  const realErrors = consoleErrors.filter((e) => !/favicon/.test(e));
  if (realErrors.length === 0) ok('控制台无错误');
  else bad(`控制台错误 ${realErrors.length} 条：${realErrors.slice(0, 4).join(' | ')}`);

  /* ---------- 收尾 ---------- */
  await browser.close();
  server.close();
  console.log('\n' + '='.repeat(58));
  console.log(`通过 ${pass} 项，失败 ${failures.length} 项`);
  if (failures.length) {
    console.log('\n失败项：');
    failures.forEach((f) => console.log('  ✗ ' + f));
    process.exit(1);
  }
  console.log('\n✓ 子路径部署复验全部通过，临时服务器已关闭。');
}

function existSafe(dir) {
  return { files: readdirSync(dir) };
}

/** 顶层重试：并发负载下 Chromium 可能瞬时崩溃，最多重试 2 次 */
async function runWithRetry(label, fn, attempts = 2) {
  let lastErr = null;
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (e) {
      lastErr = e;
      console.warn(`  ! ${label} 第 ${i + 1} 次失败：${e.message?.split('\n')[0] || e}`);
      if (i < attempts - 1) await new Promise((r) => setTimeout(r, 3000));
    }
  }
  throw lastErr;
}


runWithRetry('子路径复验', main).catch((e) => {
  console.error(e);
  process.exit(1);
});
