const CACHE_NAME = 'bioscan-v1.4.2';
const ASSETS_TO_CACHE = [
  './index.html',
  './manifest.json',
  // Sebaiknya download dulu icon-icon ini agar pasti ada
  './icons/icon-192.png',
  './icons/icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // Menggunakan fetch satu per satu agar jika gagal tidak membatalkan semua
      return Promise.allSettled(
        ASSETS_TO_CACHE.map(url => cache.add(url))
      );
    })
  );
});
