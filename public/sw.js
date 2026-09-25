// Service Worker ligero para misarroces PWA
const CACHE_NAME = 'misarroces-v4';
const OFFLINE_URL = '/offline.html';

const STATIC_ASSETS = [
  OFFLINE_URL,
  '/logopngver.png',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/icons/icon-maskable-512x512.png',
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

// 4. Recepción de Notificaciones Push (Web Push API)
self.addEventListener('push', (event) => {
  let data = {};
  if (event.data) {
    try {
      data = event.data.json();
    } catch {
      data = { body: event.data.text() };
    }
  }

  const title = data.title || 'misarroces';
  const unread = typeof data.unreadCount === 'number' && data.unreadCount > 0 ? data.unreadCount : 1;
  const uniqueTag = data.tag || `misarroces-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

  const options = {
    body: data.body || 'Tienes una nueva interacción en misarroces',
    icon: data.icon || '/icons/icon-192x192.png',
    badge: data.badge || '/icons/icon-192x192.png',
    data: {
      url: data.url || '/',
      unreadCount: unread,
      ...data.data,
    },
    tag: uniqueTag,
    renotify: true,
  };

  const tasks = [self.registration.showNotification(title, options)];

  // Sincronizar App Badging API en segundo plano con el conteo real
  if ('setAppBadge' in navigator) {
    tasks.push(navigator.setAppBadge(unread).catch(() => {}));
  }

  event.waitUntil(Promise.all(tasks));
});

// 5. Interacción del usuario al pulsar la notificación
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const targetUrl = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // Si ya hay una pestaña abierta de misarroces, enfocarla y navegar a la URL
      for (const client of windowClients) {
        if ('focus' in client) {
          if ('navigate' in client) {
            client.navigate(targetUrl);
          }
          return client.focus();
        }
      }
      // Si la app/navegador estaba cerrada o sin ventana abierta, abrir nueva ventana
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});

// 6. Mensajes internos desde el cliente para sincronizar el Badge en caliente
self.addEventListener('message', (event) => {
  if (event.data?.type === 'SET_BADGE') {
    if ('setAppBadge' in navigator) {
      const count = event.data.count || 0;
      if (count > 0) {
        navigator.setAppBadge(count).catch(() => {});
      } else {
        navigator.clearAppBadge().catch(() => {});
      }
    }
  } else if (event.data?.type === 'CLEAR_BADGE') {
    if ('clearAppBadge' in navigator) {
      navigator.clearAppBadge().catch(() => {});
    }
  }
});
