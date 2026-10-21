/**
 * Multi-function display rendered onto a 2D canvas that is used as a texture
 * on the cockpit panel. Redrawn at a throttled rate (see Settings.quality.mfdHz)
 * to keep the GPU happy.
 */
export class MFD {
  constructor(width = 512, height = 384) {
    this.canvas = document.createElement('canvas');
    this.canvas.width = width;
    this.canvas.height = height;
    this.ctx = this.canvas.getContext('2d');
    this.dirty = true;
    this._accum = 0;
  }

  /**
   * @param {number} dt seconds
   * @param {object} state flight/game state snapshot
   */
  update(dt, state, hz = 15) {
    this._accum += dt;
    if (this._accum < 1 / hz) return;
    this._accum = 0;
    this.draw(state);
  }

  draw(s) {
    const ctx = this.ctx;
    const W = this.canvas.width;
    const H = this.canvas.height;

    // --- Background ------------------------------------------------
    const bg = ctx.createLinearGradient(0, 0, 0, H);
    bg.addColorStop(0, '#171009');
    bg.addColorStop(1, '#0a0705');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    ctx.save();
    ctx.globalAlpha = 0.5;
    ctx.strokeStyle = '#2b2114';
    ctx.lineWidth = 1;
    for (let x = 0; x < W; x += 32) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
    }
    for (let y = 0; y < H; y += 32) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
    }
    ctx.restore();

    const cyan = '#E9A93D';
    const amber = '#F3E7D2';
    const dim = 'rgba(233,169,61,0.46)';

    // --- Attitude indicator (top-left) -----------------------------
    const ax = 104, ay = 108, ar = 76;
    ctx.save();
    ctx.beginPath();
    ctx.arc(ax, ay, ar, 0, Math.PI * 2);
    ctx.clip();

    ctx.save();
    ctx.translate(ax, ay);
    ctx.rotate(-s.roll);
    const pitchPx = (s.pitch / (Math.PI / 4)) * ar;
    ctx.translate(0, pitchPx);

    const sky = ctx.createLinearGradient(0, -ar * 2, 0, 0);
    sky.addColorStop(0, '#2f4655');
    sky.addColorStop(1, '#4a7183');
    ctx.fillStyle = sky;
    ctx.fillRect(-ar * 2, -ar * 3, ar * 4, ar * 3);
    ctx.fillStyle = '#4a3316';
    ctx.fillRect(-ar * 2, 0, ar * 4, ar * 3);

    ctx.strokeStyle = '#F3E7D2';
    ctx.lineWidth = 1.6;
    ctx.beginPath(); ctx.moveTo(-ar * 2, 0); ctx.lineTo(ar * 2, 0); ctx.stroke();

    ctx.strokeStyle = 'rgba(243,231,210,0.75)';
    ctx.font = '11px "Menlo", monospace';
    ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(243,231,210,0.8)';
    for (let p = -60; p <= 60; p += 15) {
      if (p === 0) continue;
      const y = -(p / 45) * ar;
      const w = p % 30 === 0 ? 26 : 14;
      ctx.beginPath(); ctx.moveTo(-w, y); ctx.lineTo(w, y); ctx.stroke();
    }
    ctx.restore();

    // Roll ladder
    ctx.strokeStyle = dim;
    ctx.lineWidth = 1.2;
    for (let a = -60; a <= 60; a += 15) {
      if (a === 0) continue;
      const rad = (a - 90) * Math.PI / 180;
      const r0 = ar - 8, r1 = ar - (a % 30 === 0 ? 18 : 12);
      ctx.beginPath();
      ctx.moveTo(ax + Math.cos(rad) * r0, ay + Math.sin(rad) * r0);
      ctx.lineTo(ax + Math.cos(rad) * r1, ay + Math.sin(rad) * r1);
      ctx.stroke();
    }
    ctx.restore();

    ctx.strokeStyle = cyan;
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(ax, ay, ar, 0, Math.PI * 2); ctx.stroke();

    // Fixed aircraft symbol
    ctx.strokeStyle = amber;
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.moveTo(ax - 26, ay); ctx.lineTo(ax - 9, ay); ctx.lineTo(ax, ay + 7);
    ctx.lineTo(ax + 9, ay); ctx.lineTo(ax + 26, ay);
    ctx.stroke();
    ctx.fillStyle = amber;
    ctx.fillRect(ax - 2, ay - 2, 4, 4);

    ctx.fillStyle = cyan;
    ctx.font = 'bold 12px "Menlo", monospace';
    ctx.textAlign = 'left';
    ctx.fillText('ATT', ax - ar, ay - ar - 8);
    ctx.fillStyle = dim;
    ctx.font = '11px "Menlo", monospace';
    ctx.fillText(`P ${(s.pitch * 57.2958).toFixed(0).padStart(4)}°  R ${(s.roll * 57.2958).toFixed(0).padStart(4)}°`, ax - ar, ay + ar + 16);

    // --- Velocity tape (left edge) ---------------------------------
    ctx.fillStyle = 'rgba(14,10,6,0.88)';
    ctx.fillRect(0, 0, 46, 210);
    ctx.strokeStyle = dim;
    ctx.strokeRect(0.5, 0.5, 45, 209);
    ctx.fillStyle = cyan;
    ctx.font = '10px "Menlo", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('SPD', 23, 14);
    ctx.fillStyle = '#F3E7D2';
    ctx.font = 'bold 13px "Menlo", monospace';
    ctx.fillText(`${Math.round(s.speedMs)}`, 23, 100);
    ctx.font = '10px "Menlo", monospace';
    ctx.fillStyle = dim;
    ctx.fillText('m/s', 23, 114);

    // --- Navigation scope (right) -----------------------------------
    const nx = 348, ny = 116, nr = 84;
    ctx.save();
    ctx.beginPath(); ctx.arc(nx, ny, nr, 0, Math.PI * 2); ctx.clip();
    ctx.fillStyle = '#0a0805';
    ctx.fillRect(nx - nr, ny - nr, nr * 2, nr * 2);

    // Range rings
    ctx.strokeStyle = 'rgba(233,169,61,0.2)';
    ctx.lineWidth = 1;
    for (const f of [0.33, 0.66, 1]) {
      ctx.beginPath(); ctx.arc(nx, ny, nr * f, 0, Math.PI * 2); ctx.stroke();
    }
    ctx.beginPath(); ctx.moveTo(nx - nr, ny); ctx.lineTo(nx + nr, ny);
    ctx.moveTo(nx, ny - nr); ctx.lineTo(nx, ny + nr); ctx.stroke();

    // Contacts
    for (const c of s.contacts || []) {
      const px = nx + c.x * nr;
      const py = ny + c.y * nr;
      if (Math.abs(px - nx) > nr || Math.abs(py - ny) > nr) continue;
      ctx.fillStyle = c.color || cyan;
      ctx.beginPath();
      ctx.arc(px, py, 3.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.font = '9px "Menlo", monospace';
      ctx.textAlign = 'left';
      ctx.fillText(c.label, px + 5, py + 3);
    }

    // Own ship marker (always centre, heading up)
    ctx.strokeStyle = amber;
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(nx, ny - 7); ctx.lineTo(nx + 5, ny + 6); ctx.lineTo(nx, ny + 3); ctx.lineTo(nx - 5, ny + 6);
    ctx.closePath(); ctx.stroke();
    ctx.restore();

    ctx.strokeStyle = cyan;
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(nx, ny, nr, 0, Math.PI * 2); ctx.stroke();
    ctx.fillStyle = cyan;
    ctx.font = 'bold 12px "Menlo", monospace';
    ctx.textAlign = 'left';
    ctx.fillText('NAV SCAN', nx - nr, ny - nr - 8);

    // --- Lower data block ------------------------------------------
    const lx = 12, ly = 232;
    ctx.fillStyle = 'rgba(14,10,6,0.88)';
    ctx.fillRect(lx, ly, 236, 140);
    ctx.strokeStyle = dim;
    ctx.strokeRect(lx + 0.5, ly + 0.5, 235, 139);

    ctx.font = '11px "Menlo", monospace';
    ctx.textAlign = 'left';
    ctx.fillStyle = cyan;
    ctx.fillText('SHIP STATUS', lx + 10, ly + 18);

    const bar = (row, label, value, color) => {
      const y = ly + 34 + row * 22;
      ctx.fillStyle = dim;
      ctx.fillText(label, lx + 10, y + 9);
      ctx.fillStyle = 'rgba(243,231,210,0.08)';
      ctx.fillRect(lx + 86, y, 118, 10);
      ctx.fillStyle = color;
      ctx.fillRect(lx + 86, y, 118 * Math.max(0, Math.min(1, value)), 10);
      ctx.fillStyle = '#F3E7D2';
      ctx.textAlign = 'right';
      ctx.fillText(`${Math.round(value * 100)}`, lx + 226, y + 9);
      ctx.textAlign = 'left';
    };

    bar(0, 'FUEL', s.fuel / 100, s.fuel < 25 ? '#E2573C' : cyan);
    bar(1, 'HULL', s.hull / 100, s.hull < 35 ? '#E2573C' : '#6FCF97');
    bar(2, 'SHIELD', s.shield, '#B9A6E6');

    ctx.fillStyle = dim;
    ctx.font = '11px "Menlo", monospace';
    ctx.fillText(`REGION`, lx + 10, ly + 118);
    ctx.fillStyle = '#F3E7D2';
    ctx.font = 'bold 12px "Menlo", monospace';
    ctx.fillText(s.region || '—', lx + 86, ly + 118);

    // --- Right column: target + scan --------------------------------
    const rx = 262;
    ctx.fillStyle = 'rgba(14,10,6,0.88)';
    ctx.fillRect(rx, ly, 238, 140);
    ctx.strokeStyle = dim;
    ctx.strokeRect(rx + 0.5, ly + 0.5, 237, 139);

    ctx.font = '11px "Menlo", monospace';
    ctx.fillStyle = cyan;
    ctx.fillText('TARGET', rx + 10, ly + 18);

    ctx.font = 'bold 14px "Menlo", monospace';
    ctx.fillStyle = s.targetName ? '#F3E7D2' : dim;
    ctx.fillText(s.targetName || '无目标', rx + 10, ly + 38);

    ctx.font = '11px "Menlo", monospace';
    ctx.fillStyle = dim;
    ctx.fillText('RANGE', rx + 10, ly + 58);
    ctx.fillStyle = '#F3E7D2';
    ctx.font = 'bold 12px "Menlo", monospace';
    ctx.fillText(s.targetRange != null ? `${(s.targetRange / 10).toFixed(1)} km` : '—', rx + 96, ly + 58);

    // Scan progress arc
    const sx = rx + 168, sy = ly + 62;
    ctx.strokeStyle = 'rgba(99,232,255,0.2)';
    ctx.lineWidth = 6;
    ctx.beginPath(); ctx.arc(sx, sy, 26, 0, Math.PI * 2); ctx.stroke();
    if (s.scanProgress > 0) {
      ctx.strokeStyle = '#ffb45c';
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.arc(sx, sy, 26, -Math.PI / 2, -Math.PI / 2 + s.scanProgress * Math.PI * 2);
      ctx.stroke();
    }
    ctx.fillStyle = dim;
    ctx.font = '9px "Menlo", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('SCAN', sx, sy + 40);
    ctx.textAlign = 'left';

    // Warp / boost banner
    if (s.warp > 0) {
      ctx.fillStyle = 'rgba(226,87,60,0.18)';
      ctx.fillRect(rx, ly - 26, 238, 22);
      ctx.fillStyle = '#E9A93D';
      ctx.font = 'bold 13px "Menlo", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('JUMP CHARGE', rx + 119, ly - 10);
      ctx.textAlign = 'left';
    }

    // Header
    ctx.fillStyle = 'rgba(12,9,5,0.92)';
    ctx.fillRect(0, 0, W, 26);
    ctx.fillStyle = cyan;
    ctx.font = 'bold 13px "Menlo", monospace';
    ctx.textAlign = 'left';
    ctx.fillText('FG-1 NAVIGATOR', 12, 18);
    ctx.textAlign = 'right';
    ctx.fillStyle = s.warning ? '#ff6b6b' : dim;
    ctx.fillText(s.warning || `HDG ${(s.heading * 57.2958).toFixed(0).padStart(3)}°`, W - 12, 18);

    this.dirty = true;
  }
}
