/**
 * 织造车间调度台 · LOOMDECK —— 主控制器
 * ------------------------------------------------------------------
 * 负责：装配状态、事件绑定、仿真循环、持久化调度、键盘操作。
 * 业务规则在 workshop.js，渲染在 ui.js，本文件只做编排。
 */

import {
  tick, makeOrder, validateOrderDraft, assignOrder, revokeOrder, resetLoom,
  toggleLoomPower, changePriority, pushEvent, sortQueue, LIMITS, LOOM_STATE,
} from './workshop.js';
import { createStorage, hydrate } from './storage.js';
import {
  renderHeadline, renderOrders, renderLooms, renderTelemetry, renderLog,
  renderDrawer, toast, $, $$,
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
    renderLog(state, { append: parts.appendLog });
    renderDrawer(state);
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
    const before = state.log.length;
    tick(state, dt);
    const after = state.log.length;
    scheduleRender({ appendLog: after > before });
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
    document.querySelectorAll('.seg--sm .seg__btn').forEach((b) => b.classList.remove('is-on'));
    btn.classList.add('is-on');
    state.logLevel = btn.dataset.level;
    renderLog(state);
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
    $$('.seg .seg__btn[data-scale]').forEach((b) => b.classList.remove('is-on'));
    btn.classList.add('is-on');
    state.chartScale = btn.dataset.scale;
    renderTelemetry(state);
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
  const ok = window.confirm('重置车间将清空订单簿、机台状态、日志与遥测存档，确定继续？');
  if (!ok) return;
  storage.clear();
  state = hydrate(null);
  restoredAt = null;
  $('#restore-banner').hidden = true;
  pushEvent(state, 'info', '系统', '车间已重置，回到初始状态');
  scheduleRender();
  toast('车间已重置', 'ok');
});

$('#btn-dismiss-restore').addEventListener('click', () => {
  $('#restore-banner').hidden = true;
});

/* ────────────── 键盘操作 ────────────── */

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
      $('#btn-pause-log').click();
      return;
    }

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

// 首次启动：放两张种子订单，方便直接看到调度流程
if (!state.orders.length && !restoredAt) {
  const seedA = makeOrder({ cloth: '亚麻', dye: '靛蓝', width: 92, density: 44, picks: 5, priority: 1 });
  const seedB = makeOrder({ cloth: '桑蚕丝', dye: '柿红', width: 76, density: 38, picks: 3, priority: 2 });
  state.orders.push(seedA, seedB);
  pushEvent(state, 'info', '系统', '车间启动，已载入两张示例订单');
}

startLoop();
scheduleRender();
scheduleSave();

// 便于调试与自动化验收
window.__loomdeck = {
  get state() { return state; },
  assignOrder, revokeOrder, resetLoom, toggleLoomPower, validateOrderDraft, LIMITS,
};
