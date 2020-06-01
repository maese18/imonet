import Vuex from 'vuex';
import users from './modules/users';
import realEstates from './modules/realEstates';
//const API_URL = process.env.VUE_APP_API_URL;
export default new Vuex.Store({
  state: {
    isConfigLoaded: false,
    isNavigationDrawerOpen: false,
    isLoading: false, // Indicates whether the application is in a state of loading
    exception: { code: -1, message: '' },
  },
  modules: { users, realEstates },

  mutations: {
    configsLoaded(state) {
      state.isConfigLoaded = true;
      console.log('configs loade');
    },
    setIsLoading(state, { isLoading }) {
      state.isLoading = isLoading;
    },
    setException(state, { message, code = 0 }) {
      state.exception.code = code;
      state.exception.message = message;
    },
    toggleNavigationDrawer(state) {
      state.isNavigationDrawerOpen = !state.isNavigationDrawerOpen;
    },
  },
  actions: {},
});
