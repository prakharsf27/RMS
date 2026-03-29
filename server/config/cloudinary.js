const multer = require('multer');

let upload;
let cloudinary = null;

const hasCloudinaryConfig = !!(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
);

if (hasCloudinaryConfig) {
  // Use Cloudinary storage when credentials are available
  const cloudinaryLib = require('cloudinary').v2;
  const { CloudinaryStorage } = require('multer-storage-cloudinary');

  cloudinaryLib.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });

  cloudinary = cloudinaryLib;

  const storage = new CloudinaryStorage({
    cloudinary: cloudinaryLib,
    params: {
      folder: 'talentflow_resumes',
      resource_type: 'auto',
      allowed_formats: ['pdf', 'doc', 'docx']
    }
  });

  upload = multer({ storage });
  console.log('✅ Cloudinary storage configured for file uploads.');
} else {
  // Fallback: memory storage — file won't be persisted but request won't hang
  upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });
  console.log('⚠️  Cloudinary not configured. Using memory storage fallback (files will not be saved).');
}

module.exports = { upload, cloudinary };
