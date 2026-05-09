// Builder — ajustes en tiempo real, no multi-step.
function BuilderSection() {
  const [data, setData] = React.useState({
    objetivo: 'hipertrofia',
    nivel: 'intermedio',
    frecuencia: 4,
    tiempo: 60,
    intensidad: 7,
    enfasis: ['empuje', 'pierna'],
    estilo: 'mixto',
  });
  const update = (k, v) => setData(d => ({ ...d, [k]: v }));
  const toggle = (k, v) => setData(d => ({ ...d, [k]: d[k].includes(v) ? d[k].filter(x => x !== v) : [...d[k], v] }));

  return (
    <section id="builder" style={{ padding: '160px 32px', background: '#FAFAF7', borderTop: '1px solid rgba(15,26,46,0.06)' }}>
      <div style={{ maxWidth: 1180, margin: '0 auto' }}>
        <div style={{ marginBottom: 56, maxWidth: 760 }}>
          <span style={{ fontFamily: '"Inter",system-ui', fontSize: 13, fontWeight: 700, letterSpacing: 1.6, textTransform: 'uppercase', color: '#5C6477' }}>
            Builder · Tiempo real
          </span>
          <h2 style={{ fontFamily: '"Inter",system-ui', fontSize: 56, fontWeight: 700, color: '#0F1A2E', letterSpacing: -2, lineHeight: 1.02, margin: '12px 0 20px' }}>
            Mueve una variable. <span style={{ fontFamily: '"Instrument Serif",serif', fontStyle: 'italic', fontWeight: 400 }}>El plan se adapta.</span>
          </h2>
          <p style={{ fontFamily: '"Inter",system-ui', fontSize: 18, color: '#3A4257', lineHeight: 1.5, letterSpacing: -0.2, margin: 0 }}>
            Sin plantillas estándar. Ajusta nivel, tiempo, intensidad, énfasis y frecuencia — y el sistema reescribe el mesociclo en tiempo real, sin pasos ni esperas.
          </p>
        </div>

        <div style={{
          background: '#FFFFFF', borderRadius: 28, border: '1px solid rgba(15,26,46,0.06)',
          boxShadow: '0 30px 80px -40px rgba(15,26,46,0.18)', overflow: 'hidden',
          display: 'grid', gridTemplateColumns: '0.9fr 1.1fr', minHeight: 640,
        }}>
          {/* LEFT — controls */}
          <div style={{ padding: '32px 36px', borderRight: '1px solid rgba(15,26,46,0.06)', display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div>
              <label style={fieldLabel}>Objetivo</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                {[['hipertrofia','Hipertrofia'],['fuerza','Fuerza'],['recomp','Recomposición'],['rendimiento','Rendimiento']].map(([id,l])=>(
                  <button key={id} onClick={()=>update('objetivo',id)} style={pillBtn(data.objetivo===id)}>{l}</button>
                ))}
              </div>
            </div>

            <div>
              <label style={fieldLabel}>Nivel</label>
              <div style={{ display: 'flex', gap: 6 }}>
                {[['principiante','Principiante'],['intermedio','Intermedio'],['avanzado','Avanzado']].map(([id,l])=>(
                  <button key={id} onClick={()=>update('nivel',id)} style={{ ...pillBtn(data.nivel===id), flex: 1 }}>{l}</button>
                ))}
              </div>
            </div>

            <div>
              <label style={fieldLabel}>Frecuencia · <span style={liveVal}>{data.frecuencia}× / sem</span></label>
              <input type="range" min="2" max="6" step="1" value={data.frecuencia} onChange={e=>update('frecuencia',+e.target.value)} style={sliderStyle} />
              <div style={tickRow}><span>2</span><span>3</span><span>4</span><span>5</span><span>6</span></div>
            </div>

            <div>
              <label style={fieldLabel}>Tiempo por sesión · <span style={liveVal}>{data.tiempo} min</span></label>
              <input type="range" min="30" max="120" step="5" value={data.tiempo} onChange={e=>update('tiempo',+e.target.value)} style={sliderStyle} />
              <div style={tickRow}><span>30</span><span>60</span><span>90</span><span>120</span></div>
            </div>

            <div>
              <label style={fieldLabel}>Intensidad objetivo (RPE) · <span style={liveVal}>{data.intensidad}/10</span></label>
              <input type="range" min="5" max="10" step="0.5" value={data.intensidad} onChange={e=>update('intensidad',+e.target.value)} style={sliderStyle} />
              <div style={tickRow}><span>5</span><span>7</span><span>8</span><span>10</span></div>
            </div>

            <div>
              <label style={fieldLabel}>Énfasis (multi)</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {['empuje','tracción','pierna','core','glúteo','espalda'].map(t=>(
                  <button key={t} onClick={()=>toggle('enfasis',t)} style={pillBtn(data.enfasis.includes(t))}>{t}</button>
                ))}
              </div>
            </div>

            <div>
              <label style={fieldLabel}>Preferencia de ejercicios</label>
              <div style={{ display: 'flex', gap: 6 }}>
                {[['compuestos','Compuestos'],['mixto','Mixto'],['accesorios','Accesorios']].map(([id,l])=>(
                  <button key={id} onClick={()=>update('estilo',id)} style={{ ...pillBtn(data.estilo===id), flex: 1 }}>{l}</button>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT — live preview */}
          <div style={{ padding: '32px 36px', background: '#FAFAF7', position: 'relative' }}>
            <LivePreview data={data} />
          </div>
        </div>
      </div>
    </section>
  );
}

const fieldLabel = { display: 'block', fontFamily: '"Inter",system-ui', fontSize: 12, fontWeight: 700, color: '#5C6477', letterSpacing: 0.6, textTransform: 'uppercase', marginBottom: 10 };
const liveVal = { color: '#0F1A2E', fontWeight: 700, textTransform: 'none', letterSpacing: 0 };
const sliderStyle = { width: '100%', accentColor: '#0F1A2E' };
const tickRow = { display: 'flex', justifyContent: 'space-between', fontFamily: 'ui-monospace,Menlo,monospace', fontSize: 11, color: '#9498A4', marginTop: 4 };
function pillBtn(active) {
  return {
    padding: '9px 14px', borderRadius: 999, cursor: 'pointer',
    border: active ? '1.5px solid #0F1A2E' : '1px solid rgba(15,26,46,0.12)',
    background: active ? '#0F1A2E' : '#FFFFFF',
    color: active ? '#FAFAF7' : '#0F1A2E',
    fontFamily: '"Inter",system-ui', fontSize: 13, fontWeight: 600, letterSpacing: -0.1,
    textTransform: 'capitalize',
    transition: 'all 0.15s',
  };
}

function LivePreview({ data }) {
  const splits = {
    2: ['Full A','Full B'], 3: ['Push','Pull','Legs'],
    4: ['Upper A','Lower A','Upper B','Lower B'],
    5: ['Push','Pull','Legs','Upper','Lower'],
    6: ['Push A','Pull A','Legs A','Push B','Pull B','Legs B'],
  }[data.frecuencia] || ['Full'];

  const baseVol = data.objetivo === 'hipertrofia' ? 18 : data.objetivo === 'fuerza' ? 14 : 16;
  const volMod = (10 - data.intensidad) * 1.4;
  const totalSets = Math.round(baseVol + volMod);
  const exercises = Math.max(3, Math.round(data.tiempo / 10));

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
        <span style={{ fontFamily: 'ui-monospace,Menlo,monospace', fontSize: 11, fontWeight: 700, color: '#5C6477', letterSpacing: 0.6 }}>
          PREVIEW · ACTUALIZACIÓN EN VIVO
        </span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '3px 10px', borderRadius: 999, background: '#E7F8EC', color: '#1F8B3A', fontFamily: '"Inter",system-ui', fontSize: 11, fontWeight: 700 }}>
          <span style={{ width: 6, height: 6, borderRadius: 999, background: '#1F8B3A' }} />Sincronizado
        </span>
      </div>

      <h3 style={{ fontFamily: '"Inter",system-ui', fontSize: 28, fontWeight: 700, color: '#0F1A2E', letterSpacing: -0.8, margin: '0 0 4px', textTransform: 'capitalize' }}>
        Plan · {data.objetivo}
      </h3>
      <p style={{ fontFamily: '"Inter",system-ui', fontSize: 14, color: '#5C6477', margin: '0 0 18px' }}>
        {data.frecuencia}× / sem · {data.tiempo} min · {splits.length} días · RPE {data.intensidad}
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 16 }}>
        <KPI label="Series / sem" v={totalSets * data.frecuencia} />
        <KPI label="Ejerc / sesión" v={exercises} />
        <KPI label="Énfasis" v={data.enfasis.length || '—'} />
      </div>

      <div style={{ display: 'grid', gap: 8 }}>
        {[1,2,3,4].map(w => (
          <div key={w} style={{ background: '#FFFFFF', borderRadius: 12, border: '1px solid rgba(15,26,46,0.06)', overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', borderBottom: '1px solid rgba(15,26,46,0.06)' }}>
              <span style={{ fontFamily: 'ui-monospace,Menlo,monospace', fontSize: 11, fontWeight: 700, color: '#5C6477' }}>SEM {w}</span>
              <span style={{ fontFamily: '"Inter",system-ui', fontSize: 13, fontWeight: 600, color: '#0F1A2E' }}>
                {w===4 ? 'Deload' : ['Acumulación','Acumulación','Intensificación'][w-1]}
              </span>
              <span style={{ marginLeft: 'auto', fontFamily: 'ui-monospace,Menlo,monospace', fontSize: 11, color: '#5C6477' }}>
                Vol {[100,115,90,60][w-1]}%
              </span>
            </div>
            <div style={{ display: 'flex', gap: 1, background: 'rgba(15,26,46,0.06)' }}>
              {splits.map((s, i) => (
                <div key={i} style={{ flex: 1, padding: '9px 6px', background: '#FFFFFF', fontFamily: '"Inter",system-ui', fontSize: 12, fontWeight: 600, color: '#3A4257', textAlign: 'center' }}>{s}</div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <button style={{ width: '100%', marginTop: 18, padding: 14, borderRadius: 12, border: 'none', cursor: 'pointer', background: '#0F1A2E', color: '#FAFAF7', fontFamily: '"Inter",system-ui', fontSize: 14, fontWeight: 700, letterSpacing: -0.1 }}>
        Guardar plan →
      </button>
    </div>
  );
}

function KPI({ label, v }) {
  return (
    <div style={{ padding: '10px 12px', borderRadius: 10, background: '#FFFFFF', border: '1px solid rgba(15,26,46,0.06)' }}>
      <div style={{ fontFamily: '"Inter",system-ui', fontSize: 10, fontWeight: 700, color: '#5C6477', letterSpacing: 0.5, textTransform: 'uppercase' }}>{label}</div>
      <div style={{ fontFamily: '"Inter",system-ui', fontSize: 22, fontWeight: 800, color: '#0F1A2E', letterSpacing: -0.6, marginTop: 2 }}>{v}</div>
    </div>
  );
}

Object.assign(window, { BuilderSection });
