import { defineConfig } from 'vite';

export default defineConfig({
  // Relative base so the same build works from a sub-path (e.g. GitHub Pages project site).
  base: './',
  // 余晖设计系统的公开资产（tokens.css / components.css / fonts）走静态目录，
  // 逐字节发布到 dist/assets/ds/**，运行期零外部请求；路径全部相对，适配任意子路径。
  // （MIGRATION-NOTES §6 的「assets/ds/」在 Vite 工程里对应 public/assets/ds/，
  //   发布后为 <作品路径>/assets/ds/**。）
  publicDir: 'public',
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
