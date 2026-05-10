// Aula Admin — validation panel for article workflow
// Access: /#/admin  (password-gated, dev password: atlas2026)
// TODO: Replace login() with Supabase Auth / Firebase Auth

const STATUS_META = {
  draft:     { label: 'Borrador',    color: '#9498A4', bg: 'rgba(148,152,164,0.1)' },
  reviewing: { label: 'En revisión', color: '#b35c00', bg: 'rgba(179,92,0,0.09)' },
  published: { label: 'Publicado',   color: '#1F8B3A', bg: '#E7F8EC' },
  rejected:  { label: 'Rechazado',   color: '#C24545', bg: 'rgba(194,69,69,0.08)' },
};

const EVIDENCE_OPTS = [
  ['meta-analysis','Meta-análisis'], ['rct','ECA (ensayo controlado)'],
  ['cohort','Cohorte'], ['review','Revisión'], ['expert-opinion','Opinión experto'],
];
const CATEGORY_OPTS = [
  ['fuerza','Fuerza'], ['hipertrofia','Hipertrofia'], ['nutricion','Nutrición'],
  ['recuperacion','Recuperación'], ['cognitivo','Cognitivo'], ['sueno','Sueño'],
];

// ─── Login gate ────────────────────────────────────────────────────────────────
function AdminLogin({ onLogin }) {
  const [pw, setPw]   = React.useState('');
  const [err, setErr] = React.useState('');

  const submit = (e) => {
    e.preventDefault();
    if (ArticlesService.login(pw)) { onLogin(); }
    else { setErr('Contraseña incorrecta'); }
  };

  return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 32 }}>
      <div style={{ width: 360, padding: 40, borderRadius: 24, background: '#FFFFFF', border: '1px solid rgba(15,26,46,0.08)', boxShadow: '0 20px 60px -30px rgba(15,26,46,0.15)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28 }}>
          <AtlasA size={28} color="#0F1A2E" stroke={9} />
          <span style={{ fontFamily: '"Inter",system-ui', fontWeight: 800, fontSize: 16, letterSpacing: -0.3, color: '#0F1A2E' }}>Atlas Admin</span>
        </div>
        <p style={{ fontFamily: '"Inter",system-ui', fontSize: 13, color: '#5C6477', margin: '0 0 24px', lineHeight: 1.5 }}>
          Panel de validación de artículos científicos. Acceso restringido.
        </p>
        <form onSubmit={submit}>
          <input
            type="password" value={pw} onChange={e => { setPw(e.target.value); setErr(''); }}
            placeholder="Contraseña de administrador"
            style={{ width: '100%', padding: '12px 16px', borderRadius: 12, border: err ? '1.5px solid #C24545' : '1.5px solid rgba(15,26,46,0.12)', background: '#FAFAF7', fontFamily: '"Inter",system-ui', fontSize: 14, color: '#0F1A2E', outline: 'none', boxSizing: 'border-box', marginBottom: 8 }}
          />
          {err && <p style={{ fontFamily: '"Inter",system-ui', fontSize: 12, color: '#C24545', margin: '0 0 12px' }}>{err}</p>}
          <button type="submit" style={{ width: '100%', padding: '12px', borderRadius: 12, border: 'none', cursor: 'pointer', background: '#0F1A2E', color: '#FAFAF7', fontFamily: '"Inter",system-ui', fontSize: 14, fontWeight: 700 }}>
            Entrar →
          </button>
        </form>
        <p style={{ fontFamily: 'ui-monospace,Menlo,monospace', fontSize: 11, color: '#9498A4', textAlign: 'center', marginTop: 20 }}>
          DEV · password: atlas2026
        </p>
      </div>
    </div>
  );
}

// ─── Import panel ──────────────────────────────────────────────────────────────
function ImportPanel({ onImported }) {
  const [tab, setTab]     = React.useState('pubmed'); // pubmed | doi | manual
  const [input, setInput] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [preview, setPreview] = React.useState(null);
  const [saved, setSaved]   = React.useState(false);

  const handleImport = async () => {
    if (!input.trim()) return;
    setLoading(true); setPreview(null);
    try {
      const result = tab === 'pubmed'
        ? await ArticlesService.importFromPubMed(input.trim())
        : await ArticlesService.importFromSemanticScholar(input.trim());
      setPreview(result);
    } catch (e) {
      alert('Error al importar: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!preview) return;
    await ArticlesService.submit(preview);
    setSaved(true);
    setTimeout(() => { setSaved(false); setPreview(null); setInput(''); onImported(); }, 1500);
  };

  return (
    <div style={{ background: '#FAFAF7', borderRadius: 20, border: '1px solid rgba(15,26,46,0.06)', padding: 24, marginBottom: 24 }}>
      <span style={{ fontFamily: 'ui-monospace,Menlo,monospace', fontSize: 11, fontWeight: 700, color: '#5C6477', letterSpacing: 0.6 }}>IMPORTAR ARTÍCULO</span>

      {/* Tab selector */}
      <div style={{ display: 'flex', gap: 4, marginTop: 14, marginBottom: 16 }}>
        {[['pubmed','PubMed (PMID)'],['doi','Semantic Scholar (DOI)'],['manual','Manual']].map(([k,l])=>(
          <button key={k} onClick={() => setTab(k)} style={{ padding: '7px 14px', borderRadius: 999, border: 'none', cursor: 'pointer', background: tab===k ? '#0F1A2E' : 'rgba(15,26,46,0.06)', color: tab===k ? '#FAFAF7' : '#3A4257', fontFamily: '"Inter",system-ui', fontSize: 12, fontWeight: 600 }}>{l}</button>
        ))}
      </div>

      {tab !== 'manual' ? (
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            value={input} onChange={e => setInput(e.target.value)}
            placeholder={tab === 'pubmed' ? 'PMID, ej: 20847704' : 'DOI, ej: 10.1519/JSC.xxx'}
            style={{ flex: 1, padding: '10px 14px', borderRadius: 10, border: '1px solid rgba(15,26,46,0.12)', background: '#FFFFFF', fontFamily: '"Inter",system-ui', fontSize: 13, color: '#0F1A2E', outline: 'none' }}
          />
          <button onClick={handleImport} disabled={loading || !input.trim()} style={{ padding: '10px 18px', borderRadius: 10, border: 'none', cursor: 'pointer', background: '#0F1A2E', color: '#FAFAF7', fontFamily: '"Inter",system-ui', fontSize: 13, fontWeight: 700, opacity: loading ? 0.5 : 1 }}>
            {loading ? '…' : 'Importar'}
          </button>
        </div>
      ) : (
        <button onClick={() => onImported('new')} style={{ padding: '10px 18px', borderRadius: 10, border: 'none', cursor: 'pointer', background: '#0F1A2E', color: '#FAFAF7', fontFamily: '"Inter",system-ui', fontSize: 13, fontWeight: 700 }}>
          + Nuevo artículo manual
        </button>
      )}

      {preview && (
        <div style={{ marginTop: 16, padding: '14px 18px', borderRadius: 12, background: '#FFFFFF', border: '1px solid rgba(15,26,46,0.08)' }}>
          <p style={{ fontFamily: '"Inter",system-ui', fontSize: 13, fontWeight: 700, color: '#0F1A2E', margin: '0 0 4px' }}>{preview.title}</p>
          <p style={{ fontFamily: '"Inter",system-ui', fontSize: 12, color: '#5C6477', margin: '0 0 12px' }}>PMID: {preview.pmid || '—'} · DOI: {preview.doi || '—'}</p>
          <button onClick={handleSave} style={{ padding: '8px 16px', borderRadius: 999, border: 'none', cursor: 'pointer', background: saved ? '#E7F8EC' : '#0F1A2E', color: saved ? '#1F8B3A' : '#FAFAF7', fontFamily: '"Inter",system-ui', fontSize: 12, fontWeight: 700 }}>
            {saved ? '✓ Guardado como borrador' : 'Guardar como borrador →'}
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Article editor form ───────────────────────────────────────────────────────
function ArticleEditor({ initial, onSave, onCancel }) {
  const [form, setForm] = React.useState(initial || {
    id: '', title: '', subtitle: '', category: 'fuerza', tags: '',
    readTime: 8, gems: 15, summary: '',
    sections: [{ heading: '', body: '' }],
    refs: [''],
    doi: '', pmid: '', authors: '', journal: '', publishYear: '',
    evidenceLevel: 'review', coverImage: '', status: 'draft',
  });
  const [saving, setSaving] = React.useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const setSection = (i, k, v) => setForm(f => ({ ...f, sections: f.sections.map((s, idx) => idx===i ? {...s,[k]:v} : s) }));
  const addSection = () => setForm(f => ({ ...f, sections: [...f.sections, { heading: '', body: '' }] }));
  const removeSection = (i) => setForm(f => ({ ...f, sections: f.sections.filter((_,idx)=>idx!==i) }));
  const setRef = (i, v) => setForm(f => ({ ...f, refs: f.refs.map((r,idx)=>idx===i?v:r) }));
  const addRef = () => setForm(f => ({ ...f, refs: [...f.refs, ''] }));

  const handleSave = async () => {
    setSaving(true);
    const article = {
      ...form,
      tags: typeof form.tags === 'string' ? form.tags.split(',').map(t=>t.trim()).filter(Boolean) : form.tags,
      authors: typeof form.authors === 'string' ? form.authors.split(',').map(a=>a.trim()).filter(Boolean) : form.authors,
      publishYear: form.publishYear ? parseInt(form.publishYear) : null,
      readTime: parseInt(form.readTime) || 8,
      gems: parseInt(form.gems) || 15,
      figures: [],
    };
    if (initial?.id) {
      await ArticlesService.update(initial.id, article);
    } else {
      await ArticlesService.submit(article);
    }
    setSaving(false);
    onSave();
  };

  const fieldStyle = { width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid rgba(15,26,46,0.12)', background: '#FFFFFF', fontFamily: '"Inter",system-ui', fontSize: 13, color: '#0F1A2E', outline: 'none', boxSizing: 'border-box' };
  const labelStyle = { display: 'block', fontFamily: '"Inter",system-ui', fontSize: 11, fontWeight: 700, color: '#5C6477', letterSpacing: 0.6, textTransform: 'uppercase', marginBottom: 6 };

  return (
    <div style={{ padding: 28, borderRadius: 20, background: '#FAFAF7', border: '1px solid rgba(15,26,46,0.06)', marginBottom: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <span style={{ fontFamily: 'ui-monospace,Menlo,monospace', fontSize: 11, fontWeight: 700, color: '#5C6477', letterSpacing: 0.6 }}>{initial?.id ? 'EDITAR ARTÍCULO' : 'NUEVO ARTÍCULO'}</span>
        <button onClick={onCancel} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9498A4', fontSize: 18 }}>✕</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        <div>
          <label style={labelStyle}>Título *</label>
          <input value={form.title} onChange={e=>set('title',e.target.value)} placeholder="Título del artículo" style={fieldStyle} />
        </div>
        <div>
          <label style={labelStyle}>Subtítulo</label>
          <input value={form.subtitle} onChange={e=>set('subtitle',e.target.value)} placeholder="Subtítulo / bajada" style={fieldStyle} />
        </div>
        <div>
          <label style={labelStyle}>Categoría</label>
          <select value={form.category} onChange={e=>set('category',e.target.value)} style={fieldStyle}>
            {CATEGORY_OPTS.map(([v,l])=><option key={v} value={v}>{l}</option>)}
          </select>
        </div>
        <div>
          <label style={labelStyle}>Nivel de evidencia</label>
          <select value={form.evidenceLevel} onChange={e=>set('evidenceLevel',e.target.value)} style={fieldStyle}>
            {EVIDENCE_OPTS.map(([v,l])=><option key={v} value={v}>{l}</option>)}
          </select>
        </div>
        <div>
          <label style={labelStyle}>Etiquetas (coma separadas)</label>
          <input value={typeof form.tags==='string'?form.tags:(form.tags||[]).join(', ')} onChange={e=>set('tags',e.target.value)} placeholder="fundamental, intermedio, fuerza" style={fieldStyle} />
        </div>
        <div>
          <label style={labelStyle}>Autores (coma separados)</label>
          <input value={typeof form.authors==='string'?form.authors:(form.authors||[]).join(', ')} onChange={e=>set('authors',e.target.value)} placeholder="Brad J. Schoenfeld, …" style={fieldStyle} />
        </div>
        <div>
          <label style={labelStyle}>Revista / Journal</label>
          <input value={form.journal||''} onChange={e=>set('journal',e.target.value)} placeholder="J Strength Cond Res" style={fieldStyle} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
          <div>
            <label style={labelStyle}>Año</label>
            <input type="number" value={form.publishYear||''} onChange={e=>set('publishYear',e.target.value)} placeholder="2024" style={fieldStyle} />
          </div>
          <div>
            <label style={labelStyle}>Lectura (min)</label>
            <input type="number" value={form.readTime} onChange={e=>set('readTime',e.target.value)} style={fieldStyle} />
          </div>
          <div>
            <label style={labelStyle}>Gemas</label>
            <input type="number" value={form.gems} onChange={e=>set('gems',e.target.value)} style={fieldStyle} />
          </div>
        </div>
        <div>
          <label style={labelStyle}>DOI</label>
          <input value={form.doi||''} onChange={e=>set('doi',e.target.value)} placeholder="10.1519/JSC.xxx" style={fieldStyle} />
        </div>
        <div>
          <label style={labelStyle}>PMID</label>
          <input value={form.pmid||''} onChange={e=>set('pmid',e.target.value)} placeholder="20847704" style={fieldStyle} />
        </div>
      </div>

      <div style={{ marginBottom: 16 }}>
        <label style={labelStyle}>Resumen / Abstract *</label>
        <textarea value={form.summary} onChange={e=>set('summary',e.target.value)} rows={3} placeholder="Párrafo introductorio del artículo…" style={{ ...fieldStyle, resize: 'vertical' }} />
      </div>

      {/* Sections */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <label style={labelStyle}>Secciones</label>
          <button onClick={addSection} style={{ padding: '4px 12px', borderRadius: 999, border: '1px solid rgba(15,26,46,0.12)', background: 'transparent', cursor: 'pointer', fontFamily: '"Inter",system-ui', fontSize: 12, fontWeight: 600, color: '#0F1A2E' }}>+ Añadir sección</button>
        </div>
        {form.sections.map((s, i) => (
          <div key={i} style={{ marginBottom: 10, padding: '12px', borderRadius: 10, background: '#FFFFFF', border: '1px solid rgba(15,26,46,0.06)' }}>
            <div style={{ display: 'flex', gap: 8, marginBottom: 6 }}>
              <input value={s.heading} onChange={e=>setSection(i,'heading',e.target.value)} placeholder={`Título sección ${i+1}`} style={{ ...fieldStyle, flex: 1 }} />
              {form.sections.length > 1 && <button onClick={()=>removeSection(i)} style={{ padding: '0 10px', borderRadius: 8, border: 'none', background: 'rgba(194,69,69,0.08)', color: '#C24545', cursor: 'pointer', fontWeight: 700 }}>✕</button>}
            </div>
            <textarea value={s.body} onChange={e=>setSection(i,'body',e.target.value)} rows={3} placeholder="Cuerpo de la sección…" style={{ ...fieldStyle, resize: 'vertical' }} />
          </div>
        ))}
      </div>

      {/* References */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <label style={labelStyle}>Referencias (APA)</label>
          <button onClick={addRef} style={{ padding: '4px 12px', borderRadius: 999, border: '1px solid rgba(15,26,46,0.12)', background: 'transparent', cursor: 'pointer', fontFamily: '"Inter",system-ui', fontSize: 12, fontWeight: 600, color: '#0F1A2E' }}>+ Añadir</button>
        </div>
        {form.refs.map((r, i) => (
          <input key={i} value={r} onChange={e=>setRef(i,e.target.value)} placeholder="Autor A et al. (año). Título. Revista." style={{ ...fieldStyle, marginBottom: 6 }} />
        ))}
      </div>

      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
        <button onClick={onCancel} style={{ padding: '10px 20px', borderRadius: 10, border: '1px solid rgba(15,26,46,0.12)', background: 'transparent', cursor: 'pointer', fontFamily: '"Inter",system-ui', fontSize: 13, fontWeight: 600, color: '#3A4257' }}>Cancelar</button>
        <button onClick={handleSave} disabled={saving || !form.title} style={{ padding: '10px 20px', borderRadius: 10, border: 'none', cursor: 'pointer', background: '#0F1A2E', color: '#FAFAF7', fontFamily: '"Inter",system-ui', fontSize: 13, fontWeight: 700, opacity: saving||!form.title?0.5:1 }}>
          {saving ? 'Guardando…' : initial?.id ? 'Actualizar' : 'Guardar borrador'}
        </button>
      </div>
    </div>
  );
}

// ─── Article row ───────────────────────────────────────────────────────────────
function ArticleRow({ article, onApprove, onReject, onEdit, onDelete, onGenerateAI }) {
  const [rejecting, setRejecting] = React.useState(false);
  const [reason, setReason]       = React.useState('');
  const [aiLoading, setAiLoading] = React.useState(false);
  const sm = STATUS_META[article.status] || STATUS_META.draft;

  const handleReject = () => {
    if (!reason.trim()) return;
    onReject(article.id, reason);
    setRejecting(false); setReason('');
  };

  const handleGenerateAI = async () => {
    setAiLoading(true);
    await onGenerateAI(article.id);
    setAiLoading(false);
  };

  return (
    <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(15,26,46,0.05)', background: '#FFFFFF' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <span style={{ padding: '2px 8px', borderRadius: 4, background: sm.bg, color: sm.color, fontFamily: 'ui-monospace,Menlo,monospace', fontSize: 10, fontWeight: 700 }}>{sm.label}</span>
            <span style={{ fontFamily: '"Inter",system-ui', fontSize: 15, fontWeight: 700, color: '#0F1A2E' }}>{article.title}</span>
          </div>
          <p style={{ fontFamily: '"Inter",system-ui', fontSize: 12, color: '#5C6477', margin: 0, lineHeight: 1.4 }}>
            {article.category} · {article.readTime} min · {article.publishYear || '—'}
            {article.pmid && <span> · PMID {article.pmid}</span>}
            {article.aiSummary && <span style={{ color: '#1F8B3A' }}> · ✓ IA</span>}
          </p>
          {article.rejectionReason && (
            <p style={{ fontFamily: '"Inter",system-ui', fontSize: 11, color: '#C24545', margin: '4px 0 0' }}>Razón rechazo: {article.rejectionReason}</p>
          )}
        </div>

        <div style={{ display: 'flex', gap: 6, flexShrink: 0, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          {article.status !== 'published' && (
            <button onClick={() => onApprove(article.id)} style={{ padding: '6px 12px', borderRadius: 8, border: 'none', cursor: 'pointer', background: '#E7F8EC', color: '#1F8B3A', fontFamily: '"Inter",system-ui', fontSize: 12, fontWeight: 700 }}>
              ✓ Publicar
            </button>
          )}
          {article.status !== 'rejected' && (
            <button onClick={() => setRejecting(r => !r)} style={{ padding: '6px 12px', borderRadius: 8, border: 'none', cursor: 'pointer', background: 'rgba(194,69,69,0.08)', color: '#C24545', fontFamily: '"Inter",system-ui', fontSize: 12, fontWeight: 700 }}>
              ✕ Rechazar
            </button>
          )}
          {!article.aiSummary && (
            <button onClick={handleGenerateAI} disabled={aiLoading} style={{ padding: '6px 12px', borderRadius: 8, border: '1px solid rgba(15,26,46,0.1)', cursor: 'pointer', background: 'transparent', color: '#0F1A2E', fontFamily: '"Inter",system-ui', fontSize: 12, fontWeight: 600, opacity: aiLoading?0.5:1 }}>
              {aiLoading ? '…IA' : 'Generar IA'}
            </button>
          )}
          <button onClick={() => onEdit(article)} style={{ padding: '6px 12px', borderRadius: 8, border: '1px solid rgba(15,26,46,0.1)', cursor: 'pointer', background: 'transparent', color: '#0F1A2E', fontFamily: '"Inter",system-ui', fontSize: 12, fontWeight: 600 }}>
            Editar
          </button>
          <button onClick={() => { if (confirm('¿Eliminar artículo?')) onDelete(article.id); }} style={{ padding: '6px 12px', borderRadius: 8, border: '1px solid rgba(194,69,69,0.2)', cursor: 'pointer', background: 'transparent', color: '#C24545', fontFamily: '"Inter",system-ui', fontSize: 12, fontWeight: 600 }}>
            Borrar
          </button>
        </div>
      </div>

      {rejecting && (
        <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
          <input value={reason} onChange={e=>setReason(e.target.value)} placeholder="Razón del rechazo…" style={{ flex: 1, padding: '8px 12px', borderRadius: 8, border: '1.5px solid #C24545', background: '#FAFAF7', fontFamily: '"Inter",system-ui', fontSize: 13, outline: 'none' }} />
          <button onClick={handleReject} disabled={!reason.trim()} style={{ padding: '8px 14px', borderRadius: 8, border: 'none', cursor: 'pointer', background: '#C24545', color: '#FAFAF7', fontFamily: '"Inter",system-ui', fontSize: 12, fontWeight: 700, opacity: reason.trim()?1:0.4 }}>
            Confirmar
          </button>
          <button onClick={() => setRejecting(false)} style={{ padding: '8px 14px', borderRadius: 8, border: '1px solid rgba(15,26,46,0.1)', cursor: 'pointer', background: 'transparent', color: '#3A4257', fontFamily: '"Inter",system-ui', fontSize: 12 }}>
            Cancelar
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Main Admin section ────────────────────────────────────────────────────────
function AulaAdminSection() {
  const [authed, setAuthed] = React.useState(() => ArticlesService.isAdmin());
  const [articles, setArticles] = React.useState([]);
  const [statusFilter, setStatusFilter] = React.useState('all');
  const [showImport, setShowImport]   = React.useState(false);
  const [editing, setEditing]         = React.useState(null); // null | article | 'new'

  const reload = React.useCallback(() => {
    ArticlesService.getAll({ status: statusFilter }).then(setArticles);
  }, [statusFilter]);

  React.useEffect(() => { if (authed) reload(); }, [authed, reload]);

  if (!authed) return <AdminLogin onLogin={() => setAuthed(true)} />;

  const handleApprove    = async (id)         => { await ArticlesService.approve(id);      reload(); };
  const handleReject     = async (id, reason) => { await ArticlesService.reject(id, reason); reload(); };
  const handleDelete     = async (id)         => { await ArticlesService.delete(id);       reload(); };
  const handleGenerateAI = async (id)         => { await ArticlesService.generateAISummary(id); reload(); };

  const counts = React.useMemo(() => ({
    all: articles.length,
    reviewing: articles.filter(a=>a.status==='reviewing').length,
    draft: articles.filter(a=>a.status==='draft').length,
    published: articles.filter(a=>a.status==='published').length,
    rejected: articles.filter(a=>a.status==='rejected').length,
  }), [articles]);

  return (
    <section style={{ padding: '100px 32px', background: '#FAFAF7', minHeight: '80vh' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 }}>
          <div>
            <span style={{ fontFamily: 'ui-monospace,Menlo,monospace', fontSize: 11, fontWeight: 700, color: '#5C6477', letterSpacing: 0.6 }}>ATLAS ADMIN · AULA</span>
            <h1 style={{ fontFamily: '"Inter",system-ui', fontSize: 40, fontWeight: 700, color: '#0F1A2E', letterSpacing: -1.4, margin: '8px 0 0' }}>Panel de validación</h1>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => setShowImport(s=>!s)} style={{ padding: '10px 18px', borderRadius: 10, border: '1px solid rgba(15,26,46,0.12)', background: showImport?'#0F1A2E':'transparent', color: showImport?'#FAFAF7':'#0F1A2E', cursor: 'pointer', fontFamily: '"Inter",system-ui', fontSize: 13, fontWeight: 700 }}>
              {showImport ? 'Cerrar importación' : '+ Importar / nuevo'}
            </button>
            <button onClick={() => { ArticlesService.logout(); setAuthed(false); }} style={{ padding: '10px 14px', borderRadius: 10, border: '1px solid rgba(194,69,69,0.2)', background: 'transparent', color: '#C24545', cursor: 'pointer', fontFamily: '"Inter",system-ui', fontSize: 13, fontWeight: 600 }}>
              Cerrar sesión
            </button>
          </div>
        </div>

        {/* Import panel */}
        {showImport && <ImportPanel onImported={(mode) => { setShowImport(false); if (mode==='new') setEditing('new'); reload(); }} />}

        {/* Editor */}
        {editing && (
          <ArticleEditor
            initial={editing === 'new' ? null : editing}
            onSave={() => { setEditing(null); reload(); }}
            onCancel={() => setEditing(null)}
          />
        )}

        {/* Stats row */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
          {[['all','Todos'],['reviewing','En revisión'],['draft','Borradores'],['published','Publicados'],['rejected','Rechazados']].map(([k,l])=>(
            <button key={k} onClick={() => setStatusFilter(k)} style={{ padding: '8px 14px', borderRadius: 999, border: 'none', cursor: 'pointer', background: statusFilter===k?'#0F1A2E':'rgba(15,26,46,0.06)', color: statusFilter===k?'#FAFAF7':'#3A4257', fontFamily: '"Inter",system-ui', fontSize: 12, fontWeight: 600 }}>
              {l} {counts[k] > 0 && <span style={{ opacity: 0.7 }}>({counts[k]})</span>}
            </button>
          ))}
        </div>

        {/* Article list */}
        <div style={{ borderRadius: 16, border: '1px solid rgba(15,26,46,0.08)', overflow: 'hidden' }}>
          {articles.length === 0 ? (
            <div style={{ padding: 48, textAlign: 'center', color: '#9498A4', fontFamily: '"Inter",system-ui', fontSize: 14 }}>
              No hay artículos en esta categoría
            </div>
          ) : articles.map(a => (
            <ArticleRow
              key={a.id} article={a}
              onApprove={handleApprove}
              onReject={handleReject}
              onEdit={setEditing}
              onDelete={handleDelete}
              onGenerateAI={handleGenerateAI}
            />
          ))}
        </div>

        {/* Architecture notes */}
        <div style={{ marginTop: 40, padding: '20px 24px', borderRadius: 16, background: '#FFFFFF', border: '1px solid rgba(15,26,46,0.06)' }}>
          <span style={{ fontFamily: 'ui-monospace,Menlo,monospace', fontSize: 10, fontWeight: 700, color: '#9498A4', letterSpacing: 0.6 }}>ROADMAP DE INTEGRACIÓN</span>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginTop: 14 }}>
            {[
              ['PubMed API', 'Importación automática por PMID. Mapeo de campos al schema Atlas. POST /api/import/pubmed.'],
              ['AI Summaries', 'Claude genera el resumen plain-language. POST /api/ai/summarize → Claude claude-opus-4-7. Requiere revisión manual antes de publicar.'],
              ['Supabase', 'articles tabla + Storage para imágenes. Row-level security por rol admin. Realtime subscriptions para notificaciones.'],
            ].map(([t,d],i)=>(
              <div key={i} style={{ padding: '12px 14px', borderRadius: 10, background: '#FAFAF7', border: '1px solid rgba(15,26,46,0.04)' }}>
                <div style={{ fontFamily: '"Inter",system-ui', fontSize: 13, fontWeight: 700, color: '#0F1A2E', marginBottom: 4 }}>{t}</div>
                <div style={{ fontFamily: '"Inter",system-ui', fontSize: 12, color: '#5C6477', lineHeight: 1.5 }}>{d}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

Object.assign(window, { AulaAdminSection });
