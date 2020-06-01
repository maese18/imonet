<template>
  <!-- scroll target references the container in App.vue--->
  <!-- <v-app-bar app dark fixed prominent fade-img-on-scroll shrink-on-scroll scroll-target="#app-bar-scroll-target" color="appBar" src="https://picsum.photos/1920/1080?random">
   -->
  <v-app-bar app dark fixed prominent fade-img-on-scroll shrink-on-scroll scroll-target="#app-bar-scroll-target" color="appBar" src="img/893-1920x1080.jpg">
    <template v-slot:img="{ props }">
      <v-img v-bind="props" gradient="to top right, rgba(10,10,10,.7), rgba(30,30,30,.7)" />
      <div class="d-flex justify-center" style="position:absolute;left:0;right:0;bottom:20px">
        <img style="padding-top:5px" alt="imonet logo" :src="logo" height="80" />
      </div>
    </template>

    <v-app-bar-nav-icon @click.stop="$store.commit('toggleNavigationDrawer')" />
    <v-toolbar-title dark> {{ appName }} {{ appVersion }} </v-toolbar-title>

    <!-- <v-toolbar-title
      ><v-tabs background="transparent">
        <v-tab>Tab 1</v-tab>
        <v-tab>Tab 2</v-tab>
        <v-tab>Tab 3</v-tab>
      </v-tabs></v-toolbar-title
    > -->

    <v-spacer />
    <v-btn icon>
      <v-icon color="tertiary">mdi-heart</v-icon>
    </v-btn>

    <v-btn icon>
      <v-icon>mdi-magnify</v-icon>
    </v-btn>

    <v-menu left bottom>
      <template v-slot:activator="{ on }">
        <v-btn icon v-on="on">
          <v-icon>mdi-dots-vertical</v-icon>
        </v-btn>
      </template>

      <v-list>
        <v-list-item v-for="n in 5" :key="n" @click="() => {}">
          <v-list-item-title>Option {{ n }}</v-list-item-title>
        </v-list-item>
        <v-list-item>
          <v-switch v-model="$vuetify.theme.dark" hide-details inset label="Theme Dark" />
        </v-list-item>
      </v-list>
    </v-menu>
    <!--  <template v-slot:extension>
      <v-tabs align-with-title>
        <v-tab>Tab 1</v-tab>
        <v-tab>Tab 2</v-tab>
        <v-tab>Tab 3</v-tab>
      </v-tabs>
    </template> -->
  </v-app-bar>
</template>
<script>
export default {
  data() {
    return {
      appName: process.env.VUE_APP_NAME,
      appVersion: process.env.VUE_APP_VERSION,
    };
  },
  computed: {
    logo() {
      return this.$vuetify.theme.dark ? '/img/logo-white-text.png' : '/img/logo.png';
    },
  },
};
</script>
