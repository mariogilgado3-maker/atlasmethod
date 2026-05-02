import { useTheme, F, SButton, SCard, SBadge } from '../components/ui'
import { IOSStatusBar } from '../ios-frame'
import { AtlasLogo } from '../components/brand'

const STATS = [
  { emoji: '🏋️', label: 'Series', value: '16' },
  { emoji: '⚡', label: 'Volumen', value: '12.4k', unit: 'kg' },
  { emoji: '⏱️', label: 'Duración', value: '52', unit: 'min' },
  { emoji: '🔥', label: 'XP ganado', value: '+340' },
]

export function CompleteScreen() {
  const { t } = useTheme()
  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', background: t.bg }}>
      <IOSStatusBar />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', overflowY: 'auto', paddingBottom: 40 }}>
        {/* Celebration visual */}
        <div style={{
          width: '100%', padding: '20px 20px 32px',
          background: `linear-gradient(180deg, ${t.flame}25 0%, transparent 100%)`,
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16,
        }}>
          <div style={{ fontSize: 80 }}>🎉</div>
          <div style={{
            fontSize: 28, fontWeight: 800, color: t.ink,
            fontFamily: F, letterSpacing: '-0.5px', textAlign: 'center',
          }}>
            ¡Entreno completado!
          </div>
          <div style={{ fontSize: 16, color: t.ink2, fontFamily: F, textAlign: 'center' }}>
            Pecho + Hombros · Día 4
          </div>
          <SBadge variant="flame" style={{ height: 30, fontSize: 14 }}>
            🔥 Racha de 47 días
          </SBadge>
        </div>

        {/* Stats grid */}
        <div style={{ width: '100%', padding: '0 20px', marginTop: -10 }}>
          <SCard padding={20}>
            <div style={{
              display: 'grid', gridTemplateColumns: '1fr 1fr',
              gap: 16,
            }}>
              {STATS.map((s, i) => (
                <div key={i} style={{
                  background: t.surface2, borderRadius: 16, padding: '14px 16px',
                }}>
                  <div style={{ fontSize: 22, marginBottom: 6 }}>{s.emoji}</div>
                  <div style={{
                    fontSize: 22, fontWeight: 800, color: t.ink,
                    fontFamily: F, letterSpacing: '-0.4px',
                  }}>
                    {s.value}
                    {s.unit && <span style={{ fontSize: 13, color: t.ink3, fontWeight: 600, marginLeft: 2 }}>{s.unit}</span>}
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: t.ink3, fontFamily: F, letterSpacing: '0.3px', textTransform: 'uppercase', marginTop: 2 }}>
                    {s.label}
                  </div>
                </div>
              ))}
            </div>
          </SCard>
        </div>

        {/* XP progress */}
        <div style={{ width: '100%', padding: '16px 20px 0' }}>
          <SCard padding={18}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: t.ink, fontFamily: F }}>Nivel 24</div>
              <div style={{ fontSize: 13, color: t.ink3, fontFamily: F }}>8.420 / 9.000 XP</div>
            </div>
            <div style={{ height: 10, borderRadius: 9999, background: t.surface2, overflow: 'hidden' }}>
              <div style={{
                height: '100%', borderRadius: 9999, width: '93%',
                background: `linear-gradient(90deg, ${t.accent}, ${t.flame})`,
              }} />
            </div>
            <div style={{ fontSize: 13, color: t.ink2, fontFamily: F, marginTop: 8, textAlign: 'center' }}>
              ¡Subiste +340 XP! Próximo nivel: 580 XP
            </div>
          </SCard>
        </div>

        {/* Achievement */}
        <div style={{ width: '100%', padding: '16px 20px 0' }}>
          <SCard padding={18} style={{
            border: `1px solid ${t.flame}40`,
            background: `linear-gradient(135deg, ${t.flameSoft}, ${t.surface})`,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{
                width: 52, height: 52, borderRadius: 14, fontSize: 28,
                background: `linear-gradient(135deg, ${t.flame}, #FF3B30)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>🏅</div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: t.flame, fontFamily: F, letterSpacing: '0.3px', marginBottom: 2 }}>
                  NUEVO LOGRO
                </div>
                <div style={{ fontSize: 17, fontWeight: 700, color: t.ink, fontFamily: F }}>
                  Semana completa
                </div>
                <div style={{ fontSize: 13, color: t.ink2, fontFamily: F }}>
                  7 días de entrenamiento seguidos
                </div>
              </div>
            </div>
          </SCard>
        </div>

        {/* CTAs */}
        <div style={{ width: '100%', padding: '24px 20px 0', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <SButton full variant="primary">Ver análisis del entreno</SButton>
          <SButton full variant="ghost">Volver al inicio</SButton>
        </div>
      </div>
    </div>
  )
}
