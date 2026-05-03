const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Try to load Cloudinary config
const hasCloudinaryConfig = !!(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
);

let storage;

if (hasCloudinaryConfig) {
  const { CloudinaryStorage } = require('multer-storage-cloudinary');
  const cloudinary = require('cloudinary').v2;

  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });

  storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: 'talentflow_assets',
      resource_type: 'auto',
      allowed_formats: ['jpg', 'jpeg', 'png', 'pdf']
    }
  });
  console.log('✅ Auth upload middleware using Cloudinary storage.');
} else {
    // Local storage fallback for dev
    const isVercel = process.env.VERCEL === '1' || !!process.env.VERCEL;
    const uploadBaseDir = isVercel ? '/tmp/uploads' : 'server/uploads';

    try {
      if (!fs.existsSync(uploadBaseDir)) {
        fs.mkdirSync(uploadBaseDir, { recursive: true });
      }
      ['avatars', 'resumes'].forEach(dir => {
        const fullPath = path.join(uploadBaseDir, dir);
        if (!fs.existsSync(fullPath)) {
          fs.mkdirSync(fullPath, { recursive: true });
        }
      });
    } catch (err) {
      console.warn('Warning: Could not create upload directories:', err.message);
    }

    storage = multer.diskStorage({
      destination: function (req, file, cb) {
        const subDir = file.fieldname === 'avatar' ? 'avatars' : 'resumes';
        cb(null, path.join(uploadBaseDir, subDir));
      },
      filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
      }
    });
    console.log('⚠️  Auth upload middleware using Local disk storage.');
}

const fileFilter = (req, file, cb) => {
  if (file.fieldname === 'avatar') {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only images are allowed for profile photos!'), false);
    }
  } else if (file.fieldname === 'resume') {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF resumes are supported!'), false);
    }
  } else {
    cb(null, false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

module.exports = upload;
