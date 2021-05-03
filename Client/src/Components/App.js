import React, { useState, useEffect } from 'react';
import { socket } from './socket';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import Join from './Join/Join';
import Chat from './Chat/Chat';


function App() {

  return (
    <Router>
      <Route path='/' exact component={ Join }></Route>
      <Route path='/chat' component={ Chat }></Route>
    </Router>
  );
}

export default App;