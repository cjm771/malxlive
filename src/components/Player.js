import React, {useEffect, useState, useRef} from 'react';

// imports
import { faVolumeMute, faVideoSlash } from '@fortawesome/free-solid-svg-icons';

// services
import RadioService from '../services/RadioService.js';
import TwitchService from '../services/TwitchService.js';

// components
import MLTooltip from './MLTooltip.js';
import RadioPlayer from './RadioPlayer.js';
import MediaIndicator from './MediaIndicator.js';

// styles
import PlayerStyle from '../scss/Player.module.scss';

export default function Player(props) {
  
  /*********
   * VARS  *
   *********/

  // {/* http://stream-relay-geo.ntslive.net/stream2 */}
  // {/* http://12113.cloudrad.io:9350/live */}
  const RADIO_STREAM_URL = 'http://stream-relay-geo.ntslive.net/stream2';
  const RADIO_STATUS_URL = atob("aHR0cHM6Ly9jZG4yLmNsb3VkcmFkLmlvL21hbHgvbGl2ZS9zdHJlYW1pbmZvLmpzb24=");
  const TWITCH_CHANNEL = 'maddecentlive';

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
    if (radioPlaying) {
      RadioService.pause();
    } else {
      RadioService.play();
    }
  };

  const toggleRadioMuteUnmute = () => {
    if (radioMuted) {
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
    } else if (radioStatus !== RadioService.STATUSES.ONLINE) {
      return 'Radio Offline :(';
    }
     else {
        return false;
    }
  }

  /*********
   * HOOKS *
   *********/

  // mode
  const [mode, setMode] = useState(parseModeFromPath());
  
  // twitch
  const [twitchChannelName, setTwitchChannelName] = useState(TwitchService.name);
  const [twitchStatus, setTwitchStatus] = useState(TwitchService.status);
  const [twitchMuted, setTwitchMuted] = useState(TwitchService.isMuted);
  const [twitchPlaying, setTwitchPlaying] = useState(TwitchService.isPlaying);

  // radio
  const [radioName, setRadioName] = useState(RadioService.name);
  const [radioStatus, setRadioStatus] = useState(RadioService.status);
  const [radioVolume, setRadioVolume] = useState(RadioService.volume);
  const [radioMuted, setRadioMuted] = useState(RadioService.isMuted);
  const [radioPlaying, setRadioPlaying] = useState(RadioService.isPlaying);
  const [radioInteractionNeeded, setRadioInteractionNeeded] = useState(false);
  const playerRef = useRef();

  // init
  useEffect(() => {

    RadioService.registerListener((radioService) => {
      setRadioInteractionNeeded(radioService.interactionNeeded)
      setRadioStatus(radioService.status);
      setRadioVolume(radioService.volume);
      setRadioPlaying(radioService.isPlaying);
      setRadioMuted(radioService.isMuted);
      setRadioName(radioService.name);
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
    if (playerRef && playerRef.current) {
      // radio service init
      RadioService.init(playerRef.current, RADIO_STATUS_URL);
    }
  }, [playerRef]);

  useEffect(() => {
    if (mode === 'discord') {

      RadioService.play();
      RadioService.unmute();
      TwitchService.setMuted(true);
    } else {
      console.log()
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
                name={radioName ? `${radioName} ` : 'Radio '}
                status={radioStatus}
                isPlaying={radioPlaying}
                isMuted={radioMuted}
                notPlayingIcon={faVolumeMute}
              />
            </div>
            <RadioPlayer 
              interactionNeeded={radioInteractionNeeded}
              playerRef={playerRef} 
              streamURL={RADIO_STREAM_URL} 
              isPlaying={radioPlaying}
              isMuted={radioMuted}
              volume={radioVolume}
              onPlayPauseClick={() => { console.log('changing...'); toggleRadioPlayPause() }}
              onMuteUnmuteClick={() => { toggleRadioMuteUnmute() }}
              onVolumeChange={(val) => { handleRadioVolumeChange(val) }}
              disabled={getRadioDisabled()}
            />
        </div>
        {/* logo */}
        <img src="/logo192.png" alt="" className={PlayerStyle.MLLogo} />
      </div>
    </div>
  </div>
  )
};