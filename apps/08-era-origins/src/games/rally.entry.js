/** 展品 08-A 入口：装配游戏 + 同步侧栏读数。 */

import { mountRally } from './rally.js';

const root = document.querySelector('[data-role="root"]');
const game = mountRally(root);

// 侧栏读数同步
const bestLabel = document.querySelector('[data-role="best-label"]');
const diffLabel = document.querySelector('[data-role="difficulty-label"]');
const DIFF_TEXT = { rookie: '初辉', steady: '稳流', keen: '锐锋' };

function syncPanel() {
  if (bestLabel) bestLabel.textContent = `${game.best.p1} : ${game.best.p2}`;
  if (diffLabel) diffLabel.textContent = DIFF_TEXT[game.difficulty] || '稳流';
}
syncPanel();
setInterval(syncPanel, 700);

// 触屏按钮：按住持续移动 / 蓄力
document.querySelectorAll('[data-touch]').forEach((btn) => {
  const action = btn.dataset.touch;
  const isCharge = action.endsWith('-charge');
  const player = action.startsWith('p1') ? 0 : 1;

  const press = (e) => {
    e.preventDefault();
    if (isCharge) {
      game.touchCharge = { player, on: true };
    } else {
      game.touchHold = { player, dir: action.endsWith('up') ? -1 : 1 };
    }
    btn.setPointerCapture?.(e.pointerId);
  };
  const release = () => {
    if (isCharge) {
      if (game.touchCharge && game.touchCharge.player === player) game.touchCharge = null;
    } else if (game.touchHold && game.touchHold.player === player) {
      game.touchHold = null;
    }
  };
  btn.addEventListener('pointerdown', press);
  btn.addEventListener('pointerup', release);
  btn.addEventListener('pointercancel', release);
  btn.addEventListener('pointerleave', release);
});
