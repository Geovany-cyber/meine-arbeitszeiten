const CACHE = 'meine-arbeitszeiten-v3-1';
const DATEIEN = ['./', './index.html', './manifest.webmanifest'];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(DATEIEN))
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(namen =>
      Promise.all(
        namen.filter(name => name.startsWith('meine-arbeitszeiten-') && name !== CACHE)
          .map(name => caches.delete(name))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET' ||
      new URL(event.request.url).origin !== self.location.origin) return;

  event.respondWith(
    fetch(event.request).then(antwort => {
      if (antwort.ok) {
        const kopie = antwort.clone();
        event.waitUntil(
          caches.open(CACHE).then(cache => cache.put(event.request, kopie))
        );
      }
      return antwort;
    }).catch(() => caches.match(event.request))
  );
});
