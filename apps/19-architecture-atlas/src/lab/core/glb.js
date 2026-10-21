/**
 * glb.js — GLB 导出 / Export real geometry as a .glb binary
 *
 * 导出的是当前模型在「装配完成」姿态下的真实三角网格，
 * 每个构件作为独立 mesh 保留（名字来自 part.id），可直接放入任何 glTF 查看器。
 *
 * 导出物自带元数据（glTF `extras`）：教学示意声明、受力箭头的定性说明、
 * 比例说明、史实参照条目。声明在文件内部随模型流转，不会因脱离本站而丢失。
 */
import * as THREE from 'three';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';

/** 导出元数据的三处落点之一（其余两处：3D 场景内、模型说明页）。 */
export const DISCLAIMER = {
  zh: '教学示意，非施工/工程模型。',
  en: 'Teaching diagram — not a construction or engineering model.',
};

export const FORCE_ARROWS_NOTE = {
  zh: '受力箭头为传力路径的定性说明，非结构计算结果。',
  en: 'Force arrows are a qualitative indication of load paths, not the result of a structural calculation.',
};

/**
 * 组装导出元数据。会写入 glTF 根节点的 `extras`。
 * @param {Object} model 模型描述符
 * @param {Array} parts  构件列表
 * @returns {Object}
 */
export function buildExportMetadata(model, parts) {
  const m = model || {};
  const refs = Array.isArray(m.catalogRefs) ? m.catalogRefs : [];
  return {
    generator: 'Timber Craft Lab (18-architecture-models) v1.0.0',
    modelId: m.id || '',
    modelTitle: m.title || { zh: '', en: '' },
    disclaimer: DISCLAIMER,
    disclaimerLong: {
      zh: '教学示意，非施工/工程模型。构件比例与节点做法均为示意性表达，不得用作施工依据，也不得冒充实测测绘成果。',
      en: 'Teaching diagram, not a construction or engineering model. Member proportions and joint details are schematic and must not be used as construction documentation or as a surveyed record.',
    },
    forceArrows: FORCE_ARROWS_NOTE,
    scaleNote: m.scaleNote || { zh: '', en: '' },
    memberCount: Array.isArray(parts) ? parts.length : 0,
    catalogRefs: refs.map((r) => ({
      id: r.id,
      nameZh: r.name?.zh || r.nameZh || '',
      nameEn: r.name?.en || r.nameEn || '',
      source: r.source || '17-architecture-research/catalog.json',
    })),
    licensing: 'Models and geometry are original works of this project, generated procedurally. See LICENSES.md in 18-architecture-models.',
  };
}

/**
 * 生成 GLB 二进制（不触发下载），供 19 号主站与验收脚本直接取用。
 * @param {import('three').Group} group
 * @param {Array} parts
 * @param {Object} [model] 模型描述符（用于写入元数据）
 * @returns {Promise<ArrayBuffer>}
 */
export async function buildGLBBuffer(group, parts, model = null) {
  const prepared = prepareExport(group, parts, model);
  const exporter = new GLTFExporter();
  const result = await exporter.parseAsync(prepared, {
    binary: true,
    onlyVisible: false,
    trs: false,
    maxTextureSize: 1024,
  });
  return patchGLBMetadata(result, buildExportMetadata(model, parts));
}

/**
 * 把元数据同时写进 glTF 的 `asset.extras` 与 `scenes[0].extras`。
 * GLTFExporter 只把 node.userData 写进 node.extras，根节点不在 nodes[0]，
 * 因此这里在二进制层面补齐，使任何 glTF 工具都能直接读到教学示意声明。
 */
export function patchGLBMetadata(buffer, meta) {
  try {
    const dv = new DataView(buffer);
    if (dv.getUint32(0, true) !== 0x46546c67) return buffer;
    const jsonLen = dv.getUint32(12, true);
    if (dv.getUint32(16, true) !== 0x4e4f534a) return buffer;

    const json = JSON.parse(new TextDecoder('utf-8').decode(new Uint8Array(buffer, 20, jsonLen)));
    json.asset = { version: '2.0', generator: 'THREE.GLTFExporter', ...(json.asset || {}) };
    json.asset.extras = { ...(json.asset.extras || {}), ...meta };
    if (json.scenes && json.scenes[0]) {
      json.scenes[0].extras = { ...(json.scenes[0].extras || {}), ...meta };
    }

    const text = JSON.stringify(json);
    // GLB 的 JSON 块长度以【字节】计，且须补齐到 4 字节（用 0x20 空格补齐）。
    // 注意：JS 字符串长度是 UTF-16 码元数，中文 JSON 的 UTF-8 字节数更大，必须按字节计算。
    const enc = new TextEncoder();
    const rawLen = enc.encode(text).length;
    const padLen = (4 - (rawLen % 4)) % 4;
    const padded = text + ' '.repeat(padLen);
    const newJsonLen = rawLen + padLen;

    const hasBin = buffer.byteLength > 20 + jsonLen;
    const binLen = hasBin ? dv.getUint32(20 + jsonLen, true) : 0;
    const binType = hasBin ? dv.getUint32(24 + jsonLen, true) : 0;
    const binOffset = 28 + jsonLen;

    const out = new ArrayBuffer(12 + 8 + newJsonLen + (hasBin ? 8 + binLen : 0));
    const odv = new DataView(out);
    odv.setUint32(0, 0x46546c67, true);   // 'glTF'
    odv.setUint32(4, 2, true);             // version
    odv.setUint32(8, out.byteLength, true);
    odv.setUint32(12, newJsonLen, true);
    odv.setUint32(16, 0x4e4f534a, true);  // 'JSON'
    new Uint8Array(out, 20, newJsonLen).set(enc.encode(padded));
    if (hasBin) {
      odv.setUint32(20 + newJsonLen, binLen, true);
      odv.setUint32(24 + newJsonLen, binType, true);
      new Uint8Array(out, 28 + newJsonLen, binLen).set(new Uint8Array(buffer, binOffset, binLen));
    }
    return out;
  } catch (err) {
    console.warn('[glb] 元数据写入失败，保留原始导出物', err);
    return buffer;
  }
}

/** 克隆并清理导出副本：还原基础材质、去掉高亮、写入元数据。 */
function prepareExport(group, parts, model) {
  const clone = group.clone(true);
  const byId = new Map((parts || []).map((p) => [p.id, p]));

  clone.traverse((o) => {
    if (!o.isMesh) return;
    const pid = o.userData.partId;
    const part = byId.get(pid);
    const base = part
      ? part.name
      : { en: o.name || 'Mesh', zh: o.name || 'Mesh' };
    o.name = `${pid || 'part'}`;
    // 还原基础材质，去掉选中高亮的发光
    const mats = Array.isArray(o.material) ? o.material : [o.material];
    o.material = mats.map((m) => {
      if (!m) return m;
      const c = m.clone();
      if (c.emissive && c.emissive.getHex() === 0xb4432b) c.emissiveIntensity = 0;
      c.clippingPlanes = null;
      return c;
    });
    if (o.material.length === 1) o.material = o.material[0];
    o.userData = { partId: pid || '', nameEn: base.en, nameZh: base.zh };
  });

  // 教学示意声明写入导出物元数据（glTF 根节点 extras + asset.extras）
  clone.name = (model?.id || 'model');
  clone.userData = buildExportMetadata(model, parts);
  return clone;
}

/**
 * 导出并触发浏览器下载。
 * @param {import('three').Object3D} group   模型根节点
 * @param {Array} parts                     构件列表（用于写入 mesh 名称）
 * @param {string} filename                 下载文件名
 * @param {Object} [model]                  模型描述符（用于写入元数据）
 * @returns {Promise<{ok:boolean, bytes:number, filename:string, error?:string}>}
 */
export async function exportGLB(group, parts, filename = 'model.glb', model = null) {
  try {
    const clone = prepareExport(group, parts, model);
    const exporter = new GLTFExporter();
    const result = await exporter.parseAsync(clone, {
      binary: true,
      onlyVisible: false,
      trs: false,
      maxTextureSize: 1024,
    });
    const patched = patchGLBMetadata(result, buildExportMetadata(model, parts));

    const blob = new Blob([patched], { type: 'model/gltf-binary' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename.endsWith('.glb') ? filename : `${filename}.glb`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 4000);

    return { ok: true, bytes: blob.size, filename: a.download };
  } catch (err) {
    console.error('[glb] export failed', err);
    return { ok: false, bytes: 0, filename, error: String(err?.message || err) };
  }
}
