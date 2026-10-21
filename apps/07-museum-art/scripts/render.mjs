/**
 * 回响电玩馆 — 光栅化器
 * 用本地静态服务器 + Playwright/Chromium 把 SVG 与 3D 模型渲染为 PNG。
 *
 * 运行：node scripts/render.mjs [target...]
 *   target 可选：posters | covers | cases | models | tech | all
 */

import { chromium } from 'playwright';
import { existsSync, mkdirSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { startServer } from './lib/server.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');
const ASSETS = path.join(ROOT, 'public', 'assets');

const target = process.argv[2] || 'all';
const want = (name) => target === 'all' || target === name;

async function renderSVGSet(page, base, dir, nameFilter = (f) => f.endsWith('.svg')) {
  const abs = path.join(ASSETS, dir);
  if (!existsSync(abs)) return 0;
  const files = readdirSync(abs).filter(nameFilter).sort();
  let n = 0;
  for (const f of files) {
    const url = `${base}/public/assets/${dir}/${f}`;
    await page.goto(url, { waitUntil: 'load', timeout: 120000 });
    await page.evaluate(async () => {
      await document.fonts.ready;
      const imgs = [...document.querySelectorAll('image')];
      await Promise.all(imgs.map((i) => (i.decode ? i.decode().catch(() => {}) : null)));
    });
    const el = await page.$('svg');
    if (!el) {
      console.warn(`  ⚠ ${f}: 未找到 svg 根元素`);
      continue;
    }
    const box = await el.boundingBox();
    const out = path.join(abs, f.replace(/\.svg$/, '.png'));
    await el.screenshot({ path: out, ...(box ? {} : {}) });
    const kb = (statSync(out).size / 1024).toFixed(0);
    console.log(`  ✓ ${dir}/${f.replace(/\.svg$/, '.png')}  ${kb} KB`);
    n++;
  }
  return n;
}

async function renderModels(page, base) {
  const dir = path.join(ASSETS, 'models');
  if (!existsSync(dir)) return 0;
  const ids = readdirSync(dir)
    .filter((f) => f.endsWith('.glb'))
    .map((f) => f.replace(/^model-/, '').replace(/\.glb$/, ''))
    .sort();
  let n = 0;
  for (const id of ids) {
    let state = null;
    for (let attempt = 0; attempt < 2 && state !== true; attempt++) {
    await page.goto(`${base}/scripts/render/model.html?id=${id}`, { waitUntil: 'load', timeout: 120000 });
    state = await page
      .waitForFunction(() => window.__READY__ !== undefined, null, { timeout: 150000 })
      .then(() => page.evaluate(() => window.__READY__))
      .catch(() => 'timeout');
    if (state !== true) {
      console.warn(`  ⚠ 模型渲染重试：${id} (attempt ${attempt + 1}, ${state})`);
      await page.waitForTimeout(1500);
    }
    }
    if (state !== true) {
      console.warn(`  ✗ 模型渲染失败：${id} (${state})`);
      continue;
    }
    const out = path.join(dir, `model-${id}.png`);
    await page.locator('canvas').screenshot({ path: out });
    const kb = (statSync(out).size / 1024).toFixed(0);
    console.log(`  ✓ models/model-${id}.png  ${kb} KB`);
    n++;
  }
  return n;
}

async function main() {
  const { server, port } = await startServer(ROOT, 0);
  const base = `http://127.0.0.1:${port}`;
  console.log(`· 本地服务 ${base}`);

  const browser = await chromium.launch({
    args: [
      '--enable-unsafe-swiftshader',
      '--use-angle=swiftshader',
      '--disable-dev-shm-usage',
      '--no-sandbox',
      '--disable-background-timer-throttling',
      '--disable-backgrounding-occluded-windows',
    ],
  });
  const page = await browser.newPage({
    viewport: { width: 1280, height: 1280 },
    deviceScaleFactor: 1,
  });
  page.on('pageerror', (e) => console.warn('  ! page error:', e.message));

  let total = 0;
  try {
    if (want('posters')) {
      console.log('· 光栅化年代海报');
      total += await renderSVGSet(page, base, 'posters', (f) => f.startsWith('poster-') && f.endsWith('.svg'));
    }
    if (want('covers')) {
      console.log('· 光栅化年代封面');
      total += await renderSVGSet(page, base, 'covers', (f) => f.startsWith('cover-') && f.endsWith('.svg'));
    }
    if (want('cases')) {
      console.log('· 光栅化展柜');
      total += await renderSVGSet(page, base, 'cases', (f) => f.endsWith('.svg'));
    }
    if (want('tech')) {
      console.log('· 光栅化技术插画降级图');
      total += await renderSVGSet(page, base, 'models', (f) => f.endsWith('.tech.svg'));
    }
    if (want('fallback')) {
      console.log('· 光栅化降级图');
      total += await renderSVGSet(page, base, 'fallback', (f) => f.endsWith('.svg'));
    }
    if (want('models')) {
      console.log('· 渲染 3D 硬件模型');
      total += await renderModels(page, base);
    }
  } finally {
    await browser.close();
    server.close();
  }
  console.log(`\n✓ 光栅化完成，共 ${total} 个文件`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
