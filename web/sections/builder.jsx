// Atlas Builder v7 — muscle priority system

// ── Design tokens ─────────────────────────────────────────────────────────────
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

// ── 19-zone muscle map ────────────────────────────────────────────────────────
// view: 'front' | 'back' | 'both'
// group: functional category for grouping in UI
const MUSCLES = {
  // ─ Front ─
  pecho:      { label: 'Pecho',              view: 'front', group: 'torso'   },
  delt_ant:   { label: 'Deltoides anterior', view: 'front', group: 'hombros' },
  delt_lat:   { label: 'Deltoides lateral',  view: 'both',  group: 'hombros' },
  biceps:     { label: 'Bíceps',             view: 'front', group: 'brazos'  },
  antebrazo:  { label: 'Antebrazo',          view: 'both',  group: 'brazos'  },
  core:       { label: 'Abdominales',        view: 'both',  group: 'core'    },
  oblicuos:   { label: 'Oblicuos',           view: 'front', group: 'core'    },
  cuadriceps: { label: 'Cuádriceps',         view: 'front', group: 'piernas' },
  aductores:  { label: 'Aductores',          view: 'front', group: 'piernas' },
  gemelos:    { label: 'Gemelos',            view: 'both',  group: 'piernas' },
  tibial:     { label: 'Tibial anterior',    view: 'front', group: 'piernas' },
  // ─ Back ─
  trapecio:   { label: 'Trapecio',           view: 'back',  group: 'torso'   },
  dorsal:     { label: 'Dorsal ancho',       view: 'back',  group: 'torso'   },
  delt_post:  { label: 'Deltoides posterior',view: 'back',  group: 'hombros' },
  triceps:    { label: 'Tríceps',            view: 'back',  group: 'brazos'  },
  lumbar:     { label: 'Lumbar',             view: 'back',  group: 'core'    },
  gluteos:    { label: 'Glúteos',            view: 'back',  group: 'gluteos' },
  isquio:     { label: 'Isquiotibiales',     view: 'back',  group: 'piernas' },
  abductores: { label: 'Abductores',         view: 'back',  group: 'piernas' },
  erectores:  { label: 'Erectores espinales',view: 'back',  group: 'core'    },
};

// ── Science data (Israetel MEV/MAV/MRV — sets per week) ──────────────────────
const MUSCLE_SCIENCE = {
  pecho:      { mev: 10, mav: 16, mrv: 22, freq: 2, sti: 0.80 },
  delt_ant:   { mev: 4,  mav: 8,  mrv: 14, freq: 2, sti: 0.70 },
  delt_lat:   { mev: 8,  mav: 14, mrv: 20, freq: 2, sti: 0.75 },
  delt_post:  { mev: 10, mav: 16, mrv: 22, freq: 2, sti: 0.70 },
  biceps:     { mev: 8,  mav: 14, mrv: 20, freq: 2, sti: 0.65 },
  antebrazo:  { mev: 6,  mav: 12, mrv: 18, freq: 3, sti: 0.60 },
  triceps:    { mev: 8,  mav: 14, mrv: 20, freq: 2, sti: 0.75 },
  core:       { mev: 8,  mav: 16, mrv: 24, freq: 3, sti: 0.65 },
  oblicuos:   { mev: 6,  mav: 12, mrv: 18, freq: 2, sti: 0.60 },
  trapecio:   { mev: 8,  mav: 14, mrv: 20, freq: 2, sti: 0.70 },
  dorsal:     { mev: 10, mav: 16, mrv: 22, freq: 2, sti: 0.80 },
  lumbar:     { mev: 6,  mav: 10, mrv: 14, freq: 2, sti: 0.70 },
  cuadriceps: { mev: 8,  mav: 14, mrv: 20, freq: 2, sti: 0.80 },
  aductores:  { mev: 6,  mav: 10, mrv: 16, freq: 2, sti: 0.60 },
  gluteos:    { mev: 8,  mav: 16, mrv: 24, freq: 2, sti: 0.75 },
  isquio:     { mev: 8,  mav: 14, mrv: 20, freq: 2, sti: 0.75 },
  gemelos:    { mev: 10, mav: 16, mrv: 22, freq: 3, sti: 0.60 },
  abductores: { mev: 6,  mav: 10, mrv: 16, freq: 2, sti: 0.60 },
  tibial:     { mev: 4,  mav: 8,  mrv: 12, freq: 3, sti: 0.50 },
  erectores:  { mev: 6,  mav: 10, mrv: 14, freq: 2, sti: 0.70 },
};

// ── Pares antagonistas para análisis de equilibrio ────────────────────────────
const BALANCE_PAIRS = [
  {
    id: 'push-pull',
    labelA: 'Pecho + Empuje', idsA: ['pecho', 'delt_ant', 'triceps'],
    labelB: 'Espalda + Tracción', idsB: ['dorsal', 'trapecio', 'delt_post', 'biceps'],
    maxRatio: 1.35,
    advice: 'Dominio de empuje sobre tracción. Añade remos, jalones o face pulls. La ratio ideal es ~1:1 o más tracción.',
  },
  {
    id: 'quad-post',
    labelA: 'Cuádriceps', idsA: ['cuadriceps'],
    labelB: 'Isquio + Glúteos', idsB: ['isquio', 'gluteos'],
    maxRatio: 2.2,
    advice: 'Cuádriceps mucho más trabajado que la cadena posterior. Incluye sentadillas rumanas, peso muerto y hip thrust para proteger la rodilla.',
  },
  {
    id: 'biceps-triceps',
    labelA: 'Bíceps', idsA: ['biceps'],
    labelB: 'Tríceps', idsB: ['triceps'],
    maxRatio: 2.5, minRatio: 0.4,
    adviceHigh: 'Mucho más bíceps que tríceps. El tríceps constituye 2/3 del volumen del brazo.',
    adviceLow: 'Mucho más tríceps que bíceps. Añade trabajo de curls para equilibrar.',
  },
  {
    id: 'delt-ant-post',
    labelA: 'Deltoides anterior', idsA: ['delt_ant'],
    labelB: 'Deltoides posterior', idsB: ['delt_post'],
    maxRatio: 1.8,
    advice: 'Deltoides anterior dominante. El deltoides posterior —el más olvidado— es clave para la salud del manguito rotador.',
  },
];

// ── Equipment display ─────────────────────────────────────────────────────────
const EQ_META = {
  barra:      { label: 'Barra',      color: '#F59E0B', bg: 'rgba(245,158,11,0.14)' },
  mancuernas: { label: 'Mancuernas', color: '#3B82F6', bg: 'rgba(59,130,246,0.14)' },
  bodyweight: { label: 'Bodyweight', color: '#22C55E', bg: 'rgba(34,197,94,0.14)'  },
  polea:      { label: 'Polea',      color: '#A855F7', bg: 'rgba(168,85,247,0.14)' },
  máquina:    { label: 'Máquina',    color: '#94A3B8', bg: 'rgba(148,163,184,0.14)'},
  kettlebell: { label: 'Kettlebell', color: '#EF4444', bg: 'rgba(239,68,68,0.14)'  },
};

const LVL_COLOR = { principiante:'#22C55E', intermedio:'#F59E0B', avanzado:'#EF4444' };
const LVL_LABEL = { principiante:'Básico', intermedio:'Intermedio', avanzado:'Avanzado' };

// ── Helpers ───────────────────────────────────────────────────────────────────
function exEquipment(ex) {
  const eq = ex.equipment;
  if (!eq) return [];
  return Array.isArray(eq) ? eq : [eq];
}

function exGroup(ex) {
  if (ex.group) return ex.group;
  const p   = ex.pattern || '';
  const pm0 = (ex.muscles?.primary[0] || '').toLowerCase();

  if (p === 'empuje-horizontal') {
    if (pm0.includes('tríceps') || pm0.includes('triceps')) return 'triceps';
    return 'pecho';
  }
  if (p === 'empuje-vertical') {
    if (pm0.includes('medial') || pm0.includes('lateral')) return 'delt_lat';
    if (pm0.includes('tríceps') || pm0.includes('triceps')) return 'triceps';
    return 'delt_ant';
  }
  if (p === 'traccion-horizontal') {
    if (pm0.includes('post')) return 'delt_post';
    if (pm0.includes('trapecio')) return 'trapecio';
    return 'dorsal';
  }
  if (p === 'traccion-vertical') {
    if (pm0.includes('bíceps') || pm0.includes('braquial')) return 'biceps';
    return 'dorsal';
  }
  if (p === 'sentadilla') return 'cuadriceps';
  if (p === 'bisagra')    return 'isquio';
  if (p === 'aislamiento-pantorrilla') return 'gemelos';
  if (p.startsWith('core')) return 'core';
  return 'core';
}

function exsForMuscle(id, all) {
  const g = id;
  // Special cases with multiple patterns
  if (id === 'dorsal')     return all.filter(e => exGroup(e) === 'dorsal' || (e.pattern === 'traccion-vertical' && exGroup(e) === 'dorsal'));
  if (id === 'gluteos')    return all.filter(e => e.group === 'gluteos' || (e.pattern === 'bisagra' && (e.muscles?.primary[0]||'').toLowerCase().includes('glút')));
  if (id === 'isquio')     return all.filter(e => exGroup(e) === 'isquio' && e.group !== 'gluteos');
  if (id === 'core')       return all.filter(e => exGroup(e) === 'core' && !['oblicuos'].includes(e.group));
  if (id === 'cuadriceps') return all.filter(e => (e.pattern === 'sentadilla' || exGroup(e) === 'cuadriceps') && !['aductores'].includes(e.group));
  return all.filter(e => exGroup(e) === g);
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

// ── Weekly volume helper ──────────────────────────────────────────────────────
function setsThisWeek(muscleId, log) {
  const now  = Date.now();
  const week = 7 * 24 * 60 * 60 * 1000;
  let total  = 0;
  for (const session of (log || [])) {
    if (now - (session.dateTs || 0) > week) continue;
    for (const ex of (session.exercises || [])) {
      if (ex.group === muscleId || exGroup(ex) === muscleId) {
        total += (ex.sets || []).length;
      }
    }
  }
  return total;
}

// ── Mapa corporal 19 zonas ────────────────────────────────────────────────────
function BodyMap({ view, selected, onPick, priorities }) {
  const [hov, setHov] = React.useState(null);

  function zone(id) {
    const sel    = selected === id;
    const hovr   = hov === id;
    const hasSel = selected !== null;
    const prio   = priorities[id] === 'priority';
    const maint  = priorities[id] === 'maintain';
    const red    = priorities[id] === 'reducir';

    const opacity = sel                ? 1
      : hasSel && hovr                 ? 0.24
      : hasSel && prio                 ? 0.32
      : hasSel && maint                ? 0.22
      : hasSel && red                  ? 0.16
      : hasSel                         ? 0.08
      : hovr                           ? 0.90
      : prio                           ? 0.78
      : maint                          ? 0.50
      : red                            ? 0.28
      :                                  0.36;

    const filter = sel               ? 'url(#glow-sel)'
                 : prio && !hasSel   ? 'url(#glow-prio)'
                 : hovr && !hasSel   ? 'url(#glow-hov)'
                 : undefined;

    return {
      opacity,
      filter,
      style: { cursor:'pointer', transition:'opacity .22s ease' },
      onMouseEnter: () => setHov(id),
      onMouseLeave: () => setHov(null),
      onClick: () => onPick(id),
    };
  }

  const bf = { fill:'url(#bGrad)', stroke:'rgba(255,255,255,0.06)', strokeWidth:0.5, style:{ pointerEvents:'none' } };
  const B  = '#3B82F6';

  return (
    <div>
      <svg viewBox="0 0 200 440"
        style={{ width:'100%', maxWidth:260, display:'block', margin:'0 auto', overflow:'visible' }}>
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
          <filter id="glow-prio" x="-25%" y="-25%" width="150%" height="150%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="2.5" result="b" />
            <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
        </defs>

        {/* Ground shadow */}
        <ellipse cx="100" cy="432" rx="38" ry="5" fill="url(#shadowGrad)" />

        {/* ── Body silhouette ── */}
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

        {/* Specular */}
        <ellipse cx="86"  cy="85" rx="12" ry="17" fill="url(#specGrad)" style={{pointerEvents:'none'}} />
        <ellipse cx="114" cy="85" rx="12" ry="17" fill="url(#specGrad)" style={{pointerEvents:'none'}} />

        {/* Decorative lines */}
        {view === 'front' && (
          <g fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth=".8" strokeLinecap="round" style={{pointerEvents:'none'}}>
            <path d="M95 70 Q88 72 80 76" /><path d="M105 70 Q112 72 120 76" />
            <path d="M86 172 L88 258" /><path d="M114 172 L112 258" />
          </g>
        )}
        {view === 'back' && (
          <path d="M100 72 L100 156" fill="none" stroke="rgba(255,255,255,0.08)"
            strokeWidth=".7" strokeLinecap="round" strokeDasharray="2 3" style={{pointerEvents:'none'}} />
        )}

        {/* ══════════════ FRONT ZONES ══════════════ */}
        {view === 'front' && (
          <>
            {/* Pecho */}
            <g {...zone('pecho')}>
              <path d="M82 84 Q78 86 76 96 L76 116 Q80 122 90 122 L98 120 L98 84 Q90 82 82 84 Z"           fill={B} opacity=".78" />
              <path d="M118 84 Q122 86 124 96 L124 116 Q120 122 110 122 L102 120 L102 84 Q110 82 118 84 Z" fill={B} opacity=".78" />
            </g>
            {/* Deltoides lateral */}
            <g {...zone('delt_lat')}>
              <ellipse cx="67"  cy="84" rx="10" ry="13" fill={B} opacity=".72" />
              <ellipse cx="133" cy="84" rx="10" ry="13" fill={B} opacity=".72" />
            </g>
            {/* Deltoides anterior */}
            <g {...zone('delt_ant')}>
              <ellipse cx="74"  cy="76" rx="7" ry="8" fill={B} opacity=".72" />
              <ellipse cx="126" cy="76" rx="7" ry="8" fill={B} opacity=".72" />
            </g>
            {/* Bíceps */}
            <g {...zone('biceps')}>
              <path d="M56 90 Q52 96 52 114 L58 120 L66 118 L68 96 Q66 88 60 88 Z"             fill={B} opacity=".72" />
              <path d="M144 90 Q148 96 148 114 L142 120 L134 118 L132 96 Q134 88 140 88 Z"     fill={B} opacity=".72" />
            </g>
            {/* Tríceps ghost — antes de antebrazo para que antebrazo quede encima en solapamiento */}
            <g {...zone('triceps')}>
              <path d="M56 102 Q52 114 54 130 L60 134 L66 132 L66 110 Z"                        fill={B} opacity=".32" />
              <path d="M144 102 Q148 114 146 130 L140 134 L134 132 L134 110 Z"                  fill={B} opacity=".32" />
            </g>
            {/* Antebrazo — paths ampliados (~20px) para zona click usable */}
            <g {...zone('antebrazo')}>
              <path d="M54 120 Q48 148 50 170 L60 180 L68 176 L66 148 L62 120 Z"               fill={B} opacity=".65" />
              <path d="M146 120 Q152 148 150 170 L140 180 L132 176 L134 148 L138 120 Z"        fill={B} opacity=".65" />
            </g>
            {/* Core / Abdominales */}
            <g {...zone('core')}>
              <rect x="86"  y="126" width="11" height="8"  rx="3" fill={B} opacity=".70" />
              <rect x="101" y="126" width="11" height="8"  rx="3" fill={B} opacity=".70" />
              <rect x="86"  y="138" width="11" height="8"  rx="3" fill={B} opacity=".66" />
              <rect x="101" y="138" width="11" height="8"  rx="3" fill={B} opacity=".66" />
              <rect x="87"  y="150" width="10" height="6"  rx="3" fill={B} opacity=".52" />
              <rect x="101" y="150" width="10" height="6"  rx="3" fill={B} opacity=".52" />
            </g>
            {/* Oblicuos */}
            <g {...zone('oblicuos')}>
              <path d="M76 128 Q73 142 74 160 L82 164 L84 160 L84 128 Z"                        fill={B} opacity=".60" />
              <path d="M116 128 L116 160 L118 164 L126 160 Q127 142 124 128 Z"                  fill={B} opacity=".60" />
            </g>
            {/* Cuádriceps */}
            <g {...zone('cuadriceps')}>
              <path d="M66 182 Q62 198 62 220 L68 228 L80 224 L82 196 L80 178 Q72 176 66 182 Z"            fill={B} opacity=".72" />
              <path d="M134 182 Q138 198 138 220 L132 228 L120 224 L118 196 L120 178 Q128 176 134 182 Z"   fill={B} opacity=".72" />
            </g>
            {/* Aductores */}
            <g {...zone('aductores')}>
              <path d="M84 182 Q85 200 85 220 L90 224 L90 196 L86 180 Z"                        fill={B} opacity=".60" />
              <path d="M116 180 L110 196 L110 224 L115 220 Q115 200 116 182 Z"                  fill={B} opacity=".60" />
            </g>
            {/* Tibial anterior — renderizado antes que gemelos; gemelos gana en el borde */}
            <g {...zone('tibial')}>
              <path d="M73 250 L73 298 L80 296 L80 252 Z"                                        fill={B} opacity=".58" />
              <path d="M120 252 L120 296 L127 298 L127 250 Z"                                    fill={B} opacity=".58" />
            </g>
            {/* Gemelos (front) — zona ampliada, adyacente al tibial */}
            <g {...zone('gemelos')}>
              <path d="M60 250 Q56 276 58 296 L73 302 L73 272 L66 250 Z"                        fill={B} opacity=".65" />
              <path d="M140 250 Q144 276 140 296 L127 302 L127 272 L134 250 Z"                  fill={B} opacity=".65" />
            </g>
            {/* Glúteos ghost */}
            <g {...zone('gluteos')}>
              <path d="M72 162 Q68 170 70 178 L86 178 L86 160 Z"                                 fill={B} opacity=".30" />
              <path d="M128 162 Q132 170 130 178 L114 178 L114 160 Z"                            fill={B} opacity=".30" />
            </g>
            {/* Dorsal ghost — visual únicamente; sin interacción para no tapar pecho */}
            <g {...zone('dorsal')} style={{ pointerEvents:'none' }}>
              <ellipse cx="100" cy="100" rx="20" ry="12" fill={B} opacity=".09" />
            </g>
          </>
        )}

        {/* ══════════════ BACK ZONES ══════════════ */}
        {view === 'back' && (
          <>
            {/* Trapecio */}
            <g {...zone('trapecio')}>
              <path d="M90 70 Q86 68 78 74 L70 84 L76 90 L86 84 Q92 80 100 78 Q108 80 114 84 L124 90 L130 84 L122 74 Q114 68 110 70 Z" fill={B} opacity=".74" />
            </g>
            {/* Dorsal ancho */}
            <g {...zone('dorsal')}>
              <path d="M76 90 Q72 100 74 112 Q84 118 100 118 Q116 118 126 112 Q128 100 124 90 L114 84 Q108 80 100 78 Q92 80 86 84 Z" fill={B} opacity=".76" />
            </g>
            {/* Erectores espinales — dos tiras paravertebrales entre dorsal y lumbar */}
            <g {...zone('erectores')}>
              <path d="M93 96 L93 130 L99 128 L99 96 Z"                                           fill={B} opacity=".62" />
              <path d="M101 96 L101 128 L107 130 L107 96 Z"                                        fill={B} opacity=".62" />
            </g>
            {/* Deltoides posterior — renderizado ANTES de delt_lat; su zona medial queda accesible */}
            <g {...zone('delt_post')}>
              <path d="M58 72 Q53 84 56 96 L68 96 L72 87 L68 72 Z"                               fill={B} opacity=".76" />
              <path d="M142 72 L132 72 L128 87 L132 96 L144 96 Q147 84 142 72 Z"                 fill={B} opacity=".76" />
            </g>
            {/* Deltoides lateral (back) — renderizado DESPUÉS de delt_post; gana en la cúpula lateral */}
            <g {...zone('delt_lat')}>
              <ellipse cx="70"  cy="80" rx="7" ry="9" fill={B} opacity=".58" />
              <ellipse cx="130" cy="80" rx="7" ry="9" fill={B} opacity=".58" />
            </g>
            {/* Tríceps */}
            <g {...zone('triceps')}>
              <path d="M56 88 Q52 102 54 124 L62 128 L68 124 L68 100 L62 86 Z"                   fill={B} opacity=".76" />
              <path d="M144 88 Q148 102 146 124 L138 128 L132 124 L132 100 L138 86 Z"            fill={B} opacity=".76" />
            </g>
            {/* Antebrazo (back) — zona ampliada ~22px; tríceps termina en y≈128, aquí empieza en y≈126 */}
            <g {...zone('antebrazo')}>
              <path d="M54 128 Q46 152 48 172 L58 180 L68 176 L66 150 L60 126 Z"               fill={B} opacity=".65" />
              <path d="M146 126 Q154 152 152 172 L142 180 L132 176 L134 150 L140 128 Z"        fill={B} opacity=".65" />
            </g>
            {/* Bíceps ghost — visual únicamente; sin interacción para no tapar tríceps */}
            <g {...zone('biceps')} style={{ pointerEvents:'none' }}>
              <path d="M56 90 Q52 104 54 118 L60 122 L66 120 L66 100 Z"                           fill={B} opacity=".20" />
              <path d="M144 90 Q148 104 146 118 L140 122 L134 120 L134 100 Z"                     fill={B} opacity=".20" />
            </g>
            {/* Lumbar / Core posterior */}
            <g {...zone('lumbar')}>
              <path d="M84 128 Q80 138 82 150 L100 152 L118 150 Q120 138 116 128 Z"               fill={B} opacity=".62" />
            </g>
            {/* Oblicuos (back) */}
            <g {...zone('oblicuos')}>
              <path d="M76 128 Q73 142 74 160 L82 164 L84 128 Z"                                  fill={B} opacity=".38" />
              <path d="M116 128 L116 164 L126 160 Q127 142 124 128 Z"                             fill={B} opacity=".38" />
            </g>
            {/* Abductores — zona ampliada; glúteos (renderizado después) gana en solapamiento central */}
            <g {...zone('abductores')}>
              <path d="M58 158 Q54 172 58 184 L70 188 L76 176 L72 162 L62 158 Z"                  fill={B} opacity=".70" />
              <path d="M138 158 L128 162 L124 176 L130 188 L142 184 Q146 172 142 158 Z"           fill={B} opacity=".70" />
            </g>
            {/* Glúteos */}
            <g {...zone('gluteos')}>
              <ellipse cx="79"  cy="170" rx="11" ry="12" fill={B} opacity=".76" />
              <ellipse cx="121" cy="170" rx="11" ry="12" fill={B} opacity=".76" />
            </g>
            {/* Isquiotibiales */}
            <g {...zone('isquio')}>
              <path d="M66 182 Q62 200 62 222 L70 230 L80 226 L80 198 L78 178 Q72 176 66 182 Z"            fill={B} opacity=".76" />
              <path d="M134 182 Q138 200 138 222 L130 230 L120 226 L120 198 L122 178 Q128 176 134 182 Z"   fill={B} opacity=".76" />
            </g>
            {/* Aductores ghost */}
            <g {...zone('aductores')}>
              <path d="M84 182 Q85 200 85 220 L90 224 L90 196 L86 180 Z"                          fill={B} opacity=".22" />
              <path d="M116 180 L110 196 L110 224 L115 220 Q115 200 116 182 Z"                    fill={B} opacity=".22" />
            </g>
            {/* Gemelos (back) — zona ampliada, cubre gastrocnemio completo visible desde atrás */}
            <g {...zone('gemelos')}>
              <path d="M60 248 Q54 274 58 296 L70 304 L80 298 L78 270 L72 248 Z"                  fill={B} opacity=".68" />
              <path d="M128 248 L122 270 L120 298 L130 304 L142 296 Q146 274 140 248 Z"           fill={B} opacity=".68" />
            </g>
            {/* Pecho ghost — visual únicamente; sin interacción para no tapar trapecio/dorsal */}
            <g {...zone('pecho')} style={{ pointerEvents:'none' }}>
              <ellipse cx="100" cy="96" rx="18" ry="10" fill={B} opacity=".09" />
            </g>
          </>
        )}

        {/* Priority badges */}
        {Object.entries(priorities).map(([id, state]) => {
          if (state !== 'priority') return null;
          const def = MUSCLES[id];
          if (!def) return null;
          const showFront = view === 'front' && (def.view === 'front' || def.view === 'both');
          const showBack  = view === 'back'  && (def.view === 'back'  || def.view === 'both');
          if (!showFront && !showBack) return null;
          return (
            <circle key={id} cx="8" cy="8" r="4" fill="rgba(59,130,246,0.55)"
              style={{ pointerEvents:'none' }} />
          );
        })}

        {/* Floating label */}
        {(hov || selected) && (
          <text x="100" y="436" textAnchor="middle"
            fill="rgba(232,237,248,0.48)" fontSize="8.5"
            fontFamily="Inter,system-ui" fontWeight="700" letterSpacing="1.8">
            {MUSCLES[hov || selected]?.label.toUpperCase()}
          </text>
        )}
      </svg>

      <div style={{ display:'flex', gap:'8px 14px', marginTop:10, justifyContent:'center', flexWrap:'wrap' }}>
        {[['rgba(59,130,246,0.28)','Sin prioridad'],['rgba(59,130,246,0.75)','Prioridad activa']].map(([c,l]) => (
          <span key={l} style={{ display:'flex', alignItems:'center', gap:5 }}>
            <span style={{ width:7, height:7, borderRadius:2, background:c, display:'inline-block' }} />
            <span style={{ fontFamily:'Inter,system-ui', fontSize:10, color:BD.muted }}>{l}</span>
          </span>
        ))}
      </div>
    </div>
  );
}

// ── Panel de volumen semanal ──────────────────────────────────────────────────
function WeeklyVolumePanel({ priorities, log, sessionSets }) {
  const activeMuscles = Object.entries(priorities).filter(
    ([, s]) => s === 'priority' || s === 'maintain' || s === 'reducir'
  );
  if (activeMuscles.length === 0) return null;

  return (
    <div style={{ background:BD.card, borderRadius:14, padding:'14px 16px', marginBottom:20,
      border:`1px solid ${BD.border}` }}>
      <div style={{ fontFamily:'ui-monospace,Menlo,monospace', fontSize:8.5, fontWeight:700,
        color:BD.muted, letterSpacing:1.5, marginBottom:12 }}>OBJETIVOS SEMANALES</div>
      {activeMuscles.map(([id, state]) => {
        const def    = MUSCLES[id];
        const sci    = MUSCLE_SCIENCE[id];
        if (!def || !sci) return null;
        const isPrio  = state === 'priority';
        const isMaint = state === 'maintain';
        const isRed   = state === 'reducir';
        // Priority→MAV, Mantener→MEV, Reducir→50% MEV (deload)
        const target  = isPrio ? sci.mav : isMaint ? sci.mev : Math.round(sci.mev * 0.5);
        const done    = setsThisWeek(id, log) + (sessionSets[id] || 0);
        const pct     = Math.min(100, Math.round((done / target) * 100));
        // Para reducir: colores invertidos (menos = mejor)
        const color   = isRed
          ? (done <= target ? BD.green : done <= sci.mev ? BD.amber : BD.red)
          : pct >= 100 ? BD.green : pct >= 60 ? BD.amber : BD.blue;
        const badgeBg    = isPrio ? 'rgba(59,130,246,0.18)'  : isMaint ? 'rgba(34,197,94,0.12)'  : 'rgba(245,158,11,0.12)';
        const badgeColor = isPrio ? '#93C5FD'                : isMaint ? BD.green                 : BD.amber;
        const badgeLabel = isPrio ? 'PRIORIDAD'              : isMaint ? 'MANTENER'               : 'REDUCIR';
        return (
          <div key={id} style={{ marginBottom:10 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:4 }}>
              <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                <span style={{ fontFamily:'Inter,system-ui', fontSize:11, fontWeight:700, color:BD.text }}>
                  {def.label}
                </span>
                <span style={{ fontSize:8, padding:'1px 5px', borderRadius:999, fontWeight:700,
                  background:badgeBg, color:badgeColor, fontFamily:'Inter,system-ui' }}>
                  {badgeLabel}
                </span>
              </div>
              <span style={{ fontFamily:'ui-monospace,Menlo,monospace', fontSize:10, color }}>
                {done}/{target} sets · {sci.freq}×/sem
              </span>
            </div>
            <div style={{ height:4, borderRadius:999, background:'rgba(255,255,255,0.06)', overflow:'hidden' }}>
              <div style={{ height:'100%', width:`${pct}%`, borderRadius:999, background:color,
                transition:'width .4s ease', boxShadow: pct >= 100 ? `0 0 8px ${color}60` : 'none' }} />
            </div>
          </div>
        );
      })}
      <div style={{ marginTop:8, fontFamily:'Inter,system-ui', fontSize:10, color:BD.muted }}>
        Basado en protocolos de hipertrofia (Israetel / Schoenfeld)
      </div>
    </div>
  );
}

// ── Panel de recomendación científica ────────────────────────────────────────
function SciencePanel({ muscleId, priorities, log, sessionSets, onTogglePriority }) {
  if (!muscleId) return null;
  const def = MUSCLES[muscleId];
  const sci = MUSCLE_SCIENCE[muscleId];
  if (!def || !sci) return null;

  const prio = priorities[muscleId];
  const done = setsThisWeek(muscleId, log) + (sessionSets[muscleId] || 0);

  const statusColor = done === 0       ? BD.muted
                    : done < sci.mev   ? BD.amber
                    : done < sci.mav   ? BD.green
                    : done <= sci.mrv  ? BD.blue
                    : BD.red;

  const statusText = done === 0        ? 'Sin series esta semana'
                   : done < sci.mev    ? 'Por debajo del volumen mínimo efectivo'
                   : done < sci.mav    ? 'En rango óptimo · sigue así'
                   : done <= sci.mrv   ? 'Volumen elevado · monitoriza recuperación'
                   :                    'Superando el máximo recuperable';

  const ROWS = [
    { key:'MEV', val:sci.mev, color:BD.amber, title:'Mínimo efectivo',
      body:'Series mínimas por semana para provocar adaptación. Por debajo no hay progreso real.' },
    { key:'MAV', val:sci.mav, color:BD.green, title:'Volumen óptimo',
      body:'Rango donde la hipertrofia se maximiza sin comprometer la recuperación semanal.' },
    { key:'MRV', val:sci.mrv, color:BD.red,   title:'Máximo recuperable',
      body:'Límite superior. Superarlo de forma sostenida acumula fatiga y frena el progreso.' },
  ];

  return (
    <div style={{ background:BD.card, borderRadius:14, padding:'14px 16px',
      border:`1px solid ${BD.border}`, animation:'fadeIn .2s ease' }}>

      {/* Cabecera */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14 }}>
        <div>
          <div style={{ fontFamily:'ui-monospace,Menlo,monospace', fontSize:8, fontWeight:700,
            color:BD.muted, letterSpacing:1.5, marginBottom:3 }}>RECOMENDACIÓN CIENTÍFICA</div>
          <div style={{ fontFamily:'"Space Grotesk",system-ui', fontSize:15, fontWeight:700, color:BD.text }}>
            {def.label}
          </div>
        </div>
        <button onClick={() => onTogglePriority(muscleId)}
          style={{ padding:'5px 12px', borderRadius:999, border:'none', cursor:'pointer',
            background: prio === 'priority' ? BD.blue
                       : prio === 'maintain' ? 'rgba(34,197,94,0.15)'
                       : prio === 'reducir'  ? 'rgba(245,158,11,0.12)'
                       : 'rgba(255,255,255,0.06)',
            color: prio === 'priority' ? '#fff'
                  : prio === 'maintain' ? BD.green
                  : prio === 'reducir'  ? BD.amber
                  : BD.muted,
            fontFamily:'Inter,system-ui', fontSize:10, fontWeight:700, transition:'all .14s',
            boxShadow: prio === 'priority' ? '0 3px 12px -3px rgba(59,130,246,0.45)' : 'none',
            whiteSpace:'nowrap' }}>
          {prio === 'priority' ? '🎯 Prioridad'
           : prio === 'maintain' ? '✓ Mantener'
           : prio === 'reducir'  ? '↓ Reducir'
           : '+ Priorizar'}
        </button>
      </div>

      {/* Filas MEV / MAV / MRV */}
      {ROWS.map(({ key, val, color, title, body }) => (
        <div key={key} style={{ display:'flex', gap:10, marginBottom:10, alignItems:'flex-start' }}>
          <div style={{ minWidth:36, flexShrink:0, textAlign:'center' }}>
            <div style={{ display:'inline-block', padding:'2px 5px', borderRadius:5,
              background:`${color}1A`, fontFamily:'ui-monospace,Menlo,monospace',
              fontSize:8, fontWeight:700, color, marginBottom:3 }}>{key}</div>
            <div style={{ fontFamily:'ui-monospace,Menlo,monospace', fontSize:11,
              color, fontWeight:700 }}>{val}</div>
          </div>
          <div style={{ flex:1 }}>
            <div style={{ fontFamily:'Inter,system-ui', fontSize:11, fontWeight:700,
              color:BD.sub, marginBottom:2 }}>{title}</div>
            <div style={{ fontFamily:'Inter,system-ui', fontSize:10, color:BD.muted, lineHeight:1.5 }}>
              {body}
            </div>
          </div>
        </div>
      ))}

      {/* Barra de volumen con marcadores MEV / MAV */}
      <div style={{ marginTop:12, marginBottom:4 }}>
        <div style={{ display:'flex', justifyContent:'space-between', marginBottom:5 }}>
          <span style={{ fontFamily:'Inter,system-ui', fontSize:9.5, color:BD.muted }}>
            Esta semana · {sci.freq}× recomendado
          </span>
          <span style={{ fontFamily:'ui-monospace,Menlo,monospace', fontSize:10,
            color:statusColor, fontWeight:700 }}>{done} sets</span>
        </div>
        <div style={{ position:'relative', height:6, borderRadius:999, background:'rgba(255,255,255,0.06)' }}>
          <div style={{ position:'absolute', inset:0, borderRadius:999, overflow:'hidden' }}>
            <div style={{ height:'100%', borderRadius:999, transition:'width .4s ease',
              width:`${Math.min(100, (done / sci.mrv) * 100)}%`, background:statusColor }} />
          </div>
          {/* Marcador MEV */}
          <div style={{ position:'absolute', top:0, bottom:0, width:1.5,
            left:`${(sci.mev / sci.mrv) * 100}%`, background:BD.amber,
            transform:'translateX(-50%)' }} />
          {/* Marcador MAV */}
          <div style={{ position:'absolute', top:0, bottom:0, width:1.5,
            left:`${(sci.mav / sci.mrv) * 100}%`, background:BD.green,
            transform:'translateX(-50%)' }} />
        </div>
        <div style={{ display:'flex', justifyContent:'space-between', marginTop:4 }}>
          <span style={{ fontFamily:'ui-monospace,Menlo,monospace', fontSize:8, color:BD.amber }}>MEV {sci.mev}</span>
          <span style={{ fontFamily:'ui-monospace,Menlo,monospace', fontSize:8, color:BD.green }}>MAV {sci.mav}</span>
          <span style={{ fontFamily:'ui-monospace,Menlo,monospace', fontSize:8, color:BD.muted }}>MRV {sci.mrv}</span>
        </div>
      </div>

      {/* Estado actual */}
      <div style={{ marginTop:10, padding:'7px 10px', borderRadius:8,
        background:`${statusColor}0D`, border:`1px solid ${statusColor}1A` }}>
        <span style={{ fontFamily:'Inter,system-ui', fontSize:10, color:statusColor, fontWeight:600 }}>
          {statusText}
        </span>
      </div>
    </div>
  );
}

// ── Panel de equilibrio muscular ──────────────────────────────────────────────
function BalancePanel({ log, sessionSets }) {
  const imbalances = BALANCE_PAIRS.map(pair => {
    const setsA = pair.idsA.reduce((acc, id) => acc + setsThisWeek(id, log) + (sessionSets[id] || 0), 0);
    const setsB = pair.idsB.reduce((acc, id) => acc + setsThisWeek(id, log) + (sessionSets[id] || 0), 0);
    const totalSets = setsA + setsB;
    if (totalSets < 4) return null;
    if (setsB === 0 && setsA === 0) return null;

    const ratio = setsB === 0 ? (setsA > 0 ? Infinity : 1) : setsA / setsB;

    let alert = null;
    if (pair.maxRatio && ratio > pair.maxRatio) {
      alert = { label: pair.labelA, dominator: true, advice: pair.adviceHigh || pair.advice, ratio };
    } else if (pair.minRatio && ratio < pair.minRatio) {
      alert = { label: pair.labelB, dominator: false, advice: pair.adviceLow || pair.advice, ratio: setsB / setsA };
    }

    return alert ? { ...alert, setsA, setsB, pair } : null;
  }).filter(Boolean);

  if (imbalances.length === 0) return null;

  return (
    <div style={{ marginTop:12 }}>
      {imbalances.map(({ pair, setsA, setsB, advice, ratio }) => {
        const ratioStr = isFinite(ratio) ? ratio.toFixed(1) + ':1' : '∞:1';
        return (
          <div key={pair.id} style={{
            padding:'10px 12px', borderRadius:10, marginBottom:8,
            background:'rgba(245,158,11,0.07)',
            border:'1px solid rgba(245,158,11,0.22)',
          }}>
            <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:5 }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" style={{ flexShrink:0 }}>
                <path d="M12 2L2 19h20L12 2z" stroke={BD.amber} strokeWidth="2" strokeLinejoin="round"/>
                <path d="M12 9v5M12 16v1" stroke={BD.amber} strokeWidth="2" strokeLinecap="round"/>
              </svg>
              <span style={{ fontFamily:'Inter,system-ui', fontSize:10, fontWeight:700, color:BD.amber, letterSpacing:'0.05em' }}>
                DESEQUILIBRIO POTENCIAL
              </span>
            </div>
            <div style={{ display:'flex', gap:8, marginBottom:6, alignItems:'center' }}>
              <span style={{ fontFamily:'ui-monospace,Menlo,monospace', fontSize:9, color:BD.sub,
                padding:'2px 6px', borderRadius:4, background:'rgba(255,255,255,0.05)' }}>
                {pair.labelA}: {setsA} series
              </span>
              <span style={{ color:BD.muted, fontSize:9 }}>vs</span>
              <span style={{ fontFamily:'ui-monospace,Menlo,monospace', fontSize:9, color:BD.sub,
                padding:'2px 6px', borderRadius:4, background:'rgba(255,255,255,0.05)' }}>
                {pair.labelB}: {setsB} series
              </span>
              <span style={{ fontFamily:'ui-monospace,Menlo,monospace', fontSize:9,
                color:BD.amber, marginLeft:'auto' }}>
                {ratioStr}
              </span>
            </div>
            {/* Mini ratio bar */}
            <div style={{ height:4, borderRadius:999, background:'rgba(255,255,255,0.06)', marginBottom:6, overflow:'hidden' }}>
              <div style={{
                height:'100%', borderRadius:999,
                width:`${Math.min(100, (setsA / (setsA + setsB)) * 100)}%`,
                background:`linear-gradient(90deg, ${BD.blue}, ${BD.amber})`,
                transition:'width .4s ease',
              }} />
            </div>
            <p style={{ fontFamily:'Inter,system-ui', fontSize:10, color:BD.sub, lineHeight:1.5, margin:0 }}>
              {advice}
            </p>
          </div>
        );
      })}
    </div>
  );
}

// ── Panel: Recomendación Atlas Coach ─────────────────────────────────────────
function CoachRecommendationPanel({ priorities, log, sessionSets }) {
  const [open,    setOpen]    = React.useState(true);
  const [dayOpen, setDayOpen] = React.useState(false);
  const { navigate } = useRoute();

  const plan = React.useMemo(() => {
    if (!window.AtlasEngine) return null;
    const hasAny = Object.values(priorities).some(s => s === 'priority' || s === 'maintain' || s === 'reducir');
    if (!hasAny) return null;
    return window.AtlasEngine.exportBuilderPlan(priorities, 4);
  }, [priorities]);

  if (!plan || !plan.volumePlan.length) return null;

  const split = plan.split;
  const splitStyle = {
    fullbody:    { color:BD.green,  bg:'rgba(34,197,94,0.10)',   border:'rgba(34,197,94,0.22)'   },
    upper_lower: { color:BD.blue,   bg:'rgba(59,130,246,0.10)',  border:'rgba(59,130,246,0.22)'  },
    ppl:         { color:BD.amber,  bg:'rgba(245,158,11,0.10)',  border:'rgba(245,158,11,0.22)'  },
  }[split.key] || { color:BD.blue, bg:'rgba(59,130,246,0.10)', border:'rgba(59,130,246,0.22)' };

  function handleSendToCoach() {
    window.AtlasEngine.saveBuilderPlan(plan);
    navigate('/coach');
  }

  return (
    <div style={{ background:BD.card, borderRadius:14, padding:'14px 16px',
      border:`1px solid ${BD.border}`, marginBottom:14 }}>

      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom: open ? 12 : 0 }}>
        <span style={{ fontFamily:'ui-monospace,Menlo,monospace', fontSize:7.5,
          fontWeight:700, color:BD.muted, letterSpacing:1.6 }}>RECOMENDACIÓN ATLAS COACH</span>
        <button onClick={() => setOpen(o=>!o)}
          style={{ background:'none', border:'none', cursor:'pointer', color:BD.muted, padding:'4px 2px', lineHeight:0 }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            {open ? <path d="M18 15l-6-6-6 6"/> : <path d="M6 9l6 6 6-6"/>}
          </svg>
        </button>
      </div>

      {open && (
        <>
          {/* Split badge */}
          <div style={{ padding:'10px 12px', borderRadius:10, marginBottom:12,
            background:splitStyle.bg, border:`1px solid ${splitStyle.border}` }}>
            <div style={{ display:'flex', alignItems:'baseline', gap:8, marginBottom:4 }}>
              <span style={{ fontFamily:'"Space Grotesk",system-ui', fontSize:15, fontWeight:700, color:splitStyle.color }}>
                {split.name}
              </span>
              <span style={{ fontFamily:'ui-monospace,Menlo,monospace', fontSize:8.5, color:BD.muted }}>
                {split.sessionsPerWeek}×/sem · {plan.totalSets} series totales
              </span>
            </div>
            <p style={{ fontFamily:'Inter,system-ui', fontSize:10, color:BD.sub, lineHeight:1.55, margin:0 }}>
              {split.reason}
            </p>
          </div>

          {/* Volume table */}
          <div style={{ marginBottom:10 }}>
            {plan.volumePlan.map(m => {
              const done    = setsThisWeek(m.id, log) + (sessionSets[m.id] || 0);
              const pct     = m.targetSets > 0 ? Math.min(100, (done / m.targetSets) * 100) : 0;
              const prioC   = m.state === 'priority' ? BD.blue
                            : m.state === 'maintain'  ? BD.green : BD.amber;
              const badge   = m.state === 'priority' ? 'MAV'
                            : m.state === 'maintain'  ? 'MEV' : 'DLD';
              return (
                <div key={m.id} style={{ marginBottom:8 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:3 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:5 }}>
                      <span style={{ fontFamily:'Inter,system-ui', fontSize:10.5, color:BD.sub, fontWeight:600 }}>{m.name}</span>
                      <span style={{ fontFamily:'ui-monospace,Menlo,monospace', fontSize:7.5, padding:'1px 5px',
                        borderRadius:999, background:`${prioC}1A`, color:prioC, fontWeight:700 }}>{badge}</span>
                    </div>
                    <span style={{ fontFamily:'ui-monospace,Menlo,monospace', fontSize:9.5, color:BD.muted }}>
                      {done}/{m.targetSets} · {m.freq}×/sem
                    </span>
                  </div>
                  <div style={{ height:3, borderRadius:999, background:'rgba(255,255,255,0.06)', overflow:'hidden' }}>
                    <div style={{ height:'100%', width:`${pct}%`, background:prioC, borderRadius:999, transition:'width .4s ease' }} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Day structure toggle */}
          <button onClick={() => setDayOpen(o=>!o)}
            style={{ width:'100%', background:'rgba(255,255,255,0.03)', border:`1px solid ${BD.border}`,
              borderRadius:8, padding:'7px 12px', cursor:'pointer', color:BD.muted,
              fontFamily:'Inter,system-ui', fontSize:10, display:'flex', justifyContent:'space-between',
              marginBottom: dayOpen ? 8 : 10 }}>
            <span>Estructura de sesiones</span>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              strokeWidth="2.5" strokeLinecap="round" style={{ transform: dayOpen ? 'rotate(180deg)':'none', transition:'transform .2s' }}>
              <path d="M6 9l6 6 6-6"/>
            </svg>
          </button>

          {dayOpen && (
            <div style={{ marginBottom:10 }}>
              {plan.days.map((day, i) => (
                <div key={i} style={{ marginBottom:6, padding:'8px 10px', borderRadius:8,
                  background:'rgba(255,255,255,0.02)', border:`1px solid ${BD.border}` }}>
                  <div style={{ fontFamily:'ui-monospace,Menlo,monospace', fontSize:8.5,
                    fontWeight:700, color:BD.muted, marginBottom:5, letterSpacing:0.5 }}>
                    {day.dayLabel.toUpperCase()} · {day.totalSets} series
                  </div>
                  <div style={{ display:'flex', flexWrap:'wrap', gap:4 }}>
                    {day.muscles.map(m => (
                      <span key={m.id} style={{ fontFamily:'Inter,system-ui', fontSize:9.5,
                        padding:'2px 7px', borderRadius:999,
                        background:'rgba(59,130,246,0.10)', color:'#93C5FD' }}>
                        {m.name} · {m.setsThisDay}s
                      </span>
                    ))}
                  </div>
                </div>
              ))}
              <p style={{ fontFamily:'Inter,system-ui', fontSize:9.5, color:BD.muted,
                lineHeight:1.5, margin:'6px 0 0' }}>{split.science}</p>
            </div>
          )}

          {/* CTA */}
          <button onClick={handleSendToCoach}
            style={{ width:'100%', padding:'10px 0', borderRadius:8, cursor:'pointer',
              border:'1px solid rgba(59,130,246,0.28)', background:'rgba(59,130,246,0.08)',
              color:'#93C5FD', fontFamily:'Inter,system-ui', fontSize:11.5, fontWeight:700,
              transition:'all .15s' }}>
            Enviar al Coach →
          </button>
        </>
      )}
    </div>
  );
}

// ── Atlas Score ───────────────────────────────────────────────────────────────
function computeAtlasScore(priorities, log, sessionSets) {
  const active = Object.entries(priorities).filter(([,s]) => s === 'priority' || s === 'maintain');

  // 1. Equilibrio (25 pts) — balance antagonista
  const pairsEval = BALANCE_PAIRS.filter(p => {
    const a = p.idsA.reduce((n,id) => n + setsThisWeek(id,log) + (sessionSets[id]||0), 0);
    const b = p.idsB.reduce((n,id) => n + setsThisWeek(id,log) + (sessionSets[id]||0), 0);
    return (a + b) >= 4;
  });
  let imbalancedPairs = [];
  pairsEval.forEach(p => {
    const a = p.idsA.reduce((n,id) => n + setsThisWeek(id,log) + (sessionSets[id]||0), 0);
    const b = p.idsB.reduce((n,id) => n + setsThisWeek(id,log) + (sessionSets[id]||0), 0);
    const r = b === 0 ? (a > 0 ? Infinity : 1) : a / b;
    if ((p.maxRatio && r > p.maxRatio) || (p.minRatio && r < p.minRatio)) imbalancedPairs.push(p);
  });
  const eqPts = pairsEval.length === 0
    ? 18
    : Math.max(0, 25 - imbalancedPairs.length * 9);

  // 2. Volumen óptimo (30 pts) — series en rango MEV–MAV
  let volPts = 0;
  if (active.length > 0) {
    let sum = 0;
    active.forEach(([id, state]) => {
      const sci = MUSCLE_SCIENCE[id]; if (!sci) return;
      const done = setsThisWeek(id,log) + (sessionSets[id]||0);
      if (done === 0)           sum += 0;
      else if (done < sci.mev)  sum += 0.35 * (done / sci.mev);
      else if (done <= sci.mav) sum += 0.35 + 0.65 * ((done - sci.mev) / Math.max(1, sci.mav - sci.mev));
      else if (done <= sci.mrv) sum += 1.0;
      else                      sum += 0.70;
    });
    volPts = Math.round(30 * (sum / active.length));
  }

  // 3. Sin excesos (20 pts) — penaliza por superar MRV
  let excesoPts = 20;
  const excesoMuscles = [];
  Object.entries(MUSCLE_SCIENCE).forEach(([id, sci]) => {
    const done = setsThisWeek(id,log) + (sessionSets[id]||0);
    if (done > sci.mrv) { excesoPts -= 5; excesoMuscles.push(MUSCLES[id]?.label || id); }
  });
  excesoPts = Math.max(0, excesoPts);

  // 4. Cobertura muscular (15 pts) — prioridades en grupos principales
  const CGROUPS = ['torso', 'hombros', 'brazos', 'piernas', 'core'];
  const coveredCount = CGROUPS.filter(g =>
    active.some(([id]) => MUSCLES[id]?.group === g || (g === 'piernas' && MUSCLES[id]?.group === 'gluteos'))
  ).length;
  const coverPts = Math.round(15 * (coveredCount / CGROUPS.length));

  // 5. Frecuencia semanal (10 pts) — músculos prioritarios activos esta semana
  const freqPts = active.length === 0 ? 0
    : Math.round(10 * (active.filter(([id]) => setsThisWeek(id,log) + (sessionSets[id]||0) > 0).length / active.length));

  const total = eqPts + volPts + excesoPts + coverPts + freqPts;

  // Insight principal
  let insight;
  if (active.length === 0) {
    insight = 'Selecciona músculos en el mapa para empezar a evaluar tu entrenamiento.';
  } else if (excesoMuscles.length > 0) {
    insight = `${excesoMuscles[0]} supera el MRV. El exceso sostenido frena el progreso y acumula fatiga.`;
  } else if (imbalancedPairs.length > 0) {
    const p = imbalancedPairs[0];
    insight = (p.adviceHigh || p.advice).split('.')[0] + '.';
  } else if (volPts < 12) {
    insight = 'El volumen semanal está aún por debajo del mínimo efectivo en varios grupos prioritarios.';
  } else if (coverPts < 9) {
    insight = 'Diversifica las prioridades. Un programa completo cubre torso, tren inferior, brazos y core.';
  } else if (total >= 85) {
    insight = 'Entrenamiento muy bien estructurado. Volumen, equilibrio y frecuencia en zona óptima.';
  } else if (total >= 70) {
    insight = 'Buen programa. Ajusta el volumen de los grupos prioritarios para acercarte al rango MAV.';
  } else {
    insight = 'Programa en desarrollo. Acumula series y distribuye el volumen entre grupos antagonistas.';
  }

  return {
    total,
    insight,
    pillars: [
      { key:'equilibrio', label:'Equilibrio muscular', pts:eqPts,     max:25, icon:'⚖' },
      { key:'volumen',    label:'Volumen adecuado',    pts:volPts,    max:30, icon:'📊' },
      { key:'exceso',     label:'Sin excesos',         pts:excesoPts, max:20, icon:'🛡' },
      { key:'cobertura',  label:'Cobertura',           pts:coverPts,  max:15, icon:'🗺' },
      { key:'frecuencia', label:'Frecuencia',          pts:freqPts,   max:10, icon:'📅' },
    ],
  };
}

function AtlasScoreCard({ priorities, log, sessionSets }) {
  const [open, setOpen] = React.useState(false);
  const sc = computeAtlasScore(priorities, log, sessionSets);

  const color = sc.total >= 80 ? BD.green
              : sc.total >= 65 ? BD.amber
              : sc.total >= 45 ? '#F97316'
              : BD.red;

  const qualLabel = sc.total >= 80 ? 'Excelente'
                  : sc.total >= 65 ? 'Bueno'
                  : sc.total >= 45 ? 'Mejorable'
                  : 'Atención';

  const R  = 30;
  const C  = 2 * Math.PI * R;
  const offset = C * (1 - sc.total / 100);

  return (
    <div style={{ background:BD.card, borderRadius:14, padding:'14px 16px',
      border:`1px solid ${BD.border}`, marginBottom:14 }}>

      <div style={{ display:'flex', alignItems:'center', gap:14 }}>

        {/* Anillo SVG */}
        <div style={{ position:'relative', width:68, height:68, flexShrink:0 }}>
          <svg width="68" height="68" viewBox="0 0 76 76">
            <circle cx="38" cy="38" r={R} fill="none"
              stroke="rgba(255,255,255,0.06)" strokeWidth="6" />
            <circle cx="38" cy="38" r={R} fill="none"
              stroke={color} strokeWidth="6" strokeLinecap="round"
              strokeDasharray={C} strokeDashoffset={offset}
              transform="rotate(-90 38 38)"
              style={{ transition:'stroke-dashoffset .9s ease, stroke .4s' }} />
          </svg>
          <div style={{ position:'absolute', inset:0, display:'flex',
            flexDirection:'column', alignItems:'center', justifyContent:'center' }}>
            <span style={{ fontFamily:'"Space Grotesk",system-ui', fontSize:19,
              fontWeight:800, color, lineHeight:1 }}>{sc.total}</span>
            <span style={{ fontFamily:'ui-monospace,Menlo,monospace', fontSize:7.5,
              color:BD.muted, marginTop:1 }}>/100</span>
          </div>
        </div>

        {/* Texto */}
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ display:'flex', alignItems:'center', gap:7, marginBottom:5 }}>
            <span style={{ fontFamily:'ui-monospace,Menlo,monospace', fontSize:7.5,
              fontWeight:700, color:BD.muted, letterSpacing:1.6 }}>ATLAS SCORE</span>
            <span style={{ padding:'2px 7px', borderRadius:999,
              background:`${color}1A`, color,
              fontFamily:'Inter,system-ui', fontSize:9, fontWeight:700 }}>{qualLabel}</span>
          </div>
          <p style={{ fontFamily:'Inter,system-ui', fontSize:11, color:BD.sub,
            lineHeight:1.55, margin:0 }}>{sc.insight}</p>
        </div>

        <button onClick={() => setOpen(o => !o)}
          style={{ background:'none', border:'none', cursor:'pointer',
            color:BD.muted, padding:'4px 2px', flexShrink:0, lineHeight:0 }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            {open ? <path d="M18 15l-6-6-6 6"/> : <path d="M6 9l6 6 6-6"/>}
          </svg>
        </button>
      </div>

      {open && (
        <div style={{ marginTop:12, paddingTop:12, borderTop:`1px solid ${BD.border}` }}>
          {sc.pillars.map(p => {
            const pct   = p.pts / p.max;
            const pc    = pct >= 0.8 ? BD.green : pct >= 0.5 ? BD.amber : BD.red;
            return (
              <div key={p.key} style={{ marginBottom:9 }}>
                <div style={{ display:'flex', justifyContent:'space-between',
                  alignItems:'center', marginBottom:3 }}>
                  <span style={{ fontFamily:'Inter,system-ui', fontSize:10.5, color:BD.sub }}>
                    {p.label}
                  </span>
                  <span style={{ fontFamily:'ui-monospace,Menlo,monospace', fontSize:9, color:pc }}>
                    {p.pts}/{p.max}
                  </span>
                </div>
                <div style={{ height:3, borderRadius:999,
                  background:'rgba(255,255,255,0.06)', overflow:'hidden' }}>
                  <div style={{ height:'100%', borderRadius:999,
                    width:`${pct * 100}%`, background:pc,
                    transition:'width .5s ease' }} />
                </div>
              </div>
            );
          })}
          <div style={{ marginTop:10, fontFamily:'Inter,system-ui', fontSize:10,
            color:BD.muted, textAlign:'right' }}>
            Basado en protocolos Israetel · Schoenfeld
          </div>
        </div>
      )}
    </div>
  );
}

// ── Modal: Generar Plan ───────────────────────────────────────────────────────
function PlanModal({ priorities, log, sessionSets, workout, onClose, onGoLab }) {
  const sc    = computeAtlasScore(priorities, log, sessionSets);
  const today = new Date().toLocaleDateString('es-ES', { year:'numeric', month:'long', day:'numeric' });
  const active = Object.entries(priorities).filter(([,s]) => s);

  // Paleta clara para impresión
  const PT = {
    bg:'#F8F9FC', card:'#FFFFFF', border:'#E5E7EB',
    text:'#0F1A2E', sub:'#374151', muted:'#9CA3AF',
    blue:'#2563EB', green:'#16A34A', amber:'#D97706', red:'#DC2626',
  };

  const scoreColor = sc.total >= 80 ? PT.green
                   : sc.total >= 65 ? PT.amber
                   : sc.total >= 45 ? '#EA580C' : PT.red;
  const qualLabel  = sc.total >= 80 ? 'Excelente' : sc.total >= 65 ? 'Bueno'
                   : sc.total >= 45 ? 'Mejorable' : 'Atención';

  function handlePrint() {
    const s = document.createElement('style');
    s.dataset.ap = '1';
    s.textContent = `@media print{body *{visibility:hidden!important}#atlas-plan-print,#atlas-plan-print *{visibility:visible!important}#atlas-plan-print{position:fixed;inset:0;overflow:visible!important;padding:40px!important;border-radius:0!important;max-height:none!important}.atlas-noprint{display:none!important}}`;
    document.head.appendChild(s);
    window.print();
    window.addEventListener('afterprint', () =>
      document.querySelectorAll('[data-ap]').forEach(e => e.remove()), { once:true });
  }

  return ReactDOM.createPortal(
    <div style={{ position:'fixed', inset:0, zIndex:960, overflowY:'auto',
      display:'flex', alignItems:'flex-start', justifyContent:'center',
      padding:'4vh 16px 6vh' }}>

      {/* Fondo oscuro */}
      <div onClick={onClose}
        style={{ position:'fixed', inset:0, background:'rgba(4,10,20,0.86)', zIndex:0 }} />

      {/* Tarjeta del plan — fondo claro para impresión */}
      <div id="atlas-plan-print"
        style={{ position:'relative', zIndex:1, width:'min(680px, 100%)',
          background:PT.bg, borderRadius:20, padding:'44px 48px',
          color:PT.text, fontFamily:'Inter,system-ui',
          boxShadow:'0 32px 80px rgba(0,0,0,0.55)' }}>

        {/* ── Cabecera ── */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start',
          marginBottom:28, paddingBottom:22, borderBottom:`1.5px solid ${PT.border}` }}>
          <div>
            <div style={{ fontFamily:'"Space Grotesk",system-ui', fontWeight:800,
              fontSize:22, color:PT.text, letterSpacing:-0.5, marginBottom:3 }}>
              Atlas Method
            </div>
            <div style={{ fontFamily:'ui-monospace,Menlo,monospace', fontSize:9.5,
              color:PT.muted, letterSpacing:0.5 }}>
              PLAN DE ENTRENAMIENTO · {today.toUpperCase()}
            </div>
          </div>
          <button onClick={onClose} className="atlas-noprint"
            style={{ background:'none', border:'none', cursor:'pointer',
              color:PT.muted, fontSize:22, lineHeight:1, padding:'0 4px' }}>
            ×
          </button>
        </div>

        {/* ── Atlas Score ── */}
        <div style={{ display:'flex', gap:32, marginBottom:30, alignItems:'center' }}>
          <div style={{ textAlign:'center', flexShrink:0, minWidth:84 }}>
            <div style={{ fontFamily:'"Space Grotesk",system-ui', fontSize:58,
              fontWeight:800, color:scoreColor, lineHeight:1 }}>
              {sc.total}
            </div>
            <div style={{ fontFamily:'Inter,system-ui', fontSize:10, color:PT.muted, marginTop:2 }}>/100</div>
            <span style={{ display:'inline-block', marginTop:7, padding:'3px 10px',
              borderRadius:999, background:`${scoreColor}18`, color:scoreColor,
              fontFamily:'Inter,system-ui', fontSize:10, fontWeight:700 }}>
              {qualLabel}
            </span>
          </div>
          <div style={{ flex:1 }}>
            <div style={{ fontFamily:'ui-monospace,Menlo,monospace', fontSize:8.5,
              color:PT.muted, letterSpacing:1.5, marginBottom:10 }}>ATLAS SCORE</div>
            {sc.pillars.map(p => {
              const pct = p.pts / p.max;
              const c   = pct >= 0.8 ? PT.green : pct >= 0.5 ? PT.amber : PT.red;
              return (
                <div key={p.key} style={{ marginBottom:7 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:3 }}>
                    <span style={{ fontFamily:'Inter,system-ui', fontSize:10.5, color:PT.sub }}>{p.label}</span>
                    <span style={{ fontFamily:'ui-monospace,Menlo,monospace', fontSize:9.5,
                      color:c, fontWeight:700 }}>{p.pts}/{p.max}</span>
                  </div>
                  <div style={{ height:4, borderRadius:999, background:'#E5E7EB', overflow:'hidden' }}>
                    <div style={{ height:'100%', width:`${pct*100}%`, background:c, borderRadius:999 }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Músculos priorizados ── */}
        {active.length > 0 && (
          <div style={{ marginBottom:26 }}>
            <div style={{ fontFamily:'ui-monospace,Menlo,monospace', fontSize:8.5,
              color:PT.muted, letterSpacing:1.5, marginBottom:12 }}>MÚSCULOS PRIORIZADOS</div>
            <div style={{ borderRadius:10, overflow:'hidden', border:`1px solid ${PT.border}` }}>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 96px 100px 68px',
                background:'#F3F4F6', padding:'7px 14px' }}>
                {['Músculo','Prioridad','Series/sem','Frec.'].map(h => (
                  <span key={h} style={{ fontFamily:'Inter,system-ui', fontSize:9,
                    fontWeight:700, color:PT.muted, letterSpacing:0.5 }}>{h}</span>
                ))}
              </div>
              {active.map(([id, state], i) => {
                const def  = MUSCLES[id];
                const sci2 = MUSCLE_SCIENCE[id];
                if (!def || !sci2) return null;
                const done   = setsThisWeek(id, log) + (sessionSets[id] || 0);
                const target = state === 'priority' ? sci2.mav
                             : state === 'maintain'  ? sci2.mev
                             : Math.round(sci2.mev * 0.5);
                const sc2c   = state === 'priority' ? PT.blue
                             : state === 'maintain'  ? PT.green : PT.amber;
                const slabel = state === 'priority' ? 'Prioridad'
                             : state === 'maintain'  ? 'Mantener' : 'Reducir';
                return (
                  <div key={id} style={{ display:'grid', gridTemplateColumns:'1fr 96px 100px 68px',
                    padding:'9px 14px', borderTop:`1px solid ${PT.border}`,
                    background: i%2===0 ? PT.card : '#FAFAFA' }}>
                    <span style={{ fontFamily:'Inter,system-ui', fontSize:11, fontWeight:600, color:PT.text }}>{def.label}</span>
                    <span style={{ fontFamily:'Inter,system-ui', fontSize:10.5, color:sc2c, fontWeight:700 }}>{slabel}</span>
                    <span style={{ fontFamily:'ui-monospace,Menlo,monospace', fontSize:10, color:PT.text }}>
                      {done}<span style={{ color:PT.muted }}>/{target} sets</span>
                    </span>
                    <span style={{ fontFamily:'ui-monospace,Menlo,monospace', fontSize:10, color:PT.sub }}>{sci2.freq}×/sem</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Insight ── */}
        <div style={{ background:'#EFF6FF', border:'1px solid #BFDBFE',
          borderRadius:10, padding:'12px 16px', marginBottom:26 }}>
          <span style={{ fontFamily:'Inter,system-ui', fontSize:11, fontWeight:700,
            color:'#1D4ED8' }}>Recomendación · </span>
          <span style={{ fontFamily:'Inter,system-ui', fontSize:11, color:'#1E40AF',
            lineHeight:1.65 }}>{sc.insight}</span>
        </div>

        {/* ── Footer acciones ── */}
        <div style={{ borderTop:`1px solid ${PT.border}`, paddingTop:18,
          display:'flex', alignItems:'center', justifyContent:'space-between',
          flexWrap:'wrap', gap:10 }}>
          <div style={{ fontFamily:'Inter,system-ui', fontSize:10, color:PT.muted }}>
            Atlas Method · <span style={{ fontWeight:700, color:PT.blue }}>atlasmethod.com</span>
          </div>
          <div className="atlas-noprint" style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
            <button onClick={onClose}
              style={{ padding:'8px 14px', borderRadius:8, border:`1px solid ${PT.border}`,
                background:'transparent', fontFamily:'Inter,system-ui', fontSize:11,
                color:PT.sub, cursor:'pointer', fontWeight:600 }}>
              Cerrar
            </button>
            <button onClick={onGoLab}
              style={{ padding:'8px 16px', borderRadius:8, border:`1px solid ${PT.blue}`,
                background:'transparent', fontFamily:'Inter,system-ui', fontSize:11,
                color:PT.blue, cursor:'pointer', fontWeight:700 }}>
              Ir al Laboratorio →
            </button>
            <button onClick={handlePrint}
              style={{ padding:'8px 18px', borderRadius:8, border:'none',
                background:PT.blue, fontFamily:'Inter,system-ui', fontSize:11,
                color:'white', cursor:'pointer', fontWeight:700,
                boxShadow:'0 2px 8px rgba(37,99,235,0.35)' }}>
              Descargar PDF
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

// ── Barra de búsqueda global ──────────────────────────────────────────────────
function SearchBar({ query, onQuery, muscle, onMuscle }) {
  const [focused, setFocused] = React.useState(false);
  return (
    <div style={{ marginBottom:22 }}>
      <div style={{ position:'relative' }}>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
          style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)',
            stroke: focused ? '#93C5FD' : BD.muted, strokeWidth:2.5, pointerEvents:'none', transition:'stroke .15s' }}>
          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
        </svg>
        <input value={query} onChange={e => onQuery(e.target.value)}
          onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
          placeholder="Buscar ejercicios, músculos, patrones..."
          style={{ width:'100%', padding:'13px 42px 13px 42px', borderRadius:14, boxSizing:'border-box',
            background:'rgba(255,255,255,0.04)',
            border:`1.5px solid ${focused ? 'rgba(59,130,246,0.50)' : 'rgba(255,255,255,0.09)'}`,
            fontFamily:'Inter,system-ui', fontSize:14, color:BD.text, transition:'border-color .15s', outline:'none' }} />
        {query && (
          <button onClick={() => onQuery('')}
            style={{ position:'absolute', right:10, top:'50%', transform:'translateY(-50%)',
              width:26, height:26, borderRadius:8, border:'none',
              background:'rgba(255,255,255,0.08)', cursor:'pointer',
              color:BD.muted, fontSize:12, display:'flex', alignItems:'center', justifyContent:'center' }}>
            ✕
          </button>
        )}
      </div>
      <div style={{ display:'flex', gap:6, marginTop:10, overflowX:'auto', paddingBottom:2,
        msOverflowStyle:'none', scrollbarWidth:'none' }}>
        {Object.entries(MUSCLES).map(([id, def]) => {
          const active = muscle === id;
          return (
            <button key={id} onClick={() => onMuscle(active ? null : id)}
              style={{ flexShrink:0, padding:'5px 13px', borderRadius:999, border:'none', cursor:'pointer',
                background: active ? BD.blue : 'rgba(255,255,255,0.06)',
                color: active ? '#fff' : BD.muted,
                fontFamily:'Inter,system-ui', fontSize:11, fontWeight:600, transition:'background .14s, color .14s' }}>
              {def.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── Tarjeta ejercicio premium ─────────────────────────────────────────────────
function ExerciseCard({ ex, inSession, onDetail, onQuickAdd }) {
  const [hov, setHov] = React.useState(false);
  const g = exGroup(ex);
  const eq = exEquipment(ex)[0];
  const eqMeta = EQ_META[eq];
  const lvlColor = LVL_COLOR[ex.level] || BD.muted;

  return (
    <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      onClick={onDetail}
      style={{ borderRadius:14, overflow:'hidden', cursor:'pointer', position:'relative',
        border:`1.5px solid ${inSession ? 'rgba(34,197,94,0.32)' : hov ? 'rgba(59,130,246,0.42)' : BD.border}`,
        background: inSession ? 'rgba(34,197,94,0.04)' : BD.card,
        transform: hov ? 'translateY(-2px)' : 'none',
        transition:'border-color .14s, transform .14s, background .14s' }}>
      <div style={{ position:'relative' }}>
        <ExerciseMedia.Thumbnail exercise={ex} group={g} isAdded={inSession} height={96} />
        <button onClick={e => { e.stopPropagation(); onQuickAdd(); }}
          style={{ position:'absolute', top:7, right:7, width:28, height:28, borderRadius:'50%',
            border:'none', cursor:'pointer',
            background: inSession ? 'rgba(34,197,94,0.88)' : 'rgba(59,130,246,0.88)',
            color:'#fff', fontSize:13, fontWeight:700,
            display:'flex', alignItems:'center', justifyContent:'center',
            backdropFilter:'blur(8px)',
            boxShadow: inSession ? '0 2px 10px rgba(34,197,94,0.45)' : '0 2px 10px rgba(59,130,246,0.45)',
            transition:'transform .12s' }}
          onMouseEnter={e => e.currentTarget.style.transform='scale(1.12)'}
          onMouseLeave={e => e.currentTarget.style.transform='scale(1)'}>
          {inSession ? '✓' : '+'}
        </button>
        <div style={{ position:'absolute', bottom:7, left:8, width:7, height:7, borderRadius:'50%',
          background:lvlColor, boxShadow:`0 0 5px ${lvlColor}88` }} />
      </div>
      <div style={{ padding:'8px 10px 10px' }}>
        <div style={{ fontFamily:'Inter,system-ui', fontSize:11.5, fontWeight:700, color:BD.text,
          display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical',
          overflow:'hidden', lineHeight:1.35, marginBottom:5 }}>{ex.name}</div>
        <div style={{ display:'flex', gap:5, flexWrap:'wrap' }}>
          {eqMeta && (
            <span style={{ padding:'2px 7px', borderRadius:999,
              background:eqMeta.bg, color:eqMeta.color,
              fontFamily:'Inter,system-ui', fontSize:9, fontWeight:700 }}>{eqMeta.label}</span>
          )}
          {ex.compound && (
            <span style={{ padding:'2px 7px', borderRadius:999,
              background:'rgba(245,158,11,0.12)', color:'#FCD34D',
              fontFamily:'Inter,system-ui', fontSize:9, fontWeight:700 }}>Comp.</span>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Detalle de ejercicio ──────────────────────────────────────────────────────
function ExerciseDetail({ ex, inSession, onAdd, onBack }) {
  const g    = exGroup(ex);
  const cues = ex.cues || [];
  return (
    <div style={{ animation:'fadeIn .18s ease', display:'flex', flexDirection:'column', height:'100%' }}>
      <button onClick={onBack}
        style={{ display:'flex', alignItems:'center', gap:6, background:'none', border:'none',
          cursor:'pointer', padding:'4px 0', marginBottom:16,
          fontFamily:'Inter,system-ui', fontSize:12, color:BD.sub, fontWeight:600, flexShrink:0 }}>
        ← Volver
      </button>
      <div style={{ flex:1, overflowY:'auto', paddingBottom:8 }}>
        <div style={{ borderRadius:14, overflow:'hidden', marginBottom:16 }}>
          <ExerciseMedia.Thumbnail exercise={ex} group={g} isAdded={false} height={160} />
        </div>
        <div style={{ marginBottom:14 }}>
          <div style={{ fontFamily:'"Space Grotesk",system-ui', fontSize:22, fontWeight:700,
            color:BD.text, lineHeight:1.2, marginBottom:10 }}>{ex.name}</div>
          <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
            {exEquipment(ex).map(eq => {
              const m = EQ_META[eq];
              if (!m) return null;
              return <span key={eq} style={{ padding:'4px 10px', borderRadius:999,
                background:m.bg, color:m.color, fontFamily:'Inter,system-ui', fontSize:10, fontWeight:700 }}>{m.label}</span>;
            })}
            {ex.level && (
              <span style={{ padding:'4px 10px', borderRadius:999,
                background:'rgba(255,255,255,0.06)', color:LVL_COLOR[ex.level] || BD.muted,
                fontFamily:'Inter,system-ui', fontSize:10, fontWeight:700 }}>
                {LVL_LABEL[ex.level]}
              </span>
            )}
            {ex.compound && (
              <span style={{ padding:'4px 10px', borderRadius:999,
                background:'rgba(245,158,11,0.12)', color:'#FCD34D',
                fontFamily:'Inter,system-ui', fontSize:10, fontWeight:700 }}>⚡ Compuesto</span>
            )}
          </div>
        </div>
        <div style={{ marginBottom:18 }}>
          <div style={{ fontFamily:'ui-monospace,Menlo,monospace', fontSize:8.5, fontWeight:700,
            color:BD.muted, letterSpacing:1.5, marginBottom:8 }}>MÚSCULOS</div>
          <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
            {(ex.muscles.primary || []).map(m => (
              <span key={m} style={{ padding:'4px 10px', borderRadius:999,
                background:BD.blueDim, color:'#93C5FD',
                fontFamily:'Inter,system-ui', fontSize:10, fontWeight:600 }}>{m}</span>
            ))}
            {(ex.muscles.secondary || []).map(m => (
              <span key={m} style={{ padding:'4px 10px', borderRadius:999,
                background:'rgba(255,255,255,0.05)', color:BD.muted,
                fontFamily:'Inter,system-ui', fontSize:10 }}>{m}</span>
            ))}
          </div>
        </div>
        {cues.length > 0 && (
          <div style={{ marginBottom:22 }}>
            <div style={{ fontFamily:'ui-monospace,Menlo,monospace', fontSize:8.5, fontWeight:700,
              color:BD.muted, letterSpacing:1.5, marginBottom:10 }}>TÉCNICA</div>
            {cues.map((cue, i) => (
              <div key={i} style={{ display:'flex', gap:10, marginBottom:9 }}>
                <span style={{ width:20, height:20, borderRadius:7, background:BD.blueDim,
                  color:'#93C5FD', fontFamily:'ui-monospace,Menlo,monospace', fontSize:9, fontWeight:700,
                  display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, marginTop:1 }}>{i+1}</span>
                <span style={{ fontFamily:'Inter,system-ui', fontSize:12.5, color:BD.sub, lineHeight:1.55 }}>{cue}</span>
              </div>
            ))}
          </div>
        )}
        {(ex.variants || []).length > 0 && (
          <div style={{ marginBottom:18 }}>
            <div style={{ fontFamily:'ui-monospace,Menlo,monospace', fontSize:8.5, fontWeight:700,
              color:BD.muted, letterSpacing:1.5, marginBottom:8 }}>VARIANTES</div>
            <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
              {ex.variants.map(v => (
                <span key={v} style={{ padding:'4px 10px', borderRadius:999,
                  background:'rgba(255,255,255,0.05)', color:BD.sub,
                  fontFamily:'Inter,system-ui', fontSize:10 }}>{v}</span>
              ))}
            </div>
          </div>
        )}
      </div>
      <div style={{ paddingTop:14, flexShrink:0 }}>
        <button onClick={onAdd}
          style={{ width:'100%', padding:'14px 20px', borderRadius:13, cursor:'pointer',
            background: inSession ? 'rgba(34,197,94,0.12)' : BD.blue,
            color: inSession ? BD.green : '#fff', border:'none',
            fontFamily:'Inter,system-ui', fontSize:14, fontWeight:700, letterSpacing:-0.2,
            boxShadow: inSession ? 'none' : '0 8px 28px -8px rgba(59,130,246,0.50)',
            transition:'all .15s' }}>
          {inSession ? '✓ Editar series →' : 'Añadir a sesión →'}
        </button>
      </div>
    </div>
  );
}

// ── Panel de resultados ───────────────────────────────────────────────────────
function ResultsPanel({ filteredExs, sessionIds, workout, muscle, query, priorities, onDetail, onQuickAdd, onRemoveEx, onEditEx, onTogglePriority }) {
  const sessionExsInView = workout.filter(e => filteredExs.some(f => f.id === e.id));
  const remainingExs     = filteredExs.filter(e => !sessionIds.has(e.id));
  const prio             = muscle ? priorities[muscle] : null;

  return (
    <div style={{ animation:'fadeIn .18s ease', display:'flex', flexDirection:'column', height:'100%' }}>
      <div style={{ marginBottom:16, flexShrink:0 }}>
        <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:12, flexWrap:'wrap' }}>
          <div>
            <div style={{ fontFamily:'Inter,system-ui', fontSize:26, fontWeight:900,
              color:BD.text, letterSpacing:-1.5, lineHeight:1 }}>
              {muscle ? MUSCLES[muscle].label : 'Resultados'}
            </div>
            <div style={{ fontFamily:'Inter,system-ui', fontSize:11, color:BD.muted, marginTop:4 }}>
              {filteredExs.length} ejercicio{filteredExs.length !== 1 ? 's' : ''}
              {query.trim() ? ` · "${query.trim()}"` : ''}
            </div>
          </div>
          {muscle && (
            <button onClick={() => onTogglePriority(muscle)}
              style={{ flexShrink:0, padding:'7px 14px', borderRadius:999, border:'none', cursor:'pointer',
                background: prio === 'priority' ? BD.blue
                           : prio === 'maintain' ? 'rgba(34,197,94,0.15)'
                           : prio === 'reducir'  ? 'rgba(245,158,11,0.12)'
                           : 'rgba(255,255,255,0.06)',
                color: prio === 'priority' ? '#fff'
                      : prio === 'maintain' ? BD.green
                      : prio === 'reducir'  ? BD.amber
                      : BD.muted,
                fontFamily:'Inter,system-ui', fontSize:11, fontWeight:700, transition:'all .15s',
                boxShadow: prio === 'priority' ? '0 4px 16px -4px rgba(59,130,246,0.50)' : 'none' }}>
              {prio === 'priority' ? '🎯 Prioridad'
               : prio === 'maintain' ? '✓ Mantener'
               : prio === 'reducir'  ? '↓ Reducir'
               : '+ Priorizar'}
            </button>
          )}
        </div>
      </div>

      <div style={{ flex:1, overflowY:'auto', paddingBottom:8 }}>
        {sessionExsInView.length > 0 && (
          <div style={{ marginBottom:20 }}>
            <div style={{ fontFamily:'ui-monospace,Menlo,monospace', fontSize:8.5, fontWeight:700,
              color:BD.muted, letterSpacing:1, marginBottom:10 }}>EN TU SESIÓN</div>
            {sessionExsInView.map(ex => (
              <ExRow key={ex.id} ex={ex} onRemove={() => onRemoveEx(ex.id)} onEdit={() => onEditEx(ex)} />
            ))}
          </div>
        )}
        {remainingExs.length > 0 && (
          <div>
            {sessionExsInView.length > 0 && (
              <div style={{ fontFamily:'ui-monospace,Menlo,monospace', fontSize:8.5, fontWeight:700,
                color:BD.muted, letterSpacing:1, marginBottom:10 }}>DISPONIBLES</div>
            )}
            <div style={{ display:'grid', gridTemplateColumns:'repeat(2, 1fr)', gap:10 }}>
              {remainingExs.map(ex => (
                <ExerciseCard key={ex.id} ex={ex} inSession={false}
                  onDetail={() => onDetail(ex)}
                  onQuickAdd={() => onQuickAdd(ex)} />
              ))}
            </div>
          </div>
        )}
        {filteredExs.length === 0 && (
          <div style={{ padding:'52px 0', textAlign:'center',
            fontFamily:'Inter,system-ui', fontSize:13, color:BD.muted, lineHeight:1.65 }}>
            Sin resultados<br/>
            <span style={{ fontSize:11 }}>Prueba con otro término o grupo muscular</span>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Fila ejercicio en sesión ──────────────────────────────────────────────────
function ExRow({ ex, onRemove, onEdit }) {
  const [hov, setHov] = React.useState(false);
  const g = exGroup(ex);
  return (
    <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      onClick={onEdit}
      style={{ display:'flex', alignItems:'center', borderRadius:12, overflow:'hidden',
        background: hov ? BD.hov : BD.card, border:`1px solid ${BD.border}`,
        marginBottom:8, cursor:'pointer', transition:'background .12s' }}>
      <div style={{ width:54, flexShrink:0 }}>
        <ExerciseMedia.Thumbnail exercise={ex} group={g} isAdded={false} height={54} />
      </div>
      <div style={{ flex:1, padding:'0 11px', minWidth:0 }}>
        <div style={{ fontFamily:'Inter,system-ui', fontSize:12, fontWeight:700, color:BD.text,
          overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{ex.name}</div>
        <div style={{ fontFamily:'Inter,system-ui', fontSize:10, color:BD.muted, marginTop:2 }}>
          {ex.sets.length} serie{ex.sets.length !== 1 ? 's' : ''}
          {ex.sets[0]?.kg ? ` · ${ex.sets[0].kg} kg` : ''}
        </div>
      </div>
      <div style={{ display:'flex', alignItems:'center', gap:8, paddingRight:10 }}>
        <span style={{ fontSize:11, color:BD.green }}>✓</span>
        <button onClick={e => { e.stopPropagation(); onRemove(); }}
          style={{ width:24, height:24, borderRadius:7, border:'none',
            background:'rgba(239,68,68,0.14)', color:'rgba(239,68,68,0.80)',
            cursor:'pointer', fontSize:11, display:'flex', alignItems:'center', justifyContent:'center' }}>
          ✕
        </button>
      </div>
    </div>
  );
}

// ── Configurar series ─────────────────────────────────────────────────────────
function SetConfig({ ex, initSets, onConfirm, onBack }) {
  const [sets, setSets] = React.useState(() =>
    initSets && initSets.length > 0
      ? initSets.map(s => ({ kg: s.kg || '', reps: s.reps || '10', rir: s.rir || '' }))
      : [{ kg:'', reps:'10', rir:'' }, { kg:'', reps:'10', rir:'' }, { kg:'', reps:'10', rir:'' }]
  );
  const upd = (i,f,v) => setSets(p => p.map((s,idx) => idx===i ? {...s,[f]:v} : s));
  const add = () => setSets(p => [...p, { kg:'', reps:'10', rir:'' }]);
  const rem = i => setSets(p => p.filter((_,idx) => idx!==i));
  const g = exGroup(ex);
  const inp = {
    type:'number', min:0,
    style:{ width:'100%', padding:'10px 6px', borderRadius:9, boxSizing:'border-box',
      border:`1px solid ${BD.border}`, background:'rgba(255,255,255,0.04)',
      fontFamily:'ui-monospace,Menlo,monospace', fontSize:14, color:BD.text, textAlign:'center' },
  };
  return (
    <div style={{ animation:'fadeIn .18s ease', display:'flex', flexDirection:'column', height:'100%' }}>
      <button onClick={onBack}
        style={{ display:'flex', alignItems:'center', gap:6, background:'none', border:'none',
          cursor:'pointer', padding:'4px 0', marginBottom:14,
          fontFamily:'Inter,system-ui', fontSize:12, color:BD.sub, fontWeight:600, flexShrink:0 }}>
        ← Volver
      </button>
      <div style={{ borderRadius:14, overflow:'hidden', marginBottom:18, flexShrink:0 }}>
        <ExerciseMedia.Thumbnail exercise={ex} group={g} isAdded={false} height={120} />
        <div style={{ padding:'11px 13px', background:BD.card }}>
          <div style={{ fontFamily:'Inter,system-ui', fontSize:15, fontWeight:700, color:BD.text }}>{ex.name}</div>
          <div style={{ fontFamily:'Inter,system-ui', fontSize:11, color:BD.muted, marginTop:2 }}>
            {ex.muscles.primary.join(' · ')}
          </div>
        </div>
      </div>
      <div style={{ flex:1, overflowY:'auto' }}>
        <div style={{ display:'grid', gridTemplateColumns:'20px 1fr 1fr 48px 20px', gap:6, marginBottom:8 }}>
          {['','Kg','Reps','RIR',''].map((h,i) => (
            <span key={i} style={{ fontFamily:'ui-monospace,Menlo,monospace', fontSize:8,
              color:BD.muted, fontWeight:700, textAlign:'center', letterSpacing:0.5 }}>{h}</span>
          ))}
        </div>
        {sets.map((set, i) => (
          <div key={i} style={{ display:'grid', gridTemplateColumns:'20px 1fr 1fr 48px 20px', gap:6, alignItems:'center', marginBottom:7 }}>
            <span style={{ fontFamily:'ui-monospace,Menlo,monospace', fontSize:10, color:BD.muted, textAlign:'center' }}>{i+1}</span>
            <input {...inp} value={set.kg}   placeholder="—"  step={0.5} onChange={e => upd(i,'kg',  e.target.value)} />
            <input {...inp} value={set.reps} placeholder="10" step={1}   onChange={e => upd(i,'reps',e.target.value)} />
            <input {...inp} value={set.rir || ''} placeholder="—" min={0} max={5} step={1} onChange={e => upd(i,'rir',e.target.value)} />
            {sets.length > 1
              ? <button onClick={() => rem(i)} style={{ width:20, height:20, border:'none', background:'rgba(239,68,68,0.14)',
                  color:'rgba(239,68,68,0.80)', borderRadius:5, cursor:'pointer', fontSize:10,
                  display:'flex', alignItems:'center', justifyContent:'center', padding:0 }}>✕</button>
              : <div />}
          </div>
        ))}
        <button onClick={add}
          style={{ marginTop:4, marginBottom:18, padding:'7px 12px', borderRadius:9,
            border:'1px dashed rgba(255,255,255,0.15)', background:'transparent',
            cursor:'pointer', fontFamily:'Inter,system-ui', fontSize:11, fontWeight:600, color:BD.sub }}>
          + Serie
        </button>
        <button onClick={() => onConfirm(ex, sets)}
          style={{ width:'100%', padding:'14px 20px', borderRadius:13, cursor:'pointer',
            background:BD.blue, color:'#fff', border:'none',
            fontFamily:'Inter,system-ui', fontSize:14, fontWeight:700, letterSpacing:-0.2,
            boxShadow:'0 8px 28px -8px rgba(59,130,246,0.50)' }}>
          Añadir · {sets.length} serie{sets.length !== 1 ? 's' : ''} →
        </button>
      </div>
    </div>
  );
}

// ── Panel vacío ───────────────────────────────────────────────────────────────
function EmptyPanel({ onPick, priorities }) {
  const hasPrios = Object.values(priorities).some(v => v === 'priority');
  return (
    <div style={{ paddingTop:8 }}>
      <div style={{ fontFamily:'"Space Grotesk",system-ui', fontWeight:600,
        fontSize:22, color:BD.sub, marginBottom:10, lineHeight:1.2 }}>
        {hasPrios ? 'Tu plan de desarrollo' : 'Construye tu físico'}
      </div>
      <p style={{ fontFamily:'Inter,system-ui', fontSize:13, color:BD.muted,
        lineHeight:1.65, margin:'0 0 22px', maxWidth:300 }}>
        {hasPrios
          ? 'Toca un músculo del mapa o busca un ejercicio. Tu perfil de prioridades guía las recomendaciones.'
          : 'Selecciona músculos en el mapa para priorizar su desarrollo. Después busca o añade ejercicios.'}
      </p>
      <div style={{ display:'flex', flexWrap:'wrap', gap:7 }}>
        {Object.entries(MUSCLES).map(([id, def]) => {
          const prio = priorities[id];
          return (
            <button key={id} onClick={() => onPick(id)}
              style={{ padding:'6px 13px', borderRadius:999,
                background: prio === 'priority' ? BD.blueDim
                           : prio === 'maintain' ? 'rgba(34,197,94,0.08)'
                           : prio === 'reducir'  ? 'rgba(245,158,11,0.08)'
                           : 'rgba(255,255,255,0.04)',
                border: prio === 'priority' ? '1px solid rgba(59,130,246,0.40)'
                       : prio === 'maintain' ? '1px solid rgba(34,197,94,0.28)'
                       : prio === 'reducir'  ? '1px solid rgba(245,158,11,0.24)'
                       : `1px solid ${BD.border}`,
                fontFamily:'Inter,system-ui', fontSize:11, fontWeight:600,
                color: prio === 'priority' ? '#93C5FD'
                      : prio === 'maintain' ? BD.green
                      : prio === 'reducir'  ? BD.amber
                      : BD.muted,
                cursor:'pointer', transition:'all .12s' }}>
              {prio === 'priority' ? '🎯 ' : prio === 'maintain' ? '✓ ' : prio === 'reducir' ? '↓ ' : ''}{def.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── Barra de sesión sticky ────────────────────────────────────────────────────
function WorkoutBar({ workout, saved, duration, onSave, mobile }) {
  return (
    <div style={{ position:'fixed', bottom:0, left:0, right:0, zIndex:200,
      background:'rgba(6,13,24,0.97)', backdropFilter:'blur(24px)',
      borderTop:'1px solid rgba(255,255,255,0.08)',
      padding: mobile ? '12px 16px' : '12px 32px',
      display:'flex', alignItems:'center', gap:12 }}>
      <div style={{ flex:1, display:'flex', gap:6, overflow:'hidden' }}>
        {workout.slice(0, mobile ? 2 : 5).map(ex => {
          const gs = ExerciseMedia.GROUP_STYLE[exGroup(ex)] || ExerciseMedia.GROUP_STYLE.core;
          return (
            <span key={ex.id} style={{ display:'flex', alignItems:'center', gap:6,
              padding:'5px 10px', borderRadius:999, flexShrink:0,
              background:'rgba(255,255,255,0.06)', border:`1px solid ${BD.border}`,
              fontFamily:'Inter,system-ui', fontSize:11, fontWeight:600, color:BD.sub,
              maxWidth:140, overflow:'hidden' }}>
              <span style={{ width:6, height:6, borderRadius:'50%', background:gs?.to||BD.blue, flexShrink:0 }} />
              <span style={{ overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{ex.name}</span>
            </span>
          );
        })}
        {workout.length > (mobile ? 2 : 5) && (
          <span style={{ padding:'5px 10px', borderRadius:999, flexShrink:0,
            background:'rgba(255,255,255,0.04)',
            fontFamily:'Inter,system-ui', fontSize:11, color:BD.muted }}>
            +{workout.length - (mobile ? 2 : 5)}
          </span>
        )}
      </div>
      {!mobile && (
        <span style={{ fontFamily:'ui-monospace,Menlo,monospace', fontSize:11, color:BD.muted, flexShrink:0 }}>
          ~{duration} min
        </span>
      )}
      <button onClick={onSave}
        style={{ flexShrink:0, padding:'11px 20px', borderRadius:12, border:'none', cursor:'pointer',
          background: saved ? 'rgba(34,197,94,0.15)' : BD.blue,
          color: saved ? BD.green : '#fff',
          fontFamily:'Inter,system-ui', fontSize:13, fontWeight:700, transition:'all .25s', whiteSpace:'nowrap' }}>
        {saved ? '✓ +30 💎' : 'Guardar +30 💎'}
      </button>
    </div>
  );
}

// ── Componente principal ──────────────────────────────────────────────────────
function BuilderSection() {
  const { state, actions } = useStore();
  const { navigate }       = useRoute();
  const mobile             = useWidth() < 680;

  const [view,       setView]      = React.useState('front');
  const [muscle,     setMuscle]    = React.useState(null);
  const [query,      setQuery]     = React.useState('');
  const [mode,       setMode]      = React.useState('empty');
  const [detailEx,   setDetailEx]  = React.useState(null);
  const [cfgEx,      setCfgEx]     = React.useState(null);
  const [cfgSets,    setCfgSets]   = React.useState(null);
  const [cfgFromDet, setCfgFromDet]= React.useState(false);
  const [workout,    setWorkout]   = React.useState([]);
  const [saved,      setSaved]     = React.useState(false);
  const [flash,      setFlash]     = React.useState(false);
  const [showPlan,   setShowPlan]  = React.useState(false);

  // Priorities persist in localStorage
  const [priorities, setPrioritiesRaw] = React.useState(() => {
    try { return JSON.parse(localStorage.getItem('atlas.priorities') || '{}'); } catch { return {}; }
  });
  function setPriorities(next) {
    setPrioritiesRaw(next);
    try { localStorage.setItem('atlas.priorities', JSON.stringify(next)); } catch {}
  }

  function togglePriority(id) {
    setPriorities(prev => {
      const cur = prev[id];
      const next = cur === 'priority' ? 'maintain'
                 : cur === 'maintain' ? 'reducir'
                 : cur === 'reducir'  ? null
                 : 'priority';
      const copy = { ...prev };
      if (next === null) delete copy[id]; else copy[id] = next;
      return copy;
    });
  }

  const allExs = React.useMemo(() => ExerciseService.getAll(), []);

  const [coachBanner, setCoachBanner] = React.useState(null);

  React.useEffect(() => {
    const raw  = localStorage.getItem('atlas.pendingWorkout');
    const meta = (() => { try { return JSON.parse(localStorage.getItem('atlas.pendingWorkoutMeta') || 'null'); } catch { return null; } })();
    if (!raw) return;
    try {
      const exs = JSON.parse(raw);
      if (Array.isArray(exs) && exs.length > 0) {
        setWorkout(exs);
        localStorage.removeItem('atlas.pendingWorkout');
        if (meta) {
          localStorage.removeItem('atlas.pendingWorkoutMeta');
          setCoachBanner(meta);
        }
      }
    } catch {}
  }, []);

  const filteredExs = React.useMemo(() => {
    let exs = allExs;
    if (muscle) exs = exsForMuscle(muscle, exs);
    const q = query.trim().toLowerCase();
    if (q) {
      exs = exs.filter(ex =>
        ex.name.toLowerCase().includes(q) ||
        (ex.muscles.primary || []).some(m => m.toLowerCase().includes(q)) ||
        (ex.tags || []).some(t => t.toLowerCase().includes(q)) ||
        (ex.pattern || '').toLowerCase().includes(q)
      );
    }
    return exs;
  }, [allExs, muscle, query]);

  // Sets per muscle in current workout session
  const sessionSets = React.useMemo(() => {
    const acc = {};
    for (const ex of workout) {
      const g = exGroup(ex);
      acc[g] = (acc[g] || 0) + (ex.sets?.length || 0);
    }
    return acc;
  }, [workout]);

  const sessionIds = React.useMemo(() => new Set(workout.map(e => e.id)), [workout]);
  const duration   = React.useMemo(() => sessionDuration(workout), [workout]);
  const hasFilter  = muscle !== null || query.trim() !== '';

  function pickMuscle(id) {
    setMuscle(id);
    setMode('results');
    const def = MUSCLES[id];
    if (def?.view === 'back')  setView('back');
    if (def?.view === 'front') setView('front');
  }

  function handleMuscleChip(id) {
    if (id === null) {
      setMuscle(null);
      if (mode !== 'detail' && mode !== 'config') setMode(query.trim() ? 'results' : 'empty');
    } else {
      pickMuscle(id);
    }
  }

  function handleQuery(q) {
    setQuery(q);
    if (mode !== 'detail' && mode !== 'config') {
      setMode(q.trim() || muscle ? 'results' : 'empty');
    }
  }

  function openDetail(ex) { setDetailEx(ex); setMode('detail'); }

  function openConfig(ex, fromDetail) {
    setCfgEx(ex);
    setCfgSets(workout.find(e => e.id === ex.id)?.sets || null);
    setCfgFromDet(!!fromDetail);
    setMode('config');
  }

  function confirmSets(ex, sets) {
    setWorkout(prev =>
      prev.find(e => e.id === ex.id)
        ? prev.map(e => e.id === ex.id ? { ...e, sets } : e)
        : [...prev, { ...ex, sets }]
    );
    setMode(hasFilter ? 'results' : 'empty');
  }

  function removeEx(id) { setWorkout(prev => prev.filter(e => e.id !== id)); }
  function editEx(ex) { openConfig(ex, false); }

  function save() {
    if (!workout.length) return;
    actions.logSession(workout.map(ex => ({
      id: ex.id, name: ex.name, group: exGroup(ex),
      muscles: ex.muscles.primary, sets: ex.sets,
    })));
    setSaved(true); setFlash(true);
    setTimeout(() => setFlash(false), 2500);
    setTimeout(() => { setSaved(false); setWorkout([]); setMuscle(null); setQuery(''); setMode('empty'); }, 3000);
  }

  const renderMode = mode === 'empty' && hasFilter ? 'results' : mode;

  return (
    <section style={{ minHeight:'100vh', background:BD.page }}>
      <div style={{ maxWidth:1060, margin:'0 auto', padding: mobile ? '48px 16px 120px' : '64px 28px 120px' }}>

        {coachBanner && (
          <div style={{
            display:'flex', alignItems:'center', gap:14,
            padding:'11px 18px', borderRadius:12,
            background:'rgba(37,99,235,0.07)', border:'1px solid rgba(37,99,235,0.16)',
            marginBottom:20, animation:'fadeIn .25s ease', flexWrap:'wrap',
          }}>
            <div style={{ display:'flex', alignItems:'center', gap:8, flex:1, minWidth:0 }}>
              <span style={{ fontFamily:'ui-monospace,Menlo,monospace', fontSize:9, fontWeight:700, color:'#93C5FD', letterSpacing:1.1 }}>ATLAS COACH</span>
              <span style={{ fontFamily:'Inter,system-ui', fontSize:12, fontWeight:600, color:'rgba(147,197,253,0.80)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                {coachBanner.routineName || 'Plan generado'}
                {coachBanner.totalSessions > 1 ? ` · Día ${(coachBanner.sessionIndex || 0) + 1}/${coachBanner.totalSessions}` : ''}
                {' · '}{coachBanner.sessionName || ''}
              </span>
            </div>
            <button onClick={() => setCoachBanner(null)} style={{ background:'none', border:'none', cursor:'pointer', color:'rgba(147,197,253,0.35)', fontSize:14, padding:'2px 6px', flexShrink:0 }}>✕</button>
          </div>
        )}

        {flash && (
          <div style={{ position:'fixed', top:72, right:20, zIndex:400,
            background:'#0F1A2E', color:BD.text, padding:'10px 18px',
            borderRadius:999, fontFamily:'Inter,system-ui', fontSize:13, fontWeight:700,
            animation:'fadeIn .3s ease', boxShadow:'0 8px 32px rgba(0,0,0,0.5)', whiteSpace:'nowrap' }}>
            💎 +30 gemas · Sesión guardada
          </div>
        )}

        <div style={{ marginBottom: mobile ? 20 : 28 }}>
          <h1 style={{ fontFamily:'Inter,system-ui', fontWeight:900,
            fontSize: mobile ? 26 : 38, color:BD.text, letterSpacing:-2,
            lineHeight:1, margin:0 }}>
            Construye tu físico.{' '}
            <span style={{ fontFamily:'"Space Grotesk",system-ui', fontWeight:400, color:BD.sub, letterSpacing:-0.5 }}>
              De forma inteligente.
            </span>
          </h1>
        </div>

        <SearchBar query={query} onQuery={handleQuery} muscle={muscle} onMuscle={handleMuscleChip} />

        <div style={{ display:'flex', gap: mobile ? 0 : 44,
          alignItems:'flex-start', flexDirection: mobile ? 'column' : 'row' }}>

          {/* ── Mapa corporal ── */}
          <div style={{ width: mobile ? '100%' : 288, flexShrink:0, marginBottom: mobile ? 28 : 0 }}>

            {/* Atlas Score — siempre visible en cabecera de columna */}
            <AtlasScoreCard priorities={priorities} log={state.log} sessionSets={sessionSets} />

            <div style={{ display:'flex', gap:3, marginBottom:16,
              background:'rgba(255,255,255,0.04)', borderRadius:10, padding:3 }}>
              {[['front','Frontal'],['back','Posterior']].map(([v,lbl]) => (
                <button key={v} onClick={() => setView(v)}
                  style={{ flex:1, padding:'8px 0', borderRadius:7, border:'none', cursor:'pointer',
                    background: view === v ? BD.blue : 'transparent',
                    color: view === v ? '#fff' : BD.muted,
                    fontFamily:'Inter,system-ui', fontSize:11, fontWeight:700, transition:'all .14s' }}>
                  {lbl}
                </button>
              ))}
            </div>
            <div style={{ maxWidth: mobile ? 210 : 'none', margin: mobile ? '0 auto' : '0' }}>
              <BodyMap view={view} selected={muscle} onPick={pickMuscle} priorities={priorities} />
            </div>

            {/* Panel científico — aparece cuando hay músculo seleccionado */}
            {muscle && (
              <div style={{ marginTop:12 }}>
                <SciencePanel
                  muscleId={muscle}
                  priorities={priorities}
                  log={state.log}
                  sessionSets={sessionSets}
                  onTogglePriority={togglePriority}
                />
              </div>
            )}

            {/* Volume panel — resumen global de todas las prioridades */}
            <div style={{ marginTop:12 }}>
              <WeeklyVolumePanel priorities={priorities} log={state.log} sessionSets={sessionSets} />
            </div>

            {/* Balance panel — desequilibrios musculares */}
            <BalancePanel log={state.log} sessionSets={sessionSets} />

            {/* Coach recommendation — split + volumen + estructura científica */}
            <CoachRecommendationPanel
              priorities={priorities}
              log={state.log}
              sessionSets={sessionSets}
            />

            {(Object.keys(priorities).length > 0 || workout.length > 0) && (
              <div style={{ marginTop:12, display:'flex', flexDirection:'column', gap:6 }}>
                <button onClick={() => setShowPlan(true)}
                  style={{ width:'100%', padding:'12px 0', borderRadius:10, border:'none',
                    cursor:'pointer',
                    background:'linear-gradient(135deg, #1D4ED8 0%, #2563EB 100%)',
                    color:'white', fontFamily:'Inter,system-ui', fontSize:12.5, fontWeight:700,
                    letterSpacing:0.2, boxShadow:'0 4px 20px rgba(37,99,235,0.40)',
                    transition:'opacity .15s' }}>
                  Generar Plan →
                </button>
                {workout.length > 0 && (
                  <button onClick={() => navigate('/coach')}
                    style={{ width:'100%', padding:'9px 0', borderRadius:10,
                      border:'1px solid rgba(59,130,246,0.22)', background:'rgba(59,130,246,0.06)',
                      color:'#93C5FD', fontFamily:'Inter,system-ui', fontSize:11.5, fontWeight:700,
                      cursor:'pointer' }}>
                    Analizar con Coach →
                  </button>
                )}
              </div>
            )}
          </div>

          {/* ── Panel contextual ── */}
          <div style={{ flex:1, minWidth:0, width: mobile ? '100%' : undefined,
            maxHeight: mobile ? 'none' : 700, overflowY: mobile ? 'visible' : 'auto' }}>

            {renderMode === 'empty' && (
              <EmptyPanel onPick={pickMuscle} priorities={priorities} />
            )}

            {renderMode === 'results' && (
              <ResultsPanel
                filteredExs={filteredExs}
                sessionIds={sessionIds}
                workout={workout}
                muscle={muscle}
                query={query}
                priorities={priorities}
                onDetail={openDetail}
                onQuickAdd={ex => openConfig(ex, false)}
                onRemoveEx={removeEx}
                onEditEx={editEx}
                onTogglePriority={togglePriority}
              />
            )}

            {renderMode === 'detail' && detailEx && (
              <ExerciseDetail
                ex={detailEx}
                inSession={sessionIds.has(detailEx.id)}
                onAdd={() => openConfig(detailEx, true)}
                onBack={() => setMode(hasFilter ? 'results' : 'empty')}
              />
            )}

            {renderMode === 'config' && cfgEx && (
              <SetConfig
                key={cfgEx.id}
                ex={cfgEx}
                initSets={cfgSets}
                onConfirm={confirmSets}
                onBack={() => {
                  if (cfgFromDet && detailEx) setMode('detail');
                  else setMode(hasFilter ? 'results' : 'empty');
                }}
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

      {showPlan && (
        <PlanModal
          priorities={priorities}
          log={state.log}
          sessionSets={sessionSets}
          workout={workout}
          onClose={() => setShowPlan(false)}
          onGoLab={() => { setShowPlan(false); navigate('/laboratorio'); }}
        />
      )}
    </section>
  );
}

Object.assign(window, { BuilderSection });
