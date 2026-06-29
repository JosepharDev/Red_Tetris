import { useEffect, useRef, useCallback } from 'react'
import { io } from 'socket.io-client'

export function useSocket(room, playerName, handlers) {
  const socketRef = useRef(null)
  const hRef = useRef(handlers)
  hRef.current = handlers

  useEffect(() => {
    const socket = io(window.location.origin, { query: { room, playerName } })
    socketRef.current = socket

    socket.on('game_update',    s  => hRef.current.onGameUpdate?.(s))
    socket.on('game_started',   () => hRef.current.onGameStarted?.())
    socket.on('next_pieces',    d  => hRef.current.onNextPieces?.(d.pieces))
    socket.on('penalty_lines',  n  => hRef.current.onPenalty?.(n))
    socket.on('game_finished',  d  => hRef.current.onFinished?.(d))
    socket.on('game_restarted', () => hRef.current.onRestarted?.())
    socket.on('speed_update',   s  => hRef.current.onSpeed?.(s))
    socket.on('leaderboard',    lb => hRef.current.onLeaderboard?.(lb))
    socket.on('game_full',      () => hRef.current.onFull?.())

    return () => socket.disconnect()
  }, [room, playerName])

  const emit = useCallback((event, data) => {
    socketRef.current?.emit(event, data)
  }, [])

  return { emit }
}
