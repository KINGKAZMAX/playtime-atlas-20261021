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

const SHOTS = [
  { name: '01-desktop-home-en', width: 1440, height: 900, url: '/', full: true, lang: 'en' },
  { name: '02-desktop-home-zh', width: 1440, height: 900, url: '/?lang=zh', full: false, lang: 'zh' },
  { name: '03-desktop-catalog-en', width: 1440, height: 900, url: '/#/catalog', full: false, lang: 'en' },
  { name: '04-desktop-case-en', width: 1440, height: 900, url: '/#/case/c01-nanchan-main-hall', full: false, lang: 'en' },
  { name: '05-desktop-case-zh', width: 1440, height: 900, url: '/?lang=zh#/case/c01-nanchan-main-hall', full: false, lang: 'zh' },
  { name: '06-desktop-lab-3d', width: 1440, height: 900, url: '/#/lab/dougong', full: false, lang: 'en', wait: 6000 },
  { name: '07-desktop-lab-forces', width: 1440, height: 900, url: '/#/lab/stone-arch', full: false, lang: 'en', wait: 6000, click: 'text=Force diagram' },
  { name: '08-desktop-glossary', width: 1440, height: 900, url: '/#/glossary', full: false, lang: 'en' },
  { name: '09-desktop-sources', width: 1440, height: 900, url: '/#/sources', full: false, lang: 'en' },
  { name: '10-mobile-home-en', width: 390, height: 844, url: '/', full: true, lang: 'en' },
  { name: '11-mobile-home-zh', width: 390, height: 844, url: '/?lang=zh', full: false, lang: 'zh' },
  { name: '12-mobile-catalog', width: 390, height: 844, url: '/#/catalog', full: false, lang: 'en' },
  { name: '13-mobile-lab-3d', width: 390, height: 844, url: '/#/lab/dougong', full: false, lang: 'en', wait: 6000 },
  { name: '14-mobile-lab-2d-fallback', width: 390, height: 844, url: '/#/lab/dougong', full: false, lang: 'en', wait: 4000, noWebGL: true },
  { name: '15-desktop-lab-2d-fallback', width: 1440, height: 900, url: '/#/lab/dougong', full: false, lang: 'en', wait: 4000, noWebGL: true },
];

const manifest = [];

for (const shot of SHOTS) {
  await page.cdp('Page.addScriptToEvaluateOnNewDocument', {
    source: shot.noWebGL ? NO_WEBGL : '/* webgl enabled */',
  });
  await page.cdp('Emulation.setDeviceMetricsOverride', {
    width: shot.width, height: shot.height, deviceScaleFactor: 1, mobile: shot.width < 700,
  });

  await page.goto(`http://127.0.0.1:${PORT}${shot.url}`);
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

  const file = path.join(OUT, `${shot.name}.png`);
  await page.screenshot({ path: file, fullPage: Boolean(shot.full) });

  const state = await page.evaluate(`(() => ({
    lang: document.documentElement.lang,
    title: document.title,
    h1: (document.querySelector('h1')?.textContent || '').trim().slice(0, 60),
    scrollW: document.documentElement.scrollWidth,
    clientW: document.documentElement.clientWidth,
    fallback: Boolean(document.querySelector('.lab-fallback:not([hidden])')),
    canvas: Boolean(document.querySelector('.lab-canvas-wrap canvas')),
    external: performance.getEntriesByType('resource')
      .map(r => r.name)
      .filter(n => { try { return new URL(n, location.href).origin !== location.origin; } catch { return true; } }).length,
  }))()`);

  manifest.push({ ...shot, file: path.relative(ROOT, file), state });
  console.log(`✓ ${shot.name.padEnd(30)} lang=${state.lang} scrollW=${state.scrollW}/${state.clientW} canvas=${state.canvas} fallback=${state.fallback} external=${state.external}`);
}

fs.writeFileSync(path.join(OUT, 'manifest.json'), JSON.stringify({ generatedAt: new Date().toISOString(), shots: manifest }, null, 2));

await task.finish({ keep: [] });
await new Promise((resolve) => server.close(resolve));
console.log(`\n${manifest.length} 张截图 → ${path.relative(ROOT, OUT)}`);
