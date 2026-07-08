// Progreso — workout history & stats dashboard

const PG = {
  page:   '#060D18',
  card:   '#0E1A2C',
  card2:  '#0A1628',
  border: 'rgba(255,255,255,0.07)',
  text:   '#E8EDF8',
  sub:    'rgba(232,237,248,0.55)',
  muted:  'rgba(232,237,248,0.28)',
  blue:   '#3B82F6',
  green:  '#22C55E',
  amber:  '#F59E0B',
  red:    '#EF4444',
};

// ── Helpers ───────────────────────────────────────────────────────────────────
function weekStart(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - d.getDay()); // Sunday-aligned
  return d.getTime();
}

function computeStreak(log) {
  if (!log || log.length === 0) return 0;
  const weeks = new Set(log.map(s => weekStart(s.dateTs || Date.now())));
  const sorted = Array.from(weeks).sort((a, b) => b - a);
  const MS_WEEK = 7 * 24 * 60 * 60 * 1000;
  let streak = 1;
  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i - 1] - sorted[i] <= MS_WEEK + 1000) streak++;
    else break;
  }
  return streak;
}

function computeAdherence(log, profile) {
  const trainingDays = profile?.trainingDays || 3;
  const now  = Date.now();
  const msMonth = 30 * 24 * 60 * 60 * 1000;
  const monthSessions = (log || []).filter(s => now - (s.dateTs || 0) < msMonth).length;
  const target = trainingDays * 4;
  return target > 0 ? Math.min(100, Math.round((monthSessions / target) * 100)) : 0;
}

function volumeThisWeek(log) {
  const now    = Date.now();
  const msWeek = 7 * 24 * 60 * 60 * 1000;
  const weekLog = (log || []).filter(s => now - (s.dateTs || 0) < msWeek);
  return weekLog.reduce((t, s) =>
    t + (s.exercises || []).reduce((ts, ex) => ts + (ex.sets || []).length, 0), 0);
}

function musclesThisWeek(log) {
  const now    = Date.now();
  const msWeek = 7 * 24 * 60 * 60 * 1000;
  const weekLog = (log || []).filter(s => now - (s.dateTs || 0) < msWeek);
  const counts = {};
  weekLog.forEach(s => {
    (s.exercises || []).forEach(ex => {
      const sets = (ex.sets || []).length;
      (ex.muscles || []).forEach(m => {
        const k = String(m).trim();
        if (k) counts[k] = (counts[k] || 0) + sets;
      });
    });
  });
  return counts;
}

function fmtDate(entry) {
  if (!entry) return '';
  const ts = entry.dateTs || 0;
  if (!ts) return entry.date || '';
  return new Date(ts).toLocaleDateString('es-ES', { day:'numeric', month:'short' });
}

function fmtDuration(secs) {
  if (!secs) return '—';
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return m > 0 ? `${m}:${String(s).padStart(2,'0')}` : `${s}s`;
}

// ── Stat Card ─────────────────────────────────────────────────────────────────
function StatCard({ label, value, sub, color }) {
  return (
    <div style={{ background:PG.card, borderRadius:14, padding:'16px 18px',
      border:`1px solid ${PG.border}` }}>
      <div style={{ fontFamily:'ui-monospace,Menlo,monospace', fontSize:8.5,
        fontWeight:700, color:PG.muted, letterSpacing:1.5, marginBottom:8 }}>
        {label.toUpperCase()}
      </div>
      <div style={{ fontFamily:'"Space Grotesk",system-ui', fontSize:26,
        fontWeight:800, color: color || PG.text, lineHeight:1, marginBottom:4 }}>
        {value}
      </div>
      {sub && (
        <div style={{ fontFamily:'Inter,system-ui', fontSize:11, color:PG.muted }}>
          {sub}
        </div>
      )}
    </div>
  );
}

// ── Muscle Volume Bar Chart ───────────────────────────────────────────────────
function MuscleChart({ counts }) {
  const entries = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 8);
  if (entries.length === 0) return null;
  const max = entries[0][1];

  return (
    <div style={{ background:PG.card, borderRadius:14, padding:'18px 20px',
      border:`1px solid ${PG.border}` }}>
      <div style={{ fontFamily:'ui-monospace,Menlo,monospace', fontSize:8.5,
        fontWeight:700, color:PG.muted, letterSpacing:1.5, marginBottom:16 }}>
        VOLUMEN POR MÚSCULO (ESTA SEMANA)
      </div>

      {entries.map(([muscle, sets]) => {
        const pct = max > 0 ? (sets / max) * 100 : 0;
        return (
          <div key={muscle} style={{ marginBottom:10 }}>
            <div style={{ display:'flex', justifyContent:'space-between',
              alignItems:'center', marginBottom:4 }}>
              <span style={{ fontFamily:'Inter,system-ui', fontSize:12,
                color:PG.sub, fontWeight:500 }}>{muscle}</span>
              <span style={{ fontFamily:'ui-monospace,Menlo,monospace',
                fontSize:10, color:PG.muted }}>{sets} series</span>
            </div>
            <div style={{ height:6, borderRadius:999,
              background:'rgba(255,255,255,0.06)', overflow:'hidden' }}>
              <div style={{ height:'100%', width:`${pct}%`, borderRadius:999,
                background:PG.blue, transition:'width .4s ease' }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Recent Session Row ────────────────────────────────────────────────────────
function SessionRow({ entry }) {
  const exCount  = (entry.exercises || []).length;
  const setCount = (entry.exercises || []).reduce((t, ex) => t + (ex.sets || []).length, 0);
  const muscles  = [...new Set(
    (entry.exercises || []).flatMap(ex => ex.muscles || []).slice(0, 3)
  )].filter(Boolean);

  return (
    <div style={{ padding:'14px 0', borderBottom:`1px solid ${PG.border}` }}>
      <div style={{ display:'flex', justifyContent:'space-between',
        alignItems:'flex-start', marginBottom:5 }}>
        <div>
          <div style={{ fontFamily:'Inter,system-ui', fontSize:13,
            fontWeight:700, color:PG.text, marginBottom:2 }}>
            {entry.sessionName || `Sesión — ${fmtDate(entry)}`}
          </div>
          <div style={{ fontFamily:'ui-monospace,Menlo,monospace', fontSize:10,
            color:PG.muted }}>
            {fmtDate(entry)}{entry.duration ? ` · ${fmtDuration(entry.duration)}` : ''}
            {entry.routineName ? ` · ${entry.routineName}` : ''}
          </div>
        </div>
        <div style={{ textAlign:'right' }}>
          <div style={{ fontFamily:'ui-monospace,Menlo,monospace', fontSize:11,
            color:PG.blue, fontWeight:700 }}>{setCount} series</div>
          <div style={{ fontFamily:'ui-monospace,Menlo,monospace', fontSize:10,
            color:PG.muted }}>{exCount} ejerc.</div>
        </div>
      </div>

      {muscles.length > 0 && (
        <div style={{ display:'flex', gap:5, flexWrap:'wrap' }}>
          {muscles.map((m, i) => (
            <span key={i} style={{ padding:'2px 8px', borderRadius:999, fontSize:10,
              background:'rgba(59,130,246,0.12)', color:'#93C5FD',
              fontFamily:'Inter,system-ui' }}>
              {m}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
function ProgresoSection() {
  const { state }  = useStore();
  const { navigate } = useRoute();
  const log = state.log || [];

  const profile = useMemo(() => {
    try { return JSON.parse(localStorage.getItem('atlas.profile.v1') || 'null'); } catch { return null; }
  }, []);

  const streak    = useMemo(() => computeStreak(log),              [log]);
  const adherence = useMemo(() => computeAdherence(log, profile),  [log, profile]);
  const volWeek   = useMemo(() => volumeThisWeek(log),             [log]);
  const muscleCts = useMemo(() => musclesThisWeek(log),            [log]);
  const recent    = log.slice(0, 5);

  return (
    <div style={{ minHeight:'100vh', background:PG.page, paddingBottom:60 }}>

      {/* Header */}
      <div style={{ maxWidth:720, margin:'0 auto', padding:'40px 20px 0' }}>
        <div style={{ marginBottom:28 }}>
          <div style={{ fontFamily:'ui-monospace,Menlo,monospace', fontSize:9,
            fontWeight:700, color:PG.muted, letterSpacing:2, marginBottom:8 }}>
            ATLAS METHOD
          </div>
          <div style={{ fontFamily:'"Space Grotesk",system-ui', fontSize:28,
            fontWeight:800, color:PG.text, marginBottom:6 }}>
            Mi Progreso
          </div>
          <div style={{ fontFamily:'Inter,system-ui', fontSize:14, color:PG.sub }}>
            {log.length === 0
              ? 'Registra tu primera sesión para ver estadísticas.'
              : `${log.length} sesión${log.length !== 1 ? 'es' : ''} registrada${log.length !== 1 ? 's' : ''}`}
          </div>
        </div>

        {/* Stats grid */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(2, 1fr)',
          gap:12, marginBottom:28 }}>
          <StatCard
            label="Sesiones totales"
            value={log.length}
            sub="historial completo"
            color={PG.text}
          />
          <StatCard
            label="Racha semanal"
            value={streak}
            sub={streak === 1 ? 'semana activa' : 'semanas seguidas'}
            color={streak >= 4 ? PG.green : streak >= 2 ? PG.amber : PG.text}
          />
          <StatCard
            label="Series esta semana"
            value={volWeek}
            sub="series completadas"
            color={volWeek >= 20 ? PG.green : volWeek > 0 ? PG.blue : PG.muted}
          />
          <StatCard
            label="Adherencia (mes)"
            value={`${adherence}%`}
            sub={`objetivo: ${(profile?.trainingDays || 3) * 4} ses/mes`}
            color={adherence >= 80 ? PG.green : adherence >= 50 ? PG.amber : PG.red}
          />
        </div>

        {/* Muscle chart */}
        {Object.keys(muscleCts).length > 0 && (
          <div style={{ marginBottom:28 }}>
            <MuscleChart counts={muscleCts} />
          </div>
        )}

        {/* Recent sessions */}
        <div style={{ background:PG.card, borderRadius:14, padding:'18px 20px',
          border:`1px solid ${PG.border}`, marginBottom:20 }}>
          <div style={{ fontFamily:'ui-monospace,Menlo,monospace', fontSize:8.5,
            fontWeight:700, color:PG.muted, letterSpacing:1.5, marginBottom:4 }}>
            ÚLTIMAS SESIONES
          </div>

          {recent.length === 0 ? (
            <div style={{ padding:'24px 0', textAlign:'center',
              fontFamily:'Inter,system-ui', fontSize:13, color:PG.muted }}>
              Sin sesiones registradas
            </div>
          ) : (
            recent.map((entry, i) => (
              <SessionRow key={entry.id || i} entry={entry} />
            ))
          )}
        </div>

        {/* CTA */}
        <div style={{ display:'flex', gap:10 }}>
          <button onClick={() => navigate('/builder')}
            style={{ flex:1, padding:'13px', borderRadius:12, border:'none',
              cursor:'pointer', background:PG.blue, color:'#fff',
              fontFamily:'Inter,system-ui', fontSize:14, fontWeight:700 }}>
            Ir al Builder
          </button>
          <button onClick={() => navigate('/player')}
            style={{ flex:1, padding:'13px', borderRadius:12,
              border:`1px solid ${PG.border}`, cursor:'pointer',
              background:'rgba(255,255,255,0.04)', color:PG.sub,
              fontFamily:'Inter,system-ui', fontSize:14, fontWeight:600 }}>
            Iniciar sesión
          </button>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { ProgresoSection });
