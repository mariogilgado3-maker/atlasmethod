// AI Coach — functional via window.claude.complete
function CoachSection() {
  const [messages, setMessages] = React.useState([
    { role: 'system', hidden: true, content: `Eres "Atlas Coach", el asistente IA de Atlas Method, una plataforma de entrenamiento basada en evidencia científica. Hablas español, eres conciso (3-5 frases máximo por respuesta), preciso y firme. NUNCA das consejos médicos directos: si detectas dolor o lesión, sugieres consultar profesional. Tu trabajo es interpretar datos del usuario y sugerir DECISIONES concretas (no genéricas). Usa terminología técnica deportiva (RPE, RIR, volumen, intensidad, mesociclo, deload). Cuando puedas, da un número o un ajuste exacto en lugar de generalidades.

CONTEXTO DEL USUARIO ACTUAL (Javier Morales):
- Mesociclo 3, semana 8, objetivo hipertrofia
- Adherencia 94%, RPE medio 7.8, volumen 24.6t/sem (+12%)
- HRV 7d ascendente, recuperación 87/100
- Estancamiento detectado en press banca (1RM proyectado 92kg, sin progreso 3 semanas)
- Asimetría detectada en tren inferior (8% diferencia)
- Sueño últimos 7 días: 6.8h media (objetivo 8h)` },
    { role: 'assistant', content: '¿En qué quieres que te ayude hoy? Puedo analizar tus métricas, ajustar el plan o resolver dudas técnicas.' },
  ]);
  const [input, setInput] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const scrollRef = React.useRef(null);

  const suggestions = [
    'Llevo 3 semanas estancado en press banca',
    '¿Es momento de un deload?',
    '¿Cómo corrijo la asimetría de pierna?',
    'Solo dormí 5h, ¿entreno igual?',
  ];

  const send = async (text) => {
    const content = (text ?? input).trim();
    if (!content || loading) return;
    setInput('');
    const newMsgs = [...messages, { role: 'user', content }];
    setMessages(newMsgs);
    setLoading(true);
    try {
      const reply = await window.claude.complete({
        messages: newMsgs.filter(m => !m.hidden && m.role !== 'system').map(m => ({ role: m.role, content: m.content })),
        system: newMsgs.find(m => m.role === 'system')?.content,
      });
      setMessages(m => [...m, { role: 'assistant', content: reply }]);
    } catch (e) {
      setMessages(m => [...m, { role: 'assistant', content: 'Error de conexión. Inténtalo de nuevo.' }]);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, loading]);

  return (
    <section id="coach" style={{
      padding: '160px 32px',
      background: 'linear-gradient(180deg, #0F1A2E 0%, #1A2845 100%)',
      color: '#FAFAF7', position: 'relative', overflow: 'hidden',
    }}>
      {/* ambient grid */}
      <div style={{
        position: 'absolute', inset: 0, opacity: 0.4, pointerEvents: 'none',
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)',
        backgroundSize: '64px 64px',
        maskImage: 'radial-gradient(ellipse at center, black 0%, transparent 70%)',
        WebkitMaskImage: 'radial-gradient(ellipse at center, black 0%, transparent 70%)',
      }} />

      <div style={{ maxWidth: 1180, margin: '0 auto', position: 'relative' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: 60, alignItems: 'center' }}>
          <div>
            <span style={{ fontFamily: '"Inter",system-ui', fontSize: 13, fontWeight: 700, letterSpacing: 1.6, textTransform: 'uppercase', color: 'rgba(250,250,247,0.6)' }}>
              AI Coach · Beta
            </span>
            <h2 style={{
              fontFamily: '"Inter",system-ui', fontSize: 56, fontWeight: 700,
              letterSpacing: -2, lineHeight: 1.02,
              margin: '12px 0 20px',
            }}>
              Datos en <span style={{ fontFamily: '"Instrument Serif",serif', fontStyle: 'italic', fontWeight: 400 }}>decisiones.</span>
            </h2>
            <p style={{ fontFamily: '"Inter",system-ui', fontSize: 18, color: 'rgba(250,250,247,0.75)', lineHeight: 1.5, letterSpacing: -0.2, margin: '0 0 32px' }}>
              No es un chatbot genérico. Lee tus métricas, identifica patrones y sugiere ajustes concretos al plan — con números, no con frases vacías.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                ['Interpreta', 'Cruza HRV, RPE, volumen y adherencia para detectar señales antes que tú'],
                ['Decide', 'Sugiere ajustes con número exacto: -15% volumen, +1 día deload, etc'],
                ['Aplica', 'Un click integra el ajuste en tu mesociclo activo'],
              ].map(([t,d],i)=>(
                <div key={i} style={{ display: 'flex', gap: 14 }}>
                  <span style={{
                    width: 28, height: 28, borderRadius: 999, flexShrink: 0,
                    background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)',
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: 'ui-monospace,Menlo,monospace', fontSize: 11, fontWeight: 700,
                  }}>{i+1}</span>
                  <div>
                    <div style={{ fontFamily: '"Inter",system-ui', fontSize: 15, fontWeight: 700, letterSpacing: -0.2 }}>{t}</div>
                    <div style={{ fontFamily: '"Inter",system-ui', fontSize: 13, color: 'rgba(250,250,247,0.6)', marginTop: 2, lineHeight: 1.4 }}>{d}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Chat panel */}
          <div style={{
            background: 'rgba(255,255,255,0.04)', borderRadius: 24,
            border: '1px solid rgba(255,255,255,0.1)',
            backdropFilter: 'blur(20px)',
            display: 'flex', flexDirection: 'column', height: 560, overflow: 'hidden',
          }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
              <div style={{ width: 36, height: 36, borderRadius: 999, background: '#FAFAF7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <AtlasA size={20} color="#0F1A2E" stroke={9} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: '"Inter",system-ui', fontSize: 14, fontWeight: 700 }}>Atlas Coach</div>
                <div style={{ fontFamily: '"Inter",system-ui', fontSize: 12, color: 'rgba(250,250,247,0.5)', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ width: 6, height: 6, borderRadius: 999, background: '#7BD68A', boxShadow: '0 0 8px #7BD68A' }} />
                  Online · contexto cargado
                </div>
              </div>
              <span style={{ padding: '3px 9px', borderRadius: 999, background: 'rgba(255,255,255,0.08)', fontFamily: 'ui-monospace,Menlo,monospace', fontSize: 10, fontWeight: 700 }}>BETA</span>
            </div>

            {/* Messages */}
            <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
              {messages.filter(m => !m.hidden && m.role !== 'system').map((m, i) => (
                <div key={i} style={{
                  alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '82%',
                  padding: '11px 15px', borderRadius: 16,
                  background: m.role === 'user' ? '#FAFAF7' : 'rgba(255,255,255,0.08)',
                  color: m.role === 'user' ? '#0F1A2E' : '#FAFAF7',
                  border: m.role === 'user' ? 'none' : '1px solid rgba(255,255,255,0.08)',
                  fontFamily: '"Inter",system-ui', fontSize: 14, lineHeight: 1.5, letterSpacing: -0.1,
                  whiteSpace: 'pre-wrap',
                }}>{m.content}</div>
              ))}
              {loading && (
                <div style={{ alignSelf: 'flex-start', padding: '14px 18px', borderRadius: 16, background: 'rgba(255,255,255,0.08)', display: 'flex', gap: 5 }}>
                  {[0,1,2].map(i => (
                    <span key={i} style={{ width: 6, height: 6, borderRadius: 999, background: 'rgba(250,250,247,0.6)', animation: `pulse 1.2s ${i*0.15}s infinite ease-in-out` }} />
                  ))}
                </div>
              )}
            </div>

            {/* Suggestions */}
            {messages.filter(m => !m.hidden && m.role !== 'system').length <= 1 && (
              <div style={{ padding: '0 20px 12px', display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {suggestions.map((s,i)=>(
                  <button key={i} onClick={()=>send(s)} style={{
                    padding: '7px 12px', borderRadius: 999, cursor: 'pointer',
                    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                    color: 'rgba(250,250,247,0.85)',
                    fontFamily: '"Inter",system-ui', fontSize: 12, fontWeight: 500, letterSpacing: -0.1,
                  }}>{s}</button>
                ))}
              </div>
            )}

            {/* Input */}
            <form onSubmit={e => { e.preventDefault(); send(); }} style={{ padding: 16, borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', gap: 8 }}>
              <input
                value={input} onChange={e=>setInput(e.target.value)}
                placeholder="Pregunta sobre tu plan, métricas o ajustes…"
                disabled={loading}
                style={{
                  flex: 1, padding: '12px 16px', borderRadius: 12,
                  background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                  color: '#FAFAF7', outline: 'none',
                  fontFamily: '"Inter",system-ui', fontSize: 14, letterSpacing: -0.1,
                }}
              />
              <button type="submit" disabled={loading || !input.trim()} style={{
                padding: '12px 18px', borderRadius: 12, border: 'none',
                background: '#FAFAF7', color: '#0F1A2E',
                cursor: loading || !input.trim() ? 'default' : 'pointer',
                opacity: loading || !input.trim() ? 0.4 : 1,
                fontFamily: '"Inter",system-ui', fontSize: 14, fontWeight: 700,
              }}>Enviar →</button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Atlas Coach — routed page (replaces Laboratorio)
// Science-based protocol planner + contextual insights
// ─────────────────────────────────────────────────────────────────────────────

function generateProtocol(objetivo, nivel, dias, tiempo) {
  const splitMap = {
    2: 'Full Body',
    3: nivel === 'principiante' ? 'Full Body 3×' : 'Push / Pull / Legs',
    4: 'Upper / Lower',
    5: nivel === 'avanzado' ? 'PPL + Upper/Lower' : 'Upper/Lower + Full',
    6: 'Push / Pull / Legs A/B',
  };
  const scheduleTemplates = {
    2: { days: ['Lun','Mar','Mié','Jue','Vie','Sáb','Dom'], sessions: [0, null, null, 1, null, null, null], labels: ['Full A', 'Full B'] },
    3: { days: ['Lun','Mar','Mié','Jue','Vie','Sáb','Dom'], sessions: [0, null, 1, null, 2, null, null], labels: nivel === 'principiante' ? ['Full A','Full B','Full C'] : ['Push','Pull','Legs'] },
    4: { days: ['Lun','Mar','Mié','Jue','Vie','Sáb','Dom'], sessions: [0, 1, null, 2, 3, null, null], labels: ['Upper A','Lower A','Upper B','Lower B'] },
    5: { days: ['Lun','Mar','Mié','Jue','Vie','Sáb','Dom'], sessions: [0, 1, 2, null, 3, 4, null], labels: nivel === 'avanzado' ? ['Push','Pull','Legs','Upper','Lower'] : ['Upper A','Lower A','Full','Upper B','Lower B'] },
    6: { days: ['Lun','Mar','Mié','Jue','Vie','Sáb','Dom'], sessions: [0, 1, 2, 3, 4, 5, null], labels: ['Push A','Pull A','Legs A','Push B','Pull B','Legs B'] },
  };
  const volumeGuides = {
    hipertrofia: { pecho: '12–20 s/sem', espalda: '14–22 s/sem', hombro: '10–16 s/sem', bíceps: '10–14 s/sem', tríceps: '10–14 s/sem', pierna: '16–20 s/sem' },
    fuerza:      { pecho: '8–12 s/sem',  espalda: '10–14 s/sem', hombro: '6–10 s/sem',  bíceps: '6–8 s/sem',  tríceps: '6–8 s/sem',  pierna: '10–14 s/sem' },
    recomp:      { pecho: '10–16 s/sem', espalda: '12–18 s/sem', hombro: '8–12 s/sem',  bíceps: '8–12 s/sem', tríceps: '8–12 s/sem', pierna: '14–18 s/sem' },
    rendimiento: { pecho: '8–12 s/sem',  espalda: '10–14 s/sem', hombro: '8–10 s/sem',  bíceps: '6–8 s/sem',  tríceps: '6–8 s/sem',  pierna: '12–16 s/sem' },
  };
  const intensitySchemes = {
    hipertrofia: { rirRange: 'RIR 1–2', rm: '65–80% 1RM', reps: '8–15 reps', rest: '90–120 s' },
    fuerza:      { rirRange: 'RIR 0–1', rm: '80–93% 1RM', reps: '3–6 reps',  rest: '3–5 min' },
    recomp:      { rirRange: 'RIR 1–3', rm: '65–85% 1RM', reps: '8–12 reps', rest: '60–90 s' },
    rendimiento: { rirRange: 'RIR 0–2', rm: '75–90% 1RM', reps: '4–8 reps',  rest: '2–4 min' },
  };
  const progressionModels = {
    hipertrofia: { principiante: 'Progresión lineal', intermedio: 'Progresión ondulante (DUP)', avanzado: 'Periodización por bloques' },
    fuerza:      { principiante: 'Progresión lineal (SL/StrongLifts)', intermedio: 'Texas Method', avanzado: 'Periodización conjugada' },
    recomp:      { principiante: 'Progresión lineal', intermedio: 'Progresión ondulante', avanzado: 'Periodización ondulatoria avanzada' },
    rendimiento: { principiante: 'Progresión lineal', intermedio: 'Periodización clásica', avanzado: 'Periodización compleja' },
  };
  const sciJustifications = {
    hipertrofia: 'La hipertrofia muscular se maximiza con un volumen semanal entre el MEV y el MRV, frecuencias de 2× por grupo muscular y RIR 1–2 en las series de trabajo. La evidencia (Schoenfeld, 2016; Ralston, 2017) indica que el volumen es la variable con mayor impacto a largo plazo. Los ejercicios compuestos garantizan estímulo multiarticular eficiente.',
    fuerza:      'El desarrollo de la fuerza máxima requiere especificidad: cargas ≥80% del 1RM, baja cantidad de repeticiones y recuperaciones largas. La progresión sigue la ley de Henneman, activando unidades motoras de alto umbral que solo responden a cargas elevadas. La frecuencia y especificidad del patrón son claves (Kraemer & Ratamess, 2004).',
    recomp:      'La recomposición simultánea (pérdida de grasa + ganancia muscular) requiere déficit calórico moderado (200–300 kcal/día), alta ingesta proteica (2.0–2.4 g/kg) y entrenamiento de fuerza con volumen moderado-alto. Los ejercicios seleccionados maximizan el gasto calórico preservando masa muscular.',
    rendimiento: 'El entrenamiento orientado al rendimiento combina trabajo de fuerza máxima, potencia y capacidad. La periodización busca picos de forma en momentos específicos mediante fases de carga, intensificación y tapering, con especial atención a la transferencia deportiva.',
  };
  const mesocycle = [
    { week: 1, phase: 'Acumulación',     vol: 100, rir: '2',   notes: 'Adaptación al volumen' },
    { week: 2, phase: 'Acumulación',     vol: 115, rir: '1.5', notes: '+15% series respecto a semana 1' },
    { week: 3, phase: 'Intensificación', vol: 90,  rir: '0.5', notes: 'Reducir volumen, subir intensidad' },
    { week: 4, phase: 'Deload',          vol: 60,  rir: '3',   notes: 'Recuperación activa' },
  ];
  return {
    splitName: splitMap[dias] || 'Full Body',
    schedule: scheduleTemplates[dias] || scheduleTemplates[3],
    volumeGuide: volumeGuides[objetivo] || volumeGuides.hipertrofia,
    intensityScheme: intensitySchemes[objetivo] || intensitySchemes.hipertrofia,
    progressionModel: (progressionModels[objetivo] || progressionModels.hipertrofia)[nivel] || 'Progresión lineal',
    sciJustification: sciJustifications[objetivo] || sciJustifications.hipertrofia,
    mesocycle,
  };
}

// ── Coach insights: contextual, science-backed, derived from profile + history ─

function generateCoachInsights(objetivo, nivel, dias, tiempo, sessions) {
  const insights = [];

  // 1. Frequency
  const freq2x = dias >= 3;
  insights.push({
    type: 'frequency', status: freq2x ? 'good' : 'info', icon: '↻',
    title: freq2x ? `Frecuencia 2× por grupo muscular posible` : 'Frecuencia 1× por grupo muscular',
    body: freq2x
      ? `Con ${dias} días, tu split permite estimular cada grupo muscular dos veces por semana. La frecuencia doble produce entre un 6–22% más de hipertrofia que la frecuencia simple, al multiplicar los pulsos de síntesis proteica muscular por semana.`
      : `Con 2 días, cada grupo se entrena una vez por semana. Es suficiente para principiantes, aunque la frecuencia 2× produce mejores resultados para todos los objetivos según la evidencia actual.`,
    ref: 'Schoenfeld et al., 2016 — "Effects of Resistance Training Frequency on MPS"',
    action: freq2x ? null : 'Considera aumentar a 3+ días si tu recuperación lo permite.',
  });

  // 2. Volume
  insights.push({
    type: 'volume', status: dias >= 3 ? 'good' : 'info', icon: '≡',
    title: objetivo === 'hipertrofia' ? 'Volumen dentro del rango MEV–MRV' : objetivo === 'fuerza' ? 'Volumen ajustado para fuerza máxima' : 'Volumen moderado para recomposición',
    body: objetivo === 'hipertrofia'
      ? `El volumen óptimo para hipertrofia se sitúa entre el MEV (mínimo efectivo) y el MRV (máximo recuperable). Para ${nivel === 'principiante' ? 'principiantes, 10–14' : nivel === 'intermedio' ? 'intermedios, 12–18' : 'avanzados, 16–22'} series semanales por grupo muscular es el rango recomendado. El exceso de volumen sin recuperación adecuada genera interferencia adaptativa.`
      : objetivo === 'fuerza'
        ? 'La fuerza máxima requiere menor volumen total pero mayor especificidad: pocas series, cargas elevadas (>80% 1RM) y descansos completos. La calidad de cada serie tiene mayor impacto que la cantidad total.'
        : 'La recomposición corporal requiere equilibrar el volumen con el déficit calórico. Prioriza ejercicios compuestos de alta eficiencia y mantén una ingesta proteica elevada (2.0–2.4 g/kg).',
    ref: 'Israetel, M. et al. — "Scientific Principles of Hypertrophy Training" (2021)',
    action: null,
  });

  // 3. Intensity / RIR
  const rirTarget = { hipertrofia: 'RIR 1–2', fuerza: 'RIR 0–1', recomp: 'RIR 1–3', rendimiento: 'RIR 0–2' }[objetivo] || 'RIR 1–2';
  insights.push({
    type: 'intensity', status: 'info', icon: '⚡',
    title: `Autorregulación de intensidad: ${rirTarget}`,
    body: objetivo === 'hipertrofia'
      ? `Para hipertrofia, las series al RIR 1–2 producen el mismo estímulo que las series al fallo con menor fatiga acumulada. Alejarse demasiado (RIR > 4) reduce drásticamente la señal anabólica en intermedios y avanzados.`
      : objetivo === 'fuerza'
        ? 'Las series de fuerza máxima requieren RIR 0–1 en los bloques de intensificación. La proximidad al fallo neuromuscular es el estímulo crítico para la adaptación del SNC.'
        : `La autorregulación por RIR permite ajustar la intensidad según la fatiga diaria, especialmente útil en contexto de déficit calórico donde la recuperación es más variable.`,
    ref: 'Helms et al., 2016 — "RPE-Based Training in Strength Sports"',
    action: `Lleva las últimas 1–2 series de cada ejercicio principal a ${rirTarget}.`,
  });

  // 4. Progression model
  const progLabel = { hipertrofia: { principiante: 'lineal', intermedio: 'ondulante (DUP)', avanzado: 'bloques' }, fuerza: { principiante: 'lineal', intermedio: 'Texas Method', avanzado: 'conjugada' }, recomp: { principiante: 'lineal', intermedio: 'ondulante', avanzado: 'ondulante avanzada' }, rendimiento: { principiante: 'lineal', intermedio: 'clásica', avanzado: 'compleja' } };
  const prog = (progLabel[objetivo] || progLabel.hipertrofia)[nivel] || 'lineal';
  insights.push({
    type: 'progression', status: 'info', icon: '↗',
    title: `Modelo de progresión: ${prog}`,
    body: nivel === 'principiante'
      ? 'En principiantes, la progresión lineal (añadir carga cada sesión) es el método más eficiente. El SNC se adapta rápidamente, permitiendo ganancias consistentes semana a semana durante 3–6 meses sin necesidad de periodización compleja.'
      : nivel === 'intermedio'
        ? `La periodización ondulante diaria (DUP) distribuye el estrés en variaciones de volumen e intensidad dentro de la misma semana, evitando el estancamiento que produce la progresión lineal en intermedios.`
        : 'La periodización por bloques permite especialización enfocada: fases de acumulación de volumen, intensificación y realización. Maximiza adaptaciones al precio de mayor complejidad de gestión.',
    ref: nivel === 'principiante' ? 'Rippetoe, M. — "Starting Strength"' : 'Zourdos et al., 2016 — "Novel Resistance Training-Specific RPE Scale"',
    action: null,
  });

  // 5. Recovery
  const restDays = 7 - dias;
  insights.push({
    type: 'recovery', status: restDays >= 2 ? 'good' : 'warning', icon: '○',
    title: restDays >= 2 ? `${restDays} días de recuperación semanal` : 'Gestión de fatiga crítica',
    body: restDays >= 2
      ? `La supercompensación (adaptación positiva al entrenamiento) ocurre durante la recuperación, no durante el entrenamiento. Con ${restDays} días de descanso semanal, el organismo tiene tiempo para reparar tejido muscular y supracompensar. El sueño (7–9 h) y la ingesta proteica en esos días son factores determinantes de la calidad del proceso.`
      : `Con ${dias} días de entrenamiento semanal, la gestión de fatiga es crítica. Monitorea el rendimiento semana a semana y programa un deload cada 3–4 semanas sin excepción.`,
    ref: 'Halson, S.L. (2014) — "Monitoring Training Load to Understand Fatigue in Athletes"',
    action: restDays < 2 ? 'Programa un deload de 1 semana cada 4 semanas de entrenamiento.' : null,
  });

  // 6. Balance analysis from Builder history
  if (sessions && sessions.length > 0) {
    const recent = sessions.slice(-5);
    const tally = {};
    recent.forEach(s => {
      (s.exercises || []).forEach(ex => {
        (ex.muscles || []).forEach(m => {
          const k = m.toLowerCase();
          tally[k] = (tally[k] || 0) + (ex.sets ? ex.sets.length : 1);
        });
      });
    });
    const pushKeys = ['pectoral', 'pectoral mayor', 'pectoral superior', 'pectoral inferior', 'deltoides ant', 'deltoides anterior', 'tríceps', 'triceps braquial'];
    const pullKeys = ['dorsal ancho', 'romboides', 'bíceps', 'biceps', 'bíceps braquial', 'braquial', 'deltoides post', 'deltoides posterior', 'trapecio'];
    const pushVol = pushKeys.reduce((s, k) => s + (tally[k] || 0), 0);
    const pullVol = pullKeys.reduce((s, k) => s + (tally[k] || 0), 0);

    if (pushVol > pullVol * 1.4 && pushVol > 0) {
      insights.push({
        type: 'balance', status: 'warning', icon: '⊘',
        title: 'Desequilibrio push/pull en sesiones recientes',
        body: `Tus ${recent.length} sesiones recientes muestran más volumen de empuje que de tracción. Un ratio desequilibrado incrementa el riesgo de pinzamiento subacromial y deterioro postural (protracción escapular, rotación interna del húmero). El ratio recomendado es 1:1 o 1:1.2 a favor de la tracción.`,
        ref: 'Comerford & Mottram, 2012 — "Kinetic Control: Movement Impairment"',
        action: 'Añade remo, face pull o dominadas en tu próxima sesión.',
      });
    } else if ((pushVol > 0 || pullVol > 0) && Math.abs(pushVol - pullVol) <= pushVol * 0.4) {
      insights.push({
        type: 'balance', status: 'good', icon: '✓',
        title: 'Balance push/pull correcto en sesiones recientes',
        body: 'Tu historial reciente muestra un ratio equilibrado entre trabajo de empuje y tracción. Mantenerlo protege la salud de los hombros y garantiza un desarrollo simétrico a largo plazo.',
        ref: null, action: null,
      });
    }

    const hasCore = recent.some(s =>
      (s.exercises || []).some(ex =>
        (ex.muscles || []).some(m => /core|abdominal|oblicu|transverso/.test(m.toLowerCase()))
      )
    );
    if (!hasCore) {
      insights.push({
        type: 'core', status: 'warning', icon: '◎',
        title: 'Sin trabajo de core en sesiones recientes',
        body: 'El core actúa como sistema central de transferencia de fuerza entre tren superior e inferior. Su deficiencia compromete la eficiencia en todos los patrones compuestos (sentadilla, peso muerto, press) y duplica el riesgo de lumbalgia.',
        ref: 'McGill, S. (2010) — "Core Training: Evidence Translating to Better Performance"',
        action: 'Incluye 2–3 series de plancha, Pallof press o dead bug al final de tu próxima sesión.',
      });
    }
  }

  return insights.slice(0, 7);
}

// ── Insight card (expandable) ─────────────────────────────────────────────────

const INSIGHT_COLORS = {
  good:    { bg: 'rgba(31,139,58,0.05)',  border: 'rgba(31,139,58,0.14)',  accent: '#1F8B3A' },
  info:    { bg: 'rgba(42,111,219,0.04)', border: 'rgba(42,111,219,0.12)', accent: '#2A6FDB' },
  warning: { bg: 'rgba(217,119,6,0.05)',  border: 'rgba(217,119,6,0.18)',  accent: '#D97706' },
};

function InsightCard({ insight }) {
  const [expanded, setExpanded] = React.useState(false);
  const c = INSIGHT_COLORS[insight.status] || INSIGHT_COLORS.info;
  return (
    <div style={{ borderRadius: 16, overflow: 'hidden', background: c.bg, border: `1px solid ${c.border}` }}>
      <button
        onClick={() => setExpanded(e => !e)}
        style={{ width: '100%', padding: '13px 16px', border: 'none', cursor: 'pointer', background: 'transparent', display: 'flex', alignItems: 'center', gap: 12, textAlign: 'left' }}
      >
        <span style={{
          width: 30, height: 30, borderRadius: 9, flexShrink: 0,
          background: `${c.bg}`, border: `1px solid ${c.border}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'ui-monospace,Menlo,monospace', fontSize: 13, color: c.accent, fontWeight: 700,
        }}>{insight.icon}</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: '"Inter",system-ui', fontSize: 13, fontWeight: 700, color: '#0F1A2E', lineHeight: 1.2 }}>{insight.title}</div>
          {!expanded && (
            <div style={{ fontFamily: '"Inter",system-ui', fontSize: 11, color: '#5C6477', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {insight.body.slice(0, 85)}…
            </div>
          )}
        </div>
        <span style={{ fontFamily: '"Inter",system-ui', fontSize: 11, color: c.accent, flexShrink: 0, transform: expanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', display: 'inline-block' }}>↓</span>
      </button>
      {expanded && (
        <div style={{ padding: '0 16px 14px' }}>
          <p style={{ fontFamily: '"Inter",system-ui', fontSize: 13, color: '#3A4257', lineHeight: 1.65, margin: '0 0 10px' }}>{insight.body}</p>
          {insight.ref && (
            <div style={{ padding: '6px 10px', borderRadius: 8, background: 'rgba(15,26,46,0.04)', border: '1px solid rgba(15,26,46,0.06)', fontFamily: 'ui-monospace,Menlo,monospace', fontSize: 10, color: '#5C6477', lineHeight: 1.4 }}>
              ↗ {insight.ref}
            </div>
          )}
          {insight.action && (
            <div style={{ marginTop: 8, padding: '8px 12px', borderRadius: 10, background: c.bg, border: `1px solid ${c.border}`, fontFamily: '"Inter",system-ui', fontSize: 12, color: '#0F1A2E', fontWeight: 600, lineHeight: 1.45 }}>
              → {insight.action}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Session exercise chip ─────────────────────────────────────────────────────

function CoachExerciseChip({ exercise }) {
  const { META } = ExerciseService;
  const patMeta = META.PATTERN_META[exercise.pattern] || {};
  const eqMeta = META.EQUIPMENT_META[exercise.equipment] || {};
  return (
    <div style={{ padding: '10px 14px', borderRadius: 12, background: '#FFFFFF', border: '1px solid rgba(15,26,46,0.07)', display: 'flex', alignItems: 'flex-start', gap: 10 }}>
      <div style={{ width: 3, borderRadius: 999, background: patMeta.color || '#5C6477', alignSelf: 'stretch', flexShrink: 0 }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginBottom: 4 }}>
          <span style={{ fontFamily: '"Inter",system-ui', fontSize: 12, fontWeight: 700, color: '#0F1A2E' }}>{exercise.name}</span>
          {exercise.compound && <span style={{ fontSize: 9, fontWeight: 700, padding: '1px 5px', borderRadius: 999, background: 'rgba(15,26,46,0.05)', color: '#5C6477', fontFamily: '"Inter",system-ui' }}>CPT</span>}
        </div>
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 4 }}>
          <span style={{ fontSize: 9, fontWeight: 700, padding: '1px 6px', borderRadius: 999, background: patMeta.bg || 'rgba(15,26,46,0.06)', color: patMeta.color || '#5C6477', fontFamily: '"Inter",system-ui' }}>{patMeta.short || exercise.pattern}</span>
          <span style={{ fontSize: 9, fontWeight: 700, padding: '1px 6px', borderRadius: 999, background: eqMeta.bg || 'rgba(15,26,46,0.06)', color: eqMeta.color || '#5C6477', fontFamily: '"Inter",system-ui' }}>{eqMeta.label || exercise.equipment}</span>
        </div>
        <div style={{ fontFamily: '"Inter",system-ui', fontSize: 10, color: '#9498A4' }}>{exercise.muscles.primary.join(' · ')}</div>
      </div>
    </div>
  );
}

function CoachSessionPanel({ sessionLabel, objetivo, nivel, tiempo }) {
  const [open, setOpen] = React.useState(false);
  const exercises = React.useMemo(() => ExerciseService.selectForSession(sessionLabel, objetivo, nivel, tiempo), [sessionLabel, objetivo, nivel, tiempo]);
  return (
    <div style={{ borderRadius: 14, overflow: 'hidden', border: '1px solid rgba(15,26,46,0.07)', background: '#FAFAF7' }}>
      <button onClick={() => setOpen(o => !o)} style={{ width: '100%', padding: '12px 16px', border: 'none', cursor: 'pointer', background: 'transparent', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <span style={{ fontFamily: '"Inter",system-ui', fontSize: 13, fontWeight: 700, color: '#0F1A2E' }}>{sessionLabel}</span>
          <span style={{ fontFamily: '"Inter",system-ui', fontSize: 11, color: '#9498A4', marginLeft: 8 }}>{exercises.length} ejercicios sugeridos</span>
        </div>
        <span style={{ fontFamily: '"Inter",system-ui', fontSize: 12, color: '#5C6477', transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', display: 'inline-block' }}>↓</span>
      </button>
      {open && (
        <div style={{ padding: '0 12px 12px', display: 'flex', flexDirection: 'column', gap: 6 }}>
          {exercises.map(ex => <CoachExerciseChip key={ex.id} exercise={ex} />)}
          <div style={{ marginTop: 4, padding: '8px 12px', borderRadius: 10, background: 'rgba(42,111,219,0.05)', border: '1px solid rgba(42,111,219,0.1)', fontFamily: '"Inter",system-ui', fontSize: 10, color: '#1a4fa0', lineHeight: 1.5 }}>
            Selección basada en objetivo ({objetivo}), nivel ({nivel}) y balance de patrones de movimiento. Personaliza en el <strong>Builder</strong>.
          </div>
        </div>
      )}
    </div>
  );
}

// ── Constants ─────────────────────────────────────────────────────────────────

const COACH_OBJETIVO = [
  { id: 'hipertrofia', label: 'Hipertrofia' },
  { id: 'fuerza',      label: 'Fuerza' },
  { id: 'recomp',      label: 'Recomposición' },
  { id: 'rendimiento', label: 'Rendimiento' },
];
const COACH_NIVEL = [
  { id: 'principiante', label: 'Principiante' },
  { id: 'intermedio',   label: 'Intermedio' },
  { id: 'avanzado',     label: 'Avanzado' },
];

const coachSectionLabel = {
  fontFamily: '"Inter",system-ui', fontSize: 12, fontWeight: 700,
  color: '#5C6477', letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 10,
};
const coachCardLabel = {
  fontFamily: 'ui-monospace,Menlo,monospace', fontSize: 11, fontWeight: 700,
  color: '#9498A4', letterSpacing: 0.6, textTransform: 'uppercase',
};

// ── Atlas Coach page component ────────────────────────────────────────────────

function AtlasCoachSection() {
  const { actions, state } = useStore();
  const [objetivo, setObjetivo] = React.useState('hipertrofia');
  const [nivel, setNivel] = React.useState('intermedio');
  const [dias, setDias] = React.useState(4);
  const [tiempo, setTiempo] = React.useState(60);
  const [saved, setSaved] = React.useState(false);
  const [gemFlash, setGemFlash] = React.useState(false);

  const protocol = React.useMemo(() => generateProtocol(objetivo, nivel, dias, tiempo), [objetivo, nivel, dias, tiempo]);
  const sessionLabels = React.useMemo(() => [...new Set(protocol.schedule.labels)], [protocol]);
  const insights = React.useMemo(
    () => generateCoachInsights(objetivo, nivel, dias, tiempo, state.sessions || []),
    [objetivo, nivel, dias, tiempo, state.sessions]
  );

  const handleSave = () => {
    actions.saveProtocol({ objetivo, nivel, dias, tiempo, ...protocol, savedAt: Date.now() });
    setSaved(true); setGemFlash(true);
    setTimeout(() => setGemFlash(false), 2500);
    setTimeout(() => setSaved(false), 4000);
  };

  const pillBtn = (active) => ({
    padding: '9px 16px', borderRadius: 999, cursor: 'pointer',
    border: active ? '1.5px solid #0F1A2E' : '1px solid rgba(15,26,46,0.12)',
    background: active ? '#0F1A2E' : '#FFFFFF',
    color: active ? '#FAFAF7' : '#0F1A2E',
    fontFamily: '"Inter",system-ui', fontSize: 13, fontWeight: 600,
    transition: 'all 0.15s', whiteSpace: 'nowrap',
  });

  return (
    <section style={{ padding: '120px 32px', minHeight: '80vh', background: '#FFFFFF' }}>
      <div style={{ maxWidth: 1180, margin: '0 auto' }}>

        {gemFlash && (
          <div style={{ position: 'fixed', top: 80, right: 32, zIndex: 200, background: '#0F1A2E', color: '#FAFAF7', padding: '10px 20px', borderRadius: 999, fontFamily: '"Inter",system-ui', fontSize: 14, fontWeight: 700, animation: 'fadeIn 0.3s ease', boxShadow: '0 8px 32px rgba(15,26,46,0.25)' }}>
            💎 +25 gemas · Protocolo guardado
          </div>
        )}

        {/* Header */}
        <div style={{ marginBottom: 48 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <span style={{ fontFamily: '"Inter",system-ui', fontSize: 13, fontWeight: 700, letterSpacing: 1.6, textTransform: 'uppercase', color: '#5C6477' }}>Atlas Coach</span>
            <span style={{ padding: '3px 10px', borderRadius: 999, background: 'rgba(42,111,219,0.08)', border: '1px solid rgba(42,111,219,0.16)', fontFamily: '"Inter",system-ui', fontSize: 10, fontWeight: 700, color: '#2A6FDB', letterSpacing: 0.3 }}>Basado en evidencia</span>
          </div>
          <h1 style={{ fontFamily: '"Inter",system-ui', fontSize: 52, fontWeight: 700, color: '#0F1A2E', letterSpacing: -2, lineHeight: 1.02, margin: '0 0 16px' }}>
            Protocolo inteligente.{' '}
            <span style={{ fontFamily: '"Instrument Serif",serif', fontStyle: 'italic', fontWeight: 400 }}>La ciencia como base.</span>
          </h1>
          <p style={{ fontFamily: '"Inter",system-ui', fontSize: 17, color: '#3A4257', lineHeight: 1.55, letterSpacing: -0.2, margin: 0, maxWidth: 580 }}>
            Configura tus parámetros y obtén un protocolo completo con análisis científico contextual,
            recomendaciones específicas y ejercicios seleccionados por evidencia.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: 24, alignItems: 'start' }}>

          {/* ── LEFT: config panel ─────────────────────────────────── */}
          <div style={{ background: '#FAFAF7', borderRadius: 24, border: '1px solid rgba(15,26,46,0.08)', padding: 28, display: 'flex', flexDirection: 'column', gap: 28, position: 'sticky', top: 80 }}>
            <div>
              <div style={coachSectionLabel}>Objetivo</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                {COACH_OBJETIVO.map(o => <button key={o.id} onClick={() => setObjetivo(o.id)} style={pillBtn(objetivo === o.id)}>{o.label}</button>)}
              </div>
            </div>
            <div>
              <div style={coachSectionLabel}>Nivel</div>
              <div style={{ display: 'flex', gap: 6 }}>
                {COACH_NIVEL.map(n => <button key={n.id} onClick={() => setNivel(n.id)} style={{ ...pillBtn(nivel === n.id), flex: 1 }}>{n.label}</button>)}
              </div>
            </div>
            <div>
              <div style={coachSectionLabel}>
                Días / semana
                <span style={{ color: '#0F1A2E', fontWeight: 800, marginLeft: 8, textTransform: 'none', letterSpacing: 0 }}>{dias}</span>
              </div>
              <input type="range" min={2} max={6} step={1} value={dias} onChange={e => setDias(+e.target.value)} style={{ width: '100%', accentColor: '#0F1A2E', margin: '6px 0 4px' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'ui-monospace,Menlo,monospace', fontSize: 11, color: '#9498A4' }}>
                {[2,3,4,5,6].map(n => <span key={n}>{n}</span>)}
              </div>
            </div>
            <div>
              <div style={coachSectionLabel}>Tiempo por sesión</div>
              <div style={{ display: 'flex', gap: 6 }}>
                {[45,60,90].map(t => <button key={t} onClick={() => setTiempo(t)} style={{ ...pillBtn(tiempo === t), flex: 1 }}>{t} min</button>)}
              </div>
            </div>

            {/* Insight count */}
            <div style={{ padding: '12px 16px', borderRadius: 14, background: 'rgba(42,111,219,0.05)', border: '1px solid rgba(42,111,219,0.12)' }}>
              <div style={{ fontFamily: 'ui-monospace,Menlo,monospace', fontSize: 9, fontWeight: 700, color: '#2A6FDB', letterSpacing: 0.8, marginBottom: 5 }}>ANÁLISIS ACTIVO</div>
              <div style={{ fontFamily: '"Inter",system-ui', fontSize: 12, color: '#3A4257', lineHeight: 1.5 }}>
                <span style={{ fontWeight: 700, color: '#0F1A2E', fontSize: 22 }}>{insights.length}</span>{' '}
                recomendaciones para tu perfil.
                {(state.sessions || []).length > 0 && (
                  <div style={{ marginTop: 4, fontSize: 11, color: '#5C6477' }}>
                    + análisis de {(state.sessions || []).length} sesión{(state.sessions || []).length !== 1 ? 'es' : ''} del Builder.
                  </div>
                )}
              </div>
            </div>

            <button onClick={handleSave} style={{ padding: '14px 20px', borderRadius: 14, border: 'none', cursor: 'pointer', background: saved ? '#E7F8EC' : '#0F1A2E', color: saved ? '#1F8B3A' : '#FAFAF7', fontFamily: '"Inter",system-ui', fontSize: 14, fontWeight: 700, letterSpacing: -0.2, transition: 'all 0.3s' }}>
              {saved ? '✓ Protocolo guardado · +25 gemas' : 'Guardar protocolo → +25 gemas 💎'}
            </button>
          </div>

          {/* ── RIGHT: results ────────────────────────────────────── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Protocol header */}
            <div style={{ background: '#0F1A2E', borderRadius: 24, padding: '28px 32px', color: '#FAFAF7' }}>
              <div style={{ fontFamily: 'ui-monospace,Menlo,monospace', fontSize: 11, fontWeight: 700, letterSpacing: 1, opacity: 0.5, marginBottom: 8 }}>PROTOCOLO · ATLAS COACH</div>
              <h2 style={{ fontFamily: '"Inter",system-ui', fontSize: 32, fontWeight: 700, letterSpacing: -1, margin: '0 0 6px' }}>{protocol.splitName}</h2>
              <p style={{ fontFamily: '"Inter",system-ui', fontSize: 14, opacity: 0.65, margin: 0 }}>
                {dias} días/sem · {tiempo} min/sesión · {COACH_OBJETIVO.find(o => o.id === objetivo)?.label} · {COACH_NIVEL.find(n => n.id === nivel)?.label}
              </p>
            </div>

            {/* Insights panel */}
            <div style={{ background: '#FAFAF7', borderRadius: 20, border: '1px solid rgba(15,26,46,0.08)', padding: '22px 24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                <div style={coachCardLabel}>Análisis del Coach</div>
                <span style={{ padding: '2px 8px', borderRadius: 999, background: 'rgba(42,111,219,0.07)', border: '1px solid rgba(42,111,219,0.14)', fontFamily: 'ui-monospace,Menlo,monospace', fontSize: 9, color: '#2A6FDB', fontWeight: 700 }}>CIENCIA APLICADA</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {insights.map((insight, i) => <InsightCard key={i} insight={insight} />)}
              </div>
            </div>

            {/* Weekly schedule */}
            <div style={{ background: '#FAFAF7', borderRadius: 20, border: '1px solid rgba(15,26,46,0.08)', padding: '20px 24px' }}>
              <div style={coachCardLabel}>Horario semanal</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6, marginTop: 14 }}>
                {protocol.schedule.days.map((day, i) => {
                  const sessionIdx = protocol.schedule.sessions[i];
                  const hasSession = sessionIdx !== null;
                  return (
                    <div key={i} style={{ textAlign: 'center' }}>
                      <div style={{ fontFamily: 'ui-monospace,Menlo,monospace', fontSize: 10, color: '#9498A4', marginBottom: 6, fontWeight: 600 }}>{day}</div>
                      <div style={{ padding: '8px 4px', borderRadius: 10, background: hasSession ? '#0F1A2E' : 'rgba(15,26,46,0.04)', color: hasSession ? '#FAFAF7' : '#9498A4', fontFamily: '"Inter",system-ui', fontSize: 10, fontWeight: hasSession ? 700 : 400, minHeight: 44, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {hasSession ? protocol.schedule.labels[sessionIdx] : '—'}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Volume + Intensity */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div style={{ background: '#FAFAF7', borderRadius: 20, border: '1px solid rgba(15,26,46,0.08)', padding: '20px 24px' }}>
                <div style={coachCardLabel}>Volumen prescrito</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 14 }}>
                  {Object.entries(protocol.volumeGuide).map(([muscle, vol]) => (
                    <div key={muscle} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontFamily: '"Inter",system-ui', fontSize: 12, fontWeight: 600, color: '#3A4257', textTransform: 'capitalize' }}>{muscle}</span>
                      <span style={{ fontFamily: 'ui-monospace,Menlo,monospace', fontSize: 11, color: '#5C6477', fontWeight: 700 }}>{vol}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ background: '#FAFAF7', borderRadius: 20, border: '1px solid rgba(15,26,46,0.08)', padding: '20px 24px' }}>
                  <div style={coachCardLabel}>Esquema de intensidad</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 14 }}>
                    {Object.entries(protocol.intensityScheme).map(([key, val]) => (
                      <div key={key} style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ fontFamily: '"Inter",system-ui', fontSize: 12, fontWeight: 600, color: '#3A4257' }}>{{ rirRange: 'RIR', rm: '% 1RM', reps: 'Reps', rest: 'Descanso' }[key] || key}</span>
                        <span style={{ fontFamily: 'ui-monospace,Menlo,monospace', fontSize: 11, color: '#0F1A2E', fontWeight: 700 }}>{val}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={{ background: '#FAFAF7', borderRadius: 20, border: '1px solid rgba(15,26,46,0.08)', padding: '20px 24px' }}>
                  <div style={coachCardLabel}>Modelo de progresión</div>
                  <div style={{ fontFamily: '"Inter",system-ui', fontSize: 14, fontWeight: 700, color: '#0F1A2E', marginTop: 12 }}>{protocol.progressionModel}</div>
                </div>
              </div>
            </div>

            {/* Session exercise suggestions */}
            <div style={{ background: '#FAFAF7', borderRadius: 20, border: '1px solid rgba(15,26,46,0.08)', padding: '20px 24px' }}>
              <div style={{ ...coachCardLabel, marginBottom: 6 }}>Ejercicios sugeridos por sesión</div>
              <p style={{ fontFamily: '"Inter",system-ui', fontSize: 12, color: '#9498A4', margin: '0 0 14px', lineHeight: 1.5 }}>
                Selección basada en objetivo, nivel y patrones de movimiento del split. Personaliza en el <strong>Builder</strong>.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {sessionLabels.map(label => <CoachSessionPanel key={label} sessionLabel={label} objetivo={objetivo} nivel={nivel} tiempo={tiempo} />)}
              </div>
            </div>

            {/* Scientific justification */}
            <div style={{ background: 'rgba(15,26,46,0.02)', borderRadius: 20, border: '1px solid rgba(15,26,46,0.06)', padding: '20px 24px' }}>
              <div style={coachCardLabel}>Justificación científica del protocolo</div>
              <p style={{ fontFamily: '"Inter",system-ui', fontSize: 14, color: '#3A4257', lineHeight: 1.7, margin: '12px 0 0' }}>{protocol.sciJustification}</p>
            </div>

            {/* 4-week mesocycle */}
            <div style={{ background: '#FAFAF7', borderRadius: 20, border: '1px solid rgba(15,26,46,0.08)', padding: '20px 24px' }}>
              <div style={coachCardLabel}>Mesociclo 4 semanas</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 14 }}>
                {protocol.mesocycle.map((week, i) => (
                  <div key={i} style={{ display: 'grid', gridTemplateColumns: '60px 1fr 80px 70px auto', alignItems: 'center', gap: 12, padding: '12px 16px', borderRadius: 12, background: '#FFFFFF', border: '1px solid rgba(15,26,46,0.06)' }}>
                    <span style={{ fontFamily: 'ui-monospace,Menlo,monospace', fontSize: 11, color: '#9498A4', fontWeight: 700 }}>SEM {week.week}</span>
                    <span style={{ fontFamily: '"Inter",system-ui', fontSize: 13, fontWeight: 700, color: week.phase === 'Deload' ? '#C24545' : '#0F1A2E' }}>{week.phase}</span>
                    <span style={{ fontFamily: 'ui-monospace,Menlo,monospace', fontSize: 12, fontWeight: 700, color: week.vol >= 100 ? '#1F8B3A' : week.vol >= 80 ? '#0F1A2E' : '#C24545' }}>Vol {week.vol}%</span>
                    <span style={{ fontFamily: 'ui-monospace,Menlo,monospace', fontSize: 11, color: '#5C6477' }}>RIR {week.rir}</span>
                    <span style={{ fontFamily: '"Inter",system-ui', fontSize: 11, color: '#9498A4', textAlign: 'right' }}>{week.notes}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}

Object.assign(window, { CoachSection, AtlasCoachSection });
