<template>
  <!-- <v-row justify="center"> -->
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
            <v-row>
              <v-btn :disabled="!valid" color="success" class="mr-4" @click="validate">
                Validate
              </v-btn>

              <v-btn color="error" class="mr-4" @click="reset">
                Reset Form
              </v-btn>

              <v-btn color="warning" @click="resetValidation">
                Reset Validation
              </v-btn>
            </v-row>
          </v-tab-item>
          <!-- Fotos -->
          <v-tab-item>
            <galerie :mediaFiles="realEstate.mediaFiles"></galerie>
            <v-row>
              <v-list three-line subheader style="border:1px solid green">
                <v-subheader>User Controls</v-subheader>
                <v-list-item>
                  <v-list-item-content>
                    <v-list-item-title>Content filtering</v-list-item-title>
                    <v-list-item-subtitle>Set the content filtering level to restrict apps that can be downloaded </v-list-item-subtitle>
                  </v-list-item-content>
                </v-list-item>

                <v-list-item>
                  <v-list-item-content>
                    <v-list-item-title>Password</v-list-item-title>
                    <v-list-item-subtitle>Require password for purchase or use password to restrict purchase </v-list-item-subtitle>
                  </v-list-item-content>
                </v-list-item>
              </v-list>
              <v-divider></v-divider>
              <v-list three-line subheader>
                <v-subheader>General</v-subheader>
                <v-list-item>
                  <v-list-item-action>
                    <v-checkbox v-model="notifications"></v-checkbox>
                  </v-list-item-action>
                  <v-list-item-content>
                    <v-list-item-title>Notifications</v-list-item-title>
                    <v-list-item-subtitle>Notify me about updates to apps or games that I downloaded </v-list-item-subtitle>
                  </v-list-item-content>
                </v-list-item>
                <v-list-item>
                  <v-list-item-action>
                    <v-checkbox v-model="sound"></v-checkbox>
                  </v-list-item-action>
                  <v-list-item-content>
                    <v-list-item-title>Sound</v-list-item-title>
                    <v-list-item-subtitle>Auto-update apps at any time. Data charges may apply </v-list-item-subtitle>
                  </v-list-item-content>
                </v-list-item>
                <v-list-item>
                  <v-list-item-action>
                    <v-checkbox v-model="widgets"></v-checkbox>
                  </v-list-item-action>
                  <v-list-item-content>
                    <v-list-item-title>Auto-add widgets</v-list-item-title>
                    <v-list-item-subtitle>Automatically add home screen widgets </v-list-item-subtitle>
                  </v-list-item-content>
                </v-list-item>
              </v-list>
            </v-row>
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
  <!--  </v-row> -->
</template>
<script>
import { mapGetters } from 'vuex';
import validations from '@/validations/index.js';
import JsonDataView from './JsonDataView';
import Galerie from './Galerie';
import Location from './Location';
import api from '../../api/realEstates';
export default {
  components: { Galerie, Location, JsonDataView },
  props: ['isVisible', 'editedRealEstate'],
  created() {
    this.validations = validations;
    console.log('created Dialog');
  },
  data() {
    // let editedRealEstate = this.$store.state.realEstates.editedRealEstateItem;
    //console.log('initiate data', JSON.stringify(editedRealEstate, null, 2));
    return {
      realEstate: this.editedRealEstate,
      //realEstate: { ...editedRealEstate },
      tab: null,
      dialog: false,
      notifications: false,
      sound: true,
      widgets: false,

      //realEstate: { title: 'Inserate Titel', type: 'Wohnung/Haus', street: '', zipCode: '', city: '', price: null, priceType: 'fix', priceEffective: null, description: '' },

      types: ['Wohnung', 'Wohnung/Haus', 'Parkplatz', 'Garagenplatz', 'Grundstück', 'MFH', 'Landwirtschaft', 'Büro/Gewerbe/Industrie'],
      valid: true,
      name: '',
      nameRules: [v => !!v || 'Name is required', v => (v && v.length <= 10) || 'Name must be less than 10 characters'],
      email: '',
      emailRules: [v => !!v || 'E-mail is required', v => /.+@.+\..+/.test(v) || 'E-mail must be valid'],
      select: null,
      checkbox: false,
      lazy: false,

      uploadFiles: [],
      mediaFiles: [],
    };
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

      //let realEstateId = this.editedRealEstate.id;
      //this.$store.dispatch('realEstates/uploadMediaFiles', { realEstate: this.realEstate, formData, tenantId });
      /*axios
        .post(`${process.env.VUE_APP_API_URL}/mediaFiles`, formData, {
          headers: {
            // Manually setting the content type leads to an exception when used with service-worker
            // See https://github.com/github/fetch/issues/505
            // 'Content-Type': 'multipart/form-data',
            tenantId: tenantId,
          },
        })
        .then(response => {
          let createdMediaFiles = response.data.createdMediaFiles;
          console.log('SUCCESS!!', createdMediaFiles);
          this.mediaFiles = createdMediaFiles;
          this.$store.dispatch('realEstates/refreshEditedRealEstate');
          //this.uploadFiles = [];
          //this.mediaFiles = [];
          /* createdMediaFiles.forEach(mf => {
            this.realEstate.mediaFiles.push(mf);
          });*/
      /*})
        .catch(err => {
          this.$log.info('FAILURE!!', err);
        });*/
    },
  },

  computed: {
    ...mapGetters({ realEstate_: 'realEstates/editedRealEstateItem' }),
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
};
</script>
