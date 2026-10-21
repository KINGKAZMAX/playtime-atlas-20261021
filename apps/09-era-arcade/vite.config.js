import { defineConfig } from 'vite';

/**
 * 霓虹街廊 · 街机可玩展厅
 *
 * base: './'  —— 所有产物使用相对路径，可直接部署到 GitHub Pages 的任意子路径
 *                  （例如 /playtime-atlas/09-era-arcade/），无需重新构建。
 */
export default defineConfig({
  base: './',
  server: {
    host: '127.0.0.1',
    port: 4329,
    strictPort: true,
    open: false,
  },
  preview: {
    host: '127.0.0.1',
    port: 4329,
    strictPort: true,
  },
  build: {
    target: 'es2018',
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    cssCodeSplit: false,
    chunkSizeWarningLimit: 900,
    // 纯静态单页产物：无服务端依赖
    rollupOptions: {
      output: {
        inlineDynamicImports: true,
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]',
      },
    },
  },
});
