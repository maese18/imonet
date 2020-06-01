import api from '@/api/realEstates.js';
import shortId from 'shortid';
import Vue from 'vue';

// initial state
const state = {
  // Data
  // View states
};

// getters
const getters = {};

// mutations
const mutations = {};

// actions
const actions = {
  replaceMediaFile({ commit }, { mediaFile, formData }) {
    console.log('store/realEstates/save action save:', realEstate);

    //api.saveOne(realEstate).then(response => commit('updateItem', { realEstate: response.data.updated }));
    api.saveOne(realEstate).then(response => commit('saveItem', { realEstate: response.data.updated }));
  },
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations,
};
