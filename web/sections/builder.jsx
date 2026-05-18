// Builder — body map → muscle → exercise visual flow

// ── Theme ─────────────────────────────────────────────────────────────────────
const D = {
  page:    '#060D18',
  panel:   '#0C1524',
  card:    '#111E30',
  cardHov: '#162236',
  border:  'rgba(255,255,255,0.07)',
  text:    '#E8EDF8',
  mid:     'rgba(232,237,248,0.55)',
  muted:   'rgba(232,237,248,0.28)',
  accent:  '#2A6FDB',
  success: '#22C55E',
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

const MUSCLE_VOL_RE = [
  [/pectoral/i,                                              'pecho'],
  [/dorsal|romboid|serrato|trapecio|erector/i,              'espalda'],
  [/deltoid/i,                                               'hombro'],
  [/bíceps|biceps/i,                                         'biceps'],
  [/tríceps|triceps/i,                                       'triceps'],
  [/cuádricep|cuadricep|femoral|pantorrilla|gemelo|sóleo/i,  'piernas'],
  [/glút|isquio/i,                                           'gluteos'],
  [/core|transverso|oblicu|abdominal/i,                      'core'],
];

function computeMuscleVolumes(log) {
  const v = { pecho: 0, espalda: 0, hombro: 0, biceps: 0, triceps: 0, piernas: 0, gluteos: 0, core: 0 };
  (log || []).slice(0, 4).forEach(session => {
    (session.exercises || []).forEach(ex => {
      const n = Math.max((ex.sets || []).length, 1);
      (ex.muscles || []).forEach(m => {
        for (const [re, g] of MUSCLE_VOL_RE) { if (re.test(m)) { v[g] += n; break; } }
      });
    });
  });
  return v;
}

function computeFrequency(muscleId, log) {
  const MAP = {
    pecho:   /pectoral/i,    espalda: /dorsal|romboid|trapecio/i,
    hombro:  /deltoid/i,     biceps:  /bíceps|biceps/i,
    triceps: /tríceps|triceps/i,
    piernas: /cuádricep|femoral|pantorrilla/i,
    gluteos: /glút|isquio/i, core: /core|transverso|oblicu/i,
  };
  const re = MAP[muscleId];
  if (!re) return 0;
  return (log || []).slice(0, 4).filter(s =>
    (s.exercises || []).some(ex => (ex.muscles || []).some(m => re.test(m)))
  ).length;
}

function fatigueLevel(sets) {
  if (sets <= 5)  return { label: 'Baja',    color: D.success };
  if (sets <= 12) return { label: 'Moderada', color: '#F59E0B' };
  if (sets <= 20) return { label: 'Alta',    color: '#F97316' };
  return             { label: 'Exceso',  color: '#EF4444' };
}

function estimateDuration(workout) {
  const sets = workout.reduce((s, ex) => s + ex.sets.length, 0);
  return Math.round((workout.length > 0 ? 5 : 0) + sets * 2.5);
}

function useWindowWidth() {
  const [w, setW] = React.useState(window.innerWidth);
  React.useEffect(() => {
    const h = () => setW(window.innerWidth);
    window.addEventListener('resize', h);
    return () => window.removeEventListener('resize', h);
  }, []);
  return w;
}

// ── Anatomical SVG body map ───────────────────────────────────────────────────
function BodyMap({ view, muscleVolumes, selectedMuscle, onSelect }) {
  const [hov, setHov] = React.useState(null);

  function color(id) {
    const isSel = selectedMuscle === id;
    const isHov = hov === id;
    const sets = muscleVolumes[id] || 0;
    if (isSel) return { fill: '#2A6FDB',                   stroke: '#7AB4FF', sw: 2   };
    if (isHov) return { fill: 'rgba(42,111,219,0.44)',     stroke: 'rgba(110,169,240,0.72)', sw: 1.5 };
    if (sets === 0) return { fill: 'rgba(255,255,255,0.07)', stroke: 'rgba(255,255,255,0.14)', sw: 0.5 };
    if (sets < 6)   return { fill: 'rgba(42,111,219,0.28)',  stroke: 'rgba(42,111,219,0.48)', sw: 0.5 };
    if (sets < 16)  return { fill: 'rgba(42,111,219,0.60)',  stroke: 'rgba(42,111,219,0.80)', sw: 0.5 };
    return                  { fill: 'rgba(220,60,60,0.40)',  stroke: 'rgba(220,80,60,0.64)', sw: 0.5 };
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

  const sf = 'rgba(255,255,255,0.05)';
  const ss = 'rgba(255,255,255,0.09)';
  const bsw = 0.5;
  const lbl = hov ? MUSCLE_DEFS[hov]?.label : selectedMuscle ? MUSCLE_DEFS[selectedMuscle]?.label : null;

  return (
    <svg viewBox="0 0 200 430" style={{ width: '100%', maxWidth: 240, display: 'block', margin: '0 auto' }}>
      {/* ── Silhouette ── */}
      <circle cx="100" cy="29" r="21" fill={sf} stroke={ss} strokeWidth={bsw} />
      <rect x="91" y="49" width="18" height="17" rx="5" fill={sf} stroke="none" />
      <path d="M58,65 L142,65 C146,96 147,138 141,170 L128,185 L72,185 L59,170 C53,138 54,96 58,65Z" fill={sf} stroke={ss} strokeWidth={bsw} />
      <ellipse cx="46"  cy="112" rx="11" ry="35" fill={sf} stroke={ss} strokeWidth={bsw} />
      <ellipse cx="154" cy="112" rx="11" ry="35" fill={sf} stroke={ss} strokeWidth={bsw} />
      <ellipse cx="38"  cy="168" rx="9"  ry="26" fill={sf} stroke={ss} strokeWidth={bsw} />
      <ellipse cx="162" cy="168" rx="9"  ry="26" fill={sf} stroke={ss} strokeWidth={bsw} />
      <ellipse cx="79"  cy="257" rx="19" ry="44" fill={sf} stroke={ss} strokeWidth={bsw} />
      <ellipse cx="121" cy="257" rx="19" ry="44" fill={sf} stroke={ss} strokeWidth={bsw} />
      <ellipse cx="79"  cy="356" rx="13" ry="32" fill={sf} stroke={ss} strokeWidth={bsw} />
      <ellipse cx="121" cy="356" rx="13" ry="32" fill={sf} stroke={ss} strokeWidth={bsw} />
      <ellipse cx="79"  cy="402" rx="12" ry="8"  fill={sf} stroke={ss} strokeWidth={bsw} />
      <ellipse cx="121" cy="402" rx="12" ry="8"  fill={sf} stroke={ss} strokeWidth={bsw} />

      {/* ── Interactive muscle regions ── */}
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
      {lbl && (
        <text x="100" y="424" textAnchor="middle" fill="rgba(232,237,248,0.55)" fontSize="11" fontFamily="Inter, system-ui" fontWeight="700" letterSpacing="0.5">
          {lbl}
        </text>
      )}
    </svg>
  );
}

// ── Volume legend dots ────────────────────────────────────────────────────────
function VolumeLegend() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginTop: 16 }}>
      {[
        { c: 'rgba(255,255,255,0.14)', l: 'Sin trabajo' },
        { c: 'rgba(42,111,219,0.40)',  l: 'Trabajado' },
        { c: 'rgba(42,111,219,0.78)',  l: 'Alto volumen' },
        { c: 'rgba(220,60,60,0.48)',   l: 'Exceso' },
      ].map(({ c, l }) => (
        <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <div style={{ width: 9, height: 9, borderRadius: 3, background: c, flexShrink: 0 }} />
          <span style={{ fontFamily: '"Inter",system-ui', fontSize: 10, color: D.muted }}>{l}</span>
        </div>
      ))}
    </div>
  );
}

// ── Visual exercise card (uses ExerciseMedia.Thumbnail SVG illustrations) ─────
function ExerciseVisualCard({ exercise, isAdded, isInSession, onClick }) {
  const [hov, setHov] = React.useState(false);
  const group = getExerciseGroup(exercise);

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        borderRadius: 16, cursor: 'pointer', overflow: 'hidden',
        border: `1.5px solid ${isInSession ? 'rgba(34,197,94,0.32)' : hov ? 'rgba(42,111,219,0.40)' : D.border}`,
        transition: 'border-color 0.12s, transform 0.12s',
        transform: hov && !isInSession ? 'translateY(-2px)' : 'none',
        background: D.card,
      }}
    >
      <ExerciseMedia.Thumbnail exercise={exercise} group={group} isAdded={isInSession} height={100} />
      <div style={{ padding: '10px 12px 12px' }}>
        <div style={{ fontFamily: '"Inter",system-ui', fontSize: 12, fontWeight: 700, color: D.text, lineHeight: 1.3, marginBottom: 4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {exercise.name}
        </div>
        <div style={{ fontFamily: '"Inter",system-ui', fontSize: 10, color: D.muted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {exercise.muscles.primary[0]}
        </div>
      </div>
    </div>
  );
}

// ── Session exercise row (muscle overview) ────────────────────────────────────
function SessionExRow({ workoutEx, onRemove, onEdit }) {
  const [hov, setHov] = React.useState(false);
  const group = getExerciseGroup(workoutEx);
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{ display: 'flex', alignItems: 'center', gap: 0, borderRadius: 14, overflow: 'hidden', background: hov ? D.cardHov : D.card, border: `1px solid ${D.border}`, marginBottom: 8, cursor: 'pointer', transition: 'background 0.12s' }}
      onClick={onEdit}
    >
      {/* Mini thumbnail strip */}
      <div style={{ width: 56, flexShrink: 0 }}>
        <ExerciseMedia.Thumbnail exercise={workoutEx} group={group} isAdded={false} height={56} />
      </div>
      <div style={{ flex: 1, padding: '0 12px', minWidth: 0 }}>
        <div style={{ fontFamily: '"Inter",system-ui', fontSize: 12, fontWeight: 700, color: D.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{workoutEx.name}</div>
        <div style={{ fontFamily: '"Inter",system-ui', fontSize: 10, color: D.muted, marginTop: 2 }}>
          {workoutEx.sets.length} serie{workoutEx.sets.length !== 1 ? 's' : ''}
          {workoutEx.sets[0]?.kg ? ` · ${workoutEx.sets[0].kg} kg` : ''}
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingRight: 12 }}>
        <span style={{ fontFamily: 'ui-monospace,Menlo,monospace', fontSize: 10, color: D.success }}>✓</span>
        <button
          onClick={e => { e.stopPropagation(); onRemove(); }}
          style={{ width: 26, height: 26, borderRadius: 8, border: 'none', background: 'rgba(220,60,60,0.14)', color: 'rgba(220,60,60,0.80)', cursor: 'pointer', fontSize: 11, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >✕</button>
      </div>
    </div>
  );
}

// ── Muscle overview ───────────────────────────────────────────────────────────
function MuscleOverview({ muscleId, muscleVolumes, sessionExercises, log, onAdd, onRemoveEx, onEditEx }) {
  const def  = MUSCLE_DEFS[muscleId] || {};
  const sets = muscleVolumes[muscleId] || 0;
  const fat  = fatigueLevel(sets);
  const freq = computeFrequency(muscleId, log);

  return (
    <div style={{ animation: 'fadeIn 0.2s ease' }}>
      <h2 style={{ fontFamily: '"Inter",system-ui', fontSize: 36, fontWeight: 900, color: D.text, margin: '0 0 6px', letterSpacing: -2 }}>
        {def.label}
      </h2>

      {/* Stats row */}
      <div style={{ display: 'flex', gap: 28, marginBottom: 28, paddingBottom: 24, borderBottom: `1px solid ${D.border}` }}>
        <div>
          <div style={{ fontFamily: '"Inter",system-ui', fontSize: 30, fontWeight: 800, color: D.text, letterSpacing: -1.5, lineHeight: 1 }}>{sets || '—'}</div>
          <div style={{ fontFamily: '"Inter",system-ui', fontSize: 10, color: D.muted, marginTop: 4 }}>series esta semana</div>
        </div>
        <div>
          <div style={{ fontFamily: '"Inter",system-ui', fontSize: 30, fontWeight: 800, color: fat.color, letterSpacing: -1.5, lineHeight: 1 }}>{fat.label}</div>
          <div style={{ fontFamily: '"Inter",system-ui', fontSize: 10, color: D.muted, marginTop: 4 }}>fatiga</div>
        </div>
        <div>
          <div style={{ fontFamily: '"Inter",system-ui', fontSize: 30, fontWeight: 800, color: D.text, letterSpacing: -1.5, lineHeight: 1 }}>{freq > 0 ? `${freq}×` : '—'}</div>
          <div style={{ fontFamily: '"Inter",system-ui', fontSize: 10, color: D.muted, marginTop: 4 }}>frecuencia</div>
        </div>
      </div>

      {/* Session exercises */}
      {sessionExercises.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontFamily: 'ui-monospace,Menlo,monospace', fontSize: 9, fontWeight: 700, color: D.muted, letterSpacing: 1, marginBottom: 10 }}>
            EN TU SESIÓN
          </div>
          {sessionExercises.map(ex => (
            <SessionExRow key={ex.id} workoutEx={ex} onRemove={() => onRemoveEx(ex.id)} onEdit={() => onEditEx(ex)} />
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
          boxShadow: '0 8px 28px -8px rgba(42,111,219,0.55)',
        }}
      >
        <span style={{ fontSize: 18, lineHeight: 1, fontWeight: 300 }}>+</span>
        Añadir ejercicio
      </button>

      {/* Contextual tip */}
      {sets === 0 && (
        <p style={{ fontFamily: '"Inter",system-ui', fontSize: 12, color: D.muted, lineHeight: 1.6, margin: '18px 0 0' }}>
          Sin trabajo de {def.label.toLowerCase()} esta semana. Atlas Coach detectará el desequilibrio.
        </p>
      )}
    </div>
  );
}

// ── Exercise picker ───────────────────────────────────────────────────────────
function ExercisePicker({ muscleId, exercises, sessionExIds, onSelect, onBack }) {
  const def = MUSCLE_DEFS[muscleId] || {};
  return (
    <div style={{ animation: 'fadeIn 0.18s ease', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <button onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', padding: '4px 0', marginBottom: 18, fontFamily: '"Inter",system-ui', fontSize: 12, color: D.mid, fontWeight: 600, flexShrink: 0 }}>
        ← {def.label}
      </button>
      <div style={{ fontFamily: '"Inter",system-ui', fontSize: 18, fontWeight: 700, color: D.text, marginBottom: 16, letterSpacing: -0.5, flexShrink: 0 }}>
        Elige un ejercicio
      </div>
      <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 8 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
          {exercises.map(ex => (
            <ExerciseVisualCard
              key={ex.id}
              exercise={ex}
              isAdded={false}
              isInSession={sessionExIds.has(ex.id)}
              onClick={() => onSelect(ex)}
            />
          ))}
          {exercises.length === 0 && (
            <div style={{ gridColumn: '1/-1', padding: '40px 0', textAlign: 'center', fontFamily: '"Inter",system-ui', fontSize: 13, color: D.muted }}>
              Sin ejercicios en esta categoría
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Set configuration ─────────────────────────────────────────────────────────
function SetConfigPanel({ exercise, initialSets, onConfirm, onBack }) {
  const [sets, setSets] = React.useState(() =>
    initialSets && initialSets.length > 0
      ? initialSets.map(s => ({ kg: s.kg || '', reps: s.reps || '10', rest: '90', rir: '' }))
      : [
          { kg: '', reps: '10', rest: '90', rir: '' },
          { kg: '', reps: '10', rest: '90', rir: '' },
          { kg: '', reps: '10', rest: '90', rir: '' },
        ]
  );

  const upd = (i, f, v) => setSets(prev => prev.map((s, idx) => idx === i ? { ...s, [f]: v } : s));
  const add = () => setSets(prev => [...prev, { kg: '', reps: '10', rest: '90', rir: '' }]);
  const rem = (i) => setSets(prev => prev.filter((_, idx) => idx !== i));
  const group = getExerciseGroup(exercise);

  return (
    <div style={{ animation: 'fadeIn 0.18s ease', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <button onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', padding: '4px 0', marginBottom: 16, fontFamily: '"Inter",system-ui', fontSize: 12, color: D.mid, fontWeight: 600, flexShrink: 0 }}>
        ← Volver
      </button>

      {/* Exercise visual header */}
      <div style={{ borderRadius: 16, overflow: 'hidden', marginBottom: 20, flexShrink: 0 }}>
        <ExerciseMedia.Thumbnail exercise={exercise} group={group} isAdded={false} height={130} />
        <div style={{ padding: '12px 14px', background: D.card }}>
          <div style={{ fontFamily: '"Inter",system-ui', fontSize: 16, fontWeight: 700, color: D.text, letterSpacing: -0.3 }}>{exercise.name}</div>
          <div style={{ fontFamily: '"Inter",system-ui', fontSize: 11, color: D.muted, marginTop: 3 }}>{exercise.muscles.primary.join(' · ')}</div>
        </div>
      </div>

      {/* Sets */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '18px 1fr 1fr 18px', gap: 6, marginBottom: 8 }}>
          {['', 'Kg', 'Reps', ''].map((h, i) => (
            <span key={i} style={{ fontFamily: 'ui-monospace,Menlo,monospace', fontSize: 8, color: D.muted, fontWeight: 700, textAlign: 'center', letterSpacing: 0.5 }}>{h}</span>
          ))}
        </div>
        {sets.map((set, i) => (
          <div key={i} style={{ display: 'grid', gridTemplateColumns: '18px 1fr 1fr 18px', gap: 6, alignItems: 'center', marginBottom: 7 }}>
            <span style={{ fontFamily: 'ui-monospace,Menlo,monospace', fontSize: 10, color: D.muted, textAlign: 'center' }}>{i + 1}</span>
            <input type="number" value={set.kg} placeholder="—" onChange={e => upd(i, 'kg', e.target.value)} min={0} step={0.5}
              style={{ width: '100%', padding: '10px 6px', borderRadius: 10, boxSizing: 'border-box', border: `1px solid ${D.border}`, background: 'rgba(255,255,255,0.04)', fontFamily: 'ui-monospace,Menlo,monospace', fontSize: 14, color: D.text, textAlign: 'center' }} />
            <input type="number" value={set.reps} placeholder="10" onChange={e => upd(i, 'reps', e.target.value)} min={1} step={1}
              style={{ width: '100%', padding: '10px 6px', borderRadius: 10, boxSizing: 'border-box', border: `1px solid ${D.border}`, background: 'rgba(255,255,255,0.04)', fontFamily: 'ui-monospace,Menlo,monospace', fontSize: 14, color: D.text, textAlign: 'center' }} />
            {sets.length > 1
              ? <button onClick={() => rem(i)} style={{ width: 18, height: 18, border: 'none', background: 'rgba(220,60,60,0.14)', color: 'rgba(220,80,60,0.8)', borderRadius: 4, cursor: 'pointer', fontSize: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}>✕</button>
              : <div />}
          </div>
        ))}
        <button onClick={add} style={{ marginTop: 4, marginBottom: 20, padding: '7px 14px', borderRadius: 9, border: `1px dashed rgba(255,255,255,0.15)`, background: 'transparent', cursor: 'pointer', fontFamily: '"Inter",system-ui', fontSize: 11, fontWeight: 600, color: D.mid }}>
          + Serie
        </button>
        <button
          onClick={() => onConfirm(exercise, sets)}
          style={{ width: '100%', padding: '14px 20px', borderRadius: 14, cursor: 'pointer', background: D.accent, color: '#fff', border: 'none', fontFamily: '"Inter",system-ui', fontSize: 14, fontWeight: 700, letterSpacing: -0.2, boxShadow: '0 8px 28px -8px rgba(42,111,219,0.5)', marginBottom: 4 }}
        >
          Añadir · {sets.length} serie{sets.length !== 1 ? 's' : ''} →
        </button>
      </div>
    </div>
  );
}

// ── Workout bar (sticky bottom) ───────────────────────────────────────────────
function WorkoutBar({ workout, onSave, saved, duration, isMobile }) {
  return (
    <div style={{
      position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 200,
      background: 'rgba(6,13,24,0.96)', backdropFilter: 'blur(24px)',
      borderTop: '1px solid rgba(255,255,255,0.08)',
      padding: isMobile ? '12px 16px' : '12px 32px',
      display: 'flex', alignItems: 'center', gap: 12,
    }}>
      <div style={{ flex: 1, display: 'flex', gap: 6, overflow: 'hidden' }}>
        {workout.slice(0, isMobile ? 2 : 5).map(ex => {
          const gs = ExerciseMedia.GROUP_STYLE[getExerciseGroup(ex)] || ExerciseMedia.GROUP_STYLE.core;
          return (
            <span key={ex.id} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 10px', borderRadius: 999, flexShrink: 0, background: 'rgba(255,255,255,0.06)', border: `1px solid ${D.border}`, fontFamily: '"Inter",system-ui', fontSize: 11, fontWeight: 600, color: D.mid, overflow: 'hidden', maxWidth: 140 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: gs.to, flexShrink: 0 }} />
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ex.name}</span>
            </span>
          );
        })}
        {workout.length > (isMobile ? 2 : 5) && (
          <span style={{ padding: '5px 10px', borderRadius: 999, flexShrink: 0, background: 'rgba(255,255,255,0.04)', fontFamily: '"Inter",system-ui', fontSize: 11, color: D.muted }}>
            +{workout.length - (isMobile ? 2 : 5)}
          </span>
        )}
      </div>
      <span style={{ fontFamily: 'ui-monospace,Menlo,monospace', fontSize: 11, color: D.muted, flexShrink: 0, display: isMobile ? 'none' : 'block' }}>
        ~{duration} min
      </span>
      <button
        onClick={onSave}
        style={{ flexShrink: 0, padding: '11px 20px', borderRadius: 12, border: 'none', cursor: 'pointer', background: saved ? 'rgba(34,197,94,0.15)' : D.accent, color: saved ? D.success : '#fff', fontFamily: '"Inter",system-ui', fontSize: 13, fontWeight: 700, transition: 'all 0.25s', whiteSpace: 'nowrap' }}
      >
        {saved ? '✓ +30 💎' : 'Guardar +30 💎'}
      </button>
    </div>
  );
}

// ── Empty state ───────────────────────────────────────────────────────────────
function MapEmptyState({ onSelectMuscle }) {
  return (
    <div style={{ paddingTop: 20 }}>
      <div style={{ fontFamily: '"Instrument Serif",serif', fontStyle: 'italic', fontSize: 26, color: D.mid, marginBottom: 12 }}>
        Toca un músculo
      </div>
      <p style={{ fontFamily: '"Inter",system-ui', fontSize: 14, color: D.muted, lineHeight: 1.65, margin: '0 0 24px', maxWidth: 320 }}>
        Selecciona un grupo en el mapa para ver series, fatiga y ejercicios disponibles.
      </p>
      {/* Quick-pick pills */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {Object.entries(MUSCLE_DEFS).map(([id, def]) => (
          <button
            key={id}
            onClick={() => onSelectMuscle(id)}
            style={{ padding: '7px 14px', borderRadius: 999, background: 'rgba(255,255,255,0.04)', border: `1px solid ${D.border}`, fontFamily: '"Inter",system-ui', fontSize: 12, fontWeight: 600, color: D.muted, cursor: 'pointer', transition: 'background 0.12s, color 0.12s' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(42,111,219,0.14)'; e.currentTarget.style.color = '#6EA9F0'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = D.muted; }}
          >
            {def.label}
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Main section ──────────────────────────────────────────────────────────────
function BuilderSection() {
  const { state, actions } = useStore();
  const { navigate } = useRoute();
  const width = useWindowWidth();
  const isMobile = width < 680;

  const [mapView,        setMapView]        = React.useState('front');
  const [selectedMuscle, setSelectedMuscle] = React.useState(null);
  const [panelMode,      setPanelMode]      = React.useState('empty');
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

  // Sync to store for Atlas Coach live analysis
  React.useEffect(() => {
    actions.setCurrentWorkout(workout.map(ex => ({
      name: ex.name, muscles: ex.muscles.primary, pattern: ex.pattern, sets: ex.sets,
    })));
  }, [workout]);

  const handleMuscleSelect = (id) => {
    setSelectedMuscle(id);
    setPanelMode('overview');
    if (MUSCLE_DEFS[id] && !MUSCLE_DEFS[id].front && MUSCLE_DEFS[id].back) setMapView('back');
    if (MUSCLE_DEFS[id] && MUSCLE_DEFS[id].front && !MUSCLE_DEFS[id].back) setMapView('front');
  };

  const handlePickerSelect = (exercise) => {
    setConfigExercise(exercise);
    setConfigInitSets(workout.find(e => e.id === exercise.id)?.sets || null);
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

  const handleRemoveExercise = (id) => setWorkout(prev => prev.filter(e => e.id !== id));

  const handleEditExercise = (exercise) => {
    setConfigExercise(exercise);
    setConfigInitSets(workout.find(e => e.id === exercise.id)?.sets || null);
    setPanelMode('setconfig');
  };

  const handleSave = () => {
    if (workout.length === 0) return;
    actions.logSession(workout.map(ex => ({ name: ex.name, muscles: ex.muscles.primary, sets: ex.sets })));
    setSaved(true); setGemFlash(true);
    setTimeout(() => setGemFlash(false), 2500);
    setTimeout(() => { setSaved(false); setWorkout([]); setSelectedMuscle(null); setPanelMode('empty'); }, 3000);
  };

  // Left column width adapts to screen
  const leftW = isMobile ? '100%' : 280;
  const rightW = isMobile ? '100%' : 'calc(100% - 280px - 48px)';

  return (
    <section style={{ minHeight: '100vh', background: D.page }}>
      <div style={{ maxWidth: 1080, margin: '0 auto', padding: isMobile ? '72px 16px 120px' : '96px 28px 120px' }}>

        {/* Gem flash */}
        {gemFlash && (
          <div style={{ position: 'fixed', top: 72, right: 20, zIndex: 300, background: '#0F1A2E', color: '#FAFAF7', padding: '10px 18px', borderRadius: 999, fontFamily: '"Inter",system-ui', fontSize: 13, fontWeight: 700, animation: 'fadeIn 0.3s ease', boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}>
            💎 +30 gemas · Sesión guardada
          </div>
        )}

        {/* Page header */}
        <div style={{ marginBottom: isMobile ? 24 : 40 }}>
          <h1 style={{ fontFamily: '"Inter",system-ui', fontSize: isMobile ? 32 : 40, fontWeight: 900, color: D.text, letterSpacing: -2, lineHeight: 1, margin: '0 0 6px' }}>
            Tu sesión.{' '}
            <span style={{ fontFamily: '"Instrument Serif",serif', fontStyle: 'italic', fontWeight: 400, color: D.mid, letterSpacing: -1 }}>
              Toca un músculo.
            </span>
          </h1>
        </div>

        {/* Layout */}
        <div style={{ display: 'flex', gap: 48, alignItems: 'flex-start', flexWrap: isMobile ? 'wrap' : 'nowrap' }}>

          {/* LEFT: Body map */}
          <div style={{ width: leftW, flexShrink: 0 }}>
            {/* Front / back toggle */}
            <div style={{ display: 'flex', gap: 3, marginBottom: 16, background: 'rgba(255,255,255,0.04)', borderRadius: 10, padding: 3 }}>
              {[['front', 'Frontal'], ['back', 'Posterior']].map(([v, lbl]) => (
                <button key={v} onClick={() => setMapView(v)} style={{ flex: 1, padding: '7px 0', borderRadius: 7, border: 'none', cursor: 'pointer', background: mapView === v ? D.accent : 'transparent', color: mapView === v ? '#fff' : D.muted, fontFamily: '"Inter",system-ui', fontSize: 11, fontWeight: 700, transition: 'all 0.14s' }}>
                  {lbl}
                </button>
              ))}
            </div>

            {/* SVG (compact on mobile) */}
            <div style={{ maxWidth: isMobile ? 200 : 'none', margin: isMobile ? '0 auto' : '0' }}>
              <BodyMap view={mapView} muscleVolumes={muscleVolumes} selectedMuscle={selectedMuscle} onSelect={handleMuscleSelect} />
            </div>

            {/* Coach link */}
            {workout.length > 0 && (
              <button onClick={() => navigate('/coach')} style={{ marginTop: 16, width: '100%', padding: '10px 0', borderRadius: 10, border: '1px solid rgba(42,111,219,0.28)', background: 'rgba(42,111,219,0.08)', color: '#6EA9F0', fontFamily: '"Inter",system-ui', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                Analizar con Coach →
              </button>
            )}

            {!isMobile && <VolumeLegend />}
          </div>

          {/* RIGHT: Contextual panel */}
          <div style={{ flex: 1, minWidth: 0, width: isMobile ? '100%' : undefined, maxHeight: isMobile ? 'none' : 680, overflowY: isMobile ? 'visible' : 'auto' }}>

            {panelMode === 'empty' && (
              <MapEmptyState onSelectMuscle={handleMuscleSelect} />
            )}

            {panelMode === 'overview' && selectedMuscle && (
              <MuscleOverview
                muscleId={selectedMuscle}
                muscleVolumes={muscleVolumes}
                sessionExercises={sessionExercisesForMuscle}
                log={state.log || []}
                onAdd={() => setPanelMode('picker')}
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

      {/* Sticky workout bar */}
      {workout.length > 0 && (
        <WorkoutBar workout={workout} onSave={handleSave} saved={saved} duration={duration} isMobile={isMobile} />
      )}
    </section>
  );
}

Object.assign(window, { BuilderSection });
