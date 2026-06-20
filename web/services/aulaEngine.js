// Atlas Aula Engine — content recommendation and learning paths
// Pure functions, no side effects, no React

(function () {
  'use strict';

const OBJECTIVE_WEIGHTS = {
  muscle:      { hipertrofia:3, fuerza:2,   recuperacion:1.5, nutricion:1.5, cognitivo:1, sueno:1,   keywords:['hipertrofia','volumen','frecuencia','sobrecarga','proteína','mTOR'] },
  fat_loss:    { nutricion:3,   recuperacion:2, hipertrofia:1, sueno:1.5,   cognitivo:1, fuerza:1,   keywords:['proteína','déficit','adherencia','calorías'] },
  recomp:      { hipertrofia:2.5, nutricion:2.5, fuerza:2, recuperacion:1.5, sueno:1.5,  cognitivo:1, keywords:['proteína','sobrecarga','volumen','déficit'] },
  performance: { fuerza:3,      recuperacion:2, cognitivo:2.5, sueno:2, hipertrofia:1,  nutricion:1,  keywords:['RPE','HRV','periodización','fuerza','rendimiento'] },
  health:      { recuperacion:3, sueno:3,    nutricion:2, cognitivo:2, fuerza:1, hipertrofia:1,        keywords:['sueño','recuperación','salud','HRV'] },
};

const LEARNING_PATHS = {
  hipertrofia: {
    label: 'Ruta Hipertrofia',
    color: '#059669',
    steps: [
      { id: 'sobrecarga-progresiva',   label: 'Principios'   },
      { id: 'hipertrofia-mecanismos',  label: 'Mecanismos'   },
      { id: 'volumen-frecuencia',      label: 'Volumen'      },
      { id: 'rpe-rir',                 label: 'Intensidad'   },
      { id: 'nutricion-proteina',      label: 'Nutrición'    },
      { id: 'deload',                  label: 'Recuperación' },
    ],
  },
  fuerza: {
    label: 'Ruta Fuerza',
    color: '#1E40AF',
    steps: [
      { id: 'sobrecarga-progresiva',   label: 'Principios'      },
      { id: 'rpe-rir',                 label: 'Intensidad'      },
      { id: 'periodizacion-bloques',   label: 'Periodización'   },
    ],
  },
  recuperacion: {
    label: 'Ruta Recuperación',
    color: '#0369A1',
    steps: [
      { id: 'recuperacion-sueno', label: 'Sueño'  },
      { id: 'hrv-monitoreo',      label: 'HRV'    },
      { id: 'deload',             label: 'Deload' },
    ],
  },
  bienestar: {
    label: 'Ruta Bienestar',
    color: '#0F766E',
    steps: [
      { id: 'recuperacion-sueno', label: 'Sueño'     },
      { id: 'nutricion-proteina', label: 'Nutrición' },
      { id: 'hrv-monitoreo',      label: 'HRV'       },
    ],
  },
};

const OBJECTIVE_PATH = {
  muscle:      'hipertrofia',
  fat_loss:    'bienestar',
  recomp:      'hipertrofia',
  performance: 'fuerza',
  health:      'bienestar',
};

function aulaScoreArticle(article, profile, completedIds) {
  let score   = 0;
  const obj     = profile?.objective || 'muscle';
  const weights = OBJECTIVE_WEIGHTS[obj] || OBJECTIVE_WEIGHTS.muscle;
  const exp     = profile?.experience || 'intermediate';

  // Category relevance
  score += (weights[article.category] || 0.5) * 10;

  // Keyword overlap with objective keywords
  const artKws = (article.aiKeywords || []).map(k => k.toLowerCase());
  (weights.keywords || []).forEach(kw => {
    if (artKws.some(k => k.includes(kw.toLowerCase()))) score += 4;
  });

  // Experience level match
  const expTags = { beginner:['principiante','fundamental'], intermediate:['intermedio'], advanced:['avanzado'] };
  const myTags  = expTags[exp] || expTags.intermediate;
  if ((article.tags || []).some(t => myTags.includes(t))) score += 6;

  // Injury-aware boost for recovery content
  if ((profile?.injuries || []).length > 0 && article.category === 'recuperacion') score += 5;

  // Muscle priority → hypertrophy content boost
  if ((profile?.musclePriorities || []).length > 0 && article.category === 'hipertrofia') score += 4;

  // Unread boost
  if (!(completedIds || []).includes(article.id)) score += 3;

  return score;
}

function aulaGetRecommended(articles, profile, completedIds, n) {
  return [...articles]
    .map(a => ({ ...a, _score: aulaScoreArticle(a, profile, completedIds) }))
    .sort((a, b) => b._score - a._score)
    .slice(0, n || 4);
}

function aulaGetLearningPath(profile) {
  const obj     = profile?.objective || 'muscle';
  const pathKey = OBJECTIVE_PATH[obj] || 'hipertrofia';
  return { pathKey, ...LEARNING_PATHS[pathKey] };
}

function aulaGetRelatedArticles(articles, currentId, n) {
  const current = articles.find(a => a.id === currentId);
  if (!current) return [];
  const kws = [...(current.aiKeywords || []), ...(current.tags || [])].map(k => k.toLowerCase());
  return articles
    .filter(a => a.id !== currentId)
    .map(a => {
      const akws    = [...(a.aiKeywords || []), ...(a.tags || [])].map(k => k.toLowerCase());
      const overlap = akws.filter(k => kws.some(ckw => k.includes(ckw) || ckw.includes(k))).length;
      const catBonus = a.category === current.category ? 3 : 0;
      return { ...a, _score: overlap * 2 + catBonus };
    })
    .filter(a => a._score > 0)
    .sort((a, b) => b._score - a._score)
    .slice(0, n || 3);
}

function aulaFindByKeywords(articles, keywords, n) {
  if (!keywords?.length) return [];
  const kws = keywords.map(k => k.toLowerCase());
  return articles
    .filter(a => a.status === 'published')
    .map(a => {
      const artKws = [...(a.aiKeywords || []), ...(a.tags || [])].map(k => k.toLowerCase());
      const score  = artKws.filter(k => kws.some(ckw => k.includes(ckw) || ckw.includes(k))).length;
      return { ...a, _score: score };
    })
    .filter(a => a._score > 0)
    .sort((a, b) => b._score - a._score)
    .slice(0, n || 3);
}

Object.assign(window, {
  LEARNING_PATHS, OBJECTIVE_PATH, OBJECTIVE_WEIGHTS,
  aulaScoreArticle, aulaGetRecommended,
  aulaGetLearningPath, aulaGetRelatedArticles, aulaFindByKeywords,
});

})();
