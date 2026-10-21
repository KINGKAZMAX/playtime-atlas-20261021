/**
 * Static validation for the 构筑华夏 atlas.
 *
 * No browser required. It checks the things that are cheap to get wrong and
 * expensive to discover late:
 *
 *   1. catalog integrity  — required fields, taxonomy ids, source quality
 *   2. cross-references   — case ↔ lab ↔ glossary links resolve
 *   3. lab builders       — every model actually builds, and its part ids and
 *                           step counts match the published spec
 *   4. i18n               — every key is a complete zh/en pair, every key the
 *                           UI asks for exists
 *   5. hygiene            — no CDN, no web font, no external request, no
 *                           third-party asset
 *
 * Exit code is non-zero when any hard check fails.
 *
 * Usage: node scripts/validate.mjs
 */

import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, dirname, extname, relative } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { register } from 'node:module';

/**
 * The application imports its vendored JSON the way Vite expects
 * (`import upstream from './upstream/catalog.json'`). Node 24 wants an
 * explicit import attribute for JSON modules; rather than tie the source to
 * one bundler's syntax, this hook makes `.json` loadable as an ES module so
 * the validator can exercise the real data modules.
 */
register('./lib/json-loader.mjs', import.meta.url);

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SRC = join(ROOT, 'src');

/* ---------------------------------------------------------- browser shims */
globalThis.localStorage = {
  _v: new Map(),
  getItem(k) { return this._v.has(k) ? this._v.get(k) : null; },
  setItem(k, v) { this._v.set(k, String(v)); },
  removeItem(k) { this._v.delete(k); },
  clear() { this._v.clear(); },
  key() { return null; },
  get length() { return this._v.size; },
};
globalThis.document = { documentElement: { lang: 'en', dataset: {} } };
globalThis.window = { matchMedia: () => ({ matches: false, addEventListener() {}, removeEventListener() {} }) };

/* ------------------------------------------------------------- reporting */
const failures = [];
const warnings = [];
let checks = 0;

function ok(name, detail = '') {
  checks += 1;
  console.log(`  \x1b[32m✓\x1b[0m ${name}${detail ? `  \x1b[90m${detail}\x1b[0m` : ''}`);
}
function fail(name, detail = '') {
  checks += 1;
  failures.push(`${name}${detail ? ` — ${detail}` : ''}`);
  console.log(`  \x1b[31m✗\x1b[0m ${name}${detail ? `  \x1b[31m${detail}\x1b[0m` : ''}`);
}
function warn(name, detail = '') {
  warnings.push(`${name}${detail ? ` — ${detail}` : ''}`);
  console.log(`  \x1b[33m!\x1b[0m ${name}${detail ? `  \x1b[33m${detail}\x1b[0m` : ''}`);
}
function section(title) {
  console.log(`\n\x1b[1m${title}\x1b[0m`);
}
function assert(cond, name, detail = '') {
  if (cond) ok(name, detail); else fail(name, detail);
  return Boolean(cond);
}

/* ------------------------------------------------------------ file walks */
function walk(dir, filter = () => true) {
  const out = [];
  if (!existsSync(dir)) return out;
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) out.push(...walk(full, filter));
    else if (filter(full)) out.push(full);
  }
  return out;
}

const srcFiles = walk(SRC, (f) => ['.js', '.mjs', '.css'].includes(extname(f)));
const jsFiles = srcFiles.filter((f) => extname(f) === '.js');
const readSrc = (f) => readFileSync(f, 'utf8');

/* ------------------------------------------------------------ 1. catalog */
section('1 · Catalog data');

const { CASES } = await import(pathToFileURL(join(SRC, 'data/catalog.js')));
const { REGIONS, ERAS, SYSTEMS, MAP_BOUNDS } = await import(pathToFileURL(join(SRC, 'data/taxonomy.js')));
const { GLOSSARY } = await import(pathToFileURL(join(SRC, 'data/glossary.js')));
const { LABS } = await import(pathToFileURL(join(SRC, 'data/labs.js')));
const { QUIZ } = await import(pathToFileURL(join(SRC, 'data/quiz.js')));

const regionIds = new Set(REGIONS.map((r) => r.id));
const eraIds = new Set(ERAS.map((e) => e.id));
const systemIds = new Set(SYSTEMS.map((s) => s.id));
const labIds = new Set(LABS.map((l) => l.id));
const glossIds = new Set(GLOSSARY.map((g) => g.id));
const caseIds = new Set(CASES.map((c) => c.id));

/**
 * Official Chinese government endpoints that are reachable over HTTP only —
 * they do not answer on TLS. Every one of these was checked on 2026-10-21
 * and is listed in SOURCES.md with the same date. Any other http:// source
 * is a validation failure.
 */
const HTTP_ONLY_HOSTS = new Set([
  'www.yingxian.gov.cn',   // 应县人民政府 — 应县木塔
  'www.ncha.gov.cn',       // 国家文物局 — 佛光寺东大殿
  'wutai.gov.cn',          // 五台县人民政府 — 五台山建筑群
  'www.hrbdw.gov.cn',      // 哈尔滨市道外区人民政府 — 中华巴洛克街区
  'wwj.wlt.fujian.gov.cn', // 福建省文旅厅 — 华林寺 / 陈家祠
  'www.sjx.gov.cn',        // 晋江市人民政府 — 草庵 / 祇园
  'www.zhongguowenwubao.com', // 中国文物报（数字报）— 南禅寺 / 佛光寺 / 开化寺
  'sn.people.com.cn',   // 人民网陕西频道 — 柏社村地坑窑（TLS 证书不匹配，只能走 http）
]);

/** XML namespace URIs are identifiers, not network endpoints. */
const NAMESPACE_URI = /^https?:\/\/www\.w3\.org\//;

assert(CASES.length >= 36, 'catalog.entryCount', `${CASES.length} entries (>= 36 required)`);

const PAIR_FIELDS = ['type', 'yearText', 'principle', 'culture', 'ethnicity'];
const caseProblems = [];
for (const c of CASES) {
  const where = c.id || '<no id>';
  if (!/^[a-z0-9-]+$/.test(c.id || '')) caseProblems.push(`${where}: id is not kebab-case`);
  if (!c.nameZh || !c.nameEn || !c.pinyin) caseProblems.push(`${where}: missing name/pinyin`);
  if (!regionIds.has(c.region)) caseProblems.push(`${where}: unknown region "${c.region}"`);
  if (!eraIds.has(c.era)) caseProblems.push(`${where}: unknown era "${c.era}"`);
  if (!systemIds.has(c.system)) caseProblems.push(`${where}: unknown system "${c.system}"`);
  if (!['certain', 'approx', 'disputed', 'not-applicable'].includes(c.yearUncertainty)) {
    caseProblems.push(`${where}: bad yearUncertainty "${c.yearUncertainty}"`);
  }
  if (!c.province || !c.locality) caseProblems.push(`${where}: missing province/locality`);
  for (const f of PAIR_FIELDS) {
    const v = c[f];
    if (!v || typeof v !== 'object' || !v.zh || !v.en) caseProblems.push(`${where}: ${f} is not a complete zh/en pair`);
  }
  if (!c.caveat || !c.caveat.zh || !c.caveat.en) caseProblems.push(`${where}: missing caveat`);
  if (!Array.isArray(c.sources) || !c.sources.length) caseProblems.push(`${where}: no sources`);
  else {
    if (!c.sources.some((s) => s.type === 'primary')) caseProblems.push(`${where}: no primary source`);
    for (const s of c.sources) {
      if (!/^https?:\/\//.test(s.url || '')) caseProblems.push(`${where}: source url is not http(s) — ${s.url}`);
      else if (!/^https:\/\//.test(s.url) && !HTTP_ONLY_HOSTS.has(new URL(s.url).host)) {
        caseProblems.push(`${where}: http source outside the documented allowlist — ${s.url}`);
      }
      if (!s.label || !s.accessedAt) caseProblems.push(`${where}: source missing label/accessedAt`);
    }
  }
  for (const lid of c.labs || []) if (!labIds.has(lid)) caseProblems.push(`${where}: unknown lab "${lid}"`);
  for (const tid of c.terms || []) if (!glossIds.has(tid)) caseProblems.push(`${where}: unknown term "${tid}"`);
  const lon = Number(c.lon); const lat = Number(c.lat);
  if (!Number.isFinite(lon) || !Number.isFinite(lat)) caseProblems.push(`${where}: bad coordinates`);
  else if (lon < MAP_BOUNDS.minLon - 12 || lon > MAP_BOUNDS.maxLon + 12 || lat < MAP_BOUNDS.minLat - 6 || lat > MAP_BOUNDS.maxLat + 6) {
    caseProblems.push(`${where}: coordinates outside the plausible range`);
  }
}
assert(caseProblems.length === 0, 'catalog.entryIntegrity', caseProblems.length ? `${caseProblems.length} problems: ${caseProblems.slice(0, 6).join('; ')}` : `${CASES.length} entries checked`);
assert(caseIds.size === CASES.length, 'catalog.uniqueIds', `${caseIds.size} unique / ${CASES.length} total`);

const coveredRegions = new Set(CASES.map((c) => c.region));
const coveredEras = new Set(CASES.map((c) => c.era));
// A case may carry several structural systems; `c.system` is only the primary
// one, so coverage is measured over the full list.
const coveredSystems = new Set(CASES.flatMap((c) => c.systems || []));
assert(coveredRegions.size === REGIONS.length, 'catalog.everyRegionUsed', `${coveredRegions.size}/${REGIONS.length}`);

// The vocabulary is wider than the catalogue on purpose: 17 keeps every era
// and every structural characteristic in the taxonomy so the site can speak
// about them, while the sample itself has no case in three of the eras.
// That is a scope fact, not a defect — report it, do not fail on it.
const emptyEras = ERAS.filter((e) => !coveredEras.has(e.id)).map((e) => e.nameEn);
if (emptyEras.length) {
  warn('catalog.erasWithoutCases', `${coveredEras.size}/${ERAS.length} — no case in: ${emptyEras.join(', ')}`);
} else {
  ok('catalog.erasWithoutCases', `all ${ERAS.length} eras carry at least one case`);
}
const unusedSystems = SYSTEMS.filter((s) => !coveredSystems.has(s.id)).map((s) => s.nameEn);
if (unusedSystems.length) {
  warn('catalog.systemsWithoutCases', `${coveredSystems.size}/${SYSTEMS.length} — no case carries: ${unusedSystems.join(', ')}`);
} else {
  ok('catalog.systemsWithoutCases', `all ${SYSTEMS.length} systems are carried by at least one case`);
}

const sourceUrls = new Set();
for (const c of CASES) for (const s of c.sources || []) sourceUrls.add(s.url);
const primaryCount = new Set();
for (const c of CASES) for (const s of c.sources || []) if (s.type === 'primary') primaryCount.add(s.url);
assert(primaryCount.size >= 30, 'catalog.primarySourceBreadth', `${primaryCount.size} distinct primary sources, ${sourceUrls.size} total`);

/* ---------------------------------------------------------- 2. glossary */
section('2 · Glossary');

const glossProblems = [];
for (const g of GLOSSARY) {
  if (!g.id || !g.zh || !g.py || !g.en) glossProblems.push(`${g.id || '?'}: missing id/zh/py/en`);
  if (!g.cat || !g.cat.zh || !g.cat.en) glossProblems.push(`${g.id}: missing category pair`);
  if (!g.short || !g.short.zh || !g.short.en) glossProblems.push(`${g.id}: missing short pair`);
  for (const cid of g.cases || []) if (!caseIds.has(cid)) glossProblems.push(`${g.id}: unknown case "${cid}"`);
}
assert(GLOSSARY.length >= 40, 'glossary.entryCount', `${GLOSSARY.length} entries (>= 40 required)`);
assert(glossProblems.length === 0, 'glossary.integrity', glossProblems.slice(0, 5).join('; '));
assert(new Set(GLOSSARY.map((g) => g.id)).size === GLOSSARY.length, 'glossary.uniqueIds');

/* ------------------------------------------------------------- 3. labs */
section('3 · Structural labs');

/**
 * A point is either a three-element array or a `{ x, y, z }` object.
 * 18's models use both: most forces are arrays, a few are plain objects.
 * The runtime normalises them (see src/views/labs.js) before handing the
 * geometry to three.js, which only understands arrays.
 */
const isVec3 = (v) => (Array.isArray(v) && v.length === 3 && v.every((n) => typeof n === 'number'))
  || (v && typeof v === 'object' && ['x', 'y', 'z'].every((k) => typeof v[k] === 'number'));

assert(LABS.length === 6, 'labs.count', `${LABS.length} labs`);

const labProblems = [];
for (const lab of LABS) {
  if (!lab.id || !lab.nameZh || !lab.nameEn || !lab.py) labProblems.push(`${lab.id || '?'}: missing identity fields`);
  for (const f of ['tagline', 'intro']) {
    if (!lab[f] || !lab[f].zh || !lab[f].en) labProblems.push(`${lab.id}: ${f} is not a complete pair`);
  }
  if (!lab.layers?.length) labProblems.push(`${lab.id}: no layers`);
  if (!lab.parts?.length) labProblems.push(`${lab.id}: no parts`);
  if (!lab.steps?.length) labProblems.push(`${lab.id}: no steps`);
  if (!lab.facts?.length) labProblems.push(`${lab.id}: no facts`);
  const layerIds = new Set((lab.layers || []).map((l) => l.id));
  const partIds = new Set();
  for (const p of lab.parts || []) {
    if (partIds.has(p.id)) labProblems.push(`${lab.id}: duplicate part id "${p.id}"`);
    partIds.add(p.id);
    if (!layerIds.has(p.layer)) labProblems.push(`${lab.id}: part "${p.id}" references unknown layer "${p.layer}"`);
    if (!p.zh || !p.en || !p.py) labProblems.push(`${lab.id}: part "${p.id}" missing names/pinyin`);
    if (!p.note?.zh || !p.note?.en) labProblems.push(`${lab.id}: part "${p.id}" missing note pair`);
  }
  // In 18's model contract the force arrows are a separate array on the
  // model, not a per-part field: each arrow carries its own bilingual label.
  for (const f of lab.forces || []) {
    if (!f.id || !f.kind) labProblems.push(`${lab.id}: a force arrow is missing id/kind`);
    if (!f.zh || !f.en) labProblems.push(`${lab.id}: force arrow "${f.id}" is not a complete pair`);
    if (!isVec3(f.from)) labProblems.push(`${lab.id}: force arrow "${f.id}" has a bad from`);
    if (!isVec3(f.to)) labProblems.push(`${lab.id}: force arrow "${f.id}" has a bad to`);
  }
  if (!(lab.forces || []).length) labProblems.push(`${lab.id}: no force arrows`);
  for (const s of lab.steps || []) if (!s.zh || !s.en) labProblems.push(`${lab.id}: a step is not a complete pair`);
  for (const f of lab.facts || []) if (!f.zh || !f.en) labProblems.push(`${lab.id}: a fact is not a complete pair`);
}
assert(labProblems.length === 0, 'labs.integrity', labProblems.slice(0, 6).join('; '));

/* ------------------------------------------------- 3b. model execution */
section('3b · Model execution (each 3D model actually builds)');

/**
 * The six models live in 18-architecture-models and are vendored under
 * ./lab/models/ with their runtime under ./lab/core/. They are loaded on
 * demand, so three.js never touches the first screen.
 *
 * This section re-runs the check the generator runs: import the model, build
 * it against 18's own contract, and confirm the built geometry agrees with
 * the published metadata in ./data/labs-meta.js. A drift between the two is
 * exactly the kind of defect that stays invisible until someone opens a lab.
 *
 * Unlike the old self-built "builders", these models are real three.js
 * geometry — so the real three.js is used here too. A stub would let a
 * broken model pass.
 */
const { createMaterials } = await import(pathToFileURL(join(SRC, 'lab/core/materials.js')));
const { validateModel, validateBuild } = await import(pathToFileURL(join(SRC, 'lab/core/model-api.js')));

const modelProblems = [];
const materials = createMaterials();

for (const lab of LABS) {
  const file = join(SRC, 'lab/models', `${lab.id}.js`);
  if (!existsSync(file)) { modelProblems.push(`${lab.id}: model file missing`); continue; }
  const src = readFileSync(file, 'utf8');

  if (/https?:\/\//.test(src)) modelProblems.push(`${lab.id}: contains an external URL`);
  if (/TextureLoader|GLTFLoader|OBJLoader|FBXLoader|fetch\(|XMLHttpRequest/.test(src)) {
    modelProblems.push(`${lab.id}: loads an external asset`);
  }

  let model = null;
  try {
    const mod = await import(pathToFileURL(file));
    model = mod.default;
  } catch (err) {
    modelProblems.push(`${lab.id}: import threw — ${String(err && err.message ? err.message : err)}`);
    continue;
  }
  if (!model) { modelProblems.push(`${lab.id}: no default export`); continue; }

  const modelErrs = validateModel(model);
  if (modelErrs.length) modelProblems.push(`${lab.id}: breaks the model contract — ${modelErrs.slice(0, 3).join('; ')}`);

  let built = null;
  try {
    built = model.build(materials);
  } catch (err) {
    modelProblems.push(`${lab.id}: build() threw — ${String(err && err.message ? err.message : err)}`);
    continue;
  }
  const buildErrs = validateBuild(built, model);
  if (buildErrs.length) modelProblems.push(`${lab.id}: build() output is invalid — ${buildErrs.slice(0, 3).join('; ')}`);

  const parts = built?.parts;
  if (!Array.isArray(parts)) { modelProblems.push(`${lab.id}: build produced no parts array`); continue; }

  const specIds = new Set(lab.parts.map((p) => p.id));
  const builtIds = new Set(parts.map((p) => p.id));
  const missing = [...specIds].filter((id) => !builtIds.has(id));
  const extra = [...builtIds].filter((id) => !specIds.has(id));
  if (missing.length) modelProblems.push(`${lab.id}: built geometry is missing ${missing.join(', ')}`);
  if (extra.length) modelProblems.push(`${lab.id}: built geometry adds ${extra.join(', ')}`);

  const layerIds = new Set((lab.layers || []).map((l) => l.id));
  for (const p of parts) {
    if (!layerIds.has(p.layer)) modelProblems.push(`${lab.id}: part "${p.id}" references unknown layer "${p.layer}"`);
  }

  // Every part needs a non-zero explode vector and an ascending order that
  // starts at 0 — the viewer's assembly-step maths depends on both.
  const orders = parts.map((p) => p.order).filter((o) => typeof o === 'number').sort((a, b) => a - b);
  if (orders.length && orders[0] !== 0) modelProblems.push(`${lab.id}: part orders do not start at 0`);
  for (const p of parts) {
    const ex = p.explode;
    const len = Array.isArray(ex)
      ? Math.hypot(ex[0] || 0, ex[1] || 0, ex[2] || 0)
      : (ex && typeof ex === 'object'
        ? Math.hypot(ex.x || 0, ex.y || 0, ex.z || 0)
        : 0);
    if (!len) modelProblems.push(`${lab.id}: part "${p.id}" has a zero explode vector`);
  }

  if (parts.length !== lab.parts.length) {
    modelProblems.push(`${lab.id}: ${parts.length} parts built vs ${lab.parts.length} published`);
  }
  if ((built.forces || []).length !== (lab.forces || []).length) {
    modelProblems.push(`${lab.id}: ${(built.forces || []).length} force arrows built vs ${(lab.forces || []).length} published`);
  }
}
assert(modelProblems.length === 0, 'models.buildAndMatchMeta',
  modelProblems.length ? modelProblems.slice(0, 6).join('; ') : `${LABS.length} models build against the real three.js and agree with labs-meta.js`);

// The vendored copies must stay byte-identical to 18's, so the handoff stays
// auditable: a diff here means somebody edited a vendored file in place.
const UPSTREAM_18 = join(ROOT, '..', '18-architecture-models', 'src');
const drift = [];
for (const sub of ['core', 'models']) {
  const mine = join(SRC, 'lab', sub);
  const theirs = join(UPSTREAM_18, sub);
  if (!existsSync(theirs)) { drift.push(`${sub}: 18 not found at ${theirs}`); continue; }
  for (const name of readdirSync(mine)) {
    const a = join(mine, name);
    const b = join(theirs, name);
    if (!existsSync(b)) { drift.push(`${sub}/${name}: not in 18`); continue; }
    if (!readFileSync(a).equals(readFileSync(b))) drift.push(`${sub}/${name}: differs from 18`);
  }
}
assert(drift.length === 0, 'models.vendoredFrom18Unchanged',
  drift.length ? drift.slice(0, 5).join('; ') : 'vendored copies are byte-identical to 18-architecture-models');

/* -------------------------------------------------------------- 4. quiz */
section('4 · Quiz');
const quizProblems = [];
for (const q of QUIZ) {
  if (!q.q?.zh || !q.q?.en) quizProblems.push(`${q.id}: question pair incomplete`);
  if (!Array.isArray(q.options) || q.options.length < 2) quizProblems.push(`${q.id}: too few options`);
  for (const o of q.options || []) if (!o.zh || !o.en) quizProblems.push(`${q.id}: an option pair is incomplete`);
  if (typeof q.answer !== 'number' || q.answer < 0 || q.answer >= (q.options?.length ?? 0)) quizProblems.push(`${q.id}: answer index out of range`);
  if (!q.explain?.zh || !q.explain?.en) quizProblems.push(`${q.id}: explanation pair incomplete`);
}
assert(QUIZ.length >= 10, 'quiz.count', `${QUIZ.length} questions`);
assert(quizProblems.length === 0, 'quiz.integrity', quizProblems.slice(0, 5).join('; '));

/* -------------------------------------------------------------- 5. i18n */
section('5 · Bilingual strings');

const { I18N_TABLE } = await import(pathToFileURL(join(SRC, 'core/i18n.js')));
const pairKeys = Object.keys(I18N_TABLE);
const badPairs = [];
for (const [key, row] of Object.entries(I18N_TABLE)) {
  if (!Array.isArray(row) || row.length !== 2) { badPairs.push(`${key}: not a 2-tuple`); continue; }
  const [zh, en] = row;
  if (Array.isArray(zh) || Array.isArray(en)) {
    if (!Array.isArray(zh) || !Array.isArray(en) || zh.length !== en.length) { badPairs.push(`${key}: array pair mismatch`); continue; }
    if (zh.some((v) => !v || !String(v).trim())) badPairs.push(`${key}: empty zh entry`);
    if (en.some((v) => !v || !String(v).trim())) badPairs.push(`${key}: empty en entry`);
  } else {
    if (!zh || !String(zh).trim()) badPairs.push(`${key}: empty zh`);
    if (!en || !String(en).trim()) badPairs.push(`${key}: empty en`);
  }
}
assert(badPairs.length === 0, 'i18n.pairsComplete', badPairs.slice(0, 6).join('; '));

/**
 * A key counts as used if it is passed to t() directly, or if it appears as a
 * string literal anywhere in the source (keys are sometimes held in a table
 * and passed by variable).
 */
const usedKeys = new Set();
const keySet = new Set(pairKeys);
const literalCallKeys = new Set();
for (const file of jsFiles) {
  const src = readSrc(file);
  for (const m of src.matchAll(/'([^'\\\n]+)'/g)) if (keySet.has(m[1])) usedKeys.add(m[1]);
  for (const m of src.matchAll(/"([^"\\\n]+)"/g)) if (keySet.has(m[1])) usedKeys.add(m[1]);
  for (const m of src.matchAll(/`([^`\\]+)`/g)) if (keySet.has(m[1])) usedKeys.add(m[1]);
  // keys handed straight to t() — a typo here is a hard failure
  for (const m of src.matchAll(/\bt\(\s*'([^']+)'/g)) literalCallKeys.add(m[1]);
  for (const m of src.matchAll(/\bt\(\s*"([^"]+)"/g)) literalCallKeys.add(m[1]);
}
const missingKeys = [...literalCallKeys].filter((k) => !(k in I18N_TABLE));
assert(missingKeys.length === 0, 'i18n.noMissingKeys', missingKeys.length ? missingKeys.join(', ') : `${literalCallKeys.size} literal keys resolved`);

const unusedKeys = pairKeys.filter((k) => !usedKeys.has(k));
if (unusedKeys.length) warn('i18n.unusedKeys', `${unusedKeys.length}: ${unusedKeys.slice(0, 12).join(', ')}`);
else ok('i18n.unusedKeys', 'none');

/* ------------------------------------------ 5b. bilingual consistency */
section('5b · Bilingual consistency (mechanical)');

/**
 * 15's acceptance requirement: a mechanical check that (a) every i18n key has
 * a non-empty value in BOTH languages, and (b) no Chinese string is ever
 * served as the English text. 13-qa-curation reads the verdict of these two
 * checks directly, so each one is named and reports a count.
 */

const CJK = /[\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff]/;

/** Every leaf of a nested bilingual structure, as [path, value] pairs. */
function collectLeaves(node, path = [], out = []) {
  if (typeof node === 'string') { out.push([path.join('.'), node]); return out; }
  if (Array.isArray(node)) {
    node.forEach((v, i) => collectLeaves(v, [...path, String(i)], out));
    return out;
  }
  if (node && typeof node === 'object') {
    for (const [k, v] of Object.entries(node)) collectLeaves(v, [...path, k], out);
  }
  return out;
}

/* --- 5b-1: every i18n key has a non-empty value in both languages -------- */

const incomplete = [];
for (const [key, row] of Object.entries(I18N_TABLE)) {
  if (!Array.isArray(row) || row.length !== 2) { incomplete.push(`${key}: not a 2-tuple`); continue; }
  const [zh, en] = row;
  if (Array.isArray(zh) || Array.isArray(en)) {
    if (!Array.isArray(zh) || !Array.isArray(en) || zh.length !== en.length) {
      incomplete.push(`${key}: array pair mismatch`);
      continue;
    }
    if (zh.some((v) => !v || !String(v).trim())) incomplete.push(`${key}: empty zh entry`);
    if (en.some((v) => !v || !String(v).trim())) incomplete.push(`${key}: empty en entry`);
  } else {
    if (!zh || !String(zh).trim()) incomplete.push(`${key}: empty zh`);
    if (!en || !String(en).trim()) incomplete.push(`${key}: empty en`);
  }
}
assert(incomplete.length === 0, 'bilingual.everyKeyHasBothLanguages',
  incomplete.length ? `${incomplete.length} incomplete: ${incomplete.slice(0, 6).join('; ')}`
                    : `${Object.keys(I18N_TABLE).length} keys, both languages non-empty`);

/* --- 5b-2: the English half never contains Chinese --------------------- */

const cjkInEnglish = [];
for (const [key, row] of Object.entries(I18N_TABLE)) {
  if (!Array.isArray(row) || row.length !== 2) continue;
  const en = row[1];
  const leaves = Array.isArray(en) ? en.flatMap((v) => collectLeaves(v)) : collectLeaves(en);
  for (const [path, value] of leaves) {
    if (typeof value === 'string' && CJK.test(value)) {
      cjkInEnglish.push(`${key}${path ? `.${path}` : ''}: ${value.slice(0, 48)}`);
    }
  }
}
assert(cjkInEnglish.length === 0, 'bilingual.englishSideHasNoChinese',
  cjkInEnglish.length ? `${cjkInEnglish.length} leak(s): ${cjkInEnglish.slice(0, 6).join(' | ')}`
                      : 'no Chinese text in any English string');

/* --- 5b-3: bilingual DATA pairs — the English side stays English -------- */

const dataCjk = [];
const DATA_FILES = [
  'data/quiz.js', 'data/labs.js', 'data/labs-meta.js', 'data/taxonomy.js',
  'data/glossary.js', 'data/catalog.js', 'data/enrichment.js',
];
for (const rel of DATA_FILES) {
  const file = join(SRC, rel);
  if (!existsSync(file)) continue;
  const src = readFileSync(file, 'utf8');
  // any `...En: '…'` / `en: '…'` style literal that carries Chinese
  for (const m of src.matchAll(/\b(?:en|[A-Za-z]*En)\s*:\s*(['"`])([^'"`]*)\1/g)) {
    if (CJK.test(m[2])) dataCjk.push(`${rel}: ${m[0].slice(0, 70)}`);
  }
  // any `{ zh, en }` pair whose en side is Chinese
  for (const m of src.matchAll(/\ben\s*:\s*(['"`])([^'"`]*)\1/g)) {
    if (CJK.test(m[2])) dataCjk.push(`${rel}: ${m[0].slice(0, 70)}`);
  }
}
const dataCjkUnique = [...new Set(dataCjk)];
assert(dataCjkUnique.length === 0, 'bilingual.dataEnglishSideHasNoChinese',
  dataCjkUnique.length ? `${dataCjkUnique.length} leak(s): ${dataCjkUnique.slice(0, 6).join(' | ')}`
                        : 'no Chinese text in any English data field');

/* --- 5b-4: no hardcoded Chinese in the rendering layer ----------------- */

const RENDER_FILES = jsFiles.filter((f) => {
  const rel = relative(SRC, f);
  if (rel.startsWith('core/i18n.js')) return false;   // the table itself
  if (rel.startsWith('data/')) return false;          // bilingual data
  if (rel.startsWith('lab/')) return false;           // 18's models, bilingual pairs
  if (rel === 'qa.js') return false;                  // asserts on Chinese text
  return true;
});

const RENDER_ATTR = /(?:text|html|placeholder|title|aria-label|aria-description)\s*:\s*(['"`])([^'"`]*)\1/g;

/**
 * The one legitimate Chinese literal in the rendering layer: the language
 * switch is labelled by the language's own name ("中文" / "EN"), in both
 * languages, exactly as a reader expects. Everything else is a leak.
 */
const ALLOWED_CHINESE_LITERALS = new Set([
  'main.js|中文',
]);

const hardcoded = [];
for (const file of RENDER_FILES) {
  const rel = relative(SRC, file);
  const src = readFileSync(file, 'utf8');
  for (const m of src.matchAll(RENDER_ATTR)) {
    if (!CJK.test(m[2])) continue;
    if (ALLOWED_CHINESE_LITERALS.has(`${rel}|${m[2]}`)) continue;
    hardcoded.push(`${rel}: ${m[0].slice(0, 70)}`);
  }
}
assert(hardcoded.length === 0, 'bilingual.noHardcodedChineseInRenderLayer',
  hardcoded.length ? `${hardcoded.length} leak(s): ${hardcoded.slice(0, 6).join(' | ')}`
                   : `${RENDER_FILES.length} rendering files carry no hardcoded Chinese`);

/* --- 5b-5: English is the default, and the language is on <html> -------- */

const storeSrc = readFileSync(join(SRC, 'core/store.js'), 'utf8');
const defaultLang = /lang:\s*'([a-z-]+)'/.exec(storeSrc);
assert(Boolean(defaultLang) && defaultLang[1] === 'en', 'bilingual.defaultIsEnglish',
  defaultLang ? `store default lang = "${defaultLang[1]}"` : 'no default lang found in store.js');

const i18nSrc = readFileSync(join(SRC, 'core/i18n.js'), 'utf8');
assert(/documentElement\.lang\s*=/.test(i18nSrc), 'bilingual.htmlLangIsSynced',
  'setLanguage() writes document.documentElement.lang');
assert(/readLangParam|applyLangFromUrl/.test(i18nSrc), 'bilingual.deepLinkCarriesLanguage',
  '?lang= deep link is honoured');

/* --- 5b-6: every data record carries both languages -------------------- */

const pairGaps = [];
for (const c of CASES) {
  for (const f of ['type', 'yearText', 'principle', 'culture', 'ethnicity']) {
    const v = c[f];
    if (!v || !v.zh || !v.en) pairGaps.push(`${c.id}.${f}`);
  }
  if (!c.caveat?.zh || !c.caveat?.en) pairGaps.push(`${c.id}.caveat`);
}
for (const g of GLOSSARY) {
  if (!g.short?.zh || !g.short?.en) pairGaps.push(`${g.id}.short`);
  if (!g.cat?.zh || !g.cat?.en) pairGaps.push(`${g.id}.cat`);
}
for (const lab of LABS) {
  for (const p of lab.parts || []) {
    if (!p.zh || !p.en) pairGaps.push(`${lab.id}.${p.id}.name`);
    if (!p.note?.zh || !p.note?.en) pairGaps.push(`${lab.id}.${p.id}.note`);
  }
  for (const s of lab.steps || []) if (!s.zh || !s.en) pairGaps.push(`${lab.id}.step`);
}
assert(pairGaps.length === 0, 'bilingual.everyRecordHasBothLanguages',
  pairGaps.length ? `${pairGaps.length} gap(s): ${pairGaps.slice(0, 6).join(', ')}`
                  : `${CASES.length} cases, ${GLOSSARY.length} terms, ${LABS.length} labs — all bilingual`);

/* ---------------------------------------------------------- 6. hygiene */
section('6 · Asset and network hygiene');

const URL_ALLOWED = new Set([
  join('src', 'data', 'catalog.js'),
  join('src', 'data', 'glossary.js'),
  join('src', 'views', 'sources.js'),
]);
const urlHits = [];
for (const file of srcFiles) {
  const rel = relative(ROOT, file);
  const src = readSrc(file);
  for (const m of src.matchAll(/https?:\/\/[^\s'"`)]+/g)) {
    if (URL_ALLOWED.has(rel)) continue;
    if (NAMESPACE_URI.test(m[0])) continue;
    urlHits.push(`${rel}: ${m[0].slice(0, 60)}`);
  }
}
assert(urlHits.length === 0, 'hygiene.noExternalUrlsInSource', urlHits.slice(0, 5).join(' | '));

const loaderHits = [];
for (const file of jsFiles) {
  const rel = relative(ROOT, file);
  if (rel.endsWith('views/sources.js')) continue;
  const src = readSrc(file);
  if (/\bfetch\s*\(|XMLHttpRequest|EventSource|navigator\.sendBeacon/.test(src)) loaderHits.push(`${rel}: network call`);
}
assert(loaderHits.length === 0, 'hygiene.noNetworkCalls', loaderHits.join(' | '));

const html = readFileSync(join(ROOT, 'index.html'), 'utf8');
const htmlUrls = (html.match(/https?:\/\/[^\s'"`)]+/g) || []).filter((u) => !NAMESPACE_URI.test(u));
assert(htmlUrls.length === 0, 'hygiene.noExternalUrlInHtml', htmlUrls.slice(0, 3).join(' '));
assert(!/@import\s+url\(|fonts\.googleapis|cdn\.|unpkg|jsdelivr/.test(html), 'hygiene.noCdnOrWebFont');

const cssHits = [];
for (const file of srcFiles.filter((f) => extname(f) === '.css')) {
  const src = readSrc(file);
  if (/url\(\s*['"]?https?:/.test(src)) cssHits.push(relative(ROOT, file));
  if (/@import\s+url\(['"]?https?:/.test(src)) cssHits.push(relative(ROOT, file));
}
assert(cssHits.length === 0, 'hygiene.noRemoteAssets', cssHits.join(' | '));

const tokenCss = readFileSync(join(SRC, 'styles/tokens.css'), 'utf8');
const fontVars = ['--font-display', '--font-body', '--font-mono'].filter((v) => tokenCss.includes(`${v}:`));
assert(fontVars.length === 3, 'hygiene.systemFontsOnly', `${fontVars.length}/3 font stacks declared`);
assert(!/@font-face/.test(tokenCss), 'hygiene.noWebfontFace', 'no @font-face rule — system faces only');

const assetExts = ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.avif', '.ttf', '.otf', '.woff', '.woff2', '.glb', '.gltf', '.fbx', '.obj', '.mp4', '.mp3'];
const bundled = walk(ROOT, (f) => {
  if (f.includes('/node_modules/') || f.includes('/dist/') || f.includes('/.git/')) return false;
  return assetExts.includes(extname(f).toLowerCase());
});
// Self-hosted OFL fonts are the site's only bundled binaries and they are
// licensed (see LICENSES.md). Everything else would be an unlicensed asset.
const ALLOWED_BUNDLED = ['public/fonts/'];
const bundledReal = bundled.filter((f) => {
  const rel = relative(ROOT, f);
  if (ALLOWED_BUNDLED.some((p) => rel.includes(p))) return false;
  if (rel.includes('research/') || rel.includes('screenshot') || rel.includes('evidence/')) return false;
  return true;
});
if (bundledReal.length) warn('hygiene.bundledBinary', bundledReal.map((f) => relative(ROOT, f)).join(', '));
else ok('hygiene.bundledBinary', 'no unlicensed binaries — only the self-hosted OFL fonts in public/fonts/');

/* ------------------------------------------------------ 7. build output */
section('7 · Build output');

const dist = join(ROOT, 'dist');
if (!existsSync(dist)) {
  fail('build.distExists', 'dist/ not found — run `npm run build` first');
} else {
  ok('build.distExists');
  const distFiles = walk(dist);
  const distHtml = readFileSync(join(dist, 'index.html'), 'utf8');
  const distUrls = (distHtml.match(/https?:\/\/[^\s'"`)]+/g) || []).filter((u) => !NAMESPACE_URI.test(u));
  assert(distUrls.length === 0, 'build.noExternalUrl', distUrls.slice(0, 3).join(' '));
  assert(/\.\/assets\//.test(distHtml), 'build.relativeAssetPaths', 'sub-path safe');
  const threeChunk = distFiles.find((f) => /assets\/three-.*\.js$/.test(f));
  assert(Boolean(threeChunk), 'build.threeIsSeparateChunk', threeChunk ? relative(ROOT, threeChunk) : 'not found');
  const entryChunk = distFiles.find((f) => /assets\/index-.*\.js$/.test(f));
  if (entryChunk) {
    const code = readFileSync(entryChunk, 'utf8');
    const staticThree = /^\s*import\s[^;]*['"][^'"]*three-/m.test(code);
    assert(!staticThree, 'build.threeNotOnFirstScreen', 'the entry chunk does not statically import three.js');
  }
}

/* ------------------------------------------------------------- summary */
console.log('');
if (warnings.length) {
  console.log(`\x1b[33m${warnings.length} warning(s)\x1b[0m`);
  for (const w of warnings) console.log(`  \x1b[33m·\x1b[0m ${w}`);
}
if (failures.length) {
  console.log(`\n\x1b[31m${failures.length} of ${checks} checks FAILED\x1b[0m`);
  for (const f of failures) console.log(`  \x1b[31m✗\x1b[0m ${f}`);
  process.exit(1);
}
console.log(`\x1b[32mAll ${checks} checks passed.\x1b[0m`);
process.exit(0);
