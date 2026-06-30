import { describe, it, expect, vi, beforeEach } from 'vitest';


vi.mock('fs', () => ({
  existsSync:    vi.fn(),
  readFileSync:  vi.fn(),
  writeFileSync: vi.fn()
}));

import * as fs from 'fs';
import { getLeaderboard, saveScore } from '../../src/server/Leaderboard.js';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('getLeaderboard', () => {
  it('returns empty array when file does not exist', () => {
    fs.existsSync.mockReturnValue(false);

    const result = getLeaderboard();
    expect(result).toEqual([]);
  });

  it('returns parsed array when file exists', () => {
    const data = [{ name: 'Alice', score: 500, date: '2024-01-01' }];
    fs.existsSync.mockReturnValue(true);
    fs.readFileSync.mockReturnValue(JSON.stringify(data));

    const result = getLeaderboard();
    expect(result).toEqual(data);
  });

  it('returns empty array when file contains invalid JSON', () => {
    fs.existsSync.mockReturnValue(true);
    fs.readFileSync.mockReturnValue('not json {{{{');

    const result = getLeaderboard();
    expect(result).toEqual([]);
  });
});

describe('saveScore', () => {
  it('does nothing when score is 0', () => {
    saveScore('Alice', 0);
    expect(fs.writeFileSync).not.toHaveBeenCalled();
  });

  it('does nothing when score is negative', () => {
    saveScore('Alice', -10);
    expect(fs.writeFileSync).not.toHaveBeenCalled();
  });

  it('saves a valid score to the file', () => {
    fs.existsSync.mockReturnValue(false); // start with empty leaderboard

    saveScore('Bob', 300);

    expect(fs.writeFileSync).toHaveBeenCalledOnce();
    const written = JSON.parse(fs.writeFileSync.mock.calls[0][1]);
    expect(written[0].name).toBe('Bob');
    expect(written[0].score).toBe(300);
  });

  it('sorts scores highest first', () => {
    const existing = [{ name: 'Alice', score: 200, date: '2024-01-01' }];
    fs.existsSync.mockReturnValue(true);
    fs.readFileSync.mockReturnValue(JSON.stringify(existing));

    saveScore('Bob', 500);

    const written = JSON.parse(fs.writeFileSync.mock.calls[0][1]);
    expect(written[0].score).toBe(500); // Bob should be first
    expect(written[1].score).toBe(200);
  });

  it('keeps only top 20 scores', () => {
    // Build a leaderboard already at 20 entries
    const existing = Array.from({ length: 20 }, (_, i) => ({
      name: `Player${i}`,
      score: 1000 - i,
      date: '2024-01-01'
    }));
    fs.existsSync.mockReturnValue(true);
    fs.readFileSync.mockReturnValue(JSON.stringify(existing));

    saveScore('NewPlayer', 50); // low score, should not make the top 20

    const written = JSON.parse(fs.writeFileSync.mock.calls[0][1]);
    expect(written.length).toBe(20);
  });
});
