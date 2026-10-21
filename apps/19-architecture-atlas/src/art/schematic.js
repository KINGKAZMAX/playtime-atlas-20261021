/**
 * Procedural schematic drawings.
 *
 * Every image in this project is generated here as SVG line art. Nothing is
 * downloaded, traced or borrowed. Each drawing is a DIAGRAM that shows the
 * structural idea of a building type — never a measured elevation, never a
 * photograph, never a survey.
 *
 * The drawing is deterministic: the same case id always produces the same
 * image, so a card looks identical across reloads and across pages.
 */

/* ---------- deterministic randomness ---------- */

function hash(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i += 1) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function rng(seed) {
  let s = seed >>> 0;
  return () => {
    s ^= s << 13; s >>>= 0;
    s ^= s >> 17;
    s ^= s << 5; s >>>= 0;
    return s / 4294967296;
  };
}

/* ---------- palette (matches tokens.css) ---------- */

const INK = 'var(--ink)';
const LINE = 'var(--line-strong)';
const ACC = 'var(--cinnabar)';
const SECOND = 'var(--malachite)';
const PAPER = 'var(--paper-2)';

/* ---------- small helpers ---------- */

const R = (x, y, w, h, o = {}) =>
  `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${o.fill || 'none'}" stroke="${o.stroke || LINE}" stroke-width="${o.sw || 1}" ${o.extra || ''}/>`;

const L = (x1, y1, x2, y2, o = {}) =>
  `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${o.stroke || INK}" stroke-width="${o.sw || 1}" ${o.extra || ''}/>`;

const C = (cx, cy, r, o = {}) =>
  `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${o.fill || 'none'}" stroke="${o.stroke || LINE}" stroke-width="${o.sw || 1}" ${o.extra || ''}/>`;

const P = (d, o = {}) =>
  `<path d="${d}" fill="${o.fill || 'none'}" stroke="${o.stroke || INK}" stroke-width="${o.sw || 1}" stroke-linejoin="round" stroke-linecap="round" ${o.extra || ''}/>`;

const T = (x, y, s, o = {}) =>
  `<text x="${x}" y="${y}" font-size="${o.size || 9}" fill="${o.fill || 'var(--ink-3)'}" font-family="var(--font-mono)" text-anchor="${o.anchor || 'middle'}" ${o.extra || ''}>${s}</text>`;

/** A gently curved Chinese roof profile (concave eave, upswept corner). */
function roofProfile(x, y, w, h, overhang = 10) {
  const x0 = x - overhang;
  const x1 = x + w + overhang;
  const apex = y - h;
  return `M${x0} ${y} Q${x + w * 0.28} ${y - h * 0.18} ${x + w / 2} ${apex} Q${x + w * 0.72} ${y - h * 0.18} ${x1} ${y}`;
}

/** Simple bracket-set glyph used by several generators. */
function dougongGlyph(x, y, s = 1) {
  return [
    R(x - 9 * s, y, 18 * s, 4 * s, { fill: PAPER, stroke: INK, sw: 0.8 }),
    R(x - 5 * s, y - 5 * s, 10 * s, 5 * s, { fill: PAPER, stroke: INK, sw: 0.8 }),
    L(x, y - 5 * s, x, y - 10 * s, { sw: 0.8 }),
    L(x - 13 * s, y - 10 * s, x + 13 * s, y - 10 * s, { sw: 1 }),
    L(x - 9 * s, y - 10 * s, x - 9 * s, y - 14 * s, { sw: 0.8 }),
    L(x + 9 * s, y - 10 * s, x + 9 * s, y - 14 * s, { sw: 0.8 }),
    L(x - 15 * s, y - 14 * s, x + 15 * s, y - 14 * s, { sw: 1 }),
  ].join('');
}

/* ---------- per-system generators ---------- */

const GENERATORS = {
  /* 斗栱承重 — a bracket set carrying a deep eave */
  dougong(x, y, w, h, rand) {
    const cx = x + w / 2;
    const groundY = y + h - 14;
    const parts = [];
    parts.push(R(cx - 5, groundY - 30, 10, 30, { fill: PAPER, stroke: INK, sw: 1.1 }));
    parts.push(R(cx - 11, groundY - 34, 22, 5, { fill: PAPER, stroke: INK, sw: 1 }));
    parts.push(dougongGlyph(cx, groundY - 34, 1.05));
    parts.push(R(cx - 46, groundY - 56, 92, 5, { fill: PAPER, stroke: INK, sw: 1 }));
    parts.push(P(roofProfile(cx - 40, groundY - 56, 80, 22, 16), { stroke: INK, sw: 1.3 }));
    parts.push(L(cx - 60, groundY, cx + 60, groundY, { sw: 1.2 }));
    for (let i = 0; i < 5; i += 1) {
      parts.push(L(cx - 44 + i * 22, groundY - 51, cx - 30 + i * 22, groundY - 56, { sw: 0.6, stroke: LINE }));
    }
    parts.push(C(cx + 62, groundY - 40, 3, { stroke: ACC, sw: 1.2, fill: ACC }));
    parts.push(T(cx + 62, groundY - 33, 'dougong', { fill: ACC, size: 7 }));
    return parts.join('');
  },

  /* 抬梁木构 — bays of columns with rising tiers */
  taoliang(x, y, w, h, rand) {
    const parts = [];
    const groundY = y + h - 14;
    const bays = 4;
    const colW = 14;
    const gap = (w - 40 - bays * colW) / (bays - 1);
    const xs = [];
    for (let i = 0; i < bays; i += 1) xs.push(x + 20 + i * (colW + gap));
    for (const cx of xs) {
      parts.push(R(cx - colW / 2, groundY - 44, colW, 44, { fill: PAPER, stroke: INK, sw: 1 }));
      parts.push(R(cx - colW / 2 - 3, groundY - 2, colW + 6, 5, { fill: 'var(--paper-3)', stroke: LINE, sw: 0.8 }));
    }
    parts.push(R(x + 14, groundY - 50, w - 28, 6, { fill: PAPER, stroke: INK, sw: 1.2 }));
    // tiered props + ridge
    const ridgeY = groundY - 78;
    parts.push(L(x + 18, ridgeY, x + w - 18, ridgeY, { sw: 1.4 }));
    for (let i = 1; i < bays - 1; i += 1) {
      const cx = xs[i];
      parts.push(R(cx - 3, groundY - 68, 6, 18, { fill: PAPER, stroke: INK, sw: 0.9 }));
      parts.push(L(cx, groundY - 68, cx, ridgeY, { sw: 0.9 }));
      parts.push(L(cx - 8, groundY - 68, cx + 8, ridgeY, { sw: 0.8 }));
    }
    parts.push(P(roofProfile(x + 16, groundY - 50, w - 32, 30, 14), { stroke: INK, sw: 1.3 }));
    parts.push(L(x + 12, groundY, x + w - 12, groundY, { sw: 1.2 }));
    return parts.join('');
  },

  /* 穿斗木构 — dense columns, purlins straight on heads */
  chuandou(x, y, w, h, rand) {
    const parts = [];
    const groundY = y + h - 14;
    const cols = 7;
    const step = (w - 40) / (cols - 1);
    for (let i = 0; i < cols; i += 1) {
      const cx = x + 20 + i * step;
      parts.push(R(cx - 3, groundY - 40, 6, 40, { fill: PAPER, stroke: INK, sw: 0.9 }));
      parts.push(L(cx, groundY - 40, cx, groundY - 50, { sw: 0.7, stroke: LINE }));
    }
    parts.push(R(x + 16, groundY - 50, w - 32, 4, { fill: PAPER, stroke: INK, sw: 1.1 }));
    parts.push(R(x + 16, groundY - 64, w - 32, 4, { fill: PAPER, stroke: INK, sw: 1 }));
    for (const t of [groundY - 50, groundY - 64]) {
      for (let i = 1; i < cols; i += 1) {
        const cx = x + 20 + i * step;
        parts.push(R(cx - 2, t - 14, 4, 14, { fill: PAPER, stroke: INK, sw: 0.8 }));
      }
    }
    // diagonal braces in the end bays
    parts.push(L(x + 20, groundY - 40, x + 20 + step, groundY, { sw: 0.9 }));
    parts.push(L(x + w - 20, groundY - 40, x + w - 20 - step, groundY, { sw: 0.9 }));
    parts.push(P(roofProfile(x + 16, groundY - 50, w - 32, 22, 12), { stroke: INK, sw: 1.2 }));
    parts.push(L(x + 12, groundY, x + w - 12, groundY, { sw: 1.2 }));
    return parts.join('');
  },

  /* 榫卯节点 — a joint detail */
  'mortise-tenon'(x, y, w, h, rand) {
    const parts = [];
    const cx = x + w / 2;
    const cy = y + h / 2;
    parts.push(R(x + 24, cy - 30, 52, 26, { fill: PAPER, stroke: INK, sw: 1.2 }));
    parts.push(R(x + 24, cy - 30, 34, 8, { fill: 'var(--paper-3)', stroke: INK, sw: 1 }));
    parts.push(R(x + 58, cy - 26, 8, 14, { fill: 'var(--paper-3)', stroke: INK, sw: 1 }));
    parts.push(R(x + 76, cy - 34, 34, 34, { fill: PAPER, stroke: INK, sw: 1.2 }));
    parts.push(R(x + 72, cy - 22, 8, 10, { fill: PAPER, stroke: INK, sw: 1, extra: 'stroke-dasharray="2 2"' }));
    parts.push(P(`M${x + 66} ${cy - 4} L${x + 72} ${cy - 4} L${x + 72} ${cy + 4} L${x + 66} ${cy + 4}`, { stroke: ACC, sw: 1.1 }));
    parts.push(C(cx - 4, cy + 16, 3, { stroke: ACC, fill: ACC }));
    parts.push(T(cx - 4, cy + 26, 'mortise / tenon', { fill: ACC, size: 7 }));
    parts.push(L(x + 20, y + h - 12, x + w - 20, y + h - 12, { sw: 0.8, stroke: LINE }));
    return parts.join('');
  },

  /* 干阑木构 — a stilt house */
  ganlan(x, y, w, h, rand) {
    const parts = [];
    const cx = x + w / 2;
    const floorY = y + h - 30;
    const groundY = y + h - 10;
    for (let i = 0; i < 4; i += 1) {
      const px = cx - 34 + i * 23;
      parts.push(L(px, floorY, px + (i % 2 ? 3 : -3), groundY, { sw: 1.1 }));
    }
    parts.push(R(cx - 44, floorY, 88, 8, { fill: PAPER, stroke: INK, sw: 1.1 }));
    parts.push(R(cx - 34, floorY - 26, 68, 26, { fill: PAPER, stroke: INK, sw: 1.1 }));
    parts.push(P(roofProfile(cx - 40, floorY - 26, 80, 24, 16), { stroke: INK, sw: 1.3 }));
    parts.push(L(cx - 50, floorY + 8, cx + 50, floorY + 8, { sw: 0.7, stroke: LINE }));
    for (let i = 0; i < 6; i += 1) {
      parts.push(L(cx - 44 + i * 17, floorY + 8, cx - 44 + i * 17, groundY, { sw: 0.4, stroke: LINE }));
    }
    parts.push(L(x + 16, groundY, x + w - 16, groundY, { sw: 1.2 }));
    return parts.join('');
  },

  /* 环形土楼 — a ring plan */
  tulou(x, y, w, h, rand) {
    const parts = [];
    const cx = x + w / 2;
    const cy = y + h / 2;
    const r = Math.min(w, h) * 0.38;
    parts.push(C(cx, cy, r, { stroke: INK, sw: 5, extra: 'fill="var(--paper-3)"' }));
    parts.push(C(cx, cy, r - 9, { stroke: INK, sw: 1 }));
    parts.push(C(cx, cy, r * 0.42, { stroke: LINE, sw: 0.9, extra: 'stroke-dasharray="3 3"' }));
    for (let i = 0; i < 12; i += 1) {
      const a = (i / 12) * Math.PI * 2;
      parts.push(L(cx + Math.cos(a) * (r - 9), cy + Math.sin(a) * (r - 9), cx + Math.cos(a) * (r * 0.42), cy + Math.sin(a) * (r * 0.42), { sw: 0.5, stroke: LINE }));
      parts.push(R(cx + Math.cos(a) * (r - 5.5) - 2.4, cy + Math.sin(a) * (r - 5.5) - 2.4, 4.8, 4.8, { fill: PAPER, stroke: INK, sw: 0.7 }));
    }
    parts.push(C(cx, cy, 4, { stroke: ACC, fill: ACC }));
    parts.push(T(cx, cy + 15, 'courtyard + well', { fill: ACC, size: 7 }));
    return parts.join('');
  },

  /* 砖砌塔 — a tiered tapering tower */
  'brick-pagoda'(x, y, w, h, rand) {
    const parts = [];
    const cx = x + w / 2;
    const baseY = y + h - 12;
    const tiers = 6;
    for (let i = 0; i < tiers; i += 1) {
      const t = i / tiers;
      const tw = (w - 30) * (1 - t * 0.55);
      const ty = baseY - (h - 40) * (i / tiers);
      parts.push(R(cx - tw / 2, ty - (h - 40) / tiers, tw, (h - 40) / tiers, { fill: i % 2 ? PAPER : 'var(--paper-3)', stroke: INK, sw: 0.9 }));
      parts.push(R(cx - tw / 2 - 4, ty - 3, tw + 8, 3.5, { fill: PAPER, stroke: INK, sw: 0.8 }));
    }
    const topY = baseY - (h - 40);
    parts.push(P(`M${cx - 9} ${topY} L${cx} ${topY - 12} L${cx + 9} ${topY} Z`, { stroke: INK, sw: 1.1 }));
    parts.push(L(cx, topY - 12, cx, topY - 20, { sw: 1 }));
    parts.push(C(cx, topY - 22, 2.6, { stroke: ACC, fill: ACC }));
    parts.push(L(x + 14, baseY, x + w - 14, baseY, { sw: 1.2 }));
    return parts.join('');
  },

  /* 石拱与索桥 — a segmental arch bridge */
  'stone-arch'(x, y, w, h, rand) {
    const parts = [];
    const cx = x + w / 2;
    const baseY = y + h - 12;
    const deckY = y + 16;
    const span = w - 34;
    const rise = span * 0.2;
    const outer = `M${cx - span / 2} ${deckY} L${cx - span / 2} ${baseY} L${cx + span / 2} ${baseY} L${cx + span / 2} ${deckY} Z`;
    parts.push(P(outer, { stroke: 'none', fill: 'var(--paper-3)' }));
    const intrados = `M${cx - span / 2 + 12} ${deckY} Q${cx} ${deckY + rise * 1.8} ${cx + span / 2 - 12} ${deckY}`;
    parts.push(P(`M${cx - span / 2 + 12} ${deckY} Q${cx} ${deckY + rise * 1.8} ${cx + span / 2 - 12} ${deckY} L${cx + span / 2 - 12} ${deckY - 8} Q${cx} ${deckY + rise * 1.8 - 8} ${cx - span / 2 + 12} ${deckY - 8} Z`, { stroke: INK, sw: 1.1, fill: PAPER }));
    // open shoulders
    for (const s of [-1, 1]) {
      const sx = cx + s * (span / 2 - 6);
      parts.push(P(`M${sx} ${deckY} Q${sx + s * 16} ${deckY + 18} ${sx + s * 30} ${deckY}`, { stroke: INK, sw: 1 }));
    }
    parts.push(R(cx - span / 2 - 8, deckY - 8, span + 16, 8, { fill: PAPER, stroke: INK, sw: 1.1 }));
    parts.push(L(cx - span / 2 - 8, baseY, cx + span / 2 + 8, baseY, { sw: 1.3 }));
    parts.push(C(cx, deckY - 15, 3, { stroke: ACC, fill: ACC }));
    parts.push(T(cx, deckY - 22, 'open shoulder', { fill: ACC, size: 7 }));
    return parts.join('');
  },

  /* 夯土构筑 — a wall section */
  'rammed-earth'(x, y, w, h, rand) {
    const parts = [];
    const baseY = y + h - 12;
    const topY = y + 26 + (h - 60) * 0.25;
    parts.push(P(`M${x + 20} ${baseY} L${x + 20} ${topY} Q${x + w / 2} ${topY - 10} ${x + w - 20} ${topY} L${x + w - 20} ${baseY} Z`, { stroke: INK, sw: 1.2, fill: 'var(--paper-3)' }));
    for (let i = 0; i < 7; i += 1) {
      const ly = topY + 6 + i * ((baseY - topY - 10) / 7);
      if (ly > baseY - 3) break;
      parts.push(L(x + 23, ly, x + w - 23, ly, { sw: 0.5, stroke: LINE }));
    }
    parts.push(R(x + 20, baseY, w - 40, 6, { fill: 'var(--paper-3)', stroke: LINE, sw: 0.9 }));
    for (let i = 0; i < 4; i += 1) {
      parts.push(R(x + 26 + i * (w - 56) / 4, topY - 8, 9, 9, { fill: PAPER, stroke: INK, sw: 0.8 }));
    }
    parts.push(C(x + w - 34, topY - 22, 3, { stroke: ACC, fill: ACC }));
    parts.push(T(x + w - 34, topY - 30, 'rammed core', { fill: ACC, size: 7 }));
    return parts.join('');
  },

  /* 石窟崖穴 — cliff face with niches */
  grotto(x, y, w, h, rand) {
    const parts = [];
    const baseY = y + h - 10;
    parts.push(P(`M${x + 14} ${baseY} L${x + 18} ${y + 12} L${x + w - 18} ${y + 8} L${x + w - 14} ${baseY} Z`, { stroke: INK, sw: 1.2, fill: 'var(--paper-3)' }));
    const niches = 5;
    for (let i = 0; i < niches; i += 1) {
      const nx = x + 32 + i * ((w - 64) / (niches - 1));
      const ny = y + 34 + (i % 2) * 14;
      const r = 7 + (i % 3) * 1.6;
      parts.push(P(`M${nx - r} ${ny + r * 1.5} L${nx - r} ${ny} A${r} ${r} 0 0 1 ${nx + r} ${ny} L${nx + r} ${ny + r * 1.5} Z`, { stroke: INK, sw: 1, fill: PAPER }));
    }
    parts.push(C(x + w - 30, y + 20, 3, { stroke: ACC, fill: ACC }));
    parts.push(T(x + w - 30, y + 12, 'cliff face', { fill: ACC, size: 7 }));
    return parts.join('');
  },

  /* 园林理水 — a plan with water and a zigzag bridge */
  garden(x, y, w, h, rand) {
    const parts = [];
    const cx = x + w / 2;
    const cy = y + h / 2;
    parts.push(P(`M${x + 20} ${cy - 14} Q${cx - 10} ${cy - 26} ${cx + 18} ${cy - 10} Q${cx + 40} ${cy + 8} ${cx + 8} ${cy + 20} Q${x + 24} ${cy + 30} ${x + 20} ${cy - 14} Z`, { stroke: SECOND, sw: 1.1, fill: 'var(--malachite-soft)' }));
    parts.push(P(`M${x + 24} ${cy - 20} L${x + 52} ${cy - 30} L${x + 74} ${cy - 20} L${x + 46} ${cy - 8} Z`, { stroke: INK, sw: 1 }));
    for (let i = 0; i < 4; i += 1) {
      const px = x + 34 + i * 26;
      const py = y + 20 + (i % 2) * 8;
      parts.push(C(px, py, 6, { stroke: LINE, sw: 0.8 }));
      parts.push(L(px, py - 6, px, py - 12, { sw: 0.7, stroke: LINE }));
    }
    parts.push(C(x + w - 26, cy + 16, 3, { stroke: ACC, fill: ACC }));
    parts.push(T(x + w - 26, cy + 27, 'water + walk', { fill: ACC, size: 7 }));
    return parts.join('');
  },

  /* 水利工程 — a channel section */
  hydraulic(x, y, w, h, rand) {
    const parts = [];
    const bedY = y + h - 16;
    const cx = x + w / 2;
    parts.push(P(`M${x + 14} ${y + 30} L${x + 14} ${bedY} L${x + 34} ${bedY} L${x + 34} ${y + 42} L${x + w - 34} ${y + 42} L${x + w - 34} ${bedY} L${x + w - 14} ${bedY} L${x + w - 14} ${y + 30}`, { stroke: INK, sw: 1.2, fill: 'var(--paper-3)' }));
    parts.push(R(x + 34, y + 42, w - 68, 6, { fill: 'var(--malachite-soft)', stroke: SECOND, sw: 1 }));
    for (let i = 0; i < 4; i += 1) {
      parts.push(L(x + 40 + i * 8, y + 30 - i * 2, x + 40 + i * 8, y + 30, { sw: 0.5, stroke: LINE }));
    }
    parts.push(P(`M${cx - 16} ${y + 26} L${cx} ${y + 12} L${cx + 16} ${y + 26}`, { stroke: ACC, sw: 1.1 }));
    parts.push(T(cx, y + 36, 'split · spill · intake', { fill: ACC, size: 7 }));
    return parts.join('');
  },

  /* 陵墓石作 — a spirit way in plan */
  mausoleum(x, y, w, h, rand) {
    const parts = [];
    const cx = x + w / 2;
    const topY = y + 14;
    const botY = y + h - 12;
    parts.push(L(cx, topY, cx, botY, { sw: 1.1, extra: 'stroke-dasharray="6 4"' }));
    parts.push(R(cx - 26, topY - 4, 52, 12, { fill: 'var(--paper-3)', stroke: INK, sw: 1.2 }));
    for (let i = 0; i < 6; i += 1) {
      const py = topY + 26 + i * ((botY - topY - 34) / 6);
      for (const s of [-1, 1]) {
        parts.push(C(cx + s * 22, py, 3.2, { stroke: LINE, sw: 0.9 }));
        parts.push(R(cx + s * 11, py - 2, 5, 4, { fill: PAPER, stroke: LINE, sw: 0.7 }));
      }
    }
    parts.push(C(cx, topY - 14, 3, { stroke: ACC, fill: ACC }));
    parts.push(T(cx, topY - 22, 'spirit way', { fill: ACC, size: 7 }));
    return parts.join('');
  },

  /* 彩绘装饰木构 — a facade with brackets and infill */
  'painted-timber'(x, y, w, h, rand) {
    const parts = [];
    const baseY = y + h - 14;
    const bays = 3;
    const bw = (w - 40) / bays;
    parts.push(R(x + 18, baseY - 34, w - 36, 34, { fill: PAPER, stroke: INK, sw: 1.2 }));
    for (let i = 0; i < bays; i += 1) {
      const bx = x + 18 + i * bw;
      parts.push(R(bx + 5, baseY - 24, bw - 10, 24, { stroke: LINE, sw: 0.9, extra: 'stroke-dasharray="3 2"' }));
      parts.push(dougongGlyph(bx + bw / 2, baseY - 34, 0.5));
    }
    parts.push(R(x + 14, baseY - 40, w - 28, 6, { fill: 'var(--paper-3)', stroke: INK, sw: 1 }));
    parts.push(P(roofProfile(x + 16, baseY - 40, w - 32, 22, 14), { stroke: INK, sw: 1.3 }));
    parts.push(L(x + 12, baseY, x + w - 12, baseY, { sw: 1.2 }));
    parts.push(L(x + 20, baseY - 32, x + 20, baseY, { sw: 0.8, stroke: ACC }));
    return parts.join('');
  },

  /* 防御工事 — wall with watchtowers */
  fortification(x, y, w, h, rand) {
    const parts = [];
    const baseY = y + h - 12;
    const wallTop = y + h - 34;
    parts.push(R(x + 16, wallTop, w - 32, baseY - wallTop, { fill: 'var(--paper-3)', stroke: INK, sw: 1.2 }));
    for (let i = 0; i < 9; i += 1) {
      parts.push(R(x + 22 + i * ((w - 50) / 9), wallTop - 6, 10, 6, { fill: PAPER, stroke: INK, sw: 0.8 }));
    }
    for (const tx of [x + 34, x + w - 34]) {
      parts.push(R(tx - 9, wallTop - 24, 18, 24, { fill: PAPER, stroke: INK, sw: 1.1 }));
      parts.push(R(tx - 12, wallTop - 28, 24, 5, { fill: 'var(--paper-3)', stroke: INK, sw: 0.9 }));
    }
    parts.push(L(x + 12, baseY, x + w - 12, baseY, { sw: 1.2 }));
    return parts.join('');
  },

  /* 覆钵式塔 — a stupa */
  stupa(x, y, w, h, rand) {
    const parts = [];
    const cx = x + w / 2;
    const baseY = y + h - 12;
    parts.push(R(cx - 30, baseY - 10, 60, 10, { fill: 'var(--paper-3)', stroke: INK, sw: 1.1 }));
    parts.push(P(`M${cx - 16} ${baseY - 10} L${cx - 11} ${baseY - 34} L${cx + 11} ${baseY - 34} L${cx + 16} ${baseY - 10} Z`, { stroke: INK, sw: 1.2, fill: PAPER }));
    parts.push(P(`M${cx - 18} ${baseY - 34} Q${cx - 18} ${baseY - 56} ${cx} ${baseY - 58} Q${cx + 18} ${baseY - 56} ${cx + 18} ${baseY - 34} Z`, { stroke: INK, sw: 1.2, fill: PAPER }));
    parts.push(R(cx - 6, baseY - 66, 12, 9, { fill: PAPER, stroke: INK, sw: 1 }));
    parts.push(L(cx, baseY - 66, cx, baseY - 78, { sw: 1.1 }));
    parts.push(C(cx, baseY - 81, 3.2, { stroke: ACC, fill: ACC }));
    for (let i = 0; i < 3; i += 1) {
      parts.push(C(cx - 11 + i * 11, baseY - 46, 1.6, { stroke: LINE, sw: 0.7 }));
    }
    return parts.join('');
  },
};

/* ---------- public API ---------- */

/**
 * Build an SVG drawing for a catalog entry.
 * @param {object} item  a case from the catalog
 * @param {object} [opts] { w, h, label }
 * @returns {string} SVG markup
 */
export function caseDrawing(item, opts = {}) {
  const w = opts.w ?? 320;
  const h = opts.h ?? 200;
  const seed = hash(item.id);
  const rand = rng(seed);
  const gen = GENERATORS[item.system] || GENERATORS.taoliang;
  const jitter = (rand() - 0.5) * 6;
  const body = gen(16, 12 + jitter, w - 32, h - 30, rand);
  return `<svg viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg" role="img" aria-hidden="true" preserveAspectRatio="xMidYMid meet">${body}</svg>`;
}

/** Small monochrome mark used on cards and in the rail. */
export function caseMark(item, size = 40) {
  const seed = hash(item.id);
  const rand = rng(seed);
  const gen = GENERATORS[item.system] || GENERATORS.taoliang;
  const body = gen(6, 6, size - 12, size - 12, rand);
  return `<svg viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">${body}</svg>`;
}

/** Decorative cover art for the hero. */
export function heroCover(w = 520, h = 380) {
  const parts = [];
  const cx = w / 2;
  const baseY = h - 46;
  // a row of three archetypes: bracket set, frame, arch
  parts.push(dougongGlyph(cx - 150, baseY - 74, 1.6));
  parts.push(R(cx - 170, baseY - 66, 40, 66, { fill: PAPER, stroke: INK, sw: 1.2 }));
  parts.push(P(roofProfile(cx - 186, baseY - 66, 72, 26, 18), { stroke: INK, sw: 1.4 }));

  parts.push(R(cx - 26, baseY - 52, 12, 52, { fill: PAPER, stroke: INK, sw: 1.1 }));
  parts.push(R(cx + 14, baseY - 52, 12, 52, { fill: PAPER, stroke: INK, sw: 1.1 }));
  parts.push(R(cx - 30, baseY - 58, 44, 7, { fill: PAPER, stroke: INK, sw: 1.1 }));
  parts.push(P(roofProfile(cx - 34, baseY - 58, 52, 24, 16), { stroke: INK, sw: 1.4 }));

  const span = 120;
  parts.push(P(`M${cx + 74} ${baseY - 44} Q${cx + 74 + span / 2} ${baseY - 4} ${cx + 74 + span} ${baseY - 44}`, { stroke: INK, sw: 1.4 }));
  parts.push(R(cx + 66, baseY - 52, span + 16, 8, { fill: PAPER, stroke: INK, sw: 1.1 }));
  parts.push(L(cx + 62, baseY, cx + 74 + span + 18, baseY, { sw: 1.2 }));

  parts.push(L(24, baseY + 10, w - 24, baseY + 10, { sw: 1.1, stroke: LINE }));
  for (let i = 0; i < 5; i += 1) {
    parts.push(C(34 + i * ((w - 68) / 4), baseY + 26, 2.6, { stroke: i === 2 ? ACC : LINE, sw: 1 }));
  }
  return `<svg viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg" role="img" aria-hidden="true">${parts.join('')}</svg>`;
}

/** A compact 2D section diagram used as the WebGL fallback for a lab. */
export function labFallback(labId, w = 640, h = 460) {
  const seed = hash(labId);
  const rand = rng(seed);
  const gen = GENERATORS[labId] || GENERATORS.taoliang;
  const body = gen(20, 20, w - 40, h - 60, rand);
  return `<svg viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg" role="img" preserveAspectRatio="xMidYMid meet">
    <rect x="0" y="0" width="${w}" height="${h}" fill="none"/>
    ${body}
    <text x="${w / 2}" y="${h - 14}" font-size="11" fill="var(--ink-3)" font-family="var(--font-mono)" text-anchor="middle">2D schematic · not to scale</text>
  </svg>`;
}
