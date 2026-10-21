/**
 * 回响电玩馆 — 文本度量与折行
 * 中西混排的近似宽度估算，用于 SVG 精确排版。
 */

/** 估算文本宽度（CJK 全角按 1em，拉丁按经验比例） */
export function textWidth(s, size) {
  let w = 0;
  for (const ch of String(s)) {
    const cp = ch.codePointAt(0);
    if (cp > 0x2e80) w += 1.0;
    else if (ch === ' ') w += 0.3;
    else if (/[.,:;'!|]/.test(ch)) w += 0.28;
    else if (/[A-Z0-9]/.test(ch)) w += 0.62;
    else w += 0.52;
  }
  return w * size;
}

/** 按宽度折行（支持中文按字断行，显式 \n 强制换行） */
export function wrapText(str, maxWidth, size) {
  const out = [];
  let cur = '';
  for (const ch of String(str)) {
    if (ch === '\n') {
      out.push(cur);
      cur = '';
      continue;
    }
    if (textWidth(cur + ch, size) > maxWidth && cur) {
      out.push(cur);
      cur = ch;
    } else {
      cur += ch;
    }
  }
  if (cur) out.push(cur);
  return out;
}
