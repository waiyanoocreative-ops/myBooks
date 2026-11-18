const STATIC_CACHE = 'sar-static-v5';
const IMG_CACHE = 'sar-covers-webp-v5';
const PDF_CACHE = 'sar-offline-pdfs-v5';

self.addEventListener('install', () => {
  self.skipWaiting();
});

// Cache အဟောင်းများ (v3, v4) အားလုံးကို အလိုအလျောက် ဖျက်ပစ်မည်
self.addEventListener('activate', (event) => {
  const allowed = [STATIC_CACHE, IMG_CACHE, PDF_CACHE];
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.map((k) => (!allowed.includes(k) ? caches.delete(k) : null)))
    )
  );
  self.clients.claim();
});

function isCoverOrImageRequest(url) {
  return (
    url.includes('wsrv.nl') ||
    url.includes('/covers/') ||
    url.includes('/ads/') ||
    /\.(webp|jpg|jpeg|png|gif|svg|ico)(\?.*)?$/i.test(url)
  );
}

function isPdfRequest(url) {
  return url.includes('/pdfs/') || /\.pdf(\.part\d+)?(\?.*)?$/i.test(url);
}

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = req.url;

  if (url.includes('supabase.co') || url.includes('api.github.com')) return;

  // 1. HTML စာမျက်နှာများ -> Network-First (ကုဒ်ပြင်လိုက်သည်နှင့် ချက်ချင်းအသစ်ပေါ်စေရန်)
  if (req.mode === 'navigate' || url.endsWith('.html') || url.endsWith('/')) {
    event.respondWith(
      fetch(req)
        .then((netRes) => {
          const clone = netRes.clone();
          caches.open(STATIC_CACHE).then((c) => c.put(req, clone));
          return netRes;
        })
        .catch(() => caches.match(req))
    );
    return;
  }

  // 2. မျက်နှာဖုံးပုံများ -> Cache-First (0ms ဖြင့် ချက်ချင်းပွင့်စေရန်)
  if (isCoverOrImageRequest(url)) {
    event.respondWith(
      caches.open(IMG_CACHE).then(async (cache) => {
        const cached = await cache.match(req);
        if (cached) return cached;
        const netRes = await fetch(req);
        if (netRes && (netRes.status === 200 || netRes.type === 'opaque')) {
          cache.put(req, netRes.clone());
        }
        return netRes;
      })
    );
    return;
  }

  // 3. Offline PDF များ
  if (isPdfRequest(url)) {
    event.respondWith(caches.match(req).then((cached) => cached || fetch(req)));
    return;
  }
});
