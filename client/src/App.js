import React, {useState} from 'react';
import { HashRouter as Router, Switch, Route } from 'react-router-dom';
import Base from './components/Base/Base';
import Home from './components/Home/Home';
import './App.css';

function App() {
  return (
    <div className="App">
      <Router>
        <Switch>
          <Route path="/" exact component={Base}/>
          <Route path="/Home" exact component={Home}/>
        </Switch>
      </Router>
    </div>
  );
}

export default App;
