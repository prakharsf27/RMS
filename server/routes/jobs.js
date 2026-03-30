const express = require('express');
const router = express.Router();
const { 
  getJobs, 
  createJob, 
  updateJob, 
  deleteJob,
  getRecommendedJobs
} = require('../controllers/jobController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/', getJobs);
router.post('/', protect, authorize('recruiter', 'admin'), createJob);
router.put('/:id', protect, authorize('recruiter', 'admin'), updateJob);
router.delete('/:id', protect, authorize('recruiter', 'admin'), deleteJob);
router.get('/recommended', protect, authorize('candidate'), getRecommendedJobs);

module.exports = router;
