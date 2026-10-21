import { defineConfig } from 'vite';

// base: './' —— 关键：产物使用相对路径，可直接部署到 GitHub Pages 的任意子路径
// （例如 /<repo>/10-era-console/），也可直接双击 dist/index.html 离线打开。
export default defineConfig({
  base: './',
  server: {
    host: '127.0.0.1',
    port: 4330,
    strictPort: true,
    open: false,
  },
  preview: {
    host: '127.0.0.1',
    port: 4330,
    strictPort: true,
  },
  build: {
    target: 'es2020',
    outDir: 'dist',
    assetsDir: 'assets',
    cssCodeSplit: false,
    chunkSizeWarningLimit: 1200,
    sourcemap: false,
    // 自托管字体（4 个 woff2，合计约 193 KB）在构建期内联为 base64 data URI。
    // 这样 scripts/inline-assets.mjs 仍能把 CSS/JS 全部内联进 index.html，
    // 产物保持「单文件 dist/index.html」，既能部署到 Pages 任意子路径，
    // 也能直接用 file:// 打开（运行期零外部请求）。
    assetsInlineLimit: 400 * 1024,
    rollupOptions: {
      output: {
        // 经典脚本格式：构建后由 scripts/inline-assets.mjs 内联进 index.html，
        // 这样产物既适配 Pages 任意子路径，也能直接用 file:// 打开。
        format: 'iife',
        inlineDynamicImports: true,
      },
    },
  },
});
