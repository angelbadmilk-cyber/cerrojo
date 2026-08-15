const CACHE = 'cerrojo-v1';
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

self.addEventListener('fetch', (evento) => {
  if (evento.request.method !== 'GET') return;
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