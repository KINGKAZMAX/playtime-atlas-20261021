/**
 * 霓虹街廊 · 街机可玩展厅
 * src/core/input.js — 键盘 + 触控 + 虚拟方向键
 *
 * 约定：
 *  1. 键盘仅在舞台获得焦点时生效（适配 iframe 嵌入主站，避免抢键）。
 *  2. 方向键 / 空格在启用时阻止页面滚动。
 *  3. 触控按钮与键盘写入同一套状态，逻辑层无需区分来源。
 */

const KEY_ALIAS = {
  ArrowUp: 'up',
  ArrowDown: 'down',
  ArrowLeft: 'left',
  ArrowRight: 'right',
  KeyW: 'up',
  KeyS: 'down',
  KeyA: 'left',
  KeyD: 'right',
  Space: 'action',
  Enter: 'action',
  KeyZ: 'action',
  KeyX: 'action2',
  KeyC: 'action2',
  KeyE: 'skill',
  KeyQ: 'cyclePrev',
  ShiftLeft: 'boost',
  ShiftRight: 'boost',
  Escape: 'pause',
  KeyP: 'pause',
  KeyR: 'restart',
  KeyM: 'mute',
  KeyH: 'help',
  Digit1: 'slot1',
  Digit2: 'slot2',
  Digit3: 'slot3',
  KeyF: 'ultimate',
};

const SWALLOW = new Set([
  'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight',
  'Space', 'Enter', 'KeyW', 'KeyA', 'KeyS', 'KeyD', 'KeyH', 'KeyP', 'KeyM',
]);

function isEditable(el) {
  if (!el) return false;
  const tag = el.tagName;
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || el.isContentEditable;
}

export function createInput({ stage, onFirstGesture }) {
  const down = new Set();          // 当前按住
  const pressed = new Set();       // 本帧新按下
  const released = new Set();      // 本帧新松开
  const virtual = new Set();       // 触控虚拟键
  let enabled = false;
  let gestured = false;

  function gesture() {
    if (gestured) return;
    gestured = true;
    if (onFirstGesture) onFirstGesture();
  }

  function onKeyDown(e) {
    if (isEditable(e.target)) return;
    const name = KEY_ALIAS[e.code];
    if (!name) return;
    if (!enabled) return;
    if (SWALLOW.has(e.code)) e.preventDefault();
    gesture();
    if (!down.has(name)) pressed.add(name);
    down.add(name);
  }

  function onKeyUp(e) {
    const name = KEY_ALIAS[e.code];
    if (!name) return;
    if (down.has(name)) released.add(name);
    down.delete(name);
  }

  function onBlur() {
    down.clear();
    virtual.clear();
  }

  window.addEventListener('keydown', onKeyDown, { passive: false });
  window.addEventListener('keyup', onKeyUp);
  window.addEventListener('blur', onBlur);

  const api = {
    /** 舞台获得焦点或用户点击时启用键盘 */
    enable() {
      enabled = true;
      gesture();
    },
    disable() {
      enabled = false;
      down.clear();
      virtual.clear();
    },
    isEnabled() {
      return enabled;
    },
    /** 是否按住 */
    held(name) {
      return down.has(name) || virtual.has(name);
    },
    /** 本帧是否刚按下（读取后自动清除） */
    consume(name) {
      if (pressed.has(name)) {
        pressed.delete(name);
        return true;
      }
      return false;
    },
    /** 本帧是否刚松开 */
    consumeRelease(name) {
      if (released.has(name)) {
        released.delete(name);
        return true;
      }
      return false;
    },
    /** 方向轴：-1 / 0 / 1 */
    axisX() {
      let v = 0;
      if (api.held('left')) v -= 1;
      if (api.held('right')) v += 1;
      return v;
    },
    axisY() {
      let v = 0;
      if (api.held('up')) v -= 1;
      if (api.held('down')) v += 1;
      return v;
    },
    /** 每帧末清理边沿事件 */
    endFrame() {
      pressed.clear();
      released.clear();
    },
    /** 触控层写入 */
    setVirtual(name, value) {
      if (value) {
        if (!virtual.has(name)) pressed.add(name);
        virtual.add(name);
        gesture();
      } else {
        if (virtual.has(name)) released.add(name);
        virtual.delete(name);
      }
    },
    /** 触控层瞬时触发（按钮点按） */
    tapVirtual(name) {
      pressed.add(name);
      gesture();
    },
    /** 舞台点击 → 获得焦点并启用键盘 */
    attachStage() {
      if (!stage) return;
      stage.addEventListener('pointerdown', () => {
        api.enable();
        if (stage.focus) stage.focus({ preventScroll: true });
      });
      stage.addEventListener('focus', () => api.enable());
      // 舞台失去焦点即交还键盘：否则用户在面板/按钮上操作时，
      // 方向键仍会驱动玩法 —— 即 MIGRATION-NOTES §4.1「未聚焦仍劫持键盘」那类缺陷。
      // 面板关闭时会把焦点归还给舞台（focus 事件）→ 重新启用。
      stage.addEventListener('blur', () => api.disable());
    },
    destroy() {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('blur', onBlur);
    },
    /** 调试出口：当前按住的键 / 本帧边沿事件 / 是否启用 */
    get debug() {
      return {
        enabled,
        down: Array.from(down),
        pressed: Array.from(pressed),
        released: Array.from(released),
        virtual: Array.from(virtual),
      };
    },
  };

  return api;
}
