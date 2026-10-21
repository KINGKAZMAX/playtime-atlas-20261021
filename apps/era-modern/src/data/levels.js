/**
 * 《折光阁 / PRISM ATRIUM》关卡数据。
 *
 * 坐标：x 向右，y 向下（与屏幕一致），格点自 (0,0) 起。
 * 方向：0=E(1,0) 1=S(0,1) 2=W(-1,0) 3=N(0,-1)
 * 反光板只有两种朝向：0 = '/'（斜杠） 1 = '\'（反斜杠）
 * 分光镜 / 色散棱镜的 rot 表示「分支射出的方向」。
 *
 * 地形字符：'.' 地板 · '#' 立柱（挡光、挡人）· ' ' 虚空（无地板，光可穿过）
 */

export const DIRS = [
  { x: 1, y: 0, name: '东' },
  { x: 0, y: 1, name: '南' },
  { x: -1, y: 0, name: '西' },
  { x: 0, y: -1, name: '北' },
];

export const MIRROR_ROT_NAME = ['斜杠 /', '反斜杠 \\'];
export const ROT_NAME = ['东', '南', '西', '北'];

export const COLORS = {
  W: { key: 'W', label: '白光', hex: '#F2F0E9' },
  C: { key: 'C', label: '青光', hex: '#4FE3D0' },
  M: { key: 'M', label: '品红光', hex: '#FF5FA2' },
};

export const LEVELS = [
  {
    id: 'corridor',
    index: 1,
    name: '回廊',
    nameEn: 'CORRIDOR',
    subtitle: '教学 · 移动与旋转',
    brief:
      '青色光从灯塔射出，被反光板挡住时什么也不会发生。走到反光板旁，让它斜过来，光才能拐弯。',
    objective: '把光送进青色接收环。',
    width: 7,
    height: 7,
    player: { x: 1, y: 5 },
    terrain: [
      '.......',
      '..#....',
      '.......',
      '.......',
      '..#....',
      '.......',
      '.......',
    ],
    elements: [
      { id: 'e1', type: 'emitter', x: 1, y: 3, dir: 0, color: 'C' },
      { id: 'm1', type: 'mirror', x: 4, y: 3, rot: 1, solution: 0 },
      { id: 'r1', type: 'receiver', x: 4, y: 1, color: 'C' },
    ],
    motes: [
      [5, 1],
      [5, 5],
    ],
  },

  {
    id: 'fork',
    index: 2,
    name: '分流',
    nameEn: 'FORK',
    subtitle: '进阶 · 色散与分光',
    brief:
      '白光经过色散棱镜会裂成两种颜色：直行的一束、拐弯的一束。分光镜则把一束复制成两束，送给不同的接收环。',
    objective: '同时点亮三个接收环：两个青光、一个品红光。',
    width: 9,
    height: 9,
    player: { x: 1, y: 7 },
    terrain: [
      '.........',
      '.......#.',
      '.........',
      '.........',
      '.........',
      '.........',
      '#........',
      '.......#.',
      '.........',
    ],
    elements: [
      { id: 'e1', type: 'emitter', x: 1, y: 4, dir: 0, color: 'W' },
      { id: 'd1', type: 'dispersion', x: 3, y: 4, rot: 0, solution: 1 },
      { id: 'm1', type: 'mirror', x: 6, y: 4, rot: 1, solution: 0 },
      { id: 's1', type: 'splitter', x: 6, y: 2, rot: 0, solution: 2 },
      { id: 'm2', type: 'mirror', x: 5, y: 2, rot: 1, solution: 0 },
      { id: 'r1', type: 'receiver', x: 5, y: 5, color: 'M' },
      { id: 's2', type: 'splitter', x: 3, y: 6, rot: 0, solution: 0 },
      { id: 'r2', type: 'receiver', x: 6, y: 6, color: 'C' },
      { id: 'r3', type: 'receiver', x: 3, y: 8, color: 'C' },
    ],
    motes: [
      [8, 3],
      [1, 7],
      [7, 8],
    ],
  },

  {
    id: 'cadence',
    index: 3,
    name: '时序',
    nameEn: 'CADENCE',
    subtitle: '进阶 · 浮台与余辉',
    brief:
      '光栅门需要余辉压板供电：踩上压板后，它会亮 15 秒。趁这段时间跑过浮台、调整反光板。',
    objective: '在余辉窗口内点亮接收环。',
    width: 9,
    height: 9,
    player: { x: 1, y: 6 },
    terrain: [
      '........#',
      '.........',
      '..#......',
      '..... ...',
      '...... ..',
      '...... ..',
      '.........',
      '.........',
      '..#......',
    ],
    elements: [
      { id: 'e1', type: 'emitter', x: 1, y: 4, dir: 0, color: 'C' },
      { id: 'g1', type: 'gate', x: 5, y: 4, link: 'p1' },
      { id: 'p1', type: 'plate', x: 2, y: 6, link: 'g1', duration: 15000 },
      { id: 'm1', type: 'mirror', x: 7, y: 4, rot: 1, solution: 0 },
      { id: 'r1', type: 'receiver', x: 7, y: 2, color: 'C' },
      { id: 'pl1', type: 'platform', x: 6, y: 5, path: [[6, 5], [6, 3]], period: 6000 },
    ],
    motes: [
      [3, 2],
      [8, 6],
      [5, 0],
    ],
  },

  {
    id: 'chorus',
    index: 4,
    name: '合奏',
    nameEn: 'CHORUS',
    subtitle: '挑战 · 三束同奏',
    brief:
      '三座灯塔同时发声，一座色散棱镜负责把白光拆成两色，一道光栅门由远处的压板供电。逐一调好，剩下的交给光。',
    objective: '点亮全部四个接收环，并回收三枚光点。',
    width: 11,
    height: 9,
    player: { x: 1, y: 7 },
    terrain: [
      '..........#',
      '.........#.',
      '...........',
      '...........',
      '..........#',
      '...........',
      '...........',
      '#..........',
      '..........#',
    ],
    elements: [
      { id: 'e1', type: 'emitter', x: 1, y: 1, dir: 0, color: 'C' },
      { id: 'm1', type: 'mirror', x: 7, y: 1, rot: 0, solution: 1 },
      { id: 'e2', type: 'emitter', x: 1, y: 3, dir: 0, color: 'W' },
      { id: 'd1', type: 'dispersion', x: 3, y: 3, rot: 0, solution: 1 },
      { id: 'm2', type: 'mirror', x: 9, y: 3, rot: 0, solution: 1 },
      { id: 'e3', type: 'emitter', x: 1, y: 5, dir: 0, color: 'M' },
      { id: 'm3', type: 'mirror', x: 5, y: 5, rot: 1, solution: 0 },
      { id: 'r1', type: 'receiver', x: 7, y: 5, color: 'C' },
      { id: 'r2', type: 'receiver', x: 9, y: 7, color: 'M' },
      { id: 'r3', type: 'receiver', x: 3, y: 7, color: 'C' },
      { id: 'r4', type: 'receiver', x: 5, y: 0, color: 'M' },
      { id: 'g1', type: 'gate', x: 3, y: 5, link: 'p1' },
      { id: 'p1', type: 'plate', x: 8, y: 7, link: 'g1', duration: 15000 },
    ],
    motes: [
      [7, 0],
      [2, 7],
      [8, 5],
    ],
  },
];

export function getLevel(id) {
  return LEVELS.find((l) => l.id === id) || LEVELS[0];
}
