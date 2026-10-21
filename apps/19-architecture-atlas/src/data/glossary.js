/**
 * Bilingual glossary — 74 terms.
 *
 * SOURCE OF TRUTH
 *   ./upstream/glossary.json (vendored verbatim from 17-architecture-research).
 *   It already carries the Chinese term, pinyin, the English equivalent and a
 *   full bilingual definition, plus links to the catalogue entries that use
 *   the term.
 *
 *   ./upstream/glossary-en.json supplies the two things upstream publishes in
 *   Chinese only: the English label of each category, and the English
 *   rendering of each "common confusion" note.
 *
 * This module is an adapter. The term id is a readable slug derived from the
 * English term so deep links stay legible; the upstream id is kept alongside
 * it so every entry can be traced back.
 */

import upstream from './upstream/glossary.json';
import glossaryEn from './upstream/glossary-en.json';

const CATEGORY_EN = glossaryEn.categories || {};
const NOTE_EN = glossaryEn.notes || {};

/** "Dougong (bracket set)" → "dougong-bracket-set"; keep it short and stable. */
function slugify(termEn, termZh) {
  const base = String(termEn || termZh || '')
    .toLowerCase()
    .replace(/[（(].*?[)）]/g, ' ')
    .replace(/[^a-z0-9一-鿿]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return base || `term-${termZh}`;
}

function buildSlug(term, used) {
  let base = slugify(term.termEn, term.termZh);
  // A Chinese-only term yields a Chinese slug; fall back to the upstream id.
  if (!/^[a-z0-9-]+$/.test(base)) base = term.id;
  let slug = base;
  let n = 2;
  while (used.has(slug)) { slug = `${base}-${n}`; n += 1; }
  used.add(slug);
  return slug;
}

const used = new Set();

export const GLOSSARY = upstream.terms.map((term) => ({
  id: buildSlug(term, used),
  upstreamId: term.id,
  zh: term.termZh,
  py: term.pinyin,
  en: term.termEn,
  cat: { zh: term.category, en: CATEGORY_EN[term.category] || term.category },
  short: { zh: term.definitionZh, en: term.definitionEn },
  cases: term.relatedCases || [],
  structures: term.relatedStructures || [],
  note: term.note ? { zh: term.note, en: NOTE_EN[term.id] || '' } : null,
}));

export const GLOSSARY_BY_ID = Object.fromEntries(GLOSSARY.map((g) => [g.id, g]));

/**
 * Upstream id → this site's id.
 *
 * Upstream ids are opaque (`g01`, `g02`, …); this site's ids are readable
 * slugs so deep links stay legible. The catalogue refers to terms by their
 * upstream id, so anything that joins the two has to go through this map.
 */
export const GLOSSARY_ID_BY_UPSTREAM = Object.fromEntries(
  GLOSSARY.map((g) => [g.upstreamId, g.id]),
);

/** Category vocabulary, derived from the data itself. */
export const GLOSSARY_CATEGORIES = [...new Set(GLOSSARY.map((g) => g.cat.zh))];
