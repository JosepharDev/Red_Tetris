import { readFileSync, writeFileSync, existsSync } from 'fs';

const FILE = './leaderboard.json';

export const getLeaderboard = () => {
  if (!existsSync(FILE)) return [];
  try {
    return JSON.parse(readFileSync(FILE, 'utf8'));
  } catch {
    return [];
  }
};

export const saveScore = (name, score) => {
  if (score <= 0) return;
  const board = getLeaderboard();
  board.push({ name, score, date: new Date().toISOString() });
  board.sort((a, b) => b.score - a.score);
  const top20 = board.slice(0, 20);
  try {
    writeFileSync(FILE, JSON.stringify(top20, null, 2));
  } catch (e) {
    console.error('Failed to save leaderboard:', e.message);
  }
};
