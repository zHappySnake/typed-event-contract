/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi } from 'vitest';
import { WorkerTransport } from '../../src/transports/workerTransport';
import { EventEmitter } from 'events';

/** Simple MessagePort‑like mock using Node's EventEmitter */
class MockPort extends EventEmitter {
  /** The port on the opposite side of the communication channel */
  other?: MockPort;

  /** Simulate MessagePort.postMessage – forward to the other port. */
  postMessage(data: any) {
    if (this.other) {
      // Emit a "message" event on the counterpart, mimicking a worker sending a
      // message to its peer.
      this.other.emit('message', data);
    }
  }
}

type Events = {
  msg: string;
  num: { n: number };
};

describe('WorkerTransport', () =>
  {
  it('sends and receives messages between two ports', () => {
    const portA = new MockPort();
    const portB = new MockPort();
    // Connect the ports.
    portA.other = portB;
    portB.other = portA;

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
