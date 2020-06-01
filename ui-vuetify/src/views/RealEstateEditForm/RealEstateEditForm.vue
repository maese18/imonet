<template>
  <v-card elevation="5" align="center">
    <v-toolbar dark color="primary" class="pa-0 mx-0" style="padding-left:0;margin-left:0">
      <v-btn icon dark @click="close()">
        <v-icon>mdi-close</v-icon>
      </v-btn>
      <v-toolbar-title>Objekt bearbeiten/erfassen</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-toolbar-items>
        <v-btn dark text @click="dialog = false">{{ tab }}</v-btn>
        <v-badge>{{ lastModifiedEditedItem }}</v-badge>
      </v-toolbar-items>
    </v-toolbar>
    <v-tabs show-arrows next-icon="mdi-arrow-right" prev-icon="mdi-arrow-left" v-model="tab" class="elevation-2" dark>
      <v-tab>Übersicht</v-tab>
      <v-tab>Data</v-tab>
      <v-tab><span>Adresse </span></v-tab>
      <v-tab>Details</v-tab>
      <!-- <v-tab>Dokumente und Fotos</v-tab> -->
      <v-tab>Dokumente und Fotos Alternative</v-tab>
      <v-tab>Fotos</v-tab>
      <v-tab>Verkäufer</v-tab>
      <v-tab>Interessenten</v-tab>
    </v-tabs>
    <!--  <span class="headline">User Profile</span> -->
    <v-divider></v-divider>

    <v-card-text style="height: 600px;" class="px-0">
      <v-form class="px-10" ref="form" v-model="valid" :lazy-validation="lazy">
        <v-tabs-items v-model="tab">
          <!-- Overview tab-->
          <v-tab-item>
            <overview :realEstate="realEstate"></overview>
          </v-tab-item>
          <!-- Data -->
          <v-tab-item>
            <json-data-view :realEstate="realEstate"></json-data-view>
          </v-tab-item>

          <!-- Address -->
          <v-tab-item>
            <location :realEstate="realEstate"></location>
          </v-tab-item>

          <!-- Details -->
          <v-tab-item>
            <Details />
          </v-tab-item>
          <!-- Media Files -->
          <!--   <v-tab-item>
            <media-files :realEstate="realEstate"></media-files>
          </v-tab-item> -->
          <!-- Media Files -->
          <v-tab-item>
            <media-files-editor :realEstate="realEstate"></media-files-editor>
          </v-tab-item>
          <!-- Fotos -->
          <v-tab-item>
            <galerie :mediaFiles="realEstate.mediaFiles" showFieldEditor></galerie>
          </v-tab-item>
        </v-tabs-items>
      </v-form>
    </v-card-text>
    <v-card-actions>
      <v-spacer></v-spacer>
      <v-btn color="blue darken-1" text @click="dialog = false">Close</v-btn>
      <v-btn color="blue darken-1" text @click="save">Save</v-btn>
    </v-card-actions>
  </v-card>
</template>
<script>
import { mapGetters, mapState } from 'vuex';
import validations from '@/validations/index.js';
import JsonDataView from './JsonDataView';
import Galerie from './Galerie';
import Location from './Location';
import MediaFilesEditor from './MediaFilesEditor';
import Details from './Details';
import Overview from './Overview';
import api from '../../api/realEstates';
export default {
  components: { Galerie, MediaFilesEditor, Location, JsonDataView, Details, Overview },
  props: ['isVisible'],
  created() {
    this.validations = validations;
    //this.realEstate = this.editedRealEstate;
    console.log('created Dialog with property editedRealEstate=', JSON.stringify(this.editedRealEstate, null, 2));
  },
  data() {
    // let editedRealEstate = this.$store.state.realEstates.editedRealEstateItem;
    //console.log('initiate data', JSON.stringify(editedRealEstate, null, 2));
    return {
      //realEstate: {},
      tab: null,
      lazy: false,
      valid: true,
      //realEstate: { title: 'Inserate Titel', type: 'Wohnung/Haus', street: '', zipCode: '', city: '', price: null, priceType: 'fix', priceEffective: null, description: '' },

      types: ['Wohnung', 'Wohnung/Haus', 'Parkplatz', 'Garagenplatz', 'Grundstück', 'MFH', 'Landwirtschaft', 'Büro/Gewerbe/Industrie'],

      uploadFiles: [],
      //mediaFiles: [],
    };
  },
  computed: {
    ...mapGetters({ realEstate_: 'realEstates/editedRealEstateItem' }),
    ...mapState({ realEstate: state => state.realEstates.editedRealEstate }),

    lastModifiedEditedItem() {
      return this.$store.state.realEstates.lastModifiedEditedItem;
    },
    isRealEstateEditFormVisible: {
      get() {
        return this.$store.state.realEstates.isEditFormVisible;
      },
      set(value) {
        this.$log.info('toggle setIsEditFormVisible ', value);
        this.$store.commit('realEstates/setIsEditFormVisible', value);
      },
    },
    darkTheme() {
      return this.$vuetify.theme.dark;
    },
  },
  methods: {
    close() {
      this.$store.commit('realEstates/setIsEditFormVisible', false);
    },
    validate() {
      this.$refs.form.validate();
    },
    reset() {
      this.$refs.form.reset();
    },
    resetValidation() {
      this.$refs.form.resetValidation();
    },
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
          this.realEstate = { ...findOneResponse.data.item };
        });
      });
    },
  },
};
</script>
