# API Reference

## Core

### `createEventBus<T>()`

Creates a new typed event bus.

```ts
import { createEventBus } from 'typed-event-contract';

type Events = {
  'user:created': { id: string; email: string };
  'user:deleted': { id: string };
};

const bus = createEventBus<Events>();
```

Returns an `EventBus<T>` with the following methods:

#### `emit<E extends keyof T>(event: E, payload: T[E]): void`

Emits an event. The payload type is enforced at compile time.

```ts
bus.emit('user:created', { id: '1', email: 'a@example.com' }); // ✅
bus.emit('user:created', { id: 1 }); // ❌ TypeScript error
```

#### `on<E extends keyof T>(event: E, listener: (payload: T[E]) => void): void`

Registers a listener for a specific event. The payload type is fully inferred.

```ts
bus.on('user:created', (payload) => {
  payload.id;    // string
  payload.email; // string
});
```

#### `off<E extends keyof T>(event: E, listener: (payload: T[E]) => void): void`

Removes a previously registered listener. Pass the same function reference used in `on`.

```ts
const listener = (payload: { id: string }) => console.log(payload.id);
bus.on('user:deleted', listener);
bus.off('user:deleted', listener);
```

---

### `createNamespacedEventBus<T>(namespace: string)`

Creates an event bus that automatically prefixes all event names with `namespace.` and supports `*` wildcard pattern matching.

```ts
import { createNamespacedEventBus } from 'typed-event-contract';

const bus = createNamespacedEventBus<Events>('app');

// Exact listener — receives 'app.user:created'
bus.on('user:created', (payload) => { /* ... */ });

// Wildcard listener — receives any event matching 'app.*:created'
bus.on('*:created', (payload) => { /* ... */ });

bus.emit('user:created', { id: '1', email: 'a@example.com' });
```

Namespaces are isolated — two buses with different namespaces never share listeners.

---

## Transports

Transports implement the `Transport<T>` interface (`send`, `on`, `off`) and move events across runtime boundaries.

### `LocalTransport<T>`

In-process transport. Mirrors the core event bus but as a class.

```ts
import { LocalTransport } from 'typed-event-contract';

const transport = new LocalTransport<Events>();
transport.on('user:created', (payload) => { /* ... */ });
transport.send('user:created', { id: '1', email: 'a@example.com' });
```

### `WebSocketTransport<T>`

Node.js WebSocket transport using the `ws` package. Payloads are JSON-serialized.

```ts
import { WebSocketTransport } from 'typed-event-contract';

// Client
const transport = await WebSocketTransport.connect<Events>('ws://localhost:3000');
transport.send('user:created', { id: '1', email: 'a@example.com' });

// Server (wrap an accepted ws.WebSocket)
const serverTransport = new WebSocketTransport<Events>(socket);
serverTransport.on('user:created', (payload) => { /* ... */ });
```

> **Node.js only.** Requires the `ws` package (listed as a dependency).

### `WorkerTransport<T>`

MessagePort-compatible transport for Web Workers and Node.js `worker_threads`.

```ts
import { WorkerTransport } from 'typed-event-contract';
import { MessageChannel } from 'worker_threads';

const { port1, port2 } = new MessageChannel();
const transportA = new WorkerTransport<Events>(port1);
const transportB = new WorkerTransport<Events>(port2);

transportA.on('user:created', (payload) => { /* ... */ });
transportB.send('user:created', { id: '1', email: 'a@example.com' });
```

### `HttpTransport<T>`

HTTP/HTTPS transport for Node.js. Can act as a server (receiving events via POST) and/or a client.

```ts
import { HttpTransport } from 'typed-event-contract';

// Server
const server = new HttpTransport<Events>({ listenPort: 3000 });
server.on('user:created', (payload) => { /* ... */ });

// Client
const client = new HttpTransport<Events>({ targetUrl: 'http://localhost:3000/event' });
client.send('user:created', { id: '1', email: 'a@example.com' });
```

> **Node.js only.** Uses built-in `http`/`https` modules.

---

## Utils

### `createDebuggableEventBus<T>()`

Extends the core event bus with middleware, tracing, replay, and DevTools integration. All features are opt-in.

```ts
import { createDebuggableEventBus } from 'typed-event-contract';

const bus = createDebuggableEventBus<Events>();
```

#### `use(middleware)`

Registers a middleware function that intercepts every `emit` call.

```ts
bus.use((event, payload, next) => {
  console.log('emitting', event, payload);
  next(event, payload); // must call next to continue the chain
});
```

> **Note:** `replay()` runs events through the full middleware chain. Ensure middleware is idempotent if you use replay.

#### `enableTracing()` / `disableTracing()` / `getTrace()`

Records every emitted event with a timestamp.

```ts
bus.enableTracing();
bus.emit('user:created', { id: '1', email: 'a@example.com' });
const trace = bus.getTrace();
// [{ event: 'user:created', payload: { ... }, timestamp: 1234567890 }]
```

#### `replay()`

Replays all recorded trace entries in order through the middleware chain and to listeners.

```ts
bus.replay();
```

#### `connectDevTools(handler)`

Registers a handler called after every emission.

```ts
bus.connectDevTools((event, payload) => {
  console.log('[devtools]', event, payload);
});
```

### `connectToReduxDevTools(bus)`

Connects a `DebuggableEventBus` to the Redux DevTools browser extension if present, falling back to `console.log`.

```ts
import { connectToReduxDevTools } from 'typed-event-contract';

const bus = createDebuggableEventBus<Events>();
connectToReduxDevTools(bus);
```
