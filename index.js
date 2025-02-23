const { ipcMain } = require('electron');
const { menubar } = require('menubar');
const path = require('path');


const healthyIconPath = path.join(__dirname, 'assets', 'green20.png');
const unhealthyIconPath = path.join(__dirname, 'assets', 'red20.png');
const preloadScriptPath = path.join(__dirname, 'preload.js');

const handleSetMenubarIcon = (event, isHealthy) => {
	console.log('Called set-menubar-icon via ipc, isHealthy:', isHealthy);
	if (isHealthy) mb.tray.setImage(healthyIconPath);
	else mb.tray.setImage(unhealthyIconPath);
}

const mb = menubar({
	browserWindow: {
		webPreferences: {
			preload: preloadScriptPath
		},
		width: 850
	},
	tooltip: 'check-health'
});

mb.on('ready', () => {
	console.log('app is ready');

	ipcMain.on('set-menubar-icon', handleSetMenubarIcon);
	// your app code here
});
