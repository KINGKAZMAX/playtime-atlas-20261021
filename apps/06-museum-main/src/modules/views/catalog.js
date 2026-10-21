/**
 * 2D 无障碍目录 · #/catalog
 *
 * 这是本馆的主检索视图：语义化列表 / 网格、完整键盘可达、
 * 筛选结果通过 aria-live 播报。3D 展厅是可选增强，目录始终可用。
 */

import { exhibitCard, emptyState } from '../components.js';
import { escapeHtml, kindLabel } from '../../core/format.js';
import { filterExhibits, collectFacets, resultAnnouncement } from '../search.js';
import { getLang, t } from '../../i18n.js';

const SORTS = [
  { id: 'era', key: 'catalog.sort.era' },
  { id: 'year-asc', key: 'catalog.sort.yearAsc' },
  { id: 'year-desc', key: 'catalog.sort.yearDesc' },
  { id: 'title', key: 'catalog.sort.title' },
];

export function readCatalogState(query) {
  const list = (v) => (v ? String(v).split(',').map((s) => s.trim()).filter(Boolean) : []);
  const q = query.q ?? query.query ?? '';
  return {
    q,
    query: q, // 过滤层统一读取 query；q 保留给 URL 同步使用
    eras: list(query.era),
    kinds: list(query.kind),
    platforms: list(query.platform),
    sort: query.sort && SORTS.some((s) => s.id === query.sort) ? query.sort : 'era',
    view: query.view === 'list' ? 'list' : 'grid',
  };
}

export function renderCatalog(ctx, query) {
  const state = readCatalogState(query);
  const facets = collectFacets(ctx.exhibits);
  const filtered = filterExhibits(ctx.exhibits, state);
  const eraList = [...ctx.eras.values()].sort((a, b) => a.from - b.from);

  return `
<section class="page-head page-head--slim">
  <p class="page-eyebrow mono">2D CATALOG · 无障碍目录</p>
  <h1 class="page-title" data-i18n="catalog.title">2D 无障碍目录</h1>
  <p class="page-lede" data-i18n="catalog.lede">
    全部展品的文字版目录：可搜索、可按年代 / 类别 / 平台筛选，支持列表与网格两种视图。
    本页不依赖 3D 与图形能力，键盘与读屏可完整使用。
  </p>
</section>

<div class="catalog">
  <aside class="filters" aria-label="筛选与排序">
    <form id="catalog-filters" class="filters-form">
      <div class="filter-block">
        <label class="filter-label" for="f-q" data-i18n="catalog.searchLabel">关键词</label>
        <div class="filter-search">
          <input id="f-q" type="search" name="q" value="${escapeHtml(state.q)}"
                 placeholder="名称 / 创作者 / 平台…" autocomplete="off" enterkeyhint="search">
          <button class="btn btn-ghost btn-sm" type="submit" data-i18n="nav.searchSubmit">检索</button>
        </div>
      </div>

      <fieldset class="filter-block">
        <legend class="filter-label" data-i18n="catalog.filterEra">年代</legend>
        <div class="filter-list">
          ${eraList.map((era) => {
            const n = facets.eras.find(([id]) => id === era.id)?.[1] ?? 0;
            return `<label class="filter-item">
              <input type="checkbox" name="era" value="${escapeHtml(era.id)}"${state.eras.includes(era.id) ? ' checked' : ''}>
              <span class="filter-item-text">${escapeHtml(era.code)} · ${escapeHtml(era.label)}</span>
              <span class="filter-count mono">${n}</span>
            </label>`;
          }).join('')}
        </div>
      </fieldset>

      <fieldset class="filter-block">
        <legend class="filter-label" data-i18n="catalog.filterKind">类别</legend>
        <div class="filter-list">
          ${facets.kinds.map(([kind, n]) => `
            <label class="filter-item">
              <input type="checkbox" name="kind" value="${escapeHtml(kind)}"${state.kinds.includes(kind) ? ' checked' : ''}>
              <span class="filter-item-text">${escapeHtml(kindLabel(kind))}</span>
              <span class="filter-count mono">${n}</span>
            </label>`).join('')}
        </div>
      </fieldset>

      <details class="filter-block filter-block--platforms"${state.platforms.length ? ' open' : ''}>
        <summary class="filter-label"><span data-i18n="catalog.filterPlatform">平台</span>（${state.platforms.length || '全部'}）</summary>
        <div class="filter-list filter-list--scroll">
          ${facets.platforms.map(([p, n]) => `
            <label class="filter-item">
              <input type="checkbox" name="platform" value="${escapeHtml(p)}"${state.platforms.includes(p) ? ' checked' : ''}>
              <span class="filter-item-text">${escapeHtml(p)}</span>
              <span class="filter-count mono">${n}</span>
            </label>`).join('')}
        </div>
      </details>

      <div class="filter-block">
        <label class="filter-label" for="f-sort" data-i18n="catalog.filterSort">排序</label>
        <select id="f-sort" name="sort">
          ${SORTS.map((s) => `<option value="${s.id}"${state.sort === s.id ? ' selected' : ''}>${escapeHtml(t(s.key))}</option>`).join('')}
        </select>
      </div>

      <div class="filter-block filter-block--actions">
        <button class="btn btn-ghost btn-sm" type="button" id="f-reset" data-i18n="catalog.filterReset">清除全部筛选</button>
      </div>
    </form>
  </aside>

  <section class="results" aria-labelledby="results-title">
    <div class="results-bar">
      <h2 class="results-title" id="results-title" data-i18n="catalog.resultsTitle">展品列表</h2>
      <p class="results-count" id="results-count" role="status" aria-live="polite">
        ${escapeHtml(resultAnnouncement(filtered.length, ctx.exhibits.length, state.q, getLang()))}
      </p>
      <div class="results-tools">
        <div class="seg" role="group" aria-label="视图切换">
          <button type="button" class="seg-btn${state.view === 'grid' ? ' is-on' : ''}" data-view="grid" aria-pressed="${state.view === 'grid'}" data-i18n="catalog.viewGrid">网格</button>
          <button type="button" class="seg-btn${state.view === 'list' ? ' is-on' : ''}" data-view="list" aria-pressed="${state.view === 'list'}" data-i18n="catalog.viewList">列表</button>
        </div>
      </div>
    </div>
    <div class="results-body" id="catalog-results">
      ${resultsMarkup(ctx, filtered, state)}
    </div>
  </section>
</div>`;
}

function resultsMarkup(ctx, filtered, state) {
  if (!filtered.length) {
    return emptyState('没有匹配的展品', '试试减少筛选条件，或换一个关键词。');
  }
  const list = state.view === 'list'
    ? filtered.map((ex) => exhibitCard(ex, {
        era: ctx.eras.get(ex.era),
        query: state.q,
        variant: 'list',
        favorite: ctx.favorites.has(ex.id),
      })).join('')
    : filtered.map((ex) => exhibitCard(ex, {
        era: ctx.eras.get(ex.era),
        query: state.q,
        favorite: ctx.favorites.has(ex.id),
      })).join('');

  return state.view === 'list'
    ? `<div class="rows">${list}</div>`
    : `<div class="grid grid--cards">${list}</div>`;
}

/** 交互绑定：筛选变化时只重绘结果区，保持焦点不丢 */
export function mountCatalog(root, ctx) {
  const form = root.querySelector('#catalog-filters');
  const results = root.querySelector('#catalog-results');
  const counter = root.querySelector('#results-count');
  if (!form || !results) return;

  const readState = () => readCatalogState({
    q: form.querySelector('#f-q')?.value ?? '',
    era: [...form.querySelectorAll('input[name="era"]:checked')].map((i) => i.value).join(','),
    kind: [...form.querySelectorAll('input[name="kind"]:checked')].map((i) => i.value).join(','),
    platform: [...form.querySelectorAll('input[name="platform"]:checked')].map((i) => i.value).join(','),
    sort: form.querySelector('#f-sort')?.value ?? 'era',
    view: root.querySelector('.seg-btn.is-on')?.dataset.view ?? 'grid',
  });

  const syncUrl = (state) => {
    const params = new URLSearchParams();
    if (state.q) params.set('q', state.q);
    if (state.eras.length) params.set('era', state.eras.join(','));
    if (state.kinds.length) params.set('kind', state.kinds.join(','));
    if (state.platforms.length) params.set('platform', state.platforms.join(','));
    if (state.sort !== 'era') params.set('sort', state.sort);
    if (state.view !== 'grid') params.set('view', state.view);
    const qs = params.toString();
    const url = `${window.location.pathname}${window.location.search}#/catalog${qs ? `?${qs}` : ''}`;
    window.history.replaceState(null, '', url);
  };

  const refresh = ({ pushUrl = true } = {}) => {
    const state = readState();
    const filtered = filterExhibits(ctx.exhibits, state);
    results.innerHTML = resultsMarkup(ctx, filtered, state);
    counter.textContent = resultAnnouncement(filtered.length, ctx.exhibits.length, state.q);
    // 顶栏检索框与目录面板始终显示同一个关键词，避免两处不一致
    const topQ = document.getElementById('top-q');
    if (topQ && topQ.value !== state.q) topQ.value = state.q;
    if (pushUrl) syncUrl(state);
  };

  form.addEventListener('submit', (ev) => {
    ev.preventDefault();
    refresh();
  });

  /*
   * 关键词输入 → **立即**过滤，不做去抖。
   *
   * 原来有 220ms 去抖，结果是：输入停下后计数器和条目数还会停在旧值
   * 一小段时间。实测「填完立刻读」拿到的是 211 → 211（改前），
   * 等 220ms 之后才变成 0 —— 自动化检测与读屏用户都会看到「搜索没生效」。
   *
   * 211 条的「过滤 + 重绘」实测最坏 6.1ms、常见 1.4–3.9ms
   * （scripts/diag-perf.mjs），完全扛得住逐键过滤。
   *
   * 中文输入法组字期间（isComposing）不重绘：重绘会打断组字、让候选框失去上下文；
   * 组字结束后由 compositionend 触发一次刷新。
   */
  const qInput = form.querySelector('#f-q');
  qInput?.addEventListener('input', (ev) => {
    if (ev.isComposing) return;
    refresh();
  });
  qInput?.addEventListener('compositionend', () => refresh());

  form.addEventListener('change', (ev) => {
    if (ev.target.id === 'f-sort') {
      refresh();
      return;
    }
    refresh();
  });

  root.querySelector('#f-reset')?.addEventListener('click', () => {
    form.reset();
    root.querySelectorAll('.seg-btn').forEach((b) => {
      const on = b.dataset.view === 'grid';
      b.classList.toggle('is-on', on);
      b.setAttribute('aria-pressed', String(on));
    });
    refresh();
  });

  root.querySelectorAll('.seg-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      root.querySelectorAll('.seg-btn').forEach((b) => {
        const on = b === btn;
        b.classList.toggle('is-on', on);
        b.setAttribute('aria-pressed', String(on));
      });
      refresh();
    });
  });
}
