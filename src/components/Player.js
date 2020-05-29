import React, {useEffect, useState, useRef} from 'react';

// imports
import { faVideoSlash } from '@fortawesome/free-solid-svg-icons';
import { faTwitch, faDiscord } from '@fortawesome/free-brands-svg-icons';

// services
import RadioService from '../services/RadioService.js';
import TwitchService from '../services/TwitchService.js';

// components
import MLTooltip from './MLTooltip.js';
import RadioPlayer from './RadioPlayer.js';
import MediaIndicator from './MediaIndicator.js';

// styles
import PlayerStyle from '../scss/Player.module.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

export default function Player(props) {
  
  /*********
   * VARS  *
   *********/

  // TODO sources and modes config
  // define on and off for each source (which would be by service) and modes set this up..

  // {/* http://stream-relay-geo.ntslive.net/stream2 */}
  // const RADIO_STREAM_URL = 'http://stream-relay-geo.ntslive.net/stream2';
  const RADIO_STREAM_URL = 'http://12113.cloudrad.io:9350/live';
  const RADIO_STATUS_URL = atob("aHR0cHM6Ly9jZG4yLmNsb3VkcmFkLmlvL21hbHgvbGl2ZS9zdHJlYW1pbmZvLmpzb24=");
  const TWITCH_CHANNEL = 'malxxxxx';
  const DISCORD_ID = 'jr4bHKa';

  /*********
   * HLPRS *
   *********/

  const parseModeFromPath = () => {
    const parsedMode = window.location.pathname.replace('/', '').trim();
    if (['twitch', 'discord'].indexOf(parsedMode) === -1) {
      return 'twitch';
    } else {
      return parsedMode;
    }
  };

  const handleChange = (e) => {
    setMode(e.target.value);
  };

  const toggleRadioPlayPause = () => {
    if (radioState.radioPlaying) {
      RadioService.pause();
    } else {
      RadioService.play();
    }
  };

  const toggleRadioMuteUnmute = () => {
    if (radioState.radioMuted) {
      RadioService.unmute();
    } else {
      RadioService.mute();
    }
  };

  const handleRadioVolumeChange = (val) => {
    RadioService.setVolume(val);
  };

  const getRadioDisabled = () => {
    // check if mode is twitch..
    if (mode === 'twitch') {
      return 'Radio Playback disabled in this mode, use twitch controls';
    } else if (radioState.radioStatus !== RadioService.STATUSES.ONLINE) {
      return 'Radio Offline :(';
    }
     else {
        return false;
    }
  }

  /*********
   * HOOKS *
   *********/
  
  // misc
  const [showAbout, setShowAbout] = useState(false);

  // mode
  const [mode, setMode] = useState(parseModeFromPath());
  
  // twitch
  const [twitchChannelName, setTwitchChannelName] = useState(TwitchService.name);
  const [twitchStatus, setTwitchStatus] = useState(TwitchService.status);
  const [twitchMuted, setTwitchMuted] = useState(TwitchService.isMuted);
  const [twitchPlaying, setTwitchPlaying] = useState(TwitchService.isPlaying);

  // radio
  const radioState = {};
  [radioState.radioName, radioState.setRadioName] = useState(RadioService.name);
  [radioState.radioStatus, radioState.setRadioStatus] = useState(RadioService.status);
  [radioState.radioVolume, radioState.setRadioVolume] = useState(RadioService.volume);
  [radioState.radioMuted, radioState.setRadioMuted] = useState(RadioService.isMuted);
  [radioState.radioPlaying, radioState.setRadioPlaying] = useState(RadioService.isPlaying);
  [radioState.radioInteractionNeeded, radioState.setRadioInteractionNeeded] = useState(false);
  radioState.playerRef = useRef();

  // init
  useEffect(() => {

    RadioService.registerListener((radioService) => {
      // radio autoplay
      radioState.setRadioInteractionNeeded(radioService.interactionNeeded);
      radioState.setRadioStatus(radioService.status);
      radioState.setRadioVolume(radioService.volume);
      radioState.setRadioPlaying(radioService.isPlaying);
      radioState.setRadioMuted(radioService.isMuted);
      radioState.setRadioName(radioService.name);

    });
    
    TwitchService.registerListener((twitchService) => {
      setTwitchStatus(twitchService.status);
      setTwitchMuted(twitchService.isMuted);
      setTwitchPlaying(twitchService.isPlaying);
      setTwitchChannelName(twitchService.name);
    });
    TwitchService.isMuted = mode === 'discord' ? true : false;
    TwitchService.init(TWITCH_CHANNEL);

  }, []);

  useEffect(() => {
    if (radioState.playerRef && radioState.playerRef.current) {
      // radio service init
      RadioService.init(radioState.playerRef.current, RADIO_STATUS_URL);
    }
  }, [radioState.playerRef]);

  // autoplay radio when online
  useEffect(() => {
    if (RadioService.isOnline() && mode === 'discord') {
      RadioService.play();
    }
  }, [radioState.radioStatus]);

  // modeswitch
  useEffect(() => {
    if (mode === 'discord') {
      RadioService.play();
      RadioService.unmute();
      TwitchService.setMuted(true);
    } else {
      RadioService.pause();
      RadioService.mute();
      TwitchService.setMuted(false);
    }
    window.history.replaceState({}, null, `/${mode}`);
  }, [mode]);

  /*********
   * RNDR *
  *********/
  
  return (
  <div className={PlayerStyle.Container}>
    <div className={PlayerStyle.Player}>
      <div className={PlayerStyle.PlayerInner}>
        {/* dropdown */}
        <div className={PlayerStyle.Mode}>
          <select value={mode} className="form-control" onChange={handleChange}>
            <option value="twitch">Twitch mode (Video + Audio + Commentary )</option>
            <option value="discord">Discord mode (Video + Audio )</option>
          </select>
        </div>

        {/* backdrop */}
        <img src="/assets/player_mobile.png" alt="" className={`${PlayerStyle.Mobile} ${PlayerStyle.BG}`}></img>
        <img src="/assets/player.png" alt="" className={`${PlayerStyle.Desktop} ${PlayerStyle.BG}`}></img>
        {/* TR Controls  */}
        <div className={PlayerStyle.TRControls}>
          <MLTooltip text="I shudder at the thought." placement="top" id="tooltip-minimize">
            <span className={PlayerStyle.Minimize}>_</span>
          </MLTooltip>
          <MLTooltip text="Don't even think about it." placement="top" id="tooltip-close">
            <span className={PlayerStyle.Close}>X</span>
            </MLTooltip>
        </div>
        {/* twitch */}
        <div className={`${PlayerStyle.Twitch} ${twitchStatus !== TwitchService.STATUSES.OFFLINE ? PlayerStyle.Online : ''}`} id="twitch-embed"></div>
        {
          twitchStatus !== TwitchService.STATUSES.OFFLINE 
          ? ''
          : <div className={`${PlayerStyle.Twitch} ${PlayerStyle.NoVid}`}>{
            twitchChannelName 
            ? `${twitchChannelName}'s Twitch is not live right now :(` 
            : 'Twitch Not Live right now :('
          }
          </div>
        }
        {
          !showAbout
          ? ''
          : <div className={`${PlayerStyle.Twitch} ${PlayerStyle.Overlay}`}>
            <div>
              <p>Malx.live is a project developed by Chris Malcolm for the purpose of resolving multiple video / audio stream sources from twitch, 
              discord, and radio casts..</p>
              <p>
                <u>Twitch mode</u> will be audio from discord + gameplay a/v, a whole experience..where <u>Discord mode</u> will be just gameplay audio and visuals, so discussion via discord can occur without echoing.
              </p>
              <button onClick={() => {setShowAbout(!showAbout)}}>Close</button>
            </div>
          </div>
        }

        {/* controls  */}
        <div className={PlayerStyle.RadioControls}>
            {/* status  */}
            <div className={PlayerStyle.Status}>
              <MediaIndicator 
                name={
                  twitchChannelName ? `Twitch: ${twitchChannelName} ` : 'Twitch '
                }
                status={twitchStatus}
                isPlaying={twitchPlaying}
                isMuted={twitchMuted}
                notPlayingIcon={faVideoSlash}
              />
               <MediaIndicator 
                name={radioState.radioName ? `${radioState.radioName} ` : 'Radio '}
                status={radioState.radioStatus}
                isPlaying={radioState.radioPlaying}
                isMuted={radioState.radioMuted}
                notPlayingIcon={radioState.faVolumeMute}
              />
            </div>
            <RadioPlayer 
              interactionNeeded={radioState.radioInteractionNeeded}
              playerRef={radioState.playerRef} 
              streamURL={RADIO_STREAM_URL} 
              isPlaying={radioState.radioPlaying}
              isMuted={radioState.radioMuted}
              volume={radioState.radioVolume}
              hideVolumeSlider={!RadioService.deviceSupportsVolumeControl()}
              onPlayPauseClick={() => { toggleRadioPlayPause() }}
              onMuteUnmuteClick={() => { toggleRadioMuteUnmute() }}
              onVolumeChange={(val) => { handleRadioVolumeChange(val) }}
              disabled={getRadioDisabled()}
            />
            {/* logo */}
            <div className={PlayerStyle.IconDock}>
              <MLTooltip text="About Malx.Live" placement="top" id="tooltip-minimize">
                <div className={PlayerStyle.LogoWpr}  onClick={() => {setShowAbout(!showAbout)}}>
                  <img src="/logo192.png" alt="" className={PlayerStyle.MLLogo} />
                </div>
              </MLTooltip>
              <MLTooltip text="Open Malx Discord" placement="top" id="tooltip-minimize">
              <a href={`https://discord.gg/${DISCORD_ID}`} target="_blank" className={PlayerStyle.LogoWpr}>
                  <FontAwesomeIcon icon={faDiscord} />
                </a>
              </MLTooltip>
              <MLTooltip text="Open Malx Twitch" placement="top" id="tooltip-minimize">
                <a href={`http://twitch.tv/${twitchChannelName}`} target="_blank" className={PlayerStyle.LogoWpr}>
                  <FontAwesomeIcon icon={faTwitch} />
                </a>
              </MLTooltip>
            </div>
        </div>
      </div>
    </div>
  </div>
  )
};