import axios from 'axios';
const API_URL = process.env.VUE_APP_API_URL;
const URL = `${API_URL}/users`;

export default {
  login({ email, password }) {
    return axios.post(`${URL}/login`, { email, password });
  },
};
