import { defineConfig } from 'vite';

/**
 * 语言交替链接（DESIGN-SPEC §4.3：每页提供 hreflang="zh-CN" / "en"）
 *
 * 为什么在构建期注入：Vite 的 HTML 资源处理会把所有 `<link href>` 当作待处理资源，
 * 相对路径 `./` 会被解析成项目根目录并触发 EISDIR。
 * 用 `order: 'post'` 的 transformIndexHtml 在资源处理**之后**注入，
 * 既满足规范，又不必把 href 写成会漏掉 BASE_URL 的绝对路径。
 */
function hreflangAlternates() {
  return {
    name: 'ptatlas-hreflang',
    transformIndexHtml: {
      order: 'post',
      handler(html) {
        return html.replace(
          '</head>',
          [
            '  <!-- 语言交替（DESIGN-SPEC §4.3） -->',
            '  <link rel="alternate" hreflang="zh-CN" href="./" />',
            '  <link rel="alternate" hreflang="en" href="./?lang=en" />',
            '</head>',
          ].join('\n'),
        );
      },
    },
  };
}

export default defineConfig({
  // 相对基址：兼容 GitHub Pages 子路径、iframe 嵌入与本地 file 预览
  base: './',
  plugins: [hreflangAlternates()],
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
