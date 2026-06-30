import { useReducer, useCallback, useEffect, useRef } from 'react'
import {
  COLS, ROWS, EMPTY_BOARD,
  rotateCW, collides, getGhostY, lockPiece, clearLines, getStartPos, buildDisplay,
} from '../game/engine'

// ── Reducer ───────────────────────────────────────────────────────────────────

const initState = () => ({
  board: EMPTY_BOARD(),
  displayBoard: EMPTY_BOARD(),
  current: null,
  queue: [],
  queueIndex: 0,
  holdShape: null,
  canHold: true,
  lines: 0,
  level: 1,
  speed: 1000,
  status: 'idle',      // idle | playing | over
  invisible: false,
  needsSpawn: false,   // signals GameRoom to report + spawn next
  linesJustCleared: 0,
  _rptSoft: 0,
  _rptHard: 0,
  softDropCells: 0,
  hardDropCells: 0,
  shake: false,
})

function attemptSpawn(state) {
  const piece = state.queue[state.queueIndex]
  if (!piece) return { ...state, needsSpawn: true, current: null }
  const { shape } = piece
  const { x, y } = getStartPos(shape)
  if (collides(state.board, shape, x, y)) {
    return { ...state, status: 'over', current: null, needsSpawn: false }
  }
  const ghostY = getGhostY(state.board, shape, x, y)
  return {
    ...state,
    current: { shape, x, y },
    queueIndex: state.queueIndex + 1,
    displayBoard: buildDisplay(state.board, shape, x, y, ghostY, state.invisible),
    needsSpawn: false,
    linesJustCleared: 0,
    _rptSoft: 0,
    _rptHard: 0,
    softDropCells: 0,
    hardDropCells: 0,
    canHold: true,
  }
}

function doLock(state) {
  const { shape, x, y } = state.current
  const locked = lockPiece(state.board, shape, x, y)
  const { board, count } = clearLines(locked)
  const lines = state.lines + count
  const level = Math.floor(lines / 10) + 1
  return {
    ...state,
    board,
    displayBoard: board.map(r => [...r]),
    current: null,
    lines,
    level,
    linesJustCleared: count,
    _rptSoft: state.softDropCells,
    _rptHard: state.hardDropCells,
    softDropCells: 0,
    hardDropCells: 0,
    needsSpawn: true,
  }
}

function reducer(state, action) {
  switch (action.type) {
    case 'START': {
      const base = {
        ...initState(),
        queue: action.queue || [],
        status: 'playing',
        speed: action.speed || 1000,
        invisible: action.invisible || false,
      }
      return attemptSpawn(base)
    }

    case 'ADD_PIECES': {
      const queue = [...state.queue, ...action.pieces]
      if (state.status === 'playing' && state.needsSpawn) {
        return attemptSpawn({ ...state, queue })
      }
      return { ...state, queue }
    }

    case 'MOVE': {
      if (!state.current || state.status !== 'playing') return state
      const { dx = 0, dy = 0 } = action
      const { shape, x, y } = state.current
      const nx = x + dx, ny = y + dy
      if (collides(state.board, shape, nx, ny)) return state
      const ghostY = getGhostY(state.board, shape, nx, ny)
      return {
        ...state,
        current: { ...state.current, x: nx, y: ny },
        displayBoard: buildDisplay(state.board, shape, nx, ny, ghostY, state.invisible),
        softDropCells: dy > 0 ? state.softDropCells + 1 : state.softDropCells,
      }
    }

    case 'ROTATE': {
      if (!state.current || state.status !== 'playing') return state
      const { shape, x, y } = state.current
      const rotated = rotateCW(shape)
      const kicks = [[0, 0], [-1, 0], [1, 0], [0, -1], [-2, 0], [2, 0]]
      for (const [kx, ky] of kicks) {
        const nx = x + kx, ny = y + ky
        if (!collides(state.board, rotated, nx, ny)) {
          return {
            ...state,
            current: { shape: rotated, x: nx, y: ny },
            displayBoard: buildDisplay(state.board, rotated, nx, ny, getGhostY(state.board, rotated, nx, ny), state.invisible),
          }
        }
      }
      return state
    }

    case 'SOFT_DROP': {
      if (!state.current || state.status !== 'playing') return state
      const { shape, x, y } = state.current
      if (collides(state.board, shape, x, y + 1)) return doLock(state)
      const ny = y + 1
      return {
        ...state,
        current: { ...state.current, y: ny },
        displayBoard: buildDisplay(state.board, shape, x, ny, getGhostY(state.board, shape, x, ny), state.invisible),
        softDropCells: state.softDropCells + 1,
      }
    }

    case 'HARD_DROP': {
      if (!state.current || state.status !== 'playing') return state
      const { shape, x, y } = state.current
      const gy = getGhostY(state.board, shape, x, y)
      const cells = Math.max(0, gy - y)
      return doLock({ ...state, current: { shape, x, y: gy }, hardDropCells: state.hardDropCells + cells })
    }

    case 'GRAVITY_TICK': {
      if (!state.current || state.status !== 'playing') return state
      const { shape, x, y } = state.current
      if (collides(state.board, shape, x, y + 1)) return doLock(state)
      return reducer(state, { type: 'MOVE', dx: 0, dy: 1 })
    }

    case 'SPAWN': {
      if (state.status !== 'playing') return state
      return attemptSpawn(state)
    }

    case 'HOLD': {
      if (!state.current || !state.canHold || state.status !== 'playing') return state
      const { shape } = state.current
      if (state.holdShape) {
        const hs = state.holdShape
        const { x, y } = getStartPos(hs)
        if (collides(state.board, hs, x, y)) return state
        return {
          ...state,
          current: { shape: hs, x, y },
          holdShape: shape,
          canHold: false,
          displayBoard: buildDisplay(state.board, hs, x, y, getGhostY(state.board, hs, x, y), state.invisible),
        }
      }
      const next = attemptSpawn({ ...state, holdShape: shape, canHold: false })
      return { ...next, holdShape: shape, canHold: false }
    }

    case 'PENALTY': {
      if (state.status !== 'playing') return state
      const count = Math.min(action.count, ROWS - 1)
      const penaltyRows = Array(count).fill(null).map(() => Array(COLS).fill(8))
      const newBoard = [...state.board.slice(count), ...penaltyRows]
      let current = state.current
      if (current) {
        let { shape, x, y } = current
        while (y > -3 && collides(newBoard, shape, x, y)) y--
        current = { ...current, y }
      }
      const d = current
        ? buildDisplay(newBoard, current.shape, current.x, current.y, getGhostY(newBoard, current.shape, current.x, current.y), state.invisible)
        : newBoard.map(r => [...r])
      return { ...state, board: newBoard, displayBoard: d, current, shake: true }
    }

    case 'CLEAR_SHAKE': return { ...state, shake: false }
    case 'SET_SPEED':   return { ...state, speed: action.speed }
    case 'RESET':       return initState()
    default:            return state
  }
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useTetris() {
  const [state, dispatch] = useReducer(reducer, initState())
  const sRef = useRef(state)
  sRef.current = state

  // Gravity tick
  useEffect(() => {
    if (state.status !== 'playing') return
    const id = setInterval(() => {
      if (sRef.current.status === 'playing' && sRef.current.current) {
        dispatch({ type: 'GRAVITY_TICK' })
      }
    }, state.speed)
    return () => clearInterval(id)
  }, [state.status, state.speed])

  // Auto-clear shake flag
  useEffect(() => {
    if (!state.shake) return
    const id = setTimeout(() => dispatch({ type: 'CLEAR_SHAKE' }), 350)
    return () => clearTimeout(id)
  }, [state.shake])

  return {
    state,
    start:      useCallback((queue, opts = {}) => dispatch({ type: 'START', queue, ...opts }), []),
    addPieces:  useCallback((p) => dispatch({ type: 'ADD_PIECES', pieces: p }), []),
    addPenalty: useCallback((n) => dispatch({ type: 'PENALTY', count: n }), []),
    setSpeed:   useCallback((s) => dispatch({ type: 'SET_SPEED', speed: s }), []),
    spawn:      useCallback(() => dispatch({ type: 'SPAWN' }), []),
    moveLeft:   useCallback(() => dispatch({ type: 'MOVE', dx: -1, dy: 0 }), []),
    moveRight:  useCallback(() => dispatch({ type: 'MOVE', dx: 1, dy: 0 }), []),
    softDrop:   useCallback(() => dispatch({ type: 'SOFT_DROP' }), []),
    hardDrop:   useCallback(() => dispatch({ type: 'HARD_DROP' }), []),
    rotate:     useCallback(() => dispatch({ type: 'ROTATE' }), []),
    hold:       useCallback(() => dispatch({ type: 'HOLD' }), []),
    reset:      useCallback(() => dispatch({ type: 'RESET' }), []),
  }
}
