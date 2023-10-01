const multer = require("multer")
const cloudinary = require("cloudinary").v2
const { CloudinaryStorage } = require("multer-storage-cloudinary")
const { config } = require("../core/config")

cloudinary.config({
  cloud_name: config.CLOUDINARY_NAME,
  api_key: config.CLOUDINARY_API_KEY,
  api_secret: config.CLOUDINARY_API_SECRET,
})

const width = 450
const height = 330

const uploadManager = (destination) => {
  return multer({
    storage: new CloudinaryStorage({
      cloudinary: cloudinary,
      params: {
        folder: `BlesClient/${destination}`,
        transformation: [{ width: width, height: height }],
      },
    }),
  })
}

module.exports = { uploadManager }
