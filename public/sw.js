// Service Worker ligero para misarroces PWA
const CACHE_NAME = 'misarroces-v1';
const OFFLINE_URL = '/offline.html';

const STATIC_ASSETS = [
  OFFLINE_URL,
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/apple-touch-icon.png'
];

// 1. Instalación inmediata: almacenar assets offline y forzar activación (skipWaiting)
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// 2. Activación: reclamar clientes inmediatamente y limpiar cachés antiguas
self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      caches.keys().then((keys) => {
        return Promise.all(
          keys.map((key) => {
            if (key !== CACHE_NAME) {
              return caches.delete(key);
            }
          })
        );
      }),
      self.clients.claim()
    ])
  );
});

// 3. Estrategia de red:
// REGLA ESTRICTA: NO cachear Feed, recetas, Supabase ni contenido dinámico.
// Solo servir offline.html cuando una navegación de página falle completamente por falta de red.
self.addEventListener('fetch', (event) => {
  const request = event.request;

  // Solo procesar peticiones GET
  if (request.method !== 'GET') {
    return;
  }

  const url = new URL(request.url);

  // Omitir peticiones a Supabase, APIs, o analíticas externas (siempre directas a red)
  if (
    url.hostname.includes('supabase.co') ||
    url.pathname.startsWith('/api/') ||
    url.hostname.includes('google')
  ) {
    return;
  }

  // Para navegaciones (cambios de página en el navegador)
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() => {
        return caches.match(OFFLINE_URL);
      })
    );
    return;
  }

  // Para assets estáticos de branding del offline (iconos precacheados)
  if (STATIC_ASSETS.includes(url.pathname)) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        return cachedResponse || fetch(request);
      })
    );
    return;
  }

  // Todo lo demás: pasar directamente por la red sin interferir
});
