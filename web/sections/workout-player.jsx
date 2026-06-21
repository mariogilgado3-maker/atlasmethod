// Workout Player — live workout tracker

const WP = {
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
  input:  '#0A1422',
};

// ── Parse rest seconds from string like "90s", "2-3 min", "90-120s" ──────────
function parseRestSecs(str) {
  if (!str) return 90;
  const s = String(str).toLowerCase();
  const minMatch = s.match(/(\d+)\s*(?:-\s*\d+)?\s*min/);
  if (minMatch) return parseInt(minMatch[1]) * 60;
  const secRange = s.match(/(\d+)\s*-\s*\d+\s*s/);
  if (secRange) return parseInt(secRange[1]);
  const secSingle = s.match(/(\d+)\s*s/);
  if (secSingle) return parseInt(secSingle[1]);
  return 90;
}

// ── Normalize exercises into player format ────────────────────────────────────
function normalizeExercises(rawExs) {
  return rawExs.map(ex => ({
    id:       ex.id || String(Math.random()),
    name:     ex.name || 'Ejercicio',
    muscles:  ex.muscles || { primary: [], secondary: [] },
    pattern:  ex.pattern || '',
    restSecs: parseRestSecs(ex.rest),
    sets: Array.from({ length: ex.setsCount || (Array.isArray(ex.sets) ? ex.sets.length : 3) }, (_, i) => {
      const src = Array.isArray(ex.sets) ? ex.sets[i] : null;
      return {
        kg:   (src?.kg  !== undefined) ? String(src.kg)   : '',
        reps: (src?.reps !== undefined) ? String(src.reps) : '10',
        rpe:  null,
        done: false,
      };
    }),
  }));
}

// ── Rest Timer ────────────────────────────────────────────────────────────────
function RestTimer({ seconds, onDone }) {
  const [remaining, setRemaining] = useState(seconds);
  const [paused, setPaused]       = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (paused) return;
    if (remaining <= 0) { onDone(); return; }
    ref.current = setInterval(() => {
      setRemaining(r => {
        if (r <= 1) { clearInterval(ref.current); onDone(); return 0; }
        return r - 1;
      });
    }, 1000);
    return () => clearInterval(ref.current);
  }, [paused, remaining]);

  const adjust = (delta) => setRemaining(r => Math.max(0, r + delta));
  const mins   = Math.floor(remaining / 60);
  const secs   = remaining % 60;

  const pct    = Math.max(0, remaining / seconds);
  const R      = 44;
  const C      = 2 * Math.PI * R;

  return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:16,
      padding:'24px 0', background:WP.card2, borderRadius:16,
      border:`1px solid ${WP.border}` }}>

      <div style={{ fontFamily:'ui-monospace,Menlo,monospace', fontSize:10, fontWeight:700,
        color:WP.muted, letterSpacing:2 }}>DESCANSO</div>

      <div style={{ position:'relative', width:108, height:108 }}>
        <svg width="108" height="108" viewBox="0 0 108 108">
          <circle cx="54" cy="54" r={R} fill="none"
            stroke="rgba(255,255,255,0.06)" strokeWidth="6" />
          <circle cx="54" cy="54" r={R} fill="none"
            stroke={remaining <= 10 ? WP.red : WP.blue} strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={C} strokeDashoffset={C * (1 - pct)}
            transform="rotate(-90 54 54)"
            style={{ transition:'stroke-dashoffset .9s linear, stroke .3s' }} />
        </svg>
        <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column',
          alignItems:'center', justifyContent:'center' }}>
          <span style={{ fontFamily:'ui-monospace,Menlo,monospace', fontSize:28,
            fontWeight:800, color: remaining <= 10 ? WP.red : WP.text, lineHeight:1 }}>
            {mins > 0 ? `${mins}:${String(secs).padStart(2,'0')}` : secs}
          </span>
          <span style={{ fontFamily:'ui-monospace,Menlo,monospace', fontSize:9,
            color:WP.muted, marginTop:2 }}>seg</span>
        </div>
      </div>

      <div style={{ display:'flex', gap:10 }}>
        {[-15, +15].map(d => (
          <button key={d} onClick={() => adjust(d)}
            style={{ padding:'6px 14px', borderRadius:8, border:`1px solid ${WP.border}`,
              background:'rgba(255,255,255,0.04)', color:WP.sub, cursor:'pointer',
              fontFamily:'ui-monospace,Menlo,monospace', fontSize:12, fontWeight:700 }}>
            {d > 0 ? '+15' : '-15'}
          </button>
        ))}
        <button onClick={() => setPaused(p => !p)}
          style={{ padding:'6px 18px', borderRadius:8, border:'none',
            background: paused ? WP.blue : 'rgba(255,255,255,0.08)',
            color:WP.text, cursor:'pointer',
            fontFamily:'Inter,system-ui', fontSize:12, fontWeight:600 }}>
          {paused ? 'Reanudar' : 'Pausar'}
        </button>
        <button onClick={onDone}
          style={{ padding:'6px 14px', borderRadius:8, border:`1px solid ${WP.border}`,
            background:'rgba(255,255,255,0.04)', color:WP.muted, cursor:'pointer',
            fontFamily:'Inter,system-ui', fontSize:12 }}>
          Saltar
        </button>
      </div>
    </div>
  );
}

// ── Set Row ───────────────────────────────────────────────────────────────────
function SetRow({ setIdx, set, onUpdate, onComplete, isNext }) {
  const rpeOpts = [null, 6, 7, 8, 9, 10];

  return (
    <div style={{ display:'grid', gridTemplateColumns:'28px 1fr 1fr 1fr auto',
      gap:8, alignItems:'center', padding:'8px 0',
      borderBottom:`1px solid ${WP.border}`,
      opacity: set.done ? 0.5 : 1, transition:'opacity .2s' }}>

      {/* Set number */}
      <div style={{ fontFamily:'ui-monospace,Menlo,monospace', fontSize:11,
        color: set.done ? WP.green : WP.muted, fontWeight:700, textAlign:'center' }}>
        {set.done ? '✓' : setIdx + 1}
      </div>

      {/* KG */}
      <input
        type="number" inputMode="decimal"
        value={set.kg} disabled={set.done}
        onChange={e => onUpdate({ kg: e.target.value })}
        placeholder="kg"
        style={{ background:WP.input, border:`1px solid ${WP.border}`, borderRadius:8,
          color:WP.text, fontFamily:'ui-monospace,Menlo,monospace', fontSize:13,
          fontWeight:700, padding:'7px 10px', width:'100%', textAlign:'center',
          outline:'none', opacity: set.done ? 0.6 : 1 }} />

      {/* Reps */}
      <input
        type="number" inputMode="numeric"
        value={set.reps} disabled={set.done}
        onChange={e => onUpdate({ reps: e.target.value })}
        placeholder="reps"
        style={{ background:WP.input, border:`1px solid ${WP.border}`, borderRadius:8,
          color:WP.text, fontFamily:'ui-monospace,Menlo,monospace', fontSize:13,
          fontWeight:700, padding:'7px 10px', width:'100%', textAlign:'center',
          outline:'none', opacity: set.done ? 0.6 : 1 }} />

      {/* RPE */}
      <select
        value={set.rpe === null ? '' : set.rpe}
        disabled={set.done}
        onChange={e => onUpdate({ rpe: e.target.value ? parseInt(e.target.value) : null })}
        style={{ background:WP.input, border:`1px solid ${WP.border}`, borderRadius:8,
          color: set.rpe ? WP.text : WP.muted, fontFamily:'ui-monospace,Menlo,monospace',
          fontSize:12, padding:'7px 6px', width:'100%', outline:'none',
          opacity: set.done ? 0.6 : 1 }}>
        <option value="">RPE</option>
        {[6,7,8,9,10].map(v => <option key={v} value={v}>{v}</option>)}
      </select>

      {/* Complete button */}
      <button
        onClick={onComplete}
        disabled={set.done}
        style={{ padding:'7px 14px', borderRadius:8, border:'none', cursor: set.done ? 'default' : 'pointer',
          background: set.done ? 'rgba(34,197,94,0.15)' : isNext ? WP.blue : 'rgba(255,255,255,0.07)',
          color: set.done ? WP.green : WP.text,
          fontFamily:'Inter,system-ui', fontSize:12, fontWeight:700,
          boxShadow: isNext && !set.done ? '0 0 12px rgba(59,130,246,0.35)' : 'none',
          transition:'all .15s', whiteSpace:'nowrap' }}>
        {set.done ? 'OK' : '✓ Hecho'}
      </button>
    </div>
  );
}

// ── Exercise Card ─────────────────────────────────────────────────────────────
function ExerciseCard({ exercise, exIdx, onSetUpdate, onSetComplete, timer, onTimerDone }) {
  const muscles = [
    ...(exercise.muscles?.primary  || []),
    ...(exercise.muscles?.secondary || []),
  ].filter(Boolean).slice(0, 3);

  const doneSets  = exercise.sets.filter(s => s.done).length;
  const totalSets = exercise.sets.length;
  const pct       = totalSets > 0 ? (doneSets / totalSets) * 100 : 0;

  const nextUndone = exercise.sets.findIndex(s => !s.done);

  return (
    <div style={{ background:WP.card, borderRadius:16, padding:'18px 20px',
      marginBottom:16, border:`1px solid ${WP.border}` }}>

      {/* Header */}
      <div style={{ marginBottom:12 }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:6 }}>
          <div style={{ fontFamily:'"Space Grotesk",system-ui', fontSize:17,
            fontWeight:700, color:WP.text }}>
            {exercise.name}
          </div>
          <div style={{ fontFamily:'ui-monospace,Menlo,monospace', fontSize:10,
            color: doneSets === totalSets ? WP.green : WP.muted, fontWeight:700 }}>
            {doneSets}/{totalSets} series
          </div>
        </div>

        {muscles.length > 0 && (
          <div style={{ display:'flex', gap:5, flexWrap:'wrap' }}>
            {muscles.map((m, i) => (
              <span key={i} style={{ padding:'2px 8px', borderRadius:999, fontSize:10,
                background: i === 0 ? 'rgba(59,130,246,0.15)' : 'rgba(255,255,255,0.05)',
                color: i === 0 ? '#93C5FD' : WP.muted,
                fontFamily:'Inter,system-ui' }}>
                {m}
              </span>
            ))}
          </div>
        )}

        {/* Progress bar */}
        <div style={{ marginTop:10, height:3, borderRadius:999,
          background:'rgba(255,255,255,0.06)', overflow:'hidden' }}>
          <div style={{ height:'100%', width:`${pct}%`, borderRadius:999,
            background: pct === 100 ? WP.green : WP.blue,
            transition:'width .4s ease' }} />
        </div>
      </div>

      {/* Column headers */}
      <div style={{ display:'grid', gridTemplateColumns:'28px 1fr 1fr 1fr auto',
        gap:8, marginBottom:4 }}>
        {['#','Peso','Reps','RPE',''].map((h, i) => (
          <div key={i} style={{ fontFamily:'ui-monospace,Menlo,monospace', fontSize:9,
            color:WP.muted, fontWeight:700, textAlign:'center', letterSpacing:1 }}>{h}</div>
        ))}
      </div>

      {/* Sets */}
      {exercise.sets.map((set, si) => (
        <SetRow
          key={si}
          setIdx={si}
          set={set}
          isNext={si === nextUndone}
          onUpdate={patch => onSetUpdate(exIdx, si, patch)}
          onComplete={() => onSetComplete(exIdx, si)}
        />
      ))}

      {/* Rest timer shown inside the card that just had a set completed */}
      {timer && timer.exIdx === exIdx && (
        <div style={{ marginTop:14 }}>
          <RestTimer seconds={timer.seconds} onDone={onTimerDone} />
        </div>
      )}
    </div>
  );
}

// ── Finish Screen ─────────────────────────────────────────────────────────────
function FinishScreen({ meta, exercises, duration, navigate }) {
  const totalSets = exercises.reduce((t, ex) => t + ex.sets.filter(s => s.done).length, 0);
  const mins = Math.floor(duration / 60);
  const secs = duration % 60;

  const stats = [
    { label:'Duración',      value: mins > 0 ? `${mins}:${String(secs).padStart(2,'0')}` : `${secs}s` },
    { label:'Series totales', value: totalSets },
    { label:'Ejercicios',    value: exercises.length },
    { label:'Gemas',         value: '+30 💎' },
  ];

  return (
    <div style={{ minHeight:'100vh', background:WP.page, display:'flex',
      flexDirection:'column', alignItems:'center', justifyContent:'center',
      padding:'32px 20px' }}>

      <div style={{ maxWidth:480, width:'100%', textAlign:'center' }}>
        <div style={{ fontSize:56, marginBottom:16 }}>🏆</div>

        <div style={{ fontFamily:'"Space Grotesk",system-ui', fontSize:28,
          fontWeight:800, color:WP.text, marginBottom:8 }}>
          ¡Sesión completada!
        </div>

        {meta?.sessionName && (
          <div style={{ fontFamily:'Inter,system-ui', fontSize:14,
            color:WP.sub, marginBottom:24 }}>
            {meta.sessionName}
          </div>
        )}

        {/* Stats grid */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:28 }}>
          {stats.map(s => (
            <div key={s.label} style={{ background:WP.card, borderRadius:14, padding:'18px 16px',
              border:`1px solid ${WP.border}` }}>
              <div style={{ fontFamily:'"Space Grotesk",system-ui', fontSize:22,
                fontWeight:800, color:WP.text, marginBottom:4 }}>
                {s.value}
              </div>
              <div style={{ fontFamily:'ui-monospace,Menlo,monospace', fontSize:9,
                color:WP.muted, fontWeight:700, letterSpacing:1 }}>
                {s.label.toUpperCase()}
              </div>
            </div>
          ))}
        </div>

        <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
          <button onClick={() => navigate('/')}
            style={{ padding:'14px', borderRadius:12, border:'none', cursor:'pointer',
              background:WP.blue, color:'#fff',
              fontFamily:'Inter,system-ui', fontSize:15, fontWeight:700,
              boxShadow:'0 4px 20px rgba(59,130,246,0.35)' }}>
            Volver al inicio
          </button>
          <button onClick={() => navigate('/progreso')}
            style={{ padding:'14px', borderRadius:12,
              border:`1px solid ${WP.border}`, cursor:'pointer',
              background:'rgba(255,255,255,0.04)', color:WP.sub,
              fontFamily:'Inter,system-ui', fontSize:15, fontWeight:600 }}>
            Ver progreso
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
function WorkoutPlayerSection() {
  const { navigate }    = useRoute();
  const { actions }     = useStore();

  const [exercises,    setExercises]    = useState(null);
  const [meta,         setMeta]         = useState(null);
  const [timer,        setTimer]        = useState(null); // { exIdx, seconds }
  const [finished,     setFinished]     = useState(false);
  const [duration,     setDuration]     = useState(0);
  const startRef = useRef(Date.now());
  const tickRef  = useRef(null);

  // ── Load exercises on mount ─────────────────────────────────────────────────
  useEffect(() => {
    // 1. Try pendingWorkout
    let raw  = null;
    let metaRaw = null;
    try {
      raw     = JSON.parse(localStorage.getItem('atlas.pendingWorkout') || 'null');
      metaRaw = JSON.parse(localStorage.getItem('atlas.pendingWorkoutMeta') || 'null');
      localStorage.removeItem('atlas.pendingWorkout');
      localStorage.removeItem('atlas.pendingWorkoutMeta');
    } catch {}

    // 2. Fallback to active routine first session
    if (!raw || !Array.isArray(raw) || raw.length === 0) {
      try {
        const routine = typeof arLoad === 'function' ? arLoad() : null;
        raw = routine?.sessions?.[0]?.exercises || null;
        if (!metaRaw && routine) {
          metaRaw = {
            routineName:  routine.name  || 'Rutina activa',
            sessionName:  routine.sessions?.[0]?.name || 'Sesión 1',
          };
        }
      } catch {}
    }

    if (!raw || !Array.isArray(raw) || raw.length === 0) {
      setExercises([]);
      return;
    }

    setExercises(normalizeExercises(raw));
    setMeta(metaRaw || {});
    startRef.current = Date.now();
  }, []);

  // ── Duration ticker ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!exercises || exercises.length === 0 || finished) return;
    tickRef.current = setInterval(() => {
      setDuration(Math.floor((Date.now() - startRef.current) / 1000));
    }, 1000);
    return () => clearInterval(tickRef.current);
  }, [exercises, finished]);

  // ── Auto-save ────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!exercises) return;
    try {
      localStorage.setItem('atlas.activesession.v1', JSON.stringify({
        exercises,
        meta,
        savedAt: Date.now(),
      }));
    } catch {}
  }, [exercises]);

  // ── Handlers ─────────────────────────────────────────────────────────────────
  const handleSetUpdate = useCallback((exIdx, setIdx, patch) => {
    setExercises(prev => {
      const next = prev.map((ex, ei) => {
        if (ei !== exIdx) return ex;
        return {
          ...ex,
          sets: ex.sets.map((s, si) => si === setIdx ? { ...s, ...patch } : s),
        };
      });
      return next;
    });
  }, []);

  const handleSetComplete = useCallback((exIdx, setIdx) => {
    setExercises(prev => {
      const next = prev.map((ex, ei) => {
        if (ei !== exIdx) return ex;
        return {
          ...ex,
          sets: ex.sets.map((s, si) => si === setIdx ? { ...s, done: true } : s),
        };
      });
      return next;
    });

    // Start rest timer
    const restSecs = exercises?.[exIdx]?.restSecs ?? 90;
    const isLastSet = !exercises[exIdx].sets.slice(setIdx + 1).some(s => !s.done);
    if (!isLastSet) {
      setTimer({ exIdx, seconds: restSecs });
    }
  }, [exercises]);

  const handleTimerDone = useCallback(() => {
    setTimer(null);
  }, []);

  const handleFinish = useCallback(() => {
    clearInterval(tickRef.current);
    const finalDuration = Math.floor((Date.now() - startRef.current) / 1000);
    setDuration(finalDuration);

    // Build log-compatible exercise list
    const completedExs = (exercises || []).map(ex => ({
      id:      ex.id,
      name:    ex.name,
      muscles: [
        ...(ex.muscles?.primary   || []),
        ...(ex.muscles?.secondary || []),
      ].filter(Boolean),
      sets: ex.sets.filter(s => s.done).map(s => ({
        kg:   parseFloat(s.kg)   || 0,
        reps: parseInt(s.reps)   || 0,
        rpe:  s.rpe,
      })),
    })).filter(ex => ex.sets.length > 0);

    actions.logSession(completedExs);

    // Clear active session
    try { localStorage.removeItem('atlas.activesession.v1'); } catch {}

    setFinished(true);
  }, [exercises, actions]);

  // ── Render: loading ─────────────────────────────────────────────────────────
  if (exercises === null) {
    return (
      <div style={{ minHeight:'100vh', background:WP.page, display:'flex',
        alignItems:'center', justifyContent:'center' }}>
        <div style={{ width:28, height:28, border:'2px solid rgba(255,255,255,0.1)',
          borderTopColor:WP.blue, borderRadius:'50%', animation:'spin .7s linear infinite' }} />
      </div>
    );
  }

  // ── Render: no workout ──────────────────────────────────────────────────────
  if (exercises.length === 0) {
    return (
      <div style={{ minHeight:'100vh', background:WP.page, display:'flex',
        flexDirection:'column', alignItems:'center', justifyContent:'center',
        padding:32 }}>
        <div style={{ fontFamily:'"Space Grotesk",system-ui', fontSize:22,
          fontWeight:700, color:WP.text, marginBottom:8, textAlign:'center' }}>
          No hay entrenamiento activo
        </div>
        <div style={{ fontFamily:'Inter,system-ui', fontSize:14, color:WP.sub,
          marginBottom:28, textAlign:'center' }}>
          Genera una rutina en el Builder para empezar.
        </div>
        <button onClick={() => navigate('/builder')}
          style={{ padding:'12px 28px', borderRadius:12, border:'none', cursor:'pointer',
            background:WP.blue, color:'#fff', fontFamily:'Inter,system-ui',
            fontSize:15, fontWeight:700 }}>
          Ir al Builder
        </button>
      </div>
    );
  }

  // ── Render: finished ─────────────────────────────────────────────────────────
  if (finished) {
    return (
      <FinishScreen
        meta={meta}
        exercises={exercises}
        duration={duration}
        navigate={navigate}
      />
    );
  }

  // ── Render: active workout ───────────────────────────────────────────────────
  const doneSets   = exercises.reduce((t, ex) => t + ex.sets.filter(s => s.done).length, 0);
  const totalSets  = exercises.reduce((t, ex) => t + ex.sets.length, 0);
  const overallPct = totalSets > 0 ? Math.round((doneSets / totalSets) * 100) : 0;
  const mins       = Math.floor(duration / 60);
  const secs       = duration % 60;

  return (
    <div style={{ minHeight:'100vh', background:WP.page, paddingBottom:40 }}>

      {/* Sticky header */}
      <div style={{ position:'sticky', top:0, zIndex:40,
        background:'rgba(6,13,24,0.92)', backdropFilter:'blur(12px)',
        borderBottom:`1px solid ${WP.border}`, padding:'12px 20px' }}>
        <div style={{ maxWidth:640, margin:'0 auto' }}>
          <div style={{ display:'flex', justifyContent:'space-between',
            alignItems:'center', marginBottom:8 }}>
            <div>
              <div style={{ fontFamily:'"Space Grotesk",system-ui', fontSize:16,
                fontWeight:700, color:WP.text }}>
                {meta?.sessionName || 'Entrenamiento'}
              </div>
              {meta?.routineName && (
                <div style={{ fontFamily:'Inter,system-ui', fontSize:11, color:WP.muted }}>
                  {meta.routineName}
                </div>
              )}
            </div>
            <div style={{ display:'flex', gap:16, alignItems:'center' }}>
              <div style={{ textAlign:'right' }}>
                <div style={{ fontFamily:'ui-monospace,Menlo,monospace', fontSize:14,
                  fontWeight:700, color:WP.text }}>
                  {mins > 0 ? `${mins}:${String(secs).padStart(2,'0')}` : `${secs}s`}
                </div>
                <div style={{ fontFamily:'ui-monospace,Menlo,monospace', fontSize:9,
                  color:WP.muted }}>TIEMPO</div>
              </div>
              <div style={{ textAlign:'right' }}>
                <div style={{ fontFamily:'ui-monospace,Menlo,monospace', fontSize:14,
                  fontWeight:700, color: overallPct === 100 ? WP.green : WP.blue }}>
                  {overallPct}%
                </div>
                <div style={{ fontFamily:'ui-monospace,Menlo,monospace', fontSize:9,
                  color:WP.muted }}>SERIES</div>
              </div>
            </div>
          </div>
          {/* Overall progress bar */}
          <div style={{ height:3, borderRadius:999, background:'rgba(255,255,255,0.06)',
            overflow:'hidden' }}>
            <div style={{ height:'100%', width:`${overallPct}%`, borderRadius:999,
              background: overallPct === 100 ? WP.green : WP.blue,
              transition:'width .4s ease' }} />
          </div>
        </div>
      </div>

      {/* Exercises */}
      <div style={{ maxWidth:640, margin:'0 auto', padding:'24px 16px 0' }}>

        {exercises.map((ex, ei) => (
          <ExerciseCard
            key={ex.id || ei}
            exercise={ex}
            exIdx={ei}
            onSetUpdate={handleSetUpdate}
            onSetComplete={handleSetComplete}
            timer={timer}
            onTimerDone={handleTimerDone}
          />
        ))}

        {/* Finish button */}
        <button onClick={handleFinish}
          style={{ width:'100%', padding:'16px', borderRadius:14, border:'none',
            cursor:'pointer', marginTop:8,
            background: doneSets > 0
              ? 'linear-gradient(135deg, #22C55E, #16A34A)'
              : 'rgba(255,255,255,0.06)',
            color: doneSets > 0 ? '#fff' : WP.muted,
            fontFamily:'Inter,system-ui', fontSize:16, fontWeight:700,
            boxShadow: doneSets > 0 ? '0 4px 24px rgba(34,197,94,0.3)' : 'none',
            transition:'all .2s' }}>
          Finalizar entrenamiento
          {doneSets > 0 && (
            <span style={{ marginLeft:8, fontWeight:400, fontSize:13 }}>
              ({doneSets}/{totalSets} series)
            </span>
          )}
        </button>

        {doneSets === 0 && (
          <button onClick={() => navigate('/')}
            style={{ width:'100%', marginTop:10, padding:'12px', borderRadius:12,
              border:`1px solid ${WP.border}`, cursor:'pointer',
              background:'transparent', color:WP.muted,
              fontFamily:'Inter,system-ui', fontSize:14 }}>
            Cancelar
          </button>
        )}
      </div>
    </div>
  );
}

Object.assign(window, { WorkoutPlayerSection });
