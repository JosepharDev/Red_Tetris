import { describe, it, expect, vi } from 'vitest';
import Game from '../../src/server/Game.js';
import Player from '../../src/server/Player.js';

describe('Game', () => {
  it('should initialize empty', () => {
    const game = new Game('room1');
    expect(game.name).toBe('room1');
    expect(game.status).toBe('WAITING');
    expect(game.players.length).toBe(0);
  });

  it('should assign first player as host', () => {
    const game = new Game('room1');
    const p1 = new Player('1', 'Alice', 'room1');
    const p2 = new Player('2', 'Bob', 'room1');
    game.addPlayer(p1);
    game.addPlayer(p2);
    expect(p1.isHost).toBe(true);
    expect(p2.isHost).toBe(false);
  });

  it('should reassign host if host leaves', () => {
    const game = new Game('room1');
    const p1 = new Player('1', 'Alice', 'room1');
    const p2 = new Player('2', 'Bob', 'room1');
    game.addPlayer(p1);
    game.addPlayer(p2);
    game.removePlayer('1');
    expect(game.players[0].name).toBe('Bob');
    expect(game.players[0].isHost).toBe(true);
  });

  it('should generate pieces and start game', () => {
    const game = new Game('room1');
    const p1 = new Player('1', 'Alice', 'room1');
    game.addPlayer(p1);
    game.start();
    expect(game.status).toBe('PLAYING');
    expect(game.pieces.length).toBeGreaterThan(0);
    expect(p1.board.length).toBe(20);
  });

  // ── calcScore ──────────────────────────────────────────────────────────────

  it('calcScore returns 0 for 0 lines', () => {
    expect(Game.calcScore(0)).toBe(0);
  });

  it('calcScore returns 100 for 1 line', () => {
    expect(Game.calcScore(1)).toBe(100);
  });

  it('calcScore returns 300 for 2 lines', () => {
    expect(Game.calcScore(2)).toBe(300);
  });

  it('calcScore adds soft and hard drop bonus', () => {
    // 1 line (100) + 5 soft (5) + 3 hard (6) = 111
    expect(Game.calcScore(1, 5, 3)).toBe(111);
  });

  // ── getPiece ───────────────────────────────────────────────────────────────

  it('getPiece auto-expands the array when index is beyond current length', () => {
    const game = new Game('room1');
    game.generatePieces(2);
    const piece = game.getPiece(10);
    expect(piece).toBeDefined();
    expect(game.pieces.length).toBeGreaterThan(10);
  });

  // ── finish ─────────────────────────────────────────────────────────────────

  it('finish sets status to FINISHED and clears the speed timer', () => {
    const game = new Game('room1');
    const cb = vi.fn();
    game.start('gravity');
    game.startSpeedEscalation(cb);
    expect(game.speedTimer).not.toBeNull();

    game.finish();
    expect(game.status).toBe('FINISHED');
    expect(game.speedTimer).toBeNull();
  });

  // ── getState ───────────────────────────────────────────────────────────────

  it('getState returns the correct shape', () => {
    const game = new Game('room1');
    const p1 = new Player('1', 'Alice', 'room1');
    game.addPlayer(p1);

    const state = game.getState();
    expect(state.name).toBe('room1');
    expect(state.status).toBe('WAITING');
    expect(state.players[0].name).toBe('Alice');
    expect(state.players[0].isHost).toBe(true);
  });

  // ── removePlayer — last player ─────────────────────────────────────────────

  it('resets to WAITING when the last player leaves', () => {
    const game = new Game('room1');
    const p1 = new Player('1', 'Alice', 'room1');
    game.addPlayer(p1);
    game.start();
    expect(game.status).toBe('PLAYING');

    game.removePlayer('1');
    expect(game.players.length).toBe(0);
    expect(game.status).toBe('WAITING');
  });
});
