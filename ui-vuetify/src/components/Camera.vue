<template> <video autoplay ref="video"></video></template>
<script>
const hdConstraints = {
  video: { width: { min: 1280 }, height: { min: 720 } },
};
export default {
  mounted() {
    const constraints = {
      video: true,
    };
    this.$log.info(constraints);
    const video = this.$refs.video;

    navigator.mediaDevices.getUserMedia(hdConstraints).then(stream => {
      video.srcObject = stream;
    });
  },
  methods: {},
};
</script>
