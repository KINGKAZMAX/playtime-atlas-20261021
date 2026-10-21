/**
 * CHROMA S1 — entry point.
 *
 * Wires the 3D stages, the spectral lab, the sample library and the static
 * sections together. All data stays in the browser; nothing is fetched.
 */
import '@fontsource/martian-mono/latin-400.css';
import '@fontsource/martian-mono/latin-600.css';
import '@fontsource/martian-mono/latin-800.css';
import '@fontsource/space-grotesk/latin-300.css';
import '@fontsource/space-grotesk/latin-400.css';
import '@fontsource/space-grotesk/latin-500.css';
import '@fontsource/space-grotesk/latin-700.css';
import '@fontsource/jetbrains-mono/latin-400.css';
import '@fontsource/jetbrains-mono/latin-500.css';

import './styles/base.css';
import './styles/layout.css';
import './styles/components.css';

import { DEFAULT_SAMPLE_ID, SAMPLES, type Sample } from './content';
import { createStage } from './three/stage';
import { createSpectrumView, type LabMode, type LabState } from './modules/spectrum';
import { createSamplesView } from './modules/samples';
import { renderFaq, renderSpecs, renderStrip } from './modules/lists';
import { initRail, initReveal, initSampleKeyboard, initTopbar } from './modules/reveal';
import { initForm } from './modules/form';

const $ = <T extends HTMLElement>(id: string): T | null => document.getElementById(id) as T | null;

function boot(): void {
  /* ---------------- static sections ---------------- */
  const stripTrack = $('strip-track');
  if (stripTrack) renderStrip(stripTrack);
  const specsTable = $('specs-table');
  if (specsTable) renderSpecs(specsTable);
  const faqList = $('faq-list');
  if (faqList) renderFaq(faqList);

  initReveal();
  initRail();
  initTopbar();
  initForm();

  /* ---------------- shared state ---------------- */
  const defaultSample = SAMPLES.find((s) => s.id === DEFAULT_SAMPLE_ID) ?? SAMPLES[0];
  let currentSample: Sample = defaultSample;

  const labState: LabState = {
    targetHex: defaultSample.hex,
    lambda: 612,
    gain: 1,
    integration: 4,
    mode: 'single',
  };

  /* ---------------- 3D stages ---------------- */
  const deviceCanvas = $<HTMLCanvasElement>('device-canvas');
  const explodeCanvas = $<HTMLCanvasElement>('explode-canvas');
  const heroStage = deviceCanvas ? createStage(deviceCanvas, { mode: 'hero', autoRotate: true }) : null;
  const explodeStage = explodeCanvas
    ? createStage(explodeCanvas, { mode: 'explode', autoRotate: true, fillLight: true })
    : null;

  /* ---------------- spectral lab ---------------- */
  const spectrumCanvas = $<HTMLCanvasElement>('spectrum-canvas');
  let spectrum = spectrumCanvas
    ? createSpectrumView(spectrumCanvas, { ...labState })
    : null;

  /* ---------------- readouts ---------------- */
  const el = {
    labPeak: $('lab-peak'),
    labFwhm: $('lab-fwhm'),
    labDe: $('lab-de'),
    labSnr: $('lab-snr'),
    labIntegRead: $('lab-integ-read'),
    labModeTag: $('lab-mode-tag'),
    labNote: $('lab-note'),
    readoutTarget: $('readout-target'),
    readoutPeak: $('readout-peak'),
    readoutDe: $('readout-de'),
    readoutSwatch: $('readout-swatch'),
    outLambda: $('out-lambda'),
    outGain: $('out-gain'),
    outInteg: $('out-integ'),
  };

  const MODE_NOTES: Record<LabMode, string> = {
    single: '模式：单次测量 — 采集一条静态光谱并保持结果，滑块变化会触发重新采集。',
    scan: '模式：连续扫描 — 扫描线在 380–780 nm 之间往复，曲线与读数实时刷新。',
    calib: '模式：白平衡校准 — 正在拟合白点响应曲线，此模式下读数为校准增益而非样本值。',
  };

  function applySample(sample: Sample): void {
    currentSample = sample;
    labState.targetHex = sample.hex;
    spectrum?.setState({ targetHex: sample.hex });
    if (el.readoutTarget) el.readoutTarget.textContent = sample.hex;
    if (el.readoutSwatch) el.readoutSwatch.style.background = sample.hex;
  }

  function onMetrics(m: {
    peak: number;
    fwhm: number;
    deltaE: number;
    snr: number;
    measuredHex: string;
  }): void {
    if (el.labPeak) el.labPeak.textContent = `${m.peak} nm`;
    if (el.labFwhm) el.labFwhm.textContent = `${m.fwhm.toFixed(1)} nm`;
    if (el.labDe) el.labDe.textContent = m.deltaE.toFixed(2);
    if (el.labSnr) el.labSnr.textContent = `${m.snr.toFixed(1)} dB`;
    if (el.readoutPeak) el.readoutPeak.textContent = `${m.peak} nm`;
    if (el.readoutDe) el.readoutDe.textContent = m.deltaE.toFixed(2);

    heroStage?.setScreen(currentSample.hex, m.peak, currentSample.name);
    explodeStage?.setScreen(currentSample.hex, m.peak, currentSample.name);
  }

  spectrum?.onMetrics(onMetrics);

  /* ---------------- sample library ---------------- */
  const samplesGrid = $('samples-grid');
  const samplesView = samplesGrid
    ? createSamplesView(samplesGrid, SAMPLES, (sample) => {
        applySample(sample);
      })
    : null;
  if (samplesView) samplesView.select(defaultSample.id);

  initSampleKeyboard((delta) => {
    const index = SAMPLES.findIndex((s) => s.id === currentSample.id);
    const next = SAMPLES[(index + delta + SAMPLES.length) % SAMPLES.length];
    samplesView?.select(next.id);
  });

  /* ---------------- lab controls ---------------- */
  const lambdaInput = $<HTMLInputElement>('ctl-lambda');
  const gainInput = $<HTMLInputElement>('ctl-gain');
  const integInput = $<HTMLInputElement>('ctl-integ');

  lambdaInput?.addEventListener('input', () => {
    const v = Number(lambdaInput.value);
    labState.lambda = v;
    if (el.outLambda) el.outLambda.textContent = `${v} nm`;
    spectrum?.setState({ lambda: v });
  });

  gainInput?.addEventListener('input', () => {
    const v = Number(gainInput.value) / 100;
    labState.gain = v;
    if (el.outGain) el.outGain.textContent = `${v.toFixed(2)}×`;
    spectrum?.setState({ gain: v });
  });

  integInput?.addEventListener('input', () => {
    const v = Number(integInput.value);
    labState.integration = v;
    if (el.outInteg) el.outInteg.textContent = `${v} ms`;
    if (el.labIntegRead) el.labIntegRead.textContent = `${v} ms`;
    spectrum?.setState({ integration: v });
  });

  const modeButtons = Array.from(document.querySelectorAll<HTMLButtonElement>('.mode'));
  for (const btn of modeButtons) {
    btn.addEventListener('click', () => {
      for (const other of modeButtons) other.classList.remove('is-active');
      btn.classList.add('is-active');
      const mode = (btn.dataset.mode ?? 'single') as LabMode;
      labState.mode = mode;
      if (el.labModeTag) {
        el.labModeTag.textContent =
          mode === 'scan' ? 'CONTINUOUS SCAN' : mode === 'calib' ? 'WHITE BALANCE' : 'SINGLE SHOT';
      }
      if (el.labNote) el.labNote.textContent = MODE_NOTES[mode];
      spectrum?.setState({ mode });
    });
  }

  /* ---------------- colourway switcher ---------------- */
  const swatchButtons = Array.from(document.querySelectorAll<HTMLButtonElement>('.swatch'));
  for (const btn of swatchButtons) {
    btn.addEventListener('click', () => {
      for (const other of swatchButtons) {
        other.classList.remove('is-active');
        other.setAttribute('aria-pressed', 'false');
      }
      btn.classList.add('is-active');
      btn.setAttribute('aria-pressed', 'true');
      const colorway = (btn.dataset.colorway ?? 'graphite') as
        | 'graphite'
        | 'sand'
        | 'ice';
      heroStage?.setColorway(colorway);
      explodeStage?.setColorway(colorway);
    });
  }

  /* ---------------- exploded view ---------------- */
  const explodeToggle = $('explode-toggle');
  let exploded = false;
  explodeToggle?.addEventListener('click', () => {
    exploded = !exploded;
    explodeStage?.setExplode(exploded ? 1 : 0);
    explodeToggle.setAttribute('aria-pressed', String(exploded));
    explodeToggle.textContent = exploded ? '合拢' : '展开';
  });

  const callouts = Array.from(document.querySelectorAll<HTMLElement>('.explode__callouts li'));
  for (const li of callouts) {
    const part = li.dataset.part ?? null;
    const activate = () => {
      for (const other of callouts) other.classList.toggle('is-hot', other === li);
      explodeStage?.highlight(part);
    };
    li.addEventListener('mouseenter', activate);
    li.addEventListener('focusin', activate);
    li.addEventListener('click', () => {
      if (!exploded) explodeToggle?.click();
      activate();
    });
    li.addEventListener('mouseleave', () => {
      li.classList.remove('is-hot');
      explodeStage?.highlight(null);
    });
  }

  /* ---------------- initial paint ---------------- */
  applySample(defaultSample);
  if (el.outLambda) el.outLambda.textContent = `${labState.lambda} nm`;
  if (el.outGain) el.outGain.textContent = `${labState.gain.toFixed(2)}×`;
  if (el.outInteg) el.outInteg.textContent = `${labState.integration} ms`;
  if (el.labNote) el.labNote.textContent = MODE_NOTES.single;

  window.addEventListener('beforeunload', () => {
    spectrum?.destroy();
    heroStage?.dispose();
    explodeStage?.dispose();
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot, { once: true });
} else {
  boot();
}
