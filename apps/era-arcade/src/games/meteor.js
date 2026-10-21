/**
 * 霓虹街廊 · 街机可玩展厅
 * src/games/meteor.js — 《陨星纵队》METEOR COLUMN
 *
 * 原创机制：编队射击。
 *   · 三种弹型：散射 / 穿甲 / 追踪（1 2 3 或 Q E 切换）
 *   · 共振槽：连续命中同一颗陨石蓄满，按 F 释放「共振激爆」清场同色陨石
 *   · 铁陨会发射余波弹，迫使玩家走位
 * 与任何商业街机作品无素材或逐帧关联，机制参考的是"固定射击台编队"这一公共范式。
 */

import { PAL, withAlpha, DIFFICULTY } from '../core/palette.js';
import { drawText, drawNeonText } from '../core/bitmapFont.js';
import { drawSprite, SPRITES } from '../core/sprites.js';
import { createRng } from '../core/rng.js';
import { loadScores, saveScore } from '../core/storage.js';

const W = 480;
const H = 270;
const TOP = 22;            // HUD 高度
const BOTTOM = 262;        // 防线
const PLAYER_Y = 238;

/** 陨石种类 */
const KINDS = {
  dust: { label: 'DUST', hp: 1, r: 4, score: 50, color: PAL.meteorB, splits: null },
  stone: { label: 'STONE', hp: 2, r: 6, score: 120, color: PAL.meteorA, splits: 'dust' },
  iron: { label: 'IRON', hp: 5, r: 8, score: 300, color: PAL.meteorC, splits: 'stone' },
};

/** 弹型 */
const SHOTS = [
  { key: 'spread', en: 'SPREAD', cn: '散射', color: PAL.cyan, cooldown: 0.26 },
  { key: 'pierce', en: 'PIERCE', cn: '穿甲', color: PAL.core, cooldown: 0.34 },
  { key: 'homing', en: 'HOMING', cn: '追踪', color: PAL.violet, cooldown: 0.30 },
];

const TUNING = [
  { speed: 22, density: 0.7, fireRate: 0.42, enemyFire: 0, time: 0 },
  { speed: 32, density: 0.9, fireRate: 0.32, enemyFire: 2.6, time: 0 },
  { speed: 42, density: 1.15, fireRate: 0.24, enemyFire: 1.8, time: 0 },
];

export function createMeteor(shell) {
  const st = {
    phase: 'play',      // play | waveclear | over
    score: 0,
    lives: 3,
    shields: 0,
    wave: 1,
    waveTimer: 0,
    shotIndex: 0,
    fireCd: 0,
    resonance: 0,
    resTarget: null,
    invuln: 0,
    flash: 0,
    banner: null,
    bannerT: 0,
    difficulty: 1,
    rng: createRng('meteor-decor'),
    pickups: [],
  };

  const player = { x: W / 2, speed: 118, t: 0 };
  let bullets = [];
  let ebullets = [];
  let meteors = [];
  let particles = [];
  let floats = [];
  let waveSpawnQueue = [];
  let waveTimer = 0;

  /* --------------------------- 波次编排 --------------------------- */

  const PATTERNS = ['vee', 'arc', 'snake', 'columns', 'drift'];

  function planWave(wave) {
    const t = TUNING[st.difficulty];
    const rng = createRng(`meteor-wave-${wave}-${st.difficulty}`);
    const pattern = wave <= PATTERNS.length ? PATTERNS[wave - 1] : rng.pick(PATTERNS);
    const queue = [];
    const density = t.density;

    const push = (kind, x, y, extra = {}) => {
      queue.push({ kind, x, y, delay: 0, ...extra });
    };

    if (pattern === 'vee') {
      const n = Math.round(7 * density);
      for (let i = 0; i < n; i += 1) {
        const k = Math.floor((n - 1) / 2);
        const off = i - k;
        push(rng.chance(0.22) ? 'iron' : 'stone', W / 2 + off * 34, -14 - Math.abs(off) * 16, {
          sway: 0, drift: off * 4,
        });
      }
    } else if (pattern === 'arc') {
      const n = Math.round(9 * density);
      for (let i = 0; i < n; i += 1) {
        const a = Math.PI * (0.15 + (i / (n - 1)) * 0.7);
        push(i % 3 === 0 ? 'iron' : 'dust', W / 2 - Math.cos(a) * 210, -16 - Math.sin(a) * 40, {
          drift: Math.cos(a) * 26,
        });
      }
    } else if (pattern === 'snake') {
      const n = Math.round(8 * density);
      for (let i = 0; i < n; i += 1) {
        push(i % 4 === 3 ? 'iron' : 'stone', 60 + i * 44, -14, {
          sway: 16 + rng.float(0, 10),
          swayFreq: 1.4 + rng.float(0, 0.8),
          phase: i * 0.5,
        });
      }
    } else if (pattern === 'columns') {
      const n = Math.round(6 * density);
      for (let i = 0; i < n; i += 1) {
        const col = i % 2;
        push(i % 3 === 0 ? 'iron' : 'stone', 120 + col * 240, -14 - i * 26, {
          drift: col === 0 ? 14 : -14,
        });
      }
    } else {
      const n = Math.round(11 * density);
      for (let i = 0; i < n; i += 1) {
        push(rng.chance(0.25) ? 'stone' : 'dust', rng.float(24, W - 24), -14 - i * 18, {
          drift: rng.float(-22, 22),
        });
      }
    }

    // 按行错开入场
    queue.forEach((q, i) => {
      q.delay = i * 0.09;
    });
    return { pattern, queue };
  }

  function startWave(n) {
    st.wave = n;
    const { pattern } = planWave(n);
    waveSpawnQueue = planWave(n).queue;
    waveTimer = 0;
    showBanner(`WAVE ${n}  ${pattern.toUpperCase()}`, 1.4);
    shell.audio.sfx.confirm();
  }

  function spawnMeteor(spec) {
    const kind = KINDS[spec.kind];
    const rng = createRng(`meteor-${spec.kind}-${Math.random()}`);
    const hp = kind.hp + (st.difficulty === 2 ? 1 : 0);
    const verts = [];
    const n = 9;
    for (let i = 0; i < n; i += 1) {
      const a = (i / n) * Math.PI * 2;
      const jr = kind.r * rng.float(0.76, 1.16);
      verts.push([Math.cos(a) * jr, Math.sin(a) * jr]);
    }
    meteors.push({
      id: `m${Math.random().toString(36).slice(2)}`,
      kind: spec.kind,
      hp,
      maxHp: hp,
      x: spec.x,
      y: spec.y,
      baseX: spec.x,
      vy: TUNING[st.difficulty].speed * rng.float(0.82, 1.2),
      drift: spec.drift || 0,
      sway: spec.sway || 0,
      swayFreq: spec.swayFreq || 1.5,
      phase: spec.phase || 0,
      t: rng.float(0, 6.28),
      rot: 0,
      rotSpeed: rng.float(-1.2, 1.2),
      verts,
      fireCd: rng.float(1.5, 4),
      flashT: 0,
    });
  }

  /* --------------------------- 开局与结算 --------------------------- */

  function startGame() {
    st.score = 0;
    st.lives = 3;
    st.shields = 0;
    st.wave = 0;
    st.resonance = 0;
    st.resTarget = null;
    st.shotIndex = 0;
    bullets = [];
    ebullets = [];
    meteors = [];
    particles = [];
    floats = [];
    st.pickups = [];
    player.x = W / 2;
    player.invuln = 0;
    startWave(1);
    shell.audio.music.play('meteor');
  }

  function showBanner(text, dur = 1.3) {
    st.banner = text;
    st.bannerT = dur;
  }

  function gameOver() {
    st.phase = 'over';
    shell.audio.sfx.over();
    shell.audio.music.stop();
    const list = saveScore('meteor', st.score);
    shell.gameOver({
      gameId: 'meteor',
      title: '陨星纵队',
      score: st.score,
      detail: `推进至第 ${st.wave} 波`,
      scores: list,
    });
  }

  function hurt(reason) {
    if (st.invuln > 0) return;
    if (st.shields > 0) {
      st.shields -= 1;
      st.invuln = 1.2;
      shell.audio.sfx.seal();
      floats.push({ x: player.x, y: player.y - 12, text: 'SHIELD DOWN', life: 1.0, color: PAL.cyan });
      return;
    }
    st.lives -= 1;
    st.flash = 1;
    st.invuln = 2.0;
    st.resonance = 0;
    st.resTarget = null;
    shell.audio.sfx.lock();
    floats.push({ x: player.x, y: player.y - 12, text: reason, life: 1.2, color: PAL.crimson });
    if (st.lives <= 0) gameOver();
  }

  /* --------------------------- 武器 --------------------------- */

  function fire() {
    const mode = SHOTS[st.shotIndex];
    if (st.fireCd > 0) return;
    st.fireCd = mode.cooldown * (st.difficulty === 0 ? 1.2 : st.difficulty === 2 ? 0.85 : 1);
    const y = PLAYER_Y - 6;
    if (mode.key === 'spread') {
      for (const dx of [-6, 0, 6]) {
        bullets.push({ x: player.x + dx, y, vx: dx * 0.42, vy: -230, dmg: 1, pierce: 0, homing: 0, color: mode.color, size: 2 });
      }
      shell.audio.sfx.lance();
    } else if (mode.key === 'pierce') {
      bullets.push({ x: player.x, y, vx: 0, vy: -320, dmg: 3, pierce: 3, homing: 0, color: mode.color, size: 3 });
      shell.audio.sfx.lance();
    } else {
      bullets.push({ x: player.x, y, vx: 0, vy: -190, dmg: 1, pierce: 0, homing: 3.4, color: mode.color, size: 2 });
      shell.audio.sfx.lance();
    }
  }

  function cycleShot(dir) {
    st.shotIndex = (st.shotIndex + dir + SHOTS.length) % SHOTS.length;
    shell.audio.sfx.confirm();
  }

  function resonanceBurst() {
    if (st.resonance < 6 || !st.resTarget) {
      shell.audio.sfx.deny();
      return;
    }
    const target = meteors.find((m) => m.id === st.resTarget);
    const kind = target ? target.kind : 'dust';
    const cleared = meteors.filter((m) => m.kind === kind);
    const gain = cleared.length * 500 * st.wave;
    st.score += gain;
    st.resonance = 0;
    st.resTarget = null;
    shell.audio.sfx.quake();
    showBanner(`RESONANCE  +${gain}`, 1.2);
    for (const m of cleared) {
      burstParticles(m.x, m.y, m.verts, m.kind);
    }
    meteors = meteors.filter((m) => m.kind !== kind);
    for (let i = 0; i < 40; i += 1) {
      const a = Math.random() * Math.PI * 2;
      particles.push({
        x: W / 2, y: 120,
        vx: Math.cos(a) * 140, vy: Math.sin(a) * 140,
        life: 0.6, max: 0.6, color: PAL.core, size: 2,
      });
    }
    st.flash = 0.6;
  }

  function burstParticles(x, y, verts, kind) {
    const color = KINDS[kind].color;
    for (const [vx, vy] of verts) {
      particles.push({
        x: x + vx, y: y + vy,
        vx: vx * 3.2, vy: vy * 3.2,
        life: 0.5, max: 0.5, color, size: 2,
      });
    }
  }

  /* --------------------------- 更新 --------------------------- */

  function update(dt, input) {
    st.flash = Math.max(0, st.flash - dt * 2);
    st.bannerT = Math.max(0, st.bannerT - dt);
    if (st.invuln > 0) st.invuln -= dt;

    if (st.phase === 'over') {
      updateParticles(dt);
      return;
    }

    // 移动
    const ax = input.axisX();
    if (ax !== 0) {
      player.x += ax * player.speed * dt;
      player.x = Math.max(10, Math.min(W - 10, player.x));
    }
    player.t += dt;

    // 开火
    if (input.held('action')) fire();
    if (input.consume('slot1')) { st.shotIndex = 0; shell.audio.sfx.confirm(); }
    if (input.consume('slot2')) { st.shotIndex = 1; shell.audio.sfx.confirm(); }
    if (input.consume('slot3')) { st.shotIndex = 2; shell.audio.sfx.confirm(); }
    if (input.consume('cyclePrev')) cycleShot(-1);
    if (input.consume('skill')) cycleShot(1);
    if (input.consume('ultimate')) resonanceBurst();
    if (st.fireCd > 0) st.fireCd -= dt;

    // 波次入场
    if (waveSpawnQueue.length) {
      waveTimer += dt;
      while (waveSpawnQueue.length && waveSpawnQueue[0].delay <= waveTimer) {
        spawnMeteor(waveSpawnQueue.shift());
      }
    } else if (!meteors.length && st.phase === 'play') {
      // 本波清空
      st.phase = 'waveclear';
      waveTimer = 0;
      const bonus = 200 * st.wave;
      st.score += bonus;
      showBanner(`WAVE ${st.wave} CLEAR  +${bonus}`, 1.6);
      shell.audio.sfx.seal();
    }

    if (st.phase === 'waveclear') {
      waveTimer += dt;
      if (waveTimer > 1.8) {
        st.phase = 'play';
        startWave(st.wave + 1);
      }
    }

    // 子弹
    for (let i = bullets.length - 1; i >= 0; i -= 1) {
      const b = bullets[i];
      if (b.homing > 0) {
        const target = nearestMeteor(b.x, b.y);
        if (target) {
          const dx = target.x - b.x;
          const dy = target.y - b.y;
          const len = Math.hypot(dx, dy) || 1;
          b.vx += (dx / len) * 420 * dt;
          b.vy += (dy / len) * 420 * dt;
          const speed = Math.hypot(b.vx, b.vy);
          if (speed > 230) {
            b.vx = (b.vx / speed) * 230;
            b.vy = (b.vy / speed) * 230;
          }
        }
      }
      b.x += b.vx * dt;
      b.y += b.vy * dt;
      if (b.y < TOP - 6 || b.x < -8 || b.x > W + 8) {
        bullets.splice(i, 1);
        continue;
      }
      // 命中
      for (const m of meteors) {
        if (m.dead) continue;
        const dx = m.x - b.x;
        const dy = m.y - b.y;
        const rr = (KINDS[m.kind].r + b.size) ** 2;
        if (dx * dx + dy * dy > rr) continue;
        damageMeteor(m, b);
        if (b.pierce > 0) {
          b.pierce -= 1;
          b.dmg = Math.max(1, b.dmg - 1);
        } else {
          bullets.splice(i, 1);
        }
        break;
      }
    }

    // 敌弹
    const enemyFire = TUNING[st.difficulty].enemyFire;
    for (let i = ebullets.length - 1; i >= 0; i -= 1) {
      const b = ebullets[i];
      b.y += b.vy * dt;
      b.x += Math.sin(b.t * 3) * 12 * dt;
      b.t += dt;
      if (b.y > H) {
        ebullets.splice(i, 1);
        continue;
      }
      if (Math.abs(b.x - player.x) < 6 && Math.abs(b.y - (PLAYER_Y + 4)) < 8) {
        ebullets.splice(i, 1);
        hurt('HIT BY DEBRIS');
      }
    }

    // 陨石
    for (let i = meteors.length - 1; i >= 0; i -= 1) {
      const m = meteors[i];
      m.t += dt;
      m.rot += m.rotSpeed * dt;
      m.flashT = Math.max(0, m.flashT - dt * 4);
      m.y += m.vy * dt;
      m.x += m.drift * dt;
      if (m.sway) {
        m.x += Math.cos(m.t * m.swayFreq + m.phase) * m.sway * dt;
      }
      if (m.x < 10 || m.x > W - 10) {
        m.drift *= -1;
        m.x = Math.max(10, Math.min(W - 10, m.x));
      }

      // 铁陨发射余波弹
      if (enemyFire > 0 && m.kind === 'iron') {
        m.fireCd -= dt;
        if (m.fireCd <= 0) {
          m.fireCd = enemyFire;
          ebullets.push({ x: m.x, y: m.y + 8, vy: 78, t: 0 });
        }
      }

      // 撞击玩家
      const dx = m.x - player.x;
      const dy = m.y - (PLAYER_Y + 4);
      if (dx * dx + dy * dy < (KINDS[m.kind].r + 5) ** 2) {
        hurt('RAMMED BY METEOR');
        meteors.splice(i, 1);
        burstParticles(m.x, m.y, m.verts, m.kind);
        continue;
      }

      // 突破防线
      if (m.y > BOTTOM) {
        meteors.splice(i, 1);
        hurt('LINE BREACHED');
        st.flash = 1;
      }
    }

    // 补给
    for (let i = st.pickups.length - 1; i >= 0; i -= 1) {
      const p = st.pickups[i];
      p.y += 42 * dt;
      p.t += dt;
      if (p.y > H + 8) {
        st.pickups.splice(i, 1);
        continue;
      }
      if (Math.abs(p.x - player.x) < 10 && Math.abs(p.y - (PLAYER_Y + 4)) < 12) {
        st.pickups.splice(i, 1);
        if (p.type === 'shield') {
          st.shields = Math.min(3, st.shields + 1);
          floats.push({ x: player.x, y: player.y - 12, text: 'SHIELD +1', life: 1.1, color: PAL.cyan });
        } else {
          st.lives = Math.min(5, st.lives + 1);
          floats.push({ x: player.x, y: player.y - 12, text: 'SPARE HULL', life: 1.1, color: PAL.core });
        }
        shell.audio.sfx.seal();
      }
    }

    updateParticles(dt);
  }

  function nearestMeteor(x, y) {
    let best = null;
    let bestD = Infinity;
    for (const m of meteors) {
      const d = (m.x - x) ** 2 + (m.y - y) ** 2;
      if (d < bestD) {
        bestD = d;
        best = m;
      }
    }
    return best;
  }

  function damageMeteor(m, b) {
    m.hp -= b.dmg;
    m.flashT = 1;
    if (m.hp > 0) {
      if (st.resTarget === m.id) {
        st.resonance = Math.min(6, st.resonance + 1);
      } else {
        st.resTarget = m.id;
        st.resonance = 1;
      }
      shell.audio.sfx.step();
      return;
    }
    // 摧毁
    const gain = KINDS[m.kind].score * Math.max(1, st.wave);
    st.score += gain;
    floats.push({ x: m.x, y: m.y - 6, text: `${gain}`, life: 0.7, color: KINDS[m.kind].color });
    shell.audio.sfx.burst();
    burstParticles(m.x, m.y, m.verts, m.kind);

    if (st.resTarget === m.id) {
      st.resonance = 0;
      st.resTarget = null;
    }

    const split = KINDS[m.kind].splits;
    if (split) {
      for (const s of [-1, 1]) {
        const spec = { kind: split, x: m.x + s * 8, y: m.y };
        const rng = createRng(`split-${Math.random()}`);
        const kind = KINDS[split];
        const verts = [];
        for (let i = 0; i < 8; i += 1) {
          const a = (i / 8) * Math.PI * 2;
          const jr = kind.r * rng.float(0.76, 1.16);
          verts.push([Math.cos(a) * jr, Math.sin(a) * jr]);
        }
        meteors.push({
          id: `m${Math.random().toString(36).slice(2)}`,
          kind: split,
          hp: kind.hp,
          maxHp: kind.hp,
          x: spec.x, y: spec.y,
          baseX: spec.x,
          vy: m.vy * 1.15,
          drift: s * 22,
          sway: 0,
          swayFreq: 1.5,
          phase: 0,
          t: 0,
          rot: 0,
          rotSpeed: rng.float(-2, 2),
          verts,
          fireCd: 9,
          flashT: 0,
        });
      }
    }
    // 补给掉落
    if (Math.random() < 0.07) {
      st.pickups.push({ x: m.x, y: m.y, type: Math.random() < 0.75 ? 'shield' : 'hull', t: 0 });
    }
  }

  function updateParticles(dt) {
    for (let i = particles.length - 1; i >= 0; i -= 1) {
      const p = particles[i];
      p.life -= dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += 90 * dt;
      if (p.life <= 0) particles.splice(i, 1);
    }
    for (let i = floats.length - 1; i >= 0; i -= 1) {
      const f = floats[i];
      f.life -= dt;
      f.y -= 18 * dt;
      if (f.life <= 0) floats.splice(i, 1);
    }
  }

  /* --------------------------- 绘制 --------------------------- */

  function drawMeteorShape(ctx, m) {
    const kind = KINDS[m.kind];
    const color = m.flashT > 0 ? PAL.text : kind.color;
    ctx.save();
    ctx.translate(m.x, m.y);
    ctx.rotate(m.rot);
    ctx.beginPath();
    ctx.moveTo(m.verts[0][0], m.verts[0][1]);
    for (let i = 1; i < m.verts.length; i += 1) ctx.lineTo(m.verts[i][0], m.verts[i][1]);
    ctx.closePath();
    ctx.fillStyle = '#0d0626';
    ctx.fill();
    ctx.strokeStyle = color;
    ctx.lineWidth = 1;
    ctx.stroke();
    // 高光
    ctx.fillStyle = withAlpha(color, 0.55);
    ctx.fillRect(-kind.r * 0.45, -kind.r * 0.55, kind.r * 0.7, kind.r * 0.45);
    // 血量刻度
    if (m.hp < m.maxHp) {
      const w = kind.r * 2;
      ctx.fillStyle = 'rgba(0,0,0,0.6)';
      ctx.fillRect(-w / 2, kind.r + 2, w, 1);
      ctx.fillStyle = color;
      ctx.fillRect(-w / 2, kind.r + 2, (w * m.hp) / m.maxHp, 1);
    }
    ctx.restore();
  }

  function drawPlayer(ctx) {
    if (st.invuln > 0 && Math.floor(st.invuln * 12) % 2 === 0) return;
    const x = Math.round(player.x - 6);
    const y = PLAYER_Y - 5;
    // 尾焰
    const flick = Math.floor(player.t * 18) % 2;
    ctx.fillStyle = withAlpha(PAL.magenta, 0.8);
    ctx.fillRect(x + 5, y + 10, 2, 4 + flick * 2);
    ctx.fillStyle = withAlpha(PAL.core, 0.7);
    ctx.fillRect(x + 4, y + 10, 1, 3 + flick);
    drawSprite(ctx, SPRITES.skiff, x, y, 1, {
      o: '#0a1430', w: PAL.cyanSoft, g: PAL.cyan, c: PAL.ship,
    });
    // 护盾环
    if (st.shields > 0) {
      ctx.strokeStyle = withAlpha(PAL.cyan, 0.55 + 0.25 * Math.sin(player.t * 8));
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(player.x, PLAYER_Y, 13, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  function drawHud(ctx) {
    ctx.fillStyle = 'rgba(6,3,20,0.85)';
    ctx.fillRect(0, 0, W, TOP - 2);
    ctx.fillStyle = withAlpha(PAL.magenta, 0.5);
    ctx.fillRect(0, TOP - 3, W, 1);

    const diff = DIFFICULTY[st.difficulty];
    drawText(ctx, `SCORE ${String(st.score).padStart(6, '0')}`, 6, 2, { color: PAL.core, scale: 1 });
    drawText(ctx, `WAVE ${String(st.wave).padStart(2, '0')}`, 6, 12, { color: PAL.text, scale: 1 });
    drawText(ctx, diff.en, 84, 12, { color: diff.accent, scale: 1 });

    // 弹型
    const mode = SHOTS[st.shotIndex];
    drawText(ctx, 'SHOT', 140, 2, { color: PAL.textDim, scale: 1 });
    for (let i = 0; i < SHOTS.length; i += 1) {
      const on = i === st.shotIndex;
      const sx = 168 + i * 34;
      ctx.fillStyle = on ? SHOTS[i].color : 'rgba(120,140,180,0.25)';
      ctx.fillRect(sx, 2, 30, 8);
      if (!on) ctx.fillStyle = 'rgba(6,3,20,0.5)';
      drawText(ctx, SHOTS[i].en, sx + 15, 3, {
        color: on ? '#0b0620' : withAlpha(PAL.textDim, 0.8),
        scale: 1,
        align: 'center',
      });
    }
    drawText(ctx, `MODE ${mode.cn}`, 168, 12, { color: mode.color, scale: 1 });

    // 共振槽
    drawText(ctx, 'RESONANCE', 280, 2, { color: PAL.textDim, scale: 1 });
    for (let i = 0; i < 6; i += 1) {
      const on = i < st.resonance;
      ctx.fillStyle = on ? (st.resonance >= 6 ? PAL.core : PAL.violet) : 'rgba(165,107,255,0.18)';
      ctx.fillRect(338 + i * 10, 3, 8, 7);
    }
    ctx.globalAlpha = 0.85;
    drawText(ctx, st.resonance >= 6 ? 'F = BURST' : `${st.resonance}/6`, 402, 3, {
      color: st.resonance >= 6 ? PAL.core : PAL.textFaint,
      scale: 1,
    });
    ctx.globalAlpha = 1;

    // 生命与护盾
    const lifeX = W - 8;
    for (let i = 0; i < 5; i += 1) {
      const on = i < st.lives;
      ctx.fillStyle = on ? PAL.magenta : 'rgba(255,46,136,0.16)';
      ctx.fillRect(lifeX - 6 - i * 9, 4, 6, 6);
    }
    drawText(ctx, 'HULLS', lifeX, 12, { color: PAL.textDim, scale: 1, align: 'right' });
    for (let i = 0; i < 3; i += 1) {
      const on = i < st.shields;
      ctx.strokeStyle = on ? PAL.cyan : 'rgba(38,230,255,0.2)';
      ctx.lineWidth = 1;
      ctx.strokeRect(lifeX - 6 - i * 9, 13, 5, 5);
    }
  }

  function drawFooter(ctx) {
    ctx.fillStyle = 'rgba(6,3,20,0.8)';
    ctx.fillRect(0, H - 8, W, 8);
    ctx.fillStyle = withAlpha(PAL.magenta, 0.35);
    ctx.fillRect(0, H - 9, W, 1);
    drawText(ctx, 'A D MOVE   SPACE FIRE   1 2 3 SHOT   F RESONANCE', 6, H - 7, {
      color: PAL.textDim,
      scale: 1,
    });
  }

  function render(ctx) {
    ctx.fillStyle = '#060218';
    ctx.fillRect(0, 0, W, H);

    // 星空
    for (let i = 0; i < 40; i += 1) {
      const sx = (i * 137 + 29) % W;
      const sy = TOP + ((i * 53 + 11) % (H - TOP));
      ctx.fillStyle = withAlpha('#ffffff', 0.06 + ((i * 37) % 10) / 60);
      ctx.fillRect(sx, sy, 1, 1);
    }

    // 防线
    ctx.fillStyle = withAlpha(PAL.crimson, 0.35);
    for (let x = 0; x < W; x += 6) ctx.fillRect(x, BOTTOM, 4, 1);

    // 补给
    for (const p of st.pickups) {
      const color = p.type === 'shield' ? PAL.cyan : PAL.core;
      const bob = Math.sin(p.t * 6) * 2;
      ctx.fillStyle = withAlpha(color, 0.22);
      ctx.fillRect(p.x - 7, p.y - 7 + bob, 14, 14);
      ctx.fillStyle = color;
      if (p.type === 'shield') {
        ctx.fillRect(p.x - 4, p.y - 1 + bob, 8, 2);
        ctx.fillRect(p.x - 1, p.y - 4 + bob, 2, 8);
      } else {
        ctx.fillRect(p.x - 3, p.y - 3 + bob, 6, 6);
      }
    }

    // 敌弹
    for (const b of ebullets) {
      ctx.fillStyle = withAlpha(PAL.crimson, 0.3);
      ctx.fillRect(b.x - 2, b.y - 2, 4, 4);
      ctx.fillStyle = PAL.crimson;
      ctx.fillRect(b.x - 1, b.y - 1, 2, 4);
    }

    // 我方子弹
    for (const b of bullets) {
      ctx.fillStyle = withAlpha(b.color, 0.35);
      ctx.fillRect(b.x - b.size, b.y - 4, b.size * 2, 8);
      ctx.fillStyle = b.color;
      ctx.fillRect(b.x - Math.floor(b.size / 2), b.y - 3, b.size, 6);
    }

    // 陨石
    for (const m of meteors) drawMeteorShape(ctx, m);

    drawPlayer(ctx);

    // 粒子
    for (const p of particles) {
      ctx.globalAlpha = Math.max(0, p.life / p.max);
      ctx.fillStyle = p.color;
      ctx.fillRect(Math.round(p.x), Math.round(p.y), p.size, p.size);
    }
    ctx.globalAlpha = 1;

    // 飘字
    for (const f of floats) {
      ctx.globalAlpha = Math.max(0, Math.min(1, f.life));
      drawText(ctx, f.text, f.x, f.y, { color: f.color, scale: 1, align: 'center', shadow: true });
    }
    ctx.globalAlpha = 1;

    drawHud(ctx);
    drawFooter(ctx);

    if (st.bannerT > 0) {
      ctx.globalAlpha = Math.min(1, st.bannerT * 1.6);
      const by = 110;
      ctx.fillStyle = 'rgba(6,3,20,0.72)';
      ctx.fillRect(0, by - 6, W, 26);
      ctx.fillStyle = withAlpha(PAL.cyan, 0.6);
      ctx.fillRect(0, by - 6, W, 1);
      ctx.fillRect(0, by + 19, W, 1);
      drawNeonText(ctx, st.banner, W / 2, by, { color: PAL.text, glow: PAL.magenta, scale: 2, align: 'center' });
      ctx.globalAlpha = 1;
    }

    if (st.flash > 0) {
      ctx.fillStyle = withAlpha(PAL.crimson, st.flash * 0.35);
      ctx.fillRect(0, 0, W, H);
    }
  }

  /* --------------------------- 对外接口 --------------------------- */

  return {
    id: 'meteor',
    title: '陨星纵队',
    update,
    render,
    begin() {
      startGame();
    },
    restart() {
      startGame();
    },
    onPause() {
      shell.audio.music.stop();
    },
    onResume() {
      shell.audio.music.play('meteor');
    },
    touchDir(dir) {
      if (dir === 'left' || dir === 'right') {
        player.x += (dir === 'left' ? -1 : 1) * player.speed * 0.016;
        player.x = Math.max(10, Math.min(W - 10, player.x));
      }
    },
    touchAction(name) {
      if (name === 'fire') fire();
      else if (name === 'burst') resonanceBurst();
      else if (name === 'mode') cycleShot(1);
    },
    isOver() {
      return st.phase === 'over';
    },
    scores: () => loadScores('meteor'),
  };
}
