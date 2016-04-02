'use strict';

import 'normalize.css/normalize.css';
import 'font-awesome/css/font-awesome.css';
import './app.css';

import { createStore, applyMiddleware } from 'redux';
import rpc from './middleware/rpc';
import appReducer from './reducers';
import { addClass, removeClass, forEachElement } from './utils';

const store = createStore(appReducer, applyMiddleware(rpc));

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
  componentDidMount() {
    let state = store.getState();
    let pane = state.focusedPane;
    let cursor = state[pane].cursor;
    let selection = {
      left: state.left.selection,
      right: state.right.selection
    };

    const updateCursor = () => {
      forEachElement('.cursor', row => {
        removeClass(row, 'cursor');
      });

      var el = document.querySelector(`#${pane}-pane .table[data-index="${cursor}"]`);
      if (el) {
        addClass(el, 'cursor');
      }
    };

    const updateSelection = pane => {
      forEachElement(`#${pane}-pane .table`, row => {
        if (selection[pane].hasOwnProperty(row.dataset.fullName)) {
          addClass(row, 'selected');
        } else {
          removeClass(row, 'selected');
        }
      });
    };

    const leftPane = this.refs.leftPane.getWrappedInstance();
    const rightPane = this.refs.rightPane.getWrappedInstance();
    const lists = {
      left: leftPane.refs.list,
      right: rightPane.refs.list
    };

    const onScroll = (pane) => {
      return () => {
        if (pane === pane) {
          updateCursor();
          updateSelection(pane);
        }
      };
    };

    leftPane.refs.container.addEventListener('scroll', onScroll('left'));
    rightPane.refs.container.addEventListener('scroll', onScroll('right'));

    store.subscribe(() => {
      // update variables
      state = store.getState();
      pane = state.focusedPane;
      cursor = state[pane].cursor;
      selection[pane] = state[pane].selection;

      updateCursor();
      updateSelection(pane);

      // scroll
      const list = lists[pane];
      const [start, end] = list.getVisibleRange();
      if (cursor >= end) {
        list.scrollTo(cursor);
      } else if (cursor <= start) {
        list.scrollTo(Math.max(cursor - (end - start - 1)), 0);
      }
    });
  }

  render() {
    return (
      <div>
        <div className="columns">
          <div id="left-pane" className="pane">
            <LeftFilePane ref="leftPane" />
            <LeftFilePaneFooter />
          </div>
          <div id="right-pane" className="pane">
            <RightFilePane ref="rightPane" />
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

import { gotoDir } from './actions';

const storage = require('remote').require('./lib/storage');
const appState = storage.get('appState');
store.dispatch(gotoDir(appState.leftPath || '~', '', 'left'));
store.dispatch(gotoDir(appState.rightPath || '~', '', 'right'));

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
