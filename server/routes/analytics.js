const express = require('express');
const router = express.Router();
const { getStats } = require('../controllers/analyticsController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/', protect, authorize('admin', 'recruiter'), getStats);

module.exports = router;
