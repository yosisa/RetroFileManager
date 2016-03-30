'use strict';

import { getVisibleItemsOnFocusedPane, otherPane, throttle } from './utils';
import {
  MOVE_CURSOR_DOWN,
  MOVE_CURSOR_UP,
  SELECT,
  MARK,
  TOGGLE_DOTFILES,
  SWITCH_PANE,
  CLEAR_SELECTION,
  TOGGLE_SELECTION,
  TOGGLE_FILE_SELECTION,
  OPEN_PROMPT,
  CLOSE_PROMPT,
  SET_VISIBLE_FILTER,
  SEARCH,
  gotoDir
} from './actions';

const keymap = {
  normal: {
    'j': store => {
      store.dispatch({type: MOVE_CURSOR_DOWN});
    },
    'k': store => {
      store.dispatch({type: MOVE_CURSOR_UP});
    },
    'o': store => {
      const state = store.getState();
      const pane = otherPane(state.focusedPane);
      store.dispatch(gotoDir(state[pane].path));
    },
    'O': store => {
      const state = store.getState();
      const pane = otherPane(state.focusedPane);
      store.dispatch(gotoDir(state[state.focusedPane].path, '', pane));
    },
    'space': store => {
      store.dispatch({type: SELECT});
      store.dispatch({type: MOVE_CURSOR_DOWN});
    },
    'S-space': store => {
      store.dispatch({type: SELECT});
      store.dispatch({type: MOVE_CURSOR_UP});
    },
    '.': store => {
      store.dispatch({type: TOGGLE_DOTFILES});
    },
    'enter': store => {
      let state = store.getState();
      const items = getVisibleItemsOnFocusedPane(state);
      state = state[state.focusedPane];
      const item = items[state.cursor];
      store.dispatch(gotoDir(state.path, item.name));
    },
    '^': store => {
      let state = store.getState();
      state = state[state.focusedPane];
      store.dispatch(gotoDir(state.path, '..'));
    },
    '~': store => {
      store.dispatch(gotoDir('~'));
    },
    'tab': store => {
      store.dispatch({type: SWITCH_PANE});
    },
    'U': store => {
      store.dispatch({type: CLEAR_SELECTION});
    },
    'a': store => {
      store.dispatch({type: TOGGLE_FILE_SELECTION});
    },
    'A': store => {
      store.dispatch({type: TOGGLE_SELECTION});
    },
    'm': store => {
      store.dispatch({type: OPEN_PROMPT, title: 'Mark', handler: 'mark'});
    },
    'f': store => {
      const state = store.getState();
      const pattern = state[state.focusedPane].filter.pattern || '';
      store.dispatch({type: OPEN_PROMPT, title: 'Filter', input: pattern, handler: 'filter'});
    },
    '/': store => {
      store.dispatch({type: OPEN_PROMPT, title: 'Search', handler: 'search', onchange: true});
    }
  },
  prompt: {
    'esc': store => {
      store.dispatch({type: CLOSE_PROMPT});
    }
  }
};

export const promptHandlers = {
  'mark': (dispatch, input) => {
    dispatch({type: MARK, pattern: input});
  },
  'filter': (dispatch, input) => {
    dispatch({type: SET_VISIBLE_FILTER, pattern: input});
  },
  'search': throttle((dispatch, input) => {
    dispatch({type: SEARCH, pattern: input});
  }, 50)
};

export function init(store) {
  document.addEventListener('keypress', (ev) => {
    const map = selectKeymap(store);
    const fn = map[kbd(ev)];
    if (fn) {
      ev.preventDefault();
      ev.stopPropagation();
      fn(store);
    }
  });

  document.addEventListener('keydown', (ev) => {
    switch (ev.keyCode) {
    case 8:
    case 9:
    case 27:
      const map = selectKeymap(store);
      const fn = map[kbd(ev)];
      if (fn) {
        ev.preventDefault();
        ev.stopPropagation();
        fn(store);
      }
    }
  });
}

function selectKeymap(store) {
  if (store.getState().prompt.show) {
    return keymap.prompt;
  }
  return keymap.normal;
}

function kbd(ev) {
  const prefix = ev.shiftKey ? 'S-' : '';
  switch (ev.keyCode) {
  case 8:
    return `${prefix}bs`;
  case 9:
    return `${prefix}tab`;
  case 13:
    return `${prefix}enter`;
  case 27:
    return `${prefix}esc`;
  case 32:
    return `${prefix}space`;
  default:
    return String.fromCharCode(ev.keyCode);
  }
}
