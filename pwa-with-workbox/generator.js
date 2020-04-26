// Run node generator.js
const workbox = require("workbox-build");

workbox.generateSW({
  cacheId: "pwa-example", //global name
  globDirectory: "./",
  globPatterns: ["**/*.{css,js,html}"],
  globIgnores: [
    "**/generator.js",
    "**/sw.js",
    "**/server.js",
    "node_modules/**/*",
  ],
  swDest: "./src/sw.js",
  runtimeCaching: [
    {
      urlPattern: /\.(?:html|htm|xml)$/,
      handler: "StaleWhileRevalidate",
      options: {
        cacheName: "markup",
        expiration: {
          maxAgeSeconds: 1800,
        },
      },
    },
  ],
});
