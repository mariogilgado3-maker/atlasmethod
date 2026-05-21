// AuthSection — Login / Register screen
// Requires: AtlasAuth (supabase.jsx), useAuth (auth-store.jsx)

const AUTH_BG   = '#060D18';
const AUTH_CARD = '#0D1B2E';
const AUTH_BORDER = 'rgba(255,255,255,0.08)';
const AUTH_MUTED  = 'rgba(255,255,255,0.4)';
const AUTH_TEXT   = '#F0F4FF';
const AUTH_ACCENT = '#3B82F6';

function AuthSection() {
  const [tab, setTab]         = React.useState('login'); // 'login' | 'register'
  const [email, setEmail]     = React.useState('');
  const [password, setPassword] = React.useState('');
  const [showPw, setShowPw]   = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [error, setError]     = React.useState('');
  const [info, setInfo]       = React.useState('');

  const configured = AtlasAuth.ready();

  async function handleSubmit(e) {
    e.preventDefault();
    if (!configured) return;
    setError(''); setInfo('');
    if (!email.trim() || !password.trim()) {
      setError('Introduce email y contraseña.');
      return;
    }
    setLoading(true);
    try {
      let result;
      if (tab === 'login') {
        result = await AtlasAuth.signIn(email.trim(), password);
        if (result.error) {
          setError(_friendlyError(result.error.message));
        }
      } else {
        result = await AtlasAuth.signUp(email.trim(), password);
        if (result.error) {
          setError(_friendlyError(result.error.message));
        } else {
          setInfo('Cuenta creada. Revisa tu email para confirmar, o inicia sesión directamente si tienes confirmación desactivada.');
        }
      }
    } catch (err) {
      setError('Error inesperado. Inténtalo de nuevo.');
      console.warn('[AuthSection] submit error:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    if (!configured) return;
    setError(''); setInfo('');
    setLoading(true);
    try {
      const result = await AtlasAuth.signInWithGoogle();
      if (result.error) setError(_friendlyError(result.error.message));
    } catch (err) {
      setError('Error con Google. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  }

  function _friendlyError(msg = '') {
    if (msg.includes('Invalid login credentials'))   return 'Email o contraseña incorrectos.';
    if (msg.includes('Email not confirmed'))          return 'Confirma tu email antes de entrar.';
    if (msg.includes('User already registered'))      return 'Ya existe una cuenta con ese email.';
    if (msg.includes('Password should be at least')) return 'La contraseña debe tener al menos 6 caracteres.';
    return msg || 'Error desconocido.';
  }

  const inputStyle = {
    width: '100%', padding: '11px 14px', background: 'rgba(255,255,255,0.05)',
    border: `1px solid ${AUTH_BORDER}`, borderRadius: 8, color: AUTH_TEXT,
    fontSize: 14, fontFamily: 'Inter, sans-serif', outline: 'none',
    transition: 'border-color 0.15s',
  };

  return (
    <div style={{
      minHeight: '100vh', background: AUTH_BG,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '24px 16px',
    }}>
      <div style={{
        width: '100%', maxWidth: 400,
        background: AUTH_CARD, border: `1px solid ${AUTH_BORDER}`,
        borderRadius: 16, padding: '36px 32px',
        boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ fontFamily: 'Instrument Serif, serif', fontSize: 26, color: AUTH_TEXT, letterSpacing: '-0.5px' }}>
            Atlas Method
          </div>
          <div style={{ fontSize: 12, color: AUTH_MUTED, marginTop: 4, letterSpacing: '0.08em' }}>
            DATOS · DECISIONES · RENDIMIENTO
          </div>
        </div>

        {/* Tab switcher */}
        <div style={{
          display: 'flex', background: 'rgba(255,255,255,0.04)',
          borderRadius: 8, padding: 3, marginBottom: 24,
        }}>
          {[['login','Iniciar sesión'],['register','Crear cuenta']].map(([key, label]) => (
            <button key={key} onClick={() => { setTab(key); setError(''); setInfo(''); }}
              style={{
                flex: 1, padding: '8px 0', border: 'none', borderRadius: 6, cursor: 'pointer',
                fontSize: 13, fontWeight: 500, transition: 'all 0.15s',
                background: tab === key ? 'rgba(255,255,255,0.10)' : 'transparent',
                color: tab === key ? AUTH_TEXT : AUTH_MUTED,
              }}>
              {label}
            </button>
          ))}
        </div>

        {/* Not configured warning */}
        {!configured && (
          <div style={{
            background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.3)',
            borderRadius: 8, padding: '10px 14px', marginBottom: 20,
            fontSize: 12, color: '#F59E0B', lineHeight: 1.5,
          }}>
            Supabase no configurado. Añade <code style={{ fontFamily: 'monospace' }}>ATLAS_SUPABASE_URL</code> y <code style={{ fontFamily: 'monospace' }}>ATLAS_SUPABASE_KEY</code> en <code style={{ fontFamily: 'monospace' }}>index.html</code>.
          </div>
        )}

        {/* Error / info */}
        {error && (
          <div style={{
            background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)',
            borderRadius: 8, padding: '10px 14px', marginBottom: 16,
            fontSize: 13, color: '#F87171',
          }}>
            {error}
          </div>
        )}
        {info && (
          <div style={{
            background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)',
            borderRadius: 8, padding: '10px 14px', marginBottom: 16,
            fontSize: 13, color: '#4ADE80',
          }}>
            {info}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <label style={{ display: 'block', fontSize: 11, color: AUTH_MUTED, marginBottom: 6, letterSpacing: '0.06em' }}>
              EMAIL
            </label>
            <input
              type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="tu@email.com" autoComplete="email"
              style={inputStyle}
              onFocus={e => e.target.style.borderColor = AUTH_ACCENT}
              onBlur={e => e.target.style.borderColor = AUTH_BORDER}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 11, color: AUTH_MUTED, marginBottom: 6, letterSpacing: '0.06em' }}>
              CONTRASEÑA
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPw ? 'text' : 'password'} value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••" autoComplete={tab === 'login' ? 'current-password' : 'new-password'}
                style={{ ...inputStyle, paddingRight: 40 }}
                onFocus={e => e.target.style.borderColor = AUTH_ACCENT}
                onBlur={e => e.target.style.borderColor = AUTH_BORDER}
              />
              <button type="button" onClick={() => setShowPw(v => !v)}
                style={{
                  position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: AUTH_MUTED, fontSize: 12, padding: 0,
                }}>
                {showPw ? 'OCULTAR' : 'VER'}
              </button>
            </div>
          </div>

          <button type="submit" disabled={loading || !configured}
            style={{
              marginTop: 4, padding: '12px 0', border: 'none', borderRadius: 8,
              background: configured ? AUTH_ACCENT : 'rgba(59,130,246,0.3)',
              color: '#fff', fontSize: 14, fontWeight: 600, cursor: configured ? 'pointer' : 'not-allowed',
              opacity: loading ? 0.7 : 1, transition: 'opacity 0.15s',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}>
            {loading && <span style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.6s linear infinite' }} />}
            {tab === 'login' ? 'Entrar' : 'Crear cuenta'}
          </button>
        </form>

        {/* Divider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '20px 0' }}>
          <div style={{ flex: 1, height: 1, background: AUTH_BORDER }} />
          <span style={{ fontSize: 11, color: AUTH_MUTED }}>O</span>
          <div style={{ flex: 1, height: 1, background: AUTH_BORDER }} />
        </div>

        {/* Google button */}
        <button onClick={handleGoogle} disabled={loading || !configured}
          style={{
            width: '100%', padding: '11px 0', border: `1px solid ${AUTH_BORDER}`,
            borderRadius: 8, background: 'transparent', color: AUTH_TEXT,
            fontSize: 13, fontWeight: 500, cursor: configured ? 'pointer' : 'not-allowed',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
            opacity: loading ? 0.7 : 1, transition: 'background 0.15s',
          }}
          onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
          onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Continuar con Google
        </button>

        <p style={{ textAlign: 'center', fontSize: 11, color: AUTH_MUTED, marginTop: 24, lineHeight: 1.5 }}>
          Al continuar aceptas los términos de uso de Atlas Method.
        </p>
      </div>
    </div>
  );
}

Object.assign(window, { AuthSection });
