import APIConfig from './APIConfig.js';

// Load config
const config = await window.electronAPI.getConfig();
if (config.resultsToTrack) APIConfig.maxResponses = config.resultsToTrack;

// Create instances of APIConfig
const apis = config.apis.map(c => new APIConfig(c.name, c.url, c.expression));

async function checkApiHealth() {
	let overallHealthy = true;
	for (const api of apis) {
		const response = await fetch(api.url);
		await api.setLatestCheck(response);

		if (!api.apiHealthy) {
			overallHealthy = false;
		}

		const cardData = {
			name: api.name,
			status: api.status,
			lastCheckedAt: api.lastCheckedAt,
			results: api.healthyCount,
			url: api.url
		}
		insertCard(cardData);
	}

	// Set icon based on every api being healthy
	window.electronAPI.setMenubarIcon(overallHealthy);
}

const generateCard = ({ name, status, lastCheckedAt, results, url }) => {
	return `
            <div class="flex items-center gap-4 bg-[#F9FAFA] px-4 min-h-[72px] py-2 justify-between">
              <div class="flex items-center gap-4">
                <div
                  class="text-[#1C1D22] flex items-center justify-center rounded-lg bg-[#EEEFF2] shrink-0 size-12 status"
                  data-icon="CheckCircle"
                  data-size="24px"
                  data-weight="regular"
                >${status}
                </div>
                <div class="flex flex-col justify-center">
                  <p class="text-[#1C1D22] text-base font-medium leading-normal line-clamp-1 api">${name}</p>
                  <p class="text-[#3C3F4A] text-sm font-normal leading-normal line-clamp-2 url">${url}</p>
                </div>
              </div>
              <div class="shrink-0"><p class="text-[#1C1D22] text-base font-normal leading-normal lastCheckedAt">${lastCheckedAt}</p></div>
            </div>
`
}

const insertCard = ({ name, status, lastCheckedAt, results, url }) => {
	const container = document.getElementById('container-body');
	const existingCard = document.getElementById(`card-${name}`);

	if (existingCard) {
		existingCard.querySelector('.api').textContent = name;
		existingCard.querySelector('.status').textContent = status;
		existingCard.querySelector('.lastCheckedAt').textContent = lastCheckedAt;
		existingCard.querySelector('.url').textContent = url;
		return;
	}

	const card = document.createElement('div');
	card.id = `card-${name}`;
	card.innerHTML = generateCard({ name, status, lastCheckedAt, results, url });
	container.appendChild(card);
}

// Refresh every 60 seconds
setInterval(checkApiHealth, 10000);
checkApiHealth();

