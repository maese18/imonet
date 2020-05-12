import axios from 'axios';

const API_URL = process.env.VUE_APP_API_URL;
const URL = `${API_URL}/realEstates`;
const MEDIA_FILES_URL = `${API_URL}/mediaFiles`;

export default {
  findAll() {
    return axios.get(`${URL}?tenantId=1`);
  },
  findOne(id) {
    return axios.get(`${URL}/${id}`);
  },
  saveOne(obj) {
    return axios.put(`${URL}`, { realEstate: obj });
  },
  createOne(obj) {
    return axios.post(`${URL}`, { realEstate: obj });
  },
  updateOne(obj) {
    console.log('update', obj);
  },
  deleteOne(obj) {
    console.log('delete', obj);
  },

  uploadMediaFiles({ formData, tenantId }) {
    return axios.post(`${MEDIA_FILES_URL}`, formData, {
      headers: {
        // Manually setting the content type leads to an exception when used with service-worker
        // See https://github.com/github/fetch/issues/505
        // 'Content-Type': 'multipart/form-data',
        tenantId: tenantId,
      },
    });
  },
};
