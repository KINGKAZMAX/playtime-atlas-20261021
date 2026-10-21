#!/usr/bin/env node
/**
 * D1 文字重叠自查（与 13-qa-curation/qa-harness/visual-review.mjs 同口径）。
 *
 * 与上游检测器保持一致的关键点：
 *   · 候选取「直接拥有文本子节点」的元素，矩形取文本的 **行盒**（getClientRects）；
 *   · 逐级向上裁剪到真正裁剪的祖先（overflow: hidden|clip），并跳过
 *     `opacity:0 / display:none / visibility:hidden` 的任何祖先；
 *   · 重叠率 = 交叠面积 / 两者较小者的绘制面积，阈值 ≥ 50%；
 *   · 测量前等待 6s 让动态内容稳定，并冻结 transition / animation，
 *     避免在过渡帧上测量。
 *
 * 默认测 **生产构建 dist/**（与 13 的 buildTarget + 静态服务器一致），
 * 也可指定 --root 指向别的目录；服务器用完即关。
 *
 *   node scripts/check-d1.mjs                      # dist/ + 桌面 & 移动两档
 *   node scripts/check-d1.mjs --root=dist --vp=desktop
 *   node scripts/check-d1.mjs --url=http://127.0.0.1:4312/ --vp=mobile
 */

import { spawn } from 'node:child_process';
import { createServer } from 'node:http';
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
const OUT = path.resolve(ROOT, arg('out', 'screenshots/d1-review'));
const ONLY = arg('vp', '');
const PAD = 30;

const VIEWPORTS = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'mobile', width: 390, height: 844 },
].filter((v) => !ONLY || v.name === ONLY);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

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
      resolve({ server, url: `http://127.0.0.1:${port}${prefix}`, close: () => new Promise((r) => server.close(r)) });
    });
  });
}

/** 与 13 的检测器同口径的页面内检测。 */
const DETECTOR = `(() => {
  const isRendered = (el) => {
    if (!el) return false;
    if (typeof el.checkVisibility === 'function') {
      if (!el.checkVisibility({ checkOpacity: true, checkVisibilityCSS: true, contentVisibilityAuto: true })) {
        return false;
      }
    }
    let p = el.parentElement;
    while (p) {
      const st = getComputedStyle(p);
      if (parseFloat(st.opacity) === 0) return false;
      if (st.display === 'none' || st.visibility === 'hidden') return false;
      p = p.parentElement;
    }
    return true;
  };
  const clipCache = new Map();
  const clipBoxOf = (el) => {
    if (clipCache.has(el)) return clipCache.get(el);
    const st = getComputedStyle(el);
    const clipsX = st.overflowX === 'hidden' || st.overflowX === 'clip';
    const clipsY = st.overflowY === 'hidden' || st.overflowY === 'clip';
    let box = null;
    if (clipsX || clipsY) {
      const b = el.getBoundingClientRect();
      const pl = parseFloat(st.paddingLeft) || 0, pr = parseFloat(st.paddingRight) || 0;
      const pt = parseFloat(st.paddingTop) || 0, pb = parseFloat(st.paddingBottom) || 0;
      box = { clipsX, clipsY, left: b.left + pl, right: b.right - pr, top: b.top + pt, bottom: b.bottom - pb };
    }
    clipCache.set(el, box);
    return box;
  };
  const clipToVisibleArea = (rects, node) => {
    let out = rects;
    let p = node;
    while (p && p.nodeType === 1) {
      const clip = clipBoxOf(p);
      if (clip) {
        const { clipsX, clipsY, left, right, top, bottom } = clip;
        out = out.map((r) => {
          const x1 = clipsX ? Math.max(r.left, left) : r.left;
          const x2 = clipsX ? Math.min(r.right, right) : r.right;
          const y1 = clipsY ? Math.max(r.top, top) : r.top;
          const y2 = clipsY ? Math.min(r.bottom, bottom) : r.bottom;
          if (x2 - x1 <= 0.5 || y2 - y1 <= 0.5) return null;
          return { left: x1, top: y1, right: x2, bottom: y2, width: x2 - x1, height: y2 - y1 };
        }).filter(Boolean);
        if (!out.length) return [];
      }
      p = p.parentElement;
    }
    return out;
  };
  const ownTextRects = (node) => {
    const out = [];
    for (const c of node.childNodes) {
      if (c.nodeType !== 3) continue;
      if (!c.textContent || !c.textContent.trim()) continue;
      const parent = c.parentElement || node;
      if (!isRendered(parent)) continue;
      const range = document.createRange();
      range.selectNodeContents(c);
      const raw = [];
      for (const r of range.getClientRects()) if (r.width > 0 && r.height > 0) raw.push(r);
      if (!raw.length) continue;
      for (const r of clipToVisibleArea(raw, parent)) out.push(r);
    }
    return out;
  };
  const cands = [];
  for (const n of document.querySelectorAll('body *')) {
    const r = n.getBoundingClientRect();
    if (r.width < 12 || r.height < 8) continue;
    const st = getComputedStyle(n);
    if (st.display === 'none' || st.visibility === 'hidden' || parseFloat(st.opacity) === 0) continue;
    if (st.position === 'fixed') continue;
    if (!isRendered(n)) continue;
    if ((r.width * r.height) / (window.innerWidth * window.innerHeight) > 0.35) continue;
    const own = [...n.childNodes].filter((c) => c.nodeType === 3).map((c) => c.textContent.trim()).join('');
    if (own.trim().length < 2) continue;
    const rects = ownTextRects(n);
    if (!rects.length) continue;
    let left = Infinity, top = Infinity, right = -Infinity, bottom = -Infinity;
    for (const q of rects) {
      left = Math.min(left, q.left); top = Math.min(top, q.top);
      right = Math.max(right, q.right); bottom = Math.max(bottom, q.bottom);
    }
    cands.push({
      el: n.tagName.toLowerCase() + (n.id ? '#' + n.id : '') +
          (n.className && typeof n.className === 'string' ? '.' + n.className.trim().split(/\\s+/).slice(0, 2).join('.') : ''),
      rects, txt: own.trim().replace(/\\s+/g, ' ').slice(0, 30), node: n,
      box: { left, top, right, bottom },
    });
  }
  const intersect = (A, B) => {
    let area = 0;
    for (const a of A) for (const b of B) {
      const ox = Math.min(a.right, b.right) - Math.max(a.left, b.left);
      const oy = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top);
      if (ox > 0 && oy > 0) area += ox * oy;
    }
    return area;
  };
  const painted = (A) => A.reduce((s, a) => s + a.width * a.height, 0);
  const out = [];
  for (let i = 0; i < cands.length; i += 1) {
    for (let j = i + 1; j < cands.length; j += 1) {
      const a = cands[i], b = cands[j];
      if (a.box.right <= b.box.left || b.box.right <= a.box.left) continue;
      if (a.box.bottom <= b.box.top || b.box.bottom <= a.box.top) continue;
      if (a.node.contains(b.node) || b.node.contains(a.node)) continue;
      const area = intersect(a.rects, b.rects);
      if (area <= 4) continue;
      const smaller = Math.min(painted(a.rects), painted(b.rects));
      if (!smaller) continue;
      const ratio = area / smaller;
      if (ratio < 0.5) continue;
      out.push({
        a: a.el, aText: a.txt, b: b.el, bText: b.txt,
        overlapPct: Math.round(ratio * 100), overlapPx: Math.round(area),
        box: {
          left: Math.min(a.box.left, b.box.left), top: Math.min(a.box.top, b.box.top),
          right: Math.max(a.box.right, b.box.right), bottom: Math.max(a.box.bottom, b.box.bottom),
        },
        aRect: a.rects.map((r) => ({ l: Math.round(r.left), t: Math.round(r.top), r: Math.round(r.right), b: Math.round(r.bottom) })),
        bRect: b.rects.map((r) => ({ l: Math.round(r.left), t: Math.round(r.top), r: Math.round(r.right), b: Math.round(r.bottom) })),
      });
    }
  }
  return out;
})()`;

async function measure(baseUrl, vp) {
  const userDir = await mkdtemp(path.join(tmpdir(), 'abyss-d1-'));
  const port = 9400 + Math.floor(Math.random() * 300);
  const chrome = spawn(
    CHROME,
    [
      '--headless=new',
      `--remote-debugging-port=${port}`,
      `--user-data-dir=${userDir}`,
      `--window-size=${vp.width},${vp.height}`,
      '--hide-scrollbars',
      '--no-first-run',
      '--no-default-browser-check',
      '--ignore-gpu-blocklist',
      '--enable-gpu-rasterization',
      '--use-angle=metal',
      '--enable-unsafe-swiftshader',
      '--disable-dev-shm-usage',
      'about:blank',
    ],
    { stdio: ['ignore', 'ignore', 'pipe'] }
  );
  let stderr = '';
  chrome.stderr.on('data', (d) => { stderr += d.toString(); });

  let target = null;
  const ENDPOINTS = [`http://127.0.0.1:${port}/json/list`, `http://[::1]:${port}/json/list`];
  for (let i = 0; i < 60 && !target; i++) {
    await sleep(250);
    for (const endpoint of ENDPOINTS) {
      try {
        const list = await (await fetch(endpoint)).json();
        target = list.find((t) => t.type === 'page');
        if (target) break;
      } catch { /* not up yet */ }
    }
  }
  if (!target) {
    chrome.kill();
    await rm(userDir, { recursive: true, force: true }).catch(() => {});
    throw new Error('DevTools endpoint never came up.\n' + stderr.slice(-800));
  }

  const ws = new WebSocket(target.webSocketDebuggerUrl);
  let msgId = 0;
  const pending = new Map();
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
    }
  });
  const send = (method, params = {}, timeoutMs = 120000) => {
    const id = ++msgId;
    return new Promise((resolve, reject) => {
      pending.set(id, { resolve, reject });
      ws.send(JSON.stringify({ id, method, params }));
      setTimeout(() => {
        if (pending.has(id)) {
          pending.delete(id);
          reject(new Error('timeout: ' + method));
        }
      }, timeoutMs);
    });
  };
  const sendWithRetry = async (method, params = {}, attempts = 4) => {
    let lastError;
    for (let i = 0; i < attempts; i++) {
      try {
        return await send(method, params, i === 0 ? 120000 : 60000);
      } catch (e) {
        lastError = e;
        if (i < attempts - 1) {
          console.log(`[d1] retry ${i + 1} after: ${e.message}`);
          await sleep(3000);
        }
      }
    }
    throw lastError;
  };
  const evaluate = async (expression) => {
    const res = await sendWithRetry('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
    if (res.exceptionDetails) {
      throw new Error('eval error: ' + (res.exceptionDetails.exception?.description || res.exceptionDetails.text));
    }
    return res.result.value;
  };

  await send('Page.enable');
  await send('Runtime.enable');
  await send('Emulation.setDeviceMetricsOverride', {
    width: vp.width, height: vp.height, deviceScaleFactor: 1, mobile: false,
  });
  await send('Page.navigate', { url: baseUrl });
  // 与 13 一致：等动态内容稳定
  await sleep(6000);
  await evaluate(`(() => {
    const s = document.createElement('style');
    s.textContent = '*, *::before, *::after { transition: none !important; animation: none !important; }';
    document.head.appendChild(s);
    return true;
  })()`);
  await sleep(400);
  await evaluate('window.scrollTo(0,0)');
  await sleep(300);

  const hits = await evaluate(DETECTOR);

  const shots = [];
  for (let i = 0; i < hits.length; i += 1) {
    const h = hits[i];
    const b = h.box;
    const clip = {
      x: Math.max(0, Math.floor(b.left - PAD)),
      y: Math.max(0, Math.floor(b.top - PAD)),
      width: Math.min(vp.width - Math.max(0, Math.floor(b.left - PAD)), Math.ceil(b.right - b.left + PAD * 2)),
      height: Math.min(2000, Math.ceil(b.bottom - b.top + PAD * 2)),
      scale: 1,
    };
    if (clip.width < 8 || clip.height < 8) continue;
    const file = path.join(OUT, `d1-${vp.name}-${vp.width}x${vp.height}-hit-${i + 1}.png`);
    try {
      const res = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true, clip });
      await writeFile(file, Buffer.from(res.data, 'base64'));
      shots.push({ file, clip, hit: h });
    } catch (err) {
      shots.push({ error: String(err?.message || err).split('\n')[0], hit: h });
    }
  }

  ws.close();
  chrome.kill();
  await rm(userDir, { recursive: true, force: true }).catch(() => {});
  return { hits, shots };
}

async function main() {
  if (!existsSync(CHROME)) {
    console.error('[d1] Chrome not found at', CHROME);
    process.exit(2);
  }
  await mkdir(OUT, { recursive: true });

  let server = null;
  let baseUrl = URL_;
  if (!baseUrl) {
    if (!existsSync(ROOT_DIR)) {
      console.error('[d1] 目录不存在：', ROOT_DIR, '（先执行 npm run build）');
      process.exit(2);
    }
    server = await startStaticServer({ root: ROOT_DIR, mount: MOUNT });
    baseUrl = server.url;
  }

  const summary = [];
  try {
    for (const vp of VIEWPORTS) {
      const { hits, shots } = await measure(baseUrl, vp);
      await writeFile(
        path.join(OUT, `d1-${vp.name}-${vp.width}x${vp.height}-hits.json`),
        JSON.stringify({ base: baseUrl, viewport: `${vp.width}x${vp.height}`, total: hits.length, hits, shots }, null, 2),
        'utf8'
      );
      console.log(`\n[d1] ${vp.name} ${vp.width}x${vp.height} @ ${baseUrl}`);
      console.log(`     命中 ${hits.length} 处，裁剪 ${shots.filter((s) => s.file).length} 张 → ${path.relative(ROOT, OUT)}`);
      hits.forEach((h, i) => {
        console.log(`  #${i + 1} ${h.a}「${h.aText}」× ${h.b}「${h.bText}」 ${h.overlapPct}% (${h.overlapPx}px²)`);
        console.log(`      A=${JSON.stringify(h.aRect)}`);
        console.log(`      B=${JSON.stringify(h.bRect)}`);
      });
      summary.push({ viewport: vp.name, size: `${vp.width}x${vp.height}`, hits: hits.length });
    }
  } finally {
    if (server) await server.close();
  }

  const total = summary.reduce((s, v) => s + v.hits, 0);
  console.log(`\n[d1] 合计命中 ${total} 处 → ${summary.map((s) => `${s.viewport}:${s.hits}`).join('  ')}`);
  process.exit(total ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
