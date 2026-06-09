import { Transport } from "./transport";

/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * LocalTransport forwards events within the same process.
 * It does not involve any I/O and mirrors the behavior of an in‑memory event bus.
 */
export class LocalTransport<T extends Record<string, any>> implements Transport<T> {
  private listeners: Map<string, Set<(payload: any) => void>> = new Map();

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
    // Cast is safe because we store the listener with unknown payload type.
    set.add(listener as (payload: any) => void);
  }
}
