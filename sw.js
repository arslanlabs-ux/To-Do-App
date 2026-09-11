const CACHE = 'todo-v1';
const SHELL = [
    './',
    'index.html',
    'style.css',
    'tasks.js',
    'script.js',
    'manifest.webmanifest',
    'Assets/icons/icon.svg',
    'Assets/icons/icon-192.png',
    'Assets/icons/icon-512.png',
];

self.addEventListener('install', (e) => {
    e.waitUntil(
        caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', (e) => {
    e.waitUntil(
        caches.keys()
            .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
            .then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', (e) => {
    const { request } = e;
    if (request.method !== 'GET') return;

    // Pages: network-first so updates land when online, cached shell when offline.
    if (request.mode === 'navigate') {
        e.respondWith(
            fetch(request)
                .then((res) => {
                    const copy = res.clone();
                    caches.open(CACHE).then((c) => c.put('index.html', copy));
                    return res;
                })
                .catch(() => caches.match('index.html'))
        );
        return;
    }

    // Same-origin assets: cache-first, fill cache on first fetch.
    if (new URL(request.url).origin !== location.origin) return;
    e.respondWith(
        caches.match(request).then(
            (hit) =>
                hit ||
                fetch(request).then((res) => {
                    if (res.ok) {
                        const copy = res.clone();
                        caches.open(CACHE).then((c) => c.put(request, copy));
                    }
                    return res;
                })
        )
    );
});
