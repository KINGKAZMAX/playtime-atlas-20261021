import { defineConfig } from 'vite';

// 纯静态产物：base 使用相对路径，便于部署到任意子路径（如 GitHub Pages）
export default defineConfig({
  base: './',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    target: 'es2020',
    cssCodeSplit: false,
    sourcemap: false,
    rollupOptions: {
      output: {
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]',
      },
    },
  },
  server: {
    port: 4313,
    strictPort: true,
    host: '127.0.0.1',
    open: false,
  },
});
