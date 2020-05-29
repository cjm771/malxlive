
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {faVolumeUp, faVolumeMute, faPlay, faPause } from '@fortawesome/free-solid-svg-icons';
import RadioPlayerStyle from '../scss/RadioPlayer.module.scss';
import ReactSlider from 'react-slider';

export default function RadioPlayer({
  playerRef, 
  streamURL,
  isPlaying,
  isMuted,
  volume,
  onPlayPauseClick,
  onMuteUnmuteClick,
  onVolumeChange,
  interactionNeeded,
  disabled,
  hideVolumeSlider
}) {

  /*********
   * HOOKS *
   *********/

  /*********
   * RNDR  *
   *********/

  return (
    <div className={`${RadioPlayerStyle.Player} ${disabled ? RadioPlayerStyle.Disabled : ''}`}>
      {
        interactionNeeded 
       ? <i onClick={() => onPlayPauseClick() } className={`${RadioPlayerStyle.SimpleMessage} ${RadioPlayerStyle.InteractionNeeded}`}>Please click here to join Radio Audio.</i>
       : <div className={`${RadioPlayerStyle.PlayerInner} ${isMuted ? RadioPlayerStyle.Disabled : ''}`}>
          <button className={RadioPlayerStyle.Button} onClick={() => { onPlayPauseClick() }}>
            {
              isPlaying 
              ? <FontAwesomeIcon icon={faPause}></FontAwesomeIcon>
              : <FontAwesomeIcon icon={faPlay}></FontAwesomeIcon>
            }
          </button>
          <button className={RadioPlayerStyle.Button} onClick={() => { onMuteUnmuteClick() }}>
            {
              isMuted 
              ? <FontAwesomeIcon icon={faVolumeMute}></FontAwesomeIcon>
              : <FontAwesomeIcon icon={faVolumeUp}></FontAwesomeIcon>
            }
          </button>
            { !hideVolumeSlider ?
              <ReactSlider
                thumbClassName={RadioPlayerStyle.Thumb}
                trackClassName={RadioPlayerStyle.Track}
                onChange={val => {console.log('changing to...' + val); onVolumeChange(val / 100);}}
                renderThumb={(props, state) => <div {...props}></div>}
                value={volume * 100}
            /> : ''
            
            }
            
          <audio src={streamURL} type="audio/mpeg" controls className={RadioPlayerStyle.RadioEmbed} ref={playerRef}>
          </audio> 
          { disabled ? <i className={RadioPlayerStyle.DisabledMessage}>{disabled}</i> : ''}
        </div> 
      }
    </div>
  );
}