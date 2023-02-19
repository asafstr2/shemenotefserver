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

module.exports = buildUrl
