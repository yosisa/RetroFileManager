'use strict';

import { combineReducers } from 'redux';
import {
  GOTO_DIR,
  TOGGLE_DOTFILES,
  REDRAW_CURSOR,
  MOVE_CURSOR_DOWN,
  MOVE_CURSOR_UP,
  SELECT,
  CLEAR_SELECTION,
  TOGGLE_SELECTION,
  TOGGLE_FILE_SELECTION,
  SWITCH_PANE,
  OPEN_PROMPT,
  CLOSE_PROMPT,
  SET_VISIBLE_FILTER,
  MARK,
  SEARCH,
  FIND
} from './actions';
import { otherPane, smartCaseRegExp } from './utils';

function pane(state, action) {
  state = state || {
    path: '',
    items: [],
    allItems: [],
    filter: filter(undefined, action),
    cursor: 0,
    cursorHistory: {},
    cursorGen: 0,
    selection: {},
    diskUsage: {}
  };

  switch (action.type) {
  case TOGGLE_DOTFILES:
    return merge(state, {filter: filter(state.filter, action)});
  case SET_VISIBLE_FILTER:
    var newFilter = filter(state.filter, action);
    return merge(state, {
      items: visibleItems(state.allItems, newFilter),
      filter: newFilter
    });
  }

  switch (action.type) {
  case GOTO_DIR:
    var { cursorHistory } = state;
    if (state.path) {
      cursorHistory = Object.assign({}, cursorHistory, {
        [state.path]: state.cursor
      });
    }
    return Object.assign({}, state, {
      path: action.response.path,
      items: visibleItems(action.response.items, state.filter),
      allItems: action.response.items,
      cursor: cursorHistory[action.response.path] || 0,
      cursorHistory,
      selection: {},
      diskUsage: action.response.disk_usage
    });
  case FIND:
    return Object.assign({}, state, {
      path: action.response.path,
      items: visibleItems(action.response.items, state.filter),
      allItems: action.response.items,
      cursor: 0,
      selection: {}
    });
  case REDRAW_CURSOR:
    return Object.assign({}, state, {
      cursorGen: state.cursorGen+1
    });
  case MOVE_CURSOR_DOWN:
    var next = state.cursor + 1;
    var cursor = next < state.items.length ? next : 0;
    return Object.assign({}, state, {cursor});
  case MOVE_CURSOR_UP:
    var next = state.cursor - 1;
    var cursor = next >= 0 ? next : state.items.length - 1;
    return Object.assign({}, state, {cursor});
  case SELECT:
    var selection = Object.assign({}, state.selection);
    const item = state.items[state.cursor];
    if (state.selection.hasOwnProperty(item.name)) {
      delete selection[item.name];
    } else {
      selection[item.name] = item;
    }
    return Object.assign({}, state, {selection});
  case MARK:
    try {
      var re = smartCaseRegExp(action.pattern);
    } catch(e) {
      return state;
    }
    var selection = Object.assign({}, state.selection);
    state.items.forEach(item => {
      if (item.name.match(re) !== null) {
        selection[item.name] = item;
      }
    });
    return Object.assign({}, state, {selection});
  case CLEAR_SELECTION:
    return Object.assign({}, state, {selection: {}});
  case TOGGLE_SELECTION:
    var selection = Object.assign({}, state.selection);
    toggleSelection(selection, state.items);
    return Object.assign({}, state, {selection});
  case TOGGLE_FILE_SELECTION:
    var selection = Object.assign({}, state.selection);
    toggleSelection(selection, state.items.filter(f => !f.is_dir));
    return Object.assign({}, state, {selection});
  case SEARCH:
    try {
      var re = smartCaseRegExp(action.pattern);
    } catch(e) {
      return state;
    }
    for (let i = 0; i < state.items.length; i++) {
      let x = (i + state.cursor) % state.items.length;
      if (state.items[x].name.match(re) !== null) {
        return Object.assign({}, state, {cursor: x});
      }
    }
    return state;
  default:
    return state;
  }
}

function filter(state = {
  showDotFiles: false,
  pattern: ''
}, action) {
  switch (action.type) {
  case TOGGLE_DOTFILES:
    return merge(state, {showDotFiles: !state.showDotFiles});
  case SET_VISIBLE_FILTER:
    return merge(state, {pattern: action.pattern});
  default:
    return state;
  }
}

function visibleItems(items, filter) {
  var { showDotFiles, pattern } = filter;
  if (pattern) {
    pattern = smartCaseRegExp(pattern);
  }
  return items.filter(item => {
    if (!showDotFiles && item.name[0] === '.' ||
        pattern && !item.is_dir && item.name.match(pattern) === null) {
      return false;
    }
    return true;
  });
}

function toggleSelection(selection, items) {
  items.forEach(item => {
    if (selection.hasOwnProperty(item.name)) {
      delete selection[item.name];
    } else {
      selection[item.name] = item;
    }
  });
}

export default function appReducer(state, action) {
  state = state || {
    focusedPane: 'left',
    left: pane(null, action),
    right: pane(null, action),
    prompt: {
      show: false
    }
  };

  switch (action.type) {
  case SWITCH_PANE:
    return Object.assign({}, state, {focusedPane: otherPane(state.focusedPane)});
  case OPEN_PROMPT:
    return Object.assign({}, state, {
      prompt: {
        show: true,
        title: action.title,
        input: action.input || '',
        handler: action.handler,
        onchange: Boolean(action.onchange),
        params: action.params
      }
    });
  case CLOSE_PROMPT:
    return Object.assign({}, state, {
      prompt: {
        show: false
      }
    });
  }

  switch (action.pane || state.focusedPane) {
  case 'left':
    return Object.assign({}, state, {left: pane(state.left, action)});
  case 'right':
    return Object.assign({}, state, {right: pane(state.right, action)});
  default:
    return state;
  }
}

function merge(state, data) {
  return Object.assign({}, state, data);
}
