<template>
  <pdf :src="url" />
</template>
<script>
import pdf from 'vue-pdf';

export default {
  components: {
    pdf,
  },
  props: { url: { type: String } },
};
</script>
