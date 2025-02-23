import APIConfig from './APIConfig.js';
// const config = [
// 	{ name: "Example API", url: "https://example.org/" },
// 	{ name: "Another API", url: "https://httpbin.org/get" },
// ];
// Load and parse config
let config;
{
	const response = await fetch('./config.json');
	const json = await response.json();
	config = json;
}
// const config = fetch('./config.json').then(response => response.json());
console.log('created config:', config);

const apis = config.apis.map(c => new APIConfig(c.name, c.url));
console.log('created apis:', apis);

async function checkApiHealth() {
	let overallHealthy = true;
	for (const api of apis) {
		const response = await fetch(api.url);
		const isHealthy = response.ok;
		api.setLatestCheck(isHealthy);

		if (!isHealthy) overallHealthy = false;

		const row = {
			name: api.name,
			status: api.status,
			lastCheckedAt: api.lastCheckedAt,
			results: api.healthyCount,
			url: api.url
		}
		insertRow(row);
	}

	// Set icon based on every api being healthy
	window.electronAPI.setMenubarIcon(overallHealthy);
}

function insertRow({ name, status, lastCheckedAt, results, url }) {
	const tableBody = document.getElementById('tableBody');
	const templateRow = document.getElementById('templateRow');

	let row;

	// Attempt to find the row by the url
	const rowExists = Array.from(tableBody.querySelectorAll('.url'))
		.find(cell => cell.textContent === url);
	if (rowExists) {
		row = rowExists.closest('tr');
	} else {
		row = templateRow.cloneNode(true);
		row.removeAttribute('id');
		row.classList.remove('hidden');

	}

	row.querySelector('.api').textContent = name;
	row.querySelector('.status').textContent = status;
	row.querySelector('.lastCheckedAt').textContent = lastCheckedAt;
	row.querySelector('.results').textContent = results;
	row.querySelector('.url').textContent = url;

	tableBody.appendChild(row);
}

// Refresh every 60 seconds
setInterval(checkApiHealth, 10000);
checkApiHealth();

