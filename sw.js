/**
 * E.V.A. PRO Service Worker — Offline-First Engine
 * DGZ Engineering Lab © 2026
 * 
 * Enables complete offline functionality for field deployment
 * where internet connectivity is unreliable.
 */

const CACHE_NAME = 'eva-pro-v3.3.0-final';
const ASSETS_TO_CACHE = [
    './',
    './index.html',
    './app.html',
    './manifest.json',
    './version.json',
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
    './js/theme-switcher.js',
    './js/vendor/lucide.min.js',
    './js/vendor/chart.min.js',
    './js/vendor/chartjs-plugin-datalabels.min.js',
    './js/vendor/jspdf.umd.min.js',
    './js/vendor/html2canvas.min.js',
    './js/vendor/xlsx.full.min.js'
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

    // Network-first for external CDNs and Images
    if (url.origin !== location.origin) {
        event.respondWith(
            fetch(event.request)
                .then((response) => {
                    // Only cache valid responses or opaque responses safely
                    if (!response || (response.status !== 200 && response.type !== 'opaque')) {
                        return response;
                    }
                    const clone = response.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        // Avoid caching if request method is not GET or protocol isn't http(s)
                        if (event.request.method === 'GET' && url.protocol.startsWith('http')) {
                            cache.put(event.request, clone).catch(err => console.warn('Cache error for external resource:', err));
                        }
                    });
                    return response;
                })
                .catch((err) => {
                    console.warn('[E.V.A. SW] Network error for external resource:', event.request.url);
                    return caches.match(event.request).then(cached => {
                        if (cached) return cached;
                        // Return empty generic response to prevent "Failed to convert value to 'Response'" TypeError
                        return new Response('', { status: 404, statusText: 'Not Found Offline' });
                    });
                })
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
