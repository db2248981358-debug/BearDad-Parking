
/*
 * 熊爸找車位 V2.1
 * Service Worker
 */

const CACHE = 'bear-parking-shell-v2.1';

const FILES = [
  './index.html',
  './manifest.webmanifest',
  './icon-192.png',
  './icon-512.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE)
      .then(cache => cache.addAll(FILES))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys
          .filter(key =>
            key.startsWith('bear-parking-shell-') &&
            key !== CACHE
          )
          .map(key => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const request = event.request;
  const url = new URL(request.url);

  // 不攔截外部 API
  if (
    request.method !== 'GET' ||
    url.origin !== self.location.origin
  ) {
    return;
  }

  event.respondWith(
    (async () => {
      try {
        const response = await fetch(request);

        if (response.ok) {
          const cache = await caches.open(CACHE);
          await cache.put(request,response.clone());
        }

        return response;
      } catch(error) {
        const cached = await caches.match(request);

        if(cached)return cached;

        if(request.mode==='navigate'){
          const page=await caches.match('./index.html');
          if(page)return page;
        }

        return Response.error();
      }
    })()
  );
});
