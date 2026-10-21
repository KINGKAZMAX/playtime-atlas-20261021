#!/usr/bin/env node
/**
 * capture_cdp.mjs — 用 CDP 设备仿真截图（与 browser_test.mjs 同一通道）
 * 用法：node scripts/capture_cdp.mjs <url> <out.png> <width> <height> [mobile] [light|dark]
 *
 * 说明：headless Chrome 的系统主题偏好默认可能是 dark，截图前显式指定，
 *      避免同一台机器两次截图一个浅一个深。
 *
 * ⚠️ 作用域：只用于**本地构建产物**（127.0.0.1）的回归截图，不发起对外请求。
 *    对外站点（参考站、机构页面、线上站点）的访问与截图一律走用户的 Ego 浏览器
 *    （/Users/mekzenx2/.local/bin/ego-browser，先运行 `ego-browser skill`）。
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';

const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const [url, out, w, h, mode, scheme = 'light'] = process.argv.slice(2);
const W = Number(w), H = Number(h);
const isMobile = mode === 'mobile';
const PORT = 9400 + Math.floor(Math.random() * 300);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'cdp-cap-'));
const child = spawn(CHROME, [
  '--headless=new', '--disable-gpu', '--no-sandbox', '--no-first-run', '--no-default-browser-check',
  '--disable-extensions', '--disable-background-networking', `--user-data-dir=${profile}`,
  `--remote-debugging-port=${PORT}`, 'about:blank',
], { stdio: 'ignore' });

async function waitJson(u, n = 60) {
  for (let i = 0; i < n; i++) {
    try { const r = await fetch(u); if (r.ok) return r.json(); } catch {}
    await sleep(250);
  }
  throw new Error('timeout ' + u);
}

try {
  const ver = await waitJson(`http://127.0.0.1:${PORT}/json/version`);
  const ws = new WebSocket(ver.webSocketDebuggerUrl);
  await new Promise((res, rej) => { ws.addEventListener('open', res, { once: true }); ws.addEventListener('error', rej, { once: true }); });
  let id = 0; const pending = new Map();
  ws.addEventListener('message', (ev) => {
    const m = JSON.parse(ev.data);
    if (m.id && pending.has(m.id)) { const p = pending.get(m.id); pending.delete(m.id); m.error ? p.reject(new Error(m.error.message)) : p.resolve(m.result); }
  });
  const send = (method, params = {}, sessionId) => new Promise((resolve, reject) => {
    const i = ++id; pending.set(i, { resolve, reject });
    ws.send(JSON.stringify(sessionId ? { id: i, method, params, sessionId } : { id: i, method, params }));
    setTimeout(() => { if (pending.has(i)) { pending.delete(i); reject(new Error('timeout ' + method)); } }, 30000);
  });

  const { targetId } = await send('Target.createTarget', { url: 'about:blank' });
  const { sessionId } = await send('Target.attachToTarget', { targetId, flatten: true });
  await send('Page.enable', {}, sessionId);
  await send('Emulation.setEmulatedMedia', {
    features: [{ name: 'prefers-color-scheme', value: scheme }],
  }, sessionId);
  await send('Emulation.setDeviceMetricsOverride', {
    width: W, height: H, deviceScaleFactor: isMobile ? 2 : 1, mobile: isMobile,
  }, sessionId);
  await send('Page.navigate', { url }, sessionId);
  await sleep(2200);
  const metrics = await send('Runtime.evaluate', {
    expression: `({cw: document.documentElement.clientWidth, sw: document.documentElement.scrollWidth, iw: window.innerWidth, dpr: window.devicePixelRatio})`,
    returnByValue: true,
  }, sessionId);
  const shot = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false }, sessionId);
  fs.writeFileSync(out, Buffer.from(shot.data, 'base64'));
  console.log(`OK  ${out}  ${fs.statSync(out).size} bytes  metrics=${JSON.stringify(metrics.result.value)}`);
  ws.close();
} finally {
  try { child.kill('SIGKILL'); } catch {}
  await sleep(300);
  fs.rmSync(profile, { recursive: true, force: true });
}
