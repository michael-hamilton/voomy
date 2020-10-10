import React, {Component} from 'react';
import axios from 'axios';
import ReactPlayer from 'react-player';
import './styles.scss';

const renderVideoList = (videos, selectedID, handleClick) => {
  return (
    <ul className={'videolist'}>
      {
        videos.map((video, index) => (
          <li key={index} className={`list-item ${selectedID == index ? 'active' : ''}`}>
            <a data-index={index} href={`/${video}`} onClick={handleClick}>
              {decodeURI(video)}
            </a>
          </li>
        ))
      }
    </ul>
  )
};

class Videos extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isVideoListLoading: false,
      selectedVideoID: null,
      selectedVideoURL: '#',
      videos: []
    };
  }

  componentDidMount() {
    this.getVideoList();
  }

  async getVideoList() {
    this.setState({isVideoListLoading: true});

    const response = await axios.get(`/videolist`);

    this.setState({videos: response.data, isVideoListLoading: false});
  }

  playVideo(e) {
    e.preventDefault();
    this.setState({
        selectedVideoID: e.target.getAttribute('data-index'),
        selectedVideoURL: e.target.href
    });
  }

  render() {
    return (
      <div className={'videos-container'}>
        <div className={'list'}>
          <div className={'list-header'}>
            <h2>videos</h2>
            <button onClick={() => this.getVideoList()}>refresh</button>
          </div>
          <div className={'list-body'}>
            {
              this.state.isVideoListLoading ?
                <p>loading...</p> :
                renderVideoList(this.state.videos, this.state.selectedVideoID, this.playVideo.bind(this))
            }
          </div>
        </div>
        <div className={'videoplayer-wrapper'}>
          <ReactPlayer url={this.state.selectedVideoURL} controls height={'100%'} width={'100%'} />
        </div>
      </div>
    );
  }
}

export default Videos;
