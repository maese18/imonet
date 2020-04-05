import Vue from 'vue';
import Vuetify, { VIcon, VToolbarTitle, VRow, VAppBar, VAppBarNavIcon, VSpacer, VTextField } from 'vuetify/lib';
import de from 'vuetify/es5/locale/de';
import Vuex from 'vuex';

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
    themes: {
      light: {
        primary: '#ee44aa',
        secondary: '#424242',
        accent: '#82B1FF',
        error: '#FF5252',
        info: '#2196F3',
        success: '#4CAF50',
        warning: '#FFC107',
      },
    },
  },
  lang: {
    locales: { de },
    current: 'de',
  },
});
