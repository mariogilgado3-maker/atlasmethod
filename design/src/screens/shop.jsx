import { useTheme, F, SButton, SCard, SBadge, SDivider, STabBar } from '../components/ui'
import { IOSStatusBar, IOSNavBar } from '../ios-frame'

const HEARTS_ITEMS = [
  { name: 'Recargar vidas', desc: 'No te detengas', emoji: '❤️', cost: '350 💎', highlight: true },
  { name: 'Vidas infinitas', desc: '30 minutos', emoji: '♾️', cost: '100 💎', highlight: false },
]

const STREAK_ITEMS = [
  { name: 'Escudo de racha', desc: 'Protege 1 día', emoji: '🛡️', cost: '200 💎', highlight: false },
  { name: 'Reparar racha', desc: 'Racha perdida', emoji: '🔧', cost: '500 💎', highlight: true },
]

const GEM_PACKS = [
  { gems: 500, price: '0,99€', bonus: '' },
  { gems: 1200, price: '1,99€', bonus: '+200' },
  { gems: 2500, price: '3,99€', bonus: '+500' },
  { gems: 6500, price: '9,99€', bonus: '+1.500', popular: true },
]

const PREMIUM_PLANS = [
  { name: 'Mensual', price: '9,99€', period: '/mes', badge: '' },
  { name: 'Anual', price: '59,99€', period: '/año', badge: 'Popular', saving: 'Ahorras un 50%' },
  { name: 'De por vida', price: '199,99€', period: 'pago único', badge: 'Mejor valor', saving: 'Para siempre' },
]

export function ShopScreen() {
  const { t } = useTheme()
  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', background: t.bg }}>
      <IOSStatusBar />
      <IOSNavBar title="Tienda" />

      <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 100 }}>
        {/* Premium banner */}
        <div style={{ padding: '8px 20px 20px' }}>
          <div style={{
            borderRadius: 24, overflow: 'hidden',
            background: `linear-gradient(135deg, #1C1C2E 0%, #2D1B69 50%, #1C1C2E 100%)`,
            padding: '20px 20px 18px',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
              <div>
                <div style={{
                  fontSize: 20, fontWeight: 800, color: '#fff',
                  fontFamily: F, letterSpacing: '-0.3px', marginBottom: 4,
                }}>
                  Atlas Premium ✨
                </div>
                <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)', fontFamily: F }}>
                  Vidas infinitas y planes ilimitados
                </div>
              </div>
              <SBadge style={{ background: 'rgba(255,215,0,0.2)', color: '#FFD700', flexShrink: 0 }}>
                ⭐ Top
              </SBadge>
            </div>
            <button style={{
              width: '100%', height: 44, borderRadius: 9999,
              background: 'linear-gradient(90deg, #FFD700, #FF9500)',
              border: 'none', cursor: 'pointer',
              fontSize: 15, fontWeight: 700, color: '#000', fontFamily: F,
            }}>
              Probar 14 días gratis →
            </button>
          </div>
        </div>

        {/* Hearts section */}
        <ShopSection title="❤️ Vidas" items={HEARTS_ITEMS} />

        {/* Streak section */}
        <ShopSection title="🔥 Racha" items={STREAK_ITEMS} />

        {/* Gems */}
        <div style={{ padding: '0 20px 20px' }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: t.ink, fontFamily: F, letterSpacing: '-0.3px', marginBottom: 12 }}>
            💎 Gemas
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {GEM_PACKS.map((pack, i) => (
              <button key={i} style={{
                borderRadius: 18, padding: '16px 14px',
                background: pack.popular ? `linear-gradient(135deg, #AF52DE20, ${t.surface})` : t.surface,
                border: pack.popular ? `1.5px solid #AF52DE50` : `1px solid ${t.border}`,
                cursor: 'pointer', textAlign: 'center',
              }}>
                {pack.popular && (
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#AF52DE', fontFamily: F, letterSpacing: '0.3px', marginBottom: 6 }}>
                    POPULAR
                  </div>
                )}
                <div style={{ fontSize: 28, marginBottom: 4 }}>💎</div>
                <div style={{ fontSize: 18, fontWeight: 800, color: t.ink, fontFamily: F }}>
                  {pack.gems.toLocaleString()}
                  {pack.bonus && (
                    <span style={{ fontSize: 12, color: t.flame, fontWeight: 700, marginLeft: 4 }}>+{pack.bonus}</span>
                  )}
                </div>
                <div style={{ fontSize: 15, fontWeight: 700, color: pack.popular ? '#AF52DE' : t.accent, fontFamily: F, marginTop: 4 }}>
                  {pack.price}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Premium plans */}
        <div style={{ padding: '0 20px' }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: t.ink, fontFamily: F, letterSpacing: '-0.3px', marginBottom: 12 }}>
            ✨ Premium
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {PREMIUM_PLANS.map((plan, i) => (
              <button key={i} style={{
                width: '100%', padding: '16px 18px',
                borderRadius: 18, border: 'none', cursor: 'pointer',
                background: plan.badge === 'Popular'
                  ? `linear-gradient(135deg, ${t.accent}18, ${t.surface})`
                  : plan.badge === 'Mejor valor'
                  ? `linear-gradient(135deg, ${t.flame}18, ${t.surface})`
                  : t.surface,
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                outline: plan.badge === 'Popular' ? `1.5px solid ${t.accent}50` : `1px solid ${t.border}`,
              }}>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 2 }}>
                    <span style={{ fontSize: 16, fontWeight: 700, color: t.ink, fontFamily: F }}>
                      {plan.name}
                    </span>
                    {plan.badge && (
                      <SBadge variant={plan.badge === 'Popular' ? 'accent' : 'flame'} style={{ height: 20, fontSize: 11 }}>
                        {plan.badge}
                      </SBadge>
                    )}
                  </div>
                  {plan.saving && (
                    <span style={{ fontSize: 13, color: plan.badge === 'Popular' ? t.accent : t.flame, fontFamily: F, fontWeight: 600 }}>
                      {plan.saving}
                    </span>
                  )}
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 20, fontWeight: 800, color: t.ink, fontFamily: F, letterSpacing: '-0.3px' }}>
                    {plan.price}
                  </div>
                  <div style={{ fontSize: 12, color: t.ink3, fontFamily: F }}>{plan.period}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      <STabBar active="shop" />
    </div>
  )
}

function ShopSection({ title, items }) {
  const { t } = useTheme()
  return (
    <div style={{ padding: '0 20px 20px' }}>
      <div style={{ fontSize: 18, fontWeight: 700, color: t.ink, fontFamily: F, letterSpacing: '-0.3px', marginBottom: 12 }}>
        {title}
      </div>
      <SCard padding={0} style={{ overflow: 'hidden' }}>
        {items.map((item, i) => (
          <div key={i}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px',
              background: item.highlight ? `${t.flame}08` : 'transparent',
            }}>
              <div style={{
                width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                background: item.highlight ? `${t.flame}20` : t.surface2,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 22,
              }}>
                {item.emoji}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 16, fontWeight: 600, color: t.ink, fontFamily: F }}>
                  {item.name}
                </div>
                <div style={{ fontSize: 13, color: t.ink2, fontFamily: F }}>{item.desc}</div>
              </div>
              <button style={{
                height: 34, borderRadius: 9999, padding: '0 14px',
                background: item.highlight ? t.flame : t.surface2,
                border: 'none', cursor: 'pointer',
                fontSize: 13, fontWeight: 700,
                color: item.highlight ? '#fff' : t.ink,
                fontFamily: F, flexShrink: 0,
              }}>
                {item.cost}
              </button>
            </div>
            {i < items.length - 1 && <SDivider indent={76} />}
          </div>
        ))}
      </SCard>
    </div>
  )
}
