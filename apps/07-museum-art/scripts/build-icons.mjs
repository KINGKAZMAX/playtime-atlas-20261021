/**
 * 回响电玩馆 — 原创图标集
 * 24×24 网格 / 1.5 描边 / 圆端点 / currentColor，全部手绘路径，无第三方图标库。
 *
 * 产出：
 *   public/assets/icons/<name>.svg          单枚图标（currentColor，可换色）
 *   public/assets/icons/icons.svg           雪碧图（<symbol> + <use>）
 *   public/assets/icons/index.json          索引
 *   public/assets/icons/sheet.svg           图标总览表（便于人工核对）
 *
 * 运行：node scripts/build-icons.mjs
 */

import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');
const OUT = path.join(ROOT, 'public', 'assets', 'icons');

const STROKE = 1.5;
const R = 'stroke-linecap="round" stroke-linejoin="round"';

/**
 * 图标定义：name / cat / label / body（24×24 视口内的子元素）
 */
const ICONS = [
  /* ---------------- nav ---------------- */
  { name: 'arrow-left', cat: 'nav', label: '返回', body: '<path d="M15 5 L8 12 L15 19"/>' },
  { name: 'arrow-right', cat: 'nav', label: '前进', body: '<path d="M9 5 L16 12 L9 19"/>' },
  {
    name: 'arrow-up-right',
    cat: 'nav',
    label: '外链',
    body: '<path d="M8 16 L16 8 M9.5 8 H16 V14.5"/>',
  },
  { name: 'menu', cat: 'nav', label: '菜单', body: '<path d="M4 7 H20 M4 12 H20 M4 17 H20"/>' },
  { name: 'close', cat: 'nav', label: '关闭', body: '<path d="M6 6 L18 18 M18 6 L6 18"/>' },
  {
    name: 'search',
    cat: 'nav',
    label: '搜索',
    body: '<circle cx="10.5" cy="10.5" r="6"/><path d="M15 15 L20 20"/>',
  },
  {
    name: 'filter',
    cat: 'nav',
    label: '筛选',
    body: '<path d="M4 6 H20 L14 13 V19 L10 21 V13 Z"/>',
  },
  {
    name: 'grid',
    cat: 'nav',
    label: '网格视图',
    body:
      '<rect x="4" y="4" width="7" height="7" rx="1.5"/><rect x="13" y="4" width="7" height="7" rx="1.5"/>' +
      '<rect x="4" y="13" width="7" height="7" rx="1.5"/><rect x="13" y="13" width="7" height="7" rx="1.5"/>',
  },
  {
    name: 'list',
    cat: 'nav',
    label: '列表视图',
    body:
      '<path d="M9 6 H20 M9 12 H20 M9 18 H20"/>' +
      '<circle cx="5" cy="6" r="1.1" fill="currentColor" stroke="none"/>' +
      '<circle cx="5" cy="12" r="1.1" fill="currentColor" stroke="none"/>' +
      '<circle cx="5" cy="18" r="1.1" fill="currentColor" stroke="none"/>',
  },
  {
    name: 'map',
    cat: 'nav',
    label: '展厅平面',
    body:
      '<path d="M3 6.5 L9 4 L15 6.5 L21 4 V17.5 L15 20 L9 17.5 L3 20 Z"/>' +
      '<path d="M9 4 V17.5 M15 6.5 V20"/>',
  },
  {
    name: 'clock',
    cat: 'nav',
    label: '年代',
    body: '<circle cx="12" cy="12" r="8"/><path d="M12 7 V12 L15.5 14"/>',
  },
  {
    name: 'compass',
    cat: 'nav',
    label: '导览',
    body:
      '<circle cx="12" cy="12" r="8.5"/><path d="M15.8 8.2 L13.6 13.6 L8.2 15.8 L10.4 10.4 Z"/>',
  },

  /* ---------------- era（每个年代一枚专属字形） ---------------- */
  {
    name: 'era-01',
    cat: 'era',
    label: '街机初萌',
    body:
      '<circle cx="12" cy="12" r="7.5"/>' +
      '<path d="M4.5 12 Q7 7 9.5 12 Q12 17 14.5 12 Q17 7 19.5 12"/>',
  },
  {
    name: 'era-02',
    cat: 'era',
    label: '街机黄金',
    body:
      '<circle cx="12" cy="4.4" r="2"/>' +
      '<path d="M12 6.4 V13"/>' +
      '<rect x="4.5" y="13" width="15" height="7" rx="2"/>',
  },
  {
    name: 'era-03',
    cat: 'era',
    label: '八位年代',
    body:
      '<rect x="6" y="3" width="12" height="18" rx="2"/>' +
      '<rect x="9" y="6" width="6" height="5" rx="1"/>' +
      '<path d="M9.5 15 H14.5 M9.5 18 H14.5"/>',
  },
  {
    name: 'era-04',
    cat: 'era',
    label: '光盘纪元',
    body:
      '<circle cx="12" cy="12" r="8.5"/>' +
      '<circle cx="12" cy="12" r="2.6"/>' +
      '<path d="M12 3.5 A8.5 8.5 0 0 1 20.5 12"/>',
  },
  {
    name: 'era-05',
    cat: 'era',
    label: '三维与网络',
    body:
      '<path d="M12 3 L20 7.5 V16.5 L12 21 L4 16.5 V7.5 Z"/>' +
      '<path d="M12 3 V12 M12 12 L20 7.5 M12 12 L4 7.5 M12 12 V21"/>',
  },
  {
    name: 'era-06',
    cat: 'era',
    label: '掌机与联机',
    body:
      '<rect x="4" y="4.5" width="16" height="6.5" rx="1.5"/>' +
      '<rect x="4" y="13" width="16" height="6.5" rx="1.5"/>' +
      '<path d="M4 12.2 H20"/>',
  },
  {
    name: 'era-07',
    cat: 'era',
    label: '融合与云',
    body:
      '<path d="M7.2 18.5 a4.2 4.2 0 0 1 0.5 -8.3 a5.5 5.5 0 0 1 10.4 1.6 a3.2 3.2 0 0 1 -0.5 6.7 Z"/>' +
      '<circle cx="12" cy="12.6" r="1.8"/>',
  },

  /* ---------------- action ---------------- */
  { name: 'play', cat: 'action', label: '开始游玩', body: '<path d="M8 5.2 L18.5 12 L8 18.8 Z"/>' },
  {
    name: 'pause',
    cat: 'action',
    label: '暂停',
    body:
      '<rect x="7" y="5" width="3.6" height="14" rx="1"/>' +
      '<rect x="13.4" y="5" width="3.6" height="14" rx="1"/>',
  },
  {
    name: 'collect',
    cat: 'action',
    label: '收藏',
    body:
      '<path d="M12 3.6 l2.6 5.5 5.9 .8 -4.3 4.2 1.1 6 -5.3 -2.9 -5.3 2.9 1.1 -6 -4.3 -4.2 5.9 -.8 Z"/>',
  },
  {
    name: 'bookmark',
    cat: 'action',
    label: '标记',
    body: '<path d="M6.5 4 h11 v16 l-5.5 -4 -5.5 4 Z"/>',
  },
  {
    name: 'share',
    cat: 'action',
    label: '分享',
    body:
      '<circle cx="6" cy="12" r="2.4"/><circle cx="17.5" cy="6" r="2.4"/><circle cx="17.5" cy="18" r="2.4"/>' +
      '<path d="M8.2 10.8 L15.3 7.2 M8.2 13.2 L15.3 16.8"/>',
  },
  {
    name: 'download',
    cat: 'action',
    label: '下载',
    body: '<path d="M12 4 V15 M8 11.2 L12 15.2 L16 11.2 M4.5 19.5 H19.5"/>',
  },
  {
    name: 'external',
    cat: 'action',
    label: '在新窗口打开',
    body:
      '<path d="M14 4.5 H19.5 V10 M19.5 4.5 L11 13"/>' +
      '<path d="M17 14 V19.5 H4.5 V7 H10"/>',
  },
  {
    name: 'reset',
    cat: 'action',
    label: '重置',
    body: '<path d="M19 12 a7 7 0 1 1 -2.2 -5.1"/><path d="M19.5 4 V8 H15.5"/>',
  },
  {
    name: 'fullscreen',
    cat: 'action',
    label: '全屏',
    body: '<path d="M4 9 V4 H9 M15 4 H20 V9 M20 15 V20 H15 M9 20 H4 V15"/>',
  },
  {
    name: 'camera',
    cat: 'action',
    label: '截图',
    body:
      '<path d="M3.5 8 h4 L9 5.5 h6 L16.5 8 h4 v11 h-17 Z"/>' +
      '<circle cx="12" cy="13" r="3.6"/>',
  },

  /* ---------------- media ---------------- */
  {
    name: 'volume',
    cat: 'media',
    label: '音量',
    body:
      '<path d="M4.5 9.5 H8 L12.5 5.5 V18.5 L8 14.5 H4.5 Z"/>' +
      '<path d="M16 9.5 a4 4 0 0 1 0 5 M18.6 7 a7.5 7.5 0 0 1 0 10"/>',
  },
  {
    name: 'volume-mute',
    cat: 'media',
    label: '静音',
    body:
      '<path d="M4.5 9.5 H8 L12.5 5.5 V18.5 L8 14.5 H4.5 Z"/>' +
      '<path d="M16.5 9.5 L21 14 M21 9.5 L16.5 14"/>',
  },
  {
    name: 'headphone',
    cat: 'media',
    label: '耳机',
    body:
      '<path d="M4.5 15 V12 a7.5 7.5 0 0 1 15 0 V15"/>' +
      '<rect x="3" y="14" width="4" height="6" rx="2"/>' +
      '<rect x="17" y="14" width="4" height="6" rx="2"/>',
  },
  {
    name: 'image',
    cat: 'media',
    label: '图像',
    body:
      '<rect x="3.5" y="5" width="17" height="14" rx="2"/>' +
      '<circle cx="9" cy="10" r="1.6"/>' +
      '<path d="M4.5 17 L10 12 L14 15 L17 12.5 L20 17"/>',
  },
  {
    name: 'video',
    cat: 'media',
    label: '视频',
    body:
      '<rect x="3" y="6" width="13" height="12" rx="2"/>' +
      '<path d="M16 11 L21 7.5 V16.5 L16 13 Z"/>',
  },
  {
    name: 'disc',
    cat: 'media',
    label: '光盘',
    body:
      '<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="2.4"/>' +
      '<path d="M12 3.5 A8.5 8.5 0 0 1 20.5 12"/>',
  },
  {
    name: 'joystick',
    cat: 'media',
    label: '摇杆',
    body:
      '<circle cx="12" cy="5" r="2.2"/><path d="M12 7.2 V12"/>' +
      '<rect x="5" y="12" width="14" height="7" rx="2"/>',
  },
  {
    name: 'handheld',
    cat: 'media',
    label: '掌机',
    body:
      '<rect x="6.5" y="3" width="11" height="18" rx="2.5"/>' +
      '<rect x="9" y="6" width="6" height="5" rx="1"/>' +
      '<path d="M9 15 h2 M13 15 h2"/>',
  },

  /* ---------------- audio ---------------- */
  {
    name: 'waveform',
    cat: 'audio',
    label: '波形',
    body: '<path d="M3 12 H6 M9 6 V18 M12 9 V15 M15 4 V20 M18 8 V16 M21 11 V13"/>',
  },
  {
    name: 'note',
    cat: 'audio',
    label: '音符',
    body:
      '<path d="M9 18 V6 L19 4 V16"/>' +
      '<circle cx="6.5" cy="18" r="2.5"/><circle cx="16.5" cy="16" r="2.5"/>',
  },
  {
    name: 'piano',
    cat: 'audio',
    label: '键盘',
    body:
      '<rect x="3" y="5" width="18" height="14" rx="2"/>' +
      '<path d="M9.5 5 V19 M14.5 5 V19 M3 12 H9.5 M14.5 12 H21"/>',
  },
  {
    name: 'radio',
    cat: 'audio',
    label: '收音机',
    body:
      '<rect x="3" y="8.5" width="18" height="11.5" rx="2"/>' +
      '<circle cx="8.5" cy="14.5" r="3"/>' +
      '<path d="M15 11.5 H19 M15 15 H19 M17 8.5 L20 4.5"/>',
  },

  /* ---------------- state ---------------- */
  {
    name: 'check',
    cat: 'state',
    label: '已完成',
    body: '<circle cx="12" cy="12" r="8.5"/><path d="M8 12.3 L11 15.3 L16.2 9.2"/>',
  },
  {
    name: 'warning',
    cat: 'state',
    label: '注意',
    body:
      '<path d="M12 4 L21 19.5 H3 Z"/><path d="M12 10 V14.5"/>' +
      '<circle cx="12" cy="17.2" r=".95" fill="currentColor" stroke="none"/>',
  },
  {
    name: 'error',
    cat: 'state',
    label: '错误',
    body: '<circle cx="12" cy="12" r="8.5"/><path d="M9 9 L15 15 M15 9 L9 15"/>',
  },
  {
    name: 'info',
    cat: 'state',
    label: '说明',
    body:
      '<circle cx="12" cy="12" r="8.5"/><path d="M12 11 V16.5"/>' +
      '<circle cx="12" cy="7.8" r=".95" fill="currentColor" stroke="none"/>',
  },
  {
    name: 'pending',
    cat: 'state',
    label: '待整理',
    body:
      '<circle cx="12" cy="12" r="8.5" stroke-dasharray="3 3.4"/>' +
      '<path d="M12 7.5 V12 L15 13.8"/>',
  },
  {
    name: 'locked',
    cat: 'state',
    label: '未公开',
    body:
      '<rect x="5" y="10.5" width="14" height="9.5" rx="2"/>' +
      '<path d="M8.5 10.5 V8 a3.5 3.5 0 0 1 7 0 V10.5"/>',
  },
  {
    name: 'offline',
    cat: 'state',
    label: '离线',
    body:
      '<path d="M6.6 18 a4.1 4.1 0 0 1 0.5 -8.1 a5.4 5.4 0 0 1 10.2 1.5 a3.1 3.1 0 0 1 -0.4 6.6 Z"/>' +
      '<path d="M4 4 L20 20"/>',
  },
];

const CATS = {
  nav: '导航',
  era: '年代',
  action: '操作',
  media: '媒体',
  audio: '声音',
  state: '状态',
};

function singleSvg(icon) {
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" ` +
    `fill="none" stroke="currentColor" stroke-width="${STROKE}" ${R} ` +
    `aria-hidden="true" data-icon="${icon.name}">${icon.body}</svg>\n`
  );
}

function main() {
  mkdirSync(OUT, { recursive: true });

  /* 单枚图标 */
  for (const icon of ICONS) {
    writeFileSync(path.join(OUT, `${icon.name}.svg`), singleSvg(icon), 'utf8');
  }

  /* 雪碧图 */
  const symbols = ICONS.map(
    (i) =>
      `<symbol id="atlas-icon-${i.name}" viewBox="0 0 24 24" fill="none" stroke="currentColor" ` +
      `stroke-width="${STROKE}" ${R}>${i.body}</symbol>`,
  ).join('\n');
  writeFileSync(
    path.join(OUT, 'icons.svg'),
    `<svg xmlns="http://www.w3.org/2000/svg" style="display:none">\n${symbols}\n</svg>\n`,
    'utf8',
  );

  /* 索引 */
  writeFileSync(
    path.join(OUT, 'index.json'),
    JSON.stringify(
      {
        count: ICONS.length,
        categories: CATS,
        icons: ICONS.map((i) => ({
          name: i.name,
          category: i.cat,
          categoryLabel: CATS[i.cat],
          label: i.label,
          file: `./${i.name}.svg`,
          sprite: `#atlas-icon-${i.name}`,
        })),
      },
      null,
      2,
    ) + '\n',
    'utf8',
  );

  /* 总览表 */
  const cols = 8;
  const cell = 72;
  const rows = Math.ceil(ICONS.length / cols);
  const sheetW = cols * cell + 48;
  const sheetH = rows * cell + 48 + 40;
  const cells = ICONS.map((icon, idx) => {
    const cx = 48 + (idx % cols) * cell;
    const cy = 48 + Math.floor(idx / cols) * cell;
    return (
      `<g transform="translate(${cx - 24} ${cy - 24})">` +
      `<rect x="-12" y="-12" width="48" height="48" rx="10" fill="#122236"/>` +
      `<g transform="translate(0 0) scale(1.35) translate(-12 -12)" stroke="#FBF7EF" stroke-width="${STROKE}" ${R} fill="none">${icon.body}</g>` +
      `</g>` +
      `<text x="${cx}" y="${cy + 32}" fill="#7A9BB8" font-family="'Space Mono',monospace" font-size="8" text-anchor="middle">${icon.name}</text>`
    );
  }).join('\n');

  writeFileSync(
    path.join(OUT, 'sheet.svg'),
    `<svg xmlns="http://www.w3.org/2000/svg" width="${sheetW}" height="${sheetH}" viewBox="0 0 ${sheetW} ${sheetH}">` +
      `<rect width="${sheetW}" height="${sheetH}" fill="#0C1726"/>` +
      `<text x="48" y="34" fill="#F0601F" font-family="'Space Grotesk',sans-serif" font-size="15" font-weight="700">` +
      `ATLAS ICON SET · ${ICONS.length} GLYPHS</text>` +
      cells +
      `</svg>\n`,
    'utf8',
  );

  const byCat = Object.entries(CATS)
    .map(([k, v]) => `${v} ${ICONS.filter((i) => i.cat === k).length}`)
    .join('  ·  ');
  console.log(`✓ 图标集完成：${ICONS.length} 枚  (${byCat})`);
}

main();
