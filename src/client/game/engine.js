

export const COLS = 10
export const ROWS = 20

export const EMPTY_BOARD = () => Array(ROWS).fill(null).map(() => Array(COLS).fill(0))

export function rotateCW(matrix) {
  return matrix[0].map((_, i) => matrix.map(row => row[i]).reverse())
}

export function collides(board, shape, px, py) {
  for (let r = 0; r < shape.length; r++) {
    for (let c = 0; c < shape[r].length; c++) {
      if (!shape[r][c]) continue
      const x = px + c, y = py + r
      if (x < 0 || x >= COLS || y >= ROWS) return true
      if (y >= 0 && board[y][x]) return true
    }
  }
  return false
}

export function getGhostY(board, shape, px, py) {
  let y = py
  while (!collides(board, shape, px, y + 1)) y++
  return y
}

export function lockPiece(board, shape, px, py) {
  const next = board.map(row => [...row])
  for (let r = 0; r < shape.length; r++) {
    for (let c = 0; c < shape[r].length; c++) {
      if (!shape[r][c]) continue
      const y = py + r, x = px + c
      if (y >= 0 && y < ROWS && x >= 0 && x < COLS) next[y][x] = shape[r][c]
    }
  }
  return next
}

export function clearLines(board) {
  const remaining = board.filter(row => row.some(c => c === 0))
  const count = ROWS - remaining.length
  const empty = Array(count).fill(null).map(() => Array(COLS).fill(0))
  return { board: [...empty, ...remaining], count }
}

export function getStartPos(shape) {
  return { x: Math.floor((COLS - shape[0].length) / 2), y: 0 }
}

export function buildDisplay(board, shape, px, py, ghostY, invisible) {
  const d = invisible
    ? Array(ROWS).fill(null).map(() => Array(COLS).fill(0))
    : board.map(row => [...row])
  // Ghost
  for (let r = 0; r < shape.length; r++) {
    for (let c = 0; c < shape[r].length; c++) {
      if (!shape[r][c]) continue
      const gx = px + c, gy = ghostY + r
      if (gy >= 0 && gy < ROWS && gx >= 0 && gx < COLS && !d[gy][gx]) d[gy][gx] = 9
    }
  }
  // Active piece (drawn on top)
  for (let r = 0; r < shape.length; r++) {
    for (let c = 0; c < shape[r].length; c++) {
      if (!shape[r][c]) continue
      const x = px + c, y = py + r
      if (y >= 0 && y < ROWS && x >= 0 && x < COLS) d[y][x] = shape[r][c]
    }
  }
  return d
}
