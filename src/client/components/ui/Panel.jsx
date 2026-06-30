import { labelStyle } from '../../styles/ui'

export default function Panel({ label, children }) {
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
