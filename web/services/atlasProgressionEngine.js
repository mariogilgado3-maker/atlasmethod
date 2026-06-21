// Atlas Progression Engine — centralized training analytics
// Wraps progressionEngine.js + scientificEngine.js, adds: per-exercise records,
// 1RM tracking, adherence, consistency, Atlas Progress Score, auto-alerts.
// Pure functions. Load AFTER progressionEngine.js and scientificEngine.js.

(function () {
  'use strict';

  // ── Epley 1RM ────────────────────────────────────────────────────────────────
  function epley(kg, reps) {
    kg = parseFloat(kg); reps = parseInt(reps);
    if (!kg || !reps || kg <= 0 || reps <= 0) return 0;
    return Math.round(kg * (1 + reps / 30) * 10) / 10;
  }

  // ── Per-exercise record ───────────────────────────────────────────────────────
  // Returns { exerciseName, history, bestSet, bestVolume, estimated1RM, est1RMHistory, trend, sessions }
  function apeGetExerciseRecord(log, exerciseName) {
    const history = typeof peGetExerciseHistory !== 'undefined'
      ? peGetExerciseHistory(log, exerciseName) : [];
    if (!history.length) return null;

    let bestSet = null, bestVolume = null, best1RM = 0;
    const est1RMHistory = [];

    for (const entry of history) {
      let sessionBest = 0;
      for (const s of (entry.sets || [])) {
        const e1rm = epley(s.kg, s.reps);
        if (e1rm > sessionBest) sessionBest = e1rm;
        if (e1rm > best1RM) {
          best1RM = e1rm;
          bestSet = { kg: parseFloat(s.kg), reps: parseInt(s.reps), e1rm, date: entry.date, dateTs: entry.dateTs };
        }
      }
      if (sessionBest > 0) est1RMHistory.push({ date: entry.date, dateTs: entry.dateTs, e1rm: sessionBest });

      if (!bestVolume || entry.totalVolume > bestVolume.totalVolume) bestVolume = { ...entry };
    }

    const trend = typeof peDetectProgress !== 'undefined' ? peDetectProgress(history) : null;

    return {
      exerciseName,
      history:       history.slice(0, 20),
      bestSet,
      bestVolume,
      estimated1RM:  bestSet ? { value: best1RM, date: bestSet.date } : null,
      est1RMHistory: est1RMHistory.reverse(), // chronological order
      trend:         trend?.trend || 'insufficient',
      delta:         trend?.delta || 0,
      pct:           trend?.pct   || 0,
      sessions:      history.length,
    };
  }

  // ── Strength metrics ──────────────────────────────────────────────────────────
  function apeGetStrengthMetrics(log, n) {
    if (!log || !log.length) return { exercises: [], topProgressing: [], stagnant: [] };
    const names = typeof peGetAllExercises !== 'undefined' ? peGetAllExercises(log) : [];

    const records = names
      .map(name => apeGetExerciseRecord(log, name))
      .filter(r => r && r.sessions >= 2);

    const topProgressing = records
      .filter(r => r.trend === 'progressing')
      .sort((a, b) => b.pct - a.pct)
      .slice(0, n || 5);

    const stagnant = records
      .filter(r => r.trend === 'stagnant' || r.trend === 'declining')
      .sort((a, b) => b.sessions - a.sessions)
      .slice(0, n || 5);

    return {
      exercises: records
        .sort((a, b) => (b.estimated1RM?.value || 0) - (a.estimated1RM?.value || 0))
        .slice(0, 10),
      topProgressing,
      stagnant,
    };
  }

  // ── Volume metrics ────────────────────────────────────────────────────────────
  function apeGetVolumeMetrics(log) {
    if (!log || !log.length) return { weeklyVolume: [], setsByMuscle: {}, frequencyByMuscle: {}, recentSessions: 0 };

    const weeklyVolume = typeof peGetWeeklyVolume !== 'undefined'
      ? peGetWeeklyVolume(log, 8) : [];

    const MS4W = 28 * 86400000;
    const recentLog = log.filter(s => (s.dateTs || 0) > Date.now() - MS4W);

    const setsByMuscle = {};
    const daysByMuscle = {};

    for (const session of recentLog) {
      const sessionMuscles = new Set();
      for (const ex of (session.exercises || [])) {
        const muscles = Array.isArray(ex.muscles) ? ex.muscles : (ex.muscles?.primary || []);
        const sets = (ex.sets || []).length;
        for (const m of muscles) {
          setsByMuscle[m] = (setsByMuscle[m] || 0) + sets;
          sessionMuscles.add(m);
        }
      }
      for (const m of sessionMuscles) daysByMuscle[m] = (daysByMuscle[m] || 0) + 1;
    }

    return { weeklyVolume, setsByMuscle, frequencyByMuscle: daysByMuscle, recentSessions: recentLog.length };
  }

  // ── Adherence metrics ─────────────────────────────────────────────────────────
  function apeGetAdherence(log, profile) {
    const trainingDays = profile?.trainingDays || 3;
    const MS4W = 28 * 86400000;
    const recentLog = log.filter(s => (s.dateTs || 0) > Date.now() - MS4W);
    const uniqueDays = new Set(recentLog.map(s => s.date)).size;
    const plannedTotal = trainingDays * 4;
    const pct = Math.min(100, plannedTotal > 0 ? Math.round((uniqueDays / plannedTotal) * 100) : 0);

    const MS1W = 7 * 86400000;
    const now  = Date.now();
    const weeks = Array.from({ length: 4 }, (_, i) => {
      const wEnd   = now - i * MS1W;
      const wStart = wEnd - MS1W;
      const days   = new Set(log.filter(s => (s.dateTs || 0) >= wStart && (s.dateTs || 0) < wEnd).map(s => s.date)).size;
      return { week: 3 - i, days, planned: trainingDays };
    }).reverse();

    return {
      planned:   plannedTotal,
      completed: uniqueDays,
      pct,
      label: pct >= 90 ? 'Excelente' : pct >= 75 ? 'Buena' : pct >= 50 ? 'Regular' : 'Baja',
      weeks,
    };
  }

  // ── Consistency metrics ───────────────────────────────────────────────────────
  function apeGetConsistency(log) {
    if (!log || !log.length) return { streak: 0, activeWeeks: 0, sessionsPerMonth: 0 };

    // Current streak (consecutive days with sessions, going backwards from today)
    const dates = [...new Set(log.map(s => s.date))].sort((a, b) => new Date(b) - new Date(a));
    let streak = 0;
    let ref = new Date(); ref.setHours(0, 0, 0, 0);
    for (const d of dates) {
      const dt = new Date(d); dt.setHours(0, 0, 0, 0);
      const diff = Math.round((ref - dt) / 86400000);
      if (diff <= 1) { streak++; ref = dt; } else break;
    }

    // Active weeks in last 8 weeks
    const now = Date.now();
    const MS1W = 7 * 86400000;
    let activeWeeks = 0;
    for (let i = 0; i < 8; i++) {
      const wStart = now - (i + 1) * MS1W;
      const wEnd   = now - i * MS1W;
      if (log.some(s => (s.dateTs || 0) >= wStart && (s.dateTs || 0) < wEnd)) activeWeeks++;
    }

    const MS30 = 30 * 86400000;
    const sessionsPerMonth = new Set(log.filter(s => (s.dateTs || 0) > now - MS30).map(s => s.date)).size;

    return { streak, activeWeeks, sessionsPerMonth, maxWeeks: 8 };
  }

  // ── Atlas Progress Score (0-100) ──────────────────────────────────────────────
  // Longitudinal metric — different from Builder's session-quality AtlasScore.
  // Pillars: adherence (30pts) + consistency (25pts) + progression (30pts) + volume (15pts)
  function apeGetAtlasScore(log, profile) {
    if (!log || !log.length) return { total: 0, pillars: [], label: 'Sin datos' };

    const adh = apeGetAdherence(log, profile);
    const con = apeGetConsistency(log);

    const adhPts = Math.round(adh.pct * 0.30);
    const conPts = Math.round((con.activeWeeks / 8) * 25);

    // Progression: % of tracked exercises showing positive trend
    const allEx = typeof peGetAllExercises !== 'undefined' ? peGetAllExercises(log) : [];
    let progressing = 0, tracked = 0;
    for (const name of allEx) {
      const hist = typeof peGetExerciseHistory !== 'undefined' ? peGetExerciseHistory(log, name) : [];
      if (hist.length < 2) continue;
      tracked++;
      const { trend } = typeof peDetectProgress !== 'undefined' ? peDetectProgress(hist) : { trend: 'insufficient' };
      if (trend === 'progressing') progressing++;
    }
    const progPct = tracked > 0 ? progressing / tracked : 0;
    const progPts = Math.round(progPct * 30);

    // Volume compliance: muscles in MEV-MAV-MRV zone (from Scientific Engine)
    let volPts = 7;
    if (typeof AtlasScientificEngine !== 'undefined' && log.length >= 2) {
      try {
        const vStatus = AtlasScientificEngine.seGetVolumeStatus(log, profile);
        const muscles  = Object.values(vStatus);
        const withData = muscles.filter(m => m.current > 0).length;
        const inRange  = muscles.filter(m => m.zone === 'mev_to_mav' || m.zone === 'mav_to_mrv').length;
        volPts = withData > 0 ? Math.round((inRange / withData) * 15) : 7;
      } catch {}
    }

    const total = Math.min(100, adhPts + conPts + progPts + volPts);
    const label = total >= 85 ? 'Élite' : total >= 70 ? 'Avanzado' : total >= 50 ? 'En progreso' : total >= 25 ? 'Iniciando' : 'Sin datos';

    return {
      total, label,
      pillars: [
        { key: 'adherencia',  label: 'Adherencia',   pts: adhPts,  max: 30, value: `${adh.pct}%`                  },
        { key: 'consistencia',label: 'Consistencia',  pts: conPts,  max: 25, value: `${con.activeWeeks}/8 sem`     },
        { key: 'progresion',  label: 'Progresión',   pts: progPts, max: 30, value: `${Math.round(progPct * 100)}%` },
        { key: 'volumen',     label: 'Volumen',       pts: volPts,  max: 15, value: `${volPts}/15 pts`             },
      ],
    };
  }

  // ── Auto-alerts ───────────────────────────────────────────────────────────────
  // Returns array of { type, severity:'success'|'info'|'warning', message, ... }
  function apeGetAlerts(log, profile) {
    const alerts = [];
    if (!log || !log.length) return alerts;

    const now  = Date.now();
    const MS1W = 7 * 86400000;
    const MS2W = 14 * 86400000;

    // 1. Frequency drop — nothing trained this week, but was training last week
    const thisWeek = new Set(log.filter(s => (s.dateTs || 0) > now - MS1W).map(s => s.date)).size;
    const prevWeek = new Set(log.filter(s => (s.dateTs || 0) > now - MS2W && (s.dateTs || 0) <= now - MS1W).map(s => s.date)).size;
    if (thisWeek === 0 && prevWeek >= 2) {
      alerts.push({ type: 'frequency_drop', severity: 'warning', message: 'Llevas más de 7 días sin entrenar', ts: now });
    }

    // 2. Volume drop — this week <60% of 3-week average
    const vols = typeof peGetWeeklyVolume !== 'undefined' ? peGetWeeklyVolume(log, 4) : [];
    if (vols.length >= 4) {
      const thisVol = vols[vols.length - 1].totalVolume;
      const avg3    = (vols[0].totalVolume + vols[1].totalVolume + vols[2].totalVolume) / 3;
      if (avg3 > 0 && thisVol < avg3 * 0.60) {
        alerts.push({ type: 'volume_drop', severity: 'warning', message: `Volumen esta semana ${Math.round((1 - thisVol / avg3) * 100)}% por debajo del promedio reciente`, ts: now });
      }
    }

    // 3. Stagnation — ≥2 exercises declining or stagnant across ≥4 sessions
    const stagnant = typeof peGetStagnantExercises !== 'undefined' ? peGetStagnantExercises(log, 4) : [];
    if (stagnant.length >= 2) {
      alerts.push({
        type: 'stagnation', severity: 'info',
        message: `Sin progreso en ${stagnant.length} ejercicios: ${stagnant.slice(0, 2).map(e => e.name).join(', ')}`,
        exercises: stagnant.map(e => e.name), ts: now,
      });
    }

    // 4. Notable improvement — top progressing exercise ≥10%
    const topProg = typeof peGetTopProgress !== 'undefined' ? peGetTopProgress(log, 1) : [];
    if (topProg.length > 0 && topProg[0].pct >= 10) {
      const t = topProg[0];
      alerts.push({ type: 'notable_improvement', severity: 'success', message: `${t.name}: mejora del ${t.pct}% en las últimas ${t.sessions} sesiones`, exerciseName: t.name, ts: now });
    }

    // 5. Deload needed
    const deload = typeof peNeedsDeload !== 'undefined' ? peNeedsDeload(log) : { needed: false };
    if (deload.needed) {
      alerts.push({ type: 'deload_needed', severity: 'warning', message: 'Señales de fatiga acumulada detectadas. Considera una semana de deload.', ts: now });
    }

    // 6. MRV exceeded (Scientific Engine)
    if (typeof AtlasScientificEngine !== 'undefined' && log.length >= 2) {
      try {
        const panel = AtlasScientificEngine.seGetScientificPanel(log, profile);
        if (panel.mrvAlerts && panel.mrvAlerts.length > 0) {
          const a = panel.mrvAlerts[0];
          alerts.push({ type: 'mrv_exceeded', severity: 'warning', message: `${a.name} supera el MRV recomendado (${a.current} series, máx. ${a.mrv})`, ts: now });
        }
      } catch {}
    }

    return alerts;
  }

  // ── Full panel (single call for all consumers) ────────────────────────────────
  function apeGetFullPanel(log, profile) {
    return {
      strength:    apeGetStrengthMetrics(log),
      volume:      apeGetVolumeMetrics(log),
      adherence:   apeGetAdherence(log, profile),
      consistency: apeGetConsistency(log),
      score:       apeGetAtlasScore(log, profile),
      alerts:      apeGetAlerts(log, profile),
    };
  }

  Object.assign(window, {
    AtlasProgressionEngine: {
      getExerciseRecord:  apeGetExerciseRecord,
      getStrengthMetrics: apeGetStrengthMetrics,
      getVolumeMetrics:   apeGetVolumeMetrics,
      getAdherence:       apeGetAdherence,
      getConsistency:     apeGetConsistency,
      getAtlasScore:      apeGetAtlasScore,
      getAlerts:          apeGetAlerts,
      getFullPanel:       apeGetFullPanel,
    },
  });
})();
