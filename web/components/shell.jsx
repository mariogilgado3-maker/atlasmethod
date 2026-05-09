// Atlas Method — brand mark and shared shell components
const { useState, useEffect, useRef } = React;

// ─── Brand mark ───────────────────────────────────────────────
function AtlasA({ size = 32, color = 'currentColor', stroke = 9 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" style={{ display: 'block' }}>
      <path d="M 20 86 L 50 14 L 80 86" fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" />
      <path d="M 30 60 Q 50 76 70 60" fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" />
      <circle cx="50" cy="60" r={stroke * 0.55} fill={color} />
    </svg>
  );
}

// ─── Hooks ────────────────────────────────────────────────────
function useInView(ref, options = { rootMargin: '-10% 0px' }) {
  const [v, setV] = useState(false);
  useEffect(() => {
    if (!ref.current) return;
    const o = new IntersectionObserver(([e]) => e.isIntersecting && setV(true), options);
    o.observe(ref.current);
    return () => o.disconnect();
  }, []);
  return v;
}

// ─── Nav ──────────────────────────────────────────────────────
function Nav() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const f = () => setScrolled(window.scrollY > 30);
    f(); window.addEventListener('scroll', f);
    return () => window.removeEventListener('scroll', f);
  }, []);
  const goTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      padding: scrolled ? '12px 0' : '20px 0',
      background: scrolled ? 'rgba(250,250,247,0.78)' : 'transparent',
      backdropFilter: scrolled ? 'blur(20px) saturate(180%)' : 'none',
      WebkitBackdropFilter: scrolled ? 'blur(20px) saturate(180%)' : 'none',
      borderBottom: scrolled ? '0.5px solid rgba(15,26,46,0.08)' : 'none',
      transition: 'all 0.3s cubic-bezier(0.2,0.8,0.2,1)',
    }}>
      <div style={{
        maxWidth: 1180, margin: '0 auto', padding: '0 32px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
          <AtlasA size={26} color="#0F1A2E" stroke={9} />
          <span style={{ fontFamily: '"Inter",system-ui', fontWeight: 800, fontSize: 17, letterSpacing: -0.4, color: '#0F1A2E' }}>
            Atlas <span style={{ fontWeight: 500, opacity: 0.55 }}>Method</span>
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
          {[['method','Sistema'],['lab','Laboratorio'],['builder','Builder'],['dashboard','Dashboard'],['coach','AI Coach'],['mobile','Synerduo']].map(([id,l])=>(
            <button key={id} onClick={() => goTo(id)} style={{
              background: 'transparent', border: 'none', cursor: 'pointer',
              fontFamily: '"Inter",system-ui', fontSize: 14, fontWeight: 500,
              color: '#3A4257', letterSpacing: -0.1,
            }}>{l}</button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button style={{
            padding: '9px 16px', borderRadius: 999, border: 'none', cursor: 'pointer',
            background: 'transparent', color: '#0F1A2E',
            fontFamily: '"Inter",system-ui', fontSize: 14, fontWeight: 600,
          }}>Iniciar sesión</button>
          <button style={{
            padding: '9px 18px', borderRadius: 999, border: 'none', cursor: 'pointer',
            background: '#0F1A2E', color: '#FAFAF7',
            fontFamily: '"Inter",system-ui', fontSize: 14, fontWeight: 600, letterSpacing: -0.1,
          }}>Diagnóstico →</button>
        </div>
      </div>
    </nav>
  );
}

Object.assign(window, { AtlasA, Nav, useInView });
