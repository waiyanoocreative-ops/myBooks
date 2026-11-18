const STATIC_CACHE = 'sar-static-v4';
const IMG_CACHE = 'sar-covers-webp-v4';
const PDF_CACHE = 'sar-offline-pdfs-v4';

const CORE_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icon.png',
  'https://cdn.tailwindcss.com',
  'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2',
  'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js',
  'https://fonts.googleapis.com/css2?family=Padauk:wght@400;700&family=Playfair+Display:wght@700&display=swap'
];

// 1. INSTALL: အဓိက App ဖိုင်များကို ကြိုတင်သိမ်းဆည်းခြင်း
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) =>
      Promise.allSettled(CORE_ASSETS.map((url) => cache.add(url)))
    )
  );
  self.skipWaiting();
});

// 2. ACTIVATE: Cache အဟောင်းများကို ရှင်းလင်းခြင်း
self.addEventListener('activate', (event) => {
  const allowedCaches = [STATIC_CACHE, IMG_CACHE, PDF_CACHE];
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => (!allowedCaches.includes(key) ? caches.delete(key) : null))
      )
    )
  );
  self.clients.claim();
});

// ಪုံဖိုင် ဟုတ်/မဟုတ် စစ်ဆေးသည့် ဖန်ရှင် (WebP, wsrv.nl, jsDelivr, GitHub Covers)
function isCoverOrImageRequest(url) {
  return (
    url.includes('wsrv.nl') ||
    url.includes('/covers/') ||
    url.includes('/ads/') ||
    /\.(webp|jpg|jpeg|png|gif|svg|ico)(\?.*)?$/i.test(url)
  );
}

// PDF စာအုပ်ဖိုင် ဟုတ်/မဟုတ် စစ်ဆေးသည့် ဖန်ရှင်
function isPdfRequest(url) {
  return url.includes('/pdfs/') || /\.pdf(\.part\d+)?(\?.*)?$/i.test(url);
}

// 3. FETCH: အင်တာနက်နှေးချိန်နှင့် Offline အချိန်တွင် ချက်ချင်းထုတ်ပေးခြင်း
self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = req.url;

  // Supabase API နှင့် GitHub API (Admin Upload) တို့ကို Cache မလုပ်ဘဲ တိုက်ရိုက်သွားစေမည်
  if (url.includes('supabase.co') || url.includes('api.github.com')) {
    return;
  }

  // A. မျက်နှာဖုံးပုံများ (WebP Thumbnails) -> Cache-First (ဖုန်းထဲရှိလျှင် 0ms ဖြင့် ချက်ချင်းပြမည်)
  if (isCoverOrImageRequest(url)) {
    event.respondWith(
      caches.open(IMG_CACHE).then(async (cache) => {
        const cached = await cache.match(req);
        if (cached) return cached;

        try {
          const netRes = await fetch(req);
          if (netRes && (netRes.status === 200 || netRes.type === 'opaque')) {
            cache.put(req, netRes.clone());
          }
          return netRes;
        } catch (err) {
          return cached || new Response('', { status: 404 });
        }
      })
    );
    return;
  }

  // B. PDF စာအုပ်ဖိုင်များ -> Offline သိမ်းထားပါက Cache မှ တိုက်ရိုက်ဖွင့်မည်
  if (isPdfRequest(url)) {
    event.respondWith(
      caches.match(req).then((cached) => {
        if (cached) return cached;
        return fetch(req);
      })
    );
    return;
  }

  // C. HTML နှင့် ကျန်ဖိုင်များ -> Stale-While-Revalidate (ချက်ချင်းပွင့်ပြီး နောက်ကွယ်မှ Update လုပ်မည်)
  event.respondWith(
    caches.open(STATIC_CACHE).then(async (cache) => {
      const cached = await cache.match(req);
      const networkFetch = fetch(req)
        .then((netRes) => {
          if (netRes && netRes.status === 200) {
            cache.put(req, netRes.clone());
          }
          return netRes;
        })
        .catch(() => cached);

      return cached || networkFetch;
    })
  );
});
