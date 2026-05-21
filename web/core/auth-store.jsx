// AuthProvider — must render INSIDE StoreProvider
// Provides auth state (user, session, profile) and syncs store to Supabase

const AuthContext = React.createContext(null);

const SYNC_DEBOUNCE_MS = 5000;

function AuthProvider({ children }) {
  const { state, actions } = useStore();

  const [auth, setAuth] = React.useState({
    user: null,
    session: null,
    profile: null,
    loading: true,
  });

  // Load user data from Supabase and hydrate store
  async function _loadUser(user, session) {
    try {
      window._atlasUserId = user.id;

      const [profileResult, userDataResult] = await Promise.all([
        AtlasDB.getProfile(user.id),
        AtlasDB.getUserData(user.id),
      ]);

      const profile = profileResult?.data ?? null;
      const userData = userDataResult?.data ?? null;

      // Hydrate store from cloud data if it exists
      if (userData) {
        actions.loadFromCloud({
          gems: {
            balance: userData.gems_balance ?? 0,
            history: userData.gems_history ?? [],
          },
          sessions: {
            completed: userData.sessions_completed ?? 0,
            streak: userData.streak ?? 0,
            lastDate: userData.last_session_date ?? null,
          },
          log: userData.session_log ?? [],
          achievements: userData.achievements ?? [],
          reading: {
            completed: userData.reading_completed ?? [],
          },
          store: {
            owned: userData.store_owned ?? [],
          },
          plan: userData.current_plan ?? null,
        });
      }

      // Set display name from profile if available
      if (profile?.username) {
        actions.setUser({ name: profile.username });
      }

      setAuth({ user, session, profile, loading: false });
    } catch (e) {
      console.warn('[AuthProvider] _loadUser error:', e);
      setAuth(prev => ({ ...prev, user, session, loading: false }));
    }
  }

  // On mount: check for existing session + subscribe to auth changes
  React.useEffect(() => {
    let sub = null;

    async function init() {
      try {
        const { data } = await AtlasAuth.getSession();
        const session = data?.session ?? null;
        if (session?.user) {
          await _loadUser(session.user, session);
        } else {
          setAuth(prev => ({ ...prev, loading: false }));
        }
      } catch (e) {
        console.warn('[AuthProvider] init error:', e);
        setAuth(prev => ({ ...prev, loading: false }));
      }
    }

    init();

    // Subscribe to future auth events
    const { data } = AtlasAuth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        await _loadUser(session.user, session);
      } else if (event === 'SIGNED_OUT') {
        window._atlasUserId = null;
        setAuth({ user: null, session: null, profile: null, loading: false });
        actions.reset();
      }
    });
    sub = data?.subscription ?? null;

    return () => {
      if (sub) sub.unsubscribe();
    };
  }, []);

  // Debounced sync: whenever store state or auth.user changes, write to Supabase
  React.useEffect(() => {
    if (!auth.user) return;

    const timer = setTimeout(() => {
      AtlasDB.syncUserData(auth.user.id, state).catch(e => {
        console.warn('[AuthProvider] syncUserData error:', e);
      });
    }, SYNC_DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [state, auth.user]);

  // Sign out and reset local state
  async function signOut() {
    try {
      await AtlasAuth.signOut();
      // onAuthStateChange SIGNED_OUT will handle state reset
    } catch (e) {
      console.warn('[AuthProvider] signOut error:', e);
    }
  }

  // Update profile in Supabase + mirror into local auth state
  async function updateProfile(patch) {
    if (!auth.user) return;
    try {
      await AtlasDB.upsertProfile(auth.user.id, patch);
      setAuth(prev => ({
        ...prev,
        profile: { ...prev.profile, ...patch },
      }));
      // Also keep display name in sync if username changed
      if (patch.username) {
        actions.setUser({ name: patch.username });
      }
    } catch (e) {
      console.warn('[AuthProvider] updateProfile error:', e);
    }
  }

  const value = {
    ...auth,
    signOut,
    updateProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

function useAuth() {
  const ctx = React.useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}

Object.assign(window, { AuthProvider, useAuth });
