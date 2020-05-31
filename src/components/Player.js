import React, {useEffect, useState, useRef} from 'react';

// imports
import { faVideoSlash, faVolumeMute, faBroadcastTower } from '@fortawesome/free-solid-svg-icons';
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


const SOURCE_TYPES = {
  twitch: {
    service: TwitchService,
    updaters: {
      'name': 'name',
      'status' : 'status',
      'muted': 'isMuted',
      'playing': 'isPlaying'
    },
    notPlayingIcon: faVideoSlash,
    sourceIcon: faTwitch,
    getDescription: (sourceState) => {
      return sourceState.name ? `Twitch: ${sourceState.name} ` : 'Twitch ';
    },
    getURL: (sourceState) => {
      return `http://twitch.tv/${sourceState.name}`;
    },
    getDisabled: (sourceState, mode) => {
      return false;
    },
    stop: function(serviceInstance) {
      serviceInstance.pause();
    },
    start: function(serviceInstance) {
      serviceInstance.play();
    },
    mute: function(serviceInstance) {
      serviceInstance.setMuted(true);
    },
    unmute: function(serviceInstance) {
      serviceInstance.setMuted(false);
    },
    init: function (serviceInstance, createdRef, mode, config) {
      serviceInstance.isMuted = mode === 'discordRadio' ? true : false;
      serviceInstance.init(config.channel, createdRef);
    }
  },   
  radio: {
    service: RadioService,
    updaters: {
      'radioInteractionNeeded': 'interactionNeeded',
      'status' : 'status',
      'volume' : 'volume',
      'playing': 'isPlaying',
      'muted': 'isMuted',
      'name': 'name',
    },
    notPlayingIcon: faVolumeMute,
    sourceIcon: faBroadcastTower,
    getDescription: (sourceState) => {
      return sourceState.name ? `${sourceState.name} ` : 'Radio ';
    },
    getURL: (sourceState) => {
      return sourceState.config.streamUrl;
    },
    getDisabled: (sourceState, mode) => {
      if (mode !== 'discordRadio') {
        return 'Radio Playback disabled in this mode, use twitch controls';
      } else if (sourceState.status !== RadioService.STATUSES.ONLINE) {
        return 'Radio Offline :(';
      }
       else {
          return false;
      }
    },
    stop: function(serviceInstance) {
      serviceInstance.pause();
      serviceInstance.mute();
    },
    start: function(serviceInstance) {
      serviceInstance.play();
      serviceInstance.unmute();
    },
    mute: function(serviceInstance) {
      serviceInstance.mute();
    },
    unmute: function(serviceInstance) {
      serviceInstance.unmute();
    },
    onStatusChange: function(serviceInstance, mode) {
      if (serviceInstance.isOnline() && mode === 'discordRadio') {
        serviceInstance.play();
      }
    },
    init: function (serviceInstance, createdRef, mode, config) {
      serviceInstance.isMuted = mode === 'discordRadio' ? true : false;
      serviceInstance.init(createdRef.current, config.statusUrl);
    }
  },
};

const SOURCES = [
  {
    id: 'twitch-1',
    type: 'twitch',
    channel: 'malxxxxx',
    showLink: true
  },
  {
    id: 'radio-1',
    type: 'radio',
    // 'http://stream-relay-geo.ntslive.net/stream2'
    streamUrl: 'http://12113.cloudrad.io:9350/live',
    statusUrl: atob("aHR0cHM6Ly9jZG4yLmNsb3VkcmFkLmlvL21hbHgvbGl2ZS9zdHJlYW1pbmZvLmpzb24="),
  },
  {
    id: 'twitch-2',
    type: 'twitch',
    channel: 'malxxxxx2',
  }
];

const MODES = [
  {
    name: 'twitch',
    description: 'Twitch mode (Gameplay Video/Audio/Discord Talk )',
    on: ['twitch-1'],
  },
  {
    name: 'discordRadio',
    description: 'Discord Mode ( Gameplay Video[Twitch]/Audio[Radio] )',
    on: ['twitch-1', 'radio-1'],
    muted: ['twitch-1']
  },
  {
    name: 'discord',
    description: 'Discord Video Mode ( Gameplay Video/Audio via sep twitch )',
    on: ['twitch-2'],
  },
];


const globalState = {};


for (let config of SOURCES) {
  const {id, type} = config;
  const sourceType = SOURCE_TYPES[type];
  const sourceState = globalState[id] = {};
  sourceState.type = sourceType;
  sourceState.type.name = type;
  sourceState.config =config;
  sourceState.serviceInstance = new sourceType.service();
}


export default function Player(props) {
  
  /*********
   * VARS  *
   *********/

  const DISCORD_ID = 'jr4bHKa';
  /*********
   * HLPRS *
   *********/

  const parseModeFromPath = () => {
    const parsedMode = window.location.pathname.replace('/', '').trim();
    if (MODES.map(({name}) => {return name}).indexOf(parsedMode) === -1) {
      return MODES[0].name;
    } else {
      return parsedMode;
    }
  };

  const handleChange = (e) => {
    setMode(e.target.value);
  };

  const getTwitchSourceStates = () => {
    return getSourceStates().filter((sourceState) => {
      return sourceState.type.name === 'twitch';
    });
  };

  const getSourceStates = () => {
    const sourceStates = SOURCES.map(({id}) => {
      return globalState[id];
    });
    return sourceStates;
  };

  const getRadioSourceStates = () => {
    return getSourceStates().filter((sourceState) => {
      return sourceState.type.name === 'radio';
    });
  };


  /*********
   * HOOKS *
   *********/
  
  // misc
  const [showAbout, setShowAbout] = useState(false);

  // mode
  const [mode, setMode] = useState(parseModeFromPath());

  for (let config of SOURCES) {
    const {id} = config;
    const sourceState = globalState[id];
    [sourceState.active, sourceState.setActive] = useState(false); // eslint-disable-line react-hooks/rules-of-hooks
    for (let [stateKey, instanceKey] of Object.entries(sourceState.type.updaters)) { 
      const setStateKey = 'set' + stateKey;
      [sourceState[stateKey], sourceState[setStateKey]] = useState(sourceState.serviceInstance[instanceKey]); // eslint-disable-line react-hooks/rules-of-hooks
    }
    sourceState.ref = useRef(); // eslint-disable-line react-hooks/rules-of-hooks
  };

  /////////////////
  //  UPDATERS   //
  /////////////////

  useEffect(() => {
    for (let {id} of SOURCES) {
      const sourceState = globalState[id];
      sourceState.serviceInstance.registerListener((service) => {
        for (let [stateKey, instanceKey] of Object.entries(sourceState.type.updaters)) { 
          sourceState['set' + stateKey](service[instanceKey]);
        }
      });
    }
  }, []);

  /////////////////
  // REFS / INIT //
  /////////////////

  for (let {id} of SOURCES) {
      const sourceState = globalState[id];

      useEffect(() => {  // eslint-disable-line react-hooks/rules-of-hooks
        if (sourceState.ref && sourceState.ref.current) {
          sourceState.type.init(sourceState.serviceInstance, sourceState.ref, mode, sourceState.config);
        }
      }, [sourceState.ref]); 

  //////////////////////
  // ON STATUS CHANGE //
  //////////////////////

      useEffect(() => { // eslint-disable-line react-hooks/rules-of-hooks
        const statusChangeHandler = sourceState.type.onStatusChange;
        if (statusChangeHandler) {
          statusChangeHandler(sourceState.serviceInstance, mode)
        }
      }, [sourceState.status]);
  }

  /////////////////////
  // MODE TOGGLING   //
  /////////////////////

  // modeswitch
  useEffect(() => {
    for (let modeConfig of MODES) {
      if (mode === modeConfig.name) {
        const sourcesOn =  modeConfig.on || [];
        const sourcesMuted =  modeConfig.muted || [];
        const sourcesOff = SOURCES.map(({id}) => {return id}).filter((id) => {
          return sourcesOn.indexOf(id) === -1;
        });
        sourcesOn.forEach((id) => {
          const sourceState = globalState[id];
          sourceState.setActive(true);
          sourceState.type.unmute(sourceState.serviceInstance);
          sourceState.type.start(sourceState.serviceInstance);
        });
        sourcesMuted.forEach((id) => {
          const sourceState = globalState[id];
          sourceState.setActive(true);
          sourceState.type.mute(sourceState.serviceInstance);
        });
        sourcesOff.forEach((id) => {
          const sourceState = globalState[id];
          sourceState.setActive(false);
          sourceState.type.mute(sourceState.serviceInstance);
          sourceState.type.stop(sourceState.serviceInstance);
        });
      } else {

      }
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
            {
              MODES.map((mode) => {
                return (
                  <option key={mode.name} value={mode.name}>
                    { mode.description }
                  </option>
                )
              })
            }
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
        {/* twitch sources.. */}
          <div className={PlayerStyle.Twitch}>
          {
            getTwitchSourceStates().map((sourceState) => {
              return (
                <div key={sourceState.id} className={`${PlayerStyle.EmbedWpr} ${sourceState.active ? PlayerStyle.Active : ''}`} id={sourceState.id}>    
                    {/* online */}
                    <div
                      ref={sourceState.ref}
                      className={`${PlayerStyle.Embed} ${sourceState.status !== TwitchService.STATUSES.OFFLINE ? PlayerStyle.Online : ''}`} 
                      id={"twitch-embed-" + sourceState.config.channel}
                    ></div>
                    {/* not online */}
                    {
                      sourceState.status !== TwitchService.STATUSES.OFFLINE 
                      ? ''
                      : <div className={PlayerStyle.NoVid}>{
                        sourceState.name 
                        ? `${sourceState.name}'s Twitch is not live right now :(` 
                        : 'Twitch Not Live right now :('
                      }
                      </div>
                    }
                </div>

              )  
            })
          }
          </div>
        {
          !showAbout
          ? ''
          : <div className={`${PlayerStyle.Twitch} ${PlayerStyle.Overlay}`}>
            <div>
              <p>Malx.live is a project developed by Chris Malcolm for the purpose of resolving multiple video / audio stream sources from twitch, 
              discord, and radio casts..</p>
              <p>
                An example,<u>Twitch mode</u> will be audio from discord + gameplay a/v, a whole experience..where <u>Discord mode</u> will be just gameplay audio and visuals, so discussion via discord can occur without echoing.
              </p>
              <button onClick={() => {setShowAbout(!showAbout)}}>Close</button>
            </div>
          </div>
        }

        {/* controls  */}
        <div className={PlayerStyle.RadioControls}>
            {/* status  */}
            <div className={PlayerStyle.Status}>
              {
                getSourceStates().map((sourceState) => {
                  return (
                    <MediaIndicator 
                      key={sourceState.id}
                      name={sourceState.type.getDescription(sourceState)}
                      status={sourceState.status}
                      isPlaying={sourceState.playing}
                      isMuted={sourceState.muted}
                      deEmphasize={!sourceState.active}
                      notPlayingIcon={sourceState.type.notPlayingIcon}
                    />
                  )
                })
              }
            </div>
            {
              getRadioSourceStates().map((sourceState) => {
                return (
                  <RadioPlayer 
                    key={sourceState.id}
                    interactionNeeded={sourceState.radioInteractionNeeded}
                    playerRef={sourceState.ref} 
                    streamURL={sourceState.config.streamUrl} 
                    isPlaying={sourceState.playing}
                    isMuted={sourceState.muted}
                    volume={sourceState.volume}
                    hideVolumeSlider={sourceState.serviceInstance ? !sourceState.serviceInstance.deviceSupportsVolumeControl() : false}
                    onPlayPauseClick={() => { sourceState.serviceInstance.togglePlayPause() }}
                    onMuteUnmuteClick={() => { sourceState.serviceInstance.toggleRadioMuteUnmute() }}
                    onVolumeChange={(val) => { sourceState.serviceInstance.setVolume(val) }}
                    disabled={sourceState.type.getDisabled(sourceState, mode)}
                  />
                )
              })
            }
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
              {
                getSourceStates().map((sourceState) => {
                  return sourceState.config.showLink 
                    ? (
                      <MLTooltip key={sourceState.id} text={`Open ${sourceState.type.getDescription(sourceState)}`} placement="top" id="tooltip-minimize">
                        <a href={sourceState.type.getURL(sourceState)} target="_blank" className={PlayerStyle.LogoWpr}>
                          <FontAwesomeIcon icon={sourceState.type.sourceIcon} />
                        </a>
                      </MLTooltip>
                    )
                    : <span key={sourceState.id}></span>
                })
              }
            </div>
        </div>
      </div>
    </div>
  </div>
  )
};