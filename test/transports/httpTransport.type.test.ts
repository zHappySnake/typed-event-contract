import { expectTypeOf, test } from 'vitest';
import { HttpTransport } from '../../src/transports/httpTransport';

// Dummy instance – no network activity needed for compile‑time checks.
const transport = new HttpTransport<{ msg: string; num: { n: number } }>();

// `send` must accept the correct payload types.
transport.send('msg', 'hello');
transport.send('num', { n: 42 });

// Listener payload type inference.
transport.on('msg', (payload) => {
  expectTypeOf<string>(payload);
});
transport.on('num', (payload) => {
  expectTypeOf<{ n: number }>(payload);
});

test('type-level compile checks', () => {
  expect(true).toBeTruthy();
});
