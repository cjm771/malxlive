import React, {useEffect} from 'react';
import './scss/App.scss';
import Player from './components/Player.js';
function App() {


  return (
    <div className="App">
        <marquee class="welcome-marquee"><img src="/assets/welcome.jpg" alt="Welcome-text"></img></marquee>
        <Player></Player>
    </div>
  );
}

export default App;
                                                                         