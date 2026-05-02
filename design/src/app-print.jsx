import { useState } from 'react'
import { IOSDevice } from './ios-frame'
import { TweaksPanel } from './tweaks-panel'
import { AtlasMark, AtlasWordmark } from './components/brand'
import { tokens, ThemeProvider, F } from './components/ui'
import { HomeScreen } from './screens/home'
import { AulaScreen } from './screens/aula'
import { LessonScreen } from './screens/lesson'
import { CompleteScreen } from './screens/complete'
import { BuilderScreen } from './screens/builder'
import { LeaderboardScreen } from './screens/leaderboard'
import { ProfileScreen } from './screens/profile'
import { ShopScreen } from './screens/shop'

const SCALE = 0.72
const DEVICE_W = 402
const DEVICE_H = 874
const FRAME_W = (402 + 28) * SCALE
const FRAME_H = (874 + 28) * SCALE

const SCREENS = [
  { id: 'home',        label: 'Hoy',        component: HomeScreen },
  { id: 'aula',        label: 'Aula Virtual', component: AulaScreen },
  { id: 'lesson',      label: 'Lección',    component: LessonScreen },
  { id: 'complete',    label: 'Completado', component: CompleteScreen },
  { id: 'builder',     label: 'Generador',  component: BuilderScreen },
  { id: 'leaderboard', label: 'Liga',       component: LeaderboardScreen },
  { id: 'profile',     label: 'Perfil',     component: ProfileScreen },
  { id: 'shop',        label: 'Tienda',     component: ShopScreen },
]

export default function PrintApp() {
  const [mode, setMode] = useState('dark')
  const t = tokens.dark

  return (
    <div style={{
      minHeight: '100vh', background: '#060608',
      padding: '48px 48px 80px', fontFamily: F,
    }}>
      {/* Brand header */}
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14,
        marginBottom: 56,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <ThemeProvider mode="dark">
            <AtlasMark size={52} color="#fff" />
          </ThemeProvider>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
            <span style={{ fontSize: 38, fontWeight: 800, color: '#fff', letterSpacing: '-0.04em', fontFamily: F }}>
              Atlas
            </span>
            <span style={{ fontSize: 38, fontWeight: 500, color: 'rgba(255,255,255,0.5)', letterSpacing: '-0.03em', fontFamily: F }}>
              Method
            </span>
          </div>
        </div>
        <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.35)', fontFamily: F, letterSpacing: '0.2px' }}>
          De la experiencia al método científico
        </p>
        <div style={{ display: 'flex', gap: 12, marginTop: 4 }}>
          {['iOS 26', 'React', 'Liquid Glass', 'Inter'].map(tag => (
            <span key={tag} style={{
              fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.3)',
              border: '0.5px solid rgba(255,255,255,0.1)',
              borderRadius: 9999, padding: '4px 10px', fontFamily: F, letterSpacing: '0.5px',
            }}>{tag}</span>
          ))}
        </div>
      </div>

      {/* Screen grid — row 1 */}
      <div style={{
        display: 'flex', gap: 32, justifyContent: 'center',
        marginBottom: 40, flexWrap: 'wrap',
      }}>
        {SCREENS.slice(0, 4).map(({ id, label, component: Screen }) => (
          <PrintFrame key={id} label={label}>
            <IOSDevice mode={mode}>
              <Screen />
            </IOSDevice>
          </PrintFrame>
        ))}
      </div>

      {/* Screen grid — row 2 */}
      <div style={{
        display: 'flex', gap: 32, justifyContent: 'center',
        flexWrap: 'wrap',
      }}>
        {SCREENS.slice(4).map(({ id, label, component: Screen }) => (
          <PrintFrame key={id} label={label}>
            <IOSDevice mode={mode}>
              <Screen />
            </IOSDevice>
          </PrintFrame>
        ))}
      </div>

      <TweaksPanel mode={mode} setMode={setMode} />
    </div>
  )
}

function PrintFrame({ children, label }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14,
      width: FRAME_W,
    }}>
      <div style={{ width: FRAME_W, height: FRAME_H, overflow: 'hidden', position: 'relative' }}>
        <div style={{ transformOrigin: 'top left', transform: `scale(${SCALE})`, width: DEVICE_W + 28, height: DEVICE_H + 28 }}>
          {children}
        </div>
      </div>
      <span style={{
        fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.3)',
        fontFamily: F, letterSpacing: '0.8px', textTransform: 'uppercase',
      }}>
        {label}
      </span>
    </div>
  )
}
