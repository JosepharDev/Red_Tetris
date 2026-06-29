export default function Spectrum({ players }) {
  if (!players || players.length === 0) {
    return (
      <span style={{ color: '#6b7280', fontSize: '0.55rem', fontFamily: '"IBM Plex Mono", monospace' }}>
        none yet
      </span>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      {players.map(p => (
        <div key={p.id}>
          <p style={{
            fontFamily: '"IBM Plex Mono", monospace',
            fontSize: '0.5rem',
            color: p.gameOver ? '#6b7280' : '#e5e7eb',
            marginBottom: '2px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}>
            {p.gameOver ? '✗' : '▸'} {p.name}
          </p>
          <div style={{
            display: 'flex',
            gap: '1px',
            alignItems: 'flex-end',
            height: '40px',
            backgroundColor: '#111118',
            border: '1px solid #1a1a2e',
            padding: '1px',
          }}>
            {(p.spectrum || Array(10).fill(20)).map((s, i) => {
              const filled = 20 - s
              const pct = (filled / 20) * 100
              const color = p.gameOver
                ? '#374151'
                : filled > 15 ? '#ef4444'
                : filled > 8  ? '#eab308'
                : '#374151'
              return (
                <div key={i} style={{
                  flex: 1,
                  height: `${Math.max(pct, 0)}%`,
                  backgroundColor: color,
                  alignSelf: 'flex-end',
                  transition: 'height 0.1s ease-out',
                }} />
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
