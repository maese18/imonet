/* importScripts(
  "https://storage.googleapis.com/workbox-cdn/releases/5.1.2/workbox-sw.js"
); */
importScripts(
  "https://storage.googleapis.com/workbox-cdn/releases/3.5.0/workbox-sw.js"
);
if (workbox) {
  console.log(`Yay! Workbox is loaded 🎉`);
  workbox.setConfig({ debug: true });
  workbox.precaching.precacheAndRoute([]);

  workbox.routing.registerRoute(
    /\.(?:css|js)$/, // all css and js files
    new workbox.strategies.StaleWhileRevalidate({
      // always load from network and store in cache and only if we do not have a network connection, fallback to the cached version
      cacheName: "assets",
      plugins: [
        new workbox.expiration.Plugin({
          maxEntries: 60,
          maxAgeSeconds: 30 * 24 * 60 * 60, // 30 Days
        }),
      ],
    })
  );

  workbox.routing.registerRoute(
    /\.(?:png|jpg|gif)$/, // images
    new workbox.strategies.CacheFirst({
      // always load from network and store in cache and only if we do not have a network connection, fallback to the cached version
      cacheName: "images",
      plugins: [
        new workbox.expiration.Plugin({
          maxEntries: 50, // maximal items to cache
          maxAgeSeconds: 30 * 24 * 60 * 60, // 30 Days
        }),
      ],
    })
  );
} else {
  console.log(`Boo! Workbox didn't load 😬`);
}
