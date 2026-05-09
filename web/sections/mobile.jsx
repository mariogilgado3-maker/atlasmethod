// Synerduo — la app móvil como sección/showcase dentro de Atlas Method
function MobileSection() {
  return (
    <section id="mobile" style={{ padding: '160px 32px', background: '#FAFAF7', borderTop: '1px solid rgba(15,26,46,0.06)' }}>
      <div style={{ maxWidth: 1180, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'center' }}>
        <div>
          <span style={{ fontFamily: '"Inter",system-ui', fontSize: 13, fontWeight: 700, letterSpacing: 1.6, textTransform: 'uppercase', color: '#5C6477' }}>
            Synerduo · App móvil
          </span>
          <h2 style={{
            fontFamily: '"Inter",system-ui', fontSize: 56, fontWeight: 700,
            color: '#0F1A2E', letterSpacing: -2, lineHeight: 1.02,
            margin: '12px 0 20px',
          }}>
            Atlas, en tu <span style={{ fontFamily: '"Instrument Serif",serif', fontStyle: 'italic', fontWeight: 400 }}>bolsillo.</span>
          </h2>
          <p style={{ fontFamily: '"Inter",system-ui', fontSize: 18, color: '#3A4257', lineHeight: 1.5, letterSpacing: -0.2, margin: '0 0 28px' }}>
            La app de campo. Registra cada serie, captura RPE en tres toques, y compite con la comunidad. La web piensa, la app ejecuta.
          </p>

          <div style={{ display: 'grid', gap: 12, marginBottom: 32 }}>
            {[
              ['Sesiones guiadas', 'Cada ejercicio con vídeo, tempo y notas técnicas'],
              ['Captura rápida', 'RPE, RIR y carga en menos de 5 segundos por serie'],
              ['Comunidad y retos', 'Liga semanal, retos por mesociclo, ranking por categoría'],
              ['Sin internet', 'Modo offline para entrenar en cualquier sitio'],
            ].map(([t,d],i)=>(
              <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <span style={{
                  width: 22, height: 22, borderRadius: 999, flexShrink: 0, marginTop: 2,
                  background: '#0F1A2E', color: '#FAFAF7',
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <svg width="11" height="11" viewBox="0 0 20 20" fill="none">
                    <path d="M 5 10 L 8.5 13.5 L 15 6.5" stroke="#FAFAF7" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </span>
                <div>
                  <div style={{ fontFamily: '"Inter",system-ui', fontSize: 15, fontWeight: 700, color: '#0F1A2E', letterSpacing: -0.2 }}>{t}</div>
                  <div style={{ fontFamily: '"Inter",system-ui', fontSize: 13, color: '#5C6477', marginTop: 2, lineHeight: 1.4 }}>{d}</div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <a href="Symmetry.html" style={storeBtn(true)}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="#FAFAF7"><path d="M14.94 10.6a3.97 3.97 0 0 1 1.9-3.34 4.07 4.07 0 0 0-3.21-1.74c-1.34-.14-2.65.8-3.34.8-.7 0-1.76-.78-2.9-.76A4.27 4.27 0 0 0 3.8 7.76c-1.55 2.7-.4 6.66 1.1 8.84.74 1.06 1.6 2.26 2.74 2.22 1.1-.05 1.52-.71 2.85-.71 1.32 0 1.7.71 2.86.69 1.18-.02 1.93-1.08 2.65-2.16a9.55 9.55 0 0 0 1.21-2.5 3.84 3.84 0 0 1-2.27-3.54Zm-2.21-6.5a3.9 3.9 0 0 0 .89-2.8 3.97 3.97 0 0 0-2.57 1.33 3.71 3.71 0 0 0-.92 2.7 3.28 3.28 0 0 0 2.6-1.23Z"/></svg>
              Ver showcase iOS
            </a>
            <a href="#" style={storeBtn(false)}>One-pager PDF</a>
          </div>
        </div>

        {/* Phones */}
        <div style={{ position: 'relative', height: 600 }}>
          <PhoneMock x={0} y={0} rotate={-4} z={2}>
            <PhoneScreenA />
          </PhoneMock>
          <PhoneMock x={150} y={40} rotate={6} z={1}>
            <PhoneScreenB />
          </PhoneMock>
        </div>
      </div>
    </section>
  );
}

function storeBtn(primary) {
  return {
    display: 'inline-flex', alignItems: 'center', gap: 8,
    padding: '13px 22px', borderRadius: 999, cursor: 'pointer', textDecoration: 'none',
    background: primary ? '#0F1A2E' : 'transparent',
    color: primary ? '#FAFAF7' : '#0F1A2E',
    border: primary ? 'none' : '1px solid rgba(15,26,46,0.18)',
    fontFamily: '"Inter",system-ui', fontSize: 14, fontWeight: 600, letterSpacing: -0.2,
  };
}

function PhoneMock({ x, y, rotate, z, children }) {
  return (
    <div style={{
      position: 'absolute', left: x, top: y, zIndex: z,
      width: 280, height: 580,
      transform: `rotate(${rotate}deg)`,
      borderRadius: 44, padding: 9,
      background: '#0F1A2E',
      boxShadow: '0 30px 80px -30px rgba(15,26,46,0.4), 0 8px 16px -4px rgba(15,26,46,0.15)',
    }}>
      <div style={{
        width: '100%', height: '100%', borderRadius: 36, overflow: 'hidden',
        background: '#FAFAF7', position: 'relative',
      }}>
        {/* notch */}
        <div style={{
          position: 'absolute', top: 8, left: '50%', transform: 'translateX(-50%)',
          width: 90, height: 24, borderRadius: 999, background: '#0F1A2E', zIndex: 5,
        }} />
        {children}
      </div>
    </div>
  );
}

function PhoneScreenA() {
  return (
    <div style={{ padding: '50px 18px 18px', height: '100%', display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 4px' }}>
        <span style={{ fontFamily: '"Inter",system-ui', fontSize: 11, fontWeight: 700, color: '#5C6477', letterSpacing: 0.6 }}>HOY · MAR</span>
        <AtlasA size={16} color="#0F1A2E" stroke={9} />
      </div>
      <h3 style={{ fontFamily: '"Inter",system-ui', fontSize: 24, fontWeight: 800, color: '#0F1A2E', letterSpacing: -0.8, margin: '0 0 4px' }}>Upper B</h3>
      <p style={{ fontFamily: '"Inter",system-ui', fontSize: 12, color: '#5C6477', margin: 0 }}>6 ejercicios · 52 min · RPE objetivo 8</p>

      <div style={{
        background: 'linear-gradient(135deg, #0F1A2E, #1A2845)', color: '#FAFAF7',
        borderRadius: 18, padding: 16, marginTop: 6,
      }}>
        <div style={{ fontFamily: '"Inter",system-ui', fontSize: 11, opacity: 0.7, fontWeight: 700, letterSpacing: 0.6 }}>EJERCICIO 1 / 6</div>
        <div style={{ fontFamily: '"Inter",system-ui', fontSize: 20, fontWeight: 700, letterSpacing: -0.4, marginTop: 4 }}>Press banca</div>
        <div style={{ fontFamily: 'ui-monospace,Menlo,monospace', fontSize: 13, opacity: 0.8, marginTop: 2 }}>4 × 6 @ 82.5 kg</div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6, marginTop: 14 }}>
          {[1,1,1,0].map((c,i)=>(
            <div key={i} style={{
              padding: '8px 0', borderRadius: 8, textAlign: 'center',
              background: c ? '#FAFAF7' : 'rgba(255,255,255,0.08)',
              color: c ? '#0F1A2E' : '#FAFAF7',
              fontFamily: 'ui-monospace,Menlo,monospace', fontSize: 11, fontWeight: 700,
            }}>S{i+1}</div>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gap: 8 }}>
        {['Remo pendlay','Press militar','Dominadas'].map((n,i)=>(
          <div key={i} style={{ padding: '10px 12px', borderRadius: 12, background: '#F4F2EC', display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontFamily: '"Inter",system-ui', fontSize: 13, fontWeight: 600, color: '#0F1A2E' }}>{n}</span>
            <span style={{ fontFamily: 'ui-monospace,Menlo,monospace', fontSize: 11, color: '#5C6477' }}>{['4×8','3×8','3×6'][i]}</span>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 'auto', padding: 14, background: '#0F1A2E', color: '#FAFAF7', borderRadius: 14, textAlign: 'center', fontFamily: '"Inter",system-ui', fontSize: 13, fontWeight: 700 }}>
        Empezar serie →
      </div>
    </div>
  );
}

function PhoneScreenB() {
  return (
    <div style={{ padding: '50px 18px 18px', height: '100%', display: 'flex', flexDirection: 'column', gap: 12, background: '#0F1A2E' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 4px' }}>
        <span style={{ fontFamily: '"Inter",system-ui', fontSize: 11, fontWeight: 700, color: 'rgba(250,250,247,0.5)', letterSpacing: 0.6 }}>LIGA · SEMANA 32</span>
        <span style={{ fontFamily: '"Inter",system-ui', fontSize: 11, fontWeight: 700, color: '#7BD68A' }}>● Vivo</span>
      </div>
      <h3 style={{ fontFamily: '"Inter",system-ui', fontSize: 22, fontWeight: 800, color: '#FAFAF7', letterSpacing: -0.8, margin: '0 0 4px' }}>Top de tu liga</h3>

      <div style={{ display: 'grid', gap: 6 }}>
        {[
          ['1','marina_r','2 480 pts'],
          ['2','tú','2 360 pts',true],
          ['3','jorge.lift','2 290 pts'],
          ['4','alex_p','2 110 pts'],
          ['5','carla.f','2 030 pts'],
        ].map((row,i)=>(
          <div key={i} style={{
            padding: '10px 12px', borderRadius: 12,
            background: row[3] ? '#FAFAF7' : 'rgba(255,255,255,0.05)',
            color: row[3] ? '#0F1A2E' : '#FAFAF7',
            display: 'grid', gridTemplateColumns: '24px 1fr auto', gap: 10, alignItems: 'center',
          }}>
            <span style={{ fontFamily: 'ui-monospace,Menlo,monospace', fontSize: 11, fontWeight: 700, opacity: row[3]?1:0.6 }}>{row[0]}</span>
            <span style={{ fontFamily: '"Inter",system-ui', fontSize: 13, fontWeight: 700 }}>{row[1]}</span>
            <span style={{ fontFamily: 'ui-monospace,Menlo,monospace', fontSize: 11, opacity: 0.7 }}>{row[2]}</span>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 8, padding: 14, borderRadius: 14, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ fontFamily: '"Inter",system-ui', fontSize: 11, fontWeight: 700, color: 'rgba(250,250,247,0.5)', letterSpacing: 0.6 }}>RETO ACTIVO</div>
        <div style={{ fontFamily: '"Inter",system-ui', fontSize: 14, fontWeight: 700, color: '#FAFAF7', marginTop: 4 }}>15 sesiones en 21 días</div>
        <div style={{ height: 4, borderRadius: 999, background: 'rgba(255,255,255,0.1)', marginTop: 8, overflow: 'hidden' }}>
          <div style={{ width: '67%', height: '100%', background: '#7BD68A' }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontFamily: 'ui-monospace,Menlo,monospace', fontSize: 10, color: 'rgba(250,250,247,0.5)' }}>
          <span>10 / 15</span><span>6 días restantes</span>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { MobileSection });
