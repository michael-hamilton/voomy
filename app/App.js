import React, {Component} from 'react';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  NavLink,
} from 'react-router-dom';
import { BiCog, BiFilm } from 'react-icons/bi';
import Config from './screens/Config';
import Files from './screens/Files';
import Login from './screens/Login';
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
                <h1>voomy</h1>
                <div className={'nav'}>
                  <NavLink exact to={'/'}><BiFilm /></NavLink>
                  <NavLink exact to={'/config'}><BiCog /></NavLink>
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
                  <Files/> :
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
