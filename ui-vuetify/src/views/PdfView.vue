<template>
  <div class="pdf-viewer">
    <v-row>
      <!--
        https://serversideup.net/uploading-files-vuejs-axios/
        https://stackoverflow.com/questions/44989162/file-upload-in-vuetify
      -->
      <v-col>
        <v-file-input v-model="uploadFiles" small-chips multiple label="File input w/ small chips" />
      </v-col>
      <v-col cols="1">
        <v-btn color="primary" @click="onUpload">
          Upload
        </v-btn>
      </v-col>
    </v-row>
    <v-row v-if="isLoading">loading</v-row>
    <v-row>
      <v-col v-if="!isLoading" cols="12">
        <div v-for="(mediaFile, i) in mediaFiles" :key="i" elevation="5" style="background:#202020;border-bottom:1px solid #151515">
          <v-btn text color="white" @click="selectedItem === i ? (selectedItem = null) : (selectedItem = i)">
            {{ mediaFile.fileNameAlias }}
          </v-btn>
          <div v-if="selectedItem === i">
            <pdf-component v-if="isVisiblePdf(mediaFile.type, i)" :url="createUrl(mediaFile.fileName)" />
            <img v-if="mediaFile.type.indexOf('pdf') < 0" :src="createUrl(mediaFile.fileName)" />
          </div>
        </div>
      </v-col>
    </v-row>
    <v-row>
      <v-col v-for="file in files" :key="file">
        <v-btn @click="selectFile(file)">
          {{ file }}
        </v-btn>
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="12">
        <pdf-component :v-if="selectedFileUrl" :url="selectedFileUrl" />
      </v-col>
    </v-row>
  </div>
</template>
<script>
import PdfComponent from '../components/PdfComponent';
import axios from 'axios';
export default {
  components: { PdfComponent },
  data: function() {
    return {
      isLoading: true,
      selectedItem: null,
      mediaFiles: [],
      mediaFilePanelsOpen: [],
      uploadFiles: [],
      files: ['file-1.pdf', 'file-2.pdf', 'file-3.pdf', 'file-4.pdf'],
      selectedFileUrl: `${process.env.VUE_APP_API_URL}/mediaFiles/file-1.pdf`,
    };
  },
  mounted: function() {
    this.$log.info('VUE_APP_API_URL=' + process.env.VUE_APP_API_URL);
    console.log('VUE_APP_API_URL=' + process.env.VUE_APP_API_URL);
    console.log('PdfView mounted');
    this.isLoading = true;
    // primitive cache mechanism
    this.files.forEach(file => axios.get(`${process.env.VUE_APP_API_URL}/mediaFiles/${file}`));

    //http://localhost:4060/api/mediaFiles?tenantId=1&prettyFormat
    this.listMediaFiles().then(() => {
      //cache all files
      //let promises = [];
      caches.open('imonet-api').then(cache => {
        console.log('Caching all media files');
        let urls = this.mediaFiles.map(mediaFile => this.createUrl(mediaFile.fileName));
        cache.addAll(urls).then(() => (this.isLoading = false));
      });
    });
    /*
     this.mediaFiles.forEach(mediaFile => {
        promises.push(axios.get(this.createUrl(mediaFile.fileName)));
      });
      Promise.all(promises).then(() => (this.isLoading = false));

    });*/
    /*  axios.get(`${process.env.VUE_APP_API_URL}/mediaFiles?tenantId=1`).then(mediaFilesResponse => {
      this.$log.info('mediaFiles', mediaFilesResponse);
      this.mediaFiles = mediaFilesResponse.data;
      this.mediaFilePanelsOpen = [this.mediaFiles.length];
    }); */
  },
  methods: {
    isVisiblePdf(fileType, index) {
      let isVisPdf = this.selectedItem === index && fileType === 'application/pdf';
      console.log(index, this.selectedItem === index, fileType, isVisPdf);
      return isVisPdf;
    },
    selectFile: function(file) {
      this.selectedFileUrl = `${process.env.VUE_APP_API_URL}/mediaFiles/${file}`;
      this.$log.info(`selected file=${this.selectedFileUrl}`);
    },
    createUrl(fileName) {
      return `${process.env.VUE_APP_API_URL}/mediaFiles/1/${fileName}`;
    },
    onUpload() {
      this.$log.info(this.uploadFiles);
      let formData = new FormData();
      for (let i = 0; i < this.uploadFiles.length; i++) {
        let file = this.uploadFiles[i];

        formData.append('mediaFile_' + i, file);
      }
      formData.append('mediaFile', this.uploadFiles[0]);
      let tenantId = 1;
      axios
        .post(`${process.env.VUE_APP_API_URL}/mediaFiles/${tenantId}/files`, formData, {
          headers: {
            // Manually setting the content type leads to an exception when used with service-worker
            // See https://github.com/github/fetch/issues/505
            // 'Content-Type': 'multipart/form-data',
            tenantId: '1',
          },
        })
        .then(() => {
          this.$log.info('SUCCESS!!');
          this.listMediaFiles();
        })
        .catch(err => {
          this.$log.info('FAILURE!!', err);
        });
    },
    listMediaFiles() {
      return axios.get(`${process.env.VUE_APP_API_URL}/mediaFiles?tenantId=1`).then(mediaFilesResponse => {
        this.$log.info('mediaFiles', mediaFilesResponse);
        this.mediaFiles = mediaFilesResponse.data.data;
        this.mediaFilePanelsOpen = this.mediaFiles.map(() => false);
      });
    },
  },
};
</script>
