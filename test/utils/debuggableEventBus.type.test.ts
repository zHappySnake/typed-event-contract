import { expect, expectTypeOf, test } from 'vitest';
import { createDebuggableEventBus } from '../../src/utils/debuggableEventBus';

type Events = {
  msg: string;
  count: number;
};

const bus = createDebuggableEventBus<Events>();

// Middleware typing – payload type should be inferred.
bus.use((event, payload, next) => {
  if (event === 'msg') {
    expectTypeOf<string>(payload);
    next(event, payload.toUpperCase());
  } else {
    expectTypeOf<number>(payload);
    next(event, payload + 1);
  }
});

test('type-level compilation only', () => {
  expect(true).toBeTruthy();
});
