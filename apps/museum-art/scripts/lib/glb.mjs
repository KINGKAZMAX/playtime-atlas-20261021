/**
 * 回响电玩馆 — GLB 装配器
 * 用 @gltf-transform/core 把「具名部件 + 网格」装配成标准二进制 GLB。
 */

import { Document, NodeIO } from '@gltf-transform/core';
import { MATERIALS } from './materials.mjs';

/**
 * @param {{id:string, name:string, parts:Array<{name:string, mesh:{positions:number[],normals:number[],indices:number[]}, material:string}>}} model
 * @returns {Promise<Buffer>}
 */
export async function buildGLB(model) {
  const doc = new Document();
  doc.createScene('Scene');
  const buffer = doc.createBuffer();

  /* 材质 */
  const matCache = new Map();
  const getMaterial = (key) => {
    if (matCache.has(key)) return matCache.get(key);
    const spec = MATERIALS[key] || MATERIALS['shell-mid'];
    const m = doc
      .createMaterial(key)
      .setBaseColorFactor(spec.baseColorFactor)
      .setMetallicFactor(spec.metallicFactor)
      .setRoughnessFactor(spec.roughnessFactor)
      .setDoubleSided(false);
    if (spec.emissiveFactor) m.setEmissiveFactor(spec.emissiveFactor);
    matCache.set(key, m);
    return m;
  };

  /* 根节点：整件展品 */
  const root = doc.createNode(model.id).setName(model.id);

  let totalTris = 0;

  for (const part of model.parts) {
    const { positions, normals, indices } = part.mesh;
    if (!positions || positions.length === 0) continue;

    const pos = doc
      .createAccessor()
      .setType('VEC3')
      .setArray(new Float32Array(positions))
      .setBuffer(buffer);
    const nrm = doc
      .createAccessor()
      .setType('VEC3')
      .setArray(new Float32Array(normals))
      .setBuffer(buffer);
    const idx = doc
      .createAccessor()
      .setType('SCALAR')
      .setArray(new Uint32Array(indices))
      .setBuffer(buffer);

    const prim = doc
      .createPrimitive()
      .setAttribute('POSITION', pos)
      .setAttribute('NORMAL', nrm)
      .setIndices(idx)
      .setMaterial(getMaterial(part.material));

    const mesh = doc.createMesh(part.name).addPrimitive(prim);
    const node = doc.createNode(part.name).setMesh(mesh);
    root.addChild(node);
    totalTris += indices.length / 3;
  }

  doc.getRoot().setDefaultScene(doc.getRoot().listScenes()[0]);
  doc.getRoot().listScenes()[0].addChild(root);
  doc.getRoot().setExtras({
    museum: '回响电玩馆 / PLAYTIME ATLAS',
    modelId: model.id,
    modelName: model.name,
    partCount: model.parts.length,
    triangleCount: Math.round(totalTris),
    license: 'CC0-1.0 / 本馆原创虚构展品',
  });

  const io = new NodeIO();
  return Buffer.from(await io.writeBinary(doc));
}
