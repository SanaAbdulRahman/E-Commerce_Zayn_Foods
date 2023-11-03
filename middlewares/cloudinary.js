const cloudinary = require("cloudinary").v2

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadImage = async (imagePath) => {

    const options = {
      use_filename: true,
      unique_filename: false,
      overwrite: true,
    };

    try {
      const result = await cloudinary.uploader.upload(imagePath, options);
      console.log(result);
      return result.url
    } catch (error) {
      throw error;
    }
};

module.exports = {uploadImage}