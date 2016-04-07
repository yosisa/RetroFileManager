'use strict';

import React from 'react';
import ReactList from 'react-list';
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
    const { path, items, ready } = this.props;
    var icons = '';
    if (ready === false) {
      icons = <i className="fa fa-spinner fa-pulse"></i>;
    }
    return (
      <div>
        <div ref="paneHeader" className="pane-header">
          <div className="pane-header-path">{path}</div>
          <div className="pane-header-status">
            {icons}
          </div>
        </div>
        <div ref="header" className="table table-header">
          <div className="table-cell col-name">Name</div>
          <div className="table-cell col-timestamp">Timestamp</div>
          <div className="table-cell col-size text-right">Size</div>
          <div className="table-cell col-owner">Owner</div>
          <div className="table-cell col-mode">Mode</div>
        </div>
        <div ref="container" className="table-container">
          <ReactList ref="list"
             itemRenderer={(i, key) => <FilePaneRow key={key} item={items[i]} index={i} />}
            length={items.length}
            type="uniform"
            />
        </div>
      </div>
    );
  }
}

class FilePaneRow extends React.Component {
  render() {
    const { item, index } = this.props;
    let name = item.name;
    const level = (name.match(/\//g) || []).length;
    if (level > 0) {
      name = name.slice(name.lastIndexOf('/') + 1);
    }
    const size = parseInt(item.size, 10).toLocaleString('en');
    const mtime = moment.unix(item.mod_time).format('YYYY/MM/DD HH:mm:ss');
    const mode = modeToString(item.mode);
    const tableClass = classnames({
      table: true,
      even: index % 2 === 1 // index start with 0
    });
    const iconClass = classnames({
      'fa': true,
      'fa-folder': item.is_dir,
      'fa-file-o': !item.is_dir
    });
    return (
      <div className={tableClass} data-index={index} data-full-name={item.name}>
        <div className="table-cell col-name text-ellipsis">
          <i className={iconClass} style={{marginLeft: `${level*10}px`}}></i>
          {name}
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
    const input = ev.target.value;
    this.setState({input});
    if (this.props.onchange) {
      this.props.actionHandler(this.props.handler, input, this.props.params, true);
    }
  }

  handleKeyDown(ev) {
    if (ev.keyCode === 13) {
      ev.preventDefault();
      ev.stopPropagation();
      this.props.actionHandler(this.props.handler, this.state.input, this.props.params);
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
