/**
 * 线上验收 · 第七轮（主页分类切换与键盘焦点，Ego 浏览器）
 * 背景：homepage flow 的 e5a0e77「Preserve keyboard focus when switching gallery categories」
 *       改了 hall/assets/hall.js —— 发布后须确认大厅仍全绿且分类切换不丢焦点。
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'online-evidence', 'ego');
const BASE = 'https://kingkazmax.github.io/playtime-atlas-20261021';
await fs.mkdir(OUT, { recursive: true });

const task = await taskSpace('playtime-atlas-online-qa');
const out = { ranAt: new Date().toISOString(), taskSpaceId: task.spaceId };

const p = await task.newPage();
await p.cdp('Network.enable', {});
await p.cdp('Log.enable', {});
await p.cdp('Runtime.enable', {});
await p.goto(`${BASE}/`);
await p.waitForLoadState({ timeout: 20000 }).catch(() => {});
await p.waitForTimeout(3000);

const before = await p.evaluate(() => ({
  entries: document.querySelectorAll('[class*=card],[class*=item],[class*=tile]').length,
  covers: document.querySelectorAll('img').length,
  controls: [...document.querySelectorAll('button,[role=button],[data-cat],[data-filter]')]
    .map((b) => ({ text: (b.innerText || b.textContent || '').trim().slice(0, 18), tag: b.tagName }))
    .filter((b) => b.text).slice(0, 12),
}));

// 点一个分类控件（若有），观察条目数与焦点
let switched = null;
for (const label of before.controls.map((c) => c.text)) {
  if (!label || /搜索|search/i.test(label)) continue;
  try {
    await p.click(`text="${label}"`, { timeout: 3000 });
    await p.waitForTimeout(1200);
    switched = await p.evaluate(() => ({
      activeTag: document.activeElement ? document.activeElement.tagName : null,
      activeText: (document.activeElement?.innerText || document.activeElement?.textContent || '').trim().slice(0, 20),
      hasFocusRing: (() => {
        const el = document.activeElement;
        if (!el || el === document.body) return false;
        const cs = getComputedStyle(el);
        return (cs.outlineStyle !== 'none' && parseFloat(cs.outlineWidth || '0') > 0) || (cs.boxShadow && cs.boxShadow !== 'none');
      })(),
      entries: document.querySelectorAll('[class*=card],[class*=item],[class*=tile]').length,
    }));
    if (switched) break;
  } catch { /* 试下一个 */ }
}
out.hall = {
  before,
  switched,
  after: await p.evaluate(() => ({
    entries: document.querySelectorAll('[class*=card],[class*=item],[class*=tile]').length,
    covers: document.querySelectorAll('img').length,
    brokenCovers: [...document.querySelectorAll('img')].filter((i) => i.complete && i.naturalWidth === 0).length,
    anchors: document.querySelectorAll('a').length,
  })),
};
const evs = await p.events();
out.hall.consoleErrors = evs.filter((e) => e.method === 'Log.entryAdded' && e.params?.entry?.level === 'error').map((e) => e.params.entry.text);
out.hall.http4xx5xx = evs.filter((e) => e.method === 'Network.responseReceived' && (e.params?.response?.status || 0) >= 400)
  .map((e) => ({ status: e.params.response.status, url: e.params.response.url }));
out.hall.screenshot = await p.screenshot({ path: path.join(OUT, 'hall-category-switch.png') });

// 关键路径复核
const probe = await task.newPage();
await probe.goto(`${BASE}/`);
out.paths = [];
for (const u of ['qa/', 'research/catalog.html', 'works/00-research-dossier/', 'works/16-design-system/',
  'works/17-architecture-research/', 'works/18-architecture-models/', 'favicon.ico',
  'assets/ds/tokens.css', 'works/06-museum-main/art/assets/fonts/fonts.css', 'data/works.json']) {
  const r = await probe.fetch(`${BASE}/${u}`, { timeout: 15000 }).catch(() => ({ status: 0 }));
  out.paths.push({ path: u, status: r.status });
}
await probe.close();

await fs.writeFile(path.join(OUT, 'verify-round7.json'), JSON.stringify(out, null, 2) + '\n');
console.log('第七轮证据已写入');
console.log('大厅:', JSON.stringify(out.hall.before.entries), '条 →', JSON.stringify(out.hall.after.entries),
  '封面', out.hall.after.brokenCovers + '/' + out.hall.after.covers, 'broken',
  'console=' + out.hall.consoleErrors.length, '4xx=' + out.hall.http4xx5xx.length);
console.log('分类切换:', JSON.stringify(out.hall.switched));
console.log('路径:', out.paths.map((x) => x.status + ' ' + x.path).join(' | '));
await task.finish({ keep: [] });
