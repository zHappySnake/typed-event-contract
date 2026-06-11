import { Transport } from "./transport";

/**
 * Minimal structural interface for anything that looks like a MessagePort.
 * Covers Node.js `worker_threads` MessagePort, browser MessagePort, and
 * plain EventEmitter-style objects used in tests.
 *
 * All three message-registration methods are optional so the constructor
 * can probe at runtime which one is available.
 */
interface MessagePortLike {
  postMessage(data: string): void;
  on?: (event: string, listener: (data: unknown) => void) => void;
  addListener?: (event: string, listener: (data: unknown) => void) => void;
  // Browser MessagePort dispatches MessageEvent objects; the only property
  // we need from them is `data`.
  addEventListener?: (event: string, listener: (event: { data?: unknown }) => void) => void;
}

/**
 * WorkerTransport implements the Transport interface using a MessagePort-like
 * object (e.g. a Web Worker, `worker_threads` parentPort, or any object that
 * provides `postMessage` and an event listener for `'message'`).
 *
 * Payloads are serialized as JSON strings containing an `event` name and a
 * `payload`. Incoming messages are parsed and dispatched to registered listeners.
 */
export class WorkerTransport<T extends Record<string, unknown>> implements Transport<T> {
  /** Underlying communication channel. */
  private readonly port: MessagePortLike;
  /** Local listeners mapped by event name. */
  private readonly listeners: Map<string, Set<(payload: unknown) => void>> = new Map();

  constructor(port: MessagePortLike) {
    this.port = port;

    // Register a handler for incoming messages. The port may expose either
    // an `on` / `addListener` API (Node EventEmitter style) or an
    // `addEventListener` API (browser style). We probe at runtime.
    const register = (handler: (msg: unknown) => void): void => {
      if (typeof this.port.on === "function") {
        this.port.on("message", handler);
      } else if (typeof this.port.addEventListener === "function") {
        this.port.addEventListener("message", (e) => handler(e.data ?? e));
      } else if (typeof this.port.addListener === "function") {
        this.port.addListener("message", handler);
      } else if (this.port.on) {
        (this.port.on as (event: string, listener: (data: unknown) => void) => void)("message", handler);
      }
    };

    register((incoming: unknown) => {
      // Browser MessagePort wraps the raw value in a MessageEvent-like
      // object with a `data` property; plain EventEmitter ports emit the
      // raw value directly.
      let raw: unknown = incoming;
      if (incoming !== null && typeof incoming === "object" && "data" in incoming) {
        raw = (incoming as { data: unknown }).data;
      }
      try {
        const msg = (typeof raw === "string" ? JSON.parse(raw) : raw) as {
          event: string;
          payload: unknown;
        };
        const set = this.listeners.get(msg.event);
        if (set) {
          for (const fn of set) {
            fn(msg.payload);
          }
        }
      } catch {
        // Invalid JSON - ignore silently as per other transports.
      }
    });
  }

  /**
   * Send an event over the worker channel. The data is JSON-stringified with
   * the shape `{ event, payload }`.
   */
  send<E extends keyof T>(event: E, payload: T[E]): void {
    this.port.postMessage(JSON.stringify({ event: event as string, payload }));
  }

  /** Register a listener for a specific event name. */
  on<E extends keyof T>(event: E, listener: (payload: T[E]) => void): void {
    const key = event as string;
    let set = this.listeners.get(key);
    if (!set) {
      set = new Set();
      this.listeners.set(key, set);
    }
    set.add(listener as (payload: unknown) => void);
  }

  /** Remove a previously registered listener for a specific event name. */
  off<E extends keyof T>(event: E, listener: (payload: T[E]) => void): void {
    const set = this.listeners.get(event as string);
    if (set) {
      set.delete(listener as (payload: unknown) => void);
    }
  }
}