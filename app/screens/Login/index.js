import React, {Component} from 'react';
import './styles.scss';

const PIN_CODE = '1234';

class Login extends Component {
  constructor(props) {
    super(props);

    this.state = {
      pin: null,
    };
  }

  handlePasswordChange(e) {
    this.setState({pin: e.target.value});
  }

  async login(e) {
    e.preventDefault();
    if (this.state.pin === PIN_CODE) {
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
            <input
              onChange={(e) => this.handlePasswordChange(e)}
              placeholder={'pin'}
              type={'password'}
              inputmode={'numeric'}
              maxlength="4"
              pattern="[0-9]{4}"
              value={this.state.pin}
            />
            <button type={'submit'}>login</button>
          </form>
        </div>
      </div>
    );
  }
}

export default Login;
