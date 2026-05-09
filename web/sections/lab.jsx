// Laboratorio — rediseño editorial. Portada de revista científica moderna.
// Capas: masthead → categorías → hero → "above the fold" 3-col → grid asimétrico → strip de números
function LabSection() {
  const [cat, setCat] = useState('todos');
  const cats = [
    { id: 'todos', label: 'Todos' },
    { id: 'fuerza', label: 'Fuerza' },
    { id: 'hipertrofia', label: 'Hipertrofia' },
    { id: 'recuperacion', label: 'Recuperación' },
    { id: 'nutricion', label: 'Nutrición' },
    { id: 'sueno', label: 'Sueño' },
    { id: 'cognitivo', label: 'Cognitivo' },
  ];

  // Issue header
  const issue = { num: 'N° 47', date: 'Abril 2026', section: 'Laboratorio Atlas' };

  return (
    <section id="lab" style={{ background: '#FFFFFF', borderTop: '1px solid rgba(15,26,46,0.06)' }}>
      {/* ─── Masthead ─────────────────────────────────────────── */}
      <div style={{
        padding: '48px 32px 24px', borderBottom: '2px solid #0F1A2E',
        background: '#FFFFFF',
      }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 32, marginBottom: 22 }}>
            <div style={{ flex: 1 }}>
              <div style={{
                fontFamily: 'ui-monospace,Menlo,monospace', fontSize: 11, fontWeight: 700,
                color: '#5C6477', letterSpacing: 1.6, textTransform: 'uppercase', marginBottom: 4,
              }}>
                {issue.section} · {issue.num} · {issue.date}
              </div>
              <h2 style={{
                fontFamily: '"Instrument Serif", Georgia, serif',
                fontSize: 96, fontWeight: 400, fontStyle: 'italic',
                color: '#0F1A2E', letterSpacing: -3, lineHeight: 0.92,
                margin: 0,
              }}>
                Laboratorio<span style={{ fontStyle: 'normal', fontFamily: '"Inter",system-ui', fontWeight: 700, fontSize: 96, letterSpacing: -3.5 }}>.</span>
              </h2>
            </div>
            <div style={{ textAlign: 'right', maxWidth: 280, paddingTop: 8 }}>
              <p style={{ fontFamily: '"Inter",system-ui', fontSize: 14, color: '#3A4257', lineHeight: 1.5, letterSpacing: -0.1, margin: 0 }}>
                Investigación aplicada al rendimiento humano. Cada artículo responde tres preguntas: <em>qué dice la ciencia, cómo se aplica, dónde fallamos.</em>
              </p>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 12,
                padding: '5px 11px', borderRadius: 999,
                background: 'rgba(15,26,46,0.04)', border: '1px solid rgba(15,26,46,0.08)',
                fontFamily: 'ui-monospace,Menlo,monospace', fontSize: 11, fontWeight: 700, color: '#3A4257',
              }}>
                <span style={{ width: 6, height: 6, borderRadius: 999, background: '#1F8B3A', boxShadow: '0 0 6px #1F8B3A' }} />
                81 papers indexados · actualizado hoy
              </div>
            </div>
          </div>

          {/* Category strip — editorial nav */}
          <nav style={{
            display: 'flex', gap: 0, alignItems: 'center',
            paddingTop: 16, borderTop: '1px solid rgba(15,26,46,0.1)',
            overflow: 'auto',
          }}>
            <span style={{
              fontFamily: 'ui-monospace,Menlo,monospace', fontSize: 11, fontWeight: 700,
              color: '#5C6477', letterSpacing: 1.4, textTransform: 'uppercase',
              paddingRight: 20, borderRight: '1px solid rgba(15,26,46,0.1)', marginRight: 4,
              whiteSpace: 'nowrap',
            }}>SECCIONES</span>
            {cats.map((c, i) => (
              <button key={c.id} onClick={() => setCat(c.id)} style={{
                padding: '8px 18px', border: 'none', cursor: 'pointer',
                background: 'transparent',
                fontFamily: '"Inter",system-ui', fontSize: 13, fontWeight: cat === c.id ? 800 : 500,
                color: cat === c.id ? '#0F1A2E' : '#5C6477',
                letterSpacing: -0.1, whiteSpace: 'nowrap',
                position: 'relative', transition: 'color 0.2s',
              }}>
                {c.label}
                {cat === c.id && (
                  <span style={{
                    position: 'absolute', left: 18, right: 18, bottom: -17, height: 2,
                    background: '#0F1A2E',
                  }} />
                )}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* ─── Hero feature ─────────────────────────────────────── */}
      <FeaturedHero />

      {/* ─── Above the fold: 3 columnas (lead + secundario + opinion) ─ */}
      <AboveFold />

      {/* ─── Grid asimétrico ─────────────────────────────────── */}
      <AsymmetricGrid />

      {/* ─── Numbers strip ──────────────────────────────────── */}
      <NumbersStrip />

      {/* ─── Más leídos ─────────────────────────────────────── */}
      <MostRead />
    </section>
  );
}

// ════════════════════════════════════════════════════════════
// HERO — full-bleed feature article
// ════════════════════════════════════════════════════════════
function FeaturedHero() {
  return (
    <article style={{
      borderBottom: '1px solid rgba(15,26,46,0.1)',
      padding: '48px 32px 56px',
    }}>
      <div style={{
        maxWidth: 1280, margin: '0 auto',
        display: 'grid', gridTemplateColumns: '1.15fr 1fr', gap: 56, alignItems: 'center',
      }}>
        {/* visual */}
        <div style={{
          aspectRatio: '4/3', borderRadius: 8, overflow: 'hidden', position: 'relative',
          background: 'linear-gradient(135deg, #0F1A2E 0%, #1A2845 60%, #2A3A5E 100%)',
        }}>
          <FeatureViz />
          <div style={{
            position: 'absolute', top: 16, left: 16,
            padding: '5px 11px', borderRadius: 999,
            background: 'rgba(250,250,247,0.95)', backdropFilter: 'blur(8px)',
            fontFamily: 'ui-monospace,Menlo,monospace', fontSize: 10, fontWeight: 700,
            color: '#0F1A2E', letterSpacing: 1.2, textTransform: 'uppercase',
          }}>● Portada · Long read</div>
        </div>

        {/* text */}
        <div>
          <div style={{
            fontFamily: 'ui-monospace,Menlo,monospace', fontSize: 11, fontWeight: 700,
            color: '#A23E2E', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 14,
          }}>FUERZA · INVESTIGACIÓN ORIGINAL</div>

          <h1 style={{
            fontFamily: '"Instrument Serif", Georgia, serif',
            fontSize: 64, fontWeight: 400, lineHeight: 0.98, letterSpacing: -1.4,
            color: '#0F1A2E', margin: '0 0 20px',
          }}>
            El mito del fallo muscular,<br/>
            <em>revisado con 1 200 atletas.</em>
          </h1>

          <p style={{
            fontFamily: '"Inter",system-ui', fontSize: 19, fontWeight: 400,
            color: '#3A4257', lineHeight: 1.45, letterSpacing: -0.2,
            margin: '0 0 24px',
          }}>
            Un meta-análisis de 14 estudios indica que entrenar al fallo en cada serie no maximiza la hipertrofia — y compromete el progreso de fuerza. Reanalizamos los datos por nivel de experiencia y encontramos un patrón que cambia cómo deberías programar tus últimas series.
          </p>

          <div style={{
            display: 'flex', alignItems: 'center', gap: 14, paddingTop: 20,
            borderTop: '1px solid rgba(15,26,46,0.1)',
          }}>
            <div style={{
              width: 40, height: 40, borderRadius: 999,
              background: 'linear-gradient(135deg, #C8B98F, #8A7A50)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: '"Inter",system-ui', fontSize: 13, fontWeight: 800, color: '#0F1A2E',
            }}>DR</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: '"Inter",system-ui', fontSize: 13, fontWeight: 700, color: '#0F1A2E' }}>
                Dr. Daniel Ruiz <span style={{ fontWeight: 400, color: '#5C6477' }}>· Atlas Lab</span>
              </div>
              <div style={{ fontFamily: '"Inter",system-ui', fontSize: 12, color: '#5C6477' }}>
                12 abr 2026 · 18 min de lectura · 14 referencias
              </div>
            </div>
            <button style={{
              padding: '11px 18px', borderRadius: 999, border: 'none', cursor: 'pointer',
              background: '#0F1A2E', color: '#FAFAF7',
              fontFamily: '"Inter",system-ui', fontSize: 13, fontWeight: 700, letterSpacing: -0.1,
            }}>Leer →</button>
          </div>
        </div>
      </div>
    </article>
  );
}

function FeatureViz() {
  // Stylized strength curve viz with annotations
  return (
    <svg viewBox="0 0 800 600" style={{ width: '100%', height: '100%', display: 'block' }}>
      <defs>
        <linearGradient id="featGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FAFAF7" stopOpacity="0.3" />
          <stop offset="1" stopColor="#FAFAF7" stopOpacity="0" />
        </linearGradient>
        <filter id="glow"><feGaussianBlur stdDeviation="3" /></filter>
      </defs>
      {/* grid */}
      {[1,2,3,4,5].map(i => (
        <line key={'h'+i} x1="60" y1={120+i*80} x2="740" y2={120+i*80} stroke="rgba(250,250,247,0.06)" strokeDasharray="2 6" />
      ))}
      {[1,2,3,4,5,6,7].map(i => (
        <line key={'v'+i} x1={60+i*100} y1="120" x2={60+i*100} y2="520" stroke="rgba(250,250,247,0.06)" strokeDasharray="2 6" />
      ))}

      {/* curve A — failure */}
      <path d="M 60 460 Q 200 380 360 320 T 740 280" fill="none"
        stroke="rgba(250,250,247,0.4)" strokeWidth="2" strokeDasharray="4 6" />

      {/* curve B — RIR 2 — main */}
      <path d="M 60 480 Q 200 360 380 240 T 740 140 L 740 520 L 60 520 Z" fill="url(#featGrad)" />
      <path d="M 60 480 Q 200 360 380 240 T 740 140" fill="none"
        stroke="#FAFAF7" strokeWidth="3" strokeLinecap="round" />

      {/* points */}
      {[[60,480],[180,400],[300,320],[420,250],[540,200],[660,165],[740,140]].map(([x,y],i)=>(
        <circle key={i} cx={x} cy={y} r="4" fill="#FAFAF7" />
      ))}
      {/* highlight */}
      <circle cx="540" cy="200" r="14" fill="none" stroke="#FAFAF7" strokeWidth="1" opacity="0.3" />
      <circle cx="540" cy="200" r="22" fill="none" stroke="#FAFAF7" strokeWidth="0.5" opacity="0.2" />

      {/* labels */}
      <text x="60" y="70" fontFamily="ui-monospace,Menlo,monospace" fontSize="14" fontWeight="700" fill="#FAFAF7" letterSpacing="2">HIPERTROFIA · 12 SEM</text>
      <text x="60" y="100" fontFamily="Inter,system-ui" fontSize="11" fill="rgba(250,250,247,0.5)">% incremento sección transversal cuádriceps</text>

      <text x="540" y="180" fontFamily="Inter,system-ui" fontSize="11" fontWeight="700" fill="#FAFAF7" textAnchor="middle">RIR 1–2</text>
      <text x="540" y="234" fontFamily="ui-monospace,Menlo,monospace" fontSize="10" fill="rgba(250,250,247,0.7)" textAnchor="middle">+18.4% Δ</text>

      <text x="370" y="335" fontFamily="Inter,system-ui" fontSize="11" fill="rgba(250,250,247,0.5)" textAnchor="middle">al fallo (control)</text>

      <text x="60" y="555" fontFamily="ui-monospace,Menlo,monospace" fontSize="10" fill="rgba(250,250,247,0.5)">SEM 0</text>
      <text x="740" y="555" fontFamily="ui-monospace,Menlo,monospace" fontSize="10" fill="rgba(250,250,247,0.5)" textAnchor="end">SEM 12</text>

      <text x="740" y="580" fontFamily="ui-monospace,Menlo,monospace" fontSize="9" fill="rgba(250,250,247,0.4)" textAnchor="end">FUENTE: META-ANÁLISIS ATLAS LAB · n=1 247</text>
    </svg>
  );
}

// ════════════════════════════════════════════════════════════
// ABOVE THE FOLD — 3 columnas estilo periódico
// ════════════════════════════════════════════════════════════
function AboveFold() {
  return (
    <div style={{
      padding: '0 32px 56px',
      borderBottom: '1px solid rgba(15,26,46,0.1)',
    }}>
      <div style={{
        maxWidth: 1280, margin: '0 auto',
        display: 'grid', gridTemplateColumns: '1.6fr 1fr 1fr', gap: 40,
      }}>
        {/* COL 1 — lead secundario con imagen */}
        <article style={{ borderRight: '1px solid rgba(15,26,46,0.08)', paddingRight: 40 }}>
          <div style={{
            aspectRatio: '16/9', borderRadius: 6, marginBottom: 18, overflow: 'hidden',
            background: 'linear-gradient(135deg, #C8B98F 0%, #E0D5B0 100%)',
            position: 'relative',
          }}>
            <RecoveryViz />
            <div style={{
              position: 'absolute', bottom: 12, left: 12,
              padding: '4px 9px', borderRadius: 4,
              background: 'rgba(15,26,46,0.9)', color: '#FAFAF7',
              fontFamily: 'ui-monospace,Menlo,monospace', fontSize: 10, fontWeight: 700, letterSpacing: 1,
            }}>VIDEO · 4 MIN</div>
          </div>
          <div style={{
            fontFamily: 'ui-monospace,Menlo,monospace', fontSize: 11, fontWeight: 700,
            color: '#A23E2E', letterSpacing: 1.6, textTransform: 'uppercase', marginBottom: 10,
          }}>RECUPERACIÓN · DOSSIER</div>
          <h3 style={{
            fontFamily: '"Instrument Serif", Georgia, serif',
            fontSize: 38, fontWeight: 400, lineHeight: 1.05, letterSpacing: -1,
            color: '#0F1A2E', margin: '0 0 12px',
          }}>
            HRV: lo que tu reloj mide bien, mal y nunca.
          </h3>
          <p style={{
            fontFamily: '"Inter",system-ui', fontSize: 15, color: '#3A4257',
            lineHeight: 1.5, letterSpacing: -0.1, margin: '0 0 16px',
          }}>
            Reanalizamos 6 meses de datos de un wearable popular contra ECG clínico. La precisión cae un 23% durante entrenamiento, y la "puntuación de recuperación" del fabricante tiene una correlación de apenas 0.31 con el rendimiento real al día siguiente.
          </p>
          <Byline name="Marta Solís" lab="Atlas Lab · Fisiología" date="10 abr" read="11 min" />
        </article>

        {/* COL 2 — secundario sin imagen, denso */}
        <article style={{ borderRight: '1px solid rgba(15,26,46,0.08)', paddingRight: 40 }}>
          <div style={{
            fontFamily: 'ui-monospace,Menlo,monospace', fontSize: 11, fontWeight: 700,
            color: '#A23E2E', letterSpacing: 1.6, textTransform: 'uppercase', marginBottom: 10,
          }}>HIPERTROFIA · ANÁLISIS</div>
          <h3 style={{
            fontFamily: '"Instrument Serif", Georgia, serif',
            fontSize: 30, fontWeight: 400, lineHeight: 1.2, letterSpacing: -0.6,
            color: '#0F1A2E', margin: '0 0 14px',
          }}>
            Volumen efectivo: las series que no te hacen crecer.
          </h3>
          <p style={{
            fontFamily: '"Inter",system-ui', fontSize: 14, color: '#3A4257',
            lineHeight: 1.55, letterSpacing: -0.1, margin: '0 0 14px',
          }}>
            La regla "10–20 series por grupo muscular y semana" es popular. Es también incompleta — y para algunos atletas, falsa. Desglosamos qué cuenta como serie efectiva, y por qué tres de cada diez no lo son.
          </p>

          {/* mini key-stat */}
          <div style={{
            padding: '14px 16px', borderRadius: 4,
            background: '#FAFAF7', borderLeft: '3px solid #0F1A2E',
            margin: '12px 0 16px',
          }}>
            <div style={{ fontFamily: '"Instrument Serif",Georgia,serif', fontStyle: 'italic', fontSize: 26, fontWeight: 400, color: '#0F1A2E', letterSpacing: -0.5, lineHeight: 1, marginBottom: 4 }}>
              30%
            </div>
            <div style={{ fontFamily: '"Inter",system-ui', fontSize: 12, color: '#5C6477', lineHeight: 1.4 }}>
              de las series registradas en gimnasios populares se ejecutan a una intensidad insuficiente para inducir hipertrofia significativa.
            </div>
          </div>

          <Byline name="Iván Pradera" lab="Atlas Lab" date="08 abr" read="9 min" />
        </article>

        {/* COL 3 — opinión / editorial */}
        <article>
          <div style={{
            display: 'inline-block', padding: '4px 10px', borderRadius: 4,
            background: '#0F1A2E', color: '#FAFAF7',
            fontFamily: 'ui-monospace,Menlo,monospace', fontSize: 10, fontWeight: 700, letterSpacing: 1.4,
            marginBottom: 14,
          }}>EDITORIAL</div>

          <h3 style={{
            fontFamily: '"Instrument Serif", Georgia, serif',
            fontSize: 30, fontWeight: 400, fontStyle: 'italic', lineHeight: 1.22, letterSpacing: -0.6,
            color: '#0F1A2E', margin: '0 0 16px', paddingBottom: 4,
          }}>
            "La adherencia es el problema #1 que nadie quiere resolver."
          </h3>
          <p style={{
            fontFamily: '"Inter",system-ui', fontSize: 14, color: '#3A4257',
            lineHeight: 1.55, letterSpacing: -0.1, margin: '0 0 16px',
          }}>
            Llevamos veinte años optimizando programas. Mientras tanto, el 60% de los atletas amateur abandona en menos de 90 días. La ciencia del entrenamiento no necesita más papers sobre series — necesita papers sobre hábitos.
          </p>

          <div style={{
            padding: '12px 0', borderTop: '1px solid rgba(15,26,46,0.1)',
            display: 'flex', alignItems: 'center', gap: 10,
          }}>
            <div style={{
              width: 32, height: 32, borderRadius: 999,
              background: 'linear-gradient(135deg, #1A2845, #0F1A2E)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: '"Inter",system-ui', fontSize: 11, fontWeight: 800, color: '#FAFAF7',
            }}>JM</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: '"Inter",system-ui', fontSize: 12, fontWeight: 700, color: '#0F1A2E' }}>Javier Morales</div>
              <div style={{ fontFamily: '"Inter",system-ui', fontSize: 11, color: '#5C6477' }}>Editor jefe · Atlas Lab</div>
            </div>
          </div>
        </article>
      </div>
    </div>
  );
}

function Byline({ name, lab, date, read }) {
  return (
    <div style={{
      paddingTop: 12, borderTop: '1px solid rgba(15,26,46,0.08)',
      fontFamily: '"Inter",system-ui', fontSize: 11, color: '#5C6477', letterSpacing: -0.05,
    }}>
      <span style={{ fontWeight: 700, color: '#0F1A2E' }}>{name}</span> · <span>{lab}</span> · <span>{date}</span> · <span>{read}</span>
    </div>
  );
}

function RecoveryViz() {
  return (
    <svg viewBox="0 0 600 340" style={{ width: '100%', height: '100%' }}>
      {/* dual ECG-style waves */}
      <defs>
        <linearGradient id="rg" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#0F1A2E" stopOpacity="0.6" />
          <stop offset="1" stopColor="#0F1A2E" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d="M 0 180 L 80 180 L 100 180 L 110 130 L 120 220 L 130 180 L 200 180 L 220 180 L 230 130 L 240 220 L 250 180 L 320 180 L 340 180 L 350 100 L 360 240 L 370 180 L 600 180"
        fill="none" stroke="#0F1A2E" strokeWidth="2" />
      <path d="M 0 240 L 80 240 L 105 240 L 115 210 L 125 270 L 135 240 L 200 240 L 225 240 L 235 215 L 245 265 L 255 240 L 320 240 L 345 240 L 355 200 L 365 280 L 375 240 L 600 240"
        fill="none" stroke="#0F1A2E" strokeWidth="1" opacity="0.4" />

      <text x="20" y="40" fontFamily="ui-monospace,Menlo,monospace" fontSize="12" fontWeight="700" fill="#0F1A2E" letterSpacing="2">HRV · COMPARATIVA</text>
      <text x="20" y="58" fontFamily="Inter,system-ui" fontSize="10" fill="#3A4257">ECG clínico vs wearable consumer</text>

      <circle cx="20" cy="180" r="3" fill="#0F1A2E" />
      <text x="32" y="184" fontFamily="ui-monospace,Menlo,monospace" fontSize="9" fill="#3A4257">ECG</text>
      <circle cx="20" cy="240" r="3" fill="#0F1A2E" opacity="0.4" />
      <text x="32" y="244" fontFamily="ui-monospace,Menlo,monospace" fontSize="9" fill="#3A4257">WEARABLE</text>
    </svg>
  );
}

// ════════════════════════════════════════════════════════════
// GRID ASIMÉTRICO
// ════════════════════════════════════════════════════════════
function AsymmetricGrid() {
  return (
    <div style={{ padding: '56px 32px', borderBottom: '1px solid rgba(15,26,46,0.1)' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 28,
        }}>
          <h3 style={{
            fontFamily: '"Inter",system-ui', fontSize: 13, fontWeight: 800,
            color: '#0F1A2E', letterSpacing: 2, textTransform: 'uppercase', margin: 0,
            paddingBottom: 10, borderBottom: '2px solid #0F1A2E',
          }}>
            En profundidad
          </h3>
          <a href="#" style={{
            fontFamily: '"Inter",system-ui', fontSize: 13, fontWeight: 600,
            color: '#0F1A2E', textDecoration: 'none', letterSpacing: -0.1,
          }}>Ver archivo completo →</a>
        </div>

        {/* asymmetric grid */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gridAutoRows: '180px',
          gap: 24,
        }}>
          {/* big — col 1-7 row 1-2 */}
          <article style={{ ...gridCard(), gridColumn: 'span 7', gridRow: 'span 2', position: 'relative', overflow: 'hidden' }}>
            <div style={{
              position: 'absolute', inset: 0,
              background: 'linear-gradient(135deg, #0F1A2E 0%, #2A3A5E 100%)',
            }}>
              <ProteinViz />
            </div>
            <div style={{
              position: 'absolute', inset: 0, padding: 28,
              background: 'linear-gradient(0deg, rgba(15,26,46,0.85) 0%, rgba(15,26,46,0.2) 50%, transparent 100%)',
              display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
              color: '#FAFAF7',
            }}>
              <div style={{ fontFamily: 'ui-monospace,Menlo,monospace', fontSize: 11, fontWeight: 700, letterSpacing: 1.6, textTransform: 'uppercase', opacity: 0.7, marginBottom: 10 }}>
                NUTRICIÓN · LARGO
              </div>
              <h4 style={{ fontFamily: '"Instrument Serif",Georgia,serif', fontSize: 36, fontWeight: 400, lineHeight: 1.18, letterSpacing: -0.8, margin: '0 0 14px', paddingBottom: 4 }}>
                Proteína por comida: el techo de los 30g, revisado.
              </h4>
              <p style={{ fontFamily: '"Inter",system-ui', fontSize: 14, lineHeight: 1.5, opacity: 0.85, margin: '0 0 14px', maxWidth: 480 }}>
                Estudios recientes desafían el dogma del límite de absorción. Repasamos qué dicen los datos sobre dosis de hasta 70g en una sola comida.
              </p>
              <div style={{ fontFamily: '"Inter",system-ui', fontSize: 11, opacity: 0.6, letterSpacing: -0.05 }}>
                Carla Ferrer · 06 abr · 14 min · 19 referencias
              </div>
            </div>
          </article>

          {/* medium top right */}
          <article style={{ ...gridCard(), gridColumn: 'span 5', gridRow: 'span 1', padding: 24, display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontFamily: 'ui-monospace,Menlo,monospace', fontSize: 10, fontWeight: 700, color: '#A23E2E', letterSpacing: 1.4, marginBottom: 8 }}>
              SUEÑO · APLICACIÓN
            </div>
            <h4 style={{ fontFamily: '"Instrument Serif",Georgia,serif', fontSize: 24, fontWeight: 400, lineHeight: 1.2, letterSpacing: -0.5, color: '#0F1A2E', margin: '0 0 10px' }}>
              Privación de sueño y rendimiento de fuerza: un solo día cuesta caro.
            </h4>
            <p style={{ fontFamily: '"Inter",system-ui', fontSize: 13, color: '#3A4257', lineHeight: 1.5, margin: 0, flex: 1 }}>
              5h de sueño reduce el 1RM una media del 4% al día siguiente. Cuantificamos también el coste cognitivo en sesiones largas.
            </p>
            <div style={{ marginTop: 12, fontFamily: '"Inter",system-ui', fontSize: 11, color: '#5C6477' }}>
              Atlas Lab · 04 abr · 8 min
            </div>
          </article>

          {/* medium right bottom */}
          <article style={{ ...gridCard(), gridColumn: 'span 5', gridRow: 'span 1', padding: 24, display: 'flex', flexDirection: 'column', background: '#FAFAF7' }}>
            <div style={{ fontFamily: 'ui-monospace,Menlo,monospace', fontSize: 10, fontWeight: 700, color: '#A23E2E', letterSpacing: 1.4, marginBottom: 8 }}>
              FUERZA · GUÍA
            </div>
            <h4 style={{ fontFamily: '"Instrument Serif",Georgia,serif', fontSize: 24, fontWeight: 400, lineHeight: 1.2, letterSpacing: -0.5, color: '#0F1A2E', margin: '0 0 10px' }}>
              Cómo programar el 1RM <em>sin tocarlo nunca.</em>
            </h4>
            <p style={{ fontFamily: '"Inter",system-ui', fontSize: 13, color: '#3A4257', lineHeight: 1.5, margin: 0, flex: 1 }}>
              {'Métodos de estimación con error < 3% basados en repeticiones máximas y RIR. Comparamos seis fórmulas frente a 1RM real.'}
            </p>
            <div style={{ marginTop: 12, fontFamily: '"Inter",system-ui', fontSize: 11, color: '#5C6477' }}>
              Dr. Daniel Ruiz · 02 abr · 8 min
            </div>
          </article>

          {/* small cards row */}
          {[
            { tag: 'COGNITIVO · ENSAYO', title: 'Activación pre-entreno sin estimulantes.', body: 'Protocolos de calentamiento neural basados en el SNC: el coste cero de los 5 minutos correctos.', author: 'Pablo Vázquez', date: '30 mar', read: '6 min' },
            { tag: 'NUTRICIÓN · APLICACIÓN', title: 'Suplementación con evidencia real, en una página.', body: 'La lista corta de los cinco compuestos con respaldo sólido en meta-análisis. Y por qué el resto es ruido.', author: 'Carla Ferrer', date: '28 mar', read: '7 min' },
            { tag: 'RECUPERACIÓN · DEBATE', title: 'Frío, calor o nada: el protocolo basado en evidencia.', body: 'Inmersión en agua fría tras hipertrofia: por qué reduce ganancias musculares hasta un 12%.', author: 'Marta Solís', date: '26 mar', read: '10 min' },
            { tag: 'HIPERTROFIA · ERROR', title: 'Frecuencia óptima por grupo muscular: meta-análisis 2024.', body: 'La pregunta no es 1× o 2× — la pregunta es cuánto volumen útil cabe en cada sesión.', author: 'Iván Pradera', date: '24 mar', read: '13 min' },
          ].map((a, i) => (
            <article key={i} style={{ ...gridCard(), gridColumn: 'span 3', gridRow: 'span 1', padding: 20, display: 'flex', flexDirection: 'column' }}>
              <div style={{ fontFamily: 'ui-monospace,Menlo,monospace', fontSize: 9, fontWeight: 700, color: '#A23E2E', letterSpacing: 1.4, marginBottom: 8 }}>
                {a.tag}
              </div>
              <h4 style={{ fontFamily: '"Instrument Serif",Georgia,serif', fontSize: 20, fontWeight: 400, lineHeight: 1.22, letterSpacing: -0.4, color: '#0F1A2E', margin: '0 0 10px' }}>
                {a.title}
              </h4>
              <p style={{ fontFamily: '"Inter",system-ui', fontSize: 12, color: '#3A4257', lineHeight: 1.5, margin: 0, flex: 1 }}>
                {a.body}
              </p>
              <div style={{ marginTop: 10, fontFamily: '"Inter",system-ui', fontSize: 10.5, color: '#5C6477' }}>
                {a.author} · {a.date} · {a.read}
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}

function gridCard() {
  return {
    background: '#FFFFFF', border: '1px solid rgba(15,26,46,0.08)',
    borderRadius: 4, overflow: 'hidden', cursor: 'pointer',
    transition: 'transform 0.3s, box-shadow 0.3s',
  };
}

function ProteinViz() {
  return (
    <svg viewBox="0 0 800 460" style={{ width: '100%', height: '100%' }}>
      {/* dose response bars */}
      {[20, 30, 45, 60, 70].map((d, i) => {
        const heights = [60, 100, 130, 145, 152];
        const x = 100 + i * 130;
        const h = heights[i] * 1.2;
        return (
          <g key={i}>
            <rect x={x} y={420 - h} width="80" height={h}
              fill={i === 1 ? 'rgba(250,250,247,0.9)' : 'rgba(250,250,247,0.25)'} />
            <text x={x + 40} y="445" textAnchor="middle"
              fontFamily="ui-monospace,Menlo,monospace" fontSize="11" fill="#FAFAF7" opacity="0.6">
              {d}g
            </text>
            {i === 1 && (
              <text x={x + 40} y={420 - h - 14} textAnchor="middle"
                fontFamily="Inter,system-ui" fontSize="10" fontWeight="700" fill="#FAFAF7">
                "límite tradicional"
              </text>
            )}
          </g>
        );
      })}
      {/* curve overlay */}
      <path d="M 140 360 Q 280 280 410 240 T 720 215"
        fill="none" stroke="#FAFAF7" strokeWidth="2" strokeDasharray="4 5" />
    </svg>
  );
}

// ════════════════════════════════════════════════════════════
// NUMBERS STRIP — datos clave, estilo dossier
// ════════════════════════════════════════════════════════════
function NumbersStrip() {
  const stats = [
    { n: '1 247', l: 'atletas estudiados', s: 'meta-análisis Atlas 2026' },
    { n: '+18.4%', l: 'hipertrofia con RIR 1–2', s: 'frente a control al fallo' },
    { n: '23%', l: 'caída de precisión HRV', s: 'wearables vs ECG en sesión' },
    { n: '60d', l: 'tiempo medio de abandono', s: 'atletas amateur sin sistema' },
  ];
  return (
    <div style={{
      padding: '48px 32px',
      background: '#0F1A2E', color: '#FAFAF7',
      borderBottom: '1px solid rgba(15,26,46,0.1)',
    }}>
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        <div style={{
          fontFamily: 'ui-monospace,Menlo,monospace', fontSize: 11, fontWeight: 700,
          letterSpacing: 2, textTransform: 'uppercase', opacity: 0.5, marginBottom: 24,
        }}>El número del mes · 4 hallazgos</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 0 }}>
          {stats.map((s, i) => (
            <div key={i} style={{
              padding: '0 32px', borderLeft: i === 0 ? 'none' : '1px solid rgba(250,250,247,0.12)',
            }}>
              <div style={{
                fontFamily: '"Instrument Serif",Georgia,serif', fontSize: 64, fontWeight: 400,
                letterSpacing: -2, lineHeight: 0.95, marginBottom: 10,
              }}>{s.n}</div>
              <div style={{ fontFamily: '"Inter",system-ui', fontSize: 14, fontWeight: 600, letterSpacing: -0.1, marginBottom: 4 }}>{s.l}</div>
              <div style={{ fontFamily: '"Inter",system-ui', fontSize: 12, opacity: 0.55 }}>{s.s}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════
// MOST READ — sidebar list + opinion sidebar
// ════════════════════════════════════════════════════════════
function MostRead() {
  const list = [
    { tag: 'FUERZA', title: 'RIR vs RPE: cuándo usar cada métrica', read: '6 min' },
    { tag: 'NUTRICIÓN', title: 'Timing de carbos: importa, pero menos de lo que te venden', read: '9 min' },
    { tag: 'COGNITIVO', title: 'Adherencia: el problema que nadie quiere resolver', read: '12 min' },
    { tag: 'RECUPERACIÓN', title: 'Deload: cuándo, cómo y por qué casi nadie lo hace bien', read: '8 min' },
    { tag: 'SUEÑO', title: 'Cafeína y ciclos de sueño: la curva de las 9h', read: '5 min' },
  ];

  return (
    <div style={{ padding: '64px 32px 80px' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 56 }}>
        {/* most read */}
        <div>
          <h3 style={{
            fontFamily: '"Inter",system-ui', fontSize: 13, fontWeight: 800,
            color: '#0F1A2E', letterSpacing: 2, textTransform: 'uppercase', margin: '0 0 24px',
            paddingBottom: 6, borderBottom: '2px solid #0F1A2E', display: 'inline-block',
          }}>Más leídos esta semana</h3>

          <ol style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column' }}>
            {list.map((a, i) => (
              <li key={i} style={{
                display: 'grid', gridTemplateColumns: '60px 1fr auto', gap: 20, alignItems: 'center',
                padding: '20px 0', borderBottom: '1px solid rgba(15,26,46,0.08)',
                cursor: 'pointer',
              }}>
                <span style={{
                  fontFamily: '"Instrument Serif",Georgia,serif', fontStyle: 'italic',
                  fontSize: 44, fontWeight: 400, color: '#A23E2E', letterSpacing: -1, lineHeight: 1,
                }}>{String(i+1).padStart(2,'0')}</span>
                <div>
                  <div style={{ fontFamily: 'ui-monospace,Menlo,monospace', fontSize: 10, fontWeight: 700, color: '#5C6477', letterSpacing: 1.4, marginBottom: 4 }}>{a.tag}</div>
                  <div style={{ fontFamily: '"Inter",system-ui', fontSize: 18, fontWeight: 600, color: '#0F1A2E', letterSpacing: -0.3, lineHeight: 1.2 }}>{a.title}</div>
                </div>
                <span style={{ fontFamily: 'ui-monospace,Menlo,monospace', fontSize: 11, color: '#5C6477' }}>{a.read}</span>
              </li>
            ))}
          </ol>
        </div>

        {/* newsletter sidebar */}
        <aside style={{
          padding: 32, borderRadius: 4, alignSelf: 'flex-start',
          background: '#FAFAF7', border: '1px solid rgba(15,26,46,0.08)',
        }}>
          <div style={{
            fontFamily: 'ui-monospace,Menlo,monospace', fontSize: 11, fontWeight: 700,
            color: '#A23E2E', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 12,
          }}>Boletín · semanal</div>
          <h4 style={{
            fontFamily: '"Instrument Serif",Georgia,serif', fontSize: 30, fontWeight: 400,
            color: '#0F1A2E', letterSpacing: -0.7, lineHeight: 1.05, margin: '0 0 14px',
          }}>
            Un <em>paper</em> revisado.<br/>
            Una decisión accionable.<br/>
            Cada lunes.
          </h4>
          <p style={{ fontFamily: '"Inter",system-ui', fontSize: 14, color: '#3A4257', lineHeight: 1.5, margin: '0 0 20px' }}>
            Síntesis editorial de Atlas Lab — sin clickbait, sin gurús, sin suplementos sospechosos. 4 200 lectores, médicos y entrenadores incluidos.
          </p>
          <form onSubmit={e=>e.preventDefault()} style={{ display: 'flex', gap: 6 }}>
            <input type="email" placeholder="tu@email.com"
              style={{
                flex: 1, padding: '12px 14px', borderRadius: 4,
                border: '1px solid rgba(15,26,46,0.18)', background: '#FFFFFF',
                fontFamily: '"Inter",system-ui', fontSize: 14, color: '#0F1A2E',
              }} />
            <button type="submit" style={{
              padding: '12px 20px', borderRadius: 4, border: 'none', cursor: 'pointer',
              background: '#0F1A2E', color: '#FAFAF7',
              fontFamily: '"Inter",system-ui', fontSize: 13, fontWeight: 700, letterSpacing: -0.1,
            }}>Suscribirme</button>
          </form>
          <div style={{ marginTop: 14, fontFamily: 'ui-monospace,Menlo,monospace', fontSize: 10, color: '#5C6477', letterSpacing: 0.4 }}>
            SIN SPAM · BAJA EN UN CLICK
          </div>
        </aside>
      </div>
    </div>
  );
}

Object.assign(window, { LabSection });
