/**
 * Sub-path deployment verification.
 *
 * Serves the production build under the exact sub-path the batch publishes
 * to (`/playtime-atlas-20261021/works/02-abyss-salvager/`), then drives a
 * real headless browser against it to prove:
 *
 *   1. the page boots from the sub-path with no console errors and no 404s,
 *   2. the shipped GLB is reachable at a base-relative URL (200 + valid header),
 *   3. the retired legacy-alias path is GONE (404) — exactly one model file ships,
 *   4. the model index (assets.manifest.json) resolves,
 *   5. the shipped model can be loaded INTO the scene and stays interactive,
 *   6. the download link points at the base-relative model URL.
 *
 * The static server is started on a free port and closed as soon as the run
 * finishes — nothing is left listening.
 *
 *   node scripts/verify-dist.mjs [mount]
 */

import { spawn } from 'node:child_process';
import http from 'node:http';
import net from 'node:net';
import fs from 'node:fs';
import fsp from 'node:fs/promises';
import { mkdtemp, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');
const DIST = path.join(ROOT, 'dist');
const MOUNT = process.argv[2] || '/playtime-atlas-20261021/works/02-abyss-salvager/';
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.glb': 'model/gltf-binary',
  '.map': 'application/json; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.md': 'text/markdown; charset=utf-8',
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * Ask the OS for a currently free TCP port for Chrome's debugging channel.
 * A hard-coded port can be taken by another task's leftover headless Chrome,
 * which shows up as a bogus "DevTools endpoint never came up" failure.
 */
async function freePort() {
  return new Promise((resolve, reject) => {
    const srv = net.createServer();
    srv.unref();
    srv.on('error', reject);
    srv.listen(0, '127.0.0.1', () => {
      const { port } = srv.address();
      srv.close(() => resolve(port));
    });
  });
}

/** Minimal static server that mounts the build under a sub-path. */
function startStaticServer({ root, mount }) {
  const absRoot = path.resolve(root);
  const prefix = mount.endsWith('/') ? mount : `${mount}/`;
  const hits = [];

  const server = http.createServer(async (req, res) => {
    const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    hits.push(pathname);

    if (!pathname.startsWith(prefix)) {
      res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
      return void res.end('404 (outside mount)');
    }
    let rel = pathname.slice(prefix.length);
    if (rel === '' || rel.endsWith('/')) rel += 'index.html';
    const target = path.resolve(absRoot, `.${path.posix.sep}${rel}`);
    if (!target.startsWith(absRoot + path.sep)) {
      res.writeHead(403, { 'content-type': 'text/plain; charset=utf-8' });
      return void res.end('403');
    }
    try {
      const st = await fsp.stat(target);
      const file = st.isDirectory() ? path.join(target, 'index.html') : target;
      await fsp.access(file);
      const size = (await fsp.stat(file)).size;
      res.writeHead(200, {
        'content-type': MIME[path.extname(file).toLowerCase()] || 'application/octet-stream',
        // 显式给出长度：chunked 响应在负载高时容易被客户端中途中止
        'content-length': size,
        'cache-control': 'no-store',
      });
      return void fs.createReadStream(file).pipe(res);
    } catch {
      res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
      void res.end(`404 ${rel}`);
    }
  });

  return new Promise((resolve, reject) => {
    server.on('error', reject);
    server.listen(0, '127.0.0.1', () => {
      const port = server.address().port;
      resolve({
        url: `http://127.0.0.1:${port}${prefix}`,
        hits,
        close: () => new Promise((r) => server.close(() => r())),
      });
    });
  });
}

async function main() {
  if (!fs.existsSync(path.join(DIST, 'index.html'))) {
    console.error('[verify-dist] dist/index.html 不存在，请先执行 npm run build');
    process.exit(2);
  }

  const server = await startStaticServer({ root: DIST, mount: MOUNT });
  console.log(`[verify-dist] serving dist at ${server.url}`);

  // A unique profile per run — a fixed one makes Chrome attach to a leftover
  // instance that still holds the debugging port.
  const profileDir = await mkdtemp(path.join(os.tmpdir(), 'abyss-verify-dist-'));
  // 动态端口：写死端口会被同机其它任务的残留 headless Chrome 抢占
  const PORT = await freePort();

  const chrome = spawn(
    CHROME,
    [
      '--headless=new',
      `--remote-debugging-port=${PORT}`,
      `--user-data-dir=${profileDir}`,
      '--window-size=1440,900',
      '--hide-scrollbars',
      '--no-first-run',
      '--ignore-gpu-blocklist',
      '--enable-gpu-rasterization',
      '--use-angle=metal',
      '--enable-unsafe-swiftshader',
      '--disable-dev-shm-usage',
      'about:blank',
    ],
    { stdio: ['ignore', 'ignore', 'pipe'] }
  );

  let chromeErr = '';
  chrome.stderr.on('data', (d) => {
    chromeErr += d.toString();
  });

  let target = null;
  // Chrome may bind the debugging port on IPv4 or fall back to IPv6 when the
  // IPv4 socket is taken — probing only 127.0.0.1 then hangs forever.
  const ENDPOINTS = [`http://127.0.0.1:${PORT}/json/list`, `http://[::1]:${PORT}/json/list`];
  // 机器并发负载高时 Chrome 冷启动可能要十几秒，窗口给到 40s 免得假失败
  for (let i = 0; i < 160; i++) {
    await sleep(250);
    for (const endpoint of ENDPOINTS) {
      try {
        const res = await fetch(endpoint);
        const list = await res.json();
        target = list.find((t) => t.type === 'page');
        if (target) break;
      } catch {
        /* not up yet */
      }
    }
    if (target) break;
  }
  if (!target) {
    console.error('[verify-dist] DevTools endpoint never came up.\n', chromeErr.slice(-800));
    chrome.kill();
    await server.close();
    await rm(profileDir, { recursive: true, force: true }).catch(() => {});
    process.exit(3);
  }

  const ws = new WebSocket(target.webSocketDebuggerUrl);
  let msgId = 0;
  const pending = new Map();
  const events = [];
  await new Promise((res, rej) => {
    ws.addEventListener('open', res);
    ws.addEventListener('error', rej);
  });
  ws.addEventListener('message', (ev) => {
    const msg = JSON.parse(ev.data);
    if (msg.id && pending.has(msg.id)) {
      const { resolve, reject } = pending.get(msg.id);
      pending.delete(msg.id);
      if (msg.error) reject(new Error(JSON.stringify(msg.error)));
      else resolve(msg.result);
    } else if (msg.method) events.push(msg);
  });
  function send(method, params = {}, timeoutMs = 120000) {
    const id = ++msgId;
    return new Promise((resolve, reject) => {
      pending.set(id, { resolve, reject });
      ws.send(JSON.stringify({ id, method, params }));
      setTimeout(() => {
        if (pending.has(id)) {
          pending.delete(id);
          reject(new Error(`timeout: ${method}`));
        }
      }, timeoutMs);
    });
  }
  async function evaluate(expression) {
    const res = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
    if (res.exceptionDetails) {
      throw new Error(res.exceptionDetails.exception?.description || 'eval error');
    }
    return res.result.value;
  }

  const checks = [];
  const record = (name, pass, detail) => {
    checks.push({ name, pass, detail });
    console.log(`${pass ? 'PASS' : 'FAIL'}  ${name}  ${detail ?? ''}`);
  };

  await send('Page.enable');
  await send('Runtime.enable');
  await send('Log.enable');
  await send('Network.enable');
  await send('Emulation.setDeviceMetricsOverride', {
    width: 1440,
    height: 900,
    deviceScaleFactor: 1,
    mobile: false,
  });

  await send('Page.navigate', { url: server.url });
  await sleep(7000);

  // --- 1. boot -------------------------------------------------------------
  const boot = JSON.parse(
    await evaluate(
      'JSON.stringify({ api: !!window.__abyss, title: document.title, len: window.__abyss ? Math.round(window.__abyss.machine.lengthMetres) : null, segs: window.__abyss ? window.__abyss.machine.segments.length : null })'
    )
  );
  record('subpath-boot', boot.api && boot.len === 760 && boot.segs === 18, JSON.stringify(boot));

  // --- 2. shipped GLB reachable at the sub-path ----------------------------
  // The byte-level check is done from Node, NOT from inside the page. Issuing
  // a second 9 MB fetch for the very same URL that the app is about to load
  // makes Chrome cancel the superseded duplicate, which shows up as a
  // "net::ERR_ABORTED / canceled" loading failure and pollutes the page's own
  // network log with a failure the app never causes.
  const glbUrl = new URL('models/abyss-salvager-ac-vii.glb', server.url).href;
  const glb = { url: glbUrl };
  try {
    const res = await fetch(glbUrl);
    const buf = Buffer.from(await res.arrayBuffer());
    glb.ok = res.ok;
    glb.status = res.status;
    glb.size = buf.length;
    glb.magic = buf.toString('utf8', 0, 4);
    glb.version = buf.readUInt32LE(4);
    glb.declared = buf.readUInt32LE(8);
  } catch (e) {
    glb.ok = false;
    glb.reason = e.message;
  }
  record(
    'shipped-glb-200',
    glb.ok && glb.status === 200 && glb.magic === 'glTF' && glb.version === 2 && glb.declared === glb.size,
    JSON.stringify(glb)
  );

  // --- 3. the retired legacy-alias path must be GONE (single source of truth) --
  // The body is consumed on purpose: leaving an unread response stream makes
  // Chrome abort it and report a spurious "net::ERR_ABORTED" loading failure.
  const alias = JSON.parse(
    await evaluate(`(async () => {
      const res = await fetch('./models/mech-sandworm-1312m.glb').catch(() => null);
      if (!res) return JSON.stringify({ status: 0, reason: 'network error' });
      await res.text().catch(() => {});
      return JSON.stringify({ status: res.status });
    })()`)
  );
  record('legacy-alias-absent', alias.status === 404, JSON.stringify(alias));

  // --- 3b. the model index resolves ------------------------------------------
  const index = JSON.parse(
    await evaluate(`(async () => {
      const res = await fetch('./models/assets.manifest.json').catch(() => null);
      if (!res) return JSON.stringify({ ok: false });
      const body = await res.json().catch(() => null);
      return JSON.stringify({ status: res.status, files: body ? (body.models || []).map((m) => m.file) : null });
    })()`)
  );
  record(
    'model-index-200',
    index.status === 200 && Array.isArray(index.files) && index.files.length === 1,
    JSON.stringify(index)
  );

  // --- 3c. exactly one .glb ships in the build ------------------------------
  const modelDir = path.join(DIST, 'models');
  const glbFiles = fs.existsSync(modelDir)
    ? fs.readdirSync(modelDir).filter((f) => f.toLowerCase().endsWith('.glb'))
    : [];
  record(
    'single-glb-in-build',
    glbFiles.length === 1 && glbFiles[0] === 'abyss-salvager-ac-vii.glb',
    glbFiles.join(', ') || 'none'
  );

  // --- 4. the download link is base-relative --------------------------------
  const link = JSON.parse(
    await evaluate(
      'JSON.stringify({ href: document.getElementById("btn-model-download")?.getAttribute("href"), resolved: document.getElementById("btn-model-download")?.href })'
    )
  );
  record(
    'download-link-base-relative',
    !!link.href && link.href.startsWith('./') && link.resolved.includes('/models/abyss-salvager-ac-vii.glb'),
    JSON.stringify(link)
  );

  // --- 5. load the shipped model into the scene and keep it interactive ----
  const loaded = JSON.parse(
    await evaluate(`(async () => {
      const btn = document.getElementById('btn-model-load');
      btn.click();
      for (let i = 0; i < 600; i++) {
        if (window.__abyss.modelSource === 'shipped' && window.__abyss.shippedRoot) break;
        await new Promise((r) => setTimeout(r, 100));
      }
      const root = window.__abyss.shippedRoot;
      let meshes = 0, tris = 0;
      if (root) root.traverse((o) => {
        if (!o.isMesh) return;
        meshes++;
        const g = o.geometry;
        tris += (g.index ? g.index.count : g.attributes.position.count) / 3;
      });
      return JSON.stringify({
        source: window.__abyss.modelSource,
        meshes, tris: Math.round(tris),
        proceduralHidden: window.__abyss.machine.root.visible === false,
        toast: document.getElementById('toast')?.textContent?.trim(),
      });
    })()`)
  );
  record(
    'shipped-model-loads-into-scene',
    loaded.source === 'shipped' && loaded.meshes > 100 && loaded.tris > 20000 && loaded.proceduralHidden,
    JSON.stringify(loaded)
  );

  // orbit still works with the loaded model in the scene
  const before = await evaluate(
    'JSON.stringify(window.__abyss.stage.camera.position.toArray().map((v) => +v.toFixed(3)))'
  );
  await send('Input.dispatchMouseEvent', { type: 'mousePressed', x: 720, y: 450, button: 'left', clickCount: 1, buttons: 1 });
  for (let i = 1; i <= 10; i++) {
    await send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: 720 + i * 16, y: 450 + i * 3, button: 'left', buttons: 1 });
    await sleep(30);
  }
  await send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: 880, y: 480, button: 'left', buttons: 0 });
  await sleep(800);
  const after = await evaluate(
    'JSON.stringify(window.__abyss.stage.camera.position.toArray().map((v) => +v.toFixed(3)))'
  );
  const b = JSON.parse(before);
  const a = JSON.parse(after);
  const moved = Math.abs(a[0] - b[0]) > 0.05 || Math.abs(a[1] - b[1]) > 0.05 || Math.abs(a[2] - b[2]) > 0.05;
  record('shipped-model-interactive', moved, `${JSON.stringify(b)} -> ${JSON.stringify(a)}`);

  // --- 6. no 404s and no console errors -------------------------------------
  // The legacy-alias probe above is *expected* to 404; everything else must not.
  // The URL-level 404 check below is authoritative for missing resources — a
  // real missing file shows up as a 404 response AND as a console error, and the
  // URL check names the offending URL while the console text does not.
  const DELIBERATE_404 = 'mech-sandworm-1312m.glb';
  const EXPECTED_404_TEXT = 'the server responded with a status of 404';
  const notFound = events
    .filter(
      (e) =>
        e.method === 'Network.responseReceived' &&
        e.params.response.status === 404 &&
        !e.params.response.url.includes(DELIBERATE_404)
    )
    .map((e) => e.params.response.url);
  // requestId → url. Chrome can reuse a requestId for a later request, so the
  // correlation must use the MOST RECENT request for that id, not the first.
  const urlByRequestId = new Map();
  // requestId → HTTP status, for requests that already produced a response.
  const statusByRequestId = new Map();
  for (const e of events) {
    if (e.method === 'Network.requestWillBeSent') {
      urlByRequestId.set(e.params.requestId, e.params.request?.url || '(unknown url)');
    } else if (e.method === 'Network.responseReceived') {
      statusByRequestId.set(e.params.requestId, e.params.response.status);
    }
  }
  const loadFailures = events
    .filter((e) => e.method === 'Network.loadingFailed')
    .map((e) => {
      const url = urlByRequestId.get(e.params.requestId) || '(unknown url)';
      const status = statusByRequestId.get(e.params.requestId);
      return {
        errorText: e.params.errorText,
        url,
        requestId: e.params.requestId,
        status,
        type: e.params.type,
        canceled: e.params.canceled,
        blockedReason: e.params.blockedReason,
        deliberate: url.includes(DELIBERATE_404),
      };
    });
  // A request that already delivered a successful response is NOT a network
  // failure. Chrome emits a trailing "net::ERR_ABORTED / canceled" for a fetch
  // whose body was fully read and then released (the model itself parses fine
  // and lands in the scene), so those are counted separately instead of being
  // reported as deployment errors.
  const completedThenCanceled = loadFailures.filter(
    (f) => f.status && f.status < 400 && !f.deliberate
  );
  const failed = loadFailures
    .filter((f) => !(f.status && f.status < 400))
    .filter((f) => !f.deliberate)
    .map(
      (f) =>
        `${f.errorText} ${f.url} [id=${f.requestId} status=${f.status} type=${f.type} canceled=${f.canceled} blocked=${f.blockedReason}]`
    );
  const allConsoleErrors = events
    .filter((e) => e.method === 'Log.entryAdded' && e.params.entry.level === 'error')
    .map((e) => e.params.entry);
  // A console error that is merely the browser echoing the deliberate 404.
  const expectedNoise = allConsoleErrors.filter(
    (e) =>
      (e.url || '').includes(DELIBERATE_404) ||
      (e.text || '').includes(EXPECTED_404_TEXT)
  );
  const consoleErrors = allConsoleErrors
    .filter((e) => !expectedNoise.includes(e))
    .map((e) => e.text);
  const exceptions = events
    .filter((e) => e.method === 'Runtime.exceptionThrown')
    .map((e) => e.params.exceptionDetails?.exception?.description || 'exception');

  record('no-404-responses', notFound.length === 0, notFound.join(', ') || 'none');
  record('no-network-failures', failed.length === 0, failed.join(', ') || 'none');
  if (completedThenCanceled.length) {
    console.log(
      `[verify-dist] note: ${completedThenCanceled.length} 条 ERR_ABORTED 属「响应已 200 完成后」的 Chrome 回执，不计为失败`
    );
  }
  record(
    'no-console-errors',
    consoleErrors.length === 0,
    consoleErrors.join(' | ') || `none (${expectedNoise.length} 条为旧名 404 探测的预期回声)`
  );
  record('no-exceptions', exceptions.length === 0, exceptions.join(' | ') || 'none');

  // --- 7. the page itself fetched the model at the base-relative URL -------
  // Proof that the *browser* resolves the base-relative model URL under the
  // sub-path — this is the app's own request, not a harness probe.
  const browserGlb = events
    .filter(
      (e) =>
        e.method === 'Network.responseReceived' &&
        e.params.response.url.includes('models/abyss-salvager-ac-vii.glb')
    )
    .map((e) => e.params.response.status);
  record(
    'browser-fetched-glb-200',
    browserGlb.length > 0 && browserGlb.every((s) => s === 200),
    browserGlb.join(',') || 'none'
  );

  // --- report --------------------------------------------------------------
  const shot = await send('Page.captureScreenshot', { format: 'png' });
  const shotPath = path.join(ROOT, 'screenshots', '16-subpath-shipped-model.png');
  await fsp.mkdir(path.dirname(shotPath), { recursive: true });
  await fsp.writeFile(shotPath, Buffer.from(shot.data, 'base64'));
  console.log(`[verify-dist] wrote ${shotPath}`);

  const failedChecks = checks.filter((c) => !c.pass);
  console.log(`\n[verify-dist] ${checks.length - failedChecks.length}/${checks.length} passed`);

  ws.close();
  chrome.kill();
  await sleep(300);
  await server.close();
  await rm(profileDir, { recursive: true, force: true }).catch(() => {});
  console.log('[verify-dist] static server closed');

  process.exit(failedChecks.length ? 1 : 0);
}

main().catch(async (e) => {
  console.error('[verify-dist] failed:', e);
  process.exit(1);
});
