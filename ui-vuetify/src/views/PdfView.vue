<template>
  <div class="pdf-viewer">
    <v-row>
      <v-col v-for="file in files" :key="file"
        ><v-btn @click="selectFile(file)">{{ file }}</v-btn></v-col
      >
    </v-row>
    <v-row
      ><v-col> <pdf-component :v-if="selectedFileUrl" :url="selectedFileUrl"></pdf-component></v-col
    ></v-row>
  </div>
</template>
<script>
import PdfComponent from '../components/PdfComponent';
import axios from 'axios';
export default {
  components: { PdfComponent },
  data: function() {
    return { files: ['file-1.pdf', 'file-2.pdf', 'file-3.pdf', 'file-4.pdf'], selectedFileUrl: `${process.env.VUE_APP_API_URL}/medias/file-1.pdf` };
  },
  methods: {
    selectFile: function(file) {
      this.selectedFileUrl = `${process.env.VUE_APP_API_URL}/medias/${file}`;
      this.$log.info(`selected file=${this.selectedFileUrl}`);
    },
  },
  mounted: function() {
    this.$log.info('VUE_APP_API_URL=' + process.env.VUE_APP_API_URL);
    this.files.forEach(file => axios.get(`${process.env.VUE_APP_API_URL}/medias/${file}`));
  },
};
</script>
