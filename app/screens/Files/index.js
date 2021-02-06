import React, {Component, createRef, useState} from 'react';
import axios from 'axios';
import ReactPlayer from 'react-player';
import { disableBodyScroll, enableBodyScroll, clearAllBodyScrollLocks } from 'body-scroll-lock';
import { BiSubdirectoryLeft, BiTrash, BiArrowToLeft, BiEdit, BiFolder } from 'react-icons/bi';
import './styles.scss';

const renderFileList = (files, selectedID, searchTerm, targetRef, isEditMode, handleClick, handleChange, handleDelete) => {
  if (files.length) {
    const filteredFiles = files.filter(file =>
      decodeURI(file.name.toString())
        .toLowerCase()
        .indexOf(searchTerm.toLowerCase())
      !== -1
    );

    if (filteredFiles.length) {
      return (
        <ul ref={targetRef} className={`filelist ${isEditMode ? 'edit-mode' : ''}`}>
          {
            filteredFiles.map((file, index) => (
            <FileListItem
            key={file.name}
            index={index}
            isDirectory={file.isDirectory}
            file={file.file}
            name={file.basename}
            path={file.path}
            relativePath={file.relativePath}
            isEditMode={isEditMode}
            isSelected={selectedID == index}
            handleClick={handleClick}
            handleChange={handleChange}
            handleDelete={handleDelete}
            />
            ))
          }
        </ul>
      )
    }
    else {
      return (
        <div className={'message-wrapper'}>
          <p>no files found</p>
          <p><small>try searching for something else</small></p>
        </div>
      );
    }
  }
  else {
    return (
      <div className={'message-wrapper'}>
        <p>no files found</p>
        <p><small>try looking in a different folder</small></p>
      </div>
    );
  }
};

const FileListItem = (props) => {
  const [fileName, setFileName] = useState(props.name);

  return (
    <li
      className={`list-item ${props.isSelected ? 'active' : ''}`}
    >
      <a data-index={props.index} data-isdirectory={props.isDirectory} href={`${props.relativePath}/${props.file}`} onClick={props.handleClick}>
        { props.isEditMode ? <button className={'delete-button'} onClick={props.handleDelete}><BiTrash /></button> : null }
        { props.isEditMode ? <input className={'list-item-edit'} onChange={(e) => setFileName(e.target.value)} onBlur={props.handleChange} data-oldvalue={props.path} value={fileName} />: <span className={'list-item-title'}>{props.name}</span> }
        {
          props.isDirectory ?
            <BiFolder className={'directoryIcon'} /> :
            null
        }
      </a>
    </li>
  );
}

class Files extends Component {
  constructor(props) {
    super(props);

    this.state = {
      directory: '',
      homePath: '',
      files: [],
      hasFileListLoaded: false,
      isFileListLoading: false,
      isTouchingPlayer: false,
      searchTerm: '',
      selectedFileID: null,
      lastSelectedFileID: null,
      fileListLastYOffset: null,
      selectedFileURL: '#',
      editModeEnabled: false
    };

    this.pollInterval;
    this.targetElement = createRef();
  }

  componentDidMount() {
    this.getDirectory();
    this.updateHomePath();

    this.pollInterval = setInterval(() => this.getDirectory(), 5000);
  }

  componentWillUnmount() {
    clearAllBodyScrollLocks();
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

      if (response.data.files && !this.state.isTouchingPlayer) {
        disableBodyScroll(this.targetElement.current);
      }
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
      selectedFileID: this.state.lastSelectedFileID,
      lastSelectedFileID: null,
    }, () => {
      this.clearSearch();
      if (document.querySelector('.filelist')) {
        document.querySelector('.filelist').scrollTo(0, this.state.fileListLastYOffset);
      }
    });
  }

  handleSearch(e) {
    if (!this.state.fileListLastYOffset) {
      if (document.querySelector('.filelist')) {
        this.setState({
          fileListLastYOffset: document.querySelector('.filelist').scrollTop
        })
      }
    }

    this.setState({searchTerm: e.target.value}, () => {
      if (!this.state.searchTerm) {
        if (document.querySelector('.filelist')) {
          document.querySelector('.filelist').scrollTo(0, this.state.fileListLastYOffset);
        }
        this.setState({fileListLastYOffset: null});
      }
    });
  }

  handlePlayerTouch(isTouchingPlayer) {
    if (isTouchingPlayer) {
      this.setState({isTouchingPlayer});
      enableBodyScroll(this.targetElement.current)
    }
    else {
      this.setState({isTouchingPlayer});
      disableBodyScroll(this.targetElement.current);
    }
  }

  playFile(selectedFileID, selectedFileURL) {
    this.setState({selectedFileID, selectedFileURL, lastSelectedFileID: null});
  }

  async updateHomePath() {
    const response = await axios.get('/homepath');
    this.setState({homePath: response.data});
  }

  clearSearch(clearOffset = true) {
    this.setState({searchTerm: ''}, () => {
      if (document.querySelector('.filelist')) {
        document.querySelector('.filelist').scrollTo(0, this.state.fileListLastYOffset);
      }
      if (clearOffset) {
        this.setState({fileListLastYOffset: null});
      }
    });
  }

  handleItemSelect(e) {
    e.preventDefault();
    if (!this.state.editModeEnabled) {
      if (e.target.getAttribute('data-isdirectory') === 'true') {
        this.setState({
          directory: e.target.getAttribute('href'),
          editModeEnabled: false,
          lastSelectedFileID: this.state.selectedFileID,
          selectedFileID: null,
          fileListLastYOffset: document.querySelector('.filelist').scrollTop,
        }, () => {
          this.clearSearch(false);
          this.getDirectory();
        });
      } else {
        this.playFile(e.target.getAttribute('data-index'), e.target.href)
      }
    }
  }

  async handleItemRename(e) {
    const fileName = e.target.value;
    const oldFileName = e.target.getAttribute('data-oldvalue');
    if (fileName) {
      e.target.setAttribute('data-oldvalue', fileName);
      e.target.value = null;
      e.target.placeholder = fileName;
      await axios.post('/rename', {fileName: encodeURI(fileName), oldFileName: encodeURI(oldFileName)});
      await this.getDirectory();
    }
  }

  async handleItemDelete(e) {
    const fileName = e.target.parentElement.getAttribute('href');
    const isDirectory = e.target.parentElement.getAttribute('data-isdirectory') === 'true' ? true : false;
    if (confirm(`Are you sure you want to delete this ${isDirectory ? 'folder': 'file'}?`)) {
      await axios.post('/delete', {fileName, isDirectory});
      await this.getDirectory();
    }
  }

  render() {
    return (
      <div className={'files-container'}>
        <div className={'list'}>
          <div className={'list-header'}>
            <h2>files&nbsp;<small>({this.state.files.length})</small></h2>
            <button className={`edit-mode-button ${this.state.editModeEnabled ? 'active' : ''}`} onClick={() => this.setState({editModeEnabled: !this.state.editModeEnabled})}><BiEdit /></button>
            <div className={'search-wrapper'}>
              <input type={'text'} placeholder={'search...'} value={this.state.searchTerm} onChange={(e) => this.handleSearch(e)} />
              {
                this.state.searchTerm ?
                  <button className={'clear-search'} onClick={() => this.clearSearch()}>
                    <BiArrowToLeft />
                  </button> :
                  null
              }
            </div>
          </div>

          <div className={'list-body'}>
            {
              (this.state.isFileListLoading && !this.state.hasFileListLoaded) ?
                <div className={'message-wrapper'}><p>loading...</p></div> :
                renderFileList(this.state.files, this.state.selectedFileID, this.state.searchTerm, this.targetElement, this.state.editModeEnabled, this.handleItemSelect.bind(this), this.handleItemRename.bind(this), this.handleItemDelete.bind(this))
            }
            {
              this.state.homePath !== this.state.directory ?
                <button className={'up-dir-button'} onClick={() => this.upDirectory()}><BiSubdirectoryLeft /></button> :
                null
            }
          </div>
        </div>

        <div className={'fileviewer-wrapper'}>
          <ReactPlayer
            onTouchEnd={() => this.handlePlayerTouch(false)}
            onTouchStart={() => this.handlePlayerTouch(true)}
            playing={true} playsinline url={this.state.selectedFileURL} controls height={'100%'} width={'100%'} />
        </div>
      </div>
    );
  }
}

export default Files;
