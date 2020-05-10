<template>
  <v-app id="v-app">
    <login v-if="isLoginFormVisible"></login>
    <navigation-drawer />
    <app-bar />
    <v-content id="content" v-if="!isLoginFormVisible">
      <v-sheet id="app-bar-scroll-target" class="overflow-y-auto" style="position:absolute;top:0px;bottom:0px;left:0;right:0">
        <!--  <v-container style="height: 1000px;"> -->
        <v-container fluid>
          <router-view />
        </v-container>
      </v-sheet>
    </v-content>
    <bottom-navigation />

    <v-snackbar v-model="appUpdateExists" :timeout="timeout" bottom left class="snack">
      New version available
      <v-spacer />
      <v-btn dark color="accent" @click.native="refreshApp">
        Update
      </v-btn>
      <v-btn icon @click="appUpdateExists = false">
        <v-icon>mdi-close</v-icon>
      </v-btn>
    </v-snackbar>
  </v-app>
</template>

<script>
import Login from './views/Login';
import AppBar from './components/ApplicationBar';
import BottomNavigation from './components/BottomNavigation';
import NavigationDrawer from './components/NavigationDrawer';

export default {
  components: { Login, AppBar, NavigationDrawer, BottomNavigation },
  props: {
    source: String,
  },
  data: () => ({
    items: [],
    registration: null,
    appUpdateExists: false,
    snackWithButtons: false,
    timeout: 0,
  }),
  computed: {
    isLoginFormVisible() {
      return this.$store.state.users.isLoginFormVisible;
    },
    theme() {
      return this.$vuetify.theme.dark ? 'dark' : 'light';
    },
    // mix this into the outer object with the object spread operator
    isNavigationDrawerOpen: {
      get() {
        return this.$store.state.isNavigationDrawerOpen;
      },
      set(value) {
        this.$log.info('set navigation drawer to ', value);
        if (value !== this.$store.state.isNavigationDrawerOpen) {
          this.$store.commit('toggleNavigationDrawer', value);
        }
      },
    },
  },
  created() {
    // default theme can be set here
    // this.$vuetify.theme.dark = false;

    // EventListener to be notified when a service-worker has been updated.
    document.addEventListener('swUpdated', this.showRefreshUI, { once: true });
    this.$log.info('VUE_APP_API_URL=' + process.env.VUE_APP_API_URL);
  },
  methods: {
    showRefreshUI(e) {
      this.$log.info('Received a swUpdated event form the registerServiceWorker.');
      // Display a snackbar inviting the user to refresh/reload the app due
      // to an app update being available.
      // The new service worker is installed, but not yet active.
      // Store the ServiceWorkerRegistration instance for later use.
      this.registration = e.detail;
      this.appUpdateExists = true;
    },
    refreshApp() {
      this.appUpdateExists = false;
      this.$log.info('send skipWaiting and reload app');
      // Protect against missing registration.waiting.
      if (!this.registration || !this.registration.waiting) {
        return;
      }
      // Send a message to the waiting service worker instructing
      // send message to SW to skip the waiting and activate the new SW
      // it to skip waiting, which will trigger the `controlling`
      // event listener above.
      // The sw.js got a 'message' listener to handle this event
      // this.registration.waiting.postMessage('skipWaiting');
      if (navigator.serviceWorker) {
        this.registration.waiting.postMessage('skipWaiting');
        //navigator.serviceWorker.postMessage('skipWaiting');
        // Assuming the user accepted the update, set up a listener
        // that will reload the page as soon as the previously waiting
        // service worker has taken control.
        window.location.reload();
      }
    },
  },
};
</script>
<style>
body,
#v-app {
  background-color: var(--v-background-base);
}
/* Provide better right-edge spacing when using an icon button there. */
.snack >>> .v-snack__content {
  padding-right: 16px;
}

/* Set autofill input backgrounds to theme background color*/
input:-webkit-autofill,
input:-webkit-autofill:hover,
input:-webkit-autofill:focus,
input:-webkit-autofill:active {
  box-shadow: 0 0 0 30px var(--v-background-base) inset !important;
  -webkit-box-shadow: 0 0 0 30px var(--v-background-base) inset !important;
}
/* Attach these classes to text-fields with autofill enabled, but to avoid browser agent formatting*/
.autofill-dark {
  -webkit-text-fill-color: white !important;
}
.autofill-light {
  -webkit-text-fill-color: black !important;
}
</style>
