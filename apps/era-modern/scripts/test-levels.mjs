/**
 * 关卡自检：按作者解法旋转所有元件，验证所有接收环都能被点亮。
 * 运行：node scripts/test-levels.mjs
 */
import { LEVELS } from '../src/data/levels.js';
import { PuzzleState } from '../src/puzzle/rules.js';

let failed = 0;

for (const level of LEVELS) {
  const state = new PuzzleState(level);
  // 直接套用作者解法（不经过 proximity 校验）
  for (const el of level.elements) {
    if (el.solution != null) state.rots[el.id] = el.solution;
  }
  // 激活所有余辉压板（光栅门需要供电才会放行）
  for (const el of level.elements) {
    if (el.type === 'plate') state.plateUntil[el.id] = performance.now() + 60000;
  }
  const light = state.computeLight();
  const receivers = state.receivers();
  const unlit = receivers.filter((r) => !light.lit.has(r.id));

  const ok = unlit.length === 0;
  if (!ok) failed += 1;

  console.log(`\n=== ${level.id} (${level.name} / ${level.nameEn}) ===`);
  console.log(`  接收环: ${receivers.map((r) => `${r.id}@(${r.x},${r.y})[${r.color}]`).join(', ')}`);
  console.log(`  点亮: ${[...light.lit].join(', ') || '（无）'}`);
  if (unlit.length) {
    console.log(`  ❌ 未点亮: ${unlit.map((r) => `${r.id}@(${r.x},${r.y}) 期望 ${r.color}`).join(', ')}`);
    console.log(`  色不符: ${[...light.mismatch].join(', ') || '（无）'}`);
  } else {
    console.log('  ✅ 全部点亮（关卡可完成）');
  }

  // 另外验证「初始状态不通关」
  const fresh = new PuzzleState(level);
  const freshLight = fresh.computeLight();
  const freshUnlit = fresh.receivers().filter((r) => !freshLight.lit.has(r.id));
  console.log(`  初始状态未点亮数: ${freshUnlit.length} ${freshUnlit.length === receivers.length ? '✅（需要玩家操作）' : '⚠️ 存在初始即通关的情况'}`);
  if (freshUnlit.length !== receivers.length) failed += 1;

  // 验证地形/元素坐标合法
  for (const el of level.elements) {
    if (el.x < 0 || el.y < 0 || el.x >= level.width || el.y >= level.height) {
      console.log(`  ❌ 元素越界: ${el.id}`);
      failed += 1;
    }
    if (level.terrain[el.y][el.x] === '#') {
      console.log(`  ❌ 元素位于立柱上: ${el.id}`);
      failed += 1;
    }
  }
  for (const [mx, my] of level.motes) {
    if (level.terrain[my][mx] !== '.') {
      console.log(`  ❌ 光点不在地板上: (${mx},${my})`);
      failed += 1;
    }
  }
  if (level.terrain.length !== level.height) {
    console.log('  ❌ 地形行数与 height 不符');
    failed += 1;
  }
  for (const row of level.terrain) {
    if (row.length !== level.width) {
      console.log('  ❌ 地形列数与 width 不符');
      failed += 1;
    }
  }

  // 可达性：玩家能否走到每个可旋转元件的相邻格（浮台路径视为可站立）
  const walkable = (x, y) => {
    if (x < 0 || y < 0 || x >= level.width || y >= level.height) return false;
    if (level.terrain[y][x] === '#') return false;
    if (level.terrain[y][x] === ' ') {
      // 虚空格只有在浮台路径上才可站立
      return level.elements.some(
        (e) => e.type === 'platform' && (e.path || []).some(([px, py]) => px === x && py === y),
      );
    }
    return true;
  };
  const seen = new Set([`${level.player.x},${level.player.y}`]);
  const queue = [[level.player.x, level.player.y]];
  while (queue.length) {
    const [x, y] = queue.shift();
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nx = x + dx;
      const ny = y + dy;
      const k = `${nx},${ny}`;
      if (seen.has(k) || !walkable(nx, ny)) continue;
      seen.add(k);
      queue.push([nx, ny]);
    }
  }
  for (const el of level.elements) {
    if (!['mirror', 'splitter', 'dispersion'].includes(el.type)) continue;
    const reachable =
      seen.has(`${el.x},${el.y}`) ||
      seen.has(`${el.x + 1},${el.y}`) ||
      seen.has(`${el.x - 1},${el.y}`) ||
      seen.has(`${el.x},${el.y + 1}`) ||
      seen.has(`${el.x},${el.y - 1}`);
    if (!reachable) {
      console.log(`  ❌ 可旋转元件不可达: ${el.id} @ (${el.x},${el.y})`);
      failed += 1;
    }
  }
  // 接收环与光点也应可达
  for (const r of state.receivers()) {
    if (!seen.has(`${r.x},${r.y}`)) {
      console.log(`  ⚠️ 接收环不可达（仅作装饰不影响通关）: ${r.id}`);
    }
  }
  for (const [mx, my] of level.motes) {
    if (!seen.has(`${mx},${my}`)) {
      console.log(`  ❌ 光点不可达: (${mx},${my})`);
      failed += 1;
    }
  }
}

console.log(failed === 0 ? '\n✅ 全部关卡校验通过' : `\n❌ ${failed} 项校验失败`);
process.exit(failed === 0 ? 0 : 1);
