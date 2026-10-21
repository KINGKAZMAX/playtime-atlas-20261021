/**
 * 织造车间调度台 · LOOMDECK —— 主控制器
 * ------------------------------------------------------------------
 * 负责：装配状态、事件绑定、仿真循环、持久化调度、键盘操作。
 * 业务规则在 workshop.js，渲染在 ui.js，本文件只做编排。
 */

import {
  tick, makeOrder, validateOrderDraft, assignOrder, revokeOrder, resetLoom,
  toggleLoomPower, changePriority, pushEvent, sortQueue, dispatchQueued,
  seedOrders, LIMITS, LOOM_STATE, SHIFT, TEMPO,
} from './workshop.js';
import { createStorage, hydrate } from './storage.js';
import {
  renderHeadline, renderOrders, renderLooms, renderTelemetry, renderLog,
  renderDrawer, renderShift, toast, $, $$,
} from './ui.js';

/* ────────────── 状态 ────────────── */

const storage = createStorage({
  onFallback: (reason) => toast(reason, 'err'),
});

let state = hydrate(storage.read());
let restoredAt = null;
if (storage.read()) {
  restoredAt = state.savedAt ?? null;
  pushEvent(state, 'info', '系统', '已恢复上次会话的车间存档');
}

let lastTick = Date.now();
let tickTimer = null;
let saveTimer = null;

/* ────────────── 当班状态机 ────────────── */

/** 开工 / 复工。 */
function startShift(reason = '主管开工') {
  if (state.shift === SHIFT.RUNNING) return false;
  const wasPaused = state.shift === SHIFT.PAUSED;
  state.shift = SHIFT.RUNNING;
  pushEvent(state, 'info', '主管', wasPaused ? '当班继续，遥测恢复采样' : `${reason}，机台开始接单`);
  return true;
}

/** 暂停 / 继续当班。 */
function toggleShift() {
  if (state.shift === SHIFT.PAUSED) {
    state.shift = SHIFT.RUNNING;
    pushEvent(state, 'info', '主管', '当班继续，遥测恢复采样');
  } else {
    state.shift = SHIFT.PAUSED;
    pushEvent(state, 'warn', '主管', '当班暂停，织造与遥测冻结');
  }
  return state.shift;
}

/** 手动派工：把待排订单派到空闲机台，并确保当班在产。 */
function runDispatch() {
  startShift('主管开工');
  const res = dispatchQueued(state, { auto: false });
  if (res.count) {
    pushEvent(state, 'done', '主管', `派工完成：${res.count} 张订单上机`);
    toast(`已派 ${res.count} 张订单到空闲机台`, 'ok');
  } else {
    toast(res.reason, 'err');
  }
  scheduleRender();
  scheduleSave();
}

/* ────────────── 渲染调度 ────────────── */

let renderQueued = false;
function scheduleRender(parts = {}) {
  if (renderQueued) return;
  renderQueued = true;
  requestAnimationFrame(() => {
    renderQueued = false;
    renderHeadline(state);
    renderOrders(state);
    renderLooms(state);
    renderTelemetry(state);
    renderLog(state, { force: parts.forceLog });
    renderDrawer(state);
    renderShift(state);
  });
}

/* ────────────── 仿真循环 ────────────── */

function startLoop() {
  if (tickTimer) return;
  lastTick = Date.now();
  tickTimer = setInterval(() => {
    const now = Date.now();
    const dt = Math.min(2400, now - lastTick);
    lastTick = now;
    // 只有在产状态下才推进仿真；暂停时织造与遥测一起冻结
    if (state.shift === SHIFT.RUNNING) {
      tick(state, dt);
      // 机台空出后自动续派队首订单（可在班次节奏面板关闭）
      if (state.autoDispatch) dispatchQueued(state, { auto: true });
    }
    scheduleRender();
  }, 900);
}

/* ────────────── 持久化调度 ────────────── */

function scheduleSave() {
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    storage.write(state);
  }, 700);
}

function saveNow() {
  if (saveTimer) { clearTimeout(saveTimer); saveTimer = null; }
  storage.write(state);
}

/* ────────────── 表单 ────────────── */

const form = $('#order-form');

function fieldError(field, msg) {
  const wrap = form.querySelector(`[name="${field}"]`)?.closest('.field');
  if (!wrap) return;
  wrap.classList.toggle('has-error', Boolean(msg));
  let err = wrap.querySelector('.field__err');
  if (msg) {
    if (!err) {
      err = document.createElement('span');
      err.className = 'field__err';
      wrap.appendChild(err);
    }
    err.textContent = msg;
  } else if (err) {
    err.remove();
  }
}

function clearFieldErrors() {
  $$('.field.has-error', form).forEach((f) => f.classList.remove('has-error'));
  $$('.field__err', form).forEach((e) => e.remove());
  const box = $('#form-error');
  box.hidden = true;
  box.textContent = '';
}

function readDraft() {
  return {
    cloth: $('#f-cloth').value,
    width: $('#f-width').value,
    density: $('#f-density').value,
    picks: $('#f-picks').value,
    dye: $('#f-dye').value,
    priority: $('#f-priority').value,
  };
}

form.addEventListener('submit', (ev) => {
  ev.preventDefault();
  clearFieldErrors();

  const draft = readDraft();
  const { ok, errors } = validateOrderDraft(draft);

  if (!ok) {
    for (const [field, msg] of Object.entries(errors)) fieldError(field, msg);
    const first = Object.keys(errors)[0];
    const box = $('#form-error');
    box.textContent = `无法下单：${errors[first]}`;
    box.hidden = false;
    const el = form.querySelector(`[name="${first}"]`);
    el?.focus();
    return;
  }

  const order = makeOrder(draft);
  state.orders.push(order);
  pushEvent(state, 'info', '主管', `新订单 ${order.id}：${order.cloth}·${order.dye} ${order.width}cm ${order.picks} 匹`);
  toast(`已加入订单簿：${order.id}`, 'ok');
  scheduleRender();
  scheduleSave();
});

form.addEventListener('input', (ev) => {
  const name = ev.target.name;
  if (!name) return;
  const wrap = ev.target.closest('.field');
  if (wrap?.classList.contains('has-error')) {
    const { errors } = validateOrderDraft(readDraft());
    fieldError(name, errors[name] ?? '');
  }
});

$('#btn-clear-orders').addEventListener('click', () => {
  const queued = state.orders.filter((o) => o.state === 'queued');
  if (!queued.length) { toast('没有待排订单'); return; }
  for (const o of queued) {
    o.state = 'cancelled';
  }
  pushEvent(state, 'warn', '主管', `清空待排订单 ${queued.length} 张`);
  toast(`已清空 ${queued.length} 张待排订单`, 'ok');
  scheduleRender();
  scheduleSave();
});

/* ────────────── 订单簿操作（事件委托） ────────────── */

$('#order-list').addEventListener('click', (ev) => {
  const btn = ev.target.closest('button[data-act]');
  if (!btn) return;
  const orderId = btn.dataset.order;
  const act = btn.dataset.act;

  if (act === 'assign') {
    // 派单：选一台可用机台
    const target = state.looms.find((l) => l.state === LOOM_STATE.IDLE && !l.orderId);
    if (!target) {
      toast('没有可接单的机台（全部在制、故障或停机）', 'err');
      return;
    }
    const res = assignOrder(state, orderId, target.id);
    if (!res.ok) { toast(res.error, 'err'); return; }
    toast(`${orderId} 已派往 ${target.id}`, 'ok');
  } else if (act === 'raise' || act === 'lower') {
    const res = changePriority(state, orderId, act === 'raise' ? -1 : 1);
    if (!res.ok) { toast(res.error, 'err'); return; }
    toast(res.message, 'ok');
  } else if (act === 'cancel') {
    const order = state.orders.find((o) => o.id === orderId);
    if (!order) return;
    if (order.state !== 'queued') { toast('只有排队中的订单可以撤单', 'err'); return; }
    order.state = 'cancelled';
    pushEvent(state, 'warn', '主管', `订单 ${orderId} 被撤销`);
    toast(`${orderId} 已撤销`, 'ok');
  }

  scheduleRender();
  scheduleSave();
});

/* ────────────── 机台交互 ────────────── */

$('#loom-grid').addEventListener('click', (ev) => {
  const card = ev.target.closest('.loom');
  if (!card) return;
  const loomId = card.dataset.loom;
  state.selectedLoomId = state.selectedLoomId === loomId ? null : loomId;
  scheduleRender();
  scheduleSave();
});

/* ────────────── 抽屉操作 ────────────── */

$('#drawer-body').addEventListener('click', (ev) => {
  const btn = ev.target.closest('button[data-drawer-act]');
  if (!btn) return;
  const loomId = state.selectedLoomId;
  if (!loomId) return;
  const act = btn.dataset.drawerAct;

  if (act === 'reset') {
    const res = resetLoom(state, loomId);
    if (!res.ok) { toast(res.error, 'err'); return; }
    toast(`${loomId} 已复位`, 'ok');
  } else if (act === 'power') {
    const res = toggleLoomPower(state, loomId);
    if (!res.ok) { toast(res.error, 'err'); return; }
    toast(res.message, 'ok');
  } else if (act === 'revoke') {
    const res = revokeOrder(state, loomId);
    if (!res.ok) { toast(res.error, 'err'); return; }
    toast(`${loomId} 的订单已退回队列`, 'ok');
  }

  scheduleRender();
  scheduleSave();
});

$('#btn-close-drawer').addEventListener('click', () => {
  state.selectedLoomId = null;
  scheduleRender();
  scheduleSave();
});

/* ────────────── 日志控制 ────────────── */

$$('#log-list').length; // 保持引用，避免打包器误删

document.querySelectorAll('[data-level]').forEach((btn) => {
  if (btn.tagName !== 'BUTTON') return;
  btn.addEventListener('click', () => {
    document.querySelectorAll('.seg--sm .seg__btn').forEach((b) => {
      b.classList.remove('is-on');
      b.setAttribute('aria-pressed', 'false');
    });
    btn.classList.add('is-on');
    btn.setAttribute('aria-pressed', 'true');
    state.logLevel = btn.dataset.level;
    renderLog(state, { force: true });
    scheduleSave();
  });
});

$('#btn-pause-log').addEventListener('click', () => {
  state.logPaused = !state.logPaused;
  const btn = $('#btn-pause-log');
  btn.setAttribute('aria-pressed', String(state.logPaused));
  btn.textContent = state.logPaused ? '继续滚动' : '暂停滚动';
  toast(state.logPaused ? '日志自动滚动已暂停' : '日志自动滚动已继续');
  scheduleSave();
});

$('#btn-clear-log').addEventListener('click', () => {
  state.log.length = 0;
  renderLog(state);
  toast('日志已清空');
  scheduleSave();
});

/* ────────────── 遥测刻度切换 ────────────── */

$$('.seg .seg__btn[data-scale]').forEach((btn) => {
  btn.addEventListener('click', () => {
    $$('.seg .seg__btn[data-scale]').forEach((b) => {
      b.classList.remove('is-on');
      b.setAttribute('aria-pressed', 'false');
    });
    btn.classList.add('is-on');
    btn.setAttribute('aria-pressed', 'true');
    state.chartScale = btn.dataset.scale;
    renderTelemetry(state);
    scheduleSave();
  });
});

/* ────────────── 当班控制（顶栏） ────────────── */

$('#btn-dispatch').addEventListener('click', () => {
  runDispatch();
});

$('#btn-shift-pause').addEventListener('click', () => {
  const next = toggleShift();
  toast(next === SHIFT.PAUSED ? '当班已暂停，遥测冻结' : '当班继续，恢复生产', next === SHIFT.PAUSED ? 'err' : 'ok');
  scheduleRender();
  scheduleSave();
});

/* ────────────── 自动续派开关 ────────────── */

$('#btn-auto-dispatch').addEventListener('click', () => {
  state.autoDispatch = !state.autoDispatch;
  pushEvent(state, 'info', '主管', state.autoDispatch
    ? '开启自动续派：机台空出后自动接队首订单'
    : '关闭自动续派：待排订单需主管手动派工');
  toast(state.autoDispatch ? '自动续派已开启' : '自动续派已关闭', 'ok');
  renderShift(state);
  scheduleSave();
});

/* ────────────── 班次节奏 ────────────── */

$$('#tempo-group .seg__btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    const tempo = btn.dataset.tempo;
    if (!TEMPO[tempo] || state.tempo === tempo) return;
    state.tempo = tempo;
    pushEvent(state, 'info', '主管', `班次节奏切换为「${TEMPO[tempo].label}」—— ${TEMPO[tempo].note}`);
    toast(`班次节奏：${TEMPO[tempo].label}`, 'ok');
    renderShift(state);
    scheduleSave();
  });
});

/* ────────────── 顶栏与帮助 ────────────── */

$('#btn-help').addEventListener('click', () => {
  $('#help-modal').hidden = false;
  $('#btn-close-help').focus();
});
$('#btn-close-help').addEventListener('click', () => {
  $('#help-modal').hidden = true;
  $('#btn-help').focus();
});
$('#help-modal').addEventListener('click', (ev) => {
  if (ev.target === $('#help-modal')) $('#help-modal').hidden = true;
});

$('#btn-reset-all').addEventListener('click', () => {
  // 重置是可撤销动作：先留一份快照，toast 上提供「撤销」
  const snapshot = JSON.parse(JSON.stringify(state));
  storage.clear();
  state = hydrate(null);
  restoredAt = null;
  $('#restore-banner').hidden = true;
  seedOrders(state);
  state.shift = SHIFT.IDLE;
  pushEvent(state, 'info', '系统', '车间已重置：机台待开工，订单簿恢复模板');
  scheduleRender();
  scheduleSave();
  toast('车间已重置 · 等待开工', 'ok', {
    label: '撤销',
    onClick: () => {
      state = hydrate(snapshot);
      scheduleRender();
      scheduleSave();
      toast('已撤销重置', 'ok');
    },
  });
});

$('#btn-dismiss-restore').addEventListener('click', () => {
  $('#restore-banner').hidden = true;
});

/* ────────────── 键盘操作 ────────────── */

/**
 * 键盘作用域：只有当焦点落在展品自身时快捷键才生效。
 * 展品会被嵌进主站的 iframe，若无条件监听 document 级按键，
 * 会在未聚焦时劫持按键；这里采用「先聚焦、后响应」的策略。
 */
function keyboardFocused() {
  const ae = document.activeElement;
  if (!ae || ae === document.body || ae === document.documentElement) return false;
  return document.body.contains(ae);
}

function moveSelection(dx, dy) {
  const looms = state.looms;
  if (!looms.length) return;
  let idx = looms.findIndex((l) => l.id === state.selectedLoomId);
  if (idx === -1) idx = 0;
  else {
    // 响应式布局下每行台数不同，用近似列数做左右移动
    const cols = window.innerWidth >= 1280 ? 4 : (window.innerWidth >= 768 ? 3 : 2);
    idx = Math.min(looms.length - 1, Math.max(0, idx + dx + dy * cols));
  }
  state.selectedLoomId = looms[idx].id;
  scheduleRender();
  scheduleSave();
}

document.addEventListener('keydown', (ev) => {
  // 输入态不劫持按键
  const tag = ev.target?.tagName;
  const typing = tag === 'INPUT' || tag === 'SELECT' || tag === 'TEXTAREA';

  if (ev.key === 'Escape') {
    if (!$('#help-modal').hidden) { $('#help-modal').hidden = true; $('#btn-help').focus(); return; }
    if (state.selectedLoomId) { state.selectedLoomId = null; scheduleRender(); scheduleSave(); }
    return;
  }

  if (typing) return;
  if (ev.metaKey || ev.ctrlKey || ev.altKey) return;
  if (!$('#help-modal').hidden) return;
  // 未聚焦展品时不劫持键盘（嵌进主站 iframe 时尤其重要）
  if (!keyboardFocused()) return;

  // 空格 / 回车交给按钮自己处理，避免吞掉原生激活行为
  const onButton = ev.target?.tagName === 'BUTTON';
  if (onButton && (ev.key === ' ' || ev.key === 'Enter')) return;

  switch (ev.key) {
    case 'ArrowUp':    ev.preventDefault(); moveSelection(0, -1); return;
    case 'ArrowDown':  ev.preventDefault(); moveSelection(0, 1); return;
    case 'ArrowLeft':  ev.preventDefault(); moveSelection(-1, 0); return;
    case 'ArrowRight': ev.preventDefault(); moveSelection(1, 0); return;

    case 'Enter': {
      ev.preventDefault();
      const loom = state.looms.find((l) => l.id === state.selectedLoomId);
      if (!loom) { toast('请先选中一台织机', 'err'); return; }
      const next = sortQueue(state.orders)[0];
      if (!next) { toast('订单簿里没有待排订单', 'err'); return; }
      const res = assignOrder(state, next.id, loom.id);
      if (!res.ok) { toast(res.error, 'err'); return; }
      toast(`${next.id} 已派往 ${loom.id}`, 'ok');
      scheduleRender(); scheduleSave();
      return;
    }

    case 'Backspace': {
      ev.preventDefault();
      const loom = state.looms.find((l) => l.id === state.selectedLoomId);
      if (!loom) { toast('请先选中一台织机', 'err'); return; }
      const res = revokeOrder(state, loom.id, '快捷键撤单');
      if (!res.ok) { toast(res.error, 'err'); return; }
      toast(`${loom.id} 的订单已退回队列`, 'ok');
      scheduleRender(); scheduleSave();
      return;
    }

    case ' ': {
      ev.preventDefault();
      const next = toggleShift();
      toast(next === SHIFT.PAUSED ? '当班已暂停，遥测冻结' : '当班继续，恢复生产', next === SHIFT.PAUSED ? 'err' : 'ok');
      scheduleRender(); scheduleSave();
      return;
    }

    case 's': case 'S':
      $('#btn-pause-log').click();
      return;

    case 'l': case 'L':
      $('#btn-clear-log').click();
      return;

    case 'r': case 'R': {
      const loom = state.looms.find((l) => l.id === state.selectedLoomId);
      if (!loom) { toast('请先选中一台织机', 'err'); return; }
      const res = resetLoom(state, loom.id);
      if (!res.ok) { toast(res.error, 'err'); return; }
      toast(`${loom.id} 已复位`, 'ok');
      scheduleRender(); scheduleSave();
      return;
    }

    case 't': case 'T': {
      const next = state.chartScale === 'density' ? 'speed' : 'density';
      const btn = document.querySelector(`.seg__btn[data-scale="${next}"]`);
      btn?.click();
      return;
    }

    case 'n': case 'N':
      ev.preventDefault();
      $('#f-width').focus();
      $('#f-width').select?.();
      return;

    default:
      break;
  }

  // 数字键 1-9,0 → 聚焦第 1-10 台
  if (/^[0-9]$/.test(ev.key)) {
    const n = ev.key === '0' ? 10 : Number(ev.key);
    const loom = state.looms[n - 1];
    if (!loom) return;
    state.selectedLoomId = loom.id;
    scheduleRender(); scheduleSave();
  }
});

/* ────────────── 生命周期 ────────────── */

window.addEventListener('beforeunload', saveNow);
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden') saveNow();
});

// 恢复提示条
if (restoredAt) {
  const banner = $('#restore-banner');
  $('#restore-banner-text').textContent =
    `已恢复上次会话 · ${new Date(restoredAt).toLocaleString('zh-CN', { hour12: false })}`;
  banner.hidden = false;
}

// 首次启动：放两张种子订单并自动派上机，直接看到调度流程在跑
if (!state.orders.length && !restoredAt) {
  seedOrders(state);
  pushEvent(state, 'info', '系统', '车间启动，已载入两张示例订单');
  dispatchQueued(state, { auto: true });
}

startLoop();
scheduleRender();
scheduleSave();

/* ────────────── 键盘作用域提示 ──────────────
   快捷键只在展品自身获得焦点后生效（嵌入主站 iframe 时不劫持宿主键盘）。
   页面不主动抢焦点——那会破坏 Tab 顺序、也会在 iframe 里把焦点从主站抢走；
   改为：用户点一下界面即把焦点交给机台矩阵，键盘随即可用。 */
const grid = $('#loom-grid');

function updateKbdHint() {
  const hint = $('#kbd-hint');
  if (!hint) return;
  const ae = document.activeElement;
  const live = Boolean(ae && ae !== document.body && document.body.contains(ae));
  hint.hidden = live;
}

document.addEventListener('click', (ev) => {
  // 点在非控件区域 → 把焦点交给机台矩阵（快捷键随即生效）。
  // 必须用 click 而非 pointerdown：浏览器在 mousedown 默认动作里会把焦点收回 body。
  const onControl = ev.target.closest?.('a[href], button, input, select, textarea, [tabindex]');
  if (!onControl) grid?.focus({ preventScroll: true });
  requestAnimationFrame(updateKbdHint);
});

document.addEventListener('focusin', updateKbdHint);
document.addEventListener('focusout', () => requestAnimationFrame(updateKbdHint));
updateKbdHint();

// 便于调试与自动化验收。
// state 暴露为字符串状态机（idle / running / paused），其余细节在 workshop 上。
window.__loomdeck = {
  get state() { return state.shift; },
  get score() { return state.output; },
  get player() {
    const idx = state.looms.findIndex((l) => l.id === state.selectedLoomId);
    return { loom: idx >= 0 ? idx : -1 };
  },
  get ball() {
    const loom = state.looms.find((l) => l.id === state.selectedLoomId);
    return loom ? { progress: Math.round(loom.progress * 10) / 10 } : null;
  },
  get workshop() { return state; },
  assignOrder, revokeOrder, resetLoom, toggleLoomPower, validateOrderDraft,
  dispatchQueued, startShift, toggleShift, LIMITS, SHIFT, TEMPO,
};
