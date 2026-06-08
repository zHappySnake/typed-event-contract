/**
 * Debuggable Event Bus with optional tracing, replay, middleware, and devtools integration.
 *
 * This builds on top of the core {@link EventBus} implementation, adding:
 *   - Middleware support (`use`)
 *   - Event tracing (`enableTracing`, `disableTracing`, `getTrace`)
 *   - Replay of recorded events (`replay`)
 *   - DevTools handler registration (`connectDevTools`)
 *
 * All additions are optional and preserve the original {@link EventBus} API.
 */

import { EventBus, createEventBus } from "../core/eventBus";

/** Middleware function type. */
export type Middleware<T extends Record<string, any>> = (
  event: keyof T,
  payload: T[keyof T],
  next: (event: keyof T, payload: T[keyof T]) => void
) => void;

/** Extended EventBus interface with debugging capabilities. */
export interface DebuggableEventBus<T extends Record<string, any>> extends EventBus<T> {
  /** Register a middleware function. */
  use(mw: Middleware<T>): void;

  /** Enable event tracing. */
  enableTracing(): void;

  /** Disable event tracing. */
  disableTracing(): void;

  /** Retrieve the recorded trace. */
  getTrace(): Array<{ event: keyof T; payload: T[keyof T]; timestamp: number }>;

  /** Replay all recorded events in order. */
  replay(): void;

  /** Register a devtools handler that receives every emitted event. */
  connectDevTools(handler: (event: keyof T, payload: T[keyof T]) => void): void;
}

/** Factory function to create a DebuggableEventBus. */
export function createDebuggableEventBus<T extends Record<string, any>>():
  DebuggableEventBus<T> {
  const baseBus = createEventBus<T>();

  const middlewares: Middleware<T>[] = [];
  const trace: Array<{ event: keyof T; payload: T[keyof T]; timestamp: number }> = [];
  let tracingEnabled = false;
  const devtoolHandlers: Array<(event: keyof T, payload: T[keyof T]) => void> = [];

  // Internal dispatch that runs middleware chain then finally emits.
  const dispatch = (event: keyof T, payload: T[keyof T]): void => {
    let idx = -1;
    const next = (ev: keyof T, pl: T[keyof T]): void => {
      idx++;
      const mw = middlewares[idx];
      if (mw) {
        mw(ev, pl, next);
      } else {
        // Final emission to the base bus.
        baseBus.emit(ev, pl);
        // Notify devtools after emission.
        devtoolHandlers.forEach((h) => h(ev, pl));
      }
    };
    next(event, payload);
  };

  const bus: DebuggableEventBus<T> = {
    emit(event, payload) {
      if (tracingEnabled) {
        trace.push({ event, payload, timestamp: Date.now() });
      }
      dispatch(event, payload);
    },
    on: baseBus.on.bind(baseBus),
    use(mw) {
      middlewares.push(mw);
    },
    enableTracing() {
      tracingEnabled = true;
    },
    disableTracing() {
      tracingEnabled = false;
    },
    getTrace() {
      // Return a shallow copy for safety.
      return [...trace];
    },
    replay() {
      // Replay a snapshot of the current trace to avoid infinite loops if middleware records events again.
      const snapshot = [...trace];
      snapshot.forEach((record) => {
        dispatch(record.event, record.payload);
      });
    },
    connectDevTools(handler) {
      devtoolHandlers.push(handler);
    },
  };

  return bus;
}
