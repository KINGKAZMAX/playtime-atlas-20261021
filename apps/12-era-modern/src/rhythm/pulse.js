import { el, clear, scrollToTop } from '../core/dom.js';
import { getSettings, setSetting } from '../core/settings.js';
import { recordRhythmRun, getRhythmRecord, markVisited } from '../core/progress.js';
import { publishState } from '../core/debug-state.js';
import { readFontStack } from '../core/tokens.js';
import { preloadFonts } from '../core/fonts.js';
import { toast } from '../ui/toast.js';
import { TRACKS, JUDGE_WINDOWS, JUDGE_WEIGHT, LANE_GLYPHS, LANE_LABELS } from '../data/charts.js';
import { audio } from './audio.js';
import { MusicScheduler } from './music.js';

const LANE_COLORS = ['#4FE3D0', '#FFC46B', '#FF5FA2', '#9D7BFF'];
const JUDGE_LABEL = { perfect: '极准', great: '很准', good: '尚可', miss: '失手' };
const COUNTDOWN_MS = 2400;
const APPROACH_DEFAULT = 1.55;

/**
 * Canvas 2D 不能直接用 CSS 变量，故把字体族列表从设计系统令牌读出来缓存。
 * 改版后自托管字体族名已变（Space Grotesk / Space Mono），
 * 这里读令牌而非写死族名，字体清单再变也不必回头改 Canvas。
 */
let fontDisplayStack = '';
let fontMonoStack = '';

function fontDisplay() {
  if (!fontDisplayStack) {
    fontDisplayStack = readFontStack('--ds-font-display', '"Space Grotesk", system-ui, sans-serif');
  }
  return fontDisplayStack;
}

function fontMono() {
  if (!fontMonoStack) {
    fontMonoStack = readFontStack('--ds-font-mono', '"Space Mono", ui-monospace, monospace');
  }
  return fontMonoStack;
}

/**
 * 《脉冲走廊 / PULSE CORRIDOR》
 * 节奏反应小游戏：谱面模式 / 反应训练 / 混合模式。
 * 关键特性：静音视觉替代（视觉节拍模式）下判定精度与音频模式完全一致。
 */
export function mountPulse(root) {
  markVisited('pulse');
  clear(root);

  const app = el('div.pulse-app');
  root.appendChild(app);

  const state = {
    screen: 'setup',
    mode: 'chart',
    trackId: TRACKS[0].id,
  };

  const cleanup = { fns: [] };
  let game = null;

  /* =========================================================
   * 准备界面
   * ========================================================= */
  function renderSetup() {
    clear(app);
    state.screen = 'setup';
    const settings = getSettings();

    const modeCards = [
      {
        id: 'chart',
        title: '谱面模式',
        en: 'CHART',
        desc: '跟随曲目的主旋律敲击轨道，判定你的准度与连击。',
        color: '#4FE3D0',
      },
      {
        id: 'drill',
        title: '反应训练',
        en: 'REACTION',
        desc: '只做反应：提示出现后立刻按下对应轨道，系统统计你的反应时。',
        color: '#FFC46B',
      },
      {
        id: 'hybrid',
        title: '混合模式',
        en: 'HYBRID',
        desc: '谱面中穿插「应答靶」与「禁触靶」，一边跟拍一边反应。',
        color: '#FF5FA2',
      },
    ].map((m) =>
      el(
        'button.mode-card',
        {
          type: 'button',
          'data-mode': m.id,
          'aria-pressed': String(state.mode === m.id),
          style: { '--mc': m.color },
          onclick: () => {
            state.mode = m.id;
            renderSetup();
          },
        },
        el('span.mode-card-en', {}, m.en),
        el('b', {}, m.title),
        el('p', {}, m.desc),
      ),
    );

    const trackRows = TRACKS.map((t) => {
      const record = getRhythmRecord(t.id);
      return el(
        'button.track-row',
        {
          type: 'button',
          'data-track': t.id,
          'aria-pressed': String(state.trackId === t.id),
          style: { '--tc': t.color },
          disabled: state.mode === 'drill',
          onclick: () => {
            state.trackId = t.id;
            renderSetup();
          },
        },
        el('span.track-lv', {}, `LV${t.level}`),
        el(
          'span.track-info',
          {},
          el('b', {}, `${t.title} / ${t.titleEn}`),
          el('span', {}, t.desc),
        ),
        el(
          'span.track-meta',
          {},
          el('span.mono', {}, `${t.bpm} BPM`),
          el('span.tag', { class: t.level === 1 ? 'tag-cyan' : t.level === 2 ? 'tag-amber' : 'tag-magenta' }, t.difficulty),
          record ? el('span.mono.track-best', {}, `最佳 ${record.bestScore}`) : null,
        ),
      );
    });

    const visualToggle = el('button.switch', {
      type: 'button',
      role: 'switch',
      'aria-pressed': String(settings.visualPulse),
      'aria-label': '视觉节拍模式',
    });
    visualToggle.addEventListener('click', () => {
      const next = !(visualToggle.getAttribute('aria-pressed') === 'true');
      visualToggle.setAttribute('aria-pressed', String(next));
      setSetting('visualPulse', next);
      updateNote();
    });

    const note = el('p.setup-note');
    function updateNote() {
      const s = getSettings();
      if (s.visualPulse) {
        note.textContent =
          '视觉节拍模式已开启：本次不产生任何声音，节拍由收缩节拍环、下行光带与顶部拍点标尺表达。判定精度与有声模式一致。';
      } else if (s.muted) {
        note.textContent =
          '当前为全局静音：不发出声音，但节拍提示仍然完整（收缩节拍环 + 下行光带 + 拍点标尺）。';
      } else {
        note.textContent =
          '点击「开始」后才会创建并启动音频（浏览器要求用户手势）。音量为程序化实时合成，无音频文件。';
      }
    }
    updateNote();

    const startBtn = el(
      'button.btn.btn-primary.btn-lg',
      { type: 'button', 'data-control': 'start', 'aria-label': '开始游戏' },
      '开始',
    );
    startBtn.addEventListener('click', async () => {
      startBtn.disabled = true;
      startBtn.textContent = '准备中…';
      await startGame();
    });

    app.appendChild(
      el(
        'div.pulse-wrap',
        {},
        el(
          'header.pulse-head',
          {},
          el('a.back-link', { href: '#/' }, '← 返回展厅'),
          el('span.exhibit-no', { style: { color: '#2E6A5E' } }, 'EXHIBIT 01'),
          el('h1.ds-detail__title', {}, '脉冲走廊'),
          el('p.pulse-sub', {}, 'PULSE CORRIDOR · 节奏反应'),
        ),
        el(
          'div.pulse-setup',
          {
            'data-game-root': 'pulse',
            tabindex: '0',
            'aria-label': '脉冲走廊选单：选择模式、曲目与播放设置',
          },
          el(
            'section.setup-block',
            {},
            el('h2.setup-h', {}, '选择模式'),
            el('div.mode-grid', {}, modeCards),
          ),
          el(
            'section.setup-block',
            {},
            el('h2.setup-h', {}, '选择曲目'),
            el('div.track-list', {}, trackRows),
            el('p.setup-hint', {}, '反应训练模式不需要曲目。'),
          ),
          el(
            'section.setup-block',
            {},
            el('h2.setup-h', {}, '播放设置'),
            el(
              'div.switch-row',
              {},
              el(
                'span.switch-label',
                {},
                el('b', {}, '视觉节拍模式（静音替代）'),
                el('span', {}, '完全不发声，用视觉节拍代替音乐。'),
              ),
              visualToggle,
            ),
            el('p.setup-note', {}, note.textContent),
            el(
              'div.setup-actions',
              {},
              startBtn,
              el(
                'p.setup-keys',
                {},
                '轨道键：',
                el('kbd', {}, 'D'),
                el('kbd', {}, 'F'),
                el('kbd', {}, 'J'),
                el('kbd', {}, 'K'),
                ' 或方向键 ',
                el('kbd', {}, '←'),
                el('kbd', {}, '↓'),
                el('kbd', {}, '↑'),
                el('kbd', {}, '→'),
                ' · ',
                el('kbd', {}, 'Esc'),
                ' 暂停 · ',
                el('kbd', {}, 'R'),
                ' 重开',
              ),
            ),
          ),
        ),
      ),
    );
  }

  /* =========================================================
   * 游戏主体
   * ========================================================= */
  async function startGame() {
    const settings = getSettings();
    const silent = settings.visualPulse || settings.muted;

    // Canvas 的 ctx.font 是同步生效的，取不到字体不会等待而是静默回落系统字体。
    // 因此先把 HUD 用到的字重（含 Space Mono 粗体）加载好，再开始绘制。
    await preloadFonts();

    // 用户手势内解锁音频
    if (!silent) {
      const ok = await audio.unlock();
      if (!ok) {
        toast('音频不可用，已切换为视觉节拍模式', 'warn');
        setSetting('visualPulse', true);
      }
    }
    audio.setMuted(settings.muted);

    const track = TRACKS.find((t) => t.id === state.trackId) || TRACKS[0];
    const canvas = el('canvas.pulse-canvas', { 'aria-label': '节奏轨道画面' });
    const hud = el('div.pulse-hud.ds-canvas-frame__hud.ds-canvas-frame__hud--top');
    const overlay = el('div.pulse-overlay');

    clear(app);
    state.screen = 'play';
    app.appendChild(
      el(
        'div.pulse-wrap',
        {},
        el(
          'header.pulse-head.pulse-head--compact',
          {},
          el('a.back-link', { href: '#/' }, '← 返回展厅'),
          el('div.pulse-head-title', {}, el('b', {}, '脉冲走廊'), el('span', {}, 'PULSE CORRIDOR')),
          el('div.pulse-head-actions', {},
            el('button.btn.btn-sm', { type: 'button', id: 'pulse-pause', 'data-control': 'pause' }, '暂停'),
            el('button.btn.btn-sm.btn-ghost', { type: 'button', id: 'pulse-restart', 'data-control': 'restart' }, '重开'),
          ),
        ),
        el('div.pulse-stage.ds-canvas-frame', {
          'data-game-root': 'pulse',
          'data-ds-theme': 'dark',
          tabindex: '0',
          'aria-label': '脉冲走廊游戏画面，方向键或 D F J K 敲击轨道',
        }, canvas, hud, overlay),
        el('p.pulse-foot', {}, '节拍由「下行光带」提前预告：光带抵达判定线的那一刻就是节拍点。'),
      ),
    );

    game = new PulseGame({ canvas, hud, overlay, track, mode: state.mode, onExit: () => renderSetup() });
    cleanup.fns.push(() => game.destroy());
    game.begin();
    scrollToTop();
  }

  renderSetup();

  return () => {
    cleanup.fns.forEach((fn) => fn());
    cleanup.fns.length = 0;
    if (game) game.destroy();
  };
}

/* =========================================================
 * 游戏类
 * ========================================================= */
class PulseGame {
  constructor({ canvas, hud, overlay, track, mode, onExit }) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.hud = hud;
    this.overlay = overlay;
    this.track = track;
    this.mode = mode;
    this.onExit = onExit;

    this.scheduler = new MusicScheduler(audio);
    this.settings = getSettings();

    this.phase = 'countdown';
    this.startPerf = performance.now() + COUNTDOWN_MS;
    this.pausedAt = 0;
    this.pausedPerf = 0;

    this.notes = track.notes.map((n) => ({ ...n, judged: false, result: null, hitAt: 0 }));
    this.judged = { perfect: 0, great: 0, good: 0, miss: 0 };
    this.combo = 0;
    this.maxCombo = 0;
    this.score = 0;
    this.effects = [];
    this.laneFlash = [0, 0, 0, 0];
    this.laneGlow = [0, 0, 0, 0];
    this.lastJudge = null;
    this.lastJudgeAt = 0;
    this.reactionTimes = [];
    this.reactionResults = { hit: 0, miss: 0 };
    this.cues = [];
    this.nextCueIndex = 0;
    this.activeCue = null;
    this.finished = false;
    this.lastBeatIndex = -1;
    this.raf = 0;
    this.dpr = 1;
    this.w = 0;
    this.h = 0;
    this.rootEl = canvas.closest('[data-game-root]');
    this.lastLane = -1;
    this.presses = 0;

    // 顶部工具栏按钮（与画面内的暂停遮罩共享同一套逻辑）
    this.pauseBtn = document.getElementById('pulse-pause');
    this.restartBtn = document.getElementById('pulse-restart');
    this.pauseBtn?.addEventListener('click', () => this.togglePause());
    this.restartBtn?.addEventListener('click', () => this.restart());

    this.buildHud();
    this.bindInput();
    this.resize();
    this.prepareCues();
    this.loop = this.loop.bind(this);
    this.raf = window.requestAnimationFrame(this.loop);
  }

  /* ---------------- 准备 ---------------- */

  prepareCues() {
    if (this.mode === 'drill') {
      // 20 个随机反应提示
      let t = 1.6;
      const lanes = [0, 1, 2, 3];
      for (let i = 0; i < 20; i += 1) {
        this.cues.push({ t, lane: lanes[(i * 7 + Math.floor(i / 4)) % 4], kind: 'target', done: false });
        t += 0.95 + ((i * 37) % 110) / 100;
      }
    } else if (this.mode === 'hybrid') {
      const spb = 60 / this.track.bpm;
      for (const r of this.track.reactions) {
        this.cues.push({ t: r.bar * 4 * spb + r.beat * spb, lane: r.lane, kind: r.kind, done: false });
      }
    }
    this.cues.sort((a, b) => a.t - b.t);
  }

  begin() {
    this.startPerf = performance.now() + COUNTDOWN_MS;
    this.phase = 'countdown';
    this.lastLane = -1;
    this.presses = 0;
    if (this.mode !== 'drill' && audio.active) {
      this.scheduler.start(this.track, 0);
    }
    this.updateHud();
    this.syncPauseLabel();
    this.publish();
    this.focusGame();
  }

  /** 把当前运行状态发布到可观测状态对象（供自动化验收比对）。 */
  publish() {
    publishState({
      state: this.phase,
      route: '/pulse',
      chapter: this.mode === 'drill' ? 'reaction-drill' : this.track.id,
      score: Math.round(this.score),
      combo: this.combo,
      player: { lane: this.lastLane, presses: this.presses },
      extra: {
        mode: this.mode,
        bpm: this.track.bpm,
        maxCombo: this.maxCombo,
        judged: { ...this.judged },
      },
    });
  }

  /* ---------------- HUD ---------------- */

  buildHud() {
    clear(this.hud);
    this.elScore = el('b.hud-score', {}, '0');
    this.elCombo = el('b.hud-combo', {}, '0');
    this.elAcc = el('b.hud-acc', {}, '100.00%');
    this.elJudge = el('span.hud-judge', {}, '');
    this.elBar = el('i.hud-bar-fill');
    this.elProgress = el('div.hud-progress', {}, this.elBar);
    this.elCounts = el('div.hud-counts');
    this.elMode = el('span.hud-mode', {}, this.modeLabel());

    this.hud.appendChild(
      el(
        'div.hud-row',
        {},
        el('div.hud-block', {}, el('label', {}, '分数'), this.elScore),
        el('div.hud-block', {}, el('label', {}, '连击'), this.elCombo),
        el('div.hud-block', {}, el('label', {}, '准度'), this.elAcc),
        el('div.hud-block.hud-block--wide', {}, el('label', {}, '判定'), this.elJudge),
      ),
    );
    this.hud.appendChild(
      el(
        'div.hud-row.hud-row--sub',
        {},
        this.elCounts,
        this.elMode,
      ),
    );
    this.hud.appendChild(this.elProgress);
  }

  modeLabel() {
    if (this.mode === 'drill') return '反应训练';
    if (this.mode === 'hybrid') return '混合模式';
    return '谱面模式';
  }

  updateHud() {
    this.elScore.textContent = String(Math.round(this.score));
    this.elCombo.textContent = String(this.combo);
    const total = this.judged.perfect + this.judged.great + this.judged.good + this.judged.miss;
    const acc = total
      ? ((this.judged.perfect * JUDGE_WEIGHT.perfect +
          this.judged.great * JUDGE_WEIGHT.great +
          this.judged.good * JUDGE_WEIGHT.good) /
          total) *
        100
      : 100;
    this.elAcc.textContent = `${acc.toFixed(2)}%`;

    this.elCounts.textContent = '';
    for (const [key, label] of [['perfect', '极准'], ['great', '很准'], ['good', '尚可'], ['miss', '失手']]) {
      this.elCounts.appendChild(
        el('span.count-chip', { class: `count-${key}` }, `${label} ${this.judged[key]}`),
      );
    }
    if (this.mode !== 'chart') {
      const avg = this.averageReaction();
      this.elCounts.appendChild(
        el('span.count-chip.count-react', {}, `反应 ${this.reactionTimes.length ? `${Math.round(avg)} ms` : '—'}`),
      );
    }

    const progress = this.mode === 'drill' ? this.cues.length ? this.nextCueIndex / this.cues.length : 0 : this.progressRatio();
    this.elBar.style.width = `${Math.max(0, Math.min(1, progress)) * 100}%`;

    if (this.lastJudge && performance.now() - this.lastJudgeAt < 600) {
      this.elJudge.textContent = this.lastJudge;
      this.elJudge.dataset.kind = this.lastJudgeKind || '';
    } else if (!this.lastJudge) {
      this.elJudge.textContent = '';
    }
  }

  averageReaction() {
    if (!this.reactionTimes.length) return 0;
    return this.reactionTimes.reduce((a, b) => a + b, 0) / this.reactionTimes.length;
  }

  progressRatio() {
    const total = this.track.duration || 1;
    return Math.max(0, Math.min(1, this.chartTime() / total));
  }

  /* ---------------- 输入 ---------------- */

  /** 游戏区是否持有键盘焦点。未聚焦时不消费按键，避免在 iframe 中劫持母站键盘。 */
  isGameFocused() {
    const root = this.rootEl;
    if (!root) return false;
    const active = document.activeElement;
    return active === root || root.contains(active);
  }

  /** 把焦点交还给游戏画面。 */
  focusGame() {
    try {
      this.rootEl?.focus({ preventScroll: true });
    } catch {
      this.rootEl?.focus();
    }
  }

  bindInput() {
    this.onKeyDown = (event) => {
      if (event.repeat) return;
      if (!this.isGameFocused()) return;
      const code = event.code;
      if (code === 'Escape') {
        event.preventDefault();
        this.togglePause();
        return;
      }
      if (code === 'KeyR') {
        event.preventDefault();
        this.restart();
        return;
      }
      const lane = LANE_CODES[code];
      if (lane != null) {
        event.preventDefault();
        this.hitLane(lane);
      }
    };
    window.addEventListener('keydown', this.onKeyDown);

    this.onPointerDown = (event) => {
      this.focusGame();
      if (this.phase === 'countdown') return;
      const rect = this.canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const lane = this.laneAtX(x);
      if (lane != null) {
        event.preventDefault();
        this.hitLane(lane);
      }
    };
    this.canvas.addEventListener('pointerdown', this.onPointerDown);
  }

  laneAtX(x) {
    const { laneWidth, x0 } = this.layout();
    const idx = Math.floor((x - x0) / laneWidth);
    return idx >= 0 && idx <= 3 ? idx : null;
  }

  /* ---------------- 判定 ---------------- */

  hitLane(lane) {
    if (this.phase !== 'playing') return;
    const t = this.chartTime();
    this.laneGlow[lane] = 1;
    this.lastLane = lane;
    this.presses += 1;
    this.publish();

    // 反应提示优先处理
    if (this.activeCue) {
      const cue = this.activeCue;
      const elapsed = (t - cue.t) * 1000;
      if (cue.kind === 'target') {
        if (lane === cue.lane && elapsed <= 620) {
          const reaction = Math.max(0, elapsed);
          this.reactionTimes.push(reaction);
          this.reactionResults.hit += 1;
          this.effects.push({ lane, kind: 'react', t: performance.now() });
          this.activeCue = null;
          cue.done = true;
          audio.sfx('react');
          this.setJudge(
            reaction < 180 ? '反应极快' : reaction < 320 ? '反应很快' : '反应到了',
            reaction < 180 ? 'perfect' : reaction < 320 ? 'great' : 'good',
          );
          this.updateHud();
          return;
        }
        if (lane === cue.lane) {
          // 按了但太慢
          this.reactionTimes.push(elapsed);
          this.reactionResults.hit += 1;
          this.activeCue = null;
          cue.done = true;
          this.setJudge('反应偏慢', 'good');
          this.updateHud();
          return;
        }
        // 按错轨道
        this.applyJudge('miss', lane);
        this.effects.push({ lane, kind: 'miss', t: performance.now() });
        return;
      }
      if (cue.kind === 'avoid') {
        if (lane === cue.lane) {
          // 禁触靶被误触
          this.reactionResults.miss += 1;
          this.activeCue = null;
          cue.done = true;
          this.applyJudge('miss', lane);
          this.effects.push({ lane, kind: 'miss', t: performance.now() });
          this.setJudge('误触禁触靶', 'miss');
          return;
        }
        return; // 按其它轨道不算错
      }
    }

    // 普通音符判定
    const offset = (getSettings().offsetMs || 0) / 1000;
    let best = null;
    let bestAbs = Infinity;
    for (const note of this.notes) {
      if (note.judged || note.lane !== lane) continue;
      const delta = note.t - (t - offset);
      const abs = Math.abs(delta);
      if (abs < bestAbs && abs <= JUDGE_WINDOWS.good / 1000) {
        best = note;
        bestAbs = abs;
      }
    }

    if (!best) {
      // 空敲：轻罚，不影响连击但会记一次失手
      this.effects.push({ lane, kind: 'tap', t: performance.now() });
      this.setJudge('空敲', 'miss');
      return;
    }

    best.judged = true;
    best.result = this.judgeBy(bestAbs);
    this.applyJudge(best.result, lane);
    this.effects.push({ lane, kind: best.result, t: performance.now() });
    audio.sfx(best.result);
  }

  judgeBy(absSeconds) {
    const ms = absSeconds * 1000;
    if (ms <= JUDGE_WINDOWS.perfect) return 'perfect';
    if (ms <= JUDGE_WINDOWS.great) return 'great';
    if (ms <= JUDGE_WINDOWS.good) return 'good';
    return 'miss';
  }

  applyJudge(result, lane) {
    this.judged[result] += 1;
    if (result === 'miss') {
      this.combo = 0;
    } else {
      this.combo += 1;
      this.maxCombo = Math.max(this.maxCombo, this.combo);
      const base = { perfect: 1000, great: 720, good: 400 }[result];
      const mult = Math.min(4, 1 + this.combo / 50);
      this.score += base * mult;
    }
    this.setJudge(JUDGE_LABEL[result], result);
    this.updateHud();
  }

  setJudge(text, kind) {
    this.lastJudge = text;
    this.lastJudgeKind = kind;
    this.lastJudgeAt = performance.now();
  }

  /* ---------------- 时间 ---------------- */

  chartTime() {
    if (this.phase === 'paused') return this.pausedAt;
    if (this.phase === 'countdown') return (performance.now() - this.startPerf) / 1000;
    if (this.phase === 'ready') return -COUNTDOWN_MS / 1000;
    return (performance.now() - this.startPerf) / 1000;
  }

  togglePause() {
    if (this.phase === 'playing' || this.phase === 'countdown') {
      this.pausedAt = this.chartTime();
      this.pausedFrom = this.phase;
      this.phase = 'paused';
      this.scheduler.stop();
      audio.suspend();
      this.showPauseOverlay();
      this.syncPauseLabel();
      this.publish();
    } else if (this.phase === 'paused') {
      this.phase = this.pausedFrom === 'countdown' ? 'countdown' : 'playing';
      this.startPerf = performance.now() - this.pausedAt * 1000;
      this.scheduler.start(this.track, this.pausedAt);
      audio.resume();
      this.clearOverlay();
      this.focusGame();
      this.syncPauseLabel();
      this.publish();
    }
  }

  /** 顶部工具栏的暂停按钮文案随状态切换（暂停时改为「继续」）。 */
  syncPauseLabel() {
    if (!this.pauseBtn) return;
    this.pauseBtn.textContent = this.phase === 'paused' ? '继续' : '暂停';
    this.pauseBtn.setAttribute('aria-pressed', String(this.phase === 'paused'));
  }

  restart() {
    this.phase = 'playing';
    this.startPerf = performance.now();
    this.pausedAt = 0;
    this.notes = this.track.notes.map((n) => ({ ...n, judged: false, result: null }));
    this.judged = { perfect: 0, great: 0, good: 0, miss: 0 };
    this.combo = 0;
    this.maxCombo = 0;
    this.score = 0;
    this.effects = [];
    this.reactionTimes = [];
    this.reactionResults = { hit: 0, miss: 0 };
    this.cues = [];
    this.nextCueIndex = 0;
    this.activeCue = null;
    this.finished = false;
    this.lastLane = -1;
    this.presses = 0;
    this.prepareCues();
    this.scheduler.start(this.track, 0);
    this.clearOverlay();
    this.syncPauseLabel();
    this.updateHud();
    this.focusGame();
    this.publish();
  }

  /* ---------------- 主循环 ---------------- */

  loop() {
    this.raf = window.requestAnimationFrame(this.loop);
    const t = this.chartTime();

    if (this.phase === 'countdown' && t >= 0) {
      this.phase = 'playing';
    }

    if (this.phase === 'playing') {
      this.checkNotes(t);
      this.updateCues(t);
      this.checkFinish(t);
    }

    this.render(t);
    this.updateHud();
    this.publish();
  }

  checkNotes(t) {
    const offset = (getSettings().offsetMs || 0) / 1000;
    for (const note of this.notes) {
      if (note.judged) continue;
      if (t - offset > note.t + JUDGE_WINDOWS.good / 1000) {
        note.judged = true;
        note.result = 'miss';
        this.applyJudge('miss', note.lane);
        this.effects.push({ lane: note.lane, kind: 'miss', t: performance.now() });
        audio.sfx('miss');
      }
    }
  }

  updateCues(t) {
    if (this.mode === 'chart') return;
    if (!this.activeCue && this.nextCueIndex < this.cues.length && t >= this.cues[this.nextCueIndex].t) {
      this.activeCue = this.cues[this.nextCueIndex];
      this.nextCueIndex += 1;
      this.cueStart = t;
    }
    if (this.activeCue) {
      const elapsed = t - this.activeCue.t;
      const limit = this.activeCue.kind === 'target' ? 0.62 : 0.75;
      if (elapsed > limit) {
        if (this.activeCue.kind === 'target') {
          this.reactionResults.miss += 1;
          this.setJudge('反应超时', 'miss');
        }
        this.activeCue = null;
      }
    }
  }

  checkFinish(t) {
    if (this.finished) return;
    if (this.mode === 'drill') {
      if (this.nextCueIndex >= this.cues.length && !this.activeCue) {
        this.finished = true;
        this.finish();
      }
      return;
    }
    const end = this.track.duration + 0.6;
    if (t > end) {
      this.finished = true;
      this.finish();
    }
  }

  /* ---------------- 结算 ---------------- */

  finish() {
    this.phase = 'results';
    this.scheduler.stop();
    this.publish();

    const total = this.judged.perfect + this.judged.great + this.judged.good + this.judged.miss;
    const acc = total
      ? ((this.judged.perfect * JUDGE_WEIGHT.perfect +
          this.judged.great * JUDGE_WEIGHT.great +
          this.judged.good * JUDGE_WEIGHT.good) /
          total) *
        100
      : 0;
    const rank = this.rankFor(acc);

    if (this.mode !== 'drill') {
      const record = recordRhythmRun(this.track.id, {
        score: Math.round(this.score),
        maxCombo: this.maxCombo,
        accuracy: acc,
        reactionMs: this.reactionTimes.length ? Math.round(this.averageReaction()) : null,
      });
      this.showResults(rank, acc, record);
    } else {
      this.showDrillResults();
    }
  }

  rankFor(acc) {
    if (acc >= 98) return { mark: 'S', cls: 'rank-s' };
    if (acc >= 94) return { mark: 'A', cls: 'rank-a' };
    if (acc >= 88) return { mark: 'B', cls: 'rank-b' };
    if (acc >= 78) return { mark: 'C', cls: 'rank-c' };
    return { mark: 'D', cls: 'rank-d' };
  }

  showResults(rank, acc, record) {
    const box = el(
      'div.pulse-result',
      {},
      el('div.result-rank', { class: rank.cls }, rank.mark),
      el('h2', {}, '演奏结束'),
      el('p.result-track', {}, `${this.track.title} / ${this.track.titleEn}`),
      el(
        'div.result-grid',
        {},
        this.resultItem('分数', String(Math.round(this.score))),
        this.resultItem('最大连击', String(this.maxCombo)),
        this.resultItem('准度', `${acc.toFixed(2)}%`),
        this.resultItem('极准 / 很准', `${this.judged.perfect} / ${this.judged.great}`),
        this.resultItem('尚可 / 失手', `${this.judged.good} / ${this.judged.miss}`),
        this.resultItem(
          '平均反应',
          this.reactionTimes.length ? `${Math.round(this.averageReaction())} ms` : '本模式无反应项',
        ),
      ),
      el(
        'p.result-record',
        {},
        record.bestScore >= Math.round(this.score)
          ? `本曲最佳成绩：${record.bestScore}`
          : `刷新最佳成绩！此前 ${record.bestScore} → 现在 ${record.bestScore}`,
      ),
      el(
        'div.result-actions',
        {},
        el('button.btn.btn-primary', { type: 'button', onclick: () => this.restart() }, '再来一次'),
        el('button.btn', { type: 'button', onclick: () => this.onExit() }, '换一首 / 换模式'),
        el('a.btn.btn-ghost', { href: '#/' }, '返回展厅'),
      ),
    );
    this.showOverlay(box);
  }

  showDrillResults() {
    const times = [...this.reactionTimes].sort((a, b) => a - b);
    const median = times.length ? times[Math.floor(times.length / 2)] : 0;
    const best = times.length ? times[0] : 0;
    const worst = times.length ? times[times.length - 1] : 0;
    const hit = this.reactionResults.hit;
    const totalCues = this.cues.length;
    const grade =
      median <= 200 ? '优秀' : median <= 300 ? '良好' : median <= 430 ? '合格' : '再练练';

    const box = el(
      'div.pulse-result',
      {},
      el('div.result-rank.rank-react', {}, grade),
      el('h2', {}, '反应训练结束'),
      el(
        'div.result-grid',
        {},
        this.resultItem('提示次数', String(totalCues)),
        this.resultItem('成功响应', `${hit} / ${totalCues}`),
        this.resultItem('中位反应时', median ? `${Math.round(median)} ms` : '—'),
        this.resultItem('最快', best ? `${Math.round(best)} ms` : '—'),
        this.resultItem('最慢', worst ? `${Math.round(worst)} ms` : '—'),
        this.resultItem('平均', times.length ? `${Math.round(this.averageReaction())} ms` : '—'),
      ),
      el(
        'p.result-record',
        {},
        '反应训练不计分，专注在「看准 → 判断 → 动手」这一段链路的时间。',
      ),
      el(
        'div.result-actions',
        {},
        el('button.btn.btn-primary', { type: 'button', onclick: () => this.restart() }, '再练一次'),
        el('button.btn', { type: 'button', onclick: () => this.onExit() }, '换个模式'),
        el('a.btn.btn-ghost', { href: '#/' }, '返回展厅'),
      ),
    );
    this.showOverlay(box);
  }

  resultItem(label, value) {
    return el('div.result-item', {}, el('label', {}, label), el('b', {}, value));
  }

  showOverlay(node) {
    clear(this.overlay);
    this.overlay.appendChild(node);
    this.overlay.classList.add('is-active');
    // 遮罩出现时把焦点交给第一个可操作元素：键盘用户不必再去找按钮，
    // 且焦点仍在游戏区内，按键作用域保持一致。
    const first = this.overlay.querySelector('button, a[href], [tabindex]:not([tabindex="-1"])');
    try {
      first?.focus?.({ preventScroll: true });
    } catch {
      first?.focus?.();
    }
  }

  clearOverlay() {
    clear(this.overlay);
    this.overlay.classList.remove('is-active');
    // 遮罩移除后原先被聚焦的按钮会随 DOM 一起消失，焦点会退回 body，
    // 这里主动交还给游戏画面，保证「关掉结算/暂停 → 键盘立刻可用」。
    this.focusGame();
  }

  showPauseOverlay() {
    const box = el(
      'div.pulse-pause',
      {},
      el('h2', {}, '已暂停'),
      el('p', {}, '按 Esc 或点击下方按钮继续。'),
      el(
        'div.result-actions',
        {},
        el('button.btn.btn-primary', { type: 'button', onclick: () => this.togglePause() }, '继续'),
        el('button.btn', { type: 'button', onclick: () => this.restart() }, '重新开始'),
        el('a.btn.btn-ghost', { href: '#/' }, '返回展厅'),
      ),
    );
    this.showOverlay(box);
  }

  /* ---------------- 渲染 ---------------- */

  resize() {
    const rect = this.canvas.getBoundingClientRect();
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.w = Math.max(1, Math.round(rect.width));
    this.h = Math.max(1, Math.round(rect.height));
    this.canvas.width = Math.round(this.w * this.dpr);
    this.canvas.height = Math.round(this.h * this.dpr);
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
  }

  layout() {
    const laneWidth = Math.max(52, Math.min(124, (this.w - 36) / 4));
    const x0 = (this.w - laneWidth * 4) / 2;
    const judgeY = this.h - Math.min(150, this.h * 0.2);
    const top = 74;
    return { laneWidth, x0, judgeY, top, highwayH: judgeY - top };
  }

  render(t) {
    const ctx = this.ctx;
    const { w, h } = this;
    ctx.clearRect(0, 0, w, h);

    // 背景
    const bg = ctx.createLinearGradient(0, 0, 0, h);
    bg.addColorStop(0, '#0a0f2c');
    bg.addColorStop(0.55, '#070b1e');
    bg.addColorStop(1, '#04061a');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);

    if (this.phase === 'countdown') {
      this.renderCountdown(t);
      return;
    }

    const { laneWidth, x0, judgeY, top, highwayH } = this.layout();
    const approach = APPROACH_DEFAULT;
    const spb = 60 / this.track.bpm;

    // 轨道底
    ctx.fillStyle = 'rgba(8,13,36,0.55)';
    ctx.fillRect(x0, top - 10, laneWidth * 4, highwayH + 20);
    ctx.strokeStyle = 'rgba(242,240,233,0.10)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i += 1) {
      const x = x0 + laneWidth * i;
      ctx.beginPath();
      ctx.moveTo(x, top - 10);
      ctx.lineTo(x, judgeY + 10);
      ctx.stroke();
    }

    // 下行节拍光带 —— 抵达判定线的瞬间就是节拍点
    const beat = t / spb;
    const firstBeat = Math.ceil(beat - 0.0001);
    for (let b = firstBeat; b < firstBeat + 14; b += 1) {
      const bt = b * spb;
      const dt = bt - t;
      if (dt > approach * 1.05 || dt < -0.2) continue;
      const y = judgeY - (dt / approach) * highwayH;
      const alpha = Math.max(0, 1 - dt / (approach * 1.05)) * 0.5;
      const grad = ctx.createLinearGradient(0, y - 14, 0, y + 14);
      grad.addColorStop(0, 'rgba(79,227,208,0)');
      grad.addColorStop(0.5, `rgba(79,227,208,${alpha.toFixed(3)})`);
      grad.addColorStop(1, 'rgba(79,227,208,0)');
      ctx.fillStyle = grad;
      ctx.fillRect(x0, y - 14, laneWidth * 4, 28);
    }

    // 轨道分隔线上的拍点刻度
    ctx.strokeStyle = 'rgba(242,240,233,0.16)';
    for (let b = firstBeat; b < firstBeat + 14; b += 1) {
      const bt = b * spb;
      const dt = bt - t;
      if (dt > approach * 1.05 || dt < -0.2) continue;
      const y = judgeY - (dt / approach) * highwayH;
      ctx.beginPath();
      ctx.moveTo(x0 - 10, y);
      ctx.lineTo(x0 - 2, y);
      ctx.moveTo(x0 + laneWidth * 4 + 2, y);
      ctx.lineTo(x0 + laneWidth * 4 + 10, y);
      ctx.stroke();
    }

    // 音符
    for (const note of this.notes) {
      if (note.judged && note.result !== 'miss') continue;
      if (note.judged && note.result === 'miss' && note.t < t - 0.6) continue;
      const dt = note.t - t;
      if (dt > approach) continue;
      if (dt < -0.25) continue;
      const y = judgeY - (dt / approach) * highwayH;
      const x = x0 + note.lane * laneWidth;
      const alpha = dt < 0 ? Math.max(0, 1 + dt / 0.25) : 1;
      const scale = 0.82 + 0.18 * Math.max(0, 1 - Math.abs(dt) / approach);
      this.drawNote(ctx, x, y, laneWidth, note.lane, scale, alpha, note.judged);
    }

    // 判定线
    const lineGrad = ctx.createLinearGradient(x0, 0, x0 + laneWidth * 4, 0);
    lineGrad.addColorStop(0, 'rgba(79,227,208,0.15)');
    lineGrad.addColorStop(0.5, 'rgba(242,240,233,0.85)');
    lineGrad.addColorStop(1, 'rgba(255,95,162,0.15)');
    ctx.fillStyle = lineGrad;
    ctx.fillRect(x0, judgeY - 1.5, laneWidth * 4, 3);

    // 轨道键位提示
    ctx.font = `600 12px ${fontMono()}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    for (let i = 0; i < 4; i += 1) {
      const x = x0 + laneWidth * (i + 0.5);
      const glow = this.laneGlow[i];
      ctx.fillStyle = `rgba(242,240,233,${(0.26 + glow * 0.6).toFixed(3)})`;
      ctx.fillText(LANE_GLYPHS[i], x, judgeY + 24);
      ctx.fillStyle = `rgba(242,240,233,${(0.18 + glow * 0.5).toFixed(3)})`;
      ctx.font = `500 10px ${fontMono()}`;
      ctx.fillText(LANE_LABELS[i], x, judgeY + 44);
      ctx.font = `600 12px ${fontMono()}`;
    }

    // 收缩节拍环
    this.renderMetronome(ctx, t, spb, judgeY);

    // 顶部拍点标尺
    this.renderRuler(ctx, t, spb, x0, laneWidth * 4);

    // 反应提示
    if (this.activeCue) this.renderCue(ctx, this.activeCue, t, x0, laneWidth, judgeY, top, highwayH);

    // 打击特效
    const now = performance.now();
    this.effects = this.effects.filter((e) => now - e.t < 460);
    for (const e of this.effects) {
      const age = (now - e.t) / 460;
      const x = x0 + e.lane * laneWidth + laneWidth / 2;
      const r = 10 + age * 46;
      const alpha = 1 - age;
      const color =
        e.kind === 'miss'
          ? '255,107,129'
          : e.kind === 'react'
            ? '157,123,255'
            : e.kind === 'tap'
              ? '242,240,233'
              : e.kind === 'perfect'
                ? '79,227,208'
                : e.kind === 'great'
                  ? '255,196,107'
                  : '157,123,255';
      ctx.strokeStyle = `rgba(${color},${alpha.toFixed(3)})`;
      ctx.lineWidth = 2.4 * (1 - age) + 0.6;
      ctx.beginPath();
      ctx.arc(x, judgeY, r, 0, Math.PI * 2);
      ctx.stroke();
    }

    for (let i = 0; i < 4; i += 1) this.laneGlow[i] = Math.max(0, this.laneGlow[i] - 0.045);
  }

  drawNote(ctx, x, y, laneWidth, lane, scale, alpha, judged) {
    const color = LANE_COLORS[lane];
    const nw = laneWidth * 0.7 * scale;
    const nh = 20 * scale;
    const cx = x + laneWidth / 2;
    const cy = y;

    ctx.save();
    ctx.globalAlpha = alpha * (judged ? 0.25 : 1);
    ctx.shadowColor = color;
    ctx.shadowBlur = judged ? 0 : 18;

    const grad = ctx.createLinearGradient(cx - nw / 2, cy, cx + nw / 2, cy);
    grad.addColorStop(0, `${color}33`);
    grad.addColorStop(0.5, `${color}ee`);
    grad.addColorStop(1, `${color}33`);
    ctx.fillStyle = grad;
    roundRect(ctx, cx - nw / 2, cy - nh / 2, nw, nh, 7);
    ctx.fill();

    ctx.shadowBlur = 0;
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.4;
    roundRect(ctx, cx - nw / 2, cy - nh / 2, nw, nh, 7);
    ctx.stroke();

    ctx.fillStyle = '#06091f';
    ctx.font = `700 12px ${fontDisplay()}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(LANE_GLYPHS[lane], cx, cy + 0.5);
    ctx.restore();
  }

  renderMetronome(ctx, t, spb, judgeY) {
    const phase = ((t % spb) + spb) % spb / spb; // 0..1
    const cx = this.w / 2;
    const cy = judgeY - 96;
    const big = this.settings.visualPulse ? 1.25 : 1;
    const rOuter = (66 - phase * 36) * big;
    const rInner = 22 * big;

    ctx.save();
    ctx.strokeStyle = `rgba(79,227,208,${(0.2 + (1 - phase) * 0.6).toFixed(3)})`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx, cy, rOuter, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = 'rgba(242,240,233,0.34)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(cx, cy, rInner, 0, Math.PI * 2);
    ctx.stroke();

    // 节拍点
    const beatIndex = Math.round(t / spb);
    const dotAlpha = 1 - phase;
    ctx.fillStyle = `rgba(255,196,107,${dotAlpha.toFixed(3)})`;
    ctx.beginPath();
    ctx.arc(cx, cy, 5.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = 'rgba(242,240,233,0.4)';
    ctx.font = `500 10px ${fontMono()}`;
    ctx.textAlign = 'center';
    ctx.fillText(`BEAT ${beatIndex + 1}`, cx, cy + rInner + 18);
    ctx.restore();
  }

  renderRuler(ctx, t, spb, x0, width) {
    const y = 26;
    const firstBeat = Math.ceil(t / spb);
    ctx.save();
    ctx.strokeStyle = 'rgba(242,240,233,0.08)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x0, y + 0.5);
    ctx.lineTo(x0 + width, y + 0.5);
    ctx.stroke();

    for (let b = firstBeat; b < firstBeat + 9; b += 1) {
      const bt = b * spb;
      const dt = bt - t;
      if (dt < -0.1) continue;
      const x = x0 + width - (dt / (spb * 8)) * width;
      if (x < x0 - 4 || x > x0 + width + 4) continue;
      const strong = b % 4 === 0;
      ctx.strokeStyle = strong ? 'rgba(255,196,107,0.8)' : 'rgba(242,240,233,0.35)';
      ctx.lineWidth = strong ? 2 : 1;
      ctx.beginPath();
      ctx.moveTo(x, y - (strong ? 12 : 7));
      ctx.lineTo(x, y + (strong ? 12 : 7));
      ctx.stroke();
    }
    ctx.restore();
  }

  renderCue(ctx, cue, t, x0, laneWidth, judgeY, top, highwayH) {
    const elapsed = t - cue.t;
    const limit = cue.kind === 'target' ? 0.62 : 0.75;
    const ratio = Math.max(0, Math.min(1, elapsed / limit));
    const cx = x0 + cue.lane * laneWidth + laneWidth / 2;
    const cy = top + 70;
    const color = cue.kind === 'target' ? '255,196,107' : '255,95,162';

    ctx.save();
    ctx.strokeStyle = `rgba(${color},${(0.9 - ratio * 0.5).toFixed(3)})`;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(cx, cy, 16 + ratio * 40, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = `rgba(${color},0.35)`;
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.arc(cx, cy, 12, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = `rgba(${color},0.95)`;
    ctx.font = `700 15px ${fontDisplay()}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(cue.kind === 'target' ? LANE_GLYPHS[cue.lane] : '×', cx, cy);

    ctx.fillStyle = `rgba(${color},0.85)`;
    ctx.font = `600 10px ${fontMono()}`;
    ctx.fillText(cue.kind === 'target' ? '按此轨' : '别按此轨', cx, cy + 42);
    ctx.restore();
  }

  renderCountdown(t) {
    const ctx = this.ctx;
    const remain = -t;
    const { w, h } = this;
    ctx.fillStyle = 'rgba(4,6,26,0.6)';
    ctx.fillRect(0, 0, w, h);

    const secs = Math.ceil(remain / 0.8);
    const frac = 1 - ((remain % 0.8) / 0.8);

    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#f2f0e9';
    ctx.font = `700 72px ${fontDisplay()}`;
    ctx.fillText(String(Math.max(1, secs)), w / 2, h / 2 - 20);

    ctx.fillStyle = 'rgba(79,227,208,0.9)';
    ctx.font = `600 13px ${fontMono()}`;
    ctx.fillText('READY', w / 2, h / 2 + 34);

    // 预备环
    ctx.strokeStyle = 'rgba(79,227,208,0.55)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(w / 2, h / 2 - 20, 58, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * frac);
    ctx.stroke();
    ctx.restore();
  }

  destroy() {
    window.cancelAnimationFrame(this.raf);
    this.scheduler.stop();
    publishState({ state: 'idle', route: '/pulse', chapter: null });
    window.removeEventListener('keydown', this.onKeyDown);
    this.canvas.removeEventListener('pointerdown', this.onPointerDown);
    this.onResize && window.removeEventListener('resize', this.onResize);
  }
}

const LANE_CODES = {
  KeyD: 0,
  KeyF: 1,
  KeyJ: 2,
  KeyK: 3,
  ArrowLeft: 0,
  ArrowDown: 1,
  ArrowUp: 2,
  ArrowRight: 3,
};

function roundRect(ctx, x, y, w, h, r) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}
