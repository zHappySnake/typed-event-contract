# PLAN.md

## Project: typed-event-contract

A fully typed, cross-runtime event contract system for TypeScript that enables safe event-driven communication across Node.js, browser, workers, and edge environments without runtime-heavy abstractions or external infrastructure.

---

## 1. Problem Statement

Modern TypeScript applications are increasingly distributed across multiple runtimes and execution environments. Despite this, event systems remain:

- weakly typed or string-based
- duplicated across frontend/backend boundaries
- fragile under refactors
- inconsistent across transports (WebSocket, worker messages, in-memory buses)

Existing solutions typically solve only one slice of the problem:
- local event emitters (Node/EventEmitter-style)
- request/response RPC systems (tRPC-like systems)
- schema validation libraries (runtime-only concern)

None unify *typed events as a portable contract across runtimes* in a minimal, framework-agnostic way.

---

## 2. Vision

Create a system where:

- Events are defined once as a TypeScript contract map
- Emitters and listeners are fully inferred everywhere
- The same contract works across multiple transports
- No code generation is required
- No runtime infrastructure is required
- The system remains lightweight and composable

The core abstraction is:

> A typed event contract is a portable API surface.

---

## 3. Core Concept

### Event Contract Map

```ts
type Events = {
  "user:created": { id: string; email: string };
  "user:deleted": { id: string };
};
````

This single type defines the entire communication surface.

---

### Typed Event Bus

```ts
const bus = createEventBus<Events>();

bus.emit("user:created", { id: "1", email: "a@b.com" });

bus.on("user:deleted", (payload) => {
  payload.id; // fully inferred
});
```

---

### Transport Layer

Same contract works across different runtimes:

* local (in-memory)
* websocket
* worker/postMessage
* custom adapters

```ts
const transport = createTransport<Events>("websocket");
```

The contract is decoupled from transport implementation.

---

## 4. Design Goals

### 4.1 Type-first architecture

The system must derive all runtime behavior from TypeScript types.

### 4.2 Transport-agnostic design

Core logic must not depend on any communication medium.

### 4.3 Zero mandatory runtime dependencies

No required external libraries or infrastructure.

### 4.4 Minimal abstraction overhead

Avoid framework-like complexity.

### 4.5 Composability

Allow users to build higher-level systems on top.

---

## 5. Non-Goals

* No database integration
* No opinionated backend framework
* No enforced schema registry
* No AI or external services
* No heavy runtime serialization framework
* No RPC-only focus (events are first-class, not request/response)

---

## 6. Architecture Overview

### 6.1 Core Layer

Responsible for:

* event contract typing
* event bus logic
* inference guarantees

Located in:

```
src/core/
```

---

### 6.2 Transport Layer

Responsible for:

* moving events across boundaries
* serialization/deserialization
* runtime adapters

Located in:

```
src/transports/
```

Supported initially:

* local in-memory bus
* WebSocket adapter

---

### 6.3 Utility Layer

Responsible for:

* type inference helpers
* internal type transformations
* pure functions

Located in:

```
src/utils/
```

---

## 7. Phased Development Plan

### Phase 1 — Core Event Bus (MVP)

Deliverables:

* Typed event contract system
* Local event bus implementation
* Fully inferred emit/on API
* Basic runtime correctness

Outcome:
A usable in-process event system with strong typing.

---

### Phase 2 — Transport Abstraction

Deliverables:

* Generic transport interface
* WebSocket adapter
* Optional message serialization layer
* Transport-agnostic event routing

Outcome:
Events can move across runtime boundaries.

---

### Phase 3 — Cross-Runtime Support

Deliverables:

* Worker/postMessage adapter
* Optional HTTP bridge adapter
* Namespacing and filtering support

Outcome:
Unified communication model across browser/server/worker systems.
✅ Phase 3 implementation complete (WorkerTransport added).

---

### Phase 4 — Ecosystem Features

Deliverables:

* Debugging utilities (event tracing)
* Replay tools (event history simulation)
* Optional middleware system
* Devtools integration

✅ Phase 4 implementation complete (debugging utilities, replay tools, middleware system, devtools integration).

Outcome:
Developer experience enhancements for real-world usage.

---

### Phase 5 — Adoption Layer

Deliverables:

* Framework integrations (Next.js, Vite, Bun examples)
* Example apps
* Benchmark suite
* Migration guides from EventEmitter and similar systems

Outcome:
Ecosystem readiness and production adoption.

---

## 8. Key Technical Challenges

### 8.1 Type inference preservation

Ensuring event names and payloads remain fully inferred across API boundaries.

### 8.2 Transport serialization consistency

Keeping payloads consistent across environments without leaking transport details into core types.

### 8.3 Avoiding abstraction leakage

Preventing the system from becoming a framework rather than a library.

---

## 9. Success Criteria

The project is successful if:

* Developers can replace ad-hoc event systems with this library
* No manual type annotations are needed in normal usage
* Cross-runtime events remain type-safe
* Library remains lightweight and composable
* Adoption occurs organically in mid-to-large TypeScript projects

---

## 10. Strategic Positioning

This library sits between:

* Event emitters (local-only, untyped)
* RPC systems (request/response focused)
* Messaging frameworks (heavy, infrastructure-dependent)

It introduces a missing abstraction:

> A universal typed event contract layer for distributed TypeScript systems.

---

## 11. Long-Term Direction

If successful, this could evolve into:

* a standard event contract model for TypeScript ecosystems
* a foundation for distributed frontend architectures
* a lightweight alternative to full RPC frameworks in event-heavy systems

However, the core must remain minimal and library-first.

---

## 12. Summary

This project focuses on a narrow but high-impact gap:

> making event-driven systems in TypeScript fully type-safe across runtimes without introducing infrastructure or framework dependency.

Everything else is optional.
