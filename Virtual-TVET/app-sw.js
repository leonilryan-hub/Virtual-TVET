/* Virtual TVET Campus - app service worker (install as phone app).
   Keeps a copy of the campus "shell" so it opens fast, and still opens when the signal is weak.
   Always tries the internet first, so updates on GitHub show up right away.
   It never stores CBLMs, simulators, certificates or anything from the Google Sheet. */
const CACHE = 'vtvet-app-v1';
const SHELL = ['./', './index.html', './config.js', './catalog.js', './assessment-bank.js', './trb.js', './qr.js',
  './manifest.webmanifest', './icon-192.png', './icon-512.png', './icon-180.png'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => Promise.all(SHELL.map(u => c.add(new Request(u, { cache: 'reload' })).catch(() => {})))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k.indexOf('vtvet-app-') === 0 && k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return;                       // Google Sheet, fonts, etc.: untouched
  const base = new URL('./', self.registration.scope).pathname;
  let rel = url.pathname.indexOf(base) === 0 ? url.pathname.slice(base.length) : null;
  if (rel === null) return;
  if (rel === '') rel = 'index.html';
  const key = './' + rel;
  if (SHELL.indexOf(key) < 0) return;                                 // only the campus shell, nothing else
  e.respondWith(fetch(req).then(res => {
    if (res && res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(key, copy)); }
    return res;
  }).catch(() => caches.match(key, { ignoreSearch: true }).then(r => r || (rel === 'index.html' ? caches.match('./') : null)).then(r => r || Response.error())));
});
