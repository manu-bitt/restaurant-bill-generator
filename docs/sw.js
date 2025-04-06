const CACHE_NAME = 'restaurant-bill-generator-v3';
const urlsToCache = [
  './',
  './index.html',
  './styles.css',
  './script.js',
  './menuItems.js',
  './manifest.json',
  './favicon.ico',
  './logo192.png',
  './logo512.png',
  'https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap',
  'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js'
];

// On install, force skip waiting to activate immediately
self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache opened');
        return cache.addAll(urlsToCache);
      })
  );
});

// Activate event - delete ALL old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          return caches.delete(cacheName);
        })
      ).then(() => {
        return caches.open(CACHE_NAME).then(cache => {
          return cache.addAll(urlsToCache);
        });
      });
    }).then(() => {
      return self.clients.claim();
    })
  );
});

// Fetch event - always try network first, then cache
self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request).catch(() => {
      return caches.match(event.request);
    })
  );
}); 