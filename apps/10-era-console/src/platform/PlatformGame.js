/**
 * 10-era-console — 色块远征 / CHROMA VOYAGE
 * 平台冒险主引擎：状态机 + 固定步长物理 + 实体逻辑
 *
 * 机制说明（原创实现）：
 *  - 跳跃带「土狼时间」与「跳跃缓冲」，长按可变高
 *  - 踩敌人可消灭并弹起；侧面接触则判定死亡
 *  - 检查点复活；生命耗尽进入失败结算
 *  - 目标闸门在集齐本关全部色晶后开启
 *  - 三关依次通关进入总胜利结算
 */

import {
  TILE,
  moveAndCollide,
  overlaps,
  touchesHazard,
  isSolid,
  probeGround,
} from './physics.js';
import { buildAllLevels } from './levels.js';
import { Renderer, VIEW_W, VIEW_H } from './renderer.js';

const PHYS = {
  gravity: 0.34,
  maxFall: 7.2,
  runSpeed: 2.1,
  accel: 0.55,
  airAccel: 0.34,
  friction: 0.42,
  jumpVel: -6.0,
  jumpCut: 0.55,
  jumpMinHold: 5,      // 至少按住 5 帧才允许截断，保证"轻点"也能跳起 1 格
  coyoteFrames: 6,
  bufferFrames: 7,
  stompBounce: -4.4,
};

const PLAYER_W = 12;
const PLAYER_H = 16;
const STEP_MS = 1000 / 60;
const MAX_LIVES = 3;

export class PlatformGame {
  /**
   * @param {object} deps
   *   canvas, input, overlay, hud, audio, onExit
   */
  constructor(deps) {
    this.canvas = deps.canvas;
    this.input = deps.input;
    this.overlay = deps.overlay;
    this.hud = deps.hud || {};
    this.audio = deps.audio || null;
    this.onExit = deps.onExit || (() => {});

    this.renderer = new Renderer(this.canvas);
    this.levels = buildAllLevels();

    this.state = 'title';
    this.levelIndex = 0;
    this.level = null;
    this.player = null;
    this.particles = [];
    this.frame = 0;
    this.accumulator = 0;
    this.lastTime = 0;
    this.running = false;
    this.rafId = 0;

    this.run = {
      lives: MAX_LIVES,
      shards: 0,
      totalShards: 0,
      time: 0,
      deaths: 0,
      startedAt: 0,
    };

    this.best = this._loadBest();

    this._loop = this._loop.bind(this);
  }

  /* ---------------------------------------------------------------- *
   * 生命周期
   * ---------------------------------------------------------------- */

  mount() {
    this.running = true;
    this.lastTime = performance.now();
    this.rafId = requestAnimationFrame(this._loop);
    this.showTitle();
  }

  unmount() {
    this.running = false;
    if (this.rafId) cancelAnimationFrame(this.rafId);
    this.rafId = 0;
  }

  destroy() {
    this.unmount();
    this.input?.destroy?.();
  }

  _loop(now) {
    if (!this.running) return;
    this.rafId = requestAnimationFrame(this._loop);
    let dt = now - this.lastTime;
    this.lastTime = now;
    if (dt > 100) dt = 100;
    this.accumulator += dt;
    let guard = 0;
    while (this.accumulator >= STEP_MS && guard < 6) {
      this.update();
      this.accumulator -= STEP_MS;
      guard++;
    }
    if (guard >= 6) this.accumulator = 0;
    this.render();
  }

  /* ---------------------------------------------------------------- *
   * 流程控制
   * ---------------------------------------------------------------- */

  showTitle() {
    this.state = 'title';
    this._loadLevel(0);
    this.run = {
      lives: MAX_LIVES,
      shards: 0,
      totalShards: 0,
      time: 0,
      deaths: 0,
      startedAt: 0,
    };
    this._syncHud();
    this.overlay.show({
      title: '色块远征 · 棱晶峡谷',
      subtitle: 'CHROMA VOYAGE — PRISM GORGE',
      tone: 'mint',
      body: `
        <p>墨豆 INKBEAN 是一台被丢在色块地带的方形勘探机器人。
        它要穿过三段地形，把散落的 <b>9 枚色晶</b> 带回跃迁塔。</p>
        <ul class="ov-list">
          <li><b>方向</b> ← → / A D　<b>跳跃</b> 空格 / ↑ / W</li>
          <li><b>重开本关</b> R　<b>返回展厅</b> Esc</li>
          <li>触屏设备：使用画面下方的虚拟按键</li>
          <li>踩中敌人可以消灭它；从侧面碰到会失去一条命</li>
        </ul>
        <p class="ov-note">每一关都有 3 枚色晶，<b>集齐后跃迁塔才会开启</b>。</p>
      `,
      actions: [
        { id: 'start', label: '开始远征', primary: true, onClick: () => this.startRun() },
        { id: 'back', label: '返回展厅', onClick: () => this.onExit() },
      ],
    });
  }

  startRun() {
    this.run = {
      lives: MAX_LIVES,
      shards: 0,
      totalShards: 0,
      time: 0,
      deaths: 0,
      startedAt: performance.now(),
    };
    this._loadLevel(0);
    this.state = 'playing';
    this.overlay.hide();
    this.audio?.playMusic(this._levelTrack());
    this._syncHud();
  }

  restartLevel() {
    if (!this.level) return;
    this._loadLevel(this.levelIndex, { keepLives: true });
    this.state = 'playing';
    this.overlay.hide();
    this.audio?.playMusic(this._levelTrack());
    this._syncHud();
  }

  _levelTrack() {
    const map = { dawn: 'dawn', ladder: 'ladder', forge: 'forge' };
    return map[this.level?.id] || 'hall';
  }

  /** 载入关卡（重置该关内的实体与收集状态） */
  _loadLevel(index, { keepLives = false } = {}) {
    this.levelIndex = index;
    const def = this.levels[index];
    // 深拷贝实体，避免上一局的收集状态残留
    this.level = {
      ...def,
      grid: def.grid,
      goal: { ...def.goal },
      shards: def.shards.map((s) => ({ ...s, collected: false })),
      checkpoints: def.checkpoints.map((c) => ({ ...c, activated: false })),
      enemies: def.enemies.map((e) => ({ ...e, dead: false })),
      movers: def.movers.map((m) => ({ ...m, dx: 0, dy: 0 })),
    };

    const spawn = this.level.spawn;
    this.player = {
      x: spawn.x,
      y: spawn.y,
      w: PLAYER_W,
      h: PLAYER_H,
      vx: 0,
      vy: 0,
      onGround: false,
      facing: 1,
      coyote: 0,
      buffer: 0,
      jumpHold: 0,
      invuln: 0,
      animTime: 0,
      sprite: 'idle',
      riding: null,
      spawnX: spawn.x,
      spawnY: spawn.y,
    };

    this.particles = [];
    this.cameraX = 0;
    this._updateCamera(true);
    if (!keepLives) this.run.shards = 0;
    this.run.totalShards = this.level.shards.length;
    this._syncHud();
  }

  /* ---------------------------------------------------------------- *
   * 主更新
   * ---------------------------------------------------------------- */

  update() {
    this.frame++;
    if (this.state === 'playing') {
      if (this.input?.justPressed('back')) {
        this.onExit();
        return;
      }
      this.run.time += STEP_MS / 1000;
      this._updatePlayer();
      this._updateMovers();
      this._updateEnemies();
      this._updatePickups();
      this._updateParticles();
      this._updateCamera();
      this._syncHud();
    } else if (this.state === 'dying') {
      this._updateParticles();
      this.dyingTimer -= 1;
      if (this.dyingTimer <= 0) this._afterDeath();
    } else {
      this._updateParticles();
    }
    this.input?.endFrame();
  }

  /* -------------------------- 玩家 -------------------------- */

  _updatePlayer() {
    const p = this.player;
    const inp = this.input;

    // ---- 输入 ----
    const left = inp.isDown('left');
    const right = inp.isDown('right');
    const dir = (right ? 1 : 0) - (left ? 1 : 0);

    if (dir !== 0) {
      const accel = p.onGround ? PHYS.accel : PHYS.airAccel;
      p.vx += dir * accel;
      p.vx = Math.max(-PHYS.runSpeed, Math.min(PHYS.runSpeed, p.vx));
      p.facing = dir;
    } else if (p.onGround) {
      p.vx -= Math.sign(p.vx) * Math.min(Math.abs(p.vx), PHYS.friction);
      if (Math.abs(p.vx) < 0.05) p.vx = 0;
    }

    // 重开本关
    if (inp.justPressed('restart')) {
      this.restartLevel();
      return;
    }

    // 跳跃缓冲 / 土狼时间
    if (inp.justPressed('jump')) p.buffer = PHYS.bufferFrames;
    if (p.buffer > 0) p.buffer--;
    if (p.onGround) p.coyote = PHYS.coyoteFrames;
    else if (p.coyote > 0) p.coyote--;

    if (p.buffer > 0 && p.coyote > 0) {
      p.vy = PHYS.jumpVel;
      p.onGround = false;
      p.coyote = 0;
      p.buffer = 0;
      p.jumpHold = 0;
      this.audio?.sfx('jump');
      this._spawnParticles(p.x + p.w / 2, p.y + p.h, 5, this.level.theme.dirtTop);
    }

    // 松键截断（可变跳跃高度）
    // 至少按住 jumpMinHold 帧才生效，保证触屏"轻点"也能跳起约 1 格
    if (p.vy < 0) p.jumpHold++;
    if (inp.justReleased('jump') && p.vy < 0 && p.jumpHold >= PHYS.jumpMinHold) {
      p.vy *= PHYS.jumpCut;
    }

    // ---- 移动平台承载 ----
    if (p.riding) {
      p.x += p.riding.dx;
      p.y += p.riding.dy;
    }

    // ---- 重力 ----
    p.vy = Math.min(p.vy + PHYS.gravity, PHYS.maxFall);

    // ---- 位移 + 碰撞（moveAndCollide 内部完成位移，一次调用同时解算 X / Y）----
    const beforeBottom = p.y + p.h;
    const hit = moveAndCollide(p, this.level);
    if (hit.left || hit.right) p.vx = 0;
    if (hit.top) p.vy = 0;
    p.onGround = hit.bottom;

    // 单向平台 / 移动平台落脚
    p.riding = null;
    const feet = p.y + p.h;
    for (const m of this.level.movers) {
      const horizOverlap = p.x + p.w > m.x + 1 && p.x < m.x + m.w - 1;
      const onTop = feet >= m.y - 2 && feet <= m.y + m.h + 6;
      if (horizOverlap && onTop && p.vy >= 0) {
        p.y = m.y - p.h;
        p.vy = 0;
        p.onGround = true;
        p.riding = m;
        break;
      }
    }
    if (!p.onGround) {
      const groundY = probeGround(p, this.level, 2);
      if (groundY !== null && beforeBottom <= groundY + 1 && p.vy >= 0) {
        p.y = groundY - p.h;
        p.vy = 0;
        p.onGround = true;
      }
    }

    // ---- 掉出地图 ----
    if (p.y > this.level.height * TILE + 32) {
      this._killPlayer('fall');
      return;
    }

    // ---- 无敌计时 ----
    if (p.invuln > 0) p.invuln--;

    // ---- 动画状态 ----
    this._updatePlayerSprite();

    // ---- 危险物 ----
    if (p.invuln === 0 && touchesHazard(p, this.level)) {
      this._killPlayer('hazard');
      return;
    }

    // ---- 敌人 ----
    for (const e of this.level.enemies) {
      if (e.dead) continue;
      if (!overlaps(p, e)) continue;
      const stomping = p.vy > 0 && (p.y + p.h) - e.y < 10;
      if (stomping) {
        e.dead = true;
        p.vy = PHYS.stompBounce;
        p.onGround = false;
        this.audio?.sfx('stomp');
        this._spawnParticles(e.x + e.w / 2, e.y + e.h / 2, 10, this.level.theme.hazard);
        this.run.shards += 0;
        this.score = (this.score || 0) + 100;
      } else {
        this._killPlayer('enemy');
        return;
      }
    }
  }

  _updatePlayerSprite() {
    const p = this.player;
    p.animTime += Math.abs(p.vx);
    if (!p.onGround) {
      p.sprite = p.vy < 0 ? 'jump' : 'fall';
    } else if (Math.abs(p.vx) > 0.15) {
      p.sprite = Math.floor(p.animTime / 6) % 2 === 0 ? 'walkA' : 'walkB';
    } else {
      p.sprite = 'idle';
    }
  }

  /* -------------------------- 移动平台 -------------------------- */

  _updateMovers() {
    for (const m of this.level.movers) {
      const px = m.x;
      const py = m.y;
      if (m.axis === 'h') {
        m.x += m.dir * m.speed;
        if (m.x > m.originX + m.range) { m.x = m.originX + m.range; m.dir = -1; }
        if (m.x < m.originX) { m.x = m.originX; m.dir = 1; }
      } else {
        m.y += m.dir * m.speed;
        if (m.y > m.originY + m.range) { m.y = m.originY + m.range; m.dir = -1; }
        if (m.y < m.originY) { m.y = m.originY; m.dir = 1; }
      }
      m.dx = m.x - px;
      m.dy = m.y - py;
    }
  }

  /* -------------------------- 敌人 -------------------------- */

  _updateEnemies() {
    for (const e of this.level.enemies) {
      if (e.dead) continue;
      if (e.type === 'cusp') {
        e.vx = e.dir * 0.55;
        e.vy = Math.min(e.vy + PHYS.gravity, PHYS.maxFall);
        const res = moveAndCollide(e, this.level);
        if (res.left || res.right) e.dir *= -1;
        // 悬崖检测
        const aheadX = e.dir > 0 ? e.x + e.w + 2 : e.x - 2;
        const tx = Math.floor(aheadX / TILE);
        const ty = Math.floor((e.y + e.h + 3) / TILE);
        if (!isSolid(this.level, tx, ty)) e.dir *= -1;
        if (e.x < e.homeX - e.range) { e.x = e.homeX - e.range; e.dir = 1; }
        if (e.x > e.homeX + e.range) { e.x = e.homeX + e.range; e.dir = -1; }
      } else {
        e.x += e.dir * 0.78;
        if (e.x < e.homeX - e.range) { e.x = e.homeX - e.range; e.dir = 1; }
        if (e.x > e.homeX + e.range) { e.x = e.homeX + e.range; e.dir = -1; }
      }
    }
  }

  /* -------------------------- 收集物 / 检查点 / 目标 -------------------------- */

  _updatePickups() {
    const p = this.player;

    for (const s of this.level.shards) {
      if (s.collected) continue;
      if (overlaps(p, s)) {
        s.collected = true;
        this.run.shards++;
        this.audio?.sfx('shard');
        this._spawnParticles(s.x + 4, s.y + 4, 12, this.level.theme.accent);
        const left = this.level.shards.filter((x) => !x.collected).length;
        if (left === 0) {
          this.level.goal.open = true;
          this.audio?.sfx('gate');
        }
      }
    }

    for (const cp of this.level.checkpoints) {
      if (cp.activated) continue;
      if (overlaps(p, cp)) {
        cp.activated = true;
        this.player.spawnX = cp.x - 2;
        this.player.spawnY = cp.y;
        this.audio?.sfx('checkpoint');
        this._spawnParticles(cp.x + 4, cp.y + 8, 8, this.level.theme.accent);
      }
    }

    const g = this.level.goal;
    if (g.open && overlaps(p, { x: g.x + 2, y: g.y + 6, w: g.w - 4, h: g.h - 6 })) {
      this._levelClear();
    }
  }

  /* -------------------------- 死亡 / 过关 -------------------------- */

  _killPlayer(reason) {
    if (this.state !== 'playing') return;
    const p = this.player;
    this.state = 'dying';
    this.dyingTimer = 42;
    this.run.deaths++;
    this.run.lives--;
    this.audio?.sfx('hurt');
    this._spawnParticles(p.x + p.w / 2, p.y + p.h / 2, 18, this.level.theme.hazard);
    this._syncHud();
    this.deathReason = reason;
  }

  _afterDeath() {
    if (this.run.lives <= 0) {
      this._gameOver();
      return;
    }
    const p = this.player;
    p.x = p.spawnX;
    p.y = p.spawnY;
    p.vx = 0;
    p.vy = 0;
    p.invuln = 70;
    p.riding = null;
    this.state = 'playing';
    this._updateCamera(true);
    this._syncHud();
  }

  _gameOver() {
    this.state = 'gameover';
    this.audio?.stopMusic();
    this.audio?.playJingle('gameover');
    this.overlay.show({
      title: '远征中断',
      subtitle: 'RUN ENDED',
      tone: 'coral',
      body: `
        <p>墨豆在 <b>${this.level.name}</b> 耗尽了最后的能源。</p>
        <dl class="ov-stats">
          <div><dt>到达关卡</dt><dd>${this.levelIndex + 1} / ${this.levels.length}</dd></div>
          <div><dt>已收集色晶</dt><dd>${this.run.shards} / ${this.run.totalShards}</dd></div>
          <div><dt>用时</dt><dd>${this._fmtTime(this.run.time)}</dd></div>
        </dl>
      `,
      actions: [
        { id: 'retry', label: '重开本关', primary: true, onClick: () => this.restartLevel() },
        { id: 'restart', label: '从头开始', onClick: () => this.startRun() },
        { id: 'back', label: '返回展厅', onClick: () => this.onExit() },
      ],
    });
  }

  _levelClear() {
    this.state = 'levelclear';
    this.audio?.stopMusic();
    this.audio?.playJingle('clear');
    this._spawnBurst();

    const perfect = this.run.shards >= this.run.totalShards;
    const next = this.levelIndex + 1;
    const isLast = next >= this.levels.length;

    if (isLast) {
      this.state = 'victory';
      const best = this._saveBest(this.run.time);
      this.overlay.show({
        title: '远征完成',
        subtitle: 'VOYAGE COMPLETE',
        tone: 'sun',
        body: `
          <p>墨豆带着 <b>9 枚色晶</b> 回到了跃迁塔，三段地形被重新点亮。</p>
          <dl class="ov-stats">
            <div><dt>总用时</dt><dd>${this._fmtTime(this.run.time)}</dd></div>
            <div><dt>色晶</dt><dd>${this.run.shards} / 9</dd></div>
            <div><dt>失误</dt><dd>${this.run.deaths} 次</dd></div>
            <div><dt>最佳纪录</dt><dd>${this._fmtTime(best)}</dd></div>
          </dl>
        `,
        actions: [
          { id: 'again', label: '再跑一次', primary: true, onClick: () => this.startRun() },
          { id: 'back', label: '返回展厅', onClick: () => this.onExit() },
        ],
      });
      return;
    }

    this.overlay.show({
      title: `${this.level.name} 完成`,
      subtitle: 'SECTOR CLEAR',
      tone: 'mint',
      body: `
        <dl class="ov-stats">
          <div><dt>色晶</dt><dd>${this.run.shards} / ${this.run.totalShards}${perfect ? ' ✦ 全收集' : ''}</dd></div>
          <div><dt>本关用时</dt><dd>${this._fmtTime(this.run.time)}</dd></div>
          <div><dt>剩余生命</dt><dd>${this.run.lives}</dd></div>
        </dl>
        <p class="ov-note">下一站：<b>${this.levels[next].name}</b> · ${this.levels[next].subtitle}</p>
      `,
      actions: [
        { id: 'next', label: '前往下一关', primary: true, onClick: () => this._goNext() },
        { id: 'retry', label: '重玩本关', onClick: () => this.restartLevel() },
        { id: 'back', label: '返回展厅', onClick: () => this.onExit() },
      ],
    });
  }

  _goNext() {
    this._loadLevel(this.levelIndex + 1, { keepLives: true });
    this.state = 'playing';
    this.overlay.hide();
    this.audio?.playMusic(this._levelTrack());
    this._syncHud();
  }

  /* -------------------------- 相机 / 粒子 / HUD -------------------------- */

  _updateCamera(snap = false) {
    const p = this.player;
    const look = p.facing * 26;
    let target = p.x + p.w / 2 - VIEW_W / 2 + look;
    const maxX = this.level.width * TILE - VIEW_W;
    target = Math.max(0, Math.min(maxX, target));
    if (snap) this.cameraX = target;
    else this.cameraX += (target - this.cameraX) * 0.12;
  }

  _spawnParticles(x, y, count, color) {
    for (let i = 0; i < count; i++) {
      const a = (Math.PI * 2 * i) / count + Math.random() * 0.6;
      const sp = 0.6 + Math.random() * 1.8;
      this.particles.push({
        x, y,
        vx: Math.cos(a) * sp,
        vy: Math.sin(a) * sp - 0.6,
        life: 26 + Math.random() * 18,
        maxLife: 40,
        size: Math.random() < 0.4 ? 2 : 1,
        color,
      });
    }
  }

  _spawnBurst() {
    const g = this.level.goal;
    this._spawnParticles(g.x + 8, g.y + 16, 26, this.level.theme.accent);
    this._spawnParticles(g.x + 8, g.y + 8, 18, '#f4efe4');
  }

  _updateParticles() {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const pt = this.particles[i];
      pt.x += pt.vx;
      pt.y += pt.vy;
      pt.vy += 0.12;
      pt.life--;
      if (pt.life <= 0) this.particles.splice(i, 1);
    }
    if (this.particles.length > 260) this.particles.splice(0, this.particles.length - 260);
  }

  _syncHud() {
    if (!this.hud || !this.hud.set) return;
    const collected = this.level ? this.level.shards.filter((s) => s.collected).length : 0;
    this.hud.set({
      lives: this.run.lives,
      maxLives: MAX_LIVES,
      shards: collected,
      totalShards: this.level ? this.level.shards.length : 0,
      levelIndex: this.levelIndex,
      levelCount: this.levels.length,
      levelName: this.level ? this.level.name : '',
      levelSubtitle: this.level ? this.level.subtitle : '',
      time: this.run.time,
      best: this.best,
      checkpoint: this.level ? this.level.checkpoints.some((c) => c.activated) : false,
      state: this.state,
    });
  }

  _fmtTime(sec) {
    const m = Math.floor(sec / 60);
    const s = sec - m * 60;
    return `${String(m).padStart(2, '0')}:${s.toFixed(2).padStart(5, '0')}`;
  }

  /* -------------------------- 最佳纪录（localStorage 容错） -------------------------- */

  _loadBest() {
    try {
      const v = window.localStorage.getItem('chroma-voyage.best');
      return v ? Number(v) : null;
    } catch {
      return null;
    }
  }

  _saveBest(time) {
    try {
      const prev = this._loadBest();
      if (prev == null || time < prev) {
        window.localStorage.setItem('chroma-voyage.best', String(time));
        this.best = time;
        return time;
      }
      this.best = prev;
      return prev;
    } catch {
      this.best = time;
      return time;
    }
  }

  /* ---------------------------------------------------------------- *
   * 渲染
   * ---------------------------------------------------------------- */

  render() {
    if (!this.level) return;
    const p = this.player;
    this.renderer.render(this.level, {
      cameraX: this.cameraX,
      frame: this.frame,
      player: p,
      enemies: this.level.enemies,
      movers: this.level.movers,
      shards: this.level.shards,
      checkpoints: this.level.checkpoints,
      goal: this.level.goal,
      particles: this.particles,
    });

    // 无敌闪烁
    if (p && p.invuln > 0 && Math.floor(p.invuln / 4) % 2 === 0) {
      const ctx = this.renderer.ctx;
      ctx.globalAlpha = 0.45;
      ctx.fillStyle = '#f4efe4';
      ctx.fillRect(0, 0, VIEW_W, VIEW_H);
      ctx.globalAlpha = 1;
    }
  }
}
