/**
 * src/sim/eventBus.js
 * Minimal pub/sub event bus — no external dependencies.
 */

export function createEventBus() {
  /** @type {Map<string, Set<Function>>} */
  const listeners = new Map();

  function on(event, handler) {
    if (!listeners.has(event)) listeners.set(event, new Set());
    listeners.get(event).add(handler);
    // Returns unsubscribe function
    return () => listeners.get(event)?.delete(handler);
  }

  function emit(event, payload) {
    listeners.get(event)?.forEach((h) => h(payload));
  }

  function off(event, handler) {
    listeners.get(event)?.delete(handler);
  }

  function clear() {
    listeners.clear();
  }

  return { on, emit, off, clear };
}

/** Singleton bus shared across the simulator. */
export const eventBus = createEventBus();
