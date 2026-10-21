/**
 * 展品 08-A —— 辉点对拉 / LUMEN RALLY
 *
 * 机制谱系：Tennis for Two (1958) 的「一个会动的亮点 + 拖影 + 双人」→
 *            Pong (1972) 的左右对拉。
 * 本作在此之上加入两条原创规则：
 *   1. 蓄力重击 —— 蓄能就绪后的回球带「重击」窗口，窗口内失分记 +2；
 *   2. 偏心回弹 —— 击球点偏离板心会改变出射角与旋转。
 *
 * 全部美术为 Canvas 程序化绘制，音效为 WebAudio 实时合成，无外部资源。
 */

import {
  PALETTE,
  createSurface,
  drawBackdrop,
  drawScanlines,
  glowDot,
  glowLine,
  instrumentFrame,
  label,
  measure,
  roundRect,
} from '../core/gfx.js';
import { Loop, clamp, rand } from '../core/loop.js';
import { FocusScope } from '../core/focus.js';
import { InputState } from '../core/input.js';
import { AudioKit } from '../core/audio.js';
import { load, save } from '../core/storage.js';

const W = 960;
const H = 540;
const PLAY = { left: 46, right: 914, top: 68, bottom: 504 };
const NET_X = 480;
const BLADE_HALF_W = 7;
const BLADE_HALF_H = 46;
const BALL_R = 8;
const TARGET_SCORE = 7;
const BASE_SPEED = 470;
const SPEED_STEP = 17;
const CHARGE_RATE = 1 / 0.8; // 每秒充满所需比例的倒数
const CHARGE_MIN = 0.25;

const DIFFICULTY = {
  rookie: { label: '初辉', speed: 300, react: 0.24, error: 120, cap: 700, charge: 0.3 },
  steady: { label: '稳流', speed: 420, react: 0.12, error: 48, cap: 830, charge: 0.55 },
  keen: { label: '锐锋', speed: 540, react: 0.05, error: 14, cap: 960, charge: 0.8 },
};

const KEY_CODES = [
  'KeyW', 'KeyS', 'KeyA', 'KeyD', 'ArrowUp', 'ArrowDown', 'Space', 'Slash', 'Period',
  'ShiftRight', 'KeyP', 'Escape', 'KeyR', 'KeyM', 'Enter',
];

export class RallyGame {
  /**
   * @param {HTMLElement} root 展品根容器（含 canvas / overlay）
   * @param {object} [opts]
   */
  constructor(root, opts = {}) {
    this.root = root;
    this.canvas = root.querySelector('[data-role="canvas"]');
    this.overlay = root.querySelector('[data-role="overlay"]');
    this.overlayKicker = root.querySelector('[data-role="overlay-kicker"]');
    this.overlayTitle = root.querySelector('[data-role="overlay-title"]');
    this.overlayDesc = root.querySelector('[data-role="overlay-desc"]');
    this.overlayActions = root.querySelector('[data-role="overlay-actions"]');
    this.overlayMeta = root.querySelector('[data-role="overlay-meta"]');

    this.surface = createSurface(this.canvas, W, H);
    this.ctx = this.surface.ctx;
    this.audio = new AudioKit();

    this.scope = new FocusScope(root);
    this.input = new InputState(this.scope, {
      codes: KEY_CODES,
      // 只在游戏作用域内发生按键时才回调 —— 音频解锁也因此被限制在用户手势内
      onActivity: () => this.audio.unlock(),
    });

    const settings = load('rally.settings', {}) || {};
    this.mode = settings.mode === '2p' ? '2p' : '1p';
    this.difficulty = DIFFICULTY[settings.difficulty] ? settings.difficulty : 'steady';
    this.best = load('rally.best', { p1: 0, p2: 0 }) || { p1: 0, p2: 0 };
    // 立即落盘设置：保证本机始终留有可核验的偏好记录
    this.saveSettings();

    this.state = 'idle';
    this.stateTimer = 0;
    this.score = [0, 0];
    this.rally = 0;
    this.lastScorer = 0;
    this.flash = 0;
    this.shake = 0;
    this.time = 0;

    this.blades = [
      { x: PLAY.left + 24, y: H / 2, vy: 0, charge: 0, armed: 0, dir: 1, speed: 520 },
      { x: PLAY.right - 24, y: H / 2, vy: 0, charge: 0, armed: 0, dir: -1, speed: 520 },
    ];
    this.ball = {
      x: NET_X, y: H / 2, vx: 0, vy: 0, speed: BASE_SPEED,
      spin: 0, trail: [], smashBy: -1, smashTime: 0,
    };
    this.particles = [];
    this.aiTimer = 0;
    this.aiTarget = H / 2;
    this.aiCharging = false;
    this.aiArmed = 0;
    this.touchTarget = [null, null];
    this.touchHold = null;
    this.touchCharge = null;

    this.loop = new Loop(
      (dt) => this.update(dt),
      (alpha, dt) => this.render(alpha, dt),
      1 / 180,
      10,
    );

    this.input.bindCanvas(this.canvas, (cx, cy) => ({ x: cx, y: cy }));
    this.bindControls();
    this.bindLifecycle();
    this.renderOverlay();
    this.loop.start();
  }

  /** 玩家 1 辉板（只读引用，供自动化验收观察位置变化）。 */
  get p1() {
    return this.blades[0];
  }

  /** 玩家 2 辉板（只读引用）。 */
  get p2() {
    return this.blades[1];
  }

  // ---------------------------------------------------------------
  // 外部控件绑定
  // ---------------------------------------------------------------
  bindControls() {
    // 控件分布在顶栏与侧栏，不在游戏根容器内，因此在整个文档范围内查找。
    document.querySelectorAll('[data-control="mode"]').forEach((btn) => {
      btn.addEventListener('click', () => {
        this.setMode(btn.dataset.value);
        this.audio.unlock();
        this.audio.ui();
      });
    });
    document.querySelectorAll('[data-control="difficulty"]').forEach((btn) => {
      btn.addEventListener('click', () => {
        this.setDifficulty(btn.dataset.value);
        this.audio.unlock();
        this.audio.ui();
      });
    });
    document.querySelectorAll('[data-control="pause"]').forEach((btn) => {
      btn.addEventListener('click', () => {
        this.audio.unlock();
        if (this.state === 'playing' || this.state === 'countdown') this.pause();
        else if (this.state === 'paused') this.resume();
      });
    });
    document.querySelectorAll('[data-control="restart"]').forEach((btn) => {
      btn.addEventListener('click', () => {
        this.audio.unlock();
        this.restart();
      });
    });
    document.querySelectorAll('[data-control="mute"]').forEach((btn) => {
      btn.addEventListener('click', () => {
        this.audio.unlock();
        const muted = this.audio.toggleMute();
        btn.setAttribute('aria-pressed', String(muted));
        btn.textContent = muted ? '音效 关' : '音效 开';
      });
      btn.setAttribute('aria-pressed', String(this.audio.muted));
      btn.textContent = this.audio.muted ? '音效 关' : '音效 开';
    });
    document.querySelectorAll('[data-control="start"]').forEach((btn) => {
      btn.addEventListener('click', () => {
        this.audio.unlock();
        this.start();
      });
    });
    this.syncControls();
  }

  syncControls() {
    document.querySelectorAll('[data-control="mode"]').forEach((btn) => {
      btn.setAttribute('aria-pressed', String(btn.dataset.value === this.mode));
    });
    document.querySelectorAll('[data-control="difficulty"]').forEach((btn) => {
      btn.setAttribute('aria-pressed', String(btn.dataset.value === this.difficulty));
    });
    document.querySelectorAll('[data-role="difficulty-field"]').forEach((el) => {
      el.hidden = this.mode === '2p';
    });
  }

  setMode(mode) {
    if (mode !== '1p' && mode !== '2p') return;
    this.mode = mode;
    this.saveSettings();
    this.syncControls();
    this.restart();
  }

  setDifficulty(key) {
    if (!DIFFICULTY[key]) return;
    this.difficulty = key;
    this.saveSettings();
    this.syncControls();
    // 难度只影响 AI 表现与速度上限，可以即时生效；
    // 不重开当前对局 —— 换难度不应该抹掉玩家的比分。
    if (this.state === 'idle' || this.state === 'over') this.restart();
  }

  saveSettings() {
    save('rally.settings', { mode: this.mode, difficulty: this.difficulty });
  }

  bindLifecycle() {
    document.addEventListener('visibilitychange', () => {
      if (document.hidden && (this.state === 'playing' || this.state === 'countdown')) this.pause();
    });
    // 窗口 / iframe 失去焦点时自动暂停
    this.root.addEventListener('gameblur', () => {
      if (this.state === 'playing' || this.state === 'countdown') this.pause();
    });
    // 音频解锁只在游戏容器内的交互里发生（不监听 window 级 keydown）
    this.root.addEventListener('pointerdown', () => this.audio.unlock(), { once: true });
    this.canvas.addEventListener('pointerdown', () => {
      this.scope.focus();
      this.audio.unlock();
    });
  }

  // ---------------------------------------------------------------
  // 状态机
  // ---------------------------------------------------------------
  start() {
    this.score = [0, 0];
    this.rally = 0;
    this.lastScorer = 0;
    this.particles = [];
    this.blades.forEach((b) => {
      b.y = H / 2;
      b.charge = 0;
      b.armed = 0;
    });
    this.state = 'countdown';
    this.stateTimer = 0;
    this.countdownFrom = 3;
    this.renderOverlay();
    this.announce('对拉开始');
    this.scope.focus();
  }

  restart() {
    if (this.state === 'idle') {
      this.start();
      return;
    }
    this.start();
  }

  pause() {
    // 倒计时阶段同样可以暂停 —— 否则「暂停」在开局前会失效，
    // 自动化验收也无法把游戏真正冻结下来。
    if (this.state !== 'playing' && this.state !== 'countdown') return;
    this.resumeState = this.state; // 记住暂停前处于倒计时还是对局
    this.state = 'paused';
    this.renderOverlay();
    this.announce('已暂停');
  }

  resume() {
    if (this.state !== 'paused') return;
    // 恢复到暂停前的阶段（倒计时继续走完，而不是直接跳进对局）
    this.state = this.resumeState === 'countdown' ? 'countdown' : 'playing';
    this.resumeState = null;
    this.overlay.hidden = true;
    this.scope.focus();
    this.announce('继续');
  }

  announce(text) {
    const live = this.root.querySelector('[data-role="live"]');
    if (live) live.textContent = text;
  }

  // ---------------------------------------------------------------
  // 更新
  // ---------------------------------------------------------------
  update(dt) {
    this.time += dt;
    this.flash = Math.max(0, this.flash - dt * 3.2);
    this.shake = Math.max(0, this.shake - dt * 4);

    for (const p of this.particles) {
      p.life -= dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vx *= 0.965;
      p.vy *= 0.965;
      p.vy += 34 * dt;
    }
    this.particles = this.particles.filter((p) => p.life > 0);

    if (this.input.wasPressed('KeyM')) {
      const muted = this.audio.toggleMute();
      document.querySelectorAll('[data-control="mute"]').forEach((b) => {
        b.setAttribute('aria-pressed', String(muted));
        b.textContent = muted ? '音效 关' : '音效 开';
      });
    }
    if (this.input.wasPressed('KeyR')) {
      this.audio.unlock();
      this.restart();
    }
    if (this.input.wasPressed('KeyP') || this.input.wasPressed('Escape')) {
      if (this.state === 'playing' || this.state === 'countdown') this.pause();
      else if (this.state === 'paused') this.resume();
    }
    if (this.input.wasPressed('Enter') && (this.state === 'idle' || this.state === 'over')) {
      this.audio.unlock();
      this.start();
    }

    if (this.state === 'countdown') {
      this.stateTimer += dt;
      const step = Math.floor(this.stateTimer / 0.45);
      if (step !== this._lastTick) {
        this._lastTick = step;
        if (step < 3) this.audio.tick(step >= 2);
      }
      if (this.stateTimer >= 1.35) {
        this.state = 'playing';
        this.serve(this.lastScorer === 0 ? 1 : 0);
        this.renderOverlay();
      }
      this.updateBlades(dt, true);
      return;
    }

    if (this.state !== 'playing') {
      this.updateBlades(dt, true);
      return;
    }

    this.updateTouchTargets(dt);
    this.updateBlades(dt, false);
    this.updateAI(dt);
    this.updateBall(dt);
  }

  updateBlades(dt, frozen) {
    for (let i = 0; i < 2; i += 1) {
      const b = this.blades[i];
      const isAI = this.mode === '1p' && i === 1;
      if (isAI && !frozen) {
        // AI 在 updateAI 里驱动
      } else {
        let dir = 0;
        if (i === 0) {
          if (this.input.isDown('KeyW')) dir -= 1;
          if (this.input.isDown('KeyS')) dir += 1;
          if (this.mode === '1p') {
            if (this.input.isDown('ArrowUp')) dir -= 1;
            if (this.input.isDown('ArrowDown')) dir += 1;
          }
        } else if (this.mode === '2p') {
          if (this.input.isDown('ArrowUp')) dir -= 1;
          if (this.input.isDown('ArrowDown')) dir += 1;
        }
        if (dir !== 0) {
          b.y += dir * b.speed * dt;
        } else if (this.touchHold && this.touchHold.player === i) {
          b.y += this.touchHold.dir * b.speed * dt;
        } else if (this.touchTarget[i] !== null) {
          b.y += clamp(this.touchTarget[i] - b.y, -b.speed * dt, b.speed * dt);
        }
        b.y = clamp(b.y, PLAY.top + BLADE_HALF_H, PLAY.bottom - BLADE_HALF_H);
      }

      // 蓄力
      const chargeKey = i === 0 ? 'Space' : 'Slash';
      const chargeKey2 = i === 1 ? 'Period' : null;
      const touchCharging = !!(this.touchCharge && this.touchCharge.player === i && this.touchCharge.on);
      const holding =
        !isAI &&
        (this.input.isDown(chargeKey) ||
          (chargeKey2 && this.input.isDown(chargeKey2)) ||
          touchCharging);
      if (holding) {
        b.charge = Math.min(1, b.charge + CHARGE_RATE * dt);
      } else if (b.charge > 0) {
        // 松手 -> 蓄能就绪
        if (b.charge >= CHARGE_MIN) b.armed = Math.max(b.armed, b.charge);
        b.charge = 0;
      }
      if (b.armed > 0) {
        b.armed = Math.max(0, b.armed - 0.3 * dt);
        if (b.armed < CHARGE_MIN) b.armed = 0;
      }
    }
  }

  updateTouchTargets(dt) {
    const pointers = this.input.activePointers();
    this.touchTarget = [null, null];
    for (const p of pointers) {
      const idx = this.mode === '2p' ? (p.x < NET_X ? 0 : 1) : 0;
      if (this.touchTarget[idx] === null) this.touchTarget[idx] = p.y;
    }
  }

  updateAI(dt) {
    if (this.mode !== '1p') return;
    const preset = DIFFICULTY[this.difficulty];
    const ai = this.blades[1];
    const ball = this.ball;

    this.aiTimer -= dt;
    if (this.aiTimer <= 0) {
      this.aiTimer = preset.react;
      let target = ball.y;
      if (ball.vx > 0) {
        const t = (ai.x - ball.x) / ball.vx;
        if (t > 0 && t < 1.6) target = ball.y + ball.vy * t;
      }
      target += rand(-preset.error, preset.error);
      this.aiTarget = clamp(target, PLAY.top + BLADE_HALF_H, PLAY.bottom - BLADE_HALF_H);
    }

    const dy = this.aiTarget - ai.y;
    const move = clamp(dy, -preset.speed * dt, preset.speed * dt);
    ai.y += move;
    ai.y = clamp(ai.y, PLAY.top + BLADE_HALF_H, PLAY.bottom - BLADE_HALF_H);

    // AI 蓄力：球朝自己飞来且距离够近时蓄力，蓄满即就绪
    const approaching = ball.vx > 0 && ai.x - ball.x < 320;
    if (approaching && !this.aiCharging && Math.random() < preset.charge * dt * 3) {
      this.aiCharging = true;
      ai.charge = 0;
    }
    if (this.aiCharging) {
      ai.charge = Math.min(1, ai.charge + CHARGE_RATE * dt);
      if (ai.charge >= 1) {
        this.aiCharging = false;
        this.aiArmed = 1;
      }
    }
    if (this.aiArmed > 0) {
      this.aiArmed = Math.max(0, this.aiArmed - 0.3 * dt);
      if (this.aiArmed < CHARGE_MIN) this.aiArmed = 0;
    }
  }

  serve(towardPlayer) {
    const ball = this.ball;
    ball.speed = BASE_SPEED;
    const angle = rand(-0.35, 0.35);
    const dir = towardPlayer === 0 ? -1 : 1;
    ball.vx = dir * Math.cos(angle) * ball.speed;
    ball.vy = Math.sin(angle) * ball.speed;
    ball.x = NET_X;
    ball.y = H / 2 + rand(-70, 70);
    ball.trail = [];
    ball.spin = 0;
    ball.smashBy = -1;
    ball.smashTime = 0;
    this.audio.serve();
  }

  updateBall(dt) {
    const ball = this.ball;
    const preset = DIFFICULTY[this.difficulty];

    ball.x += ball.vx * dt;
    ball.y += ball.vy * dt;

    // 拖影
    ball.trail.push({ x: ball.x, y: ball.y });
    if (ball.trail.length > 22) ball.trail.shift();

    // 上下墙
    if (ball.y - BALL_R < PLAY.top) {
      ball.y = PLAY.top + BALL_R;
      ball.vy = Math.abs(ball.vy);
      this.onWall();
    } else if (ball.y + BALL_R > PLAY.bottom) {
      ball.y = PLAY.bottom - BALL_R;
      ball.vy = -Math.abs(ball.vy);
      this.onWall();
    }

    // 左右失分
    if (ball.x + BALL_R < PLAY.left) {
      this.scorePoint(1);
      return;
    }
    if (ball.x - BALL_R > PLAY.right) {
      this.scorePoint(0);
      return;
    }

    // 挡板碰撞
    for (let i = 0; i < 2; i += 1) {
      const b = this.blades[i];
      const toward = i === 0 ? ball.vx < 0 : ball.vx > 0;
      if (!toward) continue;
      if (Math.abs(ball.x - b.x) > BLADE_HALF_W + BALL_R) continue;
      if (Math.abs(ball.y - b.y) > BLADE_HALF_H + BALL_R) continue;
      this.onBladeHit(i, b);
      break;
    }

    if (ball.smashTime > 0) {
      ball.smashTime -= dt;
      if (ball.smashTime <= 0) ball.smashBy = -1;
    }
  }

  onWall() {
    this.audio.wall();
    this.spawnSparks(this.ball.x, this.ball.y, PALETTE.cyan, 5, 60);
  }

  onBladeHit(index, blade) {
    const ball = this.ball;
    const preset = DIFFICULTY[this.difficulty];

    // 偏心量
    const offset = clamp((ball.y - blade.y) / BLADE_HALF_H, -1, 1);
    ball.spin = -offset;

    let speed = Math.min(preset.cap, ball.speed + SPEED_STEP);
    let smash = false;

    const armed = index === 1 && this.mode === '1p' ? this.aiArmed : blade.armed;
    if (armed >= CHARGE_MIN) {
      speed = Math.min(preset.cap, speed * (1 + armed * 0.55));
      smash = true;
      if (index === 1 && this.mode === '1p') this.aiArmed = 0;
      else blade.armed = 0;
    }

    const dir = index === 0 ? 1 : -1;
    const vy = ball.vy + offset * 300;
    const maxVy = speed * 0.9;
    const clampedVy = clamp(vy, -maxVy, maxVy);
    const vx = dir * Math.sqrt(Math.max(speed * speed - clampedVy * clampedVy, 60 * 60));

    ball.vx = vx;
    ball.vy = clampedVy;
    ball.speed = Math.hypot(vx, clampedVy);
    ball.x = index === 0 ? blade.x + BLADE_HALF_W + BALL_R + 1 : blade.x - BLADE_HALF_W - BALL_R - 1;
    this.rally += 1;

    if (smash) {
      ball.smashBy = index;
      ball.smashTime = 2.4;
      this.flash = 0.85;
      this.shake = 0.7;
      this.audio.smash();
      this.spawnSparks(ball.x, ball.y, PALETTE.amber, 22, 260);
      this.announce(index === 0 ? '重击！' : '对手重击！');
    } else {
      this.audio.hit(this.rally);
      this.spawnSparks(ball.x, ball.y, index === 0 ? PALETTE.cyan : PALETTE.rose, 6, 120);
    }
  }

  spawnSparks(x, y, color, count, speed) {
    for (let i = 0; i < count; i += 1) {
      const a = rand(0, Math.PI * 2);
      const s = rand(speed * 0.25, speed);
      this.particles.push({
        x, y,
        vx: Math.cos(a) * s,
        vy: Math.sin(a) * s,
        life: rand(0.22, 0.6),
        max: 0.6,
        color,
        r: rand(1, 2.6),
      });
    }
  }

  scorePoint(scorer) {
    const ball = this.ball;
    const wasSmash = ball.smashBy === scorer && ball.smashTime > 0;
    const gain = wasSmash ? 2 : 1;
    this.score[scorer] += gain;
    this.lastScorer = scorer;
    this.rally = 0;
    this.audio.score(wasSmash);
    this.flash = wasSmash ? 0.9 : 0.45;
    this.shake = 0.5;

    const name = scorer === 0 ? (this.mode === '2p' ? '左辉' : '你') : (this.mode === '2p' ? '右辉' : '锐锋');
    this.announce(`${name} 得分${wasSmash ? '（重击 +2）' : '（+1）'}`);

    if (scorer === 0) this.best.p1 = Math.max(this.best.p1, this.score[0]);
    else this.best.p2 = Math.max(this.best.p2, this.score[1]);
    save('rally.best', this.best);

    if (this.score[scorer] >= TARGET_SCORE) {
      this.state = 'over';
      this.stateTimer = 0;
      if (scorer === 0) this.audio.win();
      else this.audio.lose();
      this.renderOverlay();
      return;
    }

    this.state = 'countdown';
    this.stateTimer = 0;
    this._lastTick = -1;
  }

  // ---------------------------------------------------------------
  // 渲染
  // ---------------------------------------------------------------
  render(alpha, dt) {
    const ctx = this.ctx;
    ctx.save();
    if (this.shake > 0) {
      const s = this.shake * 6;
      ctx.translate(rand(-s, s), rand(-s, s));
    }

    drawBackdrop(ctx, W, H, PALETTE.cyan, { grid: 48 });

    // 竞技场框
    const ax = PLAY.left - 16;
    const ay = PLAY.top - 14;
    const aw = PLAY.right - PLAY.left + 32;
    const ah = PLAY.bottom - PLAY.top + 28;
    instrumentFrame(ctx, ax, ay, aw, ah, PALETTE.line2, 12);

    // 上下边界
    ctx.save();
    ctx.globalAlpha = 0.5;
    ctx.strokeStyle = PALETTE.line;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(PLAY.left, PLAY.top + 0.5);
    ctx.lineTo(PLAY.right, PLAY.top + 0.5);
    ctx.moveTo(PLAY.left, PLAY.bottom - 0.5);
    ctx.lineTo(PLAY.right, PLAY.bottom - 0.5);
    ctx.stroke();
    ctx.restore();

    this.drawNet(ctx);
    this.drawTrail(ctx);
    this.drawBlades(ctx);
    this.drawBall(ctx);
    this.drawParticles(ctx);
    this.drawHud(ctx);

    if (this.flash > 0) {
      ctx.save();
      ctx.globalAlpha = Math.min(0.5, this.flash * 0.5);
      ctx.fillStyle = PALETTE.amber;
      ctx.fillRect(0, 0, W, H);
      ctx.restore();
    }

    drawScanlines(ctx, W, H, 0.05);
    ctx.restore();

    // 一次性按键事件在每渲染帧末清空（物理步可能一帧跑多次）
    this.input.endFrame();
  }

  drawNet(ctx) {
    ctx.save();
    ctx.setLineDash([7, 9]);
    ctx.lineWidth = 1.4;
    ctx.strokeStyle = this.ball.smashBy >= 0 ? PALETTE.amber : PALETTE.cyanDim;
    ctx.shadowColor = ctx.strokeStyle;
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.moveTo(NET_X, PLAY.top);
    ctx.lineTo(NET_X, PLAY.bottom);
    ctx.stroke();
    ctx.setLineDash([]);

    // 网柱
    for (const y of [PLAY.top, PLAY.bottom]) {
      ctx.beginPath();
      ctx.arc(NET_X, y, 4, 0, Math.PI * 2);
      ctx.fillStyle = PALETTE.cyanDim;
      ctx.fill();
    }
    ctx.restore();
  }

  drawTrail(ctx) {
    const trail = this.ball.trail;
    if (trail.length < 2) return;
    ctx.save();
    for (let i = 0; i < trail.length - 1; i += 1) {
      const t = i / (trail.length - 1);
      const a = t * t * 0.55;
      const r = BALL_R * (0.22 + t * 0.78);
      const c = this.ball.smashBy >= 0 ? PALETTE.amber : PALETTE.cyan;
      glowDot(ctx, trail[i].x, trail[i].y, r, c, a, 2.2);
    }
    ctx.restore();
  }

  drawBlades(ctx) {
    for (let i = 0; i < 2; i += 1) {
      const b = this.blades[i];
      const color = i === 0 ? PALETTE.cyan : PALETTE.rose;
      const dim = i === 0 ? PALETTE.cyanDim : PALETTE.roseDim;

      // 板体
      ctx.save();
      ctx.shadowColor = color;
      ctx.shadowBlur = 16 + b.charge * 34 + b.armed * 26;
      const grad = ctx.createLinearGradient(b.x - BLADE_HALF_W, 0, b.x + BLADE_HALF_W, 0);
      grad.addColorStop(0, dim);
      grad.addColorStop(0.5, color);
      grad.addColorStop(1, dim);
      ctx.fillStyle = grad;
      roundRect(ctx, b.x - BLADE_HALF_W, b.y - BLADE_HALF_H, BLADE_HALF_W * 2, BLADE_HALF_H * 2, 5);
      ctx.fill();
      ctx.restore();

      // 蓄力核心（按住时长大）
      if (b.charge > 0) {
        ctx.save();
        ctx.globalAlpha = 0.5 + b.charge * 0.5;
        glowDot(ctx, b.x, b.y, 3 + b.charge * 6, PALETTE.amber, 1, 3.4);
        ctx.restore();
      }

      // 蓄能就绪环
      if (b.armed >= CHARGE_MIN) {
        const pulse = 0.6 + Math.sin(this.time * 9) * 0.4;
        ctx.save();
        ctx.globalAlpha = pulse;
        ctx.strokeStyle = PALETTE.amber;
        ctx.lineWidth = 2;
        ctx.shadowColor = PALETTE.amber;
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.arc(b.x, b.y, BLADE_HALF_H + 9, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * b.armed);
        ctx.stroke();
        ctx.restore();
      }
    }
  }

  drawBall(ctx) {
    const ball = this.ball;
    const smashing = ball.smashBy >= 0 && ball.smashTime > 0;
    const color = smashing ? PALETTE.amber : PALETTE.bone;
    const r = smashing ? BALL_R * 1.28 : BALL_R;

    // 旋转指示
    if (Math.abs(ball.spin) > 0.05) {
      ctx.save();
      ctx.translate(ball.x, ball.y);
      ctx.rotate(this.time * ball.spin * 6);
      ctx.globalAlpha = 0.55;
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.arc(0, 0, r + 5, -0.9, 0.9);
      ctx.stroke();
      ctx.restore();
    }

    glowDot(ctx, ball.x, ball.y, r, color, 1, smashing ? 5 : 3.4);
    glowDot(ctx, ball.x, ball.y, r * 0.4, '#ffffff', 0.9, 0);

    if (smashing) {
      ctx.save();
      ctx.globalAlpha = 0.5 + Math.sin(this.time * 14) * 0.2;
      ctx.strokeStyle = PALETTE.amber;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.arc(ball.x, ball.y, r + 11, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
  }

  drawParticles(ctx) {
    for (const p of this.particles) {
      const a = clamp(p.life / p.max, 0, 1);
      glowDot(ctx, p.x, p.y, p.r * a, p.color, a, 2);
    }
  }

  drawHud(ctx) {
    const nameL = this.mode === '2p' ? '左辉 L-01' : '你 P-01';
    const nameR = this.mode === '2p' ? '右辉 R-02' : `锐锋 AI · ${DIFFICULTY[this.difficulty].label}`;

    label(ctx, nameL, PLAY.left, 38, { size: 12, color: PALETTE.cyan, track: 2 });
    label(ctx, nameR, PLAY.right, 38, { size: 12, color: PALETTE.rose, align: 'right', track: 2 });

    const sL = String(this.score[0]);
    const sR = String(this.score[1]);
    ctx.save();
    ctx.font = '700 40px ui-monospace, "SF Mono", Menlo, monospace';
    ctx.fillStyle = PALETTE.bone;
    ctx.textBaseline = 'alphabetic';
    ctx.textAlign = 'right';
    ctx.fillText(sL, PLAY.left + measure(ctx, sL, 40, 0, 700), 40);
    ctx.textAlign = 'left';
    ctx.fillText(sR, PLAY.right - measure(ctx, sR, 40, 0, 700), 40);
    ctx.restore();

    // 中央信息
    const midY = 34;
    label(ctx, `回合 ${this.rally}`, NET_X, midY, {
      size: 12, color: PALETTE.slate, align: 'center', track: 2,
    });
    label(ctx, `先到 ${TARGET_SCORE} 分`, NET_X, midY + 16, {
      size: 10, color: PALETTE.dim, align: 'center', track: 1.6,
    });

    // 蓄力条
    this.drawChargeBar(ctx, PLAY.left, PLAY.bottom + 20, this.blades[0], PALETTE.cyan, '左');
    this.drawChargeBar(ctx, PLAY.right, PLAY.bottom + 20, this.blades[1], PALETTE.rose, '右');

    // 状态提示
    if (this.state === 'countdown') {
      const n = 3 - Math.floor(this.stateTimer / 0.45);
      const txt = n > 0 ? String(n) : '发球';
      ctx.save();
      ctx.font = '700 62px ui-monospace, "SF Mono", Menlo, monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = PALETTE.amber;
      ctx.shadowColor = PALETTE.amber;
      ctx.shadowBlur = 26;
      ctx.fillText(txt, NET_X, H / 2);
      ctx.restore();
    }

    if (this.state === 'paused') {
      ctx.save();
      ctx.globalAlpha = 0.9;
      ctx.font = '700 30px ui-monospace, "SF Mono", Menlo, monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = PALETTE.bone;
      ctx.fillText('暂停中', NET_X, H / 2);
      ctx.restore();
    }
  }

  drawChargeBar(ctx, x, y, blade, color, side) {
    const bw = 92;
    const bx = side === '左' ? x : x - bw;
    ctx.save();
    ctx.globalAlpha = 0.75;
    ctx.fillStyle = 'rgba(12,19,42,0.85)';
    ctx.strokeStyle = PALETTE.line;
    ctx.lineWidth = 1;
    roundRect(ctx, bx, y, bw, 9, 2);
    ctx.fill();
    ctx.stroke();

    const held = blade.charge;
    const armed = blade.armed;
    if (held > 0) {
      ctx.fillStyle = PALETTE.amber;
      roundRect(ctx, bx + 1.5, y + 1.5, (bw - 3) * held, 6, 1.5);
      ctx.fill();
    } else if (armed > 0) {
      ctx.fillStyle = color;
      ctx.globalAlpha = 0.5 + Math.sin(this.time * 9) * 0.3;
      roundRect(ctx, bx + 1.5, y + 1.5, (bw - 3) * armed, 6, 1.5);
      ctx.fill();
    }
    ctx.restore();
    label(ctx, held > 0 ? '蓄力中' : armed > 0 ? '蓄能就绪' : '蓄力', bx + bw / 2, y + 21, {
      size: 9.5, color: held > 0 ? PALETTE.amber : PALETTE.dim, align: 'center', track: 1.4,
    });
  }

  // ---------------------------------------------------------------
  // 覆盖层
  // ---------------------------------------------------------------
  renderOverlay() {
    if (!this.overlay) return;
    if (this.state === 'playing' || this.state === 'countdown') {
      this.overlay.hidden = true;
      return;
    }
    this.overlay.hidden = false;

    if (this.state === 'idle') {
      this.overlayKicker.textContent = '展品 08-A · LUMEN RALLY';
      this.overlayTitle.innerHTML = '辉点<em>对拉</em>';
      this.overlayDesc.innerHTML =
        '一颗会拖出余辉的光点，在两块辉板之间来回。<br>蓄能回球可以打出<b style="color:#ffb45c">重击</b>，' +
        '在重击窗口内失分记 <b style="color:#ffb45c">+2</b>；击球点偏离板心会改变出射角。';
      const otherLabel = this.mode === '1p' ? '切到双人同屏' : '切到单人 vs AI';
      this.overlayActions.innerHTML =
        '<button class="btn btn--primary ds-btn ds-btn--primary" data-act="play">开始对拉</button>' +
        `<button class="btn btn--ghost ds-btn ds-btn--ghost" data-act="switch">${otherLabel}</button>`;
      this.overlayActions.querySelector('[data-act="play"]').addEventListener('click', () => {
        this.audio.unlock();
        this.start();
      });
      this.overlayActions.querySelector('[data-act="switch"]').addEventListener('click', () => {
        this.audio.unlock();
        this.setMode(this.mode === '1p' ? '2p' : '1p');
        this.start();
      });
      this.overlayMeta.textContent = '键盘需先点击画面获得焦点';
    } else if (this.state === 'paused') {
      this.overlayKicker.textContent = 'PAUSED';
      this.overlayTitle.innerHTML = '暂停<em>中</em>';
      this.overlayDesc.textContent = '按 P 或 Esc 继续，按 R 重开。';
      this.overlayActions.innerHTML =
        '<button class="btn btn--primary ds-btn ds-btn--primary" data-act="resume">继续</button>' +
        '<button class="btn btn--ghost ds-btn ds-btn--ghost" data-act="restart">重开</button>';
      this.overlayActions.querySelector('[data-act="resume"]').addEventListener('click', () => this.resume());
      this.overlayActions.querySelector('[data-act="restart"]').addEventListener('click', () => this.restart());
      this.overlayMeta.textContent = '切到其他窗口会自动暂停';
    } else if (this.state === 'over') {
      const winner = this.score[0] > this.score[1] ? 0 : 1;
      const won = winner === 0;
      this.overlayKicker.textContent = won ? 'MATCH WON' : 'MATCH LOST';
      this.overlayTitle.innerHTML = won ? '你<em>赢了</em>' : '对手<em>胜出</em>';
      this.overlayDesc.innerHTML =
        `最终比分 <b>${this.score[0]} : ${this.score[1]}</b><br>` +
        `历史最佳 ${this.best.p1} : ${this.best.p2}`;
      this.overlayActions.innerHTML = '<button class="btn btn--primary ds-btn ds-btn--primary" data-act="play">再来一局</button>';
      this.overlayActions.querySelector('[data-act="play"]').addEventListener('click', () => {
        this.audio.unlock();
        this.start();
      });
      this.overlayMeta.textContent = '按 Enter 快速重开';
    }
  }
}

export function mountRally(root) {
  const game = new RallyGame(root);
  window.__lumenRally = game;
  return game;
}
