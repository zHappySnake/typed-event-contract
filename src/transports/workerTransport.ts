import { Transport } from "./transport";

/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * WorkerTransport implements the Transport interface using a MessagePort‑like
 * object (e.g. a Web Worker, `worker_threads` parentPort, or any object that
 * provides `postMessage` and an event listener for `'message'`).
 *
 * Payloads are serialized as JSON strings containing an `event` name and a
 * `payload`. Incoming messages are parsed and dispatched to registered listeners.
 */
export class WorkerTransport<T extends Record<string, any>> implements Transport<T> {
  /* eslint-disable @typescript-eslint/no-explicit-any */
/** Underlying communication channel – a MessagePort‑like object */
  private readonly port: any;
  /* eslint-disable @typescript-eslint/no-explicit-any */
/** Local listeners mapped by event name */
  private readonly listeners: Map<string, Set<(payload: any) => void>> = new Map();

  constructor(port: any) {
    this.port = port;
    // Register a handler for incoming messages. The port may expose either
    // an `on(event, listener)` API (Node `EventEmitter` style) or an
    // `addEventListener` API (browser style). We support both.
    const register = (handler: (msg: any) => void) => {
      if (typeof this.port.on === "function") {
        this.port.on("message", handler);
      } else if (typeof this.port.addEventListener === "function") {
        this.port.addEventListener("message", (e: any) => handler(e.data ?? e));
      } else if (typeof this.port.addListener === "function") {
        this.port.addListener("message", handler);
      } else {
        // Fallback: assume the port has an `on` method.
        this.port.on?.("message", handler);
      }
    };

    register((incoming: any) => {
      // When using a browser MessagePort the event object contains `data`.
      // When using a plain EventEmitter the emitted value is the raw data.
      let raw = incoming;
      if (incoming && typeof incoming === "object" && "data" in incoming) {
        raw = (incoming as any).data;
      }
      try {
        const msg = typeof raw === "string" ? JSON.parse(raw) : raw;
        const { event, payload } = msg as { event: string; payload: any };
        const set = this.listeners.get(event);
        if (set) {
          for (const fn of set) {
            fn(payload);
          }
        }
      } catch {
        // Invalid JSON – ignore silently as per other transports.
      }
    });
  }
   
/**
   * Send an event over the worker channel. The data is JSON‑stringified with the
   * shape `{ event, payload }`.
   */
  send<E extends keyof T>(event: E, payload: T[E]): void {
    const msg = JSON.stringify({ event: event as string, payload });
    this.port.postMessage(msg);
  }

  /* eslint-disable @typescript-eslint/no-explicit-any */
/** Register a listener for a specific event name. */
  on<E extends keyof T>(event: E, listener: (payload: T[E]) => void): void {
    const key = event as string;
    let set = this.listeners.get(key);
    if (!set) {
      set = new Set();
      this.listeners.set(key, set);
    }
    // Store the listener as a generic function; type safety is enforced by the
    // public API.
    set.add(listener as (payload: any) => void);
  }
}
