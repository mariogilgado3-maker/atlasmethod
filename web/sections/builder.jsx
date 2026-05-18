// Atlas Builder v5 — body-map first (main branch)

// ── Tokens ────────────────────────────────────────────────────────────────────
const BD = {
  page:    '#060D18',
  panel:   '#0A1422',
  card:    '#0E1A2C',
  hov:     '#132134',
  border:  'rgba(255,255,255,0.07)',
  text:    '#E8EDF8',
  sub:     'rgba(232,237,248,0.55)',
  muted:   'rgba(232,237,248,0.28)',
  blue:    '#3B82F6',
  blueDim: 'rgba(59,130,246,0.18)',
  green:   '#22C55E',
  amber:   '#F59E0B',
  red:     '#EF4444',
};

// ── Grupos musculares ─────────────────────────────────────────────────────────
const MUSCLES = {
  pecho:   { label: 'Pecho',   view: 'front' },
  espalda: { label: 'Espalda', view: 'back'  },
  hombro:  { label: 'Hombros', view: 'both'  },
  biceps:  { label: 'Bíceps',  view: 'front' },
  triceps: { label: 'Tríceps', view: 'back'  },
  piernas: { label: 'Piernas', view: 'front' },
  gluteos: { label: 'Glúteos', view: 'back'  },
  core:    { label: 'Core',    view: 'both'  },
};

// ── Helpers ───────────────────────────────────────────────────────────────────
function exGroup(ex) {
  if (ex.group) return ex.group;
  const p = ex.pattern || '';
  if (p === 'empuje-horizontal') return 'pecho';
  if (p === 'empuje-vertical')
    return (ex.muscles.primary[0] || '').includes('Tríceps') ? 'triceps' : 'hombro';
  if (p === 'traccion-horizontal')
    return (ex.muscles.primary[0] || '').includes('Deltoides') ? 'hombro' : 'espalda';
  if (p === 'traccion-vertical') {
    const pm = ex.muscles.primary[0] || '';
    return (pm.includes('Bíceps') || pm.includes('Braquial')) ? 'biceps' : 'espalda';
  }
  if (p === 'sentadilla' || p === 'bisagra' || p === 'aislamiento-pantorrilla') return 'pierna';
  if (p.startsWith('core')) return 'core';
  return 'core';
}

function exsForMuscle(id, all) {
  if (id === 'pecho')   return all.filter(e => exGroup(e) === 'pecho');
  if (id === 'espalda') return all.filter(e => exGroup(e) === 'espalda');
  if (id === 'hombro')  return all.filter(e => exGroup(e) === 'hombro');
  if (id === 'biceps')  return all.filter(e => exGroup(e) === 'biceps');
  if (id === 'triceps') return all.filter(e => exGroup(e) === 'triceps');
  if (id === 'piernas') return all.filter(e => e.pattern === 'sentadilla' || e.pattern === 'aislamiento-pantorrilla');
  if (id === 'gluteos') return all.filter(e => e.pattern === 'bisagra');
  if (id === 'core')    return all.filter(e => exGroup(e) === 'core');
  return [];
}

function sessionDuration(workout) {
  const sets = workout.reduce((s, e) => s + e.sets.length, 0);
  return Math.round((workout.length ? 5 : 0) + sets * 2.5);
}

function useWidth() {
  const [w, setW] = React.useState(window.innerWidth);
  React.useEffect(() => {
    const h = () => setW(window.innerWidth);
    window.addEventListener('resize', h);
    return () => window.removeEventListener('resize', h);
  }, []);
  return w;
}

// ── Mapa corporal SVG ─────────────────────────────────────────────────────────
function BodyMap({ view, selected, onPick }) {
  const [hov, setHov] = React.useState(null);

  function zone(id) {
    const sel  = selected === id;
    const hovr = hov === id;
    let fill, stroke, sw;
    if (sel)       { fill = '#3B82F6'; stroke = 'rgba(147,197,253,0.9)'; sw = 2; }
    else if (hovr) { fill = 'rgba(59,130,246,0.40)'; stroke = 'rgba(147,197,253,0.55)'; sw = 1.5; }
    else           { fill = 'rgba(255,255,255,0.07)'; stroke = 'rgba(255,255,255,0.14)'; sw = 0.5; }
    return {
      fill, stroke, strokeWidth: sw,
      style: { cursor: 'pointer', transition: 'fill .14s, stroke .14s' },
      onMouseEnter: () => setHov(id),
      onMouseLeave: () => setHov(null),
      onClick: () => onPick(id),
    };
  }

  const g = { fill: 'rgba(255,255,255,0.05)', stroke: 'rgba(255,255,255,0.09)', strokeWidth: 0.5 };

  return (
    <div>
      <svg viewBox="0 0 200 460"
        style={{ width: '100%', maxWidth: 260, display: 'block', margin: '0 auto' }}>
        <circle cx="100" cy="28" r="21" {...g} />
        <rect x="92" y="47" width="16" height="13" rx="4" {...g} />
        <path d="M62,60 L138,60 C141,92 142,136 136,166 L124,180 L76,180 L64,166 C58,136 59,92 62,60Z" {...g} />
        <ellipse cx="47"  cy="110" rx="11" ry="38" {...g} />
        <ellipse cx="153" cy="110" rx="11" ry="38" {...g} />
        <ellipse cx="40"  cy="165" rx="9"  ry="28" {...g} />
        <ellipse cx="160" cy="165" rx="9"  ry="28" {...g} />
        <ellipse cx="82"  cy="268" rx="20" ry="52" {...g} />
        <ellipse cx="118" cy="268" rx="20" ry="52" {...g} />
        <ellipse cx="82"  cy="370" rx="13" ry="34" {...g} />
        <ellipse cx="118" cy="370" rx="13" ry="34" {...g} />
        <ellipse cx="82"  cy="410" rx="14" ry="7"  {...g} />
        <ellipse cx="118" cy="410" rx="14" ry="7"  {...g} />

        {view === 'front' ? (
          <React.Fragment>
            <ellipse cx="52"  cy="75"  rx="14" ry="12" {...zone('hombro')} />
            <ellipse cx="148" cy="75"  rx="14" ry="12" {...zone('hombro')} />
            <path d="M72,68 C68,68 62,75 62,88 C62,100 70,107 82,107 L100,107 L100,68Z"       {...zone('pecho')} />
            <path d="M128,68 C132,68 138,75 138,88 C138,100 130,107 118,107 L100,107 L100,68Z" {...zone('pecho')} />
            <ellipse cx="47"  cy="112" rx="9" ry="26" {...zone('biceps')} />
            <ellipse cx="153" cy="112" rx="9" ry="26" {...zone('biceps')} />
            <rect    x="78"   y="108"  width="44" height="58" rx="10" {...zone('core')} />
            <ellipse cx="82"  cy="274" rx="17" ry="48" {...zone('piernas')} />
            <ellipse cx="118" cy="274" rx="17" ry="48" {...zone('piernas')} />
          </React.Fragment>
        ) : (
          <React.Fragment>
            <ellipse cx="52"  cy="75"  rx="14" ry="12" {...zone('hombro')} />
            <ellipse cx="148" cy="75"  rx="14" ry="12" {...zone('hombro')} />
            <path d="M73,60 L100,68 L127,60 C120,55 80,55 73,60Z"                              {...zone('espalda')} />
            <path d="M100,68 C92,68 65,80 58,106 C54,120 60,145 76,148 L100,148Z"              {...zone('espalda')} />
            <path d="M100,68 C108,68 135,80 142,106 C146,120 140,145 124,148 L100,148Z"        {...zone('espalda')} />
            <ellipse cx="47"  cy="112" rx="9" ry="26" {...zone('triceps')} />
            <ellipse cx="153" cy="112" rx="9" ry="26" {...zone('triceps')} />
            <ellipse cx="100" cy="162" rx="20" ry="14" {...zone('core')} />
            <ellipse cx="82"  cy="210" rx="22" ry="28" {...zone('gluteos')} />
            <ellipse cx="118" cy="210" rx="22" ry="28" {...zone('gluteos')} />
            <ellipse cx="82"  cy="285" rx="17" ry="40" {...zone('piernas')} />
            <ellipse cx="118" cy="285" rx="17" ry="40" {...zone('piernas')} />
          </React.Fragment>
        )}

        {(hov || selected) && (
          <text x="100" y="448" textAnchor="middle"
            fill="rgba(232,237,248,0.55)" fontSize="10"
            fontFamily="Inter,system-ui" fontWeight="700" letterSpacing="1">
            {MUSCLES[hov || selected] && MUSCLES[hov || selected].label.toUpperCase()}
          </text>
        )}
      </svg>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 14px', marginTop: 16, justifyContent: 'center' }}>
        {[['rgba(255,255,255,0.14)','Sin seleccionar'],['rgba(59,130,246,0.55)','Seleccionado']].map(([c, l]) => (
          <span key={l} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{ width: 8, height: 8, borderRadius: 2, background: c, display: 'inline-block' }} />
            <span style={{ fontFamily: 'Inter,system-ui', fontSize: 10, color: BD.muted }}>{l}</span>
          </span>
        ))}
      </div>
    </div>
  );
}

// ── Tarjeta ejercicio con thumbnail ───────────────────────────────────────────
function ExCard({ ex, inSession, onClick }) {
  const [hov, setHov] = React.useState(false);
  const g = exGroup(ex);
  return (
    <div onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{ borderRadius: 14, overflow: 'hidden', cursor: 'pointer',
        border: `1.5px solid ${inSession ? 'rgba(34,197,94,0.35)' : hov ? 'rgba(59,130,246,0.45)' : BD.border}`,
        background: BD.card,
        transform: hov && !inSession ? 'translateY(-2px)' : 'none',
        transition: 'border-color .12s, transform .12s' }}>
      <ExerciseMedia.Thumbnail exercise={ex} group={g} isAdded={inSession} height={90} />
      <div style={{ padding: '9px 11px 11px' }}>
        <div style={{ fontFamily: 'Inter,system-ui', fontSize: 11, fontWeight: 700, color: BD.text,
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
          overflow: 'hidden', lineHeight: 1.35 }}>{ex.name}</div>
        <div style={{ fontFamily: 'Inter,system-ui', fontSize: 10, color: BD.muted, marginTop: 3,
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {ex.muscles.primary[0]}
        </div>
      </div>
    </div>
  );
}

// ── Fila de ejercicio en sesión ───────────────────────────────────────────────
function ExRow({ ex, onRemove, onEdit }) {
  const [hov, setHov] = React.useState(false);
  const g = exGroup(ex);
  return (
    <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      onClick={onEdit}
      style={{ display: 'flex', alignItems: 'center', borderRadius: 12, overflow: 'hidden',
        background: hov ? BD.hov : BD.card, border: `1px solid ${BD.border}`,
        marginBottom: 8, cursor: 'pointer', transition: 'background .12s' }}>
      <div style={{ width: 54, flexShrink: 0 }}>
        <ExerciseMedia.Thumbnail exercise={ex} group={g} isAdded={false} height={54} />
      </div>
      <div style={{ flex: 1, padding: '0 11px', minWidth: 0 }}>
        <div style={{ fontFamily: 'Inter,system-ui', fontSize: 12, fontWeight: 700, color: BD.text,
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ex.name}</div>
        <div style={{ fontFamily: 'Inter,system-ui', fontSize: 10, color: BD.muted, marginTop: 2 }}>
          {ex.sets.length} serie{ex.sets.length !== 1 ? 's' : ''}
          {ex.sets[0] && ex.sets[0].kg ? ` · ${ex.sets[0].kg} kg` : ''}
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingRight: 10 }}>
        <span style={{ fontSize: 11, color: BD.green }}>✓</span>
        <button onClick={e => { e.stopPropagation(); onRemove(); }}
          style={{ width: 24, height: 24, borderRadius: 7, border: 'none',
            background: 'rgba(239,68,68,0.14)', color: 'rgba(239,68,68,0.80)',
            cursor: 'pointer', fontSize: 11, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          ✕
        </button>
      </div>
    </div>
  );
}

// ── Panel del músculo seleccionado ────────────────────────────────────────────
function MusclePanel({ id, sessionExs, onAddEx, onRemoveEx, onEditEx }) {
  const def = MUSCLES[id] || {};
  return (
    <div style={{ animation: 'fadeIn .2s ease' }}>
      <h2 style={{ fontFamily: 'Inter,system-ui', fontSize: 38, fontWeight: 900,
        color: BD.text, margin: '0 0 20px', letterSpacing: -2, lineHeight: 1 }}>
        {def.label}
      </h2>
      {sessionExs.length > 0 && (
        <div style={{ marginBottom: 22 }}>
          <div style={{ fontFamily: 'ui-monospace,Menlo,monospace', fontSize: 9, fontWeight: 700,
            color: BD.muted, letterSpacing: 1, marginBottom: 10 }}>EN TU SESIÓN</div>
          {sessionExs.map(ex => (
            <ExRow key={ex.id} ex={ex}
              onRemove={() => onRemoveEx(ex.id)}
              onEdit={() => onEditEx(ex)} />
          ))}
        </div>
      )}
      <button onClick={onAddEx}
        style={{ display: 'flex', alignItems: 'center', gap: 8,
          padding: '14px 22px', borderRadius: 14,
          background: BD.blue, color: '#fff', border: 'none', cursor: 'pointer',
          fontFamily: 'Inter,system-ui', fontSize: 14, fontWeight: 700,
          boxShadow: '0 8px 28px -8px rgba(59,130,246,0.55)', marginBottom: 20 }}>
        <span style={{ fontSize: 20, fontWeight: 300, lineHeight: 1 }}>+</span>
        Añadir ejercicio
      </button>
      <p style={{ fontFamily: 'Inter,system-ui', fontSize: 12, color: BD.muted,
        lineHeight: 1.65, margin: 0, maxWidth: 280 }}>
        Añade ejercicios para {def.label.toLowerCase()} y configura series y repeticiones.
      </p>
    </div>
  );
}

// ── Selector de ejercicios ────────────────────────────────────────────────────
function Picker({ id, exercises, sessionIds, onSelect, onBack }) {
  const def = MUSCLES[id] || {};
  return (
    <div style={{ animation: 'fadeIn .18s ease', display: 'flex', flexDirection: 'column', height: '100%' }}>
      <button onClick={onBack}
        style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none',
          cursor: 'pointer', padding: '4px 0', marginBottom: 16,
          fontFamily: 'Inter,system-ui', fontSize: 12, color: BD.sub, fontWeight: 600, flexShrink: 0 }}>
        ← {def.label}
      </button>
      <div style={{ fontFamily: 'Inter,system-ui', fontSize: 18, fontWeight: 700,
        color: BD.text, marginBottom: 16, letterSpacing: -0.5, flexShrink: 0 }}>
        Elige un ejercicio
      </div>
      <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 8 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
          {exercises.map(ex => (
            <ExCard key={ex.id} ex={ex}
              inSession={sessionIds.has(ex.id)}
              onClick={() => onSelect(ex)} />
          ))}
          {exercises.length === 0 && (
            <div style={{ gridColumn: '1/-1', padding: '40px 0', textAlign: 'center',
              fontFamily: 'Inter,system-ui', fontSize: 13, color: BD.muted }}>
              Sin ejercicios en esta categoría
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Configurar series ─────────────────────────────────────────────────────────
function SetConfig({ ex, initSets, onConfirm, onBack }) {
  const [sets, setSets] = React.useState(() =>
    initSets && initSets.length > 0
      ? initSets.map(s => ({ kg: s.kg || '', reps: s.reps || '10' }))
      : [{ kg: '', reps: '10' }, { kg: '', reps: '10' }, { kg: '', reps: '10' }]
  );
  const upd = (i, f, v) => setSets(p => p.map((s, idx) => idx === i ? { ...s, [f]: v } : s));
  const add = () => setSets(p => [...p, { kg: '', reps: '10' }]);
  const rem = i => setSets(p => p.filter((_, idx) => idx !== i));
  const g = exGroup(ex);
  const inp = {
    type: 'number', min: 0,
    style: { width: '100%', padding: '10px 6px', borderRadius: 9, boxSizing: 'border-box',
      border: `1px solid ${BD.border}`, background: 'rgba(255,255,255,0.04)',
      fontFamily: 'ui-monospace,Menlo,monospace', fontSize: 14, color: BD.text, textAlign: 'center' },
  };
  return (
    <div style={{ animation: 'fadeIn .18s ease', display: 'flex', flexDirection: 'column', height: '100%' }}>
      <button onClick={onBack}
        style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none',
          cursor: 'pointer', padding: '4px 0', marginBottom: 14,
          fontFamily: 'Inter,system-ui', fontSize: 12, color: BD.sub, fontWeight: 600, flexShrink: 0 }}>
        ← Volver
      </button>
      <div style={{ borderRadius: 14, overflow: 'hidden', marginBottom: 18, flexShrink: 0 }}>
        <ExerciseMedia.Thumbnail exercise={ex} group={g} isAdded={false} height={120} />
        <div style={{ padding: '11px 13px', background: BD.card }}>
          <div style={{ fontFamily: 'Inter,system-ui', fontSize: 15, fontWeight: 700, color: BD.text }}>{ex.name}</div>
          <div style={{ fontFamily: 'Inter,system-ui', fontSize: 11, color: BD.muted, marginTop: 2 }}>
            {ex.muscles.primary.join(' · ')}
          </div>
        </div>
      </div>
      <div style={{ flex: 1, overflowY: 'auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '20px 1fr 1fr 20px', gap: 6, marginBottom: 8 }}>
          {['', 'Kg', 'Reps', ''].map((h, i) => (
            <span key={i} style={{ fontFamily: 'ui-monospace,Menlo,monospace', fontSize: 8,
              color: BD.muted, fontWeight: 700, textAlign: 'center', letterSpacing: 0.5 }}>{h}</span>
          ))}
        </div>
        {sets.map((set, i) => (
          <div key={i} style={{ display: 'grid', gridTemplateColumns: '20px 1fr 1fr 20px', gap: 6, alignItems: 'center', marginBottom: 7 }}>
            <span style={{ fontFamily: 'ui-monospace,Menlo,monospace', fontSize: 10, color: BD.muted, textAlign: 'center' }}>{i + 1}</span>
            <input {...inp} value={set.kg} placeholder="—" step={0.5} onChange={e => upd(i, 'kg', e.target.value)} />
            <input {...inp} value={set.reps} placeholder="10" step={1} onChange={e => upd(i, 'reps', e.target.value)} />
            {sets.length > 1
              ? <button onClick={() => rem(i)}
                  style={{ width: 20, height: 20, border: 'none', background: 'rgba(239,68,68,0.14)',
                    color: 'rgba(239,68,68,0.80)', borderRadius: 5, cursor: 'pointer', fontSize: 10,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}>✕</button>
              : <div />}
          </div>
        ))}
        <button onClick={add}
          style={{ marginTop: 4, marginBottom: 18, padding: '7px 12px', borderRadius: 9,
            border: '1px dashed rgba(255,255,255,0.15)', background: 'transparent',
            cursor: 'pointer', fontFamily: 'Inter,system-ui', fontSize: 11, fontWeight: 600, color: BD.sub }}>
          + Serie
        </button>
        <button onClick={() => onConfirm(ex, sets)}
          style={{ width: '100%', padding: '14px 20px', borderRadius: 13, cursor: 'pointer',
            background: BD.blue, color: '#fff', border: 'none',
            fontFamily: 'Inter,system-ui', fontSize: 14, fontWeight: 700, letterSpacing: -0.2,
            boxShadow: '0 8px 28px -8px rgba(59,130,246,0.50)' }}>
          Añadir · {sets.length} serie{sets.length !== 1 ? 's' : ''} →
        </button>
      </div>
    </div>
  );
}

// ── Barra de sesión sticky ────────────────────────────────────────────────────
function WorkoutBar({ workout, saved, duration, onSave, mobile }) {
  return (
    <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 200,
      background: 'rgba(6,13,24,0.97)', backdropFilter: 'blur(24px)',
      borderTop: '1px solid rgba(255,255,255,0.08)',
      padding: mobile ? '12px 16px' : '12px 32px',
      display: 'flex', alignItems: 'center', gap: 12 }}>
      <div style={{ flex: 1, display: 'flex', gap: 6, overflow: 'hidden' }}>
        {workout.slice(0, mobile ? 2 : 5).map(ex => {
          const gs = ExerciseMedia.GROUP_STYLE[exGroup(ex)] || ExerciseMedia.GROUP_STYLE.core;
          return (
            <span key={ex.id} style={{ display: 'flex', alignItems: 'center', gap: 6,
              padding: '5px 10px', borderRadius: 999, flexShrink: 0,
              background: 'rgba(255,255,255,0.06)', border: `1px solid ${BD.border}`,
              fontFamily: 'Inter,system-ui', fontSize: 11, fontWeight: 600, color: BD.sub,
              maxWidth: 140, overflow: 'hidden' }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: gs.to, flexShrink: 0 }} />
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ex.name}</span>
            </span>
          );
        })}
        {workout.length > (mobile ? 2 : 5) && (
          <span style={{ padding: '5px 10px', borderRadius: 999, flexShrink: 0,
            background: 'rgba(255,255,255,0.04)',
            fontFamily: 'Inter,system-ui', fontSize: 11, color: BD.muted }}>
            +{workout.length - (mobile ? 2 : 5)}
          </span>
        )}
      </div>
      {!mobile && (
        <span style={{ fontFamily: 'ui-monospace,Menlo,monospace', fontSize: 11, color: BD.muted, flexShrink: 0 }}>
          ~{duration} min
        </span>
      )}
      <button onClick={onSave}
        style={{ flexShrink: 0, padding: '11px 20px', borderRadius: 12, border: 'none', cursor: 'pointer',
          background: saved ? 'rgba(34,197,94,0.15)' : BD.blue,
          color: saved ? BD.green : '#fff',
          fontFamily: 'Inter,system-ui', fontSize: 13, fontWeight: 700, transition: 'all .25s', whiteSpace: 'nowrap' }}>
        {saved ? '✓ +30 💎' : 'Guardar +30 💎'}
      </button>
    </div>
  );
}

// ── Panel vacío ───────────────────────────────────────────────────────────────
function EmptyPanel({ onPick }) {
  return (
    <div style={{ paddingTop: 8 }}>
      <div style={{ fontFamily: '"Instrument Serif",serif', fontStyle: 'italic',
        fontSize: 28, color: BD.sub, marginBottom: 10, lineHeight: 1.2 }}>
        Toca un músculo
      </div>
      <p style={{ fontFamily: 'Inter,system-ui', fontSize: 14, color: BD.muted,
        lineHeight: 1.65, margin: '0 0 24px', maxWidth: 300 }}>
        Selecciona un grupo muscular en el mapa para ver los ejercicios disponibles.
      </p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {Object.entries(MUSCLES).map(([id, def]) => (
          <button key={id} onClick={() => onPick(id)}
            style={{ padding: '7px 14px', borderRadius: 999,
              background: 'rgba(255,255,255,0.04)', border: `1px solid ${BD.border}`,
              fontFamily: 'Inter,system-ui', fontSize: 12, fontWeight: 600, color: BD.muted,
              cursor: 'pointer', transition: 'background .12s, color .12s' }}
            onMouseEnter={e => { e.currentTarget.style.background = BD.blueDim; e.currentTarget.style.color = '#93C5FD'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = BD.muted; }}>
            {def.label}
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Componente principal ───────────────────────────────────────────────────────
function BuilderSection() {
  const { actions }  = useStore();
  const { navigate } = useRoute();
  const mobile       = useWidth() < 680;

  const [view,    setView]    = React.useState('front');
  const [muscle,  setMuscle]  = React.useState(null);
  const [mode,    setMode]    = React.useState('empty');
  const [cfgEx,   setCfgEx]   = React.useState(null);
  const [cfgSets, setCfgSets] = React.useState(null);
  const [workout, setWorkout] = React.useState([]);
  const [saved,   setSaved]   = React.useState(false);
  const [flash,   setFlash]   = React.useState(false);

  const allExs = React.useMemo(() => ExerciseService.getAll(), []);
  const muscleExs = React.useMemo(() => muscle ? exsForMuscle(muscle, allExs) : [], [muscle, allExs]);
  const sessionIds = React.useMemo(() => new Set(workout.map(e => e.id)), [workout]);
  const sessionExsForMuscle = React.useMemo(() => {
    const ids = new Set(muscleExs.map(e => e.id));
    return workout.filter(e => ids.has(e.id));
  }, [workout, muscleExs]);
  const duration = React.useMemo(() => sessionDuration(workout), [workout]);

  function pickMuscle(id) {
    setMuscle(id);
    setMode('overview');
    const def = MUSCLES[id];
    if (def && def.view === 'back')  setView('back');
    if (def && def.view === 'front') setView('front');
  }
  function pickExercise(ex) {
    setCfgEx(ex);
    setCfgSets(workout.find(e => e.id === ex.id)?.sets || null);
    setMode('config');
  }
  function confirmSets(ex, sets) {
    setWorkout(prev =>
      prev.find(e => e.id === ex.id)
        ? prev.map(e => e.id === ex.id ? { ...e, sets } : e)
        : [...prev, { ...ex, sets }]
    );
    setMode('overview');
  }
  function removeEx(id) { setWorkout(prev => prev.filter(e => e.id !== id)); }
  function editEx(ex) {
    setCfgEx(ex);
    setCfgSets(workout.find(e => e.id === ex.id)?.sets || null);
    setMode('config');
  }
  function save() {
    if (!workout.length) return;
    actions.logSession(workout.map(ex => ({
      name: ex.name, muscles: ex.muscles.primary, sets: ex.sets,
    })));
    setSaved(true); setFlash(true);
    setTimeout(() => setFlash(false), 2500);
    setTimeout(() => { setSaved(false); setWorkout([]); setMuscle(null); setMode('empty'); }, 3000);
  }

  return (
    <section style={{ minHeight: '100vh', background: BD.page }}>

      {/* BANNER DE DIAGNÓSTICO — confirma que el nuevo builder está cargado */}
      <div style={{ background: '#DC2626', color: '#fff', padding: '14px 24px',
        fontFamily: 'ui-monospace,Menlo,monospace', fontSize: 13, fontWeight: 700,
        textAlign: 'center', letterSpacing: 1 }}>
        ▶ ATLAS BUILDER NUEVO — MAPA CORPORAL ACTIVO ◀
      </div>

      <div style={{ maxWidth: 1060, margin: '0 auto', padding: mobile ? '48px 16px 120px' : '64px 28px 120px' }}>

        {flash && (
          <div style={{ position: 'fixed', top: 72, right: 20, zIndex: 400,
            background: '#0F1A2E', color: BD.text, padding: '10px 18px',
            borderRadius: 999, fontFamily: 'Inter,system-ui', fontSize: 13, fontWeight: 700,
            animation: 'fadeIn .3s ease', boxShadow: '0 8px 32px rgba(0,0,0,0.5)', whiteSpace: 'nowrap' }}>
            💎 +30 gemas · Sesión guardada
          </div>
        )}

        <div style={{ marginBottom: mobile ? 28 : 44 }}>
          <h1 style={{ fontFamily: 'Inter,system-ui', fontWeight: 900,
            fontSize: mobile ? 30 : 42, color: BD.text, letterSpacing: -2,
            lineHeight: 1, margin: 0 }}>
            Tu sesión.{' '}
            <span style={{ fontFamily: '"Instrument Serif",serif', fontStyle: 'italic',
              fontWeight: 400, color: BD.sub, letterSpacing: -1 }}>
              Toca un músculo.
            </span>
          </h1>
        </div>

        <div style={{ display: 'flex', gap: mobile ? 0 : 48,
          alignItems: 'flex-start', flexDirection: mobile ? 'column' : 'row' }}>

          {/* IZQUIERDA — mapa corporal */}
          <div style={{ width: mobile ? '100%' : 280, flexShrink: 0, marginBottom: mobile ? 32 : 0 }}>
            <div style={{ display: 'flex', gap: 3, marginBottom: 18,
              background: 'rgba(255,255,255,0.04)', borderRadius: 10, padding: 3 }}>
              {[['front', 'Frontal'], ['back', 'Posterior']].map(([v, lbl]) => (
                <button key={v} onClick={() => setView(v)}
                  style={{ flex: 1, padding: '8px 0', borderRadius: 7, border: 'none', cursor: 'pointer',
                    background: view === v ? BD.blue : 'transparent',
                    color: view === v ? '#fff' : BD.muted,
                    fontFamily: 'Inter,system-ui', fontSize: 11, fontWeight: 700, transition: 'all .14s' }}>
                  {lbl}
                </button>
              ))}
            </div>
            <div style={{ maxWidth: mobile ? 220 : 'none', margin: mobile ? '0 auto' : '0' }}>
              <BodyMap view={view} selected={muscle} onPick={pickMuscle} />
            </div>
            {workout.length > 0 && (
              <button onClick={() => navigate('/coach')}
                style={{ marginTop: 18, width: '100%', padding: '10px 0', borderRadius: 10,
                  border: '1px solid rgba(59,130,246,0.30)', background: 'rgba(59,130,246,0.08)',
                  color: '#93C5FD', fontFamily: 'Inter,system-ui', fontSize: 12, fontWeight: 700,
                  cursor: 'pointer' }}>
                Analizar con Coach →
              </button>
            )}
          </div>

          {/* DERECHA — panel contextual */}
          <div style={{ flex: 1, minWidth: 0, width: mobile ? '100%' : undefined,
            maxHeight: mobile ? 'none' : 700, overflowY: mobile ? 'visible' : 'auto' }}>
            {mode === 'empty' && <EmptyPanel onPick={pickMuscle} />}
            {mode === 'overview' && muscle && (
              <MusclePanel
                id={muscle} sessionExs={sessionExsForMuscle}
                onAddEx={() => setMode('picker')}
                onRemoveEx={removeEx} onEditEx={editEx}
              />
            )}
            {mode === 'picker' && muscle && (
              <Picker
                id={muscle} exercises={muscleExs} sessionIds={sessionIds}
                onSelect={pickExercise} onBack={() => setMode('overview')}
              />
            )}
            {mode === 'config' && cfgEx && (
              <SetConfig
                key={cfgEx.id} ex={cfgEx} initSets={cfgSets}
                onConfirm={confirmSets}
                onBack={() => setMode(muscle ? 'picker' : 'empty')}
              />
            )}
          </div>
        </div>
      </div>

      {workout.length > 0 && (
        <WorkoutBar
          workout={workout} saved={saved} duration={duration}
          onSave={save} mobile={mobile}
        />
      )}
    </section>
  );
}

Object.assign(window, { BuilderSection });
