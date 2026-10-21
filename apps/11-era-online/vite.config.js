import { defineConfig } from 'vite';

// 静态子站：base 使用相对路径，保证产物可以被放到 GitHub Pages 的任意子路径下，
// 也可以被 06 主站用 <iframe> 嵌入而不需要额外的运行时配置。
export default defineConfig({
  base: './',
  server: {
    host: '127.0.0.1',
    port: 4331,
    strictPort: true,
    open: false,
  },
  preview: {
    host: '127.0.0.1',
    port: 4331,
    strictPort: true,
  },
  build: {
    target: 'es2020',
    outDir: 'dist',
    assetsDir: 'assets',
    cssCodeSplit: false,
    chunkSizeWarningLimit: 900,
    sourcemap: false,
  },
});
