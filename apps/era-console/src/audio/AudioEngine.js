/**
 * 10-era-console — 色块远征 / CHROMA VOYAGE
 * 程序化芯片音乐与音效引擎（WebAudio，零音频文件）
 *
 * 所有旋律与和声均为本任务原创编写；音色由方波 / 三角波 / 噪声实时合成，
 * 不加载任何第三方或商业游戏音频资源。
 *
 * 调度方式：前瞻式调度器（lookahead scheduler），
 * 用 setInterval 定期把未来 120ms 内的音符排进 WebAudio 时间轴，
 * 保证节拍稳定不受主线程帧率影响。
 */

const NOTE_OFFSETS = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };

/** 'C4' / 'D#5' / 'Eb3' → MIDI 音高 */
export function noteToMidi(note) {
  const m = /^([A-G])([#b]?)(-?\d)$/.exec(note);
  if (!m) return null;
  const base = NOTE_OFFSETS[m[1]];
  const acc = m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0;
  const octave = parseInt(m[3], 10);
  return (octave + 1) * 12 + base + acc;
}

export function midiToFreq(midi) {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

/** 把 [音符, 时值(步)] 列表展开为步数组，'-' 表示延音 */
function M(...pairs) {
  const out = [];
  for (const [note, dur] of pairs) {
    out.push(note);
    for (let i = 1; i < dur; i++) out.push('-');
  }
  return out;
}

/* ------------------------------------------------------------------ *
 * 原创曲谱
 * ------------------------------------------------------------------ */

const TRACKS = {
  /** 展厅大厅：明亮、闲适 */
  hall: {
    bpm: 104,
    channels: [
      { wave: 'pulse', duty: 0.5, gain: 0.15, notes: M(['C5', 2], ['E5', 2], ['G5', 2], ['E5', 2], ['A5', 2], ['G5', 2], ['E5', 2], ['D5', 2], ['F5', 2], ['A5', 2], ['C6', 2], ['A5', 2], ['G5', 2], ['E5', 2], ['D5', 2], ['E5', 2]) },
      { wave: 'pulse', duty: 0.25, gain: 0.08, notes: M(['E4', 2], ['G4', 2], ['B4', 2], ['G4', 2], ['F4', 2], ['A4', 2], ['C5', 2], ['A4', 2], ['D4', 2], ['F4', 2], ['A4', 2], ['F4', 2], ['B4', 2], ['G4', 2], ['E4', 2], ['G4', 2]) },
      { wave: 'triangle', gain: 0.2, notes: M(['C3', 4], ['C3', 4], ['A2', 4], ['A2', 4], ['F2', 4], ['F2', 4], ['G2', 4], ['G2', 4]) },
      { wave: 'noise', gain: 0.06, drums: 'k.h.s.h.k.h.s.h.k.h.s.h.k.h.s.h.k.h.s.h.k.h.s.h.k.h.s.h.k.h.s.h.' },
    ],
  },

  /** 第一关「黎明色阶」：轻快大调 */
  dawn: {
    bpm: 126,
    channels: [
      { wave: 'pulse', duty: 0.5, gain: 0.15, notes: M(['D5', 1], ['E5', 1], ['F#5', 1], ['A5', 1], ['G5', 2], ['F#5', 2], ['E5', 1], ['F#5', 1], ['G5', 1], ['A5', 1], ['B5', 2], ['A5', 2], ['G5', 1], ['F#5', 1], ['E5', 1], ['D5', 1], ['C5', 2], ['D5', 2]) },
      { wave: 'pulse', duty: 0.25, gain: 0.08, notes: M(['B4', 2], ['D5', 2], ['A4', 2], ['B4', 2], ['G4', 2], ['B4', 2], ['C5', 2], ['B4', 2], ['D5', 2], ['C5', 2], ['A4', 4]) },
      { wave: 'triangle', gain: 0.2, notes: M(['G2', 4], ['D3', 4], ['G2', 4], ['E3', 4], ['C3', 4], ['G3', 4], ['G2', 4], ['D3', 4]) },
      { wave: 'noise', gain: 0.07, drums: 'k.h.s.h.k.h.s.h.k.hks.h.k.h.s.h.k.h.s.h.k.hks.h.k.h.s.h.k.h.s.h.k.h.s.h.' },
    ],
  },

  /** 第二关「晶脉天梯」：神秘、悬停 */
  ladder: {
    bpm: 112,
    channels: [
      { wave: 'pulse', duty: 0.5, gain: 0.14, notes: M(['A4', 2], ['C5', 2], ['E5', 2], ['D5', 2], ['C5', 2], ['A4', 2], ['G4', 2], ['E4', 2], ['F4', 2], ['A4', 2], ['C5', 2], ['B4', 2], ['A4', 4], ['G4', 4]) },
      { wave: 'pulse', duty: 0.25, gain: 0.08, notes: M(['E4', 4], ['A3', 4], ['F4', 4], ['G3', 4], ['D4', 4], ['G3', 4], ['E4', 8]) },
      { wave: 'triangle', gain: 0.2, notes: M(['A2', 4], ['A2', 4], ['F2', 4], ['F2', 4], ['D2', 4], ['D2', 4], ['E2', 4], ['E2', 4], ['A2', 4], ['A2', 4], ['C3', 4], ['C3', 4], ['G2', 4], ['G2', 4]) },
      { wave: 'noise', gain: 0.05, drums: '..h...h...h...h...h...h...h...h...h...h...h...h.' },
    ],
  },

  /** 第三关「暮光熔炉」：紧凑、推进感 */
  forge: {
    bpm: 142,
    channels: [
      { wave: 'pulse', duty: 0.5, gain: 0.15, notes: M(['E5', 1], ['E5', 1], ['F5', 1], ['G5', 1], ['A5', 2], ['G5', 1], ['F5', 1], ['E5', 1], ['D5', 1], ['C5', 1], ['B4', 1], ['A4', 2], ['B4', 2], ['C5', 1], ['D5', 1], ['E5', 1], ['F5', 1], ['G5', 2], ['E5', 2], ['F5', 1], ['E5', 1], ['D5', 1], ['C5', 1], ['B4', 4]) },
      { wave: 'pulse', duty: 0.25, gain: 0.07, notes: M(['E4', 2], ['E4', 2], ['E4', 2], ['E4', 2], ['F4', 2], ['F4', 2], ['F4', 2], ['F4', 2], ['E4', 2], ['E4', 2], ['G4', 2], ['G4', 2], ['A4', 2], ['A4', 2], ['B4', 2], ['B4', 2], ['C5', 4], ['D5', 4]) },
      { wave: 'triangle', gain: 0.21, notes: M(['E2', 2], ['E2', 2], ['E2', 2], ['E2', 2], ['F2', 2], ['F2', 2], ['F2', 2], ['F2', 2], ['E2', 2], ['E2', 2], ['G2', 2], ['G2', 2], ['A2', 2], ['A2', 2], ['B2', 2], ['B2', 2], ['C3', 4], ['D3', 4]) },
      { wave: 'noise', gain: 0.08, drums: 'k.h.s.h.k.h.s.hk.h.s.h.k.h.s.hk.h.s.h.k.h.s.hk.h.s.h.k.h.s.h.' },
    ],
  },

  /** 等距测绘所：缓慢漂浮的环境曲 */
  iso: {
    bpm: 84,
    channels: [
      { wave: 'pulse', duty: 0.25, gain: 0.1, notes: M(['E5', 4], ['G5', 4], ['B5', 4], ['A5', 4], ['G5', 4], ['E5', 4], ['D5', 4], ['E5', 4]) },
      { wave: 'triangle', gain: 0.16, notes: M(['A2', 8], ['F2', 8], ['C3', 8], ['G2', 8]) },
      { wave: 'noise', gain: 0.035, drums: '....h.......h.......h.......h.......h.......h.......h.......h...' },
    ],
  },
};

/** 短过场曲（不循环） */
const JINGLES = {
  clear: {
    bpm: 150,
    once: true,
    channels: [
      { wave: 'pulse', duty: 0.5, gain: 0.16, notes: M(['C5', 1], ['E5', 1], ['G5', 1], ['C6', 2], ['G5', 1], ['C6', 4]) },
      { wave: 'triangle', gain: 0.2, notes: M(['C3', 4], ['G3', 4], ['C3', 4], ['C3', 4]) },
    ],
  },
  gameover: {
    bpm: 110,
    once: true,
    channels: [
      { wave: 'pulse', duty: 0.5, gain: 0.15, notes: M(['G4', 2], ['F4', 2], ['E4', 2], ['D4', 2], ['C4', 4], ['R', 4]) },
      { wave: 'triangle', gain: 0.18, notes: M(['C3', 4], ['C3', 4], ['G2', 4], ['C2', 8]) },
    ],
  },
};

/* ------------------------------------------------------------------ *
 * 引擎
 * ------------------------------------------------------------------ */

export class AudioEngine {
  constructor() {
    this.ctx = null;
    this.master = null;
    this.musicGain = null;
    this.sfxGain = null;
    this.muted = false;
    this.current = null;
    this._timer = null;
    this._step = 0;
    this._nextTime = 0;
    this._started = false;
    this._pulseWaves = {};
    this._noiseBuffer = null;
    this._unlockBound = false;
    this._onUnlock = this._onUnlock.bind(this);
  }

  /** 首次用户手势时解锁音频（浏览器自动播放策略） */
  bindUnlock() {
    if (this._unlockBound) return;
    this._unlockBound = true;
    const opts = { once: true, passive: true };
    window.addEventListener('pointerdown', this._onUnlock, opts);
    window.addEventListener('keydown', this._onUnlock, opts);
    window.addEventListener('touchstart', this._onUnlock, opts);
  }

  _onUnlock() {
    this.ensure();
    if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume().catch(() => {});
  }

  ensure() {
    if (this.ctx) return this.ctx;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    try {
      this.ctx = new AC();
    } catch {
      return null;
    }
    this.master = this.ctx.createGain();
    this.master.gain.value = this.muted ? 0 : 0.85;
    this.master.connect(this.ctx.destination);

    this.musicGain = this.ctx.createGain();
    this.musicGain.gain.value = 0.55;
    this.musicGain.connect(this.master);

    this.sfxGain = this.ctx.createGain();
    this.sfxGain.gain.value = 0.85;
    this.sfxGain.connect(this.master);

    // 噪声源缓冲（鼓组）
    const len = Math.floor(this.ctx.sampleRate * 0.5);
    const buf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
    const data = buf.getChannelData(0);
    let seed = 12345;
    for (let i = 0; i < len; i++) {
      seed = (seed * 1103515245 + 12345) & 0x7fffffff;
      data[i] = (seed / 0x3fffffff) - 1;
    }
    this._noiseBuffer = buf;
    return this.ctx;
  }

  _pulseWave(duty) {
    const key = duty.toFixed(3);
    if (this._pulseWaves[key]) return this._pulseWaves[key];
    const n = 32;
    const real = new Float32Array(n);
    const imag = new Float32Array(n);
    for (let i = 1; i < n; i++) {
      imag[i] = (2 / (i * Math.PI)) * Math.sin(i * Math.PI * duty);
    }
    const wave = this.ctx.createPeriodicWave(real, imag, { disableNormalization: false });
    this._pulseWaves[key] = wave;
    return wave;
  }

  /* ---------------------- 音乐调度 ---------------------- */

  playMusic(name) {
    if (!this.ensure()) return;
    if (this.current === name && this._timer) return;
    this.stopMusic();
    const track = TRACKS[name];
    if (!track) return;
    this.current = name;
    this._step = 0;
    this._nextTime = this.ctx.currentTime + 0.08;
    this._tick();
    this._timer = setInterval(() => this._tick(), 25);
  }

  playJingle(name) {
    if (!this.ensure()) return;
    const track = JINGLES[name];
    if (!track) return;
    this.stopMusic();
    this.current = name;
    this._step = 0;
    this._nextTime = this.ctx.currentTime + 0.05;
    this._tick();
    this._timer = setInterval(() => this._tick(), 25);
  }

  stopMusic() {
    if (this._timer) {
      clearInterval(this._timer);
      this._timer = null;
    }
    this.current = null;
  }

  _tick() {
    if (!this.ctx) return;
    const track = this.current && JINGLES[this.current]
      ? JINGLES[this.current]
      : TRACKS[this.current];
    if (!track) {
      this.stopMusic();
      return;
    }
    const stepDur = 60 / track.bpm / 2; // 每步 = 1/8 拍
    const horizon = this.ctx.currentTime + 0.14;

    while (this._nextTime < horizon) {
      const s = this._step;
      track.channels.forEach((ch) => {
        if (ch.drums) {
          const d = ch.drums[s % ch.drums.length];
          if (d && d !== '.') this._drum(d, this._nextTime, ch.gain ?? 0.06);
        } else if (ch.notes) {
          const n = ch.notes[s % ch.notes.length];
          if (n && n !== '-' && n !== 'R') {
            this._note(ch, n, this._nextTime, stepDur);
          }
        }
      });
      this._nextTime += stepDur;
      this._step++;

      if (track.once && this._step > 24) {
        this.stopMusic();
        return;
      }
    }
  }

  _note(ch, noteName, when, stepDur) {
    const midi = noteToMidi(noteName);
    if (midi == null) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 5200;

    if (ch.wave === 'pulse') {
      osc.setPeriodicWave(this._pulseWave(ch.duty ?? 0.5));
    } else if (ch.wave === 'triangle') {
      osc.type = 'triangle';
    } else {
      osc.type = 'square';
    }
    osc.frequency.setValueAtTime(midiToFreq(midi), when);

    const g = ch.gain ?? 0.15;
    gain.gain.setValueAtTime(0, when);
    gain.gain.linearRampToValueAtTime(g, when + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.0008, when + stepDur * 0.92);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.musicGain);
    osc.start(when);
    osc.stop(when + stepDur);
  }

  _drum(kind, when, gain) {
    if (kind === 'k') {
      const osc = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      osc.frequency.setValueAtTime(150, when);
      osc.frequency.exponentialRampToValueAtTime(45, when + 0.11);
      g.gain.setValueAtTime(gain * 1.5, when);
      g.gain.exponentialRampToValueAtTime(0.0008, when + 0.16);
      osc.connect(g);
      g.connect(this.musicGain);
      osc.start(when);
      osc.stop(when + 0.18);
    } else {
      const src = this.ctx.createBufferSource();
      src.buffer = this._noiseBuffer;
      const filter = this.ctx.createBiquadFilter();
      const g = this.ctx.createGain();
      if (kind === 's') {
        filter.type = 'bandpass';
        filter.frequency.value = 1800;
        filter.Q.value = 0.9;
        g.gain.setValueAtTime(gain * 1.2, when);
        g.gain.exponentialRampToValueAtTime(0.0008, when + 0.13);
        src.start(when);
        src.stop(when + 0.15);
      } else {
        filter.type = 'highpass';
        filter.frequency.value = 7200;
        g.gain.setValueAtTime(gain * 0.8, when);
        g.gain.exponentialRampToValueAtTime(0.0008, when + 0.05);
        src.start(when);
        src.stop(when + 0.07);
      }
      src.connect(filter);
      filter.connect(g);
      g.connect(this.musicGain);
    }
  }

  /* ---------------------- 音效 ---------------------- */

  sfx(name) {
    if (!this.ensure()) return;
    const t = this.ctx.currentTime;
    switch (name) {
      case 'jump':
        this._blip(t, 380, 700, 0.11, 0.18, 'square');
        break;
      case 'shard':
        this._blip(t, 880, 1320, 0.09, 0.16, 'square');
        this._blip(t + 0.07, 1320, 1760, 0.11, 0.13, 'square');
        break;
      case 'checkpoint':
        [660, 880, 1174].forEach((f, i) => this._blip(t + i * 0.07, f, f, 0.1, 0.13, 'triangle'));
        break;
      case 'gate':
        [392, 523, 659, 784].forEach((f, i) => this._blip(t + i * 0.06, f, f * 1.5, 0.22, 0.1, 'square'));
        break;
      case 'stomp':
        this._blip(t, 220, 90, 0.1, 0.2, 'sawtooth');
        this._noise(t, 0.08, 0.12);
        break;
      case 'hurt':
        this._blip(t, 420, 120, 0.28, 0.2, 'sawtooth');
        break;
      case 'ui':
        this._blip(t, 720, 720, 0.05, 0.1, 'square');
        break;
      case 'click':
        this._blip(t, 520, 640, 0.06, 0.09, 'square');
        break;
      case 'open':
        this._blip(t, 300, 900, 0.2, 0.12, 'triangle');
        break;
      default:
        break;
    }
  }

  _blip(when, f0, f1, dur, gain, type = 'square') {
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(f0, when);
    osc.frequency.exponentialRampToValueAtTime(Math.max(30, f1), when + dur);
    g.gain.setValueAtTime(0, when);
    g.gain.linearRampToValueAtTime(gain, when + 0.006);
    g.gain.exponentialRampToValueAtTime(0.0008, when + dur);
    osc.connect(g);
    g.connect(this.sfxGain);
    osc.start(when);
    osc.stop(when + dur + 0.02);
  }

  _noise(when, dur, gain) {
    if (!this._noiseBuffer) return;
    const src = this.ctx.createBufferSource();
    src.buffer = this._noiseBuffer;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 1200;
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(gain, when);
    g.gain.exponentialRampToValueAtTime(0.0008, when + dur);
    src.connect(filter);
    filter.connect(g);
    g.connect(this.sfxGain);
    src.start(when);
    src.stop(when + dur + 0.02);
  }

  /* ---------------------- 静音控制 ---------------------- */

  setMuted(muted) {
    this.muted = muted;
    if (this.master) {
      this.master.gain.setTargetAtTime(muted ? 0 : 0.85, this.ctx.currentTime, 0.02);
    }
  }

  toggleMute() {
    this.setMuted(!this.muted);
    return this.muted;
  }

  get isMuted() {
    return this.muted;
  }
}

export { TRACKS, JINGLES };
