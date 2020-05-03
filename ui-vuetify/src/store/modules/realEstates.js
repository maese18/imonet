//import mutatationTypes from '../mutationTypes';
import api from '@/api/realEstates.js';
// initial state
const state = {
  all: [],
  byClientSideId: {},

  isEditFormVisible: false,
};

// getters
const getters = {};

// mutations
const mutations = {
  create(state, realEstate) {
    console.log('store:addRealEstate');
    state.realEstates[realEstate.clientId] = realEstate;
  },
  saveNewToStore(state, realEstate) {
    console.log('store:updateRealEstate');
    state.all.push(realEstate);
    state.byClientSideId[realEstate.clientSideId] = realEstate;
  },
  saveAllToStore(state, { realEstates }) {
    state.all = realEstates;
    realEstates.map(realEstate => {
      state.byClientSideId[realEstate.clientSideId] = realEstate;
    });

    console.log('Saved real estates to store', state.all, state.byClientSideId);
  },

  setIsEditFormVisible(state, { isEditFormVisible, realEstate }) {
    console.log('setIsEditFormVisible', isEditFormVisible);
    state.isEditFormVisible = isEditFormVisible;
    state.editedRealEstate = realEstate;
  },
};

// actions
const actions = {
  loadAll({ commit }) {
    api
      .findAll()
      .then(realEstates => commit('saveAllToStore', { realEstates: realEstates.data.result }))
      .catch(e => {
        console.log('Failed to load RealEstates', e);
      });
  },
  create({ commit }, { realEstate, showFormOnCreated }) {
    api
      .createOne(realEstate)
      .then(createdRealEstate => {
        console.log(`created realEstate ${JSON.stringify(createdRealEstate.data)}`);
        commit('saveNewToStore', createdRealEstate.data);
        if (showFormOnCreated) {
          commit('setIsEditFormVisible', { isEditFormVisible: showFormOnCreated, realEstate: createdRealEstate.data });
        }
      })
      .catch(e => {
        console.log(`Failed to create new realEstate obj`, e);
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
