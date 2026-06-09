# Framework Integrations

Minimal examples showing how to integrate **typed-event-contract** with popular frameworks.

---

## Next.js (React)

Create a React context that provides a typed event bus to any component. Works with both the App Router and Pages Router.

```tsx
// src/context/EventBusContext.tsx
import React, { createContext, useContext, ReactNode } from 'react';
import { createEventBus } from 'typed-event-contract';

export type Events = {
  'user:login': { userId: string; name: string };
  'notification': { message: string };
};

const bus = createEventBus<Events>();
const EventBusContext = createContext(bus);

export const EventBusProvider = ({ children }: { children: ReactNode }) => (
  <EventBusContext.Provider value={bus}>
    {children}
  </EventBusContext.Provider>
);

export const useEventBus = () => useContext(EventBusContext);
```

Wrap your app in the provider:

```tsx
// pages/_app.tsx (Pages Router)
import type { AppProps } from 'next/app';
import { EventBusProvider } from '../src/context/EventBusContext';

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
import { useEffect } from 'react';
import { useEventBus } from '../src/context/EventBusContext';

export function LoginButton() {
  const bus = useEventBus();

  useEffect(() => {
    const listener = (payload: { message: string }) => alert(`🔔 ${payload.message}`);
    bus.on('notification', listener);
    return () => bus.off('notification', listener); // clean up on unmount
  }, [bus]);

  return (
    <button onClick={() => bus.emit('user:login', { userId: '42', name: 'Ada' })}>
      Log in
    </button>
  );
}
```

---

## Vite (Vanilla + React/Preact)

```ts
// src/eventBus.ts
import { createEventBus } from 'typed-event-contract';

export type Events = {
  'theme:change': { dark: boolean };
  'log': { level: 'info' | 'error'; msg: string };
};

export const bus = createEventBus<Events>();
```

```tsx
// src/components/ThemeToggle.tsx
import { bus } from '../eventBus';

export function ThemeToggle() {
  return <button onClick={() => bus.emit('theme:change', { dark: true })}>Dark mode</button>;
}
```

```ts
// src/main.ts
import { bus } from './eventBus';

bus.on('theme:change', ({ dark }) => {
  document.body.dataset.theme = dark ? 'dark' : 'light';
});
```

---

## Bun

Bun runs TypeScript files directly via `bun run`. The same API works without modification.

```ts
import { createEventBus } from 'typed-event-contract';

type Events = {
  'ping': void;
  'pong': { latency: number };
};

const bus = createEventBus<Events>();

bus.on('ping', () => {
  setTimeout(() => bus.emit('pong', { latency: 42 }), 10);
});

bus.on('pong', ({ latency }) => console.log('Pong latency', latency));

bus.emit('ping', undefined);
```

```bash
bun run bun-example.ts
```

---

## Tips

- Keep your `type Events` contract in a shared module (e.g. `src/types.ts`) and import it everywhere.
- Use `bus.off()` in cleanup functions (React `useEffect` return, Vue `onUnmounted`, etc.) to avoid memory leaks.
- The same bus instance can be used in unit tests without any framework setup.
