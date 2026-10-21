/* ==========================================================================
 * 设计系统验收 · 共享断言层（driver-independent）
 * --------------------------------------------------------------------------
 * 本文件只包含「与浏览器驱动无关」的部分：目标定义、页面内探针表达式、
 * 令牌解析与归一化工具。两个驱动共用同一套断言，保证结果可比：
 *   scripts/verify-ds.mjs      —— 自带 headless Chrome + 原生 CDP（零第三方依赖，可在 CI 跑）
 *   scripts/verify-ds-ego.mjs  —— 走 Ego 浏览器（用户受管浏览器，遵循长期约定）
 * 断言逻辑本身只在此处定义一份，改动请同步两个驱动的回归结果。
 * ========================================================================== */

const ROUTES = [
  { name: 'hall', label: '大厅', hash: '#/' },
  { name: 'pulse', label: '回响', hash: '#/pulse' },
  { name: 'atrium', label: '中庭', hash: '#/atrium' },
  { name: 'halo', label: '光晕', hash: '#/halo' },
];

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

const FONT_CDN_RE = /(font|googleapis|gstatic|typekit|jsdelivr|unpkg|cdnjs|alicdn|cloudfront|bootstrapcdn)/i;

/* ------------------------------------------------------------------ *
 * 导出
 * ------------------------------------------------------------------ */

export {
  ROUTES, VIEWPORTS, COMPONENTS, CONTRAST_TARGETS,
  TITLE_SELECTORS, BODY_TEXT_SELECTORS, TOKEN_CANDIDATES,
  PAGE_STATE_EXPR, A11Y_EXPR, RM_EXPR, NOWRAP_EXPR, CJK_EXPR,
  CANVAS_PROBE_EXPR, JUDGE_PROBE_EXPR, LEGEND_PROBE_EXPR, FONTS_EXPR,
  extractBlock, parseDecls, normColorFns, normValue, normFontStack,
  resolveVars, canonColor,
  COLOR_VARS, CANVAS_VARS, SECTION_VARS, TOKEN_MAP, flattenTokens,
  FONT_CDN_RE,
};
