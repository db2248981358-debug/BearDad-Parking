
/*
 * 熊爸找車位 V1.8
 * Service Worker
 *
 * 功能：
 * 1. 快取網頁及 APP 安裝資源
 * 2. 優先使用網路最新版本
 * 3. 網路中斷時提供離線首頁
 * 4. 清除舊版本快取
 * 5. 不攔截 Cloudflare Worker API
 */

const CACHE = 'bear-parking-shell-v1.9';

const FILES = [
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

// 啟用新版並清除舊快取
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

// 網路優先策略
self.addEventListener('fetch', event => {

  const request = event.request;
  const url = new URL(request.url);

  // 不攔截外部 Cloudflare API
  if (
    request.method !== 'GET' ||
    url.origin !== self.location.origin
  ) {
    return;
  }

  event.respondWith(
    (async () => {

      try {

        // 優先取得網路最新資料
        const response = await fetch(request);

        if (response.ok) {

          const cache =
            await caches.open(CACHE);

          await cache.put(
            request,
            response.clone()
          );
        }

        return response;

      } catch(error) {

        // 網路無法使用時讀取快取
        const cached =
          await caches.match(request);

        if (cached) {
          return cached;
        }

        // 離線時嘗試開啟首頁
        if (request.mode === 'navigate') {

          const page =
            await caches.match('./index.html');

          if (page) {
            return page;
          }
        }

        return Response.error();
      }

    })()
  );

});
