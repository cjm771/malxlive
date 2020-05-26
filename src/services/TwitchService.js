import BaseMediaSevice from './BaseMediaSevice.js';

export default new class TwitchService extends BaseMediaSevice {

  twitch = window.Twitch;
  embed = null;
  player = null;

  
  init(channel) {
    this.embed = new this.twitch.Embed("twitch-embed", {
      channel,
      layout: "video",
      controls: true
    });

    this.embed.addEventListener(this.twitch.Embed.VIDEO_READY, () => {
      this.setupPlayerListeners();
      this.player = this.embed.getPlayer(); 
      this.player.play();
      this.update();
    });
  }

  setupPlayerListeners() {
    this.startPolling();

    this.embed.addEventListener(this.twitch.Player.PAUSE, () => {
      this.stopPolling();
      this.setPaused(true);
      this.update();
    });
    this.embed.addEventListener(this.twitch.Player.PLAY, () => {
      this.startPolling();
      this.setPaused(false);
      this.update();
    });
    this.embed.addEventListener(this.twitch.Player.OFFLINE, () => {
      this.stopPolling();
      this.setOnline(false);
      this.update();
    });
    this.embed.addEventListener(this.twitch.Player.ONLINE, () => {
      this.startPolling();
      this.setOnline(true);
      this.update();
    });
  }

  update() {
    this.updateVolumeFromTwitch();
    this.updateNameFromTwitch();
    this.triggerChange();
  }

  poll() {
    if (
      this.isMuted !== this.player.getMuted() ||
      this.volume !== this.player.getVolume() || 
      this.player.getChannel() !== this.name
    ) {
      this.update();
    }
  }

  updateNameFromTwitch() {
    this.name = this.player.getChannel();
  }

  updateVolumeFromTwitch() {
    this.isMuted = this.player.getMuted();
    this.volume = this.player.getVolume();
  }

  setPaused(isPaused) {
    console.log('setting is paused to..', isPaused);
    this.isPlaying = !isPaused;
    console.log('is playing...?',this.isPlaying)
  }

  setMuted(shouldMute) {
    this.player.setMuted(shouldMute);
    this.update();
  }

}();