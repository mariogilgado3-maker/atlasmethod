// AppStore — global state + localStorage persistence
const STORE_KEY = 'atlas.store.v1';

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
  },
  plan: null,
  sessions: {
    completed: 12,
    streak: 4,
    lastDate: null,
  },
  prefs: {
    theme: 'light',
    sinnerduo: true,
  },
};

function readStore() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return structuredClone(DEFAULT_STORE);
    const parsed = JSON.parse(raw);
    return { ...structuredClone(DEFAULT_STORE), ...parsed };
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
const ROUTES = ['/', '/aula', '/laboratorio', '/builder', '/perfil'];

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
