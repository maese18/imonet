//import mutatationTypes from '../mutationTypes';
import api from '@/api/index.js';
import usersApi from '@/api/users.js';
// initial state
const state = {
  isLoginFormVisible: true,
};

// getters
const getters = {};

// mutations
const mutations = {
  setLoginFormVisibility(state, isVisible) {
    state.isLoginFormVisible = isVisible;
  },
};

// actions
const actions = {
  login({ commit }, { email, password }) {
    usersApi
      .login({ email, password })
      .then(response => {
        console.log(`Received token ${JSON.stringify(response.data.token)}`);
        api.setTokenInterceptor(response.data.token);
        localStorage.setItem('token', response.data.token);
        commit('setLoginFormVisibility', false);
      })
      .catch(e => {
        console.log(`Failed to login`, e);
      });
  },
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations,
};
