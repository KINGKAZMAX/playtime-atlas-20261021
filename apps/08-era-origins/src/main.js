/**
 * 展厅主站入口 —— 把数据层渲染成年代长廊、差异表与来源台账，
 * 并启动序厅示波器与两件展品的动态预览。
 */

import { SOURCES, TIMELINE, DIFFERENCES } from './data/exhibits.js';
import { mountOscilloscope, mountRallyPreview, mountGravityPreview } from './ui/previews.js';

/* ---------------- 年代长廊 ---------------- */

const rail = document.getElementById('timeline-rail');
if (rail) {
  const frag = document.createDocumentFragment();
  for (const stop of TIMELINE) {
    const el = document.createElement('article');
    el.className = `stop${stop.highlight ? ' stop--key' : ''}`;

    const node = document.createElement('span');
    node.className = 'stop__node';
    el.appendChild(node);

    const year = document.createElement('div');
    year.className = 'stop__year';
    year.textContent = stop.year;
    el.appendChild(year);

    const title = document.createElement('h3');
    title.className = 'stop__title';
    title.textContent = stop.title;
    el.appendChild(title);

    const zh = document.createElement('p');
    zh.className = 'stop__zh';
    zh.textContent = stop.zh;
    el.appendChild(zh);

    const note = document.createElement('p');
    note.className = 'stop__note';
    note.textContent = stop.note;
    el.appendChild(note);

    const links = stop.sources
      .map((id) => SOURCES.find((s) => s.id === id))
      .filter(Boolean);

    if (links.length) {
      const src = document.createElement('a');
      src.className = 'stop__src';
      src.href = links[0].url;
      src.target = '_blank';
      src.rel = 'noopener noreferrer';
      src.textContent =
        links.length === 1 ? `来源 ↗ ${links[0].org}` : `来源 ↗ ${links.length} 条`;
      el.appendChild(src);
    }

    frag.appendChild(el);
  }
  rail.appendChild(frag);
}

/* ---------------- 差异表 ---------------- */

const diffBody = document.getElementById('diff-body');
if (diffBody) {
  const frag = document.createDocumentFragment();
  for (const row of DIFFERENCES) {
    const tr = document.createElement('tr');

    const tdAspect = document.createElement('td');
    tdAspect.textContent = row.aspect;

    const tdRef = document.createElement('td');
    tdRef.className = 'ref';
    tdRef.textContent = row.reference;

    const tdOurs = document.createElement('td');
    tdOurs.className = 'ours';
    tdOurs.textContent = row.ours;

    tr.append(tdAspect, tdRef, tdOurs);
    frag.appendChild(tr);
  }
  diffBody.appendChild(frag);
}

/* ---------------- 来源台账 ---------------- */

const list = document.getElementById('sources-list');
if (list) {
  const frag = document.createDocumentFragment();
  for (const src of SOURCES) {
    const article = document.createElement('article');
    article.className = 'source';

    const org = document.createElement('div');
    org.className = 'source__org';
    org.textContent = src.org;

    const main = document.createElement('div');
    const title = document.createElement('h4');
    title.className = 'source__title';
    const link = document.createElement('a');
    link.href = src.url;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.textContent = src.title;
    title.appendChild(link);
    main.appendChild(title);

    const claims = document.createElement('ul');
    claims.className = 'source__claims';
    for (const claim of src.supports) {
      const li = document.createElement('li');
      li.textContent = claim;
      claims.appendChild(li);
    }
    main.appendChild(claims);

    const meta = document.createElement('div');
    meta.className = 'source__meta';
    const kind = document.createElement('div');
    kind.textContent = src.kind;
    const verified = document.createElement('div');
    verified.className = src.verified === 'http-200' ? 'ok' : '';
    verified.textContent = src.verified === 'http-200' ? '直连取证 ✓' : '检索索引取证';
    const at = document.createElement('div');
    at.textContent = src.verifiedAt;
    meta.append(kind, verified, at);

    article.append(org, main, meta);
    frag.appendChild(article);
  }
  list.appendChild(frag);
}

/* ---------------- 取证时间戳 ---------------- */

const verifiedAt = document.getElementById('verified-at');
if (verifiedAt) {
  const dates = [...new Set(SOURCES.map((s) => s.verifiedAt))].sort();
  verifiedAt.textContent = dates.length === 1 ? dates[0] : `${dates[0]} — ${dates[dates.length - 1]}`;
}

/* ---------------- 装饰动画 ---------------- */

const hero = document.getElementById('hero-scope');
if (hero) mountOscilloscope(hero);

const prevRally = document.getElementById('preview-rally');
if (prevRally) mountRallyPreview(prevRally);

const prevGravity = document.getElementById('preview-gravity');
if (prevGravity) mountGravityPreview(prevGravity);

/* 离开页面时停掉动画循环 */
window.addEventListener('pagehide', () => {
  document.dispatchEvent(new Event('lumen-teardown'));
});
