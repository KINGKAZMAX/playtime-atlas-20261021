import * as THREE from 'three';

/**
 * Procedural noise + texture generation.
 * Everything here is CPU-side canvas work: no external image assets are used anywhere in the game.
 */

/**
 * Wrap a canvas into a three.js texture with sensible defaults.
 * @param {HTMLCanvasElement} canvas
 */
export function canvasTextureLocal(canvas, { srgb = true, repeat = null, aniso = 1 } = {}) {
  const tex = new THREE.CanvasTexture(canvas);
  if (srgb) tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  if (repeat) tex.repeat.set(repeat[0], repeat[1]);
  tex.anisotropy = aniso;
  tex.needsUpdate = true;
  return tex;
}

/* ------------------------------------------------------------------ *
 * Deterministic RNG
 * ------------------------------------------------------------------ */

export function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* ------------------------------------------------------------------ *
 * Value noise (2D / 3D) with smoothstep interpolation
 * ------------------------------------------------------------------ */

function hash3(x, y, z, seed) {
  let h = x * 374761393 + y * 668265263 + z * 2147483647 + seed * 1013904223;
  h = (h ^ (h >>> 13)) >>> 0;
  h = Math.imul(h, 1274126177) >>> 0;
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

function hash2(x, y, seed) {
  return hash3(x, y, 0, seed);
}

const fade = (t) => t * t * (3 - 2 * t);
const lerp = (a, b, t) => a + (b - a) * t;

export function makeNoise3D(seed = 1337) {
  return function noise3(x, y, z) {
    const xi = Math.floor(x), yi = Math.floor(y), zi = Math.floor(z);
    const xf = fade(x - xi), yf = fade(y - yi), zf = fade(z - zi);
    const c000 = hash3(xi, yi, zi, seed);
    const c100 = hash3(xi + 1, yi, zi, seed);
    const c010 = hash3(xi, yi + 1, zi, seed);
    const c110 = hash3(xi + 1, yi + 1, zi, seed);
    const c001 = hash3(xi, yi, zi + 1, seed);
    const c101 = hash3(xi + 1, yi, zi + 1, seed);
    const c011 = hash3(xi, yi + 1, zi + 1, seed);
    const c111 = hash3(xi + 1, yi + 1, zi + 1, seed);
    const x00 = lerp(c000, c100, xf);
    const x10 = lerp(c010, c110, xf);
    const x01 = lerp(c001, c101, xf);
    const x11 = lerp(c011, c111, xf);
    return lerp(lerp(x00, x10, yf), lerp(x01, x11, yf), zf);
  };
}

export function makeNoise2D(seed = 7331) {
  return function noise2(x, y) {
    const xi = Math.floor(x), yi = Math.floor(y);
    const xf = fade(x - xi), yf = fade(y - yi);
    const c00 = hash2(xi, yi, seed);
    const c10 = hash2(xi + 1, yi, seed);
    const c01 = hash2(xi, yi + 1, seed);
    const c11 = hash2(xi + 1, yi + 1, seed);
    return lerp(lerp(c00, c10, xf), lerp(c01, c11, yf), yf);
  };
}

/** Fractal brownian motion over a 2D noise function. */
export function fbm(noise, x, y, octaves = 5, lacunarity = 2.0, gain = 0.5) {
  let amp = 1, freq = 1, sum = 0, norm = 0;
  for (let i = 0; i < octaves; i++) {
    sum += amp * noise(x * freq, y * freq);
    norm += amp;
    amp *= gain;
    freq *= lacunarity;
  }
  return sum / norm;
}

/** Fractal brownian motion over a 3D noise function. */
export function fbm3(noise, x, y, z, octaves = 5, lacunarity = 2.0, gain = 0.5) {
  let amp = 1, freq = 1, sum = 0, norm = 0;
  for (let i = 0; i < octaves; i++) {
    sum += amp * noise(x * freq, y * freq, z * freq);
    norm += amp;
    amp *= gain;
    freq *= lacunarity;
  }
  return sum / norm;
}

/** Ridged multifractal — good for filament / storm structures. */
export function ridged(noise, x, y, octaves = 5) {
  let amp = 0.5, freq = 1, sum = 0, norm = 0;
  for (let i = 0; i < octaves; i++) {
    const n = 1 - Math.abs(noise(x * freq, y * freq) * 2 - 1);
    sum += amp * n * n;
    norm += amp;
    amp *= 0.55;
    freq *= 2.1;
  }
  return sum / norm;
}

/** Ridged multifractal over a 3D noise function. */
export function ridged3(noise, x, y, z, octaves = 5) {
  let amp = 0.5, freq = 1, sum = 0, norm = 0;
  for (let i = 0; i < octaves; i++) {
    const n = 1 - Math.abs(noise(x * freq, y * freq, z * freq) * 2 - 1);
    sum += amp * n * n;
    norm += amp;
    amp *= 0.55;
    freq *= 2.1;
  }
  return sum / norm;
}

/* ------------------------------------------------------------------ *
 * Colour helpers
 * ------------------------------------------------------------------ */

export function mixRGB(a, b, t) {
  return [
    a[0] + (b[0] - a[0]) * t,
    a[1] + (b[1] - a[1]) * t,
    a[2] + (b[2] - a[2]) * t,
  ];
}

export function hexToRGB(hex) {
  return [((hex >> 16) & 255) / 255, ((hex >> 8) & 255) / 255, (hex & 255) / 255];
}

function smoothstep(e0, e1, x) {
  const t = Math.min(1, Math.max(0, (x - e0) / (e1 - e0)));
  return t * t * (3 - 2 * t);
}

/* ------------------------------------------------------------------ *
 * Planet surface texture (equirectangular)
 * ------------------------------------------------------------------ */

const PLANET_PRESETS = {
  velan: {
    type: 'gas',
    base: hexToRGB(0x6a4526),
    bands: [hexToRGB(0xd9a463), hexToRGB(0x8a5430), hexToRGB(0xf2dcab), hexToRGB(0x4e3018)],
    storm: hexToRGB(0xb44a24),
  },
  frostgap: {
    type: 'ice',
    base: hexToRGB(0x274a60),
    bands: [hexToRGB(0xa9d8ec), hexToRGB(0x3f7f9f), hexToRGB(0xe6f4fb), hexToRGB(0x1b3448)],
    storm: hexToRGB(0xd6f3ff),
  },
  korai: {
    type: 'rock',
    base: hexToRGB(0x655a4e),
    bands: [hexToRGB(0x9a8873), hexToRGB(0x453d33), hexToRGB(0x74634f)],
    storm: hexToRGB(0xc0ac8e),
  },
  morn: {
    type: 'ice',
    base: hexToRGB(0x35384f),
    bands: [hexToRGB(0x8d92c0), hexToRGB(0x212437), hexToRGB(0xc9cdec)],
    storm: hexToRGB(0xe2e4f8),
  },
};

/**
 * Builds an equirectangular planet surface map.
 * @param {object} opts
 */
export function makePlanetTexture(opts = {}) {
  const {
    width = 1024,
    height = 512,
    seed = 42,
    preset = 'verdance',
    bandCount = 9,
    bandWarp = 0.06,
    stormCount = 3,
  } = opts;

  const cfg = PLANET_PRESETS[preset] || PLANET_PRESETS.velan;
  const noise3 = makeNoise3D(seed);
  const noise2 = makeNoise2D(seed + 17);
  const rand = mulberry32(seed + 99);

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  const img = ctx.createImageData(width, height);
  const data = img.data;

  // Pre-rolled storm definitions
  const storms = [];
  for (let i = 0; i < stormCount; i++) {
    storms.push({
      lon: rand() * Math.PI * 2,
      lat: (rand() - 0.5) * Math.PI * 0.75,
      r: 0.16 + rand() * 0.22,
      spin: (rand() - 0.5) * 0.9,
      strength: 0.55 + rand() * 0.45,
    });
  }

  for (let y = 0; y < height; y++) {
    const v = y / height;
    const lat = (v - 0.5) * Math.PI; // -PI/2 .. PI/2
    const cosLat = Math.cos(lat);
    for (let x = 0; x < width; x++) {
      const u = x / width;
      const lon = u * Math.PI * 2;

      // Domain warp the longitude so bands meander like real gas giants.
      const warp = (fbm(noise2, u * 5.5, v * 3.1, 3) - 0.5) * bandWarp;
      const bandCoord = (v + warp) * bandCount;
      const bandIdx = Math.floor(bandCoord);
      const bandT = bandCoord - bandIdx;

      // Sharp-ish band edges
      const edge = smoothstep(0.0, 0.34, bandT) * smoothstep(1.0, 0.66, bandT);
      const bandColor = cfg.bands[((bandIdx % cfg.bands.length) + cfg.bands.length) % cfg.bands.length];
      const bandColor2 = cfg.bands[(((bandIdx + 1) % cfg.bands.length) + cfg.bands.length) % cfg.bands.length];
      let col = mixRGB(bandColor, bandColor2, smoothstep(0.25, 0.75, bandT) * 0.55 + 0.2);

      // Fine turbulence detail
      const detail = fbm3(noise3, Math.cos(lon) * cosLat * 2.6, Math.sin(lon) * cosLat * 2.6, lat * 2.6, 4);
      col = mixRGB(col, cfg.base, 0.18 + detail * 0.34);

      // Polar haze
      const polar = Math.pow(Math.abs(Math.sin(lat)), 6);
      col = mixRGB(col, [0.92, 0.95, 1.0], polar * 0.5);

      if (cfg.type === 'rock' || cfg.type === 'ice') {
        // Craters for rocky worlds
        const craterField = ridged3(noise3, Math.cos(lon) * cosLat * 9 + 11, Math.sin(lon) * cosLat * 9, lat * 9, 4);
        col = mixRGB(col, [0.08, 0.08, 0.1], smoothstep(0.55, 0.95, craterField) * 0.5);
        col = mixRGB(col, [0.85, 0.85, 0.9], smoothstep(0.72, 0.98, 1 - craterField) * 0.18);
      }

      // Storm ovals (Great Red Spot analogues)
      for (const s of storms) {
        let dLon = lon - s.lon;
        while (dLon > Math.PI) dLon -= Math.PI * 2;
        while (dLon < -Math.PI) dLon += Math.PI * 2;
        const dLat = lat - s.lat;
        if (Math.abs(dLon) > s.r * 1.4) continue;
        if (Math.abs(dLat) > s.r * 0.8) continue;
        const d = Math.sqrt((dLon / s.r) ** 2 + (dLat / (s.r * 0.55)) ** 2);
        if (d < 1.4) {
          const swirl = fbm(noise2, lon * 9 + s.spin, lat * 9, 3);
          const mask = smoothstep(1.25, 0.15, d) * (0.55 + swirl * 0.8);
          col = mixRGB(col, s.storm ? cfg.storm : col, Math.min(1, mask * s.strength));
        }
      }

      // Very subtle limb darkening baked into the map (equatorial regions a touch brighter)
      const idx = (y * width + x) * 4;
      data[idx] = Math.max(0, Math.min(255, col[0] * 255));
      data[idx + 1] = Math.max(0, Math.min(255, col[1] * 255));
      data[idx + 2] = Math.max(0, Math.min(255, col[2] * 255));
      data[idx + 3] = 255;
    }
  }

  ctx.putImageData(img, 0, 0);
  return canvas;
}

/* ------------------------------------------------------------------ *
 * Ring band texture (1 x N strip, sampled radially)
 * ------------------------------------------------------------------ */

export function makeRingTexture(seed = 909, width = 2048) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = 4;
  const ctx = canvas.getContext('2d');
  const img = ctx.createImageData(width, 4);
  const data = img.data;
  const noise2 = makeNoise2D(seed);
  const rand = mulberry32(seed + 5);

  // Random gap positions (Cassini-style divisions)
  const gaps = [];
  for (let i = 0; i < 7; i++) {
    gaps.push({ pos: 0.05 + rand() * 0.9, w: 0.004 + rand() * 0.02, d: 0.35 + rand() * 0.65 });
  }

  for (let x = 0; x < width; x++) {
    const t = x / width;
    let a = 0.42 + 0.5 * fbm(noise2, t * 60, 3.1, 5);
    // Fine banding
    a *= 0.55 + 0.45 * Math.abs(Math.sin(t * 340 + fbm(noise2, t * 20, 7, 3) * 8));
    // Gaps
    for (const g of gaps) {
      const d = Math.abs(t - g.pos);
      if (d < g.w) a *= 1 - g.d * (1 - d / g.w);
    }
    // Soft edges
    a *= smoothstep(0.0, 0.09, t) * smoothstep(1.0, 0.91, t);
    a = Math.max(0, Math.min(1, a));

    // Colour drift: icy blue-white to sandy tan
    const warm = fbm(noise2, t * 9, 12.7, 3);
    const col = mixRGB([0.72, 0.78, 0.88], [0.92, 0.82, 0.66], warm);

    for (let y = 0; y < 4; y++) {
      const idx = (y * width + x) * 4;
      data[idx] = col[0] * 255 * (0.65 + a * 0.55);
      data[idx + 1] = col[1] * 255 * (0.65 + a * 0.55);
      data[idx + 2] = col[2] * 255 * (0.65 + a * 0.55);
      data[idx + 3] = 255 * a;
    }
  }
  ctx.putImageData(img, 0, 0);
  return canvas;
}

/* ------------------------------------------------------------------ *
 * Nebula skybox (equirectangular)
 * ------------------------------------------------------------------ */

export function makeNebulaTexture(width = 1536, height = 768, seed = 2024) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  const img = ctx.createImageData(width, height);
  const data = img.data;

  const noise3 = makeNoise3D(seed);
  const noise2 = makeNoise2D(seed + 31);

  const palette = [
    [0.04, 0.05, 0.13],
    [0.09, 0.06, 0.20],
    [0.22, 0.08, 0.26],
    [0.05, 0.15, 0.25],
    [0.07, 0.21, 0.27],
    [0.27, 0.12, 0.14],
  ];

  for (let y = 0; y < height; y++) {
    const v = y / height;
    const lat = (v - 0.5) * Math.PI;
    const cosLat = Math.cos(lat);
    for (let x = 0; x < width; x++) {
      const u = x / width;
      const lon = u * Math.PI * 2;

      const px = Math.cos(lon) * cosLat;
      const py = Math.sin(lat);
      const pz = Math.sin(lon) * cosLat;

      // Single cheap domain warp for filamentary structure.
      const wx = fbm(noise2, u * 3.1, v * 2.2, 2) - 0.5;
      const wy = fbm(noise2, u * 2.3 + 4, v * 1.9, 2) - 0.5;

      const n = fbm3(noise3, px * 2.1 + wx * 1.4, py * 2.1 + wy * 1.4, pz * 2.1, 4);
      const fil = ridged3(noise3, px * 3.4 + wx, py * 3.4 + wy, pz * 3.4, 3);
      const clouds = smoothstep(0.42, 0.86, n);
      const density = Math.min(1, clouds * 0.85 + fil * 0.42);

      // Pick palette entry from a slow gradient across the sky
      const grad = (fbm(noise2, u * 3.1, v * 2.2, 3) * (palette.length - 1)) | 0;
      const col = palette[Math.max(0, Math.min(palette.length - 1, grad))];

      const glow = density * density;
      const r = col[0] * glow * 1.25;
      const g = col[1] * glow * 1.25;
      const b = col[2] * glow * 1.25;

      // Deep space floor colour (not pure black — keeps a cinematic lift)
      const idx = (y * width + x) * 4;
      data[idx] = Math.min(255, (r + 0.012) * 255);
      data[idx + 1] = Math.min(255, (g + 0.014) * 255);
      data[idx + 2] = Math.min(255, (b + 0.028) * 255);
      data[idx + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  return canvas;
}

/* ------------------------------------------------------------------ *
 * Hull / panel material maps
 * ------------------------------------------------------------------ */

export function makeHullTexture(size = 512, seed = 77, tint = [0.30, 0.33, 0.38]) {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  const noise2 = makeNoise2D(seed);
  const rand = mulberry32(seed + 3);

  const img = ctx.createImageData(size, size);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const n = fbm(noise2, x * 0.06, y * 0.06, 4);
      const scratch = smoothstep(0.62, 0.98, fbm(noise2, x * 0.9, y * 0.02, 2));
      const c = [
        tint[0] * (0.72 + n * 0.55) + scratch * 0.12,
        tint[1] * (0.72 + n * 0.55) + scratch * 0.12,
        tint[2] * (0.72 + n * 0.55) + scratch * 0.12,
      ];
      const idx = (y * size + x) * 4;
      img.data[idx] = Math.min(255, c[0] * 255);
      img.data[idx + 1] = Math.min(255, c[1] * 255);
      img.data[idx + 2] = Math.min(255, c[2] * 255);
      img.data[idx + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);

  // Panel seams
  ctx.strokeStyle = 'rgba(0,0,0,0.42)';
  ctx.lineWidth = 1;
  for (let i = 0; i < 26; i++) {
    const x = Math.floor(rand() * size);
    const y = Math.floor(rand() * size);
    const w = 30 + rand() * 160;
    const h = 24 + rand() * 140;
    ctx.strokeRect(x, y, w, h);
  }
  ctx.strokeStyle = 'rgba(255,255,255,0.05)';
  for (let i = 0; i < 18; i++) {
    const x = Math.floor(rand() * size);
    const y = Math.floor(rand() * size);
    ctx.strokeRect(x, y, 20 + rand() * 90, 18 + rand() * 70);
  }
  return canvas;
}

export function makeRoughnessTexture(size = 256, seed = 21) {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  const noise2 = makeNoise2D(seed);
  const img = ctx.createImageData(size, size);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const n = fbm(noise2, x * 0.05, y * 0.05, 4);
      const v = 110 + n * 120;
      const idx = (y * size + x) * 4;
      img.data[idx] = v;
      img.data[idx + 1] = v;
      img.data[idx + 2] = v;
      img.data[idx + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  return canvas;
}

/** Soft radial sprite used for glows, dust, star coronas. */
export function makeGlowTexture(size = 256, inner = 'rgba(255,255,255,1)', outer = 'rgba(255,255,255,0)', power = 1) {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  g.addColorStop(0, inner);
  g.addColorStop(Math.min(0.85, 0.28 * power), 'rgba(255,255,255,0.35)');
  g.addColorStop(1, outer);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  return canvas;
}

/** Granulation map for the star surface. */
export function makeStarTexture(width = 512, height = 256, seed = 3141) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  const img = ctx.createImageData(width, height);
  const data = img.data;
  const noise3 = makeNoise3D(seed);
  const noise2 = makeNoise2D(seed + 77);

  for (let y = 0; y < height; y++) {
    const v = y / height;
    const lat = (v - 0.5) * Math.PI;
    const cosLat = Math.cos(lat);
    for (let x = 0; x < width; x++) {
      const u = x / width;
      const lon = u * Math.PI * 2;
      const px = Math.cos(lon) * cosLat;
      const py = Math.sin(lat);
      const pz = Math.sin(lon) * cosLat;

      const gran = fbm3(noise3, px * 12, py * 12, pz * 12, 4);
      const cell = ridged3(noise3, px * 26, py * 26, pz * 26, 3);
      const faculae = smoothstep(0.62, 0.92, fbm(noise2, u * 7, v * 5, 4));

      let lum = 0.52 + gran * 0.42 + cell * 0.18 + faculae * 0.35;
      // Sunspot-ish darker patches
      const spot = smoothstep(0.80, 0.96, fbm(noise2, u * 4 + 3, v * 3, 3));
      lum *= 1 - spot * 0.45;

      const col = mixRGB([1.0, 0.72, 0.38], [1.0, 0.98, 0.9], Math.min(1, lum));
      const idx = (y * width + x) * 4;
      data[idx] = Math.min(255, col[0] * 255);
      data[idx + 1] = Math.min(255, col[1] * 255);
      data[idx + 2] = Math.min(255, col[2] * 255);
      data[idx + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  return canvas;
}

/** Emissive sign / decal texture with crisp text. */
export function makeLabelTexture(text, {
  fg = '#E9A93D',
  bg = 'rgba(10,7,4,0.94)',
  font = 'bold 54px "Menlo", "Consolas", monospace',
  width = 512,
  height = 128,
  sub = '',
  subColor = 'rgba(243,231,210,0.62)',
} = {}) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, width, height);
  ctx.strokeStyle = fg;
  ctx.globalAlpha = 0.55;
  ctx.lineWidth = 4;
  ctx.strokeRect(6, 6, width - 12, height - 12);
  ctx.globalAlpha = 1;
  ctx.fillStyle = fg;
  ctx.font = font;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.shadowColor = fg;
  ctx.shadowBlur = 18;
  ctx.fillText(text, width / 2, sub ? height / 2 - 14 : height / 2);
  ctx.shadowBlur = 0;
  if (sub) {
    ctx.fillStyle = subColor;
    ctx.font = '26px "Menlo", "Consolas", monospace';
    ctx.fillText(sub, width / 2, height / 2 + 30);
  }
  return canvas;
}

/** Irregular asteroid silhouette used as an alpha map for billboards/rocks. */
export function makeRockTexture(size = 256, seed = 5150) {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  const noise2 = makeNoise2D(seed);
  const img = ctx.createImageData(size, size);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const n = fbm(noise2, x * 0.08, y * 0.08, 5);
      const v = 40 + n * 200;
      const idx = (y * size + x) * 4;
      img.data[idx] = v;
      img.data[idx + 1] = v * 0.96;
      img.data[idx + 2] = v * 0.9;
      img.data[idx + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  return canvas;
}
