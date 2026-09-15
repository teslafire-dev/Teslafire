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
  // Solo interceptamos para que la PWA sea válida. 
  // Pasamos la petición directamente a la red sin reintentos erróneos.
  e.respondWith(fetch(e.request));
});
