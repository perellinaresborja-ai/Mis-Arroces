const CACHE_NAME = 'misarroces-v9';
const OFFLINE_URL = '/offline.html';

const STATIC_ASSETS = [
  OFFLINE_URL,
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/icons/icon-maskable-512x512.png',
  '/apple-touch-icon.png'
];

// Fallback HTML en memoria para garantizar que event.respondWith NUNCA reciba undefined
const OFFLINE_FALLBACK_HTML = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Sin conexión | misarroces</title>
  <link rel="icon" href="/icons/icon-192x192.png">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      background-color: #F7F5F0;
      color: #18181B;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }
    .card {
      max-width: 420px;
      width: 100%;
      background: #FFFFFF;
      border: 1px solid #EAE7E0;
      border-radius: 28px;
      padding: 36px 24px;
      text-align: center;
      box-shadow: 0 4px 24px rgba(0, 0, 0, 0.05);
    }
    .icon {
      width: 96px;
      height: 96px;
      margin: 0 auto 20px auto;
      border-radius: 24px;
      background-color: #FFFFFF;
      border: 1px solid #EAE7E0;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 6px;
    }
    .icon img {
      width: 100%;
      height: 100%;
      object-fit: contain;
    }
    h1 {
      font-size: 20px;
      font-weight: 800;
      letter-spacing: -0.02em;
      margin-bottom: 10px;
      color: #18181B;
    }
    p {
      font-size: 14px;
      line-height: 22px;
      color: #52525B;
      margin-bottom: 24px;
    }
    .btn {
      display: inline-block;
      background-color: #EA580C;
      color: #FFFFFF;
      font-size: 14px;
      font-weight: 800;
      letter-spacing: 0.03em;
      text-transform: uppercase;
      padding: 12px 28px;
      border-radius: 14px;
      border: none;
      cursor: pointer;
      text-decoration: none;
      box-shadow: 0 4px 14px rgba(234, 88, 12, 0.25);
      transition: opacity 0.15s ease;
    }
    .btn:hover {
      opacity: 0.9;
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="icon">
      <img src="/icons/icon-192x192.png" alt="misarroces" width="84" height="84">
    </div>
    <h1>Sin conexión a internet</h1>
    <p>
      Parece que te has quedado sin cobertura. Revisa tu señal para seguir descubriendo y compartiendo recetas.
    </p>
    <button class="btn" onclick="window.location.reload()">
      Reintentar conexión
    </button>
  </div>
</body>
</html>`;

// 1. Instalación: almacenar assets offline y activar solo tras éxito de cache
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      for (const asset of STATIC_ASSETS) {
        try {
          await cache.add(asset);
        } catch (err) {
          console.warn('[SW] Error no crítico precacheando asset:', asset, err);
        }
      }
    }).then(() => self.skipWaiting())
  );
});

// 2. Activación: habilitar Navigation Preload, reclamar clientes y limpiar cachés antiguas
self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      // Habilitar Navigation Preload de forma nativa en Chrome / TWA
      // Esto elimina el retraso de arranque del Service Worker en cold start
      if (self.registration.navigationPreload) {
        try {
          await self.registration.navigationPreload.enable();
        } catch (e) {
          // No soportado o error silencioso
        }
      }

      // Limpiar cachés obsoletas
      const keys = await caches.keys();
      await Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );

      await self.clients.claim();
    })()
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

  // Para navegaciones (cambios de página en el navegador / arranque de la app en frío)
  if (request.mode === 'navigate') {
    event.respondWith(
      (async () => {
        try {
          // 1. Intentar usar la respuesta de Navigation Preload si existe (evita cold start lag en Chrome)
          const preloadResponse = await event.preloadResponse;
          if (preloadResponse) {
            return preloadResponse;
          }

          // 2. Si no hay preload, realizar la petición directa a la red
          return await fetch(request);
        } catch (networkError) {
          console.warn('[SW] Error en navegación por red, cargando fallback offline:', networkError);

          // 3. Fallback a offline.html desde la caché
          try {
            const cachedResponse = await caches.match(OFFLINE_URL);
            if (cachedResponse) {
              return cachedResponse;
            }
          } catch (cacheErr) {
            console.warn('[SW] Error leyendo offline.html de caché:', cacheErr);
          }

          // 4. RED DE SEGURIDAD ABSOLUTA:
          // Si por cualquier motivo la caché no tiene offline.html o está vacía,
          // NUNCA devolver undefined a event.respondWith (eso provocaría que Chrome lance TypeError
          // y muestre la pantalla nativa "This page couldn't load").
          return new Response(OFFLINE_FALLBACK_HTML, {
            status: 200,
            headers: { 'Content-Type': 'text/html; charset=utf-8' }
          });
        }
      })()
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
