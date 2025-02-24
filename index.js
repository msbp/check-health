const { ipcMain, app, Menu } = require('electron');
const { menubar } = require('menubar');
const path = require('path');
const os = require('os');
const fs = require('fs');

const configPath = path.join(os.homedir(), '.check-health/config.json');
const healthyIconPath = path.join(__dirname, 'assets', 'green20.png');
const unhealthyIconPath = path.join(__dirname, 'assets', 'red20.png');
const preloadScriptPath = path.join(__dirname, 'preload.js');

let config;

const handleSetMenubarIcon = (event, isHealthy) => {
	console.log('Called set-menubar-icon via ipc, isHealthy:', isHealthy);
	if (isHealthy) mb.tray.setImage(healthyIconPath);
	else mb.tray.setImage(unhealthyIconPath);
}

const handleGetConfig = (event) => {
	if (!config) config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
	return config;
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

	const contextMenu = Menu.buildFromTemplate([
		{
			label: 'Quit',
			click: () => app.quit()
		}
	]);
	mb.tray.on('right-click', () => {
		mb.tray.popUpContextMenu(contextMenu);
	});

	ipcMain.on('set-menubar-icon', handleSetMenubarIcon);
	ipcMain.handle('get-config', handleGetConfig);
});
