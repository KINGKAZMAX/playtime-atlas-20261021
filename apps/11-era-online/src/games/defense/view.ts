/**
 * defense/view.ts — 《灯塔协议》的 DOM 装配与交互。
 *
 * 交互方式同时覆盖三条路径：
 * - 鼠标：点击画布格子建造 / 点选已有塔。
 * - 触屏：点选塔种按钮 → 点画布格子；所有按钮为 44px 以上点击区。
 * - 键盘：1-4 选塔种，方向键移动光标，Enter 建造/确认，U 升级，X 出售，Space 开波，Esc/P 暂停。
 */

import { audio } from '../../core/audio';
import { el, clear } from '../../core/dom';
import { Input, pointerToCanvas, type Action } from '../../core/input';
import { GameLoop } from '../../core/loop';

import { loadJson, saveJson, storageAvailable } from '../../core/storage';
import { updateAi, aiSnapshot } from './ai';
import {
  CANVAS_H,
  CANVAS_W,
  CELL,
  DIFFICULTIES,
  DIFFICULTY_ORDER,
  ENEMIES,
  GRID_COLS,
  GRID_ROWS,
  TOTAL_WAVES,
  TOWERS,
  TOWER_ORDER,
} from './config';
import { renderDefense } from './render';
import {
  buildTower,
  createState,
  deserialize,
  sellTower,
  serialize,
  startNextWave,
  stepDefense,
  towerById,
  upgradeCost,
  upgradeTower,
  type DefenseSave,
} from './sim';
import type { DefenseState, Difficulty, TargetMode, TowerKind } from './types';

const SAVE_KEY = 'defense.save';

export interface DefenseView {
  root: HTMLElement;
  focus(): void;
  setActive(active: boolean): void;
  /** 读取当前对局状态（供调试与自动化验收使用）。 */
  getState(): DefenseState;
  destroy(): void;
}

export function createDefenseView(): DefenseView {
  let state: DefenseState = createState(20261021, 'standard');
  let active = false;

  // ── DOM 骨架 ──
  const canvas = el('canvas', { class: 'defense__canvas', width: CANVAS_W, height: CANVAS_H, role: 'img', 'aria-label': '灯塔协议战场' });
  const overlay = el('div', { class: 'defense__overlay', hidden: true });
  const board = el('div', { class: 'defense__board' }, [canvas, overlay]);

  const statSigma = el('span', { class: 'stat__value', text: '0' });
  const statFlux = el('span', { class: 'stat__value', text: '0' });
  const statWave = el('span', { class: 'stat__value', text: '0/18' });
  const statHp = el('span', { class: 'stat__value', text: '100%' });
  const hpFill = el('i', { class: 'meter__fill' });

  const hudPanel = el('section', { class: 'panel panel--hud' }, [
    el('h3', { class: 'panel__title', text: '灯塔状态' }),    el('div', { class: 'stat' }, [
      el('span', { class: 'stat__label', text: '晶格 Σ' }),
      statSigma,
    ]),
    el('div', { class: 'stat' }, [
      el('span', { class: 'stat__label', text: '能量 Φ' }),
      el('i', { class: 'meter meter--flux' }, [el('i', { class: 'meter__fill meter__fill--flux' })]),
      statFlux,
    ]),
    el('div', { class: 'stat' }, [
      el('span', { class: 'stat__label', text: '波次' }),
      statWave,
    ]),
    el('div', { class: 'stat stat--hp' }, [
      el('span', { class: 'stat__label', text: '灯塔耐久' }),
      el('i', { class: 'meter meter--hp' }, [hpFill]),
      statHp,
    ]),
  ]);

  // ── AI 面板 ──
  const aiBadge = el('span', { class: 'badge badge--ai', text: '本机 AI · 非真人玩家 · 无联网' });
  const aiPool = el('span', { class: 'stat__value', text: '0' });
  const aiCountdown = el('span', { class: 'stat__value', text: '—' });
  const aiIntent = el('p', { class: 'ai__intent', text: '—' });
  const aiCount = el('span', { class: 'stat__value', text: '0' });
  const aiLog = el('ul', { class: 'ai__log' });
  const aiDifficulty = el('span', { class: 'chip', text: '标准' });

  const aiPanel = el('section', { class: 'panel panel--ai' }, [
    el('div', { class: 'panel__head' }, [
      el('h3', { class: 'panel__title', text: '对手 AI · 灰烬协议' }),
      aiBadge,
    ]),
    el('p', { class: 'panel__note', text: '本对手由本机程序驱动，不连接任何服务器，也不存在真人匹配。' }),
    el('div', { class: 'stat' }, [
      el('span', { class: 'stat__label', text: '灰烬能量' }),
      aiPool,
    ]),
    el('div', { class: 'stat' }, [
      el('span', { class: 'stat__label', text: '突击倒计时' }),
      aiCountdown,
    ]),
    el('div', { class: 'stat' }, [
      el('span', { class: 'stat__label', text: '已发动突击' }),
      aiCount,
    ]),
    el('div', { class: 'stat' }, [
      el('span', { class: 'stat__label', text: '难度档位' }),
      aiDifficulty,
    ]),
    aiIntent,
    aiLog,
  ]);

  // ── 建造面板 ──
  const buildButtons = new Map<TowerKind, HTMLButtonElement>();
  const buildPanel = el('section', { class: 'panel panel--build' }, [
    el('h3', { class: 'panel__title', text: '建造 · 选择塔种' }),
  ]);
  for (const kind of TOWER_ORDER) {
    const def = TOWERS[kind];
    const btn = el('button', {
      class: 'buildbtn',
      type: 'button',
      'data-kind': kind,
      'aria-label': `${def.name}，消耗 ${def.cost} 晶格`,
    }) as HTMLButtonElement;
    btn.append(
      el('i', { class: 'buildbtn__swatch', style: `background:${def.color}` }),
      el('span', { class: 'buildbtn__name', text: def.name }),
      el('span', { class: 'buildbtn__role', text: def.role }),
      el('span', { class: 'buildbtn__cost', text: `Σ${def.cost}` }),
      el('kbd', { class: 'buildbtn__key', text: String(TOWER_ORDER.indexOf(kind) + 1) }),
    );
    btn.addEventListener('click', () => {
      state.buildKind = state.buildKind === kind ? null : kind;
      state.selectedTower = null;
      audio.play('select');
      syncBuildButtons();
    });
    buildButtons.set(kind, btn);
    buildPanel.append(btn);
  }
  const buildHint = el('p', { class: 'panel__hint', text: '选中后点击战场空格建造；再次点击按钮取消。' });
  buildPanel.append(buildHint);

  // ── 选中塔面板 ──
  const selName = el('strong', { class: 'sel__name', text: '未选中' });
  const selBody = el('p', { class: 'sel__body', text: '点击战场上已建成的塔查看详情。' });
  const selActions = el('div', { class: 'sel__actions' });
  const selPanel = el('section', { class: 'panel panel--sel' }, [
    el('h3', { class: 'panel__title', text: '设施详情' }),
    selName,
    selBody,
    selActions,
  ]);

  // ── 预览 ──
  const previewList = el('ul', { class: 'preview__list' });
  const previewTitle = el('strong', { class: 'preview__title', text: '第 1 波' });
  const previewPanel = el('section', { class: 'panel panel--preview' }, [
    el('h3', { class: 'panel__title', text: '下一波情报' }),
    previewTitle,
    previewList,
  ]);

  // ── 控制条 ──
  const btnStart = el('button', { class: 'btn btn--primary', type: 'button', text: '立即开波 (Space)' });
  const btnPause = el('button', { class: 'btn', type: 'button', text: '暂停 (P)' });
  const btnSpeed = el('button', { class: 'btn', type: 'button', text: '速度 1×' });
  const btnSave = el('button', { class: 'btn', type: 'button', text: '存档' });
  const btnLoad = el('button', { class: 'btn', type: 'button', text: '读档' });
  const btnReset = el('button', { class: 'btn btn--ghost', type: 'button', text: '重开' });
  const btnMute = el('button', { class: 'btn btn--ghost', type: 'button', text: '静音' });
  const diffSelect = el('select', { class: 'select', 'aria-label': 'AI 难度档位' }) as HTMLSelectElement;
  for (const d of DIFFICULTY_ORDER) {
    const def = DIFFICULTIES[d];
    diffSelect.append(el('option', { value: d, text: `${def.name} · ${def.en}` }));
  }
  diffSelect.value = state.difficulty;

  const saveNote = el('span', { class: 'game__note', text: storageAvailable ? '存档写入本机 localStorage' : '当前环境不可写入 localStorage，刷新后进度不会保留' });

  const bar = el('div', { class: 'game__bar' }, [
    btnStart,
    btnPause,
    btnSpeed,
    btnSave,
    btnLoad,
    btnReset,
    btnMute,
    el('label', { class: 'bar__label', text: 'AI 难度' }),
    diffSelect,
    saveNote,
  ]);

  const side = el('div', { class: 'defense__side' }, [hudPanel, aiPanel, buildPanel, selPanel, previewPanel]);
  const main = el('div', { class: 'defense__main' }, [board, side]);
  const root = el('div', { class: 'game game--defense' }, [main, bar]);

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('无法创建 2D 绘图上下文');
  const gctx = ctx;

  // ── 分辨率自适应 ──
  const resize = (): void => {
    const dpr = Math.min(2.5, window.devicePixelRatio || 1);
    canvas.width = Math.round(CANVAS_W * dpr);
    canvas.height = Math.round(CANVAS_H * dpr);
    canvas.style.aspectRatio = `${CANVAS_W} / ${CANVAS_H}`;
  };
  resize();
  window.addEventListener('resize', resize);

  // ── 输入 ──
  const input = new Input(window);
  input.setEnabled(false);

  const loop = new GameLoop({
    update: (dt) => {
      stepDefense(state, dt);
      updateAi(state, dt);
      onTickCursor(dt);
      input.endFrame();
    },
    render: () => {
      renderDefense(gctx, state, performance.now() / 1000, canvas.width / CANVAS_W);
      syncHud();
    },
  });

  // ── 画布交互 ──
  const cellFromEvent = (e: PointerEvent): { col: number; row: number } => {
    const p = pointerToCanvas(e, canvas);
    return { col: Math.floor(p.x / CELL), row: Math.floor(p.y / CELL) };
  };

  const onCanvasPointerDown = (e: PointerEvent): void => {
    if (state.over) return;
    audio.unlock();
    const { col, row } = cellFromEvent(e);
    if (col < 0 || col >= GRID_COLS || row < 0 || row >= GRID_ROWS) return;
    state.cursor = { col, row };

    const existing = state.towers.find((t) => t.col === col && t.row === row);
    if (existing) {
      state.selectedTower = existing.id;
      state.buildKind = null;
      syncBuildButtons();
      audio.play('select');
      return;
    }
    if (state.buildKind) {
      buildTower(state, state.buildKind, col, row);
      syncBuildButtons();
    } else {
      state.selectedTower = null;
    }
    syncHud();
  };
  canvas.addEventListener('pointerdown', onCanvasPointerDown);

  // ── 按钮 ──
  btnStart.addEventListener('click', () => {
    if (state.inWave || state.over) return;
    startNextWave(state);
    syncHud();
  });
  btnPause.addEventListener('click', () => togglePause());
  btnSpeed.addEventListener('click', () => {
    state.speed = state.speed === 1 ? 2 : 1;
    loop.speed = state.speed;
    btnSpeed.textContent = `速度 ${state.speed}×`;
    audio.play('tick');
  });
  btnSave.addEventListener('click', () => {
    const ok = saveJson<DefenseSave>(SAVE_KEY, serialize(state));
    flash(ok ? '已存档' : '存档失败', ok ? '#7cf29a' : '#ff5d73');
  });
  btnLoad.addEventListener('click', () => {
    const save = loadJson<DefenseSave>(SAVE_KEY);
    if (!save || save.v !== 1) {
      flash('没有可用存档', '#ffd166');
      return;
    }
    state = deserialize(save);
    state.speed = 1;
    loop.speed = 1;
    btnSpeed.textContent = '速度 1×';
    diffSelect.value = state.difficulty;
    syncBuildButtons();
    flash('已读档', '#7cf29a');
    syncHud();
  });
  btnReset.addEventListener('click', () => {
    const d = state.difficulty;
    state = createState(Math.floor(Math.random() * 1e9), d);
    state.speed = 1;
    loop.speed = 1;
    btnSpeed.textContent = '速度 1×';
    state.buildKind = null;
    state.selectedTower = null;
    syncBuildButtons();
    flash('已重开', '#4fd6ff');
    syncHud();
  });
  btnMute.addEventListener('click', () => {
    audio.setMuted(!audio.muted);
    btnMute.textContent = audio.muted ? '取消静音' : '静音';
  });
  diffSelect.addEventListener('change', () => {
    const d = diffSelect.value as Difficulty;
    state.difficulty = d;
    const def = DIFFICULTIES[d];
    state.ashRate = def.ashRate;
    state.assaultInterval = def.assaultInterval;
    state.assaultCountdown = def.assaultInterval;
    state.aiIntent = `难度切换为「${def.name}」：${def.desc}`;
    flash(`AI 难度：${def.name}`, '#a78bfa');
    syncHud();
  });

  // ── 键盘 ──
  const onKeyDown = (e: KeyboardEvent): void => {
    if (!root.classList.contains('is-active')) return;
    const tag = (e.target as HTMLElement | null)?.tagName;
    if (tag === 'INPUT' || tag === 'SELECT' || tag === 'TEXTAREA') return;
    const key = e.code;
    if (key === 'KeyP' || key === 'Escape') {
      e.preventDefault();
      togglePause();
      return;
    }
    if (key === 'Space') {
      e.preventDefault();
      if (!state.inWave && !state.over) startNextWave(state);
      return;
    }
    if (state.over) return;
    if (key >= 'Digit1' && key <= 'Digit4') {
      const idx = Number(key.slice(5)) - 1;
      const kind = TOWER_ORDER[idx];
      if (kind) {
        state.buildKind = state.buildKind === kind ? null : kind;
        state.selectedTower = null;
        syncBuildButtons();
        audio.play('select');
      }
      return;
    }
    if (key === 'KeyU') {
      if (state.selectedTower !== null) upgradeTower(state, state.selectedTower);
      return;
    }
    if (key === 'KeyX') {
      if (state.selectedTower !== null) sellTower(state, state.selectedTower);
      return;
    }
    if (key === 'Enter') {
      const c = state.cursor;
      const existing = state.towers.find((t) => t.col === c.col && t.row === c.row);
      if (existing) {
        state.selectedTower = existing.id;
        state.buildKind = null;
      } else if (state.buildKind) {
        buildTower(state, state.buildKind, c.col, c.row);
      }
      syncBuildButtons();
    }
  };
  window.addEventListener('keydown', onKeyDown);

  // 方向键移动光标。
  // - 「刚按下」时立刻移动 1 格，保证轻点也有效（否则快速点按会被 60Hz 轮询漏掉）
  // - 持续按住时先等 0.24s，再以 0.08s 的间隔自动重复
  const CURSOR_REPEAT_DELAY = 0.24;
  const CURSOR_REPEAT_RATE = 0.08;
  let cursorRepeatTimer = 0;

  const moveCursor = (dx: number, dy: number): void => {
    state.cursor = {
      col: Math.max(0, Math.min(GRID_COLS - 1, state.cursor.col + dx)),
      row: Math.max(0, Math.min(GRID_ROWS - 1, state.cursor.row + dy)),
    };
  };

  const onTickCursor = (dt: number): void => {
    if (!root.classList.contains('is-active')) return;
    const dirs: Array<[Action, number, number]> = [
      ['left', -1, 0],
      ['right', 1, 0],
      ['up', 0, -1],
      ['down', 0, 1],
    ];
    for (const [action, dx, dy] of dirs) {
      if (input.wasPressed(action)) {
        moveCursor(dx, dy);
        cursorRepeatTimer = 0;
      }
    }
    // 自动重复
    let activeDir: [number, number] | null = null;
    for (const [action, dx, dy] of dirs) {
      if (input.isDown(action)) {
        activeDir = [dx, dy];
        if (input.heldFor(action) >= CURSOR_REPEAT_DELAY) {
          cursorRepeatTimer += dt;
          while (cursorRepeatTimer >= CURSOR_REPEAT_RATE) {
            cursorRepeatTimer -= CURSOR_REPEAT_RATE;
            moveCursor(dx, dy);
          }
        }
        break;
      }
    }
    if (!activeDir) cursorRepeatTimer = 0;
  };

  // ── 覆盖层 ──
  const showOverlay = (title: string, body: string, actions: HTMLElement[]): void => {
    clear(overlay);
    overlay.hidden = false;
    overlay.append(
      el('div', { class: 'overlay__card' }, [
        el('h2', { class: 'overlay__title', text: title }),
        el('div', { class: 'overlay__body', html: body }),
        el('div', { class: 'overlay__actions' }, actions),
      ]),
    );
  };
  const hideOverlay = (): void => {
    overlay.hidden = true;
    clear(overlay);
  };

  const togglePause = (): void => {
    if (state.over) return;
    state.paused = !state.paused;
    loop.paused = !active || state.paused;
    btnPause.textContent = state.paused ? '继续 (P)' : '暂停 (P)';
    if (state.paused) {
      showOverlay(
        '已暂停',
        '<p>模拟已冻结。灯塔、敌人与灰烬 AI 全部停止推进。</p>',
        [
          (() => {
            const b = el('button', { class: 'btn btn--primary', type: 'button', text: '继续' });
            b.addEventListener('click', () => togglePause());
            return b;
          })(),
          (() => {
            const b = el('button', { class: 'btn', type: 'button', text: '存档' });
            b.addEventListener('click', () => {
              saveJson<DefenseSave>(SAVE_KEY, serialize(state));
              flash('已存档', '#7cf29a');
            });
            return b;
          })(),
        ],
      );
    } else {
      hideOverlay();
    }
  };

  const endOverlay = (win: boolean): void => {
    const mins = Math.max(1, Math.round((Date.now() - state.stats.startedAt) / 60000));
    const stats = `
      <ul class="result">
        <li><span>抵达波次</span><b>${state.wave} / ${TOTAL_WAVES}</b></li>
        <li><span>累计击毁</span><b>${state.stats.killed}</b></li>
        <li><span>漏过目标</span><b>${state.stats.leaked}</b></li>
        <li><span>建造设施</span><b>${state.stats.built}</b></li>
        <li><span>升级次数</span><b>${state.stats.upgrades}</b></li>
        <li><span>AI 突击次数</span><b>${state.assaultCount}</b></li>
        <li><span>用时</span><b>约 ${mins} 分钟</b></li>
      </ul>`;
    showOverlay(
      win ? '航道肃清 · 灯塔长明' : '灯塔失守',
      win
        ? `<p>你守住了 ${TOTAL_WAVES} 波入侵，灰烬协议的突击全部被挡在灯塔之外。</p>${stats}`
        : `<p>灯塔耐久归零，入侵者突破了防线。灰烬协议仍在持续集结。</p>${stats}`,
      [
        (() => {
          const b = el('button', { class: 'btn btn--primary', type: 'button', text: '再来一局' });
          b.addEventListener('click', () => {
            const d = state.difficulty;
            state = createState(Math.floor(Math.random() * 1e9), d);
            state.buildKind = null;
            state.selectedTower = null;
            syncBuildButtons();
            hideOverlay();
            syncHud();
          });
          return b;
        })(),
        (() => {
          const b = el('button', { class: 'btn', type: 'button', text: '回到展项' });
          b.addEventListener('click', () => {
            root.dispatchEvent(new CustomEvent('defense:exit', { bubbles: true }));
          });
          return b;
        })(),
      ],
    );
  };

  let endShown = false;

  const flash = (text: string, color: string): void => {
    state.banner = text;
    state.bannerT = 1.6;
    void color;
  };

  // ── HUD 同步 ──
  //
  // 注意：syncHud 每帧都会调用。因此这里必须把「每帧可变的文本」与
  // 「需要重建 DOM 的面板」分开处理 —— 每帧重建按钮会让按钮在点击落点前
  // 被卸载（表现为点不动），同时也白白制造大量垃圾节点。
  let selPanelKey = '';
  let aiLogKey = '';
  let previewKey = '';
  let upBtn: HTMLButtonElement | null = null;
  let upCost: { sigma: number; flux: number } | null = null;
  let selKillsCell: HTMLElement | null = null;

  function syncBuildButtons(): void {
    for (const [kind, btn] of buildButtons) {
      const active = state.buildKind === kind;
      btn.classList.toggle('is-active', active);
      btn.setAttribute('aria-pressed', String(active));
      btn.classList.toggle('is-locked', state.sigma < TOWERS[kind].cost);
    }
  }

  /** 重建「设施详情」面板。仅在选中的塔或它的等级/索敌模式变化时调用。 */
  function buildSelectionPanel(sel: ReturnType<typeof towerById>): void {
    clear(selActions);
    upBtn = null;
    upCost = null;
    selKillsCell = null;

    if (!sel) {
      selName.textContent = '未选中';
      selBody.textContent = '点击战场上已建成的塔查看详情。';
      return;
    }

    const def = TOWERS[sel.kind];
    const lvl = def.levels[sel.level - 1]!;
    selName.textContent = `${def.name} Lv${sel.level}`;
    selBody.innerHTML = `
      <ul class="sel__list">
        <li><span>伤害</span><b>${Math.round(lvl.damage)}</b></li>
        <li><span>射速</span><b>${lvl.rate.toFixed(2)}/s</b></li>
        <li><span>射程</span><b>${lvl.range.toFixed(1)} 格</b></li>
        ${lvl.splash > 0 ? `<li><span>溅射</span><b>${lvl.splash.toFixed(1)} 格</b></li>` : ''}
        ${lvl.slow > 0 ? `<li><span>减速</span><b>${Math.round(lvl.slow * 100)}%</b></li>` : ''}
        ${lvl.chain > 0 ? `<li><span>连锁</span><b>${lvl.chain} 目标</b></li>` : ''}
        ${lvl.aura > 0 ? `<li><span>邻塔增伤</span><b>+${Math.round(lvl.aura * 100)}%</b></li>` : ''}
        <li><span>击毁</span><b data-kills>${sel.kills}</b></li>
      </ul>`;
    selKillsCell = selBody.querySelector('[data-kills]');

    const cost = upgradeCost(sel);
    if (cost) {
      upCost = cost;
      const up = el('button', {
        class: 'btn btn--primary',
        type: 'button',
        text: `升级 Lv${sel.level + 1}（Σ${cost.sigma} · Φ${cost.flux}）`,
      }) as HTMLButtonElement;
      up.addEventListener('click', () => {
        upgradeTower(state, sel.id);
        selPanelKey = '';
        syncHud();
      });
      upBtn = up;
      selActions.append(up);
    } else {
      selActions.append(el('span', { class: 'sel__max', text: '已达最高等级' }));
    }

    const sell = el('button', { class: 'btn btn--ghost', type: 'button', text: '回收（返还 60%）' }) as HTMLButtonElement;
    sell.addEventListener('click', () => {
      sellTower(state, sel.id);
      selPanelKey = '';
      syncHud();
    });
    selActions.append(sell);

    const modes: Array<[TargetMode, string]> = [
      ['first', '最前'],
      ['strong', '最强'],
      ['close', '最近'],
    ];
    const modeWrap = el('div', { class: 'sel__modes' }, [el('span', { class: 'sel__modelabel', text: '索敌' })]);
    for (const [m, label] of modes) {
      const b = el('button', {
        class: `chipbtn ${sel.mode === m ? 'is-active' : ''}`,
        type: 'button',
        text: label,
      }) as HTMLButtonElement;
      b.addEventListener('click', () => {
        sel.mode = m;
        selPanelKey = '';
        audio.play('tick');
        syncHud();
      });
      modeWrap.append(b);
    }
    selActions.append(modeWrap);
  }

  /** 重建下一波预览。仅在波次编号变化时调用。 */
  function buildPreview(): void {
    previewTitle.textContent = `第 ${state.preview.index} 波 · ${state.preview.label}`;
    clear(previewList);
    const counts = new Map<string, number>();
    for (const item of state.preview.items) {
      counts.set(item.kind, (counts.get(item.kind) ?? 0) + 1);
    }
    if (counts.size === 0) {
      previewList.append(el('li', { class: 'preview__item', text: '全部航道已肃清。' }));
    }
    for (const [kind, n] of counts) {
      const def = ENEMIES[kind as keyof typeof ENEMIES];
      previewList.append(
        el('li', { class: 'preview__item' }, [
          el('i', { class: 'preview__dot', style: `background:${def.color}` }),
          el('span', { text: def.name }),
          el('b', { text: `×${n}` }),
        ]),
      );
    }
    if (state.preview.elite) {
      previewList.append(el('li', { class: 'preview__item preview__item--elite', text: '⚠ 精英波：敌人生命 ×1.6、移速 ×0.92' }));
    }
    if (state.preview.boss) {
      previewList.append(el('li', { class: 'preview__item preview__item--boss', text: '☠ 首领波：湮灭体（耐久 2600 / 减伤 11）' }));
    }
  }

  function syncHud(): void {
    // ── 每帧可变的轻量文本 ──
    statSigma.textContent = String(Math.floor(state.sigma));
    statFlux.textContent = `${Math.floor(state.flux)}/${state.fluxMax}`;
    statWave.textContent = `${state.wave}/${TOTAL_WAVES}`;
    const hp = Math.max(0, state.beaconHp);
    statHp.textContent = `${Math.round((hp / state.beaconMax) * 100)}%`;
    hpFill.style.width = `${(hp / state.beaconMax) * 100}%`;
    hpFill.classList.toggle('is-danger', hp / state.beaconMax < 0.35);

    const snap = aiSnapshot(state);
    aiPool.textContent = `${snap.pool}`;
    aiCountdown.textContent = `${snap.countdown.toFixed(1)}s / ${snap.interval}s`;
    aiIntent.textContent = snap.intent;
    aiCount.textContent = String(snap.count);
    aiDifficulty.textContent = snap.difficulty;

    // 建造按钮可负担状态
    for (const [kind, btn] of buildButtons) {
      btn.classList.toggle('is-locked', state.sigma < TOWERS[kind].cost);
    }

    // ── 需要重建的部分（仅在内容变化时） ──
    const logKey = snap.log.map((l) => l.text).join('|');
    if (logKey !== aiLogKey) {
      aiLogKey = logKey;
      clear(aiLog);
      for (const entry of snap.log) {
        aiLog.append(el('li', { class: 'ai__logitem', text: entry.text }));
      }
      if (snap.log.length === 0) {
        aiLog.append(el('li', { class: 'ai__logitem ai__logitem--muted', text: '尚无突击记录。' }));
      }
    }

    const sel = state.selectedTower !== null ? towerById(state, state.selectedTower) : undefined;
    const selKey = sel ? `${sel.id}:${sel.level}:${sel.mode}` : 'none';
    if (selKey !== selPanelKey) {
      selPanelKey = selKey;
      buildSelectionPanel(sel);
    } else if (sel && selKillsCell) {
      selKillsCell.textContent = String(sel.kills);
    }
    // 升级按钮的可用性随资源变化，但不重建节点
    if (upBtn && upCost) {
      upBtn.disabled = state.sigma < upCost.sigma || state.flux < upCost.flux;
    }

    const pKey = String(state.preview.index);
    if (pKey !== previewKey) {
      previewKey = pKey;
      buildPreview();
    }

    // 结束遮罩
    if (state.over && !endShown) {
      endShown = true;
      endOverlay(state.over === 'win');
    } else if (!state.over && endShown) {
      endShown = false;
      hideOverlay();
    }

    btnStart.disabled = state.inWave || state.over !== null;
  }

  // ── 生命周期 ──
  // 载入已有存档
  const existing = loadJson<DefenseSave>(SAVE_KEY);
  if (existing && existing.v === 1) {
    state = deserialize(existing);
    diffSelect.value = state.difficulty;
  }
  syncBuildButtons();
  syncHud();

  return {
    root,
    focus(): void {
      active = true;
      input.setEnabled(true);
      loop.paused = state.paused;
      loop.start();
    },
    setActive(v: boolean): void {
      active = v;
      // is-active 标记既用于键盘事件路由，也用于样式
      root.classList.toggle('is-active', v);
      input.setEnabled(v);
      loop.paused = !v || state.paused;
      // 非当前展项时完全停掉渲染循环，避免两个画布同时空转
      if (v) loop.start();
      else loop.stop();
    },
    getState(): DefenseState {
      return state;
    },
    destroy(): void {
      loop.stop();
      input.destroy();
      input.setEnabled(false);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('resize', resize);
      canvas.removeEventListener('pointerdown', onCanvasPointerDown);
    },
  };
}
