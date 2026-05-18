// ExerciseMedia — SVG muscle illustrations + thumbnail component
// Supports future mediaUrl (image / GIF / video) per exercise

// ── Group style tokens (shared with builder) ──────────────────────────────────

const EXERCISE_GROUP_STYLE = {
  pecho:   { from: '#0f2744', to: '#1d5bbf' },
  espalda: { from: '#140d28', to: '#5a28c4' },
  pierna:  { from: '#091a09', to: '#177a2e' },
  hombro:  { from: '#271010', to: '#a83030' },
  biceps:  { from: '#071a28', to: '#0a8caa' },
  triceps: { from: '#241a08', to: '#b56a00' },
  core:    { from: '#111111', to: '#444c5e' },
};

// ── SVG muscle-group illustrations ────────────────────────────────────────────
// viewBox 160×90, white fills at varying opacity on transparent bg

const SVG_PECHO = () => (
  <svg viewBox="0 0 160 90" fill="none" xmlns="http://www.w3.org/2000/svg"
    style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
    {/* Shoulder caps — muted */}
    <ellipse cx="40" cy="28" rx="11" ry="9" fill="rgba(255,255,255,0.10)"/>
    <ellipse cx="120" cy="28" rx="11" ry="9" fill="rgba(255,255,255,0.10)"/>
    {/* Clavicles */}
    <line x1="51" y1="24" x2="80" y2="27" stroke="rgba(255,255,255,0.22)" strokeWidth="2.5" strokeLinecap="round"/>
    <line x1="109" y1="24" x2="80" y2="27" stroke="rgba(255,255,255,0.22)" strokeWidth="2.5" strokeLinecap="round"/>
    {/* Left pec — highlighted */}
    <path d="M80,27 C71,27 54,32 49,45 C46,53 55,60 76,60 L80,60 Z" fill="rgba(255,255,255,0.80)"/>
    {/* Right pec — highlighted */}
    <path d="M80,27 C89,27 106,32 111,45 C114,53 105,60 84,60 L80,60 Z" fill="rgba(255,255,255,0.80)"/>
    {/* Sternum */}
    <line x1="80" y1="27" x2="80" y2="60" stroke="rgba(255,255,255,0.13)" strokeWidth="1"/>
    {/* Upper arms — very muted */}
    <rect x="29" y="34" width="12" height="26" rx="6" fill="rgba(255,255,255,0.06)"/>
    <rect x="119" y="34" width="12" height="26" rx="6" fill="rgba(255,255,255,0.06)"/>
    {/* Core hint */}
    <rect x="67" y="60" width="26" height="16" rx="4" fill="rgba(255,255,255,0.05)"/>
    {/* Bottom fade */}
    <rect x="0" y="72" width="160" height="18" fill="url(#fadeB)"/>
    <defs>
      <linearGradient id="fadeB" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="transparent"/>
        <stop offset="100%" stopColor="rgba(0,0,0,0.18)"/>
      </linearGradient>
    </defs>
  </svg>
);

const SVG_ESPALDA = () => (
  <svg viewBox="0 0 160 90" fill="none" xmlns="http://www.w3.org/2000/svg"
    style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
    {/* Trapezius */}
    <path d="M64,14 L80,21 L96,14 C91,11 69,11 64,14 Z" fill="rgba(255,255,255,0.38)"/>
    {/* Left lat — highlighted */}
    <path d="M80,21 C73,21 52,30 42,46 C36,57 41,70 58,72 L80,72 Z" fill="rgba(255,255,255,0.80)"/>
    {/* Right lat — highlighted */}
    <path d="M80,21 C87,21 108,30 118,46 C124,57 119,70 102,72 L80,72 Z" fill="rgba(255,255,255,0.80)"/>
    {/* Spine dashes */}
    <line x1="80" y1="21" x2="80" y2="72" stroke="rgba(255,255,255,0.18)" strokeWidth="1.5" strokeDasharray="4,3"/>
    {/* Rear delts */}
    <ellipse cx="38" cy="34" rx="9" ry="8" fill="rgba(255,255,255,0.10)"/>
    <ellipse cx="122" cy="34" rx="9" ry="8" fill="rgba(255,255,255,0.10)"/>
    {/* Lower back */}
    <ellipse cx="80" cy="74" rx="19" ry="6" fill="rgba(255,255,255,0.11)"/>
    <rect x="0" y="76" width="160" height="14" fill="url(#fadeE)"/>
    <defs>
      <linearGradient id="fadeE" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="transparent"/>
        <stop offset="100%" stopColor="rgba(0,0,0,0.18)"/>
      </linearGradient>
    </defs>
  </svg>
);

const SVG_PIERNA = () => (
  <svg viewBox="0 0 160 90" fill="none" xmlns="http://www.w3.org/2000/svg"
    style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
    {/* Hip / glute */}
    <ellipse cx="80" cy="9" rx="28" ry="10" fill="rgba(255,255,255,0.13)"/>
    {/* Left quad — highlighted */}
    <path d="M67,16 C58,16 50,23 50,36 C50,50 53,62 59,66 L71,66 C73,62 73,50 72,36 C72,23 72,16 67,16 Z"
      fill="rgba(255,255,255,0.80)"/>
    {/* Right quad — highlighted */}
    <path d="M93,16 C102,16 110,23 110,36 C110,50 107,62 101,66 L89,66 C87,62 87,50 88,36 C88,23 88,16 93,16 Z"
      fill="rgba(255,255,255,0.80)"/>
    {/* Left hamstring */}
    <path d="M59,66 C54,71 52,80 57,84 L71,84 C73,82 73,70 71,66 Z" fill="rgba(255,255,255,0.32)"/>
    {/* Right hamstring */}
    <path d="M101,66 C106,71 108,80 103,84 L89,84 C87,82 87,70 89,66 Z" fill="rgba(255,255,255,0.32)"/>
    {/* Left calf */}
    <ellipse cx="65" cy="88" rx="8" ry="4" fill="rgba(255,255,255,0.10)"/>
    <ellipse cx="95" cy="88" rx="8" ry="4" fill="rgba(255,255,255,0.10)"/>
  </svg>
);

const SVG_HOMBRO = () => (
  <svg viewBox="0 0 160 90" fill="none" xmlns="http://www.w3.org/2000/svg"
    style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
    {/* Torso — muted */}
    <rect x="67" y="24" width="26" height="34" rx="5" fill="rgba(255,255,255,0.06)"/>
    {/* Clavicles */}
    <line x1="55" y1="21" x2="80" y2="24" stroke="rgba(255,255,255,0.22)" strokeWidth="2.5" strokeLinecap="round"/>
    <line x1="105" y1="21" x2="80" y2="24" stroke="rgba(255,255,255,0.22)" strokeWidth="2.5" strokeLinecap="round"/>
    {/* Left deltoid — highlighted */}
    <path d="M67,24 C60,24 43,28 38,42 C36,51 43,58 58,58 L67,58 Z" fill="rgba(255,255,255,0.72)"/>
    {/* Right deltoid — highlighted */}
    <path d="M93,24 C100,24 117,28 122,42 C124,51 117,58 102,58 L93,58 Z" fill="rgba(255,255,255,0.72)"/>
    {/* Front deltoid cap peak */}
    <ellipse cx="38" cy="42" rx="8" ry="10" fill="rgba(255,255,255,0.88)"/>
    <ellipse cx="122" cy="42" rx="8" ry="10" fill="rgba(255,255,255,0.88)"/>
    {/* Upper arms — muted */}
    <rect x="32" y="55" width="13" height="24" rx="6.5" fill="rgba(255,255,255,0.07)"/>
    <rect x="115" y="55" width="13" height="24" rx="6.5" fill="rgba(255,255,255,0.07)"/>
    <rect x="0" y="76" width="160" height="14" fill="url(#fadeH)"/>
    <defs>
      <linearGradient id="fadeH" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="transparent"/>
        <stop offset="100%" stopColor="rgba(0,0,0,0.18)"/>
      </linearGradient>
    </defs>
  </svg>
);

const SVG_BICEPS = () => (
  <svg viewBox="0 0 160 90" fill="none" xmlns="http://www.w3.org/2000/svg"
    style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
    {/* Torso */}
    <rect x="67" y="12" width="26" height="32" rx="5" fill="rgba(255,255,255,0.06)"/>
    {/* Shoulder caps */}
    <ellipse cx="42" cy="18" rx="10" ry="8" fill="rgba(255,255,255,0.10)"/>
    <ellipse cx="118" cy="18" rx="10" ry="8" fill="rgba(255,255,255,0.10)"/>
    {/* Left upper arm base */}
    <rect x="34" y="24" width="13" height="30" rx="6.5" fill="rgba(255,255,255,0.08)"/>
    {/* Right upper arm base */}
    <rect x="113" y="24" width="13" height="30" rx="6.5" fill="rgba(255,255,255,0.08)"/>
    {/* Left bicep peak — highlighted */}
    <path d="M34,30 C33,23 37,16 41,14 C47,12 52,17 51,30 C50,39 46,43 41,43 C36,43 34,39 34,30 Z"
      fill="rgba(255,255,255,0.88)"/>
    {/* Right bicep peak — highlighted */}
    <path d="M126,30 C127,23 123,16 119,14 C113,12 108,17 109,30 C110,39 114,43 119,43 C124,43 126,39 126,30 Z"
      fill="rgba(255,255,255,0.88)"/>
    {/* Forearms */}
    <rect x="35" y="54" width="11" height="22" rx="5.5" fill="rgba(255,255,255,0.06)"/>
    <rect x="114" y="54" width="11" height="22" rx="5.5" fill="rgba(255,255,255,0.06)"/>
    {/* Curl arc */}
    <path d="M37,76 Q28,62 38,48" stroke="rgba(255,255,255,0.24)" strokeWidth="2" strokeLinecap="round" fill="none" strokeDasharray="4,3"/>
    <path d="M123,76 Q132,62 122,48" stroke="rgba(255,255,255,0.24)" strokeWidth="2" strokeLinecap="round" fill="none" strokeDasharray="4,3"/>
  </svg>
);

const SVG_TRICEPS = () => (
  <svg viewBox="0 0 160 90" fill="none" xmlns="http://www.w3.org/2000/svg"
    style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
    {/* Torso */}
    <rect x="67" y="12" width="26" height="32" rx="5" fill="rgba(255,255,255,0.06)"/>
    {/* Shoulder caps */}
    <ellipse cx="42" cy="18" rx="10" ry="8" fill="rgba(255,255,255,0.10)"/>
    <ellipse cx="118" cy="18" rx="10" ry="8" fill="rgba(255,255,255,0.10)"/>
    {/* Left upper arm */}
    <rect x="34" y="24" width="13" height="30" rx="6.5" fill="rgba(255,255,255,0.07)"/>
    {/* Right upper arm */}
    <rect x="113" y="24" width="13" height="30" rx="6.5" fill="rgba(255,255,255,0.07)"/>
    {/* Left tricep horseshoe — highlighted */}
    <path d="M49,20 C55,17 62,22 61,33 C60,42 55,46 49,46 L39,46 C33,46 28,42 27,33 C26,22 33,17 39,20"
      stroke="rgba(255,255,255,0.88)" strokeWidth="5.5" strokeLinecap="round" fill="none"/>
    {/* Right tricep horseshoe — highlighted */}
    <path d="M111,20 C117,17 124,22 123,33 C122,42 117,46 111,46 L101,46 C95,46 90,42 89,33 C88,22 95,17 101,20"
      stroke="rgba(255,255,255,0.88)" strokeWidth="5.5" strokeLinecap="round" fill="none"/>
    {/* Extension lines */}
    <line x1="44" y1="46" x2="44" y2="68" stroke="rgba(255,255,255,0.30)" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="4,3"/>
    <line x1="106" y1="46" x2="106" y2="68" stroke="rgba(255,255,255,0.30)" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="4,3"/>
  </svg>
);

const SVG_CORE = () => (
  <svg viewBox="0 0 160 90" fill="none" xmlns="http://www.w3.org/2000/svg"
    style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
    {/* Obliques */}
    <path d="M65,10 C58,13 50,24 48,40 C46,51 50,63 63,66 L65,57 C57,55 55,44 57,33 C59,22 63,13 65,10 Z"
      fill="rgba(255,255,255,0.16)"/>
    <path d="M95,10 C102,13 110,24 112,40 C114,51 110,63 97,66 L95,57 C103,55 105,44 103,33 C101,22 97,13 95,10 Z"
      fill="rgba(255,255,255,0.16)"/>
    {/* 6-pack grid — highlighted */}
    <rect x="65" y="10" width="13" height="13" rx="3" fill="rgba(255,255,255,0.84)"/>
    <rect x="82" y="10" width="13" height="13" rx="3" fill="rgba(255,255,255,0.84)"/>
    <rect x="65" y="26" width="13" height="13" rx="3" fill="rgba(255,255,255,0.84)"/>
    <rect x="82" y="26" width="13" height="13" rx="3" fill="rgba(255,255,255,0.84)"/>
    <rect x="65" y="42" width="13" height="13" rx="3" fill="rgba(255,255,255,0.84)"/>
    <rect x="82" y="42" width="13" height="13" rx="3" fill="rgba(255,255,255,0.84)"/>
    {/* Lower abs / transverse */}
    <rect x="68" y="58" width="24" height="8" rx="3" fill="rgba(255,255,255,0.30)"/>
    {/* Hip */}
    <ellipse cx="80" cy="72" rx="23" ry="7" fill="rgba(255,255,255,0.09)"/>
  </svg>
);

// ── Thumbnail component ────────────────────────────────────────────────────────
// Renders gradient + SVG illustration or real media if available

const MUSCLE_SVG_MAP = {
  pecho:   SVG_PECHO,
  espalda: SVG_ESPALDA,
  pierna:  SVG_PIERNA,
  hombro:  SVG_HOMBRO,
  biceps:  SVG_BICEPS,
  triceps: SVG_TRICEPS,
  core:    SVG_CORE,
};

function ExerciseThumbnailMedia({ exercise, group, isAdded, height = 92 }) {
  const gs = EXERCISE_GROUP_STYLE[group] || EXERCISE_GROUP_STYLE.core;
  const SvgComp = MUSCLE_SVG_MAP[group] || SVG_CORE;

  // ── Future media support ────────────────────────────────────────────────────
  // When exercise.mediaUrl is set:
  //   mediaType === 'video' → <video autoPlay loop muted playsInline>
  //   mediaType === 'gif'   → <img> (animated)
  //   mediaType === 'image' → <img> with objectFit: cover
  if (exercise.mediaUrl) {
    const commonStyle = { width: '100%', height: height, objectFit: 'cover', display: 'block' };
    if (exercise.mediaType === 'video') {
      return (
        <div style={{ position: 'relative', height, overflow: 'hidden', flexShrink: 0 }}>
          <video
            src={exercise.mediaUrl}
            autoPlay loop muted playsInline
            style={commonStyle}
          />
          {isAdded && <AddedOverlay />}
        </div>
      );
    }
    return (
      <div style={{ position: 'relative', height, overflow: 'hidden', flexShrink: 0 }}>
        <img src={exercise.mediaUrl} alt={exercise.name} style={commonStyle} />
        {isAdded && <AddedOverlay />}
      </div>
    );
  }

  // ── SVG illustration placeholder ───────────────────────────────────────────
  return (
    <div style={{
      height, flexShrink: 0,
      background: `linear-gradient(140deg, ${gs.from} 0%, ${gs.to} 100%)`,
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Subtle dot texture */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'radial-gradient(rgba(255,255,255,0.06) 1px, transparent 1px)',
        backgroundSize: '16px 16px',
      }} />

      {/* Muscle SVG illustration */}
      <SvgComp />

      {/* Compound badge */}
      {exercise.compound && (
        <div style={{
          position: 'absolute', top: 8, left: 8,
          fontFamily: 'ui-monospace,Menlo,monospace', fontSize: 8, fontWeight: 700,
          color: 'rgba(255,255,255,0.55)', letterSpacing: 0.6,
          background: 'rgba(0,0,0,0.25)', padding: '2px 6px', borderRadius: 4,
        }}>CPT</div>
      )}

      {/* Added overlay */}
      {isAdded && <AddedOverlay />}
    </div>
  );
}

function AddedOverlay() {
  return (
    <div style={{
      position: 'absolute', inset: 0,
      background: 'rgba(23,115,44,0.52)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{
        width: 30, height: 30, borderRadius: '50%',
        background: 'rgba(255,255,255,0.95)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 15,
      }}>✓</div>
    </div>
  );
}

const ExerciseMedia = {
  Thumbnail: ExerciseThumbnailMedia,
  GROUP_STYLE: EXERCISE_GROUP_STYLE,
  SVGS: MUSCLE_SVG_MAP,
};

Object.assign(window, { ExerciseMedia });
