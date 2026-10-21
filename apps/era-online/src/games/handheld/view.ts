/**
 * handheld/view.ts — 《口袋回声》的掌机外壳、触摸区与交互装配。
 *
 * 外壳为**原创设计**的通用掌机造型（暮港青 + 琥珀），不含任何厂商 Logo 或工业设计复制。
 * 交互三路并行：触摸（十字键 / A/B 键 / 下屏点选）、键盘（方向键 / Z / X / Enter）、
 * 指针（点击下屏按钮）。
 */

import { audio } from '../../core/audio';
import { el, clear } from '../../core/dom';
import { Input } from '../../core/input';
import { GameLoop } from '../../core/loop';
import { POCKET } from '../../core/palette';
import { loadJson, saveJson, storageAvailable } from '../../core/storage';
import { sourceChipEl } from '../../data/sources';
import { renderBanner, renderHandheld } from './render';
import {
  createState,
  deserializeHandheld,
  movePlayer,
  pressA,
  pressB,
  serializeHandheld,
  stepHandheld,
  type HandheldSave,
  type HandheldState,
} from './sim';
import { AREAS, SCREEN_H, SCREEN_W } from './world';

const SAVE_KEY = 'handheld.save';

export interface HandheldView {
  root: HTMLElement;
  focus(): void;
  setActive(active: boolean): void;
  destroy(): void;
}

export function createHandheldView(): HandheldView {
  let state: HandheldState = createState();
  let paused = false;
  let active = false;
  let showLog = false;
  let banner: { text: string; sub?: string; t: number } | null = null;

  // ── 上屏 ──
  const canvas = el('canvas', {
    class: 'pocket__canvas',
    width: SCREEN_W,
    height: SCREEN_H,
    role: 'img',
    'aria-label': '口袋回声 上屏画面',
  }) as HTMLCanvasElement;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('无法创建 2D 绘图上下文');
  const gctx = ctx;

  const bezel = el('div', { class: 'pocket__bezel' }, [
    canvas,
    el('span', { class: 'pocket__bezel-label', text: '上屏 · POINT ECHO' }),
  ]);

  const areaName = el('span', { class: 'status__area', text: AREAS.town.name });
  const areaEn = el('span', { class: 'status__en', text: AREAS.town.en });
  const hpPips = el('span', { class: 'status__hp' });
  const shardPips = el('span', { class: 'status__shards' });
  const statusBar = el('div', { class: 'pocket__status' }, [
    el('div', { class: 'status__row' }, [el('span', { class: 'status__k', text: '地点' }), areaName, areaEn]),
    el('div', { class: 'status__row' }, [el('span', { class: 'status__k', text: '体力' }), hpPips]),
    el('div', { class: 'status__row' }, [el('span', { class: 'status__k', text: '回声' }), shardPips]),
  ]);

  const screenCol = el('div', { class: 'pocket__screencol' }, [bezel, statusBar]);

  // ── 下屏（触摸区） ──
  const touchSpeaker = el('p', { class: 'touch__speaker', text: '渡口小镇' });
  const touchText = el('p', { class: 'touch__text', text: '按 A 与人或物互动，方向键移动。' });
  const touchSrc = el('p', { class: 'touch__src' });
  const touchLog = el('ul', { class: 'touch__log', hidden: true });
  const touchHint = el('p', { class: 'touch__hint', text: '' });

  const touchPanel = el('div', { class: 'pocket__touch', role: 'region', 'aria-label': '下屏 触摸交互区' }, [
    el('div', { class: 'touch__head' }, [
      el('span', { class: 'touch__tag', text: '下屏 · TOUCH' }),
      el('span', { class: 'touch__badge', text: '本地单机' }),
    ]),
    touchSpeaker,
    touchText,
    touchSrc,
    touchHint,
    touchLog,
  ]);

  // ── 控制区 ──
  const dpadBtns: Record<string, HTMLButtonElement> = {};
  const dpad = el('div', { class: 'dpad' });
  const dpadLayout: Array<[string, string, string]> = [
    ['up', '▲', '上'],
    ['left', '◀', '左'],
    ['center', '', '中心'],
    ['right', '▶', '右'],
    ['down', '▼', '下'],
  ];
  for (const [key, glyph, label] of dpadLayout) {
    const b = el('button', {
      class: key === 'center' ? 'dpad__center' : 'dpad__btn',
      type: 'button',
      'aria-label': label,
    }) as HTMLButtonElement;
    b.textContent = glyph;
    dpad.append(b);
    if (key !== 'center') dpadBtns[key] = b;
  }

  const btnA = el('button', { class: 'abbtn abbtn--a', type: 'button', 'aria-label': 'A 键 确认' }) as HTMLButtonElement;
  btnA.textContent = 'A';
  const btnB = el('button', { class: 'abbtn abbtn--b', type: 'button', 'aria-label': 'B 键 取消' }) as HTMLButtonElement;
  btnB.textContent = 'B';
  const btnStart = el('button', { class: 'sysbtn', type: 'button', 'aria-label': 'START 暂停菜单' }) as HTMLButtonElement;
  btnStart.textContent = 'START';
  const btnSelect = el('button', { class: 'sysbtn', type: 'button', 'aria-label': 'SELECT 切换日志' }) as HTMLButtonElement;
  btnSelect.textContent = 'SELECT';

  const controls = el('div', { class: 'pocket__controls' }, [
    dpad,
    el('div', { class: 'abstack' }, [btnA, btnB]),
    el('div', { class: 'sysstack' }, [btnStart, btnSelect]),
  ]);

  const pauseMenu = el('div', { class: 'touch__menu', hidden: true });

  const panelCol = el('div', { class: 'pocket__panelcol' }, [touchPanel, controls, pauseMenu]);

  const root = el('div', { class: 'pocket' }, [
    el('div', { class: 'pocket__head' }, [
      el('h3', { class: 'pocket__title', text: '展项 B · 口袋回声 / POCKET ECHO' }),
      el('p', { class: 'pocket__sub', text: '原创掌机造型（暮港配色）。全部内容本地运行，无联网。' }),
    ]),
    el('div', { class: 'pocket__body' }, [screenCol, panelCol]),
  ]);

  // ── 输入 ──
  const input = new Input(window);
  input.setEnabled(false);

  for (const [key, btn] of Object.entries(dpadBtns)) {
    input.bindHold(btn, key as 'up' | 'down' | 'left' | 'right');
  }
  input.bindTap(btnA, 'a');
  input.bindTap(btnB, 'b');
  input.bindTap(btnStart, 'start');
  input.bindTap(btnSelect, 'select');

  const loop = new GameLoop({
    update: (dt) => {
      if (paused || state.over) {
        input.endFrame();
        return;
      }
      let dx = 0;
      let dy = 0;
      if (input.isDown('left')) dx -= 1;
      if (input.isDown('right')) dx += 1;
      if (input.isDown('up')) dy -= 1;
      if (input.isDown('down')) dy += 1;
      if (dx !== 0 || dy !== 0) {
        movePlayer(state, dx, dy, dt);
        if (Math.floor(state.animT * 4) !== Math.floor((state.animT - dt) * 4)) {
          audio.play('step');
        }
      } else {
        state.moving = false;
      }

      if (input.wasPressed('a')) {
        const r = pressA(state);
        if (r === 'end') showBanner('BEACON LIT', 'THE LIGHT IS ON');
      }
      if (input.wasPressed('b')) pressB(state);
      if (input.wasPressed('start')) togglePause();
      if (input.wasPressed('select')) {
        showLog = !showLog;
        touchLog.hidden = !showLog;
      }

      stepHandheld(state, dt);
      input.endFrame();
    },
    render: () => {
      renderHandheld(gctx, state, performance.now() / 1000, canvas.width / SCREEN_W);
      if (banner && banner.t > 0) {
        renderBanner(gctx, banner.text, canvas.width / SCREEN_W, banner.sub);
        banner.t -= 1 / 60;
      }
      syncPanel();
    },
  });

  // ── 键盘（Esc 单独处理） ──
  const onKeyDown = (e: KeyboardEvent): void => {
    if (!root.classList.contains('is-active')) return;
    const tag = (e.target as HTMLElement | null)?.tagName;
    if (tag === 'INPUT' || tag === 'SELECT' || tag === 'TEXTAREA') return;
    if (e.code === 'Escape') {
      e.preventDefault();
      togglePause();
    }
  };
  window.addEventListener('keydown', onKeyDown);

  // ── 暂停菜单 ──
  function togglePause(): void {
    if (state.over) return;
    paused = !paused;
    loop.paused = !active || paused;
    if (paused) {
      clear(pauseMenu);
      const cont = el('button', { class: 'btn btn--primary', type: 'button', text: '继续游戏' });
      cont.addEventListener('click', () => togglePause());
      const save = el('button', { class: 'btn', type: 'button', text: '存档' });
      save.addEventListener('click', () => {
        const ok = saveJson<HandheldSave>(SAVE_KEY, serializeHandheld(state));
        showBanner(ok ? 'SAVED' : 'SAVE FAILED');
      });
      const load = el('button', { class: 'btn', type: 'button', text: '读档' });
      load.addEventListener('click', () => {
        const s = loadJson<HandheldSave>(SAVE_KEY);
        if (!s || s.v !== 1) {
          showBanner('NO SAVE DATA');
          return;
        }
        state = deserializeHandheld(s);
        showBanner('LOADED');
        syncPanel();
      });
      const reset = el('button', { class: 'btn btn--ghost', type: 'button', text: '重新开始' });
      reset.addEventListener('click', () => {
        state = createState();
        showBanner('RESTARTED');
        syncPanel();
      });
      pauseMenu.append(
        el('p', { class: 'touch__menu-title', text: '暂停 / PAUSED' }),
        cont,
        save,
        load,
        reset,
      );
      pauseMenu.hidden = false;
    } else {
      pauseMenu.hidden = true;
    }
  }

  function showBanner(text: string, sub?: string): void {
    banner = { text, sub, t: 2.2 };
  }

  // ── 下屏同步 ──
  function syncPanel(): void {
    const area = AREAS[state.area];
    areaName.textContent = area.name;
    areaEn.textContent = area.en;

    clear(hpPips);
    for (let i = 0; i < state.maxHp; i++) {
      hpPips.append(el('i', { class: `pip ${i < state.hp ? 'is-on' : 'is-off'}` }));
    }
    clear(shardPips);
    for (let i = 0; i < 3; i++) {
      shardPips.append(el('i', { class: `pip pip--shard ${i < state.shards.length ? 'is-on' : 'is-off'}` }));
    }
    shardPips.append(el('span', { class: 'status__count', text: `${state.shards.length}/3` }));

    if (state.over === 'win') {
      touchSpeaker.textContent = '结局 · ENDING';
      touchText.textContent =
        '三枚回声碎片同时亮起，灯芯被点燃。整片海面从渡口一直亮到灯塔——这是本展厅为你写下的结尾。';
      clear(touchSrc);
      touchHint.textContent = '按 START 可重新开始一局。';
      return;
    }

    if (state.talking) {
      const line = state.talking.lines[state.talkLine];
      touchSpeaker.textContent = `${state.talking.name} · ${state.talking.role}`;
      touchText.textContent = line?.text ?? '';
      clear(touchSrc);
      for (const s of line?.src ?? []) {
        const chip = sourceChipEl(s);
        if (chip) touchSrc.append(chip);
      }
      touchHint.textContent = '按 A 继续 / B 结束对话';
      return;
    }

    touchSpeaker.textContent = area.name;
    touchText.textContent = state.prompt || '在小镇与洞窟间穿行，找回三枚回声碎片。';
    clear(touchSrc);
    touchHint.textContent = 'A 确认 · B 取消 · START 菜单 · 方向键移动';

    if (showLog) {
      clear(touchLog);
      for (const line of state.log.slice(0, 8)) {
        touchLog.append(el('li', { text: line }));
      }
    }
  }

  // ── 尺寸 ──
  const resize = (): void => {
    const dpr = Math.min(3, window.devicePixelRatio || 1);
    canvas.width = Math.round(SCREEN_W * dpr);
    canvas.height = Math.round(SCREEN_H * dpr);
    canvas.style.aspectRatio = `${SCREEN_W} / ${SCREEN_H}`;
  };
  resize();
  window.addEventListener('resize', resize);

  // 读取存档
  const existing = loadJson<HandheldSave>(SAVE_KEY);
  if (existing && existing.v === 1) {
    state = deserializeHandheld(existing);
  }
  if (!storageAvailable) {
    root.append(
      el('p', {
        class: 'pocket__warn',
        text: '当前环境无法写入 localStorage，刷新后进度不会保留。',
      }),
    );
  }
  syncPanel();

  return {
    root,
    focus(): void {
      active = true;
      input.setEnabled(true);
      loop.paused = paused;
      loop.start();
    },
    setActive(v: boolean): void {
      active = v;
      input.setEnabled(v);
      loop.paused = !v || paused;
      if (v) loop.start();
    },
    destroy(): void {
      loop.stop();
      input.destroy();
      input.setEnabled(false);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('resize', resize);
    },
  };
}

export { POCKET };
