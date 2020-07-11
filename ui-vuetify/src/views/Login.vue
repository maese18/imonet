<template>
  <v-card class="elevation-12 ">
    <v-toolbar color="primary" dark flat class="mb-8">
      <v-toolbar-title>Login form</v-toolbar-title>
      <v-spacer />
      <!--  <v-tooltip bottom>
                  <template v-slot:activator="{ on }">
                    <v-btn :href="source" icon large target="_blank" v-on="on">
                      <v-icon>mdi-code-tags</v-icon>
                    </v-btn>
                  </template>
                  <span>Source</span>
                </v-tooltip>
                <v-tooltip right>
                  <template v-slot:activator="{ on }">
                    <v-btn icon large href="https://codepen.io/johnjleider/pen/pMvGQO" target="_blank" v-on="on">
                      <v-icon>mdi-codepen</v-icon>
                    </v-btn>
                  </template>
                  <span>Codepen</span>
                </v-tooltip> -->
    </v-toolbar>
    <v-card-text>
      <v-form dark>
        <!-- <v-text-field v-model="email" label="Login" name="login" prepend-icon="mdi-account" type="text" /> -->

        <!-- Disable autocomplete with setting autocomplete to a fake field -->
        <!-- Use v-bind class (defined in App.vue) to set text color when browser autofill is used-->
        <v-text-field v-model="email" autocomplete="fake-email" name="email" v-bind:class="{ 'autofill-dark': darkTheme, 'autofill-light': !darkTheme }" prepend-icon="mdi-account" label="E-mail" required></v-text-field>
        <v-text-field v-model="password" v-on:keyup.enter="login" v-bind:class="{ 'autofill-dark': darkTheme, 'autofill-light': !darkTheme }" id="password" label="Password" name="password" prepend-icon="mdi-lock" type="password" />
        <v-checkbox v-model="storeLogin" label="angemeldet bleiben"></v-checkbox>
      </v-form>
    </v-card-text>
    <v-card-actions>
      <v-spacer />
      <v-btn color="primary" v-on:keyup.enter="login" @click="login">Login</v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
export default {
  props: {
    source: String,
  },
  data() {
    return {
      storeLogin: true,
      email: 'info@ad.ch',
      password: 'pw',
    };
  },
  computed: {
    darkTheme() {
      return this.$vuetify.theme.dark;
    },
  },
  methods: {
    login() {
      this.$store.dispatch('users/login', { email: this.email, password: this.password });
    },
  },
};
</script>
