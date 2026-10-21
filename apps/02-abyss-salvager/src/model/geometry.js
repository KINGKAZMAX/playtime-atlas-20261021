/**
 * Shared procedural geometry builders.
 *
 * Every part is real Three.js BufferGeometry — nothing is a billboard, a sprite
 * or a 2D image pretending to be 3D. The same module is consumed by the browser
 * app and by the headless GLB exporter, so the exported file always matches the
 * on-screen model.
 */

import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

const TAU = Math.PI * 2;

/**
 * Merge a list of geometries into one.
 *
 * `mergeGeometries` requires every input to carry exactly the same attribute
 * set and to agree on whether it is indexed. Three's primitives are indexed
 * while ExtrudeGeometry and our hand-built buffers are not, so we normalise
 * everything to non-indexed with position/normal/uv before merging.
 */
export function merge(list) {
  const valid = list.filter(Boolean);
  if (!valid.length) return null;

  const normalized = valid.map((g) => {
    let out = g.index ? g.toNonIndexed() : g;
    if (!out.attributes.normal) out.computeVertexNormals();
    if (!out.attributes.uv) {
      const count = out.attributes.position.count;
      out.setAttribute('uv', new THREE.Float32BufferAttribute(new Float32Array(count * 2), 2));
    }
    // Drop any stray attributes so every geometry matches exactly.
    for (const name of Object.keys(out.attributes)) {
      if (name !== 'position' && name !== 'normal' && name !== 'uv') {
        out.deleteAttribute(name);
      }
    }
    out.morphAttributes = {};
    return out;
  });

  if (normalized.length === 1) return normalized[0];
  const merged = mergeGeometries(normalized, false);
  if (!merged) {
    console.warn('[geometry] mergeGeometries returned null; falling back to first');
    return normalized[0];
  }
  return merged;
}

/**
 * A ring of radial fins around the body — the flange plates that give the
 * machine its industrial read.
 */
export function flangeRing({
  count = 8,
  radius = 1,
  thickness = 0.05,
  height = 0.16,
  taper = 0.55,
  angleOffset = 0,
} = {}) {
  const geos = [];
  for (let i = 0; i < count; i++) {
    const a = angleOffset + (i / count) * TAU;
    // A tapered trapezoid plate, extruded along the radial direction.
    const shape = new THREE.Shape();
    const hw = (TAU * radius) / count / 2.35;
    shape.moveTo(-hw, -height / 2);
    shape.lineTo(hw, -height / 2);
    shape.lineTo(hw * taper, height / 2);
    shape.lineTo(-hw * taper, height / 2);
    shape.closePath();
    const g = new THREE.ExtrudeGeometry(shape, {
      depth: thickness,
      bevelEnabled: true,
      bevelSize: thickness * 0.28,
      bevelThickness: thickness * 0.28,
      bevelSegments: 1,
      curveSegments: 1,
    });
    g.translate(0, 0, radius - thickness / 2);
    g.rotateX(Math.PI / 2);
    g.rotateY(a);
    geos.push(g);
  }
  return merge(geos);
}

/**
 * A toothed gear / cog wheel as real geometry.
 */
export function gearGeometry({
  teeth = 14,
  radius = 0.3,
  toothDepth = 0.07,
  thickness = 0.09,
  bore = 0.08,
} = {}) {
  const shape = new THREE.Shape();
  const steps = teeth * 4;
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const a = t * TAU;
    // Alternate between root radius and tip radius with a smooth ramp.
    const phase = (t * teeth) % 1;
    let r;
    if (phase < 0.34) r = radius - toothDepth;
    else if (phase < 0.5) r = radius;
    else if (phase < 0.84) r = radius;
    else r = radius - toothDepth;
    const x = Math.cos(a) * r;
    const y = Math.sin(a) * r;
    if (i === 0) shape.moveTo(x, y);
    else shape.lineTo(x, y);
  }
  const hole = new THREE.Path();
  hole.absarc(0, 0, bore, 0, TAU, true);
  shape.holes.push(hole);

  const g = new THREE.ExtrudeGeometry(shape, {
    depth: thickness,
    bevelEnabled: true,
    bevelSize: thickness * 0.12,
    bevelThickness: thickness * 0.12,
    bevelSegments: 1,
    curveSegments: 2,
  });
  g.translate(0, 0, -thickness / 2);
  g.rotateY(Math.PI / 2); // gear lies in the YZ plane, axle along X
  return g;
}

/**
 * A hydraulic cylinder: outer barrel + inner rod + end caps.
 */
export function hydraulicRam({
  length = 0.8,
  barrelRadius = 0.075,
  rodRadius = 0.035,
} = {}) {
  const barrel = new THREE.CylinderGeometry(barrelRadius, barrelRadius, length * 0.55, 12, 1);
  barrel.rotateZ(Math.PI / 2);
  barrel.translate(-length * 0.22, 0, 0);

  const rod = new THREE.CylinderGeometry(rodRadius, rodRadius, length * 0.75, 10, 1);
  rod.rotateZ(Math.PI / 2);
  rod.translate(length * 0.26, 0, 0);

  const capA = new THREE.CylinderGeometry(barrelRadius * 1.18, barrelRadius * 1.18, length * 0.05, 12, 1);
  capA.rotateZ(Math.PI / 2);
  capA.translate(-length * 0.5, 0, 0);

  const capB = new THREE.CylinderGeometry(barrelRadius * 1.1, barrelRadius * 1.1, length * 0.04, 12, 1);
  capB.rotateZ(Math.PI / 2);
  capB.translate(length * 0.6, 0, 0);

  return merge([barrel, rod, capA, capB]);
}

/**
 * A conduit pipe following a gentle spline — used for the photophore ducts.
 */
export function conduitGeometry({
  length = 1.2,
  radius = 0.022,
  wave = 0.05,
  waveCount = 3,
  segments = 48,
} = {}) {
  const pts = [];
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const x = (t - 0.5) * length;
    const y = Math.sin(t * TAU * waveCount) * wave;
    const z = Math.cos(t * TAU * waveCount) * wave * 0.6;
    pts.push(new THREE.Vector3(x, y, z));
  }
  return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), segments, radius, 7, false);
}

/**
 * A hexagonal vent cap with a recessed core.
 */
export function ventGeometry({ radius = 0.11, depth = 0.05, sides = 6 } = {}) {
  const outer = new THREE.CylinderGeometry(radius, radius, depth, sides, 1);
  outer.rotateZ(Math.PI / 2);
  const inner = new THREE.CylinderGeometry(radius * 0.55, radius * 0.55, depth * 1.4, sides, 1);
  inner.rotateZ(Math.PI / 2);
  return merge([outer, inner]);
}

/**
 * A rounded, tapering caudal blade built from a lofted cross-section.
 */
export function finGeometry({
  length = 0.9,
  rootChord = 0.42,
  tipChord = 0.16,
  thickness = 0.05,
  segments = 12,
  sweep = 0.3,
} = {}) {
  const positions = [];
  const uvs = [];
  const indices = [];
  const rings = 4;

  for (let r = 0; r <= rings; r++) {
    const t = r / rings;
    const chord = rootChord + (tipChord - rootChord) * t;
    const y = t * length;
    const zOff = -sweep * t * t * length;
    const th = thickness * (1 - t * 0.75);
    // leading edge / trailing edge / top / bottom
    positions.push(-chord * 0.5, y, zOff - th / 2);
    positions.push(chord * 0.5, y, zOff - th / 2);
    positions.push(chord * 0.5, y, zOff + th / 2);
    positions.push(-chord * 0.5, y, zOff + th / 2);
    uvs.push(0, t, 1, t, 1, t, 0, t);
  }
  for (let r = 0; r < rings; r++) {
    const a = r * 4;
    const b = (r + 1) * 4;
    for (let k = 0; k < 4; k++) {
      const k2 = (k + 1) % 4;
      indices.push(a + k, b + k, a + k2, a + k2, b + k, b + k2);
    }
  }
  // Cap the root
  indices.push(0, 2, 1, 0, 3, 2);
  const last = rings * 4;
  indices.push(last, last + 1, last + 2, last, last + 2, last + 3);

  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  g.setIndex(indices);
  g.computeVertexNormals();
  return g;
}
