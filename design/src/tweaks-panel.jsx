import { useState } from 'react'
import { F } from './components/ui'

export function TweaksPanel({ mode, setMode }) {
  const [open, setOpen] = useState(true)
  const dark = mode === 'dark'

  return (
    <div style={{
      position: 'fixed', bottom: 28, right: 24, zIndex: 1000,
      display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8,
    }}>
      {open && (
        <div style={{
          background: 'rgba(22,22,26,0.92)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '0.5px solid rgba(255,255,255,0.1)',
          borderRadius: 18,
          padding: '14px 16px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
          minWidth: 180,
        }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.4)', fontFamily: F, letterSpacing: '0.8px', textTransform: 'uppercase', marginBottom: 12 }}>
            Ajustes
          </div>

          {/* Theme toggle */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.8)', fontFamily: F }}>
              {dark ? '🌙 Oscuro' : '☀️ Claro'}
            </span>
            <button onClick={() => setMode(dark ? 'light' : 'dark')} style={{
              width: 46, height: 26, borderRadius: 9999, border: 'none', cursor: 'pointer',
              background: dark ? '#0A84FF' : 'rgba(255,255,255,0.2)',
              position: 'relative', transition: 'background 0.2s',
            }}>
              <div style={{
                position: 'absolute', top: 3, left: dark ? 22 : 3,
                width: 20, height: 20, borderRadius: 9999,
                background: '#fff', transition: 'left 0.2s',
                boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
              }} />
            </button>
          </div>

          <div style={{ height: 0.5, background: 'rgba(255,255,255,0.08)', margin: '12px 0' }} />

          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', fontFamily: F, textAlign: 'center' }}>
            Atlas Method — Design Preview
          </div>
        </div>
      )}

      <button onClick={() => setOpen(!open)} style={{
        width: 44, height: 44, borderRadius: 9999, cursor: 'pointer',
        background: 'rgba(22,22,26,0.92)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '0.5px solid rgba(255,255,255,0.1)',
        boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
        fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {open ? '✕' : '⚙️'}
      </button>
    </div>
  )
}
