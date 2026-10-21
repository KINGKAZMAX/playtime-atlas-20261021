/**
 * 程序化音效引擎 —— 不加载任何音频文件。
 *
 * 设计要点：
 *  - 全部音色由 WebAudio 振荡器 / 噪声缓冲实时合成。
 *  - AudioContext 必须在用户手势后才能 resume()，因此提供 `unlock()` 并在首次交互调用。
 *  - 静音状态写入 localStorage，跨会话保持。
 */

const STORAGE_KEY = 'lumen-era.muted';

export class AudioKit {
  constructor() {
    this.ctx = null;
    this.master = null;
    this.muted = readMuted();
    this.noiseBuffer = null;
  }

  /** 在首次用户手势中调用，创建 / 恢复音频上下文。 */
  unlock() {
    if (!this.ctx) {
      const Ctor = window.AudioContext || window.webkitAudioContext;
      if (!Ctor) return;
      try {
        this.ctx = new Ctor();
      } catch {
        this.ctx = null;
        return;
      }
      this.master = this.ctx.createGain();
      this.master.gain.value = this.muted ? 0 : 0.5;
      this.master.connect(this.ctx.destination);
      this.noiseBuffer = makeNoise(this.ctx);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  setMuted(muted) {
    this.muted = muted;
    writeMuted(muted);
    if (this.master && this.ctx) {
      const now = this.ctx.currentTime;
      this.master.gain.cancelScheduledValues(now);
      this.master.gain.setTargetAtTime(muted ? 0 : 0.5, now, 0.02);
    }
  }

  toggleMute() {
    this.setMuted(!this.muted);
    return this.muted;
  }

  get ready() {
    return !!this.ctx && !this.muted;
  }

  /** 基础音：振荡器 + ADSR 包络。 */
  tone({ freq = 440, to = null, type = 'sine', dur = 0.16, gain = 0.25, delay = 0, sweep = 'exp' }) {
    if (!this.ready) return;
    const ctx = this.ctx;
    const t0 = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    const env = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(Math.max(20, freq), t0);
    if (to !== null) {
      if (sweep === 'exp') {
        osc.frequency.exponentialRampToValueAtTime(Math.max(20, to), t0 + dur);
      } else {
        osc.frequency.linearRampToValueAtTime(Math.max(20, to), t0 + dur);
      }
    }
    env.gain.setValueAtTime(0.0001, t0);
    env.gain.exponentialRampToValueAtTime(gain, t0 + Math.min(0.02, dur * 0.25));
    env.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(env);
    env.connect(this.master);
    osc.start(t0);
    osc.stop(t0 + dur + 0.03);
  }

  /** 噪声脉冲（用于撞击、爆裂）。 */
  noise({ dur = 0.2, gain = 0.2, freq = 1200, q = 1, delay = 0, type = 'bandpass' }) {
    if (!this.ready || !this.noiseBuffer) return;
    const ctx = this.ctx;
    const t0 = ctx.currentTime + delay;
    const src = ctx.createBufferSource();
    src.buffer = this.noiseBuffer;
    const filt = ctx.createBiquadFilter();
    filt.type = type;
    filt.frequency.setValueAtTime(freq, t0);
    filt.Q.value = q;
    const env = ctx.createGain();
    env.gain.setValueAtTime(gain, t0);
    env.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    src.connect(filt);
    filt.connect(env);
    env.connect(this.master);
    src.start(t0);
    src.stop(t0 + dur + 0.03);
  }

  // —— 语义化音效 ————————————————————————————————

  hit(rally = 0) {
    const step = Math.min(rally, 12);
    this.tone({ freq: 320 + step * 26, to: 240 + step * 22, type: 'square', dur: 0.1, gain: 0.16 });
    this.noise({ dur: 0.05, gain: 0.08, freq: 2200, q: 0.8 });
  }

  smash() {
    this.tone({ freq: 880, to: 180, type: 'sawtooth', dur: 0.26, gain: 0.2 });
    this.noise({ dur: 0.22, gain: 0.16, freq: 900, q: 0.6, type: 'lowpass' });
  }

  wall() {
    this.tone({ freq: 520, to: 400, type: 'triangle', dur: 0.07, gain: 0.1 });
  }

  charge(level) {
    // 蓄力时的持续上行提示：level 0..1
    this.tone({ freq: 200 + level * 500, to: 260 + level * 700, type: 'triangle', dur: 0.09, gain: 0.07 });
  }

  score(isSmash = false) {
    if (isSmash) {
      this.tone({ freq: 660, type: 'square', dur: 0.1, gain: 0.18 });
      this.tone({ freq: 990, type: 'square', dur: 0.1, gain: 0.16, delay: 0.09 });
      this.tone({ freq: 1320, type: 'triangle', dur: 0.22, gain: 0.14, delay: 0.18 });
    } else {
      this.tone({ freq: 620, type: 'square', dur: 0.1, gain: 0.16 });
      this.tone({ freq: 930, type: 'triangle', dur: 0.2, gain: 0.13, delay: 0.09 });
    }
  }

  tick(high = false) {
    this.tone({ freq: high ? 1200 : 700, type: 'square', dur: 0.05, gain: 0.12 });
  }

  serve() {
    this.tone({ freq: 400, to: 900, type: 'triangle', dur: 0.14, gain: 0.15 });
  }

  win() {
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((f, i) =>
      this.tone({ freq: f, type: 'triangle', dur: 0.3, gain: 0.16, delay: i * 0.11 }),
    );
  }

  lose() {
    const notes = [523.25, 415.3, 329.63, 246.94];
    notes.forEach((f, i) =>
      this.tone({ freq: f, type: 'sawtooth', dur: 0.3, gain: 0.12, delay: i * 0.12 }),
    );
  }

  burn() {
    this.tone({ freq: 300, to: 90, type: 'sawtooth', dur: 0.32, gain: 0.2 });
    this.noise({ dur: 0.3, gain: 0.14, freq: 700, q: 0.5, type: 'lowpass' });
  }

  burst() {
    this.tone({ freq: 1400, to: 260, type: 'sine', dur: 0.42, gain: 0.16 });
    this.noise({ dur: 0.36, gain: 0.12, freq: 1800, q: 0.4, type: 'highpass' });
  }

  thrust() {
    this.noise({ dur: 0.14, gain: 0.05, freq: 480, q: 0.6, type: 'lowpass' });
  }

  ui() {
    this.tone({ freq: 760, type: 'sine', dur: 0.05, gain: 0.09 });
  }
}

function makeNoise(ctx) {
  const len = Math.floor(ctx.sampleRate * 0.6);
  const buf = ctx.createBuffer(1, len, ctx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < len; i += 1) {
    data[i] = Math.random() * 2 - 1;
  }
  return buf;
}

function readMuted() {
  try {
    return window.localStorage.getItem(STORAGE_KEY) === '1';
  } catch {
    return false;
  }
}

function writeMuted(muted) {
  try {
    window.localStorage.setItem(STORAGE_KEY, muted ? '1' : '0');
  } catch {
    /* 隐私模式下静默失败 */
  }
}
