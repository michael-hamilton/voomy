import React, {useState, useEffect} from 'react';
import {
  BrowserRouter as Router,
  Switch,
  Redirect,
  Route,
  NavLink,
} from 'react-router-dom';
import Config from './screens/Config';
import Login from './screens/Login';
import Videos from './screens/Videos';
import './styles.scss';

const App = props => {
  const [isLoggedIn, setLoggedIn] = useState(false);

  return (
    <Router>
      <div className={'app-container'}>
        {
          isLoggedIn ?
            <div className={'header'}>
              <h1>vidserve</h1>
              <div className={'nav'}>
                <NavLink exact to={'/'}>videos</NavLink>
                <NavLink exact to={'/config'}>config</NavLink>
              </div>
            </div> :
            null
        }
        <Switch>
          <Route path={'/config'}>
            {
              isLoggedIn ?
                <Config /> :
                <Login
                  login={() => setLoggedIn(true)}
                  isLoggedIn={isLoggedIn}
                />
            }
          </Route>
          <Route path={'/'}>
            {
              isLoggedIn ?
                <Videos /> :
                <Login
                  login={() => setLoggedIn(true)}
                  isLoggedIn={isLoggedIn}
                />
            }
          </Route>
        </Switch>
      </div>
    </Router>
  );
}

export default App;
