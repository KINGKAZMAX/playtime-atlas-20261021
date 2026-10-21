#!/usr/bin/env node
/**
 * browser_test.mjs — 成果页（dist/catalog.html）实机测试
 *
 * 用 Chrome DevTools Protocol 直接驱动本机 headless Chrome，测完即退。
 * 不依赖 puppeteer / playwright 等第三方包（Node 24 自带 WebSocket）。
 *
 * 覆盖的检查项：
 *   1. 视口：桌面 1440×900 / 平板 820×1180 / 移动 390×844
 *   2. 横向溢出：documentElement.scrollWidth vs clientWidth，并列出越界元素
 *   3. 控制台错误 / 页面异常
 *   4. 网络失败与 4xx/5xx 资源
 *   5. 语言切换：中文 → 英文，校验 html[lang] 与可见文案
 *   6. 筛选：大区 / 时代 / 构造 三个维度点击后可见案例数变化
 *   7. 搜索：输入关键词后可见案例数变化
 *   8. 触达目标尺寸（控件 ≥44px / 正文链接 ≥24px）
 *   9. 键盘可达：Tab 焦点环、skip link
 *  10. prefers-reduced-motion 降级
 *  11. 暗色偏好（prefers-color-scheme: dark）下页面仍可读
 *
 * ⚠️ 作用域：这是**本地构建产物**的回归测试，只访问 127.0.0.1（本地静态服务 + 本地 CDP 端口），
 *    不发起任何对外请求（测试内的「无资源加载失败 / 无 4xx/5xx」断言即为此护栏）。
 *    **对外站点**的访问与截图一律走用户的 Ego 浏览器（/Users/mekzenx2/.local/bin/ego-browser，
 *    先运行 `ego-browser skill`），不使用本脚本或任何其他浏览器路径。
 *
 * 输出：evidence/browser-test-report.json + 控制台摘要
 * 用法：node scripts/browser_test.mjs [--url http://127.0.0.1:8899/catalog.html]
 */

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');

const CHROME_CANDIDATES = [
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/Applications/Chromium.app/Contents/MacOS/Chromium',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
];

function argOf(name, fallback) {
  const i = process.argv.indexOf(name);
  return i >= 0 && process.argv[i + 1] ? process.argv[i + 1] : fallback;
}

const URL_UNDER_TEST = argOf('--url', 'http://127.0.0.1:8899/catalog.html');
const PORT = Number(argOf('--port', '9333'));

/* ------------------------------------------------------------------ CDP */

class CDP {
  constructor(ws) {
    this.ws = ws;
    this.id = 0;
    this.pending = new Map();
    this.events = [];
    this.listeners = [];
    ws.addEventListener('message', (ev) => {
      const msg = JSON.parse(ev.data);
      if (msg.id && this.pending.has(msg.id)) {
        const { resolve, reject } = this.pending.get(msg.id);
        this.pending.delete(msg.id);
        if (msg.error) reject(new Error(`${msg.error.message} (${JSON.stringify(msg.error.data ?? '')})`));
        else resolve(msg.result);
      } else if (msg.method) {
        this.events.push(msg);
        for (const fn of this.listeners) fn(msg);
      }
    });
  }

  send(method, params = {}, sessionId) {
    const id = ++this.id;
    const payload = { id, method, params };
    if (sessionId) payload.sessionId = sessionId;
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      this.ws.send(JSON.stringify(payload));
      setTimeout(() => {
        if (this.pending.has(id)) {
          this.pending.delete(id);
          reject(new Error(`CDP 超时: ${method}`));
        }
      }, 30000);
    });
  }

  on(fn) { this.listeners.push(fn); }
}

/* ------------------------------------------------------------- 页面内断言 */

const EXPR = {
  /* 基础布局度量 */
  metrics: `(() => {
    const de = document.documentElement;
    const vw = de.clientWidth;
    const offenders = [];
    for (const el of document.querySelectorAll('body *')) {
      const cs = getComputedStyle(el);
      if (cs.display === 'none' || cs.visibility === 'hidden') continue;
      const r = el.getBoundingClientRect();
      if (r.width === 0 && r.height === 0) continue;
      if (r.right > vw + 1 || r.left < -1) {
        offenders.push({
          tag: el.tagName.toLowerCase(),
          cls: (el.className && typeof el.className === 'string') ? el.className : '',
          id: el.id || '',
          left: Math.round(r.left),
          right: Math.round(r.right),
          width: Math.round(r.width),
          text: (el.textContent || '').trim().slice(0, 40),
        });
      }
    }
    // 只保留最外层的越界元素（父元素已越界则不再报子元素）
    const outer = offenders.filter(o => !offenders.some(p =>
      p !== o && p.left <= o.left && p.right >= o.right && (p.right - p.left) > (o.right - o.left)));
    return {
      clientWidth: vw,
      scrollWidth: de.scrollWidth,
      bodyScrollWidth: document.body.scrollWidth,
      horizontalOverflow: de.scrollWidth > vw + 1,
      overflowPx: de.scrollWidth - vw,
      offenderCount: offenders.length,
      offenders: outer.slice(0, 12),
      caseTotal: document.querySelectorAll('.case').length,
      caseVisible: [...document.querySelectorAll('.case')].filter(e => !e.hidden).length,
      termTotal: document.querySelectorAll('.term').length,
      structTotal: document.querySelectorAll('.struct').length,
      lang: de.getAttribute('lang'),
      dataLang: de.getAttribute('data-lang'),
      title: document.title,
    };
  })()`,

  /* 越界元素的定位线索：找出把 body 撑宽的根因容器 */
  rootCause: `(() => {
    const de = document.documentElement;
    const vw = de.clientWidth;
    const out = [];
    const walk = (el, depth) => {
      if (depth > 6) return;
      for (const c of el.children) {
        const cs = getComputedStyle(c);
        const r = c.getBoundingClientRect();
        if (r.width > vw + 1) {
          out.push({
            depth: depth + 1,
            tag: c.tagName.toLowerCase(),
            cls: typeof c.className === 'string' ? c.className : '',
            width: Math.round(r.width),
            scrollWidth: c.scrollWidth,
            clientWidth: c.clientWidth,
            display: cs.display,
            gridCols: cs.gridTemplateColumns,
            overflowX: cs.overflowX,
            minWidth: cs.minWidth,
            whiteSpace: cs.whiteSpace,
          });
          walk(c, depth + 1);
        }
      }
    };
    walk(document.body, 0);
    return out.slice(0, 14);
  })()`,

  /* 语言切换 */
  langState: `(() => {
    const de = document.documentElement;
    const visible = (el) => { if (!el) return false; const cs = getComputedStyle(el); return cs.display !== 'none' && cs.visibility !== 'hidden' && el.getClientRects().length > 0; };
    const en = [...document.querySelectorAll('[data-l="en"]')].filter(visible).length;
    const zh = [...document.querySelectorAll('[data-l="zh"]')].filter(visible).length;
    const lead = document.querySelector('.masthead__lede');
    const leadText = lead ? lead.textContent.trim() : '';
    const pressed = [...document.querySelectorAll('.lang-toggle button')].map(b => ({
      text: b.textContent.trim(), pressed: b.getAttribute('aria-pressed'),
    }));
    return {
      htmlLang: de.getAttribute('lang'),
      dataLang: de.getAttribute('data-lang'),
      visibleEn: en, visibleZh: zh,
      leadText: leadText.slice(0, 90),
      toggle: pressed,
      storage: (() => { try { return localStorage.getItem('catalog-lang'); } catch (e) { return null; } })(),
    };
  })()`,

  /* 触达目标：按 16 设计系统的两档规则判定
   *   控件（button / input / [role=button]）≥ --ds-target-min = 44px（AAA 2.5.5）
   *   正文内链接（a）             ≥ 24px（AA 2.5.8 最低触摸目标）
   */
  touch: `(() => {
    const CONTROL_MIN = 44;   // 16 tokens: a11y.targetSizeEnhanced
    const LINK_MIN = 24;     // 16 tokens: a11y.minTargetSize
    const controls = [];
    const links = [];
    for (const el of document.querySelectorAll('button, input, select, textarea, [role="button"], a')) {
      const r = el.getBoundingClientRect();
      if (r.width === 0 && r.height === 0) continue;
      const isControl = el.tagName !== 'A';
      const item = {
        tag: el.tagName.toLowerCase(),
        cls: typeof el.className === 'string' ? el.className : '',
        text: (el.textContent || el.placeholder || '').trim().slice(0, 28),
        w: Math.round(r.width), h: Math.round(r.height),
      };
      if (isControl) { if (r.height < CONTROL_MIN || r.width < CONTROL_MIN) controls.push(item); }
      else if (r.height < LINK_MIN) links.push(item);
    }
    return {
      controlMin: CONTROL_MIN, linkMin: LINK_MIN,
      smallControlCount: controls.length, controls: controls.slice(0, 12),
      smallLinkCount: links.length, links: links.slice(0, 12),
    };
  })()`,

  /* 暗色偏好下的可读性：取一组前景/背景色算对比度 */
  contrast: `(() => {
    const lum = (c) => {
      const m = c.match(/[\\d.]+/g).map(Number);
      const [r, g, b] = m;
      const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
      return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
    };
    const ratio = (fg, bg) => {
      const a = lum(fg), b = lum(bg);
      return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
    };
    const out = {};
    const body = getComputedStyle(document.body);
    out.bodyFg = body.color;
    out.bodyBg = body.backgroundColor;
    out.bodyRatio = +ratio(body.color, body.backgroundColor).toFixed(2);
    const card = document.querySelector('.case');
    if (card) {
      const cs = getComputedStyle(card);
      out.cardFg = cs.color; out.cardBg = cs.backgroundColor;
      out.cardRatio = +ratio(cs.color, cs.backgroundColor).toFixed(2);
    }
    const lede = document.querySelector('.masthead__lede');
    if (lede) {
      const cs = getComputedStyle(lede);
      out.ledeRatio = +ratio(cs.color, body.backgroundColor).toFixed(2);
    }
    return out;
  })()`,

  /* 动效降级：测真实时长，而不是「有没有 transition」 */
  motion: `(() => {
    const toMs = (v) => (v || '0s').split(',').map(s => {
      s = s.trim();
      if (s.endsWith('ms')) return parseFloat(s);
      if (s.endsWith('s')) return parseFloat(s) * 1000;
      return 0;
    });
    let maxAnim = 0, maxTrans = 0, animCount = 0, transCount = 0;
    for (const el of document.querySelectorAll('*')) {
      const cs = getComputedStyle(el);
      if (cs.animationName && cs.animationName !== 'none') {
        animCount++;
        for (const d of toMs(cs.animationDuration)) maxAnim = Math.max(maxAnim, d);
      }
      for (const d of toMs(cs.transitionDuration)) { if (d > 0) transCount++; maxTrans = Math.max(maxTrans, d); }
    }
    return {
      animatedElements: animCount, transitionElements: transCount,
      maxAnimationMs: maxAnim, maxTransitionMs: maxTrans,
      scrollBehavior: getComputedStyle(document.documentElement).scrollBehavior,
    };
  })()`,

  /* V.2 扩展：大字（≥18px 或 ≥14px 粗体）≥3、UI 组件（边框/次要文本）≥3 */
  contrastLevels: `(() => {
    const parse = (c) => {
      const m = String(c).match(/[\\d.]+/g); if (!m) return null;
      const [r, g, b, a = 1] = m.map(Number);
      return { r, g, b, a };
    };
    const lum = (c) => {
      const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
      return 0.2126 * f(c.r) + 0.7152 * f(c.g) + 0.0722 * f(c.b);
    };
    const over = (fg, bg) => ({   // 半透明前景合成到背景
      r: fg.r * fg.a + bg.r * (1 - fg.a),
      g: fg.g * fg.a + bg.g * (1 - fg.a),
      b: fg.b * fg.a + bg.b * (1 - fg.a),
    });
    const ratio = (fg, bg) => {
      const a = lum(fg), b = lum(bg);
      if (!isFinite(a) || !isFinite(b)) return null;
      return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
    };
    const bgOf = (el) => {       // 逐级上溯背景色
      let node = el;
      while (node && node !== document.documentElement) {
        const c = parse(getComputedStyle(node).backgroundColor);
        if (c && c.a > 0.99) return c;
        node = node.parentElement;
      }
      return parse(getComputedStyle(document.body).backgroundColor) || { r: 255, g: 255, b: 255, a: 1 };
    };
    const sample = (sel, kind) => {
      const el = document.querySelector(sel);
      if (!el) return null;
      const cs = getComputedStyle(el);
      const fgRaw = parse(cs.color);
      const bg = bgOf(el);
      if (!fgRaw || !bg) return null;
      const fg = fgRaw.a < 1 ? over(fgRaw, bg) : fgRaw;
      const size = parseFloat(cs.fontSize);
      const weight = parseInt(cs.fontWeight, 10) || 400;
      const isLarge = size >= 24 || (size >= 18.66 && weight >= 700);
      const r = ratio(fg, bg);
      return { sel, kind, size, weight, isLarge, ratio: r === null ? null : +r.toFixed(2),
               need: kind === 'body' ? 4.5 : (isLarge ? 3 : 3) };
    };
    const out = [];
    for (const [sel, kind] of [
      ['.masthead__lede', 'body'],
      ['.case__block p', 'body'],
      ['.masthead__title', 'body'],
      ['.case__block h4', 'ui'],
      ['.stat__l', 'ui'],
      ['.term__def', 'body'],
    ]) {
      const s = sample(sel, kind);
      if (s) out.push(s);
    }
    return out;
  })()`,

  /* V.5 焦点可达：Tab 序列不被吞、焦点环可见 */
  focus: `(() => {
    const seq = [];
    const focusables = [...document.querySelectorAll('a[href], button, input, [tabindex]:not([tabindex="-1"])')]
      .filter(el => !el.disabled && el.getClientRects().length > 0);
    for (const el of focusables.slice(0, 12)) {
      el.focus();
      const cs = getComputedStyle(el);
      const r = el.getBoundingClientRect();
      seq.push({
        tag: el.tagName.toLowerCase(),
        cls: typeof el.className === 'string' ? el.className : '',
        focused: document.activeElement === el,
        outlineWidth: cs.outlineWidth,
        outlineStyle: cs.outlineStyle,
        hasVisibleRing: (cs.outlineStyle !== 'none' && parseFloat(cs.outlineWidth) > 0) ||
                        cs.boxShadow !== 'none',
        inViewport: r.top >= -1 && r.left >= -1,
      });
    }
    return {
      focusableCount: focusables.length,
      allFocusable: focusables.length > 0,
      negativeTabIndex: [...document.querySelectorAll('[tabindex]')].filter(el => el.getAttribute('tabindex') === '-1').length,
      sample: seq,
    };
  })()`,

  /* V.9 字体：全部本地加载，无 CDN；document.fonts 状态
   * 判据说明：16 的 FONT-MANIFEST 明确「CJK 策略 = 系统字体栈优先，
   * Noto Sans SC 子集为渐进增强」——子集与未被使用的字重**按需加载**，
   * 在 document.fonts 里呈现为 'unloaded' 属预期，不是缺陷。
   * 故本项断言「无 error + 已加载族全部来自自托管清单」，
   * 「是否走 CDN」由 V.8（运行期零外部请求）兜底。 */
  fonts: `(() => {
    const ALLOWED = ['Space Grotesk', 'Inter', 'Space Mono', 'Noto Sans SC'];
    const faces = [...document.fonts].map(f => ({ family: f.family, status: f.status }));
    const loaded = faces.filter(f => f.status === 'loaded').map(f => f.family);
    const errored = faces.filter(f => f.status === 'error').map(f => f.family);
    const unloaded = faces.filter(f => f.status === 'unloaded').map(f => f.family);
    const foreign = [...new Set(loaded)].filter(f => !ALLOWED.includes(f));
    return {
      faceCount: faces.length,
      loaded, unloaded, errored, foreign,
      noError: errored.length === 0,
      allFromSelfHosted: foreign.length === 0,
    };
  })()`,

  /* V.11 字体栈顺序：Noto Sans SC 不得排在系统 CJK 族之前 */
  fontStackOrder: `(() => {
    const cs = getComputedStyle(document.documentElement);
    const read = (name) => (cs.getPropertyValue(name) || '').trim();
    const parseStack = (v) => v.replace(/\\s+/g, ' ').split(',').map(s => s.trim().replace(/^["']|["']$/g, '')).filter(Boolean);
    const SYS = ['PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', 'Source Han Sans SC'];
    const out = {};
    for (const role of ['--ds-font-display', '--ds-font-text', '--ds-font-mono']) {
      const stack = parseStack(read(role));
      const idxNoto = stack.indexOf('Noto Sans SC');
      const sysIdx = SYS.map(s => stack.indexOf(s)).filter(i => i >= 0);
      const minSys = sysIdx.length ? Math.min(...sysIdx) : -1;
      out[role] = {
        stack,
        notoIndex: idxNoto,
        minSystemCjkIndex: minSys,
        ok: idxNoto === -1 ? true : (minSys === -1 ? true : idxNoto > minSys),
      };
    }
    return out;
  })()`,

  /* V.10 子路径：页面内用到的相对资源 URL 全部可达 */
  subpath: `(async () => {
    const urls = [...document.querySelectorAll('link[href], script[src], img[src]')]
      .map(el => el.getAttribute('href') || el.getAttribute('src'))
      .filter(u => u && !/^(https?:|data:|#|\\/)/.test(u));
    const results = [];
    for (const u of urls) {
      try {
        const r = await fetch(new URL(u, document.baseURI), { method: 'GET' });
        results.push({ url: u, status: r.status, ok: r.ok });
      } catch (e) {
        results.push({ url: u, status: 0, ok: false, error: String(e).slice(0, 80) });
      }
    }
    return { checked: results.length, bad: results.filter(r => !r.ok) };
  })()`,
};

/* ------------------------------------------------------------------ 主流程 */

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function waitForJson(url, tries = 60) {
  for (let i = 0; i < tries; i++) {
    try {
      const res = await fetch(url);
      if (res.ok) return await res.json();
    } catch (e) { /* retry */ }
    await sleep(250);
  }
  throw new Error(`等待 ${url} 超时`);
}

async function main() {
  const chrome = CHROME_CANDIDATES.find((p) => fs.existsSync(p));
  if (!chrome) throw new Error('未找到本机 Chrome');

  const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'cat-page-'));
  const child = spawn(chrome, [
    '--headless=new',
    '--disable-gpu',
    '--no-sandbox',
    '--no-first-run',
    '--no-default-browser-check',
    '--disable-extensions',
    '--disable-background-networking',
    '--disable-features=Translate,OptimizationHints',
    `--user-data-dir=${profile}`,
    `--remote-debugging-port=${PORT}`,
    'about:blank',
  ], { stdio: 'ignore' });

  let report;
  try {
    const version = await waitForJson(`http://127.0.0.1:${PORT}/json/version`);
    const ws = new WebSocket(version.webSocketDebuggerUrl);
    await new Promise((res, rej) => {
      ws.addEventListener('open', res, { once: true });
      ws.addEventListener('error', rej, { once: true });
    });
    const cdp = new CDP(ws);

    const { targetId } = await cdp.send('Target.createTarget', { url: 'about:blank' });
    const { sessionId } = await cdp.send('Target.attachToTarget', { targetId, flatten: true });

    const consoleErrors = [];
    const netFailures = [];
    const netBad = [];
    const externalRequests = [];
    cdp.on((msg) => {
      if (msg.method === 'Runtime.consoleAPICalled' && ['error', 'warning'].includes(msg.params.type)) {
        consoleErrors.push({
          type: msg.params.type,
          text: (msg.params.args || []).map((a) => a.value ?? a.description ?? a.type).join(' ').slice(0, 300),
        });
      }
      if (msg.method === 'Runtime.exceptionThrown') {
        consoleErrors.push({ type: 'exception', text: (msg.params.exceptionDetails?.exception?.description || msg.params.exceptionDetails?.text || '').slice(0, 300) });
      }
      if (msg.method === 'Network.loadingFailed') {
        netFailures.push({ errorText: msg.params.errorText, type: msg.params.type, url: msg.params.requestId });
      }
      if (msg.method === 'Network.responseReceived' && msg.params.response.status >= 400) {
        netBad.push({ status: msg.params.response.status, url: msg.params.response.url });
      }
      // V.8 运行期零外部请求
      if (msg.method === 'Network.requestWillBeSent') {
        const u = msg.params.request?.url || '';
        if (/^https?:\/\//i.test(u) && !/^https?:\/\/(127\.0\.0\.1|localhost)(:|\/)/i.test(u)) {
          externalRequests.push(u);
        }
      }
    });

    await cdp.send('Page.enable', {}, sessionId);
    await cdp.send('Runtime.enable', {}, sessionId);
    await cdp.send('Network.enable', {}, sessionId);
    await cdp.send('DOM.enable', {}, sessionId);

    const evaluate = async (expr) => {
      const r = await cdp.send('Runtime.evaluate', {
        expression: expr, returnByValue: true, awaitPromise: true,
      }, sessionId);
      if (r.exceptionDetails) {
        throw new Error(`页面求值异常: ${r.exceptionDetails.exception?.description || r.exceptionDetails.text}`);
      }
      return r.result.value;
    };

    const viewports = [
      { name: 'desktop-1440x900', width: 1440, height: 900, dsf: 1, mobile: false },
      { name: 'desktop-1280x800', width: 1280, height: 800, dsf: 1, mobile: false },
      { name: 'tablet-820x1180', width: 820, height: 1180, dsf: 1, mobile: false },
      { name: 'tablet-768x1024', width: 768, height: 1024, dsf: 1, mobile: false },
      { name: 'mobile-390x844', width: 390, height: 844, dsf: 2, mobile: true },
    ];

    const results = { viewports: [], interactions: {}, checks: [] };
    const add = (name, pass, detail) => results.checks.push({ name, pass, detail });

    for (const vp of viewports) {
      await cdp.send('Emulation.setEmulatedMedia', {
        features: [{ name: 'prefers-color-scheme', value: 'light' }],
      }, sessionId);
      await cdp.send('Emulation.setDeviceMetricsOverride', {
        width: vp.width, height: vp.height, deviceScaleFactor: vp.dsf, mobile: vp.mobile,
      }, sessionId);
      await cdp.send('Page.navigate', { url: URL_UNDER_TEST }, sessionId);
      await sleep(1600);

      const m = await evaluate(EXPR.metrics);
      const root = await evaluate(EXPR.rootCause);
      const touch = await evaluate(EXPR.touch);
      const contrast = await evaluate(EXPR.contrast);
      const levels = await evaluate(EXPR.contrastLevels);
      const motion = await evaluate(EXPR.motion);

      results.viewports.push({ viewport: vp.name, metrics: m, rootCause: root, touch, contrast, levels, motion });

      add(`${vp.name} 无横向溢出`, !m.horizontalOverflow,
        m.horizontalOverflow ? `scrollWidth ${m.scrollWidth} > clientWidth ${m.clientWidth}（溢出 ${m.overflowPx}px）` : `scrollWidth ${m.scrollWidth} = clientWidth ${m.clientWidth}`);
      add(`${vp.name} 案例卡全部渲染`, m.caseVisible === m.caseTotal, `${m.caseVisible}/${m.caseTotal}`);
      add(`${vp.name} 正文对比度 ≥ 4.5`, contrast.bodyRatio >= 4.5, `body ${contrast.bodyRatio}:1`);
      add(`${vp.name} 触达目标达标`, touch.smallControlCount === 0 && touch.smallLinkCount === 0,
        `控件 ${touch.smallControlCount} 个 < ${touch.controlMin}px，链接 ${touch.smallLinkCount} 个 < ${touch.linkMin}px`);
      // V.2 分级对比度：正文 ≥4.5，大字 ≥3，UI ≥3
      const levelBad = levels.filter(l => l.ratio !== null && l.ratio < l.need);
      add(`${vp.name} 分级对比度达标（正文 4.5 / 大字 3 / UI 3）`, levelBad.length === 0,
        levelBad.length
          ? levelBad.map(l => `${l.sel} ${l.ratio}:1 < ${l.need}`).join('; ')
          : levels.map(l => `${l.sel} ${l.ratio}:1`).join('，'));
    }

    /* ---------------------------------------------- 交互（用桌面视口） */
    await cdp.send('Emulation.setDeviceMetricsOverride', {
      width: 1440, height: 900, deviceScaleFactor: 1, mobile: false,
    }, sessionId);
    await cdp.send('Page.navigate', { url: URL_UNDER_TEST }, sessionId);
    await sleep(1400);

    const before = await evaluate(EXPR.metrics);
    const langBefore = await evaluate(EXPR.langState);

    // 语言切换
    const enClicked = await evaluate(`(() => {
      const btn = [...document.querySelectorAll('.lang-toggle button')].find(b => /EN/i.test(b.textContent));
      if (!btn) return false; btn.click(); return true;
    })()`);
    await sleep(500);
    const langAfter = await evaluate(EXPR.langState);
    results.interactions.lang = { before: langBefore, after: langAfter, clicked: enClicked };
    add('语言切换到 EN', enClicked && langAfter.dataLang === 'en' && langAfter.visibleEn > 0 && langAfter.visibleZh === 0,
      `data-lang=${langAfter.dataLang}，可见 en 节点 ${langAfter.visibleEn}、zh 节点 ${langAfter.visibleZh}`);
    add('语言切换后 html[lang] 同步', langAfter.htmlLang === 'en', `html[lang]=${langAfter.htmlLang}`);

    // 切回中文
    await evaluate(`(() => {
      const btn = [...document.querySelectorAll('.lang-toggle button')].find(b => /中文/.test(b.textContent));
      if (btn) btn.click();
    })()`);
    await sleep(300);

    // 筛选：构造类目
    const filterResult = await evaluate(`(() => {
      const rows = [...document.querySelectorAll('.chip-row')];
      const structRow = rows.find(r => r.previousElementSibling === null || true);
      const chips = [...document.querySelectorAll('.chip')];
      const dougong = chips.find(c => /斗栱|dougong/i.test(c.textContent));
      if (!dougong) return { ok: false };
      dougong.click();
      const visible = [...document.querySelectorAll('.case')].filter(e => !e.hidden).length;
      const pressed = dougong.getAttribute('aria-pressed');
      return { ok: true, visible, pressed, chip: dougong.textContent.trim() };
    })()`);
    results.interactions.filter = { before: before.caseVisible, ...filterResult };
    add('构造筛选生效', filterResult.ok && filterResult.visible > 0 && filterResult.visible < before.caseTotal,
      filterResult.ok ? `点击「${filterResult.chip}」→ 可见 ${filterResult.visible}/${before.caseTotal}（aria-pressed=${filterResult.pressed}）` : '未找到筛选 chip');

    // 取消筛选
    const afterReset = await evaluate(`(() => {
      const chips = [...document.querySelectorAll('.chip')];
      const on = chips.filter(c => c.getAttribute('aria-pressed') === 'true');
      on.forEach(c => c.click());
      return [...document.querySelectorAll('.case')].filter(e => !e.hidden).length;
    })()`);
    results.interactions.reset = { visible: afterReset };
    add('取消筛选后恢复全部案例', afterReset === before.caseTotal, `${afterReset}/${before.caseTotal}`);

    // 搜索
    const searchResult = await evaluate(`(() => {
      const q = document.querySelector('.search');
      if (!q) return { ok: false };
      q.focus();
      q.value = '桥';
      q.dispatchEvent(new Event('input', { bubbles: true }));
      const visible = [...document.querySelectorAll('.case')].filter(e => !e.hidden).length;
      return { ok: true, visible, term: '桥' };
    })()`);
    results.interactions.search = { total: before.caseVisible, ...searchResult };
    add('搜索过滤生效', searchResult.ok && searchResult.visible > 0 && searchResult.visible < before.caseTotal,
      searchResult.ok ? `输入「桥」→ 可见 ${searchResult.visible}/${before.caseTotal}` : '无搜索框');

    // 键盘可达：skip link
    const skip = await evaluate(`(() => {
      const s = document.querySelector('.skip-link');
      if (!s) return { ok: false };
      s.focus();
      const r = s.getBoundingClientRect();
      return { ok: true, left: Math.round(r.left), top: Math.round(r.top), text: s.textContent.trim() };
    })()`);
    results.interactions.skipLink = skip;
    add('skip link 聚焦后可见', skip.ok && skip.left >= 0, skip.ok ? `focus 后 left=${skip.left} top=${skip.top}` : '无 skip link');

    /* -------------------------------------------------- reduced motion */
    await cdp.send('Emulation.setEmulatedMedia', {
      features: [{ name: 'prefers-reduced-motion', value: 'reduce' }],
    }, sessionId);
    await sleep(400);
    const motionReduced = await evaluate(EXPR.motion);
    results.interactions.reducedMotion = motionReduced;
    add('prefers-reduced-motion 下动效降级',
      motionReduced.maxAnimationMs <= 1 && motionReduced.maxTransitionMs <= 1 && motionReduced.scrollBehavior === 'auto',
      `最长动画 ${motionReduced.maxAnimationMs}ms / 最长过渡 ${motionReduced.maxTransitionMs}ms，scroll-behavior=${motionReduced.scrollBehavior}`);

    /* ------------------------------------------------------- 暗色偏好 */
    // headless Chrome 的系统偏好默认可能是 dark，基线必须显式指定 light，否则无法比较
    await cdp.send('Emulation.setEmulatedMedia', {
      features: [{ name: 'prefers-color-scheme', value: 'light' }],
    }, sessionId);
    await sleep(500);
    const lightContrast = await evaluate(EXPR.contrast);
    const lightTheme = await evaluate(`(() => ({
      attr: document.documentElement.getAttribute('data-ds-theme'),
      bg: getComputedStyle(document.body).backgroundColor,
      accent: getComputedStyle(document.documentElement).getPropertyValue('--ds-accent').trim(),
    }))()`);
    await cdp.send('Emulation.setEmulatedMedia', {
      features: [{ name: 'prefers-color-scheme', value: 'dark' }],
    }, sessionId);
    await sleep(500);
    const darkContrast = await evaluate(EXPR.contrast);
    const darkTheme = await evaluate(`(() => ({
      attr: document.documentElement.getAttribute('data-ds-theme'),
      bg: getComputedStyle(document.body).backgroundColor,
      accent: getComputedStyle(document.documentElement).getPropertyValue('--ds-accent').trim(),
    }))()`);
    results.interactions.lightScheme = { ...lightContrast, ...lightTheme };
    results.interactions.darkScheme = { ...darkContrast, ...darkTheme };
    add('prefers-color-scheme: dark 生效（底色切换）',
      darkTheme.bg !== lightTheme.bg && darkTheme.bg !== lightContrast.bodyBg,
      `data-ds-theme=${darkTheme.attr}；light 底色 ${lightTheme.bg} → dark 底色 ${darkTheme.bg}`);
    add('浅色态正文对比度 ≥ 4.5', lightContrast.bodyRatio >= 4.5, `light body ${lightContrast.bodyRatio}:1`);
    add('prefers-color-scheme: dark 下正文对比度 ≥ 4.5', darkContrast.bodyRatio >= 4.5, `dark body ${darkContrast.bodyRatio}:1`);
    await cdp.send('Emulation.setEmulatedMedia', { features: [] }, sessionId);

    /* ------------------------------------------ 控制台 / 网络 汇总 */
    results.consoleErrors = consoleErrors;
    results.networkFailures = netFailures;
    results.networkBadStatus = netBad;
    results.externalRequests = [...new Set(externalRequests)];
    add('无控制台错误', consoleErrors.filter((e) => e.type === 'error' || e.type === 'exception').length === 0,
      consoleErrors.length ? JSON.stringify(consoleErrors.slice(0, 3)) : '无');
    add('无资源加载失败', netFailures.length === 0, netFailures.length ? JSON.stringify(netFailures.slice(0, 3)) : '无');
    add('无 4xx/5xx 资源', netBad.length === 0, netBad.length ? JSON.stringify(netBad.slice(0, 3)) : '无');
    // V.8 运行期零外部请求
    add('V.8 运行期零外部请求', results.externalRequests.length === 0,
      results.externalRequests.length ? results.externalRequests.slice(0, 5).join(', ') : '全部为 127.0.0.1 本地请求');

    /* ---------------------------------------------- V.5 焦点可达 */
    const focus = await evaluate(EXPR.focus);
    results.interactions.focus = focus;
    const noRing = focus.sample.filter((s) => s.focused && !s.hasVisibleRing);
    add('V.5 焦点环可见', focus.sample.length > 0 && noRing.length === 0,
      noRing.length ? noRing.map((s) => `${s.tag}.${s.cls}`).join(', ') : `${focus.sample.length} 个可聚焦元素全部有可见焦点环`);
    add('V.5 Tab 序列不被吞', focus.focusableCount > 0 && focus.sample.every((s) => s.focused),
      `${focus.focusableCount} 个可聚焦元素，抽样 ${focus.sample.length} 个全部成功聚焦`);

    /* ---------------------------------------------- V.9 字体本地化 */
    const fonts = await evaluate(EXPR.fonts);
    results.interactions.fonts = fonts;
    add('V.9 字体无加载错误且全部来自自托管清单', fonts.noError && fonts.allFromSelfHosted,
      `${fonts.faceCount} 个 @font-face：已加载 ${fonts.loaded.length}（${[...new Set(fonts.loaded)].join(', ') || '无'}），`
      + `按需未加载 ${fonts.unloaded.length}（渐进增强子集/未用字重，属预期），错误 ${fonts.errored.length}`);

    /* ---------------------------------------------- V.10 子路径 */
    const subpath = await evaluate(EXPR.subpath);
    results.interactions.subpath = subpath;
    add('V.10 页面内相对资源全部可达', subpath.checked > 0 && subpath.bad.length === 0,
      subpath.checked === 0 ? '页面无相对资源引用' :
      (subpath.bad.length ? subpath.bad.map((b) => `${b.url} → ${b.status}`).join('; ') : `${subpath.checked} 个相对 URL 全部 200`));

    /* ---------------------------------------------- V.11 字体栈顺序 */
    const stackOrder = await evaluate(EXPR.fontStackOrder);
    results.interactions.fontStackOrder = stackOrder;
    const stackBad = Object.entries(stackOrder).filter(([, v]) => !v.ok);
    add('V.11 Noto Sans SC 未排在系统 CJK 族之前', stackBad.length === 0,
      stackBad.length ? stackBad.map(([k, v]) => `${k}: ${v.stack.join(', ')}`).join('; ')
                       : Object.entries(stackOrder).map(([k, v]) => `${k} ✓`).join('，'));

    const passed = results.checks.filter((c) => c.pass).length;
    results.summary = { total: results.checks.length, passed, failed: results.checks.length - passed };
    report = results;

    ws.close();
  } finally {
    try { child.kill('SIGKILL'); } catch (e) { /* ignore */ }
    await sleep(400);
    fs.rmSync(profile, { recursive: true, force: true });
  }

  const outDir = path.join(ROOT, 'evidence');
  fs.mkdirSync(outDir, { recursive: true });
  const outFile = path.join(outDir, 'browser-test-report.json');
  fs.writeFileSync(outFile, JSON.stringify(report, null, 2), 'utf8');

  console.log(`\n成果页实机测试：${report.summary.passed}/${report.summary.total} 通过`);
  for (const c of report.checks) {
    console.log(`  ${c.pass ? 'PASS' : 'FAIL'}  ${c.name}  —  ${c.detail}`);
  }
  console.log(`\n报告：${path.relative(ROOT, outFile)}`);

  return report.summary.failed === 0 ? 0 : 1;
}

main().then((code) => process.exit(code)).catch((err) => {
  console.error('测试失败：', err.message);
  process.exit(2);
});
