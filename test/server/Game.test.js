import { describe, it, expect } from 'vitest';
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
    expect(p1.board.length).toBe(20); // Ensures board is reset
  });
});
