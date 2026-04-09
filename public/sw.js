// Service Worker minimal para permitir la instalación (PWA)
const CACHE_NAME = 'dobell-v1';

self.addEventListener('install', (e) => {
  // El service worker se instala inmediatamente
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  // Toma el control de las pestañas abiertas
  e.waitUntil(clients.claim());
});

self.addEventListener('fetch', (e) => {
  // Estrategia: Network first con fallback a fetch (no estamos haciendo offline real aún, solo cumpliendo requisitos PWA)
  e.respondWith(fetch(e.request).catch(() => fetch(e.request)));
});
