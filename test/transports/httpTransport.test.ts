import { test, expect, vi } from 'vitest';
import { HttpTransport } from '../../src/transports/httpTransport';

/* eslint-disable @typescript-eslint/no-explicit-any */
test('client sends event to server via HTTPTransport', async () => {
  const serverTransport = new HttpTransport<{ msg: string }>({ listenPort: 0 });

  await new Promise<void>((resolve, reject) => {
    serverTransport.server?.once('listening', resolve);
    serverTransport.server?.once('error', reject);
  });

  const address = serverTransport.server?.address();
  if (!address || typeof address === 'string') {
    throw new Error('Failed to obtain server address');
  }
  const port = (address as any).port;

  const clientTransport = new HttpTransport<{ msg: string }>({ targetUrl: `http://127.0.0.1:${port}/event` });

  const listener = vi.fn();
  serverTransport.on('msg', listener);

  clientTransport.send('msg', 'hello world');

  await new Promise((r) => setTimeout(r, 100));

  expect(listener).toHaveBeenCalledTimes(1);
  expect(listener).toHaveBeenCalledWith('hello world');

  await new Promise<void>((resolve) => {
    serverTransport.server?.close(() => resolve());
  });
});

test('off() removes a listener so it no longer receives events', async () => {
  const serverTransport = new HttpTransport<{ msg: string }>({ listenPort: 0 });

  await new Promise<void>((resolve, reject) => {
    serverTransport.server?.once('listening', resolve);
    serverTransport.server?.once('error', reject);
  });

  const address = serverTransport.server?.address();
  if (!address || typeof address === 'string') {
    throw new Error('Failed to obtain server address');
  }
  const port = (address as any).port;

  const clientTransport = new HttpTransport<{ msg: string }>({ targetUrl: `http://127.0.0.1:${port}/event` });

  const listener = vi.fn();
  serverTransport.on('msg', listener);
  serverTransport.off('msg', listener);

  clientTransport.send('msg', 'should not arrive');

  await new Promise((r) => setTimeout(r, 100));

  expect(listener).not.toHaveBeenCalled();

  await new Promise<void>((resolve) => {
    serverTransport.server?.close(() => resolve());
  });
});
