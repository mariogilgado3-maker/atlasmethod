// Atlas Coach — Conversational Chat Interface

// ── Design tokens ─────────────────────────────────────────────────────────────
const AC = {
  page:    '#060D18',
  sidebar: '#06111F',
  card:    '#0E1A2C',
  hover:   '#132134',
  border:  'rgba(255,255,255,0.07)',
  text:    '#E8EDF8',
  sub:     'rgba(232,237,248,0.55)',
  muted:   'rgba(232,237,248,0.28)',
  blue:    '#3B82F6',
  green:   '#22C55E',
  input:   '#0A1422',
};

// ── Exercise grouping (mirrors builder logic) ─────────────────────────────────
function acExGroup(ex) {
  const p = ex.pattern || '';
  if (p === 'empuje-horizontal') return 'pecho';
  if (p === 'empuje-vertical')
    return (ex.muscles?.primary?.[0] || '').includes('Tríceps') ? 'triceps' : 'hombro';
  if (p === 'traccion-horizontal')
    return (ex.muscles?.primary?.[0] || '').includes('Deltoides') ? 'hombro' : 'espalda';
  if (p === 'traccion-vertical') {
    const pm = ex.muscles?.primary?.[0] || '';
    return (pm.includes('Bíceps') || pm.includes('Braquial')) ? 'biceps' : 'espalda';
  }
  if (p === 'sentadilla' || p === 'aislamiento-pantorrilla') return 'piernas';
  if (p === 'bisagra') return 'gluteos';
  if (p.startsWith('core')) return 'core';
  return 'core';
}

// ── Context builder ───────────────────────────────────────────────────────────
function acBuildContext(state) {
  const log      = state.log || [];
  const sessions = state.sessions || {};
  const weekAgo  = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const recent   = log.filter(s => s.dateTs > weekAgo);

  const muscleVol = {};
  recent.forEach(s => {
    (s.exercises || []).forEach(ex => {
      (ex.muscles || []).forEach(m => {
        const k = m.toLowerCase();
        muscleVol[k] = (muscleVol[k] || 0) + (ex.sets?.length || 1);
      });
    });
  });

  const sum = re => Object.entries(muscleVol).reduce((t, [k, v]) => t + (re.test(k) ? v : 0), 0);
  const pushVol = sum(/pectoral|tr[íi]ceps|deltoides ant/);
  const pullVol = sum(/dorsal|b[íi]ceps|romboides|braquial/);
  const legVol  = sum(/cu[áa]driceps|isquios|gl[úu]teos/);
  const daysSinceLast = log[0]?.dateTs
    ? Math.floor((Date.now() - log[0].dateTs) / (1000 * 60 * 60 * 24))
    : 99;

  return { log, sessions, muscleVol, pushVol, pullVol, legVol, daysSinceLast, recent };
}

// ── Intent detection ──────────────────────────────────────────────────────────
function acDetectIntent(text) {
  const t = text.toLowerCase();
  if (/rutina|entrenamiento|ejercicio|sesi[oó]n|workout|entrena|plan|d[íi]a de/.test(t)) return 'routine';
  if (/dolor|lesi[oó]n|molestia|duele|lastim|herido|me duele/.test(t)) return 'pain';
  if (/estancado|plateau|no progres|no avanzo|no mejoro|mismo peso|igual que/.test(t)) return 'plateau';
  if (/series|volumen|cu[aá]ntas|cantidad|suficiente|m[aá]ximo/.test(t)) return 'volume';
  if (/analiza|an[aá]lisis|c[oó]mo voy|qu[eé] tal|progreso|historial|revisar|c[oó]mo est[aá]/.test(t)) return 'analysis';
  if (/hola|buenos|buenas|hey|qu[eé] hay/.test(t)) return 'greeting';
  return 'general';
}

// ── Routine builder ───────────────────────────────────────────────────────────
function acBuildRoutine(splitType, goal, allExs) {
  const byGroup = {};
  allExs.forEach(ex => {
    const g = acExGroup(ex);
    if (!byGroup[g]) byGroup[g] = [];
    byGroup[g].push(ex);
  });

  const reps = goal === 'fuerza' ? '5' : '10';
  function pick(group, n) {
    return (byGroup[group] || []).slice(0, n).map(ex => ({
      ...ex,
      sets: [{ kg: '', reps }, { kg: '', reps }, { kg: '', reps }],
    }));
  }

  if (splitType === 'fullbody') {
    return [{
      name: 'Full Body',
      exercises: [
        ...pick('piernas', 1), ...pick('gluteos', 1),
        ...pick('pecho', 1), ...pick('espalda', 1),
        ...pick('hombro', 1), ...pick('core', 1),
      ].filter(e => e && e.id),
    }];
  }

  if (splitType === 'ppl') {
    return [
      { name: 'Push — Empuje', exercises: [...pick('pecho', 2), ...pick('hombro', 1), ...pick('triceps', 1)].filter(e => e && e.id) },
      { name: 'Pull — Tracción', exercises: [...pick('espalda', 2), ...pick('biceps', 1)].filter(e => e && e.id) },
      { name: 'Legs — Piernas', exercises: [...pick('piernas', 2), ...pick('gluteos', 1), ...pick('core', 1)].filter(e => e && e.id) },
    ];
  }

  if (splitType === 'upper_lower') {
    return [
      { name: 'Upper — Tren superior', exercises: [...pick('pecho', 2), ...pick('espalda', 2), ...pick('hombro', 1)].filter(e => e && e.id) },
      { name: 'Lower — Tren inferior', exercises: [...pick('piernas', 2), ...pick('gluteos', 1), ...pick('core', 2)].filter(e => e && e.id) },
    ];
  }

  return [];
}

// ── Response generator ────────────────────────────────────────────────────────
function acGenerateResponse(userText, state, allExs) {
  const intent = acDetectIntent(userText);
  const ctx    = acBuildContext(state);
  const t      = userText.toLowerCase();

  if (intent === 'greeting') {
    const text = ctx.log.length > 0
      ? `Hola. Llevas ${ctx.log.length} sesiones registradas${ctx.daysSinceLast < 99 ? ` — última hace ${ctx.daysSinceLast === 0 ? 'hoy' : ctx.daysSinceLast === 1 ? 'ayer' : `${ctx.daysSinceLast} días`}` : ''}. ¿En qué te ayudo?`
      : `Hola. Soy Atlas Coach. Puedo generarte rutinas, analizar tu historial o responder dudas de entrenamiento. ¿Por dónde empezamos?`;
    return { type: 'text', text };
  }

  if (intent === 'analysis') {
    if (ctx.log.length === 0) {
      return { type: 'text', text: 'Todavía no tienes sesiones registradas. Guarda una rutina en el Builder y podré analizarte con datos reales.' };
    }
    const lines = [`He revisado tus últimas ${Math.min(ctx.log.length, 8)} sesiones.`];
    if (ctx.pushVol > ctx.pullVol * 1.4 && ctx.pushVol > 3) {
      lines.push(`Entrenas más empuje que tracción (${ctx.pushVol} vs ${ctx.pullVol} series esta semana). A largo plazo eso carga los hombros. Añade más espalda.`);
    } else if (ctx.pullVol > 0 && ctx.pushVol > 0) {
      lines.push('El equilibrio entre pecho y espalda está bien.');
    }
    if (ctx.daysSinceLast > 4) {
      lines.push(`Llevas ${ctx.daysSinceLast} días sin entrenar. Si fue descanso intencional, bien. Si no, es momento de volver.`);
    }
    if (ctx.sessions?.streak >= 3) {
      lines.push(`${ctx.sessions.streak} días de racha. Eso marca la diferencia.`);
    }
    if (ctx.recent.length === 0 && ctx.log.length > 0) {
      lines.push('Esta semana no tienes sesiones registradas.');
    }
    lines.push('¿Quieres que te genere una rutina para hoy?');
    return { type: 'text', text: lines.join(' ') };
  }

  if (intent === 'pain') {
    return { type: 'text', text: 'Si hay dolor durante el ejercicio, lo primero es parar ese movimiento. Cuéntame dónde duele y cuándo aparece — ¿durante el movimiento, después, o en reposo? Con eso puedo sugerirte alternativas o decirte si conviene que lo vea alguien.' };
  }

  if (intent === 'plateau') {
    return { type: 'text', text: 'Un estancamiento casi siempre se resuelve con una de estas tres cosas: añadir series (si llevas semanas sin cambiar el volumen), subir carga (si siempre terminas con energía), o descansar (si llevas muchas semanas seguidas sin un deload). ¿Cuánto tiempo llevas con el mismo peso o las mismas repeticiones?' };
  }

  if (intent === 'volume') {
    return { type: 'text', text: 'Para hipertrofia, la mayoría de músculos responden bien con 10–20 series por semana repartidas en 2 o más sesiones. Si estás en el límite inferior, añadir series es la palanca más fácil. Si ya superas 20, el problema suele ser la recuperación, no el volumen. ¿Quieres que revise tu historial?' };
  }

  if (intent === 'routine') {
    let splitType = 'fullbody';
    let splitName = 'Full Body';
    let goal = 'hipertrofia';

    if (/ppl|push|pull|legs/.test(t))                         { splitType = 'ppl';          splitName = 'Push/Pull/Legs'; }
    else if (/upper|lower|superior|inferior|4.?d[íi]a/.test(t)) { splitType = 'upper_lower'; splitName = 'Upper/Lower'; }
    else if (/full.?body|cuerpo entero|todo el cuerpo/.test(t))  { splitType = 'fullbody';    splitName = 'Full Body'; }
    else if (/5.?d[íi]a|6.?d[íi]a/.test(t))                    { splitType = 'ppl';          splitName = 'PPL 6 días'; }

    if (/fuerza|strength/.test(t)) goal = 'fuerza';

    const sessions = acBuildRoutine(splitType, goal, allExs);
    if (sessions.length === 0 || sessions.every(s => s.exercises.length === 0)) {
      return { type: 'text', text: 'No encontré ejercicios suficientes para armar esa rutina. Inténtalo de otra forma o pídeme un Full Body.' };
    }

    const intro = sessions.length === 1
      ? `Aquí tienes una rutina ${splitName}:`
      : `Aquí tienes un plan ${splitName} de ${sessions.length} sesiones:`;

    return {
      type: 'routine',
      text: intro,
      routine: sessions,
      builderPayload: sessions[0]?.exercises || [],
    };
  }

  return { type: 'text', text: 'Puedo generarte rutinas personalizadas, analizar tu historial o responder preguntas sobre volumen, intensidad o recuperación. ¿Qué necesitas?' };
}

// ── Typing indicator ──────────────────────────────────────────────────────────
function AcTypingIndicator() {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, marginBottom: 20 }}>
      <div style={{
        width: 28, height: 28, borderRadius: 8, flexShrink: 0,
        background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.22)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: 'ui-monospace', fontSize: 11, color: '#93C5FD', fontWeight: 700,
      }}>A</div>
      <div style={{
        padding: '12px 16px', borderRadius: '4px 18px 18px 18px',
        background: AC.card, border: `1px solid ${AC.border}`,
        display: 'flex', gap: 5, alignItems: 'center',
      }}>
        {[0, 1, 2].map(i => (
          <div key={i} style={{
            width: 7, height: 7, borderRadius: '50%',
            background: 'rgba(232,237,248,0.35)',
            animation: 'pulse 1.4s infinite',
            animationDelay: `${i * 0.22}s`,
          }} />
        ))}
      </div>
    </div>
  );
}

// ── Coach message content ─────────────────────────────────────────────────────
function AcCoachMessage({ content, onSendToBuilder }) {
  const bubble = {
    padding: '13px 18px',
    borderRadius: '4px 18px 18px 18px',
    background: AC.card,
    border: `1px solid ${AC.border}`,
    fontFamily: 'Inter,system-ui',
    fontSize: 14,
    lineHeight: 1.65,
    color: AC.text,
  };

  if (content.type === 'text') {
    return <div style={bubble}>{content.text}</div>;
  }

  if (content.type === 'routine') {
    return (
      <div>
        <div style={bubble}>{content.text}</div>

        {content.routine.map((session, si) => (
          <div key={si} style={{
            marginTop: 10, borderRadius: 14, overflow: 'hidden',
            border: `1px solid ${AC.border}`, background: AC.input,
            animation: 'fadeIn .25s ease',
          }}>
            {/* Session header */}
            <div style={{
              padding: '12px 16px',
              borderBottom: `1px solid ${AC.border}`,
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              background: 'rgba(59,130,246,0.06)',
            }}>
              <span style={{ fontFamily: 'Inter,system-ui', fontSize: 13, fontWeight: 700, color: '#93C5FD' }}>
                {session.name}
              </span>
              <span style={{ fontFamily: 'ui-monospace,Menlo,monospace', fontSize: 10, color: AC.muted }}>
                {session.exercises.length} ejercicios
              </span>
            </div>

            {/* Exercise list */}
            {session.exercises.map((ex, ei) => (
              <div key={ex.id || ei} style={{
                padding: '10px 16px',
                borderBottom: ei < session.exercises.length - 1 ? `1px solid rgba(255,255,255,0.04)` : 'none',
                display: 'flex', alignItems: 'center', gap: 10,
              }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: AC.blue, flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: 'Inter,system-ui', fontSize: 13, fontWeight: 600, color: AC.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {ex.name}
                  </div>
                  <div style={{ fontFamily: 'Inter,system-ui', fontSize: 11, color: AC.muted, marginTop: 2 }}>
                    {ex.sets.length} × {ex.sets[0]?.reps} reps
                    {ex.muscles?.primary?.[0] ? ` · ${ex.muscles.primary[0]}` : ''}
                  </div>
                </div>
              </div>
            ))}

            {/* Send to Builder button */}
            <div style={{ padding: '12px 16px', borderTop: `1px solid rgba(255,255,255,0.04)` }}>
              <button
                onClick={() => onSendToBuilder(session.exercises)}
                style={{
                  width: '100%', padding: '11px 16px', borderRadius: 10, border: 'none',
                  cursor: 'pointer', background: AC.blue, color: '#fff',
                  fontFamily: 'Inter,system-ui', fontSize: 13, fontWeight: 700,
                  boxShadow: '0 6px 20px -6px rgba(59,130,246,0.5)',
                  transition: 'opacity .15s',
                }}
                onMouseEnter={e => e.currentTarget.style.opacity = '0.88'}
                onMouseLeave={e => e.currentTarget.style.opacity = '1'}
              >
                Enviar al Builder →
              </button>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return <div style={bubble}>{String(content)}</div>;
}

// ── Message bubble ────────────────────────────────────────────────────────────
function AcMessageBubble({ msg, onSendToBuilder }) {
  const isUser = msg.role === 'user';

  return (
    <div style={{
      display: 'flex',
      justifyContent: isUser ? 'flex-end' : 'flex-start',
      alignItems: 'flex-end',
      gap: 8,
      marginBottom: 20,
      animation: 'fadeIn .22s ease',
    }}>
      {!isUser && (
        <div style={{
          width: 28, height: 28, borderRadius: 8, flexShrink: 0,
          background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.22)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'ui-monospace', fontSize: 11, color: '#93C5FD', fontWeight: 700,
          marginBottom: 18,
        }}>A</div>
      )}

      <div style={{ maxWidth: '75%', minWidth: 0 }}>
        {isUser ? (
          <div style={{
            padding: '11px 16px',
            borderRadius: '18px 18px 4px 18px',
            background: '#2563EB',
            color: '#fff',
            fontFamily: 'Inter,system-ui',
            fontSize: 14,
            lineHeight: 1.55,
            wordBreak: 'break-word',
          }}>
            {msg.content}
          </div>
        ) : (
          <AcCoachMessage content={msg.content} onSendToBuilder={onSendToBuilder} />
        )}
        <div style={{
          fontFamily: 'Inter,system-ui', fontSize: 10,
          color: 'rgba(232,237,248,0.22)',
          marginTop: 5,
          textAlign: isUser ? 'right' : 'left',
        }}>
          {new Date(msg.ts).toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </div>
  );
}

// ── Welcome message builder ───────────────────────────────────────────────────
function acWelcomeText(state) {
  const log = state.log || [];
  if (log.length === 0) {
    return 'Hola. Soy Atlas Coach. Puedo generarte rutinas de entrenamiento, analizar tu historial o responder tus dudas. Todavía no tienes sesiones registradas — empieza guardando una rutina en el Builder. ¿O prefieres que te genere un plan ahora mismo?';
  }
  const ctx = acBuildContext(state);
  if (ctx.daysSinceLast === 0) return `Entrenaste hoy. Llevas ${log.length} sesiones registradas. ¿Quieres revisar cómo va tu progreso o planificar la próxima sesión?`;
  if (ctx.daysSinceLast === 1) return `Entrenaste ayer. Llevas ${log.length} sesiones${ctx.sessions?.streak >= 2 ? ` y ${ctx.sessions.streak} días de racha` : ''}. ¿Qué necesitas hoy?`;
  if (ctx.daysSinceLast < 99) return `Llevas ${log.length} sesiones registradas — última hace ${ctx.daysSinceLast} días. ¿En qué te ayudo?`;
  return `Llevas ${log.length} sesiones registradas. ¿En qué te ayudo hoy?`;
}

// ── Sidebar ───────────────────────────────────────────────────────────────────
function AcSidebar({ chats, activeChatId, onSelect, onNew }) {
  return (
    <aside style={{
      width: 220, flexShrink: 0,
      background: AC.sidebar,
      borderRight: `1px solid ${AC.border}`,
      display: 'flex', flexDirection: 'column',
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{ padding: '14px 12px', borderBottom: `1px solid ${AC.border}` }}>
        <div style={{ fontFamily: 'ui-monospace,Menlo,monospace', fontSize: 9, fontWeight: 700, color: AC.muted, letterSpacing: 1.4, marginBottom: 10 }}>
          ATLAS COACH
        </div>
        <button
          onClick={onNew}
          style={{
            width: '100%', padding: '9px 12px', borderRadius: 9,
            border: '1px solid rgba(59,130,246,0.25)',
            background: 'rgba(59,130,246,0.08)',
            color: '#93C5FD',
            fontFamily: 'Inter,system-ui', fontSize: 12, fontWeight: 700,
            cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: 7,
            transition: 'background .12s',
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(59,130,246,0.16)'}
          onMouseLeave={e => e.currentTarget.style.background = 'rgba(59,130,246,0.08)'}
        >
          <span style={{ fontSize: 16, lineHeight: 1 }}>+</span> Nuevo chat
        </button>
      </div>

      {/* Chat list */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '8px 6px' }}>
        {chats.map(chat => {
          const active = chat.id === activeChatId;
          return (
            <button
              key={chat.id}
              onClick={() => onSelect(chat.id)}
              style={{
                width: '100%', padding: '9px 10px', borderRadius: 8,
                border: 'none', cursor: 'pointer', textAlign: 'left', marginBottom: 2,
                background: active ? 'rgba(59,130,246,0.12)' : 'transparent',
                transition: 'background .1s',
              }}
              onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
              onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent'; }}
            >
              <div style={{
                fontFamily: 'Inter,system-ui', fontSize: 12, fontWeight: 600,
                color: active ? '#93C5FD' : AC.sub,
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>
                {chat.title}
              </div>
              <div style={{ fontFamily: 'Inter,system-ui', fontSize: 10, color: AC.muted, marginTop: 2 }}>
                {chat.messages.length} mensaje{chat.messages.length !== 1 ? 's' : ''}
              </div>
            </button>
          );
        })}
      </div>
    </aside>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
function AtlasCoachSection() {
  const { state } = useStore();
  const { navigate } = useRoute();

  const [chats, setChats] = React.useState(() => {
    try { return JSON.parse(localStorage.getItem('atlas.chats.v1') || '[]'); } catch { return []; }
  });
  const [activeChatId, setActiveChatId] = React.useState(null);
  const [input, setInput]   = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const messagesEndRef = React.useRef(null);
  const inputRef       = React.useRef(null);

  const allExs = React.useMemo(() => {
    try { return ExerciseService.getAll(); } catch { return []; }
  }, []);

  const activeChat = chats.find(c => c.id === activeChatId) || null;
  const messages   = activeChat?.messages || [];

  // Persist to localStorage
  React.useEffect(() => {
    localStorage.setItem('atlas.chats.v1', JSON.stringify(chats));
  }, [chats]);

  // Auto-scroll
  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Init on mount
  React.useEffect(() => {
    if (chats.length === 0) {
      startNewChat();
    } else {
      setActiveChatId(prev => prev || chats[0].id);
    }
  }, []);

  function startNewChat() {
    const id = `chat-${Date.now()}`;
    const welcome = acWelcomeText(state);
    const chat = {
      id,
      title: 'Nueva conversación',
      messages: [{
        id: `${id}-init`,
        role: 'coach',
        content: { type: 'text', text: welcome },
        ts: Date.now(),
      }],
      createdAt: Date.now(),
    };
    setChats(prev => [chat, ...prev]);
    setActiveChatId(id);
  }

  function sendMessage() {
    if (!input.trim() || loading || !activeChatId) return;
    const userText   = input.trim();
    const chatId     = activeChatId;
    setInput('');

    const userMsg = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: userText,
      ts: Date.now(),
    };

    setChats(prev => prev.map(c => {
      if (c.id !== chatId) return c;
      const isFirst = c.messages.filter(m => m.role === 'user').length === 0;
      return {
        ...c,
        title: isFirst ? userText.slice(0, 42) : c.title,
        messages: [...c.messages, userMsg],
      };
    }));

    setLoading(true);
    setTimeout(() => {
      const response = acGenerateResponse(userText, state, allExs);
      const coachMsg = {
        id: `msg-${Date.now()}-c`,
        role: 'coach',
        content: response,
        ts: Date.now(),
      };
      setChats(prev => prev.map(c =>
        c.id === chatId ? { ...c, messages: [...c.messages, coachMsg] } : c
      ));
      setLoading(false);
    }, 550 + Math.random() * 300);
  }

  function sendToBuilder(exercises) {
    localStorage.setItem('atlas.pendingWorkout', JSON.stringify(exercises));
    navigate('/builder');
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  const isMobile = window.innerWidth < 680;

  const HINTS = [
    'Dame una rutina para hoy',
    'Analiza mi historial',
    'Dame un plan PPL',
    '¿Cuántas series necesito?',
  ];

  return (
    <section style={{
      height: '100vh',
      paddingTop: 64,
      boxSizing: 'border-box',
      display: 'flex',
      flexDirection: 'column',
      background: AC.page,
      overflow: 'hidden',
    }}>
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden', minHeight: 0 }}>

        {/* Sidebar — hidden on mobile */}
        {!isMobile && (
          <AcSidebar
            chats={chats}
            activeChatId={activeChatId}
            onSelect={setActiveChatId}
            onNew={startNewChat}
          />
        )}

        {/* Main chat area */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>

          {/* Mobile header */}
          {isMobile && (
            <div style={{
              padding: '10px 16px',
              borderBottom: `1px solid ${AC.border}`,
              display: 'flex', alignItems: 'center', gap: 10,
            }}>
              <span style={{ fontFamily: 'ui-monospace', fontSize: 10, fontWeight: 700, color: AC.muted, letterSpacing: 1.4 }}>ATLAS COACH</span>
              <button onClick={startNewChat} style={{ marginLeft: 'auto', padding: '5px 12px', borderRadius: 8, border: `1px solid rgba(59,130,246,0.25)`, background: 'rgba(59,130,246,0.08)', color: '#93C5FD', fontFamily: 'Inter,system-ui', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>
                + Nuevo
              </button>
            </div>
          )}

          {/* Messages scroll area */}
          <div style={{ flex: 1, overflowY: 'auto', padding: isMobile ? '20px 16px' : '28px 32px', minHeight: 0 }}>
            <div style={{ maxWidth: 680, margin: '0 auto' }}>
              {messages.length === 0 && (
                <div style={{ textAlign: 'center', paddingTop: 60, color: AC.muted, fontFamily: 'Inter,system-ui', fontSize: 14 }}>
                  Selecciona una conversación o inicia una nueva.
                </div>
              )}
              {messages.map(msg => (
                <AcMessageBubble key={msg.id} msg={msg} onSendToBuilder={sendToBuilder} />
              ))}
              {loading && <AcTypingIndicator />}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Input area */}
          <div style={{
            padding: isMobile ? '12px 14px' : '14px 28px',
            borderTop: `1px solid ${AC.border}`,
            background: AC.input,
            flexShrink: 0,
          }}>
            <div style={{ maxWidth: 680, margin: '0 auto' }}>

              {/* Hint chips */}
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
                {HINTS.map(hint => (
                  <button
                    key={hint}
                    onClick={() => { setInput(hint); inputRef.current?.focus(); }}
                    style={{
                      padding: '4px 11px', borderRadius: 999,
                      border: `1px solid ${AC.border}`,
                      background: 'transparent', color: AC.muted,
                      fontFamily: 'Inter,system-ui', fontSize: 11,
                      cursor: 'pointer', transition: 'all .12s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(59,130,246,0.4)'; e.currentTarget.style.color = '#93C5FD'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = AC.border; e.currentTarget.style.color = AC.muted; }}
                  >
                    {hint}
                  </button>
                ))}
              </div>

              {/* Text input row */}
              <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Pregúntame cualquier cosa…"
                  rows={1}
                  style={{
                    flex: 1, padding: '11px 15px', borderRadius: 14,
                    border: `1px solid ${AC.border}`,
                    background: AC.card, color: AC.text,
                    fontFamily: 'Inter,system-ui', fontSize: 14,
                    resize: 'none', lineHeight: 1.5,
                    maxHeight: 100, overflowY: 'auto',
                  }}
                />
                <button
                  onClick={sendMessage}
                  disabled={!input.trim() || loading}
                  style={{
                    padding: '11px 18px', borderRadius: 12, border: 'none',
                    cursor: input.trim() && !loading ? 'pointer' : 'default',
                    background: input.trim() && !loading ? AC.blue : 'rgba(59,130,246,0.18)',
                    color: input.trim() && !loading ? '#fff' : 'rgba(255,255,255,0.28)',
                    fontFamily: 'Inter,system-ui', fontSize: 13, fontWeight: 700,
                    transition: 'all .15s', flexShrink: 0, whiteSpace: 'nowrap',
                  }}
                >
                  Enviar
                </button>
              </div>

              <div style={{ fontFamily: 'Inter,system-ui', fontSize: 10, color: 'rgba(232,237,248,0.2)', marginTop: 7, textAlign: 'center' }}>
                Enter para enviar · Shift+Enter para nueva línea
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

Object.assign(window, { AtlasCoachSection });
