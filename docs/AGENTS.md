# AGENTS.md

This file defines how automated agents and contributors should behave when working in this repository. It is not a tutorial; it is a set of operational rules that ensure correctness, type safety, and architectural consistency.

The project is a fully typed event contract system for TypeScript. Its correctness depends heavily on type inference integrity, so changes must be conservative and verifiable.

---

## 1. Core Objective of the Repository

The system provides a type-safe event contract layer across runtimes (Node.js, browser, workers, edge environments). The key invariant is:

- Event definitions are declared once
- Types propagate automatically to emitters and listeners
- Runtime behavior must never diverge from type-level guarantees

Any change that weakens type safety is considered a regression.

---

## 2. Primary Engineering Principles

### 2.1 Type safety is the product
If a feature cannot be expressed cleanly in TypeScript types, it should not exist in the core.

### 2.2 Runtime is secondary
Runtime code exists only to support type correctness and predictable execution. It must remain minimal.

### 2.3 No hidden magic
Avoid implicit behavior that is not visible from types. If behavior exists, it must be inferable from the API surface.

### 2.4 Composability over specialization
Core abstractions must remain transport-agnostic and reusable.

---

## 3. Architecture Boundaries

These boundaries are strict:

- `src/core/`  
  Contains event system logic and type definitions  
  Must NOT import from `transports/`

- `src/transports/`  
  Contains adapters (WebSocket, local bus, worker bridge)  
  May import from `core/`

- `src/utils/`  
  Pure helper functions only  
  Must NOT contain stateful logic or side effects

Violating these boundaries requires explicit justification and a documented design decision.

---

## 4. Event Contract Model Rules

All events must follow a contract map pattern:

- Keys are string literal event names
- Values are payload types
- No runtime schema is required unless explicitly added as an extension

Example:

```ts
type Events = {
  "user:created": { id: string };
};
````

Rules:

* Event names must remain stable once published
* Payload types must be serializable for cross-runtime usage
* Nested non-serializable types are discouraged in core contracts

---

## 5. Type Inference Requirements

Any API added to the system must satisfy:

* Full inference of event names
* Full inference of payload types in listeners
* No need for manual generics in normal usage

If a user must manually annotate types to make the system work, the design is incomplete.

---

## 6. Testing Requirements

All changes must include at least one of the following:

### 6.1 Runtime tests (Vitest)

* Validate event emission and listener behavior
* Ensure transport adapters behave consistently

### 6.2 Type-level tests

* Use `expect-type` or equivalent
* Ensure incorrect event usage fails compilation

Example requirement:

* Invalid event name must produce a TypeScript error
* Invalid payload must produce a TypeScript error

---

## 7. Change Safety Rules

### 7.1 No silent breaking changes

If a change modifies public APIs:

* It must be explicitly documented
* It must include migration notes

### 7.2 Preserve inference stability

Never refactor types in a way that:

* reduces inference accuracy
* requires additional user annotations
* introduces ambiguity in event mapping

### 7.3 Prefer extension over modification

If adding new functionality:

* extend existing abstractions
* do not modify core behavior unless necessary

---

## 7.4 Commit Practices

The repository history should remain understandable and reviewable.

### Commit Scope

* Make small, focused commits that represent a single logical change.
* Avoid large commits that combine unrelated features, refactors, fixes, and documentation updates.
* Separate implementation, tests, documentation, and cleanup work when they are distinct efforts.

Examples:

Good:

* feat(core): add typed event emitter
* test(core): add emitter inference tests
* docs(api): document event contracts

Bad:

* update everything
* fixes
* massive refactor + new transport + docs

### Commit Quality

Each commit should:

* Build successfully
* Leave the repository in a working state whenever practical
* Include tests for completed functionality
* Have a clear commit message describing intent

Preferred Conventional Commit style:

* feat:
* fix:
* refactor:
* test:
* docs:
* chore:
* perf:

### Development Progression

Changes should be introduced incrementally:

* Establish core abstractions before extensions
* Add tests alongside features
* Introduce transports only after core contracts are stable
* Prefer multiple reviewable commits over a single large change

### Historical Clarity

Commit history should accurately reflect the evolution of the codebase:


* Preserve meaningful intermediate steps
* Do not squash unrelated work together
* Keep refactors separate from behavioral changes
* Keep formatting-only changes separate from functional changes

A contributor should be able to understand why a feature was added by reading the commit history alone.

### Agent Requirements

Agents must:

* Create commits only for completed logical units of work
* Avoid generating artificial commits with no meaningful code changes
* Avoid bundling unrelated modifications into a single commit
* Ensure commit messages clearly describe the change and its purpose

A clean, incremental history is preferred over a minimal number of commits.


## 8. Transport System Rules

Transports are optional adapters.

Requirements:

* Must not leak transport-specific types into core
* Must be swappable without modifying event contracts
* Must not require global state

Supported transport types (initial scope):

* local (in-memory)
* websocket
* worker/postMessage (planned)

---

## 9. Performance Constraints

The system must remain lightweight:

* No heavy runtime dependencies
* No reflection-based type simulation
* No schema compilation step in MVP
* Minimal proxy usage unless strictly necessary

---

## 10. Debugging and Observability

Debug features must be:

* optional
* opt-in
* not part of the core execution path

Logging, tracing, or inspection utilities must live outside `core/`.

---

## 11. Definition of Done (for any feature)

A feature is only complete if:

* Type inference works without manual annotations
* At least one runtime test exists
* At least one type-level test exists
* No architecture boundaries are violated
* No reduction in type safety occurs

---

## 12. Agent Operating Mode

Agents working in this repository must behave deterministically:

* Do not introduce speculative abstractions
* Do not add features without a clear use case in event-driven systems
* Prefer minimal implementations over extensible-but-unused complexity
* If uncertain, choose the simplest implementation that preserves correctness

---

## 13. Forbidden Patterns

The following are not allowed in core modules:

* `any` without justification
* implicit global state
* hidden side effects in type utilities
* framework-specific coupling (React, Next.js, etc.)
* mandatory runtime schema systems in MVP

---

## 14. Evolution Strategy

The project evolves in phases:

1. Core typed event bus (local runtime)
2. Transport abstraction layer
3. Cross-runtime adapters
4. Optional tooling (debugging, inspection, replay)

Each phase must not destabilize previous guarantees.

---

## 15. Summary

This repository exists to prove that:

* distributed event systems can be fully type-safe
* runtime flexibility does not require loss of inference
* TypeScript can model cross-runtime communication cleanly

All contributions must preserve these properties.
