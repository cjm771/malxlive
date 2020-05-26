export default class BaseMediaService {
  
   STATUSES = {
    UNKNOWN: -1, // grey loading..
    OFFLINE: 0, // red dot
    ONLINE: 1, // green dot 
  };

  status = this.STATUSES.UNKNOWN;
  statusMessage = null;
  isPlaying = false;
  isMuted = false;
  listeners = [];
  volume = 0;
  interval = null;
  name = null;
  POLLING_INTERVAL = 5000;

  setOnline(val, statusMessage=null) {
    this.status = val ? this.STATUSES.ONLINE : this.STATUSES.OFFLINE;
    if (statusMessage) {
      this.statusMessage = statusMessage;
    }
  }

  isOnline() {
    return this.status === this.STATUSES.ONLINE;
  }

  registerListener = (listener) => {
    this.listeners.push(listener);
  }

  triggerChange = () => {
    this.listeners.forEach((listener) => {
      listener(this);
    });
  };

  update() {
    // no op...do some updates, and run triggerChange();
  }

  startPolling() {
    this.stopPolling();
    this.interval = setInterval(this.poll.bind(this), this.POLLING_INTERVAL);
  }

  stopPolling() {
    clearInterval(this.interval);
  }

  poll() {
    // no op..do check, if satisfy..then run update()
  }
}