import { describe, it, expect, vi } from 'vitest';
import { createEventBus } from '../../src/core/eventBus';

type Events = {
  'test:event': { x: number };
  'test:msg': string;
};

describe('EventBus runtime behaviour', () => {
  it('calls listener with correct payload', () => {
    const bus = createEventBus<Events>();
    const listener = vi.fn();
    bus.on('test:event', listener);
    bus.emit('test:event', { x: 42 });
    expect(listener).toHaveBeenCalledOnce();
    expect(listener).toHaveBeenCalledWith({ x: 42 });
  });

  it('supports multiple listeners for the same event', () => {
    const bus = createEventBus<Events>();
    const l1 = vi.fn();
    const l2 = vi.fn();
    bus.on('test:msg', l1);
    bus.on('test:msg', l2);
    bus.emit('test:msg', 'hello');
    expect(l1).toHaveBeenCalledWith('hello');
    expect(l2).toHaveBeenCalledWith('hello');
  });

  it('does not invoke listeners for other events', () => {
    const bus = createEventBus<Events>();
    const listener = vi.fn();
    bus.on('test:event', listener);
    // Emit a different event – using `as any` to bypass the type system for test.
    (bus as any).emit('test:msg', 'ignored');
    expect(listener).not.toHaveBeenCalled();
  });
});
