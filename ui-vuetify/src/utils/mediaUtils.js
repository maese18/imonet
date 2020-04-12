class MediaUtils {
  hasGetUserMedia() {
    return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
  }
}

export default mediaUtils = new MediaUtils();
