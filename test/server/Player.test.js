import { describe, it, expect } from 'vitest';
import Player from '../../src/server/Player.js';

describe('Player', () => {
  it('should initialize correctly', () => {
    const p = new Player('id1', 'John', 'room1');
    expect(p.name).toBe('John');
    expect(p.room).toBe('room1');
    expect(p.isHost).toBe(false);
    expect(p.score).toBe(0);
    expect(p.spectrum.length).toBe(10);
    expect(p.board.length).toBe(20);
  });

  it('should update spectrum correctly based on board', () => {
    const p = new Player('id1', 'John', 'room1');
    
    // Add some blocks
    p.board[19][0] = 1;
    p.board[18][0] = 1;
    p.board[19][5] = 2;

    p.updateSpectrum(p.board);

    expect(p.spectrum[0]).toBe(18); // height is 2, so first block is at row 18
    expect(p.spectrum[5]).toBe(19); // height is 1, first block is at row 19
    expect(p.spectrum[1]).toBe(20); // empty column
  });
});
