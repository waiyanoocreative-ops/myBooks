const STATIC_CACHE = 'sar-static-v6';
const IMG_CACHE = 'sar-covers-webp-v6';
const PDF_CACHE = 'sar-offline-pdfs-v6';

self.addEventListener('install', () => {
  self.skipWaiting();
});

// ယခင် Cache အဟောင်းအားလုံးကို အလိုအလျောက် ရှင်းလင်းမည်
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

  // HTML ဖိုင်များကို အမြဲတမ်း အသစ်အရင်ဆွဲယူမည် (Network-First)
  if (req.mode === 'navigate' || url.endsWith('.html') || url.endsWith('/')) {
    event.respondWith(
      fetch(req, { cache: 'no-store' })
        .then((netRes) => {
          const clone = netRes.clone();
          caches.open(STATIC_CACHE).then((c) => c.put(req, clone));
          return netRes;
        })
        .catch(() => caches.match(req))
    );
    return;
  }

  // မျက်နှာဖုံးပုံများ (WebP) -> Cache-First (0ms ဖြင့် ချက်ချင်းပွင့်မည်)
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

  // Offline PDF များ
  if (isPdfRequest(url)) {
    event.respondWith(caches.match(req).then((cached) => cached || fetch(req)));
    return;
  }
});
