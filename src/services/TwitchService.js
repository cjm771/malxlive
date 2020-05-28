import BaseMediaSevice from './BaseMediaSevice.js';

export default new class TwitchService extends BaseMediaSevice {

  twitch = window.Twitch;
  embed = null;
  player = null;

  
  init(channel) {
    this.embed = new this.twitch.Embed("twitch-embed", {
      channel,
      layout: "video",
      controls: true,
      muted: false
    });

    this.embed.addEventListener(this.twitch.Embed.VIDEO_READY, () => {
      this.setupPlayerListeners();
      this.player = this.embed.getPlayer(); 
      this.embed.play();
      this.embed.setMuted(this.isMuted);
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

  update(opts={}) {
    this.updateVolumeFromTwitch(opts);
    this.updateNameFromTwitch();
    this.triggerChange();
  }

  poll() {
    if (
      this.isMuted !== this.embed.getMuted() ||
      this.volume !== this.embed.getVolume() || 
      this.player.getChannel() !== this.name
    ) {
      this.update();
    }
  }

  updateNameFromTwitch() {
    if (this.player) {
      this.name = this.player.getChannel();
    }
  }

  updateVolumeFromTwitch(opts={}) {
      if (opts.forceMute !== undefined) {
        this.isMuted = opts.forceMute;
      }
      this.volume = this.embed.getVolume();
  }

  setPaused(isPaused) {
    this.isPlaying = !isPaused;
  }

  setMuted(shouldMute) {
    this.embed.setMuted(shouldMute);
    this.update({forceMute: shouldMute});
  }

}();