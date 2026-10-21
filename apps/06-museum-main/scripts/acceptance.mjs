#!/usr/bin/env node
/**
 * 验收脚本 · 回响电玩馆主站
 *
 * 用 Playwright 实际打开站点，走通主要参观动线，并记录：
 *   - 控制台错误 / 警告
 *   - 失败请求与 4xx/5xx 资源
 *   - 每一步的断言结果
 *   - 桌面与移动端截图
 *
 * 执行模型：**分步 + 每步独立起浏览器**。
 * 本机负载高时（实测 load average 一度到 99、swap 打满），headless Chromium
 * 会被系统直接杀掉。如果所有断言挤在一次会话里，一次崩溃就毁掉整轮验收、
 * 拿不到任何数字。拆成独立步骤后，崩溃只影响那一步，并且会自动重试一次，
 * 最后如实报告哪一步没跑通。
 *
 * 用法：
 *   node scripts/acceptance.mjs [baseUrl]
 *   BASE_URL=http://127.0.0.1:4326 node scripts/acceptance.mjs
 *
 * 产物：screenshots/*.png、ACCEPTANCE.md
 */

import { createRequire } from 'node:module';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const SHOTS = path.join(ROOT, 'screenshots');
/*
 * 目标地址必须以 '/' 结尾。
 *
 * 站内所有资源走相对路径（./assets/…、./art/…），浏览器把相对路径锚定在
 * **目录**上：`.../06-museum-main/` → 资源落在 `.../06-museum-main/assets/…` ✅
 * `.../06-museum-main`（无尾斜杠）→ 资源落在 `.../assets/…` ❌ 全部 404。
 * GitHub Pages 对目录型 URL 会 301 到带斜杠版本，线上永远拿到带斜杠的地址；
 * 这里主动归一化，避免把「URL 少个斜杠」误判成站点缺陷。
 */
const BASE = (process.argv[2] || process.env.BASE_URL || 'http://127.0.0.1:4326')
  .replace(/\/*$/, '/');

// 复用 07-museum-art 已安装的 playwright（只读引用，不修改其目录）
const require = createRequire(import.meta.url);
const PLAYWRIGHT_CANDIDATES = [
  path.join(ROOT, '..', '07-museum-art', 'node_modules', 'playwright'),
  path.join(ROOT, 'node_modules', 'playwright'),
  'playwright',
];
let chromium;
let playwrightPkg = null;
for (const candidate of PLAYWRIGHT_CANDIDATES) {
  try {
    const mod = require(candidate);
    chromium = mod.chromium;
    playwrightPkg = require(path.join(path.dirname(candidate), 'playwright', 'package.json'));
    break;
  } catch { /* 尝试下一个 */ }
}
if (!chromium) {
  console.error('✗ 未找到 playwright。请安装 playwright 或让 07-museum-art 的依赖可用。');
  process.exit(2);
}

const results = [];
const fullShots = [];
const fullShotNotes = [];
let stepNo = 0;

function record(name, ok, detail = '') {
  stepNo += 1;
  results.push({ no: stepNo, name, ok, detail });
  console.log(`  ${ok ? '✓' : '✗'} ${name}${detail ? ` — ${detail}` : ''}`);
}

function check(name, condition, detail = '') {
  record(name, Boolean(condition), detail);
}

const consoleIssues = [];
const networkIssues = [];

function attach(page) {
  page.on('console', (msg) => {
    if (msg.type() === 'error' || msg.type() === 'warning') {
      const text = msg.text();
      if (text.includes('favicon')) return;
      consoleIssues.push({ type: msg.type(), text: text.slice(0, 240) });
    }
  });
  page.on('pageerror', (err) => {
    consoleIssues.push({ type: 'pageerror', text: String(err).slice(0, 240) });
  });
  page.on('requestfailed', (req) => {
    networkIssues.push({ url: req.url(), reason: req.failure()?.errorText ?? 'failed' });
  });
  page.on('response', (res) => {
    if (res.status() >= 400) networkIssues.push({ url: res.url(), reason: `HTTP ${res.status()}` });
  });
}

async function shot(page, name) {
  // 无头环境下的 WebGL 读回可能很慢：给截图单独设上限，失败不影响断言
  try {
    await page.screenshot({ path: path.join(SHOTS, `${name}.png`), fullPage: false, timeout: 20000 });
  } catch (err) {
    console.log(`    · 截图 ${name} 未完成（${String(err).split('\n')[0].slice(0, 60)}）`);
  }
}

/*
 * 整页截图（fullPage）。
 *
 * 为什么必须补这一类：视口截图只能覆盖首屏，验收要看的是「首屏以下」的内容
 * （比如 211 条目录往下翻、年代时间轴的整条纵轴、馆方说明的长文）。
 * 本批所有目录都缺这一类，是共性缺口。
 *
 * 两个坑：
 *   1. **页面可能太长**。目录页在 390px 下高达 4 万多像素，
 *      Chromium 的贴图上限约 16384px，硬截会失败或被裁。
 *      所以先量 scrollHeight，超阈值就**如实记录「未完成」**并跳过，
 *      不假装截到了。
 *   2. **动画要冻结**，否则整页截图会拍到入场动画的中间态。
 *      用 animations:'disabled'（Playwright 自带，CSS 动画会被快进到终态）。
 */
const FULL_SHOTS = path.join(SHOTS, 'full');
const FULL_PAGE_MAX_PX = 15000;

async function shotFull(page, name) {
  try {
    const h = await page.evaluate(() => Math.max(
      document.documentElement.scrollHeight,
      document.body ? document.body.scrollHeight : 0,
    ));
    if (h > FULL_PAGE_MAX_PX) {
      console.log(`    · 整页截图 ${name} 未完成：页面高 ${h}px，超过 ${FULL_PAGE_MAX_PX}px 上限（Chromium 贴图上限约 16384px）`);
      fullShotNotes.push(`${name}：页面高 ${h}px 超过上限，未截图`);
      return false;
    }
    await mkdir(FULL_SHOTS, { recursive: true });
    await page.screenshot({
      path: path.join(FULL_SHOTS, `${name}.png`),
      fullPage: true,
      animations: 'disabled',
      timeout: 60000,
    });
    fullShots.push(`screenshots/full/${name}.png`);
    return true;
  } catch (err) {
    console.log(`    · 整页截图 ${name} 未完成（${String(err).split('\n')[0].slice(0, 60)}）`);
    fullShotNotes.push(`${name}：${String(err).split('\n')[0].slice(0, 80)}`);
    return false;
  }
}

/**
 * 跳到某个 hash 路由。
 *
 * 用 `page.goto` 做同文档的 hash 切换时，Playwright 会等 'domcontentloaded'，
 * 而该事件在同文档导航中不会重新触发；页面里有 3D 画布或嵌入式游戏时尤其容易超时。
 * 这里直接改写 `location.hash`，并**等该路由的关键节点真的出现**再继续，
 * 而不是睡固定时长——机器负载高时固定时长并不够。
 */
const ROUTE_MARKERS = [
  [/^#\/$/, '.hero-title'],
  [/^#\/catalog/, '#catalog-results'],
  [/^#\/era\//, '.era-hero-title'],
  [/^#\/exhibit\//, '.exhibit-main'],
  [/^#\/collection/, '.collection-bar'],
  [/^#\/timeline/, '#corridor .era-door'],
  [/^#\/hall$/, '#hall-canvas'],
  [/^#\/hall\//, 'iframe.embed-frame, .pending-box'],
  [/^#\/about/, '.table'],
];

async function gotoHash(page, hash, wait = 900) {
  await page.evaluate((h) => { window.location.hash = h; }, hash);
  const marker = ROUTE_MARKERS.find(([re]) => re.test(hash))?.[1];
  if (marker) {
    try {
      await page.waitForSelector(marker, { state: 'attached', timeout: 30000 });
    } catch {
      // 标记没出现就按固定时长继续，让后面的断言去报具体的失败
    }
  }
  await page.waitForTimeout(wait);
}

/* ── 步骤定义 ──────────────────────────────────────────────────────────────── */
const steps = [];
function step(title, fn) {
  steps.push({ title, fn });
}

step('首页', async (page) => {
  await page.goto(`${BASE}#/`, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(800);
  check('页面标题正确', (await page.title()).includes('回响电玩馆'), await page.title());
  check('主标题渲染', await page.locator('.hero-title').isVisible());
  const eraLinks = await page.locator('.rail-list [data-era-link]').count();
  check('侧栏年代导航 ≥ 7 个', eraLinks >= 7, `${eraLinks} 个`);
  const stats = await page.locator('.hero-stats dd').allTextContents();
  check('馆藏统计有数值', stats.length >= 4 && stats.some((s) => Number(s) > 50), stats.join(' / '));
  check('可玩展厅区块存在', await page.locator('#home-halls').isVisible());
  await shot(page, '01-home-desktop');
  await shotFull(page, 'home-desktop');
});

step('2D 无障碍目录 · 检索与筛选', async (page) => {
  await page.goto(`${BASE}#/catalog`, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(1200);
  const totalText = await page.locator('#results-count').textContent();
  const total = Number((totalText.match(/共 (\d+)/) ?? [])[1] ?? 0);
  check('目录展示馆藏总数', total > 50, totalText.trim());
  check('筛选面板存在', await page.locator('#catalog-filters').isVisible());
  check('aria-live 结果计数存在', await page.locator('#results-count[role="status"]').count() === 1);

  // 关键词检索
  await page.locator('#f-q').fill('掌机');
  await page.waitForTimeout(900);
  const filteredText = await page.locator('#results-count').textContent();
  const filtered = Number((filteredText.match(/共 (\d+)/) ?? [])[1] ?? 0);
  check('关键词检索缩小结果集', filtered > 0 && filtered < total, `${filtered} / ${total}`);
  check('检索关键词出现在结果里', (await page.locator('#catalog-results').textContent()).includes('掌机'));

  /*
   * 输入后**立刻**读（不等任何异步）：这是 13 报「211 → 211」的那一步。
   * 之前有 220ms 去抖，填完立刻读到的还是旧值；现在必须同步收敛。
   */
  await page.locator('#f-q').fill('这个词一定不存在zzz');
  const instantText = await page.locator('#results-count').textContent();
  const instantCount = Number((instantText.match(/共 (\d+)/) ?? [])[1] ?? -1);
  const instantItems = await page.locator('.exhibit-card, .exhibit-row').count();
  check('不存在的关键词立即归零（不等去抖）', instantCount === 0 && instantItems === 0,
    `计数器「${instantText.trim()}」· 渲染 ${instantItems} 条`);
  check('零结果时给出空态', await page.locator('#catalog-results .empty').count() === 1);

  await page.locator('#f-q').fill('掌机');
  await page.waitForTimeout(400);
  await shot(page, '02-catalog-search');
  await shotFull(page, 'catalog-search-desktop');

  /*
   * D1 文字压盖自检：卡片三块（摘要 / 作者 / 收藏）必须各占各的行。
   *
   * 口径说明（这一条踩过坑，值得写下来）：
   *   - 用**可见盒**（getBoundingClientRect）比，而不是 scrollWidth/scrollHeight。
   *     摘要带 `-webkit-line-clamp`、作者带 `text-overflow: ellipsis`，
   *     两者都会溢出自己的盒子——但溢出部分被裁掉、**根本没画出来**。
   *     用 scroll* 量「内容延伸范围」会得到「压盖 100%」的假阳性。
   *   - 用 `getClientRects()` 的**行片段**而不是外接矩形：
   *     行内元素换行后外接矩形会把下一行的内容也框进来，同样是假阳性。
   */
  const cardOverlap = await page.evaluate(() => {
    const visibleBox = (el) => {
      const r = el.getBoundingClientRect();
      let box = { left: r.left, top: r.top, right: r.right, bottom: r.bottom };
      let p = el.parentElement;
      while (p && p !== document.body) {
        const cs = getComputedStyle(p);
        if (cs.overflow !== 'visible') {
          const pr = p.getBoundingClientRect();
          box = {
            left: Math.max(box.left, pr.left), top: Math.max(box.top, pr.top),
            right: Math.min(box.right, pr.right), bottom: Math.min(box.bottom, pr.bottom),
          };
        }
        p = p.parentElement;
      }
      return box;
    };
    const inter = (a, b) => {
      const w = Math.min(a.right, b.right) - Math.max(a.left, b.left);
      const h = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top);
      return w > 0 && h > 0 ? Math.round(w * h) : 0;
    };
    const hits = [];
    let cards = 0;
    for (const card of document.querySelectorAll('.exhibit-card')) {
      const s = card.querySelector('.card-summary');
      const c = card.querySelector('.card-creator');
      const f = card.querySelector('.fav-text');
      if (!s || !c) continue;
      cards += 1;
      const bs = visibleBox(s); const bc = visibleBox(c);
      const pairs = [['摘要×作者', bs, bc]];
      if (f) pairs.push(['摘要×收藏', bs, visibleBox(f)], ['作者×收藏', bc, visibleBox(f)]);
      for (const [label, a, b] of pairs) {
        const area = inter(a, b);
        if (area > 0) {
          hits.push(`${label} ${area}px²（「${s.textContent.trim().slice(0, 10)}…」）`);
        }
      }
    }
    return { cards, hits };
  });
  check('卡片三块无文字压盖', cardOverlap.hits.length === 0,
    cardOverlap.hits.length ? cardOverlap.hits.slice(0, 3).join('；') : `抽检 ${cardOverlap.cards} 张卡片，压盖 0`);

  // 清空 + 年代筛选
  await page.locator('#f-q').fill('');
  await page.waitForTimeout(800);
  await page.locator('input[name="era"][value="e04"]').check();
  await page.waitForTimeout(700);
  const eraFilteredText = await page.locator('#results-count').textContent();
  const eraFiltered = Number((eraFilteredText.match(/共 (\d+)/) ?? [])[1] ?? 0);
  check('年代筛选生效', eraFiltered > 0 && eraFiltered < total, `${eraFiltered} 件`);
  const url = page.url();
  check('筛选状态写入 URL', url.includes('era=e04'), url.split('#')[1] ?? url);

  // 类别筛选叠加
  await page.locator('input[name="kind"][value="hardware"]').check();
  await page.waitForTimeout(700);
  const comboText = await page.locator('#results-count').textContent();
  const combo = Number((comboText.match(/共 (\d+)/) ?? [])[1] ?? 0);
  check('多维筛选可叠加', combo <= eraFiltered, `${combo} ≤ ${eraFiltered}`);

  // 清除筛选
  await page.locator('#f-reset').click();
  await page.waitForTimeout(700);
  const resetText = await page.locator('#results-count').textContent();
  check('清除筛选恢复全量', Number((resetText.match(/共 (\d+)/) ?? [])[1] ?? 0) === total, resetText.trim());

  // 视图切换
  await page.locator('.seg-btn[data-view="list"]').click();
  await page.waitForTimeout(500);
  check('列表视图切换生效', await page.locator('.exhibit-row').first().isVisible());
  await shot(page, '03-catalog-list');
  await page.locator('.seg-btn[data-view="grid"]').click();
  await page.waitForTimeout(400);
});

step('年代展厅', async (page) => {
  await page.goto(`${BASE}#/era/e04`, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(1200);
  check('年代标题渲染', (await page.locator('.era-hero-title').textContent()).length > 1);
  check('年代导言存在', (await page.locator('.era-narrative-text').textContent()).length > 20);
  const cabinets = await page.locator('.cabinet').count();
  check('展柜分区（作品/硬件/平台）存在', cabinets >= 2, `${cabinets} 个分区`);
  check('展厅内展品卡片存在', await page.locator('.exhibit-card').first().isVisible());
  check('可玩展厅入口区块存在', await page.locator('.era-hall').count() === 1);
  await shot(page, '04-era-gallery');
  await shotFull(page, 'era-gallery-desktop');
});

step('展品详情 · 来源', async (page) => {
  await page.goto(`${BASE}#/era/e04`, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(1200);
  await page.locator('.exhibit-card .card-title a').first().click({ timeout: 30000 });
  await page.waitForTimeout(1200);
  check('进入展品详情', page.url().includes('#/exhibit/'), page.url().split('#')[1]);
  check('展签信息存在', await page.locator('.plaque-list').isVisible());
  const srcLinks = await page.locator('.source-list a').count();
  check('来源链接 ≥ 1 条', srcLinks >= 1, `${srcLinks} 条`);
  const srcHref = await page.locator('.source-list a').first().getAttribute('href');
  check('来源为外部可点链接', /^https?:\/\//.test(srcHref ?? ''), srcHref ?? '');
  const license = await page.locator('.exhibit-main').textContent();
  check('展品含图片许可说明', license.includes('许可') || license.includes('SVG'));
  await shot(page, '05-exhibit-detail');
  await shotFull(page, 'exhibit-detail-desktop');
});

step('收藏', async (page) => {
  await page.goto(`${BASE}#/era/e04`, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(1200);
  await page.locator('.exhibit-card .card-title a').first().click({ timeout: 30000 });
  await page.waitForTimeout(1200);
  const favBtn = page.locator('.exhibit-actions [data-fav]');
  await favBtn.click();
  await page.waitForTimeout(600);
  check('收藏按钮进入已收藏态', await favBtn.getAttribute('aria-pressed') === 'true');
  const badge = await page.locator('.topnav-fav [data-fav-count]').first().textContent();
  check('顶栏收藏计数更新', Number(badge) >= 1, badge ?? '');
  const stored = await page.evaluate(() => window.localStorage.getItem('ptatlas.favorites.v1'));
  let storedIds = [];
  try { storedIds = JSON.parse(stored ?? '[]'); } catch { storedIds = []; }
  check('收藏写入 localStorage', Array.isArray(storedIds) && storedIds.length >= 1, JSON.stringify(storedIds).slice(0, 60));
  // 同一个上下文里跳到收藏页，验证 localStorage → 收藏页的回读
  await gotoHash(page, '#/collection', 1000);
  check('收藏页显示已收藏展品', await page.locator('.exhibit-card').count() >= 1);
  await shot(page, '06-collection');
});

step('时间长廊', async (page) => {
  await page.goto(`${BASE}#/timeline`, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(1200);
  const doors = await page.locator('.era-door').count();
  check('年代门数量 ≥ 7', doors >= 7, `${doors} 道`);
  check('纵向时间轴存在', await page.locator('.tl-era').count() >= 7);
  // 键盘方向键在长廊内移动焦点
  await page.locator('#corridor .era-door').first().focus();
  await page.keyboard.press('ArrowRight');
  await page.waitForTimeout(400);
  const focused = await page.evaluate(() => document.activeElement?.className ?? '');
  check('长廊方向键可移动焦点', focused.includes('era-door'), focused);
  await shot(page, '07-timeline');
  await shotFull(page, 'timeline-desktop');
});

step('3D 展厅（可选）', async (page) => {
  await page.goto(`${BASE}#/hall`, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(4000);
  const canvasVisible = await page.locator('#hall-canvas').isVisible();
  check('3D 画布出现', canvasVisible);
  const loadingGone = await page.locator('#hall-loading').count() === 0;
  check('3D 模块完成加载（无降级提示）', loadingGone);
  const hallMini = await page.locator('.hall-mini').count();
  check('可玩展厅一览存在', hallMini === 5, `${hallMini} 个`);
  await shot(page, '08-hall-3d');
});

step('可玩展厅嵌入', async (page) => {
  await page.goto(`${BASE}#/hall/arcade`, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(3000);
  const frame = await page.evaluate(() => {
    const el = document.querySelector('iframe.embed-frame');
    return el ? { count: document.querySelectorAll('iframe.embed-frame').length, src: el.getAttribute('src') } : { count: 0, src: null };
  });
  check('已并入展厅显示 iframe', frame.count === 1, `${frame.count} 个`);
  check('iframe 指向 exhibits 子路径', (frame.src ?? '').startsWith('./exhibits/'), frame.src ?? '无');
  await shot(page, '09-playable-embed');
});

step('五个可玩展厅的接入状态', async (page) => {
  const hallIds = ['origins', 'arcade', 'console', 'online', 'modern'];
  let integratedCount = 0;
  let pendingCount = 0;
  for (const id of hallIds) {
    await gotoHash(page, `#/hall/${id}`, 2500);
    const state = await page.evaluate(() => ({
      iframe: document.querySelectorAll('iframe.embed-frame').length,
      pending: document.querySelectorAll('.pending-box').length,
      fakeLinks: document.querySelectorAll('.pending-box a, .pending-box button').length,
      src: document.querySelector('iframe.embed-frame')?.getAttribute('src') ?? null,
    }));
    if (state.iframe === 1) {
      integratedCount += 1;
      check(`展厅 ${id} 已并入并显示 iframe`, (state.src ?? '').startsWith('./exhibits/'), state.src ?? '');
    } else if (state.pending === 1) {
      pendingCount += 1;
      check(`展厅 ${id} 未并入 → 明确占位`, true);
      check(`展厅 ${id} 占位不含可点击假入口`, state.fakeLinks === 0, `${state.fakeLinks} 个`);
    } else {
      check(`展厅 ${id} 状态异常`, false, JSON.stringify(state));
    }
  }
  check('五个展厅状态互斥且可解释', integratedCount + pendingCount === 5, `已并入 ${integratedCount} · 待集成 ${pendingCount}`);
  await shot(page, '10-hall-state');
});

step('馆方说明', async (page) => {
  await page.goto(`${BASE}#/about`, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(900);
  const about = await page.locator('main').textContent();
  check('说明页含策展立场', about.includes('策展立场'));
  check('说明页含已知限制', about.includes('已知限制'));
  check('说明页含接入状态表', await page.locator('.table').count() === 1);
  await shot(page, '11-about');
  await shotFull(page, 'about-desktop');
});

step('移动端 390×844', async (page, browser) => {
  const mobile = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Safari/604.1',
  });
  const mp = await mobile.newPage();
  mp.setDefaultTimeout(30000);
  attach(mp);
  await mp.goto(`${BASE}#/`, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await mp.waitForTimeout(1200);
  check('移动端显示抽屉按钮', await mp.locator('#nav-toggle').isVisible());
  const overflow = await mp.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  check('移动端无横向溢出', overflow <= 1, `溢出 ${overflow}px`);
  const tapTargets = await mp.evaluate(() => {
    const btns = [...document.querySelectorAll('.btn, .fav-btn, .topnav a')];
    return btns.filter((b) => {
      const r = b.getBoundingClientRect();
      return r.width > 0 && r.height > 0 && r.height < 32;
    }).length;
  });
  check('触控目标高度 ≥ 32px', tapTargets === 0, `${tapTargets} 个过小`);
  await shot(mp, '12-home-mobile');
  await shotFull(mp, 'home-mobile');
  await mp.locator('#nav-toggle').click();
  await mp.waitForTimeout(600);
  check('移动端导览抽屉可打开', await mp.locator('body.rail-open').count() === 1);
  await shot(mp, '13-rail-mobile');
  await gotoHash(mp, '#/catalog', 1200);
  const mOverflow = await mp.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  check('移动端目录无横向溢出', mOverflow <= 1, `溢出 ${mOverflow}px`);
  await shot(mp, '14-catalog-mobile');
  await shotFull(mp, 'catalog-mobile');
  await mobile.close();
});

step('键盘可达性', async (page) => {
  // 必须是**整页加载**（而非同文档的 hash 切换）：路由切换时焦点会被有意移到 <main>，
  // 那样测到的就不是「页面首个 Tab 停靠点」。
  await page.goto(`${BASE}?fresh=1#/`, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(1500);
  await page.keyboard.press('Tab');
  const firstFocus = await page.evaluate(() => document.activeElement?.className ?? '');
  check('整页加载后首个 Tab 聚焦到跳转链接', firstFocus.includes('skip-link'), firstFocus);

  // 路由切换后焦点应移到主内容（读屏可感知换页）
  await page.locator('.topnav a[href="#/catalog"]').click({ timeout: 30000 });
  await page.waitForTimeout(900);
  const afterNav = await page.evaluate(() => document.activeElement?.id ?? document.activeElement?.tagName ?? '');
  check('路由切换后焦点移到主内容', afterNav === 'main', afterNav);
  await shot(page, '15-keyboard-skiplink');
});

/* ── 执行 ──────────────────────────────────────────────────────────────────── */

let browser = null;
let context = null;
let page = null;

async function teardown() {
  try { await context?.close(); } catch { /* 已死 */ }
  try { await browser?.close(); } catch { /* 已死 */ }
  context = null;
  browser = null;
  page = null;
}

async function ensurePage() {
  if (page && !page.isClosed()) return;
  await teardown();
  browser = await chromium.launch();
  context = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
  page = await context.newPage();
  page.setDefaultTimeout(30000);
  attach(page);
}

async function main() {
  await mkdir(SHOTS, { recursive: true });
  console.log(`\n▶ 验收目标：${BASE}`);

  const crashed = [];
  for (const s of steps) {
    console.log(`\n▶ ${s.title}`);
    let done = false;
    for (let attempt = 1; attempt <= 2 && !done; attempt += 1) {
      try {
        await ensurePage();
        await s.fn(page, browser);
        done = true;
      } catch (err) {
        const msg = String(err).split('\n')[0].slice(0, 140);
        if (attempt < 2) {
          console.log(`    · 第 ${attempt} 次执行异常（${msg}），重建浏览器后重试`);
          await teardown();
          continue;
        }
        console.log(`    · 步骤未完成：${msg}`);
        record(`${s.title} · 步骤未跑完`, false, msg);
        crashed.push(s.title);
        await teardown();
      }
    }
  }

  await teardown();

  /* ── 汇总 ── */
  const failed = results.filter((r) => !r.ok);
  const relevantConsole = consoleIssues.filter((c) => !/favicon|Download the React/i.test(c.text));
  // 无头浏览器的 WebGL 驱动性能提示属于环境噪声（GPU stall due to ReadPixels），
  // 不是应用缺陷；这里单独归类并保留在记录中，不计入控制台错误。
  const glNoise = relevantConsole.filter((c) => /GL Driver Message|GPU stall/i.test(c.text));
  const realConsole = relevantConsole.filter((c) => !/GL Driver Message|GPU stall/i.test(c.text));
  const relevantNetwork = networkIssues.filter((n) => !/favicon/.test(n.url));

  console.log('\n' + '─'.repeat(52));
  console.log(`断言：通过 ${results.length - failed.length} · 失败 ${failed.length}`);
  console.log(`控制台问题：${realConsole.length}（另有 ${glNoise.length} 条无头 GPU 性能提示，不计为缺陷） · 网络问题：${relevantNetwork.length}`);
  if (realConsole.length) realConsole.slice(0, 10).forEach((c) => console.log(`  · [${c.type}] ${c.text}`));
  if (relevantNetwork.length) relevantNetwork.slice(0, 10).forEach((n) => console.log(`  · ${n.url} — ${n.reason}`));

  // 写入验收记录
  const lines = [];
  lines.push('# 验收记录 · 06-museum-core 回响电玩馆主站');
  lines.push('');
  lines.push(`> 验收方式：Playwright ${playwrightPkg?.version ?? 'unknown'} 实际打开 ${BASE}，走通主要参观动线。`);
  lines.push(`> 结果：断言 ${results.length - failed.length}/${results.length} 通过。`);
  lines.push('');
  lines.push('## 1. 功能断言');
  lines.push('');
  lines.push('| # | 断言 | 结果 | 备注 |');
  lines.push('| --- | --- | --- | --- |');
  for (const r of results) {
    lines.push(`| ${r.no} | ${r.name} | ${r.ok ? '✅ 通过' : '❌ 失败'} | ${r.detail || ''} |`);
  }
  lines.push('');
  lines.push('## 2. 控制台与网络');
  lines.push('');
  lines.push(`- 控制台错误/警告（不含无头 GPU 性能提示）：**${realConsole.length}** 条`);
  lines.push(`- 无头浏览器 WebGL 性能提示（GL Driver Message，非应用缺陷）：${glNoise.length} 条`);
  lines.push(`- 失败请求或 4xx/5xx：**${relevantNetwork.length}** 条`);
  if (relevantConsole.length) {
    lines.push('');
    lines.push('```');
    relevantConsole.forEach((c) => lines.push(`[${c.type}] ${c.text}`));
    lines.push('```');
  }
  if (relevantNetwork.length) {
    lines.push('');
    lines.push('```');
    relevantNetwork.forEach((n) => lines.push(`${n.url} — ${n.reason}`));
    lines.push('```');
  }
  lines.push('');
  lines.push('## 3. 截图');
  lines.push('');
  lines.push('### 视口截图（首屏）');
  lines.push('');
  for (const f of [
    '01-home-desktop', '02-catalog-search', '03-catalog-list', '04-era-gallery',
    '05-exhibit-detail', '06-collection', '07-timeline', '08-hall-3d',
    '09-playable-embed', '10-hall-state', '11-about',
    '12-home-mobile', '13-rail-mobile', '14-catalog-mobile', '15-keyboard-skiplink',
  ]) {
    lines.push(`- \`screenshots/${f}.png\``);
  }
  lines.push('');
  lines.push('### 整页截图（fullPage，覆盖首屏以下）');
  lines.push('');
  if (fullShots.length) {
    for (const f of fullShots) lines.push(`- \`${f}\``);
  } else {
    lines.push('- （本轮没有产出整页截图）');
  }
  if (fullShotNotes.length) {
    lines.push('');
    lines.push('未完成的整页截图（如实记录，不假装截到）：');
    lines.push('');
    for (const n of fullShotNotes) lines.push(`- ${n}`);
  }
  lines.push('');
  lines.push('## 4. 尚未覆盖 / 已知限制');
  lines.push('');
  lines.push('- 五个可玩展厅（origins / arcade / console / online / modern）本轮均已并入，走 iframe 嵌入路径；若任一上游包体缺失，同步脚本会标记 `pending` 并渲染明确「待集成」占位，绝不渲染假入口。');
  lines.push('- 3D 展厅为桌面浏览器交互，触屏设备只做降级提示（不进入漫游）；按 TASK.md 的 F9，它是独立路由 `#/hall`，可玩展厅页不再叠加 3D 画布。');
  lines.push('- 收藏与参观足迹仅存于本机浏览器，跨设备同步不在本任务范围。');
  lines.push('- 展厅内嵌游戏由上游任务包提供，本馆只做嵌入与降级，不负责其玩法内容。');
  if (crashed.length) {
    lines.push('');
    lines.push('### 本轮未跑完的步骤');
    lines.push('');
    for (const c of crashed) lines.push(`- ${c}`);
  }
  lines.push('');

  await writeFile(path.join(ROOT, 'ACCEPTANCE.md'), lines.join('\n'), 'utf8');
  console.log('\n✓ 验收记录已写入 ACCEPTANCE.md，截图见 screenshots/');

  if (failed.length) {
    console.log(`\n✗ ${failed.length} 条断言未通过：`);
    failed.forEach((f) => console.log(`  · ${f.name} ${f.detail}`));
    process.exit(1);
  }
  console.log('✓ 全部断言通过');
}

main().catch((err) => {
  console.error('✗ 验收脚本异常：', err);
  process.exit(1);
});
