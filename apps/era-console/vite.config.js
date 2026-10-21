import { defineConfig } from 'vite';

// base: './' —— 关键：产物使用相对路径，可直接部署到 GitHub Pages 的任意子路径
// （例如 /<repo>/10-era-console/），也可直接双击 dist/index.html 离线打开。
export default defineConfig({
  base: './',
  server: {
    host: '127.0.0.1',
    port: 4330,
    strictPort: true,
    open: false,
  },
  preview: {
    host: '127.0.0.1',
    port: 4330,
    strictPort: true,
  },
  build: {
    target: 'es2020',
    outDir: 'dist',
    assetsDir: 'assets',
    chunkSizeWarningLimit: 1200,
    sourcemap: false,
  },
});
