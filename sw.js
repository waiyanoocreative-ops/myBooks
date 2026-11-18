// Cache နာမည် (ကုဒ်အသစ်တင်တိုင်း ဒီ Version နံပါတ်ကို v2, v3 စသဖြင့် ပြောင်းပေးရပါမည်)
const CACHE_NAME = 'sar-app-shell-v4';

// App ပွင့်ရန် မရှိမဖြစ် လိုအပ်သောဖိုင်များ
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon.png'
];

// 1. Install Event (App ကို ဖုန်းထဲသွင်းချိန်တွင် အလုပ်လုပ်သည်)
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  // Service Worker အသစ်ကို ချက်ချင်း အသက်ဝင်စေသည်
  self.skipWaiting();
});

// 2. Activate Event (App အဟောင်းများကို ရှင်းလင်းသည်)
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          // မှတ်ချက် - User များ Offline သိမ်းထားသော 'sar-offline-pdfs' ကို မဖျက်မိစေရန် ကာကွယ်ထားပါသည်
          if (key !== CACHE_NAME && key.startsWith('sar-app-shell')) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// 3. Fetch Event (အင်တာနက်မရှိချိန် အော့ဖ်လိုင်း ဖွင့်နိုင်ရန်)
self.addEventListener('fetch', (event) => {
  // Supabase Database သို့ လှမ်းသော POST, UPDATE များကို မသိမ်းပါ
  if (event.request.method !== 'GET') return;

  // 🔴 အလွန်အရေးကြီးသည်! (PDF Byte-Streaming ပြတ်တောက်ခြင်းမှ ကာကွယ်ရန်)
  // Range Request များကို Service Worker က ကြားဖြတ်မယူဘဲ ဆာဗာမှ တိုက်ရိုက် ဆွဲယူခွင့်ပြုပါသည်
  if (event.request.headers.has('range')) return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // အင်တာနက်ရနေချိန်တွင် ဖိုင်အသစ်များကို နောက်ကွယ်မှ Cache ထဲသို့ အမြဲ Update လုပ်ပေးမည်
        if (response && response.status === 200 && response.type === 'basic') {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        // အင်တာနက် ပြတ်တောက်သွားပါက သိမ်းထားသော ဖိုင်များကို ဖွင့်ပေးမည်
        return caches.match(event.request);
      })
  );
});
