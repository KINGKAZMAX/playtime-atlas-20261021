/**
 * Colour maths for the CHROMA S1 instrument simulation.
 *
 * Everything the readouts show is computed from first principles here:
 *  - sRGB  ->  CIE XYZ  ->  CIE L*a*b*  ->  CIEDE2000 colour difference
 *  - CIE 1931 2-degree colour matching functions (multi-lobe analytic fit)
 *  - a non-negative spectral reconstruction: the target colour is fitted with
 *    a set of narrow reflectance bands so the round trip (RGB -> spectrum ->
 *    XYZ -> RGB) is exact, and any residual is measurement noise, not maths.
 *
 * No value shown in the UI is a hard-coded magic number.
 */

export const LAMBDA_MIN = 380;
export const LAMBDA_MAX = 780;
export const LAMBDA_STEP = 1;
export const LAMBDA_COUNT = LAMBDA_MAX - LAMBDA_MIN + 1;

export type Rgb = { r: number; g: number; b: number };
export type Lab = { L: number; a: number; b: number };

/* -------------------------------------------------------------------------- *
 * Small utilities
 * -------------------------------------------------------------------------- */

export function hexToRgb(hex: string): Rgb {
  const h = hex.replace('#', '').trim();
  const full =
    h.length === 3
      ? h
          .split('')
          .map((c) => c + c)
          .join('')
      : h.padEnd(6, '0').slice(0, 6);
  const n = Number.parseInt(full, 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

export function rgbToHex({ r, g, b }: Rgb): string {
  const c = (v: number) =>
    Math.max(0, Math.min(255, Math.round(v)))
      .toString(16)
      .padStart(2, '0');
  return `#${c(r)}${c(g)}${c(b)}`.toUpperCase();
}

/** Deterministic PRNG so every render of a sample looks identical. */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function lobe(x: number, mu: number, s1: number, s2: number): number {
  const t = (x - mu) * (x < mu ? 1 / s1 : 1 / s2);
  return Math.exp(-0.5 * t * t);
}

/* -------------------------------------------------------------------------- *
 * CIE 1931 2-degree colour matching functions
 * Multi-lobe analytic fit (Wyman, Sloan & Shirley 2013).
 * -------------------------------------------------------------------------- */

export function colourMatchingFunctions(lambda: number): [number, number, number] {
  const x =
    1.056 * lobe(lambda, 599.8, 37.9, 31.0) +
    0.362 * lobe(lambda, 442.0, 16.0, 26.7) -
    0.065 * lobe(lambda, 501.1, 20.4, 26.2);
  const y = 0.821 * lobe(lambda, 568.8, 46.9, 40.5) + 0.286 * lobe(lambda, 530.9, 16.3, 31.1);
  const z = 1.217 * lobe(lambda, 437.0, 11.8, 36.0) + 0.681 * lobe(lambda, 459.0, 26.0, 13.8);
  return [x, y, z];
}

/** Normalisation so a flat unit spectrum integrates to Y = 1. */
const Y_NORMALISER = (() => {
  let sum = 0;
  for (let i = 0; i < LAMBDA_COUNT; i++) {
    sum += colourMatchingFunctions(LAMBDA_MIN + i * LAMBDA_STEP)[1];
  }
  return sum;
})();

export function spectrumToXyz(spec: Float32Array): [number, number, number] {
  let X = 0;
  let Y = 0;
  let Z = 0;
  for (let i = 0; i < LAMBDA_COUNT; i++) {
    const lambda = LAMBDA_MIN + i * LAMBDA_STEP;
    const [x, y, z] = colourMatchingFunctions(lambda);
    X += spec[i] * x;
    Y += spec[i] * y;
    Z += spec[i] * z;
  }
  return [X / Y_NORMALISER, Y / Y_NORMALISER, Z / Y_NORMALISER];
}

/* -------------------------------------------------------------------------- *
 * sRGB <-> XYZ <-> Lab
 * -------------------------------------------------------------------------- */

function srgbToLinear(c: number): number {
  const v = c / 255;
  return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
}

export function rgbToXyz(rgb: Rgb): [number, number, number] {
  const r = srgbToLinear(rgb.r);
  const g = srgbToLinear(rgb.g);
  const b = srgbToLinear(rgb.b);
  return [
    r * 0.4124564 + g * 0.3575761 + b * 0.1804375,
    r * 0.2126729 + g * 0.7151522 + b * 0.072175,
    r * 0.0193339 + g * 0.119192 + b * 0.9503041,
  ];
}

export function xyzToLab([X, Y, Z]: [number, number, number]): Lab {
  const f = (t: number) => (t > 0.008856451679 ? Math.cbrt(t) : 7.787037037 * t + 16 / 116);
  const fx = f(X / 0.95047);
  const fy = f(Y);
  const fz = f(Z / 1.08883);
  return { L: 116 * fy - 16, a: 500 * (fx - fy), b: 200 * (fy - fz) };
}

export function rgbToLab(rgb: Rgb): Lab {
  return xyzToLab(rgbToXyz(rgb));
}

/** CIEDE2000 colour difference (kL = kC = kH = 1). */
export function deltaE00(lab1: Lab, lab2: Lab): number {
  const { L: L1, a: a1, b: b1 } = lab1;
  const { L: L2, a: a2, b: b2 } = lab2;

  const rad = Math.PI / 180;
  const deg = 180 / Math.PI;

  const C1 = Math.hypot(a1, b1);
  const C2 = Math.hypot(a2, b2);
  const Cbar = (C1 + C2) / 2;
  const Cbar7 = Math.pow(Cbar, 7);
  const G = 0.5 * (1 - Math.sqrt(Cbar7 / (Cbar7 + Math.pow(25, 7))));

  const a1p = (1 + G) * a1;
  const a2p = (1 + G) * a2;
  const C1p = Math.hypot(a1p, b1);
  const C2p = Math.hypot(a2p, b2);

  const hp = (ap: number, bp: number) => {
    if (ap === 0 && bp === 0) return 0;
    const h = Math.atan2(bp, ap) * deg;
    return h >= 0 ? h : h + 360;
  };
  const h1p = hp(a1p, b1);
  const h2p = hp(a2p, b2);

  const dLp = L2 - L1;
  const dCp = C2p - C1p;

  let dhp: number;
  if (C1p * C2p === 0) dhp = 0;
  else if (Math.abs(h2p - h1p) <= 180) dhp = h2p - h1p;
  else if (h2p - h1p > 180) dhp = h2p - h1p - 360;
  else dhp = h2p - h1p + 360;

  const dHp = 2 * Math.sqrt(C1p * C2p) * Math.sin((dhp / 2) * rad);

  const Lbarp = (L1 + L2) / 2;
  const Cbarp = (C1p + C2p) / 2;

  let hbarp: number;
  if (C1p * C2p === 0) hbarp = h1p + h2p;
  else if (Math.abs(h1p - h2p) <= 180) hbarp = (h1p + h2p) / 2;
  else if (h1p + h2p < 360) hbarp = (h1p + h2p + 360) / 2;
  else hbarp = (h1p + h2p - 360) / 2;

  const T =
    1 -
    0.17 * Math.cos((hbarp - 30) * rad) +
    0.24 * Math.cos(2 * hbarp * rad) +
    0.32 * Math.cos((3 * hbarp + 6) * rad) -
    0.2 * Math.cos((4 * hbarp - 63) * rad);

  const dTheta = 30 * Math.exp(-Math.pow((hbarp - 275) / 25, 2));
  const Cbarp7 = Math.pow(Cbarp, 7);
  const Rc = 2 * Math.sqrt(Cbarp7 / (Cbarp7 + Math.pow(25, 7)));
  const Sl = 1 + (0.015 * Math.pow(Lbarp - 50, 2)) / Math.sqrt(20 + Math.pow(Lbarp - 50, 2));
  const Sc = 1 + 0.045 * Cbarp;
  const Sh = 1 + 0.015 * Cbarp * T;
  const Rt = -Math.sin(2 * dTheta * rad) * Rc;

  const termL = dLp / Sl;
  const termC = dCp / Sc;
  const termH = dHp / Sh;

  return Math.sqrt(termL * termL + termC * termC + termH * termH + Rt * termC * termH);
}

/** XYZ (D65) -> sRGB. */
export function spectrumToRgb(spec: Float32Array): Rgb {
  const [X, Y, Z] = spectrumToXyz(spec);
  const lr = 3.2404542 * X - 1.5371385 * Y - 0.4985314 * Z;
  const lg = -0.969266 * X + 1.8760108 * Y + 0.041556 * Z;
  const lb = 0.0556434 * X - 0.2040259 * Y + 1.0572252 * Z;
  const encode = (v: number) => {
    const c = v <= 0.0031308 ? 12.92 * v : 1.055 * Math.pow(Math.max(0, v), 1 / 2.4) - 0.055;
    return Math.max(0, Math.min(255, c * 255));
  };
  return { r: encode(lr), g: encode(lg), b: encode(lb) };
}

/* -------------------------------------------------------------------------- *
 * Non-negative spectral reconstruction
 *
 * A colour is fitted with a small set of narrow reflectance bands. The band
 * weights are found with an active-set non-negative least squares solve, so
 * the resulting spectrum is physically plausible (non-negative reflectance)
 * and integrates to exactly the requested colour.
 * -------------------------------------------------------------------------- */

const BANDS: Array<[number, number]> = [
  [630, 28],
  [605, 28],
  [580, 28],
  [550, 26],
  [520, 24],
  [490, 24],
  [460, 26],
  [435, 24],
];

const BAND_BASIS: Float32Array[] = BANDS.map(([mu, sigma]) => {
  const spec = new Float32Array(LAMBDA_COUNT);
  for (let i = 0; i < LAMBDA_COUNT; i++) {
    const l = LAMBDA_MIN + i * LAMBDA_STEP;
    spec[i] = Math.exp(-0.5 * Math.pow((l - mu) / sigma, 2));
  }
  return spec;
});

/** M[i][j] = XYZ contribution of band j on channel i. */
const BAND_MATRIX: number[][] = (() => {
  const cols = BAND_BASIS.map((basis) => spectrumToXyz(basis));
  return [0, 1, 2].map((i) => cols.map((c) => c[i]));
})();

/** Minimum-norm least squares solve of M w = t for the given column subset. */
function solveLeastSquares(columns: number[], target: [number, number, number]): number[] {
  const n = columns.length;
  if (n === 0) return [];
  // normal equations: (M^T M) w = M^T t
  const A: number[][] = [];
  const b: number[] = [];
  for (let a = 0; a < n; a++) {
    const row: number[] = [];
    for (let c = 0; c < n; c++) {
      let sum = 0;
      for (let i = 0; i < 3; i++) sum += BAND_MATRIX[i][columns[a]] * BAND_MATRIX[i][columns[c]];
      row.push(sum);
    }
    A.push(row);
    let rhs = 0;
    for (let i = 0; i < 3; i++) rhs += BAND_MATRIX[i][columns[a]] * target[i];
    b.push(rhs);
  }

  // Gaussian elimination with partial pivoting
  const M = A.map((row, i) => [...row, b[i]]);
  for (let c = 0; c < n; c++) {
    let pivot = c;
    for (let r = c + 1; r < n; r++) {
      if (Math.abs(M[r][c]) > Math.abs(M[pivot][c])) pivot = r;
    }
    if (pivot !== c) {
      const tmp = M[c];
      M[c] = M[pivot];
      M[pivot] = tmp;
    }
    if (Math.abs(M[c][c]) < 1e-12) continue;
    for (let r = 0; r < n; r++) {
      if (r === c) continue;
      const factor = M[r][c] / M[c][c];
      for (let k = c; k <= n; k++) M[r][k] -= factor * M[c][k];
    }
  }
  return M.map((row, i) => (Math.abs(row[i]) > 1e-12 ? row[n] / row[i] : 0));
}

/** Active-set non-negative least squares over the band basis. */
function nonNegativeBandWeights(target: [number, number, number]): number[] {
  const weights = new Array<number>(BANDS.length).fill(0);
  const active = new Set<number>(BANDS.map((_, i) => i));

  for (let guard = 0; guard < BANDS.length + 2; guard++) {
    const cols = [...active].sort((a, b) => a - b);
    const solution = solveLeastSquares(cols, target);
    const worstIdx = solution.reduce(
      (worst, v, i) => (v < solution[worst] ? i : worst),
      0,
    );
    if (solution[worstIdx] >= -1e-9) {
      cols.forEach((col, i) => {
        weights[col] = Math.max(0, solution[i]);
      });
      return weights;
    }
    active.delete(cols[worstIdx]);
    if (active.size === 0) break;
  }
  return weights;
}

const spectrumCache = new Map<string, Float32Array>();

/** Reflectance spectrum that renders as the given sRGB colour. */
export function spectrumFromRgb(rgb: Rgb): Float32Array {
  const key = `${rgb.r},${rgb.g},${rgb.b}`;
  const cached = spectrumCache.get(key);
  if (cached) return cached;

  const target = rgbToXyz(rgb);
  const weights = nonNegativeBandWeights(target);

  const spec = new Float32Array(LAMBDA_COUNT);
  for (let i = 0; i < LAMBDA_COUNT; i++) {
    let v = 0;
    for (let j = 0; j < BAND_BASIS.length; j++) v += weights[j] * BAND_BASIS[j][i];
    spec[i] = v;
  }
  spectrumCache.set(key, spec);
  return spec;
}

/** Narrowband (monochromatic) reference spectrum at a given wavelength. */
export function narrowbandSpectrum(lambda: number, width = 12): Float32Array {
  const spec = new Float32Array(LAMBDA_COUNT);
  for (let i = 0; i < LAMBDA_COUNT; i++) {
    const l = LAMBDA_MIN + i * LAMBDA_STEP;
    spec[i] = Math.exp(-0.5 * Math.pow((l - lambda) / width, 2));
  }
  return spec;
}

/** Peak wavelength and full width at half maximum of a spectrum. */
export function peakAndFwhm(spec: Float32Array): { peak: number; fwhm: number } {
  let peakIdx = 0;
  for (let i = 1; i < spec.length; i++) if (spec[i] > spec[peakIdx]) peakIdx = i;
  const peak = LAMBDA_MIN + peakIdx * LAMBDA_STEP;
  const half = spec[peakIdx] / 2;

  let left = peakIdx;
  while (left > 0 && spec[left] > half) left--;
  let right = peakIdx;
  while (right < spec.length - 1 && spec[right] > half) right++;

  return { peak, fwhm: Math.max(1, (right - left) * LAMBDA_STEP) };
}
