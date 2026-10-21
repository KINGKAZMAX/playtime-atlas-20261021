/**
 * 展品 08-B —— 引力双星 / GRAVITY DUO
 *
 * 机制谱系：Spacewar! (1962) 的「在引力井中缠斗、燃料有限、松手仍保持惯性」
 *            → Asteroids (1979) 的矢量飞船旋转 / 推进操作。
 * 本作在此之上加入三条原创规则：
 *   1. 光迹尾迹 —— 每艘飞船都会留下光带；撞到对手的光带会灼伤自己，
 *      也就是说「你的尾迹就是你的武器」，也因此成为对手的目标；
 *   2. 相位脉冲 —— 有限次数的冲击波，用来炸掉威胁自己的那条尾迹；
 *   3. 三重引力 —— 中央核心引力 + 两船互相引力 + 燃料限制下的推进。
 *
 * 全部美术为 Canvas 程序化绘制，音效为 WebAudio 实时合成，无外部资源。
 */

import {
  PALETTE,
  createSurface,
  dimFor,
  drawBackdrop,
  drawScanlines,
  glowDot,
  instrumentFrame,
  label,
} from '../core/gfx.js';
import { Loop, clamp, rand } from '../core/loop.js';
import { FocusScope } from '../core/focus.js';
import { InputState } from '../core/input.js';
import { AudioKit } from '../core/audio.js';
import { load, save } from '../core/storage.js';

const W = 960;
const H = 540;
const ARENA = { cx: 480, cy: 282, r: 214 };
const CORE_R = 34;
const CRAFT_R = 9;

const G_CORE = 2.2e6; // 核心引力常数（软化到 55px）
const G_MUTUAL = 6e5; // 两船互相引力常数
const THRUST = 175;
const TURN_RATE = 3.4;
const DRAG = 0.11;
const MAX_SPEED = 430;
const FUEL_MAX = 100;
const FUEL_BURN = 30; // 每秒推进消耗
const FUEL_REGEN = 13; // 每秒再生
const INTEGRITY_MAX = 100;
const BURN_DAMAGE = 24;
const BURN_SCORE = 3;
const BURST_MAX = 3;
const BURST_RECHARGE = 6.5;
const BURST_RADIUS = 172;
const TRAIL_STEP = 4;
const INVULN = 1.25;

const DIFFICULTY = {
  rookie: { label: '微轨', react: 0.34, angleError: 0.5, trailLen: 180, gravity: 0.82, burstWill: 0.4 },
  steady: { label: '稳轨', react: 0.17, angleError: 0.24, trailLen: 280, gravity: 1.0, burstWill: 0.72 },
  keen: { label: '锐轨', react: 0.06, angleError: 0.07, trailLen: 380, gravity: 1.22, burstWill: 0.96 },
};

const KEY_CODES = [
  'KeyW', 'KeyA', 'KeyS', 'KeyD', 'ArrowUp', 'ArrowLeft', 'ArrowRight', 'ArrowDown',
  'Space', 'Slash', 'Period', 'KeyP', 'Escape', 'KeyR', 'KeyM', 'Enter',
];

export class GravityGame {
  constructor(root) {
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
    this.input = new InputState(this.scope, { codes: KEY_CODES });

    const settings = load('gravity.settings', {}) || {};
    this.mode = settings.mode === '2p' ? '2p' : '1p';
    this.difficulty = DIFFICULTY[settings.difficulty] ? settings.difficulty : 'steady';
    this.best = load('gravity.best', { p1: 0, p2: 0 }) || { p1: 0, p2: 0 };

    this.state = 'idle';
    this.stateTimer = 0;
    this.time = 0;
    this.survivalClock = 0;
    this.flash = 0;
    this.shake = 0;
    this.score = [0, 0];
    this.craft = [this.makeCraft(0, -2.35), this.makeCraft(1, 0.79)];
    this.waves = [];
    this.particles = [];

    this.aiTimer = 0;
    this.aiHeading = 0;
    this.aiThrust = false;
    this.aiBurst = false;
    this.aiTurn = 0;

    this.stick = null;
    this.touchBurst = null;

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

  makeCraft(index, angle) {
    const r = 132;
    return {
      index,
      x: ARENA.cx + Math.cos(angle) * r,
      y: ARENA.cy + Math.sin(angle) * r,
      vx: -Math.sin(angle) * 118,
      vy: Math.cos(angle) * 118,
      angle: angle + Math.PI / 2,
      fuel: FUEL_MAX,
      integrity: INTEGRITY_MAX,
      bursts: BURST_MAX,
      burstClock: 0,
      invuln: 0,
      thrusting: false,
      trail: [],
      trailClock: 0,
    };
  }

  // ---------------------------------------------------------------
  // 控件
  // ---------------------------------------------------------------
  bindControls() {
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
        if (this.state === 'playing') this.pause();
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
    document.querySelectorAll('[data-control="burst"]').forEach((btn) => {
      const player = Number(btn.dataset.player);
      const fire = (e) => {
        e.preventDefault();
        this.audio.unlock();
        this.touchBurst = player;
        this.fireBurst(player);
        this.touchBurst = null;
      };
      btn.addEventListener('pointerdown', fire);
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
    save('gravity.settings', { mode: this.mode, difficulty: this.difficulty });
    this.syncControls();
    this.restart();
  }

  setDifficulty(key) {
    if (!DIFFICULTY[key]) return;
    this.difficulty = key;
    save('gravity.settings', { mode: this.mode, difficulty: this.difficulty });
    this.syncControls();
    this.restart();
  }

  bindLifecycle() {
    document.addEventListener('visibilitychange', () => {
      if (document.hidden && this.state === 'playing') this.pause();
    });
    this.root.addEventListener('gameblur', () => {
      if (this.state === 'playing') this.pause();
    });
    const unlock = () => this.audio.unlock();
    window.addEventListener('pointerdown', unlock, { once: true });
    window.addEventListener('keydown', unlock, { once: true });
    this.canvas.addEventListener('pointerdown', (e) => {
      this.scope.focus();
      this.audio.unlock();
      const rect = this.canvas.getBoundingClientRect();
      const lx = ((e.clientX - rect.left) / rect.width) * W;
      const ly = ((e.clientY - rect.top) / rect.height) * H;
      const player = this.mode === '2p' ? (lx < ARENA.cx ? 0 : 1) : 0;
      this.stick = { player, ox: lx, oy: ly, x: lx, y: ly };
    });
    this.canvas.addEventListener('pointermove', (e) => {
      if (!this.stick) return;
      const rect = this.canvas.getBoundingClientRect();
      this.stick.x = ((e.clientX - rect.left) / rect.width) * W;
      this.stick.y = ((e.clientY - rect.top) / rect.height) * H;
    });
    const dropStick = () => {
      this.stick = null;
    };
    this.canvas.addEventListener('pointerup', dropStick);
    this.canvas.addEventListener('pointercancel', dropStick);
    this.canvas.addEventListener('pointerleave', dropStick);
  }

  // ---------------------------------------------------------------
  // 状态机
  // ---------------------------------------------------------------
  start() {
    this.craft = [this.makeCraft(0, -2.35), this.makeCraft(1, 0.79)];
    this.score = [0, 0];
    this.waves = [];
    this.particles = [];
    this.survivalClock = 0;
    this.state = 'countdown';
    this.stateTimer = 0;
    this._lastTick = -1;
    this.renderOverlay();
    this.announce('对决开始');
    this.scope.focus();
  }

  restart() {
    this.start();
  }

  pause() {
    if (this.state !== 'playing') return;
    this.state = 'paused';
    this.renderOverlay();
    this.announce('已暂停');
  }

  resume() {
    if (this.state !== 'paused') return;
    this.state = 'playing';
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
    this.flash = Math.max(0, this.flash - dt * 3);
    this.shake = Math.max(0, this.shake - dt * 3.6);

    for (const p of this.particles) {
      p.life -= dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vx *= 0.96;
      p.vy *= 0.96;
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
      if (this.state === 'playing') this.pause();
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
        this.renderOverlay();
      }
      this.updateCraft(dt, true);
      return;
    }

    if (this.state !== 'playing') {
      this.updateCraft(dt, true);
      return;
    }

    this.updateCraft(dt, false);
    this.updateAI(dt);
    this.integrate(dt);
    this.updateWaves(dt);
    this.checkTrailCollisions();
    this.checkSurvival(dt);
  }

  updateCraft(dt, frozen) {
    for (let i = 0; i < 2; i += 1) {
      const c = this.craft[i];
      const isAI = this.mode === '1p' && i === 1;
      c.invuln = Math.max(0, c.invuln - dt);
      if (c.burstClock > 0) {
        c.burstClock -= dt;
        if (c.burstClock <= 0) {
          c.burstClock = 0;
          c.bursts = Math.min(BURST_MAX, c.bursts + 1);
        }
      }

      let turn = 0;
      let thrust = false;
      let burst = false;

      if (isAI) {
        if (!frozen) {
          turn = this.aiTurn;
          thrust = this.aiThrust;
          burst = this.aiBurst;
        }
      } else {
        const leftKey = i === 0 ? 'KeyA' : 'ArrowLeft';
        const rightKey = i === 0 ? 'KeyD' : 'ArrowRight';
        const upKey = i === 0 ? 'KeyW' : 'ArrowUp';
        if (this.input.isDown(leftKey)) turn -= 1;
        if (this.input.isDown(rightKey)) turn += 1;
        if (this.input.isDown(upKey)) thrust = true;

        // 单人模式下方向键也归玩家 1
        if (i === 0 && this.mode === '1p') {
          if (this.input.isDown('ArrowLeft')) turn -= 1;
          if (this.input.isDown('ArrowRight')) turn += 1;
          if (this.input.isDown('ArrowUp')) thrust = true;
        }

        if (this.stick && this.stick.player === i) {
          const dx = this.stick.x - this.stick.ox;
          const dy = this.stick.y - this.stick.oy;
          turn = clamp(dx / 46, -1, 1);
          thrust = dy < -18;
        }

        const burstKey = i === 0 ? 'Space' : 'Slash';
        const burstKey2 = i === 1 ? 'Period' : null;
        if (this.input.wasPressed(burstKey) || (burstKey2 && this.input.wasPressed(burstKey2))) {
          burst = true;
        }
        if (this.touchBurst === i) burst = true;
      }

      c.turn = turn;
      c.thrusting = false;

      if (turn !== 0) {
        c.angle += turn * TURN_RATE * dt;
      }

      if (thrust && c.fuel > 0 && !frozen) {
        c.fuel = Math.max(0, c.fuel - FUEL_BURN * dt);
        c.vx += Math.cos(c.angle) * THRUST * dt;
        c.vy += Math.sin(c.angle) * THRUST * dt;
        c.thrusting = true;
        if (Math.random() < 0.35) this.spawnThrust(c);
      } else if (!frozen) {
        c.fuel = Math.min(FUEL_MAX, c.fuel + FUEL_REGEN * dt);
      }

      if (burst && !frozen) this.fireBurst(i);
    }
  }

  integrate(dt) {
    const preset = DIFFICULTY[this.difficulty];
    const gCore = G_CORE * preset.gravity;

    for (const c of this.craft) {
      // 核心引力
      const dx = ARENA.cx - c.x;
      const dy = ARENA.cy - c.y;
      const d2 = Math.max(dx * dx + dy * dy, 55 * 55);
      const d = Math.sqrt(d2);
      c.vx += (gCore / d2) * dx * dt;
      c.vy += (gCore / d2) * dy * dt;
    }

    // 互相引力
    const a = this.craft[0];
    const b = this.craft[1];
    const mdx = b.x - a.x;
    const mdy = b.y - a.y;
    const md2 = Math.max(mdx * mdx + mdy * mdy, 70 * 70);
    const md = Math.sqrt(md2);
    const ma = (G_MUTUAL / md2) * dt;
    a.vx += (ma * mdx) / md;
    a.vy += (ma * mdy) / md;
    b.vx -= (ma * mdx) / md;
    b.vy -= (ma * mdy) / md;

    for (const c of this.craft) {
      // 阻尼
      const damp = Math.exp(-DRAG * dt);
      c.vx *= damp;
      c.vy *= damp;

      const sp = Math.hypot(c.vx, c.vy);
      if (sp > MAX_SPEED) {
        c.vx = (c.vx / sp) * MAX_SPEED;
        c.vy = (c.vy / sp) * MAX_SPEED;
      }

      c.x += c.vx * dt;
      c.y += c.vy * dt;

      // 核心碰撞
      const cdx = c.x - ARENA.cx;
      const cdy = c.y - ARENA.cy;
      const cd = Math.hypot(cdx, cdy);
      const minR = CORE_R + CRAFT_R + 4;
      if (cd < minR && cd > 0.001) {
        const nx = cdx / cd;
        const ny = cdy / cd;
        c.x = ARENA.cx + nx * minR;
        c.y = ARENA.cy + ny * minR;
        const dot = c.vx * nx + c.vy * ny;
        c.vx = (c.vx - 2 * dot * nx) * 0.75;
        c.vy = (c.vy - 2 * dot * ny) * 0.75;
        if (c.invuln <= 0) {
          c.integrity -= 6;
          c.invuln = 0.5;
          this.flash = 0.35;
          this.shake = 0.4;
          this.audio.burn();
          this.spawnSparks(c.x, c.y, PALETTE.amber, 8, 140);
        }
      }

      // 竞技场边界
      const ad = Math.hypot(c.x - ARENA.cx, c.y - ARENA.cy);
      const maxR = ARENA.r - CRAFT_R - 6;
      if (ad > maxR && ad > 0.001) {
        const nx = (c.x - ARENA.cx) / ad;
        const ny = (c.y - ARENA.cy) / ad;
        c.x = ARENA.cx + nx * maxR;
        c.y = ARENA.cy + ny * maxR;
        const dot = c.vx * nx + c.vy * ny;
        if (dot > 0) {
          c.vx = (c.vx - 2 * dot * nx) * 0.82;
          c.vy = (c.vy - 2 * dot * ny) * 0.82;
        }
      }

      // 尾迹采样
      c.trailClock += dt;
      const last = c.trail[c.trail.length - 1];
      if (!last || Math.hypot(c.x - last.x, c.y - last.y) >= TRAIL_STEP) {
        c.trail.push({ x: c.x, y: c.y, born: this.time });
        const maxLen = DIFFICULTY[this.difficulty].trailLen;
        if (c.trail.length > maxLen) c.trail.shift();
      }
    }
  }

  updateWaves(dt) {
    for (let i = this.waves.length - 1; i >= 0; i -= 1) {
      const w = this.waves[i];
      w.t += dt;
      const k = Math.min(1, w.t / 0.45);
      w.r = BURST_RADIUS * k;

      // 摧毁对手尾迹
      const foe = this.craft[1 - w.owner];
      let destroyed = 0;
      for (let j = foe.trail.length - 1; j >= 0; j -= 1) {
        const p = foe.trail[j];
        if (Math.hypot(p.x - w.x, p.y - w.y) <= w.r) {
          foe.trail.splice(j, 1);
          destroyed += 1;
        }
      }
      w.destroyed += destroyed;

      // 推挤对手
      const d = Math.hypot(foe.x - w.x, foe.y - w.y);
      if (d < w.r && d > 0.001) {
        const push = 190 * dt * (1 - d / Math.max(w.r, 1));
        foe.vx += ((foe.x - w.x) / d) * push;
        foe.vy += ((foe.y - w.y) / d) * push;
      }

      if (k >= 1) {
        if (w.destroyed > 0) {
          const gain = Math.max(1, Math.floor(w.destroyed / 10));
          this.score[w.owner] += gain;
          this.announce(`炸毁光迹 +${gain}`);
        }
        this.waves.splice(i, 1);
      }
    }
  }

  fireBurst(index) {
    const c = this.craft[index];
    if (c.bursts <= 0 || this.state !== 'playing') return;
    c.bursts -= 1;
    if (c.burstClock <= 0) c.burstClock = BURST_RECHARGE;
    this.waves.push({ x: c.x, y: c.y, r: 0, t: 0, owner: index, destroyed: 0 });
    this.audio.burst();
    this.spawnSparks(c.x, c.y, index === 0 ? PALETTE.cyan : PALETTE.rose, 16, 220);
  }

  checkTrailCollisions() {
    for (let i = 0; i < 2; i += 1) {
      const c = this.craft[i];
      if (c.invuln > 0) continue;
      const foeTrail = this.craft[1 - i].trail;
      for (let j = foeTrail.length - 1; j >= 0; j -= 1) {
        const p = foeTrail[j];
        if (Math.abs(p.x - c.x) > 40 || Math.abs(p.y - c.y) > 40) continue;
        if (Math.hypot(p.x - c.x, p.y - c.y) < CRAFT_R + 5) {
          foeTrail.splice(j, 1);
          c.integrity -= BURN_DAMAGE;
          c.invuln = INVULN;
          this.score[1 - i] += BURN_SCORE;
          this.flash = 0.8;
          this.shake = 0.7;
          this.audio.burn();
          this.spawnSparks(c.x, c.y, PALETTE.rose, 18, 240);
          this.announce(`${i === 0 ? '青辉' : '朱辉'} 灼伤，${i === 0 ? '朱辉' : '青辉'} +${BURN_SCORE}`);
          break;
        }
      }
      if (c.integrity <= 0) {
        c.integrity = 0;
        this.endRound(1 - i);
        return;
      }
    }
  }

  checkSurvival(dt) {
    this.survivalClock += dt;
    if (this.survivalClock >= 10) {
      this.survivalClock -= 10;
      this.score[0] += 1;
      this.score[1] += 1;
    }
  }

  endRound(winner) {
    this.state = 'over';
    this.stateTimer = 0;
    this.best.p1 = Math.max(this.best.p1, this.score[0]);
    this.best.p2 = Math.max(this.best.p2, this.score[1]);
    save('gravity.best', this.best);
    if (winner === 0) this.audio.win();
    else this.audio.lose();
    this.renderOverlay();
  }

  updateAI(dt) {
    if (this.mode !== '1p') return;
    const preset = DIFFICULTY[this.difficulty];
    const ai = this.craft[1];
    const foe = this.craft[0];

    this.aiTimer -= dt;
    if (this.aiTimer > 0) return;
    this.aiTimer = preset.react;

    // 1) 威胁解除：对手尾迹靠近自己时，用脉冲炸掉
    let threat = null;
    for (const p of foe.trail) {
      if (Math.abs(p.x - ai.x) > 90 || Math.abs(p.y - ai.y) > 90) continue;
      const d = Math.hypot(p.x - ai.x, p.y - ai.y);
      if (d < 78 && (!threat || d < threat.d)) threat = { d, p };
    }
    this.aiBurst = false;
    if (threat && ai.bursts > 0 && Math.random() < preset.burstWill) {
      this.aiBurst = true;
      return;
    }

    // 2) 转向：把机身横切到对手的预测路径前方，让自己的尾迹成为路障
    const t = 0.9;
    const px = foe.x + foe.vx * t;
    const py = foe.y + foe.vy * t;
    let desired = Math.atan2(py - ai.y, px - ai.x);

    // 核心太近时先躲开
    const cd = Math.hypot(ai.x - ARENA.cx, ai.y - ARENA.cy);
    if (cd < CORE_R + 60) {
      desired = Math.atan2(ai.y - ARENA.cy, ai.x - ARENA.cx);
    }

    // 避开自己的尾迹
    for (const p of ai.trail) {
      if (Math.abs(p.x - ai.x) > 60 || Math.abs(p.y - ai.y) > 60) continue;
      const d = Math.hypot(p.x - ai.x, p.y - ai.y);
      if (d < 46 && d > 0.001) {
        desired = Math.atan2(ai.y - p.y, ai.x - p.x);
        break;
      }
    }

    desired += rand(-preset.angleError, preset.angleError);

    let diff = desired - ai.angle;
    while (diff > Math.PI) diff -= Math.PI * 2;
    while (diff < -Math.PI) diff += Math.PI * 2;

    this.aiTurn = clamp(diff * 2.2, -1, 1);
    this.aiThrust = Math.abs(diff) < 1.0 || cd < CORE_R + 60;
  }

  spawnSparks(x, y, color, count, speed) {
    for (let i = 0; i < count; i += 1) {
      const a = rand(0, Math.PI * 2);
      const s = rand(speed * 0.2, speed);
      this.particles.push({
        x, y,
        vx: Math.cos(a) * s,
        vy: Math.sin(a) * s,
        life: rand(0.2, 0.55),
        max: 0.55,
        color,
        r: rand(1, 2.4),
      });
    }
  }

  spawnThrust(c) {
    const back = c.angle + Math.PI;
    this.particles.push({
      x: c.x + Math.cos(back) * 10,
      y: c.y + Math.sin(back) * 10,
      vx: Math.cos(back) * rand(30, 90) + rand(-20, 20),
      vy: Math.sin(back) * rand(30, 90) + rand(-20, 20),
      life: rand(0.12, 0.3),
      max: 0.3,
      color: c.index === 0 ? PALETTE.cyan : PALETTE.rose,
      r: rand(1, 2.2),
    });
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

    drawBackdrop(ctx, W, H, PALETTE.amber, { grid: 40 });

    this.drawArena(ctx);
    this.drawCore(ctx);
    this.drawTrails(ctx);
    this.drawWaves(ctx);
    this.drawCraft(ctx, 0);
    this.drawCraft(ctx, 1);
    this.drawParticles(ctx);
    this.drawHud(ctx);

    if (this.flash > 0) {
      ctx.save();
      ctx.globalAlpha = Math.min(0.42, this.flash * 0.42);
      ctx.fillStyle = PALETTE.rose;
      ctx.fillRect(0, 0, W, H);
      ctx.restore();
    }

    drawScanlines(ctx, W, H, 0.05);
    ctx.restore();

    // 一次性按键事件在每渲染帧末清空（物理步可能一帧跑多次）
    this.input.endFrame();
  }

  drawArena(ctx) {
    ctx.save();
    // 同心轨道参考圈
    ctx.strokeStyle = PALETTE.line;
    ctx.lineWidth = 1;
    for (const r of [70, 132, 194]) {
      ctx.beginPath();
      ctx.arc(ARENA.cx, ARENA.cy, r, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.strokeStyle = PALETTE.line2;
    ctx.lineWidth = 1.5;
    ctx.shadowColor = PALETTE.cyanDim;
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.arc(ARENA.cx, ARENA.cy, ARENA.r, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    instrumentFrame(ctx, 16, 16, W - 32, H - 32, PALETTE.line, 14);
  }

  drawCore(ctx) {
    const { cx, cy } = ARENA;
    const pulse = 1 + Math.sin(this.time * 2.1) * 0.05;
    ctx.save();
    const g = ctx.createRadialGradient(cx, cy, 2, cx, cy, CORE_R * 2.5 * pulse);
    g.addColorStop(0, '#fff6e4');
    g.addColorStop(0.32, PALETTE.amber);
    g.addColorStop(0.72, 'rgba(255,180,92,0.22)');
    g.addColorStop(1, 'rgba(255,180,92,0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(cx, cy, CORE_R * 2.5 * pulse, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = PALETTE.amber;
    ctx.globalAlpha = 0.6;
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.arc(cx, cy, CORE_R + 10 + Math.sin(this.time * 1.6) * 3, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    label(ctx, '核', cx, cy, { size: 12, color: '#2a1607', align: 'center', track: 2 });
  }

  drawTrails(ctx) {
    for (let i = 0; i < 2; i += 1) {
      const c = this.craft[i];
      const color = i === 0 ? PALETTE.cyan : PALETTE.rose;
      const trail = c.trail;
      if (trail.length < 2) continue;
      ctx.save();
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      for (let j = 1; j < trail.length; j += 1) {
        const t = j / trail.length;
        const a = 0.06 + t * t * 0.5;
        ctx.globalAlpha = a;
        ctx.strokeStyle = color;
        ctx.lineWidth = 1 + t * 4.2;
        ctx.shadowColor = color;
        ctx.shadowBlur = 10 * t;
        ctx.beginPath();
        ctx.moveTo(trail[j - 1].x, trail[j - 1].y);
        ctx.lineTo(trail[j].x, trail[j].y);
        ctx.stroke();
      }
      ctx.restore();
    }
  }

  drawWaves(ctx) {
    for (const w of this.waves) {
      const color = w.owner === 0 ? PALETTE.cyan : PALETTE.rose;
      ctx.save();
      ctx.globalAlpha = Math.max(0, 1 - w.t / 0.45);
      ctx.strokeStyle = color;
      ctx.lineWidth = 3;
      ctx.shadowColor = color;
      ctx.shadowBlur = 18;
      ctx.beginPath();
      ctx.arc(w.x, w.y, w.r, 0, Math.PI * 2);
      ctx.stroke();
      ctx.globalAlpha *= 0.4;
      ctx.beginPath();
      ctx.arc(w.x, w.y, w.r * 0.72, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
  }

  drawCraft(ctx, index) {
    const c = this.craft[index];
    const color = index === 0 ? PALETTE.cyan : PALETTE.rose;
    const dim = index === 0 ? PALETTE.cyanDim : PALETTE.roseDim;

    ctx.save();
    ctx.translate(c.x, c.y);
    ctx.rotate(c.angle);

    if (c.thrusting) {
      ctx.save();
      ctx.globalAlpha = 0.75;
      ctx.fillStyle = PALETTE.amber;
      ctx.shadowColor = PALETTE.amber;
      ctx.shadowBlur = 14;
      ctx.beginPath();
      ctx.moveTo(-9, 5);
      ctx.lineTo(-9 - rand(12, 22), 0);
      ctx.lineTo(-9, -5);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }

    ctx.shadowColor = color;
    ctx.shadowBlur = c.invuln > 0 ? 22 : 12;
    ctx.fillStyle = c.invuln > 0 ? dim : color;
    ctx.beginPath();
    ctx.moveTo(15, 0);
    ctx.lineTo(-9, 8);
    ctx.lineTo(-5, 0);
    ctx.lineTo(-9, -8);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // 护盾（无敌帧）
    if (c.invuln > 0) {
      ctx.save();
      ctx.globalAlpha = 0.35 + Math.sin(this.time * 16) * 0.25;
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.arc(c.x, c.y, 18, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    // 脉冲充能指示
    for (let i = 0; i < BURST_MAX; i += 1) {
      const ready = i < c.bursts;
      const px = c.x - 10 + i * 10;
      const py = c.y + 20;
      ctx.save();
      ctx.globalAlpha = ready ? 0.95 : 0.25;
      ctx.fillStyle = ready ? color : PALETTE.dim;
      ctx.beginPath();
      ctx.arc(px, py, 2.6, 0, Math.PI * 2);
      ctx.fill();
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
    this.drawIntegrity(ctx, 0);
    this.drawIntegrity(ctx, 1);

    label(ctx, `比分 ${this.score[0]} : ${this.score[1]}`, ARENA.cx, 34, {
      size: 13, color: PALETTE.bone, align: 'center', track: 2.4,
    });
    label(ctx, '先摧毁对手光能', ARENA.cx, 52, {
      size: 10, color: PALETTE.dim, align: 'center', track: 1.8,
    });

    // 燃料
    this.drawFuel(ctx, 0);
    this.drawFuel(ctx, 1);

    if (this.state === 'countdown') {
      const n = 3 - Math.floor(this.stateTimer / 0.45);
      ctx.save();
      ctx.font = '700 62px ui-monospace, "SF Mono", Menlo, monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = PALETTE.amber;
      ctx.shadowColor = PALETTE.amber;
      ctx.shadowBlur = 26;
      ctx.fillText(n > 0 ? String(n) : '对接', ARENA.cx, ARENA.cy);
      ctx.restore();
    }

    if (this.state === 'paused') {
      ctx.save();
      ctx.font = '700 30px ui-monospace, "SF Mono", Menlo, monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = PALETTE.bone;
      ctx.fillText('暂停中', ARENA.cx, ARENA.cy);
      ctx.restore();
    }
  }

  drawIntegrity(ctx, index) {
    const c = this.craft[index];
    const color = index === 0 ? PALETTE.cyan : PALETTE.rose;
    const left = index === 0;
    const x = left ? 34 : W - 34;
    const w = 186;
    const bx = left ? x : x - w;
    const y = 30;

    label(ctx, left ? '青辉 L-01' : '朱辉 R-02', left ? bx : bx + w, y - 12, {
      size: 11, color, track: 2, align: left ? 'left' : 'right',
    });

    ctx.save();
    ctx.fillStyle = 'rgba(12,19,42,0.85)';
    ctx.strokeStyle = PALETTE.line;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.rect(bx + 0.5, y + 0.5, w - 1, 10);
    ctx.fill();
    ctx.stroke();

    const ratio = clamp(c.integrity / INTEGRITY_MAX, 0, 1);
    const grad = ctx.createLinearGradient(bx, 0, bx + w, 0);
    grad.addColorStop(0, dimFor(color));
    grad.addColorStop(1, color);
    ctx.fillStyle = grad;
    ctx.fillRect(bx + 1.5, y + 1.5, (w - 3) * ratio, 7);
    ctx.restore();

    label(ctx, `${Math.round(c.integrity)}`, bx + w, y + 26, {
      size: 10, color: PALETTE.slate, align: 'right', track: 1.4,
    });
  }

  drawFuel(ctx, index) {
    const c = this.craft[index];
    const left = index === 0;
    const w = 186;
    const bx = left ? 34 : W - 34 - w;
    const y = 66;
    ctx.save();
    ctx.fillStyle = 'rgba(12,19,42,0.8)';
    ctx.strokeStyle = PALETTE.line;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.rect(bx + 0.5, y + 0.5, w - 1, 6);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = c.fuel > 20 ? PALETTE.amber : PALETTE.rose;
    ctx.fillRect(bx + 1.5, y + 1.5, (w - 3) * clamp(c.fuel / FUEL_MAX, 0, 1), 4);
    ctx.restore();
    label(ctx, `燃料 ${Math.round(c.fuel)}`, left ? bx : bx + w, y + 16, {
      size: 10, color: PALETTE.dim, align: left ? 'left' : 'right', track: 1.4,
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
      this.overlayKicker.textContent = '展品 08-B · GRAVITY DUO';
      this.overlayTitle.innerHTML = '引力<em>双星</em>';
      this.overlayDesc.innerHTML =
        '两艘飞船被中央核心与彼此的引力拉扯，在轨道上追逐。<br>' +
        '你的<b style="color:#5ce1e6">光迹</b>就是武器——撞上对手的光迹会灼伤自己。';
      const otherLabel = this.mode === '1p' ? '切到双人同屏' : '切到单人 vs AI';
      this.overlayActions.innerHTML =
        '<button class="btn btn--primary" data-act="play">开始对决</button>' +
        `<button class="btn btn--ghost" data-act="switch">${otherLabel}</button>`;
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
        '<button class="btn btn--primary" data-act="resume">继续</button>' +
        '<button class="btn btn--ghost" data-act="restart">重开</button>';
      this.overlayActions.querySelector('[data-act="resume"]').addEventListener('click', () => this.resume());
      this.overlayActions.querySelector('[data-act="restart"]').addEventListener('click', () => this.restart());
      this.overlayMeta.textContent = '切到其他窗口会自动暂停';
    } else if (this.state === 'over') {
      const winner = this.score[0] > this.score[1] ? 0 : 1;
      const won = winner === 0;
      this.overlayKicker.textContent = won ? 'DUEL WON' : 'DUEL LOST';
      this.overlayTitle.innerHTML = won ? '你<em>胜出</em>' : '对手<em>胜出</em>';
      this.overlayDesc.innerHTML =
        `最终比分 <b>${this.score[0]} : ${this.score[1]}</b><br>` +
        `历史最佳 ${this.best.p1} : ${this.best.p2}`;
      this.overlayActions.innerHTML = '<button class="btn btn--primary" data-act="play">再来一场</button>';
      this.overlayActions.querySelector('[data-act="play"]').addEventListener('click', () => {
        this.audio.unlock();
        this.start();
      });
      this.overlayMeta.textContent = '按 Enter 快速重开';
    }
  }
}

export function mountGravity(root) {
  const game = new GravityGame(root);
  window.__lumenGravity = game;
  return game;
}
