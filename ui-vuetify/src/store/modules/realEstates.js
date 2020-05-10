//import mutatationTypes from '../mutationTypes';
import api from '@/api/realEstates.js';
import shortId from 'shortid';
import Vue from 'vue';

// initial state
const state = {
  // Data
  //all: [],
  byClientSideId: {},

  // View states
  isEditFormVisible: false,
  editedClientSideId: '',
};

// getters
const getters = {
  getAllHouses: state => state.all.filter(re => re.type !== 'Haus'),
  getAllAppartments: state => state.all.filter(re => re.type !== 'Wohnung'),
  getAll: state => {
    console.log('getters.getAll');
    return Object.keys(state.byClientSideId)
      .map(clientSideId => state.byClientSideId[clientSideId])
      .sort((i1, i2) => i1.title < i2.title);
  },
  editedRealEstate: state => {
    return state.byClientSideId[state.editedClientSideId];
  },
};

// mutations
const mutations = {
  setIsEditFormVisible(state, value) {
    if (state.isEditFormVisible !== value) {
      state.isEditFormVisible = value;
    }
  },
  addItem(state, realEstate) {
    console.log('store/realEstates/addItem mutation realEstate:', realEstate);
    realEstate.clientSideId = shortId.generate();
    Vue.set(state.byClientSideId, realEstate.clientSideId, realEstate);
  },

  updateItem(state, realEstate) {
    console.log('store/realEstates/updateItem mutation realEstate:', realEstate);
    if (state.byClientSideId[realEstate.clientSideId]) {
      // Item exists already and is reactive therefore
      state.byClientSideId[realEstate.clientSideId] = realEstate;
    } else {
      // Otherwise a new reactive item must be set
      Vue.set(state.byClientSideId, realEstate.clientSideId, realEstate);
    }
  },

  setItems(state, { realEstates }) {
    console.log('store/realEstates/setItems mutation realEstates:', realEstates);

    // state.all = realEstates; // reactive assignment because all is already set
    let byClientSideId = {};
    realEstates.map(realEstate => {
      if (!realEstate.clientSideId) {
        realEstate.clientSideId = shortId.generate();
      }
      byClientSideId[realEstate.clientSideId] = realEstate;

      // In case each property should be reactive, we must make items reactive by setting this:
      // Vue.set(state.byClientSideId, realEstate.clientSideId, realEstate);
    });
    state.byClientSideId = byClientSideId;
  },

  edit(state, { realEstate }) {
    console.log('store/realEstates/edit mutation realEstate:', realEstate);

    state.editedClientSideId = realEstate.clientSideId;
    state.isEditFormVisible = true;
  },
};

// actions
const actions = {
  save({ commit }, { realEstate }) {
    console.log('store/realEstates/save action save:', realEstate);

    api.saveOne(realEstate).then(updated => commit('updateItem', updated));
  },
  loadAll({ commit }) {
    console.log('store/realEstates/loadAll action');

    api
      .findAll()
      .then(realEstates => commit('setItems', { realEstates: realEstates.data.items }))
      .catch(e => console.log('Failed to load RealEstates', e));
  },
  create({ commit }, { realEstate, showFormOnCreated }) {
    console.log('store/realEstates/create action', realEstate);

    realEstate.clientSideId = shortId.generate();
    api
      .createOne(realEstate)
      .then(response => {
        let createdRealEstate = response.data.created;
        commit('addItem', createdRealEstate);
        if (showFormOnCreated) {
          commit('setIsEditFormVisible', { isEditFormVisible: showFormOnCreated });
        }
      })
      .catch(e => {
        console.log(`Failed to create new realEstate obj`, e);
      });
  },
  refreshEditedRealEstate({ state, commit }) {
    console.log('store/realEstates/refreshEditedRealEstate action', state.editedClientSideId);
    if (state.editedClientSideId) {
      api.findOne(state.byClientSideId[state.editedClientSideId].id).then(response => {
        commit('updateItem', { realEstate: response.data.item });
      });
    }
  },
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations,
};
