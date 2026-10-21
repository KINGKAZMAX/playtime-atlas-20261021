/**
 * Boot check for the production bundle.
 *
 * Serves `dist/` and loads it in headless Chrome to prove the shipped build
 * boots, exposes the QA handle, and can still produce a GLB.
 *
 *   node scripts/probe-dist.mjs [baseUrl]
 */

import { spawn } from 'node:child_process';

const BASE = process.argv[2] || 'http://127.0.0.1:4312/';
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const PORT = 9351;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const chrome = spawn(CHROME, [
  '--headless=new', `--remote-debugging-port=${PORT}`,
  `--user-data-dir=/tmp/abyss-dist-probe`,
  '--window-size=1280,800', '--hide-scrollbars', '--no-first-run',
  '--ignore-gpu-blocklist', '--enable-gpu-rasterization', '--disable-dev-shm-usage',
  'about:blank',
], { stdio: ['ignore', 'ignore', 'pipe'] });

let target = null;
for (let i = 0; i < 60; i++) {
  await sleep(250);
  try {
    const res = await fetch(`http://127.0.0.1:${PORT}/json/list`);
    const list = await res.json();
    target = list.find((t) => t.type === 'page');
    if (target) break;
  } catch {}
}
if (!target) { console.error('no target'); chrome.kill(); process.exit(3); }

const ws = new WebSocket(target.webSocketDebuggerUrl);
let msgId = 0;
const pending = new Map();
const events = [];
await new Promise((res, rej) => { ws.addEventListener('open', res); ws.addEventListener('error', rej); });
ws.addEventListener('message', (ev) => {
  const msg = JSON.parse(ev.data);
  if (msg.id && pending.has(msg.id)) {
    const { resolve, reject } = pending.get(msg.id);
    pending.delete(msg.id);
    if (msg.error) reject(new Error(JSON.stringify(msg.error)));
    else resolve(msg.result);
  } else if (msg.method) events.push(msg);
});
function send(method, params = {}, timeoutMs = 45000) {
  const id = ++msgId;
  return new Promise((resolve, reject) => {
    pending.set(id, { resolve, reject });
    ws.send(JSON.stringify({ id, method, params }));
    setTimeout(() => { if (pending.has(id)) { pending.delete(id); reject(new Error(`timeout: ${method}`)); } }, timeoutMs);
  });
}

await send('Page.enable');
await send('Runtime.enable');
await send('Log.enable');
await send('Page.navigate', { url: BASE });
await sleep(6000);

async function evaluate(expression) {
  const res = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
  if (res.exceptionDetails) throw new Error(res.exceptionDetails.exception?.description || 'eval error');
  return res.result.value;
}

const boot = await evaluate('JSON.stringify({ api: !!window.__abyss, length: window.__abyss ? Math.round(window.__abyss.machine.lengthMetres) : null, segs: window.__abyss ? window.__abyss.machine.segments.length : null, title: document.title })');
console.log('[dist] boot:', boot);

const glb = await evaluate(`(async () => {
  const orig = URL.createObjectURL; let captured = null;
  URL.createObjectURL = function (b) { captured = b; return orig.call(URL, b); };
  const oc = HTMLAnchorElement.prototype.click; let name = null;
  HTMLAnchorElement.prototype.click = function () { name = this.download; };
  await window.__abyss.exportGLB();
  URL.createObjectURL = orig; HTMLAnchorElement.prototype.click = oc;
  if (!captured) return JSON.stringify({ ok: false });
  const buf = new Uint8Array(await captured.arrayBuffer());
  return JSON.stringify({ ok: true, size: buf.length, magic: String.fromCharCode(buf[0],buf[1],buf[2],buf[3]), version: buf[4]|(buf[5]<<8)|(buf[6]<<16)|(buf[7]<<24), name });
})()`);
console.log('[dist] export:', glb);

const errs = events.filter((e) => e.method === 'Log.entryAdded' && e.params.entry.level === 'error').map((e) => e.params.entry.text);
const excs = events.filter((e) => e.method === 'Runtime.exceptionThrown').map((e) => e.params.exceptionDetails?.exception?.description || 'exception');
console.log('[dist] consoleErrors:', JSON.stringify(errs));
console.log('[dist] exceptions:', JSON.stringify(excs));

ws.close(); chrome.kill();
process.exit(errs.length || excs.length ? 1 : 0);
