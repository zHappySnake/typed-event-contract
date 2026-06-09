/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi } from 'vitest';
import { WorkerTransport } from '../../src/transports/workerTransport';
import { EventEmitter } from 'events';

/** Simple MessagePort-like mock using Node's EventEmitter */
class MockPort extends EventEmitter {
  other?: MockPort;

  postMessage(data: any) {
    if (this.other) {
      this.other.emit('message', data);
    }
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
    portA.other = portB;
    portB.other = portA;

    const transportA = new WorkerTransport<Events>(portA as any);
    const transportB = new WorkerTransport<Events>(portB as any);

    const aListener = vi.fn();
    const bListener = vi.fn();
    transportA.on('msg', aListener);
    transportB.on('msg', bListener);

    transportA.send('msg', 'from A');
    transportB.send('msg', 'from B');

    expect(aListener).toHaveBeenCalledTimes(1);
    expect(aListener).toHaveBeenCalledWith('from B');
    expect(bListener).toHaveBeenCalledTimes(1);
    expect(bListener).toHaveBeenCalledWith('from A');
  });

  it('off() removes a listener so it no longer receives events', () => {
    const portA = new MockPort();
    const portB = new MockPort();
    portA.other = portB;
    portB.other = portA;

    const transportA = new WorkerTransport<Events>(portA as any);
    const transportB = new WorkerTransport<Events>(portB as any);

    const listener = vi.fn();
    transportA.on('msg', listener);
    transportA.off('msg', listener);
    transportB.send('msg', 'hello');

    expect(listener).not.toHaveBeenCalled();
  });
});
