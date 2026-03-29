const express = require('express');
const router = express.Router();
const { 
  getInterviews, 
  scheduleInterview, 
  updateInterview, 
  deleteInterview 
} = require('../controllers/interviewController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/', protect, getInterviews);
router.post('/', protect, authorize('recruiter', 'admin'), scheduleInterview);
router.put('/:id', protect, authorize('recruiter', 'admin'), updateInterview);
router.delete('/:id', protect, authorize('admin'), deleteInterview);

module.exports = router;
