// AppStore — global state + localStorage persistence
const STORE_KEY = 'atlas.store.v2';

const DEFAULT_STORE = {
  user: {
    name: 'Javier',
    level: 'intermedio',
    onboarded: false,
  },
  gems: {
    balance: 240,
    history: [],
  },
  favorites: [],
  reading: {
    progress: {},
    lastRead: null,
    completed: [],
  },
  plan: null,
  sessions: {
    completed: 12,
    streak: 4,
    lastDate: null,
  },
  log: [],
  savedRoutines: [],
  store: { owned: [] },
  achievements: [],
  prefs: {
    theme: 'light',
    sinnerduo: true,
  },
  currentWorkout: [],
};

// One-time migration: fold sessions that exist only in the legacy
// atlas.sessionhistory.v1 store (written by the old wsComplete) into store.log,
// which is the single canonical session history. Legacy player sessions were
// double-written with different timestamps (start vs finish), so dedupe by
// calendar date + exercise-name overlap rather than by exact dateTs.
function migrateLegacyHistory(log) {
  const LEGACY_KEY = 'atlas.sessionhistory.v1';
  try {
    const raw = localStorage.getItem(LEGACY_KEY);
    if (!raw) return log;
    const legacy = JSON.parse(raw);
    if (!Array.isArray(legacy) || !legacy.length) {
      localStorage.removeItem(LEGACY_KEY);
      return log;
    }
    const isDupe = (s) => log.some(e => {
      if (e.date !== s.date) return false;
      const names = new Set((e.exercises || []).map(x => x.name));
      const sNames = (s.exercises || []).map(x => x.name);
      if (!sNames.length) return true;
      const overlap = sNames.filter(n => names.has(n)).length;
      return overlap >= Math.ceil(sNames.length * 0.5);
    });
    const converted = legacy
      .filter(s => s && s.dateTs && !isDupe(s))
      .map(s => ({
        id: s.dateTs,
        date: s.date || new Date(s.dateTs).toDateString(),
        dateTs: s.dateTs,
        exercises: (s.exercises || []).map(ex => ({
          name: ex.name,
          muscles: Array.isArray(ex.muscles) ? ex.muscles : (ex.muscles?.primary || []),
          sets: (ex.sets || []).filter(st => st.done).map(st => ({ kg: st.kg, reps: st.reps })),
        })),
        gems: 0,
        ...(s.duration ? { duration: s.duration } : {}),
        ...(s.routineName ? { routineName: s.routineName } : {}),
        ...(s.sessionName ? { sessionName: s.sessionName } : {}),
      }));
    localStorage.removeItem(LEGACY_KEY);
    if (!converted.length) return log;
    return [...log, ...converted]
      .sort((a, b) => (b.dateTs || 0) - (a.dateTs || 0))
      .slice(0, 100);
  } catch (e) {
    return log;
  }
}

function readStore() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    let merged;
    if (!raw) {
      merged = structuredClone(DEFAULT_STORE);
    } else {
      const parsed = JSON.parse(raw);
      // Deep merge to handle new fields
      merged = structuredClone(DEFAULT_STORE);
      if (parsed.user) merged.user = { ...merged.user, ...parsed.user };
      if (parsed.gems) merged.gems = { ...merged.gems, ...parsed.gems };
      if (parsed.favorites) merged.favorites = parsed.favorites;
      if (parsed.reading) merged.reading = { ...merged.reading, ...parsed.reading };
      if (parsed.plan !== undefined) merged.plan = parsed.plan;
      if (parsed.sessions) merged.sessions = { ...merged.sessions, ...parsed.sessions };
      if (parsed.log) merged.log = parsed.log;
      if (parsed.savedRoutines) merged.savedRoutines = parsed.savedRoutines;
      if (parsed.store) merged.store = { ...merged.store, ...parsed.store };
      if (parsed.achievements) merged.achievements = parsed.achievements;
      if (parsed.prefs) merged.prefs = { ...merged.prefs, ...parsed.prefs };
      if (parsed.currentWorkout) merged.currentWorkout = parsed.currentWorkout;
    }
    merged.log = migrateLegacyHistory(merged.log);
    return merged;
  } catch (e) {
    return structuredClone(DEFAULT_STORE);
  }
}

function writeStore(s) {
  try { localStorage.setItem(STORE_KEY, JSON.stringify(s)); } catch (e) {}
}

const StoreContext = React.createContext(null);

function StoreProvider({ children }) {
  const [state, setState] = React.useState(() => readStore());

  React.useEffect(() => { writeStore(state); }, [state]);

  const actions = React.useMemo(() => ({
    setUser: (patch) => setState(s => ({ ...s, user: { ...s.user, ...patch } })),

    awardGems: (amount, reason) => setState(s => ({
      ...s,
      gems: {
        balance: s.gems.balance + amount,
        history: [{ id: Date.now(), amount, reason, ts: Date.now() }, ...s.gems.history].slice(0, 50),
      },
    })),

    spendGems: (amount, reason) => setState(s => {
      if (s.gems.balance < amount) return s;
      return {
        ...s,
        gems: {
          balance: s.gems.balance - amount,
          history: [{ id: Date.now(), amount: -amount, reason, ts: Date.now() }, ...s.gems.history].slice(0, 50),
        },
      };
    }),

    toggleFavorite: (articleId) => setState(s => ({
      ...s,
      favorites: s.favorites.includes(articleId)
        ? s.favorites.filter(id => id !== articleId)
        : [...s.favorites, articleId],
    })),

    setReadingProgress: (articleId, ratio) => setState(s => ({
      ...s,
      reading: {
        ...s.reading,
        lastRead: articleId,
        progress: { ...s.reading.progress, [articleId]: Math.max(s.reading.progress[articleId] || 0, ratio) },
      },
    })),

    savePlan: (plan) => setState(s => ({ ...s, plan })),

    completeSession: () => setState(s => {
      const today = new Date().toDateString();
      const wasYesterday = s.sessions.lastDate === new Date(Date.now() - 86400000).toDateString();
      return {
        ...s,
        sessions: {
          completed: s.sessions.completed + 1,
          streak: wasYesterday || s.sessions.lastDate === today ? s.sessions.streak + (s.sessions.lastDate === today ? 0 : 1) : 1,
          lastDate: today,
        },
        gems: {
          balance: s.gems.balance + 25,
          history: [{ id: Date.now(), amount: 25, reason: 'Sesión completada', ts: Date.now() }, ...s.gems.history].slice(0, 50),
        },
      };
    }),

    // NEW: Log a full workout session with exercises
    logSession: (exercises, meta) => setState(s => {
      const today = new Date().toDateString();
      const wasYesterday = s.sessions.lastDate === new Date(Date.now() - 86400000).toDateString();
      const alreadyToday = s.sessions.lastDate === today;
      const newStreak = alreadyToday
        ? s.sessions.streak
        : wasYesterday
          ? s.sessions.streak + 1
          : 1;

      const entry = {
        id: Date.now(),
        date: today,
        dateTs: Date.now(),
        exercises,
        gems: 30,
        ...(meta?.duration ? { duration: meta.duration } : {}),
        ...(meta?.routineName ? { routineName: meta.routineName } : {}),
        ...(meta?.sessionName ? { sessionName: meta.sessionName } : {}),
      };

      const newLog = [entry, ...s.log].slice(0, 100);
      const newCompleted = s.sessions.completed + (alreadyToday ? 0 : 1);

      // Flag the session for proactive analysis next time Atlas Coach opens
      try {
        localStorage.setItem('atlas.coach.pendingAnalysis.v1', JSON.stringify({ dateTs: entry.dateTs }));
      } catch (e) {}

      // Check achievements
      const newAchievements = [...s.achievements];
      if (!newAchievements.includes('primera-sesion')) newAchievements.push('primera-sesion');
      if (newStreak >= 3 && !newAchievements.includes('racha-3')) newAchievements.push('racha-3');
      if (newStreak >= 7 && !newAchievements.includes('racha-7')) newAchievements.push('racha-7');

      const newBalance = s.gems.balance + 30;
      if (newBalance >= 500 && !newAchievements.includes('gemas-500')) newAchievements.push('gemas-500');
      if (newBalance >= 1000 && !newAchievements.includes('gemas-1000')) newAchievements.push('gemas-1000');

      return {
        ...s,
        log: newLog,
        sessions: {
          completed: newCompleted,
          streak: newStreak,
          lastDate: today,
        },
        gems: {
          balance: newBalance,
          history: [{ id: Date.now(), amount: 30, reason: 'Sesión registrada', ts: Date.now() }, ...s.gems.history].slice(0, 50),
        },
        achievements: newAchievements,
      };
    }),

    // ── Saved routines ("Mis rutinas") — single source of truth ──────────────
    // Save (or update) a named routine template. If a routine with the same id
    // already exists it is replaced; otherwise it is prepended (cap 50).
    saveRoutine: (routine) => setState(s => {
      if (!routine) return s;
      const id = routine.id || `routine-${Date.now()}`;
      const entry = { ...routine, id, savedAt: Date.now() };
      const existing = (s.savedRoutines || []).some(r => r.id === id);
      const savedRoutines = existing
        ? s.savedRoutines.map(r => r.id === id ? { ...entry, createdAt: r.createdAt || entry.createdAt } : r)
        : [entry, ...(s.savedRoutines || [])].slice(0, 50);
      return { ...s, savedRoutines };
    }),

    renameRoutine: (id, name) => setState(s => ({
      ...s,
      savedRoutines: (s.savedRoutines || []).map(r =>
        r.id === id ? { ...r, name: name || r.name, savedAt: Date.now() } : r),
    })),

    duplicateRoutine: (id) => setState(s => {
      const orig = (s.savedRoutines || []).find(r => r.id === id);
      if (!orig) return s;
      const copy = {
        ...orig,
        id: `routine-${Date.now()}`,
        name: `${orig.name} (copia)`,
        createdAt: Date.now(),
        savedAt: Date.now(),
      };
      const idx = s.savedRoutines.findIndex(r => r.id === id);
      const next = [...s.savedRoutines];
      next.splice(idx + 1, 0, copy);
      return { ...s, savedRoutines: next.slice(0, 50) };
    }),

    deleteRoutine: (id) => setState(s => ({
      ...s,
      savedRoutines: (s.savedRoutines || []).filter(r => r.id !== id),
    })),

    // NEW: Mark an article as read, award gems if first time
    markArticleRead: (id) => setState(s => {
      const alreadyRead = (s.reading.completed || []).includes(id);
      const gemsToAward = alreadyRead ? 0 : 15;

      const newAchievements = [...s.achievements];
      if (!newAchievements.includes('primer-articulo')) newAchievements.push('primer-articulo');
      const newCompleted = alreadyRead
        ? s.reading.completed
        : [...(s.reading.completed || []), id];
      if (newCompleted.length >= 5 && !newAchievements.includes('cinco-articulos')) {
        newAchievements.push('cinco-articulos');
      }

      const newBalance = s.gems.balance + gemsToAward;
      if (newBalance >= 500 && !newAchievements.includes('gemas-500')) newAchievements.push('gemas-500');
      if (newBalance >= 1000 && !newAchievements.includes('gemas-1000')) newAchievements.push('gemas-1000');

      return {
        ...s,
        reading: {
          ...s.reading,
          lastRead: id,
          completed: newCompleted,
        },
        gems: alreadyRead ? s.gems : {
          balance: newBalance,
          history: [{ id: Date.now(), amount: 15, reason: `Artículo leído`, ts: Date.now() }, ...s.gems.history].slice(0, 50),
        },
        achievements: newAchievements,
      };
    }),

    // NEW: Buy a store item
    buyStoreItem: (id, cost) => setState(s => {
      if (s.gems.balance < cost) return s;
      if ((s.store.owned || []).includes(id)) return s;
      return {
        ...s,
        store: { owned: [...(s.store.owned || []), id] },
        gems: {
          balance: s.gems.balance - cost,
          history: [{ id: Date.now(), amount: -cost, reason: `Compra: ${id}`, ts: Date.now() }, ...s.gems.history].slice(0, 50),
        },
      };
    }),

    // NEW: Unlock an achievement
    unlockAchievement: (id) => setState(s => {
      if (s.achievements.includes(id)) return s;
      return { ...s, achievements: [...s.achievements, id] };
    }),

    // Save generated protocol, award 25 gems
    saveProtocol: (protocol) => setState(s => {
      const newAchievements = [...s.achievements];
      if (!newAchievements.includes('primer-protocolo')) newAchievements.push('primer-protocolo');
      const newBalance = s.gems.balance + 25;
      if (newBalance >= 500 && !newAchievements.includes('gemas-500')) newAchievements.push('gemas-500');
      if (newBalance >= 1000 && !newAchievements.includes('gemas-1000')) newAchievements.push('gemas-1000');
      return {
        ...s,
        plan: protocol,
        achievements: newAchievements,
        gems: {
          balance: newBalance,
          history: [{ id: Date.now(), amount: 25, reason: 'Protocolo guardado', ts: Date.now() }, ...s.gems.history].slice(0, 50),
        },
      };
    }),

    setCurrentWorkout: (exercises) => setState(s => ({ ...s, currentWorkout: exercises })),

    setPref: (key, value) => setState(s => ({ ...s, prefs: { ...s.prefs, [key]: value } })),

    reset: () => setState(structuredClone(DEFAULT_STORE)),
  }), []);

  return (
    <StoreContext.Provider value={{ state, actions }}>
      {children}
    </StoreContext.Provider>
  );
}

function useStore() {
  const ctx = React.useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be inside StoreProvider');
  return ctx;
}

// ─── Hash router ──────────────────────────────────────
const ROUTES = ['/', '/aula', '/laboratorio', '/coach', '/builder', '/rutinas', '/perfil', '/admin', '/player', '/progreso'];

function useRoute() {
  const [route, setRoute] = React.useState(() => {
    const h = window.location.hash.slice(1) || '/';
    return ROUTES.includes(h) ? h : '/';
  });

  React.useEffect(() => {
    const onHash = () => {
      const h = window.location.hash.slice(1) || '/';
      setRoute(ROUTES.includes(h) ? h : '/');
      window.scrollTo({ top: 0, behavior: 'instant' });
    };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  const navigate = React.useCallback((path) => {
    window.location.hash = path;
  }, []);

  return { route, navigate };
}

// ─── aiAdvisor stub ───────────────────────────────────
async function aiRecommend(userState, kind = 'general') {
  await new Promise(r => setTimeout(r, 300));
  const tips = {
    general: 'Tu adherencia (94%) está por encima del 90% — mantén la frecuencia. Considera +1 día de descanso si el RPE supera 8.5 esta semana.',
    plan: 'Basado en tu nivel intermedio y 4 días/semana, recomendamos un upper/lower con énfasis hipertrofia y un día de fuerza pesada.',
    recovery: 'Tu HRV de 7d sugiere recuperación buena. Puedes mantener volumen actual.',
    'next-session': 'Próxima sesión: Upper B. Foco en press banca, RIR 1-2. Calienta 3 series progresivas.',
  };
  return tips[kind] || tips.general;
}

Object.assign(window, { StoreProvider, useStore, useRoute, aiRecommend });
