import { useTheme, F, SButton, SCard, SBadge, SDivider } from '../components/ui'
import { IOSStatusBar, IOSNavBar } from '../ios-frame'

const EXERCISE = 'Sentadilla con barra'
const SERIES_TOTAL = 4
const CURRENT_SERIES = 2
const WEIGHT = 80
const REPS = 8

const COMPLETED_SERIES = [
  { series: 1, weight: 80, reps: 8, rpe: 7 },
  { series: 2, weight: 80, reps: 8, rpe: 8 },
]

export function LessonScreen() {
  const { t } = useTheme()
  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', background: t.bg }}>
      <IOSStatusBar />
      <IOSNavBar
        title={EXERCISE}
        leftSlot={
          <span style={{ fontSize: 15, color: t.accent, fontFamily: F, fontWeight: 600 }}>← Salir</span>
        }
        rightSlot={
          <SBadge variant="surface">{CURRENT_SERIES}/{SERIES_TOTAL}</SBadge>
        }
      />

      <div style={{ flex: 1, padding: '16px 20px 0', overflowY: 'auto', paddingBottom: 40 }}>
        {/* Series counter */}
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 16 }}>
            {Array.from({ length: SERIES_TOTAL }).map((_, i) => (
              <div key={i} style={{
                width: 40, height: 6, borderRadius: 9999,
                background: i < CURRENT_SERIES ? t.flame
                  : i === CURRENT_SERIES ? t.accent
                  : t.surface2,
              }} />
            ))}
          </div>
          <div style={{ fontSize: 15, fontWeight: 600, color: t.ink2, fontFamily: F }}>
            Serie {CURRENT_SERIES + 1} de {SERIES_TOTAL}
          </div>
        </div>

        {/* Weight & reps */}
        <SCard padding={24} style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', gap: 12 }}>
            <NumberInput label="Carga (kg)" value={WEIGHT} />
            <div style={{ width: 1, background: t.border }} />
            <NumberInput label="Repeticiones" value={REPS} />
          </div>
        </SCard>

        {/* Rest timer */}
        <SCard padding={20} style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: t.ink3, fontFamily: F, letterSpacing: '0.4px', textTransform: 'uppercase', marginBottom: 4 }}>
                Descanso
              </div>
              <div style={{ fontSize: 34, fontWeight: 700, color: t.flame, fontFamily: F, letterSpacing: '-1px' }}>
                1:45
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <TimerBtn>-30s</TimerBtn>
              <TimerBtn accent>+30s</TimerBtn>
            </div>
          </div>
          {/* Timer bar */}
          <div style={{ marginTop: 14, height: 6, borderRadius: 9999, background: t.surface2 }}>
            <div style={{
              height: '100%', borderRadius: 9999, width: '58%',
              background: `linear-gradient(90deg, ${t.flame}, ${t.accent})`,
            }} />
          </div>
        </SCard>

        {/* RPE slider */}
        <SCard padding={18} style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: t.ink3, fontFamily: F, letterSpacing: '0.4px', textTransform: 'uppercase', marginBottom: 12 }}>
            Esfuerzo percibido (RPE)
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            {[6, 7, 8, 9, 10].map(rpe => (
              <div key={rpe} style={{
                flex: 1, height: 36, borderRadius: 10,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: rpe === 8 ? t.flame : t.surface2,
                cursor: 'pointer',
              }}>
                <span style={{
                  fontSize: 14, fontWeight: 700,
                  color: rpe === 8 ? '#fff' : t.ink2,
                  fontFamily: F,
                }}>{rpe}</span>
              </div>
            ))}
          </div>
        </SCard>

        {/* CTA */}
        <SButton full variant="primary" style={{ marginBottom: 24 }}>
          Serie completada ✓
        </SButton>

        {/* Log */}
        {COMPLETED_SERIES.length > 0 && (
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: t.ink2, fontFamily: F, marginBottom: 10 }}>
              Series completadas
            </div>
            <SCard padding={0} style={{ overflow: 'hidden' }}>
              {/* Header */}
              <div style={{ display: 'flex', padding: '10px 18px', background: t.surface2 }}>
                {['Serie', 'Peso', 'Reps', 'RPE'].map(h => (
                  <div key={h} style={{
                    flex: h === 'Serie' ? 1.2 : 1, fontSize: 12, fontWeight: 700,
                    color: t.ink3, fontFamily: F, letterSpacing: '0.3px',
                  }}>{h}</div>
                ))}
              </div>
              {COMPLETED_SERIES.map((s, i) => (
                <div key={i}>
                  <div style={{ display: 'flex', padding: '12px 18px', alignItems: 'center' }}>
                    <div style={{ flex: 1.2 }}>
                      <SBadge variant="flame" style={{ height: 22, fontSize: 11 }}>S{s.series}</SBadge>
                    </div>
                    <div style={{ flex: 1, fontSize: 16, fontWeight: 700, color: t.ink, fontFamily: F }}>{s.weight}<span style={{ fontSize: 12, color: t.ink3 }}> kg</span></div>
                    <div style={{ flex: 1, fontSize: 16, fontWeight: 700, color: t.ink, fontFamily: F }}>{s.reps}</div>
                    <div style={{ flex: 1, fontSize: 16, fontWeight: 700, color: t.ink2, fontFamily: F }}>{s.rpe}</div>
                  </div>
                  {i < COMPLETED_SERIES.length - 1 && <SDivider indent={18} />}
                </div>
              ))}
            </SCard>
          </div>
        )}
      </div>
    </div>
  )
}

function NumberInput({ label, value }) {
  const { t } = useTheme()
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: t.ink3, fontFamily: F, letterSpacing: '0.3px', textTransform: 'uppercase' }}>
        {label}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <button style={{
          width: 36, height: 36, borderRadius: 9999,
          background: t.surface2, border: 'none', cursor: 'pointer',
          fontSize: 20, color: t.ink, display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>−</button>
        <span style={{ fontSize: 34, fontWeight: 700, color: t.ink, fontFamily: F, letterSpacing: '-1px', minWidth: 50, textAlign: 'center' }}>
          {value}
        </span>
        <button style={{
          width: 36, height: 36, borderRadius: 9999,
          background: t.surface2, border: 'none', cursor: 'pointer',
          fontSize: 20, color: t.ink, display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>+</button>
      </div>
    </div>
  )
}

function TimerBtn({ children, accent }) {
  const { t } = useTheme()
  return (
    <button style={{
      height: 36, borderRadius: 9999, padding: '0 14px',
      background: accent ? `${t.accent}18` : t.surface2,
      border: 'none', cursor: 'pointer',
      fontSize: 13, fontWeight: 700,
      color: accent ? t.accent : t.ink2,
      fontFamily: F,
    }}>
      {children}
    </button>
  )
}
