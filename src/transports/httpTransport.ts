import { Transport } from "./transport";
import * as http from "http";
import * as https from "https";
import { IncomingMessage, ServerResponse } from "http";

/**
 * Options for configuring the HTTP transport.
 *
 * - `listenPort` starts an HTTP server that receives events.
 *   The server listens on the given port (or a random port if `0`).
 * - `listenPath` is the URL path that the server accepts POST requests on.
 *   Defaults to `/event`.
 * - `targetUrl` is the endpoint to which `send` POSTs events.
 *   If omitted, `send` becomes a no‑op.
 */
export interface HttpTransportOptions {
  /** Port for the inbound HTTP server. Omit to disable listening. */
  listenPort?: number;
  /** Request path for inbound events – defaults to `/event`. */
  listenPath?: string;
  /** Full URL of the remote endpoint for outgoing events. */
  targetUrl?: string;
}

/**
 * HTTP transport implementing the `Transport` interface.
 *
 * It can act as a server (receiving events via HTTP POST) and/or a client
 * (sending events to a remote HTTP endpoint). The implementation purposefully
 * avoids external dependencies – it relies only on Node's built‑in `http`/`https`
 * modules.
 */
export class HttpTransport<T extends Record<string, any>> implements Transport<T> {
  /** Map of event listeners keyed by event name. */
  private listeners: Map<string, Set<(payload: any) => void>> = new Map();

  /** Optional HTTP server for inbound events. */
  public server?: http.Server;

  /** The request path the server expects – defaults to `/event`. */
  private readonly listenPath: string;

  /** Remote URL used by `send` to POST events. */
  private readonly targetUrl?: string;

  constructor(opts: HttpTransportOptions = {}) {
    const { listenPort, listenPath = "/event", targetUrl } = opts;
    this.listenPath = listenPath;
    this.targetUrl = targetUrl;

    if (listenPort !== undefined) {
      // Create a simple HTTP server that forwards POST bodies to listeners.
      this.server = http.createServer(this.handleRequest.bind(this));
      // Using `listenPort` of 0 lets the OS pick a free port.
      this.server.listen(listenPort);
    }
  }

  /** Internal handler for inbound HTTP POST requests. */
  private handleRequest(req: IncomingMessage, res: ServerResponse) {
    if (req.method !== "POST" || req.url !== this.listenPath) {
      res.statusCode = 404;
      res.end();
      return;
    }
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
    });
    req.on("end", () => {
      try {
        const msg = JSON.parse(body) as { event: string; payload: any };
        const set = this.listeners.get(msg.event);
        if (set) {
          for (const fn of set) {
            fn(msg.payload);
          }
        }
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify({ status: "ok" }));
      } catch {
        res.statusCode = 400;
        res.end();
      }
    });
  }

  /** Send an event to the configured remote HTTP endpoint. */
  send<E extends keyof T>(event: E, payload: T[E]): void {
    if (!this.targetUrl) {
      // No target – silently ignore. This mirrors other transports that do not
      // enforce a destination.
      return;
    }
    const data = JSON.stringify({ event: event as string, payload });
    const url = new URL(this.targetUrl);
    const isHttps = url.protocol === "https:";
    const lib = isHttps ? https : http;
    const options = {
      method: "POST",
      hostname: url.hostname,
      port: url.port || (isHttps ? 443 : 80),
      path: url.pathname,
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(data),
      },
    } as const;
    const req = lib.request(options, (res) => {
      // Consume the response body to free resources.
      res.on("data", () => {});
    });
    req.on("error", () => {
      // Swallow errors – transports are fire‑and‑forget.
    });
    req.write(data);
    req.end();
  }

  /** Register a listener for a specific event name. */
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
