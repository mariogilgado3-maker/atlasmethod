// Workout Mode v2 — Immersive single-exercise trainer

// ── Design tokens ─────────────────────────────────────────────────────────────
const WP = {
  page:     '#060D18',
  card:     '#0D1829',
  card2:    '#0A1422',
  border:   'rgba(255,255,255,0.08)',
  borderFocus: 'rgba(59,130,246,0.45)',
  text:     '#E8EDF8',
  sub:      'rgba(232,237,248,0.60)',
  muted:    'rgba(232,237,248,0.30)',
  blue:     '#3B82F6',
  blueD:    'rgba(59,130,246,0.18)',
  green:    '#22C55E',
  greenD:   'rgba(34,197,94,0.18)',
  amber:    '#F59E0B',
  red:      '#EF4444',
  input:    '#080F1C',
  overlay:  'rgba(4,8,16,0.92)',
};

// ── Utilities ─────────────────────────────────────────────────────────────────
function wpParseRest(str) {
  if (!str) return 90;
  const s = String(str).toLowerCase();
  const mM = s.match(/(\d+)(?:\s*-\s*\d+)?\s*min/);
  if (mM) return parseInt(mM[1]) * 60;
  const sR = s.match(/(\d+)\s*-\s*\d+\s*s/);
  if (sR) return parseInt(sR[1]);
  const sS = s.match(/(\d+)\s*s/);
  if (sS) return parseInt(sS[1]);
  return 90;
}

function wpFmt(secs) {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return m > 0 ? `${m}:${String(s).padStart(2,'0')}` : `${s}s`;
}

function wpNormalize(rawExs) {
  return rawExs.map((ex, i) => {
    const setsCount = ex.setsCount || (Array.isArray(ex.sets) ? ex.sets.length : 3);
    return {
      id:       ex.id    || `ex-${i}`,
      name:     ex.name  || 'Ejercicio',
      muscles:  Array.isArray(ex.muscles)
                  ? { primary: ex.muscles, secondary: [] }
                  : (ex.muscles || { primary: [], secondary: [] }),
      pattern:  ex.pattern  || '',
      repsRange: ex.repsRange || '8-12',
      rir:      ex.rir ?? 2,
      restSecs: wpParseRest(ex.rest),
      sets: Array.from({ length: setsCount }, (_, si) => {
        const src = Array.isArray(ex.sets) ? (ex.sets[si] || {}) : {};
        return {
          kg:        src.kg   !== undefined ? String(src.kg)   : '',
          reps:      src.reps !== undefined ? String(src.reps) : (ex.repsRange || '10').split('-')[0],
          rpe:       null,
          done:      false,
          completedAt: null,
        };
      }),
    };
  });
}

// ── Persistence ───────────────────────────────────────────────────────────────
const WP_SESSION_KEY = 'atlas.activesession.v2';

function wpSave(state) {
  try { localStorage.setItem(WP_SESSION_KEY, JSON.stringify({ ...state, savedAt: Date.now() })); } catch {}
}

function wpLoad() {
  try { return JSON.parse(localStorage.getItem(WP_SESSION_KEY) || 'null'); } catch { return null; }
}

function wpClear() {
  try { localStorage.removeItem(WP_SESSION_KEY); } catch {}
}

// ── Stepper Input ─────────────────────────────────────────────────────────────
function Stepper({ value, onChange, step = 1, min = 0, placeholder, unit, disabled }) {
  const num = parseFloat(value) || 0;
  const btn = (d) => ({
    onClick: () => !disabled && onChange(String(Math.max(min, Math.round((num + d) * 100) / 100))),
    style: {
      width: 34, height: 34, borderRadius: 8,
      border: `1px solid ${WP.border}`,
      background: disabled ? 'transparent' : 'rgba(255,255,255,0.05)',
      color: disabled ? WP.muted : WP.sub,
      cursor: disabled ? 'default' : 'pointer',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'Inter,system-ui', fontSize: 16, fontWeight: 700,
      flexShrink: 0, userSelect: 'none',
    },
  });

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
      <button {...btn(-step)}>−</button>
      <div style={{ position: 'relative', flex: 1 }}>
        <input
          type="number" inputMode="decimal"
          value={value}
          disabled={disabled}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          style={{
            width: '100%', textAlign: 'center', padding: '7px 4px',
            background: WP.input, border: `1px solid ${disabled ? WP.border : WP.borderFocus}`,
            borderRadius: 8, color: disabled ? WP.muted : WP.text,
            fontFamily: 'ui-monospace,Menlo,monospace', fontSize: 15, fontWeight: 700,
            outline: 'none',
          }}
        />
      </div>
      <button {...btn(+step)}>+</button>
      {unit && (
        <span style={{ fontFamily: 'ui-monospace,Menlo,monospace', fontSize: 10,
          color: WP.muted, width: 20 }}>{unit}</span>
      )}
    </div>
  );
}

// ── Rest Timer Modal ──────────────────────────────────────────────────────────
function RestTimerModal({ remaining, total, nextExName, onAdjust, onSkip, onPause, paused }) {
  const pct = total > 0 ? Math.max(0, remaining / total) : 0;
  const R = 70;
  const C = 2 * Math.PI * R;
  const urgent = remaining <= 10;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 200,
      background: WP.overlay, backdropFilter: 'blur(8px)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', padding: 24,
    }}>
      <div style={{
        width: '100%', maxWidth: 380,
        background: WP.card, borderRadius: 24,
        border: `1px solid ${WP.border}`,
        padding: '36px 28px 28px', textAlign: 'center',
      }}>
        <div style={{ fontFamily: 'ui-monospace,Menlo,monospace', fontSize: 10,
          fontWeight: 700, color: WP.muted, letterSpacing: 3, marginBottom: 24 }}>
          DESCANSO
        </div>

        {/* SVG ring */}
        <div style={{ position: 'relative', width: 168, height: 168, margin: '0 auto 28px' }}>
          <svg width="168" height="168" viewBox="0 0 168 168">
            <circle cx="84" cy="84" r={R} fill="none"
              stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
            <circle cx="84" cy="84" r={R} fill="none"
              stroke={urgent ? WP.red : (paused ? WP.amber : WP.blue)}
              strokeWidth="8" strokeLinecap="round"
              strokeDasharray={C} strokeDashoffset={C * (1 - pct)}
              transform="rotate(-90 84 84)"
              style={{ transition: 'stroke-dashoffset .9s linear, stroke .3s' }} />
          </svg>
          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{
              fontFamily: 'ui-monospace,Menlo,monospace',
              fontSize: 52, fontWeight: 800, lineHeight: 1,
              color: urgent ? WP.red : WP.text,
            }}>
              {wpFmt(remaining)}
            </span>
            {paused && (
              <span style={{ fontFamily: 'Inter,system-ui', fontSize: 11,
                color: WP.amber, marginTop: 4 }}>PAUSADO</span>
            )}
          </div>
        </div>

        {/* Next exercise hint */}
        {nextExName && (
          <div style={{ marginBottom: 20, padding: '10px 16px', borderRadius: 10,
            background: 'rgba(255,255,255,0.04)', border: `1px solid ${WP.border}` }}>
            <div style={{ fontFamily: 'ui-monospace,Menlo,monospace', fontSize: 9,
              color: WP.muted, letterSpacing: 1, marginBottom: 4 }}>SIGUIENTE</div>
            <div style={{ fontFamily: 'Inter,system-ui', fontSize: 13, fontWeight: 600,
              color: WP.sub }}>{nextExName}</div>
          </div>
        )}

        {/* Controls */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
          {[-15, +15].map(d => (
            <button key={d} onClick={() => onAdjust(d)}
              style={{ flex: 1, padding: '10px 0', borderRadius: 10,
                border: `1px solid ${WP.border}`, background: 'rgba(255,255,255,0.04)',
                color: WP.sub, cursor: 'pointer',
                fontFamily: 'ui-monospace,Menlo,monospace', fontSize: 13, fontWeight: 700 }}>
              {d > 0 ? '+15s' : '-15s'}
            </button>
          ))}
          <button onClick={onPause}
            style={{ flex: 1, padding: '10px 0', borderRadius: 10, border: 'none',
              background: paused ? WP.blue : 'rgba(255,255,255,0.08)',
              color: WP.text, cursor: 'pointer',
              fontFamily: 'Inter,system-ui', fontSize: 13, fontWeight: 600 }}>
            {paused ? '▶ Reanudar' : '⏸ Pausar'}
          </button>
        </div>

        <button onClick={onSkip}
          style={{ width: '100%', padding: '12px 0', borderRadius: 12, border: 'none',
            background: WP.green, color: '#fff', cursor: 'pointer',
            fontFamily: 'Inter,system-ui', fontSize: 14, fontWeight: 700,
            boxShadow: '0 4px 18px rgba(34,197,94,0.35)' }}>
          Continuar →
        </button>
      </div>
    </div>
  );
}

// ── Set Row ───────────────────────────────────────────────────────────────────
function WpSetRow({ idx, set, isNext, onUpdate, onComplete }) {
  const done = set.done;
  return (
    <div style={{
      borderRadius: 12,
      background: done ? 'rgba(34,197,94,0.06)' : isNext ? 'rgba(59,130,246,0.08)' : 'transparent',
      border: `1px solid ${done ? 'rgba(34,197,94,0.18)' : isNext ? 'rgba(59,130,246,0.22)' : WP.border}`,
      padding: '12px 14px', marginBottom: 8,
      transition: 'all .2s',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
        <div style={{
          width: 26, height: 26, borderRadius: 999, flexShrink: 0,
          background: done ? WP.greenD : isNext ? WP.blueD : 'rgba(255,255,255,0.06)',
          border: `1.5px solid ${done ? WP.green : isNext ? WP.blue : WP.border}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'ui-monospace,Menlo,monospace', fontSize: 11, fontWeight: 800,
          color: done ? WP.green : isNext ? WP.blue : WP.muted,
        }}>
          {done ? '✓' : idx + 1}
        </div>
        <span style={{ fontFamily: 'Inter,system-ui', fontSize: 12,
          color: done ? WP.green : isNext ? '#93C5FD' : WP.muted,
          fontWeight: done || isNext ? 600 : 400 }}>
          {done ? 'Completada' : isNext ? 'Serie activa' : `Serie ${idx + 1}`}
        </span>
        {set.completedAt && (
          <span style={{ marginLeft: 'auto', fontFamily: 'ui-monospace,Menlo,monospace',
            fontSize: 9, color: WP.muted }}>
            {new Date(set.completedAt).toLocaleTimeString('es-ES', { hour:'2-digit', minute:'2-digit' })}
          </span>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: 8 }}>
        <div>
          <div style={{ fontFamily: 'ui-monospace,Menlo,monospace', fontSize: 9,
            color: WP.muted, marginBottom: 5, letterSpacing: 1 }}>PESO</div>
          <Stepper value={set.kg} onChange={v => onUpdate({ kg: v })}
            step={2.5} min={0} placeholder="kg" unit="kg" disabled={done} />
        </div>

        <div>
          <div style={{ fontFamily: 'ui-monospace,Menlo,monospace', fontSize: 9,
            color: WP.muted, marginBottom: 5, letterSpacing: 1 }}>REPS</div>
          <Stepper value={set.reps} onChange={v => onUpdate({ reps: v })}
            step={1} min={1} placeholder="reps" disabled={done} />
        </div>

        <div>
          <div style={{ fontFamily: 'ui-monospace,Menlo,monospace', fontSize: 9,
            color: WP.muted, marginBottom: 5, letterSpacing: 1 }}>RPE</div>
          <select
            value={set.rpe === null ? '' : set.rpe}
            disabled={done}
            onChange={e => onUpdate({ rpe: e.target.value ? parseInt(e.target.value) : null })}
            style={{
              width: '100%', padding: '7px 6px', borderRadius: 8,
              background: WP.input, border: `1px solid ${done ? WP.border : WP.borderFocus}`,
              color: set.rpe !== null ? WP.text : WP.muted,
              fontFamily: 'ui-monospace,Menlo,monospace', fontSize: 13,
              outline: 'none',
            }}>
            <option value="">—</option>
            {[6,7,8,9,10].map(v => <option key={v} value={v}>{v}</option>)}
          </select>
        </div>

        <div style={{ display: 'flex', alignItems: 'flex-end' }}>
          <button
            onClick={onComplete}
            disabled={done}
            style={{
              padding: '7px 14px', borderRadius: 8, border: 'none',
              cursor: done ? 'default' : 'pointer',
              background: done ? 'rgba(34,197,94,0.12)' : WP.green,
              color: done ? WP.green : '#fff',
              fontFamily: 'Inter,system-ui', fontSize: 12, fontWeight: 700,
              boxShadow: !done ? '0 3px 12px rgba(34,197,94,0.30)' : 'none',
              whiteSpace: 'nowrap', transition: 'all .15s',
            }}>
            {done ? '✓ OK' : '✓ Hecho'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Exercise View ─────────────────────────────────────────────────────────────
function WpExerciseView({ exercise, exIdx, totalExs, onSetUpdate, onSetComplete }) {
  const primary   = exercise.muscles?.primary   || [];
  const secondary = exercise.muscles?.secondary || [];
  const doneSets  = exercise.sets.filter(s => s.done).length;
  const totalSets = exercise.sets.length;
  const nextUndone = exercise.sets.findIndex(s => !s.done);
  const allDone   = doneSets === totalSets;

  return (
    <div style={{ maxWidth: 580, margin: '0 auto', padding: '20px 16px 120px' }}>

      {/* Exercise identity */}
      <div style={{ marginBottom: 22 }}>
        <div style={{ fontFamily: 'ui-monospace,Menlo,monospace', fontSize: 9,
          color: WP.muted, letterSpacing: 2, marginBottom: 8 }}>
          EJERCICIO {exIdx + 1} DE {totalExs}
        </div>

        <div style={{ fontFamily: '"Space Grotesk",Inter,system-ui', fontSize: 26,
          fontWeight: 800, color: WP.text, lineHeight: 1.2, marginBottom: 12 }}>
          {exercise.name}
        </div>

        {/* Muscle badges */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {primary.map((m, i) => (
            <span key={`p${i}`} style={{
              padding: '3px 10px', borderRadius: 999, fontSize: 11, fontWeight: 600,
              background: 'rgba(59,130,246,0.15)',
              border: '1px solid rgba(59,130,246,0.25)',
              color: '#93C5FD', fontFamily: 'Inter,system-ui',
            }}>{m}</span>
          ))}
          {secondary.slice(0,2).map((m, i) => (
            <span key={`s${i}`} style={{
              padding: '3px 10px', borderRadius: 999, fontSize: 11,
              background: 'rgba(255,255,255,0.05)', border: `1px solid ${WP.border}`,
              color: WP.muted, fontFamily: 'Inter,system-ui',
            }}>{m}</span>
          ))}
        </div>
      </div>

      {/* Targets */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 20 }}>
        {[
          { label: 'SERIES', value: totalSets },
          { label: 'REPS',   value: exercise.repsRange || '8-12' },
          { label: 'RIR',    value: exercise.rir ?? 2 },
          { label: 'DESCANSO', value: wpFmt(exercise.restSecs) },
        ].map(t => (
          <div key={t.label} style={{
            background: WP.card2, borderRadius: 10,
            border: `1px solid ${WP.border}`,
            padding: '10px 12px', textAlign: 'center',
          }}>
            <div style={{ fontFamily: 'ui-monospace,Menlo,monospace', fontSize: 16,
              fontWeight: 800, color: WP.text, marginBottom: 3 }}>{t.value}</div>
            <div style={{ fontFamily: 'ui-monospace,Menlo,monospace', fontSize: 8,
              color: WP.muted, letterSpacing: 1 }}>{t.label}</div>
          </div>
        ))}
      </div>

      {/* Sets */}
      <div style={{ marginBottom: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between',
          alignItems: 'center', marginBottom: 12 }}>
          <span style={{ fontFamily: 'Inter,system-ui', fontSize: 13,
            fontWeight: 700, color: WP.sub }}>Series</span>
          <span style={{ fontFamily: 'ui-monospace,Menlo,monospace', fontSize: 12,
            color: allDone ? WP.green : WP.blue, fontWeight: 700 }}>
            {doneSets}/{totalSets}
          </span>
        </div>

        {exercise.sets.map((set, si) => (
          <WpSetRow
            key={si}
            idx={si}
            set={set}
            isNext={si === nextUndone}
            onUpdate={patch => onSetUpdate(exIdx, si, patch)}
            onComplete={() => onSetComplete(exIdx, si)}
          />
        ))}
      </div>

      {allDone && (
        <div style={{ padding: '14px 18px', borderRadius: 12, textAlign: 'center',
          background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.20)' }}>
          <span style={{ fontFamily: 'Inter,system-ui', fontSize: 14, fontWeight: 700,
            color: WP.green }}>
            ✓ Ejercicio completado
          </span>
        </div>
      )}
    </div>
  );
}

// ── Session Header ────────────────────────────────────────────────────────────
function WpSessionHeader({ meta, exIdx, totalExs, elapsed, doneSets, totalSets }) {
  const pct = totalSets > 0 ? Math.round((doneSets / totalSets) * 100) : 0;

  return (
    <div style={{
      position: 'sticky', top: 0, zIndex: 100,
      background: 'rgba(6,13,24,0.94)', backdropFilter: 'blur(16px)',
      borderBottom: `1px solid ${WP.border}`,
    }}>
      <div style={{ maxWidth: 580, margin: '0 auto', padding: '10px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', marginBottom: 8 }}>

          <div style={{ minWidth: 0 }}>
            <div style={{ fontFamily: '"Space Grotesk",system-ui', fontSize: 14,
              fontWeight: 700, color: WP.text,
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {meta?.sessionName || meta?.routineName || 'Entrenamiento'}
            </div>
            {meta?.objective && (
              <div style={{ fontFamily: 'Inter,system-ui', fontSize: 10,
                color: WP.muted, marginTop: 1 }}>{meta.objective}</div>
            )}
          </div>

          <div style={{ display: 'flex', gap: 20, flexShrink: 0 }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'ui-monospace,Menlo,monospace', fontSize: 13,
                fontWeight: 700, color: WP.text }}>{wpFmt(elapsed)}</div>
              <div style={{ fontFamily: 'ui-monospace,Menlo,monospace', fontSize: 8,
                color: WP.muted, letterSpacing: 1 }}>TIEMPO</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'ui-monospace,Menlo,monospace', fontSize: 13,
                fontWeight: 700, color: pct === 100 ? WP.green : WP.blue }}>{pct}%</div>
              <div style={{ fontFamily: 'ui-monospace,Menlo,monospace', fontSize: 8,
                color: WP.muted, letterSpacing: 1 }}>SERIES</div>
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div style={{ height: 3, borderRadius: 999,
          background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
          <div style={{ height: '100%', borderRadius: 999,
            width: `${pct}%`, background: pct === 100 ? WP.green : WP.blue,
            transition: 'width .4s ease' }} />
        </div>
      </div>
    </div>
  );
}

// ── Exercise Nav Bar ──────────────────────────────────────────────────────────
function WpNavBar({ exIdx, totalExs, allDone, curExDone, onPrev, onNext, onFinish }) {
  const isFirst = exIdx === 0;
  const isLast  = exIdx === totalExs - 1;
  const btnBase = {
    flex: 1, padding: '13px 0', borderRadius: 12,
    cursor: 'pointer', fontFamily: 'Inter,system-ui',
    fontSize: 14, fontWeight: 700, border: 'none', transition: 'all .15s',
  };

  return (
    <div style={{
      position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 90,
      background: 'rgba(6,13,24,0.96)', backdropFilter: 'blur(16px)',
      borderTop: `1px solid ${WP.border}`,
      padding: '12px 16px 20px',
    }}>
      <div style={{ maxWidth: 580, margin: '0 auto' }}>
        {/* Dot indicator */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginBottom: 12 }}>
          {Array.from({ length: totalExs }, (_, i) => (
            <div key={i} style={{
              width: i === exIdx ? 20 : 6, height: 6, borderRadius: 999,
              background: i === exIdx ? WP.blue : i < exIdx ? WP.green : 'rgba(255,255,255,0.15)',
              transition: 'all .25s',
            }} />
          ))}
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          {!isFirst && (
            <button onClick={onPrev} style={{ ...btnBase, flex: 0.6,
              background: 'rgba(255,255,255,0.06)',
              border: `1px solid ${WP.border}`, color: WP.sub }}>
              ← Anterior
            </button>
          )}

          {!isLast ? (
            <button onClick={onNext} style={{ ...btnBase,
              background: curExDone ? WP.blue : 'rgba(255,255,255,0.07)',
              color: curExDone ? '#fff' : WP.sub,
              boxShadow: curExDone ? '0 4px 18px rgba(59,130,246,0.35)' : 'none',
              border: curExDone ? 'none' : `1px solid ${WP.border}` }}>
              Siguiente →
            </button>
          ) : (
            <button onClick={onFinish} style={{ ...btnBase,
              background: allDone
                ? 'linear-gradient(135deg, #22C55E, #16A34A)'
                : 'rgba(255,255,255,0.07)',
              color: allDone ? '#fff' : WP.sub, border: 'none',
              boxShadow: allDone ? '0 4px 20px rgba(34,197,94,0.35)' : 'none' }}>
              {allDone ? '🏆 Finalizar entrenamiento' : 'Finalizar'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Finish Screen ─────────────────────────────────────────────────────────────
function WpFinishScreen({ meta, exercises, duration, navigate }) {
  const completedSets  = exercises.reduce((t, ex) => t + ex.sets.filter(s => s.done).length, 0);
  const totalSets      = exercises.reduce((t, ex) => t + ex.sets.length, 0);
  const totalVolume    = exercises.reduce((t, ex) =>
    t + ex.sets.filter(s => s.done).reduce((v, s) =>
      v + (parseFloat(s.kg) || 0) * (parseInt(s.reps) || 0), 0), 0);
  const muscles        = [...new Set(exercises.flatMap(ex => ex.muscles?.primary || []))];
  const rpeValues      = exercises.flatMap(ex => ex.sets.filter(s => s.done && s.rpe !== null).map(s => s.rpe));
  const avgRpe         = rpeValues.length > 0
    ? (rpeValues.reduce((a, b) => a + b, 0) / rpeValues.length).toFixed(1)
    : null;

  const stats = [
    { label: 'DURACIÓN',  value: wpFmt(duration) },
    { label: 'SERIES',    value: `${completedSets}/${totalSets}` },
    { label: 'VOLUMEN',   value: totalVolume > 0 ? `${Math.round(totalVolume)} kg` : '—' },
    { label: 'RPE MEDIO', value: avgRpe ?? '—' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: WP.page,
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', padding: '32px 16px' }}>
      <div style={{ maxWidth: 480, width: '100%', textAlign: 'center' }}>

        <div style={{ fontSize: 64, marginBottom: 16 }}>🏆</div>

        <div style={{ fontFamily: '"Space Grotesk",system-ui', fontSize: 30,
          fontWeight: 800, color: WP.text, marginBottom: 6 }}>
          ¡Sesión completada!
        </div>

        {(meta?.sessionName || meta?.routineName) && (
          <div style={{ fontFamily: 'Inter,system-ui', fontSize: 14,
            color: WP.sub, marginBottom: 28 }}>
            {meta.sessionName || meta.routineName}
          </div>
        )}

        {/* Stats grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
          {stats.map(s => (
            <div key={s.label} style={{ background: WP.card, borderRadius: 14,
              border: `1px solid ${WP.border}`, padding: '18px 14px' }}>
              <div style={{ fontFamily: '"Space Grotesk",system-ui', fontSize: 24,
                fontWeight: 800, color: WP.text, marginBottom: 4 }}>{s.value}</div>
              <div style={{ fontFamily: 'ui-monospace,Menlo,monospace', fontSize: 9,
                color: WP.muted, letterSpacing: 1.2 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Gems */}
        <div style={{ padding: '12px 18px', borderRadius: 12, marginBottom: 20,
          background: 'rgba(59,130,246,0.10)', border: '1px solid rgba(59,130,246,0.20)' }}>
          <span style={{ fontFamily: 'Inter,system-ui', fontSize: 15, fontWeight: 700,
            color: '#93C5FD' }}>+ 30 💎 Gemas ganadas</span>
        </div>

        {/* Muscles */}
        {muscles.length > 0 && (
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontFamily: 'ui-monospace,Menlo,monospace', fontSize: 9,
              color: WP.muted, letterSpacing: 1.5, marginBottom: 8 }}>MÚSCULOS ENTRENADOS</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, justifyContent: 'center' }}>
              {muscles.map((m, i) => (
                <span key={i} style={{ padding: '4px 12px', borderRadius: 999,
                  background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.22)',
                  color: '#93C5FD', fontFamily: 'Inter,system-ui', fontSize: 12 }}>{m}</span>
              ))}
            </div>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <button onClick={() => navigate('/coach')}
            style={{ padding: '14px', borderRadius: 12, border: 'none',
              cursor: 'pointer', background: WP.blue, color: '#fff',
              fontFamily: 'Inter,system-ui', fontSize: 15, fontWeight: 700,
              boxShadow: '0 4px 20px rgba(59,130,246,0.35)' }}>
            Ver recomendaciones de Coach
          </button>
          <button onClick={() => navigate('/progreso')}
            style={{ padding: '14px', borderRadius: 12,
              border: `1px solid ${WP.border}`, cursor: 'pointer',
              background: 'rgba(255,255,255,0.04)', color: WP.sub,
              fontFamily: 'Inter,system-ui', fontSize: 15, fontWeight: 600 }}>
            Ver mi progreso
          </button>
          <button onClick={() => navigate('/')}
            style={{ padding: '14px', borderRadius: 12,
              border: 'none', cursor: 'pointer',
              background: 'transparent', color: WP.muted,
              fontFamily: 'Inter,system-ui', fontSize: 14 }}>
            Volver al inicio
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
function WorkoutPlayerSection() {
  const { navigate }  = useRoute();
  const { state, actions } = useStore();

  // ── Core state ─────────────────────────────────────────────────────────────
  const [exercises,  setExercises]  = useState(null);   // null = loading
  const [meta,       setMeta]       = useState({});
  const [exIdx,      setExIdx]      = useState(0);
  const [restState,  setRestState]  = useState(null);   // { total, remaining, paused }
  const [finished,   setFinished]   = useState(false);
  const [elapsed,    setElapsed]    = useState(0);

  const startRef  = useRef(Date.now());
  const tickRef   = useRef(null);
  const restRef   = useRef(null);

  // ── Load on mount ───────────────────────────────────────────────────────────
  useEffect(() => {
    // 1. Resume from persisted active session
    const saved = wpLoad();
    if (saved?.exercises?.length > 0 && saved.status === 'active') {
      setExercises(saved.exercises);
      setMeta(saved.meta || {});
      setExIdx(saved.exIdx || 0);
      if (saved.startTime) startRef.current = saved.startTime;
      return;
    }

    // 2. Load from pendingWorkout
    let raw     = null;
    let metaRaw = null;
    try {
      raw     = JSON.parse(localStorage.getItem('atlas.pendingWorkout') || 'null');
      metaRaw = JSON.parse(localStorage.getItem('atlas.pendingWorkoutMeta') || 'null');
      if (raw) {
        localStorage.removeItem('atlas.pendingWorkout');
        localStorage.removeItem('atlas.pendingWorkoutMeta');
      }
    } catch {}

    // 3. Fallback: first session of active routine
    if (!raw || !Array.isArray(raw) || raw.length === 0) {
      try {
        const routine = typeof arLoad === 'function' ? arLoad() : null;
        if (routine?.sessions?.[0]?.exercises?.length > 0) {
          raw = routine.sessions[0].exercises;
          metaRaw = metaRaw || {
            routineId:   routine.id,
            routineName: routine.name,
            sessionName: routine.sessions[0].name,
            objective:   routine.objective,
          };
        }
      } catch {}
    }

    if (!raw || !Array.isArray(raw) || raw.length === 0) {
      setExercises([]);
      return;
    }

    const norm = wpNormalize(raw);
    setExercises(norm);
    setMeta(metaRaw || {});
    startRef.current = Date.now();
  }, []);

  // ── Elapsed ticker ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!exercises?.length || finished) return;
    tickRef.current = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startRef.current) / 1000));
    }, 1000);
    return () => clearInterval(tickRef.current);
  }, [exercises, finished]);

  // ── Rest countdown ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!restState || restState.paused) {
      clearInterval(restRef.current);
      return;
    }
    restRef.current = setInterval(() => {
      setRestState(prev => {
        if (!prev || prev.paused) return prev;
        if (prev.remaining <= 1) {
          clearInterval(restRef.current);
          try { navigator.vibrate?.(200); } catch {}
          return null;
        }
        return { ...prev, remaining: prev.remaining - 1 };
      });
    }, 1000);
    return () => clearInterval(restRef.current);
  }, [restState?.paused, restState?.remaining !== undefined ? 'on' : 'off']);

  // ── Auto-save ───────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!exercises) return;
    wpSave({ exercises, meta, exIdx, startTime: startRef.current, status: 'active' });
  }, [exercises, exIdx]);

  // ── Handlers ─────────────────────────────────────────────────────────────────
  const handleSetUpdate = useCallback((eIdx, sIdx, patch) => {
    setExercises(prev => prev.map((ex, ei) => ei !== eIdx ? ex : {
      ...ex,
      sets: ex.sets.map((s, si) => si !== sIdx ? s : { ...s, ...patch }),
    }));
  }, []);

  const handleSetComplete = useCallback((eIdx, sIdx) => {
    setExercises(prev => {
      const next = prev.map((ex, ei) => ei !== eIdx ? ex : {
        ...ex,
        sets: ex.sets.map((s, si) => si !== sIdx ? s : {
          ...s, done: true, completedAt: Date.now(),
        }),
      });

      // Check if we should start rest timer
      const ex       = next[eIdx];
      const moreSets = ex.sets.slice(sIdx + 1).some(s => !s.done);
      if (moreSets) {
        setRestState({ total: ex.restSecs, remaining: ex.restSecs, paused: false });
      }

      return next;
    });
  }, []);

  const handleFinish = useCallback(() => {
    clearInterval(tickRef.current);
    clearInterval(restRef.current);
    const finalDuration = Math.floor((Date.now() - startRef.current) / 1000);
    setElapsed(finalDuration);

    const completedExs = (exercises || []).map(ex => ({
      id:      ex.id,
      name:    ex.name,
      group:   ex.pattern || '',
      muscles: [
        ...(ex.muscles?.primary   || []),
        ...(ex.muscles?.secondary || []),
      ].filter(Boolean),
      sets: ex.sets.filter(s => s.done).map(s => ({
        kg:   parseFloat(s.kg)  || 0,
        reps: parseInt(s.reps)  || 0,
        rpe:  s.rpe,
      })),
    })).filter(ex => ex.sets.length > 0);

    actions.logSession(completedExs, {
      duration:    finalDuration,
      routineName: meta?.routineName,
      sessionName: meta?.sessionName,
    });

    wpClear();
    setFinished(true);
  }, [exercises, meta, actions]);

  // ── Render gates ─────────────────────────────────────────────────────────────
  if (exercises === null) {
    return (
      <div style={{ minHeight: '100vh', background: WP.page,
        display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 28, height: 28, borderRadius: '50%',
          border: '2px solid rgba(255,255,255,0.1)',
          borderTopColor: WP.blue, animation: 'spin .7s linear infinite' }} />
      </div>
    );
  }

  if (exercises.length === 0) {
    return (
      <div style={{ minHeight: '100vh', background: WP.page, display: 'flex',
        flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 32 }}>
        <div style={{ fontFamily: '"Space Grotesk",system-ui', fontSize: 22,
          fontWeight: 700, color: WP.text, marginBottom: 8, textAlign: 'center' }}>
          No hay entrenamiento activo
        </div>
        <div style={{ fontFamily: 'Inter,system-ui', fontSize: 14, color: WP.sub,
          marginBottom: 28, textAlign: 'center' }}>
          Genera una rutina en Coach o Builder para empezar.
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%', maxWidth: 280 }}>
          <button onClick={() => navigate('/coach')}
            style={{ padding: '13px', borderRadius: 12, border: 'none', cursor: 'pointer',
              background: WP.blue, color: '#fff',
              fontFamily: 'Inter,system-ui', fontSize: 15, fontWeight: 700 }}>
            Ir a Atlas Coach
          </button>
          <button onClick={() => navigate('/builder')}
            style={{ padding: '13px', borderRadius: 12,
              border: `1px solid ${WP.border}`, cursor: 'pointer',
              background: 'transparent', color: WP.sub,
              fontFamily: 'Inter,system-ui', fontSize: 14 }}>
            Ir al Builder
          </button>
        </div>
      </div>
    );
  }

  if (finished) {
    return (
      <WpFinishScreen
        meta={meta}
        exercises={exercises}
        duration={elapsed}
        navigate={navigate}
      />
    );
  }

  // ── Active workout ─────────────────────────────────────────────────────────
  const curEx      = exercises[exIdx];
  const doneSets   = exercises.reduce((t, ex) => t + ex.sets.filter(s => s.done).length, 0);
  const totalSets  = exercises.reduce((t, ex) => t + ex.sets.length, 0);
  const curExDone  = curEx?.sets.every(s => s.done) ?? false;
  const allDone    = doneSets === totalSets;
  const nextExName = exercises[exIdx + 1]?.name || null;

  return (
    <div style={{ minHeight: '100vh', background: WP.page }}>

      <WpSessionHeader
        meta={meta}
        exIdx={exIdx}
        totalExs={exercises.length}
        elapsed={elapsed}
        doneSets={doneSets}
        totalSets={totalSets}
      />

      <WpExerciseView
        key={exIdx}
        exercise={curEx}
        exIdx={exIdx}
        totalExs={exercises.length}
        onSetUpdate={handleSetUpdate}
        onSetComplete={handleSetComplete}
      />

      <WpNavBar
        exIdx={exIdx}
        totalExs={exercises.length}
        allDone={allDone}
        curExDone={curExDone}
        onPrev={() => setExIdx(i => Math.max(0, i - 1))}
        onNext={() => setExIdx(i => Math.min(exercises.length - 1, i + 1))}
        onFinish={handleFinish}
      />

      {restState && (
        <RestTimerModal
          remaining={restState.remaining}
          total={restState.total}
          paused={restState.paused}
          nextExName={curExDone ? nextExName : null}
          onAdjust={d => setRestState(prev =>
            prev ? { ...prev, remaining: Math.max(0, prev.remaining + d) } : null)}
          onPause={() => setRestState(prev =>
            prev ? { ...prev, paused: !prev.paused } : null)}
          onSkip={() => { clearInterval(restRef.current); setRestState(null); }}
        />
      )}
    </div>
  );
}

Object.assign(window, { WorkoutPlayerSection });
