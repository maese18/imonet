class MediaUtils {
  hasGetUserMedia() {
    return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
  }
}
const mediaUtils = new MediaUtils();
export default mediaUtils;
