// Aula — article browser with reading progress and gem rewards

const ARTICLES = [
  { id: 'sobrecarga-progresiva', title: 'Sobrecarga progresiva', subtitle: 'El principio que lo explica todo', category: 'fuerza', tags: ['fundamental'], readTime: 8, gems: 15,
    summary: 'La sobrecarga progresiva es el principio más importante del entrenamiento de fuerza. Sin incremento progresivo de estímulo, no hay adaptación.',
    sections: [
      { heading: '¿Qué es la sobrecarga progresiva?', body: 'La sobrecarga progresiva consiste en aumentar sistemáticamente el estímulo de entrenamiento — ya sea mediante más peso, más repeticiones, más volumen o menor descanso — para forzar adaptaciones continuas en el organismo.' },
      { heading: 'Los cinco vectores de progresión', body: 'No toda la progresión viene del peso. Puedes progresar aumentando el número de series (volumen), las repeticiones por serie, la densidad (menos descanso), la frecuencia semanal o la calidad técnica de los movimientos.' },
      { heading: 'Aplicación práctica', body: 'La progresión más sencilla para principiantes es la progresión lineal: añadir 2.5 kg cada sesión en ejercicios compuestos. Para niveles intermedios, la progresión ondulante por fases de 3-4 semanas es más eficaz.' },
    ],
    refs: ['Schoenfeld BJ (2010). The mechanisms of muscle hypertrophy. J Strength Cond Res.', 'Kraemer WJ, Ratamess NA (2004). Fundamentals of resistance training. Med Sci Sports Exerc.']
  },
  { id: 'rpe-rir', title: 'RPE y RIR', subtitle: 'Medir el esfuerzo con precisión', category: 'fuerza', tags: ['intermedio'], readTime: 6, gems: 15,
    summary: 'El RPE (Rating of Perceived Exertion) y el RIR (Reps in Reserve) son herramientas para autorregular la intensidad del entrenamiento con precisión.',
    sections: [
      { heading: 'RPE: escala de esfuerzo percibido', body: 'La escala RPE va de 1 a 10, donde 10 es el máximo esfuerzo posible. En entrenamiento de fuerza, la zona óptima suele estar entre 7 y 9 dependiendo de la fase del mesociclo.' },
      { heading: 'RIR: repeticiones en reserva', body: 'RIR es el número de repeticiones que podrías hacer más antes del fallo. Un RIR de 2 equivale aproximadamente a un RPE de 8. Esta métrica es más intuitiva para muchos atletas.' },
      { heading: 'Autorregulación práctica', body: 'Usar RPE/RIR permite ajustar las cargas de sesión en sesión según el estado de recuperación real. Si llegas con fatiga acumulada, reduces el peso para mantener el RIR objetivo en lugar de forzar el número del programa.' },
    ],
    refs: ['Zourdos MC et al. (2016). Novel resistance training-specific RPE scale. J Strength Cond Res.', 'Mike J et al. (2015). RIR as a tool for tracking training proximity to failure. NSCA.']
  },
  { id: 'hipertrofia-mecanismos', title: 'Mecanismos de hipertrofia', subtitle: 'Por qué crece el músculo', category: 'hipertrofia', tags: ['intermedio', 'ciencia'], readTime: 10, gems: 20,
    summary: 'El crecimiento muscular responde a tres mecanismos primarios: tensión mecánica, estrés metabólico y daño muscular. Entender cada uno permite optimizar el entrenamiento.',
    sections: [
      { heading: 'Tensión mecánica', body: 'La tensión mecánica generada por levantar cargas pesadas activa vías de señalización anabólica como mTOR. Es el estímulo más importante para la síntesis de proteínas musculares.' },
      { heading: 'Estrés metabólico', body: 'El estrés metabólico (la "bomba") provoca acumulación de metabolitos como lactato, que activan hormonas anabólicas locales. Es especialmente relevante en rangos de 12-20 repeticiones.' },
      { heading: 'Daño muscular', body: 'El daño muscular, especialmente en la fase excéntrica, inicia procesos de reparación que pueden contribuir al crecimiento. Sin embargo, el daño excesivo compromete la recuperación.' },
    ],
    refs: ['Schoenfeld BJ (2010). The mechanisms of muscle hypertrophy. J Strength Cond Res.', 'Figueiredo VC et al. (2019). Considerations for maximizing the hypertrophic response. Sports Med.']
  },
  { id: 'volumen-frecuencia', title: 'Volumen y frecuencia', subtitle: 'Cuánto y cuántas veces entrenar', category: 'hipertrofia', tags: ['intermedio'], readTime: 7, gems: 15,
    summary: 'El volumen semanal y la frecuencia de entrenamiento son las dos variables con mayor impacto en el desarrollo muscular a largo plazo.',
    sections: [
      { heading: 'MEV, MAV y MRV', body: 'El Volumen Mínimo Efectivo (MEV) es el mínimo para mantener músculo. El Volumen de Máxima Adaptación (MAV) es el óptimo. El Volumen Máximo Recuperable (MRV) es el máximo tolerable antes de comprometer la recuperación.' },
      { heading: 'Frecuencia óptima', body: 'Entrenar cada músculo 2 veces por semana supera a 1 vez con el mismo volumen total. Para intermedios y avanzados, 2-3 veces por semana permite mejor distribución del estímulo.' },
      { heading: 'Progresión de volumen', body: 'Lo más efectivo es empezar en el MEV e ir incrementando series semana a semana hasta aproximarse al MRV, para luego realizar un deload y reiniciar el ciclo con un MAV superior.' },
    ],
    refs: ['Ralston GW et al. (2017). The effect of weekly set volume on strength gain. J Strength Cond Res.', 'Schoenfeld BJ et al. (2016). Effects of resistance training frequency on measures of muscle hypertrophy. Sports Med.']
  },
  { id: 'nutricion-proteina', title: 'Proteína: cuánta y cuándo', subtitle: 'Evidencia sobre ingesta proteica', category: 'nutricion', tags: ['fundamental', 'nutrición'], readTime: 6, gems: 15,
    summary: 'La proteína es el macronutriente más importante para la adaptación muscular. La cantidad, calidad y distribución a lo largo del día determinan la síntesis proteica.',
    sections: [
      { heading: 'Cantidad óptima', body: 'El consenso actual sitúa la ingesta óptima en 1.6-2.2 g/kg de peso corporal para maximizar la síntesis proteica en atletas que entrenan fuerza. Cantidades superiores no aportan beneficio adicional.' },
      { heading: 'Distribución temporal', body: 'Distribuir la proteína en 3-5 tomas de 30-40g a lo largo del día maximiza la síntesis proteica muscular. La ventana post-entrenamiento es relevante pero no tan estrecha como se creía (2-4 horas).' },
      { heading: 'Fuentes de proteína', body: 'Las proteínas completas (pollo, huevo, lácteos, carne, pescado, soja) son preferibles. El leucine threshold (2-3g de leucina por toma) es el umbral para activar mTOR.' },
    ],
    refs: ['Morton RW et al. (2018). A systematic review, meta-analysis and meta-regression of the effect of protein supplementation on resistance training. Br J Sports Med.', 'Stokes T et al. (2018). Recent perspectives regarding the role of dietary protein for the promotion of muscle hypertrophy. Nutrients.']
  },
  { id: 'recuperacion-sueno', title: 'Sueño y recuperación', subtitle: 'La variable más infraestimada', category: 'recuperacion', tags: ['fundamental'], readTime: 5, gems: 15,
    summary: 'El sueño es el mayor modulador de la recuperación y la adaptación al entrenamiento. La privación crónica compromete la fuerza, la composición corporal y el rendimiento cognitivo.',
    sections: [
      { heading: 'Impacto en el rendimiento', body: 'Dormir menos de 6h reduce la fuerza en un 10-20% y eleva el RPE percibido. La privación de sueño aumenta el cortisol y reduce la testosterona, comprometiendo el entorno anabólico.' },
      { heading: 'Arquitectura del sueño', body: 'La mayor parte de la GH se libera durante el sueño profundo (fase N3). Reducir el sueño acorta esta fase crítica para la recuperación muscular y la síntesis proteica nocturna.' },
      { heading: 'Higiene del sueño', body: 'Temperaturas de 18-20°C, ausencia de luz azul 60 min antes de dormir, horarios regulares y evitar cafeína después de las 14h son las estrategias con mayor evidencia.' },
    ],
    refs: ['Dattilo M et al. (2011). Sleep and muscle recovery. Med Hypotheses.', 'Watson NF et al. (2015). Recommended amount of sleep for a healthy adult. Sleep.']
  },
  { id: 'deload', title: 'Deload: cuándo y cómo', subtitle: 'El arte de recuperar para progresar', category: 'recuperacion', tags: ['intermedio'], readTime: 5, gems: 15,
    summary: 'El deload es una reducción planificada del volumen o la intensidad de entrenamiento para permitir la supercompensación y prevenir el sobreentrenamiento.',
    sections: [
      { heading: '¿Cuándo hacer deload?', body: 'Señales objetivas: HRV bajo, RPE elevado para cargas habituales, pérdida de motivación, calidad del sueño reducida. En atletas intermedios/avanzados, un deload cada 4-6 semanas es habitual.' },
      { heading: 'Tipos de deload', body: 'Deload de volumen: mantener intensidad, reducir series al 50-60%. Deload de intensidad: mantener volumen, reducir cargas al 60-70% del 1RM. El deload de volumen tiene mayor evidencia para la mayoría de atletas.' },
      { heading: 'Duración óptima', body: 'Una semana suele ser suficiente para la recuperación del sistema nervioso central y la supercompensación muscular. Deloads más largos pueden causar desentrenamiento parcial.' },
    ],
    refs: ['Flann KL et al. (2011). Muscle damage and muscle remodeling: no pain, no gain? J Exp Biol.', 'Bosquet L et al. (2007). Effects of tapering on performance. Med Sci Sports Exerc.']
  },
  { id: 'hrv-monitoreo', title: 'HRV como herramienta de recuperación', subtitle: 'Datos objetivos de tu estado de forma', category: 'recuperacion', tags: ['avanzado', 'tecnología'], readTime: 7, gems: 20,
    summary: 'La variabilidad de la frecuencia cardíaca (HRV) es el biomarcador más accesible para monitorear la recuperación del sistema nervioso autónomo y optimizar las cargas de entrenamiento.',
    sections: [
      { heading: '¿Qué mide el HRV?', body: 'El HRV mide la variación en el tiempo entre latidos consecutivos. Un HRV alto indica predominio parasimpático (recuperación). Un HRV bajo señala activación simpática: estrés, fatiga o enfermedad.' },
      { heading: 'Interpretación práctica', body: 'Más que el valor absoluto, importa la tendencia de 7 días. Una caída sostenida de más del 10% respecto al baseline indica acumulación de fatiga y sugiere reducir el volumen o la intensidad.' },
      { heading: 'Integración en el plan', body: 'Con HRV bajo, prioriza sesiones de menor intensidad o técnica. Con HRV alto o en baseline, es el momento óptimo para sesiones de alta intensidad o pruebas de fuerza máxima.' },
    ],
    refs: ['Plews DJ et al. (2013). Heart rate variability in elite triathletes. Int J Sports Physiol Perform.', 'Kiviniemi AM et al. (2010). Individual-based training by HRV. Eur J Appl Physiol.']
  },
];

const CATEGORY_LABELS = {
  todos: 'Todos',
  fuerza: 'Fuerza',
  hipertrofia: 'Hipertrofia',
  nutricion: 'Nutrición',
  recuperacion: 'Recuperación',
};

const CATEGORY_COLORS = {
  fuerza: { bg: 'rgba(15,26,46,0.08)', text: '#0F1A2E' },
  hipertrofia: { bg: 'rgba(42,111,219,0.1)', text: '#1a4fa0' },
  nutricion: { bg: 'rgba(31,139,58,0.1)', text: '#1F8B3A' },
  recuperacion: { bg: 'rgba(194,69,69,0.1)', text: '#C24545' },
};

function AulaSection() {
  const { state, actions } = useStore();
  const [search, setSearch] = React.useState('');
  const [category, setCategory] = React.useState('todos');
  const [selected, setSelected] = React.useState(null);
  const [gemFlash, setGemFlash] = React.useState(null);

  const completed = state.reading.completed || [];

  const filtered = React.useMemo(() => {
    return ARTICLES.filter(a => {
      const matchesCat = category === 'todos' || a.category === category;
      const q = search.toLowerCase();
      const matchesSearch = !q ||
        a.title.toLowerCase().includes(q) ||
        a.subtitle.toLowerCase().includes(q) ||
        a.category.toLowerCase().includes(q) ||
        a.tags.some(t => t.toLowerCase().includes(q));
      return matchesCat && matchesSearch;
    });
  }, [search, category]);

  const handleMarkRead = (article) => {
    const alreadyRead = completed.includes(article.id);
    actions.markArticleRead(article.id);
    if (!alreadyRead) {
      setGemFlash(`+${article.gems} gemas`);
      setTimeout(() => setGemFlash(null), 2000);
    }
  };

  if (selected) {
    return (
      <ArticleDetail
        article={selected}
        isRead={completed.includes(selected.id)}
        onBack={() => setSelected(null)}
        onMarkRead={() => handleMarkRead(selected)}
        gemFlash={gemFlash}
      />
    );
  }

  return (
    <section style={{ padding: '120px 32px', minHeight: '80vh', background: '#FAFAF7' }}>
      <div style={{ maxWidth: 1180, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ marginBottom: 48 }}>
          <span style={{ fontFamily: '"Inter",system-ui', fontSize: 13, fontWeight: 700, letterSpacing: 1.6, textTransform: 'uppercase', color: '#5C6477' }}>
            Aula · Biblioteca científica
          </span>
          <h1 style={{ fontFamily: '"Inter",system-ui', fontSize: 52, fontWeight: 700, color: '#0F1A2E', letterSpacing: -2, lineHeight: 1.02, margin: '12px 0 16px' }}>
            Aprende. <span style={{ fontFamily: '"Instrument Serif",serif', fontStyle: 'italic', fontWeight: 400 }}>Gana gemas.</span>
          </h1>
          <p style={{ fontFamily: '"Inter",system-ui', fontSize: 17, color: '#3A4257', lineHeight: 1.55, letterSpacing: -0.2, margin: 0, maxWidth: 560 }}>
            Cada artículo que leas te recompensa con gemas. Conocimiento y progresión en la misma plataforma.
          </p>
        </div>

        {/* Gem flash */}
        {gemFlash && (
          <div style={{
            position: 'fixed', top: 80, right: 32, zIndex: 200,
            background: '#0F1A2E', color: '#FAFAF7',
            padding: '10px 20px', borderRadius: 999,
            fontFamily: '"Inter",system-ui', fontSize: 14, fontWeight: 700,
            animation: 'fadeIn 0.3s ease',
            boxShadow: '0 8px 32px rgba(15,26,46,0.25)',
          }}>
            💎 {gemFlash}
          </div>
        )}

        {/* Search + filters */}
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 32, flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: '1 1 280px', maxWidth: 400 }}>
            <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#9498A4', fontSize: 16 }}>🔍</span>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar artículos..."
              style={{
                width: '100%', padding: '11px 14px 11px 40px',
                borderRadius: 12, border: '1px solid rgba(15,26,46,0.1)',
                background: '#FFFFFF', fontFamily: '"Inter",system-ui',
                fontSize: 14, color: '#0F1A2E',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {Object.entries(CATEGORY_LABELS).map(([key, label]) => {
              const active = category === key;
              return (
                <button
                  key={key}
                  onClick={() => setCategory(key)}
                  style={{
                    padding: '8px 16px', borderRadius: 999, cursor: 'pointer',
                    border: active ? '1.5px solid #0F1A2E' : '1px solid rgba(15,26,46,0.12)',
                    background: active ? '#0F1A2E' : '#FFFFFF',
                    color: active ? '#FAFAF7' : '#3A4257',
                    fontFamily: '"Inter",system-ui', fontSize: 13, fontWeight: 600,
                    transition: 'all 0.15s',
                  }}
                >
                  {label}
                </button>
              );
            })}
          </div>

          <span style={{ fontFamily: '"Inter",system-ui', fontSize: 13, color: '#9498A4', marginLeft: 'auto' }}>
            {filtered.length} artículo{filtered.length !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Article grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
          {filtered.map(article => (
            <ArticleCard
              key={article.id}
              article={article}
              isRead={completed.includes(article.id)}
              onClick={() => setSelected(article)}
            />
          ))}
        </div>

        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '80px 0', color: '#9498A4' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>📚</div>
            <p style={{ fontFamily: '"Inter",system-ui', fontSize: 16, fontWeight: 500 }}>No se encontraron artículos</p>
          </div>
        )}
      </div>
    </section>
  );
}

function ArticleCard({ article, isRead, onClick }) {
  const catColor = CATEGORY_COLORS[article.category] || { bg: 'rgba(15,26,46,0.06)', text: '#5C6477' };
  const [hover, setHover] = React.useState(false);

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: '#FFFFFF',
        borderRadius: 20,
        border: hover ? '1px solid rgba(15,26,46,0.18)' : '1px solid rgba(15,26,46,0.08)',
        padding: 24,
        cursor: 'pointer',
        transition: 'all 0.2s',
        boxShadow: hover ? '0 12px 40px -12px rgba(15,26,46,0.18)' : '0 2px 8px rgba(15,26,46,0.04)',
        transform: hover ? 'translateY(-2px)' : 'none',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {isRead && (
        <div style={{
          position: 'absolute', top: 16, right: 16,
          width: 22, height: 22, borderRadius: 999,
          background: '#E7F8EC', color: '#1F8B3A',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 12, fontWeight: 700,
        }}>✓</div>
      )}

      {/* Category badge */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 14, flexWrap: 'wrap' }}>
        <span style={{
          padding: '3px 10px', borderRadius: 999,
          background: catColor.bg, color: catColor.text,
          fontFamily: '"Inter",system-ui', fontSize: 11, fontWeight: 700,
          textTransform: 'capitalize', letterSpacing: 0.2,
        }}>
          {CATEGORY_LABELS[article.category] || article.category}
        </span>
        {article.tags.map(tag => (
          <span key={tag} style={{
            padding: '3px 10px', borderRadius: 999,
            background: 'rgba(15,26,46,0.04)', color: '#9498A4',
            fontFamily: '"Inter",system-ui', fontSize: 11, fontWeight: 600,
          }}>
            {tag}
          </span>
        ))}
      </div>

      <h3 style={{
        fontFamily: '"Inter",system-ui', fontSize: 18, fontWeight: 700,
        color: '#0F1A2E', letterSpacing: -0.4, margin: '0 0 4px',
        lineHeight: 1.25,
      }}>
        {article.title}
      </h3>
      <p style={{
        fontFamily: '"Inter",system-ui', fontSize: 13, color: '#5C6477',
        margin: '0 0 12px', fontWeight: 500,
      }}>
        {article.subtitle}
      </p>

      <p style={{
        fontFamily: '"Inter",system-ui', fontSize: 13, color: '#3A4257',
        lineHeight: 1.55, margin: '0 0 16px',
        display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical',
        overflow: 'hidden',
      }}>
        {article.summary}
      </p>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontFamily: 'ui-monospace,Menlo,monospace', fontSize: 11, color: '#9498A4', fontWeight: 600 }}>
          {article.readTime} min
        </span>
        <span style={{
          display: 'flex', alignItems: 'center', gap: 4,
          fontFamily: '"Inter",system-ui', fontSize: 12, fontWeight: 700, color: '#5C6477',
        }}>
          💎 +{article.gems}
        </span>
      </div>
    </div>
  );
}

function ArticleDetail({ article, isRead, onBack, onMarkRead, gemFlash }) {
  const [openSections, setOpenSections] = React.useState([0]);
  const catColor = CATEGORY_COLORS[article.category] || { bg: 'rgba(15,26,46,0.06)', text: '#5C6477' };

  const toggleSection = (idx) => {
    setOpenSections(prev =>
      prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]
    );
  };

  return (
    <section style={{ padding: '120px 32px', minHeight: '80vh', background: '#FAFAF7' }}>
      <div style={{ maxWidth: 760, margin: '0 auto' }}>

        {gemFlash && (
          <div style={{
            position: 'fixed', top: 80, right: 32, zIndex: 200,
            background: '#0F1A2E', color: '#FAFAF7',
            padding: '10px 20px', borderRadius: 999,
            fontFamily: '"Inter",system-ui', fontSize: 14, fontWeight: 700,
            animation: 'fadeIn 0.3s ease',
            boxShadow: '0 8px 32px rgba(15,26,46,0.25)',
          }}>
            💎 {gemFlash}
          </div>
        )}

        {/* Back button */}
        <button
          onClick={onBack}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '8px 14px', borderRadius: 999,
            border: '1px solid rgba(15,26,46,0.12)',
            background: '#FFFFFF', cursor: 'pointer',
            fontFamily: '"Inter",system-ui', fontSize: 13, fontWeight: 600, color: '#3A4257',
            marginBottom: 32,
          }}
        >
          ← Volver al Aula
        </button>

        {/* Article header */}
        <div style={{ marginBottom: 40 }}>
          <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{
              padding: '4px 12px', borderRadius: 999,
              background: catColor.bg, color: catColor.text,
              fontFamily: '"Inter",system-ui', fontSize: 12, fontWeight: 700,
              textTransform: 'capitalize',
            }}>
              {CATEGORY_LABELS[article.category] || article.category}
            </span>
            {article.tags.map(tag => (
              <span key={tag} style={{
                padding: '4px 12px', borderRadius: 999,
                background: 'rgba(15,26,46,0.04)', color: '#9498A4',
                fontFamily: '"Inter",system-ui', fontSize: 12, fontWeight: 600,
              }}>
                {tag}
              </span>
            ))}
            <span style={{ marginLeft: 'auto', fontFamily: 'ui-monospace,Menlo,monospace', fontSize: 12, color: '#9498A4' }}>
              {article.readTime} min lectura
            </span>
          </div>

          <h1 style={{
            fontFamily: '"Inter",system-ui', fontSize: 40, fontWeight: 700,
            color: '#0F1A2E', letterSpacing: -1.5, lineHeight: 1.1, margin: '0 0 8px',
          }}>
            {article.title}
          </h1>
          <p style={{ fontFamily: '"Instrument Serif",serif', fontStyle: 'italic', fontSize: 20, color: '#5C6477', margin: '0 0 20px' }}>
            {article.subtitle}
          </p>

          {/* Gem notice */}
          {!isRead && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '12px 18px', borderRadius: 14,
              background: 'rgba(122,196,255,0.12)', border: '1px solid rgba(42,111,219,0.15)',
            }}>
              <span style={{ fontSize: 20 }}>💎</span>
              <span style={{ fontFamily: '"Inter",system-ui', fontSize: 14, fontWeight: 600, color: '#1a4fa0' }}>
                Gana {article.gems} gemas leyendo este artículo
              </span>
            </div>
          )}
          {isRead && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '12px 18px', borderRadius: 14,
              background: '#E7F8EC', border: '1px solid rgba(31,139,58,0.2)',
            }}>
              <span style={{ fontSize: 16, color: '#1F8B3A', fontWeight: 700 }}>✓</span>
              <span style={{ fontFamily: '"Inter",system-ui', fontSize: 14, fontWeight: 600, color: '#1F8B3A' }}>
                Artículo completado · {article.gems} gemas obtenidas
              </span>
            </div>
          )}
        </div>

        {/* Summary */}
        <div style={{
          padding: '20px 24px', borderRadius: 16,
          background: '#FFFFFF', border: '1px solid rgba(15,26,46,0.08)',
          marginBottom: 28,
        }}>
          <p style={{ fontFamily: '"Inter",system-ui', fontSize: 15, color: '#3A4257', lineHeight: 1.65, margin: 0, fontWeight: 500 }}>
            {article.summary}
          </p>
        </div>

        {/* Sections accordion */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 32 }}>
          {article.sections.map((section, idx) => {
            const isOpen = openSections.includes(idx);
            return (
              <div
                key={idx}
                style={{
                  borderRadius: 16, background: '#FFFFFF',
                  border: '1px solid rgba(15,26,46,0.08)',
                  overflow: 'hidden',
                }}
              >
                <button
                  onClick={() => toggleSection(idx)}
                  style={{
                    width: '100%', padding: '16px 20px',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    background: 'none', border: 'none', cursor: 'pointer',
                    textAlign: 'left',
                  }}
                >
                  <span style={{ fontFamily: '"Inter",system-ui', fontSize: 15, fontWeight: 700, color: '#0F1A2E', letterSpacing: -0.2 }}>
                    {section.heading}
                  </span>
                  <span style={{
                    fontFamily: '"Inter",system-ui', fontSize: 18, color: '#9498A4',
                    transform: isOpen ? 'rotate(180deg)' : 'none',
                    transition: 'transform 0.2s',
                    flexShrink: 0, marginLeft: 12,
                  }}>
                    ↓
                  </span>
                </button>
                {isOpen && (
                  <div style={{ padding: '0 20px 20px', borderTop: '1px solid rgba(15,26,46,0.06)' }}>
                    <p style={{ fontFamily: '"Inter",system-ui', fontSize: 14, color: '#3A4257', lineHeight: 1.7, margin: '16px 0 0' }}>
                      {section.body}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* References */}
        <div style={{
          padding: '20px 24px', borderRadius: 16,
          background: 'rgba(15,26,46,0.02)', border: '1px solid rgba(15,26,46,0.06)',
          marginBottom: 32,
        }}>
          <div style={{ fontFamily: 'ui-monospace,Menlo,monospace', fontSize: 11, fontWeight: 700, color: '#9498A4', letterSpacing: 0.6, marginBottom: 12 }}>
            REFERENCIAS
          </div>
          <ul style={{ margin: 0, padding: '0 0 0 16px' }}>
            {article.refs.map((ref, i) => (
              <li key={i} style={{ fontFamily: '"Inter",system-ui', fontSize: 12, color: '#5C6477', lineHeight: 1.6, marginBottom: 4 }}>
                {ref}
              </li>
            ))}
          </ul>
        </div>

        {/* Mark as read button */}
        <button
          onClick={onMarkRead}
          disabled={isRead}
          style={{
            width: '100%', padding: '16px 24px',
            borderRadius: 16, border: 'none', cursor: isRead ? 'default' : 'pointer',
            background: isRead ? '#E7F8EC' : '#0F1A2E',
            color: isRead ? '#1F8B3A' : '#FAFAF7',
            fontFamily: '"Inter",system-ui', fontSize: 15, fontWeight: 700, letterSpacing: -0.2,
            transition: 'all 0.2s',
          }}
        >
          {isRead ? `✓ Completado · +${article.gems} gemas obtenidas` : `Marcar como leído · +${article.gems} gemas`}
        </button>
      </div>
    </section>
  );
}

Object.assign(window, { AulaSection });
