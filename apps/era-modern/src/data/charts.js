/**
 * 节奏谱面数据 —— 谱面即乐谱。
 *
 * 每条「音符」同时是：1) 玩家要打的判定点，2) 合成器要演奏的主旋律。
 * 因此视听天然对齐，不存在「音频漂移于谱面」的问题。
 *
 * 记谱 DSL：每个小节一个字符串数组，元素为 "lane:beat"（beat 可为 .5 / .25 小节）。
 *   lane: 0..3 对应四轨（◆ ● ▲ ■）
 *   beat: 小节内的拍位置（0..4）
 */

const MINOR_PENTATONIC = [0, 3, 5, 7, 10];

/** 解析 "lane:beat" 记谱。 */
function parseBars(barStrings) {
  const notes = [];
  barStrings.forEach((bar, barIndex) => {
    if (!bar) return;
    for (const token of bar.trim().split(/\s+/)) {
      if (!token) continue;
      const [laneRaw, beatRaw, durRaw] = token.split(':');
      const lane = Number(laneRaw);
      const beat = Number(beatRaw);
      if (!Number.isInteger(lane) || lane < 0 || lane > 3) continue;
      if (!Number.isFinite(beat)) continue;
      notes.push({
        id: `${barIndex}-${lane}-${beat}`,
        bar: barIndex,
        beat,
        lane,
        dur: durRaw ? Number(durRaw) : 0,
        time: barIndex * 4 + beat,
      });
    }
  });
  return notes;
}

/** 计算每个音符在曲目内的绝对秒数。 */
function withTimes(notes, bpm) {
  const spb = 60 / bpm;
  return notes.map((n) => ({ ...n, t: n.time * spb }));
}

function makeTrack(def) {
  const notes = withTimes(parseBars(def.bars), def.bpm);
  const totalBeats = def.bars.length * 4;
  return {
    ...def,
    notes,
    totalBeats,
    duration: totalBeats * (60 / def.bpm),
    spb: 60 / def.bpm,
  };
}

/* ------------------------------------------------------------------ *
 * 曲目一：启明 / FIRST LIGHT —— 100 BPM，入门
 * ------------------------------------------------------------------ */
const FIRST_LIGHT = makeTrack({
  id: 'first-light',
  title: '启明',
  titleEn: 'FIRST LIGHT',
  bpm: 100,
  beatsPerBar: 4,
  level: 1,
  difficulty: '入门',
  color: '#4FE3D0',
  desc: '四分音符为主的双向级进，像第一缕光沿着四根轨道逐级点亮。',
  scale: MINOR_PENTATONIC,
  baseMidi: 57, // A3
  drums: 'soft',
  progression: [0, 0, 0, 0, 3, 3, 3, 3, 4, 4, 2, 2, 0, 3, 4, 0],
  bars: [
    '', // 0: 两小节预备（视觉节拍器引导）
    '',
    '0:0 1:1 2:2 3:3',
    '3:0 2:1 1:2 0:3',
    '0:0 1:1 2:2 3:3',
    '0:0 2:1 1:2 3:3',
    '0:0 1:0.5 2:1 3:1.5 0:2 1:2.5 2:3 3:3.5',
    '0:0 1:1 2:2 3:3',
    '3:0 2:1 1:2 0:3',
    '0:0 2:0 1:1 3:1 0:2 2:2 1:3 3:3',
    '0:0 1:1 2:2 3:3',
    '0:0 1:0.5 2:1 3:1.5 2:2 1:2.5 0:3 3:3.5',
    '0:0 1:1 2:2 3:3',
    '0:0 2:1 1:2 3:3',
    '3:0 2:1 1:2 0:3',
    '0:0 1:0.5 2:1 3:1.5 0:2 1:2.5 2:3 3:3.5',
    '0:0 1:1 2:2 3:3',
  ],
  reactions: [
    { bar: 5, beat: 3.75, kind: 'target', lane: 2 },
    { bar: 9, beat: 3.5, kind: 'avoid', lane: 1 },
  ],
});

/* ------------------------------------------------------------------ *
 * 曲目二：潮汐 / TIDE GLASS —— 124 BPM，进阶
 * ------------------------------------------------------------------ */
const TIDE_GLASS = makeTrack({
  id: 'tide-glass',
  title: '潮汐',
  titleEn: 'TIDE GLASS',
  bpm: 124,
  beatsPerBar: 4,
  level: 2,
  difficulty: '进阶',
  color: '#FF5FA2',
  desc: '切分与八分音跑动并存，像玻璃潮汐在轨道之间来回折射。',
  scale: MINOR_PENTATONIC,
  baseMidi: 55, // G3
  drums: 'shuffle',
  progression: [0, 0, 2, 2, 4, 4, 3, 3, 0, 0, 5, 5, 4, 3, 2, 0, 1, 1, 4, 0],
  bars: [
    '',
    '0:0 2:1 1:2 3:3',
    '0:0 1:0.5 2:1 3:1.5 2:2 1:2.5 0:3 3:3.5',
    '3:0 2:0.5 1:1 0:1.5 1:2 2:2.5 3:3 3:3.5',
    '0:0 0:0.5 2:1 2:1.5 1:2 1:2.5 3:3 3:3.5',
    '0:0 1:1 2:1.5 3:2 0:2.5 1:3 2:3.5 3:3.5',
    '3:0 2:0.5 1:1 0:1.5 3:2 2:2.5 1:3 0:3.5',
    '0:0 1:0.5 0:1 2:1.5 1:2 3:2.5 2:3 3:3.5',
    '0:0 2:1 3:2 1:3',
    '3:0 1:1 2:2 0:3',
    '0:0 1:0.5 2:1 3:1.5 0:2 2:2.5 1:3 3:3.5',
    '3:0 2:0.5 1:1 0:1.5 1:2 0:2.5 3:3 2:3.5',
    '0:0 1:1 2:2 3:3',
    '0:0 0:0.5 1:1 1:1.5 2:2 2:2.5 3:3 3:3.5',
    '3:0 3:0.5 2:1 2:1.5 1:2 1:2.5 0:3 0:3.5',
    '1:0 2:0.5 3:1 0:1.5 1:2 2:2.5 3:3 0:3.5',
    '0:0 1:1 2:2 3:3',
    '0:0 2:0 1:1 3:1 0:2 2:2 1:3 3:3',
    '0:0 1:0.5 2:1 3:1.5 2:2 1:2.5 0:3 3:3.5',
    '0:0 1:1 2:2 3:3',
  ],
  reactions: [
    { bar: 4, beat: 3.5, kind: 'target', lane: 1 },
    { bar: 8, beat: 2.5, kind: 'avoid', lane: 3 },
    { bar: 13, beat: 3.75, kind: 'target', lane: 0 },
    { bar: 17, beat: 1.25, kind: 'avoid', lane: 2 },
  ],
});

/* ------------------------------------------------------------------ *
 * 曲目三：棱镜风暴 / PRISM STORM —— 150 BPM，挑战
 * ------------------------------------------------------------------ */
const PRISM_STORM = makeTrack({
  id: 'prism-storm',
  title: '棱镜风暴',
  titleEn: 'PRISM STORM',
  bpm: 150,
  beatsPerBar: 4,
  level: 3,
  difficulty: '挑战',
  color: '#FFC46B',
  desc: '十六分音簇与长按交错，棱镜在最高密度下把光拆成三条轨道。',
  scale: MINOR_PENTATONIC,
  baseMidi: 52, // E3
  drums: 'drive',
  progression: [0, 0, 2, 2, 4, 4, 1, 1, 3, 3, 0, 0, 2, 4, 3, 1, 0, 2, 4, 4, 3, 2, 1, 0],
  bars: [
    '',
    '0:0 2:0.5 1:1 3:1.5 2:2 0:2.5 1:3 3:3.5',
    '3:0 1:0.5 2:1 0:1.5 1:2 3:2.5 2:3 0:3.5',
    '0:0 0:0.25 1:0.5 1:0.75 2:1 2:1.25 3:1.5 3:1.75 0:2 1:2.25 2:2.5 3:2.75 0:3 1:3.25 2:3.5 3:3.75',
    '3:0 2:0.25 1:0.5 0:0.75 3:1 2:1.25 1:1.5 0:1.75 1:2 2:2.25 3:2.5 0:2.75 1:3 2:3.25 3:3.5 0:3.75',
    '0:0 1:0.5 2:1 3:1.5 0:2 1:2.5 2:3 3:3.5',
    '2:0 3:0.25 2:0.5 1:0.75 3:1 0:1.25 1:1.5 2:1.75 0:2 3:2.25 2:2.5 1:2.75 0:3 1:3.25 2:3.5 3:3.75',
    '3:0 1:0.5 0:1 2:1.5 1:2 3:2.5 2:3 0:3.5',
    '0:0 0:0.25 1:0.5 1:0.75 2:1 2:1.25 3:1.5 3:1.75 0:2 0:2.25 1:2.5 1:2.75 2:3 2:3.25 3:3.5 3:3.75',
    '1:0 2:0.25 3:0.5 0:0.75 1:1 2:1.25 3:1.5 0:1.75 2:2 1:2.25 0:2.5 3:2.75 1:3 2:3.25 3:3.5 0:3.75',
    '0:0 2:1 1:2 3:3',
    '0:0 1:0.25 2:0.5 3:0.75 0:1 1:1.25 2:1.5 3:1.75 0:2 1:2.25 2:2.5 3:2.75 0:3 1:3.25 2:3.5 3:3.75',
    '3:0 2:0.25 1:0.5 0:0.75 1:1 0:1.25 3:1.5 2:1.75 3:2 2:2.25 1:2.5 0:2.75 1:3 0:3.25 3:3.5 2:3.75',
    '0:0 1:0.5 2:1 3:1.5 0:2 1:2.5 2:3 3:3.5',
    '0:0 0:0.25 0:0.5 1:0.75 1:1 1:1.25 2:1.5 2:1.75 3:2 3:2.25 0:2.5 0:2.75 1:3 1:3.25 2:3.5 2:3.75',
    '3:0 3:0.25 2:0.5 2:0.75 1:1 1:1.25 0:1.5 0:1.75 1:2 1:2.25 2:2.5 2:2.75 3:3 3:3.25 0:3.5 0:3.75',
    '0:0 2:1 1:2 3:3',
    '0:0 1:0.5 2:1 3:1.5 0:2 2:2.5 1:3 3:3.5',
    '3:0 2:0.5 1:1 0:1.5 1:2 0:2.5 3:3 2:3.5',
    '0:0 1:0.25 2:0.5 3:0.75 0:1 1:1.25 2:1.5 3:1.75 0:2 1:2.25 2:2.5 3:2.75 0:3 1:3.25 2:3.5 3:3.75',
    '1:0 0:0.5 3:1 2:1.5 1:2 3:2.5 0:3 2:3.5',
    '0:0 1:0.5 2:1 3:1.5 0:2 1:2.5 2:3 3:3.5',
    '3:0 2:0.5 1:1 0:1.5 1:2 2:2.5 3:3 0:3.5',
    '0:0 1:1 2:2 3:3',
  ],
  reactions: [
    { bar: 3, beat: 3.5, kind: 'target', lane: 3 },
    { bar: 6, beat: 1.75, kind: 'avoid', lane: 0 },
    { bar: 9, beat: 2.5, kind: 'target', lane: 2 },
    { bar: 12, beat: 3.25, kind: 'avoid', lane: 1 },
    { bar: 15, beat: 0.25, kind: 'target', lane: 0 },
    { bar: 18, beat: 2.75, kind: 'avoid', lane: 3 },
    { bar: 21, beat: 1.25, kind: 'target', lane: 1 },
  ],
});

export const TRACKS = [FIRST_LIGHT, TIDE_GLASS, PRISM_STORM];

/** 判定窗口（毫秒），由易到难。 */
export const JUDGE_WINDOWS = {
  perfect: 60,
  great: 100,
  good: 140,
};

export const JUDGE_WEIGHT = {
  perfect: 1,
  great: 0.72,
  good: 0.4,
  miss: 0,
};

export const LANE_GLYPHS = ['◆', '●', '▲', '■'];
export const LANE_LABELS = ['D / ←', 'F / ↓', 'J / ↑', 'K / →'];
export const LANE_KEYS = ['KeyD', 'KeyF', 'KeyJ', 'KeyK'];
export const LANE_ARROWS = ['ArrowLeft', 'ArrowDown', 'ArrowUp', 'ArrowRight'];
