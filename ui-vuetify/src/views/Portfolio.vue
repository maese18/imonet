<template>
  <v-container fluid>
    <!--  <v-btn absolute dark fab bottom right color="pink">
      <v-icon>mdi-plus</v-icon>
    </v-btn> -->
    <!-- see for breakpoints: https://vuetifyjs.com/en/customization/breakpoints/-->
    <!-- Fab button with Real Estate dialog -->
    <v-dialog v-model="isEditFormVisible" :fullscreen="$vuetify.breakpoint.smAndDown" style="border:1px solid white" scrollable max-width="800" transition="dialog-bottom-transition" overlay-color="#404040" overlay-opacity="0.95">
      <template v-slot:activator="{ on }">
        <v-fab-transition>
          <v-btn v-on="on" style="z-index:10" class="mb-5" @click="createNew" fab dark fixed bottom right color="primary">
            <v-icon dark>mdi-plus</v-icon>
          </v-btn>
        </v-fab-transition>
      </template>
      <real-estate-edit-form :isVisible="isEditFormVisible"></real-estate-edit-form>
    </v-dialog>
    <v-row no-gutters>
      <v-col v-for="object in realEstates" :key="object.clientId" cols="12" sm="6" md="4">
        <!--<v-card :loading="isWorking" class="mx-auto my-12" max-width="374">-->
        <v-card :loading="isWorking" class="mx-auto my-12 px-2">
          <v-img height="250" :src="titleImageUrl(object)"></v-img>

          <v-card-title>{{ object.title }}</v-card-title>

          <v-card-text>
            <v-row align="center" class="mx-0">
              <v-rating :value="4.5" color="amber" dense half-increments readonly size="14"></v-rating>

              <div class="grey--text ml-4">4.5 (413)</div>
            </v-row>

            <div class="my-4 subtitle-1">
              {{ object.type }}
            </div>
            <v-row align="center" class="mx-0" style="max-height:100px;overflow:hidden" v-html="object.description"></v-row>
          </v-card-text>

          <v-divider class="mx-4"></v-divider>

          <v-card-title>Tonight's availability</v-card-title>

          <v-card-text>
            <v-chip-group v-model="selection" active-class="deep-purple accent-4 white--text" column>
              <v-chip>Preis: {{ object.price }}</v-chip>

              <v-chip>Effektiver Preis: {{ object.priceEffective }}</v-chip>

              <v-chip>8:00PM</v-chip>

              <v-chip>9:00PM</v-chip>
            </v-chip-group>
          </v-card-text>

          <v-card-actions>
            <v-btn color="deep-purple lighten-2" text @click="edit(object)">
              bearbeiten
            </v-btn>
            <v-btn color="deep-purple lighten-2" text @click="edit(object)">
              löschen
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
console.log(`LOGGER`);
import shortid from 'shortid';
import { mapState, mapGetters } from 'vuex';
import RealEstateEditForm from './RealEstateEditForm/RealEstateEditForm';
export default {
  components: { RealEstateEditForm },
  created() {
    this.$store.dispatch('realEstates/loadAll');
  },
  data() {
    return {
      selection: null,
      hidden: true,
    };
  },
  computed: {
    ...mapGetters({ realEstates: 'realEstates/getAll' }),

    /* ...mapGetters({ realEstates_: 'realEstates/getAll' }),
    realEstates() {
      let realEstatesItems = this.$store.getters['realEstates/getAll'];
      return realEstatesItems;
    },*/
    // ...mapState({ realEstates: state => state.realEstates.getters.getAllHouses, isWorking: state => state.isLoading }),
    ...mapState({ isWorking: state => state.isLoading }),
    /*realEstates() {
      console.log('get RealEstates');
      let byClientSideId = this.$store.state.realEstates.byClientSideId;
      return Object.keys(byClientSideId).map(clientSideId => byClientSideId[clientSideId]);
    },*/
    isEditFormVisible: {
      get() {
        return this.$store.state.realEstates.isEditFormVisible;
      },
      set(value) {
        this.$log.info('toggle isEditFormVisible ', value);
        //if (value !== this.$store.state.isEditFormVisible) {
        this.$store.commit('realEstates/setIsEditFormVisible', value);
        // }
      },
    },
  },
  methods: {
    edit(realEstate) {
      this.$store.commit('realEstates/edit', { realEstate });
    },
    titleImageUrl(realEstateObject) {
      //let realEstateId = this.editedRealEstate.id;
      if (realEstateObject.mediaFiles) {
        let token = localStorage.getItem('token');
        let titleMediaFiles = realEstateObject.mediaFiles.filter(item => item.purpose === 'title');
        if (titleMediaFiles.length === 0 && realEstateObject.mediaFiles.length > 0) {
          return `${process.env.VUE_APP_API_URL}/mediaFiles/${realEstateObject.mediaFiles[0].id}?token=${token}`;
        } else if (titleMediaFiles.length > 0) {
          return `${process.env.VUE_APP_API_URL}/mediaFiles/${titleMediaFiles[0].id}?token=${token}`;
        }
      }

      return 'https://cdn.vuetifyjs.com/images/cards/cooking.png';
    },
    createNew() {
      let realEstate = {
        clientSideId: shortid.generate(),
      };
      this.$store.dispatch('realEstates/create', { realEstate, showFormOnCreated: true });
    },
  },
};
</script>

<style></style>
