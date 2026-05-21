// Gems Store — purchase items with gems

const STORE_ITEMS = [
  { id: 'badge-hierro', name: 'Insignia Hierro', desc: 'Demuestra tu compromiso inicial', cost: 100, category: 'insignia', icon: '🥉' },
  { id: 'badge-bronce', name: 'Insignia Bronce', desc: 'Para quienes ya tienen semanas de trabajo', cost: 250, category: 'insignia', icon: '🥈' },
  { id: 'badge-plata', name: 'Insignia Plata', desc: 'Atleta comprometido', cost: 500, category: 'insignia', icon: '🥇' },
  { id: 'badge-oro', name: 'Insignia Oro', desc: 'Élite de la plataforma', cost: 1000, category: 'insignia', icon: '🏆' },
  { id: 'avatar-atlas', name: 'Avatar Atlas', desc: 'Marco especial para tu perfil', cost: 300, category: 'avatar', icon: '🎖️' },
  { id: 'avatar-titan', name: 'Avatar Titán', desc: 'El marco más exclusivo', cost: 750, category: 'avatar', icon: '⚡' },
  { id: 'protocolo-elite', name: 'Protocolo Élite', desc: 'Acceso a protocolos avanzados de la comunidad', cost: 400, category: 'contenido', icon: '📋' },
  { id: 'analisis-mensual', name: 'Análisis Mensual', desc: 'Informe detallado de tu progreso', cost: 200, category: 'contenido', icon: '📊' },
];

const CATEGORY_LABELS_STORE = {
  todos: 'Todos',
  insignia: 'Insignias',
  avatar: 'Avatares',
  contenido: 'Contenido',
};

function GemsStoreSection() {
  const { state, actions } = useStore();
  const [activeFilter, setActiveFilter] = React.useState('todos');
  const [buyFlash, setBuyFlash] = React.useState(null);
  const [insufficientFlash, setInsufficientFlash] = React.useState(null);

  const owned = state.store.owned || [];
  const balance = state.gems.balance;

  const filteredItems = React.useMemo(() => {
    if (activeFilter === 'todos') return STORE_ITEMS;
    return STORE_ITEMS.filter(item => item.category === activeFilter);
  }, [activeFilter]);

  const ownedItems = STORE_ITEMS.filter(item => owned.includes(item.id));

  const handleBuy = (item) => {
    if (owned.includes(item.id)) return;
    if (balance < item.cost) {
      setInsufficientFlash(item.id);
      setTimeout(() => setInsufficientFlash(null), 2000);
      return;
    }
    actions.buyStoreItem(item.id, item.cost);
    setBuyFlash(item.id);
    setTimeout(() => setBuyFlash(null), 2500);
  };

  const pillBtn = (active) => ({
    padding: '7px 16px', borderRadius: 999, cursor: 'pointer',
    border: active ? '1.5px solid #0F1A2E' : '1px solid rgba(15,26,46,0.12)',
    background: active ? '#0F1A2E' : '#FFFFFF',
    color: active ? '#FAFAF7' : '#3A4257',
    fontFamily: '"Inter",system-ui', fontSize: 13, fontWeight: 600,
    transition: 'all 0.15s',
  });

  return (
    <section style={{ padding: '80px 32px 120px', background: '#FAFAF7', borderTop: '1px solid rgba(15,26,46,0.06)' }}>
      <div style={{ maxWidth: 1180, margin: '0 auto' }}>

        {/* Flash notifications */}
        {buyFlash && (
          <div style={{
            position: 'fixed', top: 80, right: 32, zIndex: 200,
            background: '#0F1A2E', color: '#FAFAF7',
            padding: '10px 20px', borderRadius: 999,
            fontFamily: '"Inter",system-ui', fontSize: 14, fontWeight: 700,
            animation: 'fadeIn 0.3s ease',
            boxShadow: '0 8px 32px rgba(15,26,46,0.25)',
          }}>
            ✓ Adquirido
          </div>
        )}

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 40 }}>
          <div>
            <span style={{ fontFamily: '"Inter",system-ui', fontSize: 13, fontWeight: 700, letterSpacing: 1.6, textTransform: 'uppercase', color: '#5C6477' }}>
              Tienda de Gemas
            </span>
            <h2 style={{ fontFamily: '"Inter",system-ui', fontSize: 44, fontWeight: 700, color: '#0F1A2E', letterSpacing: -1.5, lineHeight: 1.05, margin: '10px 0 0' }}>
              Canjea tus gemas. <span style={{ fontFamily: '"Instrument Serif",serif', fontStyle: 'italic', fontWeight: 400 }}>Hazte notar.</span>
            </h2>
          </div>

          {/* Balance display */}
          <div style={{
            padding: '16px 24px', borderRadius: 18,
            background: '#0F1A2E', color: '#FAFAF7',
            textAlign: 'center',
          }}>
            <div style={{ fontFamily: 'ui-monospace,Menlo,monospace', fontSize: 11, fontWeight: 700, letterSpacing: 0.8, opacity: 0.6, marginBottom: 6 }}>
              TU BALANCE
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}>
              <span style={{ fontSize: 22 }}>💎</span>
              <span style={{ fontFamily: '"Inter",system-ui', fontSize: 32, fontWeight: 800, letterSpacing: -1 }}>
                {balance.toLocaleString('es-ES')}
              </span>
            </div>
            <div style={{ fontFamily: '"Inter",system-ui', fontSize: 11, opacity: 0.5, marginTop: 4 }}>gemas disponibles</div>
          </div>
        </div>

        {/* Category filter */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 28 }}>
          {Object.entries(CATEGORY_LABELS_STORE).map(([key, label]) => (
            <button key={key} onClick={() => setActiveFilter(key)} style={pillBtn(activeFilter === key)}>
              {label}
            </button>
          ))}
        </div>

        {/* Items grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 48 }}>
          {filteredItems.map(item => {
            const isOwned = owned.includes(item.id);
            const canAfford = balance >= item.cost;
            const isInsufficient = insufficientFlash === item.id;
            const justBought = buyFlash === item.id;

            return (
              <StoreItemCard
                key={item.id}
                item={item}
                isOwned={isOwned}
                canAfford={canAfford}
                isInsufficient={isInsufficient}
                justBought={justBought}
                onBuy={() => handleBuy(item)}
              />
            );
          })}
        </div>

        {/* Owned items */}
        {ownedItems.length > 0 && (
          <div>
            <div style={{ fontFamily: 'ui-monospace,Menlo,monospace', fontSize: 11, fontWeight: 700, color: '#9498A4', letterSpacing: 0.6, marginBottom: 16 }}>
              MIS ADQUISICIONES ({ownedItems.length})
            </div>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              {ownedItems.map(item => (
                <div key={item.id} style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '12px 18px', borderRadius: 14,
                  background: '#FFFFFF', border: '1px solid rgba(15,26,46,0.1)',
                }}>
                  <span style={{ fontSize: 22 }}>{item.icon}</span>
                  <div>
                    <div style={{ fontFamily: '"Inter",system-ui', fontSize: 13, fontWeight: 700, color: '#0F1A2E' }}>
                      {item.name}
                    </div>
                    <div style={{ fontFamily: 'ui-monospace,Menlo,monospace', fontSize: 11, color: '#1F8B3A', fontWeight: 700, marginTop: 2 }}>
                      Adquirido · -{item.cost} 💎
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function StoreItemCard({ item, isOwned, canAfford, isInsufficient, justBought, onBuy }) {
  const [hover, setHover] = React.useState(false);

  const catColors = {
    insignia: { bg: 'rgba(15,26,46,0.06)', text: '#3A4257' },
    avatar: { bg: 'rgba(42,111,219,0.08)', text: '#1a4fa0' },
    contenido: { bg: 'rgba(31,139,58,0.08)', text: '#1F8B3A' },
  };
  const catColor = catColors[item.category] || catColors.insignia;

  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        padding: '22px 20px', borderRadius: 22,
        background: isOwned ? '#FAFAF7' : '#FFFFFF',
        border: isOwned
          ? '1px solid rgba(31,139,58,0.25)'
          : hover ? '1px solid rgba(15,26,46,0.18)' : '1px solid rgba(15,26,46,0.08)',
        boxShadow: hover && !isOwned ? '0 10px 40px -12px rgba(15,26,46,0.15)' : 'none',
        transform: hover && !isOwned ? 'translateY(-2px)' : 'none',
        transition: 'all 0.2s',
        display: 'flex', flexDirection: 'column',
      }}
    >
      {/* Icon */}
      <div style={{ fontSize: 40, marginBottom: 14, filter: !isOwned && !canAfford ? 'grayscale(0.5)' : 'none' }}>
        {item.icon}
      </div>

      {/* Category badge */}
      <span style={{
        display: 'inline-block', padding: '3px 10px', borderRadius: 999,
        background: catColor.bg, color: catColor.text,
        fontFamily: '"Inter",system-ui', fontSize: 10, fontWeight: 700,
        textTransform: 'capitalize', marginBottom: 10,
        alignSelf: 'flex-start',
      }}>
        {item.category}
      </span>

      <div style={{ fontFamily: '"Inter",system-ui', fontSize: 16, fontWeight: 700, color: '#0F1A2E', marginBottom: 6 }}>
        {item.name}
      </div>
      <div style={{ fontFamily: '"Inter",system-ui', fontSize: 12, color: '#5C6477', lineHeight: 1.5, flex: 1, marginBottom: 16 }}>
        {item.desc}
      </div>

      {/* Cost */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
        <span style={{ fontSize: 16 }}>💎</span>
        <span style={{
          fontFamily: '"Inter",system-ui', fontSize: 20, fontWeight: 800,
          color: isOwned ? '#1F8B3A' : canAfford ? '#0F1A2E' : '#C24545',
          letterSpacing: -0.5,
        }}>
          {item.cost.toLocaleString('es-ES')}
        </span>
        {!isOwned && !canAfford && (
          <span style={{ fontFamily: '"Inter",system-ui', fontSize: 11, color: '#C24545', fontWeight: 600 }}>
            (faltan {(item.cost - (window._gemBalance || 0)).toLocaleString('es-ES')})
          </span>
        )}
      </div>

      {/* Button */}
      <button
        onClick={onBuy}
        disabled={isOwned}
        style={{
          padding: '10px 16px', borderRadius: 12, border: 'none',
          cursor: isOwned ? 'default' : 'pointer',
          background: isOwned
            ? '#E7F8EC'
            : justBought
              ? '#E7F8EC'
              : isInsufficient
                ? 'rgba(194,69,69,0.1)'
                : canAfford
                  ? '#0F1A2E'
                  : 'rgba(15,26,46,0.06)',
          color: isOwned
            ? '#1F8B3A'
            : justBought
              ? '#1F8B3A'
              : isInsufficient
                ? '#C24545'
                : canAfford
                  ? '#FAFAF7'
                  : '#9498A4',
          fontFamily: '"Inter",system-ui', fontSize: 13, fontWeight: 700,
          transition: 'all 0.2s',
        }}
      >
        {isOwned
          ? '✓ Adquirido'
          : justBought
            ? '✓ Comprado'
            : isInsufficient
              ? 'Gemas insuficientes'
              : canAfford
                ? 'Comprar'
                : 'No disponible'}
      </button>
    </div>
  );
}

Object.assign(window, { GemsStoreSection });
