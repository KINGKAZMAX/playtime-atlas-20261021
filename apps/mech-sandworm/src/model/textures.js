/**
 * Procedural texture generators.
 *
 * Everything is synthesised into typed arrays so the same code runs in the
 * browser AND in Node (the headless GLB exporter). No canvas, no external
 * image, no CDN, no downloaded texture.
 */

import * as THREE from 'three';
import { fbm2, valueNoise2, makeRng } from './noise.js';

/**
 * Build a texture from raw RGBA bytes.
 *
 * In the browser we back the texture with a canvas, because GLTFExporter reads
 * texture pixels through `drawImage`, which only accepts canvas/image sources.
 * A raw DataTexture has no drawable source and would break the GLB export.
 *
 * In Node (headless exporter) no canvas exists, so we fall back to a
 * DataTexture. Both paths carry identical pixel data.
 */
function dataTexture(size, fill, { srgb = false, repeat = 1 } = {}) {
  const data = new Uint8Array(size * size * 4);
  fill(data, size);

  const hasCanvas = typeof document !== 'undefined' && typeof document.createElement === 'function';
  let tex;
  if (hasCanvas) {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    const img = ctx.createImageData(size, size);
    img.data.set(data);
    ctx.putImageData(img, 0, 0);
    tex = new THREE.CanvasTexture(canvas);
  } else {
    tex = new THREE.DataTexture(data, size, size, THREE.RGBAFormat);
  }

  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(repeat, repeat);
  tex.magFilter = THREE.LinearFilter;
  tex.minFilter = THREE.LinearMipmapLinearFilter;
  tex.generateMipmaps = true;
  tex.anisotropy = 8;
  if (srgb) tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  return tex;
}

/**
 * Carapace scale map. A staggered lattice of rounded scales with darkened
 * seams between them, plus fine mottling — used as bump + roughness detail on
 * the chitin armour.
 */
export function createCarapaceTexture(size = 512, seed = 7) {
  const rng = makeRng(seed);
  const cells = 9;
  const cell = size / cells;
  const jitter = [];
  for (let r = 0; r < cells + 2; r++) {
    jitter[r] = [];
    for (let c = 0; c < cells + 2; c++) {
      jitter[r][c] = [(rng() - 0.5) * cell * 0.22, (rng() - 0.5) * cell * 0.22];
    }
  }

  return dataTexture(size, (data, s) => {
    for (let y = 0; y < s; y++) {
      for (let x = 0; x < s; x++) {
        const i = y * s + x;
        const row = Math.floor(y / cell);
        const shift = (row % 2) * cell * 0.5;
        const col = Math.floor((x - shift) / cell);
        const jx = jitter[row][col]?.[0] ?? 0;
        const jy = jitter[row][col]?.[1] ?? 0;
        const cx = col * cell + shift + cell * 0.5 + jx;
        const cy = row * cell + cell * 0.5 + jy;
        const d = Math.hypot(x - cx, y - cy) / (cell * 0.78);

        const n = fbm2(x * 0.07, y * 0.07, 3, 2, 0.5, seed);
        let v = 0.78 + (n - 0.5) * 0.16;
        // Seam between scales.
        const seam = d > 0.78 ? (d - 0.78) / 0.35 : 0;
        v *= 1 - Math.min(0.55, seam * 0.9);
        // Highlight along the scale crest.
        v += Math.max(0, 0.22 - d * 0.3);
        const c = Math.max(0, Math.min(255, v * 255)) | 0;
        data[i * 4] = c;
        data[i * 4 + 1] = c;
        data[i * 4 + 2] = c;
        data[i * 4 + 3] = 255;
      }
    }
  });
}

/** Fine brushed-alloy roughness variation. */
export function createBrushedTexture(size = 256, seed = 21) {
  return dataTexture(size, (data, s) => {
    for (let y = 0; y < s; y++) {
      for (let x = 0; x < s; x++) {
        const i = y * s + x;
        const streak = valueNoise2(x * 0.6, y * 22.0, seed);
        const grain = fbm2(x * 0.09, y * 0.09, 3, 2, 0.5, seed + 5);
        const v = 0.55 + (streak - 0.5) * 0.34 + (grain - 0.5) * 0.12;
        const c = Math.max(0, Math.min(255, v * 255)) | 0;
        data[i * 4] = c;
        data[i * 4 + 1] = c;
        data[i * 4 + 2] = c;
        data[i * 4 + 3] = 255;
      }
    }
  });
}

/** Dark basalt seafloor colour map with pale sediment drifts. */
export function createBasaltTexture(size = 512, seed = 91) {
  return dataTexture(
    size,
    (data, s) => {
      for (let y = 0; y < s; y++) {
        for (let x = 0; x < s; x++) {
          const i = y * s + x;
          const n = fbm2(x * 0.012, y * 0.012, 5, 2.1, 0.55, seed);
          const grain = fbm2(x * 0.2, y * 0.2, 3, 2, 0.5, seed + 3);
          const patch = fbm2(x * 0.035, y * 0.035, 3, 2.2, 0.5, seed + 17);
          let r = 0.15 + (n - 0.5) * 0.1 + (grain - 0.5) * 0.05;
          let g = 0.17 + (n - 0.5) * 0.1 + (grain - 0.5) * 0.05;
          let b = 0.2 + (n - 0.5) * 0.11 + (grain - 0.5) * 0.05;
          // Pale carbonate sediment collecting in the hollows.
          if (patch > 0.58) {
            const k = Math.min(1, (patch - 0.58) * 3.2);
            r += k * 0.16;
            g += k * 0.16;
            b += k * 0.13;
          }
          data[i * 4] = Math.max(0, Math.min(255, r * 255)) | 0;
          data[i * 4 + 1] = Math.max(0, Math.min(255, g * 255)) | 0;
          data[i * 4 + 2] = Math.max(0, Math.min(255, b * 255)) | 0;
          data[i * 4 + 3] = 255;
        }
      }
    },
    { srgb: true }
  );
}

// Small helper so the basalt generator reads symmetrically.
function z_(y) {
  return y;
}

/** Soft cold mote used for marine snow. */
export function createSnowTexture(size = 64) {
  return dataTexture(size, (data, s) => {
    const c = (s - 1) / 2;
    for (let y = 0; y < s; y++) {
      for (let x = 0; x < s; x++) {
        const i = y * s + x;
        const d = Math.hypot(x - c, y - c) / c;
        const a = Math.max(0, 1 - d);
        const v = Math.pow(a, 2.6);
        data[i * 4] = 214;
        data[i * 4 + 1] = 236;
        data[i * 4 + 2] = 255;
        data[i * 4 + 3] = (v * 255) | 0;
      }
    }
  });
}

/** Cyan survey grid used by the "sonar" theme overlay. */
export function createGridTexture(size = 256) {
  return dataTexture(size, (data, s) => {
    for (let y = 0; y < s; y++) {
      for (let x = 0; x < s; x++) {
        const i = y * s + x;
        const major = x % 64 === 0 || y % 64 === 0;
        const minor = x % 16 === 0 || y % 16 === 0;
        let a = 0;
        if (major) a = 132;
        else if (minor) a = 48;
        data[i * 4] = 56;
        data[i * 4 + 1] = 232;
        data[i * 4 + 2] = 208;
        data[i * 4 + 3] = a;
      }
    }
  });
}
