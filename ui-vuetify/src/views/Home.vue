<template>
  <div class="home">
    <img alt="imonet logo" :src="logo" />
    <HelloWorld msg="immobilien netz" />
  </div>
</template>

<script>
// @ is an alias to /src
import HelloWorld from '@/components/HelloWorld.vue';

export default {
  name: 'Home',
  components: {
    HelloWorld,
  },
  computed: {
    logo() {
      return this.$vuetify.theme.dark ? '/img/logo-white-text.png' : '/img/logo.png';
    },
  },
};
</script>
