/**
 * 一次性诊断：跟踪随包 GLB 的全部网络事件，定位是谁取消了 fetch。
 *   node scripts/diag-glb-network.mjs
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
const MOUNT = '/playtime-atlas-20261021/works/02-abyss-salvager/';
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** 向操作系统要一个当前空闲的 TCP 端口（写死端口会被同机其它任务的残留 Chrome 抢占）。 */
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

const MIME = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8',
  '.glb': 'model/gltf-binary', '.png': 'image/png', '.svg': 'image/svg+xml',
};

function startServer({ root, mount }) {
  const absRoot = path.resolve(root);
  const prefix = mount.endsWith('/') ? mount : `${mount}/`;
  const server = http.createServer(async (req, res) => {
    const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    let rel = pathname.slice(prefix.length);
    if (rel === '' || rel.endsWith('/')) rel += 'index.html';
    const target = path.resolve(absRoot, `.${path.posix.sep}${rel}`);
    if (!target.startsWith(absRoot + path.sep) || !fs.existsSync(target)) {
      res.writeHead(404); return void res.end('404');
    }
    const size = (await fsp.stat(target)).size;
    res.writeHead(200, {
      'content-type': MIME[path.extname(target).toLowerCase()] || 'application/octet-stream',
      'content-length': size, 'cache-control': 'no-store',
    });
    fs.createReadStream(target).pipe(res);
  });
  return new Promise((resolve) => server.listen(0, '127.0.0.1', () =>
    resolve({ url: `http://127.0.0.1:${server.address().port}${prefix}`, close: () => new Promise((r) => server.close(() => r())) })));
}

const profileDir = await mkdtemp(path.join(os.tmpdir(), 'abyss-diag-'));
const server = await startServer({ root: DIST, mount: MOUNT });
console.log('serving', server.url);

const PORT = await freePort();

const chrome = spawn(CHROME, [
  '--headless=new', `--remote-debugging-port=${PORT}`, `--user-data-dir=${profileDir}`,
  '--window-size=1440,900', '--hide-scrollbars', '--no-first-run',
  '--ignore-gpu-blocklist', '--enable-gpu-rasterization', '--use-angle=metal',
  '--enable-unsafe-swiftshader', '--disable-dev-shm-usage', 'about:blank',
], { stdio: ['ignore', 'ignore', 'pipe'] });
let chromeErr = '';
chrome.stderr.on('data', (d) => { chromeErr += d.toString(); });

let target = null;
for (let i = 0; i < 160; i++) {
  await sleep(250);
  for (const ep of [`http://127.0.0.1:${PORT}/json/list`, `http://[::1]:${PORT}/json/list`]) {
    try {
      const list = await (await fetch(ep)).json();
      target = list.find((t) => t.type === 'page');
      if (target) break;
    } catch { /* wait */ }
  }
  if (target) break;
}
if (!target) { console.error('devtools down\n', chromeErr.slice(-600)); chrome.kill(); await server.close(); process.exit(3); }

const ws = new WebSocket(target.webSocketDebuggerUrl);
let msgId = 0; const pending = new Map(); const events = [];
await new Promise((res, rej) => { ws.addEventListener('open', res); ws.addEventListener('error', rej); });
ws.addEventListener('message', (ev) => {
  const m = JSON.parse(ev.data);
  if (m.id && pending.has(m.id)) { const p = pending.get(m.id); pending.delete(m.id); m.error ? p.reject(new Error(JSON.stringify(m.error))) : p.resolve(m.result); }
  else if (m.method) events.push(m);
});
const send = (method, params = {}) => new Promise((resolve, reject) => {
  const id = ++msgId; pending.set(id, { resolve, reject });
  ws.send(JSON.stringify({ id, method, params }));
  setTimeout(() => { if (pending.has(id)) { pending.delete(id); reject(new Error('timeout ' + method)); } }, 120000);
});
const evaluate = async (e) => {
  const r = await send('Runtime.evaluate', { expression: e, returnByValue: true, awaitPromise: true });
  if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description || 'eval err');
  return r.result.value;
};

await send('Page.enable'); await send('Runtime.enable'); await send('Network.enable'); await send('Log.enable');
await send('Page.navigate', { url: server.url });
await sleep(7000);

console.log('\n--- 阶段 A：旧名 404 探测（页内 fetch + 读 body）---');
await evaluate(`(async () => {
  const res = await fetch('./models/mech-sandworm-1312m.glb').catch(() => null);
  if (!res) return 'null';
  await res.text().catch(() => {});
  return String(res.status);
})()`);
await sleep(1500);
dump('A');

console.log('\n--- 阶段 B：模型索引探测 ---');
await evaluate(`(async () => {
  const res = await fetch('./models/assets.manifest.json').catch(() => null);
  if (!res) return 'null';
  await res.json().catch(() => {});
  return String(res.status);
})()`);
await sleep(1500);
dump('B');

console.log('\n--- 阶段 C：点击「载入」---');
await evaluate(`(async () => {
  document.getElementById('btn-model-load').click();
  for (let i = 0; i < 600; i++) {
    if (window.__abyss.modelSource === 'shipped') break;
    await new Promise((r) => setTimeout(r, 100));
  }
  return 'clicked';
})()`);
await sleep(2500);
dump('C');

function dump(phase) {
  console.log(`\n### ${phase} 阶段 · 全部网络事件（按发生顺序）`);
  for (const e of events) {
    const p = e.params;
    if (e.method === 'Network.requestWillBeSent') {
      console.log(
        `[req ] id=${p.requestId} ${p.request.method} ${p.request.url.slice(-44)} type=${p.type} initiator=${p.initiator?.type}`
      );
    } else if (e.method === 'Network.responseReceived') {
      console.log(`[resp] id=${p.requestId} status=${p.response.status} ${p.response.url.slice(-44)}`);
    } else if (e.method === 'Network.loadingFailed') {
      console.log(
        `[FAIL] id=${p.requestId} ${p.errorText} canceled=${p.canceled} type=${p.type} blocked=${p.blockedReason}`
      );
    }
  }
  events.length = 0;
}

ws.close(); chrome.kill(); await sleep(300);
await server.close();
await rm(profileDir, { recursive: true, force: true });
console.log('\n[diag] done');
process.exit(0);
