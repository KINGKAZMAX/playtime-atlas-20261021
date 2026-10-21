/**
 * Runtime QA — drives the built site in a real browser through ego-browser.
 *
 * The page carries a self-test harness (src/qa.js) that is loaded **only**
 * when the URL has `?qa=1`, so it never reaches the production bundle. This
 * script serves the production build, opens it, and reads the machine-readable
 * result block back out of the DOM.
 *
 * Three passes:
 *   1. desktop  1440×900   — the full interaction battery
 *   2. mobile    390×844   — the same battery at a phone width
 *   3. reduced-motion      — the battery with prefers-reduced-motion forced
 *
 * The browser is ego-browser, the project's single browser entry point.
 *
 * Usage: node scripts/run-ego.mjs scripts/ego/qa-runtime.mjs
 */

import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = '/Users/mekzenx2/Documents/ChatGPT/Minimax测评/output/flash-showcase-20261021/19-architecture-atlas';
const DIST = path.join(ROOT, 'dist');
const OUT = path.join(ROOT, 'evidence', 'qa');
const PORT = 4184;

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

/* ------------------------------------------------------------------ driver */

const PASSES = [
  { name: 'desktop-1440', width: 1440, height: 900, reducedMotion: false },
  { name: 'mobile-390', width: 390, height: 844, reducedMotion: false },
  { name: 'reduced-motion', width: 1440, height: 900, reducedMotion: true },
];

const task = await taskSpace('bic19-architecture-atlas');
const page = task.page('p1');

const reports = [];
let failed = 0;

for (const pass of PASSES) {
  await page.cdp('Emulation.setDeviceMetricsOverride', {
    width: pass.width, height: pass.height, deviceScaleFactor: 1, mobile: pass.width < 700,
  });
  await page.cdp('Emulation.setEmulatedMedia', {
    features: pass.reducedMotion
      ? [{ name: 'prefers-reduced-motion', value: 'reduce' }]
      : [{ name: 'prefers-reduced-motion', value: 'no-preference' }],
  });

  await page.goto(`http://127.0.0.1:${PORT}/?qa=1`);
  await page.waitForSelector('#qa-results', { timeout: 90000 });

  // the harness writes the result last; wait for it to finish
  await page.waitForFunction(
    () => {
      const el = document.getElementById('qa-results');
      return el && el.getAttribute('data-qa-status') !== 'running';
    },
    undefined,
    { timeout: 90000 },
  );

  const raw = await page.evaluate('document.getElementById("qa-results").textContent');
  fs.writeFileSync(path.join(OUT, `${pass.name}.json`), raw || '');

  let report = null;
  try { report = JSON.parse(raw); } catch { report = { parseError: String(raw).slice(0, 400) }; }

  const bad = (report.results || []).filter((r) => !r.pass);
  if (!report || report.parseError || report.error || bad.length) failed += 1;
  console.log(`${bad.length ? '✗' : '✓'} ${pass.name.padEnd(16)} ${report.passed ?? '?'}/${report.total ?? '?'}`);
  for (const b of bad) console.log(`    ✗ ${b.name} — ${b.detail}`);
  reports.push({ pass: pass.name, ok: !bad.length, report });
}

fs.writeFileSync(path.join(OUT, 'qa-runtime.json'), JSON.stringify({ generatedAt: new Date().toISOString(), reports }, null, 2));
console.log(`\n未通过的轮次：${failed} / ${PASSES.length}`);

await task.finish({ keep: [] });
await new Promise((resolve) => server.close(resolve));
