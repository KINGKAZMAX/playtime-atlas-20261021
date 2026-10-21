import { defineConfig } from 'vite';
import { readFileSync } from 'node:fs';

/**
 * 把随仓库交付的说明文档一并打进 dist/。
 * 页脚会链接到这些文档，而 GitHub Pages 只发布构建产物，
 * 因此需要在构建时复制，避免 404。
 */
const DOC_FILES = ['README.md', 'SOURCES.md', 'DIFFERENCES.md', 'LICENSES.md', 'QA.md'];

function copyDocs() {
  return {
    name: 'lumen-era:copy-docs',
    apply: 'build',
    generateBundle() {
      for (const file of DOC_FILES) {
        try {
          this.emitFile({
            type: 'asset',
            fileName: file,
            source: readFileSync(file, 'utf8'),
          });
        } catch {
          // 文档尚未生成时跳过，不阻断构建
        }
      }
    },
  };
}

/**
 * 光点年代 / LUMEN ERA
 *
 * 关键约束：
 *  - base: './'  —— 所有资源走相对路径，才能同时满足
 *      (a) GitHub Pages 子路径部署
 *      (b) 被 06-museum-core 以 <iframe> 嵌套进 public/exhibits/era-origins/
 *  - MPA 三入口 —— 展厅主页 + 两款独立可玩的游戏页
 */
export default defineConfig({
  base: './',
  plugins: [copyDocs()],
  server: {
    host: '127.0.0.1',
    port: 4328,
    strictPort: true,
    open: false,
  },
  preview: {
    host: '127.0.0.1',
    port: 4328,
    strictPort: true,
  },
  build: {
    target: 'es2019',
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    chunkSizeWarningLimit: 900,
    rollupOptions: {
      input: {
        main: 'index.html',
        rally: 'rally.html',
        gravity: 'gravity.html',
      },
    },
  },
});
