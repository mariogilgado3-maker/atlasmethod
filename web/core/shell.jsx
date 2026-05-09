// AppShell — top nav (functional routing), gem tray, page outlet, transitions

function AppNav() {
  const { route, navigate } = useRoute();
  const { state } = useStore();

  const items = [
    { path: '/', label: 'Inicio' },
    { path: '/aula', label: 'Aula' },
    { path: '/laboratorio', label: 'Laboratorio' },
    { path: '/builder', label: 'Builder' },
    { path: '/perfil', label: 'Perfil' },
  ];

  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 50,
      background: 'rgba(250,250,247,0.85)',
      backdropFilter: 'saturate(180%) blur(20px)',
      WebkitBackdropFilter: 'saturate(180%) blur(20px)',
      borderBottom: '1px solid rgba(15,26,46,0.06)',
    }}>
      <div style={{
        maxWidth: 1280, margin: '0 auto', padding: '14px 32px',
        display: 'flex', alignItems: 'center', gap: 32,
      }}>
        {/* Logo */}
        <a href="#/" onClick={(e)=>{e.preventDefault(); navigate('/');}}
          style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', color: '#0F1A2E' }}>
          <AtlasA size={26} color="#0F1A2E" stroke={9} />
          <span style={{ fontFamily: '"Inter",system-ui', fontWeight: 800, fontSize: 17, letterSpacing: -0.4 }}>
            Atlas <span style={{ fontWeight: 500, opacity: 0.55 }}>Method</span>
          </span>
        </a>

        {/* Routes */}
        <div style={{ display: 'flex', gap: 4, marginLeft: 8 }}>
          {items.map(it => {
            const active = route === it.path;
            return (
              <a key={it.path} href={'#'+it.path}
                onClick={(e)=>{e.preventDefault(); navigate(it.path);}}
                style={{
                  padding: '7px 14px', borderRadius: 999, textDecoration: 'none',
                  fontFamily: '"Inter",system-ui', fontSize: 13, fontWeight: active ? 700 : 500,
                  letterSpacing: -0.1,
                  color: active ? '#FAFAF7' : '#3A4257',
                  background: active ? '#0F1A2E' : 'transparent',
                  transition: 'background 0.18s, color 0.18s',
                }}>
                {it.label}
              </a>
            );
          })}
        </div>

        <div style={{ flex: 1 }} />

        {/* Gem tray */}
        <GemTray />

        {/* User chip */}
        <a href="#/perfil" onClick={(e)=>{e.preventDefault(); navigate('/perfil');}}
          style={{
            display: 'flex', alignItems: 'center', gap: 8, padding: '5px 12px 5px 5px',
            borderRadius: 999, border: '1px solid rgba(15,26,46,0.1)',
            textDecoration: 'none', color: '#0F1A2E',
          }}>
          <span style={{
            width: 26, height: 26, borderRadius: 999,
            background: 'linear-gradient(135deg, #1A2845, #0F1A2E)',
            color: '#FAFAF7',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: '"Inter",system-ui', fontSize: 11, fontWeight: 800,
          }}>{(state.user.name || 'A')[0].toUpperCase()}</span>
          <span style={{ fontFamily: '"Inter",system-ui', fontSize: 13, fontWeight: 600 }}>{state.user.name}</span>
        </a>
      </div>
    </nav>
  );
}

// ─── Gem tray ────────────────────────────────────────
function GemTray() {
  const { state } = useStore();
  const [pulse, setPulse] = React.useState(false);
  const lastBalance = React.useRef(state.gems.balance);

  React.useEffect(() => {
    if (state.gems.balance > lastBalance.current) {
      setPulse(true);
      const t = setTimeout(() => setPulse(false), 800);
      lastBalance.current = state.gems.balance;
      return () => clearTimeout(t);
    }
    lastBalance.current = state.gems.balance;
  }, [state.gems.balance]);

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 6,
      padding: '5px 12px', borderRadius: 999,
      background: 'rgba(15,26,46,0.04)', border: '1px solid rgba(15,26,46,0.08)',
      transform: pulse ? 'scale(1.06)' : 'scale(1)',
      transition: 'transform 0.4s cubic-bezier(.34,1.56,.64,1)',
    }}>
      <Gem size={14} />
      <span style={{
        fontFamily: 'ui-monospace,Menlo,monospace', fontSize: 12, fontWeight: 700,
        color: '#0F1A2E', letterSpacing: -0.2,
      }}>
        {state.gems.balance.toLocaleString('es-ES')}
      </span>
    </div>
  );
}

function Gem({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <defs>
        <linearGradient id="gemG" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#7AC4FF" />
          <stop offset="1" stopColor="#2A6FDB" />
        </linearGradient>
      </defs>
      <path d="M 6 4 L 18 4 L 22 9 L 12 22 L 2 9 Z" fill="url(#gemG)" stroke="#0F1A2E" strokeWidth="1.4" strokeLinejoin="round" />
      <path d="M 6 4 L 9 9 L 2 9 M 18 4 L 15 9 L 22 9 M 9 9 L 12 22 L 15 9 M 9 9 L 15 9" stroke="#FAFAF7" strokeWidth="1" strokeLinejoin="round" fill="none" opacity="0.7" />
    </svg>
  );
}

// ─── Page transition wrapper ────────────────────────
function PageTransition({ routeKey, children }) {
  const [displayed, setDisplayed] = React.useState({ key: routeKey, content: children });
  const [phase, setPhase] = React.useState('in');

  React.useEffect(() => {
    if (routeKey !== displayed.key) {
      setPhase('out');
      const t = setTimeout(() => {
        setDisplayed({ key: routeKey, content: children });
        setPhase('in');
      }, 180);
      return () => clearTimeout(t);
    } else {
      setDisplayed({ key: routeKey, content: children });
    }
  }, [routeKey, children]);

  return (
    <div style={{
      opacity: phase === 'in' ? 1 : 0,
      transform: phase === 'in' ? 'translateY(0)' : 'translateY(8px)',
      transition: 'opacity 0.22s ease, transform 0.22s ease',
    }}>
      {displayed.content}
    </div>
  );
}

Object.assign(window, { AppNav, PageTransition, Gem, GemTray });
