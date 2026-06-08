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
