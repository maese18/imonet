<template>
  <v-row>
    {{ realEstate.title }}
    <v-col cols="12">
      <v-text-field v-model="realEstate.title" autocomplete="false" :counter="255" :rules="validations.title" label="Titel" required></v-text-field>
    </v-col>
    <v-col cols="12">
      <v-textarea v-model="realEstate.description" auto-grow label="Description" style="margin-top:5px" required></v-textarea>
    </v-col>

    <v-col cols="12">
      <v-select v-model="realEstate.type" :items="types" :rules="[v => !!v || 'Item is required']" label="Typ" required></v-select>
    </v-col>
    <v-col cols="12">
      <v-file-input v-model="uploadFiles" small-chips multiple label="File input w/ small chips" />
    </v-col>
    <v-col cols="12">
      <v-btn color="primary" @click="onUpload">Upload</v-btn>
    </v-col>
    <v-col v-for="(mediaFile, index) in realEstate.mediaFiles" :key="index">
      {{ mediaFile.fileName }}
      <v-img :src="getImageUrl(mediaFile)"></v-img>
    </v-col>
  </v-row>
</template>

<script>
import validations from '@/validations/index.js';
import api from '@/api/realEstates';
export default {
  props: {
    realEstate: {
      type: Object,
    },
  },
  created() {
    this.validations = validations;
  },
  data() {
    return {
      uploadFiles: [],
      types: ['Wohnung', 'Wohnung/Haus', 'Parkplatz', 'Garagenplatz', 'Grundstück', 'MFH', 'Landwirtschaft', 'Büro/Gewerbe/Industrie'],
    };
  },
  methods: {
    getImageUrl(mediaFile) {
      //let realEstateId = this.editedRealEstate.id;
      let token = localStorage.getItem('token');
      return `${process.env.VUE_APP_API_URL}/mediaFiles/${mediaFile.id}?token=${token}`;
    },
    async save() {
      //this.$store.dispatch('realEstates/save', { realEstate: this.realEstate });
      let self = this;
      let response = await api.saveOne(this.realEstate);
      let updatedRealEstate = response.data.updated;
      console.log('Updated realEstate:', JSON.stringify(updatedRealEstate, null, 4));
      let findOneResponse = await api.findOne(self.realEstate.id);
      console.log('Refreshed edited item after save', findOneResponse.data.item);
      this.realEstate = { ...findOneResponse.data.item };
      this.$store.commit('realEstates/saveItem', { realEstate: this.realEstate });
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
  },
};
</script>

<style></style>
