# Framework Integrations

This document provides minimal example snippets showing how to integrate **typed-event-contract** with popular front‑end frameworks. The goal is to demonstrate the API surface without pulling in heavy framework dependencies. All examples are TypeScript and can be copied into a project that already uses the framework.

---

## Next.js (React) Example

Create a React context that provides a typed event bus to any component. This pattern works for both the **App Router** and **Pages Router**.

```tsx
// src/context/EventBusContext.tsx
import React, { createContext, useContext, ReactNode } from "react";
import { createEventBus } from "typed-event-contract/src/core/eventBus";

// Define your contract once – reuse across the app.
export type Events = {
  "user:login": { userId: string; name: string };
  "notification": { message: string };
};

// Create a bus instance that lives for the lifetime of the React tree.
const bus = createEventBus<Events>();

const EventBusContext = createContext(bus);

export const EventBusProvider = ({ children }: { children: ReactNode }) => (
  <EventBusContext.Provider value={bus}>
    {children}
  </EventBusContext.Provider>
);

export const useEventBus = () => useContext(EventBusContext);
```

Then wrap your app in the provider (e.g. `pages/_app.tsx` or `app/layout.tsx`):

```tsx
// pages/_app.tsx (Pages Router)
import type { AppProps } from "next/app";
import { EventBusProvider } from "../src/context/EventBusContext";

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <EventBusProvider>
      <Component {...pageProps} />
    </EventBusProvider>
  );
}
```

Consume the bus inside a component:

```tsx
import { useEffect } from "react";
import { useEventBus } from "../src/context/EventBusContext";

export function LoginButton() {
  const bus = useEventBus();

  const handleLogin = () => {
    // Emit a strongly‑typed event.
    bus.emit("user:login", { userId: "42", name: "Ada" });
  };

  // Listen to notifications.
  useEffect(() => {
    const listener = (payload: { message: string }) =>
      alert(`🔔 ${payload.message}`);
    bus.on("notification", listener);
    return () => {
      // No explicit off API – listeners are garbage‑collected when the component unmounts.
      // In a real app you could add a `off` method to the bus if needed.
    };
  }, [bus]);

  return <button onClick={handleLogin}>Log in</button>;
}
```

---

## Vite (Vanilla + React/Preact) Example

A Vite project can import the bus directly and use it in any module.

```ts
// src/eventBus.ts
import { createEventBus } from "typed-event-contract/src/core/eventBus";

export type Events = {
  "theme:change": { dark: boolean };
  "log": { level: "info" | "error"; msg: string };
};

export const bus = createEventBus<Events>();
```

Use the bus in a module, e.g. a UI component:

```tsx
// src/components/ThemeToggle.tsx
import { bus } from "../eventBus";

export function ThemeToggle() {
  const toggle = () => bus.emit("theme:change", { dark: true });
  return <button onClick={toggle}>Dark mode</button>;
}
```

Add a simple listener somewhere in the startup code:

```ts
// src/main.ts
import { bus } from "./eventBus";

bus.on("theme:change", ({ dark }) => {
  document.body.dataset.theme = dark ? "dark" : "light";
});
```

---

## Bun Example

Bun can run TypeScript files directly (via `bun run`). The same API works without modification.

```ts
// bun-example.ts
import { createEventBus } from "typed-event-contract/src/core/eventBus";

type Events = {
  "ping": void;
  "pong": { latency: number };
};

const bus = createEventBus<Events>();

bus.on("ping", () => {
  // Simulate async work and respond.
  setTimeout(() => bus.emit("pong", { latency: 42 }), 10);
});

bus.on("pong", ({ latency }) => console.log("Pong latency", latency));

// Kick‑off the interaction.
bus.emit("ping", undefined);
```

Run it with:
```
$ bun run bun-example.ts
```

---

## Where to Put the Code

* **Library code** – keep contracts (`type Events = …`) in a shared module (`src/types.ts`).
* **Runtime code** – import `createEventBus` from the core module and expose a singleton for the app.
* **Testing** – the same bus can be instantiated in unit tests without any framework.

These snippets are intentionally minimal; they illustrate the **type‑safe API** without pulling in heavy framework‑specific glue. For production apps you may want to add a small wrapper that provides `off`/`once` helpers, but the core contract stays unchanged.

---

*— End of Framework Integrations—*
