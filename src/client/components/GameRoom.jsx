import { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Board from './Board'
import MiniBoard from './MiniBoard'
import Spectrum from './Spectrum'
import Chat from './Chat'
import { useTetris } from '../hooks/useTetris'
import { useSocket } from '../hooks/useSocket'

const MODES = [
  { value: 'normal',             label: 'NORMAL' },
  { value: 'invisible',          label: 'INVISIBLE' },
  { value: 'gravity',            label: 'GRAVITY' },
  { value: 'invisible+gravity',  label: 'INVIS+GRAV' },
]

export default function GameRoom() {
  const { room, playerName } = useParams()
  const navigate = useNavigate()

  // Server game state
  const [serverState, setServerState]   = useState(null)
  const [leaderboard, setLeaderboard]   = useState([])
  const [phase, setPhase]               = useState('connecting')
  const [modeSelect, setModeSelect]     = useState('normal')
  const [messages, setMessages]         = useState([])
  const [rejectReason, setRejectReason] = useState('')
  const phaseRef = useRef('connecting')
  const serverStateRef = useRef(null)

  const setGamePhase = (p) => { phaseRef.current = p; setPhase(p) }

  // Tetris engine
  const tetris = useTetris()

  // Stable ref wrappers for tetris actions (used inside socket handlers)
  const tetrisRef = useRef(tetris)
  tetrisRef.current = tetris

  // Socket
  const { emit } = useSocket(room, playerName, {
    onGameUpdate: (s) => {
      setServerState(s)
      serverStateRef.current = s
      if (s.status === 'WAITING' && phaseRef.current !== 'playing' && phaseRef.current !== 'finished') {
        setGamePhase('waiting')
      }
    },
    onGameStarted: () => {
      setGamePhase('starting')
    },
    onNextPieces: (pieces) => {
      if (phaseRef.current === 'starting') {
        const mode = serverStateRef.current?.mode || 'normal'
        tetrisRef.current.start(pieces, { invisible: mode.includes('invisible') })
        setGamePhase('playing')
      } else {
        tetrisRef.current.addPieces(pieces)
      }
    },
    onPenalty: (n) => tetrisRef.current.addPenalty(n),
    onFinished: ({ leaderboard: lb }) => {
      setLeaderboard(lb)
      setGamePhase('finished')
    },
    onRestarted: () => {
      tetrisRef.current.reset()
      setGamePhase('waiting')
    },
    onSpeed: (s) => tetrisRef.current.setSpeed(s),
    onLeaderboard: (lb) => setLeaderboard(lb),
    onRejected: ({ reason }) => {
      setRejectReason(reason || 'Unable to join')
      setGamePhase('rejected')
    },
    onChat: (m) => setMessages(prev => [...prev, m]),
  })

  const emitRef = useRef(emit)
  emitRef.current = emit

  // After piece locks: report to server, request more pieces, spawn next
  const { state } = tetris
  useEffect(() => {
    if (!state.needsSpawn) return
    emitRef.current('board_update', state.board)
    if (state.linesJustCleared > 0) {
      emitRef.current('rows_cleared', {
        count:         state.linesJustCleared,
        softDropCells: state._rptSoft,
        hardDropCells: state._rptHard,
      })
    }
    if (state.queueIndex + 5 >= state.queue.length) {
      emitRef.current('request_pieces', state.queue.length)
    }
    tetris.spawn()
  }, [state.needsSpawn])

  // Report game over
  useEffect(() => {
    if (state.status === 'over') {
      emitRef.current('game_over')
    }
  }, [state.status])

  // Keyboard input
  useEffect(() => {
    if (state.status !== 'playing') return
    const handler = (e) => {
      // Don't hijack keys while typing in chat / any text field
      const tag = e.target?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || e.target?.isContentEditable) return
      switch (e.code) {
        case 'ArrowLeft':
          e.preventDefault()
          tetris.moveLeft()
          break
        case 'ArrowRight':
          e.preventDefault()
          tetris.moveRight()
          break
        case 'ArrowDown':
          e.preventDefault()
          tetris.softDrop()
          break
        case 'ArrowUp':
          if (e.repeat) return
          e.preventDefault()
          tetris.rotate()
          break
        case 'KeyZ':
          if (e.repeat) return
          e.preventDefault()
          tetris.rotate()
          break
        case 'Space':
          if (e.repeat) return
          e.preventDefault()
          tetris.hardDrop()
          break
        case 'KeyC':
        case 'ShiftLeft':
        case 'ShiftRight':
          if (e.repeat) return
          e.preventDefault()
          tetris.hold()
          break
        default:
          break
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [state.status, tetris.moveLeft, tetris.moveRight, tetris.softDrop, tetris.rotate, tetris.hardDrop, tetris.hold])

  // Derived from server state
  const me        = serverState?.players?.find(p => p.name === playerName)
  const isHost    = me?.isHost ?? false
  const myScore   = me?.score ?? 0
  const opponents = serverState?.players?.filter(p => p.name !== playerName) ?? []
  const gameMode  = serverState?.mode ?? 'normal'

  // Next 3 pieces to show in panel
  const nextShapes = state.queue
    .slice(state.queueIndex, state.queueIndex + 3)
    .map(p => p?.shape)

  const statusLabel = {
    connecting: 'CONNECTING',
    waiting:    'WAITING',
    starting:   'STARTING',
    playing:    'PLAYING',
    finished:   'FINISHED',
    rejected:   'REJECTED',
  }[phase] ?? 'WAITING'

  const statusColor = {
    waiting: '#eab308',
    playing: '#22c55e',
    finished: '#a855f7',
    rejected: '#ef4444',
  }[phase] ?? '#6b7280'

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0a0a0f', display: 'flex', flexDirection: 'column' }}>

      {/* ── Header ── */}
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
        <span style={{ fontFamily: '"Press Start 2P", monospace', fontSize: '0.55rem', color: '#ef4444', letterSpacing: '0.12em' }}>
          RED TETRIS
        </span>
        <span style={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: '0.65rem', color: '#6b7280' }}>
          {room} · {playerName}
        </span>
        <span style={{
          fontFamily: '"Press Start 2P", monospace',
          fontSize: '0.45rem',
          letterSpacing: '0.12em',
          color: statusColor,
          border: `1px solid ${statusColor}`,
          padding: '0.18rem 0.45rem',
        }}>
          {statusLabel}
        </span>
      </header>

      {/* ── Main content (below fixed header) ── */}
      <main style={{ marginTop: '40px', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0.5rem' }}>

        {/* ══ CONNECTING ══ */}
        {phase === 'connecting' && (
          <p style={{ fontFamily: '"IBM Plex Mono", monospace', color: '#6b7280', fontSize: '0.8rem' }}>
            Connecting…
          </p>
        )}

        {/* ══ REJECTED ══ */}
        {phase === 'rejected' && (
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontFamily: '"Press Start 2P", monospace', color: '#ef4444', fontSize: '0.8rem', marginBottom: '0.75rem', lineHeight: 1.8 }}>
              JOIN<br />REJECTED
            </p>
            <p style={{ fontFamily: '"IBM Plex Mono", monospace', color: '#6b7280', fontSize: '0.7rem', marginBottom: '1rem' }}>
              {rejectReason}
            </p>
            <button onClick={() => navigate('/')} style={btnStyle}>BACK</button>
          </div>
        )}

        {/* ══ WAITING / STARTING ══ */}
        {(phase === 'waiting' || phase === 'starting') && (
          <div className="fade-in-up" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem', maxWidth: '22rem', width: '100%' }}>
            <h2 style={{ fontFamily: '"Press Start 2P", monospace', fontSize: '0.8rem', color: '#e5e7eb', letterSpacing: '0.12em' }}>
              LOBBY
            </h2>

            {/* Player list */}
            <div style={{ width: '100%', backgroundColor: '#13131f', border: '1px solid #1a1a2e', padding: '0.75rem' }}>
              <p style={labelStyle}>PLAYERS</p>
              {(serverState?.players ?? []).map(p => (
                <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.35rem 0', borderBottom: '1px solid #1a1a2e' }}>
                  <span style={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: '0.75rem', color: p.name === playerName ? '#00f5ff' : '#e5e7eb' }}>
                    {p.name}
                  </span>
                  {p.isHost && (
                    <span style={{ fontFamily: '"Press Start 2P", monospace', fontSize: '0.4rem', color: '#ef4444', border: '1px solid #ef444466', padding: '0.1rem 0.3rem' }}>
                      HOST
                    </span>
                  )}
                </div>
              ))}
              {(serverState?.players ?? []).length === 0 && (
                <p style={{ color: '#6b7280', fontFamily: '"IBM Plex Mono", monospace', fontSize: '0.7rem' }}>…</p>
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
                      onClick={() => setModeSelect(m.value)}
                      style={{
                        fontFamily: '"Press Start 2P", monospace',
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

            {/* Start button */}
            {isHost && (
              <button
                onClick={() => emit('start_game', { mode: modeSelect })}
                style={{ ...btnStyle, width: '100%' }}
              >
                START GAME
              </button>
            )}
            {!isHost && (
              <p style={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: '0.65rem', color: '#6b7280' }}>
                Waiting for host to start…
              </p>
            )}
          </div>
        )}

        {/* ══ PLAYING / GAME OVER ══ */}
        {(phase === 'playing' || (phase !== 'finished' && state.status === 'over')) && (
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', height: 'calc(100vh - 56px)', padding: '0.25rem 0' }}>

            {/* Left panel */}
            <aside className="side-panel">
              <Panel label="HOLD">
                <MiniBoard shape={state.holdShape} />
              </Panel>

              <div style={{ marginTop: '0.75rem' }}>
                <p style={labelStyle}>MODE</p>
                <p style={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: '0.6rem', color: '#a855f7', marginTop: '0.2rem' }}>
                  {gameMode.toUpperCase()}
                </p>
              </div>

              <div style={{ marginTop: '0.75rem' }}>
                <p style={labelStyle}>ROOM</p>
                <p style={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: '0.65rem', color: '#00f5ff', marginTop: '0.2rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {room}
                </p>
              </div>

              <div style={{ marginTop: '0.75rem' }}>
                <p style={labelStyle}>PLAYER</p>
                <p style={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: '0.65rem', color: '#e5e7eb', marginTop: '0.2rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {playerName}
                </p>
              </div>
            </aside>

            {/* Board column */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%' }}>
              <div className="board-inner" style={{ position: 'relative' }}>
                <Board board={state.displayBoard} shake={state.shake} />

                {/* Game-over overlay */}
                {state.status === 'over' && (
                  <div style={{
                    position: 'absolute',
                    inset: 0,
                    backgroundColor: 'rgba(10,10,15,0.82)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                  }}>
                    <p style={{ fontFamily: '"Press Start 2P", monospace', fontSize: 'clamp(0.55rem, 2vw, 0.9rem)', color: '#ef4444', textAlign: 'center', lineHeight: 1.8 }}>
                      GAME<br />OVER
                    </p>
                    <p style={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: '0.6rem', color: '#6b7280' }}>
                      waiting for others…
                    </p>
                  </div>
                )}
              </div>

              {/* Controls hint */}
              <p style={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: '0.52rem', color: '#374151', letterSpacing: '0.04em', marginTop: '0.35rem', textAlign: 'center' }}>
                ← → move · ↑/Z rotate · ↓ soft · SPACE hard · C hold
              </p>
            </div>

            {/* Right panel */}
            <aside className="side-panel">
              <Panel label="NEXT">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', alignItems: 'center' }}>
                  {[0, 1, 2].map(i => (
                    <MiniBoard key={i} shape={nextShapes[i]} />
                  ))}
                </div>
              </Panel>

              <div style={{ marginTop: '0.75rem' }}>
                <ScoreItem label="SCORE" value={String(myScore).padStart(6, '0')}  color="#00f5ff" />
              </div>
              <div style={{ marginTop: '0.5rem' }}>
                <ScoreItem label="LEVEL" value={String(state.level).padStart(2, '0')}  color="#a855f7" />
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
        )}

        {/* ══ FINISHED ══ */}
        {phase === 'finished' && (
          <div className="fade-in-up" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem', maxWidth: '22rem', width: '100%' }}>
            <h2 style={{ fontFamily: '"Press Start 2P", monospace', fontSize: '0.85rem', color: '#a855f7', letterSpacing: '0.12em' }}>
              GAME OVER
            </h2>

            <div style={{ width: '100%', backgroundColor: '#13131f', border: '1px solid #1a1a2e', padding: '0.75rem' }}>
              <p style={labelStyle}>LEADERBOARD</p>
              {leaderboard.slice(0, 10).map((entry, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.3rem 0', borderBottom: '1px solid #1a1a2e' }}>
                  <span style={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: '0.65rem', color: i === 0 ? '#eab308' : '#e5e7eb' }}>
                    {i + 1}. {entry.name}
                  </span>
                  <span style={{ fontFamily: '"Press Start 2P", monospace', fontSize: '0.5rem', color: i === 0 ? '#eab308' : '#6b7280' }}>
                    {entry.score}
                  </span>
                </div>
              ))}
            </div>

            {isHost && (
              <button onClick={() => emit('restart_game')} style={{ ...btnStyle, width: '100%' }}>
                PLAY AGAIN
              </button>
            )}
            <button onClick={() => navigate('/')} style={{ ...btnStyle, width: '100%', backgroundColor: 'transparent', color: '#6b7280', borderColor: '#1a1a2e' }}>
              LEAVE
            </button>
          </div>
        )}
      </main>

      {/* ── Chat (lobby + in-game) ── */}
      {(phase === 'waiting' || phase === 'starting' || phase === 'playing'
        || (phase !== 'finished' && state.status === 'over')) && (
        <Chat
          messages={messages}
          me={playerName}
          onSend={(text) => emit('chat_message', text)}
        />
      )}
    </div>
  )
}

// ── Sub-components ────────────────────────────────────────────────────────────

function Panel({ label, children }) {
  return (
    <div>
      <p style={labelStyle}>{label}</p>
      <div style={{
        marginTop: '0.35rem',
        backgroundColor: '#13131f',
        border: '1px solid #1a1a2e',
        padding: '0.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '3.5rem',
      }}>
        {children}
      </div>
    </div>
  )
}

function ScoreItem({ label, value, color }) {
  return (
    <div>
      <p style={labelStyle}>{label}</p>
      <p style={{ marginTop: '0.2rem', fontFamily: '"Press Start 2P", monospace', fontSize: '0.7rem', color, letterSpacing: '0.04em' }}>
        {value}
      </p>
    </div>
  )
}

const labelStyle = {
  fontFamily: '"Press Start 2P", monospace',
  fontSize: '0.45rem',
  letterSpacing: '0.18em',
  color: '#6b7280',
  lineHeight: 1,
}

const btnStyle = {
  padding: '0.75rem 1rem',
  fontFamily: '"Press Start 2P", monospace',
  fontSize: '0.6rem',
  letterSpacing: '0.18em',
  color: '#0a0a0f',
  backgroundColor: '#ef4444',
  border: '2px solid #ef4444',
  cursor: 'pointer',
}
