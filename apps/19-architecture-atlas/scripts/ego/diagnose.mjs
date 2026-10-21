/**
 * Layout & focus diagnostics — runs INSIDE the ego-browser Node runtime.
 *
 * Two questions, both of which can only be answered by a real layout engine:
 *
 *   1. OVERFLOW  — at a phone width, which element is wider than the viewport?
 *      The page-level horizontal scrollbar is a symptom; the cause is a
 *      specific element, and it has to be found and fixed at the source.
 *      Masking it with `overflow-x: hidden` is NOT a fix: the content stays
 *      unreachable, it just stops being visible.
 *
 *   2. FOCUS     — does every focusable element actually show a focus ring?
 *      The check focuses each element in turn and reads the computed
 *      `outline` and `box-shadow`. A UA default ring counts as visible; an
 *      `outline: none` with no replacement does not.
 *
 * This script drives ego-browser (the project's single browser entry point).
 * It is invoked through scripts/run-ego.mjs, which turns the JSON report
 * this file writes into a process exit code.
 */

import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = '/Users/mekzenx2/Documents/ChatGPT/Minimax测评/output/flash-showcase-20261021/19-architecture-atlas';
const DIST = path.join(ROOT, 'dist');
const OUT = path.join(ROOT, 'evidence', 'layout');
const PORT = 4187;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2',
  '.png': 'image/png',
};

fs.mkdirSync(OUT, { recursive: true });

/* ------------------------------------------------------------ static server */

const server = http.createServer((req, res) => {
  const raw = (req.url || '/').replace(/^\/+/, '/');
  const url = new URL(raw, `http://127.0.0.1:${PORT}`);
  let file = path.join(DIST, decodeURIComponent(url.pathname));
  if (!file.startsWith(DIST)) { res.writeHead(403).end(); return; }
  if (!fs.existsSync(file) || fs.statSync(file).isDirectory()) file = path.join(DIST, 'index.html');
  res.writeHead(200, { 'content-type': MIME[path.extname(file)] || 'application/octet-stream' });
  res.end(fs.readFileSync(file));
});
await new Promise((resolve) => server.listen(PORT, '127.0.0.1', resolve));

/* ------------------------------------------------------------------ probe */

/**
 * Runs inside the Page. Returns everything the two questions need.
 */
const PROBE = `(() => {
  const doc = document.documentElement;
  const vw = doc.clientWidth;

  const offenders = [];
  for (const el of document.querySelectorAll('*')) {
    const r = el.getBoundingClientRect();
    if (r.width === 0 && r.height === 0) continue;
    const overRight = (r.right + window.scrollX) - vw;
    const overLeft = -(r.left + window.scrollX);
    if (overRight <= 1 && overLeft <= 1) continue;
    let nested = false;
    for (const other of offenders) { if (other.el && other.el.contains(el)) { nested = true; break; } }
    if (nested) continue;
    const cs = getComputedStyle(el);
    const cls = (el.className && el.className.baseVal !== undefined ? el.className.baseVal : el.className || '').toString();
    // An element wider than the viewport is only a PAGE-level overflow when
    // no ancestor scrolls or clips it. The era axis is meant to scroll
    // sideways inside its own container — that is not a page scrollbar.
    let contained = false;
    for (let p = el.parentElement; p; p = p.parentElement) {
      const pcs = getComputedStyle(p);
      if (/auto|scroll|hidden|clip/.test(pcs.overflowX)) { contained = true; break; }
    }
    if (contained) continue;
    offenders.push({
      el, tag: el.tagName.toLowerCase(), cls: cls.slice(0, 90), id: el.id || '',
      overRight: Math.round(overRight), overLeft: Math.round(overLeft),
      width: Math.round(r.width), position: cs.position, minWidth: cs.minWidth, overflowX: cs.overflowX,
    });
  }
  offenders.sort((a, b) => (b.overRight + b.overLeft) - (a.overRight + a.overLeft));

  const FOCUSABLE = 'a[href], button, input, select, textarea, summary, [tabindex]:not([tabindex="-1"])';
  const focusableCount = Array.from(document.querySelectorAll(FOCUSABLE)).filter((el) => {
    const cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden') return false;
    const r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0;
  }).length;

  const rootStyle = getComputedStyle(doc);
  return {
    viewport: { w: window.innerWidth, h: window.innerHeight },
    doc: {
      clientWidth: doc.clientWidth,
      scrollWidth: doc.scrollWidth,
      bodyScrollWidth: document.body.scrollWidth,
      overflow: doc.scrollWidth - doc.clientWidth,
    },
    tokens: {
      dsFocusRing: rootStyle.getPropertyValue('--ds-focus-ring').trim(),
      dsAccent: rootStyle.getPropertyValue('--ds-accent').trim(),
      dsBg: rootStyle.getPropertyValue('--ds-bg').trim(),
      dsSpace4: rootStyle.getPropertyValue('--ds-space-4').trim(),
    },
    offenders: offenders.slice(0, 14).map((o) => ({
      tag: o.tag, cls: o.cls, id: o.id, overRight: o.overRight, overLeft: o.overLeft,
      width: o.width, position: o.position, minWidth: o.minWidth, overflowX: o.overflowX,
    })),
    focusableCount,
  };
})()`;

/**
 * Reads the focused element's computed outline and box-shadow.
 * `:focus-visible` only matches for keyboard-driven focus, so this is called
 * after a real Tab press rather than after a programmatic .focus().
 */
const READ_FOCUS = `(() => {
  const el = document.activeElement;
  if (!el || el === document.body) return null;
  const cs = getComputedStyle(el);
  return {
    tag: el.tagName.toLowerCase(),
    cls: (el.className && el.className.baseVal !== undefined ? el.className.baseVal : el.className || '').toString().slice(0, 80),
    text: (el.textContent || '').trim().slice(0, 40),
    outlineStyle: cs.outlineStyle,
    outlineWidth: cs.outlineWidth,
    outlineColor: cs.outlineColor,
    outline: cs.outline,
    boxShadow: cs.boxShadow,
    matchesFocusVisible: el.matches(':focus-visible'),
  };
})()`;

/* ------------------------------------------------------------------ driver */

const ROUTES = ['/', '/#/labs', '/#/catalog', '/#/glossary', '/#/quiz', '/#/case/c01-nanchan-main-hall'];
const TAB_LIMIT = 40;
const VIEWPORTS = [
  { name: 'desktop-1440', width: 1440, height: 900 },
  { name: 'mobile-390', width: 390, height: 844 },
];

const task = await taskSpace('bic19-architecture-atlas');
const page = task.page('p1');

const report = { generatedAt: new Date().toISOString(), viewports: [] };
let problems = 0;

for (const vp of VIEWPORTS) {
  console.log(`▶ ${vp.name}`);
  const vpEntry = { viewport: vp, routes: [] };

  for (const route of ROUTES) {
    await page.cdp('Emulation.setDeviceMetricsOverride', {
      width: vp.width, height: vp.height, deviceScaleFactor: 1, mobile: vp.width < 700,
    });
    await page.goto(`http://127.0.0.1:${PORT}/${route}`);
    await page.waitForSelector('#main', { timeout: 20000 });
    await page.waitForTimeout(700);

    const probe = await page.evaluate(PROBE);

    // Keyboard traversal: press Tab and read the focused element's ring.
    // A programmatic .focus() would not exercise :focus-visible.
    await page.evaluate('(() => { if (document.activeElement && document.activeElement !== document.body) document.activeElement.blur(); })()');
    const noRing = [];
    const seen = new Set();
    let tabbed = 0;
    for (let i = 0; i < TAB_LIMIT; i += 1) {
      await page.keyboard.press('Tab');
      const f = await page.evaluate(READ_FOCUS);
      if (!f) continue;
      tabbed += 1;
      const key = `${f.tag}|${f.cls}|${f.text}`;
      if (seen.has(key)) continue;
      seen.add(key);
      const hasOutline = f.outlineStyle !== 'none' && (parseFloat(f.outlineWidth) || 0) > 0;
      const hasShadow = Boolean(f.boxShadow && f.boxShadow !== 'none');
      if (!hasOutline && !hasShadow) noRing.push(f);
    }

    vpEntry.routes.push({ route, ...probe, tabbed, noRing });

    const over = probe.doc.overflow;
    const ringless = noRing.length;
    if (over > 0 || ringless > 0) problems += 1;

    console.log(`  ${over > 0 || ringless > 0 ? '✗' : '✓'} ${route.padEnd(34)} scrollW=${probe.doc.scrollWidth} clientW=${probe.doc.clientWidth} (+${over})  无焦点环=${ringless}/${tabbed}`);
    for (const o of probe.offenders.slice(0, 6)) {
      console.log(`      ↳ <${o.tag} class="${o.cls}"> 超出 ${o.overRight}px  width=${o.width} min-width=${o.minWidth} overflow-x=${o.overflowX}`);
    }
    for (const o of noRing.slice(0, 4)) {
      console.log(`      ↳ 无焦点环: <${o.tag} class="${o.cls}"> "${o.text}" outline=${o.outline} focusVisible=${o.matchesFocusVisible}`);
    }
    if (probe.tokens.dsFocusRing === '') {
      console.log('      ⚠ --ds-focus-ring 未定义 —— 令牌层可能未生效');
    }
  }
  report.viewports.push(vpEntry);
}

fs.writeFileSync(path.join(OUT, 'layout-diagnostics.json'), JSON.stringify(report, null, 2));
console.log(`\n问题数：${problems}`);

await task.finish({ keep: [] });
await new Promise((resolve) => server.close(resolve));
