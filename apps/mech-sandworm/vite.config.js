import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    port: 4312,
    strictPort: true,
    host: '127.0.0.1',
  },
  preview: {
    port: 4312,
    strictPort: true,
    host: '127.0.0.1',
  },
  build: {
    outDir: 'dist',
    assetsInlineLimit: 0,
    sourcemap: false,
    chunkSizeWarningLimit: 1600,
  },
  base: './',
});
