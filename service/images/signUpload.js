const cloudinary = require('cloudinary').v2
require('./cloudineryCfg')
const apiSecret = cloudinary.config().api_secret

// Server-side function used to sign an Upload Widget upload.
const signuploadform  = () => {
	const timestamp = Math.round(new Date().getTime() / 1000)

	const signature = cloudinary.utils.api_sign_request(
		{
			timestamp: timestamp,
			source: 'uw',
			folder: 'shemen_otef'
		},
		apiSecret
	)

	return { timestamp, signature }
}

module.exports = {
	signuploadform 
}
