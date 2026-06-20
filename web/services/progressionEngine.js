// Atlas Progression Engine — pure functions, no fake data
// Input: state.log[] — [{date, dateTs, exercises:[{name, group, sets:[{kg,reps,rir?}]}]}]

function peGetExerciseHistory(log, exerciseName) {
  const entries = [];
  for (const session of log) {
    const ex = (session.exercises || []).find(e => e.name === exerciseName);
    if (!ex || !ex.sets?.length) continue;
    const validSets = ex.sets.filter(s => s.kg && Number(s.kg) > 0);
    if (!validSets.length) continue;
    entries.push({
      date:        session.date,
      dateTs:      session.dateTs || 0,
      sets:        ex.sets,
      maxKg:       Math.max(...validSets.map(s => Number(s.kg))),
      totalVolume: validSets.reduce((a, s) => a + Number(s.kg) * Number(s.reps || 1), 0),
      totalReps:   validSets.reduce((a, s) => a + Number(s.reps || 0), 0),
    });
  }
  return entries.sort((a, b) => b.dateTs - a.dateTs);
}

function peDetectProgress(history) {
  if (history.length < 2) return { trend: 'insufficient', sessions: history.length };
  const window  = history.slice(0, Math.min(6, history.length));
  const newest  = window[0].maxKg;
  const oldest  = window[window.length - 1].maxKg;
  const delta   = +(newest - oldest).toFixed(1);
  const pct     = oldest > 0 ? Math.round((delta / oldest) * 100) : 0;
  const trend   = delta > 0 ? 'progressing' : delta < -2 ? 'declining' : 'stagnant';
  return { trend, delta, pct, sessions: window.length, newest, oldest };
}

function peGetAllExercises(log) {
  const names = new Set();
  for (const s of log) for (const ex of s.exercises || []) if (ex.name) names.add(ex.name);
  return [...names];
}

function peGetStagnantExercises(log, minSessions = 3) {
  return peGetAllExercises(log)
    .map(name => {
      const hist = peGetExerciseHistory(log, name);
      if (hist.length < minSessions) return null;
      const { trend, sessions, newest } = peDetectProgress(hist);
      if (trend !== 'stagnant' && trend !== 'declining') return null;
      return { name, trend, sessions, kg: newest };
    })
    .filter(Boolean)
    .sort((a, b) => b.sessions - a.sessions);
}

function peGetTopProgress(log, n = 3) {
  return peGetAllExercises(log)
    .map(name => {
      const hist = peGetExerciseHistory(log, name);
      if (hist.length < 2) return null;
      const { trend, delta, pct, sessions } = peDetectProgress(hist);
      if (trend !== 'progressing') return null;
      return { name, delta, pct, sessions };
    })
    .filter(Boolean)
    .sort((a, b) => b.pct - a.pct)
    .slice(0, n);
}

function peGetWeeklyVolume(log, nWeeks = 8) {
  const MS_WEEK = 7 * 24 * 60 * 60 * 1000;
  const now     = Date.now();
  return Array.from({ length: nWeeks }, (_, i) => {
    const wEnd     = now - i * MS_WEEK;
    const wStart   = wEnd - MS_WEEK;
    const sessions = log.filter(s => { const ts = s.dateTs || 0; return ts >= wStart && ts < wEnd; });
    let totalSets = 0, totalVolume = 0;
    for (const s of sessions) {
      for (const ex of s.exercises || []) {
        for (const set of ex.sets || []) {
          totalSets++;
          if (set.kg && set.reps) totalVolume += Number(set.kg) * Number(set.reps);
        }
      }
    }
    const label = new Date(wEnd).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' });
    return { label, totalSets, totalVolume: Math.round(totalVolume) };
  }).reverse();
}

function peNeedsDeload(log) {
  if (log.length < 3) return { needed: false, reasons: [] };
  const reasons = [];

  const last7Ms   = Date.now() - 7 * 86400000;
  const last7Days = new Set(log.filter(s => (s.dateTs || 0) > last7Ms).map(s => s.date)).size;
  if (last7Days >= 5) reasons.push(`Llevas ${last7Days} días de entrenamiento en los últimos 7 días`);

  const vols    = peGetWeeklyVolume(log, 4);
  const recent2 = vols.slice(2).reduce((a, w) => a + w.totalVolume, 0);
  const prev2   = vols.slice(0, 2).reduce((a, w) => a + w.totalVolume, 0);
  if (prev2 > 0 && recent2 > prev2 * 1.3) {
    reasons.push(`Volumen de las últimas 2 semanas un ${Math.round((recent2 / prev2 - 1) * 100)}% mayor al período previo`);
  }

  const declining = peGetStagnantExercises(log, 4).filter(e => e.trend === 'declining');
  if (declining.length >= 2) {
    reasons.push(`${declining.length} ejercicios en descenso de rendimiento`);
  }

  return { needed: reasons.length >= 1, reasons };
}

function peGetProgressSummary(log) {
  if (!log || log.length === 0) return null;
  const thisWeek = peGetWeeklyVolume(log, 1)[0] || { totalSets: 0, totalVolume: 0 };
  return {
    totalExercises: peGetAllExercises(log).length,
    thisWeekSets:   thisWeek.totalSets,
    thisWeekVolume: thisWeek.totalVolume,
    topProgress:    peGetTopProgress(log, 3),
    stagnant:       peGetStagnantExercises(log, 3),
    deload:         peNeedsDeload(log),
    weeklyVolume:   peGetWeeklyVolume(log, 8),
  };
}

Object.assign(window, {
  peGetExerciseHistory, peDetectProgress, peGetAllExercises,
  peGetStagnantExercises, peGetTopProgress, peGetWeeklyVolume,
  peNeedsDeload, peGetProgressSummary,
});
