#!/usr/bin/env node
/**
 * 博物馆策展目录页 · 生成器
 * 归属：05-museum-research（本页源码 owner）
 *
 * 输入：../../catalog.json（139 条，本目录自产）
 * 输出：../../dist/catalog.html + ../../dist/catalog.css + ../../dist/assets/ds/**
 *
 * 设计规范（16-design-system，2026-10-21 定稿）：
 *   · MIGRATION-NOTES §0 三步接入：tokens.css + components.css → assets/ds/；
 *     fonts/ → assets/ds/fonts/；入口注入 --ds-base，body 加 .ds-shell
 *   · G.1—G.7 通用项；§3.4 非游戏作品（.ds-work / .ds-detail 呈现）
 *   · DESIGN-SPEC §6.2：来源与许可必须在详情内可见；§7.4 搜索框 ≥44px
 *   · 15-supervisor 路由要求：139 条数据密集区**扫读效率优先于视觉统一**，
 *     因此行式列表密度按本目录既有基线保留（不压缩、不放大），只把视觉语言换成 DS。
 *   · 主题：<html data-ds-theme="light">，与 16 的 preview.html 同口径（钉住浅色，
 *     避免同一批作品在不同机器上出现两套配色）。深色主题另行验算，不作为默认。
 *
 * 用法：node src/catalog-page/build-catalog-page.mjs
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..', '..');
const SRC_CATALOG = path.join(ROOT, 'catalog.json');
const OUT_DIR = path.join(ROOT, 'dist');
const OUT_HTML = path.join(OUT_DIR, 'catalog.html');
const OUT_CSS = path.join(OUT_DIR, 'catalog.css');
const CSS_SRC = path.join(HERE, 'catalog.css');
const DS_DIR = path.join(HERE, 'assets', 'ds');
const OUT_DS_DIR = path.join(OUT_DIR, 'assets', 'ds');

/** 线上 Pages 根路径（DESIGN-SPEC §10.2 / MIGRATION-NOTES §0.3） */
const DS_BASE = '/playtime-atlas-20261021/';

/**
 * era 筛选器文案。
 * ⚠️ 口径说明：catalog.json 的 `eraLabel`（如「1950—1969 · 光点实验」）是本目录的
 * 权威时代名；线上已发布页的 chip 文案是另一套（渲染层常量）。两套口径的对齐见
 * RESTYLE-CHECKLIST.md §5「待对齐项 A」。本轮改版**不改内容**，沿用已发布文案。
 */
const ERA_CHIP_LABEL = {
  origins: '1950—1969 早期电子',
  arcade: '1970—1979 街机',
  home8bit: '1980—1989 家用 8 位',
  console16: '1990—1999 16 位与主机',
  online: '2000—2009 网络时代',
  mobile: '2010—2014 移动时代',
  modern: '2015—2026 现代与 VR',
};

const KIND_CHIP_LABEL = { hardware: '硬件', work: '作品', platform: '平台' };

const esc = (s) =>
  String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

/** 归一化：只保证页面需要的字段存在，不改写事实内容 */
function normalize(raw) {
  return {
    id: raw.id,
    title: raw.title ?? raw.titleZh ?? raw.id,
    titleZh: raw.titleZh ?? null,
    year: raw.year ?? null,
    era: raw.era ?? null,
    kind: raw.kind ?? 'work',
    platform: raw.platform ?? '—',
    creator: raw.creator ?? '—',
    summary: raw.summary ?? null,
    significance: raw.significance ?? null,
    sourceUrls: Array.isArray(raw.sourceUrls) ? raw.sourceUrls : [],
    imageLicense: raw.imageLicense ?? 'no-image',
    verification: raw.verification ?? null,
  };
}

function loadItems() {
  if (!fs.existsSync(SRC_CATALOG)) {
    console.error('[catalog] 找不到上游目录数据：', path.relative(ROOT, SRC_CATALOG));
    process.exit(1);
  }
  const j = JSON.parse(fs.readFileSync(SRC_CATALOG, 'utf8'));
  const arr = Array.isArray(j) ? j : j.items || j.catalog || [];
  if (!arr.length) {
    console.error('[catalog] catalog.json 为空，拒绝生成空壳页面');
    process.exit(1);
  }
  return arr.map(normalize);
}

/** 核验状态：优先用 verification.status（ok / ok-article / ok-infobox / review） */
function verifyLabel(it) {
  const st = it.verification && it.verification.status;
  if (st === 'ok' || st === 'ok-article' || st === 'ok-infobox') return '来源已核验';
  return '来源待复核';
}

function buildCard(it, index) {
  const srcHtml = it.sourceUrls.length
    ? it.sourceUrls
        .map(
          (u, i) =>
            `<li><span class="ds-detail__caption"><b>S${String(i + 1).padStart(2, '0')}</b>` +
            `<a href="${esc(u)}" target="_blank" rel="noopener noreferrer">${esc(u)}</a></span></li>`
        )
        .join('')
    : '<li><span class="ds-detail__caption">该条目尚未附来源链接</span></li>';

  const summary = it.summary || '—';
  const searchText = [it.title, it.titleZh, it.creator, it.platform, it.summary]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  const srcCount = it.sourceUrls.length;

  return `
    <details class="ds-catalog__item" data-era="${esc(it.era || '')}" data-kind="${esc(it.kind || '')}" data-text="${esc(searchText)}">
      <summary class="ds-catalog__row">
        <span class="ds-mono ds-catalog__year">${esc(it.year ?? '—')}</span>
        <span class="ds-catalog__name">${esc(it.titleZh || it.title)}</span>
        <span class="ds-mono ds-catalog__meta">${esc(KIND_CHIP_LABEL[it.kind] || it.kind)} · ${esc(it.platform).slice(0, 28)} · ${srcCount} 来源</span>
      </summary>
      <div class="ds-catalog__body">
        <dl class="ds-catalog__kv">
          <div><dt>年代</dt><dd>${esc(it.year ?? '—')} · ${esc(ERA_CHIP_LABEL[it.era] || it.era || '—')}</dd></div>
          <div><dt>类型</dt><dd>${esc(KIND_CHIP_LABEL[it.kind] || it.kind)}</dd></div>
          <div><dt>平台 / 载体</dt><dd>${esc(it.platform)}</dd></div>
          <div><dt>厂商 / 个人</dt><dd>${esc(it.creator)}</dd></div>
          <div><dt>配图许可状态</dt><dd>${esc(it.imageLicense)}</dd></div>
          <div><dt>核验状态</dt><dd>${esc(verifyLabel(it))}</dd></div>
        </dl>
        <div class="ds-detail__body">
          <h3>事实描述</h3>
          <p class="ds-body">${esc(summary)}</p>
          ${it.significance ? `<h3>入馆意义</h3><p class="ds-body">${esc(it.significance)}</p>` : ''}
          <h3>来源</h3>
          <ul class="ds-catalog__sources">${srcHtml}</ul>
        </div>
      </div>
    </details>`;
}

function buildHtml(items) {
  const eras = [...new Set(items.map((i) => i.era).filter(Boolean))];
  const kinds = [...new Set(items.map((i) => i.kind).filter(Boolean))];
  const cards = items.map(buildCard).join('\n');

  const eraChips = eras
    .map((e) => `<button class="ds-chip" type="button" data-era="${esc(e)}" aria-pressed="false">${esc(ERA_CHIP_LABEL[e] || e)}</button>`)
    .join('');
  const kindChips = kinds
    .map((k) => `<button class="ds-chip" type="button" data-kind="${esc(k)}" aria-pressed="false">${esc(KIND_CHIP_LABEL[k] || k)}</button>`)
    .join('');

  const generatedAt = new Date().toISOString().slice(0, 19).replace('T', ' ');

  return `<!doctype html>
<html lang="zh-CN" data-ds-theme="light">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>博物馆策展目录 · CATALOG | PLAYTIME ATLAS</title>
<meta name="description" content="1950s 实验电子到 2020s VR 与独立游戏的代表硬件与作品目录，逐条附年代、平台、厂商、来源与许可状态。" />
<meta name="theme-color" content="#fcfbf9" />
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='7' fill='%23fcfbf9'/%3E%3Ccircle cx='16' cy='16' r='9' fill='none' stroke='%23b4432b' stroke-width='2'/%3E%3Ccircle cx='16' cy='16' r='3' fill='%232e6a5e'/%3E%3C/svg%3E" />
<style>:root { --ds-base: "${DS_BASE}"; }</style>
<link rel="stylesheet" href="../assets/ds/tokens.css" />
<link rel="stylesheet" href="../assets/ds/components.css" />
<link rel="stylesheet" href="../assets/ds/fonts/fonts.css" />
<link rel="stylesheet" href="./catalog.css" />
</head>
<body class="ds-shell">
<a class="ds-skip" href="#catalog-list">跳到条目列表</a>

<header class="ds-topbar">
  <a class="ds-topbar__brand" href="../">PLAYTIME ATLAS</a>
  <nav class="ds-topbar__nav" aria-label="站内导航">
    <a class="ds-topbar__link" href="../">作品总廊</a>
    <a class="ds-topbar__link" href="./catalog.html" aria-current="page">策展目录</a>
  </nav>
</header>

<main>
  <section class="ds-container ds-catalog__head">
    <p class="ds-caps ds-catalog__kicker">CATALOG</p>
    <h1 class="ds-h1 ds-catalog__title">博物馆策展目录</h1>
    <p class="ds-lead ds-catalog__sub">1950s EXPERIMENTAL → 2020s VR &amp; INDIE</p>
    <p class="ds-body ds-catalog__desc">共 <b>${items.length}</b> 条代表条目，覆盖 ${eras.length} 个时代，每条附年代、平台、厂商、事实描述与来源链接。<b>本目录为代表性选样，不宣称穷尽任何时代。</b></p>
  </section>

  <section class="ds-container ds-catalog__toolbar" aria-label="检索与筛选">
    <div class="ds-field ds-catalog__search">
      <label class="ds-field__label" for="q">关键词</label>
      <input class="ds-input" id="q" type="search" placeholder="搜索条目 / 厂商 / 平台…" autocomplete="off" />
    </div>
    <div class="ds-filters ds-catalog__filters" role="group" aria-label="按时代筛选">
      <button class="ds-chip" type="button" data-era="" aria-pressed="true">全部时代</button>
      ${eraChips}
    </div>
    <div class="ds-filters ds-catalog__filters" role="group" aria-label="按类型筛选">
      <button class="ds-chip" type="button" data-kind="" aria-pressed="true">全部类型</button>
      ${kindChips}
    </div>
    <p class="ds-mono ds-catalog__count" id="count" role="status" aria-live="polite">显示 ${items.length} / ${items.length}</p>
  </section>

  <section class="ds-container ds-catalog__list" id="catalog-list">
    ${cards}
  </section>

  <section class="ds-container ds-catalog__about">
    <div class="ds-detail__body">
      <h3>关于本目录</h3>
      <p class="ds-body">条目按<b>官方 / 馆方 / 一手来源</b>优先确认，百科类仅作交叉核对并记为次级源。所有配图均为程序化抽象图形，<b>不使用商业游戏截帧、品牌 logo 或商标字体</b>。引用第三方站点仅作文本研究引用，<b>引用不等于授权</b>。</p>
    </div>
  </section>
</main>

<footer class="ds-footer">
  <div class="ds-container ds-footer__row">
    <p>PLAYTIME ATLAS · 回响电玩馆 — 策展目录</p>
    <div class="ds-footer__links">
      <a href="../">作品总廊</a>
      <a href="../data/works.json">works.json</a>
    </div>
  </div>
  <div class="ds-container ds-footer__row">
    <p class="ds-mono">数据源：05-museum-research/catalog.json · 生成于 ${generatedAt} UTC · 源码归属 05-museum-research</p>
  </div>
</footer>

<script>
(function () {
  var q = document.getElementById('q');
  var count = document.getElementById('count');
  var eraChips = Array.prototype.slice.call(document.querySelectorAll('.ds-chip[data-era]'));
  var kindChips = Array.prototype.slice.call(document.querySelectorAll('.ds-chip[data-kind]'));
  var cards = Array.prototype.slice.call(document.querySelectorAll('#catalog-list .ds-catalog__item'));
  var total = cards.length;
  var era = '';
  var kind = '';

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
}

function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const e of fs.readdirSync(src, { withFileTypes: true })) {
    if (e.isDirectory()) copyDir(path.join(src, e.name), path.join(dest, e.name));
    else fs.copyFileSync(path.join(src, e.name), path.join(dest, e.name));
  }
}

function main() {
  const items = loadItems();

  if (!fs.existsSync(DS_DIR)) {
    console.error('[catalog] 缺少设计系统资产目录：', path.relative(ROOT, DS_DIR));
    process.exit(1);
  }

  fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.copyFileSync(CSS_SRC, OUT_CSS);
  // 设计系统资产随页面一起分发：dist/assets/ds/** → 发布根 docs/assets/ds/**
  fs.rmSync(OUT_DS_DIR, { recursive: true, force: true });
  copyDir(DS_DIR, OUT_DS_DIR);
  fs.writeFileSync(OUT_HTML, buildHtml(items), 'utf8');

  console.log(
    `[catalog] 生成 ${path.relative(ROOT, OUT_HTML)} + ${path.relative(ROOT, OUT_CSS)} + ` +
      `${path.relative(ROOT, OUT_DS_DIR)}（${items.length} 条）`
  );
}

main();
