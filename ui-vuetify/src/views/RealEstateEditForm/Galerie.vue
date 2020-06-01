<template>
  <div>
    <v-carousel v-model="model" :show-arrows="mediaFiles.length > 1" :hide-delimiters="hideDelimiters">
      <v-carousel-item v-for="(mediaFile, i) in mediaFiles" :key="i">
        <v-sheet height="100%" tile>
          <v-row class="fill-height" align="center" justify="center">
            <v-col cols="12">
              <v-img :height="height" cover :src="imageUrl(mediaFile)"></v-img>
              <div style="position:absolute; background:#202020;opacity:0.8;left:0;right:0;top:0px;padding:20px">
                <h1>{{ mediaFile.purpose }}</h1>
                <p>{{ mediaFile.description }}</p>
              </div>
            </v-col>
            <v-col cols="12">
              <v-text-field v-if="showFieldEditor" v-model="mediaFile.purpose" label="purpose"></v-text-field>
              <v-text-field v-if="showFieldEditor" v-model="mediaFile.description" label="Description"></v-text-field>
            </v-col>
          </v-row>
        </v-sheet>
      </v-carousel-item>
    </v-carousel>
  </div>
</template>

<script>
export default {
  props: {
    mediaFiles: {
      type: Array,
      default: () => [],
    },

    hideDelimiters: Boolean,
    height: String,
    showFieldEditor: Boolean,
  },
  data() {
    return {
      colors: ['primary', 'secondary', 'yellow darken-2', 'red', 'orange'],
      model: 0,
    };
  },
  methods: {
    imageUrl(mediaFile) {
      let token = localStorage.getItem('token');
      return `${process.env.VUE_APP_API_URL}/mediaFiles/${mediaFile.id}?token=${token}`;
    },
  },
};
</script>

<style></style>
