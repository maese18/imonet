import Vue from 'vue';
import Vuetify, { VIcon, VToolbarTitle, VRow, VAppBar, VAppBarNavIcon, VSpacer, VTextField } from 'vuetify/lib';
import de from 'vuetify/es5/locale/de';
import Vuex from 'vuex';

import colors from 'vuetify/lib/util/colors';
Vue.use(Vuetify);

Vue.use(Vuex);

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
        background: '#fff',
        primary: colors.blue.darken2,
        secondary: colors.grey.darken1,
        accent: colors.shades.black,
        error: colors.red.accent3,

        appBar: colors.deepPurple,
      },
      dark: {
        background: colors.blueGrey, //'#282828',
        primary: colors.red,

        /* primary: {
          base: colors.purple.base,
          option: colors.green,
          darken1: colors.purple.darken3,
        }, */
        secondary: colors.indigo,
        // All keys will generate theme styles,
        // Here we add a custom `tertiary` color
        tertiary: colors.pink.base,
        appBar: '#202020',
      },
    },
  },
  lang: {
    locales: { de },
    current: 'de',
  },
});
