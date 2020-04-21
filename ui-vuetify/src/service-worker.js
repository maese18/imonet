// ---------------------------------------------------------------
// ---------------------------------------------------------------
// Lifecycle

/*
It's actually easy. You can add an event listeners inside your service worker that listens for the install event.
Whenever it fires, send a message via postmessage to your main thread and show a update info to your users.
When users presses ok send another message to the service worker back that triggers a "self.skipWaiting()" and afterwards a location.reload()
*/
self.addEventListener('install', event => {
  console.log('service-worker installed', event);
});

self.addEventListener('fetch', event => {
  // Let the browser do its default thing
  // for non-GET requests.
  if (event.request.method != 'GET') return;

  // Prevent the default, and handle the request ourselves.
  event.respondWith(
    (async function() {
      // Try to get the response from a cache.
      const cache = await caches.open('dynamic-v1');
      const cachedResponse = await cache.match(event.request);

      if (cachedResponse) {
        // If we found a match in the cache, return it, but also
        // update the entry in the cache in the background.
        event.waitUntil(cache.add(event.request));
        return cachedResponse;
      }

      // If we didn't find a match in the cache, use the network.
      return fetch(event.request);
    })(),
  );
});

// This code listens for the user's confirmation to update the app.
self.addEventListener('message', e => {
  console.log('service-worker received message');
  if (!e.data) {
    return;
  }

  switch (e.data) {
    case 'skipWaiting':
      console.log('message was "skipWaiting"');
      self.skipWaiting();
      break;
    default:
      // NOOP
      break;
  }
});

// Listen to Push
self.addEventListener('push', e => {
  let data;
  if (e.data) {
    data = e.data.json();
  }

  const options = {
    body: data.body,
    icon: '/img/icons/android-chrome-192x192.png',
    image: '/img/autumn-forest.png',
    vibrate: [300, 200, 300],
    badge: '/img/icons/plint-badge-96x96.png',
  };

  e.waitUntil(self.registration.showNotification(data.title, options));
});
