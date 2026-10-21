#!/usr/bin/env node
/**
 * build-model-index.mjs — 生成机器可读的模型清单 / machine-readable model index
 *
 * 输出 `models/index.json`，供 19-architecture-atlas 与 13-qa-curation 消费：
 *   id / 名称 / 部件数 / 拆解层级 / 导出格式 / 体积 / 史实参照 / 坐标系约定
 *
 * 用法：
 *   node scripts/build-model-index.mjs
 *
 * 说明：
 *   · 直接 import 六个模型描述符，因此清单与源码**同源**，不会漂移。
 *   · `export.measuredGlbBytes` 为浏览器内实测的 GLB 字节数（见 README「模型清单」节），
 *     由 `qa/qa.mjs` 在验收时重新实测比对，偏差即视为失败。
 */
import { writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as THREE from 'three';

import { validateModel, validateBuild } from '../src/core/model-api.js';
import { createMaterials } from '../src/core/materials.js';

import dougong from '../src/models/dougong.js';
import mortise from '../src/models/mortise.js';
import taoliang from '../src/models/taoliang.js';
import chuandou from '../src/models/chuandou.js';
import stoneArch from '../src/models/stone-arch.js';
import tulou from '../src/models/tulou.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'models', 'index.json');

const MODELS = [
  { file: 'src/models/dougong.js', model: dougong },
  { file: 'src/models/mortise.js', model: mortise },
  { file: 'src/models/taoliang.js', model: taoliang },
  { file: 'src/models/chuandou.js', model: chuandou },
  { file: 'src/models/stone-arch.js', model: stoneArch },
  { file: 'src/models/tulou.js', model: tulou },
];

/** 浏览器内实测的 GLB 字节数（Chromium / three r169 / 元数据写入后）。
 *  由 qa/qa.mjs 重新实测比对；升级 three 或改动几何后须同步更新。 */
const MEASURED_GLB_BYTES = {
  dougong: 276412,
  mortise: 53292,
  taoliang: 214684,
  chuandou: 228516,
  'stone-arch': 1312952,
  tulou: 870748,
};

/** 各模型的世界尺度约定（1 单位 = ?）。 */
const SCALE = {
  dougong: '1 单位 = 1 斗口（斗口 d = 0.2 单位）',
  mortise: '1 单位 = 1 示意单位（构件相对尺寸按教学比例）',
  taoliang: '1 单位 = 1 示意单位（柱距约 1 m 量级）',
  chuandou: '1 单位 = 1 示意单位（柱距约 1 m 量级）',
  'stone-arch': '1 单位 = 4 m（按真实尺寸建模后统一缩放）',
  tulou: '1 单位 = 4 m（按真实尺寸建模后统一缩放）',
};

const materials = createMaterials();
const entries = [];

for (const { file, model } of MODELS) {
  const modelErrors = validateModel(model);
  if (modelErrors.length) {
    console.error(`[model-index] ${model.id} 未通过契约校验:\n  - ${modelErrors.join('\n  - ')}`);
    process.exitCode = 1;
    continue;
  }
  const build = model.build(materials);
  const buildErrors = validateBuild(build, model);
  if (buildErrors.length) {
    console.error(`[model-index] ${model.id} 的 build() 未通过校验:\n  - ${buildErrors.join('\n  - ')}`);
    process.exitCode = 1;
    continue;
  }

  const box = new THREE.Box3().setFromObject(build.group);
  const size = box.getSize(new THREE.Vector3());
  const bbox = {
    min: [+box.min.x.toFixed(3), +box.min.y.toFixed(3), +box.min.z.toFixed(3)],
    max: [+box.max.x.toFixed(3), +box.max.y.toFixed(3), +box.max.z.toFixed(3)],
    size: [+size.x.toFixed(3), +size.y.toFixed(3), +size.z.toFixed(3)],
  };
  const families = [...new Set(build.parts.map((p) => p.family))].sort();

  entries.push({
    id: model.id,
    title: model.title,
    pinyin: model.pinyin,
    subtitle: model.subtitle,
    summary: model.summary,
    era: model.era,
    region: model.region,
    scaleNote: model.scaleNote,
    source: file,
    counts: {
      parts: build.parts.length,
      layers: (model.layers || []).length,
      forceArrows: (build.forces || []).length,
      families: families.length,
    },
    families,
    layers: (model.layers || []).map((l) => ({
      id: l.id,
      label: l.label,
      defaultVisible: l.defaultVisible !== false,
    })),
    bbox,
    scale: SCALE[model.id] || '',
    export: {
      format: 'glb',
      variant: 'glTF 2.0 binary (GLB)',
      runtimeGenerated: true,
      prebuiltFile: null,
      measuredGlbBytes: MEASURED_GLB_BYTES[model.id] ?? null,
      metadata: ['asset.extras', 'nodes[].extras', 'scenes[0].extras'],
    },
    catalogRefs: (model.catalogRefs || []).map((r) => ({
      id: r.id,
      name: r.name,
      source: r.source,
    })),
  });
}

const index = {
  schemaVersion: '1.1.0',
  id: '18-architecture-models',
  title: { zh: '榫构华夏 · Timber Craft Lab', en: 'Timber Craft Lab' },
  version: '1.1.0',
  generatedAt: new Date().toISOString(),
  generator: 'scripts/build-model-index.mjs',
  description: '六件中国传统建筑结构的可拆解 3D 教学模型清单（机器可读）。所有几何由代码程序化生成，'
    + '均为教学示意模型，非测绘级复原；材质与比例为教学表达，非考古数据。',
  disclaimer: {
    zh: '教学示意，非施工/工程模型。六件模型均为程序化生成的示意模型，非测绘级复原；材质与比例为教学表达，非考古数据。',
    en: 'Teaching diagram, not a construction or engineering model. All six models are procedurally generated schematic models, not surveyed reconstructions; materials and proportions are pedagogical expressions, not archaeological data.',
  },
  forceArrowsNote: {
    zh: '受力箭头为传力路径的定性说明，非结构计算结果。',
    en: 'Force arrows are a qualitative indication of load paths, not the result of a structural calculation.',
  },
  conventions: {
    axes: { x: '面阔（栱 / 檩 / 椽沿此向）', y: '竖直向上', z: '进深（翘 / 昂 / 枋沿此向，+Z 为檐外）' },
    coordinateSystem: 'three.js 右手系，Y 轴向上',
    familyEnum: ['wood', 'stone', 'earth', 'tile', 'water', 'other'],
    forceKindEnum: ['load', 'thrust', 'reaction', 'tension', 'seismic', 'flow'],
    partOrder: 'order 为 0 起升序，表达装配次序',
  },
  contract: {
    doc: 'docs/MODEL-CONTRACT.md',
    version: 'v1.1',
    runtimeApi: 'window.TimberCraftLab',
    handoffDoc: 'docs/DELIVERY-HANDOFF.md',
  },
  usage: {
    consumeBy: '19-architecture-atlas',
    mechanism: '构建期拷贝：复制 18 的 src/core/ + src/models/ 与 fonts/，import 模型描述符并 registerModel()；'
      + '若主站不引入 three，则改用 exportGLBBuffer(id) 取预导出 GLB（仓库内不预生成 .glb）。',
    notMonorepo: '16—19 为各自独立目录，非 monorepo 单包；不得用 npm 互相依赖，只能拷贝源码或取产物。',
  },
  counts: {
    models: entries.length,
    parts: entries.reduce((a, e) => a + e.counts.parts, 0),
    forceArrows: entries.reduce((a, e) => a + e.counts.forceArrows, 0),
  },
  models: entries,
};

await mkdir(path.dirname(OUT), { recursive: true });
await writeFile(OUT, `${JSON.stringify(index, null, 2)}\n`, 'utf8');
console.log(`[model-index] 已写出 ${OUT}`);
console.log(`[model-index] ${entries.length} 件模型 · ${index.counts.parts} 构件 · ${index.counts.forceArrows} 支箭头`);
for (const e of entries) {
  console.log(`  ${e.id.padEnd(12)} parts=${String(e.counts.parts).padStart(2)} layers=${e.counts.layers} `
    + `forces=${e.counts.forceArrows} glb=${(e.export.measuredGlbBytes / 1024).toFixed(1)}KB`);
}
