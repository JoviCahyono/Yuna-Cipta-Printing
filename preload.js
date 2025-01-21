const { contextBridge, ipcRenderer } = require('electron');

// Menyediakan fungsi untuk renderer process
contextBridge.exposeInMainWorld('electron', {
  getData: () => ipcRenderer.invoke('get-data')
});