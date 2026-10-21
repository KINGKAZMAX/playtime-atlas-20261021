import { midiToFreq } from './audio.js';

/**
 * 乐曲调度器 —— 把谱面翻译成音频事件，并以「前瞻」方式提前排程。
 *
 * 全部音色由 WebAudio 实时合成，没有任何采样文件。
 * 调度使用 AudioContext 的时间轴，视觉使用 performance.now()；
 * 两者在每次开始/恢复时重新对齐，因此不会有累积漂移。
 */

const DRUM_PATTERNS = {
  soft: [
    [0, 'kick', 1],
    [1, 'snare', 0.75],
    [2, 'kick', 0.85],
    [3, 'snare', 0.75],
    [0.5, 'hat', 0.55],
    [1.5, 'hat', 0.4],
    [2.5, 'hat', 0.55],
    [3.5, 'hat', 0.4],
  ],
  shuffle: [
    [0, 'kick', 1],
    [0.75, 'hat', 0.5],
    [1, 'snare', 0.85],
    [1.75, 'kick', 0.6],
    [2, 'kick', 0.9],
    [2.5, 'snare', 0.7],
    [3, 'snare', 0.8],
    [3.5, 'hat', 0.5],
  ],
  drive: [
    [0, 'kick', 1],
    [0.5, 'hat', 0.5],
    [0.75, 'kick', 0.62],
    [1, 'snare', 0.9],
    [1.5, 'hat', 0.4],
    [1.75, 'kick', 0.55],
    [2, 'kick', 0.92],
    [2.5, 'hat', 0.5],
    [2.75, 'kick', 0.62],
    [3, 'snare', 0.95],
    [3.5, 'hat', 0.45],
    [3.75, 'hat', 0.35],
  ],
};

export class MusicScheduler {
  constructor(audio) {
    this.audio = audio;
    this.timer = 0;
    this.events = [];
    this.index = 0;
    this.epoch = 0;
    this.running = false;
  }

  /** 生成整首曲子的音频事件列表（时间单位：秒，曲目起点为 0）。 */
  buildEvents(track) {
    const spb = 60 / track.bpm;
    const events = [];
    const scale = track.scale;
    const base = track.baseMidi;

    // 主旋律 —— 直接来自谱面
    for (const note of track.notes) {
      const idx = note.lane + note.bar;
      const degree = scale[idx % scale.length];
      const octave = 12 * (Math.floor(idx / scale.length) % 3);
      events.push({
        t: note.t,
        kind: 'pluck',
        freq: midiToFreq(base + degree + octave),
        dur: Math.max(0.18, (note.dur || 0) * spb || 0.26),
        gain: 1,
      });
    }

    // 低音与铺底 —— 每个小节一组
    const bars = track.bars.length;
    const progression = track.progression;
    for (let b = 0; b < bars; b += 1) {
      const p = progression[b % progression.length];
      const root = base - 12 + scale[p % scale.length];
      const barT = b * 4 * spb;
      events.push({ t: barT, kind: 'bass', freq: midiToFreq(root), dur: spb * 1.6, gain: 1 });
      events.push({ t: barT + spb * 2.5, kind: 'bass', freq: midiToFreq(root + scale[(p + 2) % scale.length]), dur: spb * 0.9, gain: 0.7 });
      events.push({
        t: barT,
        kind: 'pad',
        freqs: [midiToFreq(root + 12), midiToFreq(root + 12 + 3), midiToFreq(root + 12 + 7)],
        dur: spb * 4,
        gain: 0.9,
      });
    }

    // 鼓组
    const pattern = DRUM_PATTERNS[track.drums] || DRUM_PATTERNS.soft;
    for (let b = 0; b < bars; b += 1) {
      const barT = b * 4 * spb;
      for (const [beat, kind, gain] of pattern) {
        events.push({ t: barT + beat * spb, kind, gain });
      }
    }

    events.sort((a, b) => a.t - b.t);
    return events;
  }

  /**
   * 开始调度。chartTimeAtStart 为开始瞬间对应的曲目时间（秒）。
   */
  start(track, chartTimeAtStart = 0) {
    this.stop();
    if (!this.audio.active) return;
    this.events = this.buildEvents(track);
    // 找到第一个尚未过去的事件
    let i = 0;
    while (i < this.events.length && this.events[i].t < chartTimeAtStart) i += 1;
    this.index = i;
    this.epoch = this.audio.ctx.currentTime - chartTimeAtStart;
    this.running = true;
    this.timer = window.setInterval(() => this.tick(), 25);
  }

  tick() {
    if (!this.running || !this.audio.active) return;
    const ctx = this.audio.ctx;
    const now = ctx.currentTime;
    const chartNow = now - this.epoch;
    const horizon = chartNow + 0.22;

    while (this.index < this.events.length && this.events[this.index].t <= horizon) {
      const ev = this.events[this.index];
      const when = Math.max(now + 0.005, this.epoch + ev.t);
      this.fire(ev, when);
      this.index += 1;
    }
  }

  fire(ev, when) {
    const a = this.audio;
    switch (ev.kind) {
      case 'pluck':
        a.pluck(when, ev.freq, ev.dur, ev.gain);
        break;
      case 'bass':
        a.bass(when, ev.freq, ev.dur, ev.gain);
        break;
      case 'pad':
        a.pad(when, ev.freqs, ev.dur, ev.gain);
        break;
      case 'kick':
        a.kick(when, ev.gain);
        break;
      case 'snare':
        a.snare(when, ev.gain);
        break;
      case 'hat':
        a.hat(when, ev.gain, false);
        break;
      default:
        break;
    }
  }

  stop() {
    if (this.timer) window.clearInterval(this.timer);
    this.timer = 0;
    this.running = false;
  }
}
