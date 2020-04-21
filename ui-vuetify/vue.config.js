const ServiceWorkerWebpackPlugin = require('serviceworker-webpack-plugin');
const path = require('path');

module.exports = {
  configureWebpack: {
    plugins: [
      new ServiceWorkerWebpackPlugin({
        entry: path.join(__dirname, 'src/service-worker.js'),
        filename: 'service-worker.js',
      }),
    ],
  },
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
  /* pwa: {
    workboxPluginMode: 'InjectManifest',
    workboxOptions: {
      swSrc: 'src/service-worker.js',
    },
    themeColor: process.VUE_APP_THEME_COLOR,
  }, */
};
process.env.VUE_APP_VERSION = require('./package.json').version;
process.env.VUE_APP_NAME = require('./package.json').name;
