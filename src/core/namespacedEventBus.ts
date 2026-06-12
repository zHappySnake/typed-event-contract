/**
 * Namespaced Event Bus with wildcard subscription support.
 *
 * This module provides `createNamespacedEventBus` which builds on the
 * basic `EventBus` implementation but adds:
 *   - Automatic prefixing of all events with a user-provided namespace (unless the event is already prefixed).
 *   - Support for pattern listeners using `*` as a wildcard that matches any
 *     substring (e.g. `user.*` matches `user.created`, `user.deleted`).
 *   - Isolation between different namespaces - listeners registered under one
 *     namespace never receive events from another.
 *
 * The public API matches the existing `EventBus<T>` interface, so existing
 * code can continue to use `createEventBus`. New code can import and use the
 * namespaced version when isolation or pattern matching is required.
 */

import { EventBus } from "./eventBus";

/** Helper: escape RegExp meta-characters in a string. */
function escapeRegExp(str: string): string {
  return str.replace(/[\\^$.*+?()[\]{}|]/g, "\\$&");
}

/** Convert a simple wildcard pattern (using `*`) to a RegExp. */
function patternToRegExp(pattern: string): RegExp {
  const escaped = escapeRegExp(pattern);
  const regexStr = "^" + escaped.replace(/\\\*/g, ".*") + "$";
  return new RegExp(regexStr);
}

/**
 * Create a namespaced event bus.
 *
 * @param namespace A string used to prefix every event name. If an emitted or
 *                  listened-to event already starts with `${namespace}.`, the
 *                  prefix is not added again.
 */
export function createNamespacedEventBus<T extends Record<string, unknown>>(
  namespace: string
): EventBus<T> {
  // Maps for exact event listeners and pattern listeners.
  const exactListeners = new Map<string, Set<(payload: unknown) => void>>();
  const patternListeners = new Map<string, Set<(payload: unknown) => void>>();

  /** Prefix an event with the namespace unless already prefixed. */
  function fullEventName(event: string): string {
    if (namespace && event.startsWith(namespace + ".")) {
      return event;
    }
    return namespace ? `${namespace}.${event}` : event;
  }

  /** Determine if a stored pattern matches a full event name. */
  function patternMatches(pattern: string, fullEvent: string): boolean {
    const re = patternToRegExp(pattern);
    return re.test(fullEvent);
  }

  return {
    emit(event, payload) {
      const full = fullEventName(event as string);
      const exactSet = exactListeners.get(full);
      if (exactSet) {
        for (const fn of exactSet) {
          fn(payload);
        }
      }
      // Pattern listeners.
      for (const [pat, set] of patternListeners.entries()) {
        if (patternMatches(pat, full)) {
          for (const fn of set) {
            fn(payload);
          }
        }
      }
    },
    on(event, listener) {
      const full = fullEventName(event as string);
      if (full.includes("*")) {
        let set = patternListeners.get(full);
        if (!set) {
          set = new Set();
          patternListeners.set(full, set);
        }
        set.add(listener as (payload: unknown) => void);
      } else {
        let set = exactListeners.get(full);
        if (!set) {
          set = new Set();
          exactListeners.set(full, set);
        }
        set.add(listener as (payload: unknown) => void);
      }
    },
    off(event, listener) {
      const full = fullEventName(event as string);
      if (full.includes("*")) {
        patternListeners.get(full)?.delete(listener as (payload: unknown) => void);
      } else {
        exactListeners.get(full)?.delete(listener as (payload: unknown) => void);
      }
    },
  };
}