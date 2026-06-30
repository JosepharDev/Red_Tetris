import { Routes, Route } from 'react-router-dom'
import Landing from './components/Landing'
import GameRoom from './components/GameRoom'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/:room/:playerName" element={<GameRoom />} />
    </Routes>
  )
}
