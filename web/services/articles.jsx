// ─── Atlas Method — Articles Service Layer ────────────────────────────────────
//
// ARCHITECTURE OVERVIEW
// ─────────────────────
// This service is the single source of truth for all article data.
// Currently backed by localStorage + mock seed data.
//
// TO MIGRATE TO SUPABASE:
//   Replace _fetch / _mutate helpers with supabase.from('articles')... calls.
//   Auth token is passed as ArticlesService.setToken(jwt) before any call.
//
// TO MIGRATE TO FIREBASE:
//   Replace _fetch / _mutate helpers with getDoc / setDoc / updateDoc from Firestore.
//
// TO INTEGRATE PUBMED:
//   ArticlesService.importFromPubMed(pmid) already has the correct return shape.
//   Replace the mock with: fetch(`https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&id=${pmid}&retmode=json`)
//
// TO INTEGRATE SEMANTIC SCHOLAR:
//   ArticlesService.importFromSemanticScholar(doi) — same pattern.
//   API: https://api.semanticscholar.org/graph/v1/paper/{doi}
//
// TO INTEGRATE AI SUMMARIES (Claude):
//   ArticlesService.generateAISummary(id) calls Anthropic API.
//   Endpoint: POST /api/ai/summarize with { articleId, sections }
//   The admin triggers this manually before publishing.

// ─── Data model ───────────────────────────────────────────────────────────────
// {
//   id: string                         unique slug
//   title: string
//   subtitle: string
//   category: 'fuerza'|'hipertrofia'|'nutricion'|'recuperacion'|'cognitivo'|'sueno'
//   tags: string[]
//   status: 'draft'|'reviewing'|'published'|'rejected'
//   readTime: number                   minutes
//   gems: number                       reward on first read
//   publishedAt: ISO string | null
//   updatedAt: ISO string
//   rejectionReason: string | null
//
//   — Content —
//   summary: string                    one-paragraph abstract
//   sections: [{ heading, body }]      article body
//   refs: string[]                     APA citations
//
//   — Study metadata (PubMed / Semantic Scholar) —
//   doi: string | null
//   pmid: string | null
//   semanticScholarId: string | null
//   authors: string[]
//   journal: string | null
//   publishYear: number | null
//   evidenceLevel: 'meta-analysis'|'rct'|'cohort'|'review'|'expert-opinion'
//
//   — AI fields —
//   aiSummary: string | null           Claude-generated plain-language summary
//   aiKeywords: string[]               extracted keywords
//   aiGeneratedAt: ISO string | null
//
//   — Images —
//   coverImage: string | null          URL (Supabase Storage / CDN)
//   figures: [{ url, caption }]        in-article figures
// }

const STORAGE_KEY = 'atlas.articles.v2';
const ADMIN_KEY   = 'atlas.admin.token';

// ─── Seed data ────────────────────────────────────────────────────────────────
const SEED = [
  {
    id: 'sobrecarga-progresiva',
    title: 'Sobrecarga progresiva',
    subtitle: 'El principio que lo explica todo',
    category: 'fuerza', tags: ['fundamental', 'principiante'],
    status: 'published', readTime: 8, gems: 15,
    publishedAt: '2026-01-10T10:00:00Z', updatedAt: '2026-01-10T10:00:00Z',
    rejectionReason: null,
    summary: 'La sobrecarga progresiva es el principio más importante del entrenamiento de fuerza. Sin incremento progresivo de estímulo, no hay adaptación estructural ni funcional.',
    sections: [
      { heading: '¿Qué es la sobrecarga progresiva?', body: 'La sobrecarga progresiva consiste en aumentar sistemáticamente el estímulo de entrenamiento — ya sea mediante más peso, más repeticiones, más volumen o menor descanso — para forzar adaptaciones continuas. Sin este principio, el organismo alcanza homeostasis y el progreso se detiene.' },
      { heading: 'Los cinco vectores de progresión', body: 'No toda la progresión viene del peso. Puedes progresar aumentando el número de series (volumen), las repeticiones por serie, la densidad (menos descanso), la frecuencia semanal o la calidad técnica de los movimientos. La combinación correcta depende del nivel y el objetivo.' },
      { heading: 'Aplicación práctica', body: 'La progresión más sencilla para principiantes es la progresión lineal: añadir 2.5 kg cada sesión en ejercicios compuestos. Para niveles intermedios, la progresión ondulante por fases de 3–4 semanas es más eficaz y sostenible.' },
    ],
    refs: ['Schoenfeld BJ (2010). The mechanisms of muscle hypertrophy. J Strength Cond Res, 24(10), 2857-2872.', 'Kraemer WJ, Ratamess NA (2004). Fundamentals of resistance training. Med Sci Sports Exerc, 36(4), 674-688.'],
    doi: '10.1519/JSC.0b013e3181e840f3', pmid: '20847704', semanticScholarId: null,
    authors: ['Brad J. Schoenfeld'], journal: 'Journal of Strength and Conditioning Research', publishYear: 2010,
    evidenceLevel: 'review',
    aiSummary: 'El principio de sobrecarga progresiva establece que el músculo solo se adapta cuando se somete a estímulos crecientes. En la práctica: sube el peso, las reps o el volumen en cada mesociclo.',
    aiKeywords: ['sobrecarga progresiva', 'adaptación muscular', 'mTOR', 'progresión lineal', 'periodización'],
    aiGeneratedAt: '2026-01-11T08:30:00Z',
    coverImage: null,
    figures: [],
  },
  {
    id: 'rpe-rir',
    title: 'RPE y RIR',
    subtitle: 'Medir el esfuerzo con precisión',
    category: 'fuerza', tags: ['intermedio', 'autorregulación'],
    status: 'published', readTime: 6, gems: 15,
    publishedAt: '2026-01-14T10:00:00Z', updatedAt: '2026-01-14T10:00:00Z',
    rejectionReason: null,
    summary: 'El RPE y el RIR son herramientas para autorregular la intensidad del entrenamiento con precisión, adaptando la carga al estado real de recuperación del atleta.',
    sections: [
      { heading: 'RPE: escala de esfuerzo percibido', body: 'La escala RPE va de 1 a 10, donde 10 es el máximo esfuerzo posible. En entrenamiento de fuerza, la zona óptima suele estar entre 7 y 9 dependiendo de la fase del mesociclo. Un RPE de 8 implica que podrías hacer dos repeticiones más antes del fallo.' },
      { heading: 'RIR: repeticiones en reserva', body: 'RIR es el número de repeticiones que podrías completar antes del fallo real. Un RIR de 2 equivale aproximadamente a un RPE de 8. Esta métrica es más intuitiva para muchos atletas porque es directamente observable durante la ejecución.' },
      { heading: 'Autorregulación práctica', body: 'Usar RPE/RIR permite ajustar las cargas de sesión en sesión según el estado de recuperación. Si llegas con fatiga acumulada, reduces el peso para mantener el RIR objetivo en lugar de forzar el número del programa, protegiendo la calidad del estímulo.' },
    ],
    refs: ['Zourdos MC et al. (2016). Novel resistance training-specific RPE scale measuring repetitions in reserve. J Strength Cond Res, 30(1), 267-275.', 'Mike J, Jouberd C, Taber C (2015). RIR as a tool for tracking proximity to failure. NSCA Personal Training Quarterly.'],
    doi: '10.1519/JSC.0000000000001069', pmid: '25474446', semanticScholarId: 'f3a8d1b2c4e5',
    authors: ['Michael C. Zourdos', 'Alex Klemp'], journal: 'Journal of Strength and Conditioning Research', publishYear: 2016,
    evidenceLevel: 'rct',
    aiSummary: 'RPE 8 = RIR 2 = puedes hacer 2 reps más. Usar estas escalas en lugar de % de 1RM permite adaptar la carga al estado real del atleta ese día, sin sacrificar la calidad del estímulo.',
    aiKeywords: ['RPE', 'RIR', 'autorregulación', 'intensidad', 'fallo muscular'],
    aiGeneratedAt: '2026-01-15T09:00:00Z',
    coverImage: null,
    figures: [{ url: null, caption: 'Tabla de equivalencias RPE ↔ RIR ↔ % 1RM' }],
  },
  {
    id: 'hipertrofia-mecanismos',
    title: 'Mecanismos de hipertrofia',
    subtitle: 'Por qué crece el músculo',
    category: 'hipertrofia', tags: ['intermedio', 'ciencia'],
    status: 'published', readTime: 10, gems: 20,
    publishedAt: '2026-01-20T10:00:00Z', updatedAt: '2026-01-20T10:00:00Z',
    rejectionReason: null,
    summary: 'El crecimiento muscular responde a tres mecanismos primarios: tensión mecánica, estrés metabólico y daño muscular. Entender cada uno permite diseñar estímulos más eficaces.',
    sections: [
      { heading: 'Tensión mecánica', body: 'La tensión mecánica generada por levantar cargas pesadas activa vías de señalización anabólica como mTOR. Es el estímulo más importante para la síntesis de proteínas musculares. La carga alta (70–85% 1RM) con rangos de 4–8 reps maximiza este mecanismo.' },
      { heading: 'Estrés metabólico', body: 'El estrés metabólico (la "bomba") provoca acumulación de metabolitos como lactato, que activan hormonas anabólicas locales. Es especialmente relevante en rangos de 12–20 repeticiones con descansos cortos.' },
      { heading: 'Daño muscular', body: 'El daño muscular, especialmente en la fase excéntrica, inicia procesos de reparación que contribuyen al crecimiento. Sin embargo, el daño excesivo compromete la recuperación y el volumen tolerable de las sesiones siguientes.' },
    ],
    refs: ['Schoenfeld BJ (2010). The mechanisms of muscle hypertrophy. J Strength Cond Res, 24(10).', 'Figueiredo VC et al. (2019). Considerations for maximizing the hypertrophic response to resistance training. Sports Med, 49.'],
    doi: '10.1519/JSC.0b013e3181e840f3', pmid: '20847704', semanticScholarId: null,
    authors: ['Brad J. Schoenfeld'], journal: 'Journal of Strength and Conditioning Research', publishYear: 2010,
    evidenceLevel: 'meta-analysis',
    aiSummary: '3 mecanismos → 1 resultado. Tensión mecánica (peso alto, pocas reps), estrés metabólico (peso moderado, muchas reps, poco descanso), daño muscular (fase excéntrica controlada). Los tres deben estar presentes en un programa completo.',
    aiKeywords: ['hipertrofia', 'mTOR', 'tensión mecánica', 'estrés metabólico', 'síntesis proteica'],
    aiGeneratedAt: '2026-01-21T08:00:00Z',
    coverImage: null,
    figures: [],
  },
  {
    id: 'volumen-frecuencia',
    title: 'Volumen y frecuencia',
    subtitle: 'Cuánto y cuántas veces entrenar',
    category: 'hipertrofia', tags: ['intermedio', 'programación'],
    status: 'published', readTime: 7, gems: 15,
    publishedAt: '2026-02-01T10:00:00Z', updatedAt: '2026-02-01T10:00:00Z',
    rejectionReason: null,
    summary: 'El volumen semanal y la frecuencia de entrenamiento son las dos variables con mayor impacto en el desarrollo muscular a largo plazo.',
    sections: [
      { heading: 'MEV, MAV y MRV', body: 'El Volumen Mínimo Efectivo (MEV) es el mínimo para mantener músculo. El Volumen de Máxima Adaptación (MAV) es el óptimo para crecer. El Volumen Máximo Recuperable (MRV) es el máximo tolerable antes de comprometer la recuperación. La progresión correcta es MEV → MAV → MRV → deload.' },
      { heading: 'Frecuencia óptima', body: 'Entrenar cada músculo 2 veces por semana supera a 1 vez con el mismo volumen total. Para intermedios y avanzados, 2–3 veces por semana permite mejor distribución del estímulo y mayor volumen semanal tolerable.' },
      { heading: 'Progresión de volumen', body: 'Lo más efectivo es empezar en el MEV e incrementar series semana a semana hasta aproximarse al MRV, para luego realizar un deload y reiniciar el ciclo con un MAV superior al anterior, aprovechando la supercompensación.' },
    ],
    refs: ['Ralston GW et al. (2017). The effect of weekly set volume on strength gain. J Strength Cond Res.', 'Schoenfeld BJ et al. (2016). Effects of resistance training frequency on muscle hypertrophy. Sports Med.'],
    doi: null, pmid: null, semanticScholarId: null,
    authors: ['Grant W. Ralston', 'Lon Kilgore'], journal: 'Journal of Strength and Conditioning Research', publishYear: 2017,
    evidenceLevel: 'meta-analysis',
    aiSummary: 'MEV (mantenimiento) → MAV (crecimiento) → MRV (límite). 2× por músculo/semana > 1×. Empieza bajo y sube series cada semana hasta el deload.',
    aiKeywords: ['volumen', 'frecuencia', 'MEV', 'MAV', 'MRV', 'series semanales'],
    aiGeneratedAt: '2026-02-02T10:00:00Z',
    coverImage: null,
    figures: [],
  },
  {
    id: 'nutricion-proteina',
    title: 'Proteína: cuánta y cuándo',
    subtitle: 'Evidencia sobre ingesta proteica',
    category: 'nutricion', tags: ['fundamental', 'nutrición'],
    status: 'published', readTime: 6, gems: 15,
    publishedAt: '2026-02-10T10:00:00Z', updatedAt: '2026-02-10T10:00:00Z',
    rejectionReason: null,
    summary: 'La proteína es el macronutriente más importante para la adaptación muscular. Cantidad, calidad y distribución a lo largo del día determinan la síntesis proteica neta.',
    sections: [
      { heading: 'Cantidad óptima', body: 'El consenso actual sitúa la ingesta óptima en 1.6–2.2 g/kg de peso corporal para maximizar la síntesis proteica en atletas que entrenan fuerza. Cantidades superiores no aportan beneficio adicional en términos de masa muscular.' },
      { heading: 'Distribución temporal', body: 'Distribuir la proteína en 3–5 tomas de 30–40 g a lo largo del día maximiza la síntesis proteica muscular. La ventana post-entrenamiento es relevante pero no tan estrecha como se creía: 2–4 horas es suficiente.' },
      { heading: 'Fuentes y leucina', body: 'Las proteínas completas (pollo, huevo, lácteos, carne, soja) son preferibles. El leucine threshold (2–3 g de leucina por toma) es el umbral para activar mTOR de forma óptima.' },
    ],
    refs: ['Morton RW et al. (2018). A systematic review and meta-analysis of protein supplementation on resistance training. Br J Sports Med, 52(6), 376-384.', 'Stokes T et al. (2018). The role of dietary protein for the promotion of muscle hypertrophy. Nutrients, 10(2).'],
    doi: '10.1136/bjsports-2017-097608', pmid: '28698222', semanticScholarId: 'a1b2c3d4e5f6',
    authors: ['Robert W. Morton', 'Sara Y. Murphy'], journal: 'British Journal of Sports Medicine', publishYear: 2018,
    evidenceLevel: 'meta-analysis',
    aiSummary: '1.6–2.2 g/kg/día en 4–5 tomas. Busca 2–3 g de leucina por toma para activar mTOR. La ventana post-entreno es real pero cómoda: tienes 2–4 horas.',
    aiKeywords: ['proteína', 'leucina', 'mTOR', 'síntesis proteica', 'distribución temporal'],
    aiGeneratedAt: '2026-02-11T09:00:00Z',
    coverImage: null,
    figures: [],
  },
  {
    id: 'recuperacion-sueno',
    title: 'Sueño y recuperación',
    subtitle: 'La variable más infraestimada',
    category: 'recuperacion', tags: ['fundamental', 'salud'],
    status: 'published', readTime: 5, gems: 15,
    publishedAt: '2026-02-18T10:00:00Z', updatedAt: '2026-02-18T10:00:00Z',
    rejectionReason: null,
    summary: 'El sueño es el mayor modulador de la recuperación y la adaptación al entrenamiento. La privación crónica compromete la fuerza, la composición corporal y la salud hormonal.',
    sections: [
      { heading: 'Impacto en el rendimiento', body: 'Dormir menos de 6 h reduce la fuerza en un 10–20% y eleva el RPE percibido. La privación de sueño aumenta el cortisol y reduce la testosterona, comprometiendo el entorno anabólico durante horas.' },
      { heading: 'Arquitectura del sueño', body: 'La mayor parte de la GH se libera durante el sueño profundo (fase N3). Reducir el sueño acorta esta fase crítica para la recuperación muscular y la síntesis proteica nocturna, que representa hasta el 30% de la síntesis diaria total.' },
      { heading: 'Higiene del sueño', body: 'Temperaturas de 18–20°C, ausencia de luz azul 60 min antes de dormir, horarios regulares y evitar cafeína después de las 14 h son las estrategias con mayor evidencia y mayor impacto práctico.' },
    ],
    refs: ['Dattilo M et al. (2011). Sleep and muscle recovery. Med Hypotheses, 77(2), 220-222.', 'Watson NF et al. (2015). Recommended amount of sleep for a healthy adult. Sleep, 38(6).'],
    doi: '10.1016/j.mehy.2011.04.017', pmid: '21550729', semanticScholarId: null,
    authors: ['M. Dattilo', 'H.K.M. Antunes'], journal: 'Medical Hypotheses', publishYear: 2011,
    evidenceLevel: 'review',
    aiSummary: '<6h de sueño = -15% en rendimiento, +cortisol, -testosterona. La GH se libera en sueño profundo N3. Duerme 7–9h, 18–20°C, sin pantallas 60 min antes.',
    aiKeywords: ['sueño', 'recuperación', 'GH', 'cortisol', 'HRV', 'higiene del sueño'],
    aiGeneratedAt: '2026-02-19T08:00:00Z',
    coverImage: null,
    figures: [],
  },
  {
    id: 'deload',
    title: 'Deload: cuándo y cómo',
    subtitle: 'El arte de recuperar para progresar',
    category: 'recuperacion', tags: ['intermedio', 'programación'],
    status: 'published', readTime: 5, gems: 15,
    publishedAt: '2026-03-01T10:00:00Z', updatedAt: '2026-03-01T10:00:00Z',
    rejectionReason: null,
    summary: 'El deload es una reducción planificada del volumen o la intensidad para permitir la supercompensación y prevenir el sobreentrenamiento.',
    sections: [
      { heading: '¿Cuándo hacer deload?', body: 'Señales objetivas: HRV bajo sostenido, RPE elevado para cargas habituales, pérdida de motivación y calidad del sueño reducida. En atletas intermedios/avanzados, un deload cada 4–6 semanas es habitual y necesario.' },
      { heading: 'Tipos de deload', body: 'Deload de volumen: mantener intensidad, reducir series al 50–60%. Deload de intensidad: mantener volumen, reducir cargas al 60–70% del 1RM. El deload de volumen tiene mayor evidencia para la mayoría de atletas.' },
      { heading: 'Duración óptima', body: 'Una semana es suficiente para la recuperación del SNC y la supercompensación muscular. Deloads más largos pueden causar desentrenamiento parcial, especialmente en atletas avanzados.' },
    ],
    refs: ['Bosquet L et al. (2007). Effects of tapering on performance. Med Sci Sports Exerc, 39(8).', 'Flann KL et al. (2011). Muscle damage and remodeling. J Exp Biol.'],
    doi: null, pmid: null, semanticScholarId: null,
    authors: ['Laurent Bosquet'], journal: 'Medicine & Science in Sports & Exercise', publishYear: 2007,
    evidenceLevel: 'review',
    aiSummary: 'Cada 4–6 semanas, reduce el volumen al 50–60% manteniendo la intensidad. 1 semana basta. Señales de necesidad: HRV bajo, RPE alto, sin motivación.',
    aiKeywords: ['deload', 'supercompensación', 'fatiga', 'SNC', 'tapering'],
    aiGeneratedAt: '2026-03-02T09:00:00Z',
    coverImage: null,
    figures: [],
  },
  {
    id: 'hrv-monitoreo',
    title: 'HRV como herramienta de recuperación',
    subtitle: 'Datos objetivos de tu estado de forma',
    category: 'recuperacion', tags: ['avanzado', 'tecnología'],
    status: 'published', readTime: 7, gems: 20,
    publishedAt: '2026-03-10T10:00:00Z', updatedAt: '2026-03-10T10:00:00Z',
    rejectionReason: null,
    summary: 'La variabilidad de la frecuencia cardíaca (HRV) es el biomarcador más accesible para monitorear la recuperación del sistema nervioso autónomo y optimizar las cargas.',
    sections: [
      { heading: '¿Qué mide el HRV?', body: 'El HRV mide la variación en milisegundos entre latidos consecutivos. Un HRV alto indica predominio parasimpático (recuperación y adaptación). Un HRV bajo señala activación simpática: estrés, fatiga acumulada o enfermedad incipiente.' },
      { heading: 'Interpretación práctica', body: 'Más que el valor absoluto, importa la tendencia de 7 días respecto al baseline personal. Una caída sostenida de más del 10% indica acumulación de fatiga y sugiere reducir el volumen o la intensidad esa semana.' },
      { heading: 'Integración en el plan', body: 'Con HRV bajo, prioriza sesiones técnicas o de menor intensidad. Con HRV alto o en baseline, es el momento óptimo para sesiones de alta intensidad, pruebas de fuerza máxima o bloques de acumulación.' },
    ],
    refs: ['Plews DJ et al. (2013). Heart rate variability in elite triathletes. Int J Sports Physiol Perform, 8(5).', 'Kiviniemi AM et al. (2010). Endurance training guided individually by HRV. Eur J Appl Physiol.'],
    doi: null, pmid: null, semanticScholarId: null,
    authors: ['Daniel J. Plews', 'Paul B. Laursen'], journal: 'International Journal of Sports Physiology and Performance', publishYear: 2013,
    evidenceLevel: 'cohort',
    aiSummary: 'HRV alto = entrena duro. HRV bajo = reduce. Míralo durante 7 días, no día a día. Una caída >10% vs tu baseline pide deload o sesión técnica.',
    aiKeywords: ['HRV', 'variabilidad cardíaca', 'SNA', 'recuperación', 'autorregulación'],
    aiGeneratedAt: '2026-03-11T08:00:00Z',
    coverImage: null,
    figures: [],
  },
  // ─── Draft article — only visible in admin ────────────────────────────────
  {
    id: 'periodizacion-bloques',
    title: 'Periodización por bloques',
    subtitle: 'Estructurar el año de entrenamiento',
    category: 'fuerza', tags: ['avanzado', 'programación'],
    status: 'reviewing', readTime: 12, gems: 25,
    publishedAt: null, updatedAt: '2026-04-20T14:00:00Z',
    rejectionReason: null,
    summary: 'La periodización por bloques organiza el entrenamiento en fases concentradas (acumulación, transmutación, realización) para maximizar las adaptaciones específicas en cada período.',
    sections: [
      { heading: 'Bloques de acumulación', body: 'Alto volumen, intensidad moderada (65–75% 1RM). El objetivo es desarrollar la base aeróbica, muscular y técnica para los bloques posteriores. Duración típica: 3–4 semanas.' },
      { heading: 'Bloques de transmutación', body: 'Volumen moderado, intensidad alta (80–90% 1RM). Se transforma la capacidad construida en fuerza específica. Duración: 2–3 semanas.' },
      { heading: 'Bloques de realización', body: 'Bajo volumen, intensidad máxima (90–100% 1RM). Pico de rendimiento para competición o test. Duración: 1–2 semanas, siempre seguidas de deload.' },
    ],
    refs: ['Issurin VB (2010). New horizons for the methodology and physiology of training periodization. Sports Med, 40(3).'],
    doi: '10.2165/11319770-000000000-00000', pmid: '20121287', semanticScholarId: null,
    authors: ['Vladimir B. Issurin'], journal: 'Sports Medicine', publishYear: 2010,
    evidenceLevel: 'review',
    aiSummary: null, aiKeywords: [], aiGeneratedAt: null,
    coverImage: null, figures: [],
  },
];

// ─── In-memory store (localStorage-backed) ───────────────────────────────────
let _articles = (function () {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return SEED.map(a => ({ ...a }));
})();

function _persist() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(_articles)); } catch (e) {}
}

const _delay = (ms = 60) => new Promise(r => setTimeout(r, ms));

// ─── Admin token (dev only — replace with real JWT from Supabase Auth) ────────
let _adminToken = null;
try { _adminToken = sessionStorage.getItem(ADMIN_KEY); } catch (e) {}

// ─── Public API ───────────────────────────────────────────────────────────────
// TODO: When adding Supabase, wrap each method body with:
//   const { data, error } = await supabase.from('articles').select(...)
// TODO: When adding Firebase, wrap with:
//   const snap = await getDocs(query(collection(db,'articles'), where(...)))

const ArticlesService = {

  // ── Auth (dev stub) ─────────────────────────────────────────────────────────
  login(password) {
    // TODO: Replace with supabase.auth.signInWithPassword({ email, password })
    if (password === 'atlas2026') {
      _adminToken = 'dev-token';
      try { sessionStorage.setItem(ADMIN_KEY, _adminToken); } catch (e) {}
      return true;
    }
    return false;
  },
  logout() {
    _adminToken = null;
    try { sessionStorage.removeItem(ADMIN_KEY); } catch (e) {}
  },
  isAdmin() { return !!_adminToken; },

  // ── Read ─────────────────────────────────────────────────────────────────────
  async getAll({ status = 'published', category = 'all' } = {}) {
    // TODO: fetch('/api/articles?status=' + status + '&category=' + category)
    await _delay();
    return _articles.filter(a =>
      (status === 'all' || a.status === status) &&
      (category === 'all' || a.category === category)
    ).sort((a, b) => (b.publishedAt || '').localeCompare(a.publishedAt || ''));
  },

  async getById(id) {
    // TODO: fetch('/api/articles/' + id)
    await _delay();
    return _articles.find(a => a.id === id) || null;
  },

  async search(query) {
    // TODO: supabase.from('articles').textSearch('fts', query)
    await _delay(30);
    const q = query.toLowerCase();
    return _articles.filter(a =>
      a.status === 'published' && (
        a.title.toLowerCase().includes(q) ||
        a.subtitle.toLowerCase().includes(q) ||
        a.summary.toLowerCase().includes(q) ||
        a.tags.some(t => t.toLowerCase().includes(q)) ||
        (a.aiKeywords || []).some(k => k.toLowerCase().includes(q))
      )
    );
  },

  // ── Admin: write ─────────────────────────────────────────────────────────────
  async submit(article) {
    // TODO: POST /api/articles  (requires auth header)
    if (!ArticlesService.isAdmin()) throw new Error('Not authorized');
    await _delay();
    const newArticle = {
      ...article,
      id: article.id || article.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
      status: 'reviewing',
      publishedAt: null,
      updatedAt: new Date().toISOString(),
      aiSummary: null, aiKeywords: [], aiGeneratedAt: null,
    };
    _articles = [newArticle, ..._articles];
    _persist();
    return newArticle;
  },

  async update(id, patch) {
    // TODO: PATCH /api/articles/:id
    if (!ArticlesService.isAdmin()) throw new Error('Not authorized');
    await _delay();
    _articles = _articles.map(a => a.id === id ? { ...a, ...patch, updatedAt: new Date().toISOString() } : a);
    _persist();
  },

  async approve(id) {
    // TODO: PATCH /api/articles/:id/publish
    if (!ArticlesService.isAdmin()) throw new Error('Not authorized');
    await _delay();
    _articles = _articles.map(a =>
      a.id === id ? { ...a, status: 'published', publishedAt: new Date().toISOString(), updatedAt: new Date().toISOString(), rejectionReason: null } : a
    );
    _persist();
  },

  async reject(id, reason) {
    // TODO: PATCH /api/articles/:id/reject  { reason }
    if (!ArticlesService.isAdmin()) throw new Error('Not authorized');
    await _delay();
    _articles = _articles.map(a =>
      a.id === id ? { ...a, status: 'rejected', rejectionReason: reason, updatedAt: new Date().toISOString() } : a
    );
    _persist();
  },

  async delete(id) {
    // TODO: DELETE /api/articles/:id
    if (!ArticlesService.isAdmin()) throw new Error('Not authorized');
    await _delay();
    _articles = _articles.filter(a => a.id !== id);
    _persist();
  },

  // ── PubMed import (stub — replace with real fetch) ───────────────────────────
  async importFromPubMed(pmid) {
    // TODO: Replace mock with real API call:
    // const res = await fetch(`https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&id=${pmid}&retmode=json`)
    // const data = await res.json()
    // Map PubMed fields → Atlas article schema
    await _delay(800);
    return {
      id: '', title: `Artículo PubMed ${pmid}`,
      subtitle: 'Importado desde PubMed — editar antes de publicar',
      category: 'fuerza', tags: [], status: 'draft',
      readTime: 8, gems: 15,
      summary: 'Resumen pendiente de redacción.',
      sections: [{ heading: 'Resumen del estudio', body: 'Por completar.' }],
      refs: [`PMID: ${pmid}`],
      doi: null, pmid, semanticScholarId: null,
      authors: [], journal: null, publishYear: null,
      evidenceLevel: 'review',
      aiSummary: null, aiKeywords: [], aiGeneratedAt: null,
      coverImage: null, figures: [],
    };
  },

  // ── Semantic Scholar import (stub) ───────────────────────────────────────────
  async importFromSemanticScholar(doi) {
    // TODO: const res = await fetch(`https://api.semanticscholar.org/graph/v1/paper/${encodeURIComponent(doi)}?fields=title,authors,year,venue,abstract`)
    await _delay(800);
    return { id: '', title: `Paper DOI: ${doi}`, subtitle: 'Importado — completar campos', category: 'fuerza', tags: [], status: 'draft', readTime: 8, gems: 15, summary: 'Resumen pendiente.', sections: [], refs: [`DOI: ${doi}`], doi, pmid: null, semanticScholarId: null, authors: [], journal: null, publishYear: null, evidenceLevel: 'review', aiSummary: null, aiKeywords: [], aiGeneratedAt: null, coverImage: null, figures: [] };
  },

  // ── AI summary generation (stub — replace with Claude API call) ───────────────
  async generateAISummary(id) {
    // TODO: POST /api/ai/summarize  { articleId }
    // Backend calls: anthropic.messages.create({ model: 'claude-opus-4-7', messages: [{ role: 'user', content: `Summarize in 2 sentences for an athlete: ${article.sections.map(s=>s.body).join(' ')}` }] })
    await _delay(1200);
    const article = _articles.find(a => a.id === id);
    if (!article) throw new Error('Article not found');
    const mockSummaries = {
      'sobrecarga-progresiva': 'Aumenta el estímulo cada semana: más peso, más reps o más series. Sin progresión, no hay adaptación.',
      'rpe-rir': 'RPE 8 = RIR 2. Autorregula la carga según cómo llegas ese día, no solo según el número del programa.',
    };
    const summary = mockSummaries[id] || `Resumen IA generado: ${article.title} — ${article.summary.slice(0, 80)}...`;
    _articles = _articles.map(a =>
      a.id === id ? { ...a, aiSummary: summary, aiGeneratedAt: new Date().toISOString() } : a
    );
    _persist();
    return summary;
  },

  // ── Image upload (stub — replace with Supabase Storage) ──────────────────────
  async uploadCoverImage(id, file) {
    // TODO: const { data } = await supabase.storage.from('article-images').upload(`covers/${id}`, file)
    // const url = supabase.storage.from('article-images').getPublicUrl(`covers/${id}`).data.publicUrl
    await _delay(600);
    const url = URL.createObjectURL(file);
    _articles = _articles.map(a => a.id === id ? { ...a, coverImage: url } : a);
    _persist();
    return url;
  },

  // ── Reset to seed data (dev utility) ─────────────────────────────────────────
  reset() {
    _articles = SEED.map(a => ({ ...a }));
    _persist();
  },
};

// Expose globally
Object.assign(window, { ArticlesService });
