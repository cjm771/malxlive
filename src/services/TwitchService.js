import BaseMediaSevice from './BaseMediaSevice.js';

export default class TwitchService extends BaseMediaSevice {

  twitch = window.Twitch;
  embed = null;
  player = null;
  TIMEOUT = 10000;
  timer = null;
  inited = false;
  shouldAutoplay = true;

  init(channel, ref) {
    this.inited = true;
    this.embed = new this.twitch.Embed(ref.current.id, {
      channel,
      layout: "video",
      controls: true,
      muted: false,
      parent: ['localhost', 'malx.live', 'www.malx.live']
    });

    // timeout
    this.timer = setTimeout(() => {
      this.setOnline(false, 'Timeout occurred');
    }, this.TIMEOUT);

    this.embed.addEventListener(this.twitch.Embed.VIDEO_READY, () => {
      clearTimeout(this.timer);
      this.setupPlayerListeners();
      this.player = this.embed.getPlayer(); 
      if (this.shouldAutoplay) {
        this.embed.play();
      }
      this.embed.setMuted(this.isMuted);
      this.update();
    });
  }

  play() {
    if (this.inited) {
      this.embed.play();
      this.setPaused(false);
      this.update();
    } else {
      this.shouldAutoplay = true;
    }
  }

  pause() {
    if (this.inited) {
      this.embed.pause();
      this.setPaused(true);
      this.update();
    } else {
      this.shouldAutoplay = false;
    }
  }

  setupPlayerListeners() {
    this.startPolling();

    this.embed.addEventListener(this.twitch.Player.ERROR, () => {
      this.stopPolling();
      this.setOnline(false, 'Error ocurred..');
      this.update();
    });

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
    if (this.inited) {
      this.embed.setMuted(shouldMute);
      this.update({forceMute: shouldMute});
    } else {
    }
  }

};