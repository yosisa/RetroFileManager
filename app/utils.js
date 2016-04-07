'use strict';

export const otherPane = (pane) => pane === 'left' ? 'right' : 'left';

export function smartCaseRegExp(pattern) {
  const haveUpperCase = pattern !== pattern.toLowerCase();
  const flags = haveUpperCase ? '' : 'i';
  pattern = pattern.replace(/\s+/g, '.*');
  return new RegExp(pattern, flags);
}

export function humanBytes(size) {
  const units = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB'];
  for (var i = 0; i < units.length; i++) {
    if (size < 1024) {
      i++;
      break;
    }
    size /= 1024;
  }
  return `${round(size, 2)} ${units[i-1]}`;
}

export function round(v, places) {
  let x = Math.pow(10, places);
  return Math.round(v * x) / x;
}

export function modeToString(mode) {
  const flags = 'dalTLDpSugct';
  const perms = 'rwxrwxrwx';

  let s = '';
  for (let i = 0; i < flags.length; i++) {
    if ((mode & (1 << 32-1-i)) !== 0) {
      s += flags[i];
    }
  }
  if (s.length === 0) {
    s = '-';
  }
  for (let i = 0; i < perms.length; i++) {
    if ((mode & (1 << 9-1-i)) !== 0) {
      s += perms[i];
    } else {
      s += '-';
    }
  }
  return s;
}

export function addClass(el, name) {
  if (!el.className) {
    el.className = name;
  } else {
    el.className += ' ' + name;
  }
}

export function removeClass(el, name) {
  el.className = el.className.split(' ').filter(x => x !== name).join(' ');
}

export function forEachElement(selector, fn) {
  Array.prototype.forEach.call(document.querySelectorAll(selector), fn);
}

export function throttle(fn, wait) {
  let timer = null;
  let args = null;
  return function() {
    args = arguments;
    if (timer) {
      return;
    }
    timer = setTimeout(() => {
      timer = null;
      fn.apply(this, args);
    }, wait);
  };
}
