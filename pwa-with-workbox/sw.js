if (!self.define) {
  const e = (e) => {
      "require" !== e && (e += ".js");
      let r = Promise.resolve();
      return (
        s[e] ||
          (r = new Promise(async (r) => {
            if ("document" in self) {
              const s = document.createElement("script");
              (s.src = e), document.head.appendChild(s), (s.onload = r);
            } else importScripts(e), r();
          })),
        r.then(() => {
          if (!s[e]) throw new Error(`Module ${e} didn’t register its module`);
          return s[e];
        })
      );
    },
    r = (r, s) => {
      Promise.all(r.map(e)).then((e) => s(1 === e.length ? e[0] : e));
    },
    s = { require: Promise.resolve(r) };
  self.define = (r, i, d) => {
    s[r] ||
      (s[r] = Promise.resolve().then(() => {
        let s = {};
        const o = { uri: location.origin + r.slice(1) };
        return Promise.all(
          i.map((r) => {
            switch (r) {
              case "exports":
                return s;
              case "module":
                return o;
              default:
                return e(r);
            }
          })
        ).then((e) => {
          const r = d(...e);
          return s.default || (s.default = r), s;
        });
      }));
  };
}
define("./sw.js", ["./workbox-3302fb34"], function (e) {
  "use strict";
  e.setCacheNameDetails({ prefix: "pwa-example" }),
    self.addEventListener("message", (e) => {
      e.data && "SKIP_WAITING" === e.data.type && self.skipWaiting();
    }),
    e.precacheAndRoute(
      [
        {
          url: "build/index.html",
          revision: "6c7d7bf24a13b404b14663f8194926e5",
        },
        {
          url: "build/scripts.js",
          revision: "539e5357d13fbdd96ba54d4ce9788127",
        },
        {
          url: "build/styles.css",
          revision: "9e1e41bf2d3db23d8333dc3bcddb2d80",
        },
        {
          url: "build/workbox-config.js",
          revision: "9841155e84ba98ed42444c766a05d8e2",
        },
        { url: "src/index.html", revision: "6c7d7bf24a13b404b14663f8194926e5" },
        { url: "src/scripts.js", revision: "539e5357d13fbdd96ba54d4ce9788127" },
        { url: "src/styles.css", revision: "9e1e41bf2d3db23d8333dc3bcddb2d80" },
        {
          url: "src/workbox-config.js",
          revision: "9841155e84ba98ed42444c766a05d8e2",
        },
      ],
      {}
    ),
    e.registerRoute(
      /\.(?:html|htm|xml)$/,
      new e.StaleWhileRevalidate({
        cacheName: "markup",
        plugins: [
          new e.ExpirationPlugin({
            maxAgeSeconds: 1800,
            purgeOnQuotaError: !0,
          }),
        ],
      }),
      "GET"
    );
});
//# sourceMappingURL=sw.js.map
