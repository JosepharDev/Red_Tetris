import { btnStyle, mono, display } from '../styles/ui'

export default function RejectedScreen({ reason, onBack }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <p style={{ fontFamily: display, color: '#ef4444', fontSize: '0.8rem', marginBottom: '0.75rem', lineHeight: 1.8 }}>
        JOIN<br />REJECTED
      </p>
      <p style={{ fontFamily: mono, color: '#6b7280', fontSize: '0.7rem', marginBottom: '1rem' }}>
        {reason}
      </p>
      <button onClick={onBack} style={btnStyle}>BACK</button>
    </div>
  )
}
