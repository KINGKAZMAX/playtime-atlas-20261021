import './styles.css';
import { Game } from './game/Game.js';

const game = new Game();

// Exposed for debugging / automated checks.
window.__deepSpaceDrifter = game;

game.init().catch((err) => {
  console.error('[Deep Space Drifter] failed to start', err);
  const text = document.getElementById('loadText');
  if (text) {
    text.textContent = `启动失败：${err && err.message ? err.message : err}`;
    text.style.color = '#ff5f6b';
  }
});
