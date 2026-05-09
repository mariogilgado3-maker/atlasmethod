// Hero — narrative-led, Apple-style. Big serif eyebrow, Inter headline.
function Hero() {
  const [t, setT] = React.useState(0);
  React.useEffect(() => {
    let raf;
    const tick = () => { setT(performance.now() / 1000); raf = requestAnimationFrame(tick); };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <section style={{
      position: 'relative', overflow: 'hidden',
      padding: '160px 32px 100px',
      background: 'radial-gradient(1200px 600px at 50% -100px, #F0EFEA 0%, #FAFAF7 60%)',
    }}>
      {/* subtle grid */}
      <div style={{
        position: 'absolute', inset: 0, opacity: 0.4, pointerEvents: 'none',
        backgroundImage: 'linear-gradient(rgba(15,26,46,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(15,26,46,0.04) 1px, transparent 1px)',
        backgroundSize: '64px 64px',
        maskImage: 'radial-gradient(ellipse at center top, black 0%, transparent 70%)',
        WebkitMaskImage: 'radial-gradient(ellipse at center top, black 0%, transparent 70%)',
      }} />

      <div style={{ maxWidth: 1180, margin: '0 auto', position: 'relative', textAlign: 'center' }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          padding: '6px 14px 6px 8px', borderRadius: 999,
          background: 'rgba(15,26,46,0.04)', border: '0.5px solid rgba(15,26,46,0.1)',
          fontFamily: '"Inter",system-ui', fontSize: 13, fontWeight: 600, color: '#3A4257',
          marginBottom: 32,
        }}>
          <span style={{
            width: 22, height: 22, borderRadius: 999, background: '#0F1A2E', color: '#FAFAF7',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 11, fontWeight: 800,
          }}>v2</span>
          Ahora con AI Coach en beta
          <span style={{ color: '#9498A4', margin: '0 -4px 0 4px' }}>·</span>
          <span style={{ color: '#0F1A2E' }}>Ver →</span>
        </div>

        <h1 style={{
          fontFamily: '"Inter",system-ui', fontSize: 88, fontWeight: 700,
          color: '#0F1A2E', letterSpacing: -3.5, lineHeight: 0.95,
          margin: 0, marginBottom: 28,
        }}>
          Datos.<br/>
          Decisiones.<br/>
          <span style={{
            fontFamily: '"Instrument Serif", Georgia, serif',
            fontStyle: 'italic', fontWeight: 400, letterSpacing: -2,
          }}>Rendimiento.</span>
        </h1>

        <p style={{
          fontFamily: '"Inter",system-ui', fontSize: 20, fontWeight: 400,
          color: '#3A4257', letterSpacing: -0.3, lineHeight: 1.4,
          maxWidth: 620, margin: '0 auto 44px',
        }}>
          Ciencia aplicada al rendimiento humano. Diseña, ejecuta y optimiza
          tu entrenamiento con inteligencia artificial y evidencia científica.
        </p>

        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginBottom: 64 }}>
          <button style={{
            padding: '15px 26px', borderRadius: 999, border: 'none', cursor: 'pointer',
            background: '#0F1A2E', color: '#FAFAF7',
            fontFamily: '"Inter",system-ui', fontSize: 16, fontWeight: 600, letterSpacing: -0.2,
            display: 'inline-flex', alignItems: 'center', gap: 8,
            boxShadow: '0 1px 0 rgba(255,255,255,0.06) inset, 0 12px 32px -12px rgba(15,26,46,0.6)',
          }}>Iniciar diagnóstico →</button>
          <button style={{
            padding: '15px 26px', borderRadius: 999, cursor: 'pointer',
            background: 'transparent', color: '#0F1A2E',
            border: '1px solid rgba(15,26,46,0.18)',
            fontFamily: '"Inter",system-ui', fontSize: 16, fontWeight: 600, letterSpacing: -0.2,
          }}>Explorar metodología</button>
        </div>

        {/* Hero visual — animated chart */}
        <HeroChart t={t} />
      </div>
    </section>
  );
}

function HeroChart({ t }) {
  const w = 1080, h = 320;
  const pts = [];
  for (let i = 0; i <= 60; i++) {
    const x = (i / 60) * w;
    const phase = (t * 0.3) % (Math.PI * 2);
    const y = h / 2 + Math.sin((i / 60) * Math.PI * 4 + phase) * 60 + Math.sin((i / 60) * Math.PI * 2) * 40;
    pts.push([x, y]);
  }
  const path = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p[0]} ${p[1]}`).join(' ');
  const area = path + ` L ${w} ${h} L 0 ${h} Z`;

  return (
    <div style={{
      maxWidth: 1080, margin: '0 auto',
      borderRadius: 28, overflow: 'hidden',
      background: '#FFFFFF',
      border: '1px solid rgba(15,26,46,0.06)',
      boxShadow: '0 1px 0 rgba(255,255,255,0.6) inset, 0 30px 80px -40px rgba(15,26,46,0.18), 0 4px 12px -4px rgba(15,26,46,0.04)',
      position: 'relative',
    }}>
      {/* Top bar */}
      <div style={{
        padding: '14px 20px', borderBottom: '1px solid rgba(15,26,46,0.06)',
        display: 'flex', alignItems: 'center', gap: 12,
      }}>
        <div style={{ display: 'flex', gap: 6 }}>
          <Dot c="#FF6058" /><Dot c="#FFBD2E" /><Dot c="#28C940" />
        </div>
        <div style={{
          flex: 1, padding: '4px 10px', borderRadius: 6,
          background: 'rgba(15,26,46,0.04)',
          fontFamily: 'ui-monospace,Menlo,monospace', fontSize: 12, color: '#5C6477',
          textAlign: 'center',
        }}>atlasmethod.app/dashboard</div>
        <div style={{ display: 'flex', gap: 6 }}>
          <Pill>● Vivo</Pill>
        </div>
      </div>

      {/* Chart body */}
      <div style={{ padding: '24px 28px', display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 24 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 4 }}>
            <span style={{ fontFamily: '"Inter",system-ui', fontSize: 12, fontWeight: 700, color: '#5C6477', letterSpacing: 0.4, textTransform: 'uppercase' }}>
              Rendimiento · 12 semanas
            </span>
            <span style={{
              padding: '2px 8px', borderRadius: 999,
              background: '#E7F8EC', color: '#1F8B3A',
              fontFamily: '"Inter",system-ui', fontSize: 11, fontWeight: 700,
            }}>+18.4%</span>
          </div>
          <div style={{ fontFamily: '"Inter",system-ui', fontSize: 38, fontWeight: 800, color: '#0F1A2E', letterSpacing: -1.4, lineHeight: 1 }}>
            142<span style={{ fontSize: 18, color: '#5C6477', marginLeft: 6 }}>kg · 1RM proyectado</span>
          </div>

          <svg viewBox={`0 0 ${w} ${h}`} style={{ width: '100%', height: 220, marginTop: 14 }}>
            <defs>
              <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#0F1A2E" stopOpacity="0.18" />
                <stop offset="1" stopColor="#0F1A2E" stopOpacity="0" />
              </linearGradient>
            </defs>
            {[0, 1, 2, 3].map(i => (
              <line key={i} x1="0" y1={h * (i / 3) + 30} x2={w} y2={h * (i / 3) + 30}
                stroke="rgba(15,26,46,0.06)" strokeDasharray="2 6" />
            ))}
            <path d={area} fill="url(#g1)" />
            <path d={path} fill="none" stroke="#0F1A2E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <Stat label="Adherencia" value="94%" trend="+6%" color="#1F8B3A" />
          <Stat label="Volumen / sem" value="24.6t" trend="+12%" color="#1F8B3A" />
          <Stat label="RPE medio" value="7.8" trend="óptimo" color="#0F1A2E" />
          <Stat label="Recuperación" value="87" trend="bien" color="#0F1A2E" />
        </div>
      </div>
    </div>
  );
}

function Dot({ c }) { return <span style={{ width: 12, height: 12, borderRadius: 999, background: c }} />; }
function Pill({ children }) {
  return <span style={{
    padding: '3px 9px', borderRadius: 999, fontFamily: '"Inter",system-ui',
    fontSize: 11, fontWeight: 700, color: '#1F8B3A',
    background: '#E7F8EC',
  }}>{children}</span>;
}
function Stat({ label, value, trend, color }) {
  return (
    <div style={{
      padding: '12px 14px', borderRadius: 14,
      background: '#FAFAF7', border: '1px solid rgba(15,26,46,0.04)',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <span style={{ fontFamily: '"Inter",system-ui', fontSize: 11, fontWeight: 700, color: '#5C6477', letterSpacing: 0.4, textTransform: 'uppercase' }}>{label}</span>
        <span style={{ fontFamily: '"Inter",system-ui', fontSize: 11, fontWeight: 700, color }}>{trend}</span>
      </div>
      <div style={{ fontFamily: '"Inter",system-ui', fontSize: 24, fontWeight: 800, color: '#0F1A2E', letterSpacing: -0.6, marginTop: 2 }}>{value}</div>
    </div>
  );
}

Object.assign(window, { Hero });
