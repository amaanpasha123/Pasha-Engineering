const cloudinary = require("cloudinary").v2;  // v2 is the latest Cloudinary API
require('dotenv').config();

// Configure Cloudinary using environment variables
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, // your cloud name
    api_key: process.env.CLOUDINARY_API_KEY,       // your API key
    api_secret: process.env.CLOUDINARY_API_SECRET  // your API secret
});

// Export cloudinary so you can use it in other files
module.exports = cloudinary;