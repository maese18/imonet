import axios from 'axios';
import store from '../store';

class Config {
  constructor() {
    let { origin, port } = window.location;

    console.log(window.location);

    if (port !== 80 && port !== 443) {
      this.apiUrl = `${origin.replace(port, Number(port) - 1)}/api`;
      console.log(`apiUrl=${this.apiUrl}`);
    }
    //this.apiUrl = `${VUE_APP_API_URL}`;
    //console.log(`apiUrl=${this.apiUrl}`);
  }

  loadValues() {
    axios.get(`${this.apiUrl}/configs`).then(response => {
      console.log('received ', response.data);
      let { tenant, theme } = response.data.tenant;
      this.tenant = tenant;
      this.theme = theme;

      store.commit('configsLoaded');
    });
  }
}

export default new Config();
