const express = require('express');
const router = express.Router();
const { 
  getJobs, 
  createJob, 
  updateJob, 
  deleteJob 
} = require('../controllers/jobController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/', getJobs);
router.post('/', protect, authorize('recruiter', 'admin'), createJob);
router.put('/:id', protect, authorize('recruiter', 'admin'), updateJob);
router.delete('/:id', protect, authorize('recruiter', 'admin'), deleteJob);

module.exports = router;
