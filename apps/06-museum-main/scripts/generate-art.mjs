#!/usr/bin/env node
/**
 * 原创美术包生成器 · 回响电玩馆
 *
 * 生成一套**完全自绘**的 SVG 资产（无第三方素材、无品牌标识）：
 *   - mark.svg            馆徽（同心回响波纹 + 展厅轮廓）
 *   - era-eXX-poster.svg  年代海报（展门封面）
 *   - era-eXX-backdrop.svg 年代背景纹理（卡片/展厅底纹）
 *   - form-<type>.svg     硬件与游戏载体轮廓（用于展签与 3D 展厅降级）
 *
 * 若 07-museum-art 产出正式美术包，scripts/sync-exhibits.mjs 会用其资产覆盖本目录。
 * 本生成器始终可重跑，输出确定性（固定随机种子），便于 diff 与复现。
 */

import { mkdir, writeFile, readdir, unlink, readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'public', 'art');

// ── 调色板 ────────────────────────────────────────────────────────────────
// 依据 16-design-system/design-tokens.json §1（深色主题取值）：
//   背景 --ds-bg #100F0E / --ds-bg-raised #1A1917
//   文字 --ds-ink #F7F4F0
//   唯一强调色 --ds-accent #E0684A
// 年代辅色（ERA_THEME）是**展柜身份标识**，不属于 UI 强调色，保持不变。
const INK = '#1A1917';
const INK_DEEP = '#100F0E';
const PAPER = '#F7F4F0';
const SIGNAL = '#E0684A';

const ERA_THEME = [
  { id: 'e01', code: '1950s', label: '计算的童年', accent: '#6FC7BE', motif: 'tape' },
  { id: 'e02', code: '1960s', label: '太空竞赛与光点', accent: '#9AA7FF', motif: 'vector' },
  { id: 'e03', code: '1970s', label: '街机黎明', accent: '#FF8A4F', motif: 'arcade' },
  { id: 'e04', code: '1978–84', label: '街机黄金与八位机', accent: '#FF5C7A', motif: 'pixel' },
  { id: 'e05', code: '1985–90', label: '十六位世代', accent: '#FFC24B', motif: 'tiles' },
  { id: 'e06', code: '1991–96', label: '三维与光盘', accent: '#7BD3F0', motif: 'poly' },
  { id: 'e07', code: '1997–04', label: '网络与掌机', accent: '#57D6A6', motif: 'network' },
  { id: 'e08', code: '2005–13', label: '数字分发与移动', accent: '#FF9F45', motif: 'touch' },
  { id: 'e09', code: '2014–19', label: '独立浪潮与 VR', accent: '#B48CFF', motif: 'radial' },
  { id: 'e10', code: '2020–26', label: '云端与新形态', accent: '#A8E063', motif: 'cloud' },
];

/** 确定性伪随机（mulberry32），保证每次生成结果一致 */
function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const seedFrom = (str) => [...str].reduce((h, c) => (Math.imul(h, 31) + c.charCodeAt(0)) | 0, 7);

const esc = (s) => String(s).replace(/&/g, '&').replace(/</g, '<').replace(/>/g, '>');

// ── 年代底纹 ────────────────────────────────────────────────────────────────
function backdrop(theme) {
  const r = rng(seedFrom(theme.id + theme.motif));
  const W = 1200, H = 700;
  const parts = [];
  parts.push(`<rect width="${W}" height="${H}" fill="${INK_DEEP}"/>`);
  parts.push(`<rect width="${W}" height="${H}" fill="url(#fade)"/>`);

  const g = [];
  switch (theme.motif) {
    case 'tape': {
      // 打孔纸带：横向带 + 规则孔洞
      for (let y = 40; y < H; y += 54) {
        g.push(`<rect x="0" y="${y}" width="${W}" height="26" fill="${theme.accent}" opacity="0.07"/>`);
        for (let x = 24; x < W; x += 42) {
          g.push(`<circle cx="${x}" cy="${y + 13}" r="3.4" fill="${theme.accent}" opacity="${(0.12 + r() * 0.3).toFixed(2)}"/>`);
          if (r() > 0.72) g.push(`<circle cx="${x}" cy="${y + 13}" r="3.4" fill="${PAPER}" opacity="0.16"/>`);
        }
      }
      break;
    }
    case 'vector': {
      // 示波器式矢量线
      for (let i = 0; i < 26; i += 1) {
        const y0 = r() * H;
        let d = `M -40 ${y0.toFixed(1)}`;
        for (let x = 0; x <= W + 80; x += 80) {
          d += ` L ${x} ${(y0 + Math.sin((x / 140) + i) * (18 + r() * 60)).toFixed(1)}`;
        }
        g.push(`<path d="${d}" fill="none" stroke="${theme.accent}" stroke-width="1.3" opacity="${(0.1 + r() * 0.28).toFixed(2)}"/>`);
      }
      break;
    }
    case 'arcade': {
      // 街机厅霓虹：竖向光柱
      for (let x = 20; x < W; x += 78) {
        const h = 120 + r() * 420;
        g.push(`<rect x="${x}" y="${(H - h).toFixed(0)}" width="26" height="${h.toFixed(0)}" rx="13" fill="${theme.accent}" opacity="${(0.06 + r() * 0.16).toFixed(2)}"/>`);
      }
      g.push(`<rect x="0" y="${H - 74}" width="${W}" height="74" fill="${INK}" opacity="0.55"/>`);
      for (let x = 60; x < W; x += 150) {
        g.push(`<rect x="${x}" y="${H - 52}" width="86" height="30" rx="6" fill="${SIGNAL}" opacity="${(0.05 + r() * 0.1).toFixed(2)}"/>`);
      }
      break;
    }
    case 'pixel': {
      // 像素阵列
      const cell = 34;
      for (let y = 0; y < H / cell; y += 1) {
        for (let x = 0; x < W / cell; x += 1) {
          if (r() > 0.82) {
            g.push(`<rect x="${x * cell}" y="${y * cell}" width="${cell - 8}" height="${cell - 8}" fill="${theme.accent}" opacity="${(0.08 + r() * 0.3).toFixed(2)}"/>`);
          }
        }
      }
      break;
    }
    case 'tiles': {
      // 16 色色块
      const cell = 64;
      for (let y = 0; y < H / cell; y += 1) {
        for (let x = 0; x < W / cell; x += 1) {
          if (r() > 0.7) {
            g.push(`<rect x="${x * cell + 6}" y="${y * cell + 6}" width="${cell - 12}" height="${cell - 12}" rx="5" fill="${theme.accent}" opacity="${(0.05 + r() * 0.18).toFixed(2)}"/>`);
          }
        }
      }
      break;
    }
    case 'poly': {
      // 多边形线框
      for (let i = 0; i < 16; i += 1) {
        const cx = r() * W, cy = r() * H, rad = 40 + r() * 150, n = 5 + Math.floor(r() * 4);
        const pts = [];
        for (let k = 0; k < n; k += 1) {
          const a = (k / n) * Math.PI * 2;
          pts.push(`${(cx + Math.cos(a) * rad).toFixed(1)},${(cy + Math.sin(a) * rad).toFixed(1)}`);
        }
        g.push(`<polygon points="${pts.join(' ')}" fill="none" stroke="${theme.accent}" stroke-width="1.4" opacity="${(0.1 + r() * 0.26).toFixed(2)}"/>`);
      }
      break;
    }
    case 'network': {
      // 节点网络
      const nodes = Array.from({ length: 42 }, () => [r() * W, r() * H]);
      nodes.forEach(([x, y], i) => {
        nodes.slice(i + 1).forEach(([x2, y2]) => {
          const d = Math.hypot(x - x2, y - y2);
          if (d < 190) g.push(`<line x1="${x.toFixed(1)}" y1="${y.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="${theme.accent}" stroke-width="0.9" opacity="${(0.28 * (1 - d / 190)).toFixed(2)}"/>`);
        });
        g.push(`<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${(2 + r() * 4).toFixed(1)}" fill="${theme.accent}" opacity="${(0.2 + r() * 0.45).toFixed(2)}"/>`);
      });
      break;
    }
    case 'touch': {
      // 触控点与下载箭头
      for (let i = 0; i < 34; i += 1) {
        const cx = r() * W, cy = r() * H, rad = 12 + r() * 60;
        g.push(`<circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="${rad.toFixed(1)}" fill="none" stroke="${theme.accent}" stroke-width="1.6" opacity="${(0.08 + r() * 0.2).toFixed(2)}"/>`);
      }
      for (let i = 0; i < 12; i += 1) {
        const x = r() * W, y = r() * (H - 120);
        g.push(`<path d="M ${x.toFixed(1)} ${y.toFixed(1)} L ${x.toFixed(1)} ${(y + 60).toFixed(1)} M ${(x - 11).toFixed(1)} ${(y + 48).toFixed(1)} L ${x.toFixed(1)} ${(y + 60).toFixed(1)} L ${(x + 11).toFixed(1)} ${(y + 48).toFixed(1)}" stroke="${SIGNAL}" stroke-width="2" fill="none" opacity="${(0.14 + r() * 0.26).toFixed(2)}"/>`);
      }
      break;
    }
    case 'radial': {
      // 放射状光束与头显环
      const cx = W * 0.5, cy = H * 0.52;
      for (let i = 0; i < 40; i += 1) {
        const a = (i / 40) * Math.PI * 2;
        g.push(`<line x1="${cx}" y1="${cy}" x2="${(cx + Math.cos(a) * 700).toFixed(1)}" y2="${(cy + Math.sin(a) * 700).toFixed(1)}" stroke="${theme.accent}" stroke-width="1.1" opacity="${(0.05 + r() * 0.12).toFixed(2)}"/>`);
      }
      g.push(`<ellipse cx="${cx}" cy="${cy}" rx="230" ry="150" fill="none" stroke="${theme.accent}" stroke-width="2.4" opacity="0.3"/>`);
      g.push(`<ellipse cx="${cx}" cy="${cy}" rx="150" ry="96" fill="none" stroke="${theme.accent}" stroke-width="1.4" opacity="0.2"/>`);
      break;
    }
    case 'cloud': {
      // 云层粒子与数据流
      for (let i = 0; i < 80; i += 1) {
        const cx = r() * W, cy = 120 + r() * (H - 200), rad = 30 + r() * 110;
        g.push(`<circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="${rad.toFixed(1)}" fill="${theme.accent}" opacity="${(0.03 + r() * 0.07).toFixed(2)}"/>`);
      }
      for (let i = 0; i < 20; i += 1) {
        const x = r() * W;
        g.push(`<path d="M ${x.toFixed(1)} 0 L ${(x - 26).toFixed(1)} ${H}" stroke="${theme.accent}" stroke-width="1" opacity="${(0.05 + r() * 0.12).toFixed(2)}"/>`);
      }
      break;
    }
    default: break;
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="${esc(theme.code)} 年代底纹">
  <defs>
    <linearGradient id="fade" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${INK_DEEP}" stop-opacity="0.2"/>
      <stop offset="100%" stop-color="${INK}" stop-opacity="0.85"/>
    </linearGradient>
  </defs>
  ${parts.join('\n  ')}
  ${g.join('\n  ')}
</svg>`;
}

// ── 年代海报 ────────────────────────────────────────────────────────────────
function poster(theme) {
  const W = 900, H = 1200;
  const r = rng(seedFrom(theme.id + 'poster'));
  const spark = [];
  for (let i = 0; i < 60; i += 1) {
    spark.push(`<circle cx="${(r() * W).toFixed(0)}" cy="${(r() * H).toFixed(0)}" r="${(0.8 + r() * 2.2).toFixed(1)}" fill="${PAPER}" opacity="${(0.08 + r() * 0.3).toFixed(2)}"/>`);
  }
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="${esc(theme.code)} ${esc(theme.label)} 年代海报">
  <defs>
    <linearGradient id="pg" x1="0" y1="0" x2="0.6" y2="1">
      <stop offset="0%" stop-color="${INK}"/>
      <stop offset="55%" stop-color="${INK_DEEP}"/>
      <stop offset="100%" stop-color="${theme.accent}" stop-opacity="0.22"/>
    </linearGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#pg)"/>
  ${spark.join('\n  ')}
  <g opacity="0.5">
    <rect x="56" y="56" width="${W - 112}" height="${H - 112}" fill="none" stroke="${theme.accent}" stroke-width="2" opacity="0.55"/>
    <rect x="74" y="74" width="${W - 148}" height="${H - 148}" fill="none" stroke="${theme.accent}" stroke-width="1" opacity="0.3"/>
  </g>
  <text x="96" y="300" font-family="Georgia, 'Songti SC', serif" font-size="132" fill="${theme.accent}" letter-spacing="6">${esc(theme.code)}</text>
  <text x="96" y="392" font-family="'PingFang SC', 'Noto Sans CJK SC', sans-serif" font-size="58" font-weight="600" fill="${PAPER}">${esc(theme.label)}</text>
  <rect x="96" y="430" width="180" height="6" fill="${SIGNAL}"/>
  <text x="96" y="1120" font-family="'SF Mono', Menlo, monospace" font-size="26" fill="${PAPER}" opacity="0.72" letter-spacing="3">PLAYTIME ATLAS · 回响电玩馆</text>
</svg>`;
}

// ── 馆徽 ────────────────────────────────────────────────────────────────────
function mark() {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120" role="img" aria-label="回响电玩馆馆徽">
  <defs>
    <linearGradient id="mg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${SIGNAL}"/>
      <stop offset="100%" stop-color="#EE8266"/>
    </linearGradient>
  </defs>
  <rect width="120" height="120" rx="26" fill="${INK}"/>
  <g fill="none" stroke="url(#mg)" stroke-linecap="round">
    <path d="M28 78 Q60 96 92 78" stroke-width="4" opacity="0.95"/>
    <path d="M34 62 Q60 78 86 62" stroke-width="3" opacity="0.62"/>
    <path d="M41 46 Q60 60 79 46" stroke-width="2.4" opacity="0.38"/>
  </g>
  <path d="M60 22 L84 50 L60 38 L36 50 Z" fill="${PAPER}" opacity="0.92"/>
  <circle cx="60" cy="26" r="4" fill="${SIGNAL}"/>
</svg>`;
}

// ── 硬件与载体轮廓 ──────────────────────────────────────────────────────────
const FORMS = {
  console: `<rect x="14" y="52" width="92" height="36" rx="9" fill="${PAPER}" opacity="0.9"/><rect x="26" y="64" width="26" height="6" rx="3" fill="${INK}"/><circle cx="86" cy="67" r="6" fill="${SIGNAL}"/><rect x="96" y="62" width="8" height="10" rx="3" fill="${PAPER}" opacity="0.55"/>`,
  cabinet: `<path d="M40 16 h40 l8 26 v56 a8 8 0 0 1 -8 8 h-40 a8 8 0 0 1 -8 -8 v-56 z" fill="${PAPER}" opacity="0.9"/><rect x="42" y="28" width="36" height="26" rx="5" fill="${INK}"/><circle cx="60" cy="41" r="6" fill="${SIGNAL}"/><rect x="40" y="66" width="40" height="7" rx="3.5" fill="${INK}" opacity="0.7"/><rect x="46" y="80" width="28" height="7" rx="3.5" fill="${INK}" opacity="0.45"/>`,
  handheld: `<rect x="34" y="22" width="52" height="76" rx="12" fill="${PAPER}" opacity="0.9"/><rect x="42" y="30" width="36" height="34" rx="4" fill="${INK}"/><circle cx="51" cy="76" r="6" fill="${INK}" opacity="0.6"/><circle cx="69" cy="76" r="6" fill="${INK}" opacity="0.6"/><rect x="57" y="68" width="6" height="16" rx="3" fill="${SIGNAL}"/>`,
  computer: `<rect x="18" y="28" width="84" height="44" rx="6" fill="${PAPER}" opacity="0.9"/><rect x="26" y="36" width="68" height="28" rx="3" fill="${INK}"/><rect x="40" y="78" width="40" height="10" rx="4" fill="${PAPER}" opacity="0.7"/><rect x="30" y="92" width="60" height="8" rx="4" fill="${PAPER}" opacity="0.45"/><circle cx="90" cy="36" r="3" fill="${SIGNAL}"/>`,
  rack: `<rect x="26" y="12" width="68" height="96" rx="7" fill="${PAPER}" opacity="0.9"/><g fill="${INK}" opacity="0.55"><rect x="34" y="22" width="52" height="10" rx="3"/><rect x="34" y="38" width="52" height="10" rx="3"/><rect x="34" y="54" width="52" height="10" rx="3"/><rect x="34" y="70" width="52" height="10" rx="3"/><rect x="34" y="86" width="52" height="10" rx="3"/></g><circle cx="80" cy="27" r="2.6" fill="${SIGNAL}"/><circle cx="80" cy="59" r="2.6" fill="${SIGNAL}"/>`,
  monitor: `<rect x="16" y="24" width="88" height="62" rx="8" fill="${PAPER}" opacity="0.9"/><rect x="26" y="34" width="68" height="42" rx="4" fill="${INK}"/><path d="M34 62 L48 48 L58 58 L70 44 L86 60" fill="none" stroke="${SIGNAL}" stroke-width="2.6" stroke-linecap="round"/><rect x="44" y="86" width="32" height="8" rx="4" fill="${PAPER}" opacity="0.6"/><rect x="34" y="98" width="52" height="8" rx="4" fill="${PAPER}" opacity="0.4"/>`,
  terminal: `<rect x="20" y="20" width="80" height="58" rx="7" fill="${PAPER}" opacity="0.9"/><rect x="29" y="30" width="62" height="38" rx="3" fill="${INK}"/><g fill="${SIGNAL}" opacity="0.85"><rect x="34" y="36" width="26" height="3.4" rx="1.7"/><rect x="34" y="44" width="40" height="3.4" rx="1.7"/><rect x="34" y="52" width="18" height="3.4" rx="1.7"/></g><rect x="32" y="84" width="56" height="9" rx="4" fill="${PAPER}" opacity="0.55"/>`,
  disc: `<circle cx="60" cy="60" r="42" fill="${PAPER}" opacity="0.9"/><circle cx="60" cy="60" r="42" fill="none" stroke="${INK}" stroke-width="1" opacity="0.15"/><circle cx="60" cy="60" r="26" fill="none" stroke="${INK}" stroke-width="1.4" opacity="0.2"/><circle cx="60" cy="60" r="12" fill="${INK}" opacity="0.25"/><path d="M60 18 A42 42 0 0 1 96 42 L60 42 Z" fill="${SIGNAL}" opacity="0.6"/>`,
  cartridge: `<path d="M30 26 h60 v58 a10 10 0 0 1 -10 10 h-40 a10 10 0 0 1 -10 -10 z" fill="${PAPER}" opacity="0.9"/><rect x="38" y="36" width="44" height="30" rx="4" fill="${INK}" opacity="0.85"/><rect x="38" y="72" width="44" height="5" rx="2.5" fill="${INK}" opacity="0.4"/><rect x="38" y="82" width="26" height="5" rx="2.5" fill="${SIGNAL}" opacity="0.7"/>`,
  chip: `<rect x="28" y="28" width="64" height="64" rx="9" fill="${PAPER}" opacity="0.9"/><rect x="40" y="40" width="40" height="40" rx="5" fill="${INK}" opacity="0.85"/><g stroke="${PAPER}" stroke-width="3" opacity="0.9">${Array.from({ length: 6 }, (_, i) => `<line x1="${34 + i * 8}" y1="28" x2="${34 + i * 8}" y2="18"/><line x1="${34 + i * 8}" y1="92" x2="${34 + i * 8}" y2="102"/><line x1="28" y1="${34 + i * 8}" x2="18" y2="${34 + i * 8}"/><line x1="92" y1="${34 + i * 8}" x2="102" y2="${34 + i * 8}"/>`).join('')}</g><circle cx="60" cy="60" r="7" fill="${SIGNAL}"/>`,
  vr: `<rect x="18" y="38" width="84" height="42" rx="18" fill="${PAPER}" opacity="0.9"/><rect x="28" y="48" width="30" height="22" rx="8" fill="${INK}" opacity="0.85"/><rect x="62" y="48" width="30" height="22" rx="8" fill="${INK}" opacity="0.85"/><circle cx="43" cy="59" r="6" fill="${SIGNAL}"/><circle cx="77" cy="59" r="6" fill="${SIGNAL}"/><path d="M40 82 q20 12 40 0" fill="none" stroke="${PAPER}" stroke-width="3" opacity="0.6"/>`,
  server: `<rect x="18" y="26" width="84" height="72" rx="8" fill="${PAPER}" opacity="0.9"/><g fill="${INK}" opacity="0.5"><rect x="28" y="36" width="64" height="12" rx="3"/><rect x="28" y="54" width="64" height="12" rx="3"/><rect x="28" y="72" width="64" height="12" rx="3"/></g><circle cx="84" cy="42" r="3" fill="${SIGNAL}"/><circle cx="84" cy="60" r="3" fill="${SIGNAL}"/><circle cx="84" cy="78" r="3" fill="${SIGNAL}" opacity="0.4"/>`,
  paper: `<path d="M30 18 h34 l26 26 v58 a6 6 0 0 1 -6 6 h-54 a6 6 0 0 1 -6 -6 v-78 a6 6 0 0 1 6 -6 z" fill="${PAPER}" opacity="0.9"/><path d="M64 18 v26 h26" fill="none" stroke="${INK}" stroke-width="1.6" opacity="0.35"/><g fill="${INK}" opacity="0.3"><rect x="38" y="56" width="44" height="4" rx="2"/><rect x="38" y="66" width="44" height="4" rx="2"/><rect x="38" y="76" width="28" height="4" rx="2"/></g><circle cx="86" cy="86" r="8" fill="${SIGNAL}" opacity="0.75"/>`,
  phone: `<rect x="40" y="14" width="40" height="92" rx="10" fill="${PAPER}" opacity="0.9"/><rect x="46" y="24" width="28" height="46" rx="3" fill="${INK}" opacity="0.85"/><circle cx="60" cy="84" r="6" fill="${INK}" opacity="0.35"/><circle cx="60" cy="84" r="3" fill="${SIGNAL}"/>`,
  screen: `<rect x="12" y="26" width="96" height="62" rx="8" fill="${PAPER}" opacity="0.9"/><rect x="22" y="36" width="76" height="42" rx="4" fill="${INK}"/><g fill="${SIGNAL}" opacity="0.9"><rect x="30" y="44" width="10" height="10"/><rect x="44" y="44" width="10" height="10"/><rect x="58" y="44" width="10" height="10"/><rect x="30" y="58" width="10" height="10"/></g><g fill="${PAPER}" opacity="0.45"><rect x="72" y="44" width="8" height="10"/><rect x="84" y="44" width="8" height="10"/><rect x="44" y="58" width="10" height="10"/><rect x="58" y="58" width="10" height="10"/><rect x="72" y="58" width="8" height="10"/><rect x="84" y="58" width="8" height="10"/></g><rect x="40" y="94" width="40" height="6" rx="3" fill="${PAPER}" opacity="0.5"/>`,
};

function formSvg(kind) {
  const body = FORMS[kind] ?? FORMS.screen;
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120" role="img" aria-label="${esc(kind)} 轮廓">
  <rect width="120" height="120" rx="16" fill="${INK}"/>
  ${body}
</svg>`;
}

// ── 自托管字体样式表 ────────────────────────────────────────────────────────
/**
 * 在 public/art/assets/fonts/ 写一份**兼容 shim**，把历史路径接到 DS 权威字体表。
 *
 * 背景（2026-10-22 接入 16 的 assets/ds/）：
 *   字体样式表的**权威**现在是 16-design-system/fonts/fonts.css，
 *   随包发布在 public/assets/ds/fonts/fonts.css，
 *   5 个 woff2 与它同目录同路径（MIGRATION-NOTES §6：
 *   「字体 CSS 必须与 woff2 同目录同路径」）。
 *   页面只引用这一份（index.html 里 <link href="./assets/ds/fonts/fonts.css">）。
 *
 *   但历史路径 `…/art/assets/fonts/fonts.css` 在 MIGRATION-NOTES §6 的
 *   「发布前必查」清单里（那条曾经 404），线上巡检仍会 curl 它。
 *   所以这里保留一个 shim：@import 到 DS 的权威表，
 *   历史路径继续 200，字体字节在产物里**只有一份**（assets/ds/fonts/），
 *   不会因为两处 @font-face 指向不同 URL 而让浏览器下载两遍。
 */
const FONT_SHIM = `/* 回响电玩馆 / PLAYTIME ATLAS — 字体样式表兼容入口
 *
 * 自 2026-10-22 起，字体声明的权威来源是设计系统的
 *   /assets/ds/fonts/fonts.css （由 16-design-system/fonts/ 逐字节接入）
 * 5 个 woff2 与它同目录同路径；本文件只做转发，保证历史路径
 *   /art/assets/fonts/fonts.css
 * 继续返回 200（16-design-system/MIGRATION-NOTES.md §6「发布前必查」）。
 *
 * 字体族：Space Grotesk / Inter / Space Mono / Noto Sans SC
 * 许可：SIL Open Font License 1.1，全文见本目录 OFL-*.txt
 * 运行期零外部请求，无 CDN。
 */
@import url("../../assets/ds/fonts/fonts.css");
`;

async function writeFontShim() {
  const dir = path.join(OUT, 'assets', 'fonts');
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, 'fonts.css'), FONT_SHIM, 'utf8');
  return true;
}

// ── 输出 ────────────────────────────────────────────────────────────────────
async function main() {
  await mkdir(OUT, { recursive: true });

  // 清理本生成器负责的文件（不动 07 同步进来的资产）
  if (existsSync(OUT)) {
    const files = await readdir(OUT);
    await Promise.all(
      files
        .filter((f) => /^(mark|era-e\d\d-(poster|backdrop)|form-[\w-]+)\.svg$/.test(f))
        .map((f) => unlink(path.join(OUT, f))),
    );

    /*
     * 清掉**历史遗留**的字体二进制。
     * 字体权威位置自 2026-10-22 起是 public/assets/ds/fonts/（从 16 接入）。
     * 这里曾经放过同一批 woff2 的第二份拷贝（从 07 同步而来），
     * 留着会让产物里同一批字体字节出现两次（+393 KB），
     * 且万一有人同时引入两张 @font-face 表，浏览器会按不同 URL 各下载一遍。
     */
    const fontDir = path.join(OUT, 'assets', 'fonts');
    if (existsSync(fontDir)) {
      const fontFiles = await readdir(fontDir);
      await Promise.all(
        fontFiles
          .filter((f) => /\.(woff2|ttf|otf)$/i.test(f))
          .map((f) => unlink(path.join(fontDir, f))),
      );
    }
  }

  const written = [];
  written.push(['mark.svg', mark()]);
  for (const theme of ERA_THEME) {
    written.push([`era-${theme.id}-poster.svg`, poster(theme)]);
    written.push([`era-${theme.id}-backdrop.svg`, backdrop(theme)]);
  }
  for (const kind of Object.keys(FORMS)) {
    written.push([`form-${kind}.svg`, formSvg(kind)]);
  }

  for (const [name, content] of written) {
    await writeFile(path.join(OUT, name), content, 'utf8');
  }

  const fontsCss = await writeFontShim();

  console.log(`✓ 原创美术包已生成：${written.length} 个 SVG → public/art/`);
  console.log(`  · 馆徽 1 · 年代海报 ${ERA_THEME.length} · 年代底纹 ${ERA_THEME.length} · 载体轮廓 ${Object.keys(FORMS).length}`);
  console.log(`  · 字体样式表：${fontsCss ? 'public/art/assets/fonts/fonts.css → 转发至 public/assets/ds/fonts/fonts.css' : '未就位'}`);
}

main().catch((err) => {
  console.error('✗ 美术包生成失败：', err);
  process.exit(1);
});
