/**
 * 2D survey panels rendered on canvas.
 *
 * Three panels carry the machine's technical read-out:
 *   - crownSection : the milling-crown cross-section with its spiral blades
 *   - longSection  : a full head-to-tail longitudinal section strip
 *   - surveyChart  : the bathymetric survey chart with the vent field
 *
 * All are drawn with vector primitives — no images, no external assets.
 */

/**
 * 2D technical panels.
 *
 * Palette follows the shared design tokens (16-design-system/design-tokens.json
 * → color.dark / color.canvas):
 *   INK       → --ds-canvas-hud-ink  #f7f4f0   主文字
 *   INK_SOFT  → 34% 透明度的同色      次级文字
 *   ACCENT    → --ds-jade            #5fa99a   结构线稿
 *   WARN      → --ds-accent          #e0684a   强调（尺寸标注 / 热点）
 * These mirror src/style.css so the canvas panels and the DOM chrome read as
 * one system.
 */
const INK = '#f7f4f0';
const INK_SOFT = 'rgba(247, 244, 240, 0.46)';
const ACCENT = '#5fa99a';
const WARN = '#e0684a';

function setupCanvas(canvas, cssW, cssH) {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.max(1, Math.round(cssW * dpr));
  canvas.height = Math.max(1, Math.round(cssH * dpr));
  canvas.style.width = `${cssW}px`;
  canvas.style.height = `${cssH}px`;
  const ctx = canvas.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, cssW, cssH);
  return ctx;
}

/** The milling-crown cross-section, with real section hatching. */
export function drawCrownSection(canvas, opts = {}) {
  const W = canvas.clientWidth || 220;
  const H = canvas.clientHeight || 150;
  const ctx = setupCanvas(canvas, W, H);
  const { bladeCount = 7, vaneCount = 3, radius = 0.62, metresPerUnit = 33.63 } = opts;

  const cx = W / 2;
  const cy = H / 2;
  const R = Math.min(W, H) * 0.29;

  ctx.save();

  // Outer crown rim
  ctx.beginPath();
  ctx.arc(cx, cy, R, 0, Math.PI * 2);
  ctx.strokeStyle = INK;
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Section hatching inside the rim wall
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, R, 0, Math.PI * 2);
  ctx.arc(cx, cy, R * 0.84, 0, Math.PI * 2, true);
  ctx.clip('evenodd');
  ctx.strokeStyle = INK_SOFT;
  ctx.lineWidth = 0.7;
  for (let i = -R * 2; i < R * 2; i += 4.5) {
    ctx.beginPath();
    ctx.moveTo(cx + i, cy - R * 1.4);
    ctx.lineTo(cx + i + R * 2.8, cy + R * 1.4);
    ctx.stroke();
  }
  ctx.restore();

  // Spiral cutter blades — each blade sweeps from the hub to the rim.
  ctx.strokeStyle = ACCENT;
  ctx.lineWidth = 1.5;
  for (let b = 0; b < bladeCount; b++) {
    const base = (b / bladeCount) * Math.PI * 2;
    ctx.beginPath();
    for (let t = 0; t <= 1.0001; t += 0.03) {
      const a = base + t * 1.05;
      const r = R * (0.4 + t * 0.46);
      const x = cx + Math.cos(a) * r;
      const y = cy + Math.sin(a) * r;
      if (t === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }

  // Ore teeth standing on the rim
  ctx.strokeStyle = WARN;
  ctx.lineWidth = 1.2;
  for (let b = 0; b < bladeCount; b++) {
    const a = ((b + 0.5) / bladeCount) * Math.PI * 2;
    const x = cx + Math.cos(a) * R * 0.92;
    const y = cy + Math.sin(a) * R * 0.92;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(cx + Math.cos(a) * R * 1.14, cy + Math.sin(a) * R * 1.14);
    ctx.stroke();
  }

  // Hub
  ctx.beginPath();
  ctx.arc(cx, cy, R * 0.32, 0, Math.PI * 2);
  ctx.strokeStyle = INK;
  ctx.lineWidth = 1.2;
  ctx.stroke();

  // Deflector vanes behind the throat
  ctx.strokeStyle = INK_SOFT;
  ctx.lineWidth = 1;
  for (let v = 0; v < vaneCount; v++) {
    const a = (v / vaneCount) * Math.PI * 2 + 0.5;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(a) * R * 0.32, cy + Math.sin(a) * R * 0.32);
    ctx.lineTo(cx + Math.cos(a + 0.4) * R * 0.6, cy + Math.sin(a + 0.4) * R * 0.6);
    ctx.stroke();
  }

  // Centre line
  ctx.setLineDash([5, 3, 2, 3]);
  ctx.strokeStyle = INK_SOFT;
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  ctx.moveTo(cx - R * 1.4, cy);
  ctx.lineTo(cx + R * 1.4, cy);
  ctx.moveTo(cx, cy - R * 1.4);
  ctx.lineTo(cx, cy + R * 1.4);
  ctx.stroke();
  ctx.setLineDash([]);

  // Dimension line
  ctx.strokeStyle = INK;
  ctx.lineWidth = 0.9;
  const dy = cy + R * 1.36;
  ctx.beginPath();
  ctx.moveTo(cx - R, dy);
  ctx.lineTo(cx + R, dy);
  ctx.moveTo(cx - R, dy - 4);
  ctx.lineTo(cx - R, dy + 4);
  ctx.moveTo(cx + R, dy - 4);
  ctx.lineTo(cx + R, dy + 4);
  ctx.stroke();
  ctx.fillStyle = INK;
  ctx.font = '9px ui-monospace, SFMono-Regular, Menlo, monospace';
  ctx.textAlign = 'center';
  ctx.fillText(`Ø ${(radius * 2 * metresPerUnit).toFixed(1)} m`, cx, dy + 13);

  ctx.fillStyle = INK_SOFT;
  ctx.textAlign = 'left';
  ctx.fillText(`${bladeCount} BLADES`, 6, 12);

  ctx.restore();
}

/** Longitudinal section strip, head on the left, tail on the right. */
export function drawLongSection(canvas, opts = {}) {
  const W = canvas.clientWidth || 620;
  const H = canvas.clientHeight || 92;
  const ctx = setupCanvas(canvas, W, H);
  const { segmentCount = 18, radius = 0.62, beat = 0 } = opts;

  const pad = 14;
  const innerW = W - pad * 2;
  const cy = H * 0.5;
  const r = Math.min(H * 0.3, 20);

  ctx.save();

  // Section band
  ctx.strokeStyle = INK;
  ctx.lineWidth = 1.3;
  ctx.beginPath();
  ctx.moveTo(pad, cy - r);
  ctx.lineTo(pad + innerW, cy - r);
  ctx.lineTo(pad + innerW, cy + r);
  ctx.lineTo(pad, cy + r);
  ctx.closePath();
  ctx.stroke();

  // Hatching
  ctx.save();
  ctx.beginPath();
  ctx.rect(pad, cy - r, innerW, r * 2);
  ctx.clip();
  ctx.strokeStyle = INK_SOFT;
  ctx.lineWidth = 0.6;
  for (let i = -H; i < innerW + H; i += 5) {
    ctx.beginPath();
    ctx.moveTo(pad + i, cy - r);
    ctx.lineTo(pad + i + r * 2, cy + r);
    ctx.stroke();
  }
  ctx.restore();

  // Segment divisions
  const segW = innerW / segmentCount;
  ctx.strokeStyle = INK;
  ctx.lineWidth = 0.8;
  for (let i = 0; i <= segmentCount; i++) {
    const x = pad + i * segW;
    ctx.beginPath();
    ctx.moveTo(x, cy - r);
    ctx.lineTo(x, cy + r);
    ctx.stroke();
  }

  // Per-segment drive train: keel, reducer, strut
  for (let i = 0; i < segmentCount; i++) {
    const x = pad + (i + 0.5) * segW;
    // keel
    ctx.strokeStyle = INK;
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.moveTo(x, cy);
    ctx.lineTo(x, cy);
    ctx.stroke();
    // reducer
    ctx.strokeStyle = i % 4 === beat ? ACCENT : INK;
    ctx.lineWidth = 1.1;
    ctx.beginPath();
    ctx.arc(x, cy - r * 0.42, r * 0.24, 0, Math.PI * 2);
    ctx.stroke();
    // strut
    ctx.strokeStyle = INK_SOFT;
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(x, cy + r * 0.18);
    ctx.lineTo(x, cy + r * 0.74);
    ctx.stroke();
  }

  // Crown marker (head end)
  ctx.fillStyle = ACCENT;
  ctx.fillRect(pad, cy - r, 3, r * 2);
  ctx.beginPath();
  ctx.moveTo(pad - 1, cy);
  ctx.lineTo(pad - 11, cy - 5);
  ctx.lineTo(pad - 11, cy + 5);
  ctx.closePath();
  ctx.fill();

  // Tail: hopper pod then fan
  ctx.strokeStyle = WARN;
  ctx.lineWidth = 1.3;
  ctx.strokeRect(pad + innerW - segW * 1.2, cy + r * 0.2, segW * 1.2, r * 0.72);
  ctx.beginPath();
  ctx.moveTo(pad + innerW, cy - r);
  ctx.lineTo(pad + innerW, cy + r);
  ctx.stroke();

  // Labels
  ctx.fillStyle = INK;
  ctx.font = '9px ui-monospace, SFMono-Regular, Menlo, monospace';
  ctx.textAlign = 'left';
  ctx.fillText('磨削冠 CROWN', pad, cy - r - 4);
  ctx.textAlign = 'right';
  ctx.fillText('尾扇 FAN', pad + innerW, cy - r - 4);
  ctx.textAlign = 'center';
  ctx.fillStyle = INK_SOFT;
  ctx.fillText(
    `${segmentCount} 节驱动体节 · ${segmentCount} DRIVEN CARAPACE SEGMENTS`,
    pad + innerW / 2,
    cy + r + 14
  );

  ctx.restore();
}

/** The bathymetric survey chart: depth contours, vent field and machine track. */
export function drawSurveyChart(canvas, opts = {}) {
  const W = canvas.clientWidth || 210;
  const H = canvas.clientHeight || 150;
  const ctx = setupCanvas(canvas, W, H);
  const { track = [], seed = 3 } = opts;

  ctx.save();

  // Map border with corner ticks
  ctx.strokeStyle = INK;
  ctx.lineWidth = 1.1;
  ctx.strokeRect(0.5, 0.5, W - 1, H - 1);
  ctx.lineWidth = 1.6;
  const t = 9;
  for (const [cx, cy, dx, dy] of [
    [0, 0, 1, 1],
    [W, 0, -1, 1],
    [0, H, 1, -1],
    [W, H, -1, -1],
  ]) {
    ctx.beginPath();
    ctx.moveTo(cx + dx * t, cy);
    ctx.lineTo(cx, cy);
    ctx.lineTo(cx, cy + dy * t);
    ctx.stroke();
  }

  // Depth contour lines
  ctx.strokeStyle = INK_SOFT;
  ctx.lineWidth = 0.7;
  for (let ring = 0; ring < 6; ring++) {
    ctx.beginPath();
    const rad = 12 + ring * 9;
    for (let a = 0; a <= Math.PI * 2 + 0.01; a += 0.14) {
      const wob =
        1 +
        Math.sin(a * 3 + ring * 1.7 + seed) * 0.16 +
        Math.cos(a * 5 - ring) * 0.07;
      const x = W / 2 + Math.cos(a) * rad * 1.25 * wob;
      const y = H / 2 + Math.sin(a) * rad * 0.72 * wob;
      if (a === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.stroke();
  }

  // Vent field markers
  const vents = [
    [0.16, 0.3],
    [0.42, 0.74],
    [0.68, 0.22],
    [0.86, 0.62],
    [0.56, 0.9],
  ];
  ctx.fillStyle = WARN;
  for (const [vx, vy] of vents) {
    const x = vx * W;
    const y = vy * H;
    ctx.beginPath();
    ctx.arc(x, y, 2.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(224, 104, 74, 0.4)';
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.arc(x, y, 5.5, 0, Math.PI * 2);
    ctx.stroke();
  }

  // The machine's track
  if (track.length > 1) {
    ctx.strokeStyle = ACCENT;
    ctx.lineWidth = 1.6;
    ctx.setLineDash([4, 3]);
    ctx.beginPath();
    track.forEach((p, i) => {
      const x = (p.x * 0.5 + 0.5) * W;
      const y = (p.z * 0.5 + 0.5) * H;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();
    ctx.setLineDash([]);
  }

  // Legend
  ctx.fillStyle = INK;
  ctx.font = '8px ui-monospace, SFMono-Regular, Menlo, monospace';
  ctx.textAlign = 'left';
  ctx.fillText('VENT FIELD · 3.8 km²', 6, 13);
  ctx.fillStyle = INK_SOFT;
  ctx.fillText('DEPTH 4 120 – 4 860 m', 6, H - 6);

  ctx.restore();
}
