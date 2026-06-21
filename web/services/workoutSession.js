// WorkoutSession — active session store
(function() {
  const ACTIVE_KEY   = 'atlas.activesession.v1';
  const HISTORY_KEY  = 'atlas.sessionhistory.v1';

  function normalize(rawExs) {
    return (rawExs || []).map(ex => ({
      id:      ex.id || String(Math.random()),
      name:    ex.name || 'Ejercicio',
      muscles: Array.isArray(ex.muscles) ? ex.muscles : (ex.muscles?.primary || []),
      pattern: ex.pattern || '',
      rest:    ex.rest || '90s',
      repsRange: ex.repsRange || '8-12',
      rir:     ex.rir ?? 2,
      sets: Array.isArray(ex.sets)
        ? ex.sets.map(s => ({ kg: s.kg || '', reps: s.reps || '10', rpe: s.rpe || null, done: false }))
        : Array.from({ length: ex.setsCount || 3 }, () => ({ kg: '', reps: (ex.repsRange || '8-12').split('-')[0], rpe: null, done: false })),
    }));
  }

  const WorkoutSessionStore = {
    create(rawExs, meta) {
      const session = {
        id:        `ws-${Date.now()}`,
        status:    'active',
        startedAt: Date.now(),
        meta:      meta || {},
        exercises: normalize(rawExs),
      };
      try { localStorage.setItem(ACTIVE_KEY, JSON.stringify(session)); } catch {}
      return session;
    },

    getActive() {
      try { return JSON.parse(localStorage.getItem(ACTIVE_KEY) || 'null'); } catch { return null; }
    },

    save(session) {
      try { localStorage.setItem(ACTIVE_KEY, JSON.stringify(session)); } catch {}
    },

    complete(session) {
      const completed = { ...session, status: 'completed', completedAt: Date.now() };
      try {
        const history = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
        history.unshift(completed);
        localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, 50)));
        localStorage.removeItem(ACTIVE_KEY);
      } catch {}
      return completed;
    },

    discard() {
      try { localStorage.removeItem(ACTIVE_KEY); } catch {}
    },

    getHistory(n) {
      try {
        const history = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
        return n ? history.slice(0, n) : history;
      } catch { return []; }
    },

    normalize,
  };

  window.WorkoutSessionStore = WorkoutSessionStore;
})();
