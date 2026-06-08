# typed-event-contract

A fully typed, cross-runtime event contract system for TypeScript that enables safe event-driven communication across Node.js, browser, workers, and edge environments **without runtime-heavy abstractions or external infrastructure**.

---

## Features

**Type-Safe Events**
- Events are defined once as a TypeScript contract map
- Full type inference for event names and payloads
- Catch event mismatches at compile time

**Cross-Runtime**
- Works across Node.js, browser, Web Workers, and worker threads
- Same contract, multiple transports (local, WebSocket, worker messaging)
- No framework dependency or global state

**Lightweight**
- Minimal abstraction overhead
- No code generation required
- No runtime schema validation (unless explicitly added)
- Zero mandatory external dependencies

**Developer Experience**
- Optional debugging utilities (event tracing, replay, middleware)
- Framework integration examples (Next.js, Vite, Bun)
- Migration guides from Node's EventEmitter

---

## Quick Start

### Installation

```bash
npm install typed-event-contract
# or
pnpm add typed-event-contract
# or
yarn add typed-event-contract
```

### Basic Usage

```ts
import { createEventBus } from 'typed-event-contract';

// 1. Define your event contract once
type Events = {
  'user:login': { userId: string; name: string };
  'notification': { message: string };
  'theme:change': { dark: boolean };
};

// 2. Create a typed event bus
const bus = createEventBus<Events>();

// 3. Emit events with full type safety
bus.emit('user:login', { userId: '42', name: 'Ada' });

// 4. Listen to events with inferred types
bus.on('notification', ({ message }) => {
  console.log('[notification]', message);
  // message is inferred as string
});

bus.on('theme:change', ({ dark }) => {
  console.log('Theme:', dark ? 'dark' : 'light');
  // dark is inferred as boolean
});
```

### Compile-Time Safety

```ts
// TypeScript catches these errors:
bus.emit('user:login', { userId: '42' }); // Error: missing 'name'
bus.emit('unknown:event', {}); // Error: event not in contract
bus.on('notification', ({ message, extra }) => {}); // Error: no 'extra' property
```

---

## Transport Layers

The library supports multiple transports out of the box:

### Local (In-Memory)

```ts
import { LocalTransport } from 'typed-event-contract';

const transport = new LocalTransport<Events>();
transport.send('user:login', { userId: '42', name: 'Ada' });
```

### WebSocket

```ts
import { WebSocketTransport } from 'typed-event-contract';

// Server side
const wss = new WebSocket.Server({ port: 8080 });
wss.on('connection', (ws) => {
  const transport = new WebSocketTransport<Events>(ws);
  transport.on('user:login', (payload) => {
    console.log('User logged in:', payload);
  });
});

// Client side
const transport = await WebSocketTransport.connect<Events>('ws://localhost:8080');
transport.send('user:login', { userId: '42', name: 'Ada' });
```

### Worker / postMessage

```ts
import { WorkerTransport } from 'typed-event-contract';

// Main thread
const worker = new Worker('worker.ts');
const transport = new WorkerTransport<Events>(worker);

transport.on('user:login', (payload) => {
  console.log('User logged in from worker:', payload);
});

// Worker thread
import { WorkerTransport } from 'typed-event-contract';
const transport = new WorkerTransport<Events>(self);

transport.send('user:login', { userId: '42', name: 'Ada' });
```

---

## Debugging & Advanced Features

### Event Tracing

```ts
import { createDebuggableEventBus } from 'typed-event-contract';

const bus = createDebuggableEventBus<Events>();

// Enable tracing
bus.enableTracing();

bus.emit('user:login', { userId: '42', name: 'Ada' });
bus.emit('notification', { message: 'Welcome!' });

// Get the trace
const trace = bus.getTrace();
console.log(trace);
// [
//   { event: 'user:login', payload: {...}, timestamp: 1234567890 },
//   { event: 'notification', payload: {...}, timestamp: 1234567892 }
// ]
```

### Middleware

```ts
const bus = createDebuggableEventBus<Events>();

// Add logging middleware
bus.use((event, payload, next) => {
  console.log(`[${event}]`, payload);
  next(event, payload); // Call next to continue
});

// Add permission middleware
bus.use((event, payload, next) => {
  if (event === 'admin:action' && !hasPermission()) {
    console.warn('Blocked unauthorized event');
    return; // Don't call next
  }
  next(event, payload);
});
```

### Replay Events

```ts
const bus = createDebuggableEventBus<Events>();

bus.enableTracing();

// ... emit some events ...

// Replay all recorded events
bus.replay();
```

### DevTools Integration

```ts
const bus = createDebuggableEventBus<Events>();

bus.connectDevTools((event, payload) => {
  // Send to external devtools, analytics, etc.
  console.log('[DevTools]', event, payload);
});
```

---

## Framework Integration Examples

### Next.js (React)

```tsx
// src/context/EventBusContext.tsx
import { createEventBus } from 'typed-event-contract';
import { createContext, useContext, ReactNode } from 'react';

type Events = {
  'user:login': { userId: string };
  'notification': { message: string };
};

const bus = createEventBus<Events>();
const EventBusContext = createContext(bus);

export const EventBusProvider = ({ children }: { children: ReactNode }) => (
  <EventBusContext.Provider value={bus}>{children}</EventBusContext.Provider>
);

export const useEventBus = () => useContext(EventBusContext);
```

Use in a component:

```tsx
import { useEventBus } from '@/context/EventBusContext';
import { useEffect } from 'react';

export function LoginButton() {
  const bus = useEventBus();

  const handleLogin = () => {
    bus.emit('user:login', { userId: '42' });
  };

  useEffect(() => {
    bus.on('notification', ({ message }) => {
      alert(message);
    });
  }, [bus]);

  return <button onClick={handleLogin}>Log in</button>;
}
```

### Vite

```ts
// src/eventBus.ts
import { createEventBus } from 'typed-event-contract';

type Events = {
  'theme:change': { dark: boolean };
  'log': { level: 'info' | 'error'; msg: string };
};

export const bus = createEventBus<Events>();
```

Use in modules:

```ts
import { bus } from './eventBus';

bus.emit('theme:change', { dark: true });

bus.on('log', ({ level, msg }) => {
  console.log(`[${level}]`, msg);
});
```

See [FRAMEWORK_INTEGRATIONS.md](./docs/FRAMEWORK_INTEGRATIONS.md) for more examples.

---

## Migration Guide

### From Node's EventEmitter

**Before:**

```ts
import { EventEmitter } from 'events';

const emitter = new EventEmitter();
emitter.emit('user:login', { userId: '42' }); // No type safety
emitter.on('notification', (msg: any) => console.log(msg)); // any type
```

**After:**

```ts
import { createEventBus } from 'typed-event-contract';

type Events = {
  'user:login': { userId: string };
  'notification': { message: string };
};

const bus = createEventBus<Events>();
bus.emit('user:login', { userId: '42' }); // Type-safe
bus.on('notification', ({ message }) => console.log(message)); // Inferred type
```

See [MIGRATION_GUIDE.md](./docs/MIGRATION_GUIDE.md) for more examples.

---

## Documentation

- [PLAN.md](./docs/PLAN.md) — Project vision, architecture, and development roadmap
- [FRAMEWORK_INTEGRATIONS.md](./docs/FRAMEWORK_INTEGRATIONS.md) — Examples for Next.js, Vite, Bun
- [MIGRATION_GUIDE.md](./docs/MIGRATION_GUIDE.md) — Migrating from EventEmitter or other systems
- [AGENTS.md](./docs/AGENTS.md) — Guidelines for contributors and automated systems

---

## Development

### Build

```bash
pnpm build
```

### Watch mode

```bash
pnpm dev
```

### Tests

```bash
pnpm test
```

### Lint

```bash
pnpm lint
```

### Benchmarks

```bash
pnpm run benchmark
```

---

## Architecture

```
src/
├── core/              # Event bus logic and type definitions
│   └── eventBus.ts
├── transports/        # Transport adapters
│   ├── transport.ts
│   ├── localTransport.ts
│   ├── webSocketTransport.ts
│   └── workerTransport.ts
└── utils/             # Utilities and debugging
    └── debuggableEventBus.ts

test/                  # Test suites
examples/              # Framework integration examples
```

---

## Philosophy

This library is built on a few core principles:

1. **Type-first** — Types drive behavior; runtime is secondary
2. **Minimal** — No framework complexity; stays library-sized
3. **Composable** — Build higher-level abstractions on top
4. **Portable** — Same contract across any transport or runtime
5. **Zero hidden magic** — Behavior is inferable from types

See [AGENTS.md](./docs/AGENTS.md) for more on design philosophy.

---

## License

GPL-3.0-or-later

---

## Contributing

This project welcomes contributions! Before opening a PR, please:

1. Ensure type safety is preserved (no regressions)
2. Add tests for new features
3. Follow the guidelines in [AGENTS.md](./docs/AGENTS.md)
4. Keep commits small and focused

---

## Roadmap

- [x] Phase 1: Core event bus
- [x] Phase 2: Transport abstraction
- [x] Phase 3: Cross-runtime support (workers)
- [x] Phase 4: Debugging utilities
- [x] Phase 5: Framework integrations & migration guides
- [ ] Future: Namespacing, filtering, HTTP bridge

See [PLAN.md](./docs/PLAN.md) for details.
