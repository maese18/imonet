import axios from 'axios';
const URL = `m-api/users`;

export default {
  login({ email, password }) {
    return axios.post(`${URL}/login`, { email, password });
  },
};
