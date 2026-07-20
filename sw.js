/* Atlas Method — Service Worker
 * Strategy:
 *   - App shell (local files + CDN libs) → cache-first, precached on install
 *   - Everything else → network-first with cache fallback
 *
 * Bump CACHE_VER on every deploy so activate deletes the old shell cache
 * and forces a fresh precache run.
 */

const CACHE_VER    = 'atlas-v13';
const SHELL_CACHE  = `${CACHE_VER}-shell`;
const DYN_CACHE    = `${CACHE_VER}-dynamic`;
// Exercise photos (free-exercise-db) are immutable and heavy; keep them in a
// version-independent cache so they survive CACHE_VER bumps and aren't re-fetched.
const IMG_CACHE    = 'atlas-exercise-images';

/* ── App shell — precached on install ───────────────────────────── */
const SHELL_URLS = [
  '/',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/icon-512-maskable.png',
  '/icons/apple-touch-icon.png',

  /* Core */
  '/web/core/store.jsx',
  '/web/core/shell.jsx',
  '/web/components/shell.jsx',

  /* Sections */
  '/web/sections/hero.jsx',
  '/web/sections/method.jsx',
  '/web/sections/lab.jsx',
  '/web/sections/builder.jsx',
  '/web/sections/rutinas.jsx',
  '/web/sections/dashboard.jsx',
  '/web/sections/coach.jsx',
  '/web/sections/atlas-coach.jsx',
  '/web/sections/workout-player.jsx',
  '/web/sections/progreso.jsx',
  '/web/sections/mobile.jsx',
  '/web/sections/closing.jsx',
  '/web/sections/aula.jsx',
  '/web/sections/aula-admin.jsx',
  '/web/sections/laboratorio.jsx',
  '/web/sections/gems-store.jsx',
  '/web/sections/home-dashboard.jsx',

  /* Services */
  '/web/services/exercises.jsx',
  '/web/services/exercise-images.js',
  '/web/services/exercise-media.jsx',
  '/web/services/articles.jsx',
  '/web/services/exportRoutinePDF.js',
  '/web/services/backup.js',
  '/web/services/scientificEngine.js',
  '/web/services/workoutSession.js',
  '/web/services/timerFeedback.js',
  '/web/services/progressionEngine.js',
  '/web/services/aulaEngine.js',
  '/web/services/atlasProgressionEngine.js',

  /* CDN — exact versioned URLs so they stay stable */
  'https://unpkg.com/react@18.3.1/umd/react.development.js',
  'https://unpkg.com/react-dom@18.3.1/umd/react-dom.development.js',
  'https://unpkg.com/@babel/standalone@7.29.0/babel.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js',
];

/* ── Install: precache shell ─────────────────────────────────────── */
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(SHELL_CACHE).then(cache => {
      // addAll fails atomically — if any resource 404s the install aborts.
      // Cache each item individually so one broken CDN URL doesn't block install.
      return Promise.allSettled(
        SHELL_URLS.map(url =>
          cache.add(url).catch(err =>
            console.warn('[SW] precache miss:', url, err.message)
          )
        )
      );
    }).then(() => self.skipWaiting())   // take over immediately
  );
});

/* ── Activate: delete old caches ─────────────────────────────────── */
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(k => k !== SHELL_CACHE && k !== DYN_CACHE && k !== IMG_CACHE)
          .map(k => {
            console.log('[SW] deleting old cache:', k);
            return caches.delete(k);
          })
      )
    ).then(() => self.clients.claim())
  );
});

/* ── Fetch: routing ──────────────────────────────────────────────── */
self.addEventListener('fetch', event => {
  const req = event.request;
  const url = new URL(req.url);

  // Only handle GET requests
  if (req.method !== 'GET') return;

  // Skip browser-extension requests
  if (!url.protocol.startsWith('http')) return;

  // Exercise photos → cache-first into a persistent, version-independent cache
  if (url.hostname === 'raw.githubusercontent.com' && url.pathname.includes('/free-exercise-db/')) {
    event.respondWith(cacheFirstImages(req));
    return;
  }

  const isShell = isShellResource(url);

  if (isShell) {
    event.respondWith(cacheFirst(req));
  } else {
    event.respondWith(networkFirst(req));
  }
});

/* Cache-first for exercise images: persistent cache, lazily populated */
async function cacheFirstImages(req) {
  const cached = await caches.match(req);
  if (cached) return cached;
  try {
    const resp = await fetch(req);
    if (resp.ok) {
      const cache = await caches.open(IMG_CACHE);
      cache.put(req, resp.clone());
    }
    return resp;
  } catch (err) {
    return new Response('', { status: 503, statusText: 'Offline' });
  }
}

function isShellResource(url) {
  const origin = self.location.origin;

  // Local shell files
  if (url.origin === origin) {
    const p = url.pathname;
    if (p === '/' || p === '/index.html') return true;
    if (p.startsWith('/web/') || p.startsWith('/icons/') || p === '/manifest.json') return true;
  }

  // CDN libraries
  const cdnHosts = ['unpkg.com', 'cdnjs.cloudflare.com'];
  if (cdnHosts.some(h => url.hostname === h)) return true;

  return false;
}

/* Cache-first: serve from cache; fall back to network and update cache */
async function cacheFirst(req) {
  const cached = await caches.match(req);
  if (cached) return cached;

  try {
    const resp = await fetch(req);
    if (resp.ok) {
      const cache = await caches.open(SHELL_CACHE);
      cache.put(req, resp.clone());
    }
    return resp;
  } catch (err) {
    // Return a minimal offline page for navigations
    if (req.mode === 'navigate') return offlinePage();
    throw err;
  }
}

/* Network-first: try network, cache the result; fall back to cache */
async function networkFirst(req) {
  try {
    const resp = await fetch(req);
    if (resp.ok) {
      const cache = await caches.open(DYN_CACHE);
      cache.put(req, resp.clone());
    }
    return resp;
  } catch (_) {
    const cached = await caches.match(req);
    if (cached) return cached;
    if (req.mode === 'navigate') return offlinePage();
    return new Response('', { status: 503, statusText: 'Offline' });
  }
}

/* Minimal offline fallback for navigations when shell itself isn't cached yet */
function offlinePage() {
  return new Response(
    `<!doctype html><html lang="es"><head><meta charset="utf-8">
    <meta name="viewport" content="width=device-width">
    <title>Atlas Method — Sin conexión</title>
    <style>body{font-family:system-ui,sans-serif;background:#0F1A2E;color:#FAFAF7;
    display:flex;align-items:center;justify-content:center;height:100vh;margin:0;text-align:center;}
    p{color:rgba(250,250,247,.5);font-size:14px;margin-top:8px}</style></head>
    <body><div><h2>Sin conexión</h2><p>Abre Atlas con conexión la primera vez para activar el modo offline.</p></div></body></html>`,
    { headers: { 'Content-Type': 'text/html; charset=utf-8' } }
  );
}
