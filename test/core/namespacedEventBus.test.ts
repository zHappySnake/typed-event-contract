import { expect, vi, test } from 'vitest';
import { createNamespacedEventBus } from '../../src/core/namespacedEventBus';

type Events = {
  'user:created': { id: string };
  'order:placed': { orderId: number };
};

test('exact listener receives events within its namespace', () => {
  const bus = createNamespacedEventBus<Events>('app');
  const exactListener = vi.fn();
  bus.on('user:created', exactListener);
  bus.emit('user:created', { id: 'u1' });
  expect(exactListener).toHaveBeenCalledOnce();
  expect(exactListener).toHaveBeenCalledWith({ id: 'u1' });
});

test('wildcard listener receives matching events', () => {
  const bus = createNamespacedEventBus<Events>('app');
  const wildcardListener = vi.fn();
  bus.on('*:created', wildcardListener);
  bus.emit('user:created', { id: 'u2' });
  expect(wildcardListener).toHaveBeenCalledOnce();
  expect(wildcardListener).toHaveBeenCalledWith({ id: 'u2' });
});

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

test('off() removes an exact listener so it no longer receives events', () => {
  const bus = createNamespacedEventBus<Events>('app');
  const listener = vi.fn();
  bus.on('user:created', listener);
  bus.off('user:created', listener);
  bus.emit('user:created', { id: 'u4' });
  expect(listener).not.toHaveBeenCalled();
});

test('off() removes a wildcard listener so it no longer receives events', () => {
  const bus = createNamespacedEventBus<Events>('app');
  const listener = vi.fn();
  bus.on('*:created', listener);
  bus.off('*:created', listener);
  bus.emit('user:created', { id: 'u5' });
  expect(listener).not.toHaveBeenCalled();
});

test('off() is a no-op when the listener was never registered', () => {
  const bus = createNamespacedEventBus<Events>('app');
  const listener = vi.fn();
  expect(() => bus.off('user:created', listener)).not.toThrow();
});
