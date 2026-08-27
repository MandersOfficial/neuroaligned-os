// Minimal service worker enabling registration.showNotification for web
// notifications. It intentionally intercepts no network requests, so it never
// affects app routing, auth token handling, or the platform's request flow.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()));
