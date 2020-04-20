<template>
  <div class="home">
    <HelloWorld msg="immobilien netz" />
    <v-text-field v-model="title" :counter="20" label="Title" required />
    <v-text-field v-model="body" label="Body" required />
    <v-btn small @click="sendSubscription">
      send
    </v-btn>
  </div>
</template>

<script>
import axios from 'axios';
// @ is an alias to /src
import HelloWorld from '@/components/HelloWorld.vue';

export default {
  name: 'Home',
  components: {
    HelloWorld,
  },
  data() {
    return {
      title: 'subscription title',
      body: 'subscription body',
    };
  },
  computed: {
    logo() {
      return this.$vuetify.theme.dark ? '/img/logo-white-text.png' : '/img/logo.png';
    },
  },
  methods: {
    sendSubscription() {
      let subscription = { notification: { title: this.title, body: this.body, icon: 'img/logo-white-text.png' } };
      axios.post(`${process.env.VUE_APP_API_URL}/subscribe`, subscription, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
    },
  },
};
</script>
