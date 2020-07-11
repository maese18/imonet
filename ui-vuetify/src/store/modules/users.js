//import mutatationTypes from '../mutationTypes';
import axiosConfiguration from '@/api/axios-configuration.js';
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
  login({ commit }, { email, password, keepLogin }) {
    usersApi
      .login({ email, password })
      .then(response => {
        console.log(`Received token ${JSON.stringify(response.data.token)}`);
        axiosConfiguration.setTokenInterceptor(response.data.token);
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('keepLogin', keepLogin);
        let d = new Date();
        d.setTime(d.getTime() + 1 * 24 * 60 * 60 * 1000);
        let expires = 'expires=' + d.toUTCString();
        document.cookie = 'Token=' + response.data.token + ';' + expires + ';path=/';

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
