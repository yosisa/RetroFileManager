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
import { leftVisibleItems, rightVisibleItems, otherPane, smartCaseRegExp } from './utils';

function paneFactory(visibleItems) {
  return (state, action) => {
    state = state || {
      path: '',
      items: [],
      filter: filter(undefined, action),
      cursor: 0,
      cursorHistory: {},
      cursorGen: 0,
      selection: {},
      diskUsage: {}
    };

    switch (action.type) {
    case TOGGLE_DOTFILES:
    case SET_VISIBLE_FILTER:
      return merge(state, {filter: filter(state.filter, action)});
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
        items: action.response.items,
        cursor: cursorHistory[action.response.path] || 0,
        cursorHistory,
        selection: {},
        diskUsage: action.response.disk_usage
      });
    case FIND:
      return Object.assign({}, state, {
        path: action.response.path,
        items: action.response.items,
        cursor: 0,
        selection: {}
      });
    case REDRAW_CURSOR:
      return Object.assign({}, state, {
        cursorGen: state.cursorGen+1
      });
    case MOVE_CURSOR_DOWN:
      var next = state.cursor + 1;
      var items = visibleItems(state);
      var cursor = next < items.length ? next : 0;
      return Object.assign({}, state, {cursor});
    case MOVE_CURSOR_UP:
      var next = state.cursor - 1;
      var items = visibleItems(state);
      var cursor = next >= 0 ? next : items.length - 1;
      return Object.assign({}, state, {cursor});
    case SELECT:
      var selection = Object.assign({}, state.selection);
      const item = visibleItems(state)[state.cursor];
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
      visibleItems(state).forEach(item => {
        if (item.name.match(re) !== null) {
          selection[item.name] = item;
        }
      });
      return Object.assign({}, state, {selection});
    case CLEAR_SELECTION:
      return Object.assign({}, state, {selection: {}});
    case TOGGLE_SELECTION:
      var selection = Object.assign({}, state.selection);
      toggleSelection(selection, visibleItems(state));
      return Object.assign({}, state, {selection});
    case TOGGLE_FILE_SELECTION:
      var selection = Object.assign({}, state.selection);
      toggleSelection(selection, visibleItems(state).filter(f => !f.is_dir));
      return Object.assign({}, state, {selection});
    case SEARCH:
      try {
        var re = smartCaseRegExp(action.pattern);
      } catch(e) {
        return state;
      }
      var items = visibleItems(state);
      for (let i = 0; i < items.length; i++) {
        let x = (i + state.cursor) % items.length;
        if (items[x].name.match(re) !== null) {
          return Object.assign({}, state, {cursor: x});
        }
      }
      return state;
    default:
      return state;
    }
  };
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

function toggleSelection(selection, items) {
  items.forEach(item => {
    if (selection.hasOwnProperty(item.name)) {
      delete selection[item.name];
    } else {
      selection[item.name] = item;
    }
  });
}

const leftPane = paneFactory(leftVisibleItems);
const rightPane = paneFactory(rightVisibleItems);

export default function appReducer(state, action) {
  state = state || {
    focusedPane: 'left',
    left: leftPane(null, action),
    right: rightPane(null, action),
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
    return Object.assign({}, state, {left: leftPane(state.left, action)});
  case 'right':
    return Object.assign({}, state, {right: rightPane(state.right, action)});
  default:
    return state;
  }
}

function merge(state, data) {
  return Object.assign({}, state, data);
}
