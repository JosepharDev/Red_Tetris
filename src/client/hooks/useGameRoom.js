import { useEffect, useRef, useState, useCallback } from 'react'
import { useTetris } from './useTetris'
import { useSocket } from './useSocket'

// Orchestration layer: owns the room phase machine, socket handlers, and the
// effects that bridge the local Tetris engine to the server. Views stay
// presentational; they receive everything they need from here.
export function useGameRoom(room, playerName) {
  const [serverState, setServerState] = useState(null)
  const [leaderboard, setLeaderboard] = useState([])
  const [phase, setPhase]             = useState('connecting')
  const [modeSelect, setModeSelect]   = useState('normal')
  const [messages, setMessages]       = useState([])
  const [rejectReason, setRejectReason] = useState('')

  const phaseRef = useRef('connecting')
  const serverStateRef = useRef(null)
  const setGamePhase = useCallback((p) => { phaseRef.current = p; setPhase(p) }, [])

  const tetris = useTetris()
  const tetrisRef = useRef(tetris)
  tetrisRef.current = tetris

  const { emit } = useSocket(room, playerName, {
    onGameUpdate: (s) => {
      setServerState(s)
      serverStateRef.current = s
      if (s.status === 'WAITING' && phaseRef.current !== 'playing' && phaseRef.current !== 'finished') {
        setGamePhase('waiting')
      }
    },
    onGameStarted: () => setGamePhase('starting'),
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

  const { state } = tetris

  // After a piece locks: report board, request more pieces, spawn next.
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
  }, [state.needsSpawn]) // eslint-disable-line react-hooks/exhaustive-deps

  // Report game over.
  useEffect(() => {
    if (state.status === 'over') emitRef.current('game_over')
  }, [state.status])

  // Keyboard input (ignored while typing in any text field).
  useEffect(() => {
    if (state.status !== 'playing') return
    const handler = (e) => {
      const tag = e.target?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || e.target?.isContentEditable) return
      switch (e.code) {
        case 'ArrowLeft':  e.preventDefault(); tetris.moveLeft(); break
        case 'ArrowRight': e.preventDefault(); tetris.moveRight(); break
        case 'ArrowDown':  e.preventDefault(); tetris.softDrop(); break
        case 'ArrowUp':
        case 'KeyZ':       if (e.repeat) return; e.preventDefault(); tetris.rotate(); break
        case 'Space':      if (e.repeat) return; e.preventDefault(); tetris.hardDrop(); break
        case 'KeyC':
        case 'ShiftLeft':
        case 'ShiftRight': if (e.repeat) return; e.preventDefault(); tetris.hold(); break
        default: break
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [state.status, tetris.moveLeft, tetris.moveRight, tetris.softDrop, tetris.rotate, tetris.hardDrop, tetris.hold])

  // Derived view data.
  const me        = serverState?.players?.find(p => p.name === playerName)
  const isHost    = me?.isHost ?? false
  const myScore   = me?.score ?? 0
  const opponents = serverState?.players?.filter(p => p.name !== playerName) ?? []
  const gameMode  = serverState?.mode ?? 'normal'

  const startGame   = useCallback(() => emitRef.current('start_game', { mode: modeSelect }), [modeSelect])
  const restartGame = useCallback(() => emitRef.current('restart_game'), [])
  const sendChat    = useCallback((text) => emitRef.current('chat_message', text), [])

  return {
    state, phase, serverState, leaderboard, messages, rejectReason,
    modeSelect, setModeSelect,
    isHost, myScore, opponents, gameMode,
    startGame, restartGame, sendChat,
  }
}
