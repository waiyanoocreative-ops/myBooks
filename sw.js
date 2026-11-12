const CACHE_NAME = 'sa-library-pwa-v3';
const STATE_CACHE = 'sa-library-sw-state-v1';
const ASSETS = [
  './',
  './index.html',
  './manifest.json'
];

const SUPABASE_URL = 'https://ksgxlvrojzawvkkvsbyi.supabase.co';
const SUPABASE_KEY = 'sb_publishable_BcZTWsRcRYEJ_dtSAg1VnA_VWNE9FSg';

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k !== CACHE_NAME && k !== STATE_CACHE)
          .map((k) => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

// Network-First Fetch Strategy
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    fetch(event.request)
      .then((res) => {
        const copy = res.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        return res;
      })
      .catch(() => caches.match(event.request))
  );
});

// ================= BACKGROUND STATE HELPERS =================
async function getLastNotifiedBookId() {
  const cache = await caches.open(STATE_CACHE);
  const res = await cache.match('/__last_book_id');
  if (!res) return null;
  return await res.text();
}

async function setLastNotifiedBookId(bookId) {
  if (!bookId) return;
  const cache = await caches.open(STATE_CACHE);
  await cache.put('/__last_book_id', new Response(String(bookId)));
}

// ================= SHOW NATIVE PHONE NOTIFICATION BAR ALERT =================
async function showBookOsNotification(book) {
  const title = `📚 စာ — စာအုပ်အသစ် ရောက်ရှိပါပြီ!`;
  const options = {
    body: `📖 "${book.title}" (✍️ ${book.author || 'စာရေးဆရာ'}) ကို ယခု ဖတ်ရှုနိုင်ပါပြီ။`,
    icon: book.cover_url || './manifest.json',
    badge: book.cover_url || './manifest.json',
    image: book.cover_url || undefined,
    vibrate: [200, 100, 200],
    tag: 'new-book-' + (book.id || Date.now()),
    renotify: true,
    data: {
      url: `./index.html?book=${book.id || ''}`,
      bookId: book.id
    },
    actions: [
      { action: 'read', title: '📖 ယခုဖတ်မည်' },
      { action: 'close', title: 'ပိတ်မည်' }
    ]
  };

  return self.registration.showNotification(title, options);
}

// ================= CHECK SUPABASE IN BACKGROUND FOR NEW BOOKS =================
async function checkSupabaseForNewBookInBackground() {
  try {
    const apiUrl = `${SUPABASE_URL}/rest/v1/books?select=id,title,author,cover_url,status&status=eq.published&order=created_at.desc&limit=1`;
    const res = await fetch(apiUrl, {
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`
      }
    });
    if (!res.ok) return;
    const data = await res.json();
    if (!data || data.length === 0) return;

    const newestBook = data[0];
    const lastId = await getLastNotifiedBookId();

    if (!lastId) {
      await setLastNotifiedBookId(newestBook.id);
      return;
    }

    if (lastId !== String(newestBook.id)) {
      await setLastNotifiedBookId(newestBook.id);
      await showBookOsNotification(newestBook);
    }
  } catch (err) {
    // Ignore offline errors silently
  }
}

// 1. Listen for Periodic Background Sync (When App is Closed on Android PWA)
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'check-new-books') {
    event.waitUntil(checkSupabaseForNewBookInBackground());
  }
});

// 2. Listen for One-Off Background Sync
self.addEventListener('sync', (event) => {
  if (event.tag === 'check-new-books') {
    event.waitUntil(checkSupabaseForNewBookInBackground());
  }
});

// 3. Listen for Standard Web Push Payload
self.addEventListener('push', (event) => {
  if (event.data) {
    try {
      const payload = event.data.json();
      event.waitUntil(showBookOsNotification(payload));
      return;
    } catch (e) {}
  }
  event.waitUntil(checkSupabaseForNewBookInBackground());
});

// 4. Listen for Direct Messages from index.html
self.addEventListener('message', (event) => {
  if (!event.data) return;

  if (event.data.type === 'INIT_LAST_BOOK_ID' && event.data.bookId) {
    event.waitUntil(setLastNotifiedBookId(event.data.bookId));
  }

  if (event.data.type === 'SHOW_OS_NOTIFICATION' && event.data.book) {
    event.waitUntil(
      setLastNotifiedBookId(event.data.book.id).then(() =>
        showBookOsNotification(event.data.book)
      )
    );
  }

  if (event.data.type === 'CHECK_NEW_BOOKS_NOW') {
    event.waitUntil(checkSupabaseForNewBookInBackground());
  }
});

// 5. Handle User Tapping the Notification in Phone Notification Bar
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  if (event.action === 'close') return;

  const targetUrl = event.notification.data?.url || './index.html';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (const client of windowClients) {
        if ('focus' in client) {
          client.navigate(targetUrl);
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
