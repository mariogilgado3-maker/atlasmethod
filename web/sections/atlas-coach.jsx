// Atlas Coach — Guided Training Intelligence

// ── Protocol engine (unchanged) ───────────────────────────────────────────────

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
    hipertrofia: { reps:'8–15', descanso:'90–120s', intensidad:'65–80% del máximo', esfuerzo:'Cerca del fallo (RIR 1–2)' },
    fuerza:      { reps:'3–6',  descanso:'3–5 min',  intensidad:'80–93% del máximo', esfuerzo:'Al límite (RIR 0–1)' },
    recomp:      { reps:'8–12', descanso:'60–90s',  intensidad:'65–85% del máximo', esfuerzo:'Moderado (RIR 1–3)' },
    rendimiento: { reps:'4–8',  descanso:'2–4 min',  intensidad:'75–90% del máximo', esfuerzo:'Intenso (RIR 0–2)' },
  };
  const progModels = {
    hipertrofia: { principiante:'Añade carga cada sesión', intermedio:'Alterna volumen e intensidad', avanzado:'Bloques de 4 semanas' },
    fuerza:      { principiante:'Añade carga cada sesión', intermedio:'Ciclos semanales de carga',    avanzado:'Periodización compleja' },
    recomp:      { principiante:'Añade carga cada sesión', intermedio:'Varía la intensidad',          avanzado:'Ondulación avanzada' },
    rendimiento: { principiante:'Añade carga cada sesión', intermedio:'Progresión clásica',           avanzado:'Periodización compleja' },
  };
  const justifications = {
    hipertrofia: 'Para ganar músculo, el volumen de entrenamiento (series y repeticiones) es la variable más importante a largo plazo. Entrenar cerca del fallo en cada serie, con suficiente descanso entre sesiones, produce los mejores resultados. La ciencia muestra que entrenar cada músculo 2 veces por semana es más efectivo que una sola vez.',
    fuerza:      'Para ganar fuerza, necesitas levantar cargas cercanas a tu máximo (80–93%) con pocas repeticiones y descansos largos entre series. El sistema nervioso se adapta antes que el músculo, por lo que la consistencia en el patrón de movimiento es clave.',
    recomp:      'Mejorar la composición corporal requiere un déficit calórico moderado combinado con entrenamiento de fuerza. El objetivo es perder grasa mientras se mantiene o gana músculo. Una ingesta alta de proteína (2 g/kg) es fundamental.',
    rendimiento: 'El entrenamiento de rendimiento combina fuerza, potencia y resistencia. La clave es la periodización: alternar fases de carga intensa con semanas de menor esfuerzo para llegar a los momentos clave en tu mejor forma.',
  };
  return {
    splitName: splitNames[dias] || 'Full Body',
    schedule: schedules[dias] || schedules[3],
    volumeGuide: volGuides[objetivo] || volGuides.hipertrofia,
    intensityScheme: intensSchemes[objetivo] || intensSchemes.hipertrofia,
    progressionModel: (progModels[objetivo] || progModels.hipertrofia)[nivel] || 'Lineal',
    justification: justifications[objetivo] || justifications.hipertrofia,
    mesocycle: [
      { week:1, label:'Semana 1', phase:'Empezar con volumen moderado', vol:100, note:'Adaptación al plan' },
      { week:2, label:'Semana 2', phase:'Aumentar el volumen',          vol:115, note:'+15% de trabajo' },
      { week:3, label:'Semana 3', phase:'Subir la intensidad',          vol:90,  note:'Más peso, menos series' },
      { week:4, label:'Semana 4', phase:'Semana de descarga',           vol:60,  note:'Recuperación activa' },
    ],
  };
}

// ── Insight engine (unchanged logic) ─────────────────────────────────────────

function acGenerateInsights(objetivo, nivel, dias, log) {
  const out = [];
  const recent = (log || []).slice(0, 10);
  const hasLog = recent.length > 0;

  if (hasLog) {
    const muscleSets = {};
    const exerciseCount = {};
    const sessionSetCounts = [];

    recent.forEach(s => {
      const exs = s.exercises || [];
      sessionSetCounts.push(exs.reduce((t, ex) => t + (ex.sets?.length || 1), 0));
      const namesInSession = new Set();
      exs.forEach(ex => {
        namesInSession.add(ex.name);
        (ex.muscles || []).forEach(m => {
          const k = m.toLowerCase();
          muscleSets[k] = (muscleSets[k] || 0) + (ex.sets?.length || 1);
        });
      });
      namesInSession.forEach(n => { exerciseCount[n] = (exerciseCount[n] || 0) + 1; });
    });

    const sumM = (re) => Object.entries(muscleSets).reduce((t,[k,v]) => t + (re.test(k)?v:0), 0);
    const pushVol = sumM(/pectoral|tr[ií]ceps|deltoides ant/);
    const pullVol = sumM(/dorsal ancho|romboides|b[ií]ceps|braquial|deltoides post|trapecio medio/);
    const quadVol = sumM(/cu[áa]driceps/);
    const hamsVol = sumM(/isquios|b[ií]ceps femoral/);
    const coreVol = sumM(/core|transverso|oblicuos|recto abdominal/);
    const avgSets = sessionSetCounts.reduce((a,b)=>a+b,0) / sessionSetCounts.length;

    if (pushVol > pullVol * 1.4 && pushVol > 3) {
      out.push({ id:'push-pull', status:'warning', priority:1, pushVol, pullVol });
    } else if (pushVol > 0 || pullVol > 0) {
      out.push({ id:'push-pull', status:'good', priority:6, pushVol, pullVol });
    }
    if (quadVol > hamsVol * 2 && quadVol > 4) {
      out.push({ id:'quad-ham', status:'warning', priority:2, quadVol, hamsVol });
    } else if (quadVol > 0 && hamsVol > 0) {
      out.push({ id:'quad-ham', status:'good', priority:7, quadVol, hamsVol });
    }
    if (coreVol === 0 && recent.length >= 2) {
      out.push({ id:'core', status:'warning', priority:2 });
    }
    if (avgSets > 22) {
      out.push({ id:'vol-excess', status:'warning', priority:3, avgSets: Math.round(avgSets) });
    }
    const hasUnilateral = recent.some(s => (s.exercises||[]).some(ex =>
      /zancada|lunge|split|step.up|unilateral|b[uú]lgar|una pierna/.test((ex.name||'').toLowerCase())
    ));
    if (!hasUnilateral && recent.length >= 3) {
      out.push({ id:'unilateral', status:'info', priority:4 });
    }
    const monotonyExs = Object.entries(exerciseCount).filter(([,c]) => c >= recent.length * 0.7);
    if (monotonyExs.length >= 3 && recent.length >= 4) {
      out.push({ id:'monotony', status:'info', priority:4, examples: monotonyExs.slice(0,2).map(([n])=>n) });
    }
  }

  const basePriority = hasLog ? 8 : 2;
  out.push({ id:'rir',  status:'info',                          priority: basePriority,     dias });
  out.push({ id:'freq', status: dias >= 3 ? 'good' : 'info',   priority: basePriority + 1, dias });
  out.push({ id:'rec',  status: (7-dias) >= 2 ? 'good' : 'warning', priority: basePriority + 1, dias });

  out.sort((a, b) => (a.priority||9) - (b.priority||9));
  return out.slice(0, 8);
}

// ── Plain-language translator ─────────────────────────────────────────────────

function acPlainInsight(raw, objetivo) {
  const map = {
    'push-pull': {
      warning: {
        title: 'Estás entrenando mucho más pecho que espalda',
        body:   `En tus últimas sesiones acumulas ${raw.pushVol || '?'} series de pecho/hombro contra solo ${raw.pullVol || '?'} de espalda. Con el tiempo esto puede causar problemas de postura y dolor en el hombro.`,
        detail: 'La ciencia del deporte recomienda un ratio de al menos 1:1 entre ejercicios de empuje y tracción. Entrenar la espalda al menos tanto como el pecho protege el manguito rotador y mejora la postura.',
        ref:    'Comerford & Mottram, 2012',
        action: 'Añadir espalda al Builder',
        actionRoute: '/builder',
        icon:   '⊘',
      },
      good: {
        title: `Tienes buen equilibrio entre pecho y espalda`,
        body:   `Entrenar espalda tanto como pecho protege los hombros y mantiene una postura sana. Sigue así.`,
        detail: 'Un ratio equilibrado de empuje/tracción (1:1 o con ligera predominancia de tracción) es el estándar recomendado para la salud articular a largo plazo.',
        ref:    'Comerford & Mottram, 2012',
        action: null, icon: '⊕',
      },
    },
    'quad-ham': {
      warning: {
        title: 'La parte trasera de tu pierna necesita más trabajo',
        body:   `Haces ${raw.quadVol||'?'} series de cuádriceps por solo ${raw.hamsVol||0} de isquiosurales. Este desequilibrio es la causa más común de lesiones de rodilla en personas que entrenan.`,
        detail: 'Los isquiosurales actúan como freno del cuádriceps en movimientos explosivos. Un ratio inferior a 1:2 (isquios:cuádriceps) aumenta significativamente el riesgo de lesión de LCA.',
        ref:    'Zebis et al., 2011',
        action: 'Añadir isquios al Builder',
        actionRoute: '/builder',
        icon:   '↕',
      },
      good: {
        title: 'Cuádriceps e isquios están equilibrados',
        body:   'Trabajar ambas partes de la pierna por igual reduce el riesgo de lesión y mejora el rendimiento en todos los movimientos de pierna. Bien hecho.',
        detail: null, ref: null, action: null, icon: '⊕',
      },
    },
    'core': {
      warning: {
        title: 'No estás trabajando el core',
        body:   'El core conecta todo tu cuerpo. Sin entrenarlo, la técnica en sentadilla, peso muerto y press sufre, y el riesgo de dolor lumbar se duplica.',
        detail: 'El core actúa como estabilizador en todos los movimientos multiarticulares. McGill (2010) muestra que su déficit compromete la transferencia de fuerza en un 30–40%.',
        ref:    'McGill, 2010',
        action: 'Añadir core al Builder',
        actionRoute: '/builder',
        icon:   '◎',
      },
    },
    'vol-excess': {
      warning: {
        title: `Tus sesiones son demasiado largas`,
        body:   `Haces una media de ${raw.avgSets||'?'} series por sesión. Pasadas las 20–22 series, el cuerpo ya no puede adaptarse bien y la fatiga acumulada frena el progreso.`,
        detail: 'Existe un umbral máximo de volumen semanal (MRV) más allá del cual el cuerpo no puede recuperarse. Israetel et al. (2021) sitúan este límite en 16–22 series efectivas por sesión para la mayoría de grupos musculares.',
        ref:    'Israetel et al., 2021',
        action: 'Reorganizar en el Builder',
        actionRoute: '/builder',
        icon:   '⚠',
      },
    },
    'unilateral': {
      info: {
        title: 'Solo entrenas los dos lados a la vez',
        body:   'Ejercicios como las zancadas o el step-up detectan y corrigen diferencias entre tu lado derecho e izquierdo que el entrenamiento bilateral no revela.',
        detail: 'El entrenamiento unilateral recluta más activamente los estabilizadores de cadera y tobillo (McCurdy et al., 2005). Con el tiempo, los desequilibrios bilaterales no corregidos pueden derivar en lesiones.',
        ref:    'McCurdy et al., 2005',
        action: 'Ver ejercicios unilaterales',
        actionRoute: '/builder',
        icon:   '⊏',
      },
    },
    'monotony': {
      info: {
        title: 'Repites siempre los mismos ejercicios',
        body:   `Tu cuerpo se ha adaptado a ejercicios como ${(raw.examples||[]).join(' y ')}. Cambiar uno o dos al mes es suficiente para mantener el progreso.`,
        detail: 'Fonseca et al. (2014) demostraron que la variación de ejercicios cada 4–6 semanas produce hasta un 28% más de hipertrofia que repetir siempre el mismo movimiento.',
        ref:    'Fonseca et al., 2014',
        action: 'Explorar variaciones en el Builder',
        actionRoute: '/builder',
        icon:   '↻',
      },
    },
    'rir': {
      info: {
        title: 'Intenta esforzarte más en cada serie',
        body:   'El crecimiento muscular requiere que las últimas repeticiones de cada serie cuesten de verdad. Si terminas sin apenas notarlo, probablemente no estás generando el estímulo necesario.',
        detail: `Para ${objetivo === 'fuerza' ? 'fuerza' : 'ganar músculo'}, Helms et al. (2016) recomiendan terminar cada serie a 1–2 repeticiones del fallo. Más lejos del límite reduce drásticamente la señal anabólica en personas con experiencia.`,
        ref:    'Helms et al., 2016',
        action: null,
        icon:   '⚡',
      },
    },
    'freq': {
      good: {
        title: `Entrenar ${raw.dias} días por semana es una buena base`,
        body:   'Con esta frecuencia puedes trabajar cada músculo dos veces por semana, que es lo ideal para progresar bien.',
        detail: 'Schoenfeld et al. (2016) mostraron que entrenar cada grupo muscular 2 veces por semana produce entre un 6–22% más de hipertrofia que hacerlo una sola vez.', ref: 'Schoenfeld et al., 2016',
        action: null, icon: '↻',
      },
      info: {
        title: `Con solo ${raw.dias} días puedes mejorar, pero 3 o más ayudan más`,
        body:   'Dos días de entrenamiento es un buen punto de partida. Añadir un día más permitiría entrenar cada músculo con más frecuencia y progresar más rápido.',
        detail: 'Schoenfeld et al. (2016) mostraron que la frecuencia 2× por grupo produce hasta un 22% más de resultados que la frecuencia 1×.',
        ref:    'Schoenfeld et al., 2016',
        action: null, icon: '↻',
      },
    },
    'rec': {
      good: {
        title: 'Tienes suficientes días de descanso',
        body:   'La mejora ocurre durante el descanso, no el entrenamiento. Con tus días de recuperación el cuerpo puede adaptarse y crecer.',
        detail: 'Halson (2014) muestra que la privación de sueño y el insuficiente descanso entre sesiones reduce la síntesis proteica hasta un 18%.', ref: 'Halson, 2014',
        action: null, icon: '○',
      },
      warning: {
        title: 'Cuida la recuperación entre sesiones',
        body:   'Entrenar tanto días seguidos acumula fatiga que, si no se gestiona, frena el progreso o provoca lesiones. Una semana más suave cada 3–4 semanas lo soluciona.',
        detail: 'Halson (2014) documenta que la recuperación insuficiente reduce la síntesis proteica y la capacidad de adaptación neural. El deload periódico es la estrategia más efectiva para gestionarla.',
        ref:    'Halson, 2014',
        action: null, icon: '○',
      },
    },
  };

  const entry = map[raw.id];
  if (!entry) return null;
  const variant = entry[raw.status] || entry.warning || entry.good || entry.info;
  if (!variant) return null;
  return { ...raw, ...variant };
}

// ── Fatigue estimator (unchanged) ─────────────────────────────────────────────

function acEstimateFatigue(log) {
  if (!log || log.length === 0) return { label:'—', status:null, detail:'Sin datos' };
  const now = Date.now();
  const recent = log.filter(s => s.dateTs > now - 7*24*60*60*1000);
  const daysSinceLast = log[0]?.dateTs ? Math.floor((now - log[0].dateTs) / (1000*60*60*24)) : 99;
  const avgSets = recent.length > 0
    ? recent.reduce((t, s) => t + (s.exercises||[]).reduce((ts, ex) => ts + (ex.sets?.length||1), 0), 0) / recent.length
    : 0;
  const score = recent.length * 15 + Math.max(0, avgSets - 12) * 2 - daysSinceLast * 10;
  if (score > 60) return { label:'Alta',     status:'warning', detail:`${daysSinceLast > 0 ? daysSinceLast+'d de descanso' : 'Sin descanso reciente'}` };
  if (score > 20) return { label:'Moderada', status:'info',    detail:`${recent.length} sesión${recent.length!==1?'es':''} esta semana` };
  return   { label:'Baja',     status:'good',    detail: daysSinceLast > 2 ? `${daysSinceLast}d descansando` : 'Bien recuperado' };
}

// ── Active workout analyzer (unchanged) ──────────────────────────────────────

function acAnalyzeCurrentWorkout(exercises) {
  if (!exercises || exercises.length === 0) return null;
  const muscleSets = {};
  exercises.forEach(ex => {
    const s = ex.sets?.length || 1;
    (ex.muscles || []).forEach(m => { const k = m.toLowerCase(); muscleSets[k] = (muscleSets[k]||0) + s; });
  });
  const sumM = (re) => Object.entries(muscleSets).reduce((t,[k,v]) => t + (re.test(k)?v:0), 0);
  const pushVol = sumM(/pectoral|tr[ií]ceps|deltoides ant/);
  const pullVol = sumM(/dorsal ancho|romboides|b[ií]ceps|braquial|deltoides post/);
  const totalSets = exercises.reduce((t, ex) => t + (ex.sets?.length||1), 0);
  const alerts = [];
  if (pushVol > pullVol * 1.5 && pushVol > 3) alerts.push(`Más empuje que tracción (${pushVol} vs ${pullVol} series). Añade remo o dominadas.`);
  if (totalSets > 22) alerts.push(`${totalSets} series es mucho para una sesión. Considera eliminar un ejercicio.`);
  if (exercises.length > 0 && sumM(/core|transverso|oblicuos|recto abdominal/) === 0) alerts.push('Sin core en esta sesión. Añade 2–3 series al final.');
  return { pushVol, pullVol, totalSets, alerts, count: exercises.length };
}

// ── Coach message deriver ─────────────────────────────────────────────────────

function acCoachMessage(log, liveAnalysis, insights, sessionStats, fatigue) {
  if (liveAnalysis && liveAnalysis.count > 0) {
    return `Tienes una rutina en curso. Déjame analizarla.`;
  }
  if (!log || log.length === 0) {
    return `Cuando registres tus primeras sesiones en el Builder, podré analizar tu entrenamiento y darte recomendaciones personalizadas.`;
  }
  const warnings = insights.filter(i => i.status === 'warning');
  if (warnings.length > 1) {
    return `He revisado tus últimas ${Math.min(log.length, 10)} sesiones. Hay ${warnings.length} cosas que podrían estar frenando tu progreso.`;
  }
  if (warnings.length === 1) {
    return `He revisado tus últimas ${Math.min(log.length, 10)} sesiones. Encontré algo importante que deberías atender.`;
  }
  if (sessionStats?.streak >= 5) {
    return `Llevas ${sessionStats.streak} días seguidos entrenando. Tu constancia es lo que marca la diferencia.`;
  }
  return `He revisado tu historial. Tu entrenamiento va por buen camino.`;
}

// ── Design tokens ─────────────────────────────────────────────────────────────

const AC = {
  good:    { bg:'rgba(31,139,58,0.06)',  border:'rgba(31,139,58,0.18)',  accent:'#1A7A34', label:'Bien' },
  info:    { bg:'rgba(42,111,219,0.05)', border:'rgba(42,111,219,0.15)', accent:'#1A5FC2', label:'Info' },
  warning: { bg:'rgba(180,80,0,0.05)',   border:'rgba(180,80,0,0.18)',   accent:'#B45000', label:'Atención' },
};

// ── UI Components ─────────────────────────────────────────────────────────────

function AcPill({ label, active, onClick }) {
  return (
    <button onClick={onClick} style={{
      padding:'6px 13px', borderRadius:999, cursor:'pointer',
      border: active ? '1.5px solid #0F1A2E' : '1px solid rgba(15,26,46,0.12)',
      background: active ? '#0F1A2E' : 'transparent',
      color: active ? '#FAFAF7' : '#3A4257',
      fontFamily:'"Inter",system-ui', fontSize:12, fontWeight: active ? 700 : 500,
      transition:'all 0.13s', whiteSpace:'nowrap',
    }}>
      {label}
    </button>
  );
}

// Coach message — elegant text, not chat bubble
function AcCoachText({ text }) {
  return (
    <div style={{ marginBottom:32 }}>
      <p style={{
        fontFamily:'"Instrument Serif",serif', fontStyle:'italic',
        fontSize:22, color:'#3A4257', lineHeight:1.5, margin:0,
      }}>
        {text}
      </p>
    </div>
  );
}

// Primary insight — the ONE thing to focus on
function AcPrimaryCard({ insight, onAction, onToggleDetail }) {
  const [showDetail, setShowDetail] = React.useState(false);
  if (!insight) return null;
  const c = AC[insight.status] || AC.info;
  const isGood = insight.status === 'good';

  return (
    <div style={{
      borderRadius:24,
      background: isGood ? 'rgba(31,139,58,0.04)' : '#FFFFFF',
      border: `1.5px solid ${isGood ? 'rgba(31,139,58,0.14)' : 'rgba(15,26,46,0.09)'}`,
      padding:'28px 32px', marginBottom:16,
      boxShadow: isGood ? 'none' : '0 2px 20px rgba(15,26,46,0.06)',
    }}>
      {/* Status label */}
      <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:14 }}>
        <span style={{
          fontFamily:'ui-monospace,Menlo,monospace', fontSize:9, fontWeight:700,
          letterSpacing:1.2, textTransform:'uppercase',
          color: c.accent,
        }}>
          {isGood ? '✓ ' : '⚠ '}{c.label}
        </span>
      </div>

      {/* Title */}
      <h2 style={{
        fontFamily:'"Inter",system-ui', fontSize:24, fontWeight:700,
        color:'#0F1A2E', letterSpacing:-0.8, lineHeight:1.2,
        margin:'0 0 12px',
      }}>
        {insight.title}
      </h2>

      {/* Body */}
      <p style={{
        fontFamily:'"Inter",system-ui', fontSize:15, color:'#5C6477',
        lineHeight:1.65, margin:'0 0 20px',
      }}>
        {insight.body}
      </p>

      {/* Detail expansion */}
      {insight.detail && (
        <div style={{ marginBottom:20 }}>
          <button
            onClick={() => setShowDetail(d => !d)}
            style={{
              background:'none', border:'none', cursor:'pointer', padding:0,
              fontFamily:'"Inter",system-ui', fontSize:12, fontWeight:600,
              color:'#9498A4', display:'flex', alignItems:'center', gap:5,
            }}
          >
            <span style={{ transform: showDetail ? 'rotate(90deg)' : 'none', display:'inline-block', transition:'transform 0.2s', fontSize:10 }}>▶</span>
            {showDetail ? 'Ocultar explicación científica' : 'Por qué es importante'}
          </button>
          {showDetail && (
            <div style={{
              marginTop:12, padding:'14px 16px', borderRadius:12,
              background:'rgba(15,26,46,0.03)', border:'1px solid rgba(15,26,46,0.06)',
            }}>
              <p style={{ fontFamily:'"Inter",system-ui', fontSize:13, color:'#5C6477', lineHeight:1.65, margin:0 }}>
                {insight.detail}
              </p>
              {insight.ref && (
                <div style={{ fontFamily:'ui-monospace,Menlo,monospace', fontSize:9, color:'#9498A4', marginTop:8 }}>
                  Fuente: {insight.ref}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      {insight.action && (
        <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
          <button
            onClick={onAction}
            style={{
              padding:'12px 20px', borderRadius:12, border:'none', cursor:'pointer',
              background:'#0F1A2E', color:'#FAFAF7',
              fontFamily:'"Inter",system-ui', fontSize:13, fontWeight:700,
              letterSpacing:-0.2,
            }}
          >
            {insight.action} →
          </button>
        </div>
      )}
    </div>
  );
}

// Secondary insight — compact row
function AcSecondaryRow({ insight, onExpand, expanded }) {
  if (!insight) return null;
  const c = AC[insight.status] || AC.info;
  return (
    <div style={{ borderRadius:14, overflow:'hidden', border:'1px solid rgba(15,26,46,0.07)', marginBottom:8 }}>
      <button
        onClick={onExpand}
        style={{
          width:'100%', padding:'14px 18px', border:'none', cursor:'pointer',
          background:'#FFFFFF', display:'flex', alignItems:'center', gap:12, textAlign:'left',
        }}
      >
        <span style={{
          width:28, height:28, borderRadius:8, flexShrink:0,
          background: c.bg, border:`1px solid ${c.border}`,
          display:'flex', alignItems:'center', justifyContent:'center',
          fontFamily:'ui-monospace,Menlo,monospace', fontSize:12, color: c.accent, fontWeight:700,
        }}>{insight.icon}</span>
        <span style={{ fontFamily:'"Inter",system-ui', fontSize:14, fontWeight:600, color:'#0F1A2E', flex:1 }}>
          {insight.title}
        </span>
        <span style={{
          padding:'3px 9px', borderRadius:999, flexShrink:0,
          background: c.bg, border:`1px solid ${c.border}`,
          fontFamily:'ui-monospace,Menlo,monospace', fontSize:9, color: c.accent, fontWeight:700, letterSpacing:0.3,
        }}>{c.label}</span>
        <span style={{ color:'#9498A4', fontSize:11, transform: expanded ? 'rotate(180deg)' : 'none', transition:'transform 0.2s', flexShrink:0 }}>↓</span>
      </button>
      {expanded && (
        <div style={{ padding:'0 18px 16px', background:'rgba(250,250,247,0.6)' }}>
          <p style={{ fontFamily:'"Inter",system-ui', fontSize:13, color:'#5C6477', lineHeight:1.65, margin:'0 0 8px' }}>
            {insight.body}
          </p>
          {insight.detail && (
            <p style={{ fontFamily:'"Inter",system-ui', fontSize:12, color:'#9498A4', lineHeight:1.6, margin:0 }}>
              {insight.detail}
              {insight.ref && <span style={{ fontFamily:'ui-monospace,Menlo,monospace', fontSize:9, display:'block', marginTop:4 }}>Fuente: {insight.ref}</span>}
            </p>
          )}
          {insight.action && (
            <button
              onClick={() => insight.actionRoute && (window.location.hash = insight.actionRoute)}
              style={{ marginTop:10, padding:'8px 14px', borderRadius:10, border:'1px solid rgba(15,26,46,0.12)', background:'#0F1A2E', color:'#FAFAF7', fontFamily:'"Inter",system-ui', fontSize:12, fontWeight:700, cursor:'pointer' }}
            >
              {insight.action} →
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// Live workout banner — appears when Builder has an active session
function AcLiveBanner({ analysis, onGoBuilder }) {
  if (!analysis) return null;
  const hasAlert = analysis.alerts.length > 0;
  return (
    <div style={{
      borderRadius:16, padding:'14px 20px', marginBottom:20,
      background: hasAlert ? 'rgba(180,80,0,0.04)' : 'rgba(31,139,58,0.04)',
      border: `1px solid ${hasAlert ? 'rgba(180,80,0,0.16)' : 'rgba(31,139,58,0.14)'}`,
      display:'flex', alignItems:'center', gap:12, flexWrap:'wrap',
    }}>
      <div style={{ width:7, height:7, borderRadius:'50%', background:'#22C55E', flexShrink:0, animation:'pulse 2s infinite' }} />
      <span style={{ fontFamily:'"Inter",system-ui', fontSize:13, fontWeight:600, color:'#0F1A2E', flex:1 }}>
        {hasAlert
          ? analysis.alerts[0]
          : `Rutina en curso — ${analysis.count} ejercicios, ${analysis.totalSets} series. Todo en orden.`
        }
      </span>
      <button
        onClick={onGoBuilder}
        style={{ padding:'7px 14px', borderRadius:10, border:'1px solid rgba(15,26,46,0.1)', background:'#0F1A2E', color:'#FAFAF7', fontFamily:'"Inter",system-ui', fontSize:11, fontWeight:700, cursor:'pointer', whiteSpace:'nowrap' }}
      >
        Continuar en Builder →
      </button>
    </div>
  );
}

// Profile config — collapsed by default
function AcProfileDrawer({ objetivo, setObjetivo, nivel, setNivel, dias, setDias, tiempo, setTiempo }) {
  const [open, setOpen] = React.useState(false);
  const OBJETIVOS = [['hipertrofia','Ganar músculo'],['fuerza','Ganar fuerza'],['recomp','Recomp.'],['rendimiento','Rendimiento']];
  const NIVELES   = [['principiante','Principiante'],['intermedio','Intermedio'],['avanzado','Avanzado']];
  const TIEMPOS   = [[45,'45 min'],[60,'60 min'],[90,'90 min']];
  const objLabel = OBJETIVOS.find(([id])=>id===objetivo)?.[1];
  const nivLabel = NIVELES.find(([id])=>id===nivel)?.[1];

  return (
    <div style={{ marginBottom:24 }}>
      <button
        onClick={() => setOpen(o=>!o)}
        style={{
          display:'flex', alignItems:'center', gap:8, padding:'8px 14px', borderRadius:999,
          border:'1px solid rgba(15,26,46,0.12)', background:'#FFFFFF',
          cursor:'pointer', fontFamily:'"Inter",system-ui', fontSize:12, fontWeight:600, color:'#3A4257',
        }}
      >
        <span style={{ width:6, height:6, borderRadius:'50%', background:'#22C55E', display:'inline-block' }} />
        {objLabel} · {nivLabel} · {dias}d/sem · {tiempo}min
        <span style={{ color:'#9498A4', fontSize:10, marginLeft:2 }}>{open ? '↑' : '↓'}</span>
      </button>

      {open && (
        <div style={{
          marginTop:10, padding:'18px 20px', borderRadius:16,
          background:'#FFFFFF', border:'1px solid rgba(15,26,46,0.07)',
          display:'flex', flexWrap:'wrap', gap:16, alignItems:'center',
        }}>
          <div>
            <div style={{ fontFamily:'ui-monospace,Menlo,monospace', fontSize:8, fontWeight:700, color:'#9498A4', letterSpacing:0.8, marginBottom:6 }}>OBJETIVO</div>
            <div style={{ display:'flex', gap:5, flexWrap:'wrap' }}>
              {OBJETIVOS.map(([id,label]) => <AcPill key={id} label={label} active={objetivo===id} onClick={()=>setObjetivo(id)} />)}
            </div>
          </div>
          <div>
            <div style={{ fontFamily:'ui-monospace,Menlo,monospace', fontSize:8, fontWeight:700, color:'#9498A4', letterSpacing:0.8, marginBottom:6 }}>NIVEL</div>
            <div style={{ display:'flex', gap:5 }}>
              {NIVELES.map(([id,label]) => <AcPill key={id} label={label} active={nivel===id} onClick={()=>setNivel(id)} />)}
            </div>
          </div>
          <div>
            <div style={{ fontFamily:'ui-monospace,Menlo,monospace', fontSize:8, fontWeight:700, color:'#9498A4', letterSpacing:0.8, marginBottom:6 }}>DÍAS/SEM</div>
            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
              <input type="range" min={2} max={6} step={1} value={dias} onChange={e=>setDias(+e.target.value)} style={{ width:80, accentColor:'#0F1A2E' }} />
              <span style={{ fontFamily:'"Inter",system-ui', fontSize:15, fontWeight:800, color:'#0F1A2E', width:20 }}>{dias}</span>
            </div>
          </div>
          <div>
            <div style={{ fontFamily:'ui-monospace,Menlo,monospace', fontSize:8, fontWeight:700, color:'#9498A4', letterSpacing:0.8, marginBottom:6 }}>MIN/SESIÓN</div>
            <div style={{ display:'flex', gap:5 }}>
              {TIEMPOS.map(([t,label]) => <AcPill key={t} label={label} active={tiempo===t} onClick={()=>setTiempo(t)} />)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Protocol view — collapsible
function AcProtocolDrawer({ protocol, dias, tiempo, onSave, saved }) {
  const [open, setOpen] = React.useState(false);
  return (
    <div style={{ borderRadius:16, overflow:'hidden', border:'1px solid rgba(15,26,46,0.08)', marginBottom:8 }}>
      <button
        onClick={() => setOpen(o=>!o)}
        style={{
          width:'100%', padding:'16px 20px', border:'none', cursor:'pointer',
          background:'#FFFFFF', display:'flex', justifyContent:'space-between', alignItems:'center',
        }}
      >
        <div>
          <div style={{ fontFamily:'"Inter",system-ui', fontSize:14, fontWeight:700, color:'#0F1A2E', marginBottom:2 }}>
            Protocolo de entrenamiento
          </div>
          <div style={{ fontFamily:'"Inter",system-ui', fontSize:12, color:'#9498A4' }}>
            {protocol.splitName} · {dias}d/sem · {protocol.progressionModel}
          </div>
        </div>
        <span style={{ color:'#9498A4', fontSize:11, transform: open ? 'rotate(180deg)' : 'none', transition:'transform 0.2s' }}>↓</span>
      </button>

      {open && (
        <div style={{ padding:'0 20px 20px', background:'#FAFAF7', display:'flex', flexDirection:'column', gap:14 }}>

          {/* Horario semanal */}
          <div>
            <div style={{ fontFamily:'ui-monospace,Menlo,monospace', fontSize:8, fontWeight:700, color:'#9498A4', letterSpacing:0.8, marginBottom:10 }}>HORARIO SEMANAL</div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:4 }}>
              {protocol.schedule.days.map((day, i) => {
                const sessionIdx = protocol.schedule.sessions[i];
                const has = sessionIdx !== null;
                return (
                  <div key={i} style={{ textAlign:'center' }}>
                    <div style={{ fontFamily:'ui-monospace,Menlo,monospace', fontSize:8, color:'#9498A4', marginBottom:3 }}>{day}</div>
                    <div style={{ padding:'6px 2px', borderRadius:8, background: has ? '#0F1A2E' : 'rgba(15,26,46,0.04)', color: has ? '#FAFAF7' : '#9498A4', fontFamily:'"Inter",system-ui', fontSize:8, fontWeight: has ? 700 : 400, minHeight:34, display:'flex', alignItems:'center', justifyContent:'center', lineHeight:1.2, textAlign:'center' }}>
                      {has ? protocol.schedule.labels[sessionIdx] : '—'}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Cómo entrenar */}
          <div>
            <div style={{ fontFamily:'ui-monospace,Menlo,monospace', fontSize:8, fontWeight:700, color:'#9498A4', letterSpacing:0.8, marginBottom:10 }}>CÓMO ENTRENAR</div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:6 }}>
              {Object.entries(protocol.intensityScheme).map(([key, val]) => (
                <div key={key} style={{ padding:'10px 12px', borderRadius:10, background:'#FFFFFF', border:'1px solid rgba(15,26,46,0.06)' }}>
                  <div style={{ fontFamily:'"Inter",system-ui', fontSize:10, color:'#9498A4', marginBottom:2 }}>{({reps:'Repeticiones',descanso:'Descanso',intensidad:'Carga',esfuerzo:'Esfuerzo'})[key]||key}</div>
                  <div style={{ fontFamily:'"Inter",system-ui', fontSize:13, fontWeight:700, color:'#0F1A2E' }}>{val}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Plan 4 semanas */}
          <div>
            <div style={{ fontFamily:'ui-monospace,Menlo,monospace', fontSize:8, fontWeight:700, color:'#9498A4', letterSpacing:0.8, marginBottom:10 }}>PLAN 4 SEMANAS</div>
            {protocol.mesocycle.map((w, i) => (
              <div key={i} style={{ display:'flex', alignItems:'center', gap:10, padding:'9px 12px', borderRadius:10, background: w.vol<80 ? 'rgba(194,69,69,0.03)' : 'rgba(15,26,46,0.02)', border:`1px solid ${w.vol<80 ? 'rgba(194,69,69,0.08)' : 'rgba(15,26,46,0.05)'}`, marginBottom:5 }}>
                <span style={{ fontFamily:'ui-monospace,Menlo,monospace', fontSize:9, color:'#9498A4', width:24, flexShrink:0 }}>S{w.week}</span>
                <span style={{ fontFamily:'"Inter",system-ui', fontSize:12, fontWeight:700, color: w.vol<80 ? '#C24545' : '#0F1A2E', flex:1 }}>{w.phase}</span>
                <span style={{ fontFamily:'"Inter",system-ui', fontSize:11, color:'#9498A4' }}>{w.note}</span>
                <span style={{ fontFamily:'ui-monospace,Menlo,monospace', fontSize:10, fontWeight:700, color: w.vol>=100?'#1F8B3A':w.vol>=80?'#0F1A2E':'#C24545' }}>{w.vol}%</span>
              </div>
            ))}
          </div>

          {/* Justificación */}
          <div style={{ padding:'14px 16px', borderRadius:12, background:'rgba(42,111,219,0.04)', border:'1px solid rgba(42,111,219,0.1)' }}>
            <div style={{ fontFamily:'ui-monospace,Menlo,monospace', fontSize:8, fontWeight:700, color:'#2A6FDB', letterSpacing:0.8, marginBottom:6 }}>POR QUÉ FUNCIONA</div>
            <p style={{ fontFamily:'"Inter",system-ui', fontSize:12, color:'#3A4257', lineHeight:1.65, margin:0 }}>{protocol.justification}</p>
          </div>

          <button
            onClick={onSave}
            style={{ padding:'13px 20px', borderRadius:12, border:'none', cursor:'pointer', background: saved ? '#E7F8EC' : '#0F1A2E', color: saved ? '#1F8B3A' : '#FAFAF7', fontFamily:'"Inter",system-ui', fontSize:13, fontWeight:700, transition:'all 0.3s' }}
          >
            {saved ? '✓ Protocolo guardado · +25 gemas' : 'Guardar este protocolo · +25 💎'}
          </button>
        </div>
      )}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

function AtlasCoachSection() {
  const { actions, state } = useStore();
  const { navigate } = useRoute();

  const [objetivo, setObjetivo] = React.useState('hipertrofia');
  const [nivel,    setNivel]    = React.useState('intermedio');
  const [dias,     setDias]     = React.useState(4);
  const [tiempo,   setTiempo]   = React.useState(60);
  const [expandedId, setExpandedId] = React.useState(null);
  const [saved,    setSaved]    = React.useState(false);
  const [gemFlash, setGemFlash] = React.useState(false);

  const log            = state.log || [];
  const currentWorkout = state.currentWorkout || [];
  const sessionStats   = state.sessions;

  const rawInsights  = React.useMemo(() => acGenerateInsights(objetivo, nivel, dias, log), [objetivo, nivel, dias, log]);
  const insights     = React.useMemo(() => rawInsights.map(r => acPlainInsight(r, objetivo)).filter(Boolean), [rawInsights, objetivo]);
  const fatigue      = React.useMemo(() => acEstimateFatigue(log), [log]);
  const liveAnalysis = React.useMemo(() => acAnalyzeCurrentWorkout(currentWorkout), [currentWorkout]);
  const protocol     = React.useMemo(() => acGenerateProtocol(objetivo, nivel, dias, tiempo), [objetivo, nivel, dias, tiempo]);

  const primaryInsight    = insights[0] || null;
  const secondaryInsights = insights.slice(1, 4);

  const coachMsg = React.useMemo(
    () => acCoachMessage(log, liveAnalysis, rawInsights, sessionStats, fatigue),
    [log, liveAnalysis, rawInsights, sessionStats, fatigue]
  );

  const handleSave = () => {
    actions.saveProtocol({ objetivo, nivel, dias, tiempo, ...protocol, savedAt:Date.now() });
    setSaved(true); setGemFlash(true);
    setTimeout(() => setGemFlash(false), 2500);
    setTimeout(() => setSaved(false), 4000);
  };

  const toggleExpanded = (id) => setExpandedId(prev => prev === id ? null : id);

  return (
    <section style={{ padding:'100px 32px 100px', minHeight:'100vh', background:'#FAFAF7' }}>
      <div style={{ maxWidth:720, margin:'0 auto' }}>

        {gemFlash && (
          <div style={{ position:'fixed', top:80, right:32, zIndex:200, background:'#0F1A2E', color:'#FAFAF7', padding:'10px 20px', borderRadius:999, fontFamily:'"Inter",system-ui', fontSize:14, fontWeight:700, animation:'fadeIn 0.3s ease', boxShadow:'0 8px 32px rgba(15,26,46,0.25)' }}>
            💎 +25 gemas · Protocolo guardado
          </div>
        )}

        {/* ── Header ─────────────────────────────────────────────── */}
        <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:32, gap:16 }}>
          <div>
            <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8 }}>
              <span style={{ fontFamily:'"Inter",system-ui', fontSize:11, fontWeight:700, letterSpacing:1.8, textTransform:'uppercase', color:'#9498A4' }}>Atlas Coach</span>
              {log.length > 0 && (
                <span style={{ padding:'2px 8px', borderRadius:999, background:'rgba(31,139,58,0.08)', border:'1px solid rgba(31,139,58,0.18)', fontFamily:'ui-monospace,Menlo,monospace', fontSize:9, fontWeight:700, color:'#1A7A34', letterSpacing:0.4 }}>
                  {sessionStats.completed} sesiones
                </span>
              )}
              {fatigue.status && (
                <span style={{ padding:'2px 8px', borderRadius:999, background: AC[fatigue.status].bg, border:`1px solid ${AC[fatigue.status].border}`, fontFamily:'ui-monospace,Menlo,monospace', fontSize:9, fontWeight:700, color: AC[fatigue.status].accent, letterSpacing:0.4 }}>
                  Fatiga {fatigue.label.toLowerCase()}
                </span>
              )}
            </div>
            <h1 style={{ fontFamily:'"Inter",system-ui', fontSize:36, fontWeight:700, color:'#0F1A2E', letterSpacing:-1.5, lineHeight:1.1, margin:0 }}>
              Tu entrenamiento<span style={{ fontFamily:'"Instrument Serif",serif', fontStyle:'italic', fontWeight:400, color:'#5C6477' }}>, analizado.</span>
            </h1>
          </div>
        </div>

        {/* ── Profile config (collapsed) ──────────────────────────── */}
        <AcProfileDrawer
          objetivo={objetivo} setObjetivo={setObjetivo}
          nivel={nivel}       setNivel={setNivel}
          dias={dias}         setDias={setDias}
          tiempo={tiempo}     setTiempo={setTiempo}
        />

        {/* ── Live workout banner ─────────────────────────────────── */}
        <AcLiveBanner analysis={liveAnalysis} onGoBuilder={() => navigate('/builder')} />

        {/* ── Coach message ───────────────────────────────────────── */}
        <AcCoachText text={coachMsg} />

        {/* ── Empty state ─────────────────────────────────────────── */}
        {log.length === 0 && (
          <div style={{ borderRadius:20, border:'1px solid rgba(15,26,46,0.08)', background:'#FFFFFF', padding:'36px 32px', textAlign:'center', marginBottom:24 }}>
            <div style={{ fontFamily:'"Instrument Serif",serif', fontStyle:'italic', fontSize:20, color:'#5C6477', marginBottom:12 }}>
              Sin sesiones registradas todavía
            </div>
            <p style={{ fontFamily:'"Inter",system-ui', fontSize:14, color:'#9498A4', lineHeight:1.65, margin:'0 0 24px' }}>
              Crea y guarda tu primera rutina en el Builder para que Atlas Coach pueda analizar tu entrenamiento y darte recomendaciones personalizadas.
            </p>
            <button
              onClick={() => navigate('/builder')}
              style={{ padding:'13px 24px', borderRadius:12, border:'none', cursor:'pointer', background:'#0F1A2E', color:'#FAFAF7', fontFamily:'"Inter",system-ui', fontSize:14, fontWeight:700 }}
            >
              Ir al Builder →
            </button>
          </div>
        )}

        {/* ── Primary insight ─────────────────────────────────────── */}
        {primaryInsight && (
          <AcPrimaryCard
            insight={primaryInsight}
            onAction={() => primaryInsight.actionRoute && navigate(primaryInsight.actionRoute)}
          />
        )}

        {/* ── Secondary insights ──────────────────────────────────── */}
        {secondaryInsights.length > 0 && (
          <div style={{ marginBottom:32 }}>
            <div style={{ fontFamily:'"Inter",system-ui', fontSize:13, fontWeight:600, color:'#9498A4', marginBottom:12 }}>
              {primaryInsight?.status === 'warning' ? 'Además…' : 'Oportunidades de mejora'}
            </div>
            {secondaryInsights.map(insight => (
              <AcSecondaryRow
                key={insight.id}
                insight={insight}
                expanded={expandedId === insight.id}
                onExpand={() => toggleExpanded(insight.id)}
              />
            ))}
          </div>
        )}

        {/* ── Bottom actions ──────────────────────────────────────── */}
        <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginBottom:32 }}>
          <button
            onClick={() => navigate('/builder')}
            style={{ padding:'12px 20px', borderRadius:12, border:'1px solid rgba(15,26,46,0.12)', background:'#FFFFFF', color:'#0F1A2E', fontFamily:'"Inter",system-ui', fontSize:13, fontWeight:700, cursor:'pointer' }}
          >
            Abrir Builder
          </button>
          <button
            onClick={() => navigate('/aula')}
            style={{ padding:'12px 20px', borderRadius:12, border:'1px solid rgba(15,26,46,0.12)', background:'#FFFFFF', color:'#0F1A2E', fontFamily:'"Inter",system-ui', fontSize:13, fontWeight:600, cursor:'pointer' }}
          >
            Aprender más en el Aula
          </button>
        </div>

        {/* ── Protocol (collapsible) ──────────────────────────────── */}
        <div style={{ marginBottom:8 }}>
          <div style={{ fontFamily:'"Inter",system-ui', fontSize:13, fontWeight:600, color:'#9498A4', marginBottom:10 }}>Tu plan</div>
          <AcProtocolDrawer protocol={protocol} dias={dias} tiempo={tiempo} onSave={handleSave} saved={saved} />
        </div>

      </div>
    </section>
  );
}

Object.assign(window, { AtlasCoachSection });
