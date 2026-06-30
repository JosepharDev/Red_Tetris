import Cell from './Cell'

const EMPTY_BOARD = Array(20).fill(null).map(() => Array(10).fill(0))

export default function Board({ board = EMPTY_BOARD, shake = false }) {
  return (
    <div
      className={shake ? 'board-shake' : ''}
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(10, 1fr)',
        gap: '1px',
        backgroundColor: '#1a1a2e',
        border: '2px solid #1a1a2e',
        padding: '1px',
        boxShadow: '0 0 0 1px #ef444430, 0 0 24px #ef444415',
        width: '100%',
        boxSizing: 'border-box',
      }}
    >
      {board.flat().map((cell, i) => (
        <Cell key={i} type={cell} />
      ))}
    </div>
  )
}
