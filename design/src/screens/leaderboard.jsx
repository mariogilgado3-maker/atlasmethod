import { useTheme, F, SCard, SBadge, STabBar } from '../components/ui'
import { IOSStatusBar, IOSNavBar } from '../ios-frame'

const LEAGUE = 'Acero'
const LEAGUE_EMOJI = '⚙️'

const PLAYERS = [
  { rank: 1,  name: 'IronKing',      xp: 4820, avatar: '🦁', you: false },
  { rank: 2,  name: 'FitAlpha',      xp: 4210, avatar: '🐯', you: false },
  { rank: 3,  name: 'Tú',            xp: 3840, avatar: '⚡', you: true  },
  { rank: 4,  name: 'LiftMaster',    xp: 3490, avatar: '🐻', you: false },
  { rank: 5,  name: 'MusclePro',     xp: 3210, avatar: '🦊', you: false },
  { rank: 6,  name: 'PowerHero',     xp: 2980, avatar: '🐺', you: false },
  { rank: 7,  name: 'GymRat',        xp: 2750, avatar: '🦅', you: false },
  { rank: 8,  name: 'PeakPerform',   xp: 2540, avatar: '🦈', you: false },
  { rank: 9,  name: 'SteelBody',     xp: 1920, avatar: '🐊', you: false },
  { rank: 10, name: 'TrainingHard',  xp: 1430, avatar: '🦎', you: false },
]

const SAFE_ZONE = 6

export function LeaderboardScreen() {
  const { t } = useTheme()
  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', background: t.bg }}>
      <IOSStatusBar />
      <IOSNavBar
        title="Liga"
        rightSlot={
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 14 }}>⏱</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: t.ink2, fontFamily: F }}>4d restantes</span>
          </div>
        }
      />

      <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 100 }}>
        {/* League header */}
        <div style={{ padding: '8px 20px 20px' }}>
          <SCard padding={20} style={{
            background: `linear-gradient(135deg, rgba(100,100,120,0.3) 0%, ${t.surface} 100%)`,
            border: `1px solid ${t.borderStrong}`,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{
                width: 64, height: 64, borderRadius: 18, fontSize: 36,
                background: `linear-gradient(135deg, #8E8E93, #636366)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {LEAGUE_EMOJI}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: t.ink3, fontFamily: F, letterSpacing: '0.4px', textTransform: 'uppercase', marginBottom: 2 }}>
                  Liga actual
                </div>
                <div style={{ fontSize: 24, fontWeight: 800, color: t.ink, fontFamily: F, letterSpacing: '-0.4px' }}>
                  {LEAGUE}
                </div>
                <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
                  <SBadge variant="accent" style={{ fontSize: 11 }}>Top 10</SBadge>
                  <SBadge variant="flame" style={{ fontSize: 11 }}>🔥 Racha extendida</SBadge>
                </div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 28, fontWeight: 800, color: t.ink, fontFamily: F }}>3°</div>
                <div style={{ fontSize: 12, color: t.ink3, fontFamily: F }}>posición</div>
              </div>
            </div>
          </SCard>
        </div>

        {/* League progression */}
        <div style={{ padding: '0 20px 12px', display: 'flex', gap: 8, overflowX: 'auto' }}>
          {['Hierro', 'Acero', 'Bronce', 'Plata'].map((l, i) => (
            <div key={i} style={{
              flexShrink: 0, display: 'flex', alignItems: 'center', gap: 6,
              padding: '6px 12px', borderRadius: 9999,
              background: i === 1 ? t.ink : t.surface2,
              border: i === 1 ? 'none' : `0.5px solid ${t.border}`,
            }}>
              <span style={{ fontSize: 14 }}>{['🔩','⚙️','🥉','🥈'][i]}</span>
              <span style={{
                fontSize: 12, fontWeight: 700, fontFamily: F,
                color: i === 1 ? t.bg : i < 1 ? t.ink3 : t.ink2,
              }}>{l}</span>
            </div>
          ))}
        </div>

        {/* Leaderboard */}
        <div style={{ padding: '0 20px' }}>
          <SCard padding={0} style={{ overflow: 'hidden' }}>
            {PLAYERS.map((p, i) => (
              <div key={i}>
                {i === SAFE_ZONE && <ZoneDivider label="Desciende" color={t.danger} />}
                <LeaderRow player={p} />
                {i < PLAYERS.length - 1 && i !== SAFE_ZONE - 1 && (
                  <div style={{ height: 0.5, background: t.border, marginLeft: 64 }} />
                )}
              </div>
            ))}
          </SCard>
        </div>
      </div>

      <STabBar active="league" />
    </div>
  )
}

function LeaderRow({ player }) {
  const { t } = useTheme()
  const medalColors = ['#FFD700', '#C0C0C0', '#CD7F32']
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12, padding: '11px 16px',
      background: player.you ? `${t.accent}10` : 'transparent',
    }}>
      {/* Rank */}
      <div style={{ width: 28, textAlign: 'center' }}>
        {player.rank <= 3
          ? <span style={{ fontSize: 18 }}>{'🥇🥈🥉'[player.rank - 1]}</span>
          : <span style={{ fontSize: 14, fontWeight: 700, color: t.ink3, fontFamily: F }}>{player.rank}</span>
        }
      </div>
      {/* Avatar */}
      <div style={{
        width: 36, height: 36, borderRadius: 9999,
        background: player.you ? `${t.accent}20` : t.surface2,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 20, flexShrink: 0,
        border: player.you ? `2px solid ${t.accent}` : 'none',
      }}>
        {player.avatar}
      </div>
      {/* Name */}
      <div style={{ flex: 1 }}>
        <span style={{
          fontSize: 15, fontWeight: player.you ? 700 : 500, fontFamily: F,
          color: player.you ? t.accent : t.ink,
        }}>
          {player.name}
        </span>
        {player.you && <span style={{ fontSize: 12, color: t.accent, fontFamily: F, marginLeft: 6, fontWeight: 700 }}>← Tú</span>}
      </div>
      {/* XP */}
      <div style={{ textAlign: 'right' }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: t.ink, fontFamily: F }}>
          {player.xp.toLocaleString()}
        </div>
        <div style={{ fontSize: 11, color: t.ink3, fontFamily: F }}>XP · sem</div>
      </div>
    </div>
  )
}

function ZoneDivider({ label, color }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10,
      padding: '6px 16px', background: `${color}12`,
    }}>
      <div style={{ flex: 1, height: 1, background: color, opacity: 0.4 }} />
      <span style={{ fontSize: 11, fontWeight: 700, color, fontFamily: F, letterSpacing: '0.5px', textTransform: 'uppercase' }}>
        {label}
      </span>
      <div style={{ flex: 1, height: 1, background: color, opacity: 0.4 }} />
    </div>
  )
}
