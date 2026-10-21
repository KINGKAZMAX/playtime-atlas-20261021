import { defineConfig } from 'vite';

/**
 * 光点年代 / LUMEN ERA
 *
 * 关键约束：
 *  - base: './'  —— 所有资源走相对路径，才能同时满足
 *      (a) GitHub Pages 子路径部署
 *      (b) 被 06-museum-core 以 <iframe> 嵌套进 public/exhibits/era-origins/
 *  - MPA 三入口 —— 展厅主页 + 两款独立可玩的游戏页
 */
export default defineConfig({
  base: './',
  server: {
    host: '127.0.0.1',
    port: 4328,
    strictPort: true,
    open: false,
  },
  preview: {
    host: '127.0.0.1',
    port: 4328,
    strictPort: true,
  },
  build: {
    target: 'es2019',
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    chunkSizeWarningLimit: 900,
    rollupOptions: {
      input: {
        main: 'index.html',
        rally: 'rally.html',
        gravity: 'gravity.html',
      },
    },
  },
});
