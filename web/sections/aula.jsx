// Aula — article browser powered by ArticlesService
// Reads from ArticlesService (localStorage-backed mock, swappable to API)

const CATEGORY_META = {
  all:         { label: 'Todos',         color: '#0F1A2E', bg: 'rgba(15,26,46,0.06)' },
  fuerza:      { label: 'Fuerza',        color: '#0F1A2E', bg: 'rgba(15,26,46,0.07)', gradient: 'linear-gradient(135deg, #1a2845 0%, #0f3460 100%)' },
  hipertrofia: { label: 'Hipertrofia',   color: '#1F8B3A', bg: '#E7F8EC',             gradient: 'linear-gradient(135deg, #0d3b1e 0%, #1a6b3a 100%)' },
  nutricion:   { label: 'Nutrición',     color: '#b35c00', bg: 'rgba(179,92,0,0.09)', gradient: 'linear-gradient(135deg, #3b1f0a 0%, #7a3e12 100%)' },
  recuperacion:{ label: 'Recuperación',  color: '#1a4fa0', bg: 'rgba(26,79,160,0.09)',gradient: 'linear-gradient(135deg, #0d1e3b 0%, #1a3b6b 100%)' },
  cognitivo:   { label: 'Cognitivo',     color: '#6b3ba0', bg: 'rgba(107,59,160,0.09)',gradient: 'linear-gradient(135deg, #1e0d3b 0%, #3b1a6b 100%)' },
  sueno:       { label: 'Sueño',         color: '#2a7a8a', bg: 'rgba(42,122,138,0.09)',gradient: 'linear-gradient(135deg, #0d2b30 0%, #1a5060 100%)' },
};

const EVIDENCE_META = {
  'meta-analysis': { label: 'Meta-análisis', color: '#1F8B3A', bg: '#E7F8EC' },
  'rct':           { label: 'ECA',           color: '#1a4fa0', bg: 'rgba(26,79,160,0.09)' },
  'cohort':        { label: 'Cohorte',       color: '#b35c00', bg: 'rgba(179,92,0,0.09)' },
  'review':        { label: 'Revisión',      color: '#0F1A2E', bg: 'rgba(15,26,46,0.07)' },
  'expert-opinion':{ label: 'Experto',       color: '#9498A4', bg: 'rgba(148,152,164,0.1)' },
};

function CoverPlaceholder({ category, size }) {
  const meta = CATEGORY_META[category] || CATEGORY_META.fuerza;
  const h = size === 'detail' ? 260 : 160;
  const radius = size === 'detail' ? 18 : '16px 16px 0 0';
  return (
    <div style={{
      width: '100%', height: h,
      background: meta.gradient || 'linear-gradient(135deg, #1a2845, #0f3460)',
      borderRadius: radius,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      position: 'relative', overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.04) 1px,transparent 1px)',
        backgroundSize: '32px 32px',
      }} />
      <span style={{
        fontFamily: '"Instrument Serif",Georgia,serif', fontStyle: 'italic',
        fontSize: size === 'detail' ? 72 : 48, color: 'rgba(255,255,255,0.15)',
        letterSpacing: -2, userSelect: 'none', position: 'relative',
      }}>A</span>
    </div>
  );
}

function EvidenceBadge({ level }) {
  const m = EVIDENCE_META[level];
  if (!m) return null;
  return (
    <span style={{
      padding: '2px 8px', borderRadius: 4,
      background: m.bg, color: m.color,
      fontFamily: 'ui-monospace,Menlo,monospace', fontSize: 10, fontWeight: 700, letterSpacing: 0.4,
    }}>{m.label}</span>
  );
}

function ArticleCard({ article, isRead, onOpen }) {
  const [hover, setHover] = React.useState(false);
  const catMeta = CATEGORY_META[article.category] || CATEGORY_META.fuerza;
  return (
    <div
      onClick={() => onOpen(article.id)}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        borderRadius: 18, overflow: 'hidden', background: '#FFFFFF',
        border: '1px solid rgba(15,26,46,0.08)', cursor: 'pointer',
        transform: hover ? 'translateY(-4px)' : 'translateY(0)',
        boxShadow: hover ? '0 16px 48px -16px rgba(15,26,46,0.2)' : '0 2px 8px -4px rgba(15,26,46,0.06)',
        transition: 'all 0.25s cubic-bezier(0.2,0.8,0.2,1)',
      }}
    >
      {article.coverImage
        ? <img src={article.coverImage} alt={article.title} style={{ width: '100%', height: 160, objectFit: 'cover' }} />
        : <CoverPlaceholder category={article.category} size="card" />
      }
      <div style={{ padding: '16px 20px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10, flexWrap: 'wrap' }}>
          <span style={{
            padding: '2px 9px', borderRadius: 999,
            background: catMeta.bg, color: catMeta.color,
            fontFamily: '"Inter",system-ui', fontSize: 11, fontWeight: 700, textTransform: 'capitalize',
          }}>{catMeta.label}</span>
          <EvidenceBadge level={article.evidenceLevel} />
          {isRead && (
            <span style={{
              marginLeft: 'auto', padding: '2px 8px', borderRadius: 999,
              background: '#E7F8EC', color: '#1F8B3A',
              fontFamily: '"Inter",system-ui', fontSize: 10, fontWeight: 700,
            }}>✓ Leído</span>
          )}
        </div>
        <h3 style={{ fontFamily: '"Inter",system-ui', fontSize: 17, fontWeight: 700, color: '#0F1A2E', letterSpacing: -0.4, lineHeight: 1.2, margin: '0 0 4px' }}>{article.title}</h3>
        <p style={{ fontFamily: '"Inter",system-ui', fontSize: 13, color: '#5C6477', margin: '0 0 10px', fontStyle: 'italic' }}>{article.subtitle}</p>
        <p style={{ fontFamily: '"Inter",system-ui', fontSize: 13, color: '#3A4257', lineHeight: 1.5, margin: '0 0 14px', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{article.summary}</p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontFamily: '"Inter",system-ui', fontSize: 11, color: '#9498A4', fontWeight: 600 }}>{article.readTime} min</span>
            {article.publishYear && <span style={{ fontFamily: 'ui-monospace,Menlo,monospace', fontSize: 10, color: '#9498A4' }}>{article.publishYear}</span>}
          </div>
          {!isRead && (
            <span style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '3px 9px', borderRadius: 999, background: 'rgba(15,26,46,0.05)', fontFamily: '"Inter",system-ui', fontSize: 11, fontWeight: 700, color: '#0F1A2E' }}>
              <Gem size={11} /> +{article.gems}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function ArticleDetail({ article, isRead, onBack, onMarkRead }) {
  const [openSections, setOpenSections] = React.useState({ 0: true });
  const [showAi, setShowAi] = React.useState(false);
  const catMeta = CATEGORY_META[article.category] || CATEGORY_META.fuerza;
  const toggle = (i) => setOpenSections(s => ({ ...s, [i]: !s[i] }));

  return (
    <div style={{ maxWidth: 760, margin: '0 auto' }}>
      <button onClick={onBack} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 32, background: 'none', border: 'none', cursor: 'pointer', fontFamily: '"Inter",system-ui', fontSize: 14, fontWeight: 600, color: '#5C6477', padding: 0 }}>
        ← Volver al Aula
      </button>

      {article.coverImage
        ? <img src={article.coverImage} alt={article.title} style={{ width: '100%', height: 260, objectFit: 'cover', borderRadius: 18, marginBottom: 32 }} />
        : <div style={{ marginBottom: 32 }}><CoverPlaceholder category={article.category} size="detail" /></div>
      }

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
        <span style={{ padding: '3px 10px', borderRadius: 999, background: catMeta.bg, color: catMeta.color, fontFamily: '"Inter",system-ui', fontSize: 12, fontWeight: 700, textTransform: 'capitalize' }}>{catMeta.label}</span>
        <EvidenceBadge level={article.evidenceLevel} />
        <span style={{ fontFamily: '"Inter",system-ui', fontSize: 12, color: '#9498A4', marginLeft: 4 }}>{article.readTime} min lectura</span>
        {article.publishYear && article.journal && (
          <span style={{ fontFamily: '"Inter",system-ui', fontSize: 12, color: '#9498A4' }}>· {article.journal} ({article.publishYear})</span>
        )}
      </div>

      <h1 style={{ fontFamily: '"Inter",system-ui', fontSize: 40, fontWeight: 700, color: '#0F1A2E', letterSpacing: -1.4, lineHeight: 1.05, margin: '0 0 8px' }}>{article.title}</h1>
      <p style={{ fontFamily: '"Instrument Serif",Georgia,serif', fontStyle: 'italic', fontSize: 22, color: '#5C6477', margin: '0 0 8px' }}>{article.subtitle}</p>
      {article.authors?.length > 0 && (
        <p style={{ fontFamily: '"Inter",system-ui', fontSize: 13, color: '#9498A4', margin: '0 0 28px' }}>
          {article.authors.join(', ')}
          {article.doi && <span> · <a href={`https://doi.org/${article.doi}`} target="_blank" rel="noopener noreferrer" style={{ color: '#1a4fa0', textDecoration: 'none' }}>doi:{article.doi}</a></span>}
          {article.pmid && <span> · <a href={`https://pubmed.ncbi.nlm.nih.gov/${article.pmid}`} target="_blank" rel="noopener noreferrer" style={{ color: '#1a4fa0', textDecoration: 'none' }}>PubMed</a></span>}
        </p>
      )}

      {/* Abstract */}
      <div style={{ padding: '18px 22px', borderRadius: 14, background: '#FAFAF7', border: '1px solid rgba(15,26,46,0.06)', marginBottom: 24 }}>
        <span style={{ fontFamily: 'ui-monospace,Menlo,monospace', fontSize: 10, fontWeight: 700, color: '#9498A4', letterSpacing: 0.6 }}>ABSTRACT</span>
        <p style={{ fontFamily: '"Inter",system-ui', fontSize: 15, color: '#3A4257', lineHeight: 1.6, margin: '8px 0 0', letterSpacing: -0.1 }}>{article.summary}</p>
      </div>

      {/* AI Summary */}
      {article.aiSummary && (
        <div style={{ marginBottom: 24 }}>
          <button onClick={() => setShowAi(s => !s)} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontFamily: '"Inter",system-ui', fontSize: 13, fontWeight: 700, color: '#0F1A2E' }}>
            <span style={{ width: 22, height: 22, borderRadius: 999, background: 'linear-gradient(135deg,#1A2845,#0F1A2E)', color: '#FAFAF7', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800 }}>A</span>
            Resumen IA {showAi ? '↑' : '↓'}
          </button>
          {showAi && (
            <div style={{ padding: '14px 18px', borderRadius: 12, background: 'linear-gradient(135deg,rgba(15,26,46,0.03),rgba(15,26,46,0.06))', border: '1px solid rgba(15,26,46,0.08)' }}>
              <p style={{ fontFamily: '"Inter",system-ui', fontSize: 14, color: '#0F1A2E', lineHeight: 1.5, margin: 0, fontStyle: 'italic' }}>"{article.aiSummary}"</p>
              {article.aiGeneratedAt && <span style={{ fontFamily: 'ui-monospace,Menlo,monospace', fontSize: 10, color: '#9498A4', marginTop: 6, display: 'block' }}>Generado {new Date(article.aiGeneratedAt).toLocaleDateString('es-ES')}</span>}
            </div>
          )}
        </div>
      )}

      {/* Sections accordion */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginBottom: 28 }}>
        {article.sections.map((s, i) => (
          <div key={i} style={{ borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(15,26,46,0.06)' }}>
            <button onClick={() => toggle(i)} style={{ width: '100%', textAlign: 'left', padding: '14px 18px', background: openSections[i] ? '#0F1A2E' : '#FFFFFF', border: 'none', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'background 0.2s' }}>
              <span style={{ fontFamily: '"Inter",system-ui', fontSize: 15, fontWeight: 700, color: openSections[i] ? '#FAFAF7' : '#0F1A2E', letterSpacing: -0.2 }}>{s.heading}</span>
              <span style={{ color: openSections[i] ? 'rgba(250,250,247,0.6)' : '#9498A4', fontSize: 12 }}>{openSections[i] ? '↑' : '↓'}</span>
            </button>
            {openSections[i] && (
              <div style={{ padding: '16px 18px', background: '#FAFAF7' }}>
                <p style={{ fontFamily: '"Inter",system-ui', fontSize: 14, color: '#3A4257', lineHeight: 1.65, margin: 0 }}>{s.body}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Figures */}
      {article.figures?.filter(f => f.url).map((fig, i) => (
        <div key={i} style={{ marginBottom: 16 }}>
          <img src={fig.url} alt={fig.caption} style={{ width: '100%', borderRadius: 12 }} />
          <p style={{ fontFamily: '"Inter",system-ui', fontSize: 12, color: '#9498A4', textAlign: 'center', margin: '6px 0 0' }}>Figura {i + 1}: {fig.caption}</p>
        </div>
      ))}

      {/* References */}
      {article.refs?.length > 0 && (
        <div style={{ padding: '18px 22px', borderRadius: 14, background: '#FAFAF7', border: '1px solid rgba(15,26,46,0.06)', marginBottom: 32 }}>
          <span style={{ fontFamily: 'ui-monospace,Menlo,monospace', fontSize: 10, fontWeight: 700, color: '#9498A4', letterSpacing: 0.6 }}>REFERENCIAS</span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 10 }}>
            {article.refs.map((ref, i) => (
              <p key={i} style={{ fontFamily: '"Inter",system-ui', fontSize: 12, color: '#5C6477', lineHeight: 1.5, margin: 0, paddingLeft: 16, borderLeft: '2px solid rgba(15,26,46,0.1)' }}>{ref}</p>
            ))}
          </div>
        </div>
      )}

      {/* Read CTA */}
      <div style={{ padding: '20px 24px', borderRadius: 16, background: isRead ? '#E7F8EC' : '#0F1A2E', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {isRead ? (
          <div style={{ fontFamily: '"Inter",system-ui', fontSize: 14, fontWeight: 700, color: '#1F8B3A' }}>✓ Artículo completado · gemas ya acreditadas</div>
        ) : (
          <>
            <div>
              <div style={{ fontFamily: '"Inter",system-ui', fontSize: 14, fontWeight: 700, color: '#FAFAF7' }}>¿Has terminado de leer?</div>
              <div style={{ fontFamily: '"Inter",system-ui', fontSize: 12, color: 'rgba(250,250,247,0.6)', marginTop: 2 }}>Gana {article.gems} gemas al marcarlo como leído</div>
            </div>
            <button onClick={onMarkRead} style={{ padding: '10px 20px', borderRadius: 999, border: 'none', cursor: 'pointer', background: '#FAFAF7', color: '#0F1A2E', fontFamily: '"Inter",system-ui', fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Gem size={13} /> Marcar como leído
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function AulaSection() {
  const { state, actions } = useStore();
  const [articles, setArticles] = React.useState([]);
  const [loading, setLoading]   = React.useState(true);
  const [query, setQuery]       = React.useState('');
  const [category, setCategory] = React.useState('all');
  const [openId, setOpenId]     = React.useState(null);
  const [gemFlash, setGemFlash] = React.useState(null);

  React.useEffect(() => {
    setLoading(true);
    ArticlesService.getAll({ status: 'published' }).then(data => {
      setArticles(data);
      setLoading(false);
    });
  }, []);

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

  const completed = state.reading?.completed || [];
  const openArticle = openId ? articles.find(a => a.id === openId) : null;

  const handleMarkRead = () => {
    if (!openId) return;
    const art = articles.find(a => a.id === openId);
    if (!art || completed.includes(openId)) return;
    actions.markArticleRead(openId);
    setGemFlash(`+${art.gems} gemas · ${art.title}`);
    setTimeout(() => setGemFlash(null), 2500);
  };

  return (
    <section style={{ padding: '120px 32px', background: '#FFFFFF', minHeight: '80vh' }}>
      {gemFlash && (
        <div style={{ position: 'fixed', top: 80, right: 32, zIndex: 200, background: '#0F1A2E', color: '#FAFAF7', padding: '10px 20px', borderRadius: 999, fontFamily: '"Inter",system-ui', fontSize: 14, fontWeight: 700, animation: 'fadeIn 0.3s ease', boxShadow: '0 8px 32px rgba(15,26,46,0.25)' }}>
          💎 {gemFlash}
        </div>
      )}
      <div style={{ maxWidth: 1180, margin: '0 auto' }}>
        {openArticle ? (
          <ArticleDetail article={openArticle} isRead={completed.includes(openId)} onBack={() => setOpenId(null)} onMarkRead={handleMarkRead} />
        ) : (
          <>
            <div style={{ marginBottom: 48 }}>
              <span style={{ fontFamily: '"Inter",system-ui', fontSize: 13, fontWeight: 700, letterSpacing: 1.6, textTransform: 'uppercase', color: '#5C6477' }}>Aula · Base de conocimiento</span>
              <h1 style={{ fontFamily: '"Inter",system-ui', fontSize: 56, fontWeight: 700, color: '#0F1A2E', letterSpacing: -2, lineHeight: 1.02, margin: '12px 0 16px' }}>
                Ciencia aplicada. <span style={{ fontFamily: '"Instrument Serif",Georgia,serif', fontStyle: 'italic', fontWeight: 400 }}>Sin filtros.</span>
              </h1>
              <p style={{ fontFamily: '"Inter",system-ui', fontSize: 18, color: '#3A4257', lineHeight: 1.5, letterSpacing: -0.2, margin: 0, maxWidth: 600 }}>
                Artículos basados en evidencia, clasificados por nivel y categoría. Cada lectura completada suma gemas a tu balance.
              </p>
            </div>

            {/* Search + filters */}
            <div style={{ display: 'flex', gap: 12, marginBottom: 28, flexWrap: 'wrap', alignItems: 'center' }}>
              <div style={{ position: 'relative', flex: 1, minWidth: 240 }}>
                <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#9498A4', fontSize: 16 }}>⌕</span>
                <input
                  value={query} onChange={e => setQuery(e.target.value)}
                  placeholder="Buscar artículos, conceptos, palabras clave…"
                  style={{ width: '100%', padding: '12px 14px 12px 38px', borderRadius: 12, border: '1px solid rgba(15,26,46,0.1)', background: '#FAFAF7', color: '#0F1A2E', fontFamily: '"Inter",system-ui', fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
                />
              </div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {Object.entries(CATEGORY_META).map(([key, m]) => (
                  <button key={key} onClick={() => setCategory(key)} style={{ padding: '8px 14px', borderRadius: 999, border: 'none', cursor: 'pointer', background: category === key ? '#0F1A2E' : m.bg, color: category === key ? '#FAFAF7' : m.color, fontFamily: '"Inter",system-ui', fontSize: 13, fontWeight: 600, transition: 'all 0.15s' }}>
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Stats */}
            <div style={{ display: 'flex', gap: 20, marginBottom: 28, paddingBottom: 20, borderBottom: '1px solid rgba(15,26,46,0.06)' }}>
              <span style={{ fontFamily: '"Inter",system-ui', fontSize: 13, color: '#5C6477' }}><strong style={{ color: '#0F1A2E' }}>{filtered.length}</strong> artículos</span>
              <span style={{ fontFamily: '"Inter",system-ui', fontSize: 13, color: '#5C6477' }}><strong style={{ color: '#1F8B3A' }}>{completed.length}</strong> leídos</span>
              <span style={{ fontFamily: '"Inter",system-ui', fontSize: 13, color: '#5C6477' }}><strong style={{ color: '#0F1A2E' }}>{articles.reduce((s, a) => s + (completed.includes(a.id) ? a.gems : 0), 0)}</strong> gemas ganadas</span>
            </div>

            {loading ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20 }}>
                {[1,2,3].map(i => <div key={i} style={{ borderRadius: 18, background: '#F4F2EC', height: 320 }} />)}
              </div>
            ) : filtered.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '80px 0', color: '#9498A4' }}>
                <div style={{ fontSize: 32, marginBottom: 12 }}>🔍</div>
                <div style={{ fontFamily: '"Inter",system-ui', fontSize: 16, fontWeight: 600 }}>Sin resultados para "{query}"</div>
                <button onClick={() => { setQuery(''); setCategory('all'); }} style={{ marginTop: 16, padding: '8px 18px', borderRadius: 999, border: '1px solid rgba(15,26,46,0.12)', background: 'transparent', cursor: 'pointer', fontFamily: '"Inter",system-ui', fontSize: 13, fontWeight: 600, color: '#0F1A2E' }}>Limpiar filtros</button>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20 }}>
                {filtered.map(a => <ArticleCard key={a.id} article={a} isRead={completed.includes(a.id)} onOpen={setOpenId} />)}
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}

Object.assign(window, { AulaSection });
