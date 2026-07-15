(function() {
  'use strict';
  const SESSION_KEY = 'atlas.activesession.v1';
  // Canonical session history lives in atlas.store.v2 → state.log (written via
  // the store's logSession action). This service no longer keeps its own copy.
  const STORE_KEY = 'atlas.store.v2';

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
    // The caller is responsible for persisting via the store's logSession action
    // (single source of truth: atlas.store.v2 → state.log).
    localStorage.removeItem(SESSION_KEY);
    return completed;
  }

  // Reads the canonical history (store.log) and adapts entries to player format
  function wsGetHistory(n) {
    const store = _r(STORE_KEY);
    const log = (store && Array.isArray(store.log)) ? store.log : [];
    return log.slice(0, n || 20).map(e => {
      let totalVolume = 0, completedSets = 0;
      const exercises = (e.exercises || []).map(ex => ({
        name: ex.name,
        group: ex.group || '',
        muscles: Array.isArray(ex.muscles) ? { primary: ex.muscles, secondary: [] }
               : (ex.muscles || { primary: [], secondary: [] }),
        sets: (ex.sets || []).map(st => {
          completedSets++;
          totalVolume += (parseFloat(st.kg) || 0) * (parseInt(st.reps) || 0);
          return { kg: st.kg, reps: st.reps, done: true };
        }),
      }));
      return {
        id: e.id, date: e.date, dateTs: e.dateTs, status: 'completed',
        routineName: e.routineName || 'Entrenamiento',
        sessionName: e.sessionName || '',
        duration: e.duration || 0,
        totalVolume: Math.round(totalVolume),
        completedSets, totalSets: completedSets,
        exercises,
      };
    });
  }

  Object.assign(window, { WorkoutSessionStore: { create: wsCreate, getActive: wsGetActive, save: wsSave, complete: wsComplete, getHistory: wsGetHistory, discard: wsDiscard, normalize: wsNormalize } });
})();
