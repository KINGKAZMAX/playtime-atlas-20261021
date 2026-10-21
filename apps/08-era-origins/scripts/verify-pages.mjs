#!/usr/bin/env node
/**
 * 08-era-origins 页面机械检查器（Ego 路径）
 * ---------------------------------------------------------------------------
 * **浏览器入口已迁移到 Ego**（批次统一规范）：
 *   - 标准检查项直接复用批次共享运行器 `tools/ego-qa/lib/runner.mjs`
 *     （四档视口 + 视口精度自检 / 横向溢出 / 对比度 / 触摸目标 /
 *       reduced-motion / 渲染字体 / 零外部请求 / 控制台 / 破图 / 截图）
 *   - 08 专属**运行期**检查项（G.3 标题 nowrap、G.4 中文字距与行高、
 *     Tab 焦点遍历与焦点环、`--ds-base` 注入、lang / 深色主题 / ds-shell）
 *     在同一次 Ego 会话内追加。
 *   - 08 专属**源码侧**检查项（7 张样式表的顺序、`<head>` 内联注入 `--ds-base`、
 *     `<body>` 带 `ds-shell`）在本进程内做 —— 构建产物会把 CSS 合并成 chunk，
 *     顺序必须在源码里校验。
 *
 * 依据：16-design-system/MIGRATION-NOTES.md §9 验收清单 V.1—V.9
 *      15-supervisor/RESTYLE-SPEC.md G.3 / G.4 / §3.3
 *      批次根 tools/ego-qa/MIGRATION.md（Playwright → Ego 改造）
 *
 * 迁移说明：此前版本在本机自启无头 Chrome（CDP），按 2026-10-22 起的长期约定
 * 「所有网页调试 / 截图 / 验收一律走 Ego」，已改为经 `ego-browser nodejs` 执行。
 *
 * 用法: node scripts/verify-pages.mjs [distDir] [outDir]
 */
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import os from 'node:os';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');
const DIST = path.resolve(process.argv[2] || path.join(ROOT, 'dist'));
const OUT = path.resolve(process.argv[3] || path.join(ROOT, 'screenshots/verify'));
const BATCH = path.resolve(ROOT, '..');
const RUNNER = path.join(BATCH, 'tools/ego-qa/lib/runner.mjs');
const EGO_BIN = process.env.EGO_BROWSER_BIN || '/Users/mekzenx2/.local/bin/ego-browser';

if (!fs.existsSync(RUNNER)) { console.error('找不到批次共享运行器：', RUNNER); process.exit(2); }
if (!fs.existsSync(EGO_BIN)) { console.error('找不到 ego-browser：', EGO_BIN); process.exit(2); }
fs.mkdirSync(OUT, { recursive: true });

/* ================= 源码侧检查（不涉及浏览器） ================= */
const sourceChecks = {};
{
  // 既有 CSS → 规范层 → 08 专属层。展厅页加载 shell.css，游戏页加载 game.css（互斥）。
  const order = [
    'src/styles/base.css', 'src/styles/shell.css', 'src/styles/game.css',
    'assets/ds/tokens.css', 'assets/ds/components.css', 'assets/ds/fonts/fonts.css',
    'src/styles/tokens.css', 'src/styles/components.css',
  ];
  for (const file of ['index.html', 'rally.html', 'gravity.html']) {
    const html = fs.readFileSync(path.join(ROOT, file), 'utf8');
    const links = [...html.matchAll(/<link[^>]+rel="stylesheet"[^>]+href="\.\/([^"]+)"/g)].map((m) => m[1]);
    const present = order.filter((n) => links.includes(n));
    const pos = (n) => links.indexOf(n);
    const ordered = present.every((n, i) => i === 0 || pos(present[i - 1]) < pos(n));
    // 该页应当出现的 7 张表（shell / game 互斥）
    const isShellOrGame = (n) => n.includes('shell.css') || n.includes('game.css');
    const expect = order.filter((n) => {
      if (!isShellOrGame(n)) return true;
      return file === 'index.html' ? n.includes('shell.css') : n.includes('game.css');
    });
    const dsBase = /<style>[\s\S]*?--ds-base:\s*"\/playtime-atlas-20261021\/"[^}]*\}/.test(html);
    const dsShell = /<body[^>]*class="[^"]*\bds-shell\b[^"]*"/.test(html);
    const lang = /<html[^>]*lang="zh-CN"/.test(html);
    sourceChecks[file] = {
      links, ordered, dsBase, dsShell, lang,
      orderOk: ordered && present.length === expect.length && expect.every((n) => links.includes(n)),
    };
  }
}

/* ================= 静态服务器（Pages 子路径形状） ================= */
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
const BASE = `http://127.0.0.1:${server.address().port}${MOUNT}`;

/* ================= 每页的检查配置 ================= */
const COMMON_CONTRAST = [
  ['正文 .ds-body', '.ds-body'], ['次级 .ds-sm', '.ds-sm'], ['占位 .ds-xs', '.ds-xs'],
  ['标题 .ds-h3', '.ds-h3'], ['封面标题 .ds-cover__title', '.ds-cover__title'],
  ['等宽 .ds-mono', '.ds-mono'], ['标签 .ds-tag', '.ds-tag'],
  ['主按钮文字', '.ds-btn--primary'], ['次按钮文字', '.ds-btn--secondary'],
  ['幽灵按钮文字', '.ds-btn--ghost'], ['筛选 chip', '.ds-chip'],
  ['轴标 .ds-rail__item', '.ds-rail__item'],
];
/**
 * 16 明确：HUD 文字对比度 ≥4.5:1 **不豁免**。
 * 覆盖层在 idle 态即显示（`renderOverlay()` 在 state==='idle' 时不隐藏），
 * 因此无需交互即可取样。
 */
const HUD_CONTRAST = [
  ['HUD 覆盖层标题', '.overlay__title'], ['HUD 覆盖层说明', '.overlay__desc'],
  ['HUD 覆盖层眉标', '.overlay__kicker'], ['HUD 覆盖层脚注', '.overlay__meta'],
  ['HUD 焦点提示', '.focus-hint'],
];
/**
 * 12 个规范样本选择器里，**每个页面只列该页真实存在的那些** ——
 * 共享运行器会对「缺失」的样本算出 undefined，混进 min 统计里变成 NaN。
 * 游戏页没有封面标题 / 导航轴 / 标签（那是展厅页的结构），不列。
 */
const GAME_CONTRAST = [
  ['正文 .ds-body', '.ds-body'], ['次级 .ds-sm', '.ds-sm'], ['等宽 .ds-mono', '.ds-mono'],
  ['主按钮文字', '.ds-btn--primary'], ['次按钮文字', '.ds-btn--secondary'],
  ['幽灵按钮文字', '.ds-btn--ghost'], ['筛选 chip', '.ds-chip'],
];
const PAGES = [
  { file: 'index.html', label: 'index', font: '.hero__latin', contrast: COMMON_CONTRAST,
    require: ['.ds-topbar', '.ds-footer', '.ds-skip', '.ds-grid', '.ds-work', '.ds-chip'] },
  { file: 'rally.html', label: 'rally', font: '.topbar__title span',
    contrast: [...GAME_CONTRAST, ...HUD_CONTRAST],
    require: ['.ds-topbar', '.ds-footer', '.ds-skip', '.ds-canvas-frame', '.ds-chip'] },
  { file: 'gravity.html', label: 'gravity', font: '.topbar__title span',
    contrast: [...GAME_CONTRAST, ...HUD_CONTRAST],
    require: ['.ds-topbar', '.ds-footer', '.ds-skip', '.ds-canvas-frame', '.ds-chip'] },
];

/* ================= 生成一次性 Ego 脚本 ================= */
const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ego-lumen-pages-'));
const scriptPath = path.join(tmpDir, 'pages.mjs');

const egoScript = `
/* 由 scripts/verify-pages.mjs 生成 —— 不要手改 */
import fs from 'node:fs';
import path from 'node:path';
const { runEgoQa } = await import(${JSON.stringify('file://' + RUNNER)});

const CFG = ${JSON.stringify({
  base: BASE, outDir: OUT, space: '08-era-origins ego-qa',
  pages: PAGES.map((p) => ({ file: p.file, label: p.label, font: p.font, contrast: p.contrast, require: p.require })),
})};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const out = { tool: 'scripts/verify-pages.mjs (Ego)', generatedAt: new Date().toISOString(), base: CFG.base, pages: {}, errors: [], warnings: [] };
const ok = (k, n, d) => { out.pages[k] ||= { checks: [] }; out.pages[k].checks.push({ name: n, status: 'pass', detail: d }); console.log('  \\u2713', n, d ? '\\u2014 ' + d : ''); };
const bad = (k, n, d) => { out.pages[k] ||= { checks: [] }; out.pages[k].checks.push({ name: n, status: 'fail', detail: d }); out.errors.push(k + ' ' + n + ': ' + d); console.log('  \\u2717', n, '\\u2014', d); };

/* ---- 08 专属运行期检查项 ---- */
async function extras(page, file) {
  await page.cdp('Emulation.setDeviceMetricsOverride', { width: 1440, height: 900, deviceScaleFactor: 1, mobile: true });
  await page.goto(CFG.base + file);
  await page.waitForLoadState('load');
  await sleep(700);

  const typo = await page.evaluate(() => {
    const heads = [...document.querySelectorAll('h1, h2, h3, .ds-display, .ds-h1, .ds-h2, .ds-h3')];
    const nowrap = heads.filter((el) => getComputedStyle(el).whiteSpace === 'nowrap')
      .map((el) => el.tagName + '.' + String(el.className || '').split(' ')[0]);
    // 正文载体：优先规范层 .ds-body；其次 08 既有正文段。必须「可见」，
    // 排除 .sr-only / [hidden] / 瞬态 HUD（它们带 caps 字距，会让结论失真）。
    const vis = (el) => !!el && el.getClientRects().length > 0
      && !el.closest('.sr-only') && !el.closest('[hidden]')
      && !el.closest('.overlay') && !el.closest('.game-frame');
    let body = null, bodySel = null;
    for (const sel of ['.ds-body', '.section__intro', 'p.ds-body', '.note']) {
      const el = document.querySelector(sel);
      if (vis(el)) { body = el; bodySel = sel; break; }
    }
    if (!body) {
      const ps = [...document.querySelectorAll('p')].filter(vis);
      if (ps.length) { body = ps[0]; bodySel = 'p(首个可见段落)'; }
    }
    const bs = body ? getComputedStyle(body) : null;
    const ls = bs ? bs.letterSpacing : null;
    // letter-spacing 计算值可能是 'normal'（等价 0），必须归一化后再判定
    const lsNum = ls === null || ls === undefined ? null
      : (ls === 'normal' ? 0 : (Number.isFinite(parseFloat(ls)) ? parseFloat(ls) : null));
    const lh = bs ? parseFloat(bs.lineHeight) / parseFloat(bs.fontSize) : null;
    const html = getComputedStyle(document.documentElement);
    return {
      nowrap, bodySel, bodyTag: body ? body.tagName + '.' + String(body.className || '').split(' ')[0] : null,
      letterSpacing: ls, letterSpacingNum: lsNum,
      lineHeightRatio: lh ? Math.round(lh * 100) / 100 : null,
      trackCjk: html.getPropertyValue('--ds-track-cjk').trim(),
      lang: document.documentElement.getAttribute('lang'),
      theme: document.documentElement.getAttribute('data-ds-theme'),
      dsBase: html.getPropertyValue('--ds-base').trim(),
      bodyClass: document.body.className,
    };
  });
  const k = file.replace('.html', '');
  if (!typo.nowrap.length) ok(k, '标题未使用 nowrap（G.3）', '标题全部允许换行');
  else bad(k, '标题未使用 nowrap（G.3）', typo.nowrap.join(', '));
  if (typo.letterSpacingNum !== null && typo.letterSpacingNum >= 0) {
    ok(k, '中文字距归零（G.4）', 'letter-spacing=' + typo.letterSpacing + '（归一 ' + typo.letterSpacingNum + '；取样 ' + typo.bodySel + ' ' + typo.bodyTag + '；--ds-track-cjk=' + typo.trackCjk + '）');
  } else {
    bad(k, '中文字距归零（G.4）', 'letter-spacing=' + typo.letterSpacing + '；取样 ' + typo.bodySel + ' ' + typo.bodyTag);
  }
  if (typo.lineHeightRatio !== null && Math.abs(typo.lineHeightRatio - 1.85) < 0.02) {
    ok(k, '中文正文行高 1.85（G.4）', '实测 ' + typo.lineHeightRatio + '（取样 ' + typo.bodySel + ' ' + typo.bodyTag + '）');
  } else {
    bad(k, '中文正文行高 1.85（G.4）', '实测 ' + typo.lineHeightRatio + '（取样 ' + typo.bodySel + ' ' + typo.bodyTag + '）');
  }
  if (typo.lang === 'zh-CN') ok(k, 'lang 标记', typo.lang);
  else bad(k, 'lang 标记', String(typo.lang));
  if (typo.theme === 'dark') ok(k, '深色主题标记', typo.theme);
  else bad(k, '深色主题标记', String(typo.theme));
  if (typo.dsBase) ok(k, '--ds-base 已注入', typo.dsBase);
  else bad(k, '--ds-base 已注入', '未找到');
  if ((typo.bodyClass || '').includes('ds-shell')) ok(k, 'body.ds-shell', typo.bodyClass);
  else bad(k, 'body.ds-shell', String(typo.bodyClass));

  // Tab 焦点遍历：真实按键（Ego keyboard.press 走浏览器默认焦点移动）
  await page.evaluate(() => { document.activeElement?.blur?.(); });
  const seen = [];
  for (let i = 0; i < 8; i++) {
    await page.keyboard.press('Tab');
    const info = await page.evaluate(() => {
      const el = document.activeElement;
      if (!el || el === document.body) return null;
      const cs = getComputedStyle(el);
      const outline = cs.outlineStyle !== 'none' && parseFloat(cs.outlineWidth) > 0;
      const shadow = cs.boxShadow && cs.boxShadow !== 'none';
      return {
        tag: el.tagName, id: el.id, cls: String(el.className || '').split(' ')[0],
        text: (el.textContent || '').trim().slice(0, 24),
        ring: outline || shadow,
        outline: cs.outline, boxShadow: String(cs.boxShadow).slice(0, 70),
      };
    });
    if (!info) break;
    // 去重键必须含 class 与文本：站内多数链接 id 为空，只用 tag#id 会全部塌缩成同一个键
    const key = info.tag + '|' + info.id + '|' + info.cls + '|' + info.text;
    if (seen.some((s) => s.key === key)) break;
    seen.push({ ...info, key });
  }
  const ringed = seen.filter((s) => s.ring).length;
  const label = (s) => s.tag + '#' + (s.id || s.cls);
  if (seen.length > 0 && ringed === seen.length) {
    ok(k, 'Tab 序列未被吞且焦点环可见', '可达 ' + seen.length + ' 个，' + ringed + '/' + seen.length + ' 有焦点环：' + seen.map(label).join(' → '));
  } else {
    bad(k, 'Tab 序列未被吞且焦点环可见', '可达 ' + seen.length + '，有环 ' + ringed + '；缺环 ' + seen.filter((s) => !s.ring).map(label).join(', '));
  }
  out.pages[k].tab = seen;
  out.pages[k].typo = typo;
}

/* ---- 主流程 ---- */
for (const p of CFG.pages) {
  console.log('\\n\\u25b6 ' + p.file);
  const rep = await runEgoQa({
    url: CFG.base + p.file,
    spaceName: CFG.space,
    outDir: CFG.outDir,
    label: p.label,
    viewports: [
      { name: 'desktop-1440', width: 1440, height: 900, dpr: 1 },
      { name: 'desktop-1280', width: 1280, height: 800, dpr: 1 },
      { name: 'tablet-768', width: 768, height: 1024, dpr: 1 },
      { name: 'mobile-390', width: 390, height: 844, dpr: 2 },
    ],
    textSelectors: p.contrast,
    primaryClasses: ['ds-btn', 'ds-iconbtn'],
    requiredSelectors: p.require,
    fontSelector: p.font,
    allowExternal: false,
    checkReducedMotion: true,
    checkA11y: true,
  });
  out.pages[p.label] = { standard: rep, checks: [] };
  for (const c of rep.errors) out.errors.push(p.label + ' ' + c);
  for (const w of rep.warnings) out.warnings.push(p.label + ' ' + w);

  // 08 专属检查沿用同一 TaskSpace（按名复用）
  const task = await taskSpace(CFG.space);
  const page = task.page('p1');
  await extras(page, p.file);
  out.pages[p.label].standardReportPath = rep.reportPath;
}

out.verdict = out.errors.length ? 'FAIL' : 'PASS';
fs.writeFileSync(path.join(CFG.outDir, 'pages-verification.json'), JSON.stringify(out, null, 2) + '\\n', 'utf8');
console.log('\\n\\u2705 pages verification: ' + out.verdict);
console.log('errors: ' + out.errors.length + ' | warnings: ' + out.warnings.length);
`;

fs.writeFileSync(scriptPath, egoScript, 'utf8');

console.log('Ego 验收：' + BASE);
console.log('  输出  ：' + OUT);
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

/* ---------- 汇总：合并源码侧检查 + 压平截图目录 ---------- */
const shotDir = path.join(OUT, 'screenshots');
if (fs.existsSync(shotDir)) {
  for (const f of fs.readdirSync(shotDir)) {
    if (f.endsWith('.png')) fs.renameSync(path.join(shotDir, f), path.join(OUT, f));
  }
  try { fs.rmSync(shotDir, { recursive: true, force: true }); } catch { /* ignore */ }
}

const reportPath = path.join(OUT, 'pages-verification.json');
const report = fs.existsSync(reportPath) ? JSON.parse(fs.readFileSync(reportPath, 'utf8')) : { errors: [], warnings: [] };
report.pages ||= {};
const srcErrors = [];
for (const [file, c] of Object.entries(sourceChecks)) {
  const k = file.replace('.html', '');
  const checks = (report.pages[k] ||= { checks: [] }).checks;
  const push = (name, good, detail) => {
    checks.push({ name, status: good ? 'pass' : 'fail', detail });
    if (!good) srcErrors.push(k + ' ' + name + ': ' + detail);
    console.log(good ? '  \u2713' : '  \u2717', name, '\u2014', detail);
  };
  push('源码样式表顺序（既有 → 规范层 → 08 专属层）', c.orderOk, c.links.join(' → '));
  push('源码 --ds-base 内联注入', c.dsBase, '--ds-base: "/playtime-atlas-20261021/"');
  push('源码 body.ds-shell', c.dsShell, 'class 含 ds-shell');
  push('源码 lang="zh-CN"', c.lang, 'html lang="zh-CN"');
}
report.sourceChecks = sourceChecks;
report.errors = [...(report.errors || []), ...srcErrors];
report.verdict = report.errors.length ? 'FAIL' : 'PASS';
fs.writeFileSync(reportPath, JSON.stringify(report, null, 2) + '\n', 'utf8');

console.log('\n' + (report.verdict === 'PASS' ? '✅' : '❌') + ` pages verification: ${report.verdict}`);
console.log(`errors: ${report.errors.length} | warnings: ${(report.warnings || []).length}`);
server.close();
process.exit(report.errors.length ? 1 : 0);
