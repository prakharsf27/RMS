const express = require('express');
const router = express.Router();
const { 
  parseResume, 
  analyzeATSCompatibility, 
  enhanceResumeBullet, 
  tailorResume 
} = require('../controllers/resumeController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.use(protect);

router.post('/parse', upload.single('resume'), parseResume);
router.post('/analyze-ats', analyzeATSCompatibility);
router.post('/enhance-bullet', enhanceResumeBullet);
router.post('/tailor', tailorResume);

module.exports = router;
