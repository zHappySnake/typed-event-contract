/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi } from 'vitest';
import { createDebuggableEventBus } from '../../src/utils/debuggableEventBus';
import { connectToReduxDevTools } from '../../src/utils/devtools';

type Events = {
  msg: string;
};

describe('connectToReduxDevTools', () => {
  it('uses Redux DevTools when extension is present', () => {
    // Mock Redux DevTools extension on the global window object.
    const send = vi.fn();
    const devToolsMock = {
      send,
      subscribe: vi.fn(),
    };
    global.window = {
      __REDUX_DEVTOOLS_EXTENSION__: {
        connect: vi.fn().mockReturnValue(devToolsMock),
      },
    } as any;

    const bus = createDebuggableEventBus<Events>();
    connectToReduxDevTools(bus);

    // Emit an event – should forward to the mocked devTools.
    bus.emit('msg', 'hello');
    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith('msg', 'hello');
  });

  it('falls back to console.log when extension missing', () => {
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    // Ensure window has no devtools extension.
    global.window = {} as any;

    const bus = createDebuggableEventBus<Events>();
    connectToReduxDevTools(bus);
    bus.emit('msg', 'test');

    expect(logSpy).toHaveBeenCalledWith('[ReduxDevTools]', 'msg', 'test');
    logSpy.mockRestore();
  });
});