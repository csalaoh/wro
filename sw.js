// Matek-kaland service worker. Új kiadásnál a VERSION változik, így a régi gyorsítótár törlődik.
const VERSION = 'mk-dc0eb9f3';
const CORE = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png', './maskable-512.png', './apple-touch-icon.png', './img-6786e9fadd.webp', './img-17a5775f20.webp', './img-6a1d02971e.webp', './img-b5819318d4.webp', './img-3aa1fe3696.webp', './img-762275f823.webp', './img-1894775d52.webp', './img-4e53a562e9.webp', './img-ee2a0647ed.webp', './img-7d75c75582.webp', './img-909e5ddc4e.webp', './img-86cbc207c2.webp', './img-9cc883cace.webp', './img-98ac8194bf.webp', './img-565c7460f5.webp', './img-5b29cc0e90.webp'];
self.addEventListener('install', e => { e.waitUntil(caches.open(VERSION).then(c => c.addAll(CORE)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const req = e.request; if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (req.mode === 'navigate') {   // oldal: hálózat előbb (friss verzió), offline a mentett
    e.respondWith(fetch(req).then(r => { const c = r.clone(); caches.open(VERSION).then(x => x.put('./index.html', c)); return r; })
      .catch(() => caches.match('./index.html')));
    return;
  }
  if (url.origin === location.origin || /fonts\.(googleapis|gstatic)\.com$/.test(url.hostname)) {  // ikon, betűtípus: gyorsítótár előbb
    e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(r => { const c = r.clone(); caches.open(VERSION).then(x => x.put(req, c)); return r; })));
  }
});
