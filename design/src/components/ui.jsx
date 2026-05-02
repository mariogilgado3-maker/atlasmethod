import { createContext, useContext } from 'react'

export const tokens = {
  light: {
    bg:           '#F2F2F4',
    surface:      '#FFFFFF',
    surface2:     '#F7F7F8',
    ink:          '#0A0A0B',
    ink2:         '#5A5A60',
    ink3:         '#A0A0A8',
    accent:       '#0A84FF',
    accentInk:    '#FFFFFF',
    flame:        '#FF7A45',
    flameSoft:    '#FFE8DD',
    danger:       '#FF3B30',
    border:       'rgba(10,10,11,0.08)',
    borderStrong: 'rgba(10,10,11,0.14)',
  },
  dark: {
    bg:           '#000000',
    surface:      '#141416',
    surface2:     '#1C1C1F',
    ink:          '#FFFFFF',
    ink2:         '#A8A8AE',
    ink3:         '#5A5A60',
    accent:       '#0A84FF',
    accentInk:    '#FFFFFF',
    flame:        '#FF8E5C',
    flameSoft:    'rgba(255,142,92,0.16)',
    danger:       '#FF453A',
    border:       'rgba(255,255,255,0.08)',
    borderStrong: 'rgba(255,255,255,0.14)',
  },
}

export const F = "Inter, -apple-system, system-ui, sans-serif"

const ThemeCtx = createContext('dark')

export function ThemeProvider({ mode = 'dark', children }) {
  return <ThemeCtx.Provider value={mode}>{children}</ThemeCtx.Provider>
}

export function useTheme() {
  const mode = useContext(ThemeCtx)
  return { mode, t: tokens[mode] }
}

export function SButton({ variant = 'primary', children, style, full, ...props }) {
  const { t } = useTheme()
  const base = {
    height: 52, borderRadius: 9999,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 15, fontWeight: 600, fontFamily: F,
    letterSpacing: '-0.2px', cursor: 'pointer', border: 'none', outline: 'none',
    padding: '0 24px', width: full ? '100%' : undefined, transition: 'opacity 0.15s',
  }
  const v = {
    primary: {
      background: t.ink, color: t.bg,
      boxShadow: '0 1px 0 rgba(0,0,0,0.08), 0 8px 20px -8px rgba(10,10,11,0.4)',
    },
    accent: {
      background: t.accent, color: '#fff',
      boxShadow: '0 1px 0 rgba(0,0,0,0.06), 0 8px 20px -8px rgba(10,132,255,0.6)',
    },
    ghost: {
      background: 'transparent', color: t.ink,
      border: `1.5px solid ${t.borderStrong}`,
    },
    danger: {
      background: t.danger, color: '#fff',
      boxShadow: '0 1px 0 rgba(0,0,0,0.08), 0 8px 20px -8px rgba(255,59,48,0.4)',
    },
  }
  return <button style={{ ...base, ...v[variant], ...style }} {...props}>{children}</button>
}

export function SCard({ children, style, padding = 20 }) {
  const { t } = useTheme()
  return (
    <div style={{ background: t.surface, borderRadius: 24, padding, ...style }}>
      {children}
    </div>
  )
}

export function SBadge({ variant = 'flame', children, style }) {
  const { t } = useTheme()
  const v = {
    flame:   { background: t.flameSoft, color: t.flame },
    accent:  { background: 'rgba(10,132,255,0.15)', color: t.accent },
    surface: { background: t.surface2, color: t.ink2 },
    danger:  { background: 'rgba(255,59,48,0.12)', color: t.danger },
    ink:     { background: t.surface2, color: t.ink },
  }
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      height: 26, borderRadius: 9999, padding: '0 10px',
      fontSize: 12, fontWeight: 700, letterSpacing: '0.4px', fontFamily: F,
      ...v[variant], ...style,
    }}>
      {children}
    </span>
  )
}

export function SProgressBar({ value = 0, color, style }) {
  const { t } = useTheme()
  return (
    <div style={{
      height: 6, borderRadius: 9999, background: t.border, overflow: 'hidden', ...style,
    }}>
      <div style={{
        height: '100%', borderRadius: 9999,
        width: `${Math.min(100, Math.max(0, value))}%`,
        background: color || t.accent,
        transition: 'width 0.3s ease',
      }} />
    </div>
  )
}

export function SDivider({ indent = 0, style }) {
  const { t } = useTheme()
  return <div style={{ height: 0.5, background: t.border, marginLeft: indent, ...style }} />
}

export const TAB_ITEMS = [
  { id: 'home',    label: 'Hoy',       icon: '⊙' },
  { id: 'aula',    label: 'Aula',      icon: '◎' },
  { id: 'builder', label: 'Generador', icon: '⚡' },
  { id: 'league',  label: 'Liga',      icon: '◈' },
  { id: 'profile', label: 'Perfil',    icon: '○' },
  { id: 'shop',    label: 'Tienda',    icon: '◇' },
]

export function STabBar({ active = 'home' }) {
  const { t } = useTheme()
  return (
    <div style={{
      position: 'absolute', bottom: 0, left: 0, right: 0,
      height: 83, background: t.surface,
      borderTop: `0.5px solid ${t.border}`,
      display: 'flex', alignItems: 'flex-start', paddingTop: 10,
    }}>
      {TAB_ITEMS.map(item => (
        <button key={item.id} style={{
          flex: 1, display: 'flex', flexDirection: 'column',
          alignItems: 'center', gap: 3,
          background: 'none', border: 'none', cursor: 'pointer', padding: 0,
        }}>
          <TabIcon name={item.id} active={item.id === active} size={24} />
          <span style={{
            fontSize: 11, fontWeight: 600, letterSpacing: '0.1px', fontFamily: F,
            color: item.id === active ? t.ink : t.ink3,
          }}>
            {item.label}
          </span>
        </button>
      ))}
    </div>
  )
}

function TabIcon({ name, active, size = 24 }) {
  const { t } = useTheme()
  const color = active ? t.ink : t.ink3
  const sw = 1.6
  const icons = {
    home: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <path d="M3 10.5L12 3l9 7.5V20a1 1 0 01-1 1H15v-5h-6v5H4a1 1 0 01-1-1v-9.5z"
          stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"
          fill={active ? color : 'none'} fillOpacity={active ? 0.12 : 0}
        />
      </svg>
    ),
    aula: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <path d="M12 3L2 8l10 5 10-5-10-5z" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M6 10.5v5a6 6 0 0012 0v-5" stroke={color} strokeWidth={sw} strokeLinecap="round"/>
        <path d="M20 8v6" stroke={color} strokeWidth={sw} strokeLinecap="round"/>
      </svg>
    ),
    builder: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <path d="M13 2L4 14h7l-2 8 11-12h-7l2-8z"
          stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"
          fill={active ? color : 'none'} fillOpacity={active ? 0.12 : 0}
        />
      </svg>
    ),
    league: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <path d="M6 4h12v7a6 6 0 01-12 0V4z" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M6 4H3v4a3 3 0 003 3M18 4h3v4a3 3 0 01-3 3" stroke={color} strokeWidth={sw} strokeLinecap="round"/>
        <path d="M9 17h6M12 17v3M8 21h8" stroke={color} strokeWidth={sw} strokeLinecap="round"/>
      </svg>
    ),
    profile: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="8" r="4" stroke={color} strokeWidth={sw}
          fill={active ? color : 'none'} fillOpacity={active ? 0.12 : 0}
        />
        <path d="M4 21a8 8 0 0116 0" stroke={color} strokeWidth={sw} strokeLinecap="round"/>
      </svg>
    ),
    shop: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <path d="M6 2L3 7v14a1 1 0 001 1h16a1 1 0 001-1V7L18 2H6z" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M3 7h18M16 11a4 4 0 01-8 0" stroke={color} strokeWidth={sw} strokeLinecap="round"/>
      </svg>
    ),
  }
  return icons[name] || null
}
