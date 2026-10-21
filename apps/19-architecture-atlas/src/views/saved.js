/**
 * Saved entries — the local favourites list.
 *
 * Nothing is uploaded: the list lives in this browser's localStorage only.
 */

import { el, clear } from '../core/dom.js';
import { t } from '../core/i18n.js';
import { caseDrawing } from '../art/schematic.js';
import { CASE_BY_ID } from '../data/catalog.js';
import { getFavourites, toggleFavourite } from '../core/store.js';

export function renderSaved(host, { onToast } = {}) {
  const grid = el('div.grid');
  const note = el('p.result-note');

  function paint() {
    const ids = getFavourites();
    note.textContent = t('saved.count', { n: ids.length });
    clear(grid);

    if (!ids.length) {
      grid.append(el('div.empty', {}, [
        el('b', { text: t('saved.empty') }),
        el('span', { text: t('saved.empty.hint') }),
      ]));
      return;
    }

    for (const id of ids) {
      const item = CASE_BY_ID[id];
      if (!item) continue;
      const remove = el('button.card-fav', {
        type: 'button',
        'aria-pressed': 'true',
        'aria-label': `${t('saved.remove')} — ${item.nameZh}`,
        title: t('saved.remove'),
        html: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1L12 21l7.7-7.6 1.1-1a5.5 5.5 0 0 0 0-7.8z"/></svg>',
        on: {
          click: (e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleFavourite(id);
            onToast?.(t('saved.remove'));
            paint();
          },
        },
      });
      grid.append(el('article.card', {}, [
        el('div.card-media', {}, [el('div', { html: caseDrawing(item) }), remove]),
        el('div.card-body', {}, [
          el('h3.card-title', { text: item.nameZh }),
          el('span.card-title-en', { text: item.nameEn }),
          el('div.card-meta', {}, [
            el('a.btn.btn-sm', { href: `#/case/${item.id}`, text: t('saved.openCase') }),
          ]),
        ]),
        el('a.card-link', {
          href: `#/case/${item.id}`,
          'aria-label': `${t('saved.openCase')} — ${item.nameZh} — ${item.nameEn}`,
        }),
      ]));
    }
  }

  const clearBtn = el('button.btn.btn-sm', {
    type: 'button', text: t('saved.clearAll'),
    on: {
      click: () => {
        if (!window.confirm(t('saved.confirmClear'))) return;
        for (const id of getFavourites()) toggleFavourite(id);
        onToast?.(t('saved.empty'));
        paint();
      },
    },
  });

  host.append(el('div.band-inner', {}, [
    el('div.band-head', {}, [
      el('p.eyebrow', {}, [el('span.dot'), el('span', { text: t('saved.eyebrow') })]),
      el('h2.band-title', {}, [
        el('span', { text: t('saved.title') }),
        el('span.en', { text: t('saved.titleEn') }),
      ]),
      el('p.band-lede', { text: t('saved.lede') }),
    ]),
    el('div.saved-tools', {}, [note, clearBtn]),
    grid,
  ]));

  paint();
}
