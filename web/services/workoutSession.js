(function() {
  'use strict';
  const SESSION_KEY = 'atlas.activesession.v1';
  const HISTORY_KEY = 'atlas.sessionhistory.v1';

  function _r(k)    { try { return JSON.parse(localStorage.getItem(k) || 'null'); } catch { return null; } }
  function _w(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} }

  // Normalize raw exercises (from Coach or Builder) into player format
  function wsNormalize(rawExs) {
    return (rawExs || []).map(ex => {
      const n = Math.max(1, parseInt(ex.setsCount ?? (Array.isArray(ex.sets) ? ex.sets.length : ex.sets) ?? 3) || 3);
      const muscles = Array.isArray(ex.muscles) ? { primary: ex.muscles, secondary: [] }
                    : (ex.muscles || { primary: [], secondary: [] });
      return {
        id: ex.id || ('ex_' + Math.random().toString(36).slice(2)),
        name: ex.name || 'Ejercicio',
        muscles,
        group: ex.group || ex.category || '',
        targetSets: n,
        repsRange: ex.repsRange || String(ex.reps || '8-12'),
        rir: ex.rir ?? 2,
        rest: ex.rest || '90s',
        sets: Array.from({ length: n }, (_, i) => ({
          idx: i,
          kg: (Array.isArray(ex.sets) && ex.sets[i]?.kg) ? String(ex.sets[i].kg) : '',
          reps: (Array.isArray(ex.sets) && ex.sets[i]?.reps) ? String(ex.sets[i].reps) : '',
          rpe: null,
          done: false,
          doneAt: null,
        })),
      };
    });
  }

  function wsCreate(rawExercises, meta) {
    const session = {
      id:          String(Date.now()),
      routineId:   meta?.routineId   || null,
      routineName: meta?.routineName || 'Entrenamiento',
      sessionName: meta?.sessionName || 'Sesión',
      date:        new Date().toDateString(),
      dateTs:      Date.now(),
      status:      'active',
      startTime:   Date.now(),
      endTime:     null,
      exercises:   wsNormalize(rawExercises),
    };
    _w(SESSION_KEY, session);
    return session;
  }

  function wsGetActive()       { const s = _r(SESSION_KEY); return s?.status === 'active' ? s : null; }
  function wsSave(session)     { _w(SESSION_KEY, { ...session, status: 'active' }); }
  function wsDiscard()         { localStorage.removeItem(SESSION_KEY); }

  function wsComplete(session) {
    const endTime = Date.now();
    const duration = Math.round((endTime - (session.startTime || endTime)) / 1000);
    let totalVolume = 0, completedSets = 0, totalSets = 0;
    for (const ex of session.exercises) {
      for (const s of ex.sets) {
        totalSets++;
        if (s.done) { completedSets++; totalVolume += (parseFloat(s.kg) || 0) * (parseInt(s.reps) || 0); }
      }
    }
    const completed = { ...session, status: 'completed', endTime, duration, totalVolume: Math.round(totalVolume), completedSets, totalSets };
    const history   = (_r(HISTORY_KEY) || []);
    _w(HISTORY_KEY, [completed, ...history].slice(0, 50));
    localStorage.removeItem(SESSION_KEY);
    return completed;
  }

  function wsGetHistory(n) { return (_r(HISTORY_KEY) || []).slice(0, n || 20); }

  Object.assign(window, { WorkoutSessionStore: { create: wsCreate, getActive: wsGetActive, save: wsSave, complete: wsComplete, getHistory: wsGetHistory, discard: wsDiscard, normalize: wsNormalize } });
})();
