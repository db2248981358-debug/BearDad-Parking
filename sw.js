
/*
 * 熊爸找車位 V2.2.1
 * PWA 快取修正版
 *
 * 修正：
 * 1. 網頁首頁一律優先取得最新版本
 * 2. 不再用舊版首頁冒充新版
 * 3. 自動清除 V1.x、V2.x 舊快取
 * 4. 保留 PWA 安裝能力
 * 5. 不攔截 Cloudflare Worker API
 */

const CACHE = "bear-parking-shell-v2.2.1";

const STATIC_FILES = [
  "./manifest.webmanifest",
  "./icon-192.png",
  "./icon-512.png"
];

// 安裝新版
self.addEventListener("install", event => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE);

      await cache.addAll(STATIC_FILES);

      await self.skipWaiting();
    })()
  );
});

// 啟用新版，刪除舊版快取
self.addEventListener("activate", event => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();

      await Promise.all(
        keys
          .filter(key =>
            key.startsWith("bear-parking-shell-") &&
            key !== CACHE
          )
          .map(key => caches.delete(key))
      );

      await self.clients.claim();
    })()
  );
});

// 網路請求
self.addEventListener("fetch", event => {
  const request = event.request;
  const url = new URL(request.url);

  // 不攔截其他網站與 Cloudflare API
  if (
    request.method !== "GET" ||
    url.origin !== self.location.origin
  ) {
    return;
  }

  // 首頁與頁面導覽：直接向網路取得最新版本
  if (
    request.mode === "navigate" ||
    url.pathname.endsWith("/index.html")
  ) {
    event.respondWith(
      (async () => {
        try {
          return await fetch(request, {
            cache: "no-store"
          });
        } catch (error) {
          return new Response(
            `<!doctype html>
            <html lang="zh-Hant">
            <head>
              <meta charset="utf-8">
              <meta name="viewport"
                    content="width=device-width,initial-scale=1">
              <title>熊爸找車位</title>
            </head>
            <body style="font-family:sans-serif;
                         padding:24px;
                         background:#faf8e9">
              <h2>目前無法取得最新版本</h2>
              <p>請確認手機網路連線後重新開啟。</p>
              <button onclick="location.reload()">
                重新載入
              </button>
            </body>
            </html>`,
            {
              status: 503,
              headers: {
                "Content-Type":
                  "text/html; charset=utf-8",
                "Cache-Control": "no-store"
              }
            }
          );
        }
      })()
    );

    return;
  }

  // 其他同網域靜態資源：網路優先
  event.respondWith(
    (async () => {
      try {
        const response = await fetch(request);

        if (response.ok) {
          const cache = await caches.open(CACHE);

          await cache.put(
            request,
            response.clone()
          );
        }

        return response;
      } catch (error) {
        const cached = await caches.match(request);

        if (cached) {
          return cached;
        }

        return Response.error();
      }
    })()
  );
});
