// The original Tetrimino shapes
const SHAPES = [
  // I
  [
    [0, 0, 0, 0],
    [1, 1, 1, 1],
    [0, 0, 0, 0],
    [0, 0, 0, 0]
  ],
  // J
  [
    [2, 0, 0],
    [2, 2, 2],
    [0, 0, 0]
  ],
  // L
  [
    [0, 0, 3],
    [3, 3, 3],
    [0, 0, 0]
  ],
  // O
  [
    [4, 4],
    [4, 4]
  ],
  // S
  [
    [0, 5, 5],
    [5, 5, 0],
    [0, 0, 0]
  ],
  // T
  [
    [0, 6, 0],
    [6, 6, 6],
    [0, 0, 0]
  ],
  // Z
  [
    [7, 7, 0],
    [0, 7, 7],
    [0, 0, 0]
  ]
];

class Piece {
  constructor() {
    this.type = Math.floor(Math.random() * SHAPES.length);
    this.shape = SHAPES[this.type];
    // Start pos could be passed or determined here
  }
}

export default Piece;
