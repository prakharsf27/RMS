const express = require('express');
const router = express.Router();
const { getStats, getGlobalStats } = require('../controllers/analyticsController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/', protect, authorize('admin', 'recruiter', 'candidate'), getStats);
router.get('/global', getGlobalStats);

module.exports = router;
