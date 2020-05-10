<template>
  <div>
    <v-carousel v-model="model">
      <v-carousel-item v-for="(mediaFile, i) in mediaFiles" :key="i">
        <v-sheet height="100%" tile>
          <v-row class="fill-height" align="center" justify="center">
            <v-col cols="12">
              <v-img cover :src="imageUrl(mediaFile)"></v-img>
              <div style="position:absolute; background:#202020;opacity:0.8;left:0;right:0;top:10px;padding:20px">
                <h1>{{ mediaFile.purpose }}</h1>
                <p>{{ mediaFile.description }}</p>
              </div>
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
    mediaFiles: Array,
  },
  data() {
    return {
      colors: ['primary', 'secondary', 'yellow darken-2', 'red', 'orange'],
      model: 0,
    };
  },
  methods: {
    imageUrl(mediaFile) {
      //let realEstateId = this.editedRealEstate.id;
      let token = localStorage.getItem('token');
      return `${process.env.VUE_APP_API_URL}/mediaFiles/${mediaFile.id}?token=${token}`;
    },
  },
};
</script>

<style></style>
