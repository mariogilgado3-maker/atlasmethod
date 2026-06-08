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

  // ── Progression engine: per-exercise history and change detection ───────────
  // exHistory[name] → [{dateTs, topKg, topKgReps}] ordered newest first
  const exHistory = {};
  log.slice(0, 10).forEach(s => {
    (s.exercises || []).forEach(ex => {
      const sets = ex.sets || [];
      let topKg = 0, topKgReps = 0;
      sets.forEach(st => {
        const kg = parseFloat(st.kg) || 0;
        const reps = parseInt(st.reps) || parseInt(st.reps?.split('-')?.[0]) || 0;
        if (kg > topKg || (kg === topKg && reps > topKgReps)) { topKg = kg; topKgReps = reps; }
      });
      if (topKg === 0) return;
      if (!exHistory[ex.name]) exHistory[ex.name] = [];
      exHistory[ex.name].push({ dateTs: s.dateTs, topKg, topKgReps });
    });
  });

  // All-time PR per exercise (max kg ever logged)
  const allTimePR = {};
  log.forEach(s => {
    (s.exercises || []).forEach(ex => {
      (ex.sets || []).forEach(st => {
        const kg = parseFloat(st.kg) || 0;
        if (!allTimePR[ex.name] || kg > allTimePR[ex.name]) allTimePR[ex.name] = kg;
      });
    });
  });

  // Compare last two appearances per exercise → progressions and plateaus
  const progressions = [];
  const plateaus     = [];
  // Also keep kgHistory array for backwards compat
  const exerciseKgHistory = {};

  Object.entries(exHistory).forEach(([name, hist]) => {
    exerciseKgHistory[name] = hist.map(h => h.topKg);
    if (hist.length < 2) return;
    const curr = hist[0], prev = hist[1];
    const kgDelta  = curr.topKg  - prev.topKg;
    const repDelta = curr.topKgReps - prev.topKgReps;

    if (kgDelta > 0) {
      // Weight increase → weight PR
      const nextIncrease = curr.topKg < 40 ? 1 : curr.topKg < 80 ? 2.5 : 5;
      progressions.push({
        name, type:'weight', kgDelta, repDelta,
        prev:{ kg:prev.topKg, reps:prev.topKgReps },
        curr:{ kg:curr.topKg, reps:curr.topKgReps },
        isAllTimePR: curr.topKg >= (allTimePR[name] || 0),
        rec: curr.topKgReps < 8
          ? `Trabaja ${curr.topKg}kg hasta llegar a 8 reps antes de subir más.`
          : `Sigue con ${curr.topKg}kg hasta 10-12 reps, luego sube ${nextIncrease}kg.`,
      });
    } else if (kgDelta === 0 && repDelta > 0) {
      // Rep increase at same weight → rep PR
      const nextIncrease = curr.topKg < 40 ? 1 : curr.topKg < 80 ? 2.5 : 5;
      progressions.push({
        name, type:'reps', kgDelta, repDelta,
        prev:{ kg:prev.topKg, reps:prev.topKgReps },
        curr:{ kg:curr.topKg, reps:curr.topKgReps },
        isAllTimePR: false,
        rec: curr.topKgReps >= 12
          ? `Ya llegas a 12 reps — sube ${nextIncrease}kg la próxima sesión.`
          : `Sigue con ${curr.topKg}kg hasta alcanzar 12 reps, luego sube carga.`,
      });
    } else if (kgDelta === 0 && repDelta <= 0 && hist.length >= 3) {
      // Plateau: same or worse for 3+ sessions
      const oldest = hist[2];
      if (oldest.topKg === curr.topKg && Math.abs(oldest.topKgReps - curr.topKgReps) <= 1) {
        plateaus.push({ name, kg:curr.topKg, reps:curr.topKgReps, sessions:hist.length });
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

  // Builder priorities → coach group mapping
  const rawBuilderPriorities = (() => {
    try { return JSON.parse(localStorage.getItem('atlas.priorities') || '{}'); } catch { return {}; }
  })();
  // Map builder muscle IDs to coach group labels
  const BUILDER_TO_GROUP = {
    pecho:       'pecho',
    delt_ant:    'hombro', delt_lat: 'hombro', delt_post: 'hombro',
    dorsal:      'espalda', trapecio: 'espalda',
    biceps:      'biceps',
    triceps:     'triceps',
    cuadriceps:  'piernas', aductores: 'piernas', gemelos: 'piernas', tibial: 'piernas', abductores: 'piernas',
    gluteos:     'gluteos', isquio: 'gluteos',
    core:        'core', oblicuos: 'core', lumbar: 'core', erectores: 'core', antebrazo: 'core',
  };
  // Merge per-group: highest priority state wins (priority > maintain > reducir)
  const PRIORITY_RANK = { priority: 3, maintain: 2, reducir: 1 };
  const builderGroupPriorities = {};
  Object.entries(rawBuilderPriorities).forEach(([id, state]) => {
    if (!state || state === 'off' || state === 'null') return;
    const group = BUILDER_TO_GROUP[id];
    if (!group) return;
    const cur = builderGroupPriorities[group];
    if (!cur || (PRIORITY_RANK[state] || 0) > (PRIORITY_RANK[cur] || 0)) {
      builderGroupPriorities[group] = state;
    }
  });

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
    progressions, plateaus, exHistory, allTimePR,
    builderGroupPriorities,
    rawBuilderPriorities,
    hasBuilderProfile: Object.keys(builderGroupPriorities).length > 0,
  };
}

// ── Intent + param extraction ─────────────────────────────────────────────────
function acDetectIntent(text) {
  const t = text.toLowerCase();
  if (/hazme|g[eé]nera|crea|dame.*rutina|rutina.*para|plan.*para|d[íi]a de|quiero.*entrena|qu[eé] hago hoy/.test(t)) return 'routine';
  if (/quiero.*trabajar|mejorar.*pecho|mejorar.*espalda|mejorar.*pierna|foco en/.test(t)) return 'routine';
  if (/analiza|an[aá]lisis|c[oó]mo.*voy|qu[eé] tal.*entrena|revisar?|mi historial/.test(t)) return 'analysis';
  if (/progres|estoy mejorando|mis avances|mis n[úu]meros|he mejorado|cu[aá]nto he subido|mi progreso/.test(t)) return 'progress';
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
// GROUP_CANONICAL: for each Coach group, which Builder muscle represents it scientifically
const AC_GROUP_CANONICAL = {
  pecho:'pecho', hombro:'delt_lat', espalda:'dorsal',
  biceps:'biceps', triceps:'triceps', piernas:'cuadriceps',
  gluteos:'gluteos', core:'core',
};
// Split frequency: how many sessions per week include each group
const AC_SPLIT_FREQ = { fullbody:3, upper_lower:2, ppl:2, push:1, pull:1, legs:1, arms:1, shoulders:1 };

function acBuildDetailedRoutine(splitKey, goal, level, tiempo, allExs, builderPriorities) {
  const bp = builderPriorities || {};
  const splitFreq = AC_SPLIT_FREQ[splitKey] || 2;

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

  // Returns scientific per-session volume for a group, or null if not in Builder profile
  function groupSci(group) {
    const state = bp[group];
    if (!state || state === 'off') return null;
    const muscleId = AC_GROUP_CANONICAL[group];
    if (!muscleId || !window.AtlasEngine?.SCIENCE) return null;
    const sci = window.AtlasEngine.SCIENCE[muscleId];
    if (!sci) return null;
    const weekly = state === 'priority' ? sci.mav : state === 'maintain' ? sci.mev : Math.round(sci.mev * 0.5);
    const perSession = Math.max(2, Math.round(weekly / splitFreq));
    return { weekly, perSession, state };
  }

  function pick(group, n, isCompound) {
    const sci    = groupSci(group);
    const pState = bp[group];

    let nAdj, setsPerEx;
    if (sci) {
      // Derive exercise count so total session sets ≈ perSession target
      const baseN = Math.max(1, Math.ceil(sci.perSession / (isCompound ? scheme.setsComp : scheme.sets)));
      nAdj    = Math.min(baseN, n + 2);
      // Normalize: distribute perSession sets evenly across exercises
      setsPerEx = Math.max(2, Math.ceil(sci.perSession / Math.max(nAdj, 1)));
    } else {
      nAdj      = pState === 'priority' ? n + 1 : pState === 'reducir' ? Math.max(1, n - 1) : n;
      setsPerEx = null;
    }

    return (byGroup[group] || []).slice(0, nAdj).map((ex, i) => {
      const baseSets = isCompound && i === 0 ? scheme.setsComp : scheme.sets;
      const setsN    = setsPerEx ?? (pState === 'priority' ? baseSets + 1 : baseSets);
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
        _priority: pState || null,
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

  // Surface top progression proactively
  if (ctx.progressions?.length > 0) {
    const p = ctx.progressions[0];
    const exShort = p.name.split(' ').slice(0, 2).join(' ');
    if (p.type === 'weight') {
      parts.push(`Mejora detectada en ${exShort}: +${p.kgDelta}kg (${p.prev.kg}→${p.curr.kg}kg × ${p.curr.reps} reps).`);
    } else {
      parts.push(`Mejora en ${exShort}: +${p.repDelta} reps a ${p.curr.kg}kg (${p.prev.reps}→${p.curr.reps}).`);
    }
  } else if (ctx.pushPullRatio > 1.5 && ctx.pushVol > 3) {
    parts.push(`Esta semana tienes más empuje que tracción (${ctx.pushVol} vs ${ctx.pullVol} series).`);
  } else if (ctx.plateaus.length > 0) {
    parts.push(`Hay un posible plateau en ${ctx.plateaus[0].name}.`);
  } else if (ctx.lowVolGroups.length > 0) {
    parts.push(`${ctx.lowVolGroups[0]} con poco volumen esta semana.`);
  }
  parts.push('¿En qué te ayudo?');
  return { type:'text', text: parts.join(' ') };
}

function acResponseRoutine(params, ctx, profile, memory, allExs) {
  const goal   = params.goal  || profile?.objetivo || 'hipertrofia';
  const tiempo = params.tiempo || profile?.tiempo || 60;
  const level  = profile?.nivel || 'intermedio';
  const bp     = ctx.builderGroupPriorities || {};
  const hasBp  = ctx.hasBuilderProfile;

  let splitKey = params.split || null;
  if (!splitKey) {
    if (params.target === 'push') splitKey = 'push';
    else if (params.target === 'pull') splitKey = 'pull';
    else if (params.target === 'legs') splitKey = 'legs';
    else if (params.target === 'arms') splitKey = 'arms';
    else if (params.target === 'shoulders') splitKey = 'shoulders';
    else if (hasBp && window.AtlasEngine) {
      // Use the scientific engine's split selector based on builder priorities
      const engineSplit = window.AtlasEngine.selectSplit(ctx.rawBuilderPriorities, ctx.targetDays);
      splitKey = engineSplit?.key || 'upper_lower';
    } else if (ctx.targetDays >= 4) splitKey = 'upper_lower';
    else if (ctx.targetDays >= 3) splitKey = 'ppl';
    else splitKey = 'fullbody';
  }

  const sessions = acBuildDetailedRoutine(splitKey, goal, level, tiempo, allExs, bp);
  if (!sessions.length || sessions.every(s => !s.exercises.length)) {
    return { type:'text', text:'No pude armar la rutina con los ejercicios disponibles. Prueba con otro tipo de split.' };
  }

  // Context-aware intro — builder profile takes precedence when present
  let intro = '';
  if (hasBp) {
    const priorityGroups = Object.entries(bp).filter(([,v]) => v === 'priority').map(([k]) => k);
    const maintainGroups = Object.entries(bp).filter(([,v]) => v === 'maintain').map(([k]) => k);
    const reducirGroups  = Object.entries(bp).filter(([,v]) => v === 'reducir').map(([k]) => k);
    const GROUP_LABEL = { pecho:'pecho', hombro:'hombros', espalda:'espalda', biceps:'bíceps', triceps:'tríceps', piernas:'piernas', gluteos:'glúteos', core:'core' };
    const fmt = arr => arr.map(g => GROUP_LABEL[g] || g).join(', ');
    const parts = [`Basado en tu perfil del Builder —`];
    if (priorityGroups.length) parts.push(`${fmt(priorityGroups)} en prioridad`);
    if (maintainGroups.length) parts.push(`${fmt(maintainGroups)} en mantenimiento`);
    if (reducirGroups.length)  parts.push(`${fmt(reducirGroups)} reducido`);
    parts.push(`. Split ${splitKey.replace('_',' ')} · ${sessions.length} bloque${sessions.length !== 1 ? 's' : ''}:`);
    intro = parts.join(' ');
  } else if (ctx.daysSinceLast > 6) {
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
    let base = intros[splitKey] || 'Aquí tienes la rutina:';
    // Inject top progression into intro when available
    if (ctx.progressions?.length > 0) {
      const p = ctx.progressions[0];
      const exShort = p.name.split(' ').slice(0, 2).join(' ');
      const note = p.type === 'weight'
        ? `Recuerda que en ${exShort} subiste ${p.kgDelta}kg respecto a la sesión anterior — mantén ese ritmo.`
        : `En ${exShort} mejoraste ${p.repDelta} reps a ${p.curr.kg}kg — ${p.rec}`;
      base = base + '\n' + note;
    }
    intro = base;
  }

  // Build per-muscle volume plan for display (MEV / target / MRV)
  let volumePlan = null;
  if (hasBp && window.AtlasEngine) {
    try {
      volumePlan = window.AtlasEngine.computeVolumePlan(ctx.rawBuilderPriorities).map(m => ({
        id: m.id, name: m.name, state: m.state,
        weeklyTarget: m.targetSets,
        mev: m.mev, mav: m.mav, mrv: m.mrv,
        label: m.state === 'priority' ? 'MAV' : m.state === 'maintain' ? 'MEV' : '½ MEV',
      }));
    } catch {}
  }

  return {
    type: 'routine',
    text: intro,
    sessions,
    volumePlan,
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
  const progCount = ctx.progressions?.length || 0;
  const summary = warns.length > 0
    ? `He revisado ${Math.min(ctx.totalSessions, 10)} sesiones. ${warns.length} punto${warns.length > 1 ? 's' : ''} que deberías corregir${progCount > 0 ? ` y ${progCount} mejora${progCount > 1 ? 's' : ''} detectada${progCount > 1 ? 's' : ''}` : ''}.`
    : progCount > 0
      ? `He revisado ${Math.min(ctx.totalSessions, 10)} sesiones. ${progCount} mejora${progCount > 1 ? 's' : ''} detectada${progCount > 1 ? 's' : ''} desde la última sesión. Buen ritmo.`
      : `He revisado ${Math.min(ctx.totalSessions, 10)} sesiones. Tu entrenamiento va bien, con algunos ajustes menores.`;

  return {
    type: 'analysis',
    summary,
    issues,
    stats: { sessions: ctx.totalSessions, week: ctx.weekSessions, push: ctx.pushVol, pull: ctx.pullVol, streak: ctx.streak, fatigue: ctx.fatigueLevel },
    progressions: ctx.progressions || [],
    plateaus: ctx.plateaus || [],
  };
}

function acResponseProgress(ctx) {
  if (ctx.totalSessions < 2) {
    return { type:'text', text:'Necesito al menos 2 sesiones registradas para detectar progresión. Guarda tu primera rutina en el Builder y vuelve la semana siguiente.' };
  }

  const progs  = ctx.progressions || [];
  const plats  = ctx.plateaus || [];

  if (progs.length === 0 && plats.length === 0) {
    return { type:'text', text:'No detecto cambios claros entre tus últimas dos sesiones — puede que sea demasiado pronto o que las cargas no estén registradas con precisión. ¿Guardas el kg y las reps en cada serie?' };
  }

  const lines = [];
  if (progs.length > 0) {
    lines.push(`${progs.length} mejora${progs.length > 1 ? 's' : ''} detectada${progs.length > 1 ? 's' : ''}:`);
    progs.forEach(p => {
      const badge = p.type === 'weight' ? `+${p.kgDelta}kg` : `+${p.repDelta} reps`;
      lines.push(`• ${p.name}: ${p.prev.kg}kg×${p.prev.reps} → ${p.curr.kg}kg×${p.curr.reps} (${badge})`);
      lines.push(`  → ${p.rec}`);
    });
  }
  if (plats.length > 0) {
    lines.push('');
    lines.push(`${plats.length} plateau${plats.length > 1 ? 's' : ''} detectado${plats.length > 1 ? 's' : ''}:`);
    plats.forEach(p => {
      lines.push(`• ${p.name}: ${p.kg}kg×${p.reps} sin cambios en ${p.sessions} sesiones → prueba subir intensidad (RIR -1) o variar el ejercicio.`);
    });
  }

  return {
    type: 'analysis',
    summary: lines[0],
    issues: [],
    stats: { sessions: ctx.totalSessions, week: ctx.weekSessions, push: ctx.pushVol, pull: ctx.pullVol, streak: ctx.streak, fatigue: ctx.fatigueLevel },
    progressions: progs,
    plateaus: plats,
    _progressText: lines.join('\n'),
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
    case 'progress':    return acResponseProgress(ctx);
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
  if (ctx.progressions?.length > 0) chips.push('Ver mi progresión');
  if (ctx.daysSinceLast > 4 && ctx.daysSinceLast < 99) chips.push(`¿Retomamos hoy?`);
  if (ctx.plateaus?.length > 0) chips.push(`Estancado en ${ctx.plateaus[0].name.split(' ')[0]}`);
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
  const bp  = ctx.builderGroupPriorities || {};
  const GROUP_LABEL = { pecho:'pecho', hombro:'hombros', espalda:'espalda', biceps:'bíceps', triceps:'tríceps', piernas:'piernas', gluteos:'glúteos', core:'core' };

  if (ctx.totalSessions === 0) {
    if (!profile && !ctx.hasBuilderProfile) return 'Hola. Configura tu perfil en el panel inferior del sidebar para que pueda darte recomendaciones personalizadas. ¿Con qué empezamos?';
    if (ctx.hasBuilderProfile) {
      const priorityNames = Object.entries(bp).filter(([,v]) => v === 'priority').map(([k]) => GROUP_LABEL[k] || k);
      const profileNote = profile ? ` ${profile.objetivo}, nivel ${profile.nivel}.` : '';
      const bpNote = priorityNames.length ? ` Tu Builder tiene ${priorityNames.join(' y ')} como prioridad.` : ' Tengo tu perfil del Builder cargado.';
      return `Hola.${profileNote}${bpNote} ¿Genero tu plan de entrenamiento basado en esas prioridades?`;
    }
    return `Hola. Perfil cargado — ${profile.objetivo}, nivel ${profile.nivel}. Sin sesiones registradas aún. ¿Quieres que genere tu primer plan de entrenamiento?`;
  }

  const parts = [];
  if (ctx.daysSinceLast === 0) parts.push('Entrenaste hoy.');
  else if (ctx.daysSinceLast === 1) parts.push('Entrenaste ayer.');
  else if (ctx.daysSinceLast < 99) parts.push(`Llevas ${ctx.daysSinceLast} días sin entrenar.`);
  if (ctx.streak >= 3) parts.push(`${ctx.streak} días de racha.`);

  // Mention builder priorities if available
  if (ctx.hasBuilderProfile) {
    const priorityNames = Object.entries(bp).filter(([,v]) => v === 'priority').map(([k]) => GROUP_LABEL[k] || k);
    if (priorityNames.length) parts.push(`Builder: ${priorityNames.join(', ')} en prioridad.`);
  } else if (ctx.pushPullRatio > 1.5 && ctx.pushVol > 3) {
    parts.push(`Esta semana más empuje que tracción (${ctx.pushVol}:${ctx.pullVol}).`);
  } else if (ctx.plateaus.length > 0) {
    parts.push(`Posible plateau en ${ctx.plateaus[0].name}.`);
  } else if (ctx.lowVolGroups.length > 0) {
    parts.push(`${ctx.lowVolGroups[0]} con poco volumen esta semana.`);
  } else if (ctx.fatigueLevel === 'high') {
    parts.push('Volumen semanal alto — considera un deload.');
  }

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
      {/* Header */}
      <div onClick={() => setOpen(o=>!o)} style={{ padding:'14px 18px', display:'flex', justifyContent:'space-between', alignItems:'center', borderBottom:`1px solid ${AC.border}`, cursor:'pointer' }}>
        <div>
          <div style={{ fontFamily:'Inter,system-ui', fontSize:13, fontWeight:700, color:AC.text, letterSpacing:-0.2 }}>{session.name}</div>
          <div style={{ display:'flex', gap:16, marginTop:5 }}>
            {[
              `${session.exercises.length} ejerc`,
              `${session.totalSets} series`,
              `~${session.duration} min`,
            ].map(v => (
              <span key={v} style={{ fontFamily:'ui-monospace,Menlo,monospace', fontSize:9, fontWeight:700, color:AC.muted, letterSpacing:0.3 }}>{v}</span>
            ))}
          </div>
        </div>
        <span style={{ color:AC.muted, fontSize:12, transform:open?'rotate(180deg)':'none', transition:'transform .2s', fontFamily:'ui-monospace,Menlo,monospace' }}>▾</span>
      </div>
      {open && (
        <>
          {/* Column headers */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 36px 56px 38px 56px', padding:'6px 18px', borderBottom:`1px solid rgba(255,255,255,0.04)` }}>
            {['EJERCICIO','×','REPS','RIR','REST'].map((h, i) => (
              <div key={h} style={{ fontFamily:'ui-monospace,Menlo,monospace', fontSize:7, fontWeight:700, color:AC.muted, letterSpacing:0.8, textAlign:i>0?'center':'left' }}>{h}</div>
            ))}
          </div>
          {session.exercises.map((ex, ei) => (
            <div key={ex.id||ei} style={{ display:'grid', gridTemplateColumns:'1fr 36px 56px 38px 56px', padding:'9px 18px', alignItems:'center', borderTop:`1px solid rgba(255,255,255,0.03)` }}>
              <div style={{ minWidth:0 }}>
                <div style={{ fontFamily:'Inter,system-ui', fontSize:12, fontWeight:600, color:AC.text, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{ex.name}</div>
                <div style={{ fontFamily:'Inter,system-ui', fontSize:9, color:AC.muted, marginTop:2, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{ex.muscles?.primary?.[0]||''}</div>
              </div>
              <div style={{ fontFamily:'ui-monospace,Menlo,monospace', fontSize:15, fontWeight:800, color:AC.text, textAlign:'center' }}>{ex.setsCount ?? (Array.isArray(ex.sets) ? ex.sets.length : ex.sets) ?? 3}</div>
              <div style={{ fontFamily:'ui-monospace,Menlo,monospace', fontSize:11, color:AC.sub, textAlign:'center' }}>{ex.repsRange||'8-12'}</div>
              <div style={{ fontFamily:'ui-monospace,Menlo,monospace', fontSize:11, color:'rgba(147,197,253,0.80)', textAlign:'center', fontWeight:700 }}>{ex.rir ?? 2}</div>
              <div style={{ fontFamily:'ui-monospace,Menlo,monospace', fontSize:9, color:AC.muted, textAlign:'center' }}>{ex.rest||'90s'}</div>
            </div>
          ))}
          <div style={{ padding:'12px 18px', borderTop:`1px solid rgba(255,255,255,0.05)` }}>
            <button onClick={() => onSendToBuilder(session.exercises)} style={{ width:'100%', padding:'11px 16px', borderRadius:10, border:'none', cursor:'pointer', background:AC.blue, color:'#fff', fontFamily:'Inter,system-ui', fontSize:13, fontWeight:700, letterSpacing:-0.2, boxShadow:'0 4px 18px -4px rgba(59,130,246,0.45)' }}>
              Abrir en Builder →
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function AcAnalysisCard({ content }) {
  const SEV_C = { warning:'#EF4444', good:'#22C55E', info:'#3B82F6' };
  const { stats } = content;
  const fatLabel = { high:'ALTA', moderate:'MOD', low:'BAJA' }[stats?.fatigue] || '—';
  const fatColor = { high:'#EF4444', moderate:'#F59E0B', low:'#22C55E' }[stats?.fatigue] || AC.muted;

  const metrics = [
    { k:'SESIONES', v: stats?.sessions ?? '—',                    c: AC.text },
    { k:'ESTA SEM', v: stats?.week ?? '—',                        c: AC.text },
    { k:'RACHA',    v: stats?.streak !== undefined ? `${stats.streak}d` : '—', c: (stats?.streak||0) >= 3 ? '#22C55E' : AC.text },
    stats?.push > 0
      ? { k:'P:T', v:`${stats.push}:${stats.pull}`, c: stats.push > stats.pull * 1.4 ? '#F59E0B' : AC.text }
      : null,
    { k:'FATIGA',   v: fatLabel,                                   c: fatColor },
  ].filter(Boolean);

  return (
    <div style={{ borderRadius:14, overflow:'hidden', border:`1px solid ${AC.border}`, animation:'fadeIn .25s ease' }}>

      {/* ── Metric strip — Whoop-style ── */}
      <div style={{ display:'flex', borderBottom:`1px solid ${AC.border}` }}>
        {metrics.map((m, i) => (
          <div key={m.k} style={{
            flex:1, padding:'14px 10px', textAlign:'center',
            borderRight: i < metrics.length - 1 ? `1px solid ${AC.border}` : 'none',
          }}>
            <div style={{ fontFamily:'ui-monospace,Menlo,monospace', fontSize:7, color:AC.muted, fontWeight:700, letterSpacing:0.9, marginBottom:7 }}>{m.k}</div>
            <div style={{ fontFamily:'ui-monospace,Menlo,monospace', fontSize:20, fontWeight:800, color:m.c, lineHeight:1 }}>{m.v}</div>
          </div>
        ))}
      </div>

      {/* ── Summary ── */}
      <div style={{ padding:'13px 18px', borderBottom:`1px solid ${AC.border}`, background:'rgba(255,255,255,0.02)' }}>
        <div style={{ fontFamily:'ui-monospace,Menlo,monospace', fontSize:8, fontWeight:700, color:AC.muted, letterSpacing:1.6, marginBottom:7 }}>ANÁLISIS</div>
        <p style={{ fontFamily:'Inter,system-ui', fontSize:13, color:AC.sub, margin:0, lineHeight:1.55 }}>{content.summary}</p>
      </div>

      {/* ── Issue rows — left accent border ── */}
      {(content.issues || []).map((issue, i) => (
        <div key={i} style={{
          padding:'12px 18px',
          borderTop: i > 0 ? `1px solid rgba(255,255,255,0.04)` : undefined,
          borderLeft:`2px solid ${SEV_C[issue.sev] || AC.blue}`,
        }}>
          <div style={{ display:'flex', alignItems:'flex-start', gap:10 }}>
            <span style={{ fontFamily:'ui-monospace,Menlo,monospace', fontSize:11, color:SEV_C[issue.sev]||AC.blue, flexShrink:0, marginTop:1, fontWeight:700 }}>{issue.icon}</span>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontFamily:'Inter,system-ui', fontSize:12, fontWeight:700, color:AC.text, marginBottom:3 }}>{issue.title}</div>
              <div style={{ fontFamily:'Inter,system-ui', fontSize:11, color:AC.sub, lineHeight:1.55, marginBottom:issue.rec?5:0 }}>{issue.detail}</div>
              {issue.rec && (
                <div style={{ fontFamily:'Inter,system-ui', fontSize:10, color:SEV_C[issue.sev]||AC.blue, fontWeight:600 }}>→ {issue.rec}</div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function AcVolumeCard({ volumePlan }) {
  if (!volumePlan?.length) return null;
  const STATE_C = { priority: AC.blue, maintain: AC.green, reducir: AC.amber };
  const STATE_L = { priority: 'PRIORIDAD', maintain: 'MANTENER', reducir: 'REDUCIR' };
  return (
    <div style={{ borderRadius:12, overflow:'hidden', border:`1px solid ${AC.border}`, background:AC.card2, marginTop:8, marginBottom:2 }}>
      <div style={{ padding:'7px 14px', borderBottom:`1px solid ${AC.border}`, display:'flex', alignItems:'center', gap:8 }}>
        <div style={{ fontFamily:'ui-monospace,Menlo,monospace', fontSize:7, fontWeight:700, color:AC.muted, letterSpacing:1.4 }}>VOLUMEN CIENTÍFICO · SERIES / SEMANA</div>
      </div>
      {/* Column headers */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 46px 46px 46px 76px', padding:'5px 14px', borderBottom:`1px solid rgba(255,255,255,0.04)` }}>
        {['MÚSCULO','MEV','OBJ','MRV','ESTADO'].map((h, i) => (
          <div key={h} style={{ fontFamily:'ui-monospace,Menlo,monospace', fontSize:6.5, fontWeight:700, color:AC.muted, letterSpacing:0.7, textAlign:i>0?'center':'left' }}>{h}</div>
        ))}
      </div>
      {volumePlan.map((m, i) => {
        const sc = STATE_C[m.state] || AC.muted;
        return (
          <div key={m.id} style={{ display:'grid', gridTemplateColumns:'1fr 46px 46px 46px 76px', padding:'8px 14px', alignItems:'center', borderTop: i > 0 ? `1px solid rgba(255,255,255,0.03)` : 'none' }}>
            <div style={{ fontFamily:'Inter,system-ui', fontSize:11, fontWeight:600, color:AC.sub }}>{m.name}</div>
            <div style={{ fontFamily:'ui-monospace,Menlo,monospace', fontSize:11, color:AC.muted, textAlign:'center' }}>{m.mev}</div>
            <div style={{ fontFamily:'ui-monospace,Menlo,monospace', fontSize:14, fontWeight:800, color:sc, textAlign:'center', letterSpacing:-0.5 }}>{m.weeklyTarget}</div>
            <div style={{ fontFamily:'ui-monospace,Menlo,monospace', fontSize:11, color:AC.muted, textAlign:'center' }}>{m.mrv}</div>
            <div style={{ textAlign:'center' }}>
              <span style={{ fontFamily:'ui-monospace,Menlo,monospace', fontSize:7, fontWeight:700, color:sc, background:`${sc}18`, border:`1px solid ${sc}30`, borderRadius:4, padding:'2px 5px', letterSpacing:0.5 }}>{STATE_L[m.state] || m.label}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function AcProgressionCard({ progressions, plateaus }) {
  const hasProgs  = progressions?.length > 0;
  const hasPlats  = plateaus?.length > 0;
  if (!hasProgs && !hasPlats) return null;

  return (
    <div style={{ borderRadius:12, overflow:'hidden', border:`1px solid ${AC.border}`, background:AC.card2, marginTop:8 }}>
      {hasProgs && (
        <>
          <div style={{ padding:'7px 14px', borderBottom:`1px solid ${AC.border}` }}>
            <div style={{ fontFamily:'ui-monospace,Menlo,monospace', fontSize:7, fontWeight:700, color:'#22C55E', letterSpacing:1.4 }}>PROGRESIÓN DETECTADA</div>
          </div>
          {progressions.map((p, i) => {
            const badge = p.type === 'weight' ? `+${p.kgDelta}kg` : `+${p.repDelta} rep${p.repDelta > 1 ? 's' : ''}`;
            return (
              <div key={p.name} style={{ padding:'11px 14px', borderTop: i > 0 ? `1px solid rgba(255,255,255,0.04)` : 'none', borderLeft:'2px solid #22C55E' }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:8 }}>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontFamily:'Inter,system-ui', fontSize:12, fontWeight:700, color:AC.text, marginBottom:4, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                      {p.name}{p.isAllTimePR && <span style={{ marginLeft:6, fontFamily:'ui-monospace,Menlo,monospace', fontSize:8, fontWeight:700, color:'#F59E0B', background:'rgba(245,158,11,0.12)', border:'1px solid rgba(245,158,11,0.3)', borderRadius:4, padding:'1px 5px', letterSpacing:0.6 }}>PR</span>}
                    </div>
                    <div style={{ fontFamily:'ui-monospace,Menlo,monospace', fontSize:10, color:AC.muted, marginBottom:5 }}>
                      {p.prev.kg}kg×{p.prev.reps} <span style={{ color:AC.muted }}>→</span> {p.curr.kg}kg×{p.curr.reps}
                    </div>
                    {p.rec && <div style={{ fontFamily:'Inter,system-ui', fontSize:10, color:AC.blue, fontWeight:500 }}>→ {p.rec}</div>}
                  </div>
                  <div style={{ flexShrink:0, fontFamily:'ui-monospace,Menlo,monospace', fontSize:12, fontWeight:800, color:'#22C55E', background:'rgba(34,197,94,0.1)', border:'1px solid rgba(34,197,94,0.25)', borderRadius:6, padding:'4px 9px', letterSpacing:-0.3 }}>{badge}</div>
                </div>
              </div>
            );
          })}
        </>
      )}
      {hasPlats && (
        <>
          <div style={{ padding:'7px 14px', borderBottom:`1px solid ${AC.border}`, borderTop: hasProgs ? `1px solid ${AC.border}` : 'none' }}>
            <div style={{ fontFamily:'ui-monospace,Menlo,monospace', fontSize:7, fontWeight:700, color:AC.amber, letterSpacing:1.4 }}>PLATEAU DETECTADO</div>
          </div>
          {plateaus.map((p, i) => (
            <div key={p.name} style={{ padding:'11px 14px', borderTop: i > 0 ? `1px solid rgba(255,255,255,0.04)` : 'none', borderLeft:`2px solid ${AC.amber}` }}>
              <div style={{ fontFamily:'Inter,system-ui', fontSize:12, fontWeight:700, color:AC.text, marginBottom:3 }}>{p.name}</div>
              <div style={{ fontFamily:'ui-monospace,Menlo,monospace', fontSize:10, color:AC.muted, marginBottom:4 }}>{p.kg}kg × {p.reps} reps · {p.sessions} sesiones sin cambio</div>
              <div style={{ fontFamily:'Inter,system-ui', fontSize:10, color:AC.amber, fontWeight:500 }}>→ Prueba RIR −1 esta sesión o cambia a una variación del mismo patrón.</div>
            </div>
          ))}
        </>
      )}
    </div>
  );
}

function AcCoachMessage({ content, onSendToBuilder }) {
  const bubble = { padding:'13px 18px', borderRadius:'4px 18px 18px 18px', background:AC.card, border:`1px solid ${AC.border}`, fontFamily:'Inter,system-ui', fontSize:14, lineHeight:1.65, color:AC.text, whiteSpace:'pre-line' };
  if (content.type === 'text') return <div style={bubble}>{content.text}</div>;
  if (content.type === 'routine') return (
    <div>
      <div style={bubble}>{content.text}</div>
      {content.volumePlan?.length > 0 && <AcVolumeCard volumePlan={content.volumePlan} />}
      {(content.sessions || []).map((session, si) => (
        <AcRoutineCard key={si} session={session} onSendToBuilder={onSendToBuilder} />
      ))}
    </div>
  );
  if (content.type === 'analysis') return (
    <div>
      <AcAnalysisCard content={content} />
      {(content.progressions?.length > 0 || content.plateaus?.length > 0) && (
        <AcProgressionCard progressions={content.progressions} plateaus={content.plateaus} />
      )}
    </div>
  );
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
