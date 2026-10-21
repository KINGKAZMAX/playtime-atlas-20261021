/**
 * 构筑华夏 / Built in China — application entry.
 *
 * A small hand-rolled shell: top bar, section rail, one main region, footer.
 * Routing is hash-based so the site works from any sub-path on GitHub Pages
 * without a server rewrite.
 *
 * No framework, no router library, no third-party runtime beyond the lazily
 * imported 3D engine.
 */

import './styles/tokens.css';
import './styles/components.css';
import './styles/app.css';

import { el, clear, mount, $ } from './core/dom.js';
import {
  t, pick, getLang, setLanguage, onLanguageChange,
  applyLangFromUrl, syncLangToUrl,
} from './core/i18n.js';
import { subscribe as storeSubscribe, getFavourites } from './core/store.js';
import { subscribe as filterSubscribe, getFilters } from './core/filters.js';
import { CASES } from './data/catalog.js';
import { REGIONS, ERAS, SYSTEMS } from './data/taxonomy.js';
import { GLOSSARY } from './data/glossary.js';
import { LABS } from './data/labs.js';
import { renderHero } from './views/hero.js';
import { renderAtlas } from './views/atlas.js';
import { renderTimeline } from './views/timeline.js';
import { renderCatalog } from './views/catalog.js';
import { renderCaseDetail } from './views/caseDetail.js';
import { renderLabsIndex, renderLabDetail } from './views/labs.js';
import { renderGlossary } from './views/glossary.js';
import { renderQuiz } from './views/quiz.js';
import { renderSaved } from './views/saved.js';
import { renderSources } from './views/sources.js';

/* ------------------------------------------------------------------ shell */

const main = $('#main');
const railHost = $('#rail');
const topbarHost = $('#topbar');
const footerHost = $('#footer');
const toastHost = $('#toast');
const progressHost = $('.scroll-progress');

let currentRoute = null;
let homeViews = null;          // live view handles for the home page
let disposeCurrent = null;     // teardown for the current route (3D lab)
let toastTimer = 0;

const NAV = [
  { key: 'nav.atlas', href: '#/catalog', match: 'catalog' },
  { key: 'nav.labs', href: '#/labs', match: 'labs' },
  { key: 'nav.glossary', href: '#/glossary', match: 'glossary' },
  { key: 'nav.quiz', href: '#/quiz', match: 'quiz' },
  { key: 'nav.saved', href: '#/saved', match: 'saved' },
  { key: 'nav.sources', href: '#/sources', match: 'sources' },
];

function showToast(message) {
  if (!message) return;
  toastHost.textContent = message;
  toastHost.classList.add('is-on');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastHost.classList.remove('is-on'), 2400);
}

/* ----------------------------------------------------------------- topbar */

function buildTopbar() {
  const nav = el('nav.topnav', { 'aria-label': t('site.title') });
  for (const item of NAV) {
    nav.append(el('a.ds-topbar__link', {
      href: item.href,
      text: t(item.key),
      'data-match': item.match,
    }));
  }

  const lang = el('div.lang-switch', { role: 'group', 'aria-label': t('common.language') }, [
    el('button', {
      type: 'button', text: '中文', 'aria-pressed': String(getLang() === 'zh'),
      on: { click: () => setLanguage('zh') },
    }),
    el('button', {
      type: 'button', text: 'EN', 'aria-pressed': String(getLang() === 'en'),
      on: { click: () => setLanguage('en') },
    }),
  ]);

  const mobile = el('button.icon-btn.mobile-toggle', {
    type: 'button',
    'aria-label': t('section.explore'),
    'aria-expanded': 'false',
    'aria-controls': 'mobile-nav',
    html: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg>',
    on: {
      click: (e) => {
        const panel = document.getElementById('mobile-nav');
        const open = panel.hasAttribute('hidden');
        if (open) panel.removeAttribute('hidden'); else panel.setAttribute('hidden', '');
        e.currentTarget.setAttribute('aria-expanded', String(open));
      },
    },
  });

  const mobileNav = el('nav.mobile-nav#mobile-nav', { 'aria-label': t('section.explore'), hidden: '' });
  for (const item of NAV) {
    mobileNav.append(el('a.ds-topbar__link', { href: item.href, text: t(item.key), 'data-match': item.match }));
  }
  mobileNav.append(el('a', { href: '#/', text: t('site.title') }));

  mount(topbarHost,
    el('a.brand', { href: '#/', 'aria-label': `${t('site.title')} — ${t('site.subtitle')}` }, [
      el('span.brand-mark', { html: '<i></i><i></i><i></i>' }),
      el('span.brand-text', {}, [
        el('b', { text: t('site.title') }),
        el('em', { text: t('site.subtitle') }),
      ]),
    ]),
    nav,
    el('div.topbar-right', {}, [lang, mobile]),
    mobileNav,
  );
}

/* ------------------------------------------------------------------- rail */

function buildRail(entries) {
  clear(railHost);
  if (!entries || !entries.length) { railHost.setAttribute('aria-hidden', 'true'); return; }
  railHost.removeAttribute('aria-hidden');
  railHost.append(el('p.rail-title', { text: t('section.explore') }));
  const list = el('ul.rail-list');
  for (const entry of entries) {
    const li = el('li.rail-item');
    li.append(el('button', {
      type: 'button',
      text: entry.label,
      'data-target': entry.target,
      on: {
        click: () => {
          if (entry.href) { location.hash = entry.href; return; }
          const node = document.getElementById(entry.target);
          node?.scrollIntoView({ behavior: prefersReduced() ? 'auto' : 'smooth', block: 'start' });
        },
      },
    }));
    list.append(li);
  }
  railHost.append(list);
}

function highlightRail(targetId) {
  for (const btn of railHost.querySelectorAll('.rail-item button')) {
    btn.setAttribute('aria-current', String(btn.dataset.target === targetId));
  }
}

/* ----------------------------------------------------------------- footer */

function buildFooter() {
  const col = (heading, links) => el('div', {}, [
    el('h4', { text: heading }),
    el('ul', {}, links.map((l) => el('li', {}, [l]))),
  ]);

  mount(footerHost,
    el('div.footer-inner', {}, [
      col(t('site.title'), [
        el('a', { href: '#/', text: t('nav.atlas') }),
        el('a', { href: '#/labs', text: t('nav.labs') }),
        el('a', { href: '#/glossary', text: t('nav.glossary') }),
        el('a', { href: '#/quiz', text: t('nav.quiz') }),
        el('a', { href: '#/saved', text: t('nav.saved') }),
      ]),
      col(t('sources.title'), [
        el('a', { href: '#/sources', text: t('sources.byCase') }),
        el('a', { href: '#/sources', text: t('sources.refTitle') }),
        el('a', { href: '#/sources', text: t('sources.licTitle') }),
      ]),
      el('div', {}, [
        el('h4', { text: t('footer.task') }),
        el('p', { text: t('footer.built'), style: { fontSize: 'var(--fs-small)', color: 'var(--ink-2)', margin: '0 0 .4rem' } }),
        el('p', { text: t('footer.licence'), style: { fontSize: 'var(--fs-micro)', color: 'var(--ink-3)', margin: '0' } }),
      ]),
    ]),
    el('p.footer-note', { text: t('footer.note') }),
  );
}

/* ------------------------------------------------------------------ bands */

function band({ id, eyebrow, title, titleEn, lede, tone, children }) {
  const head = el('div.band-head', {}, [
    el('p.eyebrow', {}, [el('span.dot'), el('span', { text: eyebrow })]),
    el('h2.band-title', {}, [
      el('span', { text: title }),
      titleEn ? el('span.en', { text: titleEn }) : null,
    ]),
    lede ? el('p.band-lede', { text: lede }) : null,
  ]);
  const section = el('section.band', { id, 'data-tone': tone || 'light' }, [
    el('div.band-inner', {}, [head, ...children]),
  ]);
  return section;
}

/* ------------------------------------------------------------------ home */

function renderHome(host) {
  const heroHost = el('div');
  host.append(heroHost);
  renderHero(heroHost);

  const atlasHost = el('div');
  const timelineHost = el('div');
  const catalogHost = el('div');

  host.append(band({
    id: 'atlas',
    eyebrow: t('atlas.eyebrow'),
    title: t('atlas.title'),
    titleEn: t('atlas.titleEn'),
    lede: t('atlas.lede'),
    children: [atlasHost],
  }));
  host.append(band({
    id: 'timeline',
    eyebrow: t('timeline.eyebrow'),
    title: t('timeline.title'),
    titleEn: t('timeline.titleEn'),
    lede: t('timeline.lede'),
    children: [timelineHost],
  }));
  host.append(band({
    id: 'catalog',
    eyebrow: t('catalog.eyebrow'),
    title: t('catalog.title'),
    titleEn: t('catalog.titleEn'),
    lede: t('catalog.lede', {
      n: CASES.length, regions: REGIONS.length, eras: ERAS.length, systems: SYSTEMS.length,
    }),
    children: [catalogHost],
  }));

  const atlas = renderAtlas(atlasHost, { onOpenCase: (id) => { location.hash = `#/case/${id}`; } });
  const timeline = renderTimeline(timelineHost);
  const catalog = renderCatalog(catalogHost, {
    onOpenCase: (id) => { location.hash = `#/case/${id}`; },
    onFavouriteChange: (added) => showToast(added ? t('catalog.faved') : t('catalog.fav')),
  });

  homeViews = { atlas, timeline, catalog };

  buildRail([
    { label: t('nav.atlas'), target: 'atlas' },
    { label: t('nav.timeline'), target: 'timeline' },
    { label: t('nav.catalog'), target: 'catalog' },
  ]);
}

/* ---------------------------------------------------------------- routes */

function parseHash() {
  const raw = location.hash.replace(/^#/, '') || '/';
  const [path, query] = raw.split('?');
  const segs = path.split('/').filter(Boolean);
  return { segs, query: new URLSearchParams(query || '') };
}

function markNav(match) {
  for (const a of topbarHost.querySelectorAll('.topnav a, .mobile-nav a')) {
    const isMatch = a.dataset.match === match;
    if (a.dataset.match) a.setAttribute('aria-current', isMatch ? 'true' : 'false');
  }
}

function render() {
  const { segs, query } = parseHash();
  const route = segs[0] || 'home';

  // tear down whatever the previous route owned
  if (disposeCurrent) { try { disposeCurrent(); } catch { /* ignore */ } disposeCurrent = null; }
  homeViews = null;
  clear(main);
  main.setAttribute('aria-busy', 'true');

  if (route === 'home' || route === 'catalog') {
    renderHome(main);
    markNav(route === 'catalog' ? 'catalog' : '');
    if (route === 'catalog') {
      requestAnimationFrame(() => {
        document.getElementById('catalog')?.scrollIntoView({ behavior: 'auto', block: 'start' });
      });
    }
  } else if (route === 'case') {
    renderCaseDetail(main, segs[1], {
      onNavigate: (id) => { location.hash = `#/case/${id}`; },
      onToast: showToast,
    });
    buildRail([{ label: t('nav.catalog'), href: '#/catalog' }]);
    markNav('catalog');
  } else if (route === 'labs') {
    renderLabsIndex(main);
    buildRail([]);
    markNav('labs');
  } else if (route === 'lab') {
    disposeCurrent = renderLabDetail(main, segs[1], { onToast: showToast });
    buildRail([{ label: t('labs.backToLabs'), href: '#/labs' }]);
    markNav('labs');
  } else if (route === 'glossary') {
    renderGlossary(main, { termId: query.get('term') });
    buildRail([]);
    markNav('glossary');
  } else if (route === 'quiz') {
    renderQuiz(main);
    buildRail([]);
    markNav('quiz');
  } else if (route === 'saved') {
    renderSaved(main, { onToast: showToast });
    buildRail([]);
    markNav('saved');
  } else if (route === 'sources') {
    renderSources(main);
    buildRail([]);
    markNav('sources');
  } else {
    renderHome(main);
    markNav('');
  }

  main.removeAttribute('aria-busy');
  currentRoute = route;
  observeReveals();
}

/* --------------------------------------------------------------- motion */

const prefersReduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

let revealObserver = null;
function observeReveals() {
  if (revealObserver) revealObserver.disconnect();
  const nodes = main.querySelectorAll('.reveal');
  if (prefersReduced() || !('IntersectionObserver' in window)) {
    for (const n of nodes) n.classList.add('is-in');
    return;
  }
  revealObserver = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-in');
        revealObserver.unobserve(entry.target);
      }
    }
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.06 });
  for (const n of nodes) revealObserver.observe(n);
}

function updateProgress() {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  const pct = max > 0 ? Math.min(100, (window.scrollY / max) * 100) : 0;
  progressHost.style.width = `${pct}%`;
}

/* ----------------------------------------------------------------- boot */

// A `?lang=` deep link decides the language of this page load. It is applied
// before the shell is built, and it does not overwrite the visitor's own
// saved preference.
applyLangFromUrl();
syncLangToUrl(getLang());

buildTopbar();
buildFooter();
render();

window.addEventListener('hashchange', render);

// A filter change repaints the map, the timeline and the catalog in place.
filterSubscribe((state, reason) => {
  if (reason !== 'filters' || !homeViews) return;
  homeViews.atlas?.paint();
  homeViews.timeline?.paint();
  homeViews.catalog?.paint();
});

// A language change re-renders the whole shell so every string is replaced.
// The URL is kept in step, so the address bar alone is a shareable deep link.
onLanguageChange((lang) => {
  syncLangToUrl(lang);
  buildTopbar();
  buildFooter();
  render();
});

storeSubscribe((state, reason) => {
  if (reason === 'favourites' && currentRoute === 'saved') render();
});

window.addEventListener('scroll', updateProgress, { passive: true });
updateProgress();

/* --------------------------------------------------------- QA harness ---
 * Enabled only with `?qa=1`. The module is dynamically imported, so the
 * self-test never enters the production bundle. The result block is written
 * outside #main so a route change cannot wipe it.
 */
if (new URLSearchParams(location.search).has('qa')) {
  const status = el('pre#qa-results', { 'data-qa-status': 'running', hidden: '' });
  document.body.append(status);
  import('./qa.js')
    .then((m) => m.runRuntimeQA())
    .then((report) => {
      status.textContent = JSON.stringify(report);
      status.setAttribute('data-qa-status', report.passed === report.total ? 'pass' : 'fail');
      status.removeAttribute('hidden');
    })
    .catch((err) => {
      status.textContent = JSON.stringify({
        passed: 0, total: 1, error: String(err && err.stack ? err.stack : err),
        results: [{ name: 'qa.harness', pass: false, detail: String(err) }],
      });
      status.setAttribute('data-qa-status', 'fail');
      status.removeAttribute('hidden');
    });
}
