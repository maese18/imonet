<template>
  <v-sheet class="mx-auto" elevation="8" style="border:1px solid red">
    <v-slide-group v-model="model" class="pa-4" show-arrows :center-active="true">
      <v-slide-item v-for="(mediaFile, index) in realEstate.mediaFiles" :key="index" v-slot:default="{ active, toggle }">
        <v-card :color="active ? 'primary' : 'black lighten-1'" class="ma-4" height="200" width="200" @click="toggle">
          <v-img max-height="100" cover :src="imageUrl(mediaFile)"></v-img>

          <v-card-text style="height:140px">
            <div>{{ mediaFile.fileName }}</div>
            <div>{{ mediaFile.purpose }}</div>
            <div class="description" style="text-overflow:ellipsis">{{ mediaFile.description }}</div>
          </v-card-text>
          <v-card-actions>
            <v-row class="fill-height" align="center" justify="center">
              <v-scale-transition>
                <v-icon v-if="active" color="white" size="48" v-text="'mdi-close-circle-outline'"></v-icon>
              </v-scale-transition>
            </v-row>
          </v-card-actions>
        </v-card>
      </v-slide-item>
    </v-slide-group>
    <v-btn fixed fab bottom right color="primary">
      <v-icon>mdi-plus</v-icon>
    </v-btn>
    <v-file-input v-model="uploadFiles" small-chips multiple label="Upload File" />

    <v-expand-transition>
      <v-sheet v-if="model != null" color="black lighten-4" tile class="pa-5">
        <v-row class="fill-height" align="center" justify="center">
          <v-col cols="12">{{ activeMediaFile.fileName }}</v-col>
          <v-col cols="12">
            <v-text-field v-model="activeMediaFile.purpose" label="Zweck"></v-text-field>
          </v-col>
          <v-col cols="12">
            <v-text-field v-model="activeMediaFile.description" label="Beschreibung"></v-text-field>
          </v-col>
        </v-row>
      </v-sheet>
    </v-expand-transition>
  </v-sheet>
</template>

<script>
export default {
  props: {
    realEstate: {
      type: Object,
    },
  },
  data() {
    return {
      model: null,
    };
  },
  methods: {
    imageUrl(mediaFile) {
      let token = localStorage.getItem('token');
      return `${process.env.VUE_APP_API_URL}/mediaFiles/${mediaFile.id}?token=${token}`;
    },
  },
  computed: {
    activeMediaFile() {
      return this.realEstate.mediaFiles[this.model];
    },
  },
};
</script>

<style scoped>
.description {
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
  width: 100%;
}
</style>
