/** 展品 08-B 入口：装配游戏 + 同步侧栏读数。 */

import { mountGravity } from './gravity.js';

const root = document.querySelector('[data-role="root"]');
const game = mountGravity(root);

const bestLabel = document.querySelector('[data-role="best-label"]');
const diffLabel = document.querySelector('[data-role="difficulty-label"]');
const DIFF_TEXT = { rookie: '微轨', steady: '稳轨', keen: '锐轨' };

function syncPanel() {
  if (bestLabel) bestLabel.textContent = `${game.best.p1} : ${game.best.p2}`;
  if (diffLabel) diffLabel.textContent = DIFF_TEXT[game.difficulty] || '稳轨';
}
syncPanel();
setInterval(syncPanel, 700);
