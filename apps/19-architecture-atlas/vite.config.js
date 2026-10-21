import { defineConfig } from 'vite';

// GitHub Pages 子路径适配：base 走相对路径 './'
// 站内路由使用 hash（#/case/<id>），避免 History API 需要服务端 rewrite。
export default defineConfig({
  base: './',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    target: 'es2019',
    sourcemap: false,
    chunkSizeWarningLimit: 900,
    rollupOptions: {
      output: {
        manualChunks(id) {
          // three.js 单独成块：实验室视图按需动态 import，首屏不加载
          if (id.includes('node_modules/three')) return 'three';
          return undefined;
        },
      },
    },
  },
  server: {
    port: 4183,
    host: '127.0.0.1',
  },
});
