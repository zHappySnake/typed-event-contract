import { expect, vi, test } from 'vitest';
import { createNamespacedEventBus } from '../../src/core/namespacedEventBus';

type Events = {
  'user:created': { id: string };
  'order:placed': { orderId: number };
};

// Exact listener test
test('exact listener receives events within its namespace', () => {
  const bus = createNamespacedEventBus<Events>('app');
  const exactListener = vi.fn();
  bus.on('user:created', exactListener);
  bus.emit('user:created', { id: 'u1' });
  expect(exactListener).toHaveBeenCalledOnce();
  expect(exactListener).toHaveBeenCalledWith({ id: 'u1' });
});

// Wildcard listener test
test('wildcard listener receives matching events', () => {
  const bus = createNamespacedEventBus<Events>('app');
  const wildcardListener = vi.fn();
  // Pattern to match any event ending with ':created'
  bus.on('*:created', wildcardListener);
  bus.emit('user:created', { id: 'u2' });
  expect(wildcardListener).toHaveBeenCalledOnce();
  expect(wildcardListener).toHaveBeenCalledWith({ id: 'u2' });
});

// Namespace isolation test
test('listeners in a different namespace are not invoked', () => {
  const busA = createNamespacedEventBus<Events>('app');
  const busB = createNamespacedEventBus<Events>('other');
  const listenerA = vi.fn();
  const listenerB = vi.fn();
  busA.on('user:created', listenerA);
  busB.on('user:created', listenerB);
  busA.emit('user:created', { id: 'u3' });
  expect(listenerA).toHaveBeenCalledOnce();
  expect(listenerB).not.toHaveBeenCalled();
});
