const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Use /tmp for Vercel, server/uploads for local development
const isVercel = process.env.VERCEL === '1' || !!process.env.VERCEL;
const uploadBaseDir = isVercel ? '/tmp/uploads' : 'server/uploads';

// Ensure upload directories exist
const subDirs = ['avatars', 'resumes'];
try {
  if (!fs.existsSync(uploadBaseDir)) {
    fs.mkdirSync(uploadBaseDir, { recursive: true });
  }
  subDirs.forEach(dir => {
    const fullPath = path.join(uploadBaseDir, dir);
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true });
    }
  });
} catch (err) {
  console.warn('Warning: Could not create upload directories:', err.message);
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const subDir = file.fieldname === 'avatar' ? 'avatars' : 'resumes';
    cb(null, path.join(uploadBaseDir, subDir));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

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
      cb(new Error('Only PDF resumes are supported as requested!'), false);
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
