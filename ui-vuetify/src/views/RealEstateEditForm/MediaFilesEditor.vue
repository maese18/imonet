<template>
  <v-card flat tile>
    <v-window v-model="mediaFileIndex" vertical>
      <v-window-item v-for="(mediaFile, index) in realEstate.mediaFiles" :key="index">
        <v-card class="mt-3" height="450">
          <v-row>{{ mediaFile.fileName }}</v-row>
          <v-row class="fill-height" justify="center">
            <v-col>
              <div>
                <v-img v-if="mediaFile.id" max-height="400" cover :src="imageUrl(mediaFile)"></v-img>
                <div v-if="!mediaFile.id">Kein File vorhanden</div>
              </div>
            </v-col>
            <v-col align="start">
              <v-form ref="form" v-model="valid" :lazy-validation="lazy">
                <v-text-field v-model="mediaFile.fileName" :counter="10" label="File Name" required></v-text-field>
                <v-text-field v-model="mediaFile.purpose" :counter="10" label="Zweck" required></v-text-field>
                <v-row align="center">
                  <v-col cols="9"> <v-file-input show-size v-model="editMediaFile" small-chips multiple label="Ersetze das File"/></v-col>
                  <v-col cols="3"><v-btn color="primary" @click="updateMediaFile(mediaFile)">File ersetzen</v-btn></v-col>
                </v-row>
              </v-form>
            </v-col>
          </v-row>
        </v-card>
      </v-window-item>
      <v-btn absolute fab bottom right color="primary" @click="addMediaFile">
        <v-icon>mdi-plus</v-icon>
      </v-btn>
      <v-file-input v-model="uploadFile" small-chips multiple label="Upload File" />
    </v-window>

    <v-card-actions class="justify-space-between">
      <v-btn text @click="prev">
        <v-icon>mdi-chevron-left</v-icon>
      </v-btn>
      <v-item-group v-model="mediaFileIndex" class="text-center" mandatory>
        <v-item v-for="(mediaFile, index) in realEstate.mediaFiles" :key="`btn-${index}`" v-slot:default="{ active, toggle }">
          <v-btn :input-value="active" icon @click="toggle">
            <v-icon>mdi-record</v-icon>
          </v-btn>
        </v-item>
      </v-item-group>
      <v-btn text @click="next">
        <v-icon>mdi-chevron-right</v-icon>
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
import validations from '@/validations/index.js';
import shortId from 'shortid';
import api from '@/api/realEstates';
//import realEstates from '../../api/realEstates';
export default {
  props: {
    realEstate: {
      type: Object,
    },
  },
  created() {
    this.validations = validations;
    this.mediaFiles = this.realEstate.mediaFiles;
  },
  data: () => ({
    uploadFile: null,
    editMediaFile: null,
    mediaFileIndex: 0,
    lazy: false,
    valid: true,
  }),

  methods: {
    addMediaFile() {
      this.mediaFiles.push({ purpose: 'Test', clientSideId: shortId.generate() });
      api
        .saveOne(this.realEstate)
        .then(response => {
          console.log('Saved real estate successfully', response.data);
        })
        .catch(e => {
          console.log(e);
        });
    },
    updateMediaFile(mediaFile) {
      console.log('replaceFile', this.editMediaFile);

      api.updateMediaFile({ mediaFile, fileToUpload: this.editMediaFile[0] }).then(response => {
        let createdMediaFiles = response.data.createdMediaFiles;
        console.log('Successfully uploaded files!', createdMediaFiles);

        api.findOne(this.realEstate.id).then(findOneResponse => {
          console.log('Refreshed edited item after file upload', findOneResponse.data.item);
          this.$store.commit('realEstates/updateItem', { realEstate: findOneResponse.data.item });
          //this.realEstate = { ...findOneResponse.data.item };
        });
      });
    },

    onUpload() {
      console.log('onUpload', this.uploadFiles);
      let formData = new FormData();
      for (let i = 0; i < this.uploadFiles.length; i++) {
        let file = this.uploadFiles[i];
        formData.append('purpose_' + i, 'title');
        formData.append('mediaFile_' + i, file);
      }
      //formData.append('mediaFile', this.uploadFiles[0]);
      formData.append('realEstateId', this.realEstate.id);
      let tenantId = 1;
      api.uploadMediaFiles({ formData, tenantId }).then(response => {
        let createdMediaFiles = response.data.createdMediaFiles;
        console.log('Successfully uploaded files!', createdMediaFiles);

        api.findOne(this.realEstate.id).then(findOneResponse => {
          console.log('Refreshed edited item after file upload', findOneResponse.data.item);
          this.$store.commit('realEstates/updateItem', { realEstate: findOneResponse.data.item });
          //this.realEstate = { ...findOneResponse.data.item };
        });
      });
    },
    imageUrl(mediaFile) {
      let token = localStorage.getItem('token');
      return `${process.env.VUE_APP_API_URL}/mediaFiles/${mediaFile.id}?token=${token}`;
    },
    next() {
      this.mediaFileIndex = this.mediaFileIndex + 1 === this.length ? 0 : this.mediaFileIndex + 1;
    },
    prev() {
      this.mediaFileIndex = this.mediaFileIndex - 1 < 0 ? this.length - 1 : this.mediaFileIndex - 1;
    },
  },
};
</script>
