// Supabase client + auth/DB helpers
// Requires: window.supabase.createClient (Supabase CDN UMD)
// Config: window.ATLAS_SUPABASE_URL, window.ATLAS_SUPABASE_KEY (set in index.html)

const PLACEHOLDER_URL = 'YOUR_SUPABASE_URL';
const PLACEHOLDER_KEY = 'YOUR_SUPABASE_ANON_KEY';

function isConfigured() {
  const url = window.ATLAS_SUPABASE_URL;
  const key = window.ATLAS_SUPABASE_KEY;
  return (
    typeof url === 'string' && url.length > 0 && url !== PLACEHOLDER_URL &&
    typeof key === 'string' && key.length > 0 && key !== PLACEHOLDER_KEY
  );
}

// Lazily create client once — only if config is valid
let _client = null;
function getClient() {
  if (_client) return _client;
  if (!isConfigured()) return null;
  try {
    _client = window.supabase.createClient(
      window.ATLAS_SUPABASE_URL,
      window.ATLAS_SUPABASE_KEY
    );
  } catch (e) {
    console.warn('[Atlas] Supabase init failed:', e);
    _client = null;
  }
  return _client;
}

// ─── AtlasAuth ───────────────────────────────────────

const AtlasAuth = {
  // Returns true only if both config values are present and non-placeholder
  ready() {
    return isConfigured();
  },

  // Resolves with { data: { session }, error } or null if not configured
  async getSession() {
    const sb = getClient();
    if (!sb) return { data: { session: null }, error: null };
    try {
      return await sb.auth.getSession();
    } catch (e) {
      console.warn('[AtlasAuth] getSession error:', e);
      return { data: { session: null }, error: e };
    }
  },

  // Resolves with Supabase signUp result or null if not configured
  async signUp(email, password, meta = {}) {
    const sb = getClient();
    if (!sb) return { data: null, error: new Error('Supabase not configured') };
    try {
      return await sb.auth.signUp({ email, password, options: { data: meta } });
    } catch (e) {
      console.warn('[AtlasAuth] signUp error:', e);
      return { data: null, error: e };
    }
  },

  // Resolves with Supabase signInWithPassword result or null if not configured
  async signIn(email, password) {
    const sb = getClient();
    if (!sb) return { data: null, error: new Error('Supabase not configured') };
    try {
      return await sb.auth.signInWithPassword({ email, password });
    } catch (e) {
      console.warn('[AtlasAuth] signIn error:', e);
      return { data: null, error: e };
    }
  },

  // OAuth sign-in via Google, redirectTo current origin
  async signInWithGoogle() {
    const sb = getClient();
    if (!sb) return { data: null, error: new Error('Supabase not configured') };
    try {
      return await sb.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: window.location.origin },
      });
    } catch (e) {
      console.warn('[AtlasAuth] signInWithGoogle error:', e);
      return { data: null, error: e };
    }
  },

  // Resolves with Supabase signOut result or silently no-ops if not configured
  async signOut() {
    const sb = getClient();
    if (!sb) return { error: null };
    try {
      return await sb.auth.signOut();
    } catch (e) {
      console.warn('[AtlasAuth] signOut error:', e);
      return { error: e };
    }
  },

  // Subscribe to auth state changes; returns { data: { subscription } }
  // Subscription can be unsubscribed via subscription.unsubscribe()
  onAuthStateChange(callback) {
    const sb = getClient();
    if (!sb) {
      // Return a no-op subscription object so callers can always call unsubscribe
      return { data: { subscription: { unsubscribe: () => {} } } };
    }
    try {
      return sb.auth.onAuthStateChange(callback);
    } catch (e) {
      console.warn('[AtlasAuth] onAuthStateChange error:', e);
      return { data: { subscription: { unsubscribe: () => {} } } };
    }
  },
};

// ─── AtlasDB ────────────────────────────────────────

const AtlasDB = {
  // Fetch full profile row for a user
  async getProfile(userId) {
    const sb = getClient();
    if (!sb) return { data: null, error: null };
    try {
      return await sb
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();
    } catch (e) {
      console.warn('[AtlasDB] getProfile error:', e);
      return { data: null, error: e };
    }
  },

  // Upsert profile fields; always stamps updated_at
  async upsertProfile(userId, profile) {
    const sb = getClient();
    if (!sb) return { data: null, error: null };
    try {
      return await sb
        .from('profiles')
        .upsert({ ...profile, id: userId, updated_at: new Date().toISOString() });
    } catch (e) {
      console.warn('[AtlasDB] upsertProfile error:', e);
      return { data: null, error: e };
    }
  },

  // Fetch user_data row
  async getUserData(userId) {
    const sb = getClient();
    if (!sb) return { data: null, error: null };
    try {
      return await sb
        .from('user_data')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();
    } catch (e) {
      console.warn('[AtlasDB] getUserData error:', e);
      return { data: null, error: e };
    }
  },

  // Sync relevant store state to user_data; trims large arrays before write
  async syncUserData(userId, storeState) {
    const sb = getClient();
    if (!sb) return { data: null, error: null };
    try {
      const payload = {
        user_id: userId,
        gems_balance: storeState.gems?.balance ?? 0,
        gems_history: (storeState.gems?.history ?? []).slice(0, 50),
        sessions_completed: storeState.sessions?.completed ?? 0,
        streak: storeState.sessions?.streak ?? 0,
        last_session_date: storeState.sessions?.lastDate ?? null,
        session_log: (storeState.log ?? []).slice(0, 50),
        achievements: storeState.achievements ?? [],
        reading_completed: storeState.reading?.completed ?? [],
        store_owned: storeState.store?.owned ?? [],
        current_plan: storeState.plan ?? null,
        updated_at: new Date().toISOString(),
      };
      return await sb.from('user_data').upsert(payload, { onConflict: 'user_id' });
    } catch (e) {
      console.warn('[AtlasDB] syncUserData error:', e);
      return { data: null, error: e };
    }
  },

  // Fetch coach_data row
  async getCoachData(userId) {
    const sb = getClient();
    if (!sb) return { data: null, error: null };
    try {
      return await sb
        .from('coach_data')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();
    } catch (e) {
      console.warn('[AtlasDB] getCoachData error:', e);
      return { data: null, error: e };
    }
  },

  // Sync coach chats + memory + profile; trims to last 20 messages per chat, max 8 chats
  async syncCoachData(userId, chats, memory, coachProfile) {
    const sb = getClient();
    if (!sb) return { data: null, error: null };
    try {
      // Trim each chat to last 20 messages, keep only the 8 most-recent chats
      const trimmedChats = (chats ?? [])
        .slice(-8)
        .map(chat => ({
          ...chat,
          messages: Array.isArray(chat.messages)
            ? chat.messages.slice(-20)
            : chat.messages,
        }));

      const payload = {
        user_id: userId,
        chats: trimmedChats,
        memory: memory ?? null,
        coach_profile: coachProfile ?? null,
        updated_at: new Date().toISOString(),
      };
      return await sb.from('coach_data').upsert(payload, { onConflict: 'user_id' });
    } catch (e) {
      console.warn('[AtlasDB] syncCoachData error:', e);
      return { data: null, error: e };
    }
  },
};

Object.assign(window, { AtlasAuth, AtlasDB });
