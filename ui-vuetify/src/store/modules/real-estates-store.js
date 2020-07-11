//import mutatationTypes from '../mutationTypes';
import api from '@/api/realEstates.js';
import shortId from 'shortid';
import Vue from 'vue';

// initial state
const state = {
  // Data
  byClientSideId: {},
  editedRealEstate: {},

  // View states
  isEditFormVisible: false,
};

// getters
const getters = {
  getAllHouses: (state, getters) => getters.getAll().filter(re => re.type !== 'Haus'),
  getAllAppartments: (state, getters) => getters.getAll().filter(re => re.type !== 'Wohnung'),
  getAll: state => {
    console.log('getters.getAll');
    return Object.keys(state.byClientSideId)
      .map(clientSideId => state.byClientSideId[clientSideId])
      .sort((i1, i2) => i1.title < i2.title)
      .sort((i1, i2) => Date.parse(i1.updatedAt) < Date.parse(i2.updatedAt));
  },
  editedRealEstateItem: state => {
    return state.editedRealEstateItem;
    // return state.byClientSideId[state.editedClientSideId];
  },
};

// mutations
const mutations = {
  setIsEditFormVisible(state, value) {
    if (state.isEditFormVisible !== value) {
      state.isEditFormVisible = value;
    }
  },
  setEditedItem(state, { realEstate }) {
    state.editedRealEstate = realEstate;
  },
  saveItem(state, { realEstate }) {
    if (!realEstate.clientSideId) {
      realEstate.clientSideId = realEstate.id;
    }
    Vue.set(state.byClientSideId, realEstate.clientSideId, realEstate);
  },

  addItem(state, realEstate) {
    console.log('store/realEstates/addItem mutation realEstate:', realEstate);
    realEstate.clientSideId = shortId.generate();
    Vue.set(state.byClientSideId, realEstate.clientSideId, realEstate);
  },

  updateItem(state, { realEstate }) {
    console.log(`store/realEstates/updateItem mutation realEstate:${realEstate.clientSideId}`, JSON.stringify(realEstate, null, 2));
    state.byClientSideId[realEstate.clientSideId] = realEstate;

    if (state.editedClientSideId === realEstate.clientSideId) {
      console.log('update editedRealEstateItem');
      state.editedRealEstateItem = realEstate;
    }
  },

  setItems(state, { realEstates }) {
    console.log('store/realEstates/setItems mutation realEstates:', realEstates);

    // state.all = realEstates; // reactive assignment because all is already set
    let byClientSideId = {};
    realEstates.map(realEstate => {
      if (!realEstate.clientSideId) {
        realEstate.clientSideId = realEstate.id; //shortId.generate();
      }
      //Vue.set(state.byClientSideId, realEstate.clientSideId, realEstate);

      byClientSideId[realEstate.clientSideId] = realEstate;

      // In case each property should be reactive, we must make items reactive by setting this:
      // Vue.set(state.byClientSideId, realEstate.clientSideId, realEstate);
    });
    state.byClientSideId = byClientSideId;
  },

  edit(state, { realEstate }) {
    console.log('store/realEstates/edit mutation realEstate:', realEstate);

    state.editedRealEstate = realEstate; //state.byClientSideId[realEstate.clientSideId];
    state.isEditFormVisible = true;
  },
};

// actions
const actions = {
  save({ commit }, { realEstate }) {
    console.log('store/realEstates/save action save:', realEstate);

    //api.saveOne(realEstate).then(response => commit('updateItem', { realEstate: response.data.updated }));
    api.saveOne(realEstate).then(response => commit('saveItem', { realEstate: response.data.updated }));
  },
  async saveEdited({ commit }, { realEstate }) {
    //this.$store.dispatch('realEstates/save', { realEstate: this.realEstate });

    let response = await api.saveOne(realEstate);
    let updatedRealEstate = response.data.updated;
    console.log('Updated realEstate:', JSON.stringify(updatedRealEstate, null, 4));
    //let findOneResponse = await api.findOne(self.realEstate.id);
    //console.log('Refreshed edited item after save', findOneResponse.data.item);
    //this.realEstate = { ...findOneResponse.data.item };
    commit('realEstates/setEditedItem', { realEstate: this.realEstate });
  },

  loadAll({ commit }) {
    console.log('store/realEstates/loadAll action executes');

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
        let createdRealEstate = response.data.inserted[0];
        console.log('created createdRealEstate', createdRealEstate);
        commit('saveItem', { realEstate: createdRealEstate });

        if (showFormOnCreated) {
          commit('edit', { realEstate: createdRealEstate });
        }
      })
      .catch(e => {
        console.log(`Failed to create new realEstate obj`, e);
      });
  },

  uploadMediaFiles({ commit }, { realEstate, formData, tenantId }) {
    api
      .uploadMediaFiles({ formData, tenantId })
      .then(response => {
        let createdMediaFiles = response.data.createdMediaFiles;
        console.log('Successfully uploaded files!', createdMediaFiles);

        if (state.editedClientSideId) {
          api.findOne(realEstate.id).then(response => {
            console.log('reloaded realEstate of which we saved mediaFiles', JSON.stringify(response.data.item, null, 2));
            commit('updateItem', { realEstate: response.data.item });
          });
        }
      })
      .catch(err => {
        console.log('FAILURE!!', err);
      });
  },
};

export const module = {
  namespaced: true,
  state,
  getters,
  actions,
  mutations,
};

export default {
  module,
  /**
   * Load all realEstate objects.
   */
  loadAll: store => store.dispatch('realEstates/loadAll'),
  /**
   * Creates one RealEstate item, stores it on the remote database.
   */
  createOne: (store, realEstate) => {
    realEstate.clientSideId = shortId.generate();
    store.dispatch('realEstates/create', { realEstate, showFormOnCreated: true });
  },

  edit: (store, realEstate) => {
    store.commit('realEstates/edit', { realEstate });
  },
};
