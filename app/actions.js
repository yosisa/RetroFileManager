'use strict';

const actions = [
  'GOTO_DIR',
  'TOGGLE_DOTFILES',
  'REDRAW_CURSOR',
  'MOVE_CURSOR_DOWN',
  'MOVE_CURSOR_UP',
  'SELECT',
  'CLEAR_SELECTION',
  'TOGGLE_SELECTION',
  'TOGGLE_FILE_SELECTION',
  'SWITCH_PANE',
  'OPEN_PROMPT',
  'CLOSE_PROMPT',
  'SET_VISIBLE_FILTER',
  'MARK',
  'SEARCH',
  'FIND'
];

for (let i = 0; i < actions.length; i++) {
  let action = actions[i];
  module.exports[action] = action;
}

import { CALL_RPC } from './middleware/rpc';

const server = '127.0.0.1:50051';

export function gotoDir(dir, target, pane) {
  const action = {
    type: 'GOTO_DIR',
    [CALL_RPC]: {
      server,
      method: 'readDir',
      params: {
        base_dir: dir,
        target: target
      }
    }
  };
  if (pane) {
    action.pane = pane;
  }
  return action;
}

export function find(dir, name) {
  return {
    type: 'FIND',
    [CALL_RPC]: {
      server,
      method: 'find',
      params: {
        base_dir: dir,
        name
      }
    }
  };
}
