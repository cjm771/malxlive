# Malx.live
Malx live (https://malx.live) is a project developed for the purpose of resolving multiple video / audio stream sources from twitch, discord, and radio casts..all into one experience. While created for personal use for 1) having twitch + discord commentary vs 2) gameplay a/v stream without commentary for discorders, could be readapted for hosting multi cast events or other pursuits.

Desktop                         |  Mobile
:------------------------------:|:-------------------------:
![preview](assets/preview.gif)  |  ![mobile-preview](assets/preview-mobile.gif)


_Disclaimer_: For app previews and channel examples I was just using what was on twitch's front page and in no way endorsing or promoting their content.

_2nd Disclaimer_: Yes the skin and aesthetic is intentionally done this way. 

## Table of Contents
<!-- TOC -->

- [Malx.live](#malxlive)
  - [Table of Contents](#table-of-contents)
  - [1.1. Configuring](#11-configuring)
    - [1.1.1. Source Types](#111-source-types)
    - [1.1.2. Sources](#112-sources)
    - [1.1.3. Modes](#113-modes)
  - [1.2. Skinning](#12-skinning)

<!-- /TOC -->

## 1.1. Configuring
There are essentially *3 configurable objects* (see `Player.js`):

### 1.1.1. Source Types

*SOURCE_TYPES:* currently 2 types, defines `twitch` and `radio`. it basically defines how starting, stopping, initializing, etc works, its underlying bound service, service state -> hook state bindings, and other source type specific context.

```js
// example of source type shape 
const SOURCE_TYPES = {
  twitch: {
    service: TwitchService, // your service binding, based off of BaseMediaService
    updaters: { // reactStateKey <> serviceKey bindings which happen on your service changes)
      'name': 'name',
      'status' : 'status',
      'muted': 'isMuted',
      'playing': 'isPlaying'
    },
    notPlayingIcon: faVideoSlash, // when not playing for status
    sourceIcon: faTwitch, // icon for links
    getDescription: (sourceState) => {/*...*/}, // get description
    getURL: (sourceState) =>  {/*...*/}, // get external link url for bottom player links
    getDisabled: (sourceState, mode) =>  {/*...*/}, // get disabled
    stop: function(serviceInstance)  {/*...*/}, // define how to stop (pause)
    mute: function(serviceInstance)  {/*...*/}, //define how to mute 
    unmute: function(serviceInstance)  {/*...*/}, //define how to unmute 
    init: function (serviceInstance, createdRef, mode, config) {/*...*/}, //define how to init (refs, polling, setup) 
  },  
  radio: {/* same as twitch but with diff build out...*/}
};
```


### 1.1.2. Sources

*SOURCES:* these are an array of sources, defining the soure type and other context specif configuration like channel name for twitch or streamUrl for radio

*UPDATE: June 10, 2020*. Twitch changed its requirements for using embeds, "you’ll need to begin including a list of the domains your content appears on using the parent parameter when initializing your Twitch embed". [Read more about it here](https://discuss.dev.twitch.tv/t/twitch-embedded-player-updates-in-2020/23956). You'll also need to server from https:// unless your localhost.

```js
const SOURCES = [
  {
    id: 'twitch-1',
    type: 'twitch',
    channel: 'malxxxxx',
    showLink: true // show link in bottom player links
  },
  {
    id: 'radio-1',
    type: 'radio',
    streamUrl: '...', // stream url
    statusUrl: '...', //link to json to poll to show status, based off of cloudrad.io's status json api
  },
  {
    id: 'twitch-2',
    type: 'twitch',
    channel: 'malxxxxx2',
  },
   {
    id: 'twitch-3',
    type: 'twitch',
    channel: 'insomniac',
  }
];
```

### 1.1.3. Modes

*MODES:* this defines the different modes which are switched via url / dropdown on the page. important attributes are `on` which tell the player to have that source shown and playing..and `muted` which will mute any `on` sources. the remaining would be effective shut off in that mode (paused and muted)

```js
// here we define three modes
const MODES = [
  {
    name: 'twitch',
    description: 'Twitch mode (Gameplay Video/Audio/Discord Talk )',
    on: ['twitch-1', 'twitch-3'],
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
    on: ['twitch-3'],
  },
];

```

## 1.2. Skinning

Skinning has not been setup to be configurable, but may be done in the future. Let me know if you are interested.