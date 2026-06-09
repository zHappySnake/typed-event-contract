/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi } from 'vitest';
import { WebSocketTransport } from '../../src/transports/webSocketTransport';
import { WebSocketServer } from 'ws';

type Events = {
  msg: string;
  num: { n: number };
};

describe('WebSocketTransport', () => {
  it('sends and receives messages between client and server', async () => {
    const wss = new WebSocketServer({ port: 0 });
    const port = await new Promise<number>((resolve) => {
      wss.on('listening', () => {
        const addr = wss.address();
        if (typeof addr === 'string') {
          resolve(parseInt(addr, 10));
        } else {
          resolve((addr as any).port);
        }
      });
    });

    const serverTransportPromise = new Promise<WebSocketTransport<Events>>((resolve) => {
      wss.once('connection', (socket) => {
        resolve(new WebSocketTransport<Events>(socket as any));
      });
    });

    const clientTransport = await WebSocketTransport.connect<Events>(`ws://localhost:${port}`);
    const serverTransport = await serverTransportPromise;

    const clientListener = vi.fn();
    const serverListener = vi.fn();
    clientTransport.on('msg', clientListener);
    serverTransport.on('msg', serverListener);

    serverTransport.send('msg', 'from server');
    clientTransport.send('msg', 'from client');

    await new Promise((r) => setTimeout(r, 10));

    expect(clientListener).toHaveBeenCalledTimes(1);
    expect(clientListener).toHaveBeenCalledWith('from server');
    expect(serverListener).toHaveBeenCalledTimes(1);
    expect(serverListener).toHaveBeenCalledWith('from client');

    ;(clientTransport as any).ws.close();
    ;(serverTransport as any).ws.close();
    wss.close();
  });

  it('off() removes a listener so it no longer receives events', async () => {
    const wss = new WebSocketServer({ port: 0 });
    const port = await new Promise<number>((resolve) => {
      wss.on('listening', () => {
        const addr = wss.address();
        resolve(typeof addr === 'string' ? parseInt(addr, 10) : (addr as any).port);
      });
    });

    const serverTransportPromise = new Promise<WebSocketTransport<Events>>((resolve) => {
      wss.once('connection', (socket) => {
        resolve(new WebSocketTransport<Events>(socket as any));
      });
    });

    const clientTransport = await WebSocketTransport.connect<Events>(`ws://localhost:${port}`);
    const serverTransport = await serverTransportPromise;

    const listener = vi.fn();
    clientTransport.on('msg', listener);
    clientTransport.off('msg', listener);

    serverTransport.send('msg', 'should not arrive');

    await new Promise((r) => setTimeout(r, 10));

    expect(listener).not.toHaveBeenCalled();

    ;(clientTransport as any).ws.close();
    ;(serverTransport as any).ws.close();
    wss.close();
  });
});
