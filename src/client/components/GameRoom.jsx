import { useParams, useNavigate } from 'react-router-dom'
import { useGameRoom } from '../hooks/useGameRoom'
import RoomHeader from './RoomHeader'
import Lobby from './Lobby'
import PlayField from './PlayField'
import Results from './Results'
import RejectedScreen from './RejectedScreen'
import Chat from './Chat'
import { mono } from '../styles/ui'

export default function GameRoom() {
  const { room, playerName } = useParams()
  const navigate = useNavigate()

  const {
    state, phase, serverState, leaderboard, messages, rejectReason,
    modeSelect, setModeSelect, isHost, myScore, opponents, gameMode,
    startGame, restartGame, sendChat,
  } = useGameRoom(room, playerName)

  const inGame   = phase === 'playing' || (phase !== 'finished' && state.status === 'over')
  const showChat = phase === 'waiting' || phase === 'starting' || inGame

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0a0a0f', display: 'flex', flexDirection: 'column' }}>
      <RoomHeader room={room} playerName={playerName} phase={phase} />

      <main style={{ marginTop: '40px', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0.5rem' }}>
        {phase === 'connecting' && (
          <p style={{ fontFamily: mono, color: '#6b7280', fontSize: '0.8rem' }}>Connecting…</p>
        )}

        {phase === 'rejected' && (
          <RejectedScreen reason={rejectReason} onBack={() => navigate('/')} />
        )}

        {(phase === 'waiting' || phase === 'starting') && (
          <Lobby
            players={serverState?.players ?? []}
            playerName={playerName}
            isHost={isHost}
            modeSelect={modeSelect}
            onSelectMode={setModeSelect}
            onStart={startGame}
          />
        )}

        {inGame && (
          <PlayField
            state={state}
            gameMode={gameMode}
            room={room}
            playerName={playerName}
            myScore={myScore}
            opponents={opponents}
          />
        )}

        {phase === 'finished' && (
          <Results
            leaderboard={leaderboard}
            isHost={isHost}
            onRestart={restartGame}
            onLeave={() => navigate('/')}
          />
        )}
      </main>

      {showChat && (
        <Chat messages={messages} me={playerName} onSend={sendChat} />
      )}
    </div>
  )
}
