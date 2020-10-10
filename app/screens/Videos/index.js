import React, {Component} from 'react';
import axios from 'axios';
import './styles.scss';

const renderVideoList = videos => {
  return (
    <ul className={'videolist'}>
      {
        videos.map((video, index) => (
          <li key={index}>
            <a href={`/${video}`}>
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
      videos: [],
      isVideoListLoading: false,
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

  render() {
    return (
      <div className={'container'}>
        <div className={'list'}>
          <div className={'list-header'}>
            <h2>videos</h2>
            <button onClick={() => this.getVideoList()}>refresh</button>
          </div>
          <div className={'list-body'}>
            {
              this.state.isVideoListLoading ?
                <p>loading...</p> :
                renderVideoList(this.state.videos)
            }
          </div>
        </div>
      </div>
    );
  }
}

export default Videos;
