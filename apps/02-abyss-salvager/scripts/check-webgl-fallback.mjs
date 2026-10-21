#!/usr/bin/env node
/**
 * WebGL 不可用时的 2D 降级自查。
 *
 * 验收目标（15-supervisor 派单第 3 条）：没有 WebGL 时不能白屏，
 * 必须降级为与 3D 同源的 2D 技术图，并保留「教学示意，非施工/工程模型」声明。
 *
 * 口径说明：
 *   · 页面在 **生产构建 dist/** 上测（与 check-d1 / verify-dist 同源），服务器用完即关；
 *   · 禁 WebGL 有两道保险：
 *       1) Chrome 启动参数 --disable-webgl --disable-3d-apis；
 *       2) `Page.addScriptToEvaluateOnNewDocument` 拦截 getContext('webgl*')，
 *          令其返回 null —— 这等价于浏览器/显卡驱动根本不给 WebGL 上下文，
 *          three.js 的 WebGLRenderer 会抛错，应用应走 showWebglFallback 分支。
 *   · 断言全部在页面内取真实运行时状态，不靠读源码推断。
 *
 *   node scripts/check-webgl-fallback.mjs
 *   node scripts/check-webgl-fallback.mjs --url=http://127.0.0.1:4312/
 */

import { spawn } from 'node:child_process';
import { createServer } from 'node:http';
import { createServer as createNetServer } from 'node:net';
import fs from 'node:fs';
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');

const args = process.argv.slice(2);
const arg = (k, d) => (args.find((a) => a.startsWith(`--${k}=`)) || '').split('=')[1] || d;
const ROOT_DIR = path.resolve(ROOT, arg('root', 'dist'));
const URL_ = arg('url', '');
const MOUNT = arg('mount', '/');
const OUT = path.resolve(ROOT, arg('out', 'screenshots'));
const PORT_ARG = arg('port', '');   // 留空则向系统要一个空闲端口
const WIDTH = 1440;
const HEIGHT = 900;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** 向操作系统要一个当前空闲的 TCP 端口给 Chrome 的调试通道。 */
async function freePort() {
  return new Promise((resolve, reject) => {
    const srv = createNetServer();
    srv.unref();
    srv.on('error', reject);
    srv.listen(0, '127.0.0.1', () => {
      const { port } = srv.address();
      srv.close(() => resolve(port));
    });
  });
}

/** 极简静态服务器：把 root 挂到 mount 下。 */
function startStaticServer({ root, mount }) {
  const prefix = mount.endsWith('/') ? mount : `${mount}/`;
  const server = createServer(async (req, res) => {
    try {
      const url = new URL(req.url, 'http://localhost');
      if (!url.pathname.startsWith(prefix)) {
        res.writeHead(404).end('404 (outside mount)');
        return;
      }
      let rel = decodeURIComponent(url.pathname.slice(prefix.length)) || 'index.html';
      if (rel.endsWith('/')) rel += 'index.html';
      const file = path.join(root, rel);
      if (!file.startsWith(root) || !existsSync(file) || fs.statSync(file).isDirectory()) {
        res.writeHead(404).end('404');
        return;
      }
      const body = await readFile(file);
      const ext = path.extname(file).toLowerCase();
      const type =
        ext === '.html' ? 'text/html; charset=utf-8'
        : ext === '.js' ? 'text/javascript; charset=utf-8'
        : ext === '.css' ? 'text/css; charset=utf-8'
        : ext === '.json' ? 'application/json; charset=utf-8'
        : ext === '.woff2' ? 'font/woff2'
        : ext === '.glb' ? 'model/gltf-binary'
        : 'application/octet-stream';
      res.writeHead(200, { 'content-type': type, 'content-length': body.length });
      res.end(body);
    } catch (err) {
      res.writeHead(500).end(String(err));
    }
  });
  return new Promise((resolve) => {
    server.listen(0, '127.0.0.1', () => {
      const { port } = server.address();
      resolve({
        server,
        url: `http://127.0.0.1:${port}${prefix}`,
        close: () => new Promise((r) => server.close(r)),
      });
    });
  });
}

/** 注入脚本：让 WebGL 上下文创建失败，模拟显卡驱动不支持 WebGL。 */
const BLOCK_WEBGL = `(() => {
  const orig = HTMLCanvasElement.prototype.getContext;
  HTMLCanvasElement.prototype.getContext = function (type, ...rest) {
    const t = String(type || '').toLowerCase();
    if (t === 'webgl' || t === 'webgl2' || t === 'experimental-webgl') return null;
    return orig.call(this, type, ...rest);
  };
  try { window.__webglBlocked = true; } catch (e) {}
})();`;

/** 页面内断言。 */
const PROBE = `(() => {
  const vis = (el) => {
    if (!el) return false;
    const st = getComputedStyle(el);
    if (st.display === 'none' || st.visibility === 'hidden') return false;
    if (parseFloat(st.opacity) === 0) return false;
    const r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0;
  };
  const fb = document.getElementById('webgl-fallback');
  const note = document.getElementById('fallback-note');
  const title = document.querySelector('.fallback-title');
  const longC = document.getElementById('fallback-long');
  const crownC = document.getElementById('fallback-crown');

  // 统计 2D 技术图的实际绘制像素：非透明像素占比
  const inkRatio = (cv) => {
    if (!cv) return 0;
    let ctx;
    try { ctx = cv.getContext('2d'); } catch (e) { return -1; }
    if (!ctx) return -1;
    let data;
    try { data = ctx.getImageData(0, 0, cv.width, cv.height).data; } catch (e) { return -1; }
    let ink = 0;
    for (let i = 3; i < data.length; i += 4) if (data[i] > 8) ink++;
    return ink / (cv.width * cv.height);
  };

  const visibleText = Array.from(document.querySelectorAll('body *')).filter((n) => {
    if (!vis(n)) return false;
    const own = Array.from(n.childNodes).filter((c) => c.nodeType === 3)
      .map((c) => c.textContent.trim()).join('');
    return own.length >= 2;
  }).length;

  const sw = Math.max(
    document.documentElement.scrollWidth,
    document.body ? document.body.scrollWidth : 0
  );

  return {
    webglBlocked: window.__webglBlocked === true,
    hasFallbackEl: !!fb,
    fallbackShown: !!fb && fb.classList.contains('show') && vis(fb),
    fallbackBox: fb ? (() => { const r = fb.getBoundingClientRect();
      return { w: Math.round(r.width), h: Math.round(r.height) }; })() : null,
    titleVisible: vis(title),
    titleText: title ? title.textContent.trim() : '',
    noteText: note ? note.textContent.trim() : '',
    noteVisible: vis(note),
    noteHasReason: !!note && note.textContent.includes('降级原因'),
    noteHasDisclaimer: !!note && note.textContent.includes('教学示意，非施工/工程模型'),
    longInk: inkRatio(longC),
    crownInk: inkRatio(crownC),
    visibleTextNodes: visibleText,
    appUiHidden: document.body.classList.contains('ui-hidden'),
    scrollWidth: sw,
    innerWidth: window.innerWidth,
    noOverflow: sw <= window.innerWidth,
    apiExposed: !!window.__abyss,
    // 降级分支不应在 3D 舞台上挂任何 canvas（WebGL canvas 由 renderer 注入 stage）
    stageCanvasCount: document.querySelectorAll('#stage canvas').length,
    fallbackCanvasCount: document.querySelectorAll('#fallback-long, #fallback-crown').length,
    totalCanvasCount: document.querySelectorAll('canvas').length,
  };
})()`;

async function main() {
  if (!existsSync(CHROME)) {
    console.error('[fallback] Chrome not found at', CHROME);
    process.exit(2);
  }
  await mkdir(OUT, { recursive: true });

  let closeServer = async () => {};
  let targetUrl = URL_;
  if (!targetUrl) {
    const srv = await startStaticServer({ root: ROOT_DIR, mount: MOUNT });
    closeServer = srv.close;
    targetUrl = srv.url;
  }
  console.log('[fallback] target:', targetUrl);

  const userDir = await mkdtemp(path.join(tmpdir(), 'abyss-fallback-'));
  // 动态端口：写死端口会被同机其它任务的残留 headless Chrome 抢占
  const PORT = PORT_ARG ? Number(PORT_ARG) : await freePort();
  const chrome = spawn(
    CHROME,
    [
      '--headless=new',
      `--remote-debugging-port=${PORT}`,
      `--user-data-dir=${userDir}`,
      `--window-size=${WIDTH},${HEIGHT}`,
      '--hide-scrollbars',
      '--no-first-run',
      '--no-default-browser-check',
      // 关掉 WebGL 与 3D API：真实地让页面拿不到 WebGL 上下文
      '--disable-webgl',
      '--disable-webgl2',
      '--disable-3d-apis',
      '--disable-gpu',
      '--disable-dev-shm-usage',
      'about:blank',
    ],
    { stdio: ['ignore', 'ignore', 'pipe'] }
  );
  let stderr = '';
  chrome.stderr.on('data', (d) => {
    stderr += d.toString();
  });

  let target = null;
  const ENDPOINTS = [`http://127.0.0.1:${PORT}/json/list`, `http://[::1]:${PORT}/json/list`];
  for (let i = 0; i < 160 && !target; i++) {
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
  }
  if (!target) {
    console.error('[fallback] DevTools endpoint never came up.\n', stderr.slice(-800));
    chrome.kill();
    await rm(userDir, { recursive: true, force: true }).catch(() => {});
    await closeServer();
    process.exit(3);
  }

  const ws = new WebSocket(target.webSocketDebuggerUrl);
  let msgId = 0;
  const pending = new Map();
  const events = [];
  await new Promise((resolve, reject) => {
    ws.addEventListener('open', resolve);
    ws.addEventListener('error', reject);
  });
  ws.addEventListener('message', (ev) => {
    const msg = JSON.parse(ev.data);
    if (msg.id && pending.has(msg.id)) {
      const { resolve, reject } = pending.get(msg.id);
      pending.delete(msg.id);
      if (msg.error) reject(new Error(JSON.stringify(msg.error)));
      else resolve(msg.result);
    } else if (msg.method) {
      events.push(msg);
    }
  });

  function send(method, params = {}, timeoutMs = 90000) {
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

  const steps = [];
  let exitCode = 0;
  try {
    await send('Page.enable');
    await send('Runtime.enable');
    await send('Log.enable');
    await send('Emulation.setDeviceMetricsOverride', {
      width: WIDTH, height: HEIGHT, deviceScaleFactor: 1, mobile: false,
    });
    // 注入拦截必须在文档脚本之前执行
    await send('Page.addScriptToEvaluateOnNewDocument', { source: BLOCK_WEBGL });

    console.log('[fallback] loading', targetUrl);
    await send('Page.navigate', { url: targetUrl });
    await sleep(9000);

    const res = await send('Runtime.evaluate', {
      expression: PROBE,
      returnByValue: true,
      awaitPromise: true,
    });
    if (res.exceptionDetails) {
      throw new Error('probe failed: ' + (res.exceptionDetails.exception?.description || res.exceptionDetails.text));
    }
    const p = res.result.value || {};

    const add = (step, pass, value) => {
      steps.push({ step, pass, value });
      if (!pass) exitCode = 1;
    };

    add('webgl-actually-blocked', p.webglBlocked === true, p.webglBlocked);
    add('fallback-panel-shown', p.fallbackShown === true, { shown: p.fallbackShown, box: p.fallbackBox });
    add('fallback-not-blank', p.visibleTextNodes >= 5, { visibleTextNodes: p.visibleTextNodes });
    add('fallback-title-visible', p.titleVisible === true, p.titleText);
    add('fallback-note-has-reason', p.noteHasReason === true, p.noteText.slice(0, 60));
    add('fallback-note-has-disclaimer', p.noteHasDisclaimer === true, p.noteHasDisclaimer);
    add('2d-long-section-drawn', typeof p.longInk === 'number' && p.longInk > 0.01,
      { inkRatio: p.longInk });
    add('2d-crown-section-drawn', typeof p.crownInk === 'number' && p.crownInk > 0.01,
      { inkRatio: p.crownInk });
    add('app-chrome-hidden', p.appUiHidden === true, p.appUiHidden);
    add('no-horizontal-overflow', p.noOverflow === true,
      { scrollWidth: p.scrollWidth, innerWidth: p.innerWidth });
    // 降级后不应有 WebGL 画布挂到 3D 舞台上，且两个 2D 技术图画布就位
    add('webgl-stage-canvas-not-created', p.stageCanvasCount === 0,
      { stageCanvasCount: p.stageCanvasCount, totalCanvasCount: p.totalCanvasCount });
    add('fallback-canvases-present', p.fallbackCanvasCount === 2,
      { fallbackCanvasCount: p.fallbackCanvasCount });

    const shot = await send('Page.captureScreenshot', { format: 'png' }).catch(() => null);
    if (shot?.data) {
      const file = path.join(OUT, '20-webgl-fallback.png');
      await writeFile(file, Buffer.from(shot.data, 'base64'));
      console.log('[fallback] wrote', file);
    }

    const consoleErrors = events
      .filter((e) => e.method === 'Log.entryAdded' && e.params.entry.level === 'error')
      .map((e) => e.params.entry.text)
      // 降级路径本就会 console.error 一条「WebGL unavailable」，属于预期回声
      .filter((t) => !/WebGL unavailable|WebGL context|webgl/i.test(t));
    add('no-unexpected-console-errors', consoleErrors.length === 0, consoleErrors);

    console.log('\n[fallback] 页面状态：');
    console.log(JSON.stringify(p, null, 2));
    console.log('\n[fallback] 断言：');
    for (const s of steps) {
      console.log(`${s.pass ? 'PASS ' : 'FAIL '} ${s.step} ${JSON.stringify(s.value)}`);
    }
    const passCount = steps.filter((s) => s.pass).length;
    console.log(`\n[fallback] ${passCount}/${steps.length} passed`);
  } catch (err) {
    console.error('[fallback] failed:', err.message);
    exitCode = 1;
  } finally {
    try { ws.close(); } catch { /* ignore */ }
    chrome.kill();
    await rm(userDir, { recursive: true, force: true }).catch(() => {});
    await closeServer();
  }
  console.log(`FALLBACK_EXIT=${exitCode}`);
  process.exit(exitCode);
}

main();
