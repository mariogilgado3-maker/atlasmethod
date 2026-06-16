// Atlas Builder v6 — 11 grupos musculares, prioridades, ciencia, físico objetivo

// ── Design tokens ──────────────────────────────────────────────────────────────
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

// ── Grupos musculares (11) ─────────────────────────────────────────────────────
const MUSCLES = {
  pecho:      { label: 'Pecho',          short: 'Pecho',     view: 'front' },
  espalda:    { label: 'Espalda',        short: 'Espalda',   view: 'back'  },
  deltoides:  { label: 'Deltoides',      short: 'Delts',     view: 'both'  },
  biceps:     { label: 'Bíceps',         short: 'Bíceps',    view: 'front' },
  triceps:    { label: 'Tríceps',        short: 'Tríceps',   view: 'back'  },
  abdomen:    { label: 'Abdomen',        short: 'Abs',       view: 'front' },
  cuadriceps: { label: 'Cuádriceps',     short: 'Cuáds',     view: 'front' },
  isquio:     { label: 'Isquiotibiales', short: 'Isquios',   view: 'back'  },
  gluteos:    { label: 'Glúteos',        short: 'Glúteos',   view: 'back'  },
  gemelos:    { label: 'Gemelos',        short: 'Gemelos',   view: 'both'  },
  antebrazos: { label: 'Antebrazos',     short: 'Antebrz.',  view: 'both'  },
};

// ── Datos científicos — series/semana (Israetel & Schoenfeld) ─────────────────
const SCIENCE = {
  pecho:      { mev: 10, mav: 17, mrv: 22 },
  espalda:    { mev: 10, mav: 18, mrv: 25 },
  deltoides:  { mev:  6, mav: 16, mrv: 26 },
  biceps:     { mev:  6, mav: 14, mrv: 20 },
  triceps:    { mev:  6, mav: 14, mrv: 18 },
  abdomen:    { mev:  0, mav: 16, mrv: 25 },
  cuadriceps: { mev:  8, mav: 16, mrv: 20 },
  isquio:     { mev:  4, mav: 10, mrv: 16 },
  gluteos:    { mev:  4, mav: 12, mrv: 16 },
  gemelos:    { mev:  8, mav: 16, mrv: 20 },
  antebrazos: { mev:  4, mav: 10, mrv: 18 },
};

// ── Ejercicios por grupo ───────────────────────────────────────────────────────
const EXERCISES = {
  pecho: [
    { name: 'Press banca',     type: 'Compuesto',   muscles: 'Pectoral mayor, Tríceps, Deltoides anterior' },
    { name: 'Press inclinado', type: 'Compuesto',   muscles: 'Pectoral clavicular, Deltoides anterior' },
    { name: 'Aperturas',       type: 'Aislamiento', muscles: 'Pectoral mayor — máximo estiramiento' },
  ],
  espalda: [
    { name: 'Dominadas',       type: 'Compuesto', muscles: 'Dorsal ancho, Bíceps, Romboides' },
    { name: 'Jalón polea',     type: 'Compuesto', muscles: 'Dorsal ancho, Bíceps' },
    { name: 'Remo con barra',  type: 'Compuesto', muscles: 'Trapecio, Romboides, Dorsal ancho' },
  ],
  deltoides: [
    { name: 'Press militar',          type: 'Compuesto',   muscles: 'Deltoides anterior y lateral, Tríceps' },
    { name: 'Elevaciones laterales',  type: 'Aislamiento', muscles: 'Deltoides lateral — cabeza media' },
  ],
  biceps: [
    { name: 'Curl barra',     type: 'Aislamiento', muscles: 'Bíceps braquial, Braquial' },
    { name: 'Curl inclinado', type: 'Aislamiento', muscles: 'Bíceps — cabeza larga, estiramiento completo' },
  ],
  triceps: [
    { name: 'Fondos',      type: 'Compuesto',   muscles: 'Tríceps, Pectoral inferior, Deltoides anterior' },
    { name: 'Extensiones', type: 'Aislamiento', muscles: 'Tríceps braquial — todas las cabezas' },
  ],
  abdomen: [
    { name: 'Crunch',                  type: 'Aislamiento', muscles: 'Recto abdominal' },
    { name: 'Elevaciones de piernas',  type: 'Aislamiento', muscles: 'Psoas, Recto abdominal inferior' },
  ],
  cuadriceps: [
    { name: 'Sentadilla', type: 'Compuesto', muscles: 'Cuádriceps, Glúteos, Isquiotibiales' },
    { name: 'Prensa',     type: 'Compuesto', muscles: 'Cuádriceps, Glúteos' },
  ],
  isquio: [
    { name: 'Peso muerto rumano', type: 'Compuesto',   muscles: 'Isquiotibiales, Glúteos, Erectores' },
    { name: 'Curl femoral',       type: 'Aislamiento', muscles: 'Isquiotibiales' },
  ],
  gluteos: [
    { name: 'Hip thrust',         type: 'Compuesto', muscles: 'Glúteo mayor, Isquiotibiales' },
    { name: 'Sentadilla búlgara', type: 'Compuesto', muscles: 'Glúteos, Cuádriceps' },
  ],
  gemelos: [
    { name: 'Elevaciones de gemelos', type: 'Aislamiento', muscles: 'Gastrocnemio, Sóleo' },
  ],
  antebrazos: [
    { name: 'Curl inverso',  type: 'Aislamiento', muscles: 'Braquiorradial, Extensores del antebrazo' },
    { name: 'Farmer walk',   type: 'Funcional',   muscles: 'Flexores del antebrazo, Agarre' },
  ],
};

// ── Sistema de prioridades ─────────────────────────────────────────────────────
const PRIO = {
  priority: { label: 'Prioridad', color: '#93C5FD', bg: 'rgba(59,130,246,0.18)', dot: '#3B82F6',               svgFill: 'rgba(59,130,246,0.55)'   },
  maintain: { label: 'Mantener',  color: '#FCD34D', bg: 'rgba(245,158,11,0.13)', dot: '#F59E0B',               svgFill: 'rgba(245,158,11,0.40)'   },
  reducir:  { label: 'Reducir',   color: 'rgba(232,237,248,0.30)', bg: 'rgba(255,255,255,0.03)', dot: 'rgba(255,255,255,0.22)', svgFill: 'rgba(255,255,255,0.04)' },
};

function nextPrio(cur) {
  if (!cur) return 'priority';
  if (cur === 'priority') return 'maintain';
  if (cur === 'maintain') return 'reducir';
  return null;
}

// ── Tipo de físico objetivo ────────────────────────────────────────────────────
function computePhysiqueType(priorities) {
  const prios = Object.keys(priorities).filter((m) => priorities[m] === 'priority');
  const upper = ['pecho','espalda','deltoides','biceps','triceps'].filter((m) => priorities[m] === 'priority');
  const lower = ['cuadriceps','isquio','gluteos','gemelos'].filter((m) => priorities[m] === 'priority');

  if (prios.length === 0) return { type: 'neutral', label: 'Sin definir', desc: 'Toca los músculos o el grid para comenzar a diseñar tu físico objetivo.' };

  if (upper.length >= 3 && lower.length === 0)
    return { type: 'vtaper', label: 'Físico orientado a V-Taper', desc: 'Hombros amplios, espalda densa, cintura estrecha. El canon estético clásico de la musculación.' };

  if (lower.length >= 3 && upper.length <= 1)
    return { type: 'lower', label: 'Tren inferior dominante', desc: 'Glúteos, piernas y potencia inferior. Perfil de atleta y sprinter.' };

  if (priorities['pecho'] === 'priority' && priorities['deltoides'] === 'priority' && priorities['triceps'] === 'priority')
    return { type: 'push', label: 'Push dominante', desc: 'Pecho, deltoides y tríceps como ejes. Estética de press y volumen anterior.' };

  if (priorities['espalda'] === 'priority' && priorities['biceps'] === 'priority')
    return { type: 'pull', label: 'Pull dominante', desc: 'Espalda y bíceps como base. Anchura dorsal, grosor y brazos funcionales.' };

  if (priorities['gluteos'] === 'priority' && priorities['cuadriceps'] === 'priority' && priorities['isquio'] === 'priority')
    return { type: 'legs', label: 'Piernas completas', desc: 'Los tres grupos del tren inferior como protagonistas. Piernas simétricas y equilibradas.' };

  if (prios.length >= 4 && upper.length >= 2 && lower.length >= 2)
    return { type: 'balanced', label: 'Físico equilibrado', desc: 'Desarrollo armónico de todos los grupos. Estética atlética y funcional por excelencia.' };

  return { type: 'custom', label: 'Físico personalizado', desc: 'Tu combinación única de prioridades. El entrenamiento reflejará exactamente lo que quieres construir.' };
}

// ── useWidth ──────────────────────────────────────────────────────────────────
function useWidth() {
  const [w, setW] = React.useState(window.innerWidth);
  React.useEffect(() => {
    const h = () => setW(window.innerWidth);
    window.addEventListener('resize', h);
    return () => window.removeEventListener('resize', h);
  }, []);
  return w;
}

// ── BodyMap SVG (11 grupos clicables) ─────────────────────────────────────────
function BodyMap({ view, selected, priorities, onPick }) {
  const [hov, setHov] = React.useState(null);

  function zone(id) {
    const sel  = selected === id;
    const hovr = hov === id;
    const p    = priorities[id] || null;
    const cfg  = p ? PRIO[p] : null;
    let fill, stroke, sw;
    if (sel)       { fill = '#3B82F6';           stroke = 'rgba(147,197,253,0.9)';  sw = 2;   }
    else if (cfg)  { fill = cfg.svgFill;          stroke = cfg.dot;                  sw = 1;   }
    else if (hovr) { fill = 'rgba(59,130,246,0.35)'; stroke = 'rgba(147,197,253,0.55)'; sw = 1.5; }
    else           { fill = 'rgba(255,255,255,0.07)'; stroke = 'rgba(255,255,255,0.14)'; sw = 0.5; }
    return {
      fill, stroke, strokeWidth: sw,
      style: { cursor: 'pointer', transition: 'fill .14s, stroke .14s' },
      onMouseEnter: () => setHov(id),
      onMouseLeave: () => setHov(null),
      onClick: () => onPick(id),
    };
  }

  const g  = { fill: 'rgba(255,255,255,0.05)', stroke: 'rgba(255,255,255,0.09)', strokeWidth: 0.5 };
  const lk = hov || selected;
  const lm = lk ? MUSCLES[lk] : null;

  return (
    <div>
      <svg viewBox="0 0 200 460"
        style={{ width: '100%', maxWidth: 260, display: 'block', margin: '0 auto' }}>

        {/* Esqueleto base */}
        <circle cx="100" cy="28" r="21" {...g} />
        <rect x="92" y="47" width="16" height="13" rx="4" {...g} />
        <path d="M62,60 L138,60 C141,92 142,136 136,166 L124,180 L76,180 L64,166 C58,136 59,92 62,60Z" {...g} />
        <ellipse cx="47"  cy="108" rx="11" ry="38" {...g} />
        <ellipse cx="153" cy="108" rx="11" ry="38" {...g} />
        <ellipse cx="40"  cy="162" rx="9"  ry="27" {...g} />
        <ellipse cx="160" cy="162" rx="9"  ry="27" {...g} />
        <ellipse cx="83"  cy="262" rx="20" ry="52" {...g} />
        <ellipse cx="117" cy="262" rx="20" ry="52" {...g} />
        <ellipse cx="83"  cy="367" rx="13" ry="33" {...g} />
        <ellipse cx="117" cy="367" rx="13" ry="33" {...g} />
        <ellipse cx="83"  cy="408" rx="14" ry="7"  {...g} />
        <ellipse cx="117" cy="408" rx="14" ry="7"  {...g} />

        {view === 'front' ? (
          <React.Fragment>
            <ellipse cx="51"  cy="74"  rx="14" ry="12" {...zone('deltoides')} />
            <ellipse cx="149" cy="74"  rx="14" ry="12" {...zone('deltoides')} />
            <path d="M72,68 C68,68 62,75 62,88 C62,100 70,107 82,107 L100,107 L100,68Z"       {...zone('pecho')} />
            <path d="M128,68 C132,68 138,75 138,88 C138,100 130,107 118,107 L100,107 L100,68Z" {...zone('pecho')} />
            <ellipse cx="47"  cy="110" rx="9"  ry="25" {...zone('biceps')} />
            <ellipse cx="153" cy="110" rx="9"  ry="25" {...zone('biceps')} />
            <ellipse cx="40"  cy="162" rx="8"  ry="25" {...zone('antebrazos')} />
            <ellipse cx="160" cy="162" rx="8"  ry="25" {...zone('antebrazos')} />
            <rect    x="79"   y="108"  width="42" height="56" rx="9" {...zone('abdomen')} />
            <ellipse cx="83"  cy="256" rx="17" ry="46" {...zone('cuadriceps')} />
            <ellipse cx="117" cy="256" rx="17" ry="46" {...zone('cuadriceps')} />
            <ellipse cx="83"  cy="367" rx="11" ry="29" {...zone('gemelos')} />
            <ellipse cx="117" cy="367" rx="11" ry="29" {...zone('gemelos')} />
          </React.Fragment>
        ) : (
          <React.Fragment>
            <ellipse cx="51"  cy="74"  rx="14" ry="12" {...zone('deltoides')} />
            <ellipse cx="149" cy="74"  rx="14" ry="12" {...zone('deltoides')} />
            <path d="M73,60 L100,68 L127,60 C120,55 80,55 73,60Z"                       {...zone('espalda')} />
            <path d="M100,68 C92,68 65,80 58,106 C54,120 60,145 76,148 L100,148Z"       {...zone('espalda')} />
            <path d="M100,68 C108,68 135,80 142,106 C146,120 140,145 124,148 L100,148Z" {...zone('espalda')} />
            <ellipse cx="47"  cy="110" rx="9"  ry="25" {...zone('triceps')} />
            <ellipse cx="153" cy="110" rx="9"  ry="25" {...zone('triceps')} />
            <ellipse cx="40"  cy="162" rx="8"  ry="25" {...zone('antebrazos')} />
            <ellipse cx="160" cy="162" rx="8"  ry="25" {...zone('antebrazos')} />
            <ellipse cx="83"  cy="206" rx="21" ry="27" {...zone('gluteos')} />
            <ellipse cx="117" cy="206" rx="21" ry="27" {...zone('gluteos')} />
            <ellipse cx="83"  cy="268" rx="16" ry="38" {...zone('isquio')} />
            <ellipse cx="117" cy="268" rx="16" ry="38" {...zone('isquio')} />
            <ellipse cx="83"  cy="367" rx="11" ry="29" {...zone('gemelos')} />
            <ellipse cx="117" cy="367" rx="11" ry="29" {...zone('gemelos')} />
          </React.Fragment>
        )}

        {lm && (
          <text x="100" y="448" textAnchor="middle"
            fill="rgba(232,237,248,0.55)" fontSize="10"
            fontFamily="Inter,system-ui" fontWeight="700" letterSpacing="1">
            {lm.label.toUpperCase()}
          </text>
        )}
      </svg>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px 10px', marginTop: 10, justifyContent: 'center' }}>
        {Object.keys(PRIO).map((k) => (
          <span key={k} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: PRIO[k].dot, display: 'inline-block' }} />
            <span style={{ fontFamily: 'Inter,system-ui', fontSize: 9, color: BD.muted }}>{PRIO[k].label}</span>
          </span>
        ))}
      </div>
    </div>
  );
}

// ── Grid de prioridades ────────────────────────────────────────────────────────
function PriorityGrid({ priorities, onCycle, selected }) {
  return (
    <div style={{ marginTop: 14 }}>
      <div style={{ fontFamily: 'ui-monospace,Menlo,monospace', fontSize: 9, fontWeight: 700,
        color: BD.muted, letterSpacing: 1, marginBottom: 8 }}>PERFIL MUSCULAR</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
        {Object.keys(MUSCLES).map((id) => {
          const def = MUSCLES[id];
          const p   = priorities[id] || null;
          const cfg = p ? PRIO[p] : null;
          const sel = selected === id;
          return (
            <button key={id} onClick={() => onCycle(id)}
              style={{ display: 'flex', alignItems: 'center', gap: 6,
                padding: '6px 8px', borderRadius: 8, cursor: 'pointer', textAlign: 'left',
                background: sel ? 'rgba(59,130,246,0.10)' : (cfg ? cfg.bg : 'rgba(255,255,255,0.02)'),
                border: '1px solid ' + (sel ? 'rgba(59,130,246,0.35)' : (p ? 'rgba(255,255,255,0.09)' : BD.border)),
                transition: 'all .12s' }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', flexShrink: 0,
                background: cfg ? cfg.dot : 'rgba(255,255,255,0.14)' }} />
              <div style={{ minWidth: 0 }}>
                <div style={{ fontFamily: 'Inter,system-ui', fontSize: 10, fontWeight: 700,
                  color: p ? BD.text : BD.muted,
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {def.short}
                </div>
                {cfg && (
                  <div style={{ fontFamily: 'ui-monospace,Menlo,monospace', fontSize: 8,
                    color: cfg.color, letterSpacing: 0.3, marginTop: 1 }}>{cfg.label}</div>
                )}
              </div>
            </button>
          );
        })}
      </div>
      <p style={{ fontFamily: 'Inter,system-ui', fontSize: 10, color: BD.muted,
        margin: '8px 0 0', lineHeight: 1.5 }}>
        Toca para asignar prioridad. Toca de nuevo para cambiarla.
      </p>
    </div>
  );
}

// ── Tarjeta de físico objetivo ─────────────────────────────────────────────────
function PhysiqueCard({ physiqueType }) {
  if (physiqueType.type === 'neutral') return null;
  return (
    <div style={{ padding: '14px 16px', borderRadius: 14, marginBottom: 18,
      background: 'rgba(59,130,246,0.07)', border: '1px solid rgba(59,130,246,0.18)' }}>
      <div style={{ fontFamily: 'ui-monospace,Menlo,monospace', fontSize: 9, fontWeight: 700,
        color: BD.muted, letterSpacing: 1, marginBottom: 6 }}>FÍSICO OBJETIVO</div>
      <div style={{ fontFamily: '"Instrument Serif",serif', fontStyle: 'italic',
        fontSize: 18, color: BD.text, lineHeight: 1.25, marginBottom: 6 }}>
        {physiqueType.label}
      </div>
      <div style={{ fontFamily: 'Inter,system-ui', fontSize: 11, color: BD.sub, lineHeight: 1.55 }}>
        {physiqueType.desc}
      </div>
    </div>
  );
}

// ── Panel científico MEV/MAV/MRV ──────────────────────────────────────────────
function SciencePanel({ muscleId }) {
  const s = SCIENCE[muscleId];
  if (!s) return null;
  const max  = s.mrv || 1;
  const bars = [
    { key: 'MEV', val: s.mev, color: '#22C55E', desc: 'Mínimo efectivo' },
    { key: 'MAV', val: s.mav, color: '#3B82F6', desc: 'Máximo adaptativo' },
    { key: 'MRV', val: s.mrv, color: '#F59E0B', desc: 'Máximo recuperable' },
  ];
  return (
    <div style={{ padding: '14px 14px', borderRadius: 14, background: BD.card,
      border: '1px solid ' + BD.border, marginBottom: 16 }}>
      <div style={{ fontFamily: 'ui-monospace,Menlo,monospace', fontSize: 9, fontWeight: 700,
        color: BD.muted, letterSpacing: 1, marginBottom: 12 }}>VOLUMEN SEMANAL · SERIES</div>
      {bars.map((b) => (
        <div key={b.key} style={{ marginBottom: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
            <span style={{ fontFamily: 'ui-monospace,Menlo,monospace', fontSize: 10,
              fontWeight: 700, color: b.color }}>{b.key}</span>
            <span style={{ fontFamily: 'ui-monospace,Menlo,monospace', fontSize: 10,
              color: BD.sub }}>{b.val} series/sem</span>
          </div>
          <div style={{ height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.06)' }}>
            <div style={{ height: '100%', borderRadius: 2,
              width: Math.round(b.val / max * 100) + '%',
              background: b.color, opacity: 0.75 }} />
          </div>
          <div style={{ fontFamily: 'Inter,system-ui', fontSize: 9, color: BD.muted, marginTop: 2 }}>
            {b.desc}
          </div>
        </div>
      ))}
      <div style={{ fontFamily: 'Inter,system-ui', fontSize: 9, color: BD.muted,
        marginTop: 8, paddingTop: 8, borderTop: '1px solid ' + BD.border, lineHeight: 1.5 }}>
        Basado en Israetel &amp; Schoenfeld — "Scientific Principles of Hypertrophy Training"
      </div>
    </div>
  );
}

// ── Lista de ejercicios ────────────────────────────────────────────────────────
function ExerciseList({ muscleId }) {
  const list = EXERCISES[muscleId] || [];
  if (list.length === 0) return null;
  return (
    <div>
      <div style={{ fontFamily: 'ui-monospace,Menlo,monospace', fontSize: 9, fontWeight: 700,
        color: BD.muted, letterSpacing: 1, marginBottom: 8 }}>EJERCICIOS CLAVE</div>
      {list.map((ex, i) => (
        <div key={i} style={{ padding: '10px 12px', borderRadius: 10,
          background: BD.card, border: '1px solid ' + BD.border, marginBottom: 6 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 3 }}>
            <span style={{ fontFamily: 'Inter,system-ui', fontSize: 12, fontWeight: 700, color: BD.text }}>
              {ex.name}
            </span>
            <span style={{ fontFamily: 'ui-monospace,Menlo,monospace', fontSize: 9,
              color: ex.type === 'Compuesto' ? BD.blue : (ex.type === 'Funcional' ? BD.green : BD.amber),
              background: ex.type === 'Compuesto' ? BD.blueDim : (ex.type === 'Funcional' ? 'rgba(34,197,94,0.12)' : 'rgba(245,158,11,0.13)'),
              padding: '2px 6px', borderRadius: 4, whiteSpace: 'nowrap' }}>
              {ex.type}
            </span>
          </div>
          <div style={{ fontFamily: 'Inter,system-ui', fontSize: 10, color: BD.muted }}>
            {ex.muscles}
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Detalle de músculo seleccionado ───────────────────────────────────────────
function MuscleDetail({ muscleId, priorities, onCycle }) {
  const def = MUSCLES[muscleId] || {};
  const p   = priorities[muscleId] || null;
  const cfg = p ? PRIO[p] : null;
  return (
    <div style={{ animation: 'fadeIn .2s ease' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
        <h2 style={{ fontFamily: 'Inter,system-ui', fontSize: 34, fontWeight: 900,
          color: BD.text, margin: 0, letterSpacing: -2, lineHeight: 1 }}>
          {def.label}
        </h2>
        <button onClick={() => onCycle(muscleId)}
          style={{ padding: '8px 14px', borderRadius: 10, border: 'none', cursor: 'pointer',
            background: cfg ? cfg.bg : 'rgba(255,255,255,0.05)',
            color: cfg ? cfg.color : BD.muted,
            fontFamily: 'Inter,system-ui', fontSize: 11, fontWeight: 700,
            transition: 'all .14s', whiteSpace: 'nowrap' }}>
          {cfg ? ('● ' + cfg.label) : '○ Sin prioridad'}
        </button>
      </div>
      <SciencePanel muscleId={muscleId} />
      <ExerciseList muscleId={muscleId} />
    </div>
  );
}

// ── Estado vacío / resumen de físico ──────────────────────────────────────────
function EmptyState({ priorities, physiqueType, onPick }) {
  const total = Object.keys(priorities).filter((m) => priorities[m]).length;
  return (
    <div>
      <div style={{ fontFamily: '"Instrument Serif",serif', fontStyle: 'italic',
        fontSize: 26, color: BD.sub, marginBottom: 10, lineHeight: 1.2 }}>
        {total === 0 ? 'Diseña tu físico.' : 'Tu físico objetivo.'}
      </div>
      <p style={{ fontFamily: 'Inter,system-ui', fontSize: 13, color: BD.muted,
        lineHeight: 1.65, margin: '0 0 18px', maxWidth: 320 }}>
        {total === 0
          ? 'Selecciona un músculo en el mapa o toca el grid para asignar prioridades.'
          : 'Sigue configurando tu perfil muscular.'}
      </p>
      <PhysiqueCard physiqueType={physiqueType} />
      <div style={{ fontFamily: 'ui-monospace,Menlo,monospace', fontSize: 9, fontWeight: 700,
        color: BD.muted, letterSpacing: 1, marginBottom: 8 }}>GRUPOS MUSCULARES</div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {Object.keys(MUSCLES).map((id) => {
          const def = MUSCLES[id];
          const p   = priorities[id] || null;
          const cfg = p ? PRIO[p] : null;
          return (
            <button key={id} onClick={() => onPick(id)}
              style={{ padding: '6px 12px', borderRadius: 999,
                background: cfg ? cfg.bg : 'rgba(255,255,255,0.04)',
                border: '1px solid ' + (p ? cfg.dot : BD.border),
                fontFamily: 'Inter,system-ui', fontSize: 11, fontWeight: 600,
                color: p ? cfg.color : BD.muted,
                cursor: 'pointer', transition: 'all .12s' }}>
              {def.short}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── BuilderSection ─────────────────────────────────────────────────────────────
function BuilderSection() {
  const mobile = useWidth() < 680;

  const [view,       setView]       = React.useState('front');
  const [selected,   setSelected]   = React.useState(null);
  const [priorities, setPriorities] = React.useState(() => {
    try {
      const raw  = localStorage.getItem('atlas.builder.v1');
      const data = raw ? JSON.parse(raw) : null;
      return (data && data.priorities && typeof data.priorities === 'object') ? data.priorities : {};
    } catch (e) { return {}; }
  });

  const physiqueType = React.useMemo(() => computePhysiqueType(priorities), [priorities]);

  React.useEffect(() => {
    try {
      localStorage.setItem('atlas.builder.v1', JSON.stringify({ priorities: priorities, lastUpdated: Date.now() }));
    } catch (e) {}
    window.atlasBuilderState = {
      priorities:      priorities,
      physiqueType:    physiqueType.type,
      physiqueLabel:   physiqueType.label,
      selectedMuscle:  selected,
      generatedSummary: physiqueType.desc,
    };
  }, [priorities, selected]);

  function handleCyclePrio(id) {
    const cur     = priorities[id] || null;
    const next    = nextPrio(cur);
    const updated = Object.assign({}, priorities);
    if (next === null) { delete updated[id]; } else { updated[id] = next; }
    setPriorities(updated);
    setSelected(id);
    const def = MUSCLES[id];
    if (def && def.view !== 'both') setView(def.view);
  }

  function handlePickMuscle(id) {
    setSelected(id);
    const def = MUSCLES[id];
    if (def && def.view !== 'both') setView(def.view);
  }

  return (
    <section style={{ minHeight: '100vh', background: BD.page }}>
      <div style={{ maxWidth: 1060, margin: '0 auto',
        padding: mobile ? '48px 16px 80px' : '64px 28px 80px' }}>

        <div style={{ marginBottom: mobile ? 28 : 40 }}>
          <h1 style={{ fontFamily: 'Inter,system-ui', fontWeight: 900,
            fontSize: mobile ? 30 : 44, color: BD.text, letterSpacing: -2,
            lineHeight: 1, margin: '0 0 8px' }}>
            Tu físico objetivo.{' '}
            <span style={{ fontFamily: '"Instrument Serif",serif', fontStyle: 'italic',
              fontWeight: 400, color: BD.sub, letterSpacing: -1 }}>
              Diseñado por ti.
            </span>
          </h1>
          {physiqueType.type !== 'neutral' && (
            <div style={{ fontFamily: 'Inter,system-ui', fontSize: 13,
              color: BD.blue, fontWeight: 600, marginTop: 6 }}>
              {physiqueType.label}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: mobile ? 0 : 48,
          alignItems: 'flex-start', flexDirection: mobile ? 'column' : 'row' }}>

          {/* IZQUIERDA */}
          <div style={{ width: mobile ? '100%' : 280, flexShrink: 0, marginBottom: mobile ? 32 : 0 }}>

            <div style={{ display: 'flex', gap: 3, marginBottom: 14,
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
              <BodyMap
                view={view}
                selected={selected}
                priorities={priorities}
                onPick={handlePickMuscle}
              />
            </div>

            <PriorityGrid
              priorities={priorities}
              onCycle={handleCyclePrio}
              selected={selected}
            />
          </div>

          {/* DERECHA */}
          <div style={{ flex: 1, minWidth: 0,
            width: mobile ? '100%' : undefined,
            maxHeight: mobile ? 'none' : 700,
            overflowY: mobile ? 'visible' : 'auto' }}>
            {selected ? (
              <MuscleDetail
                key={selected}
                muscleId={selected}
                priorities={priorities}
                onCycle={handleCyclePrio}
              />
            ) : (
              <EmptyState
                priorities={priorities}
                physiqueType={physiqueType}
                onPick={handlePickMuscle}
              />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

Object.assign(window, { BuilderSection });
