import React from 'react';

// imports
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {faCircle, faVolumeMute, faCircleNotch } from '@fortawesome/free-solid-svg-icons';

// services
import TwitchService from '../services/TwitchService.js';

// styles
import MediaIndicatorStyle from '../scss/MediaIndicator.module.scss';

export default function MediaIndicator({status, isMuted, isPlaying, name, notPlayingIcon}) {
  
  /*********
   * VARS  *
   *********/

  /*********
   * HLPRS *
   *********/

  const determineStatusClass = (status) => {
    if (status === TwitchService.STATUSES.UNKNOWN) {
      return MediaIndicatorStyle.StatusUnknown;
    }
    if (status === TwitchService.STATUSES.OFFLINE) {
      return MediaIndicatorStyle.StatusOffline;
    }
    return MediaIndicatorStyle.StatusOnline;
  };

  /*********
   * RNDR *
  *********/

  return (
    <span className={`${MediaIndicatorStyle.MediaIndicator} ${determineStatusClass(status)} ${(isMuted || !isPlaying) ? MediaIndicatorStyle.DeEmphasize : ''}`}>
      {name}
      {
        isMuted 
        ? (isPlaying 
          ? <FontAwesomeIcon icon={faVolumeMute}></FontAwesomeIcon>
          : <FontAwesomeIcon icon={notPlayingIcon}></FontAwesomeIcon>
        ) 
        : (
            (status === TwitchService.STATUSES.UNKNOWN || 
            status === null)
            ? <FontAwesomeIcon icon={faCircleNotch} spin></FontAwesomeIcon> 
            : <FontAwesomeIcon icon={faCircle}></FontAwesomeIcon> 
        )
      }
    </span>
  )
};