// Closing CTA + footer
function ClosingSection() {
  return (
    <section style={{ padding: '180px 32px 100px', background: '#FFFFFF', borderTop: '1px solid rgba(15,26,46,0.06)', textAlign: 'center' }}>
      <div style={{ maxWidth: 880, margin: '0 auto' }}>
        <h2 style={{
          fontFamily: '"Inter",system-ui', fontSize: 88, fontWeight: 700,
          color: '#0F1A2E', letterSpacing: -3.5, lineHeight: 0.95, margin: '0 0 28px',
        }}>
          Empieza con un<br/>
          <span style={{ fontFamily: '"Instrument Serif",serif', fontStyle: 'italic', fontWeight: 400 }}>diagnóstico.</span>
        </h2>
        <p style={{ fontFamily: '"Inter",system-ui', fontSize: 20, color: '#3A4257', letterSpacing: -0.3, lineHeight: 1.4, maxWidth: 540, margin: '0 auto 44px' }}>
          12 preguntas. Una semana de prueba. Acceso completo al laboratorio, builder, dashboard y AI Coach.
        </p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
          <button style={{
            padding: '17px 30px', borderRadius: 999, border: 'none', cursor: 'pointer',
            background: '#0F1A2E', color: '#FAFAF7',
            fontFamily: '"Inter",system-ui', fontSize: 16, fontWeight: 600, letterSpacing: -0.2,
            boxShadow: '0 12px 32px -12px rgba(15,26,46,0.6)',
          }}>Iniciar diagnóstico →</button>
          <button style={{
            padding: '17px 30px', borderRadius: 999, cursor: 'pointer',
            background: 'transparent', color: '#0F1A2E',
            border: '1px solid rgba(15,26,46,0.18)',
            fontFamily: '"Inter",system-ui', fontSize: 16, fontWeight: 600, letterSpacing: -0.2,
          }}>Ver demo</button>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  const cols = [
    ['Producto', ['Sistema Atlas','Laboratorio','Builder','Dashboard','AI Coach','Synerduo (iOS)']],
    ['Recursos', ['Metodología','Investigación','Glosario','Cambios','Estado del sistema']],
    ['Empresa', ['Sobre Atlas','Equipo','Contacto','Prensa','Política de privacidad']],
  ];
  return (
    <footer style={{ padding: '80px 32px 40px', background: '#FAFAF7', borderTop: '1px solid rgba(15,26,46,0.06)' }}>
      <div style={{ maxWidth: 1180, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr 1fr', gap: 60, marginBottom: 60 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <AtlasA size={28} color="#0F1A2E" stroke={9} />
              <span style={{ fontFamily: '"Inter",system-ui', fontWeight: 800, fontSize: 18, letterSpacing: -0.4, color: '#0F1A2E' }}>
                Atlas <span style={{ fontWeight: 500, opacity: 0.55 }}>Method</span>
              </span>
            </div>
            <p style={{ fontFamily: '"Inter",system-ui', fontSize: 14, color: '#5C6477', lineHeight: 1.5, margin: '16px 0 0', maxWidth: 320 }}>
              Datos. Decisiones. Rendimiento.<br/>
              Ciencia aplicada al rendimiento humano.
            </p>
          </div>
          {cols.map(([t,items],i)=>(
            <div key={i}>
              <div style={{ fontFamily: '"Inter",system-ui', fontSize: 12, fontWeight: 700, color: '#3A4257', letterSpacing: 0.6, textTransform: 'uppercase', marginBottom: 16 }}>{t}</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {items.map((l,j)=>(
                  <a key={j} href="#" style={{ fontFamily: '"Inter",system-ui', fontSize: 14, color: '#5C6477', textDecoration: 'none' }}>{l}</a>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 24, borderTop: '1px solid rgba(15,26,46,0.08)' }}>
          <span style={{ fontFamily: '"Inter",system-ui', fontSize: 12, color: '#9498A4' }}>© 2025 Atlas Method · Madrid</span>
          <span style={{ fontFamily: 'ui-monospace,Menlo,monospace', fontSize: 11, color: '#9498A4' }}>v2.1.0 · build 2026.04</span>
        </div>
      </div>
    </footer>
  );
}

Object.assign(window, { ClosingSection, Footer });
