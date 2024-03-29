const cloudinary = require('cloudinary').v2

// Configure your cloud name, API key and API secret:

const myconfig = cloudinary.config({
	cloud_name: process.env.CLOUDINERY_CLOUD_NAME,
	api_key: process.env.CLOUDINERY_API_KEY,
	api_secret: process.env.CLOUDINERY_API_SECRET,
	secure: true
})

exports.myconfig = myconfig
