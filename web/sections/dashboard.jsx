// Dashboard — Perfil de usuario, progreso y logros

// ── Theme ─────────────────────────────────────────────────────────────────────
const DP = {
  page:   '#060D18',
  panel:  '#0C1524',
  card:   '#111E30',
  border: 'rgba(255,255,255,0.07)',
  text:   '#E8EDF8',
  mid:    'rgba(232,237,248,0.55)',
  muted:  'rgba(232,237,248,0.28)',
  accent: '#2A6FDB',
};

// ── Achievement definitions ───────────────────────────────────────────────────
const ACHIEVEMENTS = [
  { id: 'primera-sesion',  title: 'Primera sesión',  desc: 'Completaste tu primera sesión',       icon: '01' },
  { id: 'racha-3',         title: 'Racha 3 días',    desc: '3 días consecutivos de entrenamiento', icon: '03' },
  { id: 'racha-7',         title: 'Racha 7 días',    desc: 'Una semana sin parar',                 icon: '07' },
  { id: 'primer-articulo', title: 'Primer artículo', desc: 'Leíste tu primer artículo',            icon: '📖' },
  { id: 'cinco-articulos', title: 'Ávido lector',    desc: 'Leíste 5 artículos del Aula',          icon: '05' },
  { id: 'primer-protocolo',title: 'Planificador',    desc: 'Generaste tu primer protocolo',        icon: '↗' },
  { id: 'gemas-500',       title: '500 gemas',       desc: 'Acumulaste 500 gemas',                 icon: '◆' },
  { id: 'gemas-1000',      title: 'Inversor',        desc: 'Acumulaste 1000 gemas',                icon: '◈' },
];

// ── Group chip colours ────────────────────────────────────────────────────────
const GROUP_CHIP = {
  pecho:   { bg: 'rgba(42,111,219,0.16)',  text: '#6EA9F0', label: 'Pecho' },
  espalda: { bg: 'rgba(34,197,94,0.13)',   text: '#4ADE80', label: 'Espalda' },
  hombro:  { bg: 'rgba(168,85,247,0.13)',  text: '#C084FC', label: 'Hombros' },
  biceps:  { bg: 'rgba(249,115,22,0.13)',  text: '#FB923C', label: 'Bíceps' },
  triceps: { bg: 'rgba(249,115,22,0.13)',  text: '#FB923C', label: 'Tríceps' },
  piernas: { bg: 'rgba(20,184,166,0.13)',  text: '#2DD4BF', label: 'Piernas' },
  gluteos: { bg: 'rgba(20,184,166,0.13)',  text: '#2DD4BF', label: 'Glúteos' },
  core:    { bg: 'rgba(234,179,8,0.13)',   text: '#FACC15', label: 'Core' },
};

// ── Helpers ───────────────────────────────────────────────────────────────────
const GROUP_RE = [
  [/pectoral/i,                                             'pecho'],
  [/dorsal|romboid|serrato|trapecio|erector/i,             'espalda'],
  [/deltoid/i,                                              'hombro'],
  [/bíceps|biceps/i,                                        'biceps'],
  [/tríceps|triceps/i,                                      'triceps'],
  [/cuádricep|cuadricep|femoral|pantorrilla|gemelo|sóleo/i, 'piernas'],
  [/glút|isquio/i,                                          'gluteos'],
  [/core|transverso|oblicu|abdominal/i,                     'core'],
];

function getSessionGroups(session) {
  const groups = new Set();
  (session.exercises || []).forEach(ex => {
    (ex.muscles || []).forEach(m => {
      for (const [re, g] of GROUP_RE) { if (re.test(m)) { groups.add(g); break; } }
    });
  });
  return [...groups];
}

function computeWeeklyVolumes(log) {
  const v = { pecho: 0, espalda: 0, hombro: 0, biceps: 0, triceps: 0, piernas: 0, gluteos: 0, core: 0 };
  (log || []).slice(0, 4).forEach(session => {
    (session.exercises || []).forEach(ex => {
      const n = Math.max((ex.sets || []).length, 1);
      (ex.muscles || []).forEach(m => {
        for (const [re, g] of GROUP_RE) { if (re.test(m)) { v[g] += n; break; } }
      });
    });
  });
  return v;
}

function getLast30Days(log) {
  const days = [];
  const now = new Date();
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    const dateStr = d.toDateString();
    const session = (log || []).find(e => e.date === dateStr);
    let intensity = 0;
    if (session) {
      const totalSets = (session.exercises || []).reduce((s, ex) => s + (ex.sets || []).length, 0);
      intensity = totalSets > 20 ? 3 : totalSets > 10 ? 2 : 1;
    }
    days.push({ dateStr, intensity, dayNum: d.getDate(), month: d.getMonth(), weekday: d.getDay() });
  }
  return days;
}

function computeAdherence(log) {
  if (!log || log.length === 0) return 0;
  const active = getLast30Days(log).filter(d => d.intensity > 0).length;
  return Math.round((active / 30) * 100);
}

function relativeDate(dateStr) {
  const now = new Date();
  const today = now.toDateString();
  const yesterday = new Date(Date.now() - 86400000).toDateString();
  if (dateStr === today) return 'Hoy';
  if (dateStr === yesterday) return 'Ayer';
  const d = new Date(dateStr);
  const diff = Math.floor((now - d) / 86400000);
  if (diff < 7) return `Hace ${diff}d`;
  return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
}

function countWeekSessions(log) {
  const weekAgo = new Date(Date.now() - 7 * 86400000).toDateString();
  return (log || []).filter(s => {
    const d = new Date(s.date);
    return d >= new Date(weekAgo);
  }).length;
}

// ── Stat panel ────────────────────────────────────────────────────────────────
function StatPanel({ label, value, unit, accent }) {
  return (
    <div style={{ padding: '20px 22px', borderRadius: 18, background: DP.panel, border: `1px solid ${DP.border}` }}>
      <div style={{ fontFamily: 'ui-monospace,Menlo,monospace', fontSize: 9, fontWeight: 700, color: DP.muted, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 12 }}>
        {label}
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
        <span style={{ fontFamily: '"Inter",system-ui', fontSize: 38, fontWeight: 800, color: accent || DP.text, lineHeight: 1, letterSpacing: -2 }}>
          {value}
        </span>
        {unit && (
          <span style={{ fontFamily: '"Inter",system-ui', fontSize: 14, color: DP.muted, fontWeight: 500 }}>{unit}</span>
        )}
      </div>
    </div>
  );
}

// ── 30-day activity calendar ──────────────────────────────────────────────────
function ActivityCalendar({ days }) {
  const INTENSITY_COLOR = [
    'rgba(255,255,255,0.05)',
    'rgba(42,111,219,0.28)',
    'rgba(42,111,219,0.58)',
    'rgba(42,111,219,0.88)',
  ];
  const MONTHS = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];

  return (
    <div>
      <div style={{ fontFamily: 'ui-monospace,Menlo,monospace', fontSize: 9, fontWeight: 700, color: DP.muted, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 14 }}>
        Últimos 30 días
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(10, 1fr)', gap: 6 }}>
        {days.map((day, i) => (
          <div
            key={i}
            title={`${day.dateStr}${day.intensity > 0 ? ` · Sesión (intensidad ${day.intensity})` : ''}`}
            style={{
              aspectRatio: '1', borderRadius: 6,
              background: INTENSITY_COLOR[day.intensity],
              border: day.intensity > 0 ? '1px solid rgba(42,111,219,0.2)' : '1px solid rgba(255,255,255,0.04)',
              cursor: day.intensity > 0 ? 'default' : 'default',
              transition: 'transform 0.1s',
            }}
          />
        ))}
      </div>
      {/* Legend */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 12 }}>
        <span style={{ fontFamily: '"Inter",system-ui', fontSize: 10, color: DP.muted }}>Menos</span>
        {INTENSITY_COLOR.map((c, i) => (
          <div key={i} style={{ width: 10, height: 10, borderRadius: 3, background: c, border: '1px solid rgba(255,255,255,0.06)' }} />
        ))}
        <span style={{ fontFamily: '"Inter",system-ui', fontSize: 10, color: DP.muted }}>Más</span>
      </div>
    </div>
  );
}

// ── Weekly muscle volume bars ─────────────────────────────────────────────────
function WeeklyMuscleChart({ log }) {
  const vols = computeWeeklyVolumes(log);
  const entries = Object.entries(vols).filter(([, v]) => v > 0).sort((a, b) => b[1] - a[1]);
  const max = Math.max(...entries.map(([, v]) => v), 1);

  if (entries.length === 0) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 120, fontFamily: '"Inter",system-ui', fontSize: 13, color: DP.muted, textAlign: 'center', lineHeight: 1.6 }}>
        Sin sesiones esta semana.<br />Entrena para ver el volumen.
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
      {entries.map(([group, sets]) => {
        const chip = GROUP_CHIP[group] || { text: DP.muted, bg: 'rgba(255,255,255,0.05)', label: group };
        return (
          <div key={group} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontFamily: '"Inter",system-ui', fontSize: 11, fontWeight: 600, color: chip.text, width: 60, flexShrink: 0 }}>{chip.label}</span>
            <div style={{ flex: 1, height: 6, borderRadius: 999, background: 'rgba(255,255,255,0.06)' }}>
              <div style={{ height: '100%', borderRadius: 999, background: chip.text, width: `${(sets / max) * 100}%`, opacity: 0.8, transition: 'width 0.4s' }} />
            </div>
            <span style={{ fontFamily: 'ui-monospace,Menlo,monospace', fontSize: 10, color: DP.muted, width: 26, textAlign: 'right', flexShrink: 0 }}>{sets}s</span>
          </div>
        );
      })}
    </div>
  );
}

// ── Session card ──────────────────────────────────────────────────────────────
function SessionCard({ session }) {
  const totalSets = (session.exercises || []).reduce((s, ex) => s + (ex.sets || []).length, 0);
  const groups = getSessionGroups(session);
  const exNames = (session.exercises || []).map(e => e.name).filter(Boolean);
  const relDate = relativeDate(session.date);

  return (
    <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', padding: '16px 18px', borderRadius: 16, background: DP.panel, border: `1px solid ${DP.border}` }}>
      {/* Date badge */}
      <div style={{ flexShrink: 0, textAlign: 'center', minWidth: 40 }}>
        <div style={{ fontFamily: '"Inter",system-ui', fontSize: 22, fontWeight: 800, color: DP.text, lineHeight: 1 }}>
          {new Date(session.date).getDate()}
        </div>
        <div style={{ fontFamily: '"Inter",system-ui', fontSize: 9, color: DP.muted, marginTop: 2, textTransform: 'uppercase' }}>
          {new Date(session.date).toLocaleDateString('es-ES', { month: 'short' })}
        </div>
        <div style={{ fontFamily: '"Inter",system-ui', fontSize: 9, color: DP.muted, marginTop: 2 }}>
          {relDate}
        </div>
      </div>

      {/* Divider */}
      <div style={{ width: 1, background: DP.border, alignSelf: 'stretch', flexShrink: 0 }} />

      {/* Main content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: '"Inter",system-ui', fontSize: 12, color: DP.mid, lineHeight: 1.4, marginBottom: 8, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical' }}>
          {exNames.length > 0 ? exNames.join(' · ') : 'Sesión registrada'}
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
          {groups.map(g => {
            const chip = GROUP_CHIP[g] || { bg: 'rgba(255,255,255,0.06)', text: DP.muted, label: g };
            return (
              <span key={g} style={{ padding: '3px 8px', borderRadius: 999, background: chip.bg, fontFamily: '"Inter",system-ui', fontSize: 10, fontWeight: 700, color: chip.text }}>
                {chip.label}
              </span>
            );
          })}
        </div>
      </div>

      {/* Stats */}
      <div style={{ flexShrink: 0, textAlign: 'right' }}>
        <div style={{ fontFamily: '"Inter",system-ui', fontSize: 18, fontWeight: 800, color: DP.text, lineHeight: 1 }}>
          {(session.exercises || []).length}
        </div>
        <div style={{ fontFamily: '"Inter",system-ui', fontSize: 9, color: DP.muted, marginTop: 2 }}>ejercicios</div>
        <div style={{ fontFamily: '"Inter",system-ui', fontSize: 10, color: '#FACC15', fontWeight: 700, marginTop: 6 }}>
          +{session.gems || 30} 💎
        </div>
      </div>
    </div>
  );
}

// ── Achievement badge ─────────────────────────────────────────────────────────
function AchievementBadge({ ach, unlocked }) {
  return (
    <div style={{
      padding: '18px 14px', borderRadius: 18, textAlign: 'center',
      background: unlocked ? DP.panel : 'rgba(255,255,255,0.02)',
      border: unlocked ? `1px solid rgba(42,111,219,0.28)` : `1px dashed rgba(255,255,255,0.07)`,
      opacity: unlocked ? 1 : 0.45,
      transition: 'opacity 0.2s',
    }}>
      <div style={{
        width: 44, height: 44, borderRadius: 14, margin: '0 auto 10px',
        background: unlocked ? 'rgba(42,111,219,0.15)' : 'rgba(255,255,255,0.04)',
        border: unlocked ? '1px solid rgba(42,111,219,0.28)' : '1px solid rgba(255,255,255,0.06)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: 'ui-monospace,Menlo,monospace', fontSize: ach.icon.length === 2 ? 14 : 18,
        fontWeight: 800, color: unlocked ? '#6EA9F0' : DP.muted,
      }}>
        {ach.icon}
      </div>
      <div style={{ fontFamily: '"Inter",system-ui', fontSize: 12, fontWeight: 700, color: unlocked ? DP.text : DP.muted, marginBottom: 4 }}>
        {ach.title}
      </div>
      <div style={{ fontFamily: '"Inter",system-ui', fontSize: 10, color: DP.muted, lineHeight: 1.4 }}>
        {ach.desc}
      </div>
      {unlocked && (
        <div style={{ marginTop: 10, display: 'inline-block', padding: '3px 8px', borderRadius: 999, background: 'rgba(42,111,219,0.14)', fontFamily: 'ui-monospace,Menlo,monospace', fontSize: 8, fontWeight: 700, color: '#6EA9F0', letterSpacing: 0.5 }}>
          DESBLOQUEADO
        </div>
      )}
    </div>
  );
}

// ── Main section ──────────────────────────────────────────────────────────────
function DashboardSection() {
  const { state, actions } = useStore();
  const { navigate } = useRoute();
  const [editingName, setEditingName] = React.useState(false);
  const [nameInput, setNameInput] = React.useState(state.user.name);
  const nameRef = React.useRef(null);

  React.useEffect(() => {
    if (editingName && nameRef.current) nameRef.current.focus();
  }, [editingName]);

  const handleNameSave = () => {
    if (nameInput.trim()) actions.setUser({ name: nameInput.trim() });
    setEditingName(false);
  };

  const log          = state.log || [];
  const sessions     = state.sessions;
  const gems         = state.gems;
  const achievements = state.achievements || [];
  const adherence    = computeAdherence(log);
  const weekCount    = countWeekSessions(log);
  const calDays      = getLast30Days(log);
  const recentLog    = log.slice(0, 6);

  const LEVEL_COLORS = {
    principiante: '#4ADE80',
    intermedio:   '#6EA9F0',
    avanzado:     '#C084FC',
  };
  const levelColor = LEVEL_COLORS[state.user.level] || '#6EA9F0';

  const adherenceColor = adherence >= 60 ? DP.success : adherence >= 30 ? '#F59E0B' : '#EF4444';

  return (
    <section style={{ minHeight: '100vh', background: DP.page, padding: '96px 32px 80px' }}>
      <div style={{ maxWidth: 1080, margin: '0 auto' }}>

        {/* ── Profile header ─────────────────────────────────────── */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 24, marginBottom: 40, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
            {/* Avatar */}
            <div style={{ width: 60, height: 60, borderRadius: 18, flexShrink: 0, background: 'linear-gradient(135deg, #1A2E5A, #0F1A2E)', border: `2px solid rgba(42,111,219,0.35)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: '"Inter",system-ui', fontSize: 22, fontWeight: 800, color: '#6EA9F0' }}>
              {(state.user.name || 'A')[0].toUpperCase()}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                {editingName ? (
                  <input
                    ref={nameRef}
                    value={nameInput}
                    onChange={e => setNameInput(e.target.value)}
                    onBlur={handleNameSave}
                    onKeyDown={e => e.key === 'Enter' && handleNameSave()}
                    style={{ fontFamily: '"Inter",system-ui', fontSize: 28, fontWeight: 800, color: DP.text, letterSpacing: -1, background: 'transparent', border: 'none', borderBottom: `1.5px solid ${DP.accent}`, padding: '0 0 2px', width: 200 }}
                  />
                ) : (
                  <h1 style={{ fontFamily: '"Inter",system-ui', fontSize: 28, fontWeight: 800, color: DP.text, letterSpacing: -1.2, margin: 0 }}>
                    Hola, {state.user.name}
                  </h1>
                )}
                <button onClick={() => { setNameInput(state.user.name); setEditingName(v => !v); }} style={{ border: 'none', background: 'none', cursor: 'pointer', color: DP.muted, fontSize: 12, padding: 4, borderRadius: 6 }}>
                  ✏
                </button>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
                <span style={{ padding: '3px 10px', borderRadius: 999, border: `1px solid ${levelColor}33`, background: `${levelColor}18`, fontFamily: '"Inter",system-ui', fontSize: 11, fontWeight: 700, color: levelColor, textTransform: 'capitalize' }}>
                  {state.user.level}
                </span>
                <span style={{ fontFamily: '"Inter",system-ui', fontSize: 12, color: DP.muted }}>
                  {sessions.completed} sesiones
                </span>
                {sessions.streak >= 3 && (
                  <span style={{ fontFamily: '"Inter",system-ui', fontSize: 11, fontWeight: 700, color: '#F59E0B' }}>
                    🔥 {sessions.streak} días
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Gem balance + CTA */}
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <div style={{ padding: '10px 16px', borderRadius: 12, background: DP.panel, border: `1px solid ${DP.border}`, display: 'flex', gap: 8, alignItems: 'center' }}>
              <span style={{ fontSize: 16 }}>💎</span>
              <span style={{ fontFamily: '"Inter",system-ui', fontSize: 16, fontWeight: 800, color: DP.text, letterSpacing: -0.5 }}>{gems.balance.toLocaleString('es-ES')}</span>
              <span style={{ fontFamily: '"Inter",system-ui', fontSize: 11, color: DP.muted }}>gemas</span>
            </div>
            <button
              onClick={() => navigate('/builder')}
              style={{ padding: '10px 18px', borderRadius: 12, background: DP.accent, color: '#fff', border: 'none', cursor: 'pointer', fontFamily: '"Inter",system-ui', fontSize: 13, fontWeight: 700 }}
            >
              + Sesión
            </button>
          </div>
        </div>

        {/* ── Key stats ──────────────────────────────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 24 }}>
          <StatPanel label="Racha actual"   value={sessions.streak}     unit="días"  accent="#F59E0B" />
          <StatPanel label="Sesiones total" value={sessions.completed}  accent={DP.accent} />
          <StatPanel label="Esta semana"    value={weekCount}           unit="ses."  accent="#4ADE80" />
          <StatPanel label="Adherencia 30d" value={`${adherence}%`}    accent={adherenceColor} />
        </div>

        {/* ── Calendar + muscle volume ────────────────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>

          <div style={{ padding: '22px 24px', borderRadius: 20, background: DP.panel, border: `1px solid ${DP.border}` }}>
            <ActivityCalendar days={calDays} />
          </div>

          <div style={{ padding: '22px 24px', borderRadius: 20, background: DP.panel, border: `1px solid ${DP.border}` }}>
            <div style={{ fontFamily: 'ui-monospace,Menlo,monospace', fontSize: 9, fontWeight: 700, color: DP.muted, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 18 }}>
              Volumen semanal
            </div>
            <WeeklyMuscleChart log={log} />
          </div>
        </div>

        {/* ── Recent sessions ────────────────────────────────────── */}
        <div style={{ padding: '22px 24px', borderRadius: 20, background: DP.card, border: `1px solid ${DP.border}`, marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
            <div style={{ fontFamily: 'ui-monospace,Menlo,monospace', fontSize: 9, fontWeight: 700, color: DP.muted, letterSpacing: 1, textTransform: 'uppercase' }}>
              Sesiones recientes
            </div>
            {recentLog.length > 0 && (
              <button onClick={() => navigate('/builder')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: '"Inter",system-ui', fontSize: 12, color: '#6EA9F0', fontWeight: 600 }}>
                Nueva sesión →
              </button>
            )}
          </div>
          {recentLog.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px 0' }}>
              <p style={{ fontFamily: '"Instrument Serif",serif', fontStyle: 'italic', fontSize: 18, color: DP.muted, margin: '0 0 12px' }}>
                Aún no hay sesiones registradas.
              </p>
              <button onClick={() => navigate('/builder')} style={{ padding: '10px 20px', borderRadius: 12, background: DP.accent, color: '#fff', border: 'none', cursor: 'pointer', fontFamily: '"Inter",system-ui', fontSize: 13, fontWeight: 700 }}>
                Ir al Builder →
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {recentLog.map((session, i) => (
                <SessionCard key={session.id || i} session={session} />
              ))}
            </div>
          )}
        </div>

        {/* ── Achievements ───────────────────────────────────────── */}
        <div style={{ padding: '22px 24px', borderRadius: 20, background: DP.card, border: `1px solid ${DP.border}` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
            <div style={{ fontFamily: 'ui-monospace,Menlo,monospace', fontSize: 9, fontWeight: 700, color: DP.muted, letterSpacing: 1, textTransform: 'uppercase' }}>
              Logros
            </div>
            <span style={{ fontFamily: '"Inter",system-ui', fontSize: 12, color: DP.muted }}>
              {achievements.length}/{ACHIEVEMENTS.length}
            </span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
            {ACHIEVEMENTS.map(ach => (
              <AchievementBadge key={ach.id} ach={ach} unlocked={achievements.includes(ach.id)} />
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}

Object.assign(window, { DashboardSection });
