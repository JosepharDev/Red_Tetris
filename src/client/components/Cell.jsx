// Maps server piece type index → hex color
const PIECE_COLORS = {
  0: null,             // empty
  1: '#00f5ff',        // I – cyan
  2: '#2563eb',        // J – blue
  3: '#f97316',        // L – orange
  4: '#eab308',        // O – yellow
  5: '#22c55e',        // S – green
  6: '#a855f7',        // T – purple
  7: '#ef4444',        // Z – red
  8: '#374151',        // penalty – grey (indestructible)
  9: 'rgba(255,255,255,0.08)', // ghost piece
}

export default function Cell({ type = 0 }) {
  const color = PIECE_COLORS[type] ?? null
  const isEmpty  = type === 0
  const isGhost  = type === 9
  const isFilled = type >= 1 && type <= 8

  return (
    <div
      style={{
        aspectRatio: '1 / 1',
        backgroundColor: isEmpty ? '#111118' : color,
        borderWidth: '1px',
        borderStyle: 'solid',
        borderColor: isGhost ? 'rgba(255,255,255,0.18)' : '#1a1a2e',
        // 3-D bevel via inset shadows on filled cells, outer neon glow
        boxShadow: isFilled
          ? [
              `0 0 8px ${color}55`,
              `inset 2px 2px 0 rgba(255,255,255,0.22)`,
              `inset -2px -2px 0 rgba(0,0,0,0.38)`,
            ].join(', ')
          : 'none',
      }}
    />
  )
}
