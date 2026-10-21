import { defineConfig } from 'vite';

/**
 * hreflang 备选链接注入
 * --------------------------------------------------------------------------
 * 依据：16-design-system/MIGRATION-NOTES.md §5「语言标记：每页
 *       hreflang="zh-CN" / hreflang="en"」。
 *
 * 为什么不在 index.html 里直接写 <link rel="alternate" href="?lang=zh">：
 * Vite 会把**所有** link[href] 当作静态资源解析并重写路径，query-only 的 URL
 * 会被解析到目录上，导致构建直接失败（EISDIR）。而 hreflang 指向的是
 * 「同一个文档 + 不同查询串」，本就不该被当资源改写。
 * → 因此在 index.html 留占位注释，由本插件在 transformIndexHtml 的 post 阶段
 *   （Vite 完成资源重写之后）注入，产物 HTML 里带完整 hreflang，且任何路径都不被改写。
 *
 * URL 用**文档相对**的 query-only 形式（?lang=zh），因此适配任意 Pages 子路径，
 * 不写死 /playtime-atlas-20261021/。
 */
function hreflangPlugin() {
  return {
    name: 'tcl-hreflang',
    transformIndexHtml: {
      order: 'post',
      handler(html) {
        const links = [
          '  <link rel="alternate" hreflang="zh-CN" href="?lang=zh" />',
          '  <link rel="alternate" hreflang="en" href="?lang=en" />',
          '  <link rel="alternate" hreflang="x-default" href="?lang=en" />',
        ].join('\n');
        return html.replace('<!--tcl:hreflang-->', links);
      },
    },
  };
}

// 静态部署：相对路径资源，适配 GitHub Pages 子路径（如 /repo/18-architecture-models/）
export default defineConfig({
  base: './',
  plugins: [hreflangPlugin()],
  build: {
    target: 'es2020',
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    chunkSizeWarningLimit: 1200,
    rollupOptions: {
      output: {
        manualChunks: { three: ['three'] },
      },
    },
  },
  server: { host: '127.0.0.1', port: 4318, strictPort: true },
  preview: { host: '127.0.0.1', port: 4318, strictPort: true },
});
