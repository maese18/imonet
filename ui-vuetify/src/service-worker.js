// Custom service worker
// https://developers.google.com/web/tools/workbox/modules/workbox-sw#avoid_async_imports
const { registerRoute } = workbox.routing;
const { CacheFirst } = workbox.strategies;
const { CacheableResponse } = workbox.cacheableResponse;

function subscribeUserToPush() {
  return navigator.serviceWorker
    .register('/service-worker.js')
    .then(registration => {
      const subscribeOptions = {
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array('BFeD5yPAsk5ife9147C9vI6ENZAZeFJtXVg6UUq7lXJSlJvT2-rPcWvlUlJK45ctcNW80Y23F0_0a6g6RPubTKE'),
      };

      return registration.pushManager.subscribe(subscribeOptions);
    })
    .then(pushSubscription => {
      console.log('Received PushSubscription: ', JSON.stringify(pushSubscription));
      return pushSubscription;
    });
}

if (workbox) {
  console.log('configure workbox routes');
  //subscribeUserToPush();
  // adjust log level for displaying workbox logs
  //workbox.core.setLogLevel(workbox.core.LOG_LEVELS.debug);

  // apply precaching. In the built version, the precacheManifest will
  // be imported using importScripts (as is workbox itself) and we can
  // precache this. This is all we need for precaching
  workbox.precaching.precacheAndRoute(self.__precacheManifest);

  // Make sure to return a specific response for all navigation requests.
  // Since we have a SPA here, this should be index.html always.
  // https://stackoverflow.com/questions/49963982/vue-router-history-mode-with-pwa-in-offline-mode
  workbox.routing.registerNavigationRoute('/index.html');

  // The following routes need explicit caching as registerNavigationRoute would avoid loading those resources
  // https://api.adivo.ch
  /*workbox.routing.registerRoute(
    /^https:\/\/api\.adivo\.ch/,
    new workbox.strategies.NetworkFirst({
      cacheName: 'api',
    }),
  );
*/
  // https://adivo.ch/img
  registerRoute(
    new RegExp('/img/'),
    new workbox.strategies.CacheFirst({
      cacheName: 'images',
    }),
  );
  // media
  // In your service worker:
  // It's up to you to either precache or explicitly call cache.add('movie.mp4')
  // to populate the cache.
  //
  // This route will go against the network if there isn't a cache match,
  // but it won't populate the cache at runtime.
  // If there is a cache match, then it will properly serve partial responses.
  /* workbox.routing.registerRoute(
    /.*\.mp4/,
    new workbox.strategies.CacheFirst({
      cacheName: 'mm-cache',
      plugins: [new workbox.cacheableResponse.CacheableResponsePlugin({ statuses: [200] }), new RangeRequestsPlugin()],
    }),
  );*/
  /*
  // In your service worker:
  // It's up to you to either precache or explicitly call cache.add('movie.mp4')
  // to populate the cache.
  //
  // This route will go against the network if there isn't a cache match,
  // but it won't populate the cache at runtime.
  // If there is a cache match, then it will properly serve partial responses.
  registerRoute(
    /.*\.mp4/,
    new CacheFirst({
      cacheName: 'your-cache-name-here',
      plugins: [
        new CacheableResponsePlugin({statuses: [200]}),
        new RangeRequestsPlugin(),
      ],
    }),
  );*/

  workbox.routing.registerRoute(
    '/img/',
    new workbox.strategies.CacheFirst({
      cacheName: 'img',
    }),
  );

  // eg. https://randomuser.me/api/portraits/men/81.jpg
  workbox.routing.registerRoute(
    /^https:\/\/randomuser\.me/,
    new workbox.strategies.CacheFirst({
      cacheName: 'randomuser',
    }),
  );

  // https://cdn.vuetifyjs.com/images/lists/2.jpg
  workbox.routing.registerRoute(
    /^https:\/\/cdn\.vuetifyjs\.com/,
    new workbox.strategies.CacheFirst({
      cacheName: 'vuetifyjs',
    }),
  );

  // eg. https://cdn.jsdelivr.net/npm/@mdi/font@latest/css/materialdesignicons.min.css
  // Setup cache strategy for Material Design Icons.
  workbox.routing.registerRoute(
    /^https:\/\/cdn\.jsdelivr\.net/,
    new workbox.strategies.CacheFirst({
      cacheName: 'mdi-icons',
    }),
  );

  // Setup cache strategy for Google Fonts. They consist of two parts, a static one
  // coming from fonts.gstatic.com (strategy CacheFirst) and a more ferquently updated on
  // from fonts.googleapis.com. Hence, split in two registerroutes
  workbox.routing.registerRoute(
    /^https:\/\/fonts\.googleapis\.com/,
    new workbox.strategies.StaleWhileRevalidate({
      cacheName: 'google-fonts-stylesheets',
    }),
  );

  workbox.routing.registerRoute(
    /^https:\/\/fonts\.gstatic\.com/,
    new workbox.strategies.CacheFirst({
      cacheName: 'google-fonts-webfonts',
      plugins: [
        new workbox.cacheableResponse.Plugin({
          statuses: [0, 200],
        }),
        new workbox.expiration.Plugin({
          maxAgeSeconds: 60 * 60 * 24 * 365,
          maxEntries: 30,
        }),
      ],
    }),
  );

  workbox.routing.registerRoute(
    /^https:\/\/stackpath\.bootstrapcdn\.com/,
    new workbox.strategies.StaleWhileRevalidate({
      cacheName: 'fontawesome',
    }),
  );
}
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

// Fetch interceptor to make sure dynamic content is cached
/*
self.addEventListener('fetch', event => {
  console.log('onFetch');
  event.respondWith(
    caches.match(event.request).catch(() => {
      return fetch(event.request).then(response => {
        return caches.open('v1').then(cache => {
          cache.put(event.request, response.clone());
          return response;
        });
      });
    }),
  ); 
*/
self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.open('dynamiccache').then(function(cache) {
      return fetch(event.request).then(function(res) {
        cache.put(event.request, res.clone());
        return res;
      });
    }),
  );
});
/*
self.addEventListener('fetch', function(event) {
  console.log('onFetch 2');
  event.respondWith(
    caches.open('imonet-dynamic').then(function(cache) {
      return cache.match(event.request).then(function(response) {
        return (
          response ||
          fetch(event.request).then(function(response) {
            console.log('cache request ', event.request);
            cache.put(event.request, response.clone());

            return response;
          })
        );
      });
    }),
  );
});
*/
/* e.respondWith(
    fetch(request)
      .then(function(res) {
        const cacheName = cacheNames.runtime;
        console.log('Resource loaded from network, store to cache named ' + cacheName);
        return caches.open(cacheName).then(function(cache) {
          cache.put(request.url, res.clone());
          return res;
        });
      })
      .catch(function(err) {
        console.log('Failed to fetch from network, Fallback to cache');
        return caches.match(request);
      }), */
/* caches.match(event.request).then(response => {
      return response || fetch(event.request);
    }),
  );*/
//});

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
