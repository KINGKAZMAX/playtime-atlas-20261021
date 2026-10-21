import { defineConfig } from 'vite';

/**
 * 端口约定
 * ----------
 * 本包（07-museum-art）按调度要求声明 **4327** 为本地预览端口。
 *
 * 但同一批任务里，06-museum-core 曾在 4327 上临时起过静态验证服务器
 * （其 vite.config 的正式开发端口是 4326）。为避免两个任务互相抢占端口、
 * 也避免中断对方的进程，这里采用「声明端口 + 自动顺延」策略：
 *
 *   · 优先尝试 4327；
 *   · 若已被占用，Vite 自动顺延到下一个空闲端口并在终端打印实际地址；
 *   · 绝不 kill 任何占用进程。
 *
 * 资产交付本身**不依赖端口**：06 侧只需复制 `public/assets/` 即可，
 * 端口仅用于本地预览。
 */
const PRIMARY_PORT = 4327;

function reportPort() {
  return {
    name: 'atlas-port-report',
    configureServer(server) {
      server.httpServer?.once('listening', () => {
        const address = server.httpServer?.address();
        const port = typeof address === 'object' && address ? address.port : PRIMARY_PORT;
        const suffix = port === PRIMARY_PORT ? '' : `  ← ${PRIMARY_PORT} 被占用，已顺延`;
        server.config.logger.info(
          `\n  回响电玩馆美术包预览：http://127.0.0.1:${port}${suffix}\n` +
            `  资产根：public/assets/   接口说明：INTERFACE.md\n`,
        );
      });
    },
  };
}

export default defineConfig({
  base: './',
  root: '.',
  publicDir: 'public',
  plugins: [reportPort()],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    assetsInlineLimit: 0,
    chunkSizeWarningLimit: 1200,
  },
  server: {
    host: '127.0.0.1',
    port: PRIMARY_PORT,
    strictPort: false,
  },
  preview: {
    host: '127.0.0.1',
    port: PRIMARY_PORT,
    strictPort: false,
  },
});
