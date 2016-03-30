'use strict';

import { connect } from 'react-redux';
import { leftVisibleItems, rightVisibleItems } from './utils';
import * as views from './views.jsx';
import { CLOSE_PROMPT, REDRAW_CURSOR } from './actions';

function filePaneDispatcher(dispatch) {
  return {
    redrawCursor: () => {
      dispatch({type: REDRAW_CURSOR});
    }
  };
}

export const LeftFilePane = connect(state => {
  state = state.left;
  return {
    path: state.path,
    items: leftVisibleItems(state)
  };
}, filePaneDispatcher)(views.FilePane);

export const LeftFilePaneFooter = connect(state => {
  state = state.left;
  return {
    diskUsage: state.diskUsage,
    items: leftVisibleItems(state).length,
    selection: state.selection
  };
})(views.FilePaneFooter);

export const RightFilePane = connect(state => {
  state = state.right;
  return {
    path: state.path,
    items: rightVisibleItems(state)
  };
}, filePaneDispatcher)(views.FilePane);

export const RightFilePaneFooter = connect(state => {
  state = state.right;
  return {
    diskUsage: state.diskUsage,
    items: rightVisibleItems(state).length,
    selection: state.selection
  };
})(views.FilePaneFooter);

import { promptHandlers } from './keymap';

export const Prompt = connect(state => {
  return {
    title: state.prompt.title,
    input: state.prompt.input,
    handler: state.prompt.handler
  };
}, dispatch => {
  return {
    actionHandler: (action, input) => {
      const fn = promptHandlers[action];
      if (fn) {
        if (fn(dispatch, input)) {
          return;
        }
      }
      dispatch({type: CLOSE_PROMPT});
    }
  };
})(views.Prompt);
