/**
 * Taxonomy — regions, eras and structural systems.
 *
 * The vocabularies come from 17-architecture-research (vendored verbatim in
 * ./upstream/catalog.meta.json) so the site speaks the same classification
 * as the catalogue and the 3D models. The map outline is this project's own
 * low-fidelity trace and is labelled as schematic in the UI.
 */

import upstreamMeta from './upstream/catalog.meta.json';

const V = upstreamMeta.vocabularies;

export const REGIONS = Object.entries(V.regions).map(([id, v]) => ({
  id,
  nameZh: v.labelZh,
  nameEn: v.labelEn,
  hint: { zh: '', en: '' },
}));

export const ERAS = Object.entries(V.eras).map(([id, v]) => ({
  id,
  nameZh: v.labelZh,
  nameEn: v.labelEn,
  range: v.labelEn,
  rangeEn: v.labelEn,
}));

export const SYSTEMS = Object.entries(V.structureTypes).map(([id, v]) => ({
  id,
  nameZh: v.labelZh,
  nameEn: v.labelEn,
  gloss: v.gloss || '',
}));

export const regionById = Object.fromEntries(REGIONS.map((r) => [r.id, r]));
export const eraById = Object.fromEntries(ERAS.map((e) => [e.id, e]));
export const systemById = Object.fromEntries(SYSTEMS.map((s) => [s.id, s]));

/** Uppercase alias, kept for readability at the call sites. */
export const SYSTEM_BY_ID = systemById;

/**
 * Map a catalogue structure type onto the 3D model that teaches it.
 * Only the six models of 18-architecture-models are listed; a building may
 * carry several structure types and therefore several related labs.
 */
export const SYSTEM_TO_LAB = {
  dougong: 'dougong',
  tailiang: 'taoliang',
  chuandou: 'chuandou',
  'mortise-tenon': 'mortise',
  'stone-arch': 'stone-arch',
  'rammed-earth': 'tulou',
};

/**
 * Coarse outline of the Chinese land mass, [lon, lat] pairs.
 * Schematic only — used as a visual frame for the case markers.
 */
export const CHINA_OUTLINE = [
  [134.3, 48.4], [131.0, 45.0], [130.7, 42.9], [128.0, 42.0], [126.5, 41.5],
  [124.4, 40.1], [121.7, 39.4], [121.0, 38.0], [122.2, 37.4], [120.3, 36.0],
  [119.2, 35.0], [121.5, 31.4], [121.9, 30.9], [122.2, 29.9], [120.2, 27.2],
  [118.1, 24.5], [113.6, 22.2], [110.4, 21.2], [109.8, 21.4], [108.5, 21.6],
  [106.7, 22.0], [105.3, 23.3], [103.5, 22.6], [101.8, 21.2], [99.2, 22.1],
  [97.5, 23.9], [97.8, 25.3], [98.7, 27.6], [96.3, 28.4], [94.5, 29.2],
  [92.1, 27.8], [88.8, 27.3], [85.8, 28.3], [81.3, 30.4], [78.8, 31.5],
  [78.3, 34.5], [76.0, 35.5], [74.9, 37.0], [73.6, 39.4], [75.0, 40.5],
  [79.9, 41.4], [82.0, 42.2], [85.5, 44.2], [88.0, 47.0], [90.0, 47.9],
  [95.4, 44.3], [100.0, 42.6], [105.0, 41.6], [110.0, 42.5], [115.0, 43.5],
  [119.5, 46.0], [117.8, 49.5], [119.7, 53.3], [125.0, 53.2], [130.7, 48.9],
];

export const HAINAN_OUTLINE = [
  [110.3, 20.1], [111.0, 19.6], [110.6, 18.6], [109.7, 18.4], [108.6, 19.3],
  [109.2, 20.0], [110.3, 20.1],
];

export const TAIWAN_OUTLINE = [
  [121.0, 25.3], [122.0, 25.0], [121.9, 24.0], [120.9, 22.0], [120.2, 22.6],
  [120.1, 23.5], [120.6, 24.6], [121.0, 25.3],
];

export const MAP_BOUNDS = { minLon: 73, maxLon: 135, minLat: 17, maxLat: 54 };
export const MAP_SIZE = { w: 1000, h: 620, pad: 26 };

/** Project lon/lat into the schematic map's viewBox. */
export function project(lon, lat) {
  const { w, h, pad } = MAP_SIZE;
  const { minLon, maxLon, minLat, maxLat } = MAP_BOUNDS;
  const x = pad + ((lon - minLon) / (maxLon - minLon)) * (w - pad * 2);
  const y = h - pad - ((lat - minLat) / (maxLat - minLat)) * (h - pad * 2);
  return [x, y];
}
