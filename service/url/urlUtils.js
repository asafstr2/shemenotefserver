function buildUrl(baseUrl, options = {}) {
	// Extract path and query params from options object
	const { path = '', queryParams = {} } = options

	// Construct query string from query params
	const queryString = Object.keys(queryParams)
		.map(
			key =>
				`${encodeURIComponent(key)}=${encodeURIComponent(queryParams[key])}`
		)
		.join('&')

	// Combine base URL, path, and query string to form complete URL
	const url = `${baseUrl}${path}${queryString ? `?${queryString}` : ''}`

	return url
}
const url = require('url')

function parseUrl(inputUrl) {
	const parsedUrl = new url.URL(inputUrl)

	const queryParams = {}
	for (let [key, value] of parsedUrl.searchParams) {
		queryParams[key] = value
	}

	return {
		protocol: parsedUrl.protocol.replace(':', ''),
		host: parsedUrl.hostname,
		port: parsedUrl.port,
		path: parsedUrl.pathname,
		queryParameters: queryParams
	}
}

module.exports = { buildUrl, parseUrl }
