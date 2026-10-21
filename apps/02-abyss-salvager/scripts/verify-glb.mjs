/**
 * GLB verification.
 *
 * Parses the exported .glb container and the embedded glTF JSON chunk, then
 * reports what is actually inside: node count, mesh count, primitive count,
 * triangle count, material count and texture count. A file that only claims
 * to be a GLB will fail here.
 *
 *   node scripts/verify-glb.mjs [path]
 */

import { readFile } from 'node:fs/promises';
import path from 'node:path';

const target = process.argv[2] || path.resolve('public/models/abyss-salvager-ac-vii.glb');

function readJSONChunk(buf, offset) {
  const len = buf.readUInt32LE(offset);
  const type = buf.readUInt32LE(offset + 4);
  if (type !== 0x4e4f534a) throw new Error('first chunk is not JSON');
  return JSON.parse(buf.toString('utf8', offset + 8, offset + 8 + len));
}

function countTriangles(gltf) {
  let tris = 0;
  let verts = 0;
  let nonIndexed = 0;
  for (const mesh of gltf.meshes || []) {
    for (const prim of mesh.primitives || []) {
      const pos = gltf.accessors?.[prim.attributes?.POSITION];
      // A primitive without an indices accessor stores its triangles as a
      // flat, non-indexed POSITION list — count them as position.count / 3.
      if (prim.indices !== undefined) {
        const acc = gltf.accessors?.[prim.indices];
        if (acc) tris += acc.count / 3;
      } else {
        nonIndexed++;
        if (pos) tris += pos.count / 3;
      }
      if (pos) verts += pos.count;
    }
  }
  return { tris, verts, nonIndexed };
}

async function main() {
  const buf = await readFile(target);
  console.log('file      :', target);
  console.log('bytes    :', buf.length);

  const magic = buf.toString('utf8', 0, 4);
  const version = buf.readUInt32LE(4);
  const declared = buf.readUInt32LE(8);

  console.log('magic     :', magic);
  console.log('version  :', version);
  console.log('declared :', declared);

  const problems = [];
  if (magic !== 'glTF') problems.push(`bad magic: ${magic}`);
  if (version !== 2) problems.push(`bad version: ${version}`);
  if (declared !== buf.length) problems.push(`length mismatch: header ${declared} vs file ${buf.length}`);

  const gltf = readJSONChunk(buf, 12);

  // Walk the binary chunk too, to prove the payload is really there.
  const jsonLen = buf.readUInt32LE(12);
  const binHeader = 12 + 8 + jsonLen;
  const binLen = buf.readUInt32LE(binHeader);
  const binType = buf.readUInt32LE(binHeader + 4);

  const { tris, verts, nonIndexed } = countTriangles(gltf);

  console.log('--- glTF contents ---');
  console.log('nodes        :', (gltf.nodes || []).length);
  console.log('meshes       :', (gltf.meshes || []).length);
  console.log('primitives   :', (gltf.meshes || []).reduce((n, m) => n + (m.primitives || []).length, 0));
  console.log('triangles    :', Math.round(tris));
  console.log('vertices     :', verts);
  console.log('non-indexed  :', nonIndexed, 'primitives');
  console.log('materials    :', (gltf.materials || []).length);
  console.log('textures     :', (gltf.textures || []).length);
  console.log('images       :', (gltf.images || []).length);
  console.log('accessors    :', (gltf.accessors || []).length);
  console.log('bufferViews  :', (gltf.bufferViews || []).length);
  console.log('bin chunk    :', binType === 0x004e4942 ? 'BIN present' : `unexpected type ${binType}`, `${(binLen / 1048576).toFixed(2)} MB`);

  if (tris < 1000) problems.push(`suspiciously few triangles: ${tris}`);
  if (!(gltf.meshes || []).length) problems.push('no meshes in glTF');
  if (binType !== 0x004e4942) problems.push('missing BIN chunk');

  console.log('---');
  if (problems.length) {
    console.log('FAIL:');
    for (const p of problems) console.log('  -', p);
    process.exit(1);
  }
  console.log('PASS: valid GLB 2.0 container with real geometry.');
}

main().catch((e) => {
  console.error('verify failed:', e.message);
  process.exit(1);
});
