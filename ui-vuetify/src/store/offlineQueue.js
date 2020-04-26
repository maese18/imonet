import store from './index';
const API_URL = process.env.VUE_APP_API_URL;
class OfflineQueue {
  constructor() {
    let offlineQueueStr = orDefault(localStorage.getItem('offlineQueue'));
    if (offlineQueueStr) {
      this.offlineQueue = JSON.parse(offlineQueue);
    } else {
      this.offlineQueue = { realEstates: [] };
    }
    console.log('OfflineQueue instantiated. Current offlineQueues to store as soon as we have network:', JSON.stringify(this.offlineQueue, null, 2));

    setInterval(() => {
      // try to store queue objects to server
      if (this.offlineQueue.realEstates.length > 0) {
        let errorCount = 0;
        let realEstates = this.offlineQueue.realEstates;
        while (errorCount < 5 && realEstates.length > 0) {
          console.log(`Try saving realEstate object ${JSON.stringify(realEstates[0])}`);
          axios
            .post(`${API_URL}/realEstates`, realEstates[0])
            .then(savedRealEstate => {
              console.log(`Successfully stored realEstate Object as ${JSON.stringify(savedRealEstate)}`);
              store.commit('updateRealEstate', savedRealEstate);
              this.offlineQueue.realEstates.shift();
            })
            .catch(err => {
              console.log(`Failed to save RealEstate object:`, realEstates[0], 'Leave in Queue');
              errorCount++;
            });
        }
      }
    }, 10 * 1000);
  }
}
let offlineQueue = new OfflineQueue();
export default offlineQueue;
