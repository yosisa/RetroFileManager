'use strict';

import React from 'react';
import classnames from 'classnames';
import moment from 'moment';
import { humanBytes, modeToString } from './utils';

export class FilePane extends React.Component {
  componentDidUpdate() {
    let fixedHeight = this.refs.paneHeader.getBoundingClientRect().height * 2;
    fixedHeight += this.refs.header.getBoundingClientRect().height;
    this.refs.container.style.height = `calc(100vh - ${fixedHeight}px)`;
    this.props.redrawCursor();
  }

  render() {
    const { path, items } = this.props;
    return (
      <div>
        <div ref="paneHeader" className="pane-header">{path}</div>
        <div ref="header" className="table table-header">
          <div className="table-cell col-name">Name</div>
          <div className="table-cell col-timestamp">Timestamp</div>
          <div className="table-cell col-size text-right">Size</div>
          <div className="table-cell col-owner">Owner</div>
          <div className="table-cell col-mode">Mode</div>
        </div>
        <div ref="container" className="table-container">
          {items.map(item => <FilePaneRow key={item.name} item={item} />)}
        </div>
      </div>
    );
  }
}

class FilePaneRow extends React.Component {
  render() {
    const { item } = this.props;
    const size = parseInt(item.size, 10).toLocaleString('en');
    const mtime = moment.unix(item.mod_time).format('YYYY/MM/DD HH:mm:ss');
    const mode = modeToString(item.mode);
    const iconClass = classnames({
      'fa': true,
      'fa-folder': item.is_dir,
      'fa-file-o': !item.is_dir
    });
    return (
      <div className="table">
        <div className="table-cell col-name text-ellipsis">
          <i className={iconClass}></i>
          {item.name}
        </div>
        <div className="table-cell col-timestamp text-ellipsis">{mtime}</div>
        <div className="table-cell col-size text-ellipsis text-right">{size}</div>
        <div className="table-cell col-owner text-ellipsis">{item.owner}</div>
        <div className="table-cell col-mode text-ellipsis">{mode}</div>
      </div>
    );
  }
}

export class FilePaneFooter extends React.Component {
  render() {
    const { selection, items, diskUsage } = this.props;
    const keys = Object.keys(selection);
    const size = keys.reduce((acc, key) => {
      const item = selection[key];
      return (!item.is_dir) ? acc + parseInt(item.size, 10) : acc;
    }, 0);

    return (
      <div ref="footer" className="pane-footer">
        <div>
          {(() => {
            if (keys.length > 0) {
              return `${keys.length} / ${items} items selected (${humanBytes(size)})`;
            } else if (items > 0) {
              return `${items} items`;
            }
            return '';
          })()}
        </div>
        <div>
          {(() => {
            if (diskUsage.size) {
              return `${humanBytes(diskUsage.free)} / ${humanBytes(diskUsage.size)} free`;
            }
            return '';
        })()}
        </div>
      </div>
    );
  }
}

export class Prompt extends React.Component {
  constructor(props) {
    super(props);
    this.state = {input: props.input};
  }

  handleChange(ev) {
    this.setState({input: ev.target.value});
  }

  handleKeyDown(ev) {
    if (ev.keyCode === 13) {
      ev.preventDefault();
      ev.stopPropagation();
      this.props.actionHandler(this.props.handler, this.state.input);
    }
  }

  componentDidMount() {
    const windowWidth = document.body.getBoundingClientRect().width;
    const promptWidth = 700;
    const left = (windowWidth - promptWidth) / 2;
    const { prompt, input } = this.refs;
    prompt.style.width = `${promptWidth}px`;
    prompt.style.left = `${left}px`;
    input.focus();
    input.setSelectionRange(0, this.state.input.length);
  }

  render() {
    return (
      <div ref="prompt" id="prompt">
        <div id="prompt-title">{this.props.title}</div>
        <div id="prompt-input">
          <input
             ref="input"
             type="text"
             value={this.state.input}
             onChange={this.handleChange.bind(this)}
             onKeyDown={this.handleKeyDown.bind(this)}
             />
        </div>
      </div>
    );
  }
}
