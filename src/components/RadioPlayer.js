
import React, {useState} from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {faVolumeUp, faVolumeMute, faPlay, faPause } from '@fortawesome/free-solid-svg-icons';
import RadioPlayerStyle from '../scss/RadioPlayer.module.scss';
import ReactSlider from 'react-slider';

export default function RadioPlayer(props) {

  const [volume, setVolume] = useState(50);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);

  return (
    <div className={RadioPlayerStyle.Player}>
      <div className={RadioPlayerStyle.PlayerInner}>
        <button clasName={RadioPlayerStyle.Button} onClick={() => { setIsPlaying(!isPlaying) }}>
          {
            isPlaying 
            ? <FontAwesomeIcon icon={faPause}></FontAwesomeIcon>
            : <FontAwesomeIcon icon={faPlay}></FontAwesomeIcon>
          }
        </button>
        <button className={RadioPlayerStyle.Button} onClick={() => { setIsMuted(!isMuted) }}>
          {
            isMuted 
            ? <FontAwesomeIcon icon={faVolumeUp}></FontAwesomeIcon>
            : <FontAwesomeIcon icon={faVolumeMute}></FontAwesomeIcon>
          }
        </button>
        
        {/* <FontAwesomeIcon icon={faVolumeUp}></FontAwesomeIcon> */}
        <ReactSlider
            className={RadioPlayerStyle.Slider}
            thumbClassName={RadioPlayerStyle.Thumb}
            trackClassName={RadioPlayerStyle.Track}
            // onBeforeChange={val => console.log('onBeforeChange value:', val)}
            onChange={val => setVolume(val)}
            // onAfterChange={val => console.log('onAfterChange value:', val)}
            renderThumb={(props, state) => <div {...props}></div>}
            value={volume}
        />
      </div>
    </div>
  );
}