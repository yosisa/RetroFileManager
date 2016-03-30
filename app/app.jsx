'use strict';

import 'normalize.css/normalize.css';
import 'font-awesome/css/font-awesome.css';
import './app.css';

import { createStore } from 'redux';
import appReducer from './reducers';
import { addClass, removeClass, forEachElement } from './utils';

const store = createStore(appReducer);

function scrollToCursor() {
  const row = document.querySelector('.cursor');
  const pane = row.parentNode;
  const rowRect = row.getBoundingClientRect();
  const paneRect = pane.getBoundingClientRect();
  if (paneRect.bottom < rowRect.bottom) {
    pane.scrollTop = row.offsetTop - row.clientHeight * 2;
  } else if (paneRect.top > rowRect.top) {
    pane.scrollTop = row.offsetTop - (pane.clientHeight - rowRect.height);
  }
}

import React from 'react';
import ReactDOM from 'react-dom';
import { Provider, connect } from 'react-redux';
import { createSelector } from 'reselect';
import { LeftFilePane, LeftFilePaneFooter, RightFilePane, RightFilePaneFooter, Prompt } from './containers';

class App extends React.Component {
  render() {
    return (
      <div>
        <div className="columns">
          <div id="left-pane" className="pane">
            <LeftFilePane />
            <LeftFilePaneFooter />
          </div>
          <div id="right-pane" className="pane">
            <RightFilePane />
            <RightFilePaneFooter />
          </div>
        </div>
        {this.props.show ? <Prompt /> : ''}
      </div>
    );
  }
}

const AppC = connect(state => {
  return {
    show: state.prompt.show
  };
})(App);

function render(store) {
  ReactDOM.render(
    <Provider store={store}>
      <AppC />
    </Provider>,
    document.getElementById('app')
  );
}
render(store);

function cursorHandler(store) {
  const fn = createSelector([
    (state) => state.focusedPane,
    (state) => state[state.focusedPane].cursor,
    (state) => state[state.focusedPane].cursorGen,
    (state) => state[state.focusedPane].items
  ], (pane, cursor, gen, items) => {
    forEachElement('.cursor', row => {
      removeClass(row, 'cursor');
    });
    var el = document.querySelector(`#${pane}-pane .table-container .table:nth-child(${cursor+1})`);
    if (el) {
      addClass(el, 'cursor');
      scrollToCursor();
    }
  });
  return () => {
    fn(store.getState());
  };
}
store.subscribe(cursorHandler(store));

function selectionHandler(store) {
  const fn = createSelector([
    (state) => state.focusedPane,
    (state) => state[state.focusedPane].selection
  ], (pane, selection) => {
    forEachElement(`#${pane}-pane .table-container .table`, row => {
      if (selection.hasOwnProperty(row.children[0].textContent)) {
        addClass(row, 'selected');
      } else {
        removeClass(row, 'selected');
      }
    });
  });
  return () => {
    fn(store.getState());
  };
}
store.subscribe(selectionHandler(store));

const ipc = require('electron').ipcRenderer;

function stateChangedHandler(store) {
  const fn = createSelector([
    (state) => state.left.path,
    (state) => state.right.path
  ], (leftPath, rightPath) => {
    ipc.send('state-changed', {
      leftPath,
      rightPath
    });
  });
  return () => {
    fn(store.getState());
  };
}
store.subscribe(stateChangedHandler(store));

import { gotoDirectory } from './actions';

const storage = require('remote').require('./lib/storage');
const appState = storage.get('appState');
gotoDirectory(store, appState.leftPath || '~', '', 'left');
gotoDirectory(store, appState.rightPath || '~', '', 'right');

import * as keymap from './keymap';
keymap.init(store);

const config = storage.get('config') || {fontSize: 14};
const style = document.createElement('style');
style.textContent = `
body {
  font-size: ${config.fontSize}px;
}
.col-name {
}
.col-timestamp {
  width: 21ch;
}
.col-size {
  width: 16ch;
}
.col-owner {
  width: 11ch;
}
.col-mode {
  width: 13ch;
}
`;
document.head.appendChild(style);
