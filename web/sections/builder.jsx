// Builder — anatomical body map + 3-column workout builder

const D = {
  pageBg:    '#060D18',
  panelL:    '#0A1321',
  panelC:    '#070E1B',
  panelR:    '#0A1321',
  card:      '#0F1929',
  cardHover: '#131E30',
  border:    'rgba(255,255,255,0.07)',
  borderMid: 'rgba(255,255,255,0.12)',
  text:      '#E8EDF8',
  textMid:   'rgba(232,237,248,0.55)',
  textMuted: 'rgba(232,237,248,0.28)',
  accent:    '#2A6FDB',
  success:   '#22C55E',
};

const EXERCISE_GROUPS = [
  { id: 'all',     label: 'Todos',   groups: null },
  { id: 'pecho',   label: 'Pecho',   groups: ['pecho'] },
  { id: 'espalda', label: 'Espalda', groups: ['espalda'] },
  { id: 'pierna',  label: 'Piernas', groups: ['pierna'] },
  { id: 'hombro',  label: 'Hombros', groups: ['hombro'] },
  { id: 'brazos',  label: 'Brazos',  groups: ['biceps', 'triceps'] },
  { id: 'core',    label: 'Core',    groups: ['core'] },
];

const MUSCLE_LABELS = {
  pecho:   'Pecho',
  espalda: 'Espalda',
  hombro:  'Hombros',
  brazos:  'Brazos',
  pierna:  'Piernas',
  core:    'Core',
};

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

function estimateDuration(workout) {
  const totalSets = workout.reduce((s, ex) => s + ex.sets.length, 0);
  return Math.round((workout.length > 0 ? 5 : 0) + totalSets * 2.5);
}

// ── Weekly volume per muscle group from log ───────────────────────────────────
function computeGroupVolumes(log) {
  const vols = { pecho: 0, espalda: 0, hombro: 0, brazos: 0, pierna: 0, core: 0 };
  const MAP = [
    [/pectoral/i,                                           'pecho'],
    [/dorsal|romboid|serrato/i,                             'espalda'],
    [/trapecio/i,                                           'espalda'],
    [/deltoid/i,                                            'hombro'],
    [/bíceps|biceps|braquial/i,                             'brazos'],
    [/tríceps|triceps/i,                                    'brazos'],
    [/cuádricep|cuadricep|isquio|glút|femoral|gemelo|sóleo|pantorrilla/i, 'pierna'],
    [/core|transverso|oblicu|abdominal/i,                   'core'],
  ];
  (log || []).slice(0, 4).forEach(session => {
    (session.exercises || []).forEach(ex => {
      const muscles = ex.muscles || [];
      const setCount = Math.max((ex.sets || []).length, 1);
      muscles.forEach(m => {
        for (const [re, group] of MAP) {
          if (re.test(m)) { vols[group] += setCount; break; }
        }
      });
    });
  });
  return vols;
}

// ── Mini thumbnail ────────────────────────────────────────────────────────────
function MiniThumb({ exercise, group }) {
  const gs = ExerciseMedia.GROUP_STYLE[group] || ExerciseMedia.GROUP_STYLE.core;
  return (
    <div style={{
      width: 48, height: 48, borderRadius: 10, flexShrink: 0,
      background: `linear-gradient(140deg, ${gs.from}, ${gs.to})`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      overflow: 'hidden', position: 'relative',
    }}>
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'radial-gradient(rgba(255,255,255,0.06) 1px, transparent 1px)',
        backgroundSize: '10px 10px',
      }} />
      <span style={{
        fontFamily: '"Instrument Serif",serif', fontStyle: 'italic',
        fontSize: 22, color: 'rgba(255,255,255,0.35)', position: 'relative', zIndex: 1,
      }}>
        {exercise.name.charAt(0)}
      </span>
    </div>
  );
}

// ── Level dots ────────────────────────────────────────────────────────────────
function LevelDots({ level }) {
  const n = { principiante: 1, intermedio: 2, avanzado: 3 }[level] || 1;
  return (
    <div style={{ display: 'flex', gap: 2, flexShrink: 0 }}>
      {[1, 2, 3].map(i => (
        <div key={i} style={{
          width: 5, height: 5, borderRadius: '50%',
          background: i <= n ? D.accent : 'rgba(255,255,255,0.12)',
        }} />
      ))}
    </div>
  );
}

// ── Metric bar ────────────────────────────────────────────────────────────────
function MetricBar({ label, value, max = 5, color }) {
  return (
    <div style={{ marginBottom: 9 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
        <span style={{ fontFamily: 'ui-monospace,Menlo,monospace', fontSize: 9, color: D.textMuted, fontWeight: 700, letterSpacing: 0.6 }}>{label}</span>
        <span style={{ fontFamily: 'ui-monospace,Menlo,monospace', fontSize: 9, color, fontWeight: 700 }}>{value}/{max}</span>
      </div>
      <div style={{ height: 3, borderRadius: 999, background: 'rgba(255,255,255,0.07)' }}>
        <div style={{ height: '100%', borderRadius: 999, background: color, width: `${(value / max) * 100}%`, transition: 'width 0.3s' }} />
      </div>
    </div>
  );
}

// ── Set row ───────────────────────────────────────────────────────────────────
function SetRow({ idx, set, onChange, onRemove, canRemove }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '20px 1fr 1fr 1fr 1fr 20px', gap: 5, alignItems: 'center', marginBottom: 5 }}>
      <span style={{ fontFamily: 'ui-monospace,Menlo,monospace', fontSize: 10, color: D.textMuted, textAlign: 'center' }}>{idx + 1}</span>
      {['kg', 'reps', 'rir', 'rest'].map(field => (
        <input
          key={field}
          type="number"
          value={set[field]}
          placeholder="—"
          onChange={e => onChange(field, e.target.value)}
          min={0}
          step={field === 'kg' ? 0.5 : 1}
          style={{
            width: '100%', padding: '7px 4px', borderRadius: 8, boxSizing: 'border-box',
            border: `1px solid ${D.border}`, background: 'rgba(255,255,255,0.04)',
            fontFamily: 'ui-monospace,Menlo,monospace', fontSize: 12, color: D.text,
            textAlign: 'center',
          }}
        />
      ))}
      {canRemove ? (
        <button onClick={onRemove} style={{ border: 'none', background: 'none', cursor: 'pointer', color: D.textMuted, fontSize: 13, padding: 0 }}>✕</button>
      ) : <div />}
    </div>
  );
}

// ── Exercise detail view (center panel — exercise selected) ───────────────────
function ExerciseDetailView({ exercise, isAdded, centerSets, setCenterSets, onAddOrUpdate }) {
  const group = getExerciseGroup(exercise);
  const eqMeta = (ExerciseService.META.EQUIPMENT_META[exercise.equipment] || {});

  const variants = exercise.variants
    .map(vid => ExerciseService.getById(vid))
    .filter(Boolean);

  const addSet = () => setCenterSets(prev => [...prev, { kg: '', reps: '', rir: '', rest: '90' }]);
  const removeSet = (idx) => setCenterSets(prev => prev.filter((_, i) => i !== idx));
  const updateSet = (idx, field, value) =>
    setCenterSets(prev => prev.map((s, i) => i === idx ? { ...s, [field]: value } : s));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflowY: 'auto' }}>
      <div style={{ flexShrink: 0 }}>
        <ExerciseMedia.Thumbnail exercise={exercise} group={group} isAdded={isAdded} height={200} />
      </div>
      <div style={{ padding: '18px 20px', flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 12 }}>
          <h2 style={{ fontFamily: '"Inter",system-ui', fontSize: 17, fontWeight: 700, color: D.text, margin: 0, lineHeight: 1.2, letterSpacing: -0.4 }}>
            {exercise.name}
          </h2>
          <span style={{ padding: '4px 10px', borderRadius: 999, flexShrink: 0, background: 'rgba(255,255,255,0.06)', border: `1px solid ${D.border}`, fontFamily: '"Inter",system-ui', fontSize: 9, fontWeight: 700, color: D.textMid, whiteSpace: 'nowrap', textTransform: 'uppercase', letterSpacing: 0.5 }}>
            {eqMeta.label || exercise.equipment}
          </span>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 14 }}>
          {exercise.muscles.primary.map(m => (
            <span key={m} style={{ padding: '3px 8px', borderRadius: 999, background: 'rgba(42,111,219,0.15)', fontFamily: '"Inter",system-ui', fontSize: 10, fontWeight: 600, color: '#6EA9F0' }}>{m}</span>
          ))}
          {exercise.muscles.secondary.map(m => (
            <span key={m} style={{ padding: '3px 8px', borderRadius: 999, background: 'rgba(255,255,255,0.05)', fontFamily: '"Inter",system-ui', fontSize: 10, color: D.textMuted }}>{m}</span>
          ))}
        </div>
        <div style={{ marginBottom: 14 }}>
          <MetricBar label="FATIGA" value={exercise.fatigueLoad} max={5} color="#C24545" />
          <MetricBar label="TÉCNICA" value={exercise.technicalDifficulty} max={5} color={D.accent} />
        </div>
        {exercise.cues && exercise.cues.length > 0 && (
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontFamily: 'ui-monospace,Menlo,monospace', fontSize: 9, color: D.textMuted, fontWeight: 700, letterSpacing: 0.6, marginBottom: 7 }}>PUNTOS CLAVE</div>
            {exercise.cues.map((cue, i) => (
              <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 5, fontFamily: '"Inter",system-ui', fontSize: 11, color: D.textMid, lineHeight: 1.45 }}>
                <span style={{ color: D.accent, flexShrink: 0, marginTop: 1 }}>→</span>
                {cue}
              </div>
            ))}
          </div>
        )}
        {variants.length > 0 && (
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontFamily: 'ui-monospace,Menlo,monospace', fontSize: 9, color: D.textMuted, fontWeight: 700, letterSpacing: 0.6, marginBottom: 7 }}>VARIANTES</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
              {variants.map(v => (
                <span key={v.id} style={{ padding: '3px 9px', borderRadius: 999, background: 'rgba(255,255,255,0.05)', border: `1px solid ${D.border}`, fontFamily: '"Inter",system-ui', fontSize: 10, color: D.textMid }}>{v.name}</span>
              ))}
            </div>
          </div>
        )}
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontFamily: 'ui-monospace,Menlo,monospace', fontSize: 9, color: D.textMuted, fontWeight: 700, letterSpacing: 0.6, marginBottom: 9 }}>CONFIGURAR SERIES</div>
          <div style={{ display: 'grid', gridTemplateColumns: '20px 1fr 1fr 1fr 1fr 20px', gap: 5, marginBottom: 6 }}>
            {['#', 'KG', 'REPS', 'RIR', 'DESC(s)', ''].map((h, i) => (
              <span key={i} style={{ fontFamily: 'ui-monospace,Menlo,monospace', fontSize: 8, color: D.textMuted, textAlign: 'center', fontWeight: 700, letterSpacing: 0.4 }}>{h}</span>
            ))}
          </div>
          {centerSets.map((set, idx) => (
            <SetRow key={idx} idx={idx} set={set} onChange={(field, val) => updateSet(idx, field, val)} onRemove={() => removeSet(idx)} canRemove={centerSets.length > 1} />
          ))}
          <button onClick={addSet} style={{ marginTop: 4, padding: '5px 12px', borderRadius: 7, border: `1px dashed rgba(255,255,255,0.14)`, background: 'transparent', cursor: 'pointer', fontFamily: '"Inter",system-ui', fontSize: 10, fontWeight: 600, color: D.textMid }}>+ Serie</button>
        </div>
        <button
          onClick={onAddOrUpdate}
          style={{
            width: '100%', padding: '13px 20px', borderRadius: 12, cursor: 'pointer',
            background: isAdded ? 'rgba(34,197,94,0.10)' : D.accent,
            color: isAdded ? D.success : '#FFFFFF',
            border: isAdded ? `1px solid rgba(34,197,94,0.28)` : '1px solid transparent',
            fontFamily: '"Inter",system-ui', fontSize: 13, fontWeight: 700, letterSpacing: -0.2, transition: 'all 0.2s',
          }}
        >
          {isAdded ? `✓ Actualizar series en rutina` : `Añadir a rutina · ${centerSets.length} serie${centerSets.length !== 1 ? 's' : ''}`}
        </button>
      </div>
    </div>
  );
}

// ── Routine item (right panel) ────────────────────────────────────────────────
function RoutineItem({ exercise, idx, total, onRemove, onMoveUp, onMoveDown }) {
  const group = getExerciseGroup(exercise);
  const gs = ExerciseMedia.GROUP_STYLE[group] || ExerciseMedia.GROUP_STYLE.core;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', borderRadius: 10, background: D.card, border: `1px solid ${D.border}`, marginBottom: 5 }}>
      <div style={{ width: 3, height: 34, borderRadius: 999, flexShrink: 0, background: `linear-gradient(to bottom, ${gs.from}, ${gs.to})` }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: '"Inter",system-ui', fontSize: 11, fontWeight: 600, color: D.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{exercise.name}</div>
        <div style={{ fontFamily: 'ui-monospace,Menlo,monospace', fontSize: 9, color: D.textMuted }}>{exercise.sets.length} serie{exercise.sets.length !== 1 ? 's' : ''}</div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <button onClick={onMoveUp} disabled={idx === 0} style={{ width: 18, height: 18, border: 'none', borderRadius: 4, cursor: idx === 0 ? 'not-allowed' : 'pointer', background: 'rgba(255,255,255,0.06)', color: idx === 0 ? 'rgba(255,255,255,0.15)' : D.textMid, fontSize: 9, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>↑</button>
        <button onClick={onMoveDown} disabled={idx === total - 1} style={{ width: 18, height: 18, border: 'none', borderRadius: 4, cursor: idx === total - 1 ? 'not-allowed' : 'pointer', background: 'rgba(255,255,255,0.06)', color: idx === total - 1 ? 'rgba(255,255,255,0.15)' : D.textMid, fontSize: 9, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>↓</button>
      </div>
      <button onClick={onRemove} style={{ border: 'none', background: 'rgba(194,69,69,0.12)', cursor: 'pointer', color: '#C24545', fontSize: 11, fontWeight: 700, padding: '3px 6px', borderRadius: 5 }}>✕</button>
    </div>
  );
}

// ── Volume chart (right panel) ────────────────────────────────────────────────
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
    <div style={{ marginBottom: 10 }}>
      <div style={{ fontFamily: 'ui-monospace,Menlo,monospace', fontSize: 8, color: D.textMuted, fontWeight: 700, letterSpacing: 0.7, marginBottom: 7 }}>VOLUMEN POR MÚSCULO</div>
      {Object.entries(vol).map(([muscle, sets]) => (
        <div key={muscle} style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 4 }}>
          <span style={{ fontFamily: '"Inter",system-ui', fontSize: 9, color: D.textMid, width: 88, flexShrink: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{muscle}</span>
          <div style={{ flex: 1, height: 3, borderRadius: 999, background: 'rgba(255,255,255,0.07)' }}>
            <div style={{ height: '100%', borderRadius: 999, background: D.accent, width: `${(sets / maxVol) * 100}%`, transition: 'width 0.3s' }} />
          </div>
          <span style={{ fontFamily: 'ui-monospace,Menlo,monospace', fontSize: 8, color: D.textMuted, width: 16, textAlign: 'right' }}>{sets}s</span>
        </div>
      ))}
    </div>
  );
}

// ── Anatomical body map (SVG) ─────────────────────────────────────────────────
function BodyMap({ view, groupVolumes, selectedGroup, onSelect }) {
  const [hovered, setHovered] = React.useState(null);

  const sp = (group) => {
    const isSel = selectedGroup === group;
    const isHov = hovered === group;
    const sets = groupVolumes[group] || 0;
    let fill, stroke, sw;
    if (isSel) {
      fill = 'rgba(42,111,219,0.82)'; stroke = '#6EA9F0'; sw = 1.5;
    } else if (isHov) {
      fill = 'rgba(42,111,219,0.38)'; stroke = 'rgba(42,111,219,0.62)'; sw = 1;
    } else if (sets === 0) {
      fill = 'rgba(232,237,248,0.08)'; stroke = 'rgba(232,237,248,0.14)'; sw = 0.5;
    } else if (sets <= 4) {
      fill = 'rgba(42,111,219,0.22)'; stroke = 'rgba(42,111,219,0.38)'; sw = 0.5;
    } else if (sets <= 9) {
      fill = 'rgba(42,111,219,0.48)'; stroke = 'rgba(42,111,219,0.65)'; sw = 0.5;
    } else {
      fill = 'rgba(42,111,219,0.75)'; stroke = 'rgba(42,111,219,0.92)'; sw = 0.5;
    }
    return {
      fill, stroke, strokeWidth: sw,
      style: { cursor: 'pointer', transition: 'fill 0.15s, stroke 0.15s' },
      onMouseEnter: () => setHovered(group),
      onMouseLeave: () => setHovered(null),
      onClick: () => onSelect(group),
    };
  };

  const bf  = 'rgba(232,237,248,0.05)';
  const bs  = 'rgba(232,237,248,0.09)';
  const bsw = 0.5;

  const activeLabel = hovered || selectedGroup;

  return (
    <svg viewBox="0 0 180 388" style={{ width: '100%', maxWidth: 210, display: 'block' }}>
      {/* ── Body silhouette ── */}
      {/* Head */}
      <circle cx="90" cy="26" r="18" fill={bf} stroke={bs} strokeWidth={bsw} />
      {/* Neck */}
      <rect x="83" y="43" width="14" height="14" rx="3" fill={bf} stroke="none" />
      {/* Torso */}
      <path d="M54,56 L126,56 C129,82 130,118 125,150 L116,168 L64,168 L55,150 C50,118 51,82 54,56Z" fill={bf} stroke={bs} strokeWidth={bsw} />
      {/* Left upper arm */}
      <ellipse cx="41" cy="100" rx="10" ry="30" fill={bf} stroke={bs} strokeWidth={bsw} />
      {/* Right upper arm */}
      <ellipse cx="139" cy="100" rx="10" ry="30" fill={bf} stroke={bs} strokeWidth={bsw} />
      {/* Left forearm */}
      <ellipse cx="34" cy="152" rx="8" ry="22" fill={bf} stroke={bs} strokeWidth={bsw} />
      {/* Right forearm */}
      <ellipse cx="146" cy="152" rx="8" ry="22" fill={bf} stroke={bs} strokeWidth={bsw} />
      {/* Left upper leg */}
      <ellipse cx="71" cy="214" rx="16" ry="36" fill={bf} stroke={bs} strokeWidth={bsw} />
      {/* Right upper leg */}
      <ellipse cx="109" cy="214" rx="16" ry="36" fill={bf} stroke={bs} strokeWidth={bsw} />
      {/* Left lower leg */}
      <ellipse cx="71" cy="302" rx="11" ry="26" fill={bf} stroke={bs} strokeWidth={bsw} />
      {/* Right lower leg */}
      <ellipse cx="109" cy="302" rx="11" ry="26" fill={bf} stroke={bs} strokeWidth={bsw} />
      {/* Left foot */}
      <ellipse cx="71" cy="348" rx="10" ry="6" fill={bf} stroke={bs} strokeWidth={bsw} />
      {/* Right foot */}
      <ellipse cx="109" cy="348" rx="10" ry="6" fill={bf} stroke={bs} strokeWidth={bsw} />

      {/* ── Interactive muscle regions ── */}
      {view === 'front' ? (
        <React.Fragment>
          {/* Shoulders — front deltoids */}
          <ellipse cx="48"  cy="70" rx="13" ry="11" {...sp('hombro')} />
          <ellipse cx="132" cy="70" rx="13" ry="11" {...sp('hombro')} />
          {/* Chest — pectorals */}
          <ellipse cx="74"  cy="86" rx="16" ry="13" {...sp('pecho')} />
          <ellipse cx="106" cy="86" rx="16" ry="13" {...sp('pecho')} />
          {/* Biceps */}
          <ellipse cx="40"  cy="100" rx="9" ry="20" {...sp('brazos')} />
          <ellipse cx="140" cy="100" rx="9" ry="20" {...sp('brazos')} />
          {/* Core / abs */}
          <ellipse cx="90" cy="130" rx="18" ry="26" {...sp('core')} />
          {/* Quads */}
          <ellipse cx="71"  cy="218" rx="14" ry="33" {...sp('pierna')} />
          <ellipse cx="109" cy="218" rx="14" ry="33" {...sp('pierna')} />
        </React.Fragment>
      ) : (
        <React.Fragment>
          {/* Rear deltoids */}
          <ellipse cx="48"  cy="71" rx="13" ry="11" {...sp('hombro')} />
          <ellipse cx="132" cy="71" rx="13" ry="11" {...sp('hombro')} />
          {/* Trapezius — upper back */}
          <ellipse cx="90" cy="64" rx="25" ry="12" {...sp('espalda')} />
          {/* Lats */}
          <ellipse cx="68"  cy="104" rx="15" ry="33" {...sp('espalda')} />
          <ellipse cx="112" cy="104" rx="15" ry="33" {...sp('espalda')} />
          {/* Triceps */}
          <ellipse cx="40"  cy="100" rx="9" ry="20" {...sp('brazos')} />
          <ellipse cx="140" cy="100" rx="9" ry="20" {...sp('brazos')} />
          {/* Glutes */}
          <ellipse cx="71"  cy="190" rx="19" ry="21" {...sp('pierna')} />
          <ellipse cx="109" cy="190" rx="19" ry="21" {...sp('pierna')} />
          {/* Hamstrings */}
          <ellipse cx="71"  cy="252" rx="13" ry="29" {...sp('pierna')} />
          <ellipse cx="109" cy="252" rx="13" ry="29" {...sp('pierna')} />
        </React.Fragment>
      )}

      {/* Hover / selected label */}
      {activeLabel && (
        <text x="90" y="376" textAnchor="middle" fill="rgba(232,237,248,0.60)" fontSize="10" fontFamily="Inter, system-ui" fontWeight="600">
          {MUSCLE_LABELS[activeLabel]}
        </text>
      )}
    </svg>
  );
}

// ── Exercise card (center panel grid) ────────────────────────────────────────
function ExerciseCard({ exercise, isAdded, onClick }) {
  const [hov, setHov] = React.useState(false);
  const group = getExerciseGroup(exercise);
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        borderRadius: 12, cursor: 'pointer', padding: '10px',
        background: hov ? D.cardHover : D.card,
        border: `1px solid ${isAdded ? 'rgba(34,197,94,0.22)' : D.border}`,
        transition: 'background 0.12s',
        display: 'flex', flexDirection: 'column', gap: 6,
      }}
    >
      <MiniThumb exercise={exercise} group={group} />
      <div style={{ fontFamily: '"Inter",system-ui', fontSize: 11, fontWeight: 600, color: D.text, lineHeight: 1.3, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
        {exercise.name}
      </div>
      <div style={{ fontFamily: '"Inter",system-ui', fontSize: 9, color: D.textMuted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {exercise.muscles.primary[0]}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <LevelDots level={exercise.level} />
        {isAdded && <span style={{ fontFamily: '"Inter",system-ui', fontSize: 9, fontWeight: 700, color: D.success }}>✓</span>}
      </div>
    </div>
  );
}

// ── Coach tip for selected muscle group ───────────────────────────────────────
function BodyMapCoachTip({ selectedGroup, groupVolumes }) {
  const sets = groupVolumes[selectedGroup] || 0;
  const label = (MUSCLE_LABELS[selectedGroup] || '').toLowerCase();
  const OPTIMAL = { pecho: 8, espalda: 10, hombro: 6, brazos: 5, pierna: 10, core: 6 };
  const optimal = OPTIMAL[selectedGroup] || 8;
  let msg, accent;
  if (sets === 0) {
    msg = `Sin trabajo de ${label} en las últimas sesiones. Añade un ejercicio.`;
    accent = 'rgba(180,80,0,0.75)';
  } else if (sets < optimal * 0.5) {
    msg = `Volumen bajo — ${sets} series esta semana. Lo óptimo son ~${optimal}.`;
    accent = 'rgba(180,80,0,0.75)';
  } else if (sets >= optimal) {
    msg = `Buen volumen de ${label} (${sets} series). Sigue así.`;
    accent = 'rgba(34,197,94,0.75)';
  } else {
    msg = `${sets} de ~${optimal} series recomendadas de ${label} esta semana.`;
    accent = 'rgba(42,111,219,0.75)';
  }
  return (
    <div style={{ padding: '8px 11px', borderRadius: 9, marginBottom: 14, background: 'rgba(42,111,219,0.06)', border: '1px solid rgba(42,111,219,0.14)', display: 'flex', gap: 8, alignItems: 'flex-start' }}>
      <span style={{ fontSize: 11, color: accent, flexShrink: 0, marginTop: 1 }}>⚡</span>
      <span style={{ fontFamily: '"Inter",system-ui', fontSize: 11, color: D.textMid, lineHeight: 1.45 }}>{msg}</span>
    </div>
  );
}

// ── Main section ──────────────────────────────────────────────────────────────
function BuilderSection() {
  const { state, actions } = useStore();
  const { navigate } = useRoute();

  const [mapView,       setMapView]       = React.useState('front');
  const [selectedGroup, setSelectedGroup] = React.useState(null);
  const [selectedExId,  setSelectedExId]  = React.useState(null);
  const [centerSets,    setCenterSets]    = React.useState([{ kg: '', reps: '', rir: '', rest: '90' }]);
  const [workout,       setWorkout]       = React.useState([]);
  const [saved,         setSaved]         = React.useState(false);
  const [gemFlash,      setGemFlash]      = React.useState(false);

  const allExercises  = React.useMemo(() => ExerciseService.getAll(), []);
  const groupVolumes  = React.useMemo(() => computeGroupVolumes(state.log || []), [state.log]);
  const currentExIds  = React.useMemo(() => new Set(workout.map(e => e.id)), [workout]);
  const selectedExercise = selectedExId ? allExercises.find(e => e.id === selectedExId) : null;

  const groupExercises = React.useMemo(() => {
    if (!selectedGroup) return [];
    const def = EXERCISE_GROUPS.find(g => g.id === selectedGroup);
    if (!def || !def.groups) return allExercises;
    return allExercises.filter(ex => def.groups.includes(getExerciseGroup(ex)));
  }, [allExercises, selectedGroup]);

  // Sync live workout to store for Atlas Coach
  React.useEffect(() => {
    actions.setCurrentWorkout(workout.map(ex => ({
      name: ex.name, muscles: ex.muscles.primary, pattern: ex.pattern, sets: ex.sets,
    })));
  }, [workout]);

  // Pre-fill sets when selecting an exercise
  React.useEffect(() => {
    if (!selectedExId) return;
    const inWorkout = workout.find(e => e.id === selectedExId);
    if (inWorkout) {
      setCenterSets(inWorkout.sets.map(s => ({ ...s })));
    } else {
      setCenterSets([{ kg: '', reps: '', rir: '', rest: '90' }]);
    }
  }, [selectedExId]);

  const handleGroupSelect = (group) => {
    setSelectedGroup(group);
    setSelectedExId(null);
  };

  const handleAddOrUpdate = () => {
    if (!selectedExId) return;
    const ex = allExercises.find(e => e.id === selectedExId);
    if (!ex) return;
    const inWorkout = workout.find(e => e.id === selectedExId);
    if (inWorkout) {
      setWorkout(prev => prev.map(e => e.id === selectedExId ? { ...e, sets: centerSets.map(s => ({ ...s })) } : e));
    } else {
      setWorkout(prev => [...prev, { ...ex, sets: centerSets.map(s => ({ ...s })) }]);
    }
  };

  const removeExercise = (id) => {
    setWorkout(prev => prev.filter(e => e.id !== id));
    if (selectedExId === id) setCenterSets([{ kg: '', reps: '', rir: '', rest: '90' }]);
  };

  const moveExercise = (idx, dir) => {
    setWorkout(prev => {
      const arr = [...prev];
      const target = idx + dir;
      if (target < 0 || target >= arr.length) return arr;
      [arr[idx], arr[target]] = [arr[target], arr[idx]];
      return arr;
    });
  };

  const handleSave = () => {
    if (workout.length === 0) return;
    actions.logSession(workout.map(ex => ({
      name: ex.name, muscles: ex.muscles.primary, sets: ex.sets,
    })));
    setSaved(true); setGemFlash(true);
    setTimeout(() => setGemFlash(false), 2500);
    setTimeout(() => { setSaved(false); setWorkout([]); setSelectedExId(null); }, 3000);
  };

  const totalSets = workout.reduce((s, ex) => s + ex.sets.length, 0);
  const duration  = estimateDuration(workout);

  return (
    <section style={{ padding: '100px 32px 60px', minHeight: '100vh', background: D.pageBg }}>
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>

        {gemFlash && (
          <div style={{ position: 'fixed', top: 80, right: 32, zIndex: 200, background: '#0F1A2E', color: '#FAFAF7', padding: '10px 20px', borderRadius: 999, fontFamily: '"Inter",system-ui', fontSize: 14, fontWeight: 700, animation: 'fadeIn 0.3s ease', boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}>
            💎 +30 gemas · Sesión registrada
          </div>
        )}

        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <span style={{ fontFamily: '"Inter",system-ui', fontSize: 11, fontWeight: 700, letterSpacing: 1.8, textTransform: 'uppercase', color: D.textMuted }}>
            Builder · Constructor de sesiones
          </span>
          <h1 style={{ fontFamily: '"Inter",system-ui', fontSize: 42, fontWeight: 700, color: D.text, letterSpacing: -2, lineHeight: 1.05, margin: '8px 0 0' }}>
            Construye tu sesión.{' '}
            <span style={{ fontFamily: '"Instrument Serif",serif', fontStyle: 'italic', fontWeight: 400, color: D.textMid }}>
              Cada serie, con intención.
            </span>
          </h1>
        </div>

        {/* 3-column layout */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '272px 1fr 300px',
          height: 760,
          borderRadius: 20,
          overflow: 'hidden',
          border: `1px solid ${D.border}`,
          boxShadow: '0 40px 100px -40px rgba(0,0,0,0.8)',
        }}>

          {/* ── LEFT: Anatomical Body Map ──────────────────────────── */}
          <div style={{ background: D.panelL, borderRight: `1px solid ${D.border}`, display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>

            {/* Header + toggle */}
            <div style={{ padding: '14px 12px 10px', flexShrink: 0, borderBottom: `1px solid ${D.border}` }}>
              <div style={{ fontFamily: 'ui-monospace,Menlo,monospace', fontSize: 8, color: D.textMuted, fontWeight: 700, letterSpacing: 0.7, marginBottom: 9 }}>
                MAPA MUSCULAR
              </div>
              <div style={{ display: 'flex', gap: 3, background: 'rgba(255,255,255,0.04)', borderRadius: 8, padding: 3 }}>
                {[['front', 'Frontal'], ['back', 'Posterior']].map(([v, lbl]) => (
                  <button
                    key={v}
                    onClick={() => setMapView(v)}
                    style={{
                      flex: 1, padding: '5px 0', borderRadius: 6, border: 'none', cursor: 'pointer',
                      background: mapView === v ? D.accent : 'transparent',
                      color: mapView === v ? '#FFFFFF' : D.textMuted,
                      fontFamily: '"Inter",system-ui', fontSize: 10, fontWeight: 700,
                      transition: 'all 0.15s',
                    }}
                  >
                    {lbl}
                  </button>
                ))}
              </div>
            </div>

            {/* SVG map */}
            <div style={{ flex: 1, overflow: 'hidden', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '12px 20px 4px' }}>
              <BodyMap
                view={mapView}
                groupVolumes={groupVolumes}
                selectedGroup={selectedGroup}
                onSelect={handleGroupSelect}
              />
            </div>

            {/* Volume legend */}
            <div style={{ padding: '10px 12px 14px', flexShrink: 0 }}>
              <div style={{ fontFamily: 'ui-monospace,Menlo,monospace', fontSize: 8, color: D.textMuted, fontWeight: 700, letterSpacing: 0.7, marginBottom: 7 }}>
                VOLUMEN SEMANAL
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px 12px' }}>
                {[
                  { c: 'rgba(232,237,248,0.14)', l: 'Sin datos' },
                  { c: 'rgba(42,111,219,0.35)',  l: '1–4 series' },
                  { c: 'rgba(42,111,219,0.60)',  l: '5–9 series' },
                  { c: 'rgba(42,111,219,0.88)',  l: '10+ series' },
                ].map(({ c, l }) => (
                  <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <div style={{ width: 8, height: 8, borderRadius: 2, background: c, flexShrink: 0 }} />
                    <span style={{ fontFamily: '"Inter",system-ui', fontSize: 9, color: D.textMuted }}>{l}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── CENTER: Exercise Browser ───────────────────────────── */}
          <div style={{ background: D.panelC, borderRight: `1px solid ${D.border}`, display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>

            {selectedExercise ? (
              <>
                {/* Back to group list */}
                <div style={{ padding: '10px 16px 8px', flexShrink: 0, borderBottom: `1px solid ${D.border}` }}>
                  <button
                    onClick={() => setSelectedExId(null)}
                    style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'none', border: 'none', cursor: 'pointer', padding: '3px 0', fontFamily: '"Inter",system-ui', fontSize: 11, color: D.textMid, fontWeight: 600 }}
                  >
                    ← {selectedGroup ? MUSCLE_LABELS[selectedGroup] : 'Volver'}
                  </button>
                </div>
                <ExerciseDetailView
                  exercise={selectedExercise}
                  isAdded={currentExIds.has(selectedExercise.id)}
                  centerSets={centerSets}
                  setCenterSets={setCenterSets}
                  onAddOrUpdate={handleAddOrUpdate}
                />
              </>
            ) : selectedGroup ? (
              <div style={{ flex: 1, overflowY: 'auto', padding: '16px 14px' }}>
                <BodyMapCoachTip selectedGroup={selectedGroup} groupVolumes={groupVolumes} />
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 14 }}>
                  <h2 style={{ fontFamily: '"Inter",system-ui', fontSize: 19, fontWeight: 700, color: D.text, margin: 0, letterSpacing: -0.5 }}>
                    {MUSCLE_LABELS[selectedGroup]}
                  </h2>
                  <span style={{ fontFamily: 'ui-monospace,Menlo,monospace', fontSize: 9, color: D.textMuted, fontWeight: 700 }}>
                    {groupExercises.length} EJERCICIOS
                  </span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  {groupExercises.map(ex => (
                    <ExerciseCard
                      key={ex.id}
                      exercise={ex}
                      isAdded={currentExIds.has(ex.id)}
                      onClick={() => setSelectedExId(ex.id)}
                    />
                  ))}
                  {groupExercises.length === 0 && (
                    <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '40px 16px', color: D.textMuted, fontFamily: '"Inter",system-ui', fontSize: 12 }}>
                      Sin ejercicios en esta categoría
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 40 }}>
                <div style={{ width: 68, height: 68, borderRadius: 18, marginBottom: 18, background: 'rgba(42,111,219,0.08)', border: `1px solid rgba(42,111,219,0.14)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26 }}>
                  ✦
                </div>
                <div style={{ fontFamily: '"Instrument Serif",serif', fontStyle: 'italic', fontSize: 20, color: D.textMid, textAlign: 'center', marginBottom: 10 }}>
                  Toca un músculo
                </div>
                <p style={{ fontFamily: '"Inter",system-ui', fontSize: 12, color: D.textMuted, textAlign: 'center', lineHeight: 1.7, margin: 0 }}>
                  Selecciona un grupo muscular en el mapa<br />
                  para ver los ejercicios disponibles.
                </p>
              </div>
            )}
          </div>

          {/* ── RIGHT: Current Routine ─────────────────────────────── */}
          <div style={{ background: D.panelR, display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
            <div style={{ padding: '14px 14px 10px', flexShrink: 0, borderBottom: `1px solid ${D.border}` }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                <div style={{ fontFamily: 'ui-monospace,Menlo,monospace', fontSize: 8, color: D.textMuted, fontWeight: 700, letterSpacing: 0.8 }}>RUTINA ACTUAL</div>
                {workout.length > 0 && (
                  <button onClick={() => navigate('/coach')} style={{ padding: '3px 9px', borderRadius: 999, border: '1px solid rgba(42,111,219,0.35)', background: 'rgba(42,111,219,0.12)', color: '#6BA3F0', fontFamily: '"Inter",system-ui', fontSize: 9, fontWeight: 700, cursor: 'pointer', letterSpacing: 0.2 }}>
                    Analizar →
                  </button>
                )}
              </div>
              <div style={{ display: 'flex', gap: 14, alignItems: 'baseline' }}>
                <div>
                  <span style={{ fontFamily: '"Inter",system-ui', fontSize: 22, fontWeight: 800, color: D.text, lineHeight: 1 }}>{workout.length}</span>
                  <span style={{ fontFamily: '"Inter",system-ui', fontSize: 9, color: D.textMuted, marginLeft: 4 }}>ejercicios</span>
                </div>
                <div>
                  <span style={{ fontFamily: '"Inter",system-ui', fontSize: 22, fontWeight: 800, color: D.text, lineHeight: 1 }}>{totalSets}</span>
                  <span style={{ fontFamily: '"Inter",system-ui', fontSize: 9, color: D.textMuted, marginLeft: 4 }}>series</span>
                </div>
                {workout.length > 0 && (
                  <div style={{ marginLeft: 'auto' }}>
                    <span style={{ fontFamily: 'ui-monospace,Menlo,monospace', fontSize: 10, color: D.textMuted }}>~{duration}min</span>
                  </div>
                )}
              </div>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '8px 10px' }}>
              {workout.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 14px' }}>
                  <div style={{ fontFamily: '"Instrument Serif",serif', fontStyle: 'italic', fontSize: 15, color: D.textMuted, marginBottom: 8 }}>Rutina vacía</div>
                  <p style={{ fontFamily: '"Inter",system-ui', fontSize: 11, color: D.textMuted, margin: 0, lineHeight: 1.6 }}>
                    Toca un músculo en el mapa, elige un ejercicio y configura las series
                  </p>
                </div>
              ) : (
                workout.map((exercise, idx) => (
                  <RoutineItem
                    key={exercise.id}
                    exercise={exercise}
                    idx={idx}
                    total={workout.length}
                    onRemove={() => removeExercise(exercise.id)}
                    onMoveUp={() => moveExercise(idx, -1)}
                    onMoveDown={() => moveExercise(idx, 1)}
                  />
                ))
              )}
            </div>

            <div style={{ padding: '10px 12px', borderTop: `1px solid ${D.border}`, flexShrink: 0 }}>
              <VolumeChart exercises={workout} />
              <button
                onClick={handleSave}
                disabled={workout.length === 0}
                style={{
                  width: '100%', padding: '12px 16px', borderRadius: 10,
                  cursor: workout.length === 0 ? 'not-allowed' : 'pointer',
                  background: saved ? 'rgba(34,197,94,0.10)' : workout.length === 0 ? 'rgba(255,255,255,0.05)' : D.accent,
                  color: saved ? D.success : workout.length === 0 ? D.textMuted : '#FFFFFF',
                  fontFamily: '"Inter",system-ui', fontSize: 13, fontWeight: 700,
                  transition: 'all 0.25s',
                  border: saved ? `1px solid rgba(34,197,94,0.28)` : '1px solid transparent',
                }}
              >
                {saved ? '✓ Sesión guardada · +30 💎' : workout.length === 0 ? 'Guardar sesión · +30 gemas 💎' : 'Guardar sesión · +30 💎'}
              </button>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

Object.assign(window, { BuilderSection });
