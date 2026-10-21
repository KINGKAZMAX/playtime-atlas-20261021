/**
 * 10-era-console — 构建后处理：把 CSS / JS 内联进 index.html
 *
 * 目的：
 *  1. 产物只有 dist/index.html 一个文件，天然适配 GitHub Pages 任意子路径；
 *  2. 产物是"经典脚本"而非 ES module，浏览器允许 file:// 直接打开
 *     （ES module 在 file:// 下会被 CORS 策略拦截，经典脚本不会）。
 *
 * 若内联失败，保留 Vite 的标准产物并以非零码退出，避免发布出坏文件。
 */

import { readFile, writeFile, readdir, rm, stat } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const DIST = resolve(ROOT, 'dist');

async function main() {
  const htmlPath = resolve(DIST, 'index.html');
  let html = await readFile(htmlPath, 'utf8');

  // 1) 内联 CSS
  //    注意：必须用函数式 replacer。压缩后的代码里含有 `$&` / `$'` 等序列，
  //    字符串 replacer 会把它们当成替换模式展开，从而破坏产物。
  const cssRefs = [...html.matchAll(/<link[^>]+rel="stylesheet"[^>]*href="([^"]+)"[^>]*>/g)];
  for (const m of cssRefs) {
    const href = m[1];
    const file = resolve(DIST, href.replace(/^\.?\//, ''));
    const css = await readFile(file, 'utf8');
    html = html.replace(m[0], () => `<style>\n${css}\n</style>`);
  }

  // 2) 内联 JS（转成经典脚本，去掉 type="module" 与 crossorigin）
  //    内联脚本会落在原来的 <head> 位置，而经典脚本不会像 module 那样自动 defer，
  //    直接放在 head 里会在 DOM 就绪前执行。因此把脚本整体移到 </body> 之前。
  const jsRefs = [...html.matchAll(/<script([^>]*)src="([^"]+)"([^>]*)><\/script>/g)];
  for (const m of jsRefs) {
    const file = resolve(DIST, m[2].replace(/^\.?\//, ''));
    let js = await readFile(file, 'utf8');
    // 防止脚本内容里出现字面量 </script> 提前闭合标签
    js = js.replace(/<\/script>/gi, '<\\/script>');
    const tag = `<script>\n${js}\n</script>`;
    if (html.includes('</body>')) {
      html = html.replace('</body>', () => `${tag}\n</body>`);
    } else {
      html = html.replace(m[0], () => tag);
    }
    html = html.replace(m[0], '');
  }

  // 3) 清掉不再需要的资源引用与 preload 链接
  html = html.replace(/<link[^>]+rel="modulepreload"[^>]*>/g, '');

  await writeFile(htmlPath, html, 'utf8');

  // 4) 删除 assets 目录（内容已全部内联）
  const assetsDir = resolve(DIST, 'assets');
  try {
    await stat(assetsDir);
    await rm(assetsDir, { recursive: true, force: true });
  } catch {
    /* 没有 assets 目录，忽略 */
  }

  const files = await readdir(DIST);
  const size = (await stat(htmlPath)).size;
  console.log(`→ 内联完成：dist/${files.join(', ')}（index.html ${(size / 1024).toFixed(1)} KB）`);
}

main().catch((e) => {
  console.error('内联失败：', e);
  process.exit(1);
});
