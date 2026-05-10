var CACHE = 'hub-v3'

self.addEventListener('install', function () { self.skipWaiting() })

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (names) {
      return Promise.all(
        names.filter(function (n) { return n !== CACHE }).map(function (n) { return caches.delete(n) })
      )
    }).then(function () { return self.clients.claim() })
  )
})

self.addEventListener('fetch', function (e) {
  if (e.request.mode === 'navigate') {
    // Network-first for HTML — always get latest on refresh, fall back to cache offline
    e.respondWith(
      fetch(e.request).then(function (res) {
        var clone = res.clone()
        caches.open(CACHE).then(function (c) { c.put(e.request, clone) })
        return res
      }).catch(function () {
        return caches.match(e.request)
      })
    )
  } else {
    e.respondWith(fetch(e.request))
  }
})