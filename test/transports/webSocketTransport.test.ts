import { describe, it, expect, vi } from 'vitest';
import { WebSocketTransport } from '../../src/transports/webSocketTransport';
import WebSocket, { WebSocketServer } from 'ws';

type Events = {
  msg: string;
  num: { n: number };
};

describe('WebSocketTransport', () => {
  it('sends and receives messages between client and server', async () => {
    // Start a WebSocket server on a random free port.
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

    // Wait for a client connection and wrap it in a transport.
    const serverTransportPromise = new Promise<WebSocketTransport<Events>>((resolve) => {
      wss.once('connection', (socket) => {
        // `socket` is a ws.WebSocket instance; treat it as any to satisfy the constructor.
        resolve(new WebSocketTransport<Events>(socket as any));
      });
    });

    // Create client transport.
    const clientTransport = await WebSocketTransport.connect<Events>(`ws://localhost:${port}`);
    const serverTransport = await serverTransportPromise;

    // Set up listeners on both sides.
    const clientListener = vi.fn();
    const serverListener = vi.fn();
    clientTransport.on('msg', clientListener);
    serverTransport.on('msg', serverListener);

    // Server sends to client.
    serverTransport.send('msg', 'from server');
    // Client sends to server.
    clientTransport.send('msg', 'from client');

    // Slight delay to allow async message handling.
    await new Promise((r) => setTimeout(r, 10));

    expect(clientListener).toHaveBeenCalledTimes(1);
    expect(clientListener).toHaveBeenCalledWith('from server');
    expect(serverListener).toHaveBeenCalledTimes(1);
    expect(serverListener).toHaveBeenCalledWith('from client');

    // Cleanup sockets.
    ;(clientTransport as any).ws.close();
    ;(serverTransport as any).ws.close();
    wss.close();
  });
});
