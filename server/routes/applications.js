const express = require('express');
const router = express.Router();
const { 
  getApplications,
  applyForJob,
  updateStatus, 
  deleteApplication,
  bulkStatusUpdate,
  bulkDelete
} = require('../controllers/applicationController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { upload } = require('../config/cloudinary');

router.get('/', protect, getApplications);
router.post('/', protect, authorize('candidate'), upload.single('resume'), applyForJob);
router.put('/bulk/status', protect, authorize('recruiter', 'admin'), bulkStatusUpdate);
router.delete('/bulk/delete', protect, authorize('admin'), bulkDelete);
router.put('/:id', protect, authorize('recruiter', 'admin'), updateStatus);
router.delete('/:id', protect, authorize('admin'), deleteApplication);

module.exports = router;
