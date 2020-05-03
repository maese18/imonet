import './app.css';
import Vue from 'vue';
import App from './App.vue';
import './registerServiceWorker';
import router from './router';
import vuetify from './plugins/vuetify';
import './plugins/logger';
import store from './store';
import axios from 'axios';
Vue.config.productionTip = false;
axios.get('http://localhost:4060/api/realEstates').then(response => {
  console.log('-------------', response);
});
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
