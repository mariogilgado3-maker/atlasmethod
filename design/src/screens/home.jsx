import { useTheme, F, SButton, SCard, SBadge, STabBar, SDivider } from '../components/ui'
import { AtlasLogo } from '../components/brand'
import { IOSStatusBar } from '../ios-frame'

const STREAK = 47
const XP = 8420
const GEMS = 1240
const HEARTS = 5

const WEEK_DAYS = ['L', 'M', 'X', 'J', 'V', 'S', 'D']
const COMPLETED = [0, 1, 2]

const TODAY_EXERCISES = ['Press banca', 'Press militar', 'Aperturas', 'Tríceps en polea']

const METRICS = [
  { label: 'Volumen', value: '12.400', unit: 'kg' },
  { label: 'Tiempo', value: '52', unit: 'min' },
  { label: 'Intensidad', value: 'Alta', unit: '' },
]

export function HomeScreen() {
  const { t } = useTheme()
  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', background: t.bg }}>
      <IOSStatusBar />
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '4px 20px 12px',
      }}>
        <AtlasLogo size={28} gap={10} />
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <StatPill emoji="🔥" value={STREAK} color={t.flame} bg={t.flameSoft} />
          <StatPill emoji="⚡" value={`${(XP/1000).toFixed(1)}k`} color={t.accent} bg="rgba(10,132,255,0.12)" />
          <StatPill emoji="💎" value={GEMS} color="#AF52DE" bg="rgba(175,82,222,0.12)" />
          <HeartBar count={HEARTS} />
        </div>
      </div>

      {/* Scrollable content */}
      <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 100 }}>
        {/* Week calendar */}
        <div style={{ padding: '0 20px 20px' }}>
          <SectionLabel>Tu semana</SectionLabel>
          <div style={{
            display: 'flex', justifyContent: 'space-between',
            background: t.surface, borderRadius: 20, padding: '14px 16px',
          }}>
            {WEEK_DAYS.map((day, i) => {
              const done = COMPLETED.includes(i)
              const today = i === 3
              return (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                  <span style={{
                    fontSize: 12, fontWeight: 600, color: t.ink3, fontFamily: F,
                    letterSpacing: '0.2px',
                  }}>{day}</span>
                  <div style={{
                    width: 36, height: 36, borderRadius: 9999,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: done ? t.flame : today ? `${t.accent}20` : t.surface2,
                    border: today && !done ? `1.5px solid ${t.accent}` : 'none',
                  }}>
                    {done
                      ? <span style={{ fontSize: 16 }}>✓</span>
                      : <span style={{ fontSize: 12, fontWeight: 700, color: today ? t.accent : t.ink3, fontFamily: F }}>
                          {i + 1}
                        </span>
                    }
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Today's workout card */}
        <div style={{ padding: '0 20px 16px' }}>
          <SCard padding={0} style={{ overflow: 'hidden' }}>
            {/* Card header */}
            <div style={{
              background: `linear-gradient(135deg, ${t.accent}18 0%, ${t.flame}12 100%)`,
              padding: '18px 20px 14px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                <SBadge variant="accent">Día 4 · Pecho + Hombros</SBadge>
                <SBadge variant="surface">Jueves</SBadge>
              </div>
              <div style={{
                fontSize: 22, fontWeight: 700, color: t.ink,
                fontFamily: F, letterSpacing: '-0.4px',
              }}>
                Entrenamiento de hoy
              </div>
            </div>
            {/* Exercises */}
            <div style={{ padding: '10px 0' }}>
              {TODAY_EXERCISES.map((ex, i) => (
                <div key={i}>
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '10px 20px',
                  }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: 9999,
                      background: t.surface2,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 13, fontWeight: 700, color: t.ink2, fontFamily: F,
                    }}>
                      {i + 1}
                    </div>
                    <span style={{ fontSize: 16, fontWeight: 500, color: t.ink, fontFamily: F, flex: 1 }}>
                      {ex}
                    </span>
                    <span style={{ fontSize: 13, color: t.ink3, fontFamily: F }}>4×8</span>
                  </div>
                  {i < TODAY_EXERCISES.length - 1 && <SDivider indent={64} />}
                </div>
              ))}
            </div>
            {/* CTA */}
            <div style={{ padding: '4px 20px 20px' }}>
              <SButton full variant="primary" style={{ height: 52 }}>
                Empezar entrenamiento →
              </SButton>
            </div>
          </SCard>
        </div>

        {/* Metrics */}
        <div style={{ padding: '0 20px 16px' }}>
          <SCard padding={16}>
            <div style={{ display: 'flex', justifyContent: 'space-around' }}>
              {METRICS.map((m, i) => (
                <div key={i} style={{ textAlign: 'center', flex: 1 }}>
                  <div style={{
                    fontSize: 20, fontWeight: 700, color: t.ink,
                    fontFamily: F, letterSpacing: '-0.3px',
                  }}>
                    {m.value}
                    <span style={{ fontSize: 12, fontWeight: 600, color: t.ink3, marginLeft: 2 }}>
                      {m.unit}
                    </span>
                  </div>
                  <div style={{
                    fontSize: 11, fontWeight: 700, color: t.ink3,
                    fontFamily: F, letterSpacing: '0.5px', textTransform: 'uppercase', marginTop: 2,
                  }}>
                    {m.label}
                  </div>
                </div>
              ))}
            </div>
          </SCard>
        </div>

        {/* Hip mobility card */}
        <div style={{ padding: '0 20px 16px' }}>
          <SCard padding={16}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{
                  fontSize: 13, fontWeight: 700, color: t.ink3,
                  fontFamily: F, letterSpacing: '0.4px', textTransform: 'uppercase', marginBottom: 4,
                }}>
                  Movilidad adicional
                </div>
                <div style={{ fontSize: 17, fontWeight: 600, color: t.ink, fontFamily: F }}>
                  Movilidad de cadera
                </div>
                <div style={{ fontSize: 14, color: t.ink2, fontFamily: F, marginTop: 2 }}>
                  5 ejercicios · 10 min
                </div>
              </div>
              <div style={{
                width: 48, height: 48, borderRadius: 14,
                background: `linear-gradient(135deg, ${t.flame}, ${t.accent})`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 22,
              }}>
                🧘
              </div>
            </div>
          </SCard>
        </div>

        {/* Motivational */}
        <div style={{ padding: '0 20px' }}>
          <div style={{
            padding: '16px 20px',
            background: `linear-gradient(135deg, ${t.flame}20, ${t.accent}15)`,
            borderRadius: 20,
            border: `1px solid ${t.flame}30`,
          }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: t.ink, fontFamily: F, letterSpacing: '-0.3px' }}>
              💪 Listo para entrenar duro
            </div>
            <div style={{ fontSize: 14, color: t.ink2, fontFamily: F, marginTop: 4 }}>
              Llevas {STREAK} días consecutivos. ¡No pares ahora!
            </div>
          </div>
        </div>
      </div>

      <STabBar active="home" />
    </div>
  )
}

function StatPill({ emoji, value, color, bg }) {
  const { t } = useTheme()
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 4,
      background: bg, borderRadius: 9999, padding: '4px 10px', height: 28,
    }}>
      <span style={{ fontSize: 13 }}>{emoji}</span>
      <span style={{ fontSize: 13, fontWeight: 700, color, fontFamily: F }}>{value}</span>
    </div>
  )
}

function HeartBar({ count }) {
  const { t } = useTheme()
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 2,
      background: 'rgba(255,59,48,0.12)', borderRadius: 9999, padding: '4px 10px', height: 28,
    }}>
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} style={{ fontSize: 11, opacity: i < count ? 1 : 0.25 }}>❤️</span>
      ))}
    </div>
  )
}

function SectionLabel({ children }) {
  const { t } = useTheme()
  return (
    <div style={{
      fontSize: 20, fontWeight: 700, color: t.ink,
      fontFamily: F, letterSpacing: '-0.3px', marginBottom: 12,
    }}>
      {children}
    </div>
  )
}
