const { contextBridge, ipcRenderer } = require('electron');

// Expose main process functions to renderer process
contextBridge.exposeInMainWorld('electronAPI', {
	setMenubarIcon: (isHealthy) => ipcRenderer.send('set-menubar-icon', isHealthy),
})
