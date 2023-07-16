import React, {Component, createRef} from 'react';
import axios from 'axios';
import { disableBodyScroll, clearAllBodyScrollLocks } from 'body-scroll-lock';
import './styles.scss';

// Returns a human readable size from number of bytes
const prettifyByteSize = (bytes) => {
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

  return (bytes / Math.pow(1024, i)).toFixed(2) * 1 + ' ' + sizes[i];
}

const renderDriveList = (drives, clickHandle, targetRef) => {
  if (drives.length) {
    return (
      <ul ref={targetRef} className={'drivelist'}>
        {
          drives.map((drive, index) => {
            if (drive.mountpoints.length) {
              return (
                <li key={index} className={'list-item'}>
                  <button data-drive={drive.mountpoints[0].path} onClick={clickHandle}>
                    {drive.mountpoints[0].label} - {prettifyByteSize(drive.size)}
                  </button>
                </li>
              );
            }
            }
          )
        }
      </ul>
    )
  }
  else {
    return (
      <div className={'message-wrapper'}>
        <p>no drives</p>
      </div>
    );
  }
};

class Config extends Component {
  constructor(props) {
    super(props);

    this.state = {
      drives: [],
      hasDriveListLoaded: false,
      isDriveListLoading: false,
      homePath: '',
      pin: '',
    };

    this.pollInterval;
    this.targetElement = createRef();
  }

  componentDidMount() {
    this.getDriveList();
    this.gethomePath();

    this.pollInterval = setInterval(() => this.getDriveList(), 5000);
  }

  componentWillUnmount() {
    clearAllBodyScrollLocks();
    clearInterval(this.pollInterval);
  }

  async getDriveList() {
    this.setState({isDriveListLoading: true});

    const response = await axios.get('/drivelist');

    this.setState({
      drives: response.data,
      hasDriveListLoaded: true,
      isDriveListLoading: false
    });

    if (response.data.status === 'ok') {
      this.setState({
        drives: response.data.drives,
        hasDriveListLoaded: true,
        isDriveListLoading: false
      });

      if (response.data.drives) {
        disableBodyScroll(this.targetElement.current);
      }
    }
    else {
      this.setState({
        drives: [],
        hasDriveListLoaded: true,
        isDriveListLoading: false
      });
    }
  }

  handleHomePathChange(e) {
    this.setState({homePath: e.target.value});
  }

  handlePinChange(e) {
    this.setState({pin: e.target.value});
  }

  handleDriveSelect(e) {
    if (confirm('Change drive?')) {
      this.setState({
        homePath: e.target.getAttribute('data-drive')
      }, () => this.savehomePath(e));
    }
  }

  confirmSavehomePath(e) {
    if (confirm('Change home path?')) {
      this.savehomePath(e);
    }
  }

  confirmSavePin(e) {
    if (confirm('Update pin code?')) {
      this.savePin(e);
    }
  }

  async gethomePath() {
    const response = await axios.get('/homePath');

    this.setState({homePath: response.data});
  }

  async savehomePath(e) {
    e.preventDefault();
    await axios.post('/homePath', {homePath: this.state.homePath});
  }

  async savePin(e) {
    e.preventDefault();
    await axios.post('/setpin', {pin: this.state.pin});
  }

  render() {
    return (
      <div className={'config-container'}>
        <div className={'form-wrapper'}>
          <div className={'form-header'}>
            <h2>
              pin code
            </h2>
          </div>

          <form
            className={'form'}
            onSubmit={(e) => this.confirmSavePin(e)}
          >
            <input
              onChange={(e) => this.handlePinChange(e)}
              placeholder={'pin'}
              type={'password'}
              inputmode={'numeric'}
              maxlength="4"
              pattern="[0-9]{4}"
              value={this.state.pin}
            />
            <button type={'submit'}>save</button>
          </form>
        </div>

        <div className={'form-wrapper'}>
          <div className={'form-header'}>
            <h2>
              home directory
            </h2>
          </div>

          <form
            className={'form'}
            onSubmit={(e) => this.confirmSavehomePath(e)}
          >
            <input
              onChange={(e) => this.handleHomePathChange(e)}
              placeholder={'home search path'}
              type={'text'}
              value={this.state.homePath}
            />
            <button type={'submit'}>save</button>
          </form>
        </div>

        <div className={'list'}>
          <div className={'list-header'}>
            <h2>
              drives&nbsp;<small>({this.state.drives.length})</small>
            </h2>
          </div>

          <div className={'list-body'}>
            {
              (this.state.isDriveListLoading && !this.state.hasDriveListLoaded) ?
                <div className={'message-wrapper'}><p>loading...</p></div> :
                renderDriveList(this.state.drives, this.handleDriveSelect.bind(this), this.targetElement)
            }
          </div>
        </div>
      </div>
    );
  }
}

export default Config;
