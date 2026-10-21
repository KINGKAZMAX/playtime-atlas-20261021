import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  server: {
    host: '127.0.0.1',
    port: 4314,
    strictPort: true,
    open: false,
  },
  preview: {
    host: '127.0.0.1',
    port: 4314,
    strictPort: true,
  },
  build: {
    target: 'es2020',
    outDir: 'dist',
    assetsDir: 'assets',
    chunkSizeWarningLimit: 1600,
    sourcemap: false,
  },
});
