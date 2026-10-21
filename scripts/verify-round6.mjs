/**
 * 线上验收 · 第六轮（归档深链上线后终检，Ego 浏览器）
 *
 * 核验：/qa/、/research/catalog.html、/works/00-research-dossier/ 三条深链是否可达且功能可用；
 *      大厅是否仍为 11 件、11 张真实封面、零 console error；站点根关键资源是否仍 200。
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'online-evidence', 'ego');
const BASE = 'https://kingkazmax.github.io/playtime-atlas-20261021';
await fs.mkdir(OUT, { recursive: true });

const task = await taskSpace('playtime-atlas-online-qa');
const out = { ranAt: new Date().toISOString(), taskSpaceId: task.spaceId, base: BASE };

/* 1) 路径可达性（状态码） */
const probe = await task.newPage();
await probe.goto(`${BASE}/`);
out.paths = [];
for (const p of [
  'qa/', 'research/catalog.html',
  'works/00-research-dossier/', 'works/16-design-system/',
  'works/17-architecture-research/', 'works/18-architecture-models/',
  'favicon.ico', 'assets/ds/tokens.css', 'assets/ds/fonts/fonts.css',
  'works/06-museum-main/art/assets/fonts/fonts.css',
  'data/works.json', 'assets/gallery-covers/01-chroma-s1.webp',
]) {
  const r = await probe.fetch(`${BASE}/${p}`, { timeout: 15000 }).catch((e) => ({ status: 0, error: String(e.message || e) }));
  out.paths.push({ path: p, status: r.status, bytes: (r.body || '').length || undefined });
}
await probe.close();

/* 2) 页面级功能核验 */
async function inspect(url, label) {
  const p = await task.newPage();
  try {
    await p.cdp('Network.enable', {});
    await p.cdp('Log.enable', {});
    await p.cdp('Runtime.enable', {});
    await p.goto(url);
    await p.waitForLoadState({ timeout: 20000 }).catch(() => {});
    await p.waitForTimeout(2800);
    const evs = await p.events();
    const health = {
      consoleErrors: evs.filter((e) => e.method === 'Log.entryAdded' && e.params?.entry?.level === 'error').map((e) => e.params.entry.text),
      http4xx5xx: evs.filter((e) => e.method === 'Network.responseReceived' && (e.params?.response?.status || 0) >= 400)
        .map((e) => ({ status: e.params.response.status, url: e.params.response.url })),
    };
    const dom = await p.evaluate(() => ({
      title: document.title,
      textLen: (document.body?.innerText || '').length,
      items: document.querySelectorAll('[class*=card],[class*=item],[class*=row],li,article,tr').length,
      links: document.querySelectorAll('a').length,
      inputs: document.querySelectorAll('input,select').length,
      imgs: document.querySelectorAll('img').length,
      brokenImgs: [...document.querySelectorAll('img')].filter((i) => i.complete && i.naturalWidth === 0).length,
    }));
    // 搜索/筛选可用性：输入一个词，看可见条目是否减少
    let search = null;
    if (dom.inputs > 0) {
      const before = await p.evaluate(() => [...document.querySelectorAll('[class*=card],[class*=item],[class*=row],li,article,tr')].filter((n) => n.offsetParent !== null).length);
      const typed = await p.evaluate(() => {
        const el = document.querySelector('input[type=search],input[type=text],input:not([type]),select');
        if (!el) return false;
        if (el.tagName === 'SELECT') {
          el.selectedIndex = Math.min(1, el.options.length - 1);
          el.dispatchEvent(new Event('change', { bubbles: true }));
        } else {
          el.value = '塔';
          el.dispatchEvent(new Event('input', { bubbles: true }));
          el.dispatchEvent(new Event('change', { bubbles: true }));
        }
        return true;
      });
      await p.waitForTimeout(900);
      const after = await p.evaluate(() => [...document.querySelectorAll('[class*=card],[class*=item],[class*=row],li,article,tr')].filter((n) => n.offsetParent !== null).length);
      search = { typed, before, after, filtered: after < before };
    }
    const shot = path.join(OUT, `${label}.png`);
    await p.screenshot({ path: shot });
    return { label, url: await p.url(), health, dom, search, screenshot: shot };
  } finally {
    await p.close().catch(() => {});
  }
}

out.pages = [];
for (const [label, url] of [
  ['catalog-05', `${BASE}/research/catalog.html`],
  ['qa-13', `${BASE}/qa/`],
  ['dossier-00', `${BASE}/works/00-research-dossier/`],
  ['hall', `${BASE}/`],
]) {
  out.pages.push(await inspect(url, label));
}

await fs.writeFile(path.join(OUT, 'verify-round6.json'), JSON.stringify(out, null, 2) + '\n');
console.log('第六轮证据已写入');
console.log('路径状态:'); for (const p of out.paths) console.log(`  ${p.status} ${p.path}`);
for (const p of out.pages) {
  console.log(`  ${p.label}: console=${p.health.consoleErrors.length} 4xx=${p.health.http4xx5xx.length} items=${p.dom.items} imgs=${p.dom.brokenImgs}/${p.dom.imgs} broken inputs=${p.dom.inputs} search=${JSON.stringify(p.search)}`);
}
await task.finish({ keep: [] });
