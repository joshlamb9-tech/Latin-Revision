'use strict';

const CACHE_NAME = 'ce-latin-v4';

// All assets to precache — enumerate EVERY file the site needs to work offline
const PRECACHE_ASSETS = [
  './',
  './index.html',
  './vocabulary.html',
  './grammar.html',
  './quiz.html',
  './papers.html',
  './css/style.css',
  './js/app.js',
  './js/grammar.js',
  './js/vocabulary.js',
  './js/srs.js',
  './js/exercises.js',
  './word-groups.html',
  './data/vocabulary/all.json',
  './data/vocabulary/word-groups.json',
  './data/grammar/nouns.json',
  './data/grammar/verbs.json',
  './manifest.webmanifest',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

// Install: cache all assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(PRECACHE_ASSETS))
      .then(() => self.skipWaiting())
  );
});

// Activate: delete OLD ce-latin- caches only (never touch other sites' caches)
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys
          .filter(key => key.startsWith('ce-latin-') && key !== CACHE_NAME)
          .map(key => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

// Fetch: cache-first strategy
self.addEventListener('fetch', event => {
  // Only handle same-origin requests
  if (!event.request.url.startsWith(self.location.origin)) return;

  event.respondWith(
    caches.match(event.request)
      .then(cached => {
        if (cached) return cached;
        return fetch(event.request)
          .then(response => {
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            const toCache = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(event.request, toCache));
            return response;
          });
      })
  );
});
