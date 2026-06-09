# Migration Guide

This guide helps developers replace existing event-handling patterns with **typed-event-contract**.

---

## 1. From Node's `EventEmitter`

### Before

```ts
import { EventEmitter } from 'events';

const emitter = new EventEmitter();

emitter.emit('user:login', { userId: '42', name: 'Ada' }); // no type safety
emitter.on('notification', (msg) => console.log(msg));     // payload is `any`
```

### After

```ts
import { createEventBus } from 'typed-event-contract';

type Events = {
  'user:login': { userId: string; name: string };
  'notification': { message: string };
};

const bus = createEventBus<Events>();

bus.emit('user:login', { userId: '42', name: 'Ada' }); // payload is type-checked
bus.on('notification', ({ message }) => console.log(message)); // payload is inferred
```

**Key changes:**

- Import `createEventBus` instead of `EventEmitter`.
- Declare a contract map (`type Events = { ... }`) enumerating all events and payload shapes.
- `emit` and `on` are fully generic and enforce the contract at compile time.
- Use `bus.off()` to remove listeners instead of `emitter.removeListener()`.

---

## 2. From a Custom Typed Event System

If you have a hand-rolled generic event bus:

```ts
class MyBus<T extends Record<string, any>> {
  private listeners = new Map<keyof T, ((p: any) => void)[]>();
  emit<K extends keyof T>(event: K, payload: T[K]) { /* ... */ }
  on<K extends keyof T>(event: K, fn: (p: T[K]) => void) { /* ... */ }
}

export const bus = new MyBus<{ 'a': number }>();
```

Replace it with:

```ts
import { createEventBus } from 'typed-event-contract';
export const bus = createEventBus<{ 'a': number }>();
```

The library handles the internal listener map — delete the custom class entirely.

---

## 3. Removing Listeners

`EventEmitter.removeListener` maps directly to `bus.off()`. Pass the same function reference:

```ts
// Before (EventEmitter)
const handler = (msg: string) => console.log(msg);
emitter.on('notification', handler);
emitter.removeListener('notification', handler);

// After
const handler = (payload: { message: string }) => console.log(payload.message);
bus.on('notification', handler);
bus.off('notification', handler);
```

---

## 4. Updating Test Suites

```ts
import { createEventBus } from 'typed-event-contract';

type Events = { 'foo': { x: number } };
const bus = createEventBus<Events>();

bus.emit('foo', { x: 1 }); // ✅
// @ts-expect-error — wrong payload shape
bus.emit('foo', { y: 2 });
```

---

## 5. Checklist

- [ ] Define a single `type Events` contract per module or app.
- [ ] Replace `new EventEmitter()` with `createEventBus<Events>()`.
- [ ] Replace `emitter.removeListener(event, fn)` with `bus.off(event, fn)`.
- [ ] Update imports to `typed-event-contract`.
- [ ] Run the test suite — all type-level tests should pass.
- [ ] Verify listener execution order and multiple-listener behaviour matches the previous implementation.

---

## FAQ

**Q: Can I use the bus across multiple processes?**

The core bus is in-process only. For cross-process communication use one of the transport adapters (`WebSocketTransport`, `WorkerTransport`, `HttpTransport`) which forward events over a channel while preserving type safety.

**Q: Can I use this in the browser?**

Yes — `createEventBus`, `createNamespacedEventBus`, `LocalTransport`, `WorkerTransport`, and the utils all work in browser environments. `WebSocketTransport` and `HttpTransport` are Node.js-only.
