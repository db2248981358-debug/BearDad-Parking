
/*
 * 熊爸找車位 V2.4
 * PWA Service Worker
 */

const CACHE="bear-parking-shell-v2.4";

const STATIC_FILES=[
 "./manifest.webmanifest",
 "./icon-192.png",
 "./icon-512.png"
];

self.addEventListener("install",event=>{
 event.waitUntil(
  (async()=>{
   const cache=await caches.open(CACHE);
   await cache.addAll(STATIC_FILES);
   await self.skipWaiting();
  })()
 );
});

self.addEventListener("activate",event=>{
 event.waitUntil(
  (async()=>{
   const keys=await caches.keys();

   await Promise.all(
    keys.filter(key=>
     key.startsWith("bear-parking-shell-") &&
     key!==CACHE
    ).map(key=>caches.delete(key))
   );

   await self.clients.claim();
  })()
 );
});

self.addEventListener("fetch",event=>{
 const request=event.request;
 const url=new URL(request.url);

 if(
  request.method!=="GET" ||
  url.origin!==self.location.origin
 ){
  return;
 }

 // HTML 每次優先取得最新版本
 if(
  request.mode==="navigate" ||
  url.pathname.endsWith("/index.html")
 ){
  event.respondWith(
   fetch(request,{cache:"no-store"})
  );
  return;
 }

 // 靜態資源網路優先
 event.respondWith(
  (async()=>{
   try{
    const response=await fetch(request);

    if(response.ok){
     const cache=await caches.open(CACHE);
     await cache.put(request,response.clone());
    }

    return response;
   }catch(error){
    const cached=await caches.match(request);
    return cached||Response.error();
   }
  })()
 );
});
