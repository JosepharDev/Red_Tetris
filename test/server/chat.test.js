import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { io as ioc } from 'socket.io-client';

describe('chat_message', () => {
  let httpServer, ioServer, port;

  beforeAll(async () => {
    httpServer = createServer();
    ioServer = new Server(httpServer, { cors: { origin: '*' } });

    ioServer.on('connection', (socket) => {
      const { room, playerName } = socket.handshake.query;
      socket.join(room);
      socket.on('chat_message', (text) => {
        if (typeof text !== 'string' || text.trim() === '') return;
        ioServer.to(room).emit('chat_message', {
          name: playerName,
          text: text.trim().slice(0, 200),
          time: Date.now()
        });
      });
    });

    await new Promise((resolve) => {
      httpServer.listen(0, resolve); // port 0 = random free port
      port = httpServer.address().port;
    });
  });

  afterAll(() => {
    ioServer.close();
    httpServer.close();
  });

  it('broadcasts a message to everyone in the room', async () => {
    const alice = ioc(`http://localhost:${port}`, {
      query: { room: 'room1', playerName: 'Alice' }
    });
    const bob = ioc(`http://localhost:${port}`, {
      query: { room: 'room1', playerName: 'Bob' }
    });

    await Promise.all([
      new Promise((r) => alice.on('connect', r)),
      new Promise((r) => bob.on('connect', r))
    ]);

    const received = await new Promise((resolve) => {
      bob.on('chat_message', resolve);    // Bob waits for a message
      alice.emit('chat_message', 'hello'); // Alice sends one
    });

    expect(received.name).toBe('Alice');
    expect(received.text).toBe('hello');

    alice.disconnect();
    bob.disconnect();
  });

  it('ignores empty messages', async () => {
    const alice = ioc(`http://localhost:${port}`, {
      query: { room: 'room2', playerName: 'Alice' }
    });
    await new Promise((r) => alice.on('connect', r));

    let received = false;
    alice.on('chat_message', () => { received = true; });
    alice.emit('chat_message', '   ');

    await new Promise((r) => setTimeout(r, 100));
    expect(received).toBe(false);

    alice.disconnect();
  });
});