// src/core/eventBus.ts
/**
 * Typed event bus implementation for the typed-event-contract library.
 *
 * Provides a strongly typed `emit` / `on` API where the event names and payloads
 * are inferred from a user‑provided event map type.
 *
 * The implementation is intentionally minimal – a simple in‑memory map of
 * listeners. It satisfies the core MVP requirements:
 *   * Full type inference of event names and payloads
 *   * Local (in‑process) event bus
 *   * No external runtime dependencies
 */

/** Generic interface describing the public API of the event bus. */
export interface EventBus<T extends Record<string, any>> {
  /** Emit an event with a payload that matches the contract. */
  emit<E extends keyof T>(event: E, payload: T[E]): void;

  /** Register a listener for a specific event. */
  on<E extends keyof T>(event: E, listener: (payload: T[E]) => void): void;
}

/**
 * Create a new typed event bus.
 *
 * The returned object conforms to {@link EventBus} and stores listeners in a
 * private `Map`. No hidden state leaks outside the closure.
 */
export function createEventBus<T extends Record<string, any>>(): EventBus<T> {
  // Map of event name → set of listener callbacks.
  const listeners = new Map<string, Set<(payload: unknown) => void>>();

  return {
    emit(event, payload) {
      const set = listeners.get(event as string);
      if (set) {
        // Call each listener with the payload. The type is trusted because the
        // `on` method only allows callbacks that accept `T[E]`.
        for (const fn of set) {
          fn(payload);
        }
      }
    },
    on(event, listener) {
      const key = event as string;
      let set = listeners.get(key);
      if (!set) {
        set = new Set();
        listeners.set(key, set);
      }
      // The cast is safe – the listener expects the concrete payload type for
      // the specific event; we store it as a generic function.
      set.add(listener as (payload: unknown) => void);
    },
  };
}
