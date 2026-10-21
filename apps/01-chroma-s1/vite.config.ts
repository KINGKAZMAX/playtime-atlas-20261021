import { defineConfig } from 'vite';

export default defineConfig({
  // Relative base so the same build works from a sub-path (e.g. GitHub Pages project site).
  base: './',
  server: {
    port: 4311,
    strictPort: true,
    host: '127.0.0.1',
  },
  preview: {
    port: 4311,
    strictPort: true,
    host: '127.0.0.1',
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    target: 'es2020',
    // Everything is bundled locally: no CDN, no runtime API calls.
    assetsInlineLimit: 4096,
    rollupOptions: {
      output: {
        manualChunks: {
          three: ['three'],
        },
      },
    },
  },
});
