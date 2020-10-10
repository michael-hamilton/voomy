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
    <div className={'app-container'}>
      <div className={'header'}>
        <h1>vidserve</h1>
        <div className={'nav'}>
          <NavLink exact to={'/'}>videos</NavLink>
          <NavLink exact to={'/config'}>config</NavLink>
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
    </div>
  </Router>
);

export default App;
