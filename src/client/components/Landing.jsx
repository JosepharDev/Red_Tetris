import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const VALID = /^[a-zA-Z0-9_-]+$/

export default function Landing() {
  const navigate = useNavigate()
  const [room, setRoom]   = useState('')
  const [name, setName]   = useState('')
  const [error, setError] = useState('')

  const handleJoin = (e) => {
    e.preventDefault()
    const r = room.trim()
    const n = name.trim()
    if (!r || !n)                      return setError('Both fields required.')
    if (!VALID.test(r) || !VALID.test(n)) return setError('Letters, numbers, - and _ only.')
    navigate(`/${r}/${n}`)
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#0a0a0f',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background dot grid */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: [
            'linear-gradient(#1a1a2e 1px, transparent 1px)',
            'linear-gradient(90deg, #1a1a2e 1px, transparent 1px)',
          ].join(','),
          backgroundSize: '40px 40px',
          opacity: 0.45,
        }}
      />

      {/* Vignette */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(ellipse at center, transparent 40%, #0a0a0f 90%)',
        }}
      />

      {/* Content */}
      <div
        className="fade-in-up"
        style={{
          position: 'relative',
          zIndex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '2.5rem',
        }}
      >
        {/* Title */}
        <div style={{ textAlign: 'center' }}>
          <h1
            className="title-glow"
            style={{
              fontFamily: '"Press Start 2P", monospace',
              fontSize: 'clamp(1.8rem, 5vw, 3.2rem)',
              lineHeight: 1.3,
              letterSpacing: '0.06em',
              color: '#ef4444',
            }}
          >
            RED
          </h1>
          <h1
            style={{
              fontFamily: '"Press Start 2P", monospace',
              fontSize: 'clamp(1.8rem, 5vw, 3.2rem)',
              lineHeight: 1.3,
              letterSpacing: '0.06em',
              color: '#e5e7eb',
              textShadow: '0 0 30px rgba(229,231,235,0.15)',
            }}
          >
            TETRIS
          </h1>
          <p
            style={{
              marginTop: '0.75rem',
              fontFamily: '"IBM Plex Mono", monospace',
              fontSize: '0.65rem',
              letterSpacing: '0.25em',
              color: '#6b7280',
            }}
          >
            NETWORKED · MULTIPLAYER
          </p>
        </div>

        {/* Join form */}
        <form
          onSubmit={handleJoin}
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            width: '18rem',
          }}
        >
          <InputField
            label="ROOM"
            value={room}
            onChange={setRoom}
            placeholder="e.g. room42"
            autoFocus
          />
          <InputField
            label="PLAYER"
            value={name}
            onChange={setName}
            placeholder="e.g. pelican"
          />

          {error && (
            <p
              style={{
                fontFamily: '"IBM Plex Mono", monospace',
                fontSize: '0.7rem',
                color: '#ef4444',
                textAlign: 'center',
              }}
            >
              {error}
            </p>
          )}

          <JoinButton />
        </form>

        {/* URL hint */}
        <p
          style={{
            fontFamily: '"IBM Plex Mono", monospace',
            fontSize: '0.6rem',
            color: '#6b7280',
            letterSpacing: '0.1em',
            opacity: 0.55,
          }}
        >
          or navigate to /room/playername directly
        </p>
      </div>
    </div>
  )
}

function InputField({ label, value, onChange, placeholder, autoFocus }) {
  const [focused, setFocused] = useState(false)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
      <label
        style={{
          fontFamily: '"Press Start 2P", monospace',
          fontSize: '0.55rem',
          letterSpacing: '0.2em',
          color: '#6b7280',
        }}
      >
        {label}
      </label>
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        maxLength={20}
        autoComplete="off"
        spellCheck={false}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          fontFamily: '"IBM Plex Mono", monospace',
          fontSize: '0.9rem',
          color: '#e5e7eb',
          backgroundColor: '#13131f',
          border: `1px solid ${focused ? '#ef4444' : '#1a1a2e'}`,
          boxShadow: focused ? '0 0 12px rgba(239,68,68,0.25)' : 'none',
          padding: '0.625rem 0.75rem',
          transition: 'border-color 0.15s, box-shadow 0.15s',
        }}
      />
    </div>
  )
}

function JoinButton() {
  const [hover, setHover] = useState(false)
  return (
    <button
      type="submit"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        marginTop: '0.5rem',
        padding: '0.85rem 1rem',
        fontFamily: '"Press Start 2P", monospace',
        fontSize: '0.65rem',
        letterSpacing: '0.22em',
        color: hover ? '#ef4444' : '#0a0a0f',
        backgroundColor: hover ? 'transparent' : '#ef4444',
        border: '2px solid #ef4444',
        boxShadow: hover ? '0 0 24px rgba(239,68,68,0.35)' : 'none',
        cursor: 'pointer',
        transition: 'background-color 0.15s, color 0.15s, box-shadow 0.15s',
      }}
    >
      JOIN GAME
    </button>
  )
}
