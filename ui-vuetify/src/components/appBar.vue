<template>
  <v-app-bar app clipped-left color="red" dense>
    <v-app-bar-nav-icon @click.stop="$store.commit('toggleNavigationDrawer')"/>
    <v-icon class="mx-4" large>
      mdi-youtube
    </v-icon>
    <v-toolbar-title class="mr-12 align-center">
      <span class="title">Youtube</span>
    </v-toolbar-title>
    <v-spacer />
    <v-row align="center" style="max-width: 650px">
      <v-text-field
        :append-icon-cb="() => {}"
        placeholder="Search..."
        single-line
        append-icon="mdi-magnify"
        color="white"
        hide-details
      /> </v-row
  ></v-app-bar>
</template>
<script>
import {
  VIcon,
  VToolbarTitle,
  VRow,
  VAppBar,
  VAppBarNavIcon,
  VSpacer,
  VTextField,
} from "vuetify/lib";
export default {
  components: {
    VAppBar,
    VIcon,
    VRow,
    VToolbarTitle,
    VAppBarNavIcon,
    VSpacer,
    VTextField,
  },
  data() {
    return {};
  },
  name: "appBar",
};
</script>
