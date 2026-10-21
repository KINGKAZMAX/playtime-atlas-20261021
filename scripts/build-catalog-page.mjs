#!/usr/bin/env node
/**
 * 博物馆策展目录页生成器
 * 输入：apps/museum-catalog/catalog.json（由 05-museum-research 交付）
 * 输出：site/research/catalog.html
 * 上游数据缺失时以非零码退出 —— 大厅据此把该条标记为“未就绪”，不生成空壳页面。
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');
const SRC = path.join(ROOT, 'apps', 'museum-catalog', 'catalog.json');
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

function main() {
  if (!fs.existsSync(SRC)) {
    console.error('[catalog] 上游 catalog.json 尚未交付：', path.relative(ROOT, SRC));
    process.exit(1);
  }
  const raw = JSON.parse(fs.readFileSync(SRC, 'utf8'));
  const items = Array.isArray(raw) ? raw : raw.items || raw.catalog || [];
  if (!Array.isArray(items) || !items.length) {
    console.error('[catalog] catalog.json 无有效条目');
    process.exit(1);
  }

  const eras = [...new Set(items.map((i) => i.era))].filter(Boolean);
  const platforms = [...new Set(items.map((i) => i.platform))].filter(Boolean);

  const cards = items
    .map((it) => {
      const sources = (it.sourceUrls || []).filter(Boolean);
      const srcHtml = sources.length
        ? sources
            .map((u) => `<li><a href="${esc(u)}" target="_blank" rel="noopener noreferrer">${esc(u)}</a></li>`)
            .join('')
        : '<li>该条目尚未附来源链接</li>';
      return `
    <details class="card" data-era="${esc(it.era || '')}" data-platform="${esc(it.platform || '')}" data-text="${esc(
      [it.title, it.creator, it.platform, it.summary].filter(Boolean).join(' ').toLowerCase()
    )}">
      <summary>
        <span class="no">${esc(it.year || '—')}</span>
        <span class="nm">${esc(it.title || '未命名条目')}</span>
        <span class="me">${esc(it.platform || '')}</span>
      </summary>
      <div class="cbody">
        <dl class="kv">
          <div><dt>年代</dt><dd>${esc(it.year || '—')} · ${esc(ERA_LABEL[it.era] || it.era || '—')}</dd></div>
          <div><dt>平台 / 载体</dt><dd>${esc(it.platform || '—')}</dd></div>
          <div><dt>厂商 / 个人</dt><dd>${esc(it.creator || '—')}</dd></div>
          <div><dt>配图许可状态</dt><dd>${esc(it.imageLicense || 'no-image')}</dd></div>
        </dl>
        <div><h4>事实描述</h4><p>${esc(it.summary || '—')}</p></div>
        <div><h4>入馆意义</h4><p>${esc(it.significance || '—')}</p></div>
        <div><h4>来源</h4>${srcHtml ? `<ul>${srcHtml}</ul>` : ''}</div>
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
    <p class="desc">共 <b>${items.length}</b> 条代表条目，覆盖 ${eras.length} 个时代，每条附年代、平台、厂商、事实描述、入馆意义与来源链接。<b>本目录为代表性选样，不宣称穷尽任何时代。</b></p>
  </header>

  <div class="toolbar">
    <input class="searchbox" id="q" type="search" placeholder="搜索条目 / 厂商 / 平台…" autocomplete="off" />
    <button class="chip" type="button" data-era="" aria-pressed="true">全部时代</button>
    ${eraChips}
    <span class="count" id="count">显示 ${items.length} / ${items.length}</span>
  </div>

  <div id="list">${cards}</div>

  <div class="panel info">
    <h3>关于本目录</h3>
    <p>条目按<b>官方 / 馆方 / 一手来源</b>优先确认，百科类仅作交叉核对并记为次级源。所有配图均为程序化抽象图形，<b>不使用商业游戏截帧、品牌 logo 或商标字体</b>。引用第三方站点仅作文本研究引用，<b>引用不等于授权</b>。</p>
  </div>

  <footer class="foot">
    <p>PLAYTIME ATLAS · 回响电玩馆 — 策展目录</p>
    <p>生成于 ${new Date().toISOString().slice(0, 19).replace('T', ' ')} UTC · 部署总控 14-publish</p>
  </footer>
</div>

<script>
(function () {
  var q = document.getElementById('q');
  var count = document.getElementById('count');
  var chips = Array.prototype.slice.call(document.querySelectorAll('.chip[data-era]'));
  var cards = Array.prototype.slice.call(document.querySelectorAll('#list .card'));
  var total = cards.length;
  var era = '';

  function apply() {
    var term = q.value.trim().toLowerCase();
    var shown = 0;
    cards.forEach(function (c) {
      var okEra = !era || c.dataset.era === era;
      var okTerm = !term || (c.dataset.text || '').indexOf(term) > -1;
      var show = okEra && okTerm;
      c.style.display = show ? '' : 'none';
      if (show) shown++;
    });
    count.textContent = '显示 ' + shown + ' / ' + total;
  }

  chips.forEach(function (chip) {
    chip.addEventListener('click', function () {
      chips.forEach(function (c) { c.setAttribute('aria-pressed', 'false'); });
      chip.setAttribute('aria-pressed', 'true');
      era = chip.dataset.era || '';
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
  console.log('[catalog] 生成', path.relative(ROOT, OUT), `(${items.length} 条)`);
}

main();
