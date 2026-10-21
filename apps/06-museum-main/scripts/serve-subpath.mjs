#!/usr/bin/env node
/**
 * 子路径验收用静态服务器（零依赖）
 *
 * 为什么要自己写：
 *   `python3 -m http.server` 的监听 backlog 只有 5（socketserver 默认值），
 *   而 Chromium 对同一源会并发 6 条连接。本馆首页 + 目录页一次要取上百个资源，
 *   backlog 打满后 SYN 被丢弃，客户端进入 TCP 重传退避（1s/3s/7s…），
 *   表现为 Playwright 偶发 30s 超时——是服务器的问题，不是站点的问题。
 *
 *   这里用 Node 原生 http：HTTP/1.1 keep-alive + backlog 512 + 正确的 MIME，
 *   验收结果才可复现。
 *
 * 用法：
 *   node scripts/serve-subpath.mjs --root <dist 目录> --port 4333 \
 *        --mount /playtime-atlas-20261021/works/06-museum-main
 *
 * 语义：--root 是文件系统目录，--mount 是它在 URL 上的前缀。
 *   URL  /playtime-atlas-20261021/works/06-museum-main/index.html
 *   文件  <root>/index.html
 * 例如直接把 dist 挂在 Pages 子路径上：
 *   node scripts/serve-subpath.mjs --root "<abs>/06-museum-core/dist" --port 4333 \
 *        --mount /playtime-atlas-20261021/works/06-museum-main
 *
 * 目录 URL（无尾斜杠）会 301 到带斜杠版本，与 GitHub Pages 行为一致——
 * 站内资源全部走相对路径，尾斜杠决定了相对路径锚定在哪个目录上。
 */

import http from 'node:http';
import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import path from 'node:path';

const argv = process.argv.slice(2);
function arg(name, fallback) {
  const i = argv.indexOf(`--${name}`);
  return i >= 0 && argv[i + 1] ? argv[i + 1] : fallback;
}

const ROOT = path.resolve(arg('root', process.cwd()));
const PORT = Number(arg('port', '4333'));
const MOUNT = '/' + String(arg('mount', '')).replace(/^\/+|\/+$/g, '');

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.otf': 'font/otf',
  '.txt': 'text/plain; charset=utf-8',
  '.md': 'text/markdown; charset=utf-8',
  '.map': 'application/json; charset=utf-8',
};

function mimeOf(file) {
  return MIME[path.extname(file).toLowerCase()] ?? 'application/octet-stream';
}

async function resolveFile(urlPath) {
  let rest = decodeURIComponent(urlPath.split('?')[0]);
  if (MOUNT) {
    // 只服务挂载前缀之下的内容
    if (rest !== MOUNT && !rest.startsWith(MOUNT + '/')) return null;
    rest = rest.slice(MOUNT.length);
  }
  rest = rest.replace(/^\/+/, '');
  // 防目录穿越
  const target = path.resolve(ROOT, rest);
  if (target !== ROOT && !target.startsWith(ROOT + path.sep)) return null;

  try {
    const s = await stat(target);
    if (s.isDirectory()) {
      const idx = path.join(target, 'index.html');
      const is = await stat(idx);
      if (is.isFile()) return idx;
      return null;
    }
    return target;
  } catch {
    return null;
  }
}

const server = http.createServer(async (req, res) => {
  const rawUrl = req.url ?? '/';

  /*
   * 目录 URL 补斜杠（301）——对齐 GitHub Pages 的行为。
   *
   * 为什么必须补：站内所有资源都用相对路径（./assets/…、./art/…）。
   * 浏览器把「相对路径」锚定在**目录**上，所以
   *   /playtime-atlas-20261021/works/06-museum-main/   → ./assets/a.css  → /works/06-museum-main/assets/a.css ✅
   *   /playtime-atlas-20261021/works/06-museum-main    → ./assets/a.css  → /works/assets/a.css ❌ 404
   * Pages 对目录型 URL 会 301 到带斜杠的版本，本地服务器若不模拟这一点，
   * 就会「本地测挂了、线上是好的」这种假故障；反过来也会掩盖真实问题。
   * 这里显式补 301，让本地行为与线上完全一致。
   */
  if (MOUNT) {
    const [p, q] = rawUrl.split('?');
    if (p === MOUNT) {
      const loc = MOUNT + '/' + (q ? `?${q}` : '');
      res.writeHead(301, { location: loc, 'cache-control': 'no-store' });
      res.end();
      console.log(`301 ${rawUrl} → ${loc}`);
      return;
    }
  }

  const file = await resolveFile(rawUrl);
  if (!file) {
    res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
    res.end('404 Not Found');
    console.log(`404 ${req.url}`);
    return;
  }
  const headers = {
    'content-type': mimeOf(file),
    'cache-control': 'no-store',
    'accept-ranges': 'bytes',
  };
  res.writeHead(200, headers);
  if (req.method === 'HEAD') { res.end(); return; }
  createReadStream(file).pipe(res);
});

// backlog 拉满，避免 Chromium 并发连接时 SYN 被丢
server.keepAliveTimeout = 30000;
server.listen(PORT, '127.0.0.1', 512, () => {
  console.log(`静态服务器已启动： http://127.0.0.1:${PORT}${MOUNT}/`);
  console.log(`根目录：${ROOT}`);
});

for (const sig of ['SIGINT', 'SIGTERM']) {
  process.on(sig, () => {
    server.close(() => process.exit(0));
    setTimeout(() => process.exit(0), 500).unref();
  });
}
