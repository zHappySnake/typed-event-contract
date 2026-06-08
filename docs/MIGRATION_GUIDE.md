# Migration Guide

This guide helps developers replace existing event‑handling patterns (Node's `EventEmitter`, custom ad‑hoc typings, or earlier versions of **typed-event-contract**) with the new type‑safe event bus. Follow the steps that match your current codebase.

---

## 1. From Node's `EventEmitter`

### Before (Node built‑in):

```ts
import { EventEmitter } from "events";

interface Events {
  "user:login": { userId: string; name: string };
  "notification": string;
}

const emitter = new EventEmitter();

// Emit – no compile‑time safety.
emitter.emit("user:login", { userId: "42", name: "Ada" });

// Listen – payload type is `any`.
emitter.on("notification", (msg) => console.log(msg));
```

### After (typed‑event‑contract):

```ts
import { createEventBus } from "typed-event-contract/src/core/eventBus";

export type Events = {
  "user:login": { userId: string; name: string };
  "notification": { message: string };
};

const bus = createEventBus<Events>();

// Emit – payload is type‑checked.
bus.emit("user:login", { userId: "42", name: "Ada" });

// Listen – payload type is inferred.
bus.on("notification", ({ message }) => console.log(message));
```

**Key changes**:

* Import `createEventBus` from the library instead of `EventEmitter`.
* Declare a **contract map** (`type Events = {...}`) that enumerates all allowed events and payload shapes.
* Use `bus.emit` and `bus.on` – both are fully generic and enforce the contract at compile‑time.

---

## 2. From a Custom Typed Event System

If you already have a hand‑rolled generic event bus, you probably have something similar to:

```ts
class MyBus<T extends Record<string, any>> {
  private listeners = new Map<keyof T, ((p: any) => void)[]>();
  emit<K extends keyof T>(event: K, payload: T[K]) { /* ... */ }
  on<K extends keyof T>(event: K, fn: (p: T[K]) => void) { /* ... */ }
}

export const bus = new MyBus<{ "a": number }>();
```

You can replace it with a single line:

```ts
import { createEventBus } from "typed-event-contract/src/core/eventBus";
export const bus = createEventBus<YourEvents>();
```

The library already handles the internal listener map, so you can delete the custom class entirely.

---

## 3. From an Older Version of `typed-event-contract`

Earlier releases exposed a slightly different API (`EventBus` class with a constructor). The new API is functional and returns an object that satisfies the same interface.

**Old:**

```ts
import { EventBus } from "typed-event-contract";

const bus = new EventBus<{ "ping": void }>();
```

**New:**

```ts
import { createEventBus } from "typed-event-contract/src/core/eventBus";

const bus = createEventBus<{ "ping": void }>();
```

Only the import path and construction method change – the runtime behavior remains identical.

---

## 4. Updating Test Suites

Replace any usage of the old emitter in unit tests with the new bus. The type‑level tests (`*.type.test.ts`) already cover generic inference; you can add similar checks for your concrete contracts.

```ts
// Example type‑level test using `expect-type`
import { expectType } from "expect-type";
import { createEventBus } from "typed-event-contract/src/core/eventBus";

type Events = { "foo": { x: number } };
const bus = createEventBus<Events>();

// Ensure `emit` only accepts correct payload.
bus.emit("foo", { x: 1 }); // ✅
// @ts-expect-error – wrong payload shape
bus.emit("foo", { y: 2 });
```

---

## 5. Checklist

- [ ] Define a **single** `type Events` contract for each module or the whole app.
- [ ] Replace all `new EventEmitter()` or custom bus instantiations with `createEventBus`.
- [ ] Update imports to `typed-event-contract/src/core/eventBus`.
- [ ] Run the test suite (`npm test`). All type‑level tests should pass.
- [ ] Verify that runtime behavior (listener execution order, multiple listeners) matches the previous implementation.

---

## 6. FAQ

**Q:** *Do I still need to manually remove listeners?*

**A:** The current bus does not expose an `off` method. Listeners are stored in a `Set` and will be garbage‑collected when the closure that captured the listener goes out of scope (e.g., a React component unmounts). If you need explicit removal, you can extend the bus with a tiny wrapper that adds `off`.

**Q:** *Can I use the bus across multiple processes?*

**A:** The core bus is in‑process only. For cross‑process communication you should use one of the transport adapters (`WebSocketTransport`, `WorkerTransport`, etc.) which forward events over a channel while preserving type safety.

---

*— End of Migration Guide—*
