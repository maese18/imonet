/* eslint-disable no-console */

import { register } from 'register-service-worker';

if (process.env.NODE_ENV === 'production') {
  register(`${process.env.BASE_URL}service-worker.js`, {
    ready() {
      console.log('App is being served from cache by a service worker.\n' + 'For more details, visit https://goo.gl/AFskqB');
    },
    registered(registration) {
      console.log('Service worker has been registered.');
      console.log('request push permission');
      Notification.requestPermission(function(status) {
        console.log('Notification permission status:', status);
      });
      setInterval(() => {
        console.log('Check for app updates');
        registration.update();
      }, 1000 * 60); // e.g. hourly checks
    },
    cached() {
      console.log('Content has been cached for offline use.');
    },
    updatefound() {
      console.log('New content is downloading.');
    },
    updated(registration) {
      console.log("New content is available! We'll show a refresh button for the user to click on and refresh");
      /* setTimeout(() => {
        window.location.reload(true);
      }, 1000); */
      // Add a custom event and dispatch it.
      // Used to display of a 'refresh' banner following a service worker update.
      // Set the event payload to the service worker registration object.
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
