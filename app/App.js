import React, {Component} from 'react';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  NavLink,
} from 'react-router-dom';
import Config from './screens/Config';
import Login from './screens/Login';
import Videos from './screens/Videos';
import './styles.scss';

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isLoggedIn: false,
    };
  }

  render() {
    return (
      <Router>
        <div className={'app-container'}>
          {
            this.state.isLoggedIn ?
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
                this.state.isLoggedIn ?
                  <Config/> :
                  <Login login={() => this.setState({isLoggedIn: true})} />
              }
            </Route>
            <Route path={'/'}>
              {
                this.state.isLoggedIn ?
                  <Videos/> :
                  <Login login={() => this.setState({isLoggedIn: true})} />
              }
            </Route>
          </Switch>
        </div>
      </Router>
    );
  }
}

export default App;
