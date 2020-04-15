const fs = require('fs');
module.exports = {
  transpileDependencies: ['vuetify'],
  devServer: {
    https: {
      key: fs.readFileSync('./certs/server.key'),
      cert: fs.readFileSync('./certs/server.crt'),
    },
  },
  pwa: {
    workboxPluginMode: 'InjectManifest',
    workboxOptions: {
      swSrc: './src/sw.js',
      swDest: 'service-worker.js',
      //skipWaiting: true,
    },
  },
};
