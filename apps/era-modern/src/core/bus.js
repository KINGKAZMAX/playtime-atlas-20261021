/**
 * 极简事件总线 —— 用于设置变更、进度变化、跨模块通知。
 */
export function createBus() {
  const map = new Map();

  function on(event, handler) {
    if (!map.has(event)) map.set(event, new Set());
    map.get(event).add(handler);
    return () => off(event, handler);
  }

  function once(event, handler) {
    const dispose = on(event, (payload) => {
      dispose();
      handler(payload);
    });
    return dispose;
  }

  function off(event, handler) {
    const set = map.get(event);
    if (set) set.delete(handler);
  }

  function emit(event, payload) {
    const set = map.get(event);
    if (!set) return;
    for (const handler of Array.from(set)) {
      try {
        handler(payload);
      } catch (err) {
        console.error(`[bus] handler failed for "${event}"`, err);
      }
    }
  }

  return { on, once, off, emit };
}

export const bus = createBus();
