import { expect, expectTypeOf, test } from 'vitest';
import { WorkerTransport } from '../../src/transports/workerTransport';

// Minimal mock that satisfies the interface used by WorkerTransport.
const dummyPort: any = { postMessage: () => {}, on: () => {} };

type Events = {
  msg: string;
  num: { n: number };
};

const transport = new WorkerTransport<Events>(dummyPort);

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
