// Workout Player — Phase 7
// Full-screen exercise-by-exercise workout execution player

const WP = {
  page:   '#060D18',
  card:   '#0B1628',
  border: 'rgba(255,255,255,0.07)',
  text:   '#E8EDF8',
  sub:    'rgba(232,237,248,0.55)',
  muted:  'rgba(232,237,248,0.28)',
  green:  '#22C55E',
  blue:   '#3B82F6',
  red:    '#EF4444',
  input:  '#0A1422',
};

// ── Helpers ────────────────────────────────────────────────────────────────────

function wpFmtTime(sec) {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  const pad = n => String(n).padStart(2, '0');
  if (h > 0) return `${pad(h)}:${pad(m)}:${pad(s)}`;
  return `${pad(m)}:${pad(s)}`;
}

function wpMuscleColor(name) {
  const n = (name || '').toLowerCase();
  if (n.includes('pectoral') || n.includes('pecho')) return '#F97316';
  if (n.includes('dorsal') || n.includes('espalda')) return '#8B5CF6';
  if (n.includes('deltoid') || n.includes('hombro')) return '#3B82F6';
  if (n.includes('bíceps') || n.includes('biceps')) return '#EC4899';
  if (n.includes('tríceps') || n.includes('triceps')) return '#F59E0B';
  if (n.includes('cuádric') || n.includes('cuadric') || n.includes('pierna')) return '#22C55E';
  if (n.includes('glút') || n.includes('glut')) return '#10B981';
  if (n.includes('core') || n.includes('abdom')) return '#06B6D4';
  return '#6B7280';
}

// ── Loading spinner ────────────────────────────────────────────────────────────

function WpSpinner() {
  return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh', background:WP.page }}>
      <div style={{ width:36, height:36, border:`3px solid ${WP.border}`, borderTop:`3px solid ${WP.green}`, borderRadius:'50%', animation:'spin 0.8s linear infinite' }} />
    </div>
  );
}

// ── Rest Timer Banner ─────────────────────────────────────────────────────────

function WpRestTimer({ restTimer, onSkip, onAdjust, isMobile }) {
  if (!restTimer) return null;
  const { rem, total } = restTimer;
  const pct = total > 0 ? Math.max(0, rem / total) : 0;

  // Conic-gradient circle
  const deg = Math.round(pct * 360);
  const circleStyle = {
    width: 72,
    height: 72,
    borderRadius: '50%',
    background: `conic-gradient(${WP.green} ${deg}deg, rgba(34,197,94,0.15) ${deg}deg)`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  };

  return (
    <div style={{
      background: 'rgba(11,22,40,0.97)',
      borderBottom: `1px solid rgba(34,197,94,0.20)`,
      padding: '12px 20px',
      display: 'flex',
      alignItems: 'center',
      gap: 16,
      flexShrink: 0,
    }}>
      <div style={circleStyle}>
        <div style={{ width:58, height:58, borderRadius:'50%', background:WP.card, display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column' }}>
          <span style={{ fontFamily:'ui-monospace,Menlo,monospace', fontSize:17, fontWeight:800, color:WP.green, lineHeight:1 }}>{wpFmtTime(rem)}</span>
        </div>
      </div>
      <div style={{ flex:1 }}>
        <div style={{ fontFamily:'ui-monospace,Menlo,monospace', fontSize:9, fontWeight:700, color:'rgba(34,197,94,0.70)', letterSpacing:1.6, marginBottom:6 }}>DESCANSO</div>
        <div style={{ display:'flex', gap:6 }}>
          <button onClick={() => onAdjust(-15)} style={{ minWidth: isMobile ? 52 : undefined, minHeight: isMobile ? 44 : undefined, padding: isMobile ? '0 12px' : '5px 10px', borderRadius:8, border:`1px solid ${WP.border}`, background:'rgba(255,255,255,0.06)', color:WP.sub, fontFamily:'Inter,system-ui', fontSize: isMobile ? 13 : 11, fontWeight:700, cursor:'pointer' }}>−15s</button>
          <button onClick={onSkip} style={{ minHeight: isMobile ? 44 : undefined, padding: isMobile ? '0 18px' : '5px 14px', borderRadius:8, border:'none', background:WP.green, color:'#fff', fontFamily:'Inter,system-ui', fontSize: isMobile ? 13 : 11, fontWeight:700, cursor:'pointer' }}>Skip →</button>
          <button onClick={() => onAdjust(15)} style={{ minWidth: isMobile ? 52 : undefined, minHeight: isMobile ? 44 : undefined, padding: isMobile ? '0 12px' : '5px 10px', borderRadius:8, border:`1px solid ${WP.border}`, background:'rgba(255,255,255,0.06)', color:WP.sub, fontFamily:'Inter,system-ui', fontSize: isMobile ? 13 : 11, fontWeight:700, cursor:'pointer' }}>+15s</button>
        </div>
      </div>
    </div>
  );
}

// ── Set Status Mini-grid ───────────────────────────────────────────────────────

function WpSetGrid({ sets, currentSetIdx, onSelectSet }) {
  return (
    <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
      {sets.map((s, i) => {
        const isCurrent = i === currentSetIdx;
        const isDone    = s.done;
        return (
          <button
            key={i}
            onClick={() => onSelectSet(i)}
            style={{
              width: 28, height: 28, borderRadius: '50%', border: 'none',
              cursor: 'pointer', fontFamily:'ui-monospace,Menlo,monospace', fontSize:11, fontWeight:700,
              background: isDone ? WP.green : isCurrent ? 'rgba(59,130,246,0.22)' : 'rgba(255,255,255,0.07)',
              color: isDone ? '#fff' : isCurrent ? WP.blue : WP.muted,
              outline: isCurrent ? `2px solid ${WP.blue}` : 'none',
              outlineOffset: 2,
            }}
          >
            {isDone ? '✓' : i + 1}
          </button>
        );
      })}
    </div>
  );
}

// ── RPE Selector ──────────────────────────────────────────────────────────────

function WpRpeSelector({ value, onChange }) {
  return (
    <div>
      <div style={{ fontFamily:'ui-monospace,Menlo,monospace', fontSize:8, fontWeight:700, color:WP.muted, letterSpacing:1.2, marginBottom:6 }}>RPE (OPCIONAL)</div>
      <div style={{ display:'flex', gap:4, flexWrap:'wrap' }}>
        {[6,7,8,9,10].map(r => (
          <button
            key={r}
            onClick={() => onChange(value === r ? null : r)}
            style={{
              width:34, height:28, borderRadius:7, border: value === r ? 'none' : `1px solid ${WP.border}`,
              cursor:'pointer', fontFamily:'ui-monospace,Menlo,monospace', fontSize:11, fontWeight:700,
              background: value === r ? WP.blue : 'rgba(255,255,255,0.05)',
              color: value === r ? '#fff' : WP.muted,
              transition:'all .12s',
            }}
          >
            {r}
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Finish Screen ─────────────────────────────────────────────────────────────

// Returns per-exercise comparison rows against the most recent matching session
function wpBuildComparison(finished) {
  const history = WorkoutSessionStore.getHistory(20);
  // Skip the just-completed session itself: anything logged at/after this
  // workout started is the current session (it may or may not have been
  // persisted to the store yet when this renders).
  const startTs = finished?.startTime || finished?.dateTs || 0;
  const currNames = new Set((finished?.exercises || []).map(e => e.name));
  let prev = null;
  for (let i = 0; i < history.length; i++) {
    const h = history[i];
    if ((h.dateTs || 0) >= startTs) continue;
    const overlap = (h.exercises || []).filter(e => currNames.has(e.name)).length;
    if (overlap >= Math.min(2, Math.floor(currNames.size * 0.4))) { prev = h; break; }
  }
  if (!prev) return null;

  // Build previous-session max-kg map
  const prevMap = {};
  (prev.exercises || []).forEach(ex => {
    const doneSets = (ex.sets || []).filter(s => s.done && Number(s.kg) > 0);
    if (!doneSets.length) return;
    prevMap[ex.name] = {
      kg:   Math.max(...doneSets.map(s => Number(s.kg))),
      reps: Math.round(doneSets.reduce((a, s) => a + Number(s.reps || 0), 0) / doneSets.length),
      sets: doneSets.length,
    };
  });

  const rows = (finished?.exercises || []).map(ex => {
    const doneSets = (ex.sets || []).filter(s => s.done && Number(s.kg) > 0);
    if (!doneSets.length) return null;
    const currKg   = Math.max(...doneSets.map(s => Number(s.kg)));
    const currReps = Math.round(doneSets.reduce((a, s) => a + Number(s.reps || 0), 0) / doneSets.length);
    const p        = prevMap[ex.name];
    const delta    = p ? +(currKg - p.kg).toFixed(1) : null;
    return { name: ex.name, currKg, currReps, currSets: doneSets.length, prevKg: p?.kg, prevReps: p?.reps, delta };
  }).filter(Boolean);

  return rows.length ? { rows, prevDate: prev.date } : null;
}

function WpFinishScreen({ finished, onHome, onCoach }) {
  const dur = finished?.duration || 0;
  const muscles = [...new Set(
    (finished?.exercises || []).flatMap(ex => ex.muscles?.primary || [])
  )].slice(0, 6);

  const comparison = React.useMemo(() => wpBuildComparison(finished), [finished]);

  return (
    <div style={{ minHeight:'100vh', background:WP.page, display:'flex', alignItems:'center', justifyContent:'center', padding:'24px 20px' }}>
      <div style={{ maxWidth:480, width:'100%', textAlign:'center' }}>
        {/* Checkmark */}
        <div style={{ width:80, height:80, borderRadius:'50%', background:'rgba(34,197,94,0.15)', border:`2px solid ${WP.green}`, display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 24px', fontSize:36 }}>
          ✓
        </div>

        <div style={{ fontFamily:'Inter,system-ui', fontSize:24, fontWeight:800, color:WP.text, letterSpacing:-0.5, marginBottom:6 }}>
          Entrenamiento completado
        </div>
        <div style={{ fontFamily:'ui-monospace,Menlo,monospace', fontSize:28, fontWeight:800, color:WP.green, marginBottom:20 }}>
          {wpFmtTime(dur)}
        </div>

        {/* Stats row */}
        <div style={{ display:'flex', justifyContent:'center', gap:24, marginBottom:24, flexWrap:'wrap' }}>
          <div style={{ textAlign:'center' }}>
            <div style={{ fontFamily:'ui-monospace,Menlo,monospace', fontSize:20, fontWeight:800, color:WP.text }}>{finished?.completedSets || 0}/{finished?.totalSets || 0}</div>
            <div style={{ fontFamily:'Inter,system-ui', fontSize:11, color:WP.muted }}>series</div>
          </div>
          <div style={{ textAlign:'center' }}>
            <div style={{ fontFamily:'ui-monospace,Menlo,monospace', fontSize:20, fontWeight:800, color:WP.text }}>{(finished?.totalVolume || 0).toLocaleString('es-ES')}</div>
            <div style={{ fontFamily:'Inter,system-ui', fontSize:11, color:WP.muted }}>kg vol</div>
          </div>
        </div>

        {/* Muscles */}
        {muscles.length > 0 && (
          <div style={{ marginBottom:28 }}>
            <div style={{ fontFamily:'ui-monospace,Menlo,monospace', fontSize:8, fontWeight:700, color:WP.muted, letterSpacing:1.2, marginBottom:10 }}>MÚSCULOS TRABAJADOS</div>
            <div style={{ display:'flex', flexWrap:'wrap', gap:6, justifyContent:'center' }}>
              {muscles.map(m => (
                <span key={m} style={{ padding:'3px 10px', borderRadius:999, fontFamily:'Inter,system-ui', fontSize:11, fontWeight:600, background:`${wpMuscleColor(m)}22`, border:`1px solid ${wpMuscleColor(m)}44`, color:wpMuscleColor(m) }}>{m}</span>
              ))}
            </div>
          </div>
        )}

        {/* Per-exercise comparison */}
        {comparison && (
          <div style={{ marginBottom:24, textAlign:'left' }}>
            <div style={{ fontFamily:'ui-monospace,Menlo,monospace', fontSize:8, fontWeight:700, color:WP.muted, letterSpacing:1.2, marginBottom:10, textAlign:'center' }}>
              VS SESIÓN ANTERIOR · {comparison.prevDate}
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:1, borderRadius:12, overflow:'hidden', border:`1px solid ${WP.border}` }}>
              {comparison.rows.map((row, i) => {
                const hasPrev    = row.prevKg != null;
                const improved   = hasPrev && row.delta > 0;
                const regressed  = hasPrev && row.delta < 0;
                const indicator  = improved ? '↑' : regressed ? '↓' : hasPrev ? '=' : null;
                const indColor   = improved ? WP.green : regressed ? WP.red : WP.muted;
                const fmtKg      = v => (v % 1 === 0 ? String(v) : v.toFixed(1));
                return (
                  <div key={i} style={{ display:'flex', alignItems:'center', padding:'9px 14px', background: i % 2 === 0 ? 'rgba(255,255,255,0.03)' : 'transparent', gap:8 }}>
                    <div style={{ flex:1, fontFamily:'Inter,system-ui', fontSize:11, fontWeight:600, color:WP.text, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                      {row.name}
                    </div>
                    <div style={{ fontFamily:'ui-monospace,Menlo,monospace', fontSize:11, color:WP.sub, flexShrink:0 }}>
                      {row.currSets}×{row.currReps} · {fmtKg(row.currKg)} kg
                    </div>
                    {indicator && (
                      <div style={{ fontFamily:'ui-monospace,Menlo,monospace', fontSize:11, fontWeight:800, color:indColor, flexShrink:0, minWidth:36, textAlign:'right' }}>
                        {indicator}{row.delta !== 0 ? ` ${Math.abs(row.delta)}` : ''}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* CTAs */}
        <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
          <button onClick={onHome} style={{ padding:'13px 20px', borderRadius:12, border:'none', cursor:'pointer', background:WP.green, color:'#fff', fontFamily:'Inter,system-ui', fontSize:14, fontWeight:700, boxShadow:'0 4px 18px -4px rgba(34,197,94,0.45)' }}>
            Guardar y volver al inicio
          </button>
          <button onClick={onCoach} style={{ padding:'12px 20px', borderRadius:12, border:`1px solid rgba(59,130,246,0.30)`, cursor:'pointer', background:'transparent', color:'#93C5FD', fontFamily:'Inter,system-ui', fontSize:14, fontWeight:700 }}>
            Volver al Coach →
          </button>
        </div>
      </div>
    </div>
  );
}

// ── History Screen ────────────────────────────────────────────────────────────

function WpHistoryScreen({ onNewWorkout }) {
  const history = React.useMemo(() => WorkoutSessionStore.getHistory(20), []);

  return (
    <div style={{ minHeight:'100vh', background:WP.page, padding:'24px 20px 80px' }}>
      <div style={{ maxWidth:600, margin:'0 auto' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:24 }}>
          <div>
            <div style={{ fontFamily:'Inter,system-ui', fontSize:20, fontWeight:800, color:WP.text, letterSpacing:-0.5 }}>Historial</div>
            <div style={{ fontFamily:'Inter,system-ui', fontSize:12, color:WP.muted, marginTop:2 }}>Entrenamientos completados</div>
          </div>
          <button onClick={onNewWorkout} style={{ padding:'9px 16px', borderRadius:10, border:`1px solid rgba(34,197,94,0.30)`, background:'rgba(34,197,94,0.08)', color:WP.green, fontFamily:'Inter,system-ui', fontSize:12, fontWeight:700, cursor:'pointer' }}>
            Ir al Coach
          </button>
        </div>

        {history.length === 0 ? (
          <div style={{ textAlign:'center', padding:'60px 20px' }}>
            <div style={{ fontSize:40, marginBottom:16 }}>🏋️</div>
            <div style={{ fontFamily:'Inter,system-ui', fontSize:16, fontWeight:700, color:WP.text, marginBottom:8 }}>
              No hay entrenamientos completados todavía
            </div>
            <div style={{ fontFamily:'Inter,system-ui', fontSize:13, color:WP.muted, marginBottom:24 }}>
              Genera una rutina en el Coach y empieza a entrenar
            </div>
            <button onClick={onNewWorkout} style={{ padding:'11px 24px', borderRadius:10, border:'none', background:WP.green, color:'#fff', fontFamily:'Inter,system-ui', fontSize:13, fontWeight:700, cursor:'pointer' }}>
              Ir al Coach
            </button>
          </div>
        ) : (
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {history.map((entry, i) => (
              <div key={entry.id || i} style={{ borderRadius:14, border:`1px solid ${WP.border}`, background:WP.card, padding:'14px 18px' }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:8 }}>
                  <div>
                    <div style={{ fontFamily:'Inter,system-ui', fontSize:13, fontWeight:700, color:WP.text }}>{entry.routineName || 'Entrenamiento'}</div>
                    <div style={{ fontFamily:'Inter,system-ui', fontSize:11, color:WP.muted, marginTop:2 }}>{entry.sessionName || ''}</div>
                  </div>
                  <div style={{ fontFamily:'ui-monospace,Menlo,monospace', fontSize:10, color:WP.muted, textAlign:'right' }}>
                    {entry.date || ''}
                  </div>
                </div>
                <div style={{ display:'flex', gap:16, flexWrap:'wrap' }}>
                  {[
                    entry.duration ? wpFmtTime(entry.duration) : null,
                    (entry.completedSets != null && entry.totalSets != null) ? `${entry.completedSets}/${entry.totalSets} series` : null,
                    entry.totalVolume ? `${entry.totalVolume.toLocaleString('es-ES')} kg` : null,
                  ].filter(Boolean).map(v => (
                    <span key={v} style={{ fontFamily:'ui-monospace,Menlo,monospace', fontSize:10, fontWeight:700, color:WP.muted }}>{v}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Active View ───────────────────────────────────────────────────────────────

// Exercise demonstration image for the active workout — lazy, self-hiding on miss
function WpExerciseImage({ id, name }) {
  const [ok, setOk] = React.useState(true);
  const url = (typeof ExerciseImages !== 'undefined') ? ExerciseImages.urlFor(id) : null;
  if (!url || !ok) return null;
  return (
    <div style={{ borderRadius:12, overflow:'hidden', marginBottom:14, background:'#EDEEF0', height:180 }}>
      <img
        src={url}
        alt={name}
        loading="lazy"
        onError={() => setOk(false)}
        style={{ width:'100%', height:'100%', objectFit:'cover', objectPosition:'center', display:'block' }}
      />
    </div>
  );
}

function WpActiveView({ session, exIdx, setIdx, elapsed, restTimer, onCompleteSet, onUpdateSet, onSelectSet, onNavigateEx, onFinish, onExit, onRestAdjust, onRestSkip }) {
  const isMobile = useIsMobile();
  const TABBAR = 'calc(56px + env(safe-area-inset-bottom))';

  // Immersive training: hide the app's mobile top header during the active view
  React.useEffect(() => {
    document.body.classList.add('atlas-training');
    return () => document.body.classList.remove('atlas-training');
  }, []);

  const ex = session.exercises[exIdx];
  if (!ex) return null;
  const set = ex.sets[setIdx];
  const totalExs = session.exercises.length;
  const doneSets = session.exercises.reduce((t, e) => t + e.sets.filter(s => s.done).length, 0);
  const totalSets = session.exercises.reduce((t, e) => t + e.sets.length, 0);
  const pct = totalSets > 0 ? Math.round((doneSets / totalSets) * 100) : 0;

  // Look up cues from ExerciseService
  const cues = React.useMemo(() => {
    try {
      const info = ExerciseService.getById(ex.id);
      return (info?.cues || []).slice(0, 3);
    } catch { return []; }
  }, [ex.id]);

  return (
    <div style={{ display:'flex', flexDirection:'column', background:WP.page,
      // Mobile: fill the screen; the app top header is hidden via body.atlas-training
      minHeight: isMobile ? '100dvh' : '100vh' }}>

      {/* Fixed header */}
      <div style={{ background:'rgba(6,13,24,0.97)', borderBottom:`1px solid ${WP.border}`, flexShrink:0, position:'sticky', top:0, zIndex:10 }}>
        {/* Top bar */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'10px 16px' }}>
          <button onClick={onExit} style={{ padding:'6px 12px', borderRadius:8, border:`1px solid ${WP.border}`, background:'transparent', color:WP.muted, fontFamily:'Inter,system-ui', fontSize:12, fontWeight:700, cursor:'pointer' }}>
            ← Salir
          </button>
          <div style={{ fontFamily:'Inter,system-ui', fontSize:13, fontWeight:700, color:WP.text, maxWidth:200, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', textAlign:'center' }}>
            {ex.name}
          </div>
          <div style={{ fontFamily:'ui-monospace,Menlo,monospace', fontSize:14, fontWeight:800, color:WP.green }}>
            {wpFmtTime(elapsed)}
          </div>
        </div>
        {/* Progress info */}
        <div style={{ padding:'4px 16px 8px', display:'flex', alignItems:'center', gap:10 }}>
          <div style={{ fontFamily:'ui-monospace,Menlo,monospace', fontSize:9, color:WP.muted, whiteSpace:'nowrap' }}>
            Ej {exIdx + 1} de {totalExs} · {doneSets}/{totalSets} series
          </div>
          <div style={{ flex:1, height:4, borderRadius:999, background:'rgba(255,255,255,0.08)', overflow:'hidden' }}>
            <div style={{ height:'100%', width:`${pct}%`, background:WP.green, borderRadius:999, transition:'width .3s ease' }} />
          </div>
          <div style={{ fontFamily:'ui-monospace,Menlo,monospace', fontSize:9, color:WP.green, whiteSpace:'nowrap' }}>{pct}%</div>
        </div>
      </div>

      {/* Rest timer banner */}
      <WpRestTimer restTimer={restTimer} onSkip={onRestSkip} onAdjust={onRestAdjust} isMobile={isMobile} />

      {/* Scrollable content — clears the fixed mobile tab bar */}
      <div style={{ flex:1, overflowY:'auto', padding: isMobile ? `20px 16px calc(40px + ${TABBAR})` : '20px 16px 100px' }}>
        <div style={{ maxWidth:540, margin:'0 auto' }}>

          {/* Exercise card */}
          <div style={{ borderRadius:16, border:`1px solid ${WP.border}`, background:WP.card, padding:'18px 18px 14px', marginBottom:16 }}>
            <WpExerciseImage id={ex.id} name={ex.name} />
            <div style={{ fontFamily:'Inter,system-ui', fontSize:20, fontWeight:800, color:WP.text, letterSpacing:-0.5, marginBottom:10 }}>
              {ex.name}
            </div>

            {/* Muscles + equipment */}
            <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap', marginBottom: cues.length ? 12 : 0 }}>
              {(ex.muscles?.primary || []).map(m => (
                <span key={m} style={{ display:'inline-flex', alignItems:'center', gap:4, fontFamily:'Inter,system-ui', fontSize:11, fontWeight:600, color:wpMuscleColor(m) }}>
                  <span style={{ width:6, height:6, borderRadius:'50%', background:wpMuscleColor(m), display:'block', flexShrink:0 }} />
                  {m}
                </span>
              ))}
              {ex.group && (
                <span style={{ fontFamily:'Inter,system-ui', fontSize:10, color:WP.muted }}>· {ex.group}</span>
              )}
            </div>

            {/* Cues */}
            {cues.length > 0 && (
              <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
                {cues.map((cue, ci) => (
                  <div key={ci} style={{ display:'flex', gap:6, alignItems:'flex-start' }}>
                    <span style={{ fontFamily:'ui-monospace,Menlo,monospace', fontSize:9, color:WP.muted, flexShrink:0, marginTop:2 }}>•</span>
                    <span style={{ fontFamily:'Inter,system-ui', fontSize:11, color:WP.sub, lineHeight:1.5 }}>{cue}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Set panel */}
          <div style={{ borderRadius:16, border:`1px solid ${WP.border}`, background:WP.card, padding:'18px', marginBottom:14 }}>
            {/* Set info */}
            <div style={{ fontFamily:'ui-monospace,Menlo,monospace', fontSize:10, fontWeight:700, color:WP.muted, letterSpacing:0.8, marginBottom:14 }}>
              SERIE {setIdx + 1} DE {ex.sets.length} · OBJETIVO {ex.repsRange} REPS · RIR {ex.rir}
            </div>

            {/* Kg + Reps inputs */}
            <div style={{ display:'flex', gap:10, marginBottom:14 }}>
              <div style={{ flex:1 }}>
                <div style={{ fontFamily:'ui-monospace,Menlo,monospace', fontSize:8, color:WP.muted, letterSpacing:1, marginBottom:5 }}>PESO (KG)</div>
                <input
                  type="number"
                  inputMode="decimal"
                  value={set?.kg || ''}
                  onChange={e => onUpdateSet(exIdx, setIdx, { kg: e.target.value })}
                  placeholder="0"
                  style={{ width:'100%', padding: isMobile ? '13px 12px' : '10px 12px', minHeight: isMobile ? 50 : undefined, borderRadius:10, border:`1px solid ${WP.border}`, background:WP.input, color:WP.text, fontFamily:'ui-monospace,Menlo,monospace', fontSize: isMobile ? 22 : 20, fontWeight:800, textAlign:'center', boxSizing:'border-box' }}
                />
              </div>
              <div style={{ flex:1 }}>
                <div style={{ fontFamily:'ui-monospace,Menlo,monospace', fontSize:8, color:WP.muted, letterSpacing:1, marginBottom:5 }}>REPS</div>
                <input
                  type="number"
                  inputMode="numeric"
                  value={set?.reps || ''}
                  onChange={e => onUpdateSet(exIdx, setIdx, { reps: e.target.value })}
                  placeholder="0"
                  style={{ width:'100%', padding: isMobile ? '13px 12px' : '10px 12px', minHeight: isMobile ? 50 : undefined, borderRadius:10, border:`1px solid ${WP.border}`, background:WP.input, color:WP.text, fontFamily:'ui-monospace,Menlo,monospace', fontSize: isMobile ? 22 : 20, fontWeight:800, textAlign:'center', boxSizing:'border-box' }}
                />
              </div>
            </div>

            {/* RPE selector */}
            <div style={{ marginBottom:16 }}>
              <WpRpeSelector value={set?.rpe || null} onChange={rpe => onUpdateSet(exIdx, setIdx, { rpe })} />
            </div>

            {/* Complete set button */}
            <button
              onClick={() => !set?.done && onCompleteSet(exIdx, setIdx)}
              disabled={!!set?.done}
              style={{
                width:'100%', padding: isMobile ? '16px' : '13px 16px', minHeight: isMobile ? 54 : undefined, borderRadius:12, border:'none',
                cursor: set?.done ? 'default' : 'pointer',
                background: set?.done ? 'rgba(34,197,94,0.20)' : WP.green,
                color: set?.done ? WP.green : '#fff',
                fontFamily:'Inter,system-ui', fontSize: isMobile ? 16 : 15, fontWeight:800, letterSpacing:-0.3,
                boxShadow: set?.done ? 'none' : '0 4px 18px -4px rgba(34,197,94,0.45)',
                transition:'all .15s',
              }}
            >
              {set?.done ? '✓ Serie completada' : '✓ Completar serie'}
            </button>
          </div>

          {/* Set status grid */}
          <div style={{ borderRadius:14, border:`1px solid ${WP.border}`, background:WP.card, padding:'14px 16px', marginBottom:14 }}>
            <div style={{ fontFamily:'ui-monospace,Menlo,monospace', fontSize:8, fontWeight:700, color:WP.muted, letterSpacing:1.2, marginBottom:10 }}>SERIES</div>
            <WpSetGrid sets={ex.sets} currentSetIdx={setIdx} onSelectSet={i => onSelectSet(exIdx, i)} />
          </div>

          {/* Exercise navigation */}
          <div style={{ display:'flex', gap:8, marginBottom:10 }}>
            <button
              onClick={() => onNavigateEx(exIdx - 1)}
              disabled={exIdx === 0}
              style={{ flex:1, padding:'10px 12px', borderRadius:10, border:`1px solid ${WP.border}`, background:'transparent', color: exIdx === 0 ? WP.muted : WP.sub, fontFamily:'Inter,system-ui', fontSize:12, fontWeight:700, cursor: exIdx === 0 ? 'default' : 'pointer' }}
            >
              ← Ej. anterior
            </button>
            <button
              onClick={() => onNavigateEx(exIdx + 1)}
              disabled={exIdx >= session.exercises.length - 1}
              style={{ flex:1, padding:'10px 12px', borderRadius:10, border:`1px solid ${WP.border}`, background:'transparent', color: exIdx >= session.exercises.length - 1 ? WP.muted : WP.sub, fontFamily:'Inter,system-ui', fontSize:12, fontWeight:700, cursor: exIdx >= session.exercises.length - 1 ? 'default' : 'pointer' }}
            >
              Siguiente ej. →
            </button>
          </div>

          <button
            onClick={onFinish}
            style={{ width:'100%', padding:'11px 16px', borderRadius:10, border:`1px solid rgba(239,68,68,0.30)`, background:'transparent', color:'#F87171', fontFamily:'Inter,system-ui', fontSize:13, fontWeight:700, cursor:'pointer' }}
          >
            Finalizar entrenamiento
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

function WorkoutPlayerSection() {
  const { state, actions } = useStore();
  const { navigate } = useRoute();

  const [session,   setSession]   = React.useState(null);
  const [exIdx,     setExIdx]     = React.useState(0);
  const [setIdx,    setSetIdx]    = React.useState(0);
  const [restTimer, setRestTimer] = React.useState(null); // { rem, total }
  const [elapsed,   setElapsed]   = React.useState(0);
  const [view,      setView]      = React.useState('loading');
  const [finished,  setFinished]  = React.useState(null);

  const elapsedRef    = React.useRef(0);
  const restTimerRef  = React.useRef(null);
  const elapsedIntRef = React.useRef(null);
  const restIntRef    = React.useRef(null);

  // ── Mount: load or create session ─────────────────────────────────────────
  React.useEffect(() => {
    const rawExs  = (() => { try { return JSON.parse(localStorage.getItem('atlas.pendingWorkout') || 'null'); } catch { return null; } })();
    const rawMeta = (() => { try { return JSON.parse(localStorage.getItem('atlas.pendingWorkoutMeta') || 'null'); } catch { return null; } })();

    if (rawExs && Array.isArray(rawExs) && rawExs.length > 0) {
      // Clear pending keys
      localStorage.removeItem('atlas.pendingWorkout');
      localStorage.removeItem('atlas.pendingWorkoutMeta');
      const s = WorkoutSessionStore.create(rawExs, rawMeta);
      setSession(s);
      elapsedRef.current = 0;
      setElapsed(0);
      setExIdx(0);
      setSetIdx(0);
      setView('active');
    } else {
      const active = WorkoutSessionStore.getActive();
      if (active) {
        setSession(active);
        const el = Math.round((Date.now() - (active.startTime || Date.now())) / 1000);
        elapsedRef.current = el;
        setElapsed(el);
        // Find first incomplete ex+set
        let foundEx = 0, foundSet = 0;
        outer: for (let ei = 0; ei < active.exercises.length; ei++) {
          for (let si = 0; si < active.exercises[ei].sets.length; si++) {
            if (!active.exercises[ei].sets[si].done) { foundEx = ei; foundSet = si; break outer; }
          }
        }
        setExIdx(foundEx);
        setSetIdx(foundSet);
        setView('active');
      } else {
        setView('history');
      }
    }
  }, []);

  // ── Elapsed timer ──────────────────────────────────────────────────────────
  React.useEffect(() => {
    if (view !== 'active') return;
    elapsedIntRef.current = setInterval(() => {
      elapsedRef.current += 1;
      setElapsed(elapsedRef.current);
    }, 1000);
    return () => clearInterval(elapsedIntRef.current);
  }, [view]);

  // ── Rest timer ─────────────────────────────────────────────────────────────
  React.useEffect(() => {
    if (!restTimer) return;
    restTimerRef.current = restTimer;
    restIntRef.current = setInterval(() => {
      setRestTimer(prev => {
        if (!prev) return null;
        const next = prev.rem - 1;
        if (next <= 0) { clearInterval(restIntRef.current); return null; }
        return { ...prev, rem: next };
      });
    }, 1000);
    return () => clearInterval(restIntRef.current);
  }, [restTimer?.total]); // re-run only when a new timer starts

  function startRestTimer(restStr) {
    clearInterval(restIntRef.current);
    // Parse rest string like '90s', '2 min', '90-120s' → pick first number
    const match = (restStr || '90s').match(/(\d+)/);
    const secs  = match ? parseInt(match[1]) : 90;
    setRestTimer({ rem: secs, total: secs });
  }

  function handleRestAdjust(delta) {
    setRestTimer(prev => {
      if (!prev) return null;
      const next = Math.max(0, prev.rem + delta);
      if (next === 0) { clearInterval(restIntRef.current); return null; }
      return { ...prev, rem: next };
    });
  }

  function handleRestSkip() {
    clearInterval(restIntRef.current);
    setRestTimer(null);
  }

  // ── Update a set field ─────────────────────────────────────────────────────
  function updateSet(ei, si, patch) {
    setSession(prev => {
      if (!prev) return prev;
      const exercises = prev.exercises.map((ex, eIdx) => {
        if (eIdx !== ei) return ex;
        return { ...ex, sets: ex.sets.map((s, sIdx) => sIdx === si ? { ...s, ...patch } : s) };
      });
      const next = { ...prev, exercises };
      WorkoutSessionStore.save(next);
      return next;
    });
  }

  // ── Complete a set ─────────────────────────────────────────────────────────
  function completeSet(ei, si) {
    setSession(prev => {
      if (!prev) return prev;
      const exercises = prev.exercises.map((ex, eIdx) => {
        if (eIdx !== ei) return ex;
        return { ...ex, sets: ex.sets.map((s, sIdx) => sIdx === si ? { ...s, done: true, doneAt: Date.now() } : s) };
      });
      const next = { ...prev, exercises };
      WorkoutSessionStore.save(next);

      // Find next undone set/exercise
      let foundEx = ei, foundSet = si;
      outer: for (let e = ei; e < exercises.length; e++) {
        const startS = e === ei ? si + 1 : 0;
        for (let s = startS; s < exercises[e].sets.length; s++) {
          if (!exercises[e].sets[s].done) { foundEx = e; foundSet = s; break outer; }
        }
      }
      setTimeout(() => { setExIdx(foundEx); setSetIdx(foundSet); }, 50);

      // Start rest timer
      const restStr = exercises[ei]?.rest || '90s';
      startRestTimer(restStr);

      return next;
    });
  }

  // ── Navigate to set ────────────────────────────────────────────────────────
  function handleSelectSet(ei, si) {
    setExIdx(ei);
    setSetIdx(si);
    handleRestSkip();
  }

  // ── Navigate exercise ──────────────────────────────────────────────────────
  function handleNavigateEx(newEi) {
    if (!session) return;
    const clampedEi = Math.max(0, Math.min(session.exercises.length - 1, newEi));
    setExIdx(clampedEi);
    // Find first undone set in new exercise
    const ex = session.exercises[clampedEi];
    const firstUndone = ex.sets.findIndex(s => !s.done);
    setSetIdx(firstUndone >= 0 ? firstUndone : 0);
    handleRestSkip();
  }

  // ── Finish workout ─────────────────────────────────────────────────────────
  function finishWorkout() {
    if (!session) return;
    clearInterval(elapsedIntRef.current);
    clearInterval(restIntRef.current);
    const completed = WorkoutSessionStore.complete(session);
    // Build exercises payload for logSession (compatible with store format)
    const logExercises = completed.exercises.map(ex => ({
      name: ex.name,
      group: ex.group || '',
      muscles: (ex.muscles?.primary || []),
      sets: ex.sets.filter(s => s.done).map(s => ({ kg: s.kg, reps: s.reps })),
    }));
    try {
      actions.logSession(logExercises, {
        duration: completed.duration,
        routineName: completed.routineName,
        sessionName: completed.sessionName,
      });
    } catch (e) { /* store may not support this */ }
    setFinished(completed);
    setView('finish');
  }

  // ── Exit (abandon) ─────────────────────────────────────────────────────────
  function handleExit() {
    // Keep session active (it's saved), just navigate away
    clearInterval(elapsedIntRef.current);
    clearInterval(restIntRef.current);
    navigate('/');
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  if (view === 'loading') return <WpSpinner />;

  if (view === 'history') {
    return <WpHistoryScreen onNewWorkout={() => navigate('/coach')} />;
  }

  if (view === 'finish') {
    return (
      <WpFinishScreen
        finished={finished}
        onHome={() => navigate('/')}
        onCoach={() => navigate('/coach')}
      />
    );
  }

  // 'active'
  if (!session) return <WpSpinner />;

  return (
    <WpActiveView
      session={session}
      exIdx={exIdx}
      setIdx={setIdx}
      elapsed={elapsed}
      restTimer={restTimer}
      onCompleteSet={completeSet}
      onUpdateSet={updateSet}
      onSelectSet={handleSelectSet}
      onNavigateEx={handleNavigateEx}
      onFinish={finishWorkout}
      onExit={handleExit}
      onRestAdjust={handleRestAdjust}
      onRestSkip={handleRestSkip}
    />
  );
}

Object.assign(window, { WorkoutPlayerSection });
