const CACHE_NAME = 'bioscan-v1.4.4'; // ⚠️ UBAH NAMA VERSI INI SETIAP KALI ANDA MENGEDIT HTML!
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './piket.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  'https://cdn.tailwindcss.com',
  'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/dist/face-api.js'
];

// Install Event
self.addEventListener('install', (event) => {
  self.skipWaiting(); // Memaksa SW versi baru untuk langsung mengusir versi lama
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return Promise.allSettled(
        ASSETS_TO_CACHE.map(url => cache.add(url))
      );
    })
  );
});

// Activate Event - Membersihkan cache lama
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    }).then(() => self.clients.claim()) // Langsung mengontrol halaman tanpa perlu refresh manual
  );
});

// Fetch Event - NETWORK FIRST untuk HTML, CACHE FIRST untuk file lain
self.addEventListener('fetch', (event) => {
  // Jika yang direquest adalah halaman HTML (seperti index.html atau piket.html)
  if (event.request.mode === 'navigate' || (event.request.headers.get('accept') && event.request.headers.get('accept').includes('text/html'))) {
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          // Sukses ambil dari internet (GitHub) -> Simpan ke Cache lalu tampilkan
          return caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, networkResponse.clone());
            return networkResponse;
          });
        })
        .catch(() => {
          // Jika offline/tidak ada internet -> Ambil dari Cache
          return caches.match(event.request);
        })
    );
  } else {
    // Untuk file gambar, script, atau aset statis lain, gunakan Cache-First
    event.respondWith(
      caches.match(event.request).then((response) => {
        return response || fetch(event.request);
      })
    );
  }
});
