# Examples

The `examples/` directory contains minimal, self‑contained snippets that demonstrate how to use **typed-event-contract** with popular frameworks. These are not meant to be production‑ready projects – they omit build configuration and dependencies for brevity. Feel free to copy the files into a real project and install the required packages (e.g., `react`, `next`, `vite`, `bun`).

## Structure

```
examples/
├─ bun-app/
│  └─ bun-example.ts            # Simple Bun script using the bus
├─ nextjs-app/
│  ├─ components/
│  │  └─ LoginButton.tsx        # React component emitting an event
│  ├─ src/
│  │  └─ context/EventBusContext.tsx  # React context providing a singleton bus
│  └─ pages/_app.tsx            # Next.js entry point wrapping the provider
├─ vite-app/
│  ├─ src/
│  │  ├─ eventBus.ts            # Exported singleton bus
│  │  ├─ components/ThemeToggle.tsx
│  │  └─ main.ts                # Startup script registering listeners
└─ README.md                     # This index
```

Each example shows the same core pattern:

1. **Define a contract** (`type Events = { … }`).
2. **Create a bus** with `createEventBus<Events>()`.
3. **Emit** and **listen** using `bus.emit` / `bus.on`.

You can run the Bun example directly with:
```
$ bun run examples/bun-app/bun-example.ts
```

The Vite and Next.js examples require a proper bundler setup; they are provided for reference only.
