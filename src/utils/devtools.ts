/*
 * Typed Event Bus - Redux DevTools integration helper.
 *
 * This utility connects a Typed Event Bus instance to the Redux DevTools
 * extension when it is available in the browser. In non‑browser environments
 * or when the extension is missing, events are logged to the console.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
import { EventBus } from "../core/eventBus";

/**
 * Helper type that adds the devtools registration method to an EventBus.
 */
export type DevToolsConnectable<T extends Record<string, any>> = EventBus<T> & {
  /** Register a devtools handler that receives every emitted event. */
  connectDevTools(handler: (event: keyof T, payload: T[keyof T]) => void): void;
};

/**
 * Connect a Typed Event Bus to the Redux DevTools Extension if present.
 *
 * @param bus Event bus instance to connect. Must provide `connectDevTools`.
 */
export function connectToReduxDevTools<T extends Record<string, any>>(
  bus: DevToolsConnectable<T>
): void {
  // Browser environment check – `window` is undefined in Node.
  if (typeof window === "undefined") {
    // Fallback: log events to the console.
    bus.connectDevTools((event, payload) => {
      console.log("[ReduxDevTools]", event, payload);
    });
    return;
  }

  // Attempt to get the Redux DevTools extension API.
  const ext = (window as any).__REDUX_DEVTOOLS_EXTENSION__;
  if (!ext || typeof ext.connect !== "function") {
    // Extension not available – fallback to console logger.
    bus.connectDevTools((event, payload) => {
      console.log("[ReduxDevTools]", event, payload);
    });
    return;
  }

  // Connect to the extension. Provide a name for identification.
  const devTools: any = ext.connect({ name: "Typed Event Bus" });

  // Forward every event to the devtools.
  bus.connectDevTools((event, payload) => {
    devTools.send(event as string, payload);
  });

  // Optional: listen for messages from the devtools (e.g., time‑travel).
  if (typeof devTools.subscribe === "function") {
    devTools.subscribe((msg: any) => {
      // Basic handling for custom actions dispatched from the devtools UI.
      if (msg && msg.type === "DISPATCH" && msg.payload?.type === "ACTION") {
        const { event, payload } = msg.payload;
        if (event && payload !== undefined) {
          bus.emit(event, payload);
        }
      }
    });
  }
}
