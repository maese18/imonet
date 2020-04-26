const actions = {
  realEstates: { loadAll: 'realEstates/loadAll' },
};
const mutations = {
  realEstates: {
    create: 'realEstates/create',
    save: 'realEstates/save',
    saveAllToStore: 'realEstates/saveAllToStore',
  },
};
const storeTypes = { actions, mutations };
export default storeTypes;
