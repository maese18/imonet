import axios from 'axios';
export default {
  configureAxios() {
    console.log('Set axios baseURL=', process.env.VUE_APP_API_URL);
    axios.defaults.baseURL = process.env.VUE_APP_API_URL;
  },
  setTokenInterceptor(token) {
    // Add a request interceptor
    axios.interceptors.request.use(
      function(config) {
        // Do something before request is sent
        console.log('config:', config);
        config.headers.Authorization = token;
        return config;
      },
      function(error) {
        // Do something with request error
        return Promise.reject(error);
      },
    );
  },
  /*
  // Add a response interceptor
  axios.interceptors.response.use(
    function(response) {
      // Any status code that lie within the range of 2xx cause this function to trigger
      // Do something with response data
      return response;
    },
    function(error) {
      // Any status codes that falls outside the range of 2xx cause this function to trigger
      // Do something with response error
      return Promise.reject(error);
    },
  );*/
};
