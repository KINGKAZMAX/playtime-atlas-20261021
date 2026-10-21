/**
 * Tiny synchronous event bus used to decouple gameplay, UI and audio.
 */
export class EventBus {
  constructor() {
    this._map = new Map();
  }

  on(type, handler) {
    if (!this._map.has(type)) this._map.set(type, new Set());
    this._map.get(type).add(handler);
    return () => this.off(type, handler);
  }

  once(type, handler) {
    const off = this.on(type, (payload) => {
      off();
      handler(payload);
    });
    return off;
  }

  off(type, handler) {
    const set = this._map.get(type);
    if (set) set.delete(handler);
  }

  emit(type, payload) {
    const set = this._map.get(type);
    if (!set) return;
    for (const handler of Array.from(set)) {
      try {
        handler(payload);
      } catch (err) {
        console.error(`[EventBus] handler for "${type}" failed`, err);
      }
    }
  }
}
