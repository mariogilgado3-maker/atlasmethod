// OnboardingSection — 5-step wizard after first registration
// Requires: useAuth (auth-store.jsx)

const OB_BG     = '#060D18';
const OB_CARD   = '#0D1B2E';
const OB_BORDER = 'rgba(255,255,255,0.08)';
const OB_MUTED  = 'rgba(255,255,255,0.4)';
const OB_TEXT   = '#F0F4FF';
const OB_ACCENT = '#3B82F6';

const OB_STEPS = ['Meta', 'Nivel', 'Frecuencia', 'Equipamiento', 'Listo'];

const OB_GOALS = [
  { id: 'hipertrofia', label: 'Hipertrofia', desc: 'Aumentar músculo y tamaño', icon: '💪' },
  { id: 'fuerza',      label: 'Fuerza',      desc: 'Levantar más peso',         icon: '🏋️' },
  { id: 'recomposicion', label: 'Recomp.',   desc: 'Quemar grasa y ganar músculo', icon: '⚡' },
  { id: 'perdida_grasa', label: 'Pérdida grasa', desc: 'Perder grasa corporal', icon: '🔥' },
];

const OB_LEVELS = [
  { id: 'principiante', label: 'Principiante', desc: 'Menos de 1 año entrenando',  icon: '🌱' },
  { id: 'intermedio',   label: 'Intermedio',   desc: '1-3 años de experiencia',    icon: '📈' },
  { id: 'avanzado',     label: 'Avanzado',      desc: 'Más de 3 años serio',        icon: '🎯' },
];

const OB_EQUIPMENT_OPTS = [
  { id: 'gimnasio_completo', label: 'Gimnasio completo', icon: '🏟️' },
  { id: 'pesas_libres',      label: 'Pesas libres + barra', icon: '🔩' },
  { id: 'mancuernas',        label: 'Solo mancuernas', icon: '🔗' },
  { id: 'casa_basico',       label: 'Casa (básico)', icon: '🏠' },
];

const OB_TIMES = [
  { id: 45,  label: '45 min' },
  { id: 60,  label: '60 min' },
  { id: 90,  label: '90 min' },
  { id: 120, label: '2 h+' },
];

function OnboardingSection() {
  const { updateProfile } = useAuth();

  const [step, setStep]       = React.useState(0);
  const [goal, setGoal]       = React.useState('');
  const [level, setLevel]     = React.useState('');
  const [days, setDays]       = React.useState(4);
  const [equipment, setEquipment] = React.useState('');
  const [sessionTime, setSessionTime] = React.useState(60);
  const [saving, setSaving]   = React.useState(false);

  async function finish() {
    setSaving(true);
    try {
      await updateProfile({
        goal,
        level,
        weekly_frequency: days,
        equipment,
        session_duration: sessionTime,
        onboarded: true,
      });
    } catch (e) {
      console.warn('[Onboarding] finish error:', e);
    } finally {
      setSaving(false);
    }
  }

  const canNext = [
    !!goal,
    !!level,
    true,
    !!equipment,
    true,
  ][step];

  function OptionCard({ selected, onClick, icon, label, desc }) {
    return (
      <button onClick={onClick}
        style={{
          width: '100%', padding: '14px 16px', textAlign: 'left',
          background: selected ? 'rgba(59,130,246,0.12)' : 'rgba(255,255,255,0.03)',
          border: `1px solid ${selected ? 'rgba(59,130,246,0.5)' : OB_BORDER}`,
          borderRadius: 10, cursor: 'pointer', transition: 'all 0.15s',
          display: 'flex', alignItems: 'center', gap: 14,
        }}
        onMouseOver={e => { if (!selected) e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; }}
        onMouseOut={e => { if (!selected) e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}>
        <span style={{ fontSize: 22 }}>{icon}</span>
        <div>
          <div style={{ fontSize: 14, fontWeight: 600, color: OB_TEXT }}>{label}</div>
          {desc && <div style={{ fontSize: 12, color: OB_MUTED, marginTop: 2 }}>{desc}</div>}
        </div>
        {selected && <span style={{ marginLeft: 'auto', color: OB_ACCENT, fontSize: 16 }}>✓</span>}
      </button>
    );
  }

  const STEP_CONTENT = [
    // Step 0 — Goal
    <div key="goal">
      <h2 style={{ fontSize: 18, fontWeight: 700, color: OB_TEXT, margin: '0 0 6px' }}>¿Cuál es tu objetivo?</h2>
      <p style={{ fontSize: 13, color: OB_MUTED, margin: '0 0 20px' }}>Personalizamos el programa para tu meta principal.</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {OB_GOALS.map(g => (
          <OptionCard key={g.id} selected={goal === g.id} onClick={() => setGoal(g.id)}
            icon={g.icon} label={g.label} desc={g.desc} />
        ))}
      </div>
    </div>,

    // Step 1 — Level
    <div key="level">
      <h2 style={{ fontSize: 18, fontWeight: 700, color: OB_TEXT, margin: '0 0 6px' }}>¿Cuál es tu nivel?</h2>
      <p style={{ fontSize: 13, color: OB_MUTED, margin: '0 0 20px' }}>Ajustamos volumen e intensidad a tu experiencia.</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {OB_LEVELS.map(l => (
          <OptionCard key={l.id} selected={level === l.id} onClick={() => setLevel(l.id)}
            icon={l.icon} label={l.label} desc={l.desc} />
        ))}
      </div>
    </div>,

    // Step 2 — Days / week
    <div key="days">
      <h2 style={{ fontSize: 18, fontWeight: 700, color: OB_TEXT, margin: '0 0 6px' }}>¿Cuántos días a la semana?</h2>
      <p style={{ fontSize: 13, color: OB_MUTED, margin: '0 0 28px' }}>Diseñamos la estructura semanal óptima para ti.</p>
      <div style={{ textAlign: 'center', marginBottom: 20 }}>
        <div style={{ fontSize: 56, fontWeight: 800, color: OB_TEXT, fontFamily: 'monospace', lineHeight: 1 }}>
          {days}
        </div>
        <div style={{ fontSize: 12, color: OB_MUTED, marginTop: 4 }}>días / semana</div>
      </div>
      <input type="range" min={2} max={6} value={days} onChange={e => setDays(+e.target.value)}
        style={{ width: '100%', accentColor: OB_ACCENT }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: OB_MUTED, marginTop: 6 }}>
        <span>2</span><span>3</span><span>4</span><span>5</span><span>6</span>
      </div>
    </div>,

    // Step 3 — Equipment + time
    <div key="equip">
      <h2 style={{ fontSize: 18, fontWeight: 700, color: OB_TEXT, margin: '0 0 6px' }}>Equipamiento y tiempo</h2>
      <p style={{ fontSize: 13, color: OB_MUTED, margin: '0 0 16px' }}>Selecciona dónde entrenas y cuánto dura tu sesión.</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
        {OB_EQUIPMENT_OPTS.map(eq => (
          <OptionCard key={eq.id} selected={equipment === eq.id} onClick={() => setEquipment(eq.id)}
            icon={eq.icon} label={eq.label} />
        ))}
      </div>
      <div style={{ fontSize: 11, color: OB_MUTED, marginBottom: 8, letterSpacing: '0.06em' }}>DURACIÓN DE SESIÓN</div>
      <div style={{ display: 'flex', gap: 8 }}>
        {OB_TIMES.map(t => (
          <button key={t.id} onClick={() => setSessionTime(t.id)}
            style={{
              flex: 1, padding: '10px 0', border: `1px solid ${sessionTime === t.id ? 'rgba(59,130,246,0.5)' : OB_BORDER}`,
              borderRadius: 8, background: sessionTime === t.id ? 'rgba(59,130,246,0.12)' : 'transparent',
              color: sessionTime === t.id ? OB_TEXT : OB_MUTED,
              fontSize: 13, fontWeight: 500, cursor: 'pointer', transition: 'all 0.15s',
            }}>
            {t.label}
          </button>
        ))}
      </div>
    </div>,

    // Step 4 — Summary / Done
    <div key="done" style={{ textAlign: 'center' }}>
      <div style={{ fontSize: 40, marginBottom: 16 }}>🎯</div>
      <h2 style={{ fontSize: 20, fontWeight: 700, color: OB_TEXT, margin: '0 0 8px' }}>Todo listo</h2>
      <p style={{ fontSize: 13, color: OB_MUTED, margin: '0 0 24px', lineHeight: 1.6 }}>
        Atlas Method está personalizado para ti. El Coach tiene acceso a tu perfil y adaptará cada respuesta.
      </p>
      {/* Summary chips */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', marginBottom: 28 }}>
        {[
          OB_GOALS.find(g => g.id === goal)?.label,
          OB_LEVELS.find(l => l.id === level)?.label,
          `${days} días/sem`,
          OB_EQUIPMENT_OPTS.find(e => e.id === equipment)?.label,
          `${sessionTime} min`,
        ].filter(Boolean).map((chip, i) => (
          <span key={i} style={{
            padding: '5px 12px', background: 'rgba(59,130,246,0.12)',
            border: '1px solid rgba(59,130,246,0.25)', borderRadius: 20,
            fontSize: 12, color: OB_TEXT, fontWeight: 500,
          }}>
            {chip}
          </span>
        ))}
      </div>
    </div>,
  ];

  const isLast = step === OB_STEPS.length - 1;

  return (
    <div style={{
      minHeight: '100vh', background: OB_BG,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '24px 16px',
    }}>
      <div style={{
        width: '100%', maxWidth: 440,
        background: OB_CARD, border: `1px solid ${OB_BORDER}`,
        borderRadius: 16, padding: '36px 32px',
        boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
      }}>
        {/* Progress bar */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            {OB_STEPS.map((s, i) => (
              <span key={s} style={{
                fontSize: 10, letterSpacing: '0.06em',
                color: i <= step ? OB_TEXT : OB_MUTED,
                fontWeight: i === step ? 600 : 400,
              }}>
                {s.toUpperCase()}
              </span>
            ))}
          </div>
          <div style={{ height: 3, background: 'rgba(255,255,255,0.07)', borderRadius: 2 }}>
            <div style={{
              height: '100%', borderRadius: 2, background: OB_ACCENT,
              width: `${((step + 1) / OB_STEPS.length) * 100}%`,
              transition: 'width 0.3s ease',
            }} />
          </div>
        </div>

        {/* Step content */}
        <div style={{ minHeight: 280 }}>
          {STEP_CONTENT[step]}
        </div>

        {/* Navigation */}
        <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
          {step > 0 && !isLast && (
            <button onClick={() => setStep(s => s - 1)}
              style={{
                flex: 1, padding: '11px 0', border: `1px solid ${OB_BORDER}`,
                borderRadius: 8, background: 'transparent', color: OB_MUTED,
                fontSize: 14, cursor: 'pointer',
              }}>
              Atrás
            </button>
          )}
          <button
            onClick={isLast ? finish : () => setStep(s => s + 1)}
            disabled={(!canNext && !isLast) || saving}
            style={{
              flex: 2, padding: '12px 0', border: 'none', borderRadius: 8,
              background: (canNext || isLast) ? OB_ACCENT : 'rgba(59,130,246,0.25)',
              color: '#fff', fontSize: 14, fontWeight: 600,
              cursor: (canNext || isLast) ? 'pointer' : 'not-allowed',
              opacity: saving ? 0.7 : 1, transition: 'opacity 0.15s',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}>
            {saving && <span style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.6s linear infinite' }} />}
            {isLast ? 'Empezar' : 'Continuar'}
          </button>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { OnboardingSection });
