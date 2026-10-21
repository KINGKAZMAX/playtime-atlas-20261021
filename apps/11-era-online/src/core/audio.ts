/**
 * audio.ts — 纯 WebAudio 程序化音效（无任何音频文件）。
 *
 * 规则：
 * - AudioContext 必须由用户手势启动（浏览器自动播放策略），因此只在
 *   `unlock()` 被调用时创建/恢复，并在首次任意交互时自动尝试解锁。
 * - 提供静音开关；静音时合成器直接跳过，不占用 CPU。
 * - 所有音色为本展厅自行设计的波形与包络，不采样任何商业音频素材。
 */

export type Sfx =
  | 'tick'
  | 'select'
  | 'shoot'
  | 'hit'
  | 'boom'
  | 'place'
  | 'levelup'
  | 'coin'
  | 'alarm'
  | 'step'
  | 'pickup'
  | 'hurt'
  | 'win'
  | 'lose';

type Voice = {
  type: OscillatorType;
  f0: number;
  f1: number;
  dur: number;
  gain: number;
  delay?: number;
  noise?: boolean;
};

const VOICES: Record<Sfx, Voice[]> = {
  tick: [{ type: 'square', f0: 1180, f1: 1180, dur: 0.035, gain: 0.05 }],
  select: [
    { type: 'square', f0: 620, f1: 940, dur: 0.07, gain: 0.08 },
  ],
  shoot: [
    { type: 'square', f0: 860, f1: 420, dur: 0.06, gain: 0.07 },
    { type: 'triangle', f0: 1720, f1: 900, dur: 0.04, gain: 0.03 },
  ],
  hit: [{ type: 'sawtooth', f0: 320, f1: 140, dur: 0.09, gain: 0.08, noise: true }],
  boom: [
    { type: 'sawtooth', f0: 180, f1: 42, dur: 0.34, gain: 0.16, noise: true },
    { type: 'sine', f0: 90, f1: 30, dur: 0.42, gain: 0.12 },
  ],
  place: [
    { type: 'triangle', f0: 300, f1: 180, dur: 0.12, gain: 0.1 },
    { type: 'square', f0: 150, f1: 110, dur: 0.1, gain: 0.05, delay: 0.02 },
  ],
  levelup: [
    { type: 'square', f0: 520, f1: 520, dur: 0.07, gain: 0.08 },
    { type: 'square', f0: 660, f1: 660, dur: 0.07, gain: 0.08, delay: 0.07 },
    { type: 'square', f0: 880, f1: 880, dur: 0.12, gain: 0.09, delay: 0.14 },
  ],
  coin: [
    { type: 'square', f0: 988, f1: 988, dur: 0.05, gain: 0.07 },
    { type: 'square', f0: 1319, f1: 1319, dur: 0.11, gain: 0.07, delay: 0.05 },
  ],
  alarm: [
    { type: 'square', f0: 740, f1: 740, dur: 0.12, gain: 0.09 },
    { type: 'square', f0: 560, f1: 560, dur: 0.16, gain: 0.09, delay: 0.14 },
  ],
  step: [{ type: 'square', f0: 240, f1: 190, dur: 0.035, gain: 0.035, noise: true }],
  pickup: [
    { type: 'triangle', f0: 700, f1: 700, dur: 0.06, gain: 0.08 },
    { type: 'triangle', f0: 1050, f1: 1050, dur: 0.08, gain: 0.08, delay: 0.06 },
    { type: 'triangle', f0: 1400, f1: 1400, dur: 0.14, gain: 0.09, delay: 0.12 },
  ],
  hurt: [
    { type: 'sawtooth', f0: 400, f1: 90, dur: 0.22, gain: 0.12 },
    { type: 'square', f0: 200, f1: 70, dur: 0.18, gain: 0.06, delay: 0.02 },
  ],
  win: [
    { type: 'square', f0: 523, f1: 523, dur: 0.11, gain: 0.08 },
    { type: 'square', f0: 659, f1: 659, dur: 0.11, gain: 0.08, delay: 0.11 },
    { type: 'square', f0: 784, f1: 784, dur: 0.11, gain: 0.08, delay: 0.22 },
    { type: 'square', f0: 1047, f1: 1047, dur: 0.3, gain: 0.1, delay: 0.33 },
  ],
  lose: [
    { type: 'sawtooth', f0: 320, f1: 300, dur: 0.2, gain: 0.09 },
    { type: 'sawtooth', f0: 240, f1: 220, dur: 0.24, gain: 0.09, delay: 0.2 },
    { type: 'sawtooth', f0: 160, f1: 90, dur: 0.5, gain: 0.11, delay: 0.44 },
  ],
};

class AudioEngine {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private noiseBuf: AudioBuffer | null = null;
  private _muted = false;
  private unlockBound = false;

  get muted(): boolean {
    return this._muted;
  }

  get ready(): boolean {
    return this.ctx !== null;
  }

  setMuted(v: boolean): void {
    this._muted = v;
    if (this.master && this.ctx) {
      this.master.gain.setTargetAtTime(v ? 0 : 0.9, this.ctx.currentTime, 0.02);
    }
  }

  /** 在用户手势中调用：创建并恢复 AudioContext。 */
  unlock(): void {
    if (!this.ctx) {
      const Ctor: typeof AudioContext | undefined =
        window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!Ctor) return;
      try {
        this.ctx = new Ctor();
        this.master = this.ctx.createGain();
        this.master.gain.value = this._muted ? 0 : 0.9;
        this.master.connect(this.ctx.destination);
        this.noiseBuf = this.makeNoise(this.ctx);
      } catch {
        this.ctx = null;
        return;
      }
    }
    if (this.ctx.state === 'suspended') void this.ctx.resume();
    this.bindAutoUnlock();
  }

  /** 首次任意交互时自动解锁（浏览器自动播放策略要求手势）。 */
  bindAutoUnlock(): void {
    if (this.unlockBound) return;
    this.unlockBound = true;
    const once = (): void => {
      this.unlock();
      window.removeEventListener('pointerdown', once);
      window.removeEventListener('keydown', once);
    };
    window.addEventListener('pointerdown', once, { passive: true });
    window.addEventListener('keydown', once, { passive: true });
  }

  private makeNoise(ctx: AudioContext): AudioBuffer {
    const len = Math.floor(ctx.sampleRate * 0.6);
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const data = buf.getChannelData(0);
    let last = 0;
    for (let i = 0; i < len; i++) {
      // 轻度低通的粉噪，听感比纯白噪柔和
      const white = Math.random() * 2 - 1;
      last = (last + 0.02 * white) / 1.02;
      data[i] = last * 3.2;
    }
    return buf;
  }

  play(name: Sfx, detune = 0): void {
    if (this._muted) return;
    const ctx = this.ctx;
    const master = this.master;
    if (!ctx || !master || ctx.state !== 'running') return;
    const voices = VOICES[name];
    if (!voices) return;

    const t0 = ctx.currentTime;
    for (const v of voices) {
      const start = t0 + (v.delay ?? 0);
      const end = start + v.dur;

      if (v.noise && this.noiseBuf) {
        const src = ctx.createBufferSource();
        src.buffer = this.noiseBuf;
        const filt = ctx.createBiquadFilter();
        filt.type = 'lowpass';
        filt.frequency.setValueAtTime(Math.max(320, v.f1 * 2.4), start);
        filt.frequency.exponentialRampToValueAtTime(Math.max(90, v.f0 * 0.8), end);
        const g = ctx.createGain();
        g.gain.setValueAtTime(0.0001, start);
        g.gain.exponentialRampToValueAtTime(v.gain, start + Math.min(0.012, v.dur * 0.3));
        g.gain.exponentialRampToValueAtTime(0.0001, end);
        src.connect(filt).connect(g).connect(master);
        src.start(start);
        src.stop(end + 0.02);
      }

      const osc = ctx.createOscillator();
      osc.type = v.type;
      osc.frequency.setValueAtTime(Math.max(20, v.f0 * Math.pow(2, detune / 1200)), start);
      osc.frequency.exponentialRampToValueAtTime(Math.max(20, v.f1 * Math.pow(2, detune / 1200)), end);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, start);
      g.gain.exponentialRampToValueAtTime(v.gain, start + Math.min(0.012, v.dur * 0.3));
      g.gain.exponentialRampToValueAtTime(0.0001, end);
      osc.connect(g).connect(master);
      osc.start(start);
      osc.stop(end + 0.02);
    }
  }
}

export const audio = new AudioEngine();
