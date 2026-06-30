import { useState, useEffect, useRef } from 'react'

// receives messages + an onSend callback, owns only its draft input.
export default function Chat({ messages = [], onSend, me }) {
  const [open, setOpen] = useState(true)
  const [text, setText] = useState('')
  const endRef = useRef(null)

  // Keep newest message in view .
  useEffect(() => {
    if (open) endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, open])

  const submit = (e) => {
    e.preventDefault()
    const t = text.trim()
    if (!t) return
    onSend(t)
    setText('')
  }

  return (
    <div style={{
      position: 'fixed',
      right: '0.75rem',
      bottom: '0.75rem',
      width: '15rem',
      maxWidth: 'calc(100vw - 1.5rem)',
      zIndex: 20,
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: '#13131f',
      border: '1px solid #1a1a2e',
      boxShadow: '0 0 24px rgba(0,0,0,0.5)',
    }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontFamily: '"Press Start 2P", monospace',
          fontSize: '0.45rem',
          letterSpacing: '0.18em',
          color: '#6b7280',
          backgroundColor: 'transparent',
          border: 'none',
          borderBottom: open ? '1px solid #1a1a2e' : 'none',
          padding: '0.5rem',
          cursor: 'pointer',
        }}
      >
        <span>CHAT</span>
        <span>{open ? '▾' : '▸'}</span>
      </button>

      {open && (
        <>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.35rem',
            height: '11rem',
            overflowY: 'auto',
            padding: '0.5rem',
          }}>
            {messages.length === 0 && (
              <span style={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: '0.6rem', color: '#374151' }}>
                no messages yet
              </span>
            )}
            {messages.map((m, i) => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{
                  fontFamily: '"IBM Plex Mono", monospace',
                  fontSize: '0.5rem',
                  color: m.name === me ? '#00f5ff' : '#a855f7',
                }}>
                  {m.name}
                </span>
                <span style={{
                  fontFamily: '"IBM Plex Mono", monospace',
                  fontSize: '0.7rem',
                  color: '#e5e7eb',
                  wordBreak: 'break-word',
                }}>
                  {m.text}
                </span>
              </div>
            ))}
            <div ref={endRef} />
          </div>

          <form onSubmit={submit} style={{
            display: 'flex',
            gap: '0.35rem',
            padding: '0.5rem',
            borderTop: '1px solid #1a1a2e',
          }}>
            <input
              value={text}
              onChange={e => setText(e.target.value)}
              maxLength={200}
              placeholder="message…"
              autoComplete="off"
              style={{
                flex: 1,
                minWidth: 0,
                fontFamily: '"IBM Plex Mono", monospace',
                fontSize: '0.75rem',
                color: '#e5e7eb',
                backgroundColor: '#0a0a0f',
                border: '1px solid #1a1a2e',
                padding: '0.4rem 0.5rem',
              }}
            />
            <button type="submit" style={{
              fontFamily: '"Press Start 2P", monospace',
              fontSize: '0.55rem',
              color: '#0a0a0f',
              backgroundColor: '#ef4444',
              border: 'none',
              padding: '0 0.6rem',
              cursor: 'pointer',
            }}>
              ▶
            </button>
          </form>
        </>
      )}
    </div>
  )
}
