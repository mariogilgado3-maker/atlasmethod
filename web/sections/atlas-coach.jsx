// Atlas Coach — premium training intelligence dashboard

// ── Protocol engine ───────────────────────────────────────────────────────────

function acGenerateProtocol(objetivo, nivel, dias, tiempo) {
  const splitNames = {
    2: 'Full Body', 3: nivel === 'principiante' ? 'Full Body 3×' : 'Push / Pull / Legs',
    4: 'Upper / Lower', 5: nivel === 'avanzado' ? 'PPL + Upper/Lower' : 'Upper/Lower + Full',
    6: 'Push / Pull / Legs A/B',
  };
  const schedules = {
    2: { days: ['L','M','X','J','V','S','D'], sessions: [0,null,null,1,null,null,null], labels: ['Full A','Full B'] },
    3: { days: ['L','M','X','J','V','S','D'], sessions: [0,null,1,null,2,null,null], labels: nivel==='principiante'?['Full A','Full B','Full C']:['Push','Pull','Legs'] },
    4: { days: ['L','M','X','J','V','S','D'], sessions: [0,1,null,2,3,null,null], labels: ['Upper A','Lower A','Upper B','Lower B'] },
    5: { days: ['L','M','X','J','V','S','D'], sessions: [0,1,2,null,3,4,null], labels: nivel==='avanzado'?['Push','Pull','Legs','Upper','Lower']:['Upper A','Lower A','Full','Upper B','Lower B'] },
    6: { days: ['L','M','X','J','V','S','D'], sessions: [0,1,2,3,4,5,null], labels: ['Push A','Pull A','Legs A','Push B','Pull B','Legs B'] },
  };
  const volGuides = {
    hipertrofia: { pecho:'12–20s/sem', espalda:'14–22s/sem', hombro:'10–16s/sem', bíceps:'10–14s/sem', tríceps:'10–14s/sem', pierna:'16–20s/sem' },
    fuerza:      { pecho:'8–12s/sem',  espalda:'10–14s/sem', hombro:'6–10s/sem',  bíceps:'6–8s/sem',   tríceps:'6–8s/sem',   pierna:'10–14s/sem' },
    recomp:      { pecho:'10–16s/sem', espalda:'12–18s/sem', hombro:'8–12s/sem',  bíceps:'8–12s/sem',  tríceps:'8–12s/sem',  pierna:'14–18s/sem' },
    rendimiento: { pecho:'8–12s/sem',  espalda:'10–14s/sem', hombro:'8–10s/sem',  bíceps:'6–8s/sem',   tríceps:'6–8s/sem',   pierna:'12–16s/sem' },
  };
  const intensSchemes = {
    hipertrofia: { rir:'RIR 1–2', rm:'65–80% 1RM', reps:'8–15', rest:'90–120s' },
    fuerza:      { rir:'RIR 0–1', rm:'80–93% 1RM', reps:'3–6',  rest:'3–5 min' },
    recomp:      { rir:'RIR 1–3', rm:'65–85% 1RM', reps:'8–12', rest:'60–90s' },
    rendimiento: { rir:'RIR 0–2', rm:'75–90% 1RM', reps:'4–8',  rest:'2–4 min' },
  };
  const progModels = {
    hipertrofia: { principiante:'Progresión lineal', intermedio:'Ondulante (DUP)', avanzado:'Periodización por bloques' },
    fuerza:      { principiante:'Progresión lineal', intermedio:'Texas Method', avanzado:'Periodzación conjugada' },
    recomp:      { principiante:'Progresión lineal', intermedio:'Ondulante', avanzado:'Ondulante avanzada' },
    rendimiento: { principiante:'Progresión lineal', intermedio:'Clásica', avanzado:'Compleja' },
  };
  const justifications = {
    hipertrofia: 'La hipertrofia se maximiza con volumen entre MEV y MRV, frecuencia 2× por grupo y RIR 1–2. El volumen es la variable con mayor impacto a largo plazo (Schoenfeld, 2016). Los ejercicios compuestos garantizan eficiencia multiarticular.',
    fuerza: 'La fuerza máxima requiere cargas ≥80% 1RM, baja cantidad de repeticiones y recuperaciones largas. La activación de unidades motoras de alto umbral es el estímulo clave (Kraemer & Ratamess, 2004).',
    recomp: 'La recomposición simultánea requiere déficit calórico moderado (200–300 kcal/día), alta ingesta proteica (2.0–2.4 g/kg) y entrenamiento de fuerza con volumen moderado-alto.',
    rendimiento: 'El entrenamiento de rendimiento combina fuerza máxima, potencia y capacidad. La periodización busca picos de forma mediante fases de carga, intensificación y tapering.',
  };
  return {
    splitName: splitNames[dias] || 'Full Body',
    schedule: schedules[dias] || schedules[3],
    volumeGuide: volGuides[objetivo] || volGuides.hipertrofia,
    intensityScheme: intensSchemes[objetivo] || intensSchemes.hipertrofia,
    progressionModel: (progModels[objetivo] || progModels.hipertrofia)[nivel] || 'Lineal',
    justification: justifications[objetivo] || justifications.hipertrofia,
    mesocycle: [
      { week:1, phase:'Acumulación',     vol:100, rir:'2',   note:'Adaptación al volumen' },
      { week:2, phase:'Acumulación',     vol:115, rir:'1.5', note:'+15% series vs semana 1' },
      { week:3, phase:'Intensificación', vol:90,  rir:'0.5', note:'Reducir vol, subir intensidad' },
      { week:4, phase:'Deload',          vol:60,  rir:'3',   note:'Recuperación activa' },
    ],
  };
}

// ── Insight engine ────────────────────────────────────────────────────────────

function acGenerateInsights(objetivo, nivel, dias, tiempo, sessions) {
  const out = [];

  // Frequency
  out.push({
    id: 'freq', status: dias >= 3 ? 'good' : 'info', icon: '↻',
    title: dias >= 3 ? `Frecuencia 2× posible (${dias}d/sem)` : `Frecuencia 1×/grupo (${dias}d/sem)`,
    metric: `${dias}d/sem`,
    body: dias >= 3
      ? `Con ${dias} días/semana puedes entrenar cada grupo muscular 2 veces. La doble frecuencia produce 6–22% más hipertrofia que la simple.`
      : `2 días permiten entrenar cada grupo 1 vez/semana. Suficiente para principiantes; la frecuencia 2× produce mejores resultados.`,
    ref: 'Schoenfeld et al., 2016',
    action: dias < 3 ? 'Considera aumentar a 3+ días si la recuperación lo permite.' : null,
  });

  // Volume
  const volOk = dias >= 3;
  out.push({
    id: 'vol', status: volOk ? 'good' : 'info', icon: '≡',
    title: objetivo === 'hipertrofia' ? 'Volumen en rango MEV–MRV' : 'Volumen ajustado al objetivo',
    metric: objetivo === 'hipertrofia' ? (nivel==='principiante'?'10–14s':'nivel === intermedio'?'12–18s':'16–22s') : 'Ver guía',
    body: objetivo === 'hipertrofia'
      ? `Para ${nivel}, el volumen óptimo se sitúa entre el MEV y el MRV. Prioriza la consistencia sobre el volumen máximo: el exceso sin recuperación adecuada interfiere en la adaptación.`
      : objetivo === 'fuerza'
        ? 'Menor volumen total, mayor especificidad de carga (>80% 1RM). La calidad de cada serie importa más que la cantidad.'
        : 'Volumen moderado-alto para preservar músculo en déficit. Prioriza ejercicios compuestos y mantén ingesta proteica ≥2.0 g/kg.',
    ref: 'Israetel et al., 2021',
    action: null,
  });

  // Intensity / RIR
  const rirMap = { hipertrofia:'RIR 1–2', fuerza:'RIR 0–1', recomp:'RIR 1–3', rendimiento:'RIR 0–2' };
  const rir = rirMap[objetivo] || 'RIR 1–2';
  out.push({
    id: 'rir', status: 'info', icon: '⚡',
    title: `Intensidad objetivo: ${rir}`,
    metric: rir,
    body: objetivo === 'hipertrofia'
      ? `Llevar las series a ${rir} produce el mismo estímulo hipertrófico que el fallo con menor fatiga acumulada. El RIR > 4 reduce drásticamente la señal anabólica en intermedios y avanzados.`
      : objetivo === 'fuerza'
        ? `Las series pesadas requieren ${rir} en intensificación. El reclutamiento de unidades motoras de alto umbral es el estímulo clave para la adaptación neural.`
        : `El ${rir} permite ajustar la intensidad según la fatiga diaria — especialmente útil en déficit calórico donde la recuperación es variable.`,
    ref: 'Helms et al., 2016',
    action: `Lleva las últimas 1–2 series de cada ejercicio principal a ${rir}.`,
  });

  // Progression
  const progLabels = { hipertrofia:{principiante:'lineal',intermedio:'ondulante (DUP)',avanzado:'bloques'}, fuerza:{principiante:'lineal',intermedio:'Texas Method',avanzado:'conjugada'}, recomp:{principiante:'lineal',intermedio:'ondulante',avanzado:'ondulante avanzada'}, rendimiento:{principiante:'lineal',intermedio:'clásica',avanzado:'compleja'} };
  const progLabel = (progLabels[objetivo]||progLabels.hipertrofia)[nivel] || 'lineal';
  out.push({
    id: 'prog', status: 'info', icon: '↗',
    title: `Progresión ${progLabel}`,
    metric: { principiante:'Lineal', intermedio:'DUP', avanzado:'Bloques' }[nivel],
    body: nivel === 'principiante'
      ? 'Añade carga cada sesión. Tu SNC se adapta rápido y permite progreso constante durante 3–6 meses sin periodización compleja.'
      : nivel === 'intermedio'
        ? 'La periodización ondulante diaria (DUP) alterna volumen e intensidad en la misma semana, evitando el estancamiento propio de la progresión lineal en intermedios.'
        : 'Los bloques de acumulación → intensificación → realización maximizan adaptaciones en cada cualidad con mayor complejidad de gestión.',
    ref: nivel==='principiante' ? 'Rippetoe, Starting Strength' : 'Zourdos et al., 2016',
    action: null,
  });

  // Recovery
  const rest = 7 - dias;
  out.push({
    id: 'rec', status: rest >= 2 ? 'good' : 'warning', icon: '○',
    title: rest >= 2 ? `${rest} días de recuperación semanal` : 'Recuperación ajustada — monitorea',
    metric: `${rest}d/sem`,
    body: rest >= 2
      ? `La supercompensación ocurre en la recuperación, no en el entrenamiento. Con ${rest} días de descanso, el organismo repara y supracompensa. Sueño (7–9h) e ingesta proteica en esos días son determinantes.`
      : `Con ${dias} días/semana la gestión de fatiga es crítica. Monitorea el rendimiento semana a semana y programa un deload obligatorio cada 3–4 semanas.`,
    ref: 'Halson, 2014',
    action: rest < 2 ? 'Deload cada 3–4 semanas sin excepción.' : null,
  });

  // Session-based insights
  if (sessions && sessions.length > 0) {
    const recent = sessions.slice(-5);
    const tally = {};
    recent.forEach(s => {
      (s.exercises || []).forEach(ex => {
        (ex.muscles || []).forEach(m => {
          const k = m.toLowerCase();
          tally[k] = (tally[k] || 0) + (ex.sets ? ex.sets.length : 1);
        });
      });
    });
    const pushVol = ['pectoral','pectoral mayor','pectoral superior','pectoral inferior','deltoides ant','deltoides anterior','tríceps','triceps braquial'].reduce((s,k)=>s+(tally[k]||0),0);
    const pullVol = ['dorsal ancho','romboides','bíceps','biceps','bíceps braquial','braquial','deltoides post','deltoides posterior','trapecio'].reduce((s,k)=>s+(tally[k]||0),0);

    if (pushVol > pullVol * 1.4 && pushVol > 0) {
      out.push({
        id: 'balance', status: 'warning', icon: '⊘',
        title: 'Desequilibrio push/pull detectado',
        metric: `${pushVol}p / ${pullVol}t`,
        body: `Tus últimas ${recent.length} sesiones muestran más volumen de empuje que de tracción. El ratio recomendado es 1:1 o 1:1.2 a favor de tracción. El desequilibrio eleva el riesgo de pinzamiento subacromial.`,
        ref: 'Comerford & Mottram, 2012',
        action: 'Añade remo, face pull o dominadas en tu próxima sesión.',
      });
    } else if (pushVol > 0 || pullVol > 0) {
      out.push({
        id: 'balance', status: 'good', icon: '⊕',
        title: 'Balance push/pull correcto',
        metric: 'Equilibrado',
        body: `Tu historial reciente muestra un ratio push/pull adecuado. Mantenerlo protege los hombros y garantiza desarrollo simétrico.`,
        ref: null, action: null,
      });
    }

    const hasCore = recent.some(s => (s.exercises||[]).some(ex => (ex.muscles||[]).some(m => /core|abdominal|oblicu|transverso/.test(m.toLowerCase()))));
    if (!hasCore) {
      out.push({
        id: 'core', status: 'warning', icon: '◎',
        title: 'Sin core en sesiones recientes',
        metric: '0 sesiones',
        body: 'El core transfiere fuerza entre tren superior e inferior. Su déficit compromete eficiencia en sentadilla, peso muerto y press, y duplica el riesgo de lumbalgia.',
        ref: 'McGill, 2010',
        action: 'Incluye 2–3 series de plancha, Pallof press o dead bug en tu próxima sesión.',
      });
    }
  }

  return out.slice(0, 8);
}

// ── Design tokens ─────────────────────────────────────────────────────────────

const AC = {
  good:    { bg:'rgba(31,139,58,0.06)',   border:'rgba(31,139,58,0.16)',   accent:'#1F8B3A',  light:'rgba(31,139,58,0.08)',  label:'OK' },
  info:    { bg:'rgba(42,111,219,0.05)',  border:'rgba(42,111,219,0.14)',  accent:'#2A6FDB',  light:'rgba(42,111,219,0.06)', label:'INFO' },
  warning: { bg:'rgba(217,119,6,0.06)',   border:'rgba(217,119,6,0.18)',   accent:'#D97706',  light:'rgba(217,119,6,0.08)',  label:'AVISO' },
};

// ── UI primitives ─────────────────────────────────────────────────────────────

function AcPill({ label, active, onClick }) {
  return (
    <button onClick={onClick} style={{
      padding: '7px 14px', borderRadius: 999, cursor: 'pointer',
      border: active ? '1.5px solid #0F1A2E' : '1px solid rgba(15,26,46,0.12)',
      background: active ? '#0F1A2E' : '#FFFFFF',
      color: active ? '#FAFAF7' : '#3A4257',
      fontFamily: '"Inter",system-ui', fontSize: 12, fontWeight: active ? 700 : 500,
      transition: 'all 0.13s', whiteSpace: 'nowrap',
    }}>
      {label}
    </button>
  );
}

function AcStatCard({ label, value, sub, status }) {
  const c = status ? AC[status] : null;
  return (
    <div style={{
      padding: '18px 20px', borderRadius: 18,
      background: c ? c.bg : '#FAFAF7',
      border: `1px solid ${c ? c.border : 'rgba(15,26,46,0.07)'}`,
      display: 'flex', flexDirection: 'column', gap: 4,
    }}>
      <div style={{ fontFamily: 'ui-monospace,Menlo,monospace', fontSize: 9, fontWeight: 700, color: c ? c.accent : '#9498A4', letterSpacing: 0.8, textTransform: 'uppercase' }}>{label}</div>
      <div style={{ fontFamily: '"Inter",system-ui', fontSize: 26, fontWeight: 800, color: c ? c.accent : '#0F1A2E', lineHeight: 1.1, letterSpacing: -1 }}>{value}</div>
      {sub && <div style={{ fontFamily: '"Inter",system-ui', fontSize: 11, color: '#9498A4' }}>{sub}</div>}
    </div>
  );
}

function AcInsightCard({ insight }) {
  const c = AC[insight.status] || AC.info;
  return (
    <div style={{
      padding: '16px', borderRadius: 16,
      background: c.bg, border: `1px solid ${c.border}`,
      display: 'flex', flexDirection: 'column', gap: 10,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{
          width: 30, height: 30, borderRadius: 9, flexShrink: 0,
          background: 'rgba(255,255,255,0.6)', border: `1px solid ${c.border}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'ui-monospace,Menlo,monospace', fontSize: 14, color: c.accent, fontWeight: 700,
        }}>{insight.icon}</span>
        <span style={{ fontFamily: '"Inter",system-ui', fontSize: 13, fontWeight: 700, color: '#0F1A2E', flex: 1, lineHeight: 1.2 }}>{insight.title}</span>
        <span style={{
          padding: '2px 7px', borderRadius: 999, flexShrink: 0,
          background: 'rgba(255,255,255,0.6)', border: `1px solid ${c.border}`,
          fontFamily: 'ui-monospace,Menlo,monospace', fontSize: 8, color: c.accent, fontWeight: 700, letterSpacing: 0.4,
        }}>{c.label}</span>
      </div>

      <p style={{ fontFamily: '"Inter",system-ui', fontSize: 12, color: '#3A4257', lineHeight: 1.6, margin: 0 }}>
        {insight.body}
      </p>

      {insight.ref && (
        <div style={{ fontFamily: 'ui-monospace,Menlo,monospace', fontSize: 9, color: '#9498A4' }}>
          ↗ {insight.ref}
        </div>
      )}

      {insight.action && (
        <div style={{
          padding: '8px 12px', borderRadius: 10,
          background: 'rgba(255,255,255,0.5)', border: `1px solid ${c.border}`,
          fontFamily: '"Inter",system-ui', fontSize: 11, fontWeight: 600, color: c.accent, lineHeight: 1.4,
        }}>
          → {insight.action}
        </div>
      )}
    </div>
  );
}

function AcVolumeBar({ label, sets, max, color }) {
  const pct = max > 0 ? (sets / max) * 100 : 0;
  const warn = sets === 0;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 7 }}>
      <span style={{ fontFamily: '"Inter",system-ui', fontSize: 11, fontWeight: 600, color: '#3A4257', width: 72, flexShrink: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textTransform: 'capitalize' }}>{label}</span>
      <div style={{ flex: 1, height: 7, borderRadius: 999, background: 'rgba(15,26,46,0.07)', overflow: 'hidden' }}>
        <div style={{ height: '100%', borderRadius: 999, background: warn ? 'rgba(217,119,6,0.3)' : (color || '#0F1A2E'), width: `${pct}%`, transition: 'width 0.4s ease', minWidth: pct > 0 ? 6 : 0 }} />
      </div>
      <span style={{ fontFamily: 'ui-monospace,Menlo,monospace', fontSize: 9, color: warn ? '#D97706' : '#9498A4', width: 22, textAlign: 'right', flexShrink: 0 }}>{sets > 0 ? `${sets}s` : '—'}</span>
    </div>
  );
}

// ── Session exercise panel ────────────────────────────────────────────────────

function AcSessionPanel({ sessionLabel, objetivo, nivel, tiempo }) {
  const [open, setOpen] = React.useState(false);
  const exercises = React.useMemo(
    () => ExerciseService.selectForSession(sessionLabel, objetivo, nivel, tiempo),
    [sessionLabel, objetivo, nivel, tiempo]
  );
  return (
    <div style={{ borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(15,26,46,0.07)', background: '#FAFAF7' }}>
      <button onClick={() => setOpen(o => !o)} style={{ width: '100%', padding: '11px 14px', border: 'none', cursor: 'pointer', background: 'transparent', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontFamily: '"Inter",system-ui', fontSize: 12, fontWeight: 700, color: '#0F1A2E' }}>{sessionLabel}</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontFamily: 'ui-monospace,Menlo,monospace', fontSize: 10, color: '#9498A4' }}>{exercises.length} ejercicios</span>
          <span style={{ fontSize: 11, color: '#9498A4', transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', display: 'inline-block' }}>↓</span>
        </div>
      </button>
      {open && (
        <div style={{ padding: '0 12px 12px', display: 'flex', flexDirection: 'column', gap: 5 }}>
          {exercises.map(ex => {
            const patMeta = ExerciseService.META.PATTERN_META[ex.pattern] || {};
            const eqMeta = ExerciseService.META.EQUIPMENT_META[ex.equipment] || {};
            return (
              <div key={ex.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', borderRadius: 10, background: '#FFFFFF', border: '1px solid rgba(15,26,46,0.06)' }}>
                <div style={{ width: 3, height: 30, borderRadius: 999, background: patMeta.color || '#5C6477', flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: '"Inter",system-ui', fontSize: 11, fontWeight: 700, color: '#0F1A2E', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ex.name}</div>
                  <div style={{ fontFamily: '"Inter",system-ui', fontSize: 10, color: '#9498A4', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ex.muscles.primary.join(' · ')}</div>
                </div>
                <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 999, background: eqMeta.bg || 'rgba(15,26,46,0.06)', color: eqMeta.color || '#5C6477', fontFamily: '"Inter",system-ui', flexShrink: 0 }}>{eqMeta.label || ex.equipment}</span>
                <div style={{ display: 'flex', gap: 2, flexShrink: 0 }}>
                  {[1,2,3,4,5].map(i => <div key={i} style={{ width: 5, height: 5, borderRadius: '50%', background: i <= ex.fatigueLoad ? '#C24545' : 'rgba(15,26,46,0.08)' }} />)}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

function AtlasCoachSection() {
  const { actions, state } = useStore();
  const [objetivo, setObjetivo] = React.useState('hipertrofia');
  const [nivel, setNivel] = React.useState('intermedio');
  const [dias, setDias] = React.useState(4);
  const [tiempo, setTiempo] = React.useState(60);
  const [saved, setSaved] = React.useState(false);
  const [gemFlash, setGemFlash] = React.useState(false);

  const sessions = state.sessions || [];
  const protocol = React.useMemo(() => acGenerateProtocol(objetivo, nivel, dias, tiempo), [objetivo, nivel, dias, tiempo]);
  const insights = React.useMemo(() => acGenerateInsights(objetivo, nivel, dias, tiempo, sessions), [objetivo, nivel, dias, tiempo, sessions]);
  const sessionLabels = React.useMemo(() => [...new Set(protocol.schedule.labels)], [protocol]);

  // Volume analysis from Builder history
  const muscleVolume = React.useMemo(() => {
    const vol = {};
    sessions.slice(-10).forEach(s => {
      (s.exercises || []).forEach(ex => {
        (ex.muscles || []).forEach(m => {
          const k = m.toLowerCase();
          vol[k] = (vol[k] || 0) + (ex.sets ? ex.sets.length : 1);
        });
      });
    });
    return vol;
  }, [sessions]);

  const muscleVolumeEntries = React.useMemo(() => {
    return Object.entries(muscleVolume).sort((a, b) => b[1] - a[1]).slice(0, 10);
  }, [muscleVolume]);

  const maxVol = muscleVolumeEntries.length > 0 ? muscleVolumeEntries[0][1] : 1;

  // Balance
  const { push: pushVol, pull: pullVol } = React.useMemo(() => {
    if (sessions.length === 0) return { push: 0, pull: 0 };
    return ExerciseService.computeBalance(
      sessions.slice(-10).flatMap(s => s.exercises || [])
    );
  }, [sessions]);

  const balanceStatus = sessions.length === 0 ? null : Math.abs(pushVol - pullVol) <= 1 ? 'good' : 'warning';

  const handleSave = () => {
    actions.saveProtocol({ objetivo, nivel, dias, tiempo, ...protocol, savedAt: Date.now() });
    setSaved(true); setGemFlash(true);
    setTimeout(() => setGemFlash(false), 2500);
    setTimeout(() => setSaved(false), 4000);
  };

  const OBJETIVOS = [['hipertrofia','Hipertrofia'],['fuerza','Fuerza'],['recomp','Recomp.'],['rendimiento','Rendimiento']];
  const NIVELES = [['principiante','Principiante'],['intermedio','Intermedio'],['avanzado','Avanzado']];

  return (
    <section style={{ padding: '100px 32px 80px', minHeight: '100vh', background: '#FAFAF7' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>

        {gemFlash && (
          <div style={{ position: 'fixed', top: 80, right: 32, zIndex: 200, background: '#0F1A2E', color: '#FAFAF7', padding: '10px 20px', borderRadius: 999, fontFamily: '"Inter",system-ui', fontSize: 14, fontWeight: 700, animation: 'fadeIn 0.3s ease', boxShadow: '0 8px 32px rgba(15,26,46,0.25)' }}>
            💎 +25 gemas · Protocolo guardado
          </div>
        )}

        {/* ── Page header ─────────────────────────────────────────── */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <span style={{ fontFamily: '"Inter",system-ui', fontSize: 11, fontWeight: 700, letterSpacing: 1.8, textTransform: 'uppercase', color: '#5C6477' }}>Atlas Coach</span>
            <span style={{ padding: '3px 9px', borderRadius: 999, background: 'rgba(42,111,219,0.08)', border: '1px solid rgba(42,111,219,0.16)', fontFamily: '"Inter",system-ui', fontSize: 9, fontWeight: 700, color: '#2A6FDB', letterSpacing: 0.4 }}>BASADO EN EVIDENCIA</span>
          </div>
          <h1 style={{ fontFamily: '"Inter",system-ui', fontSize: 44, fontWeight: 700, color: '#0F1A2E', letterSpacing: -2, lineHeight: 1.05, margin: '0 0 8px' }}>
            Tu entrenamiento,{' '}
            <span style={{ fontFamily: '"Instrument Serif",serif', fontStyle: 'italic', fontWeight: 400, color: '#3A4257' }}>analizado.</span>
          </h1>
          <p style={{ fontFamily: '"Inter",system-ui', fontSize: 15, color: '#5C6477', margin: 0, lineHeight: 1.55 }}>
            Configura tu perfil y recibe análisis de volumen, balance, progresión e intensidad basados en evidencia.
            {sessions.length > 0 && <> Analizando <strong style={{ color: '#0F1A2E' }}>{sessions.length} sesión{sessions.length !== 1 ? 'es' : ''}</strong> del Builder.</>}
          </p>
        </div>

        {/* ── Profile config bar ───────────────────────────────────── */}
        <div style={{
          background: '#FFFFFF', borderRadius: 18, border: '1px solid rgba(15,26,46,0.07)',
          padding: '16px 20px', marginBottom: 24,
          display: 'flex', flexWrap: 'wrap', gap: 20, alignItems: 'center',
        }}>
          <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
            <span style={{ fontFamily: 'ui-monospace,Menlo,monospace', fontSize: 9, fontWeight: 700, color: '#9498A4', letterSpacing: 0.7, alignSelf: 'center', marginRight: 2 }}>OBJETIVO</span>
            {OBJETIVOS.map(([id, label]) => <AcPill key={id} label={label} active={objetivo === id} onClick={() => setObjetivo(id)} />)}
          </div>
          <div style={{ width: 1, height: 28, background: 'rgba(15,26,46,0.07)', flexShrink: 0 }} />
          <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
            <span style={{ fontFamily: 'ui-monospace,Menlo,monospace', fontSize: 9, fontWeight: 700, color: '#9498A4', letterSpacing: 0.7, alignSelf: 'center', marginRight: 2 }}>NIVEL</span>
            {NIVELES.map(([id, label]) => <AcPill key={id} label={label} active={nivel === id} onClick={() => setNivel(id)} />)}
          </div>
          <div style={{ width: 1, height: 28, background: 'rgba(15,26,46,0.07)', flexShrink: 0 }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontFamily: 'ui-monospace,Menlo,monospace', fontSize: 9, fontWeight: 700, color: '#9498A4', letterSpacing: 0.7 }}>DÍAS</span>
            <input type="range" min={2} max={6} step={1} value={dias} onChange={e => setDias(+e.target.value)} style={{ width: 80, accentColor: '#0F1A2E' }} />
            <span style={{ fontFamily: '"Inter",system-ui', fontSize: 16, fontWeight: 800, color: '#0F1A2E', width: 20 }}>{dias}</span>
          </div>
          <div style={{ width: 1, height: 28, background: 'rgba(15,26,46,0.07)', flexShrink: 0 }} />
          <div style={{ display: 'flex', gap: 5 }}>
            <span style={{ fontFamily: 'ui-monospace,Menlo,monospace', fontSize: 9, fontWeight: 700, color: '#9498A4', letterSpacing: 0.7, alignSelf: 'center', marginRight: 2 }}>MIN/SES.</span>
            {[45, 60, 90].map(t => <AcPill key={t} label={`${t}min`} active={tiempo === t} onClick={() => setTiempo(t)} />)}
          </div>
        </div>

        {/* ── Stats row ────────────────────────────────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 24 }}>
          <AcStatCard label="Sesiones Builder" value={sessions.length || '—'} sub={sessions.length > 0 ? `Últimas ${Math.min(sessions.length, 10)} analizadas` : 'Registra sesiones en Builder'} status={sessions.length > 0 ? 'good' : null} />
          <AcStatCard label="Frecuencia configurada" value={`${dias}×`} sub="días / semana" status={dias >= 3 ? 'good' : 'info'} />
          <AcStatCard label="Balance P/T" value={sessions.length === 0 ? '—' : balanceStatus === 'good' ? '✓ OK' : '⚠ Revisar'} sub={sessions.length > 0 ? `Empuje ${pushVol} · Tracción ${pullVol}` : 'Sin datos aún'} status={sessions.length > 0 ? balanceStatus : null} />
          <AcStatCard label="Insights activos" value={insights.length} sub={`${insights.filter(i=>i.status==='warning').length} aviso${insights.filter(i=>i.status==='warning').length !== 1 ? 's' : ''} · ${insights.filter(i=>i.status==='good').length} OK`} status={insights.some(i=>i.status==='warning') ? 'warning' : 'good'} />
        </div>

        {/* ── Main two-column layout ───────────────────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 20, alignItems: 'start' }}>

          {/* ── LEFT: insights + volume + exercises ─────────────────── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            {/* Insights grid */}
            <div style={{ background: '#FFFFFF', borderRadius: 20, border: '1px solid rgba(15,26,46,0.07)', padding: '22px 24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
                <div>
                  <div style={{ fontFamily: 'ui-monospace,Menlo,monospace', fontSize: 10, fontWeight: 700, color: '#9498A4', letterSpacing: 0.7, marginBottom: 3 }}>ANÁLISIS DEL COACH</div>
                  <div style={{ fontFamily: '"Inter",system-ui', fontSize: 16, fontWeight: 700, color: '#0F1A2E', letterSpacing: -0.4 }}>
                    {insights.length} recomendaciones para tu perfil
                  </div>
                </div>
                <span style={{ padding: '4px 10px', borderRadius: 999, background: 'rgba(42,111,219,0.07)', border: '1px solid rgba(42,111,219,0.14)', fontFamily: 'ui-monospace,Menlo,monospace', fontSize: 9, color: '#2A6FDB', fontWeight: 700 }}>
                  CIENCIA APLICADA
                </span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {insights.map(insight => <AcInsightCard key={insight.id} insight={insight} />)}
              </div>
            </div>

            {/* Volume analysis */}
            <div style={{ background: '#FFFFFF', borderRadius: 20, border: '1px solid rgba(15,26,46,0.07)', padding: '22px 24px' }}>
              <div style={{ fontFamily: 'ui-monospace,Menlo,monospace', fontSize: 10, fontWeight: 700, color: '#9498A4', letterSpacing: 0.7, marginBottom: 4 }}>ANÁLISIS DE VOLUMEN</div>
              <div style={{ fontFamily: '"Inter",system-ui', fontSize: 16, fontWeight: 700, color: '#0F1A2E', letterSpacing: -0.4, marginBottom: 16 }}>
                {sessions.length > 0 ? 'Basado en tus sesiones del Builder' : 'Volumen prescrito por protocolo'}
              </div>

              {sessions.length > 0 && muscleVolumeEntries.length > 0 ? (
                <div>
                  <div style={{ fontFamily: '"Inter",system-ui', fontSize: 11, color: '#9498A4', marginBottom: 14 }}>
                    Últimas {Math.min(sessions.length, 10)} sesiones · {muscleVolumeEntries.reduce((s,[,v])=>s+v,0)} series totales registradas
                  </div>
                  {muscleVolumeEntries.map(([muscle, sets]) => (
                    <AcVolumeBar key={muscle} label={muscle} sets={sets} max={maxVol} />
                  ))}
                  {/* Push/pull summary */}
                  <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid rgba(15,26,46,0.06)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    {[['Empuje (push)', pushVol, '#2A6FDB'], ['Tracción (pull)', pullVol, '#7C3AED']].map(([label, vol, color]) => (
                      <div key={label} style={{ padding: '10px 12px', borderRadius: 10, background: 'rgba(15,26,46,0.03)', border: '1px solid rgba(15,26,46,0.06)' }}>
                        <div style={{ fontFamily: '"Inter",system-ui', fontSize: 10, color: '#9498A4', marginBottom: 3 }}>{label}</div>
                        <div style={{ fontFamily: '"Inter",system-ui', fontSize: 22, fontWeight: 800, color: '#0F1A2E' }}>{vol}</div>
                        <div style={{ fontFamily: '"Inter",system-ui', fontSize: 10, color: '#9498A4' }}>ejercicios</div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div>
                  <div style={{ fontFamily: '"Inter",system-ui', fontSize: 12, color: '#9498A4', marginBottom: 14 }}>
                    Volumen objetivo para {OBJETIVOS.find(([id]) => id === objetivo)?.[1]} · {NIVELES.find(([id]) => id === nivel)?.[1]}
                  </div>
                  {Object.entries(protocol.volumeGuide).map(([muscle, vol]) => {
                    const [low] = vol.split('–').map(s => parseInt(s));
                    const maxRef = 22;
                    return (
                      <div key={muscle} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 7 }}>
                        <span style={{ fontFamily: '"Inter",system-ui', fontSize: 11, fontWeight: 600, color: '#3A4257', width: 72, flexShrink: 0, textTransform: 'capitalize' }}>{muscle}</span>
                        <div style={{ flex: 1, height: 7, borderRadius: 999, background: 'rgba(15,26,46,0.07)', overflow: 'hidden' }}>
                          <div style={{ height: '100%', borderRadius: 999, background: '#0F1A2E', width: `${(low / maxRef) * 100}%`, transition: 'width 0.4s' }} />
                        </div>
                        <span style={{ fontFamily: 'ui-monospace,Menlo,monospace', fontSize: 9, color: '#9498A4', width: 52, textAlign: 'right', flexShrink: 0 }}>{vol}</span>
                      </div>
                    );
                  })}
                  <div style={{ marginTop: 14, padding: '10px 14px', borderRadius: 10, background: 'rgba(42,111,219,0.05)', border: '1px solid rgba(42,111,219,0.12)', fontFamily: '"Inter",system-ui', fontSize: 11, color: '#1a4fa0', lineHeight: 1.5 }}>
                    Registra sesiones en el Builder para ver análisis de volumen real basado en tu historial.
                  </div>
                </div>
              )}
            </div>

            {/* Session exercise suggestions */}
            <div style={{ background: '#FFFFFF', borderRadius: 20, border: '1px solid rgba(15,26,46,0.07)', padding: '22px 24px' }}>
              <div style={{ fontFamily: 'ui-monospace,Menlo,monospace', fontSize: 10, fontWeight: 700, color: '#9498A4', letterSpacing: 0.7, marginBottom: 4 }}>EJERCICIOS POR SESIÓN</div>
              <div style={{ fontFamily: '"Inter",system-ui', fontSize: 16, fontWeight: 700, color: '#0F1A2E', letterSpacing: -0.4, marginBottom: 4 }}>
                Selección inteligente basada en evidencia
              </div>
              <p style={{ fontFamily: '"Inter",system-ui', fontSize: 12, color: '#9498A4', margin: '0 0 14px', lineHeight: 1.5 }}>
                Ejercicios seleccionados según objetivo, nivel y balance de patrones de movimiento. Personaliza en el Builder.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                {sessionLabels.map(label => (
                  <AcSessionPanel key={label} sessionLabel={label} objetivo={objetivo} nivel={nivel} tiempo={tiempo} />
                ))}
              </div>
            </div>

          </div>

          {/* ── RIGHT: protocol (sticky) ──────────────────────────── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, position: 'sticky', top: 80 }}>

            {/* Protocol header */}
            <div style={{ background: '#0F1A2E', borderRadius: 20, padding: '22px 24px', color: '#FAFAF7' }}>
              <div style={{ fontFamily: 'ui-monospace,Menlo,monospace', fontSize: 9, fontWeight: 700, letterSpacing: 1, opacity: 0.5, marginBottom: 6 }}>PROTOCOLO ACTIVO</div>
              <div style={{ fontFamily: '"Inter",system-ui', fontSize: 26, fontWeight: 700, letterSpacing: -1, margin: '0 0 4px' }}>{protocol.splitName}</div>
              <div style={{ fontFamily: '"Inter",system-ui', fontSize: 12, opacity: 0.6 }}>{dias}d/sem · {tiempo}min · {protocol.progressionModel}</div>
            </div>

            {/* Weekly schedule */}
            <div style={{ background: '#FFFFFF', borderRadius: 18, border: '1px solid rgba(15,26,46,0.07)', padding: '18px 20px' }}>
              <div style={{ fontFamily: 'ui-monospace,Menlo,monospace', fontSize: 9, fontWeight: 700, color: '#9498A4', letterSpacing: 0.7, marginBottom: 12 }}>HORARIO SEMANAL</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
                {protocol.schedule.days.map((day, i) => {
                  const sessionIdx = protocol.schedule.sessions[i];
                  const hasSession = sessionIdx !== null;
                  return (
                    <div key={i} style={{ textAlign: 'center' }}>
                      <div style={{ fontFamily: 'ui-monospace,Menlo,monospace', fontSize: 8, color: '#9498A4', marginBottom: 4, fontWeight: 600 }}>{day}</div>
                      <div style={{ padding: '6px 2px', borderRadius: 8, background: hasSession ? '#0F1A2E' : 'rgba(15,26,46,0.04)', color: hasSession ? '#FAFAF7' : '#9498A4', fontFamily: '"Inter",system-ui', fontSize: 9, fontWeight: hasSession ? 700 : 400, minHeight: 36, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {hasSession ? protocol.schedule.labels[sessionIdx] : '—'}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Intensity scheme */}
            <div style={{ background: '#FFFFFF', borderRadius: 18, border: '1px solid rgba(15,26,46,0.07)', padding: '18px 20px' }}>
              <div style={{ fontFamily: 'ui-monospace,Menlo,monospace', fontSize: 9, fontWeight: 700, color: '#9498A4', letterSpacing: 0.7, marginBottom: 12 }}>ESQUEMA DE INTENSIDAD</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {Object.entries(protocol.intensityScheme).map(([key, val]) => (
                  <div key={key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontFamily: '"Inter",system-ui', fontSize: 11, fontWeight: 600, color: '#3A4257' }}>{({rir:'RIR',rm:'% 1RM',reps:'Reps',rest:'Descanso'})[key]||key}</span>
                    <span style={{ fontFamily: 'ui-monospace,Menlo,monospace', fontSize: 11, color: '#0F1A2E', fontWeight: 700 }}>{val}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 4-week mesocycle */}
            <div style={{ background: '#FFFFFF', borderRadius: 18, border: '1px solid rgba(15,26,46,0.07)', padding: '18px 20px' }}>
              <div style={{ fontFamily: 'ui-monospace,Menlo,monospace', fontSize: 9, fontWeight: 700, color: '#9498A4', letterSpacing: 0.7, marginBottom: 12 }}>MESOCICLO 4 SEMANAS</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {protocol.mesocycle.map((w, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', borderRadius: 10, background: w.phase==='Deload' ? 'rgba(194,69,69,0.04)' : 'rgba(15,26,46,0.03)', border: `1px solid ${w.phase==='Deload' ? 'rgba(194,69,69,0.1)' : 'rgba(15,26,46,0.06)'}` }}>
                    <span style={{ fontFamily: 'ui-monospace,Menlo,monospace', fontSize: 9, color: '#9498A4', fontWeight: 700, width: 30, flexShrink: 0 }}>S{w.week}</span>
                    <span style={{ fontFamily: '"Inter",system-ui', fontSize: 11, fontWeight: 700, color: w.phase==='Deload' ? '#C24545' : '#0F1A2E', flex: 1 }}>{w.phase}</span>
                    <span style={{ fontFamily: 'ui-monospace,Menlo,monospace', fontSize: 10, fontWeight: 700, color: w.vol>=100?'#1F8B3A':w.vol>=80?'#0F1A2E':'#C24545' }}>{w.vol}%</span>
                    <span style={{ fontFamily: 'ui-monospace,Menlo,monospace', fontSize: 9, color: '#9498A4' }}>RIR {w.rir}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Scientific justification */}
            <div style={{ background: 'rgba(15,26,46,0.02)', borderRadius: 18, border: '1px solid rgba(15,26,46,0.06)', padding: '18px 20px' }}>
              <div style={{ fontFamily: 'ui-monospace,Menlo,monospace', fontSize: 9, fontWeight: 700, color: '#9498A4', letterSpacing: 0.7, marginBottom: 8 }}>BASE CIENTÍFICA</div>
              <p style={{ fontFamily: '"Inter",system-ui', fontSize: 12, color: '#3A4257', lineHeight: 1.65, margin: 0 }}>{protocol.justification}</p>
            </div>

            {/* Save */}
            <button onClick={handleSave} style={{ padding: '14px 20px', borderRadius: 14, border: 'none', cursor: 'pointer', background: saved ? '#E7F8EC' : '#0F1A2E', color: saved ? '#1F8B3A' : '#FAFAF7', fontFamily: '"Inter",system-ui', fontSize: 14, fontWeight: 700, letterSpacing: -0.2, transition: 'all 0.3s' }}>
              {saved ? '✓ Protocolo guardado · +25 gemas' : 'Guardar protocolo · +25 💎'}
            </button>

          </div>
        </div>
      </div>
    </section>
  );
}

Object.assign(window, { AtlasCoachSection });
