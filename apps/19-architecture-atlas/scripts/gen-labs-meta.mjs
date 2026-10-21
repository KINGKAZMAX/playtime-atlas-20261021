/**
 * 从 18-architecture-models 的六件模型生成静态元数据模块。
 *
 * 18 的模型描述符里 `build()` 依赖 three.js，而 `src/data/labs.js` 被首屏
 * 引入 —— 直接 import 模型会把 three 拖进首屏包。因此这里在**构建期**
 * 把模型的静态信息（标题、层级、构件名与作用、传力路径、装配次序）抽出来，
 * 写成不依赖 three 的纯数据模块 `src/data/labs-meta.js`。
 *
 * 运行时再按需动态 import 模型本身（见 src/views/labs.js）。
 *
 * 用法：node scripts/gen-labs-meta.mjs
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const MODELS_DIR = path.join(ROOT, 'src/lab/models');
const OUT = path.join(ROOT, 'src/data/labs-meta.js');

const { createMaterials } = await import(pathToFileURL(path.join(ROOT, 'src/lab/core/materials.js')));
const { validateModel, validateBuild } = await import(pathToFileURL(path.join(ROOT, 'src/lab/core/model-api.js')));

const files = fs.readdirSync(MODELS_DIR).filter((f) => f.endsWith('.js')).sort();
const materials = createMaterials();
const out = [];

/** A point is either [x, y, z] or { x, y, z }; the array form is canonical. */
const toVec3 = (v) => (Array.isArray(v) ? v : [v?.x ?? 0, v?.y ?? 0, v?.z ?? 0]);

for (const file of files) {
  const mod = await import(pathToFileURL(path.join(MODELS_DIR, file)));
  const model = mod.default;
  if (!model) { console.error(`✗ ${file}: 没有默认导出`); process.exit(1); }

  const errs = validateModel(model);
  if (errs.length) {
    console.error(`✗ ${file}: 未通过统一模型契约:\n   ${errs.join('\n   ')}`);
    process.exit(1);
  }

  const built = model.build(materials);
  const berrs = validateBuild(built, model);
  if (berrs.length) {
    console.error(`✗ ${file}: build() 产物未通过校验:\n   ${berrs.join('\n   ')}`);
    process.exit(1);
  }

  /* ---- 装配步骤 ------------------------------------------------------
   * part.order 是构件的装配次序（0 起升序）。viewer.setAssembly(step) 以
   * 「order 单位」推进，因此步次值 = 该步最后一个构件的 order + 1。
   * 步数取层数（4~6 步），把 order 序列等分，兼顾可读性与装配逻辑。 */
  const distinct = [...new Set(built.parts.map((p) => p.order))].sort((a, b) => a - b);
  const stepCount = Math.min(model.layers.length, distinct.length);
  const steps = [];
  for (let i = 0; i < stepCount; i += 1) {
    const lo = Math.floor((i * distinct.length) / stepCount);
    const hi = Math.floor(((i + 1) * distinct.length) / stepCount) - 1;
    const orders = distinct.slice(lo, hi + 1);
    if (!orders.length) continue;
    const parts = built.parts.filter((p) => orders.includes(p.order));
    const layerCounts = new Map();
    for (const p of parts) layerCounts.set(p.layer, (layerCounts.get(p.layer) || 0) + 1);
    const dominant = [...layerCounts.entries()].sort((a, b) => b[1] - a[1])[0][0];
    const label = model.layers.find((l) => l.id === dominant)?.label || { zh: dominant, en: dominant };
    steps.push({
      zh: `${steps.length + 1}. ${label.zh}（${parts.length} 件）`,
      en: `${steps.length + 1}. ${label.en} (${parts.length} parts)`,
      stepValue: Math.max(...orders) + 1,
    });
  }

  out.push({
    id: model.id,
    nameZh: model.title.zh,
    nameEn: model.title.en,
    py: model.pinyin,
    tagline: model.subtitle,
    intro: model.summary,
    loadPath: model.loadPath,
    era: model.era,
    region: model.region,
    scaleNote: model.scaleNote,
    catalogRefs: model.catalogRefs || [],
    camera: model.camera,
    modelFile: file,
    layers: model.layers.map((l) => ({
      id: l.id,
      nameZh: l.label.zh,
      nameEn: l.label.en,
      hint: l.hint || null,
      defaultVisible: l.defaultVisible !== false,
    })),
    parts: built.parts.map((p) => ({
      id: p.id,
      layer: p.layer,
      zh: p.name.zh,
      en: p.name.en,
      py: p.pinyin,
      note: { zh: p.role.zh, en: p.role.en },
      family: p.family,
      order: p.order,
    })),
    forces: (built.forces || []).map((f) => ({
      id: f.id,
      // 18's models spell a force endpoint either as [x, y, z] or as
      // { x, y, z }. Normalise to the array form here as well, so the static
      // metadata and the runtime agree on one shape.
      from: toVec3(f.from),
      to: toVec3(f.to),
      zh: f.label.zh,
      en: f.label.en,
      kind: f.kind,
    })),
    steps: steps.map((st) => ({ zh: st.zh, en: st.en, stepValue: st.stepValue })),
  });

  console.log(`✓ ${file} → ${model.id}：${built.parts.length} 构件 / ${model.layers.length} 层 / ${steps.length} 步 / ${(built.forces || []).length} 受力箭头`);
}

const body = out.map((m) => {
  const j = (o) => JSON.stringify(o);
  return `  {
    id: ${j(m.id)},
    nameZh: ${j(m.nameZh)},
    nameEn: ${j(m.nameEn)},
    py: ${j(m.py)},
    modelFile: ${j(m.modelFile)},
    tagline: { zh: ${j(m.tagline.zh)}, en: ${j(m.tagline.en)} },
    intro: { zh: ${j(m.intro.zh)}, en: ${j(m.intro.en)} },
    loadPath: { zh: ${j(m.loadPath.zh)}, en: ${j(m.loadPath.en)} },
    era: { zh: ${j(m.era.zh)}, en: ${j(m.era.en)} },
    region: { zh: ${j(m.region.zh)}, en: ${j(m.region.en)} },
    scaleNote: { zh: ${j(m.scaleNote.zh)}, en: ${j(m.scaleNote.en)} },
    catalogRefs: ${JSON.stringify(m.catalogRefs)},
    camera: { position: ${j(m.camera.position)}, target: ${j(m.camera.target)} },
    layers: [
${m.layers.map((l) => `      { id: ${j(l.id)}, nameZh: ${j(l.nameZh)}, nameEn: ${j(l.nameEn)}, hint: ${l.hint ? `{ zh: ${j(l.hint.zh)}, en: ${j(l.hint.en)} }` : 'null'}, defaultVisible: ${l.defaultVisible} },`).join('\n')}
    ],
    parts: [
${m.parts.map((p) => `      { id: ${j(p.id)}, layer: ${j(p.layer)}, zh: ${j(p.zh)}, en: ${j(p.en)}, py: ${j(p.py)}, family: ${j(p.family)}, order: ${p.order}, note: { zh: ${j(p.note.zh)}, en: ${j(p.note.en)} } },`).join('\n')}
    ],
    forces: [
${m.forces.map((f) => `      { id: ${j(f.id)}, kind: ${j(f.kind)}, from: ${j(f.from)}, to: ${j(f.to)}, zh: ${j(f.zh)}, en: ${j(f.en)} },`).join('\n')}
    ],
    steps: [
${m.steps.map((s) => `      { zh: ${j(s.zh)}, en: ${j(s.en)}, stepValue: ${s.stepValue} },`).join('\n')}
    ],
  },`;
}).join('\n');

const file = `/**
 * 六件结构模型的教学元数据 —— **由脚本生成，请勿手改**。
 *
 * 生成器：scripts/gen-labs-meta.mjs
 * 数据来源：18-architecture-models/src/models/*.js（统一模型接口 v1.1）
 *
 * 为什么要生成而不是直接 import：
 *   模型的 build() 依赖 three.js，而本模块被首屏引入。直接 import 会把
 *   three 拖进首屏包（违反「首屏不加载三维引擎」的性能分级要求）。
 *   这里在构建期抽出静态信息，运行期再按需动态 import 模型本身。
 *
 * 几何、材质与构件位置一律以 18 的模型为准；本文件不重新定义任何几何。
 */

export const LABS_META = [
${body}
];

export const LAB_META_BY_ID = Object.fromEntries(LABS_META.map((l) => [l.id, l]));
`;

fs.writeFileSync(OUT, file);
console.log(`\n✅ 已写入 ${path.relative(ROOT, OUT)}（${out.length} 件模型）`);
