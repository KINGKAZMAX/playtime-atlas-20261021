/**
 * 应用主控：装载数据 → 装配外壳 → 路由分发 → 事件委托
 */

import { ERAS } from './data/eras.js';
import { loadCatalog } from './data/loader.js';
import { applyTheme } from './modules/theme.js';
import { createRouter } from './core/router.js';
import { getFavorites, toggleFavorite, isFavorite, markVisited, getSettings, updateSettings, clearFavorites, exportFavorites } from './core/store.js';
import { exhibitArt } from './modules/silhouette.js';
import { escapeHtml } from './core/format.js';

import { renderHome } from './modules/views/home.js';
import { renderTimeline, mountTimeline } from './modules/views/timeline.js';
import { renderEra } from './modules/views/era.js';
import { renderCatalog, mountCatalog } from './modules/views/catalog.js';
import { renderExhibit } from './modules/views/exhibit.js';
import { renderCollection } from './modules/views/collection.js';
import { renderHall, mountHall } from './modules/views/hall.js';
import { renderAbout } from './modules/views/about.js';

const mainEl = document.getElementById('main');
const railEl = document.getElementById('rail');
const railErasEl = document.getElementById('rail-eras');
const railFootEl = document.getElementById('rail-foot');
const footerMetaEl = document.getElementById('footer-meta');
const navToggle = document.getElementById('nav-toggle');
const topSearch = document.getElementById('topsearch');
const topQ = document.getElementById('top-q');

const ctx = {
  exhibits: [],
  eras: new Map(),
  halls: [],
  favorites: new Set(),
  dataSource: 'local',
  remoteCount: 0,
  localCount: 0,
  artFor: (ex) => exhibitArt(ex, { size: 260 }),
  get dataNote() {
    if (this.dataSource === 'remote') return '来自 05 策展目录';
    if (this.dataSource === 'merged') return `外部 ${this.remoteCount} 条 + 本地 ${this.localCount} 条`;
    return '本馆本地初版（05 策展包待并入）';
  },
  get artNote() {
    if (this.theme?.tokens) return '07-museum-art 设计令牌 + 自托管字体';
    return '本馆程序化生成（07 美术包待并入）';
  },
  get hallNote() {
    const ok = this.halls.filter((h) => h.status === 'integrated').length;
    return `${ok}/${this.halls.length} 个可玩展厅已并入`;
  },
};

/* ── 渲染 ──────────────────────────────────────────────────────────────────── */
function renderRail() {
  const eraList = [...ctx.eras.values()].sort((a, b) => a.from - b.from);
  const counts = new Map();
  for (const ex of ctx.exhibits) counts.set(ex.era, (counts.get(ex.era) ?? 0) + 1);
  railErasEl.innerHTML = eraList
    .map((era) => `<li>
      <a href="#/era/${encodeURIComponent(era.id)}" data-era-link="${escapeHtml(era.id)}" style="--era-accent:${escapeHtml(era.accent)}">
        <span class="rail-code mono">${escapeHtml(era.code)}</span>
        <span class="rail-name">${escapeHtml(era.label)}</span>
        <span class="rail-count mono">${counts.get(era.id) ?? 0}</span>
      </a>
    </li>`)
    .join('');
  railFootEl.textContent = `${ctx.exhibits.length} 件展品 · ${eraList.length} 个年代`;
  footerMetaEl.textContent = `馆藏 ${ctx.exhibits.length} 件 · 登记来源 ${ctx.exhibits.reduce((n, e) => n + (e.sourceUrls?.length ?? 0), 0)} 条 · ${ctx.dataNote}`;
}

function setActiveNav(route) {
  const [head, second] = route.segments;
  let key = head ?? 'home';
  if (key === 'era') key = 'era';
  document.querySelectorAll('[data-nav]').forEach((el) => {
    const nav = el.dataset.nav;
    const on = nav === key || (key === 'era' && nav === 'timeline');
    el.classList.toggle('is-active', on);
    if (on) el.setAttribute('aria-current', 'page');
    else el.removeAttribute('aria-current');
  });
  document.querySelectorAll('[data-era-link]').forEach((el) => {
    const on = key === 'era' && el.dataset.eraLink === second;
    el.classList.toggle('is-active', on);
    if (on) el.setAttribute('aria-current', 'page');
    else el.removeAttribute('aria-current');
  });
}

function renderRoute(route) {
  const [head, second] = route.segments;
  let html = '';
  let mount = null;

  switch (head) {
    case undefined:
    case '':
    case 'home':
      html = renderHome(ctx);
      break;
    case 'timeline':
      html = renderTimeline(ctx);
      mount = mountTimeline;
      break;
    case 'era':
      html = renderEra(ctx, second);
      break;
    case 'catalog':
      html = renderCatalog(ctx, route.query);
      mount = mountCatalog;
      break;
    case 'exhibit':
      html = renderExhibit(ctx, second);
      if (second) markVisited(second);
      break;
    case 'collection':
      html = renderCollection(ctx);
      break;
    case 'hall':
      html = renderHall(ctx, second);
      mount = mountHall;
      break;
    case 'about':
      html = renderAbout(ctx);
      break;
    default:
      html = `<section class="page-head">
        <h1 class="page-title">这条展线还没有开放</h1>
        <p class="page-lede">地址 <span class="mono">#/${escapeHtml(head)}</span> 不在本馆的展线图上。</p>
        <p><a class="btn btn-primary" href="#/">回到馆前广场</a></p>
      </section>`;
  }

  mainEl.innerHTML = html;
  setActiveNav(route);
  closeRail();

  if (mount) {
    try {
      mount(mainEl, ctx, second);
    } catch (err) {
      console.error('[view] 挂载失败', err);
    }
  }

  // 路由切换后把焦点交给主内容（保留浏览器默认滚动行为）
  mainEl.focus({ preventScroll: true });
}

/* ── 收藏 ──────────────────────────────────────────────────────────────────── */
function refreshFavBadges() {
  const n = ctx.favorites.size;
  document.querySelectorAll('[data-fav-count]').forEach((el) => { el.textContent = String(n); });
  document.querySelectorAll('[data-fav]').forEach((btn) => {
    const on = ctx.favorites.has(btn.dataset.fav);
    btn.setAttribute('aria-pressed', on ? 'true' : 'false');
    if (btn.classList.contains('fav-btn')) {
      const star = btn.querySelector('span[aria-hidden="true"]');
      const text = btn.querySelector('.fav-text');
      if (star) star.textContent = on ? '★' : '☆';
      if (text) text.textContent = on ? '已收藏' : '收藏';
    } else {
      const label = btn.textContent.replace(/[★☆]\s*/, '').trim();
      btn.innerHTML = `<span aria-hidden="true">${on ? '★' : '☆'}</span> ${on ? '已收藏' : '加入收藏'}`;
      btn.setAttribute('aria-label', `${on ? '取消收藏' : '加入收藏'}：${label}`);
    }
  });
}

function onFavClick(ev) {
  const btn = ev.target.closest('[data-fav]');
  if (!btn) return;
  const id = btn.dataset.fav;
  toggleFavorite(id);
  ctx.favorites = new Set(getFavorites());
  refreshFavBadges();
  if (document.querySelector('#collection')) {
    // 收藏页需要整体刷新
    const router = window.__ptatlasRouter;
    router?.replace('collection', {});
  }
}

/* ── 侧栏（移动端抽屉） ───────────────────────────────────────────────────── */
document.addEventListener('click', onFavClick);
function openRail() {
  document.body.classList.add('rail-open');
  navToggle.setAttribute('aria-expanded', 'true');
}
function closeRail() {
  document.body.classList.remove('rail-open');
  navToggle.setAttribute('aria-expanded', 'false');
}
navToggle.addEventListener('click', () => {
  if (document.body.classList.contains('rail-open')) closeRail();
  else openRail();
});
railEl.addEventListener('click', (ev) => {
  if (ev.target.closest('a')) closeRail();
});
document.addEventListener('keydown', (ev) => {
  if (ev.key === 'Escape' && document.body.classList.contains('rail-open')) {
    closeRail();
    navToggle.focus();
  }
});

/* ── 全局检索 ──────────────────────────────────────────────────────────────── */
topSearch.addEventListener('submit', (ev) => {
  ev.preventDefault();
  const q = topQ.value.trim();
  window.location.hash = `#/catalog${q ? `?q=${encodeURIComponent(q)}` : ''}`;
});

/* ── 收藏页操作 ────────────────────────────────────────────────────────────── */
document.addEventListener('click', (ev) => {
  if (ev.target.closest('#clear-fav')) {
    const n = ctx.favorites.size;
    if (!n) return;
    if (!window.confirm(`确定清空全部 ${n} 条收藏记录？此操作只影响本机浏览器。`)) return;
    clearFavorites();
    ctx.favorites = new Set(getFavorites());
    refreshFavBadges();
    window.__ptatlasRouter?.replace('collection', {});
  }
  if (ev.target.closest('#export-fav')) {
    const blob = new Blob([exportFavorites()], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'playtime-atlas-favorites.json';
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  }
});

/* ── 启动 ──────────────────────────────────────────────────────────────────── */
async function boot() {
  const theme = await applyTheme();
  const data = await loadCatalog();

  // 年代表：本地十个年代 + 外部目录补充的年代（loader 已合并）
  const eraMap = new Map(data.eras);

  ctx.exhibits = data.exhibits;
  ctx.eras = eraMap;
  ctx.halls = data.halls;
  ctx.dataSource = data.source;
  ctx.remoteCount = data.remoteCount;
  ctx.localCount = data.localCount;
  ctx.theme = theme;
  ctx.favorites = new Set(getFavorites());

  renderRail();

  const router = createRouter(renderRoute);
  window.__ptatlasRouter = router;
  router.start();

  refreshFavBadges();

  // 主题与设置
  const settings = getSettings();
  document.documentElement.dataset.density = settings.density;
  if (settings.reduceMotion) document.documentElement.classList.add('reduce-motion');
}

boot().catch((err) => {
  console.error('[boot] 启动失败', err);
  mainEl.innerHTML = `<section class="page-head">
    <h1 class="page-title">开馆失败</h1>
    <p class="page-lede">馆藏数据装载时出错：${escapeHtml(err.message)}</p>
    <p><button class="btn btn-primary" type="button" onclick="location.reload()">重新载入</button></p>
  </section>`;
});
