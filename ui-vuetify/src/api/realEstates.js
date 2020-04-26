import axios from 'axios';
const API_URL = process.env.VUE_APP_API_URL;
const URL = `${API_URL}/realEstates`;

export default {
  findAll() {
    return axios.get(`${URL}?tenantId=1`);
  },
  findOne(id) {
    return axios.get(`${URL}/${id}`);
  },
  createOne(obj) {
    return axios.post(`${URL}`, obj);
  },
  updateOne(obj) {
    console.log('update', obj);
  },
  deleteOne(obj) {
    console.log('delete', obj);
  },
};
