/**
 * 回响电玩馆 / PLAYTIME ATLAS — 与余晖设计系统（16-design-system）的符合性验收
 *
 * 依据：16-design-system/MIGRATION-NOTES.md §9「验收清单 V.1–V.10」
 *       16-design-system/tools/validate-tokens.mjs（令牌一致性，本脚本直接调用其权威实现）
 *
 * 运行：node scripts/qa-ds-conformance.mjs
 * 产出：evidence/ds-conformance.json · evidence/ds-tokens-validate.json · evidence/local/*.png
 *
 * ── 两部分 ──────────────────────────────────────────────────────────
 *   ① 令牌层：搭一个**符号链接沙盒**，把本包的文件按 16 校验器期望的目录结构摆好，
 *      再用 `node --preserve-symlinks-main` 原样运行 16 的 validate-tokens.mjs。
 *      —— 16 的文件一个字节都不复制、不修改；沙盒里全是指向本包的软链。
 *   ② 页面层：按 V.1–V.10 逐项做机械判定（Playwright）。
 *
 * 退出码：0 = 全部通过；1 = 有失败项。
 */

import { chromium } from 'playwright';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, rmSync, statSync, symlinkSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { startServer } from './lib/server.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');
const DIST = path.join(ROOT, 'dist');
const EVIDENCE = path.join(ROOT, 'evidence');
const DS = path.resolve(ROOT, '..', '16-design-system');
const PREFIX = '/playtime-atlas-20261021/exhibits/07-museum-art';

const results = [];
let pass = 0;
const failures = [];
const ok = (id, m, extra) => {
  pass++;
  results.push({ id, ok: true, message: m, ...(extra ? { extra } : {}) });
  console.log(`  ✓ [${id}] ${m}`);
};
const bad = (id, m, extra) => {
  failures.push(`[${id}] ${m}`);
  results.push({ id, ok: false, message: m, ...(extra ? { extra } : {}) });
  console.log(`  ✗ [${id}] ${m}`);
};
const note = (id, m) => {
  results.push({ id, ok: null, message: m });
  console.log(`  · [${id}] ${m}`);
};

const sha256 = (p) => createHash('sha256').update(readFileSync(p)).digest('hex');

/* =========================================================
   ① 令牌层 —— 用 16 的权威校验器验证本包
   ========================================================= */
function runDsTokenValidator() {
  console.log('\n▶ ① 令牌层：运行 16-design-system/tools/validate-tokens.mjs');
  const tool = path.join(DS, 'tools', 'validate-tokens.mjs');
  if (!existsSync(tool)) {
    bad('V.3', '未找到 16 的 tools/validate-tokens.mjs，跳过令牌层校验');
    return null;
  }

  /* 沙盒：结构与 16 的 ROOT 期望一致，里面全是指向本包的软链 */
  const sandbox = path.join(os.tmpdir(), 'atlas07-ds-check');
  /* 若上次运行留下软链残留，先清空（仅限本脚本自己的临时目录） */
  if (existsSync(sandbox)) rmSync(sandbox, { recursive: true, force: true });
  mkdirSync(path.join(sandbox, 'tools'), { recursive: true });
  mkdirSync(path.join(sandbox, 'src'), { recursive: true });
  mkdirSync(EVIDENCE, { recursive: true });

  const link = (from, to) => symlinkSync(from, to);
  link(tool, path.join(sandbox, 'tools', 'validate-tokens.mjs'));
  link(path.join(ROOT, 'design-tokens.json'), path.join(sandbox, 'design-tokens.json'));
  link(path.join(ROOT, 'src', 'tokens.css'), path.join(sandbox, 'src', 'tokens.css'));
  link(path.join(ROOT, 'src', 'styles.css'), path.join(sandbox, 'src', 'components.css'));
  link(path.join(ROOT, 'public', 'assets', 'fonts'), path.join(sandbox, 'fonts'));
  link(path.join(ROOT, 'public', 'assets'), path.join(sandbox, 'assets'));
  link(path.join(ROOT, 'index.html'), path.join(sandbox, 'preview.html'));
  link(EVIDENCE, path.join(sandbox, 'evidence'));

  let stdout = '';
  let exitCode = 0;
  try {
    stdout = execFileSync(
      process.execPath,
      ['--preserve-symlinks-main', path.join(sandbox, 'tools', 'validate-tokens.mjs')],
      { encoding: 'utf8', cwd: sandbox },
    );
  } catch (err) {
    stdout = `${err.stdout || ''}${err.stderr || ''}`;
    exitCode = err.status ?? 1;
  }
  console.log(stdout.trim().split('\n').map((l) => '    ' + l).join('\n'));

  const reportPath = path.join(EVIDENCE, 'tokens-validate.json');
  const report = existsSync(reportPath) ? JSON.parse(readFileSync(reportPath, 'utf8')) : null;

  if (report) {
    /* 16 校验器的每一条 error 都必须落在已登记的「不适用项」里，否则判失败 */
    const registered = [];
    try {
      const local = JSON.parse(readFileSync(path.join(ROOT, 'design-tokens.json'), 'utf8'));
      for (const c of local.meta?.alignment?.inapplicableChecks || []) registered.push(c.check);
    } catch { /* 读不到就按未登记处理 */ }

    const errors = report.errors || [];
    const unexplained = errors.filter((e) => !registered.some((r) => e.includes(r) || r.includes(e)));
    if (unexplained.length === 0) {
      const n = errors.length;
      ok('V.3', n
        ? `16 的令牌校验器：无未解释的 error（${n} 项均属已登记的不适用机制项：${registered.join('；')}）`
        : '16 的令牌校验器判定 PASS（0 error）');
    } else {
      bad('V.3', `16 的令牌校验器有 ${unexplained.length} 项未解释的 error：${unexplained.join('；')}`, {
        errors: unexplained,
      });
    }
    if (errors.length) {
      for (const e of errors) console.log(`      （已登记的不适用项）${e}`);
    }
    const warnCount = (report.warnings || []).length;
    if (warnCount) note('V.3', `16 校验器给出 ${warnCount} 条 warning（详见 evidence/tokens-validate.json）`);
  } else {
    bad('V.3', '16 的令牌校验器未产出报告文件');
  }

  /* 清理沙盒：软链目录，用可恢复删除（mavis-trash），不碰任何真实文件 */
  const TRASH = '/Users/mekzenx2/.minimax/bin/mavis-trash';
  if (existsSync(TRASH)) {
    try {
      execFileSync(TRASH, ['--', sandbox], { stdio: 'ignore' });
    } catch {
      console.log(`    (沙盒保留在 ${sandbox}，未删除)`);
    }
  } else {
    console.log(`    (沙盒保留在 ${sandbox}，未删除)`);
  }
  return { stdout, exitCode, report };
}

/* =========================================================
   ② 页面层 —— V.1–V.10 机械判定
   ========================================================= */
const VIEWPORTS = [
  { name: 'desktop-1440', width: 1440, height: 900 },
  { name: 'desktop-1280', width: 1280, height: 820 },
  { name: 'tablet-768', width: 768, height: 1024 },
  { name: 'mobile-390', width: 390, height: 844 },
];

/** 页面内运行的对比度 / 触摸目标 / 焦点探针 */
const PROBE = `(() => {
  /* 颜色解析：用 1×1 canvas 取实际像素。
     本包样式大量使用 color-mix() 等现代颜色语法，computed style 可能是
     "color(srgb ...)" / "oklch(...)"，只认 rgb() 的正则会算不出来。 */
  const cv = document.createElement('canvas'); cv.width = cv.height = 1;
  const g2 = cv.getContext('2d', { willReadFrequently: true });
  const SENTINEL = '#123456';
  const toRgba = (c) => {
    if (!c) return null;
    g2.fillStyle = SENTINEL;
    g2.fillStyle = c;
    if (g2.fillStyle === SENTINEL && !/^#123456$/i.test(c)) return null;
    g2.clearRect(0, 0, 1, 1);
    g2.fillStyle = c; g2.fillRect(0, 0, 1, 1);
    const d = g2.getImageData(0, 0, 1, 1).data;
    return [d[0], d[1], d[2], d[3] / 255];
  };
  const lum = (rgba) => {
    const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
    return 0.2126 * f(rgba[0]) + 0.7152 * f(rgba[1]) + 0.0722 * f(rgba[2]);
  };
  const over = (fg, bg) => {
    const a = fg[3];
    return [fg[0] * a + bg[0] * (1 - a), fg[1] * a + bg[1] * (1 - a), fg[2] * a + bg[2] * (1 - a), 1];
  };
  const bgOf = (el) => {
    let n = el;
    while (n && n !== document.documentElement) {
      const c = getComputedStyle(n).backgroundColor;
      const rgba = toRgba(c);
      if (rgba && rgba[3] > 0) return rgba;
      n = n.parentElement;
    }
    return toRgba(getComputedStyle(document.body).backgroundColor) || [0, 0, 0, 1];
  };
  const ratio = (fgRgba, bgRgba) => {
    if (!fgRgba || !bgRgba) return null;
    const l1 = lum(over(fgRgba, bgRgba)), l2 = lum(bgRgba);
    return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
  };
  const samples = [];
  const targets = [
    ['正文 .lede', '.hero .lede'],
    ['分区说明 .section-lede', '.section-lede'],
    ['注释 .hero-note', '.hero-note'],
    ['统计标签 .stat span', '.stat span'],
    ['导航链接 .ds-topbar__link', '.ds-topbar__link'],
    ['主按钮文字 .ds-btn--primary', '.ds-btn--primary'],
    ['次按钮文字 .ds-btn--ghost', '.ds-btn--ghost'],
    ['筛选 chip .ds-chip', '.ds-chip'],
    ['统计数值 .stat b', '.stat b'],
    ['色板标签 .swatch-meta span', '.swatch-meta span'],
    ['字阶标签 .ts-label', '.ts-label'],
    ['等宽 .ts-sample', '.ts-sample'],
    ['查看器副标题 .viewer-latin', '.viewer-latin'],
    ['查看器提示 .viewer-hint', '.viewer-hint'],
    ['离线状态 #net-chip', '#net-chip'],
    ['页脚 .footer-meta p', '.footer-meta p'],
    ['分区标题 .section-head h2', '.section-head h2'],
    ['眉标 .eyebrow', '.eyebrow'],
  ];
  for (const [name, sel] of targets) {
    const el = document.querySelector(sel);
    if (!el) { samples.push({ name, missing: true }); continue; }
    const cs = getComputedStyle(el);
    const bg = bgOf(el);
    const px = parseFloat(cs.fontSize);
    const w = parseInt(cs.fontWeight) || 400;
    const large = px >= 24 || (px >= 18.66 && w >= 700);
    const r = ratio(toRgba(cs.color), bg);
    samples.push({ name, fg: cs.color, fontSize: px, fontWeight: w, large,
                   ratio: r ? Math.round(r * 100) / 100 : null, required: large ? 3 : 4.5 });
  }
  // 触摸目标
  const belowAA = [], belowAAA = [];
  const PRIMARY = ['ds-btn', 'ds-iconbtn'];
  document.querySelectorAll('button, a[href], input, select').forEach(el => {
    const r = el.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) return;
    const isPrimary = PRIMARY.some(c => el.classList.contains(c)) && !el.classList.contains('ds-btn--sm');
    const rec = { tag: el.tagName, cls: String(el.className||'').slice(0,40), w: Math.round(r.width), h: Math.round(r.height) };
    if (r.height < 24) belowAA.push(rec);
    if (isPrimary && r.height < 44) belowAAA.push(rec);
  });
  // 焦点环
  const focusables = [...document.querySelectorAll('a[href], button:not([disabled]), input, select, [tabindex]:not([tabindex="-1"])')];
  const ringSamples = [];
  for (const el of focusables.slice(0, 12)) {
    el.focus({ preventScroll: true });
    const cs = getComputedStyle(el);
    ringSamples.push({
      cls: String(el.className||'').slice(0,36),
      outlineStyle: cs.outlineStyle,
      outlineWidth: cs.outlineWidth,
      boxShadow: cs.boxShadow === 'none' ? 'none' : 'set',
      isActive: document.activeElement === el,
    });
  }
  const noRing = ringSamples.filter(r => r.isActive && r.outlineStyle === 'none' && r.boxShadow === 'none');
  const fontsLoaded = Array.from(document.fonts).map(f => f.family + ':' + f.status);
  const sameColor = (a, b) => {
    const x = toRgba(a), y = toRgba(b);
    return !!x && !!y && x[0] === y[0] && x[1] === y[1] && x[2] === y[2];
  };
  const rootStyle = getComputedStyle(document.documentElement);
  const stylesheets = Array.from(document.styleSheets).map(sh => {
    try { return { href: (sh.href||'inline').split('/').pop(), rules: sh.cssRules.length }; }
    catch (e) { return { href: (sh.href||'inline').split('/').pop(), rules: -1, blocked: true }; }
  });
  const totalRules = stylesheets.reduce((a, sh) => a + Math.max(0, sh.rules), 0);
  const de = document.documentElement;
  return {
    samples, belowAA, belowAAcount: belowAA.length,
    belowAAA, belowAAAcount: belowAAA.length,
    ringSamples, noRingCount: noRing.length, noRing,
    fontsLoaded, stylesheets, totalRules,
    tokenApplied: {
      bodyBg: sameColor(getComputedStyle(document.body).backgroundColor, rootStyle.getPropertyValue('--ds-bg')),
      primaryBtn: (() => {
        const b = document.querySelector('.ds-btn--primary');
        return b ? sameColor(getComputedStyle(b).backgroundColor, rootStyle.getPropertyValue('--ds-accent')) : null;
      })(),
    },
    scrollWidth: de.scrollWidth, innerWidth,
    lang: de.getAttribute('lang'), theme: de.getAttribute('data-ds-theme'),
    title: document.title,
    dsDurBase: rootStyle.getPropertyValue('--ds-dur-base').trim(),
    dsEntryDuration: rootStyle.getPropertyValue('--ds-entry-duration').trim(),
    reducedMatches: matchMedia('(prefers-reduced-motion: reduce)').matches,
  };
})()`;

/**
 * 启动浏览器并在失败时重试。
 * 同机并发任务多时（实测 load average 可达 150+），Chromium 渲染进程会被 OOM 杀掉，
 * 表现为 "Target page, context or browser has been closed"。
 * 每个阶段用独立浏览器进程、用完立即关闭，失败最多重试 3 次（指数退避）。
 */
async function withBrowser(label, fn, attempts = 3) {
  let lastErr = null;
  for (let i = 1; i <= attempts; i++) {
    let browser = null;
    try {
      browser = await chromium.launch({
        args: ['--enable-unsafe-swiftshader', '--use-angle=swiftshader', '--disable-dev-shm-usage', '--no-sandbox'],
      });
      return await fn(browser);
    } catch (err) {
      lastErr = err;
      const msg = String(err?.message || err).split('\n')[0];
      if (i < attempts) {
        console.log(`  ! ${label} 第 ${i} 次失败（${msg}），${i * 2}s 后重试`);
        await new Promise((r) => setTimeout(r, i * 2000));
      } else {
        console.log(`  ! ${label} 第 ${i} 次失败（${msg}）`);
      }
    } finally {
      if (browser) await browser.close().catch(() => {});
    }
  }
  throw lastErr;
}

async function runPageChecks() {
  console.log('\n▶ ② 页面层：V.1–V.10 机械判定');

  const { server, port } = await startServer(DIST, 0, PREFIX);
  const base = `http://127.0.0.1:${port}${PREFIX}/`;

  const external = [];
  const failedReq = [];
  const consoleErrors = [];
  const statusMap = {};

  try {
    await withBrowser('页面主检查', async (browser) => {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 820 }, deviceScaleFactor: 1 });
    const page = await ctx.newPage();
    page.on('request', (r) => {
      const u = r.url();
      if (!u.startsWith(base) && !u.startsWith('data:') && !u.startsWith('blob:')) external.push(u);
    });
    page.on('requestfailed', (r) => failedReq.push(`${r.url()} ${r.failure()?.errorText || ''}`));
    page.on('console', (m) => { if (m.type() === 'error') consoleErrors.push(m.text()); });
    page.on('pageerror', (e) => consoleErrors.push(`PAGEERROR: ${e.message}`));
    page.on('response', (r) => { statusMap[r.url()] = r.status(); });

    /* ---------- 打开页面 ---------- */
    await page.goto(base, { waitUntil: 'load', timeout: 60000 });
    await page.waitForTimeout(2500);

    /* ---------- V.10 子路径 ---------- */
    const keyUrls = [
      'index.html',
      'assets/fonts/fonts.css',
      'assets/fonts/space-grotesk-latin.woff2',
      'assets/fonts/inter-latin.woff2',
      'assets/fonts/noto-sans-sc-subset.woff2',
      'assets/fonts/FONT-MANIFEST.json',
      'assets/tokens.css',
      'assets/tokens.js',
      'assets/design-tokens.json',
      'assets/assets.manifest.json',
      'assets/icons/icons.svg',
      'assets/icons/index.json',
      'assets/models/model-console-02.glb',
      'assets/posters/poster-home8.png',
      'assets/covers/cover-atlas-hero.png',
      'assets/cases/case-console-02.png',
      'assets/fallback/model-fallback.png',
    ];
    /* 逐个真实发起请求（页面不一定会加载全部资源，不能只看浏览器网络面板） */
    const badStatus = [];
    for (const rel of keyUrls) {
      try {
        const res = await fetch(`${base}${rel}`, { method: 'GET' });
        if (!res.ok) badStatus.push(`${rel} → ${res.status}`);
        else await res.arrayBuffer();
      } catch (e) {
        badStatus.push(`${rel} → 请求失败 ${e.message}`);
      }
    }
    try {
      const res = await fetch(base, { method: 'GET' });
      if (!res.ok) badStatus.push(`目录索引 → ${res.status}`);
      else await res.arrayBuffer();
    } catch (e) {
      badStatus.push(`目录索引 → 请求失败 ${e.message}`);
    }
    if (!badStatus.length) ok('V.10', `子路径下 ${keyUrls.length + 1} 个关键 URL 全部 200`);
    else bad('V.10', `子路径下以下资源非 200：${badStatus.join(', ')}`, { badStatus });

    /* ---------- V.8 外部请求 ---------- */
    if (!external.length) ok('V.8', '运行期零外部网络请求（无 CDN / 无在线 API）');
    else bad('V.8', `发现 ${external.length} 个外部请求：${external.slice(0, 5).join(', ')}`, { external });

    /* ---------- V.9 字体 ---------- */
    const probe = await page.evaluate(PROBE);
    const fontLoaded = probe.fontsLoaded.filter((f) => /:loaded/.test(f));
    const localFonts = ['Space Grotesk', 'Inter', 'Space Mono', 'Noto Sans SC'];
    const loadedFamilies = new Set(probe.fontsLoaded.map((f) => f.split(':')[0]));
    const missingFamilies = localFonts.filter((f) => !loadedFamilies.has(f));
    if (!missingFamilies.length) {
      ok('V.9', `全部 ${localFonts.length} 个自托管字体族已加载（${fontLoaded.length} 个 face）`);
    } else {
      bad('V.9', `字体未加载：${missingFamilies.join(', ')}`, { fontsLoaded: probe.fontsLoaded });
    }

    /* ---------- V.1 水平溢出（四档） ---------- */
    const overflows = [];
    for (const vp of VIEWPORTS) {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.waitForTimeout(700);
      const r = await page.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        innerWidth: window.innerWidth,
      }));
      if (r.scrollWidth > r.innerWidth + 1) overflows.push(`${vp.name}: ${r.scrollWidth} > ${r.innerWidth}`);
    }
    if (!overflows.length) ok('V.1', `1440 / 1280 / 768 / 390 四档均无横向溢出`);
    else bad('V.1', `横向溢出：${overflows.join('；')}`, { overflows });

    /* ---------- V.2 对比度 ---------- */
    await page.setViewportSize({ width: 1280, height: 820 });
    await page.waitForTimeout(500);
    const p2 = await page.evaluate(PROBE);
    const contrastFails = p2.samples.filter((s) => s.ratio !== null && s.ratio < s.required);
    const contrastUnknown = p2.samples.filter((s) => s.ratio === null);
    const measured = p2.samples.filter((s) => s.ratio !== null);
    if (!contrastFails.length) {
      const min = Math.min(...measured.map((s) => s.ratio));
      ok('V.2', `文本对比度达标（${measured.length} 项实测，最低 ${min}:1；缺失 ${contrastUnknown.length} 项）`);
    } else {
      bad('V.2', `对比度不达标：${contrastFails.map((s) => `${s.name}=${s.ratio}(需${s.required})`).join(', ')}`);
    }
    if (contrastUnknown.length) {
      note('V.2', `未取到样式的节点：${contrastUnknown.map((s) => s.name).join(', ')}`);
    }

    /* ---------- V.6 触摸目标 ---------- */
    if (!p2.belowAAcount) ok('V.6', '全部可交互元素高度 ≥24px（WCAG 2.2 AA）');
    else bad('V.6', `${p2.belowAAcount} 个元素高度 <24px：${JSON.stringify(p2.belowAA.slice(0, 8))}`);
    if (!p2.belowAAAcount) ok('V.6', '主按钮与图标按钮高度 ≥44px（AAA）');
    else note('V.6', `${p2.belowAAAcount} 个主控件高度 <44px：${JSON.stringify(p2.belowAAA.slice(0, 8))}`);

    /* ---------- V.5 焦点可达 ---------- */
    if (!p2.noRingCount) ok('V.5', `焦点环始终可见（抽样 ${p2.ringSamples.length} 个可聚焦元素，无 outline:none 且无阴影抵消）`);
    else bad('V.5', `${p2.noRingCount} 个聚焦元素没有可见焦点环：${JSON.stringify(p2.noRing.slice(0, 5))}`);

    /* ---------- Tab 序列不被吞 ---------- */
    await page.evaluate(() => { document.body.focus?.(); window.scrollTo(0, 0); });
    const tabbed = [];
    for (let i = 0; i < 12; i++) {
      await page.keyboard.press('Tab');
      const cur = await page.evaluate(() => {
        const a = document.activeElement;
        return { tag: a?.tagName, cls: String(a?.className || '').slice(0, 30), text: (a?.textContent || '').trim().slice(0, 18) };
      });
      tabbed.push(cur);
    }
    const distinct = new Set(tabbed.map((t) => `${t.tag}.${t.cls}.${t.text}`)).size;
    if (distinct >= 8) ok('V.5', `Tab 序列未被吞（12 次 Tab 得到 ${distinct} 个不同焦点）`);
    else bad('V.5', `Tab 序列疑似被吞（12 次 Tab 只有 ${distinct} 个不同焦点）`, { tabbed });

    /* ---------- 控制台 ---------- */
    if (!consoleErrors.length) ok('CONSOLE', '控制台零错误');
    else bad('CONSOLE', `控制台 ${consoleErrors.length} 条错误：${consoleErrors.slice(0, 5).join(' | ')}`);
    if (!failedReq.length) ok('NET', '无失败请求');
    else bad('NET', `失败请求 ${failedReq.length} 个：${failedReq.slice(0, 5).join(' | ')}`);

    /* ---------- 样式表解析与令牌落地 ---------- */
    const blockedSheets = p2.stylesheets.filter((sh) => sh.blocked);
    if (!blockedSheets.length && p2.totalRules >= 100) {
      ok('CSS', `样式表全部解析（${p2.stylesheets.length} 个样式表 / ${p2.totalRules} 条规则生效）`);
    } else {
      bad('CSS', `样式表解析异常：被阻止 ${blockedSheets.map((s) => s.href).join(', ') || '无'}，规则数 ${p2.totalRules}`);
    }
    if (p2.tokenApplied?.bodyBg && p2.tokenApplied?.primaryBtn) {
      ok('CSS', '设计令牌已在运行期生效（body 背景 = --ds-bg，主按钮底色 = --ds-accent）');
    } else {
      bad('CSS', `设计令牌未在运行期生效：${JSON.stringify(p2.tokenApplied)}`);
    }
    await ctx.close();
    });

    /* ---------- V.7 reduced-motion（独立浏览器进程，避免与主页面叠加内存） ---------- */
    await runReducedMotionChecks(base);
  } finally {
    server.close();
  }
}

/**
 * V.7：系统级 prefers-reduced-motion 下的降级判定。
 * 单独起浏览器进程：同机并发任务多时，Chromium 渲染进程容易因内存压力被 OOM 杀掉。
 */
async function runReducedMotionChecks(base) {
  await withBrowser('reduced-motion 检查', async (browser) => {
    const rmCtx = await browser.newContext({
      viewport: { width: 1280, height: 820 },
      reducedMotion: 'reduce',
    });
    const rmPage = await rmCtx.newPage();
    await rmPage.goto(base, { waitUntil: 'load', timeout: 60000 });
    await rmPage.waitForTimeout(1800);
    const rm = await rmPage.evaluate(`(() => {
      const root = getComputedStyle(document.documentElement);
      const el = document.querySelector('.ds-in') || document.querySelector('.section-head') || document.body;
      const cs = getComputedStyle(el);
      return { durBase: root.getPropertyValue('--ds-dur-base').trim(),
               entryDuration: root.getPropertyValue('--ds-entry-duration').trim(),
               transitionDuration: cs.transitionDuration,
               transform: cs.transform,
               filter: cs.filter,
               matches: matchMedia('(prefers-reduced-motion: reduce)').matches };
    })()`);
    if (rm.matches && rm.durBase === '1ms' && rm.entryDuration === '1ms') {
      ok('V.7', `reduced-motion 生效（dur-base=${rm.durBase}，entry-duration=${rm.entryDuration}）`);
    } else {
      bad('V.7', `reduced-motion 未完全降级：${JSON.stringify(rm)}`);
    }
    await rmCtx.close();
  });
}

/* =========================================================
   ③ 令牌一致性（V.3 / V.4）—— 本包 CSS 层 vs 16 的 CSS 层
   ========================================================= */
function runTokenConsistency() {
  console.log('\n▶ ③ 令牌一致性（V.3 / V.4）：本包 CSS 层 vs 16 的 CSS 层');
  const minePath = path.join(ROOT, 'public', 'assets', 'tokens.css');
  const dsPath = path.join(DS, 'src', 'tokens.css');
  if (!existsSync(minePath) || !existsSync(dsPath)) {
    bad('V.3', '缺少 tokens.css（��包或 16）');
    return;
  }
  const mine = readFileSync(minePath, 'utf8');
  const ds = readFileSync(dsPath, 'utf8');
  const dsJson = JSON.parse(readFileSync(path.join(ROOT, 'design-tokens.json'), 'utf8'));

  /* 解析 :root 里的 --ds-* 变量 */
  const grab = (css) => {
    const i = css.indexOf(':root');
    const open = css.indexOf('{', i);
    let depth = 0, end = -1;
    for (let j = open; j < css.length; j++) {
      if (css[j] === '{') depth++;
      else if (css[j] === '}') { depth--; if (depth === 0) { end = j; break; } }
    }
    const body = css.slice(open + 1, end);
    const vars = {};
    for (const m of body.matchAll(/(--[a-z0-9-]+)\s*:\s*([^;]+);/gi)) vars[m[1]] = m[2].trim().replace(/\s+/g, ' ');
    return vars;
  };
  const mineVars = grab(mine);
  const dsVars = grab(ds);

  const names = new Set([...Object.keys(mineVars), ...Object.keys(dsVars)]);
  const diffs = [];
  for (const n of names) {
    const a = mineVars[n];
    const b = dsVars[n];
    if (a === undefined) { diffs.push({ name: n, kind: 'missing-in-mine', ds: b }); continue; }
    if (b === undefined) { diffs.push({ name: n, kind: 'extra-in-mine', mine: a }); continue; }
    const norm = (s) => s.replace(/["']/g, '"').replace(/\s+/g, ' ').trim();
    if (norm(a) !== norm(b)) diffs.push({ name: n, kind: 'value-differs', mine: a, ds: b });
  }
  if (!diffs.length) ok('V.3', `本包 tokens.css 的 ${names.size} 个 --ds-* 取值与 16 逐项一致`);
  else bad('V.3', `与 16 的 CSS 层有 ${diffs.length} 项不一致：${diffs.slice(0, 5).map((d) => d.name).join(', ')}`, { diffs });

  /* V.4 命名空间冲突：同名变量不得有不同义 */
  const conflicts = diffs.filter((d) => d.kind === 'value-differs');
  if (!conflicts.length) ok('V.4', `无同名不同义的 --ds-* 变量（比对 ${names.size} 个）`);
  else bad('V.4', `${conflicts.length} 个同名变量取值不同：${conflicts.map((d) => d.name).join(', ')}`);

  /* JSON 层：designSystem 与 16 的令牌树一致 */
  const myTree = dsJson.designSystem;
  const srcTree = JSON.parse(readFileSync(path.join(DS, 'design-tokens.json'), 'utf8'));
  const stripMeta = (t) => { const { meta, ...rest } = t; return rest; };
  const same = JSON.stringify(stripMeta(myTree)) === JSON.stringify(stripMeta(srcTree));
  if (same) ok('V.3', 'design-tokens.json 的 designSystem 令牌树与 16 逐字节一致');
  else bad('V.3', 'designSystem 令牌树与 16 不一致');
}

/* =========================================================
   主流程
   ========================================================= */
console.log('回响电玩馆 — 设计系统符合性验收（16 §9 V.1–V.10）');
console.log('='.repeat(62));

const startedAt = new Date().toISOString();
const tokenRun = runDsTokenValidator();
runTokenConsistency();
await runPageChecks();

/* ---------- 落盘 ---------- */
mkdirSync(EVIDENCE, { recursive: true });
const report = {
  generatedAt: startedAt,
  finishedAt: new Date().toISOString(),
  spec: '16-design-system/MIGRATION-NOTES.md §9 验收清单 V.1–V.10',
  target: '07-museum-art',
  subpath: PREFIX,
  verdicts: {
    pass,
    fail: failures.length,
  },
  results,
  dsTokenValidator: tokenRun?.report ?? null,
  /* 指纹说明：
     本包的 tokens.css 在 16 的 --ds-* 之外还多出 --atlas-* 别名层、:lang(zh) 排版规则、
     reduced-motion 降级块与说明注释；design-tokens.json 在 16 令牌树之外还多出
     meta/local/compat/cssVars 分区。因此**文件级 SHA-256 本就不应相等**，
     真正的一致性判据是「逐项取值比对」，见 results 中 V.3 / V.4 的结论。
     下列指纹用于记录各自依据的来源版本，便于 13 / 14 复核时对齐同一次对齐。 */
  fingerprints: {
    source: {
      note: '16 的源文件指纹（本次对齐的依据版本）',
      dsTokensCss: existsSync(path.join(DS, 'src', 'tokens.css')) ? sha256(path.join(DS, 'src', 'tokens.css')) : null,
      dsDesignTokens: existsSync(path.join(DS, 'design-tokens.json')) ? sha256(path.join(DS, 'design-tokens.json')) : null,
    },
    local: {
      note: '本包产物指纹（含额外的别名层与兼容视图，故与 16 不同）',
      tokensCss: sha256(path.join(ROOT, 'public', 'assets', 'tokens.css')),
      designTokens: sha256(path.join(ROOT, 'design-tokens.json')),
    },
    alignedAt: existsSync(path.join(ROOT, 'design-tokens.json'))
      ? JSON.parse(readFileSync(path.join(ROOT, 'design-tokens.json'), 'utf8')).meta?.alignment?.alignedAt ?? null
      : null,
  },
};
writeFileSync(path.join(EVIDENCE, 'ds-conformance.json'), JSON.stringify(report, null, 2) + '\n', 'utf8');

console.log('\n' + '='.repeat(62));
console.log(`通过 ${pass} 项，失败 ${failures.length} 项`);
if (failures.length) {
  console.log('\n失败项：');
  failures.forEach((f) => console.log('  ✗ ' + f));
  console.log(`\n证据：evidence/ds-conformance.json`);
  process.exit(1);
}
console.log(`证据：evidence/ds-conformance.json · evidence/tokens-validate.json`);
console.log('✓ V.1–V.10 符合性验收全部通过。');
