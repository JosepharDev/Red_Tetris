import Board from './Board'
import MiniBoard from './MiniBoard'
import Spectrum from './Spectrum'
import Panel from './ui/Panel'
import ScoreItem from './ui/ScoreItem'
import { labelStyle, mono, display } from '../styles/ui'

// The active play view: hold/info panel, the main board with game-over
// overlay, and the next-queue / score / opponents panel.
export default function PlayField({ state, gameMode, room, playerName, myScore, opponents }) {
  const nextShapes = state.queue.slice(state.queueIndex, state.queueIndex + 3).map(p => p?.shape)

  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', height: 'calc(100vh - 56px)', padding: '0.25rem 0' }}>

      {/* Left panel */}
      <aside className="side-panel">
        <Panel label="HOLD">
          <MiniBoard shape={state.holdShape} />
        </Panel>

        <div style={{ marginTop: '0.75rem' }}>
          <p style={labelStyle}>MODE</p>
          <p style={{ fontFamily: mono, fontSize: '0.6rem', color: '#a855f7', marginTop: '0.2rem' }}>
            {gameMode.toUpperCase()}
          </p>
        </div>

        <div style={{ marginTop: '0.75rem' }}>
          <p style={labelStyle}>ROOM</p>
          <p style={{ fontFamily: mono, fontSize: '0.65rem', color: '#00f5ff', marginTop: '0.2rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {room}
          </p>
        </div>

        <div style={{ marginTop: '0.75rem' }}>
          <p style={labelStyle}>PLAYER</p>
          <p style={{ fontFamily: mono, fontSize: '0.65rem', color: '#e5e7eb', marginTop: '0.2rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {playerName}
          </p>
        </div>
      </aside>

      {/* Board column */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%' }}>
        <div className="board-inner" style={{ position: 'relative' }}>
          <Board board={state.displayBoard} shake={state.shake} />

          {state.status === 'over' && (
            <div style={{
              position: 'absolute', inset: 0,
              backgroundColor: 'rgba(10,10,15,0.82)',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
            }}>
              <p style={{ fontFamily: display, fontSize: 'clamp(0.55rem, 2vw, 0.9rem)', color: '#ef4444', textAlign: 'center', lineHeight: 1.8 }}>
                GAME<br />OVER
              </p>
              <p style={{ fontFamily: mono, fontSize: '0.6rem', color: '#6b7280' }}>
                waiting for others…
              </p>
            </div>
          )}
        </div>

        <p style={{ fontFamily: mono, fontSize: '0.52rem', color: '#374151', letterSpacing: '0.04em', marginTop: '0.35rem', textAlign: 'center' }}>
          ← → move · ↑/Z rotate · ↓ soft · SPACE hard · C hold
        </p>
      </div>

      {/* Right panel */}
      <aside className="side-panel">
        <Panel label="NEXT">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', alignItems: 'center' }}>
            {[0, 1, 2].map(i => <MiniBoard key={i} shape={nextShapes[i]} />)}
          </div>
        </Panel>

        <div style={{ marginTop: '0.75rem' }}>
          <ScoreItem label="SCORE" value={String(myScore).padStart(6, '0')} color="#00f5ff" />
        </div>
        <div style={{ marginTop: '0.5rem' }}>
          <ScoreItem label="LEVEL" value={String(state.level).padStart(2, '0')} color="#a855f7" />
        </div>
        <div style={{ marginTop: '0.5rem' }}>
          <ScoreItem label="LINES" value={String(state.lines).padStart(3, '0')} color="#e5e7eb" />
        </div>

        <div style={{ marginTop: '1rem' }}>
          <p style={labelStyle}>OPPONENTS</p>
          <div style={{ marginTop: '0.35rem' }}>
            <Spectrum players={opponents} />
          </div>
        </div>
      </aside>
    </div>
  )
}
