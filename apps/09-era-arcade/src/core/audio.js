/**
 * 霓虹街廊 · 街机可玩展厅
 * src/core/audio.js — WebAudio 程序化合成音效与原创芯片音乐
 *
 * 站点不含任何音频文件：全部音色由振荡器与噪声缓冲实时合成。
 * 三段乐曲（展厅 / 晶格 / 陨星）均为本项目原创谱面。
 *
 * 音效命名（原创）：
 *   pick     拾取晶核      dash     相位穿行
 *   echo     释放残响      lock     被巡守锁定
 *   burst    陨石碎裂      lance    穿甲弹发射
 *   quake    共振激爆      seal     护盾展开
 *   confirm  界面确认      deny     操作无效
 *   over     结算下行音
 */

const A4 = 440;
const NOTE_OFFSETS = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };

/** 音名转频率，例如 nameToFreq('A4') */
export function nameToFreq(name) {
  const m = /^([A-G])([#b]?)(\d)$/.exec(name);
  if (!m) return 440;
  let semi = NOTE_OFFSETS[m[1]];
  if (m[2] === '#') semi += 1;
  if (m[2] === 'b') semi -= 1;
  const octave = Number(m[3]);
  return A4 * Math.pow(2, (semi - 9 + (octave - 4) * 12) / 12);
}

/** MIDI 音高转频率 */
export function midiToFreq(m) {
  return A4 * Math.pow(2, (m - 69) / 12);
}

/* ------------------------------------------------------------------ *
 * 原创曲谱
 *
 * 数据结构：lead / bass / drums 均为「小节数组」，
 * 每个小节是 16 个十六分音符（null 表示休止）。
 * 调度器通过 stepValue() 取值，对缺失小节、空轨道一律回落到休止，
 * 不会因数据不完整而抛异常。
 * ------------------------------------------------------------------ */

export const STEPS_PER_BAR = 16;

/**
 * 取某条轨道在某一步的取值。
 * @param {Array<Array<any>|null>|null|undefined} part 轨道（小节数组）
 * @param {number} step 十六分音符序号
 * @returns {any} 该步的音符/鼓点；缺失或空缺时返回 null（休止）
 */
export function stepValue(part, step) {
  if (!Array.isArray(part) || part.length === 0) return null;
  const barIndex = Math.floor(step / STEPS_PER_BAR);
  const bar = part[((barIndex % part.length) + part.length) % part.length];
  if (!Array.isArray(bar)) return null;
  const v = bar[((step % STEPS_PER_BAR) + STEPS_PER_BAR) % STEPS_PER_BAR];
  return v === undefined ? null : v;
}

export const THEMES = {
  hall: {
    bpm: 84,
    wave: 'triangle',
    lead: [
      [74, null, 69, null, 65, null, 69, null, 74, null, 69, null, 67, null, 69, null],
      [72, null, 69, null, 65, null, 69, null, 74, null, 72, null, 69, null, 72, null],
      [70, null, 65, null, 62, null, 65, null, 69, null, 65, null, 62, null, 65, null],
      [67, null, 72, null, 74, null, 72, null, 74, null, 72, null, 69, null, 72, null],
      [74, null, 69, null, 65, null, 69, null, 77, null, 79, null, 77, null, 74, null],
      [72, null, 69, null, 65, null, 69, null, 74, null, 72, null, 69, null, 65, null],
      [69, null, 65, null, 62, null, 65, null, 69, null, 72, null, 74, null, 77, null],
      [77, null, 74, null, 72, null, 69, null, 74, null, null, null, null, null, null, null],
    ],
    bass: [
      [38, null, null, null, 38, null, null, null, 41, null, null, null, 41, null, null, null],
      [36, null, null, null, 36, null, null, null, 37, null, null, null, 37, null, null, null],
      [38, null, null, null, 38, null, null, null, 41, null, null, null, 41, null, null, null],
      [36, null, null, null,  36, null, null, null,  38, null, null, null,  38, null, null, null],
    ],
    drums: [
      ['k', null, 'h', null, 's', null, 'h', null, 'k', null, 'h', null, 's', null, 'h', 'h'],
      ['k', null, 'h', null, 's', null, 'h', null, 'k', null, 'h', null, 's', 's', 'h', null],
      ['k', null, 'h', null, 's', null, 'h', null, 'k', null, 'h', null, 's', null, 'h', 'h'],
      ['k', null, 'h', null, 's', null, 'h', null, 'k', 'k', 'h', 'h', 's', 's', 'h', 'h'],
      ['k', null, 'h', null, 's', null, 'h', null, 'k', null, 'h', null, 's', null, 'h', 'h'],
      ['k', null, 'h', null, 's', null, 'h', null, 'k', null, 'h', null, 's', 's', 'h', null],
      ['k', null, 'h', null, 's', null, 'h', null, 'k', null, 'h', null, 's', null, 'h', 'h'],
      ['k', null, 'h', null, 's', null, 'h', null, 'k', 'k', 'h', 'h', 's', 's', 'h', 'h'],
    ],
  },
  lattice: {
    bpm: 132,
    wave: 'square',
    lead: [
      [69, null, 72, null, 74, null, 72, null, 69, null, 67, null, 69, null, 72, null],
      [74, null, 77, null, 76, null, 74, null, 72, null, 74, null, 76, null, 77, null],
      [69, null, 72, null, 74, null, 72, null, 69, null, 67, null, 69, null, 72, null],
      [81, null, 79, null, 77, null, 76, null, 74, null, 72, null, 74, null, 76, null],
      [72, null, 74, null, 76, null, 74, null, 72, null, 69, null, 72, null, 74, null],
      [77, null, 76, null, 74, null, 72, null, 74, null, 72, null, 71, null, 69, null],
      [69, null, 72, null, 74, null, 76, null, 77, null, 79, null, 77, null, 76, null],
      [74, null, 72, null, 69, null, 72, null, 69, null, null, null, null, null, null, null],
    ],
    bass: [
      [45, null, 45, null, 45, null, 45, null, 45, null, 45, null, 45, null, 45, null],
      [41, null, 41, null, 41, null, 41, null, 41, null, 41, null, 41, null, 41, null],
      [43, null, 43, null, 43, null, 43, null, 43, null, 43, null, 43, null, 43, null],
      [40, null, 40, null, 40, null, 40, null, 45, null, 45, null, 45, null, 45, null],
    ],
    drums: [
      ['k', null, 'h', 'h', 's', null, 'h', null, 'k', null, 'h', 'h', 's', null, 'h', null],
      ['k', null, 'h', 'h', 's', null, 'h', null, 'k', null, 'h', 'h', 's', 's', 'h', null],
      ['k', null, 'h', 'h', 's', null, 'h', null, 'k', null, 'h', 'h', 's', null, 'h', null],
      ['k', null, 'h', 'h', 's', null, 'h', null, 'k', 'k', 'h', 'h', 's', 's', 'h', 'h'],
      ['k', null, 'h', 'h', 's', null, 'h', null, 'k', null, 'h', 'h', 's', null, 'h', null],
      ['k', null, 'h', 'h', 's', null, 'h', null, 'k', null, 'h', 'h', 's', 's', 'h', null],
      ['k', null, 'h', 'h', 's', null, 'h', null, 'k', null, 'h', 'h', 's', null, 'h', null],
      ['k', null, 'h', 'h', 's', null, 'h', null, 'k', 'k', 'h', 'h', 's', 's', 'h', 'h'],
    ],
  },
  meteor: {
    bpm: 146,
    wave: 'sawtooth',
    lead: [
      [72, 76, 79, 84, 79, 76, 72, null, 74, 77, 81, 86, 81, 77, 74, null],
      [72, 76, 79, 84, 88, 84, 79, 76, 72, 76, 79, 81, 84, null, null, null],
      [70, 74, 77, 82, 77, 74, 70, null, 72, 76, 79, 84, 79, 76, 72, null],
      [68, 72, 75, 80, 83, 80, 75, 72, 76, 79, 83, 86, 84, 81, 79, 76],
      [72, 76, 79, 84, 79, 76, 72, null, 74, 77, 81, 86, 88, 86, 84, null],
      [83, 86, 84, 81, 79, 76, 79, 83, 81, 77, 74, 76, 79, null, null, null],
      [70, 74, 77, 82, 77, 74, 70, null, 72, 76, 79, 84, 79, 76, 72, null],
      [68, 72, 75, 80, 75, 72, 68, null, 72, 76, 79, 84, 86, 84, 79, 76],
    ],
    bass: [
      [36, null, 36, null, 36, null, 36, null, 36, null, 36, null, 36, null, 36, null],
      [33, null, 33, null, 33, null, 33, null, 33, null, 33, null, 33, null, 33, null],
      [35, null, 35, null, 35, null, 35, null, 35, null, 35, null, 35, null, 35, null],
      [32, null, 32, null, 32, null, 32, null, 36, null, 36, null, 36, null, 36, null],
    ],
    drums: [
      ['k', null, 'h', null, 's', null, 'h', null, 'k', null, 'h', null, 's', null, 'h', 'h'],
      ['k', null, 'h', null, 's', null, 'h', null, 'k', null, 'h', null, 's', 's', 'h', null],
      ['k', null, 'h', null, 's', null, 'h', null, 'k', null, 'h', null, 's', null, 'h', 'h'],
      ['k', null, 'h', null, 's', null, 'h', null, 'k', 'k', 'h', 'h', 's', 's', 'h', 'h'],
      ['k', null, 'h', null, 's', null, 'h', null, 'k', null, 'h', null, 's', null, 'h', 'h'],
      ['k', null, 'h', null, 's', null, 'h', null, 'k', null, 'h', null, 's', 's', 'h', null],
      ['k', null, 'h', null, 's', null, 'h', null, 'k', null, 'h', null, 's', null, 'h', 'h'],
      ['k', null, 'h', null, 's', null, 'h', null, 'k', 'k', 'h', 'h', 's', 's', 'h', 'h'],
    ],
  },
};

export function createAudio() {
  let ctx = null;
  let master = null;
  let musicGain = null;
  let sfxGain = null;
  let noiseBuffer = null;
  let muted = false;
  let current = null;   // { theme, timer, step, nextTime }
  let started = false;

  function ensure() {
    if (ctx) return ctx;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = muted ? 0 : 0.5;
    master.connect(ctx.destination);

    musicGain = ctx.createGain();
    musicGain.gain.value = 0.32;
    musicGain.connect(master);

    sfxGain = ctx.createGain();
    sfxGain.gain.value = 0.85;
    sfxGain.connect(master);

    const len = Math.floor(ctx.sampleRate * 0.6);
    noiseBuffer = ctx.createBuffer(1, len, ctx.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < len; i += 1) {
      data[i] = Math.random() * 2 - 1;
    }
    return ctx;
  }

  function resume() {
    ensure();
    if (ctx && ctx.state === 'suspended') ctx.resume();
  }

  /* --------------------------- 基础发声单元 --------------------------- */

  function blip(freq, dur = 0.08, opts = {}) {
    if (!ctx || muted) return;
    const { type = 'square', gain = 0.3, slideTo = null, delay = 0, detune = 0 } = opts;
    const t0 = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = type;
    osc.detune.value = detune;
    osc.frequency.setValueAtTime(freq, t0);
    if (slideTo) osc.frequency.exponentialRampToValueAtTime(Math.max(20, slideTo), t0 + dur);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(gain, t0 + Math.min(0.012, dur * 0.3));
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(g);
    g.connect(sfxGain);
    osc.start(t0);
    osc.stop(t0 + dur + 0.02);
  }

  function noiseHit(dur = 0.2, opts = {}) {
    if (!ctx || muted || !noiseBuffer) return;
    const { gain = 0.35, freq = 1200, q = 1.2, delay = 0, type = 'lowpass' } = opts;
    const t0 = ctx.currentTime + delay;
    const src = ctx.createBufferSource();
    src.buffer = noiseBuffer;
    const filter = ctx.createBiquadFilter();
    filter.type = type;
    filter.frequency.setValueAtTime(freq, t0);
    filter.Q.value = q;
    const g = ctx.createGain();
    g.gain.setValueAtTime(gain, t0);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    src.connect(filter);
    filter.connect(g);
    g.connect(sfxGain);
    src.start(t0);
    src.stop(t0 + dur + 0.02);
  }

  /* ------------------------------ 音效表 ------------------------------ */

  const sfx = {
    pick() {
      blip(midiToFreq(84), 0.07, { type: 'square', gain: 0.22 });
      blip(midiToFreq(91), 0.09, { type: 'square', gain: 0.18, delay: 0.05 });
    },
    dash() {
      blip(280, 0.16, { type: 'sawtooth', gain: 0.2, slideTo: 1500 });
    },
    echo() {
      blip(700, 0.22, { type: 'sine', gain: 0.2, slideTo: 320 });
    },
    lock() {
      blip(180, 0.26, { type: 'sawtooth', gain: 0.26, slideTo: 70 });
      noiseHit(0.18, { gain: 0.2, freq: 700 });
    },
    burst() {
      noiseHit(0.26, { gain: 0.34, freq: 2600, type: 'bandpass', q: 0.7 });
      blip(420, 0.16, { type: 'square', gain: 0.16, slideTo: 90 });
    },
    lance() {
      blip(1500, 0.1, { type: 'square', gain: 0.14, slideTo: 420 });
    },
    quake() {
      blip(90, 0.7, { type: 'sawtooth', gain: 0.34, slideTo: 40 });
      noiseHit(0.6, { gain: 0.26, freq: 900 });
    },
    seal() {
      blip(320, 0.24, { type: 'triangle', gain: 0.22, slideTo: 880 });
    },
    confirm() {
      blip(midiToFreq(76), 0.06, { type: 'square', gain: 0.18 });
      blip(midiToFreq(83), 0.1, { type: 'square', gain: 0.16, delay: 0.05 });
    },
    deny() {
      blip(160, 0.14, { type: 'square', gain: 0.16, slideTo: 110 });
    },
    over() {
      blip(midiToFreq(69), 0.18, { type: 'triangle', gain: 0.24 });
      blip(midiToFreq(64), 0.2, { type: 'triangle', gain: 0.22, delay: 0.18 });
      blip(midiToFreq(57), 0.5, { type: 'triangle', gain: 0.24, delay: 0.38 });
    },
    step() {
      noiseHit(0.05, { gain: 0.05, freq: 500, type: 'highpass' });
    },
  };

  /* ------------------------------ 音乐调度 ------------------------------ */

  const LOOKAHEAD = 0.14;
  const TICK = 25;

  function scheduleStep(theme, step, time) {
    // 通过 stepValue 取值：轨道缺失、小节为 null、小节长度不足一律回落到休止
    const leadNote = stepValue(theme.lead, step);
    if (leadNote != null) {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = theme.wave;
      osc.frequency.setValueAtTime(midiToFreq(leadNote), time);
      g.gain.setValueAtTime(0.0001, time);
      g.gain.exponentialRampToValueAtTime(0.13, time + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, time + 0.16);
      osc.connect(g);
      g.connect(musicGain);
      osc.start(time);
      osc.stop(time + 0.2);
    }

    const bassNote = stepValue(theme.bass, step);
    if (bassNote != null) {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(midiToFreq(bassNote), time);
      g.gain.setValueAtTime(0.0001, time);
      g.gain.exponentialRampToValueAtTime(0.2, time + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, time + 0.22);
      osc.connect(g);
      g.connect(musicGain);
      osc.start(time);
      osc.stop(time + 0.26);
    }

    const drum = stepValue(theme.drums, step);
    if (drum === 'k') {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(150, time);
      osc.frequency.exponentialRampToValueAtTime(45, time + 0.12);
      g.gain.setValueAtTime(0.32, time);
      g.gain.exponentialRampToValueAtTime(0.0001, time + 0.14);
      osc.connect(g);
      g.connect(musicGain);
      osc.start(time);
      osc.stop(time + 0.16);
    } else if (drum === 's') {
      const src = ctx.createBufferSource();
      src.buffer = noiseBuffer;
      const f = ctx.createBiquadFilter();
      f.type = 'bandpass';
      f.frequency.value = 1900;
      f.Q.value = 0.8;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.2, time);
      g.gain.exponentialRampToValueAtTime(0.0001, time + 0.12);
      src.connect(f);
      f.connect(g);
      g.connect(musicGain);
      src.start(time);
      src.stop(time + 0.14);
    } else if (drum === 'h') {
      const src = ctx.createBufferSource();
      src.buffer = noiseBuffer;
      const f = ctx.createBiquadFilter();
      f.type = 'highpass';
      f.frequency.value = 7200;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.06, time);
      g.gain.exponentialRampToValueAtTime(0.0001, time + 0.04);
      src.connect(f);
      f.connect(g);
      g.connect(musicGain);
      src.start(time);
      src.stop(time + 0.05);
    }
  }

  function musicTick() {
    if (!ctx || !current) return;
    const theme = THEMES[current.theme];
    if (!theme) return;
    const bpm = Number(theme.bpm) > 0 ? Number(theme.bpm) : 120;
    const stepDur = 60 / bpm / 4;
    while (current.nextTime < ctx.currentTime + LOOKAHEAD) {
      scheduleStep(theme, current.step, current.nextTime);
      current.step += 1;
      current.nextTime += stepDur;
    }
  }

  const music = {
    play(themeKey) {
      ensure();
      if (!ctx) return;
      resume();
      if (current && current.theme === themeKey) return;
      music.stop();
      current = { theme: themeKey, step: 0, nextTime: ctx.currentTime + 0.08, timer: 0 };
      current.timer = window.setInterval(musicTick, TICK);
      musicTick();
      started = true;
    },
    stop() {
      if (current && current.timer) window.clearInterval(current.timer);
      current = null;
    },
    isPlaying() {
      return !!current;
    },
    currentTheme() {
      return current ? current.theme : null;
    },
  };

  return {
    unlock: resume,
    resume,
    sfx,
    music,
    get muted() {
      return muted;
    },
    setMuted(v) {
      muted = !!v;
      if (master) master.gain.value = muted ? 0 : 0.5;
      if (muted) music.stop();
      else if (started && !current) music.play('hall');
    },
    toggleMute() {
      this.setMuted(!muted);
      return muted;
    },
    get started() {
      return started;
    },
    /**
     * 调试出口：暴露音频上下文状态与音乐调度进度。
     * 供集成方（06 博物馆 / 14 部署）与自动化验收确认「音乐确实在播放」。
     */
    get debug() {
      return {
        ctxState: ctx ? ctx.state : 'none',
        currentTime: ctx ? ctx.currentTime : 0,
        theme: current ? current.theme : null,
        step: current ? current.step : -1,
        muted,
      };
    },
  };
}
