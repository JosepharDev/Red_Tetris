import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync } from 'fs';

// In ES Modules __dirname doesn't exist — reconstruct it from import.meta.url
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DIST_DIR = join(__dirname, '../../dist/client');

const app = express();

// ── Static file serving ────────────────────────────────────────────────
// Only active when the client has been built (dist/client/ exists).
// In development the client team runs their own dev server (e.g. Vite).
if (existsSync(DIST_DIR)) {
  app.use(express.static(DIST_DIR));
  // SPA catch-all: send index.html for any non-asset URL so client-side
  // routing (React Router etc.) can handle the path.
  // NOTE: Express v5 requires '{*path}' instead of '*'.
  app.get('{*path}', (req, res) => {
    res.sendFile(join(DIST_DIR, 'index.html'));
  });
  console.log(`Serving client from ${DIST_DIR}`);
} else {
  console.log('No dist/client found — static file serving disabled (dev mode).');
}
// ───────────────────────────────────────────────────────────────────────

const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

import Game from './Game.js';
import Player from './Player.js';
import { getLeaderboard, saveScore } from './Leaderboard.js';

const games = new Map();

io.on('connection', (socket) => {
  const { room, playerName } = socket.handshake.query;
  console.log(`Player ${playerName} connected to room ${room}`);

  if (!games.has(room)) {
    games.set(room, new Game(room));
  }

  const game = games.get(room);

  if (game.status !== 'WAITING') {
    socket.emit('game_full');
    socket.disconnect(true);
    return;
  }

  const player = new Player(socket.id, playerName, room);
  game.addPlayer(player);

  socket.join(room);

  // Send current leaderboard when player joins
  socket.emit('leaderboard', getLeaderboard());

  // Broadcast game state
  io.to(room).emit('game_update', game.getState());

  socket.on('start_game', ({ mode } = {}) => {
    if (player.isHost && game.status === 'WAITING') {
      const selectedMode = mode || 'normal';
      game.start(selectedMode);

      // Start gravity escalation if mode includes it
      if (selectedMode.includes('gravity')) {
        game.startSpeedEscalation((speed) => {
          io.to(room).emit('speed_update', speed);
        });
      }

      io.to(room).emit('game_started');
      io.to(room).emit('game_update', game.getState());

      // Send first pieces to all players
      io.to(room).emit('next_pieces', {
        pieces: [game.getPiece(0), game.getPiece(1), game.getPiece(2)]
      });
    }
  });

  socket.on('request_pieces', (currentLength) => {
    if (game.status === 'PLAYING') {
      socket.emit('next_pieces', {
        pieces: [
          game.getPiece(currentLength),
          game.getPiece(currentLength + 1),
          game.getPiece(currentLength + 2)
        ]
      });
    }
  });

  socket.on('rows_cleared', ({ count, softDropCells = 0, hardDropCells = 0 }) => {
    if (game.status === 'PLAYING') {
      const points = Game.calcScore(count, softDropCells, hardDropCells);
      player.score += points;

      if (count > 1) {
        const penaltyCount = count - 1;
        socket.to(room).emit('penalty_lines', penaltyCount);
      }

      player.updateSpectrum(player.board);
      io.to(room).emit('game_update', game.getState());
    }
  });

  socket.on('board_update', (board) => {
    player.board = board;
    player.updateSpectrum(board);
    io.to(room).emit('game_update', game.getState());
  });

  socket.on('game_over', () => {
    player.gameOver = true;
    saveScore(player.name, player.score);

    // Check if game is finished (solo: immediate, multi: when all but 1 are game over)
    const activePlayers = game.players.filter(p => !p.gameOver);
    if ((game.players.length === 1) || (game.players.length > 1 && activePlayers.length <= 1)) {
      game.finish();

      // Save winner score too
      if (activePlayers.length === 1) {
        saveScore(activePlayers[0].name, activePlayers[0].score);
      }

      const finalLeaderboard = getLeaderboard();
      io.to(room).emit('game_finished', { leaderboard: finalLeaderboard });
      io.to(room).emit('leaderboard', finalLeaderboard);
    }

    io.to(room).emit('game_update', game.getState());
  });

  socket.on('restart_game', () => {
    if (player.isHost && game.status === 'FINISHED') {
      game.restart();
      io.to(room).emit('game_restarted');
      io.to(room).emit('game_update', game.getState());
    }
  });

  socket.on('get_leaderboard', () => {
    socket.emit('leaderboard', getLeaderboard());
  });

  socket.on('disconnect', () => {
    console.log(`Player ${playerName} disconnected from room ${room}`);
    game.removePlayer(socket.id);
    if (game.players.length === 0) {
      games.delete(room);
    } else {
      io.to(room).emit('game_update', game.getState());
    }
  });
});

const PORT = process.env.PORT || 3004;

httpServer.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
