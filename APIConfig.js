export default class APIConfig {
	static maxResponses = 10;
	constructor(name, url) {
		this.name = name;
		this.url = url;
		this.responses = []; // true means healthcheck successful
		this.apiHealthy = null;
		this.lastCheckedAt = null;
	}

	setLatestCheck(apiHealthy) {
		this.lastCheckedAt = new Date().toString();
		this.apiHealthy = apiHealthy;
		this.responses.push(apiHealthy);

		if (this.responses.length > APIConfig.maxResponses) this.responses = this.responses.slice(1);
	}

	get status() {
		return this.apiHealthy ? "🟢" : "🔴";
	}

	get healthyCount() {
		if (!this.responses.length) return 'N/A';
		let successCount = 0;
		let errorCount = 0;

		this.responses.forEach(value => {
			// Ignore undefined
			if (value === true) successCount++;
			else if (value === false) errorCount++;
		});

		return `${successCount}/${successCount + errorCount} (${successCount / (successCount + errorCount)})`;
	}
}
