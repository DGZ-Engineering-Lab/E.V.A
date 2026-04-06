/**
 * E.V.A. PRO Service Worker — Offline-First Engine
 * DGZ Engineering Lab © 2026
 * 
 * Enables complete offline functionality for field deployment
 * where internet connectivity is unreliable.
 */

const CACHE_NAME = 'eva-pro-v3.4.0-enhancements';
const ASSETS_TO_CACHE = [
    './',
    './index.html',
    './app.html',
    './manifest.json',
    './version.json', // Añadido para seguimiento de red
    './assets/logo.png',
    './css/themes/dark.css',
    './css/themes/light.css',
    './css/themes/zenith.css',
    './css/themes/forest.css',
    './css/themes/minimal.css',
    './css/eva-styles-v3.css',
    './css/eva-enhancements.css',
    './js/avaluo_db.js',
    './js/eva-core-v3.js',
    './js/eva-enhancements.js',
    './js/theme-switcher.js'
];


// Install: Cache all critical assets
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('[E.V.A. SW] Caching critical assets...');
            return cache.addAll(ASSETS_TO_CACHE);
        })
    );
    self.skipWaiting();
});

// Activate: Clean old caches and claim clients
self.addEventListener('activate', (event) => {
    event.waitUntil(
        Promise.all([
            caches.keys().then((cacheNames) => {
                return Promise.all(
                    cacheNames
                        .filter((name) => name !== CACHE_NAME)
                        .map((name) => caches.delete(name))
                );
            }),
            self.clients.claim()
        ])
    );
});

// Message Listener for explicit SKIP_WAITING
self.addEventListener('message', (event) => {
    if (event.data === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});

// Fetch Strategy: Stale-while-revalidate for flexibility
self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);
    
    // Always Network-first for version.json to detect updates
    if (url.pathname.endsWith('version.json')) {
        event.respondWith(fetch(event.request).catch(() => caches.match(event.request)));
        return;
    }

    // Network-first for external CDNs
    if (url.origin !== location.origin) {
        event.respondWith(
            fetch(event.request)
                .then((response) => {
                    const clone = response.clone();
                    caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
                    return response;
                })
                .catch(() => caches.match(event.request))
        );
        return;
    }

    // Cache-first for local assets (handled by Version Polling in UI)
    event.respondWith(
        caches.match(event.request).then((cached) => {
            return cached || fetch(event.request).then((response) => {
                const clone = response.clone();
                caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
                return response;
            });
        })
    );
});
