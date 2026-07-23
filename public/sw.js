// Emetis Service Worker — v4
const CACHE_NAME = 'emetis-v4';

// Cache dedicado para conteúdo bíblico (persiste entre versões do app)
const BIBLE_CACHE = 'emetis-bible-v1';

// ── Install — sem precache de páginas (Next.js App Router gera RSC) ───────────
self.addEventListener('install', (event) => {
  event.waitUntil(self.skipWaiting());
});

// ── Activate — limpa todos os caches antigos, mantém BIBLE_CACHE ─────────────
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
  return (
    url.pathname === '/api/bible/chapter' ||
    url.pathname === '/api/bible/verse-of-day'
  );
}

// Requisições RSC do Next.js App Router: payload JSON/binário, NÃO são HTML.
// Se o SW interceptar e devolver cache com Content-Type errado,
// o Safari trata como download de arquivo.
function isRscOrNextInternal(request, url) {
  // Parâmetro _rsc indica React Server Component fetch
  if (url.searchParams.has('_rsc')) return true;
  // Header Rsc: 1 (Next.js 13+)
  if (request.headers.get('Rsc') === '1') return true;
  // Next.js internals: chunks, HMR, etc.
  if (url.pathname.startsWith('/_next/')) return true;
  // APIs da aplicação
  if (url.pathname.startsWith('/api/')) return true;
  return false;
}

// Verifica se é uma navegação HTML real (clique em link, abertura da PWA)
function isHtmlNavigation(request) {
  return request.mode === 'navigate' ||
    (request.method === 'GET' && request.headers.get('Accept')?.includes('text/html'));
}

// ── Fetch ──────────────────────────────────────────────────────────────────────
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // Ignora origens externas
  if (url.origin !== self.location.origin) return;

  // ── RSC / Next.js internals / APIs: nunca interceptar ─────────────────────
  // Evita o bug de download no Safari/iPad onde o SW devolve RSC payload
  // como se fosse a página HTML.
  if (isRscOrNextInternal(event.request, url)) return;

  // ── Bíblia: Cache-first com atualização em background ──────────────────────
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

        if (cached) {
          event.waitUntil(fetchPromise);
          return cached;
        }

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

  // ── Assets estáticos (imagens, fontes, manifest): cache-first ─────────────
  if (
    url.pathname.startsWith('/images/') ||
    url.pathname.startsWith('/icons/') ||
    url.pathname === '/manifest.json' ||
    /\.(png|jpg|jpeg|svg|webp|ico|woff2?|ttf)$/.test(url.pathname)
  ) {
    event.respondWith(
      caches.open(CACHE_NAME).then(async (cache) => {
        const cached = await cache.match(event.request);
        if (cached) return cached;
        const res = await fetch(event.request);
        if (res.ok) cache.put(event.request, res.clone());
        return res;
      })
    );
    return;
  }

  // ── Navegações HTML: network-first, cache fallback ────────────────────────
  // Apenas para navegações reais (mode: navigate), não para RSC fetches.
  if (isHtmlNavigation(event.request)) {
    event.respondWith(
      fetch(event.request)
        .then((res) => {
          // Só cacheia respostas HTML válidas
          const ct = res.headers.get('Content-Type') ?? '';
          if (res.ok && ct.includes('text/html')) {
            const clone = res.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return res;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // Qualquer outra coisa: deixa o browser lidar normalmente
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
