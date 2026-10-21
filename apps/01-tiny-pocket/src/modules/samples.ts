/**
 * Sample library: procedurally painted surface tiles.
 * Each swatch is rendered on a 2D canvas from a recipe — no image assets.
 */
import { mulberry32 } from '../color';
import type { Sample, TextureKind } from '../content';

const TILE_W = 320;
const TILE_H = 200;

function shade(hex: string, amount: number): string {
  const n = Number.parseInt(hex.replace('#', ''), 16);
  const r = Math.max(0, Math.min(255, ((n >> 16) & 255) + amount));
  const g = Math.max(0, Math.min(255, ((n >> 8) & 255) + amount));
  const b = Math.max(0, Math.min(255, (n & 255) + amount));
  return `rgb(${r}, ${g}, ${b})`;
}

function paintTile(canvas: HTMLCanvasElement, sample: Sample): void {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  canvas.width = TILE_W;
  canvas.height = TILE_H;

  const rnd = mulberry32(sample.seed);
  const { kind, hex } = sample;

  // base fill
  ctx.fillStyle = hex;
  ctx.fillRect(0, 0, TILE_W, TILE_H);

  switch (kind as TextureKind) {
    case 'grain': {
      const img = ctx.getImageData(0, 0, TILE_W, TILE_H);
      const d = img.data;
      for (let i = 0; i < d.length; i += 4) {
        const n = (rnd() - 0.5) * 26;
        d[i] += n;
        d[i + 1] += n;
        d[i + 2] += n;
      }
      ctx.putImageData(img, 0, 0);
      break;
    }
    case 'bands': {
      for (let i = 0; i < 9; i++) {
        const y = (i / 9) * TILE_H + rnd() * 12;
        const h = 10 + rnd() * 22;
        const light = rnd() > 0.5;
        ctx.fillStyle = shade(hex, light ? 16 : -20);
        ctx.beginPath();
        ctx.moveTo(0, y);
        for (let x = 0; x <= TILE_W; x += 16) {
          ctx.lineTo(x, y + Math.sin((x / TILE_W) * Math.PI * 2 + i) * 5);
        }
        ctx.lineTo(TILE_W, y + h);
        for (let x = TILE_W; x >= 0; x -= 16) {
          ctx.lineTo(x, y + h + Math.sin((x / TILE_W) * Math.PI * 2 + i) * 5);
        }
        ctx.closePath();
        ctx.fill();
      }
      break;
    }
    case 'speckle': {
      for (let i = 0; i < 1400; i++) {
        const x = rnd() * TILE_W;
        const y = rnd() * TILE_H;
        const r = 0.4 + rnd() * 1.8;
        const light = rnd() > 0.5;
        ctx.fillStyle = shade(hex, light ? 34 : -30);
        ctx.globalAlpha = 0.35 + rnd() * 0.5;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      break;
    }
    case 'crackle': {
      ctx.strokeStyle = shade(hex, -58);
      for (let i = 0; i < 46; i++) {
        ctx.lineWidth = 0.5 + rnd() * 1.6;
        ctx.globalAlpha = 0.35 + rnd() * 0.45;
        let x = rnd() * TILE_W;
        let y = rnd() * TILE_H;
        ctx.beginPath();
        ctx.moveTo(x, y);
        const segs = 3 + Math.floor(rnd() * 5);
        let angle = rnd() * Math.PI * 2;
        for (let s = 0; s < segs; s++) {
          angle += (rnd() - 0.5) * 1.3;
          x += Math.cos(angle) * (8 + rnd() * 26);
          y += Math.sin(angle) * (8 + rnd() * 26);
          ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
      // warm glow blobs
      for (let i = 0; i < 14; i++) {
        const x = rnd() * TILE_W;
        const y = rnd() * TILE_H;
        const r = 6 + rnd() * 22;
        const g = ctx.createRadialGradient(x, y, 0, x, y, r);
        g.addColorStop(0, 'rgba(255, 176, 84, 0.5)');
        g.addColorStop(1, 'rgba(255, 176, 84, 0)');
        ctx.fillStyle = g;
        ctx.fillRect(x - r, y - r, r * 2, r * 2);
      }
      break;
    }
    case 'brushed': {
      for (let i = 0; i < 900; i++) {
        const y = rnd() * TILE_H;
        const x = rnd() * TILE_W;
        const len = 20 + rnd() * 120;
        ctx.strokeStyle = shade(hex, (rnd() - 0.45) * 46);
        ctx.globalAlpha = 0.16 + rnd() * 0.3;
        ctx.lineWidth = 0.6 + rnd();
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + len, y + (rnd() - 0.5) * 1.2);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
      break;
    }
    case 'fiber': {
      for (let i = 0; i < 420; i++) {
        const x = rnd() * TILE_W;
        const y = rnd() * TILE_H;
        const len = 8 + rnd() * 30;
        const angle = -0.5 + rnd() * 1.0;
        ctx.strokeStyle = shade(hex, (rnd() - 0.4) * 54);
        ctx.globalAlpha = 0.25 + rnd() * 0.45;
        ctx.lineWidth = 0.6 + rnd() * 1.1;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.quadraticCurveTo(
          x + Math.cos(angle) * len * 0.5,
          y + Math.sin(angle) * len * 0.5,
          x + Math.cos(angle) * len,
          y + Math.sin(angle) * len,
        );
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
      break;
    }
    case 'gradient': {
      const g = ctx.createLinearGradient(0, 0, TILE_W, TILE_H);
      g.addColorStop(0, shade(hex, 26));
      g.addColorStop(0.55, hex);
      g.addColorStop(1, shade(hex, -30));
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, TILE_W, TILE_H);
      for (let i = 0; i < 600; i++) {
        const x = rnd() * TILE_W;
        const y = rnd() * TILE_H;
        ctx.fillStyle = shade(hex, (rnd() - 0.5) * 30);
        ctx.globalAlpha = 0.2;
        ctx.fillRect(x, y, 1.5, 1.5);
      }
      ctx.globalAlpha = 1;
      break;
    }
    case 'dots': {
      for (let i = 0; i < 120; i++) {
        const x = rnd() * TILE_W;
        const y = rnd() * TILE_H;
        const r = 5 + rnd() * 20;
        const g = ctx.createRadialGradient(x, y, 0, x, y, r);
        g.addColorStop(0, shade(hex, 22));
        g.addColorStop(1, shade(hex, -8));
        ctx.fillStyle = g;
        ctx.globalAlpha = 0.4;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      break;
    }
  }

  // photographic vignette + top-left sheen
  const vg = ctx.createRadialGradient(
    TILE_W * 0.45,
    TILE_H * 0.4,
    TILE_W * 0.12,
    TILE_W * 0.5,
    TILE_H * 0.5,
    TILE_W * 0.78,
  );
  vg.addColorStop(0, 'rgba(255,255,255,0.06)');
  vg.addColorStop(0.6, 'rgba(0,0,0,0)');
  vg.addColorStop(1, 'rgba(0,0,0,0.34)');
  ctx.fillStyle = vg;
  ctx.fillRect(0, 0, TILE_W, TILE_H);
}

export interface SamplesView {
  select: (id: string) => void;
}

export function createSamplesView(
  container: HTMLElement,
  samples: Sample[],
  onSelect: (sample: Sample) => void,
): SamplesView {
  const buttons = new Map<string, HTMLButtonElement>();

  for (const sample of samples) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'sample';
    btn.dataset.sampleId = sample.id;
    btn.setAttribute('aria-pressed', 'false');

    const canvas = document.createElement('canvas');
    canvas.className = 'sample__chip';
    canvas.setAttribute('role', 'img');
    canvas.setAttribute('aria-label', `${sample.name} 表面样本`);
    btn.appendChild(canvas);

    const meta = document.createElement('div');
    meta.className = 'sample__meta';
    const name = document.createElement('span');
    name.className = 'sample__name';
    name.textContent = sample.name;
    const hex = document.createElement('span');
    hex.className = 'sample__hex';
    hex.textContent = sample.hex;
    meta.append(name, hex);
    btn.appendChild(meta);

    const cat = document.createElement('div');
    cat.className = 'sample__cat';
    cat.textContent = `${sample.category} · ${sample.latin.toUpperCase()}`;
    btn.appendChild(cat);

    container.appendChild(btn);
    buttons.set(sample.id, btn);
    paintTile(canvas, sample);

    btn.addEventListener('click', () => {
      for (const [, b] of buttons) {
        b.classList.remove('is-active');
        b.setAttribute('aria-pressed', 'false');
      }
      btn.classList.add('is-active');
      btn.setAttribute('aria-pressed', 'true');
      onSelect(sample);
    });
  }

  return {
    select: (id: string) => {
      const btn = buttons.get(id);
      btn?.click();
    },
  };
}
