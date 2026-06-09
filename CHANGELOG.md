# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.0] - 2026-06-09

### Added

- `EventBus` interface and `createEventBus` factory with full TypeScript inference for `emit`, `on`, and `off`
- `createNamespacedEventBus` with automatic namespace prefixing and `*` wildcard pattern matching
- `LocalTransport` — in-process transport with no I/O
- `WebSocketTransport` — Node.js WebSocket transport using the `ws` package
- `WorkerTransport` — MessagePort-compatible transport for Web Workers and `worker_threads`
- `HttpTransport` — Node.js HTTP/HTTPS transport (server and client modes)
- `createDebuggableEventBus` — opt-in debugging utilities: middleware, tracing, replay, and DevTools integration
- `connectToReduxDevTools` — Redux DevTools Extension integration helper
- Framework integration examples for Next.js, Vite, and Bun
- Benchmark suite (1M events)
