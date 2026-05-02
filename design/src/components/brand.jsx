import { useTheme, F } from './ui'

export function AtlasMark({ size = 32, color }) {
  const { t } = useTheme()
  const c = color || t.ink
  const sw = size * 3.5 / 44
  return (
    <svg width={size} height={size} viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Left meridian leg */}
      <path d="M 5 40 C 1 26 10 12 22 4" stroke={c} strokeWidth={sw} strokeLinecap="round"/>
      {/* Right meridian leg */}
      <path d="M 39 40 C 43 26 34 12 22 4" stroke={c} strokeWidth={sw} strokeLinecap="round"/>
      {/* Latitude crossbar */}
      <path d="M 13 27 Q 22 22 31 27" stroke={c} strokeWidth={sw} strokeLinecap="round"/>
    </svg>
  )
}

export function AtlasWordmark({ size = 18, color }) {
  const { t } = useTheme()
  const c = color || t.ink
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', gap: 5 }}>
      <span style={{
        fontSize: size, fontWeight: 800, letterSpacing: '-0.03em',
        color: c, fontFamily: F, lineHeight: 1,
      }}>
        Atlas
      </span>
      <span style={{
        fontSize: size, fontWeight: 500, letterSpacing: '-0.02em',
        color: c, opacity: 0.6, fontFamily: F, lineHeight: 1,
      }}>
        Method
      </span>
    </div>
  )
}

export function AtlasLogo({ size = 28, gap = 10 }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap }}>
      <AtlasMark size={size} />
      <AtlasWordmark size={size * 0.64} />
    </div>
  )
}
