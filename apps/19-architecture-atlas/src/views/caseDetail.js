/**
 * Case detail — a deep-linkable single entry.
 * Route: #/case/<id>
 */

import { el, clear, esc } from '../core/dom.js';
import { t, pick, deepLink } from '../core/i18n.js';
import { caseDrawing } from '../art/schematic.js';
import { CASES, CASE_BY_ID } from '../data/catalog.js';
import { SYSTEM_BY_ID, regionById, eraById } from '../data/taxonomy.js';
import { GLOSSARY_BY_ID } from '../data/glossary.js';
import { LAB_BY_ID } from '../data/labs.js';
import { isFavourite, toggleFavourite } from '../core/store.js';

const HEART = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1L12 21l7.7-7.6 1.1-1a5.5 5.5 0 0 0 0-7.8z"/></svg>`;

export function renderCaseDetail(host, id, { onNavigate, onToast } = {}) {
  clear(host);
  const item = CASE_BY_ID[id];
  if (!item) {
    host.append(el('div.empty', {}, [
      el('b', { text: t('common.error') }),
      el('span', { text: id }),
    ]));
    return;
  }

  const idx = CASES.findIndex((c) => c.id === id);
  const prev = CASES[(idx - 1 + CASES.length) % CASES.length];
  const next = CASES[(idx + 1) % CASES.length];

  const system = SYSTEM_BY_ID[item.system];
  const region = regionById[item.region];
  const era = eraById[item.era];

  const fav = el('button.btn.btn-sm', {
    type: 'button',
    'aria-pressed': String(isFavourite(item.id)),
    html: `${HEART}<span>${t('catalog.fav')}</span>`,
    on: {
      click: () => {
        const added = toggleFavourite(item.id);
        fav.setAttribute('aria-pressed', String(added));
        onToast?.(added ? t('saved.count', { n: 1 }) : t('catalog.fav'));
      },
    },
  });

  const share = el('button.btn.btn-sm', {
    type: 'button',
    text: t('case.share'),
    on: {
      click: async () => {
        const url = deepLink(`#/case/${item.id}`);
        try {
          await navigator.clipboard.writeText(url);
          onToast?.(t('case.copied'));
        } catch {
          onToast?.(url);
        }
      },
    },
  });

  // ---------------- spec table ----------------
  const specRows = [
    [t('case.region'), `${region?.nameZh ?? ''} · ${region?.nameEn ?? ''}`],
    [t('case.province'), item.province],
    [t('case.locality'), item.locality],
    [t('case.era'), `${era?.nameZh ?? ''} · ${era?.nameEn ?? ''}`],
    [t('case.year'), pick(item.yearText)],
    [t('case.type'), `${item.type.zh} · ${item.type.en}`],
    [t('case.structure'), `${system?.nameZh ?? ''} · ${system?.nameEn ?? ''}`],
    [t('case.ethnicity'), `${item.ethnicity.zh} · ${item.ethnicity.en}`],
  ];
  const specTable = el('table.spec-table');
  for (const [k, v] of specRows) {
    specTable.append(el('tr', {}, [
      el('th', { scope: 'row', text: k }),
      el('td', { text: v }),
    ]));
  }
  if (item.yearUncertainty === 'disputed') {
    specTable.append(el('tr', {}, [
      el('th', { scope: 'row', text: t('case.year') }),
      el('td', { text: `⚠ ${t('case.unverified')}` }),
    ]));
  }

  // ---------------- sources ----------------
  const sourceList = el('ul.source-list');
  for (const src of item.sources) {
    const li = el('li');
    li.append(el('a', { href: src.url, target: '_blank', rel: 'noopener noreferrer', text: src.label }));
    li.append(el('span.source-meta', {
      text: `${src.type === 'primary' ? t('case.source.primary') : t('sources.kind.reference')} · ${t('sources.accessed')} ${src.accessedAt}`,
    }));
    sourceList.append(li);
  }

  // ---------------- related ----------------
  const termList = el('div.grid', { style: { gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))' } });
  for (const tid of item.terms || []) {
    const g = GLOSSARY_BY_ID[tid];
    if (!g) continue;
    termList.append(el('a.gloss-item', { href: `#/glossary?term=${g.id}`, style: { textDecoration: 'none' } }, [
      el('div.gloss-head', {}, [
        el('span.gloss-zh', { text: g.zh }),
        el('span.gloss-py', { text: g.py }),
      ]),
      el('span.gloss-en', { text: g.en }),
      el('p', { text: pick(g.short) }),
    ]));
  }

  const labList = el('div.lab-grid');
  for (const lid of item.labs || []) {
    const lab = LAB_BY_ID[lid];
    if (!lab) continue;
    labList.append(el('div.lab-card', {}, [
      el('div.lab-body', {}, [
        el('h3', { text: lab.nameZh }),
        el('span.en', { text: lab.nameEn.toUpperCase() }),
        el('p', { text: pick(lab.tagline) }),
        el('a.btn.btn-sm', { href: `#/lab/${lab.id}`, text: t('labs.open') }),
      ]),
    ]));
  }

  // ---------------- assemble ----------------
  const figure = el('figure.detail-figure', {}, [
    el('div', { html: caseDrawing(item, { w: 720, h: 420 }) }),
    el('figcaption', { text: `${item.nameZh} · ${t('case.diagram')}` }),
  ]);

  const body = el('div.detail-body', {}, [
    el('h3', { text: t('case.principle') }),
    el('p', { text: pick(item.principle) }),
    el('p.other-lang', { text: pick(item.principle) === item.principle.zh ? item.principle.en : item.principle.zh }),
    el('h3', { text: t('case.culture') }),
    el('p', { text: pick(item.culture) }),
    el('p.other-lang', { text: pick(item.culture) === item.culture.zh ? item.culture.en : item.culture.zh }),
    el('h3', { text: t('case.specs') }),
    specTable,
    el('h3', { text: t('case.caveatTitle') }),
    el('div.notice', {}, [
      el('span', { html: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 8v5M12 16h.01"/></svg>' }),
      el('div', {}, [
        el('b', { text: pick(item.caveat) }),
        el('div.other-lang', { text: pick(item.caveat) === item.caveat.zh ? item.caveat.en : item.caveat.zh, style: { marginTop: '0.25rem' } }),
      ]),
    ]),
    el('h3', { text: t('case.sources') }),
    sourceList,
  ]);

  const aside = el('div', {}, [
    (item.terms || []).length ? el('h3', { text: t('case.glossary'), style: { fontFamily: 'var(--font-display)', fontSize: '1.1rem', margin: '0 0 0.8rem' } }) : null,
    (item.terms || []).length ? termList : null,
    (item.labs || []).length ? el('h3', { text: t('case.related'), style: { fontFamily: 'var(--font-display)', fontSize: '1.1rem', margin: '2rem 0 0.6rem' } }) : null,
    (item.labs || []).length ? el('p', { text: t('case.relatedNote'), style: { fontSize: 'var(--fs-small)', color: 'var(--ink-3)', margin: '0 0 0.8rem' } }) : null,
    (item.labs || []).length ? labList : null,
  ]);

  const head = el('div.detail-head', {}, [
    el('p.eyebrow', {}, [
      el('span.dot'),
      el('span', { text: `${region?.nameZh ?? ''} · ${era?.nameZh ?? ''}` }),
    ]),
    el('h2.detail-title', { text: item.nameZh }),
    el('p.detail-title-en', { text: item.nameEn }),
    el('p.detail-pinyin', { text: item.pinyin }),
    el('div.detail-nav', {}, [fav, share]),
  ]);

  const detail = el('div.detail', {}, [
    el('div', {}, [head, figure, body]),
    aside,
  ]);

  const nav = el('div.detail-nav', {}, [
    el('a.btn.btn-sm', { href: `#/case/${prev.id}`, text: `← ${prev.nameZh}` }),
    el('a.btn.btn-sm', { href: '#/catalog', text: t('case.back') }),
    el('a.btn.btn-sm', { href: `#/case/${next.id}`, text: `${next.nameZh} →` }),
  ]);

  host.append(detail, nav);
}
