import BaseMediaSevice from './BaseMediaSevice.js';
import Axios from 'axios';

export default new class RadioService extends BaseMediaSevice {

  audioAPI = null;
  volume = 0.5;
  POLLING_INTERVAL = 10000;
  statusURL = null;

  init(el, statusURL) {
    if (el) {
      this.audioAPI = el;
      this.startPolling();
    } else {
      this.stopPolling();
    }
    if (statusURL) {
      this.statusURL = statusURL;
      this.updateFromStatusURL();
    }
  }

  play() {
    this.isPlaying = true;
    this.setVolume(this.volume, false);
    this.audioAPI.play();
    // this.triggerChange();
  }

  pause() {
    this.isPlaying = false;
    this.audioAPI.pause();
    // this.triggerChange();
  }

  mute() {
    this.isMuted = true;
    this.audioAPI.mute = true;
    // this.triggerChange();
  }

  unmute() {
    this.isMuted = false;
    this.audioAPI.mute = false;
    // this.triggerChange();
  }

  setVolume(val, triggerChange=true) {
    this.audioAPI.volume = val;
    if (triggerChange) {
      // this.triggerChange();
    }
  }

  update(isOnline, message, metaData) {
    if (
      isOnline !== this.isOnline() || 
      message !== this.statusMessage || 
      (metaData && (this.name !== metaData.title))
    ) {
      if (!isOnline) {
        this.pause();
      }
      this.setOnline(isOnline, message);
      if (metaData) {
        this.name = metaData.title;
      }
      this.triggerChange();
    }
  }

  updateFromStatusURL() {
    if (this.statusURL) {
      Axios.get(this.statusURL).then((resp) => {
        if (resp.data) {
          console.log(resp.data.source);
          this.update(resp.data.source === 'Connected' ? true : false, null, resp.data);
        } else {
          console.log('something else..',resp);
          this.update(false, `Network error when pulling status`, null);
        }
      }).catch((e) => {
        console.log('something..e', e);
        this.update(false, `Network error when pulling status: ${e}`, null);
      });
    }
  }

  poll() {
    this.updateFromStatusURL();
  }

}();