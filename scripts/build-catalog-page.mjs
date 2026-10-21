#!/usr/bin/env node
/**
 * 博物馆策展目录页生成器
 *
 * 数据来源（任选其一，优先前者）：
 *   1. apps/museum-catalog/catalog.json          —— 05 交付的全量目录
 *   2. apps/museum-catalog/data/raw_sources.json + apps/museum-catalog/data/curated/part*.json
 *
 * 上游数据缺失时以非零码退出 —— 大厅据此把该条标记为“未就绪”，不生成空壳页面。
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');
const APP = path.join(ROOT, 'apps', '05-museum-catalog');
const OUT_DIR = path.join(ROOT, 'docs', 'research');
const OUT = path.join(OUT_DIR, 'catalog.html');

const esc = (s) =>
  String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const ERA_LABEL = {
  origins: '1950—1969 早期电子',
  arcade: '1970—1979 街机',
  home8bit: '1980—1989 家用 8 位',
  console16: '1990—1999 16 位与主机',
  online: '2000—2009 网络时代',
  mobile: '2010—2014 移动时代',
  modern: '2015—2026 现代与 VR',
};

const KIND_LABEL = { hardware: '硬件', work: '作品', platform: '平台' };

/** 归一化不同上游的数据形态为统一条目 */
function normalize(raw) {
  const id = raw.id;
  const year = raw.year ?? raw.expected_year ?? raw.releaseYear ?? null;
  const era = raw.era ?? null;
  const platform = raw.platform ?? raw.expected_platform ?? '—';
  const creator = raw.creator ?? raw.expected_creator ?? '—';
  const urls = Array.isArray(raw.sourceUrls) && raw.sourceUrls.length ? raw.sourceUrls : raw.url ? [raw.url] : [];
  return {
    id,
    title: raw.title ?? raw.canonical_title ?? raw.resolved_title ?? raw.titleZh ?? id,
    titleZh: raw.titleZh ?? null,
    year,
    era,
    kind: raw.kind ?? 'work',
    platform,
    creator,
    summary: raw.summary ?? null,
    significance: raw.significance ?? null,
    sourceUrls: urls,
    imageLicense: raw.imageLicense ?? 'no-image',
    status: raw.status ?? null,
    checks: raw.checks ?? null,
    lead: raw.lead ?? null,
  };
}

function loadItems() {
  // 1) 统一目录
  const unified = path.join(APP, 'catalog.json');
  if (fs.existsSync(unified)) {
    const j = JSON.parse(fs.readFileSync(unified, 'utf8'));
    const arr = Array.isArray(j) ? j : j.items || j.catalog || [];
    if (arr.length) return { items: arr.map(normalize), from: 'catalog.json' };
  }

  // 2) 研究数据 + 策展文本 合并
  const rawPath = path.join(APP, 'data', 'raw_sources.json');
  if (!fs.existsSync(rawPath)) return null;
  const raw = JSON.parse(fs.readFileSync(rawPath, 'utf8'));
  const rawArr = Array.isArray(raw) ? raw : raw.items || [];
  if (!rawArr.length) return null;

  const curated = {};
  const curatedDir = path.join(APP, 'data', 'curated');
  if (fs.existsSync(curatedDir)) {
    for (const f of fs.readdirSync(curatedDir).filter((x) => x.endsWith('.json'))) {
      const part = JSON.parse(fs.readFileSync(path.join(curatedDir, f), 'utf8'));
      const arr = Array.isArray(part) ? part : Object.entries(part).map(([id, v]) => ({ id, ...v }));
      for (const it of arr) curated[it.id] = { ...(curated[it.id] || {}), ...it };
    }
  }

  const items = rawArr.map((r) => normalize({ ...r, ...(curated[r.id] || {}) }));
  return { items, from: 'data/raw_sources.json + data/curated/' };
}

function main() {
  const loaded = loadItems();
  if (!loaded) {
    console.error('[catalog] 上游目录数据尚未交付：', path.relative(ROOT, APP));
    process.exit(1);
  }
  const items = loaded.items;

  const eras = [...new Set(items.map((i) => i.era).filter(Boolean))];
  const kinds = [...new Set(items.map((i) => i.kind).filter(Boolean))];

  const cards = items
    .map((it) => {
      const srcHtml = it.sourceUrls.length
        ? it.sourceUrls
            .map((u) => `<li><a href="${esc(u)}" target="_blank" rel="noopener noreferrer">${esc(u)}</a></li>`)
            .join('')
        : '<li>该条目尚未附来源链接</li>';
      const summary =
        it.summary ||
        (it.lead ? esc(it.lead).slice(0, 260) + '…' : '—');
      const verified = it.checks && (it.checks.year_match_infobox || it.checks.lead_found) ? '来源已核验' : '来源待复核';
      return `
    <details class="card" data-era="${esc(it.era || '')}" data-kind="${esc(it.kind || '')}" data-text="${esc(
      [it.title, it.titleZh, it.creator, it.platform, it.summary].filter(Boolean).join(' ').toLowerCase()
    )}">
      <summary>
        <span class="no">${esc(it.year || '—')}</span>
        <span class="nm">${esc(it.titleZh || it.title)}</span>
        <span class="me">${esc(KIND_LABEL[it.kind] || it.kind || '')} · ${esc(it.platform || '').slice(0, 28)}</span>
      </summary>
      <div class="cbody">
        <dl class="kv">
          <div><dt>年代</dt><dd>${esc(it.year || '—')} · ${esc(ERA_LABEL[it.era] || it.era || '—')}</dd></div>
          <div><dt>类型</dt><dd>${esc(KIND_LABEL[it.kind] || it.kind || '—')}</dd></div>
          <div><dt>平台 / 载体</dt><dd>${esc(it.platform)}</dd></div>
          <div><dt>厂商 / 个人</dt><dd>${esc(it.creator)}</dd></div>
          <div><dt>配图许可状态</dt><dd>${esc(it.imageLicense)}</dd></div>
          <div><dt>核验状态</dt><dd>${esc(verified)}</dd></div>
        </dl>
        <div><h4>事实描述</h4><p>${summary}</p></div>
        ${it.significance ? `<div><h4>入馆意义</h4><p>${esc(it.significance)}</p></div>` : ''}
        <div><h4>来源</h4><ul>${srcHtml}</ul></div>
      </div>
    </details>`;
    })
    .join('\n');

  const eraChips = eras
    .map(
      (e) =>
        `<button class="chip" type="button" data-era="${esc(e)}" aria-pressed="false">${esc(ERA_LABEL[e] || e)}</button>`
    )
    .join('');

  const kindChips = kinds
    .map((k) => `<button class="chip" type="button" data-kind="${esc(k)}" aria-pressed="false">${esc(KIND_LABEL[k] || k)}</button>`)
    .join('');

  const html = `<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>博物馆策展目录 · CATALOG | PLAYTIME ATLAS</title>
<meta name="description" content="1950s 实验电子到 2020s VR 与独立游戏的代表硬件与作品目录，逐条附年代、平台、厂商、来源与许可状态。" />
<meta name="theme-color" content="#0a1020" />
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='6' fill='%230a1020'/%3E%3Ccircle cx='16' cy='16' r='9' fill='none' stroke='%23ff6a2b' stroke-width='2'/%3E%3Ccircle cx='16' cy='16' r='3' fill='%234fd6e8'/%3E%3C/svg%3E" />
<link rel="stylesheet" href="../assets/page.css" />
<style>
  .toolbar { display:flex; gap:10px; flex-wrap:wrap; align-items:center; margin-bottom:20px; }
  .chip { padding:7px 13px; border:1px solid rgba(243,237,225,.13); border-radius:100px;
          background:rgba(255,255,255,.03); color:#97a0b6; font:500 12px/1 var(--sans);
          cursor:pointer; transition:all .15s ease; }
  .chip:hover { color:#f3ede1; border-color:rgba(243,237,225,.3); }
  .chip[aria-pressed="true"] { background:#ff6a2b; border-color:#ff6a2b; color:#180d05; font-weight:600; }
  .chip[data-kind][aria-pressed="true"] { background:#4fd6e8; border-color:#4fd6e8; color:#06202a; }
  .searchbox { flex:1; min-width:220px; padding:9px 13px; border:1px solid rgba(243,237,225,.13);
               border-radius:3px; background:rgba(255,255,255,.03); color:#dfe4ef; font:14px var(--sans); outline:none; }
  .searchbox:focus { border-color:#ff6a2b; }
  .count { font:500 11px/1 var(--mono); letter-spacing:.14em; color:#626c83; text-transform:uppercase; }
</style>
</head>
<body>
<div class="wrap">
  <nav class="crumbs"><a href="../">← 作品总廊</a><span>/</span><span>策展目录</span></nav>

  <header class="phead">
    <p class="kicker">CATALOG</p>
    <h1>博物馆策展目录</h1>
    <p class="sub">1950s EXPERIMENTAL → 2020s VR &amp; INDIE</p>
    <p class="desc">共 <b>${items.length}</b> 条代表条目，覆盖 ${eras.length} 个时代，每条附年代、平台、厂商、事实描述与来源链接。<b>本目录为代表性选样，不宣称穷尽任何时代。</b></p>
  </header>

  <div class="toolbar">
    <input class="searchbox" id="q" type="search" placeholder="搜索条目 / 厂商 / 平台…" autocomplete="off" />
    <button class="chip" type="button" data-era="" aria-pressed="true">全部时代</button>
    ${eraChips}
    <button class="chip" type="button" data-kind="" aria-pressed="true">全部类型</button>
    ${kindChips}
    <span class="count" id="count">显示 ${items.length} / ${items.length}</span>
  </div>

  <div id="list">${cards}</div>

  <div class="panel info">
    <h3>关于本目录</h3>
    <p>条目按<b>官方 / 馆方 / 一手来源</b>优先确认，百科类仅作交叉核对并记为次级源。所有配图均为程序化抽象图形，<b>不使用商业游戏截帧、品牌 logo 或商标字体</b>。引用第三方站点仅作文本研究引用，<b>引用不等于授权</b>。</p>
  </div>

  <footer class="foot">
    <p>PLAYTIME ATLAS · 回响电玩馆 — 策展目录</p>
    <p>数据源：${esc(loaded.from)} · 生成于 ${new Date().toISOString().slice(0, 19).replace('T', ' ')} UTC · 部署总控 14-publish</p>
  </footer>
</div>

<script>
(function () {
  var q = document.getElementById('q');
  var count = document.getElementById('count');
  var eraChips = Array.prototype.slice.call(document.querySelectorAll('.chip[data-era]'));
  var kindChips = Array.prototype.slice.call(document.querySelectorAll('.chip[data-kind]'));
  var cards = Array.prototype.slice.call(document.querySelectorAll('#list .card'));
  var total = cards.length;
  var era = '', kind = '';

  function apply() {
    var term = q.value.trim().toLowerCase();
    var shown = 0;
    cards.forEach(function (c) {
      var okEra = !era || c.dataset.era === era;
      var okKind = !kind || c.dataset.kind === kind;
      var okTerm = !term || (c.dataset.text || '').indexOf(term) > -1;
      var show = okEra && okKind && okTerm;
      c.style.display = show ? '' : 'none';
      if (show) shown++;
    });
    count.textContent = '显示 ' + shown + ' / ' + total;
  }

  eraChips.forEach(function (chip) {
    chip.addEventListener('click', function () {
      eraChips.forEach(function (c) { c.setAttribute('aria-pressed', 'false'); });
      chip.setAttribute('aria-pressed', 'true');
      era = chip.dataset.era || '';
      apply();
    });
  });
  kindChips.forEach(function (chip) {
    chip.addEventListener('click', function () {
      kindChips.forEach(function (c) { c.setAttribute('aria-pressed', 'false'); });
      chip.setAttribute('aria-pressed', 'true');
      kind = chip.dataset.kind || '';
      apply();
    });
  });
  q.addEventListener('input', apply);
})();
</script>
</body>
</html>
`;

  fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.writeFileSync(OUT, html);
  console.log('[catalog] 生成', path.relative(ROOT, OUT), `(${items.length} 条，来源 ${loaded.from})`);
}

main();
