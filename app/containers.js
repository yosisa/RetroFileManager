'use strict';

import { connect } from 'react-redux';
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
    items: state.items,
    ready: state.ready
  };
}, filePaneDispatcher, null, {withRef: true})(views.FilePane);

export const LeftFilePaneFooter = connect(state => {
  state = state.left;
  return {
    diskUsage: state.diskUsage,
    items: state.items.length,
    selection: state.selection
  };
})(views.FilePaneFooter);

export const RightFilePane = connect(state => {
  state = state.right;
  return {
    path: state.path,
    items: state.items,
    ready: state.ready
  };
}, filePaneDispatcher, null, {withRef: true})(views.FilePane);

export const RightFilePaneFooter = connect(state => {
  state = state.right;
  return {
    diskUsage: state.diskUsage,
    items: state.items.length,
    selection: state.selection
  };
})(views.FilePaneFooter);

import { promptHandlers } from './keymap';

export const Prompt = connect(state => {
  return {
    title: state.prompt.title,
    input: state.prompt.input,
    handler: state.prompt.handler,
    onchange: state.prompt.onchange,
    params: state.prompt.params
  };
}, dispatch => {
  return {
    actionHandler: (action, input, params, keep) => {
      const fn = promptHandlers[action];
      if (fn) {
        if (fn(dispatch, input, params) || keep) {
          return;
        }
      }
      dispatch({type: CLOSE_PROMPT});
    }
  };
})(views.Prompt);
