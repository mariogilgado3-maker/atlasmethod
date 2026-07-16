// Aula — Editorial knowledge feed

// ── Design tokens ─────────────────────────────────────────────────────────────
const AL = {
  page:   '#FAFAF7',
  card:   '#FFFFFF',
  navy:   '#0F1A2E',
  sub:    '#5C6477',
  muted:  '#9498A4',
  border: 'rgba(15,26,46,0.07)',
  bord2:  'rgba(15,26,46,0.11)',
};

const ALcat = {
  hipertrofia:  { label:'Hipertrofia',  c:'#059669', bg:'rgba(5,150,105,0.09)',   dot:'#10B981', grad:'135deg,#082e1d 0%,#0d5c3a 100%' },
  fuerza:       { label:'Fuerza',       c:'#1E40AF', bg:'rgba(30,64,175,0.08)',   dot:'#3B82F6', grad:'135deg,#08102e 0%,#1a2e70 100%' },
  nutricion:    { label:'Nutrición',    c:'#B45309', bg:'rgba(180,83,9,0.09)',    dot:'#F59E0B', grad:'135deg,#2e1a05 0%,#704215 100%' },
  recuperacion: { label:'Recuperación', c:'#0369A1', bg:'rgba(3,105,161,0.08)',   dot:'#38BDF8', grad:'135deg,#041824 0%,#093a5c 100%' },
  cognitivo:    { label:'Cognitivo',    c:'#6D28D9', bg:'rgba(109,40,217,0.08)',  dot:'#A78BFA', grad:'135deg,#120a2e 0%,#3d1a8a 100%' },
  sueno:        { label:'Sueño',        c:'#0F766E', bg:'rgba(15,118,110,0.09)',  dot:'#2DD4BF', grad:'135deg,#04201e 0%,#0a4a45 100%' },
  biomecánica:  { label:'Biomecánica',  c:'#be123c', bg:'rgba(190,18,60,0.08)',   dot:'#FB7185', grad:'135deg,#240510 0%,#700a1e 100%' },
  suplementos:  { label:'Suplementos',  c:'#7C3AED', bg:'rgba(124,58,237,0.08)',  dot:'#C4B5FD', grad:'135deg,#130a2e 0%,#4a1a8c 100%' },
};

const EVIDENCE_LABEL = {
  'meta-analysis':'Meta-análisis', rct:'ECA', cohort:'Cohorte',
  review:'Revisión', 'expert-opinion':'Experto',
};

// ── Curated fitness photos (Unsplash CDN) ────────────────────────────────────
const AULA_PHOTOS = {
  hipertrofia: [
    'https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=900&q=80&fit=crop',
    'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=900&q=80&fit=crop',
    'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=900&q=80&fit=crop',
  ],
  fuerza: [
    'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=900&q=80&fit=crop',
    'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=900&q=80&fit=crop',
    'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=900&q=80&fit=crop',
  ],
  nutricion: [
    'https://images.unsplash.com/photo-1547592180-85f173990554?w=900&q=80&fit=crop',
    'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=900&q=80&fit=crop',
  ],
  recuperacion: [
    'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=900&q=80&fit=crop',
    'https://images.unsplash.com/photo-1552673597-e3cd6747a996?w=900&q=80&fit=crop',
  ],
  cognitivo: [
    'https://images.unsplash.com/photo-1542596081-6a9405c1827d?w=900&q=80&fit=crop',
    'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=900&q=80&fit=crop',
  ],
  sueno: [
    'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=900&q=80&fit=crop',
    'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=900&q=80&fit=crop',
  ],
  biomecánica: [
    'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=900&q=80&fit=crop',
    'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=900&q=80&fit=crop',
  ],
  suplementos: [
    'https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=900&q=80&fit=crop',
    'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=900&q=80&fit=crop',
  ],
};

const VIDEO_PHOTOS = {
  fuerza:      'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=520&q=80&fit=crop',
  hipertrofia: 'https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=520&q=80&fit=crop',
  nutricion:   'https://images.unsplash.com/photo-1547592180-85f173990554?w=520&q=80&fit=crop',
  recuperacion:'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=520&q=80&fit=crop',
};

// ── Static content ─────────────────────────────────────────────────────────────
const MICRO_TIPS = [
  { type:'fact',  label:'¿Sabías que?',     icon:'🔬', text:'Entrenar 2× por músculo/semana produce hasta un 22% más de hipertrofia que 1× con el mismo volumen total.' },
  { type:'myth',  label:'Mito derribado',   icon:'✗',  text:'El cardio no quema músculo si mantienes 1.6 g/kg de proteína. El problema es el déficit calórico excesivo.' },
  { type:'tip',   label:'Tip rápido',       icon:'⚡', text:'RPE 8 = puedes hacer 2 reps más. Autorregula la carga diaria sin necesitar tests de 1RM.' },
  { type:'error', label:'Error común',      icon:'⚠',  text:'Más series ≠ más músculo. Pasadas las 20–22 series/sesión, la calidad del estímulo cae y la fatiga sube.' },
  { type:'fact',  label:'Ciencia aplicada', icon:'📊', text:'La ventana anabólica post-entreno es real pero cómoda: tienes 2–4 horas para comer proteína, no 30 minutos.' },
  { type:'tip',   label:'Tip rápido',       icon:'💤', text:'La GH se libera principalmente en sueño N3. Menos de 6h de sueño puede reducir la síntesis proteica nocturna en un 30%.' },
];

const SCIENCE_NEWS = [
  { date:'May 2026', finding:'Entrenar de noche no perjudica el sueño en personas sanas y activas', application:'El horario importa menos que la consistencia. Entrena cuando puedas cumplir con más frecuencia.', source:'Sports Medicine (2026)' },
  { date:'Abr 2026', finding:'La creatina mejora la recuperación muscular incluso en atletas con dieta alta en proteína', application:'3–5 g/día es la dosis efectiva sin carga. El efecto es acumulativo a las 2–4 semanas.', source:'JISSN (2026)' },
  { date:'Mar 2026', finding:'El entrenamiento excéntrico lento produce hasta un 15% más de hipertrofia que el concéntrico puro', application:'Baja el peso en 3–4 segundos. La fase excéntrica es tan importante como la concéntrica.', source:'Eur J Applied Physiol (2026)' },
  { date:'Feb 2026', finding:'Deloads de solo 5–7 días son suficientes para restaurar la capacidad de entrenamiento en atletas intermedios', application:'Una semana ligera cada 4–6 semanas es suficiente. No necesitas semanas enteras de descanso total.', source:'J Strength Cond Res (2026)' },
];

const VIDEOS = [
  { id:'v1', title:'Técnica de sentadilla — análisis biomecánico', duration:'8:32', cat:'fuerza',       views:'2.4k', desc:'Las 5 fallas más comunes y cómo corregirlas.' },
  { id:'v2', title:'¿Hay que entrenar al fallo?',                   duration:'6:15', cat:'hipertrofia',  views:'3.8k', desc:'Cuándo el fallo muscular ayuda y cuándo frena.' },
  { id:'v3', title:'La ventana anabólica: mito vs realidad',        duration:'4:50', cat:'nutricion',    views:'5.1k', desc:'Lo que dice la evidencia actual sobre el timing.' },
  { id:'v4', title:'HRV: cómo leer tu recuperación cada mañana',    duration:'7:22', cat:'recuperacion', views:'1.9k', desc:'Interpretación práctica sin gadgets caros.' },
];

const EXPLORE_TOPICS = [
  { id:'hipertrofia',  emoji:'↑',  count:4 },
  { id:'fuerza',       emoji:'⊕',  count:3 },
  { id:'nutricion',    emoji:'◉',  count:2 },
  { id:'recuperacion', emoji:'○',  count:3 },
  { id:'cognitivo',    emoji:'◎',  count:1 },
  { id:'sueno',        emoji:'⌁',  count:2 },
];

// ── Cover visual ──────────────────────────────────────────────────────────────
function AlCover({ category, height, radius, style, imgIdx }) {
  const [imgOk, setImgOk] = React.useState(true);
  const m = ALcat[category] || ALcat.fuerza;
  const h = height || 180;
  const photos = AULA_PHOTOS[category] || AULA_PHOTOS.hipertrofia;
  const photo  = photos[(imgIdx || 0) % photos.length];

  return (
    <div style={{
      width: '100%', height: h,
      background: `linear-gradient(${m.grad})`,
      borderRadius: radius !== undefined ? radius : 0,
      position: 'relative', overflow: 'hidden',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0,
      ...style,
    }}>
      {/* Real photo */}
      {imgOk && (
        <img
          src={photo}
          alt=""
          loading="lazy"
          onError={() => setImgOk(false)}
          style={{
            position: 'absolute', inset: 0,
            width: '100%', height: '100%',
            objectFit: 'cover', objectPosition: 'center 25%',
            filter: 'grayscale(1) contrast(1.08) brightness(0.88)',
          }}
        />
      )}

      {/* Dark gradient overlay — always present for text readability */}
      <div style={{
        position: 'absolute', inset: 0,
        background: imgOk
          ? 'linear-gradient(160deg, rgba(0,0,0,0.28) 0%, rgba(0,0,0,0.60) 100%)'
          : 'linear-gradient(rgba(255,255,255,0.028) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.028) 1px,transparent 1px)',
        backgroundSize: imgOk ? 'auto' : '30px 30px',
      }} />
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.32) 0%, transparent 55%)' }} />

      {/* Gradient fallback decorations */}
      {!imgOk && (
        <>
          <div style={{ position:'absolute', width:220, height:220, borderRadius:'50%', border:'1px solid rgba(255,255,255,0.05)', right:-70, bottom:-70 }} />
          <div style={{ position:'absolute', width:100, height:100, borderRadius:'50%', border:'1px solid rgba(255,255,255,0.04)', left:-20, top:-20 }} />
          <span style={{
            fontFamily:'"Space Grotesk",system-ui', fontStyle:'normal', fontWeight:700,
            fontSize: Math.min(h * 0.45, 64), color:'rgba(255,255,255,0.08)',
            letterSpacing:-2, userSelect:'none', position:'relative', zIndex:1,
          }}>
            {m.label}
          </span>
        </>
      )}
    </div>
  );
}

// ── Evidence badge ────────────────────────────────────────────────────────────
function AlEvBadge({ level }) {
  if (!level || !EVIDENCE_LABEL[level]) return null;
  return (
    <span style={{
      padding:'2px 8px', borderRadius:5,
      background:'rgba(15,26,46,0.05)', color:AL.muted,
      fontFamily:'ui-monospace,Menlo,monospace', fontSize:10, fontWeight:700, letterSpacing:0.3,
    }}>
      {EVIDENCE_LABEL[level]}
    </span>
  );
}

// ── "Nuevo" badge — shown for an article's first 2 weeks ──────────────────────
function AlNewBadge({ article }) {
  const isNew = (typeof ArticlesService !== 'undefined' && ArticlesService.isNew)
    ? ArticlesService.isNew(article) : false;
  if (!isNew) return null;
  return (
    <span style={{
      display:'inline-flex', alignItems:'center', gap:4,
      padding:'2px 9px', borderRadius:5,
      background:'rgba(5,150,105,0.10)', color:'#059669',
      fontFamily:'"Inter",system-ui', fontSize:10, fontWeight:800, letterSpacing:0.4, textTransform:'uppercase',
    }}>
      <span style={{ width:5, height:5, borderRadius:'50%', background:'#059669', display:'block' }} />
      Nuevo
    </span>
  );
}

// Format an ISO publish date as e.g. "10 ene 2026"
function alFmtPubDate(iso) {
  if (!iso) return '';
  const t = Date.parse(iso);
  if (isNaN(t)) return '';
  try { return new Date(t).toLocaleDateString('es-ES', { day:'numeric', month:'short', year:'numeric' }); }
  catch { return ''; }
}

// ── Category pill ─────────────────────────────────────────────────────────────
function AlCatPill({ category }) {
  const m = ALcat[category] || ALcat.fuerza;
  return (
    <span style={{
      padding:'2px 9px', borderRadius:5,
      background:m.bg, color:m.c,
      fontFamily:'"Inter",system-ui', fontSize:11, fontWeight:700,
    }}>
      {m.label}
    </span>
  );
}

// ── Hero ──────────────────────────────────────────────────────────────────────
function AulaHero({ total, completed, query, onQuery }) {
  return (
    <div style={{ paddingBottom: 40, marginBottom: 40, borderBottom: `1px solid ${AL.border}` }}>
      <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:16 }}>
        <div style={{ width:7, height:7, borderRadius:'50%', background:'#10B981' }} />
        <span style={{ fontFamily:'"Inter",system-ui', fontSize:11, fontWeight:700, letterSpacing:2, textTransform:'uppercase', color:AL.muted }}>Aula Atlas</span>
      </div>

      <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'space-between', gap:24, flexWrap:'wrap' }}>
        <div style={{ maxWidth:600 }}>
          <h1 style={{
            fontFamily:'"Space Grotesk",system-ui', fontWeight:700,
            fontSize:54, color:AL.navy, letterSpacing:-2.5,
            lineHeight:0.98, margin:'0 0 18px',
          }}>
            Entrena con evidencia.
          </h1>
          <p style={{ fontFamily:'"Inter",system-ui', fontSize:17, color:AL.sub, lineHeight:1.55, margin:0, letterSpacing:-0.2, maxWidth:520 }}>
            Ciencia aplicada al entrenamiento. Sin dogma, sin ruido. Solo lo que funciona.
          </p>
        </div>

        <div style={{ display:'flex', flexDirection:'column', gap:6, alignItems:'flex-end' }}>
          {/* Search */}
          <div style={{ position:'relative' }}>
            <span style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:AL.muted, fontSize:14, pointerEvents:'none' }}>⌕</span>
            <input
              value={query} onChange={e => onQuery(e.target.value)}
              placeholder="Buscar artículos…"
              style={{
                padding:'10px 14px 10px 34px', borderRadius:12,
                border:`1px solid ${AL.bord2}`, background:'#FFFFFF',
                color:AL.navy, fontFamily:'"Inter",system-ui', fontSize:13,
                outline:'none', width:220,
              }}
            />
          </div>
          {/* Stats */}
          {completed > 0 && (
            <span style={{
              padding:'5px 12px', borderRadius:999,
              background:'rgba(5,150,105,0.07)', border:'1px solid rgba(5,150,105,0.14)',
              fontFamily:'"Inter",system-ui', fontSize:11, color:'#059669', fontWeight:700,
            }}>
              ✓ {completed} leído{completed !== 1 ? 's' : ''} · +{completed * 15} 💎
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Category filter strip ─────────────────────────────────────────────────────
function AlCatStrip({ active, onChange }) {
  const cats = [['all','Todos'], ...Object.entries(ALcat).filter(([k]) => ['hipertrofia','fuerza','nutricion','recuperacion','cognitivo','sueno'].includes(k)).map(([k,v]) => [k,v.label])];
  return (
    <div style={{ display:'flex', gap:6, marginBottom:40, flexWrap:'wrap' }}>
      {cats.map(([key, label]) => {
        const m = ALcat[key];
        const act = active === key;
        return (
          <button key={key} onClick={() => onChange(key)} style={{
            padding:'7px 15px', borderRadius:999, border:'none', cursor:'pointer',
            background: act ? AL.navy : 'rgba(15,26,46,0.05)',
            color: act ? '#FAFAF7' : AL.sub,
            fontFamily:'"Inter",system-ui', fontSize:13, fontWeight: act ? 700 : 500,
            transition:'all .15s',
          }}>
            {m && !act && (
              <span style={{ display:'inline-block', width:6, height:6, borderRadius:'50%', background:m.dot, marginRight:6, verticalAlign:'middle', marginTop:-1 }} />
            )}
            {label}
          </button>
        );
      })}
    </div>
  );
}

// ── Featured article (horizontal hero card) ───────────────────────────────────
function AulaFeatured({ article, isRead, onOpen }) {
  const [hov, setHov] = React.useState(false);
  const m = ALcat[article.category] || ALcat.fuerza;

  return (
    <div
      onClick={() => onOpen(article.id)}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display:'grid', gridTemplateColumns:'1fr 1fr',
        borderRadius:24, overflow:'hidden',
        background:AL.card, border:`1px solid ${AL.border}`,
        cursor:'pointer',
        boxShadow: hov ? '0 24px 64px rgba(15,26,46,0.15)' : '0 4px 20px rgba(15,26,46,0.07)',
        transform: hov ? 'translateY(-4px)' : 'none',
        transition:'all .3s cubic-bezier(.2,.8,.2,1)',
        marginBottom:56,
      }}
    >
      {/* Left: cover */}
      <div style={{ position:'relative', overflow:'hidden' }}>
        <AlCover category={article.category} height={340} imgIdx={0} />
        <div style={{
          position:'absolute', top:16, left:16,
          padding:'4px 10px', borderRadius:6,
          background:'rgba(0,0,0,0.40)', backdropFilter:'blur(10px)',
          fontFamily:'ui-monospace,Menlo,monospace', fontSize:9, fontWeight:700,
          color:'rgba(255,255,255,0.92)', letterSpacing:1.2,
        }}>DESTACADO DEL DÍA</div>
        {isRead && (
          <div style={{
            position:'absolute', top:16, right:16,
            padding:'4px 10px', borderRadius:6,
            background:'rgba(5,150,105,0.75)', backdropFilter:'blur(8px)',
            fontFamily:'"Inter",system-ui', fontSize:10, fontWeight:700, color:'#fff',
          }}>✓ Leído</div>
        )}
      </div>

      {/* Right: content */}
      <div style={{ padding:'36px 40px', display:'flex', flexDirection:'column', justifyContent:'center' }}>
        <div style={{ display:'flex', gap:8, marginBottom:20, flexWrap:'wrap', alignItems:'center' }}>
          <AlNewBadge article={article} />
          <AlCatPill category={article.category} />
          <AlEvBadge level={article.evidenceLevel} />
          {alFmtPubDate(article.publishedAt) && (
            <span style={{ fontFamily:'"Inter",system-ui', fontSize:11, color:AL.muted, fontWeight:600 }}>{alFmtPubDate(article.publishedAt)}</span>
          )}
        </div>

        <h2 style={{ fontFamily:'"Space Grotesk",system-ui', fontSize:30, fontWeight:700, color:AL.navy, letterSpacing:-1.2, lineHeight:1.08, margin:'0 0 12px' }}>
          {article.title}
        </h2>
        <p style={{ fontFamily:'"Inter",system-ui', fontSize:14, color:AL.sub, margin:'0 0 16px', lineHeight:1.45, fontWeight:500, letterSpacing:0.1 }}>
          {article.subtitle}
        </p>
        <p style={{
          fontFamily:'"Inter",system-ui', fontSize:14, color:AL.sub, lineHeight:1.65,
          margin:'0 0 28px',
          display:'-webkit-box', WebkitLineClamp:3, WebkitBoxOrient:'vertical', overflow:'hidden',
        }}>
          {article.summary}
        </p>

        <div style={{ display:'flex', alignItems:'center', gap:14 }}>
          <span style={{
            padding:'11px 22px', borderRadius:12,
            background:AL.navy, color:'#FAFAF7',
            fontFamily:'"Inter",system-ui', fontSize:13, fontWeight:700,
            transition:'opacity .15s',
          }}>
            Ver análisis →
          </span>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <span style={{ fontFamily:'"Inter",system-ui', fontSize:12, color:AL.muted, fontWeight:500 }}>{article.readTime} min</span>
            {!isRead && <span style={{ fontFamily:'"Inter",system-ui', fontSize:12, color:'#059669', fontWeight:700 }}>+{article.gems} 💎</span>}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Feed card ─────────────────────────────────────────────────────────────────
function AulaCard({ article, isRead, onOpen, imgIdx }) {
  const [hov, setHov] = React.useState(false);
  return (
    <div
      onClick={() => onOpen(article.id)}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        borderRadius:20, overflow:'hidden',
        background:AL.card, border:`1px solid ${AL.border}`,
        cursor:'pointer',
        boxShadow: hov ? '0 16px 48px rgba(15,26,46,0.12)' : '0 2px 8px rgba(15,26,46,0.05)',
        transform: hov ? 'translateY(-5px)' : 'none',
        transition:'all .25s cubic-bezier(.2,.8,.2,1)',
      }}
    >
      <div style={{ position:'relative', overflow:'hidden' }}>
        <AlCover category={article.category} height={168} imgIdx={(imgIdx || 0) + 1} />
        {isRead && (
          <div style={{
            position:'absolute', top:12, right:12,
            width:22, height:22, borderRadius:'50%',
            background:'rgba(5,150,105,0.8)', backdropFilter:'blur(6px)',
            display:'flex', alignItems:'center', justifyContent:'center',
            fontFamily:'"Inter",system-ui', fontSize:11, color:'#fff', fontWeight:700,
          }}>✓</div>
        )}
      </div>

      <div style={{ padding:'18px 22px 22px' }}>
        <div style={{ display:'flex', gap:7, marginBottom:12, alignItems:'center', flexWrap:'wrap' }}>
          <AlNewBadge article={article} />
          <AlCatPill category={article.category} />
          <AlEvBadge level={article.evidenceLevel} />
        </div>
        <h3 style={{ fontFamily:'"Space Grotesk",system-ui', fontSize:17, fontWeight:700, color:AL.navy, letterSpacing:-0.5, lineHeight:1.2, margin:'0 0 6px' }}>
          {article.title}
        </h3>
        <p style={{ fontFamily:'"Inter",system-ui', fontSize:12, color:AL.sub, margin:'0 0 16px', lineHeight:1.5 }}>
          {article.subtitle}
        </p>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <span style={{ fontFamily:'"Inter",system-ui', fontSize:11, color:AL.muted, fontWeight:600 }}>
            {alFmtPubDate(article.publishedAt) ? `${alFmtPubDate(article.publishedAt)} · ` : ''}{article.readTime} min
          </span>
          {!isRead
            ? <span style={{ fontFamily:'"Inter",system-ui', fontSize:11, color:'#059669', fontWeight:700 }}>+{article.gems} 💎</span>
            : <span style={{ fontFamily:'"Inter",system-ui', fontSize:11, color:'#059669', fontWeight:600 }}>Completado</span>
          }
        </div>
      </div>
    </div>
  );
}

// ── Section heading ───────────────────────────────────────────────────────────
function AlSectionHead({ label, sublabel }) {
  return (
    <div style={{ display:'flex', alignItems:'baseline', gap:12, marginBottom:24 }}>
      <h2 style={{ fontFamily:'"Inter",system-ui', fontSize:22, fontWeight:800, color:AL.navy, letterSpacing:-0.8, margin:0 }}>{label}</h2>
      {sublabel && <span style={{ fontFamily:'"Inter",system-ui', fontSize:13, color:AL.muted }}>{sublabel}</span>}
    </div>
  );
}

// ── Micro-learning strip ──────────────────────────────────────────────────────
function AulaMicroLearning() {
  const typeColors = {
    fact:  { c:'#1E40AF', bg:'rgba(30,64,175,0.07)'  },
    myth:  { c:'#B45309', bg:'rgba(180,83,9,0.07)'   },
    tip:   { c:'#059669', bg:'rgba(5,150,105,0.07)'  },
    error: { c:'#be123c', bg:'rgba(190,18,60,0.07)'  },
  };

  return (
    <div style={{ marginBottom:64 }}>
      <AlSectionHead label="30 segundos de ciencia" sublabel="Datos rápidos, basados en evidencia" />
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:14 }}>
        {MICRO_TIPS.map((tip, i) => {
          const tc = typeColors[tip.type] || typeColors.fact;
          return (
            <div key={i} style={{
              padding:'20px 22px', borderRadius:18,
              background:AL.card, border:`1px solid ${AL.border}`,
              boxShadow:'0 2px 8px rgba(15,26,46,0.04)',
            }}>
              <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:12 }}>
                <span style={{
                  padding:'3px 9px', borderRadius:5,
                  background:tc.bg, color:tc.c,
                  fontFamily:'ui-monospace,Menlo,monospace', fontSize:9, fontWeight:700, letterSpacing:0.6,
                }}>
                  {tip.label.toUpperCase()}
                </span>
              </div>
              <p style={{ fontFamily:'"Inter",system-ui', fontSize:14, color:AL.navy, lineHeight:1.6, margin:0, fontWeight:500 }}>
                {tip.text}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Science feed ──────────────────────────────────────────────────────────────
function AulaScienceFeed() {
  return (
    <div style={{ marginBottom:64 }}>
      <AlSectionHead label="Avances recientes" sublabel="Últimos hallazgos con aplicación práctica" />
      <div style={{ display:'flex', flexDirection:'column', gap:2 }}>
        {SCIENCE_NEWS.map((item, i) => (
          <div key={i} style={{
            display:'grid', gridTemplateColumns:'80px 1fr 1fr',
            gap:24, padding:'22px 24px', borderRadius:16,
            background:AL.card, border:`1px solid ${AL.border}`,
            marginBottom:2,
            alignItems:'center',
          }}>
            <div>
              <div style={{ fontFamily:'ui-monospace,Menlo,monospace', fontSize:10, color:AL.muted, fontWeight:700, letterSpacing:0.5 }}>{item.date}</div>
            </div>
            <div>
              <div style={{ fontFamily:'ui-monospace,Menlo,monospace', fontSize:8, fontWeight:700, color:AL.muted, letterSpacing:1, marginBottom:6 }}>HALLAZGO</div>
              <p style={{ fontFamily:'"Inter",system-ui', fontSize:14, fontWeight:600, color:AL.navy, lineHeight:1.45, margin:0 }}>{item.finding}</p>
              <div style={{ fontFamily:'ui-monospace,Menlo,monospace', fontSize:9, color:AL.muted, marginTop:6 }}>{item.source}</div>
            </div>
            <div style={{ padding:'14px 18px', borderRadius:12, background:'rgba(5,150,105,0.05)', border:'1px solid rgba(5,150,105,0.12)' }}>
              <div style={{ fontFamily:'ui-monospace,Menlo,monospace', fontSize:8, fontWeight:700, color:'#059669', letterSpacing:1, marginBottom:6 }}>APLICACIÓN PRÁCTICA</div>
              <p style={{ fontFamily:'"Inter",system-ui', fontSize:13, color:'#047857', lineHeight:1.5, margin:0 }}>{item.application}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Video card ────────────────────────────────────────────────────────────────
function AulaVideoCard({ video }) {
  const [hov, setHov]       = React.useState(false);
  const [imgOk, setImgOk]   = React.useState(true);
  const m = ALcat[video.cat] || ALcat.fuerza;
  const photoUrl = VIDEO_PHOTOS[video.cat];

  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        borderRadius:18, overflow:'hidden',
        background:AL.card, border:`1px solid ${AL.border}`,
        cursor:'pointer',
        boxShadow: hov ? '0 12px 36px rgba(15,26,46,0.12)' : '0 2px 8px rgba(15,26,46,0.05)',
        transform: hov ? 'translateY(-3px)' : 'none',
        transition:'all .25s cubic-bezier(.2,.8,.2,1)',
        flexShrink:0, width:260,
      }}
    >
      {/* Thumbnail with real photo */}
      <div style={{ position:'relative', height:148, overflow:'hidden', background:`linear-gradient(${m.grad})` }}>
        {imgOk && photoUrl && (
          <img
            src={photoUrl}
            alt=""
            loading="lazy"
            onError={() => setImgOk(false)}
            style={{ position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover', objectPosition:'center 20%' }}
          />
        )}
        {/* Dark overlay */}
        <div style={{ position:'absolute', inset:0, background:'linear-gradient(160deg, rgba(0,0,0,0.22) 0%, rgba(0,0,0,0.55) 100%)' }} />
        {/* Play button */}
        <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center' }}>
          <div style={{
            width:46, height:46, borderRadius:'50%',
            background:'rgba(255,255,255,0.18)', backdropFilter:'blur(12px)',
            border:'1.5px solid rgba(255,255,255,0.35)',
            display:'flex', alignItems:'center', justifyContent:'center',
            transform: hov ? 'scale(1.12)' : 'scale(1)',
            transition:'transform .2s',
          }}>
            <div style={{ width:0, height:0, borderTop:'8px solid transparent', borderBottom:'8px solid transparent', borderLeft:'14px solid rgba(255,255,255,0.92)', marginLeft:3 }} />
          </div>
        </div>
        {/* Duration badge */}
        <div style={{
          position:'absolute', bottom:10, right:10,
          padding:'3px 8px', borderRadius:5,
          background:'rgba(0,0,0,0.65)', backdropFilter:'blur(6px)',
          fontFamily:'ui-monospace,Menlo,monospace', fontSize:11, color:'#fff', fontWeight:700,
        }}>{video.duration}</div>
      </div>

      <div style={{ padding:'14px 18px 18px' }}>
        <div style={{ display:'flex', gap:7, marginBottom:8, alignItems:'center' }}>
          <span style={{ padding:'2px 8px', borderRadius:4, background:m.bg, color:m.c, fontFamily:'"Inter",system-ui', fontSize:10, fontWeight:700 }}>{m.label}</span>
          <span style={{ fontFamily:'"Inter",system-ui', fontSize:10, color:AL.muted }}>{video.views} vistas</span>
        </div>
        <div style={{ fontFamily:'"Inter",system-ui', fontSize:14, fontWeight:700, color:AL.navy, lineHeight:1.3, marginBottom:5 }}>{video.title}</div>
        <div style={{ fontFamily:'"Inter",system-ui', fontSize:12, color:AL.sub }}>{video.desc}</div>
      </div>
    </div>
  );
}

// ── Videos section ────────────────────────────────────────────────────────────
function AulaVideos() {
  return (
    <div style={{ marginBottom:64 }}>
      <AlSectionHead label="Vídeos y análisis" sublabel="Contenido visual para aprender más rápido" />
      <div style={{ display:'flex', gap:16, overflowX:'auto', paddingBottom:8, scrollbarWidth:'thin' }}>
        {VIDEOS.map(v => <AulaVideoCard key={v.id} video={v} />)}
      </div>
    </div>
  );
}

// ── Explore by topic ──────────────────────────────────────────────────────────
function AulaExplore({ onCategory }) {
  return (
    <div style={{ marginBottom:64 }}>
      <AlSectionHead label="Explorar por tema" sublabel="Elige lo que quieres aprender hoy" />
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10 }}>
        {EXPLORE_TOPICS.map(topic => {
          const m = ALcat[topic.id] || ALcat.fuerza;
          return (
            <button
              key={topic.id}
              onClick={() => onCategory(topic.id)}
              style={{
                padding:'20px 22px', borderRadius:16, border:`1px solid ${AL.border}`,
                background:AL.card, cursor:'pointer', textAlign:'left',
                transition:'all .2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = m.bg; e.currentTarget.style.borderColor = m.c.replace(')',',0.25)').replace('rgb','rgba'); }}
              onMouseLeave={e => { e.currentTarget.style.background = AL.card; e.currentTarget.style.borderColor = AL.border; }}
            >
              <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:6 }}>
                <div style={{ width:8, height:8, borderRadius:'50%', background:m.dot }} />
                <span style={{ fontFamily:'"Inter",system-ui', fontSize:15, fontWeight:700, color:AL.navy }}>{m.label}</span>
              </div>
              <div style={{ fontFamily:'"Inter",system-ui', fontSize:12, color:AL.muted }}>{topic.count} artículo{topic.count !== 1 ? 's' : ''}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── Article detail (kept from v1, style polish) ───────────────────────────────
function AulaDetail({ article, isRead, onBack, onMarkRead, allArticles, completedIds, onOpen, onAskCoach }) {
  const [openSecs, setOpenSecs] = React.useState({ 0:true });
  const [showAi, setShowAi]     = React.useState(false);
  const m  = ALcat[article.category] || ALcat.fuerza;
  const ev = EVIDENCE_LABEL;
  const toggle = i => setOpenSecs(s => ({ ...s, [i]: !s[i] }));

  return (
    <div style={{ maxWidth:740, margin:'0 auto' }}>
      <button onClick={onBack} style={{ display:'inline-flex', alignItems:'center', gap:8, marginBottom:36, background:'none', border:'none', cursor:'pointer', fontFamily:'"Inter",system-ui', fontSize:14, fontWeight:600, color:AL.muted, padding:0 }}>
        ← Volver al Aula
      </button>

      <div style={{ marginBottom:36, borderRadius:20, overflow:'hidden' }}>
        <AlCover category={article.category} height={280} radius={20} imgIdx={2} />
      </div>

      <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:14, flexWrap:'wrap' }}>
        <AlNewBadge article={article} />
        <AlCatPill category={article.category} />
        <AlEvBadge level={article.evidenceLevel} />
        {alFmtPubDate(article.publishedAt) && (
          <span style={{ fontFamily:'"Inter",system-ui', fontSize:12, color:AL.muted }}>· {alFmtPubDate(article.publishedAt)}</span>
        )}
        <span style={{ fontFamily:'"Inter",system-ui', fontSize:12, color:AL.muted }}>· {article.readTime} min lectura</span>
        {article.publishYear && article.journal && (
          <span style={{ fontFamily:'"Inter",system-ui', fontSize:12, color:AL.muted }}>· {article.journal} ({article.publishYear})</span>
        )}
      </div>

      <h1 style={{ fontFamily:'"Space Grotesk",system-ui', fontSize:40, fontWeight:700, color:AL.navy, letterSpacing:-1.8, lineHeight:1.02, margin:'0 0 10px' }}>
        {article.title}
      </h1>
      <p style={{ fontFamily:'"Inter",system-ui', fontSize:17, color:AL.sub, margin:'0 0 8px', fontWeight:500, letterSpacing:-0.2 }}>
        {article.subtitle}
      </p>
      {article.authors?.length > 0 && (
        <p style={{ fontFamily:'"Inter",system-ui', fontSize:13, color:AL.muted, margin:'0 0 32px' }}>
          {article.authors.join(', ')}
          {article.doi && <span> · <a href={'https://doi.org/' + article.doi} target="_blank" rel="noopener noreferrer" style={{ color:'#1a4fa0', textDecoration:'none' }}>doi:{article.doi}</a></span>}
        </p>
      )}

      {/* Abstract */}
      <div style={{ padding:'20px 24px', borderRadius:16, background:'rgba(15,26,46,0.03)', border:`1px solid ${AL.border}`, marginBottom:24 }}>
        <div style={{ fontFamily:'ui-monospace,Menlo,monospace', fontSize:9, fontWeight:700, color:AL.muted, letterSpacing:1, marginBottom:10 }}>ABSTRACT</div>
        <p style={{ fontFamily:'"Inter",system-ui', fontSize:15, color:'#3A4257', lineHeight:1.65, margin:0 }}>{article.summary}</p>
      </div>

      {/* AI summary */}
      {article.aiSummary && (
        <div style={{ marginBottom:24 }}>
          <button onClick={() => setShowAi(s=>!s)} style={{ display:'flex', alignItems:'center', gap:8, background:'none', border:'none', cursor:'pointer', padding:0, fontFamily:'"Inter",system-ui', fontSize:13, fontWeight:700, color:AL.navy }}>
            <span style={{ width:22, height:22, borderRadius:999, background:AL.navy, color:'#FAFAF7', display:'inline-flex', alignItems:'center', justifyContent:'center', fontSize:10, fontWeight:800 }}>A</span>
            Resumen IA {showAi ? '↑' : '↓'}
          </button>
          {showAi && (
            <div style={{ marginTop:10, padding:'16px 20px', borderRadius:14, background:'rgba(15,26,46,0.03)', border:`1px solid ${AL.border}` }}>
              <p style={{ fontFamily:'"Inter",system-ui', fontSize:14, color:AL.navy, lineHeight:1.55, margin:0 }}>"{article.aiSummary}"</p>
            </div>
          )}
        </div>
      )}

      {/* Sections */}
      <div style={{ display:'flex', flexDirection:'column', gap:2, marginBottom:32 }}>
        {article.sections.map((s, i) => (
          <div key={i} style={{ borderRadius:14, overflow:'hidden', border:`1px solid ${AL.border}` }}>
            <button onClick={() => toggle(i)} style={{ width:'100%', textAlign:'left', padding:'16px 20px', background: openSecs[i] ? AL.navy : AL.card, border:'none', cursor:'pointer', display:'flex', justifyContent:'space-between', alignItems:'center', transition:'background .2s' }}>
              <span style={{ fontFamily:'"Inter",system-ui', fontSize:15, fontWeight:700, color: openSecs[i] ? '#FAFAF7' : AL.navy, letterSpacing:-0.3 }}>{s.heading}</span>
              <span style={{ color: openSecs[i] ? 'rgba(250,250,247,0.5)' : AL.muted, fontSize:11 }}>{openSecs[i] ? '↑' : '↓'}</span>
            </button>
            {openSecs[i] && (
              <div style={{ padding:'18px 20px', background:AL.page }}>
                <p style={{ fontFamily:'"Inter",system-ui', fontSize:14, color:'#3A4257', lineHeight:1.7, margin:0 }}>{s.body}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* References */}
      {article.refs?.length > 0 && (
        <div style={{ padding:'18px 22px', borderRadius:14, background:AL.page, border:`1px solid ${AL.border}`, marginBottom:32 }}>
          <div style={{ fontFamily:'ui-monospace,Menlo,monospace', fontSize:9, fontWeight:700, color:AL.muted, letterSpacing:1, marginBottom:12 }}>REFERENCIAS</div>
          {article.refs.map((ref, i) => (
            <p key={i} style={{ fontFamily:'"Inter",system-ui', fontSize:12, color:AL.sub, lineHeight:1.55, margin:'0 0 8px', paddingLeft:14, borderLeft:'2px solid rgba(15,26,46,0.1)' }}>{ref}</p>
          ))}
        </div>
      )}

      {/* Read CTA */}
      <div style={{ padding:'22px 26px', borderRadius:18, background: isRead ? 'rgba(5,150,105,0.07)' : AL.navy, border: isRead ? '1px solid rgba(5,150,105,0.16)' : 'none', display:'flex', alignItems:'center', justifyContent:'space-between', gap:16 }}>
        {isRead ? (
          <div style={{ fontFamily:'"Inter",system-ui', fontSize:14, fontWeight:700, color:'#059669' }}>✓ Artículo completado · gemas acreditadas</div>
        ) : (
          <>
            <div>
              <div style={{ fontFamily:'"Inter",system-ui', fontSize:14, fontWeight:700, color:'#FAFAF7' }}>¿Has terminado de leer?</div>
              <div style={{ fontFamily:'"Inter",system-ui', fontSize:12, color:'rgba(250,250,247,0.55)', marginTop:2 }}>Gana {article.gems} gemas al marcarlo como leído</div>
            </div>
            <button onClick={onMarkRead} style={{ padding:'11px 22px', borderRadius:12, border:'none', cursor:'pointer', background:'#FAFAF7', color:AL.navy, fontFamily:'"Inter",system-ui', fontSize:13, fontWeight:700, whiteSpace:'nowrap' }}>
              Marcar como leído 💎
            </button>
          </>
        )}
      </div>

      {/* Related articles */}
      {allArticles && onOpen && (
        <AulaRelated allArticles={allArticles} currentId={article.id} completedIds={completedIds || []} onOpen={onOpen} />
      )}

      {/* Ask Coach */}
      {onAskCoach && (
        <div style={{ padding: '14px 18px', borderRadius: 14, background: 'rgba(15,26,46,0.03)', border: `1px solid ${AL.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, marginBottom: 16 }}>
          <span style={{ fontFamily: '"Inter",system-ui', fontSize: 13, color: AL.sub }}>¿Tienes dudas sobre este tema?</span>
          <button onClick={onAskCoach} style={{ padding: '7px 16px', borderRadius: 9, border: 'none', background: AL.navy, color: '#FAFAF7', fontFamily: '"Inter",system-ui', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
            Pregunta al Coach →
          </button>
        </div>
      )}
    </div>
  );
}

// ── For You — personalized article strip ──────────────────────────────────────
function AulaForYou({ articles, profile, completedIds, onOpen }) {
  if (typeof aulaGetRecommended === 'undefined' || !profile) return null;
  const recommended = aulaGetRecommended(articles, profile, completedIds, 4);
  if (!recommended.length) return null;

  const OBJ_LABELS = { muscle:'Hipertrofia', fat_loss:'Pérdida de grasa', recomp:'Recomposición', performance:'Rendimiento', health:'Salud y bienestar' };
  const objLabel = OBJ_LABELS[profile.objective] || 'tu objetivo';

  return (
    <div style={{ marginBottom: 48 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 6 }}>
        <h2 style={{ fontFamily: '"Inter",system-ui', fontSize: 22, fontWeight: 800, color: AL.navy, letterSpacing: -0.8, margin: 0 }}>Para ti</h2>
        <span style={{ fontFamily: '"Inter",system-ui', fontSize: 13, color: AL.muted }}>seleccionado según tu objetivo: <strong style={{ color: AL.sub }}>{objLabel}</strong></span>
      </div>
      <p style={{ fontFamily: '"Inter",system-ui', fontSize: 12, color: AL.muted, margin: '0 0 20px' }}>
        {profile.experience === 'beginner' ? 'Empezamos por los fundamentos.' : profile.experience === 'advanced' ? 'Contenido avanzado alineado con tu nivel.' : 'Contenido intermedio ordenado por relevancia.'}
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16 }}>
        {recommended.map((a, i) => (
          <AulaCard key={a.id} article={a} isRead={completedIds.includes(a.id)} onOpen={onOpen} imgIdx={i} />
        ))}
      </div>
    </div>
  );
}

// ── Learning Path Strip ───────────────────────────────────────────────────────
function AulaLearningPath({ articles, profile, completedIds, onOpen }) {
  if (typeof aulaGetLearningPath === 'undefined' || !profile) return null;
  const path = aulaGetLearningPath(profile);
  const available = (path.steps || []).filter(s => articles.some(a => a.id === s.id));
  if (available.length < 2) return null;

  const doneCount = available.filter(s => completedIds.includes(s.id)).length;
  const pct       = Math.round((doneCount / available.length) * 100);

  return (
    <div style={{ marginBottom: 40, padding: '20px 24px', borderRadius: 18, background: AL.card, border: `1px solid ${AL.border}` }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <div>
          <div style={{ fontFamily: 'ui-monospace,Menlo,monospace', fontSize: 9, fontWeight: 700, color: AL.muted, letterSpacing: 1, marginBottom: 4 }}>RUTA DE APRENDIZAJE</div>
          <div style={{ fontFamily: '"Inter",system-ui', fontSize: 15, fontWeight: 700, color: AL.navy }}>{path.label}</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontFamily: 'ui-monospace,Menlo,monospace', fontSize: 13, fontWeight: 700, color: path.color || AL.navy }}>{doneCount} / {available.length}</div>
          <div style={{ fontFamily: '"Inter",system-ui', fontSize: 11, color: AL.muted }}>completados</div>
        </div>
      </div>
      <div style={{ height: 4, borderRadius: 999, background: 'rgba(15,26,46,0.08)', marginBottom: 16, overflow: 'hidden' }}>
        <div style={{ height: '100%', borderRadius: 999, background: path.color || AL.navy, width: `${pct}%`, transition: 'width .4s ease' }} />
      </div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {available.map((step, i) => {
          const done    = completedIds.includes(step.id);
          const article = articles.find(a => a.id === step.id);
          return (
            <button
              key={step.id}
              onClick={() => article && onOpen(step.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '6px 13px', borderRadius: 999,
                border: done ? 'none' : `1px solid rgba(15,26,46,0.12)`,
                background: done ? (path.color || AL.navy) : 'transparent',
                color: done ? '#FFFFFF' : AL.sub,
                fontFamily: '"Inter",system-ui', fontSize: 12, fontWeight: 600,
                cursor: article ? 'pointer' : 'default',
                transition: 'all .15s',
              }}
            >
              <span style={{ fontFamily: 'ui-monospace,Menlo,monospace', fontSize: 9, opacity: 0.6 }}>{i + 1}</span>
              {step.label}
              {done && <span>✓</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── Related articles (inside detail view) ─────────────────────────────────────
function AulaRelated({ allArticles, currentId, completedIds, onOpen }) {
  if (typeof aulaGetRelatedArticles === 'undefined') return null;
  const related = aulaGetRelatedArticles(allArticles, currentId, 3);
  if (!related.length) return null;
  return (
    <div style={{ marginTop: 32, marginBottom: 24 }}>
      <div style={{ fontFamily: 'ui-monospace,Menlo,monospace', fontSize: 9, fontWeight: 700, color: AL.muted, letterSpacing: 1, marginBottom: 14 }}>ARTÍCULOS RELACIONADOS</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {related.map(a => {
          const done = completedIds.includes(a.id);
          const m    = ALcat[a.category] || ALcat.fuerza;
          return (
            <button
              key={a.id}
              onClick={() => onOpen(a.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 14,
                padding: '12px 16px', borderRadius: 12,
                border: `1px solid ${AL.border}`, background: AL.card,
                cursor: 'pointer', textAlign: 'left', transition: 'all .15s', width: '100%',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = '#F5F5F0'; }}
              onMouseLeave={e => { e.currentTarget.style.background = AL.card; }}
            >
              <div style={{ width: 36, height: 36, borderRadius: 9, flexShrink: 0, background: m.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: m.dot }} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: '"Inter",system-ui', fontSize: 13, fontWeight: 700, color: AL.navy, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{a.title}</div>
                <div style={{ fontFamily: '"Inter",system-ui', fontSize: 11, color: AL.muted, marginTop: 2 }}>{a.readTime} min · {(ALcat[a.category] || ALcat.fuerza).label}</div>
              </div>
              {done
                ? <span style={{ fontFamily: '"Inter",system-ui', fontSize: 11, color: '#059669', fontWeight: 700, flexShrink: 0 }}>✓ Leído</span>
                : <span style={{ fontFamily: '"Inter",system-ui', fontSize: 11, color: '#059669', fontWeight: 700, flexShrink: 0 }}>+{a.gems} 💎</span>
              }
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── Main section ──────────────────────────────────────────────────────────────
function AulaSection() {
  const { state, actions } = useStore();
  const { navigate }       = useRoute();
  const [articles, setArticles] = React.useState([]);
  const [loading, setLoading]   = React.useState(true);
  const [query, setQuery]       = React.useState('');
  const [category, setCategory] = React.useState('all');
  const [openId, setOpenId]     = React.useState(null);
  const [gemFlash, setGemFlash] = React.useState(null);

  const atlasProfile = React.useMemo(() => {
    try { return JSON.parse(localStorage.getItem('atlas.profile.v1') || 'null'); } catch { return null; }
  }, []);

  React.useEffect(() => {
    setLoading(true);
    ArticlesService.getAll({ status:'published' }).then(data => {
      setArticles(data);
      setLoading(false);
      // Open article deep-linked from Coach
      const pending = localStorage.getItem('atlas.aula.pending.v1');
      if (pending) {
        localStorage.removeItem('atlas.aula.pending.v1');
        setOpenId(pending);
      }
    });
  }, []);

  const completed = state.reading?.completed || [];

  const filtered = React.useMemo(() => {
    const q = query.toLowerCase().trim();
    return articles.filter(a =>
      (category === 'all' || a.category === category) &&
      (!q || a.title.toLowerCase().includes(q) || a.subtitle.toLowerCase().includes(q) ||
       a.summary.toLowerCase().includes(q) ||
       (a.aiKeywords || []).some(k => k.toLowerCase().includes(q)) ||
       a.tags.some(t => t.toLowerCase().includes(q)))
    );
  }, [articles, query, category]);

  const featured = filtered[0] || null;
  const feedItems = filtered.slice(1);
  const openArticle = openId ? articles.find(a => a.id === openId) : null;

  function handleMarkRead() {
    if (!openId) return;
    const art = articles.find(a => a.id === openId);
    if (!art || completed.includes(openId)) return;
    actions.markArticleRead(openId);
    setGemFlash(`+${art.gems} gemas · ${art.title}`);
    setTimeout(() => setGemFlash(null), 2500);
  }

  function handleCategoryFromExplore(cat) {
    setCategory(cat);
    setOpenId(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  return (
    <section style={{ padding:'100px 32px 100px', background:AL.page, minHeight:'100vh' }}>
      {gemFlash && (
        <div style={{ position:'fixed', top:80, right:32, zIndex:300, background:AL.navy, color:'#FAFAF7', padding:'10px 20px', borderRadius:999, fontFamily:'"Inter",system-ui', fontSize:14, fontWeight:700, animation:'fadeIn .3s ease', boxShadow:'0 8px 32px rgba(15,26,46,0.25)' }}>
          💎 {gemFlash}
        </div>
      )}

      <div style={{ maxWidth:1100, margin:'0 auto' }}>
        {openArticle ? (
          <AulaDetail
            article={openArticle}
            isRead={completed.includes(openId)}
            onBack={() => setOpenId(null)}
            onMarkRead={handleMarkRead}
            allArticles={articles}
            completedIds={completed}
            onOpen={setOpenId}
            onAskCoach={() => navigate('/coach')}
          />
        ) : (
          <>
            {/* ── Hero ─────────────────────────────────────────────── */}
            <AulaHero
              total={articles.length}
              completed={completed.length}
              query={query}
              onQuery={setQuery}
            />

            {/* ── Personalized: For You ─────────────────────────────── */}
            {!loading && atlasProfile && (
              <AulaForYou articles={articles} profile={atlasProfile} completedIds={completed} onOpen={setOpenId} />
            )}

            {/* ── Learning path ─────────────────────────────────────── */}
            {!loading && atlasProfile && (
              <AulaLearningPath articles={articles} profile={atlasProfile} completedIds={completed} onOpen={setOpenId} />
            )}

            {/* ── Category strip ────────────────────────────────────── */}
            <AlCatStrip active={category} onChange={setCategory} />

            {/* ── Loading skeleton ──────────────────────────────────── */}
            {loading && (
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20 }}>
                {[1,2,3,4].map(i => <div key={i} style={{ borderRadius:20, background:'rgba(15,26,46,0.05)', height:280 }} />)}
              </div>
            )}

            {/* ── Empty state ───────────────────────────────────────── */}
            {!loading && filtered.length === 0 && (
              <div style={{ textAlign:'center', padding:'80px 0' }}>
                <div style={{ fontFamily:'"Space Grotesk",system-ui', fontWeight:600, fontSize:22, color:AL.sub, marginBottom:12 }}>Sin resultados</div>
                <p style={{ fontFamily:'"Inter",system-ui', fontSize:14, color:AL.muted, marginBottom:20 }}>
                  No hay artículos que coincidan con "{query}".
                </p>
                <button onClick={() => { setQuery(''); setCategory('all'); }} style={{ padding:'9px 20px', borderRadius:999, border:`1px solid ${AL.bord2}`, background:'transparent', cursor:'pointer', fontFamily:'"Inter",system-ui', fontSize:13, fontWeight:600, color:AL.navy }}>
                  Limpiar filtros
                </button>
              </div>
            )}

            {/* ── Featured article ──────────────────────────────────── */}
            {!loading && featured && (
              <AulaFeatured article={featured} isRead={completed.includes(featured.id)} onOpen={setOpenId} />
            )}

            {/* ── Feed grid ─────────────────────────────────────────── */}
            {!loading && feedItems.length > 0 && (
              <div style={{ marginBottom:64 }}>
                <AlSectionHead
                  label={category === 'all' ? 'Lo más reciente' : (ALcat[category]?.label || 'Artículos')}
                  sublabel={`${feedItems.length} artículo${feedItems.length !== 1 ? 's' : ''}`}
                />
                <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:20 }}>
                  {feedItems.map((a, i) => (
                    <AulaCard key={a.id} article={a} isRead={completed.includes(a.id)} onOpen={setOpenId} imgIdx={i} />
                  ))}
                </div>
              </div>
            )}

            {/* ── Micro-learning ────────────────────────────────────── */}
            {!loading && <AulaMicroLearning />}

            {/* ── Science feed ──────────────────────────────────────── */}
            {!loading && <AulaScienceFeed />}

            {/* ── Videos ───────────────────────────────────────────── */}
            {!loading && <AulaVideos />}

            {/* ── Explore by topic ──────────────────────────────────── */}
            {!loading && <AulaExplore onCategory={handleCategoryFromExplore} />}
          </>
        )}
      </div>
    </section>
  );
}

Object.assign(window, { AulaSection });
