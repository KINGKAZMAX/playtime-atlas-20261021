/**
 * Original geometry builders for 《渊甲拾遗者》.
 *
 * These are the parts that make the harvester read as something other than the
 * reference case: an arched overlapping carapace, a flat spiral-bladed milling
 * crown, a pressure bladder tail, a ventral ore hopper, and a hydrothermal vent
 * field to stand on.
 *
 * Every builder returns real Three.js BufferGeometry. Nothing here is a
 * billboard, a sprite, or a 2D image standing in for a solid.
 */

import * as THREE from 'three';
import { merge } from './geometry.js';
import { fbm2, makeRng } from './noise.js';

const TAU = Math.PI * 2;

/**
 * A spiral cutter blade for the milling crown — a solid lofted ribbon that
 * sweeps from the hub out to the rim while twisting along its length.
 */
export function spiralBlade({
  r0 = 0.32,
  r1 = 0.98,
  height = 0.07,
  width = 0.3,
  sweep = 1.15,
  segments = 16,
} = {}) {
  const positions = [];
  const indices = [];

  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const ang = t * sweep;
    const r = r0 + (r1 - r0) * t;
    const hw = (width * (1 - 0.28 * t)) / 2;
    const c = Math.cos(ang);
    const s = Math.sin(ang);
    const px = c * r;
    const pz = s * r;
    const tx = -s;
    const tz = c;
    // Cross-section rectangle in the (tangent, up) plane.
    positions.push(px - tx * hw, height / 2, pz - tz * hw);
    positions.push(px + tx * hw, height / 2, pz + tz * hw);
    positions.push(px + tx * hw, -height / 2, pz + tz * hw);
    positions.push(px - tx * hw, -height / 2, pz - tz * hw);
  }

  for (let i = 0; i < segments; i++) {
    const a = i * 4;
    const b = (i + 1) * 4;
    for (let k = 0; k < 4; k++) {
      const k2 = (k + 1) % 4;
      indices.push(a + k, b + k, a + k2, a + k2, b + k, b + k2);
    }
  }
  indices.push(0, 1, 2, 0, 2, 3);
  const last = segments * 4;
  indices.push(last, last + 2, last + 1, last, last + 3, last + 2);

  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  g.setIndex(indices);
  g.computeVertexNormals();

  const count = g.attributes.position.count;
  g.setAttribute('uv', new THREE.Float32BufferAttribute(new Float32Array(count * 2), 2));
  return g;
}

/**
 * An arched carapace plate — the overlapping "scale" that gives the body its
 * armoured, crustacean read. The arch runs along +Y so the plate can be laid
 * around the body axis with a simple X rotation.
 */
export function carapacePlate({
  length = 1,
  width = 0.5,
  thickness = 0.05,
  arch = 0.11,
} = {}) {
  const shape = new THREE.Shape();
  const steps = 9;
  shape.moveTo(-length / 2, 0);
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    shape.lineTo(-length / 2 + length * t, arch * Math.sin(Math.PI * t));
  }
  for (let i = steps; i >= 0; i--) {
    const t = i / steps;
    shape.lineTo(-length / 2 + length * t, arch * Math.sin(Math.PI * t) - thickness);
  }
  shape.closePath();

  const g = new THREE.ExtrudeGeometry(shape, {
    depth: width,
    bevelEnabled: true,
    bevelSize: thickness * 0.3,
    bevelThickness: thickness * 0.3,
    bevelSegments: 1,
    curveSegments: 1,
  });
  g.translate(0, 0, -width / 2);
  return g;
}

/**
 * A curved deflector vane that sits behind the intake throat and steers the
 * slurry back into the collector.
 */
export function deflectorVane({ length = 0.8, width = 0.34, thickness = 0.04, curve = 0.22 } = {}) {
  const shape = new THREE.Shape();
  const steps = 7;
  shape.moveTo(0, 0);
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    shape.lineTo(length * t, curve * Math.sin(Math.PI * t * 0.8));
  }
  for (let i = steps; i >= 0; i--) {
    const t = i / steps;
    shape.lineTo(length * t, curve * Math.sin(Math.PI * t * 0.8) - thickness);
  }
  shape.closePath();

  const g = new THREE.ExtrudeGeometry(shape, {
    depth: width,
    bevelEnabled: false,
    curveSegments: 1,
  });
  g.translate(0, 0, -width / 2);
  return g;
}

/**
 * A ventral anchor sucker — the foot that grips the basalt while a segment
 * contracts.
 */
export function suckerPad({ radius = 0.16, height = 0.07 } = {}) {
  const rim = new THREE.TorusGeometry(radius, radius * 0.2, 6, 16);
  rim.rotateX(Math.PI / 2);
  const cup = new THREE.CylinderGeometry(radius * 0.86, radius * 0.5, height, 16, 1);
  const stem = new THREE.CylinderGeometry(radius * 0.18, radius * 0.18, height * 1.6, 8, 1);
  stem.translate(0, height * 0.9, 0);
  return merge([rim, cup, stem]);
}

/**
 * The pressure bladder that closes the tail — a bulging capsule that stores
 * buoyancy trim and shields the collector from backwash.
 */
export function pressureBladder({ length = 1.3, radius = 0.5 } = {}) {
  const body = new THREE.SphereGeometry(radius, 20, 14);
  body.scale(1.35, 0.92, 0.92);
  const waist = new THREE.CylinderGeometry(radius * 0.86, radius * 0.86, length * 0.72, 18, 1);
  waist.rotateZ(Math.PI / 2);
  const collar = new THREE.TorusGeometry(radius * 0.9, radius * 0.08, 6, 20);
  collar.rotateY(Math.PI / 2);
  collar.translate(-length * 0.36, 0, 0);
  const collar2 = new THREE.TorusGeometry(radius * 0.9, radius * 0.08, 6, 20);
  collar2.rotateY(Math.PI / 2);
  collar2.translate(length * 0.36, 0, 0);
  return merge([body, waist, collar, collar2]);
}

/**
 * The ventral ore hopper: a tapered bin with a lit fill window so the amount
 * of collected material is readable from outside.
 */
export function hopperPod({ length = 1.5, width = 0.62, height = 0.44 } = {}) {
  const shell = new THREE.CylinderGeometry(width * 0.5, width * 0.32, length, 6, 1);
  shell.rotateZ(Math.PI / 2);
  shell.rotateY(Math.PI / 6);
  const rim = new THREE.TorusGeometry(width * 0.5, width * 0.05, 5, 12);
  rim.rotateY(Math.PI / 2);
  rim.rotateX(Math.PI / 6);
  rim.translate(-length / 2, 0, 0);
  const frame = new THREE.BoxGeometry(length * 0.9, height * 0.22, width * 0.18);
  frame.translate(0, height * 0.42, 0);
  const legA = new THREE.CylinderGeometry(0.035, 0.035, height * 0.9, 6, 1);
  legA.translate(-length * 0.3, height * 0.55, 0);
  const legB = legA.clone();
  legB.translate(length * 0.6, 0, 0);
  return merge([shell, rim, frame, legA, legB]);
}

/**
 * The basalt seafloor. A displaced plane with a flat survey corridor carved
 * along the machine's footprint so the body never gets swallowed by the floor.
 */
export function seafloorField({
  size = 150,
  segments = 170,
  height = 4.2,
  seed = 23,
  corridor = { x0: -6, x1: 30, halfWidth: 8 },
} = {}) {
  const geo = new THREE.PlaneGeometry(size, size, segments, segments);
  geo.rotateX(-Math.PI / 2);
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const z = pos.getZ(i);
    // Pillow-basalt lobes: rounded blobs plus a ridged fracture pattern.
    const lobes = fbm2(x * 0.026, z * 0.026, 4, 2.0, 0.55, seed);
    const frac = 1 - Math.abs(fbm2(x * 0.055, z * 0.055, 3, 2.2, 0.5, seed + 9) * 2 - 1);
    const fine = fbm2(x * 0.16, z * 0.16, 2, 2.0, 0.5, seed + 31);
    const h = (lobes * 0.82 + frac * 0.3 + fine * 0.08) * height;

    const dx = Math.max(corridor.x0 - x, 0, x - corridor.x1);
    const dz = Math.max(Math.abs(z) - corridor.halfWidth, 0);
    const out = Math.hypot(dx, dz);
    const flat = THREE.MathUtils.smoothstep(out, 0, 10);

    pos.setY(i, h * flat - 0.18);
  }
  geo.computeVertexNormals();
  return geo;
}

/**
 * A black smoker chimney: an irregular mineral stack that tapers upward and
 * flares into a spout.
 */
export function ventChimney({ height = 4.2, baseRadius = 0.85, seed = 5 } = {}) {
  const rng = makeRng(seed);
  const geo = new THREE.CylinderGeometry(baseRadius * 0.34, baseRadius, height, 14, 7, true);
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const z = pos.getZ(i);
    const t = (y + height / 2) / height;
    const n = fbm2(x * 1.7 + seed, z * 1.7, 3, 2.0, 0.5, seed);
    const k = 1 + (n - 0.5) * 0.34 * (1.15 - t * 0.5);
    pos.setXYZ(i, x * k, y, z * k);
  }
  geo.computeVertexNormals();

  const lip = new THREE.TorusGeometry(baseRadius * 0.36, baseRadius * 0.09, 6, 14);
  lip.rotateX(Math.PI / 2);
  lip.translate(0, height / 2, 0);

  const skirt = new THREE.CylinderGeometry(baseRadius * 1.35, baseRadius * 1.7, height * 0.13, 14, 1);
  skirt.translate(0, -height / 2 + height * 0.06, 0);

  const g = merge([geo, lip, skirt]);
  g.rotateY(rng() * TAU);
  return g;
}

/**
 * A cluster of tube worms around a vent mouth — thin calcified tubes with
 * crimson plumes.
 */
export function tubeWormCluster({ count = 26, radius = 0.9, seed = 11 } = {}) {
  const rng = makeRng(seed);
  const shells = [];
  const plumes = [];
  for (let i = 0; i < count; i++) {
    const a = rng() * TAU;
    const r = Math.pow(rng(), 0.55) * radius;
    const x = Math.cos(a) * r;
    const z = Math.sin(a) * r;
    const len = 0.28 + rng() * 0.62;
    const lean = (rng() - 0.5) * 0.5;
    const rad = 0.018 + rng() * 0.016;

    const tube = new THREE.CylinderGeometry(rad, rad * 1.25, len, 6, 1);
    tube.rotateZ(lean);
    tube.translate(x, len / 2, z);
    shells.push(tube);

    const plume = new THREE.SphereGeometry(rad * 2.1, 6, 5);
    plume.scale(1, 1.7, 1);
    plume.translate(x + Math.sin(lean) * len, len + rad, z);
    plumes.push(plume);
  }
  return { shells: merge(shells), plumes: merge(plumes) };
}

/**
 * Scattered basalt rubble and manganese nodules, kept clear of the machine's
 * survey corridor.
 */
export function rubbleField({
  count = 120,
  radius = 56,
  seed = 41,
  corridor = { x0: -8, x1: 32, halfWidth: 10 },
} = {}) {
  const rng = makeRng(seed);
  const geos = [];
  let placed = 0;
  let guard = 0;
  while (placed < count && guard < count * 12) {
    guard++;
    const a = rng() * TAU;
    const r = 9 + Math.pow(rng(), 0.6) * radius;
    const x = Math.cos(a) * r;
    const z = Math.sin(a) * r;
    if (x > corridor.x0 && x < corridor.x1 && Math.abs(z) < corridor.halfWidth) continue;
    placed++;

    const s = 0.2 + rng() * 1.15;
    const g = new THREE.IcosahedronGeometry(s, 1);
    const pos = g.attributes.position;
    for (let v = 0; v < pos.count; v++) {
      const n = fbm2(pos.getX(v) * 1.9 + placed, pos.getZ(v) * 1.9, 2, 2, 0.5, seed);
      const k = 0.7 + n * 0.55;
      pos.setXYZ(v, pos.getX(v) * k, pos.getY(v) * k * 0.62, pos.getZ(v) * k);
    }
    g.computeVertexNormals();
    g.rotateY(rng() * TAU);
    g.rotateX(rng() * 0.6);
    g.translate(x, -0.22, z);
    geos.push(g);
  }
  return merge(geos);
}
