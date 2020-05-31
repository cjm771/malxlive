import BaseMediaSevice from './BaseMediaSevice.js';
import Axios from 'axios';

export default class RadioService extends BaseMediaSevice {

  audioAPI = null;
  volume = 0.5;
  POLLING_INTERVAL = 10000;
  statusURL = null;
  firstOnline = null;
  interactionNeeded = null;


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
     
      if (!this.isPlaying && this.isOnline()) {
        return this.audioAPI.play().then(() => {
          this.interactionNeeded = false;
          this.isPlaying = true;
          this.setVolume(this.volume, false);    
        }).catch((e) => {
          this.interactionNeeded = true;
        }).finally(() => {
          this.triggerChange();
        });
      } 
  }

  pause() {
    this.isPlaying = false;
    if (this.audioAPI) {
      this.audioAPI.pause();
    }
    this.triggerChange();
  }

  mute() {
    this.isMuted = true;
    if (this.audioAPI) {
      this.audioAPI.muted = true;
    }
    this.triggerChange();
  }

  unmute() {
    this.isMuted = false;
    if (this.audioAPI) {
      this.audioAPI.muted = false;
    }
    this.triggerChange();
  }

  togglePlayPause() {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
  }

  toggleRadioMuteUnmute() {
    if (this.isMuted) {
      this.unmute();
    } else {
      this.mute();
    }
  }

  isIOS() {
    return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
  }

  deviceSupportsVolumeControl() {
    return !this.isIOS();
  }

  setVolume(val, triggerChange=true) {
    if (this.audioAPI) {
      this.audioAPI.volume = val;
    }
    this.volume = val;
    if (triggerChange) {
      this.triggerChange();
    }
  }

  update(isOnline, message, metaData) {
    if (
      isOnline !== this.isOnline() || 
      message !== this.statusMessage || 
      (metaData && (this.name !== metaData.title))
    ) {
      // pause when gone offline
      if (!isOnline && this.isPlaying) {
        this.pause();
      } 
      // if first time going online set to true
      if (this.firstOnline === null && isOnline) {
        this.firstOnline = true;
      }
      // update cycle
      this.setOnline(isOnline, message);
      if (metaData) {
        this.name = metaData.title;
      }
      this.triggerChange();
      // mark first online as complete
      if (this.firstOnline === true) {
        this.firstOnline = false;
      }
    }
  }

  updateFromStatusURL() {
    if (this.statusURL) {
      Axios.get(this.statusURL).then((resp) => {
        if (resp.data) {
          this.update(resp.data.source === 'Connected' ? true : false, null, resp.data);
        } else {
          this.update(false, `Network error when pulling status`, null);
        }
      }).catch((e) => {
        this.update(false, `Network error when pulling status: ${e}`, null);
      });
    }
  }

  poll() {
    this.updateFromStatusURL();
  }

};