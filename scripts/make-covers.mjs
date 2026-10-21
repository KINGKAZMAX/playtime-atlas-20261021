#!/usr/bin/env node
/**
 * 封面生成器 — 为总目录中的每一件作品程序化生成一张原创封面。
 *
 * 全部图形由确定性伪随机数驱动：同一 id 永远得到同一张图，
 * 因此仓库内可直接提交 SVG 源文件，线上与本地完全一致。
 * 不使用任何第三方图像素材。
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'site', 'assets', 'covers');

const PALETTES = {
  standalone: { bg: ['#0a1020', '#111a2e'], ink: '#f3ede1', accent: '#ff6a2b', aux: '#4fd6e8' },
  museum: { bg: ['#0b1226', '#1b2140'], ink: '#f3ede1', accent: '#f0b24a', aux: '#7a6cff' },
  era: { bg: ['#0d0f1c', '#1c1730'], ink: '#f3ede1', accent: '#ff4f7b', aux: '#58d6c8' },
  archive: { bg: ['#0a0d16', '#182030'], ink: '#efe8d8', accent: '#8fd14f', aux: '#6aa8ff' },
  qa: { bg: ['#0c1114', '#152022'], ink: '#f0ece2', accent: '#37c98b', aux: '#ffc14d' },
};

function hash(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const W = 800;
const H = 500;

function frame(p, r) {
  const pad = 26;
  return `M${pad} ${pad} H${W - pad} V${H - pad} H${pad} Z`;
}

function motifAperture(body, p, r) {
  const cx = W * 0.5;
  const cy = H * 0.52;
  const rings = 9;
  for (let i = 0; i < rings; i++) {
    const rad = 48 + i * 20 + r() * 6;
    const dash = 6 + r() * 26;
    body.push(
      `<circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="${rad.toFixed(1)}" fill="none" stroke="${p.accent}" stroke-opacity="${(0.5 - i * 0.045).toFixed(3)}" stroke-width="${(1.6 - i * 0.1).toFixed(2)}" stroke-dasharray="${dash.toFixed(1)} ${(dash * 0.6).toFixed(1)}"/>`
    );
  }
  const spokes = 36;
  for (let i = 0; i < spokes; i++) {
    const a = (i / spokes) * Math.PI * 2 + r() * 0.04;
    const r1 = 44 + r() * 12;
    const r2 = r1 + 14 + r() * 44;
    body.push(
      `<line x1="${(cx + Math.cos(a) * r1).toFixed(1)}" y1="${(cy + Math.sin(a) * r1).toFixed(1)}" x2="${(cx + Math.cos(a) * r2).toFixed(1)}" y2="${(cy + Math.sin(a) * r2).toFixed(1)}" stroke="${p.aux}" stroke-opacity="0.5" stroke-width="1"/>`
    );
  }
  // 唯一签名图形：由种子决定的多边形，保证每件作品的封面可区分
  const verts = 5 + Math.floor(r() * 4);
  const rr = 26 + r() * 22;
  const off = r() * Math.PI;
  const pts = Array.from({ length: verts }, (_, i) => {
    const a = off + (i / verts) * Math.PI * 2;
    const rad = rr * (0.58 + r() * 0.52);
    return `${(cx + Math.cos(a) * rad).toFixed(1)},${(cy + Math.sin(a) * rad).toFixed(1)}`;
  }).join(' ');
  body.push(`<polygon points="${pts}" fill="none" stroke="${p.ink}" stroke-opacity="0.55" stroke-width="1.3" stroke-linejoin="round"/>`);
  body.push(`<circle cx="${cx}" cy="${cy}" r="17" fill="${p.ink}" fill-opacity="0.92"/>`);
  body.push(`<circle cx="${cx}" cy="${cy}" r="6" fill="${p.accent}"/>`);
}

function motifCorridor(body, p, r) {
  const cx = W * 0.5;
  const cy = H * 0.5;
  const frames = 11;
  for (let i = frames; i > 0; i--) {
    const t = i / frames;
    const w = 640 * t;
    const h = 380 * t;
    const stroke = i % 3 === 0 ? p.accent : p.aux;
    body.push(
      `<rect x="${(cx - w / 2).toFixed(1)}" y="${(cy - h / 2).toFixed(1)}" width="${w.toFixed(1)}" height="${h.toFixed(1)}" fill="none" stroke="${stroke}" stroke-opacity="${(0.16 + 0.5 * (1 - t)).toFixed(3)}" stroke-width="${i % 3 === 0 ? 1.8 : 1}"/>`
    );
  }
  for (let i = 0; i < 40; i++) {
    const x = 60 + r() * (W - 120);
    const y = 60 + r() * (H - 120);
    body.push(`<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${(0.8 + r() * 2.1).toFixed(2)}" fill="${p.ink}" fill-opacity="0.42"/>`);
  }
  body.push(`<rect x="${cx - 52}" y="${cy - 52}" width="104" height="104" fill="none" stroke="${p.ink}" stroke-opacity="0.5" stroke-width="1.2" transform="rotate(45 ${cx} ${cy})"/>`);
}

function motifTimeline(body, p, r) {
  const y = H * 0.55;
  body.push(`<line x1="46" y1="${y}" x2="${W - 46}" y2="${y}" stroke="${p.aux}" stroke-opacity="0.45" stroke-width="1.4"/>`);
  const n = 26;
  // 由种子决定的高亮刻度：让同一年代批次的每张封面可区分
  const hi = Math.floor(r() * (n + 1));
  for (let i = 0; i <= n; i++) {
    const x = 46 + ((W - 92) * i) / n;
    const tall = i % 5 === 0;
    const h = tall ? 46 + r() * 20 : 12 + r() * 14;
    const isHi = i === hi;
    body.push(
      `<line x1="${x.toFixed(1)}" y1="${(y - h).toFixed(1)}" x2="${x.toFixed(1)}" y2="${(y + h * 0.4).toFixed(1)}" stroke="${isHi ? p.accent : tall ? p.ink : p.ink}" stroke-opacity="${isHi ? 1 : tall ? 0.85 : 0.4}" stroke-width="${isHi ? 3.4 : tall ? 2 : 1}"/>`
    );
    if (isHi) {
      body.push(`<circle cx="${x.toFixed(1)}" cy="${(y - h - 16).toFixed(1)}" r="5.5" fill="${p.accent}"/>`);
      body.push(`<circle cx="${x.toFixed(1)}" cy="${(y - h - 16).toFixed(1)}" r="11" fill="none" stroke="${p.accent}" stroke-opacity="0.45" stroke-width="1.2"/>`);
    }
  }
  for (let i = 0; i < 5; i++) {
    const x = 70 + r() * (W - 140);
    const y2 = H * 0.16 + r() * (H * 0.66);
    body.push(`<circle cx="${x.toFixed(1)}" cy="${y2.toFixed(1)}" r="${(2 + r() * 4).toFixed(2)}" fill="${p.accent}" fill-opacity="0.65"/>`);
  }
  for (let i = 0; i < 7; i++) {
    const y2 = 70 + i * 52 + r() * 8;
    body.push(`<line x1="46" y1="${y2.toFixed(1)}" x2="${(46 + r() * 120).toFixed(1)}" y2="${y2.toFixed(1)}" stroke="${p.ink}" stroke-opacity="0.16" stroke-width="1"/>`);
  }
}

function motifLedger(body, p, r) {
  const x0 = 120;
  const x1 = W - 90;
  for (let i = 0; i < 11; i++) {
    const y = 96 + i * 30;
    const w = x0 + r() * (x1 - x0);
    body.push(`<line x1="${x0}" y1="${y}" x2="${w.toFixed(1)}" y2="${y}" stroke="${p.ink}" stroke-opacity="0.2" stroke-width="1.4"/>`);
  }
  for (let i = 0; i < 11; i++) {
    const y = 96 + i * 30;
    body.push(`<circle cx="${(x0 - 26).toFixed(1)}" cy="${y}" r="3.4" fill="${i % 3 === 0 ? p.accent : p.aux}" fill-opacity="0.8"/>`);
  }
  body.push(`<line x1="${x0 - 8}" y1="78" x2="${x0 - 8}" y2="404" stroke="${p.aux}" stroke-opacity="0.5" stroke-width="1.4"/>`);
  body.push(`<rect x="70" y="70" width="26" height="342" fill="none" stroke="${p.accent}" stroke-opacity="0.5" stroke-width="1.2"/>`);
}

function motifMatrix(body, p, r) {
  const cols = 9;
  const rows = 6;
  const pad = 70;
  const cw = (W - pad * 2) / cols;
  const ch = (H - pad * 2) / rows;
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      const v = r();
      const x = pad + i * cw;
      const y = pad + j * ch;
      if (v > 0.78) {
        body.push(`<rect x="${(x + 4).toFixed(1)}" y="${(y + 4).toFixed(1)}" width="${(cw - 8).toFixed(1)}" height="${(ch - 8).toFixed(1)}" fill="${p.accent}" fill-opacity="0.55"/>`);
      } else if (v > 0.52) {
        body.push(`<rect x="${(x + 4).toFixed(1)}" y="${(y + 4).toFixed(1)}" width="${(cw - 8).toFixed(1)}" height="${(ch - 8).toFixed(1)}" fill="none" stroke="${p.aux}" stroke-opacity="0.4" stroke-width="1"/>`);
      } else {
        body.push(`<circle cx="${(x + cw / 2).toFixed(1)}" cy="${(y + ch / 2).toFixed(1)}" r="2" fill="${p.ink}" fill-opacity="0.3"/>`);
      }
    }
  }
}

const MOTIFS = {
  standalone: motifAperture,
  museum: motifCorridor,
  era: motifTimeline,
  archive: motifLedger,
  qa: motifMatrix,
};

function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function buildSvg(work, index) {
  const p = PALETTES[work.section] || PALETTES.standalone;
  const r = rng(hash(work.id));
  const body = [];
  MOTIFS[work.section](body, p, r);

  const gid = `g${hash(work.id).toString(36)}`;
  const label = (work.subtitle || work.title).toUpperCase();
  const idNo = String(index).padStart(2, '0');

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="${esc(work.title)} 封面">
  <defs>
    <linearGradient id="${gid}" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${p.bg[0]}"/>
      <stop offset="1" stop-color="${p.bg[1]}"/>
    </linearGradient>
    <radialGradient id="${gid}v" cx="0.5" cy="0.5" r="0.72">
      <stop offset="0" stop-color="#ffffff" stop-opacity="0.10"/>
      <stop offset="1" stop-color="#000000" stop-opacity="0.22"/>
    </radialGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#${gid})"/>
  <g>${body.join('')}</g>
  <rect width="${W}" height="${H}" fill="url(#${gid}v)"/>
  <path d="${frame(p, r)}" fill="none" stroke="${p.ink}" stroke-opacity="0.14" stroke-width="1"/>
  <g font-family="ui-monospace, SFMono-Regular, Menlo, monospace">
    <text x="46" y="66" fill="${p.ink}" fill-opacity="0.9" font-size="15" letter-spacing="3">${esc(idNo)}</text>
    <text x="${W - 46}" y="66" fill="${p.accent}" fill-opacity="0.95" font-size="13" letter-spacing="2.6" text-anchor="end">${esc(label).slice(0, 30)}</text>
    <text x="46" y="${H - 44}" fill="${p.ink}" fill-opacity="0.55" font-size="12" letter-spacing="2.2">${esc((work.era || '').toUpperCase())}</text>
    <text x="${W - 46}" y="${H - 44}" fill="${p.ink}" fill-opacity="0.4" font-size="12" letter-spacing="2.2" text-anchor="end">${esc((work.kind || '').slice(0, 22))}</text>
  </g>
</svg>
`;
}

function main() {
  const manifest = JSON.parse(fs.readFileSync(path.join(ROOT, 'works.json'), 'utf8'));
  fs.mkdirSync(OUT, { recursive: true });
  manifest.works.forEach((work, i) => {
    const file = path.join(OUT, `${work.id}.svg`);
    fs.writeFileSync(file, buildSvg(work, i + 1));
  });
  console.log(`[covers] 生成 ${manifest.works.length} 张封面 → ${path.relative(ROOT, OUT)}`);
}

main();
