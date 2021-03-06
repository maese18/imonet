/* eslint-disable no-console */

import { register } from 'register-service-worker';

if (process.env.NODE_ENV === 'production') {
  register(`${process.env.BASE_URL}service-worker.js`, {
    ready() {
      console.log('App is being served from cache by a service worker.\n' + 'For more details, visit https://goo.gl/AFskqB');
    },
    registered(registration) {
      console.log('Service worker has been registered.');
      console.log('Request push permission');
      Notification.requestPermission(status => {
        console.log('Notification permission status:', status);
      });
      // Check every minute for app updates
      setInterval(() => {
        console.log('Check for app updates', Date.now());
        registration.update();
      }, 1000 * 20); // e.g. check every  20 seconds
    },
    cached() {
      console.log('Content has been cached for offline use.');
    },
    updatefound() {
      console.log('New content is downloading.');
    },
    updated(registration) {
      console.log("New content is available! We'll show a refresh button for the user to click on and refresh", Date.now());

      // The service worker has been updated.
      // Dispatch a custom event 'swUpdated' which is caught in app.js. The app displays an update banner
      // to request the users okay for updating.
      //
      document.dispatchEvent(new CustomEvent('swUpdated', { detail: registration }));
    },
    offline() {
      console.log('No internet connection found. App is running in offline mode.');
    },
    error(error) {
      console.error('Error during service worker registration:', error);
    },
  });
}
