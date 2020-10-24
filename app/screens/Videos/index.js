import React, {Component} from 'react';
import axios from 'axios';
import ReactPlayer from 'react-player';
import './styles.scss';

const renderFileList = (files, selectedID, searchTerm, handleClick) => {
  if (files.length) {
    return (
      <ul className={'filelist'}>
        {
          files.filter(video =>
            decodeURI(video.toString())
              .toLowerCase()
              .indexOf(searchTerm.toLowerCase())
            !== -1
          ).map((file, index) => (
            <li
              key={index}
              className={`list-item ${selectedID == index ? 'active' : ''}`}
            >
              <a data-index={index} data-isdirectory={file.isDirectory} href={file.isDirectory ? file.path : file.file} onClick={handleClick}>
                {file.name}
                {
                  file.isDirectory ?
                    <span className={'directoryIcon'}>&#8627;</span> :
                    null
                }
              </a>
            </li>
          ))
        }
      </ul>
    )
  }
  else {
    return (
      <div className={'message-wrapper'}>
        <p>no videos</p>
      </div>
    );
  }
};

class Videos extends Component {
  constructor(props) {
    super(props);

    this.state = {
      directory: '',
      homePath: '',
      files: [],
      hasFileListLoaded: false,
      isFileListLoading: false,
      searchTerm: '',
      selectedFileID: null,
      selectedFileURL: '#'
    };

    this.pollInterval;
  }

  componentDidMount() {
    this.getDirectory();
    this.updateHomePath();

    this.pollInterval = setInterval(() => this.getDirectory(), 5000);
  }

  componentWillUnmount() {
    clearInterval(this.pollInterval);
  }

  async getDirectory() {
    this.setState({isFileListLoading: true});

    let query = '';
    if (this.state.directory) {
      query = `?path=${encodeURI(this.state.directory)}`;
    }

    const response = await axios.get(`/directory${query}`);

    this.setState({
      hasFileListLoaded: true,
      isFileListLoading: false,
      files: response.data.files,
      directory: response.data.newPath
    });
  }

  async upDirectory() {
    this.setState({isFileListLoading: true});

    let query = '';
    if (this.state.directory) {
      query = `?path=${encodeURI(this.state.directory)}&up=true`;
    }

    const response = await axios.get(`/directory${query}`);

    this.setState({
      isFileListLoading: false,
      files: response.data.files,
      directory: response.data.newPath,
      selectedFileID: null,
    });
  }

  handleSearch(e) {
    this.setState({searchTerm: e.target.value});
  }

  playVideo(selectedFileID, selectedFileURL) {
    this.setState({selectedFileID, selectedFileURL});
  }

  async updateHomePath() {
    const response = await axios.get('/homepath');
    this.setState({homePath: response.data});
  }

  handleItemSelect(e) {
    e.preventDefault();
    if (e.target.getAttribute('data-isdirectory') === 'true') {
      this.setState({
        directory: e.target.getAttribute('href')
      }, () => {
        this.getDirectory();
      });
    }
    else {
      this.playVideo(e.target.getAttribute('data-index'), e.target.href)
    }
  }

  render() {
    return (
      <div className={'videos-container'}>
        <div className={'list'}>
          <div className={'list-header'}>
            <h2>videos&nbsp;<small>({this.state.files.length})</small></h2>
            <div className={'search-wrapper'}>
              <input type={'text'} placeholder={'search...'} onChange={(e) => this.handleSearch(e)} />
            </div>
          </div>

          <div className={'list-body'}>
            {
              (this.state.isFileListLoading && !this.state.hasFileListLoaded) ?
                <div className={'message-wrapper'}><p>loading...</p></div> :
                renderFileList(this.state.files, this.state.selectedFileID, this.state.searchTerm, this.handleItemSelect.bind(this))
            }
            {
              this.state.homePath !== this.state.directory ?
                <button className={'up-dir-button'} onClick={() => this.upDirectory()}>&#8624;</button> :
                null
            }
          </div>
        </div>

        <div className={'videoplayer-wrapper'}>
          <ReactPlayer playing={true} playsinline url={this.state.selectedFileURL} controls height={'100%'} width={'100%'} />
        </div>
      </div>
    );
  }
}

export default Videos;
