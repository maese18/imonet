//const DYNAMIC_CACHE = 'dynamicCache';
// This is the code piece that GenerateSW mode can't provide for us.
// This code listens for the user's confirmation to update the app.
self.addEventListener('message', e => {
  if (!e.data) {
    return;
  }

  switch (e.data) {
    case 'skipWaiting':
      // The ServiceWorkerGlobalScope. skipWaiting() method of the ServiceWorkerGlobalScope
      // forces the waiting service worker to become the active service worker. ... claim()
      // to ensure that updates to the underlying service worker take effect immediately for
      // both the current client and all other active clients
      self.skipWaiting();
      break;
    default:
      // NOOP
      break;
  }
});
self.addEventListener('fetch', e => {
  var request = e.request;
  console.log(`onFetch ${request}`);
  e.respondWith(
    fetch(request)
      .then(function(res) {
        const cacheName = cacheNames.runtime;
        return caches.open(cacheName).then(function(cache) {
          cache.put(request.url, res.clone());
          return res;
        });
      })
      .catch(function(err) {
        return caches.match(request);
      }),
    /* caches.match(event.request).then(response => {
      return response || fetch(event.request);
    }), */
  );
});
workbox.core.clientsClaim(); // Vue CLI 4 and Workbox v4, else
// workbox.clientsClaim(); // Vue CLI 3 and Workbox v3.

// The precaching code provided by Workbox.
self.__precacheManifest = [].concat(self.__precacheManifest || []);
// workbox.precaching.suppressWarnings(); // Only used with Vue CLI 3 and Workbox v3.
workbox.precaching.precacheAndRoute(self.__precacheManifest, {});
