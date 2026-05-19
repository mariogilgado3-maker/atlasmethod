// Atlas Coach v3 — Intelligent training assistant with persistent memory

// ── Design tokens ─────────────────────────────────────────────────────────────
const AC = {
  page:    '#060D18',
  sidebar: '#06111F',
  card:    '#0E1A2C',
  card2:   '#0A1628',
  hover:   '#132134',
  border:  'rgba(255,255,255,0.07)',
  text:    '#E8EDF8',
  sub:     'rgba(232,237,248,0.55)',
  muted:   'rgba(232,237,248,0.28)',
  blue:    '#3B82F6',
  green:   '#22C55E',
  amber:   '#F59E0B',
  red:     '#EF4444',
  input:   '#0A1422',
};

// ── Exercise grouping ─────────────────────────────────────────────────────────
function acExGroup(ex) {
  const p = ex.pattern || '';
  if (p === 'empuje-horizontal') return 'pecho';
  if (p === 'empuje-vertical')
    return (ex.muscles?.primary?.[0] || '').includes('Tríceps') ? 'triceps' : 'hombro';
  if (p === 'traccion-horizontal')
    return (ex.muscles?.primary?.[0] || '').includes('Deltoides') ? 'hombro' : 'espalda';
  if (p === 'traccion-vertical') {
    const pm = ex.muscles?.primary?.[0] || '';
    return (pm.includes('Bíceps') || pm.includes('Braquial')) ? 'biceps' : 'espalda';
  }
  if (p === 'sentadilla' || p === 'aislamiento-pantorrilla') return 'piernas';
  if (p === 'bisagra') return 'gluteos';
  if (p.startsWith('core')) return 'core';
  return 'core';
}

// ── Storage helpers ───────────────────────────────────────────────────────────
const AC_PROFILE_KEY = 'atlas.coach.profile.v1';
const AC_MEMORY_KEY  = 'atlas.coach.memory.v1';
const AC_CHATS_KEY   = 'atlas.chats.v1';

function acLoadProfile() {
  try { return JSON.parse(localStorage.getItem(AC_PROFILE_KEY) || 'null'); } catch { return null; }
}
function acSaveProfile(p) {
  try { localStorage.setItem(AC_PROFILE_KEY, JSON.stringify({ ...p, updatedAt: Date.now() })); } catch {}
}
function acLoadMemory() {
  try {
    return JSON.parse(localStorage.getItem(AC_MEMORY_KEY) || 'null') ||
      { lesiones: [], evitados: [], notas: [] };
  } catch { return { lesiones: [], evitados: [], notas: [] }; }
}
function acSaveMemory(m) {
  try { localStorage.setItem(AC_MEMORY_KEY, JSON.stringify({ ...m, updatedAt: Date.now() })); } catch {}
}

// ── Rich context builder ──────────────────────────────────────────────────────
function acBuildRichContext(state, profile) {
  const log      = state.log || [];
  const sessions = state.sessions || {};
  const now      = Date.now();
  const weekAgo  = now - 7  * 86400000;
  const monthAgo = now - 30 * 86400000;

  const weekSessions  = log.filter(s => s.dateTs > weekAgo);
  const monthSessions = log.filter(s => s.dateTs > monthAgo);

  const daysSinceLast = log[0]?.dateTs
    ? Math.floor((now - log[0].dateTs) / 86400000)
    : 99;

  // Volume per muscle this week
  const weekMuscleVol = {};
  weekSessions.forEach(s => {
    (s.exercises || []).forEach(ex => {
      (ex.muscles || []).forEach(m => {
        const k = m.toLowerCase();
        weekMuscleVol[k] = (weekMuscleVol[k] || 0) + (ex.sets?.length || 1);
      });
    });
  });

  const sumVol = re => Object.entries(weekMuscleVol)
    .reduce((t, [k, v]) => t + (re.test(k) ? v : 0), 0);

  const pushVol = sumVol(/pectoral|tr[íi]ceps|deltoides ant/);
  const pullVol = sumVol(/dorsal|b[íi]ceps|romboides|braquial|trapecio medio/);
  const legVol  = sumVol(/cu[áa]driceps|isquios|gl[úu]teos|gemelo/);
  const coreVol = sumVol(/core|transverso|oblicuo|recto abdominal/);
  const pushPullRatio = pullVol > 0 ? pushVol / pullVol : pushVol > 0 ? 99 : 1;

  // Load progression: track max kg per exercise across last 8 sessions
  const recentLog = log.slice(0, 8);
  const exerciseKgHistory = {};
  recentLog.forEach(s => {
    (s.exercises || []).forEach(ex => {
      const kgs = (ex.sets || []).map(st => parseFloat(st.kg) || 0).filter(k => k > 0);
      if (kgs.length === 0) return;
      const maxKg = Math.max(...kgs);
      if (!exerciseKgHistory[ex.name]) exerciseKgHistory[ex.name] = [];
      exerciseKgHistory[ex.name].push(maxKg);
    });
  });

  // Detect plateaus (same max kg in last 3+ consecutive appearances)
  const plateaus = [];
  Object.entries(exerciseKgHistory).forEach(([name, kgs]) => {
    if (kgs.length >= 3) {
      const last3 = kgs.slice(0, 3);
      if (last3.every(k => k === last3[0]) && last3[0] > 0) {
        plateaus.push({ name, kg: last3[0], sessions: last3.length });
      }
    }
  });

  // Low volume groups
  const lowVolGroups = [];
  if (pushVol > 0 && pullVol === 0) lowVolGroups.push('tracción');
  else if (pushPullRatio > 1.5 && pushVol > 3) lowVolGroups.push('espalda');
  if (legVol < 6 && monthSessions.length > 4 && weekSessions.length > 1) lowVolGroups.push('piernas');
  if (coreVol === 0 && weekSessions.length > 1) lowVolGroups.push('core');

  // Fatigue
  const totalSetsWeek = weekSessions.reduce((t, s) =>
    t + (s.exercises || []).reduce((ts, ex) => ts + (ex.sets?.length || 1), 0), 0);
  const avgSetsPerSess = weekSessions.length > 0 ? totalSetsWeek / weekSessions.length : 0;
  const fatigueLevel = (totalSetsWeek > 60 || avgSetsPerSess > 22) ? 'high'
    : totalSetsWeek > 30 ? 'moderate' : 'low';

  // Adherence
  const targetDays = profile?.dias || 3;
  const adherenceRate = weekSessions.length / targetDays;

  // Most trained exercise
  const exCount = {};
  log.slice(0, 12).forEach(s => {
    (s.exercises || []).forEach(ex => { exCount[ex.name] = (exCount[ex.name] || 0) + 1; });
  });
  const mostTrained = Object.entries(exCount).sort((a, b) => b[1] - a[1])[0]?.[0] || null;

  return {
    log, sessions,
    totalSessions: log.length,
    daysSinceLast,
    weekSessions: weekSessions.length,
    monthSessions: monthSessions.length,
    pushVol, pullVol, legVol, coreVol, pushPullRatio,
    weekMuscleVol, exerciseKgHistory,
    plateaus, lowVolGroups,
    fatigueLevel, totalSetsWeek, avgSetsPerSess,
    adherenceRate, targetDays,
    mostTrained,
    streak: sessions.streak || 0,
    completed: sessions.completed || 0,
  };
}

// ── Intent + param extraction ─────────────────────────────────────────────────
function acDetectIntent(text) {
  const t = text.toLowerCase();
  if (/hazme|g[eé]nera|crea|dame.*rutina|rutina.*para|plan.*para|d[íi]a de|quiero.*entrena|qu[eé] hago hoy/.test(t)) return 'routine';
  if (/quiero.*trabajar|mejorar.*pecho|mejorar.*espalda|mejorar.*pierna|foco en/.test(t)) return 'routine';
  if (/analiza|an[aá]lisis|c[oó]mo.*voy|qu[eé] tal.*entrena|revisar?|mi historial|mi progreso/.test(t)) return 'analysis';
  if (/me duele|me molesta|tengo.*dolor|lesi[oó]n|lastim|dolor en|molestia en/.test(t)) return 'injury';
  if (/estancado|plateau|no progres|no avanzo|mismo peso|sin cambios/.test(t)) return 'plateau';
  if (/cu[aá]ntas series|volumen|frecuencia|mejor.*frecuencia|fallo muscular|rir|rpe/.test(t)) return 'programming';
  if (/recupera|descans|hrv|fatiga|sobreentren|puedo.*entrenar|debo descansar|deload/.test(t)) return 'recovery';
  if (/perfil|mi.*objetivo|mi.*nivel|cambiar.*objetivo|actualiz.*perfil/.test(t)) return 'profile';
  if (/^(hola|hey|buenas|buenos|qu[eé] hay|ola)/.test(t)) return 'greeting';
  return 'general';
}

function acExtractParams(text) {
  const t = text.toLowerCase();
  const p = {};
  if (/mancuerna/.test(t)) p.equipment = 'mancuernas';
  else if (/en casa|sin.*gym|bodyweight|peso corporal/.test(t)) p.equipment = 'casa';
  const timeM = t.match(/(\d+)\s*min/);
  if (timeM) p.tiempo = parseInt(timeM[1]);
  if (/pecho|push|empuje/.test(t)) p.target = 'push';
  else if (/espalda|pull|tracci[oó]n|dorsal/.test(t)) p.target = 'pull';
  else if (/pierna|cuadricep|sentadilla/.test(t)) p.target = 'legs';
  else if (/brazo|b[íi]cep|tr[íi]cep/.test(t)) p.target = 'arms';
  else if (/hombro/.test(t)) p.target = 'shoulders';
  else if (/full|completo|todo/.test(t)) p.target = 'full';
  if (/ppl|push.*pull.*leg/.test(t)) p.split = 'ppl';
  else if (/upper.*lower|superior.*inferior/.test(t)) p.split = 'upper_lower';
  else if (/full.?body|cuerpo entero/.test(t)) p.split = 'fullbody';
  if (/fuerza|strength/.test(t)) p.goal = 'fuerza';
  else if (/hipertrofia|ganar m[uú]sculo/.test(t)) p.goal = 'hipertrofia';
  else if (/recomp|perder|definir/.test(t)) p.goal = 'recomp';
  const diasM = t.match(/(\d)\s*d[íi]a/);
  if (diasM) p.dias = parseInt(diasM[1]);
  return p;
}

// ── Detailed routine builder ──────────────────────────────────────────────────
function acBuildDetailedRoutine(splitKey, goal, level, tiempo, allExs) {
  const byGroup = {};
  allExs.forEach(ex => {
    const g = acExGroup(ex);
    if (!byGroup[g]) byGroup[g] = [];
    byGroup[g].push(ex);
  });

  const scheme = {
    hipertrofia: { sets: 3, setsComp: 4, reps: '8-12', rir: 2, rest: '90-120s' },
    fuerza:      { sets: 4, setsComp: 5, reps: '3-6',  rir: 1, rest: '3-5 min' },
    recomp:      { sets: 3, setsComp: 4, reps: '10-15', rir: 2, rest: '60-90s' },
    rendimiento: { sets: 4, setsComp: 5, reps: '4-8',  rir: 1, rest: '2-3 min' },
  }[goal] || { sets: 3, setsComp: 4, reps: '8-12', rir: 2, rest: '90s' };

  function pick(group, n, isCompound) {
    return (byGroup[group] || []).slice(0, n).map((ex, i) => {
      const setsN = isCompound && i === 0 ? scheme.setsComp : scheme.sets;
      return {
        id: ex.id,
        name: ex.name,
        muscles: { primary: (ex.muscles?.primary || []).slice(0, 2), secondary: [] },
        pattern: ex.pattern,
        sets: Array.from({ length: setsN }, () => ({ kg: '', reps: scheme.reps.split('-')[0] })),
        setsCount: setsN,
        repsRange: scheme.reps,
        rir: i === 0 ? scheme.rir : scheme.rir + 1,
        rest: isCompound && i === 0 ? scheme.rest : '60-90s',
      };
    });
  }

  const configs = {
    push:         () => [{ name:'Push — Empuje', exs: [...pick('pecho',2,true), ...pick('hombro',1,false), ...pick('triceps',1,false)] }],
    pull:         () => [{ name:'Pull — Tracción', exs: [...pick('espalda',2,true), ...pick('biceps',2,false)] }],
    legs:         () => [{ name:'Legs — Piernas', exs: [...pick('piernas',2,true), ...pick('gluteos',1,false), ...pick('core',2,false)] }],
    arms:         () => [{ name:'Brazos', exs: [...pick('biceps',2,false), ...pick('triceps',2,false)] }],
    shoulders:    () => [{ name:'Hombros', exs: [...pick('hombro',3,false)] }],
    fullbody:     () => [{ name:'Full Body', exs: [...pick('piernas',1,true), ...pick('pecho',1,true), ...pick('espalda',1,true), ...pick('hombro',1,false), ...pick('core',1,false)] }],
    ppl:          () => [
      { name:'Push — Empuje', exs: [...pick('pecho',2,true), ...pick('hombro',1,false), ...pick('triceps',1,false)] },
      { name:'Pull — Tracción', exs: [...pick('espalda',2,true), ...pick('biceps',2,false)] },
      { name:'Legs — Piernas', exs: [...pick('piernas',2,true), ...pick('gluteos',1,false), ...pick('core',1,false)] },
    ],
    upper_lower:  () => [
      { name:'Upper — Tren superior', exs: [...pick('pecho',2,true), ...pick('espalda',2,true), ...pick('hombro',1,false)] },
      { name:'Lower — Tren inferior', exs: [...pick('piernas',2,true), ...pick('gluteos',1,false), ...pick('core',2,false)] },
    ],
  };

  const builder = configs[splitKey] || configs.fullbody;
  return builder().map(s => {
    const exercises = s.exs.filter(e => e && e.id);
    const totalSets = exercises.reduce((t, e) => t + (e.setsCount ?? (Array.isArray(e.sets) ? e.sets.length : e.sets) ?? 3), 0);
    return {
      name: s.name,
      exercises,
      totalSets,
      duration: Math.round(5 + totalSets * 2.8),
      muscles: [...new Set(exercises.flatMap(e => e.muscles?.primary?.slice(0, 1) || []))],
    };
  }).filter(s => s.exercises.length > 0);
}

// ── Response generators ───────────────────────────────────────────────────────
function acResponseGreeting(ctx, profile, memory) {
  if (ctx.totalSessions === 0) {
    return profile
      ? { type:'text', text:`Hola. Perfil cargado — ${profile.objetivo}, nivel ${profile.nivel}, ${profile.dias} días/sem. No tienes sesiones registradas aún. ¿Empezamos con un plan de entrenamiento?` }
      : { type:'text', text:`Hola. Soy Atlas Coach. Para darte recomendaciones personalizadas configura tu perfil (panel inferior izquierdo). ¿Cuál es tu objetivo principal?` };
  }
  const parts = [];
  if (ctx.daysSinceLast === 0) parts.push('Entrenaste hoy.');
  else if (ctx.daysSinceLast === 1) parts.push('Entrenaste ayer.');
  else if (ctx.daysSinceLast < 99) parts.push(`Llevas ${ctx.daysSinceLast} días sin entrenar.`);
  if (ctx.streak >= 3) parts.push(`${ctx.streak} días de racha.`);
  if (ctx.pushPullRatio > 1.5 && ctx.pushVol > 3) parts.push(`Esta semana tienes más empuje que tracción (${ctx.pushVol} vs ${ctx.pullVol} series).`);
  else if (ctx.plateaus.length > 0) parts.push(`Hay un posible plateau en ${ctx.plateaus[0].name}.`);
  else if (ctx.lowVolGroups.length > 0) parts.push(`${ctx.lowVolGroups[0]} con poco volumen esta semana.`);
  parts.push('¿En qué te ayudo?');
  return { type:'text', text: parts.join(' ') };
}

function acResponseRoutine(params, ctx, profile, memory, allExs) {
  const goal  = params.goal  || profile?.objetivo || 'hipertrofia';
  const tiempo = params.tiempo || profile?.tiempo || 60;
  const level = profile?.nivel || 'intermedio';

  let splitKey = params.split || null;
  if (!splitKey) {
    if (params.target === 'push') splitKey = 'push';
    else if (params.target === 'pull') splitKey = 'pull';
    else if (params.target === 'legs') splitKey = 'legs';
    else if (params.target === 'arms') splitKey = 'arms';
    else if (params.target === 'shoulders') splitKey = 'shoulders';
    else if (ctx.targetDays >= 4) splitKey = 'upper_lower';
    else if (ctx.targetDays >= 3) splitKey = 'ppl';
    else splitKey = 'fullbody';
  }

  const sessions = acBuildDetailedRoutine(splitKey, goal, level, tiempo, allExs);
  if (!sessions.length || sessions.every(s => !s.exercises.length)) {
    return { type:'text', text:'No pude armar la rutina con los ejercicios disponibles. Prueba con otro tipo de split.' };
  }

  // Context-aware intro
  let intro = '';
  const avoided = memory?.evitados || [];
  if (ctx.daysSinceLast > 6) {
    intro = `Llevas ${ctx.daysSinceLast} días sin entrenar. Aquí tienes la sesión — empieza en el 70–80% de tus cargas habituales:`;
  } else if (ctx.pushPullRatio > 1.5 && !['pull','legs'].includes(splitKey)) {
    intro = `Tu tracción está por debajo de tu empuje esta semana. Prioriza espalda pronto. Aquí tienes la sesión:`;
  } else if (ctx.plateaus.length > 0 && splitKey === 'fullbody') {
    intro = `Noto plateau en ${ctx.plateaus[0].name}. Hoy haz los mismos ejercicios pero intenta superar los ${ctx.plateaus[0].kg} kg aunque sea en una sola serie:`;
  } else {
    const intros = {
      push:'Rutina de empuje — pecho, hombros y tríceps:',
      pull:'Rutina de tracción — espalda y bíceps:',
      legs:'Rutina de piernas y glúteos:',
      fullbody:`Full Body para ${goal} — ${tiempo} min:`,
      ppl:`Plan Push/Pull/Legs — ${sessions.length} sesiones:`,
      upper_lower:'Plan Upper/Lower — 2 sesiones por semana:',
      arms:'Sesión de brazos:',
      shoulders:'Sesión de hombros:',
    };
    intro = intros[splitKey] || 'Aquí tienes la rutina:';
  }

  return {
    type: 'routine',
    text: intro,
    sessions,
    builderPayload: sessions[0]?.exercises || [],
  };
}

function acResponseAnalysis(ctx, profile) {
  if (ctx.totalSessions === 0) {
    return { type:'text', text:'No tienes sesiones registradas. Guarda tu primera rutina en el Builder y podré analizar tu entrenamiento con datos reales.' };
  }

  const issues = [];

  // Push/pull balance
  if (ctx.pushVol > 0 && ctx.pullVol === 0) {
    issues.push({ sev:'warning', icon:'⊘', title:'Sin tracción esta semana', detail:`Has hecho ${ctx.pushVol} series de empuje pero 0 de tracción. Esto acumula tensión anterior en el manguito rotador.`, rec:'Añade remo o jalón a tu próxima sesión antes de volver a entrenar pecho.' });
  } else if (ctx.pushPullRatio > 1.5 && ctx.pushVol > 3) {
    issues.push({ sev:'warning', icon:'⊘', title:`Desequilibrio push/pull (${ctx.pushVol}:${ctx.pullVol})`, detail:`Ratio actual ${ctx.pushPullRatio.toFixed(1)}:1. El objetivo es 1:1 o incluso 1:1.2 en favor de la tracción para proteger los hombros.`, rec:'En tu próxima sesión prioriza espalda antes de pecho.' });
  } else if (ctx.pushVol > 0 && ctx.pullVol > 0) {
    issues.push({ sev:'good', icon:'✓', title:`Equilibrio push/pull correcto (${ctx.pushVol}:${ctx.pullVol})`, detail:'Buen ratio entre ejercicios de empuje y tracción. Sigue así.', rec:null });
  }

  // Plateau
  if (ctx.plateaus.length > 0) {
    const p = ctx.plateaus[0];
    issues.push({ sev:'info', icon:'ℹ', title:`Plateau detectado: ${p.name}`, detail:`${p.sessions} sesiones consecutivas con ${p.kg} kg sin progresión. Puede ser fatiga acumulada o que el ejercicio ya no es el estímulo óptimo.`, rec:'Prueba reducir el RIR 1 punto esta semana, o cambia a una variación del mismo patrón.' });
  }

  // Rest/absence
  if (ctx.daysSinceLast > 7) {
    issues.push({ sev:'info', icon:'ℹ', title:`${ctx.daysSinceLast} días sin entrenar`, detail: ctx.daysSinceLast > 14 ? 'Más de 2 semanas. El volumen muscular se mantiene bien hasta la semana 3, pero el rendimiento neuronal cae antes.' : 'Una semana de descanso puede ser un deload involuntario — eso no es malo.', rec: ctx.daysSinceLast > 12 ? 'Vuelve con un 30–40% menos de volumen en la primera sesión.' : 'Cuando retomes, empieza en el 80% de tus cargas habituales.' });
  }

  // Streak
  if (ctx.streak >= 4) {
    issues.push({ sev:'good', icon:'✓', title:`${ctx.streak} días de racha activa`, detail:'La constancia es el factor número uno del progreso a largo plazo. Es más importante que cualquier técnica avanzada.', rec:null });
  }

  // Low volume
  if (ctx.lowVolGroups.length > 0) {
    issues.push({ sev:'warning', icon:'⚠', title:`Volumen bajo en: ${ctx.lowVolGroups.join(', ')}`, detail:`Para mantener el estímulo de crecimiento, estos grupos necesitan al menos 8–10 series semanales repartidas en 2 sesiones.`, rec:`Añade 2–3 series específicas de ${ctx.lowVolGroups[0]} en tu próxima sesión.` });
  }

  // Adherence
  if (ctx.adherenceRate < 0.65 && ctx.totalSessions > 5) {
    issues.push({ sev:'info', icon:'ℹ', title:`Adherencia: ${ctx.weekSessions}/${ctx.targetDays} días esta semana`, detail:'Estar por debajo del objetivo no es malo de forma puntual, pero si se repite puede frenar el progreso esperado.', rec:'Considera reducir el objetivo semanal a algo sostenible. 3 días consistentes > 5 días irregulares.' });
  }

  // Fatigue
  if (ctx.fatigueLevel === 'high') {
    issues.push({ sev:'warning', icon:'⚠', title:'Volumen semanal muy alto', detail:`${ctx.totalSetsWeek} series esta semana (media de ${ctx.avgSetsPerSess.toFixed(1)}/sesión). Pasadas las 20–22 series efectivas por sesión la calidad del estímulo cae.`, rec:'Considera un deload: reduce el volumen al 50–60% manteniendo la intensidad.' });
  }

  const warns = issues.filter(i => i.sev === 'warning');
  const summary = warns.length > 0
    ? `He revisado ${Math.min(ctx.totalSessions, 10)} sesiones. ${warns.length} punto${warns.length > 1 ? 's' : ''} que deberías corregir.`
    : `He revisado ${Math.min(ctx.totalSessions, 10)} sesiones. Tu entrenamiento va bien, con algunos ajustes menores.`;

  return {
    type: 'analysis',
    summary,
    issues,
    stats: { sessions: ctx.totalSessions, week: ctx.weekSessions, push: ctx.pushVol, pull: ctx.pullVol, streak: ctx.streak, fatigue: ctx.fatigueLevel },
  };
}

function acResponseInjury(text, memory) {
  const t = text.toLowerCase();
  const parts = ['hombro','rodilla','lumbar','espalda baja','muñeca','codo','tobillo','cadera','cuello','gemelo'];
  const found = parts.filter(p => t.includes(p));

  if (found.length > 0) {
    const mem = acLoadMemory();
    found.forEach(p => { if (!mem.lesiones.includes(p)) mem.lesiones.push(p); });
    acSaveMemory(mem);
  }

  const part = found[0];
  if (!part) {
    return { type:'text', text:'¿Dónde exactamente? Cuéntame si duele durante el movimiento, después, o en reposo — eso cambia completamente el enfoque.' };
  }

  const alts = {
    hombro: 'Evita press militar y cualquier movimiento sobre la cabeza con carga. Alternativas: remo con mancuernas en agarre neutro, jalón al pecho con agarre neutro, press banca con mancuernas en agarre neutro. El press sobre la cabeza puede retomarse después de 1–2 semanas sin dolor.',
    rodilla: 'Reduce el rango de la sentadilla y el leg press. Alternativas: hip thrust, peso muerto rumano, extensiones isométricas a 30°. Evita correr cuesta abajo y bajadas de escaleras rápidas.',
    lumbar: 'Evita peso muerto convencional con fatiga acumulada. Alternativas: peso muerto sumo, hip thrust, sentadilla goblet, plancha y ejercicios de antiextensión. Fortalece el core específicamente.',
    muñeca: 'Evita barras en pronación bajo carga alta. Alternativas: press con mancuernas en agarre neutro, cable en lugar de barra libre, dominadas en agarre neutro. Considera muñequeras de soporte.',
    codo: 'Evita curl de bíceps con carga alta y press con agarre estrecho. Alternativas: curl martillo, press con agarre neutro. La extensión completa del codo bajo carga puede agravar la molestia.',
  };

  const advice = alts[part] || `Para ${part}: reduce la carga un 50% en movimientos que involucren esa zona. Si no mejora en 5–7 días o empeora, consulta a un fisioterapeuta.`;

  return { type:'text', text:`${part.charAt(0).toUpperCase() + part.slice(1)} anotado en tu perfil para futuras recomendaciones.\n\n${advice}`, _memoryUpdated: found.length > 0 };
}

function acResponsePlateau(ctx) {
  if (ctx.plateaus.length > 0) {
    const p = ctx.plateaus[0];
    return { type:'text', text:`Detecto plateau en ${p.name} — llevas al menos ${p.sessions} sesiones en ${p.kg} kg.\n\nLas tres causas más comunes: (1) fatiga acumulada que oculta tu fuerza real, (2) el volumen actual ya no es estímulo suficiente, (3) el ejercicio se ha vuelto demasiado eficiente (necesitas variación).\n\nSolución más rápida: haz un microdeload de 3–5 días, vuelve con el 80% del peso y normalmente la barrera se rompe sola la primera o segunda semana.` };
  }
  return { type:'text', text:'No detecto plateaus claros en tu historial reciente. Si sientes que no avanzas, puede ser que las cargas no estén registradas o que sea un tema de percepción. ¿Qué ejercicio específico sientes que no avanza?' };
}

function acResponseProgramming(text) {
  const t = text.toLowerCase();
  if (/series|volumen/.test(t)) {
    return { type:'text', text:'Para hipertrofia: 10–20 series por músculo por semana repartidas en 2+ sesiones. El MEV (mínimo efectivo) está en 8–10 series. Superar 20 series sin recuperación suficiente puede ser contraproducente. Empieza bajo y sube 1–2 series por semana si toleras la carga.' };
  }
  if (/frecuencia/.test(t)) {
    return { type:'text', text:'Frecuencia 2× por músculo/semana supera a 1× con el mismo volumen total en términos de hipertrofia. Para fuerza, 2–3× da mejores resultados. La frecuencia 1× solo tiene sentido para avanzados en fases de intensificación.' };
  }
  if (/fallo|al fallo/.test(t)) {
    return { type:'text', text:'El fallo muscular no es necesario para el crecimiento. Lo que importa es llegar a RIR 1–3 en las últimas series del ejercicio. Entrenar siempre al fallo acumula más fatiga de la que genera estímulo, especialmente en ejercicios compuestos. Úsalo puntualmente en ejercicios de aislamiento al final de la sesión.' };
  }
  if (/deload/.test(t)) {
    return { type:'text', text:'Señales de que necesitas deload: RPE subiendo para las mismas cargas, sueño peor de lo habitual, pérdida de motivación para entrenar, DOMS persistente entre sesiones. El deload clásico: 1 semana al 50–60% del volumen habitual manteniendo la intensidad (mismo peso, menos series). No hace falta bajar el peso.' };
  }
  return { type:'text', text:'¿Qué aspecto de la programación quieres profundizar? Puedo explicar volumen óptimo, frecuencia, periodización, RIR/RPE, deload o cualquier concepto específico.' };
}

function acResponseRecovery(ctx) {
  if (ctx.fatigueLevel === 'high') {
    return { type:'text', text:`Tu volumen esta semana es alto (${ctx.totalSetsWeek} series, media de ${ctx.avgSetsPerSess.toFixed(0)}/sesión). Si el rendimiento está bajando o el sueño está peor, es una señal clara de fatiga acumulada.\n\nOpciones: (1) deload esta semana — 50% del volumen habitual manteniendo los pesos, (2) eliminar 1 sesión y compensar la semana siguiente, (3) continuar y monitorizar HRV si tienes herramienta.` };
  }
  if (ctx.daysSinceLast > 2) {
    return { type:'text', text:`Llevas ${ctx.daysSinceLast} días descansando. El músculo se mantiene bien hasta 2–3 semanas de parón. Cuando retomes, empieza en el 80% de tus cargas habituales — probablemente lo superarás sin problema.` };
  }
  return { type:'text', text:'Tu fatiga parece moderada o baja esta semana. Los indicadores clave de recuperación insuficiente son: RPE más alto de lo habitual para las mismas cargas, DOMS que no se resuelve entre sesiones, y peor calidad del sueño. Si no aparecen esas señales, puedes continuar con el plan normal.' };
}

// ── Master response generator ─────────────────────────────────────────────────
function acGenerateSmartResponse(userText, state, profile, memory, allExs) {
  const intent = acDetectIntent(userText);
  const params  = acExtractParams(userText);
  const ctx     = acBuildRichContext(state, profile);

  switch (intent) {
    case 'greeting':    return acResponseGreeting(ctx, profile, memory);
    case 'routine':     return acResponseRoutine(params, ctx, profile, memory, allExs);
    case 'analysis':    return acResponseAnalysis(ctx, profile);
    case 'injury':      return acResponseInjury(userText, memory);
    case 'plateau':     return acResponsePlateau(ctx);
    case 'programming': return acResponseProgramming(userText);
    case 'recovery':    return acResponseRecovery(ctx);
    case 'profile':
      return { type:'text', text:'Puedes actualizar tu perfil en el panel inferior del sidebar (objetivo, nivel, días/semana, tiempo y equipamiento). Cuando lo guardes, usaré esos datos para todas mis recomendaciones.' };
    default:
      return { type:'text', text:'Puedo generarte rutinas personalizadas, analizar tu historial, responder preguntas sobre programación, volumen, recuperación o técnica. ¿Qué necesitas?' };
  }
}

// ── Dynamic context chips ─────────────────────────────────────────────────────
function acGetDynamicChips(ctx, profile) {
  const chips = [];
  if (ctx.daysSinceLast > 4 && ctx.daysSinceLast < 99) chips.push(`¿Retomamos hoy?`);
  if (ctx.plateaus.length > 0) chips.push(`Estancado en ${ctx.plateaus[0].name.split(' ')[0]}`);
  if (ctx.pushPullRatio > 1.5) chips.push('Necesito más tracción');
  if (ctx.fatigueLevel === 'high') chips.push('¿Debo hacer deload?');
  if (ctx.totalSessions === 0) chips.push('Hazme un plan para empezar');
  chips.push(`Analiza mi historial`);
  chips.push(`Rutina ${profile?.objetivo || 'para hoy'}`);
  if (!chips.includes('¿Debo hacer deload?')) chips.push('¿Debo hacer deload?');
  return [...new Set(chips)].slice(0, 4);
}

// ── Welcome message ───────────────────────────────────────────────────────────
function acWelcomeMessage(state, profile, memory) {
  const ctx = acBuildRichContext(state, profile);
  if (ctx.totalSessions === 0) {
    if (!profile) return 'Hola. Configura tu perfil en el panel inferior del sidebar para que pueda darte recomendaciones personalizadas. ¿Con qué empezamos?';
    return `Hola. Perfil cargado — ${profile.objetivo}, nivel ${profile.nivel}. Sin sesiones registradas aún. ¿Quieres que genere tu primer plan de entrenamiento?`;
  }
  const parts = [];
  if (ctx.daysSinceLast === 0) parts.push('Entrenaste hoy.');
  else if (ctx.daysSinceLast === 1) parts.push('Entrenaste ayer.');
  else if (ctx.daysSinceLast < 99) parts.push(`Llevas ${ctx.daysSinceLast} días sin entrenar.`);
  if (ctx.streak >= 3) parts.push(`${ctx.streak} días de racha.`);
  if (ctx.pushPullRatio > 1.5 && ctx.pushVol > 3) parts.push(`Esta semana más empuje que tracción (${ctx.pushVol}:${ctx.pullVol}).`);
  else if (ctx.plateaus.length > 0) parts.push(`Posible plateau en ${ctx.plateaus[0].name}.`);
  else if (ctx.lowVolGroups.length > 0) parts.push(`${ctx.lowVolGroups[0]} con poco volumen esta semana.`);
  else if (ctx.fatigueLevel === 'high') parts.push('Volumen semanal alto — considera un deload.');
  parts.push('¿En qué te ayudo?');
  if (memory?.lesiones?.length > 0) parts.splice(-1, 0, `Recuerdo que tienes molestias en ${memory.lesiones.slice(0,2).join(' y ')}.`);
  return parts.join(' ');
}

// ── UI Components ─────────────────────────────────────────────────────────────

function AcTypingIndicator() {
  return (
    <div style={{ display:'flex', alignItems:'flex-end', gap:8, marginBottom:20 }}>
      <div style={{ width:28, height:28, borderRadius:8, flexShrink:0, background:'rgba(59,130,246,0.12)', border:'1px solid rgba(59,130,246,0.22)', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'ui-monospace', fontSize:11, color:'#93C5FD', fontWeight:700 }}>A</div>
      <div style={{ padding:'12px 16px', borderRadius:'4px 18px 18px 18px', background:AC.card, border:`1px solid ${AC.border}`, display:'flex', gap:5, alignItems:'center' }}>
        {[0,1,2].map(i => <div key={i} style={{ width:7, height:7, borderRadius:'50%', background:'rgba(232,237,248,0.35)', animation:'pulse 1.4s infinite', animationDelay:`${i*0.22}s` }} />)}
      </div>
    </div>
  );
}

function AcRoutineCard({ session, onSendToBuilder }) {
  const [open, setOpen] = React.useState(true);
  return (
    <div style={{ marginTop:10, borderRadius:14, overflow:'hidden', border:`1px solid ${AC.border}`, background:AC.card2, animation:'fadeIn .25s ease' }}>
      <div onClick={() => setOpen(o=>!o)} style={{ padding:'12px 16px', display:'flex', justifyContent:'space-between', alignItems:'center', background:'rgba(59,130,246,0.07)', borderBottom:`1px solid ${AC.border}`, cursor:'pointer' }}>
        <div>
          <div style={{ fontFamily:'Inter,system-ui', fontSize:13, fontWeight:700, color:'#93C5FD' }}>{session.name}</div>
          <div style={{ fontFamily:'Inter,system-ui', fontSize:11, color:AC.muted, marginTop:2 }}>
            {session.exercises.length} ejercicios · {session.totalSets} series · ~{session.duration} min
          </div>
        </div>
        <span style={{ color:AC.muted, fontSize:11, transform:open?'rotate(180deg)':'none', transition:'transform .2s' }}>↓</span>
      </div>
      {open && (
        <>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 44px 60px 40px 60px', padding:'7px 16px', background:'rgba(255,255,255,0.02)', borderBottom:`1px solid rgba(255,255,255,0.04)` }}>
            {['EJERCICIO','SERIES','REPS','RIR','DESCANSO'].map((h, i) => (
              <div key={h} style={{ fontFamily:'ui-monospace,Menlo,monospace', fontSize:8, fontWeight:700, color:AC.muted, letterSpacing:0.5, textAlign:i>0?'center':'left' }}>{h}</div>
            ))}
          </div>
          {session.exercises.map((ex, ei) => (
            <div key={ex.id||ei} style={{ display:'grid', gridTemplateColumns:'1fr 44px 60px 40px 60px', padding:'10px 16px', alignItems:'center', borderTop:`1px solid rgba(255,255,255,0.03)`, background: ei%2===0 ? AC.card : AC.card2 }}>
              <div>
                <div style={{ fontFamily:'Inter,system-ui', fontSize:12, fontWeight:600, color:AC.text, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{ex.name}</div>
                <div style={{ fontFamily:'Inter,system-ui', fontSize:10, color:AC.muted, marginTop:1 }}>{ex.muscles?.primary?.[0]||''}</div>
              </div>
              <div style={{ fontFamily:'ui-monospace,Menlo,monospace', fontSize:14, fontWeight:700, color:AC.text, textAlign:'center' }}>{ex.setsCount ?? (Array.isArray(ex.sets) ? ex.sets.length : ex.sets) ?? 3}</div>
              <div style={{ fontFamily:'ui-monospace,Menlo,monospace', fontSize:12, color:AC.sub, textAlign:'center' }}>{ex.repsRange||'8-12'}</div>
              <div style={{ fontFamily:'ui-monospace,Menlo,monospace', fontSize:12, color:'#93C5FD', textAlign:'center', fontWeight:700 }}>RIR{ex.rir||2}</div>
              <div style={{ fontFamily:'ui-monospace,Menlo,monospace', fontSize:10, color:AC.muted, textAlign:'center' }}>{ex.rest||'90s'}</div>
            </div>
          ))}
          <div style={{ padding:'12px 16px', borderTop:`1px solid rgba(255,255,255,0.05)` }}>
            <button onClick={() => onSendToBuilder(session.exercises)} style={{ width:'100%', padding:'11px 16px', borderRadius:10, border:'none', cursor:'pointer', background:AC.blue, color:'#fff', fontFamily:'Inter,system-ui', fontSize:13, fontWeight:700, boxShadow:'0 6px 20px -6px rgba(59,130,246,0.5)' }}>
              Enviar al Builder →
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function AcAnalysisCard({ content }) {
  const sevColor = { warning:'#EF4444', good:'#22C55E', info:'#3B82F6' };
  const { stats } = content;
  return (
    <div style={{ borderRadius:'4px 18px 18px 18px', overflow:'hidden', border:`1px solid ${AC.border}`, animation:'fadeIn .25s ease' }}>
      <div style={{ padding:'14px 18px', background:'rgba(59,130,246,0.07)', borderBottom:`1px solid ${AC.border}` }}>
        <div style={{ fontFamily:'ui-monospace,Menlo,monospace', fontSize:9, fontWeight:700, color:'#93C5FD', letterSpacing:1.2, marginBottom:7 }}>ANÁLISIS DE ENTRENAMIENTO</div>
        <p style={{ fontFamily:'Inter,system-ui', fontSize:14, color:AC.text, margin:'0 0 10px', lineHeight:1.45 }}>{content.summary}</p>
        {stats && (
          <div style={{ display:'flex', gap:14, flexWrap:'wrap' }}>
            {[
              { label:'Sesiones', val:stats.sessions },
              { label:'Esta semana', val:stats.week },
              { label:'Racha', val:`${stats.streak}d` },
              stats.push > 0 && { label:'Push:Pull', val:`${stats.push}:${stats.pull}` },
            ].filter(Boolean).map(s => (
              <div key={s.label}>
                <div style={{ fontFamily:'ui-monospace,Menlo,monospace', fontSize:8, color:AC.muted, fontWeight:700, letterSpacing:0.6 }}>{s.label}</div>
                <div style={{ fontFamily:'ui-monospace,Menlo,monospace', fontSize:14, fontWeight:800, color:AC.text }}>{s.val}</div>
              </div>
            ))}
          </div>
        )}
      </div>
      {content.issues.map((issue, i) => (
        <div key={i} style={{ padding:'14px 18px', borderTop:i>0?`1px solid rgba(255,255,255,0.04)`:undefined, background: i%2===0 ? AC.card : AC.card2 }}>
          <div style={{ display:'flex', alignItems:'flex-start', gap:10 }}>
            <span style={{ fontFamily:'ui-monospace,Menlo,monospace', fontSize:13, color:sevColor[issue.sev]||AC.blue, flexShrink:0, marginTop:1, fontWeight:700 }}>{issue.icon}</span>
            <div style={{ flex:1 }}>
              <div style={{ fontFamily:'Inter,system-ui', fontSize:13, fontWeight:700, color:AC.text, marginBottom:4 }}>{issue.title}</div>
              <div style={{ fontFamily:'Inter,system-ui', fontSize:12, color:AC.sub, lineHeight:1.55, marginBottom: issue.rec ? 7:0 }}>{issue.detail}</div>
              {issue.rec && <div style={{ fontFamily:'Inter,system-ui', fontSize:11, color:sevColor[issue.sev]||AC.blue, fontWeight:600 }}>→ {issue.rec}</div>}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function AcCoachMessage({ content, onSendToBuilder }) {
  const bubble = { padding:'13px 18px', borderRadius:'4px 18px 18px 18px', background:AC.card, border:`1px solid ${AC.border}`, fontFamily:'Inter,system-ui', fontSize:14, lineHeight:1.65, color:AC.text, whiteSpace:'pre-line' };
  if (content.type === 'text') return <div style={bubble}>{content.text}</div>;
  if (content.type === 'routine') return (
    <div>
      <div style={bubble}>{content.text}</div>
      {(content.sessions || []).map((session, si) => (
        <AcRoutineCard key={si} session={session} onSendToBuilder={onSendToBuilder} />
      ))}
    </div>
  );
  if (content.type === 'analysis') return <AcAnalysisCard content={content} />;
  return <div style={bubble}>{String(content)}</div>;
}

function AcMessageBubble({ msg, onSendToBuilder }) {
  const isUser = msg.role === 'user';
  return (
    <div style={{ display:'flex', justifyContent:isUser?'flex-end':'flex-start', alignItems:'flex-end', gap:8, marginBottom:20, animation:'fadeIn .22s ease' }}>
      {!isUser && (
        <div style={{ width:28, height:28, borderRadius:8, flexShrink:0, background:'rgba(59,130,246,0.12)', border:'1px solid rgba(59,130,246,0.22)', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'ui-monospace', fontSize:11, color:'#93C5FD', fontWeight:700, marginBottom:18 }}>A</div>
      )}
      <div style={{ maxWidth:'76%', minWidth:0 }}>
        {isUser
          ? <div style={{ padding:'11px 16px', borderRadius:'18px 18px 4px 18px', background:'#2563EB', color:'#fff', fontFamily:'Inter,system-ui', fontSize:14, lineHeight:1.55, wordBreak:'break-word' }}>{msg.content}</div>
          : <AcCoachMessage content={msg.content} onSendToBuilder={onSendToBuilder} />
        }
        <div style={{ fontFamily:'Inter,system-ui', fontSize:10, color:'rgba(232,237,248,0.22)', marginTop:5, textAlign:isUser?'right':'left' }}>
          {new Date(msg.ts).toLocaleTimeString('es', { hour:'2-digit', minute:'2-digit' })}
        </div>
      </div>
    </div>
  );
}

// ── Profile panel (sidebar) ───────────────────────────────────────────────────
function AcProfilePanel({ profile, onSave }) {
  const [open, setOpen]   = React.useState(!profile);
  const [draft, setDraft] = React.useState(profile || { objetivo:'hipertrofia', nivel:'intermedio', dias:3, tiempo:60, equipamiento:'gimnasio' });
  const upd = (k, v) => setDraft(p => ({ ...p, [k]: v }));
  const OBJS  = [['hipertrofia','Ganar músculo'],['fuerza','Fuerza'],['recomp','Recomp'],['rendimiento','Rendimiento']];
  const NIVS  = [['principiante','Principiante'],['intermedio','Intermedio'],['avanzado','Avanzado']];
  const EQUIPS = [['gimnasio','Gimnasio'],['mancuernas','Mancuernas'],['casa','En casa']];
  return (
    <div style={{ borderTop:`1px solid ${AC.border}`, flexShrink:0 }}>
      <button onClick={() => setOpen(o=>!o)} style={{ width:'100%', padding:'11px 14px', border:'none', cursor:'pointer', background:'transparent', display:'flex', alignItems:'center', gap:8, textAlign:'left' }}>
        <div style={{ width:7, height:7, borderRadius:'50%', background: profile ? '#22C55E' : '#F59E0B', flexShrink:0 }} />
        <div style={{ flex:1, overflow:'hidden' }}>
          <div style={{ fontFamily:'Inter,system-ui', fontSize:11, fontWeight:600, color:AC.sub, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
            {profile ? `${profile.objetivo} · ${profile.nivel} · ${profile.dias}d/sem` : 'Configura tu perfil →'}
          </div>
        </div>
        <span style={{ color:AC.muted, fontSize:10, flexShrink:0, transform:open?'rotate(180deg)':'none', transition:'.2s' }}>↑</span>
      </button>
      {open && (
        <div style={{ padding:'0 12px 14px', display:'flex', flexDirection:'column', gap:12 }}>
          {[['OBJETIVO', OBJS, 'objetivo'], ['NIVEL', NIVS, 'nivel'], ['EQUIPAMIENTO', EQUIPS, 'equipamiento']].map(([lbl, opts, key]) => (
            <div key={key}>
              <div style={{ fontFamily:'ui-monospace,Menlo,monospace', fontSize:8, fontWeight:700, color:AC.muted, letterSpacing:1, marginBottom:6 }}>{lbl}</div>
              <div style={{ display:'flex', flexWrap:'wrap', gap:4 }}>
                {opts.map(([v, l]) => (
                  <button key={v} onClick={() => upd(key, v)} style={{ padding:'4px 10px', borderRadius:6, border:'none', cursor:'pointer', fontFamily:'Inter,system-ui', fontSize:10, fontWeight:600, background: draft[key]===v ? AC.blue : 'rgba(255,255,255,0.07)', color: draft[key]===v ? '#fff' : AC.sub, transition:'all .12s' }}>{l}</button>
                ))}
              </div>
            </div>
          ))}
          <div>
            <div style={{ fontFamily:'ui-monospace,Menlo,monospace', fontSize:8, fontWeight:700, color:AC.muted, letterSpacing:1, marginBottom:6 }}>DÍAS/SEM: {draft.dias}</div>
            <input type="range" min={2} max={6} step={1} value={draft.dias} onChange={e => upd('dias', +e.target.value)} style={{ width:'100%', accentColor:AC.blue }} />
          </div>
          <div>
            <div style={{ fontFamily:'ui-monospace,Menlo,monospace', fontSize:8, fontWeight:700, color:AC.muted, letterSpacing:1, marginBottom:6 }}>MIN/SESIÓN</div>
            <div style={{ display:'flex', gap:4 }}>
              {[45,60,90].map(t => (
                <button key={t} onClick={() => upd('tiempo', t)} style={{ flex:1, padding:'4px 0', borderRadius:6, border:'none', cursor:'pointer', fontFamily:'ui-monospace,Menlo,monospace', fontSize:11, fontWeight:700, background: draft.tiempo===t ? AC.blue : 'rgba(255,255,255,0.07)', color: draft.tiempo===t ? '#fff' : AC.sub }}>{t}m</button>
              ))}
            </div>
          </div>
          <button onClick={() => { acSaveProfile(draft); onSave(draft); setOpen(false); }} style={{ padding:'9px 0', borderRadius:8, border:'none', cursor:'pointer', background:AC.blue, color:'#fff', fontFamily:'Inter,system-ui', fontSize:12, fontWeight:700 }}>
            Guardar perfil
          </button>
        </div>
      )}
    </div>
  );
}

// ── Sidebar ───────────────────────────────────────────────────────────────────
function AcSidebar({ chats, activeChatId, onSelect, onNew, profile, onSaveProfile }) {
  return (
    <aside style={{ width:220, flexShrink:0, background:AC.sidebar, borderRight:`1px solid ${AC.border}`, display:'flex', flexDirection:'column', overflow:'hidden' }}>
      <div style={{ padding:'14px 12px', borderBottom:`1px solid ${AC.border}`, flexShrink:0 }}>
        <div style={{ fontFamily:'ui-monospace,Menlo,monospace', fontSize:9, fontWeight:700, color:AC.muted, letterSpacing:1.4, marginBottom:10 }}>ATLAS COACH</div>
        <button onClick={onNew} style={{ width:'100%', padding:'9px 12px', borderRadius:9, border:'1px solid rgba(59,130,246,0.25)', background:'rgba(59,130,246,0.08)', color:'#93C5FD', fontFamily:'Inter,system-ui', fontSize:12, fontWeight:700, cursor:'pointer', textAlign:'left', display:'flex', alignItems:'center', gap:7, transition:'background .12s' }}
          onMouseEnter={e => e.currentTarget.style.background='rgba(59,130,246,0.16)'}
          onMouseLeave={e => e.currentTarget.style.background='rgba(59,130,246,0.08)'}>
          <span style={{ fontSize:16, lineHeight:1 }}>+</span> Nuevo chat
        </button>
      </div>
      <div style={{ flex:1, overflowY:'auto', padding:'8px 6px' }}>
        {chats.map(chat => {
          const active = chat.id === activeChatId;
          return (
            <button key={chat.id} onClick={() => onSelect(chat.id)} style={{ width:'100%', padding:'9px 10px', borderRadius:8, border:'none', cursor:'pointer', textAlign:'left', marginBottom:2, background: active ? 'rgba(59,130,246,0.12)' : 'transparent', transition:'background .1s' }}
              onMouseEnter={e => { if (!active) e.currentTarget.style.background='rgba(255,255,255,0.04)'; }}
              onMouseLeave={e => { if (!active) e.currentTarget.style.background='transparent'; }}>
              <div style={{ fontFamily:'Inter,system-ui', fontSize:12, fontWeight:600, color: active ? '#93C5FD' : AC.sub, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{chat.title}</div>
              <div style={{ fontFamily:'Inter,system-ui', fontSize:10, color:AC.muted, marginTop:2 }}>{chat.messages.length} mensaje{chat.messages.length!==1?'s':''}</div>
            </button>
          );
        })}
      </div>
      <AcProfilePanel profile={profile} onSave={onSaveProfile} />
    </aside>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
function AtlasCoachSection() {
  const { state } = useStore();
  const { navigate } = useRoute();

  const [profile, setProfile] = React.useState(() => acLoadProfile());
  const [memory,  setMemory]  = React.useState(() => acLoadMemory());
  const [chats,   setChats]   = React.useState(() => {
    try { return JSON.parse(localStorage.getItem(AC_CHATS_KEY) || '[]'); } catch { return []; }
  });
  const [activeChatId, setActiveChatId] = React.useState(null);
  const [input,   setInput]   = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const messagesEndRef = React.useRef(null);
  const inputRef       = React.useRef(null);

  const allExs = React.useMemo(() => {
    try { return ExerciseService.getAll(); } catch { return []; }
  }, []);

  const ctx = React.useMemo(() => acBuildRichContext(state, profile), [state, profile]);
  const chips = React.useMemo(() => acGetDynamicChips(ctx, profile), [ctx, profile]);

  const activeChat = chats.find(c => c.id === activeChatId) || null;
  const messages   = activeChat?.messages || [];

  React.useEffect(() => {
    try {
      localStorage.setItem(AC_CHATS_KEY, JSON.stringify(chats));
    } catch (e) {
      // Quota exceeded — prune oldest messages and retry once
      try {
        const pruned = chats.map(c => ({ ...c, messages: c.messages.slice(-20) })).slice(0, 5);
        localStorage.setItem(AC_CHATS_KEY, JSON.stringify(pruned));
      } catch {}
    }
  }, [chats]);

  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior:'smooth' });
  }, [messages, loading]);

  React.useEffect(() => {
    if (chats.length === 0) startNewChat();
    else setActiveChatId(prev => prev || chats[0].id);
  }, []);

  function startNewChat() {
    const id  = `chat-${Date.now()}`;
    const mem = acLoadMemory();
    const welcome = acWelcomeMessage(state, profile, mem);
    const chat = {
      id, title:'Nueva conversación',
      messages: [{ id:`${id}-init`, role:'coach', content:{ type:'text', text:welcome }, ts:Date.now() }],
      createdAt: Date.now(),
    };
    setChats(prev => [chat, ...prev]);
    setActiveChatId(id);
  }

  function handleSaveProfile(p) {
    setProfile(p);
  }

  function sendMessage() {
    if (!input.trim() || loading || !activeChatId) return;
    const userText = input.trim();
    const chatId   = activeChatId;
    setInput('');

    const userMsg = { id:`msg-${Date.now()}`, role:'user', content:userText, ts:Date.now() };
    setChats(prev => prev.map(c => {
      if (c.id !== chatId) return c;
      const isFirst = c.messages.filter(m => m.role==='user').length === 0;
      return { ...c, title: isFirst ? userText.slice(0,42) : c.title, messages:[...c.messages, userMsg] };
    }));

    setLoading(true);
    const currentMemory = acLoadMemory();
    setTimeout(() => {
      let response;
      try {
        response = acGenerateSmartResponse(userText, state, profile, currentMemory, allExs);
      } catch (err) {
        response = { type:'text', text:'Hubo un error al procesar tu mensaje. Por favor intenta de nuevo.' };
      }
      if (response._memoryUpdated) setMemory(acLoadMemory());
      const coachMsg = { id:`msg-${Date.now()}-c`, role:'coach', content:response, ts:Date.now() };
      setChats(prev => prev.map(c => c.id === chatId ? { ...c, messages:[...c.messages, coachMsg] } : c));
      setLoading(false);
    }, 500 + Math.random() * 400);
  }

  function sendToBuilder(exercises) {
    localStorage.setItem('atlas.pendingWorkout', JSON.stringify(exercises));
    navigate('/builder');
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  }

  const isMobile = window.innerWidth < 680;

  return (
    <section style={{ height:'100vh', paddingTop:64, boxSizing:'border-box', display:'flex', flexDirection:'column', background:AC.page, overflow:'hidden' }}>
      <div style={{ flex:1, display:'flex', overflow:'hidden', minHeight:0 }}>

        {!isMobile && (
          <AcSidebar
            chats={chats}
            activeChatId={activeChatId}
            onSelect={setActiveChatId}
            onNew={startNewChat}
            profile={profile}
            onSaveProfile={handleSaveProfile}
          />
        )}

        <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden', minWidth:0 }}>

          {isMobile && (
            <div style={{ padding:'10px 16px', borderBottom:`1px solid ${AC.border}`, display:'flex', alignItems:'center', gap:10, flexShrink:0 }}>
              <span style={{ fontFamily:'ui-monospace', fontSize:10, fontWeight:700, color:AC.muted, letterSpacing:1.4 }}>ATLAS COACH</span>
              <button onClick={startNewChat} style={{ marginLeft:'auto', padding:'5px 12px', borderRadius:8, border:`1px solid rgba(59,130,246,0.25)`, background:'rgba(59,130,246,0.08)', color:'#93C5FD', fontFamily:'Inter,system-ui', fontSize:11, fontWeight:700, cursor:'pointer' }}>+ Nuevo</button>
            </div>
          )}

          {/* Messages */}
          <div style={{ flex:1, overflowY:'auto', padding: isMobile ? '20px 16px' : '28px 32px', minHeight:0 }}>
            <div style={{ maxWidth:700, margin:'0 auto' }}>
              {messages.map(msg => (
                <AcMessageBubble key={msg.id} msg={msg} onSendToBuilder={sendToBuilder} />
              ))}
              {loading && <AcTypingIndicator />}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Input */}
          <div style={{ padding: isMobile ? '12px 14px' : '14px 28px', borderTop:`1px solid ${AC.border}`, background:AC.input, flexShrink:0 }}>
            <div style={{ maxWidth:700, margin:'0 auto' }}>
              <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginBottom:10 }}>
                {chips.map(chip => (
                  <button key={chip} onClick={() => { setInput(chip); inputRef.current?.focus(); }}
                    style={{ padding:'4px 11px', borderRadius:999, border:`1px solid ${AC.border}`, background:'transparent', color:AC.muted, fontFamily:'Inter,system-ui', fontSize:11, cursor:'pointer', transition:'all .12s' }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor='rgba(59,130,246,0.4)'; e.currentTarget.style.color='#93C5FD'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor=AC.border; e.currentTarget.style.color=AC.muted; }}>
                    {chip}
                  </button>
                ))}
              </div>
              <div style={{ display:'flex', gap:10, alignItems:'flex-end' }}>
                <textarea ref={inputRef} value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleKeyDown}
                  placeholder="Pregúntame cualquier cosa…" rows={1}
                  style={{ flex:1, padding:'11px 15px', borderRadius:14, border:`1px solid ${AC.border}`, background:AC.card, color:AC.text, fontFamily:'Inter,system-ui', fontSize:14, resize:'none', lineHeight:1.5, maxHeight:100, overflowY:'auto' }} />
                <button onClick={sendMessage} disabled={!input.trim() || loading}
                  style={{ padding:'11px 18px', borderRadius:12, border:'none', cursor: input.trim()&&!loading ? 'pointer' : 'default', background: input.trim()&&!loading ? AC.blue : 'rgba(59,130,246,0.18)', color: input.trim()&&!loading ? '#fff' : 'rgba(255,255,255,0.28)', fontFamily:'Inter,system-ui', fontSize:13, fontWeight:700, transition:'all .15s', flexShrink:0 }}>
                  Enviar
                </button>
              </div>
              <div style={{ fontFamily:'Inter,system-ui', fontSize:10, color:'rgba(232,237,248,0.18)', marginTop:7, textAlign:'center' }}>
                Enter para enviar · Shift+Enter para nueva línea
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

Object.assign(window, { AtlasCoachSection });
