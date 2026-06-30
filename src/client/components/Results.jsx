import { labelStyle, btnStyle, mono, display } from '../styles/ui'

export default function Results({ leaderboard, isHost, onRestart, onLeave }) {
  return (
    <div className="fade-in-up" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem', maxWidth: '22rem', width: '100%' }}>
      <h2 style={{ fontFamily: display, fontSize: '0.85rem', color: '#a855f7', letterSpacing: '0.12em' }}>
        GAME OVER
      </h2>

      <div style={{ width: '100%', backgroundColor: '#13131f', border: '1px solid #1a1a2e', padding: '0.75rem' }}>
        <p style={labelStyle}>LEADERBOARD</p>
        {leaderboard.slice(0, 10).map((entry, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.3rem 0', borderBottom: '1px solid #1a1a2e' }}>
            <span style={{ fontFamily: mono, fontSize: '0.65rem', color: i === 0 ? '#eab308' : '#e5e7eb' }}>
              {i + 1}. {entry.name}
            </span>
            <span style={{ fontFamily: display, fontSize: '0.5rem', color: i === 0 ? '#eab308' : '#6b7280' }}>
              {entry.score}
            </span>
          </div>
        ))}
      </div>

      {isHost && (
        <button onClick={onRestart} style={{ ...btnStyle, width: '100%' }}>
          PLAY AGAIN
        </button>
      )}
      <button onClick={onLeave} style={{ ...btnStyle, width: '100%', backgroundColor: 'transparent', color: '#6b7280', borderColor: '#1a1a2e' }}>
        LEAVE
      </button>
    </div>
  )
}
