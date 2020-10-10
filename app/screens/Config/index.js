import React, {Component} from 'react';
import axios from 'axios';
import './styles.scss';

const renderDriveList = drives => {
  return (
    <ul className={'drivelist'}>
      {drives.map((drive, index) => <li key={index}>{drive.device} {drive.mountpoints[0].path}</li>)}
    </ul>
  )
};

class Config extends Component {
  constructor(props) {
    super(props);

    this.state = {
      drives: [],
      isDriveListLoading: false,
      videoPath: '',
    };
  }

  componentDidMount() {
    this.getDriveList();
    this.getVideoPath();
  }

  async getDriveList() {
    this.setState({isDriveListLoading: true});

    const response = await axios.get('/drivelist');

    this.setState({drives: response.data, isDriveListLoading: false});
  }

  handleVideoPathChange(e) {
    this.setState({videoPath: e.target.value});
  }


  async getVideoPath() {
    const response = await axios.get('/videopath');

    this.setState({videoPath: response.data});
  }

  async updateVideoPath(e) {
    e.preventDefault();
    const response = await axios.post('/videopath', {videoPath: this.state.videoPath});
    console.log(response);
    alert('Updates video path.');
  }

  render() {
    return (
      <div className={'container'}>
        <div className={'videopath-form-wrapper'}>
          <form className={'form'} onSubmit={(e) => this.updateVideoPath(e)}>
            <input
              onChange={(e) => this.handleVideoPathChange(e)}
              placeholder={'video path'}
              type={'text'}
              value={this.state.videoPath}
            />
            <button type={'submit'}>save</button>
          </form>
        </div>
        <div className={'list'}>
          <div className={'list-header'}>
            <h2>drives</h2>
            <button onClick={() => this.getDriveList()}>refresh</button>
          </div>
          <div className={'list-body'}>
            {
              this.state.isDriveListLoading ?
                <p>loading...</p> :
                renderDriveList(this.state.drives)
            }
          </div>
        </div>
      </div>
    );
  }
}

export default Config;
