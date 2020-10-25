import React, {Component} from 'react';
import axios from "axios";
import './styles.scss';

class Login extends Component {
  constructor(props) {
    super(props);

    this.state = {
      pin: '',
    };
  }

  handlePinChange(e) {
    this.setState({pin: e.target.value});
  }

  async login(e) {
    e.preventDefault();
    const response = await axios.post('/checkpin', {pin: this.state.pin});
    if (response.data === 'ok') {
      this.props.login();
    }
    else {
      alert('Incorrect pin.');
    }
  }

  render() {
    return (
      <div className={'login-container'}>
        <div className={'login-form-wrapper'}>
          <h1 className={'login-heading'}>vidserve</h1>
          <form
            className={'form'}
            onSubmit={(e) => this.login(e)}
          >
            <div className={'pin-wrapper'}>
              <input
                onChange={(e) => this.handlePinChange(e)}
                placeholder={'pin'}
                type={'password'}
                inputMode={'numeric'}
                maxLength="4"
                pattern="[0-9]{4}"
                value={this.state.pin}
              />
              <button type={'submit'}>login</button>
            </div>
          </form>
        </div>
      </div>
    );
  }
}

export default Login;
