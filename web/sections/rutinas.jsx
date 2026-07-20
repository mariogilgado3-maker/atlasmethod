// Mis Rutinas — saved routine templates (single source of truth: store.savedRoutines)
// View, load, rename, duplicate, delete, train, and export each routine to PDF.

const MR = {
  page:    '#060D18',
  panel:   '#0A1422',
  card:    '#0E1A2C',
  hov:     '#132134',
  border:  'rgba(255,255,255,0.07)',
  text:    '#E8EDF8',
  sub:     'rgba(232,237,248,0.55)',
  muted:   'rgba(232,237,248,0.28)',
  blue:    '#3B82F6',
  blueDim: 'rgba(59,130,246,0.12)',
  green:   '#22C55E',
  amber:   '#F59E0B',
  red:     '#EF4444',
};

const AR_KEY_MR = 'atlas.routine.active.v1';

function mrFmtDate(ts) {
  if (!ts) return '';
  try { return new Date(ts).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' }); }
  catch { return ''; }
}

function mrExMuscles(ex) {
  if (!ex) return '';
  if (Array.isArray(ex.muscles)) return ex.muscles[0] || '';
  return ex.muscles?.primary?.[0] || '';
}

function mrCountExercises(routine) {
  return (routine.sessions || []).reduce((t, s) => t + (s.exercises || []).length, 0);
}

// Dropdown menu item style
function mrMenuItem(color) {
  return {
    display: 'block', width: '100%', textAlign: 'left',
    padding: '12px 14px', border: 'none', cursor: 'pointer', background: 'transparent',
    color, fontFamily: 'Inter,system-ui', fontSize: 13, fontWeight: 600,
  };
}

// ── Single routine card ─────────────────────────────────────────────────────
function MrRoutineCard({ routine, onTrain, onLoad, onPDF, onRename, onDuplicate, onDelete }) {
  const [open, setOpen]       = React.useState(false);
  const [editing, setEditing] = React.useState(false);
  const [name, setName]       = React.useState(routine.name || 'Rutina');
  const [menuOpen, setMenuOpen]     = React.useState(false);
  const [confirmDel, setConfirmDel] = React.useState(false);
  const menuBtnRef = React.useRef(null);

  const sessions = routine.sessions || [];
  const nEx = mrCountExercises(routine);
  const chips = [
    routine.objective,
    routine.split && String(routine.split).replace(/_/g, ' '),
    `${sessions.length} ${sessions.length === 1 ? 'sesión' : 'sesiones'}`,
    `${nEx} ejercicios`,
  ].filter(Boolean);

  function saveName() {
    setEditing(false);
    if (name.trim() && name.trim() !== routine.name) onRename(routine.id, name.trim());
    else setName(routine.name || 'Rutina');
  }

  const btn = (bg, color, border) => ({
    padding: '7px 12px', borderRadius: 8, cursor: 'pointer',
    background: bg, color, border: border || 'none',
    fontFamily: 'Inter,system-ui', fontSize: 12, fontWeight: 700, whiteSpace: 'nowrap',
  });

  return (
    <div style={{ borderRadius: 16, border: `1px solid ${MR.border}`, background: MR.card }}>
      <div style={{ padding: '16px 18px' }}>
        {/* Title row */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            {editing ? (
              <input
                autoFocus
                value={name}
                onChange={e => setName(e.target.value)}
                onBlur={saveName}
                onKeyDown={e => { if (e.key === 'Enter') saveName(); if (e.key === 'Escape') { setEditing(false); setName(routine.name); } }}
                style={{ width: '100%', background: MR.panel, border: `1px solid ${MR.blue}`, borderRadius: 8, color: MR.text, fontFamily: 'Inter,system-ui', fontSize: 16, fontWeight: 800, padding: '6px 10px' }}
              />
            ) : (
              <div style={{ fontFamily: 'Inter,system-ui', fontSize: 16, fontWeight: 800, color: MR.text, letterSpacing: -0.3, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {routine.name || 'Rutina'}
              </div>
            )}
            <div style={{ fontFamily: 'ui-monospace,Menlo,monospace', fontSize: 10, color: MR.muted, marginTop: 4 }}>
              {routine.source === 'coach' ? 'Coach' : routine.source === 'onboarding' ? 'Onboarding' : 'Manual'}
              {routine.savedAt ? ` · guardada ${mrFmtDate(routine.savedAt)}` : ''}
            </div>
          </div>
        </div>

        {/* Chips */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 12 }}>
          {chips.map((c, i) => (
            <span key={i} style={{ padding: '3px 9px', borderRadius: 999, background: MR.blueDim, color: '#93C5FD', fontFamily: 'Inter,system-ui', fontSize: 10, fontWeight: 600 }}>{c}</span>
          ))}
        </div>

        {/* Primary actions — destructive/edit actions live in the ⋯ menu so
            they can't be mis-tapped next to the train button */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 14, position: 'relative' }}>
          <button onClick={() => setOpen(o => !o)} style={btn('transparent', MR.sub, `1px solid ${MR.border}`)}>
            {open ? 'Ocultar' : 'Ver sesiones'}
          </button>
          <button onClick={() => onLoad(routine)} style={btn(MR.blueDim, '#93C5FD', '1px solid rgba(59,130,246,0.25)')}>Cargar en Builder</button>
          {typeof exportRoutinePDF !== 'undefined' && (
            <button onClick={() => onPDF(routine)} style={btn('rgba(59,130,246,0.07)', '#93C5FD', '1px solid rgba(59,130,246,0.20)')}>↓ PDF</button>
          )}
          <div style={{ marginLeft: 'auto' }}>
            <button
              ref={menuBtnRef}
              aria-label="Más opciones"
              onClick={() => setMenuOpen(o => !o)}
              style={{ ...btn('transparent', MR.sub, `1px solid ${MR.border}`), padding: '7px 12px', fontSize: 15, lineHeight: 1 }}
            >⋯</button>
            {/* Portal menu — rendered on <body> so sibling cards / overflow-clip can't cover it */}
            <AtlasMenu open={menuOpen} anchorRef={menuBtnRef} onClose={() => setMenuOpen(false)} width={184}>
              <button onClick={() => { setMenuOpen(false); setEditing(true); setName(routine.name || 'Rutina'); }} style={mrMenuItem(MR.text)}>Renombrar</button>
              <button onClick={() => { setMenuOpen(false); onDuplicate(routine.id); }} style={mrMenuItem(MR.text)}>Duplicar</button>
              <button onClick={() => { setMenuOpen(false); setConfirmDel(true); }} style={mrMenuItem('#FCA5A5')}>Eliminar</button>
            </AtlasMenu>
          </div>
        </div>

        {/* Delete confirmation — explicit, irreversible */}
        {confirmDel && (
          <div style={{ marginTop: 12, padding: '14px 16px', borderRadius: 12, border: '1px solid rgba(239,68,68,0.30)', background: 'rgba(239,68,68,0.06)' }}>
            <div style={{ fontFamily: 'Inter,system-ui', fontSize: 13, fontWeight: 700, color: MR.text }}>
              ¿Eliminar «{routine.name || 'Rutina'}»?
            </div>
            <div style={{ fontFamily: 'Inter,system-ui', fontSize: 12, color: MR.sub, marginTop: 4, lineHeight: 1.5 }}>
              Esta acción no se puede deshacer. Tus sesiones ya registradas en el historial no se verán afectadas.
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
              <button onClick={() => onDelete(routine.id)} style={{ minHeight: 44, padding: '0 16px', borderRadius: 10, border: 'none', cursor: 'pointer', background: '#EF4444', color: '#fff', fontFamily: 'Inter,system-ui', fontSize: 13, fontWeight: 700 }}>Eliminar</button>
              <button onClick={() => setConfirmDel(false)} style={{ minHeight: 44, padding: '0 16px', borderRadius: 10, cursor: 'pointer', background: 'transparent', color: MR.sub, border: `1px solid ${MR.border}`, fontFamily: 'Inter,system-ui', fontSize: 13, fontWeight: 700 }}>Cancelar</button>
            </div>
          </div>
        )}
      </div>

      {/* Sessions (expandable) — each trainable */}
      {open && (
        <div style={{ borderTop: `1px solid ${MR.border}`, background: MR.panel, padding: '10px 12px', borderRadius: '0 0 15px 15px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {sessions.length === 0 && (
            <div style={{ fontFamily: 'Inter,system-ui', fontSize: 12, color: MR.muted, padding: '8px 6px' }}>Esta rutina no tiene sesiones.</div>
          )}
          {sessions.map((s, i) => (
            <div key={i} style={{ borderRadius: 12, border: `1px solid ${MR.border}`, background: MR.card, padding: '12px 14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontFamily: 'Inter,system-ui', fontSize: 13, fontWeight: 700, color: MR.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.name || `Día ${i + 1}`}</div>
                  <div style={{ fontFamily: 'ui-monospace,Menlo,monospace', fontSize: 10, color: MR.muted, marginTop: 2 }}>
                    {(s.exercises || []).length} ejercicios{s.totalSets ? ` · ${s.totalSets} series` : ''}{s.duration ? ` · ~${s.duration} min` : ''}
                  </div>
                </div>
                <button onClick={() => onTrain(routine, i)} style={{ padding: '8px 14px', borderRadius: 9, border: 'none', cursor: 'pointer', background: MR.green, color: '#04120A', fontFamily: 'Inter,system-ui', fontSize: 12, fontWeight: 800, flexShrink: 0 }}>▶ Entrenar</button>
              </div>
              {/* Exercise preview */}
              <div style={{ marginTop: 10, display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                {(s.exercises || []).slice(0, 8).map((ex, j) => (
                  <span key={j} style={{ padding: '3px 8px', borderRadius: 6, background: 'rgba(255,255,255,0.04)', color: MR.sub, fontFamily: 'Inter,system-ui', fontSize: 10 }}>
                    {ex.name}{mrExMuscles(ex) ? '' : ''}
                  </span>
                ))}
                {(s.exercises || []).length > 8 && (
                  <span style={{ padding: '3px 8px', color: MR.muted, fontFamily: 'Inter,system-ui', fontSize: 10 }}>+{(s.exercises || []).length - 8} más</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Section ─────────────────────────────────────────────────────────────────
function MisRutinasSection() {
  const { state, actions } = useStore();
  const { navigate } = useRoute();
  const routines = state.savedRoutines || [];

  function trainSession(routine, sessionIndex) {
    const session = (routine.sessions || [])[sessionIndex];
    if (!session || !(session.exercises || []).length) return;
    try {
      localStorage.setItem('atlas.pendingWorkout', JSON.stringify(session.exercises));
      localStorage.setItem('atlas.pendingWorkoutMeta', JSON.stringify({
        routineId: routine.id,
        routineName: routine.name,
        sessionName: session.name || `Día ${sessionIndex + 1}`,
        sessionIndex,
        totalSessions: (routine.sessions || []).length,
      }));
    } catch (e) {}
    navigate('/player');
  }

  function loadToBuilder(routine) {
    try { localStorage.setItem(AR_KEY_MR, JSON.stringify({ ...routine, updatedAt: Date.now() })); } catch (e) {}
    navigate('/builder');
  }

  function pdf(routine) {
    if (typeof exportRoutinePDF === 'undefined') return;
    try { exportRoutinePDF(routine); } catch (e) {}
  }

  return (
    <div style={{ minHeight: '100vh', background: MR.page, padding: '28px 20px 90px' }}>
      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 12, marginBottom: 22 }}>
          <div>
            <div style={{ fontFamily: 'Inter,system-ui', fontSize: 24, fontWeight: 800, color: MR.text, letterSpacing: -0.6 }}>Mis rutinas</div>
            <div style={{ fontFamily: 'Inter,system-ui', fontSize: 13, color: MR.sub, marginTop: 4 }}>
              {routines.length > 0 ? `${routines.length} ${routines.length === 1 ? 'rutina guardada' : 'rutinas guardadas'}` : 'Guarda rutinas del Coach o del Builder para reutilizarlas'}
            </div>
          </div>
          <button onClick={() => navigate('/builder')} style={{ padding: '10px 16px', borderRadius: 10, border: 'none', cursor: 'pointer', background: MR.blue, color: '#fff', fontFamily: 'Inter,system-ui', fontSize: 13, fontWeight: 700, flexShrink: 0 }}>+ Crear rutina</button>
        </div>

        {routines.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '64px 24px', borderRadius: 18, border: `1px dashed ${MR.border}`, background: MR.card }}>
            <div style={{ fontSize: 40, marginBottom: 14 }}>📋</div>
            <div style={{ fontFamily: 'Inter,system-ui', fontSize: 16, fontWeight: 700, color: MR.text, marginBottom: 8 }}>Todavía no tienes rutinas guardadas</div>
            <div style={{ fontFamily: 'Inter,system-ui', fontSize: 13, color: MR.sub, maxWidth: 420, margin: '0 auto 22px', lineHeight: 1.6 }}>
              Genera una rutina con Atlas Coach o créala en el Builder y pulsa «Guardar rutina» para tenerla aquí siempre lista.
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
              <button onClick={() => navigate('/coach')} style={{ padding: '11px 20px', borderRadius: 10, border: 'none', cursor: 'pointer', background: MR.blue, color: '#fff', fontFamily: 'Inter,system-ui', fontSize: 13, fontWeight: 700 }}>Hablar con Coach</button>
              <button onClick={() => navigate('/builder')} style={{ padding: '11px 20px', borderRadius: 10, cursor: 'pointer', background: 'transparent', color: MR.sub, border: `1px solid ${MR.border}`, fontFamily: 'Inter,system-ui', fontSize: 13, fontWeight: 700 }}>Abrir Builder</button>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {routines.map(r => (
              <MrRoutineCard
                key={r.id}
                routine={r}
                onTrain={trainSession}
                onLoad={loadToBuilder}
                onPDF={pdf}
                onRename={actions.renameRoutine}
                onDuplicate={actions.duplicateRoutine}
                onDelete={actions.deleteRoutine}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

Object.assign(window, { MisRutinasSection });
