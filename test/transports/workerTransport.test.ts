import { describe, it, expect, vi } from 'vitest';
import { WorkerTransport } from '../../src/transports/workerTransport';
import { EventEmitter } from 'events';

/** Simple MessagePort‑like mock using Node's EventEmitter */
class MockPort extends EventEmitter {
  postMessage(data: any) {
    // Emitting "message" mimics the behavior of a real MessagePort.
    this.emit('message', data);
  }
}

type Events = {
  msg: string;
  num: { n: number };
};

describe('WorkerTransport', () => {
  it('sends and receives messages between two ports', () => {
    const portA = new MockPort();
    const portB = new MockPort();

    // Wire the ports together – each message emitted on one is forwarded to the other.
    portA.on('message', (msg) => portB.emit('message', msg));
    portB.on('message', (msg) => portA.emit('message', msg));

    const transportA = new WorkerTransport<Events>(portA as any);
    const transportB = new WorkerTransport<Events>(portB as any);

    const aListener = vi.fn();
    const bListener = vi.fn();
    transportA.on('msg', aListener);
    transportB.on('msg', bListener);

    // Send messages in both directions.
    transportA.send('msg', 'from A');
    transportB.send('msg', 'from B');

    // In this mock the dispatch is synchronous, so we can assert immediately.
    expect(aListener).toHaveBeenCalledTimes(1);
    expect(aListener).toHaveBeenCalledWith('from B');
    expect(bListener).toHaveBeenCalledTimes(1);
    expect(bListener).toHaveBeenCalledWith('from A');
  });
});
