import { Transport } from "./transport";

/**
 * LocalTransport forwards events within the same process.
 * It does not involve any I/O and mirrors the behavior of an in-memory event bus.
 */
export class LocalTransport<T extends Record<string, unknown>> implements Transport<T> {
  private listeners: Map<string, Set<(payload: unknown) => void>> = new Map();

  send<E extends keyof T>(event: E, payload: T[E]): void {
    const set = this.listeners.get(event as string);
    if (set) {
      for (const fn of set) {
        fn(payload);
      }
    }
  }

  on<E extends keyof T>(event: E, listener: (payload: T[E]) => void): void {
    const key = event as string;
    let set = this.listeners.get(key);
    if (!set) {
      set = new Set();
      this.listeners.set(key, set);
    }
    set.add(listener as (payload: unknown) => void);
  }

  off<E extends keyof T>(event: E, listener: (payload: T[E]) => void): void {
    const set = this.listeners.get(event as string);
    if (set) {
      set.delete(listener as (payload: unknown) => void);
    }
  }
}