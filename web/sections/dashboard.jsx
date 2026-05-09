// Dashboard — vista simple por defecto + "ver más" para análisis detallado.
function DashboardSection() {
  const [expanded, setExpanded] = React.useState(false);

  return (
    <section id="dashboard" style={{ padding: '160px 32px', background: '#FFFFFF', borderTop: '1px solid rgba(15,26,46,0.06)' }}>
      <div style={{ maxWidth: 1180, margin: '0 auto' }}>
        <div style={{ marginBottom: 56, maxWidth: 760 }}>
          <span style={{ fontFamily: '"Inter",system-ui', fontSize: 13, fontWeight: 700, letterSpacing: 1.6, textTransform: 'uppercase', color: '#5C6477' }}>
            Rendimiento
          </span>
          <h2 style={{ fontFamily: '"Inter",system-ui', fontSize: 56, fontWeight: 700, color: '#0F1A2E', letterSpacing: -2, lineHeight: 1.02, margin: '12px 0 20px' }}>
            Lo esencial. <span style={{ fontFamily: '"Instrument Serif",serif', fontStyle: 'italic', fontWeight: 400 }}>El detalle, si quieres.</span>
          </h2>
          <p style={{ fontFamily: '"Inter",system-ui', fontSize: 18, color: '#3A4257', lineHeight: 1.5, letterSpacing: -0.2, margin: 0 }}>
            Tres datos claros para saber cómo vas. Si solo quieres entrenar, basta. Si quieres analizar — abre el detalle.
          </p>
        </div>

        {/* Simple view — always visible */}
        <div style={{
          background: '#FAFAF7', borderRadius: 24, border: '1px solid rgba(15,26,46,0.06)',
          padding: 28, marginBottom: 14,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 24 }}>
            <div style={{ width: 40, height: 40, borderRadius: 999, background: '#0F1A2E', color: '#FAFAF7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: '"Inter",system-ui', fontSize: 14, fontWeight: 800 }}>JM</div>
            <div>
              <div style={{ fontFamily: '"Inter",system-ui', fontSize: 14, fontWeight: 700, color: '#0F1A2E' }}>Hola Javier</div>
              <div style={{ fontFamily: '"Inter",system-ui', fontSize: 12, color: '#5C6477' }}>Semana 8 · Hipertrofia</div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 22 }}>
            <SimpleMetric label="Progreso" value="+18%" sub="últimas 12 sem" emoji="↗" />
            <SimpleMetric label="Adherencia" value="94%" sub="14 / 15 sesiones" emoji="✓" />
            <SimpleMetric label="Próxima sesión" value="Upper B" sub="hoy · 52 min" emoji="●" />
          </div>

          <div style={{
            padding: '16px 20px', borderRadius: 14,
            background: '#FFFFFF', border: '1px solid rgba(15,26,46,0.06)',
            display: 'flex', alignItems: 'center', gap: 14,
          }}>
            <span style={{ width: 28, height: 28, borderRadius: 999, background: '#E7F8EC', color: '#1F8B3A', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontFamily: '"Inter",system-ui', fontWeight: 700, fontSize: 14, flexShrink: 0 }}>✓</span>
            <p style={{ fontFamily: '"Inter",system-ui', fontSize: 15, color: '#0F1A2E', margin: 0, lineHeight: 1.45, letterSpacing: -0.1 }}>
              Vas bien. Mantén el ritmo esta semana — el sistema sugiere un deload en 7 días.
            </p>
          </div>

          <button onClick={()=>setExpanded(e=>!e)} style={{
            width: '100%', marginTop: 18, padding: 12,
            borderRadius: 10, border: '1px dashed rgba(15,26,46,0.18)',
            background: 'transparent', cursor: 'pointer',
            fontFamily: '"Inter",system-ui', fontSize: 13, fontWeight: 600, color: '#3A4257',
          }}>
            {expanded ? '↑ Ocultar análisis detallado' : '↓ Ver análisis detallado'}
          </button>
        </div>

        {/* Detailed view — opt-in */}
        {expanded && (
          <div style={{
            background: '#FAFAF7', borderRadius: 24, border: '1px solid rgba(15,26,46,0.06)',
            padding: 28, animation: 'fadeIn 0.3s ease',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
              <span style={{ fontFamily: 'ui-monospace,Menlo,monospace', fontSize: 11, fontWeight: 700, color: '#5C6477', letterSpacing: 0.6 }}>
                ANÁLISIS DETALLADO · OPCIONAL
              </span>
              <div style={{ display: 'flex', gap: 6 }}>
                {['Hoy','Semana','Mes','Todo'].map((p,i)=>(
                  <button key={i} style={{
                    padding: '6px 12px', borderRadius: 999, border: 'none', cursor: 'pointer',
                    background: i===1 ? '#0F1A2E' : 'transparent',
                    color: i===1 ? '#FAFAF7' : '#3A4257',
                    fontFamily: '"Inter",system-ui', fontSize: 12, fontWeight: 600,
                  }}>{p}</button>
                ))}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 14 }}>
              <BigMetric span={3} label="Volumen sem" value="24.6" unit="t" trend="+12%" trendColor="#1F8B3A" sub="vs sem ant." />
              <BigMetric span={3} label="RPE medio" value="7.8" unit="/10" trend="óptimo" trendColor="#0F1A2E" sub="rango 7–8" />
              <BigMetric span={3} label="Recuperación" value="87" unit="" trend="↑ HRV 7d" trendColor="#1F8B3A" sub="bien" />
              <BigMetric span={3} label="Sueño" value="6.8" unit="h" trend="-0.4h" trendColor="#C24545" sub="objetivo 8h" />

              <div style={{ gridColumn: 'span 8', padding: 20, borderRadius: 16, background: '#FFFFFF', border: '1px solid rgba(15,26,46,0.06)' }}>
                <div style={cardLabel}>Progresión 1RM · 12 sem</div>
                <ProgressChart />
              </div>

              <div style={{ gridColumn: 'span 4', padding: 20, borderRadius: 16, background: 'linear-gradient(180deg, #0F1A2E 0%, #1A2845 100%)', color: '#FAFAF7' }}>
                <div style={{ fontFamily: 'ui-monospace,Menlo,monospace', fontSize: 11, fontWeight: 700, letterSpacing: 0.6, opacity: 0.7, marginBottom: 12 }}>SUGERENCIAS</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {['Reducir volumen press banca 10%','Extender deload a 5 días','Trabajo unilateral pierna'].map((s,i)=>(
                    <div key={i} style={{ padding: 10, borderRadius: 8, background: 'rgba(255,255,255,0.06)', fontFamily: '"Inter",system-ui', fontSize: 12, fontWeight: 600 }}>
                      {s}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function SimpleMetric({ label, value, sub, emoji }) {
  return (
    <div style={{ padding: '18px 20px', borderRadius: 16, background: '#FFFFFF', border: '1px solid rgba(15,26,46,0.06)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <span style={{ fontFamily: '"Inter",system-ui', fontSize: 12, fontWeight: 700, color: '#5C6477', letterSpacing: 0.4, textTransform: 'uppercase' }}>{label}</span>
        <span style={{ fontFamily: '"Inter",system-ui', fontSize: 18, color: '#0F1A2E' }}>{emoji}</span>
      </div>
      <div style={{ fontFamily: '"Inter",system-ui', fontSize: 30, fontWeight: 800, color: '#0F1A2E', letterSpacing: -1, marginTop: 6, lineHeight: 1 }}>{value}</div>
      <div style={{ fontFamily: '"Inter",system-ui', fontSize: 12, color: '#5C6477', marginTop: 4 }}>{sub}</div>
    </div>
  );
}

const cardLabel = { fontFamily: '"Inter",system-ui', fontSize: 11, fontWeight: 700, color: '#5C6477', letterSpacing: 0.6, textTransform: 'uppercase' };

function BigMetric({ span, label, value, unit, trend, trendColor, sub }) {
  return (
    <div style={{ gridColumn: `span ${span}`, padding: 18, borderRadius: 14, background: '#FFFFFF', border: '1px solid rgba(15,26,46,0.06)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <span style={cardLabel}>{label}</span>
        <span style={{ fontFamily: '"Inter",system-ui', fontSize: 11, fontWeight: 700, color: trendColor }}>{trend}</span>
      </div>
      <div style={{ marginTop: 6, display: 'flex', alignItems: 'baseline', gap: 4 }}>
        <span style={{ fontFamily: '"Inter",system-ui', fontSize: 28, fontWeight: 800, color: '#0F1A2E', letterSpacing: -1, lineHeight: 1 }}>{value}</span>
        <span style={{ fontFamily: '"Inter",system-ui', fontSize: 13, fontWeight: 600, color: '#5C6477' }}>{unit}</span>
      </div>
      <div style={{ fontFamily: '"Inter",system-ui', fontSize: 11, color: '#5C6477', marginTop: 4 }}>{sub}</div>
    </div>
  );
}

function ProgressChart() {
  const w = 800, h = 180;
  const lines = [
    { c: '#0F1A2E', sw: 2.5, data: [40,45,50,52,58,62,68,72,78,82,88,92] },
    { c: '#5C6477', sw: 2, data: [35,38,42,45,48,52,55,58,62,65,68,72] },
    { c: '#9498A4', sw: 1.5, data: [50,55,58,62,68,72,78,82,88,92,98,102] },
  ];
  const max = 110, min = 30;
  const px = (i) => (i / 11) * w;
  const py = (v) => h - ((v - min) / (max - min)) * h;
  return (
    <svg viewBox={`0 0 ${w} ${h+20}`} style={{ width: '100%', height: 180, marginTop: 10 }}>
      {[0,1,2,3].map(i => (
        <line key={i} x1="0" y1={(h/3)*i} x2={w} y2={(h/3)*i} stroke="rgba(15,26,46,0.06)" strokeDasharray="2 6" />
      ))}
      {lines.map((ln, idx) => {
        const path = ln.data.map((v,i)=>`${i===0?'M':'L'} ${px(i)} ${py(v)}`).join(' ');
        return <path key={idx} d={path} fill="none" stroke={ln.c} strokeWidth={ln.sw} strokeLinecap="round" strokeLinejoin="round" />;
      })}
    </svg>
  );
}

Object.assign(window, { DashboardSection });
