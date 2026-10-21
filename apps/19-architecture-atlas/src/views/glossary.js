/**
 * Bilingual glossary — 48 terms with pinyin, plain-language explanation,
 * a note on common confusion, and links back to the cases that use them.
 */

import { el, clear } from '../core/dom.js';
import { t, pick } from '../core/i18n.js';
import { GLOSSARY, GLOSSARY_BY_ID } from '../data/glossary.js';
import { CASE_BY_ID } from '../data/catalog.js';

const norm = (s) => String(s ?? '').trim().toLowerCase();

export function renderGlossary(host, { termId } = {}) {
  const grid = el('div.gloss-grid');
  const note = el('p.result-note');

  // ---- category chips, derived from the data itself -------------------
  const catMap = new Map();
  for (const g of GLOSSARY) {
    if (!catMap.has(g.cat.en)) catMap.set(g.cat.en, g.cat);
  }
  const cats = Array.from(catMap.entries());

  let activeCat = null;
  let query = '';

  function matches(g) {
    if (activeCat && g.cat.en !== activeCat) return false;
    if (!query) return true;
    const hay = [g.zh, g.py, g.en, g.cat.zh, g.cat.en, g.short.zh, g.short.en].map(norm).join(' ');
    return hay.includes(norm(query));
  }

  const chips = el('div.seg', { role: 'group', 'aria-label': t('glossary.cat') });
  const allChip = el('button', {
    type: 'button', text: t('glossary.allCats'), 'aria-pressed': 'true',
    on: {
      click: () => {
        activeCat = null;
        for (const c of chips.querySelectorAll('button')) c.setAttribute('aria-pressed', 'false');
        allChip.setAttribute('aria-pressed', 'true');
        paint();
      },
    },
  });
  chips.append(allChip);
  for (const [id, label] of cats) {
    chips.append(el('button', {
      type: 'button', text: label.zh, 'aria-pressed': 'false',
      on: {
        click: () => {
          activeCat = activeCat === id ? null : id;
          for (const c of chips.querySelectorAll('button')) c.setAttribute('aria-pressed', 'false');
          if (activeCat) {
            const btn = Array.from(chips.querySelectorAll('button'))
              .find((b) => b.textContent === label.zh);
            btn?.setAttribute('aria-pressed', 'true');
          } else {
            allChip.setAttribute('aria-pressed', 'true');
          }
          paint();
        },
      },
    }));
  }

  const search = el('div.filter-search', {}, [
    el('span.sr-only', { text: t('glossary.search') }),
    el('input', {
      type: 'search', placeholder: t('glossary.search'),
      'aria-label': t('glossary.search'),
      on: {
        input: (e) => { query = e.target.value; paint(); },
      },
    }),
  ]);

  function paint() {
    const items = GLOSSARY.filter(matches);
    note.textContent = t('glossary.countShow', { n: items.length, total: GLOSSARY.length });
    clear(grid);
    if (!items.length) {
      grid.append(el('div.empty', {}, [
        el('b', { text: t('glossary.empty') }),
        el('span', { text: t('glossary.emptyHint') }),
      ]));
      return;
    }
    for (const g of items) {
      const related = (g.cases || [])
        .map((id) => CASE_BY_ID[id])
        .filter(Boolean)
        .slice(0, 4);
      grid.append(el('article.gloss-item', { id: `term-${g.id}` }, [
        el('div.gloss-head', {}, [
          el('span.gloss-zh', { text: g.zh }),
          el('span.gloss-py', { text: g.py }),
        ]),
        el('span.gloss-en', { text: g.en }),
        el('p', { text: pick(g.short) }),
        g.note ? el('span.note', { text: `⚠ ${pick(g.note)}` }) : null,
        related.length ? el('div.gloss-cases', {}, [
          el('span.cat', { text: t('glossary.relatedCases') }),
          el('div', { style: { display: 'flex', flexWrap: 'wrap', gap: '.3rem', marginTop: '.35rem' } },
            related.map((c) => el('a.tag', { href: `#/case/${c.id}`, text: c.nameZh }))),
        ]) : null,
      ]));
    }

    if (termId) {
      const target = document.getElementById(`term-${termId}`);
      if (target) {
        target.classList.add('is-highlight');
        target.scrollIntoView({ behavior: 'auto', block: 'center' });
      }
    }
  }

  host.append(el('div.band-inner', {}, [
    el('div.band-head', {}, [
      el('p.eyebrow', {}, [el('span.dot'), el('span', { text: t('glossary.eyebrow') })]),
      el('h2.band-title', {}, [
        el('span', { text: t('glossary.title') }),
        el('span.en', { text: t('glossary.titleEn') }),
      ]),
      el('p.band-lede', { text: t('glossary.lede') }),
    ]),
    el('div.gloss-controls', {}, [search, chips]),
    note,
    el('div', { style: { marginTop: '1.2rem' } }, [grid]),
  ]));

  paint();
}
