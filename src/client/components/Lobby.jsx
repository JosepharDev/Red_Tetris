import { labelStyle, btnStyle, mono, display } from '../styles/ui'

const MODES = [
  { value: 'normal',            label: 'NORMAL' },
  { value: 'invisible',         label: 'INVISIBLE' },
  { value: 'gravity',           label: 'GRAVITY' },
  { value: 'invisible+gravity', label: 'INVIS+GRAV' },
]

export default function Lobby({ players, playerName, isHost, modeSelect, onSelectMode, onStart }) {
  return (
    <div className="fade-in-up" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem', maxWidth: '22rem', width: '100%' }}>
      <h2 style={{ fontFamily: display, fontSize: '0.8rem', color: '#e5e7eb', letterSpacing: '0.12em' }}>
        LOBBY
      </h2>

      {/* Player list */}
      <div style={{ width: '100%', backgroundColor: '#13131f', border: '1px solid #1a1a2e', padding: '0.75rem' }}>
        <p style={labelStyle}>PLAYERS</p>
        {players.map(p => (
          <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.35rem 0', borderBottom: '1px solid #1a1a2e' }}>
            <span style={{ fontFamily: mono, fontSize: '0.75rem', color: p.name === playerName ? '#00f5ff' : '#e5e7eb' }}>
              {p.name}
            </span>
            {p.isHost && (
              <span style={{ fontFamily: display, fontSize: '0.4rem', color: '#ef4444', border: '1px solid #ef444466', padding: '0.1rem 0.3rem' }}>
                HOST
              </span>
            )}
          </div>
        ))}
        {players.length === 0 && (
          <p style={{ color: '#6b7280', fontFamily: mono, fontSize: '0.7rem' }}>…</p>
        )}
      </div>

      {/* Mode select (host only) */}
      {isHost && (
        <div style={{ width: '100%' }}>
          <p style={labelStyle}>GAME MODE</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem', marginTop: '0.4rem' }}>
            {MODES.map(m => (
              <button
                key={m.value}
                onClick={() => onSelectMode(m.value)}
                style={{
                  fontFamily: display,
                  fontSize: '0.42rem',
                  letterSpacing: '0.1em',
                  padding: '0.5rem',
                  backgroundColor: modeSelect === m.value ? '#ef4444' : 'transparent',
                  color: modeSelect === m.value ? '#0a0a0f' : '#6b7280',
                  border: `1px solid ${modeSelect === m.value ? '#ef4444' : '#1a1a2e'}`,
                  cursor: 'pointer',
                  transition: 'all 0.12s',
                }}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {isHost ? (
        <button onClick={onStart} style={{ ...btnStyle, width: '100%' }}>
          START GAME
        </button>
      ) : (
        <p style={{ fontFamily: mono, fontSize: '0.65rem', color: '#6b7280' }}>
          Waiting for host to start…
        </p>
      )}
    </div>
  )
}
