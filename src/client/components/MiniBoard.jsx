import Cell from './Cell'

const PIECE_COLORS = {
  1: '#00f5ff', 2: '#2563eb', 3: '#f97316',
  4: '#eab308', 5: '#22c55e', 6: '#a855f7', 7: '#ef4444',
}

export default function MiniBoard({ shape }) {
  if (!shape) {
    return (
      <div style={{
        height: '3rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <span style={{ color: '#374151', fontFamily: '"IBM Plex Mono", monospace', fontSize: '0.65rem' }}>—</span>
      </div>
    )
  }

  const rows = shape.length
  const cols = shape[0].length
  // Detect type from first non-zero value for glow
  const type = shape.flat().find(v => v > 0) ?? 0
  const glowColor = PIECE_COLORS[type] ?? '#fff'

  return (
    <div style={{
      display: 'inline-grid',
      gridTemplateColumns: `repeat(${cols}, 1fr)`,
      gridTemplateRows: `repeat(${rows}, 1fr)`,
      gap: '1px',
      backgroundColor: '#1a1a2e',
      padding: '1px',
      boxShadow: type ? `0 0 8px ${glowColor}33` : 'none',
    }}>
      {shape.flat().map((cell, i) => (
        <div key={i} style={{ width: '1.1rem', height: '1.1rem' }}>
          <Cell type={cell} />
        </div>
      ))}
    </div>
  )
}
