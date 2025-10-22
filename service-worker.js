// service-worker.js
const CACHE_NAME = 'campus-marketplace-v2'; // Updated version name
const urlsToCache = [
  '/',
  'index.html',
  'login.html',
  'post-item.html',
  'item-details.html',
  'chat.html',
  'complete-profile.html',
  'style.css',
  'js/firebase-config.js',
  'js/auth.js',
  'js/index.js',
  'js/post-item.js',
  'js/item-details.js',
  'js/chat.js',
  'js/complete-profile.js',
  'js/categories.js',
  'js/app.js',
  '/assets/icon-512x512.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        return fetch(event.request);
      })
  );
});