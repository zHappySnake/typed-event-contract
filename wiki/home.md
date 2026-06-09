# typed-event-contract

A fully typed, cross-runtime event contract system for TypeScript. Define events once as a type map and get full inference at every emit site and listener — across Node.js, browsers, Web Workers, and edge runtimes.

---

## Pages

- [API Reference](API-Reference)
- [Framework Integrations](Framework-Integrations)
- [Migration Guide](Migration-Guide)

---

## Quick Start

```bash
npm install typed-event-contract
# or
pnpm add typed-event-contract
```

```ts
import { createEventBus } from 'typed-event-contract';

type Events = {
  'user:created': { id: string; email: string };
  'user:deleted': { id: string };
};

const bus = createEventBus<Events>();

bus.on('user:created', (payload) => {
  console.log(payload.id, payload.email); // fully inferred
});

bus.emit('user:created', { id: '1', email: 'a@example.com' });

// Unsubscribe when done
const listener = (payload: { id: string }) => console.log(payload.id);
bus.on('user:deleted', listener);
bus.off('user:deleted', listener);
```

---

## Architecture

```
src/
├── core/         Event bus logic and type definitions. No I/O.
├── transports/   Adapters: local, WebSocket, worker, HTTP.
└── utils/        Opt-in debugging utilities.
```

The three layers are strictly separated. Core does not import from transports; utils do not contain stateful logic. Transport adapters are interchangeable and have no effect on the contract types.

---

## License

GPL-3.0-or-later
