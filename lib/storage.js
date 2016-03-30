'use strict';

const electron = require('electron');
const path = require('path');
const fs = require('fs');
const filePath = path.join(electron.app.getPath('userData'), 'data.json');

function get(key) {
  const data = load();
  return data[key];
}

function set(key, value) {
  let data = load();
  if (typeof key === 'object') {
    Object.keys(key).forEach((k) => {
      data[k] = key[k];
    });
  } else {
    data[key] = value;
  }
  save(data);
}

function load() {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  } catch(e) {
    return {};
  }
}

function save(data) {
  fs.writeFileSync(filePath, JSON.stringify(data));
}

module.exports = {
  get,
  set
};
