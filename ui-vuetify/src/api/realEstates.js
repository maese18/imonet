import axios from 'axios';
import config from '@/common/config';
const API_URL = config.mongoApiUrl;
const URL = `m-api/realEstates`;
const MEDIA_FILES_URL = `${API_URL}/mediaFiles`;

export default {
  findAll() {
    console.log('realEstates.findAll() ', URL);
    // let query = { collection: 'realEstates', where: {} };
    //return axios.get(`${URL}?query=${JSON.stringify(query)}`);
    return axios.get(`${URL}`);
  },
  findOne(id) {
    return axios.get(`${URL}/${id}`);
  },
  saveOne(realEstate) {
    return axios.post(URL, { method: 'updateOne', data: realEstate });
  },
  createOne(obj) {
    return axios.post(URL, { method: 'insert', data: obj });
  },
  updateOne(obj) {
    console.log('update', obj);
  },
  deleteOne(obj) {
    console.log('delete', obj);
  },
  /*addMediaFile({ mediaFile }) {
    return axios.post();
  },*/
  updateMediaFile({ mediaFile, fileToUpload }) {
    let formData = new FormData();
    //formData.append('files', fileToUpload, fileToUpload.name);
    formData.append('mediaFile', fileToUpload);
    formData.append('realEstateId', mediaFile.fk_realEstate_id);
    formData.append('id', mediaFile.id);
    console.log('execute updateMediaFile');
    return axios.post(`${MEDIA_FILES_URL}`, formData);
  },
  deleteMediaFile({ mediaFile }) {
    return axios.delete(mediaFile.id);
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
