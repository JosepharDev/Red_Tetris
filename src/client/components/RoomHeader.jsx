import { mono, display } from '../styles/ui'

const LABELS = {
  connecting: 'CONNECTING', waiting: 'WAITING', starting: 'STARTING',
  playing: 'PLAYING', finished: 'FINISHED', rejected: 'REJECTED',
}
const COLORS = {
  waiting: '#eab308', playing: '#22c55e', finished: '#a855f7', rejected: '#ef4444',
}

export default function RoomHeader({ room, playerName, phase }) {
  const statusLabel = LABELS[phase] ?? 'WAITING'
  const statusColor = COLORS[phase] ?? '#6b7280'

  return (
    <header style={{
      position: 'fixed',
      top: 0, left: 0, right: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0.5rem 1rem',
      backgroundColor: '#13131f',
      borderBottom: '1px solid #1a1a2e',
      zIndex: 10,
      flexShrink: 0,
    }}>
      <span style={{ fontFamily: display, fontSize: '0.55rem', color: '#ef4444', letterSpacing: '0.12em' }}>
        RED TETRIS
      </span>
      <span style={{ fontFamily: mono, fontSize: '0.65rem', color: '#6b7280' }}>
        {room} · {playerName}
      </span>
      <span style={{
        fontFamily: display,
        fontSize: '0.45rem',
        letterSpacing: '0.12em',
        color: statusColor,
        border: `1px solid ${statusColor}`,
        padding: '0.18rem 0.45rem',
      }}>
        {statusLabel}
      </span>
    </header>
  )
}
