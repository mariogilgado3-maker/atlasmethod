// Builder — full exercise builder with session logging

const DB = {
  empuje: [
    { id: 'press-banca', name: 'Press banca', muscles: ['Pectoral', 'Tríceps', 'Deltoides ant.'], equipment: 'barra', compound: true },
    { id: 'press-inclinado', name: 'Press inclinado mancuernas', muscles: ['Pectoral superior', 'Deltoides ant.'], equipment: 'mancuernas', compound: true },
    { id: 'press-militar', name: 'Press militar', muscles: ['Deltoides', 'Tríceps'], equipment: 'barra', compound: true },
    { id: 'fondos', name: 'Fondos en paralelas', muscles: ['Pectoral', 'Tríceps'], equipment: 'bodyweight', compound: true },
    { id: 'aperturas', name: 'Aperturas en polea', muscles: ['Pectoral'], equipment: 'polea', compound: false },
    { id: 'extensiones-triceps', name: 'Extensiones tríceps polea', muscles: ['Tríceps'], equipment: 'polea', compound: false },
  ],
  traccion: [
    { id: 'peso-muerto', name: 'Peso muerto', muscles: ['Isquios', 'Glúteos', 'Lumbar', 'Trapecios'], equipment: 'barra', compound: true },
    { id: 'remo-barra', name: 'Remo con barra', muscles: ['Dorsal', 'Romboides', 'Bíceps'], equipment: 'barra', compound: true },
    { id: 'dominadas', name: 'Dominadas', muscles: ['Dorsal', 'Bíceps', 'Romboides'], equipment: 'bodyweight', compound: true },
    { id: 'remo-polea', name: 'Remo en polea baja', muscles: ['Dorsal', 'Romboides'], equipment: 'polea', compound: true },
    { id: 'curl-biceps', name: 'Curl bíceps barra', muscles: ['Bíceps'], equipment: 'barra', compound: false },
    { id: 'face-pull', name: 'Face pull', muscles: ['Deltoides post.', 'Romboides'], equipment: 'polea', compound: false },
  ],
  pierna: [
    { id: 'sentadilla', name: 'Sentadilla trasera', muscles: ['Cuádriceps', 'Glúteos', 'Isquios'], equipment: 'barra', compound: true },
    { id: 'prensa', name: 'Prensa de piernas', muscles: ['Cuádriceps', 'Glúteos'], equipment: 'máquina', compound: true },
    { id: 'rdl', name: 'RDL mancuernas', muscles: ['Isquios', 'Glúteos', 'Lumbar'], equipment: 'mancuernas', compound: true },
    { id: 'hip-thrust', name: 'Hip thrust', muscles: ['Glúteos', 'Isquios'], equipment: 'barra', compound: true },
    { id: 'extension-cuadriceps', name: 'Extensión cuádriceps', muscles: ['Cuádriceps'], equipment: 'máquina', compound: false },
    { id: 'curl-femoral', name: 'Curl femoral tumbado', muscles: ['Isquios'], equipment: 'máquina', compound: false },
    { id: 'gemelos', name: 'Elevación de talones', muscles: ['Gemelos', 'Sóleo'], equipment: 'máquina', compound: false },
  ],
  core: [
    { id: 'plancha', name: 'Plancha', muscles: ['Core', 'Transverso'], equipment: 'bodyweight', compound: false },
    { id: 'ab-rueda', name: 'Rueda abdominal', muscles: ['Core', 'Dorsal'], equipment: 'rueda', compound: false },
    { id: 'pallof', name: 'Pallof press', muscles: ['Core', 'Oblicuos'], equipment: 'polea', compound: false },
  ],
};

const CAT_LABELS = { empuje: 'Empuje', traccion: 'Tracción', pierna: 'Pierna', core: 'Core' };

const EQUIPMENT_COLORS = {
  barra: { bg: 'rgba(15,26,46,0.07)', text: '#0F1A2E' },
  mancuernas: { bg: 'rgba(42,111,219,0.08)', text: '#1a4fa0' },
  bodyweight: { bg: 'rgba(31,139,58,0.08)', text: '#1F8B3A' },
  polea: { bg: 'rgba(194,69,69,0.08)', text: '#C24545' },
  máquina: { bg: 'rgba(148,152,164,0.12)', text: '#5C6477' },
  rueda: { bg: 'rgba(148,152,164,0.12)', text: '#5C6477' },
};

// Compute volume per muscle from exercises
function computeVolume(exercises) {
  const vol = {};
  exercises.forEach(ex => {
    const totalSets = ex.sets.length;
    (ex.muscles || []).forEach(m => {
      vol[m] = (vol[m] || 0) + totalSets;
    });
  });
  return vol;
}

function BuilderSection() {
  const { actions } = useStore();
  const [activeTab, setActiveTab] = React.useState('empuje');
  const [workout, setWorkout] = React.useState([]);
  const [collapsedExercises, setCollapsedExercises] = React.useState({});
  const [saved, setSaved] = React.useState(false);
  const [gemFlash, setGemFlash] = React.useState(false);

  const addExercise = (exercise) => {
    if (workout.find(e => e.id === exercise.id)) return;
    setWorkout(prev => [...prev, {
      ...exercise,
      sets: [{ kg: '', reps: '', rpe: '' }],
    }]);
  };

  const removeExercise = (id) => {
    setWorkout(prev => prev.filter(e => e.id !== id));
  };

  const addSet = (exerciseId) => {
    setWorkout(prev => prev.map(e =>
      e.id === exerciseId
        ? { ...e, sets: [...e.sets, { kg: '', reps: '', rpe: '' }] }
        : e
    ));
  };

  const removeSet = (exerciseId, setIdx) => {
    setWorkout(prev => prev.map(e =>
      e.id === exerciseId
        ? { ...e, sets: e.sets.filter((_, i) => i !== setIdx) }
        : e
    ));
  };

  const updateSet = (exerciseId, setIdx, field, value) => {
    setWorkout(prev => prev.map(e =>
      e.id === exerciseId
        ? { ...e, sets: e.sets.map((s, i) => i === setIdx ? { ...s, [field]: value } : s) }
        : e
    ));
  };

  const toggleCollapse = (id) => {
    setCollapsedExercises(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSave = () => {
    if (workout.length === 0) return;
    actions.logSession(workout.map(ex => ({
      name: ex.name,
      muscles: ex.muscles,
      sets: ex.sets,
    })));
    setSaved(true);
    setGemFlash(true);
    setTimeout(() => setGemFlash(false), 2500);
    setTimeout(() => {
      setSaved(false);
      setWorkout([]);
      setCollapsedExercises({});
    }, 3000);
  };

  const volumeMap = React.useMemo(() => computeVolume(workout), [workout]);
  const maxVol = Math.max(...Object.values(volumeMap), 1);

  return (
    <section style={{ padding: '120px 32px', minHeight: '80vh', background: '#FAFAF7' }}>
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
            💎 +30 gemas · Sesión registrada
          </div>
        )}

        {/* Header */}
        <div style={{ marginBottom: 40 }}>
          <span style={{ fontFamily: '"Inter",system-ui', fontSize: 13, fontWeight: 700, letterSpacing: 1.6, textTransform: 'uppercase', color: '#5C6477' }}>
            Builder · Constructor de sesiones
          </span>
          <h1 style={{ fontFamily: '"Inter",system-ui', fontSize: 52, fontWeight: 700, color: '#0F1A2E', letterSpacing: -2, lineHeight: 1.02, margin: '12px 0 16px' }}>
            Construye tu sesión. <span style={{ fontFamily: '"Instrument Serif",serif', fontStyle: 'italic', fontWeight: 400 }}>Registra cada serie.</span>
          </h1>
        </div>

        {/* Main layout */}
        <div style={{
          background: '#FFFFFF', borderRadius: 28,
          border: '1px solid rgba(15,26,46,0.08)',
          boxShadow: '0 20px 60px -30px rgba(15,26,46,0.15)',
          overflow: 'hidden',
          display: 'grid', gridTemplateColumns: '340px 1fr',
          minHeight: 580,
        }}>

          {/* LEFT — exercise selector */}
          <div style={{ borderRight: '1px solid rgba(15,26,46,0.06)', display: 'flex', flexDirection: 'column' }}>

            {/* Category tabs */}
            <div style={{ display: 'flex', borderBottom: '1px solid rgba(15,26,46,0.06)' }}>
              {Object.entries(CAT_LABELS).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  style={{
                    flex: 1, padding: '12px 4px',
                    border: 'none', cursor: 'pointer',
                    background: activeTab === key ? '#FAFAF7' : 'transparent',
                    borderBottom: activeTab === key ? '2px solid #0F1A2E' : '2px solid transparent',
                    fontFamily: '"Inter",system-ui', fontSize: 12, fontWeight: 700,
                    color: activeTab === key ? '#0F1A2E' : '#9498A4',
                    transition: 'all 0.15s',
                  }}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Exercise list */}
            <div style={{ flex: 1, overflowY: 'auto', padding: 12 }}>
              {(DB[activeTab] || []).map(exercise => {
                const isAdded = workout.some(e => e.id === exercise.id);
                const eqColor = EQUIPMENT_COLORS[exercise.equipment] || EQUIPMENT_COLORS.barra;
                return (
                  <div
                    key={exercise.id}
                    style={{
                      padding: '12px 14px', borderRadius: 12, marginBottom: 6,
                      background: isAdded ? '#FAFAF7' : '#FFFFFF',
                      border: isAdded ? '1px solid rgba(15,26,46,0.14)' : '1px solid rgba(15,26,46,0.06)',
                      display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10,
                    }}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontFamily: '"Inter",system-ui', fontSize: 13, fontWeight: 700, color: '#0F1A2E', marginBottom: 4 }}>
                        {exercise.name}
                        {exercise.compound && (
                          <span style={{ marginLeft: 6, fontSize: 10, color: '#5C6477', fontWeight: 600, background: 'rgba(15,26,46,0.06)', padding: '1px 6px', borderRadius: 999 }}>
                            compuesto
                          </span>
                        )}
                      </div>
                      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', alignItems: 'center' }}>
                        <span style={{
                          fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 999,
                          background: eqColor.bg, color: eqColor.text, fontFamily: '"Inter",system-ui',
                        }}>
                          {exercise.equipment}
                        </span>
                        <span style={{ fontFamily: '"Inter",system-ui', fontSize: 10, color: '#9498A4' }}>
                          {exercise.muscles.join(', ')}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => isAdded ? removeExercise(exercise.id) : addExercise(exercise)}
                      style={{
                        width: 28, height: 28, borderRadius: 999, border: 'none',
                        cursor: 'pointer', flexShrink: 0,
                        background: isAdded ? 'rgba(194,69,69,0.1)' : '#0F1A2E',
                        color: isAdded ? '#C24545' : '#FAFAF7',
                        fontFamily: '"Inter",system-ui', fontSize: 16, fontWeight: 700,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        transition: 'all 0.15s',
                      }}
                    >
                      {isAdded ? '−' : '+'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* RIGHT — workout builder */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ flex: 1, padding: '20px 24px', overflowY: 'auto' }}>

              {workout.length === 0 && (
                <div style={{ textAlign: 'center', padding: '60px 0', color: '#9498A4' }}>
                  <div style={{ fontSize: 36, marginBottom: 12 }}>+</div>
                  <p style={{ fontFamily: '"Inter",system-ui', fontSize: 15, fontWeight: 500 }}>
                    Añade ejercicios desde el panel izquierdo
                  </p>
                </div>
              )}

              {workout.map((exercise, exIdx) => {
                const isCollapsed = collapsedExercises[exercise.id];
                return (
                  <div
                    key={exercise.id}
                    style={{
                      marginBottom: 16, borderRadius: 16,
                      border: '1px solid rgba(15,26,46,0.08)',
                      background: '#FAFAF7', overflow: 'hidden',
                    }}
                  >
                    {/* Exercise header */}
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      padding: '12px 16px',
                      borderBottom: isCollapsed ? 'none' : '1px solid rgba(15,26,46,0.06)',
                      background: '#FFFFFF',
                    }}>
                      <button
                        onClick={() => toggleCollapse(exercise.id)}
                        style={{
                          width: 22, height: 22, borderRadius: 999, border: 'none',
                          background: 'rgba(15,26,46,0.06)', cursor: 'pointer',
                          fontFamily: '"Inter",system-ui', fontSize: 12, color: '#5C6477',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          transform: isCollapsed ? 'rotate(-90deg)' : 'none',
                          transition: 'transform 0.2s',
                        }}
                      >
                        ↓
                      </button>
                      <span style={{ fontFamily: '"Inter",system-ui', fontSize: 14, fontWeight: 700, color: '#0F1A2E', flex: 1 }}>
                        {exercise.name}
                      </span>
                      <span style={{ fontFamily: 'ui-monospace,Menlo,monospace', fontSize: 11, color: '#9498A4' }}>
                        {exercise.sets.length} {exercise.sets.length === 1 ? 'serie' : 'series'}
                      </span>
                      <button
                        onClick={() => removeExercise(exercise.id)}
                        style={{
                          border: 'none', background: 'none', cursor: 'pointer',
                          color: '#C24545', fontFamily: '"Inter",system-ui', fontSize: 13, fontWeight: 700,
                          padding: '2px 6px',
                        }}
                      >
                        ✕
                      </button>
                    </div>

                    {/* Sets */}
                    {!isCollapsed && (
                      <div style={{ padding: '12px 16px' }}>
                        {/* Header row */}
                        <div style={{
                          display: 'grid', gridTemplateColumns: '32px 1fr 1fr 1fr 28px',
                          gap: 8, alignItems: 'center', marginBottom: 6,
                          paddingBottom: 6, borderBottom: '1px solid rgba(15,26,46,0.06)',
                        }}>
                          <span style={setHeaderLabel}>#</span>
                          <span style={setHeaderLabel}>Peso (kg)</span>
                          <span style={setHeaderLabel}>Reps</span>
                          <span style={setHeaderLabel}>RPE</span>
                          <span />
                        </div>

                        {exercise.sets.map((set, setIdx) => (
                          <div
                            key={setIdx}
                            style={{
                              display: 'grid', gridTemplateColumns: '32px 1fr 1fr 1fr 28px',
                              gap: 8, alignItems: 'center', marginBottom: 6,
                            }}
                          >
                            <span style={{ fontFamily: 'ui-monospace,Menlo,monospace', fontSize: 11, color: '#9498A4', textAlign: 'center', fontWeight: 700 }}>
                              {setIdx + 1}
                            </span>
                            <input
                              type="number"
                              value={set.kg}
                              onChange={e => updateSet(exercise.id, setIdx, 'kg', e.target.value)}
                              placeholder="—"
                              style={setInput}
                            />
                            <input
                              type="number"
                              value={set.reps}
                              onChange={e => updateSet(exercise.id, setIdx, 'reps', e.target.value)}
                              placeholder="—"
                              style={setInput}
                            />
                            <input
                              type="number"
                              value={set.rpe}
                              onChange={e => updateSet(exercise.id, setIdx, 'rpe', e.target.value)}
                              placeholder="—"
                              min="1" max="10" step="0.5"
                              style={setInput}
                            />
                            <button
                              onClick={() => removeSet(exercise.id, setIdx)}
                              style={{
                                border: 'none', background: 'none', cursor: 'pointer',
                                color: '#9498A4', fontSize: 14, padding: 2,
                                display: exercise.sets.length === 1 ? 'none' : 'block',
                              }}
                            >
                              ✕
                            </button>
                          </div>
                        ))}

                        <button
                          onClick={() => addSet(exercise.id)}
                          style={{
                            marginTop: 6, padding: '6px 14px', borderRadius: 8,
                            border: '1px dashed rgba(15,26,46,0.2)',
                            background: 'transparent', cursor: 'pointer',
                            fontFamily: '"Inter",system-ui', fontSize: 12, fontWeight: 600, color: '#5C6477',
                          }}
                        >
                          + Añadir serie
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Volume summary + save */}
            <div style={{ borderTop: '1px solid rgba(15,26,46,0.06)', padding: '16px 24px', background: '#FAFAF7' }}>
              {Object.keys(volumeMap).length > 0 && (
                <div style={{ marginBottom: 14 }}>
                  <div style={{ fontFamily: 'ui-monospace,Menlo,monospace', fontSize: 10, fontWeight: 700, color: '#9498A4', letterSpacing: 0.6, marginBottom: 8 }}>
                    VOLUMEN POR MÚSCULO
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                    {Object.entries(volumeMap).map(([muscle, sets]) => (
                      <div key={muscle} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ fontFamily: '"Inter",system-ui', fontSize: 11, fontWeight: 600, color: '#3A4257', width: 100, flexShrink: 0 }}>
                          {muscle}
                        </span>
                        <div style={{ flex: 1, height: 6, borderRadius: 999, background: 'rgba(15,26,46,0.06)' }}>
                          <div style={{
                            height: '100%', borderRadius: 999,
                            background: '#0F1A2E',
                            width: `${(sets / maxVol) * 100}%`,
                            transition: 'width 0.3s ease',
                          }} />
                        </div>
                        <span style={{ fontFamily: 'ui-monospace,Menlo,monospace', fontSize: 11, color: '#9498A4', width: 30, textAlign: 'right' }}>
                          {sets}s
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <button
                onClick={handleSave}
                disabled={workout.length === 0}
                style={{
                  width: '100%', padding: '13px 20px', borderRadius: 12,
                  border: 'none', cursor: workout.length === 0 ? 'not-allowed' : 'pointer',
                  background: saved ? '#E7F8EC' : workout.length === 0 ? 'rgba(15,26,46,0.1)' : '#0F1A2E',
                  color: saved ? '#1F8B3A' : workout.length === 0 ? '#9498A4' : '#FAFAF7',
                  fontFamily: '"Inter",system-ui', fontSize: 14, fontWeight: 700, letterSpacing: -0.2,
                  transition: 'all 0.25s',
                }}
              >
                {saved ? '✓ Sesión guardada · +30 gemas' : `Guardar sesión${workout.length > 0 ? ` (${workout.length} ejercicio${workout.length !== 1 ? 's' : ''})` : ''} · +30 gemas 💎`}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

const setHeaderLabel = {
  fontFamily: 'ui-monospace,Menlo,monospace', fontSize: 10,
  color: '#9498A4', fontWeight: 700, letterSpacing: 0.4, textTransform: 'uppercase',
};

const setInput = {
  width: '100%', padding: '7px 10px', borderRadius: 8,
  border: '1px solid rgba(15,26,46,0.1)',
  background: '#FFFFFF', fontFamily: 'ui-monospace,Menlo,monospace',
  fontSize: 13, color: '#0F1A2E', textAlign: 'center',
  boxSizing: 'border-box',
};

Object.assign(window, { BuilderSection });
