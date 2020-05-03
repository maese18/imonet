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
      </v-toolbar-items>
    </v-toolbar>
    <v-tabs show-arrows next-icon="mdi-arrow-right" prev-icon="mdi-arrow-left" v-model="tab" class="elevation-2" dark>
      <v-tab>Übersicht</v-tab>
      <v-tab><span>Adresse </span> </v-tab>
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
              <v-col cols="12">
                <v-text-field v-model="title" autocomplete="false" :counter="255" :rules="nameRules" label="Titel" required></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-textarea v-model="description" auto-grow label="Description" required></v-textarea>
              </v-col>
              <v-col cols="12">
                <v-file-input v-model="uploadFiles" small-chips multiple label="File input w/ small chips" />
              </v-col>
              <v-col cols="12">
                <v-btn color="primary" @click="onUpload">Upload</v-btn>
              </v-col>
              <v-col v-for="(mediaFile, index) in mediaFiles" :key="index">
                {{ mediaFile.fileName }}
                <v-img :src="getImageUrl(mediaFile)"></v-img>
              </v-col>
            </v-row>
          </v-tab-item>

          <!-- Address -->
          <v-tab-item>
            <v-row>
              <v-col cols="12" md="6">
                <v-text-field v-model="street" v-bind:class="{ 'autofill-dark': darkTheme, 'autofill-light': !darkTheme }" label="Strasse" required></v-text-field>
                <v-text-field v-model="zipCode" v-bind:class="{ 'autofill-dark': darkTheme, 'autofill-light': !darkTheme }" label="Postleitzahl" required></v-text-field>
                <v-text-field v-model="city" v-bind:class="{ 'autofill-dark': darkTheme, 'autofill-light': !darkTheme }" label="Ortschaft" required></v-text-field>

                <v-select v-model="type" :items="types" :rules="[v => !!v || 'Item is required']" label="Typ" required></v-select>
                <v-checkbox v-model="checkbox" :rules="[v => !!v || 'You must agree to continue!']" label="Do you agree?" required></v-checkbox>
              </v-col>

              <v-col cols="12" md="6" style="padding-top:30px">
                <iframe v-if="isAddressDefined" :src="`http://maps.google.com/maps?q=${gMapsQParam}&z=20&output=embed`" frameborder="0" style="border:0;" allowfullscreen="" aria-hidden="false" tabindex="0" width="100%" height="450"></iframe>
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field v-model="title" autocomplete="false" :counter="255" :rules="nameRules" label="Titel" required></v-text-field>
                <v-textarea v-model="description" filled auto-grow label="Description" required></v-textarea>
                <!-- Disable autocomplete with setting autocomplete to a fake field -->
                <v-text-field v-model="email" autocomplete="fake-email" :rules="emailRules" label="E-mail" required></v-text-field>

                <!-- Use v-bind class (defined in App.vue) to set text color when browser autofill is used-->
                <v-text-field v-model="email" v-bind:class="{ 'autofill-dark': darkTheme, 'autofill-light': !darkTheme }" :rules="emailRules" label="E-mail" required></v-text-field>

                <v-text-field v-model="street" v-bind:class="{ 'autofill-dark': darkTheme, 'autofill-light': !darkTheme }" label="Strasse" required></v-text-field>
                <v-text-field v-model="zipCode" v-bind:class="{ 'autofill-dark': darkTheme, 'autofill-light': !darkTheme }" label="Postleitzahl" required></v-text-field>
                <v-text-field v-model="city" v-bind:class="{ 'autofill-dark': darkTheme, 'autofill-light': !darkTheme }" label="Ortschaft" required></v-text-field>

                <v-select v-model="type" :items="types" :rules="[v => !!v || 'Item is required']" label="Typ" required></v-select>
                <v-checkbox v-model="checkbox" :rules="[v => !!v || 'You must agree to continue!']" label="Do you agree?" required></v-checkbox>
              </v-col>
            </v-row>
          </v-tab-item>

          <!-- -->
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
          <v-tab-item>
            <v-row>
              <v-list three-line subheader style="border:1px solid green">
                <v-subheader>User Controls</v-subheader>
                <v-list-item>
                  <v-list-item-content>
                    <v-list-item-title>Content filtering</v-list-item-title>
                    <v-list-item-subtitle>Set the content filtering level to restrict apps that can be downloaded</v-list-item-subtitle>
                  </v-list-item-content>
                </v-list-item>

                <v-list-item>
                  <v-list-item-content>
                    <v-list-item-title>Password</v-list-item-title>
                    <v-list-item-subtitle>Require password for purchase or use password to restrict purchase</v-list-item-subtitle>
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
                    <v-list-item-subtitle>Notify me about updates to apps or games that I downloaded</v-list-item-subtitle>
                  </v-list-item-content>
                </v-list-item>
                <v-list-item>
                  <v-list-item-action>
                    <v-checkbox v-model="sound"></v-checkbox>
                  </v-list-item-action>
                  <v-list-item-content>
                    <v-list-item-title>Sound</v-list-item-title>
                    <v-list-item-subtitle>Auto-update apps at any time. Data charges may apply</v-list-item-subtitle>
                  </v-list-item-content>
                </v-list-item>
                <v-list-item>
                  <v-list-item-action>
                    <v-checkbox v-model="widgets"></v-checkbox>
                  </v-list-item-action>
                  <v-list-item-content>
                    <v-list-item-title>Auto-add widgets</v-list-item-title>
                    <v-list-item-subtitle>Automatically add home screen widgets</v-list-item-subtitle>
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
      <v-btn color="blue darken-1" text @click="dialog = false">Save</v-btn>
    </v-card-actions>
  </v-card>
  <!--  </v-row> -->
</template>
<script>
import axios from 'axios';
import { mapState } from 'vuex';
export default {
  /*
  title: { type: Sequelize.STRING, allowNull: false },
			type: {
				type: Sequelize.ENUM('Wohnung', 'Wohnung/Haus', 'Parkplatz', 'Garagenplatz', 'Grundstück', 'MFH', 'Landwirtschaft', 'Büro/Gewerbe/Industrie'),
				allowNull: false,
			},
			street: { type: Sequelize.STRING, allowNull: true },
			zipCode: { type: Sequelize.STRING },
			price: { type: Sequelize.DECIMAL },
			priceType: { type: Sequelize.ENUM('fix', 'negotiationPrice', 'noPrice') },
			priceEffective: { type: Sequelize.DECIMAL },
			description: { type: Sequelize.TEXT },
	
  */
  props: ['isVisible', 'realEstateItem'],

  data() {
    return {
      tab: null,
      dialog: false,
      notifications: false,
      sound: true,
      widgets: false,

      title: '',
      type: 'Wohnung/Haus',
      street: '',
      zipCode: '',
      city: '',
      price: null,
      priceType: 'fix',
      priceEffective: null,
      description: '',

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
      let realEstateId = this.editedRealEstate.id;
      return `${process.env.VUE_APP_API_URL}/mediaFiles/${realEstateId}/${mediaFile.fileName}?tenantId=1`;
    },
    onUpload() {
      console.log('onUpload', this.uploadFiles);
      let formData = new FormData();
      for (let i = 0; i < this.uploadFiles.length; i++) {
        let file = this.uploadFiles[i];

        formData.append('mediaFile_' + i, file);
      }
      formData.append('mediaFile', this.uploadFiles[0]);
      let tenantId = 1;
      let realEstateId = this.editedRealEstate.id;
      let purpose = 'title';
      axios
        .post(`${process.env.VUE_APP_API_URL}/mediaFiles/${realEstateId}/files`, formData, {
          headers: {
            // Manually setting the content type leads to an exception when used with service-worker
            // See https://github.com/github/fetch/issues/505
            // 'Content-Type': 'multipart/form-data',
            purpose,
            tenantId: tenantId,
          },
        })
        .then(result => {
          console.log('SUCCESS!!', result);
          let realEstateId = this.editedRealEstate.id;
          axios.get(`${process.env.VUE_APP_API_URL}/mediaFiles/${realEstateId}`).then(response => {
            this.mediaFiles = response.data.items;

            console.log('mediaFiles', response);
          });
        })
        .catch(err => {
          this.$log.info('FAILURE!!', err);
        });
    },
  },
  computed: {
    ...mapState({ editedRealEstate: state => state.realEstates.editedRealEstate }),

    isAddressDefined() {
      return this.street && (this.city || this.zipCode);
    },
    gMapsQParam() {
      return this.street.replace(' ', '%20') + '%20' + this.zipCode + '%20' + this.city;
    },
    isRealEstateEditFormVisible: {
      get() {
        return this.$store.state.isRealEstateEditFormVisible;
      },
      set(value) {
        this.$log.info('toggle isRealEstateEditFormVisible ', value);
        if (value !== this.$store.state.isRealEstateEditFormVisible) {
          this.$store.commit('toggleRealEstateEditFormVisibility');
        }
      },
    },
    darkTheme() {
      return this.$vuetify.theme.dark;
    },
  },
  /* watch: {
    isVisible: function(val) {
      console.log(`isVisible changed to ${val}`);
      // when this form is visible create a new object on the server or if it exists do nothing
      if (val === true && !this.realEstateItem.id) {
        console.log('post an object');
        // axios.post();
      }
    },
  }, */
};
</script>
