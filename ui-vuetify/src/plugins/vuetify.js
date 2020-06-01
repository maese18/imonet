import Vue from 'vue';
import Vuetify, { VIcon, VToolbarTitle, VRow, VAppBar, VAppBarNavIcon, VSpacer, VTextField } from 'vuetify/lib';
import de from 'vuetify/es5/locale/de';
import Vuex from 'vuex';

import colors from 'vuetify/lib/util/colors';
Vue.use(Vuetify);

Vue.use(Vuex);
console.log('colors.blue.darken2', colors.blue.darken2);
console.log('colors.blue.darken2', colors['blue']['darken2']);
export default new Vuetify({
  components: {
    VAppBar,
    VIcon,
    VRow,
    VToolbarTitle,
    VAppBarNavIcon,
    VSpacer,
    VTextField,
  },

  theme: {
    dark: true,
    options: {
      customProperties: true,
    },
    themes: {
      light: {
        background: '#459200',
        primary: colors.blue.darken2,
        secondary: colors.grey.darken1,
        accent: colors.shades.black,
        error: colors.red.accent3,

        appBar: colors.deepPurple,
      },
      dark: {
        background: '#202020', //'#282828', needs the following sass property to be applied to v-app element
        // #v-app {
        //   background-color: var(--v-background-base);
        // }
        primary: colors.purple,

        /* primary: {
          base: colors.purple.base,
          option: colors.green,
          darken1: colors.purple.darken3,
        }, */
        secondary: colors.indigo,
        // All keys will generate theme styles,
        // Here we add a custom `tertiary` color
        tertiary: colors.indigo.accent4,
        appBar: '#202020',
      },
    },
  },
  lang: {
    locales: { de },
    current: 'de',
  },
});
