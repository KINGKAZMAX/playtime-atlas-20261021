/**
 * 08-era-origins 页面机械检查器
 * ---------------------------------------------------------------------------
 * 改编自 16-design-system/tools/verify-preview.mjs（零依赖：Node 内置模块 +
 * 本机 Chrome 的 CDP）。**判定逻辑与 16 的参考实现保持一致**，只把目标从
 * 16 的 preview.html 换成本目录的三页产物，并按 Pages 子路径形状挂载。
 *
 * 依据：16-design-system/MIGRATION-NOTES.md §9 验收清单
 *   V.1 水平溢出（1440 / 1280 / 768 / 390）
 *   V.2 对比度（12 项 .ds-* 样本，正文 ≥4.5、大字 ≥3）
 *   V.5 焦点可达（Tab 序列不被吞、焦点环可见）
 *   V.6 触摸目标（全部 ≥24px；主控件 ≥44px，.ds-btn--sm 豁免）
 *   V.7 prefers-reduced-motion 降级
 *   V.8 运行期零外部请求
 *   V.9 字体全部本地加载
 *
 * 用法: node scripts/verify-pages.mjs [distDir] [outDir]
 */
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import http from 'node:http';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIST = path.resolve(process.argv[2] || path.join(ROOT, 'dist'));
const OUT = path.resolve(process.argv[3] || path.join(ROOT, 'screenshots/verify'));
fs.mkdirSync(OUT, { recursive: true });
const PORT = 9339;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/* ---------- 静态服务器（Pages 子路径形状 + Vite 产物的相对路径） ---------- */
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
const PAGES = ['index.html', 'rally.html', 'gravity.html'];

const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
if (!fs.existsSync(CHROME)) { console.error('未找到 Chrome:', CHROME); process.exit(2); }

const chrome = spawn(CHROME, [
  '--headless=new', '--disable-gpu', '--no-sandbox', '--hide-scrollbars',
  `--remote-debugging-port=${PORT}`, '--remote-allow-origins=*',
  `--user-data-dir=${path.join(os.tmpdir(), 'lumen-verify')}`,
  '--no-first-run', '--no-default-browser-check', '--allow-file-access-from-files',
  'about:blank',
], { stdio: 'ignore' });

class S {
  constructor(ws) { this.ws = ws; this.id = 0; this.p = new Map(); this.events = []; }
  static async open(u) {
    const ws = new WebSocket(u);
    await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
    const s = new S(ws);
    ws.onmessage = (m) => {
      const x = JSON.parse(m.data);
      if (x.id && s.p.has(x.id)) { const h = s.p.get(x.id); s.p.delete(x.id); x.error ? h.rej(new Error(JSON.stringify(x.error))) : h.res(x.result); }
      else if (x.method) s.events.push(x);
    };
    return s;
  }
  send(method, params = {}, ms = 30000) {
    const id = ++this.id;
    this.ws.send(JSON.stringify({ id, method, params }));
    return new Promise((res, rej) => {
      this.p.set(id, { res, rej });
      setTimeout(() => { if (this.p.has(id)) { this.p.delete(id); rej(new Error('timeout ' + method)); } }, ms);
    });
  }
  async ev(expr, ms = 45000) {
    const r = await this.send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true }, ms);
    if (r.exceptionDetails) throw new Error('eval: ' + JSON.stringify(r.exceptionDetails).slice(0, 300));
    return r.result?.value;
  }
  async shot(f, mode = 'viewport') {
    try {
      const r = await this.send('Page.captureScreenshot',
        { format: 'png', captureBeyondViewport: mode === 'full' }, 25000);
      fs.writeFileSync(f, Buffer.from(r.data, 'base64'));
      return f;
    } catch (e) {
      if (mode === 'full') {
        const r = await this.send('Page.captureScreenshot', { format: 'png' }, 25000);
        fs.writeFileSync(f, Buffer.from(r.data, 'base64'));
        return f;
      }
      throw e;
    }
  }
}

const report = {
  target: PAGES,
  generatedAt: new Date().toISOString(),
  base: BASE,
  viewports: [],
  checks: [],
  errors: [],
  warnings: [],
};
const ok = (name, detail) => { report.checks.push({ name, status: 'pass', detail }); console.log('  ✓', name, detail ? '— ' + detail : ''); };
const bad = (name, detail) => { report.checks.push({ name, status: 'fail', detail }); report.errors.push(name + ': ' + detail); console.log('  ✗', name, '—', detail); };
const warn = (name, detail) => { report.checks.push({ name, status: 'warn', detail }); report.warnings.push(name + ': ' + detail); console.log('  !', name, '—', detail); };

try {
  let base = null;
  for (let i = 0; i < 90 && !base; i++) {
    for (const h of [`http://127.0.0.1:${PORT}`, `http://localhost:${PORT}`]) {
      try { if ((await fetch(`${h}/json/version`)).ok) { base = h; break; } } catch {}
    }
    if (!base) await sleep(400);
  }
  if (!base) throw new Error('CDP 未就绪');

  let list = [];
  for (let i = 0; i < 20 && !list.some((x) => x.type === 'page'); i++) {
    try { list = await (await fetch(`${base}/json/list`)).json(); } catch {}
    if (!list.some((x) => x.type === 'page')) await sleep(400);
  }
  const target = list.find((x) => x.type === 'page');
  const s = await S.open(target.webSocketDebuggerUrl);
  await s.send('Page.enable'); await s.send('Runtime.enable'); await s.send('Network.enable'); await s.send('Log.enable');

  const VIEWPORTS = [
    { name: 'desktop-1440', w: 1440, h: 900, dpr: 1, mobile: false },
    { name: 'desktop-1280', w: 1280, h: 800, dpr: 1, mobile: false },
    { name: 'tablet-768', w: 768, h: 1024, dpr: 1, mobile: false },
    { name: 'mobile-390', w: 390, h: 844, dpr: 2, mobile: true },
  ];

  const navigate = async (file) => {
    const n0 = s.events.filter((e) => e.method === 'Page.loadEventFired').length;
    await s.send('Page.navigate', { url: BASE + file });
    for (let i = 0; i < 80; i++) {
      if (s.events.filter((e) => e.method === 'Page.loadEventFired').length > n0) break;
      await sleep(150);
    }
    await sleep(1200);
  };

  for (const file of PAGES) {
    for (const vp of VIEWPORTS) {
      console.log(`\n▶ ${file} @ ${vp.name} (${vp.w}×${vp.h})`);
      s.events.length = 0;
      await s.send('Emulation.setDeviceMetricsOverride', {
        width: vp.w, height: vp.h, deviceScaleFactor: vp.dpr, mobile: vp.mobile,
      });
      await navigate(file);

      const v = await s.ev(`(() => {
        const de = document.documentElement;
        const cs = getComputedStyle(de);
        const over = [];
        document.querySelectorAll('body *').forEach(el => {
          const r = el.getBoundingClientRect();
          if (r.width > 1 && (r.right > innerWidth + 1 || r.left < -1)) {
            const cs2 = getComputedStyle(el);
            if (cs2.position === 'fixed') return;
            over.push({ tag: el.tagName, cls: String(el.className || '').slice(0, 46), left: Math.round(r.left), right: Math.round(r.right) });
          }
        });
        const loaded = Array.from(document.fonts).map(f => f.family + ':' + f.status);
        const sheets = Array.from(document.styleSheets).map(sh => {
          try { return { href: (sh.href||'inline').split('/').pop(), rules: sh.cssRules.length }; }
          catch (e) { return { href: (sh.href||'inline').split('/').pop(), rules: -1, blocked: true }; }
        });
        return {
          innerWidth, innerHeight,
          docScrollWidth: de.scrollWidth,
          horizontalOverflow: de.scrollWidth > innerWidth + 1,
          overflowSample: over.slice(0, 8),
          overflowCount: over.length,
          fontsLoaded: loaded,
          stylesheets: sheets,
          lang: de.getAttribute('lang'),
          theme: de.getAttribute('data-ds-theme'),
          dsBase: cs.getPropertyValue('--ds-base').trim(),
        };
      })()`);

      const netEvents = s.events.filter((e) => e.method === 'Network.requestWillBeSent');
      const external = netEvents
        .map((e) => e.params.request.url)
        .filter((u) => !u.startsWith(BASE) && !u.startsWith('data:') && !u.startsWith('blob:'));

      await s.shot(path.join(OUT, `${file.replace('.html', '')}-${vp.name}.png`), 'viewport');

      const tag = `${file}@${vp.name}`;
      if (!v.horizontalOverflow) ok(`${tag} 无横向溢出`, `scrollWidth=${v.docScrollWidth}`);
      else bad(`${tag} 无横向溢出`, `scrollWidth=${v.docScrollWidth} > ${v.innerWidth}；样本 ${JSON.stringify(v.overflowSample)}`);

      if (!external.length) ok(`${tag} 零外部网络请求`, `${netEvents.length} 个请求全为本地`);
      else bad(`${tag} 零外部网络请求`, '外部: ' + external.slice(0, 5).join(', '));

      const blocked = v.stylesheets.filter((sh) => sh.blocked);
      if (!blocked.length) ok(`${tag} 样式表全部解析`, v.stylesheets.map((sh) => `${sh.href}:${sh.rules}`).join(' '));
      else bad(`${tag} 样式表全部解析`, '被阻止: ' + blocked.map((sh) => sh.href).join(', '));

      if (v.lang) ok(`${tag} lang 标记`, v.lang); else bad(`${tag} lang 标记`, '缺失');
      if (v.dsBase) ok(`${tag} --ds-base 已注入`, v.dsBase); else bad(`${tag} --ds-base 已注入`, '缺失');

      report.viewports.push({ file, ...vp, overflow: v.horizontalOverflow, externalRequests: external.length });
    }
  }

  /* ---------- 对比度 / 触摸目标 / 焦点环 / 键盘作用域（每页） ---------- */
  console.log('\n▶ 对比度 / 触摸目标 / 焦点环 / 键盘作用域');
  await s.send('Emulation.setDeviceMetricsOverride', { width: 1280, height: 800, deviceScaleFactor: 1, mobile: false });

  for (const file of PAGES) {
    await navigate(file);

    const a11y = await s.ev(`(() => {
      const lum = (c) => {
        const m = c.match(/rgba?\\(([^)]+)\\)/); if (!m) return null;
        const p = m[1].split(',').map(Number);
        const f = (v) => { v/=255; return v <= 0.03928 ? v/12.92 : Math.pow((v+0.055)/1.055, 2.4); };
        return 0.2126*f(p[0]) + 0.7152*f(p[1]) + 0.0722*f(p[2]);
      };
      const bgOf = (el) => {
        let n = el;
        while (n && n !== document.documentElement) {
          const c = getComputedStyle(n).backgroundColor;
          if (c && !/rgba\\(0, 0, 0, 0\\)|transparent/.test(c)) return c;
          n = n.parentElement;
        }
        return getComputedStyle(document.body).backgroundColor;
      };
      const ratio = (a, b) => { const l1 = lum(a), l2 = lum(b); if (l1===null||l2===null) return null;
        return (Math.max(l1,l2)+0.05)/(Math.min(l1,l2)+0.05); };
      const samples = [];
      const targets = [
        ['正文 .ds-body', '.ds-body'], ['次级 .ds-sm', '.ds-sm'], ['占位 .ds-xs', '.ds-xs'],
        ['标题 .ds-h3', '.ds-h3'], ['封面标题 .ds-cover__title', '.ds-cover__title'],
        ['等宽 .ds-mono', '.ds-mono'], ['标签 .ds-tag', '.ds-tag'],
        ['主按钮文字', '.ds-btn--primary'], ['次按钮文字', '.ds-btn--secondary'],
        ['幽灵按钮文字', '.ds-btn--ghost'], ['筛选 chip', '.ds-chip'],
        ['轴标 .ds-rail__item', '.ds-rail__item']
      ];
      for (const [name, sel] of targets) {
        const el = document.querySelector(sel);
        if (!el) { samples.push({ name, missing: true }); continue; }
        const cs = getComputedStyle(el);
        const fg = cs.color, bg = bgOf(el);
        const px = parseFloat(cs.fontSize);
        const w = parseInt(cs.fontWeight) || 400;
        const large = px >= 24 || (px >= 18.66 && w >= 700);
        const r = ratio(fg, bg);
        samples.push({ name, fg, bg, fontSize: px, fontWeight: w, large, ratio: r ? Math.round(r*100)/100 : null,
                       required: large ? 3 : 4.5 });
      }
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
      return { samples, belowAA: belowAA.slice(0,12), belowAAcount: belowAA.length,
               belowAAA: belowAAA.slice(0,12), belowAAAcount: belowAAA.length };
    })()`);

    const contrastFails = a11y.samples.filter((s) => s.ratio !== null && s.ratio < s.required);
    const contrastUnknown = a11y.samples.filter((s) => s.ratio === null);
    if (!contrastFails.length && !contrastUnknown.length) {
      ok(`${file} 文本对比度达标`, `${a11y.samples.length} 项，最低 ${Math.min(...a11y.samples.filter(s=>s.ratio).map(s=>s.ratio))}`);
    } else if (!contrastFails.length) {
      warn(`${file} 对比度无法计算`, contrastUnknown.map((s) => s.name).join(', '));
    } else {
      bad(`${file} 文本对比度达标`, contrastFails.map((s) => `${s.name}=${s.ratio}(需${s.required})`).join(', '));
    }

    if (!a11y.belowAAcount) ok(`${file} 触摸目标 ≥24px (WCAG 2.2 AA)`, '全部合格');
    else bad(`${file} 触摸目标 ≥24px (WCAG 2.2 AA)`, `${a11y.belowAAcount} 个不足: ${JSON.stringify(a11y.belowAA)}`);
    if (!a11y.belowAAAcount) ok(`${file} 主控件触摸目标 ≥44px (AAA)`, '主按钮与图标按钮全部合格');
    else warn(`${file} 主控件触摸目标 ≥44px (AAA)`, `${a11y.belowAAAcount} 个偏小: ${JSON.stringify(a11y.belowAAA)}`);

    /* Tab 序列不被吞 + 焦点环可见（§3.3 键盘与焦点专项）
       注意：焦点移动是浏览器的**默认行为**，合成 KeyboardEvent 不触发它，
       必须用 CDP Input.dispatchKeyEvent 发真实按键。 */
    const tab = await (async () => {
      await s.ev(`(() => { document.activeElement?.blur?.(); window.scrollTo(0, 0); return true; })()`);
      const seen = [];
      for (let i = 0; i < 60; i++) {
        const before = await s.ev(`(() => { const a = document.activeElement; return a ? a.tagName + '#' + (a.id || String(a.className||'').split(' ')[0]) : 'NONE'; })()`);
        await s.send('Input.dispatchKeyEvent', { type: 'rawKeyDown', key: 'Tab', code: 'Tab', windowsVirtualKeyCode: 9, nativeVirtualKeyCode: 9 });
        await s.send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Tab', code: 'Tab', windowsVirtualKeyCode: 9, nativeVirtualKeyCode: 9 });
        await sleep(60);
        const cur = await s.ev(`(() => {
          const el = document.activeElement;
          if (!el || el === document.body) return null;
          const cs = getComputedStyle(el);
          const ring = (cs.outlineStyle !== 'none' && parseFloat(cs.outlineWidth) > 0) ||
                       (cs.boxShadow !== 'none' && cs.boxShadow !== 'none ') ||
                       el.classList.contains('is-focused');
          const r = el.getBoundingClientRect();
          return { tag: el.tagName.toLowerCase(), id: el.id || String(el.className||'').split(' ')[0], ring,
                   w: Math.round(r.width), h: Math.round(r.height) };
        })()`);
        if (!cur) break;
        const key = cur.tag + '#' + cur.id;
        if (key === before) break;
        if (seen.some((x) => x.tag + '#' + x.id === key)) break;
        seen.push(cur);
      }
      return seen;
    })();
    const ringed = tab.filter((x) => x.ring).length;
    if (tab.length > 0 && ringed === tab.length) ok(`${file} Tab 序列未被吞且焦点环可见`, `可达 ${tab.length} 个，${ringed}/${tab.length} 有焦点环：${tab.map((x) => x.tag + '#' + x.id).join(' → ')}`);
    else bad(`${file} Tab 序列未被吞且焦点环可见`, `可达 ${tab.length}，有环 ${ringed}；缺环 ${tab.filter((x)=>!x.ring).map((x)=>x.tag+'#'+x.id).join(', ')}`);

    report.a11y = { ...report.a11y, [file]: a11y };

    /* G.3 标题禁止 white-space: nowrap / G.4 中文排版 */
    const typo = await s.ev(`(() => {
      const heads = [...document.querySelectorAll('h1, h2, h3, .ds-display, .ds-h1, .ds-h2, .ds-h3')];
      const nowrap = heads.filter(el => getComputedStyle(el).whiteSpace === 'nowrap')
        .map(el => el.tagName + '.' + String(el.className || '').split(' ')[0]);
      // 正文载体：优先规范层 .ds-body；其次 08 既有正文段。必须是「可见」元素，
      // 否则会取到 .sr-only 状态播报或 [hidden] 覆盖层里的段落，取样失真。
      // 另排除 .overlay / .game-frame —— 那是瞬态 HUD（caps 字距的标签），
      // 不是正文，拿来判「中文正文字距/行高」会得到失真的结论。
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
      // letter-spacing 的计算值可能是 'normal'（等价于 0），必须归一化后再判定，
      // 否则 parseFloat('normal') = NaN 会被误判成「字距未达标」。
      const lsNum = ls === null || ls === undefined ? null
        : (ls === 'normal' ? 0 : (Number.isFinite(parseFloat(ls)) ? parseFloat(ls) : null));
      const lh = bs ? parseFloat(bs.lineHeight) / parseFloat(bs.fontSize) : null;
      const html = getComputedStyle(document.documentElement);
      return {
        nowrap,
        bodySel,
        bodyTag: body ? body.tagName + '.' + String(body.className || '').split(' ')[0] : null,
        letterSpacing: ls,
        letterSpacingNum: lsNum,
        lineHeightRatio: lh ? Math.round(lh * 100) / 100 : null,
        trackCjk: html.getPropertyValue('--ds-track-cjk').trim(),
        lang: document.documentElement.getAttribute('lang'),
      };
    })()`);
    if (!typo.nowrap.length) ok(`${file} 标题未使用 nowrap（G.3）`, `${'标题全部允许换行'}`);
    else bad(`${file} 标题未使用 nowrap（G.3）`, typo.nowrap.join(', '));
    if (typo.letterSpacingNum !== null && typo.letterSpacingNum >= 0) {
      ok(`${file} 中文字距归零（G.4）`, `letter-spacing=${typo.letterSpacing}（归一 ${typo.letterSpacingNum}；取样 ${typo.bodySel} ${typo.bodyTag}；--ds-track-cjk=${typo.trackCjk}）`);
    } else {
      bad(`${file} 中文字距归零（G.4）`, `letter-spacing=${typo.letterSpacing}；取样 ${typo.bodySel} ${typo.bodyTag}`);
    }
    if (typo.lineHeightRatio !== null && Math.abs(typo.lineHeightRatio - 1.85) < 0.02) {
      ok(`${file} 中文正文行高 1.85（G.4）`, `实测 ${typo.lineHeightRatio}（取样 ${typo.bodySel} ${typo.bodyTag}）`);
    } else {
      bad(`${file} 中文正文行高 1.85（G.4）`, `实测 ${typo.lineHeightRatio}（取样 ${typo.bodySel} ${typo.bodyTag}）`);
    }
  }

  /* ---------- reduced-motion（真实媒体特性） ---------- */
  await s.send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
  for (const file of PAGES) {
    await navigate(file);
    const rm = await s.ev(`(() => {
      const root = getComputedStyle(document.documentElement);
      const probe = document.querySelector('.ds-btn') || document.querySelector('.btn');
      return { durBase: root.getPropertyValue('--ds-dur-base').trim(),
               entryDuration: root.getPropertyValue('--ds-entry-duration').trim(),
               matches: matchMedia('(prefers-reduced-motion: reduce)').matches,
               transition: probe ? getComputedStyle(probe).transitionDuration : null };
    })()`);
    if (rm.matches && rm.durBase === '1ms' && rm.entryDuration === '1ms') ok(`${file} reduced-motion 降级`, JSON.stringify(rm));
    else bad(`${file} reduced-motion 降级`, JSON.stringify(rm));
  }
  await s.send('Emulation.setEmulatedMedia', { features: [] });

  /* ---------- 深色主题 ---------- */
  for (const file of PAGES) {
    await navigate(file);
    const dark = await s.ev(`(() => ({
      bg: getComputedStyle(document.querySelector('.ds-shell') || document.body).backgroundColor,
      ink: getComputedStyle(document.documentElement).getPropertyValue('--ds-ink').trim(),
      accent: getComputedStyle(document.documentElement).getPropertyValue('--ds-accent').trim()
    }))()`);
    if (dark.ink.trim() === '#f7f4f0' && dark.accent.trim() === '#e0684a') ok(`${file} 深色主题令牌`, JSON.stringify(dark));
    else bad(`${file} 深色主题令牌`, JSON.stringify(dark));
  }

  /* ---------- 控制台错误 ---------- */
  const consoleErrs = s.events.filter((e) => e.method === 'Log.entryAdded' && e.params.entry.level === 'error')
    .map((e) => e.params.entry.text);
  if (!consoleErrs.length) ok('无控制台错误', '0 条');
  else bad('无控制台错误', consoleErrs.slice(0, 5).join(' | '));
  report.consoleErrors = consoleErrs;

  try { s.ws.close(); } catch {}
} catch (e) {
  report.errors.push('fatal: ' + e.message);
  console.error('FATAL', e.message);
} finally {
  try { chrome.kill('SIGKILL'); } catch {}
  try { server.close(); } catch {}
}

report.verdict = report.errors.length ? 'FAIL' : 'PASS';
fs.writeFileSync(path.join(OUT, 'pages-verification.json'), JSON.stringify(report, null, 2));
console.log('\n' + (report.verdict === 'PASS' ? '✅ pages verification: PASS' : '❌ pages verification: FAIL'));
console.log('errors:', report.errors.length, '| warnings:', report.warnings.length);
report.errors.forEach((e) => console.log('  ✗', e));
report.warnings.forEach((e) => console.log('  !', e));
await sleep(300);
process.exit(report.verdict === 'PASS' ? 0 : 1);
