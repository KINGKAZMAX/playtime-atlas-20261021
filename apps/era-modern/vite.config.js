import { defineConfig } from 'vite';

// PRISM ERA — 现代可玩展厅
// base: './'  => 产物可用任意静态子路径托管（GitHub Pages 子目录场景）
export default defineConfig({
  base: './',
  server: {
    host: '127.0.0.1',
    port: 4332,
    strictPort: true,
    open: false,
  },
  preview: {
    host: '127.0.0.1',
    port: 4332,
    strictPort: true,
  },
  build: {
    target: 'es2020',
    outDir: 'dist',
    assetsDir: 'assets',
    chunkSizeWarningLimit: 2000,
    sourcemap: false,
  },
});
