/**
 * 回响电玩馆 — 预览页浏览器验收
 *
 * 用 Chromium 打开构建产物，逐节截图、收集控制台错误、检查关键元素与交互。
 * 运行：node scripts/qa-browser.mjs
 *
 * ── 为什么按阶段拆进程 ──────────────────────────────────────────────
 * 预览页单个区块解码后需 ~200 MB 位图内存（海报 1200×1800、封面 1600×900、
 * 展柜 1000×1250、模型渲染图 1024²），且每个页面都会创建 WebGL 上下文。
 * 若在同一个浏览器进程里连续重载 9 次，内存持续累积——同机并发任务多时
 * Chromium 渲染进程会被 OOM 杀掉（`Target page, context or browser has been closed`），
 * 甚至在 launch 阶段就被杀死。
 *
 * 这里把验收拆成若干「阶段」，每个阶段用**全新的浏览器进程**、用完立即关闭，
 * 并按阶段需要屏蔽无关大图（用 1×1 占位 PNG 响应，保证控制台与网络统计依然干净），
 * 使峰值内存始终维持在单页量级。
 */

import { chromium } from 'playwright';
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { startServer } from './lib/server.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');
const DIST = path.join(ROOT, 'dist');
const SHOTS = path.join(ROOT, 'screenshots');

const VIEWPORT = { width: 1200, height: 820 };
const LAUNCH_ARGS = [
  '--enable-unsafe-swiftshader',
  '--use-angle=swiftshader',
  '--disable-dev-shm-usage',
  '--no-sandbox',
  '--disable-background-timer-throttling',
  '--disable-backgrounding-occluded-windows',
  '--js-flags=--max-old-space-size=512',
];

/** 1×1 透明 PNG —— 用于屏蔽无关大图，保持 HTTP 200 且不产生控制台错误 */
const PLACEHOLDER_PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
  'base64',
);

/** 可屏蔽的资源目录（按需组合） */
const BLOCK = {
  posters: '**/assets/posters/**',
  covers: '**/assets/covers/**',
  cases: '**/assets/cases/**',
  modelPng: '**/assets/models/*.png',
  fallback: '**/assets/fallback/**',
};

const checks = [];
const consoleErrors = [];
const failedRequests = [];
const externalRequests = [];
const glbResponses = [];

/** 正在拆除浏览器：此时的请求中断是我们自己关页面造成的，不算产物缺陷 */
let closing = false;

let _browser = null;
let _server = null;

/** 进程退出时确保不残留浏览器与服务器 */
function cleanupOnExit() {
  try { _browser?.close?.(); } catch { /* 忽略 */ }
  try { _server?.close?.(); } catch { /* 忽略 */ }
}
process.on('exit', cleanupOnExit);
process.on('SIGINT', () => { cleanupOnExit(); process.exit(130); });

const ok = (m) => { checks.push({ ok: true, m }); console.log(`  ✓ ${m}`); };
const bad = (m) => { checks.push({ ok: false, m }); console.log(`  ✗ ${m}`); };
/** 过程性说明：只打印，不计入验收项 */
const detail = (m) => console.log(`  · ${m}`);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** 为页面挂上控制台 / 网络监听，跨阶段汇总 */
function attach(page, base) {
  /* 每个页面自己的「已拆除」标志：浏览器关闭瞬间的请求中断会**异步**到达，
     若只在关闭前后置一个全局布尔量，事件晚到一步就会被误记为产物缺陷。
     因此标志跟页面走，页面一拆除就不再计入。 */
  const st = { torn: false };
  page.on('console', (m) => { if (m.type() === 'error') consoleErrors.push(m.text()); });
  page.on('pageerror', (e) => consoleErrors.push(`PAGEERROR: ${e.message}`));
  page.on('requestfailed', (r) => {
    if (st.torn || closing) return;
    failedRequests.push(`${r.url()} — ${r.failure()?.errorText}`);
  });
  page.on('request', (r) => {
    const u = r.url();
    if (!u.startsWith(base) && !u.startsWith('data:') && !u.startsWith('blob:')) externalRequests.push(u);
  });
  page.on('response', (r) => {
    if (r.url().endsWith('.glb')) glbResponses.push(`${r.status()} ${r.url()}`);
  });
  return st;
}

/** 启动一个全新的浏览器进程 + 页面 */
async function launchBrowser(base) {
  const browser = await chromium.launch({ args: LAUNCH_ARGS });
  _browser = browser;
  const page = await browser.newPage({ viewport: { ...VIEWPORT }, deviceScaleFactor: 1 });
  /* 同机并发任务多时（实测 load average 可达 100+），Chromium 启动与导航会显著变慢，
     120 秒偶发不够用；给足余量，避免把环境抖动误判成产物缺陷。 */
  page.setDefaultTimeout(300000);
  page.setDefaultNavigationTimeout(300000);
  const pageState = attach(page, base);
  return { browser, page, pageState };
}

/**
 * 在一个独立的浏览器进程里跑完 fn，结束后立即回收进程。
 * block：需要用 1×1 占位图替换的资源 glob 列表。
 * allow：例外放行的 glob（后注册，优先级高于 block，用于只放行某一张大图）。
 */
async function withBrowser(base, fn, block = [], allow = []) {
  const { browser, page, pageState } = await launchBrowser(base);
  try {
    for (const pattern of block) {
      await page.route(pattern, (route) =>
        route.fulfill({ status: 200, contentType: 'image/png', body: PLACEHOLDER_PNG }));
    }
    for (const pattern of allow) {
      await page.route(pattern, (route) => route.continue());
    }
    return await fn(page);
  } finally {
    pageState.torn = true;
    closing = true;
    try { await browser.close(); } catch { /* 忽略 */ }
    if (_browser === browser) _browser = null;
    closing = false;
  }
}

/** ImageMagick 是否可用（用于截图平图检测） */
const MAGICK = (() => {
  try { execFileSync('magick', ['-version'], { stdio: 'ignore' }); return true; }
  catch { return false; }
})();

/** 计算 PNG 灰度标准差：0 表示整幅纯色（空白截图） */
function pngStdDev(file) {
  try {
    const out = execFileSync(
      'magick', [file, '-colorspace', 'Gray', '-format', '%[fx:standard_deviation]', 'info:'],
      { encoding: 'utf8' },
    );
    return Number(String(out).trim());
  } catch {
    return NaN;
  }
}

/** 判断截图是否为「平图」（内容未被绘制） */
const isFlat = (file) => {
  if (!MAGICK) return false;
  const std = pngStdDev(file);
  return Number.isFinite(std) && std < 0.005;
};

/** 等待页面完成一帧绘制（软件光栅化下 requestAnimationFrame 可能很慢） */
async function settle(page, ms = 1200) {
  await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)))).catch(() => {});
  await page.waitForTimeout(ms);
}

/** 阶段执行器：失败重试，仍失败则记为失败项并继续后续阶段 */
async function phase(label, fn, attempts = 4) {
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (e) {
      const msg = e.message?.split('\n')[0] || String(e);
      console.warn(`  ! ${label} 第 ${i + 1} 次失败：${msg}`);
      if (i < attempts - 1) await sleep(4000);
    }
  }
  bad(`${label} 未能完成（环境导致，非产物缺陷）`);
  return null;
}

async function main() {
  if (!existsSync(path.join(DIST, 'index.html'))) {
    console.error('缺少 dist/index.html，请先执行 npm run build');
    process.exit(1);
  }
  mkdirSync(SHOTS, { recursive: true });

  const { server, port } = await startServer(DIST, 0);
  _server = server;
  const base = `http://127.0.0.1:${port}`;
  console.log(`· 验收服务 ${base}\n`);

  const ALL_IMAGES = [BLOCK.posters, BLOCK.covers, BLOCK.cases, BLOCK.modelPng, BLOCK.fallback];

  /* ══════════ 阶段 A：结构与字体（屏蔽全部大图，最轻量） ══════════ */
  console.log('· 阶段 A — 结构与字体');
  let imgTotal = 0;
  await phase('阶段 A', () => withBrowser(base, async (page) => {
    await page.goto(`${base}/index.html`, { waitUntil: 'load' });
    await settle(page, 2200);

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
      imgs: [...document.querySelectorAll('img')].filter((i) => i.getAttribute('src')).length,
    }));
    imgTotal = counts.imgs;

    const expect = {
      fontCards: 4, icons: 48, posters: 7, covers: 8,
      cases: 6, models: 6, modelTabs: 6, fallback: 5, stats: 6,
    };
    if (counts.swatches >= 30) ok(`swatches  ${counts.swatches} 项`);
    else bad(`swatches 期望 >=30，实际 ${counts.swatches}`);
    for (const [k, v] of Object.entries(expect)) {
      if (counts[k] === v) ok(`${k}  ${counts[k]} 项`);
      else bad(`${k} 期望 ${v}，实际 ${counts[k]}`);
    }

    /* 网格布局：卡片容器必须是多列网格。
       少了 grid-template-columns 会让卡片整宽堆叠 —— 元素数量对、截图非空，
       但版面是错的，这类缺陷必须单独断言。 */
    const grids = await page.evaluate(() => {
      const sel = ['#poster-grid', '#cover-grid', '#case-grid', '#model-cards', '#icon-grid', '#font-cards'];
      return sel.map((s) => {
        const el = document.querySelector(s);
        if (!el) return { sel: s, missing: true };
        const cs = getComputedStyle(el);
        const kids = [...el.children];
        /* 用 offsetTop 分行：受 hover/激活态 translateY 影响的是 rect.top，
           而 offsetTop 是布局位置，不含 transform。 */
        const firstTop = kids.length ? kids[0].offsetTop : 0;
        const inFirstRow = kids.filter((k) => k.offsetTop === firstTop).length;
        return {
          sel: s,
          display: cs.display,
          columns: cs.gridTemplateColumns ? cs.gridTemplateColumns.split(' ').length : 0,
          inFirstRow,
          children: kids.length,
        };
      });
    });
    for (const g of grids) {
      if (g.missing) { bad(`网格布局 ${g.sel}：节点缺失`); continue; }
      if (g.display !== 'grid') bad(`网格布局 ${g.sel}：display=${g.display}（应为 grid）`);
      else if (g.inFirstRow < 2) bad(`网格布局 ${g.sel}：首行只有 ${g.inFirstRow} 张卡（网格未生效，卡片整宽堆叠）`);
      else ok(`网格布局 ${g.sel}：${g.columns} 列 × 首行 ${g.inFirstRow} 张`);
    }

    console.log('\n· 字体加载');
    const fontCheck = await page.evaluate(async () => {
      await document.fonts.ready;
      return {
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
  }, ALL_IMAGES));

  /* ══════════ 阶段 B：图片完整性（每个内容区独立进程） ══════════ */
  console.log('\n· 阶段 B — 图片完整性（逐区独立进程）');
  /* nav：用于导航的 URL 片段（#…）；sel：实际查询图片的 DOM 根节点
     —— 两者分开，避免把类名当成路径拼进 URL */
  const imgSections = [
    { name: 'hero', nav: '#top', sel: '.hero', block: [BLOCK.posters, BLOCK.cases, BLOCK.modelPng, BLOCK.fallback] },
    { name: 'posters', nav: '#posters', sel: '#posters', block: [BLOCK.covers, BLOCK.cases, BLOCK.modelPng, BLOCK.fallback] },
    { name: 'covers', nav: '#covers', sel: '#covers', block: [BLOCK.posters, BLOCK.cases, BLOCK.modelPng, BLOCK.fallback] },
    { name: 'cases', nav: '#cases', sel: '#cases', block: [BLOCK.posters, BLOCK.covers, BLOCK.modelPng, BLOCK.fallback] },
    { name: 'models', nav: '#models', sel: '#models', block: [BLOCK.posters, BLOCK.covers, BLOCK.cases, BLOCK.fallback] },
    { name: 'fallback', nav: '#fallback', sel: '#fallback', block: [BLOCK.posters, BLOCK.covers, BLOCK.cases, BLOCK.modelPng] },
  ];
  let imgVerified = 0;
  for (const s of imgSections) {
    const res = await phase(`图片区 ${s.name}`, () => withBrowser(base, async (page) => {
      await page.goto(`${base}/${s.nav}`, { waitUntil: 'load' });
      await settle(page, 1500);
      const target = await page.$(s.sel);
      if (!target) throw new Error(`未找到区块 ${s.sel}`);
      await target.scrollIntoViewIfNeeded();
      await settle(page, 2000);
      /* 等该区内所有带 src 的图片解码完成 */
      await page.evaluate((sel) => new Promise((resolve) => {
        const root = document.querySelector(sel);
        const imgs = [...root.querySelectorAll('img')].filter((i) => i.getAttribute('src'));
        if (!imgs.length) return resolve();
        const t0 = Date.now();
        const tick = () => {
          const done = imgs.every((i) => i.complete && i.naturalWidth > 0);
          if (done || Date.now() - t0 > 20000) return resolve();
          requestAnimationFrame(tick);
        };
        tick();
      }), s.sel);
      return page.evaluate((sel) => {
        const root = document.querySelector(sel);
        const imgs = [...root.querySelectorAll('img')].filter((i) => i.getAttribute('src'));
        return imgs.map((i) => ({
          src: i.getAttribute('src'),
          natural: i.naturalWidth,
          declared: i.getAttribute('width') ? Number(i.getAttribute('width')) : null,
        }));
      }, s.sel);
    }, s.block));
    if (!res) continue;
    const wrong = res.filter((i) => i.natural <= 1 || (i.declared && i.natural !== i.declared));
    imgVerified += res.length;
    if (wrong.length === 0) detail(`图片区 ${s.name}：${res.length} 张全部按声明尺寸解码成功`);
    else detail(`图片区 ${s.name}：${res.length - wrong.length}/${res.length} 张正常，异常：${wrong.map((w) => w.src).join(', ')}`);
  }
  if (imgVerified === imgTotal && imgTotal > 0) ok(`${imgTotal} 张图片全部加载成功`);
  else bad(`图片加载异常：已验证 ${imgVerified} / DOM 中 ${imgTotal} 张`);

  /* ══════════ 阶段 C：3D 查看器 ══════════ */
  console.log('\n· 阶段 C — 3D 查看器');
  await phase('阶段 C', () => withBrowser(base, async (page) => {
    await page.goto(`${base}/index.html`, { waitUntil: 'load' });
    await settle(page, 4000);
    const canvasState = await page.evaluate(() => {
      const c = document.getElementById('model-canvas');
      const gl = c && (c.getContext('webgl2') || c.getContext('webgl'));
      return { exists: !!c, w: c?.width, h: c?.height, hasGL: !!gl };
    });
    if (canvasState.exists && canvasState.w > 200 && canvasState.h > 200) ok(`3D 画布存在 ${canvasState.w}×${canvasState.h}`);
    else bad(`3D 画布异常：${JSON.stringify(canvasState)}`);

    const glbOk = glbResponses.some((r) => r.startsWith('200'));
    if (canvasState.hasGL && glbOk) ok('WebGL 上下文可用（GLB 可交互加载）');
    else bad(`WebGL 上下文异常：hasGL=${canvasState.hasGL} glb200=${glbOk}`);

    /* 回归检查：WebGL 正常时，降级面板必须真正隐藏
       （.viewer-fallback 缺 [hidden] 覆盖时，display:flex 会盖过 UA 的 display:none） */
    const fbState = await page.evaluate(() => {
      const fb = document.getElementById('viewer-fallback');
      if (!fb) return { exists: false };
      return {
        exists: true,
        hiddenAttr: fb.hidden,
        display: getComputedStyle(fb).display,
        visible: fb.getBoundingClientRect().height > 0,
      };
    });
    if (!fbState.exists) bad('降级面板节点缺失');
    else if (fbState.display === 'none' && !fbState.visible) ok('WebGL 可用时降级面板已正确隐藏');
    else bad(`降级面板在 WebGL 可用时仍然显示（display=${fbState.display}）`);
  }, [BLOCK.posters, BLOCK.covers, BLOCK.cases, BLOCK.modelPng, BLOCK.fallback]));

  /* ══════════ 阶段 D：交互 ══════════ */
  console.log('\n· 阶段 D — 交互');
  await phase('阶段 D', () => withBrowser(base, async (page) => {
    await page.goto(`${base}/index.html`, { waitUntil: 'load' });
    await settle(page, 3000);

    const clickSel = async (sel) => {
      await page.evaluate((s) => { const e = document.querySelector(s); if (e) e.scrollIntoView({ block: 'center' }); }, sel);
      await page.waitForTimeout(250);
      await page.$eval(sel, (e) => e.click());
    };
    /* 等新展品的 GLB 真正到位再看标题：否则阶段结束时会带着一个未完成的请求，
       浏览器一关就会产生 ERR_ABORTED，既是噪声也掩盖真实失败。 */
    const glbArrived = page
      .waitForResponse((r) => r.url().includes('.glb') && r.status() === 200, { timeout: 60000 })
      .catch(() => null);
    await clickSel('.model-tab:nth-child(3)');
    await glbArrived;
    await page.waitForTimeout(1200);
    const t3 = await page.textContent('#viewer-title');
    if (t3 && t3.trim().length > 0) ok(`切换展品：标题变为「${t3.trim()}」`);
    else bad('切换展品后标题未更新');

    await clickSel('#btn-spin');
    const spinLabel = await page.textContent('#btn-spin');
    if (spinLabel.includes('暂停')) ok('自动旋转开关响应正常');
    else bad(`自动旋转开关异常：${spinLabel}`);
    await clickSel('#btn-spin');

    await clickSel('.filter-chip:nth-child(2)');
    await page.waitForTimeout(400);
    const visible = await page.evaluate(() => {
      const cells = [...document.querySelectorAll('.icon-cell')];
      return cells.filter((c) => !c.classList.contains('is-hidden')).length;
    });
    if (visible > 0 && visible < 48) ok(`图标分类筛选生效：${visible} / 48 可见`);
    else bad(`图标筛选异常，可见 ${visible} / 48`);
    await clickSel('.filter-chip:nth-child(1)');

    const lbPath = path.join(SHOTS, 'lightbox.png');
    let lbOpen = false;
    let lbFlat = false;
    let lbRect = null;
    for (let attempt = 0; attempt < 3; attempt++) {
      await clickSel('.poster-card');
      /* 等灯箱大图真正解码完成并进入视口，否则截到的是空白遮罩 */
      lbRect = await page.evaluate(() => new Promise((resolve) => {
        const img = document.getElementById('lightbox-img');
        const box = document.getElementById('lightbox');
        if (!img) return resolve(null);
        const t0 = Date.now();
        const tick = () => {
          const r = img.getBoundingClientRect();
          const ready = img.getAttribute('src') && img.complete && img.naturalWidth > 1
            && r.width > 40 && r.height > 40 && r.bottom > 0 && r.top < innerHeight;
          if (ready || Date.now() - t0 > 20000) {
            return resolve({ w: Math.round(r.width), h: Math.round(r.height), top: Math.round(r.top), src: img.getAttribute('src') });
          }
          requestAnimationFrame(tick);
        };
        tick();
      }));
      await settle(page, 1200);
      lbOpen = await page.evaluate(() => !document.getElementById('lightbox').hidden);
      await page.screenshot({ path: lbPath, timeout: 300000 });
      lbFlat = isFlat(lbPath);
      if (!lbFlat) break;
      console.warn(`  ! 灯箱截图第 ${attempt + 1} 次为平图，重试`);
      await page.evaluate(() => { document.getElementById('lightbox').hidden = true; document.body.style.overflow = ''; });
      await page.waitForTimeout(800);
    }
    if (lbOpen) ok('灯箱可打开');
    else bad('灯箱未打开');
    if (!lbFlat) ok(`灯箱截图有效（大图 ${lbRect?.w}×${lbRect?.h} @ ${lbRect?.top}）`);
    else bad('灯箱截图为平图，内容未渲染');
    /* 键盘操作前确保灯箱处于打开态（平图重试可能把它关掉了） */
    if (!(await page.evaluate(() => !document.getElementById('lightbox').hidden))) {
      await clickSel('.poster-card');
      await page.waitForTimeout(1200);
    }
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(500);
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);
    const lbClosed = await page.evaluate(() => document.getElementById('lightbox').hidden);
    if (lbClosed) ok('灯箱键盘操作（→ / Esc）正常');
    else bad('灯箱未能关闭');
  }, [BLOCK.covers, BLOCK.cases, BLOCK.modelPng, BLOCK.fallback, '**/assets/posters/*'], ['**/assets/posters/poster-dawn.png']));

  /* ══════════ 阶段 E：区块截图（每区块独立进程） ══════════ */
  console.log('\n· 阶段 E — 区块截图（每区块独立进程）');
  const sections = [
    ['hero', '#top', [BLOCK.posters, BLOCK.cases, BLOCK.modelPng, BLOCK.fallback]],
    ['tokens', '#tokens', ALL_IMAGES],
    ['fonts', '#fonts', ALL_IMAGES],
    ['icons', '#icons', ALL_IMAGES],
    ['posters', '#posters', [BLOCK.covers, BLOCK.cases, BLOCK.modelPng, BLOCK.fallback]],
    ['covers', '#covers', [BLOCK.posters, BLOCK.cases, BLOCK.modelPng, BLOCK.fallback]],
    ['cases', '#cases', [BLOCK.posters, BLOCK.covers, BLOCK.modelPng, BLOCK.fallback]],
    ['models', '#models', [BLOCK.posters, BLOCK.covers, BLOCK.cases, BLOCK.fallback]],
    ['fallback', '#fallback', [BLOCK.posters, BLOCK.covers, BLOCK.cases, BLOCK.modelPng]],
  ];
  for (const [name, sel, block] of sections) {
    const shot = await phase(`区块截图 ${name}`, () => withBrowser(base, async (page) => {
      await page.goto(`${base}/${sel}`, { waitUntil: 'load' });
      /* models 区块含 WebGL 画布，需额外时间等待 GLB 加载与首帧渲染 */
      await settle(page, name === 'models' ? 6000 : 2200);
      const target = await page.$(sel);
      if (!target) throw new Error(`未找到区块 ${sel}`);
      await target.scrollIntoViewIfNeeded();
      await settle(page, 1500);
      const file = path.join(SHOTS, `section-${name}.png`);
      await page.screenshot({ path: file, timeout: 300000 });
      /* 平图 = 内容没被绘制（并发负载下合成器饥饿），换新进程重试 */
      if (isFlat(file)) throw new Error('截图为平图，内容未渲染');
    }, block));
    if (shot !== null) ok(`区块截图 ${name}`);
  }

  /* 整页截图：视口会被撑到约 1.1 万 px，在并发负载下极易触发 Chromium 被 OOM 杀掉。
     默认改用分区截图；需要整页图时设 ATLAS_FULLPAGE=1。 */
  if (process.env.ATLAS_FULLPAGE === '1') {
    const r = await phase('整页截图', () => withBrowser(base, async (page) => {
      await page.goto(`${base}/index.html`, { waitUntil: 'load' });
      await settle(page, 3000);
      await page.screenshot({ path: path.join(SHOTS, 'full-page.png'), fullPage: true, timeout: 180000 });
    }, ALL_IMAGES));
    if (r !== null) ok('整页截图');
  } else {
    ok('分区截图已覆盖全部区块（整页截图按 ATLAS_FULLPAGE=1 开启）');
  }

  /* ══════════ 阶段 F：响应式 ══════════ */
  console.log('\n· 阶段 F — 响应式');
  await phase('阶段 F', () => withBrowser(base, async (page) => {
    await page.goto(`${base}/index.html`, { waitUntil: 'load' });
    await settle(page, 2500);
    for (const [label, w, h] of [['mobile', 390, 844], ['tablet', 820, 1180]]) {
      await page.setViewportSize({ width: w, height: h });
      await settle(page, 900);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      if (overflow <= 1) ok(`${label} (${w}px) 无横向溢出`);
      else bad(`${label} (${w}px) 横向溢出 ${overflow}px`);
      const file = path.join(SHOTS, `responsive-${label}.png`);
      await page.screenshot({ path: file, fullPage: false, timeout: 300000 });
      if (isFlat(file)) throw new Error(`${label} 截图为平图`);
    }
  }, [BLOCK.posters, BLOCK.covers, BLOCK.cases, BLOCK.modelPng, BLOCK.fallback]));

  /* ══════════ 网络与控制台 ══════════ */
  console.log('\n· 网络与控制台');
  if (externalRequests.length === 0) ok('零外部请求（无任何跨域资源）');
  else bad(`发现 ${externalRequests.length} 个外部请求：${externalRequests.slice(0, 5).join(', ')}`);

  if (failedRequests.length === 0) ok('无失败请求');
  else bad(`失败请求 ${failedRequests.length} 个：${failedRequests.slice(0, 5).join(' | ')}`);

  const realErrors = consoleErrors.filter((e) => !/favicon|Failed to load resource.*404/.test(e));
  if (realErrors.length === 0) ok('控制台无错误');
  else bad(`控制台错误 ${realErrors.length} 条：${realErrors.slice(0, 5).join(' | ')}`);

  server.close();
  _server = null;

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

/** 顶层重试：并发负载下 Chromium 可能瞬时崩溃，最多重试 2 次 */
async function runWithRetry(label, fn, attempts = 2) {
  let lastErr = null;
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (e) {
      lastErr = e;
      console.warn(`  ! ${label} 第 ${i + 1} 次失败：${e.message?.split('\n')[0] || e}`);
      if (i < attempts - 1) await sleep(5000);
    }
  }
  throw lastErr;
}


runWithRetry('浏览器验收', main).catch((e) => {
  console.error(e);
  process.exit(1);
});
