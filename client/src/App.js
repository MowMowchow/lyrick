import React, {useState} from 'react';
import { HashRouter as Router, Switch, Route } from 'react-router-dom';
import Lyrics from './components/Lyrics/Lyrics';
import Home from './components/Home/Home';
import './App.css';

function App() {
  return (
    <div className="App">
      <Router>
        <Switch>
          <Route path="/" exact component={Home}/>
          
          <Route path="/lyrics" exact component={Lyrics}/>
        </Switch>
      </Router>
    </div>
  );
}

export default App;
