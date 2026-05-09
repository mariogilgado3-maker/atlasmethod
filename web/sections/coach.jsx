// AI Coach — functional via window.claude.complete
function CoachSection() {
  const [messages, setMessages] = React.useState([
    { role: 'system', hidden: true, content: `Eres "Atlas Coach", el asistente IA de Atlas Method, una plataforma de entrenamiento basada en evidencia científica. Hablas español, eres conciso (3-5 frases máximo por respuesta), preciso y firme. NUNCA das consejos médicos directos: si detectas dolor o lesión, sugieres consultar profesional. Tu trabajo es interpretar datos del usuario y sugerir DECISIONES concretas (no genéricas). Usa terminología técnica deportiva (RPE, RIR, volumen, intensidad, mesociclo, deload). Cuando puedas, da un número o un ajuste exacto en lugar de generalidades.

CONTEXTO DEL USUARIO ACTUAL (Javier Morales):
- Mesociclo 3, semana 8, objetivo hipertrofia
- Adherencia 94%, RPE medio 7.8, volumen 24.6t/sem (+12%)
- HRV 7d ascendente, recuperación 87/100
- Estancamiento detectado en press banca (1RM proyectado 92kg, sin progreso 3 semanas)
- Asimetría detectada en tren inferior (8% diferencia)
- Sueño últimos 7 días: 6.8h media (objetivo 8h)` },
    { role: 'assistant', content: '¿En qué quieres que te ayude hoy? Puedo analizar tus métricas, ajustar el plan o resolver dudas técnicas.' },
  ]);
  const [input, setInput] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const scrollRef = React.useRef(null);

  const suggestions = [
    'Llevo 3 semanas estancado en press banca',
    '¿Es momento de un deload?',
    '¿Cómo corrijo la asimetría de pierna?',
    'Solo dormí 5h, ¿entreno igual?',
  ];

  const send = async (text) => {
    const content = (text ?? input).trim();
    if (!content || loading) return;
    setInput('');
    const newMsgs = [...messages, { role: 'user', content }];
    setMessages(newMsgs);
    setLoading(true);
    try {
      const reply = await window.claude.complete({
        messages: newMsgs.filter(m => !m.hidden && m.role !== 'system').map(m => ({ role: m.role, content: m.content })),
        system: newMsgs.find(m => m.role === 'system')?.content,
      });
      setMessages(m => [...m, { role: 'assistant', content: reply }]);
    } catch (e) {
      setMessages(m => [...m, { role: 'assistant', content: 'Error de conexión. Inténtalo de nuevo.' }]);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, loading]);

  return (
    <section id="coach" style={{
      padding: '160px 32px',
      background: 'linear-gradient(180deg, #0F1A2E 0%, #1A2845 100%)',
      color: '#FAFAF7', position: 'relative', overflow: 'hidden',
    }}>
      {/* ambient grid */}
      <div style={{
        position: 'absolute', inset: 0, opacity: 0.4, pointerEvents: 'none',
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)',
        backgroundSize: '64px 64px',
        maskImage: 'radial-gradient(ellipse at center, black 0%, transparent 70%)',
        WebkitMaskImage: 'radial-gradient(ellipse at center, black 0%, transparent 70%)',
      }} />

      <div style={{ maxWidth: 1180, margin: '0 auto', position: 'relative' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: 60, alignItems: 'center' }}>
          <div>
            <span style={{ fontFamily: '"Inter",system-ui', fontSize: 13, fontWeight: 700, letterSpacing: 1.6, textTransform: 'uppercase', color: 'rgba(250,250,247,0.6)' }}>
              AI Coach · Beta
            </span>
            <h2 style={{
              fontFamily: '"Inter",system-ui', fontSize: 56, fontWeight: 700,
              letterSpacing: -2, lineHeight: 1.02,
              margin: '12px 0 20px',
            }}>
              Datos en <span style={{ fontFamily: '"Instrument Serif",serif', fontStyle: 'italic', fontWeight: 400 }}>decisiones.</span>
            </h2>
            <p style={{ fontFamily: '"Inter",system-ui', fontSize: 18, color: 'rgba(250,250,247,0.75)', lineHeight: 1.5, letterSpacing: -0.2, margin: '0 0 32px' }}>
              No es un chatbot genérico. Lee tus métricas, identifica patrones y sugiere ajustes concretos al plan — con números, no con frases vacías.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                ['Interpreta', 'Cruza HRV, RPE, volumen y adherencia para detectar señales antes que tú'],
                ['Decide', 'Sugiere ajustes con número exacto: -15% volumen, +1 día deload, etc'],
                ['Aplica', 'Un click integra el ajuste en tu mesociclo activo'],
              ].map(([t,d],i)=>(
                <div key={i} style={{ display: 'flex', gap: 14 }}>
                  <span style={{
                    width: 28, height: 28, borderRadius: 999, flexShrink: 0,
                    background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)',
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: 'ui-monospace,Menlo,monospace', fontSize: 11, fontWeight: 700,
                  }}>{i+1}</span>
                  <div>
                    <div style={{ fontFamily: '"Inter",system-ui', fontSize: 15, fontWeight: 700, letterSpacing: -0.2 }}>{t}</div>
                    <div style={{ fontFamily: '"Inter",system-ui', fontSize: 13, color: 'rgba(250,250,247,0.6)', marginTop: 2, lineHeight: 1.4 }}>{d}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Chat panel */}
          <div style={{
            background: 'rgba(255,255,255,0.04)', borderRadius: 24,
            border: '1px solid rgba(255,255,255,0.1)',
            backdropFilter: 'blur(20px)',
            display: 'flex', flexDirection: 'column', height: 560, overflow: 'hidden',
          }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
              <div style={{ width: 36, height: 36, borderRadius: 999, background: '#FAFAF7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <AtlasA size={20} color="#0F1A2E" stroke={9} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: '"Inter",system-ui', fontSize: 14, fontWeight: 700 }}>Atlas Coach</div>
                <div style={{ fontFamily: '"Inter",system-ui', fontSize: 12, color: 'rgba(250,250,247,0.5)', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ width: 6, height: 6, borderRadius: 999, background: '#7BD68A', boxShadow: '0 0 8px #7BD68A' }} />
                  Online · contexto cargado
                </div>
              </div>
              <span style={{ padding: '3px 9px', borderRadius: 999, background: 'rgba(255,255,255,0.08)', fontFamily: 'ui-monospace,Menlo,monospace', fontSize: 10, fontWeight: 700 }}>BETA</span>
            </div>

            {/* Messages */}
            <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
              {messages.filter(m => !m.hidden && m.role !== 'system').map((m, i) => (
                <div key={i} style={{
                  alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '82%',
                  padding: '11px 15px', borderRadius: 16,
                  background: m.role === 'user' ? '#FAFAF7' : 'rgba(255,255,255,0.08)',
                  color: m.role === 'user' ? '#0F1A2E' : '#FAFAF7',
                  border: m.role === 'user' ? 'none' : '1px solid rgba(255,255,255,0.08)',
                  fontFamily: '"Inter",system-ui', fontSize: 14, lineHeight: 1.5, letterSpacing: -0.1,
                  whiteSpace: 'pre-wrap',
                }}>{m.content}</div>
              ))}
              {loading && (
                <div style={{ alignSelf: 'flex-start', padding: '14px 18px', borderRadius: 16, background: 'rgba(255,255,255,0.08)', display: 'flex', gap: 5 }}>
                  {[0,1,2].map(i => (
                    <span key={i} style={{ width: 6, height: 6, borderRadius: 999, background: 'rgba(250,250,247,0.6)', animation: `pulse 1.2s ${i*0.15}s infinite ease-in-out` }} />
                  ))}
                </div>
              )}
            </div>

            {/* Suggestions */}
            {messages.filter(m => !m.hidden && m.role !== 'system').length <= 1 && (
              <div style={{ padding: '0 20px 12px', display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {suggestions.map((s,i)=>(
                  <button key={i} onClick={()=>send(s)} style={{
                    padding: '7px 12px', borderRadius: 999, cursor: 'pointer',
                    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                    color: 'rgba(250,250,247,0.85)',
                    fontFamily: '"Inter",system-ui', fontSize: 12, fontWeight: 500, letterSpacing: -0.1,
                  }}>{s}</button>
                ))}
              </div>
            )}

            {/* Input */}
            <form onSubmit={e => { e.preventDefault(); send(); }} style={{ padding: 16, borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', gap: 8 }}>
              <input
                value={input} onChange={e=>setInput(e.target.value)}
                placeholder="Pregunta sobre tu plan, métricas o ajustes…"
                disabled={loading}
                style={{
                  flex: 1, padding: '12px 16px', borderRadius: 12,
                  background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                  color: '#FAFAF7', outline: 'none',
                  fontFamily: '"Inter",system-ui', fontSize: 14, letterSpacing: -0.1,
                }}
              />
              <button type="submit" disabled={loading || !input.trim()} style={{
                padding: '12px 18px', borderRadius: 12, border: 'none',
                background: '#FAFAF7', color: '#0F1A2E',
                cursor: loading || !input.trim() ? 'default' : 'pointer',
                opacity: loading || !input.trim() ? 0.4 : 1,
                fontFamily: '"Inter",system-ui', fontSize: 14, fontWeight: 700,
              }}>Enviar →</button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}

Object.assign(window, { CoachSection });
