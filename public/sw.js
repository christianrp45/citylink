// Emetis Service Worker — v2
const CACHE_NAME = 'emetis-v2';

// Cache dedicado para conteúdo bíblico (persiste entre versões do app)
const BIBLE_CACHE = 'emetis-bible-v1';

// Arquivos essenciais para cache offline
const PRECACHE = ['/map', '/chat', '/community', '/events', '/bible'];

// ── Install ────────────────────────────────────────────────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting())
  );
});

// ── Activate — limpa caches antigos, mantém BIBLE_CACHE ───────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((k) => k !== CACHE_NAME && k !== BIBLE_CACHE)
            .map((k) => caches.delete(k))
        )
      )
      .then(() => self.clients.claim())
  );
});

// ── Helpers ────────────────────────────────────────────────────────────────────

function isBibleRequest(url) {
  // Capítulos bíblicos e versículo do dia — cache separado e persistente
  return (
    url.pathname === '/api/bible/chapter' ||
    url.pathname === '/api/bible/verse-of-day'
  );
}

function isApiRequest(url) {
  return url.pathname.startsWith('/api/') || url.pathname.startsWith('/_next/');
}

// ── Fetch ──────────────────────────────────────────────────────────────────────
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // ── Bíblia: Cache-first com atualização em background ──────────────────────
  // Capítulos já lidos ficam disponíveis offline imediatamente.
  // Quando há internet, atualiza o cache silenciosamente.
  if (isBibleRequest(url)) {
    event.respondWith(
      caches.open(BIBLE_CACHE).then(async (cache) => {
        const cached = await cache.match(event.request);
        const fetchPromise = fetch(event.request)
          .then((res) => {
            if (res.ok) cache.put(event.request, res.clone());
            return res;
          })
          .catch(() => null);

        // Se há cache, entrega imediatamente e atualiza em background
        if (cached) {
          event.waitUntil(fetchPromise);
          return cached;
        }

        // Sem cache: aguarda a rede; se falhar, retorna erro offline
        const res = await fetchPromise;
        if (res) return res;

        return new Response(
          JSON.stringify({ error: 'Sem conexão. Abra este capítulo online primeiro para ler offline.' }),
          { status: 503, headers: { 'Content-Type': 'application/json' } }
        );
      })
    );
    return;
  }

  // ── Outras APIs: deixa passar sem cache ────────────────────────────────────
  if (isApiRequest(url)) return;

  // ── Páginas e assets: Network-first, cache fallback ───────────────────────
  event.respondWith(
    fetch(event.request)
      .then((res) => {
        const clone = res.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        return res;
      })
      .catch(() => caches.match(event.request))
  );
});

// ── Mensagem do cliente: limpar cache bíblico ─────────────────────────────────
// Uso: navigator.serviceWorker.controller.postMessage({ type: 'CLEAR_BIBLE_CACHE' })
self.addEventListener('message', (event) => {
  if (event.data?.type === 'CLEAR_BIBLE_CACHE') {
    caches.delete(BIBLE_CACHE);
  }
});

// ── Push Notifications ─────────────────────────────────────────────────────────
self.addEventListener('push', (event) => {
  if (!event.data) return;

  let payload;
  try {
    payload = event.data.json();
  } catch {
    payload = { title: 'Emetis', body: event.data.text() };
  }

  const { title = 'Emetis', body = '', icon = '/images/icon-192.png', url = '/map' } = payload;

  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      icon,
      badge: '/images/icon-192.png',
      data: { url },
      vibrate: [200, 100, 200],
    })
  );
});

// ── Notification click ─────────────────────────────────────────────────────────
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url ?? '/map';

  event.waitUntil(
    self.clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((clients) => {
        const existing = clients.find((c) => c.url.includes(self.location.origin));
        if (existing) {
          existing.focus();
          existing.navigate(targetUrl);
        } else {
          self.clients.openWindow(targetUrl);
        }
      })
  );
});
