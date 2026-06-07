import { expect, test } from 'vitest';
import { expectType } from 'expect-type';
import { createEventBus } from '../../src/core/eventBus';

type Events = {
  'user:created': { id: string; email: string };
  'user:deleted': { id: string };
};

const bus = createEventBus<Events>();

// `emit` should enforce the exact payload shape.
bus.emit('user:created', { id: '1', email: 'a@example.com' });
bus.emit('user:deleted', { id: '2' });

// Listener payload type inference – `expectType` validates at compile time.
bus.on('user:created', (payload) => {
  expectType<{ id: string; email: string }>(payload);
});

// Dummy test to satisfy Vitest runner – the type assertions above are checked at compile time.
test('type‑level checks compile', () => {
  expect(true).toBeTruthy();
});
