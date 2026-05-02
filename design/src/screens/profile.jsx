import { useTheme, F, SCard, SBadge, STabBar } from '../components/ui'
import { IOSStatusBar, IOSNavBar } from '../ios-frame'
import { AtlasMark } from '../components/brand'

const STATS = [
  { label: 'Entrenos', value: '142' },
  { label: 'Semanas', value: '34' },
  { label: 'Racha', value: '47d' },
]

const WEEK_VOLUME = [
  { day: 'L', kg: 11200 },
  { day: 'M', kg: 9800 },
  { day: 'X', kg: 0 },
  { day: 'J', kg: 13400 },
  { day: 'V', kg: 0 },
  { day: 'S', kg: 12100 },
  { day: 'D', kg: 0 },
]

const ACHIEVEMENTS = [
  { id: 1, emoji: '🔩', name: 'Hierro', desc: 'Liga Hierro', earned: true },
  { id: 2, emoji: '✅', name: 'Sem. completa', desc: '7 días seguidos', earned: true },
  { id: 3, emoji: '🔥', name: '30 días', desc: 'Racha de un mes', earned: true },
  { id: 4, emoji: '🏋️', name: '10.000 kg', desc: 'Volumen total', earned: true },
  { id: 5, emoji: '⚡', name: 'Nivel 20', desc: '20.000 XP', earned: false },
  { id: 6, emoji: '🏆', name: 'Top 3', desc: 'Liga Acero', earned: false },
]

const maxKg = Math.max(...WEEK_VOLUME.map(d => d.kg))

export function ProfileScreen() {
  const { t } = useTheme()
  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', background: t.bg }}>
      <IOSStatusBar />
      <IOSNavBar
        title="Perfil"
        rightSlot={
          <span style={{ fontSize: 15, color: t.accent, fontFamily: F, fontWeight: 600 }}>⚙️</span>
        }
      />

      <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 100 }}>
        {/* User card */}
        <div style={{ padding: '8px 20px 20px' }}>
          <SCard padding={20}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
              {/* Avatar */}
              <div style={{
                width: 68, height: 68, borderRadius: 9999, flexShrink: 0,
                background: `linear-gradient(135deg, ${t.accent}, ${t.flame})`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: `0 4px 16px ${t.accent}40`,
              }}>
                <AtlasMark size={32} color="#fff" />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 20, fontWeight: 800, color: t.ink, fontFamily: F, letterSpacing: '-0.3px' }}>
                  AtlasUser
                </div>
                <div style={{ fontSize: 14, color: t.ink2, fontFamily: F, marginTop: 2 }}>
                  @atlasuser · Nivel 24
                </div>
                <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                  <Gem count={1240} />
                  <Hearts count={5} />
                </div>
              </div>
            </div>
            {/* Stats row */}
            <div style={{
              display: 'flex', justifyContent: 'space-around',
              paddingTop: 16, borderTop: `0.5px solid ${t.border}`,
            }}>
              {STATS.map((s, i) => (
                <div key={i} style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 22, fontWeight: 800, color: t.ink, fontFamily: F, letterSpacing: '-0.3px' }}>
                    {s.value}
                  </div>
                  <div style={{ fontSize: 12, color: t.ink3, fontFamily: F, fontWeight: 600, letterSpacing: '0.2px' }}>
                    {s.label}
                  </div>
                </div>
              ))}
            </div>
          </SCard>
        </div>

        {/* Weekly volume */}
        <div style={{ padding: '0 20px 20px' }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: t.ink, fontFamily: F, letterSpacing: '-0.3px', marginBottom: 12 }}>
            Volumen de la semana
          </div>
          <SCard padding={20}>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 80 }}>
              {WEEK_VOLUME.map((d, i) => {
                const h = d.kg > 0 ? Math.max(12, (d.kg / maxKg) * 72) : 12
                const isToday = i === 3
                return (
                  <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, height: '100%', justifyContent: 'flex-end' }}>
                    <div style={{
                      width: '100%', borderRadius: 8,
                      height: h,
                      background: d.kg === 0 ? t.surface2
                        : isToday ? t.flame
                        : `${t.accent}80`,
                      transition: 'height 0.3s ease',
                    }} />
                    <span style={{
                      fontSize: 11, fontWeight: 600, color: isToday ? t.flame : t.ink3,
                      fontFamily: F,
                    }}>{d.day}</span>
                  </div>
                )
              })}
            </div>
            <div style={{ marginTop: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 13, color: t.ink2, fontFamily: F }}>Total esta semana</span>
              <span style={{ fontSize: 17, fontWeight: 700, color: t.ink, fontFamily: F }}>
                46.500 <span style={{ fontSize: 12, color: t.ink3 }}>kg</span>
              </span>
            </div>
          </SCard>
        </div>

        {/* Achievements */}
        <div style={{ padding: '0 20px' }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: t.ink, fontFamily: F, letterSpacing: '-0.3px', marginBottom: 12 }}>
            Logros
          </div>
          <SCard padding={16}>
            <div style={{
              display: 'grid', gridTemplateColumns: '1fr 1fr 1fr',
              gap: 12,
            }}>
              {ACHIEVEMENTS.map(a => (
                <div key={a.id} style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                  padding: '12px 8px', borderRadius: 14,
                  background: a.earned ? `${t.flame}15` : t.surface2,
                  opacity: a.earned ? 1 : 0.45,
                  border: a.earned ? `1px solid ${t.flame}30` : 'none',
                }}>
                  <span style={{ fontSize: 26 }}>{a.emoji}</span>
                  <span style={{
                    fontSize: 11, fontWeight: 700, color: a.earned ? t.ink : t.ink3,
                    fontFamily: F, textAlign: 'center', lineHeight: 1.3,
                  }}>
                    {a.name}
                  </span>
                </div>
              ))}
            </div>
          </SCard>
        </div>
      </div>

      <STabBar active="profile" />
    </div>
  )
}

function Gem({ count }) {
  const { t } = useTheme()
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 4,
      background: 'rgba(175,82,222,0.12)', borderRadius: 9999, padding: '3px 10px',
    }}>
      <span style={{ fontSize: 12 }}>💎</span>
      <span style={{ fontSize: 13, fontWeight: 700, color: '#AF52DE', fontFamily: F }}>{count}</span>
    </div>
  )
}

function Hearts({ count }) {
  const { t } = useTheme()
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 2,
      background: 'rgba(255,59,48,0.12)', borderRadius: 9999, padding: '3px 10px',
    }}>
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} style={{ fontSize: 11, opacity: i < count ? 1 : 0.25 }}>❤️</span>
      ))}
    </div>
  )
}
