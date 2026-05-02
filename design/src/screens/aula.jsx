import { useTheme, F, SCard, SBadge, SProgressBar, STabBar, SDivider } from '../components/ui'
import { IOSStatusBar, IOSNavBar } from '../ios-frame'

const MODULES = [
  {
    id: 1, title: 'Principios de hipertrofia',
    subtitle: 'Cómo crece el músculo',
    lessons: 8, done: 5, emoji: '🧬',
    tag: 'Conocimiento',
  },
  {
    id: 2, title: 'Sobrecarga progresiva',
    subtitle: 'El principio que lo explica todo',
    lessons: 6, done: 6, emoji: '📈',
    tag: 'Método',
  },
  {
    id: 3, title: 'Nutrición y recuperación',
    subtitle: 'Proteínas, carbohidratos y sueño',
    lessons: 10, done: 2, emoji: '🥗',
    tag: 'Nutrición',
  },
  {
    id: 4, title: 'Técnica de los grandes básicos',
    subtitle: 'Sentadilla, press y peso muerto',
    lessons: 12, done: 0, emoji: '🏋️',
    tag: 'Técnica',
  },
]

const PLAN_LESSONS = [
  { title: 'Tensión mecánica vs. daño muscular', done: true },
  { title: 'Rango de repeticiones óptimo', done: true },
  { title: 'Frecuencia semanal por grupo muscular', done: true },
  { title: 'Periodización y mesociclos', done: false },
  { title: 'Deload: cuándo y cómo', done: false },
]

export function AulaScreen() {
  const { t } = useTheme()
  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', background: t.bg }}>
      <IOSStatusBar />
      <IOSNavBar
        title="Aula virtual"
        rightSlot={
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: `rgba(10,132,255,0.12)`, borderRadius: 9999, padding: '4px 10px',
          }}>
            <span style={{ fontSize: 11 }}>✨</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: t.accent, fontFamily: F }}>IA</span>
          </div>
        }
      />

      <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 100 }}>
        {/* Continue banner */}
        <div style={{ padding: '8px 20px 20px' }}>
          <div style={{
            borderRadius: 24, overflow: 'hidden',
            background: `linear-gradient(135deg, ${t.accent} 0%, #5E5CE6 100%)`,
            padding: 20,
          }}>
            <SBadge style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', marginBottom: 10 }}>
              Módulo 1 · Lección 6
            </SBadge>
            <div style={{ fontSize: 19, fontWeight: 700, color: '#fff', fontFamily: F, letterSpacing: '-0.3px', marginBottom: 6 }}>
              Sigue donde lo dejaste
            </div>
            <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.75)', fontFamily: F, marginBottom: 14 }}>
              Frecuencia semanal por grupo muscular
            </div>
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              background: 'rgba(255,255,255,0.95)', borderRadius: 14, padding: '10px 14px',
              cursor: 'pointer',
            }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: t.accent, fontFamily: F }}>
                Continuar →
              </span>
              <div style={{ display: 'flex', gap: 3 }}>
                {[1,2,3,4].map(i => (
                  <div key={i} style={{
                    width: 28, height: 5, borderRadius: 9999,
                    background: i <= 3 ? t.accent : `${t.accent}30`,
                  }} />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Modules */}
        <div style={{ padding: '0 20px' }}>
          <div style={{
            fontSize: 20, fontWeight: 700, color: t.ink,
            fontFamily: F, letterSpacing: '-0.3px', marginBottom: 14,
          }}>
            Módulos
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {MODULES.map(mod => (
              <SCard key={mod.id} padding={16}>
                <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                  <div style={{
                    width: 48, height: 48, borderRadius: 14,
                    background: t.surface2, fontSize: 24,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    {mod.emoji}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                      <SBadge variant="accent" style={{ height: 20, fontSize: 11, padding: '0 8px' }}>
                        {mod.tag}
                      </SBadge>
                      {mod.done === mod.lessons && (
                        <SBadge variant="flame" style={{ height: 20, fontSize: 11, padding: '0 8px' }}>
                          ✓ Completado
                        </SBadge>
                      )}
                    </div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: t.ink, fontFamily: F, letterSpacing: '-0.2px' }}>
                      {mod.title}
                    </div>
                    <div style={{ fontSize: 13, color: t.ink2, fontFamily: F, marginTop: 2, marginBottom: 10 }}>
                      {mod.subtitle}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <SProgressBar
                        value={(mod.done / mod.lessons) * 100}
                        color={mod.done === mod.lessons ? t.flame : t.accent}
                        style={{ flex: 1 }}
                      />
                      <span style={{ fontSize: 12, fontWeight: 700, color: t.ink3, fontFamily: F, flexShrink: 0 }}>
                        {mod.done}/{mod.lessons}
                      </span>
                    </div>
                  </div>
                </div>
              </SCard>
            ))}
          </div>
        </div>

        {/* Study plan */}
        <div style={{ padding: '24px 20px 0' }}>
          <div style={{
            fontSize: 20, fontWeight: 700, color: t.ink,
            fontFamily: F, letterSpacing: '-0.3px', marginBottom: 14,
          }}>
            Plan de estudio
          </div>
          <SCard padding={0} style={{ overflow: 'hidden' }}>
            {PLAN_LESSONS.map((lesson, i) => (
              <div key={i}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '13px 18px' }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: 9999, flexShrink: 0,
                    background: lesson.done ? t.flame : t.surface2,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 13, fontWeight: 700,
                    color: lesson.done ? '#fff' : t.ink3,
                  }}>
                    {lesson.done ? '✓' : i + 1}
                  </div>
                  <span style={{
                    fontSize: 15, fontWeight: 500, color: lesson.done ? t.ink2 : t.ink,
                    fontFamily: F, flex: 1,
                    textDecoration: lesson.done ? 'line-through' : 'none',
                    opacity: lesson.done ? 0.6 : 1,
                  }}>
                    {lesson.title}
                  </span>
                  {!lesson.done && <span style={{ fontSize: 12, color: t.ink3, fontFamily: F }}>→</span>}
                </div>
                {i < PLAN_LESSONS.length - 1 && <SDivider indent={60} />}
              </div>
            ))}
          </SCard>
        </div>
      </div>

      <STabBar active="aula" />
    </div>
  )
}
