/**
 * model-api.js — 统一模型接口 / Unified model interface
 *
 * 6 件教学模型共享同一份契约（contract）。核心（viewer / explode / glb / fallback /
 * QA）只认这份契约，因此 19-architecture-atlas 可以直接消费本目录导出的模型。
 *
 * @typedef {{zh:string,en:string}} I18n
 *
 * @typedef {Object} Part
 * @property {string} id             模型内唯一，kebab-case
 * @property {I18n} name             构件名（中文 / English）
 * @property {string} pinyin         无声调拼音，例如 "zuo dou"
 * @property {I18n} role             一句话说明该构件的作用
 * @property {string} layer          层级键，须出现在 model.layers 中
 * @property {'wood'|'stone'|'earth'|'tile'|'water'|'other'} family
 * @property {import('three').Object3D} object  已摆放到最终（装配完成）姿态
 * @property {import('three').Vector3} explode  爆炸散开方向（会被归一化）
 * @property {number} order          分步组装的次序（0 起升序）
 *
 * @typedef {Object} Force
 * @property {string} id
 * @property {[number,number,number]} from
 * @property {[number,number,number]} to
 * @property {I18n} label
 * @property {'load'|'thrust'|'reaction'|'tension'|'seismic'|'flow'} kind
 *
 * @typedef {Object} StructureModel
 * @property {string} id
 * @property {I18n} title
 * @property {string} pinyin
 * @property {I18n} subtitle
 * @property {I18n} summary
 * @property {I18n} loadPath        传力路径一句话
 * @property {I18n} era
 * @property {I18n} region
 * @property {I18n} scaleNote       必须包含「教学示意」/ "teaching diagram" 字样
 * @property {{position:[number,number,number], target:[number,number,number]}} camera
 * @property {Array<{id:string,label:I18n,hint?:I18n}>} layers
 * @property {Array<{id:string,name:I18n,source:string}>} [catalogRefs] 史实参照（引用自 17 catalog）
 * @property {(mats:any) => {group:import('three').Group, parts:Part[], forces:Force[]}} build
 */

import * as THREE from 'three';

/** 契约字段清单，QA 用它做静态检查。 */
export const PART_KEYS = ['id', 'name', 'pinyin', 'role', 'layer', 'family', 'object', 'explode', 'order'];
export const MODEL_KEYS = [
  'id', 'title', 'pinyin', 'subtitle', 'summary', 'loadPath',
  'era', 'region', 'scaleNote', 'camera', 'layers', 'build',
];
export const FORCE_KINDS = ['load', 'thrust', 'reaction', 'tension', 'seismic', 'flow'];

const registry = new Map();

export function registerModel(model) {
  const errs = validateModel(model);
  if (errs.length) {
    throw new Error(`[model-api] 模型 ${model?.id || '(unknown)'} 未通过契约校验:\n - ${errs.join('\n - ')}`);
  }
  registry.set(model.id, model);
  return model;
}

export function getModel(id) {
  return registry.get(id) || null;
}

export function listModels() {
  return [...registry.values()];
}

/** 校验一个模型是否满足统一接口。返回错误数组（空数组 = 通过）。 */
export function validateModel(model) {
  const e = [];
  if (!model || typeof model !== 'object') return ['模型不是对象'];
  for (const k of MODEL_KEYS) {
    if (!(k in model)) e.push(`缺少字段 "${k}"`);
  }
  if (model.id && !/^[a-z0-9-]+$/.test(model.id)) e.push(`id "${model.id}" 必须是 kebab-case`);
  for (const k of ['title', 'subtitle', 'summary', 'loadPath', 'era', 'region', 'scaleNote']) {
    const v = model[k];
    if (v && (!v.zh || !v.en)) e.push(`字段 "${k}" 需同时提供 zh 与 en`);
  }
  const sn = model.scaleNote || {};
  if (sn.zh && !/教学示意/.test(sn.zh)) e.push('scaleNote.zh 必须包含「教学示意」');
  if (sn.en && !/teaching diagram/i.test(sn.en)) e.push('scaleNote.en 必须包含 "teaching diagram"');

  if (model.layers) {
    const ids = new Set();
    for (const l of model.layers) {
      if (!l.id || ids.has(l.id)) e.push(`layers 中存在缺失或重复的 id: ${l.id}`);
      ids.add(l.id);
      if (!l.label || !l.label.zh || !l.label.en) e.push(`layer "${l.id}" 需同时提供 zh 与 en 标签`);
    }
  }
  if (typeof model.build !== 'function') e.push('build 必须是函数');
  if (model.catalogRefs !== undefined) {
    if (!Array.isArray(model.catalogRefs)) e.push('catalogRefs 必须是数组');
    else {
      const seen = new Set();
      model.catalogRefs.forEach((r, i) => {
        if (!r || typeof r !== 'object') { e.push(`catalogRefs[${i}] 不是对象`); return; }
        if (!r.id) e.push(`catalogRefs[${i}] 缺少 id`);
        if (seen.has(r.id)) e.push(`catalogRefs 中 id 重复: ${r.id}`);
        seen.add(r.id);
        if (!r.name || !r.name.zh || !r.name.en) e.push(`catalogRefs "${r.id}" 的 name 需同时提供 zh 与 en`);
        if (!r.source) e.push(`catalogRefs "${r.id}" 缺少 source（条目出处）`);
      });
    }
  }
  if (model.camera) {
    const { position, target } = model.camera;
    if (!Array.isArray(position) || position.length !== 3) e.push('camera.position 必须是 3 元数组');
    if (!Array.isArray(target) || target.length !== 3) e.push('camera.target 必须是 3 元数组');
  }
  return e;
}

/** 校验一次 build() 的产物（QA 用）。 */
export function validateBuild(result, model) {
  const e = [];
  if (!result || !result.group || !Array.isArray(result.parts)) {
    return ['build() 必须返回 { group, parts, forces }'];
  }
  const layerIds = new Set((model.layers || []).map((l) => l.id));
  const partIds = new Set();
  for (const p of result.parts) {
    for (const k of PART_KEYS) if (!(k in p)) e.push(`构件缺少字段 "${k}"`);
    if (partIds.has(p.id)) e.push(`构件 id 重复: ${p.id}`);
    partIds.add(p.id);
    if (!layerIds.has(p.layer)) e.push(`构件 "${p.id}" 的 layer "${p.layer}" 未在 model.layers 中声明`);
    if (!p.object || !p.object.isObject3D) e.push(`构件 "${p.id}" 的 object 不是 Object3D`);
    if (!(p.explode instanceof THREE.Vector3) || p.explode.lengthSq() < 1e-6) {
      e.push(`构件 "${p.id}" 的 explode 必须是非零 Vector3`);
    }
    if (p.object && p.object.parent !== result.group) {
      e.push(`构件 "${p.id}" 的 object 必须是 group 的直接子对象`);
    }
  }
  for (const f of result.forces || []) {
    if (!FORCE_KINDS.includes(f.kind)) e.push(`受力箭头 kind 非法: ${f.kind}`);
    if (!f.from || !f.to) e.push('受力箭头缺少 from/to');
  }
  return e;
}
