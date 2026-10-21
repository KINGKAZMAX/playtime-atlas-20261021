/**
 * Catalog — the filterable grid of building entries.
 */

import { el, clear, truncate } from '../core/dom.js';
import { t, pick, localName } from '../core/i18n.js';
import { caseDrawing } from '../art/schematic.js';
import { CASES } from '../data/catalog.js';
import { SYSTEM_BY_ID, regionById, eraById } from '../data/taxonomy.js';
import {
  filteredCases, getFilters, setQuery, setSystem, setRegion, setEra, clearAll,
  countForSystem, countForRegion, countForEra, REGIONS, ERAS, SYSTEMS,
} from '../core/filters.js';
import { isFavourite, toggleFavourite } from '../core/store.js';

const HEART = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1L12 21l7.7-7.6 1.1-1a5.5 5.5 0 0 0 0-7.8z"/></svg>`;

export function renderCatalog(host, { onOpenCase, onFavouriteChange }) {
  const note = el('p.result-note');
  const grid = el('div.grid');
  const bar = el('div.filterbar', { role: 'group', 'aria-label': t('catalog.title') });

  // ---------------- filter bar ----------------
  const typeGroup = el('div.filter-group', {}, [el('span.label', { text: t('catalog.filter.type') })]);
  const regionGroup = el('div.filter-group', {}, [el('span.label', { text: t('catalog.filter.region') })]);
  const eraGroup = el('div.filter-group', {}, [el('span.label', { text: t('catalog.filter.era') })]);
  const search = el('div.filter-search', {}, [
    el('span.sr-only', { text: t('catalog.search') }),
    el('input', {
      type: 'search', placeholder: t('catalog.search'), value: getFilters().q,
      'aria-label': t('catalog.search'),
      on: { input: (e) => setQuery(e.target.value) },
    }),
  ]);
  const reset = el('button.btn.btn-sm.filter-reset', {
    type: 'button', text: t('catalog.reset'), on: { click: () => { clearAll(); search.querySelector('input').value = ''; } },
  });

  bar.append(typeGroup, regionGroup, eraGroup, search, reset);
  host.append(bar, note, grid);

  function paintChips() {
    const filters = getFilters();
    for (const [group, key, list, setter, counter] of [
      [typeGroup, 'system', SYSTEMS, setSystem, countForSystem],
      [regionGroup, 'region', REGIONS, setRegion, countForRegion],
      [eraGroup, 'era', ERAS, setEra, countForEra],
    ]) {
      for (const node of Array.from(group.querySelectorAll('.chip'))) node.remove();
      for (const item of list) {
        const count = counter(item.id);
        const chip = el('button.chip', {
          type: 'button',
          'aria-pressed': String(filters[key] === item.id),
          on: { click: () => setter(item.id) },
        }, [
          el('span', { text: localName(item) }),
          el('span.count', { text: String(count) }),
        ]);
        group.append(chip);
      }
    }
  }

  function paintGrid() {
    const items = filteredCases();
    note.textContent = t('catalog.result', { n: items.length, total: CASES.length });

    clear(grid);
    if (!items.length) {
      grid.append(el('div.empty', {}, [
        el('b', { text: t('catalog.empty') }),
        el('span', { text: t('catalog.empty.hint') }),
      ]));
      return;
    }

    for (const item of items) {
      const system = SYSTEM_BY_ID[item.system];
      const region = regionById[item.region];
      const era = eraById[item.era];

      const fav = el('button.card-fav', {
        type: 'button',
        'aria-pressed': String(isFavourite(item.id)),
        'aria-label': `${t('catalog.fav')} — ${item.nameZh} — ${item.nameEn}`,
        title: t('catalog.fav'),
        html: HEART,
        on: {
          click: (e) => {
            e.preventDefault();
            e.stopPropagation();
            const added = toggleFavourite(item.id);
            fav.setAttribute('aria-pressed', String(added));
            onFavouriteChange?.(added, item);
          },
        },
      });

      const card = el('article.card', {}, [
        el('div.card-media', {}, [
          el('div', { html: caseDrawing(item) }),
          fav,
        ]),
        el('div.card-body', {}, [
          el('h3.card-title', { text: localName(item) }),
          el('span.card-title-en', { text: localName(item) === item.nameZh ? item.nameEn : item.nameZh }),
          el('span.card-pinyin', { text: item.pinyin }),
          el('div.card-meta', {}, [
            el('span.tag.is-type', { text: localName(system) || localName(item.type) }),
            el('span.tag.is-era', { text: localName(era) }),
            el('span.tag', { text: localName(region) }),
          ]),
        ]),
        el('a.card-link', {
          href: `#/case/${item.id}`,
          'aria-label': `${t('catalog.open')} — ${item.nameZh} — ${item.nameEn}`,
        }),
      ]);
      grid.append(card);
    }
  }

  paintChips();
  paintGrid();

  return {
    paint() { paintChips(); paintGrid(); },
    refreshFavourites() {
      for (const [id, node] of Array.from(grid.querySelectorAll('.card')).map((c) => [c.querySelector('.card-link').getAttribute('href').split('/').pop(), c])) {
        const fav = node.querySelector('.card-fav');
        if (fav) fav.setAttribute('aria-pressed', String(isFavourite(id)));
      }
    },
  };
}
