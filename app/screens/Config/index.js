import React, {Component} from 'react';
import axios from 'axios';
import './styles.scss';

// Returns a human readable size from number of bytes
const prettifyByteSize = (bytes) => {
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

  return (bytes / Math.pow(1024, i)).toFixed(2) * 1 + ' ' + sizes[i];
}

const renderDriveList = (drives, clickHandle) => {
  if (drives.length) {
    return (
      <ul className={'drivelist'}>
        {drives.map((drive, index) =>
          <li key={index} className={'list-item'}>
            <button data-drive={drive.device} onClick={clickHandle}>
              {drive.device} - {prettifyByteSize(drive.size)}
            </button>
          </li>
        )}
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
      videoPath: '',
      pin: '',
    };

    this.pollInterval;
  }

  componentDidMount() {
    this.getDriveList();
    this.getVideoPath();

    this.pollInterval = setInterval(() => this.getDriveList(), 5000);
  }

  componentWillUnmount() {
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
  }

  handleVideoPathChange(e) {
    this.setState({videoPath: e.target.value});
  }

  handlePinChange(e) {
    this.setState({pin: e.target.value});
  }

  handleDriveSelect(e) {
    if (confirm('Change drive?')) {
      this.setState({
        videoPath: e.target.getAttribute('data-drive')
      }, () => this.saveVideoPath(e));
    }
  }

  confirmSaveVideoPath(e) {
    if (confirm('Change video path?')) {
      this.saveVideoPath(e);
    }
  }

  confirmSavePin(e) {
    if (confirm('Update pin code?')) {
      this.savePin(e);
    }
  }

  async getVideoPath() {
    const response = await axios.get('/videopath');

    this.setState({videoPath: response.data});
  }

  async saveVideoPath(e) {
    e.preventDefault();
    // await axios.post('/videopath', {videoPath: this.state.videoPath});
    await axios.post('/mountdrive', {device: this.state.videoPath});
  }

  async savePin(e) {
    e.preventDefault();
    await axios.post('/setpin', {pin: this.state.pin});
  }

  render() {
    return (
      <div className={'config-container'}>
        <div className={'form-wrapper'}>
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
          <form
            className={'form'}
            onSubmit={(e) => this.confirmSaveVideoPath(e)}
          >
            <input
              onChange={(e) => this.handleVideoPathChange(e)}
              placeholder={'video search path'}
              type={'text'}
              value={this.state.videoPath}
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
                renderDriveList(this.state.drives, this.handleDriveSelect.bind(this))
            }
          </div>
        </div>
      </div>
    );
  }
}

export default Config;
