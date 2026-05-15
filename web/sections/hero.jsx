// Hero — coach-first, human, science-backed

// ── Demo data cycling in the mockup ──────────────────────────────────────────

const HERO_DEMO_INSIGHTS = [
  {
    status: 'warning',
    icon: '⊘',
    title: 'Entrenas más pecho que espalda',
    body: 'Llevas 4 sesiones sin tracción. Añade remo o dominadas esta semana.',
    action: 'Añadir al Builder',
  },
  {
    status: 'warning',
    icon: '◎',
    title: 'No hay trabajo de core',
    body: 'Sin core, la técnica en sentadilla y peso muerto se resiente.',
    action: 'Ver ejercicios de core',
  },
  {
    status: 'good',
    icon: '⊕',
    title: 'Balance push/pull correcto',
    body: 'Tu historial esta semana muestra un ratio equilibrado. Sigue así.',
    action: null,
  },
];

const HERO_C = {
  warning: { bg:'rgba(180,80,0,0.05)',  border:'rgba(180,80,0,0.16)',  accent:'#B45000', label:'Atención' },
  good:    { bg:'rgba(31,139,58,0.05)', border:'rgba(31,139,58,0.15)', accent:'#1A7A34', label:'Bien' },
  info:    { bg:'rgba(42,111,219,0.05)',border:'rgba(42,111,219,0.14)',accent:'#1A5FC2', label:'Info' },
};

const HERO_SECONDARY = [
  { icon:'↕', title:'Isquios por debajo del óptimo', status:'warning' },
  { icon:'↻', title:'Frecuencia semanal correcta',   status:'good'    },
];

// ── Atlas Coach mockup (decorative product preview) ───────────────────────────

function HeroCoachMockup({ insightIdx }) {
  const insight = HERO_DEMO_INSIGHTS[insightIdx % HERO_DEMO_INSIGHTS.length];
  const c = HERO_C[insight.status];

  return (
    <div style={{
      borderRadius: 22, overflow: 'hidden',
      background: '#FFFFFF',
      border: '1px solid rgba(15,26,46,0.08)',
      boxShadow: '0 2px 4px rgba(15,26,46,0.04), 0 20px 60px -16px rgba(15,26,46,0.16)',
    }}>
      {/* Window chrome */}
      <div style={{
        padding: '11px 16px', borderBottom: '1px solid rgba(15,26,46,0.06)',
        display: 'flex', alignItems: 'center', gap: 8,
        background: 'rgba(250,250,247,0.95)',
      }}>
        <div style={{ display: 'flex', gap: 5 }}>
          {['#FF6058','#FFBD2E','#28C940'].map(bg => (
            <span key={bg} style={{ width:10, height:10, borderRadius:'50%', background:bg, display:'block' }} />
          ))}
        </div>
        <div style={{ flex:1, textAlign:'center', fontFamily:'ui-monospace,Menlo,monospace', fontSize:11, color:'#9498A4' }}>
          atlasmethod.app/coach
        </div>
        <span style={{ padding:'2px 8px', borderRadius:999, background:'rgba(34,197,94,0.1)', border:'1px solid rgba(34,197,94,0.2)', fontFamily:'ui-monospace,Menlo,monospace', fontSize:9, fontWeight:700, color:'#16A34A' }}>
          ● EN VIVO
        </span>
      </div>

      {/* Content */}
      <div style={{ padding:'22px 22px 18px' }}>

        {/* Header */}
        <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:14 }}>
          <span style={{ fontFamily:'"Inter",system-ui', fontSize:10, fontWeight:700, letterSpacing:1.6, textTransform:'uppercase', color:'#9498A4' }}>Atlas Coach</span>
          <span style={{ padding:'2px 7px', borderRadius:999, background:'rgba(42,111,219,0.07)', border:'1px solid rgba(42,111,219,0.14)', fontFamily:'ui-monospace,Menlo,monospace', fontSize:8, fontWeight:700, color:'#2A6FDB', letterSpacing:0.4 }}>CIENCIA APLICADA</span>
        </div>

        {/* Coach message */}
        <p style={{ fontFamily:'"Instrument Serif",serif', fontStyle:'italic', fontSize:16, color:'#3A4257', lineHeight:1.55, margin:'0 0 18px' }}>
          He revisado tus últimas 8 sesiones.<br />Encontré algo que deberías atender.
        </p>

        {/* Primary insight — rotates */}
        <div
          key={insightIdx}
          style={{
            borderRadius:14, border:`1.5px solid ${c.border}`, background:c.bg,
            padding:'14px 16px', marginBottom:10,
            animation:'fadeIn 0.35s ease',
          }}
        >
          <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:7 }}>
            <span style={{ fontFamily:'ui-monospace,Menlo,monospace', fontSize:8, fontWeight:700, color:c.accent, letterSpacing:1, textTransform:'uppercase' }}>
              {insight.status === 'good' ? '✓' : '⚠'} {c.label}
            </span>
          </div>
          <div style={{ fontFamily:'"Inter",system-ui', fontSize:14, fontWeight:700, color:'#0F1A2E', lineHeight:1.25, marginBottom:5 }}>
            {insight.title}
          </div>
          <p style={{ fontFamily:'"Inter",system-ui', fontSize:12, color:'#5C6477', lineHeight:1.55, margin:'0 0 10px' }}>
            {insight.body}
          </p>
          {insight.action && (
            <span style={{ display:'inline-block', padding:'6px 12px', borderRadius:8, background:'#0F1A2E', fontFamily:'"Inter",system-ui', fontSize:11, fontWeight:700, color:'#FAFAF7' }}>
              {insight.action} →
            </span>
          )}
        </div>

        {/* "Además detecté…" label */}
        <div style={{ fontFamily:'"Inter",system-ui', fontSize:11, fontWeight:600, color:'#9498A4', marginBottom:7 }}>
          Además detecté…
        </div>

        {/* Secondary rows */}
        {HERO_SECONDARY.map((s, i) => {
          const sc = HERO_C[s.status];
          return (
            <div key={i} style={{ display:'flex', alignItems:'center', gap:8, padding:'8px 11px', borderRadius:10, background:'#FAFAF7', border:'1px solid rgba(15,26,46,0.06)', marginBottom:5 }}>
              <span style={{ width:22, height:22, borderRadius:6, background:sc.bg, border:`1px solid ${sc.border}`, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'ui-monospace,Menlo,monospace', fontSize:11, color:sc.accent, fontWeight:700, flexShrink:0 }}>
                {s.icon}
              </span>
              <span style={{ fontFamily:'"Inter",system-ui', fontSize:12, fontWeight:600, color:'#0F1A2E', flex:1 }}>
                {s.title}
              </span>
              <span style={{ padding:'2px 7px', borderRadius:999, background:sc.bg, border:`1px solid ${sc.border}`, fontFamily:'ui-monospace,Menlo,monospace', fontSize:8, color:sc.accent, fontWeight:700, letterSpacing:0.3 }}>
                {sc.label}
              </span>
            </div>
          );
        })}

      </div>

      {/* Bottom bar — Builder session mini-preview */}
      <div style={{ padding:'12px 22px', borderTop:'1px solid rgba(15,26,46,0.05)', background:'rgba(15,26,46,0.02)', display:'flex', alignItems:'center', gap:10 }}>
        <div style={{ width:7, height:7, borderRadius:'50%', background:'#22C55E', flexShrink:0 }} />
        <span style={{ fontFamily:'"Inter",system-ui', fontSize:11, color:'#5C6477', fontWeight:500, flex:1 }}>
          Rutina en curso — 5 ejercicios · 18 series
        </span>
        <span style={{ fontFamily:'"Inter",system-ui', fontSize:11, fontWeight:700, color:'#2A6FDB', cursor:'default' }}>
          Continuar →
        </span>
      </div>
    </div>
  );
}

// ── 3-step process ────────────────────────────────────────────────────────────

const HERO_STEPS = [
  {
    n: '01',
    title: 'Configura tu objetivo',
    body:  'Dinos qué quieres lograr — fuerza, músculo o rendimiento — y tu nivel actual.',
  },
  {
    n: '02',
    title: 'Registra tus rutinas',
    body:  'El Builder organiza ejercicios, series y cargas. Guarda y el Coach lo analiza.',
  },
  {
    n: '03',
    title: 'Recibe ajustes inteligentes',
    body:  'El Coach detecta desequilibrios, exceso de fatiga o puntos ciegos semana a semana.',
  },
];

// ── Main hero ─────────────────────────────────────────────────────────────────

function Hero() {
  const { navigate } = useRoute();
  const [insightIdx, setInsightIdx] = React.useState(0);

  React.useEffect(() => {
    const t = setInterval(() => setInsightIdx(i => (i + 1) % HERO_DEMO_INSIGHTS.length), 3800);
    return () => clearInterval(t);
  }, []);

  return (
    <section style={{
      position: 'relative', overflow: 'hidden',
      padding: '140px 48px 100px',
      background: 'radial-gradient(1400px 700px at 60% -80px, #EEF0F7 0%, #FAFAF7 55%)',
    }}>
      {/* Subtle dot grid */}
      <div style={{
        position:'absolute', inset:0, pointerEvents:'none', opacity:0.5,
        backgroundImage:'radial-gradient(circle, rgba(15,26,46,0.08) 1px, transparent 1px)',
        backgroundSize:'32px 32px',
        maskImage:'radial-gradient(ellipse 80% 60% at 60% 0%, black 0%, transparent 70%)',
        WebkitMaskImage:'radial-gradient(ellipse 80% 60% at 60% 0%, black 0%, transparent 70%)',
      }} />

      <div style={{ maxWidth:1200, margin:'0 auto', position:'relative', display:'grid', gridTemplateColumns:'1fr 1.08fr', gap:'72px', alignItems:'center' }}>

        {/* ── LEFT: headline + steps + CTAs ──────────────────────── */}
        <div>

          {/* Badge */}
          <div style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'5px 13px 5px 6px', borderRadius:999, background:'rgba(15,26,46,0.04)', border:'0.5px solid rgba(15,26,46,0.1)', marginBottom:32 }}>
            <span style={{ padding:'2px 8px', borderRadius:999, background:'#0F1A2E', fontFamily:'"Inter",system-ui', fontSize:10, fontWeight:800, color:'#FAFAF7', letterSpacing:0.3 }}>NUEVO</span>
            <span style={{ fontFamily:'"Inter",system-ui', fontSize:13, fontWeight:600, color:'#3A4257' }}>Atlas Coach — análisis inteligente de tu entreno</span>
          </div>

          {/* Headline */}
          <h1 style={{ fontFamily:'"Inter",system-ui', fontSize:66, fontWeight:700, color:'#0F1A2E', letterSpacing:-3, lineHeight:0.95, margin:'0 0 24px' }}>
            Entrena<br/>
            con propósito.{' '}
            <span style={{ display:'block', fontFamily:'"Instrument Serif",serif', fontStyle:'italic', fontWeight:400, letterSpacing:-2, color:'#3A4257' }}>
              Mejora con evidencia.
            </span>
          </h1>

          {/* Subheadline */}
          <p style={{ fontFamily:'"Inter",system-ui', fontSize:18, fontWeight:400, color:'#5C6477', lineHeight:1.6, margin:'0 0 48px', maxWidth:460 }}>
            Un sistema que analiza tu historial, detecta lo que frena tu progreso y te guía semana a semana. Sin tecnicismos. Con resultados.
          </p>

          {/* CTAs */}
          <div style={{ display:'flex', gap:10, marginBottom:56, flexWrap:'wrap' }}>
            <button
              onClick={() => navigate('/builder')}
              style={{ padding:'14px 26px', borderRadius:999, border:'none', cursor:'pointer', background:'#0F1A2E', color:'#FAFAF7', fontFamily:'"Inter",system-ui', fontSize:15, fontWeight:700, letterSpacing:-0.3, boxShadow:'0 12px 32px -12px rgba(15,26,46,0.55)', display:'inline-flex', alignItems:'center', gap:6 }}
            >
              Empezar en el Builder →
            </button>
            <button
              onClick={() => navigate('/coach')}
              style={{ padding:'14px 26px', borderRadius:999, cursor:'pointer', background:'transparent', color:'#0F1A2E', border:'1px solid rgba(15,26,46,0.18)', fontFamily:'"Inter",system-ui', fontSize:15, fontWeight:600, letterSpacing:-0.2 }}
            >
              Ver Atlas Coach
            </button>
          </div>

          {/* 3-step process */}
          <div style={{ display:'flex', flexDirection:'column', gap:0 }}>
            {HERO_STEPS.map((step, i) => (
              <div key={i} style={{ display:'flex', gap:16, paddingBottom: i < HERO_STEPS.length - 1 ? 20 : 0, position:'relative' }}>
                {/* Connector line */}
                {i < HERO_STEPS.length - 1 && (
                  <div style={{ position:'absolute', left:14, top:28, bottom:0, width:1, background:'rgba(15,26,46,0.08)' }} />
                )}
                {/* Number circle */}
                <div style={{ width:28, height:28, borderRadius:'50%', background:'#FFFFFF', border:'1.5px solid rgba(15,26,46,0.12)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, zIndex:1 }}>
                  <span style={{ fontFamily:'ui-monospace,Menlo,monospace', fontSize:9, fontWeight:700, color:'#0F1A2E' }}>{step.n}</span>
                </div>
                {/* Text */}
                <div style={{ paddingTop:4 }}>
                  <div style={{ fontFamily:'"Inter",system-ui', fontSize:14, fontWeight:700, color:'#0F1A2E', marginBottom:3 }}>{step.title}</div>
                  <div style={{ fontFamily:'"Inter",system-ui', fontSize:13, color:'#9498A4', lineHeight:1.55 }}>{step.body}</div>
                </div>
              </div>
            ))}
          </div>

        </div>

        {/* ── RIGHT: Atlas Coach mockup ───────────────────────────── */}
        <div style={{ position:'relative' }}>
          {/* Glow behind card */}
          <div style={{ position:'absolute', inset:-40, background:'radial-gradient(ellipse at center, rgba(42,111,219,0.08) 0%, transparent 70%)', pointerEvents:'none' }} />
          <HeroCoachMockup insightIdx={insightIdx} />

          {/* Floating Builder mini-card */}
          <div style={{
            position:'absolute', bottom:-24, left:-32,
            borderRadius:16, background:'#FFFFFF', border:'1px solid rgba(15,26,46,0.08)',
            boxShadow:'0 8px 24px -8px rgba(15,26,46,0.12)',
            padding:'14px 18px',
            display:'flex', alignItems:'center', gap:12,
            minWidth:220,
          }}>
            <div style={{ width:36, height:36, borderRadius:10, background:'#0F1A2E', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
              <span style={{ fontFamily:'"Inter",system-ui', fontSize:16, color:'#FAFAF7' }}>🏋</span>
            </div>
            <div>
              <div style={{ fontFamily:'"Inter",system-ui', fontSize:11, fontWeight:700, color:'#0F1A2E' }}>Upper A · 6 ejercicios</div>
              <div style={{ fontFamily:'"Inter",system-ui', fontSize:10, color:'#9498A4' }}>Guardado · +30 💎</div>
            </div>
          </div>

          {/* Floating insight dot */}
          <div style={{
            position:'absolute', top:-16, right:24,
            padding:'8px 14px', borderRadius:999,
            background:'#FFFFFF', border:'1px solid rgba(31,139,58,0.18)',
            boxShadow:'0 4px 16px -4px rgba(15,26,46,0.08)',
            display:'flex', alignItems:'center', gap:7,
          }}>
            <span style={{ width:7, height:7, borderRadius:'50%', background:'#22C55E', flexShrink:0, display:'block' }} />
            <span style={{ fontFamily:'"Inter",system-ui', fontSize:12, fontWeight:700, color:'#0F1A2E' }}>Racha de 7 días</span>
          </div>
        </div>

      </div>
    </section>
  );
}

Object.assign(window, { Hero });
