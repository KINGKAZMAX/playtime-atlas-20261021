/**
 * Shared filter engine — region / era / system / free text.
 * One source of truth so the map, the timeline, the catalog and the rail
 * always agree.
 */

import { CASES } from '../data/catalog.js';
import { REGIONS, ERAS, SYSTEMS } from '../data/taxonomy.js';
import { getFilters, setFilter, resetFilters, subscribe } from './store.js';

const norm = (s) => String(s ?? '').trim().toLowerCase();

function matches(item, f) {
  if (f.region && item.region !== f.region) return false;
  if (f.era && item.era !== f.era) return false;
  if (f.system && item.system !== f.system) return false;
  if (f.q) {
    const q = norm(f.q);
    const hay = [
      item.nameZh, item.nameEn, item.pinyin, item.province, item.locality,
      item.type?.zh, item.type?.en, item.ethnicity?.zh, item.ethnicity?.en,
      ...(item.keywords || []),
    ].map(norm).join(' ');
    if (!hay.includes(q)) return false;
  }
  return true;
}

export function filteredCases(filters = getFilters()) {
  return CASES.filter((item) => matches(item, filters));
}

export function countBy(key, filters = getFilters()) {
  const out = {};
  for (const item of filteredCases(filters)) {
    out[item[key]] = (out[item[key]] || 0) + 1;
  }
  return out;
}

export function countForRegion(regionId, filters = getFilters()) {
  return filteredCases({ ...filters, region: regionId, q: filters.q }).length;
}

export function countForEra(eraId, filters = getFilters()) {
  return filteredCases({ ...filters, era: eraId, q: filters.q }).length;
}

export function countForSystem(systemId, filters = getFilters()) {
  return filteredCases({ ...filters, system: systemId, q: filters.q }).length;
}

export function isFiltered(filters = getFilters()) {
  return Boolean(filters.region || filters.era || filters.system || filters.q);
}

export function setRegion(regionId) {
  const f = getFilters();
  setFilter({ region: f.region === regionId ? null : regionId });
}

export function setEra(eraId) {
  const f = getFilters();
  setFilter({ era: f.era === eraId ? null : eraId });
}

export function setSystem(systemId) {
  const f = getFilters();
  setFilter({ system: f.system === systemId ? null : systemId });
}

export function setQuery(q) {
  setFilter({ q });
}

export function clearAll() {
  resetFilters();
}

export { REGIONS, ERAS, SYSTEMS };
export { getFilters, subscribe };
