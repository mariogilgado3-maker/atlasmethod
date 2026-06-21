// Atlas Progression Engine — centralized analytics
(function() {
  function todayStr() { return new Date().toISOString().slice(0,10); }

  function weekKey(dateStr) {
    const d = new Date(dateStr + 'T12:00:00Z');
    const jan1 = new Date(d.getFullYear(), 0, 1);
    const week = Math.ceil(((d - jan1) / 86400000 + jan1.getDay() + 1) / 7);
    return `${d.getFullYear()}-W${String(week).padStart(2,'0')}`;
  }

  function getExerciseRecord(log, name) {
    const sessions = log.filter(s => s.exercises?.some(e => e.name === name));
    if (!sessions.length) return null;
    const history = sessions.map(s => {
      const ex = s.exercises.find(e => e.name === name);
      const bestSet = (ex.sets || []).reduce((b, st) => {
        const v = parseFloat(st.kg) || 0;
        return v > (parseFloat(b.kg) || 0) ? st : b;
      }, {});
      const vol = (ex.sets || []).reduce((sum, st) => sum + (parseFloat(st.kg)||0) * (parseInt(st.reps)||0), 0);
      const est1RM = parseFloat(bestSet.kg) && parseInt(bestSet.reps)
        ? (parseFloat(bestSet.kg) * (1 + parseInt(bestSet.reps) / 30)).toFixed(1)
        : null;
      return { date: s.date, dateTs: s.dateTs || 0, bestKg: parseFloat(bestSet.kg)||0, bestReps: parseInt(bestSet.reps)||0, volume: vol, est1RM: est1RM ? parseFloat(est1RM) : null };
    }).sort((a,b) => a.dateTs - b.dateTs);

    const recent = history.slice(-3);
    const est1RMValues = recent.map(h => h.est1RM).filter(Boolean);
    const trend = est1RMValues.length >= 2
      ? (est1RMValues[est1RMValues.length-1] > est1RMValues[0] ? 'up' : est1RMValues[est1RMValues.length-1] < est1RMValues[0] ? 'down' : 'flat')
      : 'flat';
    const best = history.reduce((b, h) => h.est1RM > (b.est1RM||0) ? h : b, {});

    return { exerciseName: name, history, bestSet: best, estimated1RM: best.est1RM, trend, sessions: sessions.length };
  }

  function getStrengthMetrics(log) {
    const names = [...new Set(log.flatMap(s => s.exercises?.map(e => e.name) || []))];
    const records = names.map(n => getExerciseRecord(log, n)).filter(Boolean);
    const topProgressing = records.filter(r => r.trend === 'up' && r.sessions >= 2).slice(0,3);
    const stagnant = records.filter(r => r.trend === 'flat' && r.sessions >= 3).slice(0,3);
    return { exercises: records, topProgressing, stagnant };
  }

  function getVolumeMetrics(log) {
    const now = Date.now();
    const weekAgo = now - 7 * 86400000;
    const recentSessions = log.filter(s => (s.dateTs || 0) >= weekAgo);
    const setsByMuscle = {};
    recentSessions.forEach(s => {
      s.exercises?.forEach(ex => {
        const muscles = Array.isArray(ex.muscles) ? ex.muscles : (ex.muscles?.primary || []);
        muscles.slice(0,1).forEach(m => {
          const key = m.toLowerCase().replace(/\s+/g,'_');
          setsByMuscle[key] = (setsByMuscle[key] || 0) + (ex.sets?.length || 0);
        });
      });
    });
    return { setsByMuscle, weeklyVolume: Object.values(setsByMuscle).reduce((a,b)=>a+b,0), recentSessions: recentSessions.length };
  }

  function getAdherence(log, profile) {
    const planned = (profile?.trainingDays || profile?.dias || 3) * 4;
    const monthAgo = Date.now() - 28 * 86400000;
    const completed = log.filter(s => (s.dateTs || 0) >= monthAgo).length;
    const pct = planned > 0 ? Math.round((completed / planned) * 100) : 0;
    const label = pct >= 85 ? 'Excelente' : pct >= 65 ? 'Buena' : pct >= 45 ? 'Regular' : 'Baja';
    return { planned, completed, pct, label };
  }

  function getConsistency(log) {
    if (!log.length) return { streak: 0, activeWeeks: 0, sessionsPerMonth: 0 };
    const weeks = new Set(log.map(s => weekKey(s.date || todayStr())));
    const allWeeks = [...weeks].sort();
    let streak = 0;
    const currentWeek = weekKey(todayStr());
    let w = currentWeek;
    while (weeks.has(w)) {
      streak++;
      const [yr, wk] = w.split('-W').map(Number);
      w = wk > 1 ? `${yr}-W${String(wk-1).padStart(2,'0')}` : `${yr-1}-W52`;
    }
    const monthAgo = Date.now() - 28 * 86400000;
    const sessionsPerMonth = log.filter(s => (s.dateTs||0) >= monthAgo).length;
    return { streak, activeWeeks: allWeeks.length, sessionsPerMonth };
  }

  function getAtlasScore(log, profile) {
    const adherence = getAdherence(log, profile);
    const consistency = getConsistency(log);
    const strength = getStrengthMetrics(log);

    const adherencePts = Math.min(30, Math.round(adherence.pct * 0.30));
    const consistencyPts = Math.min(25, Math.round(consistency.streak * 5 + consistency.activeWeeks * 2));
    const progressionPts = Math.min(30, strength.topProgressing.length * 10);
    const volumePts = Math.min(15, Math.round(getVolumeMetrics(log).weeklyVolume / 2));

    const total = adherencePts + consistencyPts + progressionPts + volumePts;
    const label = total >= 80 ? 'Elite' : total >= 60 ? 'Avanzado' : total >= 40 ? 'Progresando' : total >= 20 ? 'Iniciando' : 'Comenzando';

    return {
      total,
      label,
      pillars: { adherence: adherencePts, consistency: consistencyPts, progression: progressionPts, volume: volumePts },
    };
  }

  function getAlerts(log, profile) {
    const alerts = [];
    const consistency = getConsistency(log);
    const volume = getVolumeMetrics(log);
    const strength = getStrengthMetrics(log);

    if (log.length > 0) {
      const lastTs = Math.max(...log.map(s => s.dateTs || 0));
      const daysSince = Math.floor((Date.now() - lastTs) / 86400000);
      if (daysSince > 7) alerts.push({ type:'frequency_drop', severity:'warning', message:`Llevas ${daysSince} días sin entrenar — considera retomar esta semana.` });
    }

    if (volume.weeklyVolume === 0 && log.length > 3) {
      alerts.push({ type:'no_volume', severity:'warning', message:'Sin volumen registrado esta semana.' });
    }

    strength.topProgressing.forEach(r => {
      alerts.push({ type:'notable_improvement', severity:'success', message:`Progreso en ${r.exerciseName}: tendencia al alza en las últimas ${r.sessions} sesiones.` });
    });

    strength.stagnant.slice(0,1).forEach(r => {
      alerts.push({ type:'plateau', severity:'info', message:`Posible plateau en ${r.exerciseName} — sin cambios en ${r.sessions} sesiones.` });
    });

    return alerts;
  }

  function getFullPanel(log, profile) {
    return {
      strength:    getStrengthMetrics(log),
      volume:      getVolumeMetrics(log),
      adherence:   getAdherence(log, profile),
      consistency: getConsistency(log),
      score:       getAtlasScore(log, profile),
      alerts:      getAlerts(log, profile),
    };
  }

  window.AtlasProgressionEngine = {
    getExerciseRecord,
    getStrengthMetrics,
    getVolumeMetrics,
    getAdherence,
    getConsistency,
    getAtlasScore,
    getAlerts,
    getFullPanel,
  };
})();
