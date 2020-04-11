import Vuex from 'vuex';
export default new Vuex.Store({
  state: {
    isNavigationDrawerOpen: false,
  },

  mutations: {
    toggleNavigationDrawer(state) {
      state.isNavigationDrawerOpen = !state.isNavigationDrawerOpen;
    },
  },
});
