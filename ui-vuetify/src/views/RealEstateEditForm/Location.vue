<template>
  <v-row>
    <v-col cols="12" md="6">
      <v-text-field v-model="realEstate.street" v-bind:class="{ 'autofill-dark': darkTheme, 'autofill-light': !darkTheme }" label="Strasse" required></v-text-field>
      <v-text-field v-model="realEstate.zipCode" v-bind:class="{ 'autofill-dark': darkTheme, 'autofill-light': !darkTheme }" label="Postleitzahl" required></v-text-field>
      <v-text-field v-model="realEstate.city" v-bind:class="{ 'autofill-dark': darkTheme, 'autofill-light': !darkTheme }" label="Ortschaft" required></v-text-field>

      <!-- Disable autocomplete with setting autocomplete to a fake field -->
      <v-text-field v-model="realEstate.email" autocomplete="fake-email" :rules="validations.emailRules" label="E-mail" required></v-text-field>

      <!-- Use v-bind class (defined in App.vue) to set text color when browser autofill is used-->
      <v-text-field v-model="realEstate.email" v-bind:class="{ 'autofill-dark': darkTheme, 'autofill-light': !darkTheme }" :rules="validations.emailRules" label="E-mail" required></v-text-field>
    </v-col>

    <v-col cols="12" md="6" style="padding-top:30px">
      <iframe v-if="isAddressDefined" :src="`http://maps.google.com/maps?q=${gMapsQParam}&z=20&output=embed`" frameborder="0" style="border:0;" allowfullscreen="" aria-hidden="false" tabindex="0" width="100%" height="450"></iframe>
    </v-col>
  </v-row>
</template>

<script>
import validations from '@/validations/index.js';
export default {
  created() {
    this.validations = validations;
  },
  props: {
    realEstate: Object,
  },
  computed: {
    isAddressDefined() {
      return this.realEstate.street && (this.realEstate.city || this.realEstate.zipCode);
    },
    gMapsQParam() {
      return this.realEstate.street.replace(' ', '%20') + '%20' + this.realEstate.zipCode + '%20' + this.realEstate.city;
    },
    darkTheme() {
      return this.$vuetify.theme.dark;
    },
  },
};
</script>

<style></style>
