import { useTheme, F, SButton, SCard, SBadge, STabBar } from '../components/ui'
import { IOSStatusBar, IOSNavBar } from '../ios-frame'

const OBJETIVO_OPTS = ['Hipertrofia', 'Fuerza', 'Mixto']
const NIVEL_OPTS = ['Principiante', 'Intermedio', 'Avanzado']
const EQUIP_OPTS = ['Completo', 'Mancuernas', 'Calistenia']
const DIAS_OPTS = ['3', '4', '5', '6']

const GENERATED_PLAN = [
  { day: 'Lun', label: 'Empuje', exercises: ['Press banca', 'Press militar', 'Aperturas', 'Tríceps polea'] },
  { day: 'Mar', label: 'Tirón', exercises: ['Dominadas', 'Remo barra', 'Jalón polea', 'Curl bíceps'] },
  { day: 'Jue', label: 'Piernas A', exercises: ['Sentadilla', 'Peso muerto rumano', 'Prensa', 'Femoral'] },
  { day: 'Sáb', label: 'Piernas B', exercises: ['Hip thrust', 'Press inclinado', 'Remo mancuerna', 'Core'] },
]

const FILTER_SELECTION = {
  objetivo: 'Hipertrofia',
  nivel: 'Intermedio',
  equip: 'Completo',
  dias: '4',
}

export function BuilderScreen() {
  const { t } = useTheme()
  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', background: t.bg }}>
      <IOSStatusBar />
      <IOSNavBar title="Generador" />

      <div style={{ flex: 1, overflowY: 'auto', padding: '8px 0 100px' }}>
        {/* Filters */}
        <div style={{ padding: '0 20px 20px' }}>
          <SCard padding={18}>
            <FilterGroup label="Objetivo" opts={OBJETIVO_OPTS} active={FILTER_SELECTION.objetivo} />
            <FilterGroup label="Nivel" opts={NIVEL_OPTS} active={FILTER_SELECTION.nivel} style={{ marginTop: 16 }} />
            <FilterGroup label="Equipamiento" opts={EQUIP_OPTS} active={FILTER_SELECTION.equip} style={{ marginTop: 16 }} />
            <FilterGroup label="Ciclo (días/semana)" opts={DIAS_OPTS} active={FILTER_SELECTION.dias} style={{ marginTop: 16 }} />
            <SButton full variant="accent" style={{ marginTop: 20, height: 48 }}>
              ⚡ Generar rutina
            </SButton>
          </SCard>
        </div>

        {/* Output */}
        <div style={{ padding: '0 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <div style={{ fontSize: 20, fontWeight: 700, color: t.ink, fontFamily: F, letterSpacing: '-0.3px' }}>
              Tu plan generado
            </div>
            <SBadge variant="flame">Hipertrofia · 4 días</SBadge>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {GENERATED_PLAN.map((day, i) => (
              <SCard key={i} padding={0} style={{ overflow: 'hidden' }}>
                <div style={{
                  padding: '12px 16px 10px',
                  background: `linear-gradient(90deg, ${t.accent}10, transparent)`,
                  display: 'flex', alignItems: 'center', gap: 12,
                  borderBottom: `0.5px solid ${t.border}`,
                }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: 12,
                    background: t.accent, flexShrink: 0,
                    display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center',
                  }}>
                    <span style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.7)', fontFamily: F, letterSpacing: '0.3px' }}>
                      DÍA
                    </span>
                    <span style={{ fontSize: 14, fontWeight: 800, color: '#fff', fontFamily: F, lineHeight: 1 }}>
                      {day.day}
                    </span>
                  </div>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: t.ink, fontFamily: F }}>
                      {day.label}
                    </div>
                    <div style={{ fontSize: 12, color: t.ink3, fontFamily: F }}>
                      {day.exercises.length} ejercicios
                    </div>
                  </div>
                </div>
                <div style={{ padding: '8px 16px 12px', display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {day.exercises.map((ex, j) => (
                    <span key={j} style={{
                      fontSize: 12, fontWeight: 600, color: t.ink2,
                      background: t.surface2, borderRadius: 8, padding: '4px 10px',
                      fontFamily: F,
                    }}>
                      {ex}
                    </span>
                  ))}
                </div>
              </SCard>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
            <SButton full variant="primary" style={{ flex: 1 }}>Usar este plan</SButton>
            <SButton variant="ghost" style={{ width: 52, padding: 0 }}>↻</SButton>
          </div>
        </div>
      </div>

      <STabBar active="builder" />
    </div>
  )
}

function FilterGroup({ label, opts, active, style }) {
  const { t } = useTheme()
  return (
    <div style={style}>
      <div style={{
        fontSize: 12, fontWeight: 700, color: t.ink3,
        fontFamily: F, letterSpacing: '0.4px', textTransform: 'uppercase', marginBottom: 8,
      }}>
        {label}
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        {opts.map(opt => (
          <button key={opt} style={{
            flex: 1, height: 36, borderRadius: 10,
            background: opt === active ? t.ink : t.surface2,
            border: 'none', cursor: 'pointer',
            fontSize: 13, fontWeight: 600,
            color: opt === active ? t.bg : t.ink2,
            fontFamily: F, whiteSpace: 'nowrap', overflow: 'hidden',
            textOverflow: 'ellipsis', padding: '0 8px',
          }}>
            {opt}
          </button>
        ))}
      </div>
    </div>
  )
}
