<template>
  <v-navigation-drawer clipped-left v-model="isNavigationDrawerOpen" app :expand-on-hover="expandOnHover" :mini-variant="miniVariant">
    <v-list dense nav class="py-0">
      <div class="d-flex ma-5 justify-center" @click.stop="$store.commit('toggleNavigationDrawer')">
        <img class="mt-1 ml-4 mr-4" alt="imonet logo" :src="logo" height="50" />

        <v-icon @click.stop="$store.commit('toggleNavigationDrawer')">mdi-close</v-icon>
      </div>

      <v-list-item two-line :class="miniVariant && 'px-0'" @click.stop="$store.commit('toggleNavigationDrawer')">
        <v-list-item-avatar>
          <img src="https://randomuser.me/api/portraits/men/81.jpg" />
        </v-list-item-avatar>

        <v-list-item-content>
          <v-list-item-title>Application</v-list-item-title>
          <v-list-item-subtitle>Subtext</v-list-item-subtitle>
        </v-list-item-content>
      </v-list-item>
      <v-divider></v-divider>

      <v-list-item style="height:80px" v-for="item in items" :key="item.title" :to="item.route" link exact class="d-flex flex-column">
        <v-icon class="mt-3 mb-2 d-flex justify-center">{{ item.icon }}</v-icon>
        <div class="d-flex justify-center">{{ item.title }}</div>
      </v-list-item>
      <v-divider></v-divider>

      <!--  <v-list-item v-for="item in items" :key="item.title" :to="item.route" link exact>
        <v-list-item-icon>
          <v-icon>{{ item.icon }}</v-icon>
        </v-list-item-icon>

        <v-list-item-content>
          <v-list-item-title>{{ item.title }}</v-list-item-title>
        </v-list-item-content>
      </v-list-item> -->
    </v-list>
  </v-navigation-drawer>
</template>

<script>
export default {
  data() {
    return {
      items: [
        { title: 'Dashboard', icon: 'mdi-view-dashboard', route: { params: { lang: 'en' }, name: 'Home' } },
        { title: 'Objekt Verwaltung', icon: 'mdi-image', route: { params: { lang: 'en' }, name: 'ObjectListEditor' } },
        { title: 'About', icon: 'mdi-help-box', route: { params: { lang: 'en' }, name: 'About' } },
      ],
      color: 'primary',
      colors: ['primary', 'blue', 'success', 'red', 'teal'],
      right: false,
      miniVariant: false,
      expandOnHover: false,
      background: true,
    };
  },

  computed: {
    logo() {
      return this.$vuetify.theme.dark ? '/img/logo-white-text.png' : '/img/logo.png';
    },
    bg() {
      return this.background ? 'https://cdn.vuetifyjs.com/images/backgrounds/bg-2.jpg' : undefined;
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

<style></style>
