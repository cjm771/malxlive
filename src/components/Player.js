import React, {useEffect, useState} from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {faCircle, faVolumeMute, faCircleNotch } from '@fortawesome/free-solid-svg-icons';
import MLTooltip from './MLTooltip.js';
import RadioPlayer from './RadioPlayer.js';
import PlayerStyle from '../scss/Player.module.scss';

export default function Player(props) {

  const parseModeFromPath = () => {
    const parsedMode = window.location.pathname.replace('/', '').trim();
    if (['twitch', 'discord'].indexOf(parsedMode) === -1) {
      return 'twitch';
    } else {
      return parsedMode;
    }
  };
  

  const STATUSES = {
    UNKNOWN: -1, // grey dot
    OFFLINE: 0, // red dot
    ONLINE: 1, // green dot 
    MUTED: 2 , // colored audio off symobol
  };

  const [mode, setMode] = useState(parseModeFromPath());
  const [twitchStatus, setTwitchStatus] = useState(STATUSES.UNKNOWN);
  const [radioStatus, setRadioStatus] = useState(STATUSES.UNKNOWN);

  useEffect(() => {
    new window.Twitch.Embed("twitch-embed", {
      channel: "malxxxxx",
      layout: "video",
      controls: false
    });
  }, []);

  useEffect(() => {
    window.history.replaceState({}, null, `/${mode}`);
  }, [mode]);

  const handleChange = (e) => {
    setMode(e.target.value);
  };

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
        <div className={PlayerStyle.Twitch} id="twitch-embed"></div>

        {/* controls  */}
        <div className={PlayerStyle.RadioControls}>
            {/* status  */}
            <div className={PlayerStyle.Status}>
              Loading..
              <span className={`${PlayerStyle.StatusWpr} ${PlayerStyle.StatusOnline}`}>
                Twitch <FontAwesomeIcon icon={faCircle}></FontAwesomeIcon> 
              </span>
              <span className={`${PlayerStyle.StatusWpr} ${PlayerStyle.StatusOnline}`}>
                Radio <FontAwesomeIcon icon={faCircleNotch} spin></FontAwesomeIcon> 
              </span>
            </div>
            <RadioPlayer />
        </div>
        {/* logo */}
        <img src="/logo192.png" className={PlayerStyle.MLLogo} />
        {/* <video className={PlayerStyle}> controls>
          <source src="http://12113.cloudrad.io:9350/live" type="audio/mpeg" />
        </video>  */}
      </div>
    </div>
  </div>
  )
};