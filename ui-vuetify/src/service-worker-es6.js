// yarn add workbox-routing workbox-strategies workbox-expiration
import { registerRoute } from 'workbox-routing/registerRoute.mjs';
import { CacheFirst } from 'workbox-strategies/CacheFirst.mjs';
import { ExpirationPlugin } from 'workbox-expiration/ExpirationPlugin.mjs';
import {precacheAndRoute} from 'workbox-precaching';

// Custom service worker
// https://developers.google.com/web/tools/workbox/modules/workbox-sw#avoid_async_imports
//const { registerRoute } = workbox.routing;

/*
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
*/
if (workbox) {
  console.log('configure workbox routes');
  //subscribeUserToPush();

  // apply precaching. In the built version, the precacheManifest will
  // be imported using importScripts (as is workbox itself) and we can
  // precache this. This is all we need for precaching
  //workbox.precaching.precacheAndRoute(self.__precacheManifest);
  precacheAndRoute(self.__precacheManifest);

  // Make sure to return a specific response for all navigation requests.
  // Since we have a SPA here, this should be index.html always.
  // https://stackoverflow.com/questions/49963982/vue-router-history-mode-with-pwa-in-offline-mode
  //workbox.routing.registerNavigationRoute('/index.html');
  registerNavigationRoute('/index.html');

  // The following routes need explicit caching as registerNavigationRoute would avoid loading those resources

  // https://adivo.ch/img
  registerRoute(
    new RegExp('/img/'),
    new strategies.CacheFirst({
    //new workbox.strategies.CacheFirst({
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

  //workbox.routing.registerRoute(
  registerRoute(
    '/img/',
    new strategies.CacheFirst({
      cacheName: 'img',
    }),
  );

  // eg. https://randomuser.me/api/portraits/men/81.jpg
  registerRoute(
    /^https:\/\/randomuser\.me/,
    new strategies.CacheFirst({
      cacheName: 'randomuser',
    }),
  registerRoute(
    /^https:\/\/randomuser\.me/,
    new strategies.cacheFirst({
      cacheName: 'randomuser_alt',
    }),
  );

  // https://cdn.vuetifyjs.com/images/lists/2.jpg
  registerRoute(
    /^https:\/\/cdn\.vuetifyjs\.com/,
    new strategies.CacheFirst({
      cacheName: 'vuetifyjs',
    }),
  );

  // eg. https://cdn.jsdelivr.net/npm/@mdi/font@latest/css/materialdesignicons.min.css
  // Setup cache strategy for Material Design Icons.
  registerRoute(
    /^https:\/\/cdn\.jsdelivr\.net/,
    new strategies.CacheFirst({
      cacheName: 'mdi-icons',
    }),
  );

  // Setup cache strategy for Google Fonts. They consist of two parts, a static one
  // coming from fonts.gstatic.com (strategy CacheFirst) and a more ferquently updated on
  // from fonts.googleapis.com. Hence, split in two registerroutes
  registerRoute(
    /^https:\/\/fonts\.googleapis\.com/,
    new strategies.StaleWhileRevalidate({
      cacheName: 'google-fonts-stylesheets',
    }),
  );
registerRoute(
    /^https:\/\/fonts\.gstatic\.com/,
    new strategies.CacheFirst({
      cacheName: 'google-fonts-webfonts',
      plugins: [
        new cacheableResponse.Plugin({
          statuses: [0, 200],
        }),
        new workbox.expiration.Plugin({
          maxAgeSeconds: 60 * 60 * 24 * 365,
          maxEntries: 30,
        }),
      ],
    }),
  );
registerRoute(
    /^https:\/\/stackpath\.bootstrapcdn\.com/,
    new strategies.StaleWhileRevalidate({
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
// different approach: cache in app and just intercept requests here
self.addEventListener('fetch', function(event) {
  console.log('onFetch');
  event.respondWith(
    caches.open('imonet-api').then(function(cache) {
      console.log('cache imonet-api opened');
      return cache.match(event.request).then(function(response) {
        return (
          response ||
          fetch(event.request).then(function(response) {
            console.log('executed network request and cache request');
            cache.put(event.request, response.clone());
            return response;
          })
        );
      });
    }),
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
