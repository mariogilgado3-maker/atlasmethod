// Sistema Atlas — módulos NO secuenciales.
function MethodSection() {
  const [active, setActive] = React.useState(null);
  const [hover, setHover] = React.useState(null);

  const modules = [
    {
      id: 'diagnostico', n: '01', title: 'Diagnóstico', tag: 'ENTENDER',
      short: 'Punto de partida',
      desc: 'Mapea tu historial, objetivos y limitaciones. Útil si empiezas o si vuelves tras un parón.',
      level: 'Cualquier nivel',
    },
    {
      id: 'diseno', n: '02', title: 'Diseño', tag: 'PLANIFICAR',
      short: 'Construir el plan',
      desc: 'Volumen, intensidad, frecuencia y recuperación según criterios científicos. Para quienes ya saben qué objetivo persiguen.',
      level: 'Intermedio+',
    },
    {
      id: 'ejecucion', n: '03', title: 'Ejecución', tag: 'ENTRENAR',
      short: 'Día a día',
      desc: 'Registro de cargas, RPE y adherencia. Si solo quieres entrenar, este es tu punto de entrada.',
      level: 'Cualquier nivel',
    },
    {
      id: 'ajuste', n: '04', title: 'Ajuste', tag: 'OPTIMIZAR',
      short: 'Iterar y mejorar',
      desc: 'Revisión basada en resultados reales. Para quienes ya tienen datos suficientes y quieren afinar.',
      level: 'Avanzado',
    },
  ];

  const focus = active != null ? modules.find(m => m.id === active) : null;

  return (
    <section id="method" style={{ padding: '160px 32px', background: '#FAFAF7' }}>
      <div style={{ maxWidth: 1180, margin: '0 auto' }}>
        <div style={{ marginBottom: 56, maxWidth: 760 }}>
          <span style={{ fontFamily: '"Inter",system-ui', fontSize: 13, fontWeight: 700, letterSpacing: 1.6, textTransform: 'uppercase', color: '#5C6477' }}>
            El Sistema Atlas
          </span>
          <h2 style={{
            fontFamily: '"Inter",system-ui', fontSize: 56, fontWeight: 700,
            color: '#0F1A2E', letterSpacing: -2, lineHeight: 1.02,
            margin: '12px 0 20px',
          }}>
            Cuatro módulos. <span style={{ fontFamily: '"Instrument Serif",Georgia,serif', fontStyle: 'italic', fontWeight: 400 }}>Tu orden.</span>
          </h2>
          <p style={{ fontFamily: '"Inter",system-ui', fontSize: 18, color: '#3A4257', lineHeight: 1.5, letterSpacing: -0.2, margin: 0 }}>
            No hay un camino correcto. Empieza donde tenga sentido para ti — diagnostícate, diseña un plan, entrena o ajusta lo que ya estás haciendo. Cada módulo funciona por sí solo y se conecta con los demás.
          </p>
        </div>

        {/* 4 module cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 40 }}>
          {modules.map(m => {
            const isActive = active === m.id;
            const isHover = hover === m.id;
            return (
              <button key={m.id}
                onClick={() => setActive(isActive ? null : m.id)}
                onMouseEnter={() => setHover(m.id)}
                onMouseLeave={() => setHover(null)}
                style={{
                  textAlign: 'left', cursor: 'pointer',
                  padding: 24, borderRadius: 18,
                  background: isActive ? '#0F1A2E' : '#FFFFFF',
                  color: isActive ? '#FAFAF7' : '#0F1A2E',
                  border: '1px solid ' + (isActive ? 'transparent' : 'rgba(15,26,46,0.08)'),
                  boxShadow: isHover && !isActive ? '0 12px 32px -12px rgba(15,26,46,0.18)' : 'none',
                  transform: isHover && !isActive ? 'translateY(-3px)' : 'translateY(0)',
                  transition: 'all 0.3s cubic-bezier(0.2,0.8,0.2,1)',
                  display: 'flex', flexDirection: 'column', gap: 14, minHeight: 220,
                }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{
                    fontFamily: 'ui-monospace,Menlo,monospace', fontSize: 11, fontWeight: 700,
                    color: isActive ? 'rgba(250,250,247,0.55)' : '#9498A4', letterSpacing: 0.6,
                  }}>{m.n}</span>
                  <span style={{
                    padding: '3px 8px', borderRadius: 4,
                    background: isActive ? 'rgba(255,255,255,0.12)' : 'rgba(15,26,46,0.06)',
                    color: isActive ? '#FAFAF7' : '#5C6477',
                    fontFamily: 'ui-monospace,Menlo,monospace', fontSize: 10, fontWeight: 700, letterSpacing: 0.6,
                  }}>{m.tag}</span>
                </div>
                <div>
                  <div style={{ fontFamily: '"Inter",system-ui', fontSize: 24, fontWeight: 700, letterSpacing: -0.6 }}>{m.title}</div>
                  <div style={{ fontFamily: '"Inter",system-ui', fontSize: 13, color: isActive ? 'rgba(250,250,247,0.7)' : '#5C6477', marginTop: 4, fontStyle: 'italic' }}>{m.short}</div>
                </div>
                <div style={{
                  marginTop: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  paddingTop: 12, borderTop: '1px solid ' + (isActive ? 'rgba(255,255,255,0.12)' : 'rgba(15,26,46,0.06)'),
                }}>
                  <span style={{ fontFamily: '"Inter",system-ui', fontSize: 12, color: isActive ? 'rgba(250,250,247,0.6)' : '#5C6477', fontWeight: 600 }}>{m.level}</span>
                  <span style={{ fontFamily: '"Inter",system-ui', fontSize: 12, fontWeight: 700 }}>
                    {isActive ? 'Cerrar' : 'Abrir →'}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Detail panel + free network visual */}
        <div style={{
          display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 40,
          padding: 36, borderRadius: 24,
          background: '#FFFFFF', border: '1px solid rgba(15,26,46,0.06)',
          boxShadow: '0 20px 60px -30px rgba(15,26,46,0.15)',
        }}>
          <div>
            {focus ? (
              <>
                <span style={{ fontFamily: 'ui-monospace,Menlo,monospace', fontSize: 11, fontWeight: 700, color: '#5C6477', letterSpacing: 0.6 }}>
                  MÓDULO {focus.n} · {focus.tag}
                </span>
                <h3 style={{ fontFamily: '"Inter",system-ui', fontSize: 38, fontWeight: 700, color: '#0F1A2E', letterSpacing: -1.2, lineHeight: 1.05, margin: '10px 0 14px' }}>
                  {focus.title}
                </h3>
                <p style={{ fontFamily: '"Inter",system-ui', fontSize: 16, color: '#3A4257', lineHeight: 1.55, letterSpacing: -0.15, margin: '0 0 24px', maxWidth: 520 }}>
                  {focus.desc}
                </p>
                <button style={{
                  padding: '12px 20px', borderRadius: 999, border: 'none', cursor: 'pointer',
                  background: '#0F1A2E', color: '#FAFAF7',
                  fontFamily: '"Inter",system-ui', fontSize: 14, fontWeight: 600, letterSpacing: -0.1,
                }}>Empezar por aquí →</button>
              </>
            ) : (
              <>
                <span style={{ fontFamily: 'ui-monospace,Menlo,monospace', fontSize: 11, fontWeight: 700, color: '#5C6477', letterSpacing: 0.6 }}>
                  ¿POR DÓNDE EMPIEZO?
                </span>
                <h3 style={{ fontFamily: '"Inter",system-ui', fontSize: 30, fontWeight: 700, color: '#0F1A2E', letterSpacing: -0.9, lineHeight: 1.15, margin: '10px 0 14px' }}>
                  Tres rutas habituales — pero no las únicas.
                </h3>
                <div style={{ display: 'grid', gap: 10 }}>
                  {[
                    ['Empiezo de cero', 'Diagnóstico → Diseño → Ejecución'],
                    ['Ya entreno, quiero estructurar', 'Diseño → Ejecución → Ajuste'],
                    ['Solo quiero entrenar hoy', 'Ejecución'],
                  ].map(([k,v],i)=>(
                    <div key={i} style={{
                      display: 'grid', gridTemplateColumns: '1fr auto', gap: 16, alignItems: 'center',
                      padding: '14px 16px', borderRadius: 12,
                      background: '#FAFAF7', border: '1px solid rgba(15,26,46,0.04)',
                    }}>
                      <span style={{ fontFamily: '"Inter",system-ui', fontSize: 14, fontWeight: 600, color: '#0F1A2E' }}>{k}</span>
                      <span style={{ fontFamily: 'ui-monospace,Menlo,monospace', fontSize: 12, color: '#5C6477' }}>{v}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Free-form network */}
          <div style={{ position: 'relative', aspectRatio: '1', maxWidth: 360, justifySelf: 'center', width: '100%' }}>
            <ModuleNetwork modules={modules} active={active} hover={hover} />
          </div>
        </div>
      </div>
    </section>
  );
}

function ModuleNetwork({ modules, active, hover }) {
  const positions = [
    { x: 28, y: 28 }, { x: 72, y: 30 },
    { x: 26, y: 72 }, { x: 74, y: 70 },
  ];
  const focusIdx = active ? modules.findIndex(m => m.id === active) : (hover ? modules.findIndex(m => m.id === hover) : -1);

  return (
    <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%' }}>
      <defs>
        <radialGradient id="netHalo">
          <stop offset="0" stopColor="#0F1A2E" stopOpacity="0.15" />
          <stop offset="1" stopColor="#0F1A2E" stopOpacity="0" />
        </radialGradient>
      </defs>

      {positions.map((a, i) => positions.slice(i+1).map((b, j) => {
        const realJ = i + 1 + j;
        const lit = focusIdx === i || focusIdx === realJ;
        return (
          <line key={`${i}-${realJ}`} x1={a.x} y1={a.y} x2={b.x} y2={b.y}
            stroke={lit ? '#0F1A2E' : 'rgba(15,26,46,0.14)'}
            strokeWidth={lit ? 0.5 : 0.3}
            strokeDasharray={lit ? '' : '0.8 0.8'}
            style={{ transition: 'all 0.4s' }} />
        );
      }))}

      {positions.map((p, i) => {
        const lit = focusIdx === i;
        return (
          <g key={i} style={{ transition: 'all 0.4s' }}>
            {lit && <circle cx={p.x} cy={p.y} r="11" fill="url(#netHalo)" />}
            <circle cx={p.x} cy={p.y} r={lit ? 4.5 : 3.2}
              fill={lit ? '#0F1A2E' : '#FFFFFF'}
              stroke="#0F1A2E" strokeWidth={lit ? 0 : 0.6}
              style={{ transition: 'all 0.4s' }} />
            <text x={p.x} y={p.y + 0.6} textAnchor="middle"
              fontFamily="ui-monospace,Menlo,monospace" fontSize="2.4" fontWeight="700"
              fill={lit ? '#FAFAF7' : '#0F1A2E'}
              style={{ transition: 'all 0.4s' }}>
              {modules[i].n}
            </text>
            <text x={p.x} y={p.y + (i < 2 ? -7 : 9)} textAnchor="middle"
              fontFamily="Inter,system-ui" fontSize="3.2" fontWeight="700"
              fill={lit ? '#0F1A2E' : '#5C6477'}>
              {modules[i].title}
            </text>
          </g>
        );
      })}

      {/* center A — connection point, no hierarchy */}
      <g transform="translate(42 44)" opacity="0.5">
        <path d="M 1.5 11 L 8 1 L 14.5 11" fill="none" stroke="#0F1A2E" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M 4.5 7.5 Q 8 9.6 11.5 7.5" fill="none" stroke="#0F1A2E" strokeWidth="1.2" strokeLinecap="round"/>
      </g>
    </svg>
  );
}

Object.assign(window, { MethodSection });
