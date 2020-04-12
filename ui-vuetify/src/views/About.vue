<template>
  <div class="about">
    <h1>This is an about page</h1>
    <div class="button-group">
      <button id="btn-start" type="button" class="button" @click="startStreaming">Start Streaming</button>
      <button id="btn-stop" type="button" class="button" @click="stopStreaming">Stop Streaming</button>
      <button id="btn-capture" type="button" class="button" @click="captureSnapshot">Capture Image</button>
    </div>

    <!-- Video Element & Canvas -->
    <div class="play-area">
      <div class="play-area-sub">
        <h3>The Stream</h3>
        <video id="stream" width="320" height="240"></video>
      </div>
      <div class="play-area-sub">
        <h3>The Capture</h3>
        <canvas id="capture" width="320" height="240"></canvas>
        <div id="snapshot"></div>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  mounted() {
    // The buttons to start & stop stream and to capture the image
    this.btnStart = document.getElementById('btn-start');
    this.btnStop = document.getElementById('btn-stop');
    this.btnCapture = document.getElementById('btn-capture');

    // The stream & capture
    this.stream = document.getElementById('stream');
    this.capture = document.getElementById('capture');
    this.snapshot = document.getElementById('snapshot');

    // The video stream
    this.cameraStream = null;
    this.$log.info('About mounted');
  },
  methods: {
    // Start Streaming
    startStreaming: function() {
      var mediaSupport = 'mediaDevices' in navigator;

      if (mediaSupport && null == this.cameraStream) {
        navigator.mediaDevices
          .getUserMedia({ video: true })
          .then(mediaStream => {
            this.cameraStream = mediaStream;
            this.stream.srcObject = mediaStream;
            this.stream.play();
          })
          .catch(function(err) {
            this.$log.info('Unable to access camera: ' + err);
          });
      } else {
        alert('Your browser does not support media devices.');

        return;
      }
    },
    stopStreaming: function() {
      if (null != this.cameraStream) {
        var track = this.cameraStream.getTracks()[0];

        track.stop();
        this.stream.load();

        this.cameraStream = null;
      }
    },
    captureSnapshot: function() {
      this.$log.info('captureSnapshot');
      if (this.cameraStream) {
        var ctx = this.capture.getContext('2d');
        var img = new Image();

        ctx.drawImage(this.stream, 0, 0, this.capture.width, this.capture.height);

        img.src = this.capture.toDataURL('image/png');
        img.width = 240;
        this.snapshot.innerHTML = '';
        this.snapshot.appendChild(img);
      }
    },
    dataURItoBlob: function(dataURI) {
      var byteString = atob(dataURI.split(',')[1]);
      var mimeString = dataURI
        .split(',')[0]
        .split(':')[1]
        .split(';')[0];

      var buffer = new ArrayBuffer(byteString.length);
      var data = new DataView(buffer);

      for (var i = 0; i < byteString.length; i++) {
        data.setUint8(i, byteString.charCodeAt(i));
      }

      return new Blob([buffer], { type: mimeString });
    },
    sendImage: function() {
      var request = new XMLHttpRequest();

      request.open('POST', '/upload/url', true);

      var data = new FormData();
      var dataURI = this.snapshot.firstChild.getAttribute('src');
      var imageData = this.dataURItoBlob(dataURI);

      data.append('image', imageData, 'myimage');

      request.send(data);
    },
  },
};
</script>
<style scoped>
.button-group,
.play-area {
  border: 1px solid grey;
  padding: 1em 1%;
  margin-bottom: 1em;
}

.button {
  padding: 0.5em;
  margin-right: 1em;
}

.play-area-sub {
  width: 47%;
  padding: 1em 1%;
  display: inline-block;
  text-align: center;
}

#capture {
  display: none;
}

#snapshot {
  display: inline-block;
  width: 320px;
  height: 240px;
}
</style>
