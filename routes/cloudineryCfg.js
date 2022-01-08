const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

cloudinary.config({
    cloud_name: process.env.CLOUDINERY_CLOUD_NAME,
    api_key: process.env.CLOUDINERY_API_KEY,
    api_secret: process.env.CLOUDINERY_API_SECRET,
  });

const storage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: 'shemen_otef',
        allowedFormats: ['jpeg', 'png', 'jpg'],
        transformation: [{ width: 500, height: 500, crop: "limit" }]

    }

})

module.exports = { cloudinary, storage }