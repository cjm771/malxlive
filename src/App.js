import React from 'react';
import './scss/App.scss';
import Player from './components/Player.js';
function App() {


  return (
    <div className="App">
        <marquee className="welcome-marquee"><img src="/assets/welcome.jpg" alt="Welcome-text"></img></marquee>
        <Player></Player>
    </div>
  );
}

export default App;
                                                                         