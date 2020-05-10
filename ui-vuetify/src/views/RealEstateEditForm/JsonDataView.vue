<template>
  <v-row>
    <v-col cols="12">
      <pre style="text-align: left;">{{ JSON.stringify(realEstate, null, 2) }}</pre>
    </v-col>
  </v-row>
</template>

<script>
export default {
  props: { realEstate: Object },
};
</script>

<style></style>
