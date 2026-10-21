/**
 * 《脉冲走廊》的音频引擎 —— 全部为 WebAudio 程序化合成，无任何音频文件。
 *
 * 关键约束：
 * 1. AudioContext 只在用户手势（点击「开始」）后才创建并 resume()。
 * 2. 「视觉节拍模式」或全局静音时，完全不创建 AudioContext，游戏依然可玩可通关。
 * 3. 谱面即乐谱：旋律音符由谱面数据直接驱动，视听天然对齐。
 */

const A4 = 440;
const NOTE_OFFSETS = { C: -9, 'C#': -8, D: -7, 'D#': -6, E: -5, F: -4, 'F#': -3, G: -2, 'G#': -1, A: 0, 'A#': 1, B: 2 };

export function midiToFreq(midi) {
  return A4 * Math.pow(2, (midi - 69) / 12);
}

export class AudioEngine {
  constructor() {
    this.ctx = null;
    this.master = null;
    this.musicGain = null;
    this.sfxGain = null;
    this.delay = null;
    this.delayFeedback = null;
    this.noiseBuffer = null;
    this.ready = false;
    this.muted = false;
    this.failed = false;
  }

  /** 是否已经可以发声（用户已交互且未被静音）。 */
  get active() {
    return this.ready && !this.muted && this.ctx && this.ctx.state === 'running';
  }

  /**
   * 在用户手势中调用：创建 / 恢复 AudioContext。
   * 失败时静默降级为「无音频」模式，游戏逻辑不受影响。
   */
  async unlock() {
    if (this.ready) {
      if (this.ctx.state === 'suspended') {
        try {
          await this.ctx.resume();
        } catch {
          /* 忽略：降级为无声 */
        }
      }
      return this.active;
    }
    const Ctor = window.AudioContext || window.webkitAudioContext;
    if (!Ctor) {
      this.failed = true;
      return false;
    }
    try {
      this.ctx = new Ctor();
      const ctx = this.ctx;

      this.master = ctx.createGain();
      this.master.gain.value = 0.9;
      this.master.connect(ctx.destination);

      this.musicGain = ctx.createGain();
      this.musicGain.gain.value = 0.72;
      this.musicGain.connect(this.master);

      this.sfxGain = ctx.createGain();
      this.sfxGain.gain.value = 0.5;
      this.sfxGain.connect(this.master);

      // 简易延迟回声，给主旋律一点空间感
      this.delay = ctx.createDelay(1.2);
      this.delay.delayTime.value = 0.26;
      this.delayFeedback = ctx.createGain();
      this.delayFeedback.gain.value = 0.26;
      this.delayWet = ctx.createGain();
      this.delayWet.gain.value = 0.3;
      this.delay.connect(this.delayFeedback);
      this.delayFeedback.connect(this.delay);
      this.delay.connect(this.delayWet);
      this.delayWet.connect(this.master);

      this.noiseBuffer = this._makeNoise(1.2);
      this.ready = true;

      if (ctx.state === 'suspended') {
        try {
          await ctx.resume();
        } catch {
          /* 忽略 */
        }
      }
      return this.active;
    } catch (err) {
      console.warn('[audio] 无法初始化 AudioContext，转为无声模式', err);
      this.failed = true;
      this.ctx = null;
      return false;
    }
  }

  setMuted(muted) {
    this.muted = muted;
    if (this.master && this.ctx) {
      const t = this.ctx.currentTime;
      this.master.gain.cancelScheduledValues(t);
      this.master.gain.setTargetAtTime(muted ? 0 : 0.9, t, 0.04);
    }
  }

  suspend() {
    if (this.ctx && this.ctx.state === 'running') this.ctx.suspend().catch(() => {});
  }

  resume() {
    if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume().catch(() => {});
  }

  _makeNoise(seconds) {
    const ctx = this.ctx;
    const len = Math.floor(ctx.sampleRate * seconds);
    const buffer = ctx.createBuffer(1, len, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < len; i += 1) {
      // 稍微偏白的噪声，听感更干净
      data[i] = (Math.random() * 2 - 1) * (0.7 + Math.random() * 0.3);
    }
    return buffer;
  }

  /* ------------------------------------------------------------ *
   * 基础音色
   * ------------------------------------------------------------ */

  _env(node, time, { attack = 0.005, decay = 0.2, peak = 1, sustain = 0, hold = 0 }) {
    const g = node.gain;
    g.setValueAtTime(0.0001, time);
    g.exponentialRampToValueAtTime(Math.max(0.0002, peak), time + attack);
    if (hold > 0) {
      g.exponentialRampToValueAtTime(Math.max(0.0002, sustain || peak * 0.6), time + attack + hold);
      g.exponentialRampToValueAtTime(0.0001, time + attack + hold + decay);
    } else {
      g.exponentialRampToValueAtTime(0.0001, time + attack + decay);
    }
  }

  kick(time, gain = 1) {
    if (!this.active) return;
    const ctx = this.ctx;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(148, time);
    osc.frequency.exponentialRampToValueAtTime(44, time + 0.11);
    this._env(g, time, { attack: 0.004, decay: 0.3, peak: 0.85 * gain });
    osc.connect(g);
    g.connect(this.musicGain);
    osc.start(time);
    osc.stop(time + 0.36);
  }

  snare(time, gain = 1) {
    if (!this.active) return;
    const ctx = this.ctx;
    const src = ctx.createBufferSource();
    src.buffer = this.noiseBuffer;
    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.value = 1900;
    bp.Q.value = 0.9;
    const g = ctx.createGain();
    this._env(g, time, { attack: 0.002, decay: 0.16, peak: 0.32 * gain });
    src.connect(bp);
    bp.connect(g);
    g.connect(this.musicGain);
    src.start(time);
    src.stop(time + 0.24);
  }

  hat(time, gain = 1, open = false) {
    if (!this.active) return;
    const ctx = this.ctx;
    const src = ctx.createBufferSource();
    src.buffer = this.noiseBuffer;
    const hp = ctx.createBiquadFilter();
    hp.type = 'highpass';
    hp.frequency.value = 7200;
    const g = ctx.createGain();
    this._env(g, time, { attack: 0.001, decay: open ? 0.16 : 0.045, peak: 0.16 * gain });
    src.connect(hp);
    hp.connect(g);
    g.connect(this.musicGain);
    src.start(time);
    src.stop(time + 0.3);
  }

  bass(time, freq, dur = 0.42, gain = 1) {
    if (!this.active) return;
    const ctx = this.ctx;
    const osc = ctx.createOscillator();
    const sub = ctx.createOscillator();
    const lp = ctx.createBiquadFilter();
    const g = ctx.createGain();
    osc.type = 'sawtooth';
    sub.type = 'sine';
    osc.frequency.value = freq;
    sub.frequency.value = freq / 2;
    lp.type = 'lowpass';
    lp.frequency.setValueAtTime(520, time);
    lp.frequency.exponentialRampToValueAtTime(190, time + dur);
    this._env(g, time, { attack: 0.012, decay: dur * 0.6, peak: 0.3 * gain, hold: dur * 0.3, sustain: 0.14 * gain });
    osc.connect(lp);
    sub.connect(lp);
    lp.connect(g);
    g.connect(this.musicGain);
    osc.start(time);
    sub.start(time);
    osc.stop(time + dur + 0.2);
    sub.stop(time + dur + 0.2);
  }

  /** 主旋律音色：三角波 + 轻微失谐锯齿，送入延迟。 */
  pluck(time, freq, dur = 0.3, gain = 1) {
    if (!this.active) return;
    const ctx = this.ctx;
    const osc = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const lp = ctx.createBiquadFilter();
    const g = ctx.createGain();
    osc.type = 'triangle';
    osc2.type = 'sawtooth';
    osc.frequency.value = freq;
    osc2.frequency.value = freq * 1.004;
    lp.type = 'lowpass';
    lp.frequency.setValueAtTime(4200, time);
    lp.frequency.exponentialRampToValueAtTime(1300, time + dur);
    this._env(g, time, { attack: 0.006, decay: dur, peak: 0.3 * gain });
    osc.connect(lp);
    osc2.connect(lp);
    lp.connect(g);
    g.connect(this.musicGain);
    g.connect(this.delay);
    osc.start(time);
    osc2.start(time);
    osc.stop(time + dur + 0.15);
    osc2.stop(time + dur + 0.15);
  }

  /** 铺底和弦：失谐锯齿 + 慢速滤波。 */
  pad(time, freqs, dur, gain = 1) {
    if (!this.active) return;
    const ctx = this.ctx;
    const lp = ctx.createBiquadFilter();
    const g = ctx.createGain();
    lp.type = 'lowpass';
    lp.frequency.setValueAtTime(700, time);
    lp.frequency.linearRampToValueAtTime(1500, time + dur * 0.5);
    lp.frequency.linearRampToValueAtTime(600, time + dur);
    this._env(g, time, { attack: dur * 0.28, decay: dur * 0.4, peak: 0.09 * gain, hold: dur * 0.35, sustain: 0.05 * gain });
    lp.connect(g);
    g.connect(this.musicGain);
    const oscs = [];
    for (const f of freqs) {
      for (const detune of [-6, 6]) {
        const o = ctx.createOscillator();
        o.type = 'sawtooth';
        o.frequency.value = f;
        o.detune.value = detune;
        o.connect(lp);
        o.start(time);
        o.stop(time + dur + 0.3);
        oscs.push(o);
      }
    }
  }

  /* ------------------------------------------------------------ *
   * 判定音效
   * ------------------------------------------------------------ */

  sfx(kind) {
    if (!this.active) return;
    const ctx = this.ctx;
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 6000;

    const spec = {
      perfect: { f0: 1180, f1: 1760, dur: 0.16, peak: 0.2, type: 'triangle' },
      great: { f0: 940, f1: 1180, dur: 0.12, peak: 0.16, type: 'triangle' },
      good: { f0: 700, f1: 760, dur: 0.1, peak: 0.12, type: 'triangle' },
      miss: { f0: 220, f1: 120, dur: 0.22, peak: 0.16, type: 'sawtooth' },
      react: { f0: 1500, f1: 2100, dur: 0.1, peak: 0.16, type: 'sine' },
      reactLate: { f0: 420, f1: 300, dur: 0.16, peak: 0.14, type: 'square' },
    }[kind] || { f0: 800, f1: 900, dur: 0.1, peak: 0.12, type: 'triangle' };

    osc.type = spec.type;
    osc.frequency.setValueAtTime(spec.f0, t);
    osc.frequency.exponentialRampToValueAtTime(Math.max(40, spec.f1), t + spec.dur);
    this._env(g, t, { attack: 0.003, decay: spec.dur, peak: spec.peak });
    osc.connect(lp);
    lp.connect(g);
    g.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + spec.dur + 0.1);
  }
}

export const audio = new AudioEngine();
