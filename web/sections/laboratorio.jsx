// Laboratorio — protocol generator (4-step selector + dynamic output)

function generateProtocol(objetivo, nivel, dias, tiempo) {
  const splitMap = {
    2: 'Full Body',
    3: nivel === 'principiante' ? 'Full Body 3x' : 'Push/Pull/Legs',
    4: 'Upper/Lower',
    5: nivel === 'avanzado' ? 'PPL + Upper/Lower' : 'Upper/Lower + Full',
    6: 'Push/Pull/Legs A/B',
  };

  const splitName = splitMap[dias] || 'Full Body';

  const scheduleTemplates = {
    2: { days: ['Lun','Mar','Mié','Jue','Vie','Sáb','Dom'], sessions: [0, null, null, 1, null, null, null], labels: ['Full A', 'Full B'] },
    3: { days: ['Lun','Mar','Mié','Jue','Vie','Sáb','Dom'], sessions: [0, null, 1, null, 2, null, null], labels: nivel === 'principiante' ? ['Full A','Full B','Full C'] : ['Push','Pull','Legs'] },
    4: { days: ['Lun','Mar','Mié','Jue','Vie','Sáb','Dom'], sessions: [0, 1, null, 2, 3, null, null], labels: ['Upper A','Lower A','Upper B','Lower B'] },
    5: { days: ['Lun','Mar','Mié','Jue','Vie','Sáb','Dom'], sessions: [0, 1, 2, null, 3, 4, null], labels: nivel === 'avanzado' ? ['Push','Pull','Legs','Upper','Lower'] : ['Upper A','Lower A','Full','Upper B','Lower B'] },
    6: { days: ['Lun','Mar','Mié','Jue','Vie','Sáb','Dom'], sessions: [0, 1, 2, 3, 4, 5, null], labels: ['Push A','Pull A','Legs A','Push B','Pull B','Legs B'] },
  };

  const scheduleTemplate = scheduleTemplates[dias] || scheduleTemplates[3];

  const volumeGuides = {
    hipertrofia: { pecho: '12-20 series/sem', espalda: '14-22 series/sem', hombro: '10-16 series/sem', biceps: '10-14 series/sem', triceps: '10-14 series/sem', pierna: '16-20 series/sem' },
    fuerza: { pecho: '8-12 series/sem', espalda: '10-14 series/sem', hombro: '6-10 series/sem', biceps: '6-8 series/sem', triceps: '6-8 series/sem', pierna: '10-14 series/sem' },
    recomp: { pecho: '10-16 series/sem', espalda: '12-18 series/sem', hombro: '8-12 series/sem', biceps: '8-12 series/sem', triceps: '8-12 series/sem', pierna: '14-18 series/sem' },
    rendimiento: { pecho: '8-12 series/sem', espalda: '10-14 series/sem', hombro: '8-10 series/sem', biceps: '6-8 series/sem', triceps: '6-8 series/sem', pierna: '12-16 series/sem' },
  };

  const intensitySchemes = {
    hipertrofia: { rpeRange: '7–8 RPE', rm: '65–80% 1RM', reps: '8–15 reps', rest: '90–120 s' },
    fuerza: { rpeRange: '8–9 RPE', rm: '80–93% 1RM', reps: '3–6 reps', rest: '3–5 min' },
    recomp: { rpeRange: '7–8.5 RPE', rm: '65–85% 1RM', reps: '8–12 reps', rest: '60–90 s' },
    rendimiento: { rpeRange: '8–9 RPE', rm: '75–90% 1RM', reps: '4–8 reps', rest: '2–4 min' },
  };

  const progressionModels = {
    hipertrofia: { principiante: 'Progresión lineal', intermedio: 'Progresión ondulante (DUP)', avanzado: 'Periodización por bloques' },
    fuerza: { principiante: 'Progresión lineal (SL/StrongLifts)', intermedio: 'Progresión Texas Method', avanzado: 'Periodización conjugada' },
    recomp: { principiante: 'Progresión lineal', intermedio: 'Progresión ondulante', avanzado: 'Periodización ondulatoria avanzada' },
    rendimiento: { principiante: 'Progresión lineal', intermedio: 'Periodización clásica', avanzado: 'Periodización compleja' },
  };

  const sciJustifications = {
    hipertrofia: 'La hipertrofia muscular se maximiza con un volumen semanal entre el MEV y el MRV, frecuencias de 2× por grupo muscular y RPE en rango 7-8 para garantizar suficiente estímulo sin comprometer la recuperación. La evidencia actual (Schoenfeld, 2016; Ralston, 2017) indica que el volumen es la variable con mayor impacto en el crecimiento a largo plazo.',
    fuerza: 'El desarrollo de la fuerza máxima requiere especificidad: cargas ≥80% del 1RM, baja cantidad de repeticiones y recuperaciones largas. La progresión en fuerza sigue la ley de Henneman, activando unidades motoras de alto umbral que solo responden a cargas elevadas. La frecuencia alta y la especificidad del patrón de movimiento son claves (Kraemer & Ratamess, 2004).',
    recomp: 'La recomposición corporal simultánea (pérdida de grasa + ganancia muscular) es más pronunciada en personas con margen anabólico suficiente. Requiere déficit calórico moderado (200-300 kcal/día), alta ingesta proteica (2.0-2.4g/kg) y entrenamiento de fuerza con volumen moderado-alto para preservar y construir masa muscular.',
    rendimiento: 'El entrenamiento orientado al rendimiento combina trabajo de fuerza máxima, potencia y capacidad de trabajo. La periodización busca picos de forma en momentos específicos mediante fases de carga, intensificación y tapering, con especial atención a la transferencia deportiva.',
  };

  const mesocycle = [
    { week: 1, phase: 'Acumulación', vol: 100, rpe: intensitySchemes[objetivo].rpeRange.split('–')[0], notes: 'Adaptación al volumen' },
    { week: 2, phase: 'Acumulación', vol: 115, rpe: intensitySchemes[objetivo].rpeRange.split('–')[0], notes: '+15% series respecto semana 1' },
    { week: 3, phase: 'Intensificación', vol: 90, rpe: intensitySchemes[objetivo].rpeRange.split('–')[1] || '9', notes: 'Reducir volumen, subir intensidad' },
    { week: 4, phase: 'Deload', vol: 60, rpe: '6', notes: 'Recuperación activa' },
  ];

  return {
    splitName,
    schedule: scheduleTemplate,
    volumeGuide: volumeGuides[objetivo] || volumeGuides.hipertrofia,
    intensityScheme: intensitySchemes[objetivo] || intensitySchemes.hipertrofia,
    progressionModel: (progressionModels[objetivo] || progressionModels.hipertrofia)[nivel] || 'Progresión lineal',
    sciJustification: sciJustifications[objetivo] || sciJustifications.hipertrofia,
    mesocycle,
  };
}

const OBJETIVO_LABELS = [
  { id: 'hipertrofia', label: 'Hipertrofia' },
  { id: 'fuerza', label: 'Fuerza' },
  { id: 'recomp', label: 'Recomposición' },
  { id: 'rendimiento', label: 'Rendimiento' },
];

const NIVEL_LABELS = [
  { id: 'principiante', label: 'Principiante' },
  { id: 'intermedio', label: 'Intermedio' },
  { id: 'avanzado', label: 'Avanzado' },
];

const TIEMPO_OPTS = [45, 60, 90];

function LaboratorioSection() {
  const { state, actions } = useStore();
  const [objetivo, setObjetivo] = React.useState('hipertrofia');
  const [nivel, setNivel] = React.useState('intermedio');
  const [dias, setDias] = React.useState(4);
  const [tiempo, setTiempo] = React.useState(60);
  const [saved, setSaved] = React.useState(false);
  const [gemFlash, setGemFlash] = React.useState(false);

  const protocol = React.useMemo(
    () => generateProtocol(objetivo, nivel, dias, tiempo),
    [objetivo, nivel, dias, tiempo]
  );

  const handleSave = () => {
    actions.saveProtocol({ objetivo, nivel, dias, tiempo, ...protocol, savedAt: Date.now() });
    setSaved(true);
    setGemFlash(true);
    setTimeout(() => setGemFlash(false), 2500);
    setTimeout(() => setSaved(false), 4000);
  };

  const pillBtn = (active) => ({
    padding: '9px 16px', borderRadius: 999, cursor: 'pointer',
    border: active ? '1.5px solid #0F1A2E' : '1px solid rgba(15,26,46,0.12)',
    background: active ? '#0F1A2E' : '#FFFFFF',
    color: active ? '#FAFAF7' : '#0F1A2E',
    fontFamily: '"Inter",system-ui', fontSize: 13, fontWeight: 600,
    transition: 'all 0.15s',
    whiteSpace: 'nowrap',
  });

  return (
    <section style={{ padding: '120px 32px', minHeight: '80vh', background: '#FFFFFF' }}>
      <div style={{ maxWidth: 1180, margin: '0 auto' }}>

        {gemFlash && (
          <div style={{
            position: 'fixed', top: 80, right: 32, zIndex: 200,
            background: '#0F1A2E', color: '#FAFAF7',
            padding: '10px 20px', borderRadius: 999,
            fontFamily: '"Inter",system-ui', fontSize: 14, fontWeight: 700,
            animation: 'fadeIn 0.3s ease',
            boxShadow: '0 8px 32px rgba(15,26,46,0.25)',
          }}>
            💎 +25 gemas · Protocolo guardado
          </div>
        )}

        {/* Header */}
        <div style={{ marginBottom: 48 }}>
          <span style={{ fontFamily: '"Inter",system-ui', fontSize: 13, fontWeight: 700, letterSpacing: 1.6, textTransform: 'uppercase', color: '#5C6477' }}>
            Laboratorio · Generador de protocolos
          </span>
          <h1 style={{ fontFamily: '"Inter",system-ui', fontSize: 52, fontWeight: 700, color: '#0F1A2E', letterSpacing: -2, lineHeight: 1.02, margin: '12px 0 16px' }}>
            Tu protocolo. <span style={{ fontFamily: '"Instrument Serif",serif', fontStyle: 'italic', fontWeight: 400 }}>Basado en ciencia.</span>
          </h1>
          <p style={{ fontFamily: '"Inter",system-ui', fontSize: 17, color: '#3A4257', lineHeight: 1.55, letterSpacing: -0.2, margin: 0, maxWidth: 560 }}>
            Selecciona tus parámetros y obtén un protocolo de entrenamiento completo con justificación científica, mesociclo y guía de volumen.
          </p>
        </div>

        {/* Main layout */}
        <div style={{
          display: 'grid', gridTemplateColumns: '380px 1fr', gap: 24,
          alignItems: 'start',
        }}>

          {/* LEFT — selectors */}
          <div style={{
            background: '#FAFAF7', borderRadius: 24,
            border: '1px solid rgba(15,26,46,0.08)',
            padding: 28, display: 'flex', flexDirection: 'column', gap: 28,
            position: 'sticky', top: 80,
          }}>

            {/* Objetivo */}
            <div>
              <div style={sectionLabel}>Objetivo</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                {OBJETIVO_LABELS.map(o => (
                  <button key={o.id} onClick={() => setObjetivo(o.id)} style={pillBtn(objetivo === o.id)}>
                    {o.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Nivel */}
            <div>
              <div style={sectionLabel}>Nivel</div>
              <div style={{ display: 'flex', gap: 6 }}>
                {NIVEL_LABELS.map(n => (
                  <button key={n.id} onClick={() => setNivel(n.id)} style={{ ...pillBtn(nivel === n.id), flex: 1 }}>
                    {n.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Días */}
            <div>
              <div style={sectionLabel}>
                Días / semana
                <span style={{ color: '#0F1A2E', fontWeight: 800, marginLeft: 8, textTransform: 'none', letterSpacing: 0 }}>{dias}</span>
              </div>
              <input
                type="range" min={2} max={6} step={1} value={dias}
                onChange={e => setDias(+e.target.value)}
                style={{ width: '100%', accentColor: '#0F1A2E', margin: '6px 0 4px' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'ui-monospace,Menlo,monospace', fontSize: 11, color: '#9498A4' }}>
                {[2,3,4,5,6].map(n => <span key={n}>{n}</span>)}
              </div>
            </div>

            {/* Tiempo */}
            <div>
              <div style={sectionLabel}>Tiempo por sesión</div>
              <div style={{ display: 'flex', gap: 6 }}>
                {TIEMPO_OPTS.map(t => (
                  <button key={t} onClick={() => setTiempo(t)} style={{ ...pillBtn(tiempo === t), flex: 1 }}>
                    {t} min
                  </button>
                ))}
              </div>
            </div>

            {/* Save button */}
            <button
              onClick={handleSave}
              style={{
                padding: '14px 20px', borderRadius: 14, border: 'none', cursor: 'pointer',
                background: saved ? '#E7F8EC' : '#0F1A2E',
                color: saved ? '#1F8B3A' : '#FAFAF7',
                fontFamily: '"Inter",system-ui', fontSize: 14, fontWeight: 700, letterSpacing: -0.2,
                transition: 'all 0.3s',
              }}
            >
              {saved ? '✓ Protocolo guardado · +25 gemas' : 'Guardar protocolo → +25 gemas 💎'}
            </button>
          </div>

          {/* RIGHT — protocol output */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Split name + header */}
            <div style={{
              background: '#0F1A2E', borderRadius: 24, padding: '28px 32px', color: '#FAFAF7',
            }}>
              <div style={{ fontFamily: 'ui-monospace,Menlo,monospace', fontSize: 11, fontWeight: 700, letterSpacing: 1, opacity: 0.5, marginBottom: 8 }}>
                PROTOCOLO GENERADO
              </div>
              <h2 style={{ fontFamily: '"Inter",system-ui', fontSize: 32, fontWeight: 700, letterSpacing: -1, margin: '0 0 6px' }}>
                {protocol.splitName}
              </h2>
              <p style={{ fontFamily: '"Inter",system-ui', fontSize: 14, opacity: 0.65, margin: 0 }}>
                {dias} días/sem · {tiempo} min/sesión · {OBJETIVO_LABELS.find(o => o.id === objetivo)?.label} · {NIVEL_LABELS.find(n => n.id === nivel)?.label}
              </p>
            </div>

            {/* Weekly schedule */}
            <div style={{ background: '#FAFAF7', borderRadius: 20, border: '1px solid rgba(15,26,46,0.08)', padding: '20px 24px' }}>
              <div style={cardLabel}>Horario semanal</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6, marginTop: 14 }}>
                {protocol.schedule.days.map((day, i) => {
                  const sessionIdx = protocol.schedule.sessions[i];
                  const hasSession = sessionIdx !== null;
                  return (
                    <div key={i} style={{ textAlign: 'center' }}>
                      <div style={{ fontFamily: 'ui-monospace,Menlo,monospace', fontSize: 10, color: '#9498A4', marginBottom: 6, fontWeight: 600 }}>
                        {day}
                      </div>
                      <div style={{
                        padding: '8px 4px', borderRadius: 10,
                        background: hasSession ? '#0F1A2E' : 'rgba(15,26,46,0.04)',
                        color: hasSession ? '#FAFAF7' : '#9498A4',
                        fontFamily: '"Inter",system-ui', fontSize: 11, fontWeight: hasSession ? 700 : 400,
                        minHeight: 44, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        {hasSession ? protocol.schedule.labels[sessionIdx] : '—'}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 2-col row: volume + intensity */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>

              {/* Volume guide */}
              <div style={{ background: '#FAFAF7', borderRadius: 20, border: '1px solid rgba(15,26,46,0.08)', padding: '20px 24px' }}>
                <div style={cardLabel}>Volumen prescrito</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 14 }}>
                  {Object.entries(protocol.volumeGuide).map(([muscle, vol]) => (
                    <div key={muscle} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontFamily: '"Inter",system-ui', fontSize: 12, fontWeight: 600, color: '#3A4257', textTransform: 'capitalize' }}>
                        {muscle}
                      </span>
                      <span style={{ fontFamily: 'ui-monospace,Menlo,monospace', fontSize: 11, color: '#5C6477', fontWeight: 700 }}>
                        {vol}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Intensity scheme + progression */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ background: '#FAFAF7', borderRadius: 20, border: '1px solid rgba(15,26,46,0.08)', padding: '20px 24px' }}>
                  <div style={cardLabel}>Esquema de intensidad</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 14 }}>
                    {Object.entries(protocol.intensityScheme).map(([key, val]) => {
                      const labels = { rpeRange: 'RPE', rm: '% 1RM', reps: 'Reps', rest: 'Descanso' };
                      return (
                        <div key={key} style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ fontFamily: '"Inter",system-ui', fontSize: 12, fontWeight: 600, color: '#3A4257' }}>
                            {labels[key] || key}
                          </span>
                          <span style={{ fontFamily: 'ui-monospace,Menlo,monospace', fontSize: 11, color: '#0F1A2E', fontWeight: 700 }}>
                            {val}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div style={{ background: '#FAFAF7', borderRadius: 20, border: '1px solid rgba(15,26,46,0.08)', padding: '20px 24px' }}>
                  <div style={cardLabel}>Modelo de progresión</div>
                  <div style={{ fontFamily: '"Inter",system-ui', fontSize: 14, fontWeight: 700, color: '#0F1A2E', marginTop: 12 }}>
                    {protocol.progressionModel}
                  </div>
                </div>
              </div>
            </div>

            {/* Scientific justification */}
            <div style={{
              background: 'rgba(15,26,46,0.02)', borderRadius: 20,
              border: '1px solid rgba(15,26,46,0.06)', padding: '20px 24px',
            }}>
              <div style={cardLabel}>Justificación científica</div>
              <p style={{ fontFamily: '"Inter",system-ui', fontSize: 14, color: '#3A4257', lineHeight: 1.7, margin: '12px 0 0' }}>
                {protocol.sciJustification}
              </p>
            </div>

            {/* 4-week mesocycle */}
            <div style={{ background: '#FAFAF7', borderRadius: 20, border: '1px solid rgba(15,26,46,0.08)', padding: '20px 24px' }}>
              <div style={cardLabel}>Mesociclo 4 semanas</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 14 }}>
                {protocol.mesocycle.map((week, i) => (
                  <div key={i} style={{
                    display: 'grid', gridTemplateColumns: '60px 1fr 80px 80px auto',
                    alignItems: 'center', gap: 12,
                    padding: '12px 16px', borderRadius: 12,
                    background: '#FFFFFF', border: '1px solid rgba(15,26,46,0.06)',
                  }}>
                    <span style={{ fontFamily: 'ui-monospace,Menlo,monospace', fontSize: 11, color: '#9498A4', fontWeight: 700 }}>
                      SEM {week.week}
                    </span>
                    <span style={{ fontFamily: '"Inter",system-ui', fontSize: 13, fontWeight: 700, color: week.phase === 'Deload' ? '#C24545' : '#0F1A2E' }}>
                      {week.phase}
                    </span>
                    <span style={{
                      fontFamily: 'ui-monospace,Menlo,monospace', fontSize: 12, fontWeight: 700,
                      color: week.vol >= 100 ? '#1F8B3A' : week.vol >= 80 ? '#0F1A2E' : '#C24545',
                    }}>
                      Vol {week.vol}%
                    </span>
                    <span style={{ fontFamily: 'ui-monospace,Menlo,monospace', fontSize: 11, color: '#5C6477' }}>
                      RPE {week.rpe}
                    </span>
                    <span style={{ fontFamily: '"Inter",system-ui', fontSize: 11, color: '#9498A4', textAlign: 'right' }}>
                      {week.notes}
                    </span>
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

const sectionLabel = {
  fontFamily: '"Inter",system-ui', fontSize: 12, fontWeight: 700,
  color: '#5C6477', letterSpacing: 0.8, textTransform: 'uppercase',
  marginBottom: 10,
};

const cardLabel = {
  fontFamily: 'ui-monospace,Menlo,monospace', fontSize: 11, fontWeight: 700,
  color: '#9498A4', letterSpacing: 0.6, textTransform: 'uppercase',
};

Object.assign(window, { LaboratorioSection });
