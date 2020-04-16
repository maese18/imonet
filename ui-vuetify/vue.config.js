const fs = require('fs');
module.exports = {
  transpileDependencies: ['vuetify'],
  devServer: {
    /*  https: {
      key: fs.readFileSync('./certs/server.key'),
      cert: fs.readFileSync('./certs/server.crt'),
    }, */
  },
  /* pwa: {
    workboxPluginMode: 'InjectManifest',
    workboxOptions: {
      swSrc: './src/sw.js',
      swDest: 'service-worker.js',
      //skipWaiting: true,
    },
  }, */
  pwa: {
    workboxPluginMode: 'InjectManifest',
    workboxOptions: {
      swSrc: 'src/service-worker.js',
    },
    themeColor: '#1da025',
  },
};
process.env.VUE_APP_VERSION = require('./package.json').version;
process.env.VUE_APP_NAME = require('./package.json').name;
