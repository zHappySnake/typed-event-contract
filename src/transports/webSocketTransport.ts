import { Transport } from "./transport";
import WebSocket from "ws";
import { Buffer } from "buffer";

/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * WebSocketTransport implements the Transport interface using a WebSocket
 * connection for event delivery. Payloads are serialized as JSON strings.
 */
export class WebSocketTransport<T extends Record<string, any>> implements Transport<T> {
  private ws: WebSocket;
  private listeners: Map<string, Set<(payload: any) => void>> = new Map();

  constructor(ws: WebSocket) {
    this.ws = ws;
    // Bind incoming messages to listener dispatch.
    this.ws.on("message", (data: WebSocket.Data) => {
      // ws.Data can be string | Buffer | ArrayBuffer | Buffer[]
      let text: string;
      if (typeof data === "string") {
        text = data;
      } else if (data instanceof Buffer) {
        text = data.toString();
      } else if (Array.isArray(data)) {
        text = Buffer.concat(data as Buffer[]).toString();
      } else {
        // ArrayBuffer or other binary – convert to string
        text = Buffer.from(data as ArrayBuffer).toString();
      }
      try {
        const msg = JSON.parse(text) as { event: string; payload: any };
        const set = this.listeners.get(msg.event);
        if (set) {
          for (const fn of set) {
            fn(msg.payload);
          }
        }
      } catch {
        // Invalid JSON – ignore for now.
      }
    });
  }

  /* eslint-disable @typescript-eslint/no-explicit-any */
/**
   * Create a client connection to a WebSocket server.
   * Resolves when the underlying socket is open.
   */
  static connect<T extends Record<string, any>>(url: string): Promise<WebSocketTransport<T>> {
    return new Promise((resolve, reject) => {
      const ws = new WebSocket(url);
      ws.once("open", () => {
        resolve(new WebSocketTransport<T>(ws));
      });
      ws.once("error", (err: any) => {
        reject(err);
      });
    });
  }

  send<E extends keyof T>(event: E, payload: T[E]): void {
    const msg = JSON.stringify({ event: event as string, payload });
    this.ws.send(msg);
  }

  on<E extends keyof T>(event: E, listener: (payload: T[E]) => void): void {
    const key = event as string;
    let set = this.listeners.get(key);
    if (!set) {
      set = new Set();
      this.listeners.set(key, set);
    }
    set.add(listener as (payload: any) => void);
  }
}
