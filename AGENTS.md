# AGENTS.md

Operational rules for automated agents and AI contributors working in this repository. Read this before making any changes.

---

## Project Summary

`typed-event-contract` is a fully typed, cross-runtime event contract system for TypeScript. Events are declared once as a type map; the bus enforces that contract at compile time with no code generation, no runtime schema validation, and no framework dependency.

Its correctness depends heavily on type inference integrity. Changes must be conservative and verifiable.

---

## Repository Layout

```
src/
├── core/         Event bus logic and type definitions. No I/O.
├── transports/   Adapters: local, WebSocket, worker, HTTP.
└── utils/        Opt-in debugging utilities.

test/
├── core/         Runtime and type-level tests for core.
├── transports/   Runtime and type-level tests for transports.
└── utils/        Runtime and type-level tests for utils.

benchmarks/       Throughput benchmark (1M events).
wiki/             Markdown source for the project wiki pages.
examples/         Framework integration examples (Next.js, Vite, Bun).
```

### Architecture boundaries (strict)

- `src/core/` — must NOT import from `transports/` or `utils/`
- `src/transports/` — may import from `core/`
- `src/utils/` — must NOT contain stateful logic or side effects

Violating these boundaries requires explicit justification.

---

## Public API

### Core

```ts
import { createEventBus, EventBus } from 'typed-event-contract';

type Events = {
  'user:created': { id: string; email: string };
  'user:deleted': { id: string };
};

const bus = createEventBus<Events>();
bus.emit('user:created', { id: '1', email: 'a@example.com' });
bus.on('user:created', (payload) => { /* payload fully inferred */ });
bus.off('user:created', listener); // removes a specific listener
```

```ts
import { createNamespacedEventBus } from 'typed-event-contract';

// Prefixes all events with 'app.' and supports '*' wildcard patterns.
const bus = createNamespacedEventBus<Events>('app');
bus.on('*:created', (payload) => { /* matches any *.created event */ });
```

### Transports

All transports implement `Transport<T>` with `send`, `on`, and `off`.

| Transport | Runtime | Notes |
|---|---|---|
| `LocalTransport` | Any | In-process, no I/O |
| `WebSocketTransport` | Node.js only | Requires `ws` (dependency) |
| `WorkerTransport` | Node.js + browser | Accepts any MessagePort-like object |
| `HttpTransport` | Node.js only | Uses built-in `http`/`https` |

### Utils

```ts
import { createDebuggableEventBus } from 'typed-event-contract';

const bus = createDebuggableEventBus<Events>();
bus.use((event, payload, next) => { next(event, payload); }); // middleware
bus.enableTracing();
bus.getTrace();   // TraceEntry[]
bus.replay();     // replays trace through middleware chain
bus.connectDevTools(handler);
```

```ts
import { connectToReduxDevTools } from 'typed-event-contract';
connectToReduxDevTools(bus); // connects to Redux DevTools extension if present
```

---

## Key Invariants

- Event names and payload types are always fully inferred — users must never need manual type annotations in normal usage.
- Runtime behaviour must never diverge from type-level guarantees.
- Any change that weakens type safety is a regression.
- Transports must not leak transport-specific types into core.
- Debug utilities must remain opt-in and outside the core execution path.

---

## Making Changes

### Before writing code

- Read `CONTRIBUTING.md` for commit conventions and workflow rules.
- Understand which layer your change belongs to and respect the architecture boundaries above.
- If adding a new transport, model it on `LocalTransport` — implement `send`, `on`, and `off`.

### Testing requirements

Every change must include at least one of:

1. **Runtime test** (`test/**/*.test.ts`) — validates emission and listener behaviour using Vitest.
2. **Type-level test** (`test/**/*.type.test.ts`) — validates inference using `expect-type`.

A feature is only complete when:
- Type inference works without manual annotations
- At least one runtime test exists
- At least one type-level test exists
- No architecture boundaries are violated

### Running the suite

```bash
pnpm test       # Vitest (runtime + type-level)
pnpm build      # tsup — ESM + CJS + .d.ts
pnpm lint       # ESLint
pnpm benchmark  # 1M event throughput benchmark
```

---

## Commit Rules

Follow the conventional commit style from `CONTRIBUTING.md`:

| Prefix | Use for |
|---|---|
| `feat:` | New functionality |
| `fix:` | Bug fixes |
| `refactor:` | Internal restructuring, no behaviour change |
| `test:` | Test additions or changes |
| `docs:` | Documentation updates |
| `chore:` | Tooling or maintenance |
| `perf:` | Performance improvements |

- One logical change per commit.
- Separate implementation, tests, and docs into distinct commits.
- Each commit must leave the repository in a buildable, passing state.
- Do not bundle unrelated changes.

---

## Forbidden Patterns

- `any` in core modules without a comment justifying it
- Implicit global state anywhere
- Framework-specific coupling (React, Next.js, etc.) in `core/` or `transports/`
- Silent breaking changes to public APIs
- Speculative abstractions without a concrete use case
- Commits that mix refactors, features, and docs

---

## Further Reading

- `CONTRIBUTING.md` — workflow, branching, PR guidelines, versioning
- `CHANGELOG.md` — release history
- [Wiki](https://gitlab.com/nwks-public/typed-event-contract/-/wikis/home) — API reference, framework integrations, migration guide
