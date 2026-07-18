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

// ─── Mobile Inicio dashboard ─────────────────────────────────────────────────
// One-column, utility-ordered: next workout / my routine → streak + recent
// sessions → Aula. Progreso and Aula live here since they're not in the tab bar.
function MdCard({ children, pad = 16 }) {
  return (
    <div style={{ background: '#FFFFFF', border: '1px solid rgba(15,26,46,0.08)', borderRadius: 16,
      padding: pad, boxShadow: '0 1px 3px rgba(15,26,46,0.04), 0 6px 20px -10px rgba(15,26,46,0.10)' }}>
      {children}
    </div>
  );
}
function MdLabel({ children }) {
  return <div style={{ fontFamily:'ui-monospace,Menlo,monospace', fontSize:10, fontWeight:700, color:'#8A93A6', letterSpacing:1.2, marginBottom:10, textTransform:'uppercase' }}>{children}</div>;
}
function MdAction({ label, onClick, primary, green, full }) {
  return (
    <button onClick={onClick} style={{
      width: full ? '100%' : undefined, minHeight: 46, padding: '0 16px', borderRadius: 11, cursor: 'pointer',
      border: primary || green ? 'none' : '1px solid rgba(15,26,46,0.14)',
      background: green ? '#16A34A' : primary ? '#0F1A2E' : '#FFFFFF',
      color: primary || green ? '#FFFFFF' : '#0F1A2E',
      fontFamily: '"Inter",system-ui', fontSize: 14, fontWeight: 700, letterSpacing: -0.1,
    }}>{label}</button>
  );
}

function HomeMobileDashboard() {
  const { state } = useStore();
  const { navigate } = useRoute();
  const profile = React.useMemo(() => { try { return JSON.parse(localStorage.getItem('atlas.profile.v1') || 'null'); } catch { return null; } }, []);
  const activeRoutine = React.useMemo(() => { try { return JSON.parse(localStorage.getItem('atlas.routine.active.v1') || 'null'); } catch { return null; } }, []);

  const userName = state.user?.name || 'Atleta';
  const log      = state.log || [];
  const streak   = state.sessions?.streak || 0;
  const completed= state.sessions?.completed || 0;
  const recent   = log.slice(0, 3);
  const hasRoutine = activeRoutine && Array.isArray(activeRoutine.sessions) && activeRoutine.sessions.length;

  function trainSession(routine, i) {
    const s = routine.sessions[i];
    if (!s) return;
    try {
      localStorage.setItem('atlas.pendingWorkout', JSON.stringify(s.exercises || []));
      localStorage.setItem('atlas.pendingWorkoutMeta', JSON.stringify({ routineName: routine.name, sessionName: s.name, sessionIndex: i, totalSessions: routine.sessions.length }));
    } catch {}
    navigate('/player');
  }

  return (
    <div style={{ background: '#FAFAF7', minHeight: '60vh', padding: '20px 16px 24px' }}>
      <div style={{ maxWidth: 560, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 14 }}>

        {/* Greeting */}
        <div>
          <h1 style={{ fontFamily:'"Inter",system-ui', fontWeight:800, fontSize:'clamp(22px,6vw,30px)', letterSpacing:-1, color:'#0F1A2E', margin:0 }}>
            Hola, {userName}
          </h1>
          <div style={{ fontFamily:'"Inter",system-ui', fontSize:'clamp(13px,3.6vw,15px)', color:'#5C6477', marginTop:4 }}>
            {profile?.objective ? OBJ_LABEL_SHORT[profile.objective] : 'Datos. Decisiones. Rendimiento.'}
          </div>
        </div>

        {/* 1 — Next workout / my routine (highest utility) */}
        <MdCard>
          {hasRoutine ? (
            <>
              <MdLabel>Tu próximo entrenamiento</MdLabel>
              <div style={{ fontFamily:'"Inter",system-ui', fontSize:'clamp(16px,4.6vw,19px)', fontWeight:800, color:'#0F1A2E', letterSpacing:-0.4 }}>{activeRoutine.name || 'Mi rutina'}</div>
              <div style={{ fontFamily:'"Inter",system-ui', fontSize:13, color:'#5C6477', marginTop:3, marginBottom:14 }}>
                {activeRoutine.sessions.length} {activeRoutine.sessions.length === 1 ? 'sesión' : 'sesiones'}
              </div>
              <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                {activeRoutine.sessions.slice(0, 4).map((s, i) => (
                  <button key={i} onClick={() => trainSession(activeRoutine, i)} style={{
                    display:'flex', alignItems:'center', justifyContent:'space-between', gap:10,
                    minHeight:48, padding:'0 14px', borderRadius:11, cursor:'pointer',
                    border:'1px solid rgba(15,26,46,0.10)', background:'#FFFFFF',
                    fontFamily:'"Inter",system-ui', fontSize:14, fontWeight:700, color:'#0F1A2E' }}>
                    <span style={{ overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{s.name || `Día ${i+1}`}</span>
                    <span style={{ flexShrink:0, color:'#16A34A', fontWeight:800 }}>▶ Entrenar</span>
                  </button>
                ))}
              </div>
              <div style={{ display:'flex', gap:8, marginTop:12 }}>
                <MdAction label="Mis rutinas" onClick={() => navigate('/rutinas')} full />
                <MdAction label="Builder" onClick={() => navigate('/builder')} full />
              </div>
            </>
          ) : recent.length ? (
            <>
              <MdLabel>Continúa donde lo dejaste</MdLabel>
              <div style={{ fontFamily:'"Inter",system-ui', fontSize:'clamp(15px,4.4vw,18px)', fontWeight:800, color:'#0F1A2E', letterSpacing:-0.3, marginBottom:2 }}>
                {recent[0].sessionName || recent[0].routineName || 'Última sesión'}
              </div>
              <div style={{ fontFamily:'"Inter",system-ui', fontSize:13, color:'#5C6477', marginBottom:14 }}>{daysAgo(recent[0].dateTs || Date.now())}</div>
              <div style={{ display:'flex', gap:8 }}>
                <MdAction label="Hablar con Coach" onClick={() => navigate('/coach')} primary full />
                <MdAction label="Builder" onClick={() => navigate('/builder')} full />
              </div>
            </>
          ) : (
            <>
              <MdLabel>Empieza con Atlas</MdLabel>
              <div style={{ fontFamily:'"Inter",system-ui', fontSize:'clamp(16px,4.6vw,19px)', fontWeight:800, color:'#0F1A2E', letterSpacing:-0.4, marginBottom:4 }}>
                Crea tu primer plan
              </div>
              <p style={{ fontFamily:'"Inter",system-ui', fontSize:14, color:'#5C6477', lineHeight:1.5, margin:'0 0 14px' }}>
                Habla con Atlas Coach o construye una rutina en el Builder.
              </p>
              <div style={{ display:'flex', gap:8 }}>
                <MdAction label="Hablar con Coach" onClick={() => navigate('/coach')} primary full />
                <MdAction label="Builder" onClick={() => navigate('/builder')} full />
              </div>
            </>
          )}
        </MdCard>

        {/* 2 — Streak + recent sessions */}
        <MdCard>
          <div style={{ display:'flex', gap:14, marginBottom: recent.length ? 14 : 0 }}>
            <div style={{ flex:1, textAlign:'center', padding:'10px 0', borderRadius:12, background:'rgba(15,26,46,0.03)' }}>
              <div style={{ fontFamily:'"Inter",system-ui', fontSize:'clamp(22px,7vw,28px)', fontWeight:800, color: streak >= 3 ? '#16A34A' : '#0F1A2E', letterSpacing:-1 }}>{streak}</div>
              <div style={{ fontFamily:'"Inter",system-ui', fontSize:11, color:'#8A93A6', fontWeight:600 }}>días de racha</div>
            </div>
            <div style={{ flex:1, textAlign:'center', padding:'10px 0', borderRadius:12, background:'rgba(15,26,46,0.03)' }}>
              <div style={{ fontFamily:'"Inter",system-ui', fontSize:'clamp(22px,7vw,28px)', fontWeight:800, color:'#0F1A2E', letterSpacing:-1 }}>{completed}</div>
              <div style={{ fontFamily:'"Inter",system-ui', fontSize:11, color:'#8A93A6', fontWeight:600 }}>sesiones</div>
            </div>
          </div>
          {recent.length > 0 && (
            <>
              <MdLabel>Últimas sesiones</MdLabel>
              <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                {recent.map((s, i) => (
                  <div key={i} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:10 }}>
                    <span style={{ fontFamily:'"Inter",system-ui', fontSize:14, fontWeight:600, color:'#0F1A2E', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                      {s.sessionName || s.routineName || `Sesión`}
                    </span>
                    <span style={{ flexShrink:0, fontFamily:'ui-monospace,Menlo,monospace', fontSize:11, color:'#8A93A6' }}>{daysAgo(s.dateTs || Date.now())}</span>
                  </div>
                ))}
              </div>
              <button onClick={() => navigate('/progreso')} style={{ width:'100%', marginTop:14, minHeight:44, borderRadius:11, cursor:'pointer', border:'1px solid rgba(15,26,46,0.14)', background:'#FFFFFF', fontFamily:'"Inter",system-ui', fontSize:14, fontWeight:700, color:'#0F1A2E' }}>
                Ver mi progreso →
              </button>
            </>
          )}
          {recent.length === 0 && (
            <button onClick={() => navigate('/progreso')} style={{ width:'100%', marginTop:14, minHeight:44, borderRadius:11, cursor:'pointer', border:'1px solid rgba(15,26,46,0.14)', background:'#FFFFFF', fontFamily:'"Inter",system-ui', fontSize:14, fontWeight:700, color:'#0F1A2E' }}>
              Ver mi progreso →
            </button>
          )}
        </MdCard>

        {/* 3 — Aula (access, not in the tab bar) */}
        <MdCard>
          <MdLabel>Aprende</MdLabel>
          <div style={{ fontFamily:'"Inter",system-ui', fontSize:'clamp(15px,4.4vw,18px)', fontWeight:800, color:'#0F1A2E', letterSpacing:-0.3, marginBottom:2 }}>
            El Aula
          </div>
          <p style={{ fontFamily:'"Inter",system-ui', fontSize:14, color:'#5C6477', lineHeight:1.5, margin:'0 0 14px' }}>
            Artículos basados en evidencia sobre entrenamiento, nutrición y recuperación.
          </p>
          <MdAction label="Explorar el Aula →" onClick={() => navigate('/aula')} primary full />
        </MdCard>

      </div>
    </div>
  );
}

// ─── Full HomePage (original landing + context card) ──────────────────────────
function HomePage() {
  const isMobile = useIsMobile();
  if (isMobile) return <HomeMobileDashboard />;
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
