/**
 * 回响电玩馆 — 极简静态文件服务器
 * 仅供本地预览与离线光栅化使用，不对外暴露。
 */

import { createServer } from 'node:http';
import { createReadStream, statSync, existsSync } from 'node:fs';
import path from 'node:path';

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
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.otf': 'font/otf',
  '.glb': 'model/gltf-binary',
  '.gltf': 'model/gltf+json',
  '.md': 'text/markdown; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
};

/**
 * 启动本地静态服务器。
 * @param {string} root 站点根目录
 * @param {number} port 0 = 随机端口
 * @param {string} [prefix] 挂载前缀，例如 '/playtime-atlas-20261021/exhibits/07-museum-art'
 *                           用于模拟线上子路径部署
 */
export function startServer(root, port = 0, prefix = '') {
  return new Promise((resolve) => {
    const server = createServer((req, res) => {
      try {
        let p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
        if (prefix) {
          if (p === prefix) p += '/';
          if (!p.startsWith(prefix)) {
            res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
            res.end('404 (outside mount)');
            return;
          }
          p = p.slice(prefix.length) || '/';
        }
        if (p.endsWith('/')) p += 'index.html';
        const file = path.join(root, p);
        if (!file.startsWith(root) || !existsSync(file) || !statSync(file).isFile()) {
          res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
          res.end('404');
          return;
        }
        const size = statSync(file).size;
        res.writeHead(200, {
          'Content-Type': MIME[path.extname(file).toLowerCase()] || 'application/octet-stream',
          'Content-Length': size,
          'Cache-Control': 'no-store',
          'Accept-Ranges': 'bytes',
          'Access-Control-Allow-Origin': '*',
        });
        createReadStream(file).pipe(res);
      } catch (e) {
        res.writeHead(500);
        res.end('500');
      }
    });
    server.listen(port, '127.0.0.1', () => {
      resolve({ server, port: server.address().port, prefix });
    });
  });
}
