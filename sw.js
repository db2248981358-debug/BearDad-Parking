
const CACHE = 'bear-parking-shell-v1.5';

const FILES = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icon-192.png',
  './icon-512.png'
];

// 安裝新版 Service Worker
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE)
      .then(cache => cache.addAll(FILES))
      .then(() => self.skipWaiting())
  );
});

// 啟用新版並清除舊版本快取
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

// 網路優先：線上取得最新檔案
// 網路失敗時才使用已快取的介面
self.addEventListener('fetch', event => {
  const request = event.request;
  const url = new URL(request.url);

  // 不攔截 Cloudflare Worker 或其他外部 API
  if (
    url.origin !== self.location.origin ||
    request.method !== 'GET'
  ) {
    return;
  }

  event.respondWith(
    (async () => {
      try {
        const response = await fetch(request);

        if (response.ok) {
          const cache = await caches.open(CACHE);
          await cache.put(request, response.clone());
        }

        return response;
      } catch (error) {
        const cached = await caches.match(request);

        if (cached) {
          return cached;
        }

        // 僅在頁面導覽時使用離線首頁
        if (request.mode === 'navigate') {
          const offlinePage =
            await caches.match('./index.html');

          if (offlinePage) {
            return offlinePage;
          }
        }

        return Response.error();
      }
    })()
  );
});
