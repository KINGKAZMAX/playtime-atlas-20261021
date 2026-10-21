/**
 * 应用主控：装载数据 → 装配外壳 → 路由分发 → 事件委托
 */

import { ERAS } from './data/eras.js';
import { loadCatalog } from './data/loader.js';
import { applyTheme } from './modules/theme.js';
import { createRouter } from './core/router.js';
import { getFavorites, toggleFavorite, isFavorite, markVisited, getSettings, updateSettings, clearFavorites, exportFavorites } from './core/store.js';
import { exhibitArt, spriteMarkup } from './modules/silhouette.js';
import { escapeHtml } from './core/format.js';
import { initI18n, applyStatic, t } from './i18n.js';

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
  exhibits: [],  eras: new Map(),
  halls: [],
  favorites: new Set(),
  dataSource: 'local',
  remoteCount: 0,
  localCount: 0,
  artFor: (ex) => exhibitArt(ex, { variant: 'hero' }),
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

/* 是否已经渲染过至少一次视图（用于决定是否移动焦点） */
let hasRendered = false;

/* ── 入场动效（DESIGN-SPEC §8.2）────────────────────────────────────────── */
/**
 * 位移 + 透明度 + 微模糊，交错延迟 60ms 且**最多 6 级**——
 * 长列表不能让用户等，所以第 7 项起不再延迟。
 */
let entranceObserver = null;
function observeEntrance(root) {
  const items = root.querySelectorAll('.ds-in');
  if (!items.length) return;
  if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
    items.forEach((el) => el.classList.add('is-visible'));
    return;
  }
  if (!entranceObserver) {
    entranceObserver = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add('is-visible');
        entranceObserver.unobserve(entry.target);
      }
    }, { threshold: 0.15 });
  }
  items.forEach((el, i) => {
    el.style.setProperty('--ds-in-delay', `${Math.min(i, 5) * 60}ms`);
    entranceObserver.observe(el);
  });
}

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
  const eraLinks = [...document.querySelectorAll('[data-era-link]')];
  let activeIndex = -1;
  eraLinks.forEach((el, i) => {
    const on = key === 'era' && el.dataset.eraLink === second;
    el.classList.toggle('is-active', on);
    if (on) { el.setAttribute('aria-current', 'page'); activeIndex = i; }
    else el.removeAttribute('aria-current');
  });

  // 导览轴景深（DESIGN-SPEC §4.1）：用墨色层级 + 字号 + 缩放表达远近，
  // 不用半透明——半透明文字在任何底色上都保不住 4.5:1。
  eraLinks.forEach((el, i) => {
    const dist = activeIndex < 0 ? 2 : Math.abs(i - activeIndex);
    const level = dist === 0 ? 0 : dist === 1 ? 1 : 2;
    el.dataset.railLevel = String(level);
    el.style.setProperty('--ds-rail-scale', level === 2 ? '0.97' : '1');
  });
}

function renderRoute(route) {
  const [head, second] = route.segments;
  let html = '';
  let mount = null;

  // 离开 3D 展厅时释放 WebGL 资源，避免同一页面里堆积多个渲染循环
  if (ctx._hall) {
    try {
      ctx._hall.dispose();
    } catch (err) {
      console.warn('[hall] 释放场景失败', err);
    }
    ctx._hall = null;
  }

  // 离开可玩展厅时先把 iframe 显式拆掉：
  // 只把 iframe 从 DOM 里删掉的话，嵌入页面的 WebGL 上下文与动画循环要等
  // 垃圾回收才释放；连续进出展厅会越堆越多，最终把浏览器压垮。
  for (const frame of mainEl.querySelectorAll('iframe.embed-frame')) {
    try {
      frame.src = 'about:blank';
      frame.remove();
    } catch (err) {
      console.warn('[hall] 拆除嵌入展厅失败', err);
    }
  }

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
  applyStatic(mainEl);            // 视图内生成的界面文案跟随语言切换
  setActiveNav(route);
  closeRail();
  observeEntrance(mainEl);

  if (mount) {
    try {
      mount(mainEl, ctx, second);
    } catch (err) {
      console.error('[view] 挂载失败', err);
    }
  }

  // 路由切换后把焦点交给主内容，让读屏用户知道页面已换。
  // 首次加载不抢焦点——否则「跳到主内容」链接不再是第一个 Tab 停靠点。
  if (hasRendered) {
    mainEl.focus({ preventScroll: true });
  }
  hasRendered = true;
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

/*
 * 顶栏检索框的实时反馈。
 *
 * 顶栏是全站最显眼的检索入口，但它原本只在**回车提交**后才生效——
 * 在目录页里输入却看不到任何反应，很容易被当成「搜索坏了」。
 * 这里让顶栏在**已经位于目录页**时与目录面板走同一条链路、同样即时过滤；
 * 不在目录页时保持「回车跳转」的常规行为（避免每敲一个字就改地址栏）。
 *
 * 中文输入法组字期间不触发：组字结束后会补一次 input 事件。
 */
topQ.addEventListener('input', (ev) => {
  if (ev.isComposing) return;
  if (!window.location.hash.startsWith('#/catalog')) return;
  const panel = document.querySelector('#f-q');
  if (!panel) return;
  panel.value = topQ.value;
  panel.dispatchEvent(new Event('input', { bubbles: true }));
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
  // 语言：URL 参数优先（?lang=en），其次 localStorage，最后浏览器偏好
  const urlLang = new URLSearchParams(window.location.search).get('lang');
  if (urlLang === 'en' || urlLang === 'zh') {
    try { localStorage.setItem('ptatlas.lang.v1', urlLang); } catch { /* 忽略 */ }
  }
  initI18n();

  const theme = await applyTheme();
  const data = await loadCatalog();

  // 形体精灵图：整页注入一次，卡片通过 <use> 引用
  if (!document.querySelector('.art-sprite')) {
    document.body.insertAdjacentHTML('afterbegin', spriteMarkup());
  }

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

  // 语言切换后重绘当前视图：只替换文本节点，并**恢复滚动位置**
  // （DESIGN-SPEC §4.3：切换后保留滚动位置，不做整页重排动画）
  window.addEventListener('ptatlas:langchange', () => {
    const router = window.__ptatlasRouter;
    if (!router?.current) return;
    const y = window.scrollY;
    renderRoute(router.current);
    window.scrollTo({ top: y, behavior: 'auto' });
  });

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
