import { defineConfig } from 'vite';

export default defineConfig({
  // 相对基址：兼容 GitHub Pages 子路径、iframe 嵌入与本地 file 预览
  base: './',
  server: {
    host: '127.0.0.1',
    port: 4326,
    strictPort: true,
    open: false,
  },
  preview: {
    host: '127.0.0.1',
    port: 4326,
    strictPort: true,
  },
  build: {
    target: 'es2020',
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    chunkSizeWarningLimit: 900,
    rollupOptions: {
      output: {
        manualChunks: {
          three: ['three'],
        },
      },
    },
  },
});
