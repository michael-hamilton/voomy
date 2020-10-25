import React, {Component} from 'react';
import axios from 'axios';
import ReactPlayer from 'react-player';
import './styles.scss';

const renderFileList = (files, selectedID, searchTerm, handleClick) => {
  if (files.length) {
    return (
      <ul className={'filelist'}>
        {
          files.filter(file =>
            decodeURI(file.name.toString())
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
        <p>no files</p>
      </div>
    );
  }
};

class Files extends Component {
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

    if (response.data.status === 'ok') {
      this.setState({
        hasFileListLoaded: true,
        isFileListLoading: false,
        files: response.data.files,
        directory: response.data.newPath
      });
    }
    else {
      this.setState({
        hasFileListLoaded: true,
        isFileListLoading: false,
        files: [],
      });
    }
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

  playFile(selectedFileID, selectedFileURL) {
    this.setState({selectedFileID, selectedFileURL});
  }

  async updateHomePath() {
    const response = await axios.get('/homepath');
    this.setState({homePath: response.data});
  }

  clearSearch() {
    this.setState({searchTerm: ''});
  }

  handleItemSelect(e) {
    e.preventDefault();
    if (e.target.getAttribute('data-isdirectory') === 'true') {
      this.setState({
        directory: e.target.getAttribute('href')
      }, () => {
        this.clearSearch();
        this.getDirectory();
      });
    }
    else {
      this.playFile(e.target.getAttribute('data-index'), e.target.href)
    }
  }

  render() {
    return (
      <div className={'files-container'}>
        <div className={'list'}>
          <div className={'list-header'}>
            <h2>files&nbsp;<small>({this.state.files.length})</small></h2>
            <div className={'search-wrapper'}>
              <input type={'text'} placeholder={'search...'} value={this.state.searchTerm} onChange={(e) => this.handleSearch(e)} />
              {
                this.state.searchTerm ?
                  <button className={'clear-search'} onClick={() => this.clearSearch()}>
                    x
                  </button> :
                  null
              }
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

        <div className={'fileviewer-wrapper'}>
          <ReactPlayer playing={true} playsinline url={this.state.selectedFileURL} controls height={'100%'} width={'100%'} />
        </div>
      </div>
    );
  }
}

export default Files;
