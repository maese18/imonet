<template>
  <div class="pdf-viewer">
    <v-row>
      <!--
        https://serversideup.net/uploading-files-vuejs-axios/
        https://stackoverflow.com/questions/44989162/file-upload-in-vuetify
      -->
      <v-col> <v-file-input v-model="uploadFiles" small-chips multiple label="File input w/ small chips"></v-file-input> </v-col>
      <v-col cols="1"> <v-btn color="primary" @click="onUpload">Upload</v-btn></v-col>
    </v-row>
    <v-row>
      <v-col v-for="file in files" :key="file"
        ><v-btn @click="selectFile(file)">{{ file }}</v-btn></v-col
      >
    </v-row>
    <v-row
      ><v-col cols="12"> <pdf-component :v-if="selectedFileUrl" :url="selectedFileUrl"></pdf-component></v-col
    ></v-row>
  </div>
</template>
<script>
import PdfComponent from '../components/PdfComponent';
import axios from 'axios';
export default {
  components: { PdfComponent },
  data: function() {
    return { uploadFiles: [], files: ['file-1.pdf', 'file-2.pdf', 'file-3.pdf', 'file-4.pdf'], selectedFileUrl: `${process.env.VUE_APP_API_URL}/mediaFiles/file-1.pdf` };
  },
  methods: {
    selectFile: function(file) {
      this.selectedFileUrl = `${process.env.VUE_APP_API_URL}/mediaFiles/${file}`;
      this.$log.info(`selected file=${this.selectedFileUrl}`);
    },
    onUpload() {
      this.$log.info(this.uploadFiles);
      let formData = new FormData();
      for (var i = 0; i < this.uploadFiles.length; i++) {
        let file = this.uploadFiles[i];

        formData.append('mediaFile_' + i, file);
      }
      formData.append('mediaFile', this.uploadFiles[0]);
      let tenantId = 1;
      axios
        .post(`${process.env.VUE_APP_API_URL}/mediaFiles/${tenantId}/files`, formData, {
          headers: {
            // 'Content-Type': 'multipart/form-data',
            tenantId: '1',
          },
        })
        .then(() => {
          this.$log.info('SUCCESS!!');
        })
        .catch(err => {
          this.$log.info('FAILURE!!', err);
        });
    },
  },
  mounted: function() {
    this.$log.info('VUE_APP_API_URL=' + process.env.VUE_APP_API_URL);
    this.files.forEach(file => axios.get(`${process.env.VUE_APP_API_URL}/mediaFiles/${file}`));
  },
};
</script>
