// Builder — smart session builder with visual exercise cards

// ── Muscle group definitions ──────────────────────────────────────────────────

const MUSCLE_GROUPS = [
  { id: 'pecho',   label: 'Pecho',    icon: 'P' },
  { id: 'espalda', label: 'Espalda',  icon: 'E' },
  { id: 'pierna',  label: 'Pierna',   icon: 'L' },
  { id: 'hombro',  label: 'Hombro',   icon: 'H' },
  { id: 'biceps',  label: 'Bíceps',   icon: 'B' },
  { id: 'triceps', label: 'Tríceps',  icon: 'T' },
  { id: 'core',    label: 'Core',     icon: 'C' },
];

// Gradient per muscle group — used for thumbnails and color strips
const GROUP_STYLE = {
  pecho:   { from: '#1e3a5f', to: '#2A6FDB' },
  espalda: { from: '#1a1230', to: '#7C3AED' },
  pierna:  { from: '#102210', to: '#1F8B3A' },
  hombro:  { from: '#2e1212', to: '#C24545' },
  biceps:  { from: '#0d2233', to: '#0EA5C8' },
  triceps: { from: '#2e2010', to: '#D97706' },
  core:    { from: '#1a1a1a', to: '#5C6477' },
};

// Derive primary muscle group from exercise pattern + primary muscle
function getExerciseGroup(ex) {
  const p = ex.pattern;
  if (p === 'empuje-horizontal') return 'pecho';
  if (p === 'empuje-vertical') {
    const pm = ex.muscles.primary[0] || '';
    return pm.includes('Tríceps') ? 'triceps' : 'hombro';
  }
  if (p === 'traccion-horizontal') {
    const pm = ex.muscles.primary[0] || '';
    return pm.includes('Deltoides') ? 'hombro' : 'espalda';
  }
  if (p === 'traccion-vertical') {
    const pm = ex.muscles.primary[0] || '';
    return (pm.includes('Bíceps') || pm.includes('Braquial')) ? 'biceps' : 'espalda';
  }
  if (p === 'sentadilla' || p === 'bisagra' || p === 'aislamiento-pantorrilla') return 'pierna';
  if (p.startsWith('core')) return 'core';
  return 'otros';
}

function estimateDuration(workout) {
  const totalSets = workout.reduce((s, ex) => s + ex.sets.length, 0);
  return Math.round((workout.length > 0 ? 5 : 0) + totalSets * 2.5);
}

// ── Exercise thumbnail (gradient placeholder + future media support) ───────────

function ExerciseThumbnail({ exercise, group, isAdded }) {
  const gs = GROUP_STYLE[group] || GROUP_STYLE.core;

  // Future: if exercise.mediaUrl exists, render <img> or <video> instead
  return (
    <div style={{
      height: 78,
      background: `linear-gradient(140deg, ${gs.from} 0%, ${gs.to} 100%)`,
      position: 'relative', overflow: 'hidden', flexShrink: 0,
    }}>
      {/* Subtle grid texture */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: [
          'repeating-linear-gradient(0deg, transparent, transparent 13px, rgba(255,255,255,0.03) 13px, rgba(255,255,255,0.03) 14px)',
          'repeating-linear-gradient(90deg, transparent, transparent 13px, rgba(255,255,255,0.03) 13px, rgba(255,255,255,0.03) 14px)',
        ].join(','),
      }} />

      {/* Large italic letter */}
      <div style={{
        position: 'absolute', bottom: 4, left: 10,
        fontFamily: '"Instrument Serif",serif', fontStyle: 'italic',
        fontSize: 34, fontWeight: 400, color: 'rgba(255,255,255,0.22)',
        lineHeight: 1, userSelect: 'none',
      }}>
        {exercise.name.charAt(0)}
      </div>

      {/* Compound indicator top-left */}
      {exercise.compound && (
        <div style={{
          position: 'absolute', top: 7, left: 8,
          fontFamily: 'ui-monospace,Menlo,monospace', fontSize: 8, fontWeight: 700,
          color: 'rgba(255,255,255,0.5)', letterSpacing: 0.5,
        }}>CPT</div>
      )}

      {/* Added overlay */}
      {isAdded && (
        <div style={{
          position: 'absolute', inset: 0,
          background: 'rgba(31,139,58,0.45)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <span style={{ fontSize: 22, color: '#FFFFFF' }}>✓</span>
        </div>
      )}
    </div>
  );
}

// ── Visual exercise grid card ─────────────────────────────────────────────────

function ExerciseGridCard({ exercise, isAdded, onToggle }) {
  const { META } = ExerciseService;
  const group = getExerciseGroup(exercise);
  const eqMeta = META.EQUIPMENT_META[exercise.equipment] || {};

  return (
    <div
      onClick={onToggle}
      style={{
        borderRadius: 14, overflow: 'hidden', cursor: 'pointer',
        border: `1.5px solid ${isAdded ? 'rgba(31,139,58,0.28)' : 'rgba(15,26,46,0.07)'}`,
        background: isAdded ? 'rgba(31,139,58,0.02)' : '#FFFFFF',
        transition: 'border-color 0.15s, box-shadow 0.15s',
        position: 'relative',
      }}
    >
      <ExerciseThumbnail exercise={exercise} group={group} isAdded={isAdded} />

      {/* Quick add/remove button */}
      <div style={{
        position: 'absolute', top: 7, right: 7,
        width: 24, height: 24, borderRadius: 999,
        background: isAdded ? 'rgba(194,69,69,0.82)' : 'rgba(15,26,46,0.68)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        backdropFilter: 'blur(4px)',
        fontFamily: '"Inter",system-ui', fontSize: 14, fontWeight: 700, color: '#FFFFFF',
      }}>
        {isAdded ? '−' : '+'}
      </div>

      {/* Info block */}
      <div style={{ padding: '9px 11px 11px' }}>
        <div style={{
          fontFamily: '"Inter",system-ui', fontSize: 12, fontWeight: 700,
          color: '#0F1A2E', lineHeight: 1.25, marginBottom: 3,
        }}>
          {exercise.name}
        </div>

        <div style={{
          fontFamily: '"Inter",system-ui', fontSize: 10, color: '#9498A4',
          marginBottom: 7, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {exercise.muscles.primary.join(' · ')}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{
            fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 999,
            background: eqMeta.bg || 'rgba(15,26,46,0.06)',
            color: eqMeta.color || '#5C6477',
            fontFamily: '"Inter",system-ui',
          }}>
            {eqMeta.label || exercise.equipment}
          </span>
          {/* Fatigue dots */}
          <div style={{ display: 'flex', gap: 2 }}>
            {[1,2,3,4,5].map(i => (
              <div key={i} style={{
                width: 5, height: 5, borderRadius: '50%',
                background: i <= exercise.fatigueLoad ? '#C24545' : 'rgba(15,26,46,0.1)',
              }} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Session stats header ──────────────────────────────────────────────────────

function SessionStats({ workout }) {
  const totalSets = workout.reduce((s, ex) => s + ex.sets.length, 0);
  const duration = estimateDuration(workout);
  const bal = workout.length > 0 ? ExerciseService.computeBalance(workout) : null;
  const balanced = bal
    ? Math.abs(bal.push - bal.pull) <= 1 && Math.abs(bal.quad - bal.post) <= 1
    : true;

  if (workout.length === 0) {
    return (
      <div style={{ padding: '14px 22px', borderBottom: '1px solid rgba(15,26,46,0.06)', background: '#FAFAF7', flexShrink: 0 }}>
        <div style={{ fontFamily: '"Inter",system-ui', fontSize: 12, color: '#9498A4', fontWeight: 500 }}>
          Añade ejercicios para comenzar tu sesión
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '12px 22px', borderBottom: '1px solid rgba(15,26,46,0.06)', background: '#FAFAF7', flexShrink: 0 }}>
      <div style={{ display: 'flex', gap: 22, alignItems: 'center' }}>
        {[
          { label: 'EJERCICIOS', value: workout.length },
          { label: 'SERIES',     value: totalSets },
          { label: 'EST.',       value: `~${duration}min` },
        ].map(({ label, value }) => (
          <div key={label}>
            <div style={{ fontFamily: 'ui-monospace,Menlo,monospace', fontSize: 8, color: '#9498A4', fontWeight: 700, letterSpacing: 0.7 }}>{label}</div>
            <div style={{ fontFamily: '"Inter",system-ui', fontSize: 20, fontWeight: 800, color: '#0F1A2E', lineHeight: 1.1 }}>{value}</div>
          </div>
        ))}
        <div style={{ marginLeft: 'auto' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 5,
            padding: '5px 10px', borderRadius: 999,
            background: balanced ? 'rgba(31,139,58,0.07)' : 'rgba(217,119,6,0.07)',
            border: `1px solid ${balanced ? 'rgba(31,139,58,0.18)' : 'rgba(217,119,6,0.18)'}`,
          }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: balanced ? '#1F8B3A' : '#D97706' }} />
            <span style={{ fontFamily: '"Inter",system-ui', fontSize: 10, fontWeight: 700, color: balanced ? '#1F8B3A' : '#D97706' }}>
              {balanced ? 'Balance correcto' : 'Revisa balance'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Balance meter ─────────────────────────────────────────────────────────────

function BalanceMeter({ exercises }) {
  if (exercises.length === 0) return null;
  const bal = ExerciseService.computeBalance(exercises);

  const pairs = [
    { a: 'Empuje', av: bal.push, b: 'Tracción', bv: bal.pull },
    { a: 'Cuádriceps', av: bal.quad, b: 'Posterior', bv: bal.post },
  ];

  return (
    <div style={{ padding: '10px 14px', borderRadius: 12, background: 'rgba(15,26,46,0.02)', border: '1px solid rgba(15,26,46,0.05)', marginBottom: 12 }}>
      <div style={{ fontFamily: 'ui-monospace,Menlo,monospace', fontSize: 8, fontWeight: 700, color: '#9498A4', letterSpacing: 0.7, marginBottom: 8 }}>BALANCE MUSCULAR</div>
      {pairs.map(({ a, av, b, bv }) => {
        const total = av + bv;
        const aRatio = total > 0 ? av / total : 0.5;
        const ok = Math.abs(av - bv) <= 1;
        return (
          <div key={a} style={{ marginBottom: 7 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
              <span style={{ fontFamily: '"Inter",system-ui', fontSize: 9, fontWeight: 600, color: '#3A4257' }}>{a} ({av})</span>
              <span style={{ fontFamily: '"Inter",system-ui', fontSize: 9, fontWeight: 600, color: '#3A4257' }}>{b} ({bv})</span>
            </div>
            <div style={{ height: 4, borderRadius: 999, background: 'rgba(15,26,46,0.08)', overflow: 'hidden' }}>
              <div style={{ height: '100%', borderRadius: 999, background: ok ? '#1F8B3A' : '#D97706', width: `${aRatio * 100}%`, transition: 'width 0.35s ease' }} />
            </div>
          </div>
        );
      })}
      {bal.core === 0 && exercises.length >= 3 && (
        <div style={{ fontFamily: '"Inter",system-ui', fontSize: 10, color: '#D97706', fontWeight: 600, marginTop: 4 }}>⚠ Considera añadir core</div>
      )}
    </div>
  );
}

// ── Volume chart ──────────────────────────────────────────────────────────────

function VolumeChart({ exercises }) {
  const vol = {};
  exercises.forEach(ex => {
    ex.sets.forEach(() => {
      ex.muscles.primary.forEach(m => { vol[m] = (vol[m] || 0) + 1; });
    });
  });
  if (Object.keys(vol).length === 0) return null;
  const maxVol = Math.max(...Object.values(vol), 1);

  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ fontFamily: 'ui-monospace,Menlo,monospace', fontSize: 8, fontWeight: 700, color: '#9498A4', letterSpacing: 0.7, marginBottom: 7 }}>VOLUMEN / MÚSCULO</div>
      {Object.entries(vol).map(([muscle, sets]) => (
        <div key={muscle} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <span style={{ fontFamily: '"Inter",system-ui', fontSize: 10, fontWeight: 600, color: '#3A4257', width: 95, flexShrink: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {muscle}
          </span>
          <div style={{ flex: 1, height: 4, borderRadius: 999, background: 'rgba(15,26,46,0.07)' }}>
            <div style={{ height: '100%', borderRadius: 999, background: '#0F1A2E', width: `${(sets / maxVol) * 100}%`, transition: 'width 0.3s' }} />
          </div>
          <span style={{ fontFamily: 'ui-monospace,Menlo,monospace', fontSize: 9, color: '#9498A4', width: 20, textAlign: 'right' }}>{sets}s</span>
        </div>
      ))}
    </div>
  );
}

// ── Workout exercise (sets input) ─────────────────────────────────────────────

function WorkoutExercise({ exercise, onRemove, onAddSet, onRemoveSet, onUpdateSet }) {
  const [collapsed, setCollapsed] = React.useState(false);
  const group = getExerciseGroup(exercise);
  const gs = GROUP_STYLE[group] || GROUP_STYLE.core;

  return (
    <div style={{
      marginBottom: 10, borderRadius: 14,
      border: '1px solid rgba(15,26,46,0.07)',
      background: '#FAFAF7', overflow: 'hidden',
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px',
        borderBottom: collapsed ? 'none' : '1px solid rgba(15,26,46,0.06)',
        background: '#FFFFFF',
      }}>
        {/* Group color strip */}
        <div style={{ width: 3, height: 32, borderRadius: 999, background: `linear-gradient(to bottom, ${gs.from}, ${gs.to})`, flexShrink: 0 }} />

        <button onClick={() => setCollapsed(c => !c)} style={{
          width: 20, height: 20, borderRadius: 999, border: 'none',
          background: 'rgba(15,26,46,0.06)', cursor: 'pointer', fontSize: 10, color: '#5C6477',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transform: collapsed ? 'rotate(-90deg)' : 'none', transition: 'transform 0.2s',
        }}>↓</button>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: '"Inter",system-ui', fontSize: 12, fontWeight: 700, color: '#0F1A2E', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {exercise.name}
          </div>
          <div style={{ fontFamily: '"Inter",system-ui', fontSize: 10, color: '#9498A4' }}>
            {exercise.muscles.primary.join(' · ')}
          </div>
        </div>

        <span style={{ fontFamily: 'ui-monospace,Menlo,monospace', fontSize: 10, color: '#9498A4', flexShrink: 0 }}>
          {exercise.sets.length} serie{exercise.sets.length !== 1 ? 's' : ''}
        </span>
        <button onClick={onRemove} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#C24545', fontSize: 12, fontWeight: 700, padding: '2px 4px' }}>✕</button>
      </div>

      {!collapsed && (
        <div style={{ padding: '10px 14px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '24px 1fr 1fr 1fr 20px', gap: 6, marginBottom: 6, paddingBottom: 5, borderBottom: '1px solid rgba(15,26,46,0.05)' }}>
            {['#', 'kg', 'Reps', 'RPE', ''].map((h, i) => (
              <span key={i} style={{ fontFamily: 'ui-monospace,Menlo,monospace', fontSize: 9, color: '#9498A4', fontWeight: 700, letterSpacing: 0.4, textAlign: 'center' }}>{h}</span>
            ))}
          </div>

          {exercise.sets.map((set, idx) => (
            <div key={idx} style={{ display: 'grid', gridTemplateColumns: '24px 1fr 1fr 1fr 20px', gap: 6, alignItems: 'center', marginBottom: 5 }}>
              <span style={{ fontFamily: 'ui-monospace,Menlo,monospace', fontSize: 10, color: '#9498A4', textAlign: 'center', fontWeight: 700 }}>{idx + 1}</span>
              {['kg', 'reps', 'rpe'].map(field => (
                <input key={field} type="number" value={set[field]} placeholder="—"
                  onChange={e => onUpdateSet(idx, field, e.target.value)}
                  min={field === 'rpe' ? 1 : 0} max={field === 'rpe' ? 10 : undefined} step={field === 'rpe' ? 0.5 : undefined}
                  style={{
                    width: '100%', padding: '6px 4px', borderRadius: 7,
                    border: '1px solid rgba(15,26,46,0.1)', background: '#FFFFFF',
                    fontFamily: 'ui-monospace,Menlo,monospace', fontSize: 12, color: '#0F1A2E',
                    textAlign: 'center', boxSizing: 'border-box',
                  }}
                />
              ))}
              <button onClick={() => onRemoveSet(idx)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#9498A4', fontSize: 12, display: exercise.sets.length === 1 ? 'none' : 'block', padding: 0 }}>✕</button>
            </div>
          ))}

          <button onClick={onAddSet} style={{
            marginTop: 4, padding: '4px 10px', borderRadius: 6,
            border: '1px dashed rgba(15,26,46,0.16)', background: 'transparent', cursor: 'pointer',
            fontFamily: '"Inter",system-ui', fontSize: 10, fontWeight: 600, color: '#5C6477',
          }}>+ Serie</button>

          {exercise.cues && exercise.cues.length > 0 && (
            <div style={{
              marginTop: 8, padding: '6px 10px', borderRadius: 8,
              background: 'rgba(42,111,219,0.04)', border: '1px solid rgba(42,111,219,0.1)',
              fontFamily: '"Inter",system-ui', fontSize: 10, color: '#1a4fa0', lineHeight: 1.45,
            }}>
              <strong>↗ </strong>{exercise.cues[0]}
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
  const [activeGroup, setActiveGroup] = React.useState('pecho');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [showSugeridos, setShowSugeridos] = React.useState(false);
  const [workout, setWorkout] = React.useState([]);
  const [saved, setSaved] = React.useState(false);
  const [gemFlash, setGemFlash] = React.useState(false);

  // Pre-group all exercises by muscle category
  const allExercises = React.useMemo(() => ExerciseService.getAll(), []);

  const groupedExercises = React.useMemo(() => {
    const result = {};
    MUSCLE_GROUPS.forEach(g => { result[g.id] = []; });
    allExercises.forEach(ex => {
      const g = getExerciseGroup(ex);
      if (result[g]) result[g].push(ex);
    });
    return result;
  }, [allExercises]);

  const filteredExercises = React.useMemo(() => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return allExercises.filter(ex =>
        ex.name.toLowerCase().includes(q) ||
        ex.muscles.primary.some(m => m.toLowerCase().includes(q)) ||
        ex.tags.some(t => t.includes(q))
      );
    }
    return groupedExercises[activeGroup] || [];
  }, [activeGroup, searchQuery, groupedExercises, allExercises]);

  const suggestedExercises = React.useMemo(
    () => ExerciseService.suggestForWorkout(workout, 'hipertrofia', 'intermedio', 6),
    [workout]
  );

  const displayExercises = (showSugeridos && !searchQuery) ? suggestedExercises : filteredExercises;
  const currentExIds = new Set(workout.map(e => e.id));

  const addExercise = (ex) => {
    if (currentExIds.has(ex.id)) return;
    setWorkout(prev => [...prev, { ...ex, sets: [{ kg: '', reps: '', rpe: '' }] }]);
  };
  const removeExercise = (id) => setWorkout(prev => prev.filter(e => e.id !== id));
  const addSet = (id) => setWorkout(prev => prev.map(e => e.id === id ? { ...e, sets: [...e.sets, { kg: '', reps: '', rpe: '' }] } : e));
  const removeSet = (id, idx) => setWorkout(prev => prev.map(e => e.id === id ? { ...e, sets: e.sets.filter((_, i) => i !== idx) } : e));
  const updateSet = (id, idx, field, value) => setWorkout(prev => prev.map(e => e.id === id ? { ...e, sets: e.sets.map((s, i) => i === idx ? { ...s, [field]: value } : s) } : e));

  const handleSave = () => {
    if (workout.length === 0) return;
    actions.logSession(workout.map(ex => ({
      name: ex.name, muscles: ex.muscles.primary, sets: ex.sets,
    })));
    setSaved(true); setGemFlash(true);
    setTimeout(() => setGemFlash(false), 2500);
    setTimeout(() => { setSaved(false); setWorkout([]); }, 3000);
  };

  const groupTabStyle = (active) => ({
    padding: '7px 13px', border: 'none', cursor: 'pointer',
    background: active ? '#0F1A2E' : 'transparent',
    color: active ? '#FAFAF7' : '#9498A4',
    fontFamily: '"Inter",system-ui', fontSize: 11, fontWeight: 700,
    borderRadius: 999, transition: 'all 0.15s', whiteSpace: 'nowrap', flexShrink: 0,
  });

  return (
    <section style={{ padding: '120px 32px', minHeight: '80vh', background: '#FAFAF7' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>

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
        <div style={{ marginBottom: 36 }}>
          <span style={{ fontFamily: '"Inter",system-ui', fontSize: 13, fontWeight: 700, letterSpacing: 1.6, textTransform: 'uppercase', color: '#5C6477' }}>
            Builder · Constructor de sesiones
          </span>
          <h1 style={{ fontFamily: '"Inter",system-ui', fontSize: 52, fontWeight: 700, color: '#0F1A2E', letterSpacing: -2, lineHeight: 1.02, margin: '12px 0 0' }}>
            Construye tu sesión.{' '}
            <span style={{ fontFamily: '"Instrument Serif",serif', fontStyle: 'italic', fontWeight: 400 }}>
              Cada serie, con intención.
            </span>
          </h1>
        </div>

        {/* Main layout — fixed height, independent scroll panels */}
        <div style={{
          background: '#FFFFFF', borderRadius: 28,
          border: '1px solid rgba(15,26,46,0.08)',
          boxShadow: '0 20px 60px -30px rgba(15,26,46,0.15)',
          overflow: 'hidden',
          display: 'grid', gridTemplateColumns: '390px 1fr',
          height: 720,
        }}>

          {/* ── LEFT: exercise browser ──────────────────────────────────── */}
          <div style={{ borderRight: '1px solid rgba(15,26,46,0.06)', display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>

            {/* Search */}
            <div style={{ padding: '14px 14px 8px', flexShrink: 0 }}>
              <input
                type="text"
                value={searchQuery}
                onChange={e => { setSearchQuery(e.target.value); setShowSugeridos(false); }}
                placeholder="Buscar ejercicio o músculo..."
                style={{
                  width: '100%', padding: '9px 14px', borderRadius: 12, boxSizing: 'border-box',
                  border: '1px solid rgba(15,26,46,0.1)', background: '#FAFAF7',
                  fontFamily: '"Inter",system-ui', fontSize: 12, color: '#0F1A2E',
                }}
              />
            </div>

            {/* Muscle group tabs */}
            {!searchQuery && (
              <div style={{
                padding: '0 14px 10px',
                display: 'flex', gap: 4, overflowX: 'auto', flexShrink: 0,
                scrollbarWidth: 'none',
              }}>
                {MUSCLE_GROUPS.map(g => (
                  <button key={g.id}
                    onClick={() => { setActiveGroup(g.id); setShowSugeridos(false); }}
                    style={groupTabStyle(activeGroup === g.id && !showSugeridos)}
                  >
                    {g.label}
                    <span style={{ fontFamily: 'ui-monospace,Menlo,monospace', fontSize: 8, opacity: 0.55, marginLeft: 4 }}>
                      {groupedExercises[g.id]?.length || 0}
                    </span>
                  </button>
                ))}
                {workout.length > 0 && (
                  <button
                    onClick={() => setShowSugeridos(true)}
                    style={{ ...groupTabStyle(showSugeridos), color: showSugeridos ? '#FAFAF7' : '#1F8B3A' }}
                  >
                    ↑ Sugeridos
                  </button>
                )}
              </div>
            )}

            {/* Smart analysis hint (sugeridos mode) */}
            {showSugeridos && !searchQuery && (
              <div style={{ padding: '0 14px 8px', flexShrink: 0 }}>
                <div style={{
                  padding: '8px 12px', borderRadius: 10,
                  background: 'rgba(31,139,58,0.05)', border: '1px solid rgba(31,139,58,0.14)',
                  fontFamily: '"Inter",system-ui', fontSize: 10, color: '#1F8B3A', lineHeight: 1.5,
                }}>
                  {(() => {
                    const bal = ExerciseService.computeBalance(workout);
                    const msgs = [];
                    if (bal.push > bal.pull + 1) msgs.push('Falta tracción');
                    else if (bal.pull > bal.push + 1) msgs.push('Falta empuje');
                    if (bal.quad > bal.post + 1) msgs.push('Añade posterior');
                    if (bal.core === 0 && workout.length >= 3) msgs.push('Sin core aún');
                    return msgs.length ? `Análisis: ${msgs.join(' · ')}` : '✓ Sesión bien equilibrada';
                  })()}
                </div>
              </div>
            )}

            {/* Count label */}
            <div style={{ padding: '0 14px 6px', flexShrink: 0 }}>
              <span style={{ fontFamily: 'ui-monospace,Menlo,monospace', fontSize: 9, color: '#9498A4', fontWeight: 700, letterSpacing: 0.6 }}>
                {displayExercises.length} EJERCICIO{displayExercises.length !== 1 ? 'S' : ''}
                {searchQuery
                  ? ' · BÚSQUEDA'
                  : showSugeridos
                    ? ' · SUGERIDOS'
                    : ` · ${MUSCLE_GROUPS.find(g => g.id === activeGroup)?.label?.toUpperCase() || ''}`}
              </span>
            </div>

            {/* 2-column card grid */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '0 14px 14px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {displayExercises.map(exercise => (
                  <ExerciseGridCard
                    key={exercise.id}
                    exercise={exercise}
                    isAdded={currentExIds.has(exercise.id)}
                    onToggle={() => currentExIds.has(exercise.id) ? removeExercise(exercise.id) : addExercise(exercise)}
                  />
                ))}
              </div>
              {displayExercises.length === 0 && (
                <div style={{ textAlign: 'center', padding: '40px 0', color: '#9498A4', fontFamily: '"Inter",system-ui', fontSize: 13 }}>
                  Sin resultados
                </div>
              )}
            </div>
          </div>

          {/* ── RIGHT: session panel ────────────────────────────────────── */}
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>

            {/* Stats bar — always visible */}
            <SessionStats workout={workout} />

            {/* Exercise list — scrollable */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>
              {workout.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                  <div style={{ fontFamily: '"Instrument Serif",serif', fontStyle: 'italic', fontSize: 22, color: '#9498A4', marginBottom: 10 }}>
                    Tu sesión está vacía
                  </div>
                  <p style={{ fontFamily: '"Inter",system-ui', fontSize: 12, color: '#9498A4', margin: 0, lineHeight: 1.7 }}>
                    Selecciona ejercicios por grupo muscular<br />
                    o pulsa <strong>↑ Sugeridos</strong> para una selección inteligente.
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

            {/* Fixed footer — volume + save always visible */}
            <div style={{ padding: '14px 20px', borderTop: '1px solid rgba(15,26,46,0.06)', background: '#FAFAF7', flexShrink: 0 }}>
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
                  : workout.length === 0
                    ? 'Guardar sesión · +30 gemas 💎'
                    : `Guardar sesión · ${workout.length} ejercicios · ${workout.reduce((s, e) => s + e.sets.length, 0)} series · +30 💎`
                }
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

Object.assign(window, { BuilderSection });
