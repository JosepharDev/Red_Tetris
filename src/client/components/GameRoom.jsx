import { useParams } from 'react-router-dom'
import Board from './Board'

export default function GameRoom() {
  const { room, playerName } = useParams()

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#0a0a0f',
        padding: '1rem',
      }}
    >
      {/* Header bar */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.6rem 1.5rem',
          backgroundColor: '#13131f',
          borderBottom: '1px solid #1a1a2e',
          zIndex: 10,
        }}
      >
        <span
          style={{
            fontFamily: '"Press Start 2P", monospace',
            fontSize: '0.55rem',
            color: '#ef4444',
            letterSpacing: '0.15em',
          }}
        >
          RED TETRIS
        </span>
        <span
          style={{
            fontFamily: '"IBM Plex Mono", monospace',
            fontSize: '0.7rem',
            color: '#6b7280',
          }}
        >
          {room} · {playerName}
        </span>
        <StatusBadge label="WAITING" />
      </div>

      {/* Main game layout */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: '1.25rem',
          marginTop: '2rem',
        }}
      >
        {/* Left panel: Hold + Info */}
        <aside style={{ width: '7rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <Panel label="HOLD" height="5.5rem">
            <span style={{ color: '#6b7280', fontSize: '0.65rem', fontFamily: '"IBM Plex Mono", monospace' }}>—</span>
          </Panel>
          <div>
            <PanelLabel>ROOM</PanelLabel>
            <p
              style={{
                fontFamily: '"IBM Plex Mono", monospace',
                fontSize: '0.75rem',
                color: '#00f5ff',
                marginTop: '0.25rem',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {room}
            </p>
          </div>
          <div>
            <PanelLabel>PLAYER</PanelLabel>
            <p
              style={{
                fontFamily: '"IBM Plex Mono", monospace',
                fontSize: '0.75rem',
                color: '#e5e7eb',
                marginTop: '0.25rem',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {playerName}
            </p>
          </div>
        </aside>

        {/* Board */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ width: '280px' }}>
            <Board />
          </div>
          <p
            style={{
              fontFamily: '"IBM Plex Mono", monospace',
              fontSize: '0.6rem',
              color: '#6b7280',
              letterSpacing: '0.05em',
            }}
          >
            ← → move · ↑ rotate · ↓ soft · space hard
          </p>
        </div>

        {/* Right panel: Next + Score */}
        <aside style={{ width: '7rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <Panel label="NEXT" height="9rem">
            <span style={{ color: '#6b7280', fontSize: '0.65rem', fontFamily: '"IBM Plex Mono", monospace' }}>—</span>
          </Panel>
          <ScoreItem label="SCORE" value="000000" color="#00f5ff" />
          <ScoreItem label="LEVEL" value="01"     color="#a855f7" />
          <ScoreItem label="LINES" value="000"    color="#e5e7eb" />

          <Panel label="OPPONENTS" height="6rem">
            <span style={{ color: '#6b7280', fontSize: '0.55rem', fontFamily: '"IBM Plex Mono", monospace', textAlign: 'center' }}>
              none
            </span>
          </Panel>
        </aside>
      </div>
    </div>
  )
}

function PanelLabel({ children }) {
  return (
    <p
      style={{
        fontFamily: '"Press Start 2P", monospace',
        fontSize: '0.5rem',
        letterSpacing: '0.18em',
        color: '#6b7280',
        lineHeight: 1,
      }}
    >
      {children}
    </p>
  )
}

function Panel({ label, height = 'auto', children }) {
  return (
    <div>
      <PanelLabel>{label}</PanelLabel>
      <div
        style={{
          marginTop: '0.4rem',
          height,
          backgroundColor: '#13131f',
          border: '1px solid #1a1a2e',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {children}
      </div>
    </div>
  )
}

function ScoreItem({ label, value, color }) {
  return (
    <div>
      <PanelLabel>{label}</PanelLabel>
      <p
        style={{
          marginTop: '0.3rem',
          fontFamily: '"Press Start 2P", monospace',
          fontSize: '0.75rem',
          color,
          letterSpacing: '0.05em',
        }}
      >
        {value}
      </p>
    </div>
  )
}

function StatusBadge({ label }) {
  return (
    <span
      style={{
        fontFamily: '"Press Start 2P", monospace',
        fontSize: '0.45rem',
        letterSpacing: '0.15em',
        color: '#eab308',
        border: '1px solid #eab308',
        padding: '0.2rem 0.5rem',
      }}
    >
      {label}
    </span>
  )
}
