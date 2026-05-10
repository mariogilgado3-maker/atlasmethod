// Builder — smart session builder powered by ExerciseService

const PATTERN_GROUPS = [
  { key: 'all',                label: 'Todos' },
  { key: 'empuje-horizontal',  label: 'Emp. Horiz.' },
  { key: 'empuje-vertical',    label: 'Emp. Vert.' },
  { key: 'traccion-horizontal', label: 'Trac. Horiz.' },
  { key: 'traccion-vertical',  label: 'Trac. Vert.' },
  { key: 'sentadilla',         label: 'Sentadilla' },
  { key: 'bisagra',            label: 'Bisagra' },
  { key: 'core',               label: 'Core' },
];

const EQUIPMENT_OPTS = ['todos', 'barra', 'mancuernas', 'bodyweight', 'polea', 'máquina', 'kettlebell'];
const LEVEL_OPTS = ['todos', 'principiante', 'intermedio', 'avanzado'];

// ── Dot-scale indicator ────────────────────────────────────────────────────────

function DotScale({ value, max = 5, color = '#0F1A2E' }) {
  return (
    <div style={{ display: 'flex', gap: 3, alignItems: 'center' }}>
      {Array.from({ length: max }).map((_, i) => (
        <div key={i} style={{
          width: 6, height: 6, borderRadius: '50%',
          background: i < value ? color : 'rgba(15,26,46,0.12)',
          transition: 'background 0.2s',
        }} />
      ))}
    </div>
  );
}

// ── Exercise card (in selector) ────────────────────────────────────────────────

function ExerciseCard({ exercise, isAdded, onToggle, showReason }) {
  const { META } = ExerciseService;
  const patMeta = META.PATTERN_META[exercise.pattern] || {};
  const eqMeta = META.EQUIPMENT_META[exercise.equipment] || {};

  return (
    <div style={{
      padding: '12px 14px', borderRadius: 12, marginBottom: 6,
      background: isAdded ? '#FAFAF7' : '#FFFFFF',
      border: `1px solid ${isAdded ? 'rgba(15,26,46,0.14)' : 'rgba(15,26,46,0.06)'}`,
      transition: 'border-color 0.15s, background 0.15s',
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Name + compound badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginBottom: 5 }}>
            <span style={{ fontFamily: '"Inter",system-ui', fontSize: 13, fontWeight: 700, color: '#0F1A2E' }}>
              {exercise.name}
            </span>
            {exercise.compound && (
              <span style={{
                fontSize: 9, fontWeight: 700, padding: '1px 6px', borderRadius: 999,
                background: 'rgba(15,26,46,0.06)', color: '#5C6477',
                fontFamily: '"Inter",system-ui', textTransform: 'uppercase', letterSpacing: 0.4,
              }}>
                compuesto
              </span>
            )}
          </div>

          {/* Pattern + equipment badges */}
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 6 }}>
            <span style={{
              fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 999,
              background: patMeta.bg || 'rgba(15,26,46,0.06)', color: patMeta.color || '#5C6477',
              fontFamily: '"Inter",system-ui',
            }}>
              {patMeta.short || exercise.pattern}
            </span>
            <span style={{
              fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 999,
              background: eqMeta.bg || 'rgba(15,26,46,0.06)', color: eqMeta.color || '#5C6477',
              fontFamily: '"Inter",system-ui',
            }}>
              {eqMeta.label || exercise.equipment}
            </span>
          </div>

          {/* Primary muscles */}
          <div style={{ fontFamily: '"Inter",system-ui', fontSize: 10, color: '#9498A4', marginBottom: 6 }}>
            {exercise.muscles.primary.join(' · ')}
            {exercise.muscles.secondary.length > 0 && (
              <span style={{ opacity: 0.6 }}> + {exercise.muscles.secondary.join(', ')}</span>
            )}
          </div>

          {/* Fatigue + Technical */}
          <div style={{ display: 'flex', gap: 14 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <span style={{ fontFamily: 'ui-monospace,Menlo,monospace', fontSize: 9, color: '#9498A4', fontWeight: 700, letterSpacing: 0.4 }}>FATIGA</span>
              <DotScale value={exercise.fatigueLoad} color="#C24545" />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <span style={{ fontFamily: 'ui-monospace,Menlo,monospace', fontSize: 9, color: '#9498A4', fontWeight: 700, letterSpacing: 0.4 }}>TÉCNICA</span>
              <DotScale value={exercise.technicalDifficulty} color="#2A6FDB" />
            </div>
          </div>

          {/* Suggested reason */}
          {showReason && (
            <div style={{
              marginTop: 6, padding: '4px 8px', borderRadius: 6,
              background: 'rgba(31,139,58,0.07)',
              fontFamily: '"Inter",system-ui', fontSize: 10, color: '#1F8B3A', fontWeight: 600,
            }}>
              ↑ {showReason}
            </div>
          )}
        </div>

        <button
          onClick={onToggle}
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
    </div>
  );
}

// ── Balance meter ─────────────────────────────────────────────────────────────

function BalanceMeter({ exercises }) {
  const bal = ExerciseService.computeBalance(exercises);
  if (exercises.length === 0) return null;

  const pairs = [
    { a: 'Empuje', av: bal.push, b: 'Tracción', bv: bal.pull, ideal: '1:1' },
    { a: 'Cuádriceps', av: bal.quad, b: 'Posterior', bv: bal.post, ideal: '1:1' },
  ];

  return (
    <div style={{
      padding: '12px 16px', borderRadius: 14,
      background: 'rgba(15,26,46,0.03)', border: '1px solid rgba(15,26,46,0.06)',
      marginBottom: 12,
    }}>
      <div style={{ fontFamily: 'ui-monospace,Menlo,monospace', fontSize: 9, fontWeight: 700, color: '#9498A4', letterSpacing: 0.6, marginBottom: 10 }}>
        BALANCE MUSCULAR
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {pairs.map(({ a, av, b, bv, ideal }) => {
          const total = av + bv;
          const aRatio = total > 0 ? av / total : 0.5;
          const balanced = Math.abs(av - bv) <= 1;
          return (
            <div key={a}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontFamily: '"Inter",system-ui', fontSize: 10, fontWeight: 600, color: '#3A4257' }}>{a} ({av})</span>
                <span style={{
                  fontFamily: 'ui-monospace,Menlo,monospace', fontSize: 9, fontWeight: 700,
                  color: balanced ? '#1F8B3A' : '#D97706',
                }}>
                  {balanced ? '✓' : '!'} ideal {ideal}
                </span>
                <span style={{ fontFamily: '"Inter",system-ui', fontSize: 10, fontWeight: 600, color: '#3A4257' }}>{b} ({bv})</span>
              </div>
              <div style={{ height: 6, borderRadius: 999, background: 'rgba(15,26,46,0.08)', overflow: 'hidden' }}>
                <div style={{
                  height: '100%', borderRadius: 999,
                  width: `${aRatio * 100}%`,
                  background: balanced ? '#1F8B3A' : '#D97706',
                  transition: 'width 0.3s ease',
                }} />
              </div>
            </div>
          );
        })}
        {bal.core === 0 && exercises.length >= 3 && (
          <div style={{ fontFamily: '"Inter",system-ui', fontSize: 10, color: '#D97706', fontWeight: 600 }}>
            ⚠ Considera añadir un ejercicio de core
          </div>
        )}
      </div>
    </div>
  );
}

// ── Volume bar chart ──────────────────────────────────────────────────────────

function VolumeChart({ exercises }) {
  const vol = {};
  exercises.forEach(ex => {
    const totalSets = ex.sets.length;
    (ex.muscles.primary || []).forEach(m => { vol[m] = (vol[m] || 0) + totalSets; });
  });
  if (Object.keys(vol).length === 0) return null;
  const maxVol = Math.max(...Object.values(vol), 1);

  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ fontFamily: 'ui-monospace,Menlo,monospace', fontSize: 9, fontWeight: 700, color: '#9498A4', letterSpacing: 0.6, marginBottom: 8 }}>
        VOLUMEN SEMANAL ESTIMADO
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
        {Object.entries(vol).map(([muscle, sets]) => (
          <div key={muscle} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontFamily: '"Inter",system-ui', fontSize: 10, fontWeight: 600, color: '#3A4257', width: 110, flexShrink: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {muscle}
            </span>
            <div style={{ flex: 1, height: 5, borderRadius: 999, background: 'rgba(15,26,46,0.06)' }}>
              <div style={{
                height: '100%', borderRadius: 999, background: '#0F1A2E',
                width: `${(sets / maxVol) * 100}%`, transition: 'width 0.3s ease',
              }} />
            </div>
            <span style={{ fontFamily: 'ui-monospace,Menlo,monospace', fontSize: 10, color: '#9498A4', width: 24, textAlign: 'right' }}>
              {sets}s
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Set input row ─────────────────────────────────────────────────────────────

function WorkoutExercise({ exercise, onRemove, onAddSet, onRemoveSet, onUpdateSet }) {
  const [collapsed, setCollapsed] = React.useState(false);
  const { META } = ExerciseService;
  const patMeta = META.PATTERN_META[exercise.pattern] || {};

  return (
    <div style={{
      marginBottom: 14, borderRadius: 16,
      border: '1px solid rgba(15,26,46,0.08)',
      background: '#FAFAF7', overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '12px 16px',
        borderBottom: collapsed ? 'none' : '1px solid rgba(15,26,46,0.06)',
        background: '#FFFFFF',
      }}>
        <button
          onClick={() => setCollapsed(c => !c)}
          style={{
            width: 22, height: 22, borderRadius: 999, border: 'none',
            background: 'rgba(15,26,46,0.06)', cursor: 'pointer',
            fontFamily: '"Inter",system-ui', fontSize: 11, color: '#5C6477',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transform: collapsed ? 'rotate(-90deg)' : 'none', transition: 'transform 0.2s',
          }}
        >
          ↓
        </button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            <span style={{ fontFamily: '"Inter",system-ui', fontSize: 13, fontWeight: 700, color: '#0F1A2E' }}>
              {exercise.name}
            </span>
            <span style={{
              fontSize: 9, fontWeight: 700, padding: '1px 6px', borderRadius: 999,
              background: patMeta.bg || 'rgba(15,26,46,0.06)', color: patMeta.color || '#5C6477',
              fontFamily: '"Inter",system-ui',
            }}>
              {patMeta.short || exercise.pattern}
            </span>
          </div>
          <div style={{ fontFamily: '"Inter",system-ui', fontSize: 10, color: '#9498A4', marginTop: 1 }}>
            {exercise.muscles.primary.join(' · ')}
          </div>
        </div>
        <span style={{ fontFamily: 'ui-monospace,Menlo,monospace', fontSize: 11, color: '#9498A4', flexShrink: 0 }}>
          {exercise.sets.length} {exercise.sets.length === 1 ? 'serie' : 'series'}
        </span>
        <button onClick={onRemove} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#C24545', fontFamily: '"Inter",system-ui', fontSize: 13, fontWeight: 700, padding: '2px 6px' }}>
          ✕
        </button>
      </div>

      {!collapsed && (
        <div style={{ padding: '12px 16px' }}>
          {/* Column headers */}
          <div style={{ display: 'grid', gridTemplateColumns: '28px 1fr 1fr 1fr 22px', gap: 8, marginBottom: 6, paddingBottom: 6, borderBottom: '1px solid rgba(15,26,46,0.06)' }}>
            <span style={headerLabel}>#</span>
            <span style={headerLabel}>kg</span>
            <span style={headerLabel}>Reps</span>
            <span style={headerLabel}>RPE</span>
            <span />
          </div>

          {exercise.sets.map((set, idx) => (
            <div key={idx} style={{ display: 'grid', gridTemplateColumns: '28px 1fr 1fr 1fr 22px', gap: 8, alignItems: 'center', marginBottom: 6 }}>
              <span style={{ fontFamily: 'ui-monospace,Menlo,monospace', fontSize: 11, color: '#9498A4', textAlign: 'center', fontWeight: 700 }}>
                {idx + 1}
              </span>
              {['kg', 'reps', 'rpe'].map(field => (
                <input
                  key={field}
                  type="number"
                  value={set[field]}
                  onChange={e => onUpdateSet(idx, field, e.target.value)}
                  placeholder="—"
                  min={field === 'rpe' ? 1 : 0}
                  max={field === 'rpe' ? 10 : undefined}
                  step={field === 'rpe' ? 0.5 : undefined}
                  style={inputStyle}
                />
              ))}
              <button
                onClick={() => onRemoveSet(idx)}
                style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#9498A4', fontSize: 13, padding: 2, display: exercise.sets.length === 1 ? 'none' : 'block' }}
              >
                ✕
              </button>
            </div>
          ))}

          <button
            onClick={onAddSet}
            style={{
              marginTop: 4, padding: '5px 12px', borderRadius: 8,
              border: '1px dashed rgba(15,26,46,0.2)', background: 'transparent', cursor: 'pointer',
              fontFamily: '"Inter",system-ui', fontSize: 11, fontWeight: 600, color: '#5C6477',
            }}
          >
            + Añadir serie
          </button>

          {/* Technical cue */}
          {exercise.cues && exercise.cues.length > 0 && (
            <div style={{
              marginTop: 10, padding: '8px 10px', borderRadius: 8,
              background: 'rgba(42,111,219,0.05)', border: '1px solid rgba(42,111,219,0.1)',
            }}>
              <div style={{ fontFamily: 'ui-monospace,Menlo,monospace', fontSize: 9, fontWeight: 700, color: '#2A6FDB', letterSpacing: 0.4, marginBottom: 4 }}>
                CLAVE TÉCNICA
              </div>
              <div style={{ fontFamily: '"Inter",system-ui', fontSize: 11, color: '#1a4fa0', lineHeight: 1.5 }}>
                {exercise.cues[0]}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Main section ──────────────────────────────────────────────────────────────

function BuilderSection() {
  const { actions } = useStore();
  const [activePattern, setActivePattern] = React.useState('all');
  const [equipFilter, setEquipFilter] = React.useState('todos');
  const [levelFilter, setLevelFilter] = React.useState('todos');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [activeTab, setActiveTab] = React.useState('browse'); // 'browse' | 'sugeridos'
  const [workout, setWorkout] = React.useState([]);
  const [saved, setSaved] = React.useState(false);
  const [gemFlash, setGemFlash] = React.useState(false);

  // Filtered exercise list for browse tab
  const filteredExercises = React.useMemo(() => {
    const filters = {};
    if (activePattern !== 'all') {
      if (activePattern === 'core') {
        return ExerciseService.getAll({ query: searchQuery || undefined }).filter(e => e.pattern.startsWith('core'));
      }
      filters.pattern = activePattern;
    }
    if (equipFilter !== 'todos') filters.equipment = equipFilter;
    if (levelFilter !== 'todos') filters.level = levelFilter;
    if (searchQuery) filters.query = searchQuery;
    return ExerciseService.getAll(filters);
  }, [activePattern, equipFilter, levelFilter, searchQuery]);

  // Suggested exercises based on current workout
  const suggestedExercises = React.useMemo(() => {
    return ExerciseService.suggestForWorkout(workout, 'hipertrofia', 'intermedio', 6);
  }, [workout]);

  const currentExIds = new Set(workout.map(e => e.id));

  const addExercise = (exercise) => {
    if (currentExIds.has(exercise.id)) return;
    setWorkout(prev => [...prev, { ...exercise, sets: [{ kg: '', reps: '', rpe: '' }] }]);
  };

  const removeExercise = (id) => setWorkout(prev => prev.filter(e => e.id !== id));

  const addSet = (id) => setWorkout(prev => prev.map(e =>
    e.id === id ? { ...e, sets: [...e.sets, { kg: '', reps: '', rpe: '' }] } : e
  ));

  const removeSet = (id, idx) => setWorkout(prev => prev.map(e =>
    e.id === id ? { ...e, sets: e.sets.filter((_, i) => i !== idx) } : e
  ));

  const updateSet = (id, idx, field, value) => setWorkout(prev => prev.map(e =>
    e.id === id ? { ...e, sets: e.sets.map((s, i) => i === idx ? { ...s, [field]: value } : s) } : e
  ));

  const handleSave = () => {
    if (workout.length === 0) return;
    actions.logSession(workout.map(ex => ({
      name: ex.name,
      muscles: ex.muscles.primary,
      sets: ex.sets,
    })));
    setSaved(true);
    setGemFlash(true);
    setTimeout(() => setGemFlash(false), 2500);
    setTimeout(() => { setSaved(false); setWorkout([]); }, 3000);
  };

  const filterPill = (active) => ({
    padding: '5px 11px', borderRadius: 999, cursor: 'pointer', border: 'none',
    background: active ? '#0F1A2E' : 'rgba(15,26,46,0.06)',
    color: active ? '#FAFAF7' : '#5C6477',
    fontFamily: '"Inter",system-ui', fontSize: 11, fontWeight: 600,
    transition: 'all 0.15s', whiteSpace: 'nowrap',
  });

  return (
    <section style={{ padding: '120px 32px', minHeight: '80vh', background: '#FAFAF7' }}>
      <div style={{ maxWidth: 1180, margin: '0 auto' }}>

        {gemFlash && (
          <div style={{
            position: 'fixed', top: 80, right: 32, zIndex: 200,
            background: '#0F1A2E', color: '#FAFAF7',
            padding: '10px 20px', borderRadius: 999,
            fontFamily: '"Inter",system-ui', fontSize: 14, fontWeight: 700,
            animation: 'fadeIn 0.3s ease', boxShadow: '0 8px 32px rgba(15,26,46,0.25)',
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
            Construye tu sesión. <span style={{ fontFamily: '"Instrument Serif",serif', fontStyle: 'italic', fontWeight: 400 }}>Cada serie, con intención.</span>
          </h1>
          <p style={{ fontFamily: '"Inter",system-ui', fontSize: 15, color: '#5C6477', margin: 0, maxWidth: 520 }}>
            Selección inteligente basada en patrones de movimiento, fatiga y balance muscular.
          </p>
        </div>

        {/* Main layout */}
        <div style={{
          background: '#FFFFFF', borderRadius: 28,
          border: '1px solid rgba(15,26,46,0.08)',
          boxShadow: '0 20px 60px -30px rgba(15,26,46,0.15)',
          overflow: 'hidden',
          display: 'grid', gridTemplateColumns: '360px 1fr',
          minHeight: 640,
        }}>

          {/* ── LEFT: exercise selector ─────────────────────────────────── */}
          <div style={{ borderRight: '1px solid rgba(15,26,46,0.06)', display: 'flex', flexDirection: 'column', minHeight: 0 }}>

            {/* Browse / Sugeridos tabs */}
            <div style={{ display: 'flex', borderBottom: '1px solid rgba(15,26,46,0.06)', flexShrink: 0 }}>
              {[['browse', 'Explorar'], ['sugeridos', `Sugeridos${workout.length > 0 ? ` (${suggestedExercises.length})` : ''}`]].map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  style={{
                    flex: 1, padding: '12px 8px', border: 'none', cursor: 'pointer',
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

            {activeTab === 'browse' ? (
              <>
                {/* Search */}
                <div style={{ padding: '10px 12px 6px', flexShrink: 0 }}>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Buscar ejercicio o músculo..."
                    style={{
                      width: '100%', padding: '8px 12px', borderRadius: 10, boxSizing: 'border-box',
                      border: '1px solid rgba(15,26,46,0.1)', background: '#FAFAF7',
                      fontFamily: '"Inter",system-ui', fontSize: 12, color: '#0F1A2E',
                    }}
                  />
                </div>

                {/* Pattern tabs */}
                <div style={{ padding: '0 12px 6px', flexShrink: 0 }}>
                  <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                    {PATTERN_GROUPS.map(g => (
                      <button key={g.key} onClick={() => setActivePattern(g.key)} style={filterPill(activePattern === g.key)}>
                        {g.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Equipment + Level filters */}
                <div style={{ padding: '0 12px 8px', flexShrink: 0, display: 'flex', gap: 6, flexWrap: 'wrap', borderBottom: '1px solid rgba(15,26,46,0.06)' }}>
                  <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                    {['todos', 'barra', 'mancuernas', 'bodyweight', 'polea', 'máquina'].map(eq => (
                      <button key={eq} onClick={() => setEquipFilter(eq)} style={{ ...filterPill(equipFilter === eq), fontSize: 10, padding: '3px 8px' }}>
                        {eq === 'todos' ? 'Todo equipo' : ExerciseService.META.EQUIPMENT_META[eq]?.label || eq}
                      </button>
                    ))}
                  </div>
                  <div style={{ display: 'flex', gap: 3 }}>
                    {LEVEL_OPTS.map(l => (
                      <button key={l} onClick={() => setLevelFilter(l)} style={{ ...filterPill(levelFilter === l), fontSize: 10, padding: '3px 8px' }}>
                        {l === 'todos' ? 'Todos niveles' : l.charAt(0).toUpperCase() + l.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Exercise list */}
                <div style={{ flex: 1, overflowY: 'auto', padding: 12 }}>
                  {filteredExercises.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '32px 0', color: '#9498A4', fontFamily: '"Inter",system-ui', fontSize: 13 }}>
                      Sin resultados para estos filtros
                    </div>
                  )}
                  {filteredExercises.map(exercise => (
                    <ExerciseCard
                      key={exercise.id}
                      exercise={exercise}
                      isAdded={currentExIds.has(exercise.id)}
                      onToggle={() => currentExIds.has(exercise.id) ? removeExercise(exercise.id) : addExercise(exercise)}
                    />
                  ))}
                </div>
              </>
            ) : (
              /* Sugeridos tab */
              <div style={{ flex: 1, overflowY: 'auto', padding: 12 }}>
                {workout.length === 0 ? (
                  <div style={{ padding: '32px 16px', textAlign: 'center' }}>
                    <div style={{ fontFamily: '"Instrument Serif",serif', fontStyle: 'italic', fontSize: 18, color: '#9498A4', marginBottom: 8 }}>
                      Añade ejercicios para ver sugerencias
                    </div>
                    <p style={{ fontFamily: '"Inter",system-ui', fontSize: 12, color: '#9498A4', margin: 0, lineHeight: 1.5 }}>
                      El sistema analiza el balance muscular de tu sesión y sugiere lo que falta.
                    </p>
                  </div>
                ) : (
                  <>
                    <div style={{ marginBottom: 12, padding: '10px 14px', borderRadius: 10, background: 'rgba(31,139,58,0.05)', border: '1px solid rgba(31,139,58,0.12)' }}>
                      <div style={{ fontFamily: 'ui-monospace,Menlo,monospace', fontSize: 9, fontWeight: 700, color: '#1F8B3A', letterSpacing: 0.6, marginBottom: 4 }}>
                        ANÁLISIS DE SESIÓN
                      </div>
                      <div style={{ fontFamily: '"Inter",system-ui', fontSize: 11, color: '#1F8B3A', lineHeight: 1.5 }}>
                        {(() => {
                          const bal = ExerciseService.computeBalance(workout);
                          const msgs = [];
                          if (bal.push > bal.pull + 1) msgs.push('Falta tracción para equilibrar el empuje');
                          else if (bal.pull > bal.push + 1) msgs.push('Falta empuje para equilibrar la tracción');
                          if (bal.quad > bal.post + 1) msgs.push('Añade trabajo de cadena posterior');
                          else if (bal.post > bal.quad + 1) msgs.push('Añade trabajo de cuádriceps');
                          if (bal.core === 0 && workout.length >= 3) msgs.push('Incorpora un ejercicio de core');
                          return msgs.length > 0 ? msgs.join(' · ') : '✓ Sesión bien equilibrada';
                        })()}
                      </div>
                    </div>
                    {suggestedExercises.map(exercise => (
                      <ExerciseCard
                        key={exercise.id}
                        exercise={exercise}
                        isAdded={currentExIds.has(exercise.id)}
                        onToggle={() => currentExIds.has(exercise.id) ? removeExercise(exercise.id) : addExercise(exercise)}
                        showReason={ExerciseService.getSelectionReason(exercise, 'hipertrofia', 'intermedio')}
                      />
                    ))}
                  </>
                )}
              </div>
            )}
          </div>

          {/* ── RIGHT: workout builder ──────────────────────────────────── */}
          <div style={{ display: 'flex', flexDirection: 'column', minHeight: 0 }}>
            <div style={{ flex: 1, padding: '20px 24px', overflowY: 'auto' }}>

              {workout.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '80px 0', color: '#9498A4' }}>
                  <div style={{ fontSize: 28, marginBottom: 12, opacity: 0.4 }}>╋</div>
                  <p style={{ fontFamily: '"Inter",system-ui', fontSize: 14, fontWeight: 500, marginBottom: 6 }}>
                    Añade ejercicios desde el panel izquierdo
                  </p>
                  <p style={{ fontFamily: '"Inter",system-ui', fontSize: 12, margin: 0, opacity: 0.7 }}>
                    Explora por patrón de movimiento o usa Sugeridos para una selección inteligente
                  </p>
                </div>
              ) : (
                <>
                  <BalanceMeter exercises={workout} />
                  {workout.map(exercise => (
                    <WorkoutExercise
                      key={exercise.id}
                      exercise={exercise}
                      onRemove={() => removeExercise(exercise.id)}
                      onAddSet={() => addSet(exercise.id)}
                      onRemoveSet={(idx) => removeSet(exercise.id, idx)}
                      onUpdateSet={(idx, field, val) => updateSet(exercise.id, idx, field, val)}
                    />
                  ))}
                </>
              )}
            </div>

            {/* Footer: volume + save */}
            <div style={{ borderTop: '1px solid rgba(15,26,46,0.06)', padding: '16px 24px', background: '#FAFAF7', flexShrink: 0 }}>
              <VolumeChart exercises={workout} />
              <button
                onClick={handleSave}
                disabled={workout.length === 0}
                style={{
                  width: '100%', padding: '13px 20px', borderRadius: 12, border: 'none',
                  cursor: workout.length === 0 ? 'not-allowed' : 'pointer',
                  background: saved ? '#E7F8EC' : workout.length === 0 ? 'rgba(15,26,46,0.07)' : '#0F1A2E',
                  color: saved ? '#1F8B3A' : workout.length === 0 ? '#9498A4' : '#FAFAF7',
                  fontFamily: '"Inter",system-ui', fontSize: 14, fontWeight: 700, letterSpacing: -0.2,
                  transition: 'all 0.25s',
                }}
              >
                {saved
                  ? '✓ Sesión guardada · +30 gemas'
                  : `Guardar sesión${workout.length > 0 ? ` (${workout.length} ejercicio${workout.length !== 1 ? 's' : ''})` : ''} · +30 gemas 💎`
                }
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

const headerLabel = {
  fontFamily: 'ui-monospace,Menlo,monospace', fontSize: 10,
  color: '#9498A4', fontWeight: 700, letterSpacing: 0.4, textTransform: 'uppercase',
};

const inputStyle = {
  width: '100%', padding: '7px 8px', borderRadius: 8,
  border: '1px solid rgba(15,26,46,0.1)', background: '#FFFFFF',
  fontFamily: 'ui-monospace,Menlo,monospace', fontSize: 13, color: '#0F1A2E',
  textAlign: 'center', boxSizing: 'border-box',
};

Object.assign(window, { BuilderSection });
