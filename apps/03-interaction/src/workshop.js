/**
 * 车间模型与仿真核心
 * ------------------------------------------------------------------
 * 「织造车间调度台」的状态机与推进逻辑。
 *
 * 领域设定：一间手工织造车间，12 台提花织机在跑布。车间主管（用户）排产：
 * 下订单 → 派单到机台 → 机台换经 → 开始织造 → 完工或故障。
 * 遥测台实时反映梭速 / 经密 / 张力 / 断经率 / 能耗。
 *
 * 全部为本地确定性仿真：不联网、不调用任何外部 API。
 */

export const LOOM_COUNT = 12;
export const STORAGE_KEY = 'loomdeck.workshop.v1';
export const LOG_LIMIT = 200;
export const TELEMETRY_POINTS = 60;

/** 布种 —— 影响织造速度与断经率。 */
export const CLOTHS = {
  '亚麻':   { speed: 1.18, breakRisk: 0.9,  label: '亚麻' },
  '棉缎':   { speed: 1.05, breakRisk: 0.6,  label: '棉缎' },
  '羊毛':   { speed: 0.86, breakRisk: 1.25, label: '羊毛' },
  '桑蚕丝': { speed: 0.74, breakRisk: 1.6,  label: '桑蚕丝' },
  '苎麻':   { speed: 1.0,  breakRisk: 1.0,  label: '苎麻' },
};

/** 配色 —— 影响成品美观度与能耗。 */
export const DYES = {
  '靛蓝': { energy: 1.15, value: 1.25, label: '靛蓝' },
  '柿红': { energy: 1.28, value: 1.30, label: '柿红' },
  '苔绿': { energy: 1.02, value: 1.12, label: '苔绿' },
  '米白': { energy: 0.92, value: 1.00, label: '米白' },
  '墨黑': { energy: 1.20, value: 1.18, label: '墨黑' },
};

export const PRIORITY_LABEL = { 1: '高', 2: '中', 3: '低' };

/** 当班状态机。 */
export const SHIFT = {
  IDLE: 'idle',       // 待开工
  RUNNING: 'running', // 在产
  PAUSED: 'paused',   // 暂停
};

export const SHIFT_LABEL = {
  idle: '待开工', running: '在产', paused: '已暂停',
};

/** 班次节奏（排产难度）—— 影响织造推进速率与能耗。 */
export const TEMPO = {
  relaxed: { label: '轻松', rate: 0.72, note: '慢速巡检，利于细密织物' },
  normal:  { label: '标准', rate: 1.0,  note: '常规班次节奏' },
  tight:   { label: '紧排', rate: 1.35, note: '赶工排产，断经风险上升' },
};

/** 机台状态机。 */
export const LOOM_STATE = {
  IDLE: 'idle',     // 待单
  WARP: 'warp',     // 换经（准备）
  RUN: 'run',       // 织造中
  FAULT: 'fault',   // 故障
  STOP: 'stop',     // 停机
};

export const LOOM_STATE_LABEL = {
  idle: '待单', warp: '换经', run: '运行', fault: '故障', stop: '停机',
};

/* ────────────── 校验规则（表单与派单共用） ────────────── */

export const LIMITS = {
  width:  { min: 30, max: 120, unit: 'cm',      name: '幅宽' },
  density:{ min: 20, max: 60,  unit: '根/cm',   name: '经密' },
  picks:  { min: 1,  max: 12,  unit: '匹',      name: '匹数' },
};

/**
 * 校验一张订单的字段。返回 { ok, errors: {field: msg} }。
 * 所有错误文案都指出具体原因，便于用户定位。
 */
export function validateOrderDraft(draft) {
  const errors = {};

  const cloth = String(draft.cloth ?? '').trim();
  if (!cloth) errors.cloth = '必须选择布种';
  else if (!CLOTHS[cloth]) errors.cloth = `未知布种「${cloth}」`;

  const dye = String(draft.dye ?? '').trim();
  if (!dye) errors.dye = '必须选择配色';
  else if (!DYES[dye]) errors.dye = `未知配色「${dye}」`;

  for (const [key, rule] of Object.entries(LIMITS)) {
    const raw = draft[key];
    if (raw === '' || raw === null || raw === undefined) {
      errors[key] = `必须填写${rule.name}`;
      continue;
    }
    const num = Number(raw);
    if (!Number.isFinite(num)) {
      errors[key] = `${rule.name}必须是数字`;
      continue;
    }
    if (!Number.isInteger(num)) {
      errors[key] = `${rule.name}必须是整数`;
      continue;
    }
    if (num < rule.min || num > rule.max) {
      errors[key] = `${rule.name}需在 ${rule.min}–${rule.max} ${rule.unit} 之间，当前 ${num}`;
    }
  }

  const priority = Number(draft.priority);
  if (![1, 2, 3].includes(priority)) errors.priority = '优先级必须是高 / 中 / 低之一';

  return { ok: Object.keys(errors).length === 0, errors };
}

/* ────────────── 工厂 ────────────── */

let orderSeq = 0;

/**
 * 把订单号计数器接续到已有订单之后。
 * 存档恢复后必须调用，否则新订单会与存档中的订单重号。
 */
export function syncOrderSeq(orders = []) {
  for (const o of orders) {
    const n = Number(String(o?.id ?? '').replace(/\D/g, ''));
    if (Number.isFinite(n) && n > orderSeq) orderSeq = n;
  }
  return orderSeq;
}

export function makeOrder(draft, now = Date.now()) {
  orderSeq += 1;
  const cloth = CLOTHS[draft.cloth];
  const dye = DYES[draft.dye];
  const picks = Number(draft.picks);
  const width = Number(draft.width);
  const density = Number(draft.density);
  return {
    id: `O-${String(orderSeq).padStart(4, '0')}`,
    cloth: draft.cloth,
    dye: draft.dye,
    width,
    density,
    picks,
    priority: Number(draft.priority),
    // 匹数 × 幅宽决定总工作量；经密越高越慢
    workload: Math.round(picks * width * (1 + density / 90) * (2 - cloth.speed) * 10),
    state: 'queued',      // queued | assigned | running | done | cancelled
    loomId: null,
    progress: 0,
    createdAt: now,
    startedAt: null,
    finishedAt: null,
  };
}

export function makeLooms() {
  const looms = [];
  for (let i = 0; i < LOOM_COUNT; i += 1) {
    looms.push({
      id: `L-${String(i + 1).padStart(2, '0')}`,
      name: ['一号机', '二号机', '三号机', '四号机', '五号机', '六号机',
             '七号机', '八号机', '九号机', '十号机', '十一号机', '十二号机'][i],
      state: LOOM_STATE.IDLE,
      orderId: null,
      progress: 0,
      // 机台固有属性
      speedFactor: 0.86 + (i % 5) * 0.075,      // 0.86 ~ 1.16
      pickSpeed: 26 + (i % 4) * 5,              // 梭速（梭/分）
      tension: 42 + (i % 6) * 4,                // 当前经线张力
      tensionTarget: 55 + (i % 5) * 3,
      energy: 0,                                // 本班累计能耗 kWh
      breaks: 0,                                // 本班断经次数
      warpRemaining: 0,                         // 换经剩余秒
      warpTotal: 0,
      history: [],                              // 该机事件史（最近 24 条）
      spark: [],                                // 迷你趋势（最近 14 个点）
    });
  }
  return looms;
}

export function initialState() {
  return {
    version: 1,
    createdAt: Date.now(),
    savedAt: Date.now(),
    orders: [],
    looms: makeLooms(),
    log: [],
    eventSeq: 0,
    telemetry: [],          // { t, density, speed, tension, running, breakRate, energy }
    output: 0,              // 本班累计匹数
    meter: 0,               // 累计计数（用于订单号与遥测序列）
    selectedLoomId: null,
    logPaused: false,
    logLevel: 'all',
    chartScale: 'density',
    shift: SHIFT.RUNNING,   // 当班状态：idle 待开工 / running 在产 / paused 暂停
    tempo: 'normal',        // 班次节奏：relaxed 轻松 / normal 标准 / tight 紧排
    autoDispatch: true,     // 机台空出后自动续派队首订单
  };
}

/** 两张示例订单 —— 新开班次 / 演示排产流程用。 */
export function seedOrders(state, now = Date.now()) {
  const a = makeOrder({ cloth: '亚麻', dye: '靛蓝', width: 92, density: 44, picks: 5, priority: 1 }, now);
  const b = makeOrder({ cloth: '桑蚕丝', dye: '柿红', width: 76, density: 38, picks: 3, priority: 2 }, now);
  state.orders.push(a, b);
  return [a, b];
}

/* ────────────── 仿真推进 ────────────── */

const TICK_MS = 900;

/**
 * 推进一个仿真步。
 * @param {object} state 车间状态（原地修改）
 * @param {number} dt    距上一步的毫秒数
 * @param {object} rand  随机源（可注入，便于测试）
 */
export function tick(state, dt, rand = Math.random) {
  const secs = dt / 1000;
  const rate = TEMPO[state.tempo]?.rate ?? 1;
  let running = 0;
  let totalBreaks = 0;
  let totalEnergy = 0;
  let densitySum = 0;
  let speedSum = 0;
  let tensionSum = 0;

  for (const loom of state.loom ?? state.looms) {
    const order = state.orders.find((o) => o.id === loom.orderId);

    switch (loom.state) {
      case LOOM_STATE.WARP: {
        loom.warpRemaining -= secs * rate;
        if (loom.warpRemaining <= 0) {
          loom.state = LOOM_STATE.RUN;
          loom.progress = 0;
          if (order) {
            order.state = 'running';
            order.startedAt = Date.now();
          }
          pushEvent(state, 'done', loom.id, `${loom.id} 换经完成，开始织造`);
        }
        break;
      }

      case LOOM_STATE.RUN: {
        if (!order) { loom.state = LOOM_STATE.IDLE; break; }
        running += 1;

        const cloth = CLOTHS[order.cloth] ?? CLOTHS['苎麻'];
        const dye = DYES[order.dye] ?? DYES['米白'];

        // 进度推进：机台速度 × 布种速度 × 密度惩罚 × 班次节奏
        const densityPenalty = 1 / (1 + (order.density - 20) / 70);
        const perSec = 0.0125 * loom.speedFactor * cloth.speed * densityPenalty;
        loom.progress = Math.min(100, loom.progress + perSec * secs * 100 * rate);
        order.progress = loom.progress;

        // 张力向目标值回归，叠加随机扰动
        const drift = (rand() - 0.5) * 5.5;
        loom.tension += (loom.tensionTarget - loom.tension) * 0.06 * secs + drift * secs * 2.2;
        loom.tension = Math.max(18, Math.min(96, loom.tension));

        // 断经判定：张力过高 + 布种风险
        const tensionRisk = Math.max(0, (loom.tension - 62) / 34);
        const breakChance = (0.0016 * cloth.breakRisk + tensionRisk * 0.0075) * (secs / TICK_MS) * 6;
        if (rand() < breakChance) {
          loom.breaks += 1;
          totalBreaks += 1;
          loom.state = LOOM_STATE.FAULT;
          order.state = 'assigned';
          order.progress = loom.progress;
          pushEvent(state, 'error', loom.id,
            `${loom.id} 断经停机，张力 ${loom.tension.toFixed(0)} —— 需手动复位`, loom);
        } else {
          // 能耗
          const kwh = 0.012 * secs * loom.speedFactor * dye.energy;
          loom.energy += kwh;
          order.energy = (order.energy ?? 0) + kwh;

          if (loom.progress >= 100) {
            order.state = 'done';
            order.finishedAt = Date.now();
            state.output += order.picks;
            loom.state = LOOM_STATE.IDLE;
            loom.orderId = null;
            loom.progress = 0;
            pushEvent(state, 'done', loom.id,
              `${order.id} ${order.cloth}·${order.dye} 完工，产出 ${order.picks} 匹`, loom);
            pushEvent(state, 'info', loom.id, `${loom.id} 转入待单，等待派工`, loom);
          }
        }
        break;
      }

      case LOOM_STATE.FAULT: {
        // 故障机台张力缓慢回落，等待人工复位
        loom.tension += (40 - loom.tension) * 0.02 * secs;
        break;
      }

      default:
        break;
    }

    // 停机机台保持低速空转能耗
    if (loom.state === LOOM_STATE.STOP) {
      loom.energy += 0.0012 * secs;
    }

    if (loom.state === LOOM_STATE.RUN) {
      densitySum += order?.density ?? 0;
      speedSum += loom.pickSpeed * (loom.speedFactor ?? 1);
      tensionSum += loom.tension;
    }
    totalEnergy += loom.energy;
    totalBreaks += loom.breaks;

    // 迷你趋势
    loom.spark.push(loom.state === LOOM_STATE.RUN ? loom.progress : 0);
    if (loom.spark.length > 14) loom.spark.shift();
  }

  // 遥测采样
  state.meter += 1;
  const runningCount = state.looms.filter((l) => l.state === LOOM_STATE.RUN).length;
  state.telemetry.push({
    t: state.meter,
    density: runningCount ? densitySum / runningCount : 0,
    speed: runningCount ? speedSum / runningCount : 0,
    tension: runningCount ? tensionSum / runningCount : 0,
    running: runningCount,
    breakRate: totalBreaks,
    energy: totalEnergy,
    output: state.output,
  });
  if (state.telemetry.length > TELEMETRY_POINTS) state.telemetry.shift();
}

/* ────────────── 事件日志 ────────────── */

export function pushEvent(state, level, source, message, loom = null) {
  state.eventSeq = (state.eventSeq ?? 0) + 1;
  const entry = {
    id: `e${state.eventSeq}`,
    at: Date.now(),
    level,
    source,
    message,
  };
  state.log.push(entry);
  if (state.log.length > LOG_LIMIT) state.log.splice(0, state.log.length - LOG_LIMIT);
  if (loom) {
    loom.history.push(entry);
    if (loom.history.length > 24) loom.history.shift();
  }
  return entry;
}

/* ────────────── 派单 / 撤单 ────────────── */

/** 把订单派到指定机台。返回 { ok, error }。 */
export function assignOrder(state, orderId, loomId, { auto = false } = {}) {
  const order = state.orders.find((o) => o.id === orderId);
  const loom = state.looms.find((l) => l.id === loomId);

  if (!order) return { ok: false, error: `订单 ${orderId} 不存在` };
  if (!loom) return { ok: false, error: `机台 ${loomId} 不存在` };
  if (order.state !== 'queued') return { ok: false, error: `订单 ${orderId} 状态为「${orderStateLabel(order.state)}」，不可重复派单` };
  if (loom.state === LOOM_STATE.FAULT) return { ok: false, error: `${loom.id} 处于故障状态，请先复位` };
  if (loom.state === LOOM_STATE.STOP) return { ok: false, error: `${loom.id} 已停机，无法接单` };
  if (loom.orderId) return { ok: false, error: `${loom.id} 已有在制订单` };

  order.state = 'assigned';
  order.loomId = loom.id;
  order.hold = false;
  loom.orderId = order.id;
  loom.state = LOOM_STATE.WARP;
  loom.progress = 0;
  loom.warpTotal = 4 + (order.picks % 3) * 2;
  loom.warpRemaining = loom.warpTotal;

  pushEvent(state, 'info', loom.id,
    auto ? `${order.id} 自动续派至 ${loom.id}，开始换经` : `${order.id} 派往 ${loom.id}，开始换经`,
    loom);
  return { ok: true };
}

/** 当前可接单的机台（待单且无在制订单）。 */
export function freeLooms(state) {
  return state.looms.filter((l) => l.state === LOOM_STATE.IDLE && !l.orderId);
}

/**
 * 批量派工：把队首待排订单依次派到空闲机台。
 * @param {object} state
 * @param {object} opts { limit?:number, auto?:boolean }
 * @returns {{count:number, assigned:{orderId:string,loomId:string}[], reason:string}}
 */
export function dispatchQueued(state, { limit = Infinity, auto = false } = {}) {
  const assigned = [];
  // 自动续派只捡「未挂起」的订单；人工挂起的订单必须主管手动重新派工
  const queue = sortQueue(state.orders).filter((o) => (auto ? !o.hold : true));
  for (const order of queue) {
    if (assigned.length >= limit) break;
    const loom = freeLooms(state)[0];
    if (!loom) break;
    const res = assignOrder(state, order.id, loom.id, { auto });
    if (!res.ok) break;
    assigned.push({ orderId: order.id, loomId: loom.id });
  }
  let reason = '';
  if (!assigned.length) {
    const pending = sortQueue(state.orders);
    reason = !pending.length
      ? '订单簿里没有待排订单'
      : (pending.every((o) => o.hold)
        ? '待排订单都已挂起，需要手动派工'
        : '当前没有空闲机台，无法派工');
  }
  return { count: assigned.length, assigned, reason };
}

/** 撤销某机台的当前订单，订单回到队列。返回 { ok, error }。 */
export function revokeOrder(state, loomId, reason = '主管撤单') {
  const loom = state.looms.find((l) => l.id === loomId);
  if (!loom) return { ok: false, error: `机台 ${loomId} 不存在` };
  if (!loom.orderId) return { ok: false, error: `${loom.id} 当前没有订单` };

  const order = state.orders.find((o) => o.id === loom.orderId);
  if (!order) return { ok: false, error: `${loom.id} 的订单记录已丢失` };
  if (order.state === 'done') return { ok: false, error: `${order.id} 已完工，不可撤销` };

  order.state = 'queued';
  order.loomId = null;
  order.progress = 0;
  order.startedAt = null;
  // 人工撤下的订单挂起，不再被自动续派捡回，需主管手动重新派工
  order.hold = true;
  loom.orderId = null;
  loom.progress = 0;
  loom.state = LOOM_STATE.IDLE;

  pushEvent(state, 'warn', loom.id, `${order.id} 撤单（${reason}），退回队列并挂起`, loom);
  return { ok: true };
}

/** 复位故障机台。 */
export function resetLoom(state, loomId) {
  const loom = state.looms.find((l) => l.id === loomId);
  if (!loom) return { ok: false, error: `机台 ${loomId} 不存在` };
  if (loom.state !== LOOM_STATE.FAULT) return { ok: false, error: `${loom.id} 未处于故障状态` };

  loom.state = loom.orderId ? LOOM_STATE.WARP : LOOM_STATE.IDLE;
  loom.warpRemaining = loom.orderId ? 5 : 0;
  loom.tension = 45;
  pushEvent(state, 'done', loom.id, `${loom.id} 故障复位，张力已卸载`, loom);
  return { ok: true };
}

/** 停机 / 开机。 */
export function toggleLoomPower(state, loomId) {
  const loom = state.looms.find((l) => l.id === loomId);
  if (!loom) return { ok: false, error: `机台 ${loomId} 不存在` };
  if (loom.state === LOOM_STATE.FAULT) return { ok: false, error: `${loom.id} 处于故障状态，请先复位` };
  if (loom.state === LOOM_STATE.STOP) {
    loom.state = loom.orderId ? LOOM_STATE.WARP : LOOM_STATE.IDLE;
    loom.warpRemaining = loom.orderId ? 5 : 0;
    pushEvent(state, 'done', loom.id, `${loom.id} 重新开机`, loom);
    return { ok: true, message: `${loom.id} 已开机` };
  }
  loom.state = LOOM_STATE.STOP;
  pushEvent(state, 'warn', loom.id, `${loom.id} 主管停机`, loom);
  return { ok: true, message: `${loom.id} 已停机` };
}

export function orderStateLabel(state) {
  return { queued: '排队中', assigned: '已派往', running: '生产中', done: '已完工', cancelled: '已撤销' }[state] ?? state;
}

/** 队列排序：优先级高者优先，同级按创建顺序。 */
export function sortQueue(orders) {
  return orders
    .filter((o) => o.state === 'queued')
    .sort((a, b) => (a.priority - b.priority) || (a.createdAt - b.createdAt));
}

/** 调整排队订单的优先级。 */
export function changePriority(state, orderId, delta) {
  const order = state.orders.find((o) => o.id === orderId);
  if (!order) return { ok: false, error: `订单 ${orderId} 不存在` };
  if (order.state !== 'queued') return { ok: false, error: `订单 ${orderId} 不在队列中` };
  const next = Math.min(3, Math.max(1, order.priority + delta));
  if (next === order.priority) {
    return { ok: false, error: next === 1 ? '已经是最高优先级' : '已经是最低优先级' };
  }
  order.priority = next;
  pushEvent(state, 'info', '主管', `${order.id} 优先级调整为「${PRIORITY_LABEL[next]}」`);
  return { ok: true, message: `${order.id} → ${PRIORITY_LABEL[next]}` };
}
