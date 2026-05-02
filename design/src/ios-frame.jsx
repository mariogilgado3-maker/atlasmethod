import { useTheme, F, ThemeProvider } from './components/ui'

export function IOSGlassPill({ children, style, dark = true }) {
  const glassLight = {
    backdropFilter: 'blur(20px) saturate(160%)',
    WebkitBackdropFilter: 'blur(20px) saturate(160%)',
    border: '0.5px solid rgba(0,0,0,0.06)',
    boxShadow: '0 1px 3px rgba(0,0,0,0.07), 0 3px 10px rgba(0,0,0,0.06)',
    background: 'rgba(255,255,255,0.72)',
  }
  const glassDark = {
    backdropFilter: 'blur(20px) saturate(160%)',
    WebkitBackdropFilter: 'blur(20px) saturate(160%)',
    border: '0.5px solid rgba(255,255,255,0.15)',
    boxShadow: '0 2px 6px rgba(0,0,0,0.35), 0 6px 16px rgba(0,0,0,0.2)',
    background: 'rgba(28,28,31,0.72)',
  }
  return (
    <div style={{
      height: 44, borderRadius: 9999,
      display: 'flex', alignItems: 'center', padding: '0 16px',
      ...(dark ? glassDark : glassLight),
      ...style,
    }}>
      {children}
    </div>
  )
}

export function IOSStatusBar() {
  const { mode, t } = useTheme()
  return (
    <div style={{
      height: 54, paddingTop: 16, paddingLeft: 20, paddingRight: 20,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      position: 'relative', zIndex: 10,
    }}>
      <span style={{ fontSize: 17, fontWeight: 600, color: t.ink, fontFamily: F, letterSpacing: '-0.4px' }}>
        9:41
      </span>
      {/* Dynamic Island */}
      <div style={{
        position: 'absolute', top: 14, left: '50%', transform: 'translateX(-50%)',
        width: 120, height: 34, borderRadius: 9999,
        background: '#000',
      }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
        <SignalIcon color={t.ink} />
        <WifiIcon color={t.ink} />
        <BatteryIcon color={t.ink} />
      </div>
    </div>
  )
}

function SignalIcon({ color }) {
  return (
    <svg width="17" height="12" viewBox="0 0 17 12" fill="none">
      <rect x="0" y="7" width="3" height="5" rx="0.5" fill={color}/>
      <rect x="4.5" y="4.5" width="3" height="7.5" rx="0.5" fill={color}/>
      <rect x="9" y="2" width="3" height="10" rx="0.5" fill={color}/>
      <rect x="13.5" y="0" width="3" height="12" rx="0.5" fill={color}/>
    </svg>
  )
}

function WifiIcon({ color }) {
  return (
    <svg width="16" height="12" viewBox="0 0 16 12" fill="none">
      <path d="M8 9.5a1.5 1.5 0 100 3 1.5 1.5 0 000-3z" fill={color}/>
      <path d="M4 7a5.7 5.7 0 018 0" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M1 4a9.5 9.5 0 0114 0" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  )
}

function BatteryIcon({ color }) {
  return (
    <svg width="25" height="12" viewBox="0 0 25 12" fill="none">
      <rect x="0.5" y="0.5" width="20" height="11" rx="3.5" stroke={color} strokeOpacity="0.35"/>
      <rect x="2" y="2" width="15" height="8" rx="2" fill={color}/>
      <path d="M22 4v4a2 2 0 000-4z" fill={color} fillOpacity="0.4"/>
    </svg>
  )
}

export function IOSNavBar({ title, leftSlot, rightSlot }) {
  const { t } = useTheme()
  return (
    <div style={{
      height: 44, display: 'flex', alignItems: 'center',
      padding: '0 16px', position: 'relative',
    }}>
      <div style={{ flex: 1 }}>{leftSlot}</div>
      <span style={{
        fontSize: 17, fontWeight: 800, color: t.ink,
        fontFamily: F, letterSpacing: '-0.5px',
        position: 'absolute', left: '50%', transform: 'translateX(-50%)',
      }}>
        {title}
      </span>
      <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end' }}>{rightSlot}</div>
    </div>
  )
}

export function IOSDevice({ children, mode = 'dark', label, style }) {
  const BEZEL = 14
  const W = 402
  const H = 874
  const frameColor = mode === 'dark' ? '#1A1A1C' : '#E8E8EA'
  const btnColor   = mode === 'dark' ? '#2A2A2C' : '#D0D0D4'
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
      {/* Phone shell */}
      <div style={{
        position: 'relative',
        width: W + BEZEL * 2,
        height: H + BEZEL * 2,
        borderRadius: 56,
        background: frameColor,
        boxShadow: mode === 'dark'
          ? '0 0 0 1.5px rgba(255,255,255,0.06), 0 32px 80px rgba(0,0,0,0.7), 0 8px 24px rgba(0,0,0,0.5)'
          : '0 0 0 1.5px rgba(0,0,0,0.12), 0 32px 80px rgba(0,0,0,0.25), 0 8px 24px rgba(0,0,0,0.12)',
        ...style,
      }}>
        {/* Side buttons */}
        <div style={{ position: 'absolute', left: -4, top: 100, width: 4, height: 32, borderRadius: '2px 0 0 2px', background: btnColor }} />
        <div style={{ position: 'absolute', left: -4, top: 148, width: 4, height: 60, borderRadius: '2px 0 0 2px', background: btnColor }} />
        <div style={{ position: 'absolute', left: -4, top: 220, width: 4, height: 60, borderRadius: '2px 0 0 2px', background: btnColor }} />
        <div style={{ position: 'absolute', right: -4, top: 160, width: 4, height: 80, borderRadius: '0 2px 2px 0', background: btnColor }} />
        {/* Screen */}
        <div style={{
          position: 'absolute', inset: BEZEL,
          borderRadius: 42, overflow: 'hidden',
          width: W, height: H,
        }}>
          <ThemeProvider mode={mode}>
            <ScreenShell>{children}</ScreenShell>
          </ThemeProvider>
        </div>
      </div>
      {/* Label */}
      {label && (
        <span style={{
          fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.35)',
          fontFamily: F, letterSpacing: '0.8px', textTransform: 'uppercase',
        }}>
          {label}
        </span>
      )}
    </div>
  )
}

function ScreenShell({ children }) {
  const { t } = useTheme()
  return (
    <div style={{
      width: '100%', height: '100%',
      background: t.bg, position: 'relative',
      overflow: 'hidden', fontFamily: F,
    }}>
      {children}
    </div>
  )
}
