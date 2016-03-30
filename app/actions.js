'use strict';

const actions = [
  'ITEMS_UPDATED',
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
  'MARK'
];

for (let i = 0; i < actions.length; i++) {
  let action = actions[i];
  module.exports[action] = action;
}

const rpc = require('remote').require('./lib/rpc');

export function gotoDirectory(store, dir, target, pane) {
  rpc.readDir(dir, target).then(({path, items, disk_usage}) => {
    let action = {
      type: module.exports['ITEMS_UPDATED'],
      path,
      items,
      diskUsage: disk_usage
    };
    if (pane) {
      action.pane = pane;
    }
    store.dispatch(action);
  });
}
