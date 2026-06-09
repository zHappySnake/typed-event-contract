import { test, expect, vi } from 'vitest';
import { HttpTransport } from '../../src/transports/httpTransport';

/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Verify that a client HttpTransport can POST an event to a server HttpTransport
 * and that the server's listener receives the correct payload.
 */
test('client sends event to server via HTTPTransport', async () => {
  // Start a server transport on a random port (0).
  const serverTransport = new HttpTransport<{ msg: string }>({ listenPort: 0 });

  // Wait for the HTTP server to start listening.
  await new Promise<void>((resolve, reject) => {
    serverTransport.server?.once('listening', resolve);
    serverTransport.server?.once('error', reject);
  });

  // Determine the actual port assigned by the OS.
  const address = serverTransport.server?.address();
  if (!address || typeof address === 'string') {
    throw new Error('Failed to obtain server address');
  }
  const port = (address as any).port;

  // Build the client transport targeting the server's endpoint.
  const clientTransport = new HttpTransport<{ msg: string }>({ targetUrl: `http://127.0.0.1:${port}/event` });

  const listener = vi.fn();
  serverTransport.on('msg', listener);

  // Send an event from the client.
  clientTransport.send('msg', 'hello world');

  // Give the request a moment to be processed.
  await new Promise((r) => setTimeout(r, 100));

  expect(listener).toHaveBeenCalledTimes(1);
  expect(listener).toHaveBeenCalledWith('hello world');

  // Clean up the server.
  await new Promise<void>((resolve) => {
    serverTransport.server?.close(() => resolve());
  });
});
