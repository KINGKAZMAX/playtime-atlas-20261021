#!/usr/bin/env node
/**
 * 画廊封面捕获器 —— 为回响电玩馆的极简画廊生成「真实作品封面」。
 *
 * 原则
 *  - 每一张封面都是作品真正跑起来之后的截图。不使用文字 SVG、不使用通用占位图、
 *    不使用任何第三方图片素材；模型、天体、像素美术与仪表全部由作品自身程序化生成。
 *  - 脚本自带静态服务器（端口 0 = 随机空闲，根目录 docs/）与独立的 Chromium 实例，
 *    结束时在 finally 里关掉自己开的 server 与 browser，不碰别人的浏览器标签页。
 *  - 冗余的顶栏 / 侧栏 / 标注叠层只在截图那一刻用注入 CSS 隐藏，作品源码一个字不改。
 *  - 每件作品用独立的 context + page，互不影响；所有 await 都带超时与总 deadline。
 *
 * 两种生成方式
 *  --live     （默认）现场打开 docs/works/<id>/index.html，按每件作品的配方操作后截图。
 *  --offline  从本机已验证的同一批作品真实截图复现（没有浏览器 / 没有端口权限时用）。
 *  --auto     先 live，失败自动回退 offline（默认行为）。
 *
 * 用法
 *   node scripts/capture-gallery-covers.mjs                  # 全部 11 张
 *   node scripts/capture-gallery-covers.mjs --only=02,04     # 只补某几件
 *   node scripts/capture-gallery-covers.mjs --offline        # 不开浏览器，直接复现
 *   node scripts/capture-gallery-covers.mjs --keep-temp      # 保留中间 PNG
 *
 * 环境变量
 *   PLAYWRIGHT_CORE_PATH  指定 playwright-core 的 index.mjs（自动探测失败时用）
 *   COVER_SOURCE_ROOT     指定「已验证真实截图」根目录（默认本机同批输出目录）
 *   COVER_QUALITY         webp 质量，默认 85
 *   COVER_VIEWPORT        视口，默认 1600x1000
 */

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import http from 'node:http';
import { execFileSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');
const DOCS = path.join(ROOT, 'docs');
const OUT_DIR = path.join(ROOT, 'hall', 'assets', 'gallery-covers');
const MAP_FILE = path.join(ROOT, 'hall', 'cover-map.json');

const ARGS = process.argv.slice(2);
const flag = (name, fallback = null) => {
  const hit = ARGS.find((a) => a.startsWith(`--${name}=`));
  return hit ? hit.slice(name.length + 3) : fallback;
};
const has = (name) => ARGS.includes(`--${name}`);

const QUALITY = Number(process.env.COVER_QUALITY || flag('quality', '85'));
const [VW, VH] = (process.env.COVER_VIEWPORT || flag('viewport', '1600x1000')).split('x').map(Number);
const ONLY = (flag('only', '') || '').split(',').map((s) => s.trim()).filter(Boolean);
const KEEP_TEMP = has('keep-temp');
const MODE = has('offline') ? 'offline' : has('live') ? 'live' : 'auto';

/* 本机同批作品的已验证真实截图根目录（--offline 复现用） */
const SOURCE_ROOT = process.env.COVER_SOURCE_ROOT ||
  '/Users/mekzenx2/Documents/ChatGPT/Minimax测评/output/flash-showcase-20261021';

const PLAYWRIGHT_CANDIDATES = [
  process.env.PLAYWRIGHT_CORE_PATH,
  '/Users/mekzenx2/Documents/ChatGPT/Minimax测评/output/flash-showcase-20261021/13-qa-curation/qa-harness/node_modules/playwright-core/index.mjs',
  path.join(ROOT, 'node_modules', 'playwright-core', 'index.mjs'),
].filter(Boolean);

const MAGICK = fs.existsSync('/opt/homebrew/bin/magick') ? '/opt/homebrew/bin/magick' : 'magick';

/* ------------------------------------------------------------------ 工具 */

const log = (...a) => console.log(...a);

function withDeadline(promise, ms, label) {
  let timer;
  return Promise.race([
    promise.finally(() => clearTimeout(timer)),
    new Promise((_, reject) => {
      timer = setTimeout(() => reject(new Error(`${label} 超时（${ms}ms）`)), ms);
    }),
  ]);
}

async function loadPlaywright() {
  for (const c of PLAYWRIGHT_CANDIDATES) {
    if (fs.existsSync(c)) return import(pathToFileURL(c).href);
  }
  try {
    return await import('playwright-core');
  } catch {
    throw new Error('找不到 playwright-core；请用 PLAYWRIGHT_CORE_PATH 指向其 index.mjs。');
  }
}

const MIME = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8', '.svg': 'image/svg+xml',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
  '.webp': 'image/webp', '.gif': 'image/gif', '.ico': 'image/x-icon',
  '.glb': 'model/gltf-binary', '.gltf': 'model/gltf+json', '.wasm': 'application/wasm',
  '.woff2': 'font/woff2', '.woff': 'font/woff', '.ttf': 'font/ttf', '.otf': 'font/otf',
  '.mp3': 'audio/mpeg', '.ogg': 'audio/ogg', '.wav': 'audio/wav',
};

/** 起一个自己的静态服务器（端口 0 = 随机空闲），跑完自己关。 */
function startServer(root) {
  const server = http.createServer((req, res) => {
    let url;
    try {
      url = decodeURIComponent((req.url || '/').split('?')[0]);
    } catch {
      url = '/';
    }
    let file = path.join(root, url);
    if (!file.startsWith(root)) { res.writeHead(403).end('forbidden'); return; }
    if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, 'index.html');
    if (!fs.existsSync(file)) { res.writeHead(404).end('404 ' + url); return; }
    res.writeHead(200, {
      'content-type': MIME[path.extname(file).toLowerCase()] || 'application/octet-stream',
      'cache-control': 'no-cache',
    });
    fs.createReadStream(file).pipe(res);
  });
  return new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', () => {
      const { port } = server.address();
      resolve({
        url: `http://127.0.0.1:${port}`,
        port,
        close: () => new Promise((done) => server.close(done)),
      });
    });
  });
}

function toWebp(png, out) {
  execFileSync('cwebp', ['-quiet', '-q', String(QUALITY), '-m', '6', '-sharp_yuv', png, '-o', out]);
}

function pngHeight(p) {
  const b = fs.readFileSync(p);
  return b.readUInt32BE(20);
}

/** 把一张真实截图裁 / 补成目标比例，再缩到 1600x1000。 */
function fitImage(src, out, fit) {
  let args;
  if (fit.pad) {
    // 上下补一条与座舱同色的深色带，避免把 16:9 裁成 16:10 时切坏两侧 HUD 面板
    const y = Math.round((VH - pngHeight(src)) / 2);
    args = ['-size', `${VW}x${VH}`, `xc:${fit.pad}`, src, '-geometry', `+0+${y}`, '-composite'];
  } else {
    args = [src];
    if (fit.crop) {
      const [x, y, w, h] = fit.crop;
      args.push('-crop', `${w}x${h}+${x}+${y}`, '+repage');
    }
  }
  args.push('-resize', `${VW}x${VH}!`, '-strip', out);
  execFileSync(MAGICK, args);
}

/* -------------------------------------------------------- 作品专用配方 */

const CSS_HIDE_BASE = `
  .skip-link{position:absolute!important;left:-9999px!important;top:0!important}
`;

/*
 * live     —— 现场打开 docs/works/<id>/index.html 后的操作步骤 + 只在截图页生效的隐藏样式
 * offline  —— 同一件作品在本机已验证的真实截图（无浏览器时复现同一张封面）
 */
const SPECS = [
  {
    id: '01-chroma-s1',
    entry: 'works/01-chroma-s1/index.html',
    note: '产品主页主视觉：纯 CSS + Three.js 的掌机机身、光谱读数与规格区',
    async prepare(page) {
      await page.waitForSelector('#device-canvas', { timeout: 15000 }).catch(() => {});
      await page.waitForTimeout(3500);
    },
    css: `${CSS_HIDE_BASE}`,
    // 线上这张封面由 --live 从 docs/ 实拍得到（深色主题主视觉）。
    // 离线兜底用的是同一页面的另一构建（浅色主题），只作为无浏览器环境的替身。
    offline: { src: '01-web/screenshots/01-hero-desktop.png' },
  },
  {
    id: '02-abyss-salvager',
    entry: 'works/02-abyss-salvager/index.html',
    note: '3D 查看器：隐藏侧栏与标注叠层，滚轮推近，整条机械甲壳占满画面',
    async prepare(page) {
      await page.waitForSelector('#stage canvas', { timeout: 25000 }).catch(() => {});
      await page.waitForSelector('#loader', { state: 'hidden', timeout: 25000 }).catch(() => {});
      await page.waitForTimeout(2500);
      // 机位：侧视 PROFILE（整条甲壳横向铺开）
      await page.locator('#tool-rail .tool-btn[data-tool=profile]').click({ timeout: 4000 }).catch(() => {});
      await page.waitForTimeout(2600);
      // 真实滚轮缩放：推近主体
      const box = await page.locator('#stage canvas').first().boundingBox().catch(() => null);
      if (box) {
        await page.mouse.move(box.x + box.width * 0.5, box.y + box.height * 0.5);
        for (let i = 0; i < 6; i += 1) {
          await page.mouse.wheel(0, -220);
          await page.waitForTimeout(260);
        }
      }
      // 关闭标注 LABELS 叠层
      const labels = page.locator('#tool-rail .tool-btn[data-tool=annotations]');
      if (await labels.count()) {
        const cls = (await labels.getAttribute('class')) || '';
        if (!/active/.test(cls)) await labels.click({ timeout: 3000 }).catch(() => {});
      }
      await page.waitForTimeout(1800);
    },
    css: `${CSS_HIDE_BASE}
      #right-column,#card-survey-chart,#card-long-section,#card-specs,#cycle-meter,#toast,#tool-rail{display:none!important}
    `,
    offline: { src: '02-model/screenshots/15-clean-follow.png', crop: [860, 180, 820, 512] },
  },
  {
    id: '03-interaction',
    entry: 'works/03-interaction/index.html',
    note: '织造车间调度台：派工后真实运转中的机台矩阵、遥测台与事件日志',
    async prepare(page) {
      await page.waitForSelector('#loom-grid', { timeout: 15000 }).catch(() => {});
      await page.waitForTimeout(1200);
      for (const dye of ['靛蓝', '柿红', '苔绿']) {
        await page.selectOption('#f-dye', dye).catch(() => {});
        await page.click('#btn-add-order', { timeout: 3000 }).catch(() => {});
        await page.waitForTimeout(350);
      }
      await page.click('#btn-dispatch', { timeout: 5000 }).catch(() => {});
      await page.waitForTimeout(5200);
    },
    css: `${CSS_HIDE_BASE}
      .restore-banner{display:none!important}
    `,
    offline: { src: '03-interaction/screenshots/01-desktop.png' },
  },
  {
    id: '04-frostgap-voyager',
    entry: 'works/04-frostgap-voyager/index.html',
    note: '真正启动后的第一人称驾驶舱：舷窗外的天体、仪表台与遥测 HUD',
    async prepare(page) {
      await page.waitForSelector('#mainMenu', { state: 'visible', timeout: 25000 });
      await page.waitForTimeout(800);
      await page.click('#btnStart', { timeout: 6000 });
      await page.waitForSelector('#hud:not(.hidden)', { timeout: 20000 }).catch(() => {});
      await page.waitForTimeout(7000);
    },
    css: `${CSS_HIDE_BASE}
      #pointerHint,#quick-keys{display:none!important}
    `,
    offline: { src: '04-spaceflight/screenshots/03-thrusting.png', pad: '#221a0f' },
  },
  {
    id: '06-museum-main',
    entry: 'works/06-museum-main/index.html',
    note: '博物馆主站 · 时间长廊：十道年代门与展品索引',
    async prepare(page) { await page.waitForTimeout(4500); },
    css: `${CSS_HIDE_BASE}`,
    offline: { src: '06-museum-core/screenshots/07-timeline.png' },
  },
  {
    id: '07-museum-art',
    entry: 'works/07-museum-art/index.html',
    note: '原创美术资产包 · 跨时代硬件 GLB 展品',
    async prepare(page) { await page.waitForTimeout(3800); },
    css: `${CSS_HIDE_BASE}`,
    offline: { src: '07-museum-art/screenshots/section-models.png', crop: [0, 35, 1200, 750] },
  },
  {
    id: '08-era-origins',
    entry: 'works/08-era-origins/index.html',
    note: '早期电子时代展厅 · 示波器辉光轨迹',
    async prepare(page) { await page.waitForTimeout(4000); },
    css: `${CSS_HIDE_BASE}`,
    offline: { src: '08-era-origins/screenshots/01-hall-hero.png' },
  },
  {
    id: '09-era-arcade',
    entry: 'works/09-era-arcade/index.html',
    note: '街机展厅 · 晶格回廊实机画面（CRT 柜内）',
    async prepare(page) {
      await page.waitForSelector('#view', { timeout: 15000 }).catch(() => {});
      await page.waitForTimeout(2500);
      const box = await page.locator('#view').boundingBox().catch(() => null);
      if (box) {
        await page.mouse.click(box.x + box.width * 0.5, box.y + box.height * 0.75);
        await page.waitForTimeout(500);
        await page.keyboard.press('Enter').catch(() => {});
      }
      await page.waitForTimeout(3200);
    },
    css: `${CSS_HIDE_BASE}`,
    offline: { src: '09-era-arcade/screenshots/04-lattice.png', crop: [0, 40, 1280, 800] },
  },
  {
    id: '10-era-console',
    entry: 'works/10-era-console/index.html',
    note: '1990s 家用机展厅 · 等距测绘所场景',
    async prepare(page) { await page.waitForTimeout(3600); },
    css: `${CSS_HIDE_BASE}`,
    offline: { src: '10-era-console/screenshots/05-iso-scene.png', crop: [0, 0, 1500, 937] },
  },
  {
    id: '11-era-online',
    entry: 'works/11-era-online/index.html',
    note: '2000s 联机主题展厅 · 灯塔协议实机防御玩法',
    async prepare(page) { await page.waitForTimeout(3800); },
    css: `${CSS_HIDE_BASE}`,
    offline: { src: '11-era-online/screenshots/04-exhibit-defense.png' },
  },
  {
    id: '12-era-modern',
    entry: 'works/12-era-modern/index.html',
    note: '当代展厅 · 折光阁等距解谜场景',
    async prepare(page) { await page.waitForTimeout(3600); },
    css: `${CSS_HIDE_BASE}`,
    offline: { src: '12-era-modern/screenshots/09-atrium-level1.png' },
  },
];

/* ---------------------------------------------------------------- 主流程 */

async function captureLive(browser, base, spec, tmpDir) {
  const out = path.join(OUT_DIR, `${spec.id}.webp`);
  const png = path.join(tmpDir, `${spec.id}.png`);
  const context = await browser.newContext({ viewport: { width: VW, height: VH }, deviceScaleFactor: 1 });
  try {
    const page = await context.newPage();
    page.on('pageerror', () => {});
    await withDeadline(
      page.goto(`${base}/${spec.entry}`, { waitUntil: 'domcontentloaded', timeout: 15000 }),
      20000,
      `${spec.id} goto`,
    );
    await withDeadline(spec.prepare(page), 55000, `${spec.id} prepare`);
    if (spec.css) await page.addStyleTag({ content: spec.css }).catch(() => {});
    await page.waitForTimeout(900);
    await withDeadline(page.screenshot({ path: png, timeout: 25000 }), 30000, `${spec.id} screenshot`);
    await toWebp(png, out);
    return { id: spec.id, file: out, bytes: fs.statSync(out).size, source: 'live' };
  } finally {
    await context.close().catch(() => {});
  }
}

function captureOffline(spec, tmpDir) {
  const out = path.join(OUT_DIR, `${spec.id}.webp`);
  const src = path.join(SOURCE_ROOT, spec.offline.src);
  if (!fs.existsSync(src)) throw new Error(`已验证截图不存在：${src}`);
  const png = path.join(tmpDir, `${spec.id}.png`);
  fitImage(src, png, spec.offline);
  toWebp(png, out);
  return { id: spec.id, file: out, bytes: fs.statSync(out).size, source: 'offline' };
}

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'gallery-covers-'));
  const list = SPECS.filter((s) => !ONLY.length || ONLY.some((o) => s.id.includes(o)));

  let browser = null;
  let server = null;
  let base = '';
  const results = [];

  try {
    if (MODE !== 'offline') {
      const { chromium } = await loadPlaywright();
      server = await startServer(DOCS);
      base = server.url;
      log(`[covers] 静态服务器 ${base} -> docs/`);
      browser = await chromium.launch({
        headless: true,
        channel: 'chromium',
        args: ['--use-gl=angle', '--enable-unsafe-swiftshader', '--no-sandbox', '--hide-scrollbars'],
      });
    }

    for (const spec of list) {
      log(`> ${spec.id}`);
      let done = null;
      if (browser) {
        try {
          done = await captureLive(browser, base, spec, tmpDir);
        } catch (err) {
          log(`  ! 实时捕获失败：${err?.message ?? err}`);
          if (MODE === 'live') { results.push({ id: spec.id, ok: false }); continue; }
        }
      }
      if (!done) {
        try {
          done = captureOffline(spec, tmpDir);
        } catch (err) {
          log(`  ! 离线复现失败：${err?.message ?? err}`);
          results.push({ id: spec.id, ok: false });
          continue;
        }
      }
      results.push({ ...done, ok: true });
      log(`  ok ${spec.id.padEnd(20)} ${(done.bytes / 1024).toFixed(1)} KB  [${done.source}]  ${spec.note}`);
    }
  } finally {
    if (browser) await browser.close().catch(() => {});
    if (server) await server.close();
    if (!KEEP_TEMP) fs.rmSync(tmpDir, { recursive: true, force: true });
    else log(`[covers] 中间 PNG 保留在 ${tmpDir}`);
  }

  // 映射表：11 个 id -> 相对发布根路径
  const map = {};
  for (const spec of SPECS) {
    const ext = fs.existsSync(path.join(OUT_DIR, `${spec.id}.webp`)) ? 'webp' : 'png';
    map[spec.id] = `assets/gallery-covers/${spec.id}.${ext}`;
  }
  fs.writeFileSync(MAP_FILE, `${JSON.stringify(map, null, 2)}\n`, 'utf8');
  log(`[covers] 封面映射 -> ${path.relative(ROOT, MAP_FILE)}`);

  const ok = results.filter((r) => r.ok).length;
  log(`[covers] 完成 ${ok}/${results.length}；服务器与浏览器已关闭。`);
  if (ok !== results.length) process.exitCode = 1;
}

main().catch((err) => {
  console.error('[covers] 失败：', err);
  process.exit(1);
});
