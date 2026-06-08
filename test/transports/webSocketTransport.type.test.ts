import { expect, expectTypeOf, test } from 'vitest';
import { WebSocketTransport } from '../../src/transports/webSocketTransport';

// Dummy WebSocket placeholder – we only need type checking.
const dummyWs: any = { on: () => {}, once: () => {}, send: () => {} };

type Events = {
  msg: string;
  num: { n: number };
};

const transport = new WebSocketTransport<Events>(dummyWs as any);

// `send` enforces correct payload types.
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
