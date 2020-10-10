import React from 'react';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  NavLink
} from 'react-router-dom';
import Config from './screens/Config';
import Videos from './screens/Videos';
import './styles.scss';

const App = props => (
  <Router>
    <div className={'header'}>
      <h1>vidserve</h1>
      <div className={'nav'}>
        <NavLink exact to={'/'}>Videos</NavLink>
        <NavLink exact to={'/config'}>Config</NavLink>
      </div>
    </div>
    <Switch>
      <Route path={'/config'}>
        <Config />
      </Route>
      <Route path={'/'}>
        <Videos />
      </Route>
    </Switch>
  </Router>
);

export default App;
