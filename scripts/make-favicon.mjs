#!/usr/bin/env node
/**
 * 站点根图标生成器 —— 生成 docs/favicon.ico（16×16 与 32×32 双尺寸）。
 *
 * 背景：13-qa《HANDOFF-14.md》§四 第 2 项要求「网络面板零 404（含 /favicon.ico）」。
 * 作品页各自声明了图标，站点根此前没有 /favicon.ico（直接请求会 404）。
 *
 * 约束：
 *   · 完全程序化绘制，无任何第三方图像素材；
 *   · 确定性：同一输入永远得到同一字节序列；
 *   · 配色取 16-design-system「余晖设计系统」：暖白 #FCFBF9 + 朱砂 #B4432B。
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'docs', 'favicon.ico');

const BG = [0xb4, 0x43, 0x2b]; // 朱砂
const FG = [0xfc, 0xfb, 0xf9]; // 暖白

/** 画一枚图标：圆角底 + 播放三角（回响电玩馆的「开始」符号）。 */
function draw(size) {
  const px = Buffer.alloc(size * size * 4);
  const r = size * 0.2;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const fx = x + 0.5;
      const fy = y + 0.5;
      const cx = Math.min(Math.max(fx, r), size - r);
      const cy = Math.min(Math.max(fy, r), size - r);
      const inRounded = (fx - cx) ** 2 + (fy - cy) ** 2 <= r * r;
      // 播放三角：以 (0.34, 0.5) 为顶点，向右张开
      const tx = fx / size;
      const ty = fy / size;
      const inTri = tx >= 0.34 && tx <= 0.68 && Math.abs(ty - 0.5) <= (0.68 - tx) * 0.86;
      const color = inRounded && inTri ? FG : BG;
      const i = (y * size + x) * 4;
      px[i] = color[2];       // B
      px[i + 1] = color[1];   // G
      px[i + 2] = color[0];   // R
      px[i + 3] = inRounded ? 255 : 0; // A
    }
  }
  return px;
}

/** 单尺寸 ICO 图像数据：BITMAPINFOHEADER + BGRA（自下而上）+ AND 掩码。 */
function imageData(size) {
  const px = draw(size);
  const header = Buffer.alloc(40);
  header.writeUInt32LE(40, 0);          // biSize
  header.writeInt32LE(size, 4);         // biWidth
  header.writeInt32LE(size * 2, 8);     // biHeight（含掩码高度）
  header.writeUInt16LE(1, 12);          // biPlanes
  header.writeUInt16LE(32, 14);         // biBitCount
  header.writeUInt32LE(0, 16);          // biCompression = BI_RGB
  const xorSize = size * size * 4;
  const maskRowBytes = Math.ceil(size / 32) * 4;
  const andSize = maskRowBytes * size;
  header.writeUInt32LE(xorSize + andSize, 20); // biSizeImage

  // 自下而上翻转
  const xor = Buffer.alloc(xorSize);
  for (let y = 0; y < size; y++) {
    px.copy(xor, (size - 1 - y) * size * 4, y * size * 4, (y + 1) * size * 4);
  }
  // AND 掩码：alpha=0 处置 1（其余置 0）
  const and = Buffer.alloc(andSize);
  for (let y = 0; y < size; y++) {
    const row = size - 1 - y;
    for (let x = 0; x < size; x++) {
      const alpha = px[(row * size + x) * 4 + 3];
      if (alpha === 0) and[y * maskRowBytes + (x >> 3)] |= 0x80 >> (x & 7);
    }
  }
  return Buffer.concat([header, xor, and]);
}

function buildIco(sizes) {
  const images = sizes.map((s) => ({ size: s, data: imageData(s) }));
  const dir = Buffer.alloc(6 + images.length * 16);
  dir.writeUInt16LE(0, 0);
  dir.writeUInt16LE(1, 2);
  dir.writeUInt16LE(images.length, 4);
  let offset = dir.length;
  images.forEach((im, i) => {
    const e = 6 + i * 16;
    dir.writeUInt8(im.size >= 256 ? 0 : im.size, e);
    dir.writeUInt8(im.size >= 256 ? 0 : im.size, e + 1);
    dir.writeUInt8(0, e + 2);
    dir.writeUInt8(0, e + 3);
    dir.writeUInt16LE(1, e + 4);
    dir.writeUInt16LE(32, e + 6);
    dir.writeUInt32LE(im.data.length, e + 8);
    dir.writeUInt32LE(offset, e + 12);
    offset += im.data.length;
  });
  return Buffer.concat([dir, ...images.map((im) => im.data)]);
}

const ico = buildIco([16, 32]);
fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, ico);
console.log(`[favicon] 已生成 ${path.relative(ROOT, OUT)}（${ico.length} 字节，16×16 + 32×32）`);
