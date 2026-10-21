#!/usr/bin/env node
/**
 * 本地静态服务器 —— 仅绑定 127.0.0.1:4313
 * ------------------------------------------------------------------
 * 用于在本地预览 dist/ 产物。不对外暴露，不做代理，不发起任何外网请求。
 *
 * 作为模块使用时可复用 startServer()（端口传 0 由系统分配），供冒烟测试脚本起临时服务。
 */

import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const __filename = fileURLToPath(import.meta.url);
const ROOT = path.resolve(__dirname, '..');
const DIST = path.join(ROOT, 'dist');
const PORT = Number(process.env.PORT ?? 4313);
const HOST = '127.0.0.1';

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js':   'text/javascript; charset=utf-8',
  '.mjs':  'text/javascript; charset=utf-8',
  '.css':  'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg':  'image/svg+xml',
  '.woff2':'font/woff2',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.webp': 'image/webp',
  '.ico':  'image/x-icon',
  '.txt':  'text/plain; charset=utf-8',
  '.md':   'text/markdown; charset=utf-8',
};

/**
 * 起一个只读本地静态服务器。
 * @param {object} opts
 * @param {string} [opts.root] 站点根目录（默认 dist/）
 * @param {number} [opts.port] 端口，0 表示由系统分配
 * @returns {Promise<{url:string, port:number, close:()=>Promise<void>}>}
 */
export async function startServer({ root = DIST, port = 0 } = {}) {
  const server = http.createServer((req, res) => {
    let urlPath;
    try {
      urlPath = decodeURIComponent(new URL(req.url, 'http://127.0.0.1').pathname);
    } catch {
      res.writeHead(400).end('Bad Request');
      return;
    }

    if (urlPath.endsWith('/')) urlPath += 'index.html';

    // 归一化后防止路径穿越
    const target = path.join(root, path.normalize(urlPath).replace(/^(\.\.[/\\])+/, ''));
    if (!target.startsWith(root)) {
      res.writeHead(403).end('Forbidden');
      return;
    }

    fs.stat(target, (err, stat) => {
      if (err || !stat.isFile()) {
        res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' }).end('404 Not Found');
        return;
      }
      const ext = path.extname(target).toLowerCase();
      res.writeHead(200, {
        'Content-Type': MIME[ext] ?? 'application/octet-stream',
        'Cache-Control': 'no-cache',
      });
      fs.createReadStream(target).pipe(res);
    });
  });

  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(port, HOST, resolve);
  });

  const actual = server.address().port;
  return {
    url: `http://${HOST}:${actual}/`,
    port: actual,
    close: () => new Promise((resolve) => server.close(() => resolve())),
  };
}

/* ────────────── 命令行入口 ────────────── */

const isMain = process.argv[1] && path.resolve(process.argv[1]) === path.resolve(__filename);

if (isMain) {
  if (!fs.existsSync(path.join(DIST, 'index.html'))) {
    console.error('[serve] 未找到 dist/index.html，请先执行：npm run build');
    process.exit(1);
  }

  const handle = await startServer({ root: DIST, port: PORT });
  console.log(`[serve] 织造车间调度台 · ${handle.url}`);
  console.log('[serve] 仅本地监听，按 Ctrl+C 结束');

  process.on('SIGINT', () => { handle.close().then(() => process.exit(0)); });
}
