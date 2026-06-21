// Atlas Progreso — Progress dashboard
// Route: /progreso
// Reads from AtlasProgressionEngine + store.log + AtlasProfile

// ── Design tokens ─────────────────────────────────────────────────────────────
const PR = {
  bg:     '#060D18',
  card:   '#0B1628',
  card2:  'rgba(255,255,255,0.025)',
  border: 'rgba(255,255,255,0.07)',
  text:   '#E8EDF8',
  sub:    'rgba(232,237,248,0.55)',
  muted:  'rgba(232,237,248,0.28)',
  green:  '#22C55E',
  blue:   '#3B82F6',
  amber:  '#F59E0B',
  red:    '#EF4444',
};

const PROFILE_KEY = 'atlas.profile.v1';

function prReadProfile() {
  try { return JSON.parse(localStorage.getItem(PROFILE_KEY) || 'null'); } catch { return null; }
}

function prFmt(n, unit) {
  return `${typeof n === 'number' ? n.toLocaleString('es-ES') : n}${unit ? ' ' + unit : ''}`;
}

function prTrend(trend) {
  if (trend === 'progressing') return { icon: '↑', color: PR.green };
  if (trend === 'declining')   return { icon: '↓', color: PR.red   };
  if (trend === 'stagnant')    return { icon: '→', color: PR.amber  };
  return { icon: '–', color: PR.muted };
}

// ── Mini percentage bar ────────────────────────────────────────────────────────
function PrBar({ pct, color, height }) {
  return (
    <div style={{ height: height || 4, borderRadius: 2, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
      <div style={{ height: '100%', width: `${Math.min(100, pct || 0)}%`, background: color || PR.blue, borderRadius: 2, transition: 'width .5s ease' }} />
    </div>
  );
}

// ── Section card ──────────────────────────────────────────────────────────────
function PrCard({ title, children, action }) {
  return (
    <div style={{ borderRadius: 16, border: `1px solid ${PR.border}`, background: PR.card, marginBottom: 16, overflow: 'hidden' }}>
      <div style={{ padding: '14px 20px', borderBottom: `1px solid ${PR.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontFamily: 'Inter,system-ui', fontSize: 11, fontWeight: 800, color: PR.muted, letterSpacing: 1.2 }}>{title}</span>
        {action}
      </div>
      <div style={{ padding: '16px 20px' }}>{children}</div>
    </div>
  );
}

// ── Stat pill ─────────────────────────────────────────────────────────────────
function PrStat({ label, value, color, sub }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontFamily: 'Inter,system-ui', fontSize: 28, fontWeight: 900, color: color || PR.text, letterSpacing: -1.5, lineHeight: 1 }}>{value}</div>
      {sub && <div style={{ fontFamily: 'ui-monospace,Menlo,monospace', fontSize: 9, fontWeight: 700, color: PR.muted, letterSpacing: 0.5, marginTop: 2 }}>{sub}</div>}
      <div style={{ fontFamily: 'Inter,system-ui', fontSize: 11, color: PR.sub, marginTop: 4 }}>{label}</div>
    </div>
  );
}

// ── Atlas Progress Score ───────────────────────────────────────────────────────
function PrAtlasScore({ score }) {
  const color = score.total >= 80 ? PR.green : score.total >= 60 ? PR.blue : score.total >= 40 ? PR.amber : PR.muted;
  return (
    <PrCard title="ATLAS PROGRESS SCORE">
      <div style={{ display: 'flex', alignItems: 'center', gap: 24, marginBottom: 20 }}>
        <div style={{ position: 'relative', width: 80, height: 80, flexShrink: 0 }}>
          <svg width="80" height="80" style={{ transform: 'rotate(-90deg)' }}>
            <circle cx="40" cy="40" r="34" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="7" />
            <circle cx="40" cy="40" r="34" fill="none" stroke={color} strokeWidth="7"
              strokeDasharray={`${2 * Math.PI * 34}`}
              strokeDashoffset={`${2 * Math.PI * 34 * (1 - score.total / 100)}`}
              strokeLinecap="round" style={{ transition: 'stroke-dashoffset .6s ease' }}
            />
          </svg>
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontFamily: 'Inter,system-ui', fontSize: 22, fontWeight: 900, color, letterSpacing: -1, lineHeight: 1 }}>{score.total}</span>
          </div>
        </div>
        <div>
          <div style={{ fontFamily: 'Inter,system-ui', fontSize: 20, fontWeight: 800, color: PR.text, letterSpacing: -0.5 }}>{score.label}</div>
          <div style={{ fontFamily: 'Inter,system-ui', fontSize: 12, color: PR.sub, marginTop: 4 }}>Basado en adherencia, consistencia, progresión y volumen</div>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        {(score.pillars || []).map(p => {
          const pColor = p.pts / p.max >= 0.8 ? PR.green : p.pts / p.max >= 0.55 ? PR.blue : PR.amber;
          return (
            <div key={p.key} style={{ padding: '10px 12px', borderRadius: 10, background: PR.card2, border: `1px solid ${PR.border}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <span style={{ fontFamily: 'Inter,system-ui', fontSize: 11, fontWeight: 600, color: PR.sub }}>{p.label}</span>
                <span style={{ fontFamily: 'ui-monospace,Menlo,monospace', fontSize: 10, fontWeight: 700, color: pColor }}>{p.pts}/{p.max}</span>
              </div>
              <PrBar pct={(p.pts / p.max) * 100} color={pColor} />
              <div style={{ fontFamily: 'ui-monospace,Menlo,monospace', fontSize: 9, color: PR.muted, marginTop: 5, letterSpacing: 0.3 }}>{p.value}</div>
            </div>
          );
        })}
      </div>
    </PrCard>
  );
}

// ── Adherence ─────────────────────────────────────────────────────────────────
function PrAdherence({ adh }) {
  const color = adh.pct >= 80 ? PR.green : adh.pct >= 60 ? PR.amber : PR.red;
  return (
    <PrCard title="ADHERENCIA">
      <div style={{ display: 'flex', gap: 24, alignItems: 'center', marginBottom: 16 }}>
        <PrStat label="Completado" value={`${adh.pct}%`} color={color} sub={adh.label.toUpperCase()} />
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: 'Inter,system-ui', fontSize: 12, color: PR.sub, marginBottom: 8 }}>
            {adh.completed} de {adh.planned} sesiones planificadas (últimas 4 semanas)
          </div>
          <PrBar pct={adh.pct} color={color} height={6} />
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
        {(adh.weeks || []).map((w, i) => {
          const wPct = Math.min(100, w.planned > 0 ? Math.round((w.days / w.planned) * 100) : 0);
          const wColor = wPct >= 80 ? PR.green : wPct >= 50 ? PR.amber : PR.muted;
          return (
            <div key={i} style={{ textAlign: 'center', padding: '8px 4px', borderRadius: 8, background: PR.card2 }}>
              <div style={{ fontFamily: 'Inter,system-ui', fontSize: 13, fontWeight: 800, color: wColor }}>{w.days}<span style={{ fontSize: 9, color: PR.muted }}>/{w.planned}</span></div>
              <div style={{ fontFamily: 'Inter,system-ui', fontSize: 9, color: PR.muted, marginTop: 3 }}>Sem {i + 1}</div>
            </div>
          );
        })}
      </div>
    </PrCard>
  );
}

// ── Consistency ───────────────────────────────────────────────────────────────
function PrConsistency({ con }) {
  return (
    <PrCard title="CONSISTENCIA">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 16 }}>
        <PrStat label="Racha actual" value={con.streak} sub="DÍAS" color={con.streak >= 3 ? PR.green : PR.text} />
        <PrStat label="Semanas activas" value={`${con.activeWeeks}/8`} color={con.activeWeeks >= 6 ? PR.green : con.activeWeeks >= 4 ? PR.amber : PR.text} />
        <PrStat label="Este mes" value={con.sessionsPerMonth} sub="SESIONES" color={PR.text} />
      </div>
      <div style={{ display: 'flex', gap: 4 }}>
        {Array.from({ length: 8 }, (_, i) => {
          const active = i < con.activeWeeks;
          return (
            <div key={i} style={{ flex: 1, height: 6, borderRadius: 3, background: active ? PR.green : 'rgba(255,255,255,0.06)', transition: 'background .3s' }} />
          );
        })}
      </div>
      <div style={{ fontFamily: 'Inter,system-ui', fontSize: 10, color: PR.muted, marginTop: 6 }}>Semanas activas en los últimos 2 meses</div>
    </PrCard>
  );
}

// ── Strength ──────────────────────────────────────────────────────────────────
function PrStrength({ strength }) {
  const allEx = strength.exercises || [];
  if (!allEx.length) {
    return (
      <PrCard title="FUERZA">
        <div style={{ fontFamily: 'Inter,system-ui', fontSize: 13, color: PR.sub, textAlign: 'center', padding: '20px 0' }}>
          Registra pesos y repeticiones en cada ejercicio para ver la evolución de tu fuerza.
        </div>
      </PrCard>
    );
  }
  const [showAll, setShowAll] = React.useState(false);
  const displayed = showAll ? allEx : allEx.slice(0, 5);
  return (
    <PrCard
      title="FUERZA · 1RM ESTIMADO"
      action={allEx.length > 5 ? (
        <button onClick={() => setShowAll(s => !s)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Inter,system-ui', fontSize: 11, color: PR.blue, fontWeight: 600, padding: 0 }}>
          {showAll ? 'Ver menos' : `+${allEx.length - 5} más`}
        </button>
      ) : null}
    >
      {displayed.map((r, i) => {
        const { icon, color } = prTrend(r.trend);
        const best1RM = r.estimated1RM?.value || 0;
        return (
          <div key={r.exerciseName} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '9px 0', borderTop: i > 0 ? `1px solid ${PR.border}` : 'none' }}>
            <div style={{ width: 24, height: 24, borderRadius: 6, background: 'rgba(59,130,246,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span style={{ fontFamily: 'ui-monospace,Menlo,monospace', fontSize: 9, fontWeight: 800, color: PR.muted }}>{i + 1}</span>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: 'Inter,system-ui', fontSize: 12, fontWeight: 700, color: PR.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.exerciseName}</div>
              <div style={{ fontFamily: 'ui-monospace,Menlo,monospace', fontSize: 9, color: PR.muted, marginTop: 2 }}>{r.sessions} registros{r.bestSet ? ` · Mejor: ${r.bestSet.kg}kg × ${r.bestSet.reps}` : ''}</div>
            </div>
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              {best1RM > 0 && <div style={{ fontFamily: 'ui-monospace,Menlo,monospace', fontSize: 15, fontWeight: 800, color: PR.text }}>{best1RM}<span style={{ fontSize: 9, color: PR.muted }}> kg</span></div>}
              <div style={{ fontFamily: 'ui-monospace,Menlo,monospace', fontSize: 11, fontWeight: 800, color }}>{icon}{r.pct ? ` ${Math.abs(r.pct)}%` : ''}</div>
            </div>
          </div>
        );
      })}
    </PrCard>
  );
}

// ── Volume ────────────────────────────────────────────────────────────────────
function PrVolume({ volume }) {
  const weeks = volume.weeklyVolume || [];
  const maxVol = Math.max(...weeks.map(w => w.totalVolume), 1);

  // Top muscles by sets
  const muscleEntries = Object.entries(volume.setsByMuscle || {})
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);
  const maxSets = muscleEntries.length > 0 ? muscleEntries[0][1] : 1;

  if (!weeks.some(w => w.totalVolume > 0) && !muscleEntries.length) {
    return (
      <PrCard title="VOLUMEN">
        <div style={{ fontFamily: 'Inter,system-ui', fontSize: 13, color: PR.sub, textAlign: 'center', padding: '20px 0' }}>
          Completa sesiones para ver el análisis de volumen semanal.
        </div>
      </PrCard>
    );
  }

  return (
    <PrCard title="VOLUMEN SEMANAL">
      {weeks.some(w => w.totalVolume > 0) && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', gap: 4, alignItems: 'flex-end', height: 56 }}>
            {weeks.map((w, i) => (
              <div key={i} title={`${w.label}: ${w.totalVolume.toLocaleString('es-ES')} kg`} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
                <div style={{ width: '100%', borderRadius: '3px 3px 0 0', background: i === weeks.length - 1 ? PR.blue : 'rgba(59,130,246,0.30)', height: `${Math.round((w.totalVolume / maxVol) * 44) || 3}px`, minHeight: w.totalVolume > 0 ? 4 : 0, transition: 'height .4s ease' }} />
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 4 }}>
            {weeks.map((w, i) => (
              <div key={i} style={{ flex: 1, textAlign: 'center', fontFamily: 'ui-monospace,Menlo,monospace', fontSize: 7, color: PR.muted, marginTop: 4 }}>{w.label}</div>
            ))}
          </div>
        </div>
      )}
      {muscleEntries.length > 0 && (
        <>
          <div style={{ fontFamily: 'ui-monospace,Menlo,monospace', fontSize: 8, fontWeight: 700, color: PR.muted, letterSpacing: 1, marginBottom: 10 }}>SERIES POR MÚSCULO (4 SEMANAS)</div>
          {muscleEntries.map(([muscle, sets]) => (
            <div key={muscle} style={{ marginBottom: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontFamily: 'Inter,system-ui', fontSize: 11, color: PR.sub }}>{muscle}</span>
                <span style={{ fontFamily: 'ui-monospace,Menlo,monospace', fontSize: 11, fontWeight: 700, color: PR.text }}>{sets}</span>
              </div>
              <PrBar pct={(sets / maxSets) * 100} color={PR.blue} height={3} />
            </div>
          ))}
        </>
      )}
    </PrCard>
  );
}

// ── Alerts ────────────────────────────────────────────────────────────────────
function PrAlerts({ alerts, navigate }) {
  if (!alerts || !alerts.length) return null;
  const SEV = {
    success: { bg: 'rgba(34,197,94,0.08)',  border: 'rgba(34,197,94,0.18)',  color: PR.green, icon: '✓' },
    info:    { bg: 'rgba(59,130,246,0.06)', border: 'rgba(59,130,246,0.16)', color: PR.blue,  icon: 'ℹ' },
    warning: { bg: 'rgba(245,158,11,0.07)', border: 'rgba(245,158,11,0.18)', color: PR.amber, icon: '⚠' },
  };
  return (
    <PrCard title="ALERTAS AUTOMÁTICAS">
      {alerts.map((a, i) => {
        const sev = SEV[a.severity] || SEV.info;
        return (
          <div key={i} style={{ display: 'flex', gap: 10, padding: '10px 12px', borderRadius: 10, background: sev.bg, border: `1px solid ${sev.border}`, marginBottom: i < alerts.length - 1 ? 8 : 0 }}>
            <span style={{ fontSize: 13, color: sev.color, flexShrink: 0, fontWeight: 700 }}>{sev.icon}</span>
            <span style={{ fontFamily: 'Inter,system-ui', fontSize: 12, color: PR.text, lineHeight: 1.5 }}>{a.message}</span>
          </div>
        );
      })}
      <button onClick={() => navigate('/coach')} style={{ marginTop: 12, width: '100%', padding: '9px', borderRadius: 10, border: `1px solid ${PR.border}`, background: 'transparent', color: PR.blue, fontFamily: 'Inter,system-ui', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
        Consultar Atlas Coach →
      </button>
    </PrCard>
  );
}

// ── Strength breakdown — progressing vs stagnant ───────────────────────────────
function PrProgressBreakdown({ strength }) {
  const tp = strength.topProgressing || [];
  const st = strength.stagnant || [];
  if (!tp.length && !st.length) return null;
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
      {tp.length > 0 && (
        <div style={{ borderRadius: 14, border: `1px solid rgba(34,197,94,0.18)`, background: 'rgba(34,197,94,0.04)', padding: '14px 16px' }}>
          <div style={{ fontFamily: 'ui-monospace,Menlo,monospace', fontSize: 8, fontWeight: 800, color: PR.green, letterSpacing: 1, marginBottom: 10 }}>PROGRESANDO</div>
          {tp.slice(0, 4).map(r => (
            <div key={r.exerciseName} style={{ fontFamily: 'Inter,system-ui', fontSize: 11, color: PR.text, marginBottom: 5, display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1, marginRight: 6 }}>{r.exerciseName}</span>
              <span style={{ color: PR.green, fontWeight: 700, flexShrink: 0 }}>+{r.pct}%</span>
            </div>
          ))}
        </div>
      )}
      {st.length > 0 && (
        <div style={{ borderRadius: 14, border: `1px solid rgba(245,158,11,0.18)`, background: 'rgba(245,158,11,0.04)', padding: '14px 16px' }}>
          <div style={{ fontFamily: 'ui-monospace,Menlo,monospace', fontSize: 8, fontWeight: 800, color: PR.amber, letterSpacing: 1, marginBottom: 10 }}>ESTANCADOS</div>
          {st.slice(0, 4).map(r => (
            <div key={r.exerciseName} style={{ fontFamily: 'Inter,system-ui', fontSize: 11, color: PR.text, marginBottom: 5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {r.exerciseName}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Empty state ───────────────────────────────────────────────────────────────
function PrEmptyState({ navigate }) {
  return (
    <div style={{ textAlign: 'center', padding: '60px 20px' }}>
      <div style={{ fontFamily: 'Inter,system-ui', fontSize: 48, marginBottom: 16, opacity: 0.4 }}>📊</div>
      <div style={{ fontFamily: 'Inter,system-ui', fontSize: 18, fontWeight: 800, color: PR.text, marginBottom: 8, letterSpacing: -0.5 }}>Sin datos de progreso</div>
      <div style={{ fontFamily: 'Inter,system-ui', fontSize: 14, color: PR.sub, lineHeight: 1.6, maxWidth: 320, margin: '0 auto 24px' }}>
        Completa entrenamientos desde el Workout Player para ver tu evolución de fuerza, volumen y consistencia.
      </div>
      <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
        <button onClick={() => navigate('/coach')} style={{ padding: '10px 20px', borderRadius: 10, border: 'none', cursor: 'pointer', background: PR.blue, color: '#fff', fontFamily: 'Inter,system-ui', fontSize: 13, fontWeight: 700 }}>
          Ir al Coach →
        </button>
        <button onClick={() => navigate('/player')} style={{ padding: '10px 20px', borderRadius: 10, border: `1px solid ${PR.border}`, cursor: 'pointer', background: 'transparent', color: PR.sub, fontFamily: 'Inter,system-ui', fontSize: 13, fontWeight: 600 }}>
          Workout Player
        </button>
      </div>
    </div>
  );
}

// ── Main section ──────────────────────────────────────────────────────────────
function ProgresoSection() {
  const { state }   = useStore();
  const { navigate } = useRoute();
  const mobile      = window.innerWidth < 680;

  const profile = React.useMemo(() => prReadProfile(), []);
  const log     = state.log || [];

  const panel = React.useMemo(() => {
    if (typeof AtlasProgressionEngine === 'undefined' || log.length === 0) return null;
    return AtlasProgressionEngine.getFullPanel(log, profile);
  }, [log, profile]);

  const hasData = log.length >= 1;

  return (
    <section style={{ minHeight: '100vh', background: PR.bg, color: PR.text, fontFamily: 'Inter,system-ui,sans-serif' }}>
      <div style={{ maxWidth: 720, margin: '0 auto', padding: mobile ? '32px 16px 80px' : '48px 32px 80px' }}>

        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontFamily: 'ui-monospace,Menlo,monospace', fontSize: 9, fontWeight: 800, color: PR.blue, letterSpacing: 2, marginBottom: 6 }}>ATLAS METHOD</div>
          <h1 style={{ fontFamily: 'Inter,system-ui', fontWeight: 900, fontSize: mobile ? 28 : 36, color: PR.text, letterSpacing: -1.5, lineHeight: 1, margin: 0 }}>
            Tu Progreso
          </h1>
          {hasData && (
            <div style={{ fontFamily: 'Inter,system-ui', fontSize: 13, color: PR.sub, marginTop: 8 }}>
              {log.length} sesión{log.length !== 1 ? 'es' : ''} registrada{log.length !== 1 ? 's' : ''}
              {panel?.consistency?.streak > 0 ? ` · ${panel.consistency.streak} días de racha` : ''}
            </div>
          )}
        </div>

        {!hasData || !panel ? (
          <PrEmptyState navigate={navigate} />
        ) : (
          <>
            {/* Atlas Score */}
            <PrAtlasScore score={panel.score} />

            {/* Alerts */}
            <PrAlerts alerts={panel.alerts} navigate={navigate} />

            {/* Adherence + Consistency */}
            <div style={{ display: mobile ? 'block' : 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
              <div style={{ marginBottom: mobile ? 12 : 0 }}>
                <PrAdherence adh={panel.adherence} />
              </div>
              <div>
                <PrConsistency con={panel.consistency} />
              </div>
            </div>

            {/* Strength */}
            <PrStrength strength={panel.strength} />

            {/* Progressing vs Stagnant */}
            <PrProgressBreakdown strength={panel.strength} />

            {/* Volume */}
            <PrVolume volume={panel.volume} />

            {/* CTA */}
            <div style={{ display: 'flex', gap: 10, marginTop: 24, flexWrap: 'wrap' }}>
              <button onClick={() => navigate('/coach')} style={{ flex: 1, minWidth: 140, padding: '12px 16px', borderRadius: 12, border: 'none', cursor: 'pointer', background: PR.blue, color: '#fff', fontFamily: 'Inter,system-ui', fontSize: 13, fontWeight: 700, boxShadow: '0 4px 16px rgba(59,130,246,0.25)' }}>
                Consultar Coach →
              </button>
              <button onClick={() => navigate('/player')} style={{ flex: 1, minWidth: 140, padding: '12px 16px', borderRadius: 12, border: `1px solid ${PR.border}`, cursor: 'pointer', background: 'transparent', color: PR.sub, fontFamily: 'Inter,system-ui', fontSize: 13, fontWeight: 600 }}>
                Workout Player
              </button>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
