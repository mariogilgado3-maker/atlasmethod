// Atlas Method — Home Personalization Card
// A compact, single-row card that surfaces relevant context above the hero.
// Never replaces the landing — only complements it.

const OBJ_LABEL_SHORT = {
  muscle:      'Hipertrofia',
  fat_loss:    'Perder grasa',
  recomp:      'Recomposición',
  performance: 'Rendimiento',
  health:      'Salud',
};

function daysAgo(ts) {
  const d = Math.floor((Date.now() - ts) / 86400000);
  if (d === 0) return 'Hoy';
  if (d === 1) return 'Ayer';
  return `Hace ${d} días`;
}

// ─── Pill button ───────────────────────────────────────────────────────────────
function CtxPill({ label, onClick, primary }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '6px 14px', borderRadius: 999, cursor: 'pointer',
        border: primary ? 'none' : '1px solid rgba(15,26,46,0.12)',
        background: primary ? '#0F1A2E' : 'transparent',
        color: primary ? '#FAFAF7' : '#3A4257',
        fontFamily: '"Inter",system-ui', fontSize: 12, fontWeight: 700,
        letterSpacing: -0.1, whiteSpace: 'nowrap',
        transition: 'background .14s, border-color .14s',
      }}
    >
      {label}
    </button>
  );
}

// ─── Separator dot ─────────────────────────────────────────────────────────────
function Dot() {
  return <span style={{ width: 3, height: 3, borderRadius: '50%', background: 'rgba(15,26,46,0.2)', display: 'inline-block', flexShrink: 0 }} />;
}

// ─── Card variants ─────────────────────────────────────────────────────────────

function CardNew({ navigate }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
      <span style={{
        fontFamily: '"Inter",system-ui', fontSize: 13, fontWeight: 700,
        color: '#0F1A2E', letterSpacing: -0.2, whiteSpace: 'nowrap',
      }}>
        Empieza con Atlas
      </span>
      <Dot />
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <CtxPill label="Hablar con Coach →" onClick={() => navigate('/coach')} primary />
        <CtxPill label="Crear rutina"        onClick={() => navigate('/builder')} />
        <CtxPill label="Mis rutinas"         onClick={() => navigate('/rutinas')} />
        <CtxPill label="Explorar Aula"       onClick={() => navigate('/aula')} />
      </div>
    </div>
  );
}

function CardSession({ session, userName, profile, navigate }) {
  const when    = daysAgo(session.dateTs || Date.now());
  const sesName = session.name || 'Sesión anterior';
  const obj     = profile?.objective ? OBJ_LABEL_SHORT[profile.objective] : null;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
      <span style={{ fontFamily: '"Inter",system-ui', fontSize: 13, fontWeight: 700, color: '#0F1A2E', letterSpacing: -0.2, whiteSpace: 'nowrap' }}>
        Hola, {userName}
      </span>
      {obj && (
        <>
          <Dot />
          <span style={{ fontFamily: '"Inter",system-ui', fontSize: 12, color: '#5C6477', whiteSpace: 'nowrap' }}>
            {obj}
          </span>
        </>
      )}
      <Dot />
      <span style={{ fontFamily: '"Inter",system-ui', fontSize: 12, color: '#5C6477', whiteSpace: 'nowrap' }}>
        Última sesión: <strong style={{ color: '#0F1A2E', fontWeight: 700 }}>{sesName}</strong> · {when}
      </span>
      <CtxPill label="Reanudar →" onClick={() => navigate('/builder')} primary />
    </div>
  );
}

function CardPlan({ plan, navigate }) {
  const name = plan?.split?.name || plan?.name || 'Plan recomendado';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
      <span style={{ fontFamily: '"Inter",system-ui', fontSize: 13, fontWeight: 700, color: '#0F1A2E', letterSpacing: -0.2, whiteSpace: 'nowrap' }}>
        Plan recomendado
      </span>
      <Dot />
      <span style={{ fontFamily: '"Inter",system-ui', fontSize: 12, color: '#5C6477', whiteSpace: 'nowrap' }}>
        {String(name)}
      </span>
      <CtxPill label="Ver recomendación →" onClick={() => navigate('/coach')} primary />
    </div>
  );
}

function CardProfile({ profile, userName, navigate }) {
  const obj = profile?.objective ? OBJ_LABEL_SHORT[profile.objective] : null;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
      <span style={{ fontFamily: '"Inter",system-ui', fontSize: 13, fontWeight: 700, color: '#0F1A2E', letterSpacing: -0.2, whiteSpace: 'nowrap' }}>
        Hola, {userName}
      </span>
      {obj && (
        <>
          <Dot />
          <span style={{ fontFamily: '"Inter",system-ui', fontSize: 12, color: '#5C6477', whiteSpace: 'nowrap' }}>
            Objetivo: <strong style={{ color: '#0F1A2E', fontWeight: 700 }}>{obj}</strong>
          </span>
        </>
      )}
      <Dot />
      <CtxPill label="Hablar con Coach →" onClick={() => navigate('/coach')} primary />
      <CtxPill label="Ir al Builder"       onClick={() => navigate('/builder')} />
    </div>
  );
}

function CardRoutine({ routine, navigate }) {
  const name = routine.name || 'Rutina activa';
  const sessions = Array.isArray(routine.sessions) ? routine.sessions : [];
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
      <span style={{ fontFamily: '"Inter",system-ui', fontSize: 13, fontWeight: 700, color: '#0F1A2E', letterSpacing: -0.2, whiteSpace: 'nowrap' }}>
        Mi rutina
      </span>
      <Dot />
      <span style={{ fontFamily: '"Inter",system-ui', fontSize: 12, color: '#5C6477', whiteSpace: 'nowrap' }}>
        {name} · {sessions.length} día{sessions.length !== 1 ? 's' : ''}
      </span>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {sessions.slice(0, 4).map((s, i) => (
          <CtxPill key={i} label={s.name || `Día ${i+1}`} onClick={() => {
            localStorage.setItem('atlas.pendingWorkout', JSON.stringify(s.exercises || []));
            try { localStorage.setItem('atlas.pendingWorkoutMeta', JSON.stringify({ routineName: name, sessionName: s.name, sessionIndex: i, totalSessions: sessions.length, mode: 'player' })); } catch {}
            navigate('/player');
          }} />
        ))}
        <CtxPill label="Mis rutinas →" onClick={() => navigate('/rutinas')} primary />
      </div>
    </div>
  );
}

// ─── Main component ────────────────────────────────────────────────────────────
function HomeContextCard() {
  const { state } = useStore();
  const { navigate } = useRoute();

  const profile = React.useMemo(() => {
    try { return JSON.parse(localStorage.getItem('atlas.profile.v1') || 'null'); } catch { return null; }
  }, []);

  const activeRoutine = React.useMemo(() => {
    try { return JSON.parse(localStorage.getItem('atlas.routine.active.v1') || 'null'); } catch { return null; }
  }, []);

  const lastSession = (state.log || [])[0] || null;
  const coachPlan   = state.plan || null;
  const hasProfile  = !!(profile?.objective);
  const userName    = state.user?.name || 'Atleta';

  // Pick the highest-priority variant
  let content;
  if (activeRoutine && Array.isArray(activeRoutine.sessions) && activeRoutine.sessions.length) {
    content = <CardRoutine routine={activeRoutine} navigate={navigate} />;
  } else if (lastSession) {
    content = <CardSession session={lastSession} userName={userName} profile={profile} navigate={navigate} />;
  } else if (coachPlan) {
    content = <CardPlan plan={coachPlan} navigate={navigate} />;
  } else if (hasProfile) {
    content = <CardProfile profile={profile} userName={userName} navigate={navigate} />;
  } else {
    content = <CardNew navigate={navigate} />;
  }

  return (
    <div style={{ padding: '16px 48px 0', background: 'transparent' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div style={{
          display: 'flex', alignItems: 'center',
          background: '#FFFFFF',
          border: '1px solid rgba(15,26,46,0.07)',
          borderRadius: 14,
          padding: '11px 20px',
          boxShadow: '0 1px 3px rgba(15,26,46,0.04), 0 4px 16px -6px rgba(15,26,46,0.07)',
          animation: 'fadeIn 0.3s ease',
        }}>
          {/* Atlas monogram */}
          <div style={{
            width: 22, height: 22, borderRadius: 6, flexShrink: 0,
            background: '#0F1A2E',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginRight: 14,
          }}>
            <AtlasA size={13} color="#FAFAF7" stroke={10} />
          </div>

          {content}
        </div>
      </div>
    </div>
  );
}

// ─── Full HomePage (original landing + context card) ──────────────────────────
function HomePage() {
  return (
    <>
      <HomeContextCard />
      <Hero />
      <MethodSection />
      <MobileSection />
      <ClosingSection />
    </>
  );
}

Object.assign(window, { HomeContextCard, HomePage });
