/**
 * verify-ds.mjs —— 余晖设计系统 / Afterglow Design System 验收验证器（12-era-modern 展品）
 *
 * 用法：
 *   PRISM_BASE="http://127.0.0.1:4399/repo/prism-era" node scripts/verify-ds.mjs
 *   （不设置 PRISM_BASE 时默认 http://127.0.0.1:4332）
 *
 * 前置条件：
 *   1) 先把本目录（12-era-modern）用任意静态服务器跑起来，例如：
 *        npx vite --port 4332      或      npx vite preview --port 4332
 *        python3 -m http.server 4332（需保证 hash 路由可回退到 index.html）
 *   2) 服务需能访问 <base>/assets/ds/tokens.css（设计系统令牌文件）。
 *
 * 检查项：
 *   1. 页面通过 http 正常加载，CSS/字体全部本地解析成功，无失败请求
 *   2. 运行期零外部（跨源）网络请求
 *   3. 1440 / 1280 / 768 / 390 四档无横向溢出
 *   4. 关键 .ds-* 组件实际存在且尺寸合理（四条路由取并集）
 *   5. prefers-reduced-motion 下入场动效关闭，且游戏仍然可玩可读
 *   6. 关键文本对比度 ≥ 4.5（大字 ≥ 3）
 *   7. 触摸目标 ≥ 24px（AA 硬性）/ ≥ 44px（AAA 提示）
 *   8. 令牌一致性：服务的 tokens.css ↔ 16-design-system/design-tokens.json
 *   9. 字体栈顺序：Noto Sans SC 必须排在完整覆盖的系统 CJK 族之后
 *  10. 字体自托管：Space Grotesk / Space Mono 已加载，零字体 CDN 请求
 *  11. 标题不得使用 white-space: nowrap
 *  12. 中文排版：CJK 文本字距归零，正文行高 ≥ 1.85
 *
 * 产出：
 *   evidence/ds-verification.json     机器可读报告
 *   evidence/ds/ds-<路由>-<视口>.png    截图
 *
 * 实现：Node 内置模块 + 系统 Chrome + 原生 CDP（WebSocket），零第三方依赖。
 * 退出码：0 = 无失败项（允许警告）；1 = 存在失败项；2 = 环境或服务不可用。
 */

import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const EVIDENCE_DIR = path.join(ROOT, 'evidence');
const SHOT_DIR = path.join(EVIDENCE_DIR, 'ds');
const REPORT_FILE = path.join(EVIDENCE_DIR, 'ds-verification.json');
const TOKENS_JSON = path.resolve(ROOT, '..', '16-design-system', 'design-tokens.json');

const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const PORT = 9341; // 与 16-design-system/tools/verify-preview.mjs 的 9338 区分
const DEFAULT_BASE = 'http://127.0.0.1:4332';
const BASE = (process.env.PRISM_BASE || DEFAULT_BASE).trim().replace(/\/+$/, '');

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/* ------------------------------------------------------------------ *
 * 目标定义
 * ------------------------------------------------------------------ */

const ROUTES = [
  { name: 'hall', label: '大厅', hash: '#/' },
  { name: 'pulse', label: '回响', hash: '#/pulse' },
  { name: 'atrium', label: '中庭', hash: '#/atrium' },
  { name: 'halo', label: '光晕', hash: '#/halo' },
];
const urlFor = (r) => `${BASE}/${r.hash}`;

const VIEWPORTS = [
  { name: 'desktop-1440', w: 1440, h: 900, dpr: 1, mobile: false },
  { name: 'desktop-1280', w: 1280, h: 800, dpr: 1, mobile: false },
  { name: 'tablet-768', w: 768, h: 1024, dpr: 1, mobile: false },
  { name: 'mobile-390', w: 390, h: 844, dpr: 2, mobile: true },
];

/** 设计系统契约要求的 14 个 .ds-* 组件 */
const COMPONENTS = {
  topbar: '.ds-topbar',
  cover: '.ds-cover',
  work: '.ds-work',
  detailTitle: '.ds-detail__title',
  btnPrimary: '.ds-btn--primary',
  rail: '.ds-rail',
  indicator: '.ds-indicator',
  canvasFrameCanvas: '.ds-canvas-frame canvas',
  canvasHud: '.ds-canvas-frame__hud',
  diagram: '.ds-diagram',
  chip: '.ds-chip',
  input: '.ds-input',
  footer: '.ds-footer',
  skip: '.ds-skip',
};

/** 对比度采样选择器（覆盖大厅页与三个展项页） */
const CONTRAST_TARGETS = [
  ['封面标题', '.ds-cover__title'],
  ['正文', '.ds-body'],
  ['次级文字', '.ds-sm'],
  ['占位文字', '.ds-xs'],
  ['分区标题', '.ds-h3'],
  ['等宽文字', '.ds-mono'],
  ['标签', '.ds-tag'],
  ['主按钮', '.ds-btn--primary'],
  ['次按钮', '.ds-btn--secondary'],
  ['幽灵按钮', '.ds-btn--ghost'],
  ['筛选 chip', '.ds-chip'],
  ['顶栏链接', '.ds-topbar__link'],
  ['页脚链接', '.ds-footer__links a'],
  ['详情标题', '.ds-detail__title'],
  ['画布 HUD', '.ds-canvas-frame__hud'],
];

const TITLE_SELECTORS = [
  '.ds-cover__title', '.ds-h1', '.ds-h2', '.ds-h3', '.ds-detail__title', '.ds-work__title',
];
const BODY_TEXT_SELECTORS = ['.ds-body', '.ds-lead', '.ds-sm', 'p', 'li'];

/** 令牌文件的候选路径（按优先级） */
const TOKEN_CANDIDATES = [
  '/assets/ds/tokens.css',
  '/assets/tokens.css',
  '/src/styles/tokens.css',
  '/styles/tokens.css',
];

/* ------------------------------------------------------------------ *
 * 报告容器
 * ------------------------------------------------------------------ */

const report = {
  generatedAt: new Date().toISOString(),
  base: BASE,
  viewports: [],
  checks: [],
  failures: [],
  warnings: [],
  errors: [],
  summary: {},
  routes: {},
  tokens: {},
  reducedMotion: {},
  a11y: {},
  fonts: {},
};

const ok = (name, detail, data) => {
  report.checks.push({ name, status: 'pass', detail, ...(data ? { data } : {}) });
  console.log(`✅ ${name} — ${detail}`);
};
const bad = (name, detail, data) => {
  report.checks.push({ name, status: 'fail', detail, ...(data ? { data } : {}) });
  report.failures.push(`${name}：${detail}`);
  console.log(`❌ ${name} — ${detail}`);
};
const warn = (name, detail, data) => {
  report.checks.push({ name, status: 'warn', detail, ...(data ? { data } : {}) });
  report.warnings.push(`${name}：${detail}`);
  console.log(`⚠️  ${name} — ${detail}`);
};

/* ------------------------------------------------------------------ *
 * CDP 客户端（原生 WebSocket，无第三方依赖）
 * ------------------------------------------------------------------ */

class S {
  constructor(ws) { this.ws = ws; this.id = 0; this.p = new Map(); this.events = []; }
  static async open(u) {
    const ws = new WebSocket(u);
    await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
    const s = new S(ws);
    ws.onmessage = (m) => {
      const x = JSON.parse(m.data);
      if (x.id && s.p.has(x.id)) {
        const h = s.p.get(x.id); s.p.delete(x.id);
        x.error ? h.rej(new Error(JSON.stringify(x.error))) : h.res(x.result);
      } else if (x.method) {
        s.events.push(x);
      }
    };
    return s;
  }
  send(method, params = {}, ms = 30000) {
    const id = ++this.id;
    this.ws.send(JSON.stringify({ id, method, params }));
    return new Promise((res, rej) => {
      this.p.set(id, { res, rej });
      setTimeout(() => {
        if (this.p.has(id)) { this.p.delete(id); rej(new Error(`命令超时：${method}`)); }
      }, ms);
    });
  }
  async ev(expr, ms = 45000) {
    const r = await this.send('Runtime.evaluate',
      { expression: expr, returnByValue: true, awaitPromise: true }, ms);
    if (r.exceptionDetails) throw new Error('页面脚本异常：' + JSON.stringify(r.exceptionDetails).slice(0, 300));
    return r.result?.value;
  }
  async shot(file) {
    try {
      const r = await this.send('Page.captureScreenshot',
        { format: 'png', captureBeyondViewport: false }, 25000);
      fs.writeFileSync(file, Buffer.from(r.data, 'base64'));
      return file;
    } catch (e) {
      const r = await this.send('Page.captureScreenshot', { format: 'png' }, 25000);
      fs.writeFileSync(file, Buffer.from(r.data, 'base64'));
      return file;
    }
  }
}

/* ------------------------------------------------------------------ *
 * 页面内探针
 * ------------------------------------------------------------------ */

const PAGE_STATE_EXPR = `(() => {
  const de = document.documentElement;
  const COMPONENTS = ${JSON.stringify(COMPONENTS)};
  const rendered = {};
  for (const [k, sel] of Object.entries(COMPONENTS)) {
    const el = document.querySelector(sel);
    if (!el) { rendered[k] = { present: false, selector: sel }; continue; }
    const r = el.getBoundingClientRect();
    const st = getComputedStyle(el);
    rendered[k] = {
      present: true, selector: sel,
      w: Math.round(r.width), h: Math.round(r.height),
      display: st.display, visibility: st.visibility,
      hidden: st.display === 'none' || st.visibility === 'hidden',
      zero: r.width <= 0 || r.height <= 0,
    };
  }
  const over = [];
  document.querySelectorAll('body *').forEach(el => {
    const r = el.getBoundingClientRect();
    if (r.width > 1 && (r.right > innerWidth + 1 || r.left < -1)) {
      const s2 = getComputedStyle(el);
      if (s2.position === 'fixed') return;
      over.push({ tag: el.tagName, cls: String(el.className || '').slice(0, 46),
        left: Math.round(r.left), right: Math.round(r.right) });
    }
  });
  const sheets = Array.from(document.styleSheets).map(sh => {
    try { return { href: (sh.href || 'inline').split('/').pop(), rules: sh.cssRules.length }; }
    catch (e) { return { href: (sh.href || 'inline').split('/').pop(), rules: -1, blocked: true }; }
  });
  const main = document.getElementById('main');
  return {
    innerWidth: innerWidth, innerHeight: innerHeight,
    docScrollWidth: de.scrollWidth,
    horizontalOverflow: de.scrollWidth > innerWidth + 1,
    overflowSample: over.slice(0, 8), overflowCount: over.length,
    rendered: rendered,
    stylesheets: sheets,
    totalRules: sheets.reduce((a, sh) => a + Math.max(0, sh.rules), 0),
    lang: de.getAttribute('lang'),
    theme: de.getAttribute('data-ds-theme'),
    bodyClass: document.body ? String(document.body.className || '') : '',
    title: document.title,
    url: location.href, hash: location.hash,
    appMounted: !!(main && main.children.length > 0),
    mainChildren: main ? main.children.length : 0,
    fontsLoaded: Array.from(document.fonts).map(f => f.family + ':' + f.status),
  };
})()`;

/* 对比度 / 触摸目标 —— 算法与 16-design-system/tools/verify-preview.mjs 保持一致 */
const A11Y_EXPR = `(() => {
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
  const targets = ${JSON.stringify(CONTRAST_TARGETS)};
  for (const [name, sel] of targets) {
    const el = document.querySelector(sel);
    if (!el) { samples.push({ name: name, sel: sel, missing: true }); continue; }
    const cs = getComputedStyle(el);
    const fg = cs.color, bg = bgOf(el);
    const px = parseFloat(cs.fontSize);
    const w = parseInt(cs.fontWeight) || 400;
    const large = px >= 24 || (px >= 18.66 && w >= 700);
    const r = ratio(fg, bg);
    samples.push({ name: name, sel: sel, fg: fg, bg: bg, fontSize: px, fontWeight: w, large: large,
      ratio: r ? Math.round(r*100)/100 : null, required: large ? 3 : 4.5 });
  }
  const belowAA = [], belowAAA = [];
  const PRIMARY = ['ds-btn', 'ds-iconbtn'];
  document.querySelectorAll('button, a[href], input, select').forEach(el => {
    const r = el.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) return;
    const isPrimary = PRIMARY.some(c => el.classList.contains(c)) && !el.classList.contains('ds-btn--sm');
    const rec = { tag: el.tagName, cls: String(el.className||'').slice(0,40),
      w: Math.round(r.width), h: Math.round(r.height) };
    if (r.height < 24) belowAA.push(rec);
    if (isPrimary && r.height < 44) belowAAA.push(rec);
  });
  return { samples: samples, belowAA: belowAA.slice(0,12), belowAAcount: belowAA.length,
    belowAAA: belowAAA.slice(0,12), belowAAAcount: belowAAA.length };
})()`;

const RM_EXPR = `(() => {
  const root = getComputedStyle(document.documentElement);
  const parseDur = (v) => String(v || '').split(',').map(s => s.trim()).filter(Boolean).map(s => {
    const m = s.match(/^([0-9.]+)(ms|s)$/);
    if (!m) return 0;
    const n = parseFloat(m[1]);
    return m[2] === 's' ? n * 1000 : n;
  });
  const samples = [];
  let maxDur = 0, maxSel = null, nonZero = 0;
  const els = Array.from(document.querySelectorAll('*')).slice(0, 3000);
  for (const el of els) {
    const cs = getComputedStyle(el);
    const vals = parseDur(cs.transitionDuration).concat(parseDur(cs.animationDuration));
    const m = vals.length ? Math.max.apply(null, vals) : 0;
    if (m > 0) {
      nonZero++;
      if (m > maxDur) { maxDur = m; maxSel = el.tagName + '.' + String(el.className || '').slice(0, 40); }
      if (samples.length < 58) {
        samples.push({ tag: el.tagName, cls: String(el.className || '').slice(0, 40),
          transition: cs.transitionDuration, animation: cs.animationDuration, max: m });
      }
    }
  }
  return {
    durBase: root.getPropertyValue('--ds-dur-base').trim(),
    entryDuration: root.getPropertyValue('--ds-entry-duration').trim(),
    maxDuration: maxDur, maxSel: maxSel, nonZeroCount: nonZero,
    samples: samples.slice(0, 58),
    matches: matchMedia('(prefers-reduced-motion: reduce)').matches,
  };
})()`;

const NOWRAP_EXPR = `(() => {
  const sels = ${JSON.stringify(TITLE_SELECTORS)};
  const out = [];
  document.querySelectorAll(sels.join(',')).forEach(el => {
    const cs = getComputedStyle(el);
    out.push({ tag: el.tagName, cls: String(el.className || '').slice(0, 46),
      whiteSpace: cs.whiteSpace, text: (el.textContent || '').trim().slice(0, 24) });
  });
  return out;
})()`;

const CJK_EXPR = `(() => {
  const CJK = /[\\u4e00-\\u9fff\\u3400-\\u4dbf\\u3000-\\u303f\\uff00-\\uffef]/;
  const bodySel = ${JSON.stringify(BODY_TEXT_SELECTORS)};
  const badSpacing = [], badLine = [];
  let scanned = 0, cjkCount = 0;
  const els = Array.from(document.querySelectorAll('body *')).slice(0, 1500);
  for (const el of els) {
    if (el.children.length > 0) continue;
    const t = (el.textContent || '').trim();
    if (!t || !CJK.test(t)) continue;
    cjkCount++;
    const cs = getComputedStyle(el);
    const ls = cs.letterSpacing;
    const lsPx = ls.endsWith('px') ? parseFloat(ls) : (ls === 'normal' ? 0 : (parseFloat(ls) || 0));
    if (Math.abs(lsPx) > 0.01) {
      badSpacing.push({ tag: el.tagName, cls: String(el.className||'').slice(0,40),
        letterSpacing: ls, text: t.slice(0,20) });
    }
    let isBody = false;
    try { isBody = el.matches(bodySel); } catch (e) {}
    if (isBody) {
      const fs = parseFloat(cs.fontSize) || 16;
      const lh = cs.lineHeight;
      let lhNum = NaN;
      if (lh.endsWith('px')) lhNum = parseFloat(lh) / fs;
      else if (lh === 'normal') lhNum = 1.2;
      else lhNum = parseFloat(lh);
      if (!(lhNum >= 1.845)) { // 0.005 容差：35.15px / 19px = 1.85 存在浮点误差
        badLine.push({ tag: el.tagName, cls: String(el.className||'').slice(0,40),
          lineHeight: lh, ratio: Math.round(lhNum*100)/100, text: t.slice(0,20) });
      }
    }
    scanned++;
    if (scanned >= 400) break;
  }
  return { scanned: scanned, cjkCount: cjkCount,
    badSpacing: badSpacing.slice(0, 20), badSpacingCount: badSpacing.length,
    badLine: badLine.slice(0, 20), badLineCount: badLine.length };
})()`;

const CANVAS_PROBE_EXPR = `(() => {
  const cands = Array.from(document.querySelectorAll('.ds-canvas-frame canvas, #main canvas, canvas'));
  const c = cands.find(x => { const r = x.getBoundingClientRect(); return r.width > 10 && r.height > 10; })
    || cands[0] || null;
  if (!c) return { found: false };
  try {
    const data = c.toDataURL('image/png');
    return { found: true, ok: true, length: data.length, w: c.width, h: c.height, data: data };
  } catch (e) {
    return { found: true, ok: false, error: String((e && e.message) || e) };
  }
})()`;

const JUDGE_PROBE_EXPR = `(() => {
  const KEYS = ['极准', '很准', '尚可', '失手'];
  const hud = document.querySelector('.ds-canvas-frame__hud, .pulse-hud, .hud, [class*="hud"]');
  const judgeEl = document.querySelector('.hud-judge, [class*="judge"]');
  const hudText = hud ? (hud.textContent || '') : '';
  const judgeText = judgeEl ? (judgeEl.textContent || '') : '';
  const bodyText = document.body ? (document.body.textContent || '') : '';
  return {
    hasHud: !!hud,
    judgeText: judgeText.trim(),
    hudHit: KEYS.filter(k => hudText.indexOf(k) >= 0),
    bodyHit: KEYS.filter(k => bodyText.indexOf(k) >= 0),
  };
})()`;

const LEGEND_PROBE_EXPR = `(() => {
  const WANT = ['rgb(79, 227, 208)', 'rgb(255, 95, 162)', 'rgb(157, 123, 255)'];
  const found = {};
  for (const c of WANT) found[c] = 0;
  const els = Array.from(document.querySelectorAll('#main *')).slice(0, 3000);
  for (const el of els) {
    const bg = getComputedStyle(el).backgroundColor;
    if (bg in found) found[bg]++;
  }
  const legend = document.querySelector('[class*="legend"]');
  return { found: found, total: WANT.reduce((a, c) => a + found[c], 0),
    hasLegend: !!legend,
    legendText: legend ? (legend.textContent || '').trim().slice(0, 60) : '' };
})()`;

const FONTS_EXPR = `(() => {
  const faces = Array.from(document.fonts).map(f => ({
    family: f.family, status: f.status, weight: f.weight, style: f.style }));
  return { faces: faces, count: faces.length };
})()`;

/* ------------------------------------------------------------------ *
 * 令牌工具
 * ------------------------------------------------------------------ */

/** 取 CSS 中某个选择器的块内容（含嵌套大括号配平） */
function extractBlock(css, selector) {
  const idx = css.indexOf(selector);
  if (idx < 0) return null;
  const open = css.indexOf('{', idx);
  if (open < 0) return null;
  let depth = 0;
  for (let i = open; i < css.length; i++) {
    if (css[i] === '{') depth++;
    else if (css[i] === '}') { depth--; if (depth === 0) return css.slice(open + 1, i); }
  }
  return null;
}

/** 解析块内的 --ds-* 声明 */
function parseDecls(block) {
  const out = new Map();
  if (!block) return out;
  const re = /(--ds-[a-z0-9-]+)\s*:\s*([^;{}]+)(;|$)/gi;
  let m;
  while ((m = re.exec(block))) out.set(m[1], m[2].trim());
  return out;
}

/** 归一化颜色函数：rgba(20, 17, 15, 0.44) → rgba(20,17,15,0.44)；rgba(...,1) → rgb(...) */
function normColorFns(str) {
  return String(str).replace(/rgba?\(([^)]+)\)/gi, (m, inner) => {
    const parts = inner.split(',').map(s => s.trim());
    if (parts.length < 3) return m;
    const nums = parts.slice(0, 3).map(Number);
    if (nums.some(Number.isNaN)) return m;
    const alpha = parts.length > 3 ? Number(parts[3]) : 1;
    if (Number.isNaN(alpha)) return m;
    if (alpha === 1) return `rgb(${nums.join(',')})`;
    return `rgba(${nums.join(',')},${Number(alpha.toFixed(4))})`;
  });
}

/** 归一化普通令牌值：小写十六进制、压缩空白、归一数字 */
function normValue(v) {
  let s = String(v == null ? '' : v).trim().replace(/\s+/g, ' ');
  s = s.replace(/#[0-9a-fA-F]{3,8}\b/g, (h) => h.toLowerCase());
  s = normColorFns(s);
  if (/^[-+]?\d*\.?\d+$/.test(s)) s = String(Number(s));
  return s;
}

/** 归一化字体栈：去引号、转小写、逐项比较 */
function normFontStack(v) {
  return String(v).split(',')
    .map((f) => f.trim().replace(/^['"]/, '').replace(/['"]$/, '').trim())
    .filter(Boolean)
    .map((f) => f.toLowerCase())
    .join(',');
}

/** 解析块内 var(--ds-x) 引用（带环检测） */
function resolveVars(value, decls, depth = 0) {
  if (depth > 8) return value;
  return String(value).replace(/var\(\s*(--ds-[a-z0-9-]+)\s*(?:,\s*([^()]*(?:\([^()]*\)[^()]*)*))?\)/gi,
    (m, name, fallback) => {
      const v = decls.get(name);
      if (v === undefined) return fallback !== undefined ? fallback.trim() : m;
      return resolveVars(v, decls, depth + 1);
    });
}

/** 归一化任意 CSS 颜色为 rgb/rgba 便于比较 */
function canonColor(c) {
  const s = String(c).trim();
  if (/^#/.test(s)) {
    let hex = s.slice(1);
    if (hex.length === 3) hex = hex.split('').map((x) => x + x).join('');
    if (hex.length === 6) {
      const n = [0, 2, 4].map((i) => parseInt(hex.slice(i, i + 2), 16));
      return `rgb(${n.join(',')})`;
    }
    if (hex.length === 8) {
      const n = [0, 2, 4, 6].map((i) => parseInt(hex.slice(i, i + 2), 16));
      return `rgba(${n.slice(0, 3).join(',')},${Number((n[3] / 255).toFixed(4))})`;
    }
  }
  return normColorFns(s);
}

/* design-tokens.json → CSS 变量映射表
 * 依据 16-design-system/src/tokens.css 的命名约定建立（JSON 为语义树，CSS 为扁平变量） */
const COLOR_VARS = {
  bg: '--ds-bg', bgRaised: '--ds-bg-raised', bgSunken: '--ds-bg-sunken',
  ink: '--ds-ink', inkSoft: '--ds-ink-soft', inkFaint: '--ds-ink-faint',
  line: '--ds-line', lineStrong: '--ds-line-strong', surface: '--ds-surface',
  accent: '--ds-accent', accentHover: '--ds-accent-hover', accentSoft: '--ds-accent-soft',
  accentInk: '--ds-accent-ink', jade: '--ds-jade', jadeSoft: '--ds-jade-soft',
  overlay: '--ds-overlay',
};
const CANVAS_VARS = {
  hudBg: '--ds-canvas-hud-bg', hudInk: '--ds-canvas-hud-ink', hudLine: '--ds-canvas-hud-line',
  scrim: '--ds-canvas-scrim', danger: '--ds-danger', success: '--ds-success',
  warning: '--ds-warning', info: '--ds-info',
};
const SECTION_VARS = {
  lightInk: ['--ds-section-ink', 'light'],
  lightSoft: ['--ds-section-soft', 'light'],
  lightFaint: ['--ds-section-faint', 'light'],
  darkInk: ['--ds-section-ink', 'dark'],
  darkSoft: ['--ds-section-soft', 'dark'],
  darkFaint: ['--ds-section-faint', 'dark'],
  toneFadeLight: ['--ds-tone-fade', 'light'],
  toneFadeDark: ['--ds-tone-fade', 'dark'],
};
/** [jsonPath, cssVar, theme('light'|'dark'), kind] */
const TOKEN_MAP = [
  ['typography.family.display', '--ds-font-display', 'light', 'font'],
  ['typography.family.text', '--ds-font-text', 'light', 'font'],
  ['typography.family.mono', '--ds-font-mono', 'light', 'font'],
  ['typography.size.display', '--ds-type-display', 'light'],
  ['typography.size.h1', '--ds-type-h1', 'light'],
  ['typography.size.h2', '--ds-type-h2', 'light'],
  ['typography.size.h3', '--ds-type-h3', 'light'],
  ['typography.size.h4', '--ds-type-h4', 'light'],
  ['typography.size.lead', '--ds-type-lead', 'light'],
  ['typography.size.body', '--ds-type-body', 'light'],
  ['typography.size.sm', '--ds-type-sm', 'light'],
  ['typography.size.xs', '--ds-type-xs', 'light'],
  ['typography.size.mono', '--ds-type-mono', 'light'],
  ['typography.lineHeight.display', '--ds-lh-display', 'light'],
  ['typography.lineHeight.tight', '--ds-lh-tight', 'light'],
  ['typography.lineHeight.snug', '--ds-lh-snug', 'light'],
  ['typography.lineHeight.normal', '--ds-lh-normal', 'light'],
  ['typography.lineHeight.relaxed', '--ds-lh-relaxed', 'light'],
  ['typography.lineHeight.mono', '--ds-lh-mono', 'light'],
  ['typography.weight.regular', '--ds-w-regular', 'light'],
  ['typography.weight.medium', '--ds-w-medium', 'light'],
  ['typography.weight.semibold', '--ds-w-semibold', 'light'],
  ['typography.weight.bold', '--ds-w-bold', 'light'],
  ['typography.tracking.display', '--ds-track-display', 'light'],
  ['typography.tracking.body', '--ds-track-body', 'light'],
  ['typography.tracking.cjk', '--ds-track-cjk', 'light'],
  ['typography.tracking.mono', '--ds-track-mono', 'light'],
  ['typography.tracking.caps', '--ds-track-caps', 'light'],
  ['space.1', '--ds-space-1', 'light'],
  ['space.2', '--ds-space-2', 'light'],
  ['space.3', '--ds-space-3', 'light'],
  ['space.4', '--ds-space-4', 'light'],
  ['space.5', '--ds-space-5', 'light'],
  ['space.6', '--ds-space-6', 'light'],
  ['space.7', '--ds-space-7', 'light'],
  ['space.8', '--ds-space-8', 'light'],
  ['space.9', '--ds-space-9', 'light'],
  ['space.10', '--ds-space-10', 'light'],
  ['space.gutter', '--ds-space-gutter', 'light'],
  ['space.railGap', '--ds-space-rail-gap', 'light'],
  ['space.sectionPadTop', '--ds-space-section-top', 'light'],
  ['space.sectionPadBottom', '--ds-space-section-bottom', 'light'],
  ['radius.xs', '--ds-radius-xs', 'light'],
  ['radius.sm', '--ds-radius-sm', 'light'],
  ['radius.md', '--ds-radius-md', 'light'],
  ['radius.lg', '--ds-radius-lg', 'light'],
  ['radius.xl', '--ds-radius-xl', 'light'],
  ['radius.pill', '--ds-radius-pill', 'light'],
  ['radius.media', '--ds-radius-media', 'light'],
  ['radius.control', '--ds-radius-control', 'light'],
  ['shadow.1', '--ds-shadow-1', 'light'],
  ['shadow.2', '--ds-shadow-2', 'light'],
  ['shadow.3', '--ds-shadow-3', 'light'],
  ['shadow.4', '--ds-shadow-4', 'light'],
  ['shadow.ring', '--ds-ring', 'light'],
  ['shadow.ringStrong', '--ds-ring-strong', 'light'],
  ['shadow.focusRing', '--ds-focus-ring', 'light'],
  ['motion.duration.instant', '--ds-dur-instant', 'light'],
  ['motion.duration.fast', '--ds-dur-fast', 'light'],
  ['motion.duration.base', '--ds-dur-base', 'light'],
  ['motion.duration.slow', '--ds-dur-slow', 'light'],
  ['motion.duration.reveal', '--ds-dur-reveal', 'light'],
  ['motion.easing.out', '--ds-ease-out', 'light'],
  ['motion.easing.inOut', '--ds-ease-inout', 'light'],
  ['motion.easing.veil', '--ds-ease-veil', 'light'],
  ['motion.easing.spring', '--ds-ease-spring', 'light'],
  ['motion.easing.snap', '--ds-ease-snap', 'light'],
  ['motion.stagger.step', '--ds-stagger-step', 'light'],
  ['motion.entry.translateY', '--ds-entry-translate', 'light'],
  ['motion.entry.blur', '--ds-entry-blur', 'light'],
  ['motion.entry.duration', '--ds-entry-duration', 'light'],
  ['zIndex.base', '--ds-z-base', 'light'],
  ['zIndex.raised', '--ds-z-raised', 'light'],
  ['zIndex.sticky', '--ds-z-sticky', 'light'],
  ['zIndex.rail', '--ds-z-rail', 'light'],
  ['zIndex.overlay', '--ds-z-overlay', 'light'],
  ['zIndex.modal', '--ds-z-modal', 'light'],
  ['zIndex.toast', '--ds-z-toast', 'light'],
  ['layout.maxWidth', '--ds-max-width', 'light'],
  ['layout.maxWidthWide', '--ds-max-width-wide', 'light'],
  ['layout.readWidth', '--ds-read-width', 'light'],
  ['layout.railWidth', '--ds-rail-width', 'light'],
  ['layout.railInset', '--ds-rail-inset', 'light'],
  ['layout.viewportSection', '--ds-section-height', 'light'],
  ['layout.grid.gap', '--ds-grid-gap', 'light'],
  ['layout.grid.gutter', '--ds-grid-gutter', 'light'],
  ['a11y.minContrastText', '--ds-contrast-text', 'light'],
  ['a11y.minContrastLarge', '--ds-contrast-large', 'light'],
  ['a11y.minContrastUi', '--ds-contrast-ui', 'light'],
  ['a11y.targetSizeEnhanced', '--ds-target-min', 'light'],
  ['a11y.focusRingWidth', '--ds-focus-width', 'light'],
  ['a11y.focusRingOffset', '--ds-focus-offset', 'light'],
  ['a11y.focusRing', '--ds-focus-ring', 'light'],
  ['component.workCard.dimOverlay', '--ds-work-dim', 'light'],
];

/** 展平 design-tokens.json 的叶子令牌 */
function flattenTokens(node, prefix = [], out = []) {
  if (!node || typeof node !== 'object' || Array.isArray(node)) return out;
  for (const [k, v] of Object.entries(node)) {
    if (k.startsWith('$')) continue;
    const p = [...prefix, k];
    if (v && typeof v === 'object' && !Array.isArray(v) && '$value' in v) {
      out.push({ path: p.join('.'), value: v.$value, type: v.$type || '' });
    } else if (v && typeof v === 'object' && !Array.isArray(v)) {
      flattenTokens(v, p, out);
    }
  }
  return out;
}

/* ------------------------------------------------------------------ *
 * 网络请求分析
 * ------------------------------------------------------------------ */

let BASE_ORIGIN = null;
try { BASE_ORIGIN = new URL(BASE).origin; } catch { BASE_ORIGIN = null; }

const FONT_CDN_RE = /(font|googleapis|gstatic|typekit|jsdelivr|unpkg|cdnjs|alicdn|cloudfront|bootstrapcdn)/i;

function analyzeNetwork(s) {
  const reqs = s.events.filter((e) => e.method === 'Network.requestWillBeSent')
    .map((e) => e.params.request.url);
  const external = reqs.filter((u) => {
    if (!/^https?:/i.test(u)) return false;
    try { return BASE_ORIGIN && new URL(u).origin !== BASE_ORIGIN; } catch { return false; }
  });
  const fontCdn = reqs.filter((u) => {
    try { return FONT_CDN_RE.test(new URL(u).host); } catch { return false; }
  });
  const failed = s.events.filter((e) => e.method === 'Network.loadingFailed')
    .map((e) => ({ url: e.params.requestId, error: e.params.errorText, type: e.params.type }));
  const httpErrors = s.events.filter((e) => e.method === 'Network.responseReceived'
    && e.params.response.status >= 400)
    .map((e) => ({ url: e.params.response.url, status: e.params.response.status }));
  return { total: reqs.length, external, fontCdn, failed, httpErrors, reqs };
}

/* ------------------------------------------------------------------ *
 * 主流程
 * ------------------------------------------------------------------ */

async function main() {
  fs.mkdirSync(SHOT_DIR, { recursive: true });

  if (!fs.existsSync(CHROME)) {
    console.error(`❌ 未找到系统 Chrome：${CHROME}`);
    console.error('   请先安装 Google Chrome，或修改脚本顶部的 CHROME 常量。');
    return 2;
  }

  // ---- 服务可达性预检 ----
  let probeOk = false;
  let probeMsg = '';
  try {
    const res = await fetch(`${BASE}/`, { signal: AbortSignal.timeout(6000) });
    probeOk = res.ok;
    probeMsg = `HTTP ${res.status}`;
  } catch (e) {
    probeMsg = e && e.message ? e.message : String(e);
  }
  if (!probeOk) {
    console.error(`❌ 无法访问展品服务：${BASE}/（${probeMsg}）`);
    console.error('   请先启动本地服务器，例如在 12-era-modern 目录执行：');
    console.error('     npx vite --port 4332');
    console.error('     npx vite preview --port 4332');
    console.error('   若部署在子路径，请设置环境变量 PRISM_BASE，例如：');
    console.error('     PRISM_BASE="http://127.0.0.1:4399/repo/prism-era" node scripts/verify-ds.mjs');
    report.errors.push(`服务不可达：${BASE}/（${probeMsg}）`);
    fs.writeFileSync(REPORT_FILE, JSON.stringify(report, null, 2));
    return 2;
  }
  console.log(`▶ 目标地址：${BASE}/  （${probeMsg}）`);

  const chrome = spawn(CHROME, [
    '--headless=new', '--disable-gpu', '--no-sandbox', '--hide-scrollbars',
    '--enable-unsafe-swiftshader', // 无 GPU 环境下用 SwiftShader 跑 WebGL，否则中庭/光晕的 three.js 视图无法渲染
    `--remote-debugging-port=${PORT}`, '--remote-allow-origins=*',
    `--user-data-dir=${path.join(os.tmpdir(), 'ds-verify-12era')}`,
    '--no-first-run', '--no-default-browser-check', 'about:blank',
  ], { stdio: 'ignore' });

  let s = null;
  try {
    // ---- CDP 就绪 ----
    let cdp = null;
    for (let i = 0; i < 90 && !cdp; i++) {
      for (const h of [`http://127.0.0.1:${PORT}`, `http://localhost:${PORT}`]) {
        try { if ((await fetch(`${h}/json/version`)).ok) { cdp = h; break; } } catch {}
      }
      if (!cdp) await sleep(400);
    }
    if (!cdp) throw new Error('Chrome 调试端口未就绪');

    let list = [];
    for (let i = 0; i < 20 && !list.some((x) => x.type === 'page'); i++) {
      try { list = await (await fetch(`${cdp}/json/list`)).json(); } catch {}
      if (!list.some((x) => x.type === 'page')) await sleep(400);
    }
    const target = list.find((x) => x.type === 'page');
    if (!target) throw new Error('未找到可用的浏览器标签页');

    s = await S.open(target.webSocketDebuggerUrl);
    await s.send('Page.enable');
    await s.send('Runtime.enable');
    await s.send('Network.enable');
    await s.send('Log.enable');

    const countLoads = () => s.events.filter((e) => e.method === 'Page.loadEventFired').length;

    /** 真实（可信）点击：脚本 .click() 不构成用户手势，音频解锁会挂起 */
    const clickElement = async (selector) => {
      const box = await s.ev(`(() => {
        const el = document.querySelector(${JSON.stringify(selector)});
        if (!el) return null;
        el.scrollIntoView({ block: 'center' });
        const r = el.getBoundingClientRect();
        return { x: r.left + r.width / 2, y: r.top + r.height / 2, w: r.width, h: r.height };
      })()`).catch(() => null);
      if (!box || !box.w || !box.h) return false;
      const x = Math.round(box.x), y = Math.round(box.y);
      try {
        await s.send('Input.dispatchMouseEvent',
          { type: 'mouseMoved', x, y, button: 'none', buttons: 0 });
        await s.send('Input.dispatchMouseEvent',
          { type: 'mousePressed', x, y, button: 'left', buttons: 1, clickCount: 1 });
        await s.send('Input.dispatchMouseEvent',
          { type: 'mouseReleased', x, y, button: 'left', buttons: 0, clickCount: 1 });
        return true;
      } catch {
        return await s.ev(`(() => { const el = document.querySelector(${JSON.stringify(selector)});
          if (!el) return false; el.click(); return true; })()`).catch(() => false);
      }
    };

    /** 全量重新加载（先 about:blank，确保换 hash 也触发真实 load） */
    const gotoFresh = async (url, waitMs = 1500) => {
      await s.send('Page.navigate', { url: 'about:blank' }).catch(() => {});
      await sleep(120);
      const n0 = countLoads();
      await s.send('Page.navigate', { url });
      for (let i = 0; i < 80; i++) {
        if (countLoads() > n0) break;
        await sleep(150);
      }
      await sleep(waitMs);
    };

    /* ================================================================
     * 阶段 A：视口扫描（四档 × 四路由）
     * ================================================================ */
    console.log('\n▶ 阶段 A：视口与组件扫描');
    const componentUnion = {};   // key -> {route, present, w, h}
    const componentHits = {};    // key -> [{route, viewport, w, h, hidden, zero}]
    let overflowFails = [];
    let notMounted = [];

    for (const vp of VIEWPORTS) {
      const vpEntry = { ...vp, routes: {} };
      await s.send('Emulation.setDeviceMetricsOverride', {
        width: vp.w, height: vp.h, deviceScaleFactor: vp.dpr, mobile: vp.mobile,
      });
      for (const route of ROUTES) {
        await gotoFresh(urlFor(route), 1600);
        const st = await s.ev(PAGE_STATE_EXPR);
        vpEntry.routes[route.name] = {
          url: st.url, scrollWidth: st.docScrollWidth, innerWidth: st.innerWidth,
          horizontalOverflow: st.horizontalOverflow,
          appMounted: st.appMounted, lang: st.lang, theme: st.theme, bodyClass: st.bodyClass,
          components: st.rendered,
        };
        if (!st.appMounted) notMounted.push(`${route.name}@${vp.name}`);
        if (st.horizontalOverflow) {
          overflowFails.push(`${route.name}@${vp.name} scrollWidth=${st.docScrollWidth}>${st.innerWidth} 样本 ${JSON.stringify(st.overflowSample)}`);
        }
        for (const [k, r] of Object.entries(st.rendered)) {
          if (!r.present) continue;
          if (!componentUnion[k]) componentUnion[k] = { route: route.name, viewport: vp.name, ...r };
          componentHits[k] = componentHits[k] || [];
          componentHits[k].push({ route: route.name, viewport: vp.name, ...r });
        }
        await s.shot(path.join(SHOT_DIR, `ds-${route.name}-${vp.name}.png`));
      }
      report.viewports.push(vpEntry);
    }

    /* ================================================================
     * 检查 3：无横向溢出
     * ================================================================ */
    console.log('\n▶ 检查 3：横向溢出');
    if (!overflowFails.length) {
      ok('无横向溢出', '1440 / 1280 / 768 / 390 四档 × 四路由均无横向溢出');
    } else {
      bad('无横向溢出', `${overflowFails.length} 处溢出：${overflowFails.slice(0, 3).join(' | ')}`);
    }

    /* ================================================================
     * 检查 4：关键组件齐备（四条路由取并集）
     * ================================================================ */
    console.log('\n▶ 检查 4：关键组件');
    const componentDetail = {};
    const missing = [];
    const hidden = [];
    for (const [k, sel] of Object.entries(COMPONENTS)) {
      const found = componentUnion[k];
      const hits = componentHits[k] || [];
      const visible = hits.filter((h) => !h.hidden && !h.zero);
      componentDetail[k] = {
        selector: sel, present: !!found, ...(found || {}),
        routes: [...new Set(hits.map((h) => h.route))],
        hiddenRoutes: [...new Set(hits.filter((h) => h.hidden).map((h) => h.route))],
        visibleRoutes: [...new Set(visible.map((h) => h.route))],
      };
      if (!found) { missing.push(`${k}(${sel})`); continue; }
      if (!visible.length) {
        hidden.push(`${k}(${sel}) 存在但全部隐藏或零尺寸：`
          + hits.slice(0, 2).map((h) => `${h.route} ${h.w}×${h.h} display=${h.display}`).join(' | '));
      }
    }
    // 逐路由明细（取 1440 档，作为每个路由的代表值）
    const routeComponentMatrix = {};
    const firstVp = report.viewports[0];
    for (const route of ROUTES) {
      const st = firstVp && firstVp.routes[route.name];
      routeComponentMatrix[route.name] = st ? st.components || {} : {};
    }
    report.componentDetail = componentDetail;
    report.componentPerRoute = routeComponentMatrix;

    if (!missing.length && !hidden.length) {
      ok('关键组件齐备', `${Object.keys(COMPONENTS).length} 类 .ds-* 组件均已渲染`);
    } else {
      const parts = [];
      if (missing.length) parts.push(`缺失 ${missing.length} 类：${missing.join(', ')}`);
      if (hidden.length) parts.push(`${hidden.length} 类存在但未真正显示：${hidden.join('；')}`);
      bad('关键组件齐备', parts.join('；'));
    }

    /* ================================================================
     * 检查 6/7：对比度与触摸目标（四条路由）
     * ================================================================ */
    console.log('\n▶ 检查 6-7：对比度与触摸目标');
    await s.send('Emulation.setDeviceMetricsOverride',
      { width: 1280, height: 800, deviceScaleFactor: 1, mobile: false });

    const contrastBySelector = {};   // sel -> 最差样本
    const touchTotals = { belowAA: [], belowAAA: [] };
    for (const route of ROUTES) {
      await gotoFresh(urlFor(route), 1600);
      let a11y = null;
      try { a11y = await s.ev(A11Y_EXPR); } catch (e) { a11y = null; }
      if (!a11y) { report.routes[route.name] = { error: '页面脚本异常' }; continue; }
      report.routes[route.name] = { a11y };
      for (const smp of a11y.samples) {
        if (smp.missing || smp.ratio === null) continue;
        const key = smp.sel;
        const cur = contrastBySelector[key];
        if (!cur || smp.ratio < cur.ratio) {
          contrastBySelector[key] = { ...smp, route: route.name };
        }
      }
      for (const rec of a11y.belowAA) touchTotals.belowAA.push({ ...rec, route: route.name });
      for (const rec of a11y.belowAAA) touchTotals.belowAAA.push({ ...rec, route: route.name });
    }
    report.contrast = contrastBySelector;
    report.touch = {
      belowAA: touchTotals.belowAA.slice(0, 20), belowAAcount: touchTotals.belowAA.length,
      belowAAA: touchTotals.belowAAA.slice(0, 20), belowAAAcount: touchTotals.belowAAA.length,
    };

    const contrastList = Object.values(contrastBySelector);
    const contrastFails = contrastList.filter((x) => x.ratio < x.required);
    if (!contrastList.length) {
      warn('文本对比度达标', '未取到任何可计算的对比度样本（目标选择器在四条路由上均不存在）');
    } else if (contrastFails.length) {
      bad('文本对比度达标', contrastFails.map((x) => `${x.name}=${x.ratio}(需${x.required})`).join(', '));
    } else {
      const min = Math.min(...contrastList.map((x) => x.ratio));
      ok('文本对比度达标', `${contrastList.length} 个选择器全部达标，最低 ${min}:1`);
    }

    if (!touchTotals.belowAA.length) {
      ok('触摸目标 ≥24px (WCAG 2.2 AA)', '所有 button / a[href] / input / select 均 ≥24px');
    } else {
      bad('触摸目标 ≥24px (WCAG 2.2 AA)',
        `${touchTotals.belowAA.length} 个不足 24px：${JSON.stringify(touchTotals.belowAA.slice(0, 5))}`);
    }
    if (!touchTotals.belowAAA.length) {
      ok('主控件触摸目标 ≥44px (AAA)', '.ds-btn / .ds-iconbtn（排除 .ds-btn--sm）全部 ≥44px');
    } else {
      warn('主控件触摸目标 ≥44px (AAA)',
        `${touchTotals.belowAAA.length} 个偏小：${JSON.stringify(touchTotals.belowAAA.slice(0, 5))}`);
    }

    /* ================================================================
     * 检查 5：reduced-motion
     * ================================================================ */
    console.log('\n▶ 检查 5：reduced-motion');
    await s.send('Emulation.setEmulatedMedia',
      { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });

    const rmPerRoute = {};
    const rmFails = [];
    for (const route of ROUTES) {
      await gotoFresh(urlFor(route), 1700);
      const rm = await s.ev(RM_EXPR).catch(() => null);
      if (!rm) { rmFails.push(`${route.name}: 探针失败`); continue; }
      rmPerRoute[route.name] = rm;
      if (rm.durBase !== '1ms') rmFails.push(`${route.name}: --ds-dur-base=${rm.durBase || '(空)'}`);
      if (rm.entryDuration !== '1ms') rmFails.push(`${route.name}: --ds-entry-duration=${rm.entryDuration || '(空)'}`);
      if (rm.maxDuration > 1) {
        rmFails.push(`${route.name}: 最大动效时长 ${rm.maxDuration}ms > 1ms（${rm.maxSel}）`);
      }
    }
    report.reducedMotion = rmPerRoute;

    // 5a：回响（pulse）仍可玩 / 可读
    let pulseDetail = null;
    await gotoFresh(urlFor(ROUTES[1]), 1700);
    const started = await clickElement('[data-control="start"]');
    if (!started) {
      rmFails.push('pulse: 未找到 [data-control="start"] 控件，游戏无法启动');
    } else {
      await sleep(3200);
      const c1 = await s.ev(CANVAS_PROBE_EXPR).catch(() => ({ found: false, error: '探针异常' }));
      await sleep(350);
      const c2 = await s.ev(CANVAS_PROBE_EXPR).catch(() => ({ found: false, error: '探针异常' }));
      const judge = await s.ev(JUDGE_PROBE_EXPR).catch(() => null);
      const changed = !!(c1 && c2 && c1.data && c2.data && c1.data !== c2.data);
      pulseDetail = { started: true, changed, c1: c1 && { ok: c1.ok, length: c1.length, error: c1.error }, c2: c2 && { ok: c2.ok, length: c2.length, error: c2.error }, judge };
      if (!c1 || !c1.found) rmFails.push('pulse: 未找到画布元素');
      else if (!c1.ok) rmFails.push(`pulse: 画布采样失败（${c1.error}）`);
      else if (!changed) rmFails.push('pulse: 两次画布采样完全一致，游戏疑似停止绘制');
      const hitCount = judge ? (judge.hudHit.length + judge.bodyHit.length) : 0;
      if (!hitCount) rmFails.push('pulse: HUD 未出现判定文本（极准/很准/尚可/失手）');
    }

    // 5b：中庭（atrium）图例色块仍在
    await gotoFresh(urlFor(ROUTES[2]), 1700);
    const legend = await s.ev(LEGEND_PROBE_EXPR).catch(() => null);
    report.legend = legend;
    if (!legend) rmFails.push('atrium: 图例探针失败');
    else {
      const missingLegend = Object.entries(legend.found).filter(([, n]) => !n).map(([c]) => c);
      if (missingLegend.length) {
        rmFails.push(`atrium: 图例色块缺失 ${missingLegend.join(', ')}`);
      }
    }

    await s.send('Emulation.setEmulatedMedia', { features: [] });

    if (!rmFails.length) {
      const maxAll = Math.max(...Object.values(rmPerRoute).map((r) => r.maxDuration || 0));
      ok('reduced-motion 关闭动效',
        `四条路由 --ds-dur-base/--ds-entry-duration 均为 1ms，最大动效 ${maxAll}ms，`
        + '回响仍可绘制且 HUD 有判定文本，中庭图例色块齐全');
    } else {
      bad('reduced-motion 关闭动效', rmFails.slice(0, 4).join(' | '));
    }
    if (pulseDetail) report.pulse = pulseDetail;

    /* ================================================================
     * 检查 8/9：令牌一致性 + 字体栈顺序
     * ================================================================ */
    console.log('\n▶ 检查 8-9：令牌与字体栈');
    let tokensCss = null;
    let tokensUrl = null;
    for (const cand of TOKEN_CANDIDATES) {
      const url = `${BASE}${cand}`;
      try {
        const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
        if (!res.ok) continue;
        const text = await res.text();
        if (text.includes('--ds-')) { tokensCss = text; tokensUrl = url; break; }
      } catch {}
    }

    let tokensJson = null;
    try {
      tokensJson = JSON.parse(fs.readFileSync(TOKENS_JSON, 'utf8'));
    } catch (e) {
      report.errors.push(`design-tokens.json 读取失败：${e.message}`);
    }
    const flatTokens = tokensJson ? flattenTokens(tokensJson) : [];
    const tokenByPath = new Map(flatTokens.map((t) => [t.path, t]));

    if (!tokensCss) {
      bad('令牌一致性', `未找到可用的令牌文件（尝试：${TOKEN_CANDIDATES.join('、')}），无法与 design-tokens.json 比对`);
      bad('字体栈顺序', '缺少令牌文件，无法解析 --ds-font-display / --ds-font-text');
    } else {
      const rootBlock = extractBlock(tokensCss, ':root');
      const darkBlock = extractBlock(tokensCss, '[data-ds-theme="dark"]');
      const rootDecls = parseDecls(rootBlock);
      const darkDecls = parseDecls(darkBlock);
      const allDecls = new Map([...rootDecls, ...darkDecls]);

      // 扩展映射表：颜色浅/深 + 画布色 + 分区色
      const map = [...TOKEN_MAP];
      for (const [k, v] of Object.entries(COLOR_VARS)) {
        map.push([`color.light.${k}`, v, 'light']);
        map.push([`color.dark.${k}`, v, 'dark']);
      }
      for (const [k, v] of Object.entries(CANVAS_VARS)) map.push([`color.canvas.${k}`, v, 'light']);
      for (const [k, [v, theme]] of Object.entries(SECTION_VARS)) {
        map.push([`color.section.${k}`, v, theme]);
      }

      const mismatches = [];
      const missingVars = [];
      const unmapped = [];
      const compared = new Set();
      for (const [jpath, cssVar, theme, kind] of map) {
        const tok = tokenByPath.get(jpath);
        if (!tok) { unmapped.push(jpath); continue; }
        const decls = theme === 'dark' ? darkDecls : rootDecls;
        const cssRaw = decls.get(cssVar);
        if (cssRaw === undefined) {
          if (theme === 'dark' && !darkDecls.size) { unmapped.push(jpath + '(无深色块)'); continue; }
          missingVars.push(`${cssVar}（来自 ${jpath}）`);
          continue;
        }
        compared.add(cssVar);
        const cssVal = resolveVars(cssRaw, decls);
        const jsonVal = resolveVars(String(tok.value), decls);
        const a = kind === 'font' ? normFontStack(cssVal) : normValue(cssVal);
        const b = kind === 'font' ? normFontStack(jsonVal) : normValue(jsonVal);
        if (a !== b) {
          mismatches.push({
            cssVar, jsonPath: jpath, kind: kind || 'value',
            css: cssRaw.trim(), json: String(tok.value),
            cssNormalized: a, jsonNormalized: b,
            severity: kind === 'font' ? 'warn' : 'fail',
          });
        }
      }

      const hardFails = mismatches.filter((m) => m.severity === 'fail');
      const softFails = mismatches.filter((m) => m.severity === 'warn');
      report.tokens = {
        url: tokensUrl,
        jsonFile: TOKENS_JSON,
        jsonTokenCount: flatTokens.length,
        mappedCount: map.length,
        comparedCount: compared.size,
        cssRootVarCount: rootDecls.size,
        cssDarkVarCount: darkDecls.size,
        mismatches, missingVars, unmapped,
        normalization: '大小写不敏感、空白压缩、hex 小写、rgba 数值归一（rgba(20,17,15,.44) ≡ rgba(20, 17, 15, 0.44)，alpha=1 归为 rgb）、var() 引用在同一块内解析',
      };

      const detailParts = [];
      if (hardFails.length) {
        detailParts.push(`${hardFails.length} 处值不一致：`
          + hardFails.slice(0, 4).map((m) => `${m.cssVar} CSS=${m.css} / JSON=${m.json}`).join(' | '));
      }
      if (missingVars.length) {
        detailParts.push(`${missingVars.length} 个变量未声明：${missingVars.slice(0, 6).join(', ')}`);
      }
      if (!detailParts.length) {
        ok('令牌一致性',
          `JSON 令牌 ${flatTokens.length} 项 / 可映射 ${map.length} 项 / 实比 ${compared.size} 项，`
          + `:root 变量 ${rootDecls.size} 个，值全部一致（大小写、空白、rgba 写法、var() 引用已归一）`
          + (softFails.length ? `；另有 ${softFails.length} 处字体栈差异（仅提示）` : ''));
      } else {
        bad('令牌一致性', detailParts.join('；'));
      }
      if (softFails.length) {
        warn('令牌一致性 · 字体栈', softFails.map((m) => `${m.cssVar}：CSS=${m.css} / JSON=${m.json}`).join(' | '));
      }

      /* ---- 检查 9：字体栈顺序 ---- */
      const fontDisplay = rootDecls.get('--ds-font-display') || '';
      const fontText = rootDecls.get('--ds-font-text') || '';
      const orderRules = [
        ['--ds-font-display', fontDisplay],
        ['--ds-font-text', fontText],
      ];
      const CJK_FULL = ['PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', 'Source Han Sans SC'];
      const orderFails = [];
      const orderDetail = [];
      for (const [name, raw] of orderRules) {
        if (!raw) { orderFails.push(`${name} 未声明`); continue; }
        const fams = raw.split(',').map((f) => f.trim().replace(/^['"]/, '').replace(/['"]$/, '').trim());
        const notoIdx = fams.findIndex((f) => f.toLowerCase() === 'noto sans sc');
        if (notoIdx < 0) { orderFails.push(`${name} 未包含 Noto Sans SC`); continue; }
        for (const cjk of CJK_FULL) {
          const idx = fams.findIndex((f) => f.toLowerCase() === cjk.toLowerCase());
          if (idx < 0) continue;
          if (!(notoIdx > idx)) orderFails.push(`${name}: Noto Sans SC(${notoIdx}) 未排在 ${cjk}(${idx}) 之后`);
        }
        orderDetail.push(`${name}=[${fams.join(' ')}]`);
      }
      report.fontStack = { fontDisplay, fontText, orderDetail };
      if (!orderFails.length) {
        ok('字体栈顺序', `Noto Sans SC 位于所有完整 CJK 族之后；${orderDetail.join('；')}`);
      } else {
        bad('字体栈顺序', orderFails.join(' | '));
      }
    }

    /* ================================================================
     * 检查 1 / 2：加载与外部请求（汇总整个运行期的网络记录）
     * ================================================================ */
    console.log('\n▶ 检查 1-2、10-12：加载 / 外部请求 / 字体 / 标题 / 中文排版');
    await s.send('Emulation.setDeviceMetricsOverride',
      { width: 1280, height: 800, deviceScaleFactor: 1, mobile: false });
    await gotoFresh(urlFor(ROUTES[0]), 1800);
    await s.ev(`(async () => {
      try { await document.fonts.load('16px "Space Grotesk"'); } catch (e) {}
      try { await document.fonts.load('16px "Space Mono"'); } catch (e) {}
      try { await document.fonts.ready; } catch (e) {}
      return true;
    })()`).catch(() => {});

    const net = analyzeNetwork(s);
    report.network = {
      totalRequests: net.total, external: net.external, fontCdn: net.fontCdn,
      failed: net.failed, httpErrors: net.httpErrors,
    };
    const hallState = await s.ev(PAGE_STATE_EXPR).catch(() => null);
    const mountedRoutes = ROUTES.filter((r) => {
      for (const vp of report.viewports) if (vp.routes[r.name]?.appMounted) return true;
      return false;
    }).map((r) => r.name);

    if (net.httpErrors.length) {
      bad('页面加载与本地资源', `存在 ${net.httpErrors.length} 个失败请求：`
        + net.httpErrors.slice(0, 3).map((e) => `${e.status} ${e.url}`).join(' | '));
    } else if (!mountedRoutes.length) {
      bad('页面加载与本地资源', '四条路由均未挂载应用内容（#main 为空），服务可能返回了错误页');
    } else if (net.failed.filter((f) => !/ABORTED/i.test(f.error || '')).length) {
      bad('页面加载与本地资源',
        `${net.failed.filter((f) => !/ABORTED/i.test(f.error || '')).length} 个请求加载失败：`
        + net.failed.slice(0, 3).map((f) => f.error).join(' | '));
    } else {
      const sheets = hallState ? hallState.stylesheets : [];
      const blocked = sheets.filter((x) => x.blocked);
      if (blocked.length) {
        bad('页面加载与本地资源', `样式表被阻止：${blocked.map((x) => x.href).join(', ')}`);
      } else {
        ok('页面加载与本地资源',
          `HTTP 加载正常，${mountedRoutes.join('/')} 已挂载，${net.total} 个请求全部本地，`
          + `样式表 ${sheets.length} 份 / ${sheets.reduce((a, x) => a + Math.max(0, x.rules), 0)} 条规则`);
      }
    }

    if (!net.external.length) {
      ok('零外部网络请求', `${net.total} 个请求全部同源（${BASE_ORIGIN}）`);
    } else {
      bad('零外部网络请求', `${net.external.length} 个跨源请求：${net.external.slice(0, 5).join(' | ')}`);
    }

    /* ================================================================
     * 检查 10：字体自托管
     * ================================================================ */
    const fonts = await s.ev(FONTS_EXPR).catch(() => ({ faces: [], count: 0 }));
    report.fonts = fonts;
    const needFonts = ['Space Grotesk', 'Space Mono'];
    const fontFails = [];
    const fontDetail = [];
    for (const fam of needFonts) {
      const hit = (fonts.faces || []).find((f) => f.family.toLowerCase() === fam.toLowerCase());
      if (!hit) { fontFails.push(`${fam} 未在 document.fonts 中声明`); continue; }
      if (hit.status !== 'loaded') { fontFails.push(`${fam} 状态为 ${hit.status}（未加载）`); continue; }
      fontDetail.push(`${fam}=${hit.status}`);
    }
    if (net.fontCdn.length) {
      fontFails.push(`${net.fontCdn.length} 个字体 CDN 请求：${net.fontCdn.slice(0, 3).join(' | ')}`);
    }
    if (!fontFails.length) {
      ok('字体自托管', `${fontDetail.join('，')}；无任何字体 CDN 请求`);
    } else {
      bad('字体自托管', fontFails.join(' | '));
    }

    /* ================================================================
     * 检查 11：标题不得 nowrap
     * ================================================================ */
    const titles = await s.ev(NOWRAP_EXPR).catch(() => null);
    report.titles = titles;
    if (!titles) {
      warn('标题未使用 nowrap', '探针执行失败，无法校验');
    } else if (!titles.length) {
      warn('标题未使用 nowrap', `未找到 ${TITLE_SELECTORS.join('、')} 标题元素（设计系统迁移可能尚未完成）`);
    } else {
      const nw = titles.filter((t) => t.whiteSpace === 'nowrap');
      if (!nw.length) {
        ok('标题未使用 nowrap', `${titles.length} 个标题元素均未使用 nowrap`);
      } else {
        bad('标题未使用 nowrap', `${nw.length} 个标题为 nowrap：`
          + nw.slice(0, 5).map((t) => `${t.cls || t.tag}`).join(', '));
      }
    }

    /* ================================================================
     * 检查 12：中文排版
     * ================================================================ */
    const cjk = await s.ev(CJK_EXPR).catch(() => null);
    report.cjk = cjk;
    if (!cjk) {
      warn('中文排版', '探针执行失败，无法校验');
    } else if (!cjk.cjkCount) {
      warn('中文排版', '页面未取到含中文的文本元素（应用可能未正常挂载）');
    } else {
      const cjkFails = [];
      if (cjk.badSpacingCount) {
        cjkFails.push(`${cjk.badSpacingCount} 处字距未归零：`
          + cjk.badSpacing.slice(0, 4).map((x) => `${x.cls || x.tag}=${x.letterSpacing}`).join(', '));
      }
      if (cjk.badLineCount) {
        cjkFails.push(`${cjk.badLineCount} 处正文行高不足 1.85：`
          + cjk.badLine.slice(0, 4).map((x) => `${x.cls || x.tag}=${x.lineHeight}(${x.ratio})`).join(', '));
      }
      if (!cjkFails.length) {
        ok('中文排版', `${cjk.cjkCount} 个中文文本元素字距均为 0px，正文行高均 ≥1.85`);
      } else {
        bad('中文排版', cjkFails.join('；'));
      }
    }

    /* ================================================================
     * 控制台错误（附加信息）
     * ================================================================ */
    const consoleErrs = s.events.filter((e) => e.method === 'Log.entryAdded'
      && e.params.entry.level === 'error').map((e) => e.params.entry.text);
    report.consoleErrors = consoleErrs;

    try { s.ws.close(); } catch {}
    s = null;
  } catch (e) {
    report.errors.push(`运行异常：${e && e.message ? e.message : String(e)}`);
    console.error('❌ 运行异常：' + (e && e.message ? e.message : String(e)));
  } finally {
    try { chrome.kill('SIGKILL'); } catch {}
  }

  const passed = report.checks.filter((c) => c.status === 'pass').length;
  const total = report.checks.length;
  report.summary = {
    passed, total,
    failures: report.failures.length, warnings: report.warnings.length,
    errors: report.errors.length,
    verdict: report.failures.length === 0 && report.errors.length === 0 ? 'PASS' : 'FAIL',
  };

  fs.writeFileSync(REPORT_FILE, JSON.stringify(report, null, 2));

  console.log(`\n${report.summary.passed}/${total} 通过`
    + `（失败 ${report.failures.length} / 警告 ${report.warnings.length} / 异常 ${report.errors.length}）`);
  console.log(`报告：${REPORT_FILE}`);
  console.log(`截图：${SHOT_DIR}`);
  console.log('\n--- JSON ---');
  console.log(JSON.stringify({
    generatedAt: report.generatedAt,
    base: report.base,
    verdict: report.summary.verdict,
    passed: report.summary.passed,
    total: report.summary.total,
    failures: report.failures,
    warnings: report.warnings,
    errors: report.errors,
    checks: report.checks.map((c) => ({ name: c.name, status: c.status, detail: c.detail })),
  }, null, 2));

  return report.summary.verdict === 'PASS' ? 0 : 1;
}

let code = 1;
try {
  code = await main();
} catch (e) {
  console.error('❌ 验证器异常终止：' + (e && e.message ? e.message : String(e)));
  report.errors.push(`验证器异常：${e && e.message ? e.message : String(e)}`);
  try { fs.mkdirSync(EVIDENCE_DIR, { recursive: true }); } catch {}
  try { fs.writeFileSync(REPORT_FILE, JSON.stringify(report, null, 2)); } catch {}
  code = 1;
}
await sleep(200);
process.exit(code);
