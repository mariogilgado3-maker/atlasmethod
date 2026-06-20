// Atlas Method — Scientific Training Engine v1
// Source: Israetel, Schoenfeld et al. — MEV/MAV/MRV protocols
// Single source of truth for volume recommendations.
// Exposes: window.AtlasEngine

(function () {
  'use strict';

  // ── Complete muscle science database ──────────────────────────────────────────
  const SCIENCE = {
    pecho: {
      mev:10, mav:16, mrv:22, freq:2, sti:0.80,
      name:'Pecho', group:'torso', view:'front', pushPull:'push',
      explanation:'El pectoral mayor responde bien a 2 frecuencias semanales con énfasis en sobrecarga progresiva. El press inclinado como ejercicio principal maximiza la activación del fascículo clavicular (Schoenfeld 2010).',
    },
    delt_ant: {
      mev:4, mav:8, mrv:14, freq:2, sti:0.70,
      name:'Deltoides anterior', group:'hombros', view:'front', pushPull:'push',
      explanation:'El deltoides anterior recibe estimulación indirecta muy alta en todos los patrones de empuje horizontal y vertical. El volumen directo raramente necesita superar 8 series/sem sin sobrecargar el manguito.',
    },
    delt_lat: {
      mev:8, mav:14, mrv:20, freq:2, sti:0.75,
      name:'Deltoides lateral', group:'hombros', view:'both', pushPull:'push',
      explanation:'El deltoides lateral define el ancho del hombro. Responde mejor a aislamientos con carga moderada (elevaciones laterales) en rangos de 12–20 repeticiones y frecuencia 2×/sem.',
    },
    delt_post: {
      mev:10, mav:16, mrv:22, freq:2, sti:0.70,
      name:'Deltoides posterior', group:'hombros', view:'back', pushPull:'pull',
      explanation:'El deltoides posterior es el más infra-entrenado. Es crítico para la salud del manguito rotador. Se activa en remos con codos elevados (remo al mentón) y face pulls.',
    },
    biceps: {
      mev:8, mav:14, mrv:20, freq:2, sti:0.65,
      name:'Bíceps', group:'brazos', view:'front', pushPull:'pull',
      explanation:'Los bíceps reciben estimulación secundaria sustancial en todos los movimientos de tracción. El volumen directo óptimo es de 8–14 series/sem en rangos de 10–15 repeticiones (Israetel 2019).',
    },
    antebrazo: {
      mev:6, mav:12, mrv:18, freq:3, sti:0.60,
      name:'Antebrazo', group:'brazos', view:'both', pushPull:'pull',
      explanation:'Los antebrazos se desarrollan principalmente a través del volumen de tracción acumulado. El trabajo directo (curl de muñeca, farmer walks) es útil cuando el grip limita el rendimiento.',
    },
    triceps: {
      mev:8, mav:14, mrv:20, freq:2, sti:0.75,
      name:'Tríceps', group:'brazos', view:'back', pushPull:'push',
      explanation:'El tríceps representa 2/3 del volumen del brazo. Responde mejor a ejercicios en longitud máxima (extensión sobre cabeza) combinados con los compuestos de empuje del día.',
    },
    core: {
      mev:8, mav:16, mrv:24, freq:3, sti:0.65,
      name:'Abdominales', group:'core', view:'both', pushPull:'neutral',
      explanation:'El core requiere frecuencia alta (3×/sem) por su capacidad de recuperación elevada. La combinación de flexión de tronco y anti-extensión (plancha) optimiza el desarrollo (McGill 2010).',
    },
    oblicuos: {
      mev:6, mav:12, mrv:18, freq:2, sti:0.60,
      name:'Oblicuos', group:'core', view:'front', pushPull:'neutral',
      explanation:'Los oblicuos son fundamentales para la transmisión de fuerza entre tren superior e inferior. Se activan en movimientos rotacionales y de flexión lateral cargada.',
    },
    trapecio: {
      mev:8, mav:14, mrv:20, freq:2, sti:0.70,
      name:'Trapecio', group:'torso', view:'back', pushPull:'pull',
      explanation:'El trapecio medio e inferior se activa en remos y face pulls. Priorizar las fibras medias e inferiores sobre las superiores es clave para el equilibrio postural y la salud del hombro.',
    },
    dorsal: {
      mev:10, mav:16, mrv:22, freq:2, sti:0.80,
      name:'Dorsal ancho', group:'torso', view:'back', pushPull:'pull',
      explanation:'El dorsal es el motor principal de la tracción vertical. Responde mejor a jalón y dominadas (extensión completa de hombro) combinados con remos inclinados (Schoenfeld 2016).',
    },
    lumbar: {
      mev:6, mav:10, mrv:14, freq:2, sti:0.70,
      name:'Lumbar', group:'core', view:'back', pushPull:'neutral',
      explanation:'Los extensores lumbares trabajan isométricamente en sentadilla y peso muerto. El trabajo directo (hiperextensiones, buenos días) complementa sin necesitar alto volumen.',
    },
    erectores: {
      mev:6, mav:10, mrv:14, freq:2, sti:0.70,
      name:'Erectores espinales', group:'core', view:'back', pushPull:'neutral',
      explanation:'Los erectores estabilizan la columna en todos los grandes compuestos. Se estimulan directamente en peso muerto rumano y extensiones de espalda. La recuperación es más lenta que otros grupos (Hales 2009).',
    },
    cuadriceps: {
      mev:8, mav:14, mrv:20, freq:2, sti:0.80,
      name:'Cuádriceps', group:'piernas', view:'front', pushPull:'legs',
      explanation:'El cuádriceps responde bien a sentadillas profundas y prensa. El recto femoral requiere ejercicios con flexión de cadera simultánea (sentadilla frontal) para estimulación completa (Vigotsky 2015).',
    },
    aductores: {
      mev:6, mav:10, mrv:16, freq:2, sti:0.60,
      name:'Aductores', group:'piernas', view:'front', pushPull:'legs',
      explanation:'Los aductores se activan en sentadillas wide stance y sumo. El trabajo directo (máquina aductora, sentadilla goblet amplia) complementa los patrones de bisagra y sentadilla.',
    },
    gluteos: {
      mev:8, mav:16, mrv:24, freq:2, sti:0.75,
      name:'Glúteos', group:'gluteos', view:'back', pushPull:'legs',
      explanation:'Los glúteos son el grupo muscular más grande y frecuentemente infra-desarrollado. Hip thrust y sentadilla búlgara maximizan la activación en extensión completa de cadera (Contreras 2014).',
    },
    isquio: {
      mev:8, mav:14, mrv:20, freq:2, sti:0.75,
      name:'Isquiotibiales', group:'piernas', view:'back', pushPull:'legs',
      explanation:'Los isquiotibiales actúan como flexores de rodilla y extensores de cadera. Necesitan trabajo tanto en longitud máxima (curl tumbado) como en carga de cadera alta (peso muerto rumano).',
    },
    gemelos: {
      mev:10, mav:16, mrv:22, freq:3, sti:0.60,
      name:'Gemelos', group:'piernas', view:'both', pushPull:'legs',
      explanation:'Los gemelos tienen alta proporción de fibras tipo I — necesitan frecuencia de 3×/sem y rangos de 15–25 repeticiones para una adaptación óptima (Schoenfeld 2012).',
    },
    abductores: {
      mev:6, mav:10, mrv:16, freq:2, sti:0.60,
      name:'Abductores', group:'piernas', view:'back', pushPull:'legs',
      explanation:'Los abductores de cadera estabilizan la pelvis durante la marcha y los ejercicios unilaterales. Su fortalecimiento reduce el riesgo de rodilla valga y lesiones de rodilla.',
    },
    tibial: {
      mev:4, mav:8, mrv:12, freq:3, sti:0.50,
      name:'Tibial anterior', group:'piernas', view:'front', pushPull:'legs',
      explanation:'El tibial dorsiflexiona el pie y estabiliza el tobillo. Su desarrollo equilibra la pantorrilla y previene el síndrome de estrés tibial medial en atletas de resistencia.',
    },
  };

  // ── Split definitions ─────────────────────────────────────────────────────────
  const SPLITS = {
    fullbody: {
      key: 'fullbody',
      name: 'Full Body',
      sessionsPerWeek: 3,
      reason: 'Con este volumen total, Full Body permite 3× de frecuencia semanal por grupo muscular — el máximo estímulo de síntesis proteica por unidad de volumen según Schoenfeld (2016).',
      science: 'La frecuencia 3× es óptima cuando el volumen por grupo no supera las ~8 series/sesión. Maximiza las "ventanas de síntesis" sin acumular fatiga excesiva.',
      structure: [
        { dayLabel:'Día A', muscles:['cuadriceps','pecho','dorsal','delt_lat','core'] },
        { dayLabel:'Día B', muscles:['isquio','gluteos','pecho','trapecio','triceps','biceps'] },
        { dayLabel:'Día C', muscles:['cuadriceps','dorsal','delt_lat','delt_post','core','gemelos'] },
      ],
    },
    upper_lower: {
      key: 'upper_lower',
      name: 'Upper / Lower',
      sessionsPerWeek: 4,
      reason: 'Upper/Lower distribuye el volumen en 4 sesiones semanales con 2× frecuencia por grupo, permitiendo mayor volumen por sesión con tiempo de recuperación adecuado entre estímulos.',
      science: 'La frecuencia 2× por grupo es la más respaldada por la evidencia para hipertrofia cuando el volumen es moderado-alto (8–16 series/grupo/sem). Meta-análisis Schoenfeld (2017).',
      structure: [
        { dayLabel:'Upper A', muscles:['pecho','dorsal','trapecio','delt_lat','delt_post','biceps','triceps'] },
        { dayLabel:'Lower A', muscles:['cuadriceps','isquio','gluteos','core','gemelos','abductores'] },
        { dayLabel:'Upper B', muscles:['pecho','dorsal','delt_ant','delt_lat','biceps','triceps','antebrazo'] },
        { dayLabel:'Lower B', muscles:['cuadriceps','isquio','gluteos','core','aductores','tibial'] },
      ],
    },
    ppl: {
      key: 'ppl',
      name: 'Push / Pull / Legs',
      sessionsPerWeek: 6,
      reason: 'PPL concentra el volumen por grupo en sesiones dedicadas, permitiendo alta especialización. Óptimo cuando el volumen semanal prioritario supera las 14 series por grupo.',
      science: 'Para volúmenes >14 series/grupo/sem, PPL asegura suficiente recuperación entre estímulos del mismo grupo evitando la acumulación de fatiga local (Israetel 2019).',
      structure: [
        { dayLabel:'Push A',  muscles:['pecho','delt_ant','delt_lat','triceps'] },
        { dayLabel:'Pull A',  muscles:['dorsal','trapecio','delt_post','biceps','antebrazo','erectores'] },
        { dayLabel:'Legs A',  muscles:['cuadriceps','isquio','gluteos','gemelos','abductores','core'] },
        { dayLabel:'Push B',  muscles:['pecho','delt_lat','delt_ant','triceps'] },
        { dayLabel:'Pull B',  muscles:['dorsal','trapecio','delt_post','biceps','lumbar'] },
        { dayLabel:'Legs B',  muscles:['cuadriceps','isquio','gluteos','aductores','core','tibial'] },
      ],
    },
  };

  // ── Volume plan ───────────────────────────────────────────────────────────────
  function computeVolumePlan(priorities) {
    return Object.entries(priorities)
      .filter(([, state]) => state && state !== 'off')
      .map(([id, state]) => {
        const sci = SCIENCE[id];
        if (!sci) return null;
        const targetSets =
          state === 'priority' ? sci.mav
          : state === 'maintain' ? sci.mev
          : state === 'reducir'  ? Math.round(sci.mev * 0.5)
          : 0;
        return {
          id, state,
          name: sci.name,
          group: sci.group,
          pushPull: sci.pushPull,
          targetSets,
          mev: sci.mev, mav: sci.mav, mrv: sci.mrv,
          freq: sci.freq,
          explanation: sci.explanation,
        };
      })
      .filter(Boolean)
      .sort((a, b) => {
        const o = { priority:0, maintain:1, reducir:2 };
        return (o[a.state] ?? 9) - (o[b.state] ?? 9);
      });
  }

  // ── Split selection ───────────────────────────────────────────────────────────
  function selectSplit(priorities, daysAvailable) {
    const plan        = computeVolumePlan(priorities);
    const totalSets   = plan.reduce((s, m) => s + m.targetSets, 0);
    const maxPerGroup = Math.max(...plan.map(m => m.targetSets), 0);
    const days        = daysAvailable || 4;

    if (days <= 2) return SPLITS.fullbody;
    if (days >= 5 || maxPerGroup >= 16 || totalSets >= 60) return SPLITS.ppl;
    if (days === 3 && totalSets < 40) return SPLITS.fullbody;
    if (totalSets < 40) return SPLITS.upper_lower;
    return SPLITS.ppl;
  }

  // ── Day structure ─────────────────────────────────────────────────────────────
  function generateDayStructure(split, volumePlan) {
    return split.structure
      .map(day => {
        const muscles = day.muscles
          .map(muscleId => {
            const m = volumePlan.find(x => x.id === muscleId);
            if (!m || m.targetSets === 0) return null;
            const freqInSplit = split.structure.filter(d => d.muscles.includes(muscleId)).length;
            const setsThisDay = Math.max(2, Math.min(Math.round(m.targetSets / freqInSplit), 8));
            return { ...m, setsThisDay, freqInSplit };
          })
          .filter(Boolean);

        return {
          dayLabel: day.dayLabel,
          muscles,
          totalSets: muscles.reduce((s, m) => s + m.setsThisDay, 0),
        };
      })
      .filter(d => d.muscles.length > 0);
  }

  // ── Full plan export ──────────────────────────────────────────────────────────
  function exportBuilderPlan(priorities, daysAvailable) {
    const volumePlan = computeVolumePlan(priorities);
    const split      = selectSplit(priorities, daysAvailable);
    const days       = generateDayStructure(split, volumePlan);
    const totalSets  = volumePlan.reduce((s, m) => s + m.targetSets, 0);
    const pushSets   = volumePlan.filter(m => m.pushPull === 'push').reduce((s,m)=>s+m.targetSets,0);
    const pullSets   = volumePlan.filter(m => m.pushPull === 'pull').reduce((s,m)=>s+m.targetSets,0);
    const legsSets   = volumePlan.filter(m => m.pushPull === 'legs').reduce((s,m)=>s+m.targetSets,0);

    return {
      priorities,
      volumePlan,
      split,
      days,
      totalSets,
      pushSets, pullSets, legsSets,
      priorityCount: volumePlan.filter(m => m.state === 'priority').length,
      maintainCount: volumePlan.filter(m => m.state === 'maintain').length,
      generatedAt: Date.now(),
    };
  }

  // ── Persistence ───────────────────────────────────────────────────────────────
  const BUILDER_PLAN_KEY = 'atlas.builder.plan.v1';

  function saveBuilderPlan(plan) {
    try { localStorage.setItem(BUILDER_PLAN_KEY, JSON.stringify(plan)); } catch {}
  }
  function loadBuilderPlan() {
    try { return JSON.parse(localStorage.getItem(BUILDER_PLAN_KEY) || 'null'); } catch { return null; }
  }
  function clearBuilderPlan() {
    try { localStorage.removeItem(BUILDER_PLAN_KEY); } catch {}
  }

  // ── Public API ────────────────────────────────────────────────────────────────
  Object.assign(window, {
    AtlasEngine: {
      SCIENCE, SPLITS,
      computeVolumePlan,
      selectSplit,
      generateDayStructure,
      exportBuilderPlan,
      saveBuilderPlan,
      loadBuilderPlan,
      clearBuilderPlan,
      BUILDER_PLAN_KEY,
    },
  });
})();

// ── Atlas Scientific Engine ────────────────────────────────────────────────────
// Analyzes real training data against sports science benchmarks.
// Source references: Israetel 2019, Schoenfeld 2010/2016/2017, Zourdos 2016.
// Depends on: AtlasEngine.SCIENCE (MEV/MAV/MRV),
//             peGetExerciseHistory, peDetectProgress (loaded before this file).

const AtlasScientificEngine = (function () {
  'use strict';

  // ── Muscle name → SCIENCE key ──────────────────────────────────────────────
  // Handles exercise muscle names exactly as stored by builder.jsx save():
  //   muscles: ex.muscles.primary  → flat array of strings like 'Pectoral mayor'
  const MUSCLE_KEY_MAP = {
    // Chest
    'pectoral mayor': 'pecho', 'pectoral superior': 'pecho', 'pectoral': 'pecho',
    // Shoulders
    'deltoides ant': 'delt_ant', 'deltoides anterior': 'delt_ant',
    'deltoides lat': 'delt_lat', 'deltoides lateral': 'delt_lat',
    'deltoides post': 'delt_post', 'deltoides posterior': 'delt_post',
    // Arms
    'bíceps': 'biceps', 'biceps': 'biceps', 'braquial': 'biceps', 'braquiorradial': 'antebrazo',
    'tríceps': 'triceps', 'triceps': 'triceps', 'antebrazo': 'antebrazo',
    // Back
    'dorsal ancho': 'dorsal', 'dorsal': 'dorsal',
    'trapecio medio': 'trapecio', 'trapecio': 'trapecio', 'romboides': 'trapecio',
    'erectores espinales': 'erectores', 'erectores': 'erectores', 'lumbar': 'lumbar',
    // Core
    'core': 'core', 'transverso': 'core', 'recto abdominal': 'core', 'abdominales': 'core',
    'oblicuos': 'oblicuos',
    // Legs
    'cuádriceps': 'cuadriceps', 'cuadriceps': 'cuadriceps', 'recto femoral': 'cuadriceps',
    'isquiotibiales': 'isquio', 'isquios': 'isquio', 'bíceps femoral': 'isquio',
    'glúteos': 'gluteos', 'glúteo mayor': 'gluteos', 'gluteos': 'gluteos',
    'gemelos': 'gemelos', 'pantorrilla': 'gemelos', 'sóleo': 'gemelos',
    'aductores': 'aductores', 'abductores': 'abductores', 'tibial anterior': 'tibial',
  };

  function resolveMuscleName(raw) {
    if (!raw) return null;
    const k = raw.toLowerCase().replace(/\./g, '').trim();
    if (MUSCLE_KEY_MAP[k]) return MUSCLE_KEY_MAP[k];
    for (const [pattern, key] of Object.entries(MUSCLE_KEY_MAP)) {
      if (k.startsWith(pattern)) return key;
    }
    return null;
  }

  // Handles both flat array (from log) and {primary, secondary} object
  function getMuscles(ex) {
    if (!ex?.muscles) return { primary: [], secondary: [] };
    if (Array.isArray(ex.muscles)) return { primary: ex.muscles, secondary: [] };
    return { primary: ex.muscles.primary || [], secondary: ex.muscles.secondary || [] };
  }

  // ── Per-muscle weekly sets ─────────────────────────────────────────────────
  // Primary muscles: full set credit. Secondary: 0.5 (rounded down).
  function seGetMuscleWeeklySets(log, nWeeks) {
    const cutoff = Date.now() - (nWeeks || 1) * 7 * 86400000;
    const tally  = {};
    for (const session of log) {
      if ((session.dateTs || 0) < cutoff) continue;
      for (const ex of session.exercises || []) {
        const setsN              = (ex.sets || []).length || 1;
        const { primary, secondary } = getMuscles(ex);
        for (const m of primary) {
          const key = resolveMuscleName(m);
          if (key) tally[key] = (tally[key] || 0) + setsN;
        }
        for (const m of secondary) {
          const key = resolveMuscleName(m);
          if (key) tally[key] = (tally[key] || 0) + Math.floor(setsN * 0.5);
        }
      }
    }
    return tally;
  }

  // ── Per-muscle session frequency (sessions / week) ─────────────────────────
  function seGetMuscleFrequency(log, nWeeks) {
    const cutoff = Date.now() - (nWeeks || 1) * 7 * 86400000;
    const days   = {};
    for (const session of log) {
      if ((session.dateTs || 0) < cutoff) continue;
      const day = session.date || String(Math.floor(session.dateTs / 86400000));
      for (const ex of session.exercises || []) {
        const { primary } = getMuscles(ex);
        for (const m of primary) {
          const key = resolveMuscleName(m);
          if (!key) continue;
          if (!days[key]) days[key] = new Set();
          days[key].add(day);
        }
      }
    }
    const result = {};
    for (const [key, set] of Object.entries(days)) result[key] = set.size;
    return result;
  }

  // ── Intensity estimation per exercise (Epley + RIR) ───────────────────────
  // Returns: { avgPct, avgRPE, est1RM, label }
  function seEstimateIntensity(sets) {
    if (!sets?.length) return null;
    const valid = sets.filter(s => Number(s.kg) > 0 && Number(s.reps) > 0);
    if (!valid.length) return null;
    const rows = valid.map(s => {
      const kg   = Number(s.kg);
      const reps = Number(s.reps);
      const rir  = (s.rir !== undefined && s.rir !== '') ? Number(s.rir) : null;
      const rep1 = rir !== null && !isNaN(rir) ? reps + rir : reps;
      const e1RM = kg * (1 + rep1 / 30);
      const pct  = Math.min(1, kg / e1RM);
      const rpe  = rir !== null && !isNaN(rir)
        ? Math.min(10, 10 - rir)
        : reps <= 3 ? 9 : reps <= 5 ? 8.5 : reps <= 8 ? 8 : reps <= 12 ? 7.5 : 7;
      return { pct, rpe, e1RM };
    });
    const avgPct = rows.reduce((s, r) => s + r.pct, 0) / rows.length;
    const avgRPE = rows.reduce((s, r) => s + r.rpe, 0) / rows.length;
    const max1RM = Math.max(...rows.map(r => r.e1RM));
    return {
      avgPct:  Math.round(avgPct * 100),
      avgRPE:  +avgRPE.toFixed(1),
      est1RM:  +max1RM.toFixed(1),
      label:   avgPct >= 0.85 ? 'muy alta' : avgPct >= 0.75 ? 'alta'
             : avgPct >= 0.65 ? 'moderada-alta' : avgPct >= 0.55 ? 'moderada' : 'baja',
    };
  }

  // ── Recovery status ────────────────────────────────────────────────────────
  function seGetRecoveryStatus(log) {
    if (!log?.length) return { status: 'sin_datos', readiness: 100, daysSinceLast: null };
    const weekAgo      = Date.now() - 7 * 86400000;
    const last7        = log.filter(s => (s.dateTs || 0) >= weekAgo);
    const daysTraining = new Set(last7.map(s => s.date)).size;
    const daysSinceLast = log[0]?.dateTs ? Math.floor((Date.now() - log[0].dateTs) / 86400000) : 99;
    const totalSets7   = last7.reduce((t, s) =>
      t + (s.exercises || []).reduce((ts, ex) => ts + (ex.sets?.length || 1), 0), 0);

    const sorted = [...log].sort((a, b) => b.dateTs - a.dateTs);
    const gaps   = [];
    for (let i = 0; i < Math.min(sorted.length - 1, 7); i++) {
      const g = Math.floor((sorted[i].dateTs - sorted[i + 1].dateTs) / 86400000);
      if (g >= 0) gaps.push(g);
    }
    const avgGap = gaps.length ? +(gaps.reduce((s, g) => s + g, 0) / gaps.length).toFixed(1) : null;

    let readiness = 100;
    if (daysSinceLast === 0) readiness -= 15;
    else if (daysSinceLast === 1) readiness -= 5;
    if (daysTraining >= 6) readiness -= 30;
    else if (daysTraining >= 5) readiness -= 18;
    else if (daysTraining >= 4) readiness -= 8;
    if (totalSets7 > 60) readiness -= 20;
    else if (totalSets7 > 45) readiness -= 10;
    else if (totalSets7 > 30) readiness -= 5;
    readiness = Math.max(0, Math.min(100, readiness));

    const status = readiness >= 80 ? 'recovered' : readiness >= 55 ? 'partial' : 'fatigued';
    const label  = status === 'recovered' ? 'recuperado'
                 : status === 'partial'   ? 'recuperación parcial' : 'fatigado';
    return { status, label, readiness, daysSinceLast, daysTraining, totalSets7, avgGap };
  }

  // ── Fatigue Score 0–100 ────────────────────────────────────────────────────
  // F1 Volume (35pts) + F2 Frequency (25pts) + F3 Intensity (25pts) + F4 Recency (15pts)
  function seGetFatigueScore(log, profile) {
    if (!log?.length) return { score: 0, level: 'sin datos', factors: [] };
    const weekAgo    = Date.now() - 7 * 86400000;
    const last7      = log.filter(s => (s.dateTs || 0) >= weekAgo);
    const targetDays = Number(profile?.trainingDays || profile?.dias || 4);
    const factors    = [];
    let score        = 0;

    // F1: Volume
    const totalSets = last7.reduce((t, s) =>
      t + (s.exercises || []).reduce((ts, ex) => ts + (ex.sets?.length || 1), 0), 0);
    const f1 = Math.min(35, Math.round((totalSets / 70) * 35));
    score += f1;
    if (f1 >= 18) factors.push(`Volumen: ${totalSets} series/sem`);

    // F2: Frequency
    const daysTraining = new Set(last7.map(s => s.date)).size;
    const f2 = Math.min(25, Math.round((daysTraining / Math.max(targetDays + 1, 5)) * 25));
    score += f2;
    if (daysTraining > targetDays) factors.push(`Frecuencia: ${daysTraining} días (objetivo ${targetDays})`);

    // F3: Intensity
    const intSamples = [];
    for (const session of last7) {
      for (const ex of session.exercises || []) {
        const est = seEstimateIntensity(ex.sets || []);
        if (est) intSamples.push(est.avgPct);
      }
    }
    const avgIntPct = intSamples.length ? intSamples.reduce((s, x) => s + x, 0) / intSamples.length : 0;
    const f3 = Math.min(25, Math.round((avgIntPct / 100) * 25));
    score += f3;
    if (avgIntPct > 70) factors.push(`Intensidad estimada: ~${Math.round(avgIntPct)}% 1RM`);

    // F4: Recency
    const daysSinceLast = log[0]?.dateTs ? Math.floor((Date.now() - log[0].dateTs) / 86400000) : 99;
    const f4 = daysSinceLast === 0 ? 15 : daysSinceLast === 1 ? 8 : 0;
    score += f4;

    score = Math.min(100, Math.round(score));
    const level = score >= 75 ? 'muy alta' : score >= 55 ? 'alta' : score >= 35 ? 'moderada' : 'baja';
    return { score, level, factors, totalSets, daysTraining, avgIntPct: Math.round(avgIntPct) };
  }

  // ── MEV/MAV/MRV zone per muscle ───────────────────────────────────────────
  function seGetVolumeStatus(log, profile) {
    const weeklySets = seGetMuscleWeeklySets(log, 1);
    const SCIENCE    = window.AtlasEngine?.SCIENCE || {};
    const result     = {};
    for (const [key, sci] of Object.entries(SCIENCE)) {
      const current = weeklySets[key] || 0;
      let zone, warning;
      if      (current === 0)          { zone = 'none';        warning = null; }
      else if (current < sci.mev)      { zone = 'below_mev';  warning = null; }
      else if (current <= sci.mav)     { zone = 'mev_to_mav'; warning = null; }
      else if (current <= sci.mrv)     { zone = 'mav_to_mrv'; warning = `${sci.name}: ${current} series — cerca del MRV (${sci.mrv})`; }
      else                             { zone = 'above_mrv';  warning = `${sci.name}: ${current} series supera MRV (${sci.mrv})`; }
      result[key] = { key, name: sci.name, current, mev: sci.mev, mav: sci.mav, mrv: sci.mrv, freq: sci.freq, zone, warning };
    }
    return result;
  }

  // ── Overload risk alerts ───────────────────────────────────────────────────
  function seGetOverloadRisks(log, profile) {
    const volStatus = seGetVolumeStatus(log, profile);
    const frequency = seGetMuscleFrequency(log, 1);
    const SCIENCE   = window.AtlasEngine?.SCIENCE || {};
    const risks     = [];

    for (const vs of Object.values(volStatus)) {
      if (vs.zone === 'above_mrv') {
        risks.push({ type: 'volume', muscle: vs.name, message: vs.warning, severity: 'high' });
      } else if (vs.zone === 'mav_to_mrv' && vs.current >= vs.mrv - 2) {
        risks.push({ type: 'volume', muscle: vs.name, message: vs.warning, severity: 'medium' });
      }
    }
    for (const [key, freq] of Object.entries(frequency)) {
      const sci = SCIENCE[key];
      if (sci && freq > sci.freq + 1) {
        risks.push({
          type: 'frequency', muscle: sci.name,
          message: `${sci.name}: frecuencia ${freq}×/sem supera la recomendada (${sci.freq}×).`,
          severity: freq > sci.freq + 2 ? 'high' : 'medium',
        });
      }
    }
    const rec = seGetRecoveryStatus(log);
    if (rec.daysTraining >= 6 && rec.totalSets7 > 40) {
      risks.push({ type: 'recovery', muscle: null,
        message: `${rec.daysTraining} días entrenados esta semana con ${rec.totalSets7} series — riesgo de sobreentrenamiento.`,
        severity: 'high' });
    }
    return risks;
  }

  // ── Stagnation per muscle group ───────────────────────────────────────────
  function seGetMuscleStagnation(log) {
    if (typeof peGetAllExercises === 'undefined') return [];
    const SCIENCE = window.AtlasEngine?.SCIENCE || {};

    // Map exercise name → primary muscle key using first log occurrence
    const exToMuscle = {};
    for (const session of log) {
      for (const ex of session.exercises || []) {
        if (exToMuscle[ex.name]) continue;
        const { primary } = getMuscles(ex);
        const key = primary.map(resolveMuscleName).find(Boolean);
        if (key) exToMuscle[ex.name] = key;
      }
    }

    // Group by muscle
    const byMuscle = {};
    for (const [exName, muscleKey] of Object.entries(exToMuscle)) {
      if (!byMuscle[muscleKey]) byMuscle[muscleKey] = [];
      byMuscle[muscleKey].push(exName);
    }

    const result = [];
    for (const [muscleKey, exercises] of Object.entries(byMuscle)) {
      const sci    = SCIENCE[muscleKey];
      const trends = exercises
        .map(name => {
          const hist  = peGetExerciseHistory(log, name);
          const trend = peDetectProgress(hist);
          return { name, ...trend };
        })
        .filter(e => e.trend !== 'insufficient');

      if (!trends.length) continue;
      const progressing = trends.filter(e => e.trend === 'progressing').length;
      const stagnant    = trends.filter(e => e.trend === 'stagnant').length;
      const declining   = trends.filter(e => e.trend === 'declining').length;

      if (stagnant + declining > 0 && progressing === 0) {
        result.push({
          muscleKey,
          name:      sci?.name || muscleKey,
          status:    declining > 0 ? 'declining' : 'stagnant',
          exercises: trends.filter(e => e.trend !== 'progressing'),
        });
      }
    }
    return result;
  }

  // ── Full scientific panel ─────────────────────────────────────────────────
  // Ready to display: volumeStatus, frequency, fatigue, recovery, overload, stagnation
  function seGetScientificPanel(log, profile) {
    if (!log?.length) return null;
    const volumeStatus = seGetVolumeStatus(log, profile);
    const frequency    = seGetMuscleFrequency(log, 1);
    const weeklySets   = seGetMuscleWeeklySets(log, 1);
    const fatigue      = seGetFatigueScore(log, profile);
    const recovery     = seGetRecoveryStatus(log);
    const overload     = seGetOverloadRisks(log, profile);
    const stagnation   = typeof peGetAllExercises !== 'undefined'
      ? seGetMuscleStagnation(log) : [];

    const topMuscles = Object.entries(weeklySets)
      .sort((a, b) => b[1] - a[1]).slice(0, 6)
      .map(([key, sets]) => ({ key, sets, name: window.AtlasEngine?.SCIENCE?.[key]?.name || key }));

    const mrvAlerts = Object.values(volumeStatus)
      .filter(v => ['mav_to_mrv', 'above_mrv'].includes(v.zone) && v.current > 0)
      .sort((a, b) => (b.current / b.mrv) - (a.current / a.mrv));

    const belowMEV = Object.values(volumeStatus)
      .filter(v => v.zone === 'below_mev' && v.current > 0)
      .map(v => ({ ...v, gap: v.mev - v.current }));

    return {
      volumeStatus, frequency, weeklySets,
      fatigue, recovery, overload, stagnation,
      topMuscles, mrvAlerts, belowMEV,
      generatedAt: Date.now(),
    };
  }

  // ── Coach-facing text lines ────────────────────────────────────────────────
  function seGetCoachSummary(log, profile) {
    const panel = seGetScientificPanel(log, profile);
    if (!panel) return null;
    const w = panel.weeklySets;
    const lines = [];
    const push = (w.pecho || 0) + (w.delt_ant || 0) + (w.delt_lat || 0) + (w.triceps || 0);
    const pull = (w.dorsal || 0) + (w.trapecio || 0) + (w.biceps || 0);
    const legs = (w.cuadriceps || 0) + (w.isquio || 0) + (w.gluteos || 0);
    if (push > 0) lines.push(`Empuje: ${push} series/sem`);
    if (pull > 0) lines.push(`Tracción: ${pull} series/sem`);
    if (legs > 0) lines.push(`Piernas: ${legs} series/sem`);
    lines.push(`Fatiga estimada: ${panel.fatigue.score}/100 (${panel.fatigue.level})`);
    panel.mrvAlerts.forEach(a => lines.push(`⚠ ${a.name}: ${a.current} series (MRV ${a.mrv})`));
    if (panel.fatigue.score >= 70 || panel.overload.some(r => r.severity === 'high')) {
      lines.push('Considera un período de deload (reducir volumen 40–50% durante 1 semana)');
    }
    return lines.join('\n');
  }

  // ── Public API ─────────────────────────────────────────────────────────────
  return {
    MUSCLE_KEY_MAP,
    resolveMuscleName,
    getMuscles,
    seGetMuscleWeeklySets,
    seGetMuscleFrequency,
    seEstimateIntensity,
    seGetRecoveryStatus,
    seGetFatigueScore,
    seGetVolumeStatus,
    seGetMuscleStagnation,
    seGetOverloadRisks,
    seGetScientificPanel,
    seGetCoachSummary,
  };
})();

Object.assign(window, { AtlasScientificEngine });
