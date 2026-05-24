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

// ── Mapa corporal premium ──────────────────────────────────────────────────────
function BodyMap({ view, selected, onPick }) {
  const [hov, setHov] = React.useState(null);

  function zone(id) {
    const sel  = selected === id;
    const hovr = hov === id;
    return {
      fill:        sel  ? 'rgba(59,130,246,0.50)'
                 : hovr ? 'rgba(59,130,246,0.18)'
                 :        'rgba(255,255,255,0.04)',
      stroke:      sel  ? 'rgba(147,197,253,0.90)'
                 : hovr ? 'rgba(147,197,253,0.45)'
                 :        'rgba(255,255,255,0.10)',
      strokeWidth: sel ? 1.2 : hovr ? 0.7 : 0.4,
      filter:      sel ? 'url(#glow-sel)' : hovr ? 'url(#glow-hov)' : undefined,
      style:       { cursor: 'pointer', transition: 'fill .22s, stroke .22s, stroke-width .22s' },
      onMouseEnter: () => setHov(id),
      onMouseLeave: () => setHov(null),
      onClick:      () => onPick(id),
    };
  }

  // static body fill
  const bf = { fill: 'url(#bGrad)', stroke: 'rgba(255,255,255,0.07)', strokeWidth: 0.4 };
  // muscle-definition lines (decorative only)
  const ml  = { fill: 'none', stroke: 'rgba(255,255,255,0.09)', strokeWidth: 0.5, strokeLinecap: 'round' };
  const ml2 = { fill: 'none', stroke: 'rgba(255,255,255,0.05)', strokeWidth: 0.35, strokeLinecap: 'round' };

  return (
    <div>
      <svg viewBox="0 0 200 460" style={{ width: '100%', maxWidth: 260, display: 'block', margin: '0 auto' }}>
        <defs>
          {/* Central radial gradient — gives depth to silhouette */}
          <radialGradient id="bGrad" cx="100" cy="120" r="165" gradientUnits="userSpaceOnUse">
            <stop offset="0%"   stopColor="#28304a" />
            <stop offset="50%"  stopColor="#151c2c" />
            <stop offset="100%" stopColor="#0c1018" />
          </radialGradient>
          {/* Subtle specular highlight */}
          <radialGradient id="specGrad" cx="50%" cy="40%" r="55%">
            <stop offset="0%"   stopColor="rgba(255,255,255,0.08)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0)" />
          </radialGradient>
          {/* Hover glow */}
          <filter id="glow-hov" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="3.5" result="b" />
            <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
          {/* Selected glow — stronger */}
          <filter id="glow-sel" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="b" />
            <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
        </defs>

        {/* ── SILHOUETTE ─────────────────────────────────────────── */}
        {/* Head + ears */}
        <circle cx="100" cy="28" r="19" {...bf} />
        <ellipse cx="81.5" cy="28" rx="2.5" ry="3.5" {...bf} />
        <ellipse cx="118.5" cy="28" rx="2.5" ry="3.5" {...bf} />
        {/* Neck */}
        <path d="M 93 46 L 107 46 L 109 61 L 91 61 Z" {...bf} />
        {/* Trap wedge at base of neck */}
        <path d="M 79 62 Q 100 57 121 62 L 116 70 Q 100 66 84 70 Z" {...bf} />
        {/* Torso */}
        <path d="M 58 65 C 43 68 35 80 34 96 L 32 172 C 32 184 39 193 51 197 L 67 203 L 88 209 L 100 211 L 112 209 L 133 203 L 149 197 C 161 193 168 184 168 172 L 166 96 C 165 80 157 68 142 65 C 130 62 116 60 100 60 C 84 60 70 62 58 65 Z" {...bf} />
        {/* Left upper arm */}
        <path d="M 35 70 C 23 75 17 91 17 111 L 17 168 C 17 179 22 187 31 189 L 42 189 C 51 189 55 181 55 170 L 55 111 C 55 91 49 75 40 70 Z" {...bf} />
        {/* Right upper arm */}
        <path d="M 165 70 C 177 75 183 91 183 111 L 183 168 C 183 179 178 187 169 189 L 158 189 C 149 189 145 181 145 170 L 145 111 C 145 91 151 75 160 70 Z" {...bf} />
        {/* Left forearm */}
        <path d="M 18 168 C 14 173 13 183 13 194 L 15 242 C 16 253 21 259 29 260 L 38 260 C 46 259 49 252 48 241 L 46 194 C 46 183 44 173 42 170 Z" {...bf} />
        {/* Right forearm */}
        <path d="M 182 168 C 186 173 187 183 187 194 L 185 242 C 184 253 179 259 171 260 L 162 260 C 154 259 151 252 152 241 L 154 194 C 154 183 156 173 158 170 Z" {...bf} />
        {/* Hands */}
        <ellipse cx="30"  cy="264" rx="10" ry="7" {...bf} />
        <ellipse cx="170" cy="264" rx="10" ry="7" {...bf} />
        {/* Left thigh */}
        <path d="M 63 207 C 55 215 50 235 50 265 L 50 316 C 50 333 57 343 70 344 L 83 344 C 96 343 99 332 98 315 L 97 265 C 96 235 91 215 84 207 Z" {...bf} />
        {/* Right thigh */}
        <path d="M 137 207 C 145 215 150 235 150 265 L 150 316 C 150 333 143 343 130 344 L 117 344 C 104 343 101 332 102 315 L 103 265 C 104 235 109 215 116 207 Z" {...bf} />
        {/* Left shin */}
        <path d="M 52 318 C 48 328 46 348 47 376 L 49 411 C 50 423 57 431 65 432 L 76 432 C 85 431 88 422 87 410 L 85 376 C 84 348 83 328 80 318 Z" {...bf} />
        {/* Right shin */}
        <path d="M 148 318 C 152 328 154 348 153 376 L 151 411 C 150 423 143 431 135 432 L 124 432 C 115 431 112 422 113 410 L 115 376 C 116 348 117 328 120 318 Z" {...bf} />
        {/* Feet */}
        <path d="M 47 430 C 42 432 38 437 40 441 L 84 441 C 86 437 84 431 80 430 Z" {...bf} />
        <path d="M 153 430 C 158 432 162 437 160 441 L 116 441 C 114 437 116 431 120 430 Z" {...bf} />

        {/* Specular highlight — top-left light source */}
        <ellipse cx="85"  cy="82" rx="13" ry="19" fill="url(#specGrad)" style={{ pointerEvents:'none' }} />
        <ellipse cx="115" cy="82" rx="13" ry="19" fill="url(#specGrad)" style={{ pointerEvents:'none' }} />

        {/* ── MUSCLE DEFINITION LINES ─────────────────────────────── */}
        {view === 'front' && (
          <g style={{ pointerEvents:'none' }}>
            <line x1="100" y1="64" x2="100" y2="113" {...ml} />
            <path d="M 68 72 Q 85 80 99 92"   {...ml2} />
            <path d="M 132 72 Q 115 80 101 92" {...ml2} />
            <path d="M 66 68 Q 100 63 134 68"  {...ml} />
            <line x1="100" y1="113" x2="100" y2="170" {...ml} />
            <path d="M 84 122 Q 100 120 116 122" {...ml2} />
            <path d="M 83 135 Q 100 133 117 135" {...ml2} />
            <path d="M 83 148 Q 100 146 117 148" {...ml2} />
            <path d="M 72 220 C 71 250 71 272 73 290"  {...ml2} />
            <path d="M 128 220 C 129 250 129 272 127 290" {...ml2} />
          </g>
        )}
        {view === 'back' && (
          <g style={{ pointerEvents:'none' }}>
            <line x1="100" y1="65" x2="100" y2="178" {...ml} />
            <path d="M 72 68 Q 100 62 128 68"     {...ml} />
            <path d="M 100 77 C 96 102 90 130 82 157"  {...ml2} />
            <path d="M 100 77 C 104 102 110 130 118 157" {...ml2} />
            <line x1="100" y1="198" x2="100" y2="236" {...ml} />
            <path d="M 62 231 Q 80 240 100 237 Q 120 240 138 231" {...ml2} />
            <path d="M 72 258 C 71 280 71 300 72 318"  {...ml2} />
            <path d="M 128 258 C 129 280 129 300 128 318" {...ml2} />
          </g>
        )}

        {/* ── INTERACTIVE ZONES ───────────────────────────────────── */}
        {view === 'front' ? (
          <React.Fragment>
            <ellipse cx="38"  cy="78"  rx="14" ry="11" {...zone('hombro')} />
            <ellipse cx="162" cy="78"  rx="14" ry="11" {...zone('hombro')} />
            <path d="M 66 70 C 61 71 58 80 59 93 C 60 105 68 113 79 114 L 99 114 L 99 70 Z"   {...zone('pecho')} />
            <path d="M 134 70 C 139 71 142 80 141 93 C 140 105 132 113 121 114 L 101 114 L 101 70 Z" {...zone('pecho')} />
            <ellipse cx="21"  cy="121" rx="7"  ry="23" {...zone('biceps')} />
            <ellipse cx="179" cy="121" rx="7"  ry="23" {...zone('biceps')} />
            <path d="M 83 114 L 117 114 L 116 171 L 84 171 Z" {...zone('core')} />
            <ellipse cx="68"  cy="273" rx="17" ry="44" {...zone('piernas')} />
            <ellipse cx="132" cy="273" rx="17" ry="44" {...zone('piernas')} />
          </React.Fragment>
        ) : (
          <React.Fragment>
            <ellipse cx="38"  cy="78"  rx="14" ry="11" {...zone('hombro')} />
            <ellipse cx="162" cy="78"  rx="14" ry="11" {...zone('hombro')} />
            <path d="M 68 65 L 100 73 L 132 65 C 122 59 78 59 68 65 Z"                                {...zone('espalda')} />
            <path d="M 59 82 C 51 95 49 117 51 139 C 53 159 63 169 76 172 L 99 173 L 99 79 Z"         {...zone('espalda')} />
            <path d="M 141 82 C 149 95 151 117 149 139 C 147 159 137 169 124 172 L 101 173 L 101 79 Z" {...zone('espalda')} />
            <ellipse cx="21"  cy="121" rx="7"  ry="23" {...zone('triceps')} />
            <ellipse cx="179" cy="121" rx="7"  ry="23" {...zone('triceps')} />
            <ellipse cx="100" cy="178" rx="18" ry="12" {...zone('core')} />
            <ellipse cx="77"  cy="217" rx="21" ry="22" {...zone('gluteos')} />
            <ellipse cx="123" cy="217" rx="21" ry="22" {...zone('gluteos')} />
            <ellipse cx="68"  cy="284" rx="17" ry="40" {...zone('piernas')} />
            <ellipse cx="132" cy="284" rx="17" ry="40" {...zone('piernas')} />
          </React.Fragment>
        )}

        {/* Floating muscle label */}
        {(hov || selected) && (
          <text x="100" y="453" textAnchor="middle"
            fill="rgba(232,237,248,0.48)" fontSize="8.5"
            fontFamily="Inter,system-ui" fontWeight="700" letterSpacing="1.8">
            {MUSCLES[hov || selected]?.label.toUpperCase()}
          </text>
        )}
      </svg>

      <div style={{ display:'flex', gap:'8px 14px', marginTop:12, justifyContent:'center', flexWrap:'wrap' }}>
        {[['rgba(255,255,255,0.10)','Inactivo'],['rgba(59,130,246,0.50)','Seleccionado']].map(([c,l]) => (
          <span key={l} style={{ display:'flex', alignItems:'center', gap:5 }}>
            <span style={{ width:7, height:7, borderRadius:2, background:c, display:'inline-block' }} />
            <span style={{ fontFamily:'Inter,system-ui', fontSize:10, color:BD.muted }}>{l}</span>
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
      <div style={{ fontFamily: '"Space Grotesk",system-ui', fontWeight: 600,
        fontSize: 26, color: BD.sub, marginBottom: 10, lineHeight: 1.2 }}>
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

  // Load routine sent from Atlas Coach
  React.useEffect(() => {
    const raw = localStorage.getItem('atlas.pendingWorkout');
    if (!raw) return;
    try {
      const exs = JSON.parse(raw);
      if (Array.isArray(exs) && exs.length > 0) {
        setWorkout(exs);
        localStorage.removeItem('atlas.pendingWorkout');
      }
    } catch {}
  }, []);

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
            <span style={{ fontFamily: '"Space Grotesk",system-ui',
              fontWeight: 400, color: BD.sub, letterSpacing: -0.5 }}>
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
