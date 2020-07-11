import './app.css';
import Vue from 'vue';
import App from './App.vue';
import './registerServiceWorker';
import router from './router';
import vuetify from './plugins/vuetify';
import './plugins/logger';
import axiosConfiguration from '@/api/axios-configuration';
import store from './store';
import config from '@/common/config';

axiosConfiguration.configureAxios();
config.loadValues();

Vue.config.productionTip = false;
new Vue({
  router,
  store,
  vuetify,
  render: h => h(App),
}).$mount('#app');

if (Notification.permission == 'granted') {
  navigator.serviceWorker.getRegistration().then(reg => {
    let options = {
      body: 'Here is a notification body!',
      icon: 'img/logo-white-text.png',
      vibrate: [100, 50, 100],
      data: {
        dateOfArrival: Date.now() + 1000 * 60,
        primaryKey: 1,
      },
    };
    if (reg) {
      reg.showNotification('Hello world!', options);
    }
  });
}
