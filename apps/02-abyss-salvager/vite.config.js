import { defineConfig } from 'vite';
import { resolve } from 'node:path';

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
    rollupOptions: {
      // 多页：检视台 index.html + 说明页 notes.html
      // （RESTYLE-SPEC §6.9 要求教学示意声明在「说明页」可见）
      input: {
        main: resolve(process.cwd(), 'index.html'),
        notes: resolve(process.cwd(), 'notes.html'),
      },
    },
  },
  base: './',
});
