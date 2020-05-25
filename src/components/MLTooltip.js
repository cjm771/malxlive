import React from 'react';
import {OverlayTrigger, Tooltip} from 'react-bootstrap';


export default function MLTooltip ({id, text, placement, children, ...props}) {
  return (
    <OverlayTrigger
      placement={placement || 'auto'}
      delay={{ show: 250, hide: 400 }}
      overlay={
        <Tooltip id={id} transition={false}>
        {text}
        </Tooltip>
      }
    >
      {children}
    </OverlayTrigger>
  )
}