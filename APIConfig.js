export default class APIConfig {
	static maxResponses = 10;
	constructor(name, url, expression) {
		this.name = name;
		this.url = url;
		this.checkExpression = expression;
		this.responses = []; // true means healthcheck successful
		this.apiHealthy = null;
		this.lastCheckedAt = null;
	}

	async setLatestCheck(response) {
		if (this.responses.length >= APIConfig.maxResponses) this.responses = this.responses.slice(1);
		this.lastCheckedAt = new Date().toString();
		const isOk = response.ok;
		if (!isOk) {
			this.apiHealthy = false;
			this.responses.push(this.apiHealthy);
			return;
		}

		// If status is 2-hundred level and check body if required
		if (!this.checkExpression) {
			this.apiHealthy = true;
			this.responses.push(this.apiHealthy);
			return;
		}

		// If check body is required then check body against expression
		const parsedResponse = await response.json();
		const parsedValue = this.checkExpression?.key.split('.').reduce((acc, key) => acc?.[key], parsedResponse);
		if (this.checkExpression.value != parsedValue) {
			this.apiHealthy = false;
			this.responses.push(this.apiHealthy);
			return;
		}

		this.apiHealthy = true;
		this.responses.push(this.apiHealthy);
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
