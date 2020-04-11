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
  </v-app>
</template>

<script>
import AppBar from './components/AppBar';
import BottomNavigation from './components/BottomNavigation';
import NavigationDrawer from './components/NavigationDrawer';
export default {
  components: { AppBar, NavigationDrawer, BottomNavigation },
  props: {
    source: String,
  },
  data: () => ({
    items: [],
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
        console.log('set navigation drawer to ', value);
        if (value !== this.$store.state.isNavigationDrawerOpen) {
          this.$store.commit('toggleNavigationDrawer', value);
        }
      },
    },
  },
  created() {
    // default theme can be set here
    // this.$vuetify.theme.dark = false;
  },
};
</script>
<style>
body,
#v-app {
  background-color: var(--v-background-base);
}
</style>
