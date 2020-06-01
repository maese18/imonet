import axios from 'axios';
import config from '@/common/config';
//const API_URL = process.env.VUE_APP_API_URL;
const URL = `${config.apiUrl}/users`;
//const URL = `${API_URL}/users`;

export default {
  login({ email, password }) {
    return axios.post(`${URL}/login`, { email, password });
  },
};
