#!/usr/bin/env node
/**
 * 构筑华夏 · 研究成果页生成器
 * 归属：17-architecture-research（本页源码 owner）
 *
 * 输入（均为本目录自产，单一数据源）：
 *   ../../catalog.json        42 条建筑案例
 *   ../../catalog.meta.json   词表 / 统计 / 限制
 *   ../../glossary.json       74 条双语术语
 *
 * 输出：
 *   ../../dist/catalog.html
 *   ../../dist/catalog.css
 *   ../../dist/assets/ds/**   （16-design-system 的 tokens / components / 自托管字体，vendored 副本）
 *
 * 设计规范（16-design-system，Afterglow v1.0.0）：
 *   · 令牌层 tokens.css + 组件层 components.css + 自托管字体 fonts/
 *   · 全部取值走 var(--ds-*)，本页不另立色板、不写死字体族
 *   · 资源路径相对化（--ds-base 相对基准），适配 GitHub Pages 子路径
 *   · <html data-ds-theme="light" data-lang="zh">，与 16 的 preview.html 同口径
 *   · 尊重 prefers-reduced-motion；中英双语同 DOM 切换；键盘可达；触达 ≥44px
 *
 * 内容纪律（继承自 17 的目录口径）：
 *   · 代表性样本，不穷尽
 *   · 3D / 剖面 / 受力一律「教学示意，非施工/工程模型」
 *   · 年代用多层信息 + 不确定性标注
 *   · 来源逐条可点击
 *
 * 用法：node src/catalog-page/build-catalog-page.mjs
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..', '..');
const OUT_DIR = path.join(ROOT, 'dist');
const OUT_HTML = path.join(OUT_DIR, 'catalog.html');
const OUT_CSS = path.join(OUT_DIR, 'catalog.css');
const CSS_SRC = path.join(HERE, 'catalog.css');
const DS_SRC = path.join(HERE, 'assets', 'ds');
const DS_OUT = path.join(OUT_DIR, 'assets', 'ds');

const readJson = (p) => JSON.parse(fs.readFileSync(p, 'utf8'));
const catalog = readJson(path.join(ROOT, 'catalog.json'));
const meta = readJson(path.join(ROOT, 'catalog.meta.json'));
const glossary = readJson(path.join(ROOT, 'glossary.json'));

const esc = (s) =>
  String(s ?? '').replace(
    /[&<>"']/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]),
  );

/** 不确定性 → 徽标（zh / en 两套文案） */
function uncertainty(raw) {
  const s = String(raw || '');
  if (/不适用/.test(s)) return { key: 'na', zh: '持续性传统', en: 'Continuing tradition' };
  if (/约略/.test(s)) return { key: 'approx', zh: '断代约略', en: 'Approximate date' };
  if (/确切/.test(s)) return { key: 'certain', zh: '断代确切', en: 'Date certain' };
  return { key: 'approx', zh: '断代约略', en: 'Approximate date' };
}

const V = meta.vocabularies;
const regionName = (id) => V.regions[id]?.labelZh ?? id;
const regionNameEn = (id) => V.regions[id]?.labelEn ?? id;
const eraName = (id) => V.eras[id]?.labelZh ?? id;
const eraNameEn = (id) => V.eras[id]?.labelEn ?? id;

/* ------------------------------------------------------------ 案例卡片 */

function caseCard(c) {
  const u = uncertainty(c.yearUncertainty);
  const srcs = (c.sources || [])
    .map(
      (s) => `<li><a href="${esc(s.url)}" rel="noopener noreferrer" target="_blank">${esc(s.label)}</a>
      <span class="lvl">${esc(s.evidenceLevel)}</span>
      <span class="lvl">${esc(s.accessedAt || '')}</span></li>`,
    )
    .join('');

  const structTags = (c.structureTypes || [])
    .map(
      (s) =>
        `<span class="tag">${esc(s.labelZh)}<span data-l="en" style="display:none"> · ${esc(s.labelEn)}</span></span>`,
    )
    .join('');

  return `<article class="case" id="${esc(c.id)}"
  data-name="${esc((c.nameZh + ' ' + c.nameEn + ' ' + c.pinyin + ' ' + c.province + ' ' + c.locality).toLowerCase())}"
  data-region="${esc(c.region)}" data-era="${esc(c.era)}"
  data-structures="${esc((c.structureTypes || []).map((s) => s.id).join(' '))}">
  <div class="case__head">
    <div>
      <h3 class="case__name">${esc(c.nameZh)}</h3>
      <p class="case__name-en" data-l="en">${esc(c.nameEn)}</p>
      <p class="case__id">${esc(c.pinyin)}</p>
    </div>
    <span class="case__id">${esc(c.id)}</span>
  </div>

  <div class="case__facts">
    <span class="tag tag--accent">${esc(regionName(c.region))}<span data-l="en" style="display:none"> · ${esc(regionNameEn(c.region))}</span></span>
    <span class="tag">${esc(c.province)} · ${esc(c.locality)}</span>
    <span class="tag">${esc(eraName(c.era))}<span data-l="en" style="display:none"> · ${esc(eraNameEn(c.era))}</span></span>
    <span class="tag">${esc(c.type)}</span>
    <span class="tag tag--warn">${esc(u.zh)}<span data-l="en" style="display:none"> · ${esc(u.en)}</span></span>
  </div>

  <div class="case__facts">${structTags}</div>

  <div class="case__block">
    <h4><span data-l="zh">年代</span><span data-l="en">Dating</span></h4>
    <p>${esc(c.yearText)}</p>
  </div>

  <div class="case__block">
    <h4><span data-l="zh">结构原理</span><span data-l="en">Structural principle</span></h4>
    <p><span data-l="zh">${esc(c.principleZh)}</span><span data-l="en">${esc(c.principleEn)}</span></p>
  </div>

  <div class="case__block">
    <h4><span data-l="zh">文化背景</span><span data-l="en">Cultural context</span></h4>
    <p><span data-l="zh">${esc(c.cultureZh)}</span><span data-l="en">${esc(c.cultureEn)}</span></p>
  </div>

  <div class="case__block">
    <h4><span data-l="zh">来源</span><span data-l="en">Sources</span></h4>
    <ul class="src-list">${srcs}</ul>
  </div>

  <div class="caveat"><strong><span data-l="zh">说明</span><span data-l="en">Caveat</span></strong>：
  <span data-l="zh">${esc(c.caveat)}</span><span data-l="en">${esc(c.caveat)}</span></div>

  <p class="notice"><span data-l="zh">${esc(c.teachingNotice?.labelZh || '')}</span><span data-l="en">${esc(c.teachingNotice?.labelEn || '')}</span></p>
</article>`;
}

/* ------------------------------------------------------------ 术语卡 */

function termCard(t) {
  return `<article class="term" data-cat="${esc(t.category)}"
  data-name="${esc((t.termZh + ' ' + t.termEn + ' ' + t.pinyin).toLowerCase())}">
  <p class="term__zh">${esc(t.termZh)}</p>
  <p class="term__py">${esc(t.pinyin)}</p>
  <p class="term__en">${esc(t.termEn)}</p>
  <p class="term__def"><span data-l="zh">${esc(t.definitionZh)}</span><span data-l="en">${esc(t.definitionEn)}</span></p>
  <p class="term__cat">${esc(t.category)}${t.note ? ' · ' + esc(t.note) : ''}</p>
</article>`;
}

/* ------------------------------------------------------------ 构造卡 */

function structCard(s) {
  const members = (s.members || []).join('、');
  const membersEn = (s.membersEn || []).join(', ');
  return `<article class="struct" data-id="${esc(s.id)}"
  data-name="${esc((s.labelZh + ' ' + s.labelEn).toLowerCase())}">
  <p class="struct__zh">${esc(s.labelZh)}</p>
  <p class="struct__en">${esc(s.labelEn)}</p>
  <p class="struct__gloss">${esc(s.gloss || '')}</p>
  <p class="struct__members"><b><span data-l="zh">构件</span><span data-l="en">Members</span></b>：
  <span data-l="zh">${esc(members)}</span><span data-l="en">${esc(membersEn)}</span></p>
</article>`;
}

/* ------------------------------------------------------------ 筛选器 */

const regionChips = Object.entries(V.regions)
  .map(
    ([id, v]) =>
      `<button class="chip" type="button" data-filter="region" data-value="${esc(id)}"
       aria-pressed="false"><span data-l="zh">${esc(v.labelZh)}</span><span data-l="en">${esc(v.labelEn)}</span></button>`,
  )
  .join('');

const eraChips = Object.entries(V.eras)
  .map(
    ([id, v]) =>
      `<button class="chip" type="button" data-filter="era" data-value="${esc(id)}"
       aria-pressed="false"><span data-l="zh">${esc(v.labelZh)}</span><span data-l="en">${esc(v.labelEn)}</span></button>`,
  )
  .join('');

const structChips = Object.entries(V.structureTypes)
  .map(
    ([id, v]) =>
      `<button class="chip" type="button" data-filter="structure" data-value="${esc(id)}"
       aria-pressed="false"><span data-l="zh">${esc(v.labelZh)}</span><span data-l="en">${esc(v.labelEn)}</span></button>`,
  )
  .join('');

const termCats = [...new Set(glossary.terms.map((t) => t.category))];
const termChips = termCats
  .map(
    (c) =>
      `<button class="chip" type="button" data-filter="term-cat" data-value="${esc(c)}"
       aria-pressed="false">${esc(c)}</button>`,
  )
  .join('');

/* ------------------------------------------------------------ HTML */

const casesHtml = catalog.cases.map(caseCard).join('\n');
const termsHtml = glossary.terms.map(termCard).join('\n');
const groups = readJson(path.join(ROOT, 'handoff', 'structure-groups.json')).groups || {};
const structsHtml = Object.entries(V.structureTypes)
  .map(([id, v]) => {
    const g = groups[id] || {};
    return structCard({
      id,
      labelZh: v.labelZh,
      labelEn: v.labelEn,
      gloss: v.gloss,
      members: g.members || [],
      membersEn: g.membersEn || [],
    });
  })
  .join('\n');

const html = `<!DOCTYPE html>
<html lang="zh-CN" data-lang="zh">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>构筑华夏 · 中国经典建筑与传统结构 · 研究成果</title>
<meta name="description" content="中国经典建筑与传统构造的代表性研究目录：${catalog.cases.length} 条案例、${meta.counts.structureTypes} 类构造、${glossary.termCount} 条双语术语，全部附可点击来源。">
<!-- 主题：不硬钉 data-ds-theme，交由 16 令牌的 @media (prefers-color-scheme: dark) 跟随系统；
     若上游需要固定主题，设 data-ds-theme="light" / "dark" 即可覆盖。 -->
<meta name="color-scheme" content="light dark">
<link rel="stylesheet" href="./assets/ds/fonts/fonts.css">
<link rel="stylesheet" href="./assets/ds/tokens.css">
<link rel="stylesheet" href="./assets/ds/components.css">
<link rel="stylesheet" href="./catalog.css">
<link rel="icon" href="./favicon.svg" type="image/svg+xml">
<!-- 运行时基准：按 16 的 MIGRATION-NOTES.md §6 在**入口**注入 --ds-base（不在 CSS 里声明，避免同名不同义）。
     本页全部资源用相对路径引用，与挂载深度无关，故本地/子目录预览取 ""。
     14-publish 若把本页挂到站点子路径，可把此值改为站点基准（如 "/playtime-atlas-20261021/"）。 -->
<style>:root { --ds-base: ""; }</style>
</head>
<body>
<a class="skip-link" href="#main"><span data-l="zh">跳到主要内容</span><span data-l="en">Skip to content</span></a>

<div class="page">
  <header class="masthead">
    <p class="masthead__eyebrow">17 · architecture research</p>
    <h1 class="masthead__title">构筑华夏<span data-l="en" style="display:none"> · Built in China</span></h1>
    <p class="masthead__lede" data-l="zh">中国经典建筑与传统构造的代表性研究目录。每条案例附年代的不确定性标注、结构原理、文化背景与可点击来源；所有模型与受力说明均为教学示意。</p>
    <p class="masthead__lede" data-l="en" style="display:none">A representative research catalogue of Chinese traditional buildings and structures. Every entry carries its dating uncertainty, structural principle, cultural context and clickable sources. All models and force notes are teaching illustrations.</p>
    <div class="masthead__meta">
      <span><span data-l="zh">生成时间</span><span data-l="en">Built</span> ${esc(meta.generatedAt.slice(0, 10))}</span>
      <span>${esc(meta.scopeEn.includes('not an exhaustive') ? 'Representative sample — not exhaustive' : '')}</span>
    </div>
  </header>

  <ul class="stat-row">
    <li class="stat"><span class="stat__n">${catalog.cases.length}</span><span class="stat__l"><span data-l="zh">建筑案例</span><span data-l="en">Cases</span></span></li>
    <li class="stat"><span class="stat__n">${meta.counts.structureTypes}</span><span class="stat__l"><span data-l="zh">构造类别</span><span data-l="en">Structure types</span></span></li>
    <li class="stat"><span class="stat__n">${glossary.termCount}</span><span class="stat__l"><span data-l="zh">双语术语</span><span data-l="en">Glossary terms</span></span></li>
    <li class="stat"><span class="stat__n">${meta.counts.sources}</span><span class="stat__l"><span data-l="zh">独立来源</span><span data-l="en">Sources</span></span></li>
    <li class="stat"><span class="stat__n">${meta.counts.provinces}</span><span class="stat__l"><span data-l="zh">省域</span><span data-l="en">Provinces</span></span></li>
  </ul>

  <div class="toolbar">
    <div class="toolbar__row">
      <label class="sr-only" for="q" hidden><span data-l="zh">搜索</span><span data-l="en">Search</span></label>
      <input class="search" id="q" type="search" autocomplete="off"
        placeholder="搜索建筑名 / 拼音 / 地区">
      <div class="lang-toggle" role="group" aria-label="Language">
        <button type="button" id="lang-zh" aria-pressed="true">中文</button>
        <button type="button" id="lang-en" aria-pressed="false">EN</button>
      </div>
    </div>
    <div class="chip-row" role="group" aria-label="Region">
      <span class="tag"><span data-l="zh">大区</span><span data-l="en">Region</span></span>${regionChips}
    </div>
    <div class="chip-row" role="group" aria-label="Era">
      <span class="tag"><span data-l="zh">时代</span><span data-l="en">Era</span></span>${eraChips}
    </div>
    <div class="chip-row" role="group" aria-label="Structure">
      <span class="tag"><span data-l="zh">构造</span><span data-l="en">Structure</span></span>${structChips}
    </div>
  </div>

  <main id="main">
    <section class="section" id="cases">
      <h2 class="section__title"><span data-l="zh">建筑案例</span><span data-l="en">Building cases</span></h2>
      <p class="section__lede" data-l="zh">代表性样本，<strong>不声称穷尽</strong>中国古建筑；同一类型内的其他重要实例未被纳入。年代保留「始建于 X、重修于 Y」的多层信息。</p>
      <p class="section__lede" data-l="en" style="display:none">A representative sample that does <strong>not</strong> claim to exhaust Chinese historic architecture; other important instances of the same type are not included. Dating keeps the full "begun in X, rebuilt in Y" information.</p>
      <div class="case-list" id="case-list">${casesHtml}</div>
      <p class="empty" id="case-empty" hidden><span data-l="zh">没有匹配的条目</span><span data-l="en">No matching entries</span></p>
    </section>

    <section class="section" id="glossary">
      <h2 class="section__title"><span data-l="zh">术语表</span><span data-l="en">Glossary</span></h2>
      <p class="section__lede" data-l="zh">${glossary.termCount} 条术语，附拼音与通俗解释，面向不了解中国建筑的读者。</p>
      <p class="section__lede" data-l="en" style="display:none">${glossary.termCount} terms with pinyin and plain-language explanations, written for readers unfamiliar with Chinese architecture.</p>
      <div class="chip-row" role="group" aria-label="Term category">${termChips}</div>
      <div class="term-grid" id="term-grid">${termsHtml}</div>
    </section>

    <section class="section" id="structures">
      <h2 class="section__title"><span data-l="zh">构造类别</span><span data-l="en">Structure types</span></h2>
      <p class="section__lede" data-l="zh">${meta.counts.structureTypes} 类构造，附构件清单。拆解顺序与受力说明见 handoff/structure-groups.json。</p>
      <p class="section__lede" data-l="en" style="display:none">${meta.counts.structureTypes} structure types with their member lists. Assembly order and force notes are in handoff/structure-groups.json.</p>
      <div class="struct-grid" id="struct-grid">${structsHtml}</div>
    </section>

    <section class="section" id="notes">
      <h2 class="section__title"><span data-l="zh">数据边界</span><span data-l="en">Data boundaries</span></h2>
      <ul class="src-list" style="gap:12px">
        <li>· <strong><span data-l="zh">代表性样本，不穷尽</span><span data-l="en">Representative sample, not exhaustive</span></strong>：
          <span data-l="zh">${esc(meta.scope)}</span><span data-l="en">${esc(meta.scopeEn)}</span></li>
        <li>· <strong><span data-l="zh">教学示意</span><span data-l="en">Teaching illustration</span></strong>：
          <span data-l="zh">${esc(meta.teachingNotice?.disclaimer || '')}</span><span data-l="en">${esc(meta.teachingNotice?.disclaimer || '')}</span></li>
        <li>· <strong><span data-l="zh">不携带第三方图片</span><span data-l="en">No third-party images</span></strong>：
          <span data-l="zh">全部配图由代码程序化生成；需要真实影像时外链来源机构。</span><span data-l="en">All imagery is generated in code; real photographs are only ever linked out to the holding institution.</span></li>
      </ul>
    </section>
  </main>

  <footer class="footer">
    <p><strong>17-architecture-research</strong> · ${esc(meta.generatedAt)}</p>
    <p><span data-l="zh">数据文件：catalog.json / catalog.meta.json / glossary.json / handoff/structure-groups.json / SOURCES.md / LICENSES.md / QA.md</span><span data-l="en">Data files: catalog.json / catalog.meta.json / glossary.json / handoff/structure-groups.json / SOURCES.md / LICENSES.md / QA.md</span></p>
    <p><span data-l="zh">视觉语言：16-design-system（Afterglow v1.0.0）。本页不引用参考站的色值与字体资产。</span><span data-l="en">Visual language: 16-design-system (Afterglow v1.0.0). This page uses no colour values or font assets from the reference site.</span></p>
    <p><span data-l="zh">发布由 14-publish 统一执行；本目录不建仓、不推送。</span><span data-l="en">Publishing is handled solely by 14-publish; this directory neither creates a repository nor pushes.</span></p>
  </footer>
</div>

<script>
(function () {
  'use strict';
  var root = document.documentElement;
  var q = document.getElementById('q');
  var caseList = document.getElementById('case-list');
  var caseEmpty = document.getElementById('case-empty');
  var termGrid = document.getElementById('term-grid');
  var structGrid = document.getElementById('struct-grid');
  var state = { region: '', era: '', structure: '', termCat: '', q: '' };

  function matches(el) {
    if (state.q) {
      var hay = (el.dataset.name || '') + ' ' + (el.textContent || '').toLowerCase();
      if (hay.indexOf(state.q) === -1) return false;
    }
    if (el.dataset.region && state.region && el.dataset.region !== state.region) return false;
    if (el.dataset.era && state.era && el.dataset.era !== state.era) return false;
    if (el.dataset.structures && state.structure) {
      if (el.dataset.structures.split(' ').indexOf(state.structure) === -1) return false;
    }
    if (el.dataset.cat && state.termCat && el.dataset.cat !== state.termCat) return false;
    return true;
  }

  function apply() {
    var shown = 0;
    Array.prototype.forEach.call(caseList.children, function (el) {
      var ok = matches(el);
      el.hidden = !ok;
      if (ok) shown += 1;
    });
    caseEmpty.hidden = shown !== 0;
    Array.prototype.forEach.call(termGrid.children, function (el) {
      el.hidden = !matches(el);
    });
    Array.prototype.forEach.call(structGrid.children, function (el) {
      el.hidden = !matches(el);
    });
  }

  q.addEventListener('input', function () {
    state.q = q.value.trim().toLowerCase();
    apply();
  });

  Array.prototype.forEach.call(document.querySelectorAll('.chip[data-filter]'), function (btn) {
    btn.addEventListener('click', function () {
      var f = btn.dataset.filter;
      var v = btn.dataset.value;
      var on = state[f] === v;
      state[f] = on ? '' : v;
      Array.prototype.forEach.call(btn.parentNode.querySelectorAll('.chip[data-filter="' + f + '"]'), function (b) {
        b.setAttribute('aria-pressed', b === btn && !on ? 'true' : 'false');
      });
      apply();
    });
  });

  var PH = {
    zh: '搜索建筑名 / 拼音 / 地区',
    en: 'Search name / pinyin / region',
  };

  function setLang(lang) {
    root.setAttribute('data-lang', lang);
    q.placeholder = PH[lang];
    root.setAttribute('lang', lang === 'zh' ? 'zh-CN' : 'en');
    document.getElementById('lang-zh').setAttribute('aria-pressed', lang === 'zh' ? 'true' : 'false');
    document.getElementById('lang-en').setAttribute('aria-pressed', lang === 'en' ? 'true' : 'false');
    try { localStorage.setItem('a17-lang', lang); } catch (e) { /* 隐私模式：忽略 */ }
  }
  document.getElementById('lang-zh').addEventListener('click', function () { setLang('zh'); });
  document.getElementById('lang-en').addEventListener('click', function () { setLang('en'); });
  q.placeholder = PH[document.documentElement.getAttribute('data-lang') || 'zh'];
  try {
    var saved = localStorage.getItem('a17-lang');
    if (saved === 'zh' || saved === 'en') setLang(saved);
  } catch (e) { /* 忽略 */ }
})();
</script>
</body>
</html>
`;

fs.mkdirSync(OUT_DIR, { recursive: true });
fs.writeFileSync(OUT_HTML, html);
fs.writeFileSync(OUT_CSS, fs.readFileSync(CSS_SRC, 'utf8'));

/* favicon：原创简笔「斗栱」层叠出挑符号，色值取自 16 的 --ds-accent / --ds-bg / --ds-ink */
const FAVICON = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" role="img" aria-label="构筑华夏">
  <rect width="64" height="64" rx="12" fill="#fcfbf9"/>
  <g fill="none" stroke="#b4432b" stroke-width="4" stroke-linecap="round">
    <path d="M14 20h36"/>
    <path d="M20 32h24"/>
    <path d="M26 44h12"/>
  </g>
  <path d="M32 10v8" stroke="#14110f" stroke-width="4" stroke-linecap="round"/>
  <path d="M32 50v4" stroke="#14110f" stroke-width="4" stroke-linecap="round"/>
</svg>
`;
fs.writeFileSync(path.join(OUT_DIR, 'favicon.svg'), FAVICON);

// DS 资源：tokens / components / 自托管字体（vendored 副本，原样复制）
fs.rmSync(DS_OUT, { recursive: true, force: true });
fs.mkdirSync(DS_OUT, { recursive: true });
fs.copyFileSync(path.join(DS_SRC, 'tokens.css'), path.join(DS_OUT, 'tokens.css'));
fs.copyFileSync(path.join(DS_SRC, 'components.css'), path.join(DS_OUT, 'components.css'));
fs.cpSync(path.join(DS_SRC, 'fonts'), path.join(DS_OUT, 'fonts'), { recursive: true });

const size = (p) => fs.statSync(p).size;
console.log('dist/catalog.html :', size(OUT_HTML), 'B');
console.log('dist/catalog.css  :', size(OUT_CSS), 'B');
console.log('cases / terms / structures :', catalog.cases.length, glossary.terms.length, meta.counts.structureTypes);
