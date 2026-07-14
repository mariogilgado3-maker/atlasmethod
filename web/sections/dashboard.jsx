// Dashboard — full user dashboard reading from store

const ACHIEVEMENTS = [
  { id: 'primera-sesion', title: 'Primera sesión', desc: 'Completaste tu primera sesión', icon: '🏋️' },
  { id: 'racha-3', title: 'Racha 3 días', desc: 'Mantuviste racha 3 días seguidos', icon: '🔥' },
  { id: 'racha-7', title: 'Racha 7 días', desc: 'Una semana sin parar', icon: '⚡' },
  { id: 'primer-articulo', title: 'Primer artículo', desc: 'Leíste tu primer artículo', icon: '📖' },
  { id: 'cinco-articulos', title: 'Ávido lector', desc: 'Leíste 5 artículos', icon: '🧪' },
  { id: 'primer-protocolo', title: 'Planificador', desc: 'Generaste tu primer protocolo', icon: '📋' },
  { id: 'gemas-500', title: '500 gemas', desc: 'Acumulaste 500 gemas', icon: '💎' },
  { id: 'gemas-1000', title: 'Inversor', desc: 'Acumulaste 1000 gemas', icon: '🏆' },
];

// Generate last 30 days with session markers
function getLast30Days(log) {
  const days = [];
  const now = new Date();
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    const dateStr = d.toDateString();
    const hasSession = log.some(entry => entry.date === dateStr);
    days.push({ dateStr, hasSession, dayNum: d.getDate(), weekday: d.getDay() });
  }
  return days;
}

function computeAdherence(sessions, log) {
  if (sessions.completed === 0) return 0;
  const last30 = getLast30Days(log);
  const activeDays = last30.filter(d => d.hasSession).length;
  return Math.round((activeDays / 30) * 100);
}

function DashboardSection() {
  const { state, actions } = useStore();
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

  const log = state.log || [];
  const sessions = state.sessions;
  const gems = state.gems;
  const achievements = state.achievements || [];
  const completed = state.reading.completed || [];

  const adherence = computeAdherence(sessions, log);
  const calDays = getLast30Days(log);
  const recentSessions = log.slice(0, 5);

  // Chart from log — real weekly volume in kg when available
  const chartData = React.useMemo(() => {
    if (log.length < 2) return [];
    if (typeof peGetWeeklyVolume !== 'undefined') {
      const weeks = peGetWeeklyVolume(log, 12);
      const vols  = weeks.map(w => w.totalVolume);
      if (vols.some(v => v > 0)) return vols;
      return weeks.map(w => w.totalSets);
    }
    return log.slice(0, 12).reverse().map(entry =>
      (entry.exercises || []).reduce((acc, ex) => acc + (ex.sets || []).length, 0)
    );
  }, [log]);

  const progressData = React.useMemo(() => {
    if (typeof peGetProgressSummary === 'undefined' || log.length < 2) return null;
    return peGetProgressSummary(log);
  }, [log]);

  const levelColors = {
    principiante: { bg: '#E7F8EC', text: '#1F8B3A' },
    intermedio: { bg: 'rgba(42,111,219,0.1)', text: '#1a4fa0' },
    avanzado: { bg: 'rgba(15,26,46,0.1)', text: '#0F1A2E' },
  };
  const lvlColor = levelColors[state.user.level] || levelColors.intermedio;

  return (
    <section style={{ padding: '120px 32px', background: '#FFFFFF', minHeight: '80vh' }}>
      <div style={{ maxWidth: 1180, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 40 }}>
          <div>
            <span style={{ fontFamily: '"Inter",system-ui', fontSize: 13, fontWeight: 700, letterSpacing: 1.6, textTransform: 'uppercase', color: '#5C6477' }}>
              Perfil · Dashboard
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 10 }}>
              <div style={{
                width: 52, height: 52, borderRadius: 999,
                background: 'linear-gradient(135deg, #1A2845, #0F1A2E)',
                color: '#FAFAF7', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: '"Inter",system-ui', fontSize: 20, fontWeight: 800,
              }}>
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
                      style={{
                        fontFamily: '"Inter",system-ui', fontSize: 28, fontWeight: 700,
                        color: '#0F1A2E', letterSpacing: -0.8,
                        border: 'none', borderBottom: '2px solid #0F1A2E',
                        background: 'transparent', padding: '0 0 2px',
                        width: 200,
                      }}
                    />
                  ) : (
                    <h1 style={{ fontFamily: '"Inter",system-ui', fontSize: 28, fontWeight: 700, color: '#0F1A2E', letterSpacing: -1, margin: 0 }}>
                      Hola, {state.user.name}
                    </h1>
                  )}
                  <button
                    onClick={() => { setNameInput(state.user.name); setEditingName(e => !e); }}
                    style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#9498A4', fontSize: 14 }}
                  >
                    ✏️
                  </button>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                  <span style={{
                    padding: '3px 12px', borderRadius: 999,
                    background: lvlColor.bg, color: lvlColor.text,
                    fontFamily: '"Inter",system-ui', fontSize: 12, fontWeight: 700,
                    textTransform: 'capitalize',
                  }}>
                    {state.user.level}
                  </span>
                  <span style={{ fontFamily: '"Inter",system-ui', fontSize: 12, color: '#9498A4' }}>
                    {sessions.completed} sesiones totales
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Row 1 — 4 key stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
          <StatCard label="Racha actual" value={sessions.streak} unit="días" color="#0F1A2E" icon="🔥" />
          <StatCard label="Sesiones totales" value={sessions.completed} unit="" color="#1a4fa0" icon="🏋️" />
          <StatCard label="Gemas acumuladas" value={gems.balance.toLocaleString('es-ES')} unit="" color="#1F8B3A" icon="💎" />
          <StatCard label="Adherencia 30d" value={`${adherence}%`} unit="" color={adherence >= 70 ? '#1F8B3A' : adherence >= 40 ? '#0F1A2E' : '#C24545'} icon="📊" />
        </div>

        {/* Row 2 — calendar + chart */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>

          {/* Streak calendar */}
          <div style={{ background: '#FAFAF7', borderRadius: 20, border: '1px solid rgba(15,26,46,0.06)', padding: '20px 24px' }}>
            <div style={sectionLabelStyle}>Últimos 30 días</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(10, 1fr)', gap: 5, marginTop: 14 }}>
              {calDays.map((day, i) => (
                <div
                  key={i}
                  title={`${day.dateStr}${day.hasSession ? ' · Sesión' : ''}`}
                  style={{
                    aspectRatio: '1', borderRadius: 6,
                    background: day.hasSession ? '#0F1A2E' : 'rgba(15,26,46,0.07)',
                    position: 'relative',
                  }}
                >
                  {day.hasSession && (
                    <div style={{
                      position: 'absolute', inset: 0, borderRadius: 6,
                      background: 'rgba(255,255,255,0.1)',
                    }} />
                  )}
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 12 }}>
              <div style={{ width: 12, height: 12, borderRadius: 3, background: '#0F1A2E' }} />
              <span style={{ fontFamily: '"Inter",system-ui', fontSize: 11, color: '#9498A4' }}>Sesión registrada</span>
              <div style={{ width: 12, height: 12, borderRadius: 3, background: 'rgba(15,26,46,0.07)', marginLeft: 8 }} />
              <span style={{ fontFamily: '"Inter",system-ui', fontSize: 11, color: '#9498A4' }}>Sin sesión</span>
            </div>
          </div>

          {/* Progress chart */}
          <div style={{ background: '#FAFAF7', borderRadius: 20, border: '1px solid rgba(15,26,46,0.06)', padding: '20px 24px' }}>
            <div style={sectionLabelStyle}>Volumen semanal (kg)</div>
            <DashProgressChart data={chartData} />
          </div>
        </div>

        {/* Row 3 — recent sessions */}
        <div style={{ background: '#FAFAF7', borderRadius: 20, border: '1px solid rgba(15,26,46,0.06)', padding: '20px 24px', marginBottom: 24 }}>
          <div style={sectionLabelStyle}>Sesiones recientes</div>
          {recentSessions.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '30px 0', color: '#9498A4' }}>
              <p style={{ fontFamily: '"Inter",system-ui', fontSize: 14 }}>Aún no has registrado sesiones. ¡Ve al Builder!</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 14 }}>
              {recentSessions.map((session, i) => {
                const totalSets = (session.exercises || []).reduce((acc, ex) => acc + (ex.sets || []).length, 0);
                const exerciseNames = (session.exercises || []).map(e => e.name).join(', ');
                return (
                  <div key={session.id || i} style={{
                    padding: '12px 16px', borderRadius: 12,
                    background: '#FFFFFF', border: '1px solid rgba(15,26,46,0.06)',
                    display: 'flex', alignItems: 'center', gap: 14,
                  }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                      background: '#0F1A2E', color: '#FAFAF7',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontFamily: '"Inter",system-ui', fontSize: 13, fontWeight: 700,
                    }}>
                      {(session.exercises || []).length}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontFamily: '"Inter",system-ui', fontSize: 13, fontWeight: 700, color: '#0F1A2E', marginBottom: 2 }}>
                        {session.date}
                      </div>
                      <div style={{
                        fontFamily: '"Inter",system-ui', fontSize: 11, color: '#9498A4',
                        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                      }}>
                        {exerciseNames || 'Sin ejercicios'}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ fontFamily: 'ui-monospace,Menlo,monospace', fontSize: 12, color: '#5C6477', fontWeight: 700 }}>
                        {totalSets} series
                      </div>
                      <div style={{ fontFamily: '"Inter",system-ui', fontSize: 11, color: '#1F8B3A', fontWeight: 600 }}>
                        +{session.gems || 30} 💎
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Row 4 — Exercise progression */}
        {progressData && (progressData.topProgress.length > 0 || progressData.stagnant.length > 0) && (
          <div style={{ background: '#FAFAF7', borderRadius: 20, border: '1px solid rgba(15,26,46,0.06)', padding: '20px 24px', marginBottom: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <div style={sectionLabelStyle}>Progresión de ejercicios</div>
              {progressData.deload?.needed && (
                <span style={{ padding: '3px 10px', borderRadius: 999, background: 'rgba(180,80,0,0.08)', border: '1px solid rgba(180,80,0,0.18)', fontFamily: '"Inter",system-ui', fontSize: 11, fontWeight: 700, color: '#B45000' }}>
                  Deload recomendado
                </span>
              )}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <div style={{ fontFamily: '"Inter",system-ui', fontSize: 11, fontWeight: 700, color: '#1F8B3A', letterSpacing: 0.3, textTransform: 'uppercase', marginBottom: 10 }}>
                  En progresión ↑
                </div>
                {progressData.topProgress.length === 0
                  ? <div style={{ fontFamily: '"Inter",system-ui', fontSize: 12, color: '#9498A4' }}>Registra cargas para ver tu evolución</div>
                  : progressData.topProgress.map((e, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '7px 0', borderBottom: i < progressData.topProgress.length - 1 ? '1px solid rgba(15,26,46,0.05)' : 'none' }}>
                      <span style={{ fontFamily: '"Inter",system-ui', fontSize: 12, fontWeight: 600, color: '#0F1A2E' }}>{e.name}</span>
                      <span style={{ fontFamily: 'ui-monospace,Menlo,monospace', fontSize: 11, color: '#1F8B3A', fontWeight: 700 }}>+{e.delta} kg</span>
                    </div>
                  ))
                }
              </div>
              <div>
                <div style={{ fontFamily: '"Inter",system-ui', fontSize: 11, fontWeight: 700, color: '#B45000', letterSpacing: 0.3, textTransform: 'uppercase', marginBottom: 10 }}>
                  Sin progreso
                </div>
                {progressData.stagnant.length === 0
                  ? <div style={{ fontFamily: '"Inter",system-ui', fontSize: 12, color: '#9498A4' }}>Sin estancamientos detectados</div>
                  : progressData.stagnant.slice(0, 3).map((e, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '7px 0', borderBottom: i < Math.min(progressData.stagnant.length, 3) - 1 ? '1px solid rgba(15,26,46,0.05)' : 'none' }}>
                      <span style={{ fontFamily: '"Inter",system-ui', fontSize: 12, fontWeight: 600, color: '#0F1A2E' }}>{e.name}</span>
                      <span style={{ fontFamily: 'ui-monospace,Menlo,monospace', fontSize: 11, color: '#B45000', fontWeight: 700 }}>{e.sessions} ses.</span>
                    </div>
                  ))
                }
              </div>
            </div>
            {progressData.deload?.needed && (
              <div style={{ marginTop: 14, padding: '10px 14px', borderRadius: 10, background: 'rgba(180,80,0,0.05)', border: '1px solid rgba(180,80,0,0.14)' }}>
                <div style={{ fontFamily: '"Inter",system-ui', fontSize: 12, color: '#B45000', fontWeight: 600, marginBottom: 4 }}>
                  Señales de fatiga acumulada detectadas:
                </div>
                {progressData.deload.reasons.map((r, i) => (
                  <div key={i} style={{ fontFamily: '"Inter",system-ui', fontSize: 11, color: '#7A3A00' }}>• {r}</div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Row 5 — achievements */}
        <div style={{ background: '#FAFAF7', borderRadius: 20, border: '1px solid rgba(15,26,46,0.06)', padding: '20px 24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <div style={sectionLabelStyle}>Logros</div>
            <span style={{ fontFamily: '"Inter",system-ui', fontSize: 12, color: '#9498A4' }}>
              {achievements.length} / {ACHIEVEMENTS.length} desbloqueados
            </span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
            {ACHIEVEMENTS.map(ach => {
              const unlocked = achievements.includes(ach.id);
              return (
                <div key={ach.id} style={{
                  padding: '16px 14px', borderRadius: 16,
                  background: unlocked ? '#FFFFFF' : 'rgba(15,26,46,0.03)',
                  border: unlocked ? '1px solid rgba(15,26,46,0.12)' : '1px dashed rgba(15,26,46,0.1)',
                  textAlign: 'center',
                  transition: 'all 0.2s',
                  opacity: unlocked ? 1 : 0.55,
                }}>
                  <div style={{ fontSize: 28, marginBottom: 8, filter: unlocked ? 'none' : 'grayscale(1)' }}>
                    {ach.icon}
                  </div>
                  <div style={{ fontFamily: '"Inter",system-ui', fontSize: 12, fontWeight: 700, color: '#0F1A2E', marginBottom: 4 }}>
                    {ach.title}
                  </div>
                  <div style={{ fontFamily: '"Inter",system-ui', fontSize: 10, color: '#9498A4', lineHeight: 1.4 }}>
                    {ach.desc}
                  </div>
                  {unlocked && (
                    <div style={{ marginTop: 8, display: 'inline-block', padding: '2px 8px', borderRadius: 999, background: '#E7F8EC', color: '#1F8B3A', fontFamily: '"Inter",system-ui', fontSize: 10, fontWeight: 700 }}>
                      Desbloqueado
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Row 6 — data backup */}
        <DataBackupBlock />

      </div>
    </section>
  );
}

function StatCard({ label, value, unit, color, icon }) {
  return (
    <div style={{
      padding: '20px 22px', borderRadius: 20,
      background: '#FAFAF7', border: '1px solid rgba(15,26,46,0.06)',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
        <span style={{ fontFamily: '"Inter",system-ui', fontSize: 11, fontWeight: 700, color: '#9498A4', letterSpacing: 0.4, textTransform: 'uppercase' }}>
          {label}
        </span>
        <span style={{ fontSize: 18 }}>{icon}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
        <span style={{ fontFamily: '"Inter",system-ui', fontSize: 34, fontWeight: 800, color, letterSpacing: -1.5, lineHeight: 1 }}>
          {value}
        </span>
        {unit && (
          <span style={{ fontFamily: '"Inter",system-ui', fontSize: 14, color: '#9498A4', fontWeight: 500 }}>
            {unit}
          </span>
        )}
      </div>
    </div>
  );
}

function DashProgressChart({ data }) {
  const w = 400, h = 120;
  const max = Math.max(...data, 1);
  const min = 0;
  const n = data.length;
  const px = (i) => n <= 1 ? w / 2 : (i / (n - 1)) * w;
  const py = (v) => h - ((v - min) / (max - min || 1)) * h;

  if (n < 2) {
    return (
      <div style={{ height: 140, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9498A4' }}>
        <span style={{ fontFamily: '"Inter",system-ui', fontSize: 13 }}>Registra sesiones para ver tu progresión</span>
      </div>
    );
  }

  const path = data.map((v, i) => `${i === 0 ? 'M' : 'L'} ${px(i)} ${py(v)}`).join(' ');
  const areaPath = `${path} L ${px(n - 1)} ${h} L ${px(0)} ${h} Z`;

  return (
    <svg viewBox={`0 0 ${w} ${h + 20}`} style={{ width: '100%', height: 140, marginTop: 10 }}>
      <defs>
        <linearGradient id="dashChartGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#0F1A2E" stopOpacity="0.1" />
          <stop offset="1" stopColor="#0F1A2E" stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0, 0.25, 0.5, 0.75, 1].map((frac, i) => (
        <line key={i} x1="0" y1={h * frac} x2={w} y2={h * frac} stroke="rgba(15,26,46,0.06)" strokeDasharray="2 6" />
      ))}
      <path d={areaPath} fill="url(#dashChartGrad)" />
      <path d={path} fill="none" stroke="#0F1A2E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      {data.map((v, i) => (
        <circle key={i} cx={px(i)} cy={py(v)} r="3.5" fill="#0F1A2E" />
      ))}
    </svg>
  );
}

const sectionLabelStyle = {
  fontFamily: 'ui-monospace,Menlo,monospace', fontSize: 11, fontWeight: 700,
  color: '#9498A4', letterSpacing: 0.6, textTransform: 'uppercase',
};

function DataBackupBlock() {
  const [confirm, setConfirm] = React.useState(null); // { summary, applyFn }
  const [error,   setError]   = React.useState(null);
  const fileRef = React.useRef(null);

  function handleExport() {
    if (typeof exportBackup === 'undefined') return;
    exportBackup();
  }

  function handleFileChange(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    e.target.value = '';
    if (typeof importBackup === 'undefined') return;
    importBackup(file, {
      onSummary: (lines, applyFn) => { setError(null); setConfirm({ summary: lines, applyFn }); },
      onError:   (msg)            => { setConfirm(null); setError(msg); },
    });
  }

  const btnBase = {
    padding: '9px 18px', borderRadius: 10, cursor: 'pointer',
    fontFamily: '"Inter",system-ui', fontSize: 13, fontWeight: 700,
    border: '1px solid rgba(15,26,46,0.12)', transition: 'background .14s',
  };

  return (
    <div style={{ marginTop: 20, background: '#FAFAF7', borderRadius: 20, border: '1px solid rgba(15,26,46,0.06)', padding: '20px 24px' }}>
      <div style={sectionLabelStyle}>Tus datos</div>
      <p style={{ fontFamily: '"Inter",system-ui', fontSize: 12, color: '#9498A4', marginTop: 8, marginBottom: 16, lineHeight: 1.6 }}>
        Tus datos viven solo en este dispositivo y navegador. Descarga una copia de seguridad para no perderlos si cambias de dispositivo o borras la caché.
      </p>

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
        <button onClick={handleExport} style={{ ...btnBase, background: '#0F1A2E', color: '#FAFAF7', border: 'none' }}>
          Descargar copia de seguridad
        </button>
        <button
          onClick={() => fileRef.current && fileRef.current.click()}
          style={{ ...btnBase, background: 'transparent', color: '#3A4257' }}
        >
          Restaurar copia
        </button>
        <input
          ref={fileRef}
          type="file"
          accept=".json"
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />
      </div>

      {error && (
        <div style={{ marginTop: 14, padding: '10px 14px', borderRadius: 10, background: 'rgba(180,40,40,0.06)', border: '1px solid rgba(180,40,40,0.15)', fontFamily: '"Inter",system-ui', fontSize: 12, color: '#9B1C1C', lineHeight: 1.5 }}>
          {error}
          <button onClick={() => setError(null)} style={{ marginLeft: 10, background: 'none', border: 'none', cursor: 'pointer', color: '#9B1C1C', fontSize: 11, fontWeight: 700, padding: 0 }}>✕</button>
        </div>
      )}

      {confirm && (
        <div style={{ marginTop: 14, padding: '14px 16px', borderRadius: 12, background: 'rgba(15,26,46,0.04)', border: '1px solid rgba(15,26,46,0.10)' }}>
          <div style={{ fontFamily: '"Inter",system-ui', fontSize: 13, fontWeight: 700, color: '#0F1A2E', marginBottom: 8 }}>
            Este backup contiene:
          </div>
          <ul style={{ margin: '0 0 12px 18px', padding: 0 }}>
            {confirm.summary.map((line, i) => (
              <li key={i} style={{ fontFamily: '"Inter",system-ui', fontSize: 12, color: '#3A4257', marginBottom: 3 }}>{line}</li>
            ))}
          </ul>
          <div style={{ fontFamily: '"Inter",system-ui', fontSize: 11, color: '#9498A4', marginBottom: 12 }}>
            Esto sobrescribirá los datos actuales de este dispositivo. La app se recargará.
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={() => { confirm.applyFn(); setConfirm(null); }}
              style={{ ...btnBase, background: '#0F1A2E', color: '#FAFAF7', border: 'none', fontSize: 12 }}
            >
              Restaurar ahora
            </button>
            <button
              onClick={() => setConfirm(null)}
              style={{ ...btnBase, background: 'transparent', color: '#9498A4', fontSize: 12 }}
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

Object.assign(window, { DashboardSection });
