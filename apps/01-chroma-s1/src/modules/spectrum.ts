/**
 * The spectral lab canvas.
 *
 * Draws a measured reflectance curve, a narrowband target and the noise floor.
 * All three are computed from the real colour maths in ../color.ts, so the
 * readouts move when the sliders move.
 */
import {
  LAMBDA_COUNT,
  LAMBDA_MAX,
  LAMBDA_MIN,
  LAMBDA_STEP,
  deltaE00,
  hexToRgb,
  narrowbandSpectrum,
  peakAndFwhm,
  rgbToLab,
  spectrumFromRgb,
  spectrumToRgb,
  mulberry32,
} from '../color';

export type LabMode = 'single' | 'scan' | 'calib';

export interface LabState {
  targetHex: string;
  lambda: number;
  gain: number;
  integration: number;
  mode: LabMode;
}

export interface LabMetrics {
  peak: number;
  fwhm: number;
  deltaE: number;
  snr: number;
  measuredHex: string;
}

export interface SpectrumView {
  setState: (patch: Partial<LabState>) => void;
  onMetrics: (cb: (m: LabMetrics) => void) => void;
  destroy: () => void;
}

const COLORS = {
  grid: 'rgba(236, 233, 226, 0.07)',
  gridStrong: 'rgba(236, 233, 226, 0.13)',
  axis: 'rgba(236, 233, 226, 0.32)',
  text: '#6d7781',
  measured: '#ff6b2c',
  measuredFill: 'rgba(255, 107, 44, 0.16)',
  target: '#4fd8e8',
  noise: 'rgba(236, 233, 226, 0.30)',
  marker: '#a78bfa',
};

function smoothNoise(seed: number, count: number): Float32Array {
  const rnd = mulberry32(seed);
  const control = new Float32Array(12);
  for (let i = 0; i < control.length; i++) control[i] = rnd() * 2 - 1;
  const out = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    const t = (i / count) * (control.length - 1);
    const i0 = Math.floor(t);
    const i1 = Math.min(control.length - 1, i0 + 1);
    const f = t - i0;
    const s = f * f * (3 - 2 * f);
    out[i] = control[i0] * (1 - s) + control[i1] * s;
  }
  return out;
}

/** D65-ish reference shape used by the white-balance calibration mode. */
function referenceSpectrum(): Float32Array {
  const spec = new Float32Array(LAMBDA_COUNT);
  for (let i = 0; i < LAMBDA_COUNT; i++) {
    const l = LAMBDA_MIN + i * LAMBDA_STEP;
    const s =
      0.42 +
      0.55 * Math.exp(-0.5 * Math.pow((l - 450) / 48, 2)) +
      0.38 * Math.exp(-0.5 * Math.pow((l - 545) / 42, 2)) +
      0.33 * Math.exp(-0.5 * Math.pow((l - 600) / 40, 2));
    spec[i] = s;
  }
  let max = 0;
  for (let i = 0; i < LAMBDA_COUNT; i++) max = Math.max(max, spec[i]);
  for (let i = 0; i < LAMBDA_COUNT; i++) spec[i] /= max;
  return spec;
}

export function createSpectrumView(
  canvas: HTMLCanvasElement,
  initial: LabState,
): SpectrumView {
  const context = canvas.getContext('2d');
  if (!context) {
    return { setState: () => undefined, onMetrics: () => undefined, destroy: () => undefined };
  }
  const ctx: CanvasRenderingContext2D = context;

  let state: LabState = { ...initial };
  const metricsCb: ((m: LabMetrics) => void)[] = [];

  let baseSpec = spectrumFromRgb(hexToRgb(state.targetHex));
  const targetSpec = narrowbandSpectrum(state.lambda);
  const refSpec = referenceSpectrum();
  const noiseVec = smoothNoise(20261021, LAMBDA_COUNT);

  // Held measurement (single-shot mode keeps the last result stable).
  let heldMeasured: Float32Array = new Float32Array(LAMBDA_COUNT);
  let heldNoise: Float32Array = new Float32Array(LAMBDA_COUNT);
  let scanPhase = 0;
  let lastResult: LabMetrics = {
    peak: state.lambda,
    fwhm: 0,
    deltaE: 0,
    snr: 0,
    measuredHex: state.targetHex,
  };

  let dpr = 1;
  let w = 0;
  let h = 0;

  const resize = () => {
    const rect = canvas.getBoundingClientRect();
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = Math.max(1, Math.floor(rect.width));
    h = Math.max(1, Math.floor(rect.height));
    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  resize();
  const ro = new ResizeObserver(resize);
  ro.observe(canvas);

  const pad = { l: 46, r: 14, t: 18, b: 30 };
  const plotW = () => w - pad.l - pad.r;
  const plotH = () => h - pad.t - pad.b;
  const xOf = (lambda: number) => pad.l + ((lambda - LAMBDA_MIN) / (LAMBDA_MAX - LAMBDA_MIN)) * plotW();
  const yOf = (v: number) => pad.t + plotH() * (1 - Math.max(0, Math.min(1, v)));

  /* ---------------------------------------------------------------- */

  function computeMeasured(timeMs: number): { curve: Float32Array; noise: Float32Array } {
    const src = state.mode === 'calib' ? refSpec : baseSpec;
    const curve: Float32Array = new Float32Array(LAMBDA_COUNT);
    const noise: Float32Array = new Float32Array(LAMBDA_COUNT);

    // Detector noise is modelled relative to the peak of the response, so
    // dark samples are not swamped by an absolute noise floor.
    let peakSrc = 0;
    for (let i = 0; i < LAMBDA_COUNT; i++) peakSrc = Math.max(peakSrc, src[i]);
    const noiseAmp = peakSrc * 0.012 * (4 / state.integration);
    // live jitter for scan mode, frozen for single shot
    const live = state.mode === 'scan';
    const seedShift = live ? Math.floor(timeMs / 55) : 0;

    for (let i = 0; i < LAMBDA_COUNT; i++) {
      const n = noiseVec[i] * noiseAmp;
      const jitter = live ? Math.sin((i + seedShift * 3) * 0.7) * noiseAmp * 0.35 : 0;
      const raw = src[i] * state.gain + n + jitter;
      curve[i] = Math.max(0, raw);
      noise[i] = Math.abs(n + jitter);
    }
    return { curve, noise };
  }

  function updateMetrics(curve: Float32Array, noise: Float32Array) {
    const { peak, fwhm } = peakAndFwhm(curve);
    const measuredRgb = spectrumToRgb(curve);
    const targetRgb = hexToRgb(state.targetHex);
    const dE = deltaE00(rgbToLab(measuredRgb), rgbToLab(targetRgb));

    let sigSum = 0;
    let noiseSum = 0;
    for (let i = 0; i < LAMBDA_COUNT; i++) {
      sigSum += curve[i] * curve[i];
      noiseSum += noise[i] * noise[i];
    }
    const sigRms = Math.sqrt(sigSum / LAMBDA_COUNT);
    const noiseRms = Math.sqrt(noiseSum / LAMBDA_COUNT);
    const snr = noiseRms > 1e-6 ? 20 * Math.log10(sigRms / noiseRms) : 99;

    lastResult = {
      peak,
      fwhm,
      deltaE: Math.max(0, dE),
      snr,
      measuredHex: measuredRgbToHex(measuredRgb),
    };
    for (const cb of metricsCb) cb(lastResult);
  }

  function measuredRgbToHex(rgb: { r: number; g: number; b: number }): string {
    const c = (v: number) =>
      Math.max(0, Math.min(255, Math.round(v)))
        .toString(16)
        .padStart(2, '0');
    return `#${c(rgb.r)}${c(rgb.g)}${c(rgb.b)}`.toUpperCase();
  }

  /* ---------------------------------------------------------------- */

  function draw() {
    if (!w || !h) return;
    ctx.clearRect(0, 0, w, h);

    // plot background
    ctx.fillStyle = 'rgba(5, 7, 10, 0.35)';
    ctx.fillRect(pad.l, pad.t, plotW(), plotH());

    // horizontal grid + y labels
    ctx.font = '10px "JetBrains Mono", monospace';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    for (let i = 0; i <= 4; i++) {
      const v = i / 4;
      const y = yOf(v);
      ctx.strokeStyle = i === 0 ? COLORS.axis : COLORS.grid;
      ctx.beginPath();
      ctx.moveTo(pad.l, y);
      ctx.lineTo(pad.l + plotW(), y);
      ctx.stroke();
      ctx.fillStyle = COLORS.text;
      ctx.fillText(v.toFixed(2), pad.l - 8, y);
    }

    // vertical grid + x labels
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    for (let lambda = 400; lambda <= 780; lambda += 50) {
      const x = xOf(lambda);
      ctx.strokeStyle = COLORS.grid;
      ctx.beginPath();
      ctx.moveTo(x, pad.t);
      ctx.lineTo(x, pad.t + plotH());
      ctx.stroke();
      ctx.fillStyle = COLORS.text;
      ctx.fillText(String(lambda), x, pad.t + plotH() + 8);
    }
    ctx.textAlign = 'left';
    ctx.fillStyle = COLORS.text;
    ctx.fillText('nm', pad.l + plotW() - 20, pad.t + plotH() + 8);

    // axis
    ctx.strokeStyle = COLORS.axis;
    ctx.beginPath();
    ctx.moveTo(pad.l, pad.t);
    ctx.lineTo(pad.l, pad.t + plotH());
    ctx.lineTo(pad.l + plotW(), pad.t + plotH());
    ctx.stroke();

    // --- measured curve (filled) ---
    const curve = heldMeasured;
    ctx.beginPath();
    ctx.moveTo(xOf(LAMBDA_MIN), yOf(0));
    for (let i = 0; i < LAMBDA_COUNT; i++) {
      ctx.lineTo(xOf(LAMBDA_MIN + i * LAMBDA_STEP), yOf(curve[i]));
    }
    ctx.lineTo(xOf(LAMBDA_MAX), yOf(0));
    ctx.closePath();
    ctx.fillStyle = COLORS.measuredFill;
    ctx.fill();

    ctx.beginPath();
    for (let i = 0; i < LAMBDA_COUNT; i++) {
      const x = xOf(LAMBDA_MIN + i * LAMBDA_STEP);
      const y = yOf(curve[i]);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.strokeStyle = COLORS.measured;
    ctx.lineWidth = 1.8;
    ctx.stroke();
    ctx.lineWidth = 1;

    // --- noise floor ---
    ctx.beginPath();
    for (let i = 0; i < LAMBDA_COUNT; i++) {
      const x = xOf(LAMBDA_MIN + i * LAMBDA_STEP);
      const y = yOf(heldNoise[i]);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.strokeStyle = COLORS.noise;
    ctx.setLineDash([3, 3]);
    ctx.stroke();
    ctx.setLineDash([]);

    // --- narrowband target ---
    ctx.beginPath();
    for (let i = 0; i < LAMBDA_COUNT; i++) {
      const x = xOf(LAMBDA_MIN + i * LAMBDA_STEP);
      const y = yOf(targetSpec[i] * state.gain);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.strokeStyle = COLORS.target;
    ctx.lineWidth = 1.4;
    ctx.stroke();
    ctx.lineWidth = 1;

    // --- peak + FWHM markers ---
    const { peak, fwhm } = peakAndFwhm(curve);

    ctx.strokeStyle = COLORS.marker;
    ctx.setLineDash([2, 4]);
    ctx.beginPath();
    ctx.moveTo(xOf(peak), pad.t);
    ctx.lineTo(xOf(peak), pad.t + plotH());
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = COLORS.marker;
    ctx.font = '10px "JetBrains Mono", monospace';
    ctx.textAlign = peak > 640 ? 'right' : 'left';
    ctx.textBaseline = 'top';
    ctx.fillText(
      `PEAK ${peak}nm`,
      xOf(peak) + (peak > 640 ? -6 : 6),
      pad.t + 4,
    );
    ctx.textAlign = 'left';
    ctx.fillStyle = COLORS.text;
    ctx.fillText(`FWHM ${fwhm.toFixed(1)}nm`, xOf(peak) + (peak > 640 ? -6 : 6), pad.t + 18);

    // --- scan mode sweep line ---
    if (state.mode === 'scan') {
      const x = xOf(LAMBDA_MIN + scanPhase * (LAMBDA_MAX - LAMBDA_MIN));
      ctx.strokeStyle = 'rgba(167, 139, 250, 0.75)';
      ctx.beginPath();
      ctx.moveTo(x, pad.t);
      ctx.lineTo(x, pad.t + plotH());
      ctx.stroke();
    }
  }

  /* ---------------------------------------------------------------- */

  let raf = 0;
  let running = true;
  const tick = () => {
    raf = requestAnimationFrame(tick);
    if (!running) return;

    if (state.mode === 'scan') {
      scanPhase = (scanPhase + 0.0035) % 1;
      const { curve, noise } = computeMeasured(performance.now());
      heldMeasured = curve;
      heldNoise = noise;
      updateMetrics(curve, noise);
    } else if (state.mode === 'calib') {
      const { curve, noise } = computeMeasured(performance.now());
      heldMeasured = curve;
      heldNoise = noise;
      updateMetrics(curve, noise);
    }

    draw();
  };

  // first measurement
  {
    const { curve, noise } = computeMeasured(0);
    heldMeasured = curve;
    heldNoise = noise;
    updateMetrics(curve, noise);
  }
  // paint immediately so the plot is on screen even without animation frames
  draw();
  raf = requestAnimationFrame(tick);

  const io = new IntersectionObserver(
    (entries) => {
      running = entries.some((e) => e.isIntersecting);
    },
    { threshold: 0.01 },
  );
  io.observe(canvas);

  return {
    setState: (patch) => {
      const needsReMeasure =
        patch.targetHex !== undefined ||
        patch.gain !== undefined ||
        patch.integration !== undefined ||
        patch.mode !== undefined;

      state = { ...state, ...patch };
      if (patch.targetHex !== undefined) {
        baseSpec = spectrumFromRgb(hexToRgb(state.targetHex));
      }
      if (patch.lambda !== undefined) {
        for (let i = 0; i < LAMBDA_COUNT; i++) {
          targetSpec[i] = Math.exp(-0.5 * Math.pow((LAMBDA_MIN + i * LAMBDA_STEP - state.lambda) / 12, 2));
        }
      }
      if (needsReMeasure && state.mode === 'single') {
        const { curve, noise } = computeMeasured(performance.now());
        heldMeasured = curve;
        heldNoise = noise;
        updateMetrics(curve, noise);
      }
      draw();
    },
    onMetrics: (cb) => {
      metricsCb.push(cb);
      cb(lastResult);
    },
    destroy: () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
    },
  };
}
