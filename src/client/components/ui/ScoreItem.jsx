import { labelStyle, display } from '../../styles/ui'

export default function ScoreItem({ label, value, color }) {
  return (
    <div>
      <p style={labelStyle}>{label}</p>
      <p style={{ marginTop: '0.2rem', fontFamily: display, fontSize: '0.7rem', color, letterSpacing: '0.04em' }}>
        {value}
      </p>
    </div>
  )
}
