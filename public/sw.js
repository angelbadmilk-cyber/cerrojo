const CACHE = 'cerrojo-v2';
const CORE = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png'];

self.addEventListener('install', (evento) => {
  evento.waitUntil(caches.open(CACHE).then((c) => c.addAll(CORE)));
  self.skipWaiting();
});

self.addEventListener('activate', (evento) => {
  evento.waitUntil(
    caches.keys().then((claves) => Promise.all(claves.filter((k) => k !== CACHE).map((k) => caches.delete(k)))),
  );
  self.clients.claim();
});

// Escuchar mensaje para forzar la actualización inmediata
self.addEventListener('message', (evento) => {
  if (evento.data && evento.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

self.addEventListener('fetch', (evento) => {
  if (evento.request.method !== 'GET') return;

  // NO cachear favicons (son dinámicos y dan problemas en móvil)
  const url = new URL(evento.request.url);
  if (
    url.hostname.includes('duckduckgo.com') ||
    url.hostname.includes('google.com/s2') ||
    url.hostname.includes('favicon') ||
    url.hostname.includes('api.pwnedpasswords.com')
  ) {
    return;
  }

  evento.respondWith(
    caches.match(evento.request).then(
      (acierto) =>
        acierto ||
        fetch(evento.request)
          .then((respuesta) => {
            const copia = respuesta.clone();
            if (respuesta.ok && new URL(evento.request.url).origin === self.location.origin) {
              caches.open(CACHE).then((c) => c.put(evento.request, copia));
            }
            return respuesta;
          })
          .catch(() => caches.match('./index.html')),
    ),
  );
});