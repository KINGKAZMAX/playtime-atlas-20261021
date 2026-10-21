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

/**
 * 运行时基准路径 `--ds-base`
 * （16-design-system/MIGRATION-NOTES.md §1 接入四步第 ④ 步、§6 Pages 子路径资源拼接）
 *
 * 规范要求由**构建**注入，不得写死：
 *   构建产物 → "/playtime-atlas-20261021/"（批次根，作品页在其下 works/<id>/）
 *   本地预览 → ""（空串即当前目录）
 * 本馆页面内的资源一律走相对路径（base: './'），--ds-base 只是把规范变量交出去，
 * 供 14-publish 的大厅等以绝对基准拼接时使用。
 *
 * 注入时机与 hreflang 相同：order: 'post'，在 Vite 的资源处理之后，
 * 避免被当成待处理资源。
 */
function dsBaseVar(command) {
  const base = command === 'build' ? '/playtime-atlas-20261021/' : '';
  return {
    name: 'ptatlas-ds-base',
    transformIndexHtml: {
      order: 'post',
      handler(html) {
        return html.replace(
          '</head>',
          [
            '  <!-- 运行时基准路径（16 MIGRATION-NOTES §1④ / §6）：构建注入，不写死 -->',
            `  <style>:root { --ds-base: "${base}"; }</style>`,
            '</head>',
          ].join('\n'),
        );
      },
    },
  };
}

export default defineConfig(({ command }) => ({
  // 相对基址：兼容 GitHub Pages 子路径、iframe 嵌入与本地 file 预览
  base: './',
  plugins: [hreflangAlternates(), dsBaseVar(command)],
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
}));
