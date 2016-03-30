'use strict';

const electron = require('electron');
const path = require('path');
const fs = require('fs');

const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const initPath = path.join(app.getPath('userData'), 'init.json');
const ipc = electron.ipcMain;
const storage = require('./lib/storage');

var mainWindow = null;
var appState = {};

app.on('window-all-closed', function() {
  if (process.platform != 'darwin') {
    app.quit();
  }
});

ipc.on('state-changed', (ev, state) => {
  appState = state;
});

app.on('ready', function() {
  const bounds = storage.get('lastWindowState') || {width: 1200, height: 600};
  mainWindow = new BrowserWindow(bounds);
  mainWindow.loadURL('file://'+__dirname+'/index.html');
  mainWindow.on('close', function() {
    storage.set({
      lastWindowState: mainWindow.getBounds(),
      appState
    });
  });
  mainWindow.on('closed', function() {
    mainWindow = null;
  });
  if (process.env.DEBUG) {
    mainWindow.webContents.openDevTools();
  }
});
