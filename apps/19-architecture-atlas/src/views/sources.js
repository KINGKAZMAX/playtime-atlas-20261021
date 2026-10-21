/**
 * Sources & licensing — every claim in the atlas points at a public source.
 *
 * The reference site is listed explicitly and separately: it informed
 * interaction mechanics only. No image, font file, logo, wording or code was
 * copied from it, and this project does not claim that work as its own.
 */

import { el, clear } from '../core/dom.js';
import { t, pick } from '../core/i18n.js';
import { CASES } from '../data/catalog.js';
import { GLOSSARY } from '../data/glossary.js';

const ACCESSED = '2026-10-21';

const REFERENCE = {
  label: 'olek.si — interaction-mechanism reference',
  url: 'https://olek.si',
  note: {
    zh: '仅用于观察分区调性反转、索引刻度栏、可动画圆角、单强调色极简排版等交互机制。未复制其任何图片、字体文件、Logo、文案或代码。本项目为独立原创，不声称原创该参考作品。',
    en: 'Observed only for interaction mechanics: section tone inversion, index rails, animatable corner radii, single-accent minimal typography. No image, font file, logo, wording or code was copied. This project is an independent original work and does not claim the reference as its own.',
  },
};

export function renderSources(host) {
  // ---- collect every source cited in the catalog ------------------------
  const byUrl = new Map();
  for (const item of CASES) {
    for (const src of item.sources || []) {
      if (!byUrl.has(src.url)) {
        byUrl.set(src.url, {
          ...src,
          cases: [],
        });
      }
      const entry = byUrl.get(src.url);
      if (!entry.cases.includes(item.id)) entry.cases.push(item.id);
    }
  }
  const all = Array.from(byUrl.values());
  const primary = all.filter((s) => s.type === 'primary');
  const secondary = all.filter((s) => s.type !== 'primary');

  const srcGrid = el('div.src-grid');
  for (const src of all) {
    srcGrid.append(el('div.src-card', {}, [
      el('div.src-kind', { text: src.type === 'primary' ? t('sources.kind.primary') : t('sources.kind.reference') }),
      el('div', {}, [
        el('h4', { text: src.label }),
        el('p', { text: `${t('sources.accessed')} ${src.accessedAt || ACCESSED} · ${src.cases.length} ${t('catalog.caseCount')}` }),
        el('a.url', { href: src.url, target: '_blank', rel: 'noopener noreferrer', text: src.url }),
      ]),
    ]));
  }

  const refCard = el('div.src-card', {}, [
    el('div.src-kind', { text: t('sources.kind.reference') }),
    el('div', {}, [
      el('h4', { text: REFERENCE.label }),
      el('p', { text: `${t('sources.accessed')} ${ACCESSED}` }),
      el('p', { text: pick(REFERENCE.note), style: { marginTop: '.4rem' } }),
      el('a.url', { href: REFERENCE.url, target: '_blank', rel: 'noopener noreferrer', text: REFERENCE.url }),
    ]),
  ]);

  const limitList = el('ul.step-list');
  for (const line of t('sources.limits')) limitList.append(el('li', { text: line }));

  const techList = el('ul.step-list');
  for (const line of t('sources.techList')) techList.append(el('li', { text: line }));

  const licList = el('ul.step-list');
  for (const line of t('sources.licList')) licList.append(el('li', { text: line }));

  host.append(el('div.band-inner', {}, [
    el('div.band-head', {}, [
      el('p.eyebrow', {}, [el('span.dot'), el('span', { text: t('sources.eyebrow') })]),
      el('h2.band-title', {}, [
        el('span', { text: t('sources.title') }),
        el('span.en', { text: t('sources.titleEn') }),
      ]),
      el('p.band-lede', { text: t('sources.lede') }),
    ]),

    el('div.detail-body', {}, [
      el('h3', { text: t('sources.byCase') }),
      el('p', { text: `${primary.length} ${t('sources.kind.primary')} · ${secondary.length} ${t('sources.kind.reference')}` }),
      srcGrid,
    ]),

    el('div.detail-body', {}, [
      el('h3', { text: t('sources.refTitle') }),
      el('p', { text: t('sources.refNote'), style: { fontSize: 'var(--fs-small)', color: 'var(--ink-3)' } }),
      refCard,
    ]),

    el('div.detail-body', {}, [
      el('h3', { text: t('sources.limitsTitle') }),
      limitList,
    ]),

    el('div.detail-body', {}, [
      el('h3', { text: t('sources.techTitle') }),
      techList,
    ]),

    el('div.detail-body', {}, [
      el('h3', { text: t('sources.licTitle') }),
      licList,
    ]),
  ]));
}
