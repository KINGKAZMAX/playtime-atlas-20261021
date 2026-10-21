/**
 * Real-play screenshots — captured through ego-browser.
 *
 * The browser is the project's single entry point, so the same tool that a
 * human would use produces the evidence. Each shot records what was on
 * screen, and the 2D-fallback pass genuinely disables WebGL before the page
 * script runs, so the fallback is exercised rather than simulated.
 *
 * Usage: node scripts/run-ego.mjs scripts/ego/screenshots.mjs
 */

import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { ensureWindowVisible, restoreWindowState, shootWithRecovery } from './lib/window.mjs';

const ROOT = '/Users/mekzenx2/Documents/ChatGPT/Minimax测评/output/flash-showcase-20261021/19-architecture-atlas';
const DIST = path.join(ROOT, 'dist');
const OUT = path.join(ROOT, 'evidence', 'screenshots');
const PORT = 4186;

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

/**
 * Apply an exact viewport width.
 *
 * Measured behaviour of ego-browser's CDP bridge (2026-10-21):
 *   · `Emulation.setDeviceMetricsOverride` with `mobile: false` does NOT
 *     survive a navigation — the layout viewport silently reverts to the
 *     browser window width, so a "1440" pass would really be 1600.
 *   · with `mobile: true` the override applies and survives navigation, and
 *     the layout viewport is exactly the requested width.
 * `mobile: true` only adds touch/UA emulation. Layout is driven by the
 * viewport width, and this project's CSS contains no `hover` or `pointer`
 * media query, so the measurement is equivalent for the questions asked
 * (horizontal overflow, visible focus ring).
 *
 * The override is therefore applied before AND after the navigation, so that
 * a viewport which silently reverts can never make a measurement meaningless.
 */
async function setViewport(page, width, height, mobile = true) {
  const params = { width, height, deviceScaleFactor: 1, mobile: true };
  await page.cdp('Emulation.setDeviceMetricsOverride', params);
}


/**
 * Stub WebGL before any page script runs, so the app's own `hasWebGL()`
 * check fails and it takes the documented 2D fallback path.
 */
const NO_WEBGL = `
Object.defineProperty(window, 'WebGLRenderingContext', { get: () => undefined, configurable: true });
const originalGetContext = HTMLCanvasElement.prototype.getContext;
HTMLCanvasElement.prototype.getContext = function (type, ...rest) {
  if (typeof type === 'string' && type.toLowerCase().includes('webgl')) return null;
  return originalGetContext.call(this, type, ...rest);
};
`;

const task = await taskSpace('bic19-architecture-atlas');
const page = task.page('p1');
const originalWindowState = await ensureWindowVisible(page);

const SHOTS = [
  { name: '01-desktop-home-en', width: 1440, height: 900, url: '/', full: true, lang: 'en' },
  { name: '02-desktop-home-zh', width: 1440, height: 900, url: '/?lang=zh', full: false, lang: 'zh' },
  { name: '03-desktop-catalog-en', width: 1440, height: 900, url: '/#/catalog', full: false, lang: 'en' },
  { name: '04-desktop-case-en', width: 1440, height: 900, url: '/#/case/c01-nanchan-main-hall', full: false, lang: 'en' },
  { name: '05-desktop-case-zh', width: 1440, height: 900, url: '/?lang=zh#/case/c01-nanchan-main-hall', full: false, lang: 'zh' },
  { name: '06-desktop-lab-3d', width: 1440, height: 900, url: '/#/lab/dougong', full: false, lang: 'en', wait: 6000 },
  { name: '07-desktop-lab-forces', width: 1440, height: 900, url: '/#/lab/stone-arch', full: false, lang: 'en', wait: 6000, clickText: 'Force diagram' },
  { name: '08-desktop-glossary', width: 1440, height: 900, url: '/#/glossary', full: false, lang: 'en' },
  { name: '09-desktop-sources', width: 1440, height: 900, url: '/#/sources', full: false, lang: 'en' },
  { name: '10-mobile-home-en', width: 390, height: 844, url: '/', full: true, lang: 'en' },
  { name: '11-mobile-home-zh', width: 390, height: 844, url: '/?lang=zh', full: false, lang: 'zh' },
  { name: '12-mobile-catalog', width: 390, height: 844, url: '/#/catalog', full: false, lang: 'en' },
  { name: '13-mobile-lab-3d', width: 390, height: 844, url: '/#/lab/dougong', full: false, lang: 'en', wait: 6000 },
  { name: '14-mobile-lab-2d-fallback', width: 390, height: 844, url: '/#/lab/dougong', full: false, lang: 'en', wait: 4000, noWebGL: true },
  { name: '15-desktop-lab-2d-fallback', width: 1440, height: 900, url: '/#/lab/dougong', full: false, lang: 'en', wait: 4000, noWebGL: true },
  // An INTERMEDIATE assembly step: the end state alone would not prove that
  // the stepper actually steps, nor that the readout matches what is shown.
  { name: '16-desktop-lab-step2', width: 1440, height: 900, url: '/#/lab/dougong', full: false, lang: 'en', wait: 6000, clickText: '←', clickTextRepeat: 2 },
];

const manifest = [];
let inconsistent = 0;
let failedCaptures = 0;

// `Page.addScriptToEvaluateOnNewDocument` is sticky: it stays registered for
// the page until it is removed, so a WebGL stub injected for the 2D-fallback
// shot would silently disable WebGL for every LATER shot as well. Keep the
// identifier and remove it before the next navigation.
let injectedScriptId = null;

async function clearInjectedScript(page) {
  if (!injectedScriptId) return;
  try {
    await page.cdp('Page.removeScriptToEvaluateOnNewDocument', { identifier: injectedScriptId });
  } catch (e) {
    console.log(`  ! 未能卸载注入脚本：${String(e).slice(0, 80)}`);
  }
  injectedScriptId = null;
}

for (const shot of SHOTS) {
  await clearInjectedScript(page);
  const inject = await page.cdp('Page.addScriptToEvaluateOnNewDocument', {
    source: shot.noWebGL ? NO_WEBGL : '/* webgl enabled */',
  });
  injectedScriptId = inject?.identifier || inject?.result?.identifier || null;
  await setViewport(page, shot.width, shot.height, shot.width < 700);

  await page.goto(`http://127.0.0.1:${PORT}${shot.url}`);
  await setViewport(page, shot.width, shot.height, shot.width < 700);
  await page.waitForSelector('#main', { timeout: 30000 });
  await page.waitForTimeout(shot.wait || 1500);

  if (shot.click) {
    try {
      await page.click(shot.click, { timeout: 8000 });
      await page.waitForTimeout(1800);
    } catch (e) {
      console.log(`  ! 点击 "${shot.click}" 失败：${String(e).slice(0, 90)}`);
    }
  }

  if (shot.clickText) {
    // Several controls share the same label; pick the one that is a button
    // and click it in the page, so the shot is unambiguous.
    const clicked = await page.evaluate(`(() => {
      const btn = [...document.querySelectorAll('button')]
        .find((b) => (b.textContent || '').trim() === ${JSON.stringify(shot.clickText)});
      if (!btn) return false;
      btn.click();
      return true;
    })()`);
    await page.waitForTimeout(2200);
    if (!clicked) console.log(`  ! 未找到按钮 "${shot.clickText}"`);
    else console.log(`  → 已点击 "${shot.clickText}"`);
  }

  if (shot.clickTextRepeat) {
    // Click the same control N more times, so a shot can show an INTERMEDIATE
    // assembly step rather than only the fully-assembled end state.
    for (let i = 0; i < shot.clickTextRepeat; i += 1) {
      const ok = await page.evaluate(`(() => {
        const btn = [...document.querySelectorAll('button')]
          .find((b) => (b.textContent || '').trim() === ${JSON.stringify(shot.clickText)});
        if (!btn) return false;
        btn.click();
        return true;
      })()`);
      if (!ok) { console.log(`  ! 第 ${i + 1} 次点击未命中 "${shot.clickText}"`); break; }
      await page.waitForTimeout(700);
    }
  }

  const file = path.join(OUT, `${shot.name}.png`);
  let captured = true;
  try {
    await shootWithRecovery(page, { path: file, fullPage: Boolean(shot.full) });
  } catch (err) {
    // A full-page capture of a very long page can exceed the capture limits.
    // Fall back to the viewport rather than losing the shot entirely.
    captured = false;
    try {
      await shootWithRecovery(page, { path: file });
      captured = true;
      console.log(`  ! 整页捕获失败（${String(err).slice(0, 60)}），已改为视口截图`);
    } catch (err2) {
      console.log(`  ✗ 截图失败：${String(err2).slice(0, 90)}`);
      failedCaptures += 1;
      continue;
    }
  }

  const state = await page.evaluate(`(() => ({
    lang: document.documentElement.lang,
    title: document.title,
    h1: (document.querySelector('h1')?.textContent || '').trim().slice(0, 60),
    scrollW: document.documentElement.scrollWidth,
    clientW: document.documentElement.clientWidth,
    fallback: Boolean(document.querySelector('.lab-fallback:not([hidden])')),
    canvas: Boolean(document.querySelector('.lab-canvas-wrap canvas')),
    readout: (document.querySelector('.step-readout')?.textContent || '').trim(),
    external: performance.getEntriesByType('resource')
      .map(r => r.name)
      .filter(n => { try { return new URL(n, location.href).origin !== location.origin; } catch { return true; } }).length,
  }))()`);

  manifest.push({ ...shot, file: path.relative(ROOT, file), captured, state });

  // Self-check: a shot that did NOT ask for the 2D fallback must not BE in
  // the 2D fallback. A sticky injected script can silently turn every later
  // shot into a fallback shot, and the image alone would not show why.
  const wrongMode = (shot.noWebGL && !state.fallback) || (!shot.noWebGL && state.fallback);
  if (wrongMode) {
    inconsistent += 1;
    console.log(`  ! ${shot.name} 模式与预期不符（noWebGL=${Boolean(shot.noWebGL)} fallback=${state.fallback} canvas=${state.canvas}）`);
  }
  console.log(`${captured ? '✓' : '!'} ${shot.name.padEnd(30)} lang=${state.lang} ${state.scrollW}/${state.clientW} canvas=${state.canvas} fallback=${state.fallback} external=${state.external}${state.readout ? ` readout="${state.readout}"` : ''}`);
}

fs.writeFileSync(path.join(OUT, 'manifest.json'), JSON.stringify({ generatedAt: new Date().toISOString(), shots: manifest }, null, 2));

await task.finish({ keep: [] });
await new Promise((resolve) => server.close(resolve));
console.log(`\n${manifest.length} 张截图 → ${path.relative(ROOT, OUT)}`);
if (failedCaptures || inconsistent || manifest.length !== SHOTS.length) {
  console.log(`❌ 截图未完成：失败 ${failedCaptures} 张 · 模式不符 ${inconsistent} 张 · 实际 ${manifest.length}/${SHOTS.length} 张`);
  process.exit(1);
}
console.log(`✅ ${manifest.length} 张截图全部捕获，且 WebGL / 2D 降级模式与预期一致`);
