# typed-event-contract

A fully typed, cross-runtime event contract system for TypeScript. Define events once as a type map and get full inference at every emit site and listener — across Node.js, browsers, Web Workers, and edge runtimes.

---

## Overview

typed-event-contract gives you a single source of truth for your event surface. Event names and payload shapes are declared once as a TypeScript type; the bus enforces that contract at compile time with no code generation, no runtime schema validation, and no framework dependency.

It ships with swappable transport adapters (local in-memory, WebSocket, worker messaging, HTTP) so the same contract works across runtime boundaries without leaking transport details into your application code.

Optional utilities — tracing, replay, middleware, and Redux DevTools integration — are available but entirely opt-in and kept outside the core execution path.

---

## Installation

```
npm install typed-event-contract
pnpm add typed-event-contract
yarn add typed-event-contract
```

---

## Documentation

API reference, usage examples, framework integration guides (Next.js, Vite, Bun), and a migration guide from Node's `EventEmitter` are in the [project Wiki](../../wiki) (WIP).

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

## Development

| Command | Description |
|---|---|
| `pnpm build` | Compile to ESM and CJS with type declarations |
| `pnpm dev` | Watch mode |
| `pnpm test` | Run the Vitest suite (runtime and type-level tests) |
| `pnpm lint` | ESLint |
| `pnpm run benchmark` | Throughput benchmark (1M events) |

---

## License

GPL-3.0-or-later
