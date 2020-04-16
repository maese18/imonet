<template>
  <v-app id="v-app">
    <navigation-drawer />
    <app-bar />
    <v-content id="content">
      <!--  <v-sheet id="scrolling-techniques" class="overflow-y-auto" max-height="600"><router-view /> </v-sheet> -->
      <!--  <v-container class="fill-height" fluid pa-0>
        <v-row justify="center" align="center" no-gutters>
          <v-col cols="12">
            <router-view />
          </v-col>
        </v-row>
      </v-container> -->

      <v-sheet id="app-bar-scroll-target" class="overflow-y-auto" max-height="600">
        <v-container style="height: 1000px;"> <router-view /></v-container>
      </v-sheet>
    </v-content>
    <bottom-navigation></bottom-navigation>
    <v-snackbar v-model="snackWithButtons" :timeout="timeout" bottom left class="snack">
      {{ snackWithBtnText }}
      <v-spacer />
      <v-btn dark flat color="primary" @click.native="refreshApp">
        {{ snackBtnText }}
      </v-btn>
      <v-btn icon @click="snackWithButtons = false">
        <v-icon>close</v-icon>
      </v-btn>
    </v-snackbar>
  </v-app>
</template>

<script>
import AppBar from './components/ApplicationBar';
import BottomNavigation from './components/BottomNavigation';
import NavigationDrawer from './components/NavigationDrawer';

export default {
  components: { AppBar, NavigationDrawer, BottomNavigation },
  props: {
    source: String,
  },
  created() {
    // default theme can be set here
    // this.$vuetify.theme.dark = false;

    // Listen for swUpdated event and display refresh snackbar as required.
    document.addEventListener('swUpdated', this.showRefreshUI, { once: true });

    // Assuming the user accepted the update, set up a listener
    // that will reload the page as soon as the previously waiting
    // service worker has taken control.
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      this.$log.info('onControllerChange');
      window.location.reload();
    });

    this.$log.info('VUE_APP_API_URL=' + process.env.VUE_APP_API_URL);
  },
  methods: {
    showRefreshUI(e) {
      // Display a snackbar inviting the user to refresh/reload the app due
      // to an app update being available.
      // The new service worker is installed, but not yet active.
      // Store the ServiceWorkerRegistration instance for later use.
      this.registration = e.detail;
      this.snackBtnText = 'Refresh';
      this.snackWithBtnText = 'New version available!';
      this.snackWithButtons = true;
    },
    refreshApp() {
      this.snackWithButtons = false;

      // Protect against missing registration.waiting.
      if (!this.registration || !this.registration.waiting) {
        return;
      }
      // Send a message to the waiting service worker instructing
      // it to skip waiting, which will trigger the `controlling`
      // event listener above.
      // The sw.js got a 'message' listener to receive this messsage
      this.registration.waiting.postMessage('skipWaiting');
    },
  },
  data: () => ({
    items: [],
    registration: null,
    updateExists: false,
    snackBtnText: '',
    snackWithBtnText: '',
    snackWithButtons: false,
    timeout: 0,
  }),
  computed: {
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
</style>
