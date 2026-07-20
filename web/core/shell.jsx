// AppShell — top nav (functional routing), gem tray, page outlet, transitions

// Tracks the mobile breakpoint (<680px) with a resize listener. Matches the
// isMobile checks scattered through the section components.
function useIsMobile(bp = 680) {
  const [m, setM] = React.useState(() => typeof window !== 'undefined' && window.innerWidth < bp);
  React.useEffect(() => {
    const onResize = () => setM(window.innerWidth < bp);
    window.addEventListener('resize', onResize);
    onResize();
    return () => window.removeEventListener('resize', onResize);
  }, [bp]);
  return m;
}

// Anchored dropdown menu rendered in a portal on <body> with position:fixed, so
// it's never clipped by an ancestor's overflow (e.g. a card's overflow:hidden or
// the global overflow-x:clip) and always sits above the tab bar. Positioned from
// the trigger's getBoundingClientRect; flips upward near the bottom of the screen.
function AtlasMenu({ open, anchorRef, onClose, width = 184, children }) {
  const [, force] = React.useState(0);
  React.useEffect(() => {
    if (!open) return;
    const rerender = () => force(n => n + 1);
    const close = () => onClose && onClose();
    window.addEventListener('resize', rerender);
    // Close on scroll so the fixed menu can't detach from its trigger
    window.addEventListener('scroll', close, true);
    return () => { window.removeEventListener('resize', rerender); window.removeEventListener('scroll', close, true); };
  }, [open, onClose]);

  if (!open || !anchorRef?.current || typeof ReactDOM === 'undefined' || !ReactDOM.createPortal) return null;
  const r = anchorRef.current.getBoundingClientRect();
  const vw = window.innerWidth, vh = window.innerHeight;
  const left = Math.max(8, Math.min(r.right - width, vw - width - 8));
  const openUp = (vh - r.bottom) < 200;
  const pos = openUp ? { bottom: Math.round(vh - r.top + 6) } : { top: Math.round(r.bottom + 6) };

  return ReactDOM.createPortal(
    React.createElement(React.Fragment, null,
      React.createElement('div', { onClick: onClose, style: { position: 'fixed', inset: 0, zIndex: 3000 } }),
      React.createElement('div', {
        style: {
          position: 'fixed', left: Math.round(left), ...pos, width, zIndex: 3001,
          background: '#0E1A2C', border: '1px solid rgba(255,255,255,0.10)', borderRadius: 12,
          boxShadow: '0 16px 44px rgba(0,0,0,0.55)', overflow: 'hidden',
          animation: 'fadeIn .12s ease',
        },
      }, children)
    ),
    document.body
  );
}

// Minimal stroke icons for the mobile tab bar
function NavIcon({ name, color }) {
  const p = { width: 22, height: 22, viewBox: '0 0 24 24', fill: 'none', stroke: color, strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' };
  if (name === 'home')    return <svg {...p}><path d="M3 10.5 12 3l9 7.5" /><path d="M5 9.5V21h14V9.5" /></svg>;
  if (name === 'coach')   return <svg {...p}><path d="M4 5h16v10H9l-4 4v-4H4z" /></svg>;
  if (name === 'builder') return <svg {...p}><path d="M4 6h16M4 12h16M4 18h10" /></svg>;
  if (name === 'play')    return <svg {...p}><path d="M7 4.5v15l12-7.5z" fill={color} /></svg>;
  if (name === 'rutinas') return <svg {...p}><path d="M6 3h12a1 1 0 0 1 1 1v17l-7-4-7 4V4a1 1 0 0 1 1-1z" /></svg>;
  if (name === 'aula')    return <svg {...p}><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5z" /><path d="M4 20.5A2.5 2.5 0 0 1 6.5 18H20" /></svg>;
  if (name === 'user')    return <svg {...p}><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4 4-6 8-6s8 2 8 6" /></svg>;
  return null;
}

// Fixed bottom tab bar for mobile — native-app style navigation
function AppMobileTabBar() {
  const { route, navigate } = useRoute();
  const tabs = [
    { path: '/',        label: 'Inicio',   icon: 'home' },
    { path: '/coach',   label: 'Coach',    icon: 'coach' },
    { path: '/builder', label: 'Builder',  icon: 'builder' },
    { path: '/rutinas', label: 'Rutinas',  icon: 'rutinas' },
    { path: '/aula',    label: 'Aula',     icon: 'aula' },
  ];
  const ACTIVE = '#3B82F6';
  const IDLE   = 'rgba(250,250,247,0.5)';
  return (
    <nav style={{
      position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 300,
      background: '#0F1A2E', borderTop: '1px solid rgba(255,255,255,0.08)',
      paddingBottom: 'env(safe-area-inset-bottom)',
      display: 'flex', alignItems: 'stretch',
    }}>
      {tabs.map(t => {
        const active = route === t.path;
        const color = active ? ACTIVE : IDLE;
        return (
          <a key={t.path} href={'#' + t.path}
            onClick={(e) => { e.preventDefault(); navigate(t.path); }}
            style={{
              flex: 1, height: 56, textDecoration: 'none',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 3,
              color, transition: 'color .15s',
            }}>
            <NavIcon name={t.icon} color={color} />
            <span style={{ fontFamily: '"Inter",system-ui', fontSize: 10, fontWeight: active ? 700 : 500, letterSpacing: -0.1 }}>{t.label}</span>
          </a>
        );
      })}
    </nav>
  );
}

// Slim mobile top header — logo + gems + profile avatar (Perfil lives here now
// that the bottom tab bar is Inicio·Coach·Builder·Rutinas·Aula)
function AppMobileHeader() {
  const { route, navigate } = useRoute();
  const { state } = useStore();
  const perfilActive = route === '/perfil';
  return (
    <nav className="atlas-mobile-header" style={{
      position: 'sticky', top: 0, zIndex: 50,
      background: 'rgba(250,250,247,0.9)',
      backdropFilter: 'saturate(180%) blur(20px)',
      WebkitBackdropFilter: 'saturate(180%) blur(20px)',
      borderBottom: '1px solid rgba(15,26,46,0.06)',
      // Sit below the iPhone status bar / notch (viewport-fit=cover)
      paddingTop: 'env(safe-area-inset-top)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, padding: '11px 16px' }}>
        <a href="#/" onClick={(e) => { e.preventDefault(); navigate('/'); }}
          style={{ display: 'flex', alignItems: 'center', gap: 9, textDecoration: 'none', color: '#0F1A2E', minWidth: 0 }}>
          <AtlasA size={24} color="#0F1A2E" stroke={9} />
          <span style={{ fontFamily: '"Inter",system-ui', fontWeight: 800, fontSize: 16, letterSpacing: -0.4, whiteSpace: 'nowrap' }}>
            Atlas <span style={{ fontWeight: 500, opacity: 0.55 }}>Method</span>
          </span>
        </a>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
          <GemTray />
          <button aria-label="Perfil" onClick={() => navigate('/perfil')}
            style={{ width: 34, height: 34, borderRadius: 999, flexShrink: 0, cursor: 'pointer', padding: 0,
              border: perfilActive ? '2px solid #3B82F6' : '1px solid rgba(15,26,46,0.12)',
              background: 'linear-gradient(135deg, #1A2845, #0F1A2E)', color: '#FAFAF7',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: '"Inter",system-ui', fontSize: 13, fontWeight: 800 }}>
            {(state.user?.name || 'A')[0].toUpperCase()}
          </button>
        </div>
      </div>
    </nav>
  );
}

function AppNav() {
  const { route, navigate } = useRoute();
  const { state } = useStore();
  const isMobile = useIsMobile();

  const items = [
    { path: '/', label: 'Inicio' },
    { path: '/aula', label: 'Aula' },
    { path: '/builder', label: 'Builder' },
    { path: '/rutinas', label: 'Mis rutinas' },
    { path: '/coach', label: 'Atlas Coach' },
    { path: '/progreso', label: 'Progreso' },
    { path: '/perfil', label: 'Perfil' },
  ];

  // Mobile: slim top header + fixed bottom tab bar (native-app navigation)
  if (isMobile) {
    return (
      <>
        <AppMobileHeader />
        <AppMobileTabBar />
      </>
    );
  }

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

Object.assign(window, { AppNav, PageTransition, Gem, GemTray, AtlasMenu, useIsMobile });
