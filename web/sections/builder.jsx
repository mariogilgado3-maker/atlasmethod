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

  // on/off/idle opacity system — non-selected zones dim when there's a selection
  function zone(id) {
    const sel    = selected === id;
    const hovr   = hov === id;
    const hasSel = selected !== null;
    const opacity = sel              ? 1
                  : hasSel && hovr   ? 0.22
                  : hasSel           ? 0.07
                  : hovr             ? 0.92
                  :                    0.55;
    return {
      opacity,
      filter: sel ? 'url(#glow-sel)' : hovr ? 'url(#glow-hov)' : undefined,
      style: { cursor: 'pointer', transition: 'opacity .22s ease' },
      onMouseEnter: () => setHov(id),
      onMouseLeave: () => setHov(null),
      onClick: () => onPick(id),
    };
  }

  const bf = { fill: 'url(#bGrad)', stroke: 'rgba(255,255,255,0.06)', strokeWidth: 0.5 };
  const B  = '#3B82F6'; // zone fill colour

  return (
    <div>
      <svg viewBox="0 0 200 440"
        style={{ width: '100%', maxWidth: 260, display: 'block', margin: '0 auto', overflow: 'visible' }}>
        <defs>
          <radialGradient id="bGrad" cx="100" cy="110" r="160" gradientUnits="userSpaceOnUse">
            <stop offset="0%"   stopColor="#28304a" />
            <stop offset="50%"  stopColor="#151c2c" />
            <stop offset="100%" stopColor="#0c1018" />
          </radialGradient>
          <radialGradient id="shadowGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%"   stopColor="rgba(0,0,0,0.55)" />
            <stop offset="100%" stopColor="rgba(0,0,0,0)" />
          </radialGradient>
          <radialGradient id="specGrad" cx="50%" cy="40%" r="55%">
            <stop offset="0%"   stopColor="rgba(255,255,255,0.07)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0)" />
          </radialGradient>
          <filter id="glow-hov" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="3.5" result="b" />
            <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
          <filter id="glow-sel" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="b" />
            <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
        </defs>

        {/* Ground shadow */}
        <ellipse cx="100" cy="432" rx="38" ry="5" fill="url(#shadowGrad)" />

        {/* ── SILHOUETTE (paths ported from reference, dark-adapted) ── */}
        <ellipse cx="100" cy="28" rx="18" ry="22" {...bf} />
        <path d="M84 40 Q84 52 100 56 Q116 52 116 40"                                                       {...bf} />
        <path d="M93 54 Q93 66 95 68 L105 68 Q107 66 107 54 Z"                                              {...bf} />
        <path d="M72 70 Q64 74 60 84 L62 108 Q68 104 80 100 L80 78 Z"                                       {...bf} />
        <path d="M128 70 Q136 74 140 84 L138 108 Q132 104 120 100 L120 78 Z"                                {...bf} />
        <path d="M80 68 Q72 70 68 80 L66 130 Q66 148 72 156 L84 160 L100 162 L116 160 L128 156 Q134 148 134 130 L132 80 Q128 70 120 68 Z" {...bf} />
        <path d="M68 78 Q58 82 54 98 L52 136 Q52 146 58 150 L68 152 L72 108 L72 80 Z"                      {...bf} />
        <path d="M132 78 Q142 82 146 98 L148 136 Q148 146 142 150 L132 152 L128 108 L128 80 Z"              {...bf} />
        <path d="M52 134 Q48 156 50 176 Q52 182 58 184 L64 184 L68 152 Z"                                   {...bf} />
        <path d="M148 134 Q152 156 150 176 Q148 182 142 184 L136 184 L132 152 Z"                            {...bf} />
        <path d="M50 174 Q46 182 48 192 Q50 198 57 198 L63 198 Q66 194 64 184 Z"                            {...bf} />
        <path d="M150 174 Q154 182 152 192 Q150 198 143 198 L137 198 Q134 194 136 184 Z"                    {...bf} />
        <path d="M72 156 L84 160 L100 162 L116 160 L128 156 Q132 164 130 174 L70 174 Q68 164 72 156 Z"      {...bf} />
        <path d="M70 172 Q64 178 62 196 L60 240 Q60 252 66 258 L78 260 L82 198 L82 172 Z"                   {...bf} />
        <path d="M130 172 Q136 178 138 196 L140 240 Q140 252 134 258 L122 260 L118 198 L118 172 Z"          {...bf} />
        <path d="M60 238 Q58 268 60 296 Q62 308 68 310 L78 310 Q80 306 80 296 L78 258 Z"                    {...bf} />
        <path d="M140 238 Q142 268 140 296 Q138 308 132 310 L122 310 Q120 306 120 296 L122 258 Z"           {...bf} />
        <path d="M60 306 Q56 316 58 322 Q62 328 74 328 L80 328 Q82 322 80 310 Z"                            {...bf} />
        <path d="M140 306 Q144 316 142 322 Q138 328 126 328 L120 328 Q118 322 120 310 Z"                    {...bf} />

        {/* Specular highlight */}
        <ellipse cx="86"  cy="85" rx="12" ry="17" fill="url(#specGrad)" style={{ pointerEvents:'none' }} />
        <ellipse cx="114" cy="85" rx="12" ry="17" fill="url(#specGrad)" style={{ pointerEvents:'none' }} />

        {/* Clavicle lines (front) */}
        {view === 'front' && (
          <g fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth=".8" strokeLinecap="round" style={{ pointerEvents:'none' }}>
            <path d="M95 70 Q88 72 80 76" />
            <path d="M105 70 Q112 72 120 76" />
            <path d="M86 172 L88 258" />
            <path d="M114 172 L112 258" />
          </g>
        )}
        {/* Spine dashes (back) */}
        {view === 'back' && (
          <path d="M100 72 L100 156" fill="none" stroke="rgba(255,255,255,0.08)"
            strokeWidth=".7" strokeLinecap="round" strokeDasharray="2 3"
            style={{ pointerEvents:'none' }} />
        )}

        {/* ── FRONT ZONES ── */}
        {view === 'front' && (
          <>
            {/* Chest — two pec shapes */}
            <g {...zone('pecho')}>
              <path d="M82 84 Q78 86 76 96 L76 116 Q80 122 90 122 L98 120 L98 84 Q90 82 82 84 Z"            fill={B} opacity=".78" />
              <path d="M118 84 Q122 86 124 96 L124 116 Q120 122 110 122 L102 120 L102 84 Q110 82 118 84 Z"  fill={B} opacity=".78" />
            </g>
            {/* Shoulders */}
            <g {...zone('hombro')}>
              <ellipse cx="70"  cy="84" rx="10" ry="11" fill={B} opacity=".72" />
              <ellipse cx="130" cy="84" rx="10" ry="11" fill={B} opacity=".72" />
            </g>
            {/* Biceps */}
            <g {...zone('biceps')}>
              <path d="M56 90 Q52 96 52 114 L58 120 L66 118 L68 96 Q66 88 60 88 Z"              fill={B} opacity=".72" />
              <path d="M144 90 Q148 96 148 114 L142 120 L134 118 L132 96 Q134 88 140 88 Z"      fill={B} opacity=".72" />
            </g>
            {/* Triceps (ghost — visible from front at low opacity) */}
            <g {...zone('triceps')}>
              <path d="M56 102 Q52 114 54 130 L60 134 L66 132 L66 110 Z"   fill={B} opacity=".38" />
              <path d="M144 102 Q148 114 146 130 L140 134 L134 132 L134 110 Z" fill={B} opacity=".38" />
            </g>
            {/* Core — individual ab cells */}
            <g {...zone('core')}>
              <rect x="86"  y="126" width="12" height="9"  rx="3" fill={B} opacity=".70" />
              <rect x="102" y="126" width="12" height="9"  rx="3" fill={B} opacity=".70" />
              <rect x="86"  y="139" width="12" height="9"  rx="3" fill={B} opacity=".66" />
              <rect x="102" y="139" width="12" height="9"  rx="3" fill={B} opacity=".66" />
              <rect x="87"  y="152" width="11" height="7"  rx="3" fill={B} opacity=".52" />
              <rect x="102" y="152" width="11" height="7"  rx="3" fill={B} opacity=".52" />
            </g>
            {/* Quads + calves — both part of piernas */}
            <g {...zone('piernas')}>
              <path d="M64 180 Q60 196 60 220 L66 228 L78 224 L80 196 L80 178 Q72 176 64 180 Z"            fill={B} opacity=".72" />
              <path d="M136 180 Q140 196 140 220 L134 228 L122 224 L120 196 L120 178 Q128 176 136 180 Z"   fill={B} opacity=".72" />
              <path d="M62 248 Q60 268 62 286 L68 292 L76 290 L76 266 L72 248 Z"                           fill={B} opacity=".62" />
              <path d="M138 248 Q140 268 138 286 L132 292 L124 290 L124 266 L128 248 Z"                    fill={B} opacity=".62" />
            </g>
            {/* Glutes (ghost from front) */}
            <g {...zone('gluteos')}>
              <path d="M72 162 Q68 170 70 178 L86 178 L86 160 Z"    fill={B} opacity=".38" />
              <path d="M128 162 Q132 170 130 178 L114 178 L114 160 Z" fill={B} opacity=".38" />
            </g>
            {/* Back (ghost from front) */}
            <g {...zone('espalda')}>
              <ellipse cx="100" cy="100" rx="22" ry="14" fill={B} opacity=".11" />
            </g>
          </>
        )}

        {/* ── BACK ZONES ── */}
        {view === 'back' && (
          <>
            {/* Lats + traps */}
            <g {...zone('espalda')}>
              <path d="M82 74 Q76 78 74 90 L76 108 Q84 112 100 112 Q116 112 124 108 L126 90 Q124 78 118 74 Q110 70 100 70 Q90 70 82 74 Z" fill={B} opacity=".76" />
            </g>
            {/* Shoulders */}
            <g {...zone('hombro')}>
              <ellipse cx="70"  cy="84" rx="10" ry="11" fill={B} opacity=".72" />
              <ellipse cx="130" cy="84" rx="10" ry="11" fill={B} opacity=".72" />
            </g>
            {/* Triceps */}
            <g {...zone('triceps')}>
              <path d="M56 88 Q52 102 54 124 L62 128 L68 124 L68 100 L62 86 Z"              fill={B} opacity=".76" />
              <path d="M144 88 Q148 102 146 124 L138 128 L132 124 L132 100 L138 86 Z"       fill={B} opacity=".76" />
            </g>
            {/* Biceps (ghost from back) */}
            <g {...zone('biceps')}>
              <path d="M56 90 Q52 104 54 118 L60 122 L66 120 L66 100 Z"   fill={B} opacity=".22" />
              <path d="M144 90 Q148 104 146 118 L140 122 L134 120 L134 100 Z" fill={B} opacity=".22" />
            </g>
            {/* Core — lumbar */}
            <g {...zone('core')}>
              <path d="M84 130 Q80 138 82 150 L100 152 L118 150 Q120 138 116 130 Z" fill={B} opacity=".60" />
            </g>
            {/* Glutes */}
            <g {...zone('gluteos')}>
              <ellipse cx="79"  cy="170" rx="11" ry="12" fill={B} opacity=".76" />
              <ellipse cx="121" cy="170" rx="11" ry="12" fill={B} opacity=".76" />
            </g>
            {/* Hamstrings + calves — both part of piernas */}
            <g {...zone('piernas')}>
              <path d="M64 180 Q60 198 60 222 L68 230 L80 226 L80 198 L78 178 Q72 176 64 180 Z"            fill={B} opacity=".76" />
              <path d="M136 180 Q140 198 140 222 L132 230 L120 226 L120 198 L122 178 Q128 176 136 180 Z"   fill={B} opacity=".76" />
              <path d="M62 248 Q58 270 62 290 L70 298 L78 294 L76 268 L72 248 Z"                           fill={B} opacity=".62" />
              <path d="M138 248 Q142 270 138 290 L130 298 L122 294 L124 268 L128 248 Z"                    fill={B} opacity=".62" />
            </g>
            {/* Chest (ghost from back) */}
            <g {...zone('pecho')}>
              <ellipse cx="100" cy="96" rx="18" ry="10" fill={B} opacity=".10" />
            </g>
          </>
        )}

        {/* Floating label */}
        {(hov || selected) && (
          <text x="100" y="436" textAnchor="middle"
            fill="rgba(232,237,248,0.48)" fontSize="8.5"
            fontFamily="Inter,system-ui" fontWeight="700" letterSpacing="1.8">
            {MUSCLES[hov || selected]?.label.toUpperCase()}
          </text>
        )}
      </svg>

      <div style={{ display:'flex', gap:'8px 14px', marginTop:12, justifyContent:'center', flexWrap:'wrap' }}>
        {[['rgba(59,130,246,0.22)','Inactivo'],['rgba(59,130,246,0.65)','Seleccionado']].map(([c,l]) => (
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
