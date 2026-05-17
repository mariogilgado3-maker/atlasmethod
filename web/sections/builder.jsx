// Builder — body-first, visual, app-like

// ── Theme ─────────────────────────────────────────────────────────────────────
const D = {
  page:    '#060D18',
  panel:   '#0C1524',
  card:    '#111E30',
  cardHov: '#172236',
  border:  'rgba(255,255,255,0.07)',
  text:    '#E8EDF8',
  mid:     'rgba(232,237,248,0.55)',
  muted:   'rgba(232,237,248,0.28)',
  accent:  '#2A6FDB',
  success: '#22C55E',
  danger:  'rgba(220,60,60,0.75)',
};

// ── Muscle definitions ────────────────────────────────────────────────────────
const MUSCLE_DEFS = {
  pecho:   { label: 'Pecho',   front: true,  back: false },
  espalda: { label: 'Espalda', front: false, back: true  },
  hombro:  { label: 'Hombros', front: true,  back: true  },
  biceps:  { label: 'Bíceps',  front: true,  back: false },
  triceps: { label: 'Tríceps', front: false, back: true  },
  piernas: { label: 'Piernas', front: true,  back: false },
  gluteos: { label: 'Glúteos', front: false, back: true  },
  core:    { label: 'Core',    front: true,  back: true  },
};

// ── Helpers ───────────────────────────────────────────────────────────────────
function getExerciseGroup(ex) {
  if (ex.group) return ex.group;
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

function getMuscleExercises(muscleId, all) {
  switch (muscleId) {
    case 'pecho':   return all.filter(ex => getExerciseGroup(ex) === 'pecho');
    case 'espalda': return all.filter(ex => getExerciseGroup(ex) === 'espalda');
    case 'hombro':  return all.filter(ex => getExerciseGroup(ex) === 'hombro');
    case 'biceps':  return all.filter(ex => getExerciseGroup(ex) === 'biceps');
    case 'triceps': return all.filter(ex => getExerciseGroup(ex) === 'triceps');
    case 'piernas': return all.filter(ex => ex.pattern === 'sentadilla' || ex.pattern === 'aislamiento-pantorrilla');
    case 'gluteos': return all.filter(ex => ex.pattern === 'bisagra');
    case 'core':    return all.filter(ex => getExerciseGroup(ex) === 'core');
    default:        return [];
  }
}

function computeMuscleVolumes(log) {
  const v = { pecho: 0, espalda: 0, hombro: 0, biceps: 0, triceps: 0, piernas: 0, gluteos: 0, core: 0 };
  const MAP = [
    [/pectoral/i,                                        'pecho'],
    [/dorsal|romboid|serrato|trapecio|erector/i,         'espalda'],
    [/deltoid/i,                                         'hombro'],
    [/bíceps|biceps/i,                                   'biceps'],
    [/tríceps|triceps/i,                                 'triceps'],
    [/cuádricep|cuadricep|femoral|pantorrilla|gemelo|sóleo/i, 'piernas'],
    [/glút|isquio/i,                                     'gluteos'],
    [/core|transverso|oblicu|abdominal/i,                'core'],
  ];
  (log || []).slice(0, 4).forEach(session => {
    (session.exercises || []).forEach(ex => {
      const n = Math.max((ex.sets || []).length, 1);
      (ex.muscles || []).forEach(m => {
        for (const [re, g] of MAP) { if (re.test(m)) { v[g] += n; break; } }
      });
    });
  });
  return v;
}

function computeFrequency(muscleId, log) {
  const MAP = {
    pecho: /pectoral/i, espalda: /dorsal|romboid|trapecio|erector/i,
    hombro: /deltoid/i, biceps: /bíceps|biceps/i, triceps: /tríceps|triceps/i,
    piernas: /cuádricep|cuadricep|femoral|pantorrilla/i,
    gluteos: /glút|isquio/i, core: /core|transverso|oblicu/i,
  };
  const re = MAP[muscleId];
  if (!re) return 0;
  return (log || []).slice(0, 4).filter(s =>
    (s.exercises || []).some(ex => (ex.muscles || []).some(m => re.test(m)))
  ).length;
}

function fatigueLevel(sets) {
  if (sets <= 5)  return { label: 'Baja',     color: D.success };
  if (sets <= 12) return { label: 'Moderada', color: '#F59E0B' };
  if (sets <= 20) return { label: 'Alta',     color: '#F97316' };
  return             { label: 'Exceso',    color: '#EF4444' };
}

function estimateDuration(workout) {
  const sets = workout.reduce((s, ex) => s + ex.sets.length, 0);
  return Math.round((workout.length > 0 ? 5 : 0) + sets * 2.5);
}

// ── Exercise thumbnail ────────────────────────────────────────────────────────
function ExerciseThumb({ exercise, size = 52 }) {
  const g = getExerciseGroup(exercise);
  const gs = ExerciseMedia.GROUP_STYLE[g] || ExerciseMedia.GROUP_STYLE.core;
  return (
    <div style={{
      width: size, height: size, borderRadius: Math.round(size * 0.22), flexShrink: 0,
      background: `linear-gradient(140deg, ${gs.from}, ${gs.to})`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      overflow: 'hidden', position: 'relative',
    }}>
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(rgba(255,255,255,0.05) 1px, transparent 1px)', backgroundSize: '10px 10px' }} />
      <span style={{ fontFamily: '"Instrument Serif",serif', fontStyle: 'italic', fontSize: size * 0.44, color: 'rgba(255,255,255,0.32)', position: 'relative', zIndex: 1 }}>
        {exercise.name.charAt(0)}
      </span>
    </div>
  );
}

// ── Anatomical SVG body map ───────────────────────────────────────────────────
function BodyMap({ view, muscleVolumes, selectedMuscle, onSelect }) {
  const [hov, setHov] = React.useState(null);

  function color(id) {
    const isSel = selectedMuscle === id;
    const isHov = hov === id;
    const sets = muscleVolumes[id] || 0;
    if (isSel) return { fill: '#2A6FDB',                  stroke: '#7AB4FF', sw: 2 };
    if (isHov) return { fill: 'rgba(42,111,219,0.42)',    stroke: 'rgba(110,169,240,0.70)', sw: 1.5 };
    if (sets === 0) return { fill: 'rgba(255,255,255,0.07)', stroke: 'rgba(255,255,255,0.14)', sw: 0.5 };
    if (sets < 6)   return { fill: 'rgba(42,111,219,0.28)',  stroke: 'rgba(42,111,219,0.48)', sw: 0.5 };
    if (sets < 16)  return { fill: 'rgba(42,111,219,0.58)',  stroke: 'rgba(42,111,219,0.80)', sw: 0.5 };
    return                  { fill: 'rgba(220,60,60,0.38)',  stroke: 'rgba(220,80,60,0.62)', sw: 0.5 };
  }

  function mp(id) {
    const { fill, stroke, sw } = color(id);
    return {
      fill, stroke, strokeWidth: sw,
      style: { cursor: 'pointer', transition: 'fill 0.14s, stroke 0.14s' },
      onMouseEnter: () => setHov(id),
      onMouseLeave: () => setHov(null),
      onClick: () => onSelect(id),
    };
  }

  // Silhouette
  const sf = 'rgba(255,255,255,0.05)';
  const ss = 'rgba(255,255,255,0.09)';
  const sw = 0.5;
  const activeLabel = hov || selectedMuscle;

  return (
    <svg viewBox="0 0 200 430" style={{ width: '100%', maxWidth: 230, display: 'block', margin: '0 auto' }}>
      {/* ── Silhouette ── */}
      <circle cx="100" cy="29" r="21" fill={sf} stroke={ss} strokeWidth={sw} />
      <rect x="91" y="49" width="18" height="17" rx="5" fill={sf} stroke="none" />
      <path d="M58,65 L142,65 C146,95 147,138 141,170 L128,185 L72,185 L59,170 C53,138 54,95 58,65Z" fill={sf} stroke={ss} strokeWidth={sw} />
      <ellipse cx="46"  cy="112" rx="11" ry="35" fill={sf} stroke={ss} strokeWidth={sw} />
      <ellipse cx="154" cy="112" rx="11" ry="35" fill={sf} stroke={ss} strokeWidth={sw} />
      <ellipse cx="38"  cy="168" rx="9"  ry="26" fill={sf} stroke={ss} strokeWidth={sw} />
      <ellipse cx="162" cy="168" rx="9"  ry="26" fill={sf} stroke={ss} strokeWidth={sw} />
      <ellipse cx="79"  cy="257" rx="19" ry="44" fill={sf} stroke={ss} strokeWidth={sw} />
      <ellipse cx="121" cy="257" rx="19" ry="44" fill={sf} stroke={ss} strokeWidth={sw} />
      <ellipse cx="79"  cy="356" rx="13" ry="32" fill={sf} stroke={ss} strokeWidth={sw} />
      <ellipse cx="121" cy="356" rx="13" ry="32" fill={sf} stroke={ss} strokeWidth={sw} />
      <ellipse cx="79"  cy="402" rx="12" ry="8"  fill={sf} stroke={ss} strokeWidth={sw} />
      <ellipse cx="121" cy="402" rx="12" ry="8"  fill={sf} stroke={ss} strokeWidth={sw} />

      {/* ── Interactive muscles ── */}
      {view === 'front' ? (
        <React.Fragment>
          <ellipse cx="51"  cy="78"  rx="15" ry="13" {...mp('hombro')} />
          <ellipse cx="149" cy="78"  rx="15" ry="13" {...mp('hombro')} />
          <ellipse cx="79"  cy="95"  rx="18" ry="16" {...mp('pecho')} />
          <ellipse cx="121" cy="95"  rx="18" ry="16" {...mp('pecho')} />
          <ellipse cx="45"  cy="118" rx="10" ry="26" {...mp('biceps')} />
          <ellipse cx="155" cy="118" rx="10" ry="26" {...mp('biceps')} />
          <ellipse cx="100" cy="156" rx="20" ry="22" {...mp('core')} />
          <ellipse cx="79"  cy="262" rx="16" ry="40" {...mp('piernas')} />
          <ellipse cx="121" cy="262" rx="16" ry="40" {...mp('piernas')} />
        </React.Fragment>
      ) : (
        <React.Fragment>
          <ellipse cx="51"  cy="78"  rx="15" ry="13" {...mp('hombro')} />
          <ellipse cx="149" cy="78"  rx="15" ry="13" {...mp('hombro')} />
          <ellipse cx="100" cy="77"  rx="28" ry="14" {...mp('espalda')} />
          <ellipse cx="76"  cy="124" rx="17" ry="38" {...mp('espalda')} />
          <ellipse cx="124" cy="124" rx="17" ry="38" {...mp('espalda')} />
          <ellipse cx="45"  cy="118" rx="10" ry="26" {...mp('triceps')} />
          <ellipse cx="155" cy="118" rx="10" ry="26" {...mp('triceps')} />
          <ellipse cx="100" cy="162" rx="18" ry="14" {...mp('core')} />
          <ellipse cx="79"  cy="218" rx="22" ry="26" {...mp('gluteos')} />
          <ellipse cx="121" cy="218" rx="22" ry="26" {...mp('gluteos')} />
          <ellipse cx="79"  cy="286" rx="16" ry="36" {...mp('gluteos')} />
          <ellipse cx="121" cy="286" rx="16" ry="36" {...mp('gluteos')} />
        </React.Fragment>
      )}

      {/* Active label */}
      {activeLabel && (
        <text x="100" y="422" textAnchor="middle" fill="rgba(232,237,248,0.55)" fontSize="11" fontFamily="Inter, system-ui" fontWeight="700" letterSpacing="0.5">
          {(MUSCLE_DEFS[activeLabel] || {}).label || ''}
        </text>
      )}
    </svg>
  );
}

// ── Stat block ────────────────────────────────────────────────────────────────
function StatBlock({ label, value, color }) {
  return (
    <div>
      <div style={{ fontFamily: '"Inter",system-ui', fontSize: 28, fontWeight: 800, color: color || D.text, lineHeight: 1, letterSpacing: -1 }}>{value}</div>
      <div style={{ fontFamily: '"Inter",system-ui', fontSize: 11, color: D.muted, marginTop: 4 }}>{label}</div>
    </div>
  );
}

// ── Session exercise row (inside muscle overview) ─────────────────────────────
function SessionExRow({ workoutEx, onRemove, onEdit }) {
  const [hov, setHov] = React.useState(false);
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', borderRadius: 14, background: hov ? D.cardHov : D.card, border: `1px solid ${D.border}`, marginBottom: 8, cursor: 'pointer', transition: 'background 0.12s' }}
      onClick={onEdit}
    >
      <ExerciseThumb exercise={workoutEx} size={44} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: '"Inter",system-ui', fontSize: 13, fontWeight: 600, color: D.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{workoutEx.name}</div>
        <div style={{ fontFamily: '"Inter",system-ui', fontSize: 11, color: D.muted, marginTop: 2 }}>
          {workoutEx.sets.length} serie{workoutEx.sets.length !== 1 ? 's' : ''}
          {workoutEx.sets[0] && workoutEx.sets[0].kg ? ` · ${workoutEx.sets[0].kg} kg` : ''}
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontFamily: 'ui-monospace,Menlo,monospace', fontSize: 10, color: D.success, fontWeight: 700 }}>✓</span>
        <button
          onClick={e => { e.stopPropagation(); onRemove(); }}
          style={{ width: 28, height: 28, borderRadius: 8, border: 'none', background: 'rgba(220,60,60,0.12)', color: 'rgba(220,60,60,0.75)', cursor: 'pointer', fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >✕</button>
      </div>
    </div>
  );
}

// ── Muscle overview panel ─────────────────────────────────────────────────────
function MuscleOverview({ muscleId, muscleVolumes, sessionExercises, log, onAdd, onRemoveEx, onEditEx }) {
  const def   = MUSCLE_DEFS[muscleId] || {};
  const sets  = muscleVolumes[muscleId] || 0;
  const fat   = fatigueLevel(sets);
  const freq  = computeFrequency(muscleId, log);

  return (
    <div style={{ animation: 'fadeIn 0.22s ease' }}>
      {/* Muscle name */}
      <h2 style={{ fontFamily: '"Inter",system-ui', fontSize: 32, fontWeight: 800, color: D.text, margin: '0 0 24px', letterSpacing: -1.5 }}>
        {def.label}
      </h2>

      {/* Stats */}
      <div style={{ display: 'flex', gap: 32, marginBottom: 32, paddingBottom: 28, borderBottom: `1px solid ${D.border}` }}>
        <StatBlock label="Series esta semana" value={sets || '—'} />
        <StatBlock label="Fatiga" value={fat.label} color={fat.color} />
        <StatBlock label="Frecuencia" value={freq > 0 ? `${freq}x` : '—'} />
      </div>

      {/* Exercises in session */}
      {sessionExercises.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontFamily: 'ui-monospace,Menlo,monospace', fontSize: 9, fontWeight: 700, color: D.muted, letterSpacing: 1, marginBottom: 10 }}>
            EN TU SESIÓN
          </div>
          {sessionExercises.map(ex => (
            <SessionExRow
              key={ex.id}
              workoutEx={ex}
              onRemove={() => onRemoveEx(ex.id)}
              onEdit={() => onEditEx(ex)}
            />
          ))}
        </div>
      )}

      {/* Add CTA */}
      <button
        onClick={onAdd}
        style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '14px 22px', borderRadius: 14,
          background: D.accent, color: '#fff', border: 'none', cursor: 'pointer',
          fontFamily: '"Inter",system-ui', fontSize: 14, fontWeight: 700,
          boxShadow: '0 8px 28px -8px rgba(42,111,219,0.5)',
        }}
      >
        <span style={{ fontSize: 18, lineHeight: 1 }}>+</span>
        Añadir ejercicio de {def.label.toLowerCase()}
      </button>

      {/* Coach tip */}
      {sets === 0 && (
        <div style={{ marginTop: 20, padding: '12px 14px', borderRadius: 12, background: 'rgba(42,111,219,0.06)', border: '1px solid rgba(42,111,219,0.14)', fontFamily: '"Inter",system-ui', fontSize: 12, color: D.mid, lineHeight: 1.55 }}>
          Sin trabajo registrado en {def.label.toLowerCase()} esta semana. Atlas Coach detectará el desequilibrio.
        </div>
      )}
      {sets > 20 && (
        <div style={{ marginTop: 20, padding: '12px 14px', borderRadius: 12, background: 'rgba(220,60,60,0.06)', border: '1px solid rgba(220,60,60,0.18)', fontFamily: '"Inter",system-ui', fontSize: 12, color: 'rgba(255,130,110,0.9)', lineHeight: 1.55 }}>
          Volumen elevado en {def.label.toLowerCase()} ({sets} series). Considera un día de recuperación.
        </div>
      )}
    </div>
  );
}

// ── Exercise picker panel ─────────────────────────────────────────────────────
function ExercisePicker({ muscleId, exercises, sessionExIds, onSelect, onBack }) {
  const def = MUSCLE_DEFS[muscleId] || {};
  return (
    <div style={{ animation: 'fadeIn 0.18s ease' }}>
      <button onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', padding: '4px 0', marginBottom: 20, fontFamily: '"Inter",system-ui', fontSize: 12, color: D.mid, fontWeight: 600 }}>
        ← {def.label}
      </button>
      <div style={{ fontFamily: '"Inter",system-ui', fontSize: 18, fontWeight: 700, color: D.text, marginBottom: 20, letterSpacing: -0.5 }}>
        Elige un ejercicio
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 10 }}>
        {exercises.map(ex => {
          const added = sessionExIds.has(ex.id);
          return (
            <PickerCard key={ex.id} exercise={ex} isAdded={added} onClick={() => onSelect(ex)} />
          );
        })}
        {exercises.length === 0 && (
          <div style={{ gridColumn: '1/-1', padding: '32px 0', textAlign: 'center', fontFamily: '"Inter",system-ui', fontSize: 13, color: D.muted }}>
            Sin ejercicios disponibles
          </div>
        )}
      </div>
    </div>
  );
}

function PickerCard({ exercise, isAdded, onClick }) {
  const [hov, setHov] = React.useState(false);
  const g = getExerciseGroup(exercise);
  const gs = ExerciseMedia.GROUP_STYLE[g] || ExerciseMedia.GROUP_STYLE.core;
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{ borderRadius: 16, cursor: 'pointer', overflow: 'hidden', border: `1px solid ${isAdded ? 'rgba(34,197,94,0.28)' : D.border}`, background: hov ? D.cardHov : D.card, transition: 'background 0.12s' }}
    >
      {/* Thumbnail */}
      <div style={{ height: 80, background: `linear-gradient(140deg, ${gs.from}, ${gs.to})`, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(rgba(255,255,255,0.05) 1px, transparent 1px)', backgroundSize: '12px 12px' }} />
        <span style={{ fontFamily: '"Instrument Serif",serif', fontStyle: 'italic', fontSize: 30, color: 'rgba(255,255,255,0.30)', position: 'relative', zIndex: 1 }}>
          {exercise.name.charAt(0)}
        </span>
        {isAdded && (
          <div style={{ position: 'absolute', top: 8, right: 8, width: 20, height: 20, borderRadius: 999, background: 'rgba(34,197,94,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: 10, color: '#fff', fontWeight: 700 }}>✓</span>
          </div>
        )}
      </div>
      {/* Name */}
      <div style={{ padding: '10px 10px 11px' }}>
        <div style={{ fontFamily: '"Inter",system-ui', fontSize: 11, fontWeight: 600, color: D.text, lineHeight: 1.35, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {exercise.name}
        </div>
        <div style={{ fontFamily: '"Inter",system-ui', fontSize: 9, color: D.muted, marginTop: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {exercise.muscles.primary[0]}
        </div>
      </div>
    </div>
  );
}

// ── Set configuration panel ───────────────────────────────────────────────────
function SetConfigPanel({ exercise, initialSets, onConfirm, onBack }) {
  const [sets, setSets] = React.useState(() =>
    initialSets && initialSets.length > 0
      ? initialSets.map(s => ({ kg: s.kg || '', reps: s.reps || '10', rest: s.rest || '90', rir: s.rir || '' }))
      : [{ kg: '', reps: '10', rest: '90', rir: '' }, { kg: '', reps: '10', rest: '90', rir: '' }, { kg: '', reps: '10', rest: '90', rir: '' }]
  );

  const updateSet = (i, field, val) => setSets(prev => prev.map((s, idx) => idx === i ? { ...s, [field]: val } : s));
  const addSet    = () => setSets(prev => [...prev, { kg: '', reps: '10', rest: '90', rir: '' }]);
  const removeSet = (i) => setSets(prev => prev.filter((_, idx) => idx !== i));

  return (
    <div style={{ animation: 'fadeIn 0.18s ease' }}>
      <button onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', padding: '4px 0', marginBottom: 20, fontFamily: '"Inter",system-ui', fontSize: 12, color: D.mid, fontWeight: 600 }}>
        ← Volver
      </button>

      {/* Exercise header */}
      <div style={{ display: 'flex', gap: 14, alignItems: 'center', marginBottom: 28 }}>
        <ExerciseThumb exercise={exercise} size={60} />
        <div>
          <div style={{ fontFamily: '"Inter",system-ui', fontSize: 17, fontWeight: 700, color: D.text, lineHeight: 1.25, letterSpacing: -0.3 }}>{exercise.name}</div>
          <div style={{ fontFamily: '"Inter",system-ui', fontSize: 12, color: D.muted, marginTop: 4 }}>{exercise.muscles.primary.join(' · ')}</div>
        </div>
      </div>

      {/* Sets */}
      <div style={{ marginBottom: 8 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '18px 1fr 1fr 18px', gap: 6, alignItems: 'center', marginBottom: 6 }}>
          {['', 'Kg', 'Reps', ''].map((h, i) => (
            <span key={i} style={{ fontFamily: 'ui-monospace,Menlo,monospace', fontSize: 8, color: D.muted, fontWeight: 700, textAlign: 'center', letterSpacing: 0.4 }}>{h}</span>
          ))}
        </div>
        {sets.map((set, i) => (
          <div key={i} style={{ display: 'grid', gridTemplateColumns: '18px 1fr 1fr 18px', gap: 6, alignItems: 'center', marginBottom: 6 }}>
            <span style={{ fontFamily: 'ui-monospace,Menlo,monospace', fontSize: 10, color: D.muted, textAlign: 'center' }}>{i + 1}</span>
            <input
              type="number" value={set.kg} placeholder="—"
              onChange={e => updateSet(i, 'kg', e.target.value)}
              min={0} step={0.5}
              style={{ width: '100%', padding: '9px 6px', borderRadius: 10, boxSizing: 'border-box', border: `1px solid ${D.border}`, background: 'rgba(255,255,255,0.04)', fontFamily: 'ui-monospace,Menlo,monospace', fontSize: 14, color: D.text, textAlign: 'center' }}
            />
            <input
              type="number" value={set.reps} placeholder="10"
              onChange={e => updateSet(i, 'reps', e.target.value)}
              min={1} step={1}
              style={{ width: '100%', padding: '9px 6px', borderRadius: 10, boxSizing: 'border-box', border: `1px solid ${D.border}`, background: 'rgba(255,255,255,0.04)', fontFamily: 'ui-monospace,Menlo,monospace', fontSize: 14, color: D.text, textAlign: 'center' }}
            />
            {sets.length > 1
              ? <button onClick={() => removeSet(i)} style={{ width: 18, height: 18, border: 'none', background: 'rgba(220,60,60,0.12)', color: 'rgba(220,80,60,0.75)', borderRadius: 4, cursor: 'pointer', fontSize: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}>✕</button>
              : <div />}
          </div>
        ))}
      </div>

      <button onClick={addSet} style={{ marginBottom: 24, padding: '7px 14px', borderRadius: 9, border: `1px dashed rgba(255,255,255,0.15)`, background: 'transparent', cursor: 'pointer', fontFamily: '"Inter",system-ui', fontSize: 11, fontWeight: 600, color: D.mid }}>
        + Serie
      </button>

      <button
        onClick={() => onConfirm(exercise, sets)}
        style={{ width: '100%', padding: '14px 20px', borderRadius: 14, cursor: 'pointer', background: D.accent, color: '#fff', border: 'none', fontFamily: '"Inter",system-ui', fontSize: 14, fontWeight: 700, letterSpacing: -0.2, boxShadow: '0 8px 28px -8px rgba(42,111,219,0.5)' }}
      >
        Añadir a la rutina · {sets.length} serie{sets.length !== 1 ? 's' : ''}  →
      </button>
    </div>
  );
}

// ── Workout bottom bar ────────────────────────────────────────────────────────
function WorkoutBar({ workout, onSave, saved, duration }) {
  return (
    <div style={{
      position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 200,
      background: 'rgba(6,13,24,0.94)', backdropFilter: 'blur(24px)',
      borderTop: '1px solid rgba(255,255,255,0.08)',
      padding: '14px 32px',
      display: 'flex', alignItems: 'center', gap: 16,
    }}>
      {/* Exercise pills */}
      <div style={{ flex: 1, display: 'flex', gap: 6, overflow: 'hidden', flexWrap: 'nowrap' }}>
        {workout.slice(0, 5).map(ex => (
          <span key={ex.id} style={{
            padding: '5px 10px', borderRadius: 999, flexShrink: 0,
            background: 'rgba(42,111,219,0.14)', border: '1px solid rgba(42,111,219,0.22)',
            fontFamily: '"Inter",system-ui', fontSize: 11, fontWeight: 600, color: '#6EA9F0',
            overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 140, whiteSpace: 'nowrap',
          }}>
            {ex.name}
          </span>
        ))}
        {workout.length > 5 && (
          <span style={{ padding: '5px 10px', borderRadius: 999, flexShrink: 0, background: 'rgba(255,255,255,0.06)', fontFamily: '"Inter",system-ui', fontSize: 11, color: D.muted }}>
            +{workout.length - 5} más
          </span>
        )}
      </div>

      {/* Duration */}
      <span style={{ fontFamily: 'ui-monospace,Menlo,monospace', fontSize: 11, color: D.muted, flexShrink: 0, whiteSpace: 'nowrap' }}>
        ~{duration} min
      </span>

      {/* Save */}
      <button
        onClick={onSave}
        style={{
          flexShrink: 0, padding: '11px 22px', borderRadius: 12, border: 'none', cursor: 'pointer',
          background: saved ? 'rgba(34,197,94,0.15)' : D.accent,
          color: saved ? D.success : '#fff',
          fontFamily: '"Inter",system-ui', fontSize: 13, fontWeight: 700,
          transition: 'all 0.25s', whiteSpace: 'nowrap',
        }}
      >
        {saved ? '✓ Guardado · +30 💎' : 'Guardar sesión · +30 💎'}
      </button>
    </div>
  );
}

// ── Empty state ───────────────────────────────────────────────────────────────
function EmptyState() {
  return (
    <div style={{ paddingTop: 40, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 16 }}>
      <div style={{ width: 56, height: 56, borderRadius: 16, background: 'rgba(42,111,219,0.08)', border: '1px solid rgba(42,111,219,0.14)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>
        ✦
      </div>
      <div>
        <div style={{ fontFamily: '"Instrument Serif",serif', fontStyle: 'italic', fontSize: 24, color: D.mid, marginBottom: 8 }}>
          Toca un músculo
        </div>
        <p style={{ fontFamily: '"Inter",system-ui', fontSize: 14, color: D.muted, lineHeight: 1.65, margin: 0, maxWidth: 320 }}>
          Selecciona un grupo muscular en el mapa para ver tus ejercicios, el volumen semanal y añadir nuevas series a tu sesión.
        </p>
      </div>

      {/* Quick-access muscle pills */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
        {Object.entries(MUSCLE_DEFS).map(([id, def]) => (
          <span key={id} style={{ padding: '6px 14px', borderRadius: 999, background: 'rgba(255,255,255,0.04)', border: `1px solid ${D.border}`, fontFamily: '"Inter",system-ui', fontSize: 12, fontWeight: 600, color: D.muted, cursor: 'default' }}>
            {def.label}
          </span>
        ))}
      </div>
    </div>
  );
}

// ── Volume legend ─────────────────────────────────────────────────────────────
function VolumeLegend() {
  const items = [
    { c: 'rgba(255,255,255,0.14)', l: 'Sin trabajo' },
    { c: 'rgba(42,111,219,0.40)',  l: 'Trabajado' },
    { c: 'rgba(42,111,219,0.75)',  l: 'Alto volumen' },
    { c: 'rgba(220,60,60,0.45)',   l: 'Exceso' },
  ];
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 14px', marginTop: 16 }}>
      {items.map(({ c, l }) => (
        <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <div style={{ width: 9, height: 9, borderRadius: 3, background: c, flexShrink: 0 }} />
          <span style={{ fontFamily: '"Inter",system-ui', fontSize: 10, color: D.muted }}>{l}</span>
        </div>
      ))}
    </div>
  );
}

// ── Main section ──────────────────────────────────────────────────────────────
function BuilderSection() {
  const { state, actions } = useStore();
  const { navigate } = useRoute();

  const [mapView,        setMapView]        = React.useState('front');
  const [selectedMuscle, setSelectedMuscle] = React.useState(null);
  const [panelMode,      setPanelMode]      = React.useState('empty'); // 'empty' | 'overview' | 'picker' | 'setconfig'
  const [configExercise, setConfigExercise] = React.useState(null);
  const [configInitSets, setConfigInitSets] = React.useState(null);
  const [workout,        setWorkout]        = React.useState([]);
  const [saved,          setSaved]          = React.useState(false);
  const [gemFlash,       setGemFlash]       = React.useState(false);

  const allExercises  = React.useMemo(() => ExerciseService.getAll(), []);
  const muscleVolumes = React.useMemo(() => computeMuscleVolumes(state.log || []), [state.log]);

  const muscleExercises = React.useMemo(
    () => selectedMuscle ? getMuscleExercises(selectedMuscle, allExercises) : [],
    [selectedMuscle, allExercises]
  );

  const currentExIds = React.useMemo(() => new Set(workout.map(e => e.id)), [workout]);

  const sessionExercisesForMuscle = React.useMemo(() => {
    const ids = new Set(muscleExercises.map(e => e.id));
    return workout.filter(ex => ids.has(ex.id));
  }, [workout, muscleExercises]);

  const duration = React.useMemo(() => estimateDuration(workout), [workout]);

  // Sync live workout to store for Atlas Coach
  React.useEffect(() => {
    actions.setCurrentWorkout(workout.map(ex => ({
      name: ex.name, muscles: ex.muscles.primary, pattern: ex.pattern, sets: ex.sets,
    })));
  }, [workout]);

  const handleMuscleSelect = (id) => {
    setSelectedMuscle(id);
    setPanelMode('overview');
    // Auto-switch view if muscle is only visible on back
    if (MUSCLE_DEFS[id] && !MUSCLE_DEFS[id].front && MUSCLE_DEFS[id].back) setMapView('back');
    if (MUSCLE_DEFS[id] && MUSCLE_DEFS[id].front && !MUSCLE_DEFS[id].back) setMapView('front');
  };

  const handleAddExercise = () => setPanelMode('picker');

  const handlePickerSelect = (exercise) => {
    const inWorkout = workout.find(e => e.id === exercise.id);
    setConfigExercise(exercise);
    setConfigInitSets(inWorkout ? inWorkout.sets : null);
    setPanelMode('setconfig');
  };

  const handleSetConfigConfirm = (exercise, sets) => {
    const inWorkout = workout.find(e => e.id === exercise.id);
    if (inWorkout) {
      setWorkout(prev => prev.map(e => e.id === exercise.id ? { ...e, sets } : e));
    } else {
      setWorkout(prev => [...prev, { ...exercise, sets }]);
    }
    setPanelMode('overview');
  };

  const handleRemoveExercise = (id) => {
    setWorkout(prev => prev.filter(e => e.id !== id));
  };

  const handleEditExercise = (exercise) => {
    const inWorkout = workout.find(e => e.id === exercise.id);
    setConfigExercise(exercise);
    setConfigInitSets(inWorkout ? inWorkout.sets : null);
    setPanelMode('setconfig');
  };

  const handleSave = () => {
    if (workout.length === 0) return;
    actions.logSession(workout.map(ex => ({ name: ex.name, muscles: ex.muscles.primary, sets: ex.sets })));
    setSaved(true); setGemFlash(true);
    setTimeout(() => setGemFlash(false), 2500);
    setTimeout(() => { setSaved(false); setWorkout([]); setSelectedMuscle(null); setPanelMode('empty'); }, 3000);
  };

  return (
    <section style={{ minHeight: '100vh', background: D.page }}>
      <div style={{ maxWidth: 1080, margin: '0 auto', padding: '96px 28px 120px' }}>

        {/* Gem flash */}
        {gemFlash && (
          <div style={{ position: 'fixed', top: 80, right: 32, zIndex: 300, background: '#0F1A2E', color: '#FAFAF7', padding: '10px 20px', borderRadius: 999, fontFamily: '"Inter",system-ui', fontSize: 14, fontWeight: 700, animation: 'fadeIn 0.3s ease', boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}>
            💎 +30 gemas · Sesión registrada
          </div>
        )}

        {/* Header */}
        <div style={{ marginBottom: 48 }}>
          <span style={{ fontFamily: 'ui-monospace,Menlo,monospace', fontSize: 10, fontWeight: 700, letterSpacing: 1.8, textTransform: 'uppercase', color: D.muted }}>
            Atlas Builder
          </span>
          <h1 style={{ fontFamily: '"Inter",system-ui', fontSize: 40, fontWeight: 800, color: D.text, letterSpacing: -2, lineHeight: 1, margin: '10px 0 0' }}>
            Tu sesión de hoy.{' '}
            <span style={{ fontFamily: '"Instrument Serif",serif', fontStyle: 'italic', fontWeight: 400, color: D.mid }}>
              Toca un músculo.
            </span>
          </h1>
        </div>

        {/* Two-column layout */}
        <div style={{ display: 'flex', gap: 48, alignItems: 'flex-start', flexWrap: 'wrap' }}>

          {/* LEFT: Body map */}
          <div style={{ flex: '0 0 260px', minWidth: 220 }}>

            {/* Front / back toggle */}
            <div style={{ display: 'flex', gap: 3, marginBottom: 20, background: 'rgba(255,255,255,0.04)', borderRadius: 10, padding: 3 }}>
              {[['front', 'Frontal'], ['back', 'Posterior']].map(([v, lbl]) => (
                <button
                  key={v}
                  onClick={() => setMapView(v)}
                  style={{
                    flex: 1, padding: '7px 0', borderRadius: 8, border: 'none', cursor: 'pointer',
                    background: mapView === v ? D.accent : 'transparent',
                    color: mapView === v ? '#fff' : D.muted,
                    fontFamily: '"Inter",system-ui', fontSize: 11, fontWeight: 700,
                    transition: 'all 0.14s',
                  }}
                >
                  {lbl}
                </button>
              ))}
            </div>

            {/* SVG body map */}
            <BodyMap
              view={mapView}
              muscleVolumes={muscleVolumes}
              selectedMuscle={selectedMuscle}
              onSelect={handleMuscleSelect}
            />

            {/* Analyze link */}
            {workout.length > 0 && (
              <button
                onClick={() => navigate('/coach')}
                style={{ marginTop: 18, width: '100%', padding: '10px 0', borderRadius: 10, border: '1px solid rgba(42,111,219,0.28)', background: 'rgba(42,111,219,0.08)', color: '#6EA9F0', fontFamily: '"Inter",system-ui', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}
              >
                Analizar con Coach →
              </button>
            )}

            <VolumeLegend />
          </div>

          {/* RIGHT: Contextual panel */}
          <div style={{ flex: 1, minWidth: 280 }}>
            {panelMode === 'empty' && <EmptyState />}

            {panelMode === 'overview' && selectedMuscle && (
              <MuscleOverview
                muscleId={selectedMuscle}
                muscleVolumes={muscleVolumes}
                sessionExercises={sessionExercisesForMuscle}
                log={state.log || []}
                onAdd={handleAddExercise}
                onRemoveEx={handleRemoveExercise}
                onEditEx={handleEditExercise}
              />
            )}

            {panelMode === 'picker' && selectedMuscle && (
              <ExercisePicker
                muscleId={selectedMuscle}
                exercises={muscleExercises}
                sessionExIds={currentExIds}
                onSelect={handlePickerSelect}
                onBack={() => setPanelMode('overview')}
              />
            )}

            {panelMode === 'setconfig' && configExercise && (
              <SetConfigPanel
                key={configExercise.id}
                exercise={configExercise}
                initialSets={configInitSets}
                onConfirm={handleSetConfigConfirm}
                onBack={() => setPanelMode(selectedMuscle ? 'picker' : 'empty')}
              />
            )}
          </div>

        </div>
      </div>

      {/* Sticky bottom workout bar */}
      {workout.length > 0 && (
        <WorkoutBar workout={workout} onSave={handleSave} saved={saved} duration={duration} />
      )}
    </section>
  );
}

Object.assign(window, { BuilderSection });
