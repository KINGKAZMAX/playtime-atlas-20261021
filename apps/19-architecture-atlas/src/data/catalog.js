/**
 * Building catalogue — 42 representative entries.
 *
 * SOURCE OF TRUTH
 *   The entries themselves come from 17-architecture-research
 *   (./upstream/catalog.json, vendored verbatim). That catalogue is
 *   authoritative: it carries the verified sources, the dating caveats and
 *   the standard teaching-notice text. This module is an **adapter** that
 *   presents it in the shape the UI needs, and joins it with:
 *
 *     · ./enrichment.js        — this project's own additions: coordinates and
 *                                the English renderings of the fields that
 *                                upstream publishes in Chinese only.
 *     · ./taxonomy.js          — the region / era / structure vocabularies.
 *     · ./labs-meta.js         — the six 3D models of 18-architecture-models.
 *
 * SCOPE NOTE (inherited from upstream)
 *   This is a REPRESENTATIVE SAMPLE, not a complete list of Chinese historic
 *   architecture. It covers eight regions, ten eras and nineteen structural
 *   characteristics, chosen to explain structural ideas rather than to rank
 *   monuments.
 *
 * IMAGES
 *   None are bundled. Most monument photography and museum archives are
 *   all-rights-reserved. Every drawing on the site is generated in code and
 *   is a schematic, not a measured survey.
 *
 * Field reference:
 *   id              stable slug (upstream id, e.g. c09-forbidden-city-hall)
 *   nameZh/nameEn   Chinese and English names
 *   pinyin          romanisation of the Chinese name
 *   region          region id (see taxonomy.js)
 *   province        modern province / autonomous region
 *   locality        city or county
 *   era             era id
 *   yearText        dating, in the words the sources actually use
 *   yearUncertainty 'certain' | 'approx' | 'disputed' | 'not-applicable'
 *   type            building type
 *   system          primary structural type id
 *   systems         every structural type the entry carries
 *   ethnicity       ethnic group
 *   lon / lat       approximate published coordinates
 *   principle       how it stands up (plain language, not a construction note)
 *   culture         what it was for and who used it
 *   keywords        search + filter tags
 *   sources         [{ label, url, type, accessedAt }]
 *   caveat          the honest limits of what is shown here
 *   labs            related structural labs
 *   terms           related glossary ids
 */

import upstream from './upstream/catalog.json';
import upstreamGlossary from './upstream/glossary.json';
import { ENRICHMENT } from './enrichment.js';
import { LABS_META } from './labs-meta.js';
import { REGIONS, ERAS, SYSTEMS, SYSTEM_TO_LAB } from './taxonomy.js';
import { GLOSSARY_ID_BY_UPSTREAM } from './glossary.js';

/* ---------------------------------------------------------------- helpers */

/** Upstream writes the certainty as a Chinese phrase, sometimes qualified. */
function toUncertainty(raw) {
  const s = String(raw || '');
  if (/争议|两说|不一|分歧/.test(s)) return 'disputed';
  if (/^确切/.test(s)) return 'certain';
  if (/^约略/.test(s)) return 'approx';
  if (/不适用/.test(s)) return 'not-applicable';
  return 'approx';
}

const SOURCE_TYPE = {
  unesco: 'primary',
  institution: 'primary',
  ihchina: 'primary',
  secondary: 'secondary',
};

/** Upstream source types are finer than ours; map onto primary / secondary. */
function toSourceType(src) {
  if (src.evidenceLevel === 'primary-verified') return 'primary';
  return SOURCE_TYPE[src.type] || 'secondary';
}

/**
 * Source URLs that need a documented correction before they are shown.
 *
 * The upstream catalogue is authoritative and is never edited in place, so
 * the correction lives here, in the adapter, and is recorded in SOURCES.md.
 *
 * `sn.people.com.cn` — measured 2026-10-21:
 *   https://sn.people.com.cn/... → ERR_CERT_COMMON_NAME_INVALID
 *     (the host serves a CDN default certificate for `default.chinanetcenter.com`,
 *      so a browser refuses it outright — the link is unusable for a reader)
 *   http://sn.people.com.cn/...  → 200
 * The same page, on the protocol the host actually supports.
 */
const SOURCE_URL_FIXES = new Map([
  ['https://sn.people.com.cn/', 'http://sn.people.com.cn/'],
]);

function fixSourceUrl(url) {
  for (const [from, to] of SOURCE_URL_FIXES) {
    if (url.startsWith(from)) return to + url.slice(from.length);
  }
  return url;
}

/* --------------------------------------------------- case → related labs */

/** 18's models declare which catalogue entries they teach. */
const LAB_CATALOG_REFS = new Map();
for (const lab of LABS_META) {
  for (const ref of lab.catalogRefs || []) {
    if (!LAB_CATALOG_REFS.has(ref.id)) LAB_CATALOG_REFS.set(ref.id, []);
    LAB_CATALOG_REFS.get(ref.id).push(lab.id);
  }
}

/* -------------------------------------------------- case → related terms */

/**
 * Upstream glossary links terms to cases; invert it.
 *
 * Upstream ids are opaque (`g01`, `g02`, …). This site's glossary uses a
 * readable slug as its id so deep links stay legible, so the upstream id has
 * to be translated on the way across — otherwise every case would point at
 * terms that do not exist here.
 */
const CASE_TERMS = new Map();
for (const term of upstreamGlossary.terms) {
  const localId = GLOSSARY_ID_BY_UPSTREAM[term.id] || term.id;
  for (const cid of term.relatedCases || []) {
    if (!CASE_TERMS.has(cid)) CASE_TERMS.set(cid, []);
    CASE_TERMS.get(cid).push(localId);
  }
}

/* ------------------------------------------------------------- transform */

function labsFor(entry) {
  const set = new Set(LAB_CATALOG_REFS.get(entry.id) || []);
  for (const st of entry.structureTypes || []) {
    const lab = SYSTEM_TO_LAB[st.id];
    if (lab) set.add(lab);
  }
  return [...set];
}

export const CASES = upstream.cases.map((entry) => {
  const extra = ENRICHMENT[entry.id] || {};
  const systems = (entry.structureTypes || []).map((s) => s.id);
  return {
    id: entry.id,
    nameZh: entry.nameZh,
    nameEn: entry.nameEn,
    pinyin: entry.pinyin,
    region: entry.region,
    province: entry.province,
    locality: entry.locality,
    era: entry.era,
    yearText: { zh: entry.yearText, en: extra.yearTextEn || entry.yearText },
    yearUncertainty: toUncertainty(entry.yearUncertainty),
    type: { zh: entry.type, en: extra.typeEn || entry.type },
    system: systems[0] || null,
    systems,
    ethnicity: { zh: entry.ethnicGroup, en: extra.ethnicityEn || entry.ethnicGroup },
    lon: extra.lon ?? 0,
    lat: extra.lat ?? 0,
    principle: { zh: entry.principleZh, en: entry.principleEn },
    culture: { zh: entry.cultureZh, en: entry.cultureEn },
    keywords: entry.culturalKeywords || [],
    sources: (entry.sources || []).map((s) => ({
      label: s.label,
      url: fixSourceUrl(s.url),
      type: toSourceType(s),
      accessedAt: s.accessedAt,
    })),
    caveat: { zh: entry.caveat || '', en: extra.caveatEn || '' },
    labs: labsFor(entry),
    terms: CASE_TERMS.get(entry.id) || [],
    upstream: {
      structureTypes: entry.structureTypes || [],
      imagePlan: entry.imagePlan || null,
      verification: entry.verification || null,
      isRepresentativeSample: entry.isRepresentativeSample !== false,
    },
  };
});

export const CASE_BY_ID = Object.fromEntries(CASES.map((c) => [c.id, c]));

/** Catalogue-level metadata, for the sources page and the footer note. */
export const CATALOG_META = {
  total: CASES.length,
  scope: 'representative-sample',
  note: 'Eight regions, ten eras, nineteen structural characteristics. Not an exhaustive list of Chinese historic buildings.',
  regions: REGIONS.length,
  eras: ERAS.length,
  systems: SYSTEMS.length,
  builtAt: '2026-10-21',
  upstream: '17-architecture-research/catalog.json (vendored verbatim in src/data/upstream/)',
};
