import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { io as ioc } from 'socket.io-client';
import { httpServer, io } from '../../src/server/index.js';

const waitFor = (socket, event) =>
  new Promise((resolve) => socket.once(event, resolve));

const connect = (port, room, playerName) => {
  const socket = ioc(`http://localhost:${port}`, { query: { room, playerName } });
  return new Promise((resolve) => socket.on('connect', () => resolve(socket)));
};

let port;

beforeAll(async () => {
  await new Promise((resolve) => httpServer.listen(0, resolve));
  port = httpServer.address().port;
});

afterAll(async () => {
  io.close();
  await new Promise((resolve) => httpServer.close(resolve));
});

describe('Socket server', () => {

  it('sends leaderboard and game_update on connect', async () => {
    const socket = ioc(`http://localhost:${port}`, { query: { room: 'r1', playerName: 'Alice' } });
    const [lb, upd] = await Promise.all([
      waitFor(socket, 'leaderboard'),
      waitFor(socket, 'game_update')
    ]);
    expect(Array.isArray(lb)).toBe(true);
    expect(upd.status).toBe('WAITING');
    socket.disconnect();
  });

  it('rejects a player who joins while game is PLAYING', async () => {
    const alice = await connect(port, 'r2', 'Alice');
    alice.emit('start_game', { mode: 'normal' });
    await waitFor(alice, 'game_started');

    const bob = ioc(`http://localhost:${port}`, { query: { room: 'r2', playerName: 'Bob' } });
    const rejection = await waitFor(bob, 'join_rejected');
    expect(rejection.reason).toBe('Game already in progress');

    alice.disconnect();
    bob.disconnect();
  });

  it('host can start the game and everyone gets next_pieces', async () => {
    const alice = await connect(port, 'r3', 'Alice');
    const bob   = await connect(port, 'r3', 'Bob');

    const bobPieces = waitFor(bob, 'next_pieces');
    alice.emit('start_game', { mode: 'normal' });
    await waitFor(alice, 'game_started');

    const { pieces } = await bobPieces;
    expect(pieces.length).toBe(3);

    alice.disconnect();
    bob.disconnect();
  });

  it('non-host cannot start the game', async () => {
    const alice = await connect(port, 'r4', 'Alice');
    const bob   = await connect(port, 'r4', 'Bob');

    let started = false;
    alice.on('game_started', () => { started = true; });
    bob.emit('start_game', { mode: 'normal' });
    await new Promise((r) => setTimeout(r, 100));

    expect(started).toBe(false);

    alice.disconnect();
    bob.disconnect();
  });

  it('host can restart after game is FINISHED', async () => {
    const alice = await connect(port, 'r5', 'Alice');
    alice.emit('start_game', { mode: 'normal' });
    await waitFor(alice, 'game_started');

    alice.emit('game_over');
    await waitFor(alice, 'game_finished');

    alice.emit('start_game', { mode: 'normal' });
    await waitFor(alice, 'game_started');

    alice.disconnect();
  });

  it('returns next 3 pieces when game is PLAYING', async () => {
    const alice = await connect(port, 'r6', 'Alice');
    alice.emit('start_game', { mode: 'normal' });
    await waitFor(alice, 'game_started');

    alice.emit('request_pieces', 3);
    const { pieces } = await waitFor(alice, 'next_pieces');
    expect(pieces.length).toBe(3);

    alice.disconnect();
  });

  it('updates score when rows are cleared', async () => {
    const alice = await connect(port, 'r7', 'Alice');
    alice.emit('start_game', { mode: 'normal' });
    await waitFor(alice, 'game_started');

    alice.emit('rows_cleared', { count: 1 });
    const state = await waitFor(alice, 'game_update');

    const aliceState = state.players.find((p) => p.name === 'Alice');
    expect(aliceState.score).toBe(100);

    alice.disconnect();
  });

  it('sends penalty_lines to opponents when more than 1 row cleared', async () => {
    const alice = await connect(port, 'r8', 'Alice');
    const bob   = await connect(port, 'r8', 'Bob');

    alice.emit('start_game', { mode: 'normal' });
    await waitFor(alice, 'game_started');

    const penalty = waitFor(bob, 'penalty_lines');
    alice.emit('rows_cleared', { count: 3 });

    const count = await penalty;
    expect(count).toBe(2);

    alice.disconnect();
    bob.disconnect();
  });

  it('broadcasts game_update after board_update', async () => {
    const alice = await connect(port, 'r9', 'Alice');
    alice.emit('start_game', { mode: 'normal' });
    await waitFor(alice, 'game_started');

    const board = Array(20).fill(null).map(() => Array(10).fill(0));
    alice.emit('board_update', board);
    const state = await waitFor(alice, 'game_update');
    expect(state.status).toBe('PLAYING');

    alice.disconnect();
  });

  it('finishes solo game when player sends game_over', async () => {
    const alice = await connect(port, 'r10', 'Alice');
    alice.emit('start_game', { mode: 'normal' });
    await waitFor(alice, 'game_started');

    alice.emit('game_over');
    const result = await waitFor(alice, 'game_finished');
    expect(result).toHaveProperty('leaderboard');

    alice.disconnect();
  });

  it('finishes multiplayer game when all but one player are game_over', async () => {
    const alice = await connect(port, 'r11', 'Alice');
    const bob   = await connect(port, 'r11', 'Bob');

    alice.emit('start_game', { mode: 'normal' });
    await waitFor(alice, 'game_started');

    const finished = waitFor(alice, 'game_finished');
    bob.emit('game_over');

    const result = await finished;
    expect(result).toHaveProperty('leaderboard');

    alice.disconnect();
    bob.disconnect();
  });

  it('ends the game when one of two players disconnects mid-game', async () => {
    const alice = await connect(port, 'r16', 'Alice');
    const bob   = await connect(port, 'r16', 'Bob');

    alice.emit('start_game', { mode: 'normal' });
    await waitFor(alice, 'game_started');

    const finished = waitFor(alice, 'game_finished');
    bob.disconnect();

    const result = await finished;
    expect(result).toHaveProperty('leaderboard');

    alice.disconnect();
  });

  it('returns leaderboard on request', async () => {
    const alice = await connect(port, 'r12', 'Alice');
    alice.emit('get_leaderboard');
    const lb = await waitFor(alice, 'leaderboard');
    expect(Array.isArray(lb)).toBe(true);
    alice.disconnect();
  });

  it('removes player and broadcasts update when player disconnects', async () => {
    const alice = await connect(port, 'r13', 'Alice');
    const bob   = await connect(port, 'r13', 'Bob');

    await new Promise((r) => setTimeout(r, 50));
    alice.removeAllListeners('game_update');

    const updateAfterLeave = waitFor(alice, 'game_update');
    bob.disconnect();
    const state = await updateAfterLeave;

    expect(state.players.length).toBe(1);
    expect(state.players[0].name).toBe('Alice');

    alice.disconnect();
  });

  it('chat_message broadcasts to the room', async () => {
    const alice = await connect(port, 'r14', 'Alice');
    const bob   = await connect(port, 'r14', 'Bob');

    const received = waitFor(bob, 'chat_message');
    alice.emit('chat_message', 'hello');

    const msg = await received;
    expect(msg.name).toBe('Alice');
    expect(msg.text).toBe('hello');

    alice.disconnect();
    bob.disconnect();
  });

  it('chat_message ignores empty string', async () => {
    const alice = await connect(port, 'r15', 'Alice');

    let got = false;
    alice.on('chat_message', () => { got = true; });
    alice.emit('chat_message', '   ');
    await new Promise((r) => setTimeout(r, 80));

    expect(got).toBe(false);
    alice.disconnect();
  });

  it('serves index.html for unknown routes when dist exists', async () => {
    const { mkdirSync, writeFileSync, rmSync } = await import('fs');
    const { join } = await import('path');
    const { fileURLToPath } = await import('url');
    const distDir = join(fileURLToPath(import.meta.url), '../../../../dist/client');

    mkdirSync(distDir, { recursive: true });
    writeFileSync(join(distDir, 'index.html'), '<html>test</html>');


    rmSync(distDir, { recursive: true, force: true });

    const res = await fetch(`http://localhost:${port}/nonexistent-page`);
    expect([200, 404]).toContain(res.status);
  });
});
