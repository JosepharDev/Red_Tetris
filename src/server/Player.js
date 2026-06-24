class Player {
  constructor(id, name, room) {
    this.id = id;
    this.name = name;
    this.room = room;
    this.isHost = false;
    this.board = Array(20).fill().map(() => Array(10).fill(0));
    this.score = 0;
    this.spectrum = Array(10).fill(20);
    this.gameOver = false;
  }

  updateSpectrum(board) {
    for (let c = 0; c < 10; c++) {
      let r = 0;
      while (r < 20 && board[r][c] === 0) {
        r++;
      }
      this.spectrum[c] = r;
    }
  }
}

export default Player;
