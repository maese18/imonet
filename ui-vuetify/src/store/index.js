import Vuex from 'vuex';
import realEstates from './modules/realEstates';
//const API_URL = process.env.VUE_APP_API_URL;
export default new Vuex.Store({
  state: {
    isNavigationDrawerOpen: false,
    isRealEstateEditFormVisible: false,
    isWorking: false,
    exception: { code: -1, message: '' },
  },
  modules: { realEstates },

  mutations: {
    setIsWorking(state, { isWorking }) {
      state.isWorking = isWorking;
    },
    setException(state, { message, code = 0 }) {
      state.exception.code = code;
      state.exception.message = message;
    },
    toggleNavigationDrawer(state) {
      state.isNavigationDrawerOpen = !state.isNavigationDrawerOpen;
    },
    toggleRealEstateEditFormVisibility(state) {
      state.isRealEstateEditFormVisible = !state.isRealEstateEditFormVisible;
    },
  },
  actions: {},
});
