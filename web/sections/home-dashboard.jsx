// Atlas Method — Dynamic Home Dashboard
// Renders only blocks with real data; adapts to user state.

// ─── Palette ─────────────────────────────────────────────────────────────────
const HD = {
  page:    '#FAFAF7',
  ink:     '#0F1A2E',
  sub:     '#5C6477',
  muted:   '#9498A4',
  border:  'rgba(15,26,46,0.08)',
  card:    '#FFFFFF',
  blue:    '#2563EB',
  blueL:   'rgba(37,99,235,0.08)',
  green:   '#16A34A',
  greenL:  'rgba(22,163,74,0.08)',
  amber:   '#B45309',
  amberL:  'rgba(180,83,9,0.07)',
};

// ─── Objective meta ───────────────────────────────────────────────────────────
const OBJ_LABEL = {
  muscle:      'Ganar masa muscular',
  fat_loss:    'Perder grasa',
  recomp:      'Recomposición',
  performance: 'Rendimiento deportivo',
  health:      'Salud y bienestar',
};
const OBJ_ARTICLE_CATS = {
  muscle:      ['hipertrofia', 'nutricion'],
  fat_loss:    ['nutricion', 'recuperacion'],
  recomp:      ['hipertrofia', 'fuerza'],
  performance: ['fuerza', 'recuperacion'],
  health:      ['recuperacion', 'nutricion'],
};
const EXP_LABEL = {
  beginner:     'Principiante',
  intermediate: 'Intermedio',
  advanced:     'Avanzado',
};

// ─── Data hook ────────────────────────────────────────────────────────────────
function useHomeDashboard() {
  const { state } = useStore();

  const profile      = React.useMemo(() => {
    try { return JSON.parse(localStorage.getItem('atlas.profile.v1') || 'null'); } catch { return null; }
  }, []);

  const coachChats   = React.useMemo(() => {
    try { return JSON.parse(localStorage.getItem('atlas.chats.v1') || '[]'); } catch { return []; }
  }, []);

  const builderPlan  = React.useMemo(() => {
    try { return JSON.parse(localStorage.getItem('atlas.builder.plan.v1') || 'null'); } catch { return null; }
  }, []);

  const hasProfile   = !!(profile?.completedAt || profile?.objective);
  const hasLog       = (state.log || []).length > 0;
  const hasWorkout   = (state.currentWorkout || []).length > 0 || !!builderPlan;
  const hasChats     = coachChats.some(c => (c.messages || []).length > 1);
  const isNew        = !hasProfile && !hasLog && !hasWorkout && !hasChats;

  const lastSession  = hasLog ? state.log[0] : null;
  const coachPlan    = state.plan || null;

  return {
    state, profile, coachChats, builderPlan,
    hasProfile, hasLog, hasWorkout, hasChats, isNew,
    lastSession, coachPlan,
  };
}

// ─── Shared card shell ────────────────────────────────────────────────────────
function HdCard({ children, style }) {
  return (
    <div style={{
      background: HD.card, borderRadius: 16,
      border: `1px solid ${HD.border}`,
      boxShadow: '0 1px 4px rgba(15,26,46,0.04)',
      overflow: 'hidden',
      ...style,
    }}>
      {children}
    </div>
  );
}

function HdSectionLabel({ children }) {
  return (
    <div style={{
      fontFamily: '"Inter",system-ui', fontSize: 11, fontWeight: 700,
      letterSpacing: 1.3, textTransform: 'uppercase', color: HD.muted,
      marginBottom: 12,
    }}>
      {children}
    </div>
  );
}

function HdBtn({ children, onClick, primary, style }) {
  return (
    <button onClick={onClick} style={{
      padding: '9px 18px', borderRadius: 999,
      border: primary ? 'none' : `1px solid ${HD.border}`,
      background: primary ? HD.ink : 'transparent',
      color: primary ? '#FAFAF7' : HD.ink,
      fontFamily: '"Inter",system-ui', fontSize: 13, fontWeight: 700,
      cursor: 'pointer', letterSpacing: -0.1,
      ...style,
    }}>
      {children}
    </button>
  );
}

// ─── Block: New user welcome ───────────────────────────────────────────────────
function HdBlockNewUser({ navigate }) {
  const actions = [
    { label: 'Crear primera rutina',      path: '/builder', icon: '🏋' },
    { label: 'Hablar con Atlas Coach',    path: '/coach',   icon: '💬' },
    { label: 'Explorar Atlas Aula',       path: '/aula',    icon: '📚' },
  ];
  return (
    <div style={{ marginBottom: 40 }}>
      <HdCard style={{ padding: '36px 32px' }}>
        <div style={{
          fontFamily: '"Inter",system-ui', fontSize: 28, fontWeight: 800,
          color: HD.ink, letterSpacing: -1.2, lineHeight: 1.1, marginBottom: 10,
        }}>
          Empieza tu camino.
        </div>
        <p style={{
          fontFamily: '"Inter",system-ui', fontSize: 15, color: HD.sub,
          lineHeight: 1.65, margin: '0 0 28px', maxWidth: 480,
        }}>
          Atlas Method te ayuda a entrenar con propósito, analizar tu progreso y mejorar semana a semana. ¿Por dónde quieres empezar?
        </p>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {actions.map(a => (
            <button key={a.path} onClick={() => navigate(a.path)} style={{
              display: 'flex', alignItems: 'center', gap: 9,
              padding: '11px 18px', borderRadius: 12,
              border: `1px solid ${HD.border}`, background: HD.card,
              cursor: 'pointer', fontFamily: '"Inter",system-ui',
              fontSize: 14, fontWeight: 600, color: HD.ink,
              transition: 'border-color .15s, box-shadow .15s',
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(15,26,46,0.22)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(15,26,46,0.06)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = HD.border; e.currentTarget.style.boxShadow = 'none'; }}
            >
              <span style={{ fontSize: 18 }}>{a.icon}</span>
              {a.label}
            </button>
          ))}
        </div>
      </HdCard>
    </div>
  );
}

// ─── Block: Atlas Profile ─────────────────────────────────────────────────────
function HdBlockProfile({ profile, navigate }) {
  const chips = [
    { label: 'Objetivo',         val: OBJ_LABEL[profile.objective] || profile.objective },
    { label: 'Nivel',            val: EXP_LABEL[profile.experience] || profile.experience },
    { label: 'Disponibilidad',   val: profile.trainingDays ? `${profile.trainingDays} días/semana` : null },
    { label: 'Duración sesión',  val: profile.sessionDuration ? `${profile.sessionDuration} min` : null },
  ].filter(c => c.val);

  return (
    <div style={{ marginBottom: 32 }}>
      <HdSectionLabel>Perfil Atlas</HdSectionLabel>
      <HdCard>
        <div style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            {chips.map(c => (
              <div key={c.label} style={{
                padding: '8px 14px', borderRadius: 10,
                background: HD.blueL, border: `1px solid rgba(37,99,235,0.14)`,
              }}>
                <div style={{ fontFamily: '"Inter",system-ui', fontSize: 10, fontWeight: 600, color: HD.blue, marginBottom: 2, letterSpacing: 0.4, textTransform: 'uppercase' }}>{c.label}</div>
                <div style={{ fontFamily: '"Inter",system-ui', fontSize: 14, fontWeight: 700, color: HD.ink }}>{c.val}</div>
              </div>
            ))}
          </div>
          <button onClick={() => navigate('/coach')} style={{
            padding: '8px 16px', borderRadius: 999,
            border: `1px solid ${HD.border}`, background: 'transparent',
            fontFamily: '"Inter",system-ui', fontSize: 12, fontWeight: 600,
            color: HD.sub, cursor: 'pointer', whiteSpace: 'nowrap',
          }}>
            Hablar con Coach →
          </button>
        </div>
      </HdCard>
    </div>
  );
}

// ─── Block: Last session ──────────────────────────────────────────────────────
function HdBlockLastSession({ session, navigate }) {
  function daysAgo(ts) {
    const d = Math.floor((Date.now() - ts) / 86400000);
    if (d === 0) return 'Hoy';
    if (d === 1) return 'Ayer';
    return `Hace ${d} días`;
  }
  const exCount = (session.exercises || []).length;
  const when    = daysAgo(session.dateTs || Date.now());

  return (
    <div style={{ marginBottom: 32 }}>
      <HdSectionLabel>Continúa donde lo dejaste</HdSectionLabel>
      <HdCard>
        <div style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
          <div style={{
            width: 44, height: 44, borderRadius: 12, flexShrink: 0,
            background: HD.greenL, border: `1px solid rgba(22,163,74,0.18)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 20,
          }}>🏋</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: '"Inter",system-ui', fontSize: 15, fontWeight: 700, color: HD.ink, marginBottom: 2 }}>
              {session.name || 'Última sesión'}
            </div>
            <div style={{ fontFamily: '"Inter",system-ui', fontSize: 12, color: HD.sub }}>
              {exCount > 0 ? `${exCount} ejercicios` : 'Sesión registrada'} · {when}
            </div>
          </div>
          <HdBtn primary onClick={() => navigate('/builder')}>Reanudar →</HdBtn>
        </div>
      </HdCard>
    </div>
  );
}

// ─── Block: Builder plan / routines ───────────────────────────────────────────
function HdBlockWorkout({ builderPlan, currentWorkout, navigate }) {
  const plan = builderPlan;
  if (!plan && !(currentWorkout?.length)) return null;

  const exercises = plan?.exercises || currentWorkout || [];
  const name      = plan?.name || plan?.split?.name || 'Rutina activa';
  const exCount   = exercises.length;

  const modifiedAt = plan?.savedAt ? (() => {
    const d = Math.floor((Date.now() - plan.savedAt) / 86400000);
    if (d === 0) return 'Hoy';
    if (d === 1) return 'Ayer';
    return `Hace ${d} días`;
  })() : null;

  return (
    <div style={{ marginBottom: 32 }}>
      <HdSectionLabel>Tus entrenamientos</HdSectionLabel>
      <HdCard>
        <div style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
          <div style={{
            width: 44, height: 44, borderRadius: 12, flexShrink: 0,
            background: 'rgba(15,26,46,0.04)', border: `1px solid ${HD.border}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 20,
          }}>📋</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: '"Inter",system-ui', fontSize: 15, fontWeight: 700, color: HD.ink, marginBottom: 2 }}>
              {String(name)}
            </div>
            <div style={{ fontFamily: '"Inter",system-ui', fontSize: 12, color: HD.sub }}>
              {exCount > 0 ? `${exCount} ejercicios` : 'Plan guardado'}
              {modifiedAt ? ` · Actualizado ${modifiedAt}` : ''}
            </div>
          </div>
          <HdBtn primary onClick={() => navigate('/builder')}>Continuar →</HdBtn>
        </div>
      </HdCard>
    </div>
  );
}

// ─── Block: Coach recommendation ─────────────────────────────────────────────
function HdBlockCoach({ coachChats, coachPlan, navigate }) {
  const lastChat = coachChats.find(c => (c.messages || []).length > 1);
  if (!lastChat && !coachPlan) return null;

  const title   = coachPlan?.split?.name || coachPlan?.name || 'Plan recomendado';
  const subtitle = coachPlan?.objective
    ? `Objetivo: ${OBJ_LABEL[coachPlan.objective] || coachPlan.objective}`
    : lastChat?.title || 'Conversación con Coach';

  return (
    <div style={{ marginBottom: 32 }}>
      <HdSectionLabel>Recomendado para ti</HdSectionLabel>
      <HdCard>
        <div style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
          <div style={{
            width: 44, height: 44, borderRadius: 12, flexShrink: 0,
            background: 'rgba(37,99,235,0.06)', border: `1px solid rgba(37,99,235,0.14)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'ui-monospace', fontSize: 14, fontWeight: 700, color: HD.blue,
          }}>A</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: '"Inter",system-ui', fontSize: 15, fontWeight: 700, color: HD.ink, marginBottom: 2 }}>
              {String(title)}
            </div>
            <div style={{ fontFamily: '"Inter",system-ui', fontSize: 12, color: HD.sub }}>
              {String(subtitle)}
            </div>
          </div>
          <HdBtn primary onClick={() => navigate('/coach')}>Ver recomendación →</HdBtn>
        </div>
      </HdCard>
    </div>
  );
}

// ─── Block: Aula articles ─────────────────────────────────────────────────────
function HdBlockAula({ objective, navigate }) {
  const [articles, setArticles] = React.useState([]);

  React.useEffect(() => {
    if (!window.ArticlesService) return;
    const cats = (objective && OBJ_ARTICLE_CATS[objective]) || null;
    ArticlesService.getAll({ status: 'published', category: 'all' }).then(all => {
      let filtered = all;
      if (cats) {
        filtered = all.filter(a => cats.includes(a.category));
        if (filtered.length < 2) filtered = all;
      }
      setArticles(filtered.slice(0, 3));
    });
  }, [objective]);

  if (!articles.length) return null;

  return (
    <div style={{ marginBottom: 32 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <HdSectionLabel>
          {objective ? `Para tu objetivo · ${OBJ_LABEL[objective] || objective}` : 'Atlas Aula'}
        </HdSectionLabel>
        <button onClick={() => navigate('/aula')} style={{
          background: 'transparent', border: 'none', cursor: 'pointer',
          fontFamily: '"Inter",system-ui', fontSize: 12, fontWeight: 600,
          color: HD.blue, padding: 0, marginBottom: 12,
        }}>Ver todo →</button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
        {articles.map(a => (
          <HdCard key={a.id} style={{ cursor: 'pointer' }}
            onClick={() => navigate('/aula')}
          >
            <div style={{ padding: '18px 20px' }}>
              <div style={{
                display: 'inline-block', padding: '2px 8px', borderRadius: 6,
                background: HD.blueL, fontFamily: '"Inter",system-ui',
                fontSize: 10, fontWeight: 700, color: HD.blue,
                letterSpacing: 0.4, textTransform: 'uppercase', marginBottom: 10,
              }}>
                {a.category}
              </div>
              <div style={{
                fontFamily: '"Inter",system-ui', fontSize: 14, fontWeight: 700,
                color: HD.ink, lineHeight: 1.3, marginBottom: 6,
              }}>
                {a.title}
              </div>
              <div style={{
                fontFamily: '"Inter",system-ui', fontSize: 12, color: HD.sub,
                lineHeight: 1.5,
                display: '-webkit-box', WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical', overflow: 'hidden',
              }}>
                {a.subtitle || a.summary || ''}
              </div>
              <div style={{ marginTop: 10, fontFamily: '"Inter",system-ui', fontSize: 11, color: HD.muted }}>
                {a.readTime ? `${a.readTime} min · ` : ''}{a.gems ? `+${a.gems} 💎` : ''}
              </div>
            </div>
          </HdCard>
        ))}
      </div>
    </div>
  );
}

// ─── Block: Stats bar (returning user) ───────────────────────────────────────
function HdStatsBar({ sessions, userName }) {
  const { completed, streak } = sessions;
  if (!completed && !streak) return null;

  const stats = [
    { label: 'Sesiones completadas', val: completed, icon: '📊' },
    streak > 1 ? { label: 'Racha actual', val: `${streak} días`, icon: '🔥' } : null,
  ].filter(Boolean);

  return (
    <div style={{ display: 'flex', gap: 12, marginBottom: 32, flexWrap: 'wrap' }}>
      {stats.map(s => (
        <HdCard key={s.label} style={{ flex: '1 1 140px', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 22 }}>{s.icon}</span>
          <div>
            <div style={{ fontFamily: '"Inter",system-ui', fontSize: 20, fontWeight: 800, color: HD.ink, lineHeight: 1 }}>{s.val}</div>
            <div style={{ fontFamily: '"Inter",system-ui', fontSize: 11, color: HD.muted, marginTop: 3 }}>{s.label}</div>
          </div>
        </HdCard>
      ))}
    </div>
  );
}

// ─── Main HomePage ────────────────────────────────────────────────────────────
function HomePage() {
  const { navigate } = useRoute();
  const {
    state, profile, coachChats, builderPlan,
    hasProfile, hasLog, hasWorkout, hasChats, isNew,
    lastSession, coachPlan,
  } = useHomeDashboard();

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 13) return 'Buenos días';
    if (h < 20) return 'Buenas tardes';
    return 'Buenas noches';
  })();

  return (
    <div style={{ background: HD.page, minHeight: '100vh' }}>
      <div style={{ maxWidth: 860, margin: '0 auto', padding: '48px 32px 80px' }}>

        {/* Header */}
        <div style={{ marginBottom: isNew ? 32 : 40 }}>
          <div style={{ fontFamily: '"Inter",system-ui', fontSize: 13, fontWeight: 600, color: HD.muted, marginBottom: 6, letterSpacing: -0.1 }}>
            {greeting}
          </div>
          <h1 style={{ fontFamily: '"Inter",system-ui', fontSize: 32, fontWeight: 800, color: HD.ink, letterSpacing: -1.2, lineHeight: 1.05, margin: 0 }}>
            {isNew
              ? 'Bienvenido a Atlas Method'
              : `${state.user.name || 'Atleta'}.`
            }
          </h1>
          {!isNew && (
            <p style={{ fontFamily: '"Inter",system-ui', fontSize: 15, color: HD.sub, margin: '8px 0 0', lineHeight: 1.6 }}>
              {hasProfile
                ? `Objetivo: ${OBJ_LABEL[profile.objective] || profile.objective}`
                : 'Aquí tienes tu resumen de hoy.'
              }
            </p>
          )}
        </div>

        {/* New user — onboarding card */}
        {isNew && <HdBlockNewUser navigate={navigate} />}

        {/* Returning user — stats bar */}
        {!isNew && (state.sessions.completed > 0 || state.sessions.streak > 1) && (
          <HdStatsBar sessions={state.sessions} userName={state.user.name} />
        )}

        {/* Atlas Profile */}
        {hasProfile && <HdBlockProfile profile={profile} navigate={navigate} />}

        {/* Last session */}
        {hasLog && <HdBlockLastSession session={lastSession} navigate={navigate} />}

        {/* Builder plan / routines */}
        {hasWorkout && (
          <HdBlockWorkout
            builderPlan={builderPlan}
            currentWorkout={state.currentWorkout}
            navigate={navigate}
          />
        )}

        {/* Coach recommendation */}
        {(hasChats || coachPlan) && (
          <HdBlockCoach coachChats={coachChats} coachPlan={coachPlan} navigate={navigate} />
        )}

        {/* Aula articles */}
        <HdBlockAula objective={profile?.objective || null} navigate={navigate} />

        {/* New user — quick nav links at bottom */}
        {isNew && (
          <div style={{ marginTop: 48, paddingTop: 32, borderTop: `1px solid ${HD.border}` }}>
            <HdSectionLabel>Explora Atlas Method</HdSectionLabel>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
              {[
                { path: '/aula',    icon: '📚', label: 'Atlas Aula',   desc: 'Aprende con ciencia aplicada' },
                { path: '/coach',   icon: '💬', label: 'Atlas Coach',  desc: 'Análisis inteligente de tu entreno' },
                { path: '/builder', icon: '🏋', label: 'Builder',      desc: 'Crea y guarda tus rutinas' },
              ].map(item => (
                <HdCard key={item.path} style={{ cursor: 'pointer', padding: '20px 18px' }} onClick={() => navigate(item.path)}>
                  <div style={{ fontSize: 24, marginBottom: 10 }}>{item.icon}</div>
                  <div style={{ fontFamily: '"Inter",system-ui', fontSize: 14, fontWeight: 700, color: HD.ink, marginBottom: 4 }}>{item.label}</div>
                  <div style={{ fontFamily: '"Inter",system-ui', fontSize: 12, color: HD.sub, lineHeight: 1.5 }}>{item.desc}</div>
                </HdCard>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

Object.assign(window, { HomePage });
