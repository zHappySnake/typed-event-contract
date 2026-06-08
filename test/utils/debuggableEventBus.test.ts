import { describe, it, expect, vi } from 'vitest';
import { createDebuggableEventBus } from '../../src/utils/debuggableEventBus';

type Events = {
  msg: string;
  num: { n: number };
};

describe('DebuggableEventBus', () => {
  it('records trace when enabled', () => {
    const bus = createDebuggableEventBus<Events>();
    bus.enableTracing();
    bus.emit('msg', 'hello');
    const trace = bus.getTrace();
    expect(trace).toHaveLength(1);
    expect(trace[0].event).toBe('msg');
    expect(trace[0].payload).toBe('hello');
  });

  it('middleware can transform payloads', () => {
    const bus = createDebuggableEventBus<Events>();
    // Upper‑case transformation middleware for "msg" events.
    bus.use((event, payload, next) => {
      if (event === 'msg') {
        // payload is string for this event.
        next(event, (payload as string).toUpperCase());
      } else {
        next(event, payload);
      }
    });
    const listener = vi.fn();
    bus.on('msg', listener);
    bus.emit('msg', 'test');
    expect(listener).toHaveBeenCalledOnce();
    expect(listener).toHaveBeenCalledWith('TEST');
  });

  it('replays recorded events', () => {
    const bus = createDebuggableEventBus<Events>();
    bus.enableTracing();
    bus.emit('msg', 'first');
    bus.emit('msg', 'second');
    const replayListener = vi.fn();
    bus.on('msg', replayListener);
    // Clear previous calls (listener may have been called during tracing; it wasn't attached yet, so it's fine).
    bus.replay();
    expect(replayListener).toHaveBeenCalledTimes(2);
    expect(replayListener.mock.calls[0][0]).toBe('first');
    expect(replayListener.mock.calls[1][0]).toBe('second');
  });

  it('devtools handler receives events', () => {
    const bus = createDebuggableEventBus<Events>();
    const devHandler = vi.fn();
    bus.connectDevTools(devHandler);
    bus.emit('msg', 'hello');
    expect(devHandler).toHaveBeenCalledOnce();
    expect(devHandler).toHaveBeenCalledWith('msg', 'hello');
  });
});
