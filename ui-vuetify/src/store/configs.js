function setIsConfigLoaded(state, { value }) {
  state.isConfigLoaded = value;
  console.log('configs loaded in ');
}
function loadConfigs({ commit }) {
  commit('setIsConfigLoaded', { value: true });
}

export default { setIsConfigLoaded, loadConfigs };
