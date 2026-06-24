import Piece from './Piece.js';

// Classic Nintendo scoring: points per lines cleared at level 1
const LINE_POINTS = [0, 100, 300, 500, 800];

class Game {
  constructor(name) {
    this.name = name;
    this.players = [];
    this.status = 'WAITING'; // WAITING, PLAYING, FINISHED
    this.pieces = [];
    this.mode = 'normal';    // 'normal' | 'invisible' | 'gravity' | 'invisible+gravity'
    this.speedTimer = null;
    this.currentSpeed = 1000; // ms per drop
  }

  addPlayer(player) {
    if (this.players.length === 0) {
      player.isHost = true;
    }
    this.players.push(player);
  }

  removePlayer(playerId) {
    this.players = this.players.filter(p => p.id !== playerId);
    if (this.players.length > 0 && !this.players.some(p => p.isHost)) {
      this.players[0].isHost = true;
    }
    if (this.players.length === 0) {
      this.status = 'WAITING';
      this._clearSpeedTimer();
    }
  }

  generatePieces(count = 10) {
    for (let i = 0; i < count; i++) {
      this.pieces.push(new Piece());
    }
  }

  getPiece(index) {
    while (this.pieces.length <= index) {
      this.pieces.push(new Piece());
    }
    return this.pieces[index];
  }

  /** Calculate score for lines cleared + drop bonus */
  static calcScore(linesCleared, softDropCells = 0, hardDropCells = 0) {
    return (LINE_POINTS[linesCleared] || 0) + softDropCells + hardDropCells * 2;
  }

  start(mode = 'normal') {
    this.status = 'PLAYING';
    this.mode = mode;
    this.pieces = [];
    this.currentSpeed = 1000;
    this.generatePieces(10);
    this.players.forEach(p => {
      p.board = Array(20).fill().map(() => Array(10).fill(0));
      p.spectrum = Array(10).fill(20);
      p.gameOver = false;
      p.score = 0;
    });
    this._clearSpeedTimer();
  }

  /** Start the gravity escalation timer — call after start() if mode includes gravity */
  startSpeedEscalation(onSpeedUpdate) {
    this._clearSpeedTimer();
    this.speedTimer = setInterval(() => {
      this.currentSpeed = Math.max(100, this.currentSpeed - 100);
      onSpeedUpdate(this.currentSpeed);
    }, 30000);
  }

  _clearSpeedTimer() {
    if (this.speedTimer) {
      clearInterval(this.speedTimer);
      this.speedTimer = null;
    }
  }

  finish() {
    this.status = 'FINISHED';
    this._clearSpeedTimer();
  }

  getState() {
    return {
      name: this.name,
      status: this.status,
      mode: this.mode,
      currentSpeed: this.currentSpeed,
      players: this.players.map(p => ({
        id: p.id,
        name: p.name,
        isHost: p.isHost,
        score: p.score,
        spectrum: p.spectrum,
        gameOver: p.gameOver
      }))
    };
  }
}

export default Game;
